# holooo/Xiaomi-OCR-0-Q4_K_M-GGUF

## Resumen

Xiaomi-OCR-0 es un modelo vision-language (VLM) especializado en OCR y comprensión de documentos, desarrollado por Xiaomi Research. Esta ficha concreta corresponde a la cuantización Q4_K_M en formato GGUF publicada por el usuario holooo, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp. El modelo base cuenta con 752.393.024 parámetros (aproximadamente 752 millones), lo que lo sitúa en la gama de VLMs ligeros orientados a tareas documentales específicas.

La especialización es clara: el modelo está entrenado sobre un corpus centrado en OCR (custom-ocr-centric-corpus) y evaluado con métricas propias de parsing de documentos como TEDS (Tree Edit Distance based Similarity) y CDM. Esto lo diferencia de VLMs generalistas: en lugar de intentar cubrir visión general, se concentra en extracción de texto, parsing de tablas, comprensión de layout y extracción de información clave (KIE).

La relevancia actual reside en su tamaño reducido y su licencia Apache 2.0, que permiten desplegar un pipeline de document understanding en local, sin depender de APIs externas ni de GPUs de datacenter. La cuantización Q4_K_M (505 MB para los pesos del LLM más 111 MB del proyector visual en Q8_0) hace viable la inferencia en portátiles y equipos sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (transformer multimodal con proyector visual); detalles internos no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el ejemplo de servidor usa `-c 4096`, pero no se confirma como máximo) |
| Tipos de cuantizacion | Q4_K_M (4.8 bits) para el LLM; Q8_0 (8.5 bits) para el proyector visual (mmproj) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Xiaomi-OCR-0.Q4_K_M.gguf + mmproj-q8_0.gguf); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza multimodal (image-text-to-text) con un proyector visual separado, empaquetado como `mmproj` en la conversión a GGUF. El tamaño de 752 millones de parámetros sugiere un LLM base compacto acoplado a un encoder visual, un patrón habitual en VLMs ligeros para tareas de documento.

El entrenamiento se realizó sobre un corpus propio centrado en OCR (`custom-ocr-centric-corpus`), y las métricas declaradas en la model card (accuracy, TEDS, CDM) apuntan a un ajuste específico para parsing de documentos y extracción de información. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, ni si hubo fases de RLHF o DPO. La conversión a GGUF se realizó mediante el espacio GGUF-my-repo de ggml.ai usando llama.cpp.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Parsing de documentos: extracción de estructura, tablas y layout (métrica TEDS en la model card).
- Comprensión de documentos (document understanding) más allá de la transcripción literal.
- Visual question answering (VQA) sobre imágenes de documentos.
- Extracción de información clave (key information extraction, KIE) de formularios y documentos estructurados.
- Generación de texto a partir de imagen (pipeline image-text-to-text).
- Conversacional: el tag `conversational` indica soporte de interacción multi-turno, aunque no se detalla su alcance.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-step: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo puede extraer campos clave (importes, fechas, CIF) de imágenes de documentos gracias a su entrenamiento en KIE, integrándose en un pipeline de contabilidad automatizada.
- Parsing de tablas en informes financieros: la métrica TEDS en su evaluación indica que está optimizado para reconstruir la estructura de tablas, útil para convertir PDFs escaneados en hojas de cálculo.
- Procesamiento de formularios administrativos: extracción de respuestas manuscritas o impresas en formularios, con el modelo corriendo en local para cumplir requisitos de privacidad de datos.
- Indexación de archivos históricos escaneados: al ser un modelo pequeño y desplegable con llama.cpp, permite procesar grandes volúmenes de imágenes en hardware modesto sin coste por token de API.
- Asistencia en la revisión de contratos: VQA sobre imágenes de páginas para responder preguntas concretas ("¿cuál es la fecha de vencimiento?") sin transcribir el documento completo.
- Digitalización en el borde (edge): con 505 MB de pesos en Q4_K_M, puede ejecutarse en portátiles o equipos sin GPU dedicada para OCR en campo, por ejemplo en logística o inspección de documentos in situ.
- Preprocesado para RAG documental: convertir imágenes de documentos en texto estructurado antes de indexarlo en un sistema de recuperación, usando el modelo como etapa de parsing local.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card declara el uso de las métricas accuracy, TEDS y CDM, pero no incluye valores concretos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB para los pesos en Q4_K_M (505 MB) más Q8_0 del proyector visual (111 MB), más overhead de contexto y activaciones; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; también funciona en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU y Apple Silicon.
- Opciones de despliegue: llama.cpp (CLI `llama-mtmd-cli` y servidor `llama-server`); no se confirma soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas en la información proporcionada. Como referencia estructural, los VLMs ligeros especializados en OCR de la misma franja de tamaño (cientos de millones de parámetros) suelen incluir modelos como Donut o Florence-2, pero no se han aportado métricas que permitan una comparación rigurosa con Xiaomi-OCR-0.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Xiaomi-OCR-0 (Q4_K_M) | 752 M | no disponible | Apache 2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos generativos; en tareas de OCR y KIE puede producir texto plausible que no aparezca en la imagen, por lo que conviene validar campos críticos.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados ni longitud máxima de contexto; el ejemplo del servidor usa 4096 tokens, pero no se confirma como límite.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base original (`xiaomi-research/Xiaomi-OCR-0`) por si añade condiciones adicionales.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al modelo original en safetensors; para tareas de OCR de alta fidelidad puede ser preferible una cuantización mayor o los pesos originales.
- Esta publicación es una conversión de terceros (usuario holooo), no oficial de Xiaomi Research; la reproducibilidad y el soporte dependen del autor de la conversión.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/holooo/Xiaomi-OCR-0-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
