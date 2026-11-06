# jaay2/bawago-universal-model

## Resumen

BawaGo Universal Hierarchical AI Agent Model es un clasificador de intenciones de texto desarrollado por el usuario jaay2 para la plataforma BawaGo, un servicio peer-to-peer de emparejamiento de capacidad. No es un modelo de lenguaje generativo ni una red neuronal profunda: se trata de un pipeline serializado con joblib que combina un clasificador jerarquico en dos etapas sobre scikit-learn con una capa de ensemble de palabras clave por dominio.

El modelo resuelve un problema acotado: enrutar consultas de usuario hacia una de las siete verticales de negocio de BawaGo (equipaje, escrow SafeVault, trayectos, comida casera Crave, alojamientos Host, compras Wish y productos frescos de granja) y, dentro de cada vertical, clasificar la intencion granular entre 130 posibles. La etapa 1 es un router de 13 clases y la etapa 2 un clasificador de 130 clases con TF-IDF sublineal, rematado por una capa de seguridad por palabras clave.

Su relevancia es practica y de nicho: ofrece inferencia en torno a 1,2 ms en CPU estandar con un artefacto de 12,4 MB, lo que lo hace desplegable en entornos con recursos muy limitados. No dispone de ventana de contexto en el sentido de los transformers ni de capacidades generativas; su funcion es exclusivamente de clasificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador jerarquico en dos etapas (scikit-learn) + ensemble de palabras clave por dominio |
| Parametros totales | no disponible (no es un modelo neuronal; artefacto joblib de 12,4 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clasificacion de consultas individuales, sin ventana definida) |
| Tipos de cuantizacion | no aplica (artefacto scikit-learn serializado con joblib) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | joblib (`trained_agent_model.joblib`) |

## Arquitectura y entrenamiento

El modelo se estructura en tres etapas segun la model card. La etapa 1 es un router de 13 clases que asigna la consulta a una vertical de negocio, con una precision declarada del 99,75%. La etapa 2 es un clasificador de 130 clases de intencion granular basado en TF-IDF sublineal, con una precision declarada del 99,55%. La etapa 3 es una capa de acuerdo de contexto y seguridad por palabras clave que actua como filtro final. Todo el pipeline se serializa en un unico artefacto joblib de 12,4 MB y requiere scikit-learn 1.4.0 o superior.

El entrenamiento se realizo sobre un dataset propio (etiquetado como `custom`) de 1.997 pares consulta-intencion curados manualmente y distribuidos entre las siete verticales. No se documentan en la informacion disponible detalles sobre el proceso de anotacion, la composicion exacta por vertical, el uso de validacion cruzada ni si hubo ajuste de hiperparametros. Tampoco se menciona RLHF, DPO ni ninguna tecnica de alineacion, algo coherente con la naturaleza no generativa del modelo.

## Capacidades

- Clasificacion de intenciones de texto en ingles mediante pipeline scikit-learn.
- Enrutamiento jerarquico: primero a una de 13 clases de vertical, despues a una de 130 intenciones granulares.
- Ensemble de palabras clave por dominio como capa de refuerzo y seguridad.
- Mapeo de intencion a respuesta mediante `intent_answers.json`, con checklists de accion.
- Base de conocimiento asociada (`universal_kb.json`) con 130 politicas conversacionales no tecnicas.
- Inferencia rapida en CPU: aproximadamente 1,2 ms por consulta.
- No soporta tool calling, function calling, razonamiento multi-paso, vision, audio ni modo thinking.
- No genera texto libre: solo devuelve etiquetas de clasificacion y respuestas predefinidas asociadas.

## Casos de uso

- Enrutamiento de consultas en atencion al cliente de BawaGo: el modelo recibe el mensaje del usuario y lo dirige a la vertical correcta (por ejemplo, una reclamacion de equipaje frente a una consulta de alojamiento), lo que permite derivar la conversacion al flujo adecuado sin intervencion humana.
- Triaje de soporte en produccion con latencia minima: al responder en torno a 1,2 ms en CPU, puede colocarse delante de un chatbot o de un sistema de tickets para preclasificar miles de mensajes por minuto sin GPU.
- Clasificacion de intenciones en las siete verticales: dentro de cada vertical, la etapa 2 distingue entre las 130 intenciones granulares, lo que habilita respuestas automatizadas con `intent_answers.json` y sus checklists de accion.
- Despliegue en entornos con recursos limitados: el artefacto de 12,4 MB y la dependencia unicamente de scikit-learn y joblib permiten ejecutarlo en contenedores pequenos, funciones serverless o dispositivos de borde.
- Filtrado y seguridad de respuestas: la capa de palabras clave por dominio puede actuar como validacion adicional antes de devolver una respuesta al usuario, reduciendo clasificaciones erroneas en casos ambiguos.
- Prototipado rapido de asistentes verticales: sirve como base para construir un agente conversacional de bajo coste donde la generacion de texto la aporte otro componente y este modelo se encargue solo de la intencion.
- Analitica de consultas: al etiquetar grandes volumenes de mensajes con las 130 intenciones, permite agregar y analizar la demanda por vertical y por tipo de peticion.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card del autor y no estan verificados de forma independiente.

| Tarea | Metrica | Valor | Verificado |
|---|---|---|---|
| Multi-Vertical Intent Classification | Accuracy | 1,00 | No |
| Stage 1: Vertical Router (13 clases) | Accuracy | 0,9975 | No |
| Stage 2: Granular Intent Classifier (130 clases) | Accuracy | 0,9955 | No |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni metricas adicionales como F1, precision o recall por clase.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica, no necesita GPU.
- Memoria RAM: no disponible de forma explicita; el artefacto joblib ocupa 12,4 MB, por lo que la huella en memoria es reducida.
- Opciones de despliegue: cualquier entorno con Python y scikit-learn 1.4.0 o superior, cargando el pipeline con joblib. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de pesos neuronales.
- Latencia: aproximadamente 1,2 ms por consulta en CPU estandar, segun el autor.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se trata de un clasificador scikit-learn especifico de un producto, por lo que las alternativas habituales serian otros clasificadores de texto (por ejemplo, regresion logistica o SVM con TF-IDF, o modelos transformer pequenos tipo DistilBERT), pero no se han facilitado datos de rendimiento de esos modelos para esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| jaay2/bawago-universal-model | no disponible (joblib 12,4 MB) | no disponible | MIT | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El accuracy de 1,00 declarado en la model card no esta verificado y procede probablemente del propio conjunto de entrenamiento; es esperable un rendimiento inferior en datos reales no vistos.
- El dataset de entrenamiento es muy pequeno (1.997 muestras para 130 clases, en torno a 15 ejemplos por clase de media), lo que limita la generalizacion.
- Solo soporta ingles; no hay soporte multilingue documentado.
- No es un modelo generativo: no puede redactar respuestas nuevas, razonar ni mantener conversaciones; depende de respuestas predefinidas en `intent_answers.json`.
- Esta disenado especificamente para las siete verticales de BawaGo; su utilidad fuera de ese dominio es muy limitada.
- Riesgo de confusion en consultas ambiguas o fuera de distribucion, mitigado solo parcialmente por la capa de palabras clave.
- No se documentan sesgos conocidos, pero al entrenarse con datos curados manualmente puede heredar los sesgos de la anotacion.
- Licencia MIT: permite uso comercial y modificacion, pero conviene revisar las condiciones de los datos de entrenamiento, que no se detallan.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaay2/bawago-universal-model
- No se han encontrado en la informacion disponible otros enlaces a papers, blogs, repositorios o demos.
