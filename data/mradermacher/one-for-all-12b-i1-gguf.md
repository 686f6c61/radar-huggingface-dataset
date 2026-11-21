# mradermacher/One-For-All-12B-i1-GGUF

## Resumen

One-For-All-12B-i1-GGUF es una colección de cuantizaciones GGUF, generadas con imatrix, del modelo TendieLabs/One-For-All-12B. El trabajo lo firma mradermacher, un conocido publicador de cuantizaciones de la comunidad, y se distribuye bajo licencia Apache 2.0 con enlace a la licencia de Gemma 4. El modelo base es un ajuste fino con LoRA orientado a persona y roleplay, construido sobre un transformer de la familia Gemma 4, con aproximadamente 11.900 millones de parámetros.

El modelo resuelve un problema muy concreto: ofrecer una versión ejecutable en hardware de consumo de un modelo de rol conversacional especializado en el personaje "One For All" del universo de My Hero Academia. Al tratarse de un fan-model con etiquetas de persona y roleplay, su interés no está en tareas de razonamiento general, sino en mantener una identidad de personaje coherente en conversaciones multi-turno. La relevancia actual viene de la disponibilidad de cuantizaciones i1 (imatrix) que reducen el peso desde unos 24 GB en FP16 hasta 3-10 GB según el nivel de compresión.

La ficha se centra en el artefacto GGUF publicado por mradermacher, no en el modelo base original, del que solo se dispone de la referencia. No hay información pública sobre el pipeline, los idiomas soportados más allá del inglés declarado ni resultados de benchmarks, por lo que muchos apartados se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, según etiqueta `gemma4`) |
| Parámetros totales | 11.907.350.576 (11,9 B) |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | inglés (declarado en la model card); resto no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | GGUF (imatrix/i1); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base TendieLabs/One-For-All-12B es un ajuste fino mediante LoRA sobre un modelo de la familia Gemma 4, según la etiqueta `gemma4` y la referencia a la licencia de Gemma 4 en la model card. Se trata, por tanto, de un transformer decoder-only de aproximadamente 11,9 mil millones de parámetros, adaptado con un adaptador LoRA para adoptar la persona del personaje "One For All" de My Hero Academia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La contribución del repositorio que nos ocupa no es el entrenamiento, sino la cuantización. mradermacher aplica cuantización con imatrix (matriz de importancia) para producir el conjunto i1, que incluye tanto variantes IQ (con cuantización de pesos de tipo importance-aware) como variantes K-quant clásicas. El repositorio incluye además el fichero imatrix (`One-For-All-12B.imatrix.gguf`, 0,1 GB) para que terceros puedan generar sus propias cuantizaciones. No se documentan innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, orientada a mantener la persona del personaje One For All.
- Roleplay multi-turno: la model card etiqueta explícitamente el modelo como `persona` y `roleplay`.
- Coherencia de personaje mediante ajuste LoRA sobre el modelo base.
- Fan-model del universo My Hero Academia, con conocimiento esperable de ese dominio.
- No hay evidencia de soporte de tool calling ni function calling en la información disponible.
- No hay evidencia de capacidades de agente o razonamiento multi-paso avanzado.
- No hay evidencia de capacidades de visión, audio o modo "thinking".
- Capacidades multilingües: solo se declara inglés; el resto no está documentado.

## Casos de uso

- Roleplay de personaje en aplicaciones de chat: el modelo mantiene la identidad de One For All en conversaciones multi-turno, adecuado para demos interactivas o bots temáticos con una cuantización i1-Q4_K_M de 7,5 GB.
- Prototipado de personajes con LoRA: al estar construido sobre un adaptador LoRA, sirve como referencia para estudiar cómo se comporta una persona ajustada sobre Gemma 4 antes de entrenar variantes propias.
- Despliegue local en hardware de consumo: las cuantizaciones de 3-5 GB (i1-IQ1_S a i1-IQ3_S) permiten ejecutar el modelo en GPUs de gama media o incluso en CPU con llama.cpp, útil para pruebas offline sin coste de API.
- Generación de diálogos para fan-fiction y guiones: el ajuste de persona permite producir réplicas con estilo consistente del personaje, aprovechable en herramientas de escritura asistida.
- Evaluación de cuantizaciones: el repositorio ofrece 24 variantes de cuantización más el fichero imatrix, lo que lo convierte en un banco de pruebas para medir la degradación de calidad entre IQ1 y Q6_K en un modelo de 12 B.
- Investigación sobre sesgos en fan-models: al ser un modelo de personaje entrenado sobre material con derechos de autor de terceros, sirve para estudiar cómo se comportan los ajustes LoRA de personajes en tareas abiertas y qué riesgos de alucinación de identidad presentan.
- Integración en pipelines de inferencia locales: compatible con llama.cpp, Ollama y otros runners GGUF, lo que facilita su inclusión en entornos de desarrollo sin dependencias de nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 3,1 GB (i1-IQ1_S) y 9,9 GB (i1-Q6_K), según la tabla de cuantizaciones del repositorio; el fichero imatrix ocupa 0,1 GB y no es un modelo ejecutable.
- GPU recomendadas: no hay datos específicos del autor. Por tamaño, una RTX 4090 (24 GB) ejecuta cualquier cuantización con holgura; una RTX 3060 de 12 GB cubre hasta i1-Q6_K; una GPU de 8 GB cubre hasta i1-Q4_K_M (7,5 GB) con margen ajustado.
- Cabe en GPU de consumo: sí, desde i1-IQ1_S (3,1 GB) hasta i1-Q6_K (9,9 GB) en tarjetas de 8-12 GB o superiores.
- Opciones de despliegue: llama.cpp y cualquier runner compatible con GGUF (Ollama, LM Studio, entre otros). No se documenta soporte para vLLM o TGI en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| One-For-All-12B-i1-GGUF | 11,9 B | no disponible | Apache 2.0 (Gemma 4) | GGUF i1 | Fan-model de rol, cuantizaciones imatrix de 3,1 a 9,9 GB |
| TendieLabs/One-For-All-12B | 11,9 B | no disponible | Apache 2.0 (Gemma 4) | safetensors | Modelo base sin cuantizar; referencia del anterior |
| mradermacher/One-For-All-12B-GGUF | 11,9 B | no disponible | Apache 2.0 (Gemma 4) | GGUF estático | Cuantizaciones estáticas del mismo modelo base, sin imatrix |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de rol y persona: no está diseñado para tareas de razonamiento general, código o matemáticas, y su rendimiento en ellas no está documentado.
- Riesgo de alucinación elevado en dominios ajenos al personaje; al ser un fan-model, puede mezclar información canónica con contenido inventado.
- Sesgos conocidos: no documentados por el autor; al derivar de un ajuste LoRA sobre Gemma 4, hereda los sesgos del modelo base, que tampoco se detallan.
- Idiomas: solo se declara inglés; el comportamiento en castellano no está verificado.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide planificar conversaciones largas con garantías.
- Licencia: Apache 2.0 con enlace a la licencia de Gemma 4; conviene revisar las condiciones de uso comercial de Gemma 4 antes de desplegar en producción, ya que la model card remite a dicha licencia.
- Propiedad intelectual: el modelo se basa en el personaje One For All de My Hero Academia, franquicia de terceros; el uso comercial del personaje puede estar restringido independientemente de la licencia del modelo.
- Las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "mostly desperate".
- No hay información sobre latencia, throughput ni estabilidad en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/One-For-All-12B-i1-GGUF
- Modelo base: https://huggingface.co/TendieLabs/One-For-All-12B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/One-For-All-12B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#One-For-All-12B-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
