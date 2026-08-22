# Dinamus/thr3shr

## Resumen

THR3SHR es un proyecto de software completo, desarrollado por Dinamus, que implementa un flujo de trabajo local de etiquetado y organización de archivos multimedia (imágenes, GIF y vídeo) mediante modelos de visión por computadora especializados en contenido anime. No se trata de un modelo de IA entrenado desde cero, sino de una aplicación cliente-servidor que integra modelos de etiquetado existentes (ML-Danbooru y WD14 taggers) a través de la librería `dghs-imgutils` y los expone mediante una API FastAPI y una interfaz web React.

El proyecto resuelve el problema de clasificar y migrar grandes volúmenes de imágenes anime sin clasificar hacia carpetas de destino organizadas por etiquetas. Su relevancia actual radica en que combina inferencia ONNX con aceleración CUDA opcional, un sistema de revisión humana con umbrales de confianza configurables y soporte experimental para procesar GIF y vídeo, todo bajo licencia MIT. La arquitectura se compone de un backend en Python que gestiona la inferencia y la migración de archivos, y un frontend SPA que permite configurar, supervisar y revisar los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo unico; integra ML-Danbooru ONNX y WD14 taggers (SwinV2_v3, EVA02_Large) via dghs-imgutils |
| Parametros totales | No disponible (depende del tagger subyacente seleccionado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | ONNX (pesos descargados en el cache de Hugging Face Hub; cuantizacion no especificada) |
| Idiomas soportados | No disponible (vocabulario de etiquetas en `tags.csv`, idioma no especificado) |
| Licencia | MIT (software); CC BY 4.0 para materiales creativos y documentacion |
| Formato de pesos | ONNX (via dghs-imgutils, descargados desde Hugging Face Hub) |

## Arquitectura y entrenamiento

THR3SHR no es un modelo entrenado por el autor, sino un sistema de orquestacion que utiliza modelos de etiquetado preentrenados de terceros. La inferencia se realiza mediante ONNX Runtime, con soporte opcional para CUDA mediante los wheels `onnxruntime-gpu[cuda,cudnn]==1.26.0`. El backend expone tres opciones de tagger: WD14 SwinV2_v3 (por defecto), WD14 EVA02_Large (mas grande y lento) y ML-Danbooru (con tamaño de entrada de 448 píxeles). El sistema de clasificacion aplica reglas de asignacion basadas en umbrales de confianza configurados por el usuario: si la mejor puntuacion de una etiqueta seleccionada cae por debajo de un "noise floor" (`max(0.15, confidence_threshold * 0.5)`), se descarta como etiqueta primaria y se mantiene como sugerencia secundaria. El repositorio no almacena los pesos ONNX en el arbol de git por su tamano; se descargan al primer uso desde el cache de Hugging Face Hub.

## Capacidades

- Clasificacion de imagenes anime en un vocabulario amplio de etiquetas (definido en `tags.csv`).
- Etiquetado de GIF y video mediante muestreo multi-frame con filtrado de calidad y pooling de presencia (requiere al menos 2 frames corroborantes, presupuesto de etiquetado de hasta 48 frames, rechazo de frames negros o en blanco).
- Generacion de etiquetas primarias y secundarias por imagen, junto con un top-5 global de etiquetas para diagnostico de errores.
- Soporte de migracion de archivos (copiar o mover) entre carpetas de origen y destino.
- Inferencia en CPU o GPU (CUDA) con verificacion de disponibilidad real del proveedor (`CUDAExecutionProvider`).
- Configuracion de umbrales de confianza, numero de workers de inferencia y modo batch/single.
- Persistencia de configuracion en SQLite, incluyendo el modelo de tagger seleccionado para trazabilidad de resultados.
- Interfaz web con modo offline que simula el backend si no esta disponible.

## Casos de uso

- Organizacion de bibliotecas de imagenes anime: el flujo completo de escaneo, etiquetado, revision y migracion permite clasificar miles de imagenes sin clasificar en carpetas tematicas, reduciendo el trabajo manual de organizacion.
- Moderacion de contenido visual en comunidades de fans: los umbrales de confianza y el sistema de revision con top-5 global ayudan a detectar etiquetas erroneas o imagenes ambiguas antes de que se muevan a carpetas publicas.
- Preparacion de datasets de entrenamiento: el etiquetado automatico con revisión humana puede acelerar la creacion de conjuntos de datos etiquetados para entrenar modelos de vision especializados en anime.
- Archivado personal de GIF y clips de video: la funcionalidad experimental de muestreo multi-frame permite etiquetar contenido animado con un presupuesto de frames, aunque con calidad filtrada.
- Integración en pipelines de procesamiento de medios: al ser una API FastAPI, puede conectarse a otros sistemas (scripts, CRON, etc.) para automatizar el flujo de clasificacion sin interfaz grafica.
- Auditoria de contenido en repositorios de imagenes: la trazabilidad de cada run (que guarda el `tagger_model` y las etiquetas) permite auditar decisiones de clasificacion para cumplir requisitos de gobernanza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto no reporta metricas de precision, recall o velocidad de inferencia para los modelos de tagger integrados. El rendimiento depende del modelo de fondo seleccionado (SwinV2_v3, EVA02_Large o ML-Danbooru) y del hardware disponible, pero no se proporcionan datos cuantitativos.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del tagger de fondo y del tamano de imagen (ML-Danbooru usa 448x448, WD14 usa resoluciones variables).
- GPU recomendadas: cualquier GPU compatible con CUDA y cuDNN para ONNX Runtime; el proyecto recomienda verificar `cuda_usable: true` en `/health/providers` antes de confiar en la aceleracion.
- Compatibilidad con GPU de consumo: sí, en principio cualquier GPU NVIDIA con soporte CUDA deberia funcionar, aunque no se especifican minimos de VRAM.
- Opciones de despliegue: backend FastAPI (uvicorn) + frontend React (npm run dev); la inferencia se puede forzar en CPU con `FORCE_CPU_INFERENCE=true`.
- Latencia y throughput: no disponibles; el proyecto recomienda mantener `MAX_INFERENCE_WORKERS=2` porque la sesion de ONNX Runtime esta serializada bajo un lock.

## Comparativa con modelos similares

No disponible. THR3SHR no es un modelo de clasificacion en si, sino un sistema que integra modelos de terceros (ML-Danbooru, WD14). No se puede comparar directamente con modelos de clasificacion de imagenes genericos como ResNet o ViT, ni con otros sistemas de etiquetado de anime, ya que no se han publicado metricas comparativas en la informacion proporcionada.

## Limitaciones y advertencias

- El proyecto no incluye los pesos de los modelos ONNX en el repositorio; se descargan desde Hugging Face Hub en el primer uso, lo que requiere conexion a internet y puede fallar si el cache no esta disponible.
- La inferencia ONNX Runtime puede listar CUDA como proveedor pero caer en CPU en el primer Conv si las dependencias de cuDNN no estan correctamente instaladas; se requiere verificacion explicita via `/health/providers`.
- El modo experimental de etiquetado de GIF/video tiene requisitos estrictos (al menos 2 frames corroborantes, presupuesto de 48 frames, rechazo de frames negros) y puede dejar muchos archivos sin etiquetar si no cumplen el filtro de calidad.
- Los umbrales de confianza (`confidence_threshold`, `wd_general_threshold`) son configurables pero el ruido puede hacer que etiquetas validas se degraden a sugerencias secundarias si se configura un threshold demasiado alto.
- El software es de codigo abierto bajo MIT, pero los modelos de terceros integrados (ML-Danbooru, WD14) tienen sus propias licencias que deben consultarse en `ATTRIBUTION.md` para uso comercial.
- No se especifican limitaciones de idioma ni sesgos del vocabulario de etiquetas; el sistema depende del contenido de `tags.csv` y del comportamiento de los taggers de fondo.

## Enlaces

- HuggingFace: https://huggingface.co/Dinamus/thr3shr
- Perfil del autor: https://huggingface.co/Dinamus/models
- PromptHero (modelo Dinamus v3, no relacionado): https://prompthero.com/ai-models/dinamus-2171758-download/dinamus-v3
- Civitai (modelo Dinamus v3, no relacionado): https://civitai.com/models/2171758/dinamus?modelVersionId=2795535
- CivArchive (archivo de Civitai): https://civarchive.com/models/2171758?modelVersionId=2795535
