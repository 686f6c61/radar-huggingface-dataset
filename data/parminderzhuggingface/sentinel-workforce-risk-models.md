# ParminderzHuggingFace/sentinel-workforce-risk-models

## Resumen

Sentinel es una plataforma de inteligencia artificial multimodal para la predicción de riesgo de abandono voluntario y burnout en plantillas empresariales. Desarrollada por Parminder Singh, combina señales estructuradas de demografía, compensación y rendimiento con comentarios cualitativos de los empleados mediante una arquitectura de fusión tardía calibrada. El modelo se publica como un conjunto de artefactos congelados para producción: un MLP estructurado, un adaptador LoRA sobre DistilBERT y un meta-clasificador logístico que integra ambas ramas.

La relevancia de este modelo radica en su enfoque multimodal para analítica de recursos humanos, un campo donde los datos tabulares y de texto suelen tratarse por separado. Al fusionar ambas señales, Sentinel ofrece una predicción de abandono que supera en recall a las ramas individuales, aunque con una discriminación global modesta (ROC-AUC de 0.57 en la fusión). El repositorio incluye pesos congelados, configuración del preprocesador y el modelo de fusión, todo bajo licencia MIT.

Con un tamaño total de 4.31 MB, el sistema es ligero y desplegable en entornos con recursos limitados, aunque la rama de texto se apoya en el modelo base DistilBERT de 66 millones de parámetros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP estructurado (380→128→64→32→1) + DistilBERT con adaptador LoRA + meta-clasificador logístico de fusión tardía |
| Parámetros totales | No disponible (rama de texto: 66M del base + LoRA; rama tabular: MLP pequeño; fusión: regresión logística) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (DistilBERT soporta hasta 512 tokens) |
| Tipos de cuantización | No disponible (los adaptadores se publican en safetensors, no hay GGUF ni otras cuantizaciones) |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoint MLP), safetensors (adaptador LoRA), joblib (meta-clasificador) |

## Arquitectura y entrenamiento

Sentinel usa una arquitectura de fusión tardía multimodal con dos ramas independientes. La rama tabular es un MLP de 4 capas que procesa 380 características codificadas (24 métricas continuas y 356 dimensiones one-hot) y predice la salida voluntaria (`left_company`). La rama de texto es un modelo DistilBERT-base-uncased con un adaptador LoRA (r=16, α=32, dropout=0.05) aplicado a las capas de atención `q_lin` y `v_lin`, que predice el riesgo de burnout psicológico (`high_burnout_risk`). Finalmente, un meta-clasificador logístico calibrado fusiona las probabilidades de ambas ramas mediante una combinación lineal en el espacio logit.

El entrenamiento se realizó con un dataset de 679,662 filas para la rama tabular y 679,814 comentarios para la rama de texto, con un holdout de prueba de 85,096 y 85,197 respectivamente. No se especifica el uso de RLHF, DPO ni técnicas de alineación; el entrenamiento se enfoca en la optimización supervisada con AdamW para el MLP y LoRA para el transformer. El meta-clasificador de fusión se calibra con un umbral de decisión óptimo τ* = 0.2313, buscando maximizar el recall en la detección de salidas reales.

## Capacidades

- Predicción de abandono voluntario de empleados a partir de datos estructurados (demografía, compensación, métricas de rendimiento).
- Predicción de riesgo de burnout y malestar psicológico a partir de comentarios de texto libre de los empleados.
- Fusión multimodal de señales tabulares y textuales mediante un meta-clasificador logístico calibrado.
- Clasificación binaria de texto (pipeline `text-classification`) con adaptador LoRA sobre DistilBERT.
- Soporte para despliegue ligero: el repositorio incluye artefactos congelados y un manifiesto de integridad SHA256.
- No se indica soporte para tool calling, agentes, razonamiento multi-step, visión ni audio.

## Casos de uso

- **Retención de talento en RRHH**: el modelo predice qué empleados tienen mayor probabilidad de dejar la empresa, permitiendo intervenciones proactivas como revisiones salariales o planes de desarrollo.
- **Análisis de encuestas de clima laboral**: la rama de texto clasifica comentarios abiertos para detectar señales de burnout y malestar psicológico, facilitando la priorización de equipos con riesgo.
- **Dashboard de riesgo de plantilla**: integrando las predicciones en un cuadro de mando, los responsables de RRHH pueden visualizar la distribución del riesgo de abandono por departamento o ubicación.
- **Auditoría de políticas de retención**: la fusión multimodal permite evaluar si las políticas de compensación o bienestar están correlacionadas con menores tasas de salida.
- **Sistema de alerta temprana**: con el umbral τ* = 0.2313, el modelo alcanza un recall del 86.6% en el holdout alineado, lo que lo hace útil para identificar candidatos a salida antes de que ocurra.
- **Investigación académica en analítica de personas**: el repositorio ofrece artefactos reutilizables y benchmarks verificados para estudiar métodos de fusión multimodal en el dominio de RRHH.

