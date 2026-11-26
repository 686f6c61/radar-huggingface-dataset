# oblivius/vrc-we-voice-es

## Resumen

vrc-we-voice-es es un modelo de deteccion de palabras clave (keyword spotting) para castellano desarrollado por el usuario oblivius, pensado para integrarse en el motor de reconocimiento por voz vrc-WiredExpressions. Se construye sobre jonatasgrosman/wav2vec2-large-xlsr-53-spanish (Apache 2.0), podado a sus 16 capas inferiores de 24, y anade una segunda cabeza de fonemas sobre el mismo codificador, de modo que el modelo transcribe tanto grafemas (41 simbolos) como fonemas IPA (56 simbolos) con marcos de 20 ms. Se distribuye como ONNX cuantizado en int8 con un tamano de 254 MB.

La propuesta tecnica es inusual: en lugar de un unico decodificador CTC de letras, mantiene dos cabezas sobre el mismo encoder y fusiona sus puntuaciones por fotograma para decidir si una frase registrada se ha pronunciado. Esta fusion permite reconocer variantes de pronunciacion y homofonos que un modelo puramente ortografico descartaria, y el coste computacional es practicamente el de un modelo de letras, ya que la cabeza de fonemas es una unica capa lineal.

El modelo esta pensado para reconocimiento de frases cortas en aplicaciones interactivas, no para transcripcion general de audio largo. Su licencia Apache 2.0 y su formato ONNX lo hacen desplegable en entornos de cliente sin dependencias de frameworks de inferencia pesados. La informacion disponible no incluye resultados de benchmarks estandar (WER, MMLU, etc.) ni detalles sobre latencia o throughput.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer) con dos cabezas CTC: letras y fonemas |
| Parametros totales | no disponible (repo de 1,0 GB; ONNX int8 de 254 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (marcos de 20 ms; ventana de decision de 0,6 s) |
| Tipos de cuantizacion | int8 dinamica sobre las MatMul (ONNX) |
| Idiomas soportados | es (castellano) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, `enc.onnx`, `fx.onnx`); JSON para vocabularios y configuracion |

## Arquitectura y entrenamiento

El modelo parte de jonatasgrosman/wav2vec2-large-xlsr-53-spanish, fine-tuneado con CTC sobre letras y podado a las 16 capas inferiores de 24. Sobre esa base se anaden dos etapas de 10.000 pasos cada una: en la primera se incorpora una cabeza de fonemas que se entrena junto con el encoder y la cabeza de letras. El codificador convolucional de caracteristicas queda congelado durante el fine-tuning, lo que permite cortar el modelo en dos ficheros (`fx.onnx` y `enc.onnx`) y compartir la parte convolucional entre modelos de distintos idiomas de la misma familia vrc-we-voice.

Los datos de entrenamiento combinan Common Voice 19.0 (280.781 enunciados, CC0), Multilingual Spoken Words Corpus (446.571, CC BY 4.0), FLEURS train (2.205, CC BY 4.0), Multilingual LibriSpeech (220.699, CC BY 4.0) y VoxPopuli transcrito (50.919, CC0). Las etiquetas de fonemas se generan con CharsiuG2P (MIT) a partir de un lexico de 135.836 palabras; 920.043 enunciados disponen de transcripcion fonetica y el resto entrena solo la cabeza de letras. Se anaden ruido y salas de MUSAN y FSD50K. La fusion de las dos cabezas puntua cada fotograma con el maximo alcanzado en los ultimos 0,6 s, combina 0,7 de la cabeza de letras y 0,3 de la de fonemas cuando ambas coinciden, y penaliza 0,4 cuando solo una detecta la frase; los umbrales de disparo son -0,537 para una palabra y -0,478 para varias.

## Capacidades

- Deteccion de palabras clave y frases cortas en castellano a partir de audio mono a 16 kHz.
- Salida CTC dual: logits de letras (41 simbolos) y logits de fonemas IPA (56 simbolos) por fotograma de 20 ms.
- Reconocimiento de variantes de pronunciacion y homofonos mediante la tabla `pron.tsv` y la fusion de cabezas.
- Uso de lexico de pronunciaciones (`lexicon.tsv`) para mapear palabras a fonemas.
- Inferencia en ONNX Runtime con cuantizacion int8 dinamica, sin necesidad de GPU.
- Reutilizacion del extractor convolucional (`fx.onnx`) entre idiomas de la familia vrc-we-voice.
- No soporta tool calling, agentes, vision ni audio generativo; es exclusivamente un modelo de reconocimiento de voz por CTC.

