# IndrasMirror/Qwen3.8-27B-Swift-1.5-XQ-Uncensored

## Resumen

Qwen3.8-27B-Swift-1.5-XQ-Uncensored es una cuantización de precisión mixta en formato GGUF del modelo Swift 1.5, un fine-tune de razonamiento eficiente de Qwen3.8-27B desarrollado por UkisAI. La publicación corre a cargo de IndrasMirror, que aplica su pipeline propietario XQ tras un proceso de abliteración (edición de la dirección de rechazo) sobre los pesos en precisión completa. El resultado es un modelo denso de 27.320.697.856 parámetros con capacidades de visión, empaquetado en 14,18 GB para caber íntegramente en una GPU de consumo de 24 GB.

El modelo resuelve un problema concreto de despliegue: mantener contexto de 200K, decodificación especulativa MTP y el codificador visual residentes en una sola RTX 4090 con un pico de 23,7 GB de VRAM. Frente a la alternativa Q4_K_M de llama.cpp (16,81 GB) ocupa 2,3 GB menos con una degradación de perplejidad moderada, y frente al build IQ3_S de d0xin (13,20 GB) reduce la KL un 42 % en el conjunto corto y un 29 % en el de 32K.

La relevancia actual radica en la combinación de tres factores poco habituales: cuantización de precisión mixta a 3,82 bits por peso de media, abliteración aplicada antes de cuantizar (de modo que el cuantizador se ajusta al modelo que realmente se ejecuta) y soporte de visión junto con decodificación especulativa dentro del mismo presupuesto de memoria. La licencia es swift-open-license-1.0, marcada como "other" en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arch `qwen35`) con bloque MTP y codificador visual |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 200K tokens (configurada en Xolotl; KV cache k8v4) |
| Tipos de cuantizacion | GGUF de precisión mixta: IQ4_XS (5,79 GB), IQ3_XXS (1,98 GB), IQ3_S (1,73 GB), Q3_K (1,11 GB), Q4_K (0,58 GB), IQ4_NL (0,29 GB), Q5_K (0,07 GB); embeddings y cabeza de salida en Q6_K; bloque MTP en Q8_0. Media de 3,82 bits por peso |
| Idiomas soportados | en, zh, code (según etiquetas del autor) |
| Licencia | swift-open-license-1.0 (`license: other`) |
| Formato de pesos | GGUF (866 tensores, 14,18 GB) + proyector visual GGUF BF16 (0,93 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de 27B parámetros, y hereda la arquitectura `qwen35` con un bloque MTP (multi-token prediction) que habilita decodificación especulativa. Sobre esa base, UkisAI produjo Swift 1.5, un fine-tune orientado a eficiencia de razonamiento. IndrasMirror aplica después una abliteración en precisión completa mediante una búsqueda ARA con LoRA por módulo (capas 15 a 58) usando Heretic, fusionada en los pesos BF16. Finalmente, el pipeline XQ asigna a cada matriz de capa su propio formato y ancho de bits a partir de un presupuesto medido, ajustado contra el modelo ya abliterado.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. La innovación técnica destacable es doble: la abliteración previa a la cuantización (el cuantizador se ajusta al modelo final, no al original) y la asignación de precisión mixta por tensor, que concentra bits en las capas sensibles y los recorta en las demás. El bloque MTP se preserva en Q8_0 (0,45 GB) para no degradar la decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" (presupuesto de 32K tokens en las pruebas del autor; media de 455 tokens de pensamiento, mediana de 192).
- Capacidades de visión: pipeline image-text-to-text, con proyector visual BF16 procedente de Qwen3.8-27B sin modificar.
- Generación de código y tareas agenticas con uso de herramientas en sandbox.
- Soporte de tool calling y razonamiento multi-paso (validado en Gauntlet v3-small con herramientas y tests ocultos).
- Decodificación especulativa MTP 3 + n-gram integrada en la configuración de servicio.
- Multilingüe limitado a inglés, chino y código según las etiquetas del autor.
- Comportamiento "uncensored": 0 rechazos en 100 prompts dañinos y 0 en 100 prompts inocuos según las puertas de comportamiento del autor.

## Casos de uso

- Agentes de codificación autónomos: el modelo resuelve tareas con herramientas en sandbox y tests ocultos (6/6 en Gauntlet v3-small), con 73.190 tokens y 10,4 minutos de reloj en una RTX 4090, lo que lo hace viable para bucles de agente de varias vueltas en hardware de consumo.
- Asistente de programación en IDE con contexto largo: la ventana de 200K permite cargar repositorios completos o transcripciones extensas de herramientas sin truncar, manteniendo el codificador visual residente para capturas de pantalla de errores.
- Análisis de documentos e imágenes combinados: al ser image-text-to-text, puede procesar diagramas, capturas de interfaz o gráficos junto a texto en la misma conversación.
- Servicio de inferencia local de altas prestaciones: con 101-126 tok/s de decodificación y 1.837-2.121 tok/s de prefill en Xolotl, es adecuado para servir a un usuario en una estación de trabajo con una sola GPU de 24 GB.
- Investigación sobre alineación y rechazo: al estar abliterado y documentar métricas de rechazo, sirve como base para estudiar direcciones de rechazo y comportamiento de modelos sin censura en entornos controlados.
- Fine-tuning y experimentación con cuantización: al ser GGUF estándar con tipos ggml convencionales, se puede cargar en llama.cpp para evaluar pipelines de cuantización o comparar contra otros builds.
- Procesamiento de transcripciones agenticas largas: el conjunto de evaluación de 32K con transcripciones reales de herramientas y lecturas de ficheros refleja el caso de resumir o continuar sesiones de agente extensas.

## Benchmarks y rendimiento

Calidad frente al Swift 1.5 abliterado Q8_0 del que se cuantizó, medida con `llama-perplexity --kl-divergence`:

| Fichero | Tamano | Corto: KL / mismo top / ratio ppl | 32K agente: KL / mismo top / ratio ppl |
|---|---|---|---|
| Q4_K_M (llama.cpp, imatrix) | 16,81 GB | 0,805 / 84,7 % / x1,44 | 2,60 / 73,2 % / x3,10 |
| **este (XQ 3.8)** | **14,47 GB** | **0,881 / 83,8 % / x1,47** | **3,02 / 70,1 % / x2,73** |
| XQ 3.53 (no publicado) | 13,65 GB | 1,008 / 81,9 % / x1,42 | 3,30 / 67,8 % / x2,96 |
| d0xin IQ3_S | 13,20 GB | 1,517 / 77,4 % / x1,63 | 4,26 / 63,2 % / x2,75 |

Puertas de comportamiento (Q6_K abliterado previo frente a este fichero):

| Metrica | Q6_K padre | este |
|---|---|---|
| Prompts dañinos rechazados (de 100) | 0 | 0 |
| Prompts inocuos rechazados (de 100) | 0 | 0 |
| Responde "no lo sé" a preguntas sin respuesta (de 30) | 21 | 19 |
| Preguntas factuales correctas (de 30) | 28 | 29 |
| Código vulnerable detectado / código limpio marcado (de 20) | 20 / 2 | 20 / 2 |
| Problemas cortos de razonamiento correctos (de 48) | 48 | 48 |
| Tokens de pensamiento, media / mediana | 375 / 154 | 455 / 192 |

Gauntlet v3-small (6 tareas agenticas de codificación, 10 turnos, thinking con presupuesto de 32K, decodificación greedy):

| Modelo | Tamano | Resueltas | Puntuacion | Tokens | Tiempo | Decodificacion |
|---|---|---|---|---|---|---|
| **este (XQ 3.8)** | 14,2 GB | **6/6** | **6,00** | **73.190** | **10,4 min** | **~120 tok/s** |
| XQ 3.53 (no publicado) | 13,4 GB | 3/6 | 4,44 | 127.170 | 19,6 min | 111,9 tok/s |
| d0xin IQ3_S | 13,2 GB | 5/6 | 5,50 | 116K | no disponible | 104,6 tok/s |
| XQ Qwen3.8-27B base 4,5 bpw | 16,2 GB | 4/6 | 4,97 | 153K | 26 min | 99,6 tok/s |

Velocidad en Xolotl (RTX 4090, 256 tokens generados, prompt nuevo):

| Prompt | Prefill | Decodificacion |
|---|---|---|
| 6.000 | 2.091-2.121 tok/s | 101-115 tok/s |
| 16.000 | 1.837-1.864 tok/s | 114-126 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 14,18 GB de pesos + 0,93 GB de proyector visual; pico medido de 23,7 GB con contexto de 200K, KV cache k8v4 y MTP residentes.
- GPU recomendada: RTX 4090 24 GB (configuración validada por el autor). GPUs de 24 GB o más (A100 40/80 GB, H100, L40S) sin problema; en 16 GB no cabe con contexto largo.
- Cabe en GPU de consumo: sí, en RTX 4090 y presumiblemente en RTX 3090 (24 GB); no en tarjetas de 16 GB o menos con la configuración completa.
- Despliegue: Xolotl (configuración de servicio incluida, `xolotl-27b-swift-xq.json`) y llama.cpp (todos los tensores son tipos ggml estándar). El autor no menciona soporte de vLLM, TGI ni Ollama.
- Latencia y throughput medidos: 101-126 tok/s de decodificación y 1.837-2.121 tok/s de prefill en RTX 4090; ~120 tok/s durante la ejecución del Gauntlet.
- Entorno de referencia: Linux, RTX 4090 24 GB, Ryzen 7 5700X, 110 GB DDR4, modelo en NVMe.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Calidad (Gauntlet v3-small) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Qwen3.8-27B-Swift-1.5-XQ** | 27,3B denso | 200K | 14,18 GB | 6/6, 6,00 | swift-open-license-1.0 | Hugging Face (832 descargas) |
| d0xin IQ3_S (Swift 1.5 uncensored) | 27B denso | no disponible | 13,20 GB | 5/6, 5,50 | no disponible | Hugging Face |
| XQ Qwen3.8-27B base 4,5 bpw | 27B denso | no disponible | 16,2 GB | 4/6, 4,97 | no disponible | no disponible |
| Q4_K_M llama.cpp (imatrix) | 27B denso | no disponible | 16,81 GB | no evaluado en Gauntlet | no disponible | llama.cpp |

## Limitaciones y advertencias

- La KL absoluta es alta en todos los ficheros comparados y el conjunto de 32K es difícil para todos; solo la comparación dentro de la misma tabla es significativa.
- Modelo abliterado: no rechaza prompts dañinos (0/100), lo que lo hace inadecuado para aplicaciones orientadas al público sin filtros externos. Un aviso fue marcado por el clasificador en la prueba del autor.
- Riesgo de alucinación: responde "no lo sé" a 19 de 30 preguntas sin respuesta, frente a 21 del Q6_K padre; la degradación es pequeña pero existe.
- Idiomas limitados a inglés, chino y código; no hay soporte documentado de castellano.
- Licencia swift-open-license-1.0 marcada como "other": es necesario revisar los términos antes de uso comercial, ya que no es una licencia estándar tipo Apache o MIT.
- El pipeline XQ es privado y no reproducible; las métricas de calidad provienen del propio autor y no han sido verificadas de forma independiente.
- El Gauntlet usa decodificación greedy con una sola ejecución por modelo (aunque repetida tres veces con el mismo resultado en tokens), por lo que no es una media sobre muestras.
- El modelo base Swift 1.5 es un fine-tune de terceros (UkisAI) sobre Qwen3.8-27B; la cadena de licencias y restricciones de los modelos intermedios debe verificarse.
- El autor no documenta soporte en vLLM, TGI u Ollama; el despliegue validado es Xolotl y llama.cpp.

## Enlaces

- Hugging Face: https://huggingface.co/IndrasMirror/Qwen3.8-27B-Swift-1.5-XQ-Uncensored
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Heretic (herramienta de abliteración): https://heretic-project.org
