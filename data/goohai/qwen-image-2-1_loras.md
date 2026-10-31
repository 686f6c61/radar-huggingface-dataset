# GooHAI/Qwen-image-2.1_loras

## Resumen

GooHAI/Qwen-image-2.1_loras es una colección de adaptadores LoRA (Low-Rank Adaptation) de edición de imágenes, entrenados sobre el modelo base Qwen/Qwen-Image-2.1 y publicados por el usuario GooHAI en Hugging Face. El repositorio se enmarca en la tarea de imagen a imagen (image-to-image) y se centra en dos problemas concretos que afectan a los flujos de edición con Qwen-Image-2.1: el desplazamiento de píxeles (pixel offset) que provoca el modelo base al regenerar zonas editadas, y la eliminación limpia de objetos o regiones enmascaradas.

La colección incluye dos LoRA. El primero, denominado "consistencia sin desplazamiento" (GH_V1.0), corrige el problema de desplazamiento de píxeles del modelo base sin necesidad de palabra de activación y con una escala recomendada de 0.7. El segundo, "Remove_GH" (remoción universal), permite eliminar con precisión las regiones marcadas mediante máscara, sin desplazamiento de píxeles ni alteraciones de color, activándose con la frase desencadenante "移除图像中的绿色区域" (elimina la zona verde de la imagen) y con una escala recomendada de 1.0.

Su relevancia radica en que aborda limitaciones prácticas de un modelo de edición de imágenes reciente, ofreciendo soluciones ligeras (el repositorio completo pesa unos 0.5 GB) que se cargan sobre el modelo base sin necesidad de reentrenarlo. La licencia es Apache 2.0, lo que permite su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre Qwen/Qwen-Image-2.1 (pipeline image-to-image) |
| Parametros totales | no disponible (repositorio completo: 0.5 GB) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones de activacion en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de adaptadores LoRA, una tecnica de ajuste fino parametricamente eficiente que añade matrices de bajo rango a las capas del modelo base en lugar de modificar todos sus pesos. Esto permite archivos de pequeno tamano (el repositorio completo ocupa 0.5 GB, frente a los varios GB del modelo base) y una carga modular: se puede activar o desactivar cada LoRA segun la tarea. El modelo subyacente es Qwen/Qwen-Image-2.1, un modelo de generacion y edicion de imagenes de la familia Qwen.

No se han publicado detalles sobre los datos de entrenamiento, el numero de pasos, el rango LoRA ni las capas objetivo de estos adaptadores. La model card solo documenta la finalidad de cada LoRA, la palabra de activacion cuando aplica y la escala de mezcla recomendada (0.7 para el corrector de desplazamiento, 1.0 para la remocion). Tampoco se especifica si el entrenamiento se realizo con el modelo base cuantizado o en precision completa.

## Capacidades

- Correccion del desplazamiento de pixeles (pixel offset) que produce Qwen-Image-2.1 al editar imagenes, manteniendo la consistencia posicional con la imagen original (LoRA GH_V1.0, sin palabra de activacion).
- Remocion precisa de objetos o regiones indicadas mediante mascara, sin desplazamiento de pixeles ni desviaciones de color respecto a la imagen original (LoRA Remove_GH).
- Activacion mediante frase desencadenante en el LoRA de remocion: "移除图像中的绿色区域" (elimina la zona verde de la imagen), lo que sugiere que el area a eliminar se senala con un marcador verde en la imagen de entrada.
- Compatibilidad con el flujo de trabajo estandar de diffusers/ComfyUI para LoRA sobre Qwen-Image-2.1: carga del modelo base, aplicacion del adaptador a la escala recomendada y generacion o edicion.
- No es un modelo generativo por si mismo: requiere el modelo base Qwen/Qwen-Image-2.1 para funcionar.

## Casos de uso

