# mradermacher/Ficus-1.0-12B-GGUF

## Resumen

Ficus-1.0-12B es un modelo multimodal desarrollado por AuroraSystem que combina capacidades de vision, audio y razonamiento en una unica arquitectura de aproximadamente 11.900 millones de parametros. Esta ficha cubre la version cuantizada en formato GGUF publicada por mradermacher, un conocido generador de cuantizaciones de la comunidad, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo se construye sobre la familia Gemma (etiquetado como "gemma4" en los tags del repositorio), lo que sugiere una base derivada de los transformers de Google adaptada por AuroraSystem para incorporar modalidades adicionales de vision y audio. Los tags indican soporte para vision-language, audio, multimodal y reasoning, ademas de un dataset propio denominado ABench75 para evaluacion.

La relevancia de esta publicacion radica en que ofrece una via practica de desplegar un modelo multimodal de ~12B en equipos locales gracias a las cuantizaciones que van desde 4,9 GB (Q2_K) hasta 12,8 GB (Q8_0), con ficheros mmproj separados para las capacidades multimodales. La licencia es la de Gemma, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Gemma (tag "gemma4"); detalles no disponibles |
| Parametros totales | 11.907.350.576 (~11,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en f16 y Q8_0 |
| Idiomas soportados | Ruso (ru) e ingles (en) segun la model card |
| Licencia | Gemma (license: other, license_name: gemma) |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en el repo base AuroraSystem/Ficus-1.0-12B |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de los tags, que apuntan a una base Gemma de cuarta generacion ("gemma4") con extensiones multimodales para vision y audio. El modelo es de tipo transformer denso de ~11,9B parametros (no se menciona mezcla de expertos). La presencia de ficheros mmproj separados en las cuantizaciones confirma la existencia de un proyector multimodal que se carga junto al modelo principal para procesar entradas de imagen y audio.

No se han publicado en la informacion proporcionada datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El unico dataset referenciado es AuroraSystem/ABench75, que parece ser un conjunto de evaluacion mas que de entrenamiento. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. Las cuantizaciones estaticas de mradermacher se generaron con quantize_version 2 y output_tensor_quantised 1, y existe una variante con imatrix (i1-GGUF) en un repositorio separado.

## Capacidades

- Generacion de texto y razonamiento conversacional (tag "reasoning" y "conversational").
- Procesamiento de vision: el modelo es vision-language, con proyector multimodal (mmproj) que permite entrada de imagenes.
- Procesamiento de audio: el tag "audio" indica soporte de entrada de audio.
- Capacidades multimodales combinadas: vision, audio y texto en un mismo modelo.
- Multilinguee limitado: ruso e ingles segun la model card.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- No se documenta explicitamente soporte de tool calling, function calling ni razonamiento multi-paso con agentes; no disponible.

## Casos de uso

- Asistencia conversacional multilinguee (ruso/ingles): el modelo puede gestionar dialogos multi-turno en estos dos idiomas, adecuado para aplicaciones dirigidas a esos mercados.
- Analisis de imagenes con descripcion textual: gracias al proyector multimodal, se puede usar para generar descripciones, responder preguntas sobre imagenes o extraer informacion visual en flujos de trabajo locales.
- Transcripcion y comprension de audio: el soporte de audio permite integrar el modelo en pipelines de procesamiento de voz, como resumen de reuniones o analisis de contenido hablado.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_S y Q4_K_M (7,1 y 7,5 GB) permiten ejecutar el modelo en GPUs consumer con 8-12 GB de VRAM via llama.cpp u Ollama.
- Prototipado de aplicaciones multimodales: investigadores pueden evaluar rapidamente un modelo de ~12B con vision y audio sin infraestructura de datacenter, usando Q5_K_M o Q6_K para mayor fidelidad.
- Educacion e investigacion en IA multimodal: util para estudiar el comportamiento de modelos Gemma extendidos con modalidades adicionales, comparando cuantizaciones y su impacto en calidad.
- Procesamiento de documentos con imagenes y texto en ruso: combinacion de OCR visual y razonamiento textual en un unico modelo para entornos donde el ruso es prioritario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,9 GB
  - Q3_K_M: ~6,2 GB
  - IQ4_XS: ~6,8 GB
  - Q4_K_M: ~7,5 GB
  - Q5_K_M: ~8,6 GB
  - Q6_K: ~9,9 GB
  - Q8_0: ~12,8 GB
  - Anadir ~0,2-0,3 GB para el proyector mmproj si se usan modalidades visuales/audio.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090 para cuantizaciones Q4-Q8; A100/H100 para despliegues de mayor throughput o cuantizaciones superiores.
- Cabe en GPU consumer: si. Q4_K_M (~7,5 GB) entra en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores. Q8_0 (~12,8 GB) requiere 16 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI. La version original (safetensors) puede servirse con vLLM o TGI si soportan la arquitectura Gemma multimodal.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Ficus-1.0-12B (esta ficha) | ~11,9B | no disponible | Vision + audio | Gemma | GGUF, safetensors |
| Gemma 3 12B (referencia de familia) | ~12B | no disponible | Vision | Gemma | safetensors, GGUF |
| Qwen2.5-VL 7B | ~7B | no disponible | Vision | Apache 2.0 (segun version) | safetensors, GGUF |
| Llama 3.2 11B Vision | ~11B | no disponible | Vision | Llama 3.2 | safetensors, GGUF |

Nota: los datos de los modelos comparables se incluyen como referencia de categoria; no se dispone de comparaciones de rendimiento publicadas para Ficus-1.0-12B en la informacion proporcionada. La distincion principal de Ficus es la inclusion de audio ademas de vision, algo poco comun en modelos de este tamano.

## Limitaciones y advertencias

- Idiomas limitados: solo ruso e ingles documentados; el rendimiento en castellano no esta garantizado ni evaluado.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribucion; revisar los terminos de la Gemma License antes de desplegar en produccion.
- Riesgo de alucinacion: inherente a modelos de este tamano; no se han publicado evaluaciones de fidelidad factual.
- Ausencia de benchmarks publicados: no hay datos verificables de MMLU, HumanEval, GSM8K ni evaluaciones multimodales en la informacion disponible, lo que dificulta comparar su calidad real.
- Modelo derivado de la comunidad: al ser una adaptacion de AuroraSystem sobre base Gemma, puede heredar sesgos y limitaciones del modelo original, ademas de posibles degradaciones por el entrenamiento multimodal adicional.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S pueden degradar notablemente el rendimiento; se recomienda Q4_K_M o superior para uso practico.
- Soporte de tool calling y agentes no documentado: no asumir su disponibilidad sin validacion previa.
- Fecha de publicacion futura (2026-11-18): verificar la vigencia y el estado de mantenimiento del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Ficus-1.0-12B-GGUF
- Modelo base: https://huggingface.co/AuroraSystem/Ficus-1.0-12B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Ficus-1.0-12B-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Ficus-1.0-12B-GGUF
- Dataset de evaluacion: https://huggingface.co/datasets/AuroraSystem/ABench75
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
