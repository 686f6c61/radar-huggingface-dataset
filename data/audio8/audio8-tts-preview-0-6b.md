# Audio8/Audio8-TTS-Preview-0.6b

## Resumen

Audio8-TTS-Preview-0.6b es un modelo de síntesis de voz (text-to-speech) multilingüe de 0.6 mil millones de parámetros desarrollado por Audio8, diseñado para generar habla natural y realizar clonación de voz en modo zero-shot. El modelo emplea una arquitectura DualAR (dos transformers autorregresivos) inspirada en Fish Audio S2 Pro: un transformer lento predice un token semántico por cada frame de audio, mientras que un transformer rápido predice los codebooks del codec neuronal condicionado al estado oculto del primero y a los codebooks anteriores. Esta separación permite una síntesis eficiente y de alta calidad con un tamaño compacto.

El modelo se distribuye bajo licencia Apache 2.0 (según los tags de HuggingFace) e incluye soporte para al menos once idiomas: cantonés, chino, neerlandés, inglés, francés, alemán, italiano, japonés, coreano, polaco y español. Además del checkpoint original en safetensors, se publica una versión ONNX cuantizada a INT4 orientada a despliegue en CPU, lo que facilita su integración en entornos sin GPU dedicada. Con más de 15.000 descargas y 348 likes en HuggingFace, el modelo ha despertado interés en la comunidad por su equilibrio entre tamaño reducido y capacidades avanzadas de clonación vocal.

La relevancia actual de este modelo radica en su propuesta de TTS multilingüe de código abierto con clonación zero-shot a escala compacta, un nicho donde predominan soluciones propietarias o modelos de mayor tamaño. Su arquitectura DualAR y la disponibilidad de una variante ONNX INT4 lo convierten en una opción atractiva para desarrolladores que necesitan síntesis de voz personalizable en producción con requisitos de hardware moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (dos transformers autorregresivos: lento y rápido) |
| Parametros totales | 0.6 mil millones (aproximadamente) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (ONNX), FP16 (codec y encoder) |
| Idiomas soportados | cantonés (yue), chino (zh), neerlandés (nl), inglés (en), francés (fr), alemán (de), italiano (it), japonés (ja), coreano (ko), polaco (pl), español (es) |
| Licencia | Apache 2.0 (según tags de HuggingFace; el campo de licencia en la página indica "no disponible") |
| Formato de pesos | safetensors, ONNX (INT4) |

## Arquitectura y entrenamiento

La arquitectura DualAR del modelo se compone de dos transformers autorregresivos que operan en niveles distintos de granularidad temporal. El transformer lento procesa la secuencia de tokens semánticos, generando un token por cada frame de audio, lo que captura la estructura fonética y prosódica global. El transformer rápido, condicionado al estado oculto del lento y a los codebooks ya generados, predice los codebooks del codec neuronal para cada frame, reconstruyendo así la forma de onda a alta resolución. Esta separación reduce la complejidad computacional en comparación con modelos que predicen todos los codebooks de forma conjunta, y permite una síntesis más estable en contextos multilingües.

El repositorio oficial incluye un pipeline de ajuste fino supervisado (SFT) independiente, lo que sugiere que el entrenamiento se realizó en dos fases: una preentrenamiento en datos multilingües y un ajuste fino con datos etiquetados para mejorar la naturalidad y la fidelidad de la clonación. No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. La versión ONNX INT4 utiliza cuantización weight-only para los modelos DualAR, manteniendo el codec neuronal en FP16, lo que permite inferencia en CPU con una degradación mínima de calidad.

## Capacidades

- Generación de voz multilingüe: síntesis de habla natural en al menos once idiomas, incluyendo lenguas con sistemas de escritura complejos como chino, japonés y coreano.
- Clonación de voz zero-shot: capacidad de replicar una voz de referencia sin necesidad de entrenamiento adicional, a partir de una muestra de audio corta.
- Clonación cross-lingual: permite transferir las características de una voz de referencia a un idioma distinto del original, como se demuestra en la página de listening preview.
- Síntesis de voz con codec neuronal: utiliza un codec de audio neuronal para reconstruir la forma de onda, lo que proporciona una calidad de audio alta y una compresión eficiente.
- Despliegue en CPU: la variante ONNX INT4 permite ejecutar el modelo en entornos sin GPU, ampliando su aplicabilidad a servidores de bajo coste o dispositivos edge.
- Personalización mediante SFT: el pipeline de ajuste fino independiente permite adaptar el modelo a dominios específicos o voces concretas con datos propios.

