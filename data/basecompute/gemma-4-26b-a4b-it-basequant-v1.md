# basecompute/gemma-4-26B-A4B-it-BaseQuant-V1

## Resumen

`basecompute/gemma-4-26B-A4B-it-BaseQuant-V1` es una cuantización del modelo `google/gemma-4-26B-A4B-it`, publicada por el usuario basecompute. Se distribuye en dos formatos: un bundle propietario `.base` para el motor baseRT (18,40 GB) y un fichero GGUF para llama.cpp (16,93 GB), ambos en una única variante de tamaño denominada "Medium". El bundle `.base` incluye además la torre de visión y la cabeza MTP (multi-token prediction) para decodificación especulativa, lo que lo diferencia del GGUF estándar.

El modelo base es un Gemma 4 de Google con 25.233.142.046 parámetros totales según los safetensors del repositorio, y la nomenclatura "A4B" sugiere una arquitectura de mezcla de expertos con aproximadamente 4 mil millones de parámetros activos, aunque este dato no se confirma explícitamente en la información disponible. La variante `-it` indica un ajuste para instrucciones y uso conversacional.

La relevancia de esta publicación es doble: por un lado, ofrece una alternativa de cuantización de ~17 GB que reduce el peso del modelo original en BF16 a la mitad aproximadamente, manteniendo una divergencia KL baja frente a la distribución de referencia; por otro, introduce el formato `.base` de baseRT como opción de despliegue alternativa a llama.cpp, con soporte de decodificación especulativa y visión. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una publicación muy reciente (creada el 13 de noviembre de 2026) y sin adopción todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), presumiblemente MoE segun nomenclatura A4B; no confirmado en la informacion disponible |
| Parametros totales | 25.233.142.046 |
| Parametros activos | no disponible (la nomenclatura "A4B" sugiere ~4B activos, sin confirmar) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de llama-server con `-c 32768`); no se especifica el maximo del modelo base |
| Tipos de cuantizacion | Una unica variante "Medium": bundle `.base` de 18,40 GB y GGUF de 16,93 GB (esquema de cuantizacion no detallado) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0, con enlace a la licencia de Gemma 4 de Google |
| Formato de pesos | `.base` (bundle baseRT) y `.gguf` (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base `google/gemma-4-26B-A4B-it` en la documentacion proporcionada. La nomenclatura "A4B" es consistente con una arquitectura de mezcla de expertos (MoE) con aproximadamente 4 mil millones de parametros activos sobre un total de 25,23 mil millones, pero este extremo no se confirma en la model card. El sufijo `-it` indica ajuste por instrucciones, y la presencia de una cabeza MTP (multi-token prediction) en el bundle `.base` apunta a un entrenamiento orientado a decodificacion especulativa.

La cuantizacion BaseQuant V1 se evalua mediante divergencia KL de la distribucion del siguiente token frente al modelo en BF16, sobre 58 prompts en diez categorias y 32.466 tokens puntuados, con un conjunto de evaluacion no utilizado para construir los ficheros. El resultado global es de 0,06783 para el bundle `.base` y 0,06957 para el GGUF, frente a 0,07127 de la cuantizacion `UD-Q4_K_XL` de unsloth del mismo tamano. No se detalla el metodo de cuantizacion (calibracion, esquema de bits por tensor, etc.) ni los datos de entrenamiento del modelo base.

## Capacidades

- Generacion de texto conversacional (etiqueta `conversational` en el repositorio).
- Razonamiento y matematicas: la evaluacion de divergencia KL incluye categorias especificas de matematicas, ciencia e investigacion.
- Generacion de codigo, incluida codificacion agentica (categoria "Agentic coding" en la evaluacion).
- Uso de herramientas: la evaluacion incluye una categoria "Tool use", lo que sugiere soporte de tool calling o function calling en el modelo base.
- Vision: el bundle `.base` incluye la torre de vision del modelo base, por lo que preserva capacidades multimodales de imagen; el GGUF no menciona explicitamente esta capacidad.
- Decodificacion especulativa: el bundle `.base` incorpora la cabeza MTP, que permite acelerar la generacion mediante prediccion multi-token.
- Multilingue: la evaluacion incluye una categoria "Multilingual", aunque no se enumeran los idiomas soportados.
- Contexto largo: la evaluacion incluye una categoria "Long context" con 2.048 tokens puntuados; el ejemplo de llama.cpp usa 32.768 tokens de contexto.

## Casos de uso

- Despliegue en servidor con llama.cpp: el GGUF de 16,93 GB puede servirse con `llama-server` usando `-ngl 99` para descargar todas las capas en GPU, adecuado para entornos con una sola GPU de 24 GB o superior.
- Despliegue con baseRT y decodificacion especulativa: el bundle `.base` incluye la cabeza MTP, lo que permite acelerar la generacion en el motor baseRT en escenarios de baja latencia, como asistentes interactivos.
- Aplicaciones multimodales con vision: al conservar la torre de vision en el bundle `.base`, el modelo puede emplearse en tareas de descripcion de imagenes, extraccion de informacion de documentos escaneados o analisis de capturas, siempre que el motor baseRT lo soporte.
- Codificacion agentica: la baja divergencia KL en la categoria "Agentic coding" (0,00527 en `.base`, 0,00501 en GGUF) sugiere que la cuantizacion preserva el comportamiento del modelo en tareas de generacion de codigo con uso de herramientas, apto para integrarse en pipelines de CI/CD o asistentes de IDE.
- Razonamiento matematico y cientifico: las categorias "Math" (0,00251) y "Science" (0,00275) presentan las divergencias mas bajas, lo que indica que la cuantizacion degrada muy poco el comportamiento en estas tareas; util para tutoria automatica o resolucion de problemas.
- Uso de herramientas en produccion: la categoria "Tool use" (0,00575 en `.base`) sugiere que el modelo conserva la capacidad de invocar funciones externas, adecuado para orquestadores de agentes que necesiten llamar APIs.
- Procesamiento de contexto largo: con 32.768 tokens de contexto en el ejemplo de llama.cpp, puede emplearse para resumir documentos extensos o mantener conversaciones multi-turno prolongadas, aunque la divergencia KL en "Long context" es la mas alta (0,31866 en `.base`), lo que aconseja validacion especifica en este escenario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente proporciona divergencia KL frente al modelo BF16, que mide fidelidad de la cuantizacion, no rendimiento absoluto:

| Categoria | Tokens | BaseQuant `.base` | BaseQuant GGUF | unsloth `UD-Q4_K_XL` |
|---|---:|---:|---:|---:|
| Agentic coding | 1.925 | 0,00527 | 0,00501 | 0,00536 |
| Chat | 3.291 | 0,00753 | 0,00787 | 0,00642 |
| Code | 2.897 | 0,10475 | 0,11525 | 0,10739 |
| Long context | 2.048 | 0,31866 | 0,31207 | 0,33115 |
| Math | 4.261 | 0,00251 | 0,00247 | 0,00297 |
| Multilingual | 4.253 | 0,00240 | 0,00269 | 0,00286 |
| Prose | 3.976 | 0,28921 | 0,29907 | 0,30696 |
| Research | 2.584 | 0,00457 | 0,00439 | 0,00553 |
| Science | 4.369 | 0,00275 | 0,00303 | 0,00367 |
| Tool use | 2.862 | 0,00575 | 0,00502 | 0,00613 |
| **All** | 32.466 | **0,06783** | **0,06957** | **0,07127** |

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF de 16,93 GB requiere al menos ~17 GB de VRAM para cargarse completamente en GPU, mas overhead de contexto (a 32.768 tokens, el consumo adicional de KV cache puede ser significativo). El bundle `.base` de 18,40 GB requiere al menos ~19 GB.
- GPU recomendadas: para carga completa en GPU, se necesitan tarjetas con 24 GB o mas, como RTX 3090, RTX 4090, A100 40 GB, H100 o L40S. El modelo no cabe en GPUs consumer de 16 GB o menos sin descarga parcial a CPU.
- Cabe en consumer GPU: si, en RTX 3090 y RTX 4090 (24 GB), con margen limitado para contexto largo. En GPUs de 16 GB seria necesario usar offloading parcial.
- Opciones de despliegue: llama.cpp (`llama-server`), baseRT (`basert serve`), SuperFluid (`superfluid serve` con runtime basert). No se menciona soporte de vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput estimados: no disponibles. La presencia de la cabeza MTP en el bundle `.base` sugiere aceleracion por decodificacion especulativa, pero no se proporcionan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Divergencia KL global |
|---|---|---|---|---|---|
| basecompute/gemma-4-26B-A4B-it-BaseQuant-V1 (`.base`) | 25,23B | 32.768 (ejemplo) | `.base` | apache-2.0 | 0,06783 |
| basecompute/gemma-4-26B-A4B-it-BaseQuant-V1 (GGUF) | 25,23B | 32.768 (ejemplo) | GGUF | apache-2.0 | 0,06957 |
| unsloth UD-Q4_K_XL (gemma-4-26B-A4B-it) | 25,23B | no disponible | GGUF | no disponible | 0,07127 |
| google/gemma-4-26B-A4B-it (BF16) | 25,23B | no disponible | safetensors | apache-2.0 / Gemma 4 | referencia (0) |

La comparativa se limita a variantes de cuantizacion del mismo modelo base, ya que no se dispone de datos de rendimiento absoluto ni de modelos alternativos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no detalla el esquema de cuantizacion (bits por tensor, metodo de calibracion), lo que dificulta evaluar el compromiso entre tamano y fidelidad.
- La divergencia KL en "Long context" (0,31866 en `.base`) y "Prose" (0,28921) es notablemente superior a la de otras categorias, lo que indica mayor degradacion en generacion de texto libre y contextos extensos.
- El bundle `.base` requiere baseRT en una version no especificada ("TODO-VERSION"), lo que puede suponer un problema de compatibilidad en produccion.
- El GGUF no menciona soporte de vision ni de decodificacion especulativa, a diferencia del bundle `.base`; conviene verificar estas capacidades antes de usarlo.
- No se enumeran los idiomas soportados, por lo que no se puede garantizar un rendimiento multilingue mas alla de la categoria evaluada.
- No se han publicado benchmarks absolutos (MMLU, HumanEval, GSM8K), solo divergencia KL frente al modelo BF16; no hay evidencia de rendimiento real en tareas.
- El repositorio tiene 0 descargas y 0 likes, y fue creado el 13 de noviembre de 2026; se trata de una publicacion sin adopcion ni validacion comunitaria.
- La licencia se declara apache-2.0, pero enlaza a la licencia de Gemma 4 de Google, que puede imponer restricciones adicionales de uso comercial; conviene revisar los terminos de dicha licencia.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones especificas; al ser una cuantizacion, hereda los sesgos y riesgos del modelo base, no descritos en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/basecompute/gemma-4-26B-A4B-it-BaseQuant-V1
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Instalador de SuperFluid: https://superfluid.sh/install.sh
- Cuantizacion de referencia unsloth UD-Q4_K_XL: no disponible (enlace no proporcionado en la informacion)
