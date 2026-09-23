# FluidInference/gliner2-5-base-coreml

## Resumen

GLiNER2.5 base Core ML classification es una conversion a Core ML en FP16 del camino de decision de clasificacion del modelo Fastino GLiNER2.5 base (revision `1a8bc24e00dc7300b9017c81d63e3dcdabb26596`), publicada por FluidInference. No se trata de un modelo nuevo ni de un reentrenamiento: es un artefacto de despliegue que empaqueta el encoder entrenado y la cabeza de clasificacion del checkpoint original, con 184.945.921 parametros de los 193.581.591 totales del modelo de origen. El paquete excluye explicitamente la exportacion de entidades, relaciones, registros y spans, por lo que solo cubre la tarea de clasificacion de texto con etiquetas definidas en tiempo de inferencia.

El objetivo es ejecutar clasificacion zero-shot sobre hardware Apple (Apple Silicon, Neuronal Engine) sin cargar los pesos PyTorch originales en tiempo de ejecucion. El paquete se denomina L128/K8: 388.981.604 bytes (aproximadamente 0,39 GB) y soporte de hasta ocho etiquetas simultaneas, con destino a iOS 17 y macOS 14 o superiores. Incluye el tokenizer y un `preprocessing.py` que reproduce el renderizado de esquema nativo del modelo original.

Su relevancia es practica: permite integrar un clasificador zero-shot de 185 M de parametros en aplicaciones locales de Apple con latencias de milisegundos, sin dependencia de servicios en la nube ni de entornos Python con PyTorch. La contrapartida es que se trata de un artefacto muy acotado, sin benchmarks publicados mas alla de una comprobacion de paridad funcional, y con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo transformer con cabeza de clasificacion (GLiNER2.5 base); conversion Core ML del camino de decision de clasificacion |
| Parametros totales | 184.945.921 (paquete Core ML, encoder + cabeza). El checkpoint original tiene 193.581.591 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens segun la denominacion del paquete (L128); no disponible como especificacion oficial del modelo original |
| Tipos de cuantizacion | FP16 (Core ML) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (.mlpackage, FP16); tamano del paquete 388.981.604 bytes |
| Etiquetas por inferencia | Hasta 8 (denominacion K8) |
| Libreria | coremltools |
| Plataformas objetivo | iOS 17, macOS 14 o superiores (Apple Silicon) |
| Pipeline | text-classification |
| Revision del checkpoint original | 1a8bc24e00dc7300b9017c81d63e3dcdabb26596 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna con detalle: se indica que el modelo original es Fastino GLiNER2.5 base, con 193.581.591 parametros, y que esta conversion Core ML contiene el encoder entrenado mas la cabeza de clasificacion (184.945.921 parametros). GLiNER es una familia de modelos orientada a extraccion de informacion zero-shot basada en etiquetas proporcionadas en tiempo de inferencia; en este paquete solo se exporta la ruta de decision de clasificacion, no las cabezas de entidades, relaciones, registros o spans.

No se aportan datos sobre el entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF o DPO), y esta conversion no implica entrenamiento alguno: Fluid Inference se limita a convertir pesos, fijar dependencias y publicar los hashes de los activos junto con los scripts de conversion. La innovacion tecnica relevante es de despliegue: la reproduccion del renderizado de esquema nativo mediante el tokenizer incluido y `preprocessing.py`, de forma que no es necesario cargar los pesos PyTorch originales en tiempo de ejecucion, y la ejecucion en FP16 sobre el stack Core ML de Apple.

## Capacidades

- Clasificacion de texto con etiquetas arbitrarias definidas en tiempo de inferencia (zero-shot), hasta un maximo de 8 etiquetas por peticion.
- Reproduccion del esquema nativo de GLiNER2.5 para clasificacion, incluyendo tokenizer y preprocesado propios.
- Inferencia local en Apple Silicon mediante Core ML, con soporte de la ruta FP16.
- Ejecucion sin PyTorch en tiempo de ejecucion: el paquete es autocontenido (tokenizer, `preprocessing.py`, `runtime.py`).
- No incluye generacion de texto, razonamiento multi-paso, codigo ni matematicas.
- No incluye extraccion de entidades, relaciones, registros ni spans (deben usarse con el checkpoint original).
- No hay informacion sobre soporte de tool calling, function calling ni comportamiento agentico.
- No hay informacion sobre capacidades multilingues.

## Casos de uso

- Clasificacion de temas en aplicaciones iOS: el paquete se ejecuta en el dispositivo con Core ML y etiquetas definidas por el desarrollador (por ejemplo `["science","sports","politics"]`), con una latencia mediana de 8,82 ms por llamada desde Python en un M5 Pro, lo que permite clasificar en hilos de interfaz sin llamadas de red.
- Moderacion de contenido en local: clasificar textos de entrada en categorias configurables antes de enviarlos a un servicio remoto, manteniendo el contenido sensible dentro del dispositivo.
- Enrutado de tickets de soporte: asignar cada mensaje entrante a una de hasta ocho categorias para dirigirlo al equipo correspondiente, aprovechando la ausencia de coste por token y de dependencias externas.
- Etiquetado de conjuntos de datos en macOS: procesar lotes de textos con un clasificador zero-shot para preanotar corpora y reducir el trabajo manual de anotacion humana.
- Filtrado previo en pipelines de NLP: actuar como primera etapa que descarta o prioriza documentos antes de pasarlos a modelos mayores, dado su tamano reducido (0,39 GB) y su ejecucion en el Neural Engine.
- Funciones de accesibilidad y organizacion personal: clasificar notas, correos o mensajes en categorias definidas por el usuario dentro de una app nativa, sin salida a servidores.
- Clasificacion de intenciones en asistentes embebidos: determinar la intencion de una consulta corta (hasta 128 tokens segun el empaquetado) antes de invocar la logica correspondiente.
- Deteccion de idioma o tono cuando las etiquetas se definen como categorias: el modelo no declara idiomas soportados, por lo que el uso multilingue requiere validacion propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de evaluacion es una comprobacion de paridad funcional ("smoke parity check"), no una puntuacion completa:

