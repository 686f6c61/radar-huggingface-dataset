# mradermacher/qwen2-5-vl-sanskrit-ocr-GGUF

## Resumen

`mradermacher/qwen2-5-vl-sanskrit-ocr-GGUF` es la version cuantizada en formato GGUF del modelo `snskrt/qwen2-5-vl-sanskrit-ocr`, un ajuste fino de Qwen2.5-VL especializado en reconocimiento optico de caracteres (OCR) de sanscrito. El modelo base parte de la familia Qwen2.5-VL de Alibaba, adaptada mediante entrenamiento supervisado con el framework Axolotl sobre corpus paralelos de OCR en sanscrito. El resultado es un modelo vision-lenguaje capaz de transcribir texto sanscrito desde imagenes y devolver la transcripcion en formato conversacional.

El modelo cuenta con 7.615.616.512 parametros (aproximadamente 7,6 mil millones), lo que lo situa en la categoria de modelos compactos de vision-lenguaje. Esta orientado a una unica lengua (sanscrito, codigo ISO `sa`) y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales. La relevancia actual radica en la escasez de herramientas especializadas para digitalizacion de manuscritos y textos sanscritos, un nicho con demanda creciente en humanidades digitales y preservacion documental.

Esta ficha describe especificamente la version GGUF publicada por mradermacher, que facilita el despliegue en hardware de consumo mediante llama.cpp y herramientas compatibles, sin necesidad de GPU de datacenter. El repositorio ocupa 70,4 GB e incluye 13 cuantizaciones estaticas mas dos ficheros mmproj (proyector multimodal) en Q8_0 y f16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (base Qwen2.5-VL) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | Sanscrito (`sa`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas) y safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base `snskrt/qwen2-5-vl-sanskrit-ocr` es un ajuste fino de Qwen2.5-VL, la familia de modelos vision-lenguaje de Alibaba que combina un codificador visual con un decoder de lenguaje tipo transformer. La adaptacion al sanscrito se realizo con Axolotl, framework de ajuste fino supervisado, sobre dos conjuntos de datos: `diabolic6045/sanskrit-ocr-parallel-corpus-chat-template` y `snskrt/Sanskrit_OCR_Parallel_Corpus`. Ambos son corpus paralelos orientados a tareas de OCR, es decir, pares imagen-texto donde el texto es la transcripcion sanscrita correspondiente. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron fases de RLHF o DPO.

La version GGUF ha sido generada por mradermacher mediante cuantizacion estatica (sin imatrix), con `output_tensor_quantised: 1` y `convert_type: hf`, segun los metadatos de la model card. La model card indica que las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicacion. El repositorio incluye los ficheros `mmproj` necesarios para el procesamiento multimodal en llama.cpp, lo que permite conservar la capacidad de entrada de imagen tras la cuantizacion. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes con texto en sanscrito, con salida en texto plano.
- Generacion de texto conversacional en sanscrito, heredada del ajuste fino sobre corpus con formato de chat.
- Procesamiento multimodal imagen-texto: acepta imagenes como entrada y genera transcripciones o respuestas textuales.
- Formato conversacional compatible con plantillas de chat (el dataset de entrenamiento usa `chat-template`).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integracion con infraestructura de inferencia estandar.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al sanscrito segun el tag de idioma; no se documentan otros idiomas.
- Modo thinking, vision avanzada o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de manuscritos sanscritos: el modelo recibe imagenes de paginas escaneadas y devuelve la transcripcion textual, lo que permite convertir archivos fisicos en corpus digitales consultables. Es adecuado por su especializacion en OCR de sanscrito y su capacidad de ejecutarse en hardware modesto gracias a las cuantizaciones GGUF.
- Preservacion documental en bibliotecas y archivos: instituciones con colecciones de textos sanscritos pueden desplegar el modelo en local (por ejemplo, con llama.cpp) para procesar lotes de imagenes sin enviar material a servicios externos, gracias a la licencia Apache 2.0 y a la disponibilidad de cuantizaciones ligeras (Q4_K_M de 4,8 GB).
- Investigacion en humanidades digitales: investigadores pueden transcribir corpus paralelos y comparar automaticamente las salidas del modelo con transcripciones de referencia, usando el modelo como herramienta de pre-anotacion para acelerar la creacion de datasets.
- Indexacion y busqueda de textos sanscritos: tras la transcripcion, el texto generado puede alimentar motores de busqueda o pipelines de procesamiento de lenguaje natural, habilitando consultas sobre colecciones que antes solo existian como imagenes.
- Educacion y ensenanza del sanscrito: el modelo puede servir como asistente para transcribir ejercicios o materiales didacticos escaneados, con la ventaja de que su formato conversacional permite integrarlo en interfaces de chat educativas.
- Procesamiento por lotes en entornos con recursos limitados: al disponer de cuantizaciones desde Q2_K (3,1 GB) hasta Q8_0 (8,2 GB), el modelo puede ejecutarse en estaciones de trabajo sin GPU dedicada o con GPUs de consumo, lo que abarata el despliegue en proyectos con presupuesto reducido.
- Integracion en pipelines de digitalizacion existentes: la compatibilidad con endpoints y el formato GGUF permiten conectar el modelo a servicios de inferencia estandar (llama.cpp server, Ollama) y orquestar la transcripcion como un paso mas dentro de un flujo automatizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo, sin contar overhead de contexto ni el proyector multimodal):
  - Q2_K: aproximadamente 3,1 GB.
  - Q3_K_S: aproximadamente 3,6 GB.
  - Q4_K_M: aproximadamente 4,8 GB.
  - Q5_K_M: aproximadamente 5,5 GB.
  - Q6_K: aproximadamente 6,4 GB.
  - Q8_0: aproximadamente 8,2 GB.
  - f16: aproximadamente 15,3 GB.
