# fyb1214/Swift-Bonsai-2-27B-NInfer

## Resumen

Swift-Bonsai-2-27B-NInfer es un artefacto de inferencia publicado por el usuario fyb1214 que empaqueta el modelo multimodal Swift-Bonsai-2 27B (derivado de razonamiento eficiente de UkisAI sobre el Ternary Bonsai 2 27B de Prism ML) en el formato propietario `.ninfer` del motor NInfer. El modelo base, a su vez, es una cuantizacion ternaria de Qwen3.8-27B: 27.000 millones de parametros que en FP16 ocuparian unos 54 GB y que aqui se comprimen a contenedores de 7,047 GB (1 bit, PTQ1_0) y 8,307 GB (2 bits, PQ2_0). La aportacion de este repositorio no es un nuevo entrenamiento, sino la conversion byte a byte de los codigos ternarios del GGUF original al contenedor NInfer, sin dequantizar ni requantizar, de modo que no se anade una segunda perdida de cuantizacion.

El interes practico del artefacto esta en que agrupa en un unico fichero la torre de texto, la torre de vision, la cabeza MTP (multi-token prediction), la cabeza de propuesta para decodificacion especulativa, el tokenizer, la plantilla de chat y los recursos del procesador de medios. Esto elimina la necesidad de adaptadores, parches o flags adicionales en tiempo de ejecucion. Segun las mediciones del propio publicador, el modelo genera entre 44,6 y 55,0 tokens por segundo en una RTX 3060 de 12 GB con contexto de 65.536 tokens y KV en int8, y mantiene una perplejidad practicamente identica a la del modelo base del que deriva (diferencias de entre el 0,01 % y el 0,07 % a favor de esta variante).

Es relevante ahora porque demuestra que un modelo de clase 27B con vision y decodificacion especulativa puede ejecutarse en una GPU de consumo de gama media-alta de generaciones anteriores, a costa de un formato de pesos muy agresivo (1-2 bits) y de depender de un motor de inferencia concreto. La contrapartida es un ecosistema cerrado: el contenedor solo funciona con la linea de motores `Ambolio/ninfer-4090-windows` (v1.0.6 / v1.0.8) y no es intercambiable con otros artefactos `.ninfer` del Hub que usan dialectos ternarios distintos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de texto ternaria + torre de vision en 4 bits); basado en Qwen3.8-27B. No se especifica si es denso o MoE, ni detalles de atencion |
| Parametros totales | 27.000 millones (27B), segun la denominacion del modelo y el modelo base |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens en la configuracion de ejemplo del autor (`--max-context 131072 --kv-capacity 131072`); el maximo soportado no se documenta |
| Tipos de cuantizacion | PTQ1_0_G128 (1 bit / ternaria) y PQ2_0_G128 (2 bits), grupo 128; torre de vision a 4 bits |
| Idiomas soportados | en (ingles), zh (chino); salidas verificadas en ambos |
| Licencia | apache-2.0 |
| Formato de pesos | `.ninfer` (contenedor propio del motor NInfer, derivado de GGUF; no safetensors ni GGUF directo) |

Datos adicionales del repositorio: tamano total 15,4 GB (incluye ambos contenedores), biblioteca declarada `ninfer`, pipeline `image-text-to-text`, campo `inference: false` en los metadatos, 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 27 de septiembre de 2026.

## Arquitectura y entrenamiento

No hay informacion en la documentacion proporcionada sobre el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO). Lo que si se documenta es la cadena de derivacion: Qwen3.8-27B es cuantizado de extremo a extremo por Prism ML a pesos de 1 bit o ternarios en embeddings, atencion, MLPs y LM head, mientras que la torre de vision se trata por separado a 4 bits. Sobre ese resultado, UkisAI produce un derivado orientado a eficiencia de razonamiento (Swift-Bonsai-2, publicado en GGUF) y este repositorio lo reempaqueta en el contenedor NInfer conservando los codigos ternarios literalmente, sin pasar por una segunda cuantizacion.

A nivel de ingenieria, el artefacto incorpora varias piezas que afectan al rendimiento mas que al entrenamiento: una cabeza MTP (multi-token prediction) para decodificacion especulativa con ventana configurable de 1 a 4 tokens, una cabeza de propuesta adicional, y transformaciones de tipo Hadamard asociadas al esquema de cuantizacion (etiqueta `hadamard`). El motor permite ademas fijar el tipo de dato de la cache KV segun la arquitectura de la GPU, lo que determina el consumo de memoria en contextos largos. La validacion del publicador cubre arranque del servidor, generacion coherente en ingles y chino, reutilizacion de prefijo en peticiones multi-turno (tres peticiones con el mismo prefijo, todas con respuesta correcta), diez peticiones consecutivas, muestreo, los cuatro niveles de razonamiento, vision (un cuadrado rojo, el texto `CAT` y un `42` azul) y tool calling.

