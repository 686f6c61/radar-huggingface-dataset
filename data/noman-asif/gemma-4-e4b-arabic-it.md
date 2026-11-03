# noman-asif/Gemma-4-E4B-Arabic-It

## Resumen

Gemma-4-E4B-Arabic-It es un ajuste fino del modelo Google Gemma-4-E4B-it orientado a arabe estandar y dialecto saudí, desarrollado por Noman Asif dentro de la familia "Gemma-4-Arabic Iso-Active". El modelo parte de una arquitectura transformer densa y se presenta como la variante "edge" de la familia, con aproximadamente 4.000 millones de parámetros activos por token y un total real declarado de 4.500 millones en la model card (el recuento de safetensors del repositorio asciende a 7.996.156.490 parámetros, discrepancia que conviene verificar antes de desplegar). Su objetivo es mejorar el razonamiento, el conocimiento enciclopédico árabe, la retórica clásica y el derecho estatutario saudí sin degradar las capacidades originales en inglés, matemáticas y código.

El entrenamiento combina un ajuste supervisado continuo sobre 120.000 muestras (75 % árabe, 25 % replay en inglés) mediante rsLoRA con r=32 y alpha=64, seguido de una alineación con Trust-Region DPO sobre 20.000 pares de preferencia (beta=0.1, tr_alpha=0.6) y una fusión posterior con TIES-Merging (lambda=0.85, density=0.85). El autor reporta una "retención perfecta" en cuatro anclas en inglés, matemáticas y código, lo que sugiere que el ajuste se diseñó para preservar las capacidades del modelo base.

Es relevante para equipos que necesitan un modelo competente en árabe con latencia de un modelo de ~4B activos, desplegable en estaciones de trabajo y GPUs de consumo, y con licencia Apache 2.0. La familia incluye además una variante MoE dispersa de 25.200 millones de parámetros totales y 3.800 millones activos, pensada para mayor capacidad de conocimiento con latencia similar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4) |
| Parametros totales | 4.500 millones según model card; 7.996.156.490 según safetensors del repositorio |
| Parametros activos | 4.000 millones (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bfloat16; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Arabe (estandar y dialecto saudí) e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, checkpoint standalone de 16 bits) |

## Arquitectura y entrenamiento

El modelo es un transformer denso derivado de google/gemma-4-E4B-it, con unos 4.000 millones de parámetros activos por token. El pipeline de entrenamiento tiene tres etapas: (1) SFT continuo con rsLoRA (r=32, alpha=64) sobre el dataset noman-asif/Arabic-Reasoning-Instruct-120k, compuesto por un 75 % de datos árabes y un 25 % de replay en inglés para mitigar el olvido catastrófico; (2) alineación con Trust-Region DPO (beta=0.1, tr_alpha=0.6) sobre noman-asif/Arabic-Preference-DPO-20k, una variante de DPO que restringe la divergencia respecto a la política de referencia; y (3) fusión de pesos con TIES-Merging (lambda=0.85, density=0.85) para combinar los adaptadores con el modelo base de forma estable.

La innovación metodológica destacable es la combinación de rsLoRA con DPO de región de confianza y TIES-Merging, orientada a maximizar la ganancia en árabe sin sacrificar las capacidades del modelo original. El autor reporta una retención del 100 % en MMLU-Pro, GSM8K, HumanEval y ARC-Challenge tras el ajuste, lo que respalda esa estrategia. No se documentan en la información disponible detalles sobre el número total de tokens de entrenamiento, la composición exacta del corpus ni innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en árabe estandar y dialecto saudí, con soporte de inglés.
- Razonamiento con cadena de pensamiento (chain-of-thought), etiquetado explícitamente en el modelo.
- Conocimiento enciclopédico árabe, retórica clásica (Balagha), cultura saudí y derecho estatutario saudí.
- Matemáticas con razonamiento (evaluado en MGSM-Ar).
- Generación de código (evaluado en HumanEval, con retención del 100 % respecto al base).
- Razonamiento en inglés, matemáticas y ciencia (MMLU-Pro, GSM8K, ARC-Challenge).
- Seguridad y alineación evaluadas con AraTrust.
- Modalidad image-text-to-text declarada en los tags del repositorio (heredada del modelo base Gemma 4).
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el chain-of-thought facilita flujos multi-paso.

## Casos de uso

- Atención al cliente en árabe y dialecto saudí: el modelo puede gestionar conversaciones multi-turno con registro dialectal saudí, adecuado para sectores como banca, telecomunicaciones o e-commerce en Arabia Saudí.
- Asistencia legal sobre derecho estatutario saudí: el ajuste incluye conocimiento específico de normativa laboral y estatutaria, útil para borradores de consultas y resúmenes de contratos (siempre con revisión humana).
- Generación de contenido editorial en árabe: redacción de artículos, comunicados y material de marketing con registro culto y retórica árabe clásica.
- Tutoría educativa en árabe: resolución de problemas de matemáticas con cadena de pensamiento (MGSM-Ar) y explicaciones paso a paso para estudiantes arabófonos.
- Traducción y localización asistida árabe-inglés: el modelo mantiene capacidades en inglés (MMLU-Pro sin degradación), lo que permite usarlo en pipelines bilingües.
- Asistente de código bilingüe: generación y revisión de código con instrucciones en árabe o inglés, apoyándose en la retención del 100 % en HumanEval.
- Moderación y filtrado de contenido en árabe: uso de las capacidades de seguridad evaluadas con AraTrust para clasificar respuestas sensibles.
- Despliegue en edge o estación de trabajo: al activar ~4B parámetros, es viable en GPUs de consumo para prototipos y demos locales.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (porcentajes, zero-shot salvo indicación):

