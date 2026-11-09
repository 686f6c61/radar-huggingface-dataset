# iamtalharazzaq/Qwen3.5-9B-NVFP4-W4A16-EdgeLLM-MTP

## Resumen

Qwen3.5-9B-NVFP4-W4A16-EdgeLLM-MTP es una versión cuantizada del modelo Qwen3.5-9B de Alibaba Qwen, publicada por el usuario iamtalharazzaq y orientada específicamente al despliegue en dispositivos edge con NVIDIA TensorRT Edge-LLM. El checkpoint aplica cuantización NVFP4 (pesos de 4 bits con formato E2M1) sobre las capas lineales del backbone, manteniendo activaciones en FP16 (esquema W4A16), y elimina la torre de visión para dejar únicamente el stack de texto (`qwen3_5_text`). Incluye además la capa MTP (Multi-Token Prediction) con su LM head en FP8, necesaria para la decodificación especulativa en el runtime de Edge-LLM.

El modelo resuelve un problema muy concreto: ejecutar un LLM de aproximadamente 10 000 millones de parámetros en hardware de clase Jetson Thor (SoC GB10) con latencias interactivas y sin renunciar a la precisión del modelo original en tareas de planificación de herramientas. Según la model card, con MTP y 3 tokens de borrador se obtiene un p50 de 2,13 s y un p95 de 2,89 s sobre 60 casos, frente a 2,95 s y 4,47 s sin MTP, manteniendo 58/60 respuestas correctas en ambos casos.

La relevancia actual radica en que combina tres piezas poco habituales juntas: cuantización NVFP4 de ModelOpt, decodificación especulativa MTP y un runtime optimizado para Blackwell (TensorRT Edge-LLM 0.11.1). El resultado es un artefacto listo para producción en el borde, con licencia Apache 2.0 heredada del modelo base y un consumo de memoria en tiempo de ejecución de 13,6 GB con MTP activado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (atención estándar + capas DeltaNet), text-only (`qwen3_5_text`), con capa MTP |
| Parametros totales | 10.092.577.792 (≈10,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16 (E2M1, bloque 16, escalas de bloque FP8 E4M3 + escala global FP32) en 200 capas lineales; LM head en FP8; embeddings FP16 (o FP8 con `--fp8-embedding`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 8,1 GB), compatible con transformers; pensado para exportación a TensorRT Edge-LLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina capas de atención transformer convencional con capas DeltaNet (atención lineal recurrente), lo que reduce el coste de memoria de la caché KV en contextos largos. Esta versión cuantizada conserva esa estructura y añade la capa MTP del modelo original, cuyo LM head se almacena en FP8 porque el motor de borrador de Edge-LLM lo requiere. La torre de visión ha sido eliminada por completo, de modo que el checkpoint solo contiene pesos de texto; según el autor, los pesos son idénticos byte a byte al checkpoint cuantizado completo y solo difieren las partes eliminadas.

La cuantización se realizó con ModelOpt 0.45 a través de TensorRT Edge-LLM 0.11.1, con calibración sobre 64 prompts de tarea (JSON de planificación de herramientas) a longitud completa. No se documenta en la información disponible el proceso de entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO). La innovación técnica destacable es la integración de decodificación especulativa MTP con 3 tokens de borrador, que en el hardware de referencia reduce el tiempo de escritura de respuesta de 24 ms/token a 13 ms/token.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredada del modelo base Qwen3.5-9B.
- Planificación de herramientas y salida estructurada: la calibración se hizo con JSON de planificación de tool-calling y el runtime soporta `guided_decoding.json_schema`.
- Decodificación especulativa MTP: se activa con `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`.
- Razonamiento multi-step y uso como agente: el autor reporta 58/60 casos correctos en su conjunto de 60 pruebas orientadas a tareas de planificación.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión: no soportada (torre de visión eliminada).
- Audio: no soportado.

## Casos de uso

