# mradermacher/Magnumaid-12B-v0.1-GGUF

## Resumen

Magnumaid-12B-v0.1-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo Triangle104/Magnumaid-12B-v0.1, un merge (fusión) de modelos de lenguaje de aproximadamente 12.000 millones de parámetros nominales, aunque el recuento real de parámetros en safetensors es de 10.066.662.400. El trabajo de cuantización lo firma mradermacher, un publicador habitual de versiones GGUF de modelos de la comunidad, y se distribuye bajo licencia Apache 2.0.

El modelo base es un merge generado con mergekit, orientado a conversación y con etiqueta de idioma inglés. La relevancia de esta ficha radica en que permite ejecutar un modelo de escala 12B en hardware de consumo mediante cuantizaciones que van desde Q2_K (4,1 GB) hasta f16 (20,2 GB), lo que lo hace accesible para despliegues locales con llama.cpp u Ollama.

No se dispone de información sobre la arquitectura interna, el proceso de entrenamiento ni los datos utilizados en el merge original, ya que la model card del repositorio cuantizado se limita a la información de las cuantizaciones y remite al modelo base. Esta ficha refleja únicamente los datos verificables en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base generado con mergekit; arquitectura de transformer no confirmada en la informacion) |
| Parametros totales | 10.066.662.400 (dato real en safetensors); nominalmente 12B |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en transformers presumiblemente safetensors, no confirmado |
| Tamano del repo | 90,0 GB |
| Modelo base | Triangle104/Magnumaid-12B-v0.1 |
| Libreria | transformers |
| Etiquetas | mergekit, merge, conversational |

## Arquitectura y entrenamiento

El modelo base Triangle104/Magnumaid-12B-v0.1 es un merge construido con mergekit, según las etiquetas del repositorio. No se dispone de información sobre los modelos de origen fusionados, la estrategia de merge (SLERP, TIES, DARE, model stock, etc.), la arquitectura concreta (aunque por nomenclatura y tamaño se infiere una familia tipo Llama/Mistral de 12B, sin confirmación), ni el número de tokens de entrenamiento o la composición del dataset.

Tampoco consta información sobre fases de alineación (RLHF, DPO, SFT) ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La model card del repositorio cuantizado documenta únicamente el proceso de cuantización: cuantizaciones estáticas de tipo 2 (quantize_version: 2) con tensores de salida cuantizados (output_tensor_quantised: 1) y conversión de tipo hf. Existe además una variante con cuantizaciones ponderadas/imatrix publicada por el mismo autor en un repositorio separado (sufijo -i1-GGUF).

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y orientado a diálogo multi-turno.
- Idiomas: únicamente inglés según la etiqueta de idioma del repositorio.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere que puede servirse a través de infraestructura de inferencia compatible con la API de Hugging Face.
- Ejecución local mediante GGUF: compatible con llama.cpp y derivados (Ollama, LM Studio, etc.).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión, audio o modo thinking: no disponible en la información proporcionada.
- Capacidades matemáticas o de código: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede desplegarse con llama.cpp u Ollama usando la cuantización Q4_K_M (6,3 GB) para mantener conversaciones multi-turno en una estación de trabajo con GPU de consumo, sin depender de servicios en la nube.
- Prototipado rápido de chatbots: gracias a las cuantizaciones pequeñas (Q2_K de 4,1 GB o Q3_K_S de 4,7 GB), es posible levantar un servidor de pruebas en portátiles con GPU modesta o incluso en CPU, validando flujos conversacionales antes de invertir en modelos mayores.
- Evaluación de merges de la comunidad: investigadores que estudian el efecto de las fusiones de modelos pueden comparar este merge frente a sus modelos de origen usando la misma infraestructura GGUF, con la ventaja de que las cuantizaciones permiten ejecutar múltiples variantes en un solo equipo.
- Generación de texto asistida en entornos sin conectividad: al ser un modelo local de licencia Apache 2.0, puede integrarse en aplicaciones de escritorio o embebidas que requieran generación de texto en inglés sin acceso a internet.
- Experimentación educativa con cuantización: la disponibilidad de doce niveles de cuantización (de Q2_K a f16) permite estudiar la degradación de calidad frente al tamaño en un modelo de 12B, usando la gráfica de perplejidad referenciada en la model card.
- Base para ajuste fino posterior: al publicarse bajo Apache 2.0 y en formato transformers (modelo base), puede servir como punto de partida para fine-tuning en tareas conversacionales específicas en inglés, aunque no se documentan recetas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización, con overhead adicional de contexto y caché KV):
  - Q2_K: ~4,1 GB de pesos; en torno a 5-6 GB con contexto moderado.
  - Q3_K_S: ~4,7 GB; Q3_K_M: ~5,1 GB; Q3_K_L: ~5,5 GB.
  - IQ4_XS: ~5,7 GB; Q4_K_S: ~6,0 GB; Q4_K_M: ~6,3 GB.
  - Q5_K_S: ~7,1 GB; Q5_K_M: ~7,3 GB.
  - Q6_K: ~8,4 GB.
  - Q8_0: ~10,8 GB.
  - f16: ~20,2 GB.
