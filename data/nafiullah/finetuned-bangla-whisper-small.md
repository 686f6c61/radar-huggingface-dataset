# nafiullah/finetuned-bangla-whisper-small

## Resumen

El repositorio `nafiullah/finetuned-bangla-whisper-small` es un espacio de trabajo para el ajuste fino de `openai/whisper-small` orientado a reconocimiento automático de voz (ASR) en bengalí (bn) e inglés (en). Forma parte del proyecto Drishti, una iniciativa de accesibilidad que especifica "speech-to-text: Bangla + English" y que asume `whisper-small` como modelo base, ya que la banda de modelos "small" es la mínima utilizable para bengalí segun el plan de construccion del proyecto. La licencia declarada es Apache 2.0.

Es importante subrayar que este repositorio no contiene pesos entrenados. Se trata de un conjunto de material de guia y scripts: `FINETUNING.md` (guia de datos, entrenamiento, evaluacion de WER y exportacion a ONNX), `scripts/finetune_whisper.py` (script de ajuste fino con Seq2SeqTrainer), `scripts/eval_wer.py` (evaluacion de WER/CER), `data/sample.jsonl` (ejemplo de formato de datos) y `requirements.txt`. El propio autor declara que los scripts son "un punto de partida no probado" y que no se publican pesos.

Su relevancia actual es, por tanto, la de una plantilla reproducible para quien quiera construir un sistema ASR bilingue bengalí-inglés sobre Whisper, en un contexto en el que los recursos de voz en bengalí son escasos y en el que las alternativas comerciales no cubren bien este idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (heredada de `openai/whisper-small`) |
| Parametros totales | 244 millones (corresponden al modelo base `whisper-small`; el repositorio no publica pesos propios) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (1500 frames de mel-espectrograma) por defecto en Whisper; no disponible un valor especifico del ajuste |
| Tipos de cuantizacion | no disponible en el repositorio; la guia menciona exportacion a ONNX, y Whisper admite cuantizacion int8/GGUF mediante herramientas de la comunidad |
| Idiomas soportados | Bengalí (bn) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No se publican pesos. El modelo base `openai/whisper-small` se distribuye en safetensors; la guia contempla exportacion a ONNX |

## Arquitectura y entrenamiento

La arquitectura es la de `openai/whisper-small`: un transformer encoder-decoder entrenado sobre espectrogramas log-mel de 80 canales, con 12 capas en el encoder y 12 en el decoder, `d_model` de 768 y 12 cabezas de atencion. Whisper procesa audio en fragmentos de 30 segundos y realiza la transcripcion de forma autoregresiva, con tokens especiales que controlan el idioma y la tarea (transcripcion o traduccion). El modelo base es multilingue, aunque este proyecto lo orienta especificamente a bengalí e inglés.

En cuanto al entrenamiento de este ajuste, el repositorio no proporciona detalles ejecutados: no hay numero de tokens, composicion del dataset, ni confirmacion de si se aplico RLHF o DPO (en ASR estos metodos no son habituales; el ajuste tipico es supervisado con pares audio-transcripcion). Lo que si ofrece es la infraestructura prevista, basada en `Seq2SeqTrainer` de Hugging Face Transformers, un script de evaluacion de WER/CER y un ejemplo del formato de datos esperado (`data/sample.jsonl`). No se documentan innovaciones tecnicas propias; el valor esta en el flujo de trabajo reproducible propuesto (entrenamiento, evaluacion y exportacion a ONNX).

## Capacidades

- Transcripcion de voz a texto en bengalí e inglés (objetivo del ajuste).
- Procesamiento de audio en fragmentos de 30 segundos, con manejo de audio mas largo mediante segmentacion (comportamiento estandar de Whisper).
- Soporte de tarea de traduccion de voz (speech translation) heredado del modelo base, aunque el proyecto se centra en transcripcion.
- Evaluacion de calidad mediante calculo de WER y CER a traves de `scripts/eval_wer.py`.
- Exportacion a ONNX contemplada en la guia para despliegue en entornos sin PyTorch.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso, ya que es un modelo exclusivamente de ASR.
- No se documentan capacidades de vision ni de audio mas alla de la transcripcion.

## Casos de uso

