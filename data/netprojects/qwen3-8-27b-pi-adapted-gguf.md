# netprojects/Qwen3.8-27B-pi-adapted-GGUF

## Resumen

Qwen3.8-27B-pi-adapted-GGUF es una versión cuantizada en formato GGUF del modelo harness-hub/Qwen3.8-27B-pi-adapted, que a su vez es un fine-tuning mediante LoRA del modelo base Qwen/Qwen3.8-27B. El adaptador fue entrenado por harness-hub con aprendizaje por refuerzo (AsyncGRPO en TRL) para convertir al modelo en el motor del agente de programación pi (earendil-works/pi), especializado en tareas de ingeniería de software y uso de terminal. Esta versión GGUF, publicada por netprojects, fusiona el adaptador con el modelo base y lo convierte para su uso directo en llama.cpp sin necesidad de cargar el LoRA por separado.

El modelo cuenta con 27.320.697.856 parámetros totales y conserva la capa de predicción multi-token (MTP) de Qwen, que permite decodificación especulativa nativa en llama-server. Se distribuye en múltiples niveles de cuantización (desde IQ2_M de 10,2 GB hasta Q8_0 de 29,0 GB) junto con un proyector multimodal F16 que habilita entrada de imágenes, por lo que el pipeline declarado es image-text-to-text.

La relevancia actual del modelo radica en su orientación específica a agentes de codificación: según los resultados publicados por el autor del adaptador, bajo el agente pi con thinking desactivado, mejora Terminal-Bench 2.1 del 39,5% al 55,8% y SWE-bench Pro (hard 51) del 29,4% al 62,7% respecto al modelo base, con entre un 55% y un 64% menos de llamadas a herramientas por tarea. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8) con 16 capas de atención completa y 64 capas totales; incluye capa MTP (multi-token prediction) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (configurado en el ejemplo de llama-server con `-c 65536`) |
| Tipos de cuantización | Q6_K, Q8_0, Q4_K_M, Q3_K_M, IQ3_XXS, IQ2_M; proyector multimodal F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); también existen builds MLX de 6 bits en otro repositorio |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer de 27,3 mil millones de parámetros con 64 capas, de las cuales 16 son de atención completa (las módulos adaptados q, k, v, o se aplican en esas 16 capas) y el resto emplean otro mecanismo de atención. Sobre esta base, harness-hub entrenó un LoRA con aprendizaje por refuerzo usando AsyncGRPO en TRL, orientado a tareas de ingeniería de software y terminal dentro del agente pi. El adaptador resultante se fusionó con el modelo base (revisión e786f84 del adaptador sobre la revisión 3756181 de Qwen) y se convirtió a GGUF para llama.cpp.

Una innovación destacable es la conservación de la capa de predicción multi-token (MTP) de Qwen en todos los archivos, lo que permite a llama-server usar decodificación especulativa con `--spec-type draft-mtp`. Según las mediciones del autor en un MacBook Pro M5 Max, esto acelera la decodificación entre 1,86x y 2,41x según la cuantización, con tasas de aceptación de borradores del 72% al 76%. Los archivos más pequeños (Q3_K_M, IQ3_XXS, IQ2_M) se cuantizaron a partir del Q8_0 usando una matriz de importancia (llama-imatrix sobre texto de noticias en inglés y código Python con licencia MIT, en fragmentos de 512 tokens), manteniendo la capa MTP en Q4_K porque la matriz de importancia no la cubre.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y resolución de tareas de ingeniería de software (localización de bugs, parches, ejecución de tests).
- Uso de terminal y ejecución de comandos en entornos de agente.
- Tool calling / function calling, entrenado y evaluado con la API Chat Completions.
- Razonamiento multi-paso y comportamiento agéntico dentro del agente pi.
- Entrada de imágenes mediante el proyector `mmproj-Qwen3.8-27B-pi-F16.gguf` (image-text-to-text).
- Modo thinking configurable (el adaptador fue entrenado y evaluado con thinking desactivado; se recomienda mantenerlo apagado).
- Decodificación especulativa nativa mediante la capa MTP.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de codificación autónomo: integrado en pi mediante un endpoint compatible con OpenAI Chat Completions (`http://localhost:8000/v1`), el modelo puede recibir una tarea como "encuentra por qué fallan los tests en tests/test_parser.py y corrige el bug" y resolverla de extremo a extremo con menos llamadas a herramientas que el modelo base.
- Resolución de incidencias en repositorios (issue-to-patch): adecuado para SWE-bench Pro y tareas similares, donde el modelo debe navegar el código, reproducir el fallo y generar un parche verificable.
- Automatización de tareas de terminal: el adaptador fue entrenado específicamente en tareas de terminal, por lo que encaja en flujos de administración de sistemas, scripts de despliegue y depuración de entornos.
- Asistente de desarrollo en local con privacidad: al ejecutarse en llama.cpp sobre hardware propio (incluido Apple Silicon con builds MLX), permite mantener el código en la máquina sin enviarlo a APIs externas.
- Revisión de código asistida por imagen: gracias al proyector multimodal, puede analizar capturas de pantalla de errores, diagramas o interfaces junto con el código asociado.
- CI/CD con verificación automática: puede integrarse en pipelines para ejecutar tareas de corrección y validación de tests, apoyándose en el tool calling y en la baja tasa de llamadas por tarea.
- Despliegue en hardware de gama consumer: las cuantizaciones Q4_K_M (16,8 GB) e IQ3_XXS (11,4 GB) permiten ejecutar el modelo en equipos con VRAM o memoria unificada limitada.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador (harness-hub), bajo el agente pi con thinking desactivado:

