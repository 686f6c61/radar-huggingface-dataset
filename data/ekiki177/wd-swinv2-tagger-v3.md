# Ekiki177/wd-swinv2-tagger-v3

## Resumen

WD SwinV2 Tagger v3 es un modelo de etiquetado automatico de imagenes (image tagging) de tipo multietiqueta, basado en un backbone Swin Transformer V2. Predice, a partir de una ilustracion, tres categorias de etiquetas: rating (clasificacion de contenido), personajes y etiquetas generales, siguiendo el vocabulario del booru Danbooru. El modelo original lo desarrolla SmilingWolf; el repositorio analizado (Ekiki177/wd-swinv2-tagger-v3) es una copia espejo con licencia Apache 2.0, 0 descargas y 0 likes en el momento de la consulta.

El modelo cuenta con 98.026.341 parametros, lo que lo situa en la gama de vision de tamano medio-pequeno: es ejecutable en CPU y en cualquier GPU de consumo. Se distribuye en dos formatos, safetensors compatible con la libreria timm y ONNX, lo que facilita su integracion tanto en entornos PyTorch/JAX como en pipelines de inferencia ligeros con onnxruntime.

Su relevancia actual esta en el preprocesado de datasets para entrenamiento de modelos de difusion: es una de las herramientas de referencia para el autotagueado de imagenes estilo anime, generacion de metadatos en gestores de galerias y filtrado de contenido por rating. La tercera version del dataset incorpora imagenes y etiquetas mas recientes (hasta el 28 de febrero de 2024) y utiliza Macro-F1 como metrica de seguimiento, con un F1 de 0,4541 en validacion frente al 0,4411 de la version anterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 (SwinV2) con cabeza de clasificacion multietiqueta |
| Parametros totales | 98.026.341 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vision; la model card indica que la configuracion incluye el tamano de imagen, pero no especifica el valor) |
| Tipos de cuantizacion | no se documentan cuantizaciones oficiales; pesos en FP32 tanto en safetensors como en ONNX |
| Idiomas soportados | no disponible; el vocabulario de etiquetas proviene de Danbooru (etiquetas en ingles y romanizaciones de japones) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con timm) y ONNX (model.onnx) |
| Libreria declarada | timm |
| Dependencias de runtime | onnxruntime >= 1.17.0 para el modelo ONNX |
| Tamano del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un Swin Transformer V2, un transformer jerarquico con atencion por ventanas desplazadas y mecanismos de escalado de la atencion, adaptado aqui como cabezal de clasificacion multietiqueta en lugar de generacion. El entrenamiento se realizo con el framework JAX-CV de SmilingWolf sobre TPUs proporcionadas por el programa TRC de Google. El vocabulario de salida cubre simultaneamente ratings, personajes y etiquetas generales de Danbooru.

El dataset es Danbooru hasta el ultimo image id 7.220.105, con particion basada en el identificador de imagen: entrenamiento con IDs modulo 0000-0899 y validacion con IDs modulo 0950-0999. Se filtraron las imagenes con menos de 10 etiquetas generales y las etiquetas con menos de 600 imagenes asociadas, lo que reduce el ruido pero limita la cobertura de conceptos poco frecuentes. Las etiquetas llegan hasta el 28 de febrero de 2024.

En la version 2.0 del modelo (dataset v3) se anadieron epocas de entrenamiento y se introdujo un escalado de la funcion de perdida basado en la frecuencia de las etiquetas para combatir el desbalanceo de clases, problema estructural en vocabularios tipo booru con cola larga. La version 1.1 solo corrigio el fichero de configuracion de JAX para anadir el tamano de imagen, sin cambios en los pesos. La version 1.0 paso a ser compatible con timm y libero un modelo ONNX con dimension de batch no fija, habilitando inferencia por lotes. No se documenta uso de RLHF ni DPO, ya que no es un modelo generativo conversacional.

## Capacidades