## Capacidades

- Generacion de texto en ingles y chino con calidad coherente verificada por el publicador.
- Razonamiento con modos o niveles diferenciados: la validacion cubre "los cuatro niveles de razonamiento" (tiers) del modelo.
- Entrada multimodal de imagen y texto (`image-text-to-text`), con torre de vision a 4 bits integrada en el mismo contenedor.
- Generacion de codigo: en las pruebas de throughput la categoria "Code" alcanza las mayores tasas de aceptacion de decodificacion especulativa (hasta el 82 % con d1), lo que indica buen comportamiento en este dominio.
- Tool calling / function calling: probado y validado de extremo a extremo por el publicador.
- Decodificacion especulativa nativa mediante cabeza MTP, con ventana de borrador ajustable de 1 a 4 tokens y una cabeza de propuesta (`proposal head`).
- Reutilizacion de prefijo en conversaciones multi-turno: medido un paso de 2.848 ms a 258 ms en un prompt de aproximadamente 2.400 tokens.
- Contexto largo: configuracion de referencia con 131.072 tokens de contexto y de capacidad KV.
- Idiomas distintos del ingles y el chino: no documentados.

## Casos de uso

- Asistente local multimodal en estacion de trabajo: el contenedor unico incluye torre de vision y de texto, de modo que se pueden enviar capturas de pantalla, diagramas o fotos junto con la pregunta sin desplegar un segundo modelo de vision. Cabe en una GPU de 12 GB con KV en int8.
- Analisis de documentos tecnicos con contexto largo: con 131.072 tokens de ventana configurados, se puede pasar un manual completo, un informe o un repositorio de codigo extenso y hacer preguntas sobre el conjunto, aprovechando la reutilizacion de prefijo (2.848 ms a 258 ms) para iterar sobre el mismo documento sin reprocesarlo.
- Generacion de codigo asistida en local: las pruebas de throughput muestran la mayor tasa de aceptacion especulativa en prompts de codigo (hasta 64,2 t/s con d3 y 70 % de aceptacion), lo que lo hace adecuado para autocompletado e integracion en editores sobre hardware de consumo.
- Atencion al cliente automatizada en ingles y chino: conversaciones multi-turno con historial largo, apoyadas en la reutilizacion de prefijo del motor y en tool calling para consultar sistemas externos (estado de pedidos, disponibilidad, facturacion).
- Agentes con razonamiento multi-paso: la combinacion de tool calling validado y modos de razonamiento permite construir flujos de varios pasos donde el modelo decide que herramienta invocar y encadena resultados antes de responder.
- Inferencia de bajo coste en el borde o en equipos sin GPU de datacenter: 7,047 GB en 1 bit o 8,307 GB en 2 bits permiten servir un modelo de 27B en una unica GPU de 12 GB, algo inviable con los pesos FP16 del modelo original (unos 54 GB).
- Clasificacion y extraccion de informacion a partir de imagenes: etiquetado de productos, lectura de formularios escaneados o verificacion visual de incidencias, usando la torre de vision integrada.
- Evaluacion comparativa de tecnicas de cuantizacion extrema: el repositorio publica curvas de perplejidad y de aceptacion especulativa frente al modelo base, lo que lo convierte en un banco de pruebas util para investigar el impacto de 1 bit frente a 2 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos cuantitativos son mediciones de perplejidad y de throughput realizadas por el publicador en una RTX 3060 de 12 GB con contexto de 65.536 tokens, KV int8, MTP d4+lm, decodificacion greedy, 400 tokens de salida y una pasada de calentamiento mas dos ejecuciones (mediana).

Perplejidad sobre el mismo corpus que el modelo base (ventana/stride 512/256, 32/16 y 8/4):

| Medicion | Swift-Bonsai-2 27B | Modelo base | Diferencia |
|---|---:|---:|---:|
| Ventana/stride 512/256 | 8,073669 | 8,079208 | -0,07 % (Swift menor) |
| Ventana/stride 32/16 | 26,962015 | 26,972171 | -0,04 % (Swift menor) |
| Ventana/stride 8/4 | 148,3656 | 148,3863 | -0,01 % (Swift menor) |

Throughput y aceptacion especulativa por configuracion de MTP (media de cuatro tipos de prompt; formato `t/s (aceptacion)`), RTX 3060 12G:

