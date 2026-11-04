# mariambhd/drone-qwen2vl-2b-distilled-alpha07-lora-7class

## Resumen

El modelo `mariambhd/drone-qwen2vl-2b-distilled-alpha07-lora-7class` es un adaptador LoRA sobre el modelo base `Qwen/Qwen2-VL-2B-Instruct`, desarrollado por el usuario mariambhd. Su proposito es la clasificacion de acciones humanas en secuencias de video captadas desde drones, reduciendo el modelo original de 2.000 millones de parametros a una tarea especifica de siete clases: attacking, hitting, kicking, clapping, waving, walking y running.

Se trata de un trabajo de destilacion de conocimiento (response-level, hard-label) desde un modelo profesor de mayor tamano, Qwen2.5-VL-3B con su propio adaptador LoRA, hacia el modelo estudiante Qwen2-VL-2B. La perdida combina entropia cruzada contra la etiqueta real y contra la etiqueta del profesor, con un peso alpha de 0,7 a favor del profesor. El resultado reportado por el autor es una precision identica entre profesor y estudiante en el conjunto de test, lo que sugiere que el estudiante reproduce el comportamiento del profesor con menor coste computacional.

El interes practico radica en el escenario: reconocimiento de acciones en video aereo con un modelo de 2B parametros que puede desplegarse en hardware modesto. No obstante, la model card es extremadamente escueta, no declara licencia ni idiomas, y el conjunto de evaluacion es muy reducido (dos sujetos), por lo que las cifras deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2-VL) con adaptador LoRA (PEFT) |
| Parametros totales | 2.000 millones (modelo base Qwen2-VL-2B); parametros del adaptador LoRA no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2-VL-2B soporta contexto nativo ampliable, pero el adaptador no lo declara) |
| Tipos de cuantizacion | no disponible (el autor menciona entrenamiento en fp16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar por separado el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2-VL-2B-Instruct, un transformer multimodal que procesa imagenes y video mediante un encoder visual y un decoder de lenguaje. El adaptador LoRA se entrena en fp16 y modifica un subconjunto de pesos del modelo base para especializarlo en clasificacion de acciones. El pipeline de inferencia procesa un numero variable de frames por video: 16 frames para hitting, clapping, walking y running, y 8 frames para kicking, attacking y waving, todos redimensionados a 448x252 pixeles.

El entrenamiento emplea destilacion de conocimiento a nivel de respuesta con etiquetas duras (hard-label). La funcion de perdida es `(1 - alpha) * CE(etiqueta real) + alpha * CE(etiqueta del profesor)` con alpha = 0,7. El profesor es Qwen2.5-VL-3B con el adaptador `mariambhd/drone-qwen25vl-3b-lora-7class` en fp16. La mejor epoca fue la 4, seleccionada por menor perdida de validacion. La particion de datos reutiliza el split por sujeto del profesor (`fold_splits.json`), de modo que los sujetos de test no fueron vistos por ninguno de los dos modelos.

## Capacidades

- Clasificacion de acciones humanas en video aereo en siete clases cerradas: attacking, hitting, kicking, clapping, waving, walking y running.
- Procesamiento de video mediante muestreo de frames (8 o 16 segun la clase) redimensionados a 448x252.
- Razonamiento visual sobre secuencias cortas, heredado del modelo base Qwen2-VL-2B-Instruct.
- No se documenta soporte de tool calling ni function calling en el adaptador.
- No se documenta soporte de agentes ni razonamiento multi-paso especifico para esta tarea.
- Capacidades multilingues: no disponibles en la informacion proporcionada (dependerian del modelo base, no declaradas por el autor).
- No se documentan modos especiales como thinking mode, audio u otras modalidades.

## Casos de uso

- Vigilancia perimetral con drones: el adaptador clasifica en tiempo casi real acciones como walking, running o attacking en secuencias aereas, permitiendo alertas automaticas en sistemas de seguridad de instalaciones.
- Monitorizacion de multitudes en eventos: deteccion de comportamientos como hitting o kicking para activar protocolos de seguridad, usando el modelo sobre streams de video aereo con muestreo de frames.
- Analisis deportivo automatizado: clasificacion de acciones como kicking o running en grabaciones de entrenamiento o competicion captadas por drone, para generar estadisticas de actividad.
- Control de acceso y seguridad en recintos: reconocimiento de clapping o waving como gestos de interaccion o senalizacion en zonas restringidas.
- Investigacion en vision por computador: servir como baseline destilado de 2B parametros para experimentos de reconocimiento de acciones aereas, comparando contra el profesor de 3B con menor coste.
- Despliegue en edge computing: al tratarse de un adaptador sobre un modelo de 2B, puede ejecutarse en GPUs de gama media o en estaciones de trabajo con recursos limitados, integrado en el software de vuelo o en una estacion terrestre.
- Anotacion asistida de datasets: pre-etiquetar clips de video aereo con las siete clases para acelerar el etiquetado manual posterior.

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto de test (sujetos [9, 10]):

| Modelo | Accuracy | Macro F1 | Weighted F1 |
|---|---|---|---|
| Profesor (Qwen2.5-VL-3B + LoRA) | 97,50% | 92,38% | 97,33% |
| Estudiante (Qwen2-VL-2B + este LoRA) | 97,50% | 92,38% | 97,33% |

Tiempo medio de inferencia: 2,56 s por video. El autor advierte que el conjunto de test es pequeno (dos sujetos) y que las diferencias pequenas no son estadisticamente fiables. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2-VL-2B en fp16 requiere aproximadamente 4-5 GB de VRAM; el adaptador LoRA anade una cantidad marginal. En cuantizacion de 8 bits o 4 bits del modelo base, el consumo podria reducirse a 2-3 GB, aunque el autor no documenta cuantizaciones del adaptador.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM en fp16; en cuantizacion podria caber en GPUs de 4-6 GB, aunque no esta verificado por el autor.
- Opciones de despliegue: transformers + peft (documentado por el autor); vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador y su compatibilidad no esta confirmada.
- Latencia y throughput: 2,56 s por video reportado por el autor; no se documenta throughput agregado ni latencia por frame.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2-VL-2B + LoRA destilado) | 2B | no disponible | 97,50% accuracy, 92,38% macro F1 | no disponible | HuggingFace |
| Profesor (Qwen2.5-VL-3B + LoRA) | 3B | no disponible | 97,50% accuracy, 92,38% macro F1 | no disponible | HuggingFace |
| Qwen2-VL-2B-Instruct (base sin adaptador) | 2B | no disponible | no evaluado en esta tarea | no disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de otros modelos comparables en la misma tarea de reconocimiento de acciones aereas con siete clases en la informacion proporcionada.

