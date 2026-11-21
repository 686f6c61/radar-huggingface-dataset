# mradermacher/Miko-M7-V3-i1-GGUF

## Resumen

Miko-M7-V3-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo base ricer0ll/Miko-M7-V3, un modelo de lenguaje conversacional de aproximadamente 7.240 millones de parámetros (7,24 B). El repositorio no contiene un modelo original, sino una batería de ficheros GGUF en cuantizaciones estáticas e imatrix (i1) pensadas para ejecución local con llama.cpp y derivados (Ollama, LM Studio, koboldcpp). El modelo base se etiqueta como "mistral", lo que sugiere una arquitectura transformer derivada de la familia Mistral, y se distribuye únicamente en inglés.

La relevancia de esta ficha es práctica: permite a desarrolladores e investigadores desplegar un modelo conversacional de 7 B en hardware de consumo con un abanico de cuantizaciones que va desde 1,7 GB (i1-IQ1_S) hasta 6,0 GB (i1-Q6_K). Las cuantizaciones i1 incorporan una matriz de importancia (imatrix) generada sobre el propio modelo, lo que en la práctica de llama.cpp suele traducirse en una degradación de perplejidad menor que las cuantizaciones estáticas equivalentes en tamaño.

Conviene señalar desde el principio que el modelo está marcado como `not-for-all-audiences` y que su dataset de entrenamiento declarado es `anthracite-org/stheno-filtered-v1.1`, un corpus de rol y conversación sin filtros de seguridad. Esto condiciona fuertemente su uso en producción: es un modelo para experimentación y generación creativa, no un asistente corporativo al uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetado "mistral" en la model card; detalles no disponibles) |
| Parametros totales | 7.241.732.096 (7,24 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (todas con imatrix) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | No disponible |
| Formato de pesos | GGUF (multiples ficheros por cuantizacion); el modelo base original esta en safetensors |

## Arquitectura y entrenamiento

La model card del repositorio cuantizado no describe la arquitectura interna del modelo base. La única pista es la etiqueta `mistral`, que apunta a un transformer decoder-only con atención de tipo Mistral (probablemente con sliding window attention en el modelo original, aunque no se confirma). El recuento de parámetros real de safetensors es de 7.241.732.096, consistente con un modelo de ~7 B de la familia Mistral/Llama 2.

En cuanto a datos de entrenamiento, la model card declara `anthracite-org/stheno-filtered-v1.1` como dataset. Este corpus es conocido en la comunidad por estar orientado a roleplay y conversación sin censura, filtrado pero no alineado con políticas de seguridad estándar. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF, DPO o fine-tuning supervisado adicionales. Tampoco se detalla ninguna innovación técnica específica (decodificación especulativa, atención linear, etc.) más allá de la propia cuantización imatrix aplicada por mradermacher.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, orientada a diálogo abierto y roleplay.
- Generación creativa: ficción, narrativa y continuación de texto con estilo libre.
- Conversación sin restricciones de contenido (marcado `not-for-all-audiences`), lo que incluye material para adultos.
- Soporte de plantillas de chat conversacionales (tag `conversational`), compatible con el formato de chat del modelo base.
- Ejecución local en CPU y GPU mediante llama.cpp y frontales compatibles (Ollama, LM Studio, koboldcpp, text-generation-webui).
- Compatibilidad con endpoints compatibles (`endpoints_compatible`), lo que permite servir el modelo con infraestructura tipo TGI/OpenAI-compatible en GGUF.
- Capacidades de tool calling, function calling, agentes o razonamiento multi-paso: no disponibles / no documentadas.
- Capacidades multilingües: no disponibles más allá del inglés declarado.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Roleplay y narrativa interactiva local: el modelo está entrenado sobre un corpus de rol (stheno-filtered), por lo que es adecuado para motores de historias conversacionales en los que el usuario controla personajes y el modelo mantiene el tono y la coherencia. La cuantización i1-Q4_K_M (4,5 GB) ofrece un equilibrio razonable entre calidad y huella de memoria para este fin.
- Experimentación con cuantizaciones imatrix: investigadores que quieran medir la degradación de perplejidad entre i1-IQ2_M (2,6 GB) e i1-Q6_K (6,0 GB) sobre un mismo modelo base tienen aquí una batería completa de variantes para hacerlo con llama.cpp y `llama-perplexity`.
- Generación creativa sin filtros en estaciones de trabajo aisladas: escritura de ficción adulta o guiones donde los modelos alineados rechazan el contenido. El marcado `not-for-all-audiences` y la licencia no disponible obligan a un uso estrictamente interno y no comercial.
- Prototipado de frontales de chat: desarrolladores que construyen interfaces conversacionales pueden usar el modelo como backend local barato (cabe en 8 GB de VRAM en Q4_K_M) para validar UX de chat multi-turno antes de pasar a modelos mayores.
- Fine-tuning y destilación sobre el modelo base: las cuantizaciones no sirven para entrenar, pero el repositorio base ricer0ll/Miko-M7-V3 (safetensors) sí puede usarse como punto de partida para LoRA/QLoRA en una sola GPU de 24 GB.
- Evaluación comparativa de calidad de cuantización: dado que mradermacher publica tanto cuantizaciones estáticas (Miko-M7-V3-GGUF) como imatrix (este repositorio), es un caso de estudio útil para comparar ambos esquemas sobre el mismo modelo y dataset.
- Despliegue en entornos sin GPU: con i1-Q4_K_S (4,2 GB) el modelo corre en CPU en un portátil moderno con 16 GB de RAM, útil para demos offline o entornos air-gapped.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de calidad, y tampoco se han encontrado datos del modelo base en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo + overhead de contexto, aproximada):
  - i1-IQ1_S: ~1,7 GB de pesos; ~2,5-3 GB con contexto moderado.
  - i1-IQ2_M: ~2,6 GB de pesos; ~3,5-4 GB en uso real.
  - i1-IQ3_M: ~3,4 GB de pesos; ~4,5-5 GB en uso real.
  - i1-Q4_K_M: ~4,5 GB de pesos; ~5,5-6,5 GB en uso real.
  - i1-Q5_K_M: ~5,2 GB de pesos; ~6,5-7,5 GB en uso real.
  - i1-Q6_K: ~6,0 GB de pesos; ~7,5-8,5 GB en uso real.
