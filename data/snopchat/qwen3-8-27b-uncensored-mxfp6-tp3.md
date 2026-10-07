# snopchat/Qwen3.8-27B-Uncensored-MXFP6-TP3

## Resumen

`snopchat/Qwen3.8-27B-Uncensored-MXFP6-TP3` es un repositorio de pesos publicado por el usuario snopchat en HuggingFace. Por el nombre y las etiquetas declaradas (`qwen3_5`, `8-bit`, `quark`) se trata de una variante cuantizada y presumiblemente desalineada ("uncensored") de un modelo de la familia Qwen, distribuida en formato safetensors y fragmentada en tres partes para tensor parallelism (TP3). El repositorio no incluye model card, ni licencia, ni idiomas declarados, ni pipeline de inferencia definido.

Los tensores en safetensors suman 22.945.035.568 parametros reales, con un tamano de repositorio de 27,3 GB. Existe una discrepancia notable entre el nombre del repositorio (que sugiere 27B) y el recuento efectivo de parametros (22,9B), y tambien entre la etiqueta `8-bit` y el formato MXFP6 que da nombre al modelo (6 bits). Ninguna de estas inconsistencias esta documentada ni justificada por el autor.

Su relevancia practica es limitada por el momento: 13 descargas, 0 likes, sin revisiones ni documentacion tecnica, y con fecha de creacion y ultima actualizacion separadas por apenas dos minutos, lo que indica una publicacion sin mantenimiento posterior. Es, por tanto, un artefacto experimental mas que un modelo listo para produccion, y cualquier evaluacion seria exige auditar los pesos por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `qwen3_5` apunta a la familia Qwen3.5; no confirmado) |
| Parametros totales | 22.945.035.568 (recuento real de safetensors) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP6 (6 bits, formato microscaling OCP) segun el nombre; etiqueta `8-bit` tambien presente; herramienta `quark` (AMD Quark) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Fragmentacion | 3 particiones (TP3, segun el nombre; no confirmado) |
| Tamano del repositorio | 27,3 GB |
| Fecha de creacion | 7 de octubre de 2026 (segun metadatos) |
| Descargas / likes | 13 / 0 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF, DPO u otros). La unica evidencia disponible son las etiquetas del repositorio: `qwen3_5` sugiere que la base pertenece a la familia Qwen3.5, y `quark` apunta al uso del kit de cuantizacion Quark de AMD, coherente con la publicacion de pesos en un formato microscaling como MXFP6. Todo ello son indicios derivados del nombre y las etiquetas, no datos confirmados.

El sufijo "Uncensored" implica que la alineacion del modelo base ha sido eliminada o atenuada, probablemente mediante fine-tuning sobre datos sin filtrar o mediante tecnicas de abliteracion. Sin embargo, el autor no documenta el metodo, el dataset utilizado ni el grado de degradacion que ello pueda provocar en tareas de instruccion general. Tampoco se especifica si hubo entrenamiento adicional despues de la cuantizacion ni si los pesos se generaron por cuantizacion post-entrenamiento (PTQ) o con calibracion propia. El salto entre los aproximadamente 17-18 GB teoricos de pesos a 6 bits y los 27,3 GB que ocupa el repositorio sugiere que este puede contener archivos adicionales o que el formato efectivo no es exactamente el esperado, pero no hay informacion para verificarlo.

## Capacidades

- No existe documentacion que acredite ninguna capacidad concreta de este repositorio. Las capacidades que se enumeran a continuacion son las que cabria esperar por herencia de la familia base segun las etiquetas, y **no estan verificadas**.
- Generacion de texto e instrucciones generales: esperable si la base es un modelo instruct de la familia Qwen.
- Razonamiento y matematicas: esperable, sin datos de rendimiento que lo respalden.
- Generacion de codigo: esperable, sin confirmacion.
- Tool calling y function calling: no confirmado.
- Uso en agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo de pensamiento explicito (thinking mode), vision o audio: no disponible.
- Perfil de rechazo reducido: es la unica caracteristica que el propio nombre afirma explicitamente, y hay que asumirla como no cuantificada.

## Casos de uso

Nota previa: dado que no hay licencia declarada ni documentacion tecnica, ninguno de estos casos deberia llevarse a produccion comercial sin aclarar antes los terminos de uso.

