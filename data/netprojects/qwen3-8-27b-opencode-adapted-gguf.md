# netprojects/Qwen3.8-27B-opencode-adapted-GGUF

## Resumen

Qwen3.8-27B-opencode-adapted-GGUF es una conversión a formato GGUF del adaptador LoRA publicado por harness-hub sobre el modelo base Qwen/Qwen3.8-27B. El resultado es un modelo de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) especializado en tareas de agente de programación, pensado para funcionar como motor del agente OpenCode en entornos de ingeniería de software y terminal. La conversión la firma el usuario netprojects y fusiona el adaptador en los pesos base, de modo que no es necesario cargar un LoRA con `--lora` en llama.cpp.

El interés principal reside en que el adaptador se entrenó con aprendizaje por refuerzo (AsyncGRPO en TRL) para mejorar el rendimiento en tareas de agente reales: según los resultados publicados por el autor, SWE-bench Pro (hard 51) pasa del 35,3 % al 51,0 % y Terminal-Bench 2.1 del 46,4 % al 52,4 % respecto al modelo base, con el modo thinking desactivado. Además, con thinking off iguala al modelo base con thinking a máximo esfuerzo generando aproximadamente una sexta parte de los tokens.

La relevancia práctica es doble: por un lado ofrece una vía de despliegue local de un agente de código con cuantizaciones desde 10,2 GB hasta 29,0 GB, y por otro conserva la capa de predicción multi-token (MTP) de Qwen, que llama-server puede aprovechar para decodificación especulativa con aceleraciones de hasta ×2,36 medidas. El repositorio incluye también un proyector multimodal (`mmproj`) que añade entrada de imágenes, por lo que el pipeline declarado es image-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8) con capa de predicción multi-token (MTP); adaptador LoRA fusionado en los pesos base |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens en el ejemplo de despliegue de llama-server (`-c 65536`); no se documenta el máximo oficial |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M, Q3_K_M, IQ3_XXS, IQ2_M; proyector de visión en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); existen builds MLX de 6 bits en un repositorio aparte |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B (revisión `3756181`) y le fusiona el adaptador de harness-hub/Qwen3.8-27B-opencode-adapted (revisión `b4171c0`). La arquitectura es un transformer de la familia Qwen3.8 con una capa MTP integrada que se conserva en todos los ficheros GGUF; esa capa permite a llama-server usar decodificación especulativa con borrador propio (`--spec-type draft-mtp`). El adaptador original se entrenó con aprendizaje por refuerzo mediante AsyncGRPO en la librería TRL, orientado a tareas de ingeniería de software y de terminal dentro del agente OpenCode. La model card no detalla la composición del dataset de entrenamiento ni el número de tokens utilizados.

La conversión a GGUF la realiza netprojects. Las cuantizaciones pequeñas (Q3_K_M, IQ3_XXS, IQ2_M) se generaron a partir del fichero Q8_0 con una importance matrix calculada con llama-imatrix sobre texto de noticias en inglés y código Python con licencia MIT, en fragmentos de 512 tokens. En los ficheros IQ la capa MTP se mantiene en Q4_K porque la importance matrix no la cubre. La fidelidad respecto a los pesos BF16 está documentada: Q8_0 conserva el mismo siguiente token en el 99,5 % de los casos con divergencia KL media de 0,0002; Q6_K baja al 98,7 % con KL 0,0197; Q4_K_M al 94,2 % con KL 0,0689.

## Capacidades

