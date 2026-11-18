# alphaedge-ai/whisper-base-guj-16384

## Resumen

`alphaedge-ai/whisper-base-guj-16384` es una version recortada (trimming) de `openai/whisper-base` especializada en gujarati. El autor, alphaedge-ai, ha reducido el vocabulario del tokenizer de Whisper de 51.865 a 16.384 tokens mediante mineria sobre un corpus de 200.000 textos del dataset `lbourdois/fineweb-2-trimming`, eliminando los tokens que no se usan en gujarati. El resultado es un modelo un 25,02% mas pequeno en parametros (54,4 M frente a 72,6 M) y con un vocabulario un 68,41% mas reducido.

El modelo mantiene la arquitectura transformer encoder-decoder original de Whisper (publicada por OpenAI en 2022 en el paper *Robust Speech Recognition via Large-Scale Weak Supervision*) y reutiliza los pesos preentrenados del modelo base, de modo que la calidad esperada en gujarati es practicamente identica a la del original, pero con menor huella de memoria. Es relevante para despliegues de ASR en produccion en entornos con recursos limitados (CPU, edge, GPUs de gama baja) donde el modelo base completo resulta innecesariamente pesado.

El modelo es un fine-tune "por cirugia de vocabulario", no un reentrenamiento completo: no hay evidencia en la informacion disponible de entrenamiento adicional sobre audio en gujarati. Su utilidad esta vinculada al caso de uso concreto de transcripcion de audio en gujarati, y su licencia Apache 2.0 permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, Radford et al. 2022) |
| Parametros totales | 54.427.648 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (Whisper trabaja sobre ventanas de 30 s de audio; no aplica contexto textual en el sentido de LLM) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo no documenta versiones GGUF ni cuantizadas) |
| Idiomas soportados | gu (gujarati) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper base: encoder de audio que convierte el espectrograma mel de 80 canales en una secuencia de estados ocultos, y decoder autorregresivo que genera tokens de transcripcion. Con 54,4 M de parametros, es la variante "base" de la familia Whisper (la segunda mas pequena tras tiny). La innovacion respecto al original es la reduccion del vocabulario: se ha sustituido el tokenizer de 51.865 entradas por uno de 16.384, y se han recortado las matrices de embedding correspondientes manteniendo intactos el resto de pesos.

El proceso de trimming descrito en la model card utiliza 200.000 textos de `lbourdois/fineweb-2-trimming` para determinar que tokens son frecuentes en gujarati y conservarlos. No se indica en la informacion disponible que se haya realizado un fine-tune adicional sobre pares audio-texto en gujarati, ni que haya habido RLHF/DPO; se trata por tanto de una modificacion de vocabulario sobre el modelo preentrenado.

## Capacidades

- Reconocimiento automatico de voz (ASR) en gujarati, con salida de transcripcion en texto.
- Compatible con el pipeline `automatic-speech-recognition` de transformers y con `generate_kwargs={"language": "gujarati", "task": "transcribe"}`.
- Soporte de tareas de traduccion (task="translate") heredado de Whisper, aunque el modelo esta optimizado para gujarati y no se garantiza rendimiento en otros idiomas.
- Entrada de audio a 16 kHz (requisito de Whisper); se necesita resampleo previo si la fuente tiene otra frecuencia.
- No soporta tool calling ni function calling; no es un modelo de agentes ni de razonamiento multi-paso.
- No incluye capacidades de vision, audio generativo ni modo "thinking".
- Capacidad multilingue: limitada practicamente a gujarati; la model card advierte explicitamente que puede no funcionar bien en otros idiomas porque los tokens no usados en gujarati fueron eliminados.

## Casos de uso

