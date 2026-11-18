# acidkill/Rocinante-X-12B-v1-absolute-heresy-NPU2

## Resumen

Rocinante-X-12B-v1-absolute-heresy-NPU2 es una conversión experimental de un modelo de lenguaje de 12 mil millones de parámetros orientado a roleplay y texto sin censura, empaquetado para su ejecución en las NPU AMD XDNA2 (arquitectura Krackan1). Lo publica el usuario acidkill en Hugging Face y deriva del checkpoint `MuXodious/Rocinante-X-12B-v1-absolute-heresy`, a su vez una variante "abliterated" del `TheDrummer/Rocinante-X-12B-v1` construido sobre Mistral-Nemo-12B. No incluye entrenamiento nuevo: es una recuantización con pérdida de un GGUF Q4_K_M ya existente a proyecciones Q4_1 con embeddings y normas en BF16.

La relevancia del paquete es fundamentalmente de infraestructura: demuestra que un transformer denso de 12B puede servirse en una NPU de consumo (Ryzen AI7 350 con Radeon 860M) mediante el runtime OpenFlowLM (OFLM) y un conjunto de kernels personalizados. El autor documenta con detalle las mediciones locales comparadas con la misma cuantización en GPU vía llama.cpp/ROCm, incluyendo los cuellos de botella de la ruta de prefill legacy. El modelo conserva la configuración Mistral original, 131072 IDs de vocabulario y la plantilla de chat Mistral v3 Tekken.

El alcance es deliberadamente acotado: solo texto, solo inglés y polaco, sin soporte de tool calling verificado y con una ventana de contexto operativa de 4096 tokens en la NPU, muy inferior a los 131072 que declara el metadato heredado. Es, por tanto, un artefacto para experimentación con aceleradores NPU, no un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Mistral, `model_type: mistral`, base Mistral-Nemo-12B) |
| Parametros totales | 12B (según nomenclatura del modelo base; no se detalla el recuento exacto) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens en runtime NPU validado; 131072 declarados como metadato heredado, no validados en NPU |
| Tipos de cuantizacion | Q4_1 en proyecciones con embeddings y normas en BF16 (recuantización con pérdida desde Q4_K_M GGUF) |
| Idiomas soportados | Inglés (en) y polaco (pl) |
| Licencia | `other` / `upstream-model-terms` (términos del modelo upstream) |
| Formato de pesos | Paquete NPU2 con kernels OpenFlowLM (OFLM) y manifiesto ABI1; no se especifica safetensors ni GGUF estándar en el repo |
| Tamano del repositorio | 8.6 GB |
| Runtime requerido | OFLM 0.1.0 (paquete `0.1.0.r168.g1919482-2`), ABI1 |
| Hardware objetivo | AMD XDNA2 (probado en Ryzen AI7 350 / Krackan1, Radeon 860M, 32 GB RAM) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de la familia Mistral-Nemo-12B, con 40 capas según los registros de ejecución del autor. La conversión NPU2 no introduce cambios arquitectónicos: preserva `model_type: mistral`, los 131072 IDs de vocabulario y la plantilla de chat Mistral v3 Tekken. El proceso aplicado es una recuantización desde un GGUF Q4_K_M a proyecciones Q4_1 con embeddings y normas en BF16, orientada al motor de kernels abierto de OpenFlowLM para XDNA2. El autor advierte explícitamente que se trata de una recuantización con pérdida y no reclama paridad de calidad con el checkpoint original.

No se realizó entrenamiento adicional ni un proceso de abliteration nuevo en esta conversión; las propiedades "uncensored" y "abliterated" provienen del checkpoint upstream de MuXodious. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. La innovación técnica destacable es el empaquetado de kernels personalizados con hash de especificación `sha256:232d9434c3905a979fc7a98528dd9cd6691957ae1c6bb3b76435e90dc475cb21`, que evita enlazar un bundle cerrado estándar (por ejemplo, el de Llama 8B) incompatible con la geometría de este modelo.

## Capacidades

