# eaddario/Spark-X2.5-4B-GGUF

## Resumen

El modelo `eaddario/Spark-X2.5-4B-GGUF` es una cuantizacion en formato GGUF del modelo base `XHToken/Spark-X2.5-4B`, publicada por el usuario eaddario. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos con cuantizacion experimental basada en un objetivo global de bits por peso (target bits-per-weight, bpw), calibrada con el dataset `eaddario/imatrix-calibration`. El pipeline declarado es text-generation y el unico idioma declarado es el ingles.

La relevancia de esta publicacion es limitada y fundamentalmente tecnica: se enmarca en el ecosistema de cuantizacion de llama.cpp, donde el uso de matrices de importancia (imatrix) para calibrar la cuantizacion permite reducir el error introducido en capas sensibles. El autor etiqueta explicitamente el resultado como "experimental", lo que indica que la asignacion de bits por capa no sigue un esquema estandar predefinido (como Q4_K_M o Q5_K_S), sino una distribucion calculada automaticamente.

En el momento de la consulta, la model card esta practicamente vacia: incluye un aviso de "Upload in progress" y no aporta informacion sobre arquitectura, contexto, datos de entrenamiento ni evaluaciones. Cualquier dato no presente en esa pagina se marca como "no disponible" en esta ficha. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (propiedad del modelo base XHToken/Spark-X2.5-4B; no se especifica en la informacion disponible) |
| Parametros totales | no disponible de forma explicita; la denominacion del modelo base sugiere ~4B, sin confirmacion en la documentacion |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantizacion experimental de bpw objetivo (target bpw) sobre matrices de importancia (imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | XHToken/Spark-X2.5-4B (finetune) |
| Dataset de calibracion | eaddario/imatrix-calibration |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base `XHToken/Spark-X2.5-4B`: no se indica si es un transformer denso, un modelo de mezcla de expertos (MoE) o una arquitectura hibrida. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de ajuste fino supervisado, RLHF o DPO. Todo ello queda como "no disponible".

Lo unico documentado es el proceso de cuantizacion posterior al entrenamiento. El autor aplica una estrategia de "global target bits-per-weight": en lugar de usar una receta fija de cuantizacion, se fija un presupuesto global de bits por peso y se distribuyen los bits entre las capas segun su importancia, estimada mediante una matriz de importancia (imatrix) calculada con el dataset `eaddario/imatrix-calibration`. Este enfoque busca minimizar la degradacion de calidad a un tamano de archivo dado, asignando mas precision a las capas mas sensibles. La etiqueta "experimental" en los tags indica que el esquema no esta validado ni estandarizado, y no se publican metricas de perplejidad ni comparaciones contra cuantizaciones canonicas.

## Capacidades

- Generacion de texto: es la unica capacidad declarada de forma explicita mediante el pipeline `text-generation`.
- Idiomas: unicamente ingles (`en`) segun los metadatos; no se declara soporte multilingue.
- Razonamiento, matematicas y generacion de codigo: no disponibles; no hay evaluaciones ni afirmaciones al respecto en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio o modo "thinking": no disponible.
- Ejecucion local: al estar en formato GGUF, es compatible con el ecosistema llama.cpp, lo que permite inferencia en CPU y en GPU con offload parcial de capas.

## Casos de uso

Nota: dado que la model card no documenta capacidades verificadas ni resultados de evaluacion, los casos siguientes son escenarios de uso plausibles para un modelo de generacion de texto de ~4B en GGUF, no aplicaciones validadas por el autor.

- Generacion de texto en ingles en local: uso del modelo con llama.cpp u Ollama en equipos sin GPU dedicada, aprovechando el formato GGUF y un tamano de pesos reducido para tareas de redaccion y resumen.
- Prototipado rapido de pipelines de NLP: su tamano permite iterar con baja latencia en tareas de clasificacion generativa, extraccion de entidades o reescritura de texto antes de escalar a un modelo mayor.
- Evaluacion comparativa de tecnicas de cuantizacion: el modelo es util como sujeto de prueba para medir el impacto de esquemas de bpw objetivo con imatrix frente a cuantizaciones estandar, comparando perplejidad y calidad de salida.
- Procesamiento por lotes en CPU: en entornos con CPU y RAM abundantes pero sin acelerador, el formato GGUF permite ejecutar generacion por lotes a coste marginal bajo.
- Asistente de redaccion embebido en aplicaciones de escritorio: al caber en memoria de un portatil, puede integrarse en editores o herramientas ofimaticas para sugerencias de texto sin enviar datos a la nube.
- Filtrado y preprocesado de corpus en ingles: generacion de resumenes o normalizacion de texto dentro de un pipeline de datos mayor, como etapa previa a un modelo de mayor capacidad.
- Pruebas de integracion con llama.cpp y vLLM: validacion de la compatibilidad del fichero GGUF y de la tokenizacion del modelo base en un stack de despliegue propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card esta incompleta ("Upload in progress...") y no incluye MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra metrica. Tampoco se publican comparaciones frente a cuantizaciones equivalentes del mismo modelo base.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano de parametros sugerido por la denominacion del modelo base (~4B) y de las cuantizaciones GGUF tipicas. No proceden de la model card y deben verificarse con el tamano real de los ficheros publicados.

- VRAM/RAM estimada para los pesos: aproximadamente 2,5-3 GB en cuantizaciones de 4 bits, alrededor de 4,5 GB en 8 bits y en torno a 8 GB en FP16, para un modelo de ~4B parametros. El esquema de bpw objetivo puede dar tamanos ligeramente distintos a los de recetas estandar.
- Overhead adicional: hay que sumar el coste del contexto (KV cache) y el runtime de llama.cpp, que crece con la longitud de contexto configurada.
- GPU consumer: un modelo de este tamano cabe con holgura en GPUs con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) para cuantizaciones de 4-8 bits.
- GPU de datacenter: A100, H100 o L40S no son necesarias para este tamano, salvo para despliegues con batching intensivo.
- CPU: es viable en CPU con 8-16 GB de RAM, con velocidades de decodificacion tipicamente en el rango de pocos tokens por segundo, dependiendo del numero de nucleos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa en la mayoria de configuraciones, por lo que requeririan convertir los pesos de vuelta a safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos del modelo evaluado (parametros exactos, contexto, benchmarks) mas alla de su licencia y formato, por lo que la comparacion se limita a la categoria de modelos de ~3-4B disponibles en GGUF.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Datos del modelo evaluado |
|---|---|---|---|---|---|
| Spark-X2.5-4B-GGUF (eaddario) | ~4B (no confirmado) | no disponible | Apache 2.0 | Si | Base de la comparacion |
| Qwen3-4B | 4B | 32k nativo, ampliable | Apache 2.0 | Si | Alternativa de referencia |
| Llama 3.2 3B | 3B | 128k | Llama 3.2 Community License | Si | Alternativa de referencia |
| Gemma 3 4B | 4B | 128k | Gemma Terms of Use | Si | Alternativa de referencia |
| Phi-4-mini | 3,8B | 128k | MIT | Si | Alternativa de referencia |

