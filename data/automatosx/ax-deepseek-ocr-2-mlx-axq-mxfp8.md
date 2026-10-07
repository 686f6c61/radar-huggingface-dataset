# AutomatosX/AX-DeepSeek-OCR-2-MLX-AXQ-MXFP8

## Resumen

AX-DeepSeek-OCR-2-MLX-AXQ-MXFP8 es un empaquetado cuantizado del modelo DeepSeek-OCR-2 de DeepSeek AI, preparado por el usuario AutomatosX mediante su herramienta AXQuant (AXQ). Se trata de una conversión a MXFP8 (8 bits en coma flotante) para el ecosistema MLX, el framework de Apple para ejecutar modelos sobre silicio de Apple. El modelo base es multimodal de tipo image-text-to-text, orientado a reconocimiento óptico de caracteres (OCR) y comprensión de documentos.

El paquete ocupa unos 4,1 GB e integra 3.389.119.360 parámetros (aproximadamente 3,39 mil millones). La cuantización mantiene los expertos de lenguaje, la atención, las capas MLP y los embeddings en MXFP8 nativo (grupo 32), mientras que las torres de visión, las normas, los routers MoE y la cabeza del modelo de lenguaje se conservan en BF16. El resultado medido es de 9,67 bits por peso (BPW).

