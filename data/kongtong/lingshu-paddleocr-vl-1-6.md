# kongtong/lingshu-paddleocr-vl-1.6

## Resumen

Lingshu-PaddleOCR-VL-1.6 es un modelo de vision-lenguaje (image-text-to-text) publicado por el usuario kongtong en Hugging Face. Se distribuye en formato MLX, la libreria de Apple para ejecutar modelos de aprendizaje automatico de forma nativa sobre el silicio de la compania (chips de la serie M), y esta etiquetado como `paddleocr_vl`, lo que sugiere que deriva del modelo PaddleOCR-VL del ecosistema PaddlePaddle, orientado a tareas de reconocimiento optico de caracteres y comprension de documentos.

El repositorio contiene un unico conjunto de pesos en safetensors con 905.601.648 parametros (aproximadamente 0,9 mil millones), lo que lo situa en la categoria de modelos pequenos de vision-lenguaje, adecuados para inferencia en hardware de consumo. El tamano total del repositorio es de 0,7 GB, coherente con una cuantizacion de 4 bits indicada en las etiquetas del modelo.

La relevancia de esta publicacion es limitada pero concreta: ofrece una via para ejecutar un modelo de OCR y comprension de documentos sobre Macs con chip Apple Silicon mediante MLX, sin depender de CUDA ni de GPUs dedicadas. La model card es practicamente vacia (solo declara `language: en`, `library_name: mlx` y `pipeline_tag: image-text-to-text`), por lo que la mayor parte de las especificaciones no estan documentadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `paddleocr_vl`, sin detalle en la model card) |
| Parametros totales | 905.601.648 (segun safetensors) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (segun etiquetas del repositorio) |
| Idiomas soportados | en (segun metadatos) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX, tag `mlx`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, los datos de entrenamiento, el numero de tokens utilizados ni el proceso de alineacion (RLHF, DPO u otros). La model card no incluye ninguna seccion tecnica: unicamente declara el idioma (`en`), la libreria (`mlx`) y la tarea (`image-text-to-text`).

Las etiquetas del repositorio aportan dos pistas: `paddleocr_vl` sugiere una adaptacion o conversion del modelo PaddleOCR-VL, especializado en OCR y comprension de documentos, y `custom_code` indica que la carga del modelo requiere codigo personalizado incluido en el repositorio (habitual en conversiones a MLX que necesitan definir capas o utilidades especificas). No hay informacion verificable sobre innovaciones tecnicas como atencion lineal, decodificacion especulativa o modos de razonamiento extendido.

## Capacidades

- Generacion de texto a partir de imagenes (image-text-to-text): el pipeline declarado es la conversion de imagenes en texto, lo que encaja con tareas de OCR y descripcion de contenido visual.
- Reconocimiento optico de caracteres: la etiqueta `paddleocr_vl` apunta a capacidades de extraccion de texto en imagenes y documentos.
- Conversacion multimodal: la etiqueta `conversational` indica soporte de dialogos multi-turno con entrada de imagen.
- Ejecucion nativa en Apple Silicon mediante MLX.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: los metadatos solo declaran ingles (`en`).
- Capacidades especiales (modo thinking, audio, vision adicional): solo se confirma vision por la tarea declarada; el resto no disponible.

## Casos de uso

- Digitalizacion de documentos en macOS: el modelo puede procesar imagenes de facturas, formularios o paginas escaneadas y devolver el texto reconocido, ejecutandose de forma local en un Mac con chip M gracias al formato MLX.
- Extraccion de texto en aplicaciones de escritorio: integracion en herramientas nativas de macOS que necesiten OCR sin enviar imagenes a servicios en la nube, con los beneficios de privacidad que ello implica.
- Procesamiento por lotes de archivos escaneados: al tratarse de un modelo de menos de mil millones de parametros en 4 bits (0,7 GB de pesos), es viable ejecutarlo sobre lotes de imagenes en un portatil sin GPU dedicada.
- Asistentes conversacionales sobre documentos: la etiqueta `conversational` permite construir un flujo en el que el usuario sube una imagen y mantiene una conversacion sobre su contenido, siempre que el contexto lo permita (longitud no documentada).
- Prototipado rapido de pipelines de vision-lenguaje en MLX: util para desarrolladores que quieran validar una arquitectura de OCR multimodal en Apple Silicon antes de migrar a produccion en otros entornos.
- Automatizacion de accesibilidad: generacion de descripciones textuales de imagenes o lectura de documentos para usuarios con discapacidad visual, ejecutada localmente en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al estar cuantizado en 4 bits y pesar 0,7 GB en el repositorio, la inferencia requiere del orden de 1-2 GB de memoria unificada, aunque esta cifra es una estimacion a partir del tamano de los pesos y no un dato publicado por el autor.
- GPU recomendadas: al ser un modelo MLX, el hardware objetivo son los chips de Apple (series M1, M2, M3, M4 y posteriores). No se documenta soporte para GPUs NVIDIA (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon; el tamano de pesos (0,7 GB) es compatible incluso con configuraciones de memoria unificada de 8 GB.
- Opciones de despliegue: MLX (libreria declarada). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Lingshu-PaddleOCR-VL-1.6 | ~0,9 B | no disponible | no disponible | MLX, 4-bit | Conversion orientada a Apple Silicon |
| PaddleOCR-VL (original) | no disponible en la informacion | no disponible | no disponible | no disponible | Modelo de referencia del que parece derivar |
| Otros VLM pequenos para OCR | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables para comparar |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa fiable con alternativas concretas.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre arquitectura, entrenamiento, contexto ni evaluacion, lo que impide valorar su calidad de forma rigurosa.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Idiomas: los metadatos solo declaran ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion: como todo modelo generativo de vision-lenguaje, puede producir texto inexistente en la imagen, especialmente en documentos con baja calidad o tipografias complejas; no se han publicado evaluaciones al respecto.
- Sesgos: no se documenta ninguna evaluacion de sesgos.
- Dependencia de plataforma: el formato MLX limita su uso a hardware Apple; no es portable directamente a CUDA sin conversion.
- Codigo personalizado: la etiqueta `custom_code` implica que la carga requiere confiar en el codigo incluido en el repositorio, lo que anade un riesgo de seguridad que debe revisarse antes de ejecutarlo.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kongtong/lingshu-paddleocr-vl-1.6
- Repositorio de MLX: https://github.com/ml-explore/mlx
- PaddleOCR (proyecto del que parece derivar la etiqueta `paddleocr_vl`): https://github.com/PaddlePaddle/PaddleOCR
