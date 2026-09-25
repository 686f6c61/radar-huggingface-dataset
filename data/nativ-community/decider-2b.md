# nativ-community/decider-2b

## Resumen

decider-2b es un modelo de decisiones calibrado desarrollado por Mapika y redistribuido por nativ-community. Se trata de un fine-tuning de Qwen/Qwen3.5-2B-Base que no genera texto libre: dada una entrada y una serie de preguntas tipadas con sus opciones, devuelve en una única pasada forward una distribucion de probabilidad sobre las opciones de cada pregunta. El checkpoint publicado por nativ-community (version v11, revision `533964da`) mantiene los valores y dtypes originales en bf16, pero renombra los pesos de `model.language_model.*` a `model.*` para que carguen con el loader estandar de mlx-vlm.

El modelo tiene 1.881.825.088 parametros reales segun los safetensors del repositorio (aproximadamente 1,88 mil millones) y ocupa 3,8 GB en disco. La etiqueta `qwen3_5_text` y el pipeline `text-classification` indican que hereda la arquitectura transformer decoder de la familia Qwen3.5 y que su uso previsto es la clasificacion con salida probabilistica, no la generacion autoregresiva.

Su relevancia practica esta en el coste de inferencia: resolver varias decisiones tipadas (eleccion multiple, booleanas y de tipo `noul` en el ejemplo del autor) en un solo forward pass permite usarlo como router, clasificador de triaje o pre-filtro delante de modelos generativos mucho mas grandes, ejecutandose en local sobre Apple Silicon mediante MLX. La licencia Apache 2.0 heredada facilita su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Qwen3.5 (tag `qwen3_5_text`), pesos renombrados para el loader de mlx-vlm |
| Parametros totales | 1.881.825.088 (~1,88 mil millones) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en bf16 sin modificar |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), biblioteca `mlx` / `mlx-vlm` |
| Modelo base | Mapika/decider-2b (v11, revision `533964da`), fine-tuning de Qwen/Qwen3.5-2B-Base |
| Tarea declarada | `text-classification` (decisiones tipadas con salida probabilistica) |
| Tamano del repositorio | 3,8 GB |
| Fecha de publicacion | 2026-09-25 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su procedencia: es un fine-tuning de Qwen/Qwen3.5-2B-Base, por lo que se trata de un transformer decoder denso de aproximadamente 2B parametros, con la torre de texto de Qwen3.5. El repositorio de nativ-community no introduce cambios en los tensores: los nombres de las capas del language model se reasignan de `model.language_model.*` a `model.*` para que el checkpoint cargue con el loader estandar de mlx-vlm, mientras que los valores y dtypes se mantienen intactos en bf16. El config, el tokenizer y el `decider_config.json` se copian tal cual del modelo original.

Segun la model card, decider-2b es un modelo de decision calibrado que devuelve una distribucion de probabilidad sobre las opciones de cada pregunta tipada en una sola pasada forward. La model card de esta redistribucion remite explicitamente al repositorio original de Mapika para los detalles de entrenamiento, evaluacion y limitaciones. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Clasificacion con decisiones tipadas: recibe un conjunto de campos de entrada (por ejemplo, el texto de un ticket) y un esquema de preguntas con su tipo y criterios, y devuelve la respuesta para cada pregunta.
- Salida probabilistica calibrada: en lugar de una unica etiqueta, proporciona una distribucion sobre las opciones, lo que permite aplicar umbrales y medir incertidumbre.
- Preguntas de eleccion multiple: el tipo `choice` acepta un diccionario de criterios (por ejemplo, `billing`, `technical`, `sales`) y reparte probabilidad entre ellos.
- Preguntas booleanas o de tipo `noul`: el ejemplo de la model card usa el tipo `noul` para una decision del tipo "el cliente solicita un reembolso?", con respuesta en `result["answers"]`.
- Resolucion en una sola pasada forward: todas las preguntas del esquema se contestan simultaneamente, sin decodificacion autoregresiva paso a paso.
- Integracion con `mlx-vlm`: se carga mediante `mlx_vlm.load` y la clase `Decider2`, con API `predict(datos, esquema)`.
- Idiomas: ingles unicamente, segun el campo `language` del repositorio.
- No disponible: no se documentan en la informacion proporcionada capacidades de tool calling, function calling, uso como agente, razonamiento multi-paso, generacion de codigo, matematicas, vision, audio ni modo de pensamiento. Aunque el repositorio usa la libreria `mlx-vlm` y lleva la etiqueta `mlx-vlm`, la tarea declarada es de clasificacion de texto.

## Casos de uso