| Benchmark | Modelo base | Qwen3.8-27B-pi-adapted |
|---|---|---|
| Terminal-Bench 2.1 | 39,5% | 55,8% |
| SWE-bench Pro (hard 51) | 29,4% | 62,7% |
| Llamadas a herramientas por tarea | referencia | 55-64% menos |

Fidelidad de cuantización respecto a BF16 (según la model card):

| Archivo | Tamaño | Mismo siguiente token que BF16 | Divergencia KL media |
|---|---|---|---|
| Q6_K (recomendado) | 22,4 GB | 98,4% | 0,0038 |
| Q8_0 | 29,0 GB | 99,2% | 0,0003 |
| Q4_K_M | 16,8 GB | 94,2% | 0,0595 |
| Q3_K_M | 13,5 GB | 93,1% (vs Q8_0) | 0,0804 (vs Q8_0) |
| IQ3_XXS | 11,4 GB | 91,5% (vs Q8_0) | 0,1244 (vs Q8_0) |
| IQ2_M | 10,2 GB | 89,6% (vs Q8_0) | 0,1715 (vs Q8_0) |

Velocidad de decodificación con llama-server en MacBook Pro M5 Max (greedy, thinking off, 5 prompts × 256 tokens; mediciones indicativas con otros servicios en ejecución):

| Archivo | Sin MTP | Con `--spec-type draft-mtp` | Borradores aceptados |
|---|---|---|---|
| Q4_K_M | 28 tok/s | 52 tok/s (×1,86) | 76% |
| Q6_K | 22 tok/s | 45 tok/s (×2,01) | 72% |
| Q8_0 | 18 tok/s | 44 tok/s (×2,41) | 75% |

Velocidad con Splash 1.7.0 (decodificación especulativa con DFlash2, mismas condiciones):

| Archivo | Velocidad de decodificación | Extremo a extremo (incl. prompt) | Tokens por ciclo |
|---|---|---|---|
| Q4_K_M | 165 tok/s | 128 tok/s | 6,7 |
| Q6_K | 132 tok/s | 100 tok/s | 6,9 |
| Q8_0 | 109 tok/s | 84 tok/s | 6,9 |

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente el tamaño del archivo más overhead. IQ2_M ~10,2 GB; IQ3_XXS ~11,4 GB; Q3_K_M ~13,5 GB; Q4_K_M ~16,8 GB; Q6_K ~22,4 GB; Q8_0 ~29,0 GB. Añadir ~0,9 GB si se usa el proyector multimodal F16.
- GPU recomendadas: A100 y H100 para mayor throughput y contexto completo de 65.536 tokens; RTX 4090 (24 GB) puede alojar hasta Q6_K con margen ajustado o Q4_K_M con holgura.
- Consumer GPU: Q4_K_M (16,8 GB) cabe en RTX 4080/4090 y en GPUs de 24 GB; IQ3_XXS e IQ2_M caben en GPUs de 12-16 GB. En Apple Silicon se ha validado en MacBook Pro M5 Max con 128 GB de memoria unificada.
- Opciones de despliegue: llama.cpp (llama-server), Splash 1.7.0 y builds MLX de 6 bits para Apple Silicon. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: en M5 Max, entre 18 y 28 tok/s en decodificación plana según cuantización, y entre 44 y 52 tok/s con MTP; con Splash, entre 84 y 128 tok/s extremo a extremo. No hay datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted (este) | 27,3 B | 65.536 tokens | Agente de codificación (pi) | Apache 2.0 | GGUF y MLX |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible | Propósito general | no disponible | Pesos originales |
| harness-hub/Qwen3.8-27B-pi-adapted | 27,3 B | no disponible | Agente de codificación (LoRA) | no disponible | Adaptador LoRA |

No se dispone de datos de benchmarks de modelos de terceros en la información proporcionada para ampliar la comparativa.

## Limitaciones y advertencias

- El adaptador fue entrenado y evaluado con thinking desactivado; activar el modo thinking puede degradar el rendimiento respecto a los resultados publicados.
- El adaptador fue entrenado y evaluado con la API Chat Completions; usar otro formato de API puede afectar al comportamiento esperado.
- Las cuantizaciones bajas (IQ2_M, IQ3_XXS, Q3_K_M) presentan divergencia KL notablemente mayor (0,08-0,17 frente a Q8_0) y menor tasa de coincidencia en el siguiente token (89,6%-93,1%), lo que puede afectar a tareas sensibles.
- Los archivos IQ conservan la capa MTP en Q4_K porque la matriz de importancia no la cubre, lo que puede introducir diferencias adicionales.
- Las mediciones de velocidad son indicativas, realizadas en un único equipo con otros servicios en ejecución; no deben tomarse como cifras de producción.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos específicos de alucinación más allá de los inherentes a los modelos de lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen y del adaptador original.
- El rendimiento en tareas fuera del dominio de codificación y terminal no está documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-GGUF
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-27B
- Agente pi: https://github.com/earendil-works/pi
- Builds MLX de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
