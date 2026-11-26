# Olicorne/parakeet-tdt-0.6b-v3-optimized-onnx

## Resumen

Parakeet TDT 0.6B v3 (Multilingual) es un modelo de reconocimiento automatico del habla (ASR) desarrollado originalmente por NVIDIA, basado en la arquitectura NeMo Conformer con decodificacion Token-and-Duration Transducer (TDT). Este repositorio concreto, publicado por el usuario Olicorne, no contiene los pesos originales en formato NeMo, sino una exportacion a ONNX del checkpoint `nvidia/parakeet-tdt-0.6b-v3`, optimizada especificamente para inferencia en navegador y en CPU. El modelo cubre 25 idiomas europeos, incluido el castellano, y resuelve el problema de transcribir audio de forma local sin depender de servicios en la nube.

La relevancia de esta variante radica en las modificaciones aplicadas al grafo: eliminacion de las mascaras de atencion y padding en tiempo de exportacion, calculo de la codificacion posicional en tiempo de ejecucion (lo que elimina el limite de unos 400 segundos por pasada del export original) y constant-folding del encoder, que pasa de 4682 a 2110 nodos con verificacion bit-exacta. El repositorio incluye varias precisiones (fp32, int8 y otras) en carpetas separadas, orientadas a la libreria `onnx-asr` y a la aplicacion web Parakeet Web.

