# netprojects/Qwen3.8-27B-pi-adapted-GGUF

## Resumen

Qwen3.8-27B-pi-adapted-GGUF es una conversión a formato GGUF de un modelo derivado de Qwen3.8-27B. El repositorio lo publica netprojects (Internet Projects Ltd), que parte del adaptador LoRA fusiónado `harness-hub/Qwen3.8-27B-pi-adapted` y lo integra en los pesos base de `Qwen/Qwen3.8-27B`, ambos en revisiones fijadas, antes de convertirlo a GGUF para llama.cpp. El resultado son ficheros listos para ejecutar sin necesidad de cargar el adaptador con `--lora`.

El modelo resuelve un problema concreto: harness-hub entrenó el adaptador con aprendizaje por refuerzo (AsyncGRPO en TRL) para convertir a Qwen3.8-27B en el motor del agente de programación pi (earendil-works/pi), especializado en tareas de ingeniería de software y de terminal. Este repositorio empaqueta esa variante en cuantizaciones ejecutables localmente, conservando la capa de predicción multi-token (MTP) del modelo original para acelerar la decodificación, y añadiendo un proyector multimodal (`mmproj`) que habilita la entrada de imágenes.

La relevancia es doble: por un lado, ofrece un agente de código de 27.320.697.856 parámetros en ficheros de 16,8 a 29,0 GB que caben en hardware de consumo; por otro, los resultados publicados por el autor del adaptador muestran una mejora sustancial frente al modelo base (Terminal-Bench 2.1 de 39,5% a 55,8%; SWE-bench Pro hard 51 de 29,4% a 62,7%), con un 55-64% menos de llamadas a herramientas por tarea. La licencia es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B, con 64 capas (16 de atención completa), capa MTP y codificador de visión |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | No disponible (no consta que sea MoE) |
| Longitud de contexto | 65.536 tokens en el ejemplo de despliegue (`-c 65536`); el máximo nativo no se especifica |
| Tipos de cuantización | Q6_K (recomendada), Q8_0, Q4_K_M; proyector de visión en F16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); existe una build MLX de 6 bits en otro repositorio |

| Fichero | Tamaño | Coincidencia de siguiente token vs BF16 | Divergencia KL media |
|---|---|---|---|
| Qwen3.8-27B-pi-Q6_K.gguf (recomendada) | 22,4 GB | 98,4% | 0,0038 |
| Qwen3.8-27B-pi-Q8_0.gguf | 29,0 GB | 99,2% | 0,0003 |
| Qwen3.8-27B-pi-Q4_K_M.gguf | 16,8 GB | 94,2% | 0,0595 |
| mmproj-Qwen3.8-27B-pi-F16.gguf | 0,9 GB | proyector de visión | — |

## Arquitectura y entrenamiento

La base es Qwen3.8-27B, un transformer de 27.320.697.856 parámetros con 64 capas, de las cuales 16 son de atención completa. La fusión del adaptador afecta a 256 módulos: las proyecciones q, k, v y o en las 16 capas de atención completa, y gate, up y down en las 64 capas. La operación aplicada es `W + 2.0 · B @ A` redondeada a bf16, verificada elemento a elemento; el resto de tensores, incluida la capa MTP y el codificador de visión, es idéntico byte a byte al modelo original. El tokenizador y la plantilla de chat son los del adaptador de harness-hub, embebidos sin cambios.

El adaptador se entrenó con aprendizaje por refuerzo (AsyncGRPO en TRL) sobre tareas de ingeniería de software y de terminal, con el objetivo de servir de motor al agente pi. Se evaluó y se entrenó con el modo de razonamiento (thinking) desactivado y con la API Chat Completions, detalles que condicionan el despliegue. La innovación técnica destacable en esta conversión es la conservación de la capa MTP, que llama-server puede usar como decodificación especulativa mediante `--spec-type draft-mtp`. Los datos exactos de entrenamiento (número de tokens, composición del dataset) no se detallan en la información disponible; la model card remite a la del adaptador original.

## Capacidades

- Generación de texto y razonamiento general, heredados de Qwen3.8-27B.
- Programación y tareas de ingeniería de software: el adaptador optimiza el modelo para resolver fallos, interpretar tests y editar código en repositorios.
- Operación en terminal: manejo de herramientas `bash` y `read` con llamadas bien formadas, verificado en llama-server.
- Tool calling y function calling mediante la plantilla de chat del adaptador y el modo `--jinja` de llama-server.
- Comportamiento de agente multi-paso, con reducción del 55-64% en llamadas a herramientas por tarea según el autor del adaptador.
- Entrada de imágenes: el proyector `mmproj-Qwen3.8-27B-pi-F16.gguf` habilita el pipeline image-text-to-text (verificado describiendo una imagen de prueba con un cuadrado rojo y un círculo azul).
- Decodificación especulativa nativa mediante la capa MTP, con incrementos de velocidad de ×1,86 a ×2,41 según cuantización.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de programación local: desplegado con llama-server y conectado a pi mediante `~/.pi/agent/models.json`, el modelo resuelve tareas como diagnosticar y corregir tests fallidos con una sola orden (`pi --provider local --model qwen3.8-pi --print "..."`). Es el escenario para el que fue entrenado y el que reporta las mayores ganancias en Terminal-Bench y SWE-bench Pro.
- Automatización de terminal y DevOps: gracias al soporte verificado de tool calling con `bash`, puede encadenar comandos, inspeccionar ficheros y ejecutar diagnósticos en un entorno controlado, reduciendo el número de interacciones necesarias por tarea.
- Revisión y corrección de código en pipelines de CI: con la API Chat Completions y un servidor compatible con OpenAI, se integra en flujos que analizan fallos de test y proponen parches, manteniendo el razonamiento desactivado para minimizar latencia.
- Asistencia técnica con capturas de pantalla: la entrada de imágenes permite adjuntar diagramas, mensajes de error renderizados o interfaces para que el modelo interprete el contexto visual junto al texto.
- Despliegue en estaciones de trabajo de consumo: la cuantización Q4_K_M (16,8 GB) permite ejecutar el modelo en GPUs de consumo de gama alta o en Apple Silicon, con una pérdida de fidelidad moderada (94,2% de coincidencia de siguiente token).
- Servidor de inferencia multiusuario: Q8_0 (29,0 GB) ofrece la mayor fidelidad respecto a BF16 (99,2%, KL 0,0003) para entornos donde la precisión importa más que el tamaño, con decodificación acelerada por MTP.
- Prototipado de agentes en macOS: la build MLX de 6 bits publicada por el mismo autor cubre el flujo en Apple Silicon, y las mediciones de velocidad con llama-server sobre un MacBook Pro M5 Max sirven de referencia para dimensionar expectativas.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador, medidos bajo pi con thinking desactivado, comparando el modelo adaptado con el base:

| Benchmark | Qwen3.8-27B base | Adaptado (pi) |
|---|---|---|
| Terminal-Bench 2.1 | 39,5% | 55,8% |
| SWE-bench Pro (hard 51) | 29,4% | 62,7% |

Rendimiento de decodificación medido con llama-server (Homebrew llama.cpp, commit b1b770d90) en un MacBook Pro M5 Max, greedy, thinking off, 5 prompts × 256 tokens de GSM8K, MATH-500, HumanEval, MBPP y MT-Bench, con otros servicios en ejecución (cifras indicativas):

| Fichero | Decodificación simple | `--spec-type draft-mtp` | Borradores aceptados |
|---|---|---|---|
| Q4_K_M | 28 tok/s | 52 tok/s (×1,86) | 76% |
| Q6_K | 22 tok/s | 45 tok/s (×2,01) | 72% |
| Q8_0 | 18 tok/s | 44 tok/s (×2,41) | 75% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 17 GB para Q4_K_M, 23 GB para Q6_K y 30 GB para Q8_0, más 0,9 GB adicionales si se carga el proyector de visión.
- GPU recomendadas: A100 y H100 para despliegues de producción con Q8_0 y contexto largo; RTX 4090 (24 GB) para Q6_K sin visión o Q4_K_M con visión; GPUs de 16 GB solo con Q4_K_M y margen ajustado.
- Cabe en GPU de consumo: sí, con Q4_K_M en tarjetas de 16-24 GB y con Q6_K en tarjetas de 24 GB; en Apple Silicon se midió sobre un MacBook Pro M5 Max de 128 GB.
- Opciones de despliegue: llama.cpp / llama-server (verificado por el autor), con `--jinja --chat-template-kwargs '{"enable_thinking": false}'`; build MLX para Apple Silicon. No se mencionan vLLM ni TGI para estos ficheros GGUF.
- Latencia y throughput: 18-28 tok/s en decodificación simple y 44-52 tok/s con MTP en el hardware citado; el resto de plataformas no está medido en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted GGUF (este) | 27.320.697.856 | 65.536 en el ejemplo de despliegue | Agente de código y terminal, multimodal | Apache-2.0 | GGUF en HF, build MLX |
| Qwen3.8-27B (base) | 27.320.697.856 | No disponible | Modelo general | Apache-2.0 | Pesos en HF |
| harness-hub/Qwen3.8-27B-pi-adapted (adaptador) | 27.320.697.856 | No disponible | Adaptador LoRA para pi | Apache-2.0 | Requiere cargar con `--lora` |

No se dispone de datos sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El adaptador se entrenó y evaluó con thinking desactivado; activar el razonamiento puede degradar el comportamiento esperado. El ejemplo oficial fija `enable_thinking: false`.
- El adaptador se entrenó y evaluó con la API Chat Completions; otros formatos de API pueden alterar el rendimiento.
- La cuantización Q4_K_M presenta una divergencia KL de 0,0595 y solo un 94,2% de coincidencia de siguiente token frente a BF16, lo que puede afectar a tareas de agente sensibles a la precisión.
- Los benchmarks reportados (Terminal-Bench 2.1, SWE-bench Pro) provienen del autor del adaptador y no han sido replicados de forma independiente en esta ficha.
- Las mediciones de velocidad se tomaron con otros servicios en ejecución en el mismo equipo y el propio autor las califica de indicativas.
- No se especifican idiomas soportados ni datos sobre sesgos; al ser un derivado de Qwen3.8-27B, hereda los sesgos de su base y de los datos de entrenamiento del adaptador.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en llamadas a herramientas y en la interpretación de resultados de terminal; conviene validar las acciones antes de ejecutarlas en producción.
- El repositorio no está afiliado a Hugging Face, harness-hub ni Alibaba; la licencia Apache-2.0 permite uso comercial, pero se debe conservar el fichero `NOTICE` y citar los trabajos originales.
- El contexto máximo nativo del modelo no se documenta; el valor de 65.536 tokens corresponde a la configuración de ejemplo, no a un límite verificado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Build MLX de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Agente pi: https://github.com/earendil-works/pi
- Más builds de NetProjects: https://huggingface.co/netprojects
- Sitio del publicador: https://netprojects.com