- Generación de texto conversacional y razonamiento, con modo thinking desactivable mediante `enable_thinking: false` en la plantilla de chat.
- Agente de programación: resolución de incidencias en repositorios y tareas de terminal, evaluado en SWE-bench Pro y Terminal-Bench 2.1.
- Tool calling y function calling: la model card confirma que las builds producen llamadas a herramientas bien formadas en las pruebas realizadas.
- Entrada de imágenes mediante el proyector `mmproj-Qwen3.8-27B-opencode-F16.gguf` (pipeline image-text-to-text).
- Decodificación especulativa con la capa MTP integrada, que acelera la generación entre ×1,97 y ×2,36 según cuantización.
- Compatibilidad con endpoints OpenAI (`endpoints_compatible`), lo que permite conectarlo a clientes que hablen la API de OpenAI.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de código local con OpenCode: el modelo se conecta como proveedor compatible con OpenAI en `~/.config/opencode/opencode.json` apuntando a `http://localhost:8000/v1`, y se invoca con `opencode run --model local/qwen3.8-opencode` para tareas como localizar y corregir tests que fallan. Es adecuado porque el adaptador se entrenó específicamente para ese agente y ese formato de interacción.
- Resolución de incidencias en repositorios (SWE-bench style): con 65.536 tokens de contexto puede cargar varios ficheros, trazas de error y tests en una sola sesión y proponer parches. El salto documentado de 35,3 % a 51,0 % en SWE-bench Pro hard 51 respalda este uso.
- Automatización de terminal: ejecución guiada de comandos y diagnóstico de fallos en entornos de línea de comandos, con el respaldo del 52,4 % en Terminal-Bench 2.1.
- Asistente de CI/CD: integrado como servidor llama-server detrás de un endpoint OpenAI, puede revisar diffs, generar parches y validar llamadas a herramientas en pipelines automatizados, con la ventaja de que el modo thinking off reduce el consumo de tokens a aproximadamente una sexta parte.
- Despliegue en estaciones de trabajo con GPU de consumo: la cuantización Q4_K_M (16,8 GB) o Q3_K_M (13,5 GB) permite ejecutar el modelo en máquinas con 16-24 GB de VRAM, manteniendo tool calling e imagen funcionales según las pruebas del autor.
- Procesamiento de capturas y diagramas: gracias al proyector multimodal, el modelo puede recibir imágenes junto al texto, útil para interpretar capturas de pantalla de errores o diagramas de arquitectura en un flujo de depuración.
- Inferencia en Apple Silicon: las builds MLX de 6 bits y las mediciones en un MacBook Pro M5 Max (hasta 144 tok/s con Splash en Q4_K_M) lo hacen viable en portátiles de Apple sin GPU dedicada.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador (OpenCode, thinking off) frente al modelo base:

| Benchmark | Modelo base | Modelo con adaptador |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3 % | 51,0 % |
| Terminal-Bench 2.1 | 46,4 % | 52,4 % |

Fidelidad de las cuantizaciones respecto a BF16 (mismo siguiente token y divergencia KL media):

| Fichero | Tamano | Mismo siguiente token que BF16 | KL media |
|---|---|---|---|
| Q8_0 | 29,0 GB | 99,5 % | 0,0002 |
| Q6_K | 22,4 GB | 98,7 % | 0,0197 |
| Q4_K_M | 16,8 GB | 94,2 % | 0,0689 |
| Q3_K_M | 13,5 GB | 92,9 % (vs Q8_0) | 0,0883 (vs Q8_0) |
| IQ3_XXS | 11,4 GB | 91,0 % (vs Q8_0) | 0,1356 (vs Q8_0) |
| IQ2_M | 10,2 GB | 89,6 % (vs Q8_0) | 0,1709 (vs Q8_0) |

Velocidad de decodificación con llama-server en MacBook Pro M5 Max (greedy, thinking off, 5 prompts × 256 tokens, con otros servicios en ejecución, por lo que son indicativas):

| Fichero | Sin MTP | Con `--spec-type draft-mtp` | Borradores aceptados |
|---|---|---|---|
| Q4_K_M | 27 tok/s | 53 tok/s (×1,97) | 77 % |
| Q6_K | 22 tok/s | 46 tok/s (×2,07) | 73 % |
| Q8_0 | 18 tok/s | 43 tok/s (×2,36) | 74 % |

Velocidad con Splash 1.7.0 (decodificación especulativa propia, mismas condiciones, con otros modelos cargados en el Mac):

