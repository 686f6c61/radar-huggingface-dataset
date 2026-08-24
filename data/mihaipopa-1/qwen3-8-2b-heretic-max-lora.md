# MihaiPopa-1/Qwen3.8-2B-Heretic-Max-LoRA

## Resumen

El modelo `MihaiPopa-1/Qwen3.8-2B-Heretic-Max-LoRA` es un adaptador LoRA que se aplica sobre el modelo base `empero-ai/Qwen3.8-2B-Distill`, un destilado de 2.000 millones de parámetros del modelo Qwen3.8 de 2,4 billones de parámetros. El objetivo de este adaptador es eliminar la censura y los rechazos del modelo original mediante una técnica de abliteración automática llamada Heretic v1.4.0. El resultado es un modelo "desensurado" que mantiene las capacidades de razonamiento y llamada a funciones del base, pero que reduce drásticamente el número de respuestas de rechazo (de 83/100 a 3/100).

El modelo base hereda una arquitectura híbrida con atención lineal (Gated DeltaNet) y una ventana de contexto nativa de 262.144 tokens. El adaptador LoRA es muy ligero (el repositorio ocupa 0 GB, lo que indica que solo contiene los pesos del adaptador) y se distribuye en formato `safetensors`. Está licenciado bajo Apache 2.0 y soporta únicamente el idioma inglés. Es relevante para entornos de edge (dispositivos móviles, CPU) que requieran un modelo de razonamiento y tool calling sin restricciones de contenido, aunque con las limitaciones propias de un modelo de 2B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5-2B (híbrida con atención lineal Gated DeltaNet) |
| Parámetros totales | 2.000 millones (modelo base) + adaptador LoRA (no especificado) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantización | No disponible para el adaptador; el modelo base soporta cuantización (p. ej., bf16, GGUF) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base `empero-ai/Qwen3.8-2B-Distill` es una destilación completa (full-parameter) del modelo Qwen3.8 de 2,4 billones de parámetros en la arquitectura Qwen3.5-2B. Se entrenó mediante SFT off-policy con aproximadamente 30.000 trazas de razonamiento del profesor, procedentes de un conjunto de datos de destilación interno que abarca matemáticas, razonamiento general y seguimiento de instrucciones. El resultado es un modelo que abre cada respuesta con un bloque de `thinking` (razonamiento encadenado) y que soporta función calling nativa según la especificación de Qwen3.5.

El adaptador LoRA se creó con la herramienta Heretic v1.4.0, que realiza una abliteración automática de la censura. Los parámetros de abliteración incluyen ajustes de pesos en las proyecciones de atención (`attn.o_proj`) y en el MLP (`mlp.down_proj`). Según los datos del autor, el adaptador consigue una divergencia KL de 0,0295 respecto al modelo original y reduce los rechazos de 83/100 a 3/100 en una muestra de 100 prompts.

## Capacidades

- Generación de texto con razonamiento encadenado: el modelo abre cada respuesta con un bloque ` thinking` que muestra el proceso de razonamiento, aprendido directamente de las trazas del profesor.
- Llamada a funciones (function calling) nativa según la especificación de Qwen3.5, sin necesidad de adaptadores adicionales.
- Razonamiento matemático y general: el modelo base logra un 0,640 en GSM8K (flexible) y 0,548 en MMLU con CoT, muy superior al base Qwen3.5-2B.
- Soporte de agentes multi-paso: gracias a la arquitectura Qwen3.5 y al entrenamiento con trazas del profesor, puede gestionar tareas secuenciales y de largo plazo.
- Capacidad de ejecución en entornos con recursos limitados: el modelo base en bf16 ocupa aproximadamente 4 GB, y cuantizado puede correr en teléfonos, SBC y CPU.
- Desensurado: el adaptador elimina la mayoría de las respuestas de rechazo, permitiendo generar contenido que el modelo original bloquearía.

## Casos de uso

- Asistente local en dispositivos móviles: con cuantización 4-bit, el modelo puede ejecutarse en un smartphone para proporcionar respuestas de razonamiento y generación de texto sin censura, ideal para aplicaciones de asistencia personal con privacidad.
- Generación de código con tool calling en pipelines CI/CD: el modelo soporta function calling nativo, por lo que puede integrarse en herramientas de desarrollo para autocompletar código, generar tests o documentación, y ejecutar comandos de forma segura en entornos controlados.
- Chatbots de atención al cliente sin restricciones de contenido: para empresas que necesitan que el asistente aborde temas delicados (como salud o asesoría legal) sin rechazar consultas, el modelo permite respuestas más abiertas aunque con las limitaciones de conocimiento de un modelo de 2B.
- Análisis de texto y extracción de información en el edge: con su contexto de 262K tokens, puede procesar documentos largos (informes, correos) y extraer datos estructurados, funcionando en dispositivos con pocos recursos.
- Investigación académica en alineación y desensurado: sirve como ejemplo de abliteración aplicada a un modelo destilado, útil para estudiar los efectos de la eliminación de censura en el comportamiento de modelos pequeños.
- Prototipos de agentes autónomos en dispositivos móviles: su capacidad de razonamiento encadenado y tool calling permite construir asistentes que realizan tareas multi-paso (reservar citas, enviar mensajes) sin depender de la nube.

