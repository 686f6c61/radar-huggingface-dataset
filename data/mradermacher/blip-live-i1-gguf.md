# mradermacher/BLIP-Live-i1-GGUF

## Resumen

BLIP-Live es un modelo multimodal de vision y video orientado a procesamiento en streaming, desarrollado originalmente por Salesforce Research. El repositorio que nos ocupa, `mradermacher/BLIP-Live-i1-GGUF`, es una cuantizacion en formato GGUF del modelo original `Salesforce/BLIP-Live`, publicada por el usuario mradermacher el 24 de noviembre de 2026. El modelo base cuenta con 35.505.251.456 parametros (aproximadamente 35,5 mil millones) segun los datos de safetensors del repositorio original, lo que lo situa en la categoria de modelos de gran tamano para tareas de vision-lenguaje.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de 35B parametros en hardware mas modesto mediante cuantizacion (desde Q2_K hasta Q6_K), algo especialmente util para tareas de analisis de video en tiempo real o semi-tiempo real donde el rendimiento y el consumo de VRAM son criticos. El modelo esta disenado para conversaciones multimodales con entrada de video en streaming, una capacidad poco comun en el ecosistema open source.

La licencia CC-BY-NC-4.0 restringe el uso comercial, lo que limita su aplicacion en produccion sin autorizacion expresa. El repositorio incluye 22 variantes de cuantizacion con tamanos que van desde 13,3 GB (Q2_K) hasta 29,3 GB (Q6_K), ademas de un archivo imatrix para generar cuantizaciones personalizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), segun tags del modelo base; detalles especificos no disponibles |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, ademas de imatrix |
| Idiomas soportados | ingles (segun model card del autor) |
| Licencia | cc-by-nc-4.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `Salesforce/BLIP-Live`. Los tags del repositorio indican que se trata de un modelo de vision-lenguaje ("vision model", "video", "streaming", "merged") construido sobre transformers. El termino "merged" sugiere que el modelo base podria haber sido fusionado a partir de componentes separados (posiblemente un encoder visual y un decoder de lenguaje), aunque no se confirma en la documentacion proporcionada.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. El articulo referenciado (arXiv:2611.21553) aparece en los tags pero su contenido no esta disponible en la informacion proporcionada. La cuantizacion i1 (imatrix) de mradermacher utiliza una matriz de importancia para preservar mejor la calidad en tasas de compresion agresivas.

## Capacidades

- Generacion de texto conversacional multimodal: el modelo acepta entradas de vision (imagenes y video) y produce respuestas textuales.
- Procesamiento de video en streaming: capacidad destacada segun los tags del repositorio ("streaming", "video"), orientada a analisis de flujos continuos.
- Comprension visual: descripcion de imagenes, respuesta a preguntas sobre contenido visual.
- Conversacion multi-turno: tag "conversational" indica soporte para dialogos.
- Compatibilidad con endpoints: tag "endpoints_compatible" sugiere integracion con infraestructura de inferencia estandar.
- Capacidades de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles segun la model card.
- Capacidades de audio: no disponible.

## Casos de uso

