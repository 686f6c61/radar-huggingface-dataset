# mradermacher/CNY-14B-i1-GGUF

## Resumen

CNY-14B-i1-GGUF es una versión cuantizada en formato GGUF del modelo CNY-14B, preparada por el equipo de mradermacher para su uso en inferencia local con herramientas como llama.cpp, Ollama o vLLM. El modelo original, publicado por Allen-UQ, no dispone de una ficha técnica pública en la información disponible, por lo que los detalles sobre su arquitectura, entrenamiento y licencia original no se pueden confirmar. Esta versión GGUF incluye cuantizaciones con imatrix (importance matrix) y está etiquetada como compatible con endpoints y orientada a conversación.

La relevancia de esta publicación radica en que ofrece un modelo de aproximadamente 14 770 millones de parámetros en un formato optimizado para ejecución en hardware de consumo, con múltiples niveles de cuantización que permiten ajustar el equilibrio entre calidad y requisitos de memoria. Al estar basada en el trabajo de mradermacher, un creador conocido por sus cuantizaciones de modelos open source, se espera que los archivos GGUF sean compatibles con el ecosistema estándar de inferencia local. Sin embargo, al carecer de documentación sobre el modelo base, cualquier evaluación de capacidades debe realizarse de forma empírica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 14 770 033 664 |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors del modelo original no incluido en este repo) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo CNY-14B original. El repositorio de HuggingFace de esta versión GGUF solo indica que se trata de una cuantización ponderada con imatrix del modelo alojado en Allen-UQ/CNY-14B. No se especifican datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas particulares del modelo base. La única información técnica adicional es que los archivos GGUF fueron generados con la herramienta de cuantización de Nicoboss, según los comentarios en la model card.

## Capacidades

- Conversación: el tag "conversational" sugiere que el modelo está orientado a tareas de diálogo, aunque no se detallan características específicas como manejo de contexto multi-turno o personalidad.
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que los archivos GGUF pueden servir como backend para servidores de inferencia compatibles con la API de OpenAI, como llama.cpp server o vLLM.
- Cuantizaciones variadas: la amplia gama de niveles de cuantización permite adaptar el modelo a diferentes capacidades de hardware, desde CPU con poca RAM hasta GPUs de gama alta.
- No se dispone de información sobre capacidades de tool calling, razonamiento multi-paso, generación de código, matemáticas, visión o audio.

## Casos de uso

- Despliegue local de un asistente conversacional: al ser un modelo GGUF de 14B, puede ejecutarse en una GPU de consumo (por ejemplo, RTX 3090 o 4090) con cuantizaciones Q4 o Q5, ofreciendo respuestas en tiempo real sin depender de servicios en la nube.
- Prototipado rápido de aplicaciones de chat: gracias a la compatibilidad con endpoints, se puede integrar en frameworks como LangChain o LlamaIndex mediante la API de OpenAI, sustituyendo el backend por este modelo local.
- Evaluación de calidad de cuantización: los distintos niveles (desde IQ1_M hasta Q6_K) permiten comparar la degradación de rendimiento frente al ahorro de memoria, útil para decidir el punto óptimo en un proyecto concreto.
- Inferencia en CPU: las cuantizaciones más pequeñas (Q2_K, IQ2_M) pueden ejecutarse en CPU con suficiente RAM, habilitando uso en entornos sin GPU dedicada.
- Experimentación con imatrix: al incluir cuantizaciones con importance matrix, se puede estudiar cómo afecta esta técnica a la calidad de salida en tareas específicas.
- Integración en pipelines de generación de texto: cualquier aplicación que requiera un modelo de lenguaje de tamaño medio puede usar este GGUF como reemplazo de modelos propietarios, siempre que se validen sus capacidades reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K u otras evaluaciones para este modelo o su versión original en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: para un modelo de 14 770 millones de parámetros, las cuantizaciones más comunes (Q4_K_M, Q5_K_M) ocupan aproximadamente entre 8 y 10 GB de memoria. Las versiones más pequeñas (Q2_K, IQ2_M) pueden requerir menos de 6 GB, mientras que Q6_K supera los 11 GB.
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), o GPUs de datacenter como A10G (24 GB) o A100 (40 GB) para las cuantizaciones más altas. Con cuantizaciones bajas, una RTX 3060 de 12 GB o incluso una GTX 1080 Ti de 11 GB podrían ser suficientes.
- Ejecución en CPU: posible con cuantizaciones Q2 o IQ2 si se dispone de al menos 8-12 GB de RAM libre, aunque la velocidad será significativamente menor.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con backend GGUF), text-generation-webui, o cualquier servidor compatible con la API de OpenAI que acepte modelos GGUF.
- Latencia y throughput: no se dispone de mediciones oficiales. En una RTX 4090 con cuantización Q4_K_M, se puede esperar una velocidad de generación de entre 30 y 60 tokens por segundo, pero esto es una estimación general para modelos de 14B y no un dato verificado.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base CNY-14B no tiene documentación pública, por lo que no se pueden contrastar sus parámetros, contexto o rendimiento con alternativas como Llama 3.1 8B, Mistral 7B o Qwen 2.5 14B. Se recomienda al usuario evaluar el modelo directamente en sus tareas de interés antes de adoptarlo en producción.

## Limitaciones y advertencias

- Ausencia de documentación: al no existir una model card del modelo original, se desconocen sus sesgos, limitaciones de idioma, contexto máximo y comportamiento en tareas específicas.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados.
- Licencia no especificada: no se indica la licencia del modelo original ni de esta cuantización, lo que impide garantizar su uso comercial o la redistribución. Se debe contactar con el autor original antes de utilizarlo en productos comerciales.
- Pérdida de calidad por cuantización: las versiones con menor precisión (Q2, IQ1, IQ2) pueden degradar notablemente la coherencia y el razonamiento del modelo.
- Sin garantías de rendimiento: al no haber benchmarks, no se puede afirmar que el modelo compita con otros de tamaño similar en tareas estándar.
- Fecha de creación futura: el repositorio indica una fecha de creación de septiembre de 2026, lo que sugiere que el modelo es muy reciente o que la fecha es incorrecta; esto añade incertidumbre sobre su madurez.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mradermacher/CNY-14B-i1-GGUF
- Modelo original (Allen-UQ): https://huggingface.co/Allen-UQ/CNY-14B
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
- Página de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
