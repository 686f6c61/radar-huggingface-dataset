# Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r09

## Resumen

svd-safety-l31_remove30_swapgapiter_b010_r09 es un checkpoint de investigación publicado por el usuario Jeesup a partir de meta-llama/Llama-3.1-8B-Instruct. El modelo parte de una compresión estructural con SVD-LLM que elimina el 30,01% de los parámetros densos (fracción resultante declarada de 0,6999) y a continuación aplica 9 de las 10 rondas de un procedimiento de edición iterativa denominado "swap neutro en parámetros", seleccionado por la regla `gap_iter`, con un presupuesto de restauración del 1,000% de los parámetros densos y 62.773.248 parámetros intercambiados (el 0,90% de los parámetros de proyección).

El propósito declarado no es conversacional: es medir cuánto daña la compresión SVD al comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes lo repara mejor. Se trata de una celda de una rejilla experimental sobre reglas de selección y presupuestos, con semilla 42, y el propio autor advierte que no debe tratarse como un asistente desplegable.

Su interés es metodológico: publica métricas de tasa de éxito de ataque (AdvBench 0,0050 y StrongREJECT 0,0400 con juez HarmBench) y de sobrerrechazo macro (0,3273 con WildGuard), lo que permite estudiar el compromiso seguridad-utilidad en modelos comprimidos de 8B. El repositorio ocupa 16,1 GB, declara 8.030.261.248 parámetros en safetensors y se distribuye bajo licencia Llama 3.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3.1 (GQA, RoPE, RMSNorm, SwiGLU); configuración heredada del modelo base |
| Parametros totales | 8.030.261.248 (~8,03 B) según safetensors; la tarjeta declara una fracción de parámetros densos resultante de 0,6999 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens heredados del modelo base; no verificado en este checkpoint |
| Tipos de cuantizacion | no publicados por el autor; el checkpoint se distribuye en precisión completa (fp16/bf16) y es cuantizable con herramientas estándar |
| Idiomas soportados | no disponible en la model card; el modelo base Llama 3.1 se entrena oficialmente en inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Tecnica de compresion | SVD-LLM, 30,01% de parámetros densos eliminados |
| Edicion posterior | 9 de 10 rondas de swap iterativo neutro en parámetros, regla `gap_iter`, 0,1% de parámetros densos por ronda, presupuesto total 1,0% |
| Componentes restaurados / sustituidos | 9298 / 9298 |
| Parametros intercambiados | 62.773.248 (0,90% de los parámetros de proyección densos) |
| Valor de swap | `insert` (solo valor de inserción; desalojo ordenado por sigma) |
| Semilla | 42 |
| Tamano del repositorio | 16,1 GB |
| Pipeline / libreria | text-generation / transformers; etiquetado como compatible con text-generation-inference y endpoints |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La base es Llama-3.1-8B-Instruct, un transformer decoder-only de 8.030 millones de parámetros con 32 capas, atención por consultas agrupadas (GQA) y RoPE, entrenado por Meta sobre del orden de 15 billones de tokens y post-entrenado con ajuste supervisado y optimización a partir de preferencias. Este checkpoint no añade entrenamiento nuevo: parte de esos pesos y los modifica por vías puramente estructurales y de edición de parámetros, sin pasar por gradient descent. La tarjeta no documenta ninguna fase adicional de SFT, RLHF o DPO sobre el resultado comprimido.

El pipeline tiene dos etapas. Primero se aplica SVD-LLM, una descomposición en valores singulares truncada que reduce el rango de las matrices de proyección y elimina el 30,01% de los parámetros densos. Después se ejecuta un "swap neutro en parámetros": en cada ronda se sustituyen tantos componentes como se restauran, de modo que el recuento de parámetros no cambia; la selección de qué componentes entran se decide con la regla `gap_iter`, con un tamaño de bloque del 0,1% de los parámetros densos por ronda y un presupuesto de restauración del 1,000% (62.773.248 parámetros insertados, 9.298 componentes restaurados y otros tantos desalojados, con desalojo ordenado por valor singular). El checkpoint liberado corresponde a la ronda 9 de 10, es decir, a un estado intermedio de una ejecución más larga.

