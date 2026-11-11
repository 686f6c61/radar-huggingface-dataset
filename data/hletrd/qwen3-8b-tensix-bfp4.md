# hletrd/Qwen3-8B-Tensix-BFP4

## Resumen

Qwen3-8B-Tensix-BFP4 es una cuantización del modelo denso Qwen/Qwen3-8B (8.190.735.360 parámetros) publicada por el usuario hletrd y orientada específicamente a las NPU de Tenstorrent basadas en la arquitectura Tensix (Wormhole y Blackhole). El autor del proceso de cuantización es Xylolabs, que aplica GPTQ con búsqueda de exponente para redondear las proyecciones lineales al formato nativo de bloque flotante de TT-NN `ttnn.bfloat4_b` (BFP4).

El interés del modelo es de nicho pero técnicamente relevante: los pesos se almacenan como valores bf16 que caen exactamente sobre la rejilla de bloque flotante de cada matriz, de modo que el empaquetador de TT-NN los carga sin redondear de nuevo. Esto permite pasar de 8,5 bits por peso en BFP8 a 4,5 bits por peso en BFP4, reduciendo aproximadamente a la mitad los bytes que una matriz debe leer desde memoria.

El modelo conserva las capacidades del Qwen3-8B base (modo thinking y no-thinking, generación de texto, razonamiento, código y tool calling), pero su valor práctico está condicionado a ejecutarse sobre hardware Tensix. El autor indica explícitamente que no ha realizado benchmarks en tarjetas propias de Tenstorrent y que las pruebas se hicieron en `ttsim`, el simulador funcional de un chip Blackhole.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), pesos en formato de bloque flotante TT-NN |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en proyecciones lineales; bf16 en embedding, LM head, normas y sesgos; media de 6,25 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16 con valores sobre la rejilla BFP4); empaquetado a TT-NN via `pack_tensix.py` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-8B original: un transformer denso de 36 capas con atención completa, publicado por el equipo Qwen de Alibaba Cloud. El repositorio no aporta detalles sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO); esa información debe consultarse en la model card de Qwen/Qwen3-8B.

La innovación de esta ficha es el esquema de cuantización. Las 252 matrices de proyección (atención q, k, v, o; MLP gate, up y down en las 36 capas) se redondean a `bfloat4_b` mediante GPTQ con búsqueda de exponente. En el formato de bloque flotante de TT-NN, 16 valores consecutivos comparten un exponente de 8 bits y cada valor conserva signo y mantisa de 3 bits (BFP4) o 7 bits (BFP8). El LM head, el embedding, las normas y los sesgos se mantienen en bf16. Los ficheros almacenan valores bf16 situados exactamente sobre la rejilla de cada bloque, de modo que en `transformers` el checkpoint carga como el modelo base y calcula lo mismo que el modelo redondeado, y el empaquetador de TT-NN lo almacena sin redondear de nuevo. El fichero `quant4.json` documenta el formato de cada proyección por capa. El modelo empaquetado ocupa 6,397 GB frente a los 16,4 GB de los ficheros bf16.

## Capacidades

- Generación de texto conversacional y de un solo turno, heredada del Qwen3-8B base.
- Modo thinking y modo no-thinking, según la configuración de la plantilla de chat.
- Razonamiento y matemáticas (capacidades del modelo base, sin benchmarks propios publicados).
- Generación de código (capacidad del modelo base, sin resultados propios publicados).
- Soporte de tool calling y function calling (capacidad del modelo base Qwen3).
- Capacidades multilingües del modelo base; el repositorio no enumera idiomas concretos.
- Ejecución nativa en NPU Tensix mediante TT-NN, con empaquetado sin pérdida adicional de precisión.
- Verificación de integridad de la rejilla BFP4 sin software de Tenstorrent (`verify_grid.py`, solo torch y safetensors).
- Compatibilidad con el pipeline `text-generation` de Hugging Face y con text-generation-inference según los tags del repositorio.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole o Blackhole: el modelo está pensado para ejecutarse con TT-NN y tt-metal, aprovechando que cada matriz en BFP4 ocupa aproximadamente la mitad de bytes que en BFP8 y reduce la presión sobre el ancho de banda de memoria.
- Investigación en cuantización de bloque flotante: sirve como referencia reproducible para estudiar el impacto de BFP4 con GPTQ y búsqueda de exponente sobre un transformer de 8B, con verificación bit a bit del empaquetado.
- Prototipado en simulador: `ttsim` permite validar pipelines de empaquetado y ejecución sin disponer de hardware Tensix físico, útil para desarrollo previo a la compra o al acceso a tarjetas.
- Generación de código asistida en entornos con NPU: al conservar las capacidades del Qwen3-8B, puede integrarse en asistentes de programación desplegados sobre infraestructura Tenstorrent.
- Atención al cliente y chat multi-turno: el modelo base está orientado a conversación; el límite práctico vendrá del contexto del Qwen3-8B, no documentado en este repositorio.
- Canalizaciones de agentes con tool calling: el modelo base soporta function calling, lo que permite construir flujos de varios pasos sobre infraestructura Tensix.
- Evaluación comparativa de precisión: comparar las salidas de este checkpoint con el Qwen3-8B en bf16 permite medir la degradación introducida por BFP4 en tareas concretas.
- Cacheado de pesos en disco: `pack_tensix.py --cache-dir` genera ficheros de caché de TT-NN que se cargan sin reempaquetar, útil para arranques repetidos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no ha medido estos exports en tarjetas propias de Tenstorrent. Las únicas comprobaciones reportadas son de corrección, no de rendimiento: con ttnn 0.81.1 y torch 2.15.0 sobre `ttsim`, las 252 matrices redondeadas se empaquetaron a `ttnn.bfloat4_b` y se desempaquetaron bit a bit sin cambios, y lo mismo ocurrió al empaquetarlas como `ttnn.bfloat8_b`.

