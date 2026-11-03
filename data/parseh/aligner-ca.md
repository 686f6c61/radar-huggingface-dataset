# parseh/aligner-ca

## Resumen

Parseh Catalan forced-alignment network es un modelo CTC derivado de `ccoreilly/wav2vec2-large-xlsr-catala` (a su vez basado en `facebook/wav2vec2-large-xlsr-53`) y publicado por el proyecto Parseh. Su funcion no es transcribir audio, sino alinear texto de subtitulos ya conocido con audio en catalan a 16 kHz mono, produciendo marcas temporales a nivel de palabra y de caracter. Para ello emplea una red wav2vec2 con cabeza CTC convertida a ONNX (opset 17) y cuantizada dinamicamente a int8, que se ejecuta localmente con ONNX Runtime y NumPy mediante alineamiento de Viterbi sobre las posteriores CTC.

El modelo resuelve un problema muy concreto en pipelines de subtitulado: cuando se dispone de la transcripcion correcta pero se necesitan timestamps precisos. Al ser una version cuantizada del modelo base, mantiene la coherencia de los argmax por frame respecto al modelo fp32 (acuerdo 1.0 segun la model card) y ofrece una latencia de alineamiento de aproximadamente 2 segundos en CPU para 30 segundos de audio, con un pico de RSS de unos 2,9 GB.

