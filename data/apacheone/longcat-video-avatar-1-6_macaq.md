# ApacheOne/LongCat-Video-Avatar-1.6_MACaQ

## Resumen

LongCat-Video-Avatar-1.6_MACaQ es una cuantización empaquetada en MXFP4 del modelo LongCat-Video-Avatar 1.6, desarrollado originalmente por Meituan (meituan-longcat) y redistribuido por el usuario ApacheOne. Se trata de un modelo de generación de vídeo condicionado por audio (audio-driven video), es decir, produce clips de vídeo de un avatar sincronizados con una pista de voz de entrada. El repositorio contiene únicamente los pesos cuantizados, no el pipeline completo: la generación de vídeo requiere ejecutar el código upstream de LongCat con sus configuraciones, tokenizer y grafos auxiliares.

La relevancia de esta ficha es práctica: el overlay empaquetado ocupa 12,574 GB frente a los pesos originales en BF16, lo que reduce de forma sustancial los requisitos de memoria para inferencia. El autor documenta una prueba de extremo a extremo que genera 93 fotogramas a 832 × 480 y 25 fps en ocho pasos de denoising, con 210,56 segundos de tiempo de ejecución y un pico de 37,40 GiB de asignación CUDA.

No se dispone de información sobre la licencia, los idiomas soportados ni los parámetros totales del modelo base en la información proporcionada. El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado el 17 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para vídeo, con UMT5 como codificador de texto, Whisper para audio y VAE de vídeo; incluye LoRAs DMD y OPSD |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 empaquetado; W4A8 en proyecciones principales del DiT, LoRAs DMD y OPSD, UMT5 y proyecciones del VAE; W4A4 en proyecciones de audio del DiT, Whisper y separador vocal |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (empaquetado MXFP4) |

## Arquitectura y entrenamiento

El modelo base LongCat-Video-Avatar 1.6 es un sistema de generación de vídeo condicionado por audio construido sobre un Diffusion Transformer (DiT) como generador principal, con un codificador de texto UMT5, un codificador de audio Whisper y un VAE de vídeo para la decodificación de fotogramas. El pipeline incorpora además un separador vocal y dos LoRAs (DMD y OPSD) que presumiblemente aceleran o estabilizan el muestreo; el autor no detalla su función exacta. La generación se realiza en ocho pasos de denoising, lo que sitúa al modelo en la categoría de difusión destilada o de pocos pasos.

Esta variante MACaQ no reentrena el modelo: aplica una cuantización post-entrenamiento en formato MXFP4 empaquetado, calibrada con 24 clips de 93 fotogramas cada uno. Las proyecciones principales del DiT, los LoRAs, UMT5 y el VAE se ajustaron para W4A8 (pesos de 4 bits, activaciones de 8 bits), mientras que las proyecciones de audio del DiT, Whisper y el separador vocal se ajustaron para W4A4. En la ruta A8 se emplean activaciones redondeadas a FP8 con GEMMs en BF16; las convoluciones y el separador usan pesos reconstruidos desde la exportación W4. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de vídeo de avatar condicionada por audio: produce clips sincronizados con una pista de voz de entrada.
- Generación de vídeo en pocos pasos: ocho pasos de denoising documentados en la prueba del autor.
- Resolución y cadencia: 832 × 480 a 25 fps en la prueba de referencia, con clips de 93 fotogramas.
- Codificación de texto multilingüe potencial a través de UMT5 (no confirmado para este modelo concreto).
- Codificación de audio mediante Whisper y separación vocal previa al procesamiento.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido; no es un modelo de lenguaje conversacional.

## Casos de uso

