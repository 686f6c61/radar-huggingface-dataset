# JPQ24/Granite-4.1-3B-MI-Q4_K_M-GGUF

## Resumen

Granite-4.1-3B-MI-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo base ibm-granite/granite-4.1-3b, publicada por el usuario JPQ24. Se trata de una build Q4_K_M (4 bits, variante K medium de llama.cpp) que aplica una técnica propietaria denominada "3-Domain Mutual Information (Science + Common Sense + Agentic) neuron shielding", junto con un preacondicionamiento con guarda de perplejidad. Según la model card, se preservan 468.198 de 1.003.520 neuronas del núcleo (46,7%) y se mantiene precisión Q8_0 en las capas de embedding/output atadas del modelo original.

El modelo base, Granite 4.1 3B de IBM, es un modelo de lenguaje de 3.402.836.480 parámetros (aproximadamente 3,4 mil millones) bajo licencia Apache 2.0, orientado a conversación y tareas de propósito general. Esta versión cuantizada reduce el peso del repositorio a 2,2 GB, lo que la hace desplegable en hardware de consumo. La relevancia actual reside en la posibilidad de ejecutar un modelo de la familia Granite en entornos con recursos limitados mediante Ollama o llama.cpp, si bien la técnica de cuantización aplicada es una aportación del autor de la ficha y no una metodología estándar de la comunidad.

La información disponible sobre esta ficha es escasa: no se publican idiomas soportados, benchmarks estándar ni detalles del proceso de entrenamiento del modelo base. La evaluación OOD reportada por el autor es muy limitada (4 ítems) y no constituye evidencia robusta de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Granite 4.1 3B; detalles específicos no disponibles) |
| Parametros totales | 3.402.836.480 (~3,4 mil millones) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF), con Q8_0 preservado en tensores de embedding/output atados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 2,2 GB) |

## Arquitectura y entrenamiento

El modelo base es ibm-granite/granite-4.1-3b, un transformer de aproximadamente 3,4 mil millones de parámetros. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La arquitectura concreta (número de capas, dimensiones, mecanismos de atención) tampoco está documentada en esta ficha.

La innovación técnica de esta versión concreta es el proceso de cuantización: el autor aplica "3-Domain Mutual Information (Science + Common Sense + Agentic) neuron shielding" con preacondicionamiento PPL-guarded, preservando 468.198 de 1.003.520 neuronas del núcleo (46,7%) y 78 de 80 secciones preacondicionadas, además de mantener Q8_0 en los tensores atados de embedding/output. Esta metodología no es estándar y no está descrita en detalle en la model card, por lo que su reproducibilidad y validez general no pueden verificarse.

## Capacidades

- Generación de texto conversacional, según la etiqueta "conversational" del repositorio.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere integración con infraestructura de inferencia estándar.
- Ejecución local mediante Ollama y llama.cpp al estar en formato GGUF.
- Capacidades específicas del modelo base Granite 4.1 3B: no documentadas en la información disponible (no se confirma tool calling, agentes, visión, audio ni modo thinking).
- Capacidades multilingües: no disponibles.

## Casos de uso

- Despliegue local en estaciones de trabajo: al ocupar 2,2 GB en Q4_K_M, el modelo puede ejecutarse en CPU o GPU de consumo mediante Ollama, adecuado para prototipado y pruebas offline sin conexión.
- Asistentes conversacionales ligeros: la etiqueta "conversational" y el tamaño compacto permiten integrarlo en chatbots de bajo coste donde la latencia y el consumo de VRAM sean críticos.
- Generación de texto en entornos con restricciones de hardware: útil en portátiles o dispositivos edge donde un modelo de 3,4B en 4 bits cabe en memoria unificada.
- Evaluación comparativa de técnicas de cuantización: investigadores pueden usar esta build para estudiar el efecto del "neuron shielding" frente a cuantizaciones Q4_K_M estándar, comparando la pérdida de calidad.
- Pipelines de CI/CD para pruebas de inferencia: el formato GGUF y la compatibilidad con endpoints facilitan su integración en tests automatizados de aplicaciones que consuman modelos locales.
- Fines educativos y de experimentación: permite a desarrolladores familiarizarse con la familia Granite de IBM sin requerir GPUs de datacenter.

## Benchmarks y rendimiento

La única evaluación reportada por el autor es una prueba OOD (out-of-distribution) de 4 ítems, que no constituye un benchmark estándar:

| Etapa | Puntuación OOD |
|---|---|
| PyTorch comprimido | 4/4 (100,0%) |
| GGUF Q4_K_M final | 3/4 (75,0%) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. No se deben inferir cifras de rendimiento a partir de estos datos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB en Q4_K_M (el repo pesa 2,2 GB; se añade overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas pero compatibles.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (GTX 1650 4GB, RTX 3050, etc.), y también en CPU con suficiente RAM.
- Opciones de despliegue: Ollama (documentado en la model card), llama.cpp, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; no disponible confirmación para esta build.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Granite-4.1-3B-MI-Q4_K_M (esta ficha) | ~3,4B | no disponible | Apache 2.0 | GGUF | Hugging Face |
| ibm-granite/granite-4.1-3b (base) | ~3,4B | no disponible | Apache 2.0 | safetensors | Hugging Face |
| Otras cuantizaciones Q4_K_M del mismo base | ~3,4B | no disponible | Apache 2.0 | GGUF | no disponible en la información |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoría (por ejemplo, Llama 3.2 3B o Qwen2.5 3B) en la información proporcionada.

## Limitaciones y advertencias

- La técnica de cuantización ("3-Domain Mutual Information neuron shielding") no está documentada en detalle ni es estándar; su reproducibilidad y validez no pueden verificarse.
- La evaluación OOD se basa en solo 4 ítems, lo que no permite extraer conclusiones fiables sobre la calidad del modelo.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no cuantificado para esta build.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero el autor de la cuantización no ofrece garantías sobre el comportamiento del modelo comprimido.
- Al ser una cuantización de terceros, no cuenta con el respaldo oficial de IBM; para producción se recomienda validar contra el modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JPQ24/Granite-4.1-3B-MI-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b
