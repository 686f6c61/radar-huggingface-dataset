# kaban-baku/Qwen3.8-Flash-Next-UD-IQ1_M-Fast-GGUF

## Resumen

Qwen3.8-Flash-Next-UD-IQ1_M-Fast es una cuantizacion GGUF derivada del modelo Qwen3.8-Flash-Next de Qwen, publicada por el usuario kaban-baku. No se trata de un modelo entrenado desde cero, sino de una reempaquetado de pesos: parte de la cuantizacion UD-IQ1_M (Dynamic v3.1) de Unsloth y sustituye 300 matrices densas no pertenecientes a los expertos (atencion, salida del SSM, expertos compartidos) por las equivalentes del fichero GSQ-RCO IQ2_XS de ISTA-DASLab, cuantizadas mayoritariamente a IQ4_XS. El objetivo es reducir el espacio ocupado por esas matrices en VRAM para dejar mas hueco a los expertos en cache, mejorando el rendimiento en GPUs de 8 GB.

El modelo conserva los 512 expertos del original, el router, la cabeza de salida, las hiperconexiones y el modulo PLE de Unsloth, y es compatible con el motor Strata 0.2.11 o superior sin necesidad de parches. La arquitectura subyacente es un transformer con mezcla de expertos (MoE) e integracion de capas SSM, con parametros totales no disponibles en la informacion proporcionada.

Su relevancia es practica: demuestra que es posible ejecutar un modelo MoE de gran tamano en hardware de consumo modesto (8 GB de VRAM) manteniendo la calidad casi intacta respecto a la cuantizacion original, a costa de una velocidad de decodificacion superior (56 tok/s frente a 47,7 tok/s) y de un ligero cambio en la distribucion de salida, especialmente en japones de formato largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas SSM e hiperconexiones (base Qwen3.8-Flash-Next) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE con 512 expertos) |
| Longitud de contexto | 128K (evaluado); 64K en configuracion de 4 GB |
| Tipos de cuantizacion | GGUF IQ1_M (expertos) + IQ4_XS/Q5_K/Q8_0 (matrices densas) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | GGUF (3 ficheros, ~67,1 GB en total) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.8-Flash-Next combina un transformer con mezcla de expertos (MoE) de 512 expertos, capas de espacio de estados (SSM) y mecanismos de hiperconexion, segun se deduce de los componentes mencionados en la model card (expertos, router, SSM output, hyper-connections, PLE). No se dispone de informacion sobre el numero total de parametros ni sobre los parametros activos por token.

Esta ficha no entrena ningun modelo: es una cuantizacion post-entrenamiento. El proceso de creacion consistio en copiar los bytes cuantizados de 300 matrices densas desde el fichero GSQ-RCO IQ2_XS de ISTA-DASLab (mayoritariamente IQ4_XS, 1,4 GiB) al fichero UD-IQ1_M de Unsloth, verificando nombres y formas sin recuantizar. Los expertos, el router, la cabeza de salida, las hiperconexiones y el PLE se mantienen de Unsloth. El resultado ocupa 2,3 GiB en matrices densas frente a los 2,3 GiB originales, pero con una distribucion de cuantizacion mas ligera que libera VRAM para la cache de expertos. No se dispone de informacion sobre el dataset de entrenamiento original ni sobre el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento en japones e ingles.
- Generacion de codigo: evaluado con HumanEval (93,3%) y MBPP (86,4%).
- Conocimiento en japones: evaluado con JamC-QA (64,7%).
- Tool calling / function calling: evaluado con tool-eval-bench (86 sobre 69 escenarios).
- Modo thinking: soportado por el modelo base, aunque con advertencias sobre bucles repetitivos en esta cuantizacion.
- Capacidades multilingues limitadas a japones e ingles segun la model card.
- No se mencionan capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Despliegue en GPUs de consumo de 8 GB: el modelo cabe en una RTX 3070 Ti Laptop con 64 GB de RAM y ofrece 56 tok/s de decodificacion, lo que permite ejecutar un MoE de gran tamano en hardware asequible.
- Asistencia de codigo en local: con HumanEval al 93,3% y soporte de tool calling, puede integrarse en editores o pipelines de CI/CD para autocompletado y generacion de pruebas en entornos sin conexion.
- Procesamiento de documentos largos en japones: la ventana de 128K tokens permite resumir o extraer informacion de contratos y manuales tecnicos en japones, con la cautela de que la escritura larga puede diferir de la cuantizacion original.
- Atencion al cliente automatizada en japones e ingles: el modelo gestiona conversaciones multi-turno con contexto largo y tool calling para consultar APIs o bases de datos.
- Evaluacion de agentes y tool calling: con 86 puntos en tool-eval-bench, es util para probar flujos de agentes multi-paso en local antes de desplegar en produccion.
- Experimentacion e investigacion en cuantizacion: sirve como caso de estudio de como el intercambio de matrices densas afecta a la velocidad y a la calidad en modelos MoE.
- Inferencia en equipos con 4 GB de VRAM: mediante el parche de cabeza de salida en CPU, alcanza 28,4 tok/s con 40 GB de RAM, permitiendo usar el modelo en portatiles modestos.