## Limitaciones y advertencias

- El conjunto de test es muy reducido (dos sujetos), por lo que las metricas reportadas no son estadisticamente robustas y pueden no generalizar a otros dominios o condiciones de grabacion.
- El adaptador esta especializado en siete clases cerradas; no reconocera acciones fuera de ese conjunto y probablemente las clasificara erroneamente en alguna de las siete.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; debe consultarse con el autor antes de cualquier despliegue en produccion.
- No se declaran idiomas soportados ni sesgos conocidos; el comportamiento linguistico dependera del modelo base y no esta documentado para esta especializacion.
- Riesgo de alucinacion inherente al modelo base Qwen2-VL-2B, aunque en una tarea de clasificacion cerrada el riesgo se manifiesta como etiquetas incorrectas mas que como texto inventado.
- El adaptador requiere cargar el modelo base por separado y usar exactamente el mismo prompt, numero de frames y redimensionado (448x252) que en entrenamiento; desviarse de esta configuracion puede degradar el rendimiento.
- No se documentan cuantizaciones ni compatibilidad con motores de inferencia alternativos (vLLM, llama.cpp, Ollama, TGI), lo que limita las opciones de despliegue optimizado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/mariambhd/drone-qwen2vl-2b-distilled-alpha07-lora-7class
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Adaptador del profesor: https://huggingface.co/mariambhd/drone-qwen25vl-3b-lora-7class
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
