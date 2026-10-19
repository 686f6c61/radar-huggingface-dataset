# RunningHubAI/rh-facial-expression-transfer-lora

## Resumen

`rh-facial-expression-transfer-lora` es un adaptador LoRA para edición de imagen publicado por RunningHubAI (autor acreditado en la model card como RunningHub-@阿拉丁是阿拉灯) sobre el modelo base Qwen-Edit-2509. No es un modelo de lenguaje: es un peso auxiliar que se carga junto al modelo de difusión base para realizar una tarea muy concreta de transferencia de expresión facial entre dos imágenes. El repositorio ocupa 0,2 GB y contiene un único fichero de pesos de 225 MiB.

La función del adaptador es tomar una imagen 1 (persona objetivo) y una imagen 2 (referencia de expresión) y modificar únicamente los detalles faciales de la persona de la imagen 1 —curvatura de las comisuras de la boca, forma de las cejas, dirección de la mirada— para que coincidan con la expresión de la imagen 2, preservando peinado, ropa, fondo y postura originales. Está pensado para ejecutarse en ComfyUI, en la plataforma RunningHub o vía API, lo que lo sitúa en el flujo típico de posproducción fotográfica y generación de contenido.

Su relevancia es práctica más que arquitectónica: resuelve el problema del "retargeting" de expresión sin rehacer la imagen completa, algo útil cuando la identidad y el encuadre deben permanecer intactos. Como contrapartida, la ficha pública es muy escasa: no declara licencia, idiomas, dataset de entrenamiento, hiperparámetros ni resultados de evaluación, y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de edicion de imagen Qwen-Edit-2509; la arquitectura interna del modelo base no se documenta en la informacion disponible |
| Parametros totales | No disponible. El fichero de pesos ocupa 225 MiB, lo que equivaldria a un orden de 110-120 M de parametros en bf16 (estimacion propia a partir del tamano, no confirmada por el autor) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible / no aplica: modelo de edicion de imagen, sin ventana de contexto textual declarada |
| Tipos de cuantizacion | No disponible. Se distribuye en safetensors con precision del adaptador no declarada; se aplica sobre el base en la precision que use el pipeline (fp16/bf16/fp8) |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La model card remite a la licencia del proyecto original o del modelo upstream y no se incluye fichero de licencia en el repositorio |
| Formato de pesos | safetensors (LoRA), fichero `edit2509表情迁移.safetensors` de 225 MiB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de edición de imagen, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Qwen-Edit-2509 sin modificar los pesos originales. La tarea se plantea como una edición condicionada por dos imágenes: la imagen fuente aporta identidad, encuadre, ropa, fondo y postura, y la imagen de referencia aporta exclusivamente la configuración muscular de la expresión facial. El pipeline declarado en HuggingFace es `image-text-to-image`, coherente con un modelo de edición que acepta instrucciones textuales además de las imágenes de entrada.

No se han publicado detalles del entrenamiento: ni número de pasos, ni tamaño o composición del dataset, ni resolución de entrenamiento, ni si hubo ajuste fino adicional con preferencias (RLHF/DPO), ni qué rango y alpha se emplearon en el LoRA. La model card únicamente indica que el modelo se ajustó desde Qwen-Edit-2509 y que el entrenamiento se realizó en la plataforma RunningHub, que ofrece servicio de entrenamiento de modelos. Tampoco se documentan innovaciones técnicas asociadas (decodificación especulativa, atención lineal, destilación de pasos u otras).

## Capacidades

- Transferencia de expresión facial entre dos imágenes: replica la expresion de la figura 2 sobre el rostro de la figura 1.
- Edición localizada: modifica comisuras de la boca, forma de las cejas y dirección de la mirada sin alterar peinado, ropa, fondo ni postura.
- Edición guiada por texto e imágenes (pipeline `image-text-to-image`), heredando las capacidades del base Qwen-Edit-2509.
- Integración en ComfyUI como nodo de LoRA dentro de un grafo de edición de imagen.
- Ejecución en la nube mediante la plataforma RunningHub y su API, sin necesidad de infraestructura propia.
- Compatibilidad con Hugging Face como repositorio de pesos (descarga del safetensors e integración manual).
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje ni un agente.
- Capacidades multilingües: no documentadas; la model card está en inglés y existe un `README_cn.md` en chino, pero no se especifica el comportamiento del modelo ante prompts en distintos idiomas.
- Capacidades especiales: no se declaran modos de "thinking", visión general, audio ni otras funciones fuera de la edición facial.

## Casos de uso