- Generación de texto conversacional orientada a roleplay, con personajes definidos mediante mensaje de sistema estándar (no se inyecta persona por defecto).
- Roleplay multilingüe en inglés y polaco, con recall de detalles narrativos (nombres de lugares, barcos, colores de objetos) verificado en escenarios deterministas de tres turnos.
- Estilo sin censura ("abliterated"): el autor no realizó benchmark de rechazos, por lo que la ausencia de disclaimers genéricos de IA se observó en pruebas cualitativas, no medida formalmente.
- Generación de texto general de un modelo Mistral-Nemo-12B (no evaluada en esta conversión más allá de los checks congelados).
- Tool calling / function calling: no soportado según los resultados del autor (0/2 fixtures superados en ambos backends).
- Capacidades de agente y razonamiento multi-paso: no documentadas ni verificadas.
- Modo thinking, visión o audio: no disponibles.
- Contexto largo: limitado a 4096 tokens en la ruta NPU validada.

## Casos de uso

- Experimentación con aceleración NPU en hardware de consumo: servir un modelo de 12B en una Ryzen AI7 350 permite estudiar el rendimiento de XDNA2 frente a GPU integrada sin salir de un portátil. Es el caso de uso principal que documenta el autor.
- Roleplay narrativo en local para inglés y polaco: el modelo mantiene coherencia de personaje y recall de detalles en conversaciones cortas, adecuado para prototipos de aplicaciones de ficción interactiva que no salgan del dispositivo.
- Investigación sobre cuantización y pérdida de calidad: la comparación entre Q4_K_M en GPU y Q4_1 en NPU con checks congelados (7/8 frente a 8/8 en texto) sirve como caso de estudio de recuantización con pérdida.
- Benchmarking de runtimes de inferencia: las mediciones de prefill (25,189 tok/s en NPU frente a 103,142 tok/s en GPU) y generación (6,574 frente a 7,236 tok/s) permiten evaluar el estado de la ruta de prefill legacy de OFLM.
- Desarrollo de kernels personalizados: el paquete incluye el conjunto exacto de kernels y el manifiesto, útil para quienes trabajen en el ecosistema OpenFlowLM y necesiten una referencia de geometría Mistral 12B.
- Pruebas de privacidad y despliegue offline: al ejecutarse íntegramente en hardware local sin dependencias de red, encaja en escenarios donde el texto no debe salir del equipo, siempre con la advertencia de que la calidad y el contexto son limitados.

## Benchmarks y rendimiento

Mediciones locales del autor en Ryzen AI7 350, Radeon 860M, Krackan1 XDNA2, 32 GB RAM, Linux 7.2.15-2-omarchy. Mismo prompt de inventario, temperatura 0, contexto 4096, tres ejecuciones, 1191 tokens de entrada y 128 de salida por ejecución. Se muestra la mediana.

| Metrica | NPU2 | GPU Q4_K_M (referencia) |
|---|---:|---:|
| Prefill, mediana tok/s | 25,189 | 103,142 |
| Generación, mediana tok/s | 6,574 | 7,236 |
| Time to first token en streaming (s) | 45,588 | 11,195 |
| Respuesta completa de 128 tokens, mediana (s) | 66,802 | 29,277 |
| Checks de texto congelados | 7/8 | 8/8 |
| Checks de tool calling congelados | 0/2 | 0/2 |

