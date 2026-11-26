# moonbox-dev/magenta-realtime-2-small-ONNX

## Resumen

Magenta RealTime 2 (small) ONNX es una conversión a formato ONNX del modelo `google/magenta-realtime-2` (variante "small"), publicada por el usuario moonbox-dev. El modelo original es un sistema de generación musical en tiempo real desarrollado por Google dentro del ecosistema Magenta, orientado a la síntesis de audio estéreo a 48 kHz a partir de indicaciones textuales y de estilo. Esta versión ONNX tiene como objetivo permitir la inferencia en dispositivo mediante ONNX Runtime, con soporte para CPU, CUDA y DirectML.

La relevancia de esta ficha radica en que empaqueta un modelo de generación musical de Google en un formato portable y ejecutable fuera del ecosistema PyTorch, con dos precisiones (fp16 e int8), y ofrece métricas de fidelidad respecto al modelo original (KL, top-1, SNR del códec) y de rendimiento (frames por segundo en CUDA). El repositorio ocupa 1,9 GB e incluye los grafos ONNX separados por componente (temporal, depth, mapper, text_encoder, music_encoder, codec, pretrained_vector_quantizer), junto con el pipeline en Python, el tokenizador SentencePiece y los estados iniciales.

La información disponible no detalla el número de parámetros del modelo original, la longitud de contexto en tokens ni los idiomas soportados; estos datos se marcan como no disponibles. La licencia declarada es CC-BY-4.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con transformadores temporal y de profundidad, códec neural y encoder de estilo MusicCoCa; empaquetado como grafos ONNX independientes |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (pesos fp16 con aritmética fp32 en los transformadores; códec y MusicCoCa en fp32) e int8 weight-only (transformadores temporal y depth en int8; códec y MusicCoCa en fp32) |
| Idiomas soportados | no disponible (el modelo es de generación musical; el texto de condicionamiento se procesa con SentencePiece) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (grafos `.onnx`), más `.npz` para estados y embeddings de MusicCoCa, y `spm.model` para el tokenizador |

## Arquitectura y entrenamiento

El modelo base `google/magenta-realtime-2` es un sistema de generación musical en streaming. La conversión ONNX descompone el modelo en varios grafos: `temporal.onnx` (transformador temporal, 410,9 MB en fp16 y 208,2 MB en int8), `depth.onnx` (transformador de profundidad, 74,0 MB en fp16 y 37,3 MB en int8), `text_encoder.onnx` (419,4 MB), `music_encoder.onnx` (371,0 MB), `mapper.onnx` (86,2 MB), `pretrained_vector_quantizer.onnx` (72,4 MB) y `codec.onnx` (213,7 MB). Los pesos de MusicCoCa se distribuyen como `musiccoca_audio.npz` (0,5 MB) y los estados iniciales como `states.npz` (12,9 MB). El pipeline de inferencia se implementa en `pipeline.py` (20,5 kB).

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La información disponible se limita a la conversión y a la validación de fidelidad respecto al modelo PyTorch original. Las innovaciones técnicas documentadas son la cuantización con preservación de calidad (en int8 weight-only se mantiene un top-1 del 94,1 % y un SNR de códec de 99,5 dB) y la separación en grafos independientes para permitir ejecución en ONNX Runtime sobre CPU, CUDA y DirectML.

## Capacidades

- Generación de audio musical estéreo a 48 kHz a partir de condicionamiento textual y de estilo.
- Generación en streaming: el pipeline está pensado para producir audio de forma continua en tiempo real (32,4 frames/s en fp16 con CUDA; 27,9 frames/s en int8 con CUDA).
- Condicionamiento por estilo mediante el encoder MusicCoCa, que mapea audio y texto a un espacio de estilo común.
- Codificación y decodificación de audio mediante el códec neural incluido (`codec.onnx`).
- Tokenización de texto con SentencePiece (`spm.model`).
- Ejecución en ONNX Runtime con backends CPU, CUDA y DirectML.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada general ni multilingüismo textual.

## Casos de uso

