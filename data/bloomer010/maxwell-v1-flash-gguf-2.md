# bloomer010/Maxwell-V1-Flash-GGUF

## Resumen

Maxwell-V1-Flash es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por maxwell-model, distribuido en este repositorio por el usuario bloomer010 en formato GGUF para su uso con llama.cpp. Cuenta con 36.810.559.422 parámetros totales (aproximadamente 35B) y 3B parámetros activos por token, lo que lo situa en la categoria de modelos MoE eficientes en inferencia. Emplea una arquitectura denominada `maxwell-moe` que incorpora hyper-connections con restriccion de variedad (manifold-constrained) y atencion block-sparse, con un prefijo denso de 16K tokens y soporte de hasta 256K tokens de contexto.

La relevancia de esta publicacion reside en que ofrece conversiones cuantizadas listas para usar de un modelo cuyo soporte nativo aun no esta en la rama principal de llama.cpp: requiere un fork especifico (`aetherbird/llama.cpp`, rama `maxwell-moe`) o la aplicacion de un parche sobre el commit `9581154`. El repositorio incluye una matriz de importancia (imatrix) generada por el propio autor de las conversiones y exporta el bloque MTP (NextN) como cabeza de decodificacion especulativa.

El modelo esta orientado a uso conversacional con modo de razonamiento activado por defecto y soporte de tool calling mediante plantilla Jinja embebida. La licencia es Apache-2.0, heredada del modelo base. El tamano del repositorio es de 192,3 GB, lo que refleja la presencia de multiples cuantizaciones (desde Q3_K_M hasta BF16 en dos partes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `maxwell-moe`: transformer MoE con manifold-constrained hyper-connections y atencion block-sparse (prefijo denso de 16K tokens) |
| Parametros totales | 36.810.559.422 (~35B) |
| Parametros activos | ~3B |
| Longitud de contexto | Hasta 256K tokens (262.144) |
| Tipos de cuantizacion | BF16 (2 partes), Q8_0, Q8_K_XL, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M |
| Idiomas soportados | No disponible (tokenizer construido para tailandes, lao, birmano, jemer y shan, ademas de CJK y texto latino) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se publica en safetensors BF16 |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo mixture-of-experts con 46 bloques en el archivo GGUF: 45 capas de backbone (3 con FFN densa y 42 MoE) mas una capa MTP (NextN). La innovacion arquitectonica principal son las hyper-connections con restriccion de variedad, parametrizadas con 4 flujos residuales, 20 iteraciones de Sinkhorn y epsilon 1e-6; estas matrices, junto con las normas, los tensores de enrutamiento y el sesgo de expertos, se mantienen en F32 en las conversiones. La atencion es densa en las primeras 16K posiciones de consulta y pasa a block-sparse mas alla de ese umbral, combinando 8 bloques de prefijo, 8 locales y hasta 16 bloques de 128 tokens seleccionados por un indexer. El umbral se expone como clave GGUF (`attention.indexer.dense_prefix_tokens`).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card del repositorio GGUF no los detalla. La matriz de importancia incluida se genero a partir del modelo Q8_0 sobre un corpus mixto de codigo e ingles (no el conjunto de calibracion del proveedor), con 1000 fragmentos de 512 tokens (512.000 tokens de calibracion) y 1093 entradas de matriz. La decodificacion especulativa se implementa mediante el bloque MTP exportado como capa NextN, activable con `--spec-type draft-mtp`.

## Capacidades

- Generacion de texto conversacional multi-turno con modo de razonamiento (thinking) activado por defecto, desactivable por peticion con `"chat_template_kwargs": {"enable_thinking": false}`.
- Soporte de tool calling / function calling mediante plantilla de chat y formato de llamada embebidos (requiere `--jinja` en llama-server).
- Razonamiento de un solo paso con herramientas: las llamadas individuales y los ciclos de ida y vuelta de resultados de herramienta funcionan correctamente, incluso a ambos lados del umbral de 16K tokens.
- Procesamiento de contexto largo de hasta 256K tokens, con atencion block-sparse mas alla de los 16K tokens para mantener la eficiencia.
- Capacidades multilingues parciales: el tokenizer fue construido para tailandes, lao, birmano, jemer y shan, ademas de CJK y texto latino, aunque la validacion del pre-type se hizo solo sobre una muestra pequena.
- Decodificacion especulativa mediante cabeza MTP integrada en cada cuantizacion.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto de hasta 256K tokens, lo que permite conservar historiales largos de interaccion y documentacion de soporte sin truncar; el modo thinking ayuda a resolver consultas que requieren razonamiento sobre el historial.
- Asistentes con acceso a herramientas en flujos de un solo paso: integracion en pipelines donde el modelo emite una llamada a funcion (consulta a API, busqueda, calculo) y consume el resultado devuelto; el soporte de tool calling con plantilla Jinja embebida simplifica el despliegue en llama-server.
- Procesamiento de documentos extensos: con 256K de contexto y atencion block-sparse, es adecuado para resumir o extraer informacion de contratos, informes o bases de codigo de gran longitud en una sola pasada.
- Generacion y asistencia de codigo: la imatrix se calibro sobre un corpus mixto de codigo e ingles, lo que sugiere un uso previsto en tareas de programacion; puede integrarse en editores o pipelines de revision con llamadas a herramientas para ejecutar tests.
- Despliegue en hardware de gama alta de consumo: las cuantizaciones Q4_K_M (22,3 GB) e IQ4_XS (~21 GB) caben en GPUs de 24-32 GB, lo que permite ejecutar un modelo de ~35B con 3B activos en estaciones de trabajo con una sola RTX 4090 o similar.
- Experimentacion e investigacion sobre arquitecturas MoE con atencion dispersa: el fork de llama.cpp y las herramientas de validacion incluidas (round-trip de tensores, test-llama-archs, paridad de tokenizer) permiten estudiar el comportamiento de la atencion block-sparse y las hyper-connections en entornos locales.
- Traduccion y procesamiento de texto en idiomas del sudeste asiatico: el tokenizer cubre tailandes, lao, birmano, jemer y shan, lo que abre la puerta a tareas de procesamiento linguistico en esas lenguas, aunque con validacion limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento medido es el de la decodificacion especulativa con MTP sobre 2xV100 y el archivo Q8_0: aceptacion del borrador de 0,32 y longitud media aceptada de 1,92 tokens por paso, sin ganancia neta de velocidad en ese hardware.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (el autor indica dejar margen porque pesos y contexto comparten memoria):
  - BF16 (2 partes): 73,7 GB (96 GB+ o desbordamiento a CPU).
  - Q8_0 / Q8_K_XL: 39,2 GB / ~42 GB (56 GB+).
  - Q6_K: ~31 GB (48 GB).
  - Q5_K_M: ~27 GB (40 GB).
  - Q4_K_M: 22,3 GB (32 GB).
  - IQ4_XS: ~21 GB (32 GB).
  - Q3_K_M: ~17 GB (24 GB).
- Coste de KV cache: aproximadamente 90 KB por token en fp16; se reduce a la mitad con `--cache-type-k q8_0 --cache-type-v q8_0`.
- GPU recomendadas: el autor midio en 2xV100; por capacidad de memoria, encajan A100 80 GB, H100 y configuraciones multi-GPU para las cuantizaciones mayores. Las cuantizaciones Q4_K_M, IQ4_XS y Q3_K_M caben en GPUs de consumo de 24-32 GB (RTX 3090, RTX 4090).
- Opciones de despliegue: exclusivamente llama.cpp mediante el fork `aetherbird/llama.cpp` (rama `maxwell-moe`) o aplicando `maxwell-moe-port.patch` al commit `9581154`; se usan `llama-server`, `llama-cli` y `llama-quantize`. El puerto AtomicChat no es equivalente: usa atencion densa en todas las capas y descarta el bloque MTP.
- Latencia y throughput: no disponibles, salvo la medicion de aceptacion MTP indicada arriba.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Maxwell-V1-Flash (este) | ~35B / ~3B | 256K | Apache-2.0 | GGUF (fork de llama.cpp) | Atencion block-sparse, hyper-connections, MTP |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion sobre modelos comparables en la documentacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El uso de agentes multi-paso con herramientas no es fiable en este modelo; solo funcionan las llamadas individuales y los ciclos de ida y vuelta de resultados.
- Requiere un fork no oficial de llama.cpp (`aetherbird/llama.cpp`, rama `maxwell-moe`) o un parche sobre un commit concreto; la rama principal de llama.cpp no soporta la arquitectura `maxwell-moe`. Esto implica riesgo de mantenimiento y de divergencia futura.
- La ruta de atencion block-sparse exige flash attention; sin ella, el modelo cae a atencion densa en todas las longitudes, con el coste de memoria y computo asociado.
- La decodificacion especulativa con MTP no aporto ganancia neta de velocidad en la medicion del autor sobre 2xV100 (aceptacion 0,32; 1,92 tokens por paso).
- La matriz de importancia se genero con un corpus de calibracion propio del conversor (codigo e ingles), no con el conjunto del proveedor, lo que puede afectar a la calidad de las cuantizaciones K-quant e i-quant en dominios distintos.
- El tokenizer fue validado solo sobre una muestra pequena para los idiomas del sudeste asiatico; la cobertura real en tailandes, lao, birmano, jemer y shan no esta garantizada.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero al tratarse de una conversion de terceros conviene verificar la model card del modelo base para condiciones adicionales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bloomer010/Maxwell-V1-Flash-GGUF
- Modelo base: https://huggingface.co/maxwell-model/Maxwell-V1-Flash
- Fork de llama.cpp con soporte `maxwell-moe`: https://github.com/aetherbird/llama.cpp/tree/maxwell-moe
- Parche de soporte: `maxwell-moe-port.patch` (incluido en el repositorio, aplicable sobre el commit `9581154` de llama.cpp)
- Matriz de importancia: `imatrix/maxwell.imatrix.gguf` (incluida en el repositorio)
