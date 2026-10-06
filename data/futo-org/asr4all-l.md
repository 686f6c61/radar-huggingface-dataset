# futo-org/asr4all-l

## Resumen

asr4all-l es un modelo de reconocimiento automatico del habla (ASR) desarrollado por FUTO (futo-org), publicado en HuggingFace bajo la licencia futo-model-weights-ethical-use-1.0. Se trata de un modelo de 96.999.005 parametros totales (segun los pesos en safetensors; la model card desglosa 91,5 millones en el modulo acustico y 5,3 millones en un modulo PCEC de puntuacion, capitalizacion y correccion de errores). Su objetivo no es competir en precision bruta con los modelos ASR mas grandes, sino ofrecer una eficiencia muy alta en CPU, movil y dispositivos edge, con inferencia en streaming y factor de tiempo real (RTFx) muy superior al de modelos de tamano comparable.

La arquitectura es propietaria y esta basada en CTC, optimizada explicitamente para operaciones vectorizadas SIMD y NEON, con un modelo auxiliar de lenguaje pequeno para puntuacion, capitalizacion y correccion ligera, ademas de un detector de actividad de voz (VAD) ultraligero. Los mismos pesos admiten modos de streaming de baja y alta latencia, configurables en tiempo de ejecucion, lo que la convierte en una opcion interesante para transcripcion continua en dispositivos sin GPU.

El modelo solo soporta ingles. Es relevante ahora porque cubre el nicho de ASR en dispositivo (on-device) con huella de memoria inferior a 400 MB en precision completa, exportaciones listas para ONNX y ExecuTorch, y un regimen de licencia que permite uso comercial con restricciones eticas (por ejemplo, prohibicion de vigilancia masiva). En el momento de redactar esta ficha, el repositorio acumula 69 descargas y 1 like, por lo que se trata de una publicacion muy reciente y con poca validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC con arquitectura propia del autor; encoder acustico + modulo PCEC (modelo de lenguaje pequeno) + VAD ultraligero |
| Parametros totales | 96.999.005 (91,5 M acusticos + 5,3 M PCEC) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica; ASR en streaming con latencia configurable en tiempo de ejecucion (configuracion de referencia en los benchmarks: c256r64) |
| Tipos de cuantizacion | no disponible el detalle; el autor indica que exporta pesos en varios formatos y cuantizaciones |
| Idiomas soportados | ingles (en) |
| Licencia | futo-model-weights-ethical-use-1.0 (etiquetada como "other"; permite uso comercial con restricciones eticas) |
| Formato de pesos | safetensors, ONNX y ExecuTorch (tambien compatible con transformers) |

Otros datos: tamano del repositorio 4,7 GB; pipeline `automatic-speech-recognition`; requiere `custom_code` (Trust Remote Code); creado el 2026-08-08 y actualizado el 2026-10-06.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura CTC propia, no un transformer encoder-decoder tipo Whisper. La model card la describe como una arquitectura "personalizada y unica" disenada para maximizar el RTFx, con delegacion limpia de operaciones a instrucciones SIMD y NEON, lo que explica su orientacion a CPU y a entornos de bajo consumo. Sobre el modulo acustico se anade un segundo modelo pequeno (PCEC) de 5,3 millones de parametros que aplica puntuacion, capitalizacion y correccion ligera de errores sobre la salida del reconocedor, y un VAD ultraligero para aplicaciones que necesitan deteccion de actividad de voz de bajo consumo. Los mismos pesos soportan inferencia en streaming de baja y alta latencia, con la latencia configurable en tiempo de ejecucion.

Los datos de entrenamiento declarados en la model card proceden de 14 corpus: espnet/yodas, MLCommons/peoples_speech, mozilla-foundation/common_voice_25_0, openslr/librispeech_asr, pkufool/libriheavy, facebook/voxpopuli, edinburghcstr/ami, qmeeus/slurp, distil-whisper/earnings22, Revai/earnings21, edinburghcstr/edacc, farukclk/voxpopuli-en-accented-split, ylacombe/english_dialects y apptek-com/apptek_callcenter_dialogues. Esto cubre lectura de libros, habla espontanea, reuniones, discurso parlamentario, llamadas de centro de contacto, dominios financieros (earnings calls) y variedades dialectales del ingles. El numero total de horas o tokens de entrenamiento, la composicion exacta del dataset y si hubo etapas de RLHF o DPO no se detallan en la informacion disponible.

