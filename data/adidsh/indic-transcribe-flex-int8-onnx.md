# adidsh/indic-transcribe-flex-int8-onnx

## Resumen

Indic Transcribe Flex INT8 ONNX es un paquete de reconocimiento automatico del habla (ASR) cuantizado a INT8 y exportado a ONNX Runtime, derivado del modelo bodhan-ai/indic-transcribe-flex y publicado por el contribuidor adidsh. Su objetivo es ejecutar transcripcion de voz completamente en dispositivo (on-device), sin conexion y con privacidad total, en aplicaciones moviles Android con CPU ARM64-v8a, evitando cualquier llamada a servicios en la nube.

La arquitectura subyacente es la de NVIDIA Canary-1B-v2, un modelo de tipo attention encoder-decoder (AED) que combina un encoder FastConformer de 32 capas con un decoder transformer autoregresivo de 24 capas y un vocabulario de 7.152 piezas. El contribuidor ha mapeado 530 capas `nn.Linear` (289 en el encoder y 241 en el decoder) a operaciones `MatMulInteger` de ONNX, manteniendo en FP32 las rutas sensibles a la precision: bloques de subsampling convolucional, LayerNorm, embeddings posicionales rotatorios (RoPE) y sumas residuales.

La relevancia del modelo esta en su relacion tamano/cobertura: cubre 27 lenguas indias (22 oficiales, ingles indio y cuatro variedades de bajos recursos como bhojpuri, chhattisgarhi, haryanvi y bhili) en 1,45 GB de artefactos, un 68,1 % menos que el checkpoint FP32 original de 4,55 GB, con inferencia en CPU y sin acelerador dedicado. Es un caso claro de destilacion de un modelo fundacional grande hacia un artefacto desplegable en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Attention encoder-decoder (AED): encoder FastConformer de 32 capas + decoder transformer de 24 capas (arquitectura base NVIDIA Canary-1B-v2) |
| Parametros totales | No declarado por el autor. El checkpoint FP32 upstream ocupa 4,55 GB, compatible con un orden de ~1,1 B de parametros en FP32 (estimacion derivada del tamano de fichero, no confirmada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de audio; no se especifica la ventana maxima de entrada en la informacion proporcionada) |
| Tipos de cuantizacion | INT8 W8A8: pesos estaticos INT8 (`MatMulInteger`) + activaciones dinamicas INT8 (`DynamicQuantizeLinear`); FP32 preservado en subsampling convolucional, LayerNorm, RoPE y residuales. 530 capas `nn.Linear` cuantizadas y 1.060 tensores de pesos INT8 |
| Idiomas soportados | 27: en (ingles indio), as, bn, brx, doi, gu, hi, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur, bho, hne, bgc, bhb |
| Licencia | Indic Open Model License v1.0 (arquitectura base NVIDIA Canary-1B-v2 bajo CC-BY-4.0). Se permite inferencia comercial autoalojada en dispositivo; se requiere licencia separada por encima de 500 M de MAU o 250 M USD de ingresos anuales (texto truncado en la model card) |
| Formato de pesos | ONNX (encoder.onnx de 1,04 GB + decoder.onnx de 427,5 MB); vocabulario `bodhan_vocab.json` (7.152 piezas, 84,8 KB) y tokenizadores SentencePiece (`tokenizer_multilingual.model`, `tokenizer_spl_tokens.model`) |
| Tamano total del repositorio | 1,6 GB (artefactos de modelo: 1.570.095.829 bytes / 1,45 GB) |
| Pipeline | automatic-speech-recognition |
| Libreria | onnx |

## Arquitectura y entrenamiento

El modelo hereda la topologia de NVIDIA Canary-1B-v2: un encoder FastConformer de 32 capas que procesa la señal acustica y un decoder transformer de 24 capas que genera la transcripcion de forma autoregresiva, con prompts de idioma identificados por token. No se trata de un transformer decoder-only ni de un modelo SSM o hibrido, sino de un esquema AED clasico optimizado en el frente convolucional. Sobre esta base, bodhan-ai/indic-transcribe-flex adapta el modelo al dominio indico, y este repositorio aplica una cuantizacion de pesos y activaciones a INT8 con exportacion a ONNX.