## Casos de uso

- Atención al cliente automatizada: el modelo puede generar respuestas de voz naturales en múltiples idiomas para sistemas IVR o asistentes virtuales, con la posibilidad de clonar la voz de un agente humano para mantener una identidad de marca consistente.
- Audiolibros y narración de contenido: gracias a su soporte multilingüe y a la clonación zero-shot, puede narrar libros o artículos con la voz de un locutor específico, reduciendo los costes de grabación en estudio.
- Traducción audiovisual (doblaje): la clonación cross-lingual permite doblar vídeos o películas manteniendo la voz original del actor en un idioma distinto, acelerando el proceso de localización.
- Asistentes de voz para accesibilidad: personas con discapacidad visual o dificultades de lectura pueden beneficiarse de una síntesis de voz personalizada y natural en su idioma materno, con la opción de usar una voz familiar.
- Generación de contenido para marketing y publicidad: creación de anuncios de audio o vídeos promocionales con voces personalizadas sin necesidad de contratar actores de voz, especialmente útil para campañas multilingües.
- Herramientas de aprendizaje de idiomas: el modelo puede generar ejemplos de pronunciación en distintos idiomas con la voz del estudiante (clonada) o con voces nativas, facilitando la práctica de entonación y acento.
- Integración en pipelines de producción de vídeo: la versión ONNX INT4 permite ejecutar el TTS en servidores CPU dentro de flujos de renderizado, añadiendo locuciones automáticas a vídeos generados programáticamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La página de listening preview del proyecto muestra ejemplos de audio, pero no incluye métricas cuantitativas como MOS (Mean Opinion Score), WER (Word Error Rate) o comparativas con otros modelos TTS.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM mínima o recomendada para la versión safetensors.
- Dado el tamaño de 0.6 mil millones de parámetros, es razonable esperar que la versión FP16 quepa en GPUs de consumo con al menos 4-6 GB de VRAM, pero esta estimación no está confirmada por el autor.
- La versión ONNX INT4 está diseñada específicamente para inferencia en CPU, lo que permite ejecutar el modelo en hardware sin GPU dedicada.
- No se han publicado datos de latencia ni throughput para ninguna de las variantes.
- Opciones de despliegue: el repositorio de GitHub proporciona herramientas de inferencia y código remoto para HuggingFace Transformers. La variante ONNX puede integrarse en entornos que soporten el runtime de ONNX. No se menciona soporte explícito para vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de comparativas publicadas en la informacion disponible. El modelo se inspira en Fish Audio S2 Pro, pero no hay datos objetivos que permitan una comparación cuantitativa con este u otros TTS como XTTS v2 o Bark. Se recomienda consultar la página de listening preview para una evaluación subjetiva de la calidad de audio.

## Limitaciones y advertencias

- No se han publicado estudios de sesgos o comportamientos discriminatorios; como todo modelo de síntesis de voz, puede reflejar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación fonética: en idiomas con ortografía irregular o nombres propios poco comunes, el modelo puede producir pronunciaciones incorrectas.
- La clonación de voz zero-shot puede fallar con voces muy atípicas o con muestras de referencia de baja calidad o corta duración.
- La licencia Apache 2.0 permite uso comercial, pero el campo de licencia en la página de HuggingFace aparece como "no disponible", por lo que se recomienda verificar los términos en el repositorio oficial antes de un despliegue en producción.
- No se especifica la longitud máxima de texto soportada por inferencia; textos muy largos pueden requerir segmentación.
- La variante ONNX INT4 puede presentar una degradación de calidad perceptible en comparación con los pesos en FP16, especialmente en tonos o acentos complejos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Audio8/Audio8-TTS-Preview-0.6b)
- [Repositorio GitHub](https://github.com/Audio8-AI/Audio8_TTS)
- [Variante ONNX INT4 en HuggingFace](https://huggingface.co/Audio8/Audio8-TTS-Preview-0.6B-ONNX-INT4)
- [Ficha en awesome-ai-voice](https://github.com/wildminder/awesome-ai-voice/blob/main/models/audio8-tts-preview-0-6b.md)
- [Página de listening preview](https://audio8-ai.github.io/Audio8_TTS/)