- Clasificacion multietiqueta de imagenes: devuelve simultaneamente etiquetas de rating, personajes y etiquetas generales del vocabulario Danbooru.
- Prediccion de rating: distingue niveles de contenido segun la taxonomia del booru (general, sensitive, questionable, explicit).
- Reconocimiento de personajes de ilustracion anime con vocabulario cerrado al dataset de entrenamiento.
- Inferencia por lotes: la dimension de batch del modelo ONNX no esta fija a 1, lo que permite procesar varias imagenes por pasada.
- Compatibilidad con timm: se puede cargar con el flujo habitual de la libreria y usar los pesos safetensors directamente en PyTorch.
- Compatibilidad con onnxruntime >= 1.17.0 para despliegues sin dependencia de frameworks de deep learning completos.
- No soporta generacion de texto, tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades de vision general (deteccion de objetos, segmentacion, VQA, OCR) ni de audio; su salida esta restringida al vocabulario de etiquetas entrenado.
- Multilingue limitado: las etiquetas estan en ingles y romanizaciones de japones propias de Danbooru, no en castellano ni en otros idiomas.

## Casos de uso

- Etiquetado automatico de datasets para entrenamiento de LoRA y DreamBooth: el tagger genera las etiquetas de texto que acompanan a cada imagen en el proceso de fine-tuning de modelos de difusion, reduciendo el trabajo manual de anotacion.
- Curacion de datasets a gran escala: con inferencia por lotes y ejecucion en CPU, se pueden procesar colecciones de decenas de miles de imagenes para normalizar etiquetas y detectar duplicados o conceptos mal etiquetados.
- Filtrado de contenido por rating: la salida de rating permite automatizar la separacion de contenido general y contenido sensible o explicito en repositorios y plataformas de publicacion.
- Gestion de galerias y buscadores internos: las etiquetas predichas se indexan para habilitar busqueda por personaje, por atributos visuales o por categoria, algo util en bibliotecas de ilustracion propias.
- Preprocesado en pipelines de captioning: el tagger actua como primer paso que aporta etiquetas estructuradas, sobre las que despues un modelo de lenguaje visual anade descripciones en lenguaje natural, como hace el proyecto bozoyan/wd-tagger con GLM-4.1V.
- Monitorizacion de contenido generado: en un pipeline de generacion de imagenes, el tagger puede verificar de forma automatica que la imagen final contiene los atributos solicitados (personaje, estilo, rating) antes de publicarla.
- Moderacion asistida en comunidades de arte: combinado con umbrales de confianza ajustables, sirve como primera linea de clasificacion previa a la revision humana.
- Enriquecimiento de metadatos en herramientas de escritorio: al ser un modelo de 98 millones de parametros, se integra en aplicaciones locales sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible corresponden a la validacion del propio autor sobre el conjunto de validacion de Danbooru (IDs modulo 0950-0999), medidos con Macro-F1 y con un umbral calculado para igualar precision y recall (P=R).

| Version del modelo | Metrica | Umbral (P=R) | Macro-F1 |
|---|---|---|---|
| v2.0 (modelo actual) | Macro-F1 en validacion | 0,2653 | 0,4541 |
| v1.0 (dataset v3) | Macro-F1 en validacion | 0,2521 | 0,4411 |

