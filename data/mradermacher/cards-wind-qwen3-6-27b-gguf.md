# mradermacher/CARDS-Wind-Qwen3.6-27B-GGUF

## Resumen

`mradermacher/CARDS-Wind-Qwen3.6-27B-GGUF` es un repositorio de cuantizaciones GGUF generado por mradermacher a partir del modelo `iRanadheer/CARDS-Wind-Qwen3.6-27B`. Se trata, por tanto, de un artefacto de conversión y compresión de pesos, no de un modelo entrenado desde cero: el autor original de los pesos es iRanadheer y mradermacher solo publica las versiones cuantizadas para inferencia local. El recuento real de parámetros en safetensors es de 26.895.998.464 (aproximadamente 26,9 mil millones), lo que sitúa al modelo en la franja de 27B densos.

El interés práctico del repositorio está en que ofrece trece variantes de cuantización estáticas que van desde 10,8 GB (Q2_K) hasta 28,7 GB (Q8_0), además de dos ficheros `mmproj` (proyector multimodal en Q8_0 y f16), lo que indica que el modelo base incorpora componentes de visión según la estructura del propio repositorio. Esto permite desplegarlo en llama.cpp, Ollama o LM Studio en hardware de consumo con la variante Q4_K_M (16,6 GB), algo inviable con los pesos completos en precisión nativa.

Ahora bien, la información disponible es muy limitada: la model card es la plantilla estándar del cuantizador y no describe el entrenamiento, el contexto, la licencia ni los idiomas más allá de la etiqueta `en`. No hay benchmarks publicados ni ficha técnica del modelo base en los datos aportados, y el repositorio acumula solo 159 descargas y 0 likes, por lo que la validación comunitaria es prácticamente nula.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La denominación del modelo base sugiere la familia Qwen3.6, pero no se documenta en la información proporcionada |
| Parámetros totales | 26.895.998.464 (~26,9 B), dato real de safetensors |
| Parámetros activos | No disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; más mmproj en Q8_0 y f16 |
| Idiomas soportados | Inglés (`en`) según los metadatos del repositorio |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors con librería transformers |
| Modelo base | `iRanadheer/CARDS-Wind-Qwen3.6-27B` |
| Tamaño del repositorio | 187,9 GB |
| Proceso de cuantización | `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`; sin cuantizaciones ponderadas ni imatrix en el momento de la publicación |
| Etiquetas | transformers, gguf, en, endpoints_compatible, region:us, conversational |
| Descargas / likes | 159 / 0 |
| Fechas | Creado el 2026-04-28; actualizado el 2026-10-18 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base: la model card del repositorio GGUF no incluye descripción de capas, mecanismo de atención, tipo de transformer ni innovaciones técnicas. El dato objetivo es el recuento de parámetros (26,9 B) y la existencia de ficheros `mmproj`, que en el ecosistema GGUF corresponden al proyector de un modelo multimodal; esto apunta a que los pesos originales combinan un tronco de lenguaje con un codificador visual, aunque el repositorio no detalla ni el codificador ni la resolución de imagen soportada.

