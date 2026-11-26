# mradermacher/RadarMind-7B-GGUF

## Resumen

RadarMind-7B es un modelo multimodal de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) especializado en teledetección mediante radar de apertura sintética (SAR). El modelo original lo desarrolla el usuario zhtstar, y esta ficha corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles.

El modelo resuelve tareas de visión-lenguaje aplicadas a imágenes SAR: respuesta visual a preguntas (visual question answering) y generación de descripciones de imágenes (image captioning). Se trata de un nicho técnico relevante para aplicaciones de observación de la Tierra, análisis de imágenes satelitales y monitorización medioambiental, donde el SAR permite operar en condiciones de nubosidad o ausencia de luz solar.

La versión GGUF incluye los cuantizados estáticos generados por mradermacher, desde Q2_K hasta f16, además de los ficheros mmproj necesarios para el procesamiento multimodal. El modelo base está publicado con licencia Apache 2.0 y declara soporte únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base zhtstar/RadarMind-7B en la documentación proporcionada. Por el pipeline declarado (visual-question-answering) y las etiquetas (multimodal, sar, remote-sensing), se trata de un modelo visión-lenguaje que combina un codificador de imagen con un modelo de lenguaje, orientado específicamente a imágenes SAR. El repositorio GGUF incluye ficheros mmproj separados, lo que confirma la presencia de un proyector multimodal que traduce representaciones visuales al espacio del modelo de lenguaje.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas más allá del enfoque multimodal especializado en SAR.

## Capacidades

- Respuesta visual a preguntas (VQA) sobre imágenes SAR: interpretación de contenido de imágenes de radar de apertura sintética.
- Generación de descripciones (image captioning) de escenas SAR.
- Procesamiento multimodal imagen-texto en inglés.
- Conversación multi-turno (etiqueta conversational en el modelo base).
- Especialización en teledetección y observación de la Tierra.
- No se ha documentado soporte de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se ha documentado soporte de audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Análisis de imágenes satelitales SAR: el modelo puede responder preguntas en lenguaje natural sobre el contenido de imágenes de radar, útil en centros de procesamiento de datos de observación de la Tierra.
- Monitorización medioambiental: generación automática de descripciones de escenas SAR para detectar cambios en superficies, inundaciones o deforestación, integrable en pipelines de teledetección.
- Etiquetado asistido de datasets: uso del modelo para generar captions preliminares sobre grandes volúmenes de imágenes SAR, reduciendo el trabajo manual de anotación.
- Apoyo a analistas de inteligencia geoespacial: consultas conversacionales sobre imágenes SAR para interpretación rápida de escenas sin requerir expertise profundo en radar.
- Investigación académica en visión-lenguaje para teledetección: modelo de referencia para experimentos de VQA sobre SAR, con cuantizados ligeros que permiten iterar en GPUs de gama media.
- Despliegue en entornos con recursos limitados: gracias a los cuantizados GGUF (desde 3,1 GB en Q2_K), puede ejecutarse en estaciones de trabajo sin GPUs de datacenter para prototipado y pruebas.
- Educación y formación: demostraciones interactivas de interpretación de imágenes SAR en cursos de teledetección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, pesos + overhead del proyector multimodal):
  - Q2_K (~3,1 GB): en torno a 4-5 GB de VRAM.
  - Q4_K_M (~4,8 GB, recomendado): en torno a 6-7 GB de VRAM.
  - Q8_0 (~8,2 GB): en torno a 10-11 GB de VRAM.
  - f16 (~15,3 GB): en torno a 17-18 GB de VRAM.
  - Añadir el fichero mmproj (1,0-1,5 GB) al cómputo total.
- GPU recomendadas: RTX 3060 12 GB o superior para cuantizados Q4/Q5; RTX 4090, A100 o H100 para f16 o despliegues con concurrencia.
- Cabe en GPU de consumo: sí, en Q2_K a Q8_0 según la VRAM disponible; Q4_K_M es viable en GPUs de 8 GB con margen ajustado.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| RadarMind-7B (esta ficha) | ~7,6 B | no disponible | VQA y captioning sobre SAR | Apache 2.0 | GGUF, safetensors |
| Modelos VLM generalistas de ~7B (p. ej. Qwen2-VL-7B, LLaVA-1.6-7B) | ~7-8 B | variable según modelo | Visión-lenguaje general | variable | safetensors, GGUF |
| Modelos de teledetección especializados | no disponible | no disponible | Teledetección óptica/SAR | variable | variable |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparativa se limita a características estructurales; los modelos generalistas de ~7B cubren más dominios pero no están especializados en SAR, mientras que RadarMind-7B sacrifica generalidad por especialización en un dominio técnico concreto.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Dominio restringido: está especializado en imágenes SAR; su rendimiento en imágenes ópticas o tareas de visión general no está documentado y probablemente sea limitado.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar descripciones o respuestas plausibles pero incorrectas sobre el contenido de las imágenes, especialmente en escenas complejas o fuera de distribución.
- Sesgos: no se ha documentado información sobre sesgos en los datos de entrenamiento; en teledetección, los sesgos geográficos y de sensores pueden afectar a la generalización.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base zhtstar/RadarMind-7B y de los datos de entrenamiento subyacentes.
- Cuantizados: los cuantizados de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad en tareas multimodales, donde los errores de representación visual se amplifican.
- Producción: no hay benchmarks publicados ni datos de latencia/throughput, por lo que la validación en el caso de uso concreto es imprescindible antes de desplegar.
- Fecha de publicación futura en los metadatos (2026-11-26): conviene verificar la vigencia y el mantenimiento del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/RadarMind-7B-GGUF
- Modelo base: https://huggingface.co/zhtstar/RadarMind-7B
- Página de descargas del cuantizador: https://hf.tst.eu/model#RadarMind-7B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
