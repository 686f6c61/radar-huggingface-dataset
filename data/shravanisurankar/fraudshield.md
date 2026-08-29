# shravanisurankar/fraudshield

## Resumen

FraudShield es un modelo de clasificación tabular basado en XGBoost, desarrollado por shravanisurankar como parte de una plataforma MLOps denominada FraudShield, orientada a la detección de transacciones fraudulentas con tarjetas de crédito. El modelo está diseñado para operar bajo condiciones de desbalance severo de clases, un problema habitual en el dominio financiero donde los casos positivos (fraude) son muy escasos frente a los legítimos.

El repositorio incluye dos artefactos: el clasificador XGBoost (`fraud_xgb_model.pkl`) y un preprocesador RobustScaler (`scaler.pkl`), lo que indica un pipeline de preprocesamiento robusto frente a outliers. El entrenamiento se gestiona con MLflow para garantizar reproducibilidad, y la evaluación se centra en métricas como PR-AUC y F1-score, adecuadas para problemas con clases desbalanceadas. Aunque la información pública es limitada, el modelo representa un ejemplo práctico de aplicación de gradient boosting en el sector financiero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XGBoost (gradient boosting) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, modelo tabular) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | .pkl (modelo y scaler) |

## Arquitectura y entrenamiento

El modelo emplea XGBoost, una implementación eficiente de gradient boosting sobre árboles de decisión, ampliamente utilizada para problemas de clasificación tabular. No se dispone de detalles sobre el número de árboles, profundidad máxima, tasa de aprendizaje u otros hiperparámetros. El preprocesamiento se realiza con RobustScaler, que escala las características usando la mediana y los cuantiles, lo que lo hace resistente a valores atípicos, común en datos de transacciones financieras.

El entrenamiento se gestiona mediante pipelines de MLflow, lo que sugiere un flujo reproducible con registro de métricas y artefactos. La evaluación se basa en PR-AUC (área bajo la curva precisión-recall) y F1-score, métricas apropiadas para conjuntos con fuerte desbalance de clases. No se han publicado detalles sobre el volumen de datos, la composición del dataset ni si se aplicaron técnicas de sobremuestreo o submuestreo.

## Capacidades

- Clasificación binaria de transacciones como fraudulentas o legítimas.
- Manejo de desbalance de clases mediante métricas orientadas a la precisión y el recall.
- Inferencia rápida y escalable, típica de modelos XGBoost, adecuada para entornos de producción.
- Preprocesamiento robusto frente a outliers gracias al RobustScaler.
- No se han documentado capacidades de generación de texto, tool calling, agentes, visión o procesamiento de lenguaje natural.

## Casos de uso

- Detección de fraude en tiempo real: el modelo puede integrarse en pasarelas de pago para puntuar cada transacción y bloquear o derivar a revisión manual aquellas con alta probabilidad de fraude. Su baja latencia permite decisiones en milisegundos.
- Scoring de riesgo en entidades financieras: utilizado como componente de un sistema de decisión crediticia o de monitorización de cuentas, combinando la puntuación del modelo con reglas de negocio.
- Análisis forense de transacciones históricas: aplicado sobre lotes de datos para identificar patrones de fraude pasados y mejorar la detección en futuras operaciones.
- Sistema de alertas tempranas: integrado en plataformas de banca online para notificar a los usuarios sobre movimientos sospechosos, reduciendo el impacto económico.
- Evaluación de modelos de fraude: sirve como baseline o referencia para comparar con otros algoritmos (redes neuronales, random forest) en el mismo dataset.
- Formación y demostración: útil como ejemplo didáctico de un pipeline MLOps completo con MLflow, preprocesamiento y métricas de evaluación en un problema real de clasificación desbalanceada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que se evaluó con PR-AUC y F1-score, pero no se proporcionan valores numéricos.

## Requisitos de hardware

- Al ser un modelo XGBoost, no requiere GPU para inferencia; puede ejecutarse eficientemente en CPU.
- El tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo muy ligero (típicamente menos de 100 MB).
- Memoria RAM estimada: inferior a 1 GB para cargar el modelo y el scaler.
- Opciones de despliegue: puede servirse mediante frameworks como Flask, FastAPI o MLflow Serving, o integrarse en pipelines de streaming con herramientas como Apache Kafka.
- No se dispone de datos de latencia o throughput específicos, pero en CPU moderna se esperan tiempos de inferencia del orden de microsegundos por muestra.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de detección de fraude. No se han publicado resultados en datasets públicos como el de IEEE-CIS o el de Kaggle Credit Card Fraud, ni se conocen modelos alternativos con los que se haya comparado directamente.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos del modelo; al ser un clasificador tabular, puede heredar sesgos presentes en los datos de entrenamiento (por ejemplo, geográficos o demográficos).
- Riesgo de alucinación: no aplica, al ser un modelo discriminativo sin generación de texto.
- Limitaciones de contexto: no aplica, ya que no procesa secuencias de texto.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o modificaciones.
- El modelo está etiquetado con la región "US", lo que sugiere que fue entrenado con datos de transacciones de Estados Unidos; su rendimiento puede degradarse en otros mercados.
- No se proporcionan detalles sobre la versión de XGBoost ni sobre la compatibilidad con versiones futuras de la librería.
- Al ser un modelo empaquetado en .pkl, es necesario mantener el entorno de Python y las versiones de las dependencias para garantizar la carga correcta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shravanisurankar/fraudshield
- Repositorio relacionado (proyecto FraudShield-AI): https://github.com/VishvaNarkar/FraudShield-AI
- Repositorio relacionado (plataforma web FraudShield-AI): https://github.com/25A31A05KF/FraudShield-AI
- Sitio web comercial FraudShield AI: https://fraudshieldai.co/
- Documentación de FraudShield AI Engine: https://sulagnasasmal.github.io/fraudshield-docs/
- Demo FraudShield AI: https://fraudshield2-five.vercel.app/
