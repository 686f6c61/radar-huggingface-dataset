# Ansu/whisper-small-basque

## Resumen

El modelo `Ansu/whisper-small-basque` es un ajuste fino (fine-tuning) de `openai/whisper-small` especializado en el reconocimiento automático de voz (ASR) para euskera. Fue desarrollado por el usuario Ansu y publicado en Hugging Face bajo la licencia Apache 2.0. El modelo parte de la arquitectura Whisper de OpenAI, un transformer encoder-decoder entrenado para transcribir audio a texto, y se ha adaptado específicamente al euskera mediante un proceso de entrenamiento adicional sobre un conjunto de datos no especificado en la documentación pública.

Este modelo es relevante porque cubre una lengua minoritaria con pocos recursos dedicados en el ámbito del ASR, y ofrece una alternativa open source para transcribir audio en euskera. Con 241,7 millones de parámetros, se sitúa en la gama pequeña de la familia Whisper, lo que lo hace viable para despliegues en hardware moderado. La métrica de error de palabra (WER) reportada en la evaluación es del 9,54 %, un valor razonable para un modelo de este tamaño, aunque no se detalla el corpus de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | no disponible (pesos originales en fp32) |
| Idiomas soportados | euskera (presumiblemente, no se especifica en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper, que combina un encoder de audio con un decoder de texto autoregresivo. El encoder procesa espectrogramas de Mel (80 bins) de ventanas de 30 segundos, y el decoder genera los tokens de transcripción. El ajuste fino se realizó sobre el checkpoint `openai/whisper-small` con un conjunto de datos no publicado. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 1e-05, tamaño de lote de 128 para entrenamiento y 32 para evaluación, optimizador Adam (beta1=0.9, beta2=0.999, epsilon=1e-08), scheduler lineal con 500 pasos de calentamiento y 5000 pasos totales, y entrenamiento con precisión mixta nativa (AMP). No se menciona el uso de técnicas adicionales como RLHF o DPO; el proceso se limita a un fine-tuning supervisado estándar.

## Capacidades

- Transcripción de voz a texto en euskera: el modelo convierte audio en texto, siendo su función principal.
- Reconocimiento robusto de voz: hereda las capacidades generales de Whisper, como la tolerancia a ruido y acentos, aunque su especialización en euskera puede degradar su rendimiento en otros idiomas.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo exclusivamente de ASR.
- Soporte multilingüe limitado: aunque Whisper original soporta múltiples idiomas, este ajuste fino se ha centrado en euskera, por lo que el rendimiento en otros idiomas podría verse afectado.
- No se indica soporte para vision, audio (más allá de la entrada de voz) ni modos especiales de pensamiento.

## Casos de uso

- Transcripción de entrevistas y testimonios en euskera: periodistas e investigadores pueden utilizar el modelo para convertir grabaciones de audio en texto, aprovechando su bajo WER en esta lengua.
- Generación de subtítulos para vídeos en euskera: integrado en pipelines de procesamiento de vídeo, el modelo puede producir subtítulos automáticos para contenido audiovisual en euskera.
- Asistentes de voz para aplicaciones locales: empresas y desarrolladores pueden incorporar el modelo en aplicaciones móviles o de escritorio que requieran dictado por voz en euskera, sin depender de servicios en la nube.
- Archivado y digitalización de documentos sonoros: instituciones culturales o bibliotecas pueden transcribir grabaciones históricas en euskera para facilitar su búsqueda y preservación.
- Análisis de llamadas de atención al cliente: en entornos donde se atiende en euskera, el modelo puede transcribir conversaciones para su posterior análisis de calidad o extracción de información.
- Investigación en procesamiento del lenguaje natural (PLN) para euskera: sirve como base para experimentos en ASR, adaptación a dominios específicos o comparación con otros modelos multilingües.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de evaluación, aunque no se especifica el dataset utilizado:

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 0,1906 |
| WER (evaluación) | 9,5417 % |

La evolución del WER durante el entrenamiento muestra una mejora progresiva desde 15,66 % (paso 1000) hasta 9,54 % (paso 5000). No se han publicado benchmarks comparativos en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 241,7 millones de parámetros, el modelo en fp32 ocupa aproximadamente 967 MB. En fp16 (común en inferencia) se reduce a ~484 MB. Con cuantización a 8 bits (si se aplicara) bajaría a ~242 MB, aunque no se ofrecen pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en fp16. Tarjetas como NVIDIA GTX 1660, RTX 2060 o superiores son suficientes. Para procesamiento por lotes o baja latencia, se recomienda una RTX 3090 o A10.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo como RTX 3060, RTX 4070, etc., siempre que se use fp16 o cuantización.
- Opciones de despliegue: el modelo se puede servir con librerías estándar de Hugging Face (transformers + pipeline), así como con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se documenta soporte específico para Ollama, pero es posible convertirlo.
- Latencia y throughput: no se proporcionan datos. Para una sola transcripción de 30 segundos, se estima una latencia de 1-2 segundos en una GPU moderna (RTX 3090) con fp16, aunque depende de la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (euskera) | Licencia |
|---|---|---|---|---|
| Ansu/whisper-small-basque | 241,7 M | 30 s | 9,54 % | Apache 2.0 |
| openai/whisper-small | 244 M | 30 s | no disponible (rendimiento general) | MIT |
| openai/whisper-large-v3 | 1550 M | 30 s | no disponible (mejor rendimiento multilingüe) | MIT |

El modelo ajustado supera al Whisper-small original en euskera probablemente, pero no hay datos directos de comparación. Whisper-large-v3 sería más preciso, pero requiere mucho más hardware. La ventaja de este modelo es su tamaño reducido y su especialización en euskera.

## Limitaciones y advertencias

- El conjunto de datos de entrenamiento no está especificado, lo que impide evaluar posibles sesgos o la cobertura de acentos y dialectos del euskera.
- El WER reportado es sobre un único conjunto de evaluación, sin detalles sobre su composición; el rendimiento en otros corpus podría variar.
- Al ser un fine-tune de Whisper-small, hereda las limitaciones de ese modelo base: puede tener dificultades con voces muy ruidosas, superposiciones o habla rápida.
- No se ha comprobado el rendimiento en otros idiomas; es probable que la especialización en euskera degrade la transcripción en castellano, inglés u otros.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye tal cual, sin garantías. No se indican restricciones adicionales.
- No se proporcionan pesos cuantizados ni guías de despliegue específicas; los usuarios deben gestionar la conversión si necesitan formatos como GGUF.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Ansu/whisper-small-basque)
- [Variante con lr=1e-5 y freeze=False](https://huggingface.co/Ansu/whisper-small-basque-lr1e5-freezeFalse)
- [Repositorio oficial de Whisper en GitHub](https://github.com/openai/whisper)
- [Model card de Whisper](https://github.com/openai/whisper/blob/main/model-card.md)
- [Anuncio de Whisper por OpenAI](https://openai.com/index/whisper/)
