# PabloAndresE/simulst-es-en

## Resumen

`PabloAndresE/simulst-es-en` es un ajuste fino de `openai/whisper-small` para traduccion de voz espanol→ingles, disenado especificamente para operar en regimen de traduccion simultanea (streaming) y no solo sobre enunciados completos. Lo desarrolla Pablo Andres E. y se publica bajo licencia Apache 2.0 con pesos en safetensors compatibles con la libreria `transformers`.

El modelo parte de la arquitectura encoder-decoder transformer de Whisper (241,7 millones de parametros) y se entrena durante una sola epoca sobre el split es→en de CoVoST 2 (79.013 enunciados, 113,1 horas de audio). Su interes tecnico no esta en el resultado offline —donde la mejora sobre el modelo base es marginal (+0,70 BLEU)— sino en el comportamiento bajo decodificacion por prefijos, el escenario real de un sistema simultaneo: ahi la ganancia supera los 9 puntos de BLEU. Ademas, el ajuste calibra mucho mejor el token de no-habla, lo que facilita el filtrado de silencios y ruido en produccion.

Es relevante ahora porque la traduccion simultanea de voz con latencia baja es un caso de uso creciente (subtitulado en directo, reuniones multilingues, atencion al cliente en tiempo real) y porque demuestra que evaluar un checkpoint con metricas offline puede descartar precisamente los pesos que mejor funcionan en streaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventana de audio de 30 segundos (heredada de Whisper) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; los pesos son compatibles con las herramientas habituales de `transformers`) |
| Idiomas soportados | es (entrada de audio), en (salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | openai/whisper-small |
| Dataset de entrenamiento | fixie-ai/covost2 (es→en) |
| Tamano del repositorio | 1,0 GB |
| Tarea (`pipeline_tag`) | automatic-speech-recognition (con tarea `translate`) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura completa de Whisper-small: un encoder convolucional seguido de bloques transformer que procesa espectrogramas mel de 80 canales en ventanas de 30 segundos, y un decoder autoregresivo que genera tokens de texto condicionados por el audio y por tokens especiales de tarea e idioma (`<|translate|>`, `<|es|>`). No se modifica la topologia ni se anaden cabeceras; el ajuste es puramente de pesos.

El entrenamiento usa CoVoST 2 es→en (79.013 enunciados, 113,1 horas), una sola epoca, learning rate 1e-5 con scheduler OneCycle y 500 pasos de warmup, batch de 16 y precision AMP, sobre una unica GPU H200 en 12,8 minutos. El autor justifica la eleccion de una epoca con un argumento metodologico honesto: tres epocas puntuaron peor en validacion (35,82, 35,10 y 34,76) mientras la perdida de entrenamiento bajaba de 1,01 a 0,37, aunque reconoce que la comparacion no es limpia porque OneCycleLR reparte su decaimiento sobre el total configurado y la ejecucion de tres epocas seguia con learning rate alto en el punto equivalente a una epoca. La innovacion destacable no esta en el entrenamiento sino en el uso: el checkpoint se disena para integrarse con la politica de traduccion simultanea AlignAtt (Papi, Turchi y Negri, INTERSPEECH 2023), que decide cuando emitir tokens a partir de las alineaciones atencion audio-traduccion. Dos de las 79.015 filas de entrenamiento tenian cero bytes de audio y se omitieron.

## Capacidades

- Traduccion de voz espanol→ingles a partir de audio, en modalidad offline y en modalidad de streaming por prefijos.
- Reconocimiento de voz con salida en ingles (transcripcion traducida), ya que la tarea se configura como `translate` sobre entrada en espanol.
- Robustez a audio incompleto: el ajuste sobre enunciados completos mejora sustancialmente la decodificacion de prefijos parciales, que es lo que consume un sistema simultaneo.
- Calibracion del token `<|nocaptions|>`: puntua 0,0000 sobre habla real, frente a 0,09–0,45 del modelo base, lo que simplifica el filtrado de silencio y ruido de fondo.
- Integracion con la politica AlignAtt para decidir el momento de emision de cada token.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo especializado de voz, no un LLM de proposito general.
- Capacidades multilingues limitadas a la direccion es→en; no se documenta soporte de otras parejas.

## Casos de uso

- Subtitulado en directo de intervenciones en espanol hacia ingles: el modelo procesa prefijos de audio y la politica AlignAtt decide cuando comprometer cada token, lo que permite emitir subtitulos con latencia controlada en funcion del parametro `f` (por ejemplo `f=8` para baja latencia o `f=32` para mayor calidad).
- Traduccion simultanea en reuniones y videoconferencias: con ventanas de 30 segundos segmentadas y decodificacion por prefijos, puede alimentar una pista de audio traducida o subtitulos superpuestos en herramientas tipo Zoom o Teams.
- Atencion al cliente en tiempo real: para agentes que atienden en espanol a clientes angloparlantes, el modelo transcribe y traduce la conversacion al vuelo; su calibracion de no-habla evita que silencios o ruido se conviertan en texto espurio.
- Generacion de subtitulos para contenido audiovisual en espanol: sobre grabaciones completas (offline) alcanza 38,31 BLEU en prefijos y 35,45 BLEU en el split de test, adecuado para subtitulado no critico con revision humana.
- Investigacion en traduccion simultanea de voz: sirve como checkpoint de referencia para comparar politicas de emision (AlignAtt frente a alternativas) gracias a que el autor publica el codigo de evaluacion y el demo en vivo.
- Filtrado y segmentacion de audio en pipelines de ASR: el comportamiento del token `<|nocaptions|>` permite construir un detector de actividad vocal barato sobre el propio modelo, descartando segmentos sin habla antes de traducir.
- Prototipado rapido en entornos con recursos limitados: con 241,7 millones de parametros y pesos safetensors de 1 GB, se puede cargar en una GPU de consumo para pruebas de integracion antes de escalar a un sistema mayor.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de test de CoVoST 2 (13.221 enunciados, leidos una vez con el modelo congelado):

| Modelo | Test BLEU |
|---|---|
| `openai/whisper-small` zero-shot | 31,23 |
| Este checkpoint | 35,45 |

Evaluacion sobre prefijos de audio (escenario de streaming):

| Configuracion | Base | Este checkpoint | Ganancia |
|---|---|---|---|
| Offline | 37,61 | 38,31 | +0,70 |
| Prefijos, `f=8` | 13,21 | 22,68 | +9,47 |
| Prefijos, `f=16` | 19,04 | 27,96 | +8,92 |
| Prefijos, `f=32` | 24,12 | 33,49 | +9,37 |

El autor advierte explicitamente de que la comparacion con la literatura no es valida porque Whisper se preentrena con mucho mas audio que los sistemas entrenados desde cero. No se publican resultados de MMLU, HumanEval ni GSM8K, que no aplican a un modelo de voz.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): en torno a 1 GB para los pesos (241,7 M de parametros) mas el overhead de activaciones y del encoder de audio; en la practica, 2–3 GB son suficientes.
- En fp16/bf16 la huella de pesos baja a unos 0,5 GB; con cuantizacion de 8 bits o 4 bits (via herramientas de `transformers` o `bitsandbytes`) cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; el autor entreno en una H200, pero para inferencia no se requiere hardware de datacenter. Una RTX 3060, RTX 4060 o superior es suficiente.
- Cabe en GPU de consumo: si, incluidas GTX 1660, RTX 2060 y modelos integrados con suficiente memoria compartida en cuantizacion agresiva.
- Opciones de despliegue: `transformers` (via `WhisperForConditionalGeneration`), servidores compatibles con la API de `transformers` (el repo esta marcado como `endpoints_compatible`), y exportacion a otros runtimes de inferencia (ONNX, CTranslate2) mediante las herramientas habituales de conversion de Whisper; no se documenta soporte nativo en llama.cpp ni Ollama.
- Latencia y throughput: no se publican mediciones de latencia ni de throughput en la informacion disponible; el unico dato de rendimiento es el tiempo de entrenamiento (12,8 minutos en una H200).
- Nota de implementacion: para leer pesos de atencion hay que cargar con `attn_implementation="eager"`, porque el kernel SDPA por defecto devuelve una tupla `cross_attentions` vacia bajo `output_attentions=True` con un aviso en lugar de un error.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | BLEU es→en (CoVoST 2 test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint | 241,7 M | 30 s de audio | Traduccion de voz es→en, simultanea | 35,45 (offline), 22,68 con `f=8` | Apache 2.0 | HuggingFace |
| `openai/whisper-small` | 244 M | 30 s de audio | ASR y traduccion multilingue | 31,23 (zero-shot) | MIT | HuggingFace, ampliamente desplegado |
| `openai/whisper-medium` | 769 M | 30 s de audio | ASR y traduccion multilingue | no disponible en esta informacion | MIT | HuggingFace |
| Sistemas especializados de traduccion simultanea (p. ej. variantes de AlignAtt) | variable | variable | Traduccion simultanea de voz | no disponible en esta informacion | variable | publicaciones y repos de investigacion |

La comparacion directa con `whisper-small` es la mas informativa: mismo tamano y misma arquitectura, con una mejora de 4,22 BLEU en test offline y de hasta 9,47 BLEU en decodificacion por prefijos. Frente a `whisper-medium`, este checkpoint ofrece menor huella de memoria a costa de menor capacidad general; no se dispone de cifras comparativas de BLEU para ese modelo en la informacion proporcionada.

## Limitaciones y advertencias

- Solo habla leida: CoVoST 2 proviene de Common Voice, con frases preparadas leidas en voz alta, mayoritariamente por hablantes europeos. El habla espontanea, las disfluencias y los acentos latinoamericanos no estan evaluados.
- Vocabulario de dominio: en contextos clinicos, el autor documenta que *ensayos* se tradujo como "rehearsals" en lugar de "trials"; cabe esperar fallos similares en terminologia especializada.
- Una sola semilla de entrenamiento: no hay estimacion de varianza y ninguno de los resultados debe interpretarse como una afirmacion de significancia estadistica.
- Ventana de 30 segundos heredada de Whisper: el audio mas largo debe segmentarse, lo que anade complejidad al pipeline y puede degradar la coherencia entre segmentos.
- No se debe borrar `suppress_tokens`: muchas recetas de ajuste fino lo hacen, lo que es inofensivo al traducir enunciados completos, pero bajo una politica que compromete la salida de forma permanente el modelo emite `[Music]` sobre casi-silencio y ese token no se puede retirar.
- Riesgo de alucinacion en segmentos sin habla o con ruido: aunque la calibracion del token `<|nocaptions|>` mejora mucho respecto al modelo base, no se documenta una evaluacion sistematica de este comportamiento en produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `openai/whisper-small` (MIT) y del dataset CoVoST 2 (CC0 para el audio de Common Voice, con sus propias condiciones de uso).
- Alcance limitado a la direccion es→en: no es un modelo multilingue de proposito general ni admite otras parejas sin reentrenamiento.
- Sin datos de latencia ni throughput publicados: cualquier estimacion de rendimiento en produccion debe medirse en el hardware objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PabloAndresE/simulst-es-en
- Repositorio con la politica de streaming, demo en vivo y codigo de evaluacion: https://github.com/PabloAndresE/simulst-es-en
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset de entrenamiento: https://huggingface.co/datasets/fixie-ai/covost2
- Paper de AlignAtt (Papi, Turchi, Negri, INTERSPEECH 2023): no disponible en la informacion proporcionada (referencia bibliografica citada en la model card sin URL)
- Demo en vivo: enlazado desde el repositorio de GitHub; URL directa no disponible en la informacion proporcionada