- Triaje de tickets de soporte: el propio ejemplo de la model card muestra como clasificar un ticket ("Please refund my duplicate charge") asignandolo a un departamento (`billing`, `technical`, `sales`) y resolviendo a la vez la pregunta de si el cliente pide reembolso. Al devolver una distribucion, se pueden derivar reglas de escalado cuando la confianza es baja.
- Enrutado previo a un LLM mayor: al resolver la decision en un solo forward pass de 1,88B parametros, puede actuar como router que decide si una consulta requiere un modelo generativo grande, una busqueda en base de datos o una respuesta directa, reduciendo coste y latencia del sistema completo.
- Automatizacion de back-office con criterios definidos: clasificacion de documentos o correos segun esquemas declarativos (tipo de solicitud, urgencia, area responsable), aprovechando que el modelo acepta varios criterios en una misma llamada.
- Extraccion de decisiones binarias en formularios: preguntas del tipo "solicita reembolso?", "requiere intervencion humana?" o "es una queja formal?" se resuelven con una probabilidad, lo que facilita auditar el comportamiento con umbrales configurables.
- Ejecucion local en Apple Silicon: gracias al formato MLX y a los 3,8 GB de pesos en bf16, puede desplegarse en un Mac con memoria unificada para tareas de clasificacion en local, sin enviar datos a servicios externos.
- Moderacion y clasificacion de contenido por criterios: el esquema tipado permite definir varias categorias y obtener una distribucion por cada una, util para pipelines de revision con puntuacion de confianza.
- Pre-filtro en sistemas RAG: decidir si una consulta necesita recuperacion documental o puede responderse directamente, antes de invocar el recuperador y el modelo generativo.
- Soporte a agentes multi-paso como componente de decision: elegir la siguiente accion o herramienta entre un conjunto acotado de opciones, usando la salida probabilistica como senal para la politica del agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta redistribucion remite al repositorio original de Mapika para los datos de evaluacion, y no se proporcionan cifras de MMLU, HumanEval, GSM8K ni de tareas de clasificacion en el material facilitado. Como unico dato verificable de comportamiento, el autor afirma que este checkpoint produce exactamente la misma salida de `predict` que el modelo original sobre las mismas entradas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,8 GB solo de pesos, mas overhead de activaciones y cache; en la practica conviene disponer de 5-6 GB de memoria.
- Cuantizacion: el repositorio solo publica bf16. No hay checkpoints cuantizados publicados en la informacion disponible; una conversion a 8 bits dejaria los pesos en torno a 1,9 GB y a 4 bits en torno a 1 GB, pero esos valores son estimaciones de calculo, no datos publicados.
- GPU consumer: cabe con holgura en tarjetas de 8 GB o mas (por ejemplo, RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070), siempre que se use un runtime compatible con safetensors.
- Apple Silicon: es el entorno natural del checkpoint, al estar publicado para MLX. Un Mac con memoria unificada de 8 GB o superior deberia poder cargarlo en bf16; 16 GB da margen comodo.
- GPU de datacenter: A100 y H100 no son necesarias para inferencia individual; solo tendrian sentido para servir lotes grandes en paralelo.
- Opciones de despliegue: `mlx-vlm` es la via documentada, con `mlx_vlm.load` y la clase `Decider2`. No se confirma soporte de vLLM, TGI, llama.cpp u Ollama, y no hay GGUF publicado; usarlos requeriria una conversion no incluida en el repositorio.
- Latencia y throughput: no disponible. Cualitativamente, el diseno resuelve todas las preguntas tipadas en una sola pasada forward, lo que evita la decodificacion token a token propia de un modelo generativo del mismo tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| nativ-community/decider-2b | 1.881.825.088 (~1,88B) | no disponible | Clasificacion / decisiones tipadas con salida probabilistica | Apache 2.0 | safetensors bf16, libreria MLX / mlx-vlm, 3,8 GB |
| Mapika/decider-2b (original, v11) | no disponible en la informacion (mismo checkpoint de origen) | no disponible | Clasificacion / decisiones tipadas con salida probabilistica | Apache 2.0 (heredada por el redistribuidor) | safetensors, nombres de pesos `model.language_model.*` |
| Qwen/Qwen3.5-2B-Base | aproximadamente 2B (modelo base del fine-tuning) | no disponible | Generacion de texto (modelo base) | no disponible en la informacion proporcionada | safetensors |

No se han identificado en la informacion disponible otros modelos de decision calibrados directamente comparables. Las alternativas habituales para clasificacion de texto (clasificadores basados en encoders como DeBERTa) no se pueden comparar con datos porque no se han facilitado cifras de rendimiento de ninguno de los dos lados.

## Limitaciones y advertencias

- Idioma: el modelo declara unicamente ingles (`en`). No hay evidencia de soporte para castellano ni otros idiomas, por lo que usarlo con texto en espanol no esta respaldado.
- Naturaleza del modelo: no es un generador de texto. Intentar usarlo para redactar respuestas, resumir o conversar queda fuera de su tarea declarada.
- Calibracion: aunque la model card lo describe como "calibrado", no se aportan metricas de calibracion (ECE, Brier, curvas de fiabilidad) en la informacion disponible, asi que el grado real de calibracion por dominio es desconocido.
- Riesgo de error silencioso: al devolver una distribucion de probabilidad, un fallo se manifiesta como confianza mal asignada en lugar de como un texto visiblemente erroneo. Conviene definir umbrales y rutas de escalado en produccion.
- Cobertura del esquema: el comportamiento depende de las preguntas y criterios definidos por el usuario; etiquetas ambiguas o solapadas degradaran la calidad de la decision.
- Redistribucion comunitaria: el repositorio tiene 0 descargas y 0 likes y es una copia con renombrado de pesos; los cambios de loader no alteran los tensores, pero la trazabilidad y el mantenimiento dependen del proyecto original de Mapika.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar los avisos correspondientes. La licencia se hereda del modelo original; conviene verificar las condiciones del modelo base Qwen utilizado para el fine-tuning antes de un despliegue comercial.
- Contexto y limites operativos: no se especifica la longitud de contexto soportada, lo que impide planificar entradas largas con garantias.
- Sin benchmarks publicos en la informacion disponible: no hay evidencia cuantitativa de rendimiento frente a alternativas, por lo que cualquier evaluacion debe hacerse con un conjunto de validacion propio del dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/decider-2b
- Modelo original de Mapika: https://huggingface.co/Mapika/decider-2b
- Modelo base del fine-tuning: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Busqueda web: no se han encontrado resultados relevantes. Los enlaces devueltos (bynativ.com, nativ.to, native-instruments.com, natif-shop.com, intuis.fr) corresponden a empresas y productos sin relacion con este modelo.
