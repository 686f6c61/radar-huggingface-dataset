# qda-lab/QDA-Gemma-4-26B-A4B-W4A16

## Resumen

QDA-Gemma-4-26B-A4B-W4A16 es una cuantizacion de solo pesos (weight-only) del modelo google/gemma-4-26B-A4B-it, publicada por el laboratorio qda-lab. El checkpoint reduce los pesos del modelo base a enteros de 4 bits (asimétrico, en grupos de 64), manteniendo las activaciones en 16 bits, y se distribuye en el formato compressed-tensors. El objetivo es abaratar el coste de memoria y de inferencia del modelo original sin reentrenar, de modo que pueda desplegarse en hardware mas modesto.

El modelo base es un Gemma 4 de arquitectura Mixture-of-Experts con 26B parametros nominales y 4B parametros activos por token (de ahi el sufijo A4B). El checkpoint cuantizado ocupa 16,7 GB en el repositorio y contiene 14.386.943.566 parametros almacenados segun los safetensors, un dato coherente con un MoE cuyos expertos se empaquetan de forma compacta.

Es relevante ahora porque se trata de una publicacion en fase de pre-lanzamiento: el autor indica que la evaluacion esta pendiente y que la version completa, con resultados de evaluacion, se planifica para el 20 de noviembre de 2026. Por tanto, es una opcion a considerar para experimentacion temprana con despliegue de un MoE Gemma 4 en 4 bits, pero sin garantias de calidad medidas todavia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en transformer, derivada de google/gemma-4-26B-A4B-it |
| Parametros totales | 26B nominales en el modelo base; 14.386.943.566 parametros almacenados en los safetensors del checkpoint cuantizado |
| Parametros activos | 4B (sufijo A4B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16: pesos en int4 asimetrico en grupos de 64; pesos en int8 simetrico en grupos de 64; activaciones en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada del modelo base; ver LICENSE y LICENSE-SOURCE.txt en el repositorio) |
| Formato de pesos | safetensors en formato compressed-tensors |

## Arquitectura y entrenamiento

El checkpoint no introduce entrenamiento propio: es una cuantizacion post-entrenamiento de solo pesos sobre google/gemma-4-26B-A4B-it. La arquitectura subyacente es un Mixture-of-Experts de tipo transformer con 26B parametros totales y 4B activos por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamano nominal. El proceso de cuantizacion aplica int4 asimetrico en grupos de 64 y, adicionalmente, int8 simetrico en grupos de 64 sobre determinados pesos, dejando las activaciones en 16 bits; el resultado se serializa con la libreria compressed-tensors.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens, la composicion de los datos ni las etapas de alineacion (RLHF/DPO) empleadas. Tampoco se detallan innovaciones tecnicas adicionales del modelo base mas alla de su naturaleza MoE y de la propia receta de cuantizacion. El autor no documenta la metodologia de calibracion ni el impacto esperado de la cuantizacion en la perplejidad.

## Capacidades

- Generacion de texto conversacional: la pipeline declarada es text-generation y el modelo base es la variante instruct (sufijo -it), orientada a dialogo.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Gemma 4, aunque no se documentan evaluaciones especificas en esta ficha.
- Capacidades multilingues: no disponibles; el campo de idiomas del repositorio no esta informado.
- Tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades especiales (modo thinking, vision, audio): no documentadas en la informacion disponible.

## Casos de uso

- Despliegue economico de un MoE de 26B en infraestructura de una sola GPU: la cuantizacion W4A16 reduce la huella de pesos a 16,7 GB, lo que permite servir el modelo en GPUs de 24 GB con margen para cache KV, algo inviable con los pesos en 16 bits.
- Prototipado de asistentes conversacionales: al ser la variante instruct del modelo base, puede emplearse para dialogos multi-turno en entornos de desarrollo antes de decidir si se migra a la version sin cuantizar.
- Experimentacion con compressed-tensors: sirve como caso de prueba para pipelines de vLLM o de servidores compatibles con compressed-tensors que necesiten validar la carga y el rendimiento de un checkpoint W4A16 de un MoE.
- Evaluacion comparativa de calidad tras cuantizacion: util para medir la degradacion que introduce el esquema int4/int8 frente al modelo base, una vez el autor publique los resultados de evaluacion previstos para el 20 de noviembre de 2026.
- Inferencia en entornos con restricciones de memoria: escenarios de laboratorio o estaciones de trabajo con una RTX 4090 donde se quiera ejecutar un modelo de 26B nominales sin recurrir a offloading a CPU.
- Base para ajuste fino ligero o evaluacion interna: al estar bajo licencia apache-2.0, puede integrarse en flujos internos de investigacion que necesiten un modelo de gran tamano con coste de memoria contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la evaluacion esta pendiente y que la version completa, con resultados, se planifica para el 20 de noviembre de 2026.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos cuantizados ocupan aproximadamente 16,7 GB; a ello hay que sumar la cache KV y el overhead del runtime, por lo que se recomienda un minimo de 24 GB de VRAM para contextos moderados.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para despliegues de una sola GPU; para contextos largos o mayor concurrencia, A100/H100 con varias instancias.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y previsiblemente en RTX 3090 (24 GB); en GPUs de 16 GB el margen para cache KV sera muy limitado o nulo.
- Opciones de despliegue: vLLM y otros servidores compatibles con compressed-tensors; llama.cpp/Ollama requeririan una conversion a GGUF que no se documenta en el repositorio.
- Latencia y throughput estimados: no disponibles; al ser un MoE con 4B parametros activos, se espera un coste por token inferior al de un denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|---|
| qda-lab/QDA-Gemma-4-26B-A4B-W4A16 | 26B (14,39B almacenados) | 4B | no disponible | W4A16 compressed-tensors | apache-2.0 | Pre-release, sin evaluacion |
| google/gemma-4-26B-A4B-it | 26B | 4B | no disponible | BF16/FP16 original | apache-2.0 | Modelo base de referencia |
| Otras cuantizaciones de Gemma 4 26B-A4B | 26B | 4B | no disponible | no disponible | apache-2.0 | no disponible |

La comparativa se limita al modelo base, ya que no se dispone de datos de rendimiento ni de otras alternativas cuantizadas documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- Estado de pre-lanzamiento: el autor advierte que la evaluacion esta pendiente; no hay evidencia publicada sobre la degradacion de calidad introducida por la cuantizacion.
- Riesgo de alucinacion: inherente al modelo base y no cuantificado en esta version; la cuantizacion puede amplificarlo y no hay mediciones al respecto.
- Idiomas: el repositorio no declara idiomas soportados, por lo que no puede confirmarse el comportamiento multilingue.
- Contexto: se desconoce la longitud de contexto efectiva del checkpoint y si la cuantizacion afecta a su comportamiento en ventanas largas.
- Licencia: apache-2.0 heredada del modelo base, pero el autor remite a la pagina de licencia de Gemma 4; conviene revisar los terminos de uso comercial del modelo base antes de desplegarlo en produccion.
- Madurez: con 0 descargas y 0 likes en el momento de la consulta y sin resultados de evaluacion, no es recomendable para produccion sin una validacion interna previa.
- Compatibilidad: el formato compressed-tensors exige runtimes que lo soporten; no se documenta conversion a GGUF ni a otros formatos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qda-lab/QDA-Gemma-4-26B-A4B-W4A16
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Libreria compressed-tensors: no disponible (sin enlace en la informacion proporcionada)
