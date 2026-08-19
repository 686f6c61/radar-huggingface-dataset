# kaidjuric/muscriptor-amt-space

## Resumen

MuScriptor es un modelo de transcripción musical automática multi-instrumento desarrollado por Kyutai y Mirelo, presentado como el primer sistema de este tipo entrenado a gran escala con 170 000 canciones que abarcan desde música clásica hasta heavy metal. El espacio `kaidjuric/muscriptor-amt-space` es una demo interactiva construida con Gradio que permite subir cualquier archivo de audio y obtener una transcripción en formato MIDI, una imagen de piano roll y, cuando es posible, un archivo MusicXML para edición en programas de notación musical.

El modelo tiene aproximadamente 1 300 millones de parámetros y emplea un enfoque de post-entrenamiento con aprendizaje por refuerzo para refinar las transcripciones. Su relevancia actual radica en que ofrece una solución de código abierto para una tarea tradicionalmente compleja, con capacidad para manejar múltiples instrumentos y géneros musicales diversos, lo que lo convierte en una herramienta útil para músicos, productores e investigadores.

El espacio en HuggingFace actúa como interfaz de demostración, pero el modelo subyacente está disponible por separado con pesos bajo licencia CC BY-NC 4.0 (acceso restringido), mientras que el código de inferencia se distribuye bajo MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | ~1,3 mil millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (contexto de audio, no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada de audio, salida MIDI) |
| Licencia | Codigo de inferencia MIT; pesos del modelo CC BY-NC 4.0 (gated) |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

No se han publicado detalles específicos sobre la arquitectura interna del modelo en la información disponible. Se sabe que es un modelo de transcripción musical automática multi-instrumento con aproximadamente 1 300 millones de parámetros, entrenado sobre un conjunto de datos de 170 000 canciones que incluye tanto audio sintético como grabaciones reales con anotaciones de notas alineadas. El proceso de entrenamiento incluye una fase de post-entrenamiento mediante aprendizaje por refuerzo, según se indica en el artículo técnico. También se menciona la introducción de condicionamiento sobre la presencia de instrumentos para personalizar las transcripciones, aunque no se detalla el mecanismo exacto.

## Capacidades

- Transcripción automática de audio a MIDI con múltiples instrumentos simultáneos.
- Generación de piano roll en formato PNG como visualización de la transcripción.
- Exportación de archivos MIDI descargables.
- Generación de MusicXML cuando la transcripción lo permite, para su uso en programas de edición de partituras.
- Manejo de una amplia variedad de géneros musicales, desde música clásica hasta heavy metal.
- Condicionamiento opcional sobre la presencia de instrumentos para adaptar la salida (según el paper).
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- Transcripción de partituras para músicos: un intérprete puede subir una grabación de su instrumento y obtener una partitura en MusicXML para estudiar o arreglar la pieza.
- Producción musical y remezcla: los productores pueden convertir pistas de audio existentes en MIDI para editar notas, cambiar instrumentos o crear versiones alternativas.
- Educación musical: los profesores pueden utilizar la transcripción automática para mostrar a los estudiantes la notación de piezas interpretadas, facilitando el análisis armónico y melódico.
- Restauración de grabaciones antiguas: al convertir grabaciones históricas a MIDI, se pueden reconstruir partituras o crear versiones digitales limpias.
- Investigación en musicología: los investigadores pueden analizar grandes corpus de audio transcrito para estudiar patrones estilísticos, evolución de géneros o prácticas interpretativas.
- Creación de contenido accesible: la transcripción a MIDI permite generar versiones braille o simplificadas de obras musicales para personas con discapacidad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo técnico menciona evaluaciones, pero no se proporcionan cifras concretas en los materiales consultados.

## Requisitos de hardware

- No se dispone de datos específicos sobre requisitos de VRAM, GPU recomendadas o latencia.
- El espacio de HuggingFace es una demo Gradio que probablemente se ejecuta en infraestructura ligera, pero no se especifican los recursos.
- Dado el tamaño del modelo (~1,3 B parámetros), una inferencia en FP16 requeriría aproximadamente 2,6 GB de VRAM solo para los pesos, más memoria para activaciones y procesamiento de audio. Sin embargo, no se confirma si el espacio utiliza cuantización u optimizaciones.
- Para despliegue local, se podría usar vLLM, llama.cpp u otras herramientas, pero no hay documentación oficial al respecto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (transcripción musical multi-instrumento) dentro de los materiales consultados. No se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- Los pesos del modelo están bajo licencia CC BY-NC 4.0, lo que restringe su uso comercial. El acceso es gated, es decir, requiere solicitud y aprobación por parte de los desarrolladores.
- El código de inferencia es MIT, pero el modelo en sí no es de uso libre para fines comerciales.
- La transcripción automática puede presentar errores en pasajes complejos, con muchos instrumentos superpuestos o en grabaciones de baja calidad.
- No se especifican limitaciones de idioma, pero al ser un modelo de audio, no procesa texto.
- No hay información sobre sesgos o alucinaciones, aunque en el contexto musical la alucinación podría manifestarse como notas o instrumentos inexistentes en la transcripción.
- El espacio de demostración tiene un tamaño de repositorio de 0,2 GB, lo que sugiere que no incluye los pesos completos del modelo, sino que probablemente carga el modelo desde un repositorio externo o utiliza una versión cuantizada.

## Enlaces

- Espacio de HuggingFace: https://huggingface.co/kaidjuric/muscriptor-amt-space
- Repositorio GitHub del modelo: https://github.com/muscriptor/muscriptor
- Página del proyecto: https://muscriptor.github.io/
- Artículo técnico (arXiv): https://arxiv.org/html/2607.08168v1
- Colección de Kyutai en HuggingFace: https://huggingface.co/collections/kyutai/muscriptor
- Espacio alternativo de demostración: https://huggingface.co/spaces/hugging-apps/muscriptor-music-transcription
