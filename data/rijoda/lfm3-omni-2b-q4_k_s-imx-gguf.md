# Rijoda/LFM3-Omni-2B-Q4_K_S-imx-GGUF

## Resumen

LFM3-Omni-2B es un modelo omni-modal desarrollado por Liquid AI que acepta texto, imagen, vídeo y audio como entrada y produce texto o voz como salida. Con 1.728.801.600 parámetros reales (etiquetado comercialmente como 2.2B), una ventana de contexto de 128.000 tokens y un enfoque explícito de despliegue en dispositivo (on-device), se posiciona como una alternativa compacta para aplicaciones que necesitan percepción multimodal sin depender de infraestructura en la nube. Es un modelo no razonador: responde de forma directa, sin fase de pensamiento intermedia.

La ficha que nos ocupa no documenta el modelo original, sino una cuantización derivada: `Rijoda/LFM3-Omni-2B-Q4_K_S-imx-GGUF`, publicada por el usuario Rijoda. Se trata de una conversión a GGUF en formato Q4_K_S (4,85 bits por peso, 1007,1 MiB) generada con llama.cpp b12110 y calibrada con una importance matrix sobre un corpus mixto de prosa y código (120 fragmentos). El objetivo declarado es superar en tamaño y fidelidad al Q4_K_M estándar en una clase concreta de hardware: portátiles sin GPU dedicada, con iGPU Intel y backend Vulkan.