- Retoque de retrato en estudio: partiendo de una sesión fotográfica con encuadre, vestuario e iluminación fijados, se toma una expresion de referencia (por ejemplo, una sonrisa abierta) y se aplica a todas las tomas sin reencuadrar ni reiluminar, lo que reduce el numero de disparos necesarios y el trabajo de seleccion.
- Localización y doblaje audiovisual: al adaptar una escena a otro idioma o a otro registro emocional, se transfiere la expresion del actor de doblaje o de una toma alternativa a los fotogramas clave, manteniendo continuidad de vestuario y decorado entre planos.
- Comercio electrónico y moda: en catálogos de producto con modelo, se generan variantes de expresion (neutra, sonriente, sorprendida) sobre la misma fotografía, conservando la prenda y el fondo, sin repetir la sesión de fotos.
- Aumento de datos para visión por computador: generar pares imagen-expresion etiquetados para entrenar o evaluar clasificadores de emoción y detectores de puntos faciales, manteniendo constante la identidad y el contexto para aislar la variable de expresión.
- Previsualización de storyboard y animática: sobre bocetos o renders de personajes, probar distintas expresiones en la fase de diseño sin volver a modelar ni texturizar, comparando opciones de dirección artística de forma rápida.
- Retratos de personajes para videojuegos y narrativa interactiva: producir variantes de retrato de un NPC (enfado, alegría, miedo) a partir de una única ilustración base, manteniendo la coherencia visual del elenco.
- Contenido para redes sociales y marketing: reutilizar una fotografía corporativa o de marca personal generando variantes de expresión para distintos mensajes y formatos, sin perder la identidad visual del sujeto.
- Automatización vía API en pipelines de producción: encadenar la transferencia de expresión dentro de un flujo en ComfyUI o mediante la API de RunningHub, aplicándola por lotes a colecciones de imágenes con una expresión de referencia común.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, SSIM, LPIPS, similitud de identidad, precisión de expresión), ni comparaciones con otros métodos de transferencia de expresión, ni evaluaciones humanas.

## Requisitos de hardware

- VRAM del adaptador: unos 225 MiB adicionales sobre el modelo base; el consumo dominante lo determina Qwen-Edit-2509, cuyas cifras no se documentan en la información disponible.
- GPU recomendadas: no disponible. Al tratarse de un modelo de difusión de edición de imagen de la familia Qwen, el requisito real vendrá marcado por el base y por la resolución de trabajo, no por el LoRA.
- Encaje en GPU de consumo: no confirmado. Depende enteramente del base y de si el pipeline aplica offloading de pesos a CPU o a VRAM; no hay cifras publicadas por el autor.
- Opciones de despliegue: ComfyUI (entorno principal declarado), plataforma RunningHub (ejecución en la nube) y su API HTTP; también es posible descargar el safetensors desde Hugging Face e integrarlo en un pipeline propio compatible con LoRA sobre Qwen-Edit-2509. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. No se publican tiempos por imagen, número de pasos de muestreo recomendado ni tamaño de lote soportado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-facial-expression-transfer-lora | No disponible (LoRA de 225 MiB) | No aplica | Sin benchmarks publicados | No disponible | Hugging Face, RunningHub, ComfyUI |
| Qwen-Edit-2509 (modelo base) | No disponible en la informacion proporcionada | No disponible | Sin datos en esta ficha | No disponible | Requiere consultar el repositorio del base |
| Otros LoRA de transferencia de expresion para ComfyUI | No disponible | No aplica | No disponible | No disponible | Repositorios de la comunidad; datos no verificados en esta ficha |

No se dispone de información suficiente para establecer una comparación cuantitativa con alternativas de la misma categoría. La comparación más directa y fiable es contra el propio modelo base sin el adaptador: Qwen-Edit-2509 permite edición guiada por instrucciones, pero no incorpora de serie el comportamiento específico de transferir la expresión desde una segunda imagen que este LoRA aporta.

## Limitaciones y advertencias

- Licencia no disponible: no se incluye fichero de licencia y la model card delega en la licencia del proyecto original o del upstream. Antes de un uso comercial es imprescindible verificar los términos de Qwen-Edit-2509 y contactar con el autor.
- Ausencia total de evaluación: sin benchmarks, sin métricas de identidad ni de fidelidad de expresión, y sin ejemplos comparativos de antes y después en la información disponible.
- Madurez del repositorio: 0 descargas y 0 valoraciones en el momento de la consulta, creado y actualizado el mismo día; no hay evidencia de uso en producción ni de mantenimiento posterior.
- Riesgo de deriva de identidad: al estar entrenado para copiar rasgos de una segunda imagen, puede filtrar características de la persona de referencia (forma de ojos, pliegues, tono de piel) si la expresión es muy extrema o el parecido entre ambas caras es alto.
- Degradación esperada en casos difíciles: perfiles marcados, rostros ocluidos (manos, gafas, pelo sobre la cara), iluminación muy dura, resoluciones bajas o expresiones asimétricas no están documentados ni validados.
- Sin control de sesgos: no se describe la composición del dataset de entrenamiento, por lo que se desconocen sesgos de edad, género, etnia o tipo de rostro, así como el rendimiento fuera de la distribución mayoritaria.
- Alucinación visual: como todo modelo generativo, puede inventar texturas de piel, dientes o reflejos inconsistentes con la foto original; no hay guía sobre pesos de LoRA, CFG o pasos recomendados para mitigarlo.
- Idiomas no declarados: se desconoce si las instrucciones textuales del pipeline funcionan igual en castellano que en inglés o chino.
- Fuera de alcance: no sirve para generación de texto, código, razonamiento, tool calling ni tareas de agente; cualquier uso en esos dominios sería un error de categoría.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-facial-expression-transfer-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-facial-expression-transfer-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2005643703312154626
- Página del autor: https://www.runninghub.cn/user-center/1943598742899462146
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API del modelo: https://www.runninghub.ai/call-api?utm_source=huggingface&utm_medium=badge&utm_campaign=api_promotion&utm_content=rh-2005643703312154626
