# richmondsin/grpo-posterior-no-belief-score-qwen3-vl-4b-thinking

## Resumen

`grpo-posterior-no-belief-score-qwen3-vl-4b-thinking` es un ajuste fino del modelo multimodal Qwen3-VL-4B-Thinking de Alibaba Qwen, publicado por el usuario richmondsin en Hugging Face. Se trata de un experimento de investigación sobre aprendizaje por refuerzo (RL) aplicado a un modelo visión-lenguaje: concretamente, una ablación con GRPO (Group Relative Policy Optimization) en la que se elimina la señal de recompensa asociada a la "creencia" (belief score), manteniendo únicamente la línea de creencia sin puntuación. El resultado es un modelo de 4.437.815.808 parámetros (aproximadamente 4,4 mil millones) con arquitectura Qwen3-VL y pipeline image-text-to-text.

El modelo se distribuye como un merge completo: el adaptador LoRA del entrenamiento se ha fusionado en los pesos del modelo base, de modo que no requiere cargar el adaptador por separado. Los módulos fusionados son 252, y el resto de tensores son idénticos byte a byte al modelo base. Esta ficha describe tanto las características heredadas de Qwen3-VL-4B-Thinking como las particularidades del proceso de fusión y del experimento de RL.

La relevancia de este modelo es fundamentalmente investigadora: sirve para estudiar el efecto de eliminar ciertas señales de recompensa en el entrenamiento con GRPO de modelos multimodales con modo "thinking". No obstante, al carecer de model card detallada, benchmarks publicados y licencia explícita, su uso en producción debe abordarse con cautela y verificando la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal visión-lenguaje, con modo thinking) |
| Parametros totales | 4.437.815.808 (≈4,4 B) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (pesos en bf16; el repo no documenta GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers); repo de 8,9 GB |
| Modelo base | Qwen/Qwen3-VL-4B-Thinking |
| Tipo de ajuste | LoRA fusionado (merged-lora), r=16, alpha=32, escala 2.0 |
| Módulos fusionados | 252 |
| Precisión de fusión | cálculo en fp32, almacenamiento en bf16 |
| SHA256 del adaptador | 49462ce1d07a13207fe8530f3c8d73020348a60e4438d5bfaf9e58815031f5f3 |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3-VL, un transformer multimodal que procesa imágenes y texto y que en su variante "Thinking" incorpora un modo de razonamiento extendido antes de generar la respuesta. El modelo base tiene aproximadamente 4,4 mil millones de parámetros y está diseñado para tareas de image-text-to-text, incluyendo descripción de imágenes, respuesta a preguntas visuales y razonamiento multimodal.

El ajuste se realizó mediante GRPO (Group Relative Policy Optimization), una variante de RL sin modelo crítico separado que estima ventajas relativas dentro de grupos de respuestas. La model card describe una ablación concreta: "belief line, no belief score", es decir, se mantiene la línea de creencia pero se elimina la recompensa de creencia (`line_score none: no belief reward`). Los parámetros del experimento incluyen phase 25, phase_set 300, set_keep 200 y update 50. El adaptador LoRA (r=16, alpha=32) se fusionó en los pesos con la regla `W <- W + (lora_alpha / r) * B @ A`, con escala 2.0, calculada en fp32 y almacenada en bf16. El autor verificó la fusión mediante un informe MERGE-REPORT.json: 3 módulos aleatorios dentro del redondeo bf16 de la operación, 461 tensores idénticos byte a byte y un total de bytes de tensores igual al del base (8.875.631.616 bytes). Los ficheros no relacionados con pesos (config, tokenizer, chat template, processor configs, generation config) son los del modelo base sin cambios.

## Capacidades

- Generación de texto y razonamiento multimodal: hereda las capacidades del modelo base Qwen3-VL-4B-Thinking, incluyendo razonamiento paso a paso en modo thinking.
- Comprensión de imágenes: pipeline image-text-to-text, apto para descripción, VQA y razonamiento sobre contenido visual.
- Conversación multi-turno: etiqueta `conversational` y chat template del modelo base.
- Razonamiento extendido: el sufijo "Thinking" del modelo base indica soporte de cadenas de razonamiento antes de la respuesta final.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (audio, visión adicional, etc.): solo visión, según el pipeline declarado.