El autor documenta que la primera muestra NPU fue más lenta (15,726 tok/s en prefill, 6,333 en generación) y que las siguientes alcanzaron 25,189 y 25,548 tok/s. La ruta de prefill legacy ejecuta 51200 dispatches de atención de un solo token (1280 tokens tras padding × 40 capas) porque el manifiesto denso carece de `attn_block.prep`; RMSNorm, residuales y SwiGLU en prefill corren en host, mientras que decode usa la capa densa fusionada en NPU. La GPU descargó 41/41 capas con buffers observados de 6763,30 MiB de modelo, 640 MiB de KV y 360 MiB de embedding en CPU. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/espacio de pesos: el paquete ocupa 8,6 GB en disco; la referencia GPU reportó 6763,30 MiB de modelo más 640 MiB de KV y 360 MiB de embedding en CPU.
- Hardware validado: AMD Ryzen AI7 350 con Radeon 860M (Krackan1 XDNA2) y 32 GB de RAM del sistema.
- GPU de referencia para comparación: la misma iGPU Radeon 860M vía llama.cpp `c1304d7` con ROCm 0 bajo admisión normal.
- GPU dedicadas: no se documentan pruebas en A100, H100 ni RTX 4090 para este paquete NPU2; la comparación es exclusivamente con la iGPU del mismo equipo.
- Cabe en GPU de consumo: el checkpoint original Q4_K_M sí es viable en GPUs de consumo con suficiente VRAM (el autor no aporta cifras para ese escenario); el paquete NPU2 está pensado para la NPU, no para GPU.
- Opciones de despliegue: OpenFlowLM (OFLM) 0.1.0 con el conjunto de kernels incluido; se requiere `OFLM_LLAMA_ENGINE=open` y `OPEN_KERNELS_FORCE_Q4_1=1` al servir, y `--no-xclbin` para evitar bundles cerrados ajenos. No se mencionan vLLM, TGI, llama.cpp ni Ollama para este paquete.
- Latencia y throughput: prefill 25,189 tok/s, generación 6,574 tok/s y TTFT de 45,588 s en NPU; 103,142 tok/s, 7,236 tok/s y 11,195 s respectivamente en la GPU de referencia.
- Limitaciones de despliegue: no se incluyen drivers ni librerías de runtime; la instalación se probó con `python3 install-oflm.py --dry-run` en local, pero no se verificó una descarga e instalación limpia en otra máquina.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Rocinante-X-12B-v1-absolute-heresy-NPU2 (este) | 12B denso | 4096 validado en NPU (131072 declarado) | upstream-model-terms | Hugging Face, 0 descargas | Paquete NPU2 con kernels OFLM; sin tool calling; en/pl |
| MuXodious/Rocinante-X-12B-v1-absolute-heresy | 12B denso | 131072 declarado | upstream-model-terms | Hugging Face (upstream) | Checkpoint fuente sin recuantizar; sin datos de rendimiento en la información disponible |
| TheDrummer/Rocinante-X-12B-v1 | 12B denso | 131072 declarado | no disponible en la información | Hugging Face (upstream) | Base de la variante absolute-heresy; sin datos de rendimiento en la información disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría (por ejemplo, otros Mistral-Nemo-12B o modelos de roleplay de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- Recuantización con pérdida: el autor declara explícitamente que no se reclama paridad de calidad con el checkpoint original; los checks de texto cayeron de 8/8 a 7/8 y el formato estricto de respuesta ordenada falló en NPU.
- Tool calling no funcional: ambos backends fallaron las dos fixtures de herramientas, por lo que no debe integrarse en pipelines que dependan de function calling.
- Contexto operativo de 4096 tokens: los 131072 tokens son metadato heredado y no una garantía validada en NPU; no sirve para tareas de contexto largo.
- Idiomas limitados a inglés y polaco; no se documenta cobertura de castellano.
- Rendimiento de prefill bajo en la ruta legacy: 25,189 tok/s frente a 103,142 tok/s en GPU, con TTFT de 45,588 s para un prompt de 1191 tokens; el autor lo atribuye a la falta de `attn_block.prep` y a la atención en host, no al formato NPU2.
- Sesgos y alucinaciones: no se documentan evaluaciones de sesgo ni de tasa de alucinación; al ser un modelo "abliterated" sin benchmark de rechazos, el comportamiento en dominios sensibles no está caracterizado.
- Licencia restrictiva: `upstream-model-terms` remite a los términos del modelo de MuXodious; es necesario revisarlos antes de cualquier uso comercial.
- Empaquetado experimental: sin drivers ni runtime incluidos, instalación no verificada en una máquina distinta, y dependencia de una versión concreta de OFLM (0.1.0, ABI1).
- Plantilla de chat: debe usarse la Mistral v3 Tekken almacenada (no v7) y no añadir marcadores `[SYSTEM_PROMPT]`; el personaje se define en el mensaje de sistema normal.
- Las pruebas del autor son checks locales pequeños (6 respuestas NPU y 6 GPU en roleplay), no un leaderboard; no puntúan calidad de prosa, creatividad, consistencia emocional ni recall en contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/acidkill/Rocinante-X-12B-v1-absolute-heresy-NPU2
- Modelo base (upstream): https://huggingface.co/MuXodious/Rocinante-X-12B-v1-absolute-heresy
- Modelo original de TheDrummer: https://huggingface.co/TheDrummer/Rocinante-X-12B-v1
- Términos de licencia upstream: https://huggingface.co/MuXodious/Rocinante-X-12B-v1-absolute-heresy
- Repositorio de referencia del autor con benchmarks: carpeta `benchmarks/` del propio repositorio de Hugging Face (incluye `roleplay-review.json`)
