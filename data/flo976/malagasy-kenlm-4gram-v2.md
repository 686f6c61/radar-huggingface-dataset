# Flo976/malagasy-kenlm-4gram-v2

## Resumen

`Flo976/malagasy-kenlm-4gram-v2` es un modelo de lenguaje estadístico de tipo n-grama de palabras (orden 4) para malgache, construido con KenLM y pensado exclusivamente para el reescoring de hipótesis en decodificación por beam search de sistemas de reconocimiento de voz CTC. No es una red neuronal: es una tabla de probabilidades de 4-gramas cuantizada a 8 bits en formato trie, que se integra con `pyctcdecode` junto al modelo acústico `Flo976/w2v-bert-malagasy`.

Lo desarrolla el usuario Flo976 y sustituye a `Flo976/malagasy-kenlm-4gram` (17 M de palabras). El cambio principal es el volumen de texto de entrenamiento: 134 M de palabras frente a 17 M, lo que reduce aproximadamente uno de cada veinticinco errores que dejaba pasar la versión anterior. Según la model card, la cadena completa baja de 13,20 % a 12,68 % de WER en enunciados cortos (2–8 s) y de 10,41 % a 10,13 % en clips completos, sobre hablantes no vistos en entrenamiento.

Su relevancia es práctica: el malgache es un idioma con pocos recursos y este tipo de LM de reescorido es una de las formas más baratas de mejorar un ASR existente sin reentrenar el modelo acústico. El coste es mínimo (421 MB en disco, inferencia en CPU, unos 3,6 ms por enunciado de 5 s en un núcleo) y la ganancia es medible y estadísticamente significativa según los tests publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | N-grama de palabras de orden 4 (KenLM, estructura trie, cuantización de 8 bits); no es un transformer ni un modelo neuronal |
| Parametros totales | no disponible (no aplica: modelo de recuento de n-gramas; el vocabulario de unigramas contiene 1.083.929 formas vistas al menos dos veces) |
| Longitud de contexto | 3 palabras previas (orden 4 del n-grama); no existe ventana de contexto en tokens |
| Tipos de cuantizacion | Binario KenLM con cuantización de 8 bits (`build_binary -q 8 -b 7 -a 256 trie`); no hay GGUF, AWQ, GPTQ ni safetensors |
| Idiomas soportados | Malgache (`mg`) únicamente |
| Licencia | `other` / `mixed-sources` (licencia mixta por fuentes; ver `LICENSE_NOTES.md`) |
| Formato de pesos | `mg_ext_4gram.bin` (binario KenLM trie 8-bit), `unigrams.txt` (1.083.929 formas) y `params.json` (ajustes de decodificación y receta de construcción); repo de 0,4 GB |

## Arquitectura y entrenamiento

El modelo es un n-grama de palabras de orden 4 estimado con `lmplz -o 4 --prune 0 0 1 1 --discount_fallback` y compilado a binario con `build_binary -q 8 -b 7 -a 256 trie`. La poda asimétrica (sin poda en unigramas y bigramas, poda 1 en trigramas y 4-gramas) conserva intactos los n-gramas cortos, que son los que más pesan en la decodificación, y recorta los largos para mantener el binario en 421 MB. El resultado se carga desde `pyctcdecode` como LM externo que combina la probabilidad del modelo acústico con la del LM mediante los pesos α (peso del LM) y β (penalización por longitud).

El texto de entrenamiento suma 134 M de palabras y procede de cinco fuentes: HPLT v2 cleaned en malgache (89,5 M; dataset CC0, texto web), CC-100 malgache (19,3 M; términos de uso de Common Crawl), Wikipedia en malgache (16,4 M; CC-BY-SA-3.0), `Lo-Renz-O/malagasy-sentence` (8,2 M; MIT) y las transcripciones del split de entrenamiento de `badrex/malagasy-speech-full` (0,9 M; licencia no declarada). Todas las fuentes se normalizaron exactamente igual que la salida del ASR y se deduplicaron. Como medida anti-fuga, se eliminó de todas las fuentes toda línea que compartiese una secuencia de 8 palabras con cualquier transcripción de validación o de test, incluidas las transcripciones de entrenamiento. Se descartó deliberadamente una traducción de la Biblia por motivos de licencia.

