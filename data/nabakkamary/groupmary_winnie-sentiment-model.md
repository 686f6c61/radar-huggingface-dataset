# NabakkaMary/groupMary_Winnie-sentiment-model

## Resumen

`groupMary_Winnie-sentiment-model` es un clasificador binario de sentimiento (positivo/negativo) para reseñas de películas en inglés, desarrollado por NabakkaMary y Winnie Among y publicado en Hugging Face. Se obtiene por ajuste fino (*fine-tuning*) de `distilbert-base-uncased` sobre el conjunto de datos IMDB (`stanfordnlp/imdb`), e incluye únicamente pesos en formato safetensors con 66.955.010 parámetros y un tamaño de repositorio de 0,3 GB.

El modelo resuelve una tarea acotada y bien delimitada: asignar una etiqueta de polaridad a un texto en inglés de dominio cinematográfico. Según la model card, alcanza una exactitud de 0,91444 y un F1 de 0,9153 sobre el conjunto de test, aunque no se detalla la partición exacta ni si el F1 es macro o ponderado. Su interés práctico radica en que es un *baseline* ligero, entrenable y desplegable en CPU, útil para prototipos de análisis de opiniones y para comparar con modelos mayores.

La ficha presenta varias carencias documentales que conviene tener en cuenta: la model card contiene marcadores `TODO` sin completar, no se declara licencia y no se especifican hiperparámetros de entrenamiento, sesgos evaluados ni resultados frente a otros modelos. La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos eran contenido no relacionado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DistilBERT (destilado de BERT-base), con cabeza de clasificación lineal sobre el token `[CLS]` |
| Parámetros totales | 66.955.010 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (límite arquitectónico de DistilBERT/BERT; no se indica de forma explícita en la model card) |
| Tipos de cuantización | No disponible; el repositorio solo publica safetensors en precisión original (sin GGUF, ONNX ni variantes cuantizadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible (no se declara licencia en el repositorio) |
| Formato de pesos | safetensors |
| Tarea (pipeline) | `text-classification` (análisis de sentimiento binario) |
| Etiquetas de salida | Positivo / negativo |
| Tokenizador | WordPiece *uncased* (heredado de `distilbert-base-uncased`) |
| Conjunto de entrenamiento | `stanfordnlp/imdb` |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura DistilBERT, una versión destilada de BERT-base que reduce la profundidad de 12 a 6 capas, mantiene un tamaño oculto de 768 y 12 cabezas de atención, y conserva aproximadamente el 97 % del rendimiento de BERT en tareas de comprensión del lenguaje con un 40 % menos de parámetros. Sobre esta base se añade una cabeza de clasificación lineal que proyecta la representación del token `[CLS]` a dos clases. El resultado son 66.955.010 parámetros, coherentes con el dato real de safetensors.

El ajuste fino se realizó sobre el dataset IMDB, compuesto por reseñas cinematográficas en inglés etiquetadas como positivas o negativas. La model card no especifica el número de tokens de entrenamiento, la partición exacta utilizada, la tasa de aprendizaje, el número de épocas, el tamaño de lote ni si se aplicaron técnicas de regularización. Tampoco indica el uso de RLHF, DPO u otras etapas de alineación, algo esperable en un clasificador de este tipo. No se documenta ninguna innovación técnica adicional más allá de la propia destilación.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, con una puntuación de confianza asociada a la etiqueta predicha.
- Procesamiento de documentos de hasta 512 tokens, suficiente para reseñas cinematográficas de extensión media; los textos más largos se truncan.
- Inferencia por lotes (*batching*), adecuada para procesar grandes volúmenes de reseñas.
- Ejecución viable en CPU, sin requisitos de GPU, gracias a su tamaño reducido.
- Integración directa con la pipeline `text-classification` de Hugging Face Transformers.
- No soporta generación de texto, *tool calling*, razonamiento multi-paso, agentes, visión ni audio: es un modelo exclusivamente discriminativo.
- Capacidad multilingüe: no disponible; solo inglés, con dificultades declaradas por el autor ante textos mixtos luganda-inglés.
- Capacidad especial: no se documenta *thinking mode* ni modo razonamiento.

## Casos de uso

- **Moderación y triaje de reseñas de cine o streaming:** el modelo clasifica automáticamente opiniones de usuarios como positivas o negativas para priorizar respuestas del equipo de soporte o detectar campañas de opiniones negativas coordinadas. Su contexto de 512 tokens cubre la mayoría de reseñas.
- **Etiquetado automático de datasets de opiniones:** dado su bajo coste computacional, sirve para preetiquetar grandes corpus de reseñas en inglés antes de una revisión humana, reduciendo el esfuerzo de anotación manual.
- **Cuadro de mando de reputación cinematográfica:** agregación de la polaridad de reseñas por título o plataforma para calcular índices de satisfacción y detectar cambios de tendencia tras un estreno.
- **Filtro previo en pipelines de análisis más costosos:** actuar como primera etapa que descarta o segrega reseñas claramente positivas o negativas, reservando modelos generativos o LLM de mayor tamaño para los casos ambiguos o que requieran explicaciones.
- **Prototipado rápido y pruebas de concepto:** al ocupar menos de 1 GB de VRAM y ejecutarse en CPU, permite validar una funcionalidad de análisis de sentimiento en horas, sin infraestructura GPU.
- **Procesamiento en el borde (*edge*) o en dispositivos modestos:** clasificación local de reseñas o comentarios en aplicaciones de escritorio, entornos con recursos limitados o escenarios con requisitos de privacidad que impiden enviar el texto a la nube.
- **Evaluación comparativa de modelos de sentimiento:** como *baseline* reproducible sobre IMDB para medir la mejora de modelos mayores o de arquitecturas más recientes en la misma tarea.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre el conjunto de test de IMDB:

| Métrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 0,91444 | IMDB test (según model card) |
| F1 | 0,9153 | IMDB test (según model card) |

No se han publicado resultados de benchmarks en la información disponible más allá de estas dos métricas. No se especifica si el F1 es macro, micro o ponderado, ni se aportan precisión, recall, matriz de confusión o resultados desagregados por clase. Tampoco hay comparación con otros modelos en la documentación proporcionada.

## Requisitos de hardware

- **VRAM estimada para inferencia:** por debajo de 1 GB en todos los casos; los pesos en FP32 ocupan aproximadamente 268 MB, en FP16/BF16 unos 134 MB y en INT8 unos 67 MB, a los que se suma memoria para activaciones y lote.
- **GPU recomendadas:** no requiere GPU. Cualquier GPU consumer sirve, incluida una GTX 1650, RTX 3060 o superior; una T4 es más que suficiente para servir el modelo a gran escala. No tiene sentido emplear A100 o H100 para esta carga.
- **¿Cabe en GPU consumer?** Sí, holgadamente, en cualquier GPU con 2 GB o más de VRAM, e incluso en CPU y en dispositivos de placa única tipo Raspberry Pi para volúmenes moderados.
- **Opciones de despliegue:** pipeline de Hugging Face Transformers, exportación a ONNX Runtime para acelerar en CPU, TorchScript, Triton Inference Server, FastAPI con Transformers como backend e Inference Endpoints de Hugging Face. No aplican vLLM, llama.cpp ni Ollama: no hay pesos GGUF y el modelo no es generativo.
- **Latencia y throughput estimados:** no hay mediciones publicadas. Como referencia orientativa, en CPU un texto corto puede procesarse en el orden de milisegundos a pocas decenas de milisegundos, y con GPU y lotes grandes se pueden alcanzar miles de textos por segundo; estas cifras son estimaciones y deben validarse en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| `NabakkaMary/groupMary_Winnie-sentiment-model` | 66.955.010 | 512 tokens | No disponible | Hugging Face | Accuracy 0,91444 / F1 0,9153 en IMDB (según model card) |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~67 M | 512 tokens | Apache 2.0 | Hugging Face | No comparado en la información disponible; entrenado en SST-2, no en IMDB |
| `bert-base-uncased` (ajustado para clasificación) | ~110 M | 512 tokens | Apache 2.0 | Hugging Face | No comparado en la información disponible |
| `roberta-base` (ajustado para clasificación) | ~125 M | 512 tokens | MIT | Hugging Face | No comparado en la información disponible |

La comparación directa de rendimiento no es posible con los datos aportados: solo el modelo objeto de la ficha publica métricas, y lo hace sobre IMDB, mientras que las alternativas citadas se distribuyen habitualmente como modelos base o ajustados en otros conjuntos. La ventaja principal frente a ellas es el menor número de parámetros y la licencia Apache 2.0 de la base, aunque la ausencia de licencia declarada en este repositorio limita su adopción comercial.

## Limitaciones y advertencias

- **Dominio restringido:** entrenado exclusivamente con reseñas de películas en inglés; el rendimiento puede degradarse de forma notable en otros dominios (productos, servicios, redes sociales, texto técnico).
- **Sesgos no evaluados:** no se documenta ninguna evaluación de sesgo por género, origen, edad u otras variables, ni análisis de disparidad entre subgrupos.
- **Riesgo de alucinación:** no aplica en el sentido generativo, pero el modelo puede producir clasificaciones erróneas con alta confianza, especialmente ante ironía, sarcasmo, críticas mixtas o reseñas neutrales.
- **Limitación de idioma:** solo inglés; el propio autor advierte de dificultades con sarcasmo y con texto mixto luganda-inglés.
- **Truncamiento:** los textos de más de 512 tokens se recortan, lo que puede eliminar información relevante en reseñas largas o en documentos concatenados.
- **Salida binaria:** no distingue intensidad, neutralidad ni emociones múltiples; fuerza toda entrada a positivo o negativo.
- **Licencia ausente:** no se declara licencia, por lo que el uso comercial queda en un limbo legal y requiere contactar con los autores.
- **Documentación incompleta:** la model card contiene marcadores `TODO` en miembros del grupo, dataset, ejemplos y limitaciones; no se detallan hiperparámetros, partición de datos ni proceso de evaluación.
- **Sin métricas desagregadas:** no hay precisión o recall por clase, ni matriz de confusión, lo que impide valorar el comportamiento en clases desbalanceadas.
- **Metadatos atípicos:** la fecha de creación del repositorio indicada (2026-10-23) es posterior a la fecha habitual de consulta, lo que conviene verificar antes de citar el modelo.
- **Sin garantías de producción:** al no existir un proceso de validación independiente ni versionado documentado, no se recomienda su uso en decisiones automatizadas de alto impacto sin supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NabakkaMary/groupMary_Winnie-sentiment-model
- Dataset IMDB: https://huggingface.co/datasets/stanfordnlp/imdb
- Modelo base DistilBERT: https://huggingface.co/distilbert-base-uncased
- Artículo de DistilBERT: https://arxiv.org/abs/1910.01108
- Artículo de BERT: https://arxiv.org/abs/1810.04805
- Artículo del dataset IMDB (Maas et al., 2011): https://aclanthology.org/P11-1015/

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores corresponden a recursos canónicos de la arquitectura, el modelo base y el conjunto de datos citados en la model card.
