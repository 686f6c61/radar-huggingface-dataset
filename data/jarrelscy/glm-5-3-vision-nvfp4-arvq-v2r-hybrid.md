# jarrelscy/GLM-5.3-Vision-NVFP4-ARVQ-v2r-hybrid

## Resumen

GLM-5.3-Vision-NVFP4-ARVQ-v2r-hybrid es un checkpoint experimental publicado por el usuario jarrelscy en Hugging Face, derivado del modelo multimodal GLM-5.3-Vision (etiqueta `glm5v`). No se trata de un modelo entrenado desde cero ni de una publicacion oficial de Zhipu/THUDM, sino de una compresion de pesos en curso: un esquema de cuantizacion hibrido que combina expertos "calientes" en NVFP4 con expertos "frios" comprimidos mediante ARVQ (quantizacion vectorial residual aditiva) en el denominado formato `mcbook16`, con 16 codebooks residuales por experto y 2,1289 bits por peso en la parte fria.

El repositorio ocupa 223,2 GB y declara 75 capas MoE, de las cuales solo 21 han sido sustituidas hasta la fecha por el nuevo formato. Las capas restantes conservan los pesos previamente publicados en los formatos v4/rs4 de la campana anterior, de modo que el checkpoint es deliberadamente mixto y se encuentra a medio construir. La relevancia actual del artefacto es metodologica: documenta una via de compresion extrema por debajo de 4 bits para modelos MoE de gran tamano, con kernel CUDA propio, en lugar de ofrecer un modelo listo para produccion.

Los propios autores advierten de que la paridad nativa en SM120 y la calidad del modelo completo siguen sin verificar hasta que la campana finalice. No hay datos publicados de parametros totales, parametros activos, longitud de contexto ni idiomas del modelo base, y la licencia no aparece declarada en la ficha de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con vision (GLM-5.3-Vision); 75 capas MoE segun la model card |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos calientes); ARVQ mcbook16 con 16 codebooks residuales por experto, selector de codebook de 4 bits por tile, escalas de bloque FP16 (expertos frios); 2,1289 bits/peso en la parte ARVQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria declarada: vllm) |
| Tamano del repositorio | 223,2 GB |
| Capas MoE migradas | 21 de 75 (formato mcbook16 v5); el resto conserva formatos v4/rs4 |
| Version de formato frio | `rvq256_mb16_256x8_expert_fp16block` (version 5) |
| Hardware de servicio declarado | SM120, con fork propio de vLLM |
| Estado | experimental, campana de cuantizacion en curso |

## Arquitectura y entrenamiento

El checkpoint parte de GLM-5.3-Vision, un modelo MoE con capacidades de vision segun la etiqueta `glm5v`, pero la model card no documenta el numero de parametros, la composicion del dataset, el numero de tokens de entrenamiento ni si hubo RLHF o DPO. Toda la informacion tecnica disponible se refiere al post-entrenamiento de cuantizacion, no al entrenamiento del modelo base.

El esquema de compresion es un hibrido por experto. Los expertos considerados "calientes" se almacenan en NVFP4; los expertos "frios" se aproximan con ARVQ en formato mcbook16: 16 codebooks residuales por experto, con los codebooks 0 a 7 sobre la rejilla FP4 estandar y los codebooks 8 a 15 sobre una rejilla fina tipo rs4 (`grid*0.25`), de forma que cada tile selecciona conjuntamente la forma residual y el regimen de escala. Cada tile empaquetado cubre 16 filas por 64 columnas de pesos, con escalas de bloque en FP16 y un selector de codebook de 4 bits. La asignacion de presupuesto entre expertos usa puntuacion REAP. La ruta de servicio FP4-MMA para SM120, el flujo de indices empaquetados 8+8 y las escalas de bloque se mantienen respecto a la version v4; la novedad del kernel v5 es que pondera cada contribucion residual por su factor de codebook en FP32, manteniendo la LUT de codebooks empaquetada en nibbles.

