# raporto/pycoder-3b

## Resumen

`raporto/pycoder-3b` es un ajuste fino (fine-tuning) del modelo instructivo `Qwen/Qwen2.5-3B-Instruct`, desarrollado por el usuario raporto, orientado a la asistencia en programación en Python. El modelo parte del checkpoint base de 3.085.938.688 parámetros de Qwen y añade un adaptador LoRA entrenado con QLoRA que ya ha sido fusionado (merged) en los pesos finales, por lo que se distribuye como un modelo denso estándar, sin adaptadores separados.

El entrenamiento se realizó sobre un subconjunto de 3.431 muestras del dataset `iamtarun/python_code_instructions_18k_alpaca` (3.124.347 tokens, con packing activado), durante 215 pasos y en una única GPU NVIDIA RTX 3090 con precisión `torch.bfloat16`. La pérdida final de evaluación fue de 0,4742 y la perplejidad de 1,6067. El resultado es un modelo conversacional especializado en generación de código Python, con soporte declarado para portugués e inglés y licencia Apache 2.0.

Su relevancia práctica reside en el segmento de 3B parámetros: es un modelo lo bastante pequeño para ejecutarse en GPUs de consumo con cuantización y lo bastante capaz para tareas de asistencia de código del día a día. No obstante, conviene señalar que el autor lo describe explícitamente como un asistente de código cotidiano y no como una fuente autoritativa, y que el repositorio no incluye resultados de benchmarks ni versiones cuantizadas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (`qwen2` en transformers) |
| Parametros totales | 3.085.938.688 (~3,09B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-3B-Instruct, no especificada en la model card) |
| Tipos de cuantizacion | No disponible; no se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ). Los pesos de entrenamiento se manejaron en `torch.bfloat16` |
| Idiomas soportados | Portugues (`pt`) e ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 6,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2, con 3.085.938.688 parametros, normalizacion RMSNorm, atención con sesgo QKV y tokenizador BPE de Qwen2.5. Sobre ese checkpoint instructivo se aplicó un ajuste fino supervisado con QLoRA, con el objetivo de especializar el modelo en asistencia de programación Python.

Los detalles de entrenamiento declarados por el autor son: dataset `iamtarun/python_code_instructions_18k_alpaca`, 3.431 muestras de entrenamiento, 3.124.347 tokens con `packing: true`, batch efectivo de 16, 215 pasos, precisión `torch.bfloat16` y una sola GPU RTX 3090. La configuración LoRA fue r=16, alpha=32 y dropout=0,05, y el adaptador se fusionó posteriormente en los pesos base. El proceso completo tardó 2.508,8 segundos (unos 42 minutos). Los valores finales registrados son train_loss 0,481657, eval_loss 0,474194 y perplejidad 1,6067.

No se documenta en la informacion proporcionada el uso de RLHF, DPO u otras fases de alineamiento posteriores al ajuste supervisado, ni innovaciones tecnicas adicionales como decodificacion especulativa o mecanismos de atención lineal.

El formato de prompt es ChatML de Qwen2.5, con un system prompt en portugues del tipo `Você é um assistente especialista em programação Python.`, seguido de los turnos `user` y `assistant` delimitados por `<|im_start|>` y `<|im_end|>`.

## Capacidades

- Generacion de texto conversacional multi-turno en portugues e ingles, sobre la base instructiva de Qwen2.5.
- Generacion y explicacion de codigo Python: funciones, scripts, ejemplos de uso y aclaraciones sobre el codigo producido.
- Asistencia de programacion guiada por instrucciones, gracias al ajuste sobre un dataset de instrucciones de codigo.
- Razonamiento paso a paso basico heredado del modelo base instructivo.
- Seguimiento de un system prompt personalizado en portugues para fijar el rol de asistente de programacion.
- Capacidades del modelo base no verificadas en esta ficha (tool calling, function calling, agentes, multi-step reasoning): no hay confirmacion en la informacion proporcionada de que el ajuste las preserve o las degrade; el autor no las documenta.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; no se documentan.
- Capacidades multilingues: limitadas a los idiomas declarados (`pt`, `en`); no se declara soporte para castellano ni otros idiomas.

## Casos de uso

- Asistencia de codigo Python en el IDE: el modelo puede recibir una instruccion en lenguaje natural o un fragmento de codigo y devolver una funcion o un parche, integrándose en extensiones de editor mediante su formato ChatML.
- Generacion de pruebas unitarias: dada una funcion Python, el modelo puede redactar casos de prueba con `pytest` o `unittest` como borrador que la persona desarrolladora revisa antes de incorporarlo.
- Explicacion y documentacion de codigo heredado: el modelo puede resumir que hace un fragmento de Python y proponer docstrings, util para documentar modulos poco comentados.
- Traduccion de pseudocodigo o de fragmentos entre lenguajes hacia Python: con instrucciones claras, sirve para convertir ejemplos de otros lenguajes en implementaciones Python, siempre con validacion posterior.
- Prototipado rapido y scripting de automatizacion: generacion de scripts cortos de procesamiento de datos, parseo de ficheros o llamadas a APIs, aprovechando su tamano reducido para iterar rapido en local.
- Soporte en pipelines de CI como generador de sugerencias: el modelo puede producir parches candidatos o mensajes de revision de codigo que luego pasan por pruebas automatizadas; no debe ejecutarse su salida directamente en produccion sin revision.
- Atencion a desarrolladores en portugues: al usar un system prompt en portugues, encaja en equipos lusofonos que quieran un asistente de codigo en su idioma.
- Despliegue en entornos con recursos limitados: al ser un modelo de ~3B parámetros, es viable como asistente interno autoalojado en una unica GPU de consumo, sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones tipo MMLU, HumanEval, MBPP, GSM8K ni comparaciones con otros modelos. Los unicos datos cuantitativos publicados son las metricas de entrenamiento y evaluacion internas:

