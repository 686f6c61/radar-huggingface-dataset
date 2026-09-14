# Jeesup/svd-safety-l2_remove50_swapgapnet_a010_b010_r01

## Resumen

svd-safety-l2_remove50_swapgapnet_a010_b010_r01 es un checkpoint de investigación publicado por el usuario Jeesup que parte de meta-llama/Llama-2-7b-chat-hf. Sobre ese modelo base se aplica una compresión SVD-LLM que elimina el 50,01 % de los parámetros de las proyecciones densas (fracción de parámetros resultante declarada: 0,4999) y, a continuación, una edición de pesos que sustituye 352 componentes por otros 352, intercambiando 3.934.208 parámetros (0,06 % de las proyecciones densas) mediante la regla de selección `gap_iter`, con semilla 42 y un presupuesto de restauración del 1,000 % de los parámetros densos repartido en diez rondas. Este repositorio contiene únicamente la primera de esas diez rondas (0,100 % del presupuesto por ronda), por lo que es un checkpoint intermedio de una ejecución más larga.

El problema que aborda es acotado y experimental: cuantificar cómo la compresión por SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. El autor indica explícitamente que varias ramas de su rejilla experimental están degradadas en seguridad de forma deliberada y que este checkpoint no es un asistente de propósito general, sino un sujeto de estudio.

La relevancia actual es metodológica, no de producto: sirve como celda de una rejilla que cruza reglas de selección y presupuestos de restauración, con métricas de seguridad y de utilidad medidas (ASR en AdvBench y StrongREJECT, sobre-rechazo en WildGuard), y con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 2, con pesos de proyección comprimidos por descomposición en valores singulares (SVD-LLM) |
| Parámetros totales | 6.738.415.616 (recuento real de los safetensors del repositorio) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 4.096 tokens, heredada del modelo base Llama-2-7b-chat |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos en safetensors; no se incluyen versiones GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible; el modelo base está orientado principalmente al inglés |
| Licencia | Llama 2 Community License (el repositorio incluye `LICENSE.txt` y `USE_POLICY.md`) |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Fracción de parámetros declarada tras la compresión | 0,4999 (50,01 % eliminado de las proyecciones densas) |
| Componentes restaurados / retirados | 352 / 352 |
| Parámetros intercambiados | 3.934.208 (0,06 % de las proyecciones densas) |
| Regla de selección | `gap_iter` |
| Rondas iterativas aplicadas | 1 de 10 |
| Tamaño del repositorio | 13,5 GB |
| Pipeline | `text-generation` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: hereda la arquitectura del transformer decoder-only de Llama-2-7b-chat y su alineación previa (preentrenamiento sobre datos públicos y ajuste con RLHF según la documentación de Meta para la familia Llama 2). Lo que define a este checkpoint es el posprocesado de pesos en dos etapas. Primero, una compresión SVD-LLM que trunca los valores singulares de las matrices de proyección hasta dejar el 49,99 % de sus parámetros. Segundo, una edición iterativa denominada en la model card "parameter-neutral swap": en cada ronda se seleccionan componentes y se sustituyen por otros, con un valor de intercambio `net` (valor de inserción más valor de eliminación del descarte ordenado por sigma) y una escala de inserción de 0,1, es decir, los componentes se reintroducen al 10 % de su fuerza original.

