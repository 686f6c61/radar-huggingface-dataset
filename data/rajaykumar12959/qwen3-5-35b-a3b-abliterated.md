# rajaykumar12959/qwen3.5-35b-a3b-abliterated

## Resumen

Qwen3.5-35B-A3B Abliterated es una variante sin censura del modelo Qwen/Qwen3.5-35B-A3B, publicada por el usuario rajaykumar12959 en Hugging Face. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, construido sobre la arquitectura `Qwen3_5MoeForCausalLM`. El modelo base original es un modelo vision-lenguaje, pero esta versión contiene únicamente el modelo de lenguaje: el codificador visual y la cabeza de predicción multi-token (MTP) han sido eliminados, por lo que acepta exclusivamente entrada de texto.

La modificación principal consiste en una abliteración a nivel de pesos: se extrae una dirección de rechazo mediante diferencia de medias entre activaciones de prompts dañinos y benignos, y se ortogonaliza de forma permanente en todas las matrices de pesos que escriben en el flujo residual. Esto incluye `embed_tokens`, `self_attn.o_proj` en las 10 capas de atención completa, `linear_attn.out_proj` en las 30 capas de atención lineal Gated DeltaNet, y en las 40 capas los `mlp.experts.*.down_proj` (256 expertos enrutados) y `mlp.shared_expert.down_proj`. No hay hooks en tiempo de ejecución ni LoRA: la edición está integrada directamente en el checkpoint.

La relevancia de esta ficha radica en que documenta un caso de modificación de alineamiento sobre un modelo MoE de gran tamaño con atención híbrida, mostrando que es posible reducir la tasa de rechazo del 99,7% al 3,4% con un coste medible en capacidad muy reducido (MMLU-Pro pasa de 62,9% a 63,1%). El modelo se distribuye en safetensors bf16 con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForCausalLM (MoE con atención híbrida: 10 capas de atención completa + 30 capas de atención lineal Gated DeltaNet) |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint publicado es bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con mezcla de expertos (MoE) y atención híbrida. De las 40 capas totales, 10 utilizan atención completa y 30 utilizan atención lineal Gated DeltaNet, lo que reduce el coste computacional en secuencias largas. Cada capa contiene 256 expertos enrutados más un experto compartido, con un total de 34,7B parámetros de los cuales aproximadamente 3B se activan por token. El checkpoint deriva del modelo base Qwen/Qwen3.5-35B-A3B, que originalmente es vision-lenguaje; esta versión elimina el codificador visual y la cabeza MTP, conservando solo el modelo de lenguaje.

El proceso de abliteración se realizó sin entrenamiento basado en gradientes. Se extrajo una dirección de diferencia de medias por capa (en fp32, sobre el último token con plantilla, usando 210 prompts dañinos y 210 benignos de entrenamiento). Cada dirección se purificó mediante Gram-Schmidt contra la dirección media benigna y se normalizó. Para cada proyección que escribe en el flujo residual `y = Wx`, se elimina la componente a lo largo de `d̂` en forma cerrada: `W' = W − s · d̂(d̂ᵀW)`, donde `s` es una fuerza por capa. La fuerza no es plana: un optimizador estilo Heretic buscó sobre un índice de dirección fraccional y curvas de fuerza separadas por capa para atención y para escrituras MLP/expertos, minimizando conjuntamente los rechazos y la divergencia KL en prompts benignos. Los pesos del router, el resto de tensores, la configuración y el tokenizer/plantilla de chat permanecen sin cambios respecto al modelo base.

## Capacidades

- Generación de texto conversacional y de respuesta directa (evaluado con `enable_thinking=False`).
- Razonamiento y conocimiento general, medido con MMLU-Pro (63,1% de precisión zero-shot por log-verosimilitud de la letra de respuesta).
- Conocimiento de seguridad y ciberseguridad: CyberMetric (93,0%) y detección de vulnerabilidades (49,0% en 200 preguntas binarias).
- Síntesis de parches de código: 8 de 12 tareas resueltas según juicio de tasa de corrección.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno mediante plantilla de chat.
- Modo thinking disponible en la plantilla (`enable_thinking`), aunque no fue evaluado en la model card.
- Capacidades multilingües: no documentadas en la información disponible.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Visión: no disponible (el codificador visual fue eliminado en este checkpoint).

## Casos de uso

- Investigación sobre alineamiento y abliteración: el modelo sirve como caso de estudio reproducible para analizar cómo la eliminación de la dirección de rechazo afecta a la tasa de negativa y a la divergencia KL en prompts benignos, con configuración exacta incluida en `ablation_config.json`.
- Evaluación de robustez de salvaguardas: permite medir la eficacia de filtros y clasificadores externos frente a un modelo con rechazo reducido al 3,4%, útil para diseñar capas de seguridad en producción.
- Análisis de seguridad ofensiva controlada: con un 93,0% en CyberMetric y 49,0% en detección de vulnerabilidades, puede emplearse en entornos de investigación para tareas de análisis de código y revisión de parches (8/12 en síntesis de parches).
- Generación de texto sin fricción en dominios sensibles legítimos: contenidos de ficción, divulgación sobre drogas o violencia desde una perspectiva académica, donde los rechazos del modelo base resultan contraproducentes.
- Estudio de sesgos y comportamientos no deseados: al reducirse los rechazos, se facilita la observación de respuestas del modelo en categorías como armas, autolesión o fraude, para auditoría.
- Despliegue en investigación con GPU de 80 GB: cabe en una A100/H100 en bf16 (~70 GB), lo que permite experimentación local sin infraestructura multi-GPU.
- Base para comparativas de capacidad: útil para contrastar MMLU-Pro por asignatura (biología 88,6%, historia 85,7%, salud 80,0%) frente al modelo original en las mismas preguntas.

