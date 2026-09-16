# huutamm1612/qwen-tts-ngoc-huyen-voice

## Resumen

Qwen-TTS Ngọc Huyền es un modelo de síntesis de voz (text-to-speech) en vietnamita, publicado por el usuario huutamm1612 en Hugging Face. Se trata de un ajuste fino del modelo base `g-group-ai-lab/gwen-tts-0.6B`, que a su vez sigue la arquitectura Qwen3-TTS. El resultado es un modelo de voz personalizada capaz de generar audio con la voz de la locutora Ngọc Huyền sin necesidad de proporcionar audio de referencia en el momento de la inferencia, gracias al modo CustomVoice y a un embedding de hablante empaquetado junto a los pesos fusionados.

El modelo cuenta con 905.788.672 parámetros reales (según los pesos en safetensors), un tamaño de repositorio de 2,5 GB y está etiquetado con el pipeline `text-to-speech` y el idioma `vi`. Su relevancia actual reside en que cubre un nicho poco servido: voces vietnamitas naturales y de alta calidad, un mercado con escasa oferta de modelos TTS abiertos específicos y donde la mayoría de alternativas multilingües rinden peor en tono y fonética vietnamita.

El entrenamiento se realizó sobre aproximadamente 90 horas de la voz de Ngọc Huyền, recopiladas mediante rastreo de YouTube y TikTok. Es importante señalar que no se ha publicado licencia, no hay resultados de benchmarks independientes (ni MOS ni CER) y la model card advierte explícitamente de que la disponibilidad del modelo no otorga derechos sobre la voz de la persona representada. Se trata, por tanto, de un modelo útil para experimentación y prototipado en vietnamita, pero con incertidumbre legal y de calidad pendiente de resolver para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (componentes talker y code predictor), ajustada desde `g-group-ai-lab/gwen-tts-0.6B` |
| Parámetros totales | 905.788.672 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos se distribuyen en safetensors, presumiblemente en bfloat16) |
| Idiomas soportados | vietnamita (`vi`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-to-speech |
| Modo de voz | CustomVoice con hablante `ngoc_huyen`, sin audio de referencia en inferencia |
| Tamaño del repositorio | 2,5 GB |
| Fecha de creación | 16 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo parte de `g-group-ai-lab/gwen-tts-0.6B`, un sistema TTS basado en la arquitectura Qwen3-TTS. Esta familia descompone la generación en un componente principal de generación de tokens de audio (talker) y un predictor de código (code predictor) que trabaja de forma conjunta; la inferencia se controla mediante parámetros de muestreo separados para el talker y el subtalker (`temperature`, `top_k`, `top_p`, `repetition_penalty`, `subtalker_temperature`, `subtalker_top_k`, `subtalker_top_p`). El paquete exportado incluye los pesos fusionados y el hablante `ngoc_huyen` ya integrado, de modo que no se requiere audio de referencia para sintetizar.

El ajuste fino se llevó a cabo sobre aproximadamente 90 horas de audio de la voz de Ngọc Huyền, recopiladas mediante rastreo de YouTube y TikTok. La receta de entrenamiento descrita por el autor combina adaptación mediante LoRA, fusión de adaptadores y refinamiento selectivo del talker y de la cabeza de salida, seguido de un refinamiento conjunto con el code predictor. El modelo final fue seleccionado por el propio pipeline de entrenamiento y se empaquetó con un embedding de hablante derivado de audio de referencia. No se especifican en la información disponible el número de tokens de audio o texto utilizados, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de voz en vietnamita a partir de texto, con una voz concreta predefinida (`ngoc_huyen`) en modo CustomVoice.
- Síntesis sin audio de referencia: el embedding de hablante viene incluido en el paquete de pesos.
- Control fino del muestreo durante la generación, con parámetros independientes para el talker y el subtalker, orientados a equilibrar naturalidad y estabilidad.
- Gestión de entradas largas mediante segmentación: la model card recomienda dividir el texto en frases o párrafos antes de sintetizar, con un límite de `max_new_tokens` de 4096 en el ejemplo proporcionado.
- Generación por lotes y en GPU, con `device_map="cuda:0"`, `dtype=torch.bfloat16` y `attn_implementation="sdpa"`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni audio de entrada (no es un modelo multimodal de comprensión, solo de síntesis).
- No es un modelo multilingüe: la única lengua declarada en la model card es el vietnamita.

## Casos de uso

- Audiolibros y contenido narrado en vietnamita: el modelo genera voz consistente con una única identidad de hablante, lo que resulta adecuado para narrar capítulos completos; para textos largos conviene segmentar en frases o párrafos antes de cada llamada de síntesis.
- Doblaje y localización de vídeo: permite producir pistas de voz en vietnamita para contenido originalmente en otros idiomas, revisando manualmente nombres propios y términos extranjeros, que la propia model card señala como puntos débiles.
- Locución para vídeo corto y redes sociales: el ajuste sobre material de YouTube y TikTok sugiere un estilo cercano al registro de creadores de contenido, útil para piezas breves y promociones.
- Sistemas de aviso y megafonía (por ejemplo, anuncios de estaciones o aeropuertos): el ejemplo de la model card con un anuncio de tren ilustra este escenario; requiere normalizar previamente horas, números de andén y cifras.
- Accesibilidad y lectura de pantalla: conversión de texto a voz para usuarios vietnamitas con discapacidad visual, siempre que se integre un normalizador de texto robusto antes del modelo.
- E-learning y cursos narrados: generación de lecciones en audio con voz uniforme, segmentando el guion por frases para evitar omisiones o repeticiones.
- Contenido de marca y publicidad: producción de piezas de audio con una voz identificable y coherente entre campañas, con la advertencia de que deben revisarse los derechos de uso de la voz antes de publicar.
- Prototipado de asistentes de voz en vietnamita: integración como etapa de síntesis dentro de un pipeline mayor (ASR, LLM, TTS), ya que este modelo solo cubre la parte de generación de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reportan resultados independientes de MOS (Mean Opinion Score) ni de CER (Character Error Rate), y que las muestras incluidas son ilustrativas y no constituyen una evaluación de calidad calificada por personas.

| Benchmark | Resultado |
|---|---|
| MOS | no disponible |
| CER | no disponible |
| Comparativas con otros TTS | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 1,8 GB (905,8 M de parámetros); sumando activaciones, caché y el códec de audio, un rango realista de trabajo se sitúa en torno a 2,5-4 GB de VRAM. Es una estimación, no un dato publicado por el autor.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM es suficiente en principio (RTX 3060, RTX 4060, RTX 4070, RTX 4080, RTX 4090). En el extremo profesional, A100, H100 o L40S funcionan sin problema, aunque están sobredimensionadas para un modelo de este tamaño.
- Cabe en GPU de consumo: sí, con margen amplio; las generaciones RTX 30 y 40 con 8 GB o más son suficientes en bfloat16. No se dispone de datos sobre ejecución en CPU ni sobre cuantizaciones de 4 u 8 bits.
- Opciones de despliegue: el autor documenta el uso mediante el paquete `qwen-tts` junto con `transformers`, `torch` y `soundfile`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible. La model card solo indica que la velocidad de generación depende de la GPU, el tamaño de lote y la longitud de la entrada, sin aportar cifras.
- Requisitos adicionales: se recomienda la librería `sea-g2p` para normalizar números y patrones de texto vietnamitas a palabras antes de la síntesis.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas por el autor. La siguiente tabla recoge únicamente las características verificables del modelo y de su base directa, marcando como no disponible todo aquello que no consta en la información proporcionada.

| Modelo | Parámetros | Idioma | Modo de voz | Licencia | Formato |
|---|---|---|---|---|---|
| qwen-tts-ngoc-huyen-voice | 905.788.672 | vietnamita | CustomVoice, sin audio de referencia | no disponible | safetensors |
| g-group-ai-lab/gwen-tts-0.6B (base) | aproximadamente 0,6 B (según denominación) | no disponible | no disponible | no disponible | no disponible |

No se dispone de información verificada en la documentación aportada sobre otros modelos TTS comparables (por ejemplo, alternativas multilingües o específicas de vietnamita), por lo que la comparación cuantitativa con ellos queda como no disponible.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no declara licencia, lo que genera incertidumbre sobre el uso comercial, la redistribución y la creación de derivados. Debe aclararse con el autor antes de cualquier despliegue en producción.
- Derechos sobre la voz: la model card advierte explícitamente de que la disponibilidad del modelo no concede derechos sobre la voz de una persona ni permiso para uso comercial; las licencias y autorizaciones aplicables deben revisarse por separado. Tampoco se afirma que la persona representada haya respaldado el modelo.
- Uso responsable: el autor prohíbe el uso para suplantación engañosa y recomienda identificar claramente el audio sintético cuando corresponda.
- Normalización de texto obligatoria: el modelo fue entrenado con texto vietnamita escrito en palabras y no interpreta de forma fiable formas numéricas crudas como fechas, horas, divisas, porcentajes, números de teléfono o abreviaturas. Es necesario normalizar la entrada (el proyecto usa `sea-g2p`).
- Errores de pronunciación y fidelidad: puede pronunciar mal nombres, números o palabras extranjeras, y puede omitir o repetir palabras. La model card recomienda revisar el audio generado antes de publicarlo.
- Sesgos y cobertura: al entrenarse sobre aproximadamente 90 horas de una única voz extraída de YouTube y TikTok, el modelo reproduce las características, el estilo y los sesgos de ese material, sin diversidad de hablantes.
- Limitación de idioma: solo soporta vietnamita; no hay soporte multilingüe declarado.
- Ausencia de evaluación objetiva: no hay MOS, CER ni ninguna otra métrica publicada, por lo que no es posible comparar su calidad de forma cuantitativa con alternativas.
- Contexto y entradas largas: no se especifica longitud de contexto; se recomienda segmentar el texto en frases o párrafos para evitar degradación en pasajes largos.
- Madurez del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, sin historial de uso comunitario que permita validar su comportamiento en distintos entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huutamm1612/qwen-tts-ngoc-huyen-voice
- Modelo base: https://huggingface.co/g-group-ai-lab/gwen-tts-0.6B
- Muestras de audio: https://huggingface.co/huutamm1612/qwen-tts-ngoc-huyen-voice/tree/main/samples
- Los resultados de la búsqueda web realizada no contienen enlaces relevantes sobre este modelo; las URLs devueltas corresponden a listados de jornadas mundiales y no guardan relación con el objeto de esta ficha.