## Benchmarks y rendimiento

Resultados medidos en RTX 3070 Ti Laptop 8 GB, 64 GB RAM, Windows 11, contexto 128K, MTP activado, sin thinking, temperatura 0.

| Benchmark | IQ3_S (512, ISTA-DASLab) | UD-IQ1_M (512) | UD-IQ1_M-Fast |
|---|---:|---:|---:|
| JamC-QA (748, japones, 4 opciones) | 65,9% | 63,5% | 64,7% |
| HumanEval (164) | 92,7% | 93,9% | 93,3% |
| MBPP (257) | 87,9% | 89,1% | 86,4% |
| ELYZA-tasks-100 (sobre 5) | 3,99 | 3,76 | 3,70 |
| tool-eval-bench (69 escenarios) | 89 | 85 | 86 |

| Rendimiento | IQ3_S | UD-IQ1_M | UD-IQ1_M-Fast |
|---|---:|---:|---:|
| Slots de expertos en VRAM / tasa de acierto | 421 / 68% | 570 / 75% | 1102 / 88% |
| Decodificacion, Strata 0.2.12 (tok/s) | 20,5 | 47,7 | 56,0 (+17%) |
| Decodificacion, build basada en 0.2.11 (tok/s) | 21,3 | 47,4 | 57,5 (+21%) |

En configuracion de 4 GB (3.584 MiB libres, contexto 64K, MTP desactivado, kv q4_0): 15,5 tok/s con Strata 0.2.12 y 28,4 tok/s con el parche de cabeza en CPU (presupuesto de RAM 40 GB).

## Requisitos de hardware

- VRAM estimada: 8 GB para el modelo completo con contexto de 128K; 3.584 MiB para la configuracion reducida de 64K.
- GPU recomendadas: RTX 3070 Ti Laptop 8 GB (probado); cualquier GPU con 8 GB o mas de VRAM.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB; con 4 GB requiere el parche de cabeza de salida en CPU.
- RAM: 64 GB recomendados; 40 GB viables con el parche; 24 GB con menor rendimiento.
- Opciones de despliegue: motor Strata 0.2.11 o superior (soporte de Unsloth Dynamic v3.1), con `iq_pack.py --compat-bf16` y arranque con `--native`. No se mencionan vLLM, llama.cpp ni Ollama en la informacion disponible.
- Latencia y throughput: 56 tok/s de decodificacion en 8 GB; 28,4 tok/s en 4 GB con parche; 15,5 tok/s en 4 GB sin parche.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (HumanEval) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UD-IQ1_M-Fast (este) | no disponible (MoE 512 expertos) | 128K | 93,3% | qwen-community-1.0 | GGUF, 3 ficheros |
| UD-IQ1_M (Unsloth) | no disponible (MoE 512 expertos) | 128K | 93,9% | qwen-community-1.0 | GGUF, repositorio Unsloth |
| IQ3_S (ISTA-DASLab) | no disponible (MoE 512 expertos) | 128K | 92,7% | qwen-community-1.0 | GGUF, repositorio ISTA-DASLab |

La comparativa se limita a las tres cuantizaciones del mismo modelo base evaluadas en la model card; no se dispone de datos de modelos alternativos de otros desarrolladores.

## Limitaciones y advertencias

- El intercambio de matrices densas altera la distribucion de salida; se espera que la escritura larga en japones difiera ligeramente de la cuantizacion original de Unsloth.
- En modo thinking, el modelo se quedo en bucles repetitivos hasta agotar el presupuesto en 16 de 30 preguntas, frente a 9 en el UD-IQ1_M original; la muestra es pequena y no concluyente.
- Los resultados de ELYZA solo son comparables dentro de la tabla de la model card.
- Idiomas limitados a japones e ingles; no se garantiza un rendimiento adecuado en castellano.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- La licencia Qwen Community License 1.0 puede imponer restricciones al uso comercial; es necesario revisar el fichero LICENSE.
- Requiere el motor Strata 0.2.11 o superior; no se garantiza compatibilidad con otros runners GGUF.
- El tercer fichero del repositorio no esta incluido: debe descargarse del repositorio de Unsloth y renombrarse.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kaban-baku/Qwen3.8-Flash-Next-UD-IQ1_M-Fast-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantizacion de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Cuantizacion GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Scripts de creacion y evaluacion: https://github.com/kaban-baku/Qwen3.8-Flash-Next-IQ3_S-384Exp
- Parche de cabeza en CPU para Strata: https://github.com/kaban-baku/strata-patches/tree/main/cpu-head
