# Abdoul27/glm-ocr-barbados

## Resumen

glm-ocr-barbados es un ajuste fino (fine-tune) del modelo multimodal GLM-OCR de Z.ai, publicado por el usuario Abdoul27 (Abdourahamane Idé Salifou) en HuggingFace. El modelo hereda la arquitectura GLM-V encoder-decoder, compuesta por un encoder visual CogViT, un conector cross-modal con downsampling eficiente de tokens y un decodificador de lenguaje GLM-0.5B, y suma un total de 1.107.405.824 parametros (aproximadamente 1,1 mil millones) en pesos safetensors, con un repositorio de 2,2 GB.

El problema que aborda es la transcripcion automatica de documentos historicos manuscritos de Barbados, segun reflejan las etiquetas del repositorio (`ocr`, `handwriting`, `htr`, `handwritten-text-recognition`, `historical-documents`, `barbados`). Se trata, por tanto, de un modelo de reconocimiento de texto manuscrito (HTR) especializado en un dominio documental concreto, en lugar de un OCR generico.

Es relevante ahora porque los modelos OCR especializados estan superando a los LLM frontera en tareas de extraccion documental: en OmniDocBench, GLM-OCR (modelo base) obtiene 94,62 frente a 94,50 de PaddleOCR-VL y aproximadamente 90,33 de Gemini 3.1 Pro. Este fine-tune concreto es un experimento de adaptacion de dominio, sin descargas ni likes en el momento de redactar esta ficha, con acceso restringido (gated) y sin benchmarks publicados propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-V encoder-decoder multimodal: encoder visual CogViT + conector cross-modal con downsampling de tokens + decodificador de lenguaje GLM-0.5B |
| Parametros totales | 1.107.405.824 (aproximadamente 1,1 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos en safetensors sin cuantizaciones oficiales |
| Idiomas soportados | No disponible; las etiquetas no declaran idiomas y el ajuste se orienta a documentos historicos de Barbados |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Modelo base | zai-org/GLM-OCR |
| Tamano del repositorio | 2,2 GB |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Fecha de creacion | 2026-09-30 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base GLM-OCR: un encoder-decoder multimodal GLM-V. El encoder visual CogViT esta preentrenado sobre datos imagen-texto a gran escala; a continuacion, un conector cross-modal ligero aplica downsampling eficiente de tokens para reducir la secuencia visual antes de pasarla al decodificador de lenguaje GLM-0.5B. El entrenamiento del modelo base introduce dos innovaciones tecnicas declaradas por sus autores: una perdida de prediccion multi-token (Multi-Token Prediction, MTP) y un esquema de aprendizaje por refuerzo estable sobre el conjunto completo de tareas (full-task RL), orientados a mejorar la eficiencia de entrenamiento, la precision de reconocimiento y la generalizacion.

En cuanto al ajuste fino que da lugar a glm-ocr-barbados, la informacion disponible no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o aprendizaje supervisado clasico. Tampoco se documentan cambios en la arquitectura, en la longitud de contexto ni en el tokenizador respecto al modelo base. El unico dato objetivo del proceso de ajuste es el recuento de parametros resultante (1.107.405.824) y el foco declarado en reconocimiento de texto manuscrito sobre documentos historicos de Barbados.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos, con pipeline `image-text-to-text`.
- Reconocimiento de texto manuscrito (HTR / handwritten-text recognition), segun las etiquetas del repositorio.
- Procesamiento de documentos historicos, dominio declarado del ajuste fino.
- Descripcion y transcripcion conversacional de imagenes dentro del pipeline `image-text-to-text` y de la etiqueta `conversational`.
- Comprension de documentos complejos heredada del modelo base GLM-OCR (maquetacion, tablas y estructura documental), aunque no se documenta especificamente para este fine-tune.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se declaran idiomas en las etiquetas.
- Capacidades de audio o vision mas alla del OCR documental: no disponibles.

## Casos de uso

- Digitalizacion de registros historicos de Barbados: el modelo puede transcribir imagenes de libros parroquiales, actas notariales y censos manuscritos, aprovechando el ajuste de dominio sobre este corpus concreto.
- Proyectos de genealogia y archivo familiar: transcripcion de documentos manuscritos antiguos para construir indices de nombres, fechas y lugares consultables.
- Investigacion historica y humanidades digitales: conversion de corpus manuscritos en texto plano alineado con la imagen original para analisis estadistico o linguístico.
- Indexacion y busqueda full-text en archivos digitales: generacion de transcripciones que alimenten motores de busqueda internos sobre colecciones hasta ahora no consultables por texto.
- Extraccion de metadatos documentales: obtencion de campos estructurados (fechas, firmas, toponimos) a partir de las transcripciones para poblar bases de datos catalograficas.
- Preprocesado para pipelines de preservacion digital: uso como primer paso de OCR/HTR antes de tareas posteriores de normalizacion ortografica o traduccion.
- Asistencia a paleografos: transcripcion automatica de borrador que el especialista revisa y corrige, reduciendo el tiempo de lectura por pagina.
- Prototipado de bajo coste: al rondar los 1,1 mil millones de parametros, puede desplegarse en hardware modesto para validar flujos de HTR antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del ajuste fino `Abdoul27/glm-ocr-barbados` en la informacion disponible.

Los unicos datos de rendimiento disponibles corresponden al modelo base GLM-OCR y a sus competidores en OmniDocBench:

| Modelo | OmniDocBench | Tipo |
|---|---|---|
| GLM-OCR (modelo base) | 94,62 | OCR especializado |
| PaddleOCR-VL | 94,50 | OCR especializado |
| Gemini 3.1 Pro | 90,33 | LLM frontera multimodal |
| GPT-5.4 | aproximadamente 85,8 | LLM frontera multimodal |

Estos valores describen el modelo base, no el fine-tune, y no deben extrapolarse al dominio de documentos historicos de Barbados sin una evaluacion especifica.

## Requisitos de hardware

- VRAM estimada para inferencia, solo pesos: aproximadamente 2,2 GB en FP16/BF16, 1,1 GB en INT8 y 0,6 GB en INT4, calculado sobre 1.107.405.824 parametros. Hay que sumar el coste de activaciones y de los tokens visuales generados por el encoder CogViT, que depende de la resolucion de imagen de entrada.
- Las cifras anteriores son estimaciones derivadas del recuento de parametros y del tamano del repositorio (2,2 GB), no datos publicados por el autor.
- GPU consumer: el modelo cabe con holgura en GPUs de 8 GB o mas, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En 6 GB o menos la viabilidad depende de la resolucion de imagen y del lote.
- GPU de datacenter: A100, H100 y L40S son sobredimensionadas para los pesos, pero utiles para procesar lotes grandes de imagenes en paralelo.
- Opciones de despliegue: la libreria declarada es `transformers`, y el repositorio esta marcado como `endpoints_compatible`. El soporte de vLLM, TGI, llama.cpp u Ollama para la arquitectura `glm_ocr` no esta confirmado en la informacion disponible; la conversion a GGUF requeriria verificacion previa.
- Latencia y throughput: no disponibles.
- Nota operativa: el acceso es restringido (gated), por lo que es necesario aceptar las condiciones en HuggingFace antes de descargar los pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | OmniDocBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glm-ocr-barbados | 1,1 mil millones | No disponible | No disponible | MIT | HuggingFace, acceso gated |
| zai-org/GLM-OCR | No disponible | No disponible | 94,62 | No disponible en la informacion proporcionada | HuggingFace |
| PaddleOCR-VL | No disponible | No disponible | 94,50 | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| Gemini 3.1 Pro | No disponible | No disponible | 90,33 | Propietaria | API comercial |
| GPT-5.4 | No disponible | No disponible | aproximadamente 85,8 | Propietaria | API comercial |

La comparacion es incompleta: solo se dispone de la licencia y el recuento de parametros del modelo objeto de la ficha. Los valores de OmniDocBench corresponden a los modelos base o de referencia, no al fine-tune.

## Limitaciones y advertencias

- Ausencia total de benchmarks propios: no hay evidencia publicada de mejora del fine-tune sobre el modelo base en documentos de Barbados.
- Modelo sin validacion de la comunidad: 0 descargas y 0 likes en el momento de redactar la ficha, lo que implica ausencia de revision por terceros.
- Acceso restringido (gated): hay que aceptar condiciones en HuggingFace, lo que anade friccion a la reproducibilidad y al uso en produccion.
- Longitud de contexto no documentada, lo que dificulta planificar la transcripcion de documentos de varias paginas o de imagenes de alta resolucion.
- Idiomas no declarados: no se puede asumir un rendimiento multilingue; el ajuste parece orientado a un unico corpus.
- Riesgo de alucinacion: como cualquier modelo generativo aplicado a OCR, puede producir texto plausible pero inexistente en la imagen, especialmente con caligrafia degradada, manchas o tinta desvaida.
- Sesgos potenciales derivados del corpus de entrenamiento: los documentos historicos de Barbados pueden contener terminologia colonial, toponimia y antroponimia con sesgos historicos que el modelo puede reproducir.
- Variabilidad ortografica historica: la ortografia antigua, las abreviaturas y las ligaduras pueden degradar la precision frente a documentos contemporaneos.
- Licencia MIT declarada en el repositorio, pero conviene verificar la licencia del modelo base (zai-org/GLM-OCR), que no aparece en la informacion proporcionada, antes de un uso comercial.
- Fine-tune de autor individual sin documentacion tecnica de entrenamiento: no se especifican dataset, hiperparametros, epocas ni metodo de ajuste, lo que limita la auditabilidad.
- Recomendacion para produccion: validar con un conjunto propio de documentos de Barbados y establecer una revision humana obligatoria antes de publicar transcripciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Abdoul27/glm-ocr-barbados
- Modelo base: zai-org/GLM-OCR
- Repositorio GitHub oficial de GLM-OCR: https://github.com/zai-org/GLM-OCR
- Repositorio espejo de GLM-OCR: https://github.com/nxpatterns/GLM-OCR-AI-Model
- Documentacion de transformers para glm_ocr: https://huggingface.co/docs/transformers/v5.3.0/en/model_doc/glm_ocr
- Comparativa de modelos OCR y resultados de OmniDocBench: https://ofox.ai/blog/best-ai-model-for-ocr-2026/
- Perfil del autor en HuggingFace: https://huggingface.co/Abdoul27
