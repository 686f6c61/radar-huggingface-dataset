# mradermacher/Changeling-v1.0-24b-GGUF

## Resumen

Changeling-v1.0-24b-GGUF es la versión cuantizada en formato GGUF del modelo Changeling-v1.0-24b, publicada por el usuario mradermacher. El modelo original, desarrollado por Yoesph, es un merge de modelos (construido con mergekit) de aproximadamente 23.570 millones de parámetros (23,57 B), orientado a tareas conversacionales y entrenado únicamente en inglés. Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo inviable con los pesos completos en precisión nativa.

La relevancia de esta ficha radica en que mradermacher actúa como cuantizador de terceros: no entrena ni modifica el modelo, sino que genera una batería de cuantizaciones estáticas (de Q2_K a Q8_0) para facilitar el despliegue local. El repositorio ocupa 161,4 GB en total porque incluye todas las variantes de cuantización, aunque cada archivo individual pesa entre 9 GB (Q2_K) y 25,2 GB (Q8_0). Existe además una versión con cuantización ponderada/imatrix en un repositorio separado.

Al tratarse de un merge sin model card técnico detallado en la información disponible, faltan datos clave como la longitud de contexto, la licencia o los detalles del dataset de entrenamiento. Esto limita la evaluación rigurosa del modelo para producción, y conviene tratar esta ficha como una referencia de despliegue más que como una evaluación de capacidades.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos con mergekit; detalles de arquitectura no disponibles) |
| Parámetros totales | 23.572.403.200 (23,57 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); variantes imatrix en repositorio i1-GGUF |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo original Changeling-v1.0-24b es un merge construido con mergekit, según las etiquetas del repositorio. Esto implica que sus pesos proceden de la combinación de dos o más modelos base mediante alguna técnica de fusión (no se especifica cuál: podría ser SLERP, TIES, DARE u otra). No se dispone de información sobre la arquitectura interna concreta (número de capas, dimensión de atención, tipo de atención), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

La contribución de mradermacher se limita al proceso de cuantización: convierte los pesos safetensors del modelo base a GGUF mediante herramientas de llama.cpp, generando cuantizaciones estáticas de distintos tamaños. El repositorio incluye una variante con cuantización ponderada/imatrix (i1-GGUF) que, según la model card, suele ofrecer mejor calidad que las cuantizaciones estáticas del mismo tamaño. No se documenta ningún reentrenamiento ni ajuste fino adicional.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Razonamiento general y respuesta a instrucciones (capacidad inferida del propósito del modelo, no verificada con benchmarks).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- Compatible con endpoints (etiqueta `endpoints_compatible`), lo que sugiere uso en infraestructuras de inferencia estándar.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede desplegarse con llama.cpp u Ollama en una estación de trabajo con GPU de consumo, usando la cuantización Q4_K_M (14,4 GB) para diálogos multi-turno sin depender de la nube. Adecuado por su naturaleza conversacional y su tamaño manejable.
- Prototipado de chatbots en inglés: gracias a las cuantizaciones Q4_K_S y Q4_K_M (marcadas como "fast, recommended" en la model card), es posible iterar rápidamente en el desarrollo de un bot sin infraestructura dedicada.
- Experimentación con merges de modelos: investigadores interesados en evaluar la calidad de fusiones con mergekit pueden usar esta versión GGUF para comparar el comportamiento del merge frente a sus modelos constituyentes sin cargar los pesos completos.
- Generación de texto offline en entornos con requisitos de privacidad: al ejecutarse localmente con llama.cpp, los datos no salen del equipo, lo que encaja en escenarios con datos sensibles (siempre que la licencia, no disponible, lo permita).
- Evaluación comparativa de cuantizaciones: el repositorio ofrece desde Q2_K (9 GB) hasta Q8_0 (25,2 GB), lo que permite medir la degradación de calidad según el nivel de cuantización en tareas conversacionales.
- Despliegue en servidores con una sola GPU de 24 GB: la cuantización Q6_K (19,4 GB) o Q8_0 (25,2 GB, ajustada) permiten servir el modelo en una RTX 4090 o A10G para cargas de trabajo moderadas en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más el overhead de contexto. Orientativamente: Q2_K ~9 GB, Q4_K_M ~14,4 GB, Q6_K ~19,4 GB, Q8_0 ~25,2 GB, más 1-3 GB adicionales según la longitud de contexto configurada.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M, Q5_K_M o Q6_K; A100 40/80 GB o H100 para Q8_0 con contexto amplio; GPUs de 16 GB (RTX 4080, A4000) solo para cuantizaciones Q3 o IQ4_XS.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M o inferiores en GPUs de 16-24 GB. Las cuantizaciones Q2_K y Q3_K_S podrían ejecutarse incluso en GPUs de 12 GB, con degradación de calidad notable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para mayor throughput en servidor, vLLM o TGI requerirían los pesos safetensors del modelo base, no los GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Changeling-v1.0-24b-GGUF | 23,57 B | no disponible | no disponible | GGUF | Hugging Face (mradermacher) |
| Modelo base Yoesph/Changeling-v1.0-24b | 23,57 B | no disponible | no disponible | safetensors | Hugging Face |
| Merges de ~24 B con mergekit (genéricos) | ~24 B | variable | variable | safetensors/GGUF | Hugging Face |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (por ejemplo, Mistral Small, Qwen 2.5 32B u otros merges de tamaño similar), ya que no se han publicado benchmarks ni especificaciones de contexto del modelo. La comparativa queda limitada a la relación entre el modelo base y su versión cuantizada.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse si se permite uso comercial; conviene contactar con el autor del modelo base antes de usarlo en producción.
- Modelo entrenado únicamente en inglés: el rendimiento en castellano u otros idiomas será previsiblemente deficiente.
- Al ser un merge con mergekit sin documentación técnica, se desconoce la composición exacta y los sesgos heredados de los modelos fusionados.
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala, agravado por la ausencia de benchmarks que validen su fiabilidad.
- Las cuantizaciones Q2_K y Q3_K presentan degradación de calidad significativa; la model card recomienda Q4_K_M o superiores para uso práctico.
- Longitud de contexto desconocida: no es posible planificar cargas con ventanas largas sin verificar experimentalmente el límite real.
- Repositorio de 161,4 GB: la descarga completa es costosa; conviene descargar solo el archivo GGUF necesario.
- Sin datos de benchmarks ni evaluación independiente: no se recomienda su adopción en producción sin una evaluación propia previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Changeling-v1.0-24b-GGUF
- Modelo base: https://huggingface.co/Yoesph/Changeling-v1.0-24b
- Cuantizaciones imatrix (i1-GGUF): https://huggingface.co/mradermacher/Changeling-v1.0-24b-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Changeling-v1.0-24b-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
