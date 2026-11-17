# Map-Action/soloba-bm-map-action-v3

## Resumen

Soloba Bambara ASR (Map Action v3) es un modelo de reconocimiento automatico del habla (ASR) especializado en bambara, una lengua mande hablada principalmente en Mali. Lo desarrolla Map Action, una organizacion centrada en el reporte ciudadano de problemas medioambientales y de saneamiento, y consiste en un ajuste fino del modelo base `RobotsMali/soloba-ctc-0.6b-v3`, un FastConformer con CTC de 0,6 mil millones de parametros publicado por RobotsMali bajo licencia CC-BY-4.0.

El objetivo concreto es permitir que la ciudadania reporte por voz incidencias de entorno y saneamiento (vertidos, alcantarillado, agua, residuos) en bambara. El ajuste incorpora vocabulario y expresiones propias del dominio, con un corpus especifico de grabaciones reales corregidas manualmente y clips filtrados de corpus abiertos de RobotsMali. Frente al modelo base, reduce la tasa de error de palabra (WER) de 41,1 % a 33,8 % en el conjunto de prueba de Map Action y de 33,5 % a 27,9 % en bambara general.

El modelo es relevante por dos motivos: demuestra que un ajuste fino pequeno y barato (32 minutos en una A40) puede aportar mejoras sustanciales en una lengua de bajos recursos, y ofrece un punto de partida reproducible para despliegues de ASR en contextos de participacion ciudadana en Africa Occidental. Su principal limitacion es que el corpus de entrenamiento especifico proviene de un unico hablante masculino, por lo que la mejora en el dominio esta parcialmente sesgada a esa voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con cabeza CTC (hereda del modelo base) |
| Parametros totales | 0,6 mil millones (600 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bambara (bm) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.nemo` (NeMo), repositorio de 2,4 GB |
| Modelo base | `RobotsMali/soloba-ctc-0.6b-v3` |
| Frecuencia de muestreo de entrada | 16 kHz mono |
| Libreria | NeMo (`nemo_toolkit[asr]==2.5.0`) |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Soloba CTC de RobotsMali, construido sobre FastConformer con decodificacion CTC. No se modifica la arquitectura base; el ajuste se aplica sobre los pesos del modelo preentrenado para adaptar el vocabulario y las distribuciones acusticas al dominio de reportes medioambientales en bambara. La entrada es audio mono a 16 kHz y la salida es texto plano transcrito.

El entrenamiento consistio en 2.600 pasos con batch de 16, optimizador AdamW, tasa de aprendizaje 5e-5 con decaimiento coseno, ejecutado en una unica GPU A40 durante 32 minutos. El corpus combina tres fuentes: 102 grabaciones de Map Action con transcripciones corregidas por humanos y peso x8, 4.154 clips de dominio filtrados de corpus abiertos de RobotsMali (dataset `Map-Action/bambara-asr-environnement`) y 1.300 clips generales de `RobotsMali/afvoices` para mitigar el olvido catastrofico. Las frases de test reservadas no se usaron en entrenamiento. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Transcripcion de voz a texto en bambara para audio mono a 16 kHz.
- Reconocimiento de vocabulario especifico del dominio de medio ambiente y saneamiento (agua, residuos, alcantarillado, vertidos).
- Manejo parcial de code-switching bambara-frances, aunque con sesgo hacia transcripcion fonetica de los terminos franceses.
- Salida de texto plano con puntuacion y mayusculas normalizables para evaluacion.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio mas alla de la transcripcion.
- Capacidad multilingue limitada al bambara (con prestamos del frances).

## Casos de uso

- Reporte ciudadano de incidencias medioambientales por voz: un ciudadano graba una descripcion en bambara de un vertido o una fuga y el modelo la transcribe para su clasificacion y enrutado posterior. Es adecuado porque el ajuste se ha realizado precisamente sobre ese tipo de grabaciones y vocabulario.
- Canal de atencion telefonica o mensajeria de voz para servicios municipales de saneamiento: integrado en un pipeline que recibe audios de 16 kHz y genera transcripciones para operadores humanos, reduciendo la dependencia de personal que domine la transcripcion escrita del bambara.
- Anotacion asistida de corpus de dominio: el modelo puede pretranscribir grabaciones de campo que luego se corrigen manualmente, acelerando la construccion de datasets etiquetados en `Map-Action/bambara-asr-environnement`.
- Monitorizacion de calidad del servicio: transcripcion de encuestas de voz post-intervencion para analizar la percepcion ciudadana sobre obras de saneamiento, con la salvedad de que la precision depende de la variedad de voces.
- Investigacion en ASR de bajos recursos: sirve como referencia reproducible de ajuste fino barato (32 minutos en A40) sobre un modelo abierto de 600 M, util para experimentos de adaptacion de dominio en lenguas mande.
- Prototipos de accesibilidad linguistica: transcripcion de avisos o mensajes de voz en bambara para su publicacion en boletines o paneles informativos, siempre etiquetando el texto como generado automaticamente.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, menor es mejor), texto en minusculas y sin puntuacion, sobre los mismos clips antes y despues del ajuste:

| Conjunto de prueba | Clips | Modelo base | Este modelo |
|---|---|---|---|
| Reportes de voz de Map Action (frases reservadas) | 16 | 41,1 % | 33,8 % |
| Bambara general (`RobotsMali/afvoices`, reservado) | 200 | 33,5 % | 27,9 % |
| Clips de dominio del test de `RobotsMali/bam-asr-early` | 48 | 57,8 % | 54,7 % |

Tasa de error de caracter (CER) en los reportes de Map Action: 16,8 % en el modelo base frente a 14,6 % en este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 600 M de parametros en precision FP32 el peso ronda los 2,4 GB, por lo que en FP16 o BF16 cabria en GPUs consumer con 8 GB o mas.
- GPU recomendadas: el autor cita una A40 para el entrenamiento; para inferencia son suficientes GPUs de gama media como RTX 3060/4060 con 8-12 GB, o superiores (A100, H100, L40S) para mayor throughput.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con al menos 8 GB de VRAM en FP16.
- Opciones de despliegue: NeMo (`nemo_toolkit[asr]==2.5.0`) mediante `ASRModel.restore_from`; no se documentan exportaciones a ONNX, GGUF ni integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER bambara general | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Map-Action/soloba-bm-map-action-v3 | 600 M | no disponible | 27,9 % | CC-BY-4.0 | Hugging Face |
| RobotsMali/soloba-ctc-0.6b-v3 (base) | 600 M | no disponible | 33,5 % | CC-BY-4.0 | Hugging Face |
| Otros ASR multilingues (p. ej. Whisper) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos ASR especificos de bambara en la informacion proporcionada, por lo que la comparativa se limita al modelo base y a la referencia generica de ASR multilingue sin cifras verificables.

## Limitaciones y advertencias

- Un solo hablante: las grabaciones de Map Action usadas en entrenamiento y en el primer test provienen de un unico hombre, por lo que parte de la mejora refleja adaptacion a su voz. Se esperan resultados peores con otras voces.
- Conjunto de test muy pequeno: 16 frases en el test de Map Action, de modo que una o dos palabras mueven la puntuacion un punto porcentual.
- Code-switching: el bambara urbano mezcla frances; las referencias escriben los terminos franceses con su ortografia ("carburant", "forage") y el modelo tiende a escribirlos foneticamente, lo que infla el WER aunque la palabra se haya entendido.
- El objetivo de 30 % de WER se cumple en bambara general, pero aun no en los reportes de voz.
- Riesgo de alucinacion y errores de transcripcion en audio con ruido, acentos no vistos o vocabulario fuera de dominio.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribucion; es obligatorio citar a Map Action y a RobotsMali como autores del modelo base.
- Requisito de transparencia: las transcripciones deben mostrarse como generadas por maquina y acompanarse del audio original.
- Dependencia de la libreria NeMo 2.5.0 y del formato `.nemo`, sin soporte documentado para otros runtimes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Map-Action/soloba-bm-map-action-v3
- Modelo base: https://huggingface.co/RobotsMali/soloba-ctc-0.6b-v3
- Dataset de dominio: `Map-Action/bambara-asr-environnement` (referenciado en la model card)
- Corpus general de referencia: `RobotsMali/afvoices`
- Corpus de dominio de referencia: `RobotsMali/bam-asr-early`
- Sitio de Map Action: https://www.map-action.com
- Repositorio de NeMo: no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
