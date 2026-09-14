# Jeesup/svd-safety-l2_basis_remove40_swapgapnet_b010_r08

## Resumen

svd-safety-l2_basis_remove40_swapgapnet_b010_r08 es un artefacto de investigación publicado por el usuario Jeesup en Hugging Face. Se trata de un checkpoint de Llama-2-7b-chat que ha sido comprimido mediante la técnica Basis Sharing (ICLR 2025, bases compartidas sobre grupos de 2 capas adyacentes) hasta conservar el 60,0 % de los parámetros densos de las proyecciones, y posteriormente reparado con 8 de 10 rondas de un procedimiento iterativo de intercambio de parámetros neutro en rendimiento ("parameter-neutral swap"), guiado por la regla de selección `swapgapnet_iter` con un presupuesto de restauración del 1,0 % de los parámetros densos.

El problema que aborda es concreto y medible: la compresión por SVD degrada el comportamiento de seguridad de un modelo alineado, y el estudio investiga qué regla de selección de componentes repara mejor ese daño con el menor coste posible. Este checkpoint es una celda de una rejilla experimental que cruza reglas de selección y presupuestos, no un asistente conversacional de propósito general. El propio autor advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.

Arquitectónicamente es un transformer decoder-only de la familia Llama 2 (6.738.415.616 parámetros según el recuento real de los safetensors publicados; fracción de parámetros densos resultante de 0,5999 según el autor), con licencia Llama 2 Community License y una ventana de contexto heredada del modelo base de 4096 tokens. Su relevancia es metodológica: aporta métricas de tasa de éxito de ataque (ASR) y de sobrerrechazo medidas con jueces estandarizados (HarmBench, WildGuard), lo que permite comparar reglas de reparación bajo un protocolo reproducible. No se han publicado resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K) para este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), con compresion por Basis Sharing: bases SVD compartidas sobre grupos de 2 capas adyacentes, 40,00 % de parametros eliminados |
| Parametros totales | 6.738.415.616 (recuento real de los safetensors); fraccion de parametros densos resultante segun el autor: 0,5999 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (heredada del modelo base meta-llama/Llama-2-7b-chat-hf) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (precision del modelo base, fp16). No se incluyen variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible en la model card; los idiomas efectivos son los heredados de Llama-2-7b-chat (predominio del ingles) |
| Licencia | Llama 2 Community License (se incluyen LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos de procedencia declarados por el autor: regla de seleccion `swapgapnet_iter`, presupuesto de restauracion 1,000 % de los parametros densos, 3575 componentes restaurados, 3575 componentes sustituidos, valor de intercambio `net` (valor de insercion mas valor de eliminacion del desalojo ordenado por sigma), semilla 42, chunk por ronda 0,100 % de los parametros densos, 51.783.680 parametros intercambiados (0,80 % de los parametros de proyeccion densos), checkpoint intermedio de una ejecucion mas larga.

## Arquitectura y entrenamiento

El modelo parte de meta-llama/Llama-2-7b-chat-hf, un transformer decoder-only de 7B con atención causal y 4096 tokens de contexto. Sobre ese checkpoint se aplica Basis Sharing, un esquema de compresión por descomposición en valores singulares (SVD) que comparte las bases entre grupos de 2 capas adyacentes, eliminando el 40,00 % de los parámetros de las proyecciones. La compresión no cambia la topología de la red, sino la estructura interna de los pesos, que quedan expresados como coeficientes sobre bases compartidas.

Tras la compresión se aplica un proceso de reparación en 10 rondas iterativas, de las cuales este checkpoint corresponde a la ronda 8. Cada ronda sustituye hasta un 0,1 % de los parámetros densos (3575 componentes por ronda en este caso), seleccionados por la regla `swapgapnet_iter`, que ordena los componentes por un valor "net" que combina el valor de inserción con el valor de eliminación del desalojo ordenado por sigma. Por último se aplica una recuperación con LoRA de rango r=8 restringida exclusivamente a los coeficientes por capa (las bases permanecen congeladas y el presupuesto de parámetros no cambia), durante 2 épocas, con learning rate 1e-4, batch de 64 y el dataset alpaca-cleaned. El resultado es un checkpoint intermedio, no el punto final del barrido.

## Capacidades

- Generación de texto conversacional en inglés, con el estilo de respuesta alineado propio de Llama-2-7b-chat.
- Razonamiento de un solo turno y multiturno dentro de la ventana de 4096 tokens del modelo base.
- Seguimiento de instrucciones conversacionales (formato chat del modelo base).
- Capacidad medida de resistencia a ataques de jailbreak, cuantificada mediante ASR sobre AdvBench y StrongREJECT con jurado HarmBench.
- Comportamiento de rechazo medible, con una métrica de sobrerrechazo macro evaluada con WildGuard.
- No se declara soporte de tool calling, function calling ni uso agéntico.
- No se declara soporte multimodal (visión o audio).
- No se declara un modo "thinking" ni razonamiento extendido explícito.
- Capacidades multilingües: no documentadas.

Advertencia importante: las capacidades anteriores describen lo que el modelo base puede hacer; la compresión y el proceso de reparación alteran el comportamiento real, y el autor insiste en que cada celda de la rejilla debe evaluarse empíricamente antes de extraer conclusiones. Este checkpoint no debe tratarse como un asistente desplegable.

## Casos de uso

- Estudio de la degradación de seguridad por compresión: usar este checkpoint junto con el modelo base sin comprimir y con otras celdas de la rejilla para medir cuánto aumenta el ASR al eliminar el 40 % de los parámetros, manteniendo constantes el conjunto de ataques y el jurado (HarmBench).
- Ablación de reglas de selección de componentes: comparar `swapgapnet_iter` frente a otras reglas del estudio aplicando el mismo presupuesto (0,1 % por ronda) y comprobar cuál repara mejor el ASR por unidad de parámetro restaurado.
- Análisis de la curva presupuesto-reparación: este checkpoint corresponde a la ronda 8 de 10 con un presupuesto total del 1,0 %; sirve para trazar cómo evolucionan ASR y sobrerrechazo a medida que se inyectan componentes restaurados.
- Evaluación del equilibrio seguridad-utilidad: cruzar la métrica de sobrerrechazo macro (WildGuard, 0,0864) con evaluaciones de utilidad conversacional para detectar si la reparación de seguridad penaliza la capacidad de respuesta.
- Red-teaming comparativo y calibración de jueces: al disponer de ASR medidos con HarmBench y de rechazo medido con WildGuard, el checkpoint es útil como sujeto de prueba para validar la sensibilidad de esos jueces ante modelos comprimidos.
- Reproducción de resultados de compresión SVD: dado que la model card documenta semilla (42), número de componentes, presupuesto y configuración de LoRA, permite reproducir el protocolo de Basis Sharing sobre Llama 2 y verificar la recuperación tras la edición de parámetros.
- Docencia e investigación sobre interpretabilidad: estudiar qué componentes concretos concentran el comportamiento de seguridad, aprovechando que el experimento restaura y desaloja conjuntos explícitos de 3575 componentes por ronda.
- Validación de pipelines de evaluación antes de desplegar modelos comprimidos: usar el checkpoint como caso límite para comprobar que los sistemas de moderación y filtrado detectan un modelo con seguridad degradada.

En ningún caso se recomienda su uso como asistente de atención al cliente, generación de código en producción ni cualquier aplicación orientada a usuarios finales.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son métricas de seguridad y rechazo. En ASR, valores más bajos son mejores.

| Metrica | Valor | Juez / protocolo |
|---|---|---|
| AdvBench ASR | 0,0981 | HarmBench judge |
| StrongREJECT ASR | 0,1821 | HarmBench judge |
| Sobrerrechazo macro | 0,0864 | WildGuard |

No se han publicado resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la información disponible. Tampoco se proporcionan los valores de referencia del modelo base sin comprimir ni de las demás celdas de la rejilla, por lo que no es posible calcular la delta de degradación o de recuperación a partir de los datos disponibles.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 13,5 GB solo para pesos (6.738.415.616 parámetros × 2 bytes), más el caché KV para 4096 tokens de contexto. El tamaño del repositorio es de 13,5 GB, coherente con esta estimación.
- GPU profesionales: A100 40/80 GB, H100, L40S o A6000 sin problema, con margen amplio para lotes grandes.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) en fp16 con contexto moderado. En tarjetas de 16 GB (RTX 4080, RTX 4070 Ti Super) o de 12 GB haría falta cuantización a 8 o 4 bits, que no se distribuye en este repositorio.
- Opciones de despliegue: transformers (librería declarada en el repositorio), text-generation-inference (el modelo está etiquetado como `endpoints_compatible`) y vLLM son las vías directas al estar los pesos en safetensors. llama.cpp u Ollama requerirían convertir los pesos a GGUF por cuenta propia.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la información proporcionada.
- Nota: al tratarse de un checkpoint de investigación, la carga debe hacerse con `trust_remote_code` desactivado salvo verificación previa, y conviene aislar la ejecución del entorno de producción.