El proceso de ajuste descrito en la model card es una campana secuencial de quantizacion (PV) sobre el corpus completo con objetivo `same_input`: cada capa aproxima su propia funcion local sobre la entrada que recibe, con los tokens de frontera sobreponderados. Se optimizan con Adam los codebooks por experto restringidos a FP4 y las escalas por bloque en FP16; periodicamente se ejecutan reasignacion de indices por gradiente de salida y propuestas de cambio de codebook por tile. Hay validacion cada pocos updates con retencion del mejor checkpoint, decaimiento adaptativo de learning rate y parada temprana, ademas de puertas de publicacion basadas en auditoria de no regresion, replay de exportacion serializada y roundtrip exacto de indices empaquetados.

## Capacidades

- Las capacidades funcionales del modelo base (generacion de texto, razonamiento, codigo, matematicas, vision) no estan documentadas en la informacion disponible; el repositorio solo describe el proceso de compresion de pesos.
- Al conservar la topologia y los pesos del modelo original, el checkpoint deberia heredar las capacidades de GLM-5.3-Vision, pero la model card afirma explicitamente que la calidad del modelo completo permanece sin verificar hasta completar la campana.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidad especial confirmada: carga y ejecucion de checkpoints mixtos v4/v5 en la misma ruta de servicio, detectando el formato por capa mediante la presencia de tensores `arvq_*_selectors`.
- Capacidad de vision: inferida de la etiqueta `glm5v` del modelo base; no confirmada ni cuantificada en la ficha.
- Paridad nativa en SM120: declarada como no verificada.

## Casos de uso

- Investigacion en quantizacion post-entrenamiento: el checkpoint sirve como banco de pruebas reproducible para evaluar ARVQ con codebooks residuales por experto frente a NVFP4 puro, gracias a que coexisten formatos v4 y v5 en un mismo repositorio y a que se publican informes por capa.
- Servicio de modelos MoE grandes en hardware Blackwell: el autor proporciona una ruta de kernel FP4-MMA para SM120 junto con un fork de vLLM, lo que permite desplegar el modelo en esa generacion de GPU cuando no se dispone de memoria suficiente para los pesos en precision completa.
- Reduccion de huella de memoria en inferencia multimodal: los expertos frios a 2,1289 bits por peso permiten reducir el espacio ocupado por la mayor parte de los expertos, dejando los expertos mas usados en NVFP4 para preservar calidad en las rutas criticas.
- Reproduccion de campanas de compresion por capas: el flujo descrito (objetivo `same_input`, sobreponderacion de tokens de frontera, validacion con parada temprana y publicacion por commit) es replicable para otros MoE de gran tamano que se quieran comprimir con el mismo pipeline.
- Auditoria de kernels CUDA personalizados: al requerir la recompilacion de tres ficheros `.so` de ARVQ (`arvq/build.sh` y `build_prefill.sh`), el repositorio es util para equipos que necesiten validar kernels de decodificacion de codebooks en GPUs SM120 frente a implementaciones de referencia.
- Evaluacion de estrategias de asignacion de presupuesto por experto: la puntuacion REAP empleada para decidir la asignacion entre expertos calientes y frios puede estudiarse y compararse con alternativas en cargas de trabajo reales de vision-lenguaje.
- Despliegue interno de un asistente multimodal en un cluster con GPU SM120: siempre que se acepte el estado experimental y se valide la calidad por cuenta propia, el checkpoint puede sostener tareas de descripcion de imagenes o respuesta visual conversacional, sin garantia documentada de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de calidad, y afirma de forma explicita que la paridad nativa en SM120 y la calidad del modelo completo siguen sin verificar hasta que finalice la campana de cuantizacion.

## Requisitos de hardware

- El repositorio de pesos ocupa 223,2 GB, por lo que la inferencia requiere un sistema con al menos esa capacidad de VRAM (o descarga por capas desde disco/CPU), mas el overhead de activaciones, cache KV y buffers del kernel. No hay cifras de VRAM publicadas por el autor.
- GPU objetivo declarada: arquitectura SM120. El autor indica que el servicio se realiza con un fork propio de vLLM (`github.com/jarrelscy/vllm-glm52-sm120`, rama `experiment/arvq-mcbook16`, commit `bc8e1e924d3627774e77bcda483f88c05f8cdb43`) y que los tres ficheros `.so` de ARVQ deben recompilarse en la maquina SM120 porque las fuentes CUDA son nuevas.
- No cabe en GPU de consumo convencional por el tamano del repositorio; se requiere un nodo multi-GPU o una GPU con 200 GB o mas de memoria. No hay lista de modelos de GPU recomendados publicada.
- Opciones de despliegue conocidas: vLLM con el fork SM120 indicado. No se documenta soporte para llama.cpp, Ollama ni TGI, y las ramas antiguas del fork no pueden decodificar capas mcbook16.
- Latencia y throughput: no disponible. El unico dato de rendimiento indirecto es el uso de una ruta FP4-MMA en SM120 y de una LUT de codebooks empaquetada en nibbles con ponderacion de contribuciones residuales en FP32.