Es importante subrayar que se trata de un desarrollo y no de un lanzamiento certificado: el autor indica explícitamente que no reclama precisión OCR ni puntuaciones de benchmarks de documentos, y que la optimización de visión no se ha aplicado. Su interés principal es permitir ejecutar OCR multimodal de DeepSeek en hardware de Apple mediante MLX, aunque sin garantías de calidad verificadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con encoder de visión (SAM + encoder Qwen2 + proyector) y modelo de lenguaje con mezcla de expertos (MoE) |
| Parámetros totales | 3.389.119.360 (unos 3,39 mil millones) |
| Parámetros activos | no disponible (la arquitectura es MoE, pero no se publica la cifra de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP8 (8 bits, grupo 32) para expertos de lenguaje, atención, MLP y embeddings; BF16 para torres de visión, normas, routers MoE y LM head; el modelo base está disponible en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-OCR-2 combina un componente de visión formado por un encoder SAM junto con un encoder Qwen2 y un proyector, y un modelo de lenguaje con arquitectura de mezcla de expertos (MoE), tal como refleja el propio empaquetado al preservar los routers MoE. Este repositorio no entrena ni modifica la arquitectura: es una conversión de pesos realizada con AXQuant 1.9.0 (modo `plan-manual` y `convert --q-mode mxfp8`) a partir de `mlx-community/DeepSeek-OCR-2-bf16`, empleando la ruta `deepseekocr_2` de MLX-VLM. El empaquetado carga 685 módulos según la prueba de carga de `mlx-vlm`.

La innovación técnica del paquete es la cuantización MXFP8, que el autor describe como un modo de reempaquetado físico y no como un método de planificación medido. No se aportan datos sobre el número de tokens de entrenamiento, la composición del dataset de preentrenamiento ni si hubo etapas de RLHF o DPO, ya que esta información no está disponible para el modelo base en la documentación proporcionada.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes y documentos, capacidad heredada del modelo base DeepSeek-OCR-2.
- Conversión de documentos escaneados a texto dentro del pipeline image-text-to-text.
- Comprensión de imágenes y respuesta conversacional (la etiqueta `conversational` está presente en el repositorio).
- Integración con el ecosistema MLX-VLM para inferencia en Apple Silicon.
- No se documentan capacidades de tool calling, function calling, uso como agente ni modos de razonamiento extendido (thinking).
- No se documentan capacidades de audio ni de vídeo.
- El soporte multilingüe no está especificado en la información disponible.

## Casos de uso

- Digitalización de archivos escaneados: el modelo convierte imágenes de documentos en texto explotable, adecuado para digitalizar fondos documentales en local sin depender de servicios en la nube.
- Extracción de datos de facturas y formularios: al ser un modelo OCR multimodal, puede transcribir campos de documentos estructurados para alimentar sistemas de contabilidad o gestión.
- Procesamiento local con privacidad: al ejecutarse sobre MLX en Apple Silicon, permite tratar documentos sensibles en la propia máquina, evitando enviar datos a terceros.
- Preprocesamiento para pipelines RAG: la transcripción de PDFs e imágenes puede convertirse en texto indexable para sistemas de recuperación aumentada.
- Accesibilidad: conversión de texto impreso o manuscrito en imágenes a texto legible por lectores de pantalla.
- Análisis documental por lotes en estaciones de trabajo Mac: al ocupar 4,1 GB, es viable cargarlo en equipos con memoria unificada moderada para tareas por lotes.
- Advertencia transversal: dado que el autor no reclama precisión OCR certificada, estos casos deben validarse con datos propios antes de llevarlos a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica de forma explícita que no reclama precisión OCR ni puntuaciones en pruebas de documentos, ni velocidad ni exactitud MTP, por lo que no existen cifras verificables que presentar.

## Requisitos de hardware

- Al estar en formato MLX, está pensado para Apple Silicon (familias M1, M2, M3, M4 y posteriores) con memoria unificada.
- Tamaño del repositorio: 4,1 GB, por lo que requiere al menos esa cantidad de memoria libre para cargar los pesos; 8 GB de memoria unificada sería el mínimo ajustado y 16 GB o más resulta recomendable.
- No está orientado a GPU NVIDIA (A100, H100, RTX 4090) de forma nativa, ya que el formato es MLX y no GGUF ni safetensors estándar para CUDA.
- Opciones de despliegue: MLX-VLM (`mlx-vlm`) como vía principal; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-DeepSeek-OCR-2-MLX-AXQ-MXFP8 (este) | 3,39 B | no disponible | MXFP8 (8 bits) | Apache 2.0 | MLX / Apple Silicon |
| deepseek-ai/DeepSeek-OCR-2 (base) | no disponible | no disponible | BF16 | Apache 2.0 | Repositorio original de DeepSeek |
| mlx-community/DeepSeek-OCR-2-bf16 | no disponible | no disponible | BF16 | Apache 2.0 | MLX / Apple Silicon |

No se dispone de datos de rendimiento comparados entre estas variantes, y no se han identificado otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un desarrollo, no un lanzamiento certificado: el autor declara explícitamente que no hay certificación de calidad.
- No se reclama precisión OCR ni puntuaciones en benchmarks de documentos, por lo que la calidad real de transcripción no está verificada.
- La optimización de visión no se ha aplicado: el encoder SAM, el encoder Qwen2 y el proyector permanecen en BF16 sin ajuste.
- La cuantización MXFP8 se describe como reempaquetado físico sin planificación medida, lo que puede introducir degradaciones no cuantificadas.
- Riesgo de alucinación inherente a los modelos de visión-lenguaje: conviene validar las transcripciones en flujos críticos.
- Compatibilidad restringida al ecosistema MLX y a hardware Apple Silicon; no apto para despliegues CUDA convencionales.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que dificulta planificar su uso con documentos largos o en idiomas distintos del inglés.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar la atribución al modelo base (DeepSeek AI) y al autor de la cuantización.
- Los pesos base pertenecen a DeepSeek AI; la cuantización es responsabilidad de AXQuant, sin avales de terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AutomatosX/AX-DeepSeek-OCR-2-MLX-AXQ-MXFP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-OCR-2 (revisión `aaa02f3811945a91062062994c5c4a3f4c0af2b0`)
- Versión MLX BF16 de origen: https://huggingface.co/mlx-community/DeepSeek-OCR-2-bf16 (revisión `9946f9ac306378a3e6a86cad7d7f8be8e536f092`)
- Informe de auditoría de formato incluido en el repositorio: `runtime_audit.json`
- La búsqueda web realizada no devolvió enlaces relevantes (únicamente páginas de inicio de sesión de Google Drive, sin relación con el modelo).