- Eliminacion de objetos en fotografias de producto: con Remove_GH se marca el objeto indeseado con una mascara o zona verde y el modelo lo elimina reconstruyendo el fondo sin desplazar pixeles ni alterar el color, util para catalogos de e-commerce.
- Retoque y limpieza de imagenes editoriales: remocion de elementos distractores (senales, personas de fondo, cables) en fotografias para prensa o blogs, aprovechando la ausencia de desviacion cromatica respecto al original.
- Flujos de edicion iterativa con consistencia espacial: al aplicar GH_V1.0 con escala 0.7, las ediciones sucesivas sobre la misma imagen no sufren el desplazamiento de pixeles del modelo base, lo que permite encadenar multiples operaciones de edicion.
- Restauracion fotografica basica: eliminacion de elementos no deseados en fotografias digitalizadas o escaneadas donde la alineacion con el original es critica.
- Integracion en pipelines automatizados de edicion: al tratarse de safetensors ligeros con activacion por frase fija, pueden incorporarse en flujos por lotes (batch) de ComfyUI o diffusers para procesar grandes volumenes de imagenes.
- Preparacion de datasets para entrenamiento: limpieza automatica de regiones con marca de agua, texto o logos en imagenes destinadas a entrenar otros modelos, manteniendo la fidelidad del resto de la escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (PSNR, SSIM, evaluaciones perceptuales) ni comparaciones con otras soluciones de remocion de objetos o correccion de consistencia.

## Requisitos de hardware

- Los adaptadores en si son ligeros (0.5 GB el repositorio completo), pero los requisitos reales vienen determinados por el modelo base Qwen/Qwen-Image-2.1, cuyas especificaciones no se detallan en la informacion disponible.
- VRAM estimada: no disponible; dependera del tamano y precision de carga de Qwen-Image-2.1 (tipicamente, modelos de difusion de esta familia requieren GPUs con decenas de GB de VRAM en precision completa).
- GPUs recomendadas: no disponible; en general, GPUs de gama alta tipo NVIDIA A100, H100 o RTX 4090 son habituales para modelos de difusion de gran tamano.
- Capacidad en GPUs de consumo: no disponible; podria ser viable con cuantizacion del modelo base, pero no hay datos publicados al respecto.
- Opciones de despliegue: cualquier entorno compatible con LoRA de diffusers sobre Qwen-Image-2.1 (libreria diffusers de Hugging Face, ComfyUI); no se menciona soporte especifico para vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Funcion principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GooHAI/Qwen-image-2.1_loras | Coleccion LoRA | Qwen/Qwen-Image-2.1 | Correccion de pixel offset y remocion de objetos enmascarados | Apache 2.0 | Publica en Hugging Face |
| Qwen/Qwen-Image-2.1 | Modelo base de edicion/generacion | — | Generacion y edicion de imagenes de forma general | no disponible en la informacion proporcionada | Publica en Hugging Face |
| Alternativas de inpainting/remocion (p. ej. LaMa, FLUX Fill) | Modelos de inpainting | Varias | Remocion y relleno de regiones | Variable segun modelo | no disponible detalles en la informacion proporcionada |

La ventaja diferencial de esta coleccion frente al modelo base sin adaptar es la correccion especifica del desplazamiento de pixeles y la remocion sin desviacion de color, problemas documentados por el propio autor. No hay datos cuantitativos que permitan comparar rendimiento con otras soluciones de inpainting.

## Limitaciones y advertencias

- Documentacion limitada: no se publican detalles de entrenamiento, rango LoRA, capas objetivo, datos usados ni metricas de evaluacion, lo que dificulta evaluar su calidad de forma rigurosa antes de usarla en produccion.
- Dependencia del modelo base: los LoRA no funcionan de forma aislada; es imprescindible cargar Qwen/Qwen-Image-2.1, y cualquier limitacion de ese modelo (calidad de reconstruccion, resolucion maxima, sesgos) se hereda.
- Idioma de la frase desencadenante: la activacion de Remove_GH esta documentada en chino ("移除图像中的绿色区域"); no se indica si funciona con instrucciones en espanol o ingles, por lo que conviene probarla tal cual se documenta.
- Escalas recomendadas especificas: usar escalas distintas de 0.7 (GH_V1.0) o 1.0 (Remove_GH) puede degradar los resultados; no hay guia sobre el comportamiento fuera de esos valores.
- Repositorio con cero descargas registradas en el momento de la ficha: es un recurso muy nuevo y con poco uso comunitario, sin validacion amplia por terceros.
- Riesgo de alucinacion en la reconstruccion: al eliminar regiones, el modelo debe inventar el contenido ocluido; el resultado puede no coincidir con la escena real, especialmente en fondos complejos.
- Licencia Apache 2.0 sin restricciones de uso comercial, aunque hay que verificar por separado la licencia del modelo base Qwen/Qwen-Image-2.1, que no consta en la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/GooHAI/Qwen-image-2.1_loras
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Paper, blog o demo: no disponible