## Capacidades

- Transcripcion de voz a texto en ingles con arquitectura CTC y salida token a token.
- Inferencia en streaming con dos modos (baja latencia y alta latencia) desde los mismos pesos, con latencia configurable en tiempo de ejecucion.
- Puntuacion, capitalizacion y correccion ligera de errores mediante el modulo PCEC incluido.
- Deteccion de actividad de voz (VAD ultraligero, etiquetado como "wake" en la model card).
- Optimizacion para CPU, movil y edge: uso intensivo de SIMD y NEON, con RTFx superior al de modelos ASR de tamano comparable segun el autor.
- Exportaciones multiruntime: transformers, ONNX y ExecuTorch, con distintas cuantizaciones.
- Aceleracion en GPU: la model card incluye una seccion especifica de "GPU acceleration", aunque los datos concretos no se recogen en la informacion disponible.
- No se declara soporte de tool calling, function calling, agentes, vision, audio generativo ni capacidades multimodales. El modelo es exclusivamente ASR monolingue.

## Casos de uso

- Transcripcion en tiempo real en moviles y dispositivos edge: con unos 97 millones de parametros y pesos cuantizables, el modelo puede ejecutarse localmente sin depender de la nube, lo que reduce latencia y preserva la privacidad del audio del usuario.
- Subtitulado en directo de reuniones y videollamadas: el modo streaming de baja latencia esta pensado para emitir texto parcial mientras se habla; para reuniones grabadas puede usarse el modo de alta latencia con mejores resultados.
- Asistentes de voz y dictado por voz en aplicaciones de escritorio: el VAD ultraligero permite activar la captura solo cuando hay habla, reduciendo consumo energetico en dispositivos portatiles.
- Transcripcion de llamadas de centro de contacto: el corpus apptek_callcenter_dialogues forma parte del entrenamiento, y el modulo PCEC facilita salidas legibles para sistemas de analitica y control de calidad.
- Notas y actas de reuniones empresariales: los datasets AMI, Earnings-21/Earnings-22 y SLURP cubren dominios de reunion y de llamadas financieras, adecuados para generar actas y resumenes previos a un LLM.
- Accesibilidad y subtitulado en aplicaciones de sistema: al ser on-device y no requerir GPU, se puede integrar en sistemas operativos, navegadores o lectores de pantalla con un coste de memoria bajo.
- Procesamiento por lotes en servidores solo-CPU: para pipelines de transcripcion masiva donde no hay GPUs disponibles, el enfoque en SIMD y el RTFx elevado permiten alto paralelismo horizontal a bajo coste.
- Preprocesado para pipelines de PLN: transcripcion de audio a texto como primer paso de sistemas de indexacion, busqueda semantica o analisis de sentimiento sobre contenido hablado.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (WER en %, normalizacion Whisper, configuracion c256r64, menor es mejor). Todos los valores estan marcados como `verified: false`, es decir, no verificados de forma independiente.

| Dataset | Valor WER (%) |
|---|---|
| LibriSpeech clean | 2,38 |
| LibriSpeech other | 5,94 |
| VoxPopuli (cleaned, aa) | 4,05 |
| SPGISpeech | 4,61 |
| Monsoon en-IN | 7,40 |
| Earnings-22 (cleaned, chunked) | 9,15 |
| GigaSpeech (cleaned) | 9,84 |
| AMI (cleaned) | 9,94 |

Datos adicionales de rendimiento: la model card presenta graficas de RTFx por plataforma y backend (imagenes `hw_backends.png` y `bench_table.png`) en hilos unicos, pero los valores numericos no estan disponibles en el texto proporcionado. No se han facilitado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos (calculo a partir de 96,999 millones de parametros): aproximadamente 390 MB en FP32, unos 195 MB en FP16/BF16 y unos 97 MB en INT8. Son estimaciones de peso puro, sin contar activaciones ni buffers de runtime.
- El destino principal es CPU, no GPU: el modelo esta disenado para inferencia en CPU, movil y edge, con soporte explicito de SIMD y NEON.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, etc., e incluso en GPUs integradas con varios GB de memoria compartida. Tambien cabe en dispositivos moviles modernos a traves de ExecuTorch.
- GPU de centro de datos (A100, H100) no son necesarias para este modelo; su uso tendria sentido solo para servir muchas peticiones concurrentes.
- Opciones de despliegue: transformers (Python), ONNX Runtime, ExecuTorch y los backends que el autor exporta en el repositorio. No se menciona soporte de GGUF, vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: la model card afirma un RTFx significativamente superior al de modelos ASR de tamano comparable y publica graficas por backend y plataforma, pero no se proporcionan cifras concretas en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. La propia model card indica que existen tres tamanos dentro de la familia asr4all, pero solo se documentan aqui las especificaciones de la variante large.

