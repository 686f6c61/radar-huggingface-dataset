# calfa-ai/amidda1.0Line4B

## Resumen

AMIDDA 1.0 Line 4B es un modelo de visión-lenguaje (VLM) especializado en reconocimiento de texto manuscrito (HTR) a nivel de línea para escritura árabe. Lo desarrolla Calfa (calfa.fr) y se presenta como un modelo fundacional único que cubre manuscritos árabes magrebíes y orientales, litografías en urdu, persa y escritura árabe moderna, en lugar de la colección de modelos especializados por corpus que lo precedieron. Está construido sobre Qwen/Qwen3.5-VL-4B-Instruct mediante un ajuste LoRA (r = 64) con el adaptador fusionado en los pesos base, y suma 4.539.265.536 parámetros (~4,54 mil millones) en formato safetensors.

El problema que aborda es la fragmentación del HTR árabe: cada corpus histórico solía requerir su propio modelo entrenado desde cero. AMIDDA 1.0 Line 4B se entrena sobre AMIDDA, un agregado de 53.420 líneas de entrenamiento procedentes de ocho corpus, y obtiene un CER global del 23,1 % en el split de test (6.684 líneas), frente al 104,3 % de QARI-OCR v0.3 en zero-shot y el 18,3 % de Gemini 3 Flash con 25 ejemplos de contexto.

Su relevancia actual es metodológica y de dominio: demuestra que un único VLM genérico puede aproximarse a modelos especializados por corpus en HTR árabe, aunque los baselines CTC específicos por corpus (CER global del 6,4 %) siguen muy por delante. El trabajo se presentó en HIP 2026, dentro de ICDAR 2026, y el autor advierte explícitamente que **no está diseñado para producción**.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model Qwen3.5-VL (`qwen3_5`), con alternancia de capas de atención lineal y atención completa |
| Parametros totales | 4.539.265.536 (~4,54 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponibles; el repositorio distribuye unicamente pesos safetensors |
| Idiomas soportados | Arabe (ar), urdu (ur), persa (fa) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

Datos adicionales: modelo base Qwen/Qwen3.5-VL-4B-Instruct, pipeline `image-to-text`, tamano del repositorio 9,1 GB, 0 descargas y 0 likes en el momento de la consulta, publicado el 11 de septiembre de 2026.

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-VL-4B-Instruct, un transformer multimodal cuyo backbone alterna capas de atención lineal y de atención completa. Sobre esa base se aplicó un ajuste LoRA con rango r = 64 y el adaptador resultante se fusionó en los pesos base, de modo que la inferencia no requiere cargar adaptadores por separado. La tarea es HTR a nivel de línea sobre imágenes ya segmentadas: el modelo recibe el recorte de una única línea de texto y devuelve su transcripción.

Los datos de entrenamiento proceden del corpus AMIDDA, con 53.420 líneas de entrenamiento repartidas en ocho corpus: RASAM-1, RASAM-2, TARIMA, BAYBARS, ISKANDAR, KHATT, MUHARAF y RASM (British Library, no redistribuido). El split de test tiene 6.684 líneas. Las transcripciones conservan el texto tal como aparece en el documento original, sin normalización, modernización ni corrección editorial; los diacríticos (tashkil) solo se transcriben cuando las guías de anotación del corpus de origen los registran, lo que varía entre corpus (columna `transcription_guidelines` de AMIDDA). No se menciona en la informacion disponible el uso de RLHF, DPO ni decodificación especulativa durante el ajuste.

Como innovación operativa destaca el soporte de kernels optimizados: `causal-conv1d` y `flash-linear-attention` en CUDA. Sin ellos, transformers recurre silenciosamente a implementaciones de referencia en PyTorch que son correctas pero mucho más lentas, algo crítico en una arquitectura con capas de atención lineal.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) a nivel de línea sobre imágenes recortadas de una sola línea de texto.
- Transcripción de manuscritos árabes magrebíes y orientales, litografías en urdu, textos en persa y escritura árabe moderna.
- Procesamiento multimodal imagen-texto con salida de transcripción en texto plano.
- Preservación de la forma original del texto, sin normalización ni modernización, incluyendo la transcripción parcial de diacríticos según el corpus.
- Integración con el pipeline DocWorkflow para entrada/salida ALTO XML, extracción de líneas, batching y cálculo de métricas.
- Modo de pensamiento desactivable: la inferencia especializada requiere `enable_thinking=False`.
- No dispone de soporte documentado de tool calling, function calling, agentes o razonamiento multi-paso, ya que está diseñado como transcriptor de línea única.
- No se documentan capacidades de audio ni de visión generalista más allá de la lectura de líneas de texto.

