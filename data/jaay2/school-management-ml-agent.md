# jaay2/school-management-ml-agent

## Resumen

School Management AI Agent - ML Intent & Slot Model es un modelo de clasificación de texto publicado por el usuario jaay2 en Hugging Face. No se trata de un modelo de lenguaje neuronal, sino de un pipeline clásico de Scikit-Learn serializado con joblib que combina extracción de características de n-gramas de palabras y de caracteres con un ensamblado por votación suave (soft voting) de tres estimadores lineales y probabilísticos. Su función es la clasificación semántica de intenciones (intent classification) dentro de un chatbot de gestión escolar, con extracción de entidades y razonamiento SQL sobre un esquema PostgreSQL concreto.

El modelo está diseñado para un dominio muy acotado: 27 intenciones ground-truth alineadas con un esquema de base de datos escolar de 29 tablas y 4 vistas. No dispone de arquitectura transformer, ni de pesos en formato safetensors o GGUF, ni de una ventana de contexto en el sentido habitual de los LLM. Su relevancia es la de un componente neuro-simbólico de bajo coste computacional que resuelve la capa de enrutamiento semántico de un agente conversacional vertical.

La información pública disponible es muy limitada: repositorio de 0.0 GB, cero descargas y cero likes en el momento de la consulta, licencia MIT y únicamente idioma inglés. La model card reporta una precisión de entrenamiento del 100.0% en Macro F1, lo que en un pipeline de este tipo sugiere sobreajuste o una evaluación sobre el propio conjunto de entrenamiento, no sobre datos retenidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Soft-Voting Hybrid FeatureUnion Ensemble (Scikit-Learn) |
| Parametros totales | no disponible (no es un modelo neuronal; el tamaño depende de los vocabularios y coeficientes serializados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clasificador de frases, sin ventana de contexto declarada) |
| Tipos de cuantizacion | no aplica (pesos joblib de precisión nativa, sin soporte GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | joblib (intent_model.joblib) |
| Extraccion de caracteristicas | Word n-grams (1,3) con TF sublineal y char_wb n-grams (2,5) |
| Estimadores del ensamblado | Logistic Regression multinomial (C=4.0, class_weight balanced), SGDClassifier con log loss (alpha=1e-4, penalización ElasticNet), Multinomial Naive Bayes (alpha=0.1) |
| Numero de intenciones | 27 |
| Esquema de dominio | PostgreSQL `school`, 29 tablas y 4 vistas |
| Metricas reportadas | 100.0% Macro F1 en entrenamiento; model_metrics.json con validación cruzada de 5 folds |

## Arquitectura y entrenamiento

El modelo no es un transformer ni un modelo de lenguaje. Es un pipeline clásico de procesamiento de lenguaje natural construido con Scikit-Learn que encadena una etapa de extracción de características con un ensamblado de clasificadores. La extracción combina dos representaciones: n-gramas de palabras de orden 1 a 3 con escalado TF sublineal, y n-gramas de caracteres en modo `char_wb` de orden 2 a 5, pensados para aportar robustez frente a erratas y para capturar morfología. Ambas representaciones se unen mediante `FeatureUnion`.

Sobre ese vector híbrido se aplica un ensamblado de votación suave con tres estimadores: regresión logística multinomial con C=4.0 y pesos de clase balanceados, SGDClassifier con log loss, alpha=1e-4 y penalización ElasticNet, y Multinomial Naive Bayes con alpha=0.1 para suavizado de frecuencias cero. La votación suave promedia las probabilidades predichas por cada estimador. No se documenta el volumen de datos de entrenamiento, la composición del corpus, ni si hubo aumento de datos o validación humana. La model card reporta 100.0% de Macro F1 en entrenamiento y menciona un informe de validación cruzada de 5 folds en `model_metrics.json`, pero no se publican los valores de esos folds en la información disponible.

Como innovación destacable dentro de su categoría, el modelo se presenta como el núcleo neuro-simbólico de un agente: la clasificación de intención se combina con extracción de entidades y razonamiento SQL consciente del esquema, de modo que la salida del clasificador se traduce en consultas sobre un esquema PostgreSQL concreto. No hay decodificación especulativa, atención lineal ni mecanismos propios de los LLM.

## Capacidades

- Clasificación de intención (intent classification) sobre texto en inglés, con 27 clases definidas por el dominio de gestión escolar.
- Extracción de entidades (slot filling) asociada a las intenciones del dominio.
- Robustez frente a erratas y variaciones morfológicas gracias a los n-gramas de caracteres `char_wb` de orden 2 a 5.
- Razonamiento SQL consciente del esquema: el modelo se presenta como el núcleo de clasificación que alimenta consultas sobre un esquema PostgreSQL de 29 tablas y 4 vistas.
- Integración en arquitectura de agente conversacional (agentic-ai) como capa de enrutamiento semántico.
- Salida de probabilidades por clase (votación suave), lo que permite umbrales de confianza y abstención.
- No soporta tool calling en el sentido de los LLM, ni generación de texto libre, ni razonamiento multi-paso autónomo, ni visión, ni audio.
- Capacidad multilingüe: únicamente inglés declarado.

## Casos de uso

- Enrutamiento de intenciones en un chatbot escolar: el modelo clasifica cada mensaje del usuario en una de las 27 intenciones y dirige la conversación al flujo correspondiente (consultas de notas, asistencia, horarios, matrículas). Es adecuado por su bajo coste de inferencia y su entrenamiento específico sobre el vocabulario del dominio.
- Extracción de entidades para formularios conversacionales: a partir de la intención detectada, el pipeline alimenta la extracción de slots (nombre de alumno, curso, asignatura, fecha) que rellenan los parámetros de la consulta posterior.
- Generación de consultas SQL sobre el esquema `school`: la salida del clasificador se traduce en una consulta parametrizada contra las 29 tablas y 4 vistas del esquema, lo que permite a un agente responder preguntas de administración escolar sin generar SQL libre.
- Filtrado y preprocesado en pipelines de atención al alumno: al actuar como clasificador previo, reduce el conjunto de acciones candidatas antes de invocar un LLM generativo, abaratando el coste total del sistema.
- Normalización de entradas con erratas: en canales de mensajería donde los usuarios escriben rápido, los n-gramas de caracteres permiten clasificar correctamente mensajes con faltas de ortografía o abreviaturas.
- Prototipado rápido de asistentes verticales: al ser un artefacto joblib de Scikit-Learn, se puede desplegar en cualquier servicio Python sin GPU, lo que facilita pruebas de concepto en entornos educativos con recursos limitados.
- Detección de intenciones fuera de dominio: con las probabilidades por clase se puede establecer un umbral de confianza para derivar a un humano o a un fallback cuando la consulta no encaja en las 27 clases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara un 100.0% de Macro F1 en entrenamiento y referencia un archivo `model_metrics.json` con validación cruzada de 5 folds cuyos valores no se incluyen en la información proporcionada. No se reportan métricas sobre conjuntos de test retenidos ni comparaciones con otros clasificadores.

## Requisitos de hardware

- VRAM: no requiere GPU. El pipeline se ejecuta en CPU; el consumo de memoria depende del tamaño de los vocabularios de n-gramas y de los coeficientes serializados, no cuantificado en la información disponible.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente para inferencia de un clasificador lineal con vocabulario de n-gramas.
- Cabe en cualquier equipo de consumo, incluidos portátiles de gama baja y entornos sin aceleración hardware.
- Opciones de despliegue: carga directa con `joblib.load` en Python, servicio REST con FastAPI o Flask, o integración en un pipeline de Scikit-Learn existente. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos neuronales.
- Latencia y throughput: no disponibles en la información proporcionada; en un clasificador de este tipo la latencia por petición suele ser de milisegundos en CPU, pero no se aporta medición concreta.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jaay2/school-management-ml-agent | Ensamblado Scikit-Learn (joblib) | no disponible | no aplica | en | MIT | Hugging Face, 0 descargas |
| Clasificadores de intención con TF-IDF + Logistic Regression | Pipeline clásico | no disponible | no aplica | multilingüe según corpus | variable | Ampliamente disponibles en Scikit-Learn |
| Modelos de intención basados en sentence-transformers (p. ej. all-MiniLM-L6-v2 + clasificador) | Transformer + cabeza de clasificación | ~22M (encoder) | 256-512 tokens | multilingüe en variantes | Apache 2.0 en la mayoría | Hugging Face, amplia adopción |
| LLM pequeños para function calling (p. ej. modelos de 1-3B) | Transformer decoder | 1-3B | 4k-32k tokens | multilingüe | variable | Hugging Face, amplia adopción |

La comparación cuantitativa de rendimiento no está disponible: el modelo no publica métricas sobre datos retenidos, por lo que no es posible contrastar su Macro F1 con alternativas. Frente a los encoders tipo sentence-transformers, este modelo ofrece menor coste computacional pero carece de generalización semántica fuera del vocabulario del dominio escolar. Frente a los LLM pequeños con function calling, ofrece determinismo y latencia muy inferior, a cambio de limitarse a 27 intenciones predefinidas y a un único esquema de base de datos.

## Limitaciones y advertencias

- El 100.0% de Macro F1 reportado corresponde a entrenamiento; no se aportan métricas sobre datos retenidos, lo que impide descartar sobreajuste severo.
- El modelo está acotado a 27 intenciones y a un esquema PostgreSQL concreto (`school`, 29 tablas y 4 vistas); cualquier cambio en el esquema o en el catálogo de intenciones requiere reentrenamiento.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- No es un modelo generativo: no puede redactar respuestas, razonar de forma abierta ni ejecutar tool calling autónomo; su función es exclusivamente clasificatoria.
- Riesgo de alucinación en el sentido clásico bajo, pero riesgo de clasificación errónea con alta confianza en entradas ambiguas o fuera de dominio; se recomienda umbral de confianza y fallback.
- No se documentan sesgos conocidos, composición del corpus de entrenamiento ni proceso de anotación, lo que dificulta evaluar la representatividad de las 27 clases.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento activo.
- El tamaño del repositorio es de 0.0 GB, lo que sugiere artefactos muy pequeños; conviene verificar la integridad de `intent_model.joblib` antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaay2/school-management-ml-agent
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código ni demos.
