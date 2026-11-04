# Ironleo78/IronLeo78-MTV

## Resumen

IronLeo78-MTV es un repositorio de pesos para el node pack homónimo de ComfyUI, orientado a la generación automática de videoclips musicales a partir de una canción propia. No se trata de un modelo único, sino de una colección de artefactos: un modelo de difusión principal creado por el autor (`IronLeo78_R2V4Vendetta_.safetensors`), un upscaler latente (`h3_upscaler_lms_v0.1.safetensors`), una copia de respaldo del VAE de vídeo de Kijai en int8 y un LLM "Casting" derivado de Qwen3-VL-4B-Instruct abliterado, también en int8. Los pesos oficiales de LTX y MiniMax H3 no se alojan aquí y deben descargarse desde sus fuentes originales.

El paquete se apoya en MiniMax H3 como motor de generación de vídeo y audio, y en LTX 2.5 para tareas auxiliares del pipeline. La propuesta es relevante para desarrolladores que quieran montar un flujo de producción de vídeo musical dentro de ComfyUI sin tener que orquestar manualmente los distintos modelos: el node pack fija los nombres de archivo y espera una estructura de carpetas concreta bajo `models/`.

El repositorio ocupa 39,8 GB y está liberado bajo licencia MIT para los archivos propios del autor. Al no publicarse parámetros, contexto ni datos de entrenamiento, la información técnica disponible es limitada y se detalla a continuación con las salvedades correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para vídeo; el Casting LLM deriva de Qwen3-VL-4B-Instruct) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (VAE de vídeo y Casting LLM); precisión del modelo de difusión principal no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (archivos propios); los modelos de terceros conservan sus licencias originales |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo de difusión principal `IronLeo78_R2V4Vendetta_.safetensors` ni los datos, número de tokens o método de entrenamiento empleados. Por el contexto del node pack (generación de vídeo con MiniMax H3 y LTX 2.5), se trata de un modelo de difusión orientado a vídeo, presumiblemente con capacidad de condicionamiento por referencia (Ref2V, según la plantilla de ComfyUI citada), pero no se especifican detalles de atención, tipo de transformer ni estrategia de decodificación.

El resto de componentes son auxiliares: un upscaler latente (`h3_upscaler_lms_v0.1.safetensors`) que actúa en el nodo de postproducción, un VAE de vídeo en int8 (copia de respaldo del original de Kijai) y un LLM Casting derivado de `Huihui-Qwen3-VL-4B-Instruct-abliterated-int8_convrot`, que se usa como redactor de prompts. No hay información sobre RLHF, DPO ni innovaciones técnicas destacables más allá del propio pipeline.

## Capacidades

- Generación de vídeo musical a partir de una canción, clip a clip, orquestada por el node pack de ComfyUI.
- Uso de MiniMax H3 como motor subyacente de vídeo y audio (pesos no incluidos en este repositorio).
- Escalado latente de los clips generados mediante el upscaler incluido.
- Redacción automática de prompts mediante el Casting LLM (Qwen3-VL-4B abliterado en int8).
- Condicionamiento por referencia de vídeo (Ref2V) según la plantilla oficial de ComfyUI citada.
- Integración con las plantillas LTX 2.5 y MiniMax H3 Ref2V de ComfyUI.
- Soporte de tool calling, agentes, matemáticas, visión general o audio: no disponible.

## Casos de uso

- Producción de videoclips musicales: el pipeline convierte una canción en una secuencia de clips generados con MiniMax H3 y los ensambla mediante el node pack, adecuado para artistas y creadores que trabajan dentro de ComfyUI.
- Prototipado rápido de vídeo musical: al fijar los nombres de archivo y las carpetas, el flujo se reproduce de forma determinista en cualquier instalación de ComfyUI, lo que facilita pruebas repetibles.
- Postproducción de clips generados: el upscaler latente eleva la resolución de los fotogramas sin salir del grafo, útil para entregables de mayor calidad.
- Generación de prompts asistida: el Casting LLM redacta descripciones de escena a partir de la letra o la idea del usuario, reduciendo el trabajo manual de prompting.
- Integración en estudios pequeños: al ser MIT y ejecutarse en ComfyUI, se puede incorporar a flujos internos de creación de contenido sin coste de licencia para los archivos propios.
- Recuperación ante cambios upstream: el repositorio mantiene una copia de respaldo del VAE de Kijai, lo que permite seguir operando si la fuente original desaparece o cambia.
- Investigación sobre pipelines multimodelo: sirve como ejemplo de orquestación de difusión de vídeo, VAE, upscaler y LLM dentro de un único grafo de ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio ocupa 39,8 GB en disco, pero no se desglosa por archivo ni se indica el consumo en VRAM).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el uso de int8 en VAE y Casting LLM sugiere orientación a hardware con memoria limitada, pero no se confirma.
- Opciones de despliegue: ComfyUI con el node pack `ironleo78-sys/ironleo78_mtv`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (pipeline de vídeo musical sobre ComfyUI con MiniMax H3) ni se ofrecen datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio no contiene los pesos oficiales de MiniMax H3 ni de LTX 2.5; sin ellos el pipeline no funciona y deben obtenerse de sus fuentes originales.
- Los nombres de archivo están fijados en el código del node pack: renombrarlos rompe la carga.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas del modelo de difusión ni del Casting LLM.
- El Casting LLM es una versión "abliterated" de Qwen3-VL-4B-Instruct, lo que puede alterar su comportamiento respecto al modelo original y requiere revisión antes de usarlo en producción.
- La licencia MIT cubre solo los archivos propios del autor; los modelos de terceros (Qwen, Kijai, MiniMax, LTX) mantienen sus licencias y deben verificarse por separado antes de un uso comercial.
- No hay información sobre calidad, estabilidad ni reproducibilidad de los vídeos generados.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa conocida.

## Enlaces

- HuggingFace: https://huggingface.co/Ironleo78/IronLeo78-MTV
- Repositorio del node pack: https://github.com/ironleo78-sys/ironleo78_mtv
- Banner del proyecto: https://raw.githubusercontent.com/ironleo78-sys/ironleo78_mtv/main/booklet/banner.svg
