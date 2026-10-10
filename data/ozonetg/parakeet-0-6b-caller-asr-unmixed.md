# ozonetg/parakeet-0.6b-caller-asr-unmixed

## Resumen

parakeet-0.6b-caller-asr-unmixed es un ajuste fino (fine-tune) del modelo nvidia/parakeet-unified-en-0.6b de NVIDIA, especializado en el reconocimiento de voz del lado del cliente (caller) en llamadas telefónicas de 8 kHz en ingles estadounidense. Lo publica el usuario ozonetg y su objetivo es la transcripcion en entornos de centro de llamadas y ventas salientes, donde el audio es de banda estrecha (narrowband), mono y con ruido de linea. Se trata del modelo detras de la variante "blended" recomendada, pero sin mezclar: son los pesos del receta pura 0.6B con un decaimiento del learning rate capa a capa.

Arquitectonicamente es un encoder FastConformer de 24 capas con un decoder RNN-T, con 618,3 M de parametros en total. El modelo base es un modelo unificado (offline y streaming) entrenado originalmente por NVIDIA; este fine-tune lo adapta a dominios conversacionales telefonicos. La salida incluye puntuacion y mayusculas, y la decodificacion empleada en las evaluaciones es RNN-T greedy.

Es relevante ahora porque demuestra como un fine-tune ligero (menos de 700 M de parametros) puede superar de forma clara a sistemas previos mas pequenos con adaptadores de dominio en tareas de ASR telefonico: reduce el WER agregado en cinco conjuntos publicos de telefonia del 14,00 % de un sistema de 110 M con adaptador al 9,84 %, y del 11,80 % del base sin tocar al 9,84 %. Todo el modelo pesa alrededor de 1,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer (24 capas) con decoder RNN-T; el base es un unificado offline + streaming |
| Parametros totales | 618,3 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo ASR); segmentos de audio de 0,3 a 20 s en entrenamiento |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en (ingles estadounidense, telefonia) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | .nemo (bfloat16) |
| Entrada de audio | mono 16 kHz float; se alimenta audio telefonico de 8 kHz remuestreado a 16 kHz |
| Salida | texto en ingles con puntuacion y mayusculas |
| Decodificacion | RNN-T greedy |
| Framework | NeMo 3.0 (el modelo base no compila en NeMo 2.5.x) |

## Arquitectura y entrenamiento

El modelo es un encoder FastConformer de 24 capas y 618,3 M de parametros acoplado a un decoder RNN-T. Hereda del base la capacidad de operar en modo unificado offline y streaming. El fine-tune se realizo con una receta de decaimiento del learning rate capa a capa: la tasa de aprendizaje de cada capa del encoder se escala por un factor de 0,9 por capa por debajo de la superior, de modo que la capa mas baja entrena a aproximadamente 0,08 veces la tasa de la capa superior. Esto preserva las capas acusticas mas genericas y adapta preferentemente las capas altas al dominio telefonico.

Los datos de entrenamiento son el canal del cliente (customer) de llamadas de ventas salientes en ingles estadounidense, grabadas entre 2025 y 2026, en cinco fuentes internas de grabaciones, a 8 kHz mono. El split de entrenamiento contiene 504.617 segmentos (345,5 horas) de entre 0,3 y 20 segundos. Un 5 % de los segmentos son no-habla (ruido de linea, silencio, espera, respiracion) con etiqueta vacia, para ensenar al modelo a permanecer en silencio, y aproximadamente un 1 % son saludos de buzon de voz o mensajes IVR captados en la linea del cliente. Las etiquetas son transcripciones automaticas generadas con Qwen3-ASR-1.7B, sin transcripcion humana; cada segmento se verifico frente a sistemas ASR independientes y aquellos en los que coincidieron se consideran de nivel 1. Los pesos publicados son los anteriores a la mezcla: la variante "blended" parakeet-0.6b-caller-asr corresponde a 0,8 veces estos pesos mas 0,2 veces el base sin tocar.

## Capacidades

