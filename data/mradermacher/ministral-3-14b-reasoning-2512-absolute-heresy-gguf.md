# mradermacher/Ministral-3-14B-Reasoning-2512-absolute-heresy-GGUF

## Resumen

Ministral-3-14B-Reasoning-2512-absolute-heresy-GGUF es una compilación de cuantizaciones estáticas en formato GGUF del modelo MuXodious/Ministral-3-14B-Reasoning-2512-absolute-heresy, publicada por el usuario mradermacher. El modelo base es una variante derivada de la familia Ministral de Mistral AI, con 13.506.073.600 parámetros (aproximadamente 13,5 mil millones), sometida a un proceso de "abliteration" o "decensored" que elimina las capas de rechazo y alineación de seguridad del modelo original. El resultado es un modelo de razonamiento sin censura, con licencia Apache 2.0, orientado a usos donde el filtrado de contenido del modelo original resulta un obstáculo.

La relevancia de esta ficha reside en dos factores. Primero, ofrece una vía práctica para ejecutar un modelo de 14B con capacidades de razonamiento en hardware de consumo gracias a las cuantizaciones GGUF (desde Q2_K de 5,3 GB hasta Q8_0 de 14,5 GB). Segundo, documenta un caso de "modelo derivado no oficial": el autor de las cuantizaciones no es el desarrollador original ni el autor del fine-tuning, sino un tercero que empaqueta los pesos. Esto tiene implicaciones importantes para trazabilidad, reproducibilidad y evaluación de sesgos que se detallan en las secciones siguientes.

