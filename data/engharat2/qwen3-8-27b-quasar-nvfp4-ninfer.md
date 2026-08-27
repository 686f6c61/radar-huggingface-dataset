# engharat2/Qwen3.8-27B-QUASAR-NVFP4-NINFER

# Qwen3.8-27B QUASAR NVFP4 — NInfer artifact

## Resumen

Este repositorio contiene una conversión compilada del modelo **Qwen3.8-27B** cuantizado a NVFP4 (W4A4) mediante *quantization-aware training* (QAT) por el proyecto QUASAR, empaquetada en el formato propietario `.ninfer` del motor de inferencia NInfer (C++/CUDA). No es un checkpoint cargable con `transformers`, sino un artefacto de inferencia optimizado para GPUs NVIDIA Blackwell (específicamente RTX 5090), que integra decodificación especulativa con *multi-token prediction* (MTP) y un *draft head* para acelerar la generación.

El modelo base, Qwen3.8-27B, es un transformer denso multimodal (texto e imagen) de 27 000 millones de parámetros con una ventana de contexto nativa de 256 000 tokens, desarrollado por Alibaba. La variante QUASAR NVFP4 reduce el peso de los lineales a 4 bits con escalas de bloque, manteniendo una precisión casi idéntica al original en BF16. Este artefacto NInfer añade una capa de compilación que permite ejecutar el modelo en hardware consumer de gama alta con un rendimiento de decodificación de 180–225 tokens por segundo, según las mediciones del autor.

