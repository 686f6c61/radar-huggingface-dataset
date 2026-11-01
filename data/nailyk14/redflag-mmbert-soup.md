# Nailyk14/redflag-mmbert-soup

## Resumen

RedFlag es un clasificador de texto multilingüe especializado en la detección de prompts maliciosos. Lo desarrolla Nailyk14 como proyecto del curso de IA de la EPITA y se construye a partir de `jhu-clsp/mmBERT-base`, un encoder ModernBERT de 307.534.085 parámetros, afinado con un bucle de entrenamiento propio en PyTorch. El modelo clasifica cada prompt en cinco categorías: `benign`, `injection_direct`, `jailbreak`, `hijack` y `data_exfiltration`. Es relevante porque aborda una necesidad operativa concreta en el despliegue de sistemas basados en LLM: filtrar entradas adversariales antes de que lleguen al modelo generativo.

La versión publicada es un *model soup*: la media aritmética de los pesos de dos iteraciones previas (v4 y v5), donde la v5 es una reprise de la v4 orientada a jailbreaks con persona. El autor reporta una mejora marginal sobre la v4 (macro-F1 de 0,967 frente a 0,966 en el conjunto de test sin el subconjunto `toxicity=`), con un rendimiento prácticamente idéntico en la tasa de falsas alertas.

El modelo se distribuye con metadatos de calibración (`meta.json`) que incluyen una temperatura de calibración y umbrales de decisión globales, por recall objetivo y por idioma, lo que facilita su integración en pipelines de moderación con tasas de falsos positivos controladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), fine-tune para clasificación de secuencias |
| Parametros totales | 307.534.085 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de uso trunca a 512 tokens; el repositorio recomienda ventanas deslizantes de 128 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | multilingüe (evaluado en 49 idiomas traducidos; umbrales por idioma para 43 lenguas) |
| Licencia | other (modelo base bajo MIT; datos de entrenamiento con licencias mixtas; uso pedagógico y de investigación) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/mmBERT-base`, un encoder ModernBERT multilingüe. Sobre esa base se aplica un fine-tune supervisado para clasificación en cinco clases, ejecutado con un bucle de entrenamiento en PyTorch propio (no se especifica el framework de alto nivel ni los hiperparámetros). El conjunto de datos es `Nailyk14/prompt-safety-multilingual-v2`, con prompts etiquetados en las cinco categorías y un subconjunto marcado como `toxicity=` que el autor excluye de la evaluación principal.

La innovación técnica principal es el *model soup*: los pesos finales son la media de los checkpoints v4 y v5, donde la v5 es una reprise de la v4 dirigida específicamente a jailbreaks con persona. No se documentan técnicas de RLHF, DPO ni decodificación especulativa, algo esperable en un clasificador encoder. El autor complementa el modelo con un pipeline de preprocesado en `inference.py` que aplica normalización (caracteres invisibles, homoglifos, base64, leetspeak) y ventanas deslizantes de 128 tokens, y publica una temperatura de calibración `T` junto con umbrales de decisión en `meta.json`.

## Capacidades

- Clasificación de prompts en cinco clases: `benign`, `injection_direct`, `jailbreak`, `hijack`, `data_exfiltration`.
- Detección de inyección directa de instrucciones (p. ej. "Ignore all previous instructions...").
- Detección de jailbreaks, incluidos los de persona, con especial atención en la versión v5.
- Detección de secuestro de contexto (hijack) y de intentos de exfiltración de datos.
- Salida probabilística calibrada mediante temperatura, con umbral configurable sobre p(malicioso) = 1 − p(benign).
- Umbrales de decisión por idioma (43 lenguas) además de umbrales globales y por recall objetivo.
- Capacidad multilingüe: entrenado y evaluado en decenas de idiomas, con rendimiento inferior en traducciones respecto al inglés.
- No soporta tool calling, agentes, visión ni audio: es un clasificador, no un modelo generativo.

## Casos de uso

- Filtrado de entrada en aplicaciones de chat con LLM: el clasificador se ejecuta antes del modelo generativo y bloquea o marca prompts con probabilidad de inyección o jailbreak por encima del umbral global (1 % de falsos positivos en validación), reduciendo la superficie de ataque.
- Moderación de contenido en plataformas multilingües: con umbrales por idioma para 43 lenguas, permite aplicar políticas de seguridad sin un modelo distinto por mercado.
- Detección de intentos de exfiltración en asistentes con acceso a datos: la clase `data_exfiltration` (F1 de 0,974 en el test completo) identifica prompts que intentan extraer información del sistema o de herramientas conectadas.
- Protección de agentes con herramientas: antes de ejecutar una llamada a función, el prompt se clasifica para descartar `hijack` y `injection_direct`, evitando que instrucciones adversariales secuestren el flujo del agente.
- Evaluación de robustez de LLM en investigación: el modelo sirve como etiquetador automático de conjuntos de prompts adversariales, con la ventaja de ser pequeño (307 M de parámetros) y desplegable en una sola GPU.
- Enrutado y triaje en pipelines de seguridad: con umbrales ajustables por recall (p. ej. 94 % de recall) se puede derivar a revisión humana solo la cola de mayor riesgo, optimizando costes de moderación.
- Análisis forense de logs: clasificación por lotes de conversaciones históricas para identificar patrones de ataque y construir datasets de entrenamiento.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card.

| Metrica | v4 | Modelo soup (v4+v5) |
|---|---|---|
| Macro-F1 (test sin `toxicity=`, 44.644 prompts) | 0,966 | 0,967 |
| Recall @ FPR 1 % (mismo conjunto) | 0,955 | 0,957 |
| Falsas alertas `probe_benign` (umbral "recall 94 %") | 5,7 % | 5,7 % |

Resultados adicionales del modelo soup:

| Metrica | Valor |
|---|---|
| Macro-F1 test completo (47.790 prompts, salida bruta) | 0,958 |
| F1 por clase (rango) | 0,920 (`jailbreak`) – 0,974 (`data_exfiltration`) |
| Macro-F1 en `test_translated` (49 idiomas) | 0,858 |
| Recall @ FPR 1 % en `test_translated` | 0,62 |
| Recall en jailbreaks de persona reales (JailbreakHub) | ~0,59 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en fp32 (307 M de parámetros), ~0,6 GB en fp16/bf16. El repositorio ocupa 1,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 4090 o A100 está sobredimensionada para este modelo y solo se justifica por volumen de peticiones.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (GTX 1660, RTX 3060, RTX 4090) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`; también es compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles (`endpoints_compatible`). No se documentan despliegues en vLLM, llama.cpp u Ollama (no hay pesos GGUF publicados).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera inference en pocos milisegundos por prompt en GPU, pero es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RedFlag (este modelo) | 307,5 M | no disponible | Clasificación de prompts maliciosos en 5 clases | other (base MIT, datos mixtos) | HuggingFace |
| `jhu-clsp/mmBERT-base` (modelo base) | no disponible | no disponible | Encoder multilingüe general | MIT | HuggingFace |
| Clasificadores de seguridad tipo Llama Guard | no disponible | no disponible | Moderación generativa | licencia propia | HuggingFace |

