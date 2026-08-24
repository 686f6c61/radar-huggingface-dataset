# akaruineko/qltan-1.5

## Resumen

QLTAN-1.5 (QualiText Analysis Network) es un modelo de clasificación de texto de cinco clases desarrollado por akaruineko (Георгий Куликов) y publicado en Hugging Face con licencia MIT. Está diseñado para determinar el origen y la calidad de un texto, distinguiendo entre contenido humano, generado por máquina, corrupto, de baja calidad y de marketing. Se basa en el modelo encoder FacebookAI/xlm-roberta-base y se ha afinado sobre el dataset QualiText, que contiene 492.275 ejemplos balanceados.

El modelo responde a la necesidad creciente de identificar texto sintético y de evaluar la calidad de los datos en pipelines de IA, especialmente en tareas de limpieza de datasets y moderación de contenido. Con 278 millones de parámetros y una longitud de contexto de 512 tokens (heredada de XLM-RoBERTa), QLTAN-1.5 ofrece una solución ligera y de código abierto para análisis de procedencia y calidad textual en inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) |
| Parametros totales | 278.047.493 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 512 tokens (límite del modelo base; el entrenamiento usa ventanas de 256 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

QLTAN-1.5 es un modelo encoder transformer basado en XLM-RoBERTa base. La arquitectura es un encoder de 12 capas con atención multi-cabeza, que produce una representación contextual de cada token y una representación de la secuencia completa usada para la clasificación. El modelo se ajustó mediante fine-tuning supervisado sobre el dataset QualiText, que incluye 492.275 ejemplos balanceados (98.455 por clase) procedentes de fuentes como Wikipedia, 4chan, corpus de correos spam/ham/phishing, FineWeb-Marketing y textos generados por los modelos Qwen3.8-Max, GLM-5.2 y Kimi-K3. El dataset se dividió en 90% entrenamiento y 10% evaluación.

El preprocesamiento divide el texto en ventanas de hasta 12 oraciones con un máximo de 3.000 caracteres por ventana; si no hay límites de oración claros, se usa un fallback de 256 palabras. La longitud máxima de token por ventana es 256. No se mencionan técnicas de RLHF o DPO; el entrenamiento es puramente supervisado.

## Capacidades

- Clasificación de texto en cinco clases: `corrupted`, `human`, `low_quality`, `machine_generated` y `marketing`.
- Detección de texto generado por máquina: identifica contenido producido por modelos LLM como Qwen3.8-Max, GLM-5.2 y Kimi-K3.
- Detección de texto corrupto: reconoce ediciones deliberadas como borrados de palabras, intercambios, duplicaciones o errores tipográficos.
- Detección de baja calidad: identifica spam, correos no deseados y texto con puntuación eliminada o palabras desordenadas.
- Detección de contenido de marketing: aísla contenido promocional procedente de FineWeb-Marketing.
- Clasificación de datos para limpieza de datasets: puede filtrar ejemplos problemáticos en conjuntos de entrenamiento.
- Solo en inglés: el modelo está entrenado exclusivamente con texto en inglés.
- No soporta tool calling, agentes ni capacidades multimodales; es un clasificador de texto puro.

## Casos de uso

- **Limpieza de datasets de entrenamiento**: QLTAN-1.5 puede identificar automáticamente textos corruptos, de baja calidad o generados por máquina en grandes corpus, ayudando a depurar datos antes de entrenar otros modelos. Su ventana de 256 tokens permite procesar documentos de forma eficiente.
- **Moderación de contenido en foros y redes sociales**: puede clasificar mensajes de usuarios como spam, marketing o baja calidad, y permitir a los moderadores filtrar contenido no deseado de forma automática.
- **Detección de contenido sintético en publicaciones**: útil para plataformas que necesitan etiquetar o revisar textos generados por IA, aunque con la advertencia de que no sirve para verificación de autoría.
- **Análisis de calidad de textos académicos**: investigadores pueden usarlo para separar documentos científicos de texto generado por IA o de baja calidad en revisiones bibliográficas.
- **Filtrado de contenido de marketing en datos web**: en la construcción de datasets web, permite eliminar textos publicitarios o de marketing que distorsionan el análisis de contenido.
- **Investigación sobre detección de texto sintético**: el modelo sirve como punto de partida para estudiar características de textos generados por LLM y comparar con otros detectores.

## Benchmarks y rendimiento

El autor declara los siguientes resultados oficiales sobre el conjunto de test de QualiText (no verificados externamente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Text classification | QualiText (test) | Accuracy | 0.9804 |
| Text classification | QualiText (test) | F1 Score | 0.9805 |

No se han publicado comparaciones con otros modelos de detección de texto sintético o calidad de datos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 278M de parámetros. En fp32, el peso ocupa ~1,1 GB; en fp16, ~0,55 GB. La memoria adicional para activaciones es mínima para secuencias de 256 tokens.
- **GPU recomendada**: cualquier GPU con al menos 1 GB de VRAM es suficiente. Una RTX 3060 o superior ejecuta el modelo sin problemas; también puede funcionar en GPUs integradas.
- **CPU**: el modelo puede inferirse en CPU con ~1,5-2 GB de RAM, con latencia de unos pocos milisegundos por secuencia.
- **Opciones de despliegue**: compatible con la librería `transformers` de Hugging Face, con soporte para `text-embeddings-inference` (indicado en los tags). También puede exportarse a ONNX para servidores con TensorRT o a GGUF para usar con llama.cpp, aunque no se proporcionan cuantizaciones predefinidas.
- **Latencia**: no se proporcionan datos específicos, pero para un modelo de 278M de parámetros y secuencias de 256 tokens, la latencia en GPU moderna es de pocos milisegundos.

## Comparativa con modelos similares

No se dispone de comparaciones oficiales con otras alternativas en la información proporcionada. El modelo base XLM-RoBERTa puede servir como referencia de rendimiento en tareas de clasificación, pero no hay datos comparativos publicados. Se recomienda evaluar QLTAN-1.5 frente a otros detectores de texto sintético como GPT-2 Output Detector o modelos de detección de IA de OpenAI, pero no hay datos disponibles en la documentación.

## Limitaciones y advertencias

- **No apto para verificación de autoría**: no puede probar de forma definitiva si una persona escribió un texto o usó IA.
- **Rendimiento dependiente del dominio**: la precisión puede variar en dominios no representados en el entrenamiento (Wikipedia, 4chan, spam, marketing, etc.).
- **Solo inglés**: no funciona en otros idiomas.
- **Sesgo de estilo de los modelos docentes**: la clase `machine_generated` puede reflejar los estilos específicos de Qwen3.8-Max, GLM-5.2 y Kimi-K3, y no generalizar a otros generadores.
- **Vulnerabilidad adversarial**: puede ser engañado por ataques sofisticados o métodos novedosos de generación de texto.
- **Uso comercial**: la licencia MIT permite uso comercial sin restricciones, pero hay que verificar la procedencia de los datos de entrenamiento (no se especifican licencias de las fuentes originales).
- **Contexto limitado**: la ventana de 512 tokens limita el análisis a fragmentos cortos; para textos largos hay que dividirlos en ventanas, lo que puede perder contexto global.

## Enlaces

- Modelo en Hugging Face: [akaruineko/qltan-1.5](https://huggingface.co/akaruineko/qltan-1.5)
- Dataset QualiText: https://huggingface.co/datasets/akaruineko/qualitext
- Modelo base: [FacebookAI/xlm-roberta-base](https://huggingface.co/FacebookAI/xlm-roberta-base)
- Perfil del autor: https://huggingface.co/akaruineko
