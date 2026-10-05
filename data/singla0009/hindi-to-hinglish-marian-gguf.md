# Singla0009/Hindi-to-Hinglish-Marian-GGUF

## Resumen

El modelo Singla0009/Hindi-to-Hinglish-Marian-GGUF es un sistema de transliteracion neuronal que convierte texto hindi escrito en Devanagari a Hinglish romanizado (hindi coloquial escrito con alfabeto latino). Lo publica el usuario Singla0009 en HuggingFace y esta construido sobre una variante destilada de MarianMT, la arquitectura transformer secuencia-a-secuencia de traduccion automatica neuronal, con 6 capas de encoder y una unica capa de decoder. Cuenta con 148.891.847 parametros totales, dimension de embedding de 512, 8 cabezas de atencion y un vocabulario de 61.127 tokens gestionado con un tokenizer SentencePiece embebido en el propio contenedor GGUF.

Su relevancia practica esta en el nicho de la romanizacion de subtitulos y transcripciones en tiempo real para el mercado indic: el modelo se distribuye ya cuantizado (Q8_0 y FP16) en formato GGUF, de modo que puede ejecutarse tanto en CPU como en GPU a traves de Vulkan o CUDA con una huella de memoria muy reducida (aproximadamente 62 MB en Q8_0). Segun la model card, alcanza unas 220 palabras por segundo y una latencia de 30 a 60 ms por frase completa en una GPU Vulkan, lo que lo situa por encima de 150 veces el tiempo real en flujos de subtitulado en directo.

La licencia es MIT, lo que facilita su integracion en productos comerciales, y el modelo esta pensado como componente de pipelines de procesamiento de lenguaje natural indic mas amplios (por ejemplo, reconocimiento automatico del habla en hindi seguido de romanizacion para subtitulos). Es un modelo muy especializado y de tamano reducido, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer secuencia-a-secuencia (MarianMT destilado) |
| Parametros totales | 148.891.847 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (INT8) y FP16 (f16) |
| Idiomas soportados | Hindi (hi) de entrada, Hinglish romanizado (latino) de salida; etiquetado tambien como en |
| Licencia | MIT |
| Formato de pesos | GGUF v3 (variantes q8_0 y f16) |

Detalles adicionales de arquitectura declarados por el autor: 6 bloques de encoder, 1 bloque de decoder, dimension de embedding (d_model) de 512, 8 cabezas de atencion, dimension feedforward (ffn_dim) de 2048, funcion de activacion Swish/SiLU y tokenizer SentencePiece embebido y autocontenido dentro del contenedor GGUF.

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder de tipo MarianMT, la familia desarrollada por el equipo de Helsinki-NLP para traduccion automatica neuronal, pero en este caso destilada: el encoder conserva 6 capas mientras que el decoder se reduce a una sola capa. Esta asimetria reduce drasticamente el coste del decodificado autoregresivo, que es la fase mas secuencial y costosa de un modelo seq2seq, y es coherente con el objetivo declarado de baja latencia para subtitulado en directo. La dimension interna es modesta (d_model de 512, ffn_dim de 2048, 8 cabezas), lo que explica un total de parametros por debajo de los 150 millones.

No se aportan en la informacion disponible datos sobre el corpus de entrenamiento: no se indica el numero de tokens, la composicion del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO. El autor tampoco detalla el procedimiento de destilacion ni el modelo profesor empleado. La model card si especifica que el tokenizer SentencePiece va integrado en el propio archivo GGUF, lo que elimina dependencias externas en tiempo de inferencia. Tampoco se declara explicitamente la longitud maxima de secuencia soportada, un dato que seria relevante para procesar parrafos largos.

## Capacidades

