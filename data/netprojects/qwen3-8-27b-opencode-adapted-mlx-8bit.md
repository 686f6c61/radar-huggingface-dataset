# netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit

## Resumen

Qwen3.8-27B-opencode-adapted-MLX-8bit es una conversión a formato MLX y cuantización a 8 bits del modelo harness-hub/Qwen3.8-27B-opencode-adapted, un ajuste fino mediante aprendizaje por refuerzo (AsyncGRPO en TRL) del modelo base Qwen/Qwen3.8-27B. El objetivo del adaptador es convertir al modelo en el motor detrás del agente de programación OpenCode, especializándolo en tareas de ingeniería de software y operaciones de terminal. Esta build concreta, publicada por el usuario netprojects, está pensada para ejecutarse en Apple Silicon mediante la librería mlx-vlm, incluyendo el codificador de visión y la capa de predicción multi-token (MTP) de Qwen.

El modelo cuenta con 27.781.427.952 parámetros totales (aproximadamente 27,8 mil millones) y se distribuye en un repositorio de 30,0 GB. La cuantización es afín de 8 bits con grupo de tamaño 64 aplicada a las capas lineales, lo que según el autor preserva el 99,2 % de los mismos tokens siguientes que la versión bf16, con una divergencia KL de 0,0004. La licencia es Apache 2.0 y el pipeline declarado es image-text-to-text, lo que refleja que el modelo conserva capacidad multimodal de entrada (imagen y texto).

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar localmente en Mac un agente de código con capacidades de razonamiento y uso de herramientas, con mejoras publicadas sobre el modelo base en SWE-bench Pro (hard 51) y Terminal-Bench 2.1, y con aceleración de decodificación mediante MTP o el drafter DSpine. No obstante, la información disponible sobre idiomas soportados, arquitectura interna detallada y benchmarks propios de esta build es limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capa MTP; detalles internos no disponibles |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits afín, grupo 64 (esta build); el autor publica también 3, 4, 6 bits, bf16 y adaptador LoRA |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `model-mtp.safetensors` para la capa MTP |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, del que esta build hereda la arquitectura y el tokenizador. Sobre él se aplicó el adaptador harness-hub/Qwen3.8-27B-opencode-adapted, entrenado con aprendizaje por refuerzo mediante AsyncGRPO en TRL para optimizar el comportamiento como agente de programación en OpenCode. La conversión a MLX se realizó con mlx-vlm e incluye el codificador de visión y la capa de predicción multi-token (MTP) original de Qwen, cuantizada de forma coherente con el resto de la build. El adaptador no modifica la capa MTP, por lo que esta sigue siendo la cabeza MTP original de Qwen.

La innovación técnica destacable es la conservación de la capa MTP como modelo borrador integrado para decodificación especulativa: al pasar el mismo repositorio como `--draft-model` con `--draft-kind mtp`, mlx-vlm la usa para acelerar la decodificación aproximadamente 2,1 veces sin descarga adicional. También es compatible con el drafter DSpine (netprojects/Qwen3.8-27B-DSpine-b16-MLX) a través de dspine-hybrid-mlx. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni detalles del proceso de RLHF/DPO más allá de la mención a AsyncGRPO.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.8-27B.
- Capacidad multimodal de entrada: procesa imágenes junto con texto (pipeline image-text-to-text), útil para interpretar capturas de pantalla o salidas de terminal.
- Agente de programación: entrenado específicamente para tareas de ingeniería de software y operaciones de terminal en el agente OpenCode.
- Uso de herramientas (tool calling): emplea el formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Razonamiento multi-paso orientado a agentes, con modo "thinking" desactivable; el adaptador fue entrenado y evaluado con thinking desactivado.
- Decodificación especulativa mediante MTP integrado o drafter DSpine para reducir latencia.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de código local en Mac: servir el modelo con `mlx_lm.server` y conectarlo a OpenCode mediante configuración OpenAI-compatible, permitiendo que el agente resuelva tareas de reparación de tests, refactorización y edición de ficheros sin salir del equipo.
- Depuración de fallos en tests: el modelo puede recibir el contenido de `tests/test_parser.py` y el código relevante para localizar y corregir el bug, un escenario que el propio autor documenta como ejemplo de uso.
- Automatización de operaciones de terminal: dado su entrenamiento en Terminal-Bench, puede interpretar salidas de comandos y proponer secuencias de shell para tareas de mantenimiento o diagnóstico.
- Análisis de capturas de pantalla de terminal: gracias a la entrada de imagen, puede responder preguntas como "¿qué error muestra esta terminal?" a partir de una captura, útil en soporte técnico interno.
- Integración en pipelines de CI/CD locales: al exponer una API compatible con OpenAI, puede integrarse en scripts de revisión de código o generación de parches ejecutados en máquinas Apple Silicon.
- Asistente de programación en el editor: conectado a OpenCode, actúa como copiloto para escribir funciones, explicar código y generar pruebas unitarias con thinking desactivado para minimizar latencia y consumo de tokens.
- Experimentación con decodificación especulativa: sirve como banco de pruebas para medir aceleraciones con MTP y DSpine en hardware Apple Silicon.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador, medidos con OpenCode y thinking desactivado, frente al modelo base:

