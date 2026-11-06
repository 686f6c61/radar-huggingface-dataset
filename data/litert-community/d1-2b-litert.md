# litert-community/d1-2B-LiteRT

## Resumen

d1-2B-LiteRT es la conversión al formato LiteRT (TFLite) del modelo LiquidAI/d1-2B, un modelo de decisión desarrollado por Liquid AI para texto, imágenes y vídeo, construido a partir de LiquidAI/LFM3-VL-2B. El repositorio lo mantiene la comunidad litert-community y está pensado para inferencia on-device mediante la API CompiledModel de ai-edge-litert 2.3.0, generado con litert-torch 0.10.0. A diferencia de un modelo generativo convencional, d1-2B no genera tokens: recibe un estado (una cadena, cualquier valor JSON o imágenes) y un conjunto de preguntas nombradas, y devuelve en un único forward pass respuestas tipadas con sus probabilidades.

La relevancia de esta conversión es que traslada un modelo de decisión multimodal de 2B parámetros al ecosistema móvil y de borde: los grafos de decisión se distribuyen en ficheros separados según la longitud máxima de secuencia (128, 256, 512, 1.024, 2.048, 4.096 y 6.144 tokens), además de una variante que procesa ocho secuencias de hasta 128 tokens en una sola llamada y un fichero que agrupa los ocho grafos sobre una única copia de los pesos. Cinco de los grafos incluyen compilación ahead-of-time para la NPU del Qualcomm SM8850 (el chip del Galaxy S26).

