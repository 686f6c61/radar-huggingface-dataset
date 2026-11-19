# protos-photos/Qwen3.5-27B-4bit

## Resumen

Qwen3.5-27B-4bit es una cuantizacion a 4 bits en formato MLX del modelo multimodal Qwen3.5-27B, desarrollado originalmente por el equipo Qwen de Alibaba. Este repositorio concreto, publicado por el usuario protos-photos, es un espejo sin modificaciones del artefacto generado por mlx-community a partir de los pesos originales, y esta pensado para su ejecucion en hardware Apple Silicon mediante la libreria mlx-vlm. El modelo resuelve tareas de comprension de imagen y texto (image-text-to-text) y conversacion multimodal, con un total de 27.356.728.560 parametros.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de casi 27.000 millones de parametros en equipos con memoria unificada de Apple, algo inviable con los pesos en precision completa. El repositorio ocupa 16,1 GB, lo que da una idea directa del espacio en disco y de la memoria necesaria para cargar los pesos cuantizados.

No obstante, la informacion publicada es muy limitada: la model card es un texto minimo que remite a la model card original de Qwen, no se declaran idiomas soportados, no hay resultados de benchmarks y no se detalla la composicion del dataset de entrenamiento. Todo lo que no aparece en la informacion proporcionada se marca explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag de transformers: `qwen3_5`; el modelo base es multimodal image-text-to-text) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (formato MLX); no se detallan otras variantes en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 16,1 GB) |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo base Qwen3.5-27B. El tag `qwen3_5` y la pipeline `image-text-to-text` indican que se trata de un transformer multimodal capaz de procesar imagenes y texto, pero no se especifica si emplea atencion completa, atencion lineal, mezcla de expertos (MoE) ni ninguna otra innovacion concreta. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Lo unico documentado es el proceso de conversion: mlx-community genero estos pesos a partir de `Qwen/Qwen3.5-27B` usando mlx-vlm version 0.3.12, y protos-photos publica un espejo identico en la revision `45797d2985a12c55e6473686e9ea91b95e959553`. Para conocer la arquitectura y el entrenamiento reales hay que consultar la model card del modelo original de Qwen, que no forma parte de la informacion disponible en esta busqueda.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational`.
- Comprension de imagenes combinada con texto (pipeline `image-text-to-text`): descripcion de imagenes, respuesta a preguntas sobre contenido visual.
- Ejecucion local en Apple Silicon mediante mlx-vlm, con un ejemplo oficial de generacion condicionada por imagen.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Soporte de tool calling, function calling, agentes, modo thinking, audio o matematicas: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.

## Casos de uso

- Descripcion y etiquetado de imagenes en local: usar `mlx_vlm.generate` con una ruta de imagen para obtener descripciones en lenguaje natural sin enviar datos a la nube, gracias a que los pesos caben en memoria unificada de equipos Apple de gama alta.
- Asistentes conversacionales multimodales en prototipado: el tag `conversational` y la pipeline image-text-to-text permiten construir demos de chat que aceptan capturas o fotos como entrada.
- Procesamiento de documentos escaneados en estaciones de trabajo macOS: extraccion de informacion de capturas o imagenes de documentos mediante prompts de texto e imagen.
- Evaluacion e investigacion de cuantizacion: comparar el comportamiento del modelo en 4 bits MLX frente a los pesos originales para estudiar la perdida de calidad en tareas visuales.
- Automatizacion de accesibilidad: generacion de texto alternativo para imagenes en flujos de publicacion, ejecutado en local.
- Pruebas de pipelines de inferencia en MLX: validar integraciones con mlx-vlm y medir consumo de memoria y latencia antes de desplegar variantes mayores.
- Uso educativo y experimentacion: al ser licencia Apache 2.0, permite modificar y redistribuir derivados con atribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el repositorio de pesos ocupa 16,1 GB; se necesita al menos esa cantidad de memoria unificada mas el espacio para el contexto y las activaciones, por lo que en la practica conviene disponer de 24 GB o mas.
- Hardware objetivo: Apple Silicon con memoria unificada amplia (por ejemplo, configuraciones de 32 GB o superiores); no esta pensado para GPUs NVIDIA, ya que el formato es MLX.
- GPU consumer: no aplica en el sentido tradicional; en equipos Apple el limite es la memoria unificada del chip.
- Despliegue: mlx-vlm (version 0.3.12 o superior segun la model card); vLLM, llama.cpp, Ollama o TGI no se mencionan como soportados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-27B-4bit (este repo) | 27,36 B | no disponible | MLX 4-bit | Apache 2.0 | Espejo de mlx-community, orientado a Apple Silicon |
| Qwen/Qwen3.5-27B | 27,36 B (segun este repo) | no disponible | safetensors originales | Apache 2.0 | Modelo base del que deriva esta cuantizacion |
| mlx-community/Qwen3.5-27B-4bit | 27,36 B | no disponible | MLX 4-bit | Apache 2.0 | Artefacto original; este repo es una copia identica |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con otras alternativas.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar la precision en tareas visuales y de razonamiento frente a los pesos originales; no se han publicado evaluaciones que cuantifiquen esa perdida.
- No se declaran idiomas soportados, por lo que el comportamiento multilingue es incierto.
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- La longitud de contexto no esta documentada; planificar el uso con margenes conservadores.
- El formato MLX limita el despliegue a entornos Apple; no es portable a CUDA sin reconversion.
- Aunque la licencia es Apache 2.0, se recomienda revisar la licencia del modelo original enlazada en la model card antes de un uso comercial.
- Este repositorio es un espejo de terceros con 0 descargas y 0 likes; conviene verificar la integridad de los pesos frente al artefacto original de mlx-community.
- No se detallan requisitos de version de transformers ni de mlx-vlm mas alla de la 0.3.12 usada en la conversion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/protos-photos/Qwen3.5-27B-4bit
- Artefacto original espejado: https://huggingface.co/mlx-community/Qwen3.5-27B-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia original: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