- Generación musical en directo desde el navegador o una aplicación de escritorio: al ejecutarse sobre ONNX Runtime con DirectML o CPU, el modelo puede integrarse en aplicaciones nativas sin depender de PyTorch, produciendo audio estéreo a 48 kHz en streaming.
- Instalaciones artísticas interactivas: el condicionamiento por texto y por estilo (MusicCoCa) permite que una instalación reaccione a entradas del público generando música continua en tiempo real.
- Prototipado de bandas sonoras adaptativas en videojuegos: el pipeline en streaming permite generar capas musicales que cambian según el estado del juego, con la ventaja de ejecutarse en el propio dispositivo.
- Herramientas de creación musical para DAW: la salida a 48 kHz estéreo y el control por estilo permiten integrar el modelo como fuente generativa dentro de un flujo de producción musical.
- Investigación en generación musical: la disponibilidad de grafos ONNX separados por componente facilita el análisis y la sustitución de módulos (por ejemplo, el encoder de texto o el códec) en experimentos académicos.
- Despliegue en hardware sin GPU dedicada: la variante int8 reduce el tamaño de los transformadores a la mitad (208,2 MB frente a 410,9 MB del temporal) y mantiene 27,9 frames/s en CUDA, lo que abre la puerta a ejecución en CPU y en dispositivos con aceleradores integrados.

## Benchmarks y rendimiento

Los datos disponibles son métricas de fidelidad respecto al modelo PyTorch original y de velocidad, medidas por el autor de la conversión. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Metrica | fp16 | int8 |
|---|---|---|
| KL respecto al original | 1,8e-6 (p95 3,3e-6) | 0,0047 (p95 0,0087) |
| Top-1 de coincidencia | 99,9 % (nivel 0: 100 %) | 94,1 % (nivel 0: 97,7 %) |
| SNR del codec | 99,5 dB | 99,5 dB |
| Estilo (MusicCoCa) | tokens iguales en 3 de 3 prompts | tokens iguales en 3 de 3 prompts |
| Rendimiento en CUDA | 32,4 frames/s | 27,9 frames/s |

El conjunto de evaluación indicado en la model card es VoiceBank-DEMAND (824 enunciados ruidosos), empleado para medir la calidad de la señal procesada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia de tamaño, los grafos suman aproximadamente 1,66 GB en fp16 y 1,21 GB en int8 (sin contar los ficheros `.npz` y el tokenizador).
- GPU recomendadas: no se especifican modelos concretos; el autor reporta medidas en CUDA sin indicar la GPU empleada.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño de los grafos en int8 (1,21 GB) es compatible con GPUs de consumo de 8 GB o más, pero no hay validación publicada.
- Opciones de despliegue: ONNX Runtime con backends CPU, CUDA y DirectML; el repositorio incluye `pipeline.py` como referencia de ejecución.
- Latencia y throughput: 32,4 frames/s en fp16 y 27,9 frames/s en int8, medidos en CUDA. No se proporcionan cifras de latencia en CPU ni en DirectML.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moonbox-dev/magenta-realtime-2-small-ONNX | no disponible | no disponible | ONNX | CC-BY-4.0 | Hugging Face |
| google/magenta-realtime-2 | no disponible | no disponible | PyTorch (formato original) | no disponible en la información | Hugging Face |
| Otras alternativas de generación musical open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de generación musical en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo original; al ser un modelo generativo de audio, puede reproducir estilos o patrones presentes en sus datos de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido textual, pero el modelo puede generar audio incoherente o de baja calidad fuera de las condiciones de condicionamiento previstas.
- Limitaciones de contexto e idioma: no se especifica la longitud máxima de condicionamiento textual ni los idiomas admitidos por el tokenizador.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base `google/magenta-realtime-2` antes de un despliegue en producción.
- La conversión no incluye validación en CPU ni en DirectML; las únicas métricas de rendimiento publicadas son en CUDA.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por parte de la comunidad.
- La cuantización int8 reduce el top-1 al 94,1 %, lo que puede degradar la fidelidad musical en comparación con fp16.

## Enlaces

- [Hugging Face: moonbox-dev/magenta-realtime-2-small-ONNX](https://huggingface.co/moonbox-dev/magenta-realtime-2-small-ONNX)
- [Modelo base: google/magenta-realtime-2](https://huggingface.co/google/magenta-realtime-2)
- [arXiv:2508.04651](https://arxiv.org/abs/2508.04651)
- [arXiv:2508.05207](https://arxiv.org/abs/2508.05207)
- [arXiv:2205.01917](https://arxiv.org/abs/2205.01917)
- [arXiv:2208.12415](https://arxiv.org/abs/2208.12415)
