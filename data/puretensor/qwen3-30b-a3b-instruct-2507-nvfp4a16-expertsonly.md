# puretensor/Qwen3-30B-A3B-Instruct-2507-NVFP4A16-ExpertsOnly

## Resumen

Esta ficha describe `puretensor/Qwen3-30B-A3B-Instruct-2507-NVFP4A16-ExpertsOnly`, una cuantizacion NVFP4 de Qwen3-30B-A3B-Instruct-2507 publicada por PureTensor. El modelo base es un transformer de mezcla de expertos (MoE) de Qwen con 30.532.122.624 parametros totales, 48 bloques, 128 expertos por bloque y 8 expertos activos por token. La cuantizacion reduce el checkpoint de 61,08 GB en BF16 a 19,40 GB, manteniendo en 16 bits la atencion, los routers, los embeddings, la cabeza de salida, las normas y todas las activaciones.

La particularidad de esta variante es que solo se cuantizan a 4 bits las capas de expertos (18.432 capas, el 97% de los pesos de bloque), mientras que las proyecciones de atencion se dejan en BF16. El autor justifica esta decision con mediciones propias: redondear a 4 bits solo la atencion, que representa el 3% de los pesos, provoca aproximadamente la mitad del dano en divergencia KL respecto a BF16. El resultado es un checkpoint con una divergencia KL media de 0,0199 en WikiText-2 y 0,0153 en conversacion, frente a 0,0292 y 0,0238 de su variante totalmente cuantizada.

