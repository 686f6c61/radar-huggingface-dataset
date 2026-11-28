# natbusa/fluffy-b4-handbook-v1

## Resumen

Fluffy B4 visitor handbook es un modelo de speech-to-speech de dominio muy restringido desarrollado por natbusa (repositorio busa-cto-ai). El sistema escucha una pregunta en ingles, genera una consulta de busqueda (`SEARCH`), selecciona un documento para leer (`READ`) y responde por voz con el contenido recuperado. No es un modelo de lenguaje generalista: es un pipeline de recuperacion aumentada por voz (voice RAG) empaquetado en siete checkpoints de PyTorch que suman 9,58 millones de parametros, ajustados por etapas sobre componentes congelados de terceros.

La relevancia del modelo es fundamentalmente practica y experimental: demuestra que es posible construir un agente de voz con recuperacion documental sobre hardware modesto y con un coste de entrenamiento minimo, usando el codec Mimi de Kyutai para la parte audio y BERT-Tiny de Google para la representacion textual. El modelo solo soporta ingles, usa una unica voz de salida sintetizada con Flite SLT y esta disenado para un unico escenario: responder preguntas sobre un manual de visitantes sustituible.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, con un tamano de 0,0 GB, lo que sugiere que los pesos se distribuyen a traves del instalador del repositorio de GitHub y no como ficheros completos alojados en Hugging Face. La licencia es MIT para los componentes ajustados, mientras que las dependencias congeladas tienen sus propias licencias (CC BY 4.0 para Mimi, Apache 2.0 para BERT-Tiny).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline modular de siete checkpoints PyTorch: listeners de audio, router, politica de retrieval, lector de pasajes y dos cabezas de voz; componentes congelados Mimi (codec) y BERT-Tiny (texto) |
| Parametros totales | 9,58 M (componentes ajustados; no incluye los modelos congelados de terceros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT (componentes ajustados); Mimi CC BY 4.0; BERT-Tiny Apache 2.0 |
| Formato de pesos | Checkpoints PyTorch (descargados via `python -m src.model_store download b4-handbook-v1`; el loader verifica SHA-256 contra el manifiesto del repositorio fuente) |

## Arquitectura y entrenamiento

El sistema se compone de siete checkpoints entrenados por etapas ("fitted in stages") que cubren funciones diferenciadas: escucha de audio, enrutamiento, politica de recuperacion, lectura de pasajes y sintesis de voz. La parte de audio se apoya en el codec Mimi de Kyutai, congelado, y la parte textual en BERT-Tiny de Google, tambien congelado. La salida de voz es una unica voz en ingles entrenada sobre habla sintetica Flite SLT.

El entrenamiento se realizo por fases sobre un panel original de cuatro topicos y se valido con un replay guiado de tres preguntas. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal no es arquitectonica sino de diseno: un agente de voz completo con recuperacion documental intercambiable que cabe en menos de 10 M de parametros ajustados y se ejecuta en una maquina con CUDA.

## Capacidades

- Speech-to-speech en ingles: recibe audio de entrada y devuelve audio de salida con una unica voz sintetizada.
- Generacion de consultas de busqueda (`SEARCH`) a partir de la pregunta hablada.
- Seleccion de documento (`READ`) entre los disponibles en el handbook activo.
- Respuesta hablada basada en el contenido del documento recuperado.
- Abstencion cuando la pregunta no es respondible con el handbook cargado (comportamiento verificado en el replay guiado).
- Intercambio de handbook en caliente: al sustituir el manual, la misma grabacion produce respuestas distintas.
- Captura de audio continua en el navegador durante la recuperacion y la reproduccion.
- No soporta tool calling generico, agentes multi-paso abiertos, vision, matematicas ni conversacion libre fuera del dominio del handbook.

## Casos de uso

- Demostracion de voice RAG en hardware modesto: el modelo sirve como referencia reproducible para validar un pipeline de recuperacion documental por voz sin depender de LLMs de gran tamano; util en docencia y prototipado.
- Mostrador de informacion en un edificio o exposicion: con un handbook de visitantes cargado, responde por voz a preguntas como horarios de apertura, recogida de acreditaciones o senalizacion, manteniendo las manos libres del usuario.
- Evaluacion de estrategias de abstencion: el replay guiado con handbook vacio o actualizado permite medir si el sistema evita inventar respuestas cuando el documento no contiene el dato.
- Pruebas de robustez de ASR en dominios cerrados: al usar Mimi y un listener propio, sirve para estudiar como afectan pronunciaciones no familiares y ruido a la seleccion de documento.
- Sustitucion rapida de base documental: cualquier organizacion puede reemplazar el handbook y repetir la misma grabacion para verificar que el sistema responde con la informacion nueva, lo que facilita auditorias de contenido.
- Banco de pruebas de latencia en pipelines de voz: el servidor local en el puerto 9038 permite medir el coste de retrieval y sintesis en una maquina CUDA concreta antes de escalar a un sistema mayor.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Condiciones |
|---|---|---|
| Seleccion de fuente correcta (panel original de cuatro topicos) | 20 de 20 ensayos respondibles | Cuatro grabaciones repetidas |
| Replay guiado de tres preguntas | 9 de 9 combinaciones pregunta-handbook con hecho hablado esperado o abstencion | Tres preguntas x tres estados de handbook |
| Evaluacion de habla renderizada | Puntuada offline con Whisper | Metodologia descrita en el repositorio |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores son evaluaciones internas del autor sobre un panel reducido y no son comparables con benchmarks de LLMs generalistas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 9,58 M de parametros ajustados mas Mimi y BERT-Tiny congelados, el consumo es muy bajo y cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: el autor indica "a CUDA machine" sin especificar modelo; cualquier GPU NVIDIA con CUDA es suficiente en la practica.
- Cabe en GPU consumer: si, por el orden de magnitud de los parametros; no se especifican modelos concretos.
- Despliegue: servidor local incluido en el repositorio (`python -m experiments.phase_b.b4_retrieval.code.serve --model-dir models/weights/b4-handbook-v1 --port 9038`), con interfaz web en `http://127.0.0.1:9038/`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Entorno: Python 3.12 con `requirements-audio.txt`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fluffy B4 handbook v1 | 9,58 M ajustados (+ Mimi y BERT-Tiny congelados) | No disponible | Speech-to-speech con retrieval | MIT (componentes ajustados) | Hugging Face + GitHub |
| Modelos speech-to-speech generalistas (p. ej. familia Moshi de Kyutai) | No disponible en la informacion proporcionada | No disponible | Speech-to-speech | No disponible | No disponible |
| Voice RAG sobre LLM + ASR + TTS | Depende del LLM base | Depende del LLM base | Audio + texto | Depende de los componentes | Amplia |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada; la comparativa se limita a categoria, modalidad y licencia.

## Limitaciones y advertencias

- Dominio cerrado: disenado para un unico handbook de visitantes; la conversacion libre, las preguntas no relacionadas y las pronunciaciones no familiares pueden producir fallos o falsos disparos, segun el propio autor.
- Un solo idioma: solo ingles; no hay soporte multilingue.
- Una sola voz de salida, entrenada sobre habla sintetica Flite SLT; no hay variedad de voces ni control de estilo.
- Riesgo de alucinacion y falsos positivos en la seleccion de documento fuera del panel evaluado; la evaluacion publicada cubre solo 20 ensayos y 9 combinaciones guiadas.
- Dependencias con licencias distintas de la MIT: Mimi (CC BY 4.0) y BERT-Tiny (Apache 2.0); conviene revisar el cumplimiento si se redistribuye el sistema completo.
- Los pesos no parecen alojarse como ficheros completos en Hugging Face (tamano de repo 0,0 GB); la descarga se realiza mediante el instalador del repositorio, que verifica integridad por SHA-256.
- Sin descargas ni likes registrados en Hugging Face en el momento de la consulta; no hay evidencia de uso en produccion por terceros.
- No hay datos publicados sobre cuantizacion, contexto maximo ni latencia, lo que dificulta planificar un despliegue a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/natbusa/fluffy-b4-handbook-v1
- Repositorio GitHub: https://github.com/busa-cto-ai/fluffy
- Demo grabada: https://busa-cto-ai.github.io/assets/fluffy/
- Estudio de viabilidad: https://busa-cto-ai.github.io/editorial/fluffy/
- Evaluacion y trazas: https://github.com/busa-cto-ai/fluffy/tree/main/experiments/phase_b/b4_retrieval/results
- Codec Mimi (Kyutai): https://huggingface.co/kyutai/moshiko-pytorch-bf16
- BERT-Tiny (Google): https://huggingface.co/google/bert_uncased_L-2_H-128_A-2