La comparación cuantitativa con alternativas de la misma categoría no está disponible en la documentación consultada.

## Limitaciones y advertencias

- Multilingüe más débil que el inglés: recall de 0,62 a 1 % de falsos positivos en `test_translated`, frente a 0,955–0,957 en el test principal.
- Jailbreaks de persona reales (JailbreakHub): recall de aproximadamente 0,59, insuficiente para uso como única defensa.
- La frontera entre `benign` y `jailbreak` en el dataset contiene etiquetas ambiguas, lo que introduce ruido irreducible en las métricas.
- Es un proyecto de curso: el autor recomienda explícitamente combinarlo con otras defensas y no usarlo solo en producción.
- Licencia `other`: el modelo base es MIT, pero los datos de entrenamiento tienen licencias mixtas; el uso declarado es pedagógico y de investigación, por lo que el uso comercial requiere revisión legal.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificación errónea: falsos negativos en ataques novedosos y falsos positivos en prompts legítimos con vocabulario similar al adversarial (5,7 % de falsas alertas en `probe_benign` con umbral de recall 94 %).
- El código y la documentación completos están en un repositorio GitHub privado bajo invitación (`Kylian14/redflag`), lo que limita la reproducibilidad del pipeline de normalización y ventanas deslizantes.
- Sin datos publicados sobre cuantizaciones, longitud de contexto nativa ni latencia, lo que complica la planificación de despliegues a gran escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nailyk14/redflag-mmbert-soup
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Dataset de entrenamiento: https://huggingface.co/datasets/Nailyk14/prompt-safety-multilingual-v2
- Repositorio GitHub (privado, bajo invitación): `Kylian14/redflag`
