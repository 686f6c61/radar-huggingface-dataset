# Kenpache/finbert-multilingual-v2-large

## Resumen

Kenpache/finbert-multilingual-v2-large es un modelo de clasificación de sentimiento financiero entrenado sobre el backbone XLM-RoBERTa large. Desarrollado por Kenpache, resuelve el problema de analizar el tono (negativo, neutral o positivo) de noticias y frases del ámbito financiero en siete idiomas distintos con un único checkpoint, sin necesidad de traducción previa ni de identificación del idioma de entrada. Su relevancia actual radica en que la mayoría de los modelos de sentimiento financiero existentes son exclusivamente en inglés o degradan su rendimiento en escrituras no latinas; este modelo mantiene una precisión superior al 84 % en todos los idiomas soportados, incluyendo chino, japonés y árabe.

Con 559.893.507 parámetros (aproximadamente 560 millones) y un peso de 2,1 GB en fp32, se posiciona como una opción de alta capacidad para tareas de análisis de mercado multilingüe. La longitud de contexto no se especifica en la documentación, aunque el protocolo de evaluación emplea secuencias de hasta 192 tokens. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors, lo que facilita su integración en entornos de producción con transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa large (transformer encoder) |
| Parametros totales | 559.893.507 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada (el modelo base soporta 512 tokens; la evaluacion usa max_length=192) |
| Tipos de cuantizacion | no documentados (solo fp32) |
| Idiomas soportados | en, zh, ja, es, de, fr, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de FacebookAI/xlm-roberta-large, un transformer encoder con atención bidireccional y tokenizer multilingüe basado en SentencePiece. Sobre esta base se realiza un fine-tuning para clasificación de secuencias con tres etiquetas (negative, neutral, positive). No se han publicado detalles sobre el dataset de entrenamiento (número de tokens, composición, técnica de ajuste como RLHF o DPO); únicamente se documenta el conjunto de evaluación público Kenpache/financial-sentiment-eval-7lang, con 4.993 frases de noticias financieras repartidas en los siete idiomas. La innovación principal es el soporte multilingüe real: el modelo mantiene un rendimiento consistente en escrituras latinas, CJK y árabe sin necesidad de pasos adicionales de traducción o detección de idioma.

## Capacidades

- Clasificación de sentimiento financiero en tres clases (negativo, neutral, positivo) a partir de titulares o frases cortas.
- Soporte multilingüe en siete idiomas: inglés, chino, japonés, español, alemán, francés y árabe.
- Funciona en pipelines mixtos donde el texto de entrada puede estar en cualquier idioma soportado, sin requerir identificación previa.
- No incluye generación de texto, tool calling, capacidades de agente, visión ni modo de razonamiento explícito; es exclusivamente un clasificador de secuencias.

## Casos de uso

- Análisis de sentimiento de noticias financieras en tiempo real: el modelo puede procesar titulares de agencias de noticias en varios idiomas y alimentar paneles de monitorización de mercado, gracias a su precisión por encima del 84 % en todos los idiomas soportados.
- Monitorización de redes sociales y foros de inversión: permite clasificar comentarios y publicaciones sobre acciones o criptomonedas en inglés, español, chino, etc., para detectar cambios de humor del mercado.
- Sistemas de alerta temprana para traders: integrado en un pipeline de scraping, puede emitir alertas cuando se detectan sentimientos negativos o positivos extremos en comunicados de prensa de empresas.
- Análisis de informes de ganancias y comunicados oficiales: clasifica automáticamente las declaraciones de resultados trimestrales en varios idiomas, reduciendo el trabajo manual de analistas financieros.
- Clasificación de comunicados de prensa corporativos: ayuda a priorizar noticias relevantes para carteras de inversión, distinguiendo entre información neutral y eventos con impacto direccional.
- Integración en pipelines de análisis de mercado multilingüe: al ser un único modelo que cubre siete idiomas, simplifica la arquitectura de sistemas que antes requerían múltiples clasificadores por idioma o servicios de traducción.

## Benchmarks y rendimiento

