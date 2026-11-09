# mradermacher/Drama-3-Japanese-GGUF

## Resumen

Drama-3-Japanese es un modelo de síntesis de voz (TTS) con capacidades de clonación de voz y generación de habla emocional, especializado exclusivamente en japonés. El modelo original fue desarrollado por el usuario Aratako y esta ficha documenta la versión cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware más modesto mediante llama.cpp y herramientas compatibles. Con 34.676.863.616 parámetros (aproximadamente 34,7 mil millones), se trata de un modelo de gran tamaño para tareas de audio, lo que condiciona significativamente sus requisitos de hardware.

La relevancia de esta versión GGUF radica en que hace accesible un modelo de TTS de gama alta para despliegue local, ofreciendo cuantizaciones desde Q2_K (13 GB) hasta Q8_0 (37 GB), además de ficheros mmproj para el componente multimodal. El modelo se distribuye bajo la licencia fish-audio-community-license, lo que impone restricciones específicas para uso comercial que deben revisarse antes de cualquier despliegue en producción.

Al estar especializado en japonés y en generación de habla con matices emocionales, su nicho de aplicación es claro: doblaje, asistentes de voz en japonés, audiolibros y sistemas de clonación de voz. No es un modelo de propósito general ni un LLM conversacional, sino un sistema de síntesis de voz que transforma texto (y potencialmente referencias de audio) en habla natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz, tags: speech, tts, voice-cloning) |
| Parametros totales | 34.676.863.616 (34,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, más mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | japonés (ja) |
| Licencia | fish-audio-community-license (license: other) |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en transformers |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Los tags indican que se trata de un modelo de síntesis de voz (speech, tts) con capacidades de clonación de voz (voice-cloning) y generación de habla emocional (emotional-speech-generation). El modelo base es Aratako/Drama-3-Japanese, y la versión aquí documentada es una conversión estática a GGUF realizada por mradermacher mediante su pipeline de cuantización (quantize_version 2, output_tensor_quantised 1, convert_type hf).

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal. La presencia de ficheros mmproj (multi-modal supplement) sugiere que el modelo incorpora un componente multimodal, probablemente para el procesamiento de referencias de audio en tareas de clonación de voz, aunque no se detalla su función exacta.

## Capacidades

- Síntesis de voz (text-to-speech) en japonés: genera habla natural a partir de texto de entrada.
- Clonación de voz: capacidad de replicar características vocales a partir de muestras de referencia, según los tags del modelo.
- Generación de habla emocional: el modelo está etiquetado para producir habla con matices emocionales, lo que permite variar la entonación y expresividad.
- Procesamiento multimodal: la presencia de ficheros mmproj indica soporte para entradas adicionales (probablemente audio de referencia), aunque no se detalla su funcionamiento exacto.
- Especialización monolingüe: optimizado exclusivamente para japonés (ja).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso, dado que no es un LLM conversacional.

## Casos de uso

- Doblaje y localización de contenido audiovisual al japonés: el modelo puede generar voces sintéticas con carga emocional para series, películas o vídeos, y la clonación de voz permite mantener la identidad vocal de un actor original si se dispone de muestras autorizadas.
- Audiolibros y narración automatizada en japonés: la generación de habla emocional permite narrar con entonación variable, adecuada para ficción y contenido educativo, ejecutando el modelo localmente con cuantizaciones Q4 o Q5.
- Asistentes de voz para aplicaciones japonesas: integración en sistemas de atención al cliente o interfaces conversacionales en japonés, donde la naturalidad y el matiz emocional mejoran la experiencia de usuario.
- Accesibilidad y lectura de textos: conversión de documentos, artículos o notificaciones a voz para usuarios con discapacidad visual, con despliegue en servidores propios gracias al formato GGUF.
- Creación de contenido para redes sociales y pódcast: generación de voces sintéticas para vídeos cortos, anuncios o pódcast en japonés, con la posibilidad de clonar una voz de marca previamente autorizada.
- Prototipado de productos de voz en investigación: investigadores que necesiten un TTS japonés de alta calidad para experimentos de prosodia, emoción o clonación pueden usar las distintas cuantizaciones para ajustar el equilibrio entre calidad y requisitos de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 13 GB (Q2_K) y 37 GB (Q8_0) solo para los pesos; hay que añadir overhead de contexto y del componente mmproj (1,8 GB para Q8_0 o 3,0 GB para f16).
- GPU recomendadas: para Q8_0 o Q6_K se recomienda A100 40/80 GB, H100 o RTX 6000 Ada; para Q4_K_M (21,3 GB) es viable en RTX 4090 (24 GB) o A6000 (48 GB).
- Cabe en consumer GPU: sí, en RTX 4090/3090 (24 GB) con cuantizaciones Q4_K_S, Q4_K_M o Q5_K_S; en GPUs de 16 GB solo con Q2_K o Q3_K_S y renunciando a calidad. En GPUs de 12 GB o menos no es viable en VRAM completa.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, koboldcpp); el modelo base es de transformers, por lo que también puede ejecutarse con la librería original si se dispone de los pesos sin cuantizar.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dependerán del hardware, la cuantización y la longitud del audio generado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, el modelo base Aratako/Drama-3-Japanese es la alternativa directa en formato transformers, y esta versión GGUF se diferencia por su formato cuantizado y su orientación a despliegue local. No se dispone de datos de benchmarks ni de otros modelos TTS japoneses en la información disponible para establecer una comparación cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Drama-3-Japanese (GGUF, este) | 34,7 B | no disponible | fish-audio-community-license | GGUF |
| Aratako/Drama-3-Japanese (base) | 34,7 B | no disponible | fish-audio-community-license | transformers |
| Otros modelos TTS japoneses | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado para japonés, puede reflejar sesgos presentes en los datos de entrenamiento vocal.
- Riesgo de alucinación: en TTS el riesgo se traduce en prosodia incorrecta, pronunciaciones erróneas o artefactos de audio, especialmente con cuantizaciones agresivas (Q2_K, Q3_K).
- Limitaciones de idioma: soporta únicamente japonés; no se debe esperar calidad en otros idiomas.
- Restricciones de licencia: la fish-audio-community-license es una licencia "other" con condiciones específicas; es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial, ya que puede imponer restricciones de atribución, límites de ingresos o prohibiciones de uso.
- Caveat de producción: las cuantizaciones estáticas de mradermacher no incluyen versiones weighted/imatrix en el momento de la publicación, lo que puede afectar ligeramente a la calidad frente a cuantizaciones imatrix.
- Tamaño elevado: 34,7 B de parámetros implican requisitos de hardware considerables; el despliegue en entornos con recursos limitados exigirá cuantizaciones bajas con la consiguiente pérdida de calidad.
- Clonación de voz: requiere consentimiento explícito de la persona cuya voz se clona y cumple con la normativa aplicable sobre deepfakes y suplantación de identidad.

## Enlaces

- Hugging Face (versión GGUF): https://huggingface.co/mradermacher/Drama-3-Japanese-GGUF
- Modelo base: https://huggingface.co/Aratako/Drama-3-Japanese
- Página de descargas del cuantizador: https://hf.tst.eu/model#Drama-3-Japanese-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Análisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
