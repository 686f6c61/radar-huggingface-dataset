# liodon-ai/qwen3-4b-heretic-imatrix-GGUF

## Resumen

El modelo liodon-ai/qwen3-4b-heretic-imatrix-GGUF es una coleccion de cuantizaciones GGUF del modelo DreamFast/qwen3-4b-heretic, publicada por Liodon AI. Se trata de un modelo de generacion de texto basado en la familia Qwen3 de Alibaba, disenado para ejecucion local en hardware de consumo mediante llama.cpp, Ollama, LM Studio o Jan. El repositorio incluye siete niveles de cuantizacion, desde IQ2_M (4,31 GB) hasta Q8_0 (12,51 GB), lo que permite adaptar el despliegue a distintos presupuestos de VRAM.

La principal innovacion de esta publicacion es el uso de cuantizacion iMatrix, que ejecuta 128 bloques de calibracion a traves del modelo en precision completa para identificar que pesos son mas relevantes y asignar mayor precision donde mas importa. La calibracion se realizo con 2 millones de tokens del dataset WikiText-103. En cuantizaciones de 2, 3 y 4 bits, esto se traduce en una mejora notable de la coherencia y el seguimiento de instrucciones respecto a la cuantizacion estandar, manteniendo el mismo tamano de archivo.

Cabe destacar una discrepancia significativa: el modelo se denomina "qwen3-4b" pero los pesos safetensors originales contabilizan 11.766.034.176 parametros (~11,77 mil millones), lo que sugiere que el modelo base podria ser de mayor tamano del que indica su nombre. La licencia es "other", por lo que las condiciones de uso comercial no estan claramente definidas. En el momento de la publicacion, el repositorio registraba 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 11.766.034.176 (~11,77 B) segun safetensors; denominado "4B" en el nombre del modelo |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ2_M, IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es DreamFast/qwen3-4b-heretic, un fine-tuning de la familia Qwen3 de Alibaba. Qwen3 es una serie de modelos de lenguaje de pesos abiertos basados en arquitectura transformer densa para los tamanos pequenos (4B), con variantes de razonamiento (thinking) y no razonamiento. El sufijo "heretic" indica una adaptacion especifica realizada por DreamFast, aunque no se dispone de detalles publicos sobre el dataset, la tecnica de fine-tuning o los objetivos de la adaptacion.

La contribucion de Liodon AI se centra en la cuantizacion iMatrix. Este metodo, a diferencia de la cuantizacion estandar que trata todos los pesos por igual, ejecuta 128 bloques de calibracion a traves del modelo en precision completa para determinar que pesos son mas criticos, y asigna mayor precision donde mas impacta en la calidad de salida. La calibracion se realizo con 2 millones de tokens de WikiText-103. El resultado es que, al mismo tamano de archivo, las cuantizaciones iMatrix ofrecen mejor coherencia y seguimiento de instrucciones que las cuantizaciones convencionales, especialmente en rangos de 2 a 4 bits.

## Capacidades

- Generacion de texto conversacional: el modelo esta orientado a mantener dialogos multi-turno, como corresponde a un fine-tuning de la familia Qwen3.
- Inferencia local: al estar cuantizado en GGUF, puede ejecutarse en CPU y GPU de consumo mediante llama.cpp, Ollama, LM Studio y Jan, sin necesidad de infraestructura en la nube.
- Despliegue en entornos con recursos limitados: las cuantizaciones de 2 y 3 bits (IQ2_M, IQ3_M) permiten ejecutar el modelo en equipos con 5-7 GB de VRAM.
- Compatibilidad con el ecosistema llama.cpp: soporta los formatos de cuantizacion estandar (Q4_K_M, Q5_K_M, Q6_K, Q8_0) y los formatos iMatrix (IQ2_M, IQ3_M, IQ4_XS).
- Capacidades de razonamiento: al estar basado en Qwen3, hereda las capacidades de razonamiento y seguimiento de instrucciones de la familia, aunque no se dispone de datos especificos sobre el comportamiento del fine-tuning "heretic".
- No se dispone de informacion sobre soporte de tool calling, function calling, vision, audio o modo thinking en esta publicacion.

## Casos de uso