El contribuidor no documenta el proceso de entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF o DPO): esa informacion pertenece al modelo upstream y no se reproduce en la model card. La innovacion tecnica destacable de esta derivacion es la cuantizacion selectiva: se cuantizan unicamente las proyecciones lineales, mientras que las convoluciones de subsampling, las LayerNorm, las RoPE y las sumas residuales permanecen en FP32, lo que limita la degradacion numerica con un ahorro de almacenamiento del 68,1 %. La decodificacion sigue siendo autoregresiva; no se emplea decodificacion especulativa ni atencion lineal.

## Capacidades

- Transcripcion de voz a texto (ASR) en 27 lenguas indias, incluidas 22 lenguas oficiales de la India, ingles indio y variedades de bajos recursos (bhojpuri, chhattisgarhi, haryanvi, bhili).
- Identificacion automatica de idioma (language ID) integrada en el proceso de transcripcion.
- Seleccion explicita de idioma mediante token de prompt, recomendada cuando el idioma es conocido.
- Ejecucion 100 % offline y on-device, sin transferencia de audio a servidores externos.
- Dictado en tiempo real mediante troceado adaptativo del audio (adaptive audio chunking); no dispone de estados de streaming nativos en la arquitectura Canary AED.
- Inferencia en CPU ARM64-v8a a traves de sesiones ONNX Runtime, disenada para integracion en aplicaciones Android.
- Verificacion de integridad de artefactos mediante SHA-256 y manifiesto versionado (`manifest.json`), con control de version minima de la app (`minimum_app_version_code: 295`).
- No dispone de tool calling ni function calling, no soporta agentes, no genera codigo ni texto libre, no procesa vision ni audio mas alla del ASR y no tiene modo de razonamiento explicito.

## Casos de uso

- Dictado de voz en aplicaciones Android de productividad: el modelo permite transcribir notas de voz a texto sin conexion en hindi, tamil o bengali, integrado mediante ONNX Runtime en CPU ARM64, con un requisito de 4 GB de RAM total y 2 GB libres durante la inferencia.
- Historia clinica dictada en entornos rurales sin cobertura: un profesional sanitario puede dictar informes en marathi o gujarati y obtener texto en el dispositivo, garantizando que los datos sensibles del paciente nunca salen del terminal.
- Subtitulado de contenido audiovisual en lenguas indias: el modelo genera transcripciones para videos en kannada, telugu o punjabi, y la identificacion de idioma permite enrutar automaticamente el audio al flujo de postprocesado correspondiente.
- Atencion al ciudadano en servicios publicos multilingues: integrado en quioscos o aplicaciones de ventanilla unica para registrar solicitudes habladas en cualquiera de las 22 lenguas oficiales, con seleccion de token de idioma cuando el operador lo conoce de antemano.
- Recogida de datos de campo para investigacion linguistica: permite transcribir entrevistas en variedades de bajos recursos (bhojpuri, chhattisgarhi, haryanvi, bhili) en zonas sin conectividad estable, generando corpus etiquetados por idioma.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en vivo de conversaciones presenciales en el propio dispositivo, con el troceado adaptativo como mecanismo para aproximar el tiempo real.
- Asistentes de voz embebidos en vehiculos o electrodomesticos: el modelo ocupa 1,45 GB y funciona sin GPU, por lo que puede integrarse en hardware con 4 GB de RAM sin depender de un enlace de red permanente.
- Documentacion de reuniones en empresas con equipos distribuidos en la India: transcripcion local de reuniones multilingues que despues se procesan con herramientas de resumen, sin exponer el audio a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de WER, CER ni comparaciones cuantitativas con otros modelos, y el repositorio no presenta ningun conjunto de evaluacion. No se deben asumir cifras de calidad derivadas del modelo upstream sin verificarlas empiricamente.

## Requisitos de hardware

