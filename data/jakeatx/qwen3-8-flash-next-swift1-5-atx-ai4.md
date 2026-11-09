# jakeatx/qwen3.8-flash-next-Swift1.5-ATX-AI4

## Resumen

Este repositorio contiene una cuantización GGUF de cuatro bits del modelo Swift 1.5 Qwen3.8 Flash-Next, publicada por el usuario jakeatx bajo el identificador `qwen3.8-flash-next-Swift1.5-ATX-AI4`. El modelo base, `ukisai/Swift1.5-Qwen3.8-Flash-Next`, es un modelo de generación de texto de aproximadamente 177.000 millones de parámetros que combina la familia Qwen3.8 con el ajuste Swift 1.5 y un esquema de expertos Flash-Next con decodificación especulativa mediante MTP (multi-token prediction). La aportación de este repositorio no es el modelo en sí, sino un formato de pesos propietario denominado AI4, diseñado por el autor para ejecutar el modelo en tarjetas de la serie RTX 30 con 24 GB de VRAM.

El interés técnico reside en el formato de compresión: los pesos de los expertos emplean un layout de cuatro bits con escala por fila (AIT4_U2, tipo 124) y algunas capas usan tres bits (AIT3_U2, tipo 123), mientras que los pesos siempre activos conservan mayor precisión siguiendo la receta UD de Unsloth. El resultado ocupa 84,97 GiB, unos 2,27 GiB menos que la cuantización UD-IQ4_XS equivalente, y requiere un fork específico del runtime (llamAmpere v0.6.3.6 o superior), por lo que no carga en llama.cpp estándar. Es, por tanto, un artefacto muy especializado, orientado a un hardware concreto y a usuarios dispuestos a compilar su propio servidor.

La relevancia es limitada pero clara para su nicho: demuestra que es posible servir un modelo de ~177B parámetros con decodificación especulativa en una única GPU consumer de 24 GB, a costa de un consumo de RAM del sistema elevado (entre 58,6 y 75,3 GiB en las pruebas del autor) y de una dependencia fuerte de un runtime no oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con expertos (Flash-Next) y cabecera MTP para decodificación especulativa; detalles completos de la arquitectura del modelo base no disponibles |
| Parametros totales | 176.943.899.520 (~177B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las pruebas del autor usan prompts de 100K tokens) |
| Tipos de cuantizacion | AI4: expertos en AIT4_U2 (4 bits, escala por fila, tipo 124) y algunas capas en AIT3_U2 (3 bits, tipo 123); pesos siempre activos en mayor precisión según receta UD de Unsloth. Existe también un archivo AI3 mencionado en la model card |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0, sobre Qwen Community License 1.0 |
| Formato de pesos | GGUF dividido en dos archivos (00001-of-00002 y 00002-of-00002), más un drafter GGUF separado |

## Arquitectura y entrenamiento

El modelo base es un transformer de gran escala con un esquema de expertos denominado Flash-Next, del que no se detallan en la información disponible el número de expertos, el ratio de activación ni la composición del dataset de entrenamiento. La model card sí confirma la presencia de una cabecera MTP (multi-token prediction) que se usa como drafter para decodificación especulativa: el repositorio publica un archivo separado, `mtp-Swift-Qwen3.8-Flash-Next-GSQ-RCO-Q2S-B.gguf` (1,52 GB), que el servidor carga junto al modelo principal para acelerar la generación.

La innovación principal de esta publicación es el formato de cuantización AI4, con dos variantes de layout por fila (AIT4_U2 y AIT3_U2) aplicadas selectivamente a los expertos, mientras los pesos densos mantienen precisión superior. El autor reporta una divergencia KL de 0,068353 ± 0,005316 frente a la referencia Swift-Q8 sobre 2.286 posiciones en 18 fragmentos, con coincidencia en la elección top en 2.078 de 2.286 posiciones, frente a 0,080886 ± 0,006894 y 2.063 de 2.286 para UD-IQ4_XS. También comprobó que el cálculo de expertos en CPU (CPU split) no altera de forma medible la calidad: 0,040431 con split desactivado frente a 0,041133 activado sobre 381 posiciones. No se dispone de información sobre el proceso de alineación (RLHF, DPO) del modelo base.

