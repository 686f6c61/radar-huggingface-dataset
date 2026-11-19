# litert-community/Qwen3-1.7B

## Resumen

Qwen3-1.7B LiteRT-LM es una conversión del modelo Qwen3-1.7B de Alibaba Qwen al formato `.litertlm` de Google, optimizada para inferencia en dispositivo (on-device) mediante el runtime LiteRT-LM. El repositorio lo mantiene la comunidad `litert-community` y publica dos artefactos cuantizados que permiten ejecutar el modelo en GPU y CPU de dispositivos móviles Android, sin depender de servidores remotos. Es relevante porque demuestra que un transformer de 1.700 millones de parámetros puede correr con velocidades de decodificación cercanas a 30 tok/s en un smartphone de gama alta.

El modelo base es un transformer denso de Qwen3 con capacidades de razonamiento (thinking mode) y tool calling. La conversión emplea LiteRT Torch y AI Edge Quantizer para producir pesos INT8 e INT4 con activaciones FP32, e incorpora optimizaciones de grafo para la GPU (composite ops para RoPE, atención, SwiGLU y actualización de KV-cache, además de proyecciones QKV y Gate/Up fusionadas).

La ficha se centra en el artefacto publicado: el contexto por defecto es de 4.096 tokens (aunque el export se generó con una cache de 32.768), la licencia es Apache 2.0 y el idioma declarado es inglés. El tamaño del repositorio (12,6 GB) incluye ambas variantes y los pesos externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), exportado a LiteRT con composite ops para GPU |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens por defecto en metadatos; cache exportada de 32.768 tokens |
| Tipos de cuantizacion | INT8 dinámico canal a canal (pesos) + FP32 (activaciones); INT4 dinámico block-32 (pesos) + FP32 (activaciones) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); pesos externos en sección TFLiteWeights para la variante INT8 |

## Arquitectura y entrenamiento

El modelo base Qwen3-1.7B es un transformer decoder-only denso con atención multi-cabeza estándar y normalización RMSNorm, entrenado por Alibaba Qwen. Incorpora un modo de razonamiento explícito (thinking mode) que emite la cadena de pensamiento por un canal separado (`thought`), y soporta tool calling cuyo parseo realiza el propio runtime LiteRT-LM. La model card del repositorio no detalla la composición del dataset de entrenamiento ni si hubo fases de RLHF o DPO; esa información corresponde al modelo original y no se reproduce aquí.

La conversión a LiteRT-LM se realizó con `litert-torch` (commit `0a81bf6f3`) usando `export_hf` con `--apply_gpu_composites=True`. Se generaron dos artefactos: uno con pesos INT8 dinámicos y pesos externos (1.674 MiB) y otro con pesos INT4 dinámicos en bloques de 32 (932 MB). Ambos aplican composite ops para RMSNorm, QK-norm, RoPE, atención, SwiGLU y actualización de KV-cache, y fusionan las proyecciones QKV y Gate/Up. La variante INT8 se exportó con longitudes de prefill de 128 y 1.024 tokens y una cache de 32.768 tokens, con asignación estática de memoria en prefill. El tokenizador es idéntico byte a byte al de Qwen/Qwen3-1.7B.

## Capacidades

- Generación de texto autoregresiva en inglés, con calidad derivada del modelo base Qwen3-1.7B.
- Modo de razonamiento (thinking mode) activado por defecto; puede desactivarse con `enable_thinking=false`. La cadena de pensamiento se entrega por el canal `thought`.
- Tool calling / function calling: el runtime LiteRT-LM parsea las llamadas a herramientas según la configuración oficial de Qwen3.
- Razonamiento multi-paso y uso como agente ligero, limitado por el contexto de 4.096 tokens por defecto.
- Inferencia en dispositivo en GPU (OpenCL) y CPU, sin conexión a red.
- Soporte de prompts largos mediante prefill por lotes (longitudes de 128 y 1.024 tokens en el export).
- No se declaran capacidades de visión, audio ni multimodalidad en esta conversión.

## Casos de uso

- Asistentes conversacionales offline en Android: el modelo puede gestionar diálogos multi-turno dentro de la ventana de 4.096 tokens y responder sin conexión, adecuado para apps de productividad o accesibilidad que no pueden enviar datos a la nube.
- Autocompletado y redacción en teclados móviles: la variante INT4 (932 MB) cabe en almacenamiento de gama media y decodifica a 38,8 tok/s en Galaxy S26, suficiente para sugerencias en tiempo real.
- Clasificación y extracción de información local: resumir notas, correos o mensajes en el propio dispositivo, evitando el envío de datos personales a servidores externos.
- Agentes ligeros con tool calling: el runtime parsea llamadas a funciones, lo que permite integrar el modelo en apps que consultan calendarios, contactos o APIs locales mediante herramientas definidas por el desarrollador.
- Prototipado de investigación en eficiencia de inferencia: sirve como banco de pruebas para medir latencia, memoria pico (RSS) y throughput en GPU móvil con distintas cuantizaciones y versiones del runtime.
- Demos educativas y de divulgación: la app Edge Gallery permite importar el `.litertlm` desde Hugging Face y probar el modelo en un teléfono sin escribir código, útil para talleres y demostraciones.
- Razonamiento paso a paso en el dispositivo: con thinking mode activo, puede resolver problemas aritméticos o lógicos sencillos mostrando la cadena de pensamiento, útil en apps de tutoría.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K). Sí incluye mediciones de rendimiento de inferencia en dispositivo:

