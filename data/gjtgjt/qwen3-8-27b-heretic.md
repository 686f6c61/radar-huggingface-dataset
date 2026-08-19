# gjtgjt/Qwen3.8-27B-heretic

## Resumen

Qwen3.8-27B-heretic es una variante del modelo oficial Qwen/Qwen3.8-27B, sometida a un proceso de abliteración mediante la herramienta Heretic v1.4.0. La abliteración consiste en modificar un subconjunto de pesos de las capas de lenguaje para eliminar o reducir los rechazos del modelo ante determinadas solicitudes, sin realizar un nuevo preentrenamiento ni un ajuste fino supervisado. El autor, gjtgjt, ha publicado este checkpoint con licencia Apache-2.0, manteniendo intactas las capacidades multimodales, el tokenizador, la plantilla de chat y los pesos de visión y MTP del modelo base.

El modelo base Qwen3.8-27B es un modelo denso de 27.400 millones de parámetros con arquitectura híbrida (48 capas Gated DeltaNet y 16 capas Gated Attention), contexto nativo de 262.144 tokens y soporte de entrada imagen-texto. La variante heretic conserva todas estas características, pero presenta una tasa de rechazo en inglés significativamente menor (27 frente a 98 por cada 100 prompts dañinos), a costa de una ligera divergencia KL de 0.0446 en prompts inofensivos. Es relevante para desarrolladores e investigadores que necesitan un modelo sin censura para casos de uso específicos, manteniendo el rendimiento general del modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida: 48× Gated DeltaNet + 16× Gated Attention) |
| Parametros totales | 27.400 millones (27.4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | BF16 (original); GGUF disponible de terceros (no especificado) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (12 shards, ~51 GB); también GGUF |

## Arquitectura y entrenamiento

El modelo no es un nuevo preentrenamiento ni un SFT. Se trata de una modificación de pesos mediante abliteración direccional parametrizada, basada en el método de Arditi et al. (2024). Heretic estima una dirección de rechazo a partir de los residuos del primer token y luego ortogonaliza las proyecciones seleccionadas contra esa dirección. En este checkpoint se modificaron los módulos `attn.o_proj` (tanto en capas Gated Attention como Gated DeltaNet) y `mlp.down_proj` en las 64 capas de lenguaje, con pesos de ablación optimizados mediante búsqueda TPE (200 trials, 60 de arranque) que minimizaba simultáneamente los rechazos en inglés sobre `mlabonne/harmful_behaviors` y la divergencia KL sobre `mlabonne/harmless_alpaca`. El trial 145 (índice de Pareto 0) se fusionó en un checkpoint BF16 completo. Los pesos de visión, MTP, embeddings y normas permanecen idénticos al modelo base.

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades del modelo base, incluyendo razonamiento multi-paso y modo thinking (activado por defecto).
- Generación de código: el modelo base está optimizado para tareas de programación; esta variante conserva dicha capacidad.
- Multimodal: acepta entrada de imagen y texto (pipeline `image-text-to-text`), aunque la calidad de visión no fue evaluada tras la abliteración.
- Multilingüe: soporta inglés y chino, aunque la reducción de rechazos solo se verificó en inglés.
- Tool calling y agentes: hereda las capacidades del base, que incluyen soporte para herramientas y tareas agénticas de largo horizonte (según documentación del base).
- Modo thinking: disponible por defecto; se puede desactivar con `enable_thinking=False` para modo instruct.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir ficción, guiones o narrativas que el modelo base podría rechazar por políticas de seguridad, útil para escritores y creadores.
- Investigación en seguridad de IA: permite estudiar cómo la abliteración afecta el comportamiento de rechazo y la alineación, comparando con el checkpoint original.
- Desarrollo de agentes en dominios sensibles: en ámbitos como medicina, derecho o educación, donde el modelo base podría ser excesivamente cauto, esta variante ofrece respuestas más directas.
- Asistente de programación: al conservar las capacidades de código del base, puede integrarse en entornos de desarrollo para generar, revisar o explicar código sin rechazos por contenido.
- Análisis de imágenes con texto: al ser multimodal, puede procesar imágenes y responder preguntas sobre ellas, aunque la calidad de visión no está verificada.
- Chat conversacional bilingüe: útil para asistentes en inglés y chino que requieran respuestas menos restrictivas en temas controvertidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única evaluación reportada es la específica de abliteración:

| Metrica | Base | Este modelo |
|---|---:|---:|
| Keywords / 100 prompts dañinos | 98 | 27 |
| KL / 100 prompts inofensivos | 0 | 0.0446 |

Además, se realizaron comprobaciones de cordura: responde `1+1` con `2`, genera una función de Fibonacci en Python correctamente y el modo thinking sigue emitiendo ` thinking… response` antes de responder.

## Requisitos de hardware

- VRAM estimada: los pesos BF16 completos ocupan aproximadamente 51 GiB, más la caché KV. Para el contexto nativo de 262K tokens, la caché KV puede superar los 20 GiB adicionales, por lo que se recomienda al menos 80 GiB de VRAM para uso completo.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 con 24 GB cada una). En consumer, una RTX 4090 (24 GB) solo puede ejecutar el modelo con cuantización GGUF de baja precisión (Q4 o inferior), aunque no se especifican tamaños exactos.
- Opciones de despliegue: Transformers (con `device_map="auto"`), vLLM, SGLang, y para GGUF, llama.cpp u Ollama. El blog de AMD confirma soporte Day 0 en AMD Ryzen AI Max y Radeon con LM Studio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo (keywords/100) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27.4B | 262K | 98 | Apache-2.0 | HuggingFace |
| Qwen3.8-27B-heretic (este) | 27.4B | 262K | 27 | Apache-2.0 | HuggingFace |
| Qwen3.8-27B-heretic-ara (de heretic-org) | 27.4B | 262K | no disponible | Apache-2.0 | HuggingFace |

La única diferencia sustancial con el base es el comportamiento de rechazo; el resto de especificaciones son idénticas. No se dispone de datos de otros modelos abliterados comparables en la información proporcionada.

## Limitaciones y advertencias

- La abliteración reduce los rechazos en inglés, pero no es una garantía de seguridad. El comportamiento en chino no fue medido.
- La calidad de visión y del bloque MTP no fue evaluada tras la modificación de pesos; podrían existir degradaciones no detectadas.
- El comportamiento en modo thinking puede diferir de los números de evaluación (que se obtuvieron con el corte instruct).
- Riesgo de alucinación inherente al modelo base, no mitigado por la abliteración.
- Requiere hardware considerable para inferencia en BF16 completo; la cuantización puede afectar la calidad.
- Licencia Apache-2.0 permite uso comercial, pero el usuario es responsable del uso que haga del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gjtgjt/Qwen3.8-27B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Paper de abliteración (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Blog de Qwen sobre Qwen3.8: https://qwen.ai/blog?id=qwen3.8
- Blog de AMD sobre ejecución en hardware AMD: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guía en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Versión GGUF de terceros: https://huggingface.co/mradermacher/Qwen-3.8-27B-Heretic-GGUF
- Variante "ara" de heretic-org: https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara
