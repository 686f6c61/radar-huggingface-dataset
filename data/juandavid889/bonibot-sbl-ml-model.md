# JuanDavid889/bonibot-sbl-ml-model

## Resumen

BoniBot-SBL-Neural-Softmax-v1 es un clasificador de texto supervisado publicado por JuanDavid889 en Hugging Face, disenado especificamente para el asistente virtual de WhatsApp BoniBot del Colegio San Bonifacio de las Lanzas Bilingue (SBL). No se trata de un modelo de lenguaje generativo ni de un transformer: es un pipeline clasico de procesamiento de lenguaje natural que combina representaciones TF-IDF a nivel de subpalabra (unigramas, bigramas, prefijos y char-4-gramas) con un clasificador softmax entrenado con entropia cruzada.

El modelo resuelve un problema acotado y concreto: mapear consultas entrantes de la comunidad educativa (padres, alumnos, personal) a una de las 194 clases institucionales definidas, que cubren preguntas frecuentes (FAQs) y articulos del Pacto y del SIEE del colegio. Su relevancia practica reside en la latencia declarada de inferencia inferior a 5 milisegundos, lo que lo hace apto para responder en tiempo real dentro de un flujo de mensajeria, sin necesidad de infraestructura GPU.

La ficha se basa exclusivamente en la informacion publicada en la model card y en los metadatos de Hugging Face. No hay informacion disponible sobre arquitectura neuronal profunda, datos de preentrenamiento a gran escala ni evaluaciones externas independientes. El modelo esta etiquetado como `generic` en la libreria y su licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF a nivel de subpalabra (unigramas, bigramas, prefijos y char-4-gramas) + clasificador softmax con perdida de entropia cruzada |
| Parametros totales | No disponible (modelo clasico; 4713 features de vocabulario y 194 clases de salida) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican pesos en formatos cuantizables tipo GGUF) |
| Idiomas soportados | Espanol (`es`) |
| Licencia | MIT |
| Formato de pesos | No disponible (libreria `generic`; artefactos de pipeline TF-IDF + softmax, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo no emplea una arquitectura transformer ni MoE ni SSM. Se trata de un pipeline de aprendizaje supervisado clasico: una etapa de vectorizacion TF-IDF que extrae caracteristicas a nivel de palabra (unigramas y bigramas), a nivel de prefijo y a nivel de caracter (char-4-gramas), generando un vocabulario de 4713 features, seguida de un clasificador softmax entrenado con entropia cruzada sobre 194 clases institucionales.

El entrenamiento se realizo sobre 710 ejemplos del dataset `JuanDavid889/bonibot-sbl-dataset`, durante 20 epocas, con una perdida que descendio de 0.6292 a 0.1251. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, ni se especifica la composicion detallada del dataset mas alla de que cubre FAQs y articulos del Pacto y del SIEE. La innovacion tecnica declarada es la combinacion de rasgos subword (prefijos y char-4-gramas) con rasgos de palabra, orientada a mejorar la robustez ante variaciones morfologicas y errores tipograficos en las consultas, y un objetivo de inferencia inferior a 5 ms en produccion.

## Capacidades

- Clasificacion de texto multietiqueta cerrada: asigna una consulta a una de las 194 clases institucionales predefinidas.
- Preguntas frecuentes (FAQs) del colegio: identificacion de la intencion detras de consultas de padres, alumnos y personal.
- Recuperacion de articulos del Pacto y del SIEE: clasificacion de consultas hacia la seccion normativa correspondiente.
- Procesamiento de espanol con tolerancia a variaciones subword gracias a prefijos y char-4-gramas.
- Inferencia de baja latencia (declarada inferior a 5 ms), adecuada para respuestas en tiempo real en mensajeria.
- Integracion en flujos de WhatsApp como capa de enrutamiento o intencion previa a un sistema de respuestas.
- No dispone de generacion de texto libre, razonamiento multi-paso, tool calling, vision, audio ni modo de pensamiento.
- No se documentan capacidades de agentes ni de function calling.

## Casos de uso

- Enrutamiento de consultas en el asistente de WhatsApp BoniBot: el modelo clasifica el mensaje entrante en una de las 194 clases institucionales y dirige la conversacion al bloque de respuesta o al articulo correcto, con latencia inferior a 5 ms que permite respuestas practicamente inmediatas.
- Atencion de FAQs del colegio: ante preguntas sobre horarios, matriculas, calendario o contactos, el clasificador identifica la FAQ correspondiente y activa la respuesta predefinida, reduciendo la carga del personal administrativo.
- Consulta de normativa interna (Pacto y SIEE): un padre o alumno pregunta por un articulo concreto y el modelo lo mapea a la clase normativa adecuada, facilitando la recuperacion del texto exacto.
- Clasificacion previa en un pipeline mayor: como primera etapa de un sistema con un LLM generativo detras, el clasificador filtra y etiqueta la intencion para que el modelo mayor solo reciba consultas relevantes, ahorrando coste y latencia.
- Analitica de consultas entrantes: agregar las clases predichas sobre el historico de mensajes para identificar que temas concentran mas demanda (matriculas, convivencia, evaluacion) y priorizar mejoras en la web o en el material informativo.
- Despliegue en entornos con recursos limitados: al no requerir GPU ni pesos de gran tamano, puede ejecutarse en el mismo servidor o contenedor que gestiona la integracion de WhatsApp, simplificando la operacion y el coste de infraestructura.
- Filtrado y derivacion a humano: las consultas cuya confianza de clasificacion sea baja pueden derivarse automaticamente a un operador, usando el clasificador como mecanismo de triaje.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 99.01% |
| Top-3 accuracy | 99.3% |
| Ejemplos de entrenamiento | 710 |
| Clases | 194 |
| Features de vocabulario | 4713 |
| Epocas | 20 |
| Perdida inicial | 0.6292 |
| Perdida final | 0.1251 |
| Latencia de inferencia en produccion | inferior a 5 ms |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos de referencia. Las metricas anteriores son de entrenamiento/evaluacion interna declaradas por el autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es un pipeline TF-IDF + softmax que se ejecuta en CPU.
- GPU recomendadas: ninguna necesaria; no se requiere aceleracion por hardware.
- Cabe en cualquier GPU consumer: si, aunque no es necesario usarla; tambien funciona en CPU de un servidor modesto o en un contenedor ligero.
- Opciones de despliegue: al estar en la libreria `generic`, no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI; el despliegue previsible es mediante el propio pipeline de la libreria o reimplementando el vectorizador y el clasificador en el servicio de mensajeria.
- Latencia y throughput estimados: latencia declarada inferior a 5 ms por inferencia; no se publica throughput (consultas por segundo) ni mediciones bajo carga.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| BoniBot-SBL-Neural-Softmax-v1 | TF-IDF subword + softmax | No disponible (4713 features, 194 clases) | No disponible | Espanol | MIT | Clasificador cerrado especifico del colegio SBL |
| Modelos de clasificacion de texto en espanol (p. ej. BETO fine-tuned) | Transformer encoder | ~110M (BETO base) | 512 tokens | Espanol | Varía segun modelo | Requiere GPU para latencias bajas y fine-tuning con mas datos |
| Clasificadores TF-IDF + regresion logistica genericos | Clasico | No disponible | No disponible | Multilingue | Varía | Alternativa generica; no incluye clases institucionales ni dataset especifico |

No se dispone de comparaciones publicadas de rendimiento frente a alternativas en la informacion proporcionada. La comparativa anterior es estructural, no de resultados.

## Limitaciones y advertencias

- Modelo de clasificacion cerrada: no genera texto libre ni mantiene conversaciones; solo asigna etiquetas entre las 194 clases definidas.
- Dominio muy restringido: entrenado exclusivamente para el contexto del Colegio San Bonifacio de las Lanzas; su utilidad fuera de ese ambito es nula.
- Riesgo de sobreajuste: con solo 710 ejemplos para 194 clases (unas 3,7 muestras por clase de media), la accuracy del 99,01% debe interpretarse con cautela; no se documenta validacion cruzada ni conjunto de test independiente.
- Sesgos: al derivarse de un dataset institucional concreto, puede reflejar los sesgos de las consultas y respuestas recogidas por el autor; no se documenta analisis de sesgo.
- Alucinacion: no aplica en el sentido generativo, pero existe riesgo de clasificacion erronea con alta confianza ante consultas fuera de distribucion.
- Limitaciones de idioma: solo espanol; no se documenta soporte de variantes dialectales ni de consultas en otros idiomas, pese a que el colegio se declara bilingue.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; conviene revisar la procedencia del dataset antes de reutilizarlo.
- En produccion: requiere un mecanismo de umbral de confianza y derivacion a humano para consultas ambiguas o fuera de catalogo.
- No se publican pesos en formatos estandar (safetensors, GGUF), lo que dificulta la reproducibilidad y el despliegue con herramientas habituales.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/JuanDavid889/bonibot-sbl-ml-model
- Dataset de entrenamiento: https://huggingface.co/datasets/JuanDavid889/bonibot-sbl-dataset
- Perfil del autor: https://huggingface.co/JuanDavid889
