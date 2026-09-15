# Odakris/sentiment-versioning-demo

## Resumen

`Odakris/sentiment-versioning-demo` es un modelo de clasificación de texto obtenido mediante ajuste fino (*fine-tuning*) de `distilbert-base-uncased`, publicado por el usuario Odakris en HuggingFace. Se trata de un modelo derivado de tipo *encoder-only* basado en la arquitectura DistilBERT, con 66.955.010 parámetros totales según los pesos en formato safetensors, y orientado a la tarea de análisis de sentimiento (clasificación de secuencias). El repositorio ocupa 0,8 GB e incluye únicamente los artefactos generados por el `Trainer` de la librería Transformers.

El modelo se entrenó durante una única época con un *learning rate* de 2e-05, tamaño de lote de 16 en entrenamiento y 32 en evaluación, optimizador AdamW con betas (0,9; 0,999) y planificador lineal. La model card es la plantilla autogenerada por la librería e indica explícitamente "More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento, por lo que no hay información pública sobre el corpus utilizado ni sobre los idiomas soportados. El nombre del repositorio sugiere un experimento de demostración vinculado al versionado de modelos, no un modelo listo para producción.

Su relevancia actual es limitada y de carácter demostrativo: no registra descargas ni *likes* en el momento de la consulta, no declara resultados de *benchmarks* en el `model-index` y no especifica idiomas. Se incluye aquí por completitud del catálogo y como ejemplo de artefacto mínimo de clasificación de sentimiento sobre una base DistilBERT con licencia Apache 2.0, lo que permite uso comercial sin restricciones por licencia (aunque con las limitaciones de información descritas más abajo).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DistilBERT (*encoder-only* transformer destilado de BERT-base); cabecera de clasificación de secuencias |
| Parámetros totales | 66.955.010 (dato real de los pesos safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens, límite arquitectónico de DistilBERT; no se especifica en la model card |
| Tipos de cuantización | No disponible (el repositorio no publica pesos cuantizados) |
| Idiomas soportados | No disponible (el modelo base `distilbert-base-uncased` se entrenó principalmente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería Transformers) |
| Pipeline declarado | `text-classification` |
| Modelo base | `distilbert/distilbert-base-uncased` |
| Tamaño del repositorio | 0,8 GB |
| Fecha de creación | 2026-09-15 |
| Última actualización | 2026-09-15 |
| Compatibilidad declarada | `text-embeddings-inference`, `endpoints_compatible` |

## Arquitectura y entrenamiento

La arquitectura subyacente es DistilBERT, una versión destilada de BERT-base que reduce la profundidad del modelo a 6 capas transformer con 768 dimensiones ocultas y 12 cabezas de atención (frente a las 12 capas de BERT-base), manteniendo un vocabulario *wordpiece* de 30.522 tokens y una ventana máxima de 512 posiciones. Sobre esta base, el autor ha añadido una cabecera de clasificación de secuencias, lo que da lugar a los 66.955.010 parámetros totales reportados en los safetensors. La model card no detalla el número de etiquetas del clasificador ni su configuración exacta.

En cuanto al entrenamiento, la única información disponible son los hiperparámetros registrados automáticamente por el `Trainer`: una época, *learning rate* 2e-05 con planificador lineal, lote de entrenamiento 16, lote de evaluación 32, semilla 42 y optimizador AdamW (variante *torch fused*) con betas (0,9; 0,999) y epsilon 1e-08. No se documenta el conjunto de datos ("unknown dataset"), el número de tokens de entrenamiento, la composición del corpus, ni si hubo fases de RLHF o DPO (poco habituales en modelos de clasificación). Tampoco se describe ninguna innovación técnica adicional: se trata de un ajuste fino estándar. Las versiones de framework declaradas son Transformers 5.17.0, PyTorch 2.14.0+cu130, Datasets 5.0.1 y Tokenizers 0.23.2.

## Capacidades

- Clasificación de texto por secuencias: el modelo devuelve una etiqueta por cada entrada de texto, según el pipeline `text-classification`. No se especifican las etiquetas concretas del clasificador.
- Análisis de sentimiento: es el uso implícito en el nombre del repositorio, aunque la model card no confirma la taxonomía de clases (por ejemplo, positivo/negativo o positivo/neutro/negativo).
- Procesamiento por lotes: al ser un encoder de 6 capas, permite inferencia en lote con coste bajo.
- Integración con Transformers: se puede cargar con `AutoModelForSequenceClassification` y `AutoTokenizer`.
- Compatibilidad con Text Embeddings Inference (TEI) y con *endpoints* de HuggingFace, según las etiquetas del repositorio.
- No dispone de generación de texto libre, razonamiento multi-paso, *tool calling*, capacidades de agente, visión, audio ni modo *thinking*: la arquitectura es exclusivamente discriminativa.
- Capacidades multilingües: no acreditadas; el modelo base es *uncased* en inglés, por lo que el rendimiento fuera del inglés es esperablemente bajo o nulo.

## Casos de uso

- Clasificación de opiniones de producto: dado un conjunto de reseñas, el modelo puede etiquetar cada una con la polaridad aprendida durante el ajuste fino. Adecuado por su bajo coste computacional (67 M de parámetros) para procesar volúmenes grandes en lote, siempre que el dominio de las reseñas se parezca al de los datos de entrenamiento, que se desconocen.
- Triaje de tickets de soporte: enrutar automáticamente consultas entrantes hacia equipos distintos en función del tono o la polaridad detectada. La ventana de 512 tokens cubre la mayoría de mensajes de soporte, aunque los hilos largos deben truncarse.
- Monitorización de menciones de marca: análisis por lotes de comentarios y publicaciones para agregar la proporción de sentimiento positivo y negativo por periodo. Requiere *fine-tuning* o validación adicional si el dominio difiere del corpus original.
- Preanotación para etiquetado humano: usar el modelo como primer paso en un flujo de anotación activa, dejando que las personas revisoras corrijan las predicciones. Es un escenario realista para un modelo de demostración con precisión declarada de 0,851 sobre un conjunto de validación no documentado.
- Análisis de voz del cliente y encuestas: clasificar respuestas abiertas de encuestas de satisfacción o NPS para generar métricas agregadas y *dashboards*, aprovechando la inferencia rápida en CPU o GPU de gama baja.
- Experimentación en MLOps y versionado de modelos: dado el nombre `sentiment-versioning-demo`, el caso natural es servir como artefacto de prueba en canalizaciones de integración continua y comparación de versiones (A/B testing), validando que el empaquetado safetensors, la carga con Transformers y el despliegue en *endpoints* funcionan de extremo a extremo.
- Prototipado académico y docencia: por su tamaño reducido y licencia permisiva, sirve como ejemplo reproducible de un ajuste fino con el `Trainer` para prácticas de clasificación de texto.
- Moderación de comentarios asistida: señalizar contenido con polaridad negativa extrema para revisión humana. No debe usarse como único criterio de moderación dada la ausencia de evaluación de sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El `model-index` de la model card contiene una entrada con la lista `results` vacía, por lo que no hay métricas sobre MMLU, GLUE, SST-2 ni ningún otro conjunto estándar.

El único dato de rendimiento disponible es el resultado de validación registrado por el `Trainer` durante el entrenamiento:

| Métrica | Valor | Época | Paso |
|---|---|---|---|
| Pérdida de validación (*validation loss*) | 0,3524 | 1,0 | 125 |
| Exactitud (*accuracy*) | 0,851 | 1,0 | 125 |
| Pérdida de entrenamiento (*training loss*) | No registrada ("No log") | 1,0 | 125 |

Estos valores proceden de un conjunto de validación cuya composición, tamaño y dominio no se documentan, por lo que no son directamente comparables con resultados publicados de otros modelos.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 268 MB en fp32 y 134 MB en fp16/bf16, calculado a partir de los 66.955.010 parámetros. Contando activaciones, tokenizador y *overhead* del runtime, el consumo práctico se sitúa en torno a 1-2 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en iGPU y en CPU. No requiere A100 ni H100.
- Inferencia en CPU: viable para lotes pequeños y moderados, al ser un encoder de 6 capas; es una opción habitual para despliegues de bajo tráfico.
- Opciones de despliegue: pipeline de Transformers, HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), Text Embeddings Inference (etiqueta `text-embeddings-inference`), ONNX Runtime tras conversión propia, TorchServe o un servicio FastAPI. No se publican artefactos específicos para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. No se han publicado mediciones y no conviene inferir cifras sin datos.

