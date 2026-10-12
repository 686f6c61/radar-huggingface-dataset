# ElementMerc/qwen2.5-1.5b-abliterated

## Resumen

ElementMerc/qwen2.5-1.5b-abliterated es una variante "abliterated" de Qwen/Qwen2.5-1.5B-Instruct, es decir, un ajuste de pesos que elimina el comportamiento de rechazo del modelo base sin reentrenamiento alguno. Lo desarrolla el usuario ElementMerc y forma parte del proyecto senbonzakura, una herramienta de búsqueda de proyecciones por capa para la eliminación de la dirección de rechazo. El resultado es un modelo de 1.543.714.304 parámetros (1,54 B) que responde a peticiones que el modelo original declina, incluida una parte de las dañinas.

La relevancia del modelo es doble. Por un lado, es un artefacto experimental publicado dentro de una línea de investigación sobre interpretabilidad y mecanismos de rechazo. Por otro, es un caso poco habitual de transparencia metodológica: el autor ha retirado públicamente todas las métricas de su model card (aviso de corrección del 1 de octubre de 2026) al detectar tres fallos en la herramienta de medición, y mantiene los pesos intactos mientras prepara una remedición.

Conviene subrayar que se trata de un modelo pequeño, evaluado únicamente en inglés, con licencia Apache-2.0 y pensado para investigación en seguridad y red teaming, no para despliegue ante usuarios finales. La model card declara explícitamente que el modelo no rechazará peticiones y que carece de cualquier capa de seguridad propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5), heredada del modelo base; incluye atención de consultas agrupadas (GQA), RoPE y SwiGLU |
| Parámetros totales | 1.543.714.304 (1,54 B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens según la documentación del modelo base Qwen2.5-1.5B-Instruct (ampliable a 131.072 con YaRN); no verificado en la model card del modelo abliterated |
| Tipos de cuantización | safetensors en la precisión del modelo base (BF16/FP16, sin cambios); builds GGUF en repositorio aparte (lista concreta de cuantizaciones no disponible) |
| Idiomas soportados | en (inglés), según la model card; el modelo base Qwen2.5 es multilingüe, pero esta variante solo se ha evaluado en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF en ElementMerc/qwen2.5-1.5b-abliterated-GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-1.5B-Instruct: un transformer decoder-only con normalización RMSNorm, embeddings rotatorios (RoPE), activación SwiGLU y atención con consultas agrupadas (GQA), diseñado para generación de texto y conversación. La abliteración no modifica la arquitectura ni añade módulos: se editan directamente los pesos, de modo que la precisión y la topología del modelo base se conservan sin cambios.

El proceso de creación, implementado en senbonzakura, busca una proyección de rechazo específica por capa en lugar de eliminar una única dirección global. La optimización se realiza contra un conjunto de validación reservado con una penalización KL, de forma que se perturbe lo mínimo posible el comportamiento general del modelo. En esta instancia la búsqueda se ejecutó durante 100 ensayos. No hay actualizaciones de gradiente, ni datos de entrenamiento, ni ajuste fino: los pesos se editan de forma directa, sin fine-tuning posterior. La evaluación asociada utilizó 200 prompts dañinos y 200 inofensivos reservados, puntuados mediante el margen entre logits.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat compatible con `apply_chat_template` de transformers.
- Respuesta a peticiones que el modelo base rechaza, incluida una fracción de las dañinas; es la característica definitoria del modelo.
- Edición de pesos orientada a interpretabilidad: permite estudiar qué direcciones de activación codifican el comportamiento de rechazo.
- Uso como artefacto de red teaming y de evaluación de seguridad, al proporcionar un modelo que no declina peticiones.
- Compatibilidad con el ecosistema transformers, text-generation-inference y endpoints compatibles (según los tags del repositorio).
- Disponibilidad de builds GGUF para llama.cpp, Ollama y LM Studio en un repositorio separado.
- Razonamiento avanzado, matemáticas, código, tool calling, capacidades multimodales o modo de pensamiento: no disponible (no se documentan en la información proporcionada, y el tamaño de 1,5 B limita la competencia en términos absolutos).

## Casos de uso

- Red teaming de sistemas de IA: el modelo actúa como generador de peticiones y respuestas no filtradas para probar la robustez de guardarraíles y clasificadores de contenido antes de un despliegue.
- Investigación en mecanismos de rechazo: al ser una edición dirigida de pesos sobre un modelo base conocido, permite comparar activaciones capa por capa entre la versión original y la abliterada para localizar las direcciones responsables del rechazo.
- Evaluación de clasificadores de seguridad: sus respuestas sirven como conjunto de ejemplos negativos para medir falsos negativos de filtros de contenido en producción.
- Generación de datos sintéticos para investigación en seguridad: se puede usar para construir corpus etiquetados de peticiones y respuestas que alimenten detectores de contenido dañino, siempre en un entorno controlado y aislado.
- Experimentos de destilación y ablación: al ser un modelo de 1,54 B, cabe en una GPU de consumo y permite iterar rápidamente sobre variantes de eliminación de rechazo sin coste elevado de cómputo.
- Estudio de deriva de comportamiento: comparar la versión abliterada con Qwen2.5-1.5B-Instruct en tareas neutras permite cuantificar cuánto se degrada el modelo al editar los pesos, un dato relevante para la metodología senbonzakura.
- Pruebas locales de pipelines de inferencia: sirve para validar integraciones con llama.cpp, Ollama o LM Studio en hardware modesto antes de escalar a modelos mayores.
- Análisis de sesgos: dado que la abliteración no corrige los sesgos del modelo base y puede facilitar su elicitación, es útil para estudiar hasta qué punto el rechazo enmascaraba sesgos latentes.

## Benchmarks y rendimiento

Los datos publicados en la model card están **retirados por el propio autor** (aviso de corrección del 1 de octubre de 2026). Se reproducen a continuación únicamente como registro histórico, con la advertencia explícita de que no deben citarse, escalarse ni utilizarse para tomar decisiones.

| Métrica (retirada) | Base | Abliterated |
|---|---|---|
| Tasa de rechazo (200 prompts dañinos) | 88,0 % | 26,5 % |
| Discriminación de daño (AUC, 200 dañinos frente a 200 inofensivos) | 0,9983 | 0,9972 |

Motivos de la retirada, según la propia model card: el filtro que debía conservar solo las direcciones portadoras de rechazo aceptaba todos los candidatos; el detector de matices de evasión puntuaba respuestas conformes como rechazos suaves; y la fila de AUC está retirada en la documentación del propio proyecto. El autor indica que no existe factor de conversión entre estas cifras y las correctas, y que publicará una remedición manteniendo visibles los valores antiguos junto a los nuevos.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 3,1 GB solo para pesos (coincide con el tamaño del repositorio), más overhead de activaciones y caché KV.
- VRAM estimada en INT8: alrededor de 1,6 GB para pesos.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): en torno a 1 GB para pesos.
- GPU recomendadas: cualquier GPU moderna con 4 GB o más de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sobradamente, aunque en estas últimas el modelo queda muy infrautilizado.
- Cabe sin problema en GPU de consumo: sí, en tarjetas de gama de entrada con 4-6 GB, e incluso en CPU mediante llama.cpp con cuantización de 4 bits.
- Opciones de despliegue: transformers (con `device_map="auto"`), text-generation-inference, endpoints compatibles, llama.cpp, Ollama y LM Studio a través de los builds GGUF.
- Latencia y throughput estimados: no disponible; no se han publicado medidas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ElementMerc/qwen2.5-1.5b-abliterated | 1,54 B | 32.768 (heredado del base) | Apache-2.0 | HuggingFace, pesos safetensors y GGUF | Sin rechazo; métricas retiradas por el autor |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache-2.0 | HuggingFace | Modelo base con rechazo intacto; benchmarks públicos de Qwen2.5 |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 | Llama 3.2 Community License | HuggingFace | Alternativa de tamaño similar, licencia más restrictiva y contexto mayor |
| google/gemma-2-2b-it | 2,6 B | 8.000 | Gemma Terms of Use | HuggingFace | Alternativa algo mayor, contexto reducido y licencia con condiciones de uso |

