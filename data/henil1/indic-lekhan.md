# Henil1/indic-lekhan

## Resumen

Indic-lekhan es un modelo de reconocimiento automatico del habla (ASR) en streaming desarrollado por Henil1, disenado especificamente para cuatro idiomas indicos: hindi, tamil, telugu y urdu. Se trata de un transductor Zipformer implementado con la libreria icefall y exportado a ONNX para su ejecucion con sherpa-onnx, lo que permite desplegarlo en dispositivos de gama baja, incluidos telefonos moviles modestos, sin necesidad de GPU.

El modelo resuelve el problema del reconocimiento de voz multilingue en tiempo real para lenguas indicas con recursos limitados, un ambito historicamente dominado por modelos mucho mas grandes e inaccesibles para inferencia en el borde. Con solo 25,8 millones de parametros y un peso de 28 MB en cuantizacion int8, ofrece una alternativa extremadamente ligera que mantiene una precision razonable en conversacional.

Su relevancia actual radica en la combinacion de tres factores: streaming real con chunks de 320 o 640 ms, soporte nativo de cuatro idiomas mediante joiners especificos por lengua que restringen la salida al alfabeto correspondiente, y un tamano que cabe en cualquier dispositivo. La licencia CC BY 4.0 facilita su adopcion comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer transducer (icefall), causal, con CTC auxiliar |
| Parametros totales | 25,8 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (streaming por chunks de 320 ms o 640 ms) |
| Tipos de cuantizacion | fp32, fp16, int8 |
| Idiomas soportados | hindi (hi), tamil (ta), telugu (te), urdu (ur) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (encoder, decoder, joiner), PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Zipformer transducer causal con seis etapas de encoder. Los argumentos de icefall indican `--causal 1 --chunk-size 16,32,64,-1 --left-context-frames 64,128,256,-1`, con dimensiones de feedforward de 512,768,768,768,768,768 y dimensiones de encoder de 192,256,256,256,256,256. Incorpora tanto transductor como CTC (`--use-transducer 1 --use-ctc 1`), lo que permite decodificacion greedy y ofrece una salida CTC auxiliar durante el entrenamiento. El vocabulario es un BPE compartido de 1500 piezas que incluye tokens de idioma.

El entrenamiento utilizo aproximadamente 1240 horas de audio procedente de los corpus de AI4Bharat IndicVoices, Kathbath y Shrutilipi, con la siguiente distribucion: hindi 328 h, tamil 393 h, telugu 266 h y urdu 252 h. Se aplico perturbacion de velocidad con factores 0,9/1,0/1,1 y se completo en 45 epocas distribuidas en tres etapas a medida que se anadia datos. El modelo final es un promedio de pesos de las epocas 43 a 45. La innovacion principal es el uso de joiners especificos por idioma que restringen la salida al alfabeto de la lengua seleccionada, evitando la mezcla de escrituras que se produce con un joiner compartido.

## Capacidades

- Reconocimiento automatico del habla en streaming en hindi, tamil, telugu y urdu.
- Decodificacion greedy en tiempo real con chunks de 320 ms (menor latencia) o 640 ms (mayor precision).
- Seleccion de idioma en tiempo de ejecucion mediante el joiner correspondiente (`joiner-hi`, `joiner-ta`, `joiner-te`, `joiner-ur`).
- Restriccion de escritura por idioma: cada joiner limita la salida al alfabeto de su lengua.
- Ejecucion en CPU con sherpa-onnx, sin dependencia de GPU.
- Cuantizacion int8 y fp16 para reducir el tamano a 28 MB en int8.
- Soporte de entrada de audio a 16 kHz mono con caracteristicas de 80 dimensiones.
- No dispone de tool calling, capacidades de agente, vision ni audio generativo; es exclusivamente un modelo ASR.

## Casos de uso

- **Transcripcion en tiempo real en telefonos de gama baja**: con 28 MB en int8 y ejecucion en CPU mediante sherpa-onnx, el modelo cabe en dispositivos con recursos minimos y permite dictado o subtitulado en vivo sin conexion a la nube, usando el chunk de 320 ms para minimizar la latencia.
- **Subtitulado de reuniones y videollamadas**: el modo streaming con chunks de 640 ms ofrece mayor precision (WER de 9,0 en urdu y 15,4 en hindi en la variante int8) y es adecuado para generar subtitulos incrementales en conversaciones multilingues entre las cuatro lenguas soportadas.
- **Atencion al cliente automatizada en centros de contacto indicos**: el modelo puede transcribir llamadas en hindi, tamil, telugu o urdu en tiempo real para alimentar sistemas de analisis de sentimiento o enrutamiento, seleccionando el joiner del idioma detectado al inicio de la llamada.
- **Asistentes de voz embebidos en aplicaciones moviles**: integrado via sherpa-onnx en apps Android o iOS, permite comandos de voz y busqueda por voz en las cuatro lenguas sin enviar audio a servidores externos, cumpliendo requisitos de privacidad.
- **Transcripcion de archivos de audio para accesibilidad**: procesamiento por lotes de grabaciones de 16 kHz mono con el modelo PyTorch u ONNX fp32, generando transcripciones para archivado o busqueda en bibliotecas de contenido en lenguas indicas.
- **Investigacion en ASR de bajos recursos**: el checkpoint `pytorch/epoch-45-full.pt` incluye estado del optimizador y scheduler, lo que permite continuar el entrenamiento o hacer fine-tuning sobre nuevos dominios o lenguas, con la configuracion Zipformer documentada como punto de partida.
- **Sistemas de transcripcion en el borde para kioscos o dispositivos IoT**: el modelo puede ejecutarse en hardware con CPU modesta (un solo hilo configurado en el ejemplo) para interfaces de voz en espacios publicos, sin necesidad de conectividad.

