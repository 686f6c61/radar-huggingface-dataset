# PureTensorAI/Qwen3-30B-A3B-Instruct-2507-NVFP4A16

## Resumen

Qwen3-30B-A3B-Instruct-2507-NVFP4A16 es una cuantización de 4 bits del modelo Qwen3-30B-A3B-Instruct-2507, publicada por PureTensorAI. Se trata de un checkpoint derivado, no de un modelo original: el trabajo consiste en comprimir los pesos de un transformer de tipo mixture-of-experts (MoE) de Qwen para reducir su huella en disco y memoria de 61,08 GB (BF16) a 18,09 GB, manteniendo las activaciones en 16 bits (esquema W4A16). El modelo base tiene 30.532.122.624 parámetros totales, 48 bloques con 128 expertos cada uno y 8 expertos activos por token.

La relevancia de esta ficha es práctica: el autor documenta con detalle el impacto de la cuantización sobre la calidad (MMLU, GSM8K, perplejidad y divergencia KL frente al BF16) y sobre el rendimiento en vLLM, lo que permite evaluar si merece la pena desplegar la versión comprimida en lugar del modelo completo. El autor advierte explícitamente de que es una release de prueba, sin afiliación con los autores del modelo original, y de que solo funciona correctamente servida con vLLM.

La licencia es Apache 2.0, heredada del modelo base, y el formato de pesos es safetensors con el esquema `nvfp4-pack-quantized` de compressed-tensors. No se dispone de información sobre los idiomas soportados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe): 48 bloques, 128 expertos por bloque, 8 activos por token |
| Parametros totales | 30.532.122.624 |
| Parametros activos | 8 de 128 expertos por token (el modelo base se denomina A3B; no se detalla el recuento exacto de parámetros activos en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16): valores de 4 bits E2M1, una escala FP8 E4M3 por grupo de 16 y una escala FP32 por tensor; GPTQ con `block_size` 128, `dampening_frac` 0.01 y `actorder` estático |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, `nvfp4-pack-quantized`); repo de 18,1 GB |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint BF16 Qwen/Qwen3-30B-A3B-Instruct-2507, un transformer de mezcla de expertos con 48 bloques, 128 expertos por bloque y 8 expertos activos por token. La cuantización aplica GPTQ sobre las proyecciones de atención y las 18.432 capas de expertos, mientras que los routers de expertos, los embeddings de tokens, la cabeza de salida, todas las normas y todas las activaciones se mantienen en BF16. La calibración se realizó con 512 muestras en formato de chat del dataset `mlabonne/open-perfectblend`, de hasta 2.048 tokens cada una, usando llm-compressor 0.15.0, compressed-tensors 0.20.1, transformers 5.21.0 y torch 2.14.1.

La innovación técnica destacable está en el método de calibración de expertos: cada token de calibración se pasa por todos los expertos, y los tokens que el router no envió a un experto cuentan con peso 0,1 en las estadísticas de ese experto. El autor compara tres variantes (todos los tokens con el método por defecto de llm-compressor, todos los tokens con ponderación 0,1, y solo los tokens enrutados al experto) y concluye que las tres son indistinguibles en tareas con 512 muestras de calibración (tests pareados entre ellas con p entre 0,47 y 0,76), aunque la variante publicada obtiene la menor divergencia KL en los dos conjuntos de texto. No se detalla en la información disponible el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Generación de texto conversacional, al ser una cuantización de un modelo Instruct con formato de chat.
- Razonamiento y matemáticas: el autor evalúa GSM8K a través de la API de completions de vLLM, lo que confirma capacidad de resolución de problemas aritméticos de varios pasos.
- Conocimiento general: evaluado con MMLU (14.042 preguntas) en lm-evaluation-harness.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Inferencia eficiente en vLLM mediante el kernel weight-only FP4 `MarlinNvFp4LinearKernel`.

## Casos de uso

