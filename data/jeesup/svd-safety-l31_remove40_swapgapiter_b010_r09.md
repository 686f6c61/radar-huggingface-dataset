# Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r09

## Resumen

svd-safety-l31_remove40_swapgapiter_b010_r09 es un checkpoint derivado de meta-llama/Llama-3.1-8B-Instruct publicado por el usuario Jeesup en HuggingFace. No es un modelo de propósito general, sino un artefacto de investigación: el modelo base se comprimió con SVD-LLM hasta el 60,0% de los parámetros densos (eliminación del 40,02%) y después se editó mediante 9 de las 10 rondas de un procedimiento iterativo de intercambio de parámetros neutro en parámetros ("parameter-neutral swap"), seleccionado con la regla `gap_iter` y con un presupuesto de restauración del 1,000% de los parámetros densos.

El objetivo del autor es estudiar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. Este checkpoint es una celda concreta de una rejilla sobre reglas de selección y presupuestos, y representa una ronda intermedia (9 de 10) de una ejecución más larga, con semilla 42 y 9.955 componentes restaurados y sustituidos.

Su relevancia es metodológica más que práctica: cuantifica el compromiso entre seguridad y utilidad bajo compresión y aporta métricas medibles con jueces automáticos (AdvBench ASR 0,0050; StrongREJECT ASR 0,0300; sobre-rechazo macro WildGuard 0,8222). El repositorio no declara idiomas, no tiene descargas ni valoraciones, y la model card advierte explícitamente de que varias ramas de la rejilla están degradadas en seguridad de forma deliberada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama-3.1-8B-Instruct), con matrices de proyección comprimidas mediante SVD-LLM |
| Parametros totales | 8.030.261.248 (recuento real de los safetensors del repositorio); la model card declara una fracción de parámetros densos resultante de 0,5998 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens, heredada de meta-llama/Llama-3.1-8B-Instruct; no confirmada de forma independiente en este checkpoint |
| Tipos de cuantizacion | no disponible en la información proporcionada; el repositorio solo publica pesos safetensors (16,1 GB, compatible con bf16/fp16). Los tags indican compatibilidad con text-generation-inference y endpoints_compatible |
| Idiomas soportados | no disponible en la ficha del modelo (el modelo base declara inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Llama 3.1 Community License (incluye LICENSE y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-3.1-8B-Instruct: un transformer decoder-only con atención por consultas agrupadas (GQA), codificación posicional RoPE y 128.000 tokens de contexto, instruido por Meta mediante ajuste supervisado y optimización con preferencias según la documentación pública de la familia Llama 3.1. Sobre ese checkpoint, el autor aplica una compresión SVD-LLM que elimina el 40,02% de los parámetros densos, dejando la fracción resultante en 0,5998. No se documenta en la información disponible ningún reentrenamiento adicional, ni datos de entrenamiento propios, ni un número de tokens de ajuste: la intervención es de edición de pesos, no de entrenamiento.

La innovación técnica del artefacto es el procedimiento de reparación posterior: 9 rondas iterativas de sustitución de componentes con presupuesto de 1,000% de los parámetros densos, en fragmentos de 0,100% por ronda, seleccionados con la regla `gap_iter`. En total se restauran 9.955 componentes y se sustituyen 9.955, con 62.775.296 parámetros insertados (0,90% de los parámetros de proyección densos) y un valor de intercambio `insert` (solo valor de inserción, con desalojo ordenado por sigma). La semilla es 42 y el checkpoint corresponde a una ronda intermedia de una ejecución más larga.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el tag `conversational` está presente, aunque la model card no valida la calidad del diálogo tras la compresión.
- Capacidades heredadas del modelo base (no verificadas en este checkpoint): razonamiento, generación de código, matemáticas y uso de herramientas o function calling, propios de Llama-3.1-8B-Instruct.
- Capacidades multilingües: no declaradas en esta ficha; las del modelo base son ocho idiomas.
- Contexto largo: hereda la ventana de 128.000 tokens del modelo base, sin verificación publicada en esta celda.
- Comportamiento de seguridad medible: AdvBench ASR de 0,0050 y StrongREJECT ASR de 0,0300 con juez HarmBench, más sobre-rechazo macro de 0,8222 medido con WildGuard.
- Capacidad de análisis interpretativo: los índices de componentes restaurados y sustituidos, el valor singular asociado y la semilla 42 hacen el checkpoint auditable a nivel de peso.
- No dispone de visión, audio ni modo de razonamiento explícito declarado en la información proporcionada.

## Casos de uso

- Medición de la degradación de seguridad por compresión: ejecutar AdvBench y StrongREJECT con un juez HarmBench sobre este checkpoint y sobre el modelo base sin comprimir para aislar el efecto de la eliminación del 40,02% de parámetros, aprovechando que la celda ya publica ASR de 0,0050 y 0,0300 como referencia.
- Estudio del sobre-rechazo y de la utilidad residual: usar WildGuard para replicar el valor macro de 0,8222 y compararlo con el del modelo base, de modo que se pueda cuantificar cuánta utilidad conversacional se pierde al reparar seguridad mediante `gap_iter`.
- Reproducción de experimentos de compresión: la semilla 42, las 9 rondas de 10, el fragmento de 0,100% por ronda y los 9.955 componentes restaurados permiten reconstruir exactamente la ronda intermedia y comprobar la reproducibilidad del procedimiento.
- Comparación de reglas de selección de componentes: al ser una celda de una rejilla sobre reglas y presupuestos, sirve como punto de control para contrastar `gap_iter` frente a otras reglas con el mismo presupuesto de restauración del 1,000%.
- Análisis espectral de pesos comprimidos: los 62.775.296 parámetros insertados pueden localizarse por índice y compararse con los valores singulares desalojados, lo que permite estudiar qué subespacios de la aproximación SVD concentran el comportamiento de rechazo.
- Auditoría de checkpoints comprimidos en pipelines de seguridad: integrar el modelo en un banco de pruebas de evaluación de modelos derivados (por ejemplo, TGI o vLLM detrás de un arnés de evaluación) para detectar si la compresión introduce regresiones de seguridad antes de aprobar cualquier derivado.
- Línea base negativa en investigación de interpretabilidad: usar el checkpoint como sujeto experimental para localizar componentes asociados al rechazo y comprobar si la sustitución de un 0,90% de los parámetros de proyección basta para restaurar el comportamiento.
- Docencia y divulgación técnica: ilustrar con un caso real el compromiso entre compresión, seguridad y utilidad, dado que las métricas están publicadas y el procedimiento está descrito con precisión.
- No se recomienda su uso como asistente desplegado en producción, atención al cliente, generación de código en CI/CD ni ningún escenario que requiera fiabilidad y alineación garantizadas.

## Benchmarks y rendimiento

| Métrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR | 0,0050 | HarmBench judge |
| StrongREJECT ASR | 0,0300 | HarmBench judge |
| Sobre-rechazo macro | 0,8222 | WildGuard |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras pruebas de capacidad general para este checkpoint. Tampoco se proporcionan los valores correspondientes del modelo base sin comprimir, por lo que no es posible calcular la variación atribuible a la compresión con los datos ofrecidos.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 16 GB solo para pesos (el repositorio ocupa 16,1 GB), más caché KV.
- Caché KV estimada: aproximadamente 128 KB por token en bf16 con la configuración de Llama-3.1-8B (8 cabezas KV, dimensión de cabeza 128, 32 capas); 8.192 tokens suponen cerca de 1 GB y 128.000 tokens, cerca de 16 GB. Es una estimación derivada de la configuración del modelo base y no una medición publicada de esta celda.
- Cuantización de 8 bits: alrededor de 8,5 GB de pesos; cuantización de 4 bits: alrededor de 4,5 GB de pesos, más caché KV.
- GPU recomendadas: A100 (40 GB u 80 GB) y H100 para bf16 con contexto largo; una RTX 4090 o RTX 3090 de 24 GB permite bf16 con contexto moderado; tarjetas de 12 GB como la RTX 3060 o la RTX 4070 requieren cuantización de 4 bits.
- Cabe en GPU de consumo: sí, con matices. En 24 GB es viable en bf16 con gestión cuidadosa del contexto; en 8-12 GB exige cuantización de carga.
- Opciones de despliegue: transformers como librería principal; los tags del repositorio declaran text-generation-inference y endpoints_compatible, por lo que TGI es una vía soportada. vLLM es una alternativa razonable para servir safetensors. No se publican pesos GGUF, de modo que llama.cpp u Ollama requerirían una conversión y una cuantización propias.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | AdvBench ASR | StrongREJECT ASR | Sobre-rechazo macro | Disponibilidad |
|---|---|---|---|---|---|---|---|
| svd-safety-l31_remove40_swapgapiter_b010_r09 | 8.030.261.248 según safetensors; fracción densa declarada 0,5998 | heredado de 128.000 tokens, no confirmado | Llama 3.1 Community License | 0,0050 | 0,0300 | 0,8222 | 0 descargas, 0 likes |
| meta-llama/Llama-3.1-8B-Instruct | 8.030.261.248 | 128.000 tokens | Llama 3.1 Community License | no disponible en esta información | no disponible en esta información | no disponible en esta información | modelo base público |
| Otras celdas de la rejilla del mismo estudio (reglas y presupuestos alternativos) | no disponible | no disponible | Llama 3.1 Community License (presumiblemente) | no disponible | no disponible | no disponible | no disponibles en la información proporcionada |
| Otros modelos comprimidos de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación significativa es contra el modelo base sin comprimir. La model card no publica los valores de referencia de Llama-3.1-8B-Instruct para las tres métricas, por lo que la magnitud real del daño y de la reparación no puede calcularse a partir de la información disponible.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que es una celda de una rejilla y no un modelo conversacional de propósito general; varias ramas del estudio están degradadas en seguridad de forma deliberada.
- No hay validación comunitaria: cero descargas y cero valoraciones, sin evidencia externa de comportamiento en uso real.
- Discrepancia en el recuento de parámetros: los safetensors suman 8.030.261.248 parámetros (el mismo valor que el modelo base sin comprimir), mientras la model card declara una fracción densa resultante de 0,5998 tras eliminar el 40,02%. Conviene auditar el checkpoint antes de asumir cualquier cifra de tamaño efectivo.
- Riesgo de utilidad degradada: el sobre-rechazo macro de 0,8222 con WildGuard apunta a una tasa elevada de rechazo de peticiones, un indicador de pérdida de utilidad; la model card no define la métrica con detalle, por lo que debe interpretarse con cautela.
- Riesgo de alucinación no evaluado: no se publican métricas de veracidad ni de fidelidad factual para este checkpoint.
- Sesgos: no se documenta ningún análisis de sesgo, ni de sesgo heredado del modelo base ni de sesgos introducidos por la compresión.
- Cobertura de idiomas no declarada en esta ficha, y capacidades multilingües no verificadas tras la edición de pesos.
- Estado intermedio: corresponde a 9 de 10 rondas de una ejecución más larga (presupuesto total declarado del 1,0%, frente al 0,90% de parámetros insertados en esta instantánea), por lo que no representa el resultado final del procedimiento.
- Seguridad no garantizada: aunque el ASR medido es bajo (0,0050 y 0,0300), la advertencia del autor sobre brazos degradados implica que los resultados de una celda no son extrapolables al resto del estudio.
- Restricciones de licencia: Llama 3.1 Community License, con obligaciones de atribución ("Built with Llama"), requisitos de nomenclatura y cláusulas específicas para despliegues a gran escala; es imprescindible revisar USE_POLICY.md antes de cualquier uso comercial.
- No apto para producción: cualquier despliegue orientado a usuarios finales exige una evaluación propia de seguridad y utilidad previa.
- Trazabilidad limitada: no se enlazan el paper de SVD-LLM, el código del procedimiento de intercambio ni los scripts de evaluación en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r09
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia del repositorio: https://huggingface.co/Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r09/blob/main/LICENSE
- Política de uso del repositorio: https://huggingface.co/Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r09/blob/main/USE_POLICY.md
- Licencia comunitaria de Llama 3.1 (Meta): https://llama.meta.com/llama3_1/
- La búsqueda web realizada no devolvió enlaces relevantes para este modelo: los resultados obtenidos eran páginas de ayuda de Gmail sin relación con el artefacto. No se dispone, por tanto, de papers, blogs, repositorios de código ni demos adicionales en la información proporcionada.
