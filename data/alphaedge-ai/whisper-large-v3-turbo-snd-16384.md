# alphaedge-ai/whisper-large-v3-turbo-snd-16384

## Resumen

`whisper-large-v3-turbo-snd-16384` es una variante recortada (trimmed) de `openai/whisper-large-v3-turbo`, publicada por el usuario `alphaedge-ai`. El modelo parte del checkpoint original de OpenAI para reconocimiento automatico del habla y aplica una reduccion del vocabulario del tokenizer de 51.865 a 16.384 tokens, conservando unicamente los tokens relevantes para el idioma sindhi (`sd`). El resultado es un modelo un 5,61% mas pequeno en parametros (763.461.120 frente a 808.878.080) y con una huella de memoria notablemente inferior.

La tecnica de trimming, descrita en el blog de Hugging Face sobre el tema, consiste en muestrear textos del idioma objetivo (en este caso 200.000 textos del dataset `lbourdois/fineweb-2-trimming`), medir que tokens del vocabulario aparecen realmente y eliminar el resto. Esto reduce el embedding de entrada y la proyeccion de salida, que en Whisper representan una parte significativa del total de parametros.

Es relevante para despliegues especializados en sindhi donde el coste de memoria y el tamano del artefacto importan, pero no es un modelo multilingue: al haber eliminado tokens de otros idiomas, su rendimiento fuera del sindhi se degrada de forma esperable. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), con vocabulario recortado |
| Parametros totales | 763.461.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors; se puede cuantizar con herramientas estandar, pero no se documenta) |
| Idiomas soportados | sindhi (`sd`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3-turbo: un transformer encoder-decoder con atencion estandar, entrenado originalmente por OpenAI con supervision debil a gran escala sobre audio y transcripciones web. El modelo base large-v3-turbo reduce el numero de capas del decoder respecto a large-v3, lo que baja el coste de inferencia manteniendo calidad cercana.

Este checkpoint concreto no ha sido reentrenado: es el resultado de aplicar trimming al vocabulario. Se muestrearon 200.000 textos en sindhi del dataset `lbourdois/fineweb-2-trimming`, se identificaron los tokens efectivamente utilizados y se recorto el vocabulario a 16.384 entradas (reduccion del 68,41%). Los pesos de embedding y de la proyeccion de salida se filtran en consecuencia; el resto de la red permanece intacta. No hay informacion sobre RLHF, DPO ni ajuste fino adicional en la model card.

## Capacidades

- Transcripcion de audio a texto (ASR) en sindhi, con la pipeline `automatic-speech-recognition` de transformers.
- Entrada de audio a 16 kHz, procesada en ventanas de 30 segundos segun el diseno de Whisper.
- Tareas de transcripcion y traduccion soportadas por la interfaz de Whisper (`task: transcribe` / `translate`), aunque el vocabulario recortado limita la salida practica al sindhi.
- No soporta tool calling ni function calling.
- No esta orientado a razonamiento multi-paso ni a uso como agente.
- Capacidades multilingues muy limitadas: el vocabulario eliminado impide transcribir correctamente idiomas distintos del sindhi.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Transcripcion de reuniones y entrevistas en sindhi: el modelo convierte audio de 16 kHz en texto con un artefacto de 1,5 GB, adecuado para entornos con memoria limitada frente al modelo original.
- Subtitulado de contenido audiovisual en sindhi: se puede procesar audio por ventanas de 30 s y generar subtitulos, con un coste de inferencia menor al del checkpoint completo.
- Servicio de dictado o notas de voz en sindhi: integrable mediante la pipeline de transformers en una API interna, con menor huella de memoria que large-v3-turbo.
- Archivado y busqueda de grabaciones: transcripcion por lotes de archivos historicos en sindhi para indexacion y busqueda textual.
- Despliegue en hardware modesto: al reducir el vocabulario, el modelo ocupa menos memoria y puede ejecutarse en GPUs de gama media donde el original resultaria mas ajustado.
- Prototipado rapido en investigacion sobre ASR en lenguas de bajos recursos: sirve como punto de partida para experimentos de trimming o ajuste fino especifico de sindhi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que el modelo recortado "deberia comportarse de forma similar al original" para el idioma objetivo, sin cifras de WER ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 3 GB solo para pesos; en FP16 en torno a 1,5-2 GB, mas memoria para activaciones y audio.
- Cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores; tambien en GPUs de datacenter (A100, H100) sin problema, aunque sobredimensionadas para este tamano.
- Puede ejecutarse en CPU para cargas por lotes pequenas, con latencia mayor.
- Opciones de despliegue: transformers (pipeline oficial), y en principio vLLM, TGI o llama.cpp no aplican directamente a Whisper; para servir ASR se usaria transformers o un servidor propio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-large-v3-turbo-snd-16384 | 763.461.120 | 16.384 | sindhi | apache-2.0 | Hugging Face |
| openai/whisper-large-v3-turbo | 808.878.080 | 51.865 | multilingue | apache-2.0 | Hugging Face |
| openai/whisper-large-v3 | no disponible en la informacion | no disponible | multilingue | apache-2.0 | Hugging Face |

La diferencia principal frente al modelo base es el vocabulario reducido (68,41% menos tokens) y el menor tamano (5,61% menos parametros), a cambio de perder cobertura multilingue.

## Limitaciones y advertencias

- Solo soporta sindhi de forma fiable; el resto de idiomas se degrada porque sus tokens fueron eliminados del vocabulario.
- Riesgo de alucinacion inherente a Whisper, especialmente en audio con ruido, silencios largos o habla solapada.
- No hay benchmarks publicados que cuantifiquen la perdida de calidad respecto al modelo original en sindhi.
- El modelo no ha sido reentrenado; cualquier sesgo del checkpoint base de OpenAI se mantiene.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset de minado.
- El repo tiene muy pocas descargas (31) y ningun like, por lo que la validacion comunitaria es practicamente nula.
- La fecha de creacion indicada (2026) y el autor `alphaedge-ai` no aportan garantias adicionales sobre mantenimiento o soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-snd-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