## Casos de uso

- Investigación en RL para modelos multimodales: el modelo sirve como artefacto de ablación para estudiar cómo afecta eliminar la recompensa de creencia en GRPO sobre el comportamiento de razonamiento visual; se compararía con el modelo base y con variantes con belief score activo.
- Análisis de imágenes en entornos de investigación: responder preguntas sobre figuras, diagramas o capturas en cuadernos de experimentación, aprovechando el pipeline image-text-to-text.
- Reproducción de experimentos de fusión LoRA: el modelo incluye un informe de verificación de fusión (MERGE-REPORT.json) que permite validar la metodología de merge en fp32/bf16 en otros proyectos.
- Docencia y formación en RL: usar el modelo como ejemplo práctico de GRPO con LoRA y de las decisiones de diseño (r, alpha, escala) en un modelo de 4,4 B.
- Evaluación comparativa de alucinación multimodal: al ser una ablación, permite medir si la ausencia de belief reward incrementa o reduce respuestas no fundamentadas en tareas de VQA.
- Prototipado de asistentes visuales en local: con 4,4 B de parámetros y pesos safetensors, puede desplegarse en una GPU de consumo para pruebas exploratorias, siempre que se respete la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.437.815.808 parámetros, en bf16 se requieren aproximadamente 8,9 GB solo para pesos, más overhead de activaciones y caché KV; en fp16/bf16 se recomienda al menos 12-16 GB de VRAM para contexto moderado.
- Cuantización: el repo solo publica safetensors en bf16; no se documentan versiones GGUF ni cuantizaciones de 4 u 8 bits. Para reducir VRAM habría que generar cuantizaciones propias.
- GPU recomendadas: A100, H100 o L40S para despliegue con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con cuantización propia a 8 bits, potencialmente en GPUs de 12-16 GB; no se garantiza en GPUs de 8 GB sin cuantización agresiva.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están documentados para este repo, aunque al ser un modelo transformers estándar podrían ser compatibles previa conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grpo-posterior-no-belief-score-qwen3-vl-4b-thinking | ≈4,4 B | no disponible | imagen-texto | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3-VL-4B-Thinking (base) | ≈4,4 B | no disponible | imagen-texto | según Qwen (no verificada aquí) | Hugging Face |
| Qwen2.5-VL-3B / 7B | 3 B / 7 B | no disponible | imagen-texto | según Qwen (no verificada aquí) | Hugging Face |
| LLaVA-OneVision-7B | 7 B | no disponible | imagen-texto | según LLaVA (no verificada aquí) | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible porque el autor no publica benchmarks. La principal diferencia frente al base es el ajuste GRPO con ablación de belief score; frente a otros modelos visión-lenguaje de tamaño similar, la comparación queda pendiente de evaluación empírica.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe verificarse la licencia del modelo base Qwen3-VL-4B-Thinking antes de cualquier despliegue en producción.
- Sin benchmarks publicados: no hay evidencia empírica del rendimiento del ajuste frente al base; no se debe asumir mejora alguna.
- Modelo de investigación con 0 descargas y 0 likes: no ha sido validado por la comunidad.
- La fusión LoRA en bf16 puede producir diferencias numéricas ligeras respecto a la inferencia base + adaptador en tiempo de ejecución, tal como advierte el autor.
- Riesgo de alucinación: inherente a los modelos generativos multimodales; la ablación de belief score podría afectar a la calibración de las respuestas, aunque no hay datos que lo confirmen.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe más allá de lo que herede del base.
- Longitud de contexto no documentada en esta ficha: debe consultarse la configuración del modelo base.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del modelo base y los del corpus de entrenamiento del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richmondsin/grpo-posterior-no-belief-score-qwen3-vl-4b-thinking
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Thinking
