# mradermacher/Morrow2-2B-GGUF

## Resumen

Morrow2-2B-GGUF es la colección de cuantizaciones estáticas en formato GGUF del modelo Morrow2-2B, desarrollado originalmente por noumenon-labs y cuantizado por mradermacher. El modelo base es un transformer de tipo decoder-only con 1.728.801.600 parámetros reales (etiquetado comercialmente como "2B"), afinado para diálogo conversacional y "behavioral-tuning", según las etiquetas de la model card. Su propósito es ofrecer un modelo de conversación ligero, ejecutable en hardware de consumo mediante llama.cpp y derivados.

La relevancia de esta ficha radica en que el repositorio GGUF es la vía práctica para desplegar el modelo en entornos sin GPU de datacenter: ofrece 12 cuantizaciones distintas (desde Q2_K de 0,9 GB hasta f16 de 3,6 GB), lo que permite ajustar el equilibrio entre calidad y huella de memoria en un rango muy amplio. El repositorio acumula 813 descargas y fue creado el 8 de noviembre de 2026, con actualización al día siguiente.

No se dispone de información pública sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks en la documentación proporcionada. La licencia figura como "other", lo que obliga a consultar los términos del modelo base antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (deducido de la librería transformers y el formato GGUF; no detallado en la model card) |
| Parametros totales | 1.728.801.600 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés; único idioma declarado en la model card) |
| Licencia | other |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de lo inferible del repositorio: se trata de un transformer decoder-only compatible con la librería transformers y convertido a GGUF. El recuento exacto de parámetros (1.728.801.600) corresponde al modelo base en safetensors. Las etiquetas de la model card indican "conversational", "dialogue" y "behavioral-tuning", lo que sugiere un ajuste fino orientado a comportamiento conversacional, pero no se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF, DPO o similares.

El repositorio es una cuantización estática generada por mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf). Existe además una variante con cuantizaciones ponderadas/imatrix en el repositorio Morrow2-2B-i1-GGUF del mismo autor, que suele ofrecer mejor calidad por tamaño que las estáticas equivalentes. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno según las etiquetas del modelo.
- Ajuste de comportamiento ("behavioral-tuning"): el modelo está afinado para seguir un estilo o conducta conversacional concreta, no solo para completar texto.
- No hay evidencia en la documentación de soporte de tool calling, function calling ni agentes multi-paso.
- No hay evidencia de capacidades de visión, audio ni modo "thinking" explícito.
- Capacidad multilingüe limitada al inglés declarado; no se documentan otros idiomas.
- Razonamiento, código y matemáticas: no documentados en la información disponible.

## Casos de uso

- Chatbot conversacional ligero en local: con cuantizaciones Q4_K_M de 1,2 GB, el modelo cabe en cualquier portátil moderno y permite desplegar un asistente de diálogo sin conexión ni coste de API, usando llama.cpp u Ollama.
- Prototipado rápido de interfaces conversacionales: al ser un modelo pequeño y con cuantizaciones de menos de 1,5 GB, se puede iterar sobre prompts y flujos de diálogo en minutos, antes de migrar a un modelo mayor en producción.
- Simulación de personajes o agentes de rol: el ajuste por comportamiento ("behavioral-tuning") lo hace adecuado para experimentar con personalidades y estilos de respuesta consistentes en entornos de investigación.
- Evaluación de pipelines de cuantización: sirve como caso de estudio para comparar la degradación de calidad entre Q2_K, Q4_K_M y Q8_0 en una tarea conversacional concreta, dado el amplio abanico de cuantizaciones publicadas.
- Despliegue en dispositivos con recursos muy limitados: la variante Q2_K (0,9 GB) permite ejecución en CPU en equipos con poca RAM, útil para demos embebidas o entornos educativos.
- Generación de respuestas en aplicaciones de escritorio offline: integrable en herramientas de escritorio mediante llama.cpp, sin dependencia de servicios en la nube, para tareas de conversación de baja latencia en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (según tamaño del fichero GGUF, más overhead de contexto): Q2_K ~0,9 GB; Q3_K_S ~1,0 GB; Q4_K_M ~1,2 GB; Q5_K_M ~1,4 GB; Q6_K ~1,5 GB; Q8_0 ~1,9 GB; f16 ~3,6 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM puede ejecutar las cuantizaciones Q4_K_M o superiores; una RTX 3060 de 12 GB o superior permite Q8_0 o f16 con contexto amplio. En A100/H100 el modelo es sobredimensionado para la GPU y el cuello de botella será la CPU o el ancho de banda.
- Cabe en GPU consumer: sí, en todas las cuantizaciones, incluidas tarjetas de gama baja con 4-6 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no son la vía natural para GGUF, aunque el modelo base en safetensors podría servirse con transformers.
- Latencia y throughput: no disponibles en la información proporcionada; en CPU con Q4_K_M se espera un rendimiento de decenas de tokens por segundo en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Morrow2-2B-GGUF | 1,73 B | no disponible | other | GGUF | Afinado para diálogo y comportamiento; solo inglés |
| Qwen2.5-1.5B-Instruct (GGUF) | 1,54 B | 32.768 (según su model card pública) | Apache 2.0 | GGUF, safetensors | Multilingüe, licencia permisiva, benchmarks publicados |
| Llama-3.2-1B-Instruct (GGUF) | 1,24 B | 131.072 (según su model card pública) | Llama 3.2 Community License | GGUF, safetensors | Multilingüe, contexto largo, ecosistema amplio |
| SmolLM2-1.7B-Instruct (GGUF) | 1,71 B | 8.192 (según su model card pública) | Apache 2.0 | GGUF, safetensors | Entrenado en inglés, benchmarks publicados |

La comparativa se basa en datos públicos de los modelos alternativos; para Morrow2-2B no hay benchmarks ni contexto declarados, por lo que la comparación de rendimiento no es posible con la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo entrenado principalmente en inglés, es previsible un sesgo cultural y lingüístico hacia ese idioma.
- Riesgo de alucinación: no cuantificado por el autor; en modelos de este tamaño el riesgo es elevado en tareas de conocimiento factual.
- Limitaciones de contexto e idioma: solo se declara inglés; la longitud de contexto no está especificada, lo que impide planificar aplicaciones de contexto largo.
- Restricciones de licencia: la licencia "other" obliga a revisar los términos del modelo base noumenon-labs/Morrow2-2B antes de uso comercial; no se puede asumir permisividad.
- Caveat de producción: al ser una cuantización estática, las variantes Q2_K y Q3_K_M pueden degradar notablemente la calidad conversacional; se recomienda Q4_K_M o superior, o bien las cuantizaciones imatrix del repositorio i1-GGUF.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad frente a alternativas, por lo que no se recomienda para producción sin evaluación propia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Morrow2-2B-GGUF
- Modelo base: https://huggingface.co/noumenon-labs/Morrow2-2B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Morrow2-2B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Morrow2-2B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
