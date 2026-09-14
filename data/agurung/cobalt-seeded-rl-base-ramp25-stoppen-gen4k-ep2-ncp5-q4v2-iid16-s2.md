# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v2-iid16-s2

## Resumen

`agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v2-iid16-s2` es un checkpoint de aprendizaje por refuerzo (RL) construido sobre `Qwen/Qwen3-4B-Instruct-2507`. Lo publica el usuario `agurung` como parte de una campaña de experimentos de RL orientada a generación de código, y corresponde al paso global 20 de un entrenamiento con OpenRLHF y el algoritmo GRPO. No es un modelo nuevo desde cero: es un ajuste posterior del modelo base de 4.400 millones de parámetros con el que se busca mejorar la tasa de acierto (pass@8) en problemas de programación que el modelo original resolvía en muy pocas de 64 muestras.

El interés de esta ficha es doble. Por un lado, documenta una receta de RL reproducible sobre un modelo denso pequeño, con detalles poco habituales (penalización anti-truncamiento, penalización por longitud excesiva al estilo DAPO, sin término KL). Por otro, es un ejemplo de checkpoint de investigación publicado sin model card completa: no declara licencia, idiomas ni resultados de evaluación, y su conjunto de datos de entrenamiento es un subconjunto cerrado de 1.833 problemas de código con validación por ejecución de tests. La relevancia práctica es, por tanto, acotada: sirve como punto de partida para experimentos de RL sobre código, no como modelo de propósito general listo para producción.

El repositorio ocupa 44,1 GB, muy por encima de los ~8,8 GB que ocuparían los pesos en bf16, lo que sugiere que incluye artefactos adicionales (posiblemente estados de optimizador o revisiones intermedias). El modelo tiene 0 likes y 29 descargas en el momento de redactar esta ficha, y la búsqueda web realizada no ha devuelto ninguna fuente externa relevante (los resultados obtenidos son páginas de comercio electrónico sin relación con el modelo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); detalles de capas no disponibles en la model card, se heredan de `Qwen/Qwen3-4B-Instruct-2507` |
| Parametros totales | 4.411.424.256 (dato real de los safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no declarada en la model card de este checkpoint. El modelo base Qwen3-4B-Instruct-2507 documenta 262.144 tokens nativos; no hay confirmación de que el checkpoint RL preserve ese comportamiento |
| Tipos de cuantizacion | no disponible. El sufijo `q4v2` del nombre identifica la configuración del experimento RL, no una cuantización publicada. Solo se distribuyen pesos en safetensors |
| Idiomas soportados | no disponibles en la model card. El modelo base Qwen3-4B-Instruct-2507 es multilingüe, pero el RL se entrenó únicamente con problemas de código, lo que puede degradar el comportamiento en otros idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `transformers`); compatible con `text-generation-inference` y `endpoints_compatible` según etiquetas |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Revision a cargar | `main` (el modelo está en la raíz del repositorio, sin subcarpeta) |
| Tamano del repositorio | 44,1 GB |
| Descargas / likes | 29 / 0 |
| Fecha de creacion | 2026-09-14 |
| Ultima actualizacion | 2026-09-14 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-4B-Instruct-2507: un transformer denso de 4.400 millones de parámetros. Esta ficha no reproduce los detalles de capas, cabezas de atención o normalización porque no aparecen en la model card del checkpoint ni se han verificado en fuentes primarias durante la búsqueda. Lo que sí define a este artefacto es el proceso de RL aplicado encima.

El entrenamiento se realizó con OpenRLHF usando GRPO (Group Relative Policy Optimization) con ventajas normalizadas por grupo y sin penalización KL. La model card indica que el modelo se sembró directamente desde el modelo base, sin fase previa de SFT, aunque la etiqueta `base_model` apunta a la variante Instruct-2507; esta discrepancia no se resuelve en la documentación. La señal de recompensa es binaria: 1.0 si el programa generado pasa los tests del problema, 0.0 en caso contrario. Se añaden dos modificaciones sobre el GRPO estándar: una penalización "stop-properly" que asigna recompensa -1.0 a las muestras truncadas (shaping anti-truncamiento de estilo ProRL) y una penalización DAPO por longitud excesiva que penaliza de forma aditiva, hasta -0.25, las respuestas situadas en los últimos 1.024 tokens antes del límite. Los hiperparámetros declarados son: 8 muestras por prompt, batch de rollout y de entrenamiento de 128, máximo de 4.096 tokens nuevos por rollout, 2 episodios, learning rate del actor de 1e-06 con schedule constante.

El conjunto de entrenamiento es el denominado "frontier cobalt-train ≤2/64": 1.833 problemas de entrenamiento y 112 de validación, seleccionados por ser aquellos que el modelo base resolvía en como máximo 2 de 64 muestras bajo un escaneo de dificultad `iid_canonical@64`. Es decir, se entrenó exclusivamente sobre el subconjunto de problemas más difíciles para el modelo de partida. La validación se muestrea a temperatura 1.0. La model card indica que este checkpoint es el mejor por pass@8 de la ejecución hasta el momento, pero no incluye métricas de evaluación en el registro de entrenamiento.