Las cifras de contexto y licencia de los modelos alternativos corresponden a sus especificaciones publicas, no a mediciones realizadas sobre este modelo.

## Limitaciones y advertencias

- La model card esta incompleta: el autor indica "Upload in progress" y no documenta arquitectura, contexto, datos de entrenamiento ni evaluaciones.
- La cuantizacion esta etiquetada como "experimental" y usa un esquema de bpw objetivo no estandar, por lo que su comportamiento puede diferir del de cuantizaciones canonicas como Q4_K_M.
- El proceso de cuantizacion con imatrix puede introducir degradaciones no medidas: no se publican perplejidad ni evaluaciones de calidad.
- Idioma: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Sesgos: no disponibles; no hay ninguna evaluacion de sesgos ni de seguridad publicada.
- Riesgo de alucinacion: inherente a los modelos generativos; no se han publicado tasas de error ni evaluaciones de fidelidad.
- Licencia: Apache 2.0, permisiva para uso comercial, pero el modelo base (`XHToken/Spark-X2.5-4B`) debe verificarse de forma independiente para confirmar que no impone restricciones adicionales.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Los resultados de busqueda web asociados a esta consulta no contenian informacion tecnica relevante sobre el modelo y no se han utilizado como fuente.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/eaddario/Spark-X2.5-4B-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Dataset de calibracion: https://huggingface.co/datasets/eaddario/imatrix-calibration
- Repositorio de llama.cpp (runtime compatible con GGUF): https://github.com/ggerganov/llama.cpp
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
