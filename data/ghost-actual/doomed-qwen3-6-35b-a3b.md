# ghost-actual/DOOMED-Qwen3.6-35B-A3B

## Resumen

DOOMED-Qwen3.6-35B-A3B es una adaptación del modelo base Qwen3.6-35B-A3B de Alibaba, desarrollada por el usuario ghost-actual mediante el pipeline DOOM en dos etapas. El objetivo principal es eliminar los mecanismos de rechazo (refusal) del modelo original, produciendo una variante "abliterada" orientada a generar contenido sin filtros de seguridad. El modelo base es un MoE híbrido de 34.660.610.688 parámetros totales con solo 3 mil millones activos por token, que combina atención lineal Gated-DeltaNet con atención clásica y un router sparse de 256 expertos (top-8) más un experto compartido.

El proceso DOOM reduce la tasa de rechazo del 73,9% inicial al 0,6% (3 de 475 prompts en el benchmark), lo que supone una reducción del 99,2%. Para ello aplica primero una reflexión de Householder sobre direcciones de rechazo en 18.720 parámetros y después un LoRA de rango 32 sobre las proyecciones de atención y el experto compartido. El modelo se distribuye en formato GGUF con varias cuantizaciones, bajo licencia Apache-2.0, y está pensado para ejecución local mediante llama.cpp.