- Transliteracion de hindi en Devanagari a Hinglish romanizado, preservando prestamos del ingles y nombres propios en su forma coloquial (por ejemplo, "फ्रेंचाइजी" pasa a "franchise").
- Generacion de texto de salida en alfabeto latino orientada a subtitulos y transcripciones.
- Procesamiento frase a frase con baja latencia, apto para flujos continuos (streaming).
- Funcionamiento en CPU y en GPU (Vulkan y CUDA) gracias al formato GGUF y a su tamano reducido.
- Capacidad multilingue limitada: entrada en hindi y salida con mezcla de hindi romanizado e ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Subtitulado en directo de contenido hindi: el modelo se situa detras de un sistema de reconocimiento automatico del habla que emite texto en Devanagari y lo convierte a Hinglish latino en tiempo real, con una latencia declarada de 30 a 60 ms por frase, apta para emisiones en vivo.
- Romanizacion de transcripciones de video o podcast: una vez generada la transcripcion hindi, el modelo la pasa a Hinglish para publicar subtitulos o articulos legibles por audiencias que no leen Devanagari.
- Procesamiento por lotes en pipelines de NLP indic: dado su tamano de 62 MB en Q8_0, puede desplegarse en contenedores ligeros y escalar horizontalmente para romanizar grandes volumenes de texto sin coste elevado de GPU.
- Preprocesamiento para modelos de lenguaje romanizados: al convertir hindi a Hinglish, un modelo posterior que solo maneje bien el alfabeto latino puede procesar el contenido sin necesidad de tokenizar Devanagari.
- Normalizacion de chats y mensajes de usuario: aplicaciones de mensajeria o redes sociales que reciben texto hindi pueden romanizarlo para moderacion, busqueda o analitica sobre terminos en alfabeto latino.
- Herramientas de accesibilidad y aprendizaje de idiomas: generar transliteraciones legibles para estudiantes que aprenden hindi pero aun no dominan el alfabeto Devanagari, o para hablantes de hindi que consumen interfaces en alfabeto latino.
- Integracion en aplicaciones de escritorio o moviles: el modelo corre en CPU o en GPU consumer sin requisitos de hardware especiales, por lo que puede empaquetarse como utilidad local mediante el CLI Sussurro o llama.cpp.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks de calidad estandar (MMLU, HumanEval, GSM8K, BLEU, chrF u otros). La unica informacion de rendimiento disponible es de velocidad y latencia, medida por el autor en una GPU Vulkan sobre un flujo continuo multidominio:

| Metrica | Valor declarado |
|---|---|
| Velocidad de inferencia | ~220 palabras por segundo |
| Latencia por frase completa | ~30 ms a 60 ms |
| Real-Time Factor | Superior a 150x respecto al tiempo real (subtitulado en directo) |

No se han publicado resultados de benchmarks de calidad de traduccion en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada en Q8_0: aproximadamente 62 MB.
- VRAM/RAM estimada en FP16: aproximadamente 290 MB.
- GPU recomendadas: cualquier GPU moderna es suficiente; el autor menciona inferencia en Vulkan y CUDA. Modelos como una RTX 4090, A100 o H100 estan enormemente sobredimensionados para este modelo.
- Compatibilidad con GPU de consumo: si, cabe con holgura en cualquier GPU de consumo, integrada o dedicada, e incluso en telefonos o dispositivos embebidos.
- Alternativa sin GPU: puede ejecutarse unicamente en CPU dado su tamano y su formato GGUF.
- Opciones de despliegue: CLI Sussurro (Vulkan/CPU), llama.cpp y cualquier runtime compatible con GGUF; el autor muestra tambien invocacion desde Python mediante subprocess.
- Latencia y throughput: segun el autor, unas 220 palabras por segundo y 30 a 60 ms por frase en GPU Vulkan.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos verificables sobre modelos alternativos de transliteracion hindi a Hinglish comparables en parametros, contexto, rendimiento o licencia. La busqueda web realizada no devolvio resultados tecnicos relevantes (los enlaces obtenidos corresponden a la red social X y no guardan relacion con el modelo). Por tanto:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Singla0009/Hindi-to-Hinglish-Marian-GGUF | 148.891.847 | No disponible | ~220 palabras/s, 30-60 ms/frase | MIT | GGUF en HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No disponible: no se dispone de datos fiables de modelos comparables en la informacion suministrada.

## Limitaciones y advertencias

- Modelo altamente especializado: no es un modelo de proposito general y no debe esperarse de el razonamiento, codigo, matematicas ni generacion libre de texto.
- La salida es transliteracion, no traduccion semantica; el texto hindi se escribe en alfabeto latino, no se traduce a ingles.
- Riesgo de alucinacion o de romanizacion incorrecta en palabras poco frecuentes, nombres propios o prestamos del ingles con ortografia irregular.
- No se declara la longitud maxima de contexto; con frases muy largas o parrafos extensos el comportamiento puede degradarse.
- Cobertura idiomatica limitada a hindi con salida en Hinglish; el tag de idiomas incluye tambien "en", pero no se documenta soporte de traduccion real entre idiomas.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y fue creado y actualizado el mismo dia, por lo que no cuenta con validacion de la comunidad ni pruebas independientes.
- La latencia y la velocidad declaradas provienen del autor y no han sido verificadas de forma independiente.
- Licencia MIT: permite uso comercial, pero conviene revisar la atribucion y las condiciones de los datos de entrenamiento subyacentes de MarianMT, que no se detallan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Singla0009/Hindi-to-Hinglish-Marian-GGUF
- No se han encontrado en la busqueda web enlaces relevantes adicionales (papers, blogs, repositorios o demos) asociados a este modelo.
