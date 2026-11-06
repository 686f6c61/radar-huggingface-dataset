# florianvoss/LFM2.5-VL-1.6B-GPTQ-a16w4

## Resumen

LFM2.5-VL-1.6B-GPTQ-a16w4 es una compilación cuantizada y optimizada del modelo multimodal LiquidAI/LFM2.5-VL-1.6B, publicada por el usuario florianvoss. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: los pesos originales en BF16 se han cuantizado con GPTQ (INT4 simétrico en las capas Linear del decodificador, grupo de 256) e INT8 para el LM head, las capas Linear de visión y los embeddings/KV cache, y después se han compilado con Model Compiler 3.0.0 para la plataforma de hardware SiMa.ai Modalix.

El modelo base LFM2.5-VL-1.6B pertenece a la familia LFM2.5 de Liquid AI, con 1.600 millones de parámetros y arquitectura multimodal de tipo image-text-to-text. Esta versión concreta está pensada exclusivamente para inferencia en dispositivos Modalix mediante el runtime LLiMa/Neat de SiMa.ai, no para ejecución genérica en GPU. La ventana de contexto compilada es de 4.096 tokens y la resolución de imagen de entrada está fijada en 448x448.

Su relevancia es acotada pero específica: demuestra un flujo completo de cuantización (llmcompressor), compilación y despliegue de un VLM de 1,6B en hardware de borde (edge AI) con aceleradores dedicados, con métricas de latencia y throughput medidas end-to-end en el dispositivo. Es útil para quien evalúe inferencia multimodal de baja latencia en entornos embebidos, no para quien busque un checkpoint entrenado o afinado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5-VL (modelo base LiquidAI/LFM2.5-VL-1.6B); decodificador tipo transformer con torre de visión y proyector multimodal |
| Parametros totales | 1,6 mil millones (1.6B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (build descargable); recompilable a 8192 tokens |
| Tipos de cuantizacion | GPTQ simétrico INT4 (grupo 256) en Linear del decodificador; RTN simétrico INT8 por canal de salida en LM head y Linear de visión; embeddings y KV cache en INT8; activaciones BF16; proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia "other" en Hugging Face, con nombre lfm1.0) |
| Formato de pesos | artefactos compilados para SiMa.ai Modalix (LLiMa); checkpoint fuente pre-cuantizado en Safetensors; no se distribuye GGUF |
| Tamano del repositorio | 2,4 GB |
| Resolucion de imagen | 448x448 fija |
| Calibracion | 512 conversaciones multi-turno de UltraChat, hasta 4096 tokens; etapas RTN sin datos |
| Compilador | SiMa.ai Model Compiler 3.0.0 |
| Libreria | llima |

## Arquitectura y entrenamiento

El modelo base LFM2.5-VL-1.6B es un modelo multimodal image-text-to-text de Liquid AI que combina un decodificador de lenguaje con una torre de visión y un proyector que alinea representaciones visuales y textuales. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens vistos, ni si hubo etapas de RLHF o DPO; tampoco se especifican innovaciones de atención o decodificación del modelo base. Todo ello debe consultarse en la model card del checkpoint original LiquidAI/LFM2.5-VL-1.6B.

Lo que sí documenta esta ficha es el proceso de cuantización y compilación. La política de cuantización se recrea con la API pública de llmcompressor: GPTQ simétrico INT4 con grupo de 256 sobre las capas Linear del decodificador, RTN simétrico INT8 por canal en el LM head y en las capas Linear de visión, embeddings y KV cache en INT8, y proyector multimodal preservado en BF16. La calibración GPTQ usa 512 conversaciones completas multi-turno de UltraChat con hasta 4.096 tokens. Posteriormente, el checkpoint pre-cuantizado se compila con Model Compiler 3.0.0 (script `compile.sh`, 4K de contexto, 16 workers, entrada 448x448, filter sharing por defecto del compilador). Las revisiones del compilador y el SHA-256 de los pesos fuente quedan registrados en `compilation.json`. La compilación y el desempaquetado local se completaron con éxito, pero la calidad condicionada por imagen no ha sido validada en esta compilación según la propia model card.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción, respuesta a preguntas visuales y conversación multimodal con una imagen de entrada a 448x448.
- Generación de texto solo texto: el componente de lenguaje funciona sin imagen, con métricas medidas en Modalix.
- Conversación multi-turno dentro de la ventana de 4.096 tokens (ampliable a 8.192 recompilando).
- Capacidades de razonamiento, código y matemáticas: no disponibles de forma explícita en la información proporcionada; dependen del modelo base.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no declara idiomas.
- Capacidades especiales (thinking mode, audio, vídeo): no disponibles; solo se documenta visión por imagen fija.
- Despliegue en hardware de borde: inferencia compilada para SiMa.ai Modalix con runtime LLiMa/Neat.

## Casos de uso