- GPU recomendadas:
  - Cuantizaciones Q4 a Q5: caben en GPUs de consumo con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 3080).
  - Q6_K y Q8_0: requieren 12-16 GB de VRAM (RTX 4080, RTX 4090, A4000).
  - f16: requiere 24 GB o más (RTX 3090, RTX 4090, A100, H100); en la práctica es innecesaria según la propia model card ("overkill").
- Cabe en GPU de consumo: sí, especialmente con Q4_K_M (6,3 GB), que el autor marca como "fast, recommended".
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. La etiqueta endpoints_compatible sugiere también despliegue mediante endpoints de Hugging Face. Para el modelo base en transformers se podría usar vLLM o TGI, aunque no se documenta en la información disponible.
- Latencia y throughput: no disponible. El autor recomienda Q4_K_S y Q4_K_M como opciones rápidas y Q8_0 como la de mejor calidad con velocidad alta, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Magnumaid-12B-v0.1-GGUF | 10.066.662.400 reales (12B nominal) | no disponible | Apache 2.0 | GGUF | Merge conversacional en inglés; 12 cuantizaciones |
| mradermacher/magnum-v4-12b-GGUF | 12B (nominal) | no disponible | no disponible en la busqueda | GGUF | Otro merge de 12B cuantizado por el mismo autor; familia Magnum |
| mradermacher/Lumimaid-Magnum-v4-12B-GGUF | 12B (nominal) | no disponible | no disponible en la busqueda | GGUF | Merge de la familia Lumimaid/Magnum v4, también en GGUF |

Los tres modelos pertenecen a la misma categoría: merges de 12B en inglés cuantizados por mradermacher para ejecución local. No se dispone de datos de rendimiento comparativo (benchmarks) en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Idiomas: el repositorio declara únicamente inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Alucinación: al no disponer de información sobre el entrenamiento ni la alineación del modelo base, no puede evaluarse el riesgo de alucinación; en merges de la comunidad este riesgo suele ser variable y conviene validarlo empíricamente.
- Sesgos: no disponible; no se documentan evaluaciones de sesgo ni de seguridad.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un merge de modelos de origen desconocido en esta información, conviene verificar las licencias de los modelos fusionados en el repositorio base antes de un despliegue comercial.
- Calidad de cuantización: las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad de forma notable; el autor desaconseja Q3_K_M explícitamente ("lower quality") y recomienda Q4_K_S o Q4_K_M para uso general.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide garantizar conversaciones de contexto largo.
- Producción: no hay benchmarks, ni información sobre tool calling, ni sobre estabilidad en despliegues de alta concurrencia; no se recomienda para producción crítica sin una evaluación previa.
- Repositorio: el tamaño total del repo es de 90,0 GB, por lo que la descarga completa de todas las cuantizaciones es costosa; conviene descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio Hugging Face (cuantizaciones GGUF): https://huggingface.co/mradermacher/Magnumaid-12B-v0.1-GGUF
- Modelo base: https://huggingface.co/Triangle104/Magnumaid-12B-v0.1
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Magnumaid-12B-v0.1-i1-GGUF
- Página de resumen del autor para este modelo: https://hf.tst.eu/model#Magnumaid-12B-v0.1-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfica de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Modelo relacionado (magnum-v4-12b-GGUF): https://huggingface.co/mradermacher/magnum-v4-12b-GGUF
- Modelo relacionado (Lumimaid-Magnum-v4-12B-GGUF): https://huggingface.co/mradermacher/Lumimaid-Magnum-v4-12B-GGUF
