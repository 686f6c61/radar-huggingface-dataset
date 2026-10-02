# abenzerps/Clef-MLX

## Resumen

Clef-MLX es un repositorio de cuantizaciones en formato MLX del modelo Cloudflare/clef, un modelo multimodal de decisión de 27B de parámetros post-entrenado a partir de un modelo de la familia Qwen3.x. Lo publica el usuario abenzerps (Ahmet Benzer) en Hugging Face y su propósito es permitir la ejecución local del modelo en Apple Silicon mediante la librería MLX-VLM, sin necesidad de GPU NVIDIA.

El modelo base no es un generador de texto conversacional al uso, sino un modelo de decisión: recibe un estado (texto o JSON), opcionalmente imágenes y vídeo, y un conjunto de preguntas tipadas (`noul` para verdadero/falso, `choice` para opciones nominales y `score` para opciones ordenadas), y devuelve respuestas con confianza y distribuciones de probabilidad por cada pregunta. Eso lo sitúa en la categoría de modelos de clasificación y enrutado estructurado con entrada multimodal.

La relevancia inmediata de este repositorio es práctica: ofrece tres niveles de cuantización (4, 6 y 8 bits) para ajustar el consumo de memoria en función del hardware Apple disponible, con tamaños de 15,5 GB, 21,6 GB y 27,7 GB respectivamente. El repositorio completo ocupa 68,6 GB y, en el momento de redactar esta ficha, acumula 0 descargas y 3 «likes», por lo que se trata de una publicación muy reciente y con escasa validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de la familia Qwen3.x; el repositorio contiene cuantizaciones MLX del modelo base Cloudflare/clef |
| Parametros totales | 27B (cifra indicada en la model card para el modelo base Cloudflare/clef) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX 4-bit (15,5 GB), MLX 6-bit (21,6 GB), MLX 8-bit (27,7 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (carpetas Clef-MLX-4bit, Clef-MLX-6bit, Clef-MLX-8bit); el modelo original Cloudflare/clef se distribuye en safetensors de transformers |

## Arquitectura y entrenamiento

La model card describe Cloudflare/clef como un «modelo multimodal de decisión» de 27B post-entrenado a partir de Qwen3.8-27B, mientras que las etiquetas del repositorio hacen referencia a `qwen3.5`. Existe por tanto una discrepancia entre ambas fuentes sobre la versión exacta de la familia Qwen3 utilizada como punto de partida, que conviene verificar antes de asumir cualquier detalle concreto de la arquitectura interna. No se especifican en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento posteriores al preentrenamiento.

Lo que sí documenta el autor es la interfaz de uso: el modelo original se carga mediante el módulo `joint_schema_model` (`load_release_model`, `encode_record`, `collate_records`), probado con `torch` 2.11 y `transformers` 5.10.2 sobre una única GPU H200. Admite entradas de texto, imagen (PIL) y vídeo (arrays de fotogramas), y permite mezclar registros de solo texto y multimodales en el mismo lote. Las cuantizaciones de este repositorio no alteran esa interfaz de decisión, solo el formato y la precisión de los pesos para su ejecución con MLX-VLM.

## Capacidades

- Generación de respuestas estructuradas con esquema de preguntas tipadas: `noul` (verdadero/falso), `choice` (opciones nominales con criterios descriptivos) y `score` (opciones ordenadas con leyenda).
- Salida con probabilidades y nivel de confianza por pregunta, útil para umbrales de decisión y enrutado automático.
- Procesamiento de imágenes como entrada (por ejemplo, recibos o documentos escaneados) dentro del mismo registro de decisión.
- Procesamiento de vídeo mediante listas de fotogramas, con argumentos opcionales de preprocesado en `media_kwargs`.
- Mezcla de registros de texto e imagen/vídeo en un mismo lote.
- Interfaz compatible con la API Jev/SystemOne (`POST /v1/systemone`), devolviendo `model`, `answers` por ID de pregunta y `usage`.
- Ejecución local en Apple Silicon mediante MLX-VLM, con API de Python y CLI.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- Triage de tickets de soporte: el modelo recibe el texto del mensaje como `state` y devuelve `choice` para el departamento responsable (facturación, técnico) y `score` para la urgencia, con probabilidades que permiten derivar a un humano cuando la confianza es baja.
- Clasificación documental con imagen: se envía una factura o recibo escaneado junto con preguntas como «¿es legible el total?» (`noul`) o «¿el importe supera los 1000 USD?» (`noul`), aprovechando la vía multimodal del modelo.
- Verificación de campos extraídos por OCR: dado un `state` en JSON con los campos leídos y la imagen original, el modelo confirma o refuta cada campo, sirviendo como capa de control de calidad en pipelines de extracción.
- Enrutado de correo entrante en atención al cliente: con criterios definidos por el equipo, el modelo asigna categoría y prioridad, devolviendo la distribución de probabilidad para auditar decisiones ambiguas.
- Moderación o etiquetado de contenido: uso del tipo `noul` para preguntas binarias de cumplimiento sobre texto o imagen, con la probabilidad de verdadero como señal de escalado.
- Puntuación de calidad en revisión de documentos o materiales: uso del tipo `score` con criterios ordenados (por ejemplo, «puede esperar», «esta semana», «hoy») para convertir juicios subjetivos en valores ordinales comparables.
- Análisis de vídeo corto: envío de arrays de fotogramas para responder preguntas binarias o de elección sobre eventos observables, útil en inspección visual automatizada.
- Prototipado local en Mac: gracias a las cuantizaciones de 4 y 6 bits, es viable iterar sobre el diseño de preguntas y criterios en un portátil Apple Silicon antes de desplegar la versión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio y los resultados de búsqueda consultados no incluyen cifras de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de clasificación o decisión para Cloudflare/clef ni para sus cuantizaciones MLX.

## Requisitos de hardware

- Cuantización 4-bit: 15,5 GB de pesos; requiere aproximadamente 16-18 GB de memoria unificada para inferencia, por lo que encaja en Mac con 24 GB o más (M2 Pro/M3 Pro/M4 Pro y superiores).
- Cuantización 6-bit: 21,6 GB de pesos; requiere en torno a 22-24 GB de memoria unificada, recomendable Mac con 32 GB.
- Cuantización 8-bit: 27,7 GB de pesos; requiere aproximadamente 28-30 GB de memoria unificada, recomendable Mac con 48 GB o superior (M2 Max, M3 Max, M4 Max, Ultra).
- GPU NVIDIA: el formato MLX no las soporta. El modelo original Cloudflare/clef se probó con `torch` y `transformers` sobre una única H200; no se documentan requisitos para GPUs de gama consumer.
- Opciones de despliegue: MLX-VLM (API de Python y CLI `python -m mlx_vlm.generate`) para Apple Silicon; `transformers` con el módulo `joint_schema_model` para el modelo original en CUDA. No se ofrecen pesos GGUF, por lo que llama.cpp y Ollama no son compatibles con este repositorio.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abenzerps/Clef-MLX | 27B (modelo base) | No disponible | Safetensors MLX (4/6/8-bit) | Apache 2.0 | Repositorio HF, 0 descargas |
| Cloudflare/clef | 27B | No disponible | Safetensors (transformers) | No disponible en la informacion recogida | Repositorio HF del modelo original |
| Otras cuantizaciones MLX de la familia Qwen3.x | No disponible | No disponible | Safetensors MLX | Variable | No verificado en la informacion disponible |

La comparación directa más sólida que permite la información disponible es entre este repositorio y su modelo base: se trata de la misma arquitectura y los mismos pesos, con la diferencia de que aquí están cuantizados a 4, 6 y 8 bits en formato MLX para Apple Silicon y se cargan mediante MLX-VLM en lugar de `transformers`. No se dispone de datos sobre modelos de decisión multimodal comparables de terceros ni de métricas que permitan establecer una jerarquía de rendimiento.

## Limitaciones y advertencias

- Repositorio con 0 descargas y muy reciente (creado y actualizado el mismo día según los metadatos), por lo que no existe validación independiente de la calidad de las cuantizaciones.
- La cuantización a 4 bits puede degradar la calibración de las probabilidades de salida, algo crítico en un modelo cuyo valor principal es precisar confianza y distribuciones por pregunta.
- Discrepancia documental entre la etiqueta `qwen3.5` del repositorio y la referencia a «Qwen3.8-27B» de la model card; conviene confirmar la procedencia exacta antes de producción.
- No se especifican los idiomas soportados ni la longitud de contexto, dos datos imprescindibles para dimensionar un despliegue real.
- Riesgo de alucinación en las respuestas estructuradas: un modelo de decisión puede emitir una opción válida con alta confianza aunque el estado de entrada sea ambiguo o insuficiente.
- El formato MLX limita el despliegue a hardware Apple Silicon; no hay pesos GGUF ni compatibilidad con llama.cpp u Ollama.
- La licencia Apache 2.0 de este repositorio permite uso comercial, pero deben revisarse por separado los términos del modelo base Cloudflare/clef, cuya licencia no queda recogida en la información consultada.
- No hay resultados de benchmarks, informes de sesgos ni evaluaciones de seguridad publicados para este modelo o sus cuantizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/abenzerps/Clef-MLX
- Modelo base: https://huggingface.co/Cloudflare/clef
- Perfil del autor en Hugging Face: https://huggingface.co/abenzerps
- Lista de recursos MLX (awesome-mlx): https://github.com/raullenchai/awesome-mlx
- Directorio de modelos de abenzerps en AI Market Cap: https://aimarketcap.tech/providers/abenzerps
- Directorio de modelos de abenzerps en Essa Mamdani: https://essamamdani.com/ai-models/company/abenzerps
- Lista de modelos gratuitos (ClawLabsAI): https://github.com/ClawLabsAI/free-ai-models
