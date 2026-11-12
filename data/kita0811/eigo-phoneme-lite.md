# kita0811/eigo-phoneme-lite

## Resumen

eigo-phoneme-lite es una compilación ONNX cuantizada del modelo vitouphy/wav2vec2-xls-r-300m-timit-phoneme, publicada por el usuario kita0811. Se trata de un reconocedor de fonemas del inglés orientado a la práctica de pronunciación, empaquetado para ejecutarse íntegramente en el navegador mediante Transformers.js y ONNX Runtime Web. El modelo no ha sido reentrenado: solo se ha reducido la precisión de almacenamiento de los pesos para disminuir el tamaño y el consumo de memoria.

La relevancia de esta ficha radica en su enfoque de despliegue: pasa de una compilación int8 de 355 MB y unos 1,2 GB de memoria en WASM con un hilo a una compilación de 175 MB y aproximadamente 0,65 GB, manteniendo una precisión prácticamente idéntica en la evaluación sintética del autor. Esto lo hace viable para aplicaciones web de práctica de pronunciación sin backend dedicado, especialmente para hablantes japoneses de inglés.

El modelo base es un wav2vec2 XLS-R de 300 millones de parámetros afinado sobre TIMIT para reconocimiento de fonemas, con un inventario IPA de 39 fonemas derivado de TIMIT y 44 logits por trama (incluido el token CTC blank). La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer convolucional + atención), compilado a ONNX |
| Parametros totales | 300 M (modelo base XLS-R); tamaño del repo 0,2 GB |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de ASR por tramas; ventana dependiente del audio de entrada) |
| Tipos de cuantizacion | MatMul en 4 bits (`MatMulNBits`, simétrico, block size 128); Conv en int8 con `DequantizeLinear` antes de la convolución; existe también una compilación int8 (355 MB) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_q4.onnx`), tokenizer en JSON |

## Arquitectura y entrenamiento

El modelo base vitouphy/wav2vec2-xls-r-300m-timit-phoneme es un wav2vec2 XLS-R de 300 millones de parámetros afinado sobre el corpus TIMIT para reconocimiento de fonemas. La salida es de 44 logits por trama, correspondientes a un inventario IPA de 39 fonemas derivado de TIMIT, con el token CTC blank mapeado a `[PAD]` (id 41). El entrenamiento original se realizó sobre habla leída de nativos, no sobre habla de aprendices.

La compilación de kita0811 no reentrena el modelo: solo modifica la precisión de almacenamiento de los pesos. Las matrices de las capas MatMul se cuantizan a 4 bits con `MatMulNBitsQuantizer` de ONNX Runtime (simétrico, block size 128). Los pesos de las convoluciones (extractor de características y convolución posicional) se almacenan como int8 por canal de salida y se restauran a float mediante `DequantizeLinear` justo antes de la convolución, que sigue ejecutándose en float. Los ficheros de tokenizer y configuración provienen de robg/speako-phoneme-recognizer (Apache-2.0), que fue lo que permitió cargar el modelo base en Transformers.js.

## Capacidades

- Reconocimiento automático de fonemas del inglés a partir de audio a 16 kHz.
- Salida en notación IPA con 39 fonemas del inventario TIMIT y token CTC blank.
- Ejecución en navegador mediante Transformers.js y ONNX Runtime Web (WASM), sin servidor.
- Detección de errores de pronunciación típicos de aprendices japoneses (L/R, th, inserción de vocales, s/sh) según la evaluación del autor.
- Integración con el pipeline `automatic-speech-recognition` de Transformers.js.
- No soporta tool calling, agentes, visión, audio generativo ni razonamiento multi-paso: es un modelo puramente acústico-fonético.

## Casos de uso

- Aplicación web de práctica de pronunciación: el modelo se carga con `dtype: "q4"` y `device: "wasm"` y procesa audio del micrófono del usuario en el navegador, comparando la secuencia de fonemas emitida con la esperada. El tamaño de 175 MB y los ~0,65 GB de memoria lo hacen viable en equipos de consumo.
- Detección de errores de pronunciación en tiempo real: la salida por tramas permite alinear fonemas y señalar sustituciones (por ejemplo, L por R) o inserciones vocálicas, útil en herramientas de feedback inmediato.
- Evaluación formativa en plataformas educativas: al ejecutarse en cliente, evita enviar grabaciones de voz a servidores externos, lo que simplifica el cumplimiento de privacidad en entornos escolares.
- Prototipado rápido de funcionalidades de fonética: investigadores pueden integrar el pipeline en notebooks o demos web sin infraestructura GPU.
- Filtrado y etiquetado de corpus de audio: extracción de transcripciones fonéticas para análisis lingüístico o para construir datasets de pronunciación.
- Pruebas de regresión en pipelines de TTS/ASR: verificación de que la salida fonética de un sistema de síntesis coincide con la esperada, usando el modelo como referencia ligera.

## Benchmarks y rendimiento

El autor publica una evaluación propia sobre 60 enunciados sintéticos (TTS en inglés estadounidense, la mitad con errores típicos de aprendices japoneses), puntuada con las reglas de alineación fonética de su aplicación. No es un benchmark estándar.

| Modelo | Errores detectados | Falsos positivos en habla correcta |
|---|---|---|
| Compilación int8 (355 MB) | 21 / 30 | 1 / 30 |
| Este modelo (175 MB) | 22 / 30 | 1 / 30 |

No se han publicado resultados de benchmarks estándar (WER fonético, PER, etc.) en la información disponible.

## Requisitos de hardware

- Memoria estimada en ONNX Runtime Web (WASM, 1 hilo): ~0,65 GB para la compilación q4; ~1,2 GB para la int8.
- Tamaño en disco: 175 MB (q4) frente a 355 MB (int8).
- GPU recomendadas: no requiere GPU; está diseñado para WASM en navegador. Puede ejecutarse en CPU de escritorio o portátil sin aceleración.
- Cabe en cualquier equipo de consumo con navegador moderno; no se han publicado requisitos mínimos oficiales.
- Opciones de despliegue: Transformers.js (`@huggingface/transformers`) con `device: "wasm"`; ONNX Runtime Web; también puede ejecutarse con ONNX Runtime nativo fuera del navegador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| kita0811/eigo-phoneme-lite | 300 M (base) | no disponible | en | Apache-2.0 | ONNX q4 | 175 MB, ~0,65 GB RAM en WASM |
| vitouphy/wav2vec2-xls-r-300m-timit-phoneme | 300 M | no disponible | en | Apache-2.0 | safetensors/PyTorch | Modelo base, sin compilar para navegador |
| robg/speako-phoneme-recognizer | no disponible | no disponible | en | Apache-2.0 | Transformers.js | Origen de los ficheros de tokenizer; compatible con Transformers.js |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo base se afinó sobre habla leída de nativos (TIMIT); su comportamiento sobre habla de aprendices no está validado con benchmarks formales.
- La evaluación del autor es sintética (TTS) y con solo 60 enunciados: no debe interpretarse como una medida robusta de precisión.
- Riesgo de alucinación fonética: al ser un modelo CTC, puede producir secuencias plausibles pero incorrectas en audio ruidoso o con acentos no vistos.
- Solo soporta inglés; no hay capacidades multilingües.
- El inventario de 39 fonemas está limitado al esquema TIMIT; variantes alofónicas o fonemas fuera de ese inventario no se representan.
- La licencia Apache-2.0 permite uso comercial, pero el autor indica que la aplicación original es no comercial; conviene revisar las condiciones del modelo base y del tokenizer de terceros.
- El rendimiento en navegador depende del soporte WASM del dispositivo; en móviles de gama baja la memoria de ~0,65 GB puede ser limitante.
- No se han publicado métricas de latencia ni de throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kita0811/eigo-phoneme-lite
- Modelo base: https://huggingface.co/vitouphy/wav2vec2-xls-r-300m-timit-phoneme
- Tokenizer de origen: https://huggingface.co/robg/speako-phoneme-recognizer
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
