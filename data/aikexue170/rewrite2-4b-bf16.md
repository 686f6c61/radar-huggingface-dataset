# aikexue170/rewrite2-4b-bf16

## Resumen

Rewrite2 4B · BF16 es un modelo de 4B parámetros especializado en la reescritura de novelas en chino. Lo publica el usuario aikexue170 en Hugging Face y se construye a partir de `Qwen/Qwen3.5-4B` (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) mediante un LoRA de rango 32 fusionado con `merge_and_unload()`. No es un modelo conversacional general: está entrenado exclusivamente para una tarea, reescribir prosa de ficción manteniendo trama, personajes y acontecimientos, con la restricción explícita de no copiar más de 15 caracteres consecutivos del original.

El repositorio contiene los pesos fusionados en BF16 sin cuantizar (9,1 GB, dos shards de safetensors, 4.539.265.536 parámetros), pensados como referencia de calidad frente a las variantes FP8, NVFP4 y GGUF del mismo autor. La arquitectura es la de Qwen3.5, con la torre de visión conservada en los pesos aunque sin entrenamiento de imagen; el modelo solo garantiza reescritura de texto en chino.

Su relevancia práctica está en el nicho: plataformas de novela web y editores que generan borradores con LLM y necesitan reducir el "sabor a IA" del texto, o que quieren reescribir pasajes con voz de autor sin reescribir manualmente. El modelo es de compresión: la salida típica ronda 0,6-0,9 veces la longitud de entrada, no es una reescritura de longitud equivalente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen3.5 (`qwen3_5` en transformers), con torre de visión presente en los pesos pero no entrenada |
| Parámetros totales | 4.539.265.536 (≈4,54B), según safetensors |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el ejemplo de despliegue del autor usa `--max-model-len 4096` y el entrenamiento usó `max_length=2048` |
| Tipos de cuantización | BF16 (este repo); el autor publica además FP8 W8A8, NVFP4 W4A4 y GGUF Q8_0 / Q4_K_M en repos separados |
| Idiomas soportados | Chino (`zh`) únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (2 shards: `model-00001-of-00002.safetensors`, `model-00002-of-00002.safetensors`) + `model.safetensors.index.json`; variantes GGUF en repo aparte |

## Arquitectura y entrenamiento

Base Qwen3.5-4B adaptada con LoRA de rango 32 y alpha 64, 1 época, `max_length=2048` y pérdida calculada solo sobre los tokens de completion (completion-only loss). El entrenamiento totalizó 2.934 pasos sobre el dataset "V12.5 clean": 25.647 pares de reescritura pura (sin ejemplos de expansión), de los cuales 23.470 caben en 2.048 tokens. Métricas finales reportadas por el autor: `train_loss` 1,214 y precisión media por token 0,718. Tras el entrenamiento se aplicó `merge_and_unload()` y se exportaron los pesos en BF16. No se documenta uso de RLHF ni DPO.

Una particularidad de diseño es la plantilla de chat fijada: el modelo se entrenó con una única mensaje de usuario, sin system prompt y sin modo de razonamiento, y el template emite siempre un bloque `<think>` vacío antes del texto. La instrucción de reescritura forma parte del contrato de uso: el autor distribuye `INSTRUCTION_rewrite.txt` en el repo y exige concatenar su contenido con el texto original en un solo mensaje de usuario. No hay innovaciones de decodificación (ni especulativa ni atención lineal documentada); el rendimiento depende de parámetros de muestreo y de la penalización por repetición.

## Capacidades

