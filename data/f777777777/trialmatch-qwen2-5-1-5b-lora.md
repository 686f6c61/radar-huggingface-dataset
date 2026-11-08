# f777777777/trialmatch-qwen2.5-1.5b-lora

## Resumen

TrialMatch criterion classifier es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario f777777777 en Hugging Face. Su proposito es clasificar criterios de elegibilidad de ensayos clinicos, una tarea central en el emparejamiento paciente-ensayo (trial matching). El adaptador se entrena sobre el split de entrenamiento (37 pacientes) del dataset ncbi/TrialGPT-Criterion-Annotations, con un split agrupado por paciente y semilla 42.

El modelo no es un modelo fundacional: es un adaptador PEFT de bajo rango que modifica el comportamiento de un transformer decoder de 1.500 millones de parametros. El repositorio ocupa aproximadamente 0,1 GB, lo que corresponde unicamente a los pesos del adaptador en formato safetensors, no al modelo base completo. La licencia declarada es Apache 2.0, heredada del modelo base.

La relevancia de esta ficha es acotada: se trata de un prototipo educativo de cribado, explicitamente marcado por el autor como no apto para uso clinico. No hay pipeline declarado, ni idiomas documentados, ni resultados de benchmarks publicados en la informacion disponible. Su interes tecnico radica en servir como ejemplo de adaptacion de un modelo pequeno a una tarea de dominio sanitario muy especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.500 millones en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no documentada en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder de 1.500 millones de parametros. La tecnica empleada es LoRA (Low-Rank Adaptation) mediante la libreria PEFT, que congela los pesos del modelo base e introduce matrices de bajo rango entrenables en determinadas capas. El repositorio solo contiene los pesos del adaptador, no una copia del modelo base.

El entrenamiento se realizo sobre el split de entrenamiento del dataset ncbi/TrialGPT-Criterion-Annotations, con 37 pacientes y una particion agrupada por paciente con semilla 42, lo que evita fuga de informacion entre pacientes. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican el rango LoRA, el alpha, la tasa de aprendizaje ni el numero de epocas.

## Capacidades

- Clasificacion de criterios de elegibilidad de ensayos clinicos, segun el objetivo declarado en la model card.
- Generacion de texto y razonamiento heredados del modelo base Qwen2.5-1.5B-Instruct.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el modelo base Qwen2.5 soporta multiples idiomas, pero el adaptador no documenta comportamiento multilingue.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Cribado preliminar de elegibilidad en investigacion clinica: el adaptador puede clasificar criterios de inclusion y exclusion de un ensayo frente a un perfil de paciente, como paso previo a la revision por un comite humano. Es adecuado por su especializacion en el dataset TrialGPT.
- Prototipado academico de sistemas de trial matching: sirve como componente base para experimentos docentes o de investigacion sobre emparejamiento paciente-ensayo, dado su bajo coste computacional.
- Evaluacion de tecnicas de adaptacion eficiente: util como caso de estudio de LoRA aplicado a dominios sanitarios con pocos datos (37 pacientes).
- Generacion de etiquetas auxiliares en pipelines de anotacion: puede preclasificar criterios para que anotadores humanos revisen y corrijan, reduciendo carga manual.
- Experimentacion con modelos pequenos en entornos con GPU de gama media: al partir de un modelo de 1.500 millones de parametros, permite iterar rapidamente en hardware modesto.
- Docencia sobre sesgos y limitaciones en IA clinica: su condicion de prototipo educativo lo hace util para ilustrar los riesgos de desplegar modelos sanitarios sin validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; al tratarse de un adaptador sobre un modelo de 1.500 millones de parametros, la VRAM dependera de la cuantizacion del modelo base.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no documentada; el modelo base de 1.500 millones es de tamano reducido, pero no se confirma en la ficha.
- Opciones de despliegue: PEFT (segun la libreria declarada); otras opciones como vLLM, llama.cpp u Ollama no estan documentadas para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| trialmatch-qwen2.5-1.5b-lora (f777777777) | 1.500 M (base) + adaptador | no disponible | apache-2.0 | Hugging Face |
| hyzenOG/trialmatch-qwen2.5-1.5b-lora | 1.500 M (base) + adaptador | no disponible | no disponible | Hugging Face |
| Qwen/Qwen2.5-1.5B | 1.500 M | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que es un prototipo educativo de cribado y no apto para uso clinico.
- Entrenado con solo 37 pacientes, lo que implica un riesgo elevado de sobreajuste y baja generalizacion a otras poblaciones.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente critico en contexto sanitario.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de contexto e idioma: no documentadas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la advertencia del autor sobre uso no clinico debe respetarse.
- No hay pipeline declarado ni resultados de evaluacion publicados, lo que dificulta valorar su calidad real.
- El repositorio solo contiene el adaptador; es necesario descargar el modelo base Qwen2.5-1.5B-Instruct para su uso.

## Enlaces

- Hugging Face: https://huggingface.co/f777777777/trialmatch-qwen2.5-1.5b-lora
- Repositorio de codigo, split y evaluacion: https://github.com/FatimaRana50/trialmatch
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Variante relacionada: https://huggingface.co/hyzenOG/trialmatch-qwen2.5-1.5b-lora
