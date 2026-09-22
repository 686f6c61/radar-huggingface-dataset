# MinThu11/burmese-disaster-classifier

## Resumen

El modelo `MinThu11/burmese-disaster-classifier` es un clasificador de texto en birmano (myanmar) desarrollado por el usuario MinThu11 y publicado en Hugging Face. Se trata de un ajuste fino (*fine-tuning*) de `xlm-roberta-base`, un encoder transformer multilingüe, sobre un corpus de aproximadamente 1.000 publicaciones de redes sociales relacionadas con desastres naturales en Myanmar. Su función es asignar cada texto a una de cuatro categorías operativas: rescate inmediato, campaña de donaciones, noticias generales y mensajes de buenos deseos u oraciones.

El problema que aborda es concreto: durante inundaciones, ciclones u otros desastres, los equipos humanitarios reciben un volumen enorme de mensajes en redes sociales y necesitan separar con rapidez las peticiones urgentes de rescate del ruido informativo y de los mensajes solidarios. Un clasificador específico para birmano permite automatizar ese triaje inicial, algo que los modelos genéricos multilingües no cubren con la misma precisión en un idioma de bajos recursos como el birmano.

Técnicamente es un modelo denso de 278.046.724 parámetros (según los pesos safetensors publicados), con licencia MIT, pensado exclusivamente para inferencia de clasificación y sin capacidades generativas. Su relevancia actual es la de un ejemplo típico de adaptación de un encoder multilingüe a un dominio de alto impacto social y a un idioma poco representado, aunque con un conjunto de entrenamiento reducido y sin resultados de evaluación publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia RoBERTa), base `FacebookAI/xlm-roberta-base` con cabeza de clasificación de secuencias |
| Parámetros totales | 278.046.724 (dato real de los pesos safetensors) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 512 tokens de posición en la arquitectura; entrenado con `max_length=128` |
| Tipos de cuantización | No disponible: el repositorio solo publica pesos safetensors |
| Idiomas soportados | Birmano (`my`) |
| Licencia | MIT |
| Formato de pesos | safetensors (carga vía `transformers`) |
| Pipeline | `text-classification` |
| Etiquetas de salida | `Immediate_Rescue_Needed`, `Donation_Campaign`, `General_News`, `Well_Wishing_Prayer` |
| Tamaño del repositorio | 1,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es XLM-RoBERTa en su variante *base*: un transformer encoder de 12 capas con representación multilingüe preentrenada, al que se añade una cabeza lineal de clasificación con cuatro salidas. El ajuste fino se realizó sobre un conjunto de datos de publicaciones de redes sociales sobre desastres en Myanmar, con un tamaño aproximado de 1.000 ejemplos y una partición 80/20 entre entrenamiento y prueba (es decir, unos 200 ejemplos de test).

Los hiperparámetros declarados por el autor son: 4 épocas, tasa de aprendizaje 2e-5, tamaño de lote 8, decaimiento de peso 0,01 y longitud máxima de secuencia de 128 tokens. No se documenta el uso de RLHF, DPO ni ninguna técnica de alineación, algo coherente con un clasificador discriminativo. Tampoco se describe ningún mecanismo de innovación técnica adicional (atención lineal, decodificación especulativa, decodificación híbrida), ni procesos de aumento de datos, ponderación de clases o búsqueda de hiperparámetros más allá de los valores indicados.

## Capacidades

- Clasificación de texto en birmano en cuatro categorías mutuamente excluyentes orientadas a respuesta ante desastres.
- Detección de peticiones urgentes de rescate o ayuda humanitaria inmediata.
- Identificación de campañas de donación y mensajes de oferta o solicitud de ayuda material.
- Distinción de noticias, avisos y actualizaciones situacionales.
- Reconocimiento de mensajes de solidaridad, oraciones y buenos deseos.
- Inferencia sobre textos cortos de redes sociales, con truncado a 128 tokens.
- No dispone de generación de texto, razonamiento multi-paso, *tool calling*, capacidades de agente, visión, audio ni modo de pensamiento.
- No hay evidencia de soporte multilingüe real: está entrenado y etiquetado únicamente para birmano.

## Casos de uso

