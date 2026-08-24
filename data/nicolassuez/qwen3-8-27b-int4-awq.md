# Nicolassuez/Qwen3.8-27B-INT4-AWQ

## Resumen

Qwen3.8-27B es un modelo de lenguaje de visión (vision-language) denso, desarrollado por el equipo Qwen, que combina comprensión de texto, imágenes y vídeo con un control flexible del razonamiento. Esta ficha corresponde a una cuantización INT4-AWQ realizada por Nicolassuez, que reduce el peso del modelo para facilitar su despliegue en hardware con VRAM limitada. El modelo se posiciona como la generación más capaz de la familia Qwen3.8, con mejoras en programación, trabajo profesional, investigación y tareas de agente de largo horizonte.

La arquitectura combina un codificador visual con un modelo de lenguaje causal que emplea una mezcla de atención lineal (Gated DeltaNet) y atención clásica (Gated Attention), alcanzando una longitud de contexto nativa de 262 144 tokens, extensible hasta 1 millón. La cuantización INT4-AWQ reduce el tamaño del repositorio a 19 GB, lo que permite su ejecución en GPUs de consumo con 24 GB de VRAM. El modelo está licenciado bajo Apache-2.0, lo que facilita su uso comercial y su integración en proyectos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; mezcla de Gated DeltaNet (lineal) y Gated Attention (clasica) |
| Parametros totales | 27B (segun la model card original); el archivo safetensors de esta cuantizacion contiene 15 193 246 960 parametros |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible a 1 000 000 |
| Tipos de cuantizacion | INT4 (AWQ) |
| Idiomas soportados | No disponible (la model card no especifica lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizacion AWQ INT4) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo de lenguaje causal con un codificador visual integrado. La parte de lenguaje sigue un esquema hibrido: cada bloque del transformador esta compuesto por 16 sub-bloques, cada uno con una capa de Gated DeltaNet (atencion lineal) seguida de un FFN, y cada 16 sub-bloques se inserta una capa de Gated Attention (atencion clasica con RoPE). Esta combinacion permite un procesamiento eficiente de secuencias largas, manteniendo la calidad de la atencion clasica cuando es necesaria. El modelo fue entrenado en dos fases: pre-entrenamiento y post-entrenamiento, con un modulo de prediccion multi-token (MTP) entrenado en varias etapas. La arquitectura soporta un modo de pensamiento ("thinking mode") que se puede activar o desactivar por peticion, y un parametro `reasoning_effort` para ajustar la profundidad del razonamiento. Tambien se conserva el contexto de razonamiento de mensajes historicos mediante `preserve_thinking`.

El modelo ha sido optimizado para tareas de agente, con una mejor planificacion autonoma y manejo de la retroalimentacion del entorno. La cuantizacion AWQ INT4 aplicada por el autor del repositorio reduce el peso de los parametros a 4 bits, manteniendo un rendimiento cercano al original, a costa de una pequena perdida de precision.

## Capacidades

- Generacion de texto y razonamiento avanzado en tareas de programacion, trabajo profesional, investigacion y tareas de agente de largo plazo.
- Comprension nativa de imagenes y videos, incluyendo diagramas STEM, documentos y videos de hasta una hora de duracion.
- Control flexible del razonamiento: modo de pensamiento activado por defecto, desactivable por peticion; ajuste de profundidad mediante `reasoning_effort`.
- Soporte para tool calling y function calling, compatible con entornos de agente.
- Capacidad de ejecutar tareas de agente de multiples pasos con retroalimentacion del entorno.
- Multilingue (no se ha confirmado la lista exacta de idiomas en la informacion disponible, pero Qwen3.8 mantiene la tradicion de soporte multilingue de la serie).
- Compatible con multiples frameworks de inferencia: Transformers, vLLM, SGLang, TokenSpeed.

## Casos de uso

- **Atencion al cliente automatizada**: con 262 144 tokens de contexto, el modelo puede mantener conversaciones de larga duracion, recordar detalles de interacciones anteriores y responder con coherencia en multiples turnos.
- **Asistente de programacion en produccion**: soporta tool calling y puede integrarse en pipelines de CI/CD para generar codigo, revisar cambios, ejecutar comandos de terminal y depurar errores de forma autonoma.
- **Analisis de documentos tecnicos y cientificos**: al ser un modelo vision-language, puede leer diagramas, graficos y tablas de articulos de investigacion, extraer conclusiones y responder preguntas sobre el contenido.
- **Agente de automatizacion de tareas empresariales**: puede planificar y ejecutar flujos de trabajo complejos, interactuar con APIs, consultar bases de datos y tomar decisiones basadas en los resultados obtenidos.
- **Creacion de contenido multimedia**: a partir de una imagen o un video, puede generar descripciones detalladas, resumenes, transcripciones o guiones, gracias a su capacidad de comprension visual.
- **Sistemas de soporte a la decision en investigacion**: el modo de pensamiento flexible permite que el modelo razone de forma profunda sobre problemas matematicos o logicos, y luego presente la respuesta con o sin el proceso de razonamiento.

## Benchmarks y rendimiento

La model card del modelo original incluye una tabla de benchmarks de texto que compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, con categorias como "Coding" y "Terminal Bench 2.1". Sin embargo, los valores numericos concretos no se han podido extraer de la informacion disponible en esta ficha. No se dispone de datos verificables de MMLU, HumanEval, GSM8K u otros benchmarks estandar en las fuentes consultadas. Por tanto, se indica que no se han publicado resultados de benchmarks en la informacion disponible para esta cuantizacion especifica.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 19 GB, por lo que la inferencia con cuantizacion INT4 requiere aproximadamente 19-22 GB de VRAM, dependiendo de la longitud de la secuencia y el tamano de la KV cache.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40 GB), H100 (80 GB). En GPUs con 16 GB (como RTX 4080) podria no caber con longitudes de contexto largas.
- Compatible con GPUs de consumo: si, siempre que tengan al menos 24 GB de VRAM para contextos largos; con contextos cortos podria funcionar en 16 GB.
- Opciones de despliegue: Transformers, vLLM, SGLang, TokenSpeed. El formato AWQ es compatible con vLLM y SGLang para inferencia optimizada en GPU.
- Latencia y rendimiento: no hay datos publicados para esta cuantizacion especifica. Se espera un throughput de decenas de tokens por segundo en GPUs modernas (p. ej., 30-50 t/s en A100).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Peso (INT4) |
|---|---|---|---|---|---|
| Qwen3.8-27B (este) | 27B | 262k (1M ext.) | Apache-2.0 | AWQ INT4 | 19 GB |
| Qwen3.6-27B | 27B | 262k (1M ext.) | Apache-2.0 | Disponible | ~19 GB |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | 30B | No disponible | No disponible | No disponible | No disponible |

Los datos de Qwen3.7-Plus y Muse Glimmer-30B provienen de la tabla de benchmarks de la model card original, pero no se dispone de sus especificaciones tecnicas en las fuentes consultadas. Qwen3.8-27B es un modelo denso, mientras que algunos modelos de la competencia podrian usar arquitecturas MoE; no se ha confirmado.

## Limitaciones y advertencias

- No se ha publicado informacion especifica sobre sesgos o alucinaciones para esta cuantizacion. Se recomienda evaluar el modelo en el dominio de aplicacion antes de usarlo en produccion.
- La cuantizacion INT4 puede provocar una ligera degradacion en tareas de razonamiento complejo o en la fidelidad de respuestas largas, en comparacion con el modelo en precision completa.
- La longitud de contexto de 1M tokens es una capacidad "extensible", pero el rendimiento real puede degradarse con secuencias muy largas; se recomienda probar con la longitud de trabajo.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar que los datos de entrenamiento no infrinjan derechos de terceros.
- El repositorio de Nicolassuez es una cuantizacion de un tercero; no hay garantia de que los pesos sean exactamente equivalentes al modelo original en precision completa.
- No se dispone de informacion sobre la lista exacta de idiomas soportados, aunque la familia Qwen suele cubrir ingles, chino y otros idiomas importantes.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/Nicolassuez/Qwen3.8-27B-INT4-AWQ
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Version AWQ-INT4 en ModelScope: https://www.modelscope.cn/models/cyankiwi/Qwen3.8-27B-AWQ-INT4
- Pagina oficial de QwenCloud (servicio gestionado): https://www.qwencloud.com/models/qwen3.8-27b
- Repositorio de GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
