# Jeesup/svd-safety-l2_basis_remove50_swapgapnet_b010_r04

## Resumen

svd-safety-l2_basis_remove50_swapgapnet_b010_r04 es un checkpoint de investigación derivado de meta-llama/Llama-2-7b-chat-hf, publicado por el usuario Jeesup en HuggingFace. No es un modelo conversacional de propósito general: es una celda concreta de una rejilla experimental que estudia cómo la compresión por descomposición en valores singulares (SVD) degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño.

El punto de partida es Llama-2-7b-chat comprimido al 50,00% de sus parámetros densos mediante Basis Sharing (técnica presentada en ICLR 2025, con bases compartidas sobre grupos de 2 capas adyacentes). Sobre esa base comprimida se aplican 4 de las 10 rondas previstas de un procedimiento iterativo de intercambio de parámetros neutro en parámetros («parameter-neutral swap»), guiado por la regla swapgapnet_iter, con un presupuesto de hasta el 0,1% de los parámetros densos por ronda y un presupuesto total de la ejecución completa del 1,0%. El resultado es un checkpoint intermedio, con una fracción de parámetros efectiva de 0,4998.

Su relevancia es metodológica, no práctica: aporta mediciones cuantitativas de seguridad (ASR en AdvBench y StrongREJECT, over-refusal en WildGuard) para una configuración reproducible (semilla 42) dentro de un estudio comparativo de reglas de selección y presupuestos. El propio autor advierte explícitamente de que varios brazos de la rejilla están deliberadamente degradados en seguridad respecto a Llama-2-7b-chat y de que cada celda debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama 2 (pre-normalizacion con RMSNorm, RoPE, SwiGLU), con compresion SVD por comparticion de bases sobre las proyecciones |
| Parametros totales | 6.738.415.616 (≈6,74 B) segun los safetensors publicados; fraccion de parametros densos efectiva tras la compresion: 0,4998 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4096 tokens (heredada de Llama-2-7b-chat-hf; no se documenta modificacion) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en precision completa; no hay versiones GGUF, AWQ, GPTQ ni cuantizaciones de 8 o 4 bits |
| Idiomas soportados | No disponible en la ficha. El modelo base Llama 2 esta optimizado principalmente para ingles |
| Licencia | Llama 2 Community License (se incluyen LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors, cargables con transformers |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Tipo de artefacto | Checkpoint intermedio de investigacion (ronda 4 de 10 de un run mas largo) |
| Compresion | Basis Sharing (ICLR 2025), bases compartidas sobre grupos de 2 capas adyacentes, 50,00% de parametros eliminados |
| Regla de seleccion | swapgapnet_iter |
| Presupuesto de restauracion | 1,000% de los parametros densos; 1783 componentes restaurados y 1783 sustituidos; 25.886.720 parametros intercambiados (0,40% de los parametros densos de proyeccion) |
| Recuperacion posterior | LoRA r=8 solo sobre los coeficientes por capa (bases congeladas, presupuesto sin cambios), 2 epocas, lr 0,0001, batch 64, dataset alpaca-cleaned |
| Semilla | 42 |
| Tamano del repositorio | 13,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 en su variante de 7B: un transformer decoder-only con 32 capas, normalizacion RMSNorm previa a cada subcapa, embeddings posicionales rotatorios (RoPE) y activacion SwiGLU en el MLP. Sobre esa arquitectura, la innovacion del checkpoint es de compresion, no de diseno: se aplica Basis Sharing, un esquema que factoriza por SVD las matrices de proyeccion compartiendo las bases entre grupos de dos capas adyacentes, lo que reduce el numero de bases que hay que almacenar. En esta celda se elimina el 50,00% de los parametros densos.

Tras la compresion, el autor aplica un procedimiento iterativo de intercambio de parametros neutro en numero de parametros: en cada ronda se seleccionan componentes segun la regla swapgapnet_iter y se sustituyen por otros, donde el valor de intercambio es «net» (valor de insercion mas valor de eliminacion del desalojo ordenado por sigma). Cada ronda mueve hasta el 0,1% de los parametros densos. Este checkpoint corresponde a la ronda 4 de 10, con 1783 componentes restaurados e igual numero sustituidos, lo que deja una fraccion de parametros de 0,4998 y 25.886.720 parametros intercambiados (0,40% de los parametros densos de proyeccion). Despues se realiza una recuperacion ligera con LoRA de rango 8 aplicada unicamente a los coeficientes por capa, manteniendo las bases congeladas y el presupuesto inalterado: 2 epocas, learning rate 0,0001, batch 64 y el dataset alpaca-cleaned. No se documenta un entrenamiento adicional a gran escala, ni fases de RLHF o DPO propias de esta celda.

## Capacidades

- Generacion de texto conversacional: hereda la interfaz de chat de Llama-2-7b-chat, con plantilla de dialogo [INST] y system prompt.
- Razonamiento basico y respuesta a instrucciones: capacidad residual del modelo base, no medida ni garantizada en esta celda.
- Generacion de codigo y matematicas: capacidad potencial del modelo base, sin evaluacion publicada para este checkpoint.
- Tool calling / function calling: no documentado; Llama-2-7b-chat no incorpora un formato nativo de llamada a herramientas.
- Uso como agente y razonamiento multi-paso: no documentado ni evaluado.
- Multilingue: no documentado; el modelo base esta orientado al ingles.
- Capacidad especial: modo «thinking» explicito no disponible. Lo que si aporta es utilidad como sujeto experimental para medir seguridad bajo compresion (ASR con juez HarmBench, over-refusal con WildGuard).
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles, segun las etiquetas del repositorio.

## Casos de uso

- Estudio de interpretabilidad de la seguridad bajo compresion: usar este checkpoint como celda de referencia para cuantificar cuanto dano en seguridad introduce eliminar el 50% de los parametros densos con Basis Sharing, comparando su ASR con el del modelo denso original.
- Evaluacion comparativa de reglas de seleccion de componentes: al ser una celda de una rejilla sobre reglas y presupuestos, sirve para contrastar swapgapnet_iter frente a otras reglas con el mismo presupuesto de restauracion y la misma semilla (42), aislando el efecto de la regla.
- Red teaming y evaluacion adversarial reproducible: el checkpoint puede emplearse como objetivo de ataques en AdvBench y StrongREJECT con el juez de HarmBench, aprovechando que el autor publica los valores de referencia (ASR de 0,2212 y 0,2843) para validar que un pipeline de evaluacion reproduce las mismas cifras.
- Auditoria de sobre-rechazo (over-refusal): medir con WildGuard la tasa macro de rechazo a peticiones benignas (0,0841 en esta celda) y analizar si la compresion y la reparacion alteran el equilibrio entre seguridad y utilidad.
- Investigacion sobre compresion y alineacion: estudiar si las direcciones de seguridad de un modelo alineado sobreviven a una factorizacion SVD agresiva y si el intercambio iterativo de componentes puede recuperarlas sin reentrenar las bases.
- Experimentos de recuperacion con LoRA sobre coeficientes: reproducir la receta de LoRA r=8 sobre coeficientes por capa con bases congeladas (2 epocas, lr 0,0001, batch 64, alpaca-cleaned) para medir cuanto se recupera con un presupuesto minimo de adaptadores.
- Docencia y divulgacion tecnica: usar la rejilla completa como caso de estudio de metodologia experimental en compresion de modelos, ilustrando como se disenan presupuestos, se fijan semillas y se reportan metricas de seguridad y utilidad.
- Banco de pruebas de infraestructura de inferencia: validar despliegues con transformers o text-generation-inference sobre un checkpoint de 6,74 B en fp16 antes de pasar a modelos de produccion, dado su tamano manejable.

## Benchmarks y rendimiento

| Metrica | Valor | Interpretacion |
|---|---|---|
| AdvBench ASR (juez HarmBench) | 0,2212 | 22,12% de exito de ataque sobre el conjunto AdvBench |
| StrongREJECT ASR (juez HarmBench) | 0,2843 | 28,43% de exito de ataque sobre StrongREJECT |
| Macro over-refusal (WildGuard) | 0,0841 | 8,41% de rechazos sobre peticiones benignas |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se proporcionan los valores de referencia del modelo denso Llama-2-7b-chat en estas mismas metricas, por lo que no es posible cuantificar la degradacion a partir de los datos disponibles; el autor afirma cualitativamente que la compresion por si sola eleva la tasa de exito de ataque y que el estudio pretende medirla y probar su recuperacion.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: unos 13,5 GB solo de pesos (13,5 GB es tambien el tamano del repositorio), mas cache KV y activaciones. Estimacion de cache KV en fp16 a 4096 tokens de contexto: aproximadamente 2 GB, lo que situa el total practico en torno a 16 GB.
- VRAM en cuantizacion de 8 bits: aproximadamente 7 GB de pesos (estimacion, no hay versiones publicadas). En 4 bits: aproximadamente 3,5-4 GB.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servicio concurrente; RTX 4090 o RTX 3090 (24 GB) para fp16 en una sola tarjeta.
- Cabe en GPU de consumo: si. En fp16 en RTX 4090, RTX 3090 o RTX 4080 de 16 GB con contexto reducido; en 4 bits, en tarjetas de 8-12 GB como RTX 3060, RTX 4060 Ti o RTX 4070.
- Opciones de despliegue: transformers (libreria declarada) y text-generation-inference, ademas de endpoints compatibles segun las etiquetas del repositorio. No se documentan recetas para vLLM, SGLang, llama.cpp ni Ollama, aunque al tratarse de una arquitectura Llama 2 estandar serian teoricamente compatibles; no se publican conversiones a GGUF.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

Los datos estructurales de las alternativas que figuran a continuacion no proceden de la informacion proporcionada para este modelo (corresponden a conocimiento general de esos modelos publicos) y se incluyen solo como referencia de categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento de seguridad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-l2_basis_remove50_swapgapnet_b010_r04 | 6,74 B almacenados; fraccion densa efectiva 0,4998 | 4096 tokens | Llama 2 Community License | HuggingFace, 0 descargas | AdvBench ASR 0,2212; StrongREJECT ASR 0,2843; over-refusal 0,0841 |
| meta-llama/Llama-2-7b-chat-hf (modelo base) | 6,74 B densos | 4096 tokens | Llama 2 Community License | HuggingFace | No disponible en la informacion proporcionada |
| Llama 3.1 8B Instruct | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Llama 3.1 Community License | HuggingFace | no disponible |
| Mistral 7B Instruct | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Apache 2.0 | HuggingFace | no disponible |

La comparacion relevante para el proposito del artefacto no es con modelos alternativos, sino con las demas celdas de la rejilla del mismo estudio (distintas reglas de seleccion y presupuestos) y con la linea base densa sin comprimir.

## Limitaciones y advertencias

- No es un modelo desplegable: el autor lo describe explicitamente como artefacto de investigacion y sujeto experimental, no como asistente de proposito general.
- Seguridad degradada por diseno experimental: varios brazos de la rejilla son deliberadamente menos seguros que Llama-2-7b-chat; la compresion sola eleva la tasa de exito de ataque. La celda reporta un ASR de 0,2212 en AdvBench, un valor que debe evaluarse en su contexto y no extrapolarse a otros presupuestos.
- Checkpoint intermedio: corresponde a la ronda 4 de 10 de un run mas largo, por lo que no representa el punto final de la curva de reparacion.
- Riesgo de alucinacion: no se han medido metricas de veracidad ni de factualidad; el comportamiento del modelo base Llama-2-7b-chat en este aspecto sigue siendo aplicable y no mejora con la compresion.
- Limitaciones de contexto: 4096 tokens, insuficiente para tareas de contexto largo o documentos extensos.
- Limitaciones de idioma: no se documentan idiomas soportados; el modelo base esta orientado al ingles, por lo que el rendimiento en castellano no esta garantizado ni evaluado.
- Licencia: Llama 2 Community License, que impone condiciones de uso, obligacion de atribucion («Built with Llama») y restricciones de la politica de uso aceptable (USE_POLICY.md). No es una licencia permisiva tipo Apache 2.0.
- Ausencia de validacion externa: 0 descargas y 0 likes, sin evaluaciones independientes que confirmen las cifras publicadas.
- Ausencia de cuantizaciones y de mediciones de latencia o throughput: cualquier estimacion de coste de despliegue debe hacerse a partir del recuento de parametros y validarse en el entorno real.
- Sesgos: no se documenta ninguna evaluacion de sesgo para este checkpoint; los sesgos del corpus de Llama 2 y de alpaca-cleaned son heredables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove50_swapgapnet_b010_r04
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia y politica de uso: LICENSE.txt y USE_POLICY.md incluidos en el propio repositorio (Llama 2 Community License)
- Paper de Basis Sharing (ICLR 2025): citado en la model card sin enlace; no disponible
- Repositorio de codigo, demo o blog del autor: no disponible
- Resultados de la busqueda web: no se encontraron enlaces relevantes. Los resultados devueltos correspondian a documentacion de New Relic sobre el tipo de dato Metric y a un repositorio de agregador de metricas, sin relacion con este modelo.