- Asistente conversacional privado: el modelo puede desplegarse como chatbot local en un equipo de escritorio con GPU de 8 GB mediante la cuantizacion Q4_K_M (7,30 GB). Al ejecutarse localmente, los datos no salen del equipo, lo que resulta adecuado para entornos con requisitos de privacidad o confidencialidad.
- Prototipado rapido de aplicaciones de IA: los desarrolladores pueden integrar el modelo en aplicaciones mediante llama.cpp u Ollama sin depender de APIs externas, reduciendo costes de desarrollo, latencia de red y dependencia de terceros.
- Generacion de texto en entornos sin GPU: las cuantizaciones IQ2_M e IQ3_M (4,31 y 5,66 GB respectivamente) permiten ejecutar el modelo en CPU con suficiente RAM, util para portatiles, mini-PCs o servidores sin aceleracion grafica.
- Experimentacion con cuantizacion iMatrix: investigadores y desarrolladores pueden comparar la calidad de salida entre los siete niveles de cuantizacion para determinar el punto optimo de compresion frente a calidad para su caso de uso concreto, utilizando el mismo modelo base.
- Evaluacion de modelos locales frente a APIs: las organizaciones pueden evaluar si un modelo local de este tamano satisface sus necesidades de calidad y latencia antes de comprometerse con una solucion en la nube, comparando coste, privacidad y rendimiento.
- Desarrollo de aplicaciones de generacion de texto creativo: el modelo puede utilizarse para redactar contenido, narrativa o dialogos, aprovechando la adaptacion "heretic" del modelo base, aunque no se dispone de documentacion que detalle sus capacidades especificas en este ambito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras pruebas estandar para este modelo cuantizado. La model card no incluye metricas de rendimiento comparativas ni evaluaciones de calidad frente al modelo en precision completa.

## Requisitos de hardware

- VRAM estimada por cuantizacion (segun la model card):
  - IQ2_M: ~5 GB
  - IQ3_M: ~7 GB
  - IQ4_XS: ~8 GB
  - Q4_K_M: ~8 GB
  - Q5_K_M: ~10 GB
  - Q6_K: ~11 GB
  - Q8_0: ~14 GB
- GPU recomendadas: las cuantizaciones de 2 y 3 bits caben en GPUs de consumo como la RTX 3060 (12 GB) o RTX 4060 (8 GB). Las cuantizaciones de 5 a 8 bits requieren GPUs con 10-14 GB de VRAM, como la RTX 3080, RTX 4080 o RTX 4090.
- Ejecucion en CPU: las cuantizaciones mas bajas (IQ2_M, IQ3_M) pueden ejecutarse en CPU con 8-16 GB de RAM, aunque con mayor latencia que en GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan. Tambien es compatible con cualquier servidor de inferencia que soporte formato GGUF.
- Latencia y throughput: no se dispone de datos medidos. La latencia dependera del hardware, la cuantizacion elegida y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| liodon-ai/qwen3-4b-heretic-imatrix-GGUF | ~11,77 B (safetensors) / denominado 4B | No disponible | other | GGUF | Cuantizacion iMatrix, 7 niveles |
| Qwen3-4B-Instruct (original) | ~4 B | No disponible | No disponible | safetensors, GGUF | Modelo base oficial de la familia Qwen3 |
| liodon-ai/Qwen3-4B-Instruct-2507-imatrix-GGUF | ~4 B | No disponible | No disponible | GGUF | Version actualizada de Qwen3-Instruct-2507 con iMatrix, mismo autor |

Nota: la discrepancia en el numero de parametros entre el nombre del modelo (4B) y los pesos safetensors (11,77 B) dificulta la comparacion directa con otros modelos de la familia Qwen3-4B. No se dispone de datos de rendimiento para establecer una comparativa objetiva.

## Limitaciones y advertencias

- Licencia "other": las condiciones de uso, especialmente el uso comercial, no estan claramente definidas. Se recomienda contactar con el autor antes de utilizar el modelo en produccion.
- Discrepancia de parametros: el modelo se denomina "qwen3-4b" pero los pesos safetensors contabilizan 11,77 mil millones de parametros. Esta inconsistencia puede indicar un error de denominacion o un modelo base distinto al esperado, y debe verificarse antes de confiar en las especificaciones.
- Riesgo de alucinacion: como todos los modelos de lenguaje, puede generar contenido falso o inventado, especialmente en cuantizaciones de 2 y 3 bits donde la perdida de precision es mayor.
- Perdida de calidad en cuantizaciones bajas: las cuantizaciones IQ2_M e IQ3_M, aunque optimizadas con iMatrix, presentan una degradacion notable respecto al modelo en precision completa.
- Idiomas soportados: no se ha publicado informacion sobre los idiomas que soporta el modelo. La familia Qwen3 es principalmente multilingue, pero el fine-tuning "heretic" podria haber alterado este comportamiento.
- Sin datos de benchmarks: no se dispone de metricas de rendimiento publicadas, lo que dificulta evaluar la calidad del modelo antes de su despliegue.
- Longitud de contexto no documentada: se desconoce la ventana de contexto soportada, un factor critico para aplicaciones de agente o procesamiento de documentos largos.
- Repositorio sin traccion: con 0 descargas y 0 likes en el momento de la publicacion, el modelo no ha sido validado por la comunidad, por lo que su fiabilidad en produccion es incierta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/liodon-ai/qwen3-4b-heretic-imatrix-GGUF
- Modelo base: https://huggingface.co/DreamFast/qwen3-4b-heretic
- Cuantizaciones sin iMatrix: https://huggingface.co/liodon-ai/qwen3-4b-heretic-GGUF
- Version iMatrix de Qwen3-4B-Instruct-2507 (mismo autor): https://huggingface.co/
