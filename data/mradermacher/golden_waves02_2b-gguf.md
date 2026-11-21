# mradermacher/Golden_Waves02_2b-GGUF

## Resumen

Golden_Waves02_2b-GGUF es la versión cuantizada en formato GGUF del modelo Sumail/Golden_Waves02_2b, publicada por mradermacher, un conocido creador de cuantizaciones estáticas para la comunidad. El modelo base es un merge (fusión) de modelos construido con mergekit, orientado a conversación en inglés, con aproximadamente 2.506 millones de parámetros (2,5 B). Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados, algo imposible con los pesos originales en precisión completa.

El modelo resuelve el problema de despliegue local de un modelo conversacional de tamano medio: al ofrecer cuantizaciones desde Q2_K (1,3 GB) hasta f16 (5,1 GB), permite elegir el equilibrio entre calidad y consumo de memoria según el hardware disponible. Es relevante para desarrolladores que quieren probar merges comunitarios en entornos sin GPU dedicada o con VRAM limitada.

La información disponible es escasa: no se documentan la longitud de contexto, la licencia, los datos de entrenamiento ni resultados de benchmarks. La model card del cuantizador se limita a listar los ficheros GGUF y remite a la página del modelo base, por lo que muchos campos de esta ficha quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos con mergekit; detalles no disponibles) |
| Parametros totales | 2.506.172.416 (2,5 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones) y safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base Sumail/Golden_Waves02_2b es un merge construido con mergekit, según las etiquetas del repositorio. No se dispone de información sobre la arquitectura interna concreta (número de capas, dimensión oculta, tipo de atención), los modelos fusionados que lo componen, el número de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta ninguna innovación técnica destacable.

La contribución de esta ficha (el repositorio de mradermacher) es exclusivamente la cuantización estática a GGUF mediante el pipeline de conversión de llama.cpp. La model card indica que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicación y que podrían solicitarse mediante una discusión comunitaria.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- No se documentan capacidades específicas de razonamiento, código o matemáticas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Prototipado local de chatbots: el modelo puede ejecutarse en un portátil con llama.cpp u Ollama usando la cuantización Q4_K_M (1,7 GB), lo que permite iterar sobre prompts y flujos conversacionales sin coste de API.
- Experimentación con merges comunitarios: investigadores que estudian el efecto de las fusiones de modelos pueden comparar este merge con sus componentes originales usando las cuantizaciones ligeras.
- Despliegue en dispositivos con poca memoria: la cuantización Q2_K (1,3 GB) permite ejecutar el modelo en entornos con menos de 2 GB de RAM libre, útil para demos en Raspberry Pi o contenedores pequeños.
- Evaluación de calidad de cuantizaciones: al ofrecer 12 niveles de cuantización, sirve para medir la degradación de perplejidad entre Q2_K y Q8_0 en un modelo de 2,5 B.
- Generación de texto offline: integrable en aplicaciones de escritorio que requieren inferencia sin conexión mediante la librería llama.cpp.
- Fines educativos: modelo pequeño y ligero para enseñar el funcionamiento de la cuantización GGUF y el despliegue local de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (según cuantización): Q2_K ~1,3 GB; Q4_K_M ~1,7 GB; Q6_K ~2,2 GB; Q8_0 ~2,8 GB; f16 ~5,1 GB. Añadir margen para el contexto y el runtime (típicamente 0,5-1 GB adicionales).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4-Q8 (GTX 1650, RTX 3050, RTX 4060). Para f16 se recomienda 8 GB o más (RTX 3060 Ti, RTX 4070).
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU modernas, e incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles; para un modelo de 2,5 B en Q4_K_M se espera un throughput alto en GPU de consumo, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Golden_Waves02_2b-GGUF | 2,5 B | no disponible | no disponible | GGUF | Merge comunitario con 12 cuantizaciones |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo oficial con benchmarks publicados |
| Llama-3.2-1B-Instruct | 1,2 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Modelo oficial de Meta con tool calling |
| Gemma-2-2B-it | 2,6 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Modelo oficial de Google con benchmarks |

La comparación es aproximada: los tres alternativas tienen documentación oficial, licencia clara y benchmarks publicados, mientras que Golden_Waves02_2b carece de ellos. Para producción se recomienda evaluar los modelos oficiales frente a este merge comunitario.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es un riesgo importante para producción.
- Modelo base sin model card detallada: se desconoce la composición del merge, los datos de entrenamiento y las técnicas de alineación.
- Solo inglés: no se ha validado su comportamiento en castellano ni en otros idiomas.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas.
- Riesgo de alucinación: al ser un merge comunitario sin evaluación publicada, no hay garantías sobre la fidelidad factual.
- Sesgos desconocidos: sin información sobre el dataset de entrenamiento, no se pueden evaluar sesgos de género, raza o ideológicos.
- Cuantizaciones Q2_K y Q3_K_M marcadas como de menor calidad por el propio cuantizador; para uso serio se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix/ponderadas disponibles en el momento de la publicación, lo que limita la calidad máxima alcanzable en cuantizaciones bajas.
- Repositorio con 0 likes y 212 descargas: comunidad muy reducida, sin validación externa.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Golden_Waves02_2b-GGUF
- Modelo base: https://huggingface.co/Sumail/Golden_Waves02_2b
- Página de descargas del cuantizador: https://hf.tst.eu/model#Golden_Waves02_2b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- mergekit: https://github.com/arcee-ai/mergekit
- llama.cpp: https://github.com/ggerganov/llama.cpp
