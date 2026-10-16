# cirimus/ultrabert-150M-emotions

## Resumen

UltraBERT-150M-emotions es un modelo de clasificación de texto en inglés especializado en la detección de emociones, publicado por el usuario cirimus (Enric Junqué de Fortuny). Se trata de un ajuste fino supervisado del encoder dmis-lab/UltraBERT-150M sobre el conjunto de datos cirimus/super-emotion, y devuelve puntuaciones de probabilidad para siete etiquetas emocionales: joy, sadness, anger, fear, love, neutral y surprise.

El modelo resuelve un problema clásico de análisis de sentimiento granular: pasar de la polaridad positiva/negativa a un espacio emocional discreto y utilizable en pipelines de producción. Con 151.037.959 parámetros y un repositorio de 0,6 GB, es lo bastante pequeño para ejecutarse en CPU o en cualquier GPU de consumo, lo que lo hace atractivo para tareas de etiquetado masivo, monitorización en tiempo real y enrutado de tickets.

Su relevancia actual es limitada pero concreta: la model card reporta métricas macro sólidas sobre un test set conjunto de 58.625 ejemplos (F1 macro 0,809, accuracy macro 0,957, MCC 0,784), aunque el modelo acumula cero descargas y cero likes en el momento de la consulta, carece de resultados en benchmarks externos y no declara longitud de contexto ni composición detallada del corpus de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer de la familia BERT; el modelo base es UltraBERT-150M y requiere cargar código personalizado (custom_code) |
| Parámetros totales | 151.037.959 (~151 M) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se distribuyen pesos cuantizados; al ser un encoder de 151 M es viable aplicar cuantización dinámica int8 con Optimum o PyTorch |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,6 GB) con código personalizado asociado |
| Modelo base | dmis-lab/UltraBERT-150M |
| Dataset de ajuste | cirimus/super-emotion |
| Etiquetas de salida | 7: joy, sadness, anger, fear, love, neutral, surprise |
| Tarea (pipeline) | text-classification |
| Librería | transformers (se indica transformers>=5.2 en el ejemplo de uso) |
| Compatibilidad con endpoints | Sí (tag endpoints_compatible) |

## Arquitectura y entrenamiento

El modelo parte de UltraBERT-150M, un encoder transformer de tipo BERT de 151 millones de parámetros, y se ajusta como cabeza de clasificación para siete clases emocionales. No se especifica en la información disponible si UltraBERT incorpora innovaciones de atención lineal, decodificación especulativa ni ninguna otra modificación estructural respecto al transformer canónico; tampoco se detalla la composición del dataset super-emotion, el número total de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO (en un clasificador discriminativo de este tipo no serían esperables).

Los hiperparámetros de ajuste fino sí están documentados: 2 épocas, learning rate 2e-5, batch size 16, weight decay 0,01, optimizador AdamW y planificación de decaimiento coseno con warmup. Las métricas de evaluación declaradas son precisión, recall, F1 macro y accuracy. El entrenamiento se realizó en una NVIDIA DGX Spark (GB10) durante aproximadamente 9 horas, con una huella estimada de 0,54 kg de CO2 según la calculadora ML CO2 Impact.

Un punto técnico relevante es la ambigüedad declarada por el propio autor: la descripción general habla de "clasificación multiclase" con siete etiquetas, mientras que el apartado Model Details indica "multi-label classification". Esta discrepancia afecta al diseño del pipeline (softmax sobre una única clase frente a sigmoide con clases independientes) y conviene resolverla empíricamente antes de integrar el modelo en producción.

## Capacidades

- Clasificación de emociones en texto en inglés con siete etiquetas: joy, sadness, anger, fear, love, neutral y surprise.
- Salida de probabilidades por clase, con soporte de top_k en el pipeline de transformers para recuperar las N emociones más probables.
- Procesamiento por lotes (batch inference) mediante el pipeline estándar de Hugging Face, adecuado para volúmenes altos de documentos cortos.
- Análisis de unidades cortas de texto: frases, titulares, tuits, comentarios y reseñas.
- Integración con el ecosistema transformers y con Hugging Face Inference Endpoints (el modelo está marcado como endpoints_compatible).
- No dispone de generación de texto, ni de tool calling o function calling, ni de capacidades de agente, ni de razonamiento multi-paso.
- No dispone de capacidades de visión, audio, thinking mode ni multimodalidad.
- No se declara soporte multilingüe: únicamente inglés.

