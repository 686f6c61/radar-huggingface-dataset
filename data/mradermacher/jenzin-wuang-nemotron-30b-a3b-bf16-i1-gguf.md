# mradermacher/Jenzin-Wuang-Nemotron-30B-A3B-BF16-i1-GGUF

## Resumen

Jenzin-Wuang-Nemotron-30B-A3B-BF16-i1-GGUF es una cuantizacion GGUF del modelo ApolloRaines/Jenzin-Wuang-Nemotron-30B-A3B-BF16, publicada por el usuario mradermacher. Se trata de un derivado del modelo NVIDIA Nemotron-3.5-Lightning-30B-A3B-BF16 (segun el enlace de licencia de la model card) que ha sido sometido a un proceso de "weight surgery" e "identity transplant" para modificar su comportamiento e identidad conversacional. La model card se autodescribe como una demo y parodia, lo que condiciona su uso previsto.

El modelo cuenta con 31.577.940.288 parametros totales (aproximadamente 31,6 mil millones) y la nomenclatura "A3B" sugiere una arquitectura de mezcla de expertos con unos 3 mil millones de parametros activos por token, aunque este dato no se confirma de forma explicita en la informacion disponible. El repositorio ocupa 459,5 GB e incluye un conjunto amplio de cuantizaciones GGUF generadas con imatrix, desde IQ1_S hasta Q6_K.

La relevancia de esta ficha es limitada y conviene contextualizarla: no es un modelo de proposito general ni un lanzamiento oficial, sino un experimento de modificacion de pesos sobre una base Nemotron. Resulta util para quienes investigan tecnicas de cuantizacion GGUF, weight surgery y modificacion de comportamiento, pero no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de NVIDIA Nemotron-3.5-Lightning-30B-A3B (MoE segun nomenclatura A3B, no confirmado) |
| Parametros totales | 31.577.940.288 |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B, sin confirmacion oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_S, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_1, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (ademas de fichero imatrix) |
| Idiomas soportados | en |
| Licencia | same-as-base (heredada de NVIDIA Nemotron-3.5-Lightning-30B-A3B-BF16, licencia "other") |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en BF16 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la herencia del modelo base NVIDIA Nemotron-3.5-Lightning-30B-A3B-BF16. Por la nomenclatura "30B-A3B" cabe inferir una arquitectura de mezcla de expertos (MoE) con aproximadamente 30 mil millones de parametros totales y unos 3 mil millones activos por token, patron habitual en la familia Nemotron, pero este dato no se confirma en la documentacion proporcionada.

El aspecto diferencial de este modelo no es el entrenamiento, sino la modificacion posterior de pesos. Las etiquetas "jblaze", "weight-surgery", "identity-transplant" y "behavioral-modification" indican que se han alterado los pesos del modelo base para cambiar su identidad y comportamiento conversacional. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La cuantizacion ha sido realizada por mradermacher con fichero imatrix, lo que permite generar cuantizaciones de baja precision (hasta IQ1) con perdida de calidad controlada.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta de idioma del repositorio.
- Comportamiento conversacional modificado respecto al modelo base (identity transplant), orientado a una personalidad o identidad concreta no documentada.
- Cuantizaciones de muy baja precision (IQ1, IQ2) que permiten ejecucion en hardware con recursos limitados.
- Soporte de inferencia mediante llama.cpp y otros runners compatibles con GGUF.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Investigacion en cuantizacion GGUF: el repositorio ofrece una matriz completa de cuantizaciones (desde IQ1_S hasta Q6_K) sobre un mismo modelo, lo que permite estudiar la degradacion de calidad segun la precision y comparar tecnicas IQ frente a K-quants en un modelo de ~31,6B parametros.
- Experimentacion con weight surgery: util para investigadores que quieran analizar como las modificaciones de pesos e identidad afectan al comportamiento conversacional frente al modelo base Nemotron.
- Pruebas de despliegue en hardware modesto: las cuantizaciones IQ2 e IQ3 (en torno a 18 GB) permiten ejecutar un modelo de gran tamano en GPUs de consumo con 24 GB de VRAM, como la RTX 3090 o RTX 4090, mediante llama.cpp.
- Docencia y demostraciones sobre formatos GGUF: sirve para ilustrar el flujo de descarga, concatenacion de ficheros multiparte y carga en llama.cpp u Ollama.
- Evaluacion comparativa de calidad de cuantizaciones: el fichero imatrix incluido permite generar cuantizaciones propias y contrastar resultados con las publicadas.
- Pruebas de concepto de asistentes conversacionales en ingles: unicamente en entornos controlados y no productivos, dado el caracter de parodia del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: las variantes IQ1 e IQ2 ocupan aproximadamente 18 GB; IQ3 en torno a 18-20,8 GB; IQ4_XS 18,1 GB; Q4_K_S 22 GB; Q4_K_M 24,6 GB; Q5_K_S 23,9 GB; Q5_K_M 26,1 GB; Q6_K en el rango superior (tamano exacto no listado en la informacion disponible).
- GPU recomendadas: para Q4_K_M o superiores, GPUs con 24-48 GB de VRAM (RTX 3090, RTX 4090, A6000, L40S, A100 40 GB). Para cuantizaciones IQ2/IQ3, GPUs de 24 GB o configuraciones con offload parcial a RAM.
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090 (24 GB) con cuantizaciones IQ2, IQ3 y Q4_0/Q4_1; las cuantizaciones Q5 y Q6 requieren 32 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base usa transformers, pero las cuantizaciones estan pensadas para llama.cpp.
- Latencia y throughput: no disponible. Al tratarse de un MoE con ~3B parametros activos (segun nomenclatura), cabe esperar un throughput superior al de un denso de 30B, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Jenzin-Wuang-Nemotron-30B-A3B-BF16-i1-GGUF | 31,6B totales (A3B) | no disponible | same-as-base (other) | GGUF | Derivado modificado, demo/parodia |
| ApolloRaines/Jenzin-Wuang-Nemotron-30B-A3B-BF16 | 31,6B totales (A3B) | no disponible | other | BF16 safetensors | Modelo base del que deriva esta cuantizacion |
| NVIDIA Nemotron-3.5-Lightning-30B-A3B-BF16 | ~30B totales (A3B) | no disponible | other (NVIDIA) | BF16 | Modelo original sin modificaciones de identidad |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo se autodescribe como "demo" y "parodia"; no esta pensado para uso en produccion ni para tareas criticas.
- La modificacion de identidad y comportamiento (identity transplant) puede introducir sesgos o respuestas no alineadas no documentadas; no hay evaluaciones de seguridad publicadas.
- Riesgo de alucinacion elevado, especialmente en las cuantizaciones de muy baja precision (IQ1, IQ2), que la propia model card marca como "for the desperate" o "very low quality".
- Solo soporta ingles; no se declara soporte multilingue.
- La licencia es "same-as-base" y remite a la licencia de NVIDIA Nemotron-3.5-Lightning-30B-A3B-BF16, marcada como "other"; es imprescindible revisar los terminos originales antes de cualquier uso comercial.
- El repositorio ocupa 459,5 GB, lo que exige planificacion de almacenamiento y descarga selectiva de cuantizaciones.
- No hay informacion sobre la longitud de contexto soportada, lo que impide garantizar conversaciones de contexto largo.
- El modelo no cuenta con likes ni documentacion tecnica detallada; la trazabilidad de las modificaciones de pesos es limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Jenzin-Wuang-Nemotron-30B-A3B-BF16-i1-GGUF
- Modelo base: https://huggingface.co/ApolloRaines/Jenzin-Wuang-Nemotron-30B-A3B-BF16
- Licencia de referencia (NVIDIA Nemotron-3.5-Lightning-30B-A3B-BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/Jenzin-Wuang-Nemotron-30B-A3B-BF16-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Jenzin-Wuang-Nemotron-30B-A3B-BF16-i1-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
