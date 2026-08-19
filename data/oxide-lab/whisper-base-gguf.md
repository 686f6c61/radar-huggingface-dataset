# oxide-lab/whisper-base-GGUF

## Resumen

`oxide-lab/whisper-base-GGUF` es una colección de versiones cuantizadas del modelo de reconocimiento de voz `openai/whisper-base` en formato GGUF, preparadas por el equipo de Oxide Lab. El modelo original, desarrollado por OpenAI, es un transformer encoder-decoder entrenado con 680 000 horas de audio supervisado débilmente, capaz de transcribir audio en múltiples idiomas. Esta variante cuantizada está pensada para entornos con recursos limitados y para su uso con los motores de inferencia Candle (Rust) y whisper.cpp (C++), lo que la hace adecuada para aplicaciones locales, de escritorio o embebidas.

El repositorio incluye diez niveles de cuantización (desde q2_k hasta q8_0) y dos formatos de pesos diferenciados: uno con prefijo `model.` para Candle y otro sin él para whisper.cpp. Con 72,6 millones de parámetros y un tamaño de repositorio de 0,7 GB, este modelo ofrece un equilibrio entre precisión y eficiencia, siendo especialmente útil para transcripción de voz en tiempo real en dispositivos sin GPU potente. Su licencia MIT permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 72 610 000 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (ventana fija) |
| Tipos de cuantizacion | q2_k, q3_k, q4_0, q4_k, q4_1, q5_0, q5_k, q5_1, q6_k, q8_0 |
| Idiomas soportados | Multilingüe (modelo original: 96 idiomas; la model card indica en y ru) |
| Licencia | MIT |
| Formato de pesos | GGUF (dos variantes: Candle y whisper.cpp) |

## Arquitectura y entrenamiento

El modelo base `openai/whisper-base` sigue la arquitectura original de Whisper: un transformer encoder-decoder con 12 capas en cada bloque, 512 dimensiones de modelo y 8 cabezas de atención. Se entrenó sobre 680 000 horas de audio etiquetado de forma débil, extraído de la web, con un enfoque de aprendizaje supervisado a gran escala. El proceso de cuantización a GGUF no altera la arquitectura, solo reduce la precisión numérica de los pesos. La model card no proporciona detalles adicionales sobre el entrenamiento más allá del paper original.

La cuantización se realizó mediante dos métodos: para la variante Candle se usó una conversión directa de PyTorch a GGUF con prefijo `model.` en los nombres de tensores, mientras que para whisper.cpp se empleó la herramienta `whisper-quantize` manteniendo los nombres originales. No se menciona el uso de RLHF, DPO ni otras técnicas de ajuste posterior.

## Capacidades

- Reconocimiento de voz automático (ASR) con transcripción de audio a texto.
- Soporte multilingüe: el modelo original cubre 96 idiomas; la model card destaca inglés y ruso.
- Funciona con dos motores de inferencia: Candle (Rust) y whisper.cpp (C++).
- Disponible en diez niveles de cuantización, lo que permite adaptar el tamaño y la calidad a distintos entornos.
- Compatible con aplicaciones de escritorio locales, como la aplicación Oxide Lab (Tauri + Candle).
- No incluye capacidades de traducción de voz, tool calling, agentes ni visión; es exclusivamente un modelo de transcripción de audio.

## Casos de uso

- Transcripción local de reuniones y entrevistas: el modelo puede procesar audio en tiempo real o diferido sin conexión a internet, lo que garantiza privacidad y baja latencia en entornos corporativos.
- Asistentes de voz para aplicaciones de escritorio: integrado en la aplicación Oxide Lab (Rust + Tauri), permite comandos de voz y dictado sin depender de servicios en la nube.
- Subtitulado automático de vídeos: la versión q8_0, recomendada para producción, puede generar subtítulos precisos en inglés y ruso con un coste computacional mínimo.
- Dispositivos embebidos y móviles: las cuantizaciones q3_k o q4_k reducen el tamaño a menos de 50 MB, viables para Raspberry Pi o smartphones con limitaciones de memoria.
- Preprocesamiento de audio en pipelines de datos: al ser un modelo pequeño y rápido, puede transcribir grandes volúmenes de audio en lotes dentro de flujos de procesamiento de datos.
- Evaluación y pruebas de sistemas ASR: al estar disponible en múltiples cuantizaciones, permite comparar el impacto de la pérdida de precisión en tareas específicas antes de elegir el nivel adecuado para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente ofrece una tabla cualitativa de calidad por nivel de cuantización, indicando que q5_0 es el "último bueno" y que cuantizaciones inferiores (q4, q3, q2) producen una pérdida aguda de calidad y salidas sin sentido. No se proporcionan métricas numéricas como WER, CER ni comparativas con otros modelos.

