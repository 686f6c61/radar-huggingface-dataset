# Scrya/parakeet-tdt-0.6b-singlish-v1

## Resumen

Parakeet-tdt-0.6b-singlish-v1 es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Scrya, resultado del ajuste fino del modelo NVIDIA Parakeet-TDT-0.6B-v3 sobre 1.386 horas de ingles de Singapur conversacional (Singlish) procedente de cinco partes del IMDA National Speech Corpus (NSC). El modelo esta disenado especificamente para transcripcion de reuniones y conversaciones en salas de reunion, con un enfoque en robustez frente a ruido de oficina, reverberacion y hablantes de fondo.

Arquitectura de transductor TDT (Token-and-Duration Transducer) con 627.057.286 parametros totales, empaquetado tanto en formato transformers (safetensors, fp32) como en checkpoint NeMo (.nemo). El modelo produce texto en ingles con puntuacion y mayusculas, y deletrea los numeros como palabras (por ejemplo, "twenty five" en lugar de "25").

Su relevancia radica en la especializacion: frente a modelos ASR genericos, este ajuste fino esta optimizado para el acento y las particularidades del ingles de Singapur en entornos de reunion, un nicho poco cubierto por los modelos multilingues generalistas. La version 2 del modelo, disponible en el mismo espacio de nombres, reduce errores en todos los conjuntos de prueba NSC, aunque los archivos de la version 1 permanecen sin cambios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor TDT (Token-and-Duration Transducer), parakeet_tdt |
| Parametros totales | 627.057.286 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (safetensors y .nemo); GGUF f16 y q8_0 en repositorios separados para NeMo-Speech.cpp |
| Idiomas soportados | en (ingles de Singapur, Singlish) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (transformers), .nemo (NeMo), GGUF (f16, q8_0) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Parakeet-TDT de NVIDIA, un transductor que combina un codificador acustico con un decodificador de prediccion y una red de union que emite tanto tokens como duraciones. El ajuste fino parte de nvidia/parakeet-tdt-0.6b-v3 y se realiza sobre 1.386 horas de audio conversacional en ingles de Singapur extraidas de cinco partes del IMDA National Speech Corpus (NSC). Aproximadamente la mitad del audio de entrenamiento (702 horas) corresponde a dos personas hablando en una misma sala: las partes 3 Same Room y 5 fueron grabadas con ambos hablantes en la misma habitacion, y la parte 4 se grabo con telefonos a unos 2 metros de los hablantes en una sala compartida. Se excluyo la parte 4 Different Room por tratarse de conversaciones por llamada online en lugar de presenciales.

El entrenamiento incorpora aumentacion de datos orientada a entornos de oficina: se mezclo ruido de oficina en la mitad de los clips (equipos de oficina, ventiladores, sonidos de cocina, teclado y hablantes de fondo singapurenses) y se anadio eco sintetico de sala al 30% de los clips. La configuracion de decodificacion difiere de la de NVIDIA en un valor: `decoding.greedy.max_symbols` se fija en 3 en lugar de 10, limitando el numero de tokens que el decodificador puede emitir por frame de audio, valor empleado tanto en entrenamiento como en evaluacion. El checkpoint NeMo se verifico con nemo_toolkit 2.7.3, comprobando que los 725 tensores coinciden con los pesos ajustados y que las transcripciones de 200 clips de prueba coinciden exactamente con las del modelo en transformers.

## Capacidades

- Reconocimiento automatico del habla en ingles de Singapur (Singlish) con salida puntuada y con mayusculas.
- Transcripcion de conversaciones multi-hablante en entornos de reunion y salas compartidas.
- Robustez frente a ruido de oficina, teclado, ventiladores, hablantes de fondo y eco de sala.
- Normalizacion de numeros: deletrea las cifras como palabras ("twenty five" en lugar de "25").
- Extraccion de caracteristicas acusticas (tag feature-extraction).
- Compatible con endpoints de Hugging Face (endpoints_compatible).
- No soporta tool calling, agentes, vision ni audio mas alla de la transcripcion ASR.
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.

## Casos de uso

