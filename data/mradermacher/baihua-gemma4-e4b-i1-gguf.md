# mradermacher/Baihua-Gemma4-E4B-i1-GGUF

## Resumen
Baihua-Gemma4-E4B-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo Roland-Wayne/Baihua-Gemma4-E4B, un ajuste fino mediante LoRA sobre una base de la familia Gemma 4. El modelo original está especializado en escritura en chino y transferencia de estilo, y este repositorio ofrece los pesos en formato GGUF con cuantizaciones ponderadas mediante imatrix, pensadas para su uso con llama.cpp y herramientas compatibles.

El repositorio incluye un conjunto amplio de cuantizaciones que van desde IQ1_S (3,4 GB) hasta Q6_K (6,3 GB), lo que permite desplegar el modelo en hardware muy variado, desde GPUs de consumo con poca VRAM hasta estaciones de trabajo. El modelo cuenta con 7.463.013.674 parámetros totales según los safetensors del modelo base, y está publicado bajo licencia Apache 2.0.

La relevancia actual de esta ficha radica en que ofrece una vía práctica para ejecutar localmente un modelo especializado en escritura china sin necesidad de infraestructura de servidor, aunque con las limitaciones propias de un ajuste fino de nicho y de la información pública disponible, que es escasa en cuanto a benchmarks y detalles de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4; detalles de arquitectura no publicados en la información disponible) |
| Parámetros totales | 7.463.013.674 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, Q2_K_S, Q2_K, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (además de fichero imatrix) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en formato transformers/safetensors y bf16 |

## Arquitectura y entrenamiento
No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. El nombre del modelo (Gemma4-E4B) sugiere una base de la familia Gemma 4, y los tags indican el uso de LoRA para el ajuste fino, con el modelo base Roland-Wayne/Baihua-Gemma4-E4B entrenado presumiblemente en bf16. El repositorio de cuantizaciones no incluye detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable de este repositorio es el uso de cuantizaciones ponderadas con imatrix (i1), que mejoran la calidad de las cuantizaciones de baja precisión respecto a las cuantizaciones estáticas. El autor proporciona además el fichero imatrix para que otros puedan generar sus propias cuantizaciones. No se documentan técnicas como decodificación especulativa o atención lineal en la información disponible.

## Capacidades
- Generación de texto en chino, orientada a escritura creativa y transferencia de estilo.
- Ajuste fino mediante LoRA sobre una base Gemma 4, lo que sugiere capacidad de conversación y generación general heredada del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al chino según los metadatos del modelo (language: zh).
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso
- Escritura creativa en chino: el modelo puede generar textos con estilo controlado gracias a su ajuste fino en transferencia de estilo, adecuado para redacción de ficción, artículos o contenido editorial en chino.
- Transferencia de estilo literario: útil para reescribir textos existentes manteniendo un registro o voz concreta, aprovechando el entrenamiento específico en style-transfer.
- Asistencia a la redacción periodística en chino: puede ayudar a redactar borradores y variantes estilísticas de noticias o crónicas, con revisión humana posterior.
- Generación de contenido para blogs y redes en chino: el modelo permite producir textos con un tono consistente, útil para equipos de contenido que trabajan en ese idioma.
- Prototipado local de aplicaciones de escritura: gracias a las cuantizaciones GGUF de 3,4 a 6,3 GB, se puede desplegar en un portátil con GPU de consumo para pruebas de concepto sin depender de la nube.
- Investigación en ajuste fino y cuantización: el repositorio sirve como caso de estudio para evaluar el impacto de las cuantizaciones i1 con imatrix en un modelo de 7,4 mil millones de parámetros especializado en un dominio concreto.
- Educación y experimentación con modelos Gemma: útil para quienes quieren explorar la familia Gemma 4 en entornos con recursos limitados y en tareas de escritura en chino.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 3,4 GB para IQ1_S, 4,5 GB para Q2_K, 5,4 GB para Q4_K_M y 6,3 GB para Q6_K, sin contar el overhead de contexto y del runtime.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) con margen amplio.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs con 6 GB o más de VRAM para cuantizaciones medias; las cuantizaciones IQ1/IQ2 podrían caber en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, text-generation-webui, entre otras); no se documentan opciones como vLLM o TGI para este formato.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Baihua-Gemma4-E4B-i1-GGUF (este) | 7.463.013.674 | no disponible | Apache 2.0 | GGUF | Especializado en escritura y estilo en chino; cuantizaciones i1 con imatrix |
| mradermacher/Baihua-Gemma4-E4B-GGUF | no disponible | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas del mismo modelo base, sin imatrix |
| Roland-Wayne/Baihua-Gemma4-E4B | no disponible | no disponible | Apache 2.0 | transformers/safetensors | Modelo base original en bf16, sin cuantizar |
| Gemma 4 (base genérica) | no disponible | no disponible | no disponible | no disponible | Modelo generalista del que deriva; no especializado en chino ni en estilo |

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la información disponible; al ser un ajuste fino sobre un modelo base, puede heredar sesgos del corpus de entrenamiento original.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo, puede producir contenido factualmente incorrecto, especialmente en tareas fuera de su dominio de especialización.
- Limitaciones de contexto o idioma: el modelo está orientado al chino (zh) y no se documenta soporte para otros idiomas; la longitud de contexto no está disponible.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial con atribución y sin garantías; conviene revisar los términos del modelo base original.
- Caveats para producción: las cuantizaciones de baja precisión (IQ1, IQ2, Q2_K) degradan la calidad de forma notable según las notas del propio autor; para producción se recomienda Q4_K_M o superior. El repositorio tiene un tamaño de 111 GB por incluir todas las variantes, por lo que conviene descargar solo el fichero necesario.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mradermacher/Baihua-Gemma4-E4B-i1-GGUF
- Modelo base: https://huggingface.co/Roland-Wayne/Baihua-Gemma4-E4B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Baihua-Gemma4-E4B-GGUF
- Página de descarga del autor: https://hf.tst.eu/model#Baihua-Gemma4-E4B-i1-GGUF
- README de referencia para GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
