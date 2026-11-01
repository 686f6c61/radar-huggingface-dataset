# argmaxinc/qwenasrkit-pro

## Resumen

QwenASRKit Pro es un paquete de modelos de reconocimiento automatico del habla (ASR) desarrollado por Argmax, Inc., que adapta los modelos Qwen3-ASR de Alibaba para su ejecucion local en Apple Silicon mediante CoreML y la libreria WhisperKit. El repositorio, alojado en HuggingFace bajo el identificador `argmaxinc/qwenasrkit-pro`, distribuye pesos ya cuantizados y comprimidos, listos para inferencia on-device en macOS e iOS sin necesidad de conexion a la nube. Con 4,1 GB de tamano de repositorio y mas de 100.000 descargas, se posiciona como una solucion de transcripcion privada orientada a produccion en el ecosistema Apple.

El modelo resuelve el problema de desplegar ASR de alta calidad en dispositivos de consumo, evitando el coste y la latencia de los servicios en la nube, asi como los problemas de privacidad asociados al envio de audio a terceros. Al estar construido sobre Qwen3-ASR, hereda la arquitectura y capacidades del modelo base de Alibaba, aunque el autor no detalla en la model card los parametros exactos, la longitud de contexto ni la composicion del dataset de entrenamiento.

Es relevante ahora porque el interes por la inferencia local de modelos de audio crece entre desarrolladores de aplicaciones Apple, y porque este repositorio es un ejemplo de empaquetado comercial de un modelo abierto bajo una licencia propia restrictiva. La ficha siguiente recoge unicamente los datos disponibles en la informacion proporcionada; los campos no documentados se marcan explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3-ASR, transformer para ASR; detalles no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos cuantizados y comprimidos para CoreML (esquema exacto no disponible) |
| Idiomas soportados | no disponible |
| Licencia | argmax-fmod-license (licencia propia de Argmax; enlace en el repositorio) |
| Formato de pesos | CoreML / WhisperKit (compatible con la libreria `whisperkit`) |
| Tamano del repositorio | 4,1 GB |
| Pipeline | automatic-speech-recognition |
| Libreria | whisperkit |

## Arquitectura y entrenamiento

El modelo es una adaptacion de los modelos Qwen3-ASR de Alibaba para su ejecucion en Apple Silicon. El autor no publica en la model card detalles sobre el numero de parametros, la arquitectura interna (atencion, capas, dimensiones) ni el proceso de entrenamiento o ajuste. Lo que si se indica es que los pesos se distribuyen en formato CoreML, cuantizados y comprimidos, lo que sugiere un proceso de conversion y optimizacion orientado a reducir el consumo de memoria y acelerar la inferencia en el Neural Engine y la GPU de los chips Apple.

No se dispone de informacion sobre el numero de tokens de audio utilizados en el entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado adicional. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. Cualquier afirmacion sobre estos puntos seria especulativa y, por tanto, se omite.

## Capacidades

- Transcripcion de audio a texto (ASR) en local, sin envio de datos a servidores externos.
- Ejecucion on-device en Apple Silicon mediante CoreML y la libreria WhisperKit.
- Pesos cuantizados y comprimidos para reducir el uso de memoria y el tamano en disco.
- Integracion con el Argmax Pro SDK, que gestiona la carga y ejecucion del modelo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el autor no especifica idiomas).
- Capacidades especiales (modo thinking, vision, audio adicional): no disponibles.

## Casos de uso

