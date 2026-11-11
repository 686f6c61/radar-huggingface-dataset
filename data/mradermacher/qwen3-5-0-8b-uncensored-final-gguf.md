# mradermacher/Qwen3.5-0.8B-Uncensored-Final-GGUF

## Resumen

Qwen3.5-0.8B-Uncensored-Final-GGUF es una versión cuantizada en formato GGUF del modelo abdukuzi45/Qwen3.5-0.8B-Uncensored-Final, un derivado de la familia Qwen3.5 de Alibaba sometido a un proceso de "abliteration" (ablación de direcciones de rechazo en el espacio de activaciones) para eliminar los mecanismos de rechazo aprendidos durante el alineamiento. El autor de esta versión cuantizada es mradermacher, un conocido publicador de cuantizaciones GGUF en Hugging Face. El modelo base cuenta con 772.845.888 parámetros (aproximadamente 0,8 mil millones), lo que lo sitúa en la gama ultraligera.

El interés de esta ficha radica en que combina tres elementos poco habituales: un tamaño muy reducido que permite ejecución en hardware de consumo modesto, un proceso de abliteration que elimina las negativas del modelo, y un conjunto de cuantizaciones estáticas (desde Q2_K hasta f16) más un suplemento multimodal mmproj que sugiere capacidades de visión en el modelo original. El modelo declara soporte para inglés y amárico, lo que lo hace relevante para aplicaciones en lenguas de bajos recursos.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Sin embargo, la ausencia de benchmarks publicados, de model card detallada por parte del autor original y de información sobre el proceso de entrenamiento limita seriamente la evaluación rigurosa del modelo. Esta ficha refleja exclusivamente la información disponible en el repositorio de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5), no disponible el detalle exacto |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj-Q8_0 y mmproj-f16 (multimodal) |
| Idiomas soportados | inglés (en), amárico (am) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su pertenencia a la familia Qwen3.5 y su naturaleza de transformer. No se especifican el número de capas, la dimensión oculta, el número de cabezas de atención ni la longitud de contexto nativa. El dato de 772.845.888 parámetros totales proviene de los safetensors del modelo base, lo que confirma que no se trata de una arquitectura MoE (no se indican parámetros activos distintos de los totales).

El aspecto técnico más relevante es el proceso de abliteration aplicado por el autor del modelo base (abdukuzi45): se trata de una técnica que identifica y resta la dirección de activación asociada al rechazo de peticiones, de modo que el modelo deja de negarse a responder ante ciertos contenidos. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO posteriores a la ablación. La presencia de ficheros mmproj (multi-modal supplement) en el repositorio sugiere que el modelo base incorpora un proyector multimodal, probablemente para entrada de imágenes, aunque no se detalla su funcionamiento. Las cuantizaciones son estáticas (no ponderadas ni imatrix), según indica el propio autor.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el pipeline de transformers indican uso previsto para diálogo multi-turno.
- Razonamiento básico y respuesta a instrucciones, condicionado por el tamaño reducido del modelo (0,8B parámetros).
- Capacidad multimodal probable: la presencia de ficheros mmproj-Q8_0 y mmproj-f16 apunta a entrada de imágenes, aunque no se documenta el alcance ni la calidad.
- Multilingüismo limitado: inglés y amárico declarados; no se garantiza soporte de otros idiomas.
- Comportamiento "uncensored": el proceso de abliteration elimina los rechazos, por lo que el modelo responde a peticiones que el modelo original rechazaría.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking.
- No se documenta capacidad de código ni matemáticas de forma específica.

## Casos de uso

