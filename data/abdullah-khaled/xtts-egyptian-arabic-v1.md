# abdullah-khaled/xtts-egyptian-arabic-v1

## Resumen

XTTS-v2 Egyptian Arabic (Fine-tuned) es un ajuste fino del modelo de síntesis de voz Coqui XTTS-v2, adaptado específicamente al árabe egipcio (código ISO `arz`, aunque el modelo emplea el código genérico `ar` en inferencia). Lo desarrolla el usuario de HuggingFace abdullah-khaled y se distribuye como checkpoint experimental de investigación. El modelo parte de la arquitectura XTTS-v2, un sistema TTS autorregresivo basado en transformer con condicionamiento por audio de referencia (voice cloning zero-shot), y hereda su ventana de contexto de audio y su tokenizador multilingüe.

El problema que aborda es la escasez de sistemas TTS abiertos con calidad razonable para dialectos árabes distintos del árabe estándar moderno (MSA). XTTS-v2 original cubre `ar` pero no está optimizado para el egipcio coloquial; este ajuste se entrena sobre un corpus de un solo hablante en árabe egipcio (`xtts-egyptian-dataset-v2`), muestreado a 22,05 kHz y con salida a 24 kHz.

Es relevante ahora porque el ecosistema Coqui TTS sigue vivo a través del fork mantenido `coqui-tts`, y los ajustes comunitarios de XTTS para dialectos minoritarios son una vía práctica para investigación en síntesis multilingüe. No obstante, el autor declara explícitamente que es un checkpoint de investigación, no evaluado en robustez ni seguridad, y prohibido para uso en producción o comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XTTS-v2 (TTS autorregresivo basado en transformer con condicionamiento por latentes de audio de referencia) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (condicionamiento con `gpt_cond_len=6` s y `max_ref_length=30` s de audio de referencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ar (árabe), arz (árabe egipcio); en inferencia se usa el código `ar` |
| Licencia | Coqui Public Model License (coqui-public-model-license), uso solo de investigación |
| Formato de pesos | `model.pth` (PyTorch), `config.json`, `vocab.json`; sin safetensors ni GGUF |
| Frecuencia de muestreo de salida | 24.000 Hz |
| Frecuencia de los datos de entrenamiento | 22.050 Hz mono |
| Framework | Coqui TTS (`XttsConfig` / `Xtts`), fork `coqui-tts` |
| Tamano del repositorio | 1,7 GB |
| Modelo base | coqui/XTTS-v2 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de XTTS-v2: un decodificador autorregresivo tipo GPT que genera tokens de audio discretos a partir del texto tokenizado, condicionado por latentes calculados de un clip de referencia (`gpt_cond_latent` y `speaker_embedding`). Esto permite clonación de voz zero-shot con 6-30 segundos de audio limpio en mono. La salida se decodifica a 24 kHz mediante el vocoder incluido en el checkpoint base.

El ajuste fino se realizó sobre el dataset `abdullah-khaled/xtts-egyptian-dataset-v2`, compuesto por clips a nivel de frase de hasta 12 segundos, 22,05 kHz mono, de un único hablante egipcio. Las transcripciones fueron generadas por LLM y no verificadas completamente por humanos, lo que introduce ruido potencial en el alineamiento texto-audio. El autor no publica hiperparámetros, número de épocas, tamaño del lote ni hardware de entrenamiento (la model card deja un marcador "Add your training details here"). No se documenta uso de RLHF, DPO ni etapas de alineación posteriores.

## Capacidades

- Síntesis de voz (text-to-speech) en árabe egipcio coloquial, con salida a 24 kHz.
- Clonación de voz zero-shot mediante audio de referencia: el modelo calcula latentes de condicionamiento a partir de un clip de 6-30 segundos.
- Soporte del código de idioma `ar` en la API de inferencia (no hay código dedicado para `arz`).
- División automática de texto largo (`enable_text_splitting=True`) para entradas de varias frases.
- Control de expresividad y estabilidad mediante parámetros de decodificación (`temperature`, `repetition_penalty`, `top_k`, `length_penalty`).
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio de entrada más allá del condicionamiento ni modo "thinking": es exclusivamente un modelo TTS.

## Casos de uso

- Investigación académica en síntesis de voz dialectal árabe: permite estudiar la adaptación de XTTS-v2 a un dialecto concreto (egipcio) frente al árabe estándar, comparando calidad y naturalidad con el checkpoint base.
- Reproducibilidad de ajustes finos: sirve como referencia para experimentos de fine-tuning de XTTS con corpus de un solo hablante y transcripciones generadas por LLM, evaluando el impacto del ruido en las transcripciones.
- Demos y prototipos personales de TTS en egipcio: se puede integrar en notebooks o scripts de inferencia con `coqui-tts` para generar muestras de audio y evaluar subjetivamente la calidad.
- Evaluación comparativa de vocoders y parámetros de decodificación: el modelo permite barrer `temperature`, `repetition_penalty` y `top_k` para medir estabilidad y evitación de bucles en árabe dialectal.
- Estudio de clonación de voz con hablantes de árabe egipcio: útil para analizar cómo generaliza el condicionamiento por referencia a un dialecto no visto durante el preentrenamiento original.
- Benchmarking de pipelines TTS en CPU y GPU: al ser un checkpoint pequeño (repositorio de 1,7 GB), sirve para medir latencia y throughput de XTTS en distintas configuraciones de hardware dentro de un contexto de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (MOS, WER, SIM, MCD) ni comparaciones cuantitativas con XTTS-v2 base u otros sistemas TTS en árabe.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 1,7 GB, por lo que la inferencia en FP32 requiere del orden de varios GB de VRAM, pero el autor no publica cifras.
- GPU recomendadas: no especificadas por el autor. XTTS-v2 se ha ejecutado históricamente en GPUs consumer (RTX 3060/4090) y en A100/H100 para lotes mayores; este ajuste no documenta requisitos propios.
- Compatibilidad con GPU consumer: probable (el checkpoint base XTTS-v2 cabe en GPUs consumer modernas), aunque no confirmado por el autor para este ajuste.
- CPU: el autor advierte que XTTS en CPU es lento y recomienda `torch.set_num_threads(os.cpu_count())`.
- Opciones de despliegue: Coqui TTS (`coqui-tts`) con `XttsConfig`/`Xtts`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / condicionamiento | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| abdullah-khaled/xtts-egyptian-arabic-v1 | no disponible | 6-30 s de audio de referencia | ar, arz | Coqui Public Model License (research only) | Experimental, 0 descargas |
| coqui/XTTS-v2 (base) | no disponible | 6-30 s de audio de referencia | multilingüe (incluye ar) | Coqui Public Model License | Modelo base público y ampliamente usado |
| Otros TTS árabes open source | no disponible | no disponible | ar / dialectos | variable | no disponible |

La comparación cuantitativa con alternativas no está disponible: el autor no publica métricas ni comparaciones con otros sistemas TTS en árabe egipcio.

## Limitaciones y advertencias

- Checkpoint estrictamente experimental: el autor prohíbe explícitamente el uso en producción, productos comerciales o cualquier contexto donde errores o mal uso puedan causar daño.
- Licencia Coqui Public Model License: restringe el uso comercial; revisar los términos en https://coqui.ai/cpml antes de cualquier uso.
- Riesgo de clonación de voz no consentida: la model card trunca la sección de usos no permitidos, pero la clonación de voces sin consentimiento queda fuera de lo permitido.
- Transcripciones del dataset generadas por LLM y no verificadas por humanos: puede degradar la alineación texto-audio y la pronunciación en casos límite.
- Corpus de un solo hablante: la diversidad de voces y estilos es limitada; la generalización a otros hablantes depende del condicionamiento por referencia y no está evaluada.
- Sin evaluación de robustez, seguridad ni fiabilidad: no hay benchmarks publicados de MOS, WER ni similitud de hablante.
- Uso del código `ar` en lugar de `arz`: no hay código dedicado para egipcio, lo que puede limitar el control fino del dialecto.
- Riesgo de bucles y artefactos en la generación: el autor recomienda `repetition_penalty=5.0` y `temperature=0.65` para mitigarlos, lo que sugiere inestabilidad conocida.
- Hiperparámetros de entrenamiento no publicados: dificulta la reproducibilidad del ajuste fino.
- Modelo de 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abdullah-khaled/xtts-egyptian-arabic-v1
- Modelo base Coqui XTTS-v2: https://huggingface.co/coqui/XTTS-v2
- Dataset de ajuste fino: https://huggingface.co/datasets/abdullah-khaled/xtts-egyptian-dataset-v2
- Licencia Coqui Public Model License: https://coqui.ai/cpml
- Fork mantenido de Coqui TTS: paquete `coqui-tts` en PyPI (https://pypi.org/project/coqui-tts/)
- Muestra de audio: `output.wav` en el repositorio del modelo