- Despliegue de un MoE de 30B en una sola GPU Blackwell: el checkpoint ocupa 18,09 GB frente a 61,08 GB en BF16, lo que permite servirlo con vLLM en una única GPU de estación de trabajo con compute capability 12.0, según la configuración medida por el autor.
- Servicio de chat de alto rendimiento: con vLLM 0.34.0 el autor mide 1,42x de throughput en un solo stream, 2,27x con 8 peticiones concurrentes y 1,86x con 32 concurrentes frente al BF16, con generaciones greedy de 256 tokens. Es adecuado para endpoints conversacionales con carga concurrente moderada.
- Evaluación de impacto de cuantización antes de migrar un pipeline: el autor publica MMLU, GSM8K, perplejidad en WikiText-2 y divergencia KL frente a BF16, de modo que un equipo puede decidir con datos si la pérdida de 0,46 puntos en MMLU es aceptable para su caso.
- Razonamiento aritmético en producción: GSM8K servido da 89,46 frente a 88,70 del BF16 (diferencia dentro del ruido según el autor), por lo que tareas de matemáticas de primaria y cálculo multi-paso no se degradan de forma medible.
- Prototipado e investigación con presupuesto de memoria reducido: la reducción de 61,08 GB a 18,09 GB permite cargar el modelo en entornos con menos VRAM, siempre que se use vLLM y no la carga estándar de Transformers.
- Comparación de estrategias de cuantización: el autor publica una variante alternativa, NVFP4A16-ExpertsOnly, que mantiene la atención en 16 bits con una divergencia KL un tercio menor a cambio de 1,3 GB más y un 4-11% menos de throughput, útil para equipos que evalúan el compromiso calidad-velocidad.

## Benchmarks y rendimiento

Resultados publicados por el autor, con BF16 como referencia y el checkpoint recargado desde disco:

| Metrica | BF16 | Este checkpoint | Cambio | Test pareado |
|---|---:|---:|---:|---|
| MMLU, accuracy (14.042 preguntas) | 80,12 | 79,66 | -0,46 | 263 perdidas, 199 ganadas, p = 0,003 |
| GSM8K via API de completions de vLLM (1.319 problemas, flexible-extract) | 88,70 | 89,46 | +0,76 | no testeado; dentro del ruido |
| Perplejidad WikiText-2 (130.944 tokens) | 7,67 | 7,81 | +0,14 | |

| Texto | Tokens | KL media | KL percentil 99 | Mismo token top que BF16 |
|---|---:|---:|---:|---:|
| WikiText-2 test | 130.944 | 0,028 | 0,29 | 93,1% |
| Chat (`HuggingFaceH4/ultrachat_200k`, `test_sft`, 256 conversaciones) | 224.043 | 0,023 | 0,28 | 94,6% |

Rendimiento en vLLM 0.34.0 sobre una GPU Blackwell (compute capability 12.0), generaciones greedy fijas de 256 tokens:

| Metrica | BF16 | Este checkpoint |
|---|---:|---:|
| GSM8K via API de completions | 88,70 | 89,46 |
| Throughput, un stream | 1,00x | 1,42x |
| Throughput, 8 concurrentes | 1,00x | 2,27x |
| Throughput, 32 concurrentes | 1,00x | 1,86x |

