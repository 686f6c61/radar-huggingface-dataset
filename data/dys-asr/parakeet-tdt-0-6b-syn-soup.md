# dys-asr/parakeet-tdt-0.6b-syn-soup

## Resumen

`dys-asr/parakeet-tdt-0.6b-syn-soup` es un modelo de reconocimiento automatico del habla (ASR) en ingles especializado en habla disartrica y ataxica. Lo publica el usuario `dys-asr` y no es un entrenamiento desde cero, sino una "model soup" precalculada: los pesos de tres ajustes finos distintos de NVIDIA Parakeet TDT 0.6B se han promediado con peso uniforme de 1/3 por checkpoint. Los tres ingredientes (`all-aug`, `unconstrained` y `syn`) descienden de `nvidia/parakeet-tdt-0.6b-v3`.

El modelo tiene 627.057.286 parametros (aproximadamente 0,6 mil millones) y se distribuye en formato safetensors, con un tamano de repositorio de 2,5 GB. La arquitectura es un transductor TDT (Token-and-Duration Transducer), la familia de decodificacion usada por Parakeet, expuesta en Hugging Face Transformers mediante la clase `ParakeetForTDT` (requiere `transformers>=5.9`).

Su relevancia actual radica en el nicho al que apunta: el habla atipica (disartria, ataxia) es un caso historicamente mal cubierto por los modelos ASR generalistas, y este checkpoint esta pensado explicitamente para investigacion, evaluacion y envios a la pista "unconstrained" de retos tipo SAPC2. La model card reporta un CER del 4,99 % con busqueda por haces de tamano 2 sobre un subconjunto de 1.500 enunciados de habla de desarrollo de SAPC2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor TDT (Token-and-Duration Transducer) sobre encoder tipo Parakeet; la informacion disponible no detalla la variante concreta del encoder |
| Parametros totales | 627.057.286 (aproximadamente 0,6 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio; no se especifica ventana maxima de entrada) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas ni GGUF; los pesos se sirven en safetensors) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `other`; la model card no reproduce el texto de la licencia y remite a las condiciones de acceso especificas de los corpus fuente |
| Formato de pesos | safetensors (repo de 2,5 GB) |
| Modelo base | nvidia/parakeet-tdt-0.6b-v3 |
| Libreria | transformers (`ParakeetForTDT`, `transformers>=5.9`) |
| Pipeline | automatic-speech-recognition |
| Entrada de audio | Mono, 16 kHz |
| Estilo de salida | Texto normalizado en minusculas, sin puntuacion y con numeros escritos con palabras |

## Arquitectura y entrenamiento

La arquitectura es un transductor TDT, es decir, un modelo de decodificacion que predice conjuntamente tokens y su duracion, en la linea de los transductores tipo RNN-T pero con prediccion explicita de duraciones. La informacion disponible no detalla el numero de capas, la dimension del encoder ni si este es FastConformer o Conformer; unicamente se indica que los tres ingredientes comparten arquitectura y modelo base (`nvidia/parakeet-tdt-0.6b-v3`) y que, por tanto, sus tensores son compatibles entre si.

No hubo un entrenamiento adicional para producir este checkpoint: es una media de pesos. Para cada tensor en coma flotante con nombre y forma coincidentes se almacena `(all_aug + unconstrained + syn) / 3`; para los tensores no flotantes (por ejemplo, contadores) se guarda el maximo elemento a elemento. La configuracion, el tokenizer, el processor y los metadatos de generacion se copiaron del primer ingrediente compatible. El promediado es previo a la publicacion y no anade coste de memoria ni de computo en inferencia.

Los datos representados por la mezcla son: datos de entrenamiento y desarrollo de SAPC1 mas datos de entrenamiento deduplicados de SAPC2; perturbacion de velocidad en linea y SpecAugment en la receta `all-aug`; datos de habla ataxica de HeyJay! (ICPSR 39448) y Project Relate UK en la receta `unconstrained`; y 55.988 enunciados sinteticos generados con CosyVoice (aproximadamente 103,1 horas) en la receta sintetica. La model card aclara que las voces sinteticas se condicionaron con grabaciones de SAP, lo que constituye un condicionamiento de voz y no una simulacion clinica validada de disartria. No se menciona RLHF ni DPO, algo esperable en un modelo ASR.

## Capacidades

