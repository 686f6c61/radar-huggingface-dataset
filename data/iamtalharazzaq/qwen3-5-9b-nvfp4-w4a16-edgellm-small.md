# iamtalharazzaq/Qwen3.5-9B-NVFP4-W4A16-EdgeLLM-small

## Resumen

Qwen3.5-9B-NVFP4-W4A16-EdgeLLM-small es una versión cuantizada del modelo Qwen3.5-9B de Alibaba Qwen, publicada por el usuario iamtalharazzaq. Se trata de un checkpoint de 8.953.803.264 parámetros (unos 9B) transformado a precisión NVFP4 en las capas lineales del backbone, con cabecera LM en FP8 y embeddings en FP16, orientado específicamente al despliegue en dispositivos edge mediante TensorRT Edge-LLM. La variante "small" elimina la torre de visión y la cabeza draft MTP, quedándose en un modelo exclusivamente de texto de 6,95 GB en disco y unos 6,7 GB de memoria en tiempo de ejecución si se compila con `--fp8-embedding`.

El problema que resuelve es doble: por un lado, comprimir un transformer de ~9B parámetros hasta un tamaño manejable en hardware con memoria unificada limitada como NVIDIA GB10 (Jetson Thor); por otro, hacerlo sin degradar la calidad de forma apreciable en tareas de planificación estructurada de herramientas. Según la model card, la variante cuantizada obtiene un 75,5% de acierto en herramienta y argumentos frente al 74,4% del checkpoint completo con visión, sobre 383 casos de una tarea JSON con esquema.

La relevancia actual radica en que demuestra que la cuantización NVFP4 con activaciones FP16 (W4A16) es viable en producción edge para modelos de la familia Qwen3.5, con latencias p50 de 2,95 s y p95 de 4,47 s en GB10 para peticiones de ~2.800 tokens de prompt y ~85 de respuesta. Es un artefacto muy especializado: no está pensado para uso general con transformers estándar, sino para el runtime TensorRT Edge-LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 con capas DeltaNet (atención lineal) y atención estándar; tipo `qwen3_5_text` |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | NVFP4 (E2M1, bloque 16, escalas de bloque FP8 E4M3 + escala global FP32) en capas lineales del backbone; LM head en FP8; embeddings FP16 o FP8 con `--fp8-embedding`; activaciones FP16 (W4A16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 7,0 GB; checkpoint de 6,95 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina capas de atención lineal DeltaNet con capas de atención transformer convencionales, lo que reduce el coste computacional en contextos largos. Esta variante cuantizada conserva únicamente el backbone de texto: se ha eliminado la torre de visión y la cabeza draft MTP (multi-token prediction), de ahí la denominación "small" y el `model_type: qwen3_5_text`. Los pesos son byte-idénticos al checkpoint cuantizado completo `iamtalharazzaq/Qwen3.5-9B-NVFP4-W4A16-EdgeLLM`; solo difieren las partes eliminadas.

La cuantización se realizó con ModelOpt 0.45 a través de TensorRT Edge-LLM 0.11.1, afectando a 200 capas lineales del backbone. La calibración usó 64 prompts de tarea (JSON de planificación de herramientas) a longitud completa. El resultado es un esquema W4A16: pesos en NVFP4 y activaciones en FP16, seleccionable en Jetson Thor mediante el flag `--no-quantize-activations`, que activa el kernel `Nvfp4A16BlackwellGemmPlugin`. Sin ese flag, Edge-LLM ejecuta W4A4, lo que según el autor degrada la precisión en su tarea. No se documentan en la información disponible detalles sobre el dataset de preentrenamiento, número de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional en formato chat (tag `conversational`).
- Planificación estructurada de herramientas: genera JSON conforme a un esquema de herramienta y argumentos, validado en la tarea de referencia con 383 casos.
- Salida estructurada guiada: se puede pasar el JSON schema como texto en `guided_decoding.json_schema`; la ruta `response_format` ordena alfabéticamente las claves del esquema, lo que puede alterar el orden esperado.
- Razonamiento multi-paso orientado a agentes: la tarea evaluada es de tool-planning, lo que sugiere uso en pipelines de agentes.
- Capacidades multilingües: no disponible en la información proporcionada.
- Sin visión: la torre visual ha sido eliminada en esta variante.
- Sin decodificación especulativa: la cabeza MTP draft ha sido eliminada.

## Casos de uso

- Planificación de herramientas en agentes edge: el modelo genera JSON estructurado con nombre de herramienta y argumentos, validado en 383 casos con un 75,5% de acierto, lo que lo hace adecuado para orquestadores de agentes que corren localmente en Jetson Thor sin depender de la nube.
- Asistente conversacional embebido: con 6,7 GB de memoria en runtime y latencias p50 de 2,95 s en GB10, encaja en dispositivos con memoria unificada para atención al cliente o asistentes de campo con conectividad intermitente.
- Automatización de flujos con salida JSON validada: útil para extracción de parámetros de intención del usuario y enrutado a APIs internas, gracias al soporte de `guided_decoding.json_schema`.
- Procesamiento por lotes en el dispositivo: al ser un modelo de ~9B cuantizado a 4 bits, permite ejecutar tareas de clasificación y generación de texto en hardware edge sin GPU de servidor.
- Sustitución de llamadas a API en pipelines de CI/CD de bajo coste: para tareas de generación de texto y JSON deterministas donde no se requiere visión ni contexto extremadamente largo.
- Prototipado de agentes con TensorRT Edge-LLM: sirve como banco de pruebas para validar kernels NVFP4 y el plugin `Nvfp4A16BlackwellGemmPlugin` antes de desplegar el checkpoint completo con visión.
- Evaluación comparativa de cuantización: permite medir la degradación W4A16 frente al checkpoint completo (75,5% vs 74,4% en la tarea del autor) en un entorno controlado.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden a una tarea propia del autor (planificación estructurada de herramientas, JSON con esquema, sobre NVIDIA GB10):

| Modelo | Casos | Herramienta + argumentos correctos |
|---|---|---|
| Esta variante, W4A16, embedding FP8 | 383 | 75,5% (respuesta final idéntica al checkpoint completo en 374 de 383) |
| Checkpoint completo (con visión) | 383 | 74,4% |

Latencia en GB10 (una petición a la vez, ~2.800 tokens de prompt, ~85 tokens de respuesta): p50 2,95 s, p95 4,47 s.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 6,7 GB en runtime con `--fp8-embedding`; 8,6 GB con el checkpoint completo sin ese flag; 6,95 GB en disco.
- GPU recomendadas: NVIDIA GB10 (Jetson Thor) es el objetivo declarado; requiere soporte de NVFP4 y del kernel `Nvfp4A16BlackwellGemmPlugin` (arquitectura Blackwell).
- GPU consumer: no hay datos que confirmen funcionamiento en RTX 4090 u otras GPU consumer; el formato NVFP4 y el runtime Edge-LLM están orientados a Blackwell/Jetson Thor.
- Opciones de despliegue: TensorRT Edge-LLM 0.11.1 con exportación `--no-quantize-activations` para forzar W4A16; el repo declara compatibilidad con `transformers` y `endpoints_compatible`, pero el uso previsto es el runtime Edge-LLM.
- Latencia y throughput: p50 2,95 s y p95 4,47 s por petición en GB10 con ~2.800 tokens de prompt y ~85 de respuesta, una petición a la vez. No se documenta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-9B NVFP4 W4A16 Edge-LLM small) | ~9B | No disponible | NVFP4 W4A16, LM head FP8 | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-9B (base) | ~9B | No disponible | FP16/BF16 original | Apache 2.0 | Hugging Face |
| iamtalharazzaq/Qwen3.5-9B-NVFP4-W4A16-EdgeLLM (completo) | ~9B | No disponible | NVFP4 W4A16, con visión y MTP | Apache 2.0 | Hugging Face |
| Qwen3-1.7B (referencia del autor para prompt caching) | 1,7B | No disponible | Estándar transformer | Apache 2.0 | Hugging Face |

