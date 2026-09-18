# Jeesup/svd-safety-l3_remove40_swapgapiter_b010_r05

## Resumen

`svd-safety-l3_remove40_swapgapiter_b010_r05` es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace, derivado de `meta-llama/Meta-Llama-3-8B-Instruct`. No es un modelo conversacional de propósito general, sino un artefacto experimental: una celda concreta de una rejilla de experimentos que estudia cómo la compresión por SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes repara mejor ese daño. El checkpoint parte de una versión comprimida con SVD-LLM al 60,0 % de los parámetros densos (40,02 % eliminados) y aplica después 5 de las 10 rondas previstas de una sustitución iterativa de parámetros neutra respecto al presupuesto, seleccionada por la regla `gap_iter`.

La relevancia de este modelo es metodológica, no de producto. Cuantifica el compromiso entre seguridad y utilidad bajo compresión: la propia model card advierte de que varias ramas de la rejilla están deliberadamente degradadas en seguridad respecto al modelo original y que la compresión por sí sola eleva la tasa de éxito de ataque. Este checkpoint concreto reporta un ASR de 0,0150 en AdvBench y 0,1100 en StrongREJECT (juzgados con HarmBench) junto con una tasa de sobrerrechazo macro de 0,2649 medida con WildGuard.

El modelo conserva la arquitectura y el tamaño del base (8.030.261.248 parámetros reales según safetensors) con una fracción de parámetros densos resultante de 0,5998. Se distribuye en safetensors bajo la licencia comunitaria de Llama 3 y acumula 187 descargas y 0 "likes" en el momento de la consulta. Cualquier uso en producción debe tratarse como no recomendado sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama 3 (GQA, RoPE, SwiGLU), heredada del modelo base |
| Parametros totales | 8.030.261.248 (~8,03 mil millones) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3 8B Instruct soporta 8.192 tokens |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Llama 3 Community License (Meta) |
| Formato de pesos | safetensors, cargable con la libreria `transformers` |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Compresion aplicada | SVD-LLM, 40,02 % de parametros eliminados |
| Fraccion de parametros densos resultante | 0,5998 |
| Regla de seleccion | gap_iter |
| Presupuesto de restauracion | 1,000 % de los parametros densos (rondas de 0,100 % cada una) |
| Componentes restaurados / sustituidos | 5.944 / 5.944 |
| Parametros insertados | 34.878.464 (0,50 % de los parametros de proyeccion densos) |
| Rondas iterativas aplicadas | 5 de 10 (checkpoint intermedio) |
| Semilla | 42 |
| Tamano del repositorio | 16,1 GB |
| Descargas / likes | 187 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin modificaciones estructurales: un transformer decoder-only con atención de consultas agrupadas (GQA), codificación posicional rotatoria (RoPE) y MLP con activación SwiGLU. Lo que cambia no es la topología, sino el contenido de los pesos. Sobre el checkpoint de Llama-3-8B-Instruct se aplicó primero SVD-LLM, una técnica de compresión post-entrenamiento que descompone en valores singulares las matrices de proyección y descarta componentes de bajo rango, eliminando el 40,02 % de los parámetros y dejando el modelo en una fracción densa de 0,5998.

A continuación se ejecuta un procedimiento de reparación: la sustitución iterativa de parámetros neutra respecto al presupuesto, con la regla de selección `gap_iter`. En cada ronda se restauran 5.944 componentes y se expulsan otros tantos, con un valor de intercambio de tipo `insert` (solo valor de inserción, con expulsión ordenada por sigma), insertando 34.878.464 parámetros por ronda, lo que equivale al 0,50 % de los parámetros de proyección densos y al 0,100 % del total denso. El run completo tiene un presupuesto del 1,0 % repartido en 10 rondas de 0,1 %; este checkpoint se corresponde con un punto intermedio tras 5 rondas, con semilla 42.

