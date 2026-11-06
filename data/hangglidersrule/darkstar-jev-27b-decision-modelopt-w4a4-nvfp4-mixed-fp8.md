# HangGlidersRule/Darkstar-JEV-27B-Decision-ModelOpt-W4A4-NVFP4-Mixed-FP8

## Resumen

Darkstar-JEV-27B-Decision-ModelOpt-W4A4-NVFP4-Mixed-FP8 es un checkpoint cuantizado del modelo de decisión JEV-27B (System 1), construido por el usuario HangGlidersRule a partir del adaptador LoRA de `autotrust/JEV-27B` fusionado en `Qwen/Qwen3.8-27B` y posteriormente cuantizado con NVIDIA ModelOpt. Su propósito no es la generación de texto libre, sino la emisión de decisiones tipadas (respuestas sí/no, elección entre hasta 16 opciones nativas y puntuaciones de 0 a 5) como probabilidades calibradas obtenidas en un único forward pass con lectura de un solo token.

El modelo resuelve un problema concreto: desplegar un clasificador de decisiones de alta calidad con la latencia y el coste de memoria de una cuantización agresiva, sin perder fidelidad respecto a la referencia en BF16. Para ello combina NVFP4 W4A4 en las capas MLP del transformer de lenguaje, FP8 W8A8 en las proyecciones de atención y atención lineal, y mantiene en BF16 las partes sensibles (embeddings, normas, `lm_head`, torre de visión y cabeza MTP).

Es relevante ahora porque demuestra que una receta mixta de cuantización (la misma que usa NVIDIA para su propio Qwen3.8-27B-NVFP4) puede aplicarse a un modelo con un cabezal de decisión fusionado, superando al baseline desplegado en throughput (69,5 frente a 50,1 filas/s) y en KL frente al profesor, con una pérdida de top-1 inferior a 0,5 puntos. El checkpoint tiene 18.800.348.400 parámetros reales en safetensors y ocupa 23,8 GB en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.8 (atención completa + atención lineal Gated DeltaNet + MLP), con torre de visión y cabeza MTP; LoRA de decisión fusionado en `lm_head` |
| Parametros totales | 18.800.348.400 |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos y activaciones FP4 E2M1, grupo 16, escalas de bloque FP8 E4M3) en 192 lineales MLP; FP8 W8A8 en 64 proyecciones de self-attention y 144 de atención lineal; BF16 en `lm_head`, embeddings, normas, `in_proj_a`/`in_proj_b`, `conv1d`, torre de visión y MTP; KV cache en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización nativa NVIDIA ModelOpt, orientada a vLLM) |

## Arquitectura y entrenamiento

