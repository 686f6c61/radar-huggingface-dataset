# ColdTensor/Laguna-XS-2.1-Coldfit-13GB-GGUF

## Resumen

Laguna-XS-2.1-Coldfit-13GB es una cuantización GGUF del modelo base poolside/Laguna-XS-2.1, un modelo de mezcla de expertos (MoE) orientado a programación desarrollado por Poolside. La cuantización la publica el usuario ColdTensor bajo el nombre "Coldfit" y reduce el peso en disco de 66,9 GB (BF16) a 13,6 GB, aproximadamente una quinta parte del original, sin podar expertos ni reentrenar. El objetivo declarado es hacer viable un modelo de 33.442.617.088 parámetros en tarjetas gráficas de 16 GB.

La arquitectura del modelo base es MoE con 40 capas, de las cuales 39 son capas MoE con 256 expertos cada una. La cuantización aplica Q2_K a las matrices gate y up de los expertos, Q3_K a las matrices down de los expertos y Q8_0 al resto de matrices cuantizadas, manteniendo en F32 las normas, el router y los sesgos. El resultado es un único fichero GGUF compatible con llama.cpp.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización mixta agresiva sobre un MoE grande; por otro, el propio autor califica la evidencia como exploratoria y el veredicto de su revisión interna como "NOT READY". El ajuste a 16 GB no se verificó en una tarjeta de 16 GB real, sino mediante un proxy en una RTX 4090 de 24 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE, 40 capas, 256 expertos en cada una de las 39 capas MoE |
| Parametros totales | 33.442.617.088 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (configuracion de evaluacion: `-c 32768`) |
| Tipos de cuantizacion | Mixta: expertos gate/up en Q2_K, expertos down en Q3_K, resto en Q8_0; normas, router y sesgos en F32 |
| Idiomas soportados | en (ingles) |
| Licencia | openmdw-1.1 (heredada del modelo base) |
| Formato de pesos | GGUF (fichero unico de 13.595.894.880 bytes) |

## Arquitectura y entrenamiento

El modelo base poolside/Laguna-XS-2.1 es un transformer de mezcla de expertos con 40 capas, donde 39 capas contienen 256 expertos cada una. Esta cuantización no modifica la arquitectura: conserva los 256 expertos de todas las capas sin poda, sin entrenamiento adicional y sin destilación. La única transformación es la reducción de precisión numérica de los pesos.

La estrategia de cuantización es selectiva por tipo de matriz. Las matrices gate y up de los expertos, que concentran la mayor parte de los parámetros, se almacenan en Q2_K (2-3 bits por valor); las matrices down de los expertos en Q3_K; el resto de matrices cuantizables en Q8_0. Las normas, el router de expertos y los sesgos se mantienen en F32 para preservar la estabilidad del enrutamiento. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens, ni si se aplicaron técnicas de RLHF o DPO, ya que la model card de esta cuantización no los detalla.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline declarado text-generation.
- Generación y razonamiento sobre código: el modelo base es un modelo de programación de Poolside, y la evaluación incluye HumanEval+ y MBPP+.
- Razonamiento matemático de tipo escolar: evaluado en GSM8K con 1.319 problemas.
- Conocimiento general: evaluado en MMLU-500.
- Compatible con endpoints (tag `endpoints_compatible`) y con llama.cpp mediante llama-server.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (visión, audio, modo thinking): no disponible; la evaluación se realizó con thinking desactivado.

## Casos de uso

- Despliegue de un modelo de código en estaciones de trabajo con GPU de 16 GB: la cuantización reduce el peso a 13,6 GB, lo que permite cargar el modelo en llama.cpp con contexto de 8K o 16K según las mediciones del autor (13.754 MiB y 14.082 MiB respectivamente).
- Asistencia a la programación en local sin conexión: el modelo mantiene un 85,9% en HumanEval+ y un 74,5% en MBPP+, por lo que puede usarse para autocompletado y generación de funciones Python en entornos aislados.
- Resolución de problemas matemáticos de nivel escolar: con un 93,9% en GSM8K, es adecuado para tutores automáticos o verificación de ejercicios en inglés.
- Evaluación comparativa de técnicas de cuantización: sirve como caso de estudio reproducible de cuantización mixta Q2_K/Q3_K/Q8_0 sobre un MoE de 33B, con métricas de regresión publicadas frente al BF16.
- Prototipado de pipelines de generación de texto con llama-server: el tag `endpoints_compatible` y el soporte en llama.cpp permiten integrarlo en servicios HTTP locales para pruebas.
- Investigación sobre degradación por cuantización extrema: el autor documenta la coincidencia token a token (86,1% frente al 96,2% de una conversión estándar), lo que permite estudiar el impacto de los 2-3 bits en los expertos.
- Respuesta a preguntas de conocimiento general en inglés: con un 80,4% en MMLU-500, puede emplearse en asistentes de consulta interna siempre que se acepte una pérdida de 2 puntos frente al original.