- Transcripcion de reuniones de empresa en Singapur: el modelo esta entrenado con audio de dos hablantes en una misma sala y con ruido de oficina, por lo que genera actas puntuadas de reuniones presenciales con mayor fidelidad que un ASR generico en ese acento.
- Generacion de subtitulos para videoconferencias y grabaciones de sala: la salida con puntuacion y mayusculas reduce el postprocesado necesario antes de publicar subtitulos.
- Actas automaticas de reuniones con hablantes de fondo: la aumentacion con hablantes de fondo singapurenses permite separar la voz principal del murmullo ambiental en salas concurridas.
- Transcripcion de llamadas telefonicas en entorno de oficina: la parte 4 del NSC, grabada con telefonos a 2 metros en una sala compartida, entrena al modelo para audio telefonico con ruido de sala.
- Indexacion y busqueda de archivos de audio corporativos: la transcripcion puntuada facilita la busqueda por texto en grabaciones de reuniones y la construccion de bases de conocimiento.
- Analisis de calidad de conversaciones (contact center): permite transcribir interacciones con acento singapurense para su posterior analisis de sentimiento o cumplimiento.
- Investigacion sociolinguistica sobre el ingles de Singapur: el modelo sirve como herramienta de transcripcion para corpus de habla conversacional local.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados) sobre el IMDA National Speech Corpus:

| Conjunto de prueba | WER normalizado | WER formateado (mayusculas y puntuacion) |
|---|---:|---:|
| NSC Part 3 SDM (test) | 10,01 | 16,68 |
| NSC Part 3 Same Room (test) | 9,99 | 15,81 |
| NSC Part 4 (test) | 14,48 | 22,92 |
| NSC Part 5 (test) | 6,40 | 12,63 |
| NSC Part 6.3 (test) | 6,26 | 13,82 |

El autor indica que la version 2 del modelo comete menos errores en todos los conjuntos de prueba NSC, aunque no se proporcionan las cifras comparativas en la informacion disponible. No se han publicado resultados de benchmarks frente a otros modelos ASR en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en fp32 ocupa 2,4 GB (safetensors) o 2,51 GB (.nemo); en q8_0 el peso se reduce aproximadamente a la mitad, y en f16 a unos 1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 3-4 GB de VRAM para fp32; las cuantizaciones GGUF permiten ejecucion en GPUs de gama baja e incluso en CPU.
- Cabe en GPUs de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o mas; las versiones GGUF q8_0 pueden ejecutarse en equipos con menos VRAM o en CPU.
- Opciones de despliegue: transformers (clase `ParakeetForTDT`), NVIDIA NeMo (nemo_toolkit 2.7.3 verificado), NeMo-Speech.cpp con los GGUF f16 y q8_0, y endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Scrya/parakeet-tdt-0.6b-singlish-v1 | 627 M | no disponible | ASR Singlish para salas de reunion | cc-by-4.0 | Hugging Face (transformers, NeMo, GGUF) |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B (aproximado) | no disponible | ASR ingles general (modelo base) | no disponible en la informacion | Hugging Face |
| Scrya/parakeet-tdt-0.6b-singlish-v2 | 627 M (aproximado) | no disponible | ASR Singlish, version mejorada | cc-by-4.0 | Hugging Face |

La comparativa se limita al modelo base y a la version 2 del mismo autor, ya que no se dispone de datos de otros modelos ASR comparables en la informacion proporcionada. La version 2 reduce errores en todos los conjuntos NSC segun el autor, y los archivos de la version 1 permanecen sin cambios.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo esta entrenado exclusivamente con ingles de Singapur; puede presentar sesgos hacia ese acento y variedad linguistica, con degradacion en otros acentos del ingles.
- Riesgo de alucinacion: como todo modelo ASR, puede generar transcripciones plausibles pero incorrectas en audio con ruido extremo, solapamiento de hablantes o acentos no vistos.
- Limitaciones de idioma: solo soporta ingles (etiqueta `en`); no se declaran capacidades multilingues.
- Limitaciones de contexto: no se especifica la longitud maxima de audio procesable por el modelo; el limite practico dependera del codificador y de la implementacion.
- Estilo de salida fijo: deletrea los numeros como palabras y aplica puntuacion y mayusculas, lo que puede requerir postprocesado si se necesitan cifras.
- Restricciones de licencia: cc-by-4.0 permite uso comercial con atribucion; es necesario citar al autor y respetar los terminos de la licencia.
- Caveat de produccion: la configuracion `decoding.greedy.max_symbols=3` es especifica de este ajuste fino y difiere de la del modelo base; usar la configuracion de NVIDIA puede alterar los resultados.
- Resultados de benchmarks no verificados: las metricas del model-index estan declaradas por el autor y no han sido verificadas de forma independiente.
- La version 2 del modelo supera a esta version en todos los conjuntos NSC; para nuevos despliegues conviene evaluar la version 2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v1
- Version 2 del modelo: https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v2
- Modelo base NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- GGUF f16 para NeMo-Speech.cpp: https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v1-nemo-speech-cpp-f16
- GGUF q8_0 para NeMo-Speech.cpp: https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v1-nemo-speech-cpp-q8_0
- Repositorio NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp
