# Jeesup/svd-safety-l2_jbbmix_k0p02_a1p0_free_remove40

## Resumen

El modelo `Jeesup/svd-safety-l2_jbbmix_k0p02_a1p0_free_remove40` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` al que se ha aplicado una compresión SVD-LLM que elimina el 40,00 % de los parámetros densos, dejando una fracción resultante de 0,5998 respecto del modelo original. Sobre esa base comprimida se aplicó una regla de selección de componentes SVD etiquetada por el autor como `unknown`, con un presupuesto de restauración de componentes del 0,000 % (es decir, cero componentes restaurados y cero intercambiados) y semilla 42. El resultado es un artefacto de investigación, no un asistente conversacional de propósito general.

El problema que aborda es la cuantificación del deterioro de seguridad que introduce la compresión de pesos en modelos alineados, y la evaluación de distintas reglas de selección de componentes para repararlo. Este checkpoint concreto es una celda de una rejilla experimental sobre reglas de selección y presupuestos de restauración. El autor advierte explícitamente de que varias celdas de la rejilla están degradadas deliberadamente en seguridad respecto a Llama-2-7b-chat, y de que cualquier celda debe tratarse como sujeto experimental.

La relevancia actual es metodológica: proporciona métricas comparables de tasa de éxito de ataque (AdvBench 0,0019; StrongREJECT 0,0160), sobre-rechazo macro (0,6721 medido con WildGuard) y perplejidad en WikiText-2 (11,6474), lo que permite estudiar el compromiso entre seguridad y utilidad bajo compresión. El recuento de parámetros declarado en los safetensors del repositorio es de 6.738.415.616, cifra que coincide con el número de parámetros del Llama-2-7b-chat denso y que conviene verificar frente a la fracción de 0,5998 declarada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama 2 (heredada de Llama-2-7b-chat), con pesos comprimidos mediante SVD-LLM |
| Parametros totales | 6.738.415.616 segun los safetensors del repositorio; la model card declara una fraccion resultante de 0,5998 respecto al modelo denso (dato a verificar) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4096 tokens (heredada de Llama-2-7b-chat; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni bitsandbytes en el repositorio) |
| Idiomas soportados | no disponible (la ficha de HuggingFace no declara idiomas) |
| Licencia | llama2 (Llama 2 Community License; el repositorio incluye LICENSE.txt y USE_POLICY.md) |
| Formato de pesos | safetensors, cargable con transformers |
| Base (sin comprimir) | meta-llama/Llama-2-7b-chat-hf |
| Metodo de compresion | SVD-LLM, 40,00 % de parametros eliminados |
| Regla de seleccion | `unknown` |
| Presupuesto de restauracion | 0,000 % de parametros densos; 0 componentes restaurados, 0 intercambiados |
| Semilla | 42 |
| Tamano del repositorio | 13,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-01 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B chat: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion causal, en configuracion 7B. La intervencion realizada no es un reentrenamiento sino una compresion post hoc de bajo rango: SVD-LLM descompone en valores singulares las matrices de pesos y trunca componentes para reducir el numero de parametros, en este caso un 40,00 % de eliminacion. Sobre ese checkpoint comprimido se aplica despues una fase de restauracion de componentes SVD seleccionados por una regla concreta; en esta celda el presupuesto de restauracion es del 0,000 %, por lo que no se restauro ningun componente.

No se documenta en la informacion disponible ningun proceso adicional de ajuste fino, RLHF, DPO o destilacion especifico para este checkpoint; la alineacion conversacional procede del modelo base Llama-2-7b-chat, que ya incorpora RLHF. La innovacion tecnica del artefacto es precisamente el protocolo experimental: una rejilla sobre reglas de seleccion de componentes y presupuestos de restauracion, con semilla fija (42), que permite medir de forma controlada como la compresion SVD degrada el comportamiento de rechazo y que estrategia de restauracion lo repara mejor. No se especifican en la model card ni el numero de tokens de entrenamiento ni la composicion del dataset, porque no hubo entrenamiento con datos nuevos.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad base de Llama-2-7b-chat, aunque degradada por la compresion, segun advierte el propio autor.
- Rechazo de peticiones daninas: medida con AdvBench (ASR 0,0019) y StrongREJECT (ASR 0,0160) usando el juez de HarmBench.
- Comportamiento conservador: el sobre-rechazo macro medido con WildGuard es de 0,6721, es decir, rechaza aproximadamente dos de cada tres peticiones benignas en ese conjunto de evaluacion.
- Modelado de lenguaje general: perplejidad de 11,6474 en WikiText-2, metrica de referencia para calibrar la degradacion introducida por la compresion.
- Soporte de tool calling / function calling: no documentado en la informacion disponible; no se declara plantilla de herramientas ni soporte estructurado.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado en la model card.
- Capacidades multilingues: no disponibles; el modelo base esta mayoritariamente orientado al ingles y la ficha no declara idiomas.
- Capacidad especial: modo de pensamiento (thinking mode), vision o audio: no disponible; es un modelo exclusivamente de texto.
- Uso previsto: servir como sujeto experimental en estudios de compresion y seguridad, no como asistente desplegable.

## Casos de uso

- Estudio de degradacion de seguridad por compresion: comparar las tasas de exito de ataque (AdvBench 0,0019, StrongREJECT 0,0160) de esta celda frente a las demas celdas de la rejilla y frente al Llama-2-7b-chat sin comprimir, para cuantificar cuanto dano introduce un recorte del 40 % de parametros.
- Evaluacion de reglas de seleccion de componentes SVD: al fijar el presupuesto de restauracion en 0,000 % y la regla en `unknown`, esta celda sirve como punto de control inferior para medir la ganancia de otras reglas con presupuestos mayores.
- Calibracion de jueces automaticos de seguridad: las metricas se obtuvieron con el juez de HarmBench y con WildGuard, de modo que el checkpoint puede emplearse para validar la sensibilidad de esos jueces ante modelos comprimidos con comportamientos de rechazo atipicos.
- Investigacion sobre sobre-rechazo: con un 0,6721 de sobre-rechazo macro, es un caso de estudio util para analizar como la compresion y la alineacion interactuan y producen modelos excesivamente conservadores.
- Analisis de la relacion perplejidad-seguridad: la perplejidad de 11,6474 en WikiText-2 permite correlacionar calidad de modelado de lenguaje con tasas de ataque en un mismo eje experimental.
- Reproducibilidad de experimentos: al estar fijada la semilla en 42 y documentarse el presupuesto y la regla, el checkpoint sirve para replicar resultados de estudios de compresion SVD en entornos academicos.
- Docencia y formacion tecnica: ilustrar en cursos de eficiencia de modelos como una intervencion de bajo rango afecta a propiedades funcionales (seguridad, rechazo) y no solo a la perplejidad.
- Ablacion de interpretabilidad: analizar el espectro de valores singulares de las matrices comprimidas y su correlacion con cambios de comportamiento observables.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR (juez de HarmBench) | 0,0019 |
| StrongREJECT | ASR (juez de HarmBench) | 0,0160 |
| WildGuard | Sobre-rechazo macro | 0,6721 |
| WikiText-2 | Perplejidad | 11,6474 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K, MT-Bench ni comparativas numericas directas contra el modelo base sin comprimir. El autor no incluye en la model card las cifras de referencia de Llama-2-7b-chat para estas mismas metricas, por lo que no es posible calcular la delta de degradacion a partir de los datos proporcionados.

## Requisitos de hardware

- VRAM estimada en fp16: alrededor de 13,5 GB solo para pesos (coincide con el tamano del repositorio de 13,5 GB), mas cache KV y activaciones. Con contexto completo de 4096 tokens, la cache KV en fp16 supone aproximadamente 2 GB adicionales (32 capas, 32 cabezas, dimension de cabeza 128, K y V), lo que situa el total en 16-18 GB.
- VRAM estimada en int8: en torno a 7 GB de pesos, mas cache KV (unos 1 GB a 4096 tokens), aproximadamente 8-9 GB.
- VRAM estimada en 4 bits: en torno a 3,5-4 GB de pesos, mas cache KV, aproximadamente 5-6 GB.
- GPU recomendadas: A100 40 GB u 80 GB, H100 80 GB y L40S para inferencia en fp16 con contexto completo. En consumer, RTX 4090 (24 GB) y RTX 3090 (24 GB) cubren fp16; RTX 4080/4070 Ti (16 GB) cubren fp16 con contexto reducido o int8; RTX 3060 12 GB y RTX 4060 Ti 16 GB son suficientes en 4 bits.
- Cabe en GPU de consumo: si, en fp16 con 24 GB de VRAM y contexto moderado; en 4 bits cabe en practicamente cualquier GPU con 8 GB o mas.
- Opciones de despliegue: transformers (formato nativo del repositorio), TGI (la ficha incluye la etiqueta `endpoints_compatible`) y vLLM sobre los safetensors, verificando previamente que las formas de los tensores comprimidos son compatibles con el cargador estandar. No hay pesos GGUF publicados en el repositorio, por lo que Ollama y llama.cpp requeririan una conversion propia. En CPU, la inferencia en fp16 necesitaria unos 16 GB de RAM.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada; al tratarse de un modelo denso de aproximadamente 6,7 B de parametros, el throughput esperado es el tipico de esa clase, pero no se aporta ninguna cifra verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks en esta informacion |
|---|---|---|---|---|---|
| svd-safety-l2...remove40 (este modelo) | 6,738 B declarados en safetensors; fraccion 0,5998 segun la model card | 4096 (heredado) | Llama 2 Community License | HuggingFace, 0 descargas, investigacion | AdvBench ASR 0,0019; StrongREJECT ASR 0,0160; WildGuard sobre-rechazo 0,6721; WikiText-2 ppl 11,6474 |
| meta-llama/Llama-2-7b-chat-hf | 6,738 B | 4096 | Llama 2 Community License | HuggingFace, ampliamente usado | no disponibles en esta informacion para estas metricas |
| mistralai/Mistral-7B-Instruct-v0.2 | 7,24 B | 32 768 | Apache 2.0 | HuggingFace | no disponibles en esta informacion |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8192 | Llama 3 Community License | HuggingFace | no disponibles en esta informacion |

La comparativa con alternativas de compresion (otros checkpoints SVD-LLM, SliceGPT, LLM-Pruner o Wanda) no esta disponible, porque la informacion proporcionada no incluye resultados de esas tecnicas en las mismas metricas de seguridad.

## Limitaciones y advertencias

- No es un modelo de proposito general: el propio autor indica explicitamente que es un artefacto de investigacion y que no debe desplegarse como asistente.
- Degradacion deliberada de seguridad: la model card advierte de que la compresion por si sola eleva la tasa de exito de ataque y que varias celdas de la rejilla estan degradadas intencionadamente. Aunque esta celda reporta ASR bajo, no debe interpretarse como un modelo seguro sin una evaluacion independiente.
- Sobre-rechazo elevado: 0,6721 de sobre-rechazo macro con WildGuard implica que el modelo rechaza una proporcion muy alta de peticiones benignas, lo que lo hace poco util en conversacion real.
- Riesgo de alucinacion: no se ha medido ni documentado en la informacion disponible; la compresion de bajo rango tiende a degradar la fidelidad factual, pero no hay datos que lo cuantifiquen aqui.
- Discrepancia de parametros: el recuento de safetensors (6.738.415.616) coincide con el del Llama-2-7b-chat denso, mientras que la model card declara una fraccion resultante de 0,5998. Es necesario verificar el repositorio antes de asumir un ahorro real de memoria.
- Regla de seleccion no documentada: la regla aparece como `unknown`, lo que limita la reproducibilidad exacta del metodo de seleccion de componentes.
- Idiomas: no se declara soporte multilingue; el comportamiento fuera del ingles no esta caracterizado.
- Restricciones de licencia: uso sujeto a la Llama 2 Community License, con las obligaciones de atribucion ("Built with Llama 2") y las restricciones de la politica de uso aceptable; no es una licencia permisiva tipo Apache 2.0.
- Caveat para produccion: con 0 descargas y 0 likes, la ausencia de validacion comunitaria y de pesos GGUF listos para servir anade coste de integracion y riesgo de comportamiento no caracterizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_jbbmix_k0p02_a1p0_free_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 (LICENSE.txt y USE_POLICY.md incluidos en el repositorio del modelo)
- Paper de SVD-LLM (referencia del metodo de compresion citado): no disponible en la informacion proporcionada
- Repositorios, demos o blogs adicionales del autor: no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio resultados relevantes para este modelo: los enlaces recuperados corresponden al cauce fluvial River Great Ouse (tideking.com, canalplan.uk, explore.opencanalmap.uk, mikegravel.org) y no guardan relacion con el modelo.
