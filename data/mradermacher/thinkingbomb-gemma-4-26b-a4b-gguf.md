# mradermacher/ThinkingBomb-gemma-4-26B-A4B-GGUF

## Resumen

ThinkingBomb-gemma-4-26B-A4B es un modelo de lenguaje derivado de la familia Gemma 4 de Google, afinado por krystofmitka mediante GRPO (Group Relative Policy Optimization) para potenciar el razonamiento explícito y el control de esfuerzo ("effort-control"). Esta ficha corresponde a la versión cuantizada en GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo cuenta con 25.233.142.046 parámetros totales según los pesos en safetensors del repositorio, y su nomenclatura "A4B" sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4 mil millones de parámetros activos por token, aunque este dato no está confirmado explícitamente en la información disponible. Está orientado a tareas de razonamiento multi-paso, matemáticas y generación de código, con un modo de "pensamiento" configurable que permite ajustar el coste computacional en función de la dificultad de la tarea.

La relevancia de esta publicación radica en que ofrece un conjunto completo de cuantizaciones estáticas (desde Q2_K hasta Q8_0, además de los ficheros mmproj para capacidades multimodales) que reducen el peso del modelo desde los 184,9 GB del repositorio original hasta 10,7 GB en su versión más agresiva, facilitando su despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) — inferido de la nomenclatura "A4B"; no confirmado explícitamente |
| Parametros totales | 25.233.142.046 |
| Parametros activos | aproximadamente 4B (inferido de "A4B"; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS (anunciada), mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es Gemma 4, la cuarta generación de la familia Gemma de Google, de la que hereda la arquitectura transformer. La nomenclatura "26B-A4B" indica 26 mil millones de parámetros totales con aproximadamente 4 mil millones activos, patrón típico de las arquitecturas MoE con enrutamiento por token. El sufijo "ThinkingBomb" y las etiquetas `reasoning`, `grpo` y `effort-control` indican que krystofmitka aplicó un afinamiento con GRPO para reforzar cadenas de razonamiento explícitas y permitir al usuario controlar el nivel de esfuerzo de razonamiento en la generación.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO más allá del GRPO mencionado. Tampoco se detalla si se emplearon innovaciones como decodificación especulativa o atención lineal. La model card de la cuantización no incluye estos datos; solo confirma que se trata de cuantizaciones estáticas generadas a partir del modelo original en safetensors, sin cuantizaciones ponderadas ni imatrix disponibles en el momento de la publicación.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de plantillas de chat (`conversational` en los tags).
- Razonamiento explícito multi-paso mediante modo de "pensamiento" entrenado con GRPO.
- Control de esfuerzo (`effort-control`): permite ajustar la profundidad del razonamiento según la tarea.
- Capacidades multimodales: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que indica soporte de entrada visual (imagen) en el modelo base.
- Razonamiento matemático y resolución de problemas, derivado del entrenamiento con GRPO orientado a reasoning.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita su integración en servicios de inferencia.
- No se confirma soporte de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas de varios pasos activando el modo de pensamiento, con la posibilidad de reducir el esfuerzo en consultas simples para ahorrar latencia.
- Generación de código con verificación: útil en pipelines de revisión donde el modelo razona sobre el código antes de proponer cambios, aprovechando el entrenamiento con GRPO en tareas de razonamiento estructurado.
- Análisis de documentos con imágenes: gracias a los ficheros `mmproj`, puede procesar capturas, diagramas o figuras junto a texto en tareas de extracción de información.
- Asistente de investigación técnica: para explorar hipótesis y descomponer problemas complejos en pasos intermedios verificables, con control del nivel de detalle del razonamiento.
- Despliegue en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (16,9 GB) y Q5_K_M permiten ejecutar el modelo en GPUs de 24 GB como la RTX 4090, algo inviable con los pesos originales de 184,9 GB.
- Prototipado de aplicaciones de razonamiento en local: mediante llama.cpp u Ollama, sin depender de APIs externas, para experimentar con el control de esfuerzo antes de escalar a producción.
- Evaluación comparativa de técnicas de reasoning: investigadores pueden comparar el comportamiento del modelo con distintos niveles de esfuerzo y cuantizaciones para estudiar el trade-off calidad/latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~10,7 GB
  - Q3_K_S: ~12,3 GB
  - Q3_K_M: ~13,4 GB
  - Q3_K_L: ~13,9 GB
  - Q4_K_S: ~15,6 GB
  - Q4_K_M: ~16,9 GB
  - Q5_K_S: ~18,1 GB
  - Q5_K_M: ~19,5 GB (estimado)
  - Q6_K: ~22,7 GB
  - Q8_0: ~27,0 GB
  - mmproj adicional: 0,9 GB (Q8_0) o 1,3 GB (f16) si se usa entrada visual
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_M, Q5_K_S y Q6_K con margen ajustado; Q8_0 requiere offloading parcial.
  - RTX 3090 (24 GB): mismo perfil que la 4090.
  - A100 40 GB / H100 80 GB: Q8_0 y f16 sin problemas; ideales para servir múltiples peticiones.
  - GPU de 16 GB (RTX 4080, 4060 Ti 16 GB): Q3_K_M o Q4_K_S con contexto moderado.
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 12 GB (con contexto reducido) hasta Q6_K en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los tags indican `endpoints_compatible`, lo que sugiere compatibilidad con servidores de inferencia tipo TGI o vLLM (aunque vLLM requiere normalmente safetensors, no GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThinkingBomb-gemma-4-26B-A4B (esta ficha) | 25,2B totales / ~4B activos (inferido) | no disponible | apache-2.0 | GGUF, safetensors | Afinado con GRPO y effort-control |
| Gemma 4 26B-A4B (base, Google) | 26B totales / ~4B activos | no disponible | Gemma 4 license | safetensors | Modelo base sin afinado de reasoning |
| Modelos MoE de ~25B con ~4B activos de otras familias | ~25B / ~4B activos | variable | variable | variable | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento (benchmarks) con alternativas concretas. La comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Idioma: solo se declara soporte de inglés (`en`); el rendimiento en castellano no está garantizado ni documentado.
- Sesgos: no se documentan sesgos específicos, pero al derivar de Gemma 4 hereda los sesgos del corpus de entrenamiento original, no auditados en esta ficha.
- Alucinación: el modo de razonamiento explícito puede producir cadenas de pensamiento plausibles pero incorrectas; no hay datos de evaluación que cuantifiquen la tasa de alucinación.
- Licencia: aunque el repositorio declara `apache-2.0`, el campo `license_link` apunta a la licencia de Gemma 4 de Google, lo que puede introducir restricciones adicionales para uso comercial. Conviene revisar ambos documentos antes de desplegar en producción.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan la calidad de forma notable; para tareas de razonamiento se recomienda Q4_K_M o superior.
- Sin cuantizaciones ponderadas/imatrix: el autor indica que no están disponibles, lo que puede suponer una pérdida de calidad frente a cuantizaciones calibradas.
- Datos incompletos: no se publican benchmarks, longitud de contexto ni detalles de entrenamiento, lo que dificulta la evaluación rigurosa antes de adoptarlo.
- Fecha de creación futura (2026-11-20) en los metadatos: verificar la procedencia y vigencia del repositorio antes de confiar en él para producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ThinkingBomb-gemma-4-26B-A4B-GGUF
- Modelo base (safetensors): https://huggingface.co/krystofmitka/ThinkingBomb-gemma-4-26B-A4B
- Página de descargas del cuantizador: https://hf.tst.eu/model#ThinkingBomb-gemma-4-26B-A4B-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico comparativo de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
