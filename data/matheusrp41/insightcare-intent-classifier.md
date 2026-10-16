# matheusrp41/insightcare-intent-classifier

## Resumen

El InsightCare Intent Classifier es un modelo de clasificación de intenciones desarrollado por el usuario matheusrp41 en el marco del proyecto InsightCare AI. A diferencia de los grandes modelos de lenguaje, no es una red neuronal profunda ni un transformer, sino un pipeline clásico de procesamiento de lenguaje natural construido con scikit-learn: vectorización TF-IDF sobre unigramas y bigramas seguida de una regresión logística con C = 10.0.

Su función es identificar la intención de mensajes escritos en portugués brasileño dentro de conversaciones de atención al cliente, distinguiendo entre nueve categorías: cancelamento, compra, duvida_produto, duvida_servico, elogio, outros, reclamacao, saudacao y suporte_tecnico. Se entrenó con un dataset sintético de 944 conversaciones y obtuvo una accuracy de 0.8316 y un F1 macro de 0.80 sobre 95 ejemplos de test.

Resulta relevante por su ligereza y por la facilidad de despliegue en entornos de producción con recursos muy limitados, ya que no requiere GPU. Su alcance, sin embargo, es mucho más reducido que el de un LLM: no genera texto, no razona y su licencia no está especificada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: vectorizacion TF-IDF (unigramas y bigramas) + regresion logistica |
| Parametros totales | no disponible (depende del tamano del vocabulario TF-IDF y del numero de clases; no se especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de bolsa de palabras; no dispone de ventana de contexto) |
| Tipos de cuantizacion | no aplica (no es una red neuronal); se serializa mediante joblib |
| Idiomas soportados | portugues (pt), variante de portugues brasileno |
| Licencia | no disponible |
| Formato de pesos | joblib (serializacion basada en pickle) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline clasico de dos etapas. En primer lugar, un vectorizador TF-IDF convierte el texto de entrada en una representacion numerica dispersa a partir de unigramas y bigramas. En segundo lugar, un clasificador de regresion logistica (scikit-learn) asigna una de las nueve clases de intencion. El unico hiperparametro documentado es la regularizacion C = 10.0, seleccionada durante la fase de ajuste. No hay capas de atencion, embeddings contextuales ni mecanismos de decodificacion.

El entrenamiento se realizo sobre el dataset RichardSakaguchiMS/brazilian-customer-service-conversations, de caracter sintetico y compuesto por 944 conversaciones. El reparto fue de 755 registros para entrenamiento, 94 para validacion y 95 para test. El modelo final se reajusto con la union de entrenamiento y validacion tras la seleccion de hiperparametros. No se documenta el uso de RLHF, DPO ni ninguna tecnica de alineacion, ni tampoco innovaciones tecnicas destacables mas alla del propio pipeline TF-IDF + regresion logistica.

## Capacidades

- Clasificacion de texto en nueve intenciones predefinidas de atencion al cliente en portugues brasileno.
- Devuelve la clase predicha y una probabilidad por clase mediante `predict_proba` (no calibrada).
- Inferencia sobre lotes de textos, ya que acepta listas de cadenas.
- No genera texto: es un clasificador discriminativo, no un modelo generativo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada: unicamente portugues.
- No dispone de modo de razonamiento, vision, audio ni ninguna capacidad multimodal.

## Casos de uso

- Enrutamiento automatico de tickets: clasificar cada mensaje entrante en una de las nueve intenciones para dirigirlo al equipo o cola correspondiente (soporte tecnico, reclamaciones, cancelaciones, etc.).
- Triaje previo en chatbots de atencion: detectar la intencion antes de decidir si se responde con una plantilla, se escala a un agente humano o se invoca un sistema externo.
- Deteccion de solicitudes de cancelacion para retencion: identificar la clase `cancelamento` en tiempo real y activar flujos de retencion o contraofertas.
- Clasificacion de reclamaciones para priorizacion: separar `reclamacao` del resto de categorias y asignarle una prioridad mayor en el sistema de gestion.
- Analisis agregado de motivos de contacto: etiquetar grandes volumenes de conversaciones historicas para construir informes de motivos recurrentes sin coste de GPU.
- Deteccion de elogios para reporting de calidad: aislar la clase `elogio` y usarla en cuadros de mando de satisfaccion o en programas de reconocimiento de agentes.
- Etiquetado automatico en CRM: enriquecer cada interaccion con una etiqueta de intencion que facilite busquedas y segmentacion posterior.
- Preprocesado antes de un LLM: usar la clasificacion como paso barato de filtrado para decidir que consultas merecen invocar un modelo generativo mas costoso.

