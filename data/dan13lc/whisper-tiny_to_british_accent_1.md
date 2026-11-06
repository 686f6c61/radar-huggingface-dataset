# Dan13lC/whisper-tiny_to_british_accent_1

## Resumen

Whisper tiny British accent es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, desarrollado por el usuario Dan13lC y publicado en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) especializado en ingles britanico, entrenado sobre el dataset `british_english`. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, con 37,7 millones de parametros totales, y hereda la licencia Apache 2.0 del modelo base.

El objetivo del ajuste es mejorar la transcripcion de audio con acento britanico, un dominio donde el whisper-tiny original (entrenado mayoritariamente con datos multilingues y acentos estadounidenses) puede presentar un rendimiento inferior. El autor reporta un WER de 11,06 % sobre el split de test del dataset British English, con una perdida de validacion de 0,2755 tras 2000 pasos de entrenamiento.

La relevancia de este modelo es limitada pero concreta: se trata de un artefacto de investigacion o experimento personal, con cero descargas y cero likes en el momento de la consulta, y una model card generada automaticamente que no documenta la composicion del dataset ni los casos de uso previstos. Es util como referencia para quien quiera reproducir un ajuste de acento sobre Whisper tiny o comparar el impacto del fine-tuning en modelos ASR de baja capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8/INT4) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de openai/whisper-tiny, un transformer encoder-decoder disenado para ASR. Whisper tiny es la variante mas pequena de la familia Whisper, con aproximadamente 39 millones de parametros en su configuracion original; el checkpoint publicado declara 37.760.640 parametros en safetensors. El modelo procesa audio en ventanas de 30 segundos y genera transcripciones autoregresivamente mediante un decoder con tokens especiales de idioma y tarea.

El entrenamiento se realizo con los siguientes hiperparametros declarados en la model card: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 2000 pasos totales. Se registran dos puntos de evaluacion: en el paso 1000 (epoca 0,99) con perdida de validacion 0,2790 y WER 11,9486, y en el paso 2000 (epoca 1,98) con perdida 0,2755 y WER 11,0635. No se documenta el numero de tokens de audio, la composicion del dataset `british_english` ni si se aplicaron tecnicas de aumento de datos o RLHF. El framework declarado es Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en acento britanico.
- Transcripcion de audio mono a 16 kHz en ventanas de hasta 30 segundos (limitacion heredada de Whisper tiny).
- Generacion de texto a partir de audio con marcas de tiempo a nivel de segmento (capacidad estandar de Whisper, no confirmada explicitamente en la model card).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles (`language: en`); no se declara soporte de otros idiomas.
- Capacidades especiales (thinking mode, vision, audio adicional): no disponible.

## Casos de uso

- Transcripcion de reuniones y entrevistas con hablantes de acento britanico: el ajuste sobre el dataset `british_english` busca reducir el WER en este dominio concreto frente al whisper-tiny original, adecuado para actas internas donde no se requiere transcripcion literal perfecta.
- Subtitulado automatico de contenido audiovisual britanico: el modelo puede generar subtitulos en ingles para videos, podcasts o clases grabadas, con la ventaja de su bajo coste computacional (37,7 M de parametros) para procesamiento por lotes en CPU o GPU de gama baja.
- Prototipado rapido de pipelines ASR: al ser un modelo de 0,3 GB, es util para validar arquitecturas de transcripcion en entornos de desarrollo antes de escalar a modelos Whisper de mayor tamano.
- Investigacion sobre adaptacion de acento: sirve como punto de partida reproducible para experimentos de fine-tuning de ASR con acentos regionales, dado que la model card documenta hiperparametros y curvas de entrenamiento.
- Transcripcion en dispositivos con recursos limitados: su tamano permite despliegue en Raspberry Pi, moviles o navegadores mediante ONNX Runtime o transformers.js, aunque no se documentan conversiones oficiales.
- Evaluacion comparativa de WER por acento: util para medir la brecha de rendimiento entre ingles britanico y otras variantes usando el mismo modelo base, como referencia en estudios de sesgo linguistico en ASR.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| British English | test | WER | 11,0635 |

Resultados de entrenamiento declarados en la model card:

| Paso | Epoca | Perdida de entrenamiento | Perdida de validacion | WER |
|---|---|---|---|---|
| 1000 | 0,9901 | 0,3024 | 0,2790 | 11,9486 |
| 2000 | 1,9802 | 0,1569 | 0,2755 | 11,0635 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con el whisper-tiny original sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (37,7 M de parametros, ~150 MB de pesos); en FP16 aproximadamente 75 MB de pesos mas overhead de activaciones y cache.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 o H100. Tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con mas de 1 GB de VRAM, e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), vLLM no aplica (no es un modelo de lenguaje generativo puro), llama.cpp no soporta Whisper de forma nativa, TGI no esta orientado a ASR. Alternativas habituales: transformers, faster-whisper (requiere conversion a CTranslate2, no documentada por el autor), ONNX Runtime (conversion manual).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER (British English) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dan13lC/whisper-tiny_to_british_accent_1 | 37,7 M | ventanas de 30 s | 11,06 (declarado, no verificado) | apache-2.0 | Hugging Face, 0 descargas |
| openai/whisper-tiny | ~39 M | ventanas de 30 s | no disponible en esta informacion | apache-2.0 | Hugging Face, ampliamente usado |
| openai/whisper-base | ~74 M | ventanas de 30 s | no disponible en esta informacion | apache-2.0 | Hugging Face |
| openai/whisper-small | ~244 M | ventanas de 30 s | no disponible en esta informacion | apache-2.0 | Hugging Face |

No se dispone de datos de WER comparables para los modelos base sobre el mismo dataset `british_english`, por lo que no es posible cuantificar la mejora del ajuste frente al whisper-tiny original.

## Limitaciones y advertencias

- Model card generada automaticamente: el autor no ha completado las secciones de descripcion, usos previstos, limitaciones ni datos de entrenamiento, lo que impide evaluar la composicion y representatividad del dataset `british_english`.
- WER no verificado: el resultado de 11,06 % esta marcado como `verified: false` en el model-index; no ha sido validado de forma independiente.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible que no corresponde al audio, especialmente en segmentos con ruido, silencios o audio musical.
- Limitacion de contexto: Whisper tiny procesa ventanas de 30 segundos; audios mas largos requieren segmentacion manual o pipelines de chunking, con riesgo de errores en las fronteras.
- Limitacion de idioma: solo ingles; no se declara soporte para otros idiomas ni para variantes regionales distintas del britanico.
- Capacidad reducida: al ser la variante tiny, su precision en acentos fuertes, habla rapida o audio con ruido sera inferior a la de modelos Whisper de mayor tamano.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; al ser un artefacto con cero descargas, no hay evidencia de uso en produccion.
- Caveat de produccion: no se documentan conversiones a formatos optimizados (GGUF, CTranslate2, ONNX) ni pruebas de latencia, por lo que su integracion en pipelines de produccion requeriria trabajo adicional de validacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dan13lC/whisper-tiny_to_british_accent_1
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (referencia del modelo base): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