## Benchmarks y rendimiento

| Métrica | Original | Abliterated |
|---|---|---|
| Tasa de rechazo (292 prompts dañinos reservados, 12 categorías) | 99,7% | 3,4% |
| MMLU-Pro (490 preguntas, 35 por asignatura × 14) | 62,9% | 63,1% (+0,2 pp) |
| Divergencia KL en prompts benignos (primer token, 90 prompts) | — | 0,050 nats |
| Mismo top-1 en primer token que el original en prompts benignos | — | 95,6% |
| Security MCQ (CyberMetric, 200 preguntas) | 93,0% | 93,0% |
| Detección de vulnerabilidades (200 preguntas binarias) | 49,5% | 49,0% |
| Síntesis de parches (12 tareas, tasa de corrección juzgada) | 9/12 | 8/12 |

Tasa de rechazo por categoría (juzgada por el modelo base sin modificar):

| Categoría | Original | Abliterated |
|---|---|---|
| cybercrime_hacking | 96,4% | 3,6% |
| extremism | 100% | 0% |
| financial_crime | 100% | 0% |
| fraud_scams | 100% | 4,2% |
| hate_speech | 100% | 0% |
| illicit_drugs | 100% | 0% |
| malware | 100% | 0% |
| misinformation | 100% | 0% |
| privacy_invasion | 100% | 4,2% |
| self_harm | 100% | 8,3% |
| violence | 100% | 0% |
| weapons | 100% | 20,8% |

MMLU-Pro por asignatura:

| Asignatura | Original | Abliterated |
|---|---|---|
| biology | 88,6% | 88,6% |
| business | 37,1% | 28,6% |
| chemistry | 57,1% | 57,1% |
| computer science | 51,4% | 57,1% |
| economics | 68,6% | 74,3% |
| engineering | 54,3% | 51,4% |
| health | 80,0% | 80,0% |
| history | 85,7% | 85,7% |
| law | 51,4% | 45,7% |
| math | 48,6% | 45,7% |
| other | 60,0% | 62,9% |
| philosophy | 60,0% | 62,9% |
| physics | 57,1% | 60,0% |
| psychology | 80,0% | 82,9% |

Cada asignatura tiene solo 35 preguntas, por lo que una pregunta equivale a 2,9 pp; las diferencias por asignatura van en ambas direcciones y están dentro del ruido. MMLU-Pro se puntúa zero-shot por log-verosimilitud de la letra de respuesta (sin cadena de pensamiento), por lo que los valores absolutos son inferiores a los publicados por Qwen.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 70 GB (según la model card).
- GPU recomendadas: una A100 de 80 GB o una H100 de 80 GB para bf16.
- No cabe en GPU de consumo en bf16; no se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ) en la información disponible.
- Opciones de despliegue: Transformers con `transformers>=5.19.0` y `device_map="auto"`. Se recomienda instalar `flash-linear-attention` y opcionalmente `causal-conv1d` para acelerar las capas de atención lineal.
- Latencia y throughput: no disponibles.
- Modo thinking: disponible en la plantilla, pero no evaluado; todas las métricas se obtuvieron con `enable_thinking=False`.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| rajaykumar12959/qwen3.5-35b-a3b-abliterated | 34,7B | ~3B | no disponible | Apache 2.0 | Versión abliterada, solo texto, rechazo 3,4% |
| Qwen/Qwen3.5-35B-A3B | 34,7B | ~3B | no disponible | Apache 2.0 | Modelo base vision-lenguaje, rechazo 99,7%, MMLU-Pro 62,9% |
| rajaykumar12959/qwen3.8-27b-abliterated | no disponible | no disponible | no disponible | no disponible | Versión abliterada previa del mismo autor, con fuerza de ablación plana |

## Limitaciones y advertencias

- Modelo sin censura: la tasa de rechazo cae al 3,4% y a 0% en 7 de 12 categorías, incluyendo malware, drogas ilícitas, extremismo, discurso de odio, desinformación y violencia. No es apto para despliegues públicos sin capas de seguridad externas.
- El rechazo residual se concentra en armas (20,8%) y autolesión (8,3%); el juez del modelo base marca respuestas que abren con un descargo legal o redirigen a recursos de crisis.
- Riesgo elevado de generar contenido dañino, ilegal o peligroso si se usa sin filtrado; requiere revisión humana y clasificadores de salida en cualquier uso en producción.
- La evaluación de rechazo fue juzgada por el propio modelo base sin modificar, lo que puede introducir sesgo del juez.
- MMLU-Pro se midió zero-shot por log-verosimilitud sin cadena de pensamiento; los valores absolutos no son comparables con los publicados por Qwen con otras metodologías.
- Cada asignatura de MMLU-Pro tiene 35 preguntas, por lo que las diferencias por asignatura están dentro del ruido estadístico.
- El modo thinking no fue evaluado; su comportamiento y calidad son desconocidos.
- El modelo es solo texto: no acepta imágenes, aunque el modelo base sí lo haga.
- Idiomas soportados no documentados; no se garantiza calidad multilingüe.
- Contexto máximo no documentado en la información disponible.
- No se documentan cuantizaciones oficiales; el despliegue en bf16 exige ~70 GB de VRAM.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar normativas locales; la responsabilidad recae en el desplegador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rajaykumar12959/qwen3.5-35b-a3b-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Versión abliterada previa del mismo autor: https://huggingface.co/rajaykumar12959/qwen3.8-27b-abliterated
- Dataset AdvBench: https://huggingface.co/datasets/walledai/AdvBench
- Dataset Alpaca: https://huggingface.co/datasets/tatsu-lab/alpaca
