# allura-forge/Qwen3.8-27B-Jabliterated-k1024-LoRA

## Resumen

El modelo `allura-forge/Qwen3.8-27B-Jabliterated-k1024-LoRA` es un adaptador LoRA de rango 1024 diseñado para el modelo base `Qwen/Qwen3.8-27B`, un LLM multimodal denso de 27 000 millones de parámetros desarrollado por el equipo Qwen de Alibaba. El adaptador aplica la técnica de "abliteración" (abliteration), que consiste en eliminar direcciones específicas en el espacio de activaciones del modelo asociadas con comportamientos de rechazo o alineación de seguridad, dando como resultado una versión "sin censura" (uncensored) del modelo original. Los tags `heretic`, `uncensored` y `decensored` confirman esta intención.

El modelo base Qwen3.8-27B es un transformer denso con entrada nativa de imagen y texto, contexto de 262 144 tokens, decodificación MTP (Multi-Token Prediction) y licencia Apache 2.0. El adaptador, con un tamaño de repositorio de 0,3 GB, se distribuye en formato safetensors y está pensado para ser cargado sobre el modelo base mediante la librería PEFT. Aunque el adaptador no modifica la arquitectura subyacente, sí altera el comportamiento del modelo en términos de rechazo de contenido, lo que lo hace relevante para aplicaciones que requieren generación sin restricciones, como investigación sobre alineación, creación de ficción o roleplay avanzado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 1024) sobre Qwen3.8-27B (transformer denso multimodal) |
| Parametros totales | No disponible (el adaptador pesa 0,3 GB; el modelo base tiene 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (heredado del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero no se especifica para el adaptador) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica de abliteración, un método de modificación de pesos que identifica y elimina direcciones en el espacio de activaciones del modelo que correlacionan con comportamientos de rechazo o negativa a responder. A diferencia de un fine-tuning tradicional, la abliteración no requiere datos de entrenamiento supervisado; opera directamente sobre los pesos del modelo base. El nombre "Jabliterated" sugiere una variante específica de esta técnica, posiblemente combinada con un rango LoRA de 1024 para preservar la mayor parte de las capacidades originales del modelo.

El modelo base Qwen3.8-27B es un transformer denso con atención multimodal, entrenado con un dataset que incluye texto e imágenes, y optimizado para tareas de coding, agentes y automatización de oficina. Incorpora decodificación MTP (Multi-Token Prediction) que mejora la velocidad de inferencia. No se dispone de información sobre el dataset específico utilizado para entrenar el adaptador, ni sobre si se emplearon técnicas como RLHF o DPO en el proceso de abliteración.

## Capacidades

- Generación de texto sin restricciones de contenido: el adaptador elimina los rechazos típicos de seguridad, permitiendo respuestas sobre temas que el modelo base normalmente bloquearía.
- Multimodalidad heredada: al estar basado en Qwen3.8-27B, el modelo puede procesar entradas de imagen y texto, y generar respuestas textuales.
- Razonamiento y resolución de problemas: conserva las capacidades de razonamiento lógico y matemático del modelo base.
- Generación de código: el modelo base destaca en tareas de programación, y el adaptador no degrada significativamente esta capacidad.
- Soporte de tool calling y agentes: el modelo base está optimizado para flujos agénticos, y el adaptador mantiene esta funcionalidad.
- Capacidades multilingües: aunque no se especifica para el adaptador, el modelo base soporta múltiples idiomas.

## Casos de uso

- Investigación sobre alineación y seguridad de IA: el adaptador permite estudiar cómo la abliteración afecta al comportamiento del modelo, comparando respuestas con y sin restricciones en entornos controlados.
- Generación de ficción y roleplay avanzado: al no tener rechazos, el modelo puede explorar tramas, diálogos y escenarios que los modelos alineados evitarían, útil para escritores creativos.
- Creación de contenido para adultos: el modelo puede generar texto explícito o sensible, aunque debe usarse con responsabilidad y cumpliendo la legislación aplicable.
- Automatización de atención al cliente sin filtros: en contextos donde se requiere respuestas directas sin evasivas, el adaptador puede gestionar conversaciones sin rechazar preguntas incómodas.
- Desarrollo de asistentes personales personalizados: usuarios que desean un asistente sin restricciones morales predefinidas pueden integrar el adaptador en sus aplicaciones.
- Evaluación de robustez de modelos: los investigadores pueden usar este adaptador para probar la eficacia de técnicas de desalineación y sus implicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el adaptador `Jabliterated-k1024-LoRA`. Los datos disponibles corresponden al modelo base Qwen3.8-27B, que reporta los siguientes resultados en tareas de agente y visión:

| Benchmark | Resultado (modelo base) |
|---|---|
| DeepSWE | 42,2 |
| Terminal Bench | 73,0 |
| OSWorld | 84,3 |

Estos valores son orientativos de las capacidades subyacentes, pero no reflejan el impacto del adaptador. No se dispone de métricas como MMLU, HumanEval o GSM8K para esta variante.

## Requisitos de hardware

- El adaptador LoRA añade aproximadamente 0,3 GB al peso del modelo base, por lo que el requisito principal viene determinado por el modelo Qwen3.8-27B.
- Para inferencia en cuantización Q4, el modelo base ocupa unos 17,8 GB, lo que permite ejecutarlo en GPUs con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A5000) o en Mac con 24 GB de memoria unificada.
- En GPUs de 16 GB (como RTX 4080) se podría ejecutar con cuantizaciones más agresivas (Q3 o Q2), aunque con pérdida de calidad.
- El adaptador se puede cargar con librerías PEFT (Hugging Face) sobre el modelo base en frameworks como vLLM, TGI o llama.cpp (si se convierte a GGUF).
- Se ha medido un rendimiento de 24,5 tokens por segundo en AMD Ryzen AI Max+ 395 con el modelo base en Q4, lo que da una referencia de velocidad en hardware de gama media-alta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | Multimodal alineado |
| allura-forge/Qwen3.8-27B-Jabliterated-k1024-LoRA | 27B + LoRA | 262K | Apache 2.0 | Abliterado, sin censura |
| allura-forge/Qwen3.8-27B-Dominatrix-LoRA | 27B + LoRA | 262K | Apache 2.0 | Adaptador SFT+DPO concatenado |

