# poori/sftv4-da-ablation-11-25-2026

## Resumen

El modelo `poori/sftv4-da-ablation-11-25-2026` es un artefacto de investigación publicado en Hugging Face que documenta una ablación controlada sobre el pipeline de fine-tuning supervisado (SFT) denominado SFT-v4. Concretamente, reproduce el entrenamiento de SFT-v4 eliminando el paso de adaptación de dominio (domain adaptation, DA), de modo que el modelo base original `HuggingFaceTB/SmolLM3-3B` genera toda la guía interna que antes producía el modelo adaptado al dominio.

El propósito es aislar el efecto del componente de adaptación de dominio sobre el rendimiento final del sistema de robustez frente a ruido en recuperación (RAG). El autor mantiene idénticos los datos, escenarios, pasajes, prompts, semillas, configuración de LoRA, reglas de selección de checkpoint y el benchmark de evaluación, y solo sustituye el modelo que escribe la guía interna de las 6.023 preguntas de entrenamiento y validación.

El repositorio pesa 9,5 GB y contiene pesos en formato safetensors, junto con logs de TensorBoard. Se trata de un experimento de ablación, no de un modelo destinado a producción: no dispone de model card divulgada con licencia, idiomas o pipeline declarados, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de SmolLM3-3B) |
| Parametros totales | 3B (modelo base SmolLM3-3B); adaptadores LoRA r=8 sobre 7 proyecciones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.560 tokens (longitud maxima de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La ablación parte de `HuggingFaceTB/SmolLM3-3B` como pesos iniciales, en lugar del modelo fusionado con adaptación de dominio `poori/smollm3-3B-finetune-domain-adaptation/domain-knowledge-merged-model` que usó SFT-v4. El entrenamiento es un SFT con LoRA (r=8, alpha=8, dropout=0, 7 proyecciones, gradient checkpointing de Unsloth), precisión fp16, optimizador `adamw_torch`, learning rate 2e-5 con schedule cosine, 70 pasos de warm-up y weight decay 0,001. Se ejecutan 4 épocas, 3.068 pasos en total (767 por época), con batch de 4 por dispositivo y 8 pasos de acumulación (32 efectivos), y pérdida calculada solo sobre tokens del asistente (`train_on_responses_only`). La semilla es 3407 para entrenamiento, inicialización de LoRA y orden de datos.

El conjunto de datos consta de 24.535 filas de entrenamiento y 5.570 de validación, con las mismas filas y en el mismo orden que en SFT-v4. La evaluación y guardado se realizan cada 383 pasos, conservando 12 checkpoints y seleccionando el mejor por pérdida de validación (en v4 fue el paso 1.532). La única diferencia respecto a v4 es la procedencia de la guía interna: en esta ablación la escribe SmolLM3-3B mediante vLLM, y la etiqueta de guía (`PPL_HELPFUL` / `PPL_NOT_HELPFUL` / `NONE`) se asigna con el mismo test de NLL de respuesta pero usando SmolLM3-3B. El autor documenta verificaciones de reproducibilidad byte a byte de los archivos de datos y del pipeline de evaluación, aunque los pasos 1 y 6 no se han ejecutado en GPU.

## Capacidades

- Generación de texto y razonamiento de propósito general heredados de SmolLM3-3B.
- Generación de guía interna para preguntas de entrenamiento y evaluación en un pipeline de robustez RAG.
- Clasificación implícita de utilidad de guía mediante test de NLL de respuesta (etiquetas `PPL_HELPFUL` / `PPL_NOT_HELPFUL` / `NONE`).
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre ablación de adaptación de dominio: permite medir el impacto aislado del paso DA en un pipeline SFT, manteniendo constantes datos, prompts y configuración, para atribuir diferencias de rendimiento al componente eliminado.
- Reproducibilidad de experimentos: el autor incluye un comando de auto-test en CPU (`python step4_build_training_files.py --self-test-v4 ...`) que regenera los archivos de datos byte a byte, útil para auditar pipelines de entrenamiento.
- Estudio de robustez frente a ruido en RAG: el modelo sirve como variante de control en experimentos que evalúan abstención y rechazo incorrecto en preguntas con pasajes ruidosos.
- Docencia y formación: ejemplo documentado de configuración LoRA y de control experimental en fine-tuning supervisado con SmolLM3-3B.
- Comparación de generadores de guía interna: permite contrastar guías escritas por un modelo adaptado al dominio frente a las escritas por el modelo base, con el mismo prompt y ajustes.
- Base para reentrenamientos: al partir de `HuggingFaceTB/SmolLM3-3B`, puede reutilizarse como punto de partida para pipelines SFT alternativos sin el paso DA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona cifras del trabajo de tesis asociado (EM 51,0; abstención S6 77,8; rechazos incorrectos 2,3), pero corresponden a SFT-v4 reproducido por el script de evaluación, no a resultados de esta ablación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 3B en fp16 se requieren aproximadamente 6-7 GB solo para pesos, y más con overhead de contexto.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información; por tamaño (3B) sería plausible en GPUs con 8-12 GB o más, pero el autor no lo documenta.
- Opciones de despliegue: el autor menciona vLLM para la generación de guía interna (paso 1) y Unsloth para el entrenamiento; no se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `poori/sftv4-da-ablation-11-25-2026` | 3B | 2.560 (entrenamiento) | no disponible | Hugging Face |
| `HuggingFaceTB/SmolLM3-3B` | 3B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| `poori/smollm3-3B-finetune-domain-adaptation` (modelo fusionado DA) | 3B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de ablación experimental, no un modelo validado para producción; el autor advierte que los pasos 1 y 6 no se han ejecutado en GPU y recomienda empezar con `--pilot`.
- La licencia no está declarada, por lo que el uso comercial queda sin garantías jurídicas claras.
- No se documentan idiomas soportados ni sesgos conocidos.
- Riesgo de alucinación: no evaluado en la información disponible; el pipeline trabaja con guías internas y abstención, pero no se aportan métricas de esta variante.
- El prompt por defecto para pasajes internos (`no_explicit_answer`) es una decisión abierta del autor; la model card señala que el capítulo del método describe un prompt que pide hechos que contienen la respuesta (`--prompt-style thesis`), lo que puede afectar a la comparabilidad.
- El template de chat de SmolLM3 escribe la fecha actual en cada fila; el autor la fija a 12 de agosto de 2026 para que las filas difieran de v4 solo en la guía.
- La política de filas `match_v4` recorta pasajes por palabras si exceden 2.560 tokens, lo que puede introducir diferencias menores respecto a v4.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/poori/sftv4-da-ablation-11-25-2026
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Modelo fusionado con adaptación de dominio: https://huggingface.co/poori/smollm3-3B-finetune-domain-adaptation/domain-knowledge-merged-model