## Casos de uso

- Monitorización de redes sociales y escucha activa de marca: clasificar menciones y comentarios en tiempo real para detectar picos de anger o fear asociados a un lanzamiento, gracias a que el modelo es lo bastante ligero (151 M de parámetros) para procesar grandes volúmenes con latencia baja.
- Análisis de encuestas NPS y voz del cliente: convertir respuestas abiertas en distribuciones emocionales agregadas, con la ventaja de que la etiqueta neutral dispone de 3.925 ejemplos de soporte en el test set y el modelo la distingue razonablemente bien (recall 0,744).
- Triaje y enrutado de tickets de soporte: asignar prioridad a conversaciones con alta probabilidad de anger o sadness y derivarlas a agentes especializados antes de que escalen.
- Moderación de contenido y detección de hostilidad: usar la clase anger como señal auxiliar en sistemas de moderación, combinada con clasificadores de toxicidad, dado que su F1 (0,856) es de los más altos del modelo.
- Investigación psicológica y conductual a gran escala: etiquetar corpus de decenas de miles de frases para estudios de prevalencia emocional, apoyándose en el MCC macro de 0,784 reportado sobre 58.625 ejemplos.
- Análisis de reseñas de producto en comercio electrónico: separar reseñas de satisfacción (joy, love) de reseñas de frustración (anger, sadness) para alimentar dashboards de calidad por categoría.
- Etiquetado automático de datos para entrenar modelos posteriores: usar las predicciones como supervisión débil y filtrar por umbral de confianza para reducir el coste de anotación humana.
- Detección temprana de insatisfacción en atención al cliente: monitorizar la evolución emocional dentro de una conversación y alertar cuando la clase anger supera un umbral definido por el negocio.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el test set conjunto de Super Emotion (58.625 ejemplos). La columna Accuracy de la tabla original parece corresponder a una métrica de acierto por clase; se reproduce tal cual la publica la model card.

| Clase / agregado | Accuracy | Precision | Recall | F1 | MCC | Support |
|---|---|---|---|---|---|---|
| macro avg | 0,957 | 0,790 | 0,832 | 0,809 | 0,784 | 58.625 |
| NEUTRAL | 0,948 | 0,585 | 0,744 | 0,655 | 0,632 | 3.925 |
| SURPRISE | 0,972 | 0,682 | 0,720 | 0,700 | 0,686 | 2.660 |
| FEAR | 0,964 | 0,832 | 0,844 | 0,838 | 0,818 | 6.474 |
| SADNESS | 0,962 | 0,935 | 0,912 | 0,923 | 0,898 | 14.853 |
| JOY | 0,941 | 0,899 | 0,915 | 0,907 | 0,864 | 18.484 |
| ANGER | 0,957 | 0,853 | 0,859 | 0,856 | 0,831 | 8.705 |
| LOVE | 0,952 | 0,746 | 0,829 | 0,786 | 0,760 | 6.157 |

No se han publicado resultados en benchmarks externos (GLUE, SST, GoEmotions u otros) en la información disponible.

## Requisitos de hardware

- Peso de los pesos en memoria: aproximadamente 604 MB en fp32, 302 MB en fp16/bf16, 151 MB en int8 y 76 MB en int4 (cálculo aritmético a partir de los 151.037.959 parámetros).
- VRAM estimada para inferencia: por debajo de 1 GB en fp16 y por debajo de 2 GB incluyendo el overhead del runtime de PyTorch y el código personalizado, incluso con lotes moderados.
- Cabe en cualquier GPU de consumo: GTX 1650 (4 GB), RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para lotes pequeños con latencia aceptable.
- GPU recomendadas para producción con alto throughput: NVIDIA L4, T4, A10G, A100 o H100 para inferencia por lotes a gran escala; en el extremo de consumo, cualquier GPU con 4 GB o más es suficiente.
- Opciones de despliegue: pipeline de transformers con trust_remote_code=True (método documentado por el autor), Hugging Face Inference Endpoints (tag endpoints_compatible), exportación a ONNX Runtime previa conversión manual y servicio propio con FastAPI o similar. vLLM, TGI, llama.cpp y Ollama no están pensados para clasificadores encoder de este tipo y además chocarían con la dependencia de código personalizado.
- Latencia y throughput: no disponibles. El único dato de cómputo publicado es el entrenamiento de 2 épocas en aproximadamente 9 horas sobre una NVIDIA DGX Spark (GB10).
- Se requiere transformers>=5.2 según el ejemplo de la model card, un requisito de versión relativamente alto que conviene verificar en el entorno de despliegue.

