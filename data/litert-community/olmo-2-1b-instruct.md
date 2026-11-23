# litert-community/OLMo-2-1B-Instruct

## Resumen

OLMo-2-1B-Instruct en formato LiteRT-LM es una conversión del modelo allenai/OLMo-2-0425-1B-Instruct de AllenAI al runtime on-device de Google, LiteRT (el nuevo nombre de TensorFlow Lite). El paquete resultante, un fichero `.litertlm` de 0,93 GB, está pensado para inferencia de texto directamente en dispositivos móviles y de escritorio, sin necesidad de servidores ni GPU de datacenter. La conversión la mantiene la comunidad litert-community usando la herramienta oficial `litert-torch` (antes `ai-edge-torch`), sin parches propietarios.

El modelo base pertenece a la familia OLMo 2 de AllenAI, caracterizada por ser completamente abierta: pesos, datos de entrenamiento y código bajo licencia Apache-2.0. Esta variante de 1B parámetros está cuantizada a int4 por bloques (bloque de 32) con clipping óptimo OCTAV y embeddings en int8, lo que reduce el peso a menos de un gigabyte y permite ejecutarlo en un teléfono de 8 GB de RAM. La ventana de contexto del KV cache está fijada en 4096 tokens en este bundle.

Su relevancia actual radica en que demuestra un flujo de conversión reproducible desde PyTorch a un formato on-device con pérdida numérica despreciable (el conversor reproduce el modelo original con un error de 4e-7 en un Galaxy S26) y ofrece rendimiento medido: 48,8 tokens/s de decodificación y 690 tokens/s de prefill en la GPU de un Galaxy S26, y 150,1 tokens/s de decodificación en la GPU de un Apple M4 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 2), convertido a LiteRT-LM |
| Parametros totales | 1B (modelo base allenai/OLMo-2-0425-1B-Instruct) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (KV cache del bundle `ekv4096`) |
| Tipos de cuantizacion | int4 por bloques (bloque 32) con OCTAV optimal-clipping, simetrica; embeddings int8; computo entero |
| Idiomas soportados | no disponible (la model card no detalla idiomas; el modelo base OLMo 2 esta orientado principalmente a ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); fichero `OLMo-2-1B-Instruct_q4_block32_ekv4096.litertlm` de 0,93 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia OLMo 2 de AllenAI, entrenado desde cero con datos, código y recetas completamente abiertos. Esta ficha corresponde a la conversión, no al entrenamiento: los pesos se transformaron con `litert-torch` a un grafo LiteRT-LM para ejecución on-device, y el 14 de noviembre de 2026 un script separado reescribió los grafos de prefill y decode para GPU sin modificar los pesos. La cuantización aplicada es int4 por bloques de 32 con clipping óptimo OCTAV y embeddings en int8, con cómputo entero, lo que permite ejecución eficiente en aceleradores móviles.

El bundle incluye el tokenizer y la plantilla de prompt nativa de OLMo 2 (formato Tülu, con `<|user|>` / `<|assistant|>` y token de parada `<|endoftext|>`), por lo que no requiere ficheros de tokenizer externos. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo base; esos datos corresponden a la model card de allenai/OLMo-2-0425-1B-Instruct, no incluida aquí.

## Capacidades

- Generación de texto conversacional e instructiva, con plantilla de chat nativa de OLMo 2.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 1B parámetros.
- Ejecución on-device en macOS, Linux, Windows y Android con el mismo bundle.
- Servidor local compatible con la API de OpenAI mediante `litert-lm serve`.
- Ejecución en navegador con WebGPU a través del fichero de la rama `web` (931 MB).
- Integración en apps Android mediante la API Kotlin (`com.google.ai.edge.litertlm:litertlm-android`) o vía Google AI Edge Gallery.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistente conversacional offline en Android: el bundle de 0,93 GB se importa directamente desde Hugging Face en Google AI Edge Gallery 1.0.16+ y funciona sin conexión en un teléfono de 8 GB, útil para apps de productividad o accesibilidad sin dependencia de la nube.
- Chat local en escritorio para desarrolladores: `litert-lm run olmo-2-1b-instruct` arranca un chat interactivo en macOS, Linux o Windows, adecuado para prototipado rápido de prompts sin coste de API.
- Servidor de inferencia local compatible con OpenAI: `litert-lm serve` expone una API local que permite integrar el modelo en herramientas existentes que ya hablan el protocolo de OpenAI, útil para pruebas de pipelines de agentes en local.
- Demos web con WebGPU: la rama `web` del repositorio permite cargar el modelo en el navegador (931 MB) para demos interactivas o entornos educativos donde no se quiere instalar nada.
- Procesamiento de texto en el borde para privacidad: al ejecutarse íntegramente en el dispositivo, es apto para resumir o clasificar texto sensible que no debe salir del terminal.
- Benchmarking y validación de conversiones: sirve como referencia reproducible para medir latencia y throughput de LiteRT-LM en hardware móvil (por ejemplo, 48,8 tok/s de decode en Galaxy S26 GPU), útil para equipos que evalúan el runtime antes de adoptarlo.