- GPU recomendadas:
  - Consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 (cualquier cuantización hasta Q6_K con contexto amplio).
  - Profesional: A100 40/80 GB, H100 80 GB (sobredimensionadas para 7 B; útiles solo para servir muchas instancias en paralelo).
- ¿Cabe en consumer GPU? Sí. Incluso una GTX 1660 6 GB puede ejecutar i1-IQ3_M; una RTX 3060 12 GB ejecuta Q6_K con contexto largo. En CPU, 16 GB de RAM son suficientes para Q5_K_M.
- Opciones de despliegue: llama.cpp (referencia), Ollama, LM Studio, koboldcpp, text-generation-webui con loader llama.cpp, y servidores compatibles con la API de OpenAI que acepten GGUF (p. ej. llama-cpp-python, llama.cpp server). vLLM y TGI no soportan GGUF de forma nativa; para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un 7 B en Q4_K_M en una RTX 4090 suele superar las decenas de tokens por segundo, pero no se han publicado mediciones específicas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Miko-M7-V3-i1-GGUF (este) | 7,24 B | No disponible | No disponible | GGUF (i1) | Fine-tune conversacional sin filtros, solo inglés |
| ricer0ll/Miko-M7-V3 (base) | 7,24 B | No disponible | No disponible | Safetensors | Modelo original; necesario para fine-tuning y para vLLM/TGI |
| Mistral-7B-Instruct-v0.2 | 7,24 B | 32.768 | Apache 2.0 | Safetensors, GGUF | Referencia alineada, multilingüe, uso comercial permitido |
| Llama-3.1-8B-Instruct | 8,03 B | 131.072 | Llama 3.1 Community | Safetensors, GGUF | Más reciente, contexto muy superior, alineado |
| Zephyr-7B-beta | 7,24 B | 32.768 | MIT | Safetensors, GGUF | Alternativa alineada de la misma familia |

La comparación con Mistral-7B-Instruct y Llama-3.1-8B-Instruct es la más directa por tamaño y familia. Miko-M7-V3 se diferencia por su orientación a conversación sin filtros y por la ausencia de licencia declarada, lo que lo descarta para uso comercial. Frente a Zephyr-7B-beta, la diferencia principal es la alineación: Zephyr es seguro por defecto, Miko no.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explícita, no se puede asumir permiso de uso comercial. Tratar el modelo como no comercial y de uso interno hasta que el autor del modelo base aclare la licencia.
- Contenido no apto para todas las audiencias: el tag `not-for-all-audiences` y el dataset stheno-filtered implican que el modelo puede generar contenido adulto, violento u ofensivo sin filtros. No desplegar en aplicaciones de cara al público sin una capa de moderación externa.
- Sesgos conocidos: no documentados en la información disponible, pero al estar entrenado sobre un corpus de rol en inglés, es esperable un sesgo hacia registros narrativos y una cobertura limitada de dominios técnicos.
- Riesgo de alucinación: alto en tareas de conocimiento factual, dado que el modelo está orientado a conversación y no a recuperación de hechos. No usar como fuente de verdad.
- Limitación de idioma: solo inglés declarado; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con contexto largo sin verificar experimentalmente el límite del modelo base.
- Cuantizaciones de muy baja calidad: i1-IQ1_S, i1-IQ1_M e i1-Q2_K_S están marcadas por el propio autor como "for the desperate", "mostly desperate" o "very low quality"; no usarlas en producción.
- Repositorio de 81,7 GB: descargar solo los ficheros GGUF necesarios, no el repositorio completo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas; cualquier decisión de producción debería basarse en una evaluación propia.
- Fecha de creación futura en los metadatos (2026-11-17): dato anómalo que conviene verificar antes de citar el modelo.

## Enlaces

- Repositorio Hugging Face (este): https://huggingface.co/mradermacher/Miko-M7-V3-i1-GGUF
- Modelo base: https://huggingface.co/ricer0ll/Miko-M7-V3
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Miko-M7-V3-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Miko-M7-V3-i1-GGUF
- Dataset declarado: https://huggingface.co/datasets/anthracite-org/stheno-filtered-v1.1
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
