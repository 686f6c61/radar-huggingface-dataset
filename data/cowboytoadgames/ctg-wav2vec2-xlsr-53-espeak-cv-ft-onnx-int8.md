# CowboyToadGames/ctg-wav2vec2-xlsr-53-espeak-cv-ft-onnx-int8

## Resumen

`ctg-wav2vec2-xlsr-53-espeak-cv-ft-onnx-int8` es una conversion a formato ONNX con cuantizacion int8 del modelo `facebook/wav2vec2-xlsr-53-espeak-cv-ft` de Meta AI, realizada por Cowboy Toad Games LTD. No se trata de un modelo nuevo ni de un fine-tuning adicional: los pesos son los del modelo original, unicamente transformados para su despliegue en entornos ONNX Runtime con pesos de 8 bits. El objetivo declarado por el autor es el alineamiento forzado de una secuencia de fonemas conocida contra audio grabado, para sincronizar las formas de la boca de un personaje con el habla (lip sync).

La arquitectura subyacente es wav2vec2 con preentrenamiento XLSR-53 (multilingue, 53 idiomas) y una cabeza CTC, afinada por Meta sobre Common Voice para emitir log-probabilidades por fotograma sobre un vocabulario de tokens foneticos IPA de eSpeak. La salida es una matriz de log-probabilidades de forma `[1, frames, 392]`, con un fotograma cada 20 ms que cubre una ventana de 25 ms, y donde el ultimo token del vocabulario es el blank de CTC.

Su relevancia es practica: al estar exportado a ONNX con cuantizacion dinamica int8 (solo en operadores `MatMul` y `Gemm`), el modelo puede ejecutarse en CPU con ONNX Runtime sin dependencia de PyTorch, lo que reduce el coste de despliegue en pipelines de animacion o herramientas de escritorio. El repositorio ocupa 0,4 GB y la licencia es Apache-2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (preentrenamiento XLSR-53) con cabeza CTC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | entrada de audio entre 400 muestras (25 ms) y 1.920.000 muestras (120 s) |
| Tipos de cuantizacion | int8 con cuantizacion dinamica de ONNX Runtime (solo `MatMul` y `Gemm`) |
| Idiomas soportados | no disponible (el preentrenamiento XLSR-53 es multilingue, pero la model card no detalla idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX, opset 18 |

## Arquitectura y entrenamiento

El modelo es un transformer wav2vec2 con preentrenamiento XLSR-53, que aprende representaciones de habla a partir de audio sin etiquetar en 53 idiomas, seguido de un afinamiento supervisado por los autores originales de Meta AI sobre Common Voice con una cabeza CTC que emite fonemas IPA de eSpeak. La entrada es audio PCM mono a 16 kHz en float32, normalizado a media cero y varianza unitaria, y la salida son log-probabilidades por fotograma sobre un vocabulario de 392 tokens (el ultimo de ellos es el blank de CTC).

La conversion realizada por Cowboy Toad Games LTD no introduce entrenamiento ni fine-tuning adicional: es una exportacion a ONNX (opset 18) con cuantizacion dinamica int8 aplicada unicamente a los operadores `MatMul` y `Gemm`. El resto de operaciones permanece en su precision original. El paper de referencia del modelo base es Xu, Baevski y Auli, *Simple and Effective Zero-shot Cross-lingual Phoneme Recognition* (arXiv:2109.11680, 2021).

## Capacidades

- Reconocimiento fonetico: emite log-probabilidades por fotograma sobre un vocabulario de fonemas IPA de eSpeak, no texto ortografico.
- Alineamiento forzado: permite alinear una secuencia de fonemas conocida contra audio grabado, obteniendo la temporalidad de cada fonema.
- Procesamiento de audio de 25 ms a 120 s por inferencia, con resolucion temporal de 20 ms por fotograma.
- Ejecucion en CPU mediante ONNX Runtime, sin necesidad de GPU ni de PyTorch.
- Salida determinista en formato de matriz `[1, frames, 392]` apta para post-proceso con CTC.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente acustico.
- No genera texto ni traduccion; el paso de fonemas a texto queda fuera del modelo.

## Casos de uso

- Sincronizacion labial de personajes: dado un guion con su transcripcion fonetica y el audio grabado, el modelo produce las log-probabilidades por fotograma que permiten obtener los tiempos de cada fonema y mapearlos a visemas para animar la boca de un personaje.
- Herramientas de animacion en escritorio: al ser ONNX int8 y ejecutable en CPU, puede integrarse en aplicaciones locales de animacion sin requerir GPU ni frameworks pesados.
- Post-proceso de doblaje: alinear la pista de voz doblada contra la secuencia fonetica del guion original para detectar desajustes temporales y ajustar la duracion de las frases.
- Investigacion fonetica: extraer la temporalidad de fonemas en corpus de habla para estudios de duracion, coarticulacion o comparacion entre hablantes.
- Pipelines de subtitulado fonetico: generar marcas temporales a nivel de fonema que luego se agregan a nivel de palabra o silaba para subtitulos sincronizados.
- Validacion de pronunciacion: comparar la secuencia fonetica esperada con la alineacion obtenida para detectar desviaciones en grabaciones de aprendices o en control de calidad de locuciones.
- Prototipado rapido en servidores sin GPU: desplegar el modelo en un contenedor CPU-only con ONNX Runtime para pruebas de concepto de alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso CPU; en GPU, el repositorio pesa 0,4 GB en int8, por lo que la huella de memoria es inferior a 1 GB en la mayoria de configuraciones.
- GPU recomendadas: no disponibles; el modelo esta disenado para ejecucion en CPU con ONNX Runtime (`CPUExecutionProvider`).
- Cabe en GPU consumer: si, cualquier GPU con al menos 1-2 GB de memoria libre puede alojarlo, aunque no es el escenario previsto por el autor.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con soporte de cuantizacion dinamica int8 ya aplicada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ctg-wav2vec2-xlsr-53-espeak-cv-ft-onnx-int8 | no disponible | 25 ms - 120 s | ONNX int8 | Apache-2.0 | Conversion int8 del modelo de Meta para CPU |
| facebook/wav2vec2-xlsr-53-espeak-cv-ft | no disponible | no disponible en la informacion | PyTorch (safetensors) | Apache-2.0 | Modelo base original, sin cuantizar |
| Alternativas de alineamiento forzado (p. ej. Montreal Forced Aligner, WhisperX) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo de reconocimiento de voz a texto: emite fonemas IPA, no palabras; requiere un paso posterior de mapeo fonema-texto.
- El alineamiento forzado presupone que la secuencia de fonemas de entrada es correcta; errores en la transcripcion fonetica degradan el resultado.
- La cuantizacion int8 puede introducir una perdida de precision respecto al modelo original en float32; no se han publicado metricas de degradacion.
- La model card no detalla los idiomas cubiertos ni el rendimiento por idioma, pese al preentrenamiento multilingue XLSR-53.
- No se han publicado benchmarks ni evaluaciones de calidad en la informacion disponible.
- Licencia Apache-2.0: permite uso comercial y modificacion, con atribucion a Meta AI y a Cowboy Toad Games LTD por la conversion.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion ni validacion comunitaria.
- La fecha de creacion indicada (2026-11-18) es posterior a la de esta ficha; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CowboyToadGames/ctg-wav2vec2-xlsr-53-espeak-cv-ft-onnx-int8
- Modelo base: https://huggingface.co/facebook/wav2vec2-xlsr-53-espeak-cv-ft
- Paper del modelo base: https://arxiv.org/abs/2109.11680
- ONNX Runtime: https://onnxruntime.ai/
