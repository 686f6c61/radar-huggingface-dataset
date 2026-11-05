# CaptchaKraken/SunlightV2-0.8B-GGUF

## Resumen

SunlightV2-0.8B-GGUF es la distribucion en formato GGUF del modelo SunlightV2-0.8B, un modelo de 0,8 mil millones de parametros desarrollado por CaptchaKraken y especializado en la resolucion de captchas mediante un mecanismo de *pointer* o puntero. A diferencia de un modelo generativo convencional, este modelo no produce texto libre: lee su respuesta completa (accion, coordenadas de puntos, arrastres, texto y momento de video) a partir de un unico *prefill* del prompt, usando cabezas ligeras adicionales. Esta orientado a entornos de CPU mediante llama.cpp, con builds Q4_K_M y BF16, y se apoya en el modelo de lenguaje Qwen3.5-0.8B con un codificador de vision.

El modelo forma parte de la familia Sunlight V2, que incluye variantes de 2B (Twilight V2) y 4B (Midnight V2). La version GGUF esta pensada explicitamente para usuarios de CPU, mientras que para GPU se recomienda usar los pesos bf16 con vLLM. El repositorio incluye tanto el modelo de lenguaje cuantizado como el proyector multimodal (mmproj) y las cabezas de puntero en un fichero safetensors aparte, ya que estas no se integran en el GGUF.

Su relevancia actual radica en que demuestra un caso de uso muy concreto (automatizacion de captchas visuales) con un modelo pequeno que cabe en CPU y con requisitos de memoria muy bajos, lo que lo hace accesible para despliegues sin GPU. La licencia LGPL-3.0 condiciona su integracion en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-0.8B como LM base + codificador de vision), con cabezas de puntero externas |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, BF16 (modelo); F16 (mmproj vision) |
| Idiomas soportados | no disponible |
| Licencia | LGPL-3.0 |
| Formato de pesos | GGUF (modelo y mmproj), safetensors (cabezas de puntero) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-0.8B, un transformer multimodal que combina un modelo de lenguaje con un codificador de vision. Sobre esa base se anaden cabezas de puntero (*pointer heads*) que, en lugar de generar tokens de texto, decodifican directamente la respuesta a partir de los estados ocultos del *prefill*. El proceso es el siguiente: se ejecuta el prompt completo (texto e imagen) con embeddings activados y pooling `NONE`, se recogen los estados ocultos finales de cada token del prompt y se alimentan a las cabezas en `pointer_heads.safetensors`. Estas cabezas usan un layout antiguo (`PACKED = 165`), sin cabeza de numero de elemento, distinto del de las variantes 2B y 4B (`PACKED = 225`).

Los pesos GGUF contienen solo el modelo de lenguaje y el codificador de vision, con el LoRA ya fusionado; las cabezas no estan incluidas en el GGUF. La conversion se realizo con llama.cpp (commit `785322d`) en modo solo CPU: se exporto el modelo a BF16, se genero el mmproj en F16 y se cuantizo a Q4_K_M con `llama-quantize`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. El autor indica que los resultados de evaluacion del modelo base estan en el repositorio `CaptchaKraken/SunlightV2-0.8B`.

## Capacidades

- Lectura de captchas visuales mediante puntero: devuelve acciones, coordenadas de puntos, arrastres, texto y momento de video en un unico *prefill*, sin generacion de texto.
- Procesamiento multimodal: acepta imagenes junto con el prompt a traves del codificador de vision (mmproj).
- Resolucion de tableros de captcha con elementos numerados, cuya numeracion proviene del detector CNN externo `CaptchaKrakenV2-CNN-large` (o su version lite para CPU).
- Soporte de video: la respuesta puede incluir un momento de video (marcadores de video completo), aunque el parche de cliente corrige bugs de servido relacionados.
- Integracion con llama.cpp en CPU: ejecutable mediante `pointer_states.cpp`, que extrae los estados ocultos por token usando libllama y libmtmd.
- Compatibilidad con vLLM 0.25.1 en GPU (usando los pesos bf16 del repositorio base), previa aplicacion de `client-fixes.patch`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingueismo general.

## Casos de uso

- Automatizacion de resolucion de captchas en pipelines de scraping o pruebas: el modelo lee el tablero completo en un unico *prefill* y devuelve las coordenadas o el texto necesario, lo que encaja en flujos donde se requiere baja latencia y no hay GPU disponible.
- Despliegue en entornos de solo CPU: con Q4_K_M (0,53 GB) y el mmproj F16 (0,20 GB) se puede ejecutar en un servidor modesto o incluso en un portatil, con tiempos medidos de 1,48 s por tablero en un build AVX2 y 0,89 s en AVX-512.
- Procesamiento por lotes de tableros de captcha en un backend: al ser un modelo de *prefill* computacionalmente ligero, permite encolar peticiones de un tablero por vez con consumo de RAM reducido.
- Investigacion sobre modelos de puntero: sirve como referencia para estudiar la decodificacion basada en cabezas sobre estados ocultos, comparando el layout antiguo (`PACKED = 165`) con el de las variantes 2B y 4B.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye BF16 y Q4_K_M, lo que permite medir el impacto de la cuantizacion en precision (Q4_K_M logro 102,1% de las respuestas resueltas por vLLM bf16) y en tiempo.
- Integracion en herramientas de automatizacion de escritorio o navegador que necesiten resolver desafios visuales con elementos numerados, usando el detector CNN para la numeracion y este modelo para la respuesta.
- Prototipado de sistemas de vision con salida estructurada (puntos, arrastres, texto) sin depender de generacion autoregresiva, apropiado para entornos con restricciones de hardware.