No hay entrenamiento neuronal, RLHF ni DPO: el "entrenamiento" es el recuento de n-gramas con suavizado por descuento. Los hiperparámetros de decodificación se ajustaron solo sobre validación (α = 0,6 y β = 0,5 para enunciados de 10 s o menos; α = 0,5 y β = 0,5 para clips más largos; beam = 100) y el test se midió una única vez.

## Capacidades

- Asignación de probabilidad a secuencias de palabras en malgache (modelo de lenguaje puro, sin generación autoregresiva).
- Reescorido de log-probabilidades CTC en beam search mediante `pyctcdecode`, integrado con el vocabulario del tokenizer de `Flo976/w2v-bert-malagasy`.
- Mejora del WER de la cadena ASR frente a decodificación greedy y frente al 4-grama anterior de 17 M de palabras.
- Ajuste de decodificación dependiente de la duración del audio (dos perfiles de α/β según si el enunciado supera los 10 s).
- Normalización implícita del texto de entrenamiento (minúsculas, sin puntuación en la evaluación) coherente con la salida del ASR.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni otras lenguas: es un componente auxiliar de un pipeline de ASR.

## Casos de uso

- Transcripción automática de malgache en producción: insertar el LM como reescoridor en un pipeline CTC existente (por ejemplo, un servicio de subtitulado o de actas) para reducir el WER sin tocar el modelo acústico ni la infraestructura de GPU.
- Subtitulado de audio de duración variable: elegir el perfil de α/β corto o largo según la duración del segmento, lo que permite usar un mismo binario para clips de 2 s y para emisiones completas.
- Investigación en lenguas de bajos recursos: servir de línea base reproducible para comparar estrategias de reescorido (greedy frente a LM, tamaño del corpus, poda) sobre un split de test público y con hablantes no vistos.
- Post-procesado de transcripciones ya generadas: reescorar los n-best de un sistema existente para corregir palabras funcionales y aglutinaciones frecuentes del malgache, incluida la reconsolidación de apóstrofos (`amin' ny` → `amin'ny`).
- Despliegue en entornos sin GPU: al ejecutarse en CPU con ~3,6 ms por enunciado de 5 s, encaja en servidores modestos, dispositivos边缘 o contenedores sin acelerador.
- Archivística y catalogación de audio en malgache: transcripción por lotes de grabaciones largas donde el coste por hora de audio debe mantenerse bajo y el modelo acústico ya está entrenado.
- Evaluación comparativa de LMs para un idioma concreto: usar los deltas publicados (bootstrap pareado) como referencia metodológica en estudios de ASR de bajos recursos.

## Benchmarks y rendimiento

Resultados de la model card sobre el split de test de `badrex/malagasy-speech-full`, con hablantes nunca vistos en entrenamiento, las mismas log-probabilidades acústicas en todas las filas, beam 100, re-pegado de apóstrofos tras la decodificación y WER tras la normalización habitual (minúsculas, sin puntuación).

| Modelo de lenguaje | Enunciados cortos 2–8 s (11.625) | Clips completos (3.101) |
|---|---|---|
| Ninguno (greedy) | 14,33 % | 12,01 % |
| 4-grama anterior, 17 M palabras | 13,20 % | 10,41 % |
| 4-grama anterior, reajustado en validación | 12,92 % | 10,46 % |
| **Este modelo (v2, 134 M palabras)** | **12,68 %** | **10,13 %** |

Bootstrap pareado con 2.000 remuestreos, este modelo frente al anterior con sus ajustes publicados: −0,52 puntos [−0,65; −0,40] en enunciados cortos y −0,29 [−0,39; −0,18] en clips completos. Frente al anterior reajustado, lo que aísla el efecto del texto adicional: −0,24 [−0,35; −0,12] y −0,33 [−0,44; −0,23]. Las diferencias se mantienen significativas con un bootstrap más estricto que remuestrea hablantes completos.

