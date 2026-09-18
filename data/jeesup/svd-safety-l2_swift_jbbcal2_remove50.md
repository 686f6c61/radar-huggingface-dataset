# Jeesup/svd-safety-l2_swift_jbbcal2_remove50

## Resumen

svd-safety-l2_swift_jbbcal2_remove50 es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace. Se trata de una derivación de meta-llama/Llama-2-7b-chat-hf comprimida con SVD-LLM hasta el 50,00% de los parámetros densos, seguida de un presupuesto de restauración de componentes SVD del 0,000%, seleccionados mediante la regla denominada `unknown`. El repositorio almacena 6.738.415.616 parámetros en safetensors y ocupa 13,5 GB.

El propósito declarado del autor es estudiar cómo la compresión SVD daña el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. Este checkpoint es una celda concreta de una rejilla experimental que cruza reglas de selección y presupuestos de restauración, y el propio autor advierte de que no es un modelo de chat de propósito general.

Hereda la arquitectura transformer decoder de Llama-2-7b-chat, con 4.096 tokens de contexto y licencia Llama 2 Community License. Su relevancia es acotada y estrictamente investigadora: sirve como sujeto experimental para medir el intercambio entre seguridad y utilidad bajo compresión, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (derivada de Llama-2-7b-chat); pesos comprimidos con SVD-LLM mediante descomposición en valores singulares |
| Parametros totales | 6.738.415.616 según safetensors; la model card declara una fracción de parámetros resultante de 0,4999 (discrepancia no explicada en la información disponible) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (heredada de Llama-2-7b-chat; no se documenta modificación) |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors sin cuantizar; no se publican GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (librería transformers) |
| Compresion aplicada | SVD-LLM, 50,00% de parámetros eliminados |
| Regla de seleccion de componentes | `unknown` |
| Presupuesto de restauracion | 0,000% de los parámetros densos |
| Componentes restaurados / sustituidos | 0 / 0 |
| Fraccion de parametros resultante | 0,4999 |
| Semilla | 42 |
| Tamano del repositorio | 13,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La base sin comprimir es Llama-2-7b-chat, un transformer decoder de aproximadamente 7.000 millones de parámetros entrenado por Meta con normalización RMSNorm, activación SwiGLU y codificación posicional rotatoria (RoPE), ajustado con aprendizaje por refuerzo a partir de retroalimentación humana (RLHF) y optimizado para diálogo. Sobre ese checkpoint se aplica SVD-LLM, una técnica de compresión post-entrenamiento que descompone las matrices de pesos en factores de bajo rango y elimina el 50,00% de los parámetros. No se documenta ningún entrenamiento ni ajuste fino posterior a la compresión.

En esta celda concreta, la regla de selección de componentes es `unknown` y el presupuesto de restauración es 0,000%, de modo que no se reincorpora ningún componente SVD de los eliminados: el modelo es, en la práctica, un checkpoint comprimido sin reparación. La semilla empleada es 42. Los identificadores `swift` y `jbbcal2` que aparecen en el nombre del modelo no se explican en la información disponible, por lo que no se les atribuye ningún significado técnico.

## Capacidades

- Generación de texto conversacional: conserva la interfaz de chat de Llama-2-7b-chat, aunque degradada por la compresión al 50% de los parámetros.
- Razonamiento, código y matemáticas: no se publican evaluaciones específicas para estas tareas en la información disponible.
- Tool calling / function calling: no documentado; Llama-2-7b-chat no incorpora soporte nativo de llamadas a herramientas.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no declaradas en la model card; Llama-2 se entrenó mayoritariamente en inglés, pero no se especifica el comportamiento de este derivado.
- Modos especiales (thinking mode, visión, audio): no disponibles.
- Capacidad documentada y medida: servir como sujeto experimental para cuantificar la tasa de éxito de ataques (AdvBench y StrongREJECT con juez HarmBench) y el exceso de rechazos (over-refusal macro con WildGuard).

## Casos de uso

- Reproducibilidad de compresión SVD-LLM: descargar el checkpoint y verificar con semilla 42 que la fracción de parámetros resultante (0,4999) y las métricas publicadas (perplejidad WikiText-2 de 14,4106) se reproducen en el mismo entorno.
- Ablación de reglas de selección de componentes: esta celda, con regla `unknown` y presupuesto 0,000%, sirve como punto de referencia de "sin reparación" frente a otras celdas de la rejilla que restauran componentes.
- Evaluación de seguridad bajo compresión: emplear el modelo como muestra en baterías de red-teaming con AdvBench y StrongREJECT y comparar la tasa de éxito de ataque (0,0462 y 0,0831 respectivamente) con la del modelo base sin comprimir.
- Calibración de jueces automáticos: dado que las métricas se obtuvieron con el juez HarmBench, el checkpoint permite probar la sensibilidad de ese juez ante salidas degradadas por compresión.
- Estudio del exceso de rechazos: el valor de 0,5383 en over-refusal macro (WildGuard) lo convierte en un caso útil para analizar falsos rechazos en prompts benignos y diseñar mitigaciones.
- Investigación en interpretabilidad: los factores de bajo rango resultantes de la SVD permiten inspeccionar qué subespacios de pesos se eliminaron y correlacionarlos con cambios de comportamiento.
- Línea base en canales de evaluación internos: usar el checkpoint como control negativo en pipelines de evaluación de seguridad, dado que el autor lo describe como deliberadamente degradado en varias celdas de la rejilla.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Direccion deseable |
|---|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0462 | menor es mejor |
| StrongREJECT | ASR (juez HarmBench) | 0,0831 | menor es mejor |
| WildGuard | Over-refusal macro | 0,5383 | menor es mejor |
| WikiText-2 | Perplejidad | 14,4106 | menor es mejor |

