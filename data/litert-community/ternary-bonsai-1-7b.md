# litert-community/Ternary-Bonsai-1.7B

## Resumen

Ternary-Bonsai-1.7B es un paquete de pesos cuantizados en ternario (INT2) del modelo `prism-ml/Ternary-Bonsai-1.7B-unpacked`, empaquetado por la comunidad `litert-community` para el runtime LiteRT-LM de Google AI Edge. Se distribuye en formato `.litertlm`, pensado para ejecutarse en dispositivos Android (y en CPU de escritorio mediante el paquete Python `litert-lm`), con backend GPU o CPU, pero no NPU. No incorpora entrenamiento nuevo: es una derivacion post-entrenamiento del checkpoint Bonsai publicado, que a su vez procede de Qwen3-1.7B (Alibaba Cloud, Apache-2.0).

El modelo resuelve el problema de desplegar un LLM de chat de 1.700 millones de parametros en moviles con un peso de pesos extremadamente reducido gracias a la cuantizacion ternaria por canal, manteniendo la plantilla de chat de Qwen3 ChatML con bloque de razonamiento. Su contexto maximo es de 32.768 tokens (los paquetes estandar limitan a 4.096 y las variantes experimentales llegan a 32.768). La licencia Apache-2.0 y la ausencia de datos de calibracion adicionales simplifican su adopcion comercial.

Es relevante ahora porque demuestra que la cuantizacion a 2 bits por peso es viable en produccion sobre GPU movil (Tensor G6) con velocidades de decodificacion de 7,9 tok/s, y porque expone con transparencia las limitaciones actuales del runtime (fallo del build fp16 en GPU, ausencia de soporte NPU). La fecha de creacion del repositorio es el 10 de septiembre de 2026 y la ultima actualizacion el 9 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-1.7B) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens en paquetes estandar; 32.768 tokens en builds experimentales (`max_position_embeddings`) |
| Tipos de cuantizacion | Pesos INT2 ternarios por canal (per-channel); activaciones fp32 o fp16 segun build |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); repo de 7,7 GB con multiples bundles |
| Backends soportados | GPU (recomendado) y CPU; NPU no soportado |
| Plantilla de chat | Qwen3 ChatML con bloque de razonamiento incluido |
| Muestreo por defecto | TOP_P, top-k 20, top-p 0.85, temperatura 0.5 |
| Modelo base | `prism-ml/Ternary-Bonsai-1.7B-unpacked` (Apache-2.0) |
| Origen ultimo | Qwen3-1.7B, Copyright 2024 Alibaba Cloud, Apache-2.0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer decoder-only denso con atencion causal estandar. Sobre ese checkpoint, Prism ML aplico una cuantizacion ternaria (INT2) por canal, y `litert-community` reempaqueto los pesos en el formato `.litertlm` para LiteRT-LM, incluyendo metadatos de muestreo (`LlmMetadata`) y la plantilla de chat. No se realizo entrenamiento, fine-tuning ni calibracion adicional: los pesos son una transformacion post-entrenamiento del checkpoint Bonsai publicado.

La innovacion tecnica principal es la compresion a 2 bits por peso con operadores `FULLY_CONNECTED` en INT2 que LiteRT ejecuta directamente. En CPU, XNNPACK no dispone de kernel INT2, por lo que las operaciones en coma flotante se ejecutan en XNNPACK y las INT2 caen a los kernels nativos de LiteRT; un runtime con YNNPACK aceleraria la CPU, aunque no es requisito. Los builds experimentales anaden atencion fusionada (SDPA) y variantes de prefill multiple para contexto largo. Existen dos familias de activaciones: fp32 (recomendada) y fp16 (mas ligera en GPU pero actualmente rota en las GPU probadas).

## Capacidades

- Generacion de texto conversacional con plantilla Qwen3 ChatML y bloque de razonamiento (`thinking`) preservado.
- Razonamiento multi-paso basado en el modo thinking heredado de Qwen3.
- Generacion de codigo y matematicas a nivel de un modelo de 1.7B (capacidad heredada de Qwen3-1.7B; sin benchmarks publicados en esta ficha).
- Ejecucion on-device en Android mediante Google AI Edge Gallery y en escritorio via `litert-lm`.
- Soporte de contexto largo hasta 32.768 tokens solo en builds experimentales (los estandar se limitan a 4.096).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Vision, audio o multimodalidad: no soportado (pipeline `text-generation`).

## Casos de uso

