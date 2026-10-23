# smalinin/DeepSeek-V4.1-Flash-1017-IQ2_XXS-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017 es la revisión de octubre de 2026 del modelo "Flash" de la familia DeepSeek V4.1, la variante de coste contenido de DeepSeek-AI. Se trata de un modelo de mezcla de expertos (MoE) dispersa construido sobre la arquitectura Causal Encoder-Decoder de la compañía, con 552.000 millones de parámetros totales de los que se activan 8.000 millones en la fase de entrada y 16.000 millones en la de salida, y una ventana de contexto de 1.048.576 tokens. Admite entrada multimodal de texto e imagen, lo que lo sitúa en la categoría image-text-to-text.

La ficha que nos ocupa, sin embargo, no es el checkpoint oficial: `smalinin/DeepSeek-V4.1-Flash-1017-IQ2_XXS-GGUF` es una redistribución de terceros cuantizada a IQ2_XXS en formato GGUF, publicada el 22 de octubre de 2026 con licencia MIT y cero descargas registradas. Es relevante porque una cuantización de ~2 bits por peso es la única vía práctica de ejecutar un modelo de 552.000 millones de parámetros en hardware de gama alta de consumo agregado o en nodos compactos, a cambio de una pérdida de calidad que el repositorio no documenta en absoluto.

El interés técnico del modelo original está en su título de informe: "Pushing the Limits of KV Cache Compression". La reducción del coste de caché KV es lo que hace viable la ventana de 1M tokens, y la revisión 1017 añade mejoras en razonamiento, código, tareas agénticas y benchmarks visuales reduciendo además la longitud de salida y el tiempo de ejecución de tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE dispersa sobre arquitectura Causal Encoder-Decoder (DeepSeek) |
| Parametros totales | 552 000 millones (552B) |
| Parametros activos | 8B en entrada y 16B en salida (aproximadamente 24B por pasada completa) |
| Longitud de contexto | 1 048 576 tokens (1M) |
| Tipos de cuantizacion | IQ2_XXS (GGUF) en este repositorio; referencia externa de EXL3 a 2,9 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (variante cuantizada); formato del checkpoint original: no disponible |
| Pipeline declarado | image-text-to-text (texto e imagen de entrada) |
| Modo thinking | Si, activable y desactivable segun la model card |
| Tool calling | Si, con soporte de llamadas a herramientas en el codificador de referencia |
| Parametros de muestreo recomendados | temperature 1.0, top_p 1.0, max_tokens >= 256K |
| Libreria declarada | transformers |
| Fecha de publicacion del repositorio | 22 de octubre de 2026 |

## Arquitectura y entrenamiento

La model card describe DeepSeek-V4.1-Flash-1017 como un modelo MoE disperso sobre la arquitectura Causal Encoder-Decoder de DeepSeek. El reparto de activación es asimétrico: 8.000 millones de parámetros activos en la fase de entrada y 16.000 millones en la de salida, sobre un backbone de 552.000 millones. Esa asimetría es poco habitual y encaja con un diseño tipo encoder-decoder donde la codificación de la entrada (incluidas imágenes) es más barata que la generación. El informe técnico se titula "Pushing the Limits of KV Cache Compression", lo que indica que la compresión de caché KV es la innovación central que permite sostener 1M tokens de contexto con un coste de memoria razonable.

No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o RL con verificadores. Sí se documenta soporte de "razonamiento numérico de esfuerzo" (numeric reasoning effort), modo thinking con activación y desactivación, mensajes de sistema a mitad de conversación, contenido de imagen intercalado y tool calling. Un detalle relevante para integradores: esta release no incluye plantilla de chat en formato Jinja; en su lugar se publica una implementación de referencia en Python (`encoding/encoding.py`) con casos de prueba, y el kit `deepseek-recipe` en Rust con bindings de Python que convierte peticiones de Messages, Chat Completions y Responses API al formato Conversation y codifica los prompts de V4 y V4.1.

En el ecosistema externo, el repositorio de MiaAI-Lab documenta servir este checkpoint desde dos NVIDIA DGX Spark (GB10, 128 GB cada una, unidas por sus puertos ConnectX-7) con decodificación especulativa DSpark a partir de los propios bloques draft del checkpoint, sobre el motor nativo en Zig de TensorFold y una cuantización EXL3 de 2,9 bits.

## Capacidades

