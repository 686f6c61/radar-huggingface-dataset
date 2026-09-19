# minjaechoi/nemotron3-nano-30b-a3b-2p02bit-r19

## Resumen

Este repositorio contiene un checkpoint de investigación interno publicado por el usuario minjaechoi a partir de nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16. Se trata de una variante en la que los expertos enrutados del modelo base han sido cuantizados a una media de 2,0217 bits por peso, mientras que el resto de los pesos permanece en BF16. El modelo cuenta con 31.577.937.344 parámetros y ocupa 63,2 GB en el repositorio.

La particularidad técnica del checkpoint es que los pesos no se distribuyen en un formato comprimido, sino desquantizados y almacenados en tensores BF16. Esto implica que, pese a la agresiva cuantización de los expertos enrutados, el consumo de memoria en disco y en VRAM es equivalente al de un modelo BF16 completo. El autor indica que los pesos cargan con `transformers` estándar y con vLLM.

Es relevante ahora como material de estudio sobre compresión extrema de capas MoE: permite evaluar experimentalmente qué degradación de calidad introduce una representación de ~2 bits en los expertos enrutados de un modelo de 30B, sin necesidad de adaptar el runtime. Se publicó el 19 de septiembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h` (familia Nemotron-H de NVIDIA, segun las etiquetas del repositorio); el detalle de composicion de capas no esta disponible |
| Parametros totales | 31.577.937.344 (31,58 mil millones) |
| Parametros activos | no disponible; el sufijo "a3b" del nombre del modelo base sugiere una arquitectura MoE con aproximadamente 3.000 millones de parametros activos, pero no se confirma en la informacion proporcionada |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,0217 bits de media; resto de pesos en BF16; los pesos se almacenan desquantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible; el autor indica que sigue la licencia del modelo base |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La etiqueta `nemotron_h` del repositorio identifica el modelo base como perteneciente a la familia Nemotron-H de NVIDIA. No obstante, la informacion proporcionada no incluye la composicion exacta de capas, el numero de tokens de entrenamiento, la mezcla del dataset ni si hubo fases de RLHF, DPO u otras tecnicas de alineamiento. Todos esos datos corresponden al modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` y no se detallan aqui.

