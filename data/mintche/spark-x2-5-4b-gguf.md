# Mintche/Spark-X2.5-4B-GGUF

## Resumen

Spark-X2.5-4B es un modelo de lenguaje compacto de propósito general desarrollado por XHToken (SparkLLM), diseñado para ofrecer capacidades sólidas en conversación, escritura, traducción, razonamiento, generación de código, uso de herramientas y flujos agénticos. Con 4.112 millones de parámetros, el modelo base soporta una ventana de contexto nativa de hasta 1 millón de tokens y cubre más de 200 idiomas, lo que lo sitúa como una opción atractiva para despliegues en entornos con recursos limitados.

Esta ficha se centra en la cuantización GGUF publicada por Mintche, una versión experimental v0.1 que convierte el modelo base a los formatos Q6_K y Q8_0 mediante llama.cpp. El objetivo es permitir la ejecución del modelo en hardware de consumo, manteniendo una fidelidad alta respecto al original en BF16. Las métricas de fidelidad publicadas muestran una degradación mínima en la distribución de probabilidades, con un acuerdo top-1 superior al 95 % en las pruebas realizadas a 4K y 16K de contexto.

La relevancia de esta cuantización radica en que democratiza el acceso a un modelo con capacidades agénticas y multilingües en GPUs de gama media, sin necesidad de infraestructura de servidor. Es una opción práctica para desarrolladores que buscan un modelo pequeño pero capaz, con licencia Apache 2.0 y soporte para herramientas y agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.000.000 tokens (nativo, segun documentacion del modelo base); la cuantizacion se evaluo a 4K y 16K |
| Tipos de cuantizacion | Q6_K (con iMatrix mixta 4K+16K), Q8_0 |
| Idiomas soportados | mas de 200 (segun documentacion del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base (tipo de transformer, atencion, etc.) ni sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO). La documentacion oficial de XHToken indica que Spark-X2.5-4B es un modelo compacto de proposito general, pero no se publican especificaciones tecnicas adicionales en las fuentes consultadas.

La cuantizacion GGUF fue realizada por Mintche a partir del modelo base en BF16, utilizando llama.cpp con soporte para la arquitectura Spark2.5 (commit `fe158c6c4db8b0cb8d74c7cfe23401f7c21a45fe`, build 10668). El proceso incluyo calibracion con iMatrix mixta: 2.022.075 tokens de Spark a contexto 4K y 279.736 tokens a contexto 16K, con observaciones fusionadas por tensor (aproximadamente 88 % de la pasada 4K y 12 % de la 16K). La cuantizacion Q6_K se realizo directamente desde BF16, sin requantizacion intermedia.

## Capacidades

- Generacion de texto conversacional y escritura creativa o tecnica.
- Traduccion automatica entre mas de 200 idiomas.
- Razonamiento logico y matematico basico.
- Generacion de codigo en multiples lenguajes de programacion.
- Soporte de tool calling / function calling para integracion con APIs y servicios externos.
- Capacidad para flujos agénticos y razonamiento multi-paso.
- Ventana de contexto nativa de hasta 1 millon de tokens, adecuada para documentos extensos y conversaciones largas.
- Soporte multilingue amplio, incluyendo lenguas minoritarias.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 1M tokens), lo que permite mantener el historial completo de una interaccion sin truncamientos. Su capacidad multilingue facilita atender a clientes en distintos idiomas.
- Generacion de codigo en produccion: con soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests o documentar APIs. Su tamano compacto permite ejecutarlo en entornos de desarrollo locales.
- Traduccion de documentos extensos: gracias a su ventana de contexto amplia, puede traducir informes, manuales o contratos completos sin necesidad de dividirlos en fragmentos, manteniendo coherencia terminologica.
- Asistentes agénticos para automatizacion de tareas: el modelo puede orquestar llamadas a herramientas (calendarios, correos, bases de datos) y ejecutar secuencias de acciones de forma autonoma, adecuado para asistentes personales o de oficina.
- Analisis y resumen de documentos legales o academicos: su contexto largo permite procesar articulos, sentencias o papers completos y generar resumenes estructurados o extraer puntos clave.
- Chatbots educativos multilingues: puede actuar como tutor en diferentes idiomas, respondiendo preguntas de matematicas, ciencias o historia con razonamiento paso a paso, gracias a su capacidad de razonamiento y generacion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card de la cuantizacion GGUF incluye metricas de fidelidad de cuantizacion, que comparan las versiones cuantizadas contra la referencia BF16. Estas metricas no son benchmarks de capacidad del modelo, sino de degradacion introducida por la cuantizacion.

### Fidelidad de cuantizacion a contexto 4K