## Benchmarks y rendimiento

La model card del modelo base (empero-ai/Qwen3.8-2B-Distill) presenta resultados de benchmarks comparativos entre el base Qwen3.5-2B y el destilado Qwen3.8-2B. No se han publicado benchmarks específicos para el adaptador LoRA `Heretic-Max`, pero se puede inferir que el rendimiento es muy cercano al del modelo base, con una divergencia KL de 0,0295.

| Tarea | Métrica | Qwen3.5-2B (base) | Qwen3.8-2B (destilado) | Δ |
|---|---|---|---|---|
| GSM8K (CoT) | exact_match (flexible) | 0,330 | **0,640** | +0,310 |
| GSM8K (CoT) | exact_match (strict) | 0,545 | **0,640** | +0,095 |
| MMLU (CoT, 57 materias) | acc (flexible-extract) | 0,283 | **0,548** | +0,265 |
| MMLU (CoT, 57 materias) | acc (strict-match) | 0,004 | **0,225** | +0,221 |

Además, el autor reporta que el modelo con el adaptador Heretic tiene un KL divergence de 0,0295 respecto al original y reduce los rechazos de 83/100 a 3/100.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en bf16 ocupa ~4 GB; con cuantización 4-bit se reduce a ~2 GB. El adaptador LoRA es muy pequeño (menos de 1 GB) y se combina con el modelo base.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., RTX 3060, RTX 4060, A10) para bf16; con cuantización puede funcionar en GPUs de 2 GB (como GTX 1650) o en CPU.
- Compatibilidad con consumer GPU: sí, especialmente en cuantización 4-bit o 8-bit. En CPU se puede ejecutar con llama.cpp o GGUF, aunque la velocidad será limitada.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, llama.cpp, Ollama, TGI. Se requiere soporte para arquitectura Qwen3.5 (kernels de Gated DeltaNet y causal_conv1d para atención lineal).
- Latencia y throughput estimados: no disponibles en la información proporcionada. En una GPU de gama media (RTX 3060) se puede esperar una generación de ~10-20 tokens/s en bf16, dependiendo de la longitud.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K (flexible) | MMLU (flexible) | Licencia | Formato |
|---|---|---|---|---|---|---|
| **Qwen3.8-2B-Heretic-Max-LoRA** | 2B + LoRA | 262K | ~0,640 (base) | ~0,548 (base) | Apache 2.0 | LoRA + safetensors |
| Qwen3.5-2B (base) | 2B | 262K | 0,330 | 0,283 | Apache 2.0 | safetensors |
| Llama-3.2-1B | 1B | 128K | no disponible | no disponible | Llama 3.2 | safetensors, GGUF |
| Gemma-2-2B | 2B | 8K | no disponible | no disponible | Gemma | safetensors, GGUF |

Los datos de Llama y Gemma no están disponibles en la información proporcionada; se incluyen solo como referencia de tamaño y contexto. El modelo LoRA se diferencia por su naturaleza desensurada y su capacidad de function calling, además de su ventana de contexto amplia.

## Limitaciones y advertencias

- El proceso de abliteración puede introducir degradación en el rendimiento (KL divergence 0,0295 respecto al original), aunque es pequeña. No se han evaluado los efectos sobre la calidad de las respuestas en tareas complejas.
- El modelo base es de solo 2B parámetros, por lo que su capacidad de razonamiento y conocimiento factual es limitada en comparación con modelos de mayor tamaño. Es propenso a alucinaciones y a errores en tareas que requieren conocimiento enciclopédico.
- El adaptador está entrenado únicamente en inglés; no soporta otros idiomas.
- El modelo desensurado puede generar contenido inapropiado, ofensivo o peligroso. El uso en producción debe ir acompañado de salvaguardas adicionales (filtros, moderación) y de una revisión legal y ética.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo desensurado.
- El despliegue requiere kernels específicos para la atención lineal (Gated DeltaNet) y causal_conv1d; sin ellos, el rendimiento se degrada significativamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MihaiPopa-1/Qwen3.8-2B-Heretic-Max-LoRA
- Modelo base (empero-ai/Qwen3.8-2B-Distill): https://huggingface.co/empero-ai/Qwen3.8-2B-Distill
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Repositorio de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Perfil del autor en Hugging Face: https://huggingface.co/MihaiPopa-1
