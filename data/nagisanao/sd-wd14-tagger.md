# NagisaNao/sd-wd14-tagger

## Resumen

WD14 Tagger es una extensión para la interfaz web de Stable Diffusion (AUTOMATIC1111, Forge y Forge-Classic/Neo) que permite obtener etiquetas estilo booru (tags) de imágenes individuales o de directorios completos. El repositorio con ID `NagisaNao/sd-wd14-tagger` actúa como empaquetado de distribución de la extensión, no como un modelo de pesos en sí: la inferencia se delega a modelos ONNX y TensorFlow descargados desde Hugging Face y cacheados localmente.

La herramienta integra una familia amplia de clasificadores de etiquetado de imágenes de anime/ilustración: los modelos WD ViT v3, SwinV2 v3, ConvNeXT v3, ViT Large v3 y EVA02 Large v3, así como WD14 MOAT v2, SwinV2 v1, ConvNeXTV2 v1, ML-Danbooru CaFormer y TResNet-D, además de proyectos DeepDanbooru locales y modelos ONNX propios colocados en `models/TaggerOnnx/`.

Su relevancia es práctica: automatiza el etiquetado de datasets de imágenes para entrenamiento de modelos de difusión (LoRA, fine-tuning de SD) y permite generar prompts a partir de imágenes existentes. El repositorio no publica información sobre arquitectura propia, parámetros, licencia ni idiomas, por lo que los datos técnicos de esta ficha se limitan a lo declarado en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Extensión de software; delega en clasificadores de imagen ONNX (ViT, SwinV2, ConvNeXT, EVA02, MOAT, CaFormer, TResNet-D) y TensorFlow (DeepDanbooru) |
| Parametros totales | no disponible (depende del modelo de etiquetado seleccionado) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las etiquetas son términos booru en inglés por convención del dataset) |
| Licencia | no disponible |
| Formato de pesos | ONNX y TensorFlow (modelos remotos y locales); el repositorio en sí no contiene pesos publicados |

## Arquitectura y entrenamiento

El repositorio no entrena ni publica un modelo propio: es una capa de integración para Stable Diffusion WebUI escrita en Python (requiere Python 3.10 o superior) que orquesta la descarga, caché e inferencia de clasificadores de imagen preexistentes. La inferencia se ejecuta mediante `onnxruntime-gpu`, instalado automáticamente y sustituible mediante la variable de entorno `ONNXRUNTIME_PACKAGE`; para los modelos DeepDanbooru se requiere TensorFlow, que se instala en el primer uso.

Los clasificadores subyacentes (familia WD y ML-Danbooru) son redes de visión preentrenadas para clasificación multietiqueta sobre datasets de imágenes de anime etiquetadas con vocabulario booru. La model card no detalla volúmenes de datos de entrenamiento, composición del dataset, ni procesos de ajuste como RLHF o DPO, que además no aplican a este tipo de modelo. La innovación destacable es de ingeniería: compatibilidad simultánea con Gradio 3 y 4, descarga única de pesos desde Hugging Face con caché local persistente y soporte de modelos ONNX propios en `models/TaggerOnnx/`.

## Capacidades

- Etiquetado multietiqueta de imágenes de anime/ilustración con vocabulario booru (personajes, rasgos, composición, calidad).
- Interrogación de una imagen individual o de directorios completos en lote.
- Selección entre múltiples backbones de visión: ViT v3 (recomendado), SwinV2 v3, ConvNeXT v3, ViT Large v3, EVA02 Large v3, MOAT v2, SwinV2 v1, ConvNeXTV2 v1, CaFormer y TResNet-D.
- Soporte de proyectos DeepDanbooru locales en `models/deepdanbooru/`.
- Carga de modelos ONNX personalizados desde `models/TaggerOnnx/`.
- Integración con A1111, Forge y Forge-Classic/Neo sobre Gradio 3 y 4.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-step: es exclusivamente un clasificador de imagen a etiquetas.

## Casos de uso

