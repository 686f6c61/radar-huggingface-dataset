# fjolsvin/hayabusa-9b-tiiny

## Resumen

Hayabusa 9B es un ajuste fino de pesos completos (full fine-tune) del modelo base `Qwen/Qwen3.5-9B`, desarrollado por el usuario `fjolsvin` (con el checkpoint original publicado por `georvn7`). El modelo está especializado en depuración de software y en la selección estructurada de acciones dentro de entornos de agente. No es un adaptador ni un LoRA: se distribuye como un checkpoint fusionado completo en BF16 para Transformers.

El repositorio que nos ocupa, `fjolsvin/hayabusa-9b-tiiny`, es un reempaquetado del checkpoint original `georvn7/hayabusa-9b` (revisión `b876c5d7dbec`) generado con la herramienta tiiny-forge. Los pesos del modelo no se han modificado; los cambios se limitan a ficheros de configuración, tokenizador y preprocesadores, además de la incorporación de 333 tensores del módulo visual del modelo base (`model.visual.*`, 0,91 GB) para que la importación en el dispositivo Tiiny Pocket acepte el modelo como un fine-tune del modelo de tienda `Qwen/Qwen3.5-9B`.

El modelo cuenta con 8.953.803.264 parámetros (aproximadamente 8,95 mil millones), un techo de contexto de entrenamiento de 32K tokens y licencia Apache-2.0. Su relevancia radica en ser un ejemplo de fine-tune verticalizado sobre una base multimodal reciente (Qwen3.5), orientado a tareas de depuración con esquemas de acción restringidos, y en incluir una verificación de despliegue en hardware de borde (Tiiny Pocket) con métricas de rendimiento publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3_5ForCausalLM / qwen3_5_text), base multimodal con módulo visual añadido en el reempaquetado |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K tokens (techo de entrenamiento, truncado por la izquierda del prompt) |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en BF16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3.5-9B) |
| Formato de pesos | safetensors (BF16, 32 shards, 427 tensores del modelo) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `qwen3_5_text` del modelo `Qwen/Qwen3.5-9B`, un transformer decoder-only. El checkpoint publicado es un full fine-tune fusionado en BF16 (no LoRA ni QLoRA), exportado con la versión de Transformers `5.3.0.dev0`. El entrenamiento se realizó con un techo de contexto de 32K tokens y truncado por la izquierda del prompt; la función de pérdida cubre únicamente el razonamiento final del asistente y el contenido, enmascarando los mensajes anteriores.

El pipeline de entrenamiento documentado incluye varias fases: SFT (supervised fine-tuning), DPO (155 actualizaciones en el Ciclo 6) y RL (289 actualizaciones), seguidas de 55 actualizaciones de SFT del profesor original. El checkpoint corresponde a la ronda 4 de recuperación del paso 3, Ciclo 6 SFT final, exportado el 27 de octubre de 2026 (identidad `34142531dc47fdad8e88a3585392c25dcd67fd64566dee96c2806fd7d81057fa`). El autor indica explícitamente que los intentos finales del paso 3 y el intento inicial del paso 4 no superaron sus presupuestos de 200 pasos, por lo que no se reclama dominio de esas pruebas. No se publican optimizador, scheduler, estado RNG, ejemplos privados de entrenamiento ni logs de ejecución.

## Capacidades

- Generación de texto especializada en contextos estructurados de depurador: código fuente, logs, trazas, resultados de tests e historial compacto de progreso.
- Selección estructurada de acciones de agente (structured agent action selection) dentro de esquemas de acción restringidos.
- Modo de razonamiento explícito (thinking mode) activable mediante `enable_thinking=True` en la plantilla de chat.
- Razonamiento multi-paso orientado a la resolución de fallos y a la elección de la siguiente acción fundamentada.
- Soporte de conversación multi-turno con plantilla de chat propia.
- Capacidad multimodal: el reempaquetado incorpora los tensores del módulo visual del modelo base, pero el autor del checkpoint original declara que las entradas de visión no están soportadas.
- No está diseñado como asistente conversacional generalista.

## Casos de uso

