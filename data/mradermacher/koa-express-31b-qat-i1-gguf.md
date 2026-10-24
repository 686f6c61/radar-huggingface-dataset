# mradermacher/Koa-express-31B-qat-i1-GGUF

## Resumen

`mradermacher/Koa-express-31B-qat-i1-GGUF` es un conjunto de cuantizaciones GGUF generadas por mradermacher (cuantizador independiente conocido por publicar versiones comprimidas de modelos abiertos) a partir del modelo `SF-Foundation/Koa-express-31B-qat`. No se trata, por tanto, de un modelo entrenado desde cero, sino de una distribución de pesos comprimidos pensada para ejecución local con llama.cpp y sus derivados. El repositorio contiene cuantizaciones del tipo i1 (con fichero imatrix), que suelen ofrecer mejor relación calidad/tamaño que las cuantizaciones estáticas equivalentes.

El modelo base tiene 32.106.631.740 parámetros (32,1 mil millones, comercializado como "31B") y la model card del cuantizador lo describe explícitamente como un modelo de visión, además de estar etiquetado como conversacional y con soporte únicamente de inglés. La relevancia de esta publicación es práctica: permite probar un modelo multimodal de ~32B en hardware de una sola GPU o en configuraciones con offload parcial de CPU, algo inviable con los pesos originales en precisión completa.

La información pública disponible es muy limitada. No se ha publicado en la información proporcionada la arquitectura del modelo base, la longitud de contexto, la licencia, la composición del dataset de entrenamiento ni resultados de benchmarks. Esta ficha marca esos campos como "no disponible" en lugar de estimarlos, y las cifras de hardware que aparecen son cálculos derivados del número de parámetros, no mediciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el cuantizador lo describe como modelo de visión; no se detalla la arquitectura del modelo base) |
| Parámetros totales | 32.106.631.740 (32,1 mil millones) |
| Parámetros activos | no disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1/imatrix: Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, small-IQ4_NL; más fichero imatrix para generar cuantizaciones propias |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1); el repositorio estático del mismo autor ofrece las cuantizaciones estáticas y los ficheros mmproj |

Otros datos del repositorio: 0 descargas y 0 likes en el momento de la consulta, tamaño del repositorio 27,4 GB (conjunto de cuantizaciones; la tabla de la model card solo documenta el fichero imatrix, de 0,1 GB), fecha de creación indicada en los metadatos: 24 de octubre de 2026.

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base `SF-Foundation/Koa-express-31B-qat`. Los únicos indicios son indirectos: el sufijo "qat" del nombre suele identificar modelos sometidos a entrenamiento consciente de cuantización (quantization-aware training), y la model card del cuantizador afirma que se trata de un modelo de visión, lo que implica algún codificador visual adicional cuyos pesos principales residirían en el repositorio estático (ficheros mmproj). Ninguna de estas dos afirmaciones está confirmada por documentación del autor original en la información disponible.

Tampoco hay datos sobre volumen de tokens de entrenamiento, composición del dataset, fases de ajuste fino (SFT, RLHF, DPO) ni innovaciones técnicas (atención lineal, decodificación especulativa, decodificación multi-token). Lo que sí está documentado es el proceso de cuantización: mradermacher genera cuantizaciones ponderadas con matriz de importancia (imatrix), calculada a partir de un corpus de calibración, y publica el fichero `.imatrix.gguf` para que terceros puedan reproducir el proceso. El autor referencia el gráfico de ikawrakow sobre perplejidad comparada entre tipos de cuantización como guía de elección. La conversión se realizó desde el formato de Hugging Face (`convert_type: hf`, `output_tensor_quantised: 1`, `quantize_version: 2`).

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Procesamiento de imágenes: la model card del cuantizador declara que el modelo base es un modelo de visión; para usar la entrada visual es necesario el fichero mmproj del repositorio estático.
- Despliegue local compatible con el ecosistema GGUF (llama.cpp y derivados), incluida la etiqueta `endpoints_compatible`.
- Elección entre 21 cuantizaciones distintas, desde IQ1_S hasta Q4_K_M, lo que permite ajustar el equilibrio entre tamaño y fidelidad.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no, únicamente inglés según los metadatos.
- Modo thinking, audio u otras capacidades especiales: no disponible (no documentado).