## Comparativa con modelos similares

La información proporcionada solo permite verificar los datos de la columna correspondiente a este modelo. El resto de filas se basan en conocimiento general del ecosistema y se marcan explícitamente como no verificadas en la documentación consultada; no se incluyen cifras de rendimiento de terceros para no introducir datos no comprobados.

| Modelo | Parámetros | Contexto | Etiquetas | Licencia | Estado en la información disponible |
|---|---|---|---|---|---|
| cirimus/ultrabert-150M-emotions | 151 M | No disponible | 7 emociones | Apache 2.0 | Verificado |
| dmis-lab/UltraBERT-150M (base) | 151 M | No disponible | No es clasificador de emociones | No disponible | Modelo base citado por el autor |
| j-hartmann/emotion-english-distilroberta-base | ~82 M (no verificado) | No verificado | 6-7 emociones (no verificado) | No verificada | Alternativa habitual en la categoría; datos no confirmados aquí |
| bhadresh-savani/distilbert-base-uncased-emotion | ~67 M (no verificado) | No verificado | 6 emociones (no verificado) | No verificada | Alternativa habitual en la categoría; datos no confirmados aquí |

No se dispone de comparativas de rendimiento publicadas frente a estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgo de datos: el propio autor advierte que super-emotion se agrega a partir de múltiples fuentes y puede contener sesgos de anotación y de distribución de clases.
- Clases infrarrepresentadas: neutral y surprise obtienen las precisiones más bajas (0,585 y 0,682) y cuentan con el menor soporte (3.925 y 2.660 ejemplos), por lo que son las etiquetas menos fiables.
- Dependencia del contexto: el modelo clasifica frases individuales y rinde peor en contextos de varias frases. El autor reconoce dificultades con expresiones sutiles o referencias indirectas a emociones.
- Ambigüedad multiclase frente a multi-label: la model card declara ambos regímenes de forma contradictoria, lo que puede alterar la interpretación de las probabilidades de salida.
- Riesgo de alucinación: al ser un clasificador discriminativo no genera texto, pero sí puede asignar etiquetas emocionales a contenido neutro con confianza moderada o alta, especialmente en textos sarcásticos o irónicos.
- Idioma: únicamente inglés. No debe esperarse un comportamiento fiable en castellano ni en otros idiomas.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con entradas largas; el propio diseño apunta a unidades cortas de texto.
- Código personalizado: el uso requiere trust_remote_code=True, lo que implica ejecutar código del repositorio del autor en el entorno local. Es un riesgo de seguridad que debe evaluarse antes de desplegarlo en producción.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin validación independiente ni resultados en benchmarks externos.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. No se declaran restricciones adicionales, pero la licencia del modelo base UltraBERT-150M debería verificarse por separado.
- Uso responsable: no debe emplearse como herramienta de diagnóstico psicológico ni para inferir estados mentales clínicos a partir de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cirimus/ultrabert-150M-emotions
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-150M
- Dataset de ajuste: https://huggingface.co/datasets/cirimus/super-emotion
- Colección Frontier BERT Workhorses: https://huggingface.co/collections/cirimus/frontier-bert-workhorses-6797a135348cffd576b30a58
- Demo (Space de detección de emociones): https://huggingface.co/spaces/cirimus/emotion-detection
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Calculadora ML CO2 Impact: https://mlco2.github.io/impact
- Las búsquedas web realizadas no devolvieron enlaces relevantes sobre este modelo; los resultados obtenidos trataban sobre generadores de nombres de habilidades y poderes oculares y no guardan relación con la ficha.
