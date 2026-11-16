# lillycham/Kestrel-34M-instruct

## Resumen

Kestrel-34M-instruct es un modelo de lenguaje de pequeno tamano (34,3 millones de parametros) desarrollado por el usuario lillycham, resultado de un ajuste supervisado (SFT) sobre Kestrel-34M-base. Emplea una arquitectura poco convencional denominada Looped Titans-MAG, que combina un transformer con bucles de repeticion en su nucleo (core) y un mecanismo de memoria por chunks, inspirado en los planteamientos de "Titans" y en los transformers con bucles. El modelo esta pensado como experimento de investigacion sobre arquitecturas eficientes de memoria y computo, mas que como producto listo para produccion.

El modelo se distribuye bajo licencia MIT, con pesos en safetensors y requiere `trust_remote_code=True` para cargarse con Transformers, ya que usa una clase personalizada `KestrelForCausalLM`. Su ventana de atencion es de 256 tokens y su vocabulario de 16.384 tokens, lo que lo situa en la categoria de modelos muy pequenos orientados a conversacion y generacion de texto basica.

Su relevancia actual es fundamentalmente experimental: permite estudiar el comportamiento de arquitecturas con bucles y memoria estructurada a una escala muy reducida, con coste de computo minimo. No obstante, al tener cero descargas y una unica interaccion, su validacion externa es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Titans-MAG (transformer con bucles y memoria por chunks); prelude=1, core=4 x 3 loops, coda=1 |
| Parametros totales | 34.262.272 (~34,3M) |
| Parametros activos | no disponible (no es MoE; el bucle reutiliza pesos) |
| Longitud de contexto | attention_window=256 tokens (memory_chunk_size=64) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con custom_code, requiere trust_remote_code=True) |

Otros datos tecnicos: hidden_size=512, memory_heads=4, vocab_size=16384, tamano del repo 0,1 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer con bucles (looped transformer) en el que el bloque central se repite 3 veces sobre 4 capas (core=4 x 3 loops), flanqueado por un prelude y una coda de una capa cada uno. Incorpora un mecanismo de memoria por chunks (memory_chunk_size=64, memory_heads=4) propio del diseno Titans-MAG, y una ventana de atencion de 256 tokens. El vocabulario es de 16.384 tokens y el tamano oculto de 512. Esta configuracion busca aumentar la profundidad efectiva sin incrementar proporcionalmente el numero de parametros, reutilizando pesos en cada bucle.

El entrenamiento de esta version es un SFT de 2.000 pasos partiendo de Kestrel-34M-base, con perdida calculada solo sobre los turnos del asistente (assistant-only loss). Se uso batch size 8 con acumulacion de gradiente 4, longitud de secuencia 1.024, precision bf16 en CUDA, y una combinacion de optimizadores Muon (lr=0,004) y AdamW (lr=0,0002) con weight decay 0,01. Las metricas finales reportadas son train loss 1,711 y val loss 1,832 en el paso 2.000. No se detalla la composicion del dataset de SFT ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en formato de chat (soporta `apply_chat_template` con roles user/assistant).
- Razonamiento basico y respuestas de corta longitud, limitado por su tamano y contexto.
- No hay evidencia publicada de soporte de tool calling, function calling ni uso como agente.
- No se documentan capacidades multilingues especificas ni idiomas soportados.
- No dispone de vision, audio ni modos de pensamiento (thinking) declarados.
- Capacidad de memoria estructurada por chunks derivada de la arquitectura Titans-MAG, aunque sin evaluacion publica de su eficacia.

## Casos de uso

- Investigacion de arquitecturas eficientes: sirve como banco de pruebas para estudiar transformers con bucles y memoria por chunks a bajo coste, comparando su comportamiento con transformers estandar de tamano similar.
- Experimentos educativos: permite ilustrar el ajuste supervisado con assistant-only loss y el uso de optimizadores como Muon en un modelo que cabe en cualquier GPU consumer.
- Prototipado de pipelines de chat: util para validar integraciones de `apply_chat_template` y generacion con Transformers antes de escalar a modelos mayores.
- Generacion de texto de relleno o completado corto: adecuado para tareas de autocompletado simple dentro de ventanas de 256 tokens, donde la calidad no sea critica.
- Pruebas de despliegue y tooling: por su tamano (0,1 GB), es comodo para probar scripts de carga con `trust_remote_code`, serializacion safetensors y entornos de inferencia ligeros.
- Estudio de tecnicas de memoria: permite analizar empiricamente como afecta el memory_chunk_size y el numero de bucles a la coherencia en contextos cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de entrenamiento: train loss 1,711 y val loss 1,832 en el paso 2.000.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bf16 (34,3M parametros, ~68 MB de pesos) mas overhead de activaciones; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte bf16 (RTX 30xx/40xx, A100, H100); tambien funciona en CPU para pruebas.
- Cabe en GPU consumer: si, incluidas GTX 1060 o superiores en fp32 y cualquier RTX moderna en bf16.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la via documentada. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, y la arquitectura personalizada probablemente requiera implementacion especifica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kestrel-34M-instruct | 34,3M | 256 tokens | MIT | Hugging Face (custom code) | Arquitectura looped Titans-MAG experimental |
| Kestrel-34M-base | 34,3M | 256 tokens | no disponible | Hugging Face | Modelo base del que deriva este instruct |
| Modelos tipo SmolLM-135M / TinyLlama-1.1B | 135M / 1,1B | 2.048-2.048 tokens | Apache-2.0 / Apache-2.0 | Amplia | Alternativas consolidadas de pequeno tamano, con benchmarks publicos; no comparables directamente por arquitectura |

No se dispone de datos de rendimiento comparativo del modelo frente a alternativas, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo de 34M parametros: capacidad de razonamiento y conocimiento del mundo muy limitada; propenso a respuestas incoherentes o genericas.
- Riesgo alto de alucinacion, especialmente en preguntas factuales.
- Ventana de contexto de solo 256 tokens: no apto para conversaciones largas ni documentos extensos.
- Idiomas soportados no documentados; se desconoce su calidad fuera del ingles.
- Sin benchmarks publicados ni validacion externa (0 descargas, 1 like); no recomendable para produccion.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de usarlo.
- Licencia MIT permite uso comercial, pero la ausencia de evaluacion hace desaconsejable su despliegue en entornos reales sin pruebas exhaustivas.
- No se documenta el dataset de SFT, por lo que se desconocen sesgos heredados.

## Enlaces

- Hugging Face: https://huggingface.co/lillycham/Kestrel-34M-instruct
- Modelo base: https://huggingface.co/lillycham/Kestrel-34M-base
- Repositorio GitHub: https://github.com/lillycham/kestrel