No se documenta en la model card ningún proceso de ajuste fino adicional, RLHF, DPO ni datos de entrenamiento propios: el artefacto se construye exclusivamente mediante compresión y edición de parámetros sobre el modelo de Meta. La innovación técnica destacable es, por tanto, el propio marco experimental de selección de componentes y no una arquitectura nueva.

## Capacidades

- Generación de texto conversacional y multi-turno, heredada de Llama-3-8B-Instruct, aunque degradada por la compresión y por las rondas de edición.
- Razonamiento general, matemáticas y generación de código: presentes como capacidades residuales del base, sin métricas publicadas que las cuantifiquen en esta versión comprimida.
- Soporte de tool calling y function calling: no confirmado en la model card; debe verificarse empíricamente antes de asumirlo.
- Uso como agente y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingües: no declaradas; los idiomas soportados figuran como no disponibles.
- Capacidad especial: ninguna de tipo multimodal (sin visión ni audio). La característica diferencial es su condición de sujeto experimental para medir seguridad bajo compresión.
- Resistencia a ataques: es precisamente el eje medido, con ASR de 0,0150 en AdvBench y 0,1100 en StrongREJECT.

## Casos de uso

- Investigación en seguridad de modelos comprimidos: usar este checkpoint como celda de control para medir cómo varía la tasa de éxito de ataque al aplicar SVD-LLM con distintos presupuestos. Es su propósito declarado.
- Estudio de reglas de selección de componentes: comparar `gap_iter` frente a otras reglas de la misma rejilla manteniendo constante el presupuesto del 1,0 %, para aislar el efecto de la heurística de selección.
- Análisis del compromiso seguridad-utilidad: cruzar el ASR de AdvBench y StrongREJECT con la tasa de sobrerrechazo de WildGuard (0,2649) para trazar la frontera entre rechazo excesivo y vulnerabilidad.
- Evaluación de compresión sobre comportamiento instructivo: reproducir con semilla 42 y verificar si la pérdida de adherencia a instrucciones correlaciona con la fracción de parámetros eliminados.
- Auditoría de artefactos derivados: servir como ejemplo de model card que documenta trazabilidad de compresión, útil para diseñar plantillas de auditoría de modelos derivados de Llama.
- Docencia y divulgación técnica: ilustrar en un curso de interpretabilidad qué ocurre cuando se elimina el 40 % de los parámetros de un modelo instructivo y se intenta reparar parcialmente.
- Pruebas de arneses de evaluación de seguridad: validar pipelines propios de AdvBench, StrongREJECT y WildGuard contra un modelo con ASR conocido y documentado.
- No se recomienda su uso como asistente desplegado, atención al cliente, generación de código en producción ni ninguna otra aplicación orientada a usuarios finales.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0150 |
| StrongREJECT | ASR (juez HarmBench) | 0,1100 |
| WildGuard | Sobrerrechazo macro | 0,2649 |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) en la información disponible. Tampoco se proporcionan los valores equivalentes del modelo base sin comprimir, por lo que no es posible calcular la delta de degradación a partir de los datos de la model card, aunque el autor afirma explícitamente que la compresión por sí sola eleva la tasa de éxito de ataque.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 16,1 GB solo para los pesos (tamano del repositorio), más overhead de activaciones y caché KV, lo que sitúa el consumo práctico en el entorno de 18-20 GB para contextos moderados.
- GPU profesionales: A100 40/80 GB, H100, L40S y A6000 ejecutan el modelo sin problemas y permiten lotes grandes.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 (24 GB y 16 GB respectivamente, esta última con cuantización o contextos cortos). En tarjetas de 12 GB o menos es necesario cuantizar a 8 o 4 bits.
- VRAM estimada con cuantización de 4 bits: en torno a 5-6 GB de pesos, viable en RTX 3060 12 GB, RTX 4070 y similares.
- Opciones de despliegue: `transformers` con safetensors como vía nativa; text-generation-inference (el tag `text-generation-inference` está presente) y vLLM son compatibles con la arquitectura Llama 3. No se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían una conversión propia.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la información proporcionada.
- Nota: aunque la arquitectura es estándar y el despliegue es técnicamente sencillo, el modelo está etiquetado por su autor como artefacto de investigación, no como modelo desplegable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| svd-safety-l3_remove40_swapgapiter_b010_r05 | 8,03 mil millones (fraccion densa 0,5998) | no disponible (base: 8.192 tokens) | Llama 3 Community License | HuggingFace, safetensors | Solo metricas de seguridad (AdvBench 0,0150; StrongREJECT 0,1100; sobrerrechazo 0,2649) |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 mil millones | 8.192 tokens | Llama 3 Community License | HuggingFace, safetensors | Ampliamente evaluado; sin valores reproducidos en esta ficha |
| Otros checkpoints del mismo grid de Jeesup | 8,03 mil millones (variantes de presupuesto y regla) | no disponible | Llama 3 Community License | HuggingFace | Sin datos en la informacion disponible |