- Reescritura de prosa de ficción en chino con reorganización de frases y sustitución sinonímica, evitando la copia literal continua de más de 15 caracteres.
- Preservación de trama, personajes y acontecimientos principales, indicada explícitamente en la instrucción de entrenamiento.
- Reescritura compresiva: reduce la longitud respecto al original (ratio típico 0,6-0,9; mediana ≈0,63 en el rango de 800-950 caracteres de entrada).
- Adaptación al "estilo de autor": la instrucción pide reproducir una voz personal y natural, orientada a eliminar marcas de texto generado por IA.
- Manejo de segmentos de 500-1.200 caracteres chinos por pasada; útil hasta 1.200-1.500 con pérdida de calidad.
- Generación de múltiples variantes de un mismo pasaje mediante muestreo (temperature 0,7 / top_p 0,9 / top_k 50) o salida reproducible con temperature 0.
- Sin soporte de tool calling, function calling ni agentes: no se menciona entrenamiento en esos formatos.
- Sin capacidades de visión efectivas, pese a conservar la torre visual y los ficheros `preprocessor_config.json` / `video_preprocessor_config.json`.
- Sin modo de razonamiento: el bloque `<think>` está fijado como vacío y el modelo solo emite el texto reescrito.

## Casos de uso

- Reescritura de capítulos en plataformas de novela web: pipeline que trocea el capítulo en bloques de 500-1.200 caracteres, llama al modelo con la instrucción fija y recompone la salida; reduce el "sabor a IA" de borradores generados previamente por un LLM de mayor tamaño.
- Edición asistida para autores: el escritor pega un pasaje de 800 caracteres y recibe una versión reescrita con `temperature=0` para revisión reproducible, o con `temperature=0.7` para generar dos o tres alternativas entre las que elegir.
- Ajuste de longitud para plataformas con límites por capítulo: al comprimir aproximadamente a 0,6-0,9 veces, sirve para recortar capítulos que exceden el límite de caracteres sin eliminar escenas completas.
- Aumento de datos para entrenar modelos de estilo o de reescritura: generar pares original→reescritura a escala con vLLM en modo batch y filtrar por `finish_reason` y ratio de longitud antes de incorporarlos a un dataset mayor.
- Preprocesado para audiolibro o TTS: eliminar repeticiones y frases redundantes de un manuscrito antes de la síntesis de voz, manteniendo la estructura de escenas indicada en el prompt.
- Normalización de estilo en catálogos de traducción o fan-fiction: homogeneizar la voz narrativa de textos de distintos autores antes de publicarlos en una misma colección.
- Despliegue local para escritores: la variante GGUF Q4_K_M (2,71 GB) o Q8_0 (4,48 GB) permite ejecutar el modelo en un portátil con GPU modesta o en CPU, sin enviar manuscritos inéditos a un servicio externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni métricas de reescritura tipo BLEU/ROUGE frente a otros sistemas). Los únicos datos numéricos aportados por el autor son métricas de entrenamiento:

| Métrica | Valor |
|---|---|
| Pasos de entrenamiento | 2.934 |
| `train_loss` final | 1,214 |
| Precisión media por token | 0,718 |
| Pares de entrenamiento (V12.5 clean) | 25.647 (23.470 utilizables a 2.048 tokens) |
| Ratio de compresión observado (entrada 800-950 caracteres) | mediana ≈540 caracteres de salida (≈0,63×) |
| Consistencia de reescritura 700-1.000 vs. 1.000-1.300 caracteres | similar según el autor, con salida más corta y más copia literal en el rango largo |

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 8,5 GiB solo de pesos, más caché KV; el autor sitúa el objetivo en tarjetas de 16 GB y considera 24 GB "más holgado".
- GPU recomendadas: RTX 4090 / RTX 4080 (16-24 GB) para BF16; A100 o H100 no son necesarias por tamaño, pero aportan throughput en batch. Para la variante FP8 W8A8 (5,15 GiB) bastan 12 GB; para NVFP4 W4A4 (3,70 GiB) y GGUF Q4_K_M (2,71 GB) son viables tarjetas de 8 GB.
- Cabe en GPU de consumo: sí, en la gama 16-24 GB con BF16 y en 8 GB con cuantizaciones de baja precisión; el propio autor advierte que la cuantización a 4 bits amplifica la compresión y las repeticiones.
- Opciones de despliegue: vLLM (comando de ejemplo con `--trust-remote-code`, `--max-model-len 4096`, `--gpu-memory-utilization 0.50`), Transformers con arquitectura Qwen3.5, llama.cpp para los GGUF (`--repeat-penalty 1.08`). No se documenta soporte verificado en Ollama ni en TGI.
- Latencia y throughput: no disponibles. El autor solo indica que la decodificación debe acotarse con `max_tokens` y timeout por el riesgo de bucles repetitivos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rewrite2-4b-bf16 (este) | 4,54B | No disponible (ejemplo a 4.096) | Safetensors BF16, 8,47 GiB | Apache 2.0 | Hugging Face + ModelScope |
| rewrite2-4b-fp8 | No disponible (mismo modelo base) | No disponible | FP8 W8A8, 5,15 GiB | Apache 2.0 | Hugging Face + ModelScope |
| rewrite2-4b-nvfp4 | No disponible (mismo modelo base) | No disponible | NVFP4 W4A4, 3,70 GiB | Apache 2.0 | Hugging Face + ModelScope |
| rewrite2-4b-gguf | No disponible (mismo modelo base) | No disponible | GGUF Q8_0 4,48 GB / Q4_K_M 2,71 GB | Apache 2.0 | Hugging Face + ModelScope |
| rewrite2-27b-bf16 | ≈27B (según nombre del repo; specs no publicadas en esta información) | No disponible | Safetensors BF16 | No disponible | Hugging Face |
| Qwen3.5-4B (base) | ≈4B | No disponible | Safetensors | No disponible en esta información | Hugging Face |

