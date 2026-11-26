# Gem1832/zils-lite-b1127b

## Resumen

zils-lite-b1127b es un ajuste fino ligero publicado por el usuario Gem1832 sobre el denominado "d3-lite soup", una media de pesos a partes iguales de dos fine-tunes previos (joamCriff123/zils-lite-l1125a y joamCriff123/zils-lite-l1123q), ambos derivados a su vez de Qwen/Qwen3.5-0.8B. El modelo se presenta como un "decision model" orientado a tareas de eleccion, preguntas de si/no y puntuacion con objetivos de probabilidad, entrenado sobre aproximadamente 66.000 filas de decision.

Con 852.985.920 parametros (aproximadamente 0,85 mil millones) y un repositorio de 1,7 GB en safetensors, es un modelo pequeno que puede ejecutarse en hardware de consumo. La model card menciona explicitamente una "vision tower" heredada del soup, lo que sugiere una arquitectura multimodal, aunque no se detallan sus caracteristicas ni su resolucion.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un modelo de investigacion con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados y con documentacion muy escasa. Resulta util como ejemplo de fine-tuning por LoRA fusionado sobre un modelo base pequeno para tareas de decision, pero no hay evidencia publica de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen/Qwen3.5-0.8B (fine-tune del "d3-lite soup"); incluye vision tower segun la model card |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y se construye en dos etapas: primero, una media de pesos con igual ponderacion entre dos fine-tunes (zils-lite-l1125a y zils-lite-l1123q) para formar el "d3-lite soup"; segundo, un ajuste fino adicional con LoRA de rango 16 y tasa de aprendizaje 1,5e-5 aplicado sobre las capas de lenguaje, con los adaptadores fusionados en los pesos finales. La torre de vision se mantiene sin cambios respecto al soup, lo que implica que el modelo conserva capacidad multimodal de entrada, aunque no se especifica el codificador visual ni la resolucion de imagen soportada.

El conjunto de entrenamiento consta de aproximadamente 66.000 filas de decision, compuestas por tareas con licencia comercial procedentes de tasksource (preguntas de eleccion multiple, si/no y puntuacion, incluyendo objetivos de probabilidad) y por elementos publicos de Zils Outcomes (arXiv, Wikipedia, Gerrit). No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla la innovacion tecnica mas alla del propio esquema de soup mas LoRA fusionado.

## Capacidades

- Generacion de texto y respuestas a preguntas de eleccion multiple, si/no y puntuacion, segun el dataset de entrenamiento declarado.
- Emision de objetivos de probabilidad en tareas de scoring, de acuerdo con la model card.
- Procesamiento de entrada visual gracias a la torre de vision heredada del soup, aunque sin especificaciones publicas de resolucion ni formato.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Clasificacion binaria de contenido: el modelo puede emplearse para responder preguntas de si/no sobre textos, aprovechando su entrenamiento especifico en filas de decision de tasksource.
- Puntuacion y ranking de candidatos: al haberse entrenado con objetivos de probabilidad, es adecuado para asignar scores calibrados a pares pregunta-respuesta en tareas de evaluacion.
- Filtrado de articulos cientificos: los elementos de Zils Outcomes basados en arXiv sugieren utilidad para decidir la relevancia de preprints en un pipeline de revision bibliografica.
- Triaje de cambios de codigo: la inclusion de elementos de Gerrit apunta a un uso potencial en la seleccion o priorizacion de revisiones de parches en flujos de integracion continua.
- Verificacion de afirmaciones en Wikipedia: el modelo puede emplearse para decidir si una afirmacion esta respaldada por un fragmento enciclopedico, como paso previo a un sistema de fact-checking.
- Prototipado de bajo coste en local: con 0,85 mil millones de parametros y pesos en safetensors, sirve para experimentar con modelos de decision en una sola GPU de consumo sin depender de APIs externas.
- Evaluacion comparativa de tecnicas de soup y LoRA: util como caso de estudio reproducible para investigadores que analizan la fusion de adaptadores sobre modelos base pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 3,4 GB solo para pesos, mas memoria para activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 1,7 GB para pesos, con margen adicional para contexto y overhead del runtime.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,9 GB para pesos; en 4 bits, en torno a 0,5 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16, como RTX 3060, RTX 4060, RTX 4090 o superiores; en entornos de servidor, A100 o H100 no son necesarias por el tamano del modelo.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de tarjetas con 6 GB o mas en fp16.
- Opciones de despliegue: al publicarse solo en safetensors, seria necesario convertirlo a GGUF para llama.cpp u Ollama; vLLM y TGI podrian cargarlo si la arquitectura subyacente de Qwen3.5-0.8B esta soportada por esas herramientas, extremo no confirmado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-b1127b | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (modelo base) | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face |
| joamCriff123/zils-lite-l1125a | no disponible | no disponible | Apache-2.0 | Hugging Face |
| joamCriff123/zils-lite-l1123q | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con alternativas de otros autores, por lo que la comparativa se limita a linaje y licencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su calidad en tareas de decision ni en generacion general.
- Documentacion minima: no se especifican contexto, idiomas, composicion exacta del dataset ni detalles de la torre de vision.
- Riesgo de alucinacion: al ser un fine-tune de un modelo de 0,8 mil millones de parametros, la fiabilidad factual es limitada y no se ha evaluado.
- Sesgos desconocidos: el dataset combina tasksource y Zils Outcomes, pero no se documenta su distribucion demografica ni tematica, por lo que no pueden evaluarse sesgos.
- Limitaciones de idioma: no se declaran idiomas soportados; el entrenamiento parece centrado en tareas en ingles (arXiv, Wikipedia, Gerrit), lo que probablemente degrada el rendimiento en castellano.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero las condiciones de los datos de entrenamiento (tasksource y Zils Outcomes) no se detallan, lo que introduce incertidumbre legal.
- Caveat para produccion: con cero descargas y sin validacion externa, no es recomendable desplegarlo en entornos productivos sin una evaluacion propia previa.
- El modelo base referenciado (Qwen3.5-0.8B) no aparece verificado en la informacion proporcionada, lo que impide confirmar la disponibilidad y condiciones del linaje completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gem1832/zils-lite-b1127b
- Modelo base del soup (l1125a): https://huggingface.co/joamCriff123/zils-lite-l1125a
- Modelo base del soup (l1123q): https://huggingface.co/joamCriff123/zils-lite-l1123q
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio tasksource: no disponible en la informacion proporcionada
- Zils Outcomes: no disponible en la informacion proporcionada
