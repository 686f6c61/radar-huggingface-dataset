# aikexue170/rewrite2-4b-fp8

## Resumen

Rewrite2 4B FP8 es un modelo de lenguaje especializado en la reescritura de novelas en chino, desarrollado por el usuario aikexue170. Se trata de un ajuste fino (SFT con LoRA fusionado) sobre el modelo base Qwen/Qwen3.5-4B, entrenado exclusivamente con 25.647 pares de reescritura de texto novelístico. El objetivo no es la generación creativa ni la expansión de texto, sino la reescritura de fragmentos existentes manteniendo la trama, los personajes y los eventos, reorganizando el lenguaje para reducir el "sabor a IA" y evitar la copia literal.

El modelo se distribuye en varias cuantizaciones (BF16, FP8 W8A8, NVFP4 y GGUF), y este repositorio concreto contiene la versión FP8 W8A8 (e4m3) generada con NVIDIA ModelOpt 0.47.0, con un peso aproximado de 5,5 GB. Cuenta con 4.539.265.536 parámetros totales y está pensado para ejecutarse en GPUs de gama consumer con 16 GB de VRAM.

Su relevancia radica en su carácter de tarea única: no es un asistente general, sino una herramienta de edición literaria con un prompt fijo y un comportamiento de "reescritura compresiva" (la salida suele ser entre 0,6 y 0,9 veces la longitud de la entrada). Es un caso de estudio de especialización estrecha sobre un modelo pequeño, con licencia Apache 2.0 y soporte para vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B), ajuste fino con LoRA rank 32 fusionado |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la configuracion de ejemplo de vLLM usa `--max-model-len 4096` |
| Tipos de cuantizacion | FP8 W8A8 (e4m3) en este repo; tambien disponibles BF16, NVFP4 W4A4 y GGUF Q8_0 / Q4_K_M en repos hermanos |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `hf_quant_config.json` de ModelOpt), mas tokenizer, chat template y ficheros de preprocesado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`), un transformer de 4B parámetros. Sobre él se aplicó un ajuste fino supervisado con LoRA de rango 32 durante 1 época (2.934 pasos) sobre un conjunto de datos denominado V12.5 clean, compuesto por 25.647 ejemplos de reescritura pura. El adaptador LoRA se fusionó en los pesos base antes de la cuantización. No se empleó RLHF ni DPO según la información disponible; el entrenamiento es SFT de tarea única, con una sola instrucción de usuario y sin system prompt ni modo de razonamiento.

La cuantización se realizó con ModelOpt 0.47.0 en formato FP8 W8A8 (e4m3), con calibración sobre 128 fragmentos originales del corpus V12.5. Se excluyeron de la cuantización las capas de visión, el módulo MTP, las convoluciones 1D y las proyecciones `in_proj_a`/`in_proj_b` de la atención lineal, así como `lm_head` y `embed_tokens`. No se cuantizó la caché KV. El resultado son aproximadamente 5,15 GiB de pesos. La plantilla de chat fija el bloque `<think>` vacío, de modo que el modelo solo emite texto de respuesta.

## Capacidades

- Reescritura de fragmentos de novela en chino con reorganización del lenguaje y reducción de la copia literal (prohibición de copiar más de 15 caracteres consecutivos en el prompt de entrenamiento).
- Mantenimiento de la trama, los personajes y los eventos principales de la escena original.
- Estilo de reescritura compresiva: la salida tiende a ser más corta que la entrada (mediana de aproximadamente 0,63 veces en el rango de 800-950 caracteres de entrada).
- Generación de texto conversacional básico en chino (pipeline `text-generation`), aunque no es su función principal.
- No soporta de forma fiable tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta expansión de texto: solo se entrenó la reescritura.
- No hay capacidades de visión efectivas: la torre visual permanece en los pesos pero no se entrenó con imágenes.
- No se garantiza soporte de código, matemáticas, traducción ni coherencia argumental entre capítulos.

## Casos de uso

- Reescritura de capítulos de novela web: se introduce un fragmento de 500-1.200 caracteres con la instrucción fija y el modelo devuelve una versión reescrita que conserva la trama, útil para reducir la detección de texto generado por IA en plataformas de publicación.
- Edición de estilo de autor: un autor puede pasar sus propios borradores por el modelo para obtener variantes con una voz más natural, manteniendo personajes y eventos, y luego revisar manualmente.
- Preprocesado de manuscritos para editoriales digitales: reescritura por lotes de escenas de 500-700 caracteres para homogeneizar el estilo antes de la revisión humana, con segmentación previa de textos largos.
- Generación de variantes para A/B testing de estilo: con `temperature` 0.7 y distintas semillas se obtienen varias reescrituras del mismo fragmento para que el autor elija la que prefiera.
- Despliegue en GPU consumer para escritores independientes: con 5,35 GiB de pesos en FP8 cabe en una RTX 4060 Ti de 16 GB o similar, sirviendo mediante vLLM con `--gpu-memory-utilization 0.40` para dejar margen a la caché KV.
- Filtrado y limpieza de corpus: reescritura de pasajes con "sabor a IA" en datasets de narrativa antes de usarlos para otros entrenamientos, siempre con revisión humana por el riesgo de repetición.
- Integración en pipelines de edición con vLLM: el modelo se sirve como endpoint compatible con la API de OpenAI y se puede encadenar con segmentadores de texto para procesar novelas completas por escenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta una validación cualitativa sobre una entrada heldout de 646 caracteres (temperature 0.7, seed 42, max_tokens 800, repetition_penalty 1.08):

| Metrica | Resultado FP8 W8A8 |
|---|---|
| Longitud de salida | 903 caracteres |
| Tasa de reescritura | 42,3 % |
| Repeticiones `dup8` | 0 |
| Finalizacion | natural (`stop`) |

No se ofrecen comparaciones numéricas con el modelo base ni con la versión BF16 más allá de indicar que las diferencias se centran en longitud de salida y tasa de copia, no en errores de formato.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,35 GiB solo para los pesos en FP8 W8A8; hay que sumar la caché KV y el overhead del runtime.
- GPU recomendadas: el autor sugiere una GPU de 16 GB; para NVFP4 recomienda Blackwell por el mayor beneficio. Para FP8, GPUs con soporte de FP8 nativo (Ada Lovelace en adelante) son las más eficientes.
- Cabe en GPU consumer: sí, en tarjetas de 16 GB como la RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080 o RTX 4090; en 12 GB el margen es muy ajustado.
- Opciones de despliegue: vLLM es el stack recomendado (reconoce el formato ModelOpt FP8; si no, usar `--quantization modelopt_fp8`). También existen versiones GGUF para llama.cpp (con `--repeat-penalty 1.08`) y versiones NVFP4 para Blackwell.
- Latencia y throughput: no disponibles en la información proporcionada. La configuración de ejemplo de vLLM limita el contexto a 4096 tokens y la utilización de memoria al 40 %.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Rewrite2 4B FP8 (este) | 4,54 B | no disponible (ejemplo vLLM: 4096) | Apache 2.0 | Reescritura de novela en chino | Hugging Face y ModelScope |
| Rewrite2 4B BF16 | 4,54 B | no disponible | Apache 2.0 | Reescritura de novela en chino | Hugging Face y ModelScope (8,47 GiB) |
| Rewrite2 4B NVFP4 | 4,54 B | no disponible | Apache 2.0 | Reescritura de novela en chino | Hugging Face y ModelScope (3,70 GiB) |
| Rewrite2 27B BF16 | no disponible | no disponible | no disponible | Reescritura de novela en chino (línea independiente) | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con modelos de propósito general del mismo tamaño (por ejemplo, Qwen3.5-4B base u otros 4B), más allá de la indicación del autor de que el 4B no debe evaluarse con las expectativas de calidad del 27B.

## Limitaciones y advertencias

- Capacidad limitada por el tamaño: el autor advierte explícitamente de que no se use con las expectativas de calidad del modelo de 27B; escenas complejas con múltiples personajes requieren corrección humana.
- Reescritura compresiva por defecto: en entradas de 800-950 caracteres la salida mediana ronda los 540 caracteres (aproximadamente 0,63 veces); si se necesita cobertura completa hay que segmentar y pedirlo explícitamente en el prompt.
- Riesgo de repetición y bucles: se recomienda `repetition_penalty` de 1,08 como mínimo, junto con `max_tokens` duro y timeouts; la penalización reduce pero no elimina la probabilidad de repetición.
- Sin capacidad de expansión: solo se entrenó la reescritura; los prompts de expansión no funcionan.
- La torre visual está presente en los pesos pero no se entrenó con imágenes; no se garantiza ningún comportamiento multimodal.
- Las cuantizaciones de baja precisión amplían la tendencia a comprimir y repetir; Q4_K_M es más propenso que Q8_0 y conviene validar con el texto propio antes de usarlo en producción.
- No garantiza chat general, código, matemáticas, traducción ni coherencia entre capítulos.
- El modelo solo soporta chino; no hay capacidades multilingües verificadas.
- Requiere usar la instrucción fija del repositorio (`INSTRUCTION_rewrite.txt`) concatenada con el texto original como único mensaje de usuario; no admite system prompt ni modo de razonamiento.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad ni sobre la originalidad del texto reescrito; la responsabilidad editorial recae en el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aikexue170/rewrite2-4b-fp8
- Versión BF16: https://huggingface.co/aikexue170/rewrite2-4b-bf16
- Versión NVFP4: https://huggingface.co/aikexue170/rewrite2-4b-nvfp4
- Versión GGUF: https://huggingface.co/aikexue170/rewrite2-4b-gguf
- Modelo 27B: https://huggingface.co/aikexue170/rewrite2-27b-bf16
- ModelScope BF16: https://modelscope.cn/models/alkaid55555/rewrite2-4b-bf16
- ModelScope FP8: https://modelscope.cn/models/alkaid55555/rewrite2-4b-fp8
- ModelScope NVFP4: https://modelscope.cn/models/alkaid55555/rewrite2-4b-nvfp4
- ModelScope GGUF: https://modelscope.cn/models/alkaid55555/rewrite2-4b-gguf
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
