# AMAImedia/Qwen3.8-27B-Abliterated-Uncensored-NOESIS-BF16

## Resumen

AMAImedia/Qwen3.8-27B-Abliterated-Uncensored-NOESIS-BF16 es un repack en 35 shards del modelo KridgeDookie/Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS, un derivado multimodal de Qwen3.8-27B al que se ha aplicado una técnica de abliteration para reducir drásticamente el comportamiento de rechazo. El modelo mantiene el backbone híbrido de texto y visión del original, con 27.781 millones de parámetros en BF16, y se distribuye bajo licencia Apache 2.0. El repack lo publica AMAImedia como parte de su plataforma NOESIS de automatización de doblaje multilingüe, aunque el modelo en sí es de propósito general.

La relevancia de este modelo radica en que combina un tamaño manejable (27B) con capacidades multimodales, razonamiento explícito (thinking mode), tool calling y una tasa de rechazos cercana a cero en las evaluaciones internas del autor. Está pensado para desarrolladores que necesitan un modelo abierto, sin restricciones de uso comercial y con soporte multilingüe (inglés, ruso, chino, japonés, kazajo y vietnamita). El safetensors incluye pesos de visión, mientras que los GGUF publicados son solo de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion Gated DeltaNet lineal + atencion completa, vision-lenguaje nativo |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada; la configuracion de Ollama usa 32.768 tokens |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | en, ru, zh, ja, kk, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura densa hibrida que combina atencion lineal Gated DeltaNet con atencion completa, lo que permite ventanas de contexto largas con un coste computacional reducido. Es un modelo nativo de vision-lenguaje: el safetensors incluye tanto los pesos de texto como los del proyector de vision, por lo que puede procesar imagenes ademas de texto. Incluye un modo de razonamiento explicito (thinking mode) y una cabeza MTP para decodificacion especulativa, aunque esta ultima no se ha incluido en este repack.

El proceso de abliteration aplicado por KridgeDookie modifica los pesos del modelo original para eliminar la direccion de rechazo, manteniendo en gran medida las capacidades de razonamiento, codigo y vision. No se han publicado detalles sobre el dataset de entrenamiento ni sobre el proceso de ajuste fino; la informacion disponible solo indica que se trata de una transformacion de pesos (abliteration) sobre el checkpoint BF16 de Qwen3.8-27B. El repack NOESIS no anade entrenamiento adicional, solo reorganiza los pesos en 35 shards para facilitar la descarga y la carga en memoria.

## Capacidades

- Generacion de texto, razonamiento, codigo, matematicas y explicaciones en seis idiomas (en, ru, zh, ja, kk, vi).
- Procesamiento de imagenes: el safetensors incluye el proyector de vision, permitiendo responder a preguntas sobre contenido visual (por ejemplo, identificar objetos o colores).
- Modo thinking: puede generar cadenas de razonamiento internas antes de responder, activable o desactivable mediante el parametro `enable_thinking`.
- Tool calling y function calling: compatible con el protocolo de Qwen para invocar herramientas externas.
- Soporte para agentes y razonamiento multi-paso gracias al modo thinking y a la ventana de contexto amplia.
- Capacidad multilingue real, no solo traduccion: puede mantener conversaciones coherentes en los seis idiomas declarados.
- Reduccion de rechazos: segun las evaluaciones internas del autor, responde sin negarse en la practica totalidad de los prompts probados.

## Casos de uso

- Atencion al cliente automatizada multilingue: el modelo puede gestionar conversaciones multi-turno en ruso, chino, japones, kazajo o vietnamita sin necesidad de un traductor intermedio, gracias a su soporte nativo de estos idiomas y a su baja tasa de rechazo ante peticiones variadas.
- Generacion de codigo en produccion: con tool calling y capacidad de razonamiento, puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests o documentar APIs, siempre que se valide su salida con pruebas automatizadas.
- Analisis de imagenes en entornos industriales: al ser multimodal, puede describir defectos en fotografias de piezas, leer etiquetas o verificar elementos visuales en un flujo de control de calidad, usando el safetensors BF16.
- Asistentes de investigacion sin censura previa: para equipos que necesitan explorar temas sensibles o controvertidos (por ejemplo, analisis de sesgos, estudios de contenido extremo) sin que el modelo se niegue a responder, este checkpoint ofrece una via practica.
- Automatizacion de doblaje y subtitulado: el repack proviene de la plataforma NOESIS, por lo que es adecuado para generar dialogos, adaptar guiones o transcribir contenido audiovisual en varios idiomas, combinando vision (para leer escenas) y generacion de texto.
- Creacion de contenido creativo: redaccion de narrativa, guiones, dialogos o material de marketing en los seis idiomas soportados, con control sobre el tono y el estilo gracias al modo thinking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor del modelo original proporciona una evaluacion interna automatizada, que se reproduce a continuacion. Estos datos no son comparables con leaderboards publicos y miden principalmente la reduccion de rechazos, no la calidad factual.