No se dispone de modelos directamente comparables con benchmarks públicos en la información proporcionada. La comparación honesta es contra el modelo base sin comprimir, y el propio autor indica que al menos algunas celdas de la rejilla están degradadas en seguridad respecto a él, pero no se aportan las cifras del base para cuantificar la diferencia.

## Limitaciones y advertencias

- Artefacto de investigación: el autor declara explícitamente que no es un modelo conversacional de propósito general y desaconseja tratarlo como asistente desplegable.
- Degradación deliberada de seguridad: varias ramas de la rejilla están degradadas a propósito y la compresión por sí sola incrementa la tasa de éxito de ataque. Aunque este checkpoint concreto muestra un ASR bajo en AdvBench (0,0150), el de StrongREJECT es de 0,1100 y debe evaluarse antes de cualquier uso.
- Sobrerrechazo elevado: la tasa macro de sobrerrechazo de 0,2649 medida con WildGuard implica que el modelo rechazará peticiones legítimas con una frecuencia notable, lo que degrada la utilidad práctica.
- Riesgo de alucinación: no cuantificado en la model card, pero esperable al tratarse de un modelo con el 40 % de sus parámetros eliminados y parcialmente restaurados.
- Idiomas: no se declaran idiomas soportados; se desconoce el comportamiento fuera del inglés y no hay evaluación multilingüe.
- Contexto: la model card no especifica la longitud de contexto efectiva tras la compresión; la ventana de 8.192 tokens es la del modelo base y no está garantizado que se mantenga el rendimiento en contextos largos.
- Restricciones de licencia: se aplica la Meta Llama 3 Community License. El repositorio incluye `LICENSE` y `USE_POLICY.md`; el uso comercial está sujeto a las condiciones de dicha licencia, incluidas las cláusulas de atribución ("Built with Meta Llama 3") y las restricciones de uso aceptable.
- Ausencia de cuantizaciones publicadas: al no haber GGUF ni formatos de 4/8 bits, cualquier despliegue en hardware limitado exige conversión y validación propias.
- Sin métricas de capacidad general: no hay MMLU, HumanEval ni GSM8K, por lo que no es posible estimar la pérdida de utilidad frente al base.
- Metadatos anómalos: las fechas de creación y actualización registradas (2026-09-18) son posteriores a la fecha de consulta y deben tratarse con cautela.
- Advertencia sobre la búsqueda web: los resultados de búsqueda devueltos no guardan relación con el modelo (corresponden al juego educativo "Interland" de Google sobre ciudadanía digital), por lo que no aportan información utilizable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove40_swapgapiter_b010_r05
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3 y politica de uso: incluidas en el repositorio del modelo (`LICENSE` y `USE_POLICY.md`)
- Paper de SVD-LLM (tecnica de compresion referenciada por el autor): no disponible en la informacion proporcionada
- Paper o blog del metodo de sustitucion iterativa de parametros: no disponible en la informacion proporcionada
- Repositorio de codigo del estudio: no disponible en la informacion proporcionada
- Demos o espacios asociados: no disponibles
- El autor no publica pagina de proyecto, paper ni enlaces adicionales en la model card.
