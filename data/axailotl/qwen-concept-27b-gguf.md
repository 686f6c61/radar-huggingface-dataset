# axAilotl/qwen-concept-27b-GGUF

## Resumen

Qwen Concept 27B es una variante del modelo Qwen3.8-27B en la que el equipo de Concept Country ha reescrito nueve proyecciones descendentes (*down-projections*) mediante una tecnica de programacion en el espacio de pesos (*weight-space programming*). El modelo base es un transformer denso de 27.320.697.856 parametros, distribuido originalmente en bf16, fp8 y nvfp4. Este repositorio concreto, publicado por el usuario axAilotl, no contiene el modelo original sino cuantizaciones GGUF adicionales en formato Unsloth Dynamic, pensadas para facilitar el despliegue en hardware con recursos limitados.

La relevancia de esta ficha reside en dos aspectos. Por un lado, documenta un caso practico de edicion de pesos sobre un modelo de gran tamano, una tecnica que permite modificar comportamientos concretos sin reentrenamiento completo. Por otro lado, ofrece una escalera de cuantizaciones que va desde 2,87 hasta 7,40 bits por peso, con tamanos que oscilan entre 9,83 GB y 25,30 GB, lo que habilita su ejecucion en GPUs de consumo y en entornos de servidor con VRAM moderada.

Es importante subrayar que este repositorio es un artefacto de conveniencia para despliegue, no un modelo evaluado de forma independiente. La edicion de pesos solo ha sido evaluada aguas arriba en bf16 y Q8_0, y el propio autor advierte de un deterioro del comportamiento agentico y de tool calling en las cuantizaciones de 2 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Unsloth Dynamic: UD-Q2_K_XL (2,87 bpw), UD-Q3_K_XL (3,85 bpw), UD-Q4_K_XL (5,14 bpw), UD-Q6_K_XL (7,40 bpw); proyector vision mmproj-F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de Qwen3.8-27B via el repositorio upstream) |
| Formato de pesos | GGUF (los originales upstream incluyen bf16, fp8, nvfp4, GGUF Q8_0 y Q4_K_M) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 27.320 millones de parametros. La modificacion introducida por Concept Country consiste en reescribir nueve proyecciones descendentes mediante programacion en el espacio de pesos, una tecnica descrita en el paper publicado en concept.country/research/weight-space-programming. No se trata de un reentrenamiento ni de un ajuste fino supervisado, sino de una edicion directa de tensores que persigue alterar el comportamiento del modelo de forma controlada.

Las cuantizaciones de este repositorio se generan con la receta por tensor de Unsloth para la misma arquitectura, extraida de los archivos UD publicados de `unsloth/Qwen3.8-27B-GGUF` y reproducida con `llama-quantize --tensor-type-file`. Cada archivo se cuantiza en un solo salto desde la fuente bf16 verificada por SHA256, nunca a partir de otra cuantizacion. La matriz de importancia se recalcula sobre los pesos editados con 2,8 millones de tokens (smoltalk renderizado con plantilla de chat y wikitext-2-raw de entrenamiento, incluyendo las capas MTP). Es cuantizacion post-entrenamiento pura (PTQ), sin QAT ni QAD, con la cadena de herramientas llama.cpp en el commit `cf6463a`. Se conserva MTP en todos los niveles, conforme a la convencion de Unsloth para UD-Q2_K_XL y superiores.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Soporte de vision mediante el proyector `mmproj-F16.gguf` (0,93 GB), que acompana a las cuantizaciones.
- Capacidad de tool calling y comportamiento agentico, aunque el autor advierte de un deterioro notable en las cuantizaciones de 2 bits respecto a 4 bits o superiores.
- Soporte de decodificacion multi-token (MTP) conservado en todos los niveles de cuantizacion.
- Razonamiento, codigo y matematicas: no disponible de forma explicita en la informacion proporcionada; debe asumirse la herencia de Qwen3.8-27B sin verificacion independiente.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue en GPUs de consumo: la cuantizacion UD-Q4_K_XL (17,56 GB) permite ejecutar el modelo en tarjetas con 24 GB de VRAM, como la RTX 4090, manteniendo un 95,7 % de coincidencia en top-1 respecto a bf16.
- Prototipado rapido en portatiles o estaciones con 12-16 GB de VRAM: la UD-Q2_K_XL (9,83 GB) posibilita pruebas de concepto, asumiendo la perdida de calidad (85,0 % de coincidencia top-1 y 10,1 % de divergencia RMS).
- Servicio conversacional con requisitos de latencia moderados: la UD-Q6_K_XL (25,30 GB) ofrece un 98,0 % de coincidencia top-1 y solo un 1,2 % de divergencia, adecuada para entornos de produccion con una sola GPU de 40-48 GB.
- Analisis de documentos con componente visual: el proyector mmproj-F16 permite procesar imagenes junto con texto en tareas de extraccion o resumen, siempre que la VRAM disponible cubra el modelo mas el proyector.
- Evaluacion de tecnicas de edicion de pesos: investigadores interesados en programacion del espacio de pesos pueden comparar el comportamiento del modelo editado frente al Qwen3.8-27B original usando las distintas cuantizaciones como referencia.
- Integracion en pipelines con llama.cpp: al estar en formato GGUF y usar la cadena de herramientas estandar, el modelo se integra en flujos existentes basados en llama.cpp u Ollama sin conversion adicional.
- Despliegue en entornos con presupuesto de almacenamiento ajustado: la diferencia entre 9,83 GB y 25,30 GB permite elegir el equilibrio tamano/calidad segun las restricciones del nodo.