- Asistentes de planificación de herramientas en el borde: el modelo se calibró específicamente con prompts de tool-planning en JSON, por lo que es adecuado para agentes que deciden qué función invocar y con qué argumentos en dispositivos Jetson Thor sin conexión a la nube.
- Salida estructurada garantizada: mediante `guided_decoding.json_schema` se puede forzar un esquema JSON concreto, útil para extracción de datos, clasificación o generación de comandos en pipelines automatizados.
- Inferencia interactiva de baja latencia en edge: con MTP el modelo escribe a 13 ms/token y responde en p50 2,13 s, lo que permite experiencias conversacionales aceptables en hardware embebido de clase GB10.
- Automatización industrial o robótica embebida: al ejecutarse en TensorRT Edge-LLM sobre Jetson Thor, encaja en escenarios donde la latencia de red o la privacidad impiden usar APIs en la nube.
- Procesamiento por lotes de documentos con contexto largo: aunque el autor advierte que la reutilización de contexto (prompt caching) no funciona con las capas DeltaNet de Qwen3.5, el modelo sigue sirviendo para peticiones independientes de generación sobre textos extensos.
- Prototipado de agentes multi-paso: la combinación de tool calling, salida estructurada y razonamiento permite construir bucles de agente (planificar, actuar, observar) en un único dispositivo.
- Evaluación de cuantización NVFP4 en producción: sirve como referencia para medir la pérdida de precisión de W4A16 frente al modelo original en tareas concretas, dado que el autor conserva el checkpoint completo sin recortes.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre NVIDIA GB10 (Jetson Thor), una petición a la vez, 60 casos:

| Configuracion | p50 | p95 | Escritura de respuesta | Correctas |
|---|---|---|---|---|
| Sin MTP | 2,95 s | 4,47 s | 24 ms/token | 58/60 |
| Con MTP (3 tokens de borrador) | 2,13 s | 2,89 s | 13 ms/token | 58/60 |

Memoria en tiempo de ejecución con MTP: 13,6 GB. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 13,6 GB en tiempo de ejecución con MTP activado (búferes del motor base y del motor de borrador dimensionados al vocabulario; el autor indica que reducir el vocabulario del borrador y la longitud máxima de entrada bajaría el consumo).
- GPU de referencia: NVIDIA GB10 (Jetson Thor), con soporte del kernel `Nvfp4A16BlackwellGemmPlugin`. Requiere arquitectura Blackwell para las instrucciones NVFP4.
- GPU de consumo: no disponible; el formato NVFP4 y el runtime Edge-LLM están orientados a Blackwell, no a GPUs consumer convencionales.
- Despliegue: TensorRT Edge-LLM 0.11.1 (exportación con `--no-quantize-activations` para forzar W4A16); el checkpoint es compatible con transformers para inspección, pero el rendimiento documentado es del runtime de Edge-LLM. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: p50 2,13 s y p95 2,89 s por petición; 13 ms/token en fase de escritura con MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-NVFP4-W4A16-EdgeLLM-MTP (este) | 10,09 B | no disponible | NVFP4 W4A16 + LM head FP8 | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.5-9B (base) | no disponible | no disponible | BF16/FP16 original | Apache 2.0 | Hugging Face (Qwen) |
| Qwen3.5-9B-NVFP4-W4A16-EdgeLLM (sin recorte de visión) | 10,09 B | no disponible | NVFP4 W4A16 | Apache 2.0 | Hugging Face (mismo autor) |

No se dispone de datos de rendimiento comparables de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: la torre de visión ha sido eliminada, por lo que no puede procesar imágenes.
- La reutilización de contexto (prompt caching) no funciona con las capas DeltaNet de Qwen3.5 en Edge-LLM 0.11.1: 0 tokens reutilizados incluso con peticiones idénticas, frente al 94 % de un transformer estándar como Qwen3-1.7B.
- MTP no se puede combinar con `--fp8-embedding` en Edge-LLM 0.11.1, porque los motores de borrador usan el sidecar de embeddings base.
- Ejecutar en modo W4A4 (sin `--no-quantize-activations`) degrada la precisión en la tarea del autor; el modo recomendado es W4A16.
- El path `response_format` de Edge-LLM ordena las claves del esquema alfabéticamente; para control fino hay que usar `guided_decoding.json_schema`.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de sesgo en la información disponible.
- Idiomas soportados no documentados; no se debe asumir cobertura multilingüe sin verificación.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base Qwen3.5-9B enlazada por el autor.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria independiente de los resultados reportados.

## Enlaces

- Hugging Face: https://huggingface.co/iamtalharazzaq/Qwen3.5-9B-NVFP4-W4A16-EdgeLLM-MTP
- Checkpoint cuantizado completo (sin recorte): https://huggingface.co/iamtalharazzaq/Qwen3.5-9B-NVFP4-W4A16-EdgeLLM
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
