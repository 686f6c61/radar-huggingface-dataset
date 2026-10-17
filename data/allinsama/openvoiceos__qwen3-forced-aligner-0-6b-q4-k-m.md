# Allinsama/OpenVoiceOS__qwen3-forced-aligner-0.6b-q4-k-m

## Resumen

Este repositorio contiene una exportación en formato GGUF del modelo Qwen3-ForcedAligner-0.6B, publicado originalmente por el equipo Qwen y reempaquetado por Allinsama a partir de la versión de OpenVoiceOS. No es un modelo de reconocimiento de voz autónomo: es un alineador forzado (*forced aligner*), es decir, recibe un audio y su transcripción y devuelve la marca temporal de cada palabra o carácter. El repositorio incluye únicamente la variante cuantizada Q4_K_M, pensada para ejecución en CPU y dispositivos de borde.

La relevancia práctica está en el tamaño: el archivo GGUF ocupa unos 0,6 GB y se ejecuta con el runtime C++ `qwen3-asr.cpp` y sus *bindings* de Python `py-qwen3-asr-cpp`, sin necesidad de GPU. La model card lo plantea como pareja del modelo de ASR `qwen3-asr-0.6b`, de modo que la transcripción y la alineación se obtienen en una sola llamada (`transcribe_and_align`).

Conviene manejarlo con cautela: el repositorio es un *mirror* no oficial, con cero descargas y cero *likes* en el momento de redactar esta ficha, y los metadatos presentan inconsistencias que se detallan más abajo (número de parámetros frente al nombre comercial y número de idiomas frente a la documentación de Qwen3-ASR). Para producción, la referencia fiable es el repositorio original de Qwen y el proyecto OpenVoiceOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 adaptado a alineacion forzada audio-texto; el desglose interno (encoder de audio, cabeza de alineacion) no esta detallado en la informacion disponible |
| Parametros totales | 917.728.896 (917,7 M) segun el recuento de safetensors del modelo base; el nombre comercial indica 0,6B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el limite documentado es de audio, no de tokens: hasta 5 minutos por peticion segun el repositorio QwenLM/Qwen3-ASR y 3 minutos segun el wrapper WEIFENG2333 |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado); el proceso pasa por una conversion intermedia a tensores F16 |
| Idiomas soportados | 29 idiomas en los metadatos de la model card (zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, hu, mk, ro); la documentacion de Qwen3-ASR atribuye 11 idiomas al alineador (zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru) |
| Licencia | Apache 2.0, heredada del modelo original |
| Formato de pesos | GGUF (archivo `qwen3-forced-aligner-0.6b-q4_k_m.gguf`); el modelo base se distribuye en safetensors |
| Modelo base | Qwen/Qwen3-ForcedAligner-0.6B |
| Tamano del repositorio | 0,6 GB |
| Pipeline declarado | automatic-speech-recognition |
| Runtime previsto | qwen3-asr.cpp (C++) y py-qwen3-asr-cpp (Python) |

## Arquitectura y entrenamiento

La informacion disponible no incluye la ficha tecnica del entrenamiento del modelo original: no se detallan el numero de tokens, la composicion del corpus, ni si hubo etapas de RLHF o DPO. Lo que si se sabe es que Qwen3-ForcedAligner-0.6B pertenece a la familia Qwen3, de arquitectura transformer decoder-only, y que ha sido adaptado especificamente a la prediccion de marcas temporales para unidades arbitrarias (palabras o caracteres) sobre audio de hasta cinco minutos. El repositorio QwenLM/Qwen3-ASR afirma que su precision de timestamps supera a la de los modelos de alineacion forzada basados en arquitecturas end-to-end, aunque sin publicar cifras en la informacion consultada.

El proceso de conversion esta documentado y es reproducible: los pesos originales se transforman a GGUF con tensores F16 mediante `convert_hf_to_gguf.py` y despues se cuantizan con la herramienta `quantize`, ambas del repositorio `femelo/qwen3-asr.cpp`. La unica innovacion reseñable en este repositorio concreto es, por tanto, el empaquetado: llevar un alineador de ~0,9 B de parametros a un archivo de 0,6 GB ejecutable en CPU, con hilos configurables (`n_threads`).

## Capacidades

