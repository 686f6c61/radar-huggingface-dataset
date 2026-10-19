# elabora/parakeet-tdt-0.6b-v3-onnx

## Resumen

`elabora/parakeet-tdt-0.6b-v3-onnx` es un espejo sin modificaciones del repositorio `istupakov/parakeet-tdt-0.6b-v3-onnx`, que a su vez contiene la exportación a ONNX del modelo de reconocimiento automático del habla **NVIDIA Parakeet TDT 0.6B v3**. El modelo original es propiedad de NVIDIA y se distribuye bajo licencia CC BY 4.0; la conversión a ONNX con cuantización int8 la realizó Ilya Stupakov para su librería [onnx-asr](https://github.com/istupakov/onnx-asr). El espejo lo mantiene Elabora, una herramienta de autoría de módulos de e-learning basada en agentes de IA, que descarga los ficheros en el ordenador del autor y verifica su SHA-256 antes de usarlos.

Se trata de un modelo ASR multilingüe que cubre 25 lenguas europeas (incluidas español, inglés, alemán, francés, italiano, portugués, neerlandés, polaco y las principales lenguas eslavas y bálticas) y que emplea una arquitectura de transductor TDT (Token-and-Duration Transducer) con encoder FastConformer, exportada desde NeMo. El tamaño del checkpoint es de 0,6 mil millones de parámetros y los ficheros int8 ocupan unos 0,65 GB, lo que permite ejecutar la inferencia en CPU con `onnxruntime` sin GPU dedicada.

Su relevancia práctica es doble: por un lado, ofrece reconocimiento de voz multilingüe con pesos abiertos y licencia permisiva (CC BY 4.0, uso comercial permitido con atribución); por otro, el espejo garantiza reproducibilidad byte a byte, algo poco habitual en el ecosistema de modelos, mediante una tabla de hashes SHA-256 publicada junto a los ficheros. La consecuencia inmediata es que se puede empaquetar en aplicaciones de escritorio o en pipelines locales sin depender de que el repositorio upstream permanezca disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor TDT (token-and-duration transducer) con encoder FastConformer, exportado a ONNX desde NVIDIA NeMo |
| Parametros totales | 0,6 mil millones (0.6B, segun el nombre del modelo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa audio en segmentos, no tiene ventana de contexto de texto) |
| Tipos de cuantizacion | int8 para el encoder y para el decoder/joint network; los grafos fp32 del repositorio upstream no se copian en este espejo |
| Idiomas soportados | 25: bg, cs, da, de, el, en, es, et, fi, fr, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, ru, sk, sl, sv, uk |
| Licencia | CC BY 4.0 (Creative Commons Attribution 4.0 International) |
| Formato de pesos | ONNX (grafo de features mel, encoder int8, decoder_joint int8 y vocabulario en texto plano) |

Ficheros incluidos en el espejo, con su tamano y hash SHA-256 tal como los publica el autor:

| Fichero | Tamano (bytes) | SHA-256 |
|---|---:|---|
| `nemo128.onnx` | 139.764 | `a9fde1486ebfcc08f328d75ad4610c67835fea58c73ba57e3209a6f6cf019e9f` |
| `encoder-model.int8.onnx` | 652.183.999 | `6139d2fa7e1b086097b277c7149725edbab89cc7c7ae64b23c741be4055aff09` |
| `decoder_joint-model.int8.onnx` | 18.202.004 | `eea7483ee3d1a30375daedc8ed83e3960c91b098812127a0d99d1c8977667a70` |
| `vocab.txt` | 93.939 | `d58544679ea4bc6ac563d1f545eb7d474bd6cfa467f0a6e2c1dc1c7d37e3c35d` |

## Arquitectura y entrenamiento

La arquitectura es un transductor TDT (Token-and-Duration Transducer), la variante de transducer que predice conjuntamente el token y su duración, sobre un encoder FastConformer. El pipeline se divide en cuatro grafos ONNX: `nemo128.onnx` calcula las features mel de 128 bandas tal como las define NeMo; `encoder-model.int8.onnx` es el encoder acústico cuantizado a int8 (el grueso del modelo, 652 MB); `decoder_joint-model.int8.onnx` contiene el decoder y la red conjunta (joint network) también en int8; y `vocab.txt` mapea los tokens a índices, con el token `<blk>` añadido al final durante la exportación.

La conversión la realizó Ilya Stupakov exportando el checkpoint de NeMo con `nemo_asr.models.ASRModel.from_pretrained("nvidia/parakeet-tdt-0.6b-v3")` y `model.export(...)`, y generando el vocabulario a partir de `model.tokenizer.vocab`. El espejo de Elabora no aplica ninguna transformación adicional: no hay reconversión, reentrenamiento, recompresión ni renombrado de ficheros, y cada fichero es idéntico byte a byte al del upstream en la revisión `8f23f0c03c8761650bdb5b40aaf3e40d2c15f1ce`. No se ha publicado en la información disponible ningún dato sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineamiento o ajuste fino del modelo original de NVIDIA.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en 25 lenguas europeas, con un único modelo multilingüe.
- Salida con puntuación y capitalización generada por el propio modelo, al estar entrenado sobre transcripciones normalizadas (comportamiento estándar de la familia Parakeet; no se detalla en la ficha).
- Alineamiento temporal a nivel de token mediante el mecanismo TDT, que predice duraciones además de tokens.
- Ejecución en CPU: los grafos int8 están pensados para `onnxruntime`, sin necesidad de GPU.
- Integración en aplicaciones de escritorio: Elabora lo usa para transcribir narraciones en el propio ordenador del autor, con decodificación implementada en TypeScript.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto libre: es exclusivamente un modelo acústico.
- Sin capacidades de visión, audio-vision ni traducción: transcribe en el idioma hablado, no traduce.

## Casos de uso

- **Transcripción de narraciones para e-learning**: es el uso declarado del espejo. El autor graba la narración de un módulo, el modelo la transcribe localmente con `onnxruntime` y el texto se usa para generar subtítulos, guiones o material de accesibilidad, sin enviar el audio a ningún servicio externo.
- **Generación de subtítulos multilingües**: al cubrir 25 lenguas con un solo checkpoint, un pipeline puede procesar vídeos en español, polaco o neerlandés sin cambiar de modelo ni de configuración, y emitir ficheros SRT/VTT a partir de las duraciones por token.
- **Actas y notas de reuniones en local**: aplicaciones de escritorio o servidores internos que necesitan transcripciónConfidencial sin salida a la nube pueden ejecutar los grafos int8 en CPU; el tamaño de 0,65 GB permite distribuirlos dentro del propio instalador.
- **Indexación y búsqueda de archivos de audio**: digitalización de un archivo de podcasts o clases grabadas, transcribiendo por lotes en CPU y almacenando el texto para búsqueda full-text posterior.
- **Accesibilidad en tiempo real para vídeo pregrabado**: subtitulado automático de material formativo corporativo con una latencia dominada por el coste del encoder sobre segmentos de audio cortos, ejecutable en el portátil del editor.
- **Pipelines de datos para entrenamiento de otros modelos**: transcripción masiva de corpus de audio europeos para construir datasets de texto alineado, con verificación de integridad por SHA-256 en cada ejecución para garantizar reproducibilidad.
- **Dictado y comandos de voz en aplicaciones**: integración en editores o herramientas de autoría para convertir voz en texto en el idioma del usuario, siempre que la latencia de una pasada completa por el encoder int8 sea aceptable en el hardware objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del espejo no incluye métricas de WER, latencia ni comparaciones cuantitativas con otros modelos, y la búsqueda web realizada no devolvió resultados relevantes.

## Requisitos de hardware

- **VRAM/peso de los ficheros**: los pesos int8 suman aproximadamente 0,67 GB (652 MB del encoder + 18 MB del decoder/joint + 0,14 MB del grafo mel). Es una cifra derivada de los tamaños de fichero publicados, no un dato de la ficha.
- **Memoria en ejecución**: no disponible de forma oficial; hay que sumar al peso de los pesos las activaciones del encoder, que dependen de la longitud del segmento de audio procesado. En la práctica conviene reservar un margen por encima del tamaño de los ficheros.
- **CPU**: es el escenario natural del espejo. `onnxruntime` con las optimizaciones por defecto ejecuta los tres grafos sin GPU. El rendimiento concreto (x veces tiempo real) no está documentado.
- **GPU**: no disponible. Al ser grafos ONNX int8, podrían ejecutarse con `onnxruntime-gpu` o TensorRT, pero no se han publicado requisitos ni números de throughput para A100, H100, RTX 4090 ni otras tarjetas.
- **Cabe en hardware de consumo**: sí, con toda probabilidad, dado que el conjunto de pesos ocupa menos de 1 GB; cualquier equipo con unos pocos GB de RAM libre puede cargarlo. La latencia dependerá de la CPU.
- **Opciones de despliegue**: `onnxruntime` (Python, C++, C#, JS/TS), y la librería [onnx-asr](https://github.com/istupakov/onnx-asr) de la que procede la exportación. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR de este formato.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Parakeet TDT 0.6B v3 (este espejo ONNX int8) | 0,6 B | 25 europeos | CC BY 4.0 | ONNX int8 | Ejecutable en CPU; espejo con hashes verificables |
| `nvidia/parakeet-tdt-0.6b-v3` (original) | 0,6 B | 25 europeos | CC BY 4.0 | NeMo `.nemo` | Requiere el stack NeMo; no es un espejo |
| `istupakov/parakeet-tdt-0.6b-v3-onnx` (upstream del espejo) | 0,6 B | 25 europeos | CC BY 4.0 | ONNX int8 y fp32 | Incluye grafos fp32 y fichero de datos externo que este espejo no copia |
| Whisper large-v3 | 1,55 B | multilingue amplio | licencia abierta de OpenAI | PyTorch, GGUF, ONNX via conversiones | Alternativa de referencia en ASR abierto; no se dispone de comparación de WER en la informacion disponible |

No se dispone de datos de benchmarks que permitan comparar la precision relativa de estos modelos dentro de la informacion proporcionada; la tabla recoge solo caracteristicas estructurales y de licencia.

## Limitaciones y advertencias

- **Cobertura lingüistica acotada**: 25 lenguas europeas. No incluye arabe, chino, japones, coreano, hindi ni la mayoria de lenguas africanas o americanas distintas del espanol y el ingles.
- **No es un modelo generativo de texto**: no admite instrucciones, tool calling ni razonamiento. Cualquier expectativa de uso como LLM es un error de categorizacion.
- **Sesgos acusticos**: no hay informacion publicada sobre sesgos por acento, dialecto, edad o sexo del hablante. En produccion conviene evaluar con muestras representativas del dominio real, especialmente en variedades del espanol distintas de la peninsular.
- **Riesgo de alucinacion en ASR**: como todo modelo de transcripcion, puede producir texto plausible en tramos de silencio, ruido o audio ininteligible. Se recomienda umbral de confianza y deteccion de silencios (VAD) por delante del modelo.
- **Sin datos de robustez**: no se documenta comportamiento con ruido de fondo, solapamiento de hablantes, audio telefónico de banda estrecha ni muestras a frecuencias de muestreo distintas de la esperada por el grafo mel de 128 bandas.
- **Licencia CC BY 4.0**: permite uso comercial, pero exige atribucion a NVIDIA como autor del modelo y a Ilya Stupakov por la conversion a ONNX. No hay clausula de patentes ni garantias; el espejo se distribuye sin garantia de ningun tipo.
- **Dependencia del upstream**: el espejo solo cubre cuatro ficheros. Si se necesitan los grafos fp32 o el fichero de datos externo, hay que acudir al repositorio de istupakov, que es de un particular y podria cambiar o desaparecer.
- **Riesgo de cadena de suministro**: la verificacion SHA-256 es imprescindible; los hashes publicados en la ficha son el unico mecanismo para confirmar que los bytes descargados son los esperados.
- **Mantenimiento**: el repositorio tiene 0 descargas y 0 likes y fue creado el 19 de octubre de 2026, sin actualizaciones posteriores registradas. No es un proyecto con comunidad activa.

## Enlaces

- Espejo en HuggingFace: https://huggingface.co/elabora/parakeet-tdt-0.6b-v3-onnx
- Repositorio upstream en ONNX (Ilya Stupakov): https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Libreria onnx-asr: https://github.com/istupakov/onnx-asr
- Elabora (autor del espejo): https://elabora.studio
- Texto legal de la licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/legalcode

La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