La comparativa de rendimiento solo está disponible frente al checkpoint completo del mismo autor (75,5% vs 74,4% en la tarea de tool-planning). No hay datos públicos que permitan comparar con otras alternativas en benchmarks estándar.

## Limitaciones y advertencias

- El modelo es una variante "small" sin visión ni cabeza MTP: no apto para tareas multimodales ni para decodificación especulativa.
- El prompt caching (reutilización de contexto) no funciona con las capas híbridas DeltaNet de Qwen3.5: según el autor, se reutilizan 0 tokens incluso con peticiones idénticas, frente al 94% de un transformer estándar como Qwen3-1.7B. Esto penaliza cargas con prompts largos repetidos.
- La ruta `response_format` para salida estructurada ordena las claves del esquema alfabéticamente; para preservar el orden hay que usar `guided_decoding.json_schema` como texto.
- Ejecutar sin `--no-quantize-activations` activa W4A4, que según el autor pierde precisión en su tarea; hay que forzar W4A16 explícitamente.
- Dependencia fuerte del runtime TensorRT Edge-LLM 0.11.1 y de hardware Blackwell (GB10/Jetson Thor); no hay evidencia de funcionamiento en otras GPU.
- Riesgo de alucinación inherente a modelos de ~9B en tareas de planificación: el 75,5% de acierto implica un 24,5% de fallos en herramienta o argumentos, por lo que en producción conviene validar la salida contra el esquema y añadir reintentos o fallback.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se puede asumir cobertura multilingüe sin verificación.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del checkpoint cuantizado en dominios distintos al de calibración (64 prompts de tool-planning).
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria ni mantenimiento demostrado.

## Enlaces

- Hugging Face: https://huggingface.co/iamtalharazzaq/Qwen3.5-9B-NVFP4-W4A16-EdgeLLM-small
- Checkpoint completo del mismo autor: https://huggingface.co/iamtalharazzaq/Qwen3.5-9B-NVFP4-W4A16-EdgeLLM
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