- **Transcripcion de reuniones en local**: el modelo permite convertir audio de reuniones en texto directamente en un Mac, sin subir grabaciones a la nube, lo que facilita el cumplimiento de politicas de privacidad corporativas.
- **Dictado en aplicaciones macOS e iOS**: al ejecutarse sobre CoreML y WhisperKit, puede integrarse en apps nativas para ofrecer dictado por voz con baja latencia y sin dependencia de red.
- **Subtitulado de contenido audiovisual**: util para generar subtitulos de videos o podcasts en flujos de postproduccion donde el material no puede salir del equipo del editor.
- **Aplicaciones de accesibilidad**: transcripcion en tiempo real de conversaciones para personas con discapacidad auditiva, aprovechando la inferencia local para evitar retardo de red.
- **Procesamiento por lotes de archivos de audio**: transcripcion masiva de grabaciones archivadas en un equipo Apple, con coste marginal nulo frente a APIs de pago por minuto.
- **Asistentes de voz integrados en productos de terceros**: el SDK de Argmax permite empaquetar el modelo en aplicaciones comerciales para Apple, siempre que se cumplan los terminos de la licencia.
- **Investigacion en ASR**: util como referencia de empaquetado CoreML de un modelo Qwen3-ASR para comparar rendimiento on-device frente a alternativas en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM / memoria unificada estimada**: no disponible de forma oficial; el repositorio ocupa 4,1 GB, por lo que se requiere al menos esa cantidad de memoria libre para cargar los pesos, mas el margen necesario para el runtime de CoreML.
- **GPU recomendadas**: chips Apple Silicon (serie M) con Neural Engine; el autor no especifica modelos minimos.
- **Compatibilidad con GPU de consumo**: orientado exclusivamente a hardware Apple; no se indica soporte para GPU NVIDIA o AMD.
- **Opciones de despliegue**: Argmax Pro SDK sobre WhisperKit y CoreML. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue | Disponibilidad |
|---|---|---|---|---|---|
| QwenASRKit Pro | no disponible | no disponible | argmax-fmod-license | CoreML / WhisperKit (Apple Silicon) | HuggingFace, con acceso condicionado (gated) |
| Whisper (OpenAI) | 39M–1,55B segun variante | 30 s por ventana | MIT | llama.cpp, WhisperKit, ONNX, etc. | Abierto |
| Qwen3-ASR (base) | no disponible en esta ficha | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros estructurales y de licencia.

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia `argmax-fmod-license` es propia de Argmax y no equivale a una licencia open source permisiva; es necesario revisar el archivo `LICENSE_NOTICE.txt` antes de cualquier uso comercial.
- **Acceso condicionado (gated)**: la descarga requiere aceptar la licencia y proporcionar datos de empresa y correo electronico, lo que limita la distribucion automatica en pipelines.
- **Dependencia del SDK propietario**: los modelos solo son compatibles con el Argmax Pro SDK, lo que introduce una dependencia de proveedor y posibles costes de licencia.
- **Plataforma limitada**: disenado exclusivamente para Apple Silicon; no es portable a GPU NVIDIA, AMD ni a servidores Linux convencionales.
- **Idiomas no documentados**: se desconoce la cobertura linguistica real, lo que impide garantizar calidad en idiomas distintos del ingles o el chino sin pruebas propias.
- **Riesgo de alucinacion**: como todo modelo generativo de ASR, puede producir transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no vistos en entrenamiento; no hay datos publicados sobre tasas de error (WER).
- **Sesgos**: no se documentan sesgos conocidos; la ausencia de informacion sobre el dataset de entrenamiento impide evaluar su representatividad.
- **Sin benchmarks publicados**: no es posible validar el rendimiento frente a alternativas sin realizar pruebas propias.
- **Fecha de creacion futura**: el repositorio figura creado en 2026, lo que puede indicar metadatos inconsistentes; conviene verificar la version descargada.

## Enlaces

- [HuggingFace: argmaxinc/qwenasrkit-pro](https://huggingface.co/argmaxinc/qwenasrkit-pro)
- [Licencia (LICENSE_NOTICE.txt)](https://huggingface.co/argmaxinc/qwenasrkit-pro/blob/main/LICENSE_NOTICE.txt)
- [Argmax Pro SDK](https://www.argmaxinc.com/#SDK)
- [Registro en Argmax](https://app.argmaxinc.com)
