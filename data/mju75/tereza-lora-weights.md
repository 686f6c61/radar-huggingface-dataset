# mju75/tereza-lora-weights

## Resumen

El modelo `mju75/tereza-lora-weights` es un adaptador LoRA (Low-Rank Adaptation) de tipo DreamBooth, diseñado para el modelo de generación de imágenes texto-a-imagen Krea 2. Desarrollado por el usuario mju75, este LoRA introduce un concepto visual específico invocable mediante el token `t3reza`, permitiendo generar representaciones de una entidad o personaje con ese nombre en diversos escenarios y estilos. El adaptador se entrenó sobre el checkpoint `krea/Krea-2-Raw` y se muestra funcionando sobre `krea/Krea-2-Turbo`, lo que permite una generación rápida en pocos pasos (8 pasos en los ejemplos).

La relevancia de este modelo radica en su enfoque de personalización eficiente: en lugar de ajustar todos los parámetros del modelo base, un LoRA añade un pequeño conjunto de pesos adaptativos que capturan un concepto concreto, reduciendo costes de entrenamiento y almacenamiento. Con un tamaño de repositorio de 1.0 GB, es una solución ligera para añadir un personaje o estilo específico a un pipeline de difusión ya existente, manteniendo la compatibilidad con la librería `diffusers` de Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo de difusión Krea 2 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es un adaptador de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt se procesa en el modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se carga mediante `load_lora_weights` de diffusers) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, una técnica de fine-tuning eficiente que modifica un subconjunto de los pesos de un modelo preentrenado mediante matrices de baja dimensión. En este caso, el adaptador se entrena sobre el modelo base `krea/Krea-2-Raw`, que es una variante del modelo de difusión Krea 2. El entrenamiento sigue el enfoque DreamBooth, que consiste en ajustar el modelo para que aprenda un concepto o sujeto específico a partir de unas pocas imágenes de referencia, utilizando un token único (aquí `t3reza`) como disparador.

No se dispone de información detallada sobre el número de imágenes de entrenamiento, el número de pasos, la tasa de aprendizaje ni la composición del dataset. Los ejemplos proporcionados en la model card muestran que el LoRA funciona correctamente sobre el checkpoint Turbo de Krea 2, generando imágenes coherentes con el concepto en estilos variados (ciberpunk, clásico, submarino). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un ajuste puramente visual.

## Capacidades

- Generación de imágenes texto-a-imagen: el LoRA permite generar imágenes que representan el concepto `t3reza` en cualquier escenario descrito por el prompt.
- Personalización de concepto: el token `t3reza` actúa como disparador para invocar el concepto aprendido, permitiendo integrarlo en composiciones diversas.
- Compatibilidad con Krea 2 Turbo: los ejemplos muestran que el adaptador funciona con el checkpoint Turbo, que requiere solo 8 pasos de inferencia, lo que acelera la generación.
- Integración con diffusers: se puede cargar fácilmente mediante `pipe.load_lora_weights()` en un pipeline de Krea 2, sin necesidad de modificar el código del modelo base.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de lenguaje; es exclusivamente un adaptador de imagen.

## Casos de uso

- Creación de arte conceptual: un ilustrador puede usar el LoRA para generar variaciones de un personaje llamado `t3reza` en diferentes entornos (ciberpunk, clásico, submarino) para explorar diseños iniciales.
- Generación de avatares personalizados: el concepto puede aplicarse a la creación de avatares para juegos, redes sociales o entornos virtuales, manteniendo una identidad visual consistente.
- Ilustración de narrativas visuales: escritores o creadores de cómics pueden generar escenas protagonizadas por `t3reza` para acompañar sus historias, usando prompts descriptivos.
- Diseño de personajes para animación: los estudios de animación pueden utilizar el LoRA para producir conceptos de personajes en múltiples poses y fondos, acelerando el proceso de preproducción.
- Marketing y publicidad: una marca puede emplear el concepto `t3reza` como mascota o elemento visual recurrente en campañas, generando imágenes adaptadas a distintos contextos.
- Experimentación artística: artistas digitales pueden combinar el LoRA con otros estilos o técnicas de prompting para obtener resultados híbridos, explorando la versatilidad del concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas de calidad de imagen (FID, CLIP score, etc.) ni comparaciones cuantitativas con otros adaptadores.

## Requisitos de hardware

- Al ser un LoRA, los requisitos de hardware dependen del modelo base Krea 2 sobre el que se carga. No se especifican los requisitos de VRAM del modelo base en la información proporcionada.
- El tamaño del repositorio del LoRA es de 1.0 GB, pero esto no equivale a la VRAM necesaria; la VRAM total será la del modelo base más el overhead del adaptador.
- Se recomienda una GPU con al menos 8-12 GB de VRAM para ejecutar Krea 2 en modo Turbo, aunque no se confirma oficialmente.
- El ejemplo de uso en la model card utiliza `torch.bfloat16` y una GPU CUDA, lo que sugiere que se requiere una GPU compatible con bfloat16 (por ejemplo, RTX 30xx o superior, o GPUs de data center).
- Opciones de despliegue: se puede usar con la librería `diffusers` en Python, o integrarse en herramientas como ComfyUI o AUTOMATIC1111 (si son compatibles con Krea 2). No se mencionan otras opciones como vLLM u Ollama, que son para modelos de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre otros LoRAs de Krea 2 con características comparables. El modelo `mju75/marketa-lora-krea-2` (también del mismo autor) podría ser un adaptador similar, pero no se han encontrado datos públicos sobre sus especificaciones o rendimiento. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El LoRA está entrenado para un concepto específico (`t3reza`); su uso fuera de ese concepto puede producir resultados inconsistentes o no deseados.
- Al ser un adaptador de bajo rango, puede tener una capacidad limitada para generalizar a estilos o escenarios muy diferentes de los vistos en el entrenamiento.
- No se dispone de información sobre posibles sesgos en las imágenes generadas; el modelo base Krea 2 puede tener sus propias limitaciones y sesgos.
- La licencia Apache 2.0 permite uso comercial, pero es necesario verificar la licencia del modelo base `krea/Krea-2-Raw` y `krea/Krea-2-Turbo`, que no se detalla en la información proporcionada.
- El token `t3reza` debe usarse exactamente como se indica; variaciones pueden no activar el concepto.
- No se garantiza la estabilidad del adaptador en versiones futuras de diffusers o del modelo base.

## Enlaces

- [Modelo en Hugging Face: mju75/tereza-lora-weights](https://huggingface.co/mju75/tereza-lora-weights)
- [Modelo base Krea-2-Raw (referencia)](https://huggingface.co/krea/Krea-2-Raw) (enlace inferido, no verificado en la información proporcionada)
- [Modelo base Krea-2-Turbo (referencia)](https://huggingface.co/krea/Krea-2-Turbo) (enlace inferido, no verificado en la información proporcionada)
