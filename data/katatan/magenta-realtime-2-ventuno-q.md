# KATATAN/magenta-realtime-2-ventuno-q

## Resumen

Magenta RealTime 2 (small) es un modelo de generacion de audio musical en tiempo real desarrollado originalmente por Google DeepMind. Esta ficha concreta, publicada por el usuario KATATAN, es una compilacion no oficial de los pesos originales para ejecutarse en la NPU del dispositivo Arduino VENTUNO Q (SoC QCS8275 con acelerador Hexagon V75). No se trata de un modelo nuevo, sino de una conversion del checkpoint de Google a formato ONNX y su compilacion con Qualcomm AI Hub Workbench para el runtime QNN 2.51.

El modelo resuelve el problema de generar musica de forma continua y controlable en tiempo real sobre hardware embebido de baja potencia, delegando la inferencia en la NPU en lugar de la CPU. La build incluye el paso temporal, doce grafos independientes para el paso de profundidad (uno por nivel de codebook) y un decodificador SpectroStream reescrito para operaciones compatibles con QNN HTP. El resto del pipeline (encoder, embeddings y MusicCoCa) permanece en CPU y proviene de la conversion de blanchon.

La relevancia de esta ficha es acotada: es un artefacto de despliegue especifico para un dispositivo concreto, util para quien quiera reproducir la aplicacion MRT2 Studio en el VENTUNO Q, pero no para uso general en servidores o GPUs convencionales. El repositorio ocupa 0,8 GB y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo generativo de audio de Google Magenta RealTime 2 (small); pasos temporal y de profundidad con codebooks, mas decodificador SpectroStream |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Compilado para QNN HTP con fp16 interno (valores escalados por 256 para evitar desbordamiento); no se documentan otros formatos |
| Idiomas soportados | no disponible (modelo de audio musical, no linguistico) |
| Licencia | CC-BY-4.0 (pesos); codigo base Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`) mas binario de contexto QNN (`model.bin`), empaquetados en archivos `.onnx.zip` |

## Arquitectura y entrenamiento

El modelo subyacente es Magenta RealTime 2 (small) de Google DeepMind, presentado en el trabajo «Live Music Models» (NeurIPS Creative AI, 2025). La generacion se estructura en dos etapas: un paso temporal que produce la secuencia latente y un paso de profundidad que resuelve los 12 niveles de codebook. La decodificacion a audio la realiza SpectroStream, un decodificador que reconstruye la forma de onda a partir de la representacion espectral latente.

Esta build concreta introduce tres modificaciones sobre el export ONNX original de blanchon. Primero, el paso de profundidad se divide en 12 grafos, cada uno con solo los pesos de salida 768 × 1024 de su nivel, en lugar del vocabulario completo de 12294 tokens. Segundo, el decodificador SpectroStream se reescribe con operaciones compatibles con ONNX y QNN HTP, con ventana de 38 frames, sustituyendo convoluciones transpuestas por `ConvTranspose`, la STFT inversa por productos matriciales y escalando los valores internos por 256 para evitar desbordamiento en fp16. Tercero, todos los grafos se compilan con `--target_runtime precompiled_qnn_onnx --truncate_64bit_io --qairt_version 2.51`. No se documentan en la informacion disponible detalles sobre el dataset de entrenamiento ni sobre fases de RLHF o ajuste fino.

## Capacidades

- Generacion de audio musical continua y en tiempo real sobre la NPU del Arduino VENTUNO Q.
- Control de estilo en tiempo real mediante MusicCoCa (ejecutado en CPU), que permite dirigir la generacion desde un navegador.
- Generacion condicionada por texto o por embeddings de estilo, segun el pipeline original de Magenta RealTime 2.
- Paso temporal y paso de profundidad desacoplados en grafos independientes, lo que permite paralelizar o distribuir la inferencia entre NPU y CPU.
- Decodificacion de audio mediante SpectroStream con ventana de 38 frames.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada (speech) en la informacion disponible.

## Casos de uso

- Instalaciones artisticas interactivas: el modelo permite generar musica continua cuyo estilo se modifica desde un navegador, adecuado para exposiciones o performances donde se requiere respuesta inmediata sin depender de un servidor externo.
- Prototipado de aplicaciones musicales embebidas: sirve como base para desarrolladores que quieran experimentar con generacion musical en un dispositivo de bolsillo con NPU dedicada.
- Demostraciones de inferencia en NPU: util para evaluar el rendimiento de QNN HTP en tareas generativas de audio y comparar latencias frente a ejecucion en CPU.
- Educacion y divulgacion: permite mostrar en un aula o taller como un modelo generativo de audio se ejecuta localmente en hardware de bajo consumo.
- Investigacion en generacion musical en tiempo real: la separacion en grafos por nivel de codebook facilita experimentos de ablacion sobre el paso de profundidad.
- Desarrollo de juguetes o instrumentos musicales conectados: el bajo consumo de la NPU permite integraciones en dispositivos alimentados por bateria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: Arduino VENTUNO Q (SoC Qualcomm QCS8275 con Hexagon V75). Los modelos se compilaron para este dispositivo y no se espera que funcionen en otro hardware.
- Runtime: `onnxruntime-qnn` 2.7.0 (QNN 2.51). Los modelos compilados con `--qairt_version 2.51` requieren un runtime compatible.
- VRAM estimada: no disponible; el modelo se ejecuta en la NPU y en la CPU del dispositivo, no en una GPU convencional.
- GPU recomendadas: no aplica; no se documenta soporte para A100, H100 ni RTX 4090.
- Opciones de despliegue: aplicacion MRT2 Studio sobre Arduino VENTUNO Q; descarga de pesos con `hf download KATATAN/magenta-realtime-2-ventuno-q --include "*.onnx.zip"`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KATATAN/magenta-realtime-2-ventuno-q | no disponible | no disponible | NPU Arduino VENTUNO Q | CC-BY-4.0 | HuggingFace (0 descargas) |
| google/magenta-realtime-2 | no disponible | no disponible | GPU/CPU general | CC-BY-4.0 (pesos) | HuggingFace oficial |
| blanchon/magenta-realtime-2-onnx | no disponible | no disponible | CPU/ONNX Runtime | CC-BY-4.0 | HuggingFace |

Las tres variantes comparten los mismos pesos de origen; difieren en el formato de exportacion y en el hardware objetivo. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Build no oficial: no esta afiliada ni respaldada por Google, Qualcomm ni Arduino.
- Dependencia estricta de hardware: compilada exclusivamente para el Arduino VENTUNO Q; no se espera que funcione en otras NPU ni en GPUs.
- Dependencia de version del runtime: requiere `onnxruntime-qnn` 2.7.0 (QNN 2.51); una version distinta puede romper la compatibilidad del binario de contexto.
- Solo cubre la parte NPU: el encoder, los embeddings y MusicCoCa deben obtenerse de `blanchon/magenta-realtime-2-onnx` y ejecutarse en CPU.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo musical, el riesgo se traduce en artefactos o salidas no deseadas mas que en afirmaciones factuales.
- Restricciones de uso: se aplican los terminos de uso de MRT2 de Google; no generar contenido infractor. Los pesos se distribuyen «AS IS», sin garantia.
- Atribucion obligatoria: CC-BY-4.0 exige atribuir a Google LLC / Google DeepMind.
- Sin datos de benchmarks ni de latencia: no es posible estimar el rendimiento real sin probarlo en el dispositivo.

## Enlaces

- HuggingFace: https://huggingface.co/KATATAN/magenta-realtime-2-ventuno-q
- Modelo base original: https://huggingface.co/google/magenta-realtime-2
- Export ONNX de referencia: https://huggingface.co/blanchon/magenta-realtime-2-onnx
- Repositorio MRT2 Studio: https://github.com/katatan-org/MRT2-Arduino-VENTUNO-Q/
- Codigo base de Magenta RealTime: https://github.com/magenta/magenta-realtime
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode
- Paper citado: Caillon, Antoine et al., «Live Music Models», NeurIPS Creative AI, 2025.
