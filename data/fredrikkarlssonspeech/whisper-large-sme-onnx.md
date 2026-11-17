# FredrikKarlssonSpeech/whisper-large-sme-onnx

## Resumen

whisper-large-sme-onnx es la conversión a formato ONNX del modelo NbAiLab/whisper-large-sme, un sistema de reconocimiento automático del habla (ASR) especializado en sami septentrional, una lengua urálica minoritaria hablada en el norte de Noruega, Suecia y Finlandia. El modelo lo publica el usuario FredrikKarlssonSpeech y deriva del trabajo original del laboratorio NbAiLab, que fine-tuneó Whisper Large sobre datos en sami septentrional. La relevancia de esta versión reside en que empaqueta el modelo en múltiples precisiones (fp32, fp16, int8, uint8, q4, q4f16, bnb4) listas para desplegarse con ONNX Runtime, Optimum y transformers.js, lo que facilita su uso tanto en servidores como en navegador o en entornos con recursos limitados.

Arquitectura transformer encoder-decoder de tipo Whisper (Seq2Seq para speech), con aproximadamente 1.550 millones de parámetros en la variante large. El repositorio ocupa 28,7 GB, coherente con almacenar todas las variantes de precisión del modelo completo. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Un detalle técnico crítico es que el tokenizador de Whisper no dispone de token de idioma para sami septentrional, por lo que el modelo se fine-tuneó usando finlandés (`<|fi|>`, id 50277) como token sustituto. Esto implica que la detección automática de idioma no es fiable y debe forzarse explícitamente el idioma "fi" en la generación, aunque la salida sea texto en sami septentrional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large) |
| Parametros totales | aproximadamente 1.550 millones (variante large) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por defecto en Whisper) |
| Tipos de cuantizacion | fp32, fp16, int8, uint8, quantized (avx512_vnni), q4, q4f16, bnb4 |
| Idiomas soportados | sami septentrional (se) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (encoder_model.onnx, decoder_model.onnx, decoder_with_past_model.onnx, decoder_model_merged.onnx y variantes por precision) |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper Large, un transformer encoder-decoder diseñado para reconocimiento automático del habla y traducción de voz. El encoder procesa espectrogramas mel de audio de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, con soporte de caché de atención (past key values) para acelerar la decodificación. La conversión a ONNX se realizó con Hugging Face Optimum, con cuantización mediante las herramientas de ONNX Runtime, conversión a fp16 con onnxconverter-common y cuantización de 4 bits con MatMulNBitsQuantizer (q4) y MatMulBnb4Quantizer (bnb4).

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original NbAiLab/whisper-large-sme. La model card remite a la ficha del modelo original para esos datos. La innovación principal de esta versión es la disponibilidad de múltiples variantes de precisión que permiten equilibrar tamaño, latencia y calidad según el entorno de despliegue, incluyendo opciones de 4 bits para ejecución en navegador vía transformers.js.

## Capacidades