- Transcripcion de reuniones y llamadas en gujarati: el modelo convierte audio de 30 s por ventana en texto con una huella de ~55 M de parametros, lo que permite desplegarlo en servidores modestos o incluso en CPU.
- Subtitulado automatico de contenido audiovisual en gujarati: util para medios locales o creadores que necesiten subtitulos en esta lengua sin depender de servicios en la nube.
- Atencion al cliente en gujarati: transcripcion de llamadas para generar registros escritos y alimentar analitica posterior, con coste de inferencia bajo gracias al tamano reducido.
- Documentacion clinica o administrativa dictada: transcripcion de notas de voz en gujarati en entornos con recursos limitados (consultorios, oficinas), donde el modelo base de 72 M resultaria sobredimensionado.
- Investigacion en ASR de bajos recursos: el modelo sirve como baseline ligero para comparar estrategias de trimming de vocabulario frente a fine-tuning completo en gujarati.
- Despliegue en edge o dispositivos con poca memoria: con unos 0,1 GB de repo y 54 M de parametros, es viable en Raspberry Pi o moviles con aceleracion adecuada, siempre que se acepte la latencia de un modelo base.
- Preprocesado de corpus de voz en gujarati: transcripcion masiva de audio para construir datasets de texto etiquetado a bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta la comparativa de tamano y vocabulario frente a `openai/whisper-base`:

| Metrica | Original | Trimmed | Reduccion |
|---|---|---|---|
| Tamano de vocabulario | 51.865 tokens | 16.384 tokens | 68,41% |
| Parametros del modelo | 72.593.920 | 54.427.648 | 25,02% |

No se aportan cifras de WER (word error rate) en gujarati ni comparaciones con otros modelos ASR.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamano (54 M de parametros en fp32, ~218 MB de pesos) cabe holgadamente en cualquier GPU consumer e incluso en CPU con memoria RAM minima.
- GPU recomendadas: cualquier GPU con >=2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo, pero funcionaran sin problema.
- Cabe en consumer GPU: si, en todas las gamas actuales; tambien es viable en CPU y en dispositivos edge.
- Opciones de despliegue: pipeline de `transformers` (documentado en la model card), servidores de inferencia compatibles con `transformers`, y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no documentado en el repo). Tambien se puede servir con TGI o vLLM si se anade soporte, aunque no se menciona explicitamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-base-guj-16384 | 54,4 M | ventanas de 30 s | gu | Apache 2.0 | Version trimmed, vocabulario 16.384 |
| openai/whisper-base | 72,6 M | ventanas de 30 s | multilingue (99 idiomas) | Apache 2.0 | Modelo original completo; mayor huella |
| openai/whisper-small | 244 M | ventanas de 30 s | multilingue | Apache 2.0 | Mas preciso pero ~4,5x mas grande |
| openai/whisper-tiny | 39 M | ventanas de 30 s | multilingue | Apache 2.0 | Mas pequeno pero peor calidad general |

No se dispone de datos de WER comparativos en la informacion proporcionada, por lo que la comparativa se limita a tamano, licencia y cobertura idiomatica.

## Limitaciones y advertencias

- Rendimiento degradado fuera de gujarati: el vocabulario reducido elimina tokens de otros idiomas, por lo que la model card advierte que puede no funcionar bien en lenguas distintas al gujarati.
- No se documenta un fine-tune sobre audio en gujarati: al ser un trimming del modelo base, la calidad depende del conocimiento multilingue original de Whisper y puede ser inferior a la de un modelo entrenado especificamente en gujarati.
- Riesgo de alucinacion en ASR: como todos los modelos Whisper, puede generar texto plausible en segmentos con silencio, ruido o audio ininteligible.
- Sesgos: no se documentan sesgos especificos, pero al derivar de Whisper hereda los sesgos del entrenamiento original (corpus web, posible sobrerrepresentacion de determinados registros y acentos).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset de mineria.
- Repo de 0,1 GB sin versiones cuantizadas publicadas: si se necesita GGUF o int8 habra que generarlas.
- Fecha de creacion futura en los metadatos (2026-05-29): conviene verificar la procedencia y vigencia del modelo antes de usarlo en produccion.
- Modelo con muy pocas descargas (54) y cero likes: senal de escasa validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-guj-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Dataset de mineria: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog de introduccion a trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
