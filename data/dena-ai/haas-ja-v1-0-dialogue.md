# dena-ai/Haas-ja-v1.0-dialogue

## Resumen

Haas-ja-v1.0-dialogue es un modelo de reconocimiento automatico del habla (ASR) para japones, desarrollado por dena-ai mediante ajuste fino del modelo base third-intelligence/Haas-ja-v1.0. Su proposito es mejorar la transcripcion en escenarios de dialogo hablado, un dominio donde los ASR genericos suelen fallar: audio sin habla que provoca alucinaciones, interjecciones conversacionales (backchannels como «うーん» o «ええ») que se normalizan incorrectamente y numeros dictados por hablantes reales que se transcriben mal.

El modelo conserva la arquitectura del original (FastConformer con decodificador TDT, empaquetado para NeMo), por lo que las necesidades de computo y el flujo de uso son identicos al modelo base. El ajuste se centro en tres objetivos concretos: devolver cadena vacia ante audio que solo contiene ruido, preservar las interjecciones tal como se pronuncian y mejorar la precision en numeros y frases conversacionales.

Es relevante para equipos que construyen asistentes de voz, sistemas de subtitulado de conversaciones o pipelines de analisis de llamadas en japones, donde la distincion entre acuerdo («うん») y duda («うーん») o la supresion de respuestas ante silencio son requisitos funcionales, no meros detalles de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer), empaquetado para NeMo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por utterance) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | .nemo (checkpoint NeMo); tamano del repo 2,5 GB |

## Arquitectura y entrenamiento

El modelo mantiene sin cambios la arquitectura del base: un encoder FastConformer (variante eficiente de Conformer con atencion por bloques) acoplado a un decodificador TDT, que predice conjuntamente tokens y duraciones para reducir el numero de pasos de decodificacion. El paquete haas-asr registra la clase de red de prediccion en NeMo y depende de flash-linear-attention, lo que exige Linux y GPU NVIDIA. Al no modificarse la topologia, la latencia y el consumo son equivalentes a los del modelo original.

El ajuste fino uso aproximadamente 94.000 enunciados (169 horas) con cuatro componentes: interjecciones sinteticas para preservar backchannels, Common Voice v27 para mantener precision en habla real, el split de entrenamiento de FLEURS para habla leida y un 10 % de audio solo-ruido con referencia vacia para ensenar al modelo a no emitir texto. El habla sintetica se genero con Irodori TTS v4.1-Small a partir de descripciones textuales, no de grabaciones de personas reales; los ruidos se extrajeron de 14 tipos de DEMAND no usados en evaluacion y de MUSAN. Se excluyeron los hablantes y frases del test de Common Voice. El entrenamiento se ejecuto en A100 con lotes de 400 s de audio, learning rate 5e-5, bf16, 6.088 pasos (4 epocas) y promedio de los ultimos 4 checkpoints.

## Capacidades

- Transcripcion de voz a texto en japones para habla espontanea y conversacional.
- Supresion de alucinaciones: devuelve cadena vacia ante audio que solo contiene ruido (0 alucinaciones en 40 clips de prueba frente a 6 del modelo original).
- Preservacion de interjecciones conversacionales («うーん», «ええ», «うん») tal como se pronuncian, sin normalizarlas.
- Mejora en la transcripcion de numeros dictados por hablantes reales (CER del 1,3 % frente al 24,1 % del original en el conjunto de numeros).
- Mayor precision en frases conversacionales sinteticas (CER del 0,6 % frente al 1,3 %).
- Integracion con NeMo mediante la libreria haas-asr y la API `ASRModel.restore_from` / `transcribe`.
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla del propio ASR.

## Casos de uso

- Asistentes de voz para atencion al cliente en japones: el modelo evita responder cuando el audio solo contiene ruido ambiente, lo que elimina activaciones falsas en conversaciones telefonicas o de mostrador.
- Subtitulado de reuniones y llamadas: la preservacion de interjecciones y la mejora en frases conversacionales permiten generar transcripciones fieles al registro oral, utiles para actas y analisis posterior.
- Analisis de calidad de conversaciones (contact centers): la distincion entre acuerdo y duda en las interjecciones aporta senal sobre la actitud del cliente que un ASR normalizador perderia.
- Dictado de datos numericos: con un CER del 1,3 % en numeros de hablantes reales, es adecuado para captura de cifras en entornos de back office o verificacion de pedidos.
- Pipelines de ASR con VAD previo: el modelo esta evaluado detras de Silero VAD y mantiene buen rendimiento en FLEURS con ruido a SNR de 20 a 0 dB, lo que encaja en arquitecturas por turnos.
- Investigacion en habla conversacional japonesa: sirve como punto de partida para experimentos de ajuste fino adicional con datos propios, dado que la licencia Apache 2.0 permite modificacion y redistribucion.
- Transcripcion de habla leida: mantiene CER del 2,1 % en FLEURS, por lo que tambien es valido para audiolibros, noticias o material formativo.