El autor advierte explicitamente de que esta version esta probablemente superada por `Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx`, que ofrece el mismo layout y precisiones con mejor calidad, y que este repositorio se mantiene solo para no romper enlaces y revisiones fijadas. La validacion de precision es todavia limitada: solo 80 clips de FLEURS en frances e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 0,6 mil millones (600 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | sin limite fijo por codificacion posicional; se ha validado una pasada unica de 10 minutos (VoxPopuli, frances); el export anterior estaba limitado a ~400 s |
| Tipos de cuantizacion | fp32, int8 y otras precisiones incluidas en carpetas separadas (matmulnbits, segun tags) |
| Idiomas soportados | 25: en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (grafo `.onnx` con pesos externos `.onnx.data.000` y `.data.001` en fp32) |

## Arquitectura y entrenamiento

El modelo base es un Conformer de NVIDIA con decodificador TDT, una variante de transducer que predice conjuntamente tokens y duraciones, lo que permite decodificacion no autoregresiva por bloques y reduce la latencia frente a un transducer clasico. El checkpoint original se entreno sobre datos multilingues no detallados en la informacion proporcionada; no se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO (en ASR no es habitual).

La innovacion de esta exportacion es puramente de inferencia: se eliminan las mascaras de atencion y padding del grafo (72 operaciones `Where` y la construccion O(T^2) de mascaras), se calcula la codificacion posicional en tiempo de ejecucion (eliminando una tabla de 41 MB y el limite de ~400 s), se aplica constant-folding al encoder (4682 -> 2110 nodos, -55%, verificado bit-exacto con tolerancia 0 en longitudes de mel 201, 1001 y 3001), se redondean las mantisas de los pesos fp32 para mejorar la compresibilidad y se anaden salidas internas en los decodificadores para evitar recalculos en JavaScript durante beam search. Se incluye una "tripwire" NaN para batches con padding, de modo que el grafo falle de forma explicita en lugar de devolver salidas degradadas.

## Capacidades

- Transcripcion de voz a texto multilingue en 25 idiomas europeos, incluido castellano.
- Decodificacion TDT con prediccion conjunta de tokens y duraciones.
- Inferencia en navegador totalmente del lado del cliente mediante Parakeet Web (los datos de audio no salen del equipo).
- Inferencia en CPU mediante `onnx-asr`.
- Procesamiento de audio largo en una sola pasada (validado con 10 minutos de VoxPopuli en frances).
- Multiples precisiones en el mismo repositorio para ajustar calidad, tamano y velocidad.
- No se documentan capacidades de tool calling, agentes, vision ni audio generation; es un modelo exclusivamente ASR.

## Casos de uso

- Transcripcion local en navegador: integrado en Parakeet Web, el modelo descarga los ficheros ONNX y transcribe en el cliente, adecuado para dictado confidencial o entornos sin conectividad.
- Subtitulado de reuniones y clases: la ausencia de limite de ~400 s permite procesar grabaciones largas en una sola pasada, reduciendo la complejidad de troceado.
- Atencion al cliente con transcripcion de llamadas: el soporte de 25 idiomas permite un mismo pipeline para varias regiones europeas.
- Generacion de actas y notas de voz en aplicaciones de productividad, ejecutando el modelo en CPU sin GPU dedicada.
- Investigacion en ASR multilingue: las distintas precisiones permiten estudiar el impacto de la cuantizacion en WER sobre un mismo grafo.
- Prototipado rapido con `onnx-asr`: los nombres canonicos de ficheros facilitan la carga directa en pipelines existentes.
- Despliegue en entornos con restricciones de privacidad (sanidad, legal, administracion publica) donde no se permite enviar audio a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la informacion disponible. La unica validacion reportada es una pasada parcial de WER sobre 80 clips de validacion de FLEURS en frances e ingles, insuficiente para clasificar las precisiones. La validacion de correctitud estructural si esta documentada:

| Gate | Resultado |
|---|---|
| Bit-exactitud del folding del encoder (tolerancia 0, longitudes mel 201/1001/3001) | pasado, `maxAbsDiff` 0.000e+00 |
| Cirugia del decodificador, fp32 | pasado, peor diferencia LSE 2.063e-05, top-K exacto frente a numpy |
| Cirugia del decodificador, int8 | pasado, peor diferencia LSE 1.709e-05, top-K exacto frente a numpy |
| WER en FLEURS (80 clips, fr/en) | realizado, sin cifras publicadas en la informacion disponible |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 600 M de parametros, fp32 ronda los 2,4 GB y int8 en torno a 0,6 GB, aunque el repo completo ocupa 30,8 GB por incluir todas las precisiones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo esta disenado tambien para CPU.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060, RTX 4090 y similares; tambien en CPU.
- Opciones de despliegue: `onnx-asr`, ONNX Runtime, Parakeet Web en navegador.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Olicorne/parakeet-tdt-0.6b-v3-optimized-onnx | 600 M | sin limite fijo, validado 10 min | 25 | cc-by-4.0 | Export ONNX para navegador y CPU; probablemente superado por `ultra-onnx` |
| nvidia/parakeet-tdt-0.6b-v3 | 600 M | limitado por codificacion posicional del checkpoint original | 25 | cc-by-4.0 | Checkpoint NeMo original |
| istupakov/parakeet-tdt-0.6b-v3-onnx | 600 M | ~400 s por pasada | 25 | cc-by-4.0 | Export ONNX previo, con colapso de precision en int8 para audio largo |
| Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx | 600 M | no disponible | 25 | cc-by-4.0 | Version recomendada por el propio autor de este repo |

## Limitaciones y advertencias

- El autor indica que este repositorio esta probablemente superado por `parakeet-tdt-0.6b-v3-ultra-onnx` y que no deberia usarse en nuevos proyectos.
- La validacion de precision es muy limitada (80 clips, solo frances e ingles); no hay evidencia a escala de 25 idiomas en esta raiz.
- El grafo sin mascaras no admite batches con padding: devuelve NaN como tripwire en lugar de resultados degradados, lo que exige gestionar el padding en el llamador.
- La cuantizacion int8 del export anterior sufria colapso de precision en audio largo; aunque esta version rehace el export, no hay datos publicados que confirmen el comportamiento int8 a escala.
- Riesgo de alucinacion y errores en audio con ruido, acentos marcados o solapamiento de hablantes, comun en modelos ASR.
- Sesgos linguisticos y acusticos heredados del checkpoint de NVIDIA, no documentados en la informacion disponible.
- Licencia cc-by-4.0: permite uso comercial con atribucion; conviene revisar los terminos del modelo base de NVIDIA.
- El repositorio ocupa 30,8 GB por incluir todas las precisiones; el despliegue debe seleccionar solo la carpeta necesaria.

## Enlaces

- Hugging Face: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-optimized-onnx
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Version recomendada por el autor: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx
- Export previo: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Demo en navegador: https://parakeetweb.olicorne.org/
- Codigo de la demo: https://github.com/thiswillbeyourgithub/parakeet_web
- Libreria onnx-asr: https://github.com/istupakov/onnx-asr
- Sitio del autor: https://olicorne.org
