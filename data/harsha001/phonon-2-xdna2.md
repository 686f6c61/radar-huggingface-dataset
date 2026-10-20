# Harsha001/Phonon-2-XDNA2

## Resumen

Phonon-2-XDNA2 es un empaquetado ONNX del modelo de reconocimiento automático del habla Phonon-2 (FermionResearch), a su vez derivado de NVIDIA Parakeet TDT 0.6B v3, adaptado para ejecutar el encoder íntegramente en la NPU XDNA2 de los PC con AMD Ryzen AI 300 y Ryzen AI MAX (Strix Point, Strix Halo) bajo Windows ML. El objetivo no es batir récords de precisión, sino permitir que la transcripción de voz en inglés corra sobre la NPU sin cuenta de AMD, sin Ryzen AI SDK y sin PyTorch: basta `pip install` y Windows descarga el proveedor de ejecución de la NPU.

El modelo se compone de un encoder Conformer de 609 millones de parámetros (subsampling, 24 bloques Conformer y proyección) exportado como tres grafos ONNX de forma estática para ventanas de 10, 20 y 36 segundos, más un decodificador TDT pequeño (LSTM + joint, 18 millones de parámetros) que se ejecuta en CPU con NumPy y ONNX Runtime. El compilador de la NPU convierte el grafo a BF16 y coloca los 1.366 operadores en la NPU en un único subgrafo, sin fallback a CPU.

Su relevancia es doble: por un lado demuestra que un encoder de casi 600 millones de parámetros cabe entero en una NPU de PC (50 TOPS) manteniendo la precisión (2,16 % / 4,32 % de WER en LibriSpeech test-clean/test-other, a 0,02 puntos de la referencia FP32); por otro, deja claro el compromiso: en este chip la CPU es más rápida para un solo flujo, y el valor de la NPU es liberar CPU y GPU y reducir consumo en dictado siempre activo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Conformer (subsampling + 24 bloques Conformer + proyeccion) con decodificador TDT (LSTM + joint network) y busqueda greedy |
| Parametros totales | 627 M aproximadamente (609 M del encoder + 18 M del decoder/joint) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica contexto de texto; ventanas de audio estaticas de 10 s, 20 s y 36 s (1.000, 2.000 y 3.600 frames de caracteristicas); el audio mas largo se trocea en piezas de hasta 36 s |
| Tipos de cuantizacion | Pesos del encoder almacenados en FP32 (2,44 GB); la NPU compila el grafo a BF16. El encoder original fue entrenado con quantizacion consciente (QAT) y sus pesos se expanden exactamente a FP32 denso |
| Idiomas soportados | Ingles (`en`) unicamente |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder opset 18; decoder y joint opset 17), `encoder.weights` en FP32, `mel_filters.npy` (128 bandas mel), `vocab.json` (8.192 piezas con 5 duraciones TDT) |

## Arquitectura y entrenamiento

La arquitectura es la de Parakeet TDT: un encoder Conformer con tres etapas de subsampling, 24 bloques Conformer y una proyeccion final, seguido de un decodificador Token-and-Duration Transducer (TDT) formado por una red de prediccion LSTM y una red conjunta que predice simultaneamente token y duracion (5 duraciones posibles sobre un vocabulario de 8.192 piezas). La extraccion de caracteristicas mel de 128 bandas, el decodificador y la busqueda greedy se ejecutan en CPU; solo el encoder va a la NPU.

El trabajo de este repositorio no es un reentrenamiento, sino un port: los pesos del encoder de Phonon-2 (revision `fb09063`) se expandieron a FP32 denso con el cargador de referencia de Fermion, se reescribio el encoder como grafo ONNX de forma estatica (mascaras de padding para las tres etapas de subsampling, el modulo de convolucion y la atencion como tensores de entrada, y mascara aditiva finita de -10.000 para que BF16 nunca encuentre infinito), y se verifico que coincide con el encoder de transformers a ~5e-6 en PyTorch y en ONNX sobre CPU. Los tres grafos (1.000/2.000/3.600 frames) se reescribieron para leer un unico fichero de pesos compartido y se comprobaron bit a bit identicos a los originales. La compilacion la realiza el proveedor de ejecucion VitisAI que instala Windows ML (`MicrosoftCorporationII.WinML.AMD.NPU.EP` 1.8.75). No se documentan en la informacion disponible los datos de entrenamiento originales (numero de tokens, composicion del corpus, etapas de RLHF/DPO).

## Capacidades