| Config | Modelo | Chino | Ingles | Codigo | Thinking | Media |
|---|---|---:|---:|---:|---:|---:|
| d1 | Swift | 42,2 (58 %) | 44,4 (68 %) | 46,0 (82 %) | 45,8 (84 %) | 44,6 |
| d2 | Swift | 46,0 (46 %) | 49,5 (56 %) | 58,4 (80 %) | 55,9 (76 %) | 52,5 |
| d3 | Swift | 44,0 (33 %) | 49,7 (44 %) | 64,2 (70 %) | 62,2 (68 %) | 55,0 |
| d4+lm | Swift | 40,4 (28 %) | 48,0 (40 %) | 65,5 (67 %) | 58,6 (59 %) | 53,1 |
| d1 | base | 43,1 (62 %) | 44,9 (71 %) | 46,6 (85 %) | 45,4 (83 %) | 45,0 |
| d2 | base | 43,7 (42 %) | 46,9 (51 %) | 59,6 (82 %) | 55,7 (76 %) | 51,5 |
| d3 | base | 43,4 (33 %) | 52,4 (48 %) | 64,9 (71 %) | 59,9 (65 %) | 55,1 |
| d4+lm | base | 39,2 (27 %) | 48,2 (41 %) | 64,6 (66 %) | 57,1 (56 %) | 52,3 |

Conclusiones declaradas por el autor: en esa GPU, d3 es el mejor nivel de MTP, entre un 2 % y un 5 % por encima del d4+lm de produccion; Swift y el base se mantienen dentro de un ±2 % de throughput en todas las configuraciones. Los valores absolutos de perplejidad dependen del corpus: las cifras de referencia citadas en otros sitios (6,448742 / 26,049634 / 121,157720) provienen de un corpus distinto y no son comparables; solo la diferencia Swift-base dentro de un mismo corpus es significativa. Ademas, la mejora publicitada del fine-tune de "aproximadamente un 40 % menos de tokens de pensamiento" no pudo validarse: en 12 preguntas tipo quiz ambos modelos acertaron 12/12 y Swift emitio un 12,5 % menos de tokens, dentro del ruido.

Prism ML afirma, respecto al modelo base Bonsai 2 27B, que conserva en torno al 98 % del rendimiento de benchmarks del modelo original, pero no se aportan resultados numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el contenedor pesa 7,047 GB (1 bit / PTQ1_0) y 8,307 GB (2 bits / PQ2_0); a eso hay que sumar la cache KV y el overhead del motor. El autor midio funcionamiento estable en una GPU de 12 GB con contexto de 65.536 tokens y KV int8, y afirma haber usado `--max-context 32768~131072` con `--kv-dtype int8` en una tarjeta de 12 GB.
- GPU recomendadas: la linea de motor indicada esta orientada a GPU de consumo NVIDIA de sobremesa (`Ambolio/ninfer-4090-windows`), con validacion realizada en una RTX 3060 12G. No hay datos publicados para A100, H100 ni otras GPU de datacenter.
- Tipos de cache KV por arquitectura (impuestos por el motor):
  - RTX 30 series (sm_86): `bf16`, `int8`.
  - RTX 40 series (sm_89): `bf16`, `int8`, `fp8`, `rk4v4`, `rk4v4-e8`.
  - RTX 50 series (sm_120): `bf16`, `int8`, `fp8`, `nvfp4`, `k8v4`.
- Compatibilidad con GPU de consumo: si, con 12 GB o mas de memoria. La cuantizacion de 1 bit (7,047 GB) es la opcion mas ajustada para tarjetas de 8-12 GB; la de 2 bits (8,307 GB) deja menos margen para la cache KV.
- Opciones de despliegue: exclusivamente el motor NInfer de la linea `Ambolio/ninfer-4090-windows` (v1.0.6 / v1.0.8), que debe compilarse o descargarse para la GPU concreta. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros runners. No requiere adaptador DFlash2.
- Latencia y throughput medidos: 44,6-55,0 tokens/s en RTX 3060 12G con contexto de 65.536 tokens, KV int8, greedy y 400 tokens de salida. La reutilizacion de prefijo paso de 2.848 ms a 258 ms en un prompt de aproximadamente 2.400 tokens.
- Parametros de arranque de referencia: `--max-context 131072 --kv-capacity 131072 --kv-dtype int8 --spec mtp --draft-tokens 3`. El autor recomienda explorar la ventana MTP (1-4) en cada tarjeta concreta, ya que el optimo depende del hardware (en su RTX 3060 fue d3).

## Comparativa con modelos similares

No hay datos de benchmarks publicados que permitan comparar el rendimiento de estos artefactos entre si. La comparacion disponible es de formato, motor y linaje:

| Artefacto | Formato ternario | Motor requerido | Observaciones |
|---|---|---|---|
| fyb1214/Swift-Bonsai-2-27B-NInfer (este repositorio) | `PQ2_0_G128` / `PTQ1_0_G128` | Linea Ambolio (v1.0.6 / v1.0.8) | Incluye torre de vision, cabeza MTP, cabeza de propuesta, tokenizer y plantilla de chat; 7,047 GB (1 bit) y 8,307 GB (2 bits) |
| WaveCut/Ternary-Bonsai-2-27B-NInfer-v3 | `t2_g128_fp16` | iamwavecut/ninfer-all | Mismo modelo de partida, dialecto ternario distinto; no intercambiable |
| neroued/Qwen3.8-27B-NInfer | NVFP4 / groupwise-int | Neroued/ninfer | Cuantizacion de 4 bits en lugar de ternaria; no es un artefacto ternario |
| prism-ml/Ternary-Bonsai-2-27B-gguf | GGUF ternario de origen | Runtimes compatibles con GGUF | Modelo base sin empaquetar para NInfer; referencia de perplejidad y throughput |
| ukisai/Swift-Bonsai-2-GGUF | GGUF ternario del derivado Swift | Runtimes compatibles con GGUF | Version del derivado de razonamiento eficiente antes del reempaquetado en `.ninfer` |

Nota practica del autor: para saber que dialecto usa un fichero `.ninfer`, hay que leer los campos `"format"` de su primer MiB.

## Limitaciones y advertencias

- Dependencia total de un motor concreto: el contenedor solo funciona con la linea `Ambolio/ninfer-4090-windows` v1.0.6 / v1.0.8. No es compatible con vLLM, llama.cpp, Ollama ni TGI, y no es intercambiable con otros artefactos `.ninfer` del Hub.
- Formato propietario y poco extendido: `.ninfer` no es safetensors ni GGUF, lo que limita la portabilidad y las herramientas de inspeccion disponibles.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad, tasa de alucinacion ni benchmarks de conocimiento. La cuantizacion ternaria agresiva implica una compresion muy alta respecto a FP16 (unos 54 GB a 7-8 GB) y no hay datos independientes sobre el deterioro real en tareas de conocimiento factual.
- Afirmacion no validada: la mejora de "aproximadamente un 40 % menos de tokens de pensamiento" del fine-tune Swift no pudo reproducirse; en la prueba del publicador la diferencia quedo dentro del ruido estadistico (12/12 aciertos en ambos modelos).
- Cobertura de idiomas limitada: solo ingles y chino estan declarados y verificados. El comportamiento en castellano u otros idiomas no esta documentado ni validado.
- Rendimiento medido en una sola configuracion: todas las cifras de throughput y perplejidad provienen de una unica RTX 3060 12G. No hay datos para otras GPU y el optimo de ventana MTP varia por tarjeta.
- Perplejidad dependiente del corpus: las cifras absolutas no son comparables entre corpus distintos; solo la diferencia frente al modelo base dentro del mismo corpus es interpretable.
- Texto de model card truncado: la seccion de validacion del publicador se corta al mencionar un fallo de reutilizacion de prefijo documentado en versiones antiguas del motor, por lo que no se sabe si ese problema persiste en las versiones actuales.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento posterior documentado (el repositorio no se ha actualizado desde su creacion).
- Licencia: apache-2.0 en este artefacto, lo que permite uso comercial del contenedor, pero conviene verificar las condiciones de los modelos base (Prism ML y UkisAI) y del motor NInfer, que son piezas separadas de la cadena.
- La cuantizacion de 1 bit (7,047 GB) deja muy poco margen en tarjetas de 8 GB una vez anadida la cache KV; en esos casos hay que reducir contexto o usar KV en int8.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fyb1214/Swift-Bonsai-2-27B-NInfer
- Modelo base (derivado Swift en GGUF): https://huggingface.co/ukisai/Swift-Bonsai-2-GGUF
- Modelo base (ternario original en GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Anuncio de Bonsai 2 27B por Prism ML: https://prismml.com/news/bonsai-2-27b
- Documentacion de Bonsai 27B en Prism ML: https://docs.prismml.com/models/bonsai-27b
- Guia de instalacion local de Bonsai 2 27B (mindstudio.ai): https://www.mindstudio.ai/blog/bonsai-2-27b-local-install
- Motor NInfer de Neroued: https://github.com/Neroued/ninfer
- Motor NInfer de iamwavecut: https://github.com/iamwavecut/ninfer-all
- Host nativo en Swift para Bonsai 2 27B: https://github.com/RahulRachuri/bonsai-swift
- Linea de motor requerida: `Ambolio/ninfer-4090-windows` (v1.0.6 / v1.0.8), referenciada en la model card sin URL directa
- Artefacto alternativo con otro dialecto ternario: `WaveCut/Ternary-Bonsai-2-27B-NInfer-v3`
- Artefacto alternativo en NVFP4: `neroued/Qwen3.8-27B-NInfer`
- Licencia del artefacto: https://huggingface.co/fyb1214/Swift-Bonsai-2-27B-NInfer/blob/main/LICENSE