No se han publicado en la información disponible los valores equivalentes del modelo base meta-llama/Llama-2-7b-chat-hf, por lo que no puede cuantificarse la magnitud exacta del deterioro introducido por la compresión.

## Requisitos de hardware

- Pesos en safetensors: 13,5 GB de repositorio, coherente con almacenamiento en fp16/bf16 para un modelo de 6,74 mil millones de parámetros.
- Inferencia en fp16/bf16: requiere al menos 16 GB de VRAM solo para pesos, más caché KV y activaciones; en la práctica, 24 GB o más para contextos largos y lotes superiores a 1.
- Cuantización a 8 bits: aproximadamente 7 GB de pesos, viable en GPUs de 12 GB como RTX 3060 o RTX 4070.
- Cuantización a 4 bits: aproximadamente 4 GB de pesos, viable en GPUs de 8 GB, aunque no se publican archivos cuantizados en el repositorio.
- GPU recomendadas: A100 (40/80 GB) y H100 para servicio concurrente; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090 (24 GB) como alternativa consumer.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 en bf16, y en GPUs de 8-12 GB si se cuantiza manualmente.
- Opciones de despliegue: transformers, text-generation-inference (el repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`) y vLLM. llama.cpp u Ollama requerirían una conversión a GGUF que no se publica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks de seguridad | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_swift_jbbcal2_remove50 | 6,74B almacenados; fracción declarada 0,4999 | 4.096 | Llama 2 Community | AdvBench ASR 0,0462; StrongREJECT ASR 0,0831; over-refusal 0,5383 | HuggingFace, 0 descargas |
| meta-llama/Llama-2-7b-chat-hf | 6,74B | 4.096 | Llama 2 Community | no disponible en la información proporcionada | HuggingFace |
| Llama-3.1-8B-Instruct | 8,03B | 128.000 | Llama 3.1 Community | no disponible en la información proporcionada | HuggingFace |
| Mistral-7B-Instruct-v0.2 | 7,24B | 32.768 | Apache 2.0 | no disponible en la información proporcionada | HuggingFace |

Las especificaciones de los modelos alternativos corresponden a datos públicos de sus respectivas fichas y no han sido verificadas en la información proporcionada. No se han identificado en la búsqueda otros checkpoints de la misma rejilla experimental ni artefactos comparables de compresión orientados a seguridad.

## Limitaciones y advertencias

- El autor advierte explícitamente de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat y de que este checkpoint no debe tratarse como un asistente desplegable.
- Tasa de éxito de ataque de 0,0462 en AdvBench y 0,0831 en StrongREJECT con juez HarmBench; sin la referencia del modelo base no puede afirmarse la magnitud del deterioro, pero cualquier valor superior a cero implica vulnerabilidad ante prompts adversariales.
- Over-refusal macro de 0,5383 medido con WildGuard: más de la mitad de los prompts benignos evaluados fueron rechazados, lo que lo hace inadecuado para uso conversacional real.
- Perplejidad de 14,4106 en WikiText-2, indicativa de una degradación apreciable del modelado de lenguaje respecto al checkpoint original.
- La regla de selección `unknown` y un presupuesto de restauración de 0,000% implican que no existe ningún mecanismo de reparación de los componentes eliminados.
- Discrepancia sin explicar entre el recuento real de parámetros (6.738.415.616) y la fracción declarada (0,4999); el recuento almacenado coincide con el del modelo denso sin comprimir.
- Licencia Llama 2 Community License: el uso comercial está sujeto a condiciones (límite de 700 millones de usuarios activos mensuales, cumplimiento de la política de uso aceptable, inclusión del aviso "Built with Llama" y denominación de los derivados con el prefijo "Llama"), además de restricciones de uso en determinados sectores.
- Idiomas soportados no declarados; el comportamiento multilingüe es incierto y probablemente limitado al inglés.
- Ventana de contexto de 4.096 tokens, insuficiente para casos de uso con documentos largos o conversaciones extensas.
- Sin soporte documentado de tool calling ni de flujos de agente.
- Riesgo de alucinación inherente a los modelos de la familia Llama 2, agravado por la pérdida de parámetros.
- Repositorio con 0 descargas y 0 likes: no existe validación independiente de las métricas publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_swift_jbbcal2_remove50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Ficheros de licencia y política de uso incluidos en el repositorio: LICENSE.txt y USE_POLICY.md
- La búsqueda web realizada no devolvió enlaces relevantes (únicamente resultados genéricos de YouTube), por lo que no se dispone de paper, blog técnico ni repositorio de código asociados a este checkpoint.
