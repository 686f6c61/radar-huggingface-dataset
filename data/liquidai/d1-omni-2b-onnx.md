# LiquidAI/d1-Omni-2B-ONNX

## Resumen

d1-Omni-2B-ONNX es la versión en formato ONNX de d1-Omni-2B, un modelo multimodal de aproximadamente 2.000 millones de parámetros desarrollado por Liquid AI, empresa estadounidense surgida del MIT que construye los Liquid Foundation Models (LFM). El modelo original forma parte de la familia que el autor etiqueta como lfm3_omni y cubre la tarea audio-text-to-text: recibe audio (y, según la estructura de ficheros, también imagen) y genera texto. Esta variante concreta no aporta pesos nuevos, sino una conversión a ONNX Runtime pensada para inferencia multiplataforma fuera del ecosistema PyTorch.

La relevancia de este repositorio es de despliegue: separa el modelo en tres grafos independientes (decoder, vision_encoder y audio_encoder) y ofrece cuatro combinaciones de precisión con tamanos de descarga de entre 2,20 GB y 3,02 GB, lo que permite ejecutar el sistema completo en CPU o en GPU de gama baja. Frente al repositorio original, aqui el objetivo no es entrenar ni afinar, sino servir el modelo en entornos donde ONNX Runtime es el runtime disponible: aplicaciones de escritorio, edge, movil o backends con requisitos estrictos de portabilidad.

La informacion publica de esta ficha es limitada: la model card remite a la del modelo base para arquitectura y uso, y no se han publicado en el material disponible ni la longitud de contexto, ni los detalles del entrenamiento, ni resultados de benchmarks. Cualquier evaluacion cuantitativa del modelo debe hacerse contra d1-Omni-2B directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo multimodal compuesto por decoder, vision encoder y audio encoder (etiquetas del autor: lfm3_omni, liquid, lfm3) |
| Parametros totales | ~2B (deducido de la denominacion d1-Omni-2B); desglose por modulo no disponible |
| Parametros activos | No disponible; no consta que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q4, q8, q4f16, q8f16 (grafo ONNX) |
| Idiomas soportados | 16: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (declarada como `license: other` con `license_name: lfm1.0`) |
| Formato de pesos | ONNX (decoder, vision_encoder y audio_encoder como grafos separados) |
| Pipeline | audio-text-to-text |
| Runtime / libreria | onnxruntime |
| Tamanos por precision | q4: 2,45 GB (CPU); q8: 3,02 GB (CPU); q4f16: 2,20 GB (GPU); q8f16: no disponible (listado truncado en la informacion recibida) |
| Encoders por precision | q4 usa vision_encoder_q8 + audio_encoder; q8 usa vision_encoder_fp16 + audio_encoder; q4f16 usa vision_encoder_fp16 + audio_encoder_fp16 |
| Tamano del repositorio | 20,1 GB |
| Modelo base | LiquidAI/d1-Omni-2B (relacion: quantized) |
| Descargas / likes | 31 descargas, 5 likes |
| Fecha de creacion / actualizacion | 27 de octubre de 2026 / 28 de octubre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna. Lo que si se deduce del repositorio es la organizacion en tres componentes: un decoder (el modelo de lenguaje que genera texto), un encoder de vision y un encoder de audio. Cada precision publicada empareja un decoder con una combinacion concreta de encoders, de modo que q4 y q8 estan pensados para CPU (encoders en q8 o fp16, decoder en q4 o q8) y q4f16/q8f16 para GPU (encoders en fp16). Las etiquetas del autor remiten a la familia LFM3, cuyos modelos se describen publicamente como foundation models eficientes para ejecucion en dispositivo, edge y nube, aunque esta ficha no puede confirmar detalles de atencion, capas ni tokenizador.

