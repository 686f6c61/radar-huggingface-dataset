# CaptchaKraken/TwilightV2-2B-GGUF

## Resumen

TwilightV2-2B-GGUF es la distribucion en formato GGUF del modelo TwilightV2-2B, un modelo de puntero ("pointer model") de 1.881.825.088 parametros (aproximadamente 1,88 mil millones) desarrollado por CaptchaKraken para la resolucion automatizada de captchas. A diferencia de un modelo generativo convencional, este modelo no produce texto: lee toda su respuesta (accion, coordenadas de puntos, arrastres, texto y momento de video) a partir de un unico prefill del prompt mediante unas cabezas ligeras ("pointer heads") que se aplican sobre los estados ocultos. Esta version GGUF esta pensada para ejecucion en CPU con llama.cpp, mientras que los pesos bf16 del repositorio base estan orientados a vLLM sobre GPU.

El modelo se construye sobre el language model Qwen3.5-2B junto con un encoder de vision, e incorpora un adaptador LoRA ya fusionado en los pesos. Los ficheros GGUF contienen unicamente el language model y el encoder visual; las cabezas de puntero se distribuyen por separado en `pointer_heads.safetensors` y deben alimentarse con los estados ocultos finales de cada token del prompt, obtenidos con embeddings activados y pooling `NONE`. El repositorio incluye ademas una herramienta de referencia en C++ (`pointer_states.cpp`) que realiza esta parte del trabajo con libllama y libmtmd.

