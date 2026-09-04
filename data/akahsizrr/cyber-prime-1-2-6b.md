# Akahsizrr/Cyber-Prime-1-2.6B

## Resumen

Cyber-Prime 1 es un modelo de lenguaje pequeño de 2,6 mil millones de parámetros desarrollado por Akahsizrr (Vasko Djack) como ajuste fino de LiquidAI/LFM2-2.6B. Está especializado en tareas de ciberseguridad: extracción de entidades de amenazas, detección de phishing en correos electrónicos, detección de ataques HTTP, resumen de inteligencia de amenazas y respuesta a preguntas de conocimiento de seguridad.

Según las métricas declaradas por su autor, el modelo supera a Llama-2-7B en las siete tareas del benchmark CyberBench y a GPT-3.5-Turbo en varias de ellas, a pesar de tener un tamaño mucho menor. Esto lo convierte en un ejemplo relevante de especialización mediante ajuste fino para dominios concretos, con un coste computacional reducido en comparación con modelos grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (fine-tune de LiquidAI/LFM2-2.6B) |
| Parametros totales | 2.697.198.592 (2.6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Cyber-Prime 1 es un ajuste fino de LiquidAI/LFM2-2.6B. La información pública no detalla la arquitectura interna del modelo base, aunque se identifica como un modelo de lenguaje pequeño de tipo denso. El proceso de ajuste fino emplea un conjunto de datos curado con dos modos de uso: un modo directo, para clasificaciones simples y resumos, y un modo de pensamiento, basado en cadenas de razonamiento, para tareas que requieren análisis más profundo.

El conjunto de datos de entrenamiento, declarado en la model card, está compuesto por datos de reparación de NER (más de 6.000 filas para la extracción de entidades de ciberseguridad en formato JSON), trazas de razonamiento HTTP (5.000 filas con cadenas de pensamiento para detección de ataques XSS, SQLi, path traversal e inyección de comandos), clasificación de correos electrónicos (5.000 filas para phishing frente a seguro), resumen de CyNews (2.000 filas para titulares de inteligencia de amenazas), datos fuente de GHSA, KEV y ATT&CK (2.000 filas) y preguntas de opción múltiple sobre seguridad. No se indica la cantidad total de tokens de entrenamiento ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y completado para tareas de ciberseguridad.
- Clasificación de correos electrónicos como phishing o seguros, con F1 de 0,728 en el dataset Email de CyberBench.
- Detección de ataques HTTP mediante razonamiento explícito: XSS, SQLi, path traversal e inyección de comandos.
- Extracción de entidades nombradas de ciberseguridad (NER) en formato JSON, con F1 de 0,382 en CyNER y 0,413 en APTNER.
- Resumen de noticias de ciberamenazas, con ROUGE-1 de 0,354 en CyNews.
- Respuesta a preguntas de opción múltiple sobre conocimiento de seguridad, con exactitud de 0,580 en SecMMLU y 0,570 en CyQuiz.
- Soporte de un modo de pensamiento para tareas que requieren razonamiento, además de un modo directo para clasificaciones sencillas.
- Idioma: inglés. No se ha documentado soporte de tool calling, agentes, visión o audio.

## Casos de uso

- Análisis de inteligencia de amenazas: extraer entidades como APT, CVE, malware e indicadores de compromiso de informes técnicos o boletines de seguridad, usando el formato JSON que el modelo devuelve en modo NER.
- Triaje de correos en un SOC: clasificar automáticamente mensajes entrantes como phishing o legítimos, reduciendo el trabajo manual de analistas.
- Detección de ataques en logs HTTP: aplicar el modo de pensamiento para identificar inyecciones SQL, XSS o traversal en peticiones web, con una salida razonada que facilita la revisión posterior.
- Resumen de boletines de seguridad: condensar noticias y avisos de ciberamenazas en titulares breves, aprovechando la tarea CyNews.
- Formación de analistas de seguridad: generar preguntas de opción múltiple a partir de la fuente de datos de conocimiento de seguridad para evaluar al personal mediante quizzes internos.
- Enriquecimiento de datos en pipelines de vulnerabilidades: procesar texto de CVEs y fuentes KEV y ATT&CK para extraer entidades y crear grafos de conocimiento.
- Triaje de alertas de detección: combinar la detección de HTTP con la clasificación de correos para priorizar alertas en sistemas de gestión de eventos de seguridad.

## Benchmarks y rendimiento

Los resultados siguientes son los declarados por el autor en la model card y no están verificados de forma independiente. Se evalúan sobre el benchmark CyberBench, propuesto por Liu et al., AAAI-24 AICS Workshop, y se comparan con GPT-4, GPT-3.5-Turbo, Mistral-7B-Instruct y Llama-2-7B.

| Dataset | Métrica | GPT-4 | GPT-3.5-Turbo | Mistral-7B-Instruct | Llama-2-7B | Cyber-Prime 1 (2.6B) |
|---|---|---|---|---|---|---|
| CyNER | F1 | 0.554 | 0.334 | 0.323 | 0.263 | 0.382 |
| APTNER | F1 | 0.500 | 0.409 | 0.262 | 0.280 | 0.413 |
| CyNews | ROUGE-1 | 0.275 | 0.271 | 0.217 | 0.003 | 0.354 |
| SecMMLU | Accuracy | 0.830 | 0.780 | 0.720 | 0.630 | 0.580 |
| CyQuiz | Accuracy | 0.810 | 0.830 | 0.690 | 0.620 | 0.570 |
| Email | F1 | 0.939 | 0.789 | 0.889 | 0.942 | 0.728 |
| HTTP | F1 | 0.841 | 0.831 | 0.472 | 0.428 | 0.483 |
| Media | — | 0.721 | 0.609 | 0.511 | 0.451 | 0.501 |

Según el autor, el modelo supera a Llama-2-7B en las siete tareas, a Mistral-7B-Instruct en cuatro de las siete, a GPT-3.5-Turbo en tres y a GPT-4 en CyNews.

## Requisitos de hardware

- VRAM estimada para inferencia: el peso en FP16 ocupa aproximadamente 5,4 GB, por lo que se necesita una GPU con al menos 8 GB de VRAM para ejecutarlo con transformers sin cuantización.
- GPU recomendadas: NVIDIA RTX 3060 o RTX 4060 para entornos de consumo; para producción, GPU como A100 o H100 son adecuadas.
- Sin cuantizaciones publicadas, el modelo solo está disponible en formato safetensors de precisión completa.
- Opciones de despliegue: compatible con el ecosistema de transformers, y puede desplegarse en frameworks como vLLM, llama.cpp, Ollama o TGI, aunque la model card no incluye datos de rendimiento específicos para estos entornos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La siguiente tabla compara las características técnicas y el rendimiento medio en CyberBench de Cyber-Prime 1 con las alternativas evaluadas por el autor en el benchmark.

| Modelo | Parametros | Contexto | Rendimiento medio en CyberBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cyber-Prime 1 (2.6B) | 2.7B | No disponible | 0.501 | Apache 2.0 | HuggingFace |
| Llama-2-7B | 7B | No disponible | 0.451 | No disponible | No disponible |
| Mistral-7B-Instruct | 7B | No disponible | 0.511 | No disponible | No disponible |
| GPT-3.5-Turbo | No disponible | No disponible | 0.609 | No disponible | No disponible |

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no es una herramienta de seguridad para producción, sino un artefacto de investigación para evaluar benchmarks.
- Presenta un rendimiento limitado en tareas de conocimiento amplio de seguridad (SecMMLU y CyQuiz), probablemente por su reducido número de parámetros.
- La clasificación de correos tiene un F1 de 0,728, inferior a GPT-3.5-Turbo, y el autor apunta una posible interferencia del entrenamiento en datos HTTP.
- La detección de ataques HTTP puede fallar en patrones de inyección sutiles, a pesar de que el razonamiento mejora la detección de ataques obvios.
- Solo está disponible en inglés.
- Riesgo de alucinación inherente a modelos de este tamaño, especialmente cuando se le solicita información no presente en el ajuste fino.
- No se han publicado datos sobre la longitud de contexto ni sobre cuantizaciones, lo que limita su integración en entornos con restricciones de memoria.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/Akahsizrr/Cyber-Prime-1-2.6B
- Perfil del autor: https://huggingface.co/Akahsizrr
- Repositorio de CyberBench (referenciado en la model card): https://github.com/jpmorganchase/CyberBench
