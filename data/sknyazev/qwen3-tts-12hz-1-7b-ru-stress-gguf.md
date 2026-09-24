# sknyazev/qwen3-tts-12hz-1.7b-ru-stress-gguf

## Resumen

Qwen3-TTS-12Hz-1.7B para ruso con marcas de acentuación es un ajuste fino (fine-tune) del modelo de síntesis de voz Qwen/Qwen3-TTS-12Hz-1.7B-Base, publicado por el usuario sknyazev dentro del ecosistema del servidor de voz local voicy. El problema que resuelve es concreto: el modelo base no interpreta el signo de acento combinable U+0301, de modo que palabras homógrafas como сто́ит / стои́т o за́мок / замо́к se pronuncian mal y, además, el carácter se corrompe en la salida. Este ajuste hace que la parte "hablante" (talker) respete la marca de acento tal y como aparece en el texto de entrada.

Técnicamente se trata de un adaptador LoRA de rango 16 aplicado sobre las capas de atención y MLP del transformador principal del talker, con 17,4 millones de parámetros entrenables (aproximadamente el 1 % del modelo) y el resto de componentes congelados (embeddings, cabezas y predictor de codebooks). Los pesos se distribuyen en GGUF para llama.cpp y ONNX para ONNX Runtime, sin dependencia de PyTorch ni de Python en tiempo de inferencia. El modelo está pensado exclusivamente para ruso y se publica bajo licencia Apache-2.0.

Su relevancia actual es doble: por un lado demuestra que una intervención mínima (una época, lr 1e-4, una RTX 3080 de 10 GB) puede corregir un comportamiento fonológico específico de un modelo TTS grande; por otro, ofrece una ruta de despliegue puramente nativa (llama.cpp + ONNX Runtime en Rust) que encaja en pipelines locales sin GPU de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS autorregresivo sobre Qwen3-TTS-12Hz-1.7B-Base: transformador "talker" + predictor de codebooks + decodificador de códec neural; ajuste mediante LoRA r=16 en atención y MLP |
| Parametros totales | 1,7 B en el modelo base; 141.570.304 parámetros reportados en los safetensors del repositorio; adaptador LoRA: 17,4 M (≈1 % del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: q5_k (por defecto), q8_0, f16; ONNX: fp16 (decodificador de códec) y fp32 (codificadores de voz y de hablante) |
| Idiomas soportados | ruso (ru) únicamente |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), ONNX (ONNX Runtime), safetensors (adaptador LoRA) y tablas de embeddings en .npy |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-TTS-12Hz-1.7B-Base, que se descompone en varias piezas: un transformador principal ("talker") que genera los tokens acústicos, un predictor de codebooks, un decodificador de códec neural, un codificador de la muestra de voz de referencia y un codificador de hablante, además de tablas de embeddings. El ajuste se realizó mediante LoRA de rango 16 sobre las capas de atención y MLP del transformador principal, con una sola época, learning rate 1e-4 y una RTX 3080 de 10 GB. Los embeddings, las cabezas y el predictor de codebooks permanecieron congelados. El reparto de los ejemplos de entrenamiento replica el modo de generación de voicy, es decir, clonación de voz a partir de una muestra.

Los datos de entrenamiento combinan dos fuentes. La primera es Russian LibriSpeech (OpenSLR 96, copia istupakov/russian_librispeech): 11,9 horas de audiolibros LibriVox de dominio público en EE. UU., 5 locutores con un máximo de 2,5 horas por locutor, con acentos anotados por RUAccent. La segunda son 3000 frases con acentos desplazados, sintetizadas con ESpeech-TTS-1 RL-V2 (Apache-2.0), en las que el 70 % tiene entre 1 y 3 palabras movidas a otra sílaba y siempre llevan marca. La innovación clave es precisamente este segundo conjunto: sin ejemplos donde la marca contradiga la tendencia natural del modelo, no habría señal de aprendizaje para que el signo se interpretase.

## Capacidades

