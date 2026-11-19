# pdimas/sopro-v2-turbo-litert

## Resumen

Sopro v2 turbo LiteRT es una conversión del modelo de síntesis de voz Sopro v2 turbo (desarrollado por Samuel Vitorino) al formato LiteRT (`.tflite`) para su ejecución en dispositivos Android, en concreto tabletas. El modelo mantiene intacta la funcionalidad del original: text-to-speech con clonación de voz a partir de una muestra de referencia. La conversión la firma el usuario pdimas y está pensada para integrarse en la aplicación Halo Phone for Android, que descarga los ficheros y verifica sus sumas SHA-256.

El repositorio no contiene un modelo monolítico, sino cuatro grafos especializados que cubren el pipeline completo: extracción de la condición de hablante y tokens desde una muestra de voz (`sopro_reference_fp32.tflite`), generación de tokens de habla a partir de texto con caché KV (`sopro_semantic_row_int8.tflite`), decodificación acústica por chunks de 64 frames en modo streaming (`sopro_acoustic_chunk_fp16.tflite`) y vocoder mel-a-audio (`sopro_vocoder_fp32.tflite`). El tamaño total del repositorio es de aproximadamente 0,3 GB.

La relevancia de esta ficha radica en que ejemplifica el patrón de despliegue on-device de TTS con clonación de voz en Android mediante LiteRT, con precisión mixta (fp32, fp16 e int8) y formas fijas para evitar recompilaciones en tiempo de ejecución. No se dispone de información sobre arquitectura interna, número de parámetros ni idiomas soportados más allá de lo que declara la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: samuel-vitorino/sopro-v2-turbo; pipeline text-to-speech con clonación de voz) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la referencia de voz debe ser de 7,0–11,5 s según la model card; en streaming se limita a ~4,5 s) |
| Tipos de cuantizacion | fp32 (reference y vocoder), int8 en pesos (semantic row), fp16 (acoustic chunk) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT / TFLite (`.tflite`); tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Sopro v2 turbo en la documentación proporcionada. La model card de esta conversión describe únicamente el proceso de exportación: los grafos se convirtieron con `litert-torch` (herramientas `tools/sopro-litert` de Halo for ICU), todas las formas son fijas y las entradas se rellenan (padding) hasta el siguiente tamaño disponible y se enmascaran. Antes de la cuantización, los grafos con padding coinciden con el modelo PyTorch original: sin diferencia para los tokens de habla y el decodificador acústico, y con una diferencia de 2e-5 para el vocoder.

El pipeline se descompone en cuatro etapas: (1) extracción de la condición de hablante y tokens desde una muestra de voz de referencia; (2) generación de tokens de habla a partir de texto con prefill y step sobre caché KV; (3) decodificación acústica en streaming por chunks de 64 frames; (4) vocoder que convierte mel en audio para entre 128 y 1536 frames. El tokenizer es el original del modelo `samuel-vitorino/sopro-v2-turbo-onnx`. No se detallan datos de entrenamiento, composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto.
- Clonación de voz zero-shot mediante una muestra de referencia de 7,0–11,5 s (en modo streaming, limitada a ~4,5 s; Halo Phone usa 3 s).
- Generación de audio en streaming por chunks de 64 frames.
- Ejecución on-device en Android mediante LiteRT.
- Precisión mixta por etapa para equilibrar tamaño y calidad.
- Verificación de integridad mediante sumas SHA-256 publicadas por fichero.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la muestra de referencia.

## Casos de uso

- Lectura de textos en aplicaciones Android: el grafo semántico int8 con caché KV permite generar tokens de habla de forma incremental, adecuado para leer artículos o notificaciones sin conexión.
- Clonación de voz personal en el dispositivo: a partir de una grabación de 3 s, el grafo de referencia fp32 extrae la condición de hablante y permite sintetizar nuevas frases con esa voz.
- Asistentes de voz embebidos: el modo streaming con chunks de 64 frames y el vocoder fp32 permiten reproducir audio a medida que se genera, reduciendo la latencia percibida.
- Accesibilidad para personas con discapacidad visual o del habla: TTS local con voz clonada del propio usuario, sin enviar datos a la nube.
- Aplicaciones de salud o cuidados intensivos: la model card menciona el motor "Halo for ICU", orientado a entornos donde la privacidad y la ausencia de red son críticas.
- Integración en apps de terceros: los cuatro `.tflite` con formas fijas y checksums publicados facilitan su empaquetado y verificación en pipelines de distribución Android.
- Prototipado de interfaces conversacionales: el pipeline completo (referencia, semántico, acústico, vocoder) puede orquestarse en local para demos sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de fidelidad de la conversión: coincidencia exacta con PyTorch en tokens de habla y decodificador acústico, y diferencia de 2e-5 en el vocoder.

## Requisitos de hardware

- Almacenamiento: ~0,3 GB para los cuatro ficheros `.tflite` y el tokenizer.
- Memoria: no disponible de forma explícita; el grafo de referencia fp32 ocupa ~117 MB y el acústico fp16 ~100 MB, por lo que se requiere un dispositivo Android con al menos varios cientos de MB libres para cargar los grafos.
- GPU/dispositivo recomendado: tabletas Android (la model card indica explícitamente "Android tablets"); no se especifican modelos concretos.
- Cabe en GPU de consumo: no aplica directamente, al estar orientado a LiteRT en Android; no se documenta soporte para CUDA ni para GPUs de escritorio.
- Opciones de despliegue: LiteRT / TFLite en Android; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de TTS ni datos de rendimiento que permitan establecer una comparativa rigurosa.

## Limitaciones y advertencias

- La conversión solo incluye las partes de streaming; los decodificadores acústicos de frase completa (uno por longitud de frase) no están incluidos.
- La muestra de voz de referencia debe tener entre 7,0 y 11,5 s en el grafo de referencia; en streaming, el límite práctico es de ~4,5 s.
- Las formas son fijas y las entradas se rellenan y enmascaran, lo que puede introducir ineficiencias en frases muy cortas.
- No se documentan idiomas soportados; no se puede asumir multilingüismo.
- No se documentan sesgos, riesgo de alucinación ni limitaciones de contenido.
- La licencia Apache-2.0 permite uso comercial, pero el crédito del modelo corresponde a Samuel Vitorino; conviene revisar la licencia del modelo base por si hubiera condiciones adicionales no reflejadas aquí.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción más allá de la aplicación Halo Phone.
- La fecha de creación indicada (2026-11-19) es futura respecto a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pdimas/sopro-v2-turbo-litert
- Modelo base: https://huggingface.co/samuel-vitorino/sopro-v2-turbo
- Versión ONNX (tokenizer original): https://huggingface.co/samuel-vitorino/sopro-v2-turbo-onnx