- Inspección visual en el borde: clasificación y descripción de imágenes de 448x448 capturadas por cámaras en dispositivos Modalix, con TTFT medio de 0,16 s medido end-to-end para una imagen y un prompt de texto.
- Asistentes embebidos de baja latencia: generación de texto a unos 68 tokens/s en Modalix con prompts de 128 tokens, adecuado para interfaces conversacionales en dispositivos con presupuesto energético y de cómputo limitado.
- Procesamiento de documentos escaneados o tickets: preguntas y respuestas sobre imágenes fijas de 448x448 en flujos de digitalización en el propio dispositivo, sin enviar datos a la nube.
- Automatización industrial con visión: verificación visual de piezas o paneles mediante prompts textuales, aprovechando la compilación para aceleradores SiMa.ai y la ventana de 4K tokens para instrucciones largas.
- Prototipado de pipelines VLM cuantizados: uso del repositorio como referencia reproducible (script `prequantization/quantize.py` y `compile.sh`) para validar recetas GPTQ INT4 + INT8 en hardware Modalix antes de desplegar variantes propias.
- Evaluación comparativa de latencia en edge: banco de pruebas de TTFT y throughput con distintas longitudes de entrada (128 a 3.072 tokens) para dimensionar despliegues en Modalix.
- Conversación multimodal multi-turno: diálogos que alternan texto e imagen dentro de los 4.096 tokens de contexto, por ejemplo soporte técnico guiado por capturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye métricas de rendimiento de inferencia medidas en SiMa.ai Modalix con MoLE, batch size 1, cuatro muestras por longitud de entrada y `max_new_tokens=128` (solo texto):

| Tokens de entrada | TTFT medio (s) | Tasa de generación media (tokens/s) |
|---:|---:|---:|
| 128 | 0,03 | 68,21 |
| 256 | 0,07 | 67,92 |
| 512 | 0,13 | 67,20 |
| 1024 | 0,25 | 65,99 |
| 2048 | 0,55 | 61,11 |
| 3072 | 1,00 | 59,32 |

Para imagen + texto, con una imagen de 448x448 y cinco peticiones nuevas, medición end-to-end (incluye decodificación y preprocesado de imagen, codificación visual, proyección, prefill del LM y primer token generado):

| Resolución de imagen | TTFT medio (s) | Tasa de generación media (tokens/s) | Tokens generados medios |
|---:|---:|---:|---:|
| 448x448 | 0,16 | 68,04 | 72 |

## Requisitos de hardware

- Hardware objetivo: dispositivo SiMa.ai Modalix con CLI de SiMa.ai y runtime Neat (que incluye LLiMa). No está pensado para ejecución en GPU convencional.
- VRAM estimada: no disponible; el modelo se ejecuta en el acelerador de Modalix, no en GPU NVIDIA/AMD.
- GPU recomendadas: no aplica; no se documenta soporte para A100, H100, RTX 4090 ni similares.
- Compatibilidad con GPU de consumo: no disponible; los artefactos son binarios compilados para Modalix.
- Opciones de despliegue: `llima` CLI en Modalix (modelos en `/media/nvme/llima/models` por defecto, configurable con `LLIMA_MODELS_PATH`); descarga con `hf download` o copia vía `scp`; recompilación con Model Compiler 3.0.0 y `compile.sh`.
- Latencia y throughput: TTFT de 0,03 s (128 tokens de texto) a 1,00 s (3.072 tokens); 0,16 s con imagen 448x448; generación de 59 a 68 tokens/s según longitud de entrada, en Modalix.
- Memoria de contexto: el presupuesto de 4.096 tokens incluye entrada y tokens generados; contextos mayores incrementan el uso de KV cache y deben caber en el dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Despliegue |
|---|---|---|---|---|---|
| LFM2.5-VL-1.6B-GPTQ-a16w4 (esta ficha) | 1,6B | 4096 (recompilable a 8192) | Imagen + texto | lfm1.0 | SiMa.ai Modalix (LLiMa) |
| LiquidAI/LFM2.5-VL-1.6B (modelo base) | 1,6B | no disponible en la información proporcionada | Imagen + texto | lfm1.0 | GPU genérica (BF16) |
| Otros VLM de ~1-2B (p. ej. familia Qwen2-VL-2B, SmolVLM) | ~2B | no disponible en la información proporcionada | Imagen + texto | variable | GPU, llama.cpp, etc. |

La comparación de rendimiento con alternativas no está disponible: la model card no publica benchmarks de calidad y las métricas de latencia solo son válidas en Modalix, por lo que no son directamente comparables con despliegues en GPU. La diferencia principal frente al modelo base es la cuantización INT4/INT8 y la compilación para hardware específico, no una mejora de capacidades.

## Limitaciones y advertencias

- Es un artefacto de compilación y cuantización, no un modelo afinado: las capacidades reales son las del modelo base LiquidAI/LFM2.5-VL-1.6B.
- La calidad condicionada por imagen no ha sido validada en esta compilación según la propia model card; solo se midió rendimiento de texto e imagen+texto en latencia.
- Contexto limitado a 4.096 tokens en los artefactos descargables; ampliarlo a 8.192 requiere recompilar y disponer de memoria suficiente en el dispositivo.
- Resolución de imagen fija en 448x448, lo que limita el detalle en documentos densos o imágenes de alta resolución.
- Dependencia total del hardware SiMa.ai Modalix y del runtime Neat/LLiMa; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- La cuantización INT4/INT8 puede degradar precisión frente al BF16 original; no se aportan métricas de esa degradación.
- Idiomas soportados no declarados; no se puede asumir cobertura multilingüe.
- Riesgo de alucinación y sesgos: no documentados en esta ficha; deben evaluarse a partir del modelo base.
- Licencia lfm1.0: es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que la licencia se etiqueta como "other".
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/florianvoss/LFM2.5-VL-1.6B-GPTQ-a16w4
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-1.6B
- Revisión del modelo base usada para cuantizar: https://huggingface.co/LiquidAI/LFM2.5-VL-1.6B/tree/919fde3d022e3f90a4716006f993938ee8c2eb97
- Guía de inicio de SiMa.ai Neat: https://developer.sima.ai/software/getting-started/
- Licencia (archivo LICENSE del repositorio): https://huggingface.co/florianvoss/LFM2.5-VL-1.6B-GPTQ-a16w4/blob/main/LICENSE
