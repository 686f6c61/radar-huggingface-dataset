# RunningHubAI/rh-krea-2-fuzichoco-style-lora

## Resumen

rh-krea-2-fuzichoco-style-lora es un adaptador LoRA de estilo publicado por RunningHubAI (RunningHub) para el modelo base krea2. Su objetivo es reproducir la estética de ilustración asociada al estilo "fuzichoco" en tareas de generación y edición de imagen a partir de texto (pipeline image-text-to-image). El repositorio distribuye un único fichero de pesos, `fuzichoco_style_krea2_v1.safetensors`, de 219 MiB, que se carga sobre el modelo base en ComfyUI, en la propia plataforma RunningHub o desde Hugging Face.

Se trata de un adaptador de bajo rango (LoRA), no de un modelo completo: no redefine la arquitectura del generador, sino que inyecta matrices de bajo rango en capas del modelo base para desplazar su distribución de salida hacia el estilo objetivo. Por eso el coste de almacenamiento es reducido (0,2 GB de repositorio) y el requisito real de cómputo y VRAM lo determina el modelo krea2 sobre el que se aplique.

La relevancia de esta ficha es acotada y conviene ser explícito: el modelo acumula 0 descargas y 0 likes, la licencia no está declarada, no se documentan idiomas soportados ni datos de entrenamiento (número de tokens, composición del dataset, pasos o técnica de ajuste), y no requiere palabra de activación ("不需要触发词"). Es, por tanto, un adaptador de estilo útil para flujos de ilustración, pero sin validación independiente ni métricas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (low-rank adaptation) sobre el modelo base krea2; arquitectura del modelo base no disponible |
| Parametros totales | No disponible (adaptador de bajo rango; fichero de pesos de 219 MiB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de generación y edición de imagen); no disponible para el modelo base |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en safetensors y habitualmente se cargan en fp16/bf16 o se fusionan con el base |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card remite a la licencia del proyecto original o del upstream) |
| Formato de pesos | safetensors (`fuzichoco_style_krea2_v1.safetensors`, 219 MiB) |
| Tipo de modelo | LoRA de estilo para generación y edición de imagen (image-text-to-image) |
| Modelo base | krea2 |
| Palabras de activacion | Ninguna (no requiere trigger words) |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto distribuido es un adaptador LoRA: un conjunto de matrices de bajo rango que se acoplan a capas del modelo base krea2 para modular su comportamiento sin reentrenar los pesos originales. Esta aproximación reduce el tamaño del fichero (219 MiB frente a los pesos completos del generador) y permite alternar estilos cargando y descargando adaptadores sobre una misma instancia del base, algo habitual en flujos de ComfyUI. La arquitectura interna del modelo base krea2 no se detalla en la información disponible, por lo que no es posible concretar si se trata de un transformer de difusión, de un modelo híbrido ni su número de parámetros.

No hay información publicada sobre el proceso de entrenamiento: se desconoce el número de imágenes o tokens utilizados, la composición del dataset, la resolución de entrenamiento, el rango del LoRA, la tasa de aprendizaje, el número de pasos ni si se aplicaron técnicas de ajuste preferencial (RLHF, DPO) o regularización. Tampoco se documenta si el adaptador se entrenó sobre pares imagen-texto, sobre pares de edición imagen-imagen o sobre ambos. La model card únicamente indica el modelo de origen ("Finetuned from: krea2") y que no se necesita palabra de activación, lo que suele indicar que el estilo se activa con la simple presencia del adaptador en el pipeline.

## Capacidades

- Transferencia de estilo de ilustración: aplica la estética asociada a "fuzichoco" sobre las salidas del modelo base krea2, sin necesidad de palabra de activación.
- Generación text-to-image: produce imágenes a partir de una descripción textual cuando se combina con el modelo base.
- Edición image-to-image: el pipeline declarado (`image-text-to-image`) permite partir de una imagen de entrada y modificarla guiándose por el prompt, conservando en mayor o menor medida la composición original.
- Integración en ComfyUI: el repositorio está etiquetado como `comfyui` y `lora`, por lo que su uso previsto es el nodo de carga de LoRA de ese entorno.
- Ejecución en la nube: puede utilizarse a través de la plataforma RunningHub y de su API sin infraestructura local.
- Capacidades multimodales adicionales (visión general, audio, vídeo): no disponibles.
- Soporte de tool calling, function calling y razonamiento multi-paso agéntico: no aplica (no es un modelo de lenguaje).
- Capacidades multilingües: no disponibles; no se especifican los idiomas admitidos en el prompt.

## Casos de uso

- Ilustración de portadas y láminas: cargando el LoRA sobre krea2 en ComfyUI se pueden generar ilustraciones con una estética anime consistente para portadas de libros, fanzines o impresiones, manteniendo un mismo estilo a lo largo de una serie variando únicamente el prompt.
- Repintado de bocetos y line art (image-to-image): al trabajar sobre una imagen de entrada, permite colorear y texturizar bocetos propios conservando las líneas y la composición, lo que encaja en un flujo de trabajo de ilustrador profesional.
- Concept art para videojuegos y animación: generación rápida de variantes de personajes y escenarios con una dirección de arte fija, útil en fases de exploración previas al modelado o al dibujo final.
- Previsualización de encargos: el ilustrador puede producir varias propuestas de estilo en minutos para que el cliente elija una dirección antes de invertir horas en la pieza definitiva.
- Contenido para marketing y redes sociales: creación de imágenes con estética ilustrada para campañas y publicaciones periódicas, donde la coherencia visual entre piezas es más importante que el fotorrealismo.
- Producción por lotes sin GPU local: mediante la API de RunningHub se puede automatizar la generación de una batería de imágenes con este estilo sin disponer de hardware propio, integrándolo en un script o en un pipeline de publicación.
- Exploración de estilo combinada con otros adaptadores: en ComfyUI es posible encadenar este LoRA con otros adaptadores compatibles con el modelo base (por ejemplo, de composición o de detalle) siempre que existan versiones entrenadas para krea2, para afinar el resultado final.
- Catalogación y pruebas de concepto de dirección artística: comparar el mismo prompt con y sin el LoRA permite evaluar cuánto aporta el estilo antes de adoptarlo en un proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas objetivas (FID, CLIP score, ImageReward), comparativas visuales ni evaluaciones humanas. Tampoco se documentan el tiempo de inferencia, el número de pasos recomendado ni la resolución de entrenamiento, por lo que no es posible establecer una tabla de rendimiento sin caer en datos inventados.

