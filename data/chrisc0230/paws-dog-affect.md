# chrisc0230/paws-dog-affect

## Resumen

PAWS-Dog-Affect (Pet Affect Watch System) es un clasificador de imagenes desarrollado por el usuario chrisc0230 y publicado en HuggingFace bajo licencia MIT. Su tarea es predecir el estado emocional o comportamental de un perro a partir de una imagen, distinguiendo entre 13 clases: happy, relaxed, excited, playful, curious, alert, anxious, fearful, angry, sad, bored, tired y sleepy. El modelo esta exportado en formato ONNX, lo que indica que su diseno esta orientado a la inferencia ligera, incluida la ejecucion directamente en el navegador.

La relevancia del modelo es acotada y muy especifica: se trata de un clasificador de vision por computador de dominio restringido (etologia canina), no de un modelo de lenguaje ni de un modelo multimodal generalista. El autor reporta unas metricas de accuracy 0,616 y macro-F1 0,652 sobre el conjunto de test, lo que situa su rendimiento en un rango moderado y coherente con una tarea subjetiva y con alta ambiguedad entre clases (por ejemplo, "relaxed" frente a "sleepy" o "curious" frente a "alert").

No se dispone de informacion publica sobre la arquitectura concreta, el numero de parametros, la composicion del dataset de entrenamiento ni la longitud de contexto (no aplicable, al ser un clasificador de imagen). El repositorio ocupa 0,4 GB y fue creado el 26 de septiembre de 2026. La model card esta redactada en italiano y remite a un fichero `metadata.json` interno para los detalles de preprocesado, normalizacion, temperatura de calibracion y umbrales de decision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de clasificacion de imagenes exportado a ONNX; la model card no especifica la red base) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (clasificacion de imagen) |
| Tipos de cuantizacion | no disponible (distribucion en ONNX; se desconoce si incluye variantes INT8/FP16) |
| Idiomas soportados | no disponible (no aplica entrada de texto; las etiquetas de clase estan en ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX (libreria declarada: `onnx`) |
| Tamano del repositorio | 0,4 GB |
| Pipeline | image-classification |
| Numero de clases | 13 |
| Metricas declaradas (test) | accuracy 0,616; macro-F1 0,652 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura subyacente. Los unicos indicios son el tag `onnx`, la libreria `onnx` y el proposito declarado de "inferencia en el navegador", lo que sugiere una red convolucional o un transformer de vision compacto, exportado para ejecucion en CPU o mediante WebGPU/WebAssembly. El autor indica que existe un fichero `metadata.json` con la definicion de la entrada, la normalizacion aplicada, una temperatura de calibracion y umbrales de decision, lo que implica que las probabilidades del modelo se recalibran antes de emitir la etiqueta final.

Tampoco se especifica el volumen de datos de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de ajuste fino supervisado, aumento de datos o aprendizaje por transferencia desde un backbone preentrenado. No hay mencion a RLHF, DPO ni a ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal u otras), algo esperable en un clasificador de imagenes. La unica innovacion reseñable es la propia eleccion del formato ONNX y el enfoque de calibracion con temperatura declarado en la model card.

## Capacidades

- Clasificacion de imagenes de perros en 13 categorias de estado emocional o comportamental: happy, relaxed, excited, playful, curious, alert, anxious, fearful, angry, sad, bored, tired y sleepy.
- Inferencia orientada a navegador y a entornos sin GPU dedicada, gracias a la exportacion en ONNX.
- Salida de probabilidades por clase con umbrales y temperatura de calibracion configurables mediante `metadata.json`.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (la entrada es una imagen; las etiquetas estan en ingles).
- Capacidades especiales: no se documentan modos de razonamiento, vision adicional ni audio; la unica modalidad es imagen de entrada y etiqueta de salida.

## Casos de uso

- Aplicacion web o movil de bienestar animal: el modelo puede ejecutarse en el propio navegador del usuario mediante ONNX Runtime Web, de modo que las fotografias de la mascota no salen del dispositivo, lo que reduce requisitos de privacidad y coste de servidor.
- Analisis de fotografias en redes sociales o comunidades de mascotas: clasificacion automatica de imagenes subidas por usuarios para etiquetar el estado emocional aparente del perro y mejorar la organizacion del contenido.
- Investigacion en etologia asistida por vision artificial: generacion de etiquetas preliminares sobre grandes volumenes de imagenes de perros para estudios de comportamiento, con revision humana posterior dado el macro-F1 de 0,652.
- Prototipado rapido y educacion: al ser un modelo ONNX pequeno con licencia MIT, es adecuado como ejemplo reproducible en cursos de despliegue de modelos en el navegador o de integracion de ONNX Runtime.
- Filtrado y moderacion en plataformas de adopcion: clasificacion de fotos de perros en refugios para priorizar la revision de animales cuyas imagenes sugieren estados de ansiedad, miedo o agresividad.
- Componente de un sistema multimodal mayor: uso como modulo especializado de analisis de imagen dentro de un pipeline que combine texto e imagen, por ejemplo un asistente veterinario que reciba descripcion textual y fotografia.
- Analitica de producto para aplicaciones de cuidado canino: registro agregado de la distribucion de estados emocionales detectados a lo largo del tiempo para detectar patrones (por ejemplo, aumento de etiquetas "anxious" en determinados contextos).

