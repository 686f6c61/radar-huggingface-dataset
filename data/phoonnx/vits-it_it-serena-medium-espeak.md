# Phoonnx/vits-it_it-serena-medium-espeak

## Resumen

vits-it_it-serena-medium-espeak es una voz de síntesis de voz (text-to-speech) en italiano, obtenida a partir de la voz Serena de Piper publicada en el repositorio rhasspy/piper-voices. El modelo original fue entrenado por bacca87 y esta versión ha sido convertida a formato ONNX por TigreGotico Lda para su uso con la librería phoonnx. Se trata de una conversión de pesos, no de un reentrenamiento: los pesos no cambian respecto al modelo upstream.

La arquitectura es VITS, el modelo generativo de extremo a extremo que combina codificador de texto, alineamiento por búsqueda monotónica y decodificador acústico, con salida a 22.050 Hz y un único hablante. La entrada de texto se convierte a fonemas IPA mediante espeak-ng (voz `it`), por lo que el modelo no acepta texto plano directamente: requiere el paso previo de fonemización. Está pensado para síntesis local de baja latencia en CPU, con un grafo de 63,5 MB y un RTF medido de 0,041.

Su relevancia es acotada pero clara: es una voz italiana ligera, con licencia CC BY 4.0 y ejecución en CPU, adecuada para integrar en pipelines de TTS autoalojados. No obstante, el propio autor advierte de que la voz no figura en el índice de voces de phoonnx y de que la cuantización int8 no superó el control de calidad, por lo que solo se distribuye la variante fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por fonemas) |
| Tipos de cuantizacion | fp32 (unica variante publicada; int8 no supero el control de calidad y no se distribuye) |
| Idiomas soportados | italiano (it-IT) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (model.onnx + config.json) |
| Frecuencia de muestreo | 22.050 Hz |
| Hablantes | 1 |
| Fonemizador | espeak-ng, voz `it`, alfabeto IPA |
| Puntuacion de clausula | , . ! ? : ; (preservada en sintesis con phoonnx 1.96.1a1 y posteriores) |
| Tamano del grafo | 63,5 MB |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

VITS es un modelo de sintesis de voz de extremo a extremo que combina un codificador de texto, un modulo de alineamiento por busqueda monotónica (MAS), un decodificador basado en flujos normalizadores y un discriminador adversarial multiperiodo durante el entrenamiento. La inferencia produce directamente la forma de onda a 22.050 Hz. En esta variante Piper, la entrada no es texto crudo sino fonemas IPA generados por espeak-ng con la voz italiana.

Segun la model card upstream, el modelo se entreno desde cero sobre el dataset committa/serena-synthetic-it-27h (27 horas de audio sintetico en italiano, licencia CC-BY-4.0). No se registran en el repositorio ni el checkpoint de entrenamiento ni el numero exacto de tokens o pasos, y no se documenta el uso de RLHF ni DPO. La conversion a ONNX realizada por TigreGotico no modifica los pesos, solo el formato de serializacion.

## Capacidades

- Sintesis de voz en italiano a partir de texto fonemizado en IPA mediante espeak-ng.
- Salida mono a 22.050 Hz en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Respeto de la puntuacion de clausula (, . ! ? : ;) en la sintesis con phoonnx 1.96.1a1 y posteriores.
- Ejecucion en CPU con un RTF bajo (0,041 medido en un Intel i9-11900H), sin necesidad de GPU.
- Un unico hablante (voz Serena, femenina), sin control de estilo, emocion ni prosodia mas alla de la puntuacion.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de los modelos de lenguaje: es exclusivamente un modelo TTS.
- No soporta vision ni audio de entrada.

## Casos de uso

- Lectura de articulos y contenido web en italiano: el modelo convierte texto plano a voz con una latencia muy baja (RTF 0,041), lo que permite generar audio casi en tiempo real en un servidor modesto.
- Asistentes de voz autoalojados en italiano: al ejecutarse en CPU con un pico de RSS de 277,8 MB, puede convivir con otros servicios en la misma maquina sin GPU dedicada.
- Accesibilidad para personas con discapacidad visual: sintesis de documentos y pantallas en italiano con una voz natural de 22.050 Hz, integrable en lectores de pantalla mediante la API de phoonnx.
- Generacion de audiolibros y podcasts sinteticos: la preservacion de la puntuacion de clausula permite obtener pausas naturales en parrafos largos, aunque al ser un solo hablante no permite dialogo entre personajes.
- Sistemas de anuncios y notificaciones por voz: el bajo coste computacional y el tamano del grafo (63,5 MB) permiten desplegarlo en dispositivos edge o contenedores ligeros.
- Pruebas de integracion continua de pipelines TTS: sirve como voz de referencia en tests automatizados de calidad de sintesis en italiano, con la salvedad de que la variante int8 no esta disponible para probar cuantizacion.