- Etiquetado masivo de datasets para entrenamiento de LoRA: se apunta la extensión a un directorio de imágenes y se generan archivos de tags por imagen, listos para usarse como captions en el entrenamiento de modelos de difusión.
- Generación de prompts a partir de imágenes de referencia: el usuario sube una ilustración y obtiene un prompt booru que puede pegar directamente en la interfaz de Stable Diffusion para reproducir el estilo o la composición.
- Curación y limpieza de datasets: el etiquetado por lotes permite filtrar imágenes por atributos detectados (por ejemplo, descartar las que no contengan la etiqueta de personaje esperada) antes de entrenar.
- Búsqueda y organización de bibliotecas de imágenes: las etiquetas generadas permiten indexar y buscar ilustraciones por contenido sin metadatos manuales.
- Preprocesado en pipelines de investigación sobre modelos de difusión: la extensión actúa como paso previo automatizado para generar captions de forma reproducible con el backbone elegido (por ejemplo, EVA02 Large v3 para mayor capacidad).
- Comparación de clasificadores de etiquetado: al soportar diez backbones distintos, permite evaluar qué modelo produce etiquetas más útiles para un dominio concreto antes de fijar uno en producción.
- Automatización de flujos en Forge/A1111: combinada con scripts de la interfaz, permite interrogar imágenes dentro de flujos de img2img o de gestión de modelos sin salir de la UI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; al usar `onnxruntime-gpu`, la memoria depende del backbone seleccionado (los modelos ViT/SwinV2/ConvNeXT de la familia WD suelen ser ligeros, pero no se aportan cifras).
- GPU recomendadas: no disponible. El paquete instala `onnxruntime-gpu` por defecto, lo que implica soporte CUDA; puede sustituirse por otra variante mediante `ONNXRUNTIME_PACKAGE`.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; al ejecutarse dentro de Stable Diffusion WebUI, comparte GPU con el modelo de difusión, por lo que la VRAM libre es el factor limitante.
- Opciones de despliegue: extensión de AUTOMATIC1111, Forge y Forge-Classic/Neo; requiere Python 3.10+ y TensorFlow para los modelos DeepDanbooru.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Backbones soportados | Integración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NagisaNao/sd-wd14-tagger | Extensión WebUI | 10+ (WD v3, WD14, ML-Danbooru, DeepDanbooru) | A1111, Forge, Forge-Classic/Neo; Gradio 3 y 4 | no disponible | Hugging Face |
| Extensiones WD14 tagger para A1111 (genéricas) | Extensión WebUI | Subconjunto de la familia WD14 | Principalmente A1111 | varía según repositorio | GitHub |
| DeepDanbooru | Modelo de etiquetado | Arquitectura propia (TensorFlow) | CLI y scripts externos | no disponible en esta ficha | GitHub |
| ML-Danbooru (CaFormer/TResNet-D) | Modelos de etiquetado | Arquitecturas propias | Uso directo vía ONNX | no disponible en esta ficha | Hugging Face |

La comparativa se limita a categorías y disponibilidad; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no declara licencia; no se puede asumir uso comercial permitido sin consultar al autor y a los licenciantes de cada modelo subyacente (familia WD, ML-Danbooru, DeepDanbooru).
- El vocabulario de etiquetas es de estilo booru y está orientado a ilustración/anime; el rendimiento en fotografías reales u otros dominios no está documentado.
- No hay información sobre sesgos del etiquetador; como clasificador entrenado sobre datasets de anime, puede infrarrepresentar o etiquetar de forma estereotipada ciertos contenidos.
- Riesgo de etiquetas espurias o faltantes (falsos positivos y negativos) inherente a la clasificación multietiqueta; no se documentan métricas de precisión o recall.
- Dependencia de descargas remotas desde Hugging Face en el primer uso; en entornos sin red o con caché corrupta la extensión no funcionará hasta resolver la descarga.
- Requiere TensorFlow para DeepDanbooru, lo que añade una dependencia pesada y potenciales conflictos de versiones con el entorno de la WebUI.
- Compatibilidad declarada con Gradio 3 y 4, pero sin matriz de pruebas publicada por versión de WebUI.
- Creado y actualizado en noviembre de 2026 con 0 descargas y 0 likes: sin validación comunitaria ni historial de mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/NagisaNao/sd-wd14-tagger
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