El checkpoint parte de `Qwen/Qwen3.8-27B` en la revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`, sobre el que se fusiona el adaptador LoRA `adapter_vllm` de `autotrust/JEV-27B` (revisión `14b425269ed24452e0a5ad5a8f3e51d139647a88`). El adaptador tiene rango 32 y alpha 64, con 401 pares aplicados sobre atención, atención lineal (Gated DeltaNet), MLP y `lm_head`; el par de `lm_head` constituye el cabezal de decisión. La fusión se calcula como `W + 2·(B·A)` en FP32 con un único redondeo a BF16, y se verificó que coincide exactamente con `merge_and_unload` de PEFT (diferencia absoluta máxima 0,0 sobre 26 tensores fusionados). La torre de visión y la cabeza MTP se copian sin cambios del modelo base.

La cuantización se realizó con ModelOpt `0.48.0rc1` (commit `ff2450c15eb5f1697ec0471704d5421d54fce4f4`) usando la receta de NVIDIA `nvfp4_w4a4_mlp_fp8_attn_local_hessian`. Las escalas estáticas de pesos provienen de Local-Hessian con barrido de escalas FP8; las activaciones son dinámicas. La calibración usó 512 muestras por capas con semilla 1234: 256 prompts de decisión de `SargeDev/jev-distill-corpus-v3` (split de calibración, revisión `75111a13a8455032f0435050bfc7e0c9026ecfe8`) renderizados como los construye el shim de serving, y 256 muestras de chat de `nvidia/Nemotron-SFT-Instruction-Following-Chat-v2` (revisión `1a9454ed054b8544503ab8d8c0a519d141a44c5b`). La única desviación respecto a la receta de NVIDIA es mantener `lm_head` en BF16, ya que tras la fusión aloja el cabezal de decisión.

## Capacidades

- Emisión de decisiones tipadas: `noul` (sí/no), `choice` (hasta 16 opciones nativas) y `score` (0–5), devueltas como probabilidades calibradas en un único forward pass con lectura de un solo token.
- Clasificación de texto orientada a decisión (pipeline `text-classification`), no generación libre.
- Razonamiento de "System 1": una pasada, sin modo thinking (el readout de evaluación se ejecuta con thinking desactivado).
- Capacidad multimodal heredada del modelo base: la torre de visión se conserva intacta, aunque no se documenta su uso en el flujo de decisión.
- Soporte de cabezal MTP (multi-token prediction) heredado del base, copiado sin cuantizar.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el diseño es explícitamente de un solo paso.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento y triaje de peticiones: dado un prompt entrante, el modelo puede emitir una decisión `choice` entre hasta 16 rutas nativas con probabilidad calibrada, lo que permite umbrales de confianza y derivación a revisión humana cuando la probabilidad cae por debajo de un corte.
- Moderación y filtrado binario: la decisión `noul` con AUROC de 0,9954 sobre el conjunto de evaluación lo hace adecuado para clasificadores sí/no de alta precisión donde se necesita una puntuación probabilística, no una etiqueta dura.
- Puntuación de calidad o relevancia: la salida `score` de 0 a 5 con MAE de 0,104 permite ordenar candidatos (respuestas, documentos, anuncios) en pipelines de ranking sin entrenar un regresor separado.
- Clasificación de alto volumen con requisitos de latencia: a 69,5 filas/s con 16 peticiones concurrentes y latencias p50 de 80 ms en prompts cortos (~314 tokens), encaja en servicios de decisión en línea donde un modelo BF16 sería demasiado lento o caro.
- Evaluación automática de salidas de otros modelos: al devolver distribuciones calibradas comparables a las del profesor, puede usarse como juez ligero en pipelines de evaluación continua, con la ventaja de que las decisiones son reproducibles y medibles frente a la referencia BF16.
- Despliegue en infraestructura Blackwell con vLLM: el formato NVFP4/FP8 está pensado para GPUs SM120 (RTX PRO 6000 Blackwell) y vLLM `v0.32.0`, lo que permite servir el modelo con el mismo stack que el baseline de NVIDIA sin reescritura del adaptador.
- Selección de acciones en agentes acotados: cuando el espacio de acciones está predefinido y es pequeño (hasta 16), el modelo puede actuar como política de decisión de un paso dentro de un bucle de agente controlado externamente.

## Benchmarks y rendimiento

Evaluación sobre las 29.955 filas de `test_set_30k` de `SargeDev/jev-distill-corpus-v3`, en RTX PRO 6000 Blackwell (SM120) con vLLM `v0.32.0` y el readout `serve_decide.py` (thinking off, una pasada). Intervalos de confianza por bootstrap emparejado (2.000 remuestreos, semilla 1234). Top-1 calculado sobre las 27.324 filas con un único argmax en la distribución del profesor.

| Metrica | Este checkpoint | Baseline desplegado (nvidia/Qwen3.8-27B-NVFP4 + LoRA) | Referencia BF16 (Qwen3.8-27B + LoRA) |
|---|---|---|---|
| KL frente al profesor | 0,0203 | 0,0207 | 0,0186 |
| Delta de KL vs baseline | −0,00039 (IC 95% −0,00054 a −0,00024) | — | — |
| Top-1 vs profesor | 0,9219 | 0,9200 | 0,9270 |
| Deficit de top-1 vs baseline | −0,19 pt (IC 95% −0,41 a +0,02) | — | — |
| Top-1 en `choice` | 0,9050 | no disponible | no disponible |
| AUROC en `noul` | 0,9954 | no disponible | no disponible |
| MAE en `score` | 0,104 | no disponible | no disponible |
| Acuerdo con referencia BF16 | 0,940 | 0,943 | — |
| Throughput (16 peticiones concurrentes) | 69,5 filas/s | 50,1 filas/s | 45,3 filas/s |
| Latencia p50/p95, c=1, prompt corto (~314 tok) | 80 / 89 ms | 107 / 126 ms | no disponible |
| Latencia p50/p95, c=1, prompt largo (~3.790 tok) | 270 / 330 ms | 365 / 441 ms | no disponible |

Se compararon dos builds: el build A (este checkpoint, NVFP4 en MLP y FP8 en atención) obtuvo KL 0,0203 y 69,5 filas/s; el build B (NVFP4 W4A4 en todas las lineales de MLP, atención y atención lineal) alcanzó 98,5 filas/s pero con KL 0,0220, peor que el baseline desplegado, y fue descartado. El ruido entre dos servicios de la referencia BF16 se midió en 99,0% de acuerdo y KL medio de 0,00003.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 23,8 GB en safetensors; con overhead de runtime y KV cache en BF16 se debe prever margen por encima de esa cifra, aunque el dato exacto de VRAM en serving no está disponible en la información proporcionada.
- GPU recomendadas: RTX PRO 6000 Blackwell (SM120) es la plataforma validada; el formato NVFP4 requiere soporte de FP4 nativo, por lo que GPUs anteriores (A100, H100 en FP8, RTX 4090 en Ada) no ejecutan esta cuantización tal cual.
- Cabe en consumer GPU: no disponible; el tamaño de pesos (23,8 GB) descarta GPUs de 24 GB o menos en la práctica, y la falta de soporte NVFP4 en Ada/Ampere impide su uso directo.
- Opciones de despliegue: vLLM `v0.32.0` es el runtime validado, con el shim `serve_decide.py` para el readout System 1. No se documenta soporte para llama.cpp, Ollama ni TGI, y el formato ModelOpt NVFP4/FP8 no es compatible con ellos sin conversión.
- Latencia y throughput: 69,5 filas/s con 16 peticiones concurrentes; p50/p95 de 80/89 ms en prompts cortos (~314 tokens) y 270/330 ms en prompts largos (~3.790 tokens) con concurrencia 1. Los prompts largos de la evaluación son concatenaciones sembradas, ya que el conjunto original no los contiene.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Darkstar-JEV-27B-Decision (este) | 18,8 B | no disponible | NVFP4 W4A4 + FP8 W8A8 + BF16 mixto | Apache 2.0 | 69,5 filas/s; KL 0,0203; top-1 0,9219 |
| nvidia/Qwen3.8-27B-NVFP4 + LoRA JEV | no disponible | no disponible | NVFP4 (receta NVIDIA) | Apache 2.0 (base) | Baseline desplegado: 50,1 filas/s; KL 0,0207; top-1 0,9200 |
| Qwen/Qwen3.8-27B BF16 + LoRA JEV | no disponible | no disponible | BF16 | Apache 2.0 | Referencia: 45,3 filas/s; KL 0,0186; top-1 0,9270 |

La comparativa se limita a las tres configuraciones medidas en la model card; no se proporcionan datos de otros modelos de decisión comparables.

## Limitaciones y advertencias

- Solo decisiones: la fusión del LoRA de `lm_head` en el backbone altera la generación de texto plano (System 2). La calidad de generación de este checkpoint no se ha medido ni se reclama.
- Dependencia de hardware: el formato NVFP4 W4A4 requiere GPUs con soporte FP4 (Blackwell, SM120) y vLLM `v0.32.0`; no es portable a llama.cpp, Ollama ni a GPUs Ampere/Ada sin reconversión.
- Pérdida de fidelidad medible: el top-1 cae 0,19 puntos frente al baseline desplegado (cota superior del IC al 0,5 pt) y el acuerdo con la referencia BF16 es del 94,0%; los flips se concentran en filas casi empatadas (margen top-2 mediano de 0,011 en BF16).
- Sesgos: no se documentan análisis de sesgo en la información proporcionada; al heredar el backbone y los datos de destilación de JEV-27B, los sesgos de ese corpus se trasladan al clasificador.
- Riesgo de alucinación: el modelo no genera texto libre en su uso previsto, pero las probabilidades calibradas pueden ser excesivamente confiadas en entradas fuera de distribución; no se documentan evaluaciones OOD.
- Idiomas y contexto: no se especifican idiomas soportados ni longitud de contexto; el uso multilingüe no está validado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el adaptador tienen sus propias condiciones que deben verificarse por separado.
- Reproducibilidad: la evaluación usa un conjunto y un protocolo concretos (`test_set_30k`, bootstrap con semilla 1234); los resultados no son directamente comparables con otros benchmarks estándar como MMLU o HumanEval, que no se reportan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HangGlidersRule/Darkstar-JEV-27B-Decision-ModelOpt-W4A4-NVFP4-Mixed-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador de decisión: https://huggingface.co/autotrust/JEV-27B
- Baseline cuantizado de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Corpus de destilación: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Dataset de calibración de NVIDIA: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Instruction-Following-Chat-v2
- Source card: https://github.com/HangGlidersRule/model-forge/blob/main/models/jev-27b/model-card/decision-nvfp4.md
- Family record: https://github.com/HangGlidersRule/model-forge/blob/main/models/jev-27b/README.md
- Build recipe: https://github.com/HangGlidersRule/model-forge/blob/main/recipes/jev-27b/darkstar-jev-27b-decision-modelopt-w4a4-nvfp4-mixed-fp8.yaml
- Gate results: https://github.com/HangGlidersRule/model-forge/blob/main/models/jev-27b/results/decision-gate-summary.json
- Campaign issue: https://github.com/HangGlidersRule/model-forge/issues/15
