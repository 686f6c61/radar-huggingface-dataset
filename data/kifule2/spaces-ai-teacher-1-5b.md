# Kifule2/spaces-ai-teacher-1-5b

## Resumen
Kifule2/spaces-ai-teacher-1-5b es un adaptador LoRA publicado en Hugging Face por el usuario Kifule2, construido sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Se distribuye como repositorio PEFT (librería `peft`, versión de framework 0.21.2) con pesos en formato safetensors y no incluye pesos completos del modelo base, sino únicamente los del adaptador. El nombre sugiere un ajuste orientado a un caso de uso de "profesor con IA" (AI teacher), aunque la model card no documenta el dataset, el procedimiento ni los objetivos de entrenamiento.

El modelo hereda las características del Qwen2.5-1.5B-Instruct: un transformer decoder-only de 1.500 millones de parámetros con capacidades de instrucción, tool calling y contexto largo. Sin embargo, el adaptador en sí no aporta información verificable sobre su comportamiento final: la model card es la plantilla por defecto de Hugging Face con todos los campos marcados como "[More Information Needed]". El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos del adaptador podrían no estar efectivamente subidos o son de tamaño despreciable.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigación sin documentación, sin licencia declarada y sin métricas. Se incluye aquí por completitud del catálogo, pero no se recomienda su uso en producción sin una auditoría previa del adaptador y de los pesos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.500 millones (modelo base); parámetros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens (dato del modelo base, no confirmado en este repo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento
El artefacto es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo Qwen2.5-1.5B-Instruct, que es un transformer decoder-only con atención causal estándar, 1.500 millones de parámetros y entrenamiento de instrucción por parte de Alibaba Qwen. El adaptador se carga mediante la librería `peft` (versión 0.21.2 según la model card) y se aplica sobre las capas del modelo base; no se especifica el rango (rank), alpha, módulos objetivo ni la estrategia de congelación.

No hay información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, el uso de RLHF/DPO o cualquier innovación técnica. La model card no documenta hiperparámetros, régimen de precisión (fp16, bf16, etc.) ni infraestructura de cómputo. El tag `arxiv:1910.09700` corresponde a la referencia genérica del calculador de impacto de ML (Lacoste et al., 2019) que aparece en la plantilla por defecto, no a un paper del modelo.

## Capacidades
- Generación de texto e instrucción: hereda las capacidades del Qwen2.5-1.5B-Instruct (razonamiento básico, respuesta a instrucciones, código y matemáticas a nivel de modelo pequeño).
- Tool calling / function calling: el modelo base Qwen2.5-Instruct soporta llamadas a herramientas; no se confirma que el adaptador preserve esta capacidad.
- Razonamiento multi-paso y agentes: no documentado en el adaptador; el modelo base tiene capacidades limitadas por su tamaño.
- Multilingüismo: no documentado en el adaptador; el modelo base Qwen2.5 soporta varios idiomas, pero no se especifica cuáles en este repo.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Ajuste específico "AI teacher": el nombre sugiere un fine-tuning para tutoría o enseñanza, pero no hay evidencia documentada de ello.

## Casos de uso
- Prototipado de tutores educativos: el adaptador podría emplearse como punto de partida para un asistente de enseñanza, pero requiere validación empírica previa, ya que no hay documentación del ajuste ni evaluación de calidad.
- Experimentación con PEFT: útil como ejemplo de cómo se estructura un adaptador LoRA sobre Qwen2.5-1.5B-Instruct para investigadores que quieran inspeccionar la configuración o reutilizar el pipeline de carga con `peft`.
- Fine-tuning incremental: si los pesos del adaptador están efectivamente presentes, podría servir como inicialización para un ajuste posterior orientado a dominio educativo.
- Despliegue en entornos con recursos limitados: al ser un adaptador sobre un modelo de 1.5B, el conjunto es ligero y podría ejecutarse en GPU de consumo, siempre que se valide primero la calidad del adaptador.
- Evaluación comparativa de adaptadores: como referencia negativa o de control en estudios sobre calidad de adaptadores publicados sin documentación.
- Docencia y formación: útil para ilustrar buenas y malas prácticas en la publicación de model cards (este repo es un ejemplo de plantilla sin rellenar).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia del modelo base en fp16: aproximadamente 3 GB (1.5B parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1.5-2 GB; en 4 bits: aproximadamente 1-1.5 GB (estimaciones para el modelo base, no confirmadas para el adaptador).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para cuantización 4 bits, cabe en GPUs de 2-4 GB o incluso en CPU con llama.cpp.
- Cabe en GPU de consumo: sí, el modelo base de 1.5B es apto para GPUs de consumo; el adaptador añade un overhead mínimo.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador sobre el modelo base), vLLM (si se fusiona el adaptador), llama.cpp/Ollama (requiere convertir y fusionar el adaptador a GGUF), TGI (con soporte de adaptadores PEFT).
- Latencia y throughput: no disponibles para este adaptador; el modelo base Qwen2.5-1.5B-Instruct tiene throughput alto en GPUs modernas, pero no se aportan cifras específicas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Documentacion |
|---|---|---|---|---|---|
| Kifule2/spaces-ai-teacher-1-5b | 1.5B (base) + adaptador LoRA | no disponible (base: 32k) | no disponible | safetensors (PEFT) | Plantilla sin rellenar |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens | Apache 2.0 (modelo base) | safetensors | Model card completa |
| Qwen/Qwen2.5-1.5B | 1.5B | 32.768 tokens | Apache 2.0 | safetensors | Model card completa |
| Adaptadores LoRA públicos sobre Qwen2.5-1.5B | Variable | Variable | Variable | safetensors (PEFT) | Variable |

La comparativa se limita al modelo base y a otros adaptadores genéricos, ya que no hay información suficiente para comparar rendimiento con alternativas específicas de la misma tarea.

## Limitaciones y advertencias
- Model card sin documentar: todos los campos relevantes (datos, entrenamiento, evaluación, licencia, idiomas) están marcados como "[More Information Needed]".
- Licencia no declarada: no se puede determinar si el uso comercial está permitido; el modelo base Qwen2.5-1.5B-Instruct es Apache 2.0, pero el adaptador no especifica licencia.
- Sin benchmarks ni evaluación: no hay evidencia de que el adaptador mejore o preserve las capacidades del modelo base.
- Riesgo de alucinación: heredado del modelo base, agravado por la falta de evaluación del ajuste.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset de ajuste (desconocido).
- Tamaño del repo 0.0 GB: posible que los pesos del adaptador no estén efectivamente subidos o sean de tamaño despreciable; verificar antes de usar.
- Sin descargas ni likes: no hay señal de uso o validación por parte de la comunidad.
- Fecha de creación futura (2026-11-06): inconsistencia temporal que sugiere metadatos erróneos o un artefacto de prueba.
- No apto para producción sin auditoría previa: se recomienda inspeccionar los pesos, la configuración PEFT y realizar una evaluación propia antes de cualquier despliegue.

## Enlaces
- Hugging Face: https://huggingface.co/Kifule2/spaces-ai-teacher-1-5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Referencia del calculador de impacto (arxiv:1910.09700): https://arxiv.org/abs/1910.09700
- Documentación de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