La innovación técnica del artefacto es el criterio de selección de componentes (`gap_iter`) y la propia metodología de restauración bajo restricción de presupuesto, no la arquitectura del modelo. El resultado es un peso denso estándar, cargable con `transformers`, sin capas adicionales, sin decodificación especulativa, sin atención lineal y sin mecanismos de routing. No hay datos publicados sobre el número de tokens vistos por esta edición (la edición no es entrenamiento supervisado con dataset) ni sobre composición de dataset específica de este checkpoint.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama-2-7b-chat, aunque con la alineación de seguridad parcialmente dañada por la compresión.
- Razonamiento y conocimiento general a escala 7B: no se han publicado métricas de MMLU, GSM8K ni HumanEval para este checkpoint.
- Generación de código y matemáticas básicas: capacidad heredada del modelo base, sin evaluación publicada en este repositorio.
- Soporte de tool calling / function calling: no soportado de forma nativa (Llama-2-7b-chat no incluye formato de herramientas en su plantilla de chat).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingües: no disponibles; el modelo base está optimizado principalmente para inglés.
- Capacidades especiales: ninguna. No hay modo de razonamiento extendido ("thinking"), ni visión, ni audio, ni ventana de contexto ampliada.
- Comportamiento medido relevante: tasa de éxito de ataque (ASR) de 0,5250 en AdvBench y 0,3610 en StrongREJECT con el juez de HarmBench; sobre-rechazo macro de 0,0964 medido con WildGuard.

## Casos de uso

- Estudio de seguridad bajo compresión: medir el ASR en AdvBench y StrongREJECT de un modelo comprimido al 50 % y compararlo con el del Llama-2-7b-chat sin comprimir, usando el mismo juez (HarmBench) para aislar el efecto de la compresión.
- Investigación de interpretabilidad de la alineación: analizar qué función cumplen los 352 componentes restaurados y si su reintroducción al 10 % de fuerza recupera comportamiento seguro, comparando con las rondas posteriores de la misma ejecución.
- Reproducción y ablación de reglas de selección: usar esta celda como punto de partida de una rejilla que compare `gap_iter` con otras reglas bajo el mismo presupuesto (1,000 % de parámetros densos, 0,100 % por ronda, semilla 42).
- Calibración de jueces automáticos de seguridad: emplear los valores 0,5250 / 0,3610 / 0,0964 como referencia para validar que un juez clasifica correctamente respuestas de un modelo deliberadamente degradado.
- Medición del coste en utilidad de las defensas: cuantificar el sobre-rechazo (0,0964) que introduce la restauración de seguridad, para estudiar el compromiso seguridad-utilidad en modelos comprimidos.
- Transferencia metodológica: replicar el flujo SVD-LLM más edición por intercambio de parámetros sobre otros modelos alineados de distinto tamaño para comprobar si el criterio de selección escala.
- Docencia y divulgación sobre límites de la compresión: ilustrar con métricas concretas que una compresión aparentemente neutra en parámetros puede degradar propiedades de seguridad no medidas por perplejidad.
- Referencia negativa en pipelines de evaluación: incluir este checkpoint como caso de control "modelo inseguro" en pruebas de sistemas de moderación o de guardarraíles.

Ninguno de estos casos implica despliegue en producción. El propio autor indica que cada celda debe tratarse como sujeto experimental, no como asistente desplegable.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor | Juez / herramienta |
|---|---|---|---|
| AdvBench | Tasa de éxito de ataque (ASR) | 0,5250 | HarmBench judge |
| StrongREJECT | Tasa de éxito de ataque (ASR) | 0,3610 | HarmBench judge |
| WildGuard | Sobre-rechazo macro | 0,0964 | WildGuard |
| MMLU, GSM8K, HumanEval y similares | No evaluados | no disponible | no disponible |
| Llama-2-7b-chat (base, mismas pruebas) | No publicado en la información disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo aporta las tres métricas de la tabla, todas ellas orientadas a seguridad y utilidad conversacional.

## Requisitos de hardware

