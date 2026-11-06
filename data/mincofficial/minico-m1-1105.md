# Mincofficial/Minico-M1-1105

## Resumen

Minico M1 1105 es un modelo de lenguaje de 354 millones de parámetros especializado en razonamiento, desarrollado por Mincofficial como un ajuste fino (fine-tune) del modelo base LiquidAI/LFM2.5-350M. Se presenta como una de las primeras alternativas por debajo de los 400 millones de parámetros con un dial de esfuerzo de razonamiento de cinco niveles (`off`, `low`, `medium`, `high`, `max`), lo que permite al usuario decidir cuántos tokens de pensamiento dedica el modelo antes de emitir la respuesta final.

El modelo está pensado para ejecución en dispositivo (on-device) y en el borde (edge): ocupa aproximadamente 229 MB en cuantización Q4_K_M y alcanza 371 tokens por segundo en un MacBook Air sin ventilador con llama.cpp. Emplea la arquitectura LFM2 (liquid) heredada del modelo base, con licencia lfm1.0, y está disponible en formatos safetensors, GGUF, MLX y ONNX.

La versión 1105 corrige los problemas de la Preview: los niveles de esfuerzo ahora funcionan, el razonamiento se cierra con `</think>` y va seguido de una única respuesta, y la tasa de bucles se reduce del 18,8 % al 0 %. Según la model card, lidera su franja de tamaño en cinco benchmarks con un promedio de 49,8, por delante de LFM2.5 350M base (47,0) y de Qwen2.5 0.5B (41,6), un modelo un 41 % más grande.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (liquid), transformer según tags del modelo; detalles internos no disponibles |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones GGUF, MLX y ONNX no detalladas |
| Idiomas soportados | en (inglés) |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors, GGUF, MLX, ONNX |

## Arquitectura y entrenamiento

Minico M1 1105 es un fine-tune del modelo LiquidAI/LFM2.5-350M, que emplea la arquitectura LFM2 (liquid) de Liquid AI. La model card no detalla la composición del dataset de ajuste fino, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. El entrenamiento se orientó a tres objetivos declarados: hacer funcionales los cinco niveles de esfuerzo de razonamiento, eliminar la repetición del razonamiento dentro de la respuesta final y suprimir los bucles de generación.

La innovación técnica destacada es el dial de esfuerzo de razonamiento con cinco niveles, que controla la longitud del bloque de pensamiento (mediana de 40 tokens en `low`, 54 en `medium`, 66 en `high` y 78 en `max`, frente a 0 en `off`). El razonamiento se delimita con `</think>` y en todos los niveles se cierra correctamente (0 % de `<think>` sin cerrar en la versión 1105, frente al 13,8-16,2 % de la Preview). No se han publicado detalles sobre decodificación especulativa, atención lineal u otras optimizaciones internas.

## Capacidades

- Generación de texto conversacional en inglés con soporte de conversaciones multi-turno.
- Razonamiento con cinco niveles de esfuerzo configurables (`off`, `low`, `medium`, `high`, `max`), con un bloque de pensamiento delimitado por `</think>` seguido de una única respuesta.
- Tool calling / function calling: la model card reporta un 100 % de llamadas correctas en su prueba de function calling (frente al 54,8 % del modelo base LFM2.5-350M).
- Razonamiento matemático (GSM8K, MATH-500) y resolución de problemas aritméticos paso a paso cuando el pensamiento está activado.
- Seguimiento de instrucciones estrictas (IFEval a nivel de prompt).
- Capacidad de identificarse correctamente cuando se le pregunta quién es (100 % en la prueba de la model card, frente a 0 % en la Preview).
- Ejecución en dispositivo y en el borde: disponible en GGUF, MLX y ONNX, con demo en navegador mediante WebGPU.
- No se documentan capacidades de visión, audio ni otros idiomas distintos del inglés.

## Casos de uso

