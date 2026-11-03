# mradermacher/typhoon-ocr1.5-3b-qat-GGUF

## Resumen

Typhoon OCR 1.5 3B QAT es un modelo vision-language especializado en reconocimiento óptico de caracteres (OCR) y comprensión de documentos, desarrollado originalmente por Typhoon AI y cuantizado a formato GGUF por mradermacher. El modelo base emplea quantización aware training (QAT), una técnica que entrena el modelo teniendo en cuenta la cuantización posterior para preservar la precisión tras la compresión. Con 3.085.938.688 parámetros, está diseñado para extraer texto estructurado de imágenes de documentos, con soporte nativo para inglés y tailandés.

La relevancia de esta ficha radica en que el repositorio ofrece una colección completa de cuantizaciones GGUF estáticas (desde Q2_K hasta f16, más un proyector multimodal separado en Q8_0 y f16), lo que permite desplegar un modelo OCR multimodal en hardware de consumo. El modelo base se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y la inclusión de un fichero mmproj independiente confirma su naturaleza multimodal (visión + texto).

Esta ficha documenta la versión cuantizada de mradermacher, no el modelo original de Typhoon AI. Los datos de arquitectura interna, composición del dataset de entrenamiento y resultados de benchmarks del modelo base no están disponibles en la información proporcionada, por lo que se indican explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-language transformer (detalles internos no disponibles) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal en mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, th |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un vision-language model de 3.085.938.688 parámetros orientado a OCR y comprensión de documentos, según los tags del repositorio. La información disponible no detalla la arquitectura interna (tipo de encoder visual, mecanismo de fusión multimodal, número de capas o dimensión oculta). El sufijo "QAT" en el nombre indica que el modelo fue entrenado con quantización aware training, de modo que los pesos están preparados para soportar la cuantización con una degradación de precisión reducida.

La cuantización de este repositorio la realiza mradermacher con su pipeline de conversión a GGUF (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1). Se ofrecen cuantizaciones estáticas y, por separado, cuantizaciones con imatrix en el repositorio `mradermacher/typhoon-ocr1.5-3b-qat-i1-GGUF`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Comprensión de documentos (document-understanding): extracción de texto estructurado y contenido semántico de imágenes.
- Procesamiento multimodal: requiere el fichero mmproj (proyector visión-lenguaje) junto con los pesos del modelo.
- Soporte multilingüe limitado a inglés (en) y tailandés (th).
- Conversacional (tag `conversational`), apto para interacción por turnos.
- Compatible con endpoints (tag `endpoints_compatible`).
- No se dispone de información sobre tool calling, function calling, capacidades de agente, razonamiento multi-paso, modo thinking, audio o matemáticas avanzadas.

## Casos de uso

- Digitalización de facturas y recibos: el modelo puede procesar imágenes de documentos financieros y extraer el texto para su volcado a sistemas de contabilidad, aprovechando su especialización en document-understanding.
- Extracción de texto de documentos escaneados en inglés y tailandés: útil para archivos administrativos bilingües o para empresas con operaciones en Tailandia, gracias al soporte nativo de ambos idiomas.
- Procesamiento por lotes en local: con cuantizaciones Q4_K_M de 2,0 GB, se puede ejecutar en estaciones de trabajo sin GPU dedicada de gama alta, lo que permite pipelines de OCR masivo sin depender de APIs externas.
- Preprocesado para RAG documental: el texto extraído por el modelo puede alimentar un pipeline de recuperación aumentada, convirtiendo PDFs e imágenes escaneadas en texto indexable.
- Automatización de formularios: extracción de campos de formularios impresos o manuscritos para su validación y registro en bases de datos.
- Digitalización de documentación técnica o legal: conversión de manuales y contratos escaneados a texto editable, con la ventaja de una licencia Apache 2.0 que permite uso comercial sin restricciones de atribución adicionales.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse localmente con llama.cpp u Ollama, los documentos no salen de la infraestructura propia, lo que resulta adecuado para datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB con Q2_K, 2,0 GB con Q4_K_M, 3,4 GB con Q8_0 y 6,3 GB con f16, a los que hay que sumar el proyector multimodal (0,9 GB en mmproj-Q8_0 o 1,4 GB en mmproj-f16).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones Q4; para f16 se recomienda una GPU de 8-10 GB o superior. No se dispone de datos específicos sobre rendimiento en A100 o H100.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070 o superiores, e incluso en GPUs con 4-6 GB usando cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el repositorio incluye el tag `endpoints_compatible`. Para el modelo base en safetensors, transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| typhoon-ocr1.5-3b-qat (este, GGUF) | 3,09 B | no disponible | en, th | apache-2.0 | GGUF |
| typhoon-ai/typhoon-ocr1.5-3b-qat (base) | 3,09 B | no disponible | en, th | apache-2.0 | safetensors |
| mradermacher/typhoon-ocr1.5-3b-qat-i1-GGUF | 3,09 B | no disponible | en, th | apache-2.0 | GGUF (imatrix) |

No se dispone de información sobre otros modelos OCR comparables en la documentación proporcionada, por lo que no se incluyen alternativas de otros autores.

## Limitaciones y advertencias

- Idiomas limitados a inglés y tailandés; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Es una cuantización del modelo original: las cuantizaciones bajas (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad respecto a Q4 o superiores; el autor recomienda Q4_K_S y Q4_K_M como opciones rápidas y Q8_0 para máxima calidad.
- Las cuantizaciones estáticas de este repositorio pueden ser inferiores en calidad a las cuantizaciones con imatrix del repositorio `-i1-GGUF`, según indica el propio autor.
- No se dispone de información sobre sesgos, tasas de alucinación ni evaluación de robustez del modelo base.
- No se dispone de información sobre la longitud de contexto, lo que limita la planificación de cargas de documentos largos.
- El modelo base está en safetensors; para usarlo con transformers se requiere el repositorio original, no este de GGUF.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar las condiciones del modelo base original en `typhoon-ai/typhoon-ocr1.5-3b-qat`.
- Para usar el modelo multimodal es imprescindible descargar también el fichero mmproj correspondiente; sin él, la entrada de imágenes no funcionará.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/typhoon-ocr1.5-3b-qat-GGUF
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr1.5-3b-qat
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/typhoon-ocr1.5-3b-qat-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#typhoon-ocr1.5-3b-qat-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