| Benchmark | Metrica | Shots | E4B base | E4B Arabic-It | Delta |
|---|---|---|---|---|---|
| ArabicMMLU | acc_norm | 0 | 55,20 | 64,50 | +9,30 |
| MadinahQA | acc_norm | 0 | 53,80 | 65,00 | +11,20 |
| AlGhafa | acc_norm | 0 | 57,10 | 66,00 | +8,90 |
| ACVA (cultura saudí y árabe) | acc_norm | 0 | 68,40 | 78,50 | +10,10 |
| EXAMS-AR | acc_norm | 5 | 51,00 | 60,50 | +9,50 |
| AraTrust (seguridad) | acc_norm | 0 | 72,50 | 82,00 | +9,50 |
| MGSM-Ar (matemáticas CoT) | exact_match | 5 | 54,00 | 66,50 | +12,50 |

Anclas de retención (inglés, matemáticas y código):

| Ancla | Dominio | Shots | E4B base | E4B Arabic-It | Retención |
|---|---|---|---|---|---|
| MMLU-Pro | Razonamiento en inglés | 5 | 69,40 | 69,40 | 100,0 % |
| GSM8K | Matemáticas CoT | 8 | 84,20 | 84,20 | 100,0 % |
| HumanEval | Generación de código | 0 | 74,40 | 74,40 | 100,0 % |
| ARC-Challenge | Lógica científica | 25 | 85,10 | 85,10 | 100,0 % |

No se han publicado en la información disponible comparaciones con modelos externos a la familia (por ejemplo, otros ajustes árabes de la misma talla).

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint se publica en bfloat16 (16 GB de repositorio), por lo que la inferencia en 16 bits requiere aproximadamente 10-12 GB de VRAM para pesos y overhead de activaciones; en cuantización de 8 bits bajaría a ~5-6 GB y en 4 bits a ~3-4 GB (estimaciones, no verificadas con el modelo).
- GPUs recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para producción en 16 bits; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en bfloat16 de un modelo de ~4B activos.
- Cabe en GPU de consumo: sí, en RTX 4090, 4080, 3090 y 3080 (12 GB) con cuantización; en 16 bits, una RTX 3080 de 10-12 GB podría quedar justa.
- Opciones de despliegue: transformers (soporte nativo, según la model card), vLLM y TGI para serving (compatibles con arquitecturas Gemma, aunque no se documenta explícitamente para esta variante), llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas oficialmente).
- Latencia y throughput: el autor reporta ~100-118 tok/s para la familia Iso-Active, con latencia casi idéntica entre el E4B denso y el 26B-A4B MoE; no se especifica el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-E4B-Arabic-It | 4,5B (card) / 8,0B (safetensors) | 4,0B | no disponible | Apache 2.0 | HuggingFace |
| Gemma-4-26B-A4B-Arabic-It | 25,2B | 3,8B | no disponible | Apache 2.0 | HuggingFace |
| google/gemma-4-E4B-it (base) | no disponible | 4,0B | no disponible | Gemma (no Apache 2.0) | HuggingFace |

Comparación de rendimiento reportada por el autor:

| Benchmark | E4B Arabic-It | 26B-A4B Arabic-It |
|---|---|---|
| ArabicMMLU | 64,50 | 74,50 |
| MadinahQA | 65,00 | 75,50 |
| AlGhafa | 66,00 | 75,20 |
| ACVA | 78,50 | 85,00 |
| EXAMS-AR | 60,50 | 69,50 |
| AraTrust | 82,00 | 88,50 |
| MGSM-Ar | 66,50 | 79,50 |

No se dispone de datos de comparación con otros ajustes árabes de talla similar (por ejemplo, variantes de Llama o Qwen afinadas para árabe) en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia entre los parámetros declarados en la model card (4,5B) y el recuento real de safetensors (7.996.156.490); conviene verificar el tamaño efectivo antes de planificar el despliegue.
- Los benchmarks son autoinformados por el autor; no se han replicado de forma independiente.
- Riesgo de alucinación en dominios legales y religiosos: el ajuste en derecho saudí y retórica clásica no garantiza exactitud factual; requiere revisión humana en producción.
- Sesgos potenciales derivados de los datasets de ajuste (Arabic-Reasoning-Instruct-120k y Arabic-Preference-DPO-20k), cuya composición y procedencia no se detallan.
- Cobertura limitada a árabe e inglés; el rendimiento en otros idiomas no está documentado y probablemente sea inferior al del modelo base.
- Longitud de contexto no documentada; no se debe asumir la ventana del modelo base sin verificar.
- El checkpoint se distribuye solo en bfloat16; no hay cuantizaciones oficiales (GGUF, AWQ, GPTQ) publicadas, lo que limita el despliegue en hardware modesto sin trabajo adicional.
- Aunque la licencia es Apache 2.0, el modelo base es Gemma de Google; conviene revisar los términos de la licencia Gemma aplicables al modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Soporte de tool calling y de agentes no documentado explícitamente; verificar antes de integrarlo en pipelines agénticos.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/noman-asif/Gemma-4-E4B-Arabic-It
- Modelo hermano MoE: https://huggingface.co/noman-asif/Gemma-4-26B-A4B-Arabic-It
- Dataset SFT: https://huggingface.co/datasets/noman-asif/Arabic-Reasoning-Instruct-120k
- Dataset DPO: https://huggingface.co/datasets/noman-asif/Arabic-Preference-DPO-20k
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Perfil del autor: https://huggingface.co/noman-asif