| Metrica | Valor | Condiciones |
|---|---|---|
| Coincidencia de etiqueta elegida frente al modelo nativo | 100 de 100 peticiones elegibles | M5 Pro, macOS 27.0, FP16, suite de aplicacion fija |
| Diferencia maxima de confianza en la etiqueta elegida | 0,002999 | Mismo entorno |
| Tiempo mediano de llamada en Python (Core ML) | 8,82 ms | Mismo entorno, no es una medida exclusiva de ANE |
| Filas descartadas antes de la muestra | 300 con mas de 8 opciones y 7 por exceso de longitud | Filtrado previo a la seleccion de las 100 peticiones |

El propio autor indica que se trata de una comprobacion de paridad y no de una puntuacion completa del Decision Index ni de una medida de latencia exclusiva del Neural Engine. Los detalles estan en `verify-application100.json`.

## Requisitos de hardware

- VRAM/almacenamiento: el paquete ocupa 388.981.604 bytes (aproximadamente 0,39 GB) en disco; el modelo opera en FP16 sobre Core ML.
- Hardware de destino: Apple Silicon con iOS 17 o macOS 14 y superiores. La medicion publicada se realizo en un Apple Silicon M5 Pro con macOS 27.0.
- No requiere GPU dedicada ni aceleradores tipo A100, H100 o RTX 4090: el objetivo es el Neural Engine y la GPU integrada de Apple.
- Si cabe en hardware de consumo: si, en cualquier Mac con Apple Silicon y en dispositivos iOS 17+ compatibles, dado el tamano del artefacto.
- Opciones de despliegue: Core ML a traves de coremltools; el repositorio incluye `runtime.py` para ejecucion en Python (`uv sync` y `uv run python runtime.py --model-dir . --text ... --task topic --labels ...`). No se contemplan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo y el formato de pesos no es GGUF ni safetensors.
- Latencia: 8,82 ms de mediana por llamada en Python sobre M5 Pro para la muestra evaluada. No hay datos de throughput por lotes ni de latencia en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/limite | Formato y plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| FluidInference/gliner2-5-base-coreml (este) | 184.945.921 (paquete) | Hasta 8 etiquetas; L128 segun empaquetado | Core ML FP16, Apple Silicon | Apache 2.0 | Solo clasificacion; paridad 100/100 en prueba smoke |
| fastino/gliner2.5-base-v1 (original) | 193.581.591 | no disponible | Pesos PyTorch en HuggingFace | Apache 2.0 | Incluye entidades, relaciones, registros y spans, no exportados en la conversion |
| Otros modelos GLiNER de la familia | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de informacion verificada sobre alternativas comparables (por ejemplo clasificadores zero-shot de tamano similar) en la documentacion facilitada.

## Limitaciones y advertencias

- El paquete no exporta extraccion de entidades, relaciones, registros ni spans; para esas tareas hay que usar el checkpoint original de Fastino.
- Limite funcional de 8 etiquetas por inferencia: en la evaluacion publicada se descartaron 300 filas con mas de 8 opciones.
- Limite de longitud: 7 filas se descartaron por exceso de longitud en la muestra evaluada, coherente con la denominacion L128 del paquete.
- Es un artefacto de clasificacion, no un modelo generativo: no admite conversacion, generacion de codigo ni razonamiento multi-paso.
- La cuantizacion FP16 introduce desviaciones numericas respecto al modelo nativo; el autor reporta una diferencia maxima de confianza de 0,002999 en su prueba.
- La prueba de paridad es una comprobacion smoke sobre 100 peticiones de una suite concreta, no una evaluacion exhaustiva; no debe extrapolarse a todos los dominios.
- No hay informacion publicada sobre idiomas soportados, sesgos del modelo original ni tasas de alucinacion o error por dominio.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribucion a Fastino (checkpoint original) y a Fluid Inference (conversion).
- El repositorio presenta 0 descargas y 0 likes, y el artefacto apunta a versiones recientes de iOS/macOS, lo que reduce la evidencia de uso en produccion por terceros.
- La busqueda web realizada no ha devuelto documentacion tecnica adicional relevante sobre este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidInference/gliner2-5-base-coreml
- Checkpoint original: https://huggingface.co/fastino/gliner2.5-base-v1
- Revision del checkpoint original: 1a8bc24e00dc7300b9017c81d63e3dcdabb26596
- Otros enlaces (papers, blogs, repos, demos): no disponible en la informacion proporcionada