El repositorio incluye además el host Python de escritorio sin dependencia de PyTorch, los ficheros de torre visual (uno por forma de lienzo), el tokenizador, la tabla de embeddings, fixtures de test y los scripts de conversión. La licencia es LFM1.0 (lfm1.0, marcada como "other" en Hugging Face), lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con cabecera de decisión (basado en LiquidAI/LFM3-VL-2B); inferencia sin generación de tokens |
| Parametros totales | 2B (heredados del modelo base LiquidAI/d1-2B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | hasta 6.144 tokens (grafos de decisión separados para 128, 256, 512, 1.024, 2.048, 4.096 y 6.144 tokens) |
| Tipos de cuantizacion | fp16 en capas fully-connected (`fp16fc`) en los grafos publicados; atención en bloques de consulta de 1.024 en los grafos de 4.096 y 6.144 tokens; precisión float32 en la referencia |
| Idiomas soportados | no disponible |
| Licencia | LFM1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | LiteRT / TFLite (`.tflite`), más tokenizador, tabla de embeddings y scripts de conversión |

## Arquitectura y entrenamiento

El modelo base LiquidAI/d1-2B es un modelo de decisión de Liquid AI para texto, imágenes y vídeo construido sobre LiquidAI/LFM3-VL-2B. Su funcionamiento difiere del de un LLM generativo: lee un estado (cadena, cualquier valor JSON, o nada cuando las imágenes constituyen todo el estado) y cualquier número de preguntas nombradas sobre él, y devuelve respuestas tipadas con sus probabilidades en un solo forward pass, sin generar tokens. Los tipos de respuesta soportados incluyen `noul` (sí/no), `choice` (una o varias opciones nombradas), `score` (nivel ordenado), `text`, `number` y `date` (con su span en el estado), `number` con `range` (estimación con intervalo) y `box`/`boxes` (detección de objetos en imagen). Las peticiones y respuestas siguen `system_one()` y `system_one_batch()` del código del proveedor.

La conversión a LiteRT se realizó con litert-torch 0.10.0 para la API CompiledModel de ai-edge-litert 2.3.0. Los grafos de decisión reciben los embeddings de los tokens de una secuencia y dos tablas pequeñas que definen qué posiciones ven a cuáles, y devuelven los hidden states tras la normalización final. El host lee las peticiones con el código del proveedor sin modificar (`api.py`, `prompt.py` y otros ficheros de `provider/`), escribe los embeddings, selecciona el grafo adecuado y extrae las respuestas. La validación se hizo contra el código del proveedor en float32 sobre CPU: sobre 520 peticiones de test, los ficheros coincidieron en la opción más probable en toda pregunta que no fuera un empate cercano y las probabilidades quedaron dentro de 3,68e-5 de la referencia. No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Decisión tipada sobre un estado: respuestas sí/no (`noul`), elección entre opciones nombradas (`choice`, simple o múltiple), nivel ordenado (`score`), extracción de texto, número o fecha con su span (`text`, `number`, `date`), estimación con intervalo (`number` con `range`).
- Detección y localización de objetos en imagen mediante `box` y `boxes` (uno o todos los objetos de una imagen).
- Procesamiento multimodal: texto, imágenes y vídeo (según la descripción del modelo base).
- Procesamiento por lotes: `system_one_batch()` y un grafo específico que ejecuta ocho secuencias de hasta 128 tokens en una sola llamada.
- Respuestas con probabilidades calibradas por opción, útiles para umbrales y lógica de enrutamiento posterior.
- Sin generación de tokens: la salida es estructurada y de longitud fija por pregunta, lo que facilita su integración en pipelines deterministas.
- Ejecución on-device: grafos compilados ahead-of-time para la NPU del Qualcomm SM8850 y ejecución en GPU/CPU mediante LiteRT.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y devuelve simultáneamente si el cliente pide reembolso (`noul`), qué equipo debe atenderlo (`choice`), qué temas aborda (`choice` múltiple) y su urgencia (`score`). Es adecuado porque resuelve varias preguntas en un único forward pass con probabilidades, tal como muestra el ejemplo de la model card (189 tokens de entrada, sin tokens de salida).
- Enrutamiento y clasificación en el borde: al ejecutarse en NPU de móvil (70,1 ms por llamada en la NPU del Galaxy S26) o GPU (736,8 ms en la GPU del Pixel 11 Pro a float32), permite clasificar y decidir localmente sin enviar datos a la nube.
- Extracción de campos estructurados: lectura de fechas, números y textos con su span en documentos o mensajes, útil para poblar formularios o bases de datos a partir de texto libre.
- Verificación visual en aplicaciones móviles: con los ficheros de torre visual y los tipos `box`/`boxes`, se puede detectar y localizar objetos en una imagen capturada por el dispositivo.
- Automatización de atención al cliente multi-turno: combinado con un orquestador externo, el modelo actúa como clasificador y extractor de intenciones por turno, manteniendo decisiones consistentes gracias a las probabilidades por opción.
- Control de calidad y umbrales: al devolver probabilidades por opción, se pueden definir umbrales de confianza y derivar los casos dudosos a revisión humana o a un modelo mayor.
- Procesamiento por lotes en servidor de borde: el grafo de ocho secuencias de hasta 128 tokens permite clasificar lotes pequeños de peticiones cortas en una sola llamada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona métricas de fidelidad y latencia de la conversión:

| Medición | Contexto | Resultado |
|---|---|---|
| Fidelidad de probabilidades | 520 peticiones de test, CPU float32 (M4 Max) | diferencia máxima de 3,68e-5 respecto a la referencia |
| Fidelidad de probabilidades | 520 peticiones de test, GPU Metal float32 (M4 Max) | diferencia máxima de 3,68e-5 respecto a la referencia |
| Latencia, una pregunta | Apple M4 Max, Metal, float32 | mediana de 40,9 ms |
| Latencia, tres preguntas | Apple M4 Max, Metal, float32, una llamada | mediana de 41,3 ms |
| Latencia, una pregunta | NPU Qualcomm SM8850 (Galaxy S26), grafo compilado para el chip | 70,1 ms |
| Latencia, una pregunta | GPU Pixel 11 Pro, float32 | 736,8 ms |
| Tokens de entrada / salida | Ejemplo de ticket de soporte | 189 de entrada, 0 de salida |

En el ejemplo de la model card, las probabilidades coinciden hasta el quinto decimal entre el proveedor en CPU float32, esta conversión en CPU y esta conversión en Metal float32 (por ejemplo, `refund` = 0,99690; `team` billing = 0,71030; `urgency` medium = 0,67318), con una diferencia máxima antes de redondear de 1,7e-6.

## Requisitos de hardware

- Tamaño de los ficheros: cada grafo de decisión ocupa entre 2,93 GB (128 tokens) y 2,96 GB (6.144 tokens); el repositorio completo suma 44,8 GB.
- VRAM/RAM estimada para inferencia: en torno a 3 GB por grafo de decisión en los formatos publicados (fp16 en capas FC), más los ficheros de torre visual y la tabla de embeddings.
- Ejecución en móvil: verificada en la NPU del Qualcomm SM8850 (Galaxy S26) y en la GPU del Pixel 11 Pro mediante LiteRT 2.2.0.
- Ejecución en escritorio: verificada en Apple M4 Max con CPU y GPU Metal a float32.
- Cabe en GPU de consumidor con al menos 4 GB de memoria libre para un único grafo; no se dispone de datos de ejecución en GPUs NVIDIA en la información proporcionada.
- Despliegue: API CompiledModel de ai-edge-litert 2.3.0, LiteRT 2.2.0 en Android, y host Python de escritorio incluido en el repositorio (sin PyTorch). No se mencionan soportes de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia: 40,9 ms (M4 Max, Metal, float32, una pregunta), 70,1 ms (NPU SM8850) y 736,8 ms (GPU Pixel 11 Pro, float32). No se dispone de datos de throughput para lotes grandes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| d1-2B-LiteRT (este) | 2B | hasta 6.144 tokens | LiteRT/TFLite, on-device (NPU/GPU/CPU) | LFM1.0 | Conversión cuantizada de d1-2B; salida tipada sin generación de tokens |
| LiquidAI/d1-2B | 2B | no disponible | Pesos originales del proveedor (PyTorch) | LFM1.0 | Modelo de decisión de referencia; sin compilación on-device |
| LiquidAI/LFM3-VL-2B | 2B | no disponible | Pesos originales | LFM1.0 | Modelo base multimodal sobre el que se construye d1-2B |

No se dispone de información sobre otros modelos de decisión comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; solo responde a preguntas tipadas predefinidas sobre un estado.
- Las respuestas son probabilísticas; en empates cercanos la opción más probable puede diferir de la referencia, según advierte la propia model card.
- La licencia LFM1.0 (marcada como "other" en Hugging Face) impone condiciones específicas; es necesario revisar el fichero LICENSE antes de cualquier uso comercial.
- El repositorio ocupa 44,8 GB y cada grafo individual ronda los 3 GB, lo que limita su distribución y almacenamiento en dispositivos con poco espacio.
- Los grafos de 4.096 y 6.144 tokens usan atención en bloques de consulta de 1.024, lo que puede afectar al comportamiento en secuencias muy largas.
- La validación publicada se limita a 520 peticiones de test y a plataformas concretas (M4 Max, Galaxy S26, Pixel 11 Pro); no hay datos de robustez en otros dominios ni de sesgos.
- No se dispone de información sobre idiomas soportados, por lo que el rendimiento multilingüe no está garantizado.
- Riesgo de alucinación en la extracción de spans (`text`, `number`, `date`) no cuantificado en la información disponible.
- La compilación ahead-of-time solo cubre la NPU del Qualcomm SM8850; en otros chips se depende de la ejecución en GPU/CPU de LiteRT.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/d1-2B-LiteRT
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Modelo base de la familia visual: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Model card del modelo fuente: https://huggingface.co/LiquidAI/d1-2B
- Blog de Liquid AI sobre d1: https://www.liquid.ai/blog/open-d1
