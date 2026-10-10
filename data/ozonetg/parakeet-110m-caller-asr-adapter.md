# ozonetg/parakeet-110m-caller-asr-adapter

# Parakeet 110M caller ASR adapter

## Resumen

El modelo `ozonetg/parakeet-110m-caller-asr-adapter` es un ajuste fino (fine-tune) del modelo de reconocimiento automatico del habla (ASR) `nvidia/parakeet-tdt_ctc-110m` de NVIDIA, especializado en la transcripcion del lado del interlocutor (caller, es decir, el cliente) en llamadas telefonicas de 8 kHz en ingles de Estados Unidos. Lo desarrolla el usuario ozonetg y su proposito es mejorar la precision de transcripcion en audio telefonico de banda estrecha procedente de llamadas reales de venta saliente, un dominio donde los modelos ASR genericos pierden precision por el ruido, la compresion y el ancho de banda reducido. El modelo es relevante porque demuestra que con solo 2.2 M de parametros adicionales (el 2 % del total) sobre una base congelada se puede reducir sustancialmente la tasa de error de palabra (WER) en produccion.

La arquitectura es un encoder FastConformer de 114.6 M de parametros con un decoder TDT (token-and-duration transducer) y una cabeza CTC auxiliar, sobre el que se anade un adaptador lineal denominado `call_audio` (512 → 128 → 512) en cada una de las 17 capas del encoder. El modelo pesa 116.9 M de parametros en total (114.6 M de base congelada mas 2.2 M de adaptador), trabaja con audio mono a 16 kHz (el audio telefonico de 8 kHz se reescala) y produce texto en ingles con puntuacion y mayusculas.