## Requisitos de hardware

- Hardware objetivo: NPU de Tenstorrent con arquitectura Tensix, como Wormhole o Blackhole.
- Tamaño empaquetado: 6,397 GB en formatos BFP4/BFP8 de TT-NN, frente a 16,4 GB de los ficheros bf16 del repositorio.
- VRAM estimada en GPU convencional: no disponible; el repositorio no documenta requisitos para GPU NVIDIA o AMD.
- GPU recomendadas: no disponible. El modelo está diseñado para NPU Tensix, no para CUDA.
- ¿Cabe en GPU de consumo? No hay datos publicados. En `transformers` cargaría como un modelo de 8B en bf16 (aproximadamente 16 GB de pesos), lo que en la práctica requiere GPUs de 24 GB o más, pero esta estimación no está confirmada por el autor.
- Opciones de despliegue: TT-NN y tt-metal (paquete Python `ttnn`), tt-transformers dentro de tt-metal, y `transformers` con `AutoModelForCausalLM` para carga y ejecución en CPU/GPU.
- Simulación: `ttsim`, simulador funcional de un chip Blackhole, probado con ttnn 0.81.1.
- Latencia y throughput: no disponibles; no se han realizado mediciones en hardware real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3-8B-Tensix-BFP4 | 8,19B | no disponible | BFP4 (4,5 bits/peso) + bf16 parcial | apache-2.0 | NPU Tensix (Wormhole, Blackhole) |
| Qwen/Qwen3-8B | 8,19B | no disponible | bf16 | apache-2.0 | GPU/CPU convencionales |
| Qwen3-8B en GPTQ/AWQ (terceros) | 8,19B | no disponible | 4 bits enteros tipicamente | depende del publicador | GPU con CUDA |

La comparación directa con otras cuantizaciones de 4 bits es limitada: BFP4 de TT-NN no es un formato entero de 4 bits, sino un bloque flotante con exponente compartido cada 16 valores, por lo que la degradación de precisión y el rendimiento no son trasladables sin medición. No se dispone de datos de benchmarks que permitan comparar calidad frente a alternativas.

## Limitaciones y advertencias

- No verificado en hardware Tensix real: todas las pruebas se hicieron en `ttsim`, el simulador de Blackhole. El propio autor lo señala.
- Sin benchmarks de calidad: no hay datos de MMLU, HumanEval, GSM8K ni similares para este checkpoint, por lo que se desconoce la degradación real frente al Qwen3-8B en bf16.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria.
- Idiomas no documentados: el repositorio no enumera los idiomas soportados; deben inferirse del modelo base.
- Contexto no documentado: la longitud de contexto del Qwen3-8B no se recoge en esta ficha.
- Dependencia de ecosistema: el valor del checkpoint depende de TT-NN y tt-metal; fuera de ese stack se comporta como un modelo de 8B en bf16 sin ventaja de tamaño.
- Riesgo de alucinación: inherente al modelo base; la cuantización BFP4 puede amplificarlo en tareas sensibles a la precisión numérica.
- Sesgos: no documentados en el repositorio; deben evaluarse a partir del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y no está afiliado ni respaldado por Tenstorrent.
- Aviso de no afiliación: el repositorio declara explícitamente que no está afiliado ni respaldado por Tenstorrent.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Qwen3-8B-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio tt-metal (incluye TT-NN y tt-transformers): https://github.com/tenstorrent/tt-metal
- Guía de instalación de tt-metal: https://github.com/tenstorrent/tt-metal/blob/main/INSTALLING.md
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia Qwen3 (arxiv:2505.09388): https://arxiv.org/abs/2505.09388