## Benchmarks y rendimiento

Los resultados publicados por el autor corresponden al conjunto de desarrollo propio (hasta 300 clips por idioma de la particion `valid` de IndicVoices, habla conversacional, busqueda greedy, idioma conocido). No es el conjunto de test oficial de IndicVoices y se uso para seleccionar checkpoints. Las filas ONNX usan los primeros 100 clips por idioma. Los tamanos incluyen encoder, decoder y un joiner.

| Variante | hi (WER/CER) | ta (WER/CER) | te (WER/CER) | ur (WER/CER) |
|---|---|---|---|---|
| PyTorch 320 ms, todos los clips | 17,8 / 8,7 | 38,4 / 14,8 | 44,7 / 18,6 | 12,0 / 5,9 |
| ONNX fp32 320 ms, 99 MB, 100 clips | 15,7 / 7,1 | 34,1 / 12,3 | 45,3 / 17,8 | 10,6 / 4,9 |
| ONNX int8 320 ms, 28 MB, 100 clips | 16,0 / 7,2 | 34,2 / 12,2 | 45,3 / 17,7 | 10,6 / 4,9 |
| PyTorch 640 ms, todos los clips | 16,7 / 8,0 | 37,0 / 14,0 | 42,3 / 17,5 | 10,7 / 5,3 |
| ONNX fp32 640 ms, 99 MB, 100 clips | 15,6 / 6,7 | 33,0 / 11,6 | 42,0 / 16,4 | 9,3 / 4,2 |
| ONNX int8 640 ms, 28 MB, 100 clips | 15,4 / 6,9 | 33,4 / 11,6 | 41,9 / 16,3 | 9,0 / 4,2 |

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K, ya que el modelo es exclusivamente ASR.

## Requisitos de hardware

- **VRAM estimada**: no requiere GPU; inferencia en CPU. El modelo int8 ocupa 28 MB y el fp32 99 MB (encoder, decoder y un joiner).
- **GPU recomendadas**: no aplica; el modelo esta pensado para CPU. Cualquier GPU puede ejecutarlo via ONNX Runtime, pero no es necesario.
- **Compatibilidad con GPU de consumo**: irrelevante por su tamano; cabe en cualquier dispositivo, incluidos telefonos de gama baja.
- **Opciones de despliegue**: sherpa-onnx (libreria oficial del modelo), ONNX Runtime, y el checkpoint PyTorch con icefall para entrenamiento o fine-tuning.
- **Latencia y throughput**: no se han publicado mediciones de latencia ni throughput. La configuracion de streaming por chunks de 320 ms implica una latencia algorítmica de al menos ese valor; el ejemplo de uso configura `num_threads=1`.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Los modelos ASR indicos de referencia habituales (p. ej., IndicWav2Vec, Whisper) no aparecen en la informacion disponible con datos que permitan una comparacion rigurosa de parametros, contexto, rendimiento y licencia. Se indica, por tanto, "no disponible".

## Limitaciones y advertencias

- **Rendimiento desigual entre idiomas**: el WER en tamil (33-38) y telugu (42-45) es notablemente superior al de hindi (15-18) y urdu (9-12), lo que refleja diferencias en datos y dificultad; telugu presenta el peor rendimiento y puede no ser adecuado para produccion sin evaluacion adicional.
- **Conjunto de evaluacion no oficial**: los resultados se obtuvieron sobre un subconjunto de la particion `valid` de IndicVoices usado para seleccionar checkpoints, no sobre el test oficial; el rendimiento en produccion puede diferir.
- **Riesgo de alucinacion y errores en habla espontanea**: al ser un modelo entrenado mayoritariamente con habla conversacional, puede degradarse en dominios especializados (medico, legal, tecnico) o con ruido de fondo.
- **Restriccion de escritura por joiner**: el uso del joiner `joiner-auto` mezcla escrituras y no se recomienda; es necesario seleccionar el joiner del idioma correcto, lo que exige conocer o detectar el idioma de antemano.
- **Sin deteccion automatica de idioma**: el modelo no identifica el idioma por si mismo; la aplicacion debe elegirlo.
- **Licencia CC BY 4.0**: permite uso comercial con atribucion; ademas, los datasets de entrenamiento (IndicVoices, Kathbath, Shrutilipi) son CC BY 4.0 y requieren citacion segun sus fichas.
- **Sin soporte de tool calling, agentes ni multimodalidad**: es exclusivamente un modelo ASR; no debe esperarse razonamiento ni generacion de texto.
- **Repo con 0 descargas y 0 likes**: modelo reciente (creado en noviembre de 2026) sin validacion comunitaria; conviene evaluarlo en el dominio propio antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Henil1/indic-lekhan
- icefall (framework de entrenamiento): https://github.com/k2-fsa/icefall
- sherpa-onnx (runtime de inferencia): https://github.com/k2-fsa/sherpa-onnx
- Dataset IndicVoices: https://huggingface.co/datasets/ai4bharat/IndicVoices
- Dataset Kathbath: https://huggingface.co/datasets/ai4bharat/Kathbath
- Dataset Shrutilipi: https://huggingface.co/datasets/ai4bharat/Shrutilipi
