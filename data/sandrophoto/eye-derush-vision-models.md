# sandrophoto/eye-derush-vision-models

## Resumen

Eye Derush vision models es una redistribución empaquetada de tres modelos vision-lenguaje de la familia Qwen3-VL (4B, 8B y 32B, todos en variante Instruct) convertidos a MLX en cuantización de 8 bits. El autor, sandrophoto, publica estos pesos como archivos Apple Archive (`.aar`) para que la aplicación macOS Eye Derush pueda descargarlos, verificar su integridad mediante SHA-256 y ejecutar tareas de descripción y resumen de material de rodaje (rushes) íntegramente en local, sin enviar imágenes, transcripciones ni resúmenes a ningún servidor.

El repositorio no aporta pesos nuevos ni fine-tuning propio: los archivos son las conversiones de mlx-community de los modelos Qwen3-VL-4B-Instruct, Qwen3-VL-8B-Instruct y Qwen3-VL-32B-Instruct, redistribuidas sin modificar junto con configuración y tokenizer. La relevancia práctica está en el formato de distribución: un único archivo por modelo, con requisitos de memoria declarados (7 GB, 12 GB y 40 GB respectivamente) y pensado para el stack MLX de Apple Silicon, lo que simplifica el despliegue de inferencia multimodal privada en Mac.

Al tratarse de una redistribución, las capacidades, arquitectura y limitaciones son las de los modelos Qwen3-VL subyacentes; la model card no documenta datos de entrenamiento, benchmarks ni idiomas soportados, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los pesos derivan de Qwen3-VL; la model card no detalla la arquitectura interna) |
| Parametros totales | tres variantes: 4B, 8B y 32B |
| Parametros activos | no disponible (no se indica que sean modelos MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX 8-bit); no se listan otras precisiones en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Apple Archive (`.aar`) que contiene pesos MLX 8-bit, configuración y tokenizer; no se publican safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

No hay información en la model card sobre la arquitectura interna de los modelos Qwen3-VL redistribuidos (tipo de transformer, mecanismo de atención, tratamiento de la entrada visual, etc.). Lo único documentado es el pipeline `image-text-to-text` y la procedencia: conversiones MLX de mlx-community a partir de Qwen3-VL-4B-Instruct, Qwen3-VL-8B-Instruct y Qwen3-VL-32B-Instruct, empaquetadas sin cambios en archivos `.aar` junto con configuración y tokenizer.

Tampoco se detallan datos de entrenamiento (número de tokens, composición del corpus, fases de alineación como RLHF o DPO) ni innovaciones técnicas específicas. Cualquier afirmación sobre estos puntos requeriría consultar las model cards originales de Qwen3-VL, que no forman parte de la información proporcionada.

## Capacidades

