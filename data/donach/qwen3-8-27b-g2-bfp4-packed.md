# donach/qwen3.8-27b-g2-bfp4-packed

## Resumen

`donach/qwen3.8-27b-g2-bfp4-packed` es una requantizacion del checkpoint abierto Qwen3.8-27B de Alibaba Qwen, empaquetada en el formato propietario `bfp4-packed-v1` de Tenstorrent para su ejecucion en dos aceleradores Blackhole P150 en malla 1×2 con tensor-parallel 2. No se trata de un fine-tune ni de un modelo nuevo: el autor copia sin modificar todos los tensores no cuantizados desde `Qwen/Qwen3.8-27B-FP8` (verificado por sha256) y solo sustituye 400 pesos lineales por codigos bfp4 con exponentes compartidos, obtenidos mediante GPTQ sobre la rejilla bfp4.

El interes del artefacto es de nicho pero relevante para quien opera hardware Tenstorrent: permite servir un modelo de la familia Qwen3.5 en dos tarjetas P150 con pesos de 4 bits empaquetados y un perfil de servicio de hasta 262 000 tokens de contexto (`b8-262k`) o uno orientado a latencia (`b1-latency`). El repositorio ocupa 20,2 GB y contiene 17 138 404 272 parametros efectivos segun los safetensors, lo que sugiere un modelo denso de aproximadamente 17 000 millones de parametros pese a la denominacion comercial "27B" del checkpoint base.

La ficha debe leerse con cautela: el autor declara explicitamente que las puertas de calidad estan pendientes y que no reclama ninguna cifra de velocidad ni de precision. La licencia es Apache 2.0, heredada del modelo upstream, y el tokenizador, plantilla de chat y configuraciones son byte-identicos al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (incluye capas de atencion lineal/GDN y proyecciones MLP), segun los nombres de tensor descritos por el autor; detalles completos no disponibles |
| Parametros totales | 17 138 404 272 (segun safetensors del repo) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | Hasta 262 144 tokens en el perfil `b8-262k` del paquete de servicio; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | bfp4 empaquetado (`bfp4-packed-v1`) en 400 pesos lineales; resto de tensores en el dtype del checkpoint FP8 upstream |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con codigos `*.weight_bfp4_codes` y exponentes compartidos `*.weight_bfp4_exp` |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.8-27B` en bf16, del que se tomaron las matrices de Hessian, y `Qwen/Qwen3.8-27B-FP8` en la revision `c3a462cc3d38cf351f3b26cbd763469eeb74ef81`, del que se copian los tensores base. La arquitectura subyacente es un transformer con atencion estandar y capas de atencion lineal (denominadas GDN en la model card), aunque la ficha del modelo original no se incluye en la informacion disponible y por tanto no se detallan numero de capas, dimension oculta ni numero de cabezas.

La innovacion tecnica esta en la cuantizacion: se aplica GPTQ en CPU directamente sobre la rejilla bfp4, con Hessians calculados a partir de 256 secuencias de 2048 tokens de calibracion extraidas de cuatro datasets publicos con licencia explicita (SWE-Gym/OpenHands-SFT-Trajectories con MIT, nebius/SWE-agent-trajectories y nvidia/Nemotron-Post-Training-Dataset-v1 con CC-BY-4.0, y NousResearch/hermes-function-calling-v1 con Apache-2.0). La configuracion "G2" afecta a 400 pesos lineales de atencion, atencion lineal y MLP; el resto conserva el dtype upstream. El autor verifica que los 400 tensores empaquetados se descomprimen bit-exactamente a los pesos bf16 ajustados a la rejilla y que el resto es sha256-igual al checkpoint FP8, ademas de incluir un control corrupto deliberado que fue detectado. No se menciona RLHF, DPO ni entrenamiento adicional: es exclusivamente una requantizacion.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, heredadas del checkpoint Qwen3.8-27B subyacente.
- Capacidades de codigo y function calling, reforzadas indirectamente por la composicion del dataset de calibracion (trayectorias de agentes SWE y hermes-function-calling).
- Soporte de tool calling en el formato del modelo base, dado que la plantilla de chat (`chat_template.jinja`) es byte-identica a la upstream.
- Razonamiento multi-paso y uso como agente, coherente con el perfil de contexto largo del paquete de servicio (hasta 262 144 tokens).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible; la model card no los menciona.

## Casos de uso

- Servicio de agentes de codigo sobre hardware Tenstorrent: el paquete `donach/qwen3.8-27b-p150x2` permite desplegar el modelo con `tt-model serve` en dos P150 y ejecutar tareas de edicion de repositorio, ya que la calibracion GPTQ se hizo precisamente sobre trayectorias SWE-agent y OpenHands.
- Analisis de repositorios completos: con el perfil `b8-262k` se pueden introducir codebases de cientos de miles de tokens en una sola pasada, adecuado para revision de codigo, generacion de tests o auditoria de dependencias.
- Asistente conversacional de contexto largo en entornos con aceleradores Blackhole: el perfil por defecto prioriza lote 8 y contexto extendido, util para atencion al cliente con historial extenso o busqueda aumentada sobre documentacion.
- Evaluacion y prototipado de cuantizacion de 4 bits: investigadores que quieran medir el impacto de bfp4 con GPTQ frente al checkpoint FP8 pueden usar este repo como referencia reproducible, dado que el autor documenta el metodo y las comprobaciones de empaquetado.
- Despliegue on-premise con licencia permisiva: al ser Apache 2.0 y no incorporar datos privados, encaja en entornos corporativos que requieren trazabilidad de licencia y verificacion de integridad por hash.
- Integracion en pipelines de function calling: la plantilla de chat identica a upstream y la calibracion con hermes-function-calling permiten usarlo como planificador de herramientas en automatizaciones internas.
- Benchmarking de infraestructura Tenstorrent: util para comparar throughput y latencia entre el perfil `b8-262k` y `b1-latency` en cargas reales, aunque el autor aun no publica cifras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que las puertas de calidad estan pendientes e incluira equivalencia greedy, GSM8K con McNemar emparejado contra la referencia FP8 y recuperacion de KV en contexto largo. Tampoco se reclaman numeros de velocidad ni de precision.

## Requisitos de hardware

- Hardware objetivo: dos tarjetas Tenstorrent Blackhole P150 en malla 1×2 con tensor-parallel 2. No se describe soporte para GPU convencionales.
- VRAM estimada: no aplica en el sentido habitual; el formato esta pensado para la memoria de los P150. El repo pesa 20,2 GB, lo que da una idea del espacio de almacenamiento necesario.
- GPU recomendadas: no disponible; el autor solo documenta el camino Tenstorrent.
- Compatibilidad con GPU de consumo: no disponible y poco probable sin conversion previa, dado que el formato `bfp4-packed-v1` es especifico de Tenstorrent.
- Opciones de despliegue: `tt-model-manager` (via `uv tool install git+https://github.com/tenstorrent/tt-model-manager`) o la CLI `tt serve donach/qwen3.8-27b-p150x2`; perfiles `b8-262k` (por defecto) y `b1-latency`. El stack incluye un tt-metal parcheado y el plugin `vllm-tt-plugin` dentro del contenedor del paquete.
- Latencia y throughput: no disponibles; el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `donach/qwen3.8-27b-g2-bfp4-packed` | 17 138 404 272 | 262 144 (perfil de servicio) | bfp4 empaquetado para Tenstorrent | Apache 2.0 | Hugging Face, 0 descargas |
| `Qwen/Qwen3.8-27B-FP8` | No disponible en la informacion | No disponible | FP8 | Apache 2.0 (heredada) | Upstream en Hugging Face |
| `Qwen/Qwen3.8-27B` | No disponible en la informacion | No disponible | bf16 | Apache 2.0 | Upstream en Hugging Face |

