# drofn/SenseNova-Loop-9B-8GB-v2-GGUF

## Resumen

SenseNova-Loop-9B-8GB-v2-GGUF es una cuantizacion GGUF del modelo SenseNova-Loop-9B, desarrollada por el usuario drofn y publicada en Hugging Face. El modelo base, obra de SenseNova, es un transformer con arquitectura de bucles (looped transformer) de 9.200 millones de parametros, disenado para generacion de texto y comprension de imagenes en modalidad image-text-to-text. Esta version concreta resuelve el problema de ejecutar un modelo de 9B con contexto muy largo en GPUs de consumo con solo 8 GB de VRAM, mediante mezclas de cuantizacion asignadas por sensibilidad y una cabeza de prediccion multi-token (MTP) que acelera la decodificacion.

La version v2 anade dos novedades respecto a la v1: la inclusion de la cabeza MTP (15 tensores, unos 208 MB) que permite decodificacion especulativa con `--spec-type draft-mtp`, y un fichero opcional con capacidad de vision (`8GB-v2-Vision`) que, junto al proyector mmproj oficial de 0,92 GB, permite procesar imagenes manteniendo 81.920 tokens de contexto en la misma tarjeta. El fichero solo texto alcanza 104.448 tokens de contexto.

El modelo es relevante porque demuestra que es posible desplegar un modelo multimodal de 9B con ventanas de contexto superiores a 100.000 tokens en hardware de gama media (RTX 4060 8 GB), con velocidades de generacion de 47,8 tok/s en texto y 53,5 tok/s en vision gracias a MTP, y con una tasa de aceptacion de borradores del 71,9-74,1%. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer) y cabeza MTP para decodificacion especulativa |
| Parametros totales | 9.200.240.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 104.448 tokens (fichero solo texto); 81.920 tokens (fichero Vision con mmproj) |
| Tipos de cuantizacion | Mezclas por sensibilidad (no es una cuantizacion uniforme); pesos MTP en Q6_K, `eh_proj` en Q8_0, normas en F32; cache KV en q4_0; escalera completa Q8_0 a IQ2_XS disponible en repo separado |
| Idiomas soportados | en, zh, tr |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura de transformer con bucles, en la que el mismo bloque se reaplica varias veces para incrementar la profundidad efectiva sin aumentar proporcionalmente el numero de parametros. Esta version GGUF conserva los pesos cuantizados del modelo original y anade la cabeza MTP, un pequeno bloque decodificador adicional que genera borradores de tokens que el modelo principal verifica en un solo lote. La cabeza MTP consta de 15 tensores con matrices de pesos en Q6_K, proyeccion `eh_proj` en Q8_0 y normas en F32, sumando aproximadamente 208 MB.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La cuantizacion se realizo con asignacion de sensibilidad por tensor (sensitivity-allocated mixes) en lugar de una cuantizacion uniforme, lo que permite mantener mayor fidelidad en las capas mas sensibles. Los valores de divergencia KL respecto a Q8_0 son de 0,0703 y 0,0762 (conjuntos 1 y 2) para el fichero solo texto, y de 0,1375 y 0,1213 para el fichero Vision.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto muy largo (hasta 104.448 tokens en el fichero solo texto).
- Comprension de imagenes en modalidad image-text-to-text mediante el proyector mmproj oficial (fichero 8GB-v2-Vision).
- Decodificacion especulativa con cabeza MTP, que acelera la generacion aproximadamente 1,85x (de 25,9 a 47,8 tok/s en texto; de 28,4 a 53,5 tok/s en vision).
- Generacion de codigo: el modelo fue evaluado generando funciones Python y tests de pytest.
- Razonamiento sobre textos largos: recuperacion de hechos distribuidos en contextos de mas de 100.000 tokens (3/3 hechos encontrados en las pruebas).
- Soporte multilingue en ingles, chino y turco.
- Capacidad de thinking mode (mencionada en la configuracion de las pruebas, con opcion de desactivarlo).
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Analisis de documentos extensos: el modelo puede procesar contratos, informes o articulos de hasta 104.448 tokens en una sola pasada, extrayendo hechos concretos distribuidos a lo largo del texto, como demuestra la prueba de recuperacion de 3/3 hechos en 102.903 tokens.
- Generacion de codigo en local: con 47,8 tok/s en una RTX 4060, es viable integrarlo en editores o pipelines de desarrollo para autocompletar funciones y generar tests unitarios de pytest, sin depender de APIs externas.
- Asistencia con imagenes en hardware de consumo: el fichero Vision permite enviar capturas de pantalla, diagramas o documentos escaneados junto con texto, manteniendo 81.920 tokens de contexto en 8 GB de VRAM.
- Chat multi-turno con contexto largo: gracias a la ventana de 104.448 tokens, puede mantener conversaciones extensas recordando informacion de turnos muy anteriores, adecuado para asistentes tecnicos o de soporte.
- Procesamiento de imagenes medicas o tecnicas: en entornos con requisitos de privacidad, el despliegue local con llama.cpp evita enviar datos a servicios en la nube.
- Investigacion en arquitecturas looped transformer: al ser un modelo abierto con licencia Apache-2.0 y pesos GGUF, sirve para experimentar con decodificacion especulativa MTP y comparar tecnicas de cuantizacion por sensibilidad.
- Despliegue en entornos con GPU limitada: el modelo cabe en GPUs de 8 GB (RTX 4060, RTX 3070, RTX 4060 Ti) con todas las capas en GPU y uso de memoria compartida inferior a 200 MiB.