## Benchmarks y rendimiento

El autor publica metricas de fidelidad de cuantizacion respecto al GGUF bf16, medidas con el modo de divergencia KL de `llama-perplexity` sobre wikitext-2-raw de test (65K tokens, con calibracion solo en el split de entrenamiento).

| Cuantizacion | Bits por peso | Tamano | Coincidencia top-1 vs bf16 | Divergencia RMS |
|---|---|---|---|---|
| UD-Q2_K_XL | 2,87 bpw | 9,83 GB | 85,0 % | 10,1 % |
| UD-Q3_K_XL | 3,85 bpw | 13,15 GB | 91,7 % | 5,5 % |
| UD-Q4_K_XL | 5,14 bpw | 17,56 GB | 95,7 % | 2,5 % |
| UD-Q6_K_XL | 7,40 bpw | 25,30 GB | 98,0 % | 1,2 % |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La edicion de pesos solo ha sido evaluada aguas arriba en bf16 y Q8_0.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del archivo mas el contexto y el proyector de vision. UD-Q2_K_XL ronda los 10-12 GB; UD-Q3_K_XL, 13-15 GB; UD-Q4_K_XL, 18-20 GB; UD-Q6_K_XL, 26-28 GB, en funcion de la longitud de contexto.
- GPU recomendadas: RTX 4090 (24 GB) para UD-Q4_K_XL; A100 40 GB o H100 para UD-Q6_K_XL; GPUs de 12-16 GB (RTX 4070 Ti Super, RTX 4080) para UD-Q2_K_XL y UD-Q3_K_XL con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090 con UD-Q4_K_XL y en RTX 4080 o similares con UD-Q2_K_XL y UD-Q3_K_XL.
- Opciones de despliegue: llama.cpp (cadena de herramientas de referencia, commit `cf6463a`), Ollama y cualquier runtime compatible con GGUF. No se menciona soporte verificado de vLLM ni TGI para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen-concept-27b-GGUF (este repo) | 27,3 B | no disponible | Apache-2.0 | GGUF UD | Edicion de pesos en 9 down-projections |
| ConceptCountry/qwen-concept-27b (upstream) | 27,3 B | no disponible | Apache-2.0 | bf16, fp8, nvfp4, GGUF Q8_0/Q4_K_M | Fuente canonica, evaluada en bf16/Q8_0 |
| Qwen3.8-27B (base) | 27,3 B | no disponible | Apache-2.0 | safetensors y GGUF | Modelo original sin edicion de pesos |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada, mas alla de las metricas de fidelidad de cuantizacion.

## Limitaciones y advertencias

- Las cuantizaciones son artefactos de conveniencia para despliegue y no han sido evaluadas de forma independiente; la edicion de pesos solo se valido aguas arriba en bf16 y Q8_0.
- El autor advierte explicitamente de un deterioro del comportamiento agentico y de tool calling en las cuantizaciones de 2 bits respecto a 4 bits o superiores.
- La divergencia RMS del 10,1 % en UD-Q2_K_XL implica una perdida de fidelidad considerable frente a bf16, con solo un 85,0 % de coincidencia top-1.
- No se especifican sesgos conocidos, riesgos de alucinacion ni limitaciones de idioma en la informacion disponible; deben asumirse los del modelo base Qwen3.8-27B.
- La longitud de contexto no esta documentada en este repositorio; conviene consultar el repositorio upstream antes de desplegar en produccion.
- Licencia Apache-2.0, que permite uso comercial, pero al ser una edicion de pesos conviene verificar las condiciones del repositorio upstream y del paper asociado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/axAilotl/qwen-concept-27b-GGUF
- Modelo base upstream: https://huggingface.co/ConceptCountry/qwen-concept-27b
- Paper de programacion en el espacio de pesos: https://concept.country/research/weight-space-programming
- Documentacion de Unsloth Dynamic 3.0 GGUF: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Recetas por tensor de referencia: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
