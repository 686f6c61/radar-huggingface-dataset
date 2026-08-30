# armand0e/Muse-Glimmer-30B-Fable-Distill

## Resumen

Muse-Glimmer-30B-Fable-Distill es un fine-tune del modelo abierto Muse-Glimmer-30B de Meta, desarrollado por el usuario armand0e. El modelo base es un transformer denso multimodal de aproximadamente 30.000 millones de parámetros, diseñado para tareas agénticas locales: razonamiento multi-paso, tool calling fiable, comprensión de imágenes y recuperación ante fallos, todo en una sola GPU. Este fine-tune se entrena sobre trazas de agentes de código (Claude Code, Cursor) y chats multilingües destilados de Claude Fable 5, con el objetivo de mejorar la capacidad del modelo para seguir instrucciones agénticas y razonar en varios idiomas.

La relevancia de este modelo radica en que mantiene la arquitectura y el formato de chat originales de Muse Glimmer (formato "Onyx ATEM"), pero con pesos ajustados mediante QLoRA sobre datos de alta calidad. Al estar licenciado bajo Apache 2.0 y ser compatible con el ecosistema transformers, puede desplegarse en producción con vLLM u Ollama sin necesidad de infraestructura en la nube. El contexto nativo del modelo base alcanza 131K tokens, aunque el fine-tune se entrenó con ventanas de 24.576 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Text decoder + vision tower (ViT-G/14, ~1.8B), arquitectura muse_glimmer |
| Parámetros totales | 29.776.626.688 (~30B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 131K+ (base), 24.576 tokens en entrenamiento del fine-tune |
| Tipos de cuantización | bf16 (pesos fusionados), compatible con cuantizaciones estándar (no especificadas) |
| Idiomas soportados | en, es, fr, de, pt, ja, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer causal denso con un encoder de percepción ViT-G/14 de ~1.800 millones de parámetros, que acepta entradas interleaved de texto e imagen. El fine-tune se realizó mediante QLoRA sobre una versión cuantizada NF4 del modelo base, con LoRA de rango 32 y alpha 32 aplicado a las 416 proyecciones del decoder de texto (self_attn y mlp), lo que supone 209,6 millones de parámetros entrenables. Los pesos LoRA se fusionaron posteriormente en el modelo bf16 original, manteniendo la misma arquitectura, tokenizador y plantilla de chat.

El entrenamiento utilizó 651 ejemplos (3,62 millones de tokens) renderizados a un contexto de 24.576 tokens, con una proporción de supervisión del 40% de los tokens (se enmascaran entradas de usuario, sistema y salidas de herramientas). Se aplicó una estrategia de supervisión selectiva sobre los encabezados de enrutamiento del formato Onyx ATEM para preservar el comportamiento de razonamiento del modelo base. El entrenamiento duró 2 épocas (164 pasos) con LR 8e-5 lineal, batch 1 con grad-accum 8, optimizador paged_adamw_8bit y max_grad_norm 0.3, en una GPU de 64 GB. La pérdida del modelo base sobre estos datos en el paso 1 fue de 1.17.

## Capacidades

- Generación de texto y razonamiento multi-paso con canal de razonamiento separado (formato Onyx ATEM), controlable mediante el parámetro `reasoning_strength` (low/medium/high/xhigh).
- Comprensión multimodal: acepta imágenes interleaved con texto gracias al encoder ViT-G/14, permitiendo análisis de documentos, capturas de pantalla o diagramas.
- Tool calling nativo: genera llamadas a funciones en formato XML (`<atem:function_calls>`) y procesa resultados de herramientas en bloques `<tool_output>`.
- Capacidades agénticas: diseñado para tareas autónomas de larga duración, con recuperación ante fallos y seguimiento de instrucciones complejas.
- Multilingüe: soporta inglés, español, francés, alemán, portugués, japonés y chino, aunque el fine-tune solo tiene ~10% de tokens no ingleses.
- Compatible con el ecosistema transformers (≥ 5.15) y con vLLM mediante `--model-impl transformers`.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 131K tokens en el base) y derivar a herramientas externas (CRM, bases de conocimiento) mediante tool calling, manteniendo un canal de razonamiento para decidir la mejor respuesta.
- Generación de código en producción: las trazas de Claude Code y Cursor le permiten seguir instrucciones de edición de código, ejecutar comandos y corregir errores, integrándose en pipelines de CI/CD como agente de revisión o parcheo.
- Análisis de documentos con imágenes: al aceptar entrada visual, puede extraer información de facturas, capturas de pantalla o diagramas técnicos y responder preguntas sobre ellos, combinando texto e imagen en una sola consulta.
- Agente autónomo de investigación: con su capacidad de razonamiento multi-paso y tool calling, puede buscar en la web, consultar APIs y sintetizar informes, ejecutándose localmente en una GPU de consumo.
- Asistente de desarrollo multilingüe: al estar entrenado con chats traducidos a seis idiomas, puede dar soporte técnico a equipos internacionales sin depender de servicios en la nube.
- Automatización de tareas de oficina: puede procesar correos, generar resúmenes de reuniones a partir de transcripciones y programar acciones mediante herramientas externas, todo con razonamiento explícito y trazable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que el modelo no ha sido evaluado contra una variante de solo respuestas, y no se proporcionan métricas como MMLU, HumanEval o GSM8K. Se recomienda realizar evaluaciones propias antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, el modelo ocupa aproximadamente 60 GB (el repositorio pesa 59,6 GB). Con cuantización Q4, podría caber en ~16-18 GB; con Q8, en ~32 GB.
- GPU recomendadas: para bf16 completo se necesita una GPU con 64 GB o más (A100 80GB, H100). Para cuantización Q4, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente. El entrenamiento se realizó en una GPU de 64 GB.
- Opciones de despliegue: vLLM (con `--model-impl transformers` y sin parsers de razonamiento/tool stock), Ollama (el modelo base está disponible en ollama.com/library/muse-glimmer), llama.cpp para cuantización GGUF, y TGI.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 30B en bf16 en una A100, se puede esperar un throughput de decodificación de ~20-40 tokens/s dependiendo de la configuración; con cuantización Q4 en una RTX 4090, ~10-20 tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Tool calling | Licencia |
|---|---|---|---|---|---|
| Muse-Glimmer-30B (base) | ~30B | 131K+ | Sí (ViT-G/14) | Sí (nativo) | Apache 2.0 |
| Muse-Glimmer-30B-Fable-Distill (este) | ~30B | 131K+ (base) | Sí | Sí (mejorado en trazas agénticas) | Apache 2.0 |
| Qwen 2.5 32B (referencia) | ~32B | 128K | No (texto) | Sí | Apache 2.0 (Qwen) |

