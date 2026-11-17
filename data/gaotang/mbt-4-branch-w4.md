# gaotang/MBT-4-branch-W4

## Resumen

MBT-4-branch-W4 es un checkpoint de investigación de tipo "model-only" publicado por el usuario gaotang dentro de la línea de experimentos Multi-Branch Transformer (MBT). Se trata del modelo final de la variante "Balanced 4-branch Joint-KV", en la escala denominada W4, con 2.066.202.176 parámetros totales y entrenado sobre 78.841.380.864 tokens con un contexto de 4.096 tokens. Combina una arquitectura multi-rama con mecanismos de mezcla de expertos (MoE) y un esquema de compartición de claves/valores (Joint-KV) entre ramas.

El modelo resuelve, en el plano de la investigación, la pregunta de si es viable repartir el cómputo en varias ramas paralelas con atención compartida y enrutamiento tipo MoE manteniendo una pérdida de validación competitiva; según la model card, la pérdida final de validación fija es 2,364 tras 75.189 actualizaciones del optimizador. No es un modelo listo para producción: se distribuye como checkpoint nativo de investigación, sin tokenizador, sin runtime de inferencia y sin integración en Transformers estándar ni en vLLM.

Su relevancia actual es acotada y muy específica: sirve como artefacto reproducible para quienes investigan arquitecturas alternativas al transformer denso convencional (multi-rama, atención compartida, MoE) y quieren inspeccionar pesos, metadatos de tensores y buffers de enrutamiento persistentes. Para cualquier uso práctico de generación de texto, el modelo requiere trabajo de ingeniería adicional significativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Branch Transformer (MBT) con 4 ramas, Joint-KV (atención con claves/valores compartidos entre ramas) y mixture-of-experts |
| Parametros totales | 2.066.202.176 (2.066.200.064 según model card) |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), formato nativo `mbt-native-shared-kv-v1` |
| Escala | W4 |
| Asignación de ramas | 4 / (6 + 6 + 6 + 6) / 5 |
| Tokens de entrenamiento | 78.841.380.864 |
| Actualizaciones del optimizador | 75.189 |
| Pérdida de validación fija final | 2,364 |
| Conjunto de validación | 12.160 secuencias fijas reservadas |
| Tokenizador | no incluido; se indica obtener el tokenizador original de Llama 3 por separado |
| Runtime de inferencia | no incluido; requiere implementación nativa basada en Megatron |
| SHA256 de `model.safetensors` | `dde6b53f833b8a2fa9c118aa1fca694998710915ac744d48d66554e7831c27d8` |
| Tamaño del repo | 4,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un Multi-Branch Transformer con cuatro ramas paralelas y un mecanismo Joint-KV que comparte claves y valores entre ramas, lo que reduce el coste de atención frente a mantener cachés KV independientes por rama. La asignación indicada en la model card, `4 / (6 + 6 + 6 + 6) / 5`, sugiere una estructura de 4 ramas con 6 bloques por rama y 5 bloques de agregación o salida, aunque la documentación no detalla la semántica exacta de esa notación. El modelo incorpora mixture-of-experts con buffers de enrutamiento persistentes guardados en el checkpoint, lo que implica que el enrutamiento forma parte del estado entrenado y no se recalcula de forma determinista en carga.

El entrenamiento se realizó sobre 78.841.380.864 tokens con contexto de 4.096 tokens y 75.189 actualizaciones del optimizador, alcanzando una pérdida de validación fija de 2,364 sobre un conjunto reservado de 12.160 secuencias. No se especifican en la información disponible la composición del dataset, el uso de RLHF/DPO, ni innovaciones adicionales como decodificación especulativa. El checkpoint contiene únicamente pesos del modelo y buffers de enrutamiento: no incluye optimizador, estado RNG, dataset ni tokenizador.

## Capacidades

- Generación de texto autoregresiva en inglés, condicionada por el pipeline declarado (`text-generation`).
- Arquitectura experimental multi-rama con atención Joint-KV, orientada a investigación más que a uso directo.
- Mezcla de expertos con enrutamiento persistente entrenado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- No se documentan capacidades de código, matemáticas ni razonamiento evaluadas de forma específica.