| Metrica | Valor |
|---|---|
| train_loss | 0,481657 |
| eval_loss | 0,474194 |
| Perplejidad (evaluacion) | 1,606719 |
| Muestras de entrenamiento | 3.431 |
| Tokens de entrenamiento | 3.124.347 |
| Pasos de entrenamiento | 215 |
| Batch efectivo | 16 |
| Tiempo de entrenamiento | 2.508,8 s (aprox. 41,8 min) |
| LoRA (r / alpha / dropout) | 16 / 32 / 0,05 |

Estos valores corresponden a la perdida sobre el conjunto de evaluacion del propio dataset y no son comparables con benchmarks estandarizados de generacion de codigo.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos, calculados a partir de los 3,09B parametros; no publicados por el autor):
  - bfloat16 / float16: aproximadamente 6,2 GB solo de pesos, mas activaciones y cache KV; en la practica conviene disponer de 8-10 GB.
  - int8: aproximadamente 3,1-3,5 GB de pesos.
  - int4: aproximadamente 1,8-2,5 GB de pesos.
- GPU recomendadas: para bfloat16 nativo, una RTX 3090 (24 GB) o RTX 4090 (24 GB) sobran; tambien es viable en A100 o H100 para despliegues con mayor concurrencia.
- GPU de consumo: si, cabe en GPUs de consumo. Con bfloat16 en una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070 en adelante, con contexto moderado. En GPUs de 8 GB (RTX 3070, RTX 4060) sera necesario cuantizar.
- Opciones de despliegue: `transformers` (libreria declarada en la model card), Text Generation Inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`). vLLM, llama.cpp, Ollama o TGI son compatibles en la practica al tratarse de un transformer Qwen2 denso, pero no hay confirmacion del autor; para llama.cpp u Ollama habria que convertir los pesos a GGUF, ya que no se publica una version GGUF oficial.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones de inferencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo que permitan una comparacion cuantitativa. La comparacion siguiente es estructural; los campos no documentados en la informacion proporcionada se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| raporto/pycoder-3b | 3,09B | No disponible | Apache 2.0 | Pesos safetensors en HuggingFace | Ajuste QLoRA de Qwen2.5-3B-Instruct sobre 3.431 muestras de instrucciones Python |
| Qwen/Qwen2.5-3B-Instruct (modelo base) | 3,09B | No disponible en la informacion proporcionada | Apache 2.0 | HuggingFace | Modelo instructivo generalista; es el punto de partida del ajuste |
| Qwen2.5-Coder-3B-Instruct | No disponible | No disponible | No disponible | No disponible | Alternativa especifica de codigo de la misma familia y tamano; no se han consultado sus datos en esta busqueda |
| Llama-3.2-3B-Instruct | No disponible | No disponible | No disponible | No disponible | Alternativa generalista de tamano comparable; no se han consultado sus datos en esta busqueda |

La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre sus alternativas: los resultados obtenidos correspondian a contenidos no relacionados (foros y repositorios sobre software de edicion de imagen). Por tanto, no se incluyen datos de rendimiento comparado.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo es un asistente de codigo del dia a dia y no una fuente autoritativa: el codigo generado debe validarse antes de ejecutarlo en produccion.
- El ajuste se realizo sobre un unico dataset de instrucciones Python de ~18k ejemplos, del que solo se usaron 3.431 muestras en entrenamiento; la cobertura tematica y de estilos de codigo es, por tanto, limitada.
- Riesgo de alucinacion: al ser un modelo de 3B parámetros, puede inventar APIs, nombres de funciones o dependencias inexistentes. No hay evaluaciones publicadas que cuantifiquen este riesgo.
- Idiomas: solo se declaran portugues e ingles. El uso en castellano no esta soportado explicitamente y puede degradar la calidad de las respuestas.
- Longitud de contexto: no especificada en la model card; no se debe asumir que el ajuste preserve la ventana completa del modelo base para tareas de contexto largo.
- No se documentan fases de alineamiento posteriores (RLHF/DPO) ni evaluaciones de sesgo. No hay datos sobre sesgos conocidos.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de licencia correspondientes. Conviene verificar tambien las condiciones de los pesos del modelo base Qwen2.5-3B-Instruct.
- Sesgos de idioma y de dataset: al entrenarse sobre instrucciones en ingles con un system prompt en portugues, el comportamiento puede ser desigual entre ambos idiomas.
- Advertencia de disponibilidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay benchmarks ni validacion externa; se trata de un modelo sin adopcion contrastada.
- Las estimaciones de VRAM de esta ficha son calculos orientativos a partir del numero de parametros, no mediciones publicadas por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/raporto/pycoder-3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/iamtarun/python_code_instructions_18k_alpaca
- Paper, blog, repositorio o demo adicionales: no disponibles. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