- Triaje de emergencias en salas de crisis: el modelo permite enrutar automáticamente los mensajes etiquetados como `Immediate_Rescue_Needed` a un panel prioritario para operadores humanos, reduciendo el tiempo de respuesta en las primeras horas de una inundación o ciclón.
- Monitorización de redes sociales en tiempo real: integrado en un *pipeline* de streaming (por ejemplo, ingesta de publicaciones de Facebook o X en birmano), clasifica cada mensaje entrante y genera métricas agregadas de volumen de peticiones de rescate por región y franja horaria.
- Coordinación de campañas de donación: los mensajes clasificados como `Donation_Campaign` se pueden agrupar y verificar, ayudando a las ONG a identificar qué recursos se están ofreciendo o solicitando y a evitar duplicidades.
- Agregación de información situacional: los textos de tipo `General_News` alimentan un resumen de avisos y alertas oficiales o ciudadanas, útil para boletines internos de equipos de respuesta.
- Filtrado de ruido en canales de ayuda: los mensajes de `Well_Wishing_Prayer`, muy numerosos en contextos de catástrofe, se separan del flujo operativo para no saturar a los voluntarios.
- Análisis post-desastre e investigación: el modelo permite etiquetar retrospectivamente corpus históricos de redes sociales para estudiar la evolución del discurso humanitario, la distribución geográfica de las peticiones o la latencia entre el evento y la respuesta.
- Investigación en procesamiento de lenguaje natural para idiomas de bajos recursos: sirve como punto de partida (*baseline*) reproducible para experimentos de clasificación temática en birmano.
- Prefiltrado previo a un modelo mayor: en arquitecturas de dos etapas, este clasificador de 278 M de parámetros puede descartar mensajes irrelevantes antes de invocar un modelo generativo más costoso para resumir o extraer entidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La *model card* no incluye métricas de exactitud, F1, precisión o recuperación sobre el conjunto de prueba, ni comparaciones con otros clasificadores. Tampoco se han encontrado evaluaciones externas, dado que el modelo registra 0 descargas y 0 *likes* en el momento de la consulta.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, alrededor de 1,1 GB solo para pesos, más activaciones; en fp16/bf16, aproximadamente 0,56 GB; en int8, en torno a 0,28 GB. Cifras calculadas a partir de los 278 M de parámetros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente (RTX 3050, RTX 3060, RTX 4090, T4, L4, A10G). Para lotes grandes, una A100 o H100 aporta margen de sobra pero no es necesaria.
- Cabe holgadamente en GPU de consumo: sí, en cualquier tarjeta moderna con 4-6 GB o más, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `pipeline` o `AutoModelForSequenceClassification`, exportación a ONNX Runtime, servidores tipo TorchServe o FastAPI, Hugging Face Inference Endpoints y, en versiones recientes con soporte de clasificación de secuencias, vLLM. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama no son aplicables sin una conversión previa.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones y dependerán del hardware, del tamaño de lote y de la longitud de los textos (truncados a 128 tokens).

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de este modelo, por lo que la comparación se limita a características estructurales. Las cifras de parámetros de los modelos alternativos son valores aproximados de sus arquitecturas publicadas.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Especialización |
|---|---|---|---|---|---|
| `MinThu11/burmese-disaster-classifier` | 278 M | 512 tokens de arquitectura; 128 en entrenamiento | Birmano | MIT | Clasificación de desastres en 4 clases |
| `FacebookAI/xlm-roberta-base` | ~278 M | 512 tokens | ~100 idiomas | MIT | Modelo base multilingüe sin ajustar |
| `bert-base-multilingual-cased` | ~178 M | 512 tokens | ~104 idiomas | Apache 2.0 | Modelo base multilingüe sin ajustar |
| `distilbert-base-multilingual-cased` | ~135 M | 512 tokens | ~104 idiomas | Apache 2.0 | Modelo base multilingüe destilado, sin ajustar |

Como modelos comparables de la misma tarea (clasificación de desastres en birmano) no se han identificado alternativas públicas en la información disponible. No se dispone de datos de rendimiento comparativo entre estas opciones.

## Limitaciones y advertencias

- Conjunto de entrenamiento muy reducido: aproximadamente 1.000 ejemplos, de los cuales unos 200 se reservan para prueba. El riesgo de sobreajuste y de escasa generalización es alto.
- No se han publicado métricas de evaluación, por lo que no es posible verificar la calidad real de las clasificaciones.
- Cobertura limitada de tipos de desastre y de estilos de escritura: el propio autor advierte que puede no generalizar a todos los desastres ni a todas las variantes de redacción.
- Sesgo de dominio y de plataforma: entrenado con publicaciones de redes sociales, puede comportarse mal con textos formales, informes oficiales o lenguaje técnico.
- Idioma restringido al birmano; el rendimiento en otros idiomas no está garantizado y no debería asumirse aunque el modelo base sea multilingüe.
- Riesgo de alucinación no aplicable en sentido generativo (es un clasificador), pero sí existe riesgo de falsos negativos en la clase `Immediate_Rescue_Needed`, que es precisamente la de mayor coste humano si se falla.
- Desequilibrio de clases no documentado: no se indica la distribución de las cuatro etiquetas, lo que dificulta interpretar la fiabilidad por categoría.
- Licencia MIT, que permite uso comercial, modificación y redistribución con atribución y sin garantías. No se declaran restricciones adicionales de uso.
- Adopción nula (0 descargas, 0 *likes*) y ausencia de revisión por la comunidad: no hay validación externa, ni *issues* resueltos, ni versiones posteriores.
- Para producción en respuesta ante desastres se recomienda encarecidamente mantener supervisión humana y no automatizar decisiones críticas únicamente con la salida de este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MinThu11/burmese-disaster-classifier
- Modelo base: https://huggingface.co/xlm-roberta-base
- Paper de XLM-R (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- Documentación de `transformers` para clasificación de secuencias: https://huggingface.co/docs/transformers/tasks/sequence_classification

Nota: los resultados de la búsqueda web proporcionados corresponden a páginas de servicios de correo (Hotmail/Outlook) sin relación con el modelo, por lo que no se han incluido como fuentes.