Tampoco hay datos sobre el entrenamiento: no se indica el numero de tokens, la composicion del corpus, ni si hubo etapas de RLHF o DPO. La model card de esta variante ONNX es puramente de despliegue y delega explicitamente en la del modelo base para "architecture and usage details". En consecuencia, cualquier afirmacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, modos de razonamiento) seria especulativa y no se incluye aqui.

## Capacidades

- Generacion de texto a partir de audio: la tarea declarada del pipeline es audio-text-to-text, es decir, transcripcion, comprension de habla y respuesta en lenguaje natural.
- Procesamiento de imagen: el repositorio incluye un vision_encoder dedicado, por lo que el sistema esta preparado para entradas visuales ademas de audio.
- Entrada multimodal combinada: la separacion en encoders independientes permite alimentar audio e imagen en la misma peticion, segun la logica de integracion del modelo base.
- Multilinguismo: 16 idiomas declarados, con espanol incluido (en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl).
- Inferencia multiplataforma: al estar en ONNX, el mismo grafo puede ejecutarse en CPU x86/ARM, GPU y otros backends compatibles con ONNX Runtime.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, salida de audio o TTS: no disponible en la informacion proporcionada.

## Casos de uso

- Transcripcion y comprension de audio en local: el modelo puede ejecutarse integramente en el dispositivo mediante ONNX Runtime, sin enviar el audio a un servicio externo, lo que resulta adecuado para entornos con requisitos de privacidad (sanidad, legal, administracion publica).
- Asistentes de voz en aplicaciones de escritorio o moviles: con un decoder q4 de 2,45 GB y encoders en CPU, es viable empaquetar un asistente de voz dentro de una aplicacion nativa distribuida a usuarios finales, sin dependencia de una GPU.
- Subtitulado y resumen de reuniones: el encoder de audio mas el decoder permiten transcribir y condensar conversaciones; el caracter multilingue (16 idiomas, incluido espanol) cubre reuniones con participantes internacionales.
- Accesibilidad: descripcion de contenido audiovisual o conversion de voz a texto con respuesta contextual para personas con discapacidad auditiva o visual, ejecutandose en hardware de bajo coste.
- Procesamiento por lotes en CPU en pipelines ETL: al no requerir GPU en las variantes q4 y q8, se pueden levantar varios workers ONNX Runtime en servidores convencionales para procesar grandes volumenes de audio de forma asincrona.
- Analisis de video vigilancia o inspeccion industrial: la combinacion de vision encoder y decoder permite generar descripciones textuales de fotogramas o secuencias, con el audio como canal complementario de anotacion.
- Despliegue en entornos air-gapped o industriales: al ser un artefacto ONNX autocontenido, encaja en instalaciones sin acceso a repositorios de modelos Python ni a servicios en la nube.
- Prototipado rapido de producto multimodal: el reducido tamano (2,20-3,02 GB) permite iterar en portatiles antes de escalar al modelo original o a la API de Liquid AI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta variante ONNX no incluye metricas de calidad (MMLU, HumanEval, GSM8K, WER de ASR u otras) ni comparaciones con modelos de referencia, y remite al modelo base para cualquier dato de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: con la variante q4f16 (2,20 GB de pesos en disco) el modelo cabe en GPUs con 4 GB o mas de memoria; conviene reservar margen adicional para el contexto, el estado de atencion y las activaciones.
- Variantes para CPU: q4 (2,45 GB) y q8 (3,02 GB) estan etiquetadas por el autor como destino CPU; con 8 GB de RAM es razonable ejecutar q4, y con 16 GB, q8.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, la variante q4f16 es apta para RTX 3050/4060 y superiores; el salto a A100/H100 solo tendria sentido por concurrencia y throughput, no por capacidad de encaje.
- Cabe en GPU de consumo: si, la variante q4f16 (2,20 GB) entra en cualquier GPU consumer moderna con 4-8 GB de VRAM.
- Opciones de despliegue: ONNX Runtime es el runtime oficial de este repositorio. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI para esta conversion; habria que consultar el modelo base. Los ficheros se descargan individualmente desde el repositorio (20,1 GB en total, incluyendo todas las precisiones).
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Almacenamiento: el repositorio completo ocupa 20,1 GB; para un despliegue concreto basta con descargar el decoder y los encoders de la precision elegida (2,20-3,02 GB).