## Requisitos de hardware

- Al ser un modelo de 72,6 millones de parámetros, es extremadamente ligero. En FP32 ocupa aproximadamente 290 MB, en q8_0 unos 72 MB y en q4_k unos 36 MB (estimaciones basadas en el tamaño de los pesos).
- Puede ejecutarse en CPU sin problemas; para latencias muy bajas se recomienda una GPU consumer como una NVIDIA GTX 1650 o superior, aunque no es imprescindible.
- En GPU, la VRAM necesaria es inferior a 1 GB incluso en la cuantización más alta (q8_0).
- Opciones de despliegue: Candle (Rust), whisper.cpp (C++), y cualquier framework compatible con GGUF (por ejemplo, llama.cpp en su variante whisper).
- La latencia depende del hardware; en una CPU moderna de gama media, la transcripción de un audio de 30 segundos suele completarse en menos de un segundo con cuantizaciones bajas, y en 2-3 segundos con q8_0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia | Formato |
|---|---|---|---|---|---|
| oxide-lab/whisper-base-GGUF | 72,6 M | 30 s audio | q2_k a q8_0 | MIT | GGUF |
| openai/whisper-base | 74 M | 30 s audio | Original (FP32/FP16) | MIT | Safetensors, etc. |
| oxide-lab/whisper-tiny-GGUF | 39 M | 30 s audio | q2_k a q8_0 | MIT | GGUF |
| openai/whisper-small | 244 M | 30 s audio | Original (FP32/FP16) | MIT | Safetensors, etc. |

La comparativa muestra que esta versión cuantizada ofrece el mismo rendimiento teórico que el modelo original en términos de arquitectura, pero con un tamaño reducido y compatibilidad con motores específicos. Whisper-tiny es más pequeño pero menos preciso, mientras que Whisper-small es más grande y preciso pero requiere más recursos. No se dispone de datos de benchmarks para comparar numéricamente.

## Limitaciones y advertencias

- La cuantización degrada la calidad: según la model card, los niveles q4, q3 y q2 producen "una pérdida aguda de calidad y salidas sin sentido". Se recomienda usar q5_0 o superior para resultados aceptables.
- El modelo original soporta 96 idiomas, pero la model card solo menciona inglés y ruso; es posible que las pruebas se hayan limitado a estos idiomas y que el rendimiento en otros sea inferior.
- No incluye capacidades de traducción de voz (solo transcripción), a diferencia de modelos Whisper más grandes que sí la ofrecen.
- No se proporcionan métricas de error (WER/CER) ni benchmarks independientes, por lo que es difícil evaluar su precisión objetiva frente a otras variantes.
- Al ser un modelo de 30 segundos de ventana, no es adecuado para transcribir audio de larga duración sin segmentación previa.
- Aunque la licencia MIT permite uso comercial, el modelo original de OpenAI tiene restricciones en cuanto a la atribución; conviene revisar los términos de la licencia original.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/oxide-lab/whisper-base-GGUF)
- [Paper original de Whisper (arXiv:2212.04356)](https://arxiv.org/abs/2212.04356)
- [Repositorio de Oxide-Lab (aplicación de escritorio)](https://github.com/oxide-lab/oxide-lab)
- [Código de integración Whisper en Oxide-Lab](https://github.com/oxide-lab/Oxide-Lab/tree/main/src-tauri/whisper)
- [Página del modelo en MyGGUF](https://mygguf.com/model?id=oxide-lab%2Fwhisper-base-GGUF)
