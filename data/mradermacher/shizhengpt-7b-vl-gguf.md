# mradermacher/ShizhenGPT-7B-VL-GGUF

## Resumen

ShizhenGPT-7B-VL es un modelo de lenguaje multimodal especializado en medicina tradicional china (MTC), desarrollado por FreedomIntelligence. Este repositorio concreto, publicado por mradermacher, contiene las cuantizaciones GGUF estáticas del modelo original, pensadas para su despliegue en llama.cpp y entornos compatibles. El modelo combina un backbone de lenguaje de aproximadamente 7.600 millones de parámetros con un proyector multimodal (mmproj) que le permite procesar imágenes junto a texto.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de dominio sanitario especializado en hardware de consumo, algo poco habitual en el ecosistema de modelos médicos. El modelo original fue entrenado sobre datasets específicos de MTC (TCM-Pretrain-Data-ShizhenGPT y TCM-Instruction-Tuning-ShizhenGPT), lo que lo orienta a tareas de consulta, diagnóstico asistido y explicación de conceptos de medicina tradicional china.

La información pública disponible es limitada: no se han publicado resultados de benchmarks ni detalles completos sobre la longitud de contexto o la composición exacta del dataset de entrenamiento. Esta ficha refleja únicamente los datos verificables del repositorio y del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LLM + proyector mmproj para visión); detalles internos no disponibles |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base FreedomIntelligence/ShizhenGPT-7B-VL es un LLM multimodal de aproximadamente 7.600 millones de parámetros. La componente multimodal se implementa mediante un proyector (mmproj) que se distribuye como archivo separado en las cuantizaciones GGUF, lo que permite procesar entradas de imagen junto con texto. No se dispone de información detallada sobre el número de capas, la dimensión oculta ni el mecanismo de atención empleado.

El entrenamiento se realizó sobre dos datasets propietarios de FreedomIntelligence: TCM-Pretrain-Data-ShizhenGPT (pretraining) y TCM-Instruction-Tuning-ShizhenGPT (ajuste por instrucciones). No se han publicado el número de tokens, la composición exacta del corpus ni si se aplicaron técnicas de RLHF o DPO. La especialización en medicina tradicional china es el eje central del diseño, lo que explica el sesgo de dominio y el soporte exclusivo del chino.

## Capacidades

- Generación de texto en chino orientada a dominio médico y MTC.
- Procesamiento multimodal: acepta imágenes junto a texto mediante el proyector mmproj (por ejemplo, imágenes de plantas medicinales, diagramas o material clínico).
- Razonamiento y explicación de conceptos de medicina tradicional china.
- Respuesta conversacional multi-turno (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al chino según la metadata del repositorio.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Consulta de conceptos de MTC: el modelo puede explicar términos, síndromes y tratamientos de medicina tradicional china en chino, aprovechando su entrenamiento específico sobre corpus del dominio.
- Asistencia en identificación visual de material médico: gracias al proyector multimodal, puede analizar imágenes de plantas medicinales o preparados y generar descripciones textuales asociadas.
- Educación y formación: generación de material didáctico y respuestas a preguntas de estudiantes de medicina tradicional china, con un registro conversacional.
- Documentación clínica asistida: resumen y estructuración de notas o textos en chino relacionados con prácticas de MTC, siempre con supervisión profesional.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (4,8 GB) y Q5_K_M (5,5 GB) permiten ejecutar el modelo en GPUs consumer y en CPU mediante llama.cpp, útil para prototipos y demos locales.
- Investigación en NLP médico de dominio: base para experimentos de ajuste fino o evaluación en tareas de MTC, dado que el modelo y los datasets son de FreedomIntelligence con licencia Apache 2.0.
- Integración en pipelines con endpoints compatibles: el tag `endpoints_compatible` sugiere su uso en servicios de inferencia estandarizados, aunque la latencia y el throughput no están documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del LLM, sin mmproj): Q2_K ~3,1 GB; Q3_K_M ~3,9 GB; Q4_K_M ~4,8 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB.
- El proyector multimodal añade 1,0 GB (mmproj-Q8_0) o 1,5 GB (mmproj-f16) adicionales si se usa la entrada de imagen.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M/Q5_K_M con margen; RTX 4090 24 GB para Q8_0 o f16; A100/H100 para despliegues de mayor concurrencia (no se dispone de datos de throughput).
- Cabe en GPU consumer: sí, en modelos con 6-8 GB o más para cuantizaciones Q4/Q5; las cuantizaciones Q2/Q3 pueden ejecutarse incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors (no verificado en la información disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ShizhenGPT-7B-VL (esta ficha) | 7,6 B | No disponible | zh | Apache 2.0 | GGUF / safetensors |
| Modelos médicos generalistas de 7B (p. ej. variantes de Llama/Qwen ajustadas) | ~7-8 B | Variable según base | Multilingüe | Variable | GGUF / safetensors |
| Modelos multimodales de 7B de propósito general | ~7-8 B | Variable | Multilingüe | Variable | GGUF / safetensors |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa fiable con alternativas concretas. La comparativa anterior es estructural y no implica equivalencia de rendimiento.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo está especializado en medicina tradicional china; su rendimiento fuera de ese ámbito probablemente sea limitado.
- Idioma único: solo soporta chino según la metadata; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinación elevado en contexto sanitario: cualquier salida debe ser validada por profesionales; no debe usarse como herramienta de diagnóstico autónoma.
- Sesgos: al entrenarse sobre corpus de MTC, puede reproducir sesgos culturales y epistemológicos propios de esa tradición, además de posibles sesgos de los datasets de origen.
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones o documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento originales, que no se detallan en esta información.
- Repositorio de cuantización: este repo es una conversión de terceros (mradermacher); la responsabilidad sobre el modelo original recae en FreedomIntelligence.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, lo que dificulta la evaluación en producción.
- El tamaño del repo (70,4 GB) incluye todas las cuantizaciones; la descarga debe hacerse archivo por archivo.

## Enlaces

- Repositorio HuggingFace (esta cuantización): https://huggingface.co/mradermacher/ShizhenGPT-7B-VL-GGUF
- Modelo base: https://huggingface.co/FreedomIntelligence/ShizhenGPT-7B-VL
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/ShizhenGPT-7B-VL-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#ShizhenGPT-7B-VL-GGUF
- Dataset de pretraining: https://huggingface.co/datasets/FreedomIntelligence/TCM-Pretrain-Data-ShizhenGPT
- Dataset de instruction tuning: https://huggingface.co/datasets/FreedomIntelligence/TCM-Instruction-Tuning-ShizhenGPT
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