Tampoco hay datos sobre el entrenamiento: se desconoce el número de tokens, la composición del corpus, si hubo ajuste supervisado, RLHF o DPO, y si el modelo es un preentrenamiento original, un fine-tune o una fusión de pesos. En cuanto al proceso de conversión, mradermacher aplica cuantizaciones estáticas (no ponderadas por importancia) con `quantize_version: 2`, y advierte de que las versiones imatrix o weighted no estaban disponibles en el momento de publicar; esto implica que, a igualdad de tamaño, estas cuantizaciones pueden rendir algo peor que las versiones imatrix equivalentes.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` indica que el modelo está orientado a diálogo multirretorno.
- Procesamiento multimodal: la presencia de ficheros `mmproj-Q8_0` y `mmproj-f16` sugiere soporte de entrada de imagen, aunque no se documenta el alcance ni la calidad.
- Inferencia local y compatible con endpoints: la etiqueta `endpoints_compatible` señala que el repositorio puede desplegarse mediante Hugging Face Inference Endpoints en formato GGUF.
- Multilingüismo: limitado al inglés según los metadatos (`language: en`); no se declara soporte de castellano ni de otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional autoalojado en inglés: la variante Q4_K_M (16,6 GB) se ejecuta en una única GPU de 24 GB con llama.cpp u Ollama, lo que permite ofrecer un chatbot interno sin enviar datos a APIs externas.
- Despliegue en entornos aislados (air-gapped): al ser un artefacto GGUF autocontenido, puede copiarse a máquinas sin conexión y servirse con llama.cpp, algo habitual en laboratorios y entornos industriales con restricciones de red.
- Evaluación del impacto de la cuantización: el repositorio ofrece once niveles de compresión del mismo modelo, lo que permite medir la degradación de perplejidad y calidad entre Q2_K y Q8_0 sobre un conjunto de validación propio antes de elegir una variante para producción.
- Servicio de generación de texto en CPU: las variantes Q2_K (10,8 GB) e IQ4_XS (15,3 GB) hacen viable el despliegue en servidores sin GPU, con throughput limitado por el ancho de banda de memoria y adecuado para cargas de baja concurrencia.
- Prototipado multimodal: cargando el fichero `mmproj-f16` junto con los pesos cuantizados en llama.cpp, puede probarse un pipeline de descripción de imágenes o extracción de texto, siempre validando antes la calidad real del modelo base.
- Integración en estaciones de trabajo con una sola RTX 4090 o RTX 3090: el tamaño de 26,9 B en Q4_K_M encaja en 24 GB de VRAM, lo que permite a un desarrollador individual trabajar con un modelo de esta escala en local.
- Investigación sobre cuantización: sirve como caso de estudio para comparar cuantizaciones estáticas frente a imatrix en un modelo de ~27B, ya que el autor indica explícitamente que las versiones ponderadas no están disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

| Cuantización | Tamaño en disco | VRAM estimada en inferencia | GPU recomendada |
|---|---|---|---|
| Q2_K | 10,8 GB | ~13-14 GB (pesos + caché KV + overhead) | RTX 4080 16 GB, RTX 4060 Ti 16 GB, A4000 16 GB |
| Q3_K_S / Q3_K_M / Q3_K_L | 12,2 / 13,4 / 14,4 GB | ~15-18 GB | RTX 4080 16 GB (justo), RTX 4090 24 GB |
| IQ4_XS | 15,3 GB | ~18-19 GB | RTX 4090 24 GB, A5000 24 GB |
| Q4_K_S / Q4_K_M | 15,7 / 16,6 GB | ~19-21 GB | RTX 3090 / RTX 4090 24 GB, L4 24 GB |
| Q5_K_S / Q5_K_M | 18,8 / 19,3 GB | ~22-24 GB | RTX 3090 / RTX 4090 24 GB (al límite), A100 40 GB |
| Q6_K | 22,2 GB | ~25-27 GB | A100 40 GB, 2 × 24 GB |
| Q8_0 | 28,7 GB | ~32-34 GB | A100 40 GB, H100 80 GB, 2 × RTX 4090 |
| mmproj-Q8_0 / f16 | 0,7 / 1,0 GB | Sumar al total si se usa la entrada de imagen | Cualquiera de las anteriores |

- Los valores de VRAM son estimaciones a partir del tamaño de fichero más caché KV y overhead del runtime; no hay mediciones publicadas por el autor.
- No se distribuye una variante f16 ni BF16 completa en este repositorio; el nivel máximo es Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, koboldcpp y text-generation-webui. vLLM y TGI admiten GGUF de forma experimental o parcial, por lo que conviene validar la versión concreta antes de usarlos en producción.
- Latencia y throughput: no disponible. Al ser un modelo de ~27B, el rendimiento estará limitado por el ancho de banda de memoria en GPU y notablemente más en CPU, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `iRanadheer/CARDS-Wind-Qwen3.6-27B` (base) | ~26,9 B | No disponible | No disponible | Safetensors (transformers) | Hugging Face |
| `mradermacher/CARDS-Wind-Qwen3.6-27B-GGUF` (esta ficha) | ~26,9 B | No disponible | No disponible | GGUF Q2_K–Q8_0 + mmproj | Hugging Face |
| Alternativas de ~27 B de la misma categoría | No disponible | No disponible | No disponible | No disponible | No identificadas en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos comparables en la información aportada, por lo que no es posible establecer una comparación cuantitativa fiable con alternativas de la misma franja de parámetros.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso para uso comercial; es imprescindible contactar con el autor del modelo base antes de cualquier despliegue productivo.
- Idiomas: los metadatos solo declaran inglés (`en`); el rendimiento en castellano es desconocido y probablemente deficiente.
- Ausencia de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni en tareas multimodales, por lo que la idoneidad del modelo debe validarse con evaluación propia.
- Model card inexistente en la práctica: la ficha es la plantilla genérica del cuantizador y no describe arquitectura, datos de entrenamiento ni sesgos conocidos, lo que impide auditar el origen de los pesos.
- Denominación no verificable: el nombre «Qwen3.6» no se corresponde con ninguna documentación técnica aportada, así que no puede confirmarse la arquitectura ni la relación real con la familia Qwen.
- Cuantizaciones estáticas sin imatrix: a igualdad de tamaño, las variantes publicadas pueden presentar mayor degradación que sus equivalentes ponderadas, especialmente en Q2_K y Q3_K_S.
- Pérdida de calidad en compresión agresiva: Q2_K (10,8 GB) y Q3_K_S (12,2 GB) reducen el modelo a menos de la mitad del tamaño de Q8_0, con impacto esperado en tareas de razonamiento y código.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala y no cuantificado en la información disponible.
- Validación comunitaria mínima: 159 descargas y 0 likes indican que el modelo apenas ha sido probado por terceros.
- Peso del repositorio: 187,9 GB en total, lo que exige planificar el almacenamiento antes de clonar; conviene descargar únicamente la cuantización necesaria.
- Capacidad multimodal no documentada: la presencia de `mmproj` no garantiza que la entrada de imagen funcione correctamente con todas las cuantizaciones ni que la calidad sea utilizable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/CARDS-Wind-Qwen3.6-27B-GGUF
- Modelo base: https://huggingface.co/iRanadheer/CARDS-Wind-Qwen3.6-27B
- Página de descargas del cuantizador: https://hf.tst.eu/model#CARDS-Wind-Qwen3.6-27B-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de perplejidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (infraestructura del cuantizador): https://www.nethype.de/
