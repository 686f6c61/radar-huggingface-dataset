# Fasih779/whisper-tiny-en-minds14

## Resumen

El modelo `Fasih779/whisper-tiny-en-minds14` es un ajuste fino (fine-tuning) de `openai/whisper-tiny` sobre el dataset `PolyAI/minds14`, orientado a la tarea de reconocimiento automático de voz (ASR) en inglés. Fue desarrollado por el usuario Fasih779 y publicado en Hugging Face con licencia Apache 2.0. Aunque el dataset original es multilingüe, el modelo se entrena específicamente para transcripción de audio en inglés, aprovechando la arquitectura encoder-decoder de Whisper.

Con solo 37,7 millones de parámetros, se trata de un modelo muy ligero, adecuado para despliegue en entornos con recursos limitados. Su relevancia radica en ofrecer una alternativa compacta y ajustada a un dominio concreto (intentos de usuario en inglés), con un WER de 0,3146 en el conjunto de evaluación de minds14. La ventana de audio estándar de Whisper (30 segundos) se mantiene, aunque no se especifica en la documentación del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (ventana estándar de Whisper) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado para inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-tiny`, un transformer encoder-decoder con atención estándar, diseñado originalmente para ASR multilingüe. En este ajuste fino se congela la mayor parte del encoder y se adaptan las capas de cross-attention y el decoder al dataset `PolyAI/minds14`, como se describe en el repositorio asociado de GitHub. El entrenamiento se realizó con 500 pasos, batch size de 16, learning rate 1e-5, optimizador AdamW (fused), scheduler constante con warmup de 50 pasos y precisión mixta nativa. No se aplicaron técnicas de RLHF ni DPO; es un ajuste supervisado estándar sobre datos de voz etiquetados.

## Capacidades

- Reconocimiento automático de voz (ASR) en inglés, con foco en audios cortos de intención (consultas, comandos).
- Transcripción de audio a texto con una ventana de 30 segundos.
- No soporta tool calling, agentes, visión ni otras modalidades; es exclusivamente un modelo de ASR.
- No se especifican capacidades multilingües; el entrenamiento se limita al subconjunto en inglés de minds14.

## Casos de uso

- **Transcripción de consultas de voz en asistentes virtuales**: el modelo puede convertir comandos de voz cortos en texto para sistemas de intención, gracias a su entrenamiento en el dataset minds14 que contiene grabaciones de habla espontánea.
- **Subtitulado automático de audios breves**: útil para generar subtítulos en inglés en vídeos o podcasts de corta duración, con baja latencia y requisitos mínimos de hardware.
- **Sistemas de atención al cliente por voz**: integrable en pipelines de IVR para transcribir las peticiones del usuario y derivarlas a un clasificador de intención.
- **Prototipado rápido de ASR en inglés**: al ser un modelo pequeño, permite validar flujos de transcripción en entornos de desarrollo sin necesidad de GPUs potentes.
- **Análisis de llamadas de soporte**: transcribir segmentos de audio para su posterior análisis de texto, con un coste computacional reducido.
- **Aplicaciones educativas de pronunciación**: comparar la transcripción generada con la esperada para evaluar la claridad del habla en inglés.

## Benchmarks y rendimiento

El autor declara en el model-index los siguientes resultados sobre el conjunto de evaluación de `PolyAI/minds14`:

| Metrica | Valor |
|---|---|
| Loss | 0,5924 |
| Wer Ortho | 0,3208 |
| Wer | 0,3146 |

Estos valores son los reportados oficialmente y no han sido verificados de forma independiente. No se dispone de comparaciones con otros modelos en el mismo conjunto dentro de la información proporcionada.

## Requisitos de hardware

- **VRAM estimada**: al tener 37,7M de parámetros, en fp32 ocupa ~150 MB; en fp16 ~75 MB; en int8 ~38 MB. La inferencia puede ejecutarse en CPU con memoria RAM estándar (4-8 GB).
- **GPUs recomendadas**: cualquier GPU con al menos 1 GB de VRAM (p. ej., NVIDIA GTX 1050, RTX 2050) o incluso CPU sola para uso no interactivo.
- **Despliegue**: compatible con la librería `transformers` de Hugging Face; se puede servir con `pipeline` de ASR, o mediante `vLLM` y `TGI` (aunque no es habitual para modelos tan pequeños). También es posible exportar a ONNX o TorchScript para inferencia en producción.
- **Latencia y throughput**: no se proporcionan datos específicos; en una CPU moderna, la transcripción de un clip de 5 segundos suele tardar menos de 1 segundo, pero depende del hardware.

## Comparativa con modelos similares

Se comparan tres ajustes finos de `whisper-tiny` sobre el mismo dataset `minds14` (subconjunto en inglés), según los resultados publicados en Hugging Face:

| Modelo | Parametros | WER (minds14-en) | Licencia |
|---|---|---|---|
| Fasih779/whisper-tiny-en-minds14 | 37,7M | 0,3146 | Apache 2.0 |
| BinhMinhs10/whisper-tiny-minds14-en | 37,7M | 0,3208 | Apache 2.0 |
| Echaps12/whisper-tiny-minds14-en | 37,7M | 0,3318 | Apache 2.0 |

El modelo de Fasih779 presenta el WER más bajo de los tres, aunque la diferencia es pequeña. No se dispone del rendimiento del modelo base `openai/whisper-tiny` en este dataset para comparar la mejora relativa.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo pequeño entrenado sobre un dataset de intención (grabaciones de voz de clientes en inglés), puede tener dificultades con acentos no representados o ruido de fondo; puede generar transcripciones incorrectas en audio de baja calidad.
- **Dominio limitado**: está especializado en el subconjunto en inglés de minds14; su rendimiento en otros dominios o idiomas no está garantizado.
- **Contexto de audio**: la ventana de 30 segundos de Whisper limita la transcripción de clips más largos; para audios extensos se requiere segmentación previa.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones, pero el modelo se distribuye tal cual, sin garantías de precisión.
- **Documentación incompleta**: la model card no especifica el preprocesamiento de audio, la tasa de muestreo ni los detalles del dataset de entrenamiento, lo que dificulta la reproducibilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Fasih779/whisper-tiny-en-minds14)
- [BinhMinhs10/whisper-tiny-minds14-en (modelo comparable)](https://huggingface.co/BinhMinhs10/whisper-tiny-minds14-en)
- [Echaps12/whisper-tiny-minds14-en (modelo comparable)](https://huggingface.co/Echaps12/whisper-tiny-minds14-en)
- [Repositorio de GitHub sobre fine-tuning de Whisper en minds14](https://github.com/Debebe-Nigatu/whisper-finetune-colab)
- [Dataset PolyAI/minds14 en Hugging Face](https://huggingface.co/datasets/PolyAI/minds14)
