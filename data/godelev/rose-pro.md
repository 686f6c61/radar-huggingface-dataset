# GODELEV/Rose-Pro

## Resumen

Rose Pro es un modelo de lenguaje de 151,3 millones de parámetros desarrollado por GODELEV, la tercera iteración de la familia Rose X1. Se trata de un modelo decoder-only entrenado desde cero con aproximadamente 80.000 millones de tokens, que mantiene la arquitectura Rose X1 con capas de refresco (refresh gates) y reinyección de embeddings originales. Su contexto nativo es de 2048 tokens y está licenciado bajo Apache 2.0.

El modelo destaca por su filosofía de eficiencia arquitectónica: extraer más capacidad de menos parámetros mediante un diseño cuidadoso en lugar de escalar el número de parámetros. Aunque sus resultados en benchmarks son modestos (MMLU 26,13%, HellaSwag 38,24%), el autor documenta abiertamente las lecciones aprendidas durante el entrenamiento, lo que lo convierte en un caso interesante para investigación y experimentación.

Su relevancia actual radica en que demuestra cómo un modelo pequeño, entrenado desde cero, puede alcanzar un rendimiento razonable en tareas de razonamiento básico y sentido común, y sirve como banco de pruebas para arquitecturas alternativas al transformer convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rose X1 (decoder-only con refresh gates) |
| Parametros totales | 151.274.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Rose Pro mantiene la arquitectura Rose X1, un diseño decoder-only que incorpora dos innovaciones principales: los refresh gates (aplicados en las capas 9 y 18) y la reinyección de embeddings originales (original token embeddings reinjection). El modelo tiene 24 capas, una dimensión oculta de 640, 10 cabezas de atención y 10 cabezas KV, con normalización QK (QK norm) activada.

El entrenamiento se realizó desde cero (pretrained from scratch) sobre aproximadamente 79.967 millones de tokens, utilizando el optimizador muon_adamw. La perplejidad de validación reportada es de 5,08. El autor no detalla la composición del dataset de entrenamiento, pero indica que fue un proceso de 80.000 millones de tokens. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación supervisada.

## Capacidades

- Generacion de texto en ingles con coherencia básica.
- Razonamiento de sentido comun limitado, con resultados que oscilan entre el 30% y el 60% en benchmarks como PIQA, BoolQ o COPA.
- Comprension lectora basica, evidenciada en tareas como RACE o SWAG, aunque con puntuaciones bajas.
- Capacidad aritmetica muy limitada (38,20% en ArithMark 3), similar a modelos de menor tamano.
- No soporta tool calling, function calling, ni uso como agente autonomo.
- No tiene capacidades multimodales (ni vision, ni audio).
- Solo opera en ingles; no hay soporte multilingue.

## Casos de uso

- Educacion e investigacion: sirve como ejemplo didactico de una arquitectura alternativa al transformer estandar, permitiendo estudiar el impacto de refresh gates y la reinyeccion de embeddings en modelos pequenos.
- Experimentacion con fine-tuning: al ser un modelo compacto con licencia permisiva, es adecuado para probar tecnicas de ajuste fino en entornos con recursos limitados.
- Prototipado rapido: puede usarse para validar ideas de generacion de texto en aplicaciones donde no se requiere alta calidad, como chatbots de demostracion o generadores de texto simple.
- Generacion de texto para entornos con restricciones de hardware: su tamano permite ejecutarlo en CPU o GPUs de gama baja, siendo util para pruebas locales.
- Analisis comparativo de arquitecturas: permite contrastar el rendimiento de Rose X1 frente a otros modelos de tamano similar (GPT-2 small, Pythia-160M) en tareas de lenguaje.
- Generacion de contenido breve: puede producir parrafos cortos, resumenes simples o respuestas a preguntas factuales basicas, aunque con riesgo de errores.

## Benchmarks y rendimiento

Resultados de evaluacion 0-shot reportados por el autor, comparando las tres versiones de la familia Rose:

