# asincole/parakeet-tdt-0.6b-v3-onnx

## Resumen

Este repositorio contiene una conversión a formato ONNX del modelo NVIDIA Parakeet TDT 0.6B V3, un sistema de reconocimiento automático del habla (ASR) multilingüe de aproximadamente 600 millones de parámetros. La conversión ha sido realizada por el usuario asincole y está pensada para ejecutarse con la librería onnx-asr, lo que permite hacer inferencia de voz a texto sin depender del stack completo de NeMo. El modelo original lo desarrolla NVIDIA y amplía la versión v2 (solo inglés) hasta cubrir 25 idiomas europeos con detección automática de idioma.

La arquitectura es del tipo NeMo Conformer-TDT: un codificador Conformer combinado con un decodificador TDT (Token-and-Duration Transducer), un esquema de transcripción que predice simultáneamente tokens y su duración, lo que acelera la decodificación frente a transductores tradicionales. El resultado es un modelo orientado a transcripción de alto rendimiento y baja latencia, adecuado tanto para audio corto como para dictado de formato largo.

La relevancia de esta ficha concreta reside en el empaquetado ONNX: facilita el despliegue en entornos de producción heterogéneos (CPU, GPU, edge) mediante un runtime portable, sin necesidad de instalar PyTorch ni NeMo. El repositorio ocupa 3,2 GB e incluye los ficheros de pesos exportados y el vocabulario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer-TDT (codificador Conformer + decodificador Token-and-Duration Transducer) |
| Parametros totales | ~600 millones (0,6 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Exportacion ONNX; no se detallan variantes int8/fp16 en la informacion disponible |
| Idiomas soportados | 25 idiomas europeos: en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (model.onnx) mas vocab.txt |

## Arquitectura y entrenamiento

El modelo base nvidia/parakeet-tdt-0.6b-v3 emplea una arquitectura Conformer-TDT de aproximadamente 600 millones de parámetros. El codificador es de tipo Conformer, que combina bloques de autoatención con convoluciones para capturar tanto dependencias globales como patrones locales del espectrograma, algo especialmente útil en voz. El decodificador es un transductor TDT que predice de forma conjunta el token de salida y su duración temporal, lo que reduce el número de pasos de decodificación necesarios en comparación con un transductor convencional y mejora el rendimiento en transcripción de alta demanda.

Según la información disponible, la versión v3 amplía el soporte de idiomas de la v2 desde el inglés hasta 25 idiomas europeos e incorpora detección automática del idioma de entrada. No se detallan en la información proporcionada el número de horas de audio usadas en el entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de ajuste fino con RLHF o DPO (en ASR estos esquemas suelen sustituirse por ajuste supervisado y decodificación con modelo de lenguaje externo). Esta ficha describe específicamente la conversión a ONNX, cuyo proceso de exportación se realiza con NeMo (`ASRModel.from_pretrained(...)` y `model.export(...)`) y genera un `model.onnx` acompañado de un `vocab.txt` con el vocabulario del tokenizador.

## Capacidades

- Transcripcion automatica del habla (speech-to-text) en 25 idiomas europeos.
- Deteccion automatica del idioma de entrada, sin necesidad de indicar el idioma de forma explicita.
- Transcripcion de audio de formato largo orientada a alto rendimiento, segun la descripcion del modelo original.
- Ejecucion de inferencia en formato ONNX mediante la libreria onnx-asr, con backend CPU y GPU.
- Integracion sencilla en Python: carga del modelo con `onnx_asr.load_model("nemo-parakeet-tdt-0.6b-v3")` y transcripcion con `model.recognize("test.wav")`.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision ni audio-vision; se trata de un modelo exclusivamente de ASR.
- No se documenta un modo de razonamiento explicito (thinking mode) ni salida de marcas de tiempo en esta conversion.

## Casos de uso

- Transcripcion de reuniones y actas automaticas: el modelo convierte audio de reuniones en texto y su deteccion automatica de idioma permite tratar sesiones multilingues sin configuracion previa.
- Subtitulado y doblaje de contenido audiovisual: al cubrir 25 idiomas europeos, resulta util para generar subtitulos en plataformas de video con catalogos en varias lenguas.
- Analitica de centros de contacto: transcripcion masiva de llamadas para posterior analisis de sentimiento, cumplimiento normativo o extraccion de temas, aprovechando su orientacion a alto rendimiento.
- Asistentes de voz y dictado: integracion del modelo ONNX en aplicaciones de escritorio o moviles mediante onnx-asr, sin necesidad de desplegar todo el stack de NeMo ni PyTorch.
- Accesibilidad: generacion de transcripciones en tiempo casi real para personas con discapacidad auditiva en entornos educativos o laborales.
- Indexacion y busqueda de archivos de audio: transcripcion de archivos historicos de audio para hacerlos buscables por texto en repositorios documentales.
- Procesamiento por lotes en pipelines de datos: al ser un modelo de 0,6 B de parametros en ONNX, se puede ejecutar en lotes en CPU o GPU para enriquecer grandes volumenes de audio con transcripciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de conversión a ONNX no incluye métricas de WER, MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos; los resultados de referencia deberían consultarse en la model card del modelo original nvidia/parakeet-tdt-0.6b-v3.

## Requisitos de hardware

- El repositorio ocupa 3,2 GB, lo que incluye los ficheros ONNX exportados y el vocabulario; ese tamano da una idea del espacio en disco necesario.
- VRAM estimada para inferencia (valores aproximados, no confirmados en la informacion disponible): en fp32 en torno a 2,5-3 GB; en fp16 en torno a 1,3-1,7 GB; en int8 en torno a 0,8-1 GB.
- Al tratarse de un modelo de 0,6 B de parametros, cabe con holgura en GPU de consumo como RTX 3060, RTX 4070 o RTX 4090, e incluso en GPU integradas o CPU para cargas moderadas.
- Opciones de despliegue documentadas: onnx-asr (CPU y GPU) y, para el modelo original, el ecosistema NeMo. No se documentan en la informacion disponible recetas especificas para vLLM, llama.cpp, Ollama o TGI, ya que es un modelo de ASR y no de generacion de texto.
- Latencia y throughput: no disponible. El modelo original se describe como orientado a transcripcion de alto rendimiento, pero no se aportan cifras concretas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| asincole/parakeet-tdt-0.6b-v3-onnx (esta ficha) | ~0,6 B | no disponible | 25 idiomas europeos | cc-by-4.0 | ONNX via onnx-asr |
| nvidia/parakeet-tdt-0.6b-v3 (modelo base) | ~0,6 B | no disponible | 25 idiomas europeos | cc-by-4.0 | NeMo / PyTorch |
| nvidia/parakeet-tdt-0.6b-v2 | ~0,6 B | no disponible | ingles | no disponible | NeMo / PyTorch |
| OpenAI Whisper large-v3 | ~1,55 B | no disponible | ~99 idiomas | MIT (pesos publicados por OpenAI) | PyTorch, ONNX, whisper.cpp |

Las cifras de parámetros de Whisper corresponden a datos públicos ampliamente conocidos del modelo de OpenAI; los valores de rendimiento comparado (WER) no están disponibles en la información proporcionada y no deben inferirse.

## Limitaciones y advertencias

- Se trata de un modelo de reconocimiento del habla: no genera texto libre, no razona y no ejecuta llamadas a herramientas. Cualquier uso fuera de la transcripcion queda fuera de su alcance.
- No se documentan sesgos concretos en la informacion disponible, pero como todo sistema ASR puede presentar peor rendimiento en acentos no representados en sus datos de entrenamiento, audio con ruido o dominios muy especializados.
- Riesgo de alucinacion en tramos de audio silenciosos, ruidosos o ininteligibles, comun en modelos ASR de tipo transductor; conviene aplicar umbrales de confianza y post-procesado en produccion.
- La cobertura linguistica se limita a 25 idiomas europeos; no se documenta soporte para otras lenguas.
- La licencia cc-by-4.0 permite uso comercial siempre que se atribuya la autoria, pero la conversión ONNX es un trabajo derivado del modelo de NVIDIA y conviene revisar tambien las condiciones del modelo base.
- No hay datos publicados de benchmarks para esta conversion concreta, por lo que las cifras de calidad deben validarse en el dominio de despliegue antes de usar el modelo en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las fechas de creacion y actualizacion son posteriores a las del modelo base; conviene verificar que la conversion esta mantenida.

## Enlaces

- Repositorio de la conversion ONNX: https://huggingface.co/asincole/parakeet-tdt-0.6b-v3-onnx
- Modelo base NVIDIA Parakeet TDT 0.6B V3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Libreria onnx-asr (istupakov): https://github.com/istupakov/onnx-asr
- Conversion ONNX alternativa (W4D): https://huggingface.co/W4D/parakeet-tdt-0.6b-v3-onnx
- Ficha en Inferix de la conversion de istupakov: https://inferix.co/models/istupakov/parakeet-tdt-0.6b-v3-onnx
- Repositorio de inferencia en streaming sobre ONNX: https://github.com/dhyuk54/parakeet-streaming-onnx
- Tutorial de despliegue de Parakeet TDT 0.6B v3: https://aiindigo.com/tutorials/getting-started-with-parakeet-tdt-0-6b-v3-high-efficiency-speech-recognition
