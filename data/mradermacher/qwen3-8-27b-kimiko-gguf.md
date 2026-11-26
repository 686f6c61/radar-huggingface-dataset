# mradermacher/Qwen3.8-27B-Kimiko-GGUF

## Resumen

Qwen3.8-27B-Kimiko-GGUF es una colección de cuantizaciones en formato GGUF del modelo nlpguy/Qwen3.8-27B-Kimiko, un merge de modelos de la familia Qwen3 con aproximadamente 26.900 millones de parámetros. El trabajo de cuantización lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, y está pensado para facilitar la inferencia local en hardware de consumo mediante llama.cpp y derivados.

El modelo original se ha generado con mergekit, la herramienta estándar para combinar pesos de varios modelos, y conserva la arquitectura transformer de la familia Qwen3. El repositorio incluye tanto cuantizaciones de solo texto (desde Q2_K hasta Q8_0) como dos ficheros mmproj, lo que indica que el modelo subyacente incorpora capacidad multimodal de visión, aunque la model card no detalla su alcance.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas distribuciones GGUF de un merge de 27B con visión; por otro, advierte de que la información pública disponible es muy escasa (sin licencia declarada, sin idiomas declarados, sin benchmarks ni especificaciones de contexto), lo que obliga a tratar el modelo con cautela en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, según el nombre del modelo); detalles no disponibles |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | No disponibles (la model card declara únicamente `en`) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas) y safetensors en el modelo base |
| Tamaño del repositorio | 187,9 GB |
| Modelo base | nlpguy/Qwen3.8-27B-Kimiko |
| Herramienta de merge | mergekit |
| Descargas | 244 |
| Fecha de creación | 2026-08-26 |

## Arquitectura y entrenamiento

El modelo base es un merge construido con mergekit a partir de pesos de la familia Qwen3, según se deduce del nombre y de las etiquetas del repositorio. No se especifica en la información disponible qué modelos concretos se combinaron, con qué método de merge (SLERP, TIES, DARE, model stock, etc.), ni qué hiperparámetros se emplearon. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; al tratarse de un merge, lo habitual es que herede el post-entrenamiento de los modelos de origen, pero esto no se confirma en la model card.

La presencia de ficheros `mmproj` (proyección multimodal) en el repositorio GGUF sugiere que el modelo incorpora un adaptador de visión compatible con llama.cpp, aunque no se detalla la arquitectura del encoder visual ni la resolución de imagen soportada. Las cuantizaciones son estáticas: el autor indica explícitamente que no hay cuantizaciones ponderadas ni con imatrix disponibles en el momento de la publicación, y que podrían no llegar a publicarse. La conversión se realizó desde pesos en formato Hugging Face (`convert_type: hf`), con un esquema de cuantización de versión 2 y tensores de salida cuantizados.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Procesamiento multimodal de imágenes, a juzgar por la inclusión de ficheros mmproj Q8_0 y f16.
- Razonamiento y código: capacidad esperable por herencia de la familia Qwen3, pero no verificada en la información disponible.
- Soporte de tool calling y function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: la model card solo declara inglés (`en`); el resto de idiomas no está confirmado.
- Modo thinking explícito: no documentado.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_S (15,7 GB) y Q4_K_M (16,6 GB) permiten ejecutar un modelo de ~27B en GPUs con 24 GB de VRAM, como una RTX 4090, usando llama.cpp u Ollama.
- Despliegue en servidores con CPU y RAM abundante: las variantes Q2_K (10,8 GB) y Q3_K_S (12,2 GB) hacen viable la ejecución en equipos sin GPU dedicada, a costa de una pérdida de calidad notable en el caso de Q2_K.
- Experimentación con modelos fusionados: útil para investigadores que quieran evaluar el efecto de merges de la familia Qwen3 sin depender de infraestructura de GPU de datacenter, gracias al reducido tamaño de las cuantizaciones.
- Prototipado de asistentes conversacionales: la etiqueta `conversational` y el formato GGUF permiten integrar el modelo en aplicaciones de chat locales mediante llama-cpp-python o servidores compatibles con la API de OpenAI.
- Pruebas de pipelines multimodales en local: los ficheros mmproj permiten experimentar con entrada de imágenes en llama.cpp sin necesidad de servir el modelo completo en precisión nativa.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce variantes de cuantización, lo que facilita estudios de degradación de calidad frente a tamaño en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (peso de los ficheros, sin contar caché KV):
  - Q2_K: ~10,8 GB
  - Q3_K_S: ~12,2 GB
  - Q3_K_M: ~13,4 GB
  - Q3_K_L: ~14,4 GB
  - IQ4_XS: ~15,3 GB
  - Q4_K_S: ~15,7 GB
  - Q4_K_M: ~16,6 GB
  - Q5_K_S: ~18,8 GB
  - Q5_K_M: ~19,3 GB
  - Q6_K: ~22,2 GB
  - Q8_0: ~28,7 GB
  - mmproj: 0,7 GB (Q8_0) o 1,0 GB (f16)
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q6_K y Q8_0 con contexto amplio; GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo para Q2_K y Q3_K_S con contexto reducido.
- Cabe en GPU de consumo: sí, hasta Q5_K_M en una RTX 4090; Q6_K y Q8_0 requieren 32 GB o más de VRAM o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI; el repositorio está etiquetado como `endpoints_compatible`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Kimiko-GGUF (este) | ~26,9B | No disponible | No disponible | GGUF | Merge con visión vía mmproj; sin benchmarks |
| nlpguy/Qwen3.8-27B-Kimiko | ~26,9B | No disponible | No disponible | safetensors | Modelo base del que derivan estas cuantizaciones |
| Qwen3-32B (referencia de familia) | ~32B | No disponible en esta ficha | No disponible en esta ficha | safetensors, GGUF | Alternativa de la misma familia; datos no verificados aquí |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; es un riesgo legal relevante para producción.
- Idiomas no declarados más allá del inglés: el rendimiento en castellano es desconocido y debe validarse empíricamente.
- Longitud de contexto no documentada: impide planificar aplicaciones que dependan de ventanas largas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a los modelos de origen del merge.
- Riesgo de alucinación: inherente a los modelos de lenguaje; al ser un merge sin evaluación publicada, el riesgo no está caracterizado.
- Sesgos: no documentados; los merges heredan los sesgos de los modelos de origen, que no se especifican.
- Cuantizaciones estáticas sin imatrix: el autor advierte de que las versiones ponderadas pueden no estar disponibles, lo que puede reducir la calidad respecto a cuantizaciones con imatrix del mismo tamaño.
- Q2_K y Q3_K_S con degradación notable: no recomendables para tareas sensibles a la precisión.
- Repositorio de 187,9 GB: requiere espacio en disco considerable si se descargan varias variantes.
- Modelo de fecha futura (2026): verificar la vigencia y el soporte de la comunidad antes de adoptarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Kimiko-GGUF
- Modelo base: https://huggingface.co/nlpguy/Qwen3.8-27B-Kimiko
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Kimiko-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