## Benchmarks y rendimiento

CER de lectura (%, menor es mejor) y alucinaciones en 40 clips solo-ruido, ambos tras Silero VAD:

| Conjunto de prueba | Enunciados | Original | Este modelo |
|---|---|---|---|
| Alucinaciones en audio solo-ruido | 40 | 6 | 0 |
| Common Voice | 300 | 1,0 | 1,1 |
| FLEURS | 300 | 2,2 | 2,1 |
| ReazonSpeech (referencia) | 300 | 5,9 | 7,0 |
| Backchannels (sinteticos) | 768 | 35,3 | 33,4 |
| Frases conversacionales (sinteticas) | 720 | 1,3 | 0,6 |
| FLEURS con ruido | 1.700 | 2,3 | 2,4 |

Enunciados cortos de hablantes reales (Common Voice, sin VAD):

| Conjunto de prueba | Original | Este modelo |
|---|---|---|
| Backchannels | 32,4 | 18,9 |
| Numeros | 24,1 | 1,3 |

Con voces sinteticas no vistas en entrenamiento, las interjecciones aisladas «うーん» y «ええ» transcritas erroneamente como «うん» bajaron de 23 a 1 y de 14 a 0 sobre 48 casos cada una. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, al no ser aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint ocupa 2,5 GB, por lo que la huella en GPU es del orden de pocos GB en bf16.
- GPU recomendadas: NVIDIA con soporte CUDA; el entrenamiento se realizo en A100.
- Requisito de plataforma: Linux y GPU NVIDIA obligatorios por la dependencia de flash-linear-attention.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; previsiblemente viable en RTX 3090/4090 si flash-linear-attention compila para la arquitectura, pero no esta documentado.
- Opciones de despliegue: NeMo con la libreria haas-asr (`ASRModel.restore_from` y `transcribe`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el autor indica que son identicos a los del modelo base al no cambiar la arquitectura.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| dena-ai/Haas-ja-v1.0-dialogue | ASR FastConformer + TDT | ja | no disponible | Apache 2.0 | Ajustado para dialogo; 0 alucinaciones en ruido |
| third-intelligence/Haas-ja-v1.0 | ASR FastConformer + TDT | ja | no disponible | Apache 2.0 | Modelo base; mejor CER en ReazonSpeech (5,9 frente a 7,0) |
| Whisper (variantes de OpenAI) | ASR encoder-decoder | multilingue | 30 s por ventana | MIT | Referencia generica; no disponible comparacion numerica en la informacion proporcionada |
| ReazonSpeech | ASR especifico para japones | ja | no disponible | no disponible | Usado como referencia de evaluacion en la model card |

## Limitaciones y advertencias

- Las transcripciones contienen errores; en usos medicos, legales o contractuales debe haber revision humana.
- El CER en ReazonSpeech empeora respecto al modelo base (7,0 frente a 5,9), aunque las referencias de ese corpus omiten disfluencias y el dato es solo orientativo.
- El rendimiento en FLEURS con ruido es ligeramente inferior al original (2,4 frente a 2,3) y en Common Voice tambien (1,1 frente a 1,0).
- Solo soporta japones; no hay capacidades multilingues documentadas.
- Requiere Linux y GPU NVIDIA; no es desplegable en CPU ni en macOS segun la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero se prohibe cualquier uso que viole leyes o derechos de terceros.
- No se documentan sesgos especificos; el habla sintetica de entrenamiento se genero desde descripciones textuales, no desde grabaciones de personas reales.
- El modelo esta pensado para funcionar tras un VAD (evaluado con Silero VAD); su comportamiento sin VAD en audio largo no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dena-ai/Haas-ja-v1.0-dialogue
- README en japones: https://huggingface.co/dena-ai/Haas-ja-v1.0-dialogue/blob/main/README_JA.md
- Modelo base: https://huggingface.co/third-intelligence/Haas-ja-v1.0
- Blog de dena-ai sobre el ajuste fino: https://engineering.dena.com/blog/2026/11/asr-finetuning-voice-dialogue/
- Libreria haas-asr: https://github.com/third-intelligence/Haas-ASR
- flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Silero VAD: https://github.com/snakers4/silero-vad
- Common Voice japones: https://commonvoice.mozilla.org/ja
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- DEMAND (ruido): https://zenodo.org/records/1227121
- MUSAN (ruido): https://www.openslr.org/17/
- Irodori TTS v4.1-Small: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