## Casos de uso

- Procesamiento de documentos en local: el modelo puede recibir imágenes de facturas, formularios o páginas escaneadas y devolver texto estructurado en inglés, ejecutándose íntegramente en la infraestructura propia mediante llama.cpp con el mmproj del repositorio estático, sin enviar datos a terceros.
- Descripción automática de imágenes (alt-text) para catálogos o intranets: al ser un modelo de visión, encaja en pipelines por lotes que generan descripciones en inglés para bibliotecas de imágenes, con la ventaja de que un GGUF de 4 bits cabe en una GPU de 24 GB.
- Asistente conversacional interno en inglés: el etiquetado `conversational` y el formato GGUF permiten montar un chatbot de uso interno con Ollama o llama.cpp sobre una estación de trabajo, adecuado para equipos que exigen que los datos no salgan de su red.
- Despliegue en entornos air-gapped: al ser un artefacto descargable y autónomo (sin dependencia de API), sirve para organismos o empresas con redes aisladas que necesitan un modelo multimodal de ~32B.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 21 variantes i1 más el fichero imatrix, lo que permite medir experimentalmente en el propio dominio la pérdida de calidad entre IQ1_S y Q4_K_M antes de fijar una configuración de producción.
- Revisión asistida de capturas de pantalla o interfaces: generación de resúmenes y descripciones en inglés de imágenes de UI para documentación técnica o tickets de soporte, con revisión humana posterior.
- Prototipado rápido de producto: validar si un modelo multimodal de 32B es suficiente para una tarea antes de invertir en infraestructura, usando cuantizaciones Q2_K o Q3_K_M en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única referencia cuantitativa de la model card es el gráfico externo de ikawrakow que compara la perplejidad de distintos tipos de cuantización de baja calidad (no es una evaluación del modelo, sino del efecto de la compresión). No se dispone de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra métrica del modelo base.

## Requisitos de hardware

Estimaciones calculadas a partir de 32,1 mil millones de parámetros (pesos + overhead aproximado; no incluyen la caché KV, cuyo tamaño depende de una longitud de contexto que no se ha publicado):

| Cuantización | Tamaño estimado de pesos | VRAM recomendada |
|---|---|---|
| IQ1_S | ~6,5 GB | 8-10 GB |
| Q2_K | ~11,6 GB | 14-16 GB |
| Q3_K_M | ~15,7 GB | 18-20 GB |
| IQ4_XS | ~17,0 GB | 20-22 GB |
| Q4_K_M | ~19,5 GB | 22-24 GB |
| Q5_K_M | ~23 GB | 26-28 GB |
| Q6_K | ~26,5 GB | 30-32 GB |
| Q8_0 | ~34 GB | 40 GB |
| FP16 (no publicado en este repo) | ~64,2 GB | 70-80 GB |