La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada: la model card del repositorio de cuantizaciones es puramente operativa (lista de ficheros y tamaños) y no incluye detalles técnicos del modelo subyacente. Por tanto, varios campos de esta ficha se marcan como "no disponible" en lugar de inferirse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Ministral; arquitectura transformer, sin confirmación oficial en la información proporcionada) |
| Parámetros totales | 13.506.073.600 (13,5B) |
| Parámetros activos | no aplica (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; además mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Por el nombre y la familia ("Ministral-3-14B-Reasoning-2512"), se trata de un modelo derivado de la línea Ministral de Mistral AI, con 13,5B parámetros y capacidades de razonamiento (etiqueta "Reasoning" en el nombre). La presencia de ficheros mmproj (Q8_0 y f16) indica que el modelo base incorpora un proyector multimodal, lo que sugiere capacidades de visión, aunque no se confirma en la información disponible.

El aspecto técnico más relevante es el proceso de "abliteration" o "decensored" aplicado por MuXodious: se trata de una modificación de los pesos orientada a eliminar el comportamiento de rechazo (refusal) aprendido durante el alineamiento del modelo original. Las etiquetas "heretic", "uncensored", "decensored" y "abliterated" confirman esta intervención. No se especifican en la información proporcionada los detalles del método (por ejemplo, si se usó directional ablation, fine-tuning con DPO sin pares de rechazo, o edición de capas específicas), ni el volumen de datos de entrenamiento, ni la composición del dataset. Tampoco se documenta si hubo RLHF o DPO adicional tras la abliteration.

Las cuantizaciones de mradermacher son estáticas (no imatrix en este repositorio; las versiones ponderadas/imatrix están en un repositorio separado, `Ministral-3-14B-Reasoning-2512-absolute-heresy-i1-GGUF`). El repositorio incluye una nota sobre el orden de preferencia de cuantizaciones y enlaces a comparativas de perplejidad de terceros (ikawrakow, Artefact2).

## Capacidades

- Generación de texto y razonamiento multi-paso, indicado por la etiqueta "Reasoning" en el nombre del modelo base.
- Conversación multi-turno (etiqueta "conversational" en los tags del repositorio).
- Capacidades multimodales: la presencia de ficheros mmproj-Q8_0 y mmproj-f16 sugiere soporte de entrada de imágenes, aunque no se detalla en la información disponible.
- Multilingüismo declarado en 11 idiomas: inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- Comportamiento sin censura: el proceso de abliteration elimina los rechazos del modelo original, lo que permite generar contenido que el modelo base rechazaría.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y multi-step reasoning: no confirmado explícitamente, aunque la etiqueta "Reasoning" sugiere capacidad de cadenas de razonamiento.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar empíricamente qué comportamientos se eliminan con la abliteration y cómo afecta a la calidad general, comparando respuestas con el modelo base original en tareas controladas.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles (violencia, contenido adulto, humor negro) donde los filtros del modelo original bloquearían la salida; adecuado por su naturaleza decensored y su contexto conversacional.
- Procesamiento de documentos multilingües: con 11 idiomas declarados y cuantizaciones ligeras (Q4_K_M de 8,3 GB), puede desplegarse en estaciones de trabajo para resumir, traducir o extraer información de corpus en varios idiomas.
- Despliegue en hardware de consumo: las cuantizaciones Q2_K (5,3 GB) y Q3_K_S (6,2 GB) permiten ejecutar el modelo en GPUs con 8 GB de VRAM o en CPU con llama.cpp, útil para prototipado local y entornos sin acceso a la nube.
- Análisis de sesgos y robustez: al ser un modelo derivado no oficial, sirve como caso de estudio para evaluar cómo las modificaciones de pesos afectan a la coherencia, la factualidad y la tendencia a la alucinación en comparación con el modelo original.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 niveles de cuantización más dos proyectores multimodales, lo que permite medir el impacto de la compresión en tareas de razonamiento y generación, útil para investigación en eficiencia de inferencia.
- Chatbot de rol o personajes sin restricciones: para aplicaciones de entretenimiento donde se requiere un personaje con opiniones fuertes o vocabulario no filtrado, el modelo decensored evita las interrupciones por rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantizaciones no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Tampoco se proporcionan datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV):
  - Q2_K: ~5,3 GB
  - Q3_K_S: ~6,2 GB
  - Q3_K_M: ~6,8 GB
  - Q3_K_L: ~7,3 GB
  - IQ4_XS: ~7,6 GB
  - Q4_K_S: ~7,9 GB
  - Q4_K_M: ~8,3 GB
  - Q5_K_S: ~9,5 GB
  - Q5_K_M: ~9,7 GB
  - Q6_K: ~11,2 GB
  - Q8_0: ~14,5 GB
  - Proyector multimodal: mmproj-Q8_0 ~0,6 GB; mmproj-f16 ~1,0 GB
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, Q4_K_M (~8,3 GB) encaja en RTX 4070/4080 (12-16 GB) y Q8_0 (~14,5 GB) en RTX 4090 (24 GB) o A100/H100. Las cuantizaciones Q2-Q3 pueden ejecutarse en GPUs de 8 GB.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q2_K a Q4_K_M caben en GPUs de 8-12 GB (RTX 3060 Ti, 4060 Ti, 4070). Q5-Q6 requieren 12-16 GB (RTX 4080, 4090). Q8_0 requiere 16-24 GB.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) son los más directos para GGUF. vLLM y TGI no soportan GGUF de forma nativa en el momento de redacción; para servidores de alto rendimiento habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ministral-3-14B-Reasoning-2512-absolute-heresy-GGUF (este) | 13,5B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas de un derivado abliterated; 11 idiomas; multimodal (mmproj) |
| Ministral-3-14B-Reasoning-2512-absolute-heresy (base) | 13,5B | no disponible | Apache 2.0 | safetensors | Modelo original del que derivan las cuantizaciones; sin datos de benchmarks en la información disponible |
| Mistral-Nemo-12B-Instruct | 12B | 128k (según documentación pública de Mistral) | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar de Mistral AI; contexto largo documentado; no es decensored |
| Qwen2.5-14B-Instruct | 14B | 32k (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar; multilingüe; sin proceso de abliteration |

Nota: los datos de contexto y benchmarks de los modelos alternativos provienen de documentación pública general y no de la información proporcionada en esta ficha; se incluyen solo como referencia orientativa. No se dispone de comparativas de rendimiento directas entre este modelo y las alternativas en la información disponible.

## Limitaciones y advertencias

- Modelo derivado no oficial: ni el autor de las cuantizaciones (mradermacher) ni el autor del fine-tuning (MuXodious) son Mistral AI. La trazabilidad del proceso de abliteration no está documentada en detalle, lo que dificulta la reproducibilidad.
- Ausencia de benchmarks: no hay métricas publicadas que permitan evaluar la degradación de calidad introducida por la abliteration ni por las cuantizaciones. No se puede afirmar que el rendimiento sea equivalente al del modelo original.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa con aparente seguridad. La abliteration puede agravar este problema si elimina mecanismos de rechazo ante preguntas sin respuesta fiable.
- Contenido sin filtrar: al ser un modelo decensored, puede generar contenido ofensivo, violento, sexual o ilegal. No es apto para aplicaciones orientadas al público general sin una capa de moderación externa.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre el contenido generado. La licencia no garantiza que el modelo cumpla normativas sectoriales (salud, finanzas, menores).
- Idiomas: aunque se declaran 11 idiomas, no hay evaluación de calidad por idioma. El español está incluido, pero se desconoce su rendimiento relativo frente al inglés.
- Contexto: no se ha podido confirmar la longitud de contexto del modelo base; esto es crítico para aplicaciones de documentos largos o agentes.
- Cuantizaciones de baja precisión: Q2_K y Q3_K pueden degradar notablemente la coherencia y el razonamiento. Para producción se recomienda Q4_K_M o superior.
- Multimodalidad no confirmada: la presencia de ficheros mmproj sugiere visión, pero no se documenta qué tareas visuales soporta ni con qué calidad.
- Fecha de creación futura (2026-01-15): el repositorio indica fechas que no coinciden con el momento actual; conviene verificar la integridad de los ficheros antes de usarlos en producción.

## Enlaces

- Repositorio HuggingFace (cuantizaciones GGUF): https://huggingface.co/mradermacher/Ministral-3-14B-Reasoning-2512-absolute-heresy-GGUF
- Modelo base (fine-tuning decensored): https://huggingface.co/MuXodious/Ministral-3-14B-Reasoning-2512-absolute-heresy
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Ministral-3-14B-Reasoning-2512-absolute-heresy-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Ministral-3-14B-Reasoning-2512-absolute-heresy-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (empresa del autor de las cuantizaciones): https://www.nethype.de/