Los datos de rendimiento comparativo entre estos modelos no están disponibles en la información proporcionada, y en el caso del modelo de esta ficha las métricas propias han sido retiradas por su autor.

## Limitaciones y advertencias

- El modelo no rechaza peticiones. Es su propósito declarado y el principal riesgo: responderá a solicitudes que el modelo base declina, incluidas algunas dañinas. Cualquier despliegue orientado a terceros necesita su propia capa de seguridad, porque el modelo no incorpora ninguna.
- La abliteración no es gratuita: es una edición dirigida de pesos, pero sigue siendo una edición. La model card anticipa deriva en el comportamiento general respecto al modelo base; el cambio de AUC reportado (–0,001) está retirado y no debe tomarse como garantía de que la edición fue limpia.
- Modelo pequeño, competencia limitada: con 1,5 B de parámetros su rendimiento absoluto es bajo, y sus respuestas en temas técnicos no deben considerarse fiables.
- Evaluación únicamente en inglés y sobre un único conjunto de prompts dañinos. Las cifras no autorizan afirmaciones sobre otros idiomas ni sobre otros tipos de petición.
- Los sesgos del modelo base persisten: nada en el proceso de abliteración los corrige, y la eliminación del rechazo puede facilitar su elicitación.
- Uso previsto restringido: investigación sobre mecanismos de rechazo, interpretabilidad, red teaming y evaluación de seguridad. No está pensado como asistente general ni para despliegue a usuarios finales.
- Aunque la licencia Apache-2.0 permite uso comercial, el propio autor desaconseja el despliegue en producción con usuarios finales por ausencia de salvaguardas.
- Todas las métricas publicadas en la model card están retiradas a fecha del 1 de octubre de 2026 y no deben citarse ni escalarse; se espera una remedición que sustituya la ficha actual.
- No se han publicado datos de latencia, throughput ni benchmarks estándar que permitan caracterizar el rendimiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ElementMerc/qwen2.5-1.5b-abliterated
- Builds GGUF: https://huggingface.co/ElementMerc/qwen2.5-1.5b-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de senbonzakura: https://github.com/elementmerc/senbonzakura
- Registro de cambios del proyecto: https://github.com/elementmerc/senbonzakura/blob/main/CHANGELOG.md
- Documentación de errores del proyecto ("what we got wrong"): https://elementmerc.github.io/senbonzakura/guide/what-we-got-wrong