La relevancia de este modelo radica en que demuestra que la negativa a responder en Qwen3.6-35B-A3B reside principalmente en las proyecciones recurrentes de Gated-DeltaNet y en el experto compartido, no en el router. Esto permite una ablación quirúrgica sin tocar la lógica de mezcla de expertos. Es una pieza de interés para investigadores que estudian la localización de comportamientos en MoE y para desarrolladores que necesitan un modelo conversacional sin restricciones de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con Gated-DeltaNet linear attention, 256 expertos (top-8) + 1 experto compartido |
| Parametros totales | 34.660.610.688 |
| Parametros activos | ~3.000.000.000 (3B por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q4_K_M (~21,2 GB), Q5_K_M (~24,7 GB), Q6_K (~28,5 GB), Q8_0 (~36,9 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (también safetensors en el repo) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un Mixture-of-Experts sparse con 35 mil millones de parámetros totales y solo 3 mil millones activos por token. La arquitectura combina atención clásica (Gated Attention) con Gated-DeltaNet, una variante de atención lineal recurrente que reduce el coste de memoria y permite ventanas de contexto largas. El router sparse selecciona 8 de los 256 expertos disponibles más un experto compartido que siempre está activo.

El pipeline DOOM se ejecuta en dos etapas. En la primera, se identifican direcciones de rechazo mediante diferencia de medias sobre el último token y se aplican reflexiones de Householder (α=0,5) sobre un total de 18.720 parámetros distribuidos entre expertos, atención y experto compartido. En la segunda etapa, se entrena un LoRA de rango 32 sobre las proyecciones GDNet, las proyecciones completas de atención `q/k/v/o_proj` y las proyecciones del experto compartido (`gate/up/down_proj`), utilizando 473 pares de datos sin censura procedentes de `huihui-ai/Huihui-Qwen3.5-4B-abliterated`. El router y los tensores 3D de los expertos enrutados se dejan intactos, ya que una sonda de router reveló que el rechazo es difuso y no se concentra en un grupo de expertos específico.

## Capacidades

- Generación de texto conversacional en inglés sin filtros de seguridad, capaz de tratar temas sensibles o controvertidos.
- Razonamiento y resolución de problemas con la inteligencia del modelo base Qwen3.6-35B-A3B, que alcanza un 73,4 % en SWE-bench con solo 3B de parámetros activos.
- Soporte de razonamiento multi-paso y generación de código, heredado de las capacidades del Qwen3.6 base.
- Capacidad de tool calling y function calling, disponible en la arquitectura Qwen3.6 estándar.
- Integración con el ecosistema llama.cpp: se puede usar con `llama-server` y `llama-cli` para inferencia local.
- No se ha confirmado soporte de visión o audio en esta variante, aunque el base Qwen3.6-35B-A3B incluye un codificador de visión para razonamiento multimodal; el modelo abliterado no documenta explícitamente su mantenimiento.

## Casos de uso

- Generación de contenido creativo sin restricciones: escritores y desarrolladores pueden usar el modelo para generar narrativa, diálogos o material de ficción que aborde temas adultos sin auto-censura.
- Investigación sobre localización de comportamientos en MoE: el modelo es útil para estudiar dónde se almacena el rechazo en arquitecturas de mezcla de expertos, ya que el pipeline DOOM ha aislado las proyecciones implicadas.
- Desarrollo de agentes conversacionales para nichos específicos: con tool calling heredado, puede integrarse en asistentes que requieran respuestas directas sin evasivas, por ejemplo en soporte técnico interno.
- Evaluación de riesgos de modelos sin filtros: para investigadores que estudian los efectos de la eliminación de salvaguardas en modelos de lenguaje, sirve como caso de estudio comparativo.
- Generación de código en entornos de desarrollo local: con 3B de parámetros activos, puede ejecutarse en hardware de consumo y ser usado como asistente de programación en entornos sin acceso a la nube.
- Experimentación en entornos educativos: para enseñar técnicas de ablación de comportamiento y edición de modelos, gracias a su documentación detallada del método DOOM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la variante abliterada DOOMED-Qwen3.6-35B-A3B. Los datos disponibles corresponden al modelo base Qwen3.6-35B-A3B:

| Benchmark | Resultado base |
|---|---|
| SWE-bench | 73,4 % |
| Refusal rate (475-prompt bench) | 73,9 % (stock) → 0,6 % (DOOMED) |

La métrica principal de este modelo es la tasa de rechazo, que se reduce de 73,9 % a 0,6 % (3/475 prompts), lo que supone una reducción del 99,2 %. No se dispone de resultados de MMLU, HumanEval o GSM8K en la información proporcionada.

## Requisitos de hardware

- VRAM estimada según cuantización: Q4_K_M ~21,2 GB, Q5_K_M ~24,7 GB, Q6_K ~28,5 GB, Q8_0 ~36,9 GB.
- GPU recomendadas: con Q4_K_M cabe en tarjetas de 24 GB VRAM como RTX 3090, RTX 4090 o A5000. Para Q5_K_M o superior se recomienda A6000, A100 40 GB o H100.
- En GPU de consumo (RTX 4070 12 GB, RTX 3080 10 GB) no cabe, pero se puede usar cuantización inferior o descargar el modelo base en formato GGUF con menor tamaño.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama, vLLM (si se convierte a safetensors), TGI.
- Latencia: no disponible, pero con 3B de parámetros activos se espera un throughput alto en GPUs modernas; la ejecución en MacBook con Apple Silicon es posible según la guía de la base Qwen3.6-35B-A3B.
- El repositorio pesa 111,3 GB, lo que sugiere que incluye todas las cuantizaciones GGUF y posiblemente los safetensors originales.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DOOMED-Qwen3.6-35B-A3B | 34,7B | ~3B | no disponible | Apache-2.0 | GGUF en HF |
| Qwen3.6-35B-A3B (base) | 34,7B | ~3B | no disponible | Apache-2.0 | safetensors y GGUF |
| Qwen3.6-27B (dense) | 27B | 27B | no disponible | Apache-2.0 | safetensors y GGUF |
| Qwen3.5-35B-A3B | ~35B | ~3B | no disponible | Apache-2.0 | safetensors y GGUF |

La comparativa se centra en la familia Qwen3.6. La variante DOOMED se diferencia de la base únicamente en la eliminación del rechazo; las capacidades de razonamiento y código son idénticas. Frente a Qwen3.6-27B dense, la variante MoE es más eficiente en inferencia con solo 3B activos, aunque el dense puede ser más sencillo de desplegar. No se dispone de datos de rendimiento de Qwen3.5-35B-A3B para comparar directamente.

## Limitaciones y advertencias

- El modelo ha sido sometido a una reducción significativa de los filtros de seguridad; puede generar contenido sensible, controvertido o dañino. El autor advierte explícitamente que se debe usar de manera responsable y conforme a la ley aplicable.
- No se ha evaluado el impacto de la ablación en la calidad general del modelo; es posible que la eliminación del rechazo afecte a la coherencia o la precisión en ciertas tareas.
- Riesgo de alucinación: al no tener filtros, es más probable que el modelo genere afirmaciones falsas o inventadas sobre temas delicados, lo que requiere validación externa en producción.
- Limitaciones de idioma: solo se ha documentado soporte para inglés; no hay garantía de rendimiento en otros idiomas.
- El modelo base Qwen3.6-35B-A3B incluye capacidades de visión, pero la variante abliterada no documenta explícitamente que mantenga el procesamiento de imágenes; se recomienda verificar antes de su uso multimodal.
- Restricciones de licencia: aunque la licencia es Apache-2.0, el uso del modelo para generar contenido dañino puede violar los términos de uso de la plataforma de distribución y las leyes locales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ghost-actual/DOOMED-Qwen3.6-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Guía de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Guía de Qwen 3.6-35B-A3B (aimadetools): https://www.aimadetools.com/blog/qwen-3-6-35b-a3b-complete-guide/
- Página del modelo en Vast.ai: https://vast.ai/model/qwen36-35b-a3b
- API de Doubleword: https://doubleword.ai/models/qwen3-6-35b-a3b/
