# Deeplearning-2/sentimentai-models

## Resumen

SentimentAI models es un repositorio de pesos publicado por el usuario Deeplearning-2 que da soporte al servicio de inferencia SentimentAI, orientado al análisis de sentimiento basado en aspectos (aspect-based sentiment analysis, ABSA) sobre reseñas de restaurantes. El modelo trabaja con las categorías definidas en SemEval 2014 (food, service, price, ambience y anecdotes/miscellaneous) y se distribuye como un conjunto de artefactos que replican la carpeta `models/` que espera el servicio en producción.

El repositorio no contiene un modelo único, sino una estructura mixta: por un lado, ficheros `.joblib` que empaquetan un detector de aspectos, un modelo de polaridad y el listado de categorías; por otro, carpetas con los pesos de un Transformer (config.json, model.safetensors y ficheros de tokenizer) que esos bundles cargan por nombre. El autor declara que el entrenamiento se realizó sobre el dataset público de restaurantes de SemEval 2014 y que no se emplearon datos personales.

La relevancia de este repositorio es acotada: se trata de un artefacto de despliegue interno publicado en Hugging Face, con cero descargas y sin model card técnica detallada. No se especifican arquitectura del Transformer subyacente, número de parámetros, longitud de contexto ni resultados de evaluación, por lo que su utilidad para terceros queda limitada a la reproducción del pipeline de SentimentAI o a la inspección de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo subyacente no especificado) combinado con bundles `.joblib` (detector de aspectos + modelo de polaridad + categorías) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `.joblib` (bundles) y `safetensors` (Transformer) con `config.json` y ficheros de tokenizer |

## Arquitectura y entrenamiento

El repositorio combina dos capas. La primera es un Transformer estándar cuyos pesos se almacenan en `model.safetensors` junto a `config.json` y los ficheros de tokenizer; la model card no identifica la familia ni el tamaño de dicho Transformer. La segunda capa son bundles `.joblib` que el servicio carga por nombre y que integran tres componentes: un detector de aspectos, un modelo de polaridad y la lista de categorías objetivo (food, service, price, ambience, anecdotes/miscellaneous).

El entrenamiento se realizó sobre el dataset público de restaurantes de SemEval 2014, la referencia habitual para tareas ABSA. El autor indica explícitamente que no se utilizaron datos personales. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO; tampoco se describen innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Análisis de sentimiento basado en aspectos (ABSA) sobre reseñas de restaurantes en inglés.
- Detección de aspectos dentro del texto, con categorías alineadas con SemEval 2014: food, service, price, ambience y anecdotes/miscellaneous.
- Predicción de polaridad por aspecto mediante el modelo de polaridad incluido en el bundle `.joblib`.
- Carga por nombre de bundle, pensada para integrarse en el servicio de inferencia SentimentAI.
- Soporte monolingüe: únicamente inglés.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.

## Casos de uso

- Monitorización de reseñas de restaurantes: el pipeline permite extraer los aspectos mencionados (comida, servicio, precio, ambiente) y su polaridad para agregar métricas por local o cadena, aprovechando que las categorías están alineadas con SemEval 2014.
- Cuadros de mando de reputación online: al descomponer la opinión por aspectos en lugar de una única puntuación global, se pueden identificar qué dimensiones del negocio arrastran la valoración y priorizar acciones correctivas.
- Enrutado de quejas a equipos internos: la detección de aspectos permite clasificar automáticamente una reseña negativa sobre "service" hacia atención al cliente y una sobre "food" hacia cocina, usando el detector de aspectos del bundle.
- Análisis de la competencia: procesar reseñas de restaurantes rivales con el mismo esquema de categorías para comparar la percepción de cada aspecto entre establecimientos del mismo segmento.
- Investigación en ABSA: el repositorio sirve como referencia reproducible de un pipeline entrenado sobre SemEval 2014, útil para replicar experimentos o como línea base en trabajos académicos.
- Integración en pipelines de NLP existentes: al distribuirse como bundles `.joblib` más pesos en safetensors, puede cargarse dentro de servicios Python que ya usen scikit-learn o transformers, sin depender de un endpoint propietario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no especificarse el tamaño del Transformer subyacente.
- GPU recomendadas: no disponible por la misma razón; los bundles `.joblib` pueden ejecutarse en CPU.
- Compatibilidad con GPU de consumo: no determinable sin conocer el número de parámetros del Transformer.
- Opciones de despliegue: carga directa en Python mediante `joblib` para los bundles y la librería `transformers` para los pesos safetensors; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Idiomas | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| SentimentAI models (Deeplearning-2) | ABSA sobre reseñas de restaurantes, SemEval 2014 | en | MIT | no disponible | Pesos en HF (0 descargas) |
| Modelos ABSA basados en BERT (p. ej. bert-base-uncased ajustado) | Clasificación por aspecto y polaridad | en (y multilingüe en variantes) | Apache 2.0 / MIT según variante | 512 tokens típicamente | Amplia en HF |
| Modelos de sentimiento genéricos (p. ej. cardiffnlp/twitter-roberta-base-sentiment) | Polaridad global, no por aspecto | en | MIT | 512 tokens | Amplia en HF |

La comparación cuantitativa de rendimiento no está disponible para SentimentAI models, ya que el autor no publica métricas. Frente a alternativas consolidadas, la diferencia principal es la ausencia de documentación técnica y de evaluaciones reproducibles.

## Limitaciones y advertencias

- Ausencia total de métricas: no hay resultados de precisión, F1 ni comparaciones con líneas base, lo que impide evaluar su calidad frente a alternativas.
- Model card mínima: no se identifica el Transformer subyacente, su tamaño, su contexto máximo ni la composición exacta del entrenamiento.
- Dominio restringido: entrenado exclusivamente sobre reseñas de restaurantes de SemEval 2014, por lo que su generalización a otros dominios (productos, hoteles, servicios) es incierta.
- Monolingüe: solo inglés; no hay soporte declarado para castellano ni otros idiomas.
- Riesgo de alucinación y errores de polaridad: al ser un modelo de clasificación, puede asignar aspectos o polaridades incorrectas en textos ambiguos, irónicos o con negaciones complejas.
- Sesgos: no se documenta ningún análisis de sesgos; el dataset SemEval 2014 tiene una distribución demográfica y geográfica concreta que puede reflejarse en las predicciones.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia de los datos de entrenamiento antes de un despliegue en producción.
- Repositorio con cero descargas y sin mantenimiento aparente: la fecha de actualización es de noviembre de 2026 y no hay issues ni discusiones que permitan inferir actividad.
- Dependencia de la estructura de carpetas: los bundles `.joblib` esperan una disposición concreta (`<name>.joblib` y `<folder>/`), por lo que una carga incorrecta puede fallar silenciosamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Deeplearning-2/sentimentai-models
- Dataset de referencia SemEval 2014 Task 4 (ABSA): no se proporciona enlace en la información disponible.
- Documentación del servicio SentimentAI: no disponible.
