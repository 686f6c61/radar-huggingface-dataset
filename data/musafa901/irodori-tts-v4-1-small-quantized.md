# musafa901/Irodori-TTS-v4.1-Small-Quantized

## Resumen

Irodori-TTS-v4.1-Small-Quantized es una versión cuantizada del modelo de síntesis de voz en japonés Irodori-TTS-v4.1-Small, desarrollado por Aratako y publicada por el usuario musafa901 en Hugging Face. El modelo original emplea una arquitectura basada en flow matching y está diseñado para generar habla natural a partir de texto, con capacidades avanzadas como clonación de voz mediante audio de referencia, diseño de voz por descripción textual, control de estilo y soporte para audio de referencia de hasta 120 segundos. Esta variante cuantizada aplica técnicas de cuantización post-entrenamiento con torchao, reduciendo el tamaño de los pesos y la memoria necesaria durante la inferencia, lo que facilita su despliegue en entornos con recursos limitados.

El repositorio ofrece cinco variantes de cuantización (int8-weight-only, int8-dynamic, int4-weight-only, float8-weight-only y float8-dynamic), con tamaños de checkpoint que oscilan entre 813 y 906 MiB, frente a los 4.5 GB del repositorio original. El modelo se distribuye bajo licencia MIT, aunque incluye restricciones éticas adicionales sobre su uso. Está orientado exclusivamente al idioma japonés y requiere una GPU NVIDIA compatible con CUDA para su ejecución, ya que la validación se ha realizado únicamente en ese entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching TTS con transformer de difusión, encoder de texto, encoder de hablante y predictor de duración |
| Parametros totales | No disponible (el modelo base se estima en ~766M según el demo, sin confirmación oficial) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (soporta audio de referencia de hasta 120 segundos) |
| Tipos de cuantizacion | int8-weight-only, int8-dynamic, int4-weight-only, float8-weight-only, float8-dynamic |
| Idiomas soportados | Japonés (ja) |
| Licencia | MIT (con restricciones éticas adicionales) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo base Irodori-TTS-v4.1-Small emplea una arquitectura de flow matching para síntesis de voz, con tres ramas de condicionamiento: texto de entrada, audio de referencia opcional y una descripción textual del estilo deseado. El sistema integra un encoder de texto compartido, un encoder de hablante y un transformer de difusión que genera la representación acústica. La versión cuantizada mantiene esta arquitectura, pero aplica cuantización post-entrenamiento a las capas lineales de atención y MLP de los encoders y del transformer de difusión, mientras que los proyectores, AdaLN y la predicción de duración permanecen en BF16.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens o el proceso de alineación (RLHF, DPO, etc.) en la información disponible. La cuantización se realiza con torchao, y se recomienda usar `--model-precision bf16` durante la inferencia para mantener la estabilidad numérica. Las variantes int8 y float8 requieren kernels específicos de CUDA, mientras que int4-weight-only utiliza el kernel tinygemm de CUDA y exige una GPU con compute capability 8.0 o superior.

## Capacidades

- Generación de voz en japonés a partir de texto, con entonación y prosodia naturales.
- Clonación de voz mediante uno o varios clips de audio de referencia, que pueden concatenarse hasta un límite de 120 segundos.
- Diseño de voz basado en texto (VoiceDesign): permite especificar características vocales mediante descripciones en lenguaje natural.
- Control de estilo mediante captions textuales, combinable con el audio de referencia.
- Control basado en emojis para modular la expresión emocional de la voz generada.
- Soporte para audio de referencia largo, lo que permite capturar matices de habla más complejos.
- Las variantes cuantizadas conservan todas las capacidades del modelo original, con una huella de memoria reducida.

## Casos de uso

- Doblaje de vídeos y animaciones: el modelo puede generar voces en japonés para personajes, utilizando audio de referencia para imitar un tono concreto. Su capacidad de control por emojis y captions permite ajustar la emoción en cada línea.
- Audiolibros y narración: la generación de voz a partir de texto con control de estilo facilita la producción de audiolibros con diferentes narradores, sin necesidad de grabar a actores de voz.
- Asistentes de voz y chatbots: integrado en un pipeline de TTS, puede producir respuestas habladas en japonés con una voz consistente, usando un clip de referencia para mantener la identidad del asistente.
- Creación de contenido para redes sociales: los creadores pueden generar voces para vídeos cortos, podcasts o anuncios, ajustando el estilo mediante captions y emojis sin requerir estudio de grabación.
- Accesibilidad: permite convertir texto en voz para personas con discapacidad visual o dificultades de lectura, ofreciendo una voz natural y personalizable.
- Prototipado de productos de voz: los desarrolladores pueden probar rápidamente diferentes voces y estilos en aplicaciones de voz, gracias a la baja huella de memoria de las versiones cuantizadas, lo que facilita la experimentación en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas objetivas como MOS (Mean Opinion Score), MMLU, HumanEval u otras comparativas con modelos similares.

## Requisitos de hardware

- El tamaño de los checkpoints varía entre 813 MiB (int4-weight-only) y 906 MiB (float8-dynamic), lo que sugiere que la VRAM necesaria para inferencia es de al menos 2 GB, aunque no se han publicado requisitos oficiales.
- Se requiere una GPU NVIDIA con soporte CUDA. Las variantes int8 y float8 exigen compute capability 8.0+ (Ampere o superior) para int4, y 8.9+ (Ada, Hopper o Blackwell) para float8.
- No se ha validado la ejecución en CPU, ROCm o Intel XPU; depende de los kernels disponibles en PyTorch y torchao.
- El despliegue se realiza mediante el script `infer.py` del repositorio Irodori-TTS, o mediante la interfaz Gradio incluida. No se menciona compatibilidad con vLLM, llama.cpp u otros servidores de inferencia.
- No se han proporcionado datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Irodori-TTS-v4.1-Small (base) | ~766M (estimado) | Audio de referencia hasta 120 s | MIT | Safetensors | Modelo original sin cuantizar, requiere más memoria |
| Irodori-TTS-v4.1-Small-Quantized | No disponible | Igual que el base | MIT | Safetensors | Variantes cuantizadas con menor huella de memoria |
| Otros TTS japoneses (p. ej. VoiceVox) | No disponible | No disponible | Varias | No disponible | No se dispone de datos comparativos fiables |

No se dispone de información suficiente para comparar con otros modelos TTS japoneses de forma rigurosa.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el idioma japonés; no se garantiza un rendimiento adecuado en otros idiomas.
- Incluye restricciones éticas explícitas: no se permite la suplantación de voces de personas reales sin consentimiento, ni la generación de deepfakes o desinformación.
- Existe la posibilidad de que la voz generada a partir de texto sin referencia coincida accidentalmente con la de una persona real, debido a artefactos probabilísticos del espacio latente.
- La cuantización puede introducir una ligera degradación en la calidad de audio en comparación con el modelo en BF16, aunque no se han publicado evaluaciones subjetivas.
- La ejecución solo está validada en NVIDIA CUDA; el uso en CPU, ROCm o Intel XPU no está garantizado.
- El repositorio no incluye documentación sobre el proceso de entrenamiento, lo que limita la reproducibilidad y el análisis de sesgos.

## Enlaces

- Modelo cuantizado: https://huggingface.co/musafa901/Irodori-TTS-v4.1-Small-Quantized
- Modelo base: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small
- Repositorio GitHub: https://github.com/Aratako/Irodori-TTS
- Demo en Hugging Face Space: https://huggingface.co/spaces/Aratako/Irodori-TTS-v4.1-Small-Demo