| Evaluacion interna | Resultado |
|---|---|
| Pantalla completa de rechazos - 842 prompts | 0/842 rechazos; 100% utilizables; 0 degeneracion |
| Holdout disjunto por familia - 126 prompts, 96 tokens generados | 0/126 rechazos; 100% utilizables; 0 degeneracion |
| Regresion de coherencia - codigo, JSON, depuracion, explicacion, matematicas y tareas limite | 23/24 superadas |
| Diagnostico de formato largo - 24 prompts, 256 tokens generados | 0/24 rechazos; 23/24 utilizables; 0 degeneracion |
| Prueba de recarga multimodal | Superada; identifico correctamente un cuadrado azul |

Nota: la pantalla de 842 prompts incluye los 716 prompts usados para ajustar la transformacion; el resultado de 126 prompts usa familias de prompts no vistas. "Utilizable" mide la forma y la topicalidad de la respuesta, no la exactitud factual. Los resultados se midieron en el checkpoint BF16 con thinking desactivado.

## Requisitos de hardware

- VRAM estimada para inferencia: el safetensors BF16 ocupa aproximadamente 56,4 GB, por lo que se necesita al menos 60 GB de VRAM para cargarlo completo (mas overhead de KV-cache). Con cuantizacion GGUF Q4_K_M, el modelo ocupa unos 16 GB; con Q5_K_M, unos 17 GB; con Q8_0, unos 27 GB.
- GPU recomendadas: para BF16, una A100 80 GB, H100 80 GB o dos RTX 4090 en paralelo. Para GGUF Q4_K_M, una RTX 4090 24 GB o una RTX 3090 24 GB son suficientes. Para Q8_0, se recomienda una GPU con 32 GB o mas.
- Si cabe en consumer GPU: si, con cuantizacion Q4_K_M o Q5_K_M en una RTX 4090 o similar. El safetensors BF16 no cabe en una sola consumer GPU.
- Opciones de despliegue: transformers (con `device_map="auto"`), vLLM, llama.cpp, Ollama (mediante Modelfile con GGUF), TGI. El modelo es compatible con endpoints de Hugging Face.
- Latencia y throughput: no se han publicado mediciones. Como referencia, un modelo de 27B en Q4_K_M en una RTX 4090 suele generar entre 20 y 40 tokens por segundo, pero depende del backend y de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,78 B | No disponible | Si | Apache 2.0 | Modelo base con rechazos estandar |
| Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS | 27,78 B | No disponible | Si | Apache 2.0 | Abliteration original, incluye MTP |
| AMAImedia/Qwen3.8-27B-Abliterated-Uncensored-NOESIS-BF16 | 27,78 B | No disponible | Si (safetensors) | Apache 2.0 | Repack en 35 shards, sin MTP |
| Qwen3.8-27B-Uncensored (orcarouter) | 27,78 B | No disponible | Si (con mmproj) | Apache 2.0 | Build de Ollama con 16 cuantizaciones |

La principal diferencia con el original es la reduccion de rechazos. Frente a otros abliterations, este repack destaca por su organizacion en shards y por la ausencia de la cabeza MTP, lo que impide la decodificacion especulativa pero simplifica la carga.

## Limitaciones y advertencias

- "Uncensored" no es una garantia absoluta: el autor advierte que la reduccion de rechazos no se mantiene necesariamente con todos los prompts, idiomas, configuraciones de decodificacion, cuantizaciones o runtimes.
- No incluye la cabeza MTP del modelo original, por lo que la decodificacion especulativa dependiente de MTP no esta soportada.
- Los archivos GGUF publicados son solo de texto; no incluyen el proyector de vision. Para usar la modalidad de imagen es necesario el safetensors BF16.
- Las evaluaciones internas del autor no son benchmarks publicos ni auditorias independientes; miden la forma de la respuesta, no la exactitud factual. El modelo puede alucinar o producir informacion incorrecta.
- El modelo hereda los sesgos del Qwen3.8-27B original, que no han sido corregidos por la abliteration.
- La licencia Apache 2.0 permite uso comercial, pero el repack NOESIS esta vinculado a una plataforma comercial (AMAImedia); se recomienda revisar los terminos de la organizacion si se planea redistribuir el modelo.
- Para produccion, es imprescindible validar las salidas con pruebas automatizadas, especialmente en tareas de codigo o generacion de contenido factual.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/AMAImedia/Qwen3.8-27B-Abliterated-Uncensored-NOESIS-BF16
- Modelo original de KridgeDookie: https://huggingface.co/KridgeDookie/Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio LoRA de AMAImedia: https://huggingface.co/AMAImedia/Qwen3.8-27B-LoRA
- Repositorio Obliterated de AMAImedia: https://huggingface.co/AMAImedia/Qwen3.8-27B-Obliterated-NOESIS-BF16
- Build de Ollama de orcarouter: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Blog sobre abliteration de Qwen3.8-27B AEON: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Blog sobre Qwen3.8-27B OBLITERATED: https://www.mindstudio.ai/blog/qwen3-27b-obliterated-uncensored-model
