# Ansu/whisper-large-v3-basque

## Resumen

El modelo Ansu/whisper-large-v3-basque es un ajuste fino (fine-tuning) del sistema de reconocimiento automático de voz (ASR) Whisper large-v3, desarrollado por OpenAI, adaptado específicamente para la lengua vasca (euskera). El autor, Ansu (Andoni Sudupe), ha publicado este modelo en Hugging Face con el objetivo de ofrecer una solución de transcripción de voz en euskera, un idioma minoritario con escasos recursos en el ámbito del ASR. El modelo conserva la arquitectura original de Whisper, un transformer encoder-decoder, y cuenta con 1.609.879.040 parámetros, lo que lo sitúa en la categoría de modelos grandes. Aunque la ficha de Hugging Face no especifica la licencia ni los idiomas soportados, se deduce que está entrenado para transcribir audio en euskera, y su relevancia radica en cubrir una necesidad lingüística poco atendida por los modelos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | 1.609.879.040 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Whisper large-v3 soporta hasta 30 segundos de audio por segmento) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors, sin información sobre cuantizaciones) |
| Idiomas soportados | Euskera (deducido por el nombre y el propósito del fine-tuning) |
| Licencia | no disponible (el modelo base Whisper large-v3 es MIT, pero no se confirma para este fine-tuning) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Whisper large-v3 es un modelo de reconocimiento de voz basado en la arquitectura transformer, con un encoder que procesa espectrogramas de audio y un decoder que genera texto. El modelo original fue entrenado con 680 000 horas de datos etiquetados en múltiples idiomas, lo que le confiere una capacidad de generalización notable. En este caso, Ansu ha realizado un ajuste fino sobre el modelo preentrenado para adaptarlo al euskera, aunque no se han publicado detalles específicos sobre el conjunto de datos de entrenamiento, el número de épocas, la tasa de aprendizaje ni el proceso de optimización. La existencia de una variante con sufijo `-lr1e-5` sugiere que se probaron diferentes hiperparámetros, pero no hay información pública sobre los resultados de entrenamiento ni sobre la metodología empleada.

## Capacidades

- Transcripción de voz a texto en euskera, como resultado del fine-tuning sobre Whisper large-v3.
- Reconocimiento de voz en otros idiomas: al estar basado en el modelo original, podría conservar cierta capacidad multilingüe, aunque no está confirmado y el ajuste fino podría haber reducido el rendimiento en otros idiomas.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso ni otras capacidades más allá del ASR.
- El modelo es específico para audio, sin capacidades de visión ni de generación de texto libre.

## Casos de uso

- Transcripción de entrevistas y reuniones en euskera: el modelo puede convertir grabaciones de audio en texto, facilitando la documentación y el análisis posterior en entornos profesionales o académicos.
- Subtitulado automático de vídeos en euskera: integrado en pipelines de procesamiento de vídeo, permite generar subtítulos para contenidos audiovisuales en este idioma.
- Asistentes de voz en euskera: puede servir como componente de reconocimiento de voz en aplicaciones de asistencia personal o sistemas de control por voz adaptados a hablantes de euskera.
- Archivado y búsqueda de contenido oral: al transcribir archivos de audio históricos o institucionales, se facilita la indexación y búsqueda de información en euskera.
- Herramientas educativas para el aprendizaje del euskera: el modelo puede utilizarse para practicar pronunciación o para generar ejercicios de comprensión oral.
- Investigación lingüística: permite procesar corpus orales en euskera para estudios fonéticos, morfológicos o sociolingüísticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre WER (Word Error Rate) ni comparaciones con otros modelos de ASR para euskera.

## Requisitos de hardware

- El modelo tiene 1.6 mil millones de parámetros, lo que requiere una GPU con al menos 8 GB de VRAM para inferencia en precisión fp16 (aproximadamente 3.2 GB de pesos, más overhead de activaciones y memoria).
- Para una ejecución cómoda con contexto largo o lotes grandes, se recomienda una GPU con 16 GB o más, como una RTX 4090, A100 o H100.
- El tamaño del repositorio (25.8 GB) sugiere que los pesos están almacenados en fp32 (unos 6.4 GB) o que se incluyen múltiples versiones; en cualquier caso, para inferencia se puede convertir a fp16 o int8 para reducir requisitos.
- Es posible desplegar el modelo con frameworks como vLLM, llama.cpp (si se convierte a GGUF) o Hugging Face Transformers, aunque no hay documentación específica para este fine-tuning.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de ASR para euskera. El modelo base Whisper large-v3 (1.5B parámetros) es el punto de partida, pero no hay datos de rendimiento de este fine-tuning frente a él ni frente a otras alternativas como whisper-medium-basque (también del mismo autor, pero sin especificaciones publicadas). Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, pero al ser un fine-tuning de un modelo entrenado con datos mayoritariamente en inglés, podría presentar un rendimiento inferior en euskera en comparación con modelos entrenados desde cero para ese idioma.
- Riesgo de alucinaciones: como todo modelo de ASR, puede generar texto incorrecto o inventado en segmentos de audio ambiguos o con ruido.
- Limitaciones de contexto: Whisper procesa audio en segmentos de hasta 30 segundos; para audios más largos se requiere segmentación, lo que puede afectar a la coherencia en transcripciones largas.
- La licencia no está especificada en la ficha de Hugging Face; aunque el modelo base es MIT, el fine-tuning podría tener restricciones adicionales. Se recomienda contactar con el autor antes de un uso comercial.
- No hay garantía de soporte o mantenimiento del modelo, dado que el repositorio tiene pocas descargas y no se documentan actualizaciones.

## Enlaces

- [Modelo en Hugging Face: Ansu/whisper-large-v3-basque](https://huggingface.co/Ansu/whisper-large-v3-basque)
- [Variante con lr1e-5: Ansu/whisper-large-v3-basque-lr1e-5](https://huggingface.co/Ansu/whisper-large-v3-basque-lr1e-5)
- [Repositorio de OpenAI Whisper en GitHub](https://github.com/openai/whisper)
- [Repositorio de cxh-tech/whisper-large-v3 en GitHub](https://github.com/cxh-tech/whisper-large-v3)