La comparacion con alternativas de otros fabricantes no esta disponible en la informacion proporcionada. La diferencia practica frente a los checkpoints upstream es el soporte nativo de Blackhole P150 y el empaquetado bfp4; a cambio, se pierde portabilidad a ecosistemas GPU estandar.

## Limitaciones y advertencias

- Sin validacion publicada: las puertas de calidad (equivalencia greedy, GSM8K, recuperacion KV) estan pendientes, por lo que no hay evidencia de que la precision se mantenga frente al checkpoint FP8.
- Formato propietario: los pesos no son cargables por vLLM, llama.cpp, Ollama o TGI estandar; requieren el stack tt-metal parcheado y el plugin vllm-tt.
- Hardware muy especifico: solo dos Blackhole P150 en TP=2 segun la documentacion; no se describe compatibilidad con otras configuraciones.
- Riesgo de alucinacion: inherente al modelo base y no cuantificado en esta requantizacion; la cuantizacion a 4 bits puede amplificarlo en tareas de razonamiento largo.
- Sesgos: no documentados en la informacion disponible; dependen del checkpoint Qwen3.8-27B y del dataset de calibracion, orientado a codigo y agentes, lo que puede sesgar el comportamiento hacia ese dominio.
- Idiomas: no se declara la lista de idiomas soportados; no se puede asumir cobertura multilingue sin verificar contra el modelo base.
- Integridad: los ficheros `crc32.txt` y `safetensors-md5sum.txt` incluidos describen los shards FP8 upstream, no los shards de este repo; no deben usarse para verificar la descarga.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Uso comercial: permitido por Apache 2.0, pero conviene revisar la licencia del modelo base y de los datasets de calibracion si se redistribuye.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/donach/qwen3.8-27b-g2-bfp4-packed
- Paquete de servicio: https://huggingface.co/donach/qwen3.8-27b-p150x2
- Herramienta de despliegue: https://github.com/tenstorrent/tt-model-manager
- Modelo base bf16: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base FP8: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Repositorio tt-metal (fork en publicacion, segun el autor): https://github.com/tenstorrent/tt-metal