No se han publicado resultados de benchmarks en la informacion disponible para tareas tipo MMLU, HumanEval o GSM8K, y no aplican a un modelo de lenguaje n-grama.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; la inferencia es exclusivamente en CPU.
- RAM: el binario ocupa 421 MB en disco y consume aproximadamente 0,55 GB más de RAM que el 4-grama anterior de 17 M de palabras (el total absoluto no está especificado en la información disponible).
- GPU recomendadas: ninguna. No se necesita A100, H100 ni RTX 4090; el cuello de botella es el modelo acústico, no el LM.
- Cabe en cualquier equipo consumer: un portátil convencional o una instancia pequeña de CPU es suficiente.
- Opciones de despliegue: `pyctcdecode` + `kenlm` (la única vía documentada). No aplica soporte de vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo neuronal.
- Latencia: unos 3,6 ms por enunciado de 5 s en un núcleo de CPU, sin cambios respecto al modelo anterior; la carga de cada decoder tarda unos 12 s, por lo que conviene construirlo una vez y reutilizarlo.
- Throughput agregado: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Palabras de entrenamiento | Enunciados cortos (WER) | Clips completos (WER) | Formato | Licencia |
|---|---|---|---|---|---|
| `Flo976/malagasy-kenlm-4gram-v2` (este) | 134 M | 12,68 % | 10,13 % | KenLM binario trie 8-bit | mixed-sources |
| `Flo976/malagasy-kenlm-4gram` | 17 M | 13,20 % (12,92 % reajustado) | 10,41 % (10,46 % reajustado) | KenLM | no disponible en la información |
| Sin LM (greedy) | no aplica | 14,33 % | 12,01 % | no aplica | no aplica |

No se han identificado en la información disponible otros LM de malgache comparables (por ejemplo, 5-gramas o LM neuronales) con resultados publicados sobre el mismo split.

## Limitaciones y advertencias

- Licencia mixta (`other` / `mixed-sources`): las fuentes incluyen CC0, CC-BY-SA-3.0, MIT, términos de uso de Common Crawl y transcripciones con licencia no declarada. Antes de cualquier uso comercial hay que revisar `LICENSE_NOTES.md`, porque la licencia final no es una licencia abierta homogénea.
- La model card advierte de que el texto web (HPLT y CC-100) aporta ruido al corpus; ese ruido puede trasladarse a las correcciones del decodificador.
- Contexto efectivo de solo tres palabras: no modela dependencias de largo alcance ni coherencia discursiva, y no corrige errores que dependan del contexto amplio.
- Dependencia estricta del tokenizer: las etiquetas deben construirse desde el vocabulario de `Flo976/w2v-bert-malagasy`; con un modelo binario, `unigrams.txt` es obligatorio para `pyctcdecode`.
- Sensibilidad a los hiperparámetros: α y β están ajustados por rango de duración y se calibraron solo en validación; un valor inadecuado puede degradar el WER por debajo del greedy.
- Resultados medidos únicamente sobre `badrex/malagasy-speech-full`; la generalización a otros dominios, acentos o registros no está documentada.
- No es un modelo generativo: no puede usarse como LLM, ni para traducción, ni para tareas de razonamiento, y no acepta prompts.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente por parte de la comunidad.
- Riesgo de falsos positivos del LM sobre el audio ruidoso, que puede "corregir" hacia palabras frecuentes del corpus aunque el audio diga otra cosa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Flo976/malagasy-kenlm-4gram-v2
- Notas de licencia: https://huggingface.co/Flo976/malagasy-kenlm-4gram-v2/blob/main/LICENSE_NOTES.md
- Demo en el navegador: https://huggingface.co/spaces/Flo976/malagasy-asr-demo
- Modelo acústico asociado: https://huggingface.co/Flo976/w2v-bert-malagasy
- Versión anterior del LM (17 M palabras): https://huggingface.co/Flo976/malagasy-kenlm-4gram
- Dataset de evaluación y entrenamiento: https://huggingface.co/datasets/badrex/malagasy-speech-full
- HPLT v2 cleaned: https://huggingface.co/datasets/HPLT/HPLT2.0_cleaned
- CC-100: https://data.statmt.org/cc-100/
- `Lo-Renz-O/malagasy-sentence`: https://huggingface.co/datasets/Lo-Renz-O/malagasy-sentence
- Wikipedia en malgache: https://mg.wikipedia.org