- Generación de texto y razonamiento de propósito general, con modo thinking activable y desactivable.
- Razonamiento numérico de esfuerzo (reasoning effort) configurable por petición.
- Codificación y comprensión de imágenes: el pipeline declarado es image-text-to-text, e incluye contenido de imagen intercalado en la conversación.
- Tool calling y function calling, con integración en el codificador de referencia.
- Ejecución de agentes multi-paso: los benchmarks reportados incluyen Terminal-Bench 4.0, DeepSWE v1.1, Automation-Bench y Agents' Last Exam.
- Comprensión de gráficos y documentos visuales: Chartography y BabyVision aparecen en la tabla de resultados.
- Contexto largo real de 1M tokens, con mensajes de sistema insertables a mitad de conversación.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agente de codificación autónomo sobre repositorios: con 1M tokens de contexto puede cargar árboles de proyecto completos y sostener sesiones largas de edición; sus 77,0 en DeepSWE v1.1 y 68,2 en NL2Repo-Bench lo sitúan por encima de la revisión anterior en tareas de reparación de software real.
- Automatización de terminal y operaciones de sistema: el 42,3 en Terminal-Bench 4.0 (frente a 31,2 de la versión previa) lo hace apto para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos tipo shell.
- Análisis de documentación técnica extensa: informes, normativas o expedientes de cientos de miles de tokens caben en una sola ventana, evitando pipelines de troceado y recuperación.
- Extracción de datos de gráficos y figuras: los 83,0 en Chartography con herramientas y 92,5 en BabyVision apuntan a un uso directo en digitalización de informes financieros o científicos con ejes y leyendas.
- Asistente de ingeniería con acceso a herramientas internas: el soporte de tool calling y de mensajes de sistema intermedios permite conectar el modelo a APIs corporativas y reinyectar contexto sin reiniciar la conversación.
- Evaluación automática de calidad de código en CI/CD: integrado mediante `deepseek-recipe`, puede consumir diffs y devolver revisiones estructuradas en formato de respuesta parseable.
- Despliegue en hardware compacto o soberano: gracias a la cuantización IQ2_XXS, un equipo con dos nodos DGX Spark o una configuracion multi-GPU de ~160 GB puede servir el modelo en local sin depender de la nube.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo original. La columna 1017 corresponde a esta revisión; el resto son referencias del propio autor.

| Benchmark | V4.1-Flash-1017 | V4.1-Flash | K3 | GLM-5.3 | GPT-5.6 Sol | Opus 5 |
|---|---|---|---|---|---|---|
| HLE sin herramientas | 42,6 (44,0†) | 36,8 (39,1†) | 43,5 | 42,0† | 44,5 | 56,3 |
| Terminal-Bench 4.0 | 42,3 | 31,2 | 12,6 | 37,9 | 39,9 | 51,8 |
| DeepSWE v1.1 | 77,0 | 74,2 | 67,5 | 66,9 | 73,0 | 74,0 |
| ProgramBench | 29,1 | 20,3 | 17,5 | 19,0 | 23,0 | 37,0 |
| NL2Repo-Bench | 68,2 | 65,4 | 58,0 | 58,0 | 56,8 | 75,3 |
| Automation-Bench v1.0.6 | 60,5 | 54,8 | 46,7 | 48,8 | 45,8 | 50,3 |
| Agents' Last Exam | 35,4 | 31,8 | 27,6 | 28,5 | 26,7 | 28,6 |
| Apex Bench v1.1 | 72,1 | 64,6 | 47,8 | 56,6 | 54,3 | 65,8 |
| Chartography (con herramientas) | 83,0 | 78,9 | 68,1 | — | 79,9 | 84,0 |
| BabyVision (con herramientas) | 92,5 | 89,6 | 85,7 | — | 88,9 | 94,1 |
| ZeroBench-main (con herramientas) | 51,0 | 49,0 | 41,0 | — | 53,0 | 52,0 |

† Subconjunto de HLE solo texto. Terminal-Bench 4.0 se ejecutó con el harness de Claude Code y DeepSWE v1.1 con el harness Mini-SWE-V2.

Advertencia importante: estos números corresponden al checkpoint original en su precisión nativa. No se ha publicado ninguna evaluación de la variante IQ2_XXS de este repositorio, por lo que el rendimiento real de la cuantización es desconocido.

## Requisitos de hardware

- VRAM estimada para esta variante: entre 140 y 170 GB solo para pesos, calculado a partir de 552B parámetros a ~2,06-2,4 bits por peso. Es una estimación aritmética, no un dato publicado por el autor del repositorio.
- Caché KV para 1M tokens: no disponible. El tamaño depende de la configuración de cabezas y de las técnicas de compresión descritas en el informe técnico, no detalladas en la información disponible.
- GPU recomendadas: configuraciones multi-GPU. El único despliegue documentado externamente usa 2 × NVIDIA DGX Spark (GB10, 128 GB cada una, ConnectX-7) con EXL3 a 2,9 bits, no con IQ2_XXS.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en ninguna consumer GPU individual. Requiere agregar memoria de varias GPU o usar nodos con memoria unificada de gran capacidad.
- Opciones de despliegue: llama.cpp u Ollama para el formato GGUF (IQ2_XXS es un tipo de cuantización i-quant de llama.cpp, aunque el repositorio declara la librería `transformers`, lo que resulta contradictorio); `deepseek-recipe` para la codificación de prompts y parseo de salidas; vLLM o TGI para el checkpoint original: no confirmado en la información disponible.
- Latencia y throughput: no disponibles. La model card afirma reducción del tiempo de ejecución de tareas y de la longitud de salida respecto a la revisión anterior, sin cifras.

