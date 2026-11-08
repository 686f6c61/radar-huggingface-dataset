# AIgenius1/qwen3-06b-fa-fullft-speed

## Resumen

AIgenius1/qwen3-06b-fa-fullft-speed es un ajuste fino completo del modelo Qwen/Qwen3-0.6B (596.049.920 parametros reales segun safetensors) orientado a mejorar la calidad del persa (farsi) y la velocidad de inferencia en CPU. El autor, AIgenius1, parte de los pesos de Qwen3-0.6B y realiza un entrenamiento de preentrenamiento continuado (continued pretraining) sobre unos 4,7 millones de tokens persas procedentes de dos corpus propios: AIgenius1/zoomit-persian-pretraining-dataset y AIgenius1/persian-pretraining-dataset. El resultado se distribuye tanto en pesos completos bf16 (safetensors) como en una version cuantizada GGUF Q4_K_M pensada para despliegue ligero.

El modelo resuelve un problema muy concreto: adaptar un transformer pequeno y multilingue al persa con recursos modestos (250 pasos, unos 35 minutos de entrenamiento en bf16 con Adafactor) y empaquetarlo para que funcione en hardware de gama baja. Segun la model card, la perplejidad en persa sobre un conjunto retenido baja de 10,464 a 9,129 (una reduccion del 12,8 %) y la velocidad de generacion en una CPU de dos nucleos y 4 GB de RAM pasa de 10,73 tok/s (PyTorch bf16) a 27,88 tok/s con GGUF Q4_K_M (un factor de 2,6x), con un tamano de despliegue de 397 MB frente a 1.519 MB.

Es relevante ahora porque demuestra un flujo completo y reproducible de adaptacion linguistica de un modelo de menos de 1B de parametros para un idioma con poca representacion, con artefactos de ingenieria publicados (benchmarks, scripts, informe en PDF). No obstante, conviene subrayar que se trata de un preentrenamiento continuado sobre texto crudo, sin pares pregunta/respuesta, por lo que la fluidez en persa mejora pero el comportamiento conversacional e instruccional no cambia de forma sustancial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso seq=128) |
| Tipos de cuantizacion | GGUF Q4_K_M; pesos completos en bf16 (safetensors) |
| Idiomas soportados | fa (persa), en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-0.6B original, un transformer decoder-only denso de aproximadamente 596M de parametros. Sobre esa base, el autor aplica un ajuste fino completo de todos los pesos (100 % de los parametros modificados) mediante preentrenamiento continuado sobre texto persa crudo. La configuracion de entrenamiento documentada es: optimizador Adafactor con learning rate 5e-4 y 20 pasos de calentamiento, precision bf16, longitud de secuencia 128, batch size 1, gradient checkpointing, 250 pasos totales (aproximadamente 35 minutos) y un volumen de 4,7 millones de tokens persas distribuidos en 6.844 documentos. La evaluacion se realizo sobre 40 documentos retenidos.

La innovacion practica no esta en la arquitectura, sino en el pipeline de adaptacion y despliegue: se combinan dos corpus persas propios, se documenta el efecto del ajuste sobre la perplejidad y se publica una version cuantizada GGUF Q4_K_M optimizada para CPU. El repositorio incluye ademas scripts de reproduccion (benchmark, entrenamiento, generacion de graficas e informe), resultados crudos de benchmark y un informe tecnico en PDF de ocho paginas en persa. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto en persa e ingles, con mejora medible de fluidez y perplejidad en persa tras el ajuste.
- Preentrenamiento continuado sobre texto crudo: la capacidad principal reforzada es la modelizacion del lenguaje persa, no el seguimiento de instrucciones.
- No se documenta soporte de tool calling ni function calling en la informacion proporcionada.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas a fa y en segun los metadatos del modelo.
- No se documentan capacidades de vision, audio ni modo de razonamiento (thinking mode).
- Inferencia en CPU viable gracias a la version GGUF Q4_K_M (397 MB, 27,88 tok/s en 2 nucleos).

## Casos de uso

