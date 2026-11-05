# mradermacher/L3-8B-WolfCore-GGUF

## Resumen

L3-8B-WolfCore-GGUF es la colección de cuantizaciones estáticas en formato GGUF del modelo DoppelReflEx/L3-8B-WolfCore, publicada por el usuario mradermacher. Se trata de un modelo de lenguaje de 8.030.261.312 parámetros (aproximadamente 8B) derivado de la familia Llama 3, según indica el prefijo "L3" en su denominación, y generado mediante la herramienta mergekit a partir de la fusión de otros modelos. El repositorio no incluye la model card original del modelo base, por lo que los detalles sobre el proceso de merge, los datasets de entrenamiento y las capacidades específicas no están documentados en la información disponible.

La relevancia de esta publicación es fundamentalmente práctica: mradermacher proporciona 12 variantes de cuantización que abarcan desde Q2_K (3,3 GB) hasta f16 (16,2 GB), lo que permite ejecutar un modelo de 8B parámetros en hardware de consumo con distintos compromisos entre calidad y requisitos de memoria. El repositorio también enlaza a una versión con cuantizaciones ponderadas/imatrix (L3-8B-WolfCore-i1-GGUF), que suele ofrecer mejor calidad por bit que las cuantizaciones estáticas equivalentes.

El modelo está etiquetado únicamente para inglés y no declara licencia en los metadatos de HuggingFace, lo que supone una limitación importante para su adopción en entornos comerciales. Con 62 descargas y 1 like en el momento de la consulta, es un modelo de nicho dentro del ecosistema de merges comunitarios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Llama 3, según denominación "L3"; detalles no disponibles) |
| Parámetros totales | 8.030.261.312 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base DoppelReflEx/L3-8B-WolfCore es un merge generado con mergekit, según las etiquetas del repositorio. Esto implica que se construyó combinando los pesos de dos o más modelos preexistentes mediante alguna técnica de fusión (no especificada: podría ser SLERP, TIES, DARE, passthrough o model stock). La designación "L3" sugiere que los modelos de origen pertenecen a la familia Llama 3 de Meta, con 8B parámetros, pero no se dispone de información sobre qué modelos concretos se fusionaron ni con qué proporciones.

No hay datos publicados sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas específicas más allá de la herencia de Llama 3. La cuantización realizada por mradermacher emplea el formato GGUF estático (quantize_version 2, output_tensor_quantised 1, convert_type hf), sin cuantización ponderada por importancia en este repositorio; las versiones imatrix están en un repositorio separado.

## Capacidades

- Generación de texto conversacional: el tag "conversational" indica que el modelo está orientado a diálogo, presumiblemente con una plantilla de chat compatible con Llama 3.
- Razonamiento general y respuesta a instrucciones: capacidad esperable por herencia de Llama 3 8B, aunque no verificada en la información disponible.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- Tool calling / function calling: no documentado; probablemente no soportado de forma nativa dado que el merge no declara dicha capacidad.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Ejecución local vía llama.cpp, Ollama y otros runtimes compatibles con GGUF.

## Casos de uso