Existe una discrepancia que conviene señalar: el recuento de parámetros de los safetensors (8.030.261.248) coincide con el del modelo denso sin comprimir, mientras que la tarjeta declara una fracción resultante de 0,6999. La información disponible no aclara si el checkpoint conserva las formas tensoriales originales con rangos reducidos o filas anuladas en lugar de una arquitectura físicamente más pequeña. Tampoco se documenta el número de tokens, la composición del dataset ni innovaciones de decodificación (no hay decodificación especulativa ni atención lineal declaradas).

## Capacidades

- Generación de texto e instrucciones: heredadas del modelo base, sin verificación publicada tras la compresión.
- Razonamiento y matemáticas: capacidad procedente del modelo base, presumiblemente degradada por la reducción de rango; no se publican métricas de MMLU, GSM8K ni similares.
- Generación de código: heredada del modelo base; sin HumanEval ni MBPP publicados.
- Tool calling / function calling: el modelo base soporta llamadas a herramientas, pero no hay verificación en este checkpoint.
- Agentes y razonamiento multi-paso: no disponible; no se ha evaluado.
- Capacidades multilingües: las del modelo base (ocho idiomas oficiales), no verificadas aquí.
- Capacidad específica del artefacto: medición cuantitativa de tasa de éxito de ataque y de sobrerrechazo, orientada a interpretabilidad y seguridad.
- Etiquetas de despliegue: `conversational`, `text-generation-inference` y `endpoints_compatible`, lo que indica compatibilidad formal con el ecosistema de transformers y TGI.
- Sin visión, audio ni modalidades adicionales: el modelo base es exclusivamente de texto.

## Casos de uso

- Auditoría del impacto de la compresión sobre la seguridad: comparar el ASR de este checkpoint (AdvBench 0,0050; StrongREJECT 0,0400) con el del Llama 3.1 8B Instruct sin comprimir para cuantificar cuánta alineación destruye la eliminación del 30,01% de parámetros.
- Estudio comparativo de reglas de selección de componentes: esta celda usa `gap_iter`; confrontarla con las otras celdas de la rejilla del mismo autor permite determinar qué heurística repara mejor el comportamiento de rechazo con un presupuesto fijo del 1,0%.
- Análisis del compromiso seguridad-utilidad: cruzar el ASR bajo con el sobrerrechazo macro de 0,3273 medido con WildGuard para estimar el coste en utilidad de cada punto de operación.
- Reproducibilidad experimental: la semilla (42), el presupuesto por ronda (0,1%), el número de componentes (9298) y el recuento de parámetros intercambiados están documentados, lo que permite replicar la rejilla y verificar la varianza entre ejecuciones.
- Interpretabilidad de pesos: los 62,7 millones de parámetros insertados y los 9.298 componentes restaurados son un conjunto acotado y trazable sobre el que estudiar qué subespacios concretos sostienen el comportamiento de rechazo.
- Sujeto de prueba en arneses de red teaming automatizado: integrarlo como caso experimental en pipelines que ejecutan AdvBench o StrongREJECT con un juez tipo HarmBench, aprovechando su compatibilidad con text-generation-inference.
- Línea base negativa en investigaciones de compresión: sirve como referencia de un modelo comprimido con seguridad parcialmente restaurada frente a variantes comprimidas sin edición posterior.
- No se recomienda su uso como asistente conversacional, atención al cliente ni generación de código en producción: el autor lo describe explícitamente como artefacto de investigación.

## Benchmarks y rendimiento

| Benchmark / metrica | Resultado | Juez / metodo |
|---|---|---|
| AdvBench ASR | 0,0050 | juez HarmBench |
| StrongREJECT ASR | 0,0400 | juez HarmBench |
| Sobrerrechazo macro | 0,3273 | WildGuard |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la información disponible, ni comparaciones numéricas contra el modelo base o contra otras celdas de la rejilla.

## Requisitos de hardware

