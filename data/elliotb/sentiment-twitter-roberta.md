# elliotb/sentiment-twitter-roberta

## Resumen

`elliotb/sentiment-twitter-roberta` es un modelo de clasificación de sentimiento en tres clases (negativo, neutro, positivo) para textos cortos en inglés, distribuido en formato ONNX con cuantización INT8. Se trata de un fine-tuning de `cardiffnlp/twitter-roberta-base-sentiment-latest` sobre el corpus público Tweet Sentiment Extraction (Figure Eight, «Data for Everyone»), orientado a inferencia en CPU mediante ONNX Runtime. El repositorio ocupa 0,1 GB y contiene únicamente `model_int8.onnx`, `tokenizer.json` y `sentiment_meta.json`.

El modelo resuelve el problema clásico de análisis de polaridad en publicaciones de redes sociales, donde los textos son breves, informales y con abundancia de ruido léxico. Su relevancia práctica radica en el binomio tamaño reducido y ejecución en CPU: la cuantización INT8 permite desplegarlo sin GPU, lo que lo hace útil para filtrado de streams de tuits, moderación o análisis de opinión a escala.

La versión INT8 mantiene prácticamente el rendimiento de la versión previa a la cuantización: 80,8 % de accuracy y 0,811 de F1 macro frente a 81,0 % y 0,813 respectivamente, medidos sobre el conjunto de test oficial de 3.534 tuits. La licencia es mixta: CC BY 4.0 para el modelo base y «no especificada» para los datos de entrenamiento, lo que introduce incertidumbre para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base), clasificación de secuencias |
| Parametros totales | no disponible (hereda la arquitectura de `cardiffnlp/twitter-roberta-base-sentiment-latest`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT8 (ONNX Runtime) |
| Idiomas soportados | en (inglés) |
| Licencia | other: CC BY 4.0 para el modelo base y datos sin especificar (`cc-by-4.0-base-model-and-unspecified-data`) |
| Formato de pesos | ONNX (`model_int8.onnx`), tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder de tipo RoBERTa en su variante base, adaptado a clasificación de secuencias con tres etiquetas de salida (negativo, neutro, positivo). El modelo parte de `cardiffnlp/twitter-roberta-base-sentiment-latest`, ya especializado en lenguaje de Twitter, y se fine-tunea sobre el corpus público Tweet Sentiment Extraction de Figure Eight («Data for Everyone»). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; para una tarea de clasificación supervisada, lo habitual es entrenamiento con pérdida de entropía cruzada, pero este extremo no se confirma en la model card.

La innovación técnica destacable es la conversión a ONNX con cuantización INT8, orientada a inferencia en CPU. El autor reporta que la cuantización apenas degrada el rendimiento (de 81,0 % a 80,8 % de accuracy y de 0,813 a 0,811 de F1 macro), lo que indica una compresión efectiva con pérdida mínima. El repositorio incluye además un fichero `sentiment_meta.json` con metadatos del modelo, presumiblemente con el mapeo de etiquetas y parámetros de preprocesado.

## Capacidades

- Clasificación de sentimiento en tres clases (negativo, neutro, positivo) para textos cortos en inglés.
- Análisis de polaridad en publicaciones de redes sociales, con especial foco en tuits.
- Inferencia en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Ejecución con cuantización INT8, lo que reduce el tamaño del artefacto y los requisitos de memoria.
- Integración en pipelines de `text-classification` (pipeline de Hugging Face).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada al inglés; no se documentan otros idiomas.

## Casos de uso

- **Monitorización de opinión en redes sociales:** el modelo puede procesar flujos continuos de tuits en inglés y asignar polaridad a cada publicación, lo que permite construir paneles de sentimiento de marca o de temas concretos con un coste de inferencia mínimo al ejecutarse en CPU.
- **Moderación y triaje de comentarios:** clasificar comentarios de una comunidad en negativos, neutros y positivos para priorizar la revisión humana de los mensajes negativos, reduciendo la carga de moderadores en foros y plataformas con contenido en inglés.
- **Análisis de encuestas abiertas y feedback de producto:** procesar respuestas cortas de usuarios (NPS, encuestas de satisfacción) y agregar la polaridad por segmento, con despliegue en servidores sin GPU.
- **Filtrado previo en pipelines de datos:** actuar como clasificador de primera etapa que descarte o etiquete textos neutros antes de pasarlos a modelos más grandes y costosos, optimizando el coste global del sistema.
- **Investigación en procesamiento de lenguaje social:** servir como línea base reproducible para experimentos de análisis de sentimiento en Twitter, dado que el autor publica el código, el protocolo y los resultados en su repositorio de GitHub.
- **Prototipado rápido y demos:** al estar en ONNX INT8 y ocupar 0,1 GB, puede integrarse en aplicaciones locales, notebooks o entornos con recursos limitados para validar ideas antes de escalar a modelos mayores.
- **Enrutamiento de atención al cliente:** clasificar mensajes entrantes en inglés por tono para dirigir las quejas negativas a agentes especializados y las consultas neutras a respuestas automáticas.

## Benchmarks y rendimiento

| Metrica | INT8 (este modelo) | Pre-cuantizacion | Conjunto de evaluacion |
|---|---|---|---|
| Accuracy | 80,8 % | 81,0 % | Test oficial, 3.534 tuits |
| F1 macro | 0,811 | 0,813 | Test oficial, 3.534 tuits |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas por clase.

## Requisitos de hardware

- **VRAM estimada:** no aplica para inferencia en CPU; el artefacto ONNX INT8 ocupa una fracción de los 0,1 GB del repositorio completo, por lo que la memoria necesaria es del orden de cientos de MB.
- **GPU recomendadas:** no son necesarias; el modelo está diseñado para ONNX Runtime en CPU. Cualquier GPU consumer (RTX 3060, RTX 4090, etc.) podría ejecutarlo, pero no aporta ventaja frente a CPU para este tamaño.
- **Compatibilidad con GPU consumer:** sí, cabe holgadamente en cualquier GPU consumer e incluso en entornos sin GPU.
- **Opciones de despliegue:** ONNX Runtime (CPU), integración en el pipeline `text-classification` de Hugging Face, y cualquier runtime compatible con ONNX. No se documentan despliegues con vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato y tarea.
- **Latencia y throughput:** no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| `elliotb/sentiment-twitter-roberta` | no disponible (RoBERTa base) | no disponible | 80,8 % accuracy / 0,811 F1 macro | CC BY 4.0 base + datos sin especificar | ONNX INT8 |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | no disponible (RoBERTa base) | no disponible | no disponible en esta ficha | CC BY 4.0 | safetensors / PyTorch |
| `cardiffnlp/twitter-roberta-base-sentiment` (versión previa) | no disponible (RoBERTa base) | no disponible | no disponible en esta ficha | CC BY 4.0 | safetensors / PyTorch |

La comparativa se limita al linaje directo del modelo, ya que la información proporcionada no incluye datos de rendimiento de alternativas. La ventaja diferencial de esta versión es el formato ONNX INT8 para CPU; su desventaja es la falta de especificación de la licencia de los datos de entrenamiento.

## Limitaciones y advertencias

- **Idioma:** solo inglés; no se garantiza un comportamiento correcto en otros idiomas.
- **Ironía y sarcasmo:** el autor advierte que estos fenómenos se interpretan frecuentemente de forma literal, lo que produce errores de clasificación.
- **Dominio restringido:** entrenado sobre tuits; su rendimiento en textos formales, técnicos o de otros dominios no está validado.
- **Licencia incierta para uso comercial:** el modelo base es CC BY 4.0, pero la licencia de los datos de entrenamiento (Figure Eight) no está especificada en el Hub, lo que introduce riesgo legal para despliegues comerciales.
- **Riesgo de sesgo:** al provenir de datos de redes sociales, puede reflejar sesgos demográficos, culturales y de estilo presentes en el corpus original; no se documentan análisis de sesgo.
- **Riesgo de alucinación:** no aplica en el sentido generativo (es un clasificador), pero sí existe riesgo de clasificaciones erróneas en textos ambiguos o muy cortos.
- **Sin métricas por clase:** solo se reportan accuracy y F1 macro globales, sin desglose por etiqueta, lo que dificulta evaluar el rendimiento en la clase neutra o en casos límite.
- **Adopción nula:** el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elliotb/sentiment-twitter-roberta
- Modelo base: https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest
- Demo (Space): https://huggingface.co/spaces/elliotb/sentiment-analysis
- Código, protocolo y reproducción: https://github.com/elliotbch/Sentiment-analysis
