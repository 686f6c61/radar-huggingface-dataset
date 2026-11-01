# qqjz/TextPro-SLM-7B-30Plus

## Resumen

TextPro-SLM-7B-30Plus es un modelo de audio-texto desarrollado por qqjz que aborda el reconocimiento y la comprension de habla desde una perspectiva poco habitual: en lugar de extender un LLM de texto con un encoder de audio y un proyector de modalidad, factoriza la entrada en tokens de transcripcion (contenido linguistico) y un unico embedding global de prosodia (informacion acustica complementaria). El backbone de texto es Qwen2.5-7B-Instruct, afinado completamente, y el encoder acoplado es WhisperPro-30Plus, derivado de Whisper large-v3.

La propuesta del modelo, descrita en el paper "Minimizing Modality Gap from the Input Side: Your Speech LLM Can Be a Prosody-Aware Text LLM" (NeurIPS 2026), es que el LLM de texto reciba una entrada lo mas parecida posible a su formato nativo, preservando asi sus capacidades semanticas mientras aprende comprension paralinguistica. La variante 30Plus anade un diseno de inferencia para grabaciones de mas de 30 segundos basado en segmentacion VAD, contexto de transcripcion previa y promediado de vectores de prosodia.

El checkpoint publicado contiene unicamente pesos y documentacion: el codigo de inferencia se distribuye por separado en el repositorio de GitHub del proyecto. Es relevante ahora porque propone una via alternativa, mas ligera en parametros de conexion, frente a los conectores de audio multimodales convencionales, con licencia Apache-2.0 y un contexto de 32.768 tokens en el LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM de texto (Qwen2.5-7B-Instruct) + encoder Whisper large-v3 (WhisperPro-30Plus) + proyector de prosodia; fusion por embedding global antepuesto |
| Parametros totales | 7B en el backbone de texto; parametros del encoder y proyector no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (LLM); segmentos de audio de 30 s maximo por segmento Whisper |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (LLM y proyector), configuracion JSON y tokenizer |

## Arquitectura y entrenamiento

El modelo combina tres piezas: un backbone Qwen2.5-7B-Instruct completamente afinado, un encoder WhisperPro-30Plus (derivado de Whisper large-v3) que produce transcripcion y un vector de prosodia, y un proyector compacto de prosodia con dimensiones 1280 → 3584 → 3584, activacion GELU y precision BF16. La fusion consiste en anteponer un unico embedding global de prosodia a los tokens de transcripcion, de modo que el LLM recibe contenido linguistico en su formato nativo mas una senal acustica agregada. El audio se preprocesa en mono a 16 kHz y la salida es siempre texto.

El paper asociado reporta el uso de aproximadamente 1.000 horas de audio para el entrenamiento de los modelos descritos en el articulo. La model card no detalla la composicion del dataset, el numero exacto de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO especificas para este checkpoint. La extension 30Plus no modifica la ventana nativa de Whisper: cada segmento sigue limitado a 30 segundos y el manejo de audio largo se resuelve en inferencia mediante segmentacion por VAD, contexto de transcripcion previa, concatenacion de transcripciones y promediado con pesos iguales de los vectores de prosodia de cada segmento. El tokenizer conserva el marcador de prosodia entrenado `<|repo_name|>` (ID 151663) y la configuracion fija la revision del encoder acoplado.

## Capacidades

- Comprension de habla con salida en texto: transcribe y responde sobre el contenido linguistico del audio.
- Comprension paralinguistica: incorpora un embedding global de prosodia que aporta informacion acustica complementaria a la transcripcion.
- Procesamiento de audio largo mediante segmentacion VAD y contexto de transcripcion acumulado (diseno 30Plus).
- Razonamiento y generacion de texto heredados del backbone Qwen2.5-7B-Instruct.
- Capacidades multilingues limitadas al ingles segun la model card.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio de salida: no disponibles; el modelo solo devuelve texto.

## Casos de uso

