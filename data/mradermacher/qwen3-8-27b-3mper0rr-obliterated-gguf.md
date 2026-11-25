# mradermacher/Qwen3.8-27B-3MPER0RR-obliterated-GGUF

## Resumen

`mradermacher/Qwen3.8-27B-3MPER0RR-obliterated-GGUF` es una coleccion de cuantizaciones GGUF estaticas del modelo `3MPER0RR/Qwen3.8-27B-3MPER0RR-abliterated`, un derivado de la familia Qwen3 de 27B de parametros con las capas de rechazo eliminadas (abliteration) y posteriormente "obliterado" por el autor del modelo base. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de GGUF en Hugging Face que convierte pesos en formato Hugging Face a cuantizaciones listas para llama.cpp y derivados.

El modelo pesa 26.895.998.464 parametros reales (segun safetensors) y se distribuye bajo licencia Apache 2.0. La model card unicamente declara ingles como idioma soportado y no aporta informacion sobre arquitectura, contexto, datos de entrenamiento ni benchmarks; toda la documentacion disponible se centra en la lista de cuantizaciones y en las instrucciones de uso de GGUF. La relevancia de esta ficha es, por tanto, la de un artefacto de despliegue local: permite ejecutar un modelo de ~27B en hardware de consumo mediante cuantizaciones de 10,8 GB (Q2_K) a 28,7 GB (Q8_0), con un suplemento multimodal `mmproj` que sugiere capacidades de vision en el modelo base.

Es importante subrayar que se trata de un modelo derivado y no oficial: no procede de Alibaba/Qwen, sino de un tercero que ha aplicado abliteration sobre un checkpoint Qwen3 de 27B. Esto implica que las garantias de calidad, alineamiento y seguridad del modelo original no se conservan, y que cualquier evaluacion debe hacerse sobre este artefacto concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen3; detalles no publicados en la informacion disponible) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); repo de 187,9 GB con todos los ficheros |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineamiento (RLHF, DPO) empleadas. La model card del repositorio de cuantizacion no incluye estos datos y remite implicitamente al modelo base `3MPER0RR/Qwen3.8-27B-3MPER0RR-abliterated`, cuya ficha no forma parte de la informacion proporcionada. El nombre del modelo base indica que se ha aplicado abliteration (eliminacion de direcciones de rechazo en el espacio de activaciones) sobre un checkpoint Qwen3 de 27B, y el sufijo "obliterated" sugiere una intervencion adicional del autor, pero no se documenta el procedimiento exacto.

La unica innovacion tecnica verificable en este repositorio es el pipeline de cuantizacion de mradermacher: cuantizaciones estaticas generadas con `quantize_version: 2` y `output_tensor_quantised: 1`, con conversion desde formato Hugging Face (`convert_type: hf`). Se ofrece ademas un repositorio hermano con cuantizaciones ponderadas/imatrix (`Qwen3.8-27B-3MPER0RR-obliterated-i1-GGUF`), que suelen ofrecer mejor relacion calidad/tamano que las estaticas equivalentes. La presencia de ficheros `mmproj` confirma que el modelo base incorpora una torre multimodal (vision), aunque no se detalla su arquitectura.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Procesamiento multimodal: los ficheros `mmproj-Q8_0.gguf` y `mmproj-f16.gguf` indican soporte de entrada de imagenes en el modelo base, gestionado por llama.cpp.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a traves de APIs compatibles con el formato de Hugging Face/OpenAI en infraestructuras de inferencia.
- Ejecucion local en CPU y GPU mediante llama.cpp y sus derivados (Ollama, LM Studio, KoboldCpp, etc.).
- Capacidades de razonamiento, codigo, matematicas y tool calling: no disponibles en la informacion proporcionada; no se confirman ni se descartan.
- Capacidades multilingues: limitadas al ingles segun la model card; no se documenta soporte de otros idiomas.
- Modo "thinking" o razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: la cuantizacion Q4_K_M (16,6 GB) permite ejecutar un modelo de ~27B en una RTX 4090 de 24 GB o en una RTX 3090, con margen para contexto moderado, usando llama.cpp u Ollama.
- Prototipado de asistentes conversacionales en ingles: el modelo esta etiquetado como `conversational` y puede integrarse en un chatbot local para pruebas de concepto sin coste de API, aunque la ausencia de datos de contexto limita la planificacion de conversaciones largas.
- Analisis de imagenes en local: combinando el fichero principal con `mmproj-f16.gguf` o `mmproj-Q8_0.gguf`, se puede procesar documentacion escaneada, capturas de pantalla o fotografias en un pipeline de vision-lenguaje sin enviar datos a la nube.
- Investigacion sobre abliteration y seguridad: el modelo es un caso de estudio util para medir como la eliminacion de capas de rechazo afecta a la tasa de respuestas daninas, la coherencia y la utilidad general frente al Qwen3 original.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantizacion (de Q2_K a Q8_0) mas el repositorio imatrix, lo que permite estudiar la degradacion de perplejidad y calidad en funcion del tamano, replicando el grafico de ikawrakow incluido en la model card.
- Experimentacion con modelos sin censura en entornos controlados: para investigadores que necesitan estudiar el comportamiento de modelos sin rechazo en tareas de red teaming, siempre con las salvaguardas y el aislamiento adecuados.
- Servicio de inferencia en hardware modesto: la variante Q2_K (10,8 GB) permite ejecutar el modelo en una GPU de 12 GB o en CPU con RAM suficiente, adecuado para demos y pruebas de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el modelo base tampoco aporta datos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~11-12 GB
  - Q3_K_S: ~12-13 GB
  - Q3_K_M: ~13-14 GB
  - Q3_K_L: ~14-15 GB
  - IQ4_XS: ~15-16 GB
  - Q4_K_S: ~16-17 GB
  - Q4_K_M: ~17-18 GB
  - Q5_K_S: ~19-20 GB
  - Q5_K_M: ~19-20 GB
  - Q6_K: ~22-23 GB
  - Q8_0: ~29-30 GB
