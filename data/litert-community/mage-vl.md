# litert-community/Mage-VL

## Resumen

Mage-VL es un modelo de visión-lenguaje (VLM) de 4.700 millones de parámetros desarrollado por Microsoft, distribuido bajo licencia Apache-2.0. Combina un codificador visual ViT de 24 capas con embeddings posicionales rotatorios tridimensionales y un decodificador lingüístico Qwen3-4B de 36 capas. La versión aquí descrita es la conversión realizada por la comunidad litert-community al formato LiteRT-LM (`.litertlm`), optimizada para inferencia totalmente local en dispositivos móviles y de escritorio mediante el runtime LiteRT-LM de Google AI Edge.

El modelo resuelve el problema de ejecutar un VLM multimodal en hardware de consumo sin conexión a la nube: el archivo resultante ocupa aproximadamente 2,81 GB, utiliza pesos int8 en el codificador visual y en el adaptador PatchMerger, e int4 con cuantización por bloques de 128 elementos más la técnica OCTAV en el decodificador. La ventana de contexto del caché KV está limitada a 2048 tokens y la entrada de imagen se fija estáticamente a 448×448 píxeles, lo que produce 196 tokens visuales tras la fusión 2×2 de parches.

Su relevancia actual radica en que es la primera conversión de Mage-VL al formato LiteRT-LM y demuestra que un VLM de casi 5.000 millones de parámetros puede describir imágenes y transcribir documentos con precisión verificada en un iPhone 17 Pro, manteniendo una huella de memoria pico de aproximadamente 1,5 GiB. Para desarrolladores que necesitan privacidad de datos, latencia predecible sin red o despliegue en flotas de dispositivos sin GPU dedicada, esta conversión ofrece una alternativa práctica a las API en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: ViT de 24 capas (1024 dim, atención completa, RoPE 3-D) + adaptador PatchMerger + decodificador Qwen3-4B (36 capas, hidden 2560, GQA con 8 cabezas KV) |
| Parametros totales | 4.700 millones (aproximado, según model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (caché KV) |
| Tipos de cuantizacion | Visión: int8; adaptador PatchMerger: int8; decodificador: int4 simétrico con bloques de 128 + OCTAV; embedder externo en int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), archivo único de ~2,81 GB |
| Modelo base | microsoft/Mage-VL |
| Entrada de imagen | 448×448 estático, normalización OpenAI-CLIP integrada en el codificador |
| Tokens de imagen | 784 parches → fusión 2×2 → 196 tokens visuales |
| Runtime | LiteRT-LM (Google AI Edge) |

## Arquitectura y entrenamiento

La arquitectura sigue un esquema estándar de VLM con torre visual y decodificador de lenguaje acoplados mediante un adaptador. El codificador visual es un ViT de 24 capas con dimensión 1024, atención completa y embeddings posicionales rotatorios tridimensionales, reescrito de forma estática a 448×448 píxeles para eliminar operaciones dinámicas. La salida pasa por un PatchMerger que aplica normalización de capa, agrupación 2×2 y un perceptrón multicapa que proyecta al tamaño oculto del texto (2560). El decodificador es Qwen3-4B, rehospedado como `Qwen3ForCausalLM` independiente con un dict de estados estrictamente 1:1 y `lm_head` no atado, cuantizado con la misma receta int4 por bloques que los LLM Qwen3-4B ya publicados en este formato.

Un detalle técnico relevante es que el decodificador de Mage-VL utiliza posiciones secuenciales 1-D planas, sin M-RoPE, lo que coincide exactamente con lo que proporciona el runtime `fast_vlm` de LiteRT-LM y evita compromisos posicionales que sí afectan a la familia Qwen2-VL. La verificación reportada incluye correlación 1.0 en fp32 y 0.994 en int8 para la torre visual, cero operaciones FLEX/CUSTOM, y una diferencia máxima de 2,4e-7 entre el pipeline de parches y el procesador de imágenes original del modelo. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en la model card proporcionada.

## Capacidades