| Fichero | Velocidad de decodificación | Extremo a extremo (incluye prompt) | Tokens por ciclo |
|---|---|---|---|
| Q4_K_M | 144 tok/s | 111 tok/s | 6,6 |
| Q6_K | 129 tok/s | 98 tok/s | 6,9 |
| Q8_0 | 105 tok/s | 85 tok/s | 6,6 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero más overhead de contexto. Q8_0 necesita unos 29 GB, Q6_K unos 22,4 GB, Q4_K_M unos 16,8 GB, Q3_K_M unos 13,5 GB, IQ3_XXS unos 11,4 GB e IQ2_M unos 10,2 GB. El proyector de visión añade 0,9 GB si se usa entrada de imágenes.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, Q8_0 y Q6_K encajan en A100 40 GB, H100 y RTX A6000; Q4_K_M y Q3_K_M son aptos para RTX 4090 (24 GB) y RTX 4080/4070 Ti con margen variable; IQ2_M podría caber en GPUs de 12 GB.
- Cabe en GPU de consumo: sí, en las cuantizaciones Q4_K_M e inferiores con 16-24 GB de VRAM; las IQ3/IQ2 amplían el rango a equipos de 12 GB.
- Opciones de despliegue: llama.cpp (llama-server con `--jinja`, `--chat-template-kwargs '{"enable_thinking": false}'` y `--spec-type draft-mtp`), Splash 1.7.0 (`splash serve`), y builds MLX de 6 bits para Apple Silicon. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: en MacBook Pro M5 Max, entre 18 y 27 tok/s sin decodificación especulativa, entre 43 y 53 tok/s con MTP y entre 105 y 144 tok/s con Splash (Q8_0 a Q4_K_M). No hay datos para GPU dedicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-opencode-adapted (este) | 27,3 B | 65.536 en el ejemplo de despliegue | SWE-bench Pro hard 51: 51,0 %; Terminal-Bench 2.1: 52,4 % (thinking off) | Apache 2.0 | GGUF y MLX en Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27,3 B | no disponible | SWE-bench Pro hard 51: 35,3 %; Terminal-Bench 2.1: 46,4 % (thinking off) | Apache 2.0 (según el modelo base referenciado) | Hugging Face |
| harness-hub/Qwen3.8-27B-opencode-adapted (adaptador original) | 27,3 B | no disponible | mismos resultados que este modelo, en formato LoRA | Apache 2.0 | Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El adaptador se entrenó y evaluó con thinking desactivado; la model card recomienda mantenerlo apagado. Usarlo con thinking activado puede degradar el comportamiento esperado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de factualidad.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; el dataset de calibración de la importance matrix era texto en inglés y código Python, lo que puede sesgar las cuantizaciones pequeñas hacia esos dominios.
- Las cuantizaciones IQ2_M, IQ3_XXS y Q3_K_M presentan divergencia KL notable frente a Q8_0 (0,1709, 0,1356 y 0,0883 respectivamente) y menor coincidencia de siguiente token (89,6 %, 91,0 % y 92,9 %), por lo que su uso en producción conlleva pérdida de fidelidad.
- En los ficheros IQ la capa MTP se mantiene en Q4_K, no en la cuantización nominal, porque la importance matrix no la cubre.
- Las mediciones de velocidad se hicieron en un MacBook Pro M5 Max con otros servicios y modelos en ejecución; el propio autor las califica de indicativas y no deben extrapolarse a otros hardware.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen/Qwen3.8-27B y del adaptador original antes de desplegar en producción.
- El contexto máximo oficial no está documentado; el valor de 65.536 tokens procede únicamente del ejemplo de arranque de llama-server.
- El repositorio ocupa 104,4 GB, por lo que la descarga completa requiere espacio en disco considerable; conviene descargar solo los ficheros necesarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Builds MLX de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- OpenCode: https://opencode.ai
- Fichero recomendado Q6_K: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF/blob/main/Qwen3.8-27B-opencode-Q6_K.gguf
- Fichero Q8_0: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF/blob/main/Qwen3.8-27B-opencode-Q8_0.gguf
- Fichero Q4_K_M: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF/blob/main/Qwen3.8-27B-opencode-Q4_K_M.gguf
- Fichero Q3_K_M: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF/blob/main/Qwen3.8-27B-opencode-Q3_K_M.gguf
- Fichero IQ3_XXS: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF/blob/main/Qwen3.8-27B-opencode-IQ3_XXS.gguf
- Fichero IQ2_M: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF/blob/main/Qwen3.8-27B-opencode-IQ2_M.gguf
- Proyector de visión: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF/blob/main/mmproj-Qwen3.8-27B-opencode-F16.gguf
