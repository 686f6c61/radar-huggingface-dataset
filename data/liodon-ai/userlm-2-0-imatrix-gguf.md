# liodon-ai/UserLM-2.0-imatrix-GGUF

## Resumen

UserLM-2.0-imatrix-GGUF es un conjunto de cuantizaciones GGUF del modelo microsoft/UserLM-2.0, publicadas por Liodon AI. El modelo original parte de meta-llama/Llama-3.1-8B-Instruct como base, según los tags del repositorio, y ha sido cuantizado en formatos sub-4-bit y de 4 a 8 bits calibrados con iMatrix, pensados para inferencia local con llama.cpp, Ollama, LM Studio o Jan.

La relevancia de esta publicacion es practica: ofrece el modelo en ficheros que van desde 2,95 GB (IQ2_M) hasta 8,54 GB (Q8_0), lo que permite ejecutarlo en GPUs de consumo con 3-10 GB de VRAM. La calibracion iMatrix, realizada con 2 millones de tokens de WikiText-103, busca mejorar la coherencia y el seguimiento de instrucciones en cuantizaciones agresivas sin aumentar el tamano del fichero.

No se dispone de informacion publicada sobre arquitectura detallada, composicion del dataset de entrenamiento, idiomas soportados ni resultados de benchmarks en la informacion proporcionada. Los datos tecnicos disponibles se limitan a los parametros del modelo base (8.030.277.696), el pipeline de text-generation y el catalogo de cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Llama-3.1-8B-Instruct, segun tags) |
| Parametros totales | 8.030.277.696 |
| Parametros activos | no aplica (no es MoE, segun datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_M, IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | other (heredada de microsoft/UserLM-2.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado en la informacion disponible la arquitectura interna del modelo original microsoft/UserLM-2.0. Los tags del repositorio indican que el modelo base es meta-llama/Llama-3.1-8B-Instruct, lo que sugiere una arquitectura transformer decoder-only de 8.000 millones de parametros, aunque este dato no se confirma de forma explicita en la model card.

El proceso de cuantizacion si esta documentado: Liodon AI empleo calibracion iMatrix con 128 fragmentos de calibracion y 2 millones de tokens de WikiText-103 para determinar que pesos requieren mayor precision. Segun el autor, esto produce mejor coherencia y seguimiento de instrucciones en Q2, Q3 y Q4 con el mismo tamano de fichero. No hay informacion sobre el entrenamiento del modelo original (tokens, composicion del dataset, RLHF/DPO).

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Seguimiento de instrucciones, heredado del modelo base Llama-3.1-8B-Instruct segun los tags.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Ejecucion local en llama.cpp, Ollama, LM Studio y Jan.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con Ollama o llama.cpp en equipos con 6-10 GB de VRAM usando Q4_K_M o Q5_K_M, lo que permite conversaciones multi-turno sin conexion a servicios externos.
- Prototipado en portatiles con GPU modesta: con IQ2_M (2,95 GB) o IQ3_M (3,78 GB) se puede ejecutar en GPUs de 4 GB, adecuado para pruebas de concepto y demos.
- Integracion en aplicaciones de escritorio: LM Studio y Jan permiten cargar el GGUF directamente, util para herramientas de productividad que requieran un modelo local sin dependencias de red.
- Generacion de texto en pipelines offline: al ser un GGUF compatible con llama.cpp, puede integrarse en scripts de procesamiento por lotes donde no se disponga de infraestructura cloud.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece siete niveles de cuantizacion, lo que permite medir el impacto de la precision en la calidad de salida para un caso de uso concreto.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente, los datos no salen del equipo, adecuado para prototipos donde la confidencialidad sea prioritaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada por cuantizacion (segun el autor): IQ2_M ~3 GB, IQ3_M ~4 GB, IQ4_XS ~5 GB, Q4_K_M ~6 GB, Q5_K_M ~7 GB, Q6_K ~8 GB, Q8_0 ~10 GB.
- GPU recomendadas: no especificadas por el autor; por VRAM, Q4_K_M encaja en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; Q8_0 requiere al menos 10 GB, por lo que encaja en RTX 4080/4090 o GPUs de datacenter (A100, H100).
- Cabe en GPU de consumo: si, desde IQ2_M en GPUs de 4 GB hasta Q8_0 en GPUs de 10 GB o mas.
- Opciones de despliegue: llama.cpp (`llama-cli -hf liodon-ai/UserLM-2.0-imatrix-GGUF:Q4_K_M`), Ollama (`ollama run hf.co/liodon-ai/UserLM-2.0-imatrix-GGUF:Q4_K_M`), LM Studio y Jan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Formato |
|---|---|---|---|---|---|
| UserLM-2.0-imatrix-GGUF (este) | 8,03 B | no disponible | IQ2_M a Q8_0 | other | GGUF |
| microsoft/UserLM-2.0 (original) | 8,03 B | no disponible | no disponible | other | no disponible |
| liodon-ai/UserLM-2.0-GGUF (sin iMatrix) | 8,03 B | no disponible | no disponible | other | GGUF |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8,03 B | 128 K (segun Llama 3.1) | multiples | Llama 3.1 Community License | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia es "other" y se hereda de microsoft/UserLM-2.0; no se detallan los terminos, por lo que es necesario revisar la licencia del modelo original antes de cualquier uso comercial.
- No se han publicado datos sobre sesgos, riesgo de alucinacion ni evaluaciones de seguridad del modelo original.
- No se especifican los idiomas soportados; el rendimiento fuera del ingles es desconocido.
- La longitud de contexto no esta documentada en esta ficha; no debe asumirse la de Llama-3.1 sin verificacion.
- Las cuantizaciones de 2 y 3 bits (IQ2_M, IQ3_M) pueden degradar la coherencia y el seguimiento de instrucciones respecto a Q4_K_M o superiores, a pesar de la calibracion iMatrix.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del rendimiento real de estas cuantizaciones.
- El modelo es una cuantizacion, no un modelo entrenado por Liodon AI; cualquier limitacion del modelo original se traslada a estas versiones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liodon-ai/UserLM-2.0-imatrix-GGUF
- Modelo original: https://huggingface.co/microsoft/UserLM-2.0
- Modelo base citado en tags: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Cuantizaciones sin iMatrix: https://huggingface.co/liodon-ai/UserLM-2.0-GGUF
- Perfil del autor: https://huggingface.co/liodon-ai
- Dataset de calibracion: https://huggingface.co/datasets/wikitext
