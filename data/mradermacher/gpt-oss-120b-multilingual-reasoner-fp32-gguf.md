# mradermacher/gpt-oss-120b-multilingual-reasoner-fp32-GGUF

## Resumen

`mradermacher/gpt-oss-120b-multilingual-reasoner-fp32-GGUF` es una coleccion de cuantizaciones GGUF estaticas del modelo `xxrjun/gpt-oss-120b-multilingual-reasoner-fp32`, publicada por el usuario mradermacher, conocido por distribuir versiones GGUF de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo subyacente es un ajuste fino (SFT via TRL) del modelo abierto gpt-oss-120b de OpenAI, orientado a razonamiento y a un uso multilingue, aunque la model card solo declara ingles como idioma.

El repositorio proporciona 11 variantes de cuantizacion que van desde Q3_K_S (66,2 GB) hasta Q8_0 (124,4 GB), todas divididas en multiples partes por su tamano. El repositorio completo ocupa 943 GB, lo que refleja el gran volumen de pesos de un modelo de aproximadamente 120 mil millones de parametros en formato FP32 de origen. No se dispone de informacion sobre contexto, licencia, benchmarks ni detalles de entrenamiento en la informacion proporcionada.

Este lanzamiento es relevante para quienes quieran ejecutar localmente un modelo de razonamiento de gran tamano sin depender de la infraestructura original, aunque su tamano lo restringe a entornos con hardware de gama alta o multiples GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de gpt-oss-120b; detalles no especificados) |
| Parametros totales | no disponible (el nombre indica 120b; el tamano del repo y los quants son coherentes con ~120B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_S, Q2_K, IQ4_XS, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (segun la model card; el nombre sugiere capacidades multilingues no documentadas) |
| Licencia | no disponible |
| Formato de pesos | GGUF (multiples ficheros partidos) |
| Tamano del repositorio | 943,0 GB |
| Modelo base | xxrjun/gpt-oss-120b-multilingual-reasoner-fp32 |
| Libreria | transformers (origen), GGUF para inferencia |
| Fecha de creacion | 2025-08-30 |
| Ultima actualizacion | 2026-11-18 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. El modelo original `xxrjun/gpt-oss-120b-multilingual-reasoner-fp32` fue generado mediante SFT (supervised fine-tuning) con TRL, segun las etiquetas del repositorio (`generated_from_trainer`, `trl`, `sft`), y parte del modelo gpt-oss-120b. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO.

La contribucion de este repositorio es exclusivamente la cuantizacion estatica a GGUF, realizada con una version 2 del pipeline de mradermacher (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`). No se han generado cuantizaciones ponderadas/imatrix; el autor indica que probablemente no las planificara salvo peticion en la seccion de discusiones. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto y razonamiento: el nombre del modelo indica un enfasis en razonamiento ("reasoner"), aunque no se detallan modos de pensamiento explicitos en la informacion disponible.
- Capacidades multilingues: el nombre sugiere soporte multilingue, pero la model card solo declara `en`.
- Ajuste fino supervisado (SFT): el modelo base fue entrenado con TRL en modalidad SFT, lo que indica adaptacion a instrucciones.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere uso en entornos de inferencia gestionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento local en hardware dedicado: desplegar la variante Q4_K_M (88,0 GB) en un servidor con multiples GPU para tareas de razonamiento complejo sin depender de APIs externas, aprovechando la naturaleza "reasoner" del ajuste.
- Investigacion sobre cuantizacion: comparar la calidad de las distintas variantes (Q2_K, IQ4_XS, Q4_K_M, Q8_0) sobre el mismo modelo base para estudiar la degradacion por cuantizacion en tareas de razonamiento.
- Procesamiento de instrucciones en ingles: usar el modelo para tareas de generacion y seguimiento de instrucciones en ingles, unico idioma declarado en la model card.
- Evaluacion de ajustes finos comunitarios: servir como referencia para estudiar el efecto del SFT de `xxrjun` sobre gpt-oss-120b en comparacion con el modelo original.
- Despliegue con llama.cpp: integrar los ficheros GGUF en llama.cpp o servidores compatibles para entornos de inferencia CPU/GPU hibridos, dado el formato multi-parte.
- Reproducibilidad de pipelines de cuantizacion: utilizar el repositorio como ejemplo de cuantizacion estatica v2 de un modelo de ~120B para validar herramientas propias de conversion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q3_K_S ~66,2 GB; Q2_K ~66,3 GB; IQ4_XS ~67,1 GB; Q3_K_M ~71,2 GB; Q3_K_L ~73,5 GB; Q4_K_S ~81,0 GB; Q4_K_M ~88,0 GB; Q5_K_S ~88,1 GB; Q5_K_M ~94,0 GB; Q6_K ~124,3 GB; Q8_0 ~124,4 GB.
- GPU recomendadas: para las variantes Q4/Q5 se necesitan al menos dos GPU de 48 GB (A6000, L40S) o una H100 de 80 GB con offload parcial; para Q6_K y Q8_0 se requiere un conjunto de al menos 2x80 GB (H100/A100 80 GB) o mayor.
- Consumer GPU: no cabe en ninguna GPU de consumo individual (RTX 4090 con 24 GB, RTX 3090 con 24 GB). Solo seria viable con offload masivo a RAM del sistema, con latencia muy elevada.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp) para GGUF; los ficheros estan partidos en 2 o 3 partes y deben concatenarse segun las instrucciones de los README de TheBloke referenciados por el autor. Para el modelo original en transformers se requeriria infraestructura de gran memoria.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gpt-oss-120b-multilingual-reasoner-fp32-GGUF (este) | ~120B (segun nombre) | no disponible | no disponible | GGUF (11 quants) | Cuantizacion estatica de un SFT comunitario |
| gpt-oss-120b (modelo base original) | ~120B | no disponible | no disponible | safetensors (original) | Modelo de referencia sin ajuste comunitario |
| xxrjun/gpt-oss-120b-multilingual-reasoner-fp32 | ~120B | no disponible | no disponible | FP32 | Modelo base del que deriva este GGUF |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base `xxrjun/gpt-oss-120b-multilingual-reasoner-fp32` y del gpt-oss-120b original antes de cualquier despliegue en produccion.
- Idioma declarado limitado a ingles: aunque el nombre indique "multilingual", la model card solo lista `en`; el rendimiento en otros idiomas no esta verificado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad del ajuste fino ni del impacto de las cuantizaciones.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de gran tamano; no se documentan mitigaciones especificas.
- Cuantizaciones de baja calidad: el autor marca Q3_K_M como "lower quality"; Q2_K y Q3_K_S son las variantes mas agresivas y pueden degradar el razonamiento.
- Sin cuantizaciones imatrix/ponderadas: el autor indica que probablemente no las generara, lo que limita opciones de calidad intermedia.
- Ficheros multi-parte: requieren concatenacion manual antes de su uso, un paso propenso a errores.
- Repositorio de 943 GB: el almacenamiento necesario para descargar todas las variantes es muy elevado; conviene descargar solo la cuantizacion deseada.
- Sin informacion sobre sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad.
- Modelo comunitario: no es un lanzamiento oficial de OpenAI ni del autor del modelo base; la calidad del SFT no esta auditada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gpt-oss-120b-multilingual-reasoner-fp32-GGUF
- Modelo base: https://huggingface.co/xxrjun/gpt-oss-120b-multilingual-reasoner-fp32
- Pagina de descargas del autor: https://hf.tst.eu/model#gpt-oss-120b-multilingual-reasoner-fp32-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de comparacion de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/