## Capacidades

- Generación de código orientada a problemas algorítmicos: es la capacidad directamente optimizada por la señal de recompensa (correctitud binaria frente a tests).
- Razonamiento multi-paso implícito: el formato de rollout con hasta 4.096 tokens nuevos favorece cadenas de razonamiento largas antes de emitir la solución.
- Generación de múltiples candidatos por prompt: la receta usa 8 muestras por prompt, por lo que el modelo está optimizado para su uso en modo muestreo múltiple con verificación posterior (best-of-n o pass@k).
- Autocorrección parcial por señal de truncamiento: la penalización a respuestas truncadas tiende a favorecer salidas que cierran correctamente el bloque de código.
- Generación de texto general: heredada del modelo base, aunque no evaluada ni garantizada tras el RL.
- Tool calling / function calling: no disponible. La model card no lo menciona y no se ha verificado que se preserve del modelo base.
- Soporte de agentes y razonamiento multi-paso con herramientas: no disponible.
- Capacidades multilingües: no disponibles. El entrenamiento RL se limita a enunciados de problemas de código; no hay datos sobre cobertura de idiomas naturales.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Decodificación especulativa: no disponible.

## Casos de uso

- Generación de soluciones candidatas para problemas de programación competitiva: dado un enunciado con tests, generar 8 soluciones independientes y seleccionar la primera que pase la verificación. Es exactamente el escenario sobre el que se optimizó (pass@8) y el uso más fiable del checkpoint.
- Síntesis de datos para RL posterior: usar el modelo como generador de rollouts dentro de un pipeline OpenRLHF, aprovechando que ya está entrenado sobre el frontier ≤2/64 y por tanto produce señal útil donde otros modelos pequeños fallan sistemáticamente.
- Evaluación de robustez de modelos pequeños en código: emplearlo como baseline duro en comparativas de pass@k, dado que fue seleccionado precisamente por resolver problemas que el base resolvía en 1 o 2 de 64 intentos.
- Reparación automática de código guiada por tests: integrarlo en un bucle de "generar, ejecutar tests, reintentar" para arreglar funciones que fallan en una suite de pruebas, con el coste bajo que permite un modelo de 4.400 millones de parámetros.
- Generación de casos de prueba adversarios: pedirle variantes de entrada que rompan una implementación dada; el entrenamiento con verificación por ejecución favorece la conciencia de casos límite.
- Destilación hacia modelos más pequeños: usar sus soluciones verificadas como datos de supervisión para modelos de 1-1,5 B parámetros en dominios algorítmicos concretos.
- Investigación en recetas de RL sin SFT previo: este checkpoint es un punto de comparación controlado para estudiar el efecto del GRPO directo sobre un modelo base, con y sin las penalizaciones de truncamiento y longitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las métricas de evaluación en este checkpoint "no están disponibles en el registro de entrenamiento" (`Eval metrics at this checkpoint: not available in the train log`). El único dato cualitativo aportado es que se trata del mejor checkpoint de la ejecución según pass@8, sin cifra asociada. El registro de entrenamiento se encuentra en Weights & Biases, proyecto `eaiexp-paper-final`, nombre de ejecución `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_q4v2_iid16_s2`, pero no se ha podido consultar su contenido durante la elaboración de esta ficha.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento real de parámetros (4.411.424.256) y suponen pesos densos sin cuantizar el caché KV. No están confirmadas por el autor.

- VRAM para pesos en bf16/fp16: aproximadamente 8,8 GB solo de pesos; con caché KV y activaciones, del orden de 12-14 GB para contextos moderados.
- VRAM para pesos en cuantización de 8 bits: aproximadamente 4,4-5,5 GB de pesos.
- VRAM para pesos en cuantización de 4 bits (NF4, GPTQ, AWQ): aproximadamente 2,5-3,5 GB de pesos. Requiere cuantizar el checkpoint, ya que el repositorio solo publica safetensors sin cuantizar.
- Caché KV: con la configuración de atención de Qwen3-4B (36 capas, 8 cabezas KV, dimensión de cabeza 128), el coste estimado es de unos 0,15 MB por token en bf16, es decir, del orden de 4,7 GB para 32.000 tokens de contexto. Este dato se basa en la configuración pública del modelo base y no se ha verificado en este checkpoint.
- GPU consumer: cabe con holgura en una RTX 4090 o RTX 3090 (24 GB) en bf16, incluso con contextos largos. En una RTX 3060 de 12 GB entra en bf16 solo con contextos cortos, y en 4 bits con contexto amplio. En GPUs de 8 GB requiere cuantización de 4 bits y contexto reducido.
- GPU de centro de datos: A100 40/80 GB, H100, L40S y similares no presentan ninguna restricción; el modelo es pequeño para ese segmento y el cuello de botella será el throughput, no la memoria.
- Opciones de despliegue: `transformers` (carga directa con `revision="main"`), vLLM (`vllm serve ... --revision main`), TGI (etiqueta `text-generation-inference` presente) y endpoints compatibles. Para llama.cpp u Ollama sería necesario convertir previamente a GGUF, conversión no publicada por el autor.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

Advertencia sobre el repositorio: los 44,1 GB de tamaño para un modelo de 4.400 millones de parámetros implican que el repositorio contiene artefactos adicionales (posiblemente estados de optimizador en fp32, múltiples revisiones o ficheros duplicados). Conviene revisar la lista de ficheros antes de descargar, especialmente en entornos con ancho de banda limitado.

## Comparativa con modelos similares

Los datos de las alternativas provienen de su documentación pública y deben verificarse antes de tomar decisiones. La licencia de este checkpoint no está declarada, lo que impide una comparación fiable en ese apartado.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `agurung/cobalt-seeded-rl-base-...-iid16-s2` (este) | 4,41 B | no disponible (base: 262.144) | RL sobre codigo, frontier ≤2/64 | no disponible | HuggingFace, 29 descargas |
| Qwen/Qwen3-4B-Instruct-2507 | 4,4 B aprox. | 262.144 tokens | Proposito general, instrucciones | Apache-2.0 (segun documentacion publica de Qwen3) | Muy extendida |
| Qwen/Qwen2.5-Coder-3B-Instruct | 3,09 B aprox. | 32.768 tokens | Codigo | Apache-2.0 (segun documentacion publica) | Extendida |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B aprox. | 128.000 tokens | Proposito general, instrucciones | Llama 3.2 Community License | Extendida, con restricciones |

Diferencias clave: frente al base Qwen3-4B-Instruct-2507, este checkpoint intercambia generalidad por especialización en un subconjunto muy concreto de problemas de código; no hay evidencia publicada de que mantenga las capacidades generales del base. Frente a Qwen2.5-Coder-3B-Instruct, el atractivo es la ventana de contexto del base (si se conserva) y el entrenamiento con verificación por ejecución, pero el modelo carece de la madurez de despliegue y del soporte de la familia Coder. No se dispone de datos de rendimiento comparables para ninguno de los cuatro en este checkpoint concreto.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, el uso comercial es jurídicamente ambiguo. Aunque el modelo base Qwen3 se publica bajo Apache-2.0 según su documentación, la ausencia de términos para este derivado impide asumir que se heredan. Consultar con el autor antes de cualquier uso en producción.
- Sesgo de dominio severo: el entrenamiento se limita a 1.833 problemas de código del frontier ≤2/64. Es previsible una degradación en tareas de texto general, conversación y conocimiento factual, aunque no se han publicado evaluaciones que lo cuantifiquen.
- Riesgo de sobreajuste a la distribución de entrenamiento: los problemas se seleccionaron por un criterio de dificultad muy específico bajo el escaneo `iid_canonical@64`. El comportamiento fuera de esa distribución no está caracterizado.
- Sin resultados de benchmarks: no hay ninguna métrica publicada (ni pass@1, ni pass@8, ni MMLU, ni HumanEval). La afirmación de que es el mejor checkpoint de la ejecución por pass@8 no incluye cifra.
- Riesgo de alucinación en código: la recompensa es binaria y se calcula contra tests concretos. En ausencia de tests, el modelo puede producir soluciones sintácticamente plausibles pero incorrectas sin ninguna señal de confianza asociada.
- Posible pérdida del formato de instrucciones: la model card indica que el RL se aplicó directamente sobre el modelo base sin semilla de SFT, mientras que la etiqueta `base_model` apunta a la variante Instruct-2507. Si el RL se aplicó sobre el modelo base puro, el ajuste a formato de chat puede haberse degradado.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe. El entrenamiento con enunciados de problemas puede haber reducido la competencia en idiomas distintos del inglés.
- Penalizaciones que alteran la distribución de salida: la penalización de -1.0 a respuestas truncadas y la penalización DAPO de hasta -0.25 por longitud excesiva pueden empujar al modelo a respuestas más cortas y a cerrar prematuramente razonamientos largos que serían correctos.
- Repositorio sobredimensionado: 44,1 GB para 4,41 B de parámetros. Verificar el contenido antes de descargar y comprobar si los ficheros safetensors están duplicados o acompañados de estados de optimizador.
- Naturaleza experimental: 29 descargas, 0 likes, publicada el 2026-09-14. Es un artefacto de investigación sin ciclo de mantenimiento conocido.
- Sin datos de latencia, throughput ni consumo: no hay base para planificar capacidad de producción.
- La búsqueda web no ha devuelto documentación externa, paper ni repositorio asociado. Toda la información de esta ficha procede de la model card y de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q4v2-iid16-s2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Registro de entrenamiento (Weights & Biases): proyecto `eaiexp-paper-final`, ejecución `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_q4v2_iid16_s2` (no se ha proporcionado URL directa)
- Registro de entrenamiento local (ruta indicada por el autor): `experiments/cobalt_qwen3_4b_ft/rl_runs/qwen3_4b_instruct_2507_cobalt_v1/seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_q4v2_iid16_s2/openrlhf_train.log`
- Paper, blog o repositorio del autor: no disponible. La búsqueda web no ha devuelto ninguna fuente relacionada con este modelo.