Su relevancia es de nicho pero concreta: ofrece una via de despliegue en CPU para un modelo especializado en una tarea muy especifica (resolucion de captchas con marcas de elementos numeradas), con una licencia LGPL-3.0 y un ecosistema de repositorios hermanos de distintos tamanos (Sunlight V2 de 0,8B y Midnight V2 de 4B). El autor advierte que esta build de 2B solo ha pasado una prueba de humo (carga y devuelve estados de 2.048 dimensiones por token), sin puntuacion en el gate de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-2B como language model + encoder de vision) con cabezas de puntero externas |
| Parametros totales | 1.881.825.088 (aprox. 1,88B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, BF16 (language model); F16 (mmproj de vision) |
| Idiomas soportados | no disponible |
| Licencia | LGPL-3.0 |
| Formato de pesos | GGUF (Q4_K_M y BF16), safetensors (cabezas de puntero), mmproj GGUF F16 |

## Arquitectura y entrenamiento

La arquitectura combina un language model Qwen3.5-2B con un encoder de vision, sobre el que se aplica un adaptador LoRA ya fusionado en los pesos exportados. La innovacion principal es el mecanismo de puntero: en lugar de generar texto autoregresivamente, el modelo procesa un unico prefill del prompt (tokens de texto e imagen en orden de prompt) y expone el estado oculto final de cada token, que unas cabezas pequenas en `pointer_heads.safetensors` transforman directamente en la respuesta (accion, puntos, arrastres, texto o momento de video). Esto convierte la inferencia en una tarea de prefill intensiva en computo, no de decodificacion.

Segun la model card, el entrenamiento se realizo sobre 43.963 tableros ("boards") en una unica RTX 5080, y se evaluo con un gate de Tier 2 compuesto por 1.067 tableros reales etiquetados a mano, ejecutado en bf16 a traves de vLLM 0.25.1, con resultados del 72,6% en modo plano y 68,2% en modo con marcas. No se detalla la composicion del dataset, el numero de tokens ni si se emplearon tecnicas de RLHF o DPO. La conversion a GGUF se realizo con el commit `785322d` de llama.cpp en modo solo CPU, y la cuantizacion Q4_K_M se genero con `llama-quantize` sobre el BF16.

## Capacidades

- Lectura de captchas mediante puntero: devuelve acciones, coordenadas de puntos, arrastres, texto y momento de video a partir de un unico prefill.
- Procesamiento multimodal: acepta imagenes junto con el prompt de texto a traves del encoder de vision (mmproj).
- Localizacion de elementos marcados: los marcados numerados de elementos provienen del detector CNN de la familia (`CaptchaKrakenV2-CNN-large` o su variante lite).
- Salida estructurada mediante cabezas: no hay generacion de texto libre; la respuesta se decodifica con las utilidades `captchakraken.pointer.heads` y `layout` del cliente.
- Integracion con llama.cpp en CPU: soporta ejecucion con libllama y libmtmd, con embeddings activados y pooling `NONE`.
- Compatibilidad con vLLM en GPU: los pesos bf16 del repositorio base estan pensados para vLLM 0.25.1.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue explicito.

## Casos de uso

- Resolucion automatizada de captchas en pipelines de scraping etico: el modelo recibe la imagen del tablero y devuelve los puntos o arrastres necesarios en un unico prefill, lo que encaja en flujos donde la latencia de decodificacion es indeseable.
- Despliegue en entornos sin GPU: la build Q4_K_M (1,3 GB) mas el mmproj F16 (0,67 GB) permite ejecutar el modelo en servidores CPU o estaciones de trabajo modestas mediante llama.cpp.
- Procesamiento por lotes de tableros historicos: al ser un modelo de prefill, se puede paralelizar por peticiones (una imagen por request) para clasificar grandes volumenes de captchas ya almacenados.
- Integracion en herramientas de automatizacion de pruebas: util para equipos de QA que necesitan superar captchas en entornos de staging propios, con la salvedad de las restricciones legales y de licencia.
- Investigacion sobre modelos de puntero: sirve como referencia para estudiar la tecnica de extraer estados ocultos por token y aplicar cabezas ligeras en lugar de generacion autoregresiva.
- Evaluacion comparativa de la familia Twilight/Sunlight/Midnight: permite medir el equilibrio entre tamano (0,8B, 2B, 4B) y precision en el gate de Tier 2 sobre el mismo tipo de tarea.
- Prototipado de sistemas de vision-lenguaje con salida estructurada: el esquema de cabezas externas es reutilizable para otras tareas de localizacion sobre imagen.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden al modelo base TwilightV2-2B en bf16 sobre vLLM 0.25.1, no a esta build GGUF:

| Evaluacion | Modo | Resultado |
|---|---|---|
| Tier 2 gate (1.067 tableros reales etiquetados a mano) | Plano | 72,6% |
| Tier 2 gate (1.067 tableros reales etiquetados a mano) | Con marcas | 68,2% |

El autor indica que esta build de 2B en GGUF solo ha pasado una prueba de humo (carga correctamente y devuelve estados de 2.048 dimensiones para cada token), pero no ha sido puntuada en el gate. Las mediciones de cuantizacion citadas (Q4_K_M con precision equivalente a bf16 en el gate de imagenes fijas, aproximadamente el 102% de respuestas resueltas frente a vLLM bf16) corresponden a SunlightV2-0.8B, no a este modelo. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: Q4_K_M (1,3 GB) + mmproj F16 (0,67 GB) + cabezas (29 MB) requiere aproximadamente 2 GB de RAM; la variante BF16 (3,8 GB) + mmproj requiere aproximadamente 4,5 GB.
- GPU recomendadas: el autor recomienda usar los pesos bf16 con vLLM sobre GPU; para esta build GGUF el objetivo es CPU. No se especifican modelos de GPU concretos.
- Cabe en GPU de consumo: si, en terminos de memoria; el modelo base se entreno en una RTX 5080 y la variante bf16 puede servirse con vLLM en GPUs de gama alta de consumo, aunque no se detallan requisitos exactos.
- Opciones de despliegue: llama.cpp (libllama y libmtmd) para CPU; vLLM 0.25.1 para los pesos bf16 en GPU. No se menciona soporte de Ollama ni TGI.
- Latencia y throughput: no disponibles para esta build. El autor senala que, al ser un modelo de prefill, la cuantizacion a 4 bits apenas ahorra tiempo (solo reduce descarga y RAM) y que aproximadamente la mitad del tiempo por tablero corresponde al encoder de vision, donde cuantizar el mmproj no aporto mejora de velocidad (mediciones realizadas sobre SunlightV2-0.8B).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado en gate | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TwilightV2-2B-GGUF (este) | 1,88B | no disponible | no puntuado en esta build (72,6% plano / 68,2% con marcas en bf16) | LGPL-3.0 | GGUF para CPU |
| SunlightV2-0.8B | 0,8B | no disponible | no disponible en la informacion | no disponible | pesos publicados |
| MidnightV2-4B | 4B | no disponible | no disponible en la informacion | no disponible | pesos publicados |
| TwilightV2-2B (bf16) | 1,88B | no disponible | 72,6% plano / 68,2% con marcas | LGPL-3.0 | safetensors para vLLM |

Las tres familias (Sunlight, Twilight y Midnight) pertenecen al mismo autor y comparten el esquema de puntero, diferenciandose por tamano. No se dispone de datos de benchmarks de las variantes de 0,8B y 4B en la informacion proporcionada.

## Limitaciones y advertencias

- La build de 2B en GGUF no ha sido evaluada en el gate de Tier 2; solo se ha verificado que carga y produce estados de la dimension esperada.
- Las cabezas de puntero no estan incluidas en los ficheros GGUF: es imprescindible descargar `pointer_heads.safetensors` y ejecutar el prefill con embeddings activados y pooling `NONE`.
- Las cabezas requieren el cliente `CaptchaKraken` en el commit `ef2ec28` mas el parche `client-fixes.patch`; el cliente sin parche rechaza estas cabezas (`PACKED = 225`).
- Modelo de proposito muy especifico: no es un modelo de chat ni de generacion de texto general; no se documentan capacidades multilingues, tool calling ni razonamiento multi-paso.
- Riesgo de alucinacion en la localizacion de puntos y arrastres sobre imagenes fuera de distribucion; la precision publicada (72,6%/68,2%) deja un margen de error significativo.
- Licencia LGPL-3.0: permite uso comercial, pero impone obligaciones de copyleft sobre la biblioteca y las modificaciones; conviene revisar el cumplimiento antes de integrarlo en productos propietarios.
- El uso de resolucion de captchas puede contravenir los terminos de servicio de sitios de terceros y la legislacion aplicable; la licencia no cubre esos aspectos.
- No se detallan sesgos conocidos ni composicion del dataset de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CaptchaKraken/TwilightV2-2B-GGUF
- Modelo base (bf16, vLLM): https://huggingface.co/CaptchaKraken/TwilightV2-2B
- Adaptador LoRA: https://huggingface.co/CaptchaKraken/TwilightV2-2B-LoRA
- Variante 0,8B: https://huggingface.co/CaptchaKraken/SunlightV2-0.8B
- Variante 4B: https://huggingface.co/CaptchaKraken/MidnightV2-4B
- Detector CNN de elementos: https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-large
- Detector CNN lite: https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-lite
- Repositorio `CaptchaKraken/TwilightV2-2B-q4` (4-bit GPTQ, no publicado): https://huggingface.co/CaptchaKraken/TwilightV2-2B-q4
