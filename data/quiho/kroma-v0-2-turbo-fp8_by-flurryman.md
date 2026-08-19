# Quiho/kroma-v0.2-turbo-fp8_by-flurryman

## Resumen

Kroma v0.2 turbo FP8 es una versión cuantizada en punto flotante de 8 bits (FP8) del modelo de generación de imágenes Kroma v0.2 turbo, desarrollado originalmente por lodestones y basado en la arquitectura Krea 2 (K2 DiT). Esta derivada ha sido creada por el usuario Quiho (flurryman) utilizando la herramienta `convert_to_quant` (ctq) v1.3.2 de silveroxides, con el objetivo de reducir el tamaño y los requisitos de memoria del modelo original manteniendo una calidad visual cercana. El resultado es un archivo de pesos de 13,5 GB, listo para su uso en ComfyUI, un popular flujo de trabajo de generación de imágenes por nodos. No se trata de un lanzamiento oficial de Krea, sino de una adaptación comunitaria que respeta la licencia Krea 2 Community License.

La relevancia de esta versión radica en que permite ejecutar un modelo de difusión de última generación en hardware con VRAM más limitada, al reducir la precisión de los pesos a FP8 sin necesidad de recurrir a cuantizaciones más agresivas que degraden la calidad. Es una opción práctica para desarrolladores y artistas que trabajan con ComfyUI y buscan un equilibrio entre rendimiento y fidelidad visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Krea 2 / K2 DiT (diffusion transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | FP8 (8 bits) |
| Idiomas soportados | en (ingles) |
| Licencia | krea2-community-license (Krea 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo original Kroma v0.2 turbo pertenece a la familia Krea 2, que emplea una arquitectura de diffusion transformer (DiT). Este tipo de arquitectura combina transformers con procesos de difusion para generar imagenes de alta resolucion, y es la base de modelos como Stable Diffusion 3 o Sora. La version turbo indica que ha sido optimizada para requerir menos pasos de inferencia que un modelo de difusion estandar, lo que acelera la generacion.

La cuantizacion FP8 aplicada en esta derivada reduce la precision numerica de los pesos de 16 o 32 bits a 8 bits, lo que disminuye el uso de memoria y acelera la inferencia en hardware compatible con FP8 (como GPUs de la serie RTX 40 o H100). No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens procesados o si se aplicaron tecnicas como RLHF o DPO, ya que esos datos pertenecen al modelo original y no se han publicado en la model card.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image).
- Soporte para flujos de trabajo ComfyUI, incluyendo la carga directa de los pesos cuantizados.
- Compatible con la arquitectura Krea 2, que permite generar imagenes de alta calidad con pocos pasos de inferencia (modo turbo).
- Cuantizacion FP8 que reduce el consumo de VRAM y acelera la inferencia en GPUs con soporte FP8.
- Idiomas: principalmente ingles, aunque el modelo puede entender prompts en otros idiomas dependiendo del tokenizador original (no confirmado).

## Casos de uso

- Generacion de imagenes en tiempo real para estudios de diseno: al ser una version turbo con cuantizacion FP8, permite iterar rapidamente sobre conceptos visuales sin necesidad de una GPU de gama alta.
- Integracion en pipelines de ComfyUI para produccion de contenido: los nodos de ComfyUI pueden cargar directamente estos pesos, facilitando la automatizacion de tareas como generacion de variaciones, inpainting o upscaling.
- Prototipado de assets para videojuegos: la velocidad del modo turbo permite generar bocetos de personajes, escenarios u objetos en pocos segundos, agilizando el proceso creativo.
- Creacion de imagenes para marketing y publicidad: la calidad del modelo Kroma, combinada con la reduccion de memoria, permite ejecutar campañas de generacion masiva en servidores con GPUs modestas.
- Investigacion en generacion de imagenes: los investigadores pueden utilizar esta version cuantizada para experimentar con la arquitectura Krea 2 sin necesidad de adquirir hardware especializado.
- Uso educativo en cursos de IA generativa: al ser un archivo safetensors de 13,5 GB, es manejable para entornos academicos que quieran ensenar tecnicas de cuantizacion y despliegue de modelos de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad (FID, CLIP score, etc.) ni comparaciones con otros modelos. La unica referencia de rendimiento es la reduccion de memoria por la cuantizacion FP8, pero no se proporcionan numeros concretos de velocidad o VRAM.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un modelo FP8 de 13,5 GB, se estima que requiere al menos 16 GB de VRAM para inferencia comoda (posiblemente menos con offloading).
- GPU recomendadas: GPUs con soporte FP8 nativo, como NVIDIA RTX 40 series (4090, 4080), RTX 50 series o datacenter (A100, H100). Tambien puede ejecutarse en GPUs sin soporte FP8 mediante conversion a BF16, aunque con mayor uso de memoria.
- Compatibilidad con GPU de consumo: si, en tarjetas de 16 GB o mas (por ejemplo, RTX 4090). En GPUs de 12 GB podria funcionar con cuantizacion adicional o reduccion de resolucion.
- Opciones de despliegue: ComfyUI es el entorno principal, pero los pesos safetensors pueden cargarse con cualquier framework que soporte el formato (Diffusers, etc.) siempre que se adapte la arquitectura.
- Latencia y throughput: no disponible. El modo turbo reduce el numero de pasos, pero no se especifican valores concretos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar directamente con otros modelos de generacion de imagenes, ya que no se han publicado metricas de rendimiento. Se puede mencionar que, al ser una cuantizacion FP8 de Kroma v0.2 turbo, su calidad deberia ser similar a la del modelo original, que compite con otros modelos de difusion como Stable Diffusion 3.5 o Flux. Sin embargo, sin datos objetivos, no se puede establecer una comparativa numerica.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kroma v0.2 turbo FP8 (este) | no disponible | no aplica | Krea 2 Community | HuggingFace |
| Stable Diffusion 3.5 | ~8B | texto | Stability AI Community License | HuggingFace |
| Flux.1 | ~12B | texto | Flux Dev Non-Commercial | HuggingFace |

## Limitaciones y advertencias

- No es un lanzamiento oficial de Krea; es una cuantizacion comunitaria. El autor advierte que los pesos originales pertenecen a sus respectivos duenos bajo la licencia Krea 2 Community License.
- La licencia krea2-community-license puede imponer restricciones de uso comercial. Se debe revisar el texto completo de la licencia en el enlace proporcionado antes de utilizar el modelo en produccion.
- La cuantizacion FP8 puede introducir una ligera degradacion de calidad en comparacion con los pesos originales, especialmente en detalles finos o texturas complejas.
- El modelo esta pensado principalmente para ComfyUI; su integracion con otros frameworks puede requerir adaptaciones adicionales.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma. Se asume que hereda las limitaciones del modelo original, que no han sido documentadas en esta model card.
- El tamano del repo (13,5 GB) puede ser elevado para entornos con poco ancho de banda o almacenamiento limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Quiho/kroma-v0.2-turbo-fp8_by-flurryman
- Modelo original (lodestones/Kroma): https://huggingface.co/lodestones/Kroma
- Herramienta de cuantizacion convert_to_quant: https://github.com/silveroxides/convert_to_quant
- Licencia Krea 2 Community License: https://www.krea.ai/krea-2-licensing