## Benchmarks y rendimiento

| Metrica | 8GB-v2 (texto) | 8GB-v2-Vision + mmproj |
|---|---|---|
| Generacion MTP off (tok/s) | 25,9 | 28,4 |
| Generacion MTP on (tok/s) | 47,8 | 53,5 |
| Tokens borrador aceptados | 235/327 (71,9%) | 238/321 (74,1%) |
| KLD media vs Q8_0 (conjunto 1 / 2) | 0,0703 / 0,0762 | 0,1375 / 0,1213 |
| Prefill con contexto largo (tok/s) | 722 (102.903 tokens) | 767 (80.380 tokens) |
| Generacion con contexto largo (tok/s) | 20,2 | 27,3 |
| Hechos recuperados en contexto largo | 3/3 | 3/3 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las pruebas se realizaron en una RTX 4060 8 GB bajo Windows sin pantalla conectada, con ejecuciones unicas (no medianas), prompt de 58 tokens, salida de 400 tokens, temperatura 0 y `--spec-draft-n-max 2`.

## Requisitos de hardware

- VRAM estimada: 8 GB para el fichero solo texto (5,76 GB de pesos) y para el fichero Vision (5,19 GB de pesos) mas el proyector mmproj (0,92 GB).
- GPU recomendadas: RTX 4060 8 GB (medida en las pruebas), RTX 3070 8 GB, RTX 4060 Ti 8 GB. Para contexto completo sin cuantizar, se necesitarian GPUs con mas VRAM (A100, H100), aunque no se proporcionan datos de rendimiento para estas.
- Cabe en GPU de consumo de 8 GB: si, con todas las capas en GPU y memoria compartida del sistema inferior a 200 MiB.
- Opciones de despliegue: llama.cpp con el fork parcheado especifico (los ficheros de este repo no cargan en la build del PR #32588); la build del PR #32588 requiere los ficheros del repo `drofn/SenseNova-Loop-9B-GGUF` y es mas lenta en RTX 4060 por falta de kernels CUDA para el enrutamiento mHC.
- Latencia y throughput: 47,8 tok/s (texto, MTP on) y 53,5 tok/s (vision, MTP on) en RTX 4060; prefill de 722-767 tok/s con contextos de 80.000-103.000 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-8GB-v2 (este) | 9,2B | 104.448 (texto) / 81.920 (vision) | Apache-2.0 | GGUF | Optimizado para 8 GB VRAM, MTP, vision opcional |
| SenseNova-Loop-9B-8GB-v3 | 9,2B | 104.448 (texto) / 57.344 (vision) | Apache-2.0 | GGUF | KLD ~20% menor que v2; menos contexto con imagenes |
| SenseNova-Loop-9B-GGUF (drofn, PR #32588) | 9,2B | no disponible | Apache-2.0 | GGUF | Escalera completa Q8_0 a IQ2_XS, requiere build PR #32588 |
| AtomicChat AD-Q4_K_M | 9,2B | no disponible | no disponible | GGUF | KLD cercano o mejor que v3 segun la model card de v3 |

No se dispone de datos de benchmarks estandar para comparar rendimiento en tareas como MMLU o HumanEval con alternativas de la misma categoria.

## Limitaciones y advertencias

- La tasa de aceptacion de tokens borrador (71,9-74,1%) se midio con un unico prompt de codigo; en otras tareas puede variar significativamente.
- Los ficheros de este repositorio no cargan en la build estandar del PR #32588 de llama.cpp; requieren un fork parcheado especifico, lo que limita la portabilidad.
- La build del PR #32588 es actualmente mas lenta en RTX 4060 por falta de kernels CUDA para el enrutamiento mHC.
- El fichero Vision reduce el contexto a 81.920 tokens (frente a 104.448 del solo texto) para acomodar el proyector mmproj en 8 GB.
- La version v3 del mismo autor ofrece menor divergencia KL (aproximadamente 20% menos) pero menor contexto con imagenes (57.344 tokens); v2 sigue siendo preferible para vision con contexto largo.
- Solo se soportan tres idiomas (en, zh, tr); el rendimiento en otros idiomas no esta documentado.
- No se han publicado datos sobre sesgos, riesgo de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base es de SenseNova y se debe verificar el cumplimiento de sus terminos.
- El rendimiento medido corresponde a ejecuciones unicas (no medianas) en una unica configuracion de hardware (RTX 4060, Windows), por lo que la variabilidad entre ejecuciones no esta cuantificada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-v2-GGUF
- Version v3: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-v3-GGUF
- Version v1: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-GGUF
- Repo con escalera completa de cuantizacion: https://huggingface.co/drofn/SenseNova-Loop-9B-GGUF
- Coleccion de todas las versiones: https://huggingface.co/collections/drofn/sensenova-loop-9b-gguf-for-6-8-gb-gpus-6aff1a746c005b20c4230d30
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- GGUF oficial de SenseNova: https://huggingface.co/sensenova/SenseNova-Loop-9B-GGUF
- PR de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/32588