## Comparativa con modelos similares

No se dispone de métricas de benchmark de este modelo que permitan una comparación cuantitativa. La tabla siguiente recoge únicamente características estructurales y de licencia de alternativas de la misma categoría (clasificación de texto con encoders de tamaño pequeño-medio):

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Rendimiento comparado |
|---|---|---|---|---|---|
| `Odakris/sentiment-versioning-demo` | 66.955.010 | 512 tokens | Apache 2.0 | No disponible | No disponible |
| `distilbert-base-uncased` (modelo base) | ~66 M | 512 tokens | Apache 2.0 | Inglés | No disponible en esta información |
| `bert-base-uncased` | ~110 M | 512 tokens | Apache 2.0 | Inglés | No disponible en esta información |
| `roberta-base` | ~125 M | 512 tokens | MIT | Inglés | No disponible en esta información |

Cualitativamente, BERT-base y RoBERTa-base tienen mayor capacidad (más capas y parámetros) y, en tareas de clasificación general, suelen superar a DistilBERT, que fue diseñado para ser más rápido y ligero manteniendo un rendimiento cercano al de su modelo profesor. Este repositorio concreto no aporta métricas que permitan verificar ese comportamiento en su tarea objetivo.

## Limitaciones y advertencias

- Model card incompleta: la descripción, los usos previstos y los datos de entrenamiento figuran como "More information needed". Se desconoce por completo el conjunto de datos de ajuste fino, el número y el nombre de las etiquetas del clasificador, y la composición del conjunto de validación.
- Métricas no reproducibles: la exactitud de 0,851 proviene de un conjunto de validación no documentado y de una única época de entrenamiento, por lo que no es una estimación fiable del rendimiento en producción.
- Riesgo de sobreajuste al dominio: sin información sobre el corpus, no puede garantizarse que el modelo generalice a textos de otros dominios, registros o sectores.
- Sesgos: no se ha realizado ninguna evaluación de sesgos demográficos, de género, raciales o de otro tipo. Un clasificador de sentimiento puede amplificar sesgos presentes en los datos de entrenamiento, especialmente en textos sobre colectivos concretos.
- Alucinación: al ser un modelo discriminativo no genera texto y no puede alucinar en el sentido habitual; sin embargo, sí puede producir etiquetas incorrectas con alta confianza, lo que en la práctica tiene un riesgo operativo equivalente.
- Límite de contexto: la ventana máxima es de 512 tokens; los documentos más largos deben truncarse o dividirse, con la consiguiente pérdida de información.
- Idiomas: no se declara ningún idioma soportado. El modelo base es *uncased* en inglés, por lo que no debe asumirse un funcionamiento correcto en castellano ni en otras lenguas sin una validación previa.
- Madurez y soporte: cero descargas y cero *likes* en el momento de la consulta; el nombre del repositorio sugiere un experimento de demostración. No hay garantía de mantenimiento, corrección de errores ni soporte por parte del autor.
- Uso comercial: la licencia Apache 2.0 permite el uso comercial del artefacto, pero la ausencia de documentación sobre los datos de entrenamiento impide evaluar posibles reclamaciones sobre el corpus original.
- No apto como sistema de decisión automatizada en contextos sensibles (crédito, empleo, moderación sancionadora) sin supervisión humana y sin una evaluación específica previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Odakris/sentiment-versioning-demo
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Modelo base (organización): https://huggingface.co/distilbert/distilbert-base-uncased
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante. Los resultados devueltos corresponden a foros sobre trámites de certificados de vehículos en Francia (droit-finances.commentcamarche.com) y no guardan relación con el modelo. No hay papers, blogs ni repositorios adicionales que documenten este artefacto.
