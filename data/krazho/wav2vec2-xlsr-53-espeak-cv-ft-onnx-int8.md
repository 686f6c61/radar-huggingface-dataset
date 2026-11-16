# KraZho/wav2vec2-xlsr-53-espeak-cv-ft-ONNX-int8

## Resumen

`KraZho/wav2vec2-xlsr-53-espeak-cv-ft-ONNX-int8` es una cuantizacion dinamica de 8 bits del modelo `facebook/wav2vec2-xlsr-53-espeak-cv-ft` de Meta, un sistema de reconocimiento automatico de fonemas (no de palabras) entrenado sobre el corpus Common Voice y etiquetado con el alfabeto fonetico eSpeak. El modelo original parte de `wav2vec2-large-xlsr-53`, preentrenado en 53 idiomas, y se ha afinado para transcribir audio a secuencias de fonemas IPA, lo que lo hace util para practica de pronunciacion, analisis fonetico y herramientas de aprendizaje de idiomas.

Esta version concreta no la publica Meta, sino el usuario KraZho, que parte de la exportacion ONNX en fp32 de `qnighy` y aplica `onnxruntime.quantization.quantize_dynamic` con cuantizacion QUInt8 limitada a operadores MatMul y Gemm. El resultado es un artefacto de unos 0,4 GB pensado para ejecutarse en el navegador mediante Transformers.js y ONNX Runtime Web (backend wasm), con una velocidad aproximadamente el doble que la variante de 4 bits en ese entorno.