## Casos de uso

- Digitalización de fondos manuscritos árabes en bibliotecas y archivos: tras segmentar las páginas en líneas con una herramienta externa, el modelo transcribe cada recorte, y el pipeline DocWorkflow reconstruye la salida en ALTO XML para integrarla en el catálogo digital.
- Investigación filológica sobre corpus magrebíes y orientales: al preservar la grafía original sin normalizar, permite estudiar variantes ortográficas y de vocalización directamente sobre la transcripción generada.
- Procesamiento de litografías en urdu para proyectos de patrimonio documental del subcontinente, cubriendo un tipo de material poco atendido por los OCR comerciales.
- Transcripción asistida de manuscritos persas y árabes modernos como paso previo a la revisión humana, aprovechando que el modelo es genérico y no exige entrenar un modelo distinto por colección.
- Evaluación comparativa de sistemas HTR: sirve como referencia abierta (CER global del 23,1 % en AMIDDA) frente a modelos propietarios evaluados en zero-shot o con few-shot ICL.
- Extracción masiva de líneas para construir datasets de entrenamiento adicionales, usando el modelo como etiquetador inicial y filtrando después por confianza o por revisión manual.
- Despliegue en entornos de investigación con GPU única, dado que el modelo cabe en GPUs de consumo con suficiente memoria y no requiere infraestructura distribuida.

## Benchmarks y rendimiento

CER (%) en el split de test de AMIDDA (6.684 líneas), por corpus de origen. Menor es mejor. La fila CTC corresponde a baselines RNN especializados por corpus y no a un modelo genérico único.

| Metodo | baybars | iskandar | khatt | muharaf | rasam1 | rasam2 | rasm | tarima | Overall |
|:---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| AMIDDA 1.0 Line 4B | 13,4 | 15,9 | 9,8 | 30,1 | 25,0 | 27,6 | 37,4 | 24,2 | 23,1 |
| QARI-OCR v0.3, zero-shot | 140,1 | 113,6 | 50,9 | 105,9 | 114,6 | 100,6 | 71,2 | 85,1 | 104,3 |
| Gemini 3 Flash, 25-shot ICL | 11,2 | 11,8 | 7,5 | 22,5 | 16,5 | 29,0 | 21,1 | 25,6 | 18,3 |
| CTC, una RNN por corpus | 7,8 | no disponible | 6,1 | 9,5 | 3,6 | 4,9 | 8,9 | 3,9 | 6,4 |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), lo cual es coherente con la naturaleza especializada del modelo.

## Requisitos de hardware

No se publican requisitos oficiales de hardware. Las cifras siguientes son estimaciones derivadas del número de parámetros (4.539 millones) y deben tomarse como orientativas.

- VRAM estimada en bf16/fp16: en torno a 9 GB solo para los pesos, más overhead de activaciones y del codificador visual; en la práctica, aproximadamente 11-13 GB para inferencia con imágenes.
- VRAM estimada en cuantización de 8 bits: en torno a 5-7 GB incluyendo overhead.
- VRAM estimada en cuantización de 4 bits: en torno a 4-5 GB incluyendo overhead.
- GPU recomendadas para bf16: A100 (40/80 GB), H100, L40S o cualquier GPU con 16 GB o más de VRAM.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) y modelos equivalentes; en tarjetas de 8-12 GB requeriría cuantización, no documentada oficialmente.
- Opciones de despliegue documentadas: transformers >= 5.9 (obligatorio, ya que versiones anteriores no implementan la arquitectura `qwen3_5`), junto con torch, accelerate y pillow; y el pipeline DocWorkflow mediante `docworkflow -c amidda1.0Line4B.yml predict -t htr -d test`.
- Kernels recomendados en CUDA: `pip install causal-conv1d flash-linear-attention`. Sin ellos, transformers usa implementaciones de referencia mucho más lentas.
- Parámetros de inferencia sugeridos por el autor: `max_new_tokens=128`, `max_pixels=401408`, `line_batch_size=8` en DocWorkflow, `do_sample=False` y `enable_thinking=False`.
- Latencia y throughput concretos: no disponibles en la informacion proporcionada.
- No hay confirmación de soporte para vLLM, TGI, llama.cpp u Ollama en la documentación del modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | CER global (AMIDDA) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AMIDDA 1.0 Line 4B | VLM afinado con LoRA, modelo unico | 4,54 mil millones | No disponible | 23,1 | Apache 2.0 | Pesos abiertos en HuggingFace |
| QARI-OCR v0.3 | OCR/HTR arabe, evaluado zero-shot | No disponible | No disponible | 104,3 | No disponible | No disponible en la informacion proporcionada |
| Gemini 3 Flash | Modelo propietario multimodal, 25-shot ICL | No disponible | No disponible | 18,3 | Propietaria | API de Google |
| Baselines CTC | Una RNN especializada por corpus | No disponible | No disponible | 6,4 | No disponible | No disponible en la informacion proporcionada |

