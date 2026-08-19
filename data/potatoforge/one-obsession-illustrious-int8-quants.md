# PotatoForge/One-Obsession-Illustrious-INT8-Quants

## Resumen

One Obsession v24 Quant es una cuantización experimental del modelo de difusión One Obsession v24, desarrollado originalmente por maxfeifei8 y cuantizado por PotatoForge (también conocido como BakaPotatoLord). El modelo está diseñado para su uso en ComfyUI y emplea un formato mixto de cuantización INT8, combinando cuantización plana INT8 y ConvRot INT8 con tamaño de grupo 256, mientras que los codificadores de texto CLIP-L, CLIP-G y el VAE se mantienen en FP16. El repositorio tiene un tamaño de 4,8 GB y se presenta como una solución de compresión de almacenamiento para el checkpoint original, dirigida a usuarios con GPUs de gama baja.

El modelo se enmarca dentro de la familia Illustrious-XL, una rama de checkpoints de Stable Diffusion XL especializada en ilustración anime. La cuantización afecta únicamente al modelo de difusión (UNet), lo que reduce significativamente el peso del archivo y el uso de memoria en inferencia, a costa de una posible pérdida de calidad. La licencia no está especificada, y no se han publicado detalles sobre el entrenamiento original, ya que se trata de una adaptación de un modelo preexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion basado en Illustrious-XL (SDXL), UNet cuantizado en INT8 mixto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tipicamente 77 tokens por CLIP en SDXL) |
| Tipos de cuantizacion | INT8 plano y ConvRot INT8 (grupo 256) en el UNet; CLIP y VAE en FP16 |
| Idiomas soportados | no disponibles (probablemente ingles y etiquetas Danbooru) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo original One Obsession v24 es un checkpoint de la serie Illustrious-XL, que a su vez deriva de Stable Diffusion XL. La arquitectura del UNet en SDXL tiene aproximadamente 2.600 millones de parametros, aunque en esta version cuantizada no se especifica el numero exacto. La cuantizacion realizada por PotatoForge emplea un esquema mixto: capas con cuantizacion plana INT8 y capas con ConvRot INT8 (una variante de cuantizacion por rotacion de pesos) con grupo de 256. Esta combinacion busca reducir el tamano del modelo y acelerar la inferencia en GPUs limitadas.

No se proporcionan datos sobre el entrenamiento del modelo original (numero de tokens, dataset, tecnicas de alineacion) ni sobre el proceso de cuantizacion (calibracion, perdida de calidad medida). El autor indica que es una cuantizacion experimental de compresion de almacenamiento, y que la calidad visual le parece aceptable para su uso. La inferencia se realiza en ComfyUI, que soporta este formato de cuantizacion mediante nodos personalizados.

## Capacidades

- Generacion de imagenes a partir de texto, especializado en ilustracion anime y estilos Illustrious.
- Compatible con ComfyUI, permitiendo integracion en flujos de trabajo complejos con LoRAs, ControlNet y otros nodos.
- Soporte de prompts en ingles y etiquetas Danbooru (tipico de la familia Illustrious).
- Cuantizacion INT8 que reduce el uso de VRAM, permitiendo ejecucion en GPUs con 6 GB o menos.
- El VAE y los codificadores de texto permanecen en FP16, manteniendo la fidelidad de la decodificacion.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de generacion de imagenes.

## Casos de uso

- Generacion de ilustraciones anime para proyectos personales: el modelo puede producir imagenes de alta resolucion (por ejemplo, 696x1048) con 25 pasos y CFG 4.5, como se indica en las pruebas del autor, adecuado para artistas que buscan inspiracion o bocetos rapidos.
- Creacion de assets para videojuegos indie: gracias a su cuantizacion, se puede ejecutar en GPUs de gama baja (GTX 1660 Super 6GB), permitiendo a estudios pequenos generar conceptos de personajes o escenarios sin necesidad de hardware costoso.
- Experimentacion con cuantizacion de modelos de difusion: el formato ConvRot INT8 es una tecnica poco comun; este repositorio sirve como referencia para desarrolladores interesados en compresion de modelos.
- Flujos de trabajo en ComfyUI con restricciones de memoria: al mantener CLIP y VAE en FP16, se puede combinar con otros nodos que requieran memoria adicional, como ControlNet o upscalers.
- Generacion de imagenes para ilustracion editorial o contenido web: la calidad percibida por el autor es "suficientemente buena", lo que lo hace util para prototipos o imagenes de relleno.
- Pruebas de rendimiento en hardware modesto: el autor reporta una velocidad aproximadamente un 45% superior respecto al modelo FP16, lo que lo convierte en una opcion para evaluar el impacto de la cuantizacion en la latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo menciona observaciones subjetivas de velocidad (aproximadamente un 45% mas rapido que la version sin cuantizar) y calidad visual, sin metricas objetivas como FID o CLIP score.