| Modelo | Parametros | Idiomas | Licencia | Rendimiento comparado |
|---|---|---|---|---|
| futo-org/asr4all-l | 96.999.005 (91,5 M acusticos + 5,3 M PCEC) | en | futo-model-weights-ethical-use-1.0 (uso comercial con restricciones eticas) | WER 2,38-9,94 % en ocho conjuntos del Open ASR Leaderboard (no verificado) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo monolingue: solo soporta ingles. No hay soporte declarado de castellano ni de otros idiomas.
- Benchmarks no verificados: todos los resultados del model-index aparecen con `verified: false`, es decir, son cifras autodeclaradas por el autor y no reproducidas por terceros. El numero de descargas (69) y de likes (1) es muy bajo, lo que limita la evidencia de la comunidad.
- Rendimiento degradado en audio dificil: el WER sube a 9,94 % en AMI y 9,84 % en GigaSpeech, y a 7,40 % en Monsoon en-IN, lo que indica perdida de precision en habla espontanea, ruidosa o con acento no estadounidense/britanico estandar.
- Sesgos de dominio en los datos: el entrenamiento esta sesgado hacia ingles de lectura de libros, reuniones y llamadas corporativas o financieras; el rendimiento en jerga tecnica, dialectos poco representados o audio de muy baja calidad no esta documentado.
- Riesgo de alucinacion: aunque los modelos CTC no generan texto libre como los decoder-only, pueden producir sustituciones, omisiones y repeticiones en audio ruidoso o con silencios; el modulo PCEC puede introducir correcciones erroneas al "arreglar" transcripciones.
- Restricciones de licencia: la licencia futo-model-weights-ethical-use-1.0 permite uso comercial, pero prohibe actividades concretas como la vigilancia masiva. Es imprescindible revisar el texto completo de la licencia antes de un despliegue en produccion.
- Requiere `custom_code`: el uso con transformers implica ejecutar codigo personalizado del autor con `trust_remote_code=True`, lo que anade una superficie de riesgo de seguridad en entornos no controlados.
- Puntuacion dependiente de un modulo auxiliar: la capitalizacion, puntuacion y correccion no provienen del modelo acustico, sino del modulo PCEC de 5,3 M de parametros; si se despliega solo el modulo acustico, la salida carece de formato.
- Sin informacion sobre cuantizaciones concretas ni sobre latencias medidas de forma independiente, no es posible garantizar objetivos de SLA en produccion sin una evaluacion propia.

## Enlaces

- HuggingFace: https://huggingface.co/futo-org/asr4all-l
- Licencia (referenciada como LICENSE en el repositorio): https://huggingface.co/futo-org/asr4all-l/blob/main/LICENSE
- Paper referenciado en las etiquetas del modelo (arXiv 2607.25870): https://arxiv.org/abs/2607.25870
- Datasets declarados en la model card:
  - https://huggingface.co/datasets/espnet/yodas
  - https://huggingface.co/datasets/MLCommons/peoples_speech
  - https://huggingface.co/datasets/mozilla-foundation/common_voice_25_0
  - https://huggingface.co/datasets/openslr/librispeech_asr
  - https://huggingface.co/datasets/pkufool/libriheavy
  - https://huggingface.co/datasets/facebook/voxpopuli
  - https://huggingface.co/datasets/edinburghcstr/ami
  - https://huggingface.co/datasets/qmeeus/slurp
  - https://huggingface.co/datasets/distil-whisper/earnings22
  - https://huggingface.co/datasets/Revai/earnings21
  - https://huggingface.co/datasets/edinburghcstr/edacc
  - https://huggingface.co/datasets/farukclk/voxpopuli-en-accented-split
  - https://huggingface.co/datasets/ylacombe/english_dialects
  - https://huggingface.co/datasets/apptek-com/apptek_callcenter_dialogues
- Busqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos por la busqueda no guardan relacion con el modelo ni con ASR y no se incluyen.