El autor advierte explícitamente que la línea de 4B es una experimentación independiente y que sus pesos no son intercambiables con el modelo de 27B, cuyo nivel de calidad no debe proyectarse sobre esta variante.

## Limitaciones y advertencias

- Capacidad limitada por el tamaño: el propio autor desaconseja evaluarlo con las expectativas del 27B; escenas complejas con múltiples personajes requieren revisión humana.
- Reescritura compresiva por defecto: con entradas de 800-950 caracteres la salida mediana ronda 540 caracteres (≈0,63×); si se necesita cobertura completa hay que segmentar y pedirlo explícitamente en el prompt.
- Riesgo de repetición y bucles degenerados: hay que activar `repetition_penalty` (1,08 como punto de partida), fijar `max_tokens` y timeouts, y comprobar `finish_reason` (`length` indica truncamiento).
- Sin capacidad de expansión: solo se entrenó reescritura; usar prompts de "expandir" produce resultados fuera de distribución.
- Solo chino: no se garantiza calidad en otros idiomas, y no hay entrenamiento de traducción ni de consistencia entre capítulos.
- No es un asistente general: no cubre chat, código, matemáticas ni tareas de agente; tampoco soporta tool calling.
- La torre de visión está presente en los pesos pero no se entrenó con imágenes; no debe usarse como modelo multimodal.
- La plantilla está fijada sin system prompt y con `<think>` vacío: introducir prompts de sistema o modos de razonamiento rompe el contrato de entrenamiento.
- Las cuantizaciones de baja precisión (Q4_K_M, NVFP4) intensifican la compresión y las repeticiones; requieren validación con el corpus propio antes de producción.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece métricas de calidad objetivas que respalden su idoneidad editorial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aikexue170/rewrite2-4b-bf16
- Réplica en ModelScope: https://modelscope.cn/models/alkaid55555/rewrite2-4b-bf16
- Variante FP8: https://huggingface.co/aikexue170/rewrite2-4b-fp8 · https://modelscope.cn/models/alkaid55555/rewrite2-4b-fp8
- Variante NVFP4: https://huggingface.co/aikexue170/rewrite2-4b-nvfp4 · https://modelscope.cn/models/alkaid55555/rewrite2-4b-nvfp4
- Variante GGUF: https://huggingface.co/aikexue170/rewrite2-4b-gguf · https://modelscope.cn/models/alkaid55555/rewrite2-4b-gguf
- Modelo de 27B de la misma familia: https://huggingface.co/aikexue170/rewrite2-27b-bf16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