- Experimentación con técnicas de abliteration: investigadores que estudian cómo la ablación de direcciones de activación afecta al comportamiento del modelo pueden usar esta versión cuantizada para comparar respuestas antes y después del proceso, con la ventaja de que cabe en un portátil.
- Despliegue en dispositivos de bajos recursos: con cuantizaciones de 0,5-0,7 GB, el modelo puede ejecutarse en Raspberry Pi, móviles de gama alta o portátiles sin GPU dedicada mediante llama.cpp u Ollama, para tareas de generación de texto breve.
- Prototipado rápido de chatbots: al ser un modelo conversacional de 0,8B, permite iterar sobre prompts y flujos de diálogo sin coste de infraestructura, antes de migrar a modelos mayores.
- Aplicaciones en amárico: es uno de los pocos modelos pequeños que declara soporte de amárico, útil para traducción asistida, generación de contenido o asistentes en esa lengua, aunque la calidad no está verificada.
- Análisis de imágenes en entornos locales: si el proyector mmproj funciona correctamente, podría usarse para descripción de imágenes o VQA básico en local, sin enviar datos a la nube.
- Investigación sobre seguridad y alineamiento: como modelo sin rechazos, sirve para estudiar riesgos de modelos abliterated, generar datasets de contraste o evaluar filtros de contenido en pipelines de moderación.
- Generación de texto creativo sin restricciones temáticas: escritura de ficción, guiones o contenido que los modelos alineados suelen rechazar, siempre que el usuario asuma la responsabilidad legal y ética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB (Q2_K) y 1,7 GB (f16) solo para los pesos; añadir 0,2-0,3 GB si se usa el proyector multimodal mmproj.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, GTX 1650 o superiores son suficientes. También funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas de los últimos diez años, e incluso en iGPU modernas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (oobabooga), y servidores compatibles con GGUF. Para el modelo base en safetensors, transformers con PyTorch.
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamaño (0,8B), se espera decodificación de decenas a cientos de tokens por segundo en GPU de consumo y de decenas en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Uncensored-Final-GGUF (este) | 772,8 M | no disponible | Apache 2.0 | GGUF | Abliterated, multimodal probable, en/am |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Alineado, sin abliteration, contexto documentado |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens (según documentación pública de Meta) | Llama 3.2 Community License | safetensors, GGUF | Alineado, contexto largo, licencia con restricciones |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens (según documentación pública) | Apache 2.0 | safetensors, GGUF | Alineado, entrenado con datos curados |

La comparación es aproximada: los datos de los modelos alternativos provienen de documentación pública general y no de una evaluación conjunta. El modelo de esta ficha destaca por su naturaleza abliterated y su soporte de amárico, pero carece de contexto documentado y de benchmarks, lo que dificulta una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que no se puede afirmar nada sobre su calidad real.
- Modelo abliterated: la eliminación de rechazos implica que puede generar contenido dañino, ilegal o éticamente problemático sin filtros; requiere moderación externa en producción.
- Riesgo elevado de alucinación: con 0,8B parámetros, la capacidad de razonamiento y de mantener coherencia factual es limitada; no apto para tareas que exijan precisión.
- Contexto desconocido: no se documenta la longitud de contexto, lo que impide planificar aplicaciones con ventanas largas.
- Idiomas limitados: solo inglés y amárico declarados; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Model card mínima: el autor de la cuantización no aporta información sobre el modelo base más allá de los tags; no hay detalles de entrenamiento, dataset ni evaluación.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo (por ejemplo, en la UE, el AI Act).
- Cuantizaciones estáticas: el autor indica que no hay versiones ponderadas ni imatrix, lo que puede afectar a la calidad en cuantizaciones bajas (Q2_K, Q3_K_S).
- Multimodalidad no verificada: la presencia de mmproj no garantiza que el modelo funcione bien con imágenes; no hay documentación de uso.

## Enlaces

- Repositorio Hugging Face (cuantizaciones): https://huggingface.co/mradermacher/Qwen3.5-0.8B-Uncensored-Final-GGUF
- Modelo base: https://huggingface.co/abdukuzi45/Qwen3.5-0.8B-Uncensored-Final
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.5-0.8B-Uncensored-Final-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
