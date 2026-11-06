# A-M-K/stowlm-reader-v3

## Resumen

StowLM Reader v3 es un adaptador LoRA publicado por A-M-K (autor AMK-bot) sobre el modelo base Meta Muse Glimmer 30B. No es un modelo de propósito general: es un componente especializado que interpreta una frase de planificación en inglés, junto con un contexto sintético explícito de buque, y la convierte en una restricción JSON estricta o en un rechazo. Forma parte de la pipeline StowLM, un proyecto de investigación y hackathon que envuelve un motor de planificación de estiba naval.

El adaptador se distribuye en formato MLX (Apple Silicon) y su función dentro del sistema es la lectura de instrucciones: el planificador humano confirma cada lectura antes de que un motor de planificación separado (Frontier Engine 0.13.0) genere el plan, y un verificador físico independiente decide. El modelo no planifica ni valida: solo estructura la intención del operador en un esquema JSON controlado.

La relevancia de esta publicación es metodológica más que de rendimiento: el autor documenta con detalle inusual los criterios de aceptación congelados, los resultados por debajo de esos criterios y la decisión explícita de adoptar el adaptador pese a no superar todas las puertas de release, con justificación en comportamiento fuera de alcance. Es un ejemplo de publicación transparente de un adaptador pequeño (64,5 MB de tensores) con trazabilidad de hashes y taxonomía de fallos parcial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (modelo base Meta Muse Glimmer 30B); adaptador MLX |
| Parametros totales | no disponible (adaptador LoRA de 64.515.304 bytes; base de 30B) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base se ejecuta en MLX) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 (adaptador); se mantienen los términos del modelo base |
| Formato de pesos | `adapters.safetensors` (MLX LoRA), configuración `adapter_config.json` |

## Arquitectura y entrenamiento

El adaptador es un LoRA MLX entrenado sobre Meta Muse Glimmer 30B, un modelo base de 30.000 millones de parámetros. La tarea es de extracción estructurada restringida: dada una frase de planificación en inglés y un contexto sintético de buque, producir un JSON que represente una restricción válida o un rechazo explícito. El entrenamiento se apoya en datos sintéticos (tag `synthetic-data`) y en un mecanismo de máscara de decodificación que restringe el espacio de salida a formatos legales.

La innovación técnica destacable es el estudio de la máscara de decodificación sobre 200 frases de validación: antes del fine-tuning, la máscara anulaba la primera elección del modelo en 182 de 200 frases; después del entrenamiento, solo en 2. Casi todas las intervenciones de la máscara afectaban al formato de salida, no a hechos del buque, y ninguna produjo una bahía o un nivel ilegal. El adaptador seleccionado se denomina `swa-last-5` y su revisión inmutable es `2ccfc2817aa9b2a45812feb174eb4fbceffa96b7`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Interpretación de una frase de planificación en inglés y conversión a JSON estricto de restricción o rechazo.
- Aplicación de un esquema de salida controlado mediante máscara de decodificación, que limita el formato a estructuras legales.
- Distinción entre peticiones dentro de alcance y peticiones de relajación de restricciones (loosening), con rechazo mayoritario de estas últimas (1 de 48 aceptadas en el conjunto sellado).
- Manejo de contexto sintético de buque proporcionado explícitamente en el prompt, no inferido.
- Salida determinista en formato: coincidencia estructurada exacta como métrica principal, con campos de texto libre de motivo de rechazo excluidos de la comparación.
- No soporta tool calling, agentes multi-paso, visión, audio ni capacidades multilingües según la información disponible; el alcance es una única frase de entrada y una única salida JSON.

## Casos de uso

- Lectura de instrucciones en una pipeline de planificación naval: el adaptador convierte la frase del planificador en una restricción JSON que el motor Frontier Engine 0.13.0 consume; es adecuado porque su formato de salida es independiente del motor que ocupe esa posición.
- Preprocesamiento con confirmación humana: en un flujo donde el operador revisa y confirma cada lectura antes de planificar, el adaptador reduce el trabajo de traducción manual de lenguaje natural a esquema, con una tasa de coincidencia exacta del 92,19% en el conjunto sellado.
- Detección de peticiones fuera de alcance: con 4 reglas generadas sobre 84 frases de validación fuera de alcance (frente a 27 de la versión v2), sirve como filtro conservador que deriva a revisión humana en lugar de inventar restricciones.
- Investigación sobre máscaras de decodificación: el par adaptador más máscara es un caso de estudio reproducible de cómo el fine-tuning reduce la dependencia de la máscara (de 182/200 a 2/200 intervenciones) para una tarea de formato estricto.
- Evaluación de metodologías de release: la publicación documenta puertas de aceptación congeladas, resultados por debajo de ellas y una decisión de adopción justificada, útil como referencia para equipos que diseñan criterios de promoción de adaptadores.
- Prototipado en Apple Silicon: al ser un LoRA MLX de 64,5 MB, permite experimentar con el comportamiento del lector en un portátil con Metal, con una latencia medida de aproximadamente 4,1 s por frase en caliente y 6,7 s en frío incluyendo la carga del modelo.

## Benchmarks y rendimiento

Resultados sobre el conjunto sellado de 128 frases (spent sealed-v3), según la model card:

| Brazo | Exactas | Porcentaje | Relajaciones aceptadas |
|---|---:|---:|---:|
| StowLM Reader adoptado (máscara actual) | 118/128 | 92,19% | 1/48 |
| v2 finalizado (adaptador `8bf00809…`), misma máscara | 120/128 | 93,75% | 2/48 |
| Glimmer sin entrenar, misma máscara | 60/128 | 46,875% | 0/48 |
| Parser manual justo (baseline) | 90/128 | 70,3125% | 1/48 |
| Muse Spark, referencia histórica con máscara anterior | 126/128 | 98,4375% | 0/48 |

