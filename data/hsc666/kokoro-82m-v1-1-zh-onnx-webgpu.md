# hsc666/Kokoro-82M-v1.1-zh-ONNX-webgpu

## Resumen

Kokoro-82M-v1.1-zh-ONNX-webgpu es una redistribucion del modelo de sintesis de voz Kokoro-82M v1.1-zh en formato ONNX, publicada por el usuario hsc666. El modelo original lo desarrolla hexgrad y la exportacion a ONNX corre a cargo de onnx-community; esta copia concreta introduce una unica modificacion respecto al upstream: sustituye el modelo fp16 defectuoso por una version de precision mixta que genera audio finito. El modelo base es un TTS de 82 millones de parametros con soporte para chino y ingles, bajo licencia Apache-2.0.

La relevancia de esta ficha radica en el problema que resuelve. El modelo fp16 original de onnx-community produce NaN en aproximadamente el 37% de las muestras, lo que lo hace inutilizable en produccion sobre WebGPU. Esta version mantiene en fp32 los nodos criticos (fuente armonica SineGen, STFT y calculo de fase del generador) y elimina las conversiones de tipo redundantes introducidas por el conversor, logrando cero NaN en 168 ejecuciones con un coste de VRAM de 858 MB frente a los 1268 MB del modelo fp32.

