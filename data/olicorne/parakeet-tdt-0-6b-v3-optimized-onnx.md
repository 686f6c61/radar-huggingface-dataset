# Olicorne/parakeet-tdt-0.6b-v3-optimized-onnx

## Resumen

Parakeet TDT 0.6B v3 es un modelo de reconocimiento automático del habla (ASR) desarrollado originalmente por NVIDIA, basado en la arquitectura NeMo Conformer con decodificación TDT (Token-and-Duration Transducer). Este repositorio concreto, mantenido por el usuario Olicorne, no contiene los pesos originales en formato NeMo, sino una exportación a ONNX optimizada específicamente para inferencia en navegador y CPU, derivada directamente del checkpoint `.nemo` oficial de NVIDIA mediante el exportador propio de NeMo.

El modelo cubre 25 idiomas europeos (incluido el español) y está pensado para transcripción del habla en tiempo real o por lotes sin dependencia de GPU. La exportación elimina las máscaras de atención del grafo del encoder, calcula las codificaciones posicionales en tiempo de ejecución (lo que suprime el límite de aproximadamente 400 segundos por pasada del export original) y aplica plegado de constantes que reduce el grafo de 4682 a 2110 nodos, verificado bit a bit.

Es relevante para desarrolladores que necesiten ASR multilingüe desplegable en cliente (navegador, escritorio, dispositivos sin acelerador) con licencia permisiva CC-BY-4.0. No obstante, el propio autor advierte que este repositorio está probablemente superado por `Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx` y que la validación de precisión a gran escala es todavía limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 0.6 mil millones (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | sin limite fijo tras la exportacion; validado hasta 600 s en una sola pasada (VoxPopuli, frances) |
| Tipos de cuantizacion | fp32, int8 (matmulnbits), y otras precisiones en carpetas separadas del repositorio |
| Idiomas soportados | 25: en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder dividido en `encoder-model.onnx.data.000` y `.data.001` para fp32) |

## Arquitectura y entrenamiento

El modelo base es un Conformer (transformer convolucional) de NVIDIA con decodificador TDT, una variante de transducer que predice conjuntamente tokens y duraciones, lo que permite decodificacion no autoregresiva por bloques y reduce la latencia frente a un CTC o un transducer clasico. Los detalles de entrenamiento del modelo original (numero de tokens, composicion del corpus, uso de RLHF) no estan disponibles en la informacion proporcionada.

La contribucion de este repositorio es exclusivamente de exportacion e inferencia, no de entrenamiento. Se parte del checkpoint `.nemo` de NVIDIA y se aplica el exportador propio de NeMo, con tres modificaciones principales: eliminacion de las mascaras de atencion y padding del grafo (72 operaciones `Where` y la construccion O(T²) de mascaras), calculo en tiempo de ejecucion de las codificaciones posicionales (elimina una tabla de 41 MB y el limite de ~400 s de entrada), y plegado de constantes en el encoder (4682 a 2110 nodos, verificado bit a bit con tolerancia 0). Ademas, los decodificadores incluyen salidas adicionales en el grafo para evitar recalcular en JavaScript lo que necesitaria una busqueda por haz.

## Capacidades

- Transcripcion de voz a texto en 25 idiomas europeos, con soporte nativo de espanol.
- Inferencia en navegador mediante la aplicacion Parakeet Web, sin enviar audio a servidores.
- Inferencia en CPU mediante la libreria `onnx-asr`.
- Procesamiento de audio largo en una sola pasada (validado hasta 600 s).
- Multiples precisiones (fp32, int8 y otras) en carpetas separadas para ajustar calidad frente a tamano.
- Soporte de lotes con padding, con restriccion documentada: el grafo sin mascaras produce NaN ante un uso incorrecto, lo que actua como aviso explicito.
- No se documentan capacidades de diarizacion, traduccion, puntuacion automatica ni marcas de tiempo a nivel de palabra en la informacion disponible.

## Casos de uso