Puertas de release congeladas para v3:

| Puerta | Requisito | Resultado |
|---|---|---|
| R1 | Al menos 90% exactas (≥116/128) | Pasa: 118/128 |
| R2 | Cero relajaciones aceptadas (0/48) | Falla: 1/48 |
| R3 | Como máximo 3 puntos porcentuales por detrás de Spark (≥123/128) | Falla: 6,25 puntos por detrás |
| No regresión exacta frente a v2 | Al menos las exactas de v2 con el mismo decodificador | Falla: 118 frente a 120 |
| No regresión en relajaciones frente a v2 | No más relajaciones aceptadas | Pasa: 1 frente a 2 |

Datos adicionales: en la muestra fija de selección de 400 frases de validación, el lector seleccionado obtuvo 373/400 y v2 obtuvo 369/400 (cifras de selección/desarrollo, no de held-out). En el conjunto sellado, el lector generó incorrectamente una regla en 4 de las 76 frases que debía rechazar (v2: 6). La latencia p95 específica de release y la RAM mínima no están registradas.

## Requisitos de hardware

- VRAM/RAM: el adaptador ocupa 64,5 MB; el modelo base de 30B requiere memoria acorde a su tamaño y cuantización, no especificada en la información disponible. La ejecución medida registró un pico de asignación Metal de 15,7 GB, que no constituye una cifra de RAM mínima.
- GPU recomendadas: la librería es MLX, orientada a Apple Silicon (memoria unificada); no se documentan GPU NVIDIA ni AMD.
- Cabe en GPU de consumo: no hay datos para GPU de consumo con CUDA; en Apple Silicon se ejecutó con un pico de 15,7 GB de asignación Metal, lo que encaja en equipos con memoria unificada de 24 GB o superior, aunque el mínimo no está registrado.
- Opciones de despliegue: MLX con el adaptador LoRA y el modelo base Muse Glimmer 30B; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 4,1 s por frase en mediana en caliente y 6,7 s en frío (carga del modelo más primera frase), medidos en una ejecución de 12 frases con la red bloqueada y la máquina cargada. No hay cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| StowLM Reader v3 (este) | LoRA MLX sobre Muse Glimmer 30B | 64,5 MB de adaptador; base 30B | no disponible | 118/128 exactas; 1/48 relajaciones | Apache-2.0 | Hugging Face, 0 descargas |
| StowLM Reader v2 | LoRA MLX sobre Muse Glimmer 30B | no disponible | no disponible | 120/128 exactas; 2/48 relajaciones; 27 reglas en 84 frases fuera de alcance | Apache-2.0 | Adaptador referenciado en la model card |
| Muse Spark (referencia histórica) | Modelo de la misma familia, máscara anterior | no disponible | no disponible | 126/128 exactas; 0/48 relajaciones | no disponible | Referencia interna, no comparación con decodificador idéntico |
| Parser manual justo | Reglas escritas a mano | no aplica | no aplica | 90/128 exactas; 1/48 relajaciones | no disponible | Baseline del proyecto |

La comparación con modelos de propósito general de 30B no está disponible en la información proporcionada; las alternativas documentadas son variantes del mismo proyecto y un baseline determinista.

## Limitaciones y advertencias

- El adaptador no superó todas las puertas de release congeladas: falló R2 (1 relajación aceptada frente a 0 requeridas), R3 (6,25 puntos por detrás de Spark) y la no regresión exacta frente a v2 (118 frente a 120). La adopción se justificó por comportamiento fuera de alcance, no por el criterio pre-registrado.
- En el conjunto sellado generó una regla incorrecta en 4 de las 76 frases que debía rechazar; el rechazo no es perfecto y requiere confirmación humana.
- Diez de las 128 lecturas adoptadas no fueron exactas; la taxonomía completa de fallos por brazo no está registrada en los informes agregados citados.
- El alcance es una única frase en inglés con contexto sintético de buque; no es un planificador, no valida físicamente y no debe usarse con datos reales de empresas o clientes.
- Las cifras de 373/400 y 369/400 son de selección/desarrollo, con solapamiento entre generador y familia y selección de candidatos, por lo que no son estimaciones de precisión held-out.
- La máscara de decodificación puede dejar pasar una regla legal pero incorrecta en frases que deberían rechazarse (2 casos en 200 frases de validación), lo que motiva la confirmación humana.
- La licencia Apache-2.0 del adaptador no sustituye los términos del modelo base, que siguen aplicándose.
- No se ejecutó una aceptación de inferencia en vivo en un portátil limpio para este paquete de publicación.
- No hay datos de sesgos, alucinación en texto libre ni comportamiento multilingüe; el modelo solo produce salida estructurada en inglés.

## Enlaces

- Hugging Face: https://huggingface.co/A-M-K/stowlm-reader-v3
- Repositorio de código: https://github.com/AMK-bot/StowLM
- Decisiones del proyecto (D266): `docs/decisions.md` en el repositorio anterior
- Procedencia y hashes: `PROVENANCE.md` en el repositorio de Hugging Face
- Informe de máscara: `experiments/mvp/reader/v3/results-final/mask-study/report-base.json`
- Adopción final: `experiments/mvp/reader/v3/results-final/final-adoption-d266.json`
- Resumen sellado: `experiments/mvp/reader/v3/results-final/sealed-summary.json`
- Informe del parser sellado: `parser/sealed-v3-report.json`
- Referencia Spark: `experiments/mvp/reader/v3/sealed/spark-summary.json`
- Medición de latencia: `experiments/mvp/pipeline/reader_final/readings/offline-timing.json`
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