No se dispone de comparativas con otros modelos abliterados de la misma categoría (por ejemplo, versiones de Llama 3 o Mistral). La principal diferencia con el modelo base es la eliminación de rechazos de seguridad, mientras que el rendimiento en tareas técnicas se mantiene prácticamente intacto.

## Limitaciones y advertencias

- Al ser un modelo sin censura, puede generar contenido ofensivo, ilegal, peligroso o éticamente cuestionable. El usuario es responsable del uso que haga del modelo.
- La abliteración puede degradar ligeramente la coherencia en algunos dominios, aunque no hay datos cuantitativos al respecto.
- No se ha evaluado el sesgo del adaptador; el modelo base puede presentar sesgos de género, raza o ideología que la abliteración no corrige.
- Riesgo de alucinación: como cualquier LLM, puede inventar información, especialmente en temas de actualidad o datos específicos.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar leyes de propiedad intelectual, difamación o regulaciones de contenido en ciertos países.
- El adaptador no incluye instrucciones de uso ni documentación técnica detallada; se recomienda revisar el repositorio del modelo base para conocer las limitaciones originales.

## Enlaces

- [HuggingFace - allura-forge/Qwen3.8-27B-Jabliterated-k1024-LoRA](https://huggingface.co/allura-forge/Qwen3.8-27B-Jabliterated-k1024-LoRA)
- [GitHub - AlibabaCloud-Official/Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Guía completa de Qwen3.8-27B (2026)](https://lovableapp.org/blog/qwen3-8-27b)
- [Guía para ejecutar Qwen3.8-27B localmente](https://modelfit.io/blog/run-qwen38-27b-locally-2026/)
- [Cómo ejecutar Qwen 3.8 27B en tu propio ordenador](https://lu-labs.ai/blog/how-to-run-qwen-3-8-27b-locally)