| Modelo | KLD medio ↓ | q99 KLD ↓ | q99.9 KLD ↓ | RMS Δp ↓ | Same top p ↑ | PPL(Q) |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (autocontrol) | 0.000000 | 0.000036 | 0.000049 | 0.001 % | 100.000 % | 6.910707 |
| Q8_0 | 0.001354 | 0.011297 | 0.073939 | 1.275 % | 98.192 % | 6.906721 |
| Q6_K sin iMatrix | 0.013738 | 0.105705 | 1.387995 | 4.127 % | 94.919 % | 7.035107 |
| Q6_K con iMatrix 4K | 0.010021 | 0.064892 | 1.252379 | 3.950 % | 95.896 % | 6.977921 |
| Q6_K con iMatrix mixta 4K+16K | 0.008930 | 0.070500 | 0.778783 | 3.599 % | 95.774 % | 6.975759 |

### Fidelidad de cuantizacion a contexto 16K

| Modelo | KLD medio ↓ | q99 KLD ↓ | q99.9 KLD ↓ | Max KLD ↓ | RMS Δp ↓ | Same top p ↑ | PPL(Q) |
|---|---:|---:|---:|---:|---:|---:|---:|
| BF16 (autocontrol) | 0.000000 | 0.000035 | 0.000050 | 0.000063 | 0.001 % | 100.000 % | 8.565097 |
| Q8_0 | 0.002709 | 0.015888 | 0.217027 | 3.244917 | 1.703 % | 98.089 % | 8.550264 |
| Q6_K sin iMatrix | 0.021932 | 0.178709 | 1.397083 | 5.835053 | 4.680 % | 93.926 % | 8.918584 |
| Q6_K con iMatrix 4K | 0.010021 | 0.074524 | 0.468998 | 2.875325 | 3.012 % | 95.483 % | 8.666384 |
| Q6_K con iMatrix mixta 4K+16K | 0.009891 | 0.074419 | 0.451430 | 2.363686 | 3.035 % | 95.660 % | 8.660181 |

Estas mediciones fueron realizadas con el protocolo AtomicChat `eval_neutral` y estan etiquetadas como "quick2", utiles para seleccionar el candidato de cuantizacion, pero no sustituyen a una evaluacion completa de benchmarks.

## Requisitos de hardware

- Tamano de archivo: Q6_K ocupa 3.147 GiB; Q8_0 ocupa 4.075 GiB.
- VRAM estimada para inferencia: aproximadamente 4-5 GB para Q6_K y 5-6 GB para Q8_0, incluyendo overhead de contexto y buffers. Cabe en GPUs consumer de 8 GB o mas.
- GPUs recomendadas: RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070, o equivalentes de AMD con suficiente VRAM. Para contexto largo (16K o superior), se recomienda al menos 8 GB de VRAM.
- Opciones de despliegue: llama.cpp (build con soporte `spark2_5`), Ollama (disponible en la pagina oficial de Ollama), y cualquier runtime compatible con GGUF. vLLM puede no soportar aun esta arquitectura.
- Latencia y throughput: no disponible. Depende del hardware y de la longitud de contexto. En una RTX 3060, se espera una velocidad de generacion de decenas de tokens por segundo para contexto corto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de tamano similar. A continuacion se presenta una comparacion cualitativa basada en parametros, contexto y licencia, sin datos de rendimiento.

| Modelo | Parametros | Contexto nativo | Licencia | Formato disponible |
|---|---|---|---|---|
| Spark-X2.5-4B | 4.1B | 1M tokens | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-4B | 4.0B | 128K tokens | Apache 2.0 | GGUF, safetensors |
| Llama-3.2-3B | 3.2B | 128K tokens | Llama 3.2 Community License | GGUF, safetensors |

Spark-X2.5-4B destaca por su contexto nativo de 1M tokens, muy superior a los 128K de Qwen2.5-4B y Llama-3.2-3B, y por su licencia Apache 2.0, que permite uso comercial sin restricciones. Sin embargo, no se han publicado resultados de benchmarks que permitan comparar su rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Al ser un modelo de 4B parametros, puede presentar alucinaciones y errores en tareas de razonamiento complejo o conocimiento especializado.
- La cuantizacion Q6_K introduce una degradacion medible en la fidelidad (KLD medio de 0.0089 a 4K y 0.0099 a 16K), aunque el acuerdo top-1 se mantiene por encima del 95 %.
- La cuantizacion requiere una build de llama.cpp con soporte `spark2_5` (commit `fe158c6c4db8b0cb8d74c7cfe23401f7c21a45fe` o posterior). Builds antiguas no podran cargar el modelo.
- No se ha publicado informacion sobre sesgos eticos o de genero del modelo base.
- La ventana de contexto de 1M tokens es nativa del modelo base, pero la cuantizacion GGUF solo se ha evaluado hasta 16K; el rendimiento a contextos mayores no esta verificado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener limitaciones adicionales no documentadas en las fuentes consultadas.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/Mintche/Spark-X2.5-4B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/XHToken/Spark-X2.5-4B
- Repositorio GitHub de Spark-X2.5: https://github.com/XHToken/Spark-X2.5
- Pagina en ModelScope: https://www.modelscope.cn/models/XHToken/Spark-X2.5-4B
- Pagina en Ollama: https://ollama.com/SparkLLM/Spark-X2.5-4B:latest
