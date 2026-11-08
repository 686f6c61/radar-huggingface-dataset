# necropopeost/S5-nano-oQ5e

## Resumen

S5-nano-oQ5e es una conversión no oficial del modelo multimodal maritaca-ai/S5-nano, publicada por el usuario necropopeost en Hugging Face. Se trata de una cuantización de precisión mixta (oQ5e) en formato MLX Safetensors, pensada para ejecutar el modelo localmente en equipos Mac con Apple Silicon (M1, M2, M3, M4). El modelo base S5-nano, desarrollado por Maritaca AI, es un modelo de arquitectura Qwen3.5-VL con aproximadamente 3,7 mil millones de parámetros (4.539.265.536 parámetros totales según los safetensors del repo) que combina capacidades de texto y visión.

La relevancia de esta conversión radica en su estrategia de cuantización: en lugar de aplicar una compresión uniforme (como el 4-bit estándar), emplea precisión mixta con calibración imatrix, manteniendo las capas críticas para el razonamiento en 8 bits y comprimiendo las más tolerantes a 4 bits, con una media de ~5,7 bits por peso. El encoder de visión y el proyector multimodal se conservan en BF16 para preservar las capacidades de OCR y análisis de imágenes. El resultado es un archivo de ~3,58 GB que, según el autor, retiene cerca del 80% de la precisión de razonamiento del modelo original en BF16.

