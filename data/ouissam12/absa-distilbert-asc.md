# Ouissam12/absa-distilbert-asc

## Resumen

absa-distilbert-asc es un modelo de clasificación de sentimiento a nivel de aspecto (ABSA, *Aspect-Based Sentiment Analysis*) desarrollado por el usuario Ouissam12 en el marco del proyecto EspoCRM-OmniSentiment de la ENSAM Meknes. Se trata de un ajuste fino (fine-tuning) de distilbert-base-uncased para la tarea de determinar la polaridad de sentimiento (positiva, neutra o negativa) de un aspecto concreto dentro de una frase. La entrada se proporciona como un par de textos: la frase completa y el aspecto a evaluar.

El modelo se ha entrenado sobre los conjuntos de datos de referencia SemEval 2014, 2015 y 2016 en los dominios de restaurantes y portátiles, en inglés. Con 66.955.779 parámetros y un tamaño de repositorio de 0,3 GB, es un modelo compacto pensado para despliegue en entornos con recursos limitados, aunque su adopción pública es prácticamente nula (0 descargas y 0 likes en el momento de la consulta).

Su relevancia radica en la utilidad práctica de la tarea ABSA para sistemas de analítica de opiniones y atención al cliente: permite extraer no solo si una reseña es positiva o negativa, sino a qué atributo concreto (comida, servicio, batería, pantalla) se refiere cada valoración. La licencia Apache 2.0 facilita su uso comercial, aunque la ausencia de benchmarks publicados limita la evaluación objetiva de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT) |
| Parametros totales | 66.955.779 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la arquitectura base DistilBERT admite hasta 512 tokens, dato no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de distilbert-base-uncased, un transformer encoder de 6 capas obtenido mediante destilación de conocimiento a partir de BERT-base. DistilBERT conserva aproximadamente el 97 % del rendimiento de BERT en tareas de comprensión del lenguaje con un 40 % menos de parámetros y una inferencia un 60 % más rápida, lo que lo convierte en una base habitual para clasificación de texto en producción.

El entrenamiento se ha realizado sobre los conjuntos SemEval 2014, 2015 y 2016 en los dominios de restaurantes y portátiles, en inglés, según indica la model card. La tarea se formula como clasificación de pares de secuencias: la frase y el aspecto se introducen como par de textos y el modelo emite una etiqueta de polaridad (positive, neutral, negative). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, hiperparámetros, ni si se aplicaron técnicas de ajuste como RLHF o DPO (no aplicables habitualmente a clasificadores). Tampoco se documentan innovaciones técnicas adicionales más allá del propio ajuste fino.

## Capacidades

- Clasificación de sentimiento a nivel de aspecto (ABSA) en tres clases: positiva, neutra y negativa.
- Procesamiento de pares de textos (frase + aspecto) como entrada.
- Especialización en dominios de restaurantes y portátiles (SemEval 2014-2016).
- Clasificación de texto genérica mediante el pipeline `text-classification` de Transformers.
- Capacidad multilingüe: limitada al inglés.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Analítica de reseñas de restaurantes: dado un comentario como "la pasta estaba fría pero el servicio fue excelente", el modelo permite obtener la polaridad de cada aspecto ("pasta" → negativa, "servicio" → positiva), lo que facilita informes granulares de satisfacción por atributo.
- Monitorización de opiniones de productos electrónicos: para reseñas de portátiles, se puede evaluar la polaridad de aspectos como batería, pantalla o teclado, alimentando dashboards de calidad de producto.
- Enrutamiento de quejas en atención al cliente: si el modelo clasifica el aspecto "envío" como negativo, el sistema puede derivar automáticamente el ticket al equipo logístico y priorizar su resolución.
- Análisis de encuestas NPS con preguntas abiertas: extracción de la polaridad por atributo mencionado (precio, atención, instalaciones) para complementar las puntuaciones numéricas.
- Integración en el proyecto EspoCRM-OmniSentiment: uso previsto como componente de clasificación de sentimiento en un CRM, procesando comunicaciones de clientes para enriquecer los registros con señales de satisfacción.
- Preprocesado para pipelines de reputación de marca: clasificación por lotes de grandes volúmenes de menciones en inglés, aprovechando el reducido tamaño del modelo (0,3 GB) para ejecución en CPU o GPU de gama baja.
- Filtrado de feedback en plataformas de e-commerce: identificación automática de aspectos con sentimiento negativo para activar alertas de calidad antes de que escalen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión FP32 (66,9 M de parámetros, ~268 MB de pesos) y aproximadamente 0,15 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el modelo es apto para tarjetas de gama baja como GTX 1050 Ti, RTX 3050 o superiores (RTX 4090, A100, H100 no son necesarias).
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: pipeline de Transformers, TorchScript, ONNX Runtime, TGI (Text Generation Inference no aplica a clasificadores, pero sí servidores de inferencia genéricos), FastAPI con Transformers, o exportación a GGUF para llama.cpp (aunque no se documenta oficialmente).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia de milisegundos por muestra en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ouissam12/absa-distilbert-asc | 66,9 M | no disponible | ABSA (3 clases) | Apache 2.0 | Hugging Face (0 descargas) |
| CEBaB/t5-base.CEBaB.absa.inclusive.seed_42 | no disponible | no disponible | ABSA | no disponible | Hugging Face |
| ankitbansal811/ABSA-DistilBERT | no disponible | no disponible | ABSA | no disponible | GitHub (repositorio) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre SemEval (restaurantes y portátiles), el modelo puede generalizar mal a otros dominios como moda, viajes o servicios financieros.
- Riesgo de alucinación: bajo en sentido estricto (es un clasificador, no un generador), pero puede producir etiquetas erróneas en aspectos ambiguos o frases irónicas.
- Limitaciones de contexto: la longitud máxima de entrada no se especifica; la arquitectura base DistilBERT admite hasta 512 tokens, pero no se confirma que el ajuste fino preserve ese límite.
- Limitaciones de idioma: solo inglés; no soporta castellano ni otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no obstante, al derivar de distilbert-base-uncased, conviene revisar las condiciones de la licencia del modelo base (también Apache 2.0).
- Caveats para producción: con 0 descargas y 0 likes, no hay evidencia de validación por parte de la comunidad; no se publican métricas de precisión, recall ni F1, por lo que se recomienda una evaluación propia sobre el dominio objetivo antes de desplegarlo.
- La model card está redactada parcialmente en francés y la documentación es mínima; no se detallan hiperparámetros ni el proceso de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Ouissam12/absa-distilbert-asc
- Búsqueda de modelos ABSA en Hugging Face: https://huggingface.co/models?search=ABSA
- Repositorio GitHub de referencia ABSA-DistilBERT: https://github.com/ankitbansal811/ABSA-DistilBERT