## Comparativa con modelos similares

La información disponible no incluye métricas comparables para otras celdas de la rejilla ni para el modelo base, por lo que la comparación numérica de rendimiento no es posible. Se comparan a continuación los atributos estructurales documentados.

| Modelo | Parametros | Contexto | Compresion | Metricas de seguridad | Licencia |
|---|---|---|---|---|---|
| svd-safety-l2_basis_remove40_swapgapnet_b010_r08 | 6.738.415.616 (recuento del checkpoint); fraccion densa 0,5999 | 4096 | Basis Sharing, 40 % eliminado + 8/10 rondas de swap | AdvBench ASR 0,0981; StrongREJECT ASR 0,1821; sobrerrechazo 0,0864 | Llama 2 Community License |
| meta-llama/Llama-2-7b-chat-hf (base sin comprimir) | no disponible en la informacion proporcionada | 4096 | ninguna | no disponible | Llama 2 Community License |
| Otras celdas de la misma rejilla (otras reglas y presupuestos) | no disponible | 4096 (heredado) | misma compresion, distinta regla de seleccion | no disponible | Llama 2 Community License |
| Metodos alternativos de compresion de Llama 2 (podado no estructurado, cuantizacion) | no disponible | no disponible | no disponible | no disponible | segun cada publicacion |