## Capacidades

- Generación de texto conversacional y de formato largo, con soporte de prompts de hasta 100K tokens en las pruebas del autor.
- Razonamiento y escritura de código, evaluados en las pruebas de velocidad con tareas de coding.
- Flujos agénticos: la model card incluye una prueba específica de tarea agentic con 5.120 tokens generados.
- Recuperación aumentada (RAG): probado explícitamente con prompts largos de 100K tokens.
- Decodificación especulativa mediante drafter MTP, que acelera la generación a costa de algo de velocidad de preprocesado del prompt.
- Servidor compatible con la API de OpenAI (`llama-server` en el puerto 8080), lo que facilita la integración con clientes existentes.
- Capacidades multilingües: no disponibles.
- Tool calling, function calling, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes de código en estaciones de trabajo con RTX 3090: el modelo genera a unas 100 tok/s en tareas de coding según las pruebas del autor, suficiente para autocompletado interactivo y revisión de parches en local sin depender de la nube.
- Agentes autónomos de un solo paso largo: con 100K tokens de contexto y 100,77 tok/s en tareas agentic, puede sostener bucles de razonamiento y llamadas a herramientas dentro de una sesión sin truncar el historial.
- RAG sobre documentación extensa: los 100K tokens de prompt permiten inyectar varios documentos completos; el autor midió 2.732 tok/s de preprocesado y 102 tok/s de generación en esta tarea.
- Procesamiento por lotes de resúmenes y análisis de contratos o informes largos en una máquina con 89 GiB de RAM y una GPU de 24 GB, aprovechando el reparto de expertos entre VRAM y RAM.
- Evaluación e investigación de técnicas de cuantización: el repositorio incluye métricas de divergencia KL y comparaciones con UD-IQ4_XS que sirven para estudiar el impacto de layouts de 3 y 4 bits en modelos de gran escala.
- Despliegue de un endpoint compatible con OpenAI en una estación local para prototipado de aplicaciones que luego se migrarán a infraestructura mayor, gracias a que `llama-server` expone la API estándar.
- Experimentación con decodificación especulativa MTP: el drafter separado y el flag `--exact` del lanzador permiten comparar modos de drafting sesgado frente a drafting exacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K) en la información disponible. Los datos publicados son de fidelidad de cuantización y de velocidad.

Fidelidad frente a la referencia Swift-Q8 (2.286 posiciones en 18 fragmentos, menor KL es mejor):

| Modelo | Tamano | KL | Coincidencia top |
|---|---|---|---|
| Este modelo (AI4) | 84,97 GiB | 0,068353 ± 0,005316 | 2.078 / 2.286 |
| UD-IQ4_XS | 87,24 GiB | 0,080886 ± 0,006894 | 2.063 / 2.286 |

Velocidad en RTX 3090 a 350 W, prompt de 100K tokens, 5.120 tokens generados, temperatura 1.0, una semilla por tarea:

| Tarea | Generación tok/s (UD-IQ4_XS -> AI4) | Prompt tok/s (UD-IQ4_XS -> AI4) |
|---|---|---|
| Coding | 86,58 -> 99,91 (+15,4%) | 2.953,5 -> 2.484,1 (-15,9%) |
| Agentic | 82,50 -> 100,77 (+22,2%) | 2.872,3 -> 2.706,8 (-5,8%) |
| RAG | 85,38 -> 102,05 (+19,5%) | 2.884,4 -> 2.732,1 (-5,3%) |

El autor advierte que son mediciones de una sola pasada y una sola semilla, no resultados multi-semilla con potencia estadística.

