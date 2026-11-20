# Evanguo12/Inkling-2-Small-EXL3-2.55bpw-2Spark

## Resumen

Inkling-2-Small-EXL3-2.55bpw-2Spark es una cuantización EXL3 del modelo multimodal thinkingmachines/Inkling-2-Small, publicada por el usuario Evanguo12. El modelo original es un transformer de tipo Mixture-of-Experts (MoE) con 594.000 millones de parámetros totales y 17.000 millones activos por token, con capacidades de visión y tool calling. Esta versión reduce el peso a 198,7 GB mediante cuantización EXL3 selectiva, pensada específicamente para ejecutarse en dos nodos NVIDIA DGX Spark (GB10, 128 GB de memoria unificada cada uno) conectados por un cable QSFP.

La cuantización emplea 2,549 bits por peso de media en los expertos enrutados (con tasas por experto entre 1,5 y 4 bits), 6 bits en la atención y 8 bits en la cabeza de salida, manteniendo en bf16 las embeddings, la torre de visión, la cabeza MTP de borrador, el router y las normas. El resultado es un modelo que conserva una divergencia KL de 0,01209 frente al original sobre texto de calibración retenido, con un 97,04% de acuerdo en top-1 y una perplejidad de 2,658 frente a 2,646 del original.

Su relevancia radica en que demuestra que es posible servir un MoE de casi 600.000 millones de parámetros con contexto de hasta 524.288 tokens en hardware de consumo profesional (dos DGX Spark), manteniendo una calidad muy cercana al modelo sin cuantizar y con soporte para razonamiento, tool calls, imágenes y caché de prefijo para sesiones de agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atención híbrida (capas globales y de ventana deslizante), torre de visión y cabeza MTP de borrador |
| Parametros totales | 594.000 millones (modelo original); 97.585.394.688 según safetensors del repo |
| Parametros activos | 17.000 millones por token |
| Longitud de contexto | Hasta 524.288 tokens por petición; caché KV de 1,28 millones de tokens compartida entre hasta 4 peticiones |
| Tipos de cuantizacion | EXL3: expertos enrutados a 2,549 bpw de media (1,5 a 4 bits por experto), atención a 6 bpw, cabeza de salida a 8 bpw; embeddings, visión, MTP, router y normas en bf16; caché KV global a 4 bits y de ventana deslizante a 8 bits |
| Idiomas soportados | No disponible (la model card no detalla la lista; el calibrado incluye chino e inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 48 capas, de las cuales las capas 0-39 almacenan los expertos en NVFP4 y las 40-47 en MXFP8 en la revisión original 2ad1157. La atención combina capas globales y capas de ventana deslizante, y el modelo incorpora una torre de visión y una cabeza MTP (multi-token prediction) de borrador que permite decodificación especulativa. Los 17.000 millones de parámetros activos por token se reparten entre expertos enrutados de forma muy desigual.

El proceso de cuantización de esta versión sigue la receta de 0xSero: los expertos se desquantizan del original y se recuantizan a EXL3 (trellis con LDLQ, codebook mul1), con matrices de Hessian por experto calculadas sobre los tokens de calibración enrutados a cada uno, y los expertos poco enrutados se contraen hacia la covarianza de entrada de la capa. Cada capa ve la salida de las capas ya cuantizadas para propagar el error tal como ocurrirá en inferencia. El presupuesto de bits se asignó midiendo la contribución a la KL: las últimas 18 capas concentraban el 62% del error, por lo que se reasignó el presupuesto por capa y por experto según su cuota de enrutamiento (expertos calientes más bits, expertos fríos menos). La calibración usó 491.520 tokens de Wikipedia (chino e inglés), código (transformers, exllamav3), razonamiento propio del modelo, descripciones de casos legales chinos (CAIL2018), tool calls (hermes-function-calling-v1) y trayectorias de agente (SWE-agent). El cómputo total fue de unas 10,5 horas para los expertos y 70 minutos para la atención en una RTX 5090.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento (thinking) limitable por el motor.
- Generación de código, incluyendo pasos especulativos que elevan el throughput en código hasta 49,7 tokens/s.
- Matemáticas de nivel alto (MATH-500 niveles 4-5 resueltos al 100% en la versión hermana).
- Comprensión de imágenes (pipeline image-text-to-text, torre de visión en bf16).
- Tool calling / function calling con parámetros anidados y llamadas en paralelo.
- Soporte de agentes con caché de prefijo para sesiones y razonamiento multi-turno.
- Capacidades multilingües (chino e inglés presentes en calibración; lista completa no disponible).
- Servidor compatible con la API de OpenAI con streaming, contenido de razonamiento y presupuesto de pensamiento impuesto por el motor.
- Recuperación de información en contexto largo (passphrase encontrada a 240K de 300K tokens y a 297K de 371K tokens).

## Casos de uso

- Análisis de documentación legal extensa: el modelo puede procesar expedientes de hasta 524.288 tokens en una sola petición, con capacidad demostrada en preguntas de análisis de casos del examen judicial chino (68% en JEC-QA), adecuado para revisión de contratos o jurisprudencia.
- Agentes de ingeniería de software: con tool calling anidado, llamadas en paralelo y caché de prefijo para sesiones, puede integrarse en pipelines tipo SWE-agent para resolver issues y ejecutar comandos en entornos controlados.
- Asistencia en investigación matemática: resuelve problemas de nivel 4-5 de MATH-500 y razona con presupuesto de pensamiento configurable, útil para verificación de demostraciones o generación de soluciones paso a paso.
- Atención al cliente multilingüe: conversaciones multi-turno con contexto largo y streaming compatible con OpenAI, desplegable sobre dos DGX Spark con hasta 4 peticiones concurrentes (54,7 tokens/s agregados en chino).
- Análisis de imágenes y documentos escaneados: la torre de visión en bf16 permite extraer información de capturas, diagramas o formularios dentro de flujos conversacionales.
- Procesamiento de repositorios de código completos: con lectura de prompts a 491-646 tokens/s y contexto de cientos de miles de tokens, puede revisar codebases enteras o generar parches contextualizados.
- Despliegue en infraestructura de borde o laboratorio: dos DGX Spark con 128 GB de memoria unificada cada uno permiten servir un MoE de 594.000 millones de parámetros sin clúster de GPUs de datacenter.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| KL divergence (pipeline de cuantización, referencia) | 0,01209 |
| Acuerdo top-1 | 97,04% |
| Perplejidad (original 2,646) | 2,658 |
| KL servido en dos Sparks tal como se distribuye (KV global 4 bits) | 0,01364 |
| Acuerdo top-1 servido en dos Sparks | 96,84% |
| JEC-QA (300 preguntas, versión hermana con mismos expertos) | 204 (68,0%) |
| MATH-500 niveles 4-5 (100 problemas, versión hermana) | 100 |

Throughput en dos Sparks (temperatura 0, sin thinking):

| Escenario | Tokens/s |
|---|---|
| Una petición: prosa china / texto legal chino / prosa inglesa | 24,1 / 24,3 / 24,8 |
| Una petición: código (mayoría pasos especulativos) | 49,7 |
| 2 / 4 peticiones concurrentes en chino (suma) | 35,9 / 54,7 |
| Generación con otras dos peticiones en curso a 6K / 127K tokens de contexto | 20,9 / 20,1 |
| Lectura de prompt de 63K tokens en frío | 646 (98 s) |
| Lectura de prompt, posiciones 49K a 127K | 604 |
| Lectura de prompt, posiciones 98K a 300K | 491 (201K tokens en 411 s) |

## Requisitos de hardware

- VRAM/memoria: 198,7 GB en total, aproximadamente 100 GB leídos por cada nodo; requiere dos DGX Spark (GB10, 128 GB de memoria unificada cada uno) conectados por un cable QSFP.
- GPU recomendadas: exclusivamente dos NVIDIA DGX Spark según la model card; no se documenta soporte en A100, H100 ni RTX 4090.
- No cabe en una GPU de consumo convencional (RTX 4090, 24 GB) ni en una única DGX Spark.
- Motor de despliegue: requiere el fork oracle9i88/inkling2-exl3 (rama `spark`); exllamav3 estándar y otros cargadores EXL3 no pueden cargarlo porque los expertos de una misma capa tienen tasas distintas. Servidor compatible con OpenAI.
- Caché KV: capas globales a 4 bits (rotadas, 16 niveles, 4 grupos de escala por vector), capas de ventana deslizante a 8 bits; 1,28 millones de tokens compartidos entre hasta 4 peticiones.
- Latencia y throughput: ver tabla de benchmarks; lectura de prompts a 491-646 tokens/s y generación de 20-50 tokens/s según carga y tipo de contenido.
- Cómputo de cuantización: unas 10,5 horas para expertos y 70 minutos para atención en una RTX 5090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Small-EXL3-2.55bpw-2Spark | 594B totales / 17B activos | 524.288 tokens | Apache 2.0 | Hugging Face, requiere motor fork |
| thinkingmachines/Inkling-2-Small (original) | 594B totales / 17B activos | No disponible en la información | Apache 2.0 | Hugging Face |
| Versión hermana (mismos expertos, atención y cabeza en bf16) | 594B totales / 17B activos | No disponible | Apache 2.0 | No disponible como repo separado en la información |
| Primera versión (mismo tamaño, bits por capa escalados desde el quant de 0xSero a 3,48 bpw) | 594B totales / 17B activos | No disponible | Apache 2.0 | No disponible como repo separado en la información |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce una divergencia KL de 0,01209-0,01364 respecto al original, con un 96,84-97,04% de acuerdo top-1; no es equivalente bit a bit al modelo sin cuantizar.
- Requiere un motor específico (oracle9i88/inkling2-exl3, rama `spark`); no funciona con exllamav3 estándar ni con otros cargadores EXL3, lo que limita la portabilidad.
- El hardware objetivo son dos DGX Spark; no se documenta funcionamiento en otras configuraciones.
- Los resultados de JEC-QA y MATH-500 corresponden a la versión hermana, no a esta release, que no fue reexaminada (aunque su KL está dentro de 0,0001 de la de la versión hermana).
- La lista completa de idiomas soportados no está disponible; la calibración se centró en chino e inglés.
- La decodificación especulativa eleva el throughput en código pero puede afectar a la latencia en otros dominios.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones específicas de sesgo.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el motor fork deben verificarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/Evanguo12/Inkling-2-Small-EXL3-2.55bpw-2Spark
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Motor requerido: https://github.com/oracle9i88/inkling2-exl3 (rama `spark`)