- Reconocimiento automatico del habla en ingles (`automatic-speech-recognition`) a partir de audio WAV a 16 kHz o cualquier frecuencia de muestreo, mono o estereo.
- Decodificacion TDT con busqueda greedy sobre vocabulario de 8.192 piezas y prediccion conjunta de duracion.
- Troceado automatico de audio largo en segmentos de hasta 36 s, cortando en el momento mas silencioso cerca de cada corte.
- Ejecucion del encoder en la NPU XDNA2 (BF16, 1.366 operadores en un unico subgrafo) o en CPU (FP32, ONNX Runtime) con la misma interfaz de Python (`Phonon2(...)`, `asr.transcribe(...)`).
- Tres formas estaticas precompiladas (10 s, 20 s, 36 s) que cubren desde dictado corto hasta transcripcion por bloques.
- No soporta tool calling, function calling, agentes, vision, audio generativo ni generacion de texto; es exclusivamente ASR.
- No se documentan en la informacion disponible capacidades de puntuacion, mayusculas, marcas de tiempo, diarizacion ni deteccion de idioma.

## Casos de uso

- Dictado siempre activo en portatil: al residir el encoder en la NPU, la CPU y la GPU quedan libres para el resto del trabajo. El autor lo plantea explicitamente para dictado y transcripcion en segundo plano, donde el consumo (no medido) importa mas que la latencia pura.
- Transcripcion en segundo plano de reuniones o apuntes: el troceado en bloques de hasta 36 s permite procesar grabaciones largas sin mantener la CPU ocupada y sin enviar audio a la nube.
- Procesamiento con requisitos de privacidad: al ejecutarse localmente sobre Windows ML, es apto para audio sensible (sanidad, legal, RRHH) que no puede salir del equipo.
- Integracion en aplicaciones Windows nativas: el paquete se instala con `pip install -r requirements.txt` y descarga el proveedor de NPU desde Windows, sin cuenta de AMD ni SDK, lo que simplifica el despliegue en flotas de PC corporativos con Ryzen AI 300 / AI MAX.
- Accesibilidad y subtitulado asistido: con una ventana de 10 s el encoder tarda 466 ms en NPU (21x tiempo real), suficiente para subtitulado casi en directo sobre fragmentos, aunque el pipeline no es de streaming continuo.
- Preprocesado de audio para analitica: transcripcion por lotes previa a pipelines de analisis de llamadas, busqueda sobre archivos de voz o generacion de indices de texto a partir de grabaciones.
- Evaluacion de aceleradores y benchmarking: los scripts `build/eval_wer.py` y `build/bench.py` permiten comparar NPU frente a CPU con el mismo grafo y las mismas metricas, util para investigadores que miden el rendimiento real de XDNA2.
- Prototipado de ASR en Windows sin CUDA: alternativa para equipos sin GPU NVIDIA que necesitan transcripcion local en ingles con WER en torno al 2-4 % en LibriSpeech.

## Benchmarks y rendimiento

Precision (WER de corpus, menor es mejor; conjuntos LibriSpeech del Open ASR Leaderboard, `hf-audio/esb-datasets-test-only-sorted`, todas las utterseances, normalizador de texto ingles del leaderboard):

| Configuracion | test-clean | test-other |
|---|--:|--:|
| Este repo, encoder en NPU (BF16) | 2,16 % | 4,32 % |
| Misma pipeline, referencia a precision completa en CPU (cargador de transformers de Fermion) | 2,14 % | 4,34 % |
| Cifras publicadas por Fermion para Phonon-2 | 1,72 % | 3,92 % |

Velocidad del encoder (Ryzen AI MAX+ 395, Strix Halo, NPU XDNA2 de 50 TOPS, 16 nucleos Zen 5, regimen estacionario):

| Ventana | NPU (BF16) | CPU 16 nucleos (FP32, ONNX Runtime) |
|---|--:|--:|
| 10 s | 466 ms (21x tiempo real) | 172 ms (58x tiempo real) |
| 20 s | 738 ms (27x tiempo real) | 318 ms (63x tiempo real) |
| 36 s | 2.001 ms (18x tiempo real) | 607 ms (59x tiempo real) |

Sobre los conjuntos de test completos, con cada uttereance rellenada hasta su ventana, el encoder en NPU promedia 12-13x tiempo real. El autor advierte que la diferencia de 0,42 puntos frente a las cifras publicadas por Fermion se debe al runtime de medida: su referencia a precision completa, medida con los mismos scripts, escribe "misses" donde el texto de referencia dice "Mrs.".

## Requisitos de hardware