Es relevante ahora porque permite integrar alineamiento forzado en catalan en entornos sin GPU, con un artefacto ONNX de solo 0,4 GB y licencia Apache 2.0. No obstante, conviene subrayar que no es un modelo de reconocimiento del habla de proposito general: requiere el texto de la locucion como entrada y no garantiza precision en condiciones de ruido o errores de transcripcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-large con cabeza CTC (transformer convolucional + transformer), exportada a ONNX opset 17 |
| Parametros totales | no disponible (heredados de wav2vec2-large-xlsr-53; el repositorio pesa 0,4 GB tras cuantizacion int8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; validado con entradas dinamicas de 0,5 s y 60 s de audio |
| Tipos de cuantizacion | int8 dinamica (QUInt8, pesos de MatMul cuantizados por canal); existe tambien la variante fp32 ONNX de referencia |
| Idiomas soportados | catalan (ca) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17); metadatos y hashes en `meta.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

La arquitectura es la de wav2vec2-large-xlsr-53: un extractor de caracteristicas convolucional seguido de un codificador transformer y una cabeza de clasificacion CTC. El modelo original fue entrenado por Meta sobre habla multilingue (XLSR-53) y posteriormente ajustado por `ccoreilly` para catalan. Parseh no ha reentrenado el modelo: parte del checkpoint `a4467e83126071845d754ee648e9ec3b9c5f5268` del modelo catalan, lo exporta a ONNX opset 17 y aplica cuantizacion dinamica int8 sobre los pesos de las multiplicaciones matriciales, manteniendo la salida log-softmax.

La innovacion tecnica principal no esta en el entrenamiento sino en la conversion y verificacion. La model card documenta que la diferencia maxima absoluta entre el log-softmax fp32 de ONNX y PyTorch es de 0,0001087188720703125, con un acuerdo de argmax por frame de 1.0; entre int8 y fp32 el acuerdo de argmax tambien es 1.0. En 16 clips reales de FLEURS ca_es (293 palabras, 143,5 s) no vistos en entrenamiento, la desviacion del inicio de palabra entre int8 y fp32 tiene mediana 0,0 ms, p95 0,0 ms y maximo 20,0 ms. El alineamiento se realiza con Viterbi CTC, y los caracteres desconocidos reciben una puntuacion comodin para preservar la monotonia del camino. Los datasets citados en la model card son Common Voice y Parlament Parla.

## Capacidades

- Alineamiento forzado de texto catalan conocido con audio a 16 kHz mono, generando marcas temporales a nivel de palabra y de caracter.
- Ejecucion local en CPU con ONNX Runtime y NumPy, sin dependencia de GPU.
- Entrada de audio dinamica, validada con segmentos de 0,5 s y 60 s.
- Salida de posteriores CTC compatible con decodificacion Viterbi.
- Manejo de caracteres fuera del vocabulario mediante puntuacion comodin que mantiene la monotonia del alineamiento.
- No realiza reconocimiento del habla libre: no transcribe audio sin texto de referencia.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No dispone de modo thinking, vision ni audio mas alla del alineamiento.
- Capacidad multilingue limitada al catalan.

## Casos de uso

- Subtitulado de video en catalan: dado un guion o subtitulo ya revisado, el modelo genera timestamps por palabra para sincronizar el texto con la locucion, algo util en postproduccion donde la transcripcion ya existe pero falta la temporizacion exacta.
- Generacion de subtitulos karaoke o resaltado palabra a palabra: los spans a nivel de caracter y palabra permiten animaciones sincronizadas en reproductores web, con una desviacion de inicio de palabra de mediana 0,0 ms frente a fp32.
- Control de calidad de transcripciones: comparar los timestamps alineados con estimaciones de energia permite detectar desajustes entre audio y texto, como documenta la model card con desviaciones de onset de 25 ms de mediana.
- Indexacion y busqueda en archivos audiovisuales catalanes: alinear transcripciones de Parlament Parla o archivos de television permite crear indices temporales para busqueda por frase dentro de un video.
- Alineamiento en pipelines sin GPU: con un coste de 2 s de CPU para 30 s de audio y un pico de RSS de 2,9 GB, es viable en servidores modestos o en local para procesamiento por lotes de archivos.
- Investigacion en fonetica y prosodia: los spans por caracter permiten estudiar duraciones de fonemas o silabas en corpus catalanes anotados, siempre que se disponga de transcripcion ortografica alineable.
- Sincronizacion de audiolibros o pódcasts con su texto: util para resaltado de la frase en curso en aplicaciones de lectura acompanada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, WER) en la informacion disponible. La model card incluye metricas de verificacion de la conversion y del alineamiento:

| Metrica | Resultado |
|---|---|
| Diferencia maxima absoluta log-softmax fp32 ONNX vs PyTorch | 0,0001087188720703125 |
| Acuerdo de argmax por frame fp32 ONNX vs PyTorch | 1,0 |
| Acuerdo de argmax por frame int8 vs fp32 | 1,0 |
| Desviacion inicio de palabra int8 vs fp32 (FLEURS ca_es, 16 clips) | mediana 0,0 ms / p95 0,0 ms / max 20,0 ms |
| Desviacion onset de subtitulo vs estimacion por energia | mediana 25,0 ms / max 90,0 ms |
| Desviacion offset de subtitulo vs estimacion por energia | mediana 60,0 ms / max 580,0 ms |
| Tasa de error de caracter greedy (mediana) | 0,018 |
| Coste de alineamiento en CPU para 30 s de audio | 2,003189 s |
| Pico de RSS | 2.923.884.544 bytes (~2,9 GB) |

## Requisitos de hardware

- VRAM: no aplica para la ruta principal, que se ejecuta en CPU con ONNX Runtime. El pico de memoria residente medido es de aproximadamente 2,9 GB de RAM para 30 s de audio.
- GPU recomendadas: no disponibles ni necesarias para el flujo documentado; el modelo esta validado en CPU con ONNX Runtime 1.23.2 y 1.30.0.
- Compatibilidad con GPU de consumo: no documentada. Al ser un artefacto ONNX int8, podria ejecutarse en GPU mediante ONNX Runtime con el proveedor CUDA, pero el autor no reporta pruebas en ese entorno.
- Opciones de despliegue: ONNX Runtime (CPU) junto con NumPy y el runtime propio de Parseh; el alineamiento Viterbi CTC se implementa en el pipeline del usuario. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 2 s de CPU para 30 s de audio en la prueba reportada; no se especifica la CPU empleada ni el throughput en lote.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parseh/aligner-ca | wav2vec2 CTC ONNX int8 para alineamiento forzado en catalan | no disponible (repo de 0,4 GB) | audio dinamico validado hasta 60 s | Apache 2.0 | HuggingFace, ONNX |
| ccoreilly/wav2vec2-large-xlsr-catala | wav2vec2 CTC para reconocimiento del habla en catalan | ~300 M (wav2vec2-large) | audio de hasta ~30 s por segmento | Apache 2.0 | HuggingFace, PyTorch |
| facebook/wav2vec2-large-xlsr-53 | wav2vec2 CTC multilingue (53 idiomas) | ~300 M | audio de hasta ~30 s por segmento | Apache 2.0 | HuggingFace, PyTorch |
| Modelos de alineamiento forzado tipo MFA (Montreal Forced Aligner) | GMM-HMM con diccionario fonetico | no aplica | dependiente del modelo acustico | MIT / otras | Herramienta local |

La comparativa directa con MFA no es exacta porque este ultimo requiere diccionario de pronunciacion y modelo acustico especifico, mientras que el modelo de Parseh opera a nivel de caracter sobre texto ortografico. Frente al modelo base de `ccoreilly`, la diferencia principal es el proposito (alineamiento con texto conocido frente a transcripcion libre), el formato (ONNX int8 frente a PyTorch fp32) y el tamano del artefacto.

## Limitaciones y advertencias

- No es un modelo de reconocimiento del habla: requiere el texto de la locucion como entrada y no puede transcribir audio por si solo.
- El audio debe ser mono a 16 kHz; otras frecuencias o canales requieren preprocesado previo.
- Ruido, acentos marcados, errores en el texto de referencia y huecos de vocabulario pueden degradar la precision de los timestamps.
- La cuantizacion int8 puede introducir pequenas desviaciones; la model card reporta un maximo de 20 ms en el inicio de palabra en las pruebas realizadas, pero no se garantiza un limite en produccion.
- La model card declara explicitamente que no se ofrece garantia de precision.
- El alcance linguistico se limita al catalan; no se documenta soporte para otras lenguas.
- La licencia Apache 2.0 permite uso comercial, pero se deben conservar `LICENSE` y `NOTICE` con la atribucion a los autores originales, al modelo base y a los datasets; no se implica endorsement por parte de Meta, Mozilla ni Parseh.
- No se dispone de informacion sobre sesgos demograficos o dialectales especificos del modelo cuantizado; los sesgos del modelo base no se detallan en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/parseh/aligner-ca
- Modelo base: https://huggingface.co/ccoreilly/wav2vec2-large-xlsr-catala
- Modelo original de Meta: https://huggingface.co/facebook/wav2vec2-large-xlsr-53
- Contacto del autor: development@parseh.io
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