## Benchmarks y rendimiento

Datos del panel de regresión del autor, ejecutado el 2026-11-18 con llama-server (llama-prism b12128), thinking desactivado, decodificación greedy y contexto de 32.768 tokens. Las diferencias se expresan en puntos con intervalo de confianza del 95% por bootstrap pareado; los valores p son tests exactos de McNemar y, tras corrección por seis tareas, todos resultan 1.

| Tarea | Items | Coldfit-13GB | Original BF16 | Diferencia [IC 95%] | p |
|---|---:|---:|---:|---|---:|
| HumanEval+ (media de 2 pasadas) | 163 | 85,9% | 86,8% | -0,9 [-4,3, +2,5] | 0,508 |
| MBPP+ (media de 2 pasadas) | 375 | 74,5% | 75,3% | -0,8 [-3,6, +2,0] | 0,851 |
| GSM8K (1 pasada) | 1.319 | 93,9% (1.239) | 94,6% (1.248) | -0,7 [-1,7, +0,4] | 0,272 |
| MMLU-500 (1 pasada) | 500 | 80,4% (402) | 82,4% (412) | -2,0 [-4,8, +0,8] | 0,203 |

El autor señala que las cuatro tareas empeoran en la misma dirección, aunque ninguna diferencia es significativa por sí sola, y que los datos permiten pérdidas reales de hasta unos 5 puntos. La coincidencia token a token con el modelo de referencia es del 86,1%, frente al 96,2% de una conversión estándar.

## Requisitos de hardware

- VRAM estimada: 13.754 MiB con contexto de 8K y 14.082 MiB con 16K, medidos en una RTX 4090 con llama-server; 14.738 MiB con 32K, valor que el autor describe como ajustado.
- GPU recomendadas: el autor no valida ninguna GPU de 16 GB; las mediciones se hicieron en una RTX 4090 de 24 GB como proxy. La evaluación de calidad se ejecutó en una NVIDIA DGX Spark.
- Cabe en GPU de consumo: el autor afirma que 8K y 16K caben bajo 16 GB según la simulación, pero no lo ha cargado en ninguna tarjeta de 16 GB real y el límite de 16 GB no llegó a aplicarse en la prueba proxy.
- Opciones de despliegue: llama.cpp (llama-server de llama-prism b12128 y también llama.cpp estándar b12359, que cargó el fichero y respondió a un prompt de prueba). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Laguna-XS-2.1-Coldfit-13GB | 33.442.617.088 | 32.768 | GGUF mixto Q2_K/Q3_K/Q8_0 | openmdw-1.1 | Cuantización de 13,6 GB; evidencia exploratoria |
| poolside/Laguna-XS-2.1 (BF16) | 33.442.617.088 | 32.768 | BF16 GGUF (66,9 GB) | openmdw-1.1 | Modelo base de referencia; HumanEval+ 86,8%, GSM8K 94,6% |
| Conversión estándar del original | 33.442.617.088 | 32.768 | GGUF | openmdw-1.1 | Coincidencia token a token del 96,2% frente al 86,1% de Coldfit |

No se dispone de datos de benchmarks de otros modelos de la misma categoría en la información proporcionada, por lo que la comparativa se limita al modelo base y a una conversión estándar citada por el autor.

## Limitaciones y advertencias

- La evidencia de calidad es exploratoria y el veredicto de la revisión interna del autor es "NOT READY".
- El ajuste a 16 GB no se ha verificado en ninguna tarjeta de 16 GB real; la medición es un proxy en una RTX 4090 donde el límite de 16 GB no llegó a aplicarse.
- Las cuatro tareas evaluadas empeoran respecto al BF16, con pérdidas posibles de hasta unos 5 puntos según el intervalo de confianza.
- La coincidencia token a token con el modelo de referencia cae al 86,1% (frente al 96,2% de una conversión estándar), por lo que no es equivalente al original.
- Los expertos se almacenan a 2-3 bits, lo que puede afectar a comportamientos no cubiertos por las cuatro tareas evaluadas.
- El modelo solo declara soporte de inglés.
- No se han publicado los scripts de evaluación, lo que limita la reproducibilidad.
- La licencia openmdw-1.1 se hereda del modelo base; deben revisarse sus términos para uso comercial en el enlace de licencia del repositorio de Poolside.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ColdTensor/Laguna-XS-2.1-Coldfit-13GB
- Modelo base: https://huggingface.co/poolside/Laguna-XS-2.1
- Licencia del modelo base: https://huggingface.co/poolside/Laguna-XS-2.1/blob/main/LICENSE.md
