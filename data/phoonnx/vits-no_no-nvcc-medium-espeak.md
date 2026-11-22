# Phoonnx/vits-no_no-nvcc-medium-espeak

## Resumen

vits-no_no-nvcc-medium-espeak es un modelo de sintesis de voz (text-to-speech) en noruego bokmal (`no-NO`) basado en la arquitectura VITS, en su variante Piper, y distribuido en formato ONNX para su uso con la libreria phoonnx. Lo publica Phoonnx (TigreGotico Lda) como conversion del modelo original `rhasspy/piper-voices/no/no_NO/nvcc/medium`, entrenado por los contribuidores de rhasspy/piper-voices. El modelo no cambia los pesos respecto al original: la conversion solo adapta el grafo a ONNX y anade copias cuantizadas a int8.

El modelo resuelve la sintesis de voz offline en noruego con un coste computacional bajo: el grafo fp32 ocupa 76,8 MB y la copia int8 22,1 MB, con un RTF de 0,044 en fp32 y 0,094 en int8 medido sobre un Intel Core i9-11900H a 4 hilos. Es, por tanto, una pieza orientada a despliegues en CPU, dispositivos embebidos y aplicaciones de asistencia vocal que necesiten latencia baja sin GPU.

La relevancia actual es acotada: se trata de una conversion de un voice de Piper ya existente, con 10 hablantes, entrada de fonemas espeak-ng en alfabeto IPA y una licencia CC0 1.0 que permite uso comercial sin restricciones. La propia model card advierte de que el voice no figura en el indice de voces de phoonnx por una discrepancia en el mapeo de pares vocalicos (issue 838), lo que limita su descubrimiento automatico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variante Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | fp32 y int8 (QInt8, `quantize_dynamic` de onnxruntime 1.32.0) |
| Idiomas soportados | noruego bokmal (`no-NO`) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`model.onnx` y `model_int8.onnx`), configuracion en `config.json` |
| Frecuencia de muestreo | 22050 Hz |
| Numero de hablantes | 10 |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Puntuacion de clausula | `, . ! ? : ;` (preservada en phoonnx 1.96.1a1 y posteriores) |
| Fonemizador | espeak-ng, voz `nb` |
| Tamano del repo | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

El modelo emplea VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), la arquitectura generativa condicionada por fonemas que Piper utiliza para sus voces. La entrada es una secuencia de fonemas IPA producida por espeak-ng (voz `nb`), y la salida es audio a 22050 Hz. El modelo es multi-hablante (10 voces) y esta entrenado con puntuacion de clausula, de modo que phoonnx 1.96.1a1 y posteriores preservan `, . ! ? : ;` en la sintesis.

El entrenamiento original lo realizaron los contribuidores de rhasspy/piper-voices "from scratch", segun la model card upstream. Los datos proceden del recurso de Sprakbanken de la Biblioteca Nacional de Noruega (NB.no, `oai-nb-no-sbr-75`), publicado bajo CC0; la model card no registra el numero de tokens ni la composicion exacta del dataset. No se documenta RLHF ni DPO: es un modelo TTS puramente supervisado sobre pares texto-audio. La conversion a ONNX no altera los pesos; las copias int8 se generaron con cuantizacion dinamica de onnxruntime y pesos QInt8, y pasan una compuerta de calidad que verifica audio finito, no silencioso y con longitud entre 0,8 y 1,25 veces la de fp32.

## Capacidades

- Sintesis de voz (text-to-speech) offline en noruego bokmal a partir de texto con fonemizacion espeak-ng.
- Soporte multi-hablante: 10 voces distintas en un mismo grafo.
- Preservacion de puntuacion de clausula (`, . ! ? : ;`) para prosodia y pausas.
- Inferencia en CPU con requisitos de memoria reducidos (RSS pico de 287,1 MB en fp32 y 242,2 MB en int8).
- Ejecucion en dos precisiones: fp32 para maxima calidad y int8 para despliegues con restricciones de memoria.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada: es exclusivamente un modelo de sintesis.
- Capacidad multilingue limitada al noruego bokmal; no se documentan otros idiomas.

## Casos de uso

