# eCityAI-Sup/eCity-VL-9B

## Resumen

eCity-VL-9B es un modelo vision-lenguaje multimodal desarrollado por eCityAI-Sup, especializado en la deteccion de anomalias operativas de seguridad en entornos urbanos de vigilancia. Parte del modelo base Qwen3.5-9B y se afina mediante LoRA SFT con LLaMA-Factory sobre datos de vigilancia real de tres tipos de escena: estaciones de metro, vias urbanas y puentes. El objetivo es dotar al modelo de capacidad de juicio sobre eventos anomalos, emitiendo primero una descripcion semantica coherente siguiendo una cadena de pensamiento especifica por escena y, a continuacion, una conclusion multi-etiqueta sobre el tipo de anomalia.

El modelo resuelve el problema de la clasificacion y descripcion automatica de eventos anomalos en vigilancia urbana (dano en instalaciones, infracciones de pasajeros, inundaciones de calzada, derrame de carga, venta ambulante en la calzada, paso de vehiculos especiales, etc.). Con 9.2B parametros, se posiciona por debajo del umbral de 10B, lo que facilita su despliegue en infraestructura moderada. La relevancia actual radica en la creciente demanda de sistemas de gobernanza urbana que automaticen la deteccion semantica de incidentes sobre flujos de video de vigilancia.

