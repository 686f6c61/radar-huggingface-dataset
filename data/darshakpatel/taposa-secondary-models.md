# darshakpatel/taposa-secondary-models

## Resumen

TAPOSA secondary models es un repositorio de modelos auxiliares que acompanan a la aplicacion TAPOSA, un proyecto que combina un modelo de lenguaje pequeno (Qwen3.5 0.8B o LFM3 1.7B, ambos ajustados con SFT) con un conjunto de componentes especializados para recuperacion de informacion, reconocimiento de voz, diarizacion y segmentacion de audio. El repositorio lo publica el usuario darshakpatel en Hugging Face y su funcion no es ofrecer un modelo generativo autonomo, sino empaquetar en formato ONNX todos los modulos que la app descarga junto al LLM principal.

El paquete incluye un encoder y un reranker de recuperacion basados en GTE-ModernColBERT-v1 y gte-reranker-modernbert-base, un sistema de speech-to-text (SenseVoiceSmall), deteccion de actividad de voz (Silero VAD), dos ASR adicionales (Parakeet TDT 0.6B v2 y Whisper large-v3-turbo), un modelo de segmentacion de hablantes (pyannote segmentation-3.0) y un extractor de embeddings de hablante (3D-Speaker CAM++). Todo se distribuye convertido a ONNX y cuantizado para ejecucion on-device, con un manifiesto (`assets_manifest.json`) que detalla rutas, tamanos y hashes SHA-256.

Su relevancia actual reside en que ejemplifica un patron creciente: pipelines de IA local que combinan un LLM pequeno con modulos especializados ligeros, evitando dependencias de API y permitiendo funcionamiento sin cuenta ni clave. El repositorio ocupa 3.7 GB y no ha registrado descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion heterogenea: encoder bi-encoder (ModernColBERT), cross-encoder reranker (ModernBERT), ASR (SenseVoice, Parakeet TDT, Whisper), VAD (Silero), segmentacion de hablantes (pyannote), embeddings de hablante (CAM++) |
| Parametros totales | no disponible (agregado de varios modelos; no se publica el desglose) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantizacion ONNX (niveles concretos no especificados en la model card) |
| Idiomas soportados | no disponible (depende de cada submodelo; SenseVoice y Whisper son multilingues, Parakeet v2 es principalmente ingles) |
| Licencia | mixta: Apache-2.0 (GTE-ModernColBERT, gte-reranker, CAM++), MIT (Silero VAD, Whisper, pyannote), CC-BY-4.0 (Parakeet), FunASR Model License (SenseVoice), licencia propia para Omnilingual ASR |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo propio: agrega modelos de terceros sin modificaciones salvo la conversion a ONNX y la cuantizacion. La arquitectura es, por tanto, la de cada componente original. El modulo de recuperacion usa un encoder tipo ColBERT moderno (GTE-ModernColBERT-v1) junto a un reranker cross-encoder basado en ModernBERT (gte-reranker-modernbert-base), lo que configura un pipeline retrieve-then-rerank. El modulo de voz combina Silero VAD para deteccion de actividad, SenseVoiceSmall para transcripcion general, Parakeet TDT 0.6B v2 y Whisper large-v3-turbo como ASR alternativos, pyannote segmentation-3.0 para diarizacion y CAM++ de 3D-Speaker para embeddings de hablante.

No se publican datos sobre volumen de entrenamiento, composicion del dataset ni procesos de RLHF o DPO, ya que corresponden a los modelos originales y no al empaquetado. La innovacion tecnica del repositorio es de integracion: un manifiesto con hashes SHA-256 por fichero, conversion homogenea a ONNX y cuantizacion para despliegue on-device, ademas de definiciones de prompts y herramientas (`contracts/`) especificas para los dos LLM que la app puede usar.

## Capacidades

- Recuperacion de informacion densa y reranking mediante encoder ColBERT y cross-encoder ModernBERT.
- Transcripcion de voz a texto con tres motores alternativos (SenseVoiceSmall, Parakeet TDT 0.6B v2, Whisper large-v3-turbo).
- Deteccion de actividad de voz (VAD) para segmentar audio y reducir coste de ASR.
- Diarizacion de hablantes mediante segmentacion (pyannote) y embeddings de hablante (CAM++).
- Procesamiento de llamadas: el directorio `calls/` agrupa VAD, ASR, segmentacion y embedding para analisis de conversaciones telefonicas.
- Ejecucion on-device en formato ONNX, sin necesidad de cuenta ni clave de API.
- Integracion con dos LLM concretos (taposa-qwen35-0.8b-sft-v2 y taposa-lfm3-1.7b-sft-v2) a traves de contratos de prompt y herramientas.
- No incluye generacion de texto propia: esa funcion recae en los LLM principales de la app.

