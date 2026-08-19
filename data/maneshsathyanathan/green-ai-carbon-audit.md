# maneshsathyanathan/green-ai-carbon-audit

## Resumen

El repositorio `maneshsathyanathan/green-ai-carbon-audit` no contiene un modelo de inteligencia artificial, sino un registro de auditoría de carbono correspondiente a una ejecución de entrenamiento de GPU. Documenta el consumo energético y las emisiones de CO₂ equivalente generadas durante un proceso de preentrenamiento, utilizando la herramienta CodeCarbon para la medición. El autor, maneshsathyanathan, ha publicado este repositorio como parte de una práctica de transparencia ambiental en el desarrollo de IA, alineada con las iniciativas de Green AI que buscan cuantificar y reducir la huella ecológica de los modelos.

La relevancia de este repositorio radica en su función ejemplarizante: muestra cómo registrar de forma estandarizada el impacto ambiental de un entrenamiento, incluyendo la ubicación geográfica del centro de datos, el hardware utilizado y las emisiones asociadas. No obstante, al carecer de arquitectura, pesos o cualquier componente funcional de IA, no puede ser utilizado para tareas de inferencia, generación o razonamiento. Su valor es exclusivamente documental y metodológico dentro del ámbito de la sostenibilidad en IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Consumo energetico registrado | 40,5296 kWh |
| Emisiones de CO2eq | 26,344 kg |
| Hardware de entrenamiento | NVIDIA A100 |
| Ubicacion del entrenamiento | asia-south1 |
| Herramienta de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se dispone de informacion sobre arquitectura de red, ya que este repositorio no contiene un modelo. El unico dato de entrenamiento disponible es el registro de una ejecucion de preentrenamiento que consumio 40,5296 kWh de energia y emitio 26,344 kg de CO2 equivalente, medidos con CodeCarbon en una ubicacion asia-south1 (presumiblemente un centro de datos de Google Cloud en la region de Singapur o Mumbai). El hardware empleado fue una GPU NVIDIA A100. No se especifican datos sobre el dataset, el numero de tokens procesados ni tecnicas de optimizacion como RLHF o DPO.

## Capacidades

- No posee capacidades de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling ni funciones de agente.
- No dispone de modo de pensamiento (thinking mode) ni de procesamiento multimodal.
- Su unica funcion es servir como registro de emisiones de carbono de un entrenamiento concreto.

## Casos de uso

- Auditoria ambiental de entrenamientos de IA: este repositorio puede utilizarse como plantilla o ejemplo para que otros equipos documenten la huella de carbono de sus propios entrenamientos, siguiendo el formato de CodeCarbon.
- Investigacion en sostenibilidad de IA: los datos de emisiones y consumo energetico pueden emplearse en estudios comparativos sobre el impacto ambiental de diferentes configuraciones de hardware y ubicaciones de centros de datos.
- Formacion y divulgacion: sirve como material didactico para explicar como se mide y reporta el coste ecologico del entrenamiento de modelos, especialmente en cursos sobre Green AI.
- Cumplimiento de politicas internas: empresas u organizaciones que requieran reportar el impacto ambiental de sus cargas de trabajo de IA pueden usar este ejemplo como referencia para sus propios informes.
- Optimizacion de infraestructura: los datos registrados permiten analizar la relacion entre consumo energetico y emisiones en una region concreta, ayudando a decidir donde desplegar entrenamientos para minimizar la huella de carbono.
- Desarrollo de herramientas de medicion: el repositorio puede servir como caso de prueba para validar o mejorar herramientas de seguimiento de emisiones como CodeCarbon o eco2AI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de IA, no existen metricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El entrenamiento registrado utilizo una GPU NVIDIA A100, aunque no se especifica cuantas unidades ni la duracion exacta.
- No se proporcionan requisitos de VRAM para inferencia, ya que no hay modelo que ejecutar.
- No aplica despliegue en vLLM, llama.cpp, Ollama o TGI.
- La latencia y el throughput no son relevantes al no existir inferencia.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA comparable con alternativas como Llama, Mistral o Qwen. Su naturaleza es la de un registro de emisiones, no un artefacto de ML. Existen otros repositorios similares en HuggingFace (por ejemplo, `rajkumar17493/green-ai-carbon-audit`) que tambien documentan auditorias de carbono, pero no ofrecen capacidades de IA.

## Limitaciones y advertencias

- No es un modelo utilizable: no contiene pesos, arquitectura ni codigo de inferencia.
- No puede integrarse en pipelines de IA, chatbots, generacion de codigo ni ninguna tarea de ML.
- Los datos de emisiones corresponden a una ejecucion especifica y no son generalizables a otros entrenamientos.
- La licencia no esta especificada, por lo que no se puede determinar si su contenido puede reutilizarse comercialmente.
- No se indica el idioma ni la procedencia de los datos de entrenamiento, lo que limita su valor como referencia para otros contextos.
- La fecha de creacion (2026) sugiere que es un registro reciente, pero no se aporta informacion sobre la metodologia completa de medicion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/maneshsathyanathan/green-ai-carbon-audit
- Repositorio similar de otro autor: https://huggingface.co/rajkumar17493/green-ai-carbon-audit
- Articulo sobre iniciativas de Green AI (ScienceDirect): https://www.sciencedirect.com/science/article/pii/S0959652624025393
- Recurso sobre Green AI y huella de carbono: https://ejhusom.github.io/green-ai/
- Articulo sobre eco2AI (Springer): https://link.springer.com/article/10.1134/S1064562422060230
- Documentacion del Green AI Model: https://green-ai-model.github.io/docs/1_introduction/
