# ozonetg/parakeet-110m-caller-asr-nopunct

## Resumen

parakeet-110m-caller-asr-nopunct es un ajuste fino del modelo nvidia/parakeet-tdt_ctc-110m orientado al reconocimiento de voz del lado del cliente (caller) en llamadas telefonicas estadounidenses de 8 kHz. Lo publica el usuario ozonetg y su particularidad es que todas las transcripciones de entrenamiento se pasaron a minusculas y se les elimino la puntuacion (conservando apostrofos), de modo que la salida es texto plano en minusculas, adecuado para coincidencia de palabras clave y procesamiento posterior que no espera puntuacion. La arquitectura es un encoder FastConformer de 114,6 M de parametros con decodificador TDT (token-and-duration transducer) y una cabeza CTC auxiliar, heredada integramente del modelo base.

El modelo se entrena con aproximadamente 345,5 horas (504.617 segmentos) de audio real de llamadas salientes de ventas en Estados Unidos, unicamente con el canal del cliente, y con transcripciones automaticas generadas por Qwen3-ASR-1.7B en lugar de transcripciones humanas. Se evalua sobre conjuntos publicos de llamadas telefonicas y sobre llamadas retenidas del propio dominio, con resultados que mejoran de forma notable al sistema previo y al modelo base sin ajustar.

Su relevancia practica esta en el nicho: es un modelo muy pequeno (114,6 M de parametros, fichero .nemo de unos 0,5 GB) que consigue un WER de 3,33 % en llamadas en dominio retenidas frente al 9,19 % del base sin ajustar, y 11,59 % agrupado en cinco conjuntos telefonicos publicos frente al 14,58 % del base. Se distribuye bajo licencia CC BY 4.0 y funciona con NeMo 2.5.3 y NeMo 3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer (114,6 M de parametros) con decodificador TDT (token-and-duration transducer) y cabeza CTC auxiliar |
| Parametros totales | 114,6 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; modelo de ASR sobre audio. Entrada: audio mono a 16 kHz en coma flotante, alimentado con audio telefonico de 8 kHz remuestreado a 16 kHz |
| Tipos de cuantizacion | no disponible (pesos distribuidos en float32 dentro del fichero .nemo) |
| Idiomas soportados | ingles (en), variante estadounidense de llamada telefonica |
| Licencia | CC BY 4.0 |
| Formato de pesos | .nemo (float32), fichero `parakeet-110m-caller-asr-nopunct.nemo`; tamano del repositorio 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura replica la del modelo base nvidia/parakeet-tdt_ctc-110m: un encoder FastConformer de 114,6 M de parametros acompanado de un decodificador TDT (token-and-duration transducer) y una cabeza CTC auxiliar. La decodificacion empleada en todas las cifras publicadas es TDT greedy. El modelo se ejecuta con NeMo 2.5.3 y tambien restaura y transcribe en NeMo 3.0. La receta de datos es la misma que la de la variante parakeet-110m-caller-asr-basic, con la unica diferencia de que en esta version todos los transcripts de entrenamiento se pasaron a minusculas y se despojaron de puntuacion, conservando apostrofos.

Los datos de entrenamiento son el canal del cliente (customer) de llamadas salientes de ventas estadounidenses, en mono a 8 kHz, procedentes de cinco fuentes internas grabadas entre 2025 y 2026. Los segmentos van de 0,3 a 20 segundos y el split de entrenamiento contiene 504.617 segmentos (345,5 horas). Un 5 % son segmentos sin habla (ruido de linea, silencio, espera, respiracion) con objetivo vacio, lo que ensena al modelo a permanecer en silencio; cerca de un 1 % son saludos de buzon de voz o mensajes de IVR captados en la linea del cliente. Las etiquetas son transcripciones automaticas de Qwen3-ASR-1.7B, sin intervencion humana: cada transcript se contrasto con sistemas ASR independientes y se asigno nivel 1 (peso de perdida 1,0) a los segmentos con acuerdo total, nivel 2 (peso 0,7) a los de acuerdo parcial, y se descarto el resto. Ademas, un 10 % de cada lote proviene de Switchboard (ingles telefonico conversacional publico con transcripciones humanas) como replay para preservar la capacidad conversacional general. La ruta de entrada remuestrea el audio de 8 kHz a 16 kHz con el resampleo por defecto de librosa.

## Capacidades