- Asistentes locales en el navegador: el modelo puede desplegarse con WebGPU y ejecutarse íntegramente en la GPU del usuario sin enviar datos a un servidor, adecuado para aplicaciones de privacidad estricta gracias a su tamaño de ~229 MB en Q4_K_M.
- Automatización en dispositivos de borde: con 371 tokens/s en un MacBook Air sin ventilador mediante llama.cpp, es viable para asistentes embebidos en portátiles, Raspberry Pi o dispositivos sin acelerador dedicado.
- Enrutamiento y clasificación con tool calling: su 100 % de llamadas correctas en la prueba del autor lo hace apto para pipelines de agentes que necesitan invocar funciones de forma fiable en un modelo pequeño.
- Tutoría matemática paso a paso: con el esfuerzo en `low`, `medium`, `high` o `max`, el modelo muestra el razonamiento antes de responder, útil en aplicaciones educativas que requieren explicaciones intermedias (20/20 respuestas correctas en el ejemplo de la model card con pensamiento activado).
- Control de esfuerzo en producción: el dial de cinco niveles permite ajustar el coste computacional por petición, usando `off` para respuestas rápidas y `max` para consultas que requieren más elaboración.
- Prototipado y pruebas de CI: al ser un modelo de 350M con formatos GGUF/MLX/ONNX, puede integrarse en suites de evaluación automatizadas o en pipelines de CI/CD con requisitos de hardware mínimos.
- Chat multi-turno ligero: su puntuación de 99 en la prueba multi-turno del autor (100 chats) lo respalda para asistentes conversacionales que deben responder al último mensaje del usuario.

## Benchmarks y rendimiento

Resultados publicados en la model card, obtenidos con el mismo harness, mismas preguntas reservadas, plantillas de chat propias y muestreo temperature 0.1, top_k 50, repetition penalty 1.05. Minico M1 1105 se evalúa con el pensamiento desactivado (`off`).

| Modelo | Params | GSM8K | MATH-500 | IFEval | MMLU-Pro | Multi-turn | Promedio | Tasa de bucles |
|---|---|---|---|---|---|---|---|---|
| Minico M1 1105 (effort off) | 350M | 39,8 | 19 | 72,5 | 18,8 | 99 | 49,8 | 0 % |
| Minico M1 Preview | 350M | 25,8 | 15,5 | 50,3 | 11,2 | 66 | 33,8 | 18,8 % |
| Gemma 3 270M | 270M | 17,2 | 6 | 26,1 | 11,5 | 60 | 24,2 | 18,8 % |
| Granite 4.0 350M | 350M | 41,5 | 17 | 48,8 | 12,6 | 98 | 43,6 | 1,2 % |
| LFM2 350M | 350M | 26,8 | 22 | 55,3 | 17,1 | 71 | 38,4 | 0 % |
| LFM2.5 350M (base) | 350M | 35 | 19 | 71,7 | 18,4 | 91 | 47 | 0 % |
| SmolLM2 360M | 360M | 11,2 | 0 | 32,4 | 10,8 | 44 | 19,7 | 2,5 % |
| Qwen2.5 0.5B | 494M | 47,8 | 36 | 28,8 | 14,6 | 81 | 41,6 | 7,5 % |

Desglose por nivel de esfuerzo:

| Esfuerzo | GSM8K | MATH-500 | Tokens de razonamiento (mediana) | `<think>` sin cerrar |
|---|---|---|---|---|
| off | 39,8 | 19 | 0 | 0 % |
| low | 31,5 | no disponible | 40 | 0 % |
| medium | 34,8 | 12,5 | 54 | 0 % |
| high | 37 | 18,5 | 66 | 0 % |
| max | 34,8 | no disponible | 78 | 0 % |

