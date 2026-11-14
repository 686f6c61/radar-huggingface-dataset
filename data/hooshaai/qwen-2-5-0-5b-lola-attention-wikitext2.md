# Hooshaai/qwen-2.5-0.5b-lola-attention-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-lola-attention-wikitext2` es un checkpoint experimental publicado por Hooshaai dentro del proyecto NeuralOps "Attention Surgery Zoo". Se trata de un Qwen2.5-0.5B original de Alibaba Qwen al que se le han sustituido quirúrgicamente 18 de sus 24 bloques de atencion por el operador `LoLAAttention` (Low-Rank Linear Attention with Sparse Caching), manteniendo 6 capas con la atencion GQA softmax nativa del modelo base. El objetivo es explorar si una atencion subcuadratica puede mantener la calidad de un modelo compacto tras un proceso de destilacion de conocimiento.

El modelo no pretende ser un asistente de produccion, sino una pieza de investigacion sobre arquitecturas de atencion alternativas y su viabilidad en modelos pequenos. Resuelve el problema de evaluar empíricamente el coste/beneficio de reemplazar atencion cuadratica por atencion lineal con cache disperso en un transformer de 24 capas y 0,48 mil millones de parametros.

Es relevante ahora porque la comunidad investiga activamente alternativas a la atencion softmax para reducir el coste de inferencia en contextos largos, y este checkpoint ofrece una receta reproducible (cirugia + destilacion en dos etapas) con telemetria publicada: la perplejidad en WikiText-2 pasa de 15,38 en el profesor a 78,79 tras la destilacion, partiendo de un colapso inicial de 342.001 en zero-shot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas `LoLAAttention` + 6/24 capas GQA softmax nativas |
| Parametros totales | 481.690.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B soporta contexto nativo de 32.768 tokens, pero el checkpoint no lo declara) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 completo, 918,81 MB, mas adaptador) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 completo + adaptador) |
| Modelo base | Qwen/Qwen2.5-0.5B |
| Dimension del modelo | 896 |
| Capas | 24 |
| Cabezas de atencion (Q / KV) | 14 / 2 (GQA nativa), expandida a 14 KV en capas transplantadas |
| Dimension por cabeza | 64 |
| RoPE theta | 1.000.000 |
| Tamano del repo | 1,0 GB |
| Libreria | neuralops |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B (24 capas, D=896, 14 cabezas de consulta, 2 cabezas KV, d_h=64, RoPE con theta 1.000.000). Sobre ella se aplica una "cirugia" determinista con ratio `hybrid_3_1`: las capas en indices `[0,1,2,4,5,6,8,9,10,12,13,14,16,17,18,20,21,22]` usan `LoLAAttention` envuelto en `QwenAttentionAdapter`, mientras que las capas `[3,7,11,15,19,23]` conservan la atencion GQA softmax original como anclas de enrutamiento contextual global. Cada capa transplantada hereda los tensores `q_proj`, `k_proj`, `v_proj` y `o_proj` del profesor, con expansion de cabezas KV de 2 a 14 y una unica `o_proj` (sin proyecciones de salida duplicadas).

`LoLAAttention` combina atencion lineal de bajo rango con cache disperso en tres subsistemas (reciente, disperso y de bajo rango), activos solo durante la decodificacion autorregresiva (N_q == 1); en prefill y entrenamiento el cache se desactiva para preservar el enmascaramiento causal. El kernel tiene despacho en tres niveles: CUDA, Triton y PyTorch.

El entrenamiento consiste en destilacion de representaciones ocultas en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en una RTX 3090 de 24 GB con 0 MB de VRAM del profesor (cacheado offline). Etapa 1 (30% del presupuesto, 123 pasos): backbone congelado, solo se entrenan modulos de atencion y layernorms, con AdamW (lr 2.0e-4, weight decay 0.01, grad clipping 1.0) y perdida por capa `MSE + 0.25·(1 - cos(h_s, h_t))`. Etapa 2 (70%, 269 pasos): destilacion end-to-end de representaciones con perdida `MSE + 0.50·(1 - cos(...))`.

## Capacidades

- Generacion de texto causal autorregresiva en ingles.
- Razonamiento basico y continuacion de texto a escala 0,5B (heredado del modelo base, degradado por la cirugia y la destilacion limitada a WikiText-2).
- Soporte de atencion causal con GQA y RoPE en las capas nativas.
- Capacidad de ejecutar el operador `LoLAAttention` con cache disperso durante decode.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingue: solo ingles declarado.
- No dispone de vision, audio ni modo "thinking".
- Uso previsto: investigacion sobre atencion subcuadratica y destilacion, no asistencia general.

