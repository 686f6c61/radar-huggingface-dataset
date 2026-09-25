# jlsrls/mainsweep4ep-kl100000-s0-realign

## Resumen

`jlsrls/mainsweep4ep-kl100000-s0-realign` es un ajuste fino supervisado (SFT) del modelo `unsloth/Llama-3.2-1B-Instruct`, publicado por el usuario `jlsrls` en HuggingFace. Se trata, por tanto, de un modelo decoder-only de tipo transformer denso con aproximadamente 1.240 millones de parametros y 131.072 tokens de contexto heredados de la familia Llama 3.2. El repositorio ocupa 1,7 GB y contiene pesos en formato safetensors, con la libreria `transformers` como interfaz de carga.

La relevancia de esta publicacion no reside en una innovacion arquitectonica, sino en su caracter de artefacto de investigacion: el nombre del modelo (`mainsweep4ep-kl100000-s0-realign`) sugiere un barrido experimental de metodos de alineamiento con 4 epocas, una penalizacion KL de 100.000, semilla 0 y una fase final de "realineamiento". La model card, sin embargo, solo documenta entrenamiento SFT con TRL 0.24.0 y no describe el dataset, los hiperparametros ni el procedimiento de alineamiento, por lo que la interpretacion del nombre es una inferencia y no un dato confirmado.