La comparativa debe leerse con cautela: las filas CTC y Gemini 3 Flash no representan un modelo genérico único, sino, respectivamente, un conjunto de modelos especializados por corpus y un modelo propietario evaluado con 25 ejemplos en contexto. AMIDDA 1.0 Line 4B es el único de la tabla que es a la vez genérico, abierto y con pesos publicados.

## Limitaciones y advertencias

- El propio autor indica que el modelo **no está diseñado para producción**; es un modelo fundacional de investigación.
- Solo procesa líneas individuales ya segmentadas: no es un sistema OCR a nivel de página y requiere segmentación previa obligatoria.
- Rendimiento desigual por corpus: el CER sube al 37,4 % en `rasm` y al 30,1 % en `muharaf`, frente al 9,8 % en `khatt`. En corpus con grafías menos representadas el error se dispara.
- Está muy por detrás de los baselines CTC especializados por corpus (23,1 % frente a 6,4 % de CER global), lo que limita su uso en tareas donde se exige alta precisión.
- Riesgo de alucinación inherente a los modelos de visión-lenguaje: puede generar texto plausible que no corresponde al contenido real de la imagen, especialmente en recortes de baja calidad o con grafía inusual.
- Las transcripciones no se normalizan ni modernizan, por lo que no sirven directamente para aplicaciones que esperan texto estándar.
- La transcripción de diacríticos es inconsistente y depende de las guías de anotación del corpus de origen, no de una decisión uniforme del modelo.
- Idiomas limitados a árabe, urdu y persa; no hay soporte documentado para otras lenguas ni para escritura latina.
- Sesgos potenciales derivados de los corpus de entrenamiento: predominio de materiales históricos manuscritos y litográficos, con posibles sesgos de época, región y escuela caligráfica que no se han evaluado en la informacion disponible.
- Es obligatorio usar `enable_thinking=False`; activar el modo de pensamiento degrada o invalida la tarea de transcripción.
- Requiere transformers >= 5.9; versiones anteriores no cargan la arquitectura `qwen3_5`.
- Sin los kernels `causal-conv1d` y `flash-linear-attention` en CUDA, el rendimiento cae de forma notable por el fallback silencioso a implementaciones de referencia.
- La licencia Apache 2.0 permite uso comercial, pero la recomendación explícita del autor de no usar el modelo en producción es un caveat relevante para cualquier despliegue real.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe todavía validación independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/calfa-ai/amidda1.0Line4B
- Dataset AMIDDA: https://huggingface.co/datasets/calfa-ai/AMIDDA
- Coleccion Arabic HTR: https://huggingface.co/collections/calfa-ai/arabic-htr
- Informe del sistema (HAL): https://enc.hal.science/hal-05693582
- Repositorio DocWorkflow: https://github.com/TheoMoins/DocWorkflow
- Corpus RASAM-1: https://huggingface.co/datasets/calfa-ai/RASAM-1
- Corpus RASAM-2: https://huggingface.co/datasets/calfa-ai/RASAM-2
- Corpus TARIMA: https://huggingface.co/datasets/calfa-ai/TARIMA
- Corpus BAYBARS: https://huggingface.co/datasets/calfa-ai/BAYBARS
- Corpus ISKANDAR: https://huggingface.co/datasets/calfa-ai/ISKANDAR
- Corpus KHATT: https://huggingface.co/datasets/johnlockejrr/KHATT_v1.0_dataset
- Corpus MUHARAF: https://huggingface.co/datasets/aamijar/muharaf-public
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-VL-4B-Instruct
- Sitio del desarrollador: https://calfa.fr