Es relevante ahora porque permite servir un MoE de 30B en una unica GPU Blackwell con aceleracion FP4 nativa, con una fidelidad al modelo original estadisticamente indistinguible en MMLU (79,90 frente a 80,12, p = 0,12) y un throughput entre 1,27x y 2,08x superior a BF16 segun concurrencia. Es una release de prueba, no afiliada a los autores del modelo base, y requiere vLLM para una inferencia correcta: cargarla de forma estandar en Transformers produce salidas incorrectas sin emitir ningun error.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen3_moe`), 48 bloques, 128 expertos por bloque, 8 activos por token |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible (el modelo base es A3B, pero la model card no detalla el recuento activo exacto) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4A16 (4 bits E2M1 en expertos, escala FP8 E4M3 por grupo de 16, escala FP32 por tensor); atencion y resto en BF16; formato `compressed-tensors` `nvfp4-pack-quantized` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), 19,40 GB |
| Metodo de cuantizacion | GPTQ con `block_size` 128, `dampening_frac` 0.01, `actorder` estatico |
| Capas cuantizadas | 18.432 capas de expertos (97% de los pesos de bloque) |
| Capas en BF16 | Proyecciones de atencion (3%), routers de expertos, embeddings, cabeza de salida, normas y activaciones |
| Datos de calibracion | 512 muestras en formato chat de `mlabonne/open-perfectblend`, hasta 2.048 tokens cada una |
| Herramientas | llm-compressor 0.15.0, compressed-tensors 0.20.1, transformers 5.21.0, torch 2.14.1 |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 48 bloques y 128 expertos por bloque, de los cuales se activan 8 por token. Esta variante no reentrena el modelo: aplica cuantizacion GPTQ sobre los pesos BF16 oficiales de `Qwen/Qwen3-30B-A3B-Instruct-2507`. La innovacion tecnica principal es la decision de cuantizar unicamente las capas de expertos y preservar la atencion en 16 bits. El autor midio que la atencion, pese a representar solo el 3% de los pesos de bloque, contribuye aproximadamente a la mitad de la degradacion en KL, y que redondearla sola altera casi el 5% de las elecciones de expertos de los routers aunque estos no se toquen.

El proceso de calibracion pasa cada token de calibracion por todos los expertos, no solo por los que el router selecciona; los tokens que el router no envio a un experto cuentan con peso 0,1 en las estadisticas de ese experto. El checkpoint guardado en disco, recargado, produce logits identicos al modelo cuantizado en memoria. La seleccion de expertos coincide con BF16 en el 96,3% de los casos, frente al 95,3% de la variante totalmente cuantizada.

## Capacidades

- Generacion de texto conversacional: el modelo base es una variante Instruct, orientada a dialogos multi-turno.
- Razonamiento y conocimiento general: evaluado en MMLU, ARC-Challenge, HellaSwag, Winogrande y TruthfulQA.
- Razonamiento matematico: evaluado en GSM8K a traves de la API de completions de vLLM.
- Mezcla de expertos con enrutamiento por token: 8 expertos activos de 128 por bloque, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamano.
- Inferencia acelerada en hardware Blackwell: los expertos se ejecutan en el kernel FP4 weight-only de vLLM.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de chat en produccion sobre una unica GPU Blackwell: el checkpoint de 19,40 GB cabe en una GPU de estacion de trabajo con compute capability 12.0 y ofrece entre 1,27x y 2,08x el throughput de BF16 segun concurrencia, lo que permite atender varias conversaciones simultaneas con una fidelidad al modelo original muy alta.
- Evaluacion de calidad de cuantizaciones: sirve como referencia para comparar estrategias de cuantizacion (expertos solo frente a cuantizacion completa) usando las metricas de KL y los benchmarks publicados por el autor.
- Despliegue con vLLM en entornos con memoria limitada: al reducir el peso de 61,08 GB a 19,40 GB, permite servir el MoE en GPUs donde BF16 no cabria, manteniendo la atencion en BF16 para preservar la calidad.
- Investigacion sobre sensibilidad de componentes a la cuantizacion: el autor documenta que la atencion concentra la mitad del dano pese a ser el 3% de los pesos, lo que constituye un caso de estudio reproducible para disenar esquemas de cuantizacion mixtos.
- Razonamiento matematico y tareas de conocimiento general en pipelines de evaluacion: el modelo mantiene GSM8K en 88,25 y MMLU en 79,90, adecuado para tareas de respuesta a preguntas y resolucion de problemas.
- Pruebas de integracion con `compressed-tensors` y llm-compressor: util para validar flujos de carga y servicio de checkpoints NVFP4 en vLLM 0.34.0 y transformers 5.21.0.
- Generacion de respuestas con control de fidelidad: para aplicaciones donde una divergencia KL baja respecto a BF16 es critica, esta variante ofrece 0,0199 en WikiText-2 frente a 0,0292 de la variante totalmente cuantizada.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-evaluation-harness 0.4.13, configuraciones por defecto, sin plantilla de chat, en Transformers salvo GSM8K. La prueba pareada es una prueba exacta de McNemar sobre correccion por pregunta.

| Benchmark | BF16 | Variante totalmente cuantizada | Este checkpoint | Este frente a BF16 |
|---|---:|---:|---:|---|
| MMLU (14.042 preguntas) | 80,12 | 79,66 | 79,90 | 193 perdidas, 163 ganadas, p = 0,12 |
| ARC-Challenge | 60,84 | 60,07 | 59,90 | p = 0,20 |
| HellaSwag | 61,15 | 60,98 | 60,83 | p = 0,02 |
| Winogrande | 72,93 | 72,69 | 73,16 | p = 0,81 |
| TruthfulQA (mc2) | 61,67 | 60,53 | 60,94 | p = 0,02 |
| GSM8K via API de completions de vLLM (1.319 problemas) | 88,70 | 89,46 | 88,25 | 34 perdidas, 28 ganadas, p = 0,53 |
| KL media frente a BF16, WikiText-2 | 0 | 0,0292 | 0,0199 | - |
| KL media frente a BF16, chat | 0 | 0,0238 | 0,0153 | - |
| Misma eleccion de expertos que BF16 | 100% | 95,3% | 96,3% | - |
| Tamano de fichero | 61,08 GB | 18,09 GB | 19,40 GB | - |

Rendimiento en vLLM 0.34.0 sobre una GPU Blackwell (compute capability 12.0), generaciones greedy de 256 tokens:

| Metrica | BF16 | Variante totalmente cuantizada | Este checkpoint |
|---|---:|---:|---:|
| GSM8K via API de completions | 88,70 | 89,46 | 88,25 |
| Throughput, un solo flujo | 1,00x | 1,42x | 1,27x |
| Throughput, 8 concurrentes | 1,00x | 2,27x | 2,08x |
| Throughput, 32 concurrentes | 1,00x | 1,86x | 1,79x |

El autor advierte que el throughput se midio con generaciones greedy de 256 tokens fijos y variara en otro hardware. Frente a la variante totalmente cuantizada, las diferencias pareadas son MMLU 211 ganadas y 177 perdidas (p = 0,09) y GSM8K servido 21 ganadas y 37 perdidas (p = 0,05), sin correccion por comparaciones multiples, por lo que el autor las interpreta como ausencia de diferencia fiable en tareas.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 19,40 GB en disco; se requiere al menos esa cantidad mas el espacio de activaciones y cache KV, no detallado en la informacion proporcionada.
- GPU recomendadas: una GPU NVIDIA Blackwell con compute capability 12.0, que es el hardware donde el autor midio el rendimiento con el kernel FP4 weight-only de vLLM.
- Cabe en GPU de consumo: no disponible en la informacion proporcionada; el autor solo reporta pruebas en una GPU de estacion de trabajo Blackwell.
- Opciones de despliegue: vLLM 0.34.0 es obligatorio para una inferencia correcta; cargar el modelo de forma estandar en Transformers produce salidas incorrectas sin error. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,27x en un solo flujo, 2,08x con 8 concurrentes y 1,79x con 32 concurrentes frente a BF16, con generaciones greedy de 256 tokens.
- Herramientas de cuantizacion: llm-compressor 0.15.0 y compressed-tensors 0.20.1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (NVFP4A16, expertos solo) | 30.532.122.624 | no disponible | 79,90 | 88,25 | Apache 2.0 | Hugging Face, 19,40 GB |
| Qwen3-30B-A3B-Instruct-2507-NVFP4A16 (variante totalmente cuantizada) | 30.532.122.624 | no disponible | 79,66 | 89,46 | Apache 2.0 | Hugging Face, 18,09 GB |
| Qwen3-30B-A3B-Instruct-2507 (BF16) | 30.532.122.624 | no disponible | 80,12 | 88,70 | Apache 2.0 | Hugging Face, 61,08 GB |

Las tres variantes comparten arquitectura, parametros y licencia. La diferencia esta en el tamano del fichero, la fidelidad a BF16 y el throughput: la variante totalmente cuantizada es la mas pequena y rapida, mientras que este checkpoint prioriza la fidelidad al original con un coste de 1,3 GB adicionales y un 4 a 11% menos de velocidad.

## Limitaciones y advertencias

- Es una release de prueba, no afiliada ni respaldada por los autores del modelo base.
- Cargar el modelo de forma estandar en Transformers produce salidas incorrectas sin emitir ningun error; es necesario usar vLLM.
- La cuantizacion introduce degradacion medible: HellaSwag y TruthfulQA muestran diferencias estadisticamente significativas frente a BF16 (p = 0,02 en ambos casos).
- La seleccion de expertos coincide con BF16 solo en el 96,3% de los casos, lo que puede afectar a tareas sensibles al enrutamiento.
- La fila de KL en chat procede de la misma familia de dataset que parte de los datos de calibracion (filas distintas), por lo que el autor la califica de favorecedora.
- Los benchmarks se midieron con una sola extraccion de calibracion; el autor indica que una segunda extraccion movio MMLU 0,04 puntos, ruido pequeno a este tamano.
- Las comparaciones entre este checkpoint y la variante totalmente cuantizada no aplican correccion por comparaciones multiples.
- El throughput se midio en una GPU Blackwell concreta y con generaciones de 256 tokens; no es extrapolable a otro hardware.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni limitaciones de contexto en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero al ser una release de prueba conviene validar la calidad en el dominio de produccion antes de desplegarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/puretensor/Qwen3-30B-A3B-Instruct-2507-NVFP4A16-ExpertsOnly
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Variante totalmente cuantizada: https://huggingface.co/puretensor/Qwen3-30B-A3B-Instruct-2507-NVFP4A16
- Dataset de calibracion: `mlabonne/open-perfectblend`
- Dataset de evaluacion KL en chat: `HuggingFaceH4/ultrachat_200k`
- Referencias citadas en los tags: arxiv:2406.08155, arxiv:2605.23078, arxiv:2606.17118
