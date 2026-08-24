# psilab/ai-content-hub-release

## Resumen

El repositorio `psilab/ai-content-hub-release` alojado en Hugging Face no contiene un modelo de inteligencia artificial, sino una aplicación de escritorio denominada PSI AI Content Hub, desarrollada por el laboratorio vietnamita PSI Lab. Se trata de una herramienta integral para Windows que combina múltiples modelos de IA de código abierto (F5-TTS, Whisper, NLLB-200, CLIP, entre otros) con utilidades de procesamiento de medios, orientada a creadores de contenido y automatización de tareas audiovisuales.

La aplicación resuelve problemas prácticos como la conversión de noticias en vídeo, la clonación de voz, la eliminación de fondos, la descarga masiva de vídeos y la generación de subtítulos sincronizados. Su relevancia actual radica en la creciente demanda de herramientas que integren IA generativa y edición de medios en un flujo de trabajo unificado, sin necesidad de conocimientos técnicos profundos.

El repositorio tiene un tamaño de 178.4 GB, lo que sugiere que incluye pesos de modelos, dependencias o datos de ejemplo, aunque no se especifica su contenido exacto. No se dispone de información sobre licencia, pipeline o idiomas soportados en la ficha de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (aplicación, no modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (la interfaz está en vietnamita e inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de código y datos) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de una aplicación de escritorio que integra varios modelos de IA preentrenados. Entre los componentes mencionados en la documentación se encuentran:

- **F5-TTS**: para clonación de voz y síntesis de voz.
- **Whisper**: para transcripción de audio (speech-to-text).
- **NLLB-200**: para traducción multilingüe.
- **CLIP**: para búsqueda semántica de imágenes.

La aplicación está construida con un frontend en Node.js/Electron y un backend en Python (módulos `app-6901` y `F5-TTS`). No se proporcionan detalles sobre el entrenamiento de estos modelos subyacentes, ya que son externos y de código abierto.

## Capacidades

- **Conversión de noticias a vídeo**: a partir de una URL de artículo, genera un clip de vídeo con locución y subtítulos.
- **Karaoke automático**: separa voces de la música y genera subtítulos sincronizados con el ritmo.
- **Descarga y procesamiento por lotes**: descarga listas de reproducción de YouTube y otros sitios, con conversión de formato, corte y unión.
- **Clonación de voz**: replica una voz a partir de unos segundos de muestra (mediante F5-TTS) y la usa para doblaje.
- **Eliminación de fondos**: en imágenes y vídeos, sin necesidad de herramientas externas.
- **Texto a voz**: síntesis de voz en vietnamita y más de 100 idiomas.
- **Transcripción de audio**: alta precisión con Whisper.
- **Traducción automática**: multilingüe con NLLB-200.
- **Búsqueda semántica de imágenes**: mediante CLIP.
- **Herramientas de imagen**: upscaling, generación de logos y miniaturas en lote.
- **Scraping de noticias**: automatización de recopilación de contenido.
- **Escritura de contenido**: asistida por LLM.

## Casos de uso

- **Automatización de canales de noticias**: un medio puede pegar la URL de un artículo y obtener un vídeo narrado en minutos, reduciendo el tiempo de producción de contenido audiovisual.
- **Doblaje de vídeos extranjeros**: con la clonación de voz, se puede sustituir la pista de audio original por una voz clonada en otro idioma, manteniendo la entonación del locutor original.
- **Creación de vídeos de karaoke**: los usuarios pueden generar pistas de karaoke a partir de canciones, separando voces y añadiendo subtítulos sincronizados automáticamente.
- **Gestión de contenido para redes sociales**: el pipeline de reup (descargar, eliminar fondo, añadir logo, exportar) permite preparar vídeos para plataformas como TikTok o YouTube de forma masiva.
- **Producción de material educativo**: transcripción de clases o conferencias con Whisper, traducción con NLLB-200 y generación de subtítulos para vídeos.
- **Archivo y búsqueda de medios**: mediante CLIP, se pueden indexar imágenes por contenido semántico, facilitando la búsqueda en bibliotecas de medios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser una aplicación que integra múltiples modelos, el rendimiento depende de los modelos subyacentes (F5-TTS, Whisper, etc.) y del hardware utilizado.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Depende de los modelos cargados; por ejemplo, Whisper y CLIP pueden ejecutarse en GPUs con 8-16 GB de VRAM, mientras que F5-TTS puede requerir más.
- **GPU recomendadas**: no especificadas. Se sugiere una GPU NVIDIA con al menos 8 GB de VRAM para un funcionamiento fluido, aunque no se confirma.
- **Compatibilidad con GPU de consumo**: probablemente sí, dado que los modelos mencionados son ejecutables en GPUs como RTX 3060 o superiores, pero no hay datos oficiales.
- **Opciones de despliegue**: aplicación de escritorio para Windows; no se menciona soporte para servidores o contenedores.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No aplica, ya que no es un modelo de IA sino una aplicación que integra varios. No se dispone de alternativas comparables en el mismo formato.

## Limitaciones y advertencias

- **No es un modelo**: no se puede evaluar como tal; es una aplicación de escritorio con dependencias de múltiples modelos externos.
- **Plataforma**: solo Windows; no hay versiones para macOS o Linux.
- **Licencia**: no especificada; el uso comercial puede estar restringido por las licencias de los modelos integrados (por ejemplo, F5-TTS, Whisper, NLLB-200 tienen licencias propias).
- **Idiomas**: la interfaz está en vietnamita e inglés; no hay soporte oficial para español.
- **Riesgo de alucinación**: inherente a los modelos de lenguaje y TTS utilizados; la generación de contenido puede producir errores factuales o de pronunciación.
- **Dependencia de servicios externos**: la descarga de vídeos de YouTube y otros sitios puede violar términos de servicio.
- **Tamaño del repositorio**: 178.4 GB, lo que implica una descarga pesada y posibles problemas de almacenamiento.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/psilab/ai-content-hub-release)
- [Repositorio en GitHub](https://github.com/psilabvnorg/psi-ai-content-hub)
- [Página de releases en GitHub](https://github.com/psilabvnorg/psi-ai-content-hub/releases)
- [Sitio web del proyecto](https://psihub.me)