El modelo cuenta con 0 descargas y 0 likes en el momento de redactar esta ficha, fue creado el 25 de septiembre de 2026 y no declara licencia efectiva (el campo YAML `licence: license` es un marcador de posicion, no una licencia). Es un modelo de nicho, adecuado para reproducir experimentos de alineamiento sobre una base pequena y barata de entrenar, no para despliegue en produccion sin una evaluacion previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.2: RoPE, GQA, RMSNorm, SwiGLU, embeddings atados) |
| Parametros totales | Aproximadamente 1.240 millones (heredados del modelo base Llama-3.2-1B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens segun la configuracion del modelo base; no verificado en esta publicacion |
| Tipos de cuantizacion | No disponible para este repositorio (solo contiene pesos safetensors). El modelo base ofrece variantes 4-bit y GGUF de Unsloth |
| Idiomas soportados | No disponible. El modelo base declara 8 idiomas oficiales (ingles, aleman, frances, italiano, portugues, hindi, espanol y thai) |
| Licencia | No disponible. El campo `licence: license` de la model card no constituye una licencia real |
| Formato de pesos | safetensors (tamano del repositorio: 1,7 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `unsloth/Llama-3.2-1B-Instruct`, un transformer decoder-only denso con normalizacion RMSNorm pre-norma, activacion SwiGLU, embeddings de entrada y salida atados y atencion con consultas agrupadas (GQA). En la configuracion de Llama 3.2 1B esto se traduce en 16 capas, 2.048 dimensiones ocultas, 32 cabezas de consulta y 8 cabezas de clave/valor con dimension de cabeza 64, un vocabulario de 128.256 tokens y RoPE con theta de 500.000, lo que habilita la ventana de 131.072 tokens. No hay innovaciones arquitectonicas propias de esta publicacion: el ajuste no modifica la topologia.

El entrenamiento se realizo con SFT mediante la libreria TRL (version 0.24.0), segun la model card, con el stack Transformers 5.5.0, PyTorch 2.11.0, Datasets 4.3.0 y Tokenizers 0.22.2, y con la etiqueta `unsloth`, lo que indica el uso de Unsloth para el ajuste eficiente en memoria. Existe un run publico de Weights & Biases asociado. No se especifican el dataset de entrenamiento, el numero de tokens vistos, la composicion de los datos, ni si hubo fases de RLHF o DPO; tampoco se detallan hiperparametros como tasa de aprendizaje, tamano de lote o precision. La unica pista sobre el procedimiento esta en el nombre del modelo, que apunta a un barrido con penalizacion KL, pero no hay documentacion que lo confirme.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Instruct, con soporte de plantilla de chat (`apply_chat_template`) y de la pipeline de generacion de texto de Transformers.
- Razonamiento basico y respuesta a preguntas de conocimiento general, limitado por el tamano del modelo (1B) y por el posible olvido catastrofico derivado del ajuste.
- Generacion de codigo y resolucion de problemas matematicos sencillos, de nuevo limitada por la escala de 1B parametros.
- Capacidad multilingue potencial heredada del modelo base (8 idiomas declarados), aunque no validada en esta publicacion.
- Soporte de tool calling y function calling: no confirmado en la documentacion disponible; el modelo base Llama 3.2 Instruct si declara soporte de llamadas a herramientas, pero no hay evidencia de que se haya preservado tras este ajuste.
- Soporte de agentes y razonamiento multi-paso: no confirmado ni documentado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. Llama 3.2 1B es un modelo exclusivamente de texto.

## Casos de uso

- Reproduccion de experimentos de alineamiento: el modelo sirve como punto de comparacion en estudios sobre penalizacion KL, barridos de hiperparametros y realineamiento, dado su bajo coste de entrenamiento e inferencia y la existencia de un run de W&B publico.
- Investigacion academica sobre olvido catastrofico: permite medir cuanto se degrada el rendimiento Instruct original tras un SFT agresivo de 4 epocas sobre un modelo de 1B, comparandolo con el checkpoint base.
- Prototipado rapido de asistentes conversacionales en local: el modelo cabe en cualquier GPU de consumo e incluso en CPU con cuantizacion, lo que permite iterar sobre prompts y plantillas de chat sin coste de API.
- Clasificacion y etiquetado de texto por lotes: al ser un modelo pequeno, se puede desplegar en vLLM y procesar grandes volumenes de documentos con generacion restringida a etiquetas cortas.
- Generacion de texto creativo y lluvia de ideas en entornos sin conexion: util para demostraciones o talleres donde no se puede enviar datos a servicios externos.
- Educacion y ensenanza de tecnicas de ajuste fino: es un candidato didactico para ilustrar el flujo Unsloth + TRL + safetensors y el publicacion de artefactos en HuggingFace.
- Extraccion de informacion estructurada en pipelines ligeros: siempre que se validen previamente las tasas de error, puede emplearse para resumir o reformatear documentos cortos con latencia muy baja.

No se recomienda su uso en atencion al cliente en produccion, generacion de codigo critico ni tareas de razonamiento complejo sin una evaluacion exhaustiva: no hay benchmarks publicados y el ajuste puede haber degradado las capacidades originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, IFEval ni ninguna otra metrica, y los resultados de busqueda web consultados no contienen ningun dato tecnico relacionado con este modelo.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: aproximadamente 2,5 GB solo para los pesos, mas overhead de activaciones y cache KV. Presupuesto realista: 4 GB para contextos cortos.
- VRAM con cuantizacion 8-bit: alrededor de 1,3 GB de pesos. Con cuantizacion 4-bit: alrededor de 0,8-0,9 GB de pesos. Estas cuantizaciones hay que generarlas a partir de los safetensors originales, ya que el repositorio no las incluye.
- Cache KV: dado el uso de GQA (16 capas, 8 cabezas KV, dimension de cabeza 64, fp16), el coste es de aproximadamente 32 KiB por token. Esto supone unos 256 MiB para 8.192 tokens y unos 4 GiB para los 131.072 tokens de contexto completo, un limite practico mucho mas restrictivo que el tamano del propio modelo.
- GPU recomendadas: cualquier GPU con 6-8 GB o mas para fp16 en contextos moderados (RTX 3060, RTX 4060, RTX 2070). Para exprimir la ventana de 128K conviene una GPU de 24 GB o superior (RTX 3090, RTX 4090, L40S, A100, H100) o bien tensor parallelism.
- Cabe en GPU de consumo: si. Con cuantizacion 4-bit funciona en GPUs de 4-6 GB e incluso en CPU mediante llama.cpp, aunque con latencias altas.
- Opciones de despliegue: `transformers` con `pipeline` (metodo documentado por el autor), vLLM o SGLang para servicio con alto throughput, TGI para despliegue gestionado, y llama.cpp/Ollama previa conversion a GGUF (no hay GGUF publicado en este repositorio). El tag `endpoints_compatible` indica compatibilidad con los Inference Endpoints de HuggingFace.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus respectivas model cards oficiales; el rendimiento de este ajuste concreto no se puede comparar porque no hay benchmarks publicados.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| jlsrls/mainsweep4ep-kl100000-s0-realign | ~1,24 B | 131.072 tokens (heredado, sin verificar) | No disponible | Repositorio HF, 0 descargas | Ajuste SFT experimental sin benchmarks ni dataset documentado |
| unsloth/Llama-3.2-1B-Instruct (base) | ~1,24 B | 131.072 tokens | Llama 3.2 Community License | Ampliamente distribuido, con variantes 4-bit y GGUF | Modelo de referencia; su rendimiento no se traslada necesariamente a este ajuste |
| Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | Muy distribuido, con GGUF y cuantizaciones | Licencia permisiva y mejor soporte multilingue declarado; tamano ligeramente superior |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8.192 tokens | Apache 2.0 | Muy distribuido, con GGUF | Contexto mucho menor; orientado a movil y edge |
| Gemma 2 2B Instruct | ~2,6 B | 8.192 tokens | Terminos de uso de Gemma | Ampliamente distribuido | Mayor numero de parametros y mejor calidad esperada, con licencia no permisiva y contexto corto |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni analisis de regresiones respecto al modelo base. No se puede afirmar que este ajuste sea mejor que `Llama-3.2-1B-Instruct` en ninguna tarea.
- Sesgos conocidos: no documentados especificamente, pero hereda los sesgos de Llama 3.2, entrenado mayoritariamente con datos en ingles y con sesgos de genero, raza, religion y origen nacional ampliamente reportados en la familia.
- Riesgo de alucinacion: alto. Los modelos de 1B parametros generan con frecuencia afirmaciones plausibles pero falsas, y un ajuste fino SFT puede incrementar este comportamiento si el dataset de entrenamiento contenia respuestas con formato seguro pero contenido no verificado.
- Olvido catastrofico: un SFT de 4 epocas sobre un modelo de 1B puede degradar capacidades del modelo Instruct original (seguimiento de instrucciones, formato de chat, rechazo de peticiones nocivas). No hay evaluacion que cuantifique esta perdida.
- Limitaciones de contexto: el contexto de 131.072 tokens es teorico; el coste de cache KV (unos 4 GiB a maxima longitud) y la degradacion de la atencion a larga distancia hacen poco practico su uso completo.
- Limitaciones de idioma: la model card no declara idiomas y no hay evidencia de que el castellano se haya preservado tras el ajuste.
- Restricciones de licencia: el repositorio no declara licencia utilizable. Al derivar de Llama 3.2, el modelo queda sujeto a la Llama 3.2 Community License, que exige incluir el aviso "Built with Llama", mantener la denominacion de derivado de Llama y conserva la clausula de licencia adicional para productos con mas de 700 millones de usuarios mensuales. El uso comercial sin aclarar la licencia es juridicamente arriesgado.
- Caveat de produccion: con 0 descargas y 0 likes, el modelo no ha sido auditado por terceros. No hay garantia de integridad del repositorio, ni model card completa, ni versionado de datasets. No deberia desplegarse en sistemas que interactuen con usuarios finales sin una bateria de evaluaciones propia.
- Resultados de busqueda web: las consultas realizadas no devolvieron ninguna fuente tecnica relevante sobre este modelo (los resultados obtenidos eran contenido no relacionado), por lo que no existe corroboracion externa de ningun dato de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jlsrls/mainsweep4ep-kl100000-s0-realign
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases: https://wandb.ai/rezvani-portland-state-university/clarifying-em/runs/km6fhnem
- Paper de referencia de TRL (cita incluida en la model card): von Werra et al., "TRL: Transformer Reinforcement Learning", 2020
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en los resultados de busqueda web disponibles.