## Benchmarks y rendimiento

Los unicos datos publicados son los del control de calidad de la model card, medidos con ASR nemo-parakeet-tdt-0.6b-v3 int8 sobre 3 frases del conjunto FLORES-200 devtest:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado del control | fail | no distribuido |
| WER | 0,000 | no disponible |
| Caracteres por segundo | 18,5 a 20,3 | no disponible |
| Longitud int8/fp32 | no aplica | 0,93 a 1,01 |
| Tamano del grafo | 63,5 MB | no disponible |
| Pico de RSS | 277,8 MB | no disponible |
| RTF (mediana de 3, 4 hilos) | 0,041 | no disponible |

Las mediciones se realizaron en un Intel Core i9-11900H a 2,50 GHz. No se han publicado resultados de benchmarks comparativos con otras voces TTS en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta pensado para CPU. En GPU, el grafo de 63,5 MB cabe en cualquier tarjeta con al menos 1 GB de memoria.
- GPU recomendadas: no se especifican; cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo, aunque el modelo no aprovecha la aceleracion por hardware de forma significativa.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo con soporte ONNX Runtime; tambien en CPU sin GPU.
- Opciones de despliegue: phoonnx (libreria oficial, `pip install --pre phoonnx`) con espeak-ng instalado; alternativamente, ONNX Runtime directamente sobre `model.onnx` con el `config.json`.
- Latencia y throughput: RTF de 0,041 en un i9-11900H con 4 hilos (mediana de 3 ejecuciones), es decir, aproximadamente 24 veces mas rapido que tiempo real. Pico de RSS de 277,8 MB.
- Requisito adicional: es necesario instalar espeak-ng en el sistema (`apt install espeak-ng`) o usar el extra `phoonnx[espeak]`, que incluye el port espyak; este ultimo puede producir diferencias foneticas y errores de pronunciacion en algunas palabras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vits-it_it-serena-medium-espeak | no disponible (grafo 63,5 MB) | no aplica | it | CC BY 4.0 | ONNX | Conversion de Piper Serena; no indexada en phoonnx; sin int8 |
| rhasspy/piper-voices (serena/medium) | no disponible | no aplica | it | CC BY 4.0 | ONNX (Piper) | Modelo upstream original; entrenado por bacca87 |
| Otras voces Piper en italiano | no disponible | no aplica | it | variable | ONNX | El repositorio piper-voices incluye varias voces; no se dispone de datos comparativos de calidad en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la informacion disponible.

## Limitaciones y advertencias

- La voz no esta incluida en el indice de voces de phoonnx: debe cargarse manualmente desde los ficheros `model.onnx` y `config.json`.
- La variante int8 no supero el control de calidad y no se distribuye; solo hay fp32, lo que limita el ahorro de memoria en despliegues muy restringidos.
- El control de calidad fp32 figura como "fail" en la model card, aunque el WER medido es 0,000 sobre solo 3 frases de FLORES-200; la muestra es demasiado pequena para extraer conclusiones robustas.
- Requiere espeak-ng para la fonemizacion; el uso del port espyak puede provocar pronunciaciones incorrectas en algunas palabras.
- Un unico hablante y sin control de emocion, estilo ni velocidad mas alla de la puntuacion.
- Solo italiano (it-IT); no soporta otros idiomas.
- Riesgo de alucinacion no aplica en el sentido de los LLM, pero si puede producir pronunciaciones erroneas en palabras fuera del dominio de entrenamiento (nombres propios, siglas, terminos tecnicos).
- El dataset de entrenamiento es sintetico (27 horas), lo que puede introducir artefactos o sesgos prosodicos heredados del generador original.
- Licencia CC BY 4.0: permite uso comercial con atribucion; es obligatorio citar a bacca87 como autor del modelo original y a TigreGotico Lda por la conversion.
- No se documentan sesgos demograficos ni de otro tipo en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-it_it-serena-medium-espeak
- Modelo upstream (Piper Serena medium): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/it/it_IT/serena/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Dataset de entrenamiento: https://huggingface.co/datasets/committa/serena-synthetic-it-27h