- Completado y generacion de texto persa en local: el modelo puede generar texto persa coherente en equipos sin GPU, gracias a la version GGUF Q4_K_M que ocupa 397 MB y alcanza 27,88 tok/s en una CPU de dos nucleos con 4 GB de RAM.
- Prototipado de aplicaciones NLP en persa: util como base para experimentar con modelado de lenguaje persa antes de invertir en modelos mayores, dado su bajo coste de inferencia y su licencia Apache 2.0.
- Base para un posterior ajuste supervisado (SFT): al haber mejorado la modelizacion del persa, sirve como punto de partida para una fase de instruccion que anada comportamiento conversacional, que la model card identifica como paso pendiente.
- Generacion de texto asistida en entornos con recursos limitados: integrable en dispositivos edge o contenedores pequenos donde no cabe un modelo de varios miles de millones de parametros.
- Investigacion sobre adaptacion linguistica de bajo coste: el repositorio incluye scripts, benchmarks y un informe reproducible que permiten replicar el pipeline de preentrenamiento continuado y cuantizacion.
- Evaluacion comparativa de tecnicas de cuantizacion: al publicar tanto los pesos bf16 como el GGUF Q4_K_M y las metricas de ambos, permite medir el impacto de la cuantizacion en calidad (perplejidad) y velocidad en CPU.

## Benchmarks y rendimiento

| Metrica | Modelo base | Tras ajuste/optimizacion |
|---|---|---|
| Velocidad de generacion (decode, greedy, CPU 2 nucleos, 4 GB RAM) | 10,73 tok/s (PyTorch bf16) | 27,88 tok/s (GGUF Q4_K_M), 2,6x |
| Perplejidad en persa (texto retenido) | 10,464 | 9,129 (-12,8 %) |
| Tamano de despliegue | 1.519 MB | 397 MB (3,8x menor) |
| Parametros modificados | — | 596.049.920 (100 %) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; los pesos bf16 suman aproximadamente 1,2 GB (tamano de repo 2,1 GB con artefactos adicionales) y la version GGUF Q4_K_M ocupa 397 MB.
- GPU recomendadas: no se especifican en la informacion proporcionada; por tamano, el modelo cabe en practicamente cualquier GPU consumer.
- Cabe en GPU consumer: si, dado que el modelo completo en bf16 ronda 1,2 GB y la version cuantizada 397 MB.
- Despliegue en CPU: validado por el autor en una CPU de dos nucleos con 4 GB de RAM a 27,88 tok/s con GGUF Q4_K_M.
- Opciones de despliegue: llama.cpp (comando documentado con llama-cli) y transformers (AutoModelForCausalLM con torch_dtype bfloat16); el tag text-generation-inference sugiere compatibilidad con TGI, aunque no se detalla configuracion.
- Latencia y throughput: 27,88 tok/s en decode greedy sobre CPU de dos nucleos con la version cuantizada; no se publican datos para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| AIgenius1/qwen3-06b-fa-fullft-speed | 596.049.920 | no disponible | fa, en | apache-2.0 | Ajuste completo en persa + GGUF Q4_K_M para CPU |
| Qwen/Qwen3-0.6B | aproximadamente 0,8B (segun model card) | no disponible | multilingue | no disponible en la informacion | Modelo base sin adaptacion al persa |
| Qwen/Qwen3-0.6B-FP8 | no disponible | no disponible | no disponible | no disponible | Variante cuantizada FP8 del mismo modelo base |

La comparacion se limita al modelo base y su variante FP8 por ser los unicos modelos de referencia encontrados en la busqueda web. No se dispone de datos de rendimiento comparables entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- El entrenamiento fue de preentrenamiento continuado sobre texto crudo, sin pares pregunta/respuesta; la model card advierte que el comportamiento conversacional e instruccional no cambia de forma sustancial y que se requiere una fase SFT para el seguimiento de instrucciones.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero esperable en un modelo de 596M de parametros con contexto de entrenamiento corto (seq=128).
- Sesgos conocidos: no documentados; al entrenarse sobre dos corpus persas concretos, puede heredar sesgos de esas fuentes.
- Limitaciones de contexto: la longitud de contexto efectiva no se especifica; el entrenamiento uso secuencias de 128 tokens, lo que puede limitar el rendimiento en contextos largos.
- Limitaciones de idioma: solo fa e en; el rendimiento fuera de estos idiomas no esta evaluado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-0.6B y de los datasets empleados.
- Para produccion: el modelo es pequeno y esta pensado para tareas de generacion de texto y como base de experimentacion; no es adecuado como asistente conversacional sin un ajuste supervisado adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIgenius1/qwen3-06b-fa-fullft-speed
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Variante FP8 del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-FP8
- Dataset de preentrenamiento persa (Zoomit): https://huggingface.co/datasets/AIgenius1/zoomit-persian-pretraining-dataset
- Dataset de preentrenamiento persa (general): https://huggingface.co/datasets/AIgenius1/persian-pretraining-dataset