El autor advierte de que las puntuaciones de benchmark pueden variar uno o dos puntos entre calibraciones de la misma receta, y de que esta es una sola calibración. La coincidencia de enrutamiento entre el modelo cuantizado y el BF16 es del 95,3% de media (99,1% en el primer bloque, 96,1% en el último, mínimo del 93,4%).

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 18,09 GB en disco; en vLLM se necesita además memoria para el KV cache y el runtime, por lo que se requiere una GPU con más de 18 GB de VRAM. La cifra exacta de VRAM total no está publicada.
- GPU recomendadas: el autor valida el modelo en una GPU NVIDIA Blackwell (compute capability 12.0) de estación de trabajo con el kernel `MarlinNvFp4LinearKernel` de vLLM. No se detallan otros modelos de GPU probados.
- ¿Cabe en consumer GPU? No confirmado en la información disponible; el tamaño de pesos (18,09 GB) es compatible con GPUs de 24 GB o más, pero el autor no publica pruebas en hardware de consumo.
- Opciones de despliegue: vLLM es el motor recomendado y el único validado. El autor advierte de que cargar el modelo de la forma estándar en Transformers produce salidas incorrectas sin ningún error.
- Latencia y throughput: medidos en vLLM 0.34.0 sobre Blackwell; 1,42x (un stream), 2,27x (8 concurrentes) y 1,86x (32 concurrentes) frente a BF16 con generaciones de 256 tokens. El autor indica que variarán en otro hardware.
- Alternativa con más calidad: la variante ExpertsOnly requiere 1,3 GB más y ofrece entre un 4 y un 11% menos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PureTensorAI/Qwen3-30B-A3B-Instruct-2507-NVFP4A16 | 30.532.122.624 (MoE, 8/128 activos) | no disponible | NVFP4A16 (W4A16), 18,09 GB | Apache 2.0 | Hugging Face, 36 descargas |
| Qwen/Qwen3-30B-A3B-Instruct-2507 (BF16) | 30.532.122.624 (MoE) | no disponible | BF16, 61,08 GB | Apache 2.0 | Hugging Face (modelo base) |
| PureTensorAI/Qwen3-30B-A3B-Instruct-2507-NVFP4A16-ExpertsOnly | misma arquitectura | no disponible | NVFP4A16 con atención en 16 bits; +1,3 GB, -4 a -11% throughput, KL un tercio menor | Apache 2.0 | Hugging Face |

Frente al BF16, esta versión reduce el tamaño a menos de un tercio, pierde 0,46 puntos en MMLU y gana velocidad en vLLM. Frente a la variante ExpertsOnly, la diferencia en puntuaciones de benchmark no es fiable según el autor, y la elección se reduce a un compromiso entre divergencia KL (mejor en ExpertsOnly) y throughput y tamaño (mejor en esta versión). No se dispone de comparación con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Es una release de prueba y no está afiliada ni respaldada por los autores del modelo original.
- Cargar el modelo de la forma estándar en Transformers produce salidas incorrectas sin ningún error; es obligatorio usar vLLM.
- Pérdida de calidad medible: MMLU baja 0,46 puntos con significación estadística (p = 0,003), y la perplejidad en WikiText-2 sube de 7,67 a 7,81.
- El resultado de GSM8K (+0,76) no se sometió a test pareado y el autor lo considera dentro del ruido.
- La calibración se hizo con un único draw de 512 muestras; el propio autor advierte de que las puntuaciones pueden moverse uno o dos puntos entre calibraciones de la misma receta.
- La fila de KL en chat procede de la misma familia de dataset que parte de los datos de calibración (filas distintas), por lo que el autor la califica de favorecedora.
- El enrutamiento no es idéntico al BF16: solo el 95,3% de media de los expertos seleccionados coincide, con un mínimo del 93,4% en el peor bloque.
- Solo se valida en una GPU Blackwell con vLLM 0.34.0; no hay datos de latencia o throughput en otras GPU.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos en la documentación publicada.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el checkpoint cuantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PureTensorAI/Qwen3-30B-A3B-Instruct-2507-NVFP4A16
- Variante ExpertsOnly: https://huggingface.co/PureTensorAI/Qwen3-30B-A3B-Instruct-2507-NVFP4A16-ExpertsOnly
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Dataset de calibración: `mlabonne/open-perfectblend` (referenciado en la model card)
- Dataset de evaluación de chat: `HuggingFaceH4/ultrachat_200k` (referenciado en la model card)
- Papers citados en los tags: arxiv:2310.16795, arxiv:2505.03804, arxiv:2508.01625, arxiv:2606.05688 (el contenido de cada uno no se detalla en la información proporcionada)