- Reconocimiento de voz automatico (ASR) en ingles estadounidense sobre audio telefonico de banda estrecha (8 kHz), con enfasis en el canal del cliente.
- Salida en texto plano: minusculas y sin puntuacion, conservando apostrofos.
- Deteccion implicita de no-habla: al haberse entrenado con segmentos sin voz de objetivo vacio (ruido de linea, silencio, espera, respiracion), el modelo tiende a no emitir texto en esos tramos.
- Manejo de audio de buzon de voz y mensajes de IVR, presentes en aproximadamente un 1 % del entrenamiento.
- Generalizacion razonable a ingles conversacional telefonico general gracias al replay del 10 % de Switchboard.
- Decodificacion TDT greedy y cabeza CTC auxiliar.
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio multimodal: es exclusivamente un modelo acustico-a-texto.
- No soporta otros idiomas aparte del ingles.

## Casos de uso

- Transcripcion de llamadas de centros de contacto (lado cliente): el modelo esta ajustado especificamente sobre el canal del cliente en llamadas salientes a 8 kHz, por lo que es la opcion directa para generar transcripts de la voz del usuario sin tener que separar canales ni limpiar la salida.
- Alimentacion de sistemas de analisis de palabras clave: al producir minusculas sin puntuacion, la salida encaja sin preprocesado en motores de busqueda, coincidencia de terminos y clasificadores de intencion basados en bolsas de palabras.
- Control de calidad y cumplimiento en ventas telefonicas: transcripcion masiva de llamadas grabadas para detectar frases obligatorias, avisos legales o vocabulario prohibido mediante regex sobre texto ya normalizado.
- Enrutamiento automatico y deteccion de intencion en tiempo real: con 114,6 M de parametros y decodificacion greedy, el coste por segundo de audio es bajo, lo que permite integrarlo en pipelines de atencion al cliente que clasifican la llamada mientras transcurre.
- Analitica de motivos de llamada: agregacion de transcripts de miles de llamadas para construir taxonomias de incidencias y medir temas recurrentes.
- Generacion de conjuntos de datos etiquetados: uso del modelo como anotador automatico de audio telefonico no etiquetado, con la advertencia de que sus etiquetas heredan los sesgos de su propio profesor (Qwen3-ASR-1.7B).
- Investigacion en ASR de banda estrecha: el modelo sirve como referencia de ajuste fino de bajo coste (345,5 horas, 504.617 segmentos) sobre una base de 114,6 M de parametros.
- Subtitulado de archivos de audio de call center para revision humana posterior, asumiendo que el revisor debera restituir mayusculas y puntuacion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (WER en %, decodificacion TDT greedy, no verificados por terceros).

| Dataset | WER (%) |
|---|---|
| LibriSpeech test-clean (8 kHz) | 3,27 |
| LibriSpeech test-other (8 kHz) | 7,31 |
| LibriSpeech test-clean (16 kHz) | 2,85 |
| LibriSpeech test-other (16 kHz) | 5,94 |
| CallHome English (test) | 12,39 |
| CallFriend English (dev) | 17,54 |
| HarperValley Bank (caller channel) | 5,16 |
| Let's Go (referencias reescritas) | 23,70 |
| AppTek call-center dialogues, clientes de EE. UU. (test) | 8,84 |
| Switchboard (subconjunto de 3.000 enunciados) | 7,62 |

Agregados y comparativas aportadas por el autor:

| Escenario | Este modelo | Sistema previo (110m base + adaptador de dominio) | Base sin ajustar (nvidia/parakeet-tdt_ctc-110m) |
|---|---|---|---|
| Cinco conjuntos telefonicos publicos (agrupados) | 11,59 % | 14,00 % | 14,58 % |
| Llamadas en dominio retenidas | 3,33 % | 8,68 % | 9,19 % |
| LibriSpeech test-other a 8 kHz | 7,31 % | no disponible | 6,25 % |

Observacion del autor: en LibriSpeech test-other a 8 kHz el ajuste empeora ligeramente respecto al base (+1,06 puntos porcentuales), mientras que la mejora en dominio telefonico real es sustancial.

## Requisitos de hardware

