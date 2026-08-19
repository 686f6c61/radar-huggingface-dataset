# MORES-horizon/MORES_emotions9

## Resumen

MORES_emotions9 es un modelo de clasificación de emociones morales en texto político, desarrollado por el proyecto MORES (Moral Emotions in Politics), una iniciativa de investigación financiada por la Unión Europea (CORDIS project 101132601). El modelo se basa en un fine-tuning de XLM-RoBERTa-large y está diseñado para detectar emociones como ira, miedo, alegría, asco, tristeza y orgullo en comunicaciones políticas, con el objetivo de estudiar cómo estas emociones unen o dividen a la sociedad.

El modelo resuelve el problema de la identificación automática de emociones morales en textos multilingües, un área clave para la comunicación política, la ciencia social computacional y el análisis de opinión pública. Su relevancia actual radica en que proporciona una herramienta específica para investigar el impacto de las emociones en los discursos políticos y en la formación de identidades morales, algo que los clasificadores de sentimiento genéricos no cubren con precisión.

Con 559,9 millones de parámetros, MORES_emotions9 es un modelo de gran tamaño que aprovecha la arquitectura transformer encoder de XLM-RoBERTa-large. Soporta siete idiomas europeos (inglés, alemán, francés, polaco, eslovaco, checo y húngaro) y se distribuye bajo licencia CC-BY-4.0, aunque su acceso en HuggingFace está restringido (gated) y requiere aceptación de condiciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) |
| Parametros totales | 559.899.657 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de XLM-RoBERTa-large, 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, de, fr, pl, sk, cs, hu |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MORES_emotions9 es un fine-tuning del modelo XLM-RoBERTa-large, un transformer encoder multilingüe preentrenado con 550 millones de parámetros sobre 2,5 TB de datos de CommonCrawl en 100 idiomas. La capa de clasificación se añade sobre el token [CLS] para producir una distribución de probabilidad sobre las categorías de emoción moral (el nombre "emotions9" sugiere 9 clases, aunque no se especifica el número exacto en la documentación pública).

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados, ni sobre técnicas de alineación como RLHF o DPO. Dado que el proyecto MORES se centra en emociones morales en política, es plausible que el entrenamiento se haya realizado con textos políticos anotados manualmente, pero este dato no está confirmado en la información proporcionada.

## Capacidades

- Clasificación de emociones morales en texto: detecta categorías como ira, miedo, alegría, asco, tristeza y orgullo (según la descripción de MORES Pulse).
- Análisis a nivel de frase: el modelo opera sobre oraciones individuales, lo que permite identificar emociones en segmentos concretos del discurso.
- Soporte multilingüe: funciona en siete idiomas europeos, lo que facilita estudios comparativos entre países.
- Especialización en comunicación política: optimizado para textos de naturaleza política, incluyendo discursos, debates y publicaciones en redes sociales.
- Integración con MORES Pulse: el modelo es el motor de la aplicación MORES Pulse, que ofrece análisis de emociones a través de una API.

No se han documentado capacidades de tool calling, generación de texto, razonamiento multi-paso ni visión. Es un modelo exclusivamente de clasificación.

## Casos de uso

- Análisis de discursos políticos: los investigadores pueden procesar transcripciones de discursos parlamentarios o mítines para cuantificar la presencia de emociones morales y correlacionarlas con resultados electorales o de opinión pública.
- Monitorización de redes sociales: el modelo puede analizar publicaciones de X (Twitter), Facebook o foros políticos para detectar picos de ira o miedo en torno a eventos concretos, ayudando a entender dinámicas de polarización.
- Investigación en ciencia social computacional: permite a sociólogos y politólogos codificar grandes corpus de texto de forma automática, sustituyendo la codificación manual y aumentando la reproducibilidad.
- Comunicación política estratégica: los equipos de campaña pueden evaluar el tono emocional de sus propios mensajes y los de sus oponentes, ajustando la estrategia comunicativa en consecuencia.
- Análisis de medios de comunicación: los periodistas y analistas pueden medir el sesgo emocional de diferentes medios sobre temas políticos, comparando cómo cada uno enmarca la información.
- Detección de discurso polarizante: organizaciones civiles y reguladores pueden identificar textos que apelan a emociones morales divisivas, contribuyendo a la vigilancia de la calidad democrática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como precisión, recall o F1 sobre conjuntos de prueba estándar, ni comparaciones con otros modelos de análisis de emociones.

## Requisitos de hardware

- VRAM estimada para inferencia: con 559,9 millones de parámetros, el modelo en precisión fp16 ocupa aproximadamente 1,1 GB de pesos, pero las activaciones y el overhead de la atención requieren más memoria. Para una secuencia de 512 tokens, se estima un uso de VRAM de al menos 6-8 GB en fp16.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB) o superior, RTX 4090, A100 o H100 para procesamiento por lotes.
- Compatibilidad con GPU de consumo: sí, es posible ejecutar inferencia en una RTX 3060 o RTX 4070 con cuantización int8 o fp16, aunque no se han publicado archivos GGUF o cuantizados oficialmente.
- Opciones de despliegue: el modelo se puede servir con la librería transformers de HuggingFace, o mediante servidores de inferencia como vLLM o TGI. También es posible exportarlo a ONNX para optimización.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU A100, se espera una latencia de decenas de milisegundos por frase, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente MORES_emotions9 con otros modelos de análisis de emociones morales. Como referencia, se puede mencionar que el modelo base XLM-RoBERTa-large es ampliamente utilizado para tareas de clasificación multilingüe, pero no existe una comparación pública con modelos como `j-hartmann/emotion-english-roberta-large` o `bhadresh-savani/roberta-base-emotion` (ambos en inglés y sin enfoque político). La falta de benchmarks publicados impide una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en HuggingFace, lo que significa que los usuarios deben solicitar acceso y aceptar las condiciones del proyecto MORES antes de poder descargarlo.
- Cobertura idiomática limitada: solo siete idiomas europeos; no cubre español, italiano, portugués ni otros idiomas relevantes para la política europea.
- Longitud de contexto limitada: al heredar de XLM-RoBERTa-large, el contexto máximo es de 512 tokens, lo que impide analizar documentos completos de una sola pasada; es necesario segmentar el texto en frases o párrafos.
- Sesgos potenciales: al ser un fine-tuning de un modelo preentrenado con datos de CommonCrawl, puede heredar sesgos de género, etnia o ideología presentes en el corpus original. No se ha publicado una evaluación de sesgos específica.
- Riesgo de alucinación: no aplica, ya que es un modelo de clasificación y no genera texto libre.
- Restricciones de licencia: la licencia CC-BY-4.0 permite uso comercial con atribución, pero el acceso gated puede imponer condiciones adicionales no especificadas en la documentación pública.
- Falta de documentación técnica: no se han publicado detalles sobre el dataset de entrenamiento, el número de épocas, ni la metodología de anotación, lo que dificulta la reproducibilidad y la evaluación de la robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MORES-horizon/MORES_emotions9
- Página del proyecto MORES: https://mores-horizon.eu/
- Anuncio de MORES Pulse: https://mores-horizon.eu/news/introducing-mores-pulse-ai
- API MORES Pulse (Space): https://huggingface.co/spaces/MORES-horizon/mores-pulse-api
- Proyecto CORDIS (UE): https://cordis.europa.eu/project/id/101132601
