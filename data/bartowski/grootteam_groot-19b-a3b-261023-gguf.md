# bartowski/GrootTeam_Groot-19B-A3B-261023-GGUF

## Resumen

Groot-19B-A3B-261023 es un modelo multimodal (texto e imagen) desarrollado por GrootTeam, con una arquitectura de mezcla de expertos (MoE) de 19 mil millones de parametros totales, de los cuales aproximadamente 3 mil millones estan activos por token (como indica el sufijo "A3B"). Esta ficha se centra en la cuantizacion GGUF publicada por bartowski, que permite ejecutar el modelo localmente con llama.cpp y herramientas derivadas como Ollama o LM Studio.

El modelo resuelve el problema de ejecutar un modelo multimodal con razonamiento en hardware de consumo: al ser MoE con solo ~3B de parametros activos, ofrece latencias bajas manteniendo la capacidad de un modelo de 19B. Soporta entrada de texto e imagen (mediante el archivo mmproj), decodificacion especulativa mediante MTP (Multi-Token Prediction) y un modo de razonamiento explicito mediante etiquetas `<think>`.

Su relevancia actual radica en la combinacion de licencia Apache 2.0 (uso comercial sin restricciones), capacidades vision-language, soporte de tool calling y disponibilidad en formato GGUF con cuantizaciones imatrix de alta calidad, lo que lo situa en la categoria de modelos locales eficientes tipo "small MoE" junto a alternativas como Qwen3-30B-A3B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), multimodal (texto + imagen) |
| Parametros totales | 18.985.723.008 (~19B) |
| Parametros activos | ~3B (indicado por el sufijo A3B; numero exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, IQ4_NL, Q4_1, Q4_K_S, Q4_0 (y posiblemente otros; la lista del README esta truncada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado por bartowski con llama.cpp release b11845, con imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer de mezcla de expertos (MoE): de los ~19B de parametros totales, solo ~3B se activan por token, lo que reduce drasticamente el coste computacional de inferencia respecto a un modelo denso equivalente. Es un modelo multimodal de tipo image-text-to-text: la entrada de imagen requiere el archivo mmproj incluido en el repositorio, que contiene el proyector/encoder visual.

Entre las innovaciones tecnicas documentadas destaca el soporte de decodificacion especulativa mediante MTP (Multi-Token Prediction), que permite acelerar la generacion al predecir varios tokens por paso. La cuantizacion publicada por bartowski utiliza matrices de importancia (imatrix) calculadas con llama.cpp para preservar la calidad en cuantizaciones de 4-6 bits. No hay informacion disponible sobre el numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO.

## Capacidades

- Generacion de texto conversacional con formato de prompt ChatML (`<|im_start|>` / `<|im_end|>`).
- Comprension de imagenes (pipeline image-text-to-text) mediante el archivo mmproj.
- Modo de razonamiento explicito: el formato de prompt abre un bloque `<think>` al inicio de la respuesta del asistente.
- Tool calling / function calling: formato nativo con definiciones de funciones en el system prompt y respuestas estructuradas en etiquetas `<tool_call>` con bloques `<function=...>`.
- Razonamiento previo opcional antes de las llamadas a funciones (el modelo puede explicar su decision en lenguaje natural antes del tool call).
- Decodificacion especulativa mediante MTP para acelerar la inferencia en llama.cpp.
- Capacidades multilingues: no disponible.

## Casos de uso

- **Chatbots locales multimodales:** al aceptar texto e imagen, puede construirse un asistente que analice capturas de pantalla, documentos escaneados o fotografias enviadas por el usuario, todo ejecutandose en local sin enviar datos a terceros.
- **Agentes con herramientas:** su formato de tool calling estructurado permite integrarlo en frameworks de agentes (LangChain, custom loops) para consultar APIs, bases de datos o servicios externos en flujos multi-paso.
- **Asistencia de programacion en local:** con ~3B de parametros activos por token ofrece respuestas rapidas para autocompletado y explicacion de codigo en un IDE, sin depender de la nube.
- **Atencion al cliente automatizada:** el formato ChatML multi-turno y el soporte de funciones permiten gestionar conversaciones con consulta de pedidos, stock o estado de envio mediante tool calls.
- **Inferencia en hardware de consumo:** la cuantizacion Q4_K_M (12,48 GB) cabe en una GPU de 16 GB de VRAM, lo que lo hace viable para estaciones de trabajo individuales y despliegues edge.
- **Procesamiento por lotes de documentos con imagenes:** pipelines de OCR aumentado o extraccion estructurada de datos de documentos escaneados, aprovechando la entrada visual y la salida estructurada.
- **Prototipado rapido de LLM en local:** la disponibilidad en Ollama/LM Studio (GGUF) permite probar el modelo en minutos sin configurar infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia (solo pesos LLM):**
  - Q4_K_M: ~12,5 GB; Q5_K_M: ~14,7 GB; Q6_K: ~16,8 GB; Q8_0: ~20,2 GB; bf16: ~38 GB.
  - Hay que anadir la VRAM del archivo mmproj (vision) y del KV cache, no cuantificados en las cifras anteriores.
- **GPU recomendadas:**
  - Q4_K_M y Q5_K_M: RTX 4090 (24 GB) o RTX 4080/5080 (16 GB) con contexto moderado.
  - Q6_K a Q8_0: RTX 4090, RTX 5090 o GPUs de datacenter (A100 40 GB, H100).
  - bf16: requiere A100 40 GB, H100 o multi-GPU.
- **Consumer GPU:** si cabe en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4080, RTX 5080) con cuantizaciones Q4_K_M o inferiores; en GPUs de 12 GB (RTX 3060, 4070) seria necesario offload parcial a CPU con llama.cpp.
- **Despliegue:** llama.cpp (release b11845 o superior, necesario para este formato), Ollama, LM Studio, KoboldCpp; al tratarse de un modelo multimodal, es imprescindible cargar tambien el archivo mmproj. No hay informacion sobre soporte en vLLM o TGI para estos GGUF.
- **Latencia y throughput:** no disponibles; al activar solo ~3B de parametros por token y soportar decodificacion especulativa MTP, se espera una velocidad de generacion alta para su clase, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Multimodal | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|---|
| Groot-19B-A3B-261023 | ~19B | ~3B | Si (texto + imagen) | Apache 2.0 | Si (bartowski, imatrix) |
| Qwen3-30B-A3B | ~30B | ~3B | No (version Instruct; existe variante VL separada) | Apache 2.0 | Si |
| Qwen3-VL-30B-A3B | ~30B | ~3B | Si (texto + imagen + video) | Apache 2.0 | Si |
| Phi-4 (14B denso) | 14B | 14B | No | MIT | Si |

Groot-19B-A3B compite en la categoria de MoE ligeros con ~3B de parametros activos. Frente a Qwen3-VL-30B-A3B ofrece un footprint menor en memoria (~19B vs ~30B totales), a costa de una capacidad potencialmente inferior al disponer de menos parametros totales. Frente a modelos densos de tamano similar (Phi-4), la ventaja esta en la velocidad de inferencia, ya que solo ~3B de parametros se evaluan por token. Los datos de rendimiento comparativo no estan disponibles.

## Limitaciones y advertencias

- No hay informacion publicada sobre idiomas soportados ni sobre datos de entrenamiento, por lo que el rendimiento en castellano debe validarse empiricamente antes de uso en produccion.
- La longitud de contexto no esta documentada en la model card; no es posible garantizar el comportamiento en conversaciones largas.
- Como todo modelo de lenguaje, puede alucinar hechos, especialmente en dominios especializados; las respuestas con tool calling deben validarse antes de ejecutar acciones criticas.
- El bloque `<think>` esta presente por defecto en el formato de prompt; las aplicaciones que parseen la salida deben filtrar el razonamiento antes de mostrar la respuesta al usuario final.
- La lista de cuantizaciones del README esta truncada en la informacion disponible; pueden existir archivos adicionales (Q3, IQ2, etc.) no listados aqui.
- Para usar la capacidad de vision es obligatorio descargar el archivo mmproj correspondiente; sin el, el modelo funcionara solo con texto.
- La decodificacion especulativa MTP requiere soporte adecuado en la version de llama.cpp (release b11845 o posterior); versiones antiguas pueden no cargar el modelo correctamente.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes, pero el modelo base procede de GrootTeam y no hay documentacion publicada sobre filtros de seguridad o alineacion aplicados.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/bartowski/GrootTeam_Groot-19B-A3B-261023-GGUF
- Modelo original: https://huggingface.co/GrootTeam/Groot-19B-A3B-261023
- llama.cpp (release usada para cuantizar, b11845): https://github.com/ggml-org/llama.cpp/releases/tag/b11845
- Repositorio principal de llama.cpp: https://github.com/ggml-org/llama.cpp/
- Cuantizacion recomendada (Q4_K_M): https://huggingface.co/bartowski/GrootTeam_Groot-19B-A3B-261023-GGUF/blob/main/GrootTeam_Groot-19B-A3B-261023-Q4_K_M.gguf