| Dispositivo / runtime | Artefacto | Prefill (tok/s) | Decode (tok/s) |
|---|---|---:|---:|
| Galaxy S26, LiteRT-LM 0.19.0, GPU OpenCL | `Qwen3_1.7B.litertlm` (INT8, nuevo export) | 2.064 (1.024 tokens) | 29,7 |
| Galaxy S26, LiteRT-LM 0.19.0, GPU OpenCL | `Qwen3_1.7B.litertlm` (export anterior) | 516 | 15,4 |
| Galaxy S26, GPU OpenCL | `Qwen3-1.7B_dynamic_wi4b32_afp32.litertlm` (INT4) | 1.187 | 38,8 |

Memoria pico (VmHWM) en CPU con prompt de 1.355 tokens, 256 tokens de decodificación y cache KV de 2.048 tokens:

| Dispositivo | Export nuevo (INT8) | Export anterior |
|---|---:|---:|
| Pixel 8a | 3.254–3.267 MiB | 2.776–3.080 MiB |
| Galaxy S26 | 3.408–3.460 MiB | 2.853–3.109 MiB |

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM/almacenamiento: la variante INT8 ocupa 1.674 MiB en disco; la INT4, 932 MB. En CPU, el pico de RSS medido ronda 3,2–3,5 GiB con contexto de 2.048 tokens en Pixel 8a y Galaxy S26.
- GPU móviles: ruta GPU validada en Galaxy S26 (OpenCL) con LiteRT-LM 0.19.0; la variante INT8 requiere 0.19.0 o superior en GPU y 0.18.0 o superior en CPU.
- GPU de escritorio: no se documentan requisitos para A100, H100 o RTX 4090; el formato `.litertlm` está orientado a dispositivos móviles y edge.
- ¿Cabe en GPU de consumo? El formato no está pensado para GPUs de escritorio; para esos entornos conviene usar el modelo base Qwen3-1.7B en safetensors o GGUF.
- Despliegue: `litert-lm` (CLI y Python), app Edge Gallery en Android. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ver tabla de benchmarks; en Galaxy S26 con GPU se alcanzan 29,7 tok/s (INT8) y 38,8 tok/s (INT4) en decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---:|---|---|---|
| Qwen3-1.7B LiteRT-LM (este) | 1,7 B | 4.096 (cache 32.768) | `.litertlm` | Apache 2.0 | On-device Android |
| Qwen/Qwen3-1.7B (original) | 1,7 B | No disponible en esta ficha | safetensors | Apache 2.0 | Servidor/GPU |
| Gemma 3 1B (LiteRT) | 1 B | No disponible en esta ficha | `.litertlm` | Términos Gemma | On-device Android |
| Llama 3.2 1B | 1,2 B | 128 K | safetensors, GGUF | Llama 3.2 Community | Servidor y edge |

La comparación con Gemma 3 1B y Llama 3.2 1B se ofrece como referencia de categoría; los datos de contexto y licencia corresponden a esos modelos y no se han verificado en la información proporcionada para esta ficha.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Contexto: el contexto por defecto es de 4.096 tokens, insuficiente para documentos largos; aunque el export admite cache de 32.768, no se documenta su uso estable.
- Alucinación: al ser un modelo de 1,7 B parámetros, la tasa de errores factuales es mayor que en modelos de mayor tamaño; no debe usarse como fuente de verdad sin verificación.
- Sesgos: no se documentan evaluaciones de sesgo para esta conversión; hereda los del modelo base Qwen3-1.7B.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base y de los artefactos derivados.
- Runtime: la ruta GPU del export INT8 falla en LiteRT-LM 0.18.1 (kernels composite no compilan) y las builds Android 0.18.0/0.18.1 se cuelgan con pesos externos; es necesario usar 0.19.0 o superior.
- Memoria: el export INT8 nuevo consume más RAM en CPU que el anterior (hasta ~600 MiB adicionales en Galaxy S26), lo que puede ser problemático en dispositivos con poca memoria.
- Formato propietario: `.litertlm` no es portable a otros runtimes; para servir el modelo en la nube hay que recurrir al Qwen3-1.7B original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Qwen3-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- App Edge Gallery (Google Play): https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery
- Edge Gallery (GitHub): https://github.com/google-ai-edge/gallery
- Wiki de Edge Gallery: https://github.com/google-ai-edge/gallery/wiki
- Releases de Edge Gallery: https://github.com/google-ai-edge/gallery/releases
- Runtime LiteRT-LM (pip): `pip install litert-lm`