## Benchmarks y rendimiento

Datos de rendimiento publicados en la model card (no son benchmarks de calidad tipo MMLU o HumanEval, sino de inferencia):

| Dispositivo | Backend | Prefill | Decode | TTFT |
|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 347 tok/s (256 tok) | 33,3 tok/s | 0,87 s |
| Apple M4 Max (macOS) | GPU (Metal) | 3223 tok/s (256 tok) | 150,1 tok/s | 0,10 s |
| Galaxy S26 | GPU | 690 tok/s (1024 tok) | 48,8 tok/s | no disponible |
| iPhone 17 Pro (iOS 27.0) | GPU (Metal) | 27,6 tok/s (prompt corto) | 24,4 tok/s | 0,95 s |

Notas de reproducibilidad: las cifras de GPU en M4 Max varían alrededor del 1% entre ejecuciones; las de CPU son más ruidosas (decode entre 29,0 y 33,3 tok/s, ±7%). En iPhone 17 Pro, el prefill se midió sobre un prompt de chat corto, por lo que está dominado por overhead fijo. Carga en iPhone: 5,2 s; huella pico: 1330 MB.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero pesa 0,93 GB; huella pico medida en iPhone 17 Pro de 1330 MB, por lo que cabe en dispositivos con 8 GB de RAM o más.
- GPU recomendadas: GPU integrada Metal en Apple Silicon (M4 Max medido), GPU de Android (Galaxy S26 medido) y WebGPU en navegador; no se documenta soporte de GPUs de datacenter (A100, H100, RTX 4090).
- Cabe en consumer GPU y en móviles: sí, en cualquier teléfono de 8 GB; en escritorio se ejecuta tanto en CPU como en GPU Metal.
- Opciones de despliegue: CLI `litert-lm` (run, import, serve, benchmark), Google AI Edge Gallery en Android, API Kotlin para apps Android, y WebGPU en navegador. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: TTFT de 0,10 s en M4 Max GPU y 0,95 s en iPhone 17 Pro; decode de 150,1 tok/s en M4 Max GPU, 48,8 tok/s en Galaxy S26 y 24,4 tok/s en iPhone 17 Pro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| OLMo-2-1B-Instruct (LiteRT-LM) | 1B | 4096 | `.litertlm` int4 | Apache-2.0 | On-device móvil y escritorio |
| allenai/OLMo-2-0425-1B-Instruct | 1B | no disponible en esta ficha | safetensors (modelo original) | Apache-2.0 | Entrenamiento e inferencia estándar |
| Otros modelos ~1B on-device (Gemma, Qwen pequeños) | ~1B | variable | GGUF, litertlm, etc. | variable | On-device |

No se dispone en la información proporcionada de datos de rendimiento comparables de otros modelos de la misma categoría; la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Modelo de 1B parámetros: capacidad de razonamiento y conocimiento factual limitada en comparación con modelos mayores; riesgo elevado de alucinación en tareas de conocimiento.
- Contexto fijado a 4096 tokens en este bundle; no se puede ampliar sin reconvertir el modelo.
- Idiomas no documentados; el modelo base OLMo 2 está orientado principalmente al inglés, por lo que el rendimiento en castellano no está garantizado.
- La cuantización int4 introduce pérdida de precisión respecto al modelo original, aunque la conversión de grafo se midió con error de 4e-7.
- Problema conocido del CLI: versiones 0.14.0 a 0.19.2 pueden reutilizar descargas incompletas del caché sin verificar el tamaño, provocando fallos (bus error, exit 138) o errores `too large for file size`; hay que borrar el fichero y repetir la descarga.
- El fichero se reemplazó el 15 de noviembre de 2026 (hora de Japón); descargas anteriores deben eliminarse manualmente del caché para evitar ejecutar la versión antigua.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de las dependencias del runtime LiteRT-LM.
- No se documenta soporte de tool calling, agentes multi-paso, visión ni audio; no apto para pipelines de agentes complejos sin capas adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/OLMo-2-1B-Instruct
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Demo web de chat: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/OLMo-2-1B-Instruct
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Benchmark de referencia en Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