El modelo está orientado a portugués de Brasil e inglés, se distribuye bajo licencia Apache 2.0 y se carga mediante la librería `mlx-vlm`. No cuenta con descargas ni likes en el momento de la consulta, y no se ha publicado información sobre benchmarks oficiales del modelo base más allá de los datos de validación aportados por el autor de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-VL (transformer multimodal texto+visión) |
| Parametros totales | 4.539.265.536 (~3,7B según model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ5e: precisión mixta con calibración imatrix (~5,7 bits/peso medio; capas críticas en 8 bits, tolerantes en 4 bits; vision tower y proyector en BF16) |
| Idiomas soportados | Portugués de Brasil (pt), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (nativo Apple Silicon) |

## Arquitectura y entrenamiento

El modelo base S5-nano emplea la arquitectura Qwen3.5-VL, un transformer multimodal que integra una torre de visión (vision tower) con un proyector multimodal para combinar entrada de imagen y texto. El modelo original fue entrenado por Maritaca AI; no se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La conversión aquí descrita no modifica ni reentrena los pesos: es una cuantización del modelo original. La innovación técnica principal es el esquema oQ5e, que combina dos técnicas: (1) cuantización de precisión mixta, donde un algoritmo analiza la sensibilidad de cada capa y asigna 8 bits a las capas críticas para el razonamiento lógico y 4 bits a las más tolerantes; y (2) calibración imatrix, que genera una matriz de importancia a partir de datos de calibración para proteger los canales de activación más relevantes frente a errores de redondeo. El encoder de visión y el proyector multimodal se mantienen en BF16 para no degradar las capacidades visuales.

## Capacidades

- Generación de texto en portugués de Brasil e inglés.
- Razonamiento con modo Think (Chain of Thought) activable mediante `enable_thinking=True` en la plantilla de chat.
- Modo Instruct (respuesta directa) como comportamiento por defecto.
- Comprensión de imágenes: OCR avanzado (lectura de tablas, sudokus y notas fiscales), razonamiento visual (análisis de gráficos y partidas de ajedrez) y descripción detallada de personas, objetos, colores y estilos de arte.
- Resistencia a alucinación visual: según el autor, el modelo rechaza premisas falsas en imágenes (por ejemplo, no inventa un coche donde solo hay un perro).
- Soporte de conversaciones multi-turno mediante plantilla de chat.
- No se ha documentado en la información disponible soporte de tool calling, function calling ni capacidades de agente multi-paso.
- No se ha documentado soporte de audio.

## Casos de uso

- OCR y digitalización de documentos en portugués: el modelo puede procesar imágenes de notas fiscales, tablas y formularios, extrayendo texto estructurado gracias a la torre de visión conservada en BF16, lo que evita la degradación típica de cuantizaciones agresivas en el encoder visual.
- Análisis de gráficos y diagramas: útil para investigadores y analistas que necesiten interpretar figuras, curvas o esquemas directamente desde una imagen y obtener una descripción razonada en portugués o inglés.
- Asistencia educativa en portugués: con el modo Think activado, el modelo puede resolver problemas de matemáticas y razonamiento lógico paso a paso, adecuado para entornos de estudio o tutorización local sin conexión.
- Descripción de imágenes para accesibilidad: generación de descripciones detalladas de escenas, objetos y personas en portugués, aprovechando la preservación del encoder visual en BF16 para mantener la fidelidad descriptiva.
- Procesamiento local en Mac sin conexión: al ejecutarse con `mlx-vlm` en Apple Silicon con 8-16 GB de RAM, permite flujos de trabajo con datos sensibles (documentos, imágenes médicas o financieras) sin enviar información a servicios en la nube.
- Generación de texto y redacción en portugués de Brasil: el modo Instruct permite tareas de escritura como correos, resúmenes o respuestas directas con temperatura baja (0,7), adecuado para automatizaciones ligeras en estaciones de trabajo Mac.
- Prototipado de aplicaciones multimodales: desarrolladores que quieran validar pipelines de visión-lenguaje en local antes de desplegar en infraestructura mayor pueden usar esta conversión como banco de pruebas con un consumo de disco de ~3,58 GB.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la validación del autor de la conversión sobre el dataset público `northern-64bit/ENADE_Brazilian_national_university_examination_MCQ_483` (483 preguntas de opción múltiple del ENADE):

| Modelo | Modo | Precisión |
|---|---|---|
| S5-nano original (Maritaca AI) | Think | 81,70% |
| S5-nano-MLX-oQ5e (esta versión) | Think | 80,00% (muestra de test) |
| S5-nano-MLX-4bit (estándar) | Think | 64,00% (colapso de razonamiento) |
| S5-nano original (Maritaca AI) | Instruct | 71,79% |
| S5-nano-MLX-oQ5e (esta versión) | Instruct | estable y altamente preciso (sin cifra concreta) |

No se han publicado resultados de benchmarks oficiales del modelo base (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~3,58 GB para los pesos en oQ5e; el autor recomienda 8 GB de RAM mínimo y 16 GB para contextos largos.
- Hardware objetivo: exclusivamente Apple Silicon (M1, M2, M3, M4). No es compatible con GPU NVIDIA ni con CPU x86 mediante este formato.
- No cabe en GPU consumer NVIDIA por formato (MLX), pero sí en cualquier Mac con Apple Silicon y 8 GB o más de memoria unificada.
- Despliegue: librería `mlx-vlm` (Python 3.10+). No se ha documentado compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S5-nano-oQ5e (esta versión) | ~3,7B (4.539.265.536) | no disponible | MLX Safetensors (oQ5e) | Apache 2.0 | Hugging Face, solo Apple Silicon |
| maritaca-ai/S5-nano (original) | ~3,7B | no disponible | no disponible | Apache 2.0 | Hugging Face |
| S5-nano-MLX-4bit (cuantización estándar) | ~3,7B | no disponible | MLX Safetensors (4-bit) | Apache 2.0 | Hugging Face (según model card) |
| S5-nano en 8-bit / BF16 (referencia del autor) | ~3,7B | no disponible | no disponible | Apache 2.0 | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (multimodales pequeños para portugués) en la búsqueda realizada.

## Limitaciones y advertencias

- Conversión no oficial: los pesos no fueron entrenados ni modificados por el autor de la conversión; la autoría de la arquitectura y el entrenamiento corresponde a Maritaca AI.
- Solo compatible con Apple Silicon y la librería `mlx-vlm`; no se puede desplegar en GPU NVIDIA, CPU x86 ni en la mayoría de plataformas de inferencia estándar.
- Idiomas limitados a portugués de Brasil e inglés; el rendimiento en otras lenguas no está documentado y probablemente sea deficiente.
- Longitud de contexto no documentada; el autor sugiere 16 GB de RAM para contextos largos, lo que indica que contextos extensos pueden degradar el rendimiento o agotar memoria.
- La cuantización, aunque preserva mejor el razonamiento que el 4-bit estándar, sigue siendo una aproximación: la precisión en modo Think cae del 81,70% al 80,00% en la muestra evaluada, y no hay garantía de que se mantenga en otras tareas.
- Riesgo de alucinación inherente al modelo base; el autor afirma resistencia a alucinaciones visuales, pero no hay evaluación independiente que lo respalde.
- No se ha documentado soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.
- Licencia Apache 2.0 permite uso comercial, pero al ser una conversión no oficial conviene verificar los términos del modelo base original antes de un despliegue en producción.
- Sin descargas ni validación comunitaria en el momento de la consulta; el modelo es muy reciente y no ha sido auditado por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/necropopeost/S5-nano-oQ5e
- Modelo base: https://huggingface.co/maritaca-ai/S5-nano
- Perfil del autor: https://huggingface.co/necropopeost
- Lista de modelos del autor: https://huggingface.co/necropopeost/models
- Dataset de validación ENADE: https://huggingface.co/datasets/northern-64bit/ENADE_Brazilian_national_university_examination_MCQ_483
- Librería mlx-vlm: no disponible en los resultados de búsqueda (instalable vía `pip install mlx-vlm`)