- Generación de descripciones detalladas de imágenes: la model card reporta descripciones precisas y detalladas de paisajes y escenas fotográficas, idénticas token a token entre el runtime móvil y el de escritorio.
- Lectura de documentos y OCR: transcripción completa y correcta de una página de informe sintética, incluyendo cifras, direcciones de correo y números de teléfono, a resolución 448×448.
- Respuesta visual a preguntas (VQA): respuestas fundamentadas en el contenido de la imagen adjunta.
- Conversación multi-turno con imágenes: permite adjuntar varias imágenes en una misma sesión y continuar con turnos de solo texto, con un tiempo hasta el primer token de aproximadamente 2 segundos en iPhone 17 Pro para turnos textuales de seguimiento.
- Procesamiento totalmente local: inferencia sin conexión a red, con la codificación visual y el prefill ejecutándose en el dispositivo.
- Servicio como API local compatible con OpenAI mediante `litert-lm serve`.
- Capacidades de tool calling, function calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Descripción automática de imágenes en aplicaciones móviles: el modelo procesa una foto y genera una descripción en una frase con aproximadamente 10 tokens por segundo en un iPhone 17 Pro, adecuado para funciones de accesibilidad (lectores de pantalla para personas con discapacidad visual) que deben operar sin conexión y sin enviar imágenes a servidores externos.
- Digitalización de documentos en campo: la transcripción OCR verificada a 448×448 permite capturar informes, facturas o formularios con la cámara del teléfono y extraer el texto localmente, útil en inspecciones industriales, logística o trabajo de campo sin cobertura de red.
- Asistentes de atención al cliente con imágenes: un chatbot embebido en una app puede recibir capturas de pantalla o fotos del producto del usuario y responder preguntas de seguimiento en la misma conversación, aprovechando los turnos de solo texto con aproximadamente 2 segundos de latencia en móvil.
- Moderación y etiquetado de contenido visual en el dispositivo: clasificación y descripción de imágenes generadas por el usuario antes de subirlas, reduciendo costes de backend y mejorando la privacidad al no transmitir el contenido original.
- Prototipado e investigación en robótica de bajo coste: integración del runtime LiteRT-LM en sistemas embebidos basados en Linux o macOS para tareas de percepción visual descriptiva, con un consumo de memoria pico de aproximadamente 1,5 GiB.
- Herramientas de escritorio para análisis de imágenes: en Apple Silicon, el backend GPU Metal alcanza 80 tokens por segundo en decodificación y 740 tokens por segundo en prefill, lo que permite flujos interactivos de descripción y pregunta-respuesta sobre lotes de imágenes en un portátil.
- Evaluación comparativa de runtimes: servir como referencia reproducible para medir el impacto de la cuantización int4 e int8 en la calidad de un VLM, gracias a la verificación token a token entre plataformas documentada por el autor.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks académicos estándar (MMLU, HumanEval, GSM8K, etc.). Los datos disponibles son mediciones de rendimiento de inferencia y verificaciones cualitativas de precisión:

| Plataforma | Backend | Prefill (256 tokens) | Decodificación | TTFT | Inicialización | Huella pico |
|---|---|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 65 tok/s | 23,0 tok/s | 4,11 s | no disponible | no disponible |
| Apple M4 Max (macOS) | GPU (Metal) | 740 tok/s | 80,0 tok/s | 0,37 s | no disponible | no disponible |
| iPhone 17 Pro | CPU | no disponible | ~10 tok/s | 7,5–9 s (incluye codificación visual y prefill) | 0,8 s en caliente / 3–4 s primera ejecución | ~1,5 GiB |

Las cifras de escritorio corresponden a `litert-lm benchmark` 0.15.0 con `-p 256 -d 256 --runs 3`, máximo de 4096 tokens y sin incluir el codificador visual. La fila del iPhone corresponde a la comprobación del 3 de agosto de 2026 con la compilación de contexto 2048: inicialización del motor en 2,8 s y 1,47 GiB de pico al describir una foto. En cuanto a precisión cualitativa, se reporta correlación de 1.0 en fp32 y 0.994 en int8 para la torre visual, y una comprobación de cordura de 8 preguntas en escritorio con 7 aciertos y sin degeneración.

