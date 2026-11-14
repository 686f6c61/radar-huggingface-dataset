# Hooshaai/qwen-2.5-0.5b-kda-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-kda-attention-wikitext2` es un checkpoint experimental publicado por el usuario Hooshaai dentro del proyecto NeuralOps "Qwen Attention Zoo". No es un modelo entrenado desde cero, sino un Qwen2.5-0.5B al que se le han sustituido quirúrgicamente 18 de sus 24 capas de atención por un mecanismo denominado Kernelized Decay Attention (KDA), una atención lineal recurrente con decaimiento aprendible por cabeza. El objetivo es demostrar que es posible reemplazar la atención cuadrática estándar por alternativas subcuadráticas y recuperar buena parte del rendimiento original mediante destilación de conocimiento en dos etapas.

El modelo parte de los pesos de Qwen/Qwen2.5-0.5B (495.138.958 parámetros reales según safetensors) y se ajusta sobre WikiText-2, por lo que su finalidad es fundamentalmente de investigación en arquitecturas de atención eficientes, no de uso conversacional en producción. La perplexity final declarada en validación es de 235,23, un valor muy alto en términos absolutos que refleja la agresividad de la cirugía y el escaso presupuesto de entrenamiento (382 pasos, unos 180 segundos).

Es relevante ahora porque ejemplifica una línea de trabajo activa: sustituir atención cuadrática por variantes lineales o híbridas para reducir el coste computacional en contextos largos, con herramientas de "attention surgery" y destilación que permiten reaprovechar checkpoints existentes en lugar de reentrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido: 18/24 capas con KDA (atención lineal recurrente con decaimiento) y 6/24 capas con atención cuadrática completa (índices 3, 7, 11, 15, 19, 23) |
| Parametros totales | 495.138.958 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó seq_len=512; la ventana nativa de Qwen2.5-0.5B no se declara en la información) |
| Tipos de cuantizacion | No disponible (solo se documenta FP16 para inferencia y FP32 para parámetros maestros del estudiante durante el entrenamiento) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 944,45 MB y `attention_weights.safetensors` 86,24 MB) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B: 24 capas, hidden_size 896, 14 cabezas de consulta, 2 cabezas KV (GQA), head_dim 64. Sobre esa base se aplica un patrón de cirugía `hybrid_3_1`: por cada tres capas se sustituye la atención original por KDA y se conserva una capa de atención cuadrática como ancla. El adaptador `QwenAttentionAdapter` realiza una expansión de cabezas KV de 7x cuando es necesario y respeta el contrato de una única `o_proj`. KDA se define como una atención lineal recurrente: S_t = γ · S_{t-1} + φ(k_t)ᵀ · v_t, con Z_t = γ · Z_{t-1} + φ(k_t)ᵀ, salida y_t = (φ(q_t) · S_t) / (φ(q_t) · Z_t + ε), donde γ = sigmoid(β) es un decaimiento aprendible por cabeza y φ(x) = ELU(x) + 1. Soporta causalidad, bidireccionalidad, cross-attention y GQA nativo; no usa RoPE en el módulo KDA.

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineación con backbone congelado, 116 pasos, 54,1 s) omite `lm_head` y usa MSE y coseno por capa con peso 0,25. La etapa 2 (destilación multi-capa de representaciones, 266 pasos, 125,9 s) usa MSE y coseno por capa con peso 0,50. En total, 382 pasos en 180,4 s con seq_len=512, grad_accum=4 y topk=64, con un pico de VRAM de 17.309 MB en FP16 con autocast y parámetros maestros en FP32. La perplexity causal pasó de 22.158,08 (etapa 0, cero-shot tras la cirugía) a 235,23 tras la destilación, una delta de -21.922,85.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada de Qwen2.5-0.5B y reajustada sobre WikiText-2.
- Modelado de lenguaje y cálculo de perplexity sobre corpus tipo Wikipedia/WikiText.
- Soporte de atención causal, bidireccional y cross-attention a nivel de módulo KDA.
- Soporte nativo de GQA en el adaptador, con expansión de cabezas KV cuando el patrón lo requiere.
- Capacidad multilingüe: limitada al inglés según la model card.
- Tool calling / function calling: no documentado; no se declara soporte.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking, visión, audio: no disponibles.

## Casos de uso