La comparativa con Qwen 2.5 32B es orientativa; no se dispone de datos de rendimiento directos. La principal diferencia frente al base es el ajuste fino con datos de agentes de código y chats multilingües, que puede mejorar la adherencia a instrucciones agénticas, aunque no está cuantificado.

## Limitaciones y advertencias

- El contenido no inglés representa solo ~10% de los tokens de entrenamiento, por lo que el rendimiento en español, francés, alemán, portugués, japonés y chino puede ser inferior al inglés.
- El modelo no ha sido evaluado contra una variante de solo respuestas, por lo que se desconoce si el canal de razonamiento añade valor real o solo latencia.
- Al ser un merge de QLoRA sobre pesos NF4, el modelo final no es bit-idéntico a lo que el entrenamiento vio; puede haber pequeñas diferencias en el comportamiento.
- El formato de chat Onyx ATEM no es compatible con los parsers de razonamiento o tool calling estándar de vLLM (gptoss, hermes, etc.). Usar parsers stock puede provocar errores de parseo; se recomienda servir sin parsers o con plugins personalizados.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento multi-paso; se recomienda validar las salidas con herramientas externas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y este fine-tune pueden tener restricciones adicionales no documentadas; se recomienda revisar los términos de Meta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/armand0e/Muse-Glimmer-30B-Fable-Distill
- Adapter LoRA publicado: https://huggingface.co/armand0e/Muse-Glimmer-30B-Fable-Distill-LoRA
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Página de Meta sobre Muse Glimmer: https://developer.meta.com/ai/models/muse-glimmer/
- Model card en NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- Página en Ollama: https://ollama.com/library/muse-glimmer:30b
- API y playground en Fireworks AI: https://fireworks.ai/models/fireworks/muse-glimmer-30b