- Alineacion forzada audio-texto: dada una grabacion y su transcripcion, devuelve el *timestamp* de cada palabra o caracter.
- Prediccion de timestamps sobre unidades arbitrarias, no limitada a fonemas ni a palabras del diccionario.
- Transcripcion combinada con alineacion en una sola llamada (`transcribe_and_align`), devolviendo idioma detectado, texto y alineacion.
- Deteccion de idioma en la salida del pipeline (campo `result.language`).
- Cobertura multilingue: 11 idiomas confirmados por la documentacion del alineador y hasta 29 declarados en los metadatos del repositorio.
- Ejecucion en CPU con paralelismo por hilos, sin dependencia de CUDA.
- Integracion como libreria Python y como CLI o API REST a traves de proyectos de la comunidad (WEIFENG2333/qwen3-forced-aligner).
- No soporta, segun la informacion disponible: tool calling, razonamiento multi-paso, vision, audio generativo ni modo *thinking*.

## Casos de uso

- **Generacion de subtitulos con sincronizacion por palabra**: se transcribe el audio con el modelo ASR emparejado y se alinea el texto resultante para obtener tiempos por palabra, lo que permite formatos tipo karaoke o subtitulos con resaltado progresivo sin correccion manual.
- **Re-timing de transcripciones revisadas**: cuando un revisor corrige el texto de una transcripcion ASR, la alineacion forzada vuelve a calcular los tiempos sobre el texto corregido, de modo que la edicion no rompe la sincronizacion.
- **Creacion de corpus para TTS**: los modelos de sintesis de voz necesitan pares audio-texto con limites de palabra o fonema; este alineador genera esas anotaciones sobre corpus propios en cualquiera de los idiomas soportados.
- **Doblaje y ajuste de locucion**: los tiempos por palabra permiten calcular la duracion real de cada intervencion y ajustar la longitud de la traduccion antes de grabar, o sincronizar el audio doblado con el original.
- **Anotacion linguistica y evaluacion de ASR**: la alineacion permite medir errores a nivel de palabra con su posicion temporal, util para diagnosticar si un fallo del transcriptor se debe a un segmento concreto del audio.
- **Indexacion y busqueda dentro de audio**: con marcas temporales por palabra se pueden construir indices que devuelvan el minuto exacto en el que se pronuncia un termino en archivos largos de entrevistas, clases o reuniones.
- **Herramientas de aprendizaje de idiomas**: resaltado en tiempo real de la palabra que se esta pronunciando en una grabacion, con la ventaja de que el modelo corre en el dispositivo del alumno sin enviar audio a la nube.
- **Despliegue en dispositivos de borde y entornos sin GPU**: con 0,6 GB de pesos en Q4_K_M, la alineacion cabe en una Raspberry Pi o en un portatil modesto, lo que habilita procesamiento offline por motivos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica afirmacion cualitativa es la del repositorio QwenLM/Qwen3-ASR, que sostiene que la precision de timestamps supera a la de los modelos de alineacion forzada end-to-end, sin acompanar cifras. Tampoco hay datos de latencia o throughput para la variante Q4_K_M, ni comparacion de degradacion respecto a los pesos F16 originales.

## Requisitos de hardware

- **VRAM/RAM estimada**: aproximadamente 0,6 GB solo para los pesos en Q4_K_M; con el *overhead* del runtime es razonable presupuestar entre 1 y 2 GB de memoria, aunque no se ha publicado una cifra oficial.
- **GPU**: no es necesaria. El proyecto esta disenado para inferencia en CPU; no se documenta soporte CUDA, ROCm ni Metal.
- **Consumer GPU**: irrelevante para el caso de uso; cualquier GPU consumer lo ejecutaria, pero el cuello de botella seria el decoder de audio del runtime, no la memoria.
- **CPU**: el parametro `n_threads` del binding de Python permite ajustar el paralelismo al numero de nucleos disponibles. No se especifican requisitos minimos de ISA ni de VRAM compartida.
- **Opciones de despliegue**: `py-qwen3-asr-cpp` (Python, instalable con `pip install git+https://github.com/femelo/py-qwen3-asr-cpp`) y `qwen3-asr.cpp` (C++). El proyecto WEIFENG2333/qwen3-forced-aligner ofrece CLI, API REST y paquetes precompilados para Linux, macOS y Windows.
- **Compatibilidad**: este GGUF esta pensado para `qwen3-asr.cpp`; no hay confirmacion de que sea cargable en llama.cpp, Ollama, vLLM o TGI, y en general esos runtimes no soportan entrada de audio.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Allinsama/OpenVoiceOS__qwen3-forced-aligner-0.6b-q4-k-m (esta ficha) | 917,7 M (nominal 0,6B) | GGUF Q4_K_M, 0,6 GB | 3-5 min por peticion segun implementacion | 11 confirmados, 29 declarados | Apache 2.0 | Mirror no oficial, 0 descargas |
| Qwen/Qwen3-ForcedAligner-0.6B (original) | 917,7 M | safetensors (F16/BF16, no detallado) | 5 min por peticion | 11 | Apache 2.0 | Repositorio oficial de Qwen |
| OpenVoiceOS/qwen3-forced-aligner-0.6b-q4-k-m | 917,7 M | GGUF Q4_K_M | 5 min (heredado del original) | 11 | Apache 2.0 | Repositorio upstream del reempaquetado |
| Alineadores CTC clasicos (familia wav2vec2/MMS) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante se reduce a tres variantes del mismo modelo: los pesos originales en safetensors y dos empaquetados GGUF identicos en cuantizacion, uno de ellos (este) replicado por un tercero. Frente a los alineadores CTC clasicos, la ventaja declarada es la precision de timestamps y la capacidad de alinear unidades arbitrarias, pero no hay datos publicos que permitan cuantificarla en esta informacion.