- VRAM para inferencia en FP16/BF16: aproximadamente 13,5 GB solo de pesos (el repositorio ocupa 13,5 GB), más la caché KV; con 4.096 tokens de contexto y lote pequeño, contar con 15-16 GB.
- VRAM en cuantización INT8: del orden de 6,7-7,5 GB de pesos, más caché KV.
- VRAM en cuantización de 4 bits: del orden de 3,4-4,5 GB de pesos, más caché KV y overhead del runtime.
- GPU profesionales: A100 (40 o 80 GB), H100 (80 GB) y L40S (48 GB) ejecutan el modelo en FP16 sin problema.
- GPU de consumo: RTX 4090 y RTX 3090 (24 GB) lo ejecutan en FP16 con margen; RTX 4080/4070 Ti (16 GB) también en FP16 con contexto reducido; tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 3070/4060 Ti 8 GB) requieren cuantización de 4 bits.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), Text Generation Inference (el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`) y vLLM para servir en FP16 o con cuantización en tiempo de ejecución. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no se incluye en el repositorio.
- Latencia y throughput estimados: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Seguridad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove50_swapgapnet_a010_b010_r01 (este checkpoint) | 6.738.415.616 almacenados; 0,4999 de las proyecciones densas tras SVD | 4.096 (heredado) | ASR 0,5250 (AdvBench) y 0,3610 (StrongREJECT); sobre-rechazo 0,0964 | Llama 2 Community License | HuggingFace, 0 descargas |
| meta-llama/Llama-2-7b-chat-hf (referencia directa) | ~6,74 mil millones | 4.096 | no disponible en la información proporcionada (el autor indica que la compresión por sí sola eleva el ASR respecto al base) | Llama 2 Community License | HuggingFace, ampliamente utilizado |
| Otras celdas de la rejilla del mismo autor (otras reglas y presupuestos) | no disponible | no disponible | no disponible | Llama 2 Community License | no listadas en la información disponible |
| Otros métodos de compresión de Llama-2-7b-chat (destilación, cuantización, pruning estructurado) | no disponible | no disponible | no disponible | variable | no disponible |

No se dispone de cifras comparativas publicadas para el modelo base ni para alternativas en la información proporcionada, por lo que la comparación cuantitativa queda pendiente de una evaluación propia con los mismos jueces.

## Limitaciones y advertencias

- Degradación deliberada de seguridad: el ASR de 0,5250 en AdvBench y 0,3610 en StrongREJECT indican que el modelo acepta una fracción alta de peticiones dañinas. No debe exponerse a usuarios finales.
- Checkpoint intermedio: solo se ha aplicado 1 de las 10 rondas previstas (0,100 % del presupuesto total de 1,000 %), por lo que no representa el resultado final de la ejecución.
- No es un asistente de propósito general: la propia model card lo describe como artefacto de investigación y sujeto experimental.
- Sobre-rechazo medido de 0,0964: la restauración de seguridad, cuando se aplica, puede inducir rechazos indebidos en peticiones benignas.
- Idiomas: sin datos declarados; comportamiento esperable centrado en inglés por herencia del modelo base.
- Riesgo de alucinación: no evaluado en este checkpoint; se hereda el del modelo base y puede verse alterado por la compresión.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos. El uso comercial está sujeto a las condiciones de Meta, incluidos el cumplimiento de la política de uso aceptable, la atribución "Built with Llama 2" y el límite de 700 millones de usuarios activos mensuales, entre otras cláusulas.
- Sin validación comunitaria: 0 descargas y 0 likes; no hay informes externos de reproducibilidad.
- Posible inconsistencia a verificar: la model card declara una fracción de parámetros de 0,4999 y un 50,01 % de parámetros eliminados, mientras que el recuento real de los safetensors es de 6.738.415.616 parámetros, un orden de magnitud propio de un modelo de 7B sin comprimir. Conviene inspeccionar las formas tensoriales antes de asumir que el ahorro de parámetros se refleja en el tamaño del checkpoint.
- Ausencia total de métricas de capacidad general (MMLU, HumanEval, GSM8K), lo que impide estimar el coste de la compresión fuera del ámbito de la seguridad.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapnet_a010_b010_r01
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Ficheros de licencia y política de uso incluidos en el repositorio: `LICENSE.txt` y `USE_POLICY.md`
- No se han proporcionado en la información disponible enlaces a papers (SVD-LLM, HarmBench, StrongREJECT, WildGuard), blogs, repositorios de código ni demos adicionales.