- GPU recomendadas:
  - Q8_0 y Q6_K: A100 40 GB, H100, RTX A6000 48 GB, o dos RTX 4090 en paralelo.
  - Q4_K_M y Q5_K_M: RTX 4090 24 GB, RTX 3090 24 GB, L40S 48 GB.
  - Q3_K_M e inferiores: RTX 4080 16 GB, RTX 4060 Ti 16 GB, o GPU de 12 GB con contexto reducido.
- Cabe en GPU de consumo: si, desde Q2_K (12 GB) hasta Q4_K_M (24 GB). Q6_K y Q8_0 requieren 24 GB con contexto muy limitado o multiples GPU.
- Opciones de despliegue: llama.cpp (referencia), Ollama, LM Studio, KoboldCpp, text-generation-webui, y servidores compatibles con la API de OpenAI que acepten GGUF (por ejemplo, llama-cpp-python o vLLM con soporte GGUF, aunque este ultimo es mas restrictivo con cuantizaciones K-quant).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependen fuertemente de la GPU, del backend y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-3MPER0RR-obliterated (este) | ~26,9B | no disponible | Apache 2.0 | GGUF (11 cuantizaciones) | Derivado abliterated, solo ingles, con mmproj multimodal |
| Qwen3.8-27B-3MPER0RR-abliterated | no disponible | no disponible | no disponible | safetensors (presumiblemente) | Modelo base del que se derivan estas cuantizaciones |
| Qwen3.8-27B-3MPER0RR-obliterated-i1-GGUF | ~26,9B | no disponible | Apache 2.0 | GGUF imatrix | Misma familia, cuantizaciones ponderadas de mayor calidad |
| Modelos Qwen3 oficiales de ~27B | no disponible | no disponible | no disponible | safetensors, GGUF | Referencia de calidad original; no incluidos en la informacion proporcionada |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas. La comparacion disponible es estructural (tamano, licencia, formato) y no de calidad.

## Limitaciones y advertencias

- Modelo derivado no oficial: no procede de Alibaba/Qwen y no conserva las garantias de alineamiento ni las evaluaciones del modelo original.
- Abliteration y "obliteration": la eliminacion de capas de rechazo incrementa el riesgo de generar contenido danino, sesgado o ilegal. No es apto para produccion orientada al publico sin filtros y moderacion adicionales.
- Sesgos conocidos: no documentados en la informacion disponible; cabe esperar los sesgos del corpus de entrenamiento original, agravados por la perdida de alineamiento.
- Riesgo de alucinacion: no cuantificado; al no haber benchmarks, no puede estimarse su fiabilidad en tareas factuales.
- Idioma: la model card solo declara ingles. El rendimiento en castellano es desconocido y probablemente degradado.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide planificar casos de uso con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y la responsabilidad legal por el contenido generado recae en el desplegador.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior, o las variantes imatrix.
- Repositorio de gran tamano (187,9 GB): la descarga completa es costosa; conviene descargar solo el fichero necesario.
- Fecha de creacion (2026-09-01) y actualizacion (2026-10-12): verificar que el modelo base no haya sido retirado o modificado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-3MPER0RR-obliterated-GGUF
- Repositorio imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-3MPER0RR-obliterated-i1-GGUF
- Modelo base: https://huggingface.co/3MPER0RR/Qwen3.8-27B-3MPER0RR-abliterated
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-3MPER0RR-obliterated-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