## Benchmarks y rendimiento

Los unicos resultados publicados por el autor son los siguientes, medidos sobre el conjunto de test:

| Metrica | Valor |
|---|---|
| Accuracy | 0,616 |
| Macro-F1 | 0,652 |

No se han publicado resultados de benchmarks comparativos (ImageNet, tareas de afecto animal, etc.) ni desglose por clase en la informacion disponible. El resto de cifras de referencia habituales (MMLU, HumanEval, GSM8K) no aplican a este modelo por no ser generativo ni de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Partiendo del tamano del repositorio (0,4 GB), es razonable esperar que el modelo completo en FP32 quede por debajo de ese valor, pero se trata de una estimacion, no de un dato publicado.
- GPU recomendadas: no disponibles. El formato ONNX y el objetivo declarado de inferencia en navegador apuntan a que la ejecucion en CPU es viable sin GPU dedicada.
- Compatibilidad con GPU de consumo: probable en cualquier GPU de consumo actual e incluso en CPU, dado el tamano del artefacto, si bien no hay especificaciones oficiales al respecto.
- Opciones de despliegue: ONNX Runtime (incluida la variante web), y potencialmente cualquier runtime compatible con ONNX (ONNX Runtime GenAI no aplica, al no ser generativo). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son adecuados para un clasificador de imagenes de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones tecnicas suficientes para establecer una comparacion cuantitativa fiable. La tabla siguiente recoge la comparacion cualitativa con alternativas habituales de la misma categoria (clasificacion de imagenes de animales o de emociones), marcando como no disponible todo aquello que no se puede verificar.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PAWS-Dog-Affect (chrisc0230) | no disponible | no aplicable | accuracy 0,616; macro-F1 0,652 en su test set | MIT | ONNX en HuggingFace |
| Backbones genericos de clasificacion (ResNet, MobileNet, EfficientNet, ViT) ajustados a la tarea | no disponible para esta tarea | no aplicable | no disponible | variable segun backbone | ampliamente disponibles |
| Clasificadores de emocion animal de la literatura academica | no disponible | no aplicable | no disponible | variable | publicaciones, no siempre con pesos abiertos |

La comparacion cuantitativa con modelos equivalentes no es posible con la informacion proporcionada, ya que no se documentan ni el backbone ni el conjunto de evaluacion utilizado.

## Limitaciones y advertencias

- El rendimiento es moderado: accuracy 0,616 y macro-F1 0,652 sobre el test del propio autor, lo que implica una tasa de error proxima al 38 % en la tarea de asignar una unica etiqueta.
- La tarea es intrinsecamente subjetiva: la distincion entre clases como "relaxed", "sleepy" o "bored", o entre "curious", "alert" y "anxious", depende de interpretaciones humanas y puede generar etiquetas inconsistentes incluso entre anotadores.
- No se documenta el dataset de entrenamiento, por lo que se desconocen los sesgos potenciales en cuanto a razas, edades, contextos fotograficos, iluminacion o geografia.
- Riesgo de sobreajuste a las condiciones de captura del conjunto de entrenamiento, algo habitual en clasificadores de imagenes de dominio especifico.
- No se especifica la arquitectura ni el numero de parametros, lo que dificulta evaluar la robustez, el coste computacional real y la idoneidad para produccion.
- La model card esta en italiano y buena parte de los detalles tecnicos se remiten a un fichero `metadata.json` no incluido en la informacion proporcionada; sin ese fichero no es posible reproducir correctamente la normalizacion ni la calibracion.
- No hay informacion sobre el idioma de las etiquetas mas alla del ingles; no aplica soporte multilingue.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias de ningun tipo sobre el rendimiento en produccion.
- El modelo no es generativo: no admite prompts, tool calling, agentes ni razonamiento multi-paso.
- Uso responsable: las predicciones sobre el estado emocional de un animal no deben emplearse para tomar decisiones clinicas, de adopcion o de seguridad sin supervision de un profesional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chrisc0230/paws-dog-affect

Nota: la busqueda web realizada no devolvio ningun resultado relevante relacionado con este modelo, su arquitectura, su dataset o su evaluacion. Los unicos enlaces recuperados no guardan relacion con el modelo ni con la clasificacion de imagenes de animales, por lo que se omite su inclusion. No se dispone de paper, blog tecnico, repositorio de codigo ni demo asociados en la informacion proporcionada.
