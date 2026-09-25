# mooumari/olh-qwen-image-edit-2509

## Resumen

`mooumari/olh-qwen-image-edit-2509` no es un modelo entrenado desde cero, sino un espejo (mirror) publicado para un worker autoalojado. Reempaqueta el repositorio oficial `Qwen/Qwen-Image-Edit-2509` en su commit `d3968ef9` eliminando los pesos completos del transformer de tamaño completo, y en su lugar incorpora un transformer cuantizado a 4 bits procedente de `nunchaku-ai/nunchaku-qwen-image-edit-2509` en el commit `e93a5fb7`. El archivo concreto es `lightning-251115/svdq-int4_r128-qwen-image-edit-2509-lightning-8steps-251115.safetensors`, es decir, un peso SVDQuant int4 con rango 128 en variante Lightning de 8 pasos.

El modelo subyacente, Qwen-Image-Edit-2509, es la iteración de septiembre de 2025 de la familia Qwen-Image-Edit de Alibaba Qwen, orientada a edición de imágenes guiada por instrucciones en texto. Según la documentación pública, esta versión mejora la manipulación de detalle fino, la consistencia de identidad de personas y la consistencia al editar texto dentro de la imagen respecto a la versión de agosto de 2025. Se ejecuta mediante la clase de pipeline `QwenImageEditPlusPipeline` de la librería `diffusers` y la tarea declarada es image-to-image.

Su relevancia práctica es acotada pero clara: al sustituir el transformer completo por uno cuantizado a 4 bits con destilación de pasos (Lightning, 8 pasos), reduce de forma notable la huella de memoria necesaria para inferencia, lo que facilita desplegar la edición de imágenes en hardware más modesto o en un entorno autoalojado. El repositorio tiene 29,5 GB, licencia Apache-2.0 y cero descargas y cero likes en el momento de la consulta, por lo que debe tratarse como una redistribución de terceros sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para edición de imagen (image-to-image); clase de pipeline `QwenImageEditPlusPipeline` en `diffusers`. Detalle de la arquitectura interna del transformer base no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como en un LLM; longitud máxima de prompt admitida no disponible |
| Tipos de cuantización | Transformer en 4 bits (SVDQuant int4, rango 128) en variante Lightning de 8 pasos, procedente de `nunchaku-ai`; otros formatos (fp8, GGUF) no incluidos en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (estructura de repositorio `diffusers`) |
| Tamaño del repositorio | 29,5 GB |
| Tarea declarada | image-to-image |
| Modelo base | `Qwen/Qwen-Image-Edit-2509` (commit `d3968ef9`), sin los pesos completos del transformer |
| Peso cuantizado incluido | `lightning-251115/svdq-int4_r128-qwen-image-edit-2509-lightning-8steps-251115.safetensors`, de `nunchaku-ai/nunchaku-qwen-image-edit-2509` (commit `e93a5fb7`) |
| Autor del repositorio | mooumari |
| Fecha de creación / actualización | 2026-09-24 / 2026-09-24 |

## Arquitectura y entrenamiento

El repositorio no documenta entrenamiento propio. Se limita a recomponer archivos ya existentes: por un lado, el contenido de `Qwen/Qwen-Image-Edit-2509` en el commit indicado, excluyendo los pesos del transformer a tamaño completo; por otro, un transformer cuantizado a 4 bits con SVDQuant (int4, rango 128) y una variante Lightning de 8 pasos, ambos publicados por `nunchaku-ai`. El autor declara explícitamente que los archivos no han sido modificados y que ambas procedencias son Apache-2.0.

Del modelo base Qwen-Image-Edit-2509 sí hay información pública: es la iteración mensual de septiembre de 2025 de Qwen-Image-Edit, la versión de agosto de 2025, y sus mejoras se centran en tres ejes: manipulación de detalle fino, consistencia de identidad de personas al cambiar pose o estilo manteniendo el parecido, y consistencia en la edición de texto presente en la imagen. No se dispone en la información proporcionada de datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones de atención o decodificación del modelo base.