La innovacion concreta de este checkpoint es el procedimiento de cuantizacion aplicado exclusivamente a los expertos enrutados, con una media de 2,0217 bits por peso (identificador interno "r19"). El autor no documenta el algoritmo de cuantizacion, el tamano de grupo, ni el proceso de calibracion. Un aspecto critico es que los pesos se publican ya desquantizados en BF16: la compresion no se traduce en una reduccion del espacio ocupado, sino en una perdida de precision incorporada al peso. Segun la model card, el modelo carga con `transformers` estandar y con vLLM sin modificaciones, lo que sugiere que no requiere kernels de cuantizacion especificos en tiempo de inferencia.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` y el pipeline `text-generation` declarados.
- Arquitectura MoE con enrutamiento de expertos, heredada del modelo base (inferido del sufijo "a3b" y de la descripcion de "expertos enrutados" en la model card).
- Carga directa con la libreria `transformers` y con vLLM, segun indica el autor.
- Compatibilidad declarada con endpoints mediante la etiqueta `endpoints_compatible`.
- Requiere codigo de modelado personalizado: el repositorio incluye la etiqueta `custom_code`, por lo que es previsible que necesite `trust_remote_code=True` en la carga.
- Razonamiento, codigo, matematicas, vision, tool calling, capacidad de agente, modo de pensamiento y cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Estudio de compresion extrema en capas MoE: el checkpoint permite medir experimentalmente la degradacion de calidad al reducir los expertos enrutados a ~2 bits, comparando las salidas contra el modelo base BF16 sobre el mismo conjunto de evaluacion.
- Reproduccion de investigacion en cuantizacion: util como punto de partida para replicar el identificador "r19" y contrastar variantes con otros presupuestos de bits por experto.
- Validacion de pipelines de carga: sirve para verificar que un stack basado en `transformers` o vLLM es capaz de cargar un checkpoint de 63,2 GB con pesos MoE desquantizados sin kernels personalizados.
- Pruebas de integracion en infraestructura de inferencia: al ser compatible con endpoints, permite ensayar el despliegue con sharding entre varias GPU y medir el coste real de servir un modelo de este tamano.
- Generacion de texto conversacional en entornos de investigacion cerrados: uso interno para explorar respuestas multi-turno, siempre que se acepte la ausencia de garantias de calidad documentadas.
- Analisis de sensibilidad por capa: comparando la salida del checkpoint contra el base, se puede aislar que expertos toleran mejor la cuantizacion agresiva.
- Referencia para auditorias de licencia: util para estudiar como se propaga la licencia de un modelo base a sus derivados cuantizados, dado que este repositorio no especifica una licencia propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones contra el modelo base o contra otras cuantizaciones.

## Requisitos de hardware

- Peso de los parametros: 31.577.937.344 parametros en BF16 equivalen a aproximadamente 63,2 GB, cifra que coincide con el tamano del repositorio. La cuantizacion de los expertos no reduce este valor porque los pesos se publican desquantizados.
- VRAM estimada para inferencia: por encima de 63 GB solo para pesos, mas la cache KV y las activaciones. En la practica requiere 80 GB o mas, o reparto entre varias GPU.
- GPU recomendadas: H100 de 80 GB o A100 de 80 GB en configuracion mononodo; para reparto, 2 x A100 de 40 GB o 4 x RTX 4090 de 24 GB mediante paralelismo tensorial.
- GPU de consumo: no cabe en una sola GPU de consumo. Una RTX 4090 de 24 GB, una RTX 5090 o una RTX 6000 Ada de 48 GB son insuficientes de forma aislada; solo seria viable con offloading a CPU, con la penalizacion de latencia correspondiente.
- Opciones de despliegue: `transformers` y vLLM, segun la model card. No se indica soporte para llama.cpp, Ollama, TGI ni formatos GGUF, y no esta confirmado que la arquitectura sea convertible a ellos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Precision de pesos | Almacenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minjaechoi/nemotron3-nano-30b-a3b-2p02bit-r19 | 31,58 mil millones | Expertos enrutados a 2,0217 bits de media; resto BF16, almacenado desquantizado en BF16 | 63,2 GB | no disponible (hereda la del base) | Publico en HuggingFace, 0 descargas |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | no disponible en la informacion proporcionada | BF16 | no disponible | no disponible | Modelo base referenciado |

No se dispone de datos verificables sobre otras alternativas comparables de la misma categoria (mismo tamano o mismo tipo de cuantizacion) en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia sin especificar: el autor remite a la licencia del modelo base, pero no se reproduce el texto ni se aclara si permite uso comercial. Verificar antes de cualquier uso en produccion.
- Checkpoint de investigacion interno: la propia model card lo describe como tal, sin validacion externa ni resultados de evaluacion.
- Sin benchmarks publicados: no hay evidencia cuantitativa sobre la perdida de calidad introducida por la cuantizacion a 2,0217 bits en los expertos enrutados.
- Sin datos de idiomas soportados: no se puede garantizar un comportamiento correcto en castellano ni en otros idiomas distintos del que cubra el modelo base.
- Longitud de contexto desconocida: no se puede planificar el uso en tareas que dependan de ventanas largas.
- Riesgo de alucinacion: al no haber evaluaciones publicadas, el riesgo es indeterminado y previsiblemente superior al del modelo base por la cuantizacion extrema.
- Requiere codigo personalizado: la etiqueta `custom_code` implica que la carga puede necesitar `trust_remote_code=True`, con la superficie de riesgo que ello conlleva en produccion.
- Falsa percepcion de ahorro de memoria: pese a la media de 2,0217 bits en los expertos, los pesos se distribuyen desquantizados, por lo que el consumo de VRAM no se reduce respecto a un BF16.
- Sin adopcion registrada: 0 descargas y 0 valoraciones, lo que limita la validacion por parte de terceros.
- Ausencia de informacion sobre el procedimiento de cuantizacion: no se documentan algoritmo, tamano de grupo ni metodologia de calibracion, lo que dificulta auditar o reproducir el resultado.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/minjaechoi/nemotron3-nano-30b-a3b-2p02bit-r19
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16

Nota: la busqueda web realizada no devolvio ningun resultado relevante para este modelo. Los unicos enlaces utilizables son los dos anteriores.
