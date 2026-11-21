# Aobangaming/Luna-3-230m-GGUF

## Resumen

Luna 3 230M GGUF es la versión cuantizada en formato GGUF del modelo de lenguaje Luna 3 230M, desarrollado por Aobangaming (AobanZ). Se trata de un transformer causal de pequeno tamano (228,8 millones de parametros reales segun los safetensors del repositorio) disenado para generacion de texto conversacional en ingles, con una ventana de contexto de 8.000 tokens y una arquitectura propia denominada "Lightning" que no es compatible con llama.cpp estandar.

El modelo se presenta como una alternativa ligera y rapida frente a modelos mayores como Llama o Qwen, con un enfoque en velocidad de generacion (el autor declara unos 130 tokens por segundo) y en conversaciones largas. Fue entrenado sobre un subconjunto del dataset OASST (OpenAssistant/oasst1), con un loss final aproximado de 1,9, y utiliza RMSNorm y RoPE como unicas modificaciones respecto a la generacion anterior (Luna 2).

La relevancia de esta ficha radica en que el modelo ilustra el ecosistema de modelos pequenos y experimentales publicados en Hugging Face: licencia MIT, formato GGUF listo para despliegue local, pero con requisitos tecnicos especificos (un fork de llama.cpp llamado Lightning.cpp) y un alcance funcional limitado. Es adecuado para experimentacion, prototipado y conversacion casual, no para produccion critica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (arquitectura "Lightning"), 12 capas, MHA, SDPA, RMSNorm y RoPE |
| Parametros totales | 228.829.440 (aprox. 230M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.000 tokens (secuencia de entrenamiento 8.126) |
| Tipos de cuantizacion | GGUF (variantes no detalladas en la informacion disponible) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (repositorio); safetensors en el modelo base Aobangaming/Luna-3-230m |

## Arquitectura y entrenamiento

Luna 3 es un transformer causal de 12 capas con estado oculto de 768 dimensiones y 12 cabezas de atencion, con un vocabulario de aproximadamente 100.000 tokens. Emplea atencion multi-cabeza (MHA) con Scaled Dot Product Attention y FlashAttention, normalizacion RMSNorm y embeddings posicionales rotatorios (RoPE). El autor describe la arquitectura como "Lightning", heredada de Luna 2, con las unicas novedades de RMSNorm y RoPE actualizados y una longitud de secuencia ampliada hasta los 8.000 tokens.

El entrenamiento se realizo sobre un subconjunto del dataset OpenAssistant/oasst1, en precision BF16, con optimizador AdamW, learning rate de 3e-4 y batch size de 17. Segun la model card, el entrenamiento se ejecuto en una unica GPU RTX 3050 de 6 GB durante aproximadamente 5 horas, con un loss final de aproximadamente 1,9. No se documentan fases de RLHF, DPO ni tecnicas de decodificacion especulativa. La model card menciona tambien el dataset HuggingFaceFW/fineweb entre las etiquetas, aunque el detalle de su uso no se especifica.

## Capacidades

- Generacion de texto autoregresiva en ingles, orientada a conversacion multi-turno.
- Conversacion casual y roleplay gracias a la ventana de contexto de 8.000 tokens.
- Generacion rapida: el autor declara aproximadamente 130 tokens por segundo con llama.cpp.
- Soporte de plantilla de chat mediante `apply_chat_template` (roles user/assistant).
- Compatibilidad con text-generation-inference y endpoints compatibles segun las etiquetas del repositorio.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio, modo thinking ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Prototipado de chatbots conversacionales: el modelo puede gestionar dialogos multi-turno en ingles con hasta 8.000 tokens de contexto, suficiente para sesiones de chat extensas en entornos de desarrollo y pruebas.
- Experimentacion academica con arquitecturas propias: la arquitectura "Lightning" y el fork Lightning.cpp permiten estudiar variantes de transformer pequeno y su comportamiento en inferencia local.
- Generacion de texto creativo y roleplay: el entrenamiento sobre OASST y la ventana de contexto lo hacen util para narrativa interactiva y personajes conversacionales en proyectos personales.
- Despliegue en hardware modesto: con 230M de parametros y formato GGUF, puede ejecutarse en GPUs de consumo y en CPU, lo que facilita demos y entornos con recursos limitados.
- Generacion de respuestas rapidas en aplicaciones de baja latencia: la velocidad declarada de 130 tokens por segundo permite respuestas casi instantaneas en tareas de texto corto.
- Base para fine-tuning: el autor recomienda ajustar el modelo sobre texto nuevo; sirve como punto de partida para tareas especificas de dominio en ingles con presupuesto de computo minimo.
- Evaluacion comparativa de modelos pequenos: util como linea base en estudios sobre calidad frente a tamano en modelos de menos de 1.000 millones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5-1 GB en cuantizacion de 4 bits y aproximadamente 1,5 GB en FP16/BF16 para los 230M de parametros, mas el overhead del runtime (estimacion a partir del tamano, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el propio autor entreno el modelo en una RTX 3050 de 6 GB.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3050, RTX 3060, RTX 4060 y superiores; tambien es viable en CPU.
- Opciones de despliegue: llama.cpp mediante el fork Lightning.cpp (obligatorio, ya que llama.cpp estandar falla con `unknown model architecture: 'lightning'`), text-generation-inference y transformers con `trust_remote_code=True`.
- Latencia y throughput: el autor declara aproximadamente 130 tokens por segundo; no se especifican las condiciones exactas de medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Luna 3 230M | 228,8M | 8.000 | MIT | Arquitectura propia "Lightning", requiere Lightning.cpp, solo ingles |
| SmolLM2 135M | 135M | 8.192 | Apache 2.0 | Requiere llama.cpp estandar, ampliamente soportado |
| Qwen2.5 0.5B | 494M | 32.768 | Apache 2.0 | Mayor contexto y soporte multilingue, mas pesado |
| TinyLlama 1.1B | 1.100M | 2.048 | Apache 2.0 | Mayor capacidad, mas coste de inferencia |

Los datos de los modelos comparables provienen de conocimiento general y no de la informacion proporcionada; el rendimiento relativo no se ha verificado con benchmarks publicados para Luna 3.

## Limitaciones y advertencias

- El autor advierte explicitamente que las salidas pueden ser incompletas, inexactas, repetitivas o no relacionadas con la entrada; no debe usarse sin evaluacion previa.
- Riesgo elevado de alucinacion y de perdida de coherencia por el reducido tamano del modelo (230M de parametros) y el loss de entrenamiento de aproximadamente 1,9.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- No es compatible con llama.cpp estandar: requiere el fork Lightning.cpp, lo que limita las opciones de despliegue y el soporte de la comunidad.
- Entrenado sobre un unico dataset conversacional (OASST) en una sola GPU durante 5 horas, lo que sugiere una cobertura de datos limitada y posibles sesgos del dataset de origen.
- No se documentan guardrails ni filtros de seguridad; el autor recomienda anadir precauciones para evitar usos indebidos.
- La licencia MIT permite uso comercial, pero la calidad y fiabilidad del modelo no estan avaladas por benchmarks publicados.
- El repositorio tiene muy poca traccion (743 descargas, 1 like en el momento de la consulta), por lo que el soporte y el mantenimiento son inciertos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aobangaming/Luna-3-230m-GGUF
- Modelo base: https://huggingface.co/Aobangaming/Luna-3-230m
- Repositorio anterior citado en la model card: https://huggingface.co/Aobangaming/luna-2-70m
- Fork de llama.cpp (Lightning.cpp): https://github.com/AobanZu/lightning.cpp
- Web del autor: https://aobanweb.com
- Discord del proyecto: https://discord.gg/Ty775Ut26a
- Dataset de entrenamiento: https://huggingface.co/datasets/OpenAssistant/oasst1
- Dataset adicional etiquetado: https://huggingface.co/datasets/HuggingFaceFW/fineweb