- Analisis de llamadas de atencion al cliente: el modelo puede transcribir y responder preguntas sobre conversaciones grabadas de varios minutos, usando la segmentacion VAD del diseno 30Plus y el contexto de 32.768 tokens para mantener el hilo entre segmentos.
- Deteccion de tono y actitud en entrevistas o encuestas: el embedding de prosodia permite clasificar o describir la actitud del hablante (tension, entusiasmo, duda) junto al contenido literal de la transcripcion, algo que un ASR puro no captura.
- Moderacion de contenido en audio: analisis de grabaciones para identificar discurso problematico combinando el texto transcrito con senales prosodicas que a menudo acompanan a ciertos patrones de habla.
- Investigacion en linguistica computacional: estudio de la contribucion relativa de contenido y prosodia en tareas de comprension, gracias a la factorizacion explicita de la entrada en dos componentes.
- Resumen de reuniones largas: la segmentacion por VAD y el contexto acumulado permiten generar resumenes de sesiones que exceden los 30 segundos por segmento, con el LLM manejando la coherencia global.
- Evaluacion de calidad de locucion o doblaje: comparar la prosodia agregada de distintas grabaciones de un mismo texto para detectar diferencias de estilo o estado emocional.
- Prototipado de asistentes de voz con entendimiento paralinguistico: integracion del checkpoint con el codigo de inferencia del repositorio GitHub para construir asistentes que respondan de forma distinta segun el tono del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no introduce nuevas mediciones de benchmark y que las puntuaciones del paper original no corresponden a la extension 30Plus.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 15,3 GB, lo que sugiere pesos en BF16 de aproximadamente 7B parametros mas el encoder. En BF16 se necesitan del orden de 15-16 GB solo para pesos, mas memoria para el encoder y el contexto; en cuantizacion de 8 bits cabria en torno a 8-9 GB y en 4 bits en torno a 5-6 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: A100 o H100 para inferencia en BF16 con contexto completo; RTX 4090 (24 GB) es suficiente para BF16 con margen limitado.
- GPU de consumo: cabe en RTX 4090 y potencialmente en GPUs de 16 GB si se aplica cuantizacion, aunque no hay artefactos GGUF publicados.
- Opciones de despliegue: no disponible. La model card indica que el codigo de inferencia y las dependencias se distribuyen por separado en el repositorio de GitHub; el checkpoint no es cargable de forma funcional solo con el backbone de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TextPro-SLM-7B-30Plus | 7B (backbone) | 32.768 tokens | Audio (transcripcion + prosodia global) | Apache-2.0 | Checkpoint en HuggingFace; codigo en GitHub |
| Qwen2.5-7B-Instruct | 7B | 32.768 tokens (segun modelo base) | Texto | Apache-2.0 | HuggingFace |
| Whisper large-v3 | no disponible | 30 s por segmento | Audio | MIT (segun modelo original) | HuggingFace |

La comparacion con otros speech LLM de la misma categoria (por ejemplo, sistemas que conectan un encoder de audio a un LLM mediante proyectores de tokens) no esta disponible en la informacion proporcionada, ya que no se ofrecen datos de rendimiento ni especificaciones de esos sistemas en la model card.

## Limitaciones y advertencias

- Las respuestas pueden contener errores de transcripcion o alucinaciones, segun advierte la propia model card.
- El rendimiento varia con el idioma, las condiciones de grabacion, las caracteristicas del hablante y el dominio; solo se declara soporte de ingles.
- El pooling global comprime la prosodia variable en el tiempo: se pierde la evolucion temporal de la senal acustica dentro de cada segmento.
- El modelo devuelve solo texto; no sintetiza voz.
- El diseno 30Plus esta sujeto a efectos de segmentacion y al contexto finito de transcripcion del LLM; no se reclama precision en audio largo ni duracion ilimitada.
- El repositorio contiene unicamente pesos y documentacion; sin el codigo de inferencia del proyecto GitHub, el checkpoint no es utilizable de forma directa.
- No se han publicado mediciones de benchmark para esta variante, por lo que no hay evidencia cuantitativa de rendimiento.
- Aunque la licencia es Apache-2.0, conviene revisar `LICENSE` y `NOTICE` por las obligaciones derivadas de los modelos base (Qwen2.5 y Whisper large-v3).

## Enlaces

- HuggingFace: https://huggingface.co/qqjz/TextPro-SLM-7B-30Plus
- Checkpoint acoplado: https://huggingface.co/qqjz/WhisperPro-30Plus
- Modelo de la familia original: https://huggingface.co/qqjz/TextPro-SLM-7B-Global
- Encoder original: https://huggingface.co/qqjz/WhisperPro
- Paper (OpenReview): https://openreview.net/forum?id=Jsjmo8eX29
- Repositorio GitHub: https://github.com/dreamtheater123/TextPro-SLM
- Modelo base de texto: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
