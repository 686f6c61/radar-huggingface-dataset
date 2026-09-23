# mehmetefeaytas/ema-tts-improved

## Resumen

EMA-TTS Improved es un modelo de síntesis de voz (text-to-speech) en turco publicado por el usuario de HuggingFace mehmetefeaytas sobre la arquitectura EMA-TTS de Canberk. Se trata de un transformer de difusión condicional compacto, con 63.535.433 parámetros (unos 63,5 millones), que genera audio mono a 48 kHz mediante flow matching sobre el espacio latente del decodificador AudioVAE2 de OpenBMB/VoxCPM2, apoyándose en un front-end turco basado en reglas.

El modelo no introduce un entrenamiento nuevo, sino que optimiza el proceso de inferencia del EMA-TTS original: sustituye el solver ODE de Euler de primer orden por un integrador midpoint (Runge-Kutta de segundo orden) con 48 pasos, añade relleno de cola y un mínimo de duración por palabra para evitar el corte de sufijos y la deglución de cifras, y aplica una normalización de pico suave que reduce la resonancia metálica del códec en la banda de 5,5 a 8,5 kHz.

Es relevante porque ataca un problema muy concreto y poco cubierto: la lectura fiable de cantidades monetarias, IBAN y fechas en turco para banca telefónica y avisos automatizados. Frente al modelo original, declara una exactitud del 99,2% en una batería propia de 13 casos (96,0% en el original) y elimina el truncado de terminaciones como "-dır", "-miştir" o "-siniz", a cambio de un coste computacional algo mayor (RTF de 0,105 frente a 0,091 en una NVIDIA L4).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion condicional con flow matching (DiT compacto) sobre el espacio latente del decodificador AudioVAE2 |
| Parametros totales | 63.535.433 (unos 63,5 millones) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible; no se documenta ningun limite de longitud del texto de entrada |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors en el repositorio; no hay variantes GGUF, int8 ni fp16 documentadas |
| Idiomas soportados | Turco (tr) unicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 0,3 GB) |
| Tarea declarada (pipeline) | text-to-speech |
| Frecuencia de muestreo de salida | 48 kHz, mono |
| Solver de inferencia | Midpoint (Runge-Kutta de 2.º orden) con steps=48; tambien admite "euler" |
| RTF medido por el autor | ~0,105 en NVIDIA L4 (menos de 1,0: inferencia mas rapida que tiempo real) |
| Inferencia alojada en HuggingFace | No (inference: false) |
| Fecha de publicacion en el Hub | 23 de septiembre de 2026 (segun los metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de difusion condicional compacto entrenado con flow matching, denominado EMA-TTS, desarrollado originalmente por Canberk. El modelo no predice la onda de audio directamente: opera en el espacio latente de un decodificador congelado, AudioVAE2, procedente del proyecto VoxCPM2 de OpenBMB, que reconstruye audio a 48 kHz. La generacion se realiza resolviendo una ecuacion diferencial ordinaria (ODE) sobre la trayectoria de difusion; la version improved sustituye el integrador de Euler de primer orden por un midpoint de segundo orden con 48 pasos, lo que reduce la desviacion de integracion y el ruido de fase en alta frecuencia. El texto de entrada pasa por un front-end turco basado en reglas, responsable de la normalizacion de numeros, importes, fechas e IBAN, y por un alineador de duraciones que traduce caracteres a fotogramas latentes.

Sobre el entrenamiento no se publican datos en la informacion disponible: no se indican el numero de tokens ni de horas de audio, la composicion del dataset, ni si hubo RLHF o DPO. La model card menciona el uso de conjuntos de datos turcos de flow matching y evaluacion de FreyaVoice, y atribuye el entrenamiento del modelo base a Canberk. Las mejoras de esta version son de inferencia y post-procesado, no de pesos: integrador midpoint con 48 pasos, relleno de cola de 4 fotogramas latentes (~160 ms) para preservar terminaciones de frase, suelo de duracion de 3 fotogramas por palabra para cifras cortas ("bir", "bin", "on", "kuruş"), factor de articulacion length_scale=1.06, sustitucion del limitador con recorte duro por una normalizacion de pico real a -1,0 dBFS y un filtro de atenuacion suave para el resonancia metalico de AudioVAE2.

## Capacidades

- Sintesis de voz en turco a partir de texto, con salida mono a 48 kHz.
- Lectura robusta de numeros, importes monetarios (TL, "kuruş"), IBAN y fechas, con un 99,2% de exactitud reportada en la bateria de evaluacion del autor.
- Preservacion de sufijos y terminaciones de frase (-dır, -miştir, -siniz) mediante relleno de cola y suelo de duracion.
- Normalizacion de texto turco integrada mediante front-end basado en reglas (no requiere preprocesado externo obligatorio).
- Control de articulacion y ritmo con length_scale, y de calidad/coste con steps y solver ("midpoint" o "euler").
- Generacion reproducible mediante semilla (seed) fija.
- Ejecucion en GPU y CPU (el ejemplo de uso contempla device="cpu" como alternativa).
- No soportado o no documentado: tool calling o function calling, uso como agente o razonamiento multi-paso, capacidades multilingues (solo turco), vision, audio de entrada, clonacion de voz, control de emocion o estilo, salida en streaming y soporte de SSML.

## Casos de uso

- Atencion telefonica bancaria (IVR) con lectura de saldos y movimientos: el modelo esta optimizado especificamente para pronunciar importes como "321.450 TL ve 75 kuruş" sin deglutir cifras ni sufijos, lo que lo hace adecuado para respuestas automaticas en centralitas telefonicas turcas.
- Avisos de vencimiento y recordatorios de pago: fechas como "30 Eylül 2026'dır" se generan completas gracias al relleno de cola, evitando clips cortados que obligan a repetir la locucion.
- Verificacion de datos de pago por voz (IBAN y numeros de referencia): el suelo de duracion por palabra y el factor de articulacion de 1,06 estan pensados para cadenas numericas densas, un escenario tipico en confirmaciones de transferencias.
- Accesibilidad y lectores de pantalla en turco: al ser un modelo de 63,5 millones de parametros con RTF de 0,105, puede ejecutarse en local o en hardware modesto para leer documentos y notificaciones en tiempo real.
- Audiolibros y contenido largo narrado: la generacion se puede fragmentar por frases y encadenar, con salida a 48 kHz apta para publicacion sin remuestreo adicional.
- Generacion de datos sinteticos para entrenar ASR turco: permite crear corpus de audio con cifras, fechas e IBAN controlados para ajustar modelos como faster-whisper, que es precisamente la herramienta usada en la evaluacion del autor.
- Locucion para e-learning y doblaje corporativo: el control de length_scale permite ajustar el ritmo a la duracion de un video o a una pista de subtitulos.
- Anuncios de voz en dispositivos embebidos o quioscos: el tamano reducido de los pesos (0,3 GB de repositorio) y la posibilidad de ejecucion en CPU facilitan el despliegue en hardware sin GPU dedicada.
- Pruebas de regresion en pipelines de TTS: la semilla fija y el solver configurable permiten comparar versiones de forma reproducible antes de desplegar cambios en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible; no son aplicables a un modelo de sintesis de voz. El autor incluye una comparativa propia medida con faster-whisper large-v3 sobre 13 casos de prueba de banca, importes y dialogo en turco, ejecutada en una NVIDIA L4:

| Metrica / caracteristica | EMA-TTS original | EMA-TTS Improved | Mejora declarada |
|---|---|---|---|
| Truncado al final de frase | Presente (sobre todo -dır, -miştir) | Ausente (relleno de cola) | Articulacion completa |
| Exactitud en cifras grandes e IBAN | 96,0% | 99,2% | Omision de cifras eliminada |
| Pureza vocal / aspereza | Ronca / metalica | Clara / natural | ODE midpoint de 2.º orden |
| RTF medio (GPU L4) | ~0,091 | ~0,105 | Inferencia mas rapida que tiempo real |
| Frecuencia de muestreo | 48 kHz | 48 kHz | Calidad de estudio |

Advertencia metodologica: se trata de una evaluacion autodeclarada por el autor, con 13 casos, metrica indirecta basada en el reconocimiento posterior con un ASR (no una evaluacion MOS con oyentes) y sin comparacion contra modelos de terceros. No se han publicado curvas de latencia, throughput por lotes ni resultados en otros idiomas.

## Requisitos de hardware

- Parametros y peso de los pesos: 63,5 millones de parametros implican aproximadamente 254 MB en fp32 y 127 MB en fp16 para el DiT. El repositorio completo ocupa 0,3 GB, cantidad que incluye tambien el decodificador AudioVAE2 congelado y el codigo.
- VRAM estimada: por debajo de 1 GB para los pesos del transformador; en la practica conviene reservar 2-4 GB si se cuenta el decodificador AudioVAE2, las activaciones y los buffers de decodificacion. Es una estimacion aritmetica a partir del numero de parametros, no un dato publicado por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente. El autor reporta mediciones en NVIDIA L4; por logica de rendimiento son tambien adecuadas T4, A100, H100, RTX 3060, RTX 4090 y similares. Un modelo de este tamano no requiere aceleradores de gama alta.
- GPU de consumo: si, cabe con holgura en cualquier GPU de consumo actual e incluso en modelos antiguos con pocos GB de VRAM. El codigo de ejemplo incluye una ruta de ejecucion en CPU.
- Latencia y throughput: RTF de ~0,105 en L4, lo que equivale a unas 9,5 veces el tiempo real; un clip de 10 segundos se sintetizaria en aproximadamente 1,05 segundos en ese hardware. No se publican cifras para CPU ni para otros modelos de GPU. Subir de 0,091 a 0,105 supone alrededor de un 15% mas de coste que el EMA-TTS original por el integrador midpoint de 48 pasos.
- Opciones de despliegue: el repositorio proporciona un script de inferencia propio (`inference.py`) con dependencias en `requirements.txt` y PyTorch. No hay soporte documentado para vLLM, TGI, llama.cpp, Ollama, ONNX Runtime ni para inferencia alojada en HuggingFace (el modelo declara `inference: false`).

## Comparativa con modelos similares

| Modelo | Desarrollador | Parametros | Idiomas | Salida | Licencia | Notas |
|---|---|---|---|---|---|---|
| EMA-TTS Improved | mehmetefeaytas (sobre EMA-TTS de Canberk) | 63,5 M | Turco | 48 kHz mono | Apache-2.0 | Solver midpoint de 48 pasos, relleno de cola, de-harshing; RTF ~0,105 en L4 |
| EMA-TTS (original) | canberkkkkkk | No disponible en la informacion proporcionada | Turco | 48 kHz | Apache-2.0 | Base sobre la que se construye; solver Euler de 1.er orden, RTF ~0,091; exactitud declarada en cifras del 96,0% |
| VoxCPM2 (AudioVAE2) | OpenBMB | No disponible | Multilingue (modelo completo) | 48 kHz | No disponible en la informacion proporcionada | Solo se reutiliza su decodificador latente congelado; no es una alternativa equivalente de TTS en turco |
| Otros TTS en turco (XTTS-v2, MMS-TTS-tur, FreyaVoice) | Varios | No disponible | Turco/multilingue | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada; se citan solo como categoria de referencia |

No se han encontrado en la informacion disponible comparaciones cuantitativas con alternativas de terceros (por ejemplo, diferencias de MOS o de exactitud de cifras frente a otros sistemas turcos). Cualquier comparacion de ese tipo requeriria una evaluacion propia.

## Limitaciones y advertencias

- Idioma unico: el modelo solo soporta turco. No hay evidencia de manejo de texto multilingue, palabras extranjeras o cifras escritas en otros idiomas.
- Evaluacion muy limitada: las cifras del 99,2% y del 96,0% provienen de 13 casos de prueba, con metrica derivada de un ASR (faster-whisper large-v3) y no de una evaluacion perceptual con oyentes. No hay MOS, ni comparaciones ciegas, ni resultados en dominio abierto.
- Naturaleza de la mejora: es una optimizacion de inferencia y post-procesado, no un reentrenamiento. Hereda la cobertura, los sesgos y las carencias del dataset de EMA-TTS, que no esta documentado (ni horas de audio, ni composicion, ni reparto de voces y acentos).
- Riesgo de artefactos y alucinacion acustica: al ser un modelo generativo de difusion, puede producir ruidos, silencios anormales, repeticiones o sonidos no presentes en el texto, especialmente con entradas fuera de dominio, siglas, secuencias numericas muy largas o texto sin normalizar.
- Sesgos linguisticos no medidos: no se documenta cobertura de dialectos turcos regionales, acentos ni genero de la voz sintetizada. Tampoco hay control de hablante, emocion ni estilo.
- Codigo de ejemplo a revisar: el fragmento de la model card carga los pesos de `canberkkkkkk/ema-tts`, no del propio repositorio improved. Antes de desplegar conviene verificar que checkpoints se estan usando realmente y que la configuracion de inferencia (steps, solver, length_scale) se aplica.
- Sin inferencia alojada: el modelo declara `inference: false`, por lo que no hay widget ni API en HuggingFace; el despliegue corre integramente por cuenta del usuario.
- Mayor coste computacional: el RTF sube de 0,091 a 0,105 en L4 (aproximadamente un 15% mas lento). En escenarios de alto volumen, ese incremento es apreciable.
- Componentes de terceros: el decodificador AudioVAE2 procede de OpenBMB/VoxCPM2 y los datos de evaluacion de FreyaVoice. Aunque el conjunto se declara Apache-2.0, conviene revisar las condiciones de cada componente antes de un uso comercial.
- Validacion por la comunidad inexistente: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no hay evidencia externa de calidad o estabilidad en produccion.
- Dependencia del front-end: la correcta lectura de importes, fechas e IBAN depende del normalizador basado en reglas incluido; textos ya normalizados de forma distinta pueden degradar el resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mehmetefeaytas/ema-tts-improved
- Modelo original EMA-TTS (Canberk): https://huggingface.co/canberkkkkkk/ema-tts
- Decodificador AudioVAE2 / proyecto VoxCPM2 (OpenBMB): https://huggingface.co/openbmb/VoxCPM2
- Datos de evaluacion y flow matching en turco (FreyaVoice): https://huggingface.co/freyavoice
- Repositorio de codigo: no disponible; el quickstart de la model card clona el propio repositorio de HuggingFace y usa `inference.py` con `requirements.txt`
- Paper o publicacion tecnica: no disponible
- Demo interactiva: no disponible (el modelo declara `inference: false`)
