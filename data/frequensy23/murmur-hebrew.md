# freQuensy23/murmur-hebrew

## Resumen

Murmur Trilingual Models es un paquete de dos artefactos publicados por el desarrollador independiente freQuensy23 para la aplicación Android de dictado Murmur. El primero es Girgur Cleanup, un modelo de lenguaje derivado de Qwen3.5-2B mediante fine-tuning LoRA (r=16, alpha=32) sobre 4.920 ejemplos de limpieza de dictado trilingüe en ruso, inglés y hebreo, distribuido en formato GGUF Q4_0 de 1.202.484.864 bytes. El segundo es un reconocedor OCR PP-OCRv5 Mobile en ONNX de 8,92 MB con 883 clases CTC que cubre cirílico, latino y caracteres hebreos.

El modelo resuelve el problema de la limpieza post-ASR en dispositivos móviles: convierte transcripciones en bruto (con puntuación ausente, repeticiones y errores de reconocimiento) en texto dictado legible, manteniendo la coherencia de idioma. Con 1.881.825.088 parámetros totales según safetensors y un repositorio de 1,2 GB, está diseñado para ejecución local en Android, no para servidores.

Su relevancia actual radica en el soporte trilingüe poco habitual (ruso, inglés y hebreo, incluyendo mezclas he_en y he_ru) y en que el autor publica métricas de evaluación reproducibles con paridad verificada entre BF16 y GGUF. Es un modelo de nicho, orientado a un pipeline de dictado concreto, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-2B) con fine-tuning LoRA; OCR: PP-OCRv5 Mobile con cabeza CTC |
| Parametros totales | 1.881.825.088 (modelo de lenguaje); OCR: 8.920.238 bytes en ONNX |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_0 (1.202.484.864 bytes); pesos BF16 de referencia para paridad |
| Idiomas soportados | ru, en, he (incluye mezclas he_en y he_ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_0), ONNX (OCR), safetensors (pesos base) |

## Arquitectura y entrenamiento

El componente de lenguaje parte de Qwen3.5-2B, un transformer decoder-only de la familia Qwen, y se ajusta con LoRA de rango 16 y alpha 32 sobre 4.920 ejemplos de limpieza de dictado trilingüe etiquetados con perfiles ru, en, mixed, he, he_en y he_ru. El prompt profile es `finetuned.v2` con la plantilla de chat de qwen3.5. La cuantización Q4_0 se generó con paridad greedy verificada frente a BF16 (24/24 salidas idénticas), lo que indica que la pérdida por cuantización es despreciable en el régimen evaluado.

El componente OCR es un reconocedor PP-OCRv5 Mobile con 883 clases CTC: blank, 850 caracteres base cirílicos/latinos, 31 caracteres hebreos (א–ת, ׳, ״, ₪, ־) y espacio. Se entrenó con orden visual FriBidi y reversión lógica en post-proceso, lo que permite manejar texto hebreo de derecha a izquierda dentro de un pipeline OCR convencional. No se especifican en la información disponible el número total de tokens de entrenamiento del LLM, la composición completa del dataset ni si hubo RLHF o DPO.

## Capacidades

- Limpieza de dictado post-ASR: corrección de puntuación, repeticiones y errores de reconocimiento en ru, en y he.
- Generación de texto conversacional con plantilla de chat qwen3.5.
- Reconocimiento OCR de texto impreso en cirílico, latino y hebreo, con soporte de orden visual RTL.
- Manejo de mezcla de idiomas dentro de una misma frase (he_en, he_ru, ru+en mixto).
- Ejecución on-device en Android mediante GGUF y ONNX.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta soporte de visión, audio ni modo thinking.

## Casos de uso