La relevancia de esta publicación radica en que demuestra la viabilidad de ejecutar un modelo multimodal de 27B con contexto largo en una GPU de 32 GB, con una pérdida de rendimiento en GPQA-Diamond de solo 1 punto porcentual respecto al original en BF16 (0.9040 frente a 0.9141). El repositorio incluye metadatos de procedencia (SHA-256, linaje, configuración) y un protocolo de benchmark reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + vision) con MTP y decodificacion especulativa |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 000 tokens (nativo); 194 560 tokens en este artefacto con KV en BF16 sobre RTX 5090 |
| Tipos de cuantizacion | NVFP4 (W4A4) con QAT para lineales; FP8_E4M3FN para `lm_head`; BF16/FP32 para normas y embeddings; Q4/Q5/Q6 para torre de vision y draft head |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B es multilingue, pero no se detallan idiomas en esta ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` (artefacto compilado, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un transformer denso con capacidades multimodales (procesa texto e imagenes) y un modo de razonamiento explicito ("thinking") que se activa durante la generacion. La variante QUASAR NVFP4 se obtiene mediante *quantization-aware training* (QAT) que reduce todos los lineales de texto a 4 bits con formato NVFP4 (bloques de 16 elementos, escalas de grupo FP8), manteniendo los pesos empaquetados identicos a la fuente. El artefacto NInfer anade un *draft head* y proyecciones MTP (multi-token prediction) para decodificacion especulativa, junto con una torre de vision cuantizada en formatos mixtos (Q4/Q5/Q6). No se proporcionan datos sobre el dataset de entrenamiento del modelo base ni sobre tecnicas de alineacion como RLHF o DPO; la unica informacion de entrenamiento disponible es la del proceso QAT de QUASAR.

## Capacidades

- Generacion de texto y razonamiento paso a paso (modo "thinking" activado en el benchmark).
- Comprension multimodal: procesa imagenes junto con texto (torre de vision incluida en el artefacto).
- Codificacion y tareas de agente (segun la documentacion de Unsloth para Qwen3.8-27B, que destaca "agentic coding").
- Decodificacion especulativa con MTP (multi-token prediction) y *draft head* para acelerar la inferencia.
- Soporte de contexto largo (hasta 194 560 tokens en configuracion BF16 KV, ampliable con KV en int8).
- Capacidades multilingues heredadas del modelo base (no detalladas en esta publicacion).

## Casos de uso

- Asistente de programacion con contexto largo: la ventana de 194K tokens permite cargar repositorios completos o multiples archivos de codigo en una sola sesion, ideal para revision de codigo, refactorizacion y generacion de documentacion tecnica.
- Analisis de documentos multimodales: al combinar vision y texto, puede extraer informacion de capturas de pantalla, diagramas de arquitectura o formularios escaneados, y generar resumenes o informes estructurados.
- Agentes autonomos con razonamiento multi-paso: el modo "thinking" y las capacidades de agente permiten planificar y ejecutar tareas complejas (navegacion web, uso de APIs) con un unico modelo desplegado localmente.
- Atencion al cliente automatizada: con contexto largo y memoria de conversacion, puede gestionar interacciones multi-turno manteniendo el historial completo, reduciendo la perdida de informacion en chats prolongados.
- Generacion de informes tecnicos a partir de imagenes: por ejemplo, analizar una fotografia de un panel de control o un esquema electrico y producir una descripcion textual detallada o una lista de acciones recomendadas.
- Inferencia privada en hardware consumer: al ejecutarse en una RTX 5090 (32 GB) sin dependencia de servicios en la nube, es adecuado para entornos con requisitos estrictos de privacidad de datos (salud, legal, defensa).

## Benchmarks y rendimiento

La model card reporta resultados en **GPQA-Diamond** (198 muestras, 0-shot, thinking activado, temperatura 1.0, top_p 0.95, top_k 20, seed 42, con MTP y KV BF16 a 194 560 tokens). Dos ejecuciones independientes sobre el artefacto NInfer dieron resultados identicos:

| Modelo | Correctos (n=396) | Score |
|---|---:|---:|
| Qwen3.8-27B BF16 original | 362 | 0.9141 |
| QUASAR NVFP4 via vLLM | 360 | 0.9091 |
| **Este artefacto NInfer** | **358** | **0.9040** |
| unsloth NVFP4 | 354 | 0.8939 |
| Inferact NVFP4 | 347 | 0.8763 |

La diferencia de 2 muestras respecto a la ejecucion vLLM de QUASAR se atribuye al ruido de muestreo (desviacion estandar binomial ≈ 3.7) y al `lm_head` en FP8, que introduce aproximadamente un 3% de ruido relativo en los logits.

## Requisitos de hardware

- VRAM estimada: el artefacto pesa 17.36 GiB; con KV cache en BF16 a 194 560 tokens requiere 32 GB (RTX 5090). Con `--kv-dtype int8` se duplica la capacidad de tokens KV, permitiendo probablemente ejecucion en GPUs de 24 GB (por ejemplo, RTX 4090) con contexto reducido.
- GPU recomendada: NVIDIA RTX 5090 (32 GB) o superior con arquitectura Blackwell. El motor NInfer esta optimizado para CUDA y requiere soporte de instrucciones NVFP4.
- Opciones de despliegue: exclusivamente mediante el motor NInfer (fork de `engharat/ninfer` en el commit `e80b1ed5`), usando la aplicacion `ninfer-serve` que expone una API HTTP. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento observado: ~5 000–8 000 tokens/s en prefill y ~180–225 tokens/s en decodificacion con MTP (tasa de aceptacion del draft del 50–70% segun la longitud de generacion).

## Comparativa con modelos similares

La siguiente tabla compara las variantes del mismo modelo base (Qwen3.8-27B) en cuanto a cuantizacion, formato y rendimiento en GPQA-Diamond:

| Variante | Cuantizacion | Formato | Score GPQA-Diamond | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B (original) | BF16 | safetensors | 0.9141 | Apache-2.0 |
| QUASAR NVFP4 (vLLM) | NVFP4 W4A4 | safetensors | 0.9091 | Apache-2.0 |
| **Este artefacto NInfer** | NVFP4 W4A4 + FP8 lm_head | `.ninfer` | 0.9040 | Apache-2.0 |
| unsloth NVFP4 | NVFP4 | GGUF/safetensors | 0.8939 | Apache-2.0 |
| Inferact NVFP4 | NVFP4 | safetensors | 0.8763 | Apache-2.0 |

No se dispone de comparaciones con otros modelos de 27B de diferentes familias (por ejemplo, Llama 3.1 8B o Mistral 7B) en la informacion proporcionada.

## Limitaciones y advertencias

- **Artefacto cerrado**: el formato `.ninfer` no es cargable con `transformers` ni con otros motores de inferencia; requiere el fork especifico de NInfer (`engharat/ninfer` en el commit `e80b1ed5`). Esto limita la portabilidad y la integracion con ecosistemas estandar.
- **Dependencia de hardware**: el motor esta optimizado para GPUs Blackwell (RTX 5090); no se garantiza su funcionamiento en arquitecturas anteriores (Ampere, Ada) ni en hardware no NVIDIA.
- **Compromiso en `lm_head`**: el `output_head` se almacena en FP8 con escala por fila, lo que introduce aproximadamente un 3% de ruido relativo en los logits. Aunque el impacto en GPQA-Diamond es minimo, podria afectar a tareas de clasificacion o generacion con requisitos de precision estrictos.
- **Sesgos y alucinaciones**: no se proporciona informacion sobre evaluaciones de sesgo, toxicidad o tasas de alucinacion. Como modelo derivado de Qwen3.8-27B, hereda los riesgos tipicos de los LLM grandes, incluyendo la generacion de contenido falso o desactualizado.
- **Contexto maximo limitado por VRAM**: aunque el modelo soporta 256K tokens, la configuracion recomendada en RTX 5090 limita a 194 560 tokens con KV en BF16. Superar ese limite requiere reducir el contexto o usar KV en int8, lo que puede degradar la calidad en tareas que dependen de precision numerica.
- **Licencia**: Apache-2.0 permite uso comercial, pero es necesario verificar los terminos del modelo base Qwen3.8-27B y del proyecto QUASAR, que pueden imponer condiciones adicionales (por ejemplo, atribucion o restricciones de uso en ciertos sectores).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/engharat2/Qwen3.8-27B-QUASAR-NVFP4-NINFER
- Modelo base QUASAR NVFP4: https://huggingface.co/QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor NInfer (fork del autor): https://github.com/engharat/ninfer
- Motor NInfer (original): https://github.com/Neroued/ninfer
- Repositorio de documentacion y reproduccion: https://github.com/engharat/-Qwen3.8-27B-QUASAR-NVFP4-NINFER-
- Repositorio oficial de Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentacion de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Articulo sobre QUASAR NVFP4: https://thevalue.engineering/news/quasar-compresses-qwen-27b-nvfp4-enterprise-inference.html
