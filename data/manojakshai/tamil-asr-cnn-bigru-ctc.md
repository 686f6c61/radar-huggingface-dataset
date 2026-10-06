# Manojakshai/tamil-asr-cnn-bigru-ctc

## Resumen

Tamil ASR — CNN + BiGRU + CTC es un modelo de reconocimiento automatico del habla (ASR) para tamil entrenado desde cero con PyTorch por el usuario Manojakshai. A diferencia de los modelos ASR habituales basados en transformers, emplea una arquitectura hibrida convolucional-recurrente: un extractor CNN seguido de una GRU bidireccional de tres capas y un decodificador CTC a nivel de caracter. El modelo convierte audio mono a 16 kHz en transcripciones de tamil y esta pensado para experimentos de investigacion sobre habla tamil, en particular enunciados cortos del ambito de productos de alimentacion y comestibles.

El tamano del modelo no esta publicado y el repositorio de HuggingFace figura con 0.0 GB, de modo que no es posible determinar el numero de parametros a partir de la informacion disponible. El checkpoint se distribuye como un fichero PyTorch personalizado (`best_cer.pt`) que no sigue la arquitectura estandar de HuggingFace Transformers, por lo que requiere el codigo de definicion del modelo y el pipeline de preprocesado e inferencia del autor para poder ejecutarse.

La relevancia de esta ficha es acotada: se trata de un experimento academico o personal con cero descargas y cero "likes" en el momento de la consulta, entrenado sobre un conjunto de datos muy reducido (1.627 muestras en total) y con un CER de validacion del 20,20%. No cuenta con licencia declarada, ni con resultados de benchmarks comparables a los de modelos ASR de referencia, por lo que su uso en produccion no esta respaldado por la informacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (2 capas) + GRU bidireccional (3 capas) + CTC a nivel de caracter |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de ventana de texto; entrada de audio de duracion no especificada |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en coma flotante, sin versiones cuantizadas publicadas) |
| Idiomas soportados | tamil (unico idioma del conjunto de entrenamiento; no se declara soporte de otros idiomas) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch personalizado (`best_cer.pt`); no es safetensors ni GGUF |
| Frecuencia de muestreo de entrada | 16 kHz, mono |
| Caracteristicas de audio | espectrograma log-mel de 80 bins, FFT de 400, hop length de 160 |
| Canales CNN | 32 → 32; stride conv1 (2, 2), stride conv2 (2, 1) |
| GRU | 3 capas bidireccionales, hidden size 256, salida 512 |
| Capa de salida | 512 → 48 |
| Vocabulario | 48 simbolos (caracteres tamil); indice de blank CTC = 0 |
| Decodificacion | CTC greedy |
| Normalizacion | media/desviacion tipica por muestra |
| Ficheros del repositorio | `best_cer.pt`, `config.json`, `vocab.json` |

## Arquitectura y entrenamiento

El modelo sigue un pipeline secuencial: audio a 16 kHz mono, extraccion de espectrograma log-mel de 80 bins (FFT 400, hop 160), dos capas convolucionales con 32 canales cada una, una GRU bidireccional de tres capas con hidden size 256 y salida de 512, una capa lineal de 512 a 48 y, finalmente, decodificacion CTC greedy a nivel de caracter. La normalizacion se aplica por muestra con media y desviacion tipica. El indice de blank de CTC es 0 y el vocabulario contiene 48 simbolos.

El entrenamiento se realizo desde cero sobre el denominado "ASR Master Dataset", con 1.627 muestras en total repartidas en 1.301 de entrenamiento, 162 de validacion y 164 de prueba. El idioma es exclusivamente tamil y las transcripciones se usaron tal cual estaban almacenadas. Se aplico aumento de datos consistente en enmascaramiento de frecuencia (25), enmascaramiento temporal (50) y ruido gaussiano con desviacion tipica 0,01. No se menciona en la informacion disponible el uso de RLHF, DPO ni ninguna otra fase de ajuste por preferencias, algo por otra parte poco habitual en un modelo ASR.

No se documenta ninguna innovacion tecnica destacable (atencion lineal, decodificacion especulativa, destilacion u otras). El checkpoint seleccionado es `best_cer.pt`, correspondiente a la mejor epoca de validacion (epoca 99), con una perdida de validacion de 0,960566 y un CER de validacion del 20,20%. El conjunto de prueba de 164 muestras se mantiene separado para la evaluacion final, pero su resultado no se publica en la informacion disponible.

## Capacidades

- Reconocimiento de voz en tamil: transcribe audio mono a 16 kHz a texto en caracteres tamil mediante CTC greedy.
- Orientacion a enunciados cortos: el autor indica que el modelo esta pensado para expresiones habladas breves relacionadas con productos y comestibles.
- Salida a nivel de caracter: el vocabulario de 48 simbolos corresponde a caracteres tamil, no a subpalabras ni palabras completas.
- Aumento de datos en entrenamiento: robustez parcial frente a enmascaramiento temporal, enmascaramiento de frecuencia y ruido gaussiano leve.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara capacidad multilingue: el entrenamiento es exclusivamente en tamil.
- No se declaran capacidades de vision, audio-vision ni modo de razonamiento explicito.

## Casos de uso