- Pesos en bf16/fp16: el repositorio ocupa 16,1 GB, coherente con 8,03 B de parámetros a 2 bytes por parámetro. Se necesitan al menos 18-20 GB de VRAM para inferencia con contexto corto, contando activaciones y overhead.
- GPU de 24 GB: RTX 4090, RTX 3090, L4 o A10G permiten servir el modelo en precisión completa con lotes pequeños y contexto moderado.
- GPU de datacenter: A100 40/80 GB, H100 80 GB o L40S 48 GB son las opciones recomendadas para lotes grandes y contextos largos.
- Cuantización a 8 bits: en torno a 8-9 GB de pesos, con aproximadamente 10-12 GB de VRAM total; cabe en RTX 4080, RTX 3080 12 GB y RTX 4070 Ti.
- Cuantización a 4 bits: en torno a 4,5-5,5 GB de pesos; cabe en GPU de consumo de 8-12 GB como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070. No se publican versiones GGUF ni cuantizaciones listas para usar.
- Memoria de caché KV: con la configuración del modelo base (32 capas, 8 cabezas KV, dimensión de cabeza 128) el coste es de aproximadamente 128 KiB por token en fp16, es decir, unos 1 GB a 8.000 tokens, 4 GB a 32.000 tokens y 16 GB a los 128.000 tokens completos. Es una estimación derivada del modelo base, no una medición de este checkpoint.
- Opciones de despliegue: transformers, vLLM y text-generation-inference (el repositorio declara compatibilidad con TGI y endpoints). llama.cpp y Ollama requerirían una conversión a GGUF que no está publicada.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B densos | 128.000 tokens | Llama 3.1 Community License | Público en HuggingFace | Referencia sin comprimir; el punto de partida de este artefacto |
| Este checkpoint | 8.030.261.248 almacenados; fracción densa declarada de 0,6999 | 128.000 tokens heredados, no verificado | Llama 3.1 Community License | Público en HuggingFace, 0 descargas | Comprimido con SVD-LLM y editado con swap `gap_iter`, 9 de 10 rondas |
| Otras celdas de la rejilla del mismo autor | no disponible | no disponible | Llama 3.1 Community License | no disponible en la información proporcionada | Variantes sobre otras reglas de selección y presupuestos |
| Otras implementaciones publicadas de SVD-LLM sobre Llama 3.1 8B | no disponible | no disponible | no disponible | no disponible | No se han encontrado en la información disponible |

No se dispone de comparaciones de rendimiento publicadas entre este checkpoint y alternativas de la misma categoría, ni de modelos comparables con métricas de seguridad y sobrerrechazo publicadas en las mismas condiciones de evaluación.

## Limitaciones y advertencias

- No es un modelo desplegable: el autor lo define explícitamente como artefacto de investigación y sujeto experimental, no como asistente de propósito general.
- Degradación de seguridad por compresión: según la propia tarjeta, la compresión por sí sola eleva la tasa de éxito de ataque, y varias celdas de la rejilla están deliberadamente degradadas en seguridad. Este checkpoint aplica una reparación parcial, no una garantía.
- Checkpoint intermedio: corresponde a la ronda 9 de 10 de una ejecución más larga, por lo que no representa un estado final ni convergido del procedimiento.
- Sobrerrechazo elevado: 0,3273 macro medido con WildGuard implica rechazar aproximadamente un tercio de las peticiones benignas evaluadas, con el consiguiente coste de utilidad.
- Discrepancia de parámetros no resuelta: los safetensors declaran 8.030.261.248 parámetros, el mismo valor que el modelo denso, mientras que la tarjeta indica una fracción resultante de 0,6999. No se aclara en la documentación disponible.
- Ausencia de métricas de capacidad: sin MMLU, HumanEval, GSM8K ni evaluaciones de instrucciones, no es posible cuantificar la pérdida de calidad general respecto al modelo base.
- Riesgo de alucinación: no medido en este checkpoint; es el del modelo base y presumiblemente se agrava con la compresión.
- Idiomas: no se documentan los idiomas efectivamente soportados tras la compresión; los ocho idiomas del modelo base no están verificados.
- Restricciones de licencia: Llama 3.1 Community License, con política de uso aceptable incluida en el repositorio. Cualquier uso derivado queda sujeto a esas condiciones, incluida la atribución "Built with Llama" y los límites de escala de la licencia.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento del registro, sin revisión externa publicada.
- Fecha de creación del repositorio: 17 de septiembre de 2026, con última actualización el mismo día.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r09
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Perfil del autor: https://huggingface.co/Jeesup
- Licencia y política de uso: los ficheros LICENSE y USE_POLICY.md están incluidos en el propio repositorio del modelo
- No se han encontrado enlaces adicionales relevantes (papers, blogs o demos) en la búsqueda web: los resultados devueltos no guardan relación con este modelo.