La innovación técnica relevante de este espejo es de despliegue, no de entrenamiento: la cuantización SVDQuant a 4 bits con rango 128 reduce el peso del transformer, y la destilación Lightning permite trabajar en 8 pasos de muestreo en lugar de las decenas habituales, lo que abarata el coste por imagen en entornos autoalojados.

## Capacidades

- Edición de imágenes guiada por instrucciones en lenguaje natural sobre una imagen de entrada (pipeline image-to-image).
- Manipulación de detalle fino: retoques localizados, cambios de atributos y ajustes concretos sobre regiones de la imagen, según las mejoras declaradas de la versión 2509.
- Consistencia de identidad: cambio de pose o de estilo de retrato manteniendo el parecido de la persona, mejora destacada respecto a Qwen-Image-Edit de agosto de 2025.
- Edición de texto dentro de la imagen, aprovechando la capacidad de renderizado de texto de la familia Qwen-Image.
- Ejecución con transformer cuantizado a 4 bits y muestreo en 8 pasos (variante Lightning), orientada a reducir VRAM y latencia.
- Integración con `diffusers` mediante `QwenImageEditPlusPipeline`.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo es de edición de imagen.

## Casos de uso

- Worker de edición autoalojado: el propio repositorio se describe como espejo para un worker autoalojado, de modo que el escenario natural es desplegar un servicio interno de edición de imágenes que recibe una imagen y una instrucción y devuelve la imagen editada, con los pesos ya cuantizados para abaratar el coste de GPU.
- Retoque de producto en comercio electrónico: limpiar fondos, corregir iluminación o sustituir detalles de un artículo a partir de una foto base, manteniendo la coherencia del producto entre variantes del catálogo.
- Consistencia de identidad en retratos: generar variantes de una misma persona en distintas poses o estilos para perfiles, avatares o material de marca, apoyándose en la mejora de consistencia de identidad declarada en la versión 2509.
- Edición de texto en piezas gráficas: modificar titulares, precios o etiquetas dentro de carteles, infografías y capturas de interfaz sin regenerar toda la imagen, gracias a la capacidad de edición de texto de la familia Qwen-Image.
- Limpieza y sustitución de objetos: eliminar elementos no deseados o reemplazarlos por otros en fotografías de arquitectura, inmobiliaria o documentación técnica, con control por instrucción.
- Integración en ComfyUI: la familia Qwen-Image-Edit se distribuye con soporte para ComfyUI, por lo que este paquete puede emplearse como nodo dentro de grafos de generación y postprocesado ya existentes.
- Investigación con presupuesto de VRAM limitado: al incluir el transformer en 4 bits y 8 pasos, sirve para experimentar con edición por instrucciones en GPUs que no admitirían los pesos completos, comparando la pérdida de calidad frente a la versión de precisión completa.
- Preprocesado de datasets: generar pares imagen-original / imagen-editada para entrenar o evaluar otros modelos de edición, con coste por muestra reducido gracias al muestreo en 8 pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación, y las fuentes consultadas describen mejoras cualitativas de la versión 2509 (detalle fino, consistencia de identidad y de texto) sin cifras comparativas.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|
| `mooumari/olh-qwen-image-edit-2509` (este repositorio) | Espejo para worker autoalojado, sin transformer completo | Transformer int4 SVDQuant r128 + Lightning 8 pasos | Apache-2.0 | HuggingFace, 0 descargas |
| `Qwen/Qwen-Image-Edit-2509` | Modelo base oficial (septiembre 2025) | Pesos completos | Apache-2.0 | HuggingFace, Qwen Chat, ModelScope |
| `Qwen/Qwen-Image-Edit` (agosto 2025) | Iteración anterior del mismo modelo | Pesos completos | Apache-2.0 | HuggingFace |
| `nunchaku-ai/nunchaku-qwen-image-edit-2509` | Publicación de pesos cuantizados SVDQuant | int4 r128, variante Lightning 8 pasos | Apache-2.0 | HuggingFace |