- Prototipado de chatbots locales en inglés: gracias a las cuantizaciones Q4_K_M (5,0 GB) y Q5_K_M (5,8 GB), el modelo puede ejecutarse en una GPU de consumo con 8 GB de VRAM mediante llama.cpp u Ollama, lo que permite iterar sobre prompts y plantillas de chat sin coste de API.
- Experimentación con técnicas de model merging: el modelo sirve como caso de estudio para investigadores interesados en evaluar cómo se comportan los merges de Llama 3 8B frente al modelo original en tareas de instrucción, usando las distintas cuantizaciones para comparar degradación por compresión.
- Generación de texto offline en estaciones de trabajo sin conectividad: la variante Q2_K (3,3 GB) permite desplegar el modelo en equipos con recursos muy limitados, útil para demostraciones o entornos aislados donde no se requiere máxima calidad.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes, lo que facilita medir la perplejidad y la calidad subjetiva de cada tipo de cuantización sobre el mismo modelo base, un ejercicio habitual en el blog o en laboratorios de eficiencia.
- Fine-tuning ligero sobre el modelo base: aunque este repositorio solo contiene GGUF, el modelo base en safetensors (DoppelReflEx/L3-8B-WolfCore) puede servir de punto de partida para LoRA/QLoRA en tareas específicas en inglés, y luego reconvertirse a GGUF.
- Integración en aplicaciones de escritorio con requisitos de privacidad: al ejecutarse completamente en local con llama.cpp, el modelo permite procesar texto confidencial en inglés sin enviar datos a servicios externos, siempre que se acepten las limitaciones de calidad de un merge no evaluado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de perplejidad comparativa para este merge ni para sus cuantizaciones en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, aproximada al tamaño del archivo más overhead de contexto):
  - Q2_K: ~3,3 GB
  - Q3_K_M: ~4,1 GB
  - Q4_K_M: ~5,0 GB
  - Q5_K_M: ~5,8 GB
  - Q6_K: ~6,7 GB
  - Q8_0: ~8,6 GB
  - f16: ~16,2 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para cuantizaciones altas; A100/H100 no son necesarias para un modelo de 8B, pero permitirían f16 con contexto largo.
- Cabe en GPU de consumo: sí, desde una GTX 1060 6 GB con Q4_K_S hasta una RTX 4090 con Q8_0 o f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no son la vía natural para GGUF, aunque vLLM tiene soporte experimental.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| L3-8B-WolfCore-GGUF | 8,03B | no disponible | no disponible | GGUF | Merge comunitario, solo inglés |
| Meta Llama 3 8B Instruct | 8,03B | 8.192 tokens | Llama 3 Community License | safetensors, GGUF | Modelo oficial, benchmarks publicados |
| Mistral 7B Instruct | 7,24B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa con licencia permisiva |
| mradermacher/L3-8B-WolfCore-i1-GGUF | 8,03B | no disponible | no disponible | GGUF (imatrix) | Misma base con cuantización ponderada |

La comparación directa con Llama 3 8B Instruct es la más pertinente por herencia arquitectónica, pero no hay datos que permitan afirmar que el merge mejora o degrada el rendimiento del modelo original. Mistral 7B Instruct ofrece una licencia Apache 2.0 clara y contexto documentado, lo que lo hace más adecuado para producción que un merge sin licencia declarada.

## Limitaciones y advertencias

- Licencia no declarada: los metadatos de HuggingFace no especifican licencia, lo que impide determinar si el uso comercial está permitido. Hereda potencialmente las restricciones de Llama 3 Community License si los modelos de origen son Llama 3, pero esto no está confirmado.
- Modelo base sin documentación: la model card original de DoppelReflEx/L3-8B-WolfCore no está incluida, por lo que se desconoce el proceso de merge, los modelos fusionados y las evaluaciones realizadas.
- Solo inglés: no se declara soporte multilingüe, a diferencia de Llama 3 que soporta oficialmente varios idiomas.
- Riesgo de alucinación: inherente a los modelos de 8B y potencialmente agravado por un merge no evaluado; no hay benchmarks que cuantifiquen su fiabilidad.
- Contexto desconocido: no se especifica la longitud de contexto soportada, lo que dificulta planificar aplicaciones con ventanas largas.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M están marcadas por el propio autor como de menor calidad; para producción se recomienda Q4_K_M o superior.
- Sin soporte documentado de tool calling ni agentes: no apto para pipelines que dependan de function calling sin verificación previa.
- Adopción muy baja (62 descargas, 1 like): no hay retroalimentación comunitaria que valide su comportamiento en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/L3-8B-WolfCore-GGUF
- Modelo base: https://huggingface.co/DoppelReflEx/L3-8B-WolfCore
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/L3-8B-WolfCore-i1-GGUF
- Página de overview del autor: https://hf.tst.eu/model#L3-8B-WolfCore-GGUF
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
