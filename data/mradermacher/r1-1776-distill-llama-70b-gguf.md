# mradermacher/r1-1776-distill-llama-70b-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones estáticas en formato GGUF del modelo `perplexity-ai/r1-1776-distill-llama-70b`, publicadas por el usuario mradermacher. No es un modelo entrenado desde cero, sino una conversión a precisiones reducidas (de Q2_K a Q8_0) pensada para ejecutar el modelo original con llama.cpp y herramientas compatibles con GGUF en equipos con VRAM limitada, desde estaciones de trabajo con dos GPU de consumo hasta servidores con una única A100/H100.

El modelo base lo desarrolla Perplexity AI y su denominación indica una destilación de DeepSeek-R1 sobre Llama 3.3 70B, con 70.553.706.560 parámetros (unos 70,55 mil millones). La model card de esta cuantización no aporta detalles sobre el entrenamiento, la composición del dataset ni la longitud de contexto; solo declara licencia MIT e idioma inglés.

Su relevancia práctica es doble: por un lado, permite ejecutar localmente un modelo de 70B con capacidad de razonamiento extendido sin necesidad de infraestructura de centro de datos; por otro, el repo incluye hasta once variantes de cuantización, lo que facilita ajustar el equilibrio entre calidad y requisitos de memoria. El precio a pagar es la ausencia de benchmarks publicados en esta ficha y el tamaño agregado del repositorio, 481,3 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.3 70B; no detallada en la model card del cuantizador) |
| Parámetros totales | 70.553.706.560 (~70,55 mil millones, dato de safetensors del modelo base) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Llama 3.3 70B emplea 128 000 tokens, sin confirmar aquí) |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K y Q8_0; variantes ponderadas/imatrix en el repo `r1-1776-distill-llama-70b-i1-GGUF` |
| Idiomas soportados | `en` (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors |
| Tamaño del repositorio | 481,3 GB (conjunto de todas las cuantizaciones) |
| Descargas / likes | 53 descargas, 0 likes |
| Pipeline declarado | No disponible |
| Etiquetas relevantes | `transformers`, `gguf`, `conversational`, `endpoints_compatible`, `base_model:quantized:perplexity-ai/r1-1776-distill-llama-70b` |

Tamaños por cuantización (según la tabla del autor):

| Cuantización | Tamaño (GB) | Nota del autor |
|---|---:|---|
| Q2_K | 26,5 | — |
| Q3_K_S | 31,0 | — |
| Q3_K_M | 34,4 | calidad inferior |
| Q3_K_L | 37,2 | — |
| IQ4_XS | 38,4 | — |
| Q4_K_S | 40,4 | rápida, recomendada |
| Q4_K_M | 42,6 | rápida, recomendada |
| Q5_K_S | 48,8 | — |
| Q5_K_M | 50,0 | — |
| Q6_K | 58,0 | muy buena calidad (dividida en 2 partes) |
| Q8_0 | 75,1 | rápida, mejor calidad (dividida en 2 partes) |

## Arquitectura y entrenamiento

El repositorio no documenta arquitectura ni entrenamiento: es un artefacto de conversión. Los metadatos internos de la model card (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) indican que se partió de los pesos en formato Hugging Face del modelo base y se aplicó la cuantización estática de llama.cpp sobre los tensores de salida, generando ficheros GGUF autónomos. Al tratarse de cuantización *post-hoc*, no hay reentrenamiento ni ajuste fino: la arquitectura, los datos de preentrenamiento y el proceso de alineamiento son los del modelo `perplexity-ai/r1-1776-distill-llama-70b`, que esta ficha no detalla.

Por la nomenclatura del modelo base cabe inferir una destilación de las capacidades de razonamiento de DeepSeek-R1 sobre la arquitectura densa de Llama 3.3 70B, con un post-entrenamiento posterior de Perplexity AI (el sufijo «1776» y la fecha de publicación, 24 de febrero de 2025, coinciden con la familia R1-1776 de Perplexity). No se dispone de información verificada sobre número de tokens de entrenamiento, composición del corpus, uso de RLHF/DPO ni innovaciones técnicas concretas. Tampoco se documenta la plantilla de chat ni la configuración de decodificación recomendada en este repositorio.

## Capacidades

- Generación de texto conversacional multi-turno en inglés (etiqueta `conversational`).
- Razonamiento extendido y resolución de problemas paso a paso, heredado de la destilación de DeepSeek-R1 según la denominación del modelo base.
- Generación y explicación de código, y resolución de problemas matemáticos, como capacidades esperables de un modelo de 70B destilado de un modelo de razonamiento (sin benchmarks que lo verifiquen en esta ficha).
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`), es decir, puede desplegarse detrás de infraestructura tipo Hugging Face Inference Endpoints usando el runtime adecuado.
- Ejecución local en CPU/GPU mediante llama.cpp, Ollama, LM Studio o koboldcpp al estar en formato GGUF.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- Tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado explícitamente; el modo de razonamiento de la familia R1 es el único indicio.
- Visión, audio o modalidades adicionales: no disponibles.

## Casos de uso

- Razonamiento matemático y analítico en local: con la cuantización Q4_K_M (42,6 GB) el modelo cabe en dos RTX 4090 o una A6000, lo que permite resolver problemas de varios pasos sin enviar datos a un tercero.
- Asistente de código en estación de trabajo: integrado vía llama.cpp u Ollama, sirve para explicar fragmentos, generar tests y refactorizar en un entorno sin conexión, con la ventaja de que los repositorios privados no salen de la máquina.
- Procesamiento por lotes de documentación técnica en inglés: al ser un modelo denso de 70B en GGUF, puede ejecutarse con llama.cpp en servidor para resumir y clasificar grandes volúmenes de texto con un coste de infraestructura menor que el de los pesos BF16.
- Investigación sobre alineamiento y censura: el modelo base pertenece a una familia post-entrenada para reducir rechazos, por lo que resulta útil en estudios comparativos sobre comportamiento de modelos «sin censura», siempre con revisión humana y políticas de uso claras.
- Despliegue en entornos con GPU de 48-80 GB: la variante Q8_0 (75,1 GB) permite servir el modelo en una A100 80 GB o H100 80 GB conservando prácticamente la calidad del original, útil para evaluación interna y prototipos de producto.
- Base para comparativas de cuantización: el repositorio ofrece once niveles de precisión del mismo modelo, lo que facilita medir la degradación de perplejidad y calidad entre Q2_K y Q8_0 en un pipeline propio de evaluación.
- Chatbot especializado de nicho en inglés: para dominios concretos (soporte técnico, documentación de producto) donde se requiera confidencialidad y no sea viable una API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del cuantizador no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica del modelo; únicamente enlaza un gráfico de perplejidad comparativa entre tipos de cuantización (elaborado por ikawrakow) y un análisis externo sobre elección de cuantizaciones, que no constituyen benchmarks de capacidades. La búsqueda web realizada no devolvió resultados relacionados con el modelo: los enlaces obtenidos tratan sobre la conexión de televisores a internet y se han descartado por no ser relevantes.

## Requisitos de hardware

Estimaciones de VRAM para los pesos, sin contar caché KV ni overhead del runtime (a mayor contexto, más memoria adicional):

| Cuantización | Pesos (GB) | VRAM recomendada | GPU de ejemplo |
|---|---:|---|---|
| Q2_K | 26,5 | ~32 GB | A100 40 GB, 2× RTX 4090 con offload parcial |
| Q3_K_M | 34,4 | ~40 GB | A100 40 GB, A6000 48 GB |
| IQ4_XS | 38,4 | ~44 GB | A6000 48 GB, L40S 48 GB |
| Q4_K_M | 42,6 | ~48 GB | 2× RTX 4090 24 GB, A6000 48 GB, L40S |
| Q5_K_M | 50,0 | ~56 GB | 2× A6000 48 GB, A100 80 GB |
| Q6_K | 58,0 | ~64 GB | A100 80 GB, H100 80 GB |
| Q8_0 | 75,1 | ~80 GB | A100 80 GB, H100 80 GB |

- En GPU de consumo: ninguna cuantización cabe entera en una RTX 4090 (24 GB). Q2_K (26,5 GB) queda al límite y requiere offload parcial a CPU o RAM; Q3_K_S (31,0 GB) ya excede claramente 24 GB.
- Configuraciones multi-GPU: dos RTX 4090 (48 GB) permiten Q4_K_M con contexto moderado; cuatro RTX 3090/4090 (96 GB) permiten Q8_0.
- Despliegue: llama.cpp (llama-server), Ollama, LM Studio, koboldcpp y llama-cpp-python son las opciones naturales para GGUF. Para vLLM o TGI es preferible usar los safetensors del modelo base, ya que el soporte de GGUF en esos servidores es experimental y limitado en modelos de 70B.
- CPU-only: viable con Q2_K o Q3_K_S y RAM suficiente (32-40 GB), pero con throughput muy bajo; no se han publicado mediciones.
- Latencia y throughput: no disponibles. No se han publicado cifras de tokens por segundo para estas cuantizaciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato disponible | Notas |
|---|---:|---|---|---|---|
| Este repo (GGUF de r1-1776-distill-llama-70b) | 70,55 B | No disponible | MIT | GGUF (Q2_K–Q8_0) | Cuantización comunitaria, 53 descargas, sin benchmarks publicados |
| perplexity-ai/r1-1776-distill-llama-70b (base) | 70,55 B | No disponible | MIT | Safetensors (BF16) | Modelo original de Perplexity AI; requiere ~141 GB en BF16 |
| DeepSeek-R1-Distill-Llama-70B | ~70 B | 128 000 (heredado de Llama 3.3, no verificado aquí) | MIT | Safetensors, múltiples GGUF de terceros | Destilación original de R1 sin el post-entrenamiento de Perplexity; referencia directa para comparar comportamiento |
| Llama 3.3 70B Instruct | ~70,6 B | 128 000 | Llama 3.3 Community License | Safetensors, GGUF | Modelo base sobre el que se construyen las destilaciones; licencia con cláusulas de uso aceptable y límite de 700 M de usuarios mensuales |

Los datos de las alternativas proceden del conocimiento general de sus model cards y no se han podido verificar en la búsqueda realizada; tómense como orientativos y consúltese la documentación oficial antes de decidir.

## Limitaciones y advertencias

- Idioma: solo inglés declarado. El rendimiento en castellano no está garantizado ni documentado.
- Sin benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni evaluaciones de seguridad para este modelo o sus cuantizaciones.
- Alucinación: los modelos de razonamiento destilados generan cadenas de pensamiento largas que pueden contener pasos plausibles pero incorrectos; no hay verificación factual integrada.
- Modelo «sin censura»: la familia R1-1776 está post-entrenada para reducir rechazos, por lo que puede producir contenido sensible, legal o éticamente problemático. Es imprescindible añadir filtros y moderación en producción.
- Degradación por cuantización: Q2_K y Q3_K_S/M pierden calidad de forma perceptible; el propio autor marca Q3_K_M como «lower quality». Para uso serio, partir de Q4_K_M o superior.
- Contexto no documentado: no se especifica la longitud máxima soportada en esta ficha; configurar contextos muy largos sin verificación puede provocar degradación o errores.
- Licencia: se declara MIT, pero el modelo base deriva de Llama 3.3, cuya licencia comunitaria incluye condiciones de uso aceptable y límites de escala. Conviene revisar la cadena de licencias antes de un uso comercial a gran escala.
- Madurez del artefacto: 53 descargas y 0 likes; no hay validación comunitaria ni issues públicos que respalden la calidad de la conversión.
- Repositorio de 481,3 GB: descargar el conjunto completo es costoso; conviene bajar solo el fichero GGUF necesario. Q6_K y Q8_0 están divididos en dos partes que deben concatenarse antes de su uso.
- Sin tool calling ni plantilla de chat documentada: la integración en pipelines de agentes requiere definir manualmente el formato de prompt y validar el comportamiento.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/r1-1776-distill-llama-70b-GGUF
- Modelo base: https://huggingface.co/perplexity-ai/r1-1776-distill-llama-70b
- Cuantizaciones ponderadas/imatrix del mismo modelo: https://huggingface.co/mradermacher/r1-1776-distill-llama-70b-i1-GGUF
- Página de resumen y descargas del autor: https://hf.tst.eu/model#r1-1776-distill-llama-70b-GGUF
- Gráfico comparativo de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Análisis de Artefact2 sobre elección de cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Web del patrocinador del autor: https://www.nethype.de/
