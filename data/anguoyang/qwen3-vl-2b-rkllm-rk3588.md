# anguoyang/qwen3-vl-2b-rkllm-rk3588

## Resumen

Este repositorio contiene artefactos convertidos de Qwen3-VL-2B-Instruct para su ejecución en la NPU Rockchip RK3588. El autor, anguoyang, publica dos ficheros: un codificador visual en formato RKNN (`qwen3-vl_vision_rk3588.rknn`, 852 MB) y el modelo de lenguaje en formato RKLLM cuantizado W8A8 (`qwen3-vl-2b_w8a8_rk3588.rkllm`, 2,37 GB). No se redistribuyen los pesos originales; el modelo base es Qwen/Qwen3-VL-2B-Instruct, publicado por el equipo Qwen bajo licencia Apache-2.0.

El interés del repositorio es doble. Por un lado, demuestra que la exportación del LLM a RKLLM con rkllm-toolkit 1.3.1 finaliza correctamente (Optimizing 28/28), a diferencia de Qwen2-VL-2B, que fallaba por `mrope_section`. Por otro, documenta una medición independiente end-to-end sobre una placa RK3588 real: 24 preguntas, 19 correctas, 2 erróneas y 3 incompletas por el límite de 128 tokens de generación.

La relevancia práctica es que ofrece una ruta reproducible para ejecutar un VLM de 2B parámetros en hardware de bajo consumo (NPU de 6 TOPS en tres núcleos), con codificación visual en 2,23 s de mediana y 10,44 s de tiempo total por pregunta. Incluye advertencias críticas sobre el demo oficial de Rockchip, que degrada silenciosamente a modo texto si la pregunta no contiene el token `<image>`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision encoder + LLM decoder); estructura DeepStack en el codificador visual |
| Parametros totales | 2B (modelo base Qwen3-VL-2B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A8 (pesos y activaciones a 8 bits) para el LLM; RKNN para el vision encoder |
| Idiomas soportados | no disponible en el repo; el modelo base Qwen3-VL-2B-Instruct es multilingue |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | RKNN (vision) y RKLLM (LLM); no se incluyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3-VL-2B-Instruct es un transformer multimodal que combina un codificador visual con un decoder de lenguaje. En esta conversión, el codificador visual se exporta a ONNX con transformers 4.57.3 y luego a RKNN con rknn-toolkit2 2.3.2, usando normalización 0,5/0,5 conforme al preprocessor config. El LLM se convierte a RKLLM con rkllm-toolkit 1.3.1 en modo W8A8 sobre tres núcleos NPU, con 20 muestras de calibración generadas mediante `make_input_embeds_for_quantize.py` con `--model_type qwen3vl`.

Una particularidad técnica relevante es la estructura DeepStack del codificador visual de Qwen3-VL: produce cuatro salidas (la característica final más las características intermedias de las capas 5, 11 y 17), no una sola. El demo oficial concatena las cuatro por token antes de alimentar al LLM. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO; esos datos corresponden a la model card de Qwen y no se recogen en este repositorio.

## Capacidades

- Generación de texto y razonamiento multimodal: responde preguntas sobre imágenes adjuntas.
- Comprensión de imágenes: el codificador visual procesa entradas de 448×448.
- OCR y lectura de texto en imágenes: en la evaluación, acertó una pregunta de OCR de rótulo de tienda y el total de un recibo (57,30).
- Razonamiento visual básico: conteo de objetos (falló en contar 7 círculos rojos y 3 cuadrados azules).
- Conversación multi-turno en modo texto cuando no se adjunta imagen (comportamiento del demo, no del modelo).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: el subconjunto chino de la evaluación (3/4) sugiere soporte de chino; el resto de idiomas no está documentado en este repo.

## Casos de uso

- Despliegue de un VLM en dispositivos embebidos con NPU Rockchip RK3588: el repositorio proporciona los artefactos RKNN y RKLLM listos para cargar en la placa, con lo que se evita el proceso de conversión y se puede integrar directamente en el runtime de Rockchip.
- Inspección visual en el borde (edge computing): con 2,23 s de codificación visual y 10,44 s por pregunta, es adecuado para tareas de verificación visual no interactivas, como revisión de imágenes en lotes o monitorización periódica.
- OCR en entornos con conectividad limitada: el modelo respondió correctamente a preguntas de rótulos y totales de recibos, lo que permite usarlo en terminales de punto de venta o inventario sin enviar imágenes a la nube.
- Prototipado de asistentes visuales de bajo coste: al ocupar 2,4 GB en disco y ejecutarse en una NPU de 6 TOPS, sirve para validar flujos de pregunta-respuesta sobre imagen antes de invertir en hardware mayor.
- Reproducción de medidas y validación de pipelines de conversión: el repo incluye `measurements.json`, logs y veredictos por pregunta, útiles para comparar el rendimiento de RKLLM frente a otras rutas (ONNX Runtime, llama.cpp) en la misma placa.
- Evaluación comparativa de versiones de Qwen-VL en hardware Rockchip: el autor contrasta los 2.232 ms de Qwen3-VL-2B con los 4.445 ms de Qwen2-VL-2B en la misma placa y a mayor resolución, lo que facilita decisiones de actualización.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Codificacion visual (mediana) | 2.232,26 ms (rango 2.222,13–2.296,77 ms) |
| Carga del modelo visual | 1.177,15 ms |
| Entrada de imagen | 448×448 |
| Comparacion con Qwen2-VL-2B (misma placa) | 4.445,68 ms (Qwen3-VL-2B es ~2× mas rapido) |
| Exportacion LLM | Exito al primer intento, rkllm-toolkit 1.3.1, W8A8, Optimizing 28/28 |
| Evaluacion end-to-end (24 preguntas) | 19 correctas, 2 erroneas, 3 incompletas |
| Subconjunto MMBench | 16/20 |
| Subconjunto chino | 3/4 |
| Tiempo total por pregunta (mediana) | 10,44 s (incluye carga ~2,4 s y vision ~2,3 s) |
| Limite de generacion | 128 tokens |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- NPU objetivo: Rockchip RK3588 con tres núcleos NPU (6 TOPS en total).
- Memoria: el repo ocupa 2,4 GB; el LLM W8A8 pesa 2,37 GB y el codificador visual RKNN 852 MB, por lo que se necesita al menos ~3,5 GB de RAM disponible para cargar ambos artefactos.
- Sistema operativo probado: Ubuntu 22.04.5 con librknnrt 2.3.2.
- No cabe en GPU consumer convencional mediante este formato: los artefactos RKNN/RKLLM son específicos de la NPU Rockchip y no se ejecutan en CUDA.
- Opciones de despliegue: runtime RKLLM de Rockchip y `multimodal_model_demo` oficial; no se documentan vLLM, llama.cpp, Ollama ni TGI para estos artefactos.
- Latencia y throughput: 10,44 s de mediana por pregunta end-to-end en la configuración medida; no se reporta throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en RK3588 | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-VL-2B (este repo) | 2B | no disponible | Vision 2.232 ms; 19/24 correctas | Apache-2.0 | RKNN + RKLLM W8A8 |
| Qwen2-VL-2B | 2B | no disponible | Vision 4.445,68 ms (misma placa) | no disponible en esta fuente | conversion a RKLLM fallaba en `mrope_section` |
| Qwen3-VL-2B-Instruct (original) | 2B | no disponible | no aplica (no optimizado para NPU) | Apache-2.0 | safetensors |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El demo oficial de Rockchip degrada silenciosamente a modo texto si la pregunta no contiene literalmente `<image>`; hay que prefijar cada pregunta con `<image> ` o se medirá un modelo de texto, no un VLM.
- El codificador visual produce cuatro salidas (DeepStack: capa final más capas 5, 11 y 17); alimentar solo una de ellas produce resultados incorrectos.
- El límite de generación de 128 tokens provocó 3 respuestas incompletas en la evaluación; para respuestas largas hay que aumentarlo.
- El conteo de objetos falló en la prueba (7 círculos rojos y 3 cuadrados azules), lo que indica debilidades en razonamiento visual fino.
- El fichero `data/inputs.json` del demo venía con datos de calibración de Qwen2-VL; debe sustituirse por el `llm_inputs.json` generado para Qwen3-VL antes de exportar.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni restricciones adicionales de licencia más allá de la Apache-2.0 del modelo base.
- Los artefactos están atados a la NPU RK3588 y a versiones concretas de las herramientas (rknn-toolkit2 2.3.2, rkllm-toolkit 1.3.1, librknnrt 2.3.2); otras versiones pueden requerir reconversión.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no hay validación comunitaria adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/anguoyang/qwen3-vl-2b-rkllm-rk3588
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Ficheros de medición citados en la model card: `measurements.json` (incluido en el repo)