## Benchmarks y rendimiento

Evaluacion sobre 95 ejemplos de test, segun la model card:

| Metrica | Resultado |
|---|---:|
| Accuracy | 0.8316 |
| Precision macro | 0.84 |
| Recall macro | 0.80 |
| F1 macro | 0.80 |

No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y estos no aplican a un clasificador de intenciones.

## Requisitos de hardware

- Inferencia exclusivamente en CPU: no requiere GPU.
- VRAM estimada: 0 GB (el modelo se carga en memoria RAM como artefacto joblib).
- GPU recomendadas: ninguna; cualquier GPU es innecesaria para este modelo.
- Cabe en cualquier equipo consumer: el tamano del repositorio es de aproximadamente 0.0 GB y el modelo completo es un pipeline TF-IDF + regresion logistica de peso muy reducido.
- Opciones de despliegue: carga directa con `joblib.load` dentro de un servicio Python; la model card menciona una API desarrollada con FastAPI, PostgreSQL, scikit-learn y Amazon Bedrock en el proyecto InsightCare AI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tarea | Licencia | Rendimiento |
|---|---|---|---|---|---|
| matheusrp41/insightcare-intent-classifier | TF-IDF + regresion logistica (scikit-learn) | Portugues | Clasificacion de intenciones (9 clases) | no disponible | Accuracy 0.8316; F1 macro 0.80 |
| Falconsai/intent_classification | Transformer (no especificado en la busqueda) | Ingles | Clasificacion de intenciones | no disponible | no disponible |
| matheusrp41/bert-hate-speech-test | BERT (0.1B) | no disponible | Clasificacion de discurso de odio | no disponible | no disponible |

No se dispone de datos de rendimiento comparables de los modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a arquitectura, idioma y tarea.

## Limitaciones y advertencias

- Entrenado exclusivamente con conversaciones sinteticas, no con atenciones reales.
- No validado con datos reales de operadoras de salud, segun reconoce el propio autor.
- Puede cometer errores en categorias ambiguas o solapadas (por ejemplo, `duvida_produto` frente a `duvida_servico`).
- Las probabilidades devueltas no estan calibradas, por lo que no deben interpretarse como niveles de confianza fiables.
- El autor advierte explicitamente de que no debe utilizarse para decisiones automatizadas de alto impacto.
- El archivo joblib usa serializacion basada en pickle: cargar unicamente artefactos de fuentes confiables por el riesgo de ejecucion de codigo arbitrario.
- La licencia no esta especificada, lo que impide confirmar si se permite el uso comercial.
- Cobertura linguistica limitada al portugues; no soporta otros idiomas.
- No es un modelo generativo: no puede redactar respuestas, resumir ni razonar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matheusrp41/insightcare-intent-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/RichardSakaguchiMS/brazilian-customer-service-conversations
- Perfil del autor en HuggingFace: https://huggingface.co/matheusrp41/models
- Falconsai/intent_classification: https://huggingface.co/Falconsai/intent_classification
- NVIDIA AI-Q Blueprint, Intent Classifier: https://docs.nvidia.com/aiq-blueprint/2.0.0/architecture/agents/intent-classifier.html
- How To Implement Intent Classification In NLP: https://spotintelligence.com/2023/11/03/intent-classification-nlp/
- Intent Classification: Techniques for NLP Models: https://labelyourdata.com/articles/machine-learning/intent-classification
