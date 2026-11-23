# mradermacher/Gemma3NPC-4B-no-thinking-GGUF

## Resumen

Gemma3NPC-4B-no-thinking-GGUF es la versión cuantizada en formato GGUF del modelo chimbiwide/Gemma3NPC-4B-no-thinking, un fine-tuning de Gemma 3 de 4B parámetros orientado a la interpretación de personajes no jugadores (NPC) en juegos de rol. El trabajo de cuantización lo firma mradermacher, un publicador habitual de versiones GGUF de modelos open source, y se distribuye bajo la licencia Gemma de Google.

El modelo resuelve un problema concreto: disponer de un LLM ligero (3.880.263.168 parámetros, es decir, aproximadamente 3,88 mil millones) capaz de mantener diálogos de rol coherentes y con personalidad sin necesidad de hardware de gama alta. Al estar en GGUF, puede ejecutarse en CPU o en GPU de consumo mediante llama.cpp u Ollama, lo que lo hace apto para integrarse en prototipos de videojuegos, herramientas de escritura creativa o demos interactivas.

La variante "no-thinking" indica que el fine-tuning se entrenó sin modo de razonamiento explícito, de modo que genera respuestas directas en estilo conversacional. El dataset de entrenamiento declarado es chimbiwide/NPC-RP-No-Thinking y el idioma indicado en la model card es únicamente inglés. La información pública disponible sobre el modelo base es limitada: no se detallan benchmarks, composición exacta del dataset ni hiperparámetros de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Gemma 3; detalles del fine-tuning no disponibles) |
| Parametros totales | 3.880.263.168 (aproximadamente 3,88B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (inglés; segun la model card) |
| Licencia | gemma (Gemma Terms of Use de Google) |
| Formato de pesos | GGUF (tambien existe el modelo base en formato transformers/safetensors) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Gemma 3 de 4B parámetros de Google, por lo que hereda su arquitectura transformer decoder-only. El autor del fine-tuning (chimbiwide) lo entrenó sobre el dataset chimbiwide/NPC-RP-No-Thinking, un conjunto de datos orientado a roleplay con personajes no jugadores. La etiqueta "no-thinking" sugiere que el entrenamiento evitó ejemplos con cadenas de razonamiento explícitas, priorizando respuestas conversacionales directas. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La contribución de mradermacher es exclusivamente de cuantización: convierte los pesos del modelo base a formato GGUF mediante herramientas de llama.cpp, generando una batería de cuantizaciones estáticas (de Q2_K a f16) y, en un repositorio separado, cuantizaciones ponderadas con imatrix (i1-GGUF) que suelen ofrecer mejor relación calidad/tamaño. No se documentan innovaciones arquitectónicas adicionales más allá de las propias de Gemma 3.

## Capacidades

- Generación de texto conversacional en inglés, con énfasis en diálogos de rol e interpretación de personajes.
- Mantenimiento de personalidad y estilo consistentes a lo largo de una conversación (objetivo declarado del fine-tuning NPC).
- Respuestas directas sin modo de razonamiento explícito (variante "no-thinking").
- Ejecución local en CPU y GPU de consumo gracias al formato GGUF y a las cuantizaciones de 1,8 GB a 7,9 GB.
- Compatibilidad con llama.cpp, Ollama y otros runners que acepten GGUF.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card solo declara inglés.

## Casos de uso

- Diálogos de NPC en prototipos de videojuegos: el modelo puede generar respuestas de personaje en tiempo real dentro de un motor de juego, ejecutándose en local con una cuantización Q4_K_M de 2,6 GB que cabe en GPU de consumo y evita depender de APIs externas.
- Herramientas de escritura creativa y roleplay: escritores pueden usar el modelo para simular conversaciones con personajes y explorar voces narrativas, con la ventaja de que la cuantización Q8_0 (4,2 GB) mantiene buena calidad en un portátil con GPU modesta.
- Chatbots temáticos para demos y ferias: al ser un GGUF ligero, se puede desplegar en un portátil o mini-PC sin GPU dedicada usando Q2_K (1,8 GB) o Q3_K_S (2,0 GB), aceptando la pérdida de calidad a cambio de portabilidad.
- Generación de diálogo para mods de juegos de rol: integrable mediante llama.cpp en pipelines de generación de contenido, produciendo líneas de diálogo coherentes con un personaje definido por un system prompt.
- Investigación sobre fine-tuning de rol: sirve como punto de comparación frente al modelo base Gemma 3 4B para estudiar cómo afecta el entrenamiento específico de NPC a la calidad del diálogo, usando el repositorio i1-GGUF para experimentos con cuantizaciones ponderadas.
- Asistente conversacional de bajo coste en inglés: para aplicaciones donde el inglés es suficiente y se prioriza latencia y coste cero de inferencia, una cuantización Q4_K_S (2,5 GB) ofrece un equilibrio razonable entre velocidad y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): aproximadamente 2,5-3,5 GB con Q4_K_M (2,6 GB de pesos); aproximadamente 4,5-5,5 GB con Q8_0 (4,2 GB); aproximadamente 8,5-9,5 GB con f16 (7,9 GB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100 o H100 no son necesarias para este tamaño, aunque pueden usarse para servir muchas instancias en paralelo.
- Cabe en GPU de consumo: sí. Prácticamente cualquier GPU con 6 GB o más puede ejecutar Q4_K_M; con 4 GB es viable Q3_K_M o IQ4_XS; en CPU pura funciona con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runner compatible con GGUF. El modelo base (transformers) puede servirse con vLLM o TGI si se usa el repositorio original en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma3NPC-4B-no-thinking (este) | 3,88B | no disponible | Gemma | GGUF | Fine-tuning para roleplay/NPC, solo inglés |
| Gemma 3 4B (base de Google) | ~4B | no disponible en esta ficha | Gemma | safetensors, GGUF (via terceros) | Modelo generalista; referencia directa del fine-tuning |
| Qwen2.5-3B-Instruct | ~3B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Alternativa generalista multilingüe con licencia permisiva |
| Llama 3.2 3B Instruct | ~3B | no disponible en esta ficha | Llama 3.2 Community License | safetensors, GGUF | Alternativa generalista de tamaño similar |

La comparación con Qwen2.5-3B y Llama 3.2 3B es orientativa: son modelos generalistas de tamaño comparable, mientras que Gemma3NPC-4B está especializado en diálogo de rol. No se dispone de benchmarks que permitan comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- El modelo está entrenado y declarado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Al ser un fine-tuning especializado en roleplay, puede degradar su rendimiento en tareas generales (código, matemáticas, razonamiento formal) respecto al Gemma 3 4B original.
- Riesgo de alucinación inherente a los LLM de este tamaño, especialmente en cuantizaciones agresivas (Q2_K, Q3_K_S) donde la perplejidad aumenta de forma notable.
- Las cuantizaciones por debajo de Q4 pierden calidad de forma apreciable; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M para uso general.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use de Google, que incluyen restricciones de uso aceptable y obligaciones de atribución; es necesario revisarlos antes de desplegar en producción.
- El acceso al modelo en Hugging Face requiere aceptar la licencia de Google mediante el flujo gated del repositorio.
- No hay información pública sobre sesgos específicos del fine-tuning ni sobre la composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de contenido.
- La fecha de creación del repositorio (2026-11-20) y la ausencia de likes o documentación adicional limitan la validación comunitaria del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Gemma3NPC-4B-no-thinking-GGUF
- Modelo base (fine-tuning): https://huggingface.co/chimbiwide/Gemma3NPC-4B-no-thinking
- Dataset de entrenamiento: https://huggingface.co/datasets/chimbiwide/NPC-RP-No-Thinking
- Cuantizaciones ponderadas imatrix: https://huggingface.co/mradermacher/Gemma3NPC-4B-no-thinking-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Gemma3NPC-4B-no-thinking-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