Los resultados se miden sobre el conjunto de test público Kenpache/financial-sentiment-eval-7lang (4.993 frases), con protocolo max_length=192, fp32 y sin normalización del texto.

| Metrica | Valor |
|---|---|
| Accuracy global | 0.8892 |
| F1 (weighted) | 0.8890 |

| Idioma | Items | Accuracy |
|---|---:|---:|
| Español (es) | 905 | 0.9193 |
| Alemán (de) | 650 | 0.9062 |
| Chino (zh) | 1.023 | 0.8974 |
| Árabe (ar) | 73 | 0.8904 |
| Japonés (ja) | 1.063 | 0.8852 |
| Inglés (en) | 780 | 0.8615 |
| Francés (fr) | 499 | 0.8477 |

| Clase | Precision | Recall | F1 | Support |
|---|---:|---:|---:|---:|
| negative | 0.8820 | 0.9135 | 0.8975 | 1.260 |
| neutral | 0.9049 | 0.8508 | 0.8770 | 2.158 |
| positive | 0.8758 | 0.9225 | 0.8986 | 1.575 |

Comparación en el subconjunto en inglés (780 items) con ProsusAI/finbert, bajo el mismo protocolo:

| Modelo | Accuracy | F1 (weighted) |
|---|---:|---:|
| Kenpache/finbert-multilingual-v2-large | 0.8615 | 0.8616 |
| ProsusAI/finbert | 0.7218 | 0.7224 |

Nota: la comparación se limita al inglés porque ProsusAI/finbert es monolingüe. El autor advierte que parte de la diferencia puede deberse a convenciones de etiquetado distintas, no solo a capacidad.

## Requisitos de hardware

- Los pesos en fp32 ocupan aproximadamente 2,1 GB, por lo que la inferencia con batch pequeño puede ejecutarse en GPUs consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3050 o superior).
- Para procesar lotes grandes (por ejemplo, 64 secuencias de 192 tokens), se recomienda una GPU con 8-12 GB de VRAM, como RTX 3060, RTX 4070 o superior.
- El modelo también puede ejecutarse en CPU, aunque con mayor latencia; es adecuado para procesamiento por lotes no crítico en tiempo real.
- Opciones de despliegue: compatible con la librería transformers (pipeline de text-classification), y según los tags del repositorio, también con text-embeddings-inference y endpoints compatibles. No se documenta soporte explícito para vLLM, llama.cpp u Ollama, aunque al ser un modelo de clasificación estándar podría adaptarse con ONNX o TensorRT.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Accuracy (evaluacion 7lang) | Licencia |
|---|---|---|---|---|
| Kenpache/finbert-multilingual-v2-large | 560M | 7 | 0.8892 | Apache 2.0 |
| Kenpache/finbert-multilingual-v2 | 307M | 7 | 0.8720 | Apache 2.0 |
| ProsusAI/finbert | 110M | solo ingles | 0.7218 (subconjunto en ingles) | Apache 2.0 |

No se dispone de comparaciones con otros modelos multilingües de sentimiento financiero en la información proporcionada.

## Limitaciones y advertencias

- El rendimiento en árabe se basa en solo 73 items de evaluación, por lo que la cifra (0.8904) debe considerarse indicativa, no concluyente.
- La longitud de contexto no está documentada; el protocolo de evaluación usa 192 tokens, por lo que textos financieros largos (informes completos) requerirán truncamiento o segmentación.
- No se han publicado detalles sobre el dataset de entrenamiento, lo que impide evaluar posibles sesgos de dominio o cobertura temporal.
- Al ser un clasificador, no genera explicaciones ni texto; solo asigna una etiqueta con una puntuación de confianza.
- La comparación con ProsusAI/finbert se limita al inglés y puede estar influida por diferencias en las convenciones de anotación, como advierte el propio autor.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el usuario debe verificar la procedencia de los datos de entrenamiento si requiere garantías adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kenpache/finbert-multilingual-v2-large
- Dataset de evaluacion: https://huggingface.co/datasets/Kenpache/financial-sentiment-eval-7lang
- Modelo hermano (version pequena): https://huggingface.co/Kenpache/finbert-multilingual-v2
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