- Sintesis de voz en ruso (text-to-speech) a 12 Hz de frecuencia de trama del códec.
- Clonacion de voz a partir de una muestra de referencia, mediante los codificadores de voz y de hablante.
- Interpretacion explicita de la marca de acento U+0301 colocada justo despues de la vocal tonica (por ejemplo, сто́ит frente a стои́т).
- Lectura de texto sin marcas de acento de forma equivalente al modelo base, es decir, asignando el acento de manera automatica cuando no se especifica.
- Integracion con el servidor voicy, que inserta las marcas de acento antes de la sintesis mediante RUAccent portado a Rust mas un diccionario propio de pronunciaciones.
- Capacidad de desactivar el marcado de acento mediante la opcion --no-stress o el parametro "stress": false en la peticion.
- No incorpora tool calling, function calling, razonamiento multi-paso, vision ni audio de entrada mas alla de la muestra de voz para clonacion.

## Casos de uso

- Lectura de audiolibros y articulos en ruso: el modelo mantiene la pronunciacion correcta de homografos frecuentes, algo critico en narracion larga donde un acento erroneo se percibe como un error grave de calidad.
- Generacion de voces para doblaje y locucion profesional: la clonacion por muestra permite reproducir un timbre concreto y corregir manualmente el acento en guiones tecnicos o nombres propios.
- Asistentes de voz locales: al ejecutarse sobre llama.cpp y ONNX Runtime sin Python ni PyTorch, encaja en un servidor de voz autoalojado con requisitos de VRAM modestos.
- Sistemas de accesibilidad (lectura de pantalla): la ventana de texto se sintetiza con acentos verificados por RUAccent, reduciendo ambiguedades en palabras como за́мок o замо́к.
- Ensenanza de ruso como lengua extranjera: la marca de acento explicita permite generar pares minimos (antes / despues) para practicar la distincion tonal y de acentuacion.
- Investigacion en prosodia y fonologia: el modelo sirve como banco de pruebas controlado para medir hasta que punto un LLM de sintesis respeta una anotacion suprasegmental explicita.
- Prototipado de interfaces conversacionales en ruso: la integracion con voicy facilita levantar un endpoint de TTS local con clonacion y control de acento sin depender de servicios en la nube.

## Benchmarks y rendimiento

Los unicos datos publicados proceden de la model card y se midieron con voicy sobre la parte hablante en q5_k (llama.cpp) con la asignacion de acentos de RUAccent en Rust, una RTX 3080 y la voz `turgenev`. La metrica de acento usa un medidor automatico que compara el contorno de volumen de la palabra con referencias de Silero; segun el autor, tiene un 10-12 % de falsos positivos y detecta el 71 % de los acentos desplazados.

| Metrica | Modelo base | Este modelo |
|---|---|---|
| Acento en silaba no normativa (24 frases x todos los silabos x 3 semillas) | 26 % de 134 | 43 % de 215, p = 0.0008 |
| Mismo caso en Silero con la misma anotacion (limite del medidor) | — | 66 % |
| Texto normal, 79 frases x 2 semillas: acento distinto al de RUAccent (corregido por el medidor) | 14 % | 12 % |
| CER de reconocimiento inverso, mismas frases | 3,6 % | 4,3 % (IC de la diferencia −0,15 a +1,65 p.p.) |
| Similitud de voz con la muestra (codificador de hablante de Qwen, bf16) | 0,985 | 0,983 |