- Subtitulado automatico de contenido audiovisual en bengalí: el modelo, una vez ajustado, podria generar transcripciones y subtitulos para videos, podcasts o material educativo en bengalí, un idioma con pocos recursos ASR de calidad.
- Accesibilidad para personas con discapacidad auditiva: dentro del proyecto Drishti, serviria para convertir voz en texto en tiempo casi real, facilitando el acceso a reuniones, clases o medios.
- Asistentes de voz bilingues bengalí-inglés: al cubrir ambos idiomas, permitiria construir interfaces de voz que alternen entre las dos lenguas, frecuente en comunidades bengaloparlantes con presencia del ingles.
- Transcripcion de reuniones y notas de voz: integrado en herramientas de productividad, transcribiria grabaciones para generar actas o resumenes (el resumen requeriria un modelo de lenguaje aparte).
- Digitalizacion de archivos de audio historicos o entrevistas: util para investigacion cualitativa, periodismo o archivos orales que necesiten texto buscable.
- Base para pipelines de voz en produccion: la exportacion a ONNX mencionada permitiria desplegar la inferencia en entornos de bajos recursos o en el edge, sin depender de PyTorch.
- Punto de partida para equipos que quieran replicar o mejorar el ajuste: al incluir script de entrenamiento y evaluacion, sirve como plantilla educativa para construir ASR en idiomas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye pesos entrenados ni cifras de WER/CER; unicamente proporciona un script (`scripts/eval_wer.py`) para calcular estas metricas una vez el ajuste se haya realizado.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB en fp16 para `whisper-small` (244 M de parametros), y menos de 1 GB con cuantizacion int8.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, GTX 1660, etc.); para lotes grandes o despliegue escalado se usarian A100, H100 o L40S.
- Si cabe en GPU consumer: si, `whisper-small` se ejecuta comodamente en GPUs con 4-6 GB de VRAM e incluso en CPU para uso no intensivo.
- Opciones de despliegue: Transformers (PyTorch), ONNX Runtime (contemplado en la guia), y alternativas de la comunidad como `faster-whisper` (CTranslate2), `whisper.cpp` o vLLM/whisper para servidores de alta concurrencia.
- Latencia y throughput estimados: no disponible, ya que depende del hardware, la cuantizacion y la longitud del audio; no hay mediciones publicadas en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finetuned-bangla-whisper-small (este repo) | 244 M (base) | 30 s por ventana | bn, en | Apache 2.0 | Sin pesos publicados; solo scripts y guia |
| openai/whisper-small | 244 M | 30 s por ventana | multilingue (99 idiomas) | Apache 2.0 | Pesos publicos en safetensors y conversions GGUF |
| openai/whisper-medium | 769 M | 30 s por ventana | multilingue (99 idiomas) | Apache 2.0 | Pesos publicos; mayor precision, mas VRAM |
| openai/whisper-large-v3 | 1550 M | 30 s por ventana | multilingue (99 idiomas) | Apache 2.0 | Pesos publicos; maxima precision, mayor coste |

No se dispone de comparativas de rendimiento en bengalí dentro de la informacion proporcionada, ya que este repositorio no publica resultados propios. Como referencia general, en el ecosistema ASR existen ajustes especificos de Whisper para bengalí publicados por otras comunidades, pero no se incluyen datos verificables en este material.

## Limitaciones y advertencias

- No se publican pesos: el repositorio es una plantilla de codigo y guia, no un modelo listo para usar. Cualquier uso en produccion exige entrenar primero.
- Los scripts estan declarados por el propio autor como "un punto de partida no probado"; pueden contener errores y no han sido validados.
- Riesgo de alucinacion: los modelos Whisper tienden a generar texto plausible en silencios o audio ruidoso, especialmente con vocabulario fuera de dominio; es un fenomeno conocido que hay que mitigar con umbrales de confianza.
- Sesgos: al depender de datos de ajuste no especificados, existen riesgos de sesgo por dialecto, genero, edad o acento en bengalí, dado lo limitado de los corpus disponibles.
- Limitaciones de contexto: la ventana de 30 segundos obliga a segmentar audios largos, lo que puede fragmentar frases y degradar la puntuacion y coherencia en textos extensos.
- Rendimiento multilingue desequilibrado: el ingles del modelo base suele superar al bengalí en precisión, sobre todo si los datos de ajuste son escasos o poco representativos.
- Licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de licencia; al derivar de `openai/whisper-small`, se mantienen las condiciones de este.
- Caveat de produccion: sin datos de validacion no se puede garantizar una tasa de error aceptable; se recomienda evaluar WER/CER sobre un conjunto de prueba propio antes de desplegar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nafiullah/finetuned-bangla-whisper-small
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en GitHub: https://github.com/openai/whisper
- Documentacion de Whisper en Transformers: https://huggingface.co/docs/transformers/model_doc/whisper
- faster-whisper (CTranslate2): https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