- Analisis de video en tiempo real: el modelo puede procesar flujos de video continuos para generar descripciones o responder preguntas sobre lo que ocurre en la escena, gracias a su orientacion a streaming. Adecuado para monitorizacion de seguridad o accesibilidad.
- Moderacion de contenido audiovisual: integrado en pipelines que reciben frames de video, el modelo puede clasificar y describir contenido para detectar material inapropiado, aprovechando su capacidad de vision-lenguaje.
- Asistencia a personas con discapacidad visual: descripcion de escenas en directo a partir de una camara, con respuestas conversacionales en ingles.
- Transcripcion semantica de reuniones: analisis de video de videoconferencias para generar resumenes de lo mostrado en pantalla (presentaciones, pizarras) combinado con el audio transcrito por otro sistema.
- Etiquetado automatico de archivos multimedia: procesamiento por lotes de bibliotecas de video para generar metadatos descriptivos y facilitar la busqueda.
- Investigacion en vision-lenguaje: uso como modelo de referencia cuantizado para experimentos academicos sin acceso a clusters de GPU de gran capacidad, gracias a las variantes Q4_K_M (21,8 GB) y Q5_K_M (25,4 GB).
- Prototipado de agentes visuales: desarrollo de asistentes que interpretan pantallas o camaras en entornos de prueba, con la limitacion de que el uso comercial requiere licencia adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 13,3 GB (Q2_K) y 29,3 GB (Q6_K) solo para los pesos; anadir overhead de contexto y del proyector multimodal (mmproj), que se encuentra en el repositorio estatico `mradermacher/BLIP-Live-GGUF`.
- GPU recomendadas: para Q4_K_M (21,8 GB) se necesita al menos una RTX 3090/4090 (24 GB) o A6000; para Q6_K (29,3 GB) se requiere A100 40GB, A6000 48GB o H100.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4_K_S, Q4_K_M o IQ4_XS; en GPUs de 16 GB solo caben Q2_K (13,3 GB) con contexto reducido; en 12 GB no es viable sin offloading a CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (previa importacion del GGUF), y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este tipo de modelo multimodal, por lo que se requeriria el modelo en safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BLIP-Live-i1-GGUF (este) | 35,5B | no disponible | CC-BY-NC-4.0 | GGUF | Video streaming, solo ingles, cuantizado |
| Salesforce/BLIP-Live (base) | 35,5B | no disponible | CC-BY-NC-4.0 | safetensors | Modelo original sin cuantizar |
| Qwen2.5-VL-32B | 32B | 128K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Multimodal, multilingue, uso comercial permitido |
| InternVL2.5-38B | 38B | no disponible | MIT (segun publicacion de InternVL) | safetensors | Vision-lenguaje de gran tamano, uso comercial |

La comparativa con Qwen2.5-VL e InternVL2.5 se ofrece como referencia de categoria (modelos vision-lenguaje de ~30-40B), pero no se dispone de datos de rendimiento comparativo directo con BLIP-Live en la informacion proporcionada. La principal desventaja de BLIP-Live frente a estas alternativas es la licencia no comercial y el soporte limitado a ingles.

## Limitaciones y advertencias

- Licencia CC-BY-NC-4.0: prohibido el uso comercial sin autorizacion expresa del titular de los derechos (Salesforce). Esto descarta su uso en productos o servicios de pago.
- Solo soporta ingles segun la model card; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion inherente a los modelos de lenguaje y vision-lenguaje: las descripciones de video o imagenes pueden contener elementos inexistentes.
- Sesgos conocidos: no documentados en la informacion disponible, pero previsibles en modelos entrenados con datos web (sesgos demograficos, culturales y de genero).
- Limitaciones de contexto: la longitud de contexto no esta especificada, lo que dificulta planificar el procesamiento de videos largos.
- La cuantizacion Q2_K (13,3 GB) degrada notablemente la calidad; el propio autor recomienda IQ3_XXS o superiores.
- El repositorio tiene solo 1 like y 1221 descargas, lo que sugiere validacion comunitaria limitada.
- Los archivos mmproj (proyector multimodal) no estan en este repositorio sino en el estatico `mradermacher/BLIP-Live-GGUF`; es necesario descargarlos por separado para la inferencia multimodal.
- El modelo base fue publicado originalmente por Salesforce; mradermacher solo realiza la cuantizacion, sin garantias adicionales sobre el comportamiento del modelo.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/BLIP-Live-i1-GGUF
- Repositorio de cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/BLIP-Live-GGUF
- Modelo base: https://huggingface.co/Salesforce/BLIP-Live
- Pagina de descargas del autor: https://hf.tst.eu/model#BLIP-Live-i1-GGUF
- Articulo referenciado en tags: arXiv:2611.21553 (contenido no disponible en la informacion proporcionada)
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