- Transcripcion en navegador con privacidad total: la app Parakeet Web descarga los ONNX y transcribe en cliente, de modo que el audio no sale del dispositivo; adecuado para entornos sanitarios, legales o periodisticos con requisitos de confidencialidad.
- Subtitulado de reuniones y clases en espanol: el modelo cubre espanol entre sus 25 idiomas y admite audio largo en una sola pasada, lo que simplifica la generacion de transcripciones de sesiones de hasta 10 minutos sin segmentacion manual.
- Asistentes de voz en escritorio y movil sin GPU: al ejecutarse en CPU via `onnx-asr`, encaja en aplicaciones de notas de voz, dictado o comandos por voz en equipos sin acelerador.
- Procesamiento por lotes de archivos de audio multilingues: la cobertura de 25 idiomas permite un unico pipeline para corpus europeos, con seleccion de idioma o deteccion implicita segun el modelo base.
- Herramientas de accesibilidad: transcripcion local de audio para personas con dificultades auditivas, sin dependencia de servicios en la nube ni cuotas de API.
- Investigacion en ASR comparativo: las distintas precisiones en carpetas separadas permiten medir el impacto de la cuantizacion sobre WER en un mismo grafo, util para estudiar compromisos calidad/tamano.
- Integracion en aplicaciones web de terceros: el layout de archivos sigue las convenciones de `onnx-asr` y de Parakeet Web, lo que facilita incrustar el modelo en frontends existentes.

## Benchmarks y rendimiento

El autor declara una validacion parcial: WER sobre 80 clips de validacion de FLEURS en frances e ingles unicamente, insuficiente segun sus propias palabras para clasificar las precisiones entre si. No se publican cifras concretas de WER en la informacion proporcionada. Las puertas de correccion internas (plegado del encoder bit a bit, cirugia del decodificador en fp32 e int8, comparacion de vocabulario) constan como superadas.

No se han publicado resultados de benchmarks completos (WER por idioma, comparativas con otros modelos) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso de CPU/navegador; para GPU, el modelo de 0.6B en fp32 ocupa del orden de 2.4 GB de pesos mas activaciones, aunque no se documenta una cifra oficial.
- GPU recomendadas: no disponibles en la informacion; el diseno apunta a CPU y navegador, no a aceleradores dedicados.
- Cabe en GPU de consumo: si, por tamano (0.6B), aunque el objetivo declarado es la inferencia sin GPU.
- Opciones de despliegue: `onnx-asr` (Python), aplicacion Parakeet Web (navegador mediante ONNX Runtime Web), y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles; el autor no publica mediciones de velocidad en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Olicorne/parakeet-tdt-0.6b-v3-optimized-onnx | ~0.6B | sin limite fijo tras export; validado a 600 s | 25 | CC-BY-4.0 | ONNX |
| nvidia/parakeet-tdt-0.6b-v3 (base) | ~0.6B | limite original ~400 s por tabla posicional | 25 | CC-BY-4.0 | NeMo |
| istupakov/parakeet-tdt-0.6b-v3-onnx | ~0.6B | limitado por tabla posicional | 25 | CC-BY-4.0 | ONNX |
| Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx | ~0.6B | mismo layout que este repo | 25 | CC-BY-4.0 | ONNX |

El autor indica que `ultra-onnx` es probablemente superior y que este repositorio se mantiene solo por compatibilidad de enlaces y revisiones fijadas. No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio probablemente obsoleto: el propio autor recomienda migrar a `Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx`.
- Validacion de precision limitada: solo 80 clips de FLEURS en frances e ingles; no hay evidencia de WER a escala en los 25 idiomas.
- Restriccion de lotes con padding: el grafo sin mascaras devuelve NaN ante un uso incorrecto; es un fallo ruidoso, no silencioso, pero exige respetar la API.
- Riesgo de alucinacion en audio ruidoso o silencioso: inherente a los modelos ASR; no se documenta mitigacion especifica.
- Sesgos: no documentados en la informacion disponible; dependen del corpus de entrenamiento original de NVIDIA.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; conviene revisar los terminos del modelo base de NVIDIA y del exportador NeMo.
- Tamano del repositorio de 30.8 GB, lo que puede complicar su descarga en entornos con ancho de banda limitado.
- Sin marcas de tiempo ni diarizacion documentadas; si se necesitan, habria que anadirlas externamente.
- Audio por encima de 600 s no validado, aunque el grafo ya no impone el limite de ~400 s del export original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-optimized-onnx
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Alternativa recomendada por el autor: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx
- Export ONNX previo de referencia: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Libreria `onnx-asr`: https://github.com/istupakov/onnx-asr
- Aplicacion web Parakeet Web: https://parakeetweb.olicorne.org/
- Codigo fuente de Parakeet Web: https://github.com/thiswillbeyourgithub/parakeet_web
- Sitio del autor: https://olicorne.org