## Casos de uso

- Investigación en arquitecturas alternativas: el checkpoint permite inspeccionar los pesos y metadatos de un Multi-Branch Transformer con Joint-KV y MoE, útil para reproducir o contrastar resultados del proyecto Multi-Branch Transformer.
- Estudio de compartición KV entre ramas: al conservar los tensores con sus nombres originales, se puede analizar cómo se distribuyen las claves y valores compartidos y qué impacto tiene en el estado guardado.
- Análisis de enrutamiento MoE persistente: los buffers de enrutamiento incluidos permiten estudiar el comportamiento del enrutador entrenado sin reentrenar.
- Reproducción de validación: el conjunto fijo de 12.160 secuencias y la pérdida reportada (2,364) sirven como referencia para verificar una recarga correcta del checkpoint con la implementación nativa Megatron.
- Base para experimentos de ajuste fino: al ser un checkpoint de 2.066 millones de parámetros, puede servir como punto de partida para estudios comparativos de ajuste sobre arquitecturas no convencionales, siempre que se disponga del runtime nativo.
- Docencia y divulgación técnica: útil para ilustrar en un curso o artículo cómo se estructura un checkpoint nativo de investigación con metadatos JSON de arquitectura y tensores.
- No se recomienda su uso en aplicaciones de producción (atención al cliente, generación de código, pipelines CI/CD) por la ausencia de runtime, tokenizador y licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida de validación fija final (2,364) sobre un conjunto reservado de 12.160 secuencias, sin comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (probablemente fp16/bf16 según el tamaño del repo de 4,1 GB): en torno a 4-5 GB solo para pesos, más caché KV y buffers de enrutamiento; el total real no está documentado.
- GPU recomendadas: no disponible. Al no existir runtime de inferencia publicado, no se pueden dar recomendaciones fiables.
- ¿Cabe en GPU de consumo? Por tamaño de pesos (2.066 millones de parámetros), en teoría cabría en GPUs consumer con 8 GB o más, pero la falta de runtime y de cuantizaciones impide confirmarlo.
- Opciones de despliegue: no compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual. Requiere la implementación nativa Megatron del proyecto Multi-Branch Transformer.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MBT-4-branch-W4 | 2.066 M | 4.096 | no disponible | Checkpoint nativo, sin runtime | Arquitectura multi-rama + MoE + Joint-KV, solo investigación |
| Alternativas de ~2B densos (p. ej. familias tipo Llama/Qwen de 1,5-3B) | ~1.500-3.000 M | 4.096-32.768 según modelo | variables (a menudo permisivas) | Transformers, GGUF, vLLM, Ollama | No disponible comparación de rendimiento directa con MBT-4-branch-W4 |
| Alternativas MoE pequeñas (p. ej. MoE de ~2-3B totales) | ~2.000-3.000 M | variable | variable | variable | No disponible comparación directa |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa rigurosa con modelos de la misma categoría.

## Limitaciones y advertencias

- Checkpoint de investigación sin runtime de inferencia incluido; no es cargable con `AutoModel` de Transformers ni con vLLM.
- No incluye tokenizador; hay que obtener el tokenizador de Llama 3 por separado y bajo sus propios términos de acceso y licencia.
- Licencia no especificada: riesgo legal para cualquier uso comercial.
- Solo soporta inglés según la model card.
- Contexto de entrenamiento limitado a 4.096 tokens.
- No se documentan sesgos, pero al no haber información sobre la composición del dataset no se pueden evaluar.
- Riesgo de alucinación no caracterizado; no hay evaluaciones publicadas.
- El enrutamiento MoE persistente implica que una recarga incorrecta puede alterar el comportamiento del modelo.
- El formato nativo `mbt-native-shared-kv-v1` está ligado a una implementación Megatron concreta; cambios en esa implementación pueden romper la compatibilidad.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos con recursos ajustados.

## Enlaces

- Hugging Face: https://huggingface.co/gaotang/MBT-4-branch-W4
- Proyecto Multi-Branch Transformer: https://github.com/GaotangLi/Multi-Branch-Transformer
- Paper, blog o demo: no disponibles en la información proporcionada.