La relevancia de esta release es doble. Por un lado, demuestra que una cuantización bien calibrada puede reducir tamaño un 4,7 % y mejorar perplejidad un 4,0 % respecto al Q4_K_M estándar en el mismo corpus. Por otro, documenta con mediciones repetidas una ganancia de velocidad de decodificación de entre el 9,3 % y el 15,6 % en el hardware de referencia. No incluye el proyector multimodal, que debe descargarse sin modificar del repositorio base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer omni-modal (any-to-any), 24 capas con atencion en 11 de ellas (5 de ventana deslizante) |
| Parametros totales | 1.728.801.600 (etiquetado como 2.2B por el autor del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (128k) |
| Tipos de cuantizacion | Q4_K_S (4,85 BPW) en esta release; el repositorio base ofrece otras variantes GGUF |
| Idiomas soportados | en, de, fr, it, es, pt, nl, sv, da, fi, el, he, tr, ar, zh, ja, ko, vi, th, id, hi, ru, pl (22 idiomas) |
| Licencia | lfm1.0 (other) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si hubo fases de RLHF o DPO en el modelo base. Lo que sí se documenta es la estructura de inferencia: 24 capas, de las cuales solo 11 llevan atención (cinco de ellas con ventana deslizante), lo que reduce el coste del KV cache a aproximadamente 12 KB por token. Esa cifra permite sostener 128.000 tokens de contexto en unos 3,4 GB de VRAM compartida, un dato relevante para despliegue en iGPU. El modelo es no razonador, es decir, no genera una cadena de pensamiento antes de responder.

La innovación técnica de esta release concreta está en la cuantización. Frente al Q4_K_M estándar (5,05 BPW), el Q4_K_S mantiene el embedding y la proyección de salida del vocabulario de 128k en Q6_K, pero baja las down-projections de la FFN y `attn_v` de Q6_K a Q5_K. El autor midió que en su iGPU los matvec `q4_K` corren a 48,5 GB/s frente a 32-39 GB/s de `q6_K`, de modo que el mix más barato por byte resulta también más rápido. La calibración con importance matrix se hizo sobre 120 fragmentos de prosa y código. El proyector multimodal no forma parte de esta release: se descarga sin modificar desde el repositorio base (`mmproj-LFM3-Omni-2B-Q4_K_M.gguf`).

## Capacidades

- Generación de texto conversacional multi-turno en 22 idiomas, incluido el español.
- Entrada multimodal: texto, imagen, vídeo y audio, canalizados a través del proyector del repositorio base.
- Salida en texto o voz (any-to-any).
- Tool calling y function calling, con soporte de flujos multi-paso y recuperación de errores (validado en la suite de 22 tareas del autor).
- Seguimiento de instrucciones y cumplimiento de esquemas JSON.
- Generación de código.
- Contexto largo de hasta 128k tokens, útil para documentos extensos o conversaciones prolongadas.
- Reconocimiento de voz y respuesta hablada.
- Modo no razonador: responde directamente, sin fase de thinking; el autor recomienda `--reasoning off` en el servidor.

## Casos de uso

- Asistente de atención al cliente multimodal: el modelo puede recibir capturas de pantalla, notas de voz o vídeos cortos del usuario junto al texto y responder en el mismo canal, con 128k tokens de contexto para conservar el historial completo de la conversación.
- Transcripción y análisis de reuniones: entrada de audio con respuesta textual estructurada (actas, acuerdos, tareas), aprovechando el soporte de audio y el contexto largo para sesiones de más de una hora.
- Accesibilidad en dispositivo: descripción de imágenes y vídeo para usuarios con discapacidad visual, o lectura de documentos escaneados, ejecutándose localmente en un portátil sin GPU dedicada.
- Automatización de soporte técnico con tool calling: el modelo invoca funciones para consultar estado de pedidos, abrir tickets o reiniciar servicios, con capacidad de multi-step reasoning y recuperación ante errores de herramienta.
- Procesamiento de documentación técnica: resumen y extracción de datos de manuales extensos, contratos o informes, apoyándose en la ventana de 128k tokens y en el cumplimiento de esquemas JSON para salidas estructuradas.
- Asistente de código en local: generación y explicación de fragmentos de código dentro de un IDE, sin enviar el código a un servicio externo, gracias al formato GGUF y al despliegue con llama.cpp.
- Análisis de contenido audiovisual en campo: inspección de vídeo o audio grabado en dispositivos sin conectividad, con inferencia en iGPU y consumo de VRAM contenido (3,4 GB para el contexto completo).

## Benchmarks y rendimiento

Los datos disponibles corresponden a evaluaciones propias del autor de la cuantización, no a benchmarks estándar de la comunidad.

Perplejidad sobre *Pride and Prejudice* (primeros 250k caracteres, 63 fragmentos de 1024 tokens, greedy, `GGML_VK_FORCE_MMVQ=1`):

| Modelo | Tamano | Perplejidad |
|---|---:|---:|
| Q4_K_M estándar | 1048,7 MiB | 24,06 ± 0,44 |
| Esta release (Q4_K_S + imatrix) | 1007,1 MiB | 23,11 ± 0,42 |

Suite de 22 tareas deterministas (tool calling, herramientas multi-paso, recuperación de errores, seguimiento de instrucciones, esquema JSON, código, contexto largo, visión, audio):

| Modelo | Puntuación |
|---|---:|
| Q4_K_M estándar | 18/22 |
| Esta release | 18/22 |

Fallos idénticos en ambas variantes: código de cantón suizo (`ZG` en lugar de `ZH`), agregación SQL, "la capital de Suecia es Berna" y reconocimiento de números en voz (`thirty four` → `30`).

Velocidad de generación (Intel Core Ultra 7 255U, iGPU Intel, Vulkan, llama.cpp b12110, mediana de 5 rondas intercaladas):

| Profundidad de contexto | Q4_K_M prefill/decode | Esta release prefill/decode | Delta |
|---|---:|---:|---:|
| 512 | 415 / 31,1 t/s | 429 / 34,0 t/s | +3,4 % / +9,3 % |
| 4096 | 364 / 28,8 t/s | 375 / 33,3 t/s | +3,0 % / +15,6 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,4 GB para el contexto completo de 128k en el hardware de referencia, gracias a un KV cache de unos 12 KB por token. El archivo de pesos ocupa 1007,1 MiB; hay que sumar el proyector multimodal del repositorio base.
- GPU recomendadas: el autor valida Intel Core Ultra 7 255U con iGPU Intel y backend Vulkan. No se aportan mediciones para CUDA (A100, H100, RTX 4090) ni Metal.
- Cabe en iGPU de portátiles con memoria compartida (32 GB DDR5-5600 en la máquina de referencia). No se documenta comportamiento en GPU consumer dedicadas.
- Opciones de despliegue: llama.cpp (versión b12110 o superior) mediante `llama-server`; el formato GGUF es compatible con el ecosistema llama.cpp, aunque no se confirma soporte específico en Ollama, vLLM o TGI.
- Ajustes recomendados: `-ngl 99 -fa on -t 6 -c 131072 -np 1 -b 2048 -ub 1024 --reasoning off --temp 0 --jinja`.
- Variable de entorno `GGML_VK_FORCE_MMVQ=1`: no documentada oficialmente, aporta un +43 % de decodificación en la iGPU de referencia.
- Latencia y throughput: 34,0 t/s de decodificación a contexto 512 y 33,3 t/s a 4096 en la máquina de referencia; prefill de 429 y 375 t/s respectivamente.
- Advertencia de medición: el modo Ahorro de energía de Windows reduce el rendimiento aproximadamente 3× en esta iGPU, con independencia de si el portátil está enchufado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| LFM3-Omni-2B Q4_K_S imx (esta release) | 1,73B | 128k | Texto, imagen, vídeo, audio → texto/voz | lfm1.0 | GGUF en HuggingFace |
| LFM3-Omni-2B Q4_K_M estándar | 1,73B | 128k | Texto, imagen, vídeo, audio → texto/voz | lfm1.0 | GGUF en HuggingFace |
| LFM3-Omni-2B BF16 (base) | 1,73B | 128k | Texto, imagen, vídeo, audio → texto/voz | lfm1.0 | Safetensors/GGUF en HuggingFace |

No se dispone en la información proporcionada de comparaciones con modelos de otros fabricantes de tamaño o modalidad equivalentes. Los únicos datos comparativos son internos a la familia LFM3-Omni-2B: perplejidad 23,11 frente a 24,06 y decodificación entre un 9,3 % y un 15,6 % superior de esta release frente al Q4_K_M estándar.

## Limitaciones y advertencias

- La suite de evaluación de 22 tareas es una prueba de humo, no un benchmark: diferencias de una tarea están dentro del ruido estadístico.
- Las cifras de velocidad corresponden a una única máquina (Intel Core Ultra 7 255U, iGPU, Vulkan) y no son extrapolables a CUDA, Metal ni inferencia en CPU.
- El modo Ahorro de energía de Windows degrada el rendimiento aproximadamente 3× en la iGPU de referencia; las mediciones exigen desactivarlo y reiniciar.
- El modelo base es no razonador; no debe esperarse cadena de pensamiento ni auto-verificación. El autor recomienda `--reasoning off`.
- El proyector multimodal no está incluido: sin descargar `mmproj-LFM3-Omni-2B-Q4_K_M.gguf` del repositorio base, las entradas de imagen, vídeo y audio no funcionan.
- Errores documentados en la suite: código de cantón suizo incorrecto, agregación SQL, alucinación geográfica ("la capital de Suecia es Berna") y reconocimiento de números en voz.
- Licencia lfm1.0: es una licencia "other" con posibles restricciones para uso comercial; debe revisarse el texto completo antes de desplegar en producción.
- No se documentan sesgos conocidos del modelo base en la información disponible.
- El rendimiento en idiomas distintos del inglés no está evaluado en los datos aportados, pese a declararse soporte para 22 idiomas.
- La variable `GGML_VK_FORCE_MMVQ` no está documentada oficialmente en llama.cpp; su efecto debe medirse en cada hardware antes de confiar en ella.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/Rijoda/LFM3-Omni-2B-Q4_K_S-imx-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Repositorio GGUF del modelo base (proyector multimodal): https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