No se dispone de datos de parámetros, contexto ni rendimiento de los modelos comparados en la información proporcionada, por lo que no se incluyen cifras.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio no publica cifras oficiales de consumo de memoria.
- El diseño del paquete apunta a reducir requisitos: incluye el transformer en 4 bits (SVDQuant int4, rango 128) en lugar de los pesos completos, y la variante Lightning de 8 pasos reduce el número de evaluaciones del modelo por imagen.
- GPUs recomendadas: no disponible. Como referencia metodológica, la reducción a 4 bits es el mecanismo habitual para acercar modelos de difusión grandes a GPUs de gama alta de consumo, pero este extremo debe validarse en el hardware concreto antes de asumirlo en producción.
- ¿Cabe en GPU de consumo?: no confirmado. El paquete está pensado para abaratar el despliegue, pero no se documenta en qué modelos concretos de GPU encaja.
- Opciones de despliegue: `diffusers` con `QwenImageEditPlusPipeline`; ComfyUI (soportado por la familia Qwen-Image-Edit según la documentación pública); el ecosistema `nunchaku` para los pesos SVDQuant. `vLLM`, `llama.cpp`, `Ollama` y `TGI` no aplican a un modelo de difusión de imagen.
- Latencia y throughput: no disponibles. La variante Lightning de 8 pasos implica menos pasos de muestreo que un flujo estándar, pero no se publican tiempos por imagen.
- Almacenamiento: el repositorio ocupa 29,5 GB, a tener en cuenta en el aprovisionamiento del nodo que ejecute el worker.

## Limitaciones y advertencias

- No es un modelo original: es una redistribución de terceros. La validez de los pesos depende de la integridad de los archivos reempaquetados por el autor.
- El transformer a tamaño completo no está incluido. Sin los pesos cuantizados de `nunchaku-ai` o sin descargar el transformer original, el repositorio no permite ejecutar el modelo completo.
- Sin tracción ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que impide contrastar la reproducibilidad del paquete.
- La cuantización int4 puede degradar la calidad de la edición respecto a los pesos completos; en el repositorio no se documenta ninguna evaluación de esa pérdida.
- La variante Lightning de 8 pasos prioriza velocidad sobre calidad; conviene comparar el resultado con un muestreo de más pasos antes de usarla en producción.
- Riesgo de artefactos y de resultados inconsistentes: como todo modelo de difusión, puede producir deformaciones, texto mal renderizado o cambios no solicitados fuera de la región objetivo. No se documentan tasas de error.
- Sesgos: no disponibles. No se publica información sobre sesgos demográficos, culturales o de representación en el modelo base ni en el espejo.
- Idiomas: no disponibles. No se especifica qué lenguas acepta el prompt de edición ni cuáles soporta el renderizado de texto.
- La licencia Apache-2.0 de los archivos originales permite uso comercial, pero el usuario debe verificar de forma independiente las condiciones de la versión base y de los pesos cuantizados antes de distribuirlos o integrarlos en un producto.
- Fechas del repositorio: la fecha de creación indicada (2026-09-24) es posterior a la publicación del modelo base, dato a tener en cuenta al auditar la procedencia.
- Antes de usarlo en producción, conviene reproducir los pesos desde las fuentes originales (`Qwen` y `nunchaku-ai`) y comparar por *hash* los archivos.

## Enlaces

- Repositorio analizado: https://huggingface.co/mooumari/olh-qwen-image-edit-2509
- Modelo base oficial: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- Pesos cuantizados de origen: https://huggingface.co/nunchaku-ai/nunchaku-qwen-image-edit-2509
- Demo oficial en Hugging Face Spaces: https://huggingface.co/spaces/Qwen/Qwen-Image-Edit-2509
- Versión del modelo en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen-Image-Edit-2509
- Notas de la versión 2509 en GitHub: https://github.com/MozDevApps/Qwen-Image-Edit/blob/main/Qwen-Image-Edit-2509.md
- Ficha del modelo en Layer: https://layer.ai/models/qwen-qwen-image-edit-2509