- Reconocimiento automatico del habla en ingles sobre audio mono a 16 kHz, con foco en hablantes con disartria y ataxia.
- Decodificacion greedy integrada en los pesos, accesible mediante `ParakeetForTDT.generate()`.
- Compatibilidad con decodificacion TDT mediante busqueda por haces, implementada fuera de los pesos (script `tdt_beam.py` del repositorio `extraordinarylab/ataxia`); el parametro `num_beams` de `ParakeetForTDT.generate()` no proporciona esa busqueda personalizada.
- Procesamiento por lotes mediante `processor.batch_decode`, apto para transcripcion masiva de corpus.
- Integracion con el ecosistema Transformers (AutoProcessor + ParakeetForTDT) y con endpoints compatibles segun las etiquetas del repositorio.
- Salida normalizada (minusculas, sin puntuacion, numeros como palabras), adecuada para metricas de error de caracteres y palabras.
- No se documentan capacidades de tool calling, agentes, vision, audio generation ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en ASR para habla ataxica y disartrica: es el proposito declarado del checkpoint, pensado para comparar recetas de ajuste fino y estrategias de mezcla de pesos sobre corpus de habla atipica.
- Envio a la pista "unconstrained" de retos de accesibilidad del habla: la model card indica que el modelo debe tratarse como unconstrained-track porque uno de los ingredientes usa corpus externos de habla disartrica; la submission asociada a Codabench usa la implementacion de beam search del repositorio `ataxia` con `SAPC_BEAM_SIZE=2`.
- Transcripcion asistida en contexto logopedico o clinico: permite generar borradores de transcripcion de sesiones con pacientes que reducen su inteligibilidad, siempre como herramienta de apoyo y no como sistema de diagnostico.
- Pre-anotacion de corpus para etiquetado humano: con lotes medianos y CER reportado en torno al 5 %, sirve para acelerar la transcripcion inicial de grabaciones y dejar al anotador la correccion, reduciendo coste por hora de audio.
- Accesibilidad y subtitulado en tiempo real o diferido: al ser un modelo de 0,6 B y 2,5 GB en safetensors, se puede desplegar en una GPU de gama media o incluso en CPU para generar subtitulos de intervenciones de personas con habla atipica.
- Evaluacion comparativa de decodificadores: el par de tablas de la model card (greedy frente a beam 2 y beam 4, con tiempos relativos de decodificacion) lo convierte en un banco de pruebas util para medir el compromiso entre CER, WER y latencia en produccion.
- Analisis de robustez y sesgo por hablante: la model card senala que las ganancias por datos externos y sinteticos pueden variar segun hablante, condicion, configuracion de grabacion y severidad, lo que permite disenar estudios estratificados de rendimiento.
- Aumento y destilacion de datos: las transcripciones automaticas de este modelo sobre audio atipico pueden alimentar pipelines de datos para entrenar modelos mas pequenos o especificos de dominio, con la advertencia de revisar la calidad antes de reutilizarlas.

## Benchmarks y rendimiento

La metrica principal es el character error rate (CER). La comparacion de decodificacion se hizo sobre un subconjunto de 1.500 enunciados de hablantes de desarrollo de SAPC2 reservados, con las dos referencias disponibles y el normalizador oficial del reto, sin modelo de lenguaje externo.

| Decodificador | CER (%) | WER (%) | Tiempo relativo de decodificacion |
|---|---:|---:|---|
| Greedy | 5,06 | 9,70 | 1,00x |
| TDT beam search, beam 2 | 4,99 | 9,40 | 1,45x |
| TDT beam search, beam 4 | 5,00 | 9,38 | 1,13x frente a beam 2 |

Resultados de procedencia de cada ingrediente sobre el conjunto completo de desarrollo de SAPC2 reservado (17.582 enunciados de 48 hablantes):

| Ingrediente | CER (%) | WER (%) |
|---|---:|---:|
| all-aug | 6,67 | 10,73 |
| unconstrained | 6,45 | 10,52 |
| syn | 6,72 | 10,87 |

La propia model card advierte que las puntuaciones de los ingredientes sobre el conjunto completo no son directamente comparables con la tabla de decodificacion de la soup, porque esta ultima usa un subconjunto distinto de 1.500 enunciados. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K y similares) en la informacion disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 2,5 GB si se cargan en FP32 (627 M de parametros x 4 bytes, coherente con el tamano de repo de 2,5 GB) y aproximadamente 1,25 GB en BF16/FP16. Son calculos aritmeticos, no mediciones publicadas.
- VRAM adicional para inferencia: depende de la longitud del audio y del tamano de lote; no disponible como cifra medida.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM deberia bastar para inferencia en FP32 con lotes pequenos. Caben modelos consumer como RTX 3060, RTX 4060, RTX 4070, RTX 4080 y RTX 4090; tambien A100, H100, L40S y similares para procesamiento por lotes a gran escala.
- Ejecucion en CPU: viable en terminos de memoria por el reducido tamano del modelo, si bien no se publican cifras de latencia.
- Opciones de despliegue: la via documentada es Hugging Face Transformers (`AutoProcessor` + `ParakeetForTDT`, `transformers>=5.9`), con soporte de CUDA o CPU. El repositorio esta marcado como compatible con endpoints. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI en la informacion disponible, y no se publican pesos GGUF.
- Latencia y throughput: no disponible. Los unicos datos temporales son relativos: beam 2 supone 1,45x el tiempo de greedy, y beam 4 es 1,13x el tiempo de beam 2.
- Requisito de entrada: audio mono remuestreado a 16 kHz antes de pasarlo al processor.