## Requisitos de hardware

- VRAM: el modelo está diseñado para caber en 24 GB; todas las pruebas se mantuvieron por debajo de 23.552 MiB en la tarjeta.
- RAM del sistema: probado únicamente en una máquina con 89 GiB; el pico de uso del servidor fue de 58,6 a 75,3 GiB, manteniendo al menos 26 GiB libres. No recomendado en equipos de 64 GB salvo que se fijen muchos expertos en GPU y se muevan las copias de respaldo fuera de VRAM; en ese caso, el autor sugiere el archivo AI3.
- GPU: RTX 3090 (sm_86) a 350 W es el hardware de referencia. El runtime se compila con `-DCMAKE_CUDA_ARCHITECTURES=86`, por lo que el soporte está orientado a la serie RTX 30.
- Disco: 91,23 GB para el modelo, más 1,52 GB del drafter.
- Runtime: obligatorio llamAmpere v0.6.3.6 o superior; no carga en llama.cpp estándar ni en versiones anteriores de llamAmpere.
- Despliegue: `llama-server` del fork llamAmpere, con el script `scripts/flash-next-server.sh` y la variable `FLASH_NEXT_DRAFTER` apuntando al drafter; expone API compatible con OpenAI en `http://127.0.0.1:8080`. El flag `--exact` desactiva el drafting sesgado por modo.
- Throughput: aproximadamente 100 tok/s de generación y 2.500-2.730 tok/s de preprocesado en RTX 3090 con prompts de 100K tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (AI4) | ~177B | no disponible (probado a 100K) | 84,97 GiB + 1,52 GB drafter | Swift Open License 1.0 + Qwen Community License 1.0 | GGUF en Hugging Face, requiere llamAmpere |
| UD-IQ4_XS del mismo base | ~177B | no disponible | 87,24 GiB | misma licencia del base | GGUF estándar, ejecutable en llama.cpp |
| Swift-Q8 (referencia del autor) | ~177B | no disponible | no disponible | misma licencia del base | no disponible en detalle |

La comparación con modelos de otras familias y tamaños similares no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Dependencia de un runtime no oficial: el archivo no carga en llama.cpp estándar; requiere compilar llamAmpere v0.6.3.6 o superior, lo que añade fricción de mantenimiento y riesgo de quedar atado a un fork.
- Consumo de RAM elevado: entre 58,6 y 75,3 GiB en el hardware de prueba; en máquinas de 64 GB puede provocar swapping o fallos si no se ajusta el reparto de expertos.
- Las métricas de calidad publicadas son de divergencia KL frente a una referencia Q8, no de precisión en tareas; el propio autor advierte que no se deduce ninguna afirmación de exactitud en tareas.
- Las mediciones de velocidad son de una sola semilla y una sola pasada, por lo que la variabilidad entre ejecuciones puede ser significativa.
- La decodificación especulativa con el drafter reduce la velocidad de preprocesado del prompt entre un 5,3% y un 15,9% en las pruebas, lo que penaliza cargas con prompts muy largos y poca generación.
- Licencia compuesta: Swift Open License v1.0 sobre Qwen Community License 1.0; es necesario revisar ambas antes de un uso comercial, y la información disponible no detalla restricciones concretas.
- Idiomas soportados no documentados; no se puede asumir un rendimiento multilingüe homogéneo.
- Sesgos y riesgo de alucinación: no documentados en la información disponible, pero aplican los del modelo base, no evaluados aquí.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jakeatx/qwen3.8-flash-next-Swift1.5-ATX-AI4
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Drafter MTP: https://huggingface.co/jakeatx/Swift-1.5-Qwen3.8-Flash-Next-MTP-Drafter-GGUF
- Runtime llamAmpere v0.6.3.6: https://github.com/JakeATX/llamAmpere/releases/tag/v0.6.3.6
- Repositorio llamAmpere: https://github.com/JakeATX/llamAmpere