El resultado es un modelo TTS ligero (177 MB en fp16 mixto, 339 MB en fp32) pensado para inferencia en navegador mediante transformers.js y WebGPU, con un factor de tiempo real de 0,030 (unas 33 veces mas rapido que tiempo real) medido en una RTX 5080. Es una pieza practica para aplicaciones web que necesitan sintesis de voz local sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 con generador basado en SineGen y STFT (text-to-speech) |
| Parametros totales | 82 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | fp32 y fp16 mixto (precision mixta con 231 de 4741 nodos en fp32) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx fp32 de 339 MB; model_fp16.onnx mixto de 177 MB), voces en .bin |
| Tamano del repositorio | 0,6 GB |
| Libreria de inferencia | transformers.js (StyleTextToSpeech2Model) |
| Backend | WebGPU (requiere shader-f16 para la variante fp16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura StyleTTS2, un sistema de sintesis de voz neuronal que combina un codificador de estilo con un generador basado en fuente armonica (SineGen) y transformada de Fourier de corto tiempo (STFT). El generador produce la forma de onda a partir de una representacion intermedia de fase y magnitud, lo que permite un control fino sobre el timbre y la prosodia. Los pesos originales se exportaron a ONNX mediante onnxconverter-common y se publicaron en onnx-community.

La contribucion tecnica de esta copia es el script `make_mixed_fp16.py`, que reconstruye el modelo fp16 desde el fp32 corrigiendo tres causas de NaN: (1) desbordamiento de fase en SineGen, que acumula hasta 2x10^5 y supera el maximo fp16 de 65504, por lo que se mantiene en fp32; (2) conversiones de ida y vuelta fp32-fp16-fp32 insertadas por el conversor entre nodos que debian permanecer en fp32, que vaciaban a cero valores pequenos de STFT (se eliminan 65 conversiones y se corrigen 26 nodos Cast con atributo `to` inconsistente); y (3) el calculo `atan2(0, 0)` en el grafo exportado, que produce NaN cuando los valores se han vaciado a cero y se propaga por una Conv y una InstanceNorm a toda la locucion. La solucion mantiene en fp32 231 de los 4741 nodos. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni el uso de RLHF o DPO.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en chino e ingles.
- Control de estilo mediante vectores de estilo predefinidos (voices/*.bin).
- Generacion de audio en formato waveform a traves de StyleTextToSpeech2Model de transformers.js.
- Inferencia en navegador con WebGPU, con seleccion automatica de precision segun el soporte de `shader-f16` del adaptador.
- Ejecucion local sin dependencia de servicios en la nube.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo TTS, no un LLM).
- No dispone de modo thinking, vision ni audio de entrada.

## Casos de uso

- Lectura por voz en aplicaciones web: integracion directa en el navegador con transformers.js y WebGPU para convertir texto en audio sin backend, aprovechando el factor de tiempo real de 0,030.
- Accesibilidad: sintesis de contenido escrito para usuarios con discapacidad visual, ejecutandose localmente y evitando el envio de texto a terceros.
- Asistentes conversacionales bilingues chino-ingles: generacion de respuestas habladas en aplicaciones de chat o soporte, con dos idiomas cubiertos por el mismo modelo.
- Aprendizaje de idiomas: reproduccion de frases en chino o ingles con voces predefinidas para practicar pronunciacion.
- Sistemas de navegacion o avisos: locuciones cortas generadas en el dispositivo, con latencia baja gracias al modelo de 82M y a la inferencia en GPU.
- Prototipado de interfaces de voz: iteracion rapida en demos web sin infraestructura de servidores TTS, usando la variante fp16 mixta en equipos con WebGPU.
- Generacion de audiolibros o contenido narrado por lotes: el modelo fp32 ofrece la maxima fidelidad (distancia log-mel de 4,1 dB frente a la referencia PyTorch) para procesamiento offline.

## Benchmarks y rendimiento

Mediciones del autor con ocho frases en chino (59 s de audio), transformers.js 4.2 sobre WebGPU, Chrome 156 en Linux, RTX 5080 con driver 615.71:

| Modelo | Salidas NaN | VRAM extra | Factor de tiempo real | Potencia GPU en ejecucion |
|---|---|---|---|---|
| fp32 | ninguna | +1268 MB | 0,030 | ~143 W |
| fp16 upstream | ~37% de muestras | no disponible | 0,030 | no disponible |
| fp16 de este repo | ninguna en 168 ejecuciones | +858 MB | 0,030 | ~133 W |

Calidad, medida como distancia log-mel tras alineamiento DTW (espectros recortados 60 dB por debajo del pico):

| Comparacion | Distancia |
|---|---|
| fp32 contra si mismo, ruido distinto | 0,7 dB |
| fp32 contra este fp16 | 3,2 dB |
| fp32 ONNX contra la referencia PyTorch | 4,1 dB |

La diferencia del fp16 tiene media cero: el nivel global difiere 0,08 dB y cada banda de frecuencia se mantiene dentro de +-0,7 dB de media.

## Requisitos de hardware

- VRAM estimada: 858 MB adicionales para la variante fp16 mixta y 1268 MB para la fp32 (medido en RTX 5080 con transformers.js).
- GPU recomendadas: cualquier GPU con soporte WebGPU; para la variante fp16 se requiere la extension `shader-f16`.
- Cabe en GPU de consumo: si, incluidas tarjetas de gama media con WebGPU; el modelo completo pesa 177 MB (fp16) o 339 MB (fp32) en disco.
- Opciones de despliegue: transformers.js con WebGPU en navegador; el formato ONNX permite otros runtimes ONNX, aunque el autor solo documenta transformers.js.
- Latencia y throughput: factor de tiempo real de 0,030 (unas 33 veces mas rapido que tiempo real) en RTX 5080; no hay datos para otras GPU.
- Consumo: aproximadamente 133 W en fp16 y 143 W en fp32 durante la inferencia en la RTX 5080 medida.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Kokoro-82M v1.1-zh ONNX webgpu) | 82M | zh, en | ONNX fp32 y fp16 mixto | Apache-2.0 | fp16 corregido, cero NaN, pensado para WebGPU |
| onnx-community/Kokoro-82M-v1.1-zh-ONNX | 82M | zh, en | ONNX fp32 y fp16 | Apache-2.0 | Upstream; su fp16 produce NaN en ~37% de muestras |
| hexgrad/Kokoro-82M-v1.1-zh | 82M | zh, en | PyTorch | Apache-2.0 | Modelo original; referencia de calidad (4,1 dB de distancia frente al ONNX fp32) |

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo original solo cubre chino e ingles; no hay soporte de otros idiomas.
- La variante fp16 mixta introduce una distancia log-mel de 3,2 dB respecto al fp32, superior a la variacion por ruido del propio fp32 (0,7 dB); para maxima fidelidad debe usarse fp32.
- La variante fp16 requiere la extension `shader-f16` del adaptador WebGPU; sin ella debe cargarse el modelo fp32, con mayor consumo de VRAM.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- No se dispone de informacion sobre sesgos del modelo base ni sobre su comportamiento en dominios especificos.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero la sintesis puede producir prosodia incorrecta o artefactos en entradas atipicas; no hay datos publicados al respecto.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribucion a hexgrad (modelo original) y a onnx-community (exportacion ONNX).
- Las mediciones de rendimiento provienen de una unica configuracion (RTX 5080, Chrome 156, Linux) y no son extrapolables a otros equipos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hsc666/Kokoro-82M-v1.1-zh-ONNX-webgpu
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M-v1.1-zh
- Exportacion ONNX upstream: https://huggingface.co/onnx-community/Kokoro-82M-v1.1-zh-ONNX
- Script de reconstruccion: `scripts/make_mixed_fp16.py` (incluido en el repositorio)
