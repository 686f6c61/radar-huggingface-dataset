# darija-asr-host/wav2vec2-darija-arabizi-int8

## Resumen

`wav2vec2-darija-arabizi-int8` es una exportación a ONNX con cuantización dinámica int8 del modelo `boumehdi/wav2vec2-large-xlsr-moroccan-darija`, un wav2vec2-large-xlsr ajustado para reconocimiento automático de habla (ASR) en dariya marroquí. El autor de este repositorio, `darija-asr-host`, no entrena un modelo nuevo: repaqueta los pesos originales para permitir inferencia en navegador mediante `onnxruntime-web`, con el objetivo de ofrecer ASR de dariya sin depender de servidores ni de infraestructura GPU.

El modelo resuelve un nicho concreto: la transcripción de un dialecto árabe con escasa representación en los sistemas ASR comerciales, que suelen estar dominados por árabe estándar moderno e inglés. La salida se emite en escritura Arabizi (dariya en caracteres latinos), y la decodificación es CTC argmax. El repositorio ocupa 0,4 GB e incluye un grafo ONNX con datos externos de 355 MB.

La relevancia actual radica en su formato: al ser un artefacto ONNX int8 de tamaño contenido, es desplegable en entornos sin GPU (incluido el navegador), lo que facilita prototipos de accesibilidad, subtitulado o análisis de audio en aplicaciones web. La calidad medida por el autor es una comprobación puntual de 3 clips, no un benchmark, y debe interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-large-xlsr (transformer encoder sobre representaciones convolucionales de audio), exportado a ONNX |
| Parametros totales | no disponible (el modelo base es wav2vec2-large-xlsr; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada no especificada en la model card) |
| Tipos de cuantizacion | int8 dinámica (ONNX) |
| Idiomas soportados | dariya marroquí (árabe marroquí), salida en Arabizi (caracteres latinos) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model-int8.onnx` + `model-int8.onnx.data`, datos externos) |

## Arquitectura y entrenamiento

El modelo subyacente es un wav2vec2-large-xlsr, un encoder transformer que procesa audio en bruto mediante una pila convolucional y aprende representaciones auto-supervisadas (XLSR, preentrenamiento multilingüe de speech). Sobre esa base, el autor original lo ajustó para ASR en dariya marroquí con aproximadamente 57 horas de habla del corpus MDVC. La decodificación es CTC (argmax sobre los logits), y el vocabulario mapea el carácter `|` a espacio y produce texto en Arabizi.

Esta exportación concreta aplica cuantización dinámica int8 al grafo ONNX, con los pesos almacenados en un fichero de datos externo de 355 MB. No hay información en la model card sobre detalles adicionales de entrenamiento (composición exacta del dataset, uso de RLHF/DPO, técnicas de aumentación de datos o decodificación especulativa); esos detalles remiten al repositorio del modelo original.

## Capacidades

- Reconocimiento automático de habla (ASR) en dariya marroquí, con salida en Arabizi (transliteración latina).
- Decodificación CTC argmax sobre el vocabulario del modelo; el token `|` se interpreta como espacio.
- Inferencia en navegador mediante `onnxruntime-web` con la opción de sesión `externalData`.
- Inferencia en Python mediante `onnxruntime`.
- Modelo de audio puro: no soporta tool calling, function calling, agentes, visión ni audio generativo.
- Capacidad multilingüe limitada al dialecto objetivo; no se documentan otros idiomas.
- No dispone de modo de razonamiento (thinking mode) ni de generación de texto libre.

## Casos de uso

- Subtitulado en tiempo real de conversaciones en dariya en aplicaciones web: el artefacto ONNX int8 puede ejecutarse en el navegador con `onnxruntime-web`, evitando enviar audio a un servidor y reduciendo la latencia de red.
- Prototipos de accesibilidad para hablantes de dariya: transcripción local de notas de voz o dictado en herramientas web, aprovechando el tamaño contenido del modelo (355 MB de datos externos) y su licencia permisiva.
- Análisis de contenido audiovisual marroquí: transcripción de entrevistas, pódcast o vídeos para indexación y búsqueda, con la salida Arabizi como formato intermedio para su posterior normalización.
- Investigación en ASR de dialectos árabes: el modelo sirve como línea base reproducible y desplegable en CPU para comparar con otros sistemas (por ejemplo, whisper-base) en condiciones controladas.
- Aplicaciones educativas de aprendizaje de dariya: transcripción de audio de estudiantes para evaluación de pronunciación o generación de ejercicios a partir de material hablado.
- Despliegue en dispositivos de borde o entornos sin GPU: al ser int8 y ONNX, puede integrarse en servicios ligeros o aplicaciones de escritorio donde no hay aceleración hardware disponible.
- Preprocesado en pipelines de datos: transcripción masiva de clips de dariya en CPU para construir datasets etiquetados o sistemas de búsqueda por voz.

## Benchmarks y rendimiento

El autor publica una comprobación puntual de 3 clips reales del dataset `EtMmohammedHafsati/darija_speech_to_text_metadata_full`, no un benchmark sistemático:

| Modelo | CER medio (3 clips) |
|---|---|
| wav2vec2-darija-arabizi-int8 (esta exportación) | 0,244 |
| whisper-base (con la misma transliteración a Arabizi) | 0,547 |

El autor advierte explícitamente que la muestra es pequeña y que los resultados variarán según la voz, el dispositivo y las condiciones de grabación. No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no procede inventarlos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el artefacto int8 ocupa 355 MB en disco (grafo + datos externos), por lo que la huella en memoria es del orden de cientos de MB.
- GPU recomendadas: no se especifican; al ser un modelo int8 ONNX orientado a navegador, está pensado para CPU y ejecución en `onnxruntime-web`.
- ¿Cabe en GPU de consumo? Sí, con holgura, dado el tamaño del artefacto; también puede ejecutarse en CPU.
- Opciones de despliegue: `onnxruntime-web` (navegador, con `externalData`), `onnxruntime` en Python, y cualquier runtime compatible con ONNX (por ejemplo, servidores de inferencia ONNX). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| wav2vec2-darija-arabizi-int8 (este) | no disponible (base wav2vec2-large-xlsr) | no disponible | dariya (Arabizi) | Apache-2.0 | ONNX int8 | Exportación para navegador; CER 0,244 en 3 clips |
| boumehdi/wav2vec2-large-xlsr-moroccan-darija | no disponible (wav2vec2-large-xlsr) | no disponible | dariya | Apache-2.0 | safetensors/PyTorch (no detallado) | Modelo original; entrenado con ~57 h de MDVC |
| whisper-base | ~74 M (dato público del modelo OpenAI) | 30 s de audio | multilingüe | MIT | PyTorch/otros | CER 0,547 en la misma comprobación de 3 clips |

La comparación con whisper-base procede únicamente de la comprobación puntual del autor y no constituye una evaluación rigurosa. No se dispone de datos comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- La evaluación de calidad se basa en 3 clips; no hay benchmark representativo y el CER real puede variar mucho según el hablante y las condiciones acústicas.
- Riesgo de errores de transcripción y de alucinación en pasajes ambiguos o con ruido, propio de los sistemas CTC entrenados con datos limitados (~57 h).
- El modelo está especializado en dariya marroquí; no se documenta rendimiento en árabe estándar moderno ni en otros dialectos.
- La salida es Arabizi (caracteres latinos), no escritura árabe; requiere postprocesado si se necesita texto en árabe.
- Sesgos no documentados: la model card no detalla la composición demográfica del corpus MDVC ni posibles sesgos de género, edad o región.
- Licencia Apache-2.0 permisiva para uso comercial, heredada del modelo original; conviene revisar la model card del repositorio fuente para condiciones adicionales.
- El artefacto depende de datos externos (`model-int8.onnx.data`); debe cargarse con la opción `externalData` correctamente configurada o la inferencia fallará.
- No apto para tareas de generación de texto, razonamiento, código o agentes; es exclusivamente un modelo ASR.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/darija-asr-host/wav2vec2-darija-arabizi-int8
- Modelo original: https://huggingface.co/boumehdi/wav2vec2-large-xlsr-moroccan-darija
- Dataset de evaluación citado: https://huggingface.co/datasets/EtMmohammedHafsati/darija_speech_to_text_metadata_full
- Artículo de referencia sobre dariya (Wikipedia): https://fr.wikipedia.org/wiki/Arabe_marocain
- Recursos de aprendizaje de dariya: https://speakmoroccan.com/fr/
- Guía de dariya para principiantes: https://www.moroccodarija.com/darija-pour-les-debutants-guide-complet/
- Recursos de aprendizaje: https://www.learnmoroccan.com/fr