El propio autor senala que la cuantizacion no afecta a la capacidad de seguir el acento: f16 da un 44 % y q5_k un 43 %. En texto normal la diferencia entre ambas versiones queda dentro del ruido. No se han publicado resultados de benchmarks adicionales (tipo MMLU, HumanEval o GSM8K), ya que no aplican a un modelo de sintesis de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2,5-3 GB con el paquete por defecto, sumando q5_k (1,0 GB), predictor de codebooks (151 MB), decodificador de codec (230 MB), codificador de codec (226 MB), codificador de hablante (48 MB) y embeddings .npy (866 MB).
- Variante sin cuantizar: la parte hablante en f16 ocupa 2,8 GB, de modo que el conjunto completo ronda los 4,3-4,5 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM; el autor entreno el adaptador en una RTX 3080 de 10 GB, y la inferencia es mas ligera. Una RTX 3060, 4060 o 4090 son suficientes.
- Si cabe en GPU consumer: si, con holgura. Tambien puede ejecutarse en CPU mediante llama.cpp, dado el tamano reducido de los pesos.
- Opciones de despliegue: llama.cpp y ONNX Runtime son los entornos nativos. El proyecto voicy proporciona el servidor listo para usar (voicy setup y voicy serve). No hay soporte documentado para vLLM, TGI o Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Acento explicito | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (sknyazev/qwen3-tts-12hz-1.7b-ru-stress-gguf) | 1,7 B (+ LoRA 17,4 M) | no disponible | Si (U+0301) | ru | apache-2.0 | GGUF y ONNX |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | 1,7 B | no disponible | No (corrompe la marca) | no disponible | no disponible en la informacion | safetensors |
| Silero TTS | no disponible | no disponible | No aplica (referencia del medidor de acento) | ru | no disponible en la informacion | no disponible |
| ESpeech-TTS-1 RL-V2 | no disponible | no disponible | No aplica (usado para generar datos de entrenamiento) | no disponible | apache-2.0 | HuggingFace |

La comparacion directa mas relevante es con el modelo base: comparten arquitectura, tamano y formato, y la unica diferencia funcional es la interpretacion de la marca de acento, que pasa de un 26 % a un 43 % de acierto en silabas no normativas sin degradar de forma significativa el CER ni la similitud de voz.

## Limitaciones y advertencias

- El modelo solo funciona en ruso; no hay soporte documentado para otros idiomas.
- La asignacion automatica de acentos depende de RUAccent y del diccionario de voicy; el propio autor reconoce que falla en terminos ingleses transliterados al cirilico (por ejemplo, "экстендс" o "он делит каскад").
- Sin el archivo stress.json junto a los pesos, el servidor no inserta marcas de acento y el modelo se comporta como el base.
- En texto normal sin marcas, la mejora frente al modelo base queda dentro del margen de ruido del medidor (14 % frente a 12 %), por lo que el beneficio se concentra en textos anotados manual o automaticamente.
- Riesgo de alucinacion de pronunciacion: el modelo puede producir una entonacion o acentuacion plausible pero incorrecta en palabras no vistas durante el entrenamiento.
- El conjunto de datos base es limitado (11,9 horas y 5 locutores), lo que puede sesgar el timbre y la prosodia hacia esas voces de audiolibro.
- El repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, por lo que no existe validacion comunitaria independiente.
- La fecha de creacion registrada (2026-09-24) es posterior a la fecha habitual de publicacion; conviene verificar la vigencia del repositorio antes de usarlo en produccion.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe cumplir tambien las condiciones del modelo base y de los datos derivados (LibriVox y ESpeech-TTS-1 RL-V2).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sknyazev/qwen3-tts-12hz-1.7b-ru-stress-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Variante base del mismo autor en GGUF: https://huggingface.co/sknyazev/qwen3-tts-12hz-1.7b-base-gguf
- Proyecto voicy: https://github.com/olluorg/voicy
- Implementacion nativa en Rust: https://github.com/olluorg/voicy/blob/master/rust/src/native/qwen.rs
- Informe del experimento de ajuste por acento: https://github.com/olluorg/voicy/blob/master/experiments/23-stress-finetune/README.md
- Decision de arquitectura (ADR 0023): https://github.com/olluorg/voicy/blob/master/docs/adr/0023-stress-marks-by-lora.md
- Demostracion con homografos y pares antes / despues: https://olluorg.github.io/voicy/stress/
- RUAccent (herramienta de marcado de acento): https://github.com/Den4ikAI/ruaccent
- Dataset Russian LibriSpeech (OpenSLR 96): https://www.openslr.org/96/
- Copia del dataset en HuggingFace: https://huggingface.co/datasets/istupakov/russian_librispeech
- Modelo usado para generar datos de entrenamiento: https://huggingface.co/ESpeech/ESpeech-TTS-1_RL-V2