- Experimentacion academica en ASR para lenguas de bajos recursos: el modelo sirve como punto de partida reproducible para comparar arquitecturas hibridas CNN+BiGRU+CTC frente a modelos basados en transformers en tamil.
- Transcripcion de dictado corto en tamil: adecuado para frases breves con vocabulario simple, dado el caracter del conjunto de entrenamiento orientado a productos y comestibles.
- Prototipado de interfaces de voz para comercio minorista en tamil: se podria usar para transcribir ordenes cortas de productos en una demo o prueba de concepto, siempre que se asuma el CER del 20,20% y se valide con datos propios.
- Generacion de transcripciones para anotacion asistida: dado su CER de validacion, puede emplearse para preanotar audios cortos en tamil y reducir el esfuerzo de etiquetado manual, con revision humana posterior.
- Investigacion sobre decodificacion CTC: al ser un modelo pequeno y de codigo propio, resulta util para experimentar con estrategias de decodificacion (greedy frente a beam search) o con tecnicas de aumento de datos.
- Base para ajuste fino con mas datos: la arquitectura y el vocabulario de 48 caracteres pueden servir de punto de partida para reentrenar con corpus tamil mas amplios, si se dispone del codigo de definicion del modelo.
- Evaluacion comparativa de robustez al ruido: las tecnicas de enmascaramiento y ruido gaussiano aplicadas permiten estudiar el comportamiento del modelo en condiciones acusticas degradadas dentro de un marco de investigacion.

## Benchmarks y rendimiento

| Metrica | Conjunto | Resultado |
|---|---|---|
| CER de validacion | Validacion (162 muestras) | 20,20% |
| Perdida de validacion | Validacion (162 muestras) | 0,960566 |
| Mejor epoca de validacion | Validacion | 99 |
| CER de prueba | Prueba (164 muestras) | no publicado |
| WER | no disponible | no disponible |
| MMLU / HumanEval / GSM8K | no aplica (modelo ASR) | no disponible |

No se han publicado resultados de benchmarks adicionales ni comparaciones con otros modelos ASR en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica el numero de parametros ni el tamano del checkpoint, y el repositorio figura con 0.0 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. La arquitectura (32 canales convolucionales, GRU de 256 unidades ocultas, salida de 48 clases) corresponde a un modelo de dimension reducida, por lo que es probable que quepa en GPU de consumo, pero esta apreciacion es una inferencia a partir de la arquitectura y no un dato publicado por el autor.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. Al no ser un modelo de HuggingFace Transformers, requiere el codigo de definicion del modelo y el pipeline de preprocesado del autor (`config.json` y `vocab.json` acompanan al checkpoint).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Resultado en tamil |
|---|---|---|---|---|---|---|
| Manojakshai/tamil-asr-cnn-bigru-ctc | CNN + BiGRU + CTC | no disponible | no aplica | tamil | no disponible | CER de validacion 20,20% |
| OpenAI Whisper (familia) | Transformer encoder-decoder | no disponible en la informacion proporcionada | no aplica (audio) | multilingue | licencia propia de OpenAI | no disponible |
| AI4Bharat IndicWav2Vec / IndicConformer | Transformer / Conformer auto-supervisado | no disponible en la informacion proporcionada | no aplica (audio) | varias lenguas indias, incluido tamil | no disponible en la informacion proporcionada | no disponible |

No se dispone de datos verificados en la informacion proporcionada para completar una comparacion cuantitativa con estos modelos. La comparativa se limita a la categoria funcional (ASR para tamil) y no a cifras de rendimiento.

## Limitaciones y advertencias

- Conjunto de entrenamiento muy reducido: 1.627 muestras en total (1.301 de entrenamiento), lo que limita severamente la generalizacion a hablantes, acentos, dominios y condiciones acusticas no representadas.
- CER de validacion del 20,20%: en la practica implica un error aproximado de uno de cada cinco caracteres, cifra elevada para la mayoria de aplicaciones en produccion.
- Dominio restringido: el autor declara que el modelo esta pensado para enunciados cortos de productos y comestibles; el rendimiento fuera de ese dominio es desconocido.
- Un solo idioma: entrenado exclusivamente en tamil; no se declara soporte de code-switching ni de otras lenguas.
- Sin licencia declarada: la ausencia de licencia impide determinar si el uso comercial esta permitido. No debe asumirse permiso de uso comercial.
- Riesgo de alucinacion y de salidas incoherentes: como todo modelo CTC entrenado con pocos datos, puede producir transcripciones incorrectas o secuencias de caracteres sin sentido, especialmente con audio ruidoso o fuera de dominio.
- Formato no estandar: el checkpoint no es compatible con transformers de HuggingFace ni con formatos GGUF; requiere el codigo de definicion del modelo y el preprocesado del autor, lo que complica su integracion y su mantenimiento.
- Sin resultados de prueba publicados: el CER final sobre el conjunto de prueba de 164 muestras no se comunica, por lo que el 20,20% de validacion podria no reflejar el rendimiento real en datos no vistos.
- Repositorio con cero descargas y cero "likes": no existe evidencia de uso o validacion independiente por parte de la comunidad.
- Sesgos potenciales: no hay informacion sobre la distribucion de hablantes (genero, edad, region, variedad dialectal del tamil) en el conjunto de entrenamiento, por lo que no puede evaluarse el sesgo demografico o dialectal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Manojakshai/tamil-asr-cnn-bigru-ctc
- Los resultados de la busqueda web no aportaron enlaces relevantes al modelo ni a su documentacion tecnica; no se dispone de paper, blog, repositorio de codigo ni demo adicionales.