## Benchmarks y rendimiento

El README del modelo proporciona métricas de evaluación en conjuntos de prueba independientes para cada rama y para la fusión.

| Rama | Métrica | Valor |
|---|---|---|
| Tabular (MLP) | ROC-AUC | 0.5755 |
| Tabular (MLP) | PR-AUC | 0.3313 |
| Tabular (MLP) | Loss | 0.5899 |
| Tabular (MLP) | Brier | 0.2008 |
| Texto (DistilBERT + LoRA) | ROC-AUC | 0.7363 |
| Texto (DistilBERT + LoRA) | PR-AUC | 0.7565 |
| Texto (DistilBERT + LoRA) | Loss | 0.6099 |
| Texto (DistilBERT + LoRA) | Brier | 0.2079 |
| Fusión tardía | ROC-AUC | 0.5719 |
| Fusión tardía | PR-AUC | 0.3387 |
| Fusión tardía | Recall | 86.60% (2,113 de 2,440 salidas reales) |

No se han publicado comparaciones con otros modelos en la información disponible. Los valores de ROC-AUC de la fusión son bajos (0.57), lo que indica una discriminación limitada; la rama de texto tiene un rendimiento notablemente mejor.

## Requisitos de hardware

- **VRAM estimada**: la rama de texto DistilBERT con LoRA puede ejecutarse en GPUs con 4-6 GB de VRAM para inferencia en batch. El MLP tabular es trivial (<1 MB).
- **GPU recomendadas**: cualquier GPU moderna con soporte CUDA (RTX 2060, RTX 3090, A10G) es suficiente. El modelo también puede ejecutarse en CPU para inferencia de baja latencia en el MLP.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de consumo como RTX 3060 o superiores.
- **Opciones de despliegue**: el repositorio incluye artefactos en formato PyTorch, safetensors y joblib; se puede servir con frameworks como TorchServe, vLLM (para el transformer) o integración directa en pipelines de Python. No se incluyen configuraciones para Ollama ni llama.cpp.
- **Latencia y throughput**: no disponible. Se estima que la rama de texto tiene una latencia de ~10-20 ms por ejemplo en GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos de predicción de abandono de empleados en la información proporcionada. Como referencia de arquitectura, el modelo de texto (DistilBERT + LoRA) puede compararse con modelos de clasificación de texto genéricos como BERT-base o RoBERTa, pero no hay datos de rendimiento para esos modelos en este dataset. La fusión multimodal no tiene competidores claros en el dominio público.

## Limitaciones y advertencias

- **Rendimiento limitado en discriminación**: el ROC-AUC de la fusión es 0.5719, lo que indica una capacidad de predicción apenas superior al azar. Esto limita su uso en decisiones críticas de personal sin supervisión humana.
- **Sesgos en datos de entrenamiento**: el modelo se entrena con datos de una sola región (etiqueta `region:us`) y en inglés; puede no generalizar a otras culturas laborales o idiomas.
- **Riesgo de alucinación**: la rama de texto puede clasificar comentarios ambiguos o sarcásticos incorrectamente, dado que DistilBERT es un modelo de 66M con capacidad limitada.
- **Licencia MIT**: permite uso comercial, pero el usuario debe verificar que los datos de entrenamiento no tengan restricciones adicionales de privacidad (datos de empleados).
- **Falta de soporte de contexto largo**: la rama de texto se limita a 512 tokens, lo que no cubre comentarios muy extensos.
- **Dependencia del modelo base**: el adaptador LoRA requiere el modelo base `distilbert-base-uncased` para funcionar; no es autónomo.
- **Advertencia para producción**: el recall alto (86.6%) se logra a expensas de una alta tasa de falsos positivos (PR-AUC de 0.34), lo que puede generar alertas innecesarias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ParminderzHuggingFace/sentinel-workforce-risk-models
- Repositorio GitHub: https://github.com/ParminderSinghGithub/Sentinel
- Perfil del autor en HuggingFace: https://huggingface.co/ParminderzHuggingFace