- Despliegue en tres GPU de gama consumer: el nombre indica TP3, es decir, reparto de los pesos en tres particiones. Con aproximadamente 18 GB de pesos a 6 bits, cada GPU asumiria unos 6 GB de pesos, lo que permitiria servir el modelo en configuraciones de 3x 12-16 GB en lugar de exigir una GPU de 24 GB o mas. Es el caso de uso mas inmediato y el que explica la existencia del repositorio.
- Inferencia en hardware AMD con ROCm: la etiqueta `quark` apunta a la cadena de herramientas de cuantizacion de AMD, por lo que este artefacto encaja en entornos MI-series/CDNA donde el soporte de formatos MX esta previsto en el stack de ROCm.
- Investigacion sobre alineacion y rechazo: al tratarse de una variante "uncensored", sirve como punto de comparacion frente al modelo base alineado en estudios de abliteracion, midiendo la tasa de rechazo, la coherencia y la degradacion en tareas neutras.
- Red teaming y evaluacion de seguridad: util para generar entradas adversarias y comprobar si los filtros de un sistema de guardarrailes aguas abajo resisten, siempre en un entorno aislado y sin exposicion a usuarios finales.
- Generacion de datos sinteticos en dominios con contenido sensible (ficcion, dialogos con tematica adulta, guiones): el modelo puede producir material que una base alineada rechazaria, con revision humana obligatoria antes de cualquier uso.
- Conversion a otros formatos para despliegue local: los pesos safetensors MXFP6 no son consumibles directamente por llama.cpp u Ollama, de modo que un caso realista es de-cuantizar y recuantizar a GGUF, AWQ o GPTQ para llevarlo a un portatil o a un servidor con llama.cpp o vLLM.
- Repositorio de partida para experimentos de cuantizacion: comparar MXFP6 frente a FP8, INT8 o AWQ sobre el mismo modelo base en cuanto a perplejidad y latencia, aprovechando que aqui ya existe una version cuantizada publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los resultados obtenidos eran contenido sin relacion alguna con IA). El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningun otro conjunto, y al no estar identificado con certeza el modelo base tampoco es posible atribuirle los resultados publicados para la familia Qwen.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 17,2 GB teoricos a 6 bits por parametro, mas escalas de bloque (aproximadamente 18-20 GB). El repositorio ocupa 27,3 GB, cifra superior a la esperada que no esta explicada.
- Memoria adicional: la cache KV depende de la longitud de contexto, que es desconocida; no puede estimarse.
- Reparto en TP3: aproximadamente 6-9 GB de pesos por GPU, lo que permitiria usar 3x RTX 3090/4090 (24 GB), 3x RTX 5090 (32 GB) o 3x A100 40 GB. El requisito de 3 GPU limita las placas base y la topologia de interconexion.
- GPU unica: una RTX 3090 o 4090 de 24 GB podria alojar los pesos con contexto corto, aunque queda poco margen; 32 GB (RTX 5090) o 48 GB (A6000) dan mas holgura; A100 80 GB y H100 80 GB no presentan problema.
- GPU no recomendadas: tarjetas de 8-12 GB en configuracion de una sola unidad, por insuficiencia de VRAM.
- Soporte nativo del formato: MXFP6 es un formato microscaling OCP cuyo soporte acelerado esta limitado a generaciones recientes (Blackwell en NVIDIA y CDNA4 en AMD, segun la documentacion publica de dichos formatos); en GPUs anteriores se requiere de-cuantizacion por software. Este extremo no esta confirmado en la informacion del repositorio.
- Opciones de despliegue: vLLM y SGLang son los candidatos naturales por su soporte de safetensors y tensor parallelism, pero el soporte concreto de MXFP6 no esta confirmado. Los kernels de Quark (AMD) serian la via mas directa si la cuantizacion se hizo con esa herramienta. llama.cpp y Ollama no consumen MXFP6 safetensors: exigirian conversion previa a GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable: no se ha confirmado cual es el modelo base y no existen datos de rendimiento publicados para este repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| snopchat/Qwen3.8-27B-Uncensored-MXFP6-TP3 | 22.945.035.568 | no disponible | no disponible | safetensors, MXFP6, 27,3 GB |
| Modelo base de la familia Qwen (sin identificar) | no disponible | no disponible | no disponible | no disponible |
| Alternativas cuantizadas del mismo base (AWQ, GPTQ, FP8) | no disponible | no disponible | no disponible | no identificadas |

## Limitaciones y advertencias

- Ausencia total de licencia: no puede asumirse uso comercial, redistribucion ni modificacion. Aunque el modelo base fuese Apache 2.0 (habitual en la familia Qwen), este repositorio no declara terminos, por lo que la situacion legal es indeterminada.
- Naturaleza "uncensored": la alineacion ha sido presumiblemente eliminada, lo que incrementa el riesgo de salidas daninas, ofensivas o ilegales. No es apto para aplicaciones orientadas a usuarios finales sin guardarrailes externos.
- Sin documentacion: no hay model card, ni ficha de entrenamiento, ni indicacion de que se hayan evaluado sesgos, toxicidad o degradacion de capacidades tras la cuantizacion y el desalineado.
- Riesgo de alucinacion: no medido. En modelos desalineados o con cuantizacion agresiva, la perdida de precision en razonamiento y la generacion de afirmaciones falsas con tono seguro suelen aumentar.
- Adopcion practicamente nula: 13 descargas y 0 likes implican cero validacion por parte de la comunidad y ningun informe independiente de calidad o seguridad.
- Inconsistencias en los metadatos: el nombre indica 27B frente a 22,9B reales, y la etiqueta `8-bit` no coincide con MXFP6 (6 bits). Ademas, el tamano del repositorio (27,3 GB) supera lo esperable para los pesos declarados.
- Formato poco portable: MXFP6 no es consumible por llama.cpp, Ollama ni la mayoria de runtimes de inferencia local sin conversion previa.
- Requisito de tensor parallelism 3: si el modelo solo carga correctamente con 3 particiones, queda excluido de entornos con 1, 2, 4 u 8 GPU sin re-sharding manual.
- Idiomas no declarados: no hay garantia de rendimiento en castellano ni en ningun otro idioma distinto del que usase el modelo base.
- Fechas de creacion y actualizacion separadas por dos minutos: indica publicacion unica sin mantenimiento, sin posibilidad de comprobar si los pesos fueron corregidos despues.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/snopchat/Qwen3.8-27B-Uncensored-MXFP6-TP3
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos relacionados con este modelo. Los resultados devueltos por la busqueda no guardaban ninguna relacion con inteligencia artificial ni con el repositorio.
- Modelo base, documentacion del formato MXFP6 y herramienta Quark: no disponible en la informacion proporcionada.