- NPU: AMD Ryzen AI 300 o Ryzen AI MAX (XDNA2, Strix Point / Strix Halo), con driver de NPU actualizado. El perfil medido es un Ryzen AI MAX+ 395 con NPU de 50 TOPS.
- Sistema operativo: Windows 11; Python 3.12. El proveedor de NPU lo instala Windows ML (`MicrosoftCorporationII.WinML.AMD.NPU.EP` 1.8.75), no requiere SDK de AMD ni cuenta.
- VRAM: no se utiliza GPU; no se documenta ninguna ruta de ejecucion en GPU. El modelo funciona sobre NPU o CPU.
- Memoria y disco: repositorio de 2,5 GB; `encoder.weights` ocupa 2,44 GB en FP32; cada encoder compilado para la NPU se cachea en `npu_cache/` con ~0,8 GB, hasta ~2,4 GB para las tres longitudes.
- Tiempo de compilacion: `--prepare` compila las tres longitudes de una vez en aproximadamente 1,5 horas; sin preparacion previa, cada longitud se compila la primera vez que aparece audio de ese tamano en unos 25 minutos. Posteriormente la carga es de dos segundos.
- Despliegue: ONNX Runtime con el execution provider de VitisAI bajo Windows ML; tambien `--device cpu` con ONNX Runtime en CPU. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR de este tipo).
- Throughput y latencia: segun la tabla anterior, el encoder en CPU es entre 2,3 y 3,3 veces mas rapido que en NPU para un unico flujo (58-63x frente a 18-27x tiempo real). La ventaja de la NPU es dejar CPU y GPU libres; el consumo no se ha medido.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | WER LibriSpeech test-clean / test-other | Licencia | Ejecucion |
|---|---|---|---|---|---|
| Phonon-2-XDNA2 (este repo) | 627 M (609 M encoder + 18 M decoder) | 10 / 20 / 36 s, troceado a 36 s | 2,16 % / 4,32 % (NPU BF16) | CC-BY-4.0 | ONNX en NPU XDNA2 o CPU, Windows 11 |
| FermionResearch/Phonon-2 (base) | no disponible | no disponible | 1,72 % / 3,92 % (cifras del autor) | no disponible | Runtime propio de Fermion con transformers |
| NVIDIA Parakeet TDT 0.6B v3 (origen) | 0,6 B | no disponible | no disponible | no disponible | NeMo / GPU NVIDIA |
| Alternativas tipo Whisper | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

Los tres primeros comparten la misma arquitectura Conformer + TDT; las diferencias medidas son de runtime (NPU/CPU frente al cargador de referencia) y no de pesos. No se dispone de datos de benchmarks de otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles. No hay soporte multilingue ni deteccion de idioma; audio en otro idioma producira transcripciones incorrectas sin aviso.
- No es streaming continuo: el encoder tiene formas estaticas de 10, 20 y 36 s y el audio largo se trocea, con el riesgo de cortar palabras en las fronteras pese al corte por el momento mas silencioso.
- En este chip la NPU es mas lenta que la CPU para un unico flujo (2.001 ms frente a 607 ms en la ventana de 36 s). Si la prioridad es latencia, `--device cpu` es la opcion; la NPU aporta liberacion de CPU/GPU y, presumiblemente, menor consumo, extremo que el autor no ha medido.
- Dependencia fuerte de plataforma: Windows 11, Python 3.12, driver de NPU actualizado y hardware AMD XDNA2. No hay ruta documentada para Linux, macOS ni GPU.
- Coste de puesta en marcha alto: hasta 1,5 horas de compilacion inicial y ~0,8 GB de cache por longitud; sin `--prepare`, la primera inferencia de cada longitud puede tardar unos 25 minutos.
- Degradacion de precision respecto a las cifras publicadas por el modelo base (0,42 puntos de WER en ambos conjuntos), atribuida por el autor a diferencias de runtime y normalizacion.
- No se documentan sesgos, comportamiento con acentos no nativos, ruido de fondo, audio telefónico ni calidad en dominios distintos de LibriSpeech; el unico dato de evaluacion son los conjuntos de lectura LibriSpeech.
- No se documentan puntuacion, mayusculas, marcas de tiempo ni diarizacion; si el pipeline las necesita habra que anadirlas aparte.
- Licencia CC-BY-4.0: permite uso comercial con atribucion. No se especifica en la informacion disponible la licencia del modelo base (FermionResearch/Phonon-2) ni la de Parakeet TDT 0.6B v3, que pueden imponer condiciones adicionales; conviene verificarlas antes de un despliegue en produccion.
- Riesgo de alucinacion en pasajes con silencio largo o ruido: los modelos TDT pueden emitir texto no presente en el audio; el troceado y el padding hasta la ventana completa hacen conveniente validar la salida en entornos criticos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Harsha001/Phonon-2-XDNA2
- Modelo base (Phonon-2, FermionResearch): https://huggingface.co/FermionResearch/Phonon-2
- Modelo de origen (NVIDIA Parakeet TDT 0.6B v3): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Conjuntos de evaluacion del Open ASR Leaderboard: https://huggingface.co/datasets/hf-audio/esb-datasets-test-only-sorted
- Paquete de Windows ML para la NPU AMD: `MicrosoftCorporationII.WinML.AMD.NPU.EP` 1.8.75 (distribuido por Windows ML; sin URL publica en la informacion disponible)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
