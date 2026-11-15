# graehl/sherpa-onnx-fusion-test-lm

## Resumen

El modelo `graehl/sherpa-onnx-fusion-test-lm` es un LSTM a nivel de carácter publicado por el usuario graehl como fixture de pruebas, no como un modelo de lenguaje destinado a uso real. Se trata de una única capa LSTM de 256 unidades que opera sobre un vocabulario de 30 símbolos (separador, símbolo desconocido, apóstrofo, las 26 letras mayúsculas y el espacio codificado como `▁`, U+2581), con un total de 406.814 parámetros y un peso de 1,6 MB en formato ONNX. Su propósito declarado es verificar que el scorer recurrente `onnx-rnn` del fork `sherpa-onnx-fusion` carga, ejecuta pasos y produce resultados idénticos en ejecución monohilo y multihilo.

El modelo fue entrenado durante 15 minutos con un tamaño deliberadamente diminuto sobre el texto de language model de LibriSpeech (OpenSLR recurso 11, `librispeech-lm-norm.txt.gz`), reservando las últimas 20.000 líneas como conjunto de validación. El autor reporta 2,18 bits por carácter en ese conjunto retenido, una cifra que califica explícitamente de débil. No debe emplearse para mejorar reconocimiento, reportar tasas de error ni como baseline.

Su relevancia es, por tanto, estrictamente de ingeniería: sirve como pieza de integración en el pipeline de fusión de language model dentro de un reconocedor de voz basado en sherpa-onnx. La licencia CC BY 4.0 deriva de la licencia de LibriSpeech, cuyos textos provienen de libros de dominio público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM de una capa, a nivel de caracter |
| Parametros totales | 406.814 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo recurrente por paso, sin ventana documentada) |
| Tipos de cuantizacion | no disponible (pesos ONNX en float32 segun el grafo descrito) |
| Idiomas soportados | en (ingles, texto en mayusculas) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (`en-char-lstm-256x1.onnx`), con vocabulario en `en-char-lstm-256x1.units.hex` |

## Arquitectura y entrenamiento

La arquitectura es una única capa LSTM de 256 unidades que procesa caracteres de uno en uno. El grafo ONNX expone una interfaz por paso: entradas `tokens` (int64, `[batch, 1]`, el símbolo anterior), `h` y `c` (float32, `[1, batch, 256]`); salidas `logp` (float32, `[batch, 30]`, logaritmos neperianos de probabilidad del siguiente símbolo), `h_out` y `c_out`. El vocabulario consta de 30 unidades en orden de modelo, codificadas en hexadecimal UTF-8 en el fichero `.units.hex`.

El entrenamiento se realizó sobre el texto de language model de LibriSpeech (OpenSLR recurso 11), con las últimas 20.000 líneas reservadas para validación, durante 15 minutos y sin ajuste fino de tasa de aprendizaje ni regularización. El autor indica explícitamente que un modelo destinado a uso real se entrenaría de forma muy distinta incluso a este tamaño y velocidad: durante mucho más tiempo, con hiperparámetros ajustados y evaluado sobre reconocimiento, no solo sobre texto retenido. No se documentan fases de RLHF, DPO ni innovaciones técnicas adicionales.

## Capacidades

- Modelado de lenguaje a nivel de carácter sobre texto inglés en mayúsculas.
- Puntuación de secuencias de caracteres mediante log-probabilidades del siguiente símbolo, apta para integrarse en decodificadores con fusión de language model.
- Ejecución por pasos con estado recurrente explícito (`h`, `c`), lo que permite integración en decodificadores de búsqueda por haces.
- Soporte de batch en el grafo ONNX (dimensión `batch` en todas las entradas y salidas).
- Uso como fixture de pruebas de humo para verificar carga, avance de estado y determinismo entre ejecución monohilo y multihilo en `sherpa-onnx-fusion`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Prueba de humo del scorer `onnx-rnn`: el modelo se descarga en el check del programa de batch paralelo del fork `sherpa-onnx-fusion` para confirmar que el scorer carga y avanza correctamente en el decodificador `prefix_beam_search`.
- Verificación de determinismo multihilo: al comparar resultados entre una y varias hebras, el fixture permite detectar condiciones de carrera o divergencias numéricas en la implementación del scorer.
- Validación de integración de vocabularios hexadecimales: el par `.onnx` + `.units.hex` ejercita la ruta de carga de vocabulario con `vocab-encoding=hex` en la configuración del scorer.
- Comprobación de que el peso de fusión tiene efecto observable: con `--scorer.weight=1.0` el modelo altera un par de palabras en las tres grabaciones de prueba del reconocedor, lo que evidencia que el scorer está activo; con 0.3 no cambia ninguna.
- Test de regresión en CI del fork: cualquier cambio en el cargador ONNX, en la gestión del estado recurrente o en el decodificador puede contrastarse contra el comportamiento esperado de este fixture.
- Ejercicio docente o de depuración de decodificación con LM: sirve para trazar cómo un LM a nivel de carácter influye en un beam search sin depender de un modelo grande ni de recursos externos.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Bits por caracter (held-out) | 2,18 | Últimas 20.000 líneas del texto LM de LibriSpeech |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER) en la información disponible. El autor advierte que la cifra de 2,18 bits por carácter es una medición de este fichero y que el modelo es débil.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el peso del modelo es de 1,6 MB y el estado recurrente por batch es de 2 × 256 float32 por capa.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con soporte ONNX Runtime es suficiente, incluidas integradas.
- Cabe en cualquier GPU de consumo y también en CPU; el cuello de botella no es el modelo sino el decodificador del reconocedor.
- Opciones de despliegue: ONNX Runtime a través del scorer `onnx-rnn` de `sherpa-onnx-fusion`; no se documentan otras rutas (vLLM, llama.cpp, Ollama, TGI no aplican a este formato y arquitectura).
- Latencia y throughput: no disponibles; el autor no publica cifras y el modelo está pensado para pasos individuales dentro de un decodificador, no para generación de texto.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoría (LSTM a nivel de carácter para fusión de LM en reconocimiento de voz) en la información disponible, y el propio autor desaconseja su uso como baseline.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo es solo para pruebas de humo: no debe usarse para mejorar reconocimiento, reportar tasas de error ni como baseline.
- Entrenamiento de 15 minutos sin ajuste de tasa de aprendizaje ni regularización; calidad muy limitada (2,18 bits por carácter en held-out).
- Vocabulario restringido a 30 símbolos: separador, desconocido, apóstrofo, A-Z y espacio como `▁`; el texto debe estar en mayúsculas.
- Solo inglés; no cubre otros idiomas ni minúsculas, dígitos o signos de puntuación fuera del conjunto definido.
- Riesgo de alucinación y salidas incoherentes inherente a un modelo de este tamaño y entrenamiento; no apto para producción.
- El peso de fusión 1.0 no está ajustado ni se recomienda; se eligió solo porque hace visible el efecto del scorer en tres grabaciones de prueba.
- Licencia CC BY 4.0 heredada de LibriSpeech; permite uso comercial con atribución, pero el modelo no es adecuado para tal uso por sus limitaciones técnicas.
- No se documentan sesgos específicos más allá de los derivados del corpus de libros de dominio público de LibriSpeech.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/graehl/sherpa-onnx-fusion-test-lm
- Repositorio del fork: https://github.com/graehl/sherpa-onnx-fusion
- sherpa-onnx original: https://github.com/k2-fsa/sherpa-onnx
- Recurso LibriSpeech LM (OpenSLR 11): https://www.openslr.org/11/