- Reconocimiento de voz (ASR) en ingles estadounidense sobre audio telefonico de 8 kHz (banda estrecha).
- Transcripcion de conversaciones de centro de llamadas y llamadas de ventas salientes (lado del cliente).
- Salida con puntuacion y mayusculas.
- Manejo de silencios, ruido de linea, esperas y respiraciones sin emitir texto (segmentos no-habla con etiqueta vacia).
- Deteccion de contenido de buzon de voz y mensajes IVR presentes en la linea del cliente (aproximadamente un 1 % del entrenamiento).
- Modo unificado offline y streaming heredado del modelo base.
- Capacidad de adaptacion a distintos conjuntos de telefonia publica (Switchboard, CallHome, CallFriend, HarperValley, Lets Go, entre otros).
- Tool calling / function calling: no aplica (es un modelo ASR, no un modelo de lenguaje generativo).
- Capacidades de agente o razonamiento multi-paso: no aplica.
- Capacidades multilingues: no, solo ingles.
- Vision o audio mas alla del ASR: no disponible (solo transcripcion de habla).

## Casos de uso

- Transcripcion de llamadas de ventas salientes: el modelo esta entrenado especificamente sobre el canal del cliente en llamadas de ventas, por lo que transcribe de forma fiable las conversaciones y reduce el WER en dominios internos hasta el 1,98 % en llamadas reservadas in-domain.
- Analitica de centro de llamadas: al procesar el audio real de las llamadas, permite generar transcripciones con puntuacion (WER del 4,02 % en el canal del cliente de HarperValley Bank) utiles para analisis de sentimiento, deteccion de intenciones y control de calidad.
- Cumplimiento normativo y auditoria de grabaciones: la transcripcion automatica de conversaciones telefonicas facilita la revision posterior y el archivo indexado de llamadas, con un modelo ligero que se puede ejecutar on-premise.
- Deteccion de buzones de voz e IVR: los segmentos etiquetados de saludos de buzon e IVR permiten clasificar automaticamente cuando la llamada no la ha atendido una persona, alimentando sistemas de enrutamiento.
- Automatizacion de resumenes post-llamada: la transcripcion con puntuacion y mayusculas sirve como entrada a un LLM posterior para generar resumentes y notas de CRM.
- Despliegue on-premise o en el borde: con 618,3 M de parametros y pesos en bfloat16 (aproximadamente 1,2 GB), el modelo cabe en hardware modesto, lo que permite desplegarlo en instalaciones propias o en entornos con restricciones de privacidad de datos.
- Investigacion en ASR telefonico: sirve como punto de referencia para comparar recetas de fine-tune con decaimiento del learning rate capa a capa frente a la mezcla de pesos y frente al modelo base.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (metricas no verificadas; decodificacion RNN-T greedy):

| Conjunto de evaluacion | WER (%) |
|---|---|
| LibriSpeech test-clean (8 kHz) | 1,77 |
| LibriSpeech test-other (8 kHz) | 3,71 |
| LibriSpeech test-clean | 1,64 |
| LibriSpeech test-other | 3,27 |
| CallHome English (test) | 10,53 |
| CallFriend English (dev) | 16,27 |
| HarperValley Bank (canal del cliente) | 4,02 |
| Lets Go (referencias re-transcritas) | 17,01 |
| AppTek call-center dialogues, clientes de EE. UU. (test) | 7,23 |
| Switchboard (subconjunto de 3.000 emisiones) | 7,97 |
| Promedio conjunto de cinco sets publicos de telefonia | 9,84 |
| Llamadas reservadas in-domain | 1,98 |

Comparativa declarada por el autor frente al modelo base y al sistema previo:

| Sistema | WER (%) pooled telefonia | WER (%) reservado in-domain | LibriSpeech test-other (8 kHz) (%) |
|---|---|---|---|
| parakeet-0.6b-caller-asr-unmixed | 9,84 | 1,98 | 3,71 |
| Base nvidia/parakeet-unified-en-0.6b sin tocar | 11,80 | 4,73 | 3,56 |
| Sistema previo (stock 110 M + adaptador de dominio) | 14,00 | 8,68 | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en bfloat16 para los pesos; con activaciones y buffers de audio, cabe holgadamente en GPUs de 4 GB o menos.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; para despliegues de alto rendimiento, GPUs de centro de datos como A100 o H100 permiten servir muchas sesiones concurrentes.
- Cabe en GPU de consumo: si; por ejemplo, RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o mas, sin necesidad de cuantizacion.
- Opciones de despliegue: NeMo 3.0 (requisito, el modelo base no compila en NeMo 2.5.x). El ecosistema de la familia Parakeet incluye despliegue con NVIDIA Riva y exportacion a ONNX Runtime (usado en servidores compatibles con la API de OpenAI Whisper como achetronic/parakeet para variantes TDT de 0.6B).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER comparable | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parakeet-0.6b-caller-asr-unmixed | 618,3 M | 8 kHz telefonia (ingles) | 9,84 % pooled telefonia; 1,98 % in-domain | NVIDIA Open Model License | HuggingFace |
| nvidia/parakeet-unified-en-0.6b (base) | 618 M aprox. | unificado offline + streaming (ingles) | 11,80 % pooled telefonia; 4,73 % in-domain | NVIDIA Open Model License | HuggingFace |
| nvidia/parakeet-rnnt-0.6b | 0,6 B | ingles | no disponible en la informacion proporcionada (WER greedy sin LM externo) | no disponible | HuggingFace |
| nvidia/parakeet-tdt-0.6b-v2 | 0,6 B | ingles, con puntuacion y timestamps | no disponible en la informacion proporcionada | no disponible | NVIDIA NIM / HuggingFace |

## Limitaciones y advertencias

- Solo soporta ingles; no realiza reconocimiento multilingue.
- Esta especializado en audio telefonico de banda estrecha (8 kHz) y en el canal del cliente; su rendimiento fuera de ese dominio puede degradarse (por ejemplo, WER del 17,01 % en Lets Go o del 16,27 % en CallFriend, frente a valores mucho mas bajos in-domain).
- Las etiquetas de entrenamiento son transcripciones automaticas generadas con Qwen3-ASR-1.7B y no han sido revisadas por humanos; los errores sistematicos del sistema de etiquetado pueden propagarse al modelo.
- Los datos de entrenamiento provienen de cinco fuentes internas de grabaciones de ventas salientes entre 2025 y 2026, lo que puede introducir sesgos hacia ese tipo de conversacion, acento o canal telefonico concreto.
- Riesgo de alucinacion o de transcripciones incorrectas en audio con ruido, solapamiento de voces o acentos no representados en los datos.
- La licencia (NVIDIA Open Model License) debe revisarse antes de un uso comercial; esta etiquetada como "other" y no como una licencia permisiva estandar.
- Requiere NeMo 3.0; el modelo base no compila en NeMo 2.5.x, lo que condiciona el entorno de produccion.
- Los resultados de benchmarks estan declarados por el autor y marcados como no verificados; deben contrastarse antes de decisiones criticas.
- Al ser un modelo de 618,3 M de parametros entrenado sobre 345,5 horas, su cobertura acustica es limitada en comparacion con sistemas de mayor tamano o con datos mas diversos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ozonetg/parakeet-0.6b-caller-asr-unmixed
- Modelo base: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Variante "blended" del mismo autor: https://huggingface.co/ozonetg/parakeet-0.6b-caller-asr
- Variante con audio adicional: https://huggingface.co/ozonetg/parakeet-0.6b-caller-asr-extra-audio
- nvidia/parakeet-rnnt-0.6b: https://huggingface.co/nvidia/parakeet-rnnt-0.6b
- Servidor ASR compatible con OpenAI Whisper (achetronic/parakeet, ONNX Runtime): https://github.com/achetronic/parakeet/tree/master
- NVIDIA NIM parakeet-tdt-0.6b-v2: https://build.nvidia.com/nvidia/parakeet-tdt-0_6b-v2
- Analisis de Parakeet TDT 0.6B v3: https://aiindigo.com/blog/parakeet-tdt-0-6b-v3-review-pragmatic-asr-for-the-local-era
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
