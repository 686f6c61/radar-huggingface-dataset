# barneylogo/zils-d3-mini-body

## Resumen

SII-Decision-4B-Full (publicado en el repositorio `barneylogo/zils-d3-mini-body`) es un ajuste fino del modelo Qwen/Qwen3.5-4B orientado especificamente a la toma de decisiones. En lugar de generar texto libre, el modelo devuelve una distribucion de probabilidad sobre un conjunto de opciones proporcionadas por el usuario, con el modo de razonamiento (thinking) desactivado. Cubre tres tipos de tarea (Choice, Noul binario/probabilistico y Score ordenado) bajo una interfaz comun de "slots" de respuesta.

El entrenamiento se basa en autodestilacion: el propio modelo original del mismo tamano actua como profesor, promediando dos lecturas de razonamiento, mientras el estudiante aprende a producir la distribucion de decision directamente. Se trata de una adaptacion de rango completo sobre las capas lineales del modelo (las mismas que cubriria un LoRA), manteniendo congelados embeddings, cabeza de salida, normalizacion y parametros de vision.

Es relevante porque aborda un nicho poco cubierto: modelos especializados en producir distribuciones calibradas sobre opciones discretas, utiles para sistemas de enrutamiento, clasificacion con incertidumbre o evaluacion de alternativas, en lugar de generacion abierta. El checkpoint publicado obtiene 73,4694 sobre 100 en una suite fija de 58 benchmarks de decision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, con componentes de vision heredados) |
| Parametros totales | 1.134.816.384 (segun safetensors); el autor declara 3.313.500.160 parametros actualizados durante el entrenamiento |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint publicado); NF4 e INT8 mencionados para el modelo de 27B de la familia, no confirmados para este checkpoint |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, pesos completos fusionados, sin adaptador) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y aplica una adaptacion de rango completo sobre las mismas capas lineales del lenguaje que cubriria un LoRA. Embeddings, cabeza de salida, capas de normalizacion y parametros de vision permanecen congelados. Aunque la arquitectura conserva los componentes de vision del modelo original, el entrenamiento de decision y la interfaz de inferencia suministrada trabajan con entradas de texto.

El entrenamiento uso 29.326 preguntas y 7.506 de validacion, con un profesor que es el modelo original del mismo tamano promediando dos lecturas de razonamiento. La funcion de perdida combina entropia cruzada entre la distribucion del profesor y la del estudiante, un termino cuadratico para las tareas de tipo Score y una regularizacion KL hacia la distribucion inicial. Los pesos por tipo de tarea son 1 para Choice, 1,1666667 para Noul y 0,8 para Score; kappa vale 0,2 en Noul binario duro y 0,05 en el resto. Hiperparametros: learning rate 2e-06, batch global 64, semilla 43, 459 pasos (una epoca). El codigo, las listas exactas de capas y los scripts de fusion estan publicados en el repositorio de GitHub del autor.

## Capacidades

- Produccion de distribuciones de probabilidad sobre opciones suministradas por el usuario (tarea Choice).
- Tareas Noul binarias y probabilisticas.
- Tareas Score ordenadas sobre un conjunto de opciones.
- Interfaz unificada de "slots" de respuesta para los tres tipos de tarea.
- Inferencia con thinking desactivado por diseno.
- Tokenizador y plantilla de chat originales de Qwen3.5.
- No implementa generacion libre conversacional: la interfaz de scoring de decision es obligatoria.
- Soporte de tool calling, agentes, vision o audio: no disponible / no documentado.

## Casos de uso

- Enrutamiento de consultas: dado un texto de entrada y un conjunto de intenciones predefinidas, el modelo devuelve la probabilidad de cada una, lo que permite umbrales de confianza y derivacion a un humano cuando la distribucion es plana.
- Clasificacion con incertidumbre: en lugar de una etiqueta unica, se obtiene una distribucion calibrada que puede alimentar sistemas de abstención o de ensemble.
- Evaluacion de alternativas en pipelines de decision: comparar opciones con la tarea Score para ordenar candidatos (por ejemplo, configuraciones o respuestas) segun una puntuacion aprendida.
- Triaje binario: usar la tarea Noul binaria para decidir si un caso requiere escalado (spam/no spam, riesgo/no riesgo) con probabilidad asociada.
- Seleccion de herramientas o modelos en un orquestador: elegir entre varias APIs o modelos descendientes en funcion de la consulta, aprovechando la salida probabilistica.
- Investigacion en calibracion y decision making: el modelo, sus datos y su receta de autodestilacion estan publicados, lo que permite reproducir y comparar metodos de destilacion de distribuciones.
- Filtrado previo en pipelines de anotacion: priorizar ejemplos para revision humana segun la confianza del modelo.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Suite fija de 58 benchmarks de decision (peso equitativo) | 73,4694 / 100 (BF16) |

El autor advierte que la puntuacion corresponde a un unico checkpoint, no a una media multi-semilla ni a un intervalo de confianza, y que los resultados en NF4/INT8 pueden diferir y no han sido puntuados. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Inferencia en BF16: requiere RAM o VRAM suficiente para el checkpoint completo; el autor indica que un RTX 4090 ejecuta la variante de 4B en BF16.
- El script de dos GPU para el 4B lanza dos replicas independientes, no sharding.
- Cuantizacion NF4/INT8: documentada para el modelo de 27B de la familia; no confirmada para este checkpoint de 4B.
- Despliegue: scripts oficiales del repositorio SII-Decision (`scripts/infer_4b_single_4090.sh`); compatible con `transformers==5.14.1` y `accelerate`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Las entradas que exceden el limite de tokens configurado se rechazan, no se truncan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SII-Decision-4B-Full | 1.134.816.384 (safetensors) | no disponible | Distribuciones de decision (Choice/Noul/Score) | Apache-2.0 | HuggingFace + GitHub |
| Qwen/Qwen3.5-4B (base) | no disponible | no disponible | Generacion de texto general | Apache-2.0 | HuggingFace |
| SII-Decision-27B (familia) | no disponible | no disponible | Distribuciones de decision, cuantizado NF4/INT8 | no disponible | Referenciado en la model card |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- No es un modelo de chat general: el entrenamiento optimiza distribuciones de decision y no incluye supervision SFT conversacional.
- La generacion libre no implementa la interfaz de scoring; es necesario usar los scripts oficiales.
- La puntuacion de 73,4694 proviene de un unico checkpoint y no constituye una estimacion robusta de rendimiento.
- Los resultados en cuantizacion (NF4/INT8) no han sido evaluados con la suite y pueden diferir del BF16.
- Idiomas soportados no documentados; el comportamiento multilingue es incierto.
- Longitud de contexto no documentada; las entradas largas se rechazan en lugar de truncarse.
- Riesgo de alucinacion y sesgos: no documentados especificamente, pero heredados del modelo base Qwen3.5-4B.
- Uso comercial permitido por Apache-2.0, aunque los materiales de datos de entrenamiento conservan sus terminos originales segun la dataset card.
- Los componentes de vision se conservan en la arquitectura pero no se usan en la interfaz de inferencia suministrada.

## Enlaces

- HuggingFace: https://huggingface.co/barneylogo/zils-d3-mini-body
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/jylin001206/SII-Decision-4B-Training-Data
- Codigo y receta: https://github.com/amazingljy1206/SII-Decision
- Checkpoint de referencia citado en la model card: https://huggingface.co/jylin001206/SII-Decision-4B-Full
