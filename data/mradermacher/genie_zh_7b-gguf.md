# mradermacher/GENIE_zh_7b-GGUF

## Resumen

GENIE_zh_7b es un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) desarrollado originalmente por el grupo THUMedInfo de la Universidad de Tsinghua, orientado a la estructuración de información en registros médicos electrónicos (EHR) y a la extracción de información (IE) en chino. La versión aquí descrita es una cuantización GGUF estática producida por mradermacher a partir del modelo base THUMedInfo/GENIE_zh_7b, publicada el 11 de febrero de 2025 y actualizada por última vez el 3 de noviembre de 2026.

El modelo está etiquetado como conversacional y especializado en tareas de *structuring* sobre documentación clínica: transformar texto libre de historiales médicos en estructuras de datos explícitas (entidades, relaciones, campos normalizados). Su relevancia radica en que aborda un cuello de botella real en sistemas sanitarios: la conversión de notas clínicas no estructuradas en datos explotables para investigación, facturación o sistemas de apoyo a la decisión.

La ficha se centra en la versión GGUF, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados, con cuantizaciones desde Q2_K (3,1 GB) hasta f16 (15,3 GB). La licencia Apache 2.0 facilita su uso comercial, aunque el modelo está entrenado y evaluado fundamentalmente en chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, sin confirmar en la informacion proporcionada) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. El repositorio GGUF no incluye detalles sobre el tipo de transformer, el número de capas, la dimensión oculta ni la estrategia de atención. Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El modelo base pertenece al grupo THUMedInfo, asociado a la Universidad de Tsinghua, y está especializado en dominios médicos en chino.

La innovación principal de esta publicación no reside en el modelo en sí, sino en el proceso de cuantización estática realizado por mradermacher. Según la model card, no se han generado cuantizaciones ponderadas con imatrix para este modelo en el momento de la publicación, por lo que todas las variantes son cuantizaciones estáticas. El proceso de conversión parte de pesos en formato Hugging Face (convert_type: hf) y produce ficheros GGUF compatibles con llama.cpp.

## Capacidades

- Generación de texto conversacional en chino, con etiqueta `conversational` en el repositorio.
- Estructuración de información médica: extracción y normalización de entidades clínicas a partir de texto libre.
- Procesamiento de registros médicos electrónicos (EHR): identificación de campos, relaciones y valores en historiales.
- Extracción de información (IE) en dominio sanitario y en idioma chino.
- Capacidad multilingüe: no disponible; el modelo declara únicamente `zh` como idioma soportado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Estructuración de notas clínicas: el modelo convierte texto libre de historiales médicos en campos normalizados (diagnósticos, medicación, dosis, fechas), lo que permite poblar bases de datos clínicas de forma semiautomática. Es adecuado por su entrenamiento específico en tareas de *structuring* sobre EHR en chino.

- Extracción de entidades médicas para investigación: a partir de corpus de informes clínicos en chino, el modelo puede identificar entidades (fármacos, enfermedades, procedimientos) y sus relaciones, facilitando la construcción de datasets anotados para estudios retrospectivos.

- Normalización de terminología clínica: integrado en un pipeline de preprocesamiento, el modelo puede mapear variantes léxicas de términos médicos a formas canónicas antes de su codificación con ontologías como ICD o SNOMED, siempre que se valide la salida.

- Digitalización de registros en papel: combinado con un motor OCR para chino, el modelo puede recibir el texto reconocido y estructurarlo en un esquema JSON predefinido, reduciendo la intervención manual en la migración de archivos históricos.

- Asistencia a la codificación clínica: el modelo puede proponer códigos o categorías diagnósticas a partir de la descripción textual, sirviendo como borrador que un codificador humano revisa y confirma.

- Procesamiento por lotes en local: gracias a las cuantizaciones GGUF (desde 3,1 GB en Q2_K), es posible desplegar el modelo en estaciones de trabajo sin GPU dedicada de gama alta para tareas de extracción por lotes sobre documentación sensible, manteniendo los datos dentro de la infraestructura del hospital.

- Prototipado de asistentes clínicos en chino: para equipos que desarrollan interfaces conversacionales de apoyo a la documentación clínica, el modelo ofrece una base ajustable con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~3,1 GB; Q3_K_S ~3,6 GB; Q4_K_M ~4,8 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB. Estas cifras corresponden al tamaño de los ficheros y no incluyen el overhead del contexto KV cache.
- GPU recomendadas: para f16, una GPU con 16-24 GB de VRAM (RTX 4090, A10G, L4). Para Q4_K_M o Q5_K_M, una GPU de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) es suficiente.
- Cabe en GPU de consumo: sí. Las cuantizaciones Q2_K a Q5_K_M caben en GPUs de 6-8 GB; Q6_K y Q8_0 requieren 8-12 GB; f16 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El repositorio declara `endpoints_compatible`, lo que sugiere compatibilidad con endpoints tipo OpenAI a través de servidores GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| GENIE_zh_7b (esta ficha) | 7,6 B | no disponible | zh | Apache 2.0 | GGUF, safetensors | Especializado en EHR/IE médico en chino |
| Modelos médicos chinos de ~7B (p. ej. variantes de Qwen/Baichuan ajustadas) | ~7 B | variable | zh | variable | safetensors, GGUF | No disponible comparación directa de rendimiento |
| Modelos generalistas de 7B (p. ej. Qwen2.5-7B) | ~7 B | 32K-128K según variante | multilingüe | Apache 2.0 | safetensors, GGUF | No especializados en dominio médico |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparativa anterior es estructural y no implica superioridad de rendimiento en ninguna dirección.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente en chino; su uso en castellano u otros idiomas no está soportado y probablemente produzca resultados deficientes.
- No se documentan sesgos conocidos, pero un modelo médico entrenado con datos clínicos en chino puede heredar sesgos demográficos, institucionales y de codificación de los corpus de origen.
- Riesgo de alucinación relevante en dominio sanitario: la extracción de entidades o la normalización de términos puede producir valores plausibles pero incorrectos. Cualquier salida debe validarse antes de su uso clínico o administrativo.
- No apto para uso clínico directo sin supervisión humana: no se han publicado evaluaciones de seguridad ni validación regulatoria.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden estar sujetos a restricciones adicionales no documentadas en el repositorio GGUF.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; para tareas de extracción de información se recomienda Q4_K_M o superior.
- No se dispone de información sobre la longitud de contexto soportada, lo que impide planificar su uso con documentos largos sin pruebas empíricas.
- El repositorio GGUF no incluye cuantizaciones ponderadas con imatrix, lo que puede reducir la calidad respecto a otras publicaciones del mismo autor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/GENIE_zh_7b-GGUF
- Modelo base: https://huggingface.co/THUMedInfo/GENIE_zh_7b
- Página de descargas del autor: https://hf.tst.eu/model#GENIE_zh_7b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Organización del autor (nethype GmbH): https://www.nethype.de/