- Dictado por voz en Android: el modelo recibe la transcripción bruta del ASR y la reescribe con puntuación y mayúsculas correctas; su tamaño Q4_0 de 1,2 GB permite ejecución local sin conexión.
- Aplicaciones de notas multilingües para hablantes de hebreo que alternan con inglés o ruso: las mezclas he_en y he_ru están entrenadas explícitamente y muestran N-WER de 6,15% y 5,57% en el conjunto de test Girgur.
- Digitalización de documentos en hebreo: el OCR ONNX de 8,92 MB logra CER de 0,04% en hebreo puro y 99,16% de coincidencia exacta en el conjunto de validación de 8.000 recortes.
- Extracción de texto de capturas de pantalla en ruso e inglés: CER de contenido de 2,31% en 26 pantallas reales, con un coste de +0,10% frente al modelo stock.
- Preprocesado de corpus para pipelines de NLP: limpieza de transcripciones antes de indexación o análisis, gracias a la reducción de N-WER de 19,57% (ASR bruto) a 4,41%.
- Asistentes de voz embebidos en apps de mensajería: integración del GGUF en un runtime llama.cpp para convertir audio transcrito en mensajes enviables sin salir del dispositivo.
- Corrección de subtítulos generados automáticamente en contenido trilingüe, usando el modelo de limpieza sobre segmentos ASR antes de la publicación.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Referencia |
|---|---|---|
| dev.v2 (ru+en), guarded pass | 75,5% | +18,4% vs Qwen3.5-2B stock |
| dev.v2 (ru+en), N-WER | 5,3% | no disponible |
| test.v2 (ru+en), guarded pass | 68,2% | +18,2% vs Qwen3.5-2B stock |
| test.v2 (ru+en), N-WER | 9,7% | no disponible |
| Girgur test (n=501), N-WER global | 4,41% | 19,57% en ASR bruto |
| Girgur test, N-WER he | 6,97% | no disponible |
| Girgur test, N-WER he_en | 6,15% | no disponible |
| Girgur test, N-WER he_ru | 5,57% | no disponible |
| Girgur test, wrong_language en hebreo | 0 | no disponible |
| Paridad BF16 vs GGUF Q4_0 greedy | 24/24 idénticas | no disponible |
| OCR golden ru+en (26 pantallas), CER contenido | 2,31% | 2,21% stock (+0,10%) |
| OCR val he (8.000 recortes), CER | 0,04% | 99,16% exacto |
| OCR val he_en, CER | 0,01% | 99,50% exacto |
| OCR val ru_he, CER | 0,01% | 99,75% exacto |
| OCR val ru, CER | 0,03% | no disponible |
| OCR val en, CER | 0,04% | no disponible |

## Requisitos de hardware

- VRAM estimada para el LLM en Q4_0: aproximadamente 1,2 GB de pesos más overhead de contexto y runtime; en la práctica, alrededor de 1,5-2 GB de memoria.
- VRAM estimada en BF16: aproximadamente 3,8 GB solo para pesos (1.881.825.088 parámetros × 2 bytes).
- OCR ONNX: 8,92 MB, ejecutable en CPU móvil sin GPU dedicada.
- GPU recomendadas: no se especifican; el destino es ARM Android con aceleración CPU/NNAPI. En escritorio, cualquier GPU con 4 GB o más (RTX 3060, RTX 4060) puede ejecutar la variante BF16.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más para BF16 y con 2 GB para Q4_0.
- Opciones de despliegue: llama.cpp y derivados para GGUF; ONNX Runtime para el OCR; el repositorio incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| murmur-hebrew (Girgur Cleanup) | 1.881.825.088 | no disponible | Limpieza de dictado ru/en/he | Apache-2.0 | GGUF Q4_0, ONNX |
| Qwen3.5-2B (base) | ~2B | no disponible | LLM generalista | Apache-2.0 | safetensors, GGUF |
| PP-OCRv5 Mobile (stock) | ~8,9 MB | no aplica | OCR cirílico/latino | Apache-2.0 | ONNX, Paddle |
| Whisper small (referencia ASR) | ~244M | 30 s de audio | Transcripción, no limpieza | MIT | múltiples |

La comparación directa más relevante es contra Qwen3.5-2B stock, del que el modelo mejora entre 18,2 y 18,4 puntos de guarded pass en dev.v2 y test.v2. Frente a PP-OCRv5 Mobile stock, el OCR pierde 0,10% de CER en el conjunto golden ru+en pero gana cobertura hebrea completa. No se dispone de comparativas con otros modelos de limpieza de dictado.

## Limitaciones y advertencias

- Modelo de nicho: está entrenado exclusivamente para limpieza de dictado trilingüe; su rendimiento en tareas generales de razonamiento o código no está evaluado y probablemente sea inferior al de Qwen3.5-2B sin ajustar.
- Cobertura idiomática limitada a ru, en y he; no se documenta comportamiento en otras lenguas.
- Longitud de contexto no especificada; no se recomienda para documentos largos sin validación previa.
- Riesgo de alucinación inherente a un LLM de 2B: puede introducir palabras no presentes en la transcripción original, especialmente en pasajes ambiguos.
- El OCR pierde 0,10% de CER frente al modelo stock en texto ru+en; conviene evaluar por dominio antes de sustituirlo.
- Sesgos: no se documentan análisis de sesgo; al derivar de Qwen3.5-2B hereda los sesgos de su corpus base.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene 0 descargas y 0 likes, sin validación por parte de la comunidad.
- El repositorio mezcla dos artefactos con propósitos distintos (LLM y OCR); hay que seleccionar el archivo correcto según el caso de uso.
- La fecha de creación del repositorio (2026-11-25) es posterior a la de la mayoría de modelos de referencia; verificar compatibilidad con versiones actuales de llama.cpp.

## Enlaces

- Hugging Face: https://huggingface.co/freQuensy23/murmur-hebrew
- Repositorio de la aplicación Murmur: https://github.com/freQuensy23-coder/murmur
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- PP-OCRv5 (PaddleOCR): no disponible en la información proporcionada