## Comparativa con modelos similares

Comparación con los modelos de referencia empleados en la propia tabla de benchmarks del autor. Los parámetros y contextos de los competidores no están disponibles en la información proporcionada.

| Modelo | Parámetros | Contexto | HLE sin herramientas | Terminal-Bench 4.0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (esta ficha, IQ2_XXS) | 552B totales / 8B-16B activos | 1M | 42,6 | 42,3 | MIT | GGUF de terceros en HF |
| DeepSeek-V4.1-Flash (revisión previa) | 552B (misma familia) | 1M | 36,8 | 31,2 | MIT | HF oficial |
| K3 | no disponible | no disponible | 43,5 | 12,6 | no disponible | no disponible |
| GLM-5.3 | no disponible | no disponible | 42,0† | 37,9 | no disponible | no disponible |
| GPT-5.6 Sol | no disponible | no disponible | 44,5 | 39,9 | propietaria | API |
| Opus 5 | no disponible | no disponible | 56,3 | 51,8 | propietaria | API |

Frente a la revisión anterior de la misma familia, la 1017 mejora en todos los benchmarks reportados, consaltos notables en Terminal-Bench 4.0 (+11,1 puntos), ProgramBench (+8,8) y Apex Bench v1.1 (+7,5). Frente a Opus 5 sigue por debajo en HLE y Terminal-Bench, pero lo supera en DeepSWE v1.1, Automation-Bench y Agents' Last Exam.

## Limitaciones y advertencias

- La cuantización IQ2_XXS es extremadamente agresiva (~2 bits por peso). La degradación de calidad en razonamiento, matemáticas y código puede ser severa y no está medida: no hay ningún benchmark de esta variante.
- El repositorio lo publica un tercero (`smalinin`), no DeepSeek-AI. No hay verificación de integridad de los pesos, ni garantía de que la conversión se haya hecho correctamente. Cero descargas y cero likes implican ausencia total de validación comunitaria.
- Inconsistencia de metadatos: la librería declarada es `transformers`, pero el sufijo del repositorio y el tipo de cuantización son propios de llama.cpp/GGUF. Conviene verificar el contenido real del repositorio antes de integrarlo.
- El modelo original no incluye plantilla de chat Jinja. Reutilizar plantillas genéricas producirá formatos de prompt incorrectos; es obligatorio usar `encoding.py` o `deepseek-recipe`.
- Riesgo de alucinación: no cuantificado en la información disponible, pero es un riesgo estándar en modelos de este tipo, especialmente en contextos de 1M tokens donde la recuperación de detalles lejanos se degrada.
- Idiomas soportados: no disponibles. No hay confirmación explícita de calidad en castellano.
- La licencia MIT del modelo original es permisiva y permite uso comercial, pero el autor de esta cuantización no añade garantías; verifique la licencia del repositorio original antes de producción.
- El rendimiento declarado en la model card (reducción de longitud de salida y de tiempo de tarea) no viene con cifras y no se ha replicado de forma independiente en la información disponible.
- El despliegue requiere infraestructura multi-GPU o nodos de memoria unificada; los 1M tokens de contexto no son alcanzables en hardware de consumo.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/smalinin/DeepSeek-V4.1-Flash-1017-IQ2_XXS-GGUF
- Repositorio GGUF relacionado del mismo autor: https://huggingface.co/smalinin/DeepSeek-V4.1-Flash-GGUF
- Modelo original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Informe técnico (PDF): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Organización DeepSeek en HuggingFace: https://huggingface.co/deepseek-ai
- Kit de codificación de prompts `deepseek-recipe`: https://github.com/deepseek-ai/deepseek-recipe
- Sitio oficial: https://www.deepseek.com/
- Chat oficial: https://chat.deepseek.com/
- Cuenta de X: https://twitter.com/deepseek_ai
- Despliegue en 2 × DGX Spark (MiaAI-Lab): https://github.com/MiaAI-Lab/DeepSeek-v4.1-Flash-1017-2x-DGX-Sparks
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/deepseek-v4-1-flash.html
- Ficha en AI Model Radar: https://aimodelradar.app/models/deepseek-v4-1-flash-1017
- Contacto del autor original: service@deepseek.com