- Generación de texto e imagen-a-texto: el pipeline declarado es `image-text-to-text`, orientado a describir y resumir contenido visual.
- Descripción y resumen de material de rodaje (rushes de vídeo) mediante el análisis de fotogramas, que es el caso de uso declarado por la app Eye Derush.
- Procesamiento totalmente local: imágenes, transcripciones y resúmenes permanecen en el equipo, sin envío a servicios externos.
- Tres perfiles de capacidad/recursos seleccionables (4B, 8B, 32B) para ajustar el modelo al hardware disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Descripción automática de rushes en macOS: la app Eye Derush usa estos modelos para generar descripciones de fotogramas o clips, con la ventaja de que el material no sale del equipo, algo crítico en producciones con acuerdos de confidencialidad.
- Resumen de material rodado antes de montaje: el modelo puede condensar el contenido de una sesión de grabación para que el editor localice tomas relevantes sin revisar todo el metraje, ejecutándose en local con 7-40 GB de memoria según la variante elegida.
- Catalogación y etiquetado de archivos audiovisuales: generación de metadatos textuales (escenas, objetos, acciones) para organizar una videoteca privada sin depender de APIs en la nube.
- Flujos de trabajo en entornos sin conectividad o con restricciones de red: al empaquetarse como archivos descargables con verificación SHA-256, el modelo puede instalarse una vez y operar offline en estaciones de trabajo aisladas.
- Prototipado de aplicaciones macOS multimodales: los archivos MLX 8-bit sirven como base para desarrolladores que quieran integrar un VLM en una app nativa de Apple Silicon sin gestionar conversiones propias.
- Evaluación comparativa de tamaños en hardware Apple: disponer de 4B, 8B y 32B en el mismo formato permite medir el equilibrio entre calidad de descripción y consumo de memoria (7, 12 y 40 GB) en un mismo Mac.
- Asistencia a la transcripción y documentación de entrevistas grabadas: combinado con la transcripción que menciona la app, el modelo puede resumir el contenido visual de una entrevista para generar notas de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria necesaria declarada por el autor: aproximadamente 7 GB para la variante 4B, 12 GB para la 8B y 40 GB para la 32B (pesos MLX 8-bit más overhead de ejecución).
- Hardware objetivo: equipos Apple Silicon con macOS, dado que el formato es MLX y los archivos son Apple Archive.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable según la información disponible; el repo está orientado al stack MLX de Apple, no a CUDA.
- Viabilidad en hardware de consumo: las variantes 4B y 8B encajan en Mac con 16 GB o más de memoria unificada; la 32B requiere configuraciones de gama alta (del orden de 48 GB o más de memoria unificada).
- Opciones de despliegue: la app Eye Derush como consumidor previsto; para uso general, el stack MLX (mlx-lm / mlx-vlm) sobre los modelos originales de mlx-community. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con estos archivos `.aar`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Eye Derush vision models (este repo) | 4B / 8B / 32B | no disponible | Apple Archive con MLX 8-bit | Apache 2.0 | Redistribución empaquetada para macOS; sin benchmarks propios |
| Qwen3-VL-4B/8B/32B-Instruct (original) | 4B / 8B / 32B | no disponible en esta ficha | safetensors (formato habitual de Qwen) | Apache 2.0 | Modelos base; misma capacidad, sin empaquetado MLX |
| mlx-community Qwen3-VL-*-8bit | 4B / 8B / 32B | no disponible en esta ficha | MLX 8-bit | Apache 2.0 | Origen directo de los pesos aquí redistribuidos |

La comparación con otras familias de VLM (por ejemplo, otros modelos imagen-texto de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo ni un fine-tuning: los pesos son conversiones MLX de terceros redistribuidas; cualquier limitación de Qwen3-VL aplica sin cambios.
- La model card no documenta sesgos, tasas de alucinación, idiomas soportados ni evaluación de calidad; no hay base para garantizar un comportamiento concreto en producción.
- La cuantización a 8 bits puede degradar ligeramente la precisión respecto a los pesos originales en precisión completa; no se aportan mediciones de esa degradación.
- El formato `.aar` con pesos MLX limita el uso a macOS sobre Apple Silicon; no es portable a CUDA ni a herramientas estándar como llama.cpp o vLLM.
- Los requisitos de memoria son elevados en la variante 32B (unos 40 GB), lo que restringe su uso a equipos de gama alta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado y actualizado el mismo día, por lo que no hay evidencia de uso ni validación comunitaria.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos base Qwen3-VL y de las conversiones de mlx-community, así como la ausencia de afiliación con Alibaba Cloud o Apple que el propio autor declara.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sandrophoto/eye-derush-vision-models
- Conversión MLX 4B: https://huggingface.co/mlx-community/Qwen3-VL-4B-Instruct-8bit
- Conversión MLX 8B: https://huggingface.co/mlx-community/Qwen3-VL-8B-Instruct-8bit
- Conversión MLX 32B: https://huggingface.co/mlx-community/Qwen3-VL-32B-Instruct-8bit
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Modelo base Qwen3-VL-32B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