- Inferencia en CPU ARM64-v8a, no en GPU. El modelo no es un LLM y no esta pensado para aceleradores CUDA.
- RAM: minimo 4 GB de memoria total del sistema y al menos 2 GB libres durante la inferencia, segun los requisitos declarados por el autor.
- Almacenamiento: mas de 2,0 GB libres en el dispositivo; los artefactos de modelo suman 1,45 GB (encoder 1,04 GB + decoder 427,5 MB).
- GPU recomendadas: no aplica ni se documenta ninguna. No hay soporte declarado para ejecucion con ONNX Runtime GPU Execution Provider, TensorRT ni CUDA.
- Cabe en GPU de consumo: no aplica en el escenario objetivo; el destino es movil y embebido. Un port a escritorio requeriria CPU x86-64 con ONNX Runtime, no evaluado por el autor.
- Opciones de despliegue: ONNX Runtime CPU en Android (clase `CanaryAedEngine.kt`), consumo mediante `metadata/manifest.json` con verificacion de SHA-256 y version minima de app 295. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El dictado en tiempo real se logra con troceado adaptativo del audio, pero no se publican cifras de latencia por segundo de audio ni de factor de tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Indic Transcribe Flex INT8 ONNX | No declarado (~1,1 B estimado por tamano del checkpoint FP32) | 27 lenguas indias | ONNX INT8 W8A8, CPU ARM64 | Indic Open Model License v1.0 | HuggingFace, 0 descargas |
| bodhan-ai/indic-transcribe-flex (upstream) | No disponible | 27 lenguas indias (segun el derivado) | safetensors FP32 (4,55 GB) | Indic Open Model License v1.0 | HuggingFace |
| NVIDIA Canary-1B-v2 (arquitectura base) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada (modelo orientado a lenguas europeas) | Pesos NVIDIA NeMo | CC-BY-4.0 | HuggingFace |
| OpenAI Whisper large-v3 | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | safetensors, multiples runtimes | No disponible en la informacion proporcionada | HuggingFace |

Nota: los datos de los modelos comparados no proceden de la informacion proporcionada en esta ficha y deben verificarse en sus fichas oficiales antes de usarse en una decision de produccion.

## Limitaciones y advertencias

- El modelo esta optimizado para habla conversacional de un unico interlocutor. Voces solapadas o distorsion de fondo intensa degradan la salida.
- La identificacion automatica de idioma en fragmentos cortos (menos de 2 segundos) puede mostrar baja confianza entre variedades indicas del norte proximas entre si; se recomienda pasar explicitamente el token de idioma cuando se conoce.
- Requiere procesador ARM64-v8a, 4 GB de RAM total y 2 GB libres durante la inferencia, lo que excluye dispositivos de gama baja.
- No hay streaming nativo: el tiempo real se aproxima con troceado adaptativo del audio, lo que puede introducir latencia adicional no cuantificada.
- No se han publicado benchmarks de WER ni evaluaciones de robustez acustica, por lo que la calidad real en produccion es desconocida.
- Riesgo de alucinacion y de sustitucion de palabras en audio ruidoso o con acentos poco representados en el entrenamiento; no hay datos sobre sesgos por variedad dialectal.
- El aviso de licencia de la model card esta truncado: se indica que los productos que superen 500 M de MAU o 250 M USD de ingresos anuales requieren una licencia comercial separada, pero el texto completo de esa clausula no esta disponible en la informacion proporcionada. Hay que leer `LICENSE` y `NOTICE.md` antes de un uso comercial.
- La licencia es "other", no una licencia estandar aprobada por la OSI, y la arquitectura base impone ademas atribucion CC-BY-4.0 a NVIDIA.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en septiembre de 2026: no hay evidencia de uso en produccion ni de validacion externa por parte de la comunidad.
- El flujo de consumo esta acoplado a una aplicacion Android concreta (version minima de app 295, ruta `/files/models/bodhan_flex_int8/` y clase `CanaryAedEngine.kt`), lo que limita la reutilizacion fuera de ese cliente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adidsh/indic-transcribe-flex-int8-onnx
- Modelo base: https://huggingface.co/bodhan-ai/indic-transcribe-flex
- Commit upstream referenciado: `d1f27e693a2d0dd5735492908720003bdac81712`
- Arquitectura base NVIDIA Canary-1B-v2: https://huggingface.co/nvidia/canary-1b-v2
- Licencia de la arquitectura base (CC-BY-4.0): https://creativecommons.org/licenses/by/4.0/
- Ficheros de licencia del repositorio: `LICENSE`, `LICENSE_DEED.md`, `NOTICE.md`
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; los resultados devueltos corresponden a paginas de soporte de Microsoft sin relacion con el modelo.