## Requisitos de hardware

- El adaptador en sí es ligero: 219 MiB de pesos, con un coste de VRAM despreciable frente al del modelo base. El requisito real de memoria y cómputo lo determina krea2.
- VRAM estimada para inferencia: no disponible, porque no se especifica el tamaño ni la arquitectura del modelo base. Cualquier cifra concreta sería especulativa.
- Referencia genérica orientativa (no verificada para krea2): los transformadores de difusión de gama alta del tipo FLUX.1 [dev] (12 000 millones de parámetros) rondan los 24 GB de VRAM en bf16 y bajan a aproximadamente 8-12 GB con cuantizaciones GGUF o NF4. Los adaptadores SDXL (aproximadamente 6900 millones de parámetros) funcionan con 8-12 GB en fp16. Estas cifras son solo un orden de magnitud y no deben tomarse como requisito de este adaptador.
- GPU recomendadas: no disponible para el modelo base. Como referencia general, una RTX 4090 (24 GB) o una A100/H100 (40-80 GB) cubren con holgura pipelines de difusión de gama alta; tarjetas consumer de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) suelen ser suficientes con cuantización.
- Compatibilidad con GPU de consumo: no confirmada para este adaptador concreto; depende enteramente del modelo base y de la cuantización empleada.
- Opciones de despliegue: ComfyUI (entorno indicado por las etiquetas del repositorio), la plataforma y la API de RunningHub, y Hugging Face como origen de los pesos. El uso con diffusers u otros runners no está documentado para krea2.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Alternativa | Tipo | Modelo base | Tamano de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-krea-2-fuzichoco-style-lora | LoRA de estilo | krea2 | 219 MiB | no disponible | Hugging Face y RunningHub; 0 descargas |
| krea2 sin el adaptador | Modelo de generación de imagen | no aplica | no disponible | no disponible | requiere acceso al modelo base |
| Otros LoRA de estilo para krea2 | LoRA de estilo | krea2 | no disponible | no disponible | no disponible |
| LoRA de estilo para familias FLUX o SDXL | LoRA de estilo | FLUX.1 / SDXL | no disponible | varía según autor | ecosistemas amplios, pero no comparables directamente con krea2 |

No se dispone de datos verificables de parámetros, contexto o rendimiento de modelos comparables en la información proporcionada. La única comparación metodológicamente sólida es ejecutar el mismo prompt y la misma semilla con y sin el adaptador sobre krea2, algo que no se ha publicado.

## Limitaciones y advertencias

- Licencia sin declarar: la model card indica que los derechos pertenecen al autor y remite a la licencia del proyecto original o del upstream. Antes de cualquier uso comercial hay que verificar la licencia del modelo base krea2 y la del propio adaptador; a día de hoy no están especificadas.
- Riesgo legal y ético por estilo de autor: el adaptador reproduce el estilo de un ilustrador identificable. El entrenamiento de LoRA sobre obra de terceros y su explotación comercial pueden plantear problemas de derechos de autor y de atribución según la jurisdicción; conviene revisarlo antes de publicar.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha. No hay evaluaciones independientes, comparativas ni reportes de fallos.
- Reproducibilidad nula: no se documentan dataset, hiperparámetros, rango del LoRA, resolución de entrenamiento ni proceso de ajuste. No es posible replicar el entrenamiento ni auditar los datos utilizados.
- Riesgo de sobreajuste al estilo: los LoRA de estilo pueden forzar la estética incluso cuando el prompt pide otra dirección artística, reduciendo la fidelidad al texto.
- Artefactos de generación: como cualquier adaptador sobre un modelo de difusión, puede producir errores anatómicos (manos, dedos), texto ilegible y detalles incoherentes, especialmente en escenas con muchas figuras.
- Idiomas e instrucciones: se desconoce qué idiomas admite el prompt. Si el modelo base está entrenado mayoritariamente en inglés, los prompts en castellano pueden degradar el resultado.
- Degradación en dominios ajenos al estilo: previsiblemente pierde utilidad para fotorrealismo, arquitectura, producto o ilustración técnica, donde el estilo aprendido actúa como ruido.
- Dependencia de terceros: el adaptador carece de valor por sí solo; si el modelo base krea2 deja de distribuirse o cambia de licencia, el adaptador queda inutilizable.
- Idiomas soportados y sesgos demográficos: no disponibles; no hay documentación sobre sesgos de representación en el dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-krea-2-fuzichoco-style-lora
- Model card en chino: https://huggingface.co/RunningHubAI/rh-krea-2-fuzichoco-style-lora/blob/main/README_cn.md
- Proyecto original en RunningHub China: https://www.runninghub.cn/model/public/2073940105701707778
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1998616841276772354
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