- Proyector multimodal adicional: 1,0 GB (mmproj-Q8_0) o 1,5 GB (mmproj-f16).
- GPU recomendadas: no especificadas en la informacion proporcionada. Por tamano, las cuantizaciones Q4_K_M y Q5_K_M encajan en GPUs de consumo con 8 GB o mas de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070). Las cuantizaciones Q6_K y Q8_0 requieren 8-12 GB. La version f16 requiere al menos 16 GB (RTX 4080, RTX 4090, A100).
- Cabe en GPU de consumo: si, en las cuantizaciones Q2_K a Q5_K_M con GPUs de 6-8 GB; Q6_K y Q8_0 con GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF y con soporte de ficheros mmproj para entrada multimodal. El modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| mradermacher/qwen2-5-vl-sanskrit-ocr-GGUF | 7,6 mil millones | No disponible | Sanscrito | Apache 2.0 | GGUF | Especializado en OCR de sanscrito; cuantizaciones desde 3,1 GB |
| snskrt/qwen2-5-vl-sanskrit-ocr | 7,6 mil millones | No disponible | Sanscrito | Apache 2.0 | Safetensors | Modelo base sin cuantizar del que deriva esta ficha |
| Qwen2.5-VL (modelo original de Alibaba) | Varios tamanos (3B, 7B, 72B) | No disponible en esta ficha | Multilingue | Apache 2.0 (segun version) | Safetensors, GGUF | Modelo generalista de vision-lenguaje; no especializado en sanscrito |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- El modelo esta ajustado exclusivamente para sanscrito (`sa`); su rendimiento en otros idiomas, incluido el castellano, no esta documentado y probablemente sea deficiente.
- Al ser un ajuste fino especializado en OCR, puede degradarse en tareas generales de vision-lenguaje o de generacion de texto no relacionadas con la transcripcion.
- Riesgo de alucinacion: no se documenta en la informacion disponible, pero es inherente a los modelos generativos de esta familia; las transcripciones deben validarse contra originales en entornos de produccion.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion disponible; conviene verificarla en el modelo base antes de procesar documentos largos.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar la precision del OCR; la model card recomienda Q4_K_S y Q4_K_M como opciones rapidas y Q6_K/Q8_0 para maxima calidad.
- No se dispone de cuantizaciones ponderadas con imatrix, lo que puede reducir la calidad frente a alternativas con calibracion.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de los datasets de entrenamiento (los corpus pueden tener sus propias restricciones).
- El repositorio ocupa 70,4 GB en total; la descarga completa no es necesaria si solo se requiere una cuantizacion concreta, pero conviene planificar el espacio en disco.

## Enlaces

- Repositorio Hugging Face de la version GGUF: https://huggingface.co/mradermacher/qwen2-5-vl-sanskrit-ocr-GGUF
- Modelo base: https://huggingface.co/snskrt/qwen2-5-vl-sanskrit-ocr
- Pagina de resumen de cuantizaciones de mradermacher: https://hf.tst.eu/model#qwen2-5-vl-sanskrit-ocr-GGUF
- Dataset diabolic6045/sanskrit-ocr-parallel-corpus-chat-template: https://huggingface.co/datasets/diabolic6045/sanskrit-ocr-parallel-corpus-chat-template
- Dataset snskrt/Sanskrit_OCR_Parallel_Corpus: https://huggingface.co/datasets/snskrt/Sanskrit_OCR_Parallel_Corpus
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