- Depuración automatizada de tests fallidos: el modelo recibe el código fuente, los logs de error y el resultado de los tests, y propone la siguiente acción de depuración dentro de un esquema restringido. Es adecuado porque fue entrenado específicamente con este formato de contexto estructurado.
- Agentes de resolución de incidencias en CI/CD: integrado en un pipeline que le pasa trazas y resultados de ejecución, el modelo selecciona acciones como inspeccionar un fichero, ejecutar un test concreto o aplicar un parche, gracias a su especialización en selección estructurada de acciones.
- Asistente de depuración en IDE: con 32K tokens de contexto, puede mantener el código relevante, el historial de intentos y los logs de una sesión de depuración sin perder el hilo.
- Análisis de trazas y logs largos: el techo de 32K tokens permite procesar volcados de trazas extensos y condensar el progreso en un historial compacto para la siguiente iteración del agente.
- Generación de hipótesis de causa raíz: el modo thinking permite que el modelo razone de forma explícita antes de emitir la acción, lo que facilita la auditoría del proceso de depuración.
- Despliegue en hardware de borde para asistentes de desarrollo locales: la verificación en Tiiny Pocket (TTFT 2,84 s con 3.725 tokens de prompt, prefill 1.312,8 tok/s, decode 18,1 tok/s) demuestra viabilidad en dispositivos con NPU.
- Conversión a MLX para ejecución en Apple Silicon: el repositorio incluye todos los pesos, tokenizador, plantilla de chat, configuración de generación e índice de safetensors en la raíz, lo que facilita la conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica explícitamente que las auditorías de exportación y entrenamiento son comprobaciones de integridad, no afirmaciones de calidad de comportamiento ni de dominio independiente.

Sí se publican métricas de despliegue en el dispositivo Tiiny Pocket (TiinyOS 0.1.39), probado el 17 de noviembre de 2026:

| Metrica | Valor |
|---|---|
| Resultado de smoke tests | 5/5 superados (pass) |
| Cuota de NPU | 29% |
| Tamano listado por el dispositivo | 19,0 GB |
| TTFT con 3.725 tokens de prompt | 2,84 s |
| Velocidad de prefill | 1.312,8 tok/s |
| Velocidad de decode | 18,1 tok/s |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18 GB solo para pesos (8,95B × 2 bytes), más overhead de activaciones y KV cache; el repo ocupa 18,8 GB.
- GPU recomendadas: A100 (40/80 GB), H100, o GPUs consumer con 24 GB o más (RTX 3090, RTX 4090) para BF16. Con cuantización a 8 bits o 4 bits podría caber en GPUs de 12-16 GB, aunque no se documentan cuantizaciones oficiales.
- Cabe en GPU consumer: sí, en RTX 3090/4090 (24 GB) en BF16; en GPUs de 16 GB requeriría cuantización.
- Opciones de despliegue: Transformers (documentado en la model card), conversión a MLX, y cualquier runtime compatible con safetensors de Transformers (vLLM, TGI, llama.cpp/Ollama previa conversión a GGUF, no documentada oficialmente).
- Latencia y throughput: en Tiiny Pocket, TTFT de 2,84 s y decode de 18,1 tok/s con 3.725 tokens de prompt. No se publican métricas para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hayabusa 9B (este) | 8,95B | 32K | Depuracion y acciones de agente | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible en la informacion | Generalista multimodal | Apache-2.0 | Hugging Face |
| georvn7/hayabusa-9b (original) | 8,95B | 32K | Depuracion y acciones de agente | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo con alternativas de la misma categoría. La comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo especializado en depuración y selección de acciones; no es un asistente generalista ni un release orientado a benchmarks amplios.
- Los mejores resultados requieren el contexto estructurado de runtime y el esquema de acción usados durante el entrenamiento; fuera de ese formato el rendimiento puede degradarse.
- Sigue siendo experimental para depuración autónoma de horizonte largo; los intentos finales del paso 3 y el inicial del paso 4 no superaron sus presupuestos de 200 pasos.
- Las entradas de visión no están soportadas según el autor del checkpoint original, pese a que el reempaquetado incluye los tensores del módulo visual del modelo base.
- Riesgo de alucinación no cuantificado; no se publican evaluaciones de sesgo ni de robustez.
- Soporte únicamente de inglés.
- Licencia Apache-2.0, que permite uso comercial, pero hereda las condiciones del modelo base Qwen/Qwen3.5-9B; conviene revisar el fichero LICENSE.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la comunidad.
- El reempaquetado añade tensores del modelo base no presentes en el original; aunque el autor afirma que los pesos son idénticos, conviene verificar `SHA256SUMS` y `checkpoint_provenance.json` antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fjolsvin/hayabusa-9b-tiiny
- Checkpoint original: https://huggingface.co/georvn7/hayabusa-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Informe de verificación Tiiny: https://huggingface.co/fjolsvin/hayabusa-9b-tiiny/blob/main/tiiny-verification.md
- Datos crudos de verificación: https://huggingface.co/fjolsvin/hayabusa-9b-tiiny/blob/main/tiiny-verification.json