La ficha tecnica disponible es limitada: no se publican datos sobre longitud de contexto, idiomas soportados ni cuantizaciones, y no hay resultados de benchmarks numericos mas alla de la comparacion de metricas de clasificacion contra tres modelos base de codigo abierto mencionada en la model card, cuyos valores concretos no se incluyen en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (base Qwen3.5-9B) |
| Parametros totales | 9.2B (< 10B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pesos completos tras merge de LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B-Base y se afina mediante LoRA SFT (rank=64) con LLaMA-Factory, con posterior merge completo de los adaptadores en los pesos finales. El objetivo de entrenamiento es dotar al modelo de capacidad de juicio sobre eventos anomalos: para cada imagen o fotograma de vigilancia, primero emite una descripcion coherente siguiendo una cadena de pensamiento especifica por escena (entorno espacial -> instalaciones/estado de la via -> personal/vehiculos -> identificacion de anomalia) y despues llega a una conclusion multi-etiqueta sobre el tipo de anomalia. El entrenamiento se realizo con prompts de sistema especificos por escena en formato ShareGPT.

El conjunto de datos se compone de 12.480 muestras extraidas de metraje de vigilancia real, limpiadas y anotadas: 5.260 de estaciones de metro, 3.860 de vias urbanas y 3.360 de puentes, con una division 8:1:1 en entrenamiento/validacion/prueba. No se especifica el numero total de tokens de entrenamiento ni si hubo fases de RLHF o DPO. La innovacion tecnica destacable es la estructura de razonamiento guiado por escena que separa la descripcion semantica de la clasificacion final, lo que permite trazabilidad del juicio del modelo.

## Capacidades

- Generacion de descripciones semanticas detalladas de imagenes y fotogramas de video de vigilancia.
- Clasificacion multi-etiqueta de eventos anomalos en tres dominios: estaciones de metro, vias urbanas y puentes.
- Razonamiento guiado por cadena de pensamiento especifica por escena (entorno espacial, instalaciones, personas y vehiculos, identificacion de anomalia).
- Deteccion de anomalias de integridad de instalaciones (dano en paneles, equipos de vigilancia, iluminacion, pantallas PIS, tornos).
- Deteccion de infracciones de pasajeros y comportamientos inseguros.
- Deteccion de incidencias viarias: inundacion de calzada, derrame de carga, venta ambulante en la calzada, paso de vehiculos especiales (ambulancias), presencia de vehiculos no autorizados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: la model card incluye un agente de demostracion (demo_agent.py) para deteccion unificada multi-etiqueta en las tres escenas.
- Capacidades multilingues: no disponible en la informacion proporcionada (los ejemplos de la model card estan en ingles).

## Casos de uso

- Monitorizacion de estaciones de metro: el modelo analiza fotogramas de pasillos, andenes y tornos para detectar suelos mojados, paneles de vidrio danados, equipos de vigilancia desprendidos o comportamientos inseguros de pasajeros, generando una descripcion y una clasificacion multi-etiqueta que puede alimentar un panel de alertas.
- Gestion de incidencias en vias urbanas: procesa imagenes de trafico para identificar inundaciones de calzada, derrames de carga, venta ambulante sobre la calzada o presencia de vehiculos no autorizados (por ejemplo, carretillas elevadoras), permitiendo priorizar la intervencion de servicios municipales.
- Vigilancia de puentes y paso de vehiculos especiales: detecta el paso de ambulancias y otros vehiculos especiales, asi como condiciones de calzada, para coordinacion de trafico y respuesta a emergencias.
- Agente de deteccion unificada multi-etiqueta: el demo_agent.py incluido permite desplegar un agente que enruta cada imagen al prompt de sistema de la escena correspondiente y consolida las etiquetas de anomalia en una unica salida.
- Generacion de informes de anotacion semantica: el modelo produce descripciones en un parrafo continuo sin titulos ni etiquetas, adecuadas para alimentar pipelines de anotacion o auditoria de datos de vigilancia.
- Despliegue en produccion con vLLM: la model card documenta un entorno de servicio con vLLM 0.9.2 y cliente compatible con OpenAI, lo que facilita la integracion en backends existentes mediante API.
- Ajuste fino adicional: al estar bajo licencia Apache 2.0 y con pesos completos en safetensors, puede reentrenarse con LoRA sobre nuevos tipos de escena o dominios de anomalia.

## Benchmarks y rendimiento

La model card menciona una comparacion de metricas de clasificacion contra tres modelos base de codigo abierto (seccion 5), pero los valores numericos concretos no estan incluidos en la informacion proporcionada. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia orientativa para un modelo de 9.2B en safetensors, la carga en precision completa requiere del orden de 18-20 GB, mientras que cuantizaciones de 8 bits o 4 bits reducen el requisito, aunque el modelo no documenta cuantizaciones soportadas.
- GPU recomendadas: no especificadas en la model card. El despliegue documentado usa vLLM 0.9.2, compatible con GPUs de clase datacenter (A100, H100) y, con cuantizacion, con GPUs consumer de gama alta.
- Compatibilidad con GPU consumer: no confirmada en la informacion proporcionada.
- Opciones de despliegue: vLLM 0.9.2 (documentado en la model card) con cliente compatible con OpenAI. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| eCity-VL-9B | 9.2B | no disponible | Apache 2.0 | Vision-lenguaje para anomalias en vigilancia urbana | Hugging Face |
| Qwen3.5-9B-Base (modelo base) | 9B | no disponible | no disponible en la informacion | Vision-lenguaje generalista | Hugging Face |
| Modelos base de codigo abierto comparados en la model card | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card indica una comparacion de metricas de clasificacion contra tres modelos base de codigo abierto, pero no se detallan sus nombres ni sus resultados en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio restringido: el modelo esta afinado exclusivamente para tres tipos de escena (metro, via urbana, puente) y su rendimiento fuera de esos dominios no esta documentado.
- Sesgos conocidos: no se documentan sesgos especificos, pero al entrenarse sobre metraje de vigilancia real de escenas concretas puede heredar sesgos de muestreo geografico y de composicion de la poblacion observada.
- Riesgo de alucinacion: como modelo generativo, puede producir descripciones plausibles pero incorrectas de elementos no presentes en la imagen; la clasificacion multi-etiqueta debe validarse en produccion.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados; los ejemplos de la model card estan en ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-9B-Base, no detallada en la informacion proporcionada.
- Caveat de produccion: el repositorio tiene 0 descargas y 0 likes, y la model card no incluye benchmarks estandar; conviene realizar una evaluacion propia antes de desplegar en entornos criticos.
- Entornos separados: la model card advierte de conflictos de version entre las dependencias de entrenamiento (LLaMA-Factory) y de servicio (vLLM), por lo que requiere dos entornos conda distintos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eCityAI-Sup/eCity-VL-9B
- Paper de referencia: https://arxiv.org/abs/2505.09388
- Paper de referencia: https://arxiv.org/abs/2502.13923
- Repositorio LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
