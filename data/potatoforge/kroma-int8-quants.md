# PotatoForge/Kroma-INT8-Quants

## Resumen

Kroma-INT8-Quants es una colección de cuantizaciones INT8 del modelo Kroma, desarrollada por PotatoForge. Kroma es un fine-tune completo de Krea 2 creado por lodestones, orientado a generación de imágenes desde texto en ComfyUI. Esta versión cuantizada busca reducir el uso de VRAM y permitir su ejecución en GPUs de consumo antiguas o con memoria limitada, como la GTX 1660 Super de 6 GB, que fue el hardware de prueba declarado por el autor.

El repositorio contiene cuatro versiones del checkpoint cuantizado (v0.1, v3, v4 y v5), con tamaños de archivo que oscilan entre 7,64 GB y 8,67 GB. La versión v0.1 fusiona el LoRA de Kroma v0.1 sobre Krea 2 Turbo BF16 antes de cuantizar; las versiones v3 a v5 aplican perfiles de compresión progresivamente más agresivos. No se especifica la licencia del modelo ni se detallan los parámetros totales o la arquitectura interna del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion texto a imagen, sin detalle del tipo) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | INT8 |
| Idiomas soportados | en (segun tags de HuggingFace) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base Kroma ni de Krea 2. Se sabe que Kroma es un fine-tune completo de Krea 2, y que la version v0.1 de esta cuantizacion parte de una fusion del LoRA de Kroma v0.1 con Krea 2 Turbo en BF16, seguida de una cuantizacion a INT8. Las versiones v3, v4 y v5 corresponden a perfiles de compresion distintos sobre la version v0.2 de Kroma, disenados para equilibrar calidad y tamano de archivo. No se indican datos sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image).
- Compatibilidad con ComfyUI y el entorno Comfy Kitchen, segun las pruebas del autor.
- Soporte de multiples perfiles de cuantizacion (v0.1, v3, v4, v5) para ajustar el equilibrio entre calidad y uso de recursos.
- Capacidad de ejecucion en GPUs con 6 GB de VRAM, como la GTX 1660 Super, gracias a la reduccion de peso.
- No se mencionan capacidades adicionales como tool calling, agentes, vision multimodal o audio.

## Casos de uso

- Generacion de imagenes en equipos con GPUs antiguas o de baja VRAM: el modelo esta probado en una GTX 1660 Super de 6 GB, por lo que permite ejecutar un modelo de difusion moderno en hardware que normalmente quedaria excluido.
- Flujos de trabajo en ComfyUI: los archivos safetensors se cargan directamente en nodos de ComfyUI, integrandose en pipelines de generacion, edicion o variacion de imagenes.
- Prototipado rapido de contenido visual: disenadores y desarrolladores pueden generar ilustraciones, conceptos o referencias visuales sin depender de servicios en la nube.
- Experimentacion con cuantizacion: las cuatro versiones permiten comparar el impacto de distintos niveles de compresion INT8 sobre la calidad de salida, util para investigacion aplicada.
- Despliegue en entornos con limitaciones de almacenamiento: la version v5 (7,64 GB) reduce el espacio ocupado frente a los pesos completos, adecuada para equipos con discos pequenos.
- Educacion y demostracion: sirve como ejemplo practico de cuantizacion de modelos de difusion para estudiantes o profesionales que quieran entender el trade-off entre tamano y fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM minima probada: 6 GB (NVIDIA GTX 1660 Super).
- RAM del sistema: 32 GB en la configuracion de prueba.
- GPU recomendadas: cualquier tarjeta con al menos 6 GB de VRAM; las series GTX 10, RTX 20 y posteriores son candidatas, aunque no se han probado otras.
- Espacio en disco: cada archivo safetensors ocupa entre 7,64 GB y 8,67 GB; el repositorio completo suma 35,5 GB.
- Entorno de ejecucion: ComfyUI con Comfy Kitchen; no se menciona soporte para vLLM, llama.cpp u otros motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se proporcionan datos comparativos con otros modelos de generacion de imagenes cuantizados o con el modelo base sin cuantizar.

## Limitaciones y advertencias

- Licencia no especificada: no se indica si el modelo puede usarse comercialmente, lo que supone un riesgo legal para su integracion en productos.
- Calidad potencialmente degradada: la cuantizacion INT8 puede introducir perdidas de fidelidad respecto al modelo original BF16, aunque no se aportan mediciones objetivas.
- Idioma: las etiquetas indican ingles, pero al ser un modelo de generacion de imagenes, la comprension del prompt depende del modelo base, no de esta capa de cuantizacion.
- Sesgos y alucinaciones visuales: no se documentan, pero son inherentes a los modelos de difusion; no hay informacion especifica sobre este checkpoint.
- Solo compatible con ComfyUI: no se garantiza su funcionamiento en otros frameworks de inferencia.
- La version v0.1 usa Kroma v0.1, mientras que v3-v5 usan Kroma v0.2; los usuarios deben elegir la version segun sus preferencias de calidad y tamano.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PotatoForge/Kroma-INT8-Quants
- Modelo base lodestones/Kroma: https://huggingface.co/lodestones/Kroma
- Noticia de ComfyUI Wiki sobre Kroma v0.2: https://comfyui-wiki.com/en/news/2026-08-09-kroma-v0-2