- Lectura por voz de articulos y noticias en noruego: el modelo convierte texto plano en audio a 22050 Hz con un RTF de 0,044 en fp32, adecuado para generar boletines de audio en lote sobre CPU sin GPU.
- Asistentes de voz para personas con discapacidad visual: la latencia baja y el consumo de memoria contenido (242,2 MB en int8) permiten ejecutarlo en equipos de escritorio modestos o en un mini-PC, con 10 voces para personalizar el asistente.
- Interfaces conversacionales en noruego para kioscos o terminales de atencion: la preservacion de la puntuacion de clausula mejora las pausas en respuestas largas, y el formato ONNX simplifica el despliegue en dispositivos sin acelerador.
- Audiolibros y contenido educativo: la cuantizacion int8 reduce el grafo a 22,1 MB, lo que facilita empaquetar la voz dentro de aplicaciones moviles o de escritorio distribuidas con el producto.
- Sistemas de navegacion y avisos por voz en vehiculos o dispositivos embebidos: el modelo cabe en memoria muy limitada y no requiere conexion de red, lo que encaja en entornos con conectividad intermitente.
- Generacion de doblaje o previsualizacion de guiones en noruego: la seleccion entre 10 hablantes permite asignar voces distintas a personajes en una primera maqueta de audio antes de la locucion definitiva.
- Pruebas de regresion de pipelines TTS: al ser una conversion ONNX reproducible con compuerta de calidad documentada, sirve como referencia para validar cambios en el fonemizador o en el motor de sintesis.

## Benchmarks y rendimiento

La model card no publica benchmarks de calidad subjetiva (MOS) ni comparativas con otros modelos. Si documenta metricas de rendimiento y de control de calidad de la conversion:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado de la compuerta QA | pass | pass |
| Caracteres por segundo | 13,4 a 18,6 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,99 a 1,06 |
| Tamano del grafo | 76,8 MB | 22,1 MB |
| RSS pico | 287,1 MB | 242,2 MB |
| RTF (mediana de 3, 4 hilos) | 0,044 | 0,094 |

Medido en un Intel Core i9-11900H a 2,50 GHz. El RTF es el tiempo de sintesis dividido por la duracion del audio. El control de calidad emplea FLORES-200 devtest (3 frases) con comprobacion de longitud y silencio sin ASR.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Hablantes | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-no_no-nvcc-medium-espeak | VITS (Piper) | no-NO | 10 | ONNX fp32/int8 | CC0 1.0 | Conversion del voice Piper `no_NO/nvcc/medium` |
| rhasspy/piper-voices (no_NO/nvcc/medium) | VITS (Piper) | no-NO | 10 | Piper/ONNX | CC0 1.0 | Modelo upstream del que deriva este |
| Otras voces Piper para noruego en rhasspy/piper-voices | VITS (Piper) | no-NO | variable | Piper/ONNX | variable segun voice | Mismo marco; calidad y hablantes no disponibles en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con otros motores TTS (por ejemplo, Coqui TTS o modelos neuronales comerciales) en la informacion proporcionada.

## Limitaciones y advertencias

- El voice no esta en el indice de voces de phoonnx: la model card indica que phoonnx asigna un id a cada par vocalico de este mapa mientras Piper no lo hace (issue 838), por lo que queda fuera del indice hasta que se corrija. Hay que cargarlo manualmente por ficheros.
- Dependencia de espeak-ng: los fonemas deben generarse con espeak-ng (voz `nb`). Si se usa el port espyak de phoonnx, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Solo noruego bokmal: no soporta otros idiomas ni cambio de idioma por segmento.
- Sin datos de entrenamiento detallados: la model card upstream no registra numero de tokens, composicion del dataset ni modelo base, lo que dificulta evaluar sesgos o cobertura fonetica.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede producir prosodia incorrecta o artefactos en palabras fuera del dominio de entrenamiento; no se documentan evaluaciones MOS.
- La cuantizacion int8 reduce calidad potencialmente: la compuerta solo verifica que el audio sea finito, no silencioso y con longitud entre 0,8 y 1,25 veces la de fp32; no se ha medido MOS para int8.
- Licencia CC0 1.0: permite uso comercial y modificacion sin restricciones, pero se recomienda atribuir a los contribuidores de rhasspy/piper-voices.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es una publicacion reciente (creada el 22 de noviembre de 2026) sin validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-no_no-nvcc-medium-espeak
- Modelo upstream: https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/no/no_NO/nvcc/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Dataset de entrenamiento (Sprakbanken, NB.no): https://www.nb.no/sprakbanken/en/resource-catalogue/oai-nb-no-sbr-75/
- Issue de phoonnx sobre el mapeo de pares vocalicos: https://github.com/TigreGotico/phoonnx/issues/838