La relevancia practica es acotada pero clara: permite desplegar reconocimiento de fonemas en cliente (sin servidor GPU) para aplicaciones web de pronunciacion, con licencia Apache-2.0 heredada del modelo base y del export original. No es un modelo de transcripcion de texto libre ni un ASR convencional: su salida es una cadena de fonemas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer convolucional + encoder Transformer, CTC), base `wav2vec2-large-xlsr-53` afinado a fonemas eSpeak |
| Parametros totales | no disponible (el modelo base `wav2vec2-large-xlsr-53` ronda los 300 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (wav2vec2 procesa ventanas de audio; el modelo base usa segmentos de unos 10-30 s, no confirmado aqui) |
| Tipos de cuantizacion | int8 dinamica (QUInt8), solo operadores MatMul/Gemm |
| Idiomas soportados | no disponible (el modelo base XLSR-53 se preentreno en 53 idiomas; el afinamiento fonetico concreto no se detalla) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`), compatible con Transformers.js |

## Arquitectura y entrenamiento

La arquitectura subyacente es wav2vec2 en su variante large de XLSR-53: un extractor de caracteristicas convolucional sobre la forma de onda cruda seguido de un encoder Transformer, entrenado con perdida CTC para alineamiento secuencial. El modelo original de Meta se afino sobre Common Voice con etiquetas foneticas generadas mediante eSpeak, de modo que la salida es una secuencia de simbolos IPA en lugar de texto ortografico. No se dispone en la informacion proporcionada de detalles sobre el numero de horas de audio, la composicion exacta del corpus ni si hubo etapas de RLHF o DPO (en un modelo CTC de este tipo no es lo habitual).

La innovacion de esta ficha no esta en el entrenamiento, sino en el proceso de compresion y empaquetado: se parte de la exportacion ONNX fp32 de `qnighy` (revision `d2987af`) y se aplica cuantizacion dinamica de 8 bits con `onnxruntime.quantization.quantize_dynamic`, restringida a operadores MatMul y Gemm. El autor reporta que en ONNX Runtime Web (wasm) esta variante es aproximadamente el doble de rapida que el fichero de 4 bits, un comportamiento plausible porque la cuantizacion int8 esta mejor soportada por los kernels wasm que la de 4 bits. Se incluye el SHA-256 del fichero `onnx/model_quantized.onnx` (`4a37c09c...`) para verificacion de integridad.

## Capacidades

- Reconocimiento automatico de fonemas: convierte audio en una secuencia de simbolos foneticos (alfabeto eSpeak/IPA), no en texto ortografico.
- Evaluacion de pronunciacion: permite comparar la secuencia de fonemas producida por el hablante con una referencia, base de aplicaciones de practica de pronunciacion.
- Ejecucion en navegador: disenado para Transformers.js y ONNX Runtime Web (wasm), sin necesidad de backend GPU.
- Inferencia sobre audio de entrada directa (forma de onda), sin pipeline de features manual.
- Multilingue potencial heredado de XLSR-53, aunque el alcance real del afinamiento fonetico no esta documentado en esta ficha.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo acustico-fonetico, no un LLM.
- No soporta vision ni audio generativo; la salida es exclusivamente la secuencia de fonemas.

## Casos de uso

- Aplicacion web de practica de pronunciacion: el modelo se ejecuta en el cliente con Transformers.js y devuelve la transcripcion fonetica del audio del usuario; se compara con la secuencia esperada para dar retroalimentacion inmediata sin enviar audio a un servidor.
- Herramientas educativas offline o de bajo coste: al correr en wasm, puede integrarse en aplicaciones que funcionan sin conexion o en entornos con recursos limitados, reduciendo costes de infraestructura.
- Analisis fonetico en investigacion linguistica de campo: permite obtener transcripciones foneticas preliminares de grabaciones para revision manual posterior, agilizando el etiquetado.
- Prototipado rapido de interfaces de voz: util para validar pipelines de audio a fonemas en el navegador antes de invertir en infraestructura de servidor.
- Sistemas de deteccion de errores de pronunciacion en aprendizaje de segundas lenguas: la salida fonetica permite identificar sustituciones o omisiones de fonemas concretos.
- Demos y articulos tecnicos: el tamano reducido (0,4 GB) y el formato ONNX facilitan publicar ejemplos interactivos en paginas web sin backend.
- Preprocesamiento para sistemas de sintesis o correccion: la secuencia de fonemas puede alimentar un TTS o un modulo de correccion fonetica en una cadena mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento aportado por el autor es cualitativo: en ONNX Runtime Web (wasm), esta variante int8 es aproximadamente el doble de rapida que el fichero de 4 bits del mismo modelo. No se proporcionan cifras de WER, PER (phoneme error rate), latencia absoluta ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo pequeno (repo de 0,4 GB) y estar pensado para wasm, no requiere GPU dedicada.
- GPU recomendadas: no aplica para el caso de uso principal (navegador/wasm). En servidor podria ejecutarse en CPU o en GPUs modestas (T4, RTX 3060 en adelante), pero no hay datos confirmados.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna, aunque el objetivo declarado es la ejecucion en CPU/navegador.
- Opciones de despliegue: Transformers.js con ONNX Runtime Web (wasm); tambien ONNX Runtime nativo en Python/C++/JS.
- Latencia y throughput estimados: no disponibles en terminos absolutos; solo la comparacion relativa (aproximadamente 2x mas rapido que la variante de 4 bits en wasm).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| KraZho/wav2vec2-xlsr-53-espeak-cv-ft-ONNX-int8 | no disponible (~300 M en el base) | audio (ventanas) | fonemas eSpeak | Apache-2.0 | ONNX int8 |
| facebook/wav2vec2-xlsr-53-espeak-cv-ft | no disponible (~300 M) | audio | fonemas eSpeak | Apache-2.0 | PyTorch / safetensors |
| qnighy/wav2vec2-xlsr-53-espeak-cv-ft-ONNX | no disponible (~300 M) | audio | fonemas eSpeak | Apache-2.0 | ONNX fp32 |
| Variante ONNX 4-bit (mencionada por el autor) | no disponible | audio | fonemas eSpeak | Apache-2.0 | ONNX 4-bit |

Las tres alternativas son esencialmente el mismo modelo en distintos formatos y precisiones; la eleccion depende del entorno de despliegue (navegador vs servidor) y del equilibrio velocidad/tamano. No se dispone de datos de rendimiento comparativo mas alla de la nota cualitativa del autor sobre int8 frente a 4 bits.

## Limitaciones y advertencias

- No es un modelo ASR de texto: la salida son fonemas, no palabras; no debe usarse para transcripcion ortografica.
- El alcance multilingue real del afinamiento fonetico no esta documentado; el modelo base cubre 53 idiomas, pero el rendimiento por idioma no se especifica.
- La cuantizacion dinamica int8 puede introducir una ligera perdida de precision frente al fp32 original; no se han publicado metricas de degradacion (PER) en esta ficha.
- Riesgo de errores en audio ruidoso, con acentos no representados en el corpus de entrenamiento o con habla solapada; no hay evaluacion publicada al respecto.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar los avisos de atribucion a Meta Platforms, a qnighy (export ONNX) y a KraZho (cuantizacion).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad, por lo que se recomienda verificar el SHA-256 indicado antes de usarlo en produccion.
- Dependencia del ecosistema Transformers.js/ONNX Runtime Web: el rendimiento y la compatibilidad pueden variar segun la version del runtime y el navegador.
- No soporta tool calling, agentes ni razonamiento; no debe emplearse en pipelines que esperen texto generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KraZho/wav2vec2-xlsr-53-espeak-cv-ft-ONNX-int8
- Modelo base: https://huggingface.co/facebook/wav2vec2-xlsr-53-espeak-cv-ft
- Export ONNX fp32 de referencia: https://huggingface.co/qnighy/wav2vec2-xlsr-53-espeak-cv-ft-ONNX
- Preentrenamiento base XLSR-53: https://huggingface.co/facebook/wav2vec2-large-xlsr-53
- Transformers.js: https://github.com/huggingface/transformers.js
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- Paper wav2vec 2.0: https://arxiv.org/abs/2006.11477
- Paper XLSR (cross-lingual speech representations): https://arxiv.org/abs/2006.13979