## Benchmarks y rendimiento

Los datos publicados por el autor se centran en la comparacion GGUF frente a vLLM bf16 y en el conjunto de evaluacion Tier 2 del modelo base. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica | Resultado |
|---|---|
| Precision en el conjunto de tableros estaticos (1.813 respuestas) frente a vLLM bf16 | GGUF BF16: 100,0%; Q4_K_M: 102,1% de las respuestas resueltas por vLLM (perdio 43, gano 63) |
| Similitud de estados ocultos por token frente a transformers (cosine p50) | 0,9999 |
| Tiempo por tablero, build AVX2 (8 hilos, tablero de ~700 tokens) | BF16: 1,87 s; Q4_K_M: 1,48 s |
| Tiempo por tablero, build AVX-512 nativo | BF16: 0,92 s; Q4_K_M: 0,89 s |
| Conjunto Tier 2 (1.067 tableros reales etiquetados a mano, via vLLM 0.25.1) | bf16: 53,5% sin marcas / 51,3% con marcas; GPTQ: 53,9% / 50,8% |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU, los pesos bf16 del modelo base requieren aproximadamente 1,5 GB (tamano del fichero BF16) mas el mmproj de 0,20 GB.
- GPU recomendadas: el autor recomienda usar los pesos bf16 con vLLM en GPU; no se especifican modelos concretos como A100, H100 o RTX 4090.
- Cabe en CPU: si, es el objetivo del repositorio. Q4_K_M (0,53 GB) + mmproj F16 (0,20 GB) + cabezas (14 MB) suman menos de 1 GB en disco y RAM.
- Cabe en GPU de consumo: si, dado el tamano reducido (menos de 2 GB en bf16), aunque el autor orienta la version GGUF a CPU.
- Opciones de despliegue: llama.cpp (con `pointer_states.cpp` para extraer estados ocultos), vLLM 0.25.1 con `client-fixes.patch` para GPU.
- Latencia y throughput: 0,89-1,48 s por tablero en CPU segun build y cuantizacion; aproximadamente la mitad del tiempo corresponde al codificador de vision. No se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SunlightV2-0.8B-GGUF | 752 M | no disponible | Puntero multimodal para captchas, CPU | LGPL-3.0 | GGUF, safetensors |
| TwilightV2-2B | no disponible | no disponible | Puntero multimodal para captchas, layout `PACKED = 225` | no disponible | Repositorio HuggingFace |
| MidnightV2-4B | no disponible | no disponible | Puntero multimodal para captchas, layout `PACKED = 225` | no disponible | Repositorio HuggingFace |
| CaptchaKrakenV2-CNN-large | no disponible | no disponible | Detector CNN de elementos numerados | no disponible | Repositorio HuggingFace |

Las variantes 2B y 4B de la misma familia usan un layout de cabezas mas reciente (incluyen cabeza de numero de elemento), por lo que no son intercambiables con este modelo a nivel de cliente. El detector CNN es un componente complementario, no un sustituto.

## Limitaciones y advertencias

- Modelo altamente especializado: no es un modelo de proposito general; su salida se limita a acciones, puntos, arrastres, texto y momentos de video dentro del dominio de captchas.
- Las cabezas de puntero no estan incluidas en el GGUF; es imprescindible usar `pointer_heads.safetensors` y el cliente con el layout correcto (`PACKED = 165`). Un cliente posterior (cambios del 30-10-2026) rechazara estas cabezas.
- Requiere aplicar `client-fixes.patch` sobre el commit `ef2ec28` antes de servir con vLLM 0.25.1, por dos bugs de servido (marcadores de video completo y prefix caching desactivado).
- Precision limitada: en el conjunto Tier 2 el modelo base obtiene 53,5% sin marcas y 51,3% con marcas, lo que implica una tasa de fallo cercana al 50% en tableros reales.
- La cuantizacion Q4_K_M introduce variabilidad: pierde 43 respuestas y gana 63 respecto a vLLM bf16, por lo que el comportamiento no es identico al modelo de referencia.
- No se dispone de informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion especificos; al no generar texto libre, el riesgo de alucinacion textual es bajo, pero puede producir coordenadas o acciones incorrectas.
- Licencia LGPL-3.0: el uso comercial es posible, pero la integracion en productos propietarios puede exigir el cumplimiento de obligaciones de copyleft sobre la biblioteca enlazada; conviene revisar con asesoria legal.
- Un tablero por peticion en el flujo de `pointer_states.cpp`; no se documenta soporte de batching.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion externa por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/CaptchaKraken/SunlightV2-0.8B-GGUF
- Modelo base bf16: https://huggingface.co/CaptchaKraken/SunlightV2-0.8B
- Version 4-bit GPTQ: https://huggingface.co/CaptchaKraken/SunlightV2-0.8B-q4
- Adaptador LoRA sin fusionar: https://huggingface.co/CaptchaKraken/SunlightV2-0.8B-LoRA
- Variante 2B (Twilight V2): https://huggingface.co/CaptchaKraken/TwilightV2-2B
- Variante 4B (Midnight V2): https://huggingface.co/CaptchaKraken/MidnightV2-4B
- Detector CNN de elementos: https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-large
- Detector CNN lite para CPU: https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-lite
- Repositorio del cliente (commit `ef2ec28`): https://github.com/CaptchaKraken (repositorio referenciado en la model card; no se dispone de URL directa)
