# mradermacher/LightOnOCR-3-4B-i1-GGUF

## Resumen

LightOnOCR-3-4B es un modelo vision-language especializado en OCR y comprensión de documentos, desarrollado originalmente por Lighton AI (lightonai) y distribuido en este repositorio como cuantizaciones GGUF por mradermacher. El modelo resuelve el problema de extraer texto estructurado, tablas y formularios de imágenes de documentos, combinando percepción visual con generación de texto. Es relevante porque ofrece una alternativa de código abierto (Apache 2.0) para pipelines de digitalización documental sin depender de APIs propietarias.

La arquitectura es un transformer vision-language con aproximadamente 4.205.751.296 parámetros totales (4,2 mil millones), según los pesos en safetensors del modelo base. El repositorio contiene cuantizaciones del modelo original en formato GGUF, generadas con el método imatrix de mradermacher, lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

Esta ficha describe la variante cuantizada i1-GGUF, orientada a inferencia local eficiente. El modelo está etiquetado únicamente para inglés (en) y su uso principal es la extracción de texto y estructura de documentos escaneados o fotografiados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (detalles de capas no disponibles) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base lightonai/LightOnOCR-3-4B es un modelo vision-language orientado a OCR y comprensión de documentos, con etiquetas que incluyen visual grounding, tablas y formularios. Los pesos publicados suman 4.205.751.296 parámetros. No se dispone en la información proporcionada de detalles sobre el número de capas, dimensión oculta, mecanismo de atención, resolución de imagen de entrada ni composición del dataset de entrenamiento.

Las cuantizaciones de este repositorio se generaron con el método imatrix de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf). El autor indica que se trata de cuantizaciones ponderadas con imatrix del modelo original, e incluye el fichero imatrix para que terceros puedan generar sus propias cuantizaciones. No se documenta en la información disponible si el entrenamiento incluyó RLHF, DPO u otras fases de alineación.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Comprensión de documentos: extracción de texto estructurado y semántica del contenido.
- Visual grounding: localización de elementos en la imagen (según etiquetas del modelo).
- Extracción y reconstrucción de tablas.
- Procesamiento de formularios.
- Generación de texto conversacional a partir de la entrada visual (etiqueta conversational).
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Capacidades multilingües: no disponibles; el modelo está etiquetado solo para inglés.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo puede procesar la imagen de un documento y devolver el texto y los campos estructurados, adecuado por su especialización en formularios y tablas.
- Extracción de tablas de informes financieros: permite reconstruir tablas de PDFs escaneados o capturas, útil en pipelines de análisis de datos donde la fuente es una imagen.
- Automatización de entrada de datos en back office: integrado en un flujo que recibe fotos de documentos desde un escáner o móvil y genera texto para su validación posterior.
- Procesamiento de formularios administrativos: extracción de campos de formularios en inglés para su volcado a sistemas de gestión.
- Indexación y búsqueda documental: conversión de archivos escaneados a texto para alimentar motores de búsqueda o bases vectoriales.
- Digitalización de archivos históricos en inglés: OCR sobre material impreso en inglés con necesidad de despliegue local por confidencialidad.
- Ejecución en local con llama.cpp: al disponer de cuantizaciones desde 1,5 GB (IQ1_S) hasta 3,6 GB (Q6_K), permite desplegar OCR en estaciones de trabajo sin GPU dedicada de gran capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de precisión (por ejemplo, CER/WER, exactitud en tablas) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: entre ~1,5 GB (i1-IQ1_S) y ~3,6 GB (i1-Q6_K) solo para los pesos; hay que sumar la memoria del proyector visual y del contexto, no cuantificados en los tamaños indicados.
- Cuantización recomendada por el autor: i1-Q4_K_M (2,8 GB, "fast, recommended") o i1-Q4_K_S (2,7 GB, "optimal size/speed/quality").
- GPU recomendadas: no especificadas en la información disponible. Por tamaño de pesos, cualquier GPU consumer con 6-8 GB de VRAM o más debería poder alojar las cuantizaciones Q4-Q6, siempre que el runtime soporte el componente visual.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 6 GB o más de VRAM para cuantizaciones Q4; las cuantizaciones IQ1-IQ2 podrían caber en 4 GB, con pérdida de calidad.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (por ejemplo, Ollama, si soporta el modelo y su proyector visual); el modelo base usa transformers. vLLM y TGI no están confirmados para esta variante GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LightOnOCR-3-4B (esta ficha, GGUF) | ~4,2 B | no disponible | en | Apache 2.0 | GGUF |
| lightonai/LightOnOCR-3-4B (base) | ~4,2 B | no disponible | en | Apache 2.0 | safetensors |
| mradermacher/LightOnOCR-3-4B-GGUF (quants estaticos) | ~4,2 B | no disponible | en | Apache 2.0 | GGUF |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos de la misma categoría (OCR vision-language) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos: no documentados en la información disponible; al ser un modelo entrenado sobre datos no especificados, puede heredar sesgos de esos datos.
- Alucinación: como modelo generativo, puede producir texto no presente en la imagen; en OCR es un riesgo crítico y requiere validación en producción.
- Cuantizaciones de baja calidad: las variantes IQ1 e IQ2 (1,5-1,8 GB) están marcadas por el autor como "for the desperate" o "mostly desperate", con degradación esperada.
- Componente visual: los tamaños de fichero indicados corresponden a los pesos cuantizados; el proyector visual y el contexto añaden memoria adicional no reflejada en la tabla.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base lightonai/LightOnOCR-3-4B.
- Producción: no hay benchmarks publicados que permitan estimar la precisión; se recomienda evaluar con un conjunto propio antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LightOnOCR-3-4B-i1-GGUF
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-4B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/LightOnOCR-3-4B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#LightOnOCR-3-4B-i1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