- Generación de avatares parlantes para vídeo corporativo: a partir de un guion de voz y una imagen o referencia de identidad, el modelo sintetiza un clip de 93 fotogramas a 832 × 480 y 25 fps, adecuado para comunicados internos o formación.
- Doblaje y localización de contenido: el separador vocal aísla la voz, Whisper la codifica y el DiT regenera el movimiento labial sincronizado, lo que permite adaptar vídeos existentes a otros idiomas.
- Prototipado de asistentes virtuales: integración en demos de atención al cliente donde un avatar responde con voz sintetizada, usando la ventana de 93 fotogramas para respuestas cortas.
- Producción de contenido para redes sociales: clips breves de 3,7 segundos (93 fotogramas a 25 fps) generados en ocho pasos, con un coste de cómputo medido de 210,56 segundos por clip en el hardware de referencia.
- Investigación en cuantización de modelos de difusión: el repositorio sirve como referencia reproducible de un esquema mixto W4A8/W4A4 con calibración documentada y runtime de verificación por capas.
- Despliegue en entornos con VRAM limitada: el empaquetado de 12,574 GB permite ejecutar el pipeline en GPUs donde los pesos BF16 originales no cabrían, a costa de un pico de 37,40 GiB durante la generación según el informe del autor.
- Evaluación comparativa de calidad de cuantización: útil para medir la degradación visual y de sincronización labial introducida por MXFP4 frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la prueba interna del autor:

| Metrica | Valor |
|---|---|
| Resolucion | 832 × 480 |
| Fotogramas | 93 |
| Cadencia | 25 fps |
| Pasos de denoising | 8 |
| Tiempo de ejecucion | 210,56 s |
| Pico de asignacion CUDA | 37,40 GiB |
| Precision de activaciones (ruta A8) | FP8 redondeado, GEMM en BF16 |

No se especifica la GPU utilizada en dicha prueba.

## Requisitos de hardware

- Peso en disco del overlay cuantizado: 12,574 GB repartidos en siete ficheros safetensors (avatar DiT 8,447 GB, UMT5 3,021 GB, LoRAs DMD y OPSD 0,343 GB cada uno, Whisper 0,341 GB, VAE 0,069 GB, separador 0,009 GB).
- VRAM estimada para inferencia: el autor reporta un pico de 37,40 GiB de asignación CUDA en la prueba de referencia, muy por encima de los 12,574 GB de pesos, debido a activaciones, buffers del VAE y el pipeline completo.
- GPU recomendadas: no disponibles de forma explícita; por el pico de memoria reportado, se requiere al menos una GPU con 40 GB o más (A100 40/80 GB, H100, L40S). No cabe en GPUs de consumo de 24 GB en la configuración documentada.
- Opciones de despliegue: el repositorio incluye un runtime propio (`runtime.macaq_components`) para verificar y ejecutar capas empaquetadas individualmente; la generación completa requiere el pipeline upstream de LongCat. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 210,56 segundos por clip de 93 fotogramas en el hardware de referencia, lo que equivale a aproximadamente 0,44 fotogramas por segundo. No se documenta el hardware exacto.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos de generación de vídeo condicionada por audio (por ejemplo, variantes de SadTalker, EchoMimic o LivePortrait) que permitan una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base meituan-longcat/LongCat-Video-Avatar-1.6 antes de cualquier despliegue en producción.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.
- Solo contiene pesos: no incluye el pipeline completo; es necesario obtener configuraciones, tokenizer y grafos del repositorio upstream, con el riesgo de incompatibilidades de versión.
- Degradación por cuantización: la conversión a MXFP4 con esquemas mixtos W4A8/W4A4 puede introducir artefactos visuales y pérdida de precisión en la sincronización labial; el autor no publica una comparación cuantitativa frente al modelo BF16.
- Calibración limitada: solo 24 clips de calibración, lo que puede reducir la robustez fuera de la distribución de esos datos.
- Requisitos de memoria elevados pese a la cuantización: 37,40 GiB de pico en la prueba reportada impiden su uso en GPUs de consumo.
- Riesgo de alucinación visual: como modelo generativo de vídeo, puede producir movimientos faciales o corporales incoherentes con el audio, especialmente en clips largos o voces atípicas.
- Idiomas no documentados: se desconoce qué lenguas maneja correctamente el pipeline de texto y audio.
- Sin información sobre sesgos: no hay documentación sobre sesgos demográficos en la generación de avatares.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ApacheOne/LongCat-Video-Avatar-1.6_MACaQ
- Modelo base: https://huggingface.co/meituan-longcat/LongCat-Video-Avatar-1.6
- Clip de prueba G4 (GIF): examples/g4_test_20261117_035842_987.gif (dentro del repositorio)
- Clip de prueba G4 con audio (MP4): examples/g4_test.mp4 (dentro del repositorio)
- Informe de render: examples/g4_test.json (dentro del repositorio)
- Manifiesto de release con checksums: release.json (dentro del repositorio)
