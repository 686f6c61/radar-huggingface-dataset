# mradermacher/lexi-2-249b-base-GGUF

## Resumen

Lexi 2.249B es un modelo de lenguaje de tipo transformer, derivado de la familia Qwen2 según las etiquetas del repositorio, con 2.245.681.664 parámetros totales (aproximadamente 2.250 millones). Lo desarrolla Reallexi-llc, que lo ha afinado sobre el conjunto de datos `reallexi/lexi-coder-v3-datasest` para tareas de generación de código. Esta ficha documenta la versión cuantizada en formato GGUF publicada por mradermacher, un conocido creador de cuantizaciones de la comunidad, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo está orientado a programación y conversación, con etiquetas que lo clasifican como `coding`, `conversational` y `fine-tuned`. Su tamaño compacto (2.250 millones de parámetros) lo sitúa en la categoría de modelos pequeños capaces de ejecutarse en GPU de consumo e incluso en CPU con cuantizaciones agresivas. El repositorio GGUF ocupa 20,4 GB e incluye once variantes de cuantización, desde Q2_K (1,0 GB) hasta f16 (4,6 GB).

La relevancia de esta publicación radica en que facilita el despliegue local del modelo base sin necesidad de infraestructura de servidor, aunque con las limitaciones propias de un modelo de este tamaño y de una licencia heredada que no es plenamente abierta. No se dispone de información pública sobre benchmarks, longitud de contexto ni detalles del entrenamiento más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen2, según etiquetas del repositorio) |
| Parametros totales | 2.245.681.664 (aproximadamente 2,25 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Other; hereda los términos del modelo base y del conjunto de datos (`inherits-base-model-and-dataset-terms`) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La información disponible indica que Lexi 2.249B es un transformer derivado de Qwen2, afinado por Reallexi-llc sobre el conjunto de datos `reallexi/lexi-coder-v3-datasest`, orientado a código. El número de parámetros reales, extraído de los safetensors del modelo base, es de 2.245.681.664. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado más allá del fine-tuning indicado.

La versión documentada aquí es una cuantización estática realizada por mradermacher con `quantize_version: 2` y `convert_type: hf`. El autor indica que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicación. No se dispone de información sobre innovaciones técnicas específicas (atención lineal, decodificación especulativa, modos de razonamiento extendido, etc.).

## Capacidades

- Generación de texto conversacional en inglés, con etiqueta `conversational` en el repositorio.
- Generación y asistencia en código, dado el fine-tuning sobre un dataset de programación y la etiqueta `coding`.
- Ejecución local mediante GGUF en llama.cpp y herramientas compatibles (Ollama, LM Studio, etc.).
- Compatibilidad con endpoints según la etiqueta `endpoints_compatible` del repositorio.
- Capacidades multilingües limitadas al inglés según el campo `language: en`.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modos de razonamiento extendido.

## Casos de uso

- Autocompletado de código en el editor: con 2.250 millones de parámetros y cuantizaciones Q4_K_M de 1,5 GB, puede ejecutarse en local para sugerir fragmentos de código en tiempo real sin enviar datos a un servicio externo.
- Asistente de programación en estaciones de trabajo sin GPU dedicada: la variante Q2_K (1,0 GB) permite inferencia en CPU con llama.cpp para tareas de consulta puntual.
- Generación de pruebas unitarias: el modelo, afinado sobre un dataset de código, puede producir esqueletos de tests a partir de funciones existentes, integrándose en scripts de desarrollo.
- Documentación de código: generación de docstrings y comentarios explicativos en inglés para bases de código, aprovechando su naturaleza conversacional y de código.
- Chatbot técnico de soporte: para responder preguntas frecuentes sobre APIs o lenguajes en inglés, desplegado con Ollama en un servidor pequeño.
- Prototipado rápido de aplicaciones de IA generativa: al ocupar menos de 2 GB en Q4_K_M, sirve para validar pipelines de inferencia antes de migrar a modelos mayores.
- Experimentación educativa: modelo ligero para estudiar el comportamiento de un transformer afinado en código y comparar el efecto de distintas cuantizaciones en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB en Q2_K, 1,5 GB en Q4_K_M, 1,9 GB en Q6_K, 2,5 GB en Q8_0 y 4,6 GB en f16 (tamaños de archivo indicados por el autor; el consumo real en memoria añade overhead del runtime y del contexto).
- GPU recomendadas: cualquier GPU de consumo con 4 GB o más de VRAM puede ejecutar las cuantizaciones Q4 y Q5; una RTX 3060, RTX 4060 o superior permite f16 con holgura. Para despliegues en servidor, una A100 o H100 no aporta ventajas significativas dado el tamaño del modelo, salvo por agregación de peticiones.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones, incluidas tarjetas con 4-6 GB de VRAM para Q4_K_M y Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con transformers, vLLM o TGI, aunque no se han publicado configuraciones validadas para estos últimos.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de 2.250 millones de parámetros, se espera una latencia baja en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Lexi 2.249B (esta ficha) | 2.245.681.664 | No disponible | Other (hereda términos del base y dataset) | GGUF, safetensors | Hugging Face |
| Qwen2.5-Coder-1.5B | 1.500 millones (aproximado) | No disponible en esta ficha | Apache 2.0 (según el modelo original de Qwen) | Safetensors, GGUF | Hugging Face |
| Qwen2.5-Coder-3B | 3.000 millones (aproximado) | No disponible en esta ficha | Apache 2.0 (según el modelo original de Qwen) | Safetensors, GGUF | Hugging Face |
| CodeGemma-2B | 2.000 millones (aproximado) | No disponible en esta ficha | Gemma Terms of Use | Safetensors, GGUF | Hugging Face |

La comparación se basa en la categoría de tamaño y tarea (modelos pequeños orientados a código). No se dispone de datos de rendimiento de Lexi 2.249B para establecer comparaciones cuantitativas; los datos de los modelos alternativos deben verificarse en sus respectivas fichas oficiales.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un fine-tuning sobre un dataset de código en inglés, puede reflejar sesgos presentes en dicho corpus.
- Riesgo de alucinación: inherente a los modelos de 2.250 millones de parámetros; la precisión factual y la corrección de código pueden degradarse en tareas complejas.
- Limitaciones de contexto e idioma: el modelo solo declara inglés (`language: en`) y no se ha publicado la longitud de contexto soportada, lo que impide planificar su uso en conversaciones o bases de código extensas.
- Restricciones de licencia: la licencia es `other` y hereda los términos del modelo base (`Reallexi-llc/lexi-2-249b-base`) y del dataset (`reallexi/lexi-coder-v3-datasest`). Es imprescindible revisar ambas licencias antes de cualquier uso comercial; no es una licencia de código abierto estándar.
- Caveat para producción: no hay benchmarks publicados, ni datos de entrenamiento detallados, ni garantías de calidad; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de salida en tareas de código, donde los errores sintácticos son críticos.
- El autor de las cuantizaciones no ha publicado variantes ponderadas o con imatrix, que suelen ofrecer mejor relación calidad/tamaño.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/lexi-2-249b-base-GGUF
- Modelo base: https://huggingface.co/Reallexi-llc/lexi-2-249b-base
- Conjunto de datos de fine-tuning: https://huggingface.co/datasets/reallexi/lexi-coder-v3-datasest
- Página de descargas del autor de cuantizaciones: https://hf.tst.eu/model#lexi-2-249b-base-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