No se han publicado resultados de benchmarks de proposito general (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es generativo ni conversacional. Tampoco hay datos publicados de comparacion directa con otros taggers de la misma familia en esta informacion.

## Requisitos de hardware

- VRAM estimada: del orden de 0,4 GB en FP32 para los pesos de 98 millones de parametros, y aproximadamente 0,2 GB en FP16. El repositorio ocupa 1,3 GB porque incluye varios artefactos de pesos.
- CPU: la inferencia es viable en CPU con onnxruntime, sin necesidad de acelerador, a costa de mayor latencia por imagen.
- GPU recomendadas: cualquier GPU de consumo con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior deja margen de sobra para lotes grandes. No se justifica el uso de A100 o H100 para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: onnxruntime >= 1.17.0 para el modelo ONNX; PyTorch con timm para los pesos safetensors; el repositorio original incluye ejemplos en JAX mediante wdv3-jax. No es compatible con servidores de inferencia para modelos de lenguaje como vLLM o TGI, ni con llama.cpp u Ollama, por no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponible. La model card solo confirma que la dimension de batch es dinamica, lo que permite aumentar el throughput agrupando imagenes, pero no publica cifras.

## Comparativa con modelos similares

La informacion proporcionada no incluye fichas tecnicas de las alternativas, por lo que los campos no documentados se marcan como no disponibles.

| Modelo | Arquitectura | Parametros | Dataset | Licencia | Formato |
|---|---|---|---|---|---|
| Ekiki177/wd-swinv2-tagger-v3 | Swin Transformer V2 | 98.026.341 | Danbooru v3 (hasta 2024-02-28) | Apache 2.0 | safetensors, ONNX |
| SmilingWolf/wd-swinv2-tagger-v3 | Swin Transformer V2 | no disponible en la informacion | Danbooru v3 | Apache 2.0 | safetensors, ONNX |
| SmilingWolf/wd-vit-tagger-v3 | Vision Transformer | no disponible | Danbooru v3 | Apache 2.0 | safetensors, ONNX |
| SmilingWolf/wd-convnext-tagger-v3 | ConvNeXt | no disponible | Danbooru v3 | Apache 2.0 | safetensors, ONNX |
| SmilingWolf/wd-eva02-large-tagger-v3 | EVA-02 | no disponible | Danbooru v3 | Apache 2.0 | safetensors, ONNX |

La diferencia practica entre estas variantes esta en el compromiso entre coste computacional y Macro-F1, que la model card del modelo analizado no cuantifica frente al resto de la familia. La eleccion habitual es usar la variante mas ligera que cumpla el umbral de calidad exigido por el pipeline.

## Limitaciones y advertencias

- Dominio restringido: el modelo se entreno exclusivamente con imagenes de Danbooru, por lo que su rendimiento fuera del dominio de ilustracion anime (fotografia, arte realista, renders 3D) no esta validado y previsiblemente se degrada.
- Vocabulario cerrado y sesgado al dataset: solo puede predecir etiquetas que existan en el vocabulario de Danbooru con al menos 600 imagenes. Conceptos raros, personajes minoritarios o estilos poco representados quedan fuera.
- Corte temporal: las etiquetas llegan hasta el 28 de febrero de 2024, de modo que personajes, series o tendencias posteriores no estaran reconocidos o lo estaran de forma incompleta.
- Desbalanceo de clases: la propia model card reconoce el problema y aplica escalado de la perdida por frecuencia de etiqueta, lo que indica que las etiquetas de cola larga siguen siendo el punto debil del modelo.
- Umbral obligatorio: las etiquetas con probabilidad baja respecto al umbral recomendado (0,2653 para esta version) deben descartarse; usar el modelo sin calibrar el umbral produce falsos positivos.
- Falsos positivos y confusion entre personajes visualmente similares: al ser un clasificador multietiqueta sin contexto, es esperable confundir personajes con rasgos parecidos.
- Contenido explicito: el modelo esta entrenado con imagenes de Danbooru, que incluyen material para adultos. Su uso en productos orientados a publico general exige filtrado adicional.
- Ausencia de contexto multimodal: no procesa texto de entrada, no acepta prompts ni instrucciones, y no puede explicar sus predicciones.
- Licencia permisiva pero con caveat practico: Apache 2.0 permite uso comercial, aunque la naturaleza del dataset de entrenamiento puede implicar consideraciones adicionales segun la jurisdiccion y el uso previsto.
- Repositorio espejo: el repositorio analizado es una copia sin descargas ni likes verificables; para produccion conviene referenciar el repositorio original y sus versiones etiquetadas, tal como recomienda el propio autor.
- Sin garantias de mantenimiento: el autor indica que el modelo esta sujeto a cambios y que los usuarios deben fijar versiones concretas en lugar de depender de la cabeza del repositorio.

## Enlaces

- Repositorio analizado: https://huggingface.co/Ekiki177/wd-swinv2-tagger-v3
- Modelo original: https://huggingface.co/SmilingWolf/wd-swinv2-tagger-v3
- Pesos ONNX del modelo original: https://huggingface.co/SmilingWolf/wd-swinv2-tagger-v3/blob/main/model.onnx
- Demo en Spaces: https://huggingface.co/spaces/SmilingWolf/wd-tagger
- Framework de entrenamiento JAX-CV: https://github.com/SmilingWolf/JAX-CV
- Ejemplo de inferencia con timm: https://github.com/neggles/wdv3-timm
- Ejemplo de inferencia con JAX: https://github.com/SmilingWolf/wdv3-jax
- Proyecto de terceros con etiquetado local y captioning: https://github.com/bozoyan/wd-tagger
- Programa TRC de Google: https://sites.research.google/trc/about/
- Espejo en Inferix: https://inferix.co/models/SmilingWolf/wd-swinv2-tagger-v3
- Ficha en directorio de herramientas: https://aiappdex.com/models/smilingwolf-wd-swinv2-tagger-v3/