| Benchmark | Base | Adaptador |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3 % | 51,0 % |
| Terminal-Bench 2.1 | 46,4 % | 52,4 % |

Fidelidad de la cuantización respecto a bf16, según el autor:

| Build | Tamaño | Mismos tokens siguientes que bf16 | KL vs bf16 |
|---|---|---|---|
| 6 bits (recomendada) | 23,1 GB | 98,7 % | 0,0014 |
| 8 bits (esta build) | 30,0 GB | 99,2 % | 0,0004 |
| 4 bits | 16,3 GB | 96,7 % | 0,0203 |
| 3 bits | 13,8 GB | 93,4 % | 0,0812 |

Rendimiento de decodificación medido por el autor (greedy, thinking off, 5 prompts × 256 tokens, con otros servicios en el Mac; valores indicativos):

| Build | Sin aceleración | MTP (mlx-vlm 0.7.11) | DSpine v0.2.1 (drafter 4 bits, bloque 5) |
|---|---|---|---|
| 4 bits | 33 tok/s | 62 tok/s (×1,91) | 73 tok/s (×2,29) |
| 6 bits | 20 tok/s | 21 tok/s (×1,04) | 60 tok/s (×2,72) |
| 8 bits | 17 tok/s | 37 tok/s (×2,15) | 54 tok/s (×3,03) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K u otros benchmarks generales para esta build concreta.

## Requisitos de hardware

- VRAM/unified memory estimada: 30,0 GB de pesos en esta build de 8 bits; se recomienda un Mac con al menos 32 GB de memoria unificada, y preferiblemente 36 GB o más para dejar margen al contexto y al codificador de visión.
- GPU recomendadas: Apple Silicon (M-series) con memoria unificada suficiente; el modelo está empaquetado para MLX y no para CUDA.
- ¿Cabe en GPU consumer? Sí, en Macs con memoria unificada de 32 GB o superior; el autor indica que la build de 3 bits cabe en Macs de 24 GB y recomienda la de 6 bits (23,1 GB) como equilibrio.
- Opciones de despliegue: mlx-lm (servidor compatible con OpenAI, `mlx_lm.server`), mlx-vlm para entrada multimodal, y OpenCode como cliente. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta build.
- Latencia y throughput: aproximadamente 17 tok/s en decodificación simple para la build de 8 bits, 37 tok/s con MTP y 54 tok/s con DSpine, según mediciones indicativas del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit | 27,8 B | no disponible | Apache 2.0 | safetensors MLX | Esta ficha; 8 bits, 30,0 GB |
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit | 27,8 B | no disponible | Apache 2.0 | safetensors MLX | Recomendada por el autor; 23,1 GB, 98,7 % de fidelidad |
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit | 27,8 B | no disponible | Apache 2.0 | safetensors MLX | 16,3 GB, 96,7 % de fidelidad |
| harness-hub/Qwen3.8-27B-opencode-adapted | 27,8 B | no disponible | Apache 2.0 | no disponible | Adaptador original sin cuantizar; referencia de calidad |
| Qwen/Qwen3.8-27B | 27,8 B | no disponible | no disponible | no disponible | Modelo base sin ajuste para OpenCode |

No se dispone de información sobre otros modelos de la misma categoría (agentes de código de ~27 B) para una comparación más amplia.

## Limitaciones y advertencias

- El adaptador fue entrenado y evaluado con thinking desactivado; el autor recomienda mantenerlo así, por lo que activar el modo thinking puede degradar el comportamiento esperado.
- La cuantización a 8 bits introduce una divergencia mínima pero no nula respecto a bf16 (99,2 % de coincidencia en el siguiente token, KL 0,0004); en respuestas largas con decodificación especulativa puede haber divergencias por redondeo en empates cercanos.
- Los benchmarks publicados (SWE-bench Pro, Terminal-Bench 2.1) corresponden al adaptador original, no a esta build cuantizada; los resultados de velocidad son mediciones indicativas con carga concurrente en el equipo.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación específico, idiomas soportados ni longitud de contexto, lo que limita la evaluación para producción.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen y del adaptador original antes de desplegar en producción.
- El modelo está orientado exclusivamente a Apple Silicon y MLX; no es directamente utilizable en CUDA sin reconversión.
- El repositorio tiene un volumen de descargas bajo (416) y un solo "like", lo que sugiere poca validación comunitaria de esta build concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-3bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-adapter
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
- OpenCode: https://opencode.ai