- Reconocimiento automático del habla en sami septentrional a partir de audio de 16 kHz mono.
- Transcripción de audio de hasta 30 segundos por ventana (comportamiento estándar de Whisper).
- Ejecución en navegador mediante transformers.js con WebGPU/WASM, y en Node.js cargando el audio manualmente.
- Despliegue en servidor con ONNX Runtime y Optimum (ORTModelForSpeechSeq2Seq).
- Múltiples precisiones para ajustar el compromiso entre calidad y recursos: fp32 para máxima fidelidad, fp16 para GPU, int8/uint8/quantized para CPU, q4/bnb4 para entornos muy restringidos.
- No soporta detección automática de idioma fiable; requiere forzar `language="fi"` en la generación.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de archivos de audio en sami septentrional para archivos lingüísticos y patrimoniales: el modelo permite digitalizar grabaciones orales y generar transcripciones automáticas, reduciendo el trabajo manual en una lengua con pocos recursos.
- Subtitulado de contenido audiovisual en sami septentrional: integrable en pipelines de procesado de vídeo que generen subtítulos en formato SRT/VTT a partir del audio.
- Aplicaciones web de accesibilidad en navegador: gracias a la variante q4/bnb4 y transformers.js, se puede desplegar la transcripción directamente en el cliente sin enviar audio a un servidor, útil para privacidad y para usuarios con conectividad limitada.
- Investigación lingüística y documentación de lenguas minoritarias: permite generar corpus transcritos a gran escala para estudios fonéticos, morfológicos y de variación dialectal.
- Asistentes de voz para servicios públicos en regiones sami: transcripción de consultas en centros de atención al ciudadano, con despliegue en CPU mediante int8/quantized para reducir costes de infraestructura.
- Herramientas educativas para aprendizaje del sami septentrional: transcripción de ejercicios orales y comparación con texto de referencia para feedback automático.
- Integración en pipelines de ONNX Runtime en producción: la disponibilidad de encoder/decoder separados y decoder_merged facilita el despliegue con optimizaciones de grafo y ejecución en CPU/GPU sin dependencia de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la ficha del modelo original (NbAiLab/whisper-large-sme) para métricas de rendimiento, pero no se incluyen valores concretos (WER, CER) en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para fp32: aproximadamente 6,2 GB solo para pesos (1.550 M parámetros × 4 bytes), más overhead de activaciones y caché de atención.
- VRAM estimada para fp16: aproximadamente 3,1 GB para pesos.
- VRAM estimada para int8/uint8/quantized: aproximadamente 1,6 GB para pesos.
- VRAM estimada para q4/q4f16/bnb4: aproximadamente 0,8-1 GB para pesos.
- GPU recomendadas: A100, H100 o RTX 4090 para fp16/fp32 con baja latencia; RTX 3090/4080 también suficientes para fp16.
- Cabe en GPUs de consumo: sí, en RTX 3060 12 GB o superiores para fp16; en GPUs con 4-6 GB usando int8 o q4.
- Despliegue: ONNX Runtime (con Optimum), transformers.js (navegador y Node.js), y potencialmente integración con servidores de inferencia compatibles con ONNX.
- Latencia y throughput: no disponibles en la información proporcionada; dependen de la variante de precisión, el hardware y la duración del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-large-sme-onnx | ~1.550 M | 30 s por ventana | sami septentrional | apache-2.0 | ONNX (multi-precision) |
| NbAiLab/whisper-large-sme | ~1.550 M | 30 s por ventana | sami septentrional | apache-2.0 | safetensors/PyTorch |
| openai/whisper-large-v3 | ~1.550 M | 30 s por ventana | multilingue (99 idiomas) | apache-2.0 | safetensors/PyTorch |
| NbAiLab/nb-whisper-large | ~1.550 M | 30 s por ventana | noruego y otras lenguas escandinavas | apache-2.0 | safetensors/PyTorch |

La comparativa se limita a modelos de la misma familia Whisper Large. No se dispone de datos de rendimiento comparado (WER) en la información proporcionada para establecer diferencias cuantitativas entre ellos.

## Limitaciones y advertencias

- El tokenizador de Whisper no tiene token de idioma para sami septentrional; el modelo usa finlandés (`<|fi|>`) como sustituto. Es obligatorio forzar `language="fi"` y no confiar en la detección automática de idioma.
- La model card advierte que la salida es sami septentrional, no finlandés, a pesar del token sustituto.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido, silencios largos o dominio no visto.
- Limitación de ventana de audio de 30 segundos por segmento; audios más largos requieren segmentación previa.
- El modelo está especializado en una única lengua minoritaria; no es adecuado para transcripción multilingüe general.
- No se documentan sesgos específicos en la información disponible, pero al derivar de Whisper Large puede heredar sesgos del corpus original de OpenAI.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base y de los datos de entrenamiento originales.
- El repositorio ocupa 28,7 GB por incluir todas las variantes de precisión; conviene descargar solo la subcarpeta de la variante necesaria.
- No se dispone de información sobre latencia, throughput ni métricas de calidad (WER/CER) en la documentación proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FredrikKarlssonSpeech/whisper-large-sme-onnx
- Modelo base original: https://huggingface.co/NbAiLab/whisper-large-sme
- Documentación de Optimum: https://huggingface.co/docs/optimum
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
- Documentación de ONNX Runtime: https://onnxruntime.ai/docs/
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