## Casos de uso

- Investigacion en atencion lineal: banco de pruebas reproducible para medir el impacto de sustituir atencion softmax por `LoLAAttention` en un transformer compacto, con telemetria de perplejidad antes y despues de la destilacion.
- Estudio de destilacion de representaciones: la receta en dos etapas (alineamiento de subespacio con backbone congelado y luego destilacion end-to-end) sirve como referencia para experimentos de recuperacion tras cirugia arquitectonica.
- Evaluacion de topologias hibridas: permite comparar el ratio 3:1 (18 capas lineales + 6 anclas GQA) frente a otras configuraciones en modelos de 0,5B, midiendo el equilibrio entre eficiencia y recall de induction heads.
- Prototipado de kernels: util para validar el despacho CUDA/Triton/PyTorch de `LoLAAttention` y el comportamiento del cache disperso en decode real.
- Generacion de texto de bajo coste en ingles: al ser un modelo de 0,48B en FP16 (menos de 1 GB), puede ejecutarse en GPUs consumer modestas para pruebas de continuacion de texto, asumiendo la perdida de calidad frente al base.
- Docencia y divulgacion: ejemplo didactico de "attention surgery" con artefactos publicados (pesos FP16 + adaptador) y metricas verificables para explicar destilacion y arquitecturas de atencion alternativas.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente), medidos en el split de validacion de WikiText-2 a longitud de secuencia 512 (batch 8, grad accum 4) en una RTX 3090 de 24 GB:

| Metrica | Valor |
|---|---|
| Perplejidad del profesor (Qwen2.5-0.5B, GQA softmax) | 15,38 |
| Perplejidad del estudiante zero-shot tras cirugia (pre-KD) | 342.001,00 |
| Perplejidad del estudiante tras destilacion (post-KD) | 78,79 |
| Delta absoluto de perplejidad | -341.922,20 |
| Reduccion relativa de perplejidad | 99,98% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 1 GB de pesos (918,81 MB) mas overhead de activaciones y cache; en cuantizaciones de 8 o 4 bits cabria en GPUs con 2-4 GB, aunque no se publican pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; el autor uso una RTX 3090 (24 GB) para el proceso de destilacion, no necesariamente para inferencia.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) en FP16.
- Opciones de despliegue: la libreria declarada es `neuralops`, necesaria para cargar el operador `LoLAAttention`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-lola-attention-wikitext2 | 481,7 M | no disponible | Hibrida 18/24 LoLA + 6/24 GQA | MIT | Hugging Face (libreria neuralops) |
| Qwen/Qwen2.5-0.5B | ~494 M | 32.768 tokens (nativo) | GQA softmax | Apache 2.0 | Hugging Face, ampliamente soportado |
| Qwen/Qwen2.5-1.5B | ~1,5 B | 32.768 tokens (nativo) | GQA softmax | Apache 2.0 | Hugging Face |
| SmolLM2-360M (HuggingFaceTB) | ~360 M | 8.192 tokens | GQA softmax | Apache 2.0 | Hugging Face |

El checkpoint destilado presenta una perplejidad en WikiText-2 de 78,79 frente a 15,38 del Qwen2.5-0.5B original, por lo que no es competitivo en calidad con su modelo base; su interes es arquitectonico y experimental, no de rendimiento bruto.

## Limitaciones y advertencias

- Perplejidad muy superior al modelo base (78,79 frente a 15,38 en WikiText-2): la calidad de generacion esta degradada de forma sustancial.
- El estudiante zero-shot tras la cirugia colapsa (PPL 342.001), lo que indica que la topologia hibrida depende criticamente de la destilacion para ser funcional.
- Destilado unicamente sobre WikiText-2, un corpus enciclopedico en ingles: probable sobreajuste al dominio y escasa generalizacion.
- Solo declara ingles; no hay evidencia de capacidades multilingues.
- Riesgo elevado de alucinacion y de texto incoherente por el tamano (0,48B) y la distorsion arquitectonica.
- No se documentan evaluaciones de sesgo; al derivar de Qwen2.5 hereda los sesgos de sus datos de entrenamiento originales.
- Requiere la libreria `neuralops` y el operador `LoLAAttention`; no es un checkpoint estandar cargable en transformers, vLLM o llama.cpp sin adaptacion.
- Licencia MIT permite uso comercial, pero la calidad y la falta de soporte de despliegue lo hacen inadecuado para produccion.
- No hay pesos cuantizados publicados ni benchmarks fuera de WikiText-2.
- Las metricas son declaradas por el autor y no estan verificadas de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-lola-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion de `LoLAAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/adaptive/lola_attention.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
