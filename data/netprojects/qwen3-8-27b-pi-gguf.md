# netprojects/Qwen3.8-27B-pi-GGUF

## Resumen

Qwen3.8-27B-pi-GGUF es una cuantización en formato GGUF del modelo Qwen3.8-27B de Alibaba, adaptado mediante un LoRA entrenado con aprendizaje por refuerzo (AsyncGRPO en TRL) por el equipo de harness-hub para funcionar como el motor del agente de programación [pi](https://github.com/earendil-works/pi). El resultado es un modelo de 27.320.697.856 parámetros (unos 27,3 mil millones) especializado en tareas de ingeniería de software y uso de terminal, que mantiene la capa de predicción multi-token (MTP) de Qwen para acelerar la decodificación en llama.cpp.

La relevancia de esta ficha radica en que empaqueta en un único conjunto de archivos listos para ejecutar un adaptador que, según los datos publicados por el autor del LoRA, eleva Terminal-Bench 2.1 del 39,5% al 55,8% y SWE-bench Pro (hard 51) del 29,4% al 62,7% respecto al modelo base, con entre un 55% y un 64% menos de llamadas a herramientas por tarea. Todo ello bajo licencia Apache 2.0 y con soporte de entrada de imágenes mediante el proyector `mmproj`.

El repositorio, publicado por el usuario netprojects, ofrece múltiples niveles de cuantización (desde IQ2_M de 10,2 GB hasta Q8_0 de 29,0 GB) con métricas de fidelidad respecto a los pesos BF16, además de builds MLX para Apple Silicon. La adaptación se entrenó y evaluó con el modo "thinking" desactivado, una restricción importante que conviene respetar en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atención completa y capa MTP (multi-token prediction); arquitectura base Qwen3.8, no disponible el detalle completo |
| Parámetros totales | 27.320.697.856 (27,3 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | Hasta 65.536 tokens en la configuración de ejemplo (`-c 65536`); máximo nativo no disponible |
| Tipos de cuantización | Q6_K (recomendada), Q8_0, Q4_K_M, Q3_K_M, IQ3_XXS, IQ2_M; proyector de visión F16; builds MLX de 6 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); MLX en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B (revisión `3756181`) y le fusiona el adaptador LoRA de harness-hub (revisión `e786f84`). Según la model card, la fusión afecta a 256 módulos adaptados: las proyecciones q, k, v y o en las 16 capas de atención completa, y las proyecciones gate, up y down en las 64 capas totales. El adaptador se entrenó con aprendizaje por refuerzo mediante AsyncGRPO en la librería TRL, orientado a tareas de ingeniería de software y de terminal dentro del agente pi. El autor no detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset en la información disponible.

La innovación técnica más destacable es la conservación de la capa de predicción multi-token (MTP) de Qwen en todas las cuantizaciones, que llama.cpp puede aprovechar con `--spec-type draft-mtp` para decodificación especulativa. Las cuantizaciones pequeñas (Q3_K_M, IQ3_XXS, IQ2_M) se generaron a partir del archivo Q8_0 usando una importance matrix calculada con llama-imatrix sobre texto periodístico en inglés y código Python con licencia MIT en fragmentos de 512 tokens; la capa MTP se mantiene en Q4_K en los archivos IQ porque la matriz de importancia no la cubre.

## Capacidades

- Generación de texto conversacional y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Programación y resolución de bugs en repositorios reales, con especialización explícita en tareas de ingeniería de software (SWE-bench Pro) y uso de terminal (Terminal-Bench 2.1).
- Uso de herramientas (tool calling / function calling) con formato compatible con la API Chat Completions de OpenAI, que es la interfaz con la que se entrenó y evaluó el adaptador.
- Comportamiento agéntico multi-paso: planificación y ejecución de tareas con menos llamadas a herramientas por tarea (55-64% de reducción según el autor del LoRA).
- Entrada de imágenes a través del proyector `mmproj-Qwen3.8-27B-pi-F16.gguf` (pipeline image-text-to-text).
- Decodificación especulativa mediante la capa MTP integrada, con ratios de aceleración de 1,86x a 2,41x en las pruebas del autor.
- Modo "thinking" disponible en el modelo base, aunque la adaptación se entrenó y evaluó con él desactivado y se recomienda mantenerlo apagado.

## Casos de uso

- Agente de programación autónomo en local: integrado con pi mediante un servidor llama-server compatible con OpenAI, el modelo puede recibir una instrucción como "encuentra por qué fallan los tests de tests/test_parser.py y corrige el bug" y ejecutar el ciclo de inspección, edición y verificación. Es adecuado por su especialización en SWE-bench Pro y su reducción de llamadas a herramientas.
- Automatización de tareas de terminal y DevOps: gracias al entrenamiento específico en Terminal-Bench 2.1, puede encadenar comandos de shell, interpretar su salida y corregir errores en flujos de administración de sistemas o pipelines de CI/CD.
- Asistente de revisión de código en entornos con requisitos de privacidad: al ejecutarse con llama.cpp en hardware propio (desde 10,2 GB en IQ2_M), permite desplegar un revisor de parches sin enviar código a servicios externos.
- Análisis de capturas de pantalla o diagramas junto a código: con el proyector de visión puede describir una imagen de test, interpretar un diagrama de arquitectura o leer una captura de error y proponer una corrección en el mismo hilo conversacional.
- Servidor de inferencia multi-cliente en estación de trabajo: con contexto de 65.536 tokens y decodificación MTP, puede atender sesiones agénticas largas en una máquina con GPU consumer de gama alta o Apple Silicon con memoria unificada suficiente.
- Evaluación e investigación de adaptaciones por RL: al publicarse las métricas de fidelidad (porcentaje de mismo siguiente token y divergencia KL frente a BF16) para cada cuantización, sirve como referencia reproducible para estudiar el impacto de la cuantización en modelos ajustados con RL.
- Generación de código asistida en el editor: desplegado tras un endpoint compatible con OpenAI, puede alimentar extensiones de autocompletado o chat de código con latencias de decenas de tokens por segundo en hardware de sobremesa.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador (harness-hub), con el agente pi y thinking desactivado:

| Benchmark | Modelo base | Qwen3.8-27B-pi | Mejora |
|---|---|---|---|
| Terminal-Bench 2.1 | 39,5% | 55,8% | +16,3 puntos |
| SWE-bench Pro (hard 51) | 29,4% | 62,7% | +33,3 puntos |
| Llamadas a herramientas por tarea | Referencia | 55-64% menos | Reducción |

Fidelidad de las cuantizaciones respecto a BF16 (mismo siguiente token y divergencia KL media):

| Archivo | Tamaño | Mismo siguiente token que BF16 | Divergencia KL media |
|---|---|---|---|
| Q6_K (recomendada) | 22,4 GB | 98,4% | 0,0038 |
| Q8_0 | 29,0 GB | 99,2% | 0,0003 |
| Q4_K_M | 16,8 GB | 94,2% | 0,0595 |
| Q3_K_M | 13,5 GB | 93,1% (vs Q8_0) | 0,0804 (vs Q8_0) |
| IQ3_XXS | 11,4 GB | 91,5% (vs Q8_0) | 0,1244 (vs Q8_0) |
| IQ2_M | 10,2 GB | 89,6% (vs Q8_0) | 0,1715 (vs Q8_0) |

Velocidad de decodificación en llama-server sobre MacBook Pro M5 Max (greedy, thinking off, 5 prompts × 256 tokens; cifras indicativas con otros servicios en ejecución):

| Archivo | Decodificación simple | Con `--spec-type draft-mtp` | Borradores aceptados |
|---|---|---|---|
| Q4_K_M | 28 tok/s | 52 tok/s (×1,86) | 76% |
| Q6_K | 22 tok/s | 45 tok/s (×2,01) | 72% |
| Q8_0 | 18 tok/s | 44 tok/s (×2,41) | 75% |

Velocidad en Splash 1.7.0 con su propio modelo borrador DFlash2 (mismas condiciones):

| Archivo | Velocidad de decodificación | Extremo a extremo (incluye prompt) | Tokens por ciclo |
|---|---|---|---|
| Q4_K_M | 165 tok/s | 128 tok/s | 6,7 |
| Q6_K | 132 tok/s | 100 tok/s | 6,9 |
| Q8_0 | 109 tok/s | 84 tok/s | 6,9 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo más el contexto y el proyector de visión (0,9 GB). Orientativo: IQ2_M ~10,2 GB, IQ3_XXS ~11,4 GB, Q3_K_M ~13,5 GB, Q4_K_M ~16,8 GB, Q6_K ~22,4 GB, Q8_0 ~29,0 GB, más overhead de KV cache según la longitud de contexto.
- GPU recomendadas: para Q6_K o Q8_0 con contexto largo, GPU de 48 GB o más (A6000, L40S, A100 80 GB, H100); para Q4_K_M, GPU de 24 GB como la RTX 4090 o RTX 3090 pueden ser suficientes con contexto moderado.
- Cabe en GPU consumer: sí, en RTX 4090/3090 (24 GB) con Q4_K_M o inferiores; en GPUs de 12-16 GB solo con IQ2_M, IQ3_XXS o Q3_K_M y contexto reducido. En Apple Silicon, el autor reporta ejecución en un MacBook Pro M5 Max de 128 GB de memoria unificada.
- Opciones de despliegue: llama.cpp/llama-server (soporte de `--spec-type draft-mtp` y `--jinja`), Splash 1.7.0, y builds MLX para Apple Silicon. No se menciona soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: en M5 Max, 22-28 tok/s en decodificación simple y 44-52 tok/s con MTP para Q4_K_M y Q6_K; en Splash, 100-165 tok/s de decodificación y 84-128 tok/s extremo a extremo. No hay datos publicados para GPU NVIDIA.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi (esta ficha) | 27,3 B | Hasta 65.536 en la config. de ejemplo | Agente de programación y terminal (RL) | Apache 2.0 | GGUF, MLX |
| Qwen3.8-27B (base) | 27,3 B | No disponible | Propósito general | No disponible en la información | No disponible |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con competidores directos.

## Limitaciones y advertencias

- El adaptador se entrenó y evaluó con el modo "thinking" desactivado; activarlo puede degradar el rendimiento respecto a las cifras publicadas.
- La especialización está orientada a tareas de ingeniería de software y terminal; en dominios ajenos su comportamiento será el del modelo base Qwen3.8-27B, sin las mejoras del ajuste por RL.
- Las cuantizaciones bajas (IQ2_M, IQ3_XXS, Q3_K_M) muestran divergencias KL notables (0,08-0,17 frente a Q8_0) y una tasa de coincidencia del siguiente token del 89,6-93,1%, lo que puede afectar a tareas de razonamiento o generación de código sensible a la precisión.
- La capa MTP se mantiene en Q4_K en los archivos IQ, lo que introduce una heterogeneidad de precisión no documentada en detalle.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de sesgo en la información disponible.
- Idiomas soportados no documentados; el material de calibración de la importance matrix es en inglés, lo que puede sesgar la calidad de las cuantizaciones pequeñas hacia ese idioma.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B y el adaptador de harness-hub deberían verificarse por separado; la información disponible solo confirma Apache 2.0 para este repositorio.
- Las cifras de velocidad proceden de un único equipo (MacBook Pro M5 Max) con otros servicios en ejecución y el propio autor las califica de indicativas; no deben tomarse como garantía de rendimiento en otros sistemas.
- El repositorio ocupa 104,4 GB en total; conviene descargar solo el archivo de cuantización necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-GGUF
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Builds MLX 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Agente pi: https://github.com/earendil-works/pi
- Archivo Q6_K: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-GGUF/blob/main/Qwen3.8-27B-pi-Q6_K.gguf
- Archivo Q8_0: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-GGUF/blob/main/Qwen3.8-27B-pi-Q8_0.gguf
- Archivo Q4_K_M: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-GGUF/blob/main/Qwen3.8-27B-pi-Q4_K_M.gguf
- Archivo Q3_K_M: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-GGUF/blob/main/Qwen3.8-27B-pi-Q3_K_M.gguf
- Archivo IQ3_XXS: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-GGUF/blob/main/Qwen3.8-27B-pi-IQ3_XXS.gguf
- Archivo IQ2_M: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-GGUF/blob/main/Qwen3.8-27B-pi-IQ2_M.gguf
- Proyector de visión: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-GGUF/blob/main/mmproj-Qwen3.8-27B-pi-F16.gguf