## Requisitos de hardware

- VRAM o memoria unificada estimada: aproximadamente 1,5 GiB de huella pico en inferencia móvil; el archivo en disco ocupa ~2,81 GB.
- GPU recomendadas: no se especifican modelos concretos de GPU de escritorio; el runtime soporta backend GPU Metal en Apple Silicon. Para A100, H100 o RTX 4090 no hay datos publicados.
- Compatibilidad con GPU de consumo: el modelo está diseñado para ejecutarse en CPU de dispositivos móviles (iPhone 17 Pro verificado) y en CPU/GPU de Apple Silicon; no se documenta soporte para GPUs NVIDIA de consumo.
- Opciones de despliegue: runtime LiteRT-LM (`pip install litert-lm`), con los comandos `litert-lm run` para inferencia puntual, `litert-lm serve` para exponer una API local compatible con OpenAI y `litert-lm benchmark` para mediciones. El mismo archivo funciona en macOS, Linux y Windows.
- Latencia y throughput: 10 tok/s en iPhone 17 Pro (CPU), 23 tok/s en Apple M4 Max (CPU) y 80 tok/s con GPU Metal; TTFT de 7,5–9 s en móvil con imagen y de 0,37 s en M4 Max con GPU.
- Advertencia operativa: versiones del CLI entre 0.14.0 y 0.19.2 pueden reutilizar descargas incompletas en `~/.litert-lm/cache/huggingface/litert-community/Mage-VL/` sin verificar su tamaño; si el proceso termina con error de bus o con `too large for file size`, debe eliminarse el archivo en caché y repetir la ejecución.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A continuación se indican únicamente los ejes que pueden contrastarse con alternativas de la misma categoría (VLM de 3.000–5.000 millones de parámetros para despliegue local), sin cifras inventadas:

| Modelo | Parámetros | Contexto | Formato on-device | Licencia |
|---|---|---|---|---|
| Mage-VL (LiteRT-LM) | ~4,7 B | 2048 | `.litertlm` (LiteRT-LM) | Apache-2.0 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Contexto limitado a 2048 tokens de caché KV, insuficiente para documentos extensos o conversaciones muy largas; los documentos deben caber en ese presupuesto tras los 196 tokens de imagen.
- Entrada de imagen fija a 448×448 píxeles: imágenes de mayor resolución se reescalan, lo que puede degradar la lectura de texto muy pequeño o detalles finos, aunque la transcripción de una página de informe sintética se verificó correcta a esa resolución.
- Idiomas soportados no documentados: no hay garantía explícita de calidad multilingüe más allá de lo observado en las pruebas en inglés de la model card.
- Sesgos conocidos: no disponible; no se documenta ninguna evaluación de sesgos demográficos, culturales o de otro tipo.
- Riesgo de alucinación: no cuantificado; como todo VLM, puede generar descripciones plausibles pero incorrectas, especialmente con imágenes ambiguas o de baja calidad. No se han publicado tasas de error en benchmarks de fidelidad visual.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y tenerse en cuenta que el modelo base es microsoft/Mage-VL, también Apache-2.0 según la model card.
- Caveat de producción: la cuantización int4 del decodificador y int8 del codificador introducen pérdida de precisión (correlación 0.994 en la torre visual); la comprobación de cordura de 8 preguntas con 7 aciertos sugiere que pueden aparecer errores en tareas exigentes.
- Gestión de caché del CLI: las versiones 0.14.0 a 0.19.2 no validan el tamaño ni la versión del archivo descargado, lo que puede provocar fallos silenciosos o ejecución de una versión obsoleta si no se limpia el directorio de caché manualmente.
- Sin soporte documentado de tool calling, agentes o razonamiento multi-paso, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Mage-VL
- Modelo base: https://huggingface.co/microsoft/Mage-VL
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Imagen de ejemplo COCO: https://huggingface.co/huggingface/documentation-images/blob/main/coco_sample.png