Frente a los conjuntos publicos de llamadas telefonicas agrupados, el WER es del 11.91 %, frente al 14.00 % del sistema empleado antes (la base con un adaptador de dominio previo) y el 14.58 % del modelo base sin tocar. En llamadas retenidas dentro del dominio alcanza un 3.80 %, frente al 8.68 % anterior y el 9.19 % de la base. Esta licenciado bajo CC BY 4.0 y se distribuye como checkpoint `.nemo` para el framework NeMo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) con decoder TDT (token-and-duration transducer) y cabeza CTC auxiliar; adaptador lineal `call_audio` (512 → 128 → 512) en cada una de las 17 capas del encoder |
| Parametros totales | 116.9 M (114.6 M base congelada + 2.2 M adaptador) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | segmentos de audio de 0.3 a 20 s; audio mono 16 kHz (audio telefonico de 8 kHz reescalado a 16 kHz) |
| Tipos de cuantizacion | no disponible (los pesos se publican en float32) |
| Idiomas soportados | ingles (en), ingles de Estados Unidos |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.nemo` (fichero `parakeet-110m-caller-asr-adapter.nemo`, float32); volumen del repositorio 0.5 GB |

## Arquitectura y entrenamiento

El modelo parte de los pesos de `nvidia/parakeet-tdt_ctc-110m`, que se mantienen congelados e inalterados. Sobre esa base se inserta un adaptador lineal llamado `call_audio` (dimensiones 512 → 128 → 512, con activacion swish, pre-norm y conexion residual) en cada una de las 17 capas del encoder, y unicamente esos adaptadores se entrenan: 68 tensores y 2.2 M de parametros, aproximadamente el 2 % del modelo. La tasa de aprendizaje es 1e-3 con 500 pasos de warm-up, mas alta que la habitual (1e-4) porque solo aprende el adaptador. La decodificacion empleada en todos los resultados es greedy TDT. El adaptador se almacena dentro del fichero `.nemo` y se reconstruye y habilita mediante `restore_from`. El framework usado es NeMo 2.5.3 (otras versiones no estan probadas).

En cuanto a los datos, el entrenamiento usa el lado del interlocutor (cliente) de llamadas telefonicas de venta saliente en Estados Unidos, en mono a 8 kHz, procedentes de cinco fuentes internas de grabaciones de 2025-2026. Los segmentos van de 0.3 a 20 s. El split de entrenamiento contiene 504.617 segmentos (345,5 h); el 5 % son segmentos no hablados (ruido de linea, silencio, espera, respiracion) con objetivo vacio, lo que ensena al modelo a permanecer en silencio, y cerca del 1 % son saludos de buzon de voz o mensajes de IVR. El mismo mecanismo de adaptador se empleo en la linea base anterior, que anade un adaptador previo a la base de 110 M, por lo que encaja en configuraciones que ya cargan un modelo base mas un adaptador. Existe una variante con fine-tuning completo (`ozonetg/parakeet-110m-caller-asr-basic`) que es mas precisa.

## Capacidades

- Reconocimiento automatico del haba (ASR) de audio telefonico de banda estrecha (8 kHz) en ingles de Estados Unidos.
- Transcripcion del canal del cliente (caller) en llamadas reales de venta saliente.
- Salida de texto en ingles con puntuacion y mayusculas.
- Deteccion implicita de segmentos no hablados: al haberse entrenado con objetivos vacios en ruido de linea, silencio, espera y respiracion, tiende a no transcribir esos tramos.
- Manejo de audio con ruido telefonico, compresion y condiciones de banda estrecha.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente acustico de transcripcion).
- No dispone de capacidades de vision, audio-vision ni generacion de texto generativo.
- Capacidad multilingue: no, solo ingles.
- No dispone de modo "thinking" ni de mecanismos de razonamiento explicito.

## Casos de uso

- Transcripcion de llamadas de call center: el modelo convierte el canal del cliente en texto con puntuacion y mayusculas, adecuado para generar transcripciones de calidad en centros de atencion o ventas telefonicas en ingles de EE. UU.
- Analitica de conversaciones de venta: al transcribir el lado del cliente, se pueden extraer palabras clave, objeciones y senales de intencion de compra para alimentar paneles de analitica comercial.
- Control de calidad y cumplimiento: las transcripciones permiten auditar llamadas y verificar el cumplimiento de guiones y politicas, aprovechando que el modelo esta ajustado al dominio y reduce el WER en llamadas reales (11.91 % en conjuntos publicos agrupados y 3.80 % en llamadas retenidas del dominio).
- Subtitulado y post-procesado de grabaciones de ventas: el modelo entrega texto con puntuacion y mayusculas, listo para indexacion o busqueda posterior en repositorios de grabaciones de 2025-2026.
- Analisis de sentimiento y resumen posterior: las transcripciones sirven como entrada a modelos de lenguaje para detectar sentimiento, temas o resumir conversaciones.
- Despliegue ligero en infraestructura modesta: con 116.9 M de parametros y un adaptador de 2.2 M, se puede ejecutar en CPU o en GPU de gama baja dentro de un pipeline NeMo, lo que abarata la inferencia a escala sobre grandes volumenes de llamadas.
- Investigacion sobre adaptadores eficientes: sirve como ejemplo reproducible de como anadir adaptadores lineales por capa a una base congelada y obtener mejoras de WER sin reentrenar el modelo completo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. Salvo donde se indica, las cifras corresponden a decodificacion greedy TDT. Los valores estan marcados como no verificados (`verified: false`).

| Conjunto de datos | WER (%) |
|---|---|
| LibriSpeech test-clean (8 kHz) | 3.10 |
| LibriSpeech test-other (8 kHz) | 7.13 |
| LibriSpeech test-clean | 2.73 |
| LibriSpeech test-other | 5.87 |
| CallHome English (test) | 12.66 |
| CallFriend English (dev) | 17.78 |
| HarperValley Bank (canal del cliente) | 5.69 |
| Let's Go (referencias reescritas a mano) | 24.82 |
| AppTek call-center dialogues, clientes de EE. UU. | 9.15 |
| Switchboard (subconjunto de 3.000 enunciados) | 7.75 |

Comparaciones declaradas por el autor (mismo protocolo):

| Escenario | Este adaptador | Sistema anterior (base + adaptador de dominio previo) | Base sin tocar |
|---|---|---|---|
| Cinco conjuntos publicos de llamadas (agrupados) | 11.91 % WER | 14.00 % WER | 14.58 % WER |
| Llamadas retenidas dentro del dominio | 3.80 % WER | 8.68 % WER | 9.19 % WER |
| LibriSpeech test-other a 8 kHz | 7.13 % WER | no disponible | 6.25 % WER |

En LibriSpeech test-other a 8 kHz el adaptador empeora en +0.88 puntos porcentuales respecto a su base (7.13 % frente a 6.25 %), lo que el autor reconoce como coste de la especializacion en el dominio telefonico.

## Requisitos de hardware

- VRAM estimada para inferencia: al publicarse en float32, 116.9 M de parametros ocupan aproximadamente 0.47 GB de pesos; en la practica el consumo de memoria es bajo y muy inferior a 1 GB para los pesos, con margen para el procesado de audio y los buffers del framework.
- GPU recomendadas: cualquier GPU moderna es suficiente. Una RTX 4090, una A100 o una H100 van sobradamente; el modelo esta pensado para ejecutarse incluso en hardware mucho mas modesto.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con al menos 1-2 GB de VRAM libre; tambien es viable en CPU y en sistemas embebidos, dado su tamano.
- Opciones de despliegue: NeMo 2.5.3 es el framework de referencia y el unico probado por el autor (otras versiones no estan testadas). El checkpoint se carga con `restore_from`, que reconstruye y habilita el adaptador. Existen motores de inferencia alternativos para la base Parakeet, como el motor nativo en C de `mynah-asr` (con soporte de streaming, marcas de tiempo a nivel de palabra y cuantizacion int8/int4 en CPU, Metal y CUDA), aunque no hay confirmacion de que soporten este adaptador concreto.
- Latencia y throughput: no se publican cifras de latencia ni de throughput en la informacion disponible.

## Comparativa con modelos similares

Solo se dispone de datos comparativos concretos frente al modelo base y las variantes de la misma familia. Para alternativas de otros autores la informacion disponible no incluye especificaciones ni resultados.

| Modelo | Parametros | Contexto / entrada | WER (conjuntos de llamadas agrupados) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ozonetg/parakeet-110m-caller-asr-adapter` | 116.9 M (114.6 M congelados + 2.2 M adaptador) | segmentos de 0.3-20 s, audio 8/16 kHz | 11.91 % (publicos) / 3.80 % (retenidos) | CC BY 4.0 | HuggingFace (formato `.nemo`) |
| `nvidia/parakeet-tdt_ctc-110m` (base) | 114.6 M | audio 16 kHz | 14.58 % (publicos) / 9.19 % (retenidos) | ver model card de NVIDIA (no disponible en esta informacion) | HuggingFace / NGC |
| `ozonetg/parakeet-110m-caller-asr-basic` (fine-tuning completo) | no disponible con detalle | mismo dominio | mas preciso que este adaptador (cifra concreta no disponible) | CC BY 4.0 | HuggingFace |
| Otros modelos ASR de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especializado en un dominio muy concreto: el canal del cliente en llamadas de venta saliente en ingles de EE. UU. Fuera de ese dominio el rendimiento puede degradarse; en LibriSpeech test-other a 8 kHz pierde +0.88 puntos porcentuales frente a su base.
- Modelo unicamente en ingles; no soporta otros idiomas.
- No es un modelo generativo: no hace tool calling, no razona, no sigue instrucciones ni genera texto libre; solo transcribe audio.
- Los resultados de benchmark estan marcados como no verificados (`verified: false`) en la model-index y han sido declarados por el autor; no se han validado de forma independiente en la informacion disponible.
- Riesgo de alucinacion: como todo modelo ASR, puede producir palabras o frases incorrectas, especialmente en audio ruidoso o con solapamiento de voces; el autor mitiga parcialmente esto con el 5 % de segmentos no hablados con objetivo vacio, pero no lo elimina.
- El entrenamiento se hizo con transcripciones automaticas (machine transcripts) de audio real, no con transcripciones humanas revisadas, lo que puede introducir sesgos y errores sistematicos en las salidas.
- Los datos de entrenamiento proceden de cinco fuentes internas de llamadas de venta saliente de 2025-2026; no se detalla la composicion demografica ni geografica, por lo que no se puede evaluar el sesgo de forma exhaustiva.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribucion, pero conviene verificar las condiciones del modelo base de NVIDIA, ya que los pesos base no se han reentrenado y siguen sujetos a su propia licencia.
- Dependencia del framework: solo se ha probado con NeMo 2.5.3; otras versiones pueden no ser compatibles.
- El adaptador se almacena dentro del `.nemo` y requiere `restore_from` para reconstruirse y habilitarse; si no se habilita correctamente, el modelo actuara como la base sin adaptar.
- Los pesos se publican en float32; no se documentan versiones cuantizadas oficiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ozonetg/parakeet-110m-caller-asr-adapter
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Variante con fine-tuning completo: https://huggingface.co/ozonetg/parakeet-110m-caller-asr-basic
- Adaptador relacionado (recordings): https://huggingface.co/ozonetg/parakeet-tdt-ctc-110m-recordings-adapter
- Adaptador relacionado (call-audio): https://huggingface.co/ozonetg/parakeet-tdt-ctc-110m-call-audio-adapter
- Ficha de NVIDIA NGC del modelo base: https://catalog.ngc.nvidia.com/orgs/nvidia/teams/nemo/models/parakeet-tdt_ctc-110m
- Motor de inferencia en C para la base Parakeet (mynah-asr): https://github.com/mynah-org/mynah-asr/tree/main/reference/parakeet-tdt_ctc-110m
- Configuracion del modelo base en NeMo (repositorio glados): https://github.com/andreagavazzi/glados/blob/main/models/ASR/parakeet-tdt_ctc-110m_model_config.yaml