## Comparativa con modelos similares

No se han identificado modelos comparables en la informacion proporcionada. La busqueda web no devolvio resultados relacionados con el modelo (unicamente paginas de descarga de Telegram Desktop), de modo que no hay datos de parametros, contexto, rendimiento ni licencia de alternativas. A modo de comparacion interna entre los regimenes de cuantizacion descritos en la propia model card:

| Variante | Formato de expertos frios | Bits por peso (parte fria) | Estado en este checkpoint |
|---|---|---|---|
| NVFP4 puro | no aplica | 4 | Solo expertos calientes |
| ARVQ mcbook16 (v5) | `rvq256_mb16_256x8_expert_fp16block`, 16 codebooks con doble rejilla FP4 / rs4 fina | 2,1289 | 21 de 75 capas MoE |
| ARVQ v4 | mismo flujo de indices 8+8 y escalas de bloque, sin ponderacion de codebook en FP32 | no disponible | Capas aun no migradas |
| ARVQ rs4 (campana v2r) | rejilla fina tipo rs4 | no disponible | Capas de campanas anteriores conservadas |

## Limitaciones y advertencias

- Checkpoint incompleto: solo 21 de 75 capas MoE estan en el formato nuevo; el resto conserva pesos de campanas anteriores en formatos v4/rs4, lo que obliga al cargador a detectar el formato por capa.
- Calidad sin verificar: el autor declara que la paridad nativa en SM120 y la calidad del modelo completo no estan verificadas hasta que finalice la campana.
- Licencia no declarada: al no aparecer licencia en la ficha, no hay autorizacion explicita de uso comercial ni condiciones de redistribucion. Debe consultarse la licencia del modelo base GLM-5.3-Vision antes de cualquier uso en produccion.
- Dependencia de un fork: el despliegue exige una rama concreta de un fork no oficial de vLLM y la recompilacion de kernels CUDA, lo que complica el mantenimiento y la reproducibilidad a largo plazo.
- Restriccion de hardware: la ruta de servicio esta atada a SM120; no se documenta soporte para generaciones anteriores de GPU ni para backends alternativos.
- Trazabilidad limitada: con 0 descargas y 1 like, no hay evidencia de validacion independiente por parte de terceros.
- Sesgos y alucinacion: no hay informacion disponible sobre sesgos, tasas de alucinacion ni comportamiento en dominios sensibles, ni para el modelo base ni para el checkpoint cuantizado.
- Limitaciones de contexto e idioma: no disponible; no se declaran ni la ventana de contexto ni los idiomas soportados.
- Riesgo de degradacion por cuantizacion agresiva: los expertos frios operan a 2,1289 bits por peso, muy por debajo de 4 bits, y la propia campana se apoya en auditorias de no regresion, lo que indica un riesgo reconocido de perdida de calidad.
- Uso recomendado: evaluacion e investigacion en entornos controlados, no produccion sin validacion previa y sin resolucion de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jarrelscy/GLM-5.3-Vision-NVFP4-ARVQ-v2r-hybrid
- Fork de vLLM para SM120: https://github.com/jarrelscy/vllm-glm52-sm120
- Rama de servicio: `experiment/arvq-mcbook16`, commit `bc8e1e924d3627774e77bcda483f88c05f8cdb43`
- Fichero de progreso de la campana por capas citado en la model card: `pv_progress.json` (dentro del repositorio)
- Scripts de compilacion de kernels ARVQ citados: `arvq/build.sh` y `build_prefill.sh`
- Paper, blog o demo adicionales: no disponible (la busqueda web no devolvio resultados relacionados con el modelo)