## Casos de uso

- Transcripcion local de reuniones: usar Whisper large-v3-turbo o SenseVoiceSmall en ONNX para convertir audio a texto en el dispositivo, con Silero VAD para trocear la senal y evitar procesar silencios.
- Analisis de llamadas de atencion al cliente: el pipeline `calls/` permite detectar turnos de habla, transcribir y separar hablantes (pyannote + CAM++) para generar resumenes o metricas por agente.
- Busqueda semantica sobre documentacion interna: el encoder GTE-ModernColBERT indexa fragmentos y el reranker gte-reranker-modernbert-base reordena los candidatos antes de pasarlos al LLM, mejorando la precision del contexto recuperado.
- Asistente de voz embebido: combinar VAD, ASR y el LLM pequeno (Qwen3.5 0.8B o LFM3 1.7B) para construir un asistente que funcione sin conexion en dispositivos con recursos limitados.
- Diarizacion de entrevistas o podcasts: segmentacion de hablantes y embeddings para etiquetar quien habla en cada tramo, util en herramientas de edicion o archivo.
- Prototipado de pipelines RAG on-device: el manifiesto con hashes y tamanos facilita la verificacion de integridad y el despliegue reproducible de un stack de recuperacion completo en local.
- Investigacion en ASR comparado: al incluir tres motores ASR distintos, sirve para evaluar precision, latencia y consumo en el mismo hardware con audio de entrada identico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio completo ocupa 3.7 GB en disco; la carga en memoria depende de que submodelos se activen simultaneamente. Un pipeline de recuperacion (encoder + reranker) es ligero, mientras que Whisper large-v3-turbo es el componente mas pesado.
- GPU recomendadas: no disponible de forma especifica; al ser modelos ONNX cuantizados, estan pensados para ejecucion en CPU y aceleradores de borde (NPU, GPU integradas).
- Compatibilidad con GPU de consumo: probable en RTX 4090 y similares para todos los componentes, aunque no se publican requisitos oficiales.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a estos componentes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TAPOSA secondary models | Paquete ONNX de modulos auxiliares | no disponible | no disponible | Mixta | Hugging Face (darshakpatel) |
| GTE-ModernColBERT-v1 (original) | Encoder de recuperacion | no disponible | no disponible | Apache-2.0 | Hugging Face (lightonai) |
| gte-reranker-modernbert-base (original) | Cross-encoder reranker | no disponible | no disponible | Apache-2.0 | Hugging Face (Alibaba-NLP) |
| Whisper large-v3-turbo (original) | ASR | no disponible | no disponible | MIT | Hugging Face (openai) |

La comparativa directa no es homogenea porque TAPOSA empaqueta varios modelos de categorias distintas; los originales listados arriba son las alternativas naturales si se quiere usar cada componente por separado sin el empaquetado ONNX.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse como LLM por si solo; requiere uno de los dos modelos principales de TAPOSA.
- Licencia mixta: cada submodelo conserva su licencia original, incluida la FunASR Model License de SenseVoice y la licencia propia de Omnilingual ASR, que pueden imponer restricciones distintas al uso comercial.
- Sin datos de benchmarks ni de rendimiento publicados, por lo que no hay evidencia objetiva de calidad en tareas concretas.
- Idiomas soportados no declarados de forma agregada; Parakeet TDT 0.6B v2 esta orientado principalmente al ingles, lo que limita su uso en castellano.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos ASR y de recuperacion originales, no evaluado en este empaquetado.
- Repositorio sin descargas ni validacion comunitaria en el momento de la consulta; conviene verificar los hashes del manifiesto antes de desplegar.
- La cuantizacion ONNX puede degradar ligeramente la precision respecto a los pesos originales; no se especifica el nivel aplicado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/darshakpatel/taposa-secondary-models
- Licencias del repositorio: https://huggingface.co/darshakpatel/taposa-secondary-models#licenses
- LLM principal (Qwen3.5 0.8B SFT v2, GGUF): https://huggingface.co/darshakpatel/taposa-qwen35-0.8b-sft-v2-GGUF
- LLM principal (LFM3 1.7B SFT v2): https://huggingface.co/darshakpatel/taposa-lfm3-1.7b-sft-v2
- GTE-ModernColBERT-v1: https://huggingface.co/lightonai/GTE-ModernColBERT-v1
- gte-reranker-modernbert-base: https://huggingface.co/Alibaba-NLP/gte-reranker-modernbert-base
- SenseVoiceSmall: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Silero VAD: https://huggingface.co/snakers4/silero-vad
- Parakeet TDT 0.6B v2: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Whisper large-v3-turbo: https://huggingface.co/openai/whisper-large-v3-turbo
- pyannote segmentation-3.0: https://huggingface.co/pyannote/segmentation-3.0