- GPU recomendadas: A100 80 GB o H100 para Q8_0 y FP16; A100 40 GB o L40S 48 GB para Q5_K_M y Q6_K; RTX 3090 / RTX 4090 (24 GB) para Q4_K_M e inferiores.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con Q4_K_M o inferiores; en tarjetas de 16 GB con Q3_K_M o Q2_K; en 8-12 GB solo con IQ1_S/IQ2 y aceptando degradación notable.
- Configuración híbrida: para cuantizaciones de 4 bits en adelante, el offload parcial de capas a CPU con llama.cpp permite ejecutar en equipos sin GPU de gran VRAM, a costa de latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui. vLLM y TGI no están pensados para GGUF de forma nativa (vLLM tiene soporte GGUF experimental y limitado); para servirlos en producción con estas herramientas habría que usar el modelo base en safetensors.
- Latencia y throughput: no hay mediciones publicadas. Como cota teórica, un modelo de ~19,5 GB en 4 bits limitado por ancho de banda en una RTX 4090 (~1 TB/s) no puede superar aproximadamente 50 tokens/s en generación; en IQ1_S sobre la misma GPU la cota ronda los 150 tokens/s. Son límites superiores teóricos, no cifras medidas.
- Para usar la entrada de imagen es necesario descargar además el fichero mmproj del repositorio estático `mradermacher/Koa-express-31B-qat-GGUF`.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada modelos comparables con especificaciones publicadas (contexto, benchmarks, licencia). La comparación siguiente se limita a lo que consta en los metadatos de cada repositorio:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Koa-express-31B-qat-i1-GGUF | 32,1 mil millones | no disponible | no disponible | GGUF (i1/imatrix) | Modelo de visión según el cuantizador; solo inglés; 0 descargas |
| SF-Foundation/Koa-express-31B-qat | 32,1 mil millones (heredado) | no disponible | no disponible | no verificado | Modelo base del que se derivan estas cuantizaciones |
| mradermacher/Equinox-31B-i1-GGUF | 31B (según nombre) | no disponible | no disponible | GGUF (i1) | Alternativa del mismo cuantizador y tamaño similar; sin datos técnicos públicos en la búsqueda realizada |
| mradermacher/Koa-AI-v1-Code-3B-GGUF | 3B | no disponible | no disponible | GGUF | No comparable por tamaño; aparece en la búsqueda por compartir familia de nombre |

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial. Antes de cualquier despliegue en producción hay que verificar la licencia del modelo base `SF-Foundation/Koa-express-31B-qat`.
- Idiomas: solo inglés según los metadatos; el rendimiento en castellano es, como mínimo, incierto y probablemente degradado.
- Modelo base sin documentación accesible en la información proporcionada: se desconoce el dataset de entrenamiento, los filtros aplicados y los sesgos presentes. No hay base para afirmar que sea seguro en dominios sensibles.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks publicados no hay forma de cuantificarlo. En tareas de visión (lectura de documentos, OCR implícito) el riesgo de inventar contenido ausente en la imagen es especialmente relevante y exige verificación.
- Degradación por cuantización: las variantes IQ1_S, IQ1_M, IQ2_XXS e IQ2_XS son agresivas; en un modelo de 32B pueden producir pérdidas de calidad notables en razonamiento y en tareas multimodales. La model card remite al gráfico de perplejidad de ikawrakow, que no sustituye a una evaluación en el dominio propio.
- Contexto desconocido: no se debe asumir una ventana larga. Cualquier caso de uso con documentos extensos o conversaciones multi-turno largas requiere verificar primero el límite real del modelo base.
- Visión incompleta sin mmproj: el repositorio i1 no incluye los ficheros de proyección multimodal; sin descargarlos del repositorio estático, el modelo funciona solo como texto.
- Madurez: 0 descargas y 0 likes, publicados el 24 de octubre de 2026 según los metadatos. No hay validación comunitaria ni informes independientes de calidad.
- Fecha de creación en el futuro respecto a los modelos de la búsqueda: conviene comprobar la vigencia del repositorio antes de integrarlo en un pipeline automatizado.
- Si se requiere serving de alta concurrencia (vLLM, TGI), este repositorio no es la vía adecuada: habría que partir del modelo base en safetensors.

## Enlaces

- Repositorio HuggingFace (cuantizaciones i1/imatrix): https://huggingface.co/mradermacher/Koa-express-31B-qat-i1-GGUF
- Repositorio de cuantizaciones estáticas y ficheros mmproj: https://huggingface.co/mradermacher/Koa-express-31B-qat-GGUF
- Modelo base: https://huggingface.co/SF-Foundation/Koa-express-31B-qat
- Página de descargas del cuantizador para este modelo: https://hf.tst.eu/model#Koa-express-31B-qat-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Koa-express-31B-qat-i1-GGUF/resolve/main/Koa-express-31B-qat.imatrix.gguf
- Preguntas frecuentes y peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