## Casos de uso

- Activacion por palabra clave en asistentes de voz: el modelo dispara una frase registrada cuando la fusion de cabezas supera el umbral, con una ventana de decision de 0,6 s que reduce falsos positivos en entornos ruidosos.
- Control por voz de aplicaciones de escritorio o moviles: al ser ONNX int8 de 254 MB, puede embeberse en un cliente sin servidor de inferencia y ejecutarse en CPU.
- Reconocimiento de comandos con variantes de pronunciacion: la tabla `pron.tsv` permite que un mismo comando se detecte aunque el usuario lo pronuncie con otra grafia o como homofono.
- Filtrado de audio en pipelines de transcripcion: usar la cabeza de letras como etapa previa para decidir si un segmento contiene una frase de interes antes de enviarlo a un ASR completo.
- Sistemas multilingues con deteccion por idioma: al compartir `fx.onnx` con los demas modelos vrc-we-voice, un cliente puede escuchar en varios idiomas ejecutando el extractor convolucional una sola vez por ventana.
- Investigacion en keyword spotting y CTC fonetico: el par de cabezas y la fusion documentada en `voice.json` sirven como referencia reproducible para experimentos de deteccion con fonemas.
- Accesibilidad: comandos de voz para usuarios con dificultades motoras, con umbrales ajustables y bajo coste de despliegue en hardware de consumo.

## Benchmarks y rendimiento

La model card solo publica metricas internas de la tabla de pronunciacion, no benchmarks estandar de ASR:

| Metrica | Sin tabla | Con tabla |
|---|---|---|
| Homofonos reconocidos como otro miembro del grupo, % | 48 | 69 |
| Variantes ortograficas reconocidas como otro miembro del grupo, % | 34 | 54 |
| Falsos disparos por frase-hora en los conjuntos de palabras | 0,35 | 0,35 |

No se han publicado resultados de benchmarks estandar (WER, MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo ONNX int8 ocupa 254 MB y puede ejecutarse en CPU sin GPU.
- GPU recomendadas: no disponible; al ser un modelo pequeno y cuantizado, cualquier GPU con soporte ONNX Runtime es suficiente, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: si, por el tamano del fichero int8, aunque no se detalla que GPUs concretas se han probado.
- Opciones de despliegue: ONNX Runtime (formato nativo); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oblivius/vrc-we-voice-es | no disponible (16 capas, int8 254 MB) | no disponible (marcos de 20 ms) | metricas internas de homofonos y falsos disparos | Apache 2.0 | Hugging Face, ONNX |
| jonatasgrosman/wav2vec2-large-xlsr-53-spanish | no disponible | no disponible | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| oblivius/vrc-we-voice-en | no disponible | no disponible | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

No se dispone de datos de benchmarks comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en deteccion de frases cortas, no en transcripcion de audio largo ni en ASR general.
- Solo soporta castellano; no se declaran capacidades multilingues.
- Las frases con palabras ausentes del lexico y las de menos de cinco letras se deciden unicamente por la cabeza de letras, lo que reduce la cobertura de la fusion.
- Los umbrales de disparo estan ajustados para igualar los falsos positivos de la version anterior; cambios en el dominio acustico pueden alterar la tasa real de falsos disparos.
- Riesgo de alucinacion en la decodificacion CTC ante audio ruidoso o fuera de dominio; no se documentan tasas de error en condiciones adversas.
- La licencia Apache 2.0 permite uso comercial, pero las dependencias de datos (CharsiuG2P, WikiPron, MUSAN, FSD50K) tienen sus propias condiciones que conviene revisar.
- No se documentan sesgos demograficos ni de acento; el rendimiento puede variar segun la variedad de castellano.
- La informacion sobre latencia, throughput y consumo de recursos es insuficiente para planificar produccion a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oblivius/vrc-we-voice-es
- Modelo base: https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-spanish
- Modelo hermano en ingles: https://huggingface.co/oblivius/vrc-we-voice-en
- Common Voice: https://commonvoice.mozilla.org
- Multilingual Spoken Words Corpus: https://mlcommons.org/datasets/multilingual-spoken-words/
- FLEURS: https://huggingface.co/datasets/google/fleurs
- Multilingual LibriSpeech: https://huggingface.co/datasets/facebook/multilingual_librispeech
- VoxPopuli: https://github.com/facebookresearch/voxpopuli
- CharsiuG2P: https://github.com/lingjzhu/CharsiuG2P
- MUSAN: https://www.openslr.org/17/
- FSD50K: https://zenodo.org/records/4060432
