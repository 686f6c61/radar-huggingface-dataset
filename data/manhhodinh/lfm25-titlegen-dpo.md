# ManhHoDinh/lfm25-titlegen-dpo

## Resumen

LFM2.5 TitleGen DPO es un modelo de generación de títulos desarrollado por ManhHoDinh como etapa final de optimización de preferencias directas (DPO) sobre el modelo base LiquidAI/LFM2.5-230M. El modelo está diseñado para generar títulos automáticos en inglés y vietnamita, y forma parte de un experimento que incluye etapas previas de curriculum learning y SFT v2. Con 229,7 millones de parámetros, es un modelo compacto orientado a tareas específicas de titulación, no a generación de texto general.

La relevancia de este modelo radica en su enfoque metodológico: aplica DPO para alinear las salidas con preferencias humanas en la generación de títulos, un área donde la calidad subjetiva es clave. Aunque los resultados publicados son preliminares y solo cubren dos idiomas, el modelo demuestra una tasa de éxito del 97,7% en un conjunto de evaluación automatizado de 300 ejemplos. Su tamaño reducido lo hace adecuado para despliegue en entornos con recursos limitados.

El modelo se distribuye bajo la licencia lfm1.0 de Liquid AI, con pesos en formato safetensors y compatibilidad con la librería transformers. No se especifican la longitud de contexto ni los tipos de cuantización disponibles en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en LiquidAI/LFM2.5-230M (arquitectura no especificada) |
| Parametros totales | 229.693.184 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, vi |
| Licencia | lfm1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo base LiquidAI/LFM2.5-230M, que pertenece a la familia LFM2.5 de Liquid AI. La arquitectura exacta del modelo base no se detalla en la información proporcionada, pero se sabe que es un modelo de 230M de parámetros orientado a generación de texto. El proceso de entrenamiento sigue un pipeline de tres etapas: curriculum learning, SFT v2 y finalmente DPO (Direct Preference Optimization), siendo esta última la que produce el modelo final. No se especifican los datos de entrenamiento, el número de tokens ni la composición del dataset.

La innovación principal es el uso de DPO para refinar las salidas del modelo SFT, optimizando directamente las preferencias humanas en la generación de títulos. Esto permite al modelo priorizar títulos concisos, en el idioma correcto y sin copiar el contenido original, según las rúbricas automatizadas utilizadas en la evaluación.

## Capacidades

- Generación de títulos automáticos en inglés y vietnamita, con soporte para textos conversacionales según las etiquetas del modelo.
- Generación de texto en formato de una sola línea, sin puntuación final (según las rúbricas de evaluación).
- Capacidad multilingüe limitada a dos idiomas: inglés y vietnamita.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni visión.
- El modelo está optimizado para producir títulos cortos (máximo 32 tokens en la evaluación) y coherentes con el contenido de entrada.

## Casos de uso

- Generación de titulares para noticias digitales: el modelo puede producir titulares en inglés o vietnamita a partir de un resumen o cuerpo de la noticia, reduciendo el tiempo de redacción en redacciones con equipos multilingües.
- Titulación de artículos de blog para SEO: dado un borrador o resumen, el modelo genera opciones de título optimizadas para ser concisas y atractivas, ayudando a mejorar el clic-through rate sin intervención manual.
- Generación de títulos para vídeos en plataformas como YouTube: integrable en pipelines de publicación automática para crear títulos en los dos idiomas soportados, especialmente útil para creadores de contenido bilingüe.
- Organización de documentos en sistemas de gestión de contenido (CMS): el modelo puede asignar títulos automáticos a documentos internos, facilitando la búsqueda y categorización en repositorios corporativos.
- Asistencia en redacción académica: genera títulos provisionales para papers o informes técnicos a partir de un resumen, permitiendo a los autores explorar diferentes enfoques antes de elegir el definitivo.
- Localización de contenido: al soportar inglés y vietnamita, puede utilizarse para titular contenido traducido entre estos dos idiomas, manteniendo coherencia en campañas de marketing internacional.

## Benchmarks y rendimiento

La model card del autor incluye resultados preliminares de una evaluación automatizada sobre 300 ejemplos (198 en inglés y 102 en vietnamita), con decodificación determinista (`do_sample: false`, `max_new_tokens: 32`). Los resultados comparan la etapa DPO con las etapas SFT v2 y Curriculum:

| Modelo | Aciertos | Global | Inglés | Vietnamita | Evidencia |
| --- | ---: | ---: | ---: | ---: | --- |
| DPO | 293 / 300 | 97,7% | 99,5% | 94,1% | Automatizada preliminar EN/VI |
| SFT v2 | 291 / 300 | 97,0% | 99,5% | 92,2% | Automatizada preliminar EN/VI |
| Curriculum | 289 / 300 | 96,3% | 98,5% | 92,2% | Automatizada preliminar EN/VI |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 230M de parámetros, requiere aproximadamente 0,9 GB en fp16 y alrededor de 0,5 GB en cuantización de 8 bits. No se especifican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo tarjetas consumer como NVIDIA GTX 1650, RTX 3060 o superiores. También puede ejecutarse en CPU para inferencia de baja latencia.
- Opciones de despliegue: compatible con la librería transformers de HuggingFace, por lo que puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se menciona soporte nativo para Ollama.
- Latencia estimada: en GPU consumer, la generación de un título de 32 tokens debería completarse en menos de 100 ms con batch de 1. En CPU, puede ser de 1-2 segundos.

## Comparativa con modelos similares

El modelo se compara directamente con sus etapas previas de entrenamiento (SFT v2 y Curriculum) en la model card. No se proporcionan comparaciones con otros modelos de generación de títulos del mismo tamaño. Como referencia, el modelo base LFM2.5-230M es un modelo generalista de Liquid AI, mientras que este fine-tuning está especializado en titulación.

| Modelo | Parámetros | Contexto | Licencia | Especialización |
| --- | ---: | --- | --- | --- |
| ManhHoDinh/lfm25-titlegen-dpo | 229,7M | no disponible | lfm1.0 | Generación de títulos EN/VI |
| LiquidAI/LFM2.5-230M | 230M | no disponible | lfm1.0 | Generación de texto general |
| SFT v2 (misma familia) | 229,7M | no disponible | lfm1.0 | Generación de títulos EN/VI |

No se dispone de información sobre otros modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- Solo se ha evaluado en inglés y vietnamita; el resto de idiomas aparecen como "no evaluados" y no se garantiza su funcionamiento.
- La verificación de corrección idiomática se basa en una heurística automatizada, no en revisión humana nativa, por lo que puede haber errores no detectados.
- Los resultados de benchmark son preliminares y no establecen preparación para producción, mejora causal ni significancia estadística.
- No se incluye evidencia de preferencia ciega ni revisión por hablantes nativos, lo que limita la confianza en la calidad subjetiva de los títulos generados.
- La licencia lfm1.0 puede imponer restricciones de uso comercial; se recomienda revisar los términos completos en el enlace de la licencia.
- No se especifican la longitud de contexto ni los tipos de cuantización, lo que puede dificultar la planificación del despliegue en entornos productivos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ManhHoDinh/lfm25-titlegen-dpo
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2.5-230M/blob/main/LICENSE