## Limitaciones y advertencias

- **No es un modelo de ASR autonomo**: necesita una transcripcion de entrada. La model card lo usa junto a `qwen3-asr-0.6b`; sin ese texto previo, el alineador no produce transcripcion por si solo.
- **Inconsistencia en el numero de parametros**: el nombre comercial indica 0,6B, mientras que el recuento de safetensors del modelo base es de 917,7 M. La informacion disponible no desglosa si la diferencia corresponde al encoder de audio o a la cabeza de alineacion.
- **Inconsistencia en idiomas**: los metadatos declaran 29 idiomas, pero la documentacion de Qwen3-ASR y el wrapper de WEIFENG2333 atribuyen 11 al alineador. Los 18 restantes probablemente corresponden al modelo ASR de la familia, pero no esta confirmado.
- **Degradacion por cuantizacion**: no hay evaluacion publicada del impacto de Q4_K_M sobre la precision de los timestamps. Para tareas sensibles (subtitulado broadcast, doblaje profesional), conviene validar contra los pesos F16 originales.
- **Duracion maxima de audio**: el alineador no procesa archivos largos de una vez; hay que trocear en segmentos de 3 a 5 minutos y gestionar las fronteras, con el riesgo de desalineacion en los cortes.
- **Repositorio no oficial y sin traccion**: cero descargas y cero *likes*, publicado por un tercero sobre el trabajo de OpenVoiceOS. Para produccion, es preferible depender del repositorio original de Qwen o del de OpenVoiceOS, que reciben mantenimiento.
- **Ecosistema de ejecucion restringido**: depende de un runtime C++ especifico (`qwen3-asr.cpp`) con *bindings* de Python mantenidos por un unico desarrollador; no hay soporte en vLLM, TGI, Ollama ni llama.cpp.
- **Riesgo de alucinacion en los tiempos**: si el texto de entrada no coincide con el audio (transcripcion erronea, audio con ruido, habla solapada), el alineador puede forzar correspondencias inexistentes y producir timestamps incorrectos sin senalizar el error.
- **Licencia**: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y el archivo NOTICE si existe. Verificar los terminos del modelo base antes de redistribuir.

## Enlaces

- Repositorio en HuggingFace (esta ficha): https://huggingface.co/Allinsama/OpenVoiceOS__qwen3-forced-aligner-0.6b-q4-k-m
- Archivo GGUF: https://huggingface.co/OpenVoiceOS/qwen3-forced-aligner-0.6b-q4-k-m/blob/main/qwen3-forced-aligner-0.6b-q4_k_m.gguf
- Repositorio upstream en HuggingFace: https://huggingface.co/OpenVoiceOS/qwen3-forced-aligner-0.6b-q4-k-m
- Modelo original: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Repositorio Qwen3-ASR (QwenLM): https://github.com/QwenLM/Qwen3-ASR
- Runtime C++ `qwen3-asr.cpp`: https://github.com/femelo/qwen3-asr.cpp
- Bindings de Python: https://github.com/femelo/py-qwen3-asr-cpp
- Script de conversion a GGUF: https://github.com/femelo/qwen3-asr.cpp/blob/main/scripts/convert_hf_to_gguf.py
- Herramienta de cuantizacion: https://github.com/femelo/qwen3-asr.cpp/blob/main/src/quantize.cpp
- Herramienta CLI/REST de alineacion: https://github.com/WEIFENG2333/qwen3-forced-aligner
- Ficha de terceros (AxForge): https://axforge.ai/models/qwen3-forced-aligner-q4-k-m/