## Requisitos de hardware

- VRAM estimada: el autor probo el modelo en una NVIDIA GTX 1660 Super con 6 GB de VRAM, junto con 32 GB de RAM. No se especifica el uso exacto de VRAM, pero la cuantizacion INT8 del UNet reduce el consumo frente a FP16.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM y soporte para CUDA. Modelos como RTX 3060, RTX 4060 o superiores son adecuados. Para resoluciones mayores o uso con otros nodos, se recomienda 8 GB o mas.
- Compatibilidad con consumer GPU: si, el modelo esta disenado para GPUs de consumo, como se demuestra con la GTX 1660 Super.
- Opciones de despliegue: ComfyUI es el entorno principal. Tambien podria usarse con Automatic1111 u otros frontends que soporten cuantizacion INT8, aunque no se menciona. No se indican opciones como vLLM o llama.cpp, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan valores exactos. La prueba con 25 pasos y resolucion 696x1048 tarda un tiempo no especificado, pero el autor nota una mejora del 45% en velocidad respecto a FP16.

## Comparativa con modelos similares

| Modelo | Tamano | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| One Obsession v24 (original) | ~6-7 GB (FP16) | FP16 | no disponible | no disponible | Civitai |
| One Obsession v24 Quant (este) | 4.8 GB | INT8 mixto + ConvRot | no disponible | no disponible | HuggingFace |
| John6666/one-obsession-12illustrious20-sdxl | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Obsession (Illustrious-XL) v-pred_v2.0 | no disponible | no disponible | no disponible | no disponible | Civitai |

La comparativa se limita al tamano del repositorio y al formato de cuantizacion, ya que no se dispone de datos de rendimiento o calidad para los modelos alternativos. La principal ventaja de esta version quant es la reduccion de almacenamiento y memoria, a costa de una posible perdida de calidad.

## Limitaciones y advertencias

- Es una cuantizacion experimental: el propio autor la califica como tal, por lo que puede presentar artefactos visuales o degradacion en ciertos prompts.
- Licencia no especificada: no se indica si el modelo original o la cuantizacion tienen restricciones de uso comercial. Se debe contactar con el autor antes de usarlo en produccion.
- Sin informacion sobre sesgos: al ser un modelo de ilustracion anime, puede reflejar sesgos del dataset Danbooru (estereotipos de genero, contenido NSFW, etc.).
- Riesgo de alucinacion visual: como todos los modelos de difusion, puede generar detalles incorrectos o inconsistentes, especialmente en manos, texto o anatomias complejas.
- Limitacion de contexto: no se especifica el numero de tokens de texto soportado; tipicamente SDXL usa 77 tokens, lo que limita la longitud de los prompts.
- Dependencia de ComfyUI: el formato de cuantizacion puede no ser compatible con otros entornos sin adaptaciones.
- Rendimiento no medido objetivamente: la mejora del 45% en velocidad es una observacion subjetiva del autor, no un benchmark estandarizado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PotatoForge/One-Obsession-Illustrious-INT8-Quants
- Modelo original en Civitai: https://civitai.red/models/1318945/one-obsession
- Perfil del autor en Civitai: https://civitai.red/user/BakaPotatoLord
- Modelo similar en HuggingFace: https://huggingface.co/John6666/one-obsession-12illustrious20-sdxl
- Checkpoint Obsession en Civitai: https://civitai.com/models/820208/obsession-illustrious-xl