- Asistente de chat offline en Android: integrado en Google AI Edge Gallery con backend GPU, ofrece respuestas locales sin conexion a ~7,9 tok/s de decodificacion y 1,9 s hasta el primer token en un Pixel 11 Pro XL, adecuado para consultas conversacionales breves.
- Prototipado de agentes con razonamiento en dispositivo: el bloque de razonamiento de Qwen3 permite cadenas de pensamiento locales para tareas de clasificacion o extraccion de datos sin enviar texto a la nube.
- Procesamiento de documentos con contexto medio en builds experimentales de 32k: resumen y extraccion de campos en contratos o correos de hasta ~30.000 tokens, siempre que la app soporte los bundles experimentales SDPA.
- Generacion de codigo asistida en movil: autocompletado y explicacion de fragmentos cortos en editores Android, aprovechando la plantilla ChatML y el bajo consumo de memoria del INT2.
- Evaluacion de cuantizacion ternaria en pipelines de investigacion: banco de pruebas para medir la degradacion de calidad de INT2 frente a fp16/GGUF sobre el mismo checkpoint Qwen3-1.7B.
- Despliegue en CPU x86 de escritorio: uso del paquete Python `litert-lm` para servir el modelo en entornos sin GPU, con ~5,7 tok/s de decodificacion en el hardware de referencia medido (Pixel 11 Pro XL, no escritorio).
- Filtrado y moderacion de texto en el dispositivo: clasificacion de mensajes con latencia de primer token inferior a 2,5 s en CPU movil, sin coste de API.

## Benchmarks y rendimiento

Rendimiento medido por el autor en Pixel 11 Pro XL (Tensor G6), Google AI Edge Gallery 1.0.23, 256 tokens de prefill + 256 de decode, 3 ejecuciones, mediana:

| Backend | Fichero | Prefill | Decode | Time to first token |
|---|---|---|---|---|
| GPU | `-fp32` | 146 tok/s | 7,9 tok/s | 1,9 s |
| CPU | `-fp32` | 128 tok/s | 5,7 tok/s | 2,2 s |

La primera carga en GPU tarda unos 40 s por la compilacion de programas GPU; Edge Gallery los cachea y las cargas posteriores tardan unos 5 s. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repo completo ocupa 7,7 GB, pero cada bundle individual es mucho menor; el tamano exacto por fichero no se detalla en la model card.
- GPU moviles verificadas: Pixel 11 Pro XL (Tensor G6, PowerVR) y Pixel 9 (Tensor G4, Mali); el build fp16 falla en ambas GPU (salida vacia o texto corrupto).
- CPU: verificado en Pixel 9 Pro XL (backend CPU) y en CPU x86 de escritorio mediante el paquete Python `litert-lm`.
- NPU: no soportado por estos bundles.
- GPU de escritorio (A100, H100, RTX 4090): no disponible; el runtime LiteRT-LM esta orientado a dispositivos, no se documenta despliegue en estas GPU.
- Opciones de despliegue: Google AI Edge Gallery, binario `litert_lm_main`, paquete Python `litert-lm` y apps de ejemplo en `google-ai-edge/litert-samples`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 1,9 s (GPU) y 2,2 s (CPU) hasta el primer token; throughput de 7,9 y 5,7 tok/s respectivamente en el hardware medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| Ternary-Bonsai-1.7B (este) | 1,7B | 4.096 / 32.768 (experimental) | INT2 ternario | Apache-2.0 | LiteRT-LM (GPU/CPU movil) |
| Qwen3-1.7B (origen) | 1,7B | 32.768 | fp16/bf16, GGUF, AWQ | Apache-2.0 | vLLM, llama.cpp, TGI, etc. |
| Ternary-Bonsai-1.7B-unpacked (Prism ML) | 1,7B | 32.768 | INT2 sin empaquetar | Apache-2.0 | Requiere conversion propia |
| Modelos 1-2B en GGUF Q4 (generico) | ~1-2B | variable | 4 bits | variable | llama.cpp, Ollama |

La ventaja diferencial frente a Qwen3-1.7B es el tamano de pesos (INT2 frente a fp16) y la integracion directa con LiteRT-LM en Android; la desventaja es el ecosistema limitado (sin vLLM, llama.cpp ni Ollama) y la ausencia de benchmarks de calidad publicados. No se dispone de datos de rendimiento de terceros para una comparacion cuantitativa.

## Limitaciones y advertencias

- El build fp16 esta roto en GPU con los runtimes actuales (2026-11-08): salida `!!!!` en Pixel 11 (Tensor G6) y texto corrupto en Pixel 9 (Tensor G4). Usar el fichero fp32 hasta que se publique el arreglo.
- Sin soporte NPU: no se puede aprovechar el acelerador neuronal de los SoC Android.
- Contexto estandar limitado a 4.096 tokens; los builds de 32.768 son experimentales y pueden no cargar segun la version de LiteRT/LiteRT-LM de la app.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, GSM8K); el impacto de la cuantizacion ternaria en la precision no esta cuantificado en la informacion disponible.
- La model card no declara idiomas soportados ni sesgos conocidos; el comportamiento multilingue y los sesgos heredados de Qwen3-1.7B no estan documentados aqui.
- Riesgo de alucinacion inherente a un modelo de 1,7B; no se recomienda para tareas de alta precision sin verificacion externa.
- Sin datos de entrenamiento, fine-tuning ni calibracion propios: la calidad depende enteramente del checkpoint Bonsai y de Qwen3-1.7B.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribucion a Alibaba Cloud (Qwen3) y a Prism ML.
- El ecosistema de despliegue esta restringido a LiteRT-LM; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- El rendimiento medido corresponde a un unico dispositivo (Pixel 11 Pro XL); no hay datos de otros SoC.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/Ternary-Bonsai-1.7B
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-1.7B-unpacked
- Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Apps de ejemplo: https://github.com/google-ai-edge/litert-samples