- Investigación en atención subcuadrática: banco de pruebas para comparar KDA frente a atención cuadrática en un checkpoint pequeño y reproducible, midiendo perplexity en WikiText-2 con el pipeline de cirugía y destilación.
- Experimentos de "attention surgery": servir de referencia para validar el adaptador `QwenAttentionAdapter` y el patrón `hybrid_3_1` antes de aplicarlos a modelos mayores con presupuestos de entrenamiento más altos.
- Destilación de conocimiento sobre arquitecturas modificadas: usar la telemetría de las dos etapas (pasos, tiempo, VRAM, PPL) como línea base para calibrar recetas de KD en otros checkpoints.
- Evaluación de mecanismos de decaimiento aprendible: analizar el comportamiento de γ = sigmoid(β) por cabeza en tareas de modelado de lenguaje y en dependencias de largo alcance dentro de WikiText-2.
- Reproducibilidad de experimentos académicos: el checkpoint permite reproducir el resultado de PPL 235,23 con los scripts de NeuralOps y comparar con la etapa 0 (PPL 22.158,08).
- Estudio de híbridos atención lineal/cuadrática: analizar el efecto de conservar 6 capas de anclaje cuadrático en índices concretos frente a sustituciones completas.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplexity | 235,23 |
| WikiText-2 (etapa 0, cero-shot tras cirugía) | Perplexity | 22.158,08 |
| WikiText-2 (post-destilación) | Delta de perplexity | -21.922,85 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1 GB para pesos (495 M parámetros), más overhead de activaciones y KV cache; el entrenamiento documentado usó 17.309 MB de pico con FP32 master y seq_len=512.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM debería poder ejecutar inferencia en FP16; para reproducir el entrenamiento se necesitan al menos 17-18 GB, lo que apunta a RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, en FP16 en tarjetas con 4 GB o más; en cuantizaciones de 8 o 4 bits sería aún más ligero, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: la model card solo documenta carga vía `transformers` con `apply_qwen_attention_surgery` y vía `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El tiempo de entrenamiento (180,4 s para 382 pasos) no es indicativo del throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-kda-attention-wikitext2` | 495 M | No disponible (entrenado con seq_len=512) | MIT | safetensors | KDA híbrido 3:1, PPL WikiText-2 235,23 |
| `Qwen/Qwen2.5-0.5B` (base) | 494 M aprox. | 32.768 tokens (según Qwen2.5) | Apache 2.0 | safetensors | Atención cuadrática estándar con GQA; PPL WikiText-2 no disponible en esta información |
| Otros modelos del NeuralOps Attention Zoo | No disponible | No disponible | No disponible | safetensors | Misma metodología de cirugía; no se dispone de datos concretos |

La comparación directa con el modelo base Qwen2.5-0.5B en WikiText-2 no está disponible en la información proporcionada, por lo que no es posible cuantificar la pérdida de calidad atribuible a la sustitución de atención.

## Limitaciones y advertencias

- Perplexity absoluta muy alta (235,23) en WikiText-2, lo que indica que la calidad de modelado de lenguaje es muy inferior a la del checkpoint base; no es apto para uso conversacional en producción.
- El ajuste se ha realizado únicamente sobre WikiText-2, un corpus de dominio estrecho (Wikipedia en inglés); el riesgo de degradación fuera de dominio es alto.
- Solo soporta inglés según la model card; no se declara capacidad multilingüe.
- No se documentan evaluaciones de sesgo, alucinación ni seguridad; al ser un experimento de arquitectura, no hay garantías de comportamiento alineado.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen2.5-0.5B se distribuye bajo Apache 2.0 y el checkpoint derivado hereda consideraciones de atribución razonables.
- El modelo requiere el código de NeuralOps (`apply_qwen_attention_surgery`, `load_surgeried_model`) para cargarse correctamente; no es un checkpoint estándar de `transformers` sin el adaptador.
- La model card incluye referencias a rutas y repositorios (`tahamajs/...`) que no coinciden con el ID del repositorio (`Hooshaai/...`), lo que puede generar confusión al descargar artefactos.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ); el despliegue en entornos con llama.cpp u Ollama no está soportado de forma nativa.
- El patrón híbrido `hybrid_3_1` conserva 6 capas cuadráticas, por lo que el ahorro computacional frente a la atención completa es parcial y no se cuantifica en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-kda-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