| Benchmark | Rose-Mini | Rose-Medium | Rose Pro |
|---|---:|---:|---:|
| HellaSwag | 28,95% | 35,29% | 38,24% |
| PIQA | 58,54% | 62,95% | 65,18% |
| ARC-Easy | 36,62% | 44,19% | 48,65% |
| ARC-Challenge | 24,32% | 26,19% | 26,96% |
| WinoGrande | 51,54% | 49,80% | 50,43% |
| BoolQ | 61,90% | 55,66% | 60,40% |
| OpenBookQA | 29,40% | 32,60% | 33,60% |
| CommonsenseQA | 19,74% | 21,21% | 19,49% |
| LAMBADA | 22,03% | 31,71% | 32,99% |
| BLiMP | 76,72% | 79,30% | 79,26% |
| MMLU | 23,24% | 23,98% | 26,13% |
| SciQ | 55,90% | 67,10% | 68,80% |
| COPA | 59,00% | 69,00% | 69,00% |
| RACE | 27,18% | 29,09% | 30,24% |
| SWAG | 44,32% | 52,79% | 55,39% |
| TruthfulQA MC2 | 44,28% | 41,83% | 39,82% |
| WikiText-2 Word PPL | 46,05 | 27,67 | 25,05 |
| WikiText-2 Byte PPL | 2,047 | 1,861 | 1,826 |

Ademas, en pruebas especificas:

| Modelo | ArithMark 3 | BananaMind Bench 1.1 |
|---|---:|---:|
| Rose-Mini | 36,50% | 1037,37 Elo |
| Rose-Medium | 38,30% | 1098,7 Elo |
| Rose Pro | 38,20% | 1105 Elo |

El modelo muestra mejoras claras frente a Rose-Medium en la mayoria de tareas, aunque en algunas como WinoGrande o CommonsenseQA el rendimiento es ligeramente inferior. La puntuacion en TruthfulQA MC2 desciende, lo que sugiere un posible aumento de alucinaciones.

## Requisitos de hardware

- VRAM estimada: en precision fp32, el modelo ocupa aproximadamente 605 MB; en fp16, unos 303 MB. Con cuantizacion de 8 bits, alrededor de 151 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores funcionan sin problemas. Tambien es viable en CPU para inferencia lenta.
- Se puede ejecutar en hardware de consumo general, incluyendo portatiles con 4 GB de RAM.
- Opciones de despliegue: compatible con frameworks como vLLM, llama.cpp, Ollama y TGI, aunque al no haber cuantizaciones oficiales publicadas, habria que generarlas manualmente.
- Latencia estimada: en una GPU moderna (RTX 3090), la generacion de 100 tokens deberia completarse en menos de 1 segundo. En CPU, la latencia seria significativamente mayor.

## Comparativa con modelos similares

No se han publicado comparativas oficiales con otros modelos de tamano similar. Como referencia, se pueden considerar alternativas de parametraje cercano:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Rose Pro | 151M | 2048 | Apache 2.0 | Arquitectura propia, entrenado desde cero |
| GPT-2 small | 124M | 1024 | MIT | Modelo clasico, ampliamente utilizado |
| Pythia-160M | 160M | 2048 | Apache 2.0 | Familia de modelos de EleutherAI, entrenado con 300B tokens |
| OPT-125M | 125M | 2048 | MIT | Modelo de Meta, entrenado con 300B tokens |

Rose Pro tiene una ventaja en contexto frente a GPT-2 small, pero su rendimiento en benchmarks estandar es inferior al de Pythia-160M o OPT-125M, segun datos publicos de estos ultimos. No obstante, la comparativa directa no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Contexto muy limitado (2048 tokens), insuficiente para tareas que requieran ventanas largas o documentos extensos.
- Rendimiento bajo en tareas de razonamiento complejo, matematicas y conocimiento general (MMLU 26,13%).
- Solo soporta ingles; no hay capacidades multilingue.
- Riesgo de alucinaciones relativamente alto, como sugiere la caida en TruthfulQA MC2 respecto a modelos anteriores.
- Sesgos potenciales derivados del dataset de entrenamiento, cuya composicion no se detalla.
- No apto para produccion en aplicaciones criticas sin una evaluacion exhaustiva y fine-tuning adicional.
- La arquitectura personalizada (custom_arch) puede requerir adaptaciones en frameworks de inferencia estandar, ya que no es un transformer convencional.
- No se proporcionan cuantizaciones oficiales, lo que puede complicar el despliegue en entornos con recursos limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GODELEV/Rose-Pro
- Modelo anterior de la familia: https://huggingface.co/GODELEV/Rose-Mini
- Busqueda de modelos con tag "rose" en HuggingFace: https://huggingface.co/models?other=rose