No se dispone de datos suficientes para establecer una comparativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo desplegable: el autor lo describe explícitamente como "artefacto de investigación" y "sujeto experimental", no como un asistente utilizable.
- Seguridad degradada de forma deliberada en varias celdas de la rejilla. La compresión por sí sola eleva la tasa de éxito de ataque, y este checkpoint es un punto intermedio del proceso de reparación (8 de 10 rondas), no el resultado final del barrido.
- Riesgo elevado de alucinación y de respuestas incoherentes por la pérdida del 40 % de los parámetros de las proyecciones; no se han publicado evaluaciones de fidelidad factual ni de coherencia.
- Sin datos de benchmarks generales: no hay MMLU, HumanEval, GSM8K ni evaluaciones de utilidad conversacional que permitan acotar la pérdida de capacidad.
- Idiomas no documentados; el comportamiento multilingüe es el heredado de Llama-2-7b-chat y puede degradarse de forma desigual tras la compresión.
- Contexto limitado a 4096 tokens, insuficiente para tareas de contexto largo y sin soporte de extensiones tipo RoPE scaling declarado.
- Sin cuantizaciones publicadas: quien necesite GGUF, AWQ o GPTQ debe generarlas y validarlas por su cuenta, con el consiguiente riesgo de alterar aún más el comportamiento de seguridad.
- Restricciones de licencia: Llama 2 Community License y USE_POLICY.md vinculan cualquier uso de esta obra derivada. La licencia incluye condiciones de uso aceptable, obligaciones de atribución ("Built with Llama 2") y una cláusula de licencia adicional para servicios con más de 700 millones de usuarios mensuales. El uso comercial está sujeto a esas condiciones y a la política de uso aceptable de Meta.
- Los pesos derivan de un modelo alineado mediante RLHF, pero la edición de parámetros invalida las garantías de alineación del modelo original; no debe asumirse que los rechazos se comporten como en Llama-2-7b-chat.
- Las métricas de seguridad publicadas dependen de jueces automáticos concretos (HarmBench, WildGuard) y de una semilla (42); su variabilidad entre ejecuciones no se documenta.
- Los resultados de la búsqueda web asociados a esta consulta no guardan ninguna relación con el modelo (consisten en sitios de deberes escolares en ucraniano y ruso), por lo que no aportan información adicional verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove40_swapgapnet_b010_r08
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Metodo de compresion citado por el autor: Basis Sharing, ICLR 2025 (no se ha encontrado enlace directo al paper en la información disponible)
- Metodo de recuperacion citado: LoRA (no se incluye enlace en la model card)
- Juez de seguridad citado: HarmBench (no se incluye enlace en la model card)
- Clasificador de rechazo citado: WildGuard (no se incluye enlace en la model card)
- Dataset de recuperacion citado: alpaca-cleaned (no se incluye enlace en la model card)
- Ficheros de licencia incluidos en el repositorio: LICENSE.txt y USE_POLICY.md
- Repositorio o demo adicional: no disponible
- Paper o blog del autor: no disponible
