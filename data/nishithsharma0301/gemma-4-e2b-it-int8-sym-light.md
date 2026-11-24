# nishithsharma0301/gemma-4-E2B-it-int8-sym-light

## Resumen

Gemma 4 E2B-it es un modelo de lenguaje de Google (familia Gemma 4, variante E2B, ajustada para instrucciones) distribuido originalmente en formato abierto. Esta ficha concreta documenta una conversión comunitaria publicada por el usuario `nishithsharma0301`: un export a formato OpenVINO IR con los pesos del modelo de lenguaje cuantizados a INT8 simétrico por canal, pensado específicamente para ejecutarse en las NPU integradas de los procesadores Intel Core Ultra.

La conversión parte del export oficial de Intel `OpenVINO/gemma-4-E2B-it-fp16-ov` (a su vez derivado de `google/gemma-4-E2B-it`) y aplica compresión con NNCF 3.4.0 sobre OpenVINO 2026.5.0rc2, de forma determinista y sin datos de calibración (*data-free*). El resultado conserva únicamente los ficheros de texto del modelo: se eliminan las partes de visión y audio presentes en el modelo original.

Su relevancia práctica es acotada pero concreta: ofrece un artefacto reproducible y verificado por hash para desplegar un modelo conversacional de la familia Gemma 4 en hardware de consumo Intel con NPU, sin GPU dedicada. El repositorio ocupa 7,8 GB y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, variante E2B); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | no disponible (la nomenclatura E2B sugiere una variante eficiente de ~2B, pero no se confirma en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | 8.192 tokens de prompt + 2.048 tokens de respuesta (configuracion de ejecucion del host, no limite arquitectonico declarado) |
| Tipos de cuantizacion | INT8 simetrico por canal (pesos del modelo de lenguaje); resto de ficheros en el formato del export base (fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), libreria `openvino` |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia Gemma 4 de Google, en su variante E2B ajustada para instrucciones. La informacion proporcionada no detalla la arquitectura interna (número de capas, dimensiones, mecanismo de atención, posible naturaleza Mixture-of-Experts o híbrida) ni los datos de entrenamiento (volumen de tokens, composición del corpus, uso de RLHF o DPO). Todo ello debe consultarse en la model card del modelo original `google/gemma-4-E2B-it`.

La innovación técnica de esta ficha no está en el entrenamiento, sino en el proceso de conversión y despliegue. Los pesos del modelo de lenguaje se comprimen a INT8 simétrico por canal mediante NNCF 3.4.0 en modo *data-free* y determinista, sobre OpenVINO 2026.5.0rc2. El build es reproducible y verificable mediante SHA-256 de los dos ficheros principales (`openvino_language_model.bin`: `7f7ffc5a77790c10a9636cec40a218c7757b100dc6376358107f68feed71d211`; `openvino_language_model.xml`: `3bf5e2cdddb57744d527e1843dee1a5e0eb14862faee6c31d677d25bc60d8523`). La ejecución se realiza a través del modo NPUW LLM de OpenVINO, con `NPUW_LLM_GENERATE_HINT=BEST_PERF`, y la NPU compila el modelo en la primera carga. Se han eliminado los componentes de visión y audio, por lo que el artefacto es estrictamente de texto.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones, heredadas del ajuste *it* del modelo base.
- Generación de texto en modalidad exclusivamente textual: sin visión ni audio en este export.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponible en la informacion proporcionada (los idiomas no se declaran en la ficha del repositorio).
- Modo *thinking* u otras capacidades especiales: no disponible en la informacion proporcionada.
- Ejecución en NPU Intel mediante OpenVINO NPUW, con salas de prompt y respuesta predefinidas.

## Casos de uso

- Asistente conversacional local en portátiles Intel Core Ultra: el modelo se compila en la NPU en la primera carga y permite mantener diálogos multi-turno sin GPU dedicada, aprovechando la ventana de 8.192 tokens de prompt para conservar historial extenso.
- Procesamiento de texto en *endpoints* sin acelerador gráfico: al ejecutarse sobre la NPU integrada, deja la CPU y la iGPU libres para otras tareas del sistema, lo que resulta adecuado para aplicaciones de escritorio que necesitan generación de texto en segundo plano.
- Resumen y reescritura de documentos de longitud media: la ventana de prompt de 8.192 tokens permite ingerir artículos, correos o informes completos y generar resúmenes de hasta 2.048 tokens en una sola pasada.
- Clasificación y extracción de información en pipelines por lotes: su naturaleza determinista en la conversión y su ejecución local permiten procesar grandes volúmenes de texto sin depender de servicios en la nube ni de conectividad.
- Prototipado y evaluación de modelos Gemma 4 en hardware Intel: sirve como artefacto reproducible (hashes publicados) para comparar el rendimiento de INT8 frente al export fp16 oficial en la misma NPU.
- Aplicaciones de privacidad estricta: al ejecutarse íntegramente en local, es apto para entornos donde los datos no pueden salir del dispositivo, como documentación interna o asistencia a empleados en equipos corporativos.
- Generación asistida en herramientas de escritorio: integrable en editores o clientes de correo que requieran sugerencias de texto con baja dependencia de infraestructura externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en el escenario objetivo; el modelo está diseñado para ejecutarse en la NPU integrada de procesadores Intel Core Ultra. El repositorio ocupa 7,8 GB en disco.
- GPU recomendadas: no disponible. El artefacto está orientado a NPU Intel, no a GPU dedicadas.
- Compatibilidad con GPU de consumo: no disponible; no se documenta su ejecución en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: OpenVINO con el modo NPUW LLM (requisito declarado), con `NPUW_LLM_GENERATE_HINT=BEST_PERF`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La configuración fija de 8.192 tokens de prompt y 2.048 de respuesta condiciona el uso, pero no se publican cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| nishithsharma0301/gemma-4-E2B-it-int8-sym-light | no disponible | 8.192 + 2.048 (config. de ejecucion) | OpenVINO IR INT8 | Apache 2.0 | Solo texto; optimizado para NPU Intel |
| OpenVINO/gemma-4-E2B-it-fp16-ov | no disponible | no disponible | OpenVINO IR fp16 | Apache 2.0 | Export oficial de Intel; incluye componentes multimodales |
| google/gemma-4-E2B-it | no disponible | no disponible | safetensors (original) | Apache 2.0 | Modelo original de Google; vision y audio incluidos |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El artefacto es exclusivamente de texto: se han eliminado visión y audio, por lo que no puede procesar imágenes ni audio aunque el modelo original sí pudiera.
- La ventana efectiva está limitada por la configuración del host (8.192 tokens de prompt y 2.048 de respuesta), no necesariamente por el límite arquitectónico del modelo.
- El proceso de cuantización INT8 es *data-free*, sin calibración con datos reales; puede degradar la calidad respecto al export fp16 en tareas sensibles, aunque no se han publicado mediciones al respecto.
- Requiere hardware Intel con NPU (Core Ultra) y OpenVINO 2026.5.0rc2 o compatible; no es portable a otros *runtimes* sin conversión adicional.
- La compilación en la NPU en la primera carga añade latencia inicial.
- Riesgo de alucinación y sesgos: no documentados en la informacion proporcionada; deben evaluarse a partir de la model card del modelo original de Google.
- Idiomas soportados no declarados: conviene verificar el comportamiento multilingüe antes de usarlo en producción en castellano u otros idiomas.
- Licencia Apache 2.0, que permite uso comercial; aun así, deben respetarse las condiciones de la licencia del modelo base de Google.
- Repositorio sin descargas ni validación comunitaria en el momento de la ficha; se recomienda verificar los hashes SHA-256 publicados antes de desplegarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nishithsharma0301/gemma-4-E2B-it-int8-sym-light
- Export base de Intel: https://huggingface.co/OpenVINO/gemma-4-E2B-it-fp16-ov
- Modelo original de Google: https://huggingface.co/google/gemma-4-E2B-it