## Comparativa con modelos similares

La informacion disponible permite comparar con los tres ingredientes de la mezcla y con el modelo base, todos de la misma familia y con la misma arquitectura.

| Modelo | Parametros | Contexto / entrada | CER en dev SAPC2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-syn-soup (este) | 627 M | Audio mono 16 kHz | 4,99 (beam 2, subconjunto de 1.500) | other | Hugging Face, safetensors |
| parakeet-tdt-0.6b-all-aug | no disponible (misma base, 0,6 B) | Audio mono 16 kHz | 6,67 (conjunto completo de 17.582) | no disponible | Hugging Face |
| parakeet-tdt-0.6b-unconstrained | no disponible (misma base, 0,6 B) | Audio mono 16 kHz | 6,45 (conjunto completo de 17.582) | no disponible | Hugging Face |
| parakeet-tdt-0.6b-syn | no disponible (misma base, 0,6 B) | Audio mono 16 kHz | 6,72 (conjunto completo de 17.582) | no disponible | Hugging Face |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B (modelo base) | Audio mono 16 kHz | no disponible en la informacion proporcionada | no disponible | Hugging Face |

Las cifras de CER no son directamente comparables entre filas: las de la soup corresponden a un subconjunto de 1.500 enunciados y las de los ingredientes al conjunto completo de desarrollo. No se dispone de datos de otros modelos ASR de la competencia (por ejemplo, familia Whisper) en la informacion proporcionada, por lo que no se incluye una comparacion cruzada.

## Limitaciones y advertencias

- Las mediciones con busqueda por haces usan un subconjunto de 1.500 enunciados y pueden no generalizar al conjunto completo de evaluacion ni a otros corpus.
- Las ganancias atribuidas a datos externos y sinteticos pueden variar segun hablante, condicion clinica, configuracion de grabacion y severidad de la disartria o ataxia.
- El habla sintetica puede introducir artefactos o infrarrepresentar variacion clinicamente relevante; el condicionamiento de voces sobre grabaciones de SAP no equivale a una simulacion clinica validada.
- Los corpus fuente y los datos de evaluacion no representan todos los diagnosticos, acentos, idiomas, grupos de edad ni estilos de comunicacion. El modelo solo soporta ingles.
- El ajuste fino para transcripcion de ingles normalizado puede degradar el rendimiento multilingue; la model card original se corta en ese punto, por lo que el alcance exacto de esa perdida no esta disponible.
- La salida se limita a minusculas, sin puntuacion y con numeros escritos como palabras; las aplicaciones que necesiten texto formateado deberan anadir un postprocesado.
- La decodificacion con busqueda por haces no esta incluida en los pesos: requiere el script externo del repositorio `ataxia`. Usar `num_beams` en `ParakeetForTDT.generate()` no reproduce los resultados reportados.
- La licencia es `other` y no se reproduce su texto; parte de los corpus de entrenamiento tienen condiciones de acceso especificas, por lo que el uso comercial debe verificarse con los propietarios de dichos corpus antes de desplegar el modelo.
- Al tratarse de un modelo de pista "unconstrained" por el uso de corpus externos de habla disartrica, no es valido para comparaciones contra sistemas entrenados solo con datos del reto.
- No es un sistema de diagnostico, ni una ayuda a la decision clinica, ni un sustituto de una evaluacion profesional. El uso previsto declarado es investigacion y evaluacion.
- Riesgo de alucinacion y de sustituciones en transcripcion, inherente a los modelos ASR, especialmente con audio de baja inteligibilidad; se recomienda revision humana en contextos sensibles.
- El repositorio tiene un numero muy bajo de descargas y likes, y no consta validacion independiente por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dys-asr/parakeet-tdt-0.6b-syn-soup
- Ingrediente all-aug: https://huggingface.co/dys-asr/parakeet-tdt-0.6b-all-aug
- Ingrediente unconstrained: https://huggingface.co/dys-asr/parakeet-tdt-0.6b-unconstrained
- Ingrediente syn: https://huggingface.co/dys-asr/parakeet-tdt-0.6b-syn
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio con la implementacion de TDT beam search: https://github.com/extraordinarylab/ataxia
- Los resultados de la busqueda web proporcionada no contienen enlaces relevantes para este modelo.