El autor advierte que las diferencias inferiores a unos 3 puntos quedan dentro del ruido entre ejecuciones y que el muestreo casi codicioso aplicado a todos los modelos puede diferir de los ajustes oficiales de cada uno.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 229 MB en cuantización Q4_K_M (GGUF); el peso completo en safetensors ocupa 0,7 GB en el repositorio.
- GPU recomendadas: no se especifican modelos concretos; el autor reporta ejecución en un MacBook Air sin ventilador mediante llama.cpp y en navegador con WebGPU.
- Cabe holgadamente en GPU de consumo: con ~229 MB en Q4_K_M, es viable en cualquier GPU integrada o dedicada con al menos ese espacio disponible, así como en CPU.
- Opciones de despliegue: llama.cpp (referencia del autor), MLX (build oficial), ONNX (build oficial), transformers (librería declarada) y WebGPU en navegador. No se mencionan vLLM ni TGI.
- Latencia y throughput: 371 tokens/s en un MacBook Air sin ventilador con llama.cpp (Q4_K_M).

## Comparativa con modelos similares

| Modelo | Params | Contexto | Promedio (harness del autor) | Licencia | Formatos |
|---|---|---|---|---|---|
| Minico M1 1105 | 350M | no disponible | 49,8 | lfm1.0 | safetensors, GGUF, MLX, ONNX |
| LFM2.5 350M (base) | 350M | no disponible | 47,0 | lfm1.0 | safetensors |
| Granite 4.0 350M | 350M | no disponible | 43,6 | no disponible en la información | no disponible en la información |
| Qwen2.5 0.5B | 494M | no disponible | 41,6 | no disponible en la información | no disponible en la información |
| Gemma 3 270M | 270M | no disponible | 24,2 | no disponible en la información | no disponible en la información |

Frente a Granite 4.0 350M, Minico M1 1105 supera en IFEval (72,5 vs 48,8), MMLU-Pro (18,8 vs 12,6), MATH-500 (19 vs 17) y multi-turno (99 vs 98), mientras que Granite gana en GSM8K (41,5 vs 39,8). Frente a Qwen2.5 0.5B, un modelo un 41 % mayor, Minico M1 1105 lidera en IFEval (72,5 vs 28,8), MMLU-Pro (18,8 vs 14,6) y multi-turno (99 vs 81), pero Qwen2.5 0.5B es superior en GSM8K (47,8 vs 39,8) y MATH-500 (36 vs 19). Los datos de contexto y licencia de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan capacidades multilingües.
- El razonamiento no mejora la precisión en GSM8K: el esfuerzo `off` (39,8) rinde aproximadamente igual que `high` (37), y los niveles `low` y `max` obtienen puntuaciones inferiores (31,5 y 34,8).
- En el ejemplo aritmético de la model card, con el pensamiento desactivado el modelo respondió 35 (en lugar de 30) en 12 de 20 intentos, lo que evidencia errores de cálculo cuando no razona.
- El modelo es un fine-tune de terceros sobre LFM2.5-350M; la licencia lfm1.0 (license: other) puede imponer restricciones al uso comercial que deben verificarse en el archivo LICENSE del repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la model card fue creada y actualizada el mismo día (2026-11-05), por lo que no hay validación independiente de los resultados.
- Los benchmarks son los reportados por el propio autor con su harness y muestreo casi codicioso; el autor reconoce que los números oficiales de los modelos comparados pueden diferir.
- La longitud de contexto no está documentada, lo que dificulta planificar casos de uso con ventanas largas.
- Riesgo de alucinación inherente a un modelo de 350M; no se han publicado evaluaciones de sesgo ni de seguridad.
- La tasa de bucles del 0 % se midió sobre 80 prompts mixtos; no garantiza ausencia de repeticiones en dominios fuera de esa muestra.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mincofficial/Minico-M1-1105
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Versión Preview: https://huggingface.co/Mincofficial/Minico-M1-Preview
- GGUF: https://huggingface.co/Mincofficial/Minico-M1-1105-GGUF
- MLX: https://huggingface.co/Mincofficial/Minico-M1-1105-MLX
- ONNX: https://huggingface.co/Mincofficial/Minico-M1-1105-ONNX
- Demo en navegador (WebGPU): https://minico.mincoffical.codes/try/
