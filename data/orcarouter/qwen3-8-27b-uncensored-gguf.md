# orcarouter/Qwen3.8-27B-Uncensored-GGUF

## Resumen

El modelo `orcarouter/Qwen3.8-27B-Uncensored-GGUF` es una versión cuantizada en formato GGUF del modelo base Qwen/Qwen3.8-27B, modificada mediante técnicas de "abliteration" para eliminar los mecanismos de rechazo de contenido (uncensored). Está pensado para aplicaciones de red-teaming, investigación en seguridad y usos que requieran generar respuestas sin filtros de contenido. El modelo original es un transformer multimodal de 27 320 millones de parámetros, capaz de procesar texto e imágenes, con soporte para function calling y razonamiento multi-paso. La versión GGUF permite ejecutarlo en hardware de consumo mediante llama.cpp, Ollama o servidores compatibles. El repositorio está restringido (gated) y requiere aceptar condiciones de uso en HuggingFace. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + imagen), con soporte de MTP (multi-token prediction) |
| Parametros totales | 27 320 697 856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3.8-27B soporta 128 000 tokens, pero no se confirma en esta version) |
| Tipos de cuantizacion | varias (el repositorio contiene multiples archivos GGUF; no se detallan los tipos exactos) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer de 27 000 millones de parametros con atencion estandar, disenado para tareas multimodales (imagen y texto). Incorpora un proyector de vision (mmproj) y soporta prediccion multi-token (MTP), que mejora la velocidad de decodificacion. El proceso de "abliteration" aplicado por el autor elimina selectivamente las direcciones de activacion asociadas al rechazo de contenido, dando lugar a un modelo "uncensored" que responde sin las restricciones habituales de seguridad. No se dispone de informacion detallada sobre el dataset de entrenamiento original ni sobre el proceso de ajuste especifico de esta version. El etiquetado como "red-teaming" sugiere que esta pensado para pruebas de robustez y evaluacion de riesgos.

## Capacidades

- Generacion de texto libre en ingles y chino.
- Razonamiento multi-paso y resolucion de problemas complejos.
- Soporte de function calling / tool calling para integracion en agentes.
- Procesamiento de imagenes (image-text-to-text) para descripcion, analisis y respuesta a preguntas visuales.
- Capacidad de "uncensored": no rechaza peticiones de contenido sensible o controvertido (con los riesgos asociados).
- Compatible con el ecosistema GGUF (llama.cpp, Ollama, etc.).
- Etiquetado como apto para red-teaming y evaluacion de seguridad.

## Casos de uso

- Evaluacion de seguridad de modelos: permite a equipos de red-team probar la robustez de sistemas de moderacion generando respuestas sin filtros y comparandolas con modelos censurados.
- Investigacion academica sobre alineacion y sesgos: estudiar el comportamiento de un modelo sin restricciones de seguridad en entornos controlados.
- Generacion de contenido creativo sin limitaciones: escritura de ficcion, guiones o material satirico que requiera libertad tematica.
- Asistentes de codigo con function calling: integracion en pipelines de desarrollo donde se necesite que el modelo invoque herramientas externas (APIs, bases de datos) sin restricciones de contenido.
- Analisis de imagenes en dominios especializados: descripcion de imagenes tecnicas o medicas donde el modelo debe responder sin rechazar contenido por politica de seguridad.
- Pruebas de estres de sistemas de moderacion: generar entradas adversariales para evaluar la eficacia de clasificadores de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo GGUF, los requisitos de VRAM dependen del nivel de cuantizacion elegido. Para una cuantizacion Q4_K_M, se estima un uso de memoria de aproximadamente 15-16 GB, lo que permite ejecutarlo en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Para cuantizaciones mas altas (Q8, F16) se necesitan GPUs con 24 GB o mas, o el uso de CPU con suficiente RAM.
- Es compatible con llama.cpp, Ollama, LM Studio y servidores con backend llama.cpp (por ejemplo, llama-cpp-python).
- No se dispone de datos de latencia o throughput especificos para esta version.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables en la informacion proporcionada. Se podria comparar con el modelo base Qwen3.8-27B original (con censura) y con otras versiones "uncensored" de la comunidad, pero no hay datos cuantitativos disponibles.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o peligroso. Su uso debe limitarse a entornos controlados de investigacion y red-teaming.
- No se garantiza la exactitud de los hechos: el modelo puede alucinar informacion, especialmente en temas de actualidad o especializados.
- El acceso al repositorio esta restringido (gated) y requiere aceptar las condiciones de uso en HuggingFace.
- Aunque la licencia es Apache-2.0, el uso comercial puede estar sujeto a las politicas del modelo base Qwen (consulta los terminos de Qwen).
- La ventana de contexto no se ha confirmado en esta version; si es 128k, el rendimiento puede degradarse con contextos muy largos.
- El modelo solo soporta ingles y chino; no se garantiza un buen rendimiento en otros idiomas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