## Comparativa con modelos similares

Los datos de las alternativas no se han verificado en esta busqueda y se ofrecen solo como orientacion de categoria; las celdas sin confirmacion se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| d1-Omni-2B-ONNX (este) | ~2B | No disponible | lfm1.0 | ONNX (q4, q8, q4f16, q8f16) | Encoders de vision y audio separados; 16 idiomas |
| d1-Omni-2B | ~2B | No disponible | lfm1.0 | Pesos originales (no confirmado) | Modelo base del que deriva esta conversion |
| Qwen2.5-Omni-3B | 3B | No disponible en esta ficha | Apache-2.0 | No disponible | Alternativa multimodal audio/texto de mayor tamano |
| MiniCPM-o 2.6 | ~8B | No disponible en esta ficha | No disponible | No disponible | Orientado a entrada de audio, imagen y video |
| Gemma 3n | No disponible | No disponible | No disponible | No disponible | Familia con soporte de audio e imagen en dispositivo |

La comparacion relevante en terminos de despliegue no es de calidad sino de empaquetado: d1-Omni-2B-ONNX es de los pocos modelos multimodales de esta categoria publicados con grafos ONNX separados y cuantizaciones listas para CPU, lo que reduce la friccion de integracion frente a alternativas que solo distribuyen pesos en safetensors.

## Limitaciones y advertencias

- Ausencia de datos de evaluacion: no hay benchmarks publicados en la informacion disponible, por lo que la calidad real en ASR, comprension audiovisual o generacion multilingue no puede contrastarse.
- Contexto desconocido: se desconoce la ventana de contexto, lo que impide planificar conversaciones multi-turno largas o procesar audios de duracion extensa sin pruebas previas.
- Riesgo de alucinacion: como cualquier modelo generativo, el decoder puede producir texto plausible pero incorrecto, especialmente en audio con ruido, acentos no cubiertos o idiomas de bajos recursos dentro de los 16 declarados.
- Idiomas: los 16 idiomas estan declarados por el autor, pero no se especifica el soporte relativo de cada uno; el rendimiento en hindi, tailandes, vietnamita o indonesio puede ser inferior al de ingles.
- Licencia lfm1.0: al estar declarada como `license: other` con nombre propio, es imprescindible leer el fichero LICENSE del repositorio antes de cualquier uso comercial; no se asume permisividad tipo Apache-2.0 o MIT.
- Artefacto derivado: es una cuantizacion del modelo base, de modo que hereda sus sesgos y anade la posible perdida de calidad de la cuantizacion q4 (decoder q4 y q4f16).
- Documentacion incompleta en este repositorio: la model card no detalla la API de inferencia, el preprocesado de audio (sample rate, formato) ni el tokenizador; hay que consultar el repositorio del modelo base.
- Soporte de herramientas limitado: no se confirma compatibilidad con ecosistemas como transformers, vLLM o llama.cpp para estos grafos ONNX.
- Fechas del repositorio: creado y actualizado en octubre de 2026, con solo 31 descargas y 5 likes, lo que implica poca validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LiquidAI/d1-Omni-2B-ONNX
- Modelo base: https://huggingface.co/LiquidAI/d1-Omni-2B
- Blog de presentacion de d1: https://www.liquid.ai/blog/open-d1
- Documentacion de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola / API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Sitio de Liquid AI: https://www.liquid.ai/
- Pagina de modelos: https://www.liquid.ai/models
- Organizacion en HuggingFace: https://huggingface.co/LiquidAI
- Wikipedia: https://en.wikipedia.org/wiki/Liquid_AI
