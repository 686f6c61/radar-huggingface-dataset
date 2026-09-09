# ertoluk/ai-metin-dedektor

## Resumen

El modelo `ertoluk/ai-metin-dedektor` es un clasificador binario de texto desarrollado por el usuario ertoluk para detectar si un texto ha sido generado por inteligencia artificial o escrito por un humano. Está basado en `xlm-roberta-base`, un encoder Transformer multilingüe, con una cabeza de clasificación de secuencias. El modelo cuenta con 278.045.186 parámetros y su repositorio ocupa 1,1 GB en formato safetensors. Soporta dos idiomas: turco e inglés.

El objetivo principal es ofrecer una herramienta de apoyo para identificar texto sintético en contextos donde el contenido automatizado o la desinformación suponen un problema. La model card incluye métricas de evaluación en un test set con AUC de 0,999 en inglés y 0,991 en turco, y propone un sistema de decisión de tres zonas para reducir falsos positivos. La licencia Apache 2.0 permite su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-base (encoder Transformer multilingüe) con cabeza de clasificación secuencial |
| Parametros totales | 278.045.186 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la arquitectura base soporta hasta 512 tokens; el autor recomienda max_length=256) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura parte de XLM-RoBERTa-base, un modelo Transformer encoder preentrenado en múltiples idiomas, al que se añade una capa de clasificación binaria. El entrenamiento es un fine-tuning supervisado para clasificación de texto; no se menciona ninguna fase de RLHF ni DPO. Los datos de entrenamiento no están detallados, aunque el autor indica que se basan principalmente en textos de noticias y enciclopedia, lo que explica la degradación del rendimiento en dominios muy distintos. El modelo calcula la probabilidad de que la clase sea 1 (AI) mediante softmax sobre los logits y utiliza umbrales de decisión calibrados en tres bandas.

## Capacidades

- Clasificación binaria de textos en turco e inglés, asignando la etiqueta 0 (escrito por humano) o 1 (generado por IA).
- Métricas reportadas por el autor en test set: AUC 0,999 en inglés y 0,991 en turco; F1 0,961 y 0,969 respectivamente.
- Decisión de tres bandas: puntuación inferior a 0,480 indica texto humano; entre 0,480 y 0,950 indica resultado incierto; superior a 0,950 indica texto generado por IA.
- Calibración orientada a mantener la tasa de falsas acusaciones por debajo del 2 % en el conjunto de validación.
- No soporta tool calling, funciones, agentes, visión ni audio; se limita exclusivamente a clasificación de texto.

## Casos de uso

- Moderación de contenido en plataformas digitales: permite marcar publicaciones o comentarios en turco e inglés como potencialmente generados por IA, enviando la zona de incertidumbre a revisión manual.
- Verificación de artículos periodísticos: una redacción puede escanear borradores de colaboradores externos para detectar posibles textos sintéticos y evitar publicar contenido generado por IA sin supervisión.
- Filtrado de respuestas automáticas en sistemas de soporte: ayuda a identificar mensajes generados por bots en canales de atención al cliente, lo que permite priorizar las respuestas que requieren intervención humana.
- Apoyo en entornos académicos: profesores e instituciones pueden usar el clasificador como una primera señal al evaluar posibles trabajos generados por IA, recordando que no constituye una prueba concluyente.
- Investigación sobre detección de IA: por su tamaño contenido y sus métricas publicadas, puede servir como modelo de referencia comparativa en estudios académicos sobre clasificación de texto sintético.
- Flujo de revisión por umbrales: al estar calibrado para decisiones de tres bandas, se puede integrar en herramientas que eviten el bloqueo automático de textos humanos legítimos, enviando únicamente la zona intermedia a revisores humanos.

## Benchmarks y rendimiento

Los siguientes datos proceden de la model card del autor, evaluados sobre un test set de tamaño reducido:

| Idioma | Muestras | AUC | F1 | Falsos positivos | Falsos negativos |
|---|---|---|---|---|---|
| Inglés (en) | 162 | 0,999 | 0,961 | 5,7 % | 1,3 % |
| Turco (tr) | 258 | 0,991 | 0,969 | 4,7 % | 1,6 % |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Los pesos en FP32 ocupan aproximadamente 1,1 GB, según el tamaño del repositorio.
- La inferencia puede ejecutarse en CPU; para GPU se recomienda un mínimo de 2 GB de VRAM si se usa precisión FP16.
- Es compatible con tarjetas de consumo como RTX 3060, GTX 1660 o similares.
- Despliegue mediante Hugging Face Transformers (`pipeline` de text-classification) o una API propia con FastAPI. No requiere la infraestructura típica de LLMs generativos; no es adecuado para soluciones tipo Ollama.
- Latencia y throughput no especificados por el autor.

## Comparativa con modelos similares

No disponible en la información proporcionada. No se incluyen resultados comparativos con otros modelos de detección de texto IA en la model card. Por su arquitectura y tamaño, es similar a otros fine-tunings de XLM-RoBERTa-base para clasificación binaria, pero no se dispone de datos contrastados.

## Limitaciones y advertencias

- No es fiable en textos de menos de 60 palabras.
- Puede no detectar textos de IA reescritos o parafraseados.
- El rendimiento disminuye notablemente en dominios como poesía, documentación técnica o registros de chat, ya que el entrenamiento se basa en textos de noticias y enciclopedia.
- No debe utilizarse como evidencia concluyente ni para acusar a alguien basándose únicamente en la puntuación.
- Solo soporta turco e inglés; otros idiomas no están contemplados.
- La licencia Apache 2.0 permite uso comercial, pero las limitaciones funcionales y la responsabilidad del despliegue recaen en el usuario.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/ertoluk/ai-metin-dedektor
- Hugging Face (comunidad): https://huggingface.co/
- OpenL (herramienta de detección de IA en turco, no vinculada directamente a este modelo): https://openl.io/tr/ai-detector

No se han encontrado papers, repositorios adicionales ni demos específicas en la información proporcionada.