- Los pesos suman 114,6 M de parametros en float32, lo que equivale a aproximadamente 0,46 GB; el repositorio completo ocupa 0,5 GB.
- VRAM estimada para inferencia: menos de 2 GB incluyendo activaciones y buffers de decodificacion (estimacion a partir del tamano de pesos en float32; el autor no publica cifras de VRAM).
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs de gama baja o en CPU para procesamiento por lotes fuera de linea.
- Entorno de ejecucion: NeMo 2.5.3 (el autor indica que tambien restaura y transcribe en NeMo 3.0). Los ficheros .nemo son especificos de NeMo.
- Otras opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible. El formato .nemo no es GGUF ni safetensors, por lo que no se puede afirmar compatibilidad con esos runners.
- Latencia y throughput estimados: no disponible (no se publican mediciones).
- Formato de entrada obligatorio: audio mono a 16 kHz en coma flotante; el audio telefonico de 8 kHz debe remuestrearse a 16 kHz antes de la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER en dominio telefonico | WER LibriSpeech test-other (8 kHz) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ozonetg/parakeet-110m-caller-asr-nopunct | 114,6 M | en | 3,33 % (retenido en dominio) / 11,59 % (5 conjuntos publicos) | 7,31 % | CC BY 4.0 | HuggingFace, .nemo (0,5 GB) |
| nvidia/parakeet-tdt_ctc-110m (base) | 110 M (segun nombre) | en | 9,19 % (retenido en dominio) / 14,58 % (5 conjuntos publicos) | 6,25 % | CC BY 4.0 | HuggingFace |
| ozonetg/parakeet-110m-caller-asr-basic | 114,6 M | en | no disponible (el autor indica precision equivalente a esta variante) | no disponible | CC BY 4.0 | HuggingFace |

Notas: las cifras del modelo base y del sistema previo proceden de la propia model card de este modelo, no de mediciones independientes. No se dispone en la informacion proporcionada de comparaciones con otros sistemas de ASR telefonico (por ejemplo variantes de Whisper o Conformer entrenadas sobre Switchboard), por lo que esa comparativa queda como no disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente con transcripciones automaticas generadas por Qwen3-ASR-1.7B. Ningun transcript de entrenamiento fue revisado por humanos, por lo que los errores sistematicos del profesor pueden haberse incorporado al alumno. El autor mitigo parcialmente el riesgo mediante validacion cruzada con otros sistemas ASR y pesos de perdida por niveles (1,0 y 0,7), descartando los segmentos con acuerdo insuficiente.
- Dominio muy restringido: llamadas salientes de ventas en Estados Unidos grabadas entre 2025 y 2026, con solo el canal del cliente. El rendimiento fuera de ese tipo de llamada puede degradarse.
- Sesgo de canal: el modelo espera el canal del cliente (o el canal unico de una llamada), no el canal del agente. Aplicarlo al lado equivocado de la conversacion no es su caso de uso.
- Solo ingles estadounidense. No hay soporte multilingue ni variantes de otros paises.
- Salida en minusculas y sin puntuacion. Cualquier uso que requiera texto legible (subtitulos, informes, resumenes) necesita un paso posterior de puntuacion y capitalizacion.
- Ancho de banda limitado a telefonia de 8 kHz remuestreada a 16 kHz. La calidad no equivale a la de un modelo entrenado sobre audio de banda ancha.
- Riesgo de alucinacion y de falsos positivos en audio ruidoso o con habla solapada: los conjuntos mas dificiles muestran WER alto (CallFriend 17,54 %; Let's Go 23,70 %), lo que indica fragilidad ante conversacion espontanea con solapamientos.
- No emite marcas de tiempo verificadas ni estructura de hablantes; es un modelo de transcripcion plana.
- Benchmarks no verificados: la model card los marca con `verified: false`. No han sido reproducidos por terceros.
- Adopcion nula en el momento de la consulta (0 descargas, 0 me gusta), lo que implica ausencia de validacion de la comunidad.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribucion al autor y a la obra. Conviene revisar la licencia del modelo base nvidia/parakeet-tdt_ctc-110m antes de un despliegue en produccion.
- Dependencia de NeMo: el formato .nemo obliga a usar el ecosistema NVIDIA NeMo, lo que limita la portabilidad a otros runtimes de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ozonetg/parakeet-110m-caller-asr-nopunct
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Variante con puntuacion del mismo autor: https://huggingface.co/ozonetg/parakeet-110m-caller-asr-basic
- Paper, blog o repositorio adicionales: no disponible en la informacion proporcionada.
