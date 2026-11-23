# mradermacher/EvoLM-8B-Rubric-GGUF

## Resumen

EvoLM-8B-Rubric es un modelo de lenguaje de 8.190.735.360 parámetros (aproximadamente 8,19 mil millones) desarrollado originalmente por el usuario stellalisy y distribuido en formato GGUF por mradermacher. Está especializado en la generación de rúbricas de evaluación y en tareas de modelado de recompensa (reward modeling), según las etiquetas declaradas en su model card. Se trata de un modelo derivado del checkpoint base `stellalisy/EvoLM-8B-Rubric`, cuantizado de forma estática para su uso con llama.cpp y otros motores compatibles con GGUF.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de 8B especializado en evaluación automática sobre hardware de consumo, gracias a la disponibilidad de cuantizaciones desde Q2_K (3,4 GB) hasta f16 (16,5 GB). El modelo está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial, y declara soporte únicamente para inglés.

No se dispone de información pública sobre la longitud de contexto, la composición del dataset de entrenamiento ni los resultados de benchmarks en la documentación proporcionada; estos datos se indican como no disponibles a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer derivado de `stellalisy/EvoLM-8B-Rubric`; la model card no detalla la arquitectura interna) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base está en formato transformers/safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `stellalisy/EvoLM-8B-Rubric`. Por el nombre y el tamaño (8,19 B de parámetros) se trata de un transformer de la familia de 8B, pero no se confirma en la documentación proporcionada ni el tipo exacto de atención, ni la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o entrenamiento por refuerzo con recompensas basadas en rúbricas. Las etiquetas `rubric-generation`, `reward-modeling` y `evolm` sugieren una especialización en la generación de criterios de evaluación y en la puntuación de respuestas, pero no se aportan detalles técnicos sobre el proceso de entrenamiento.

La contribución de esta ficha concreta es la cuantización estática realizada por mradermacher, que convierte los pesos originales en formato transformers a GGUF. La model card indica que las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicación, y que las cuantizaciones incluidas son estáticas. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de rúbricas de evaluación: el modelo está etiquetado explícitamente para `rubric-generation`, lo que sugiere que puede producir criterios estructurados de evaluación para respuestas o tareas.
- Modelado de recompensa: la etiqueta `reward-modeling` indica que puede emplearse para puntuar o clasificar respuestas según su calidad.
- Generación de texto conversacional: la etiqueta `conversational` en Hugging Face indica que el modelo está preparado para interacciones de tipo chat.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en infraestructuras de inferencia compatibles con la API de Hugging Face.
- Idiomas: únicamente inglés declarado; no se garantiza un rendimiento fiable en castellano u otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible; no se declaran.

## Casos de uso

- Evaluación automática de respuestas de LLM: el modelo puede generar rúbricas y puntuar respuestas generadas por otros modelos, integrándose en pipelines de evaluación de calidad (por ejemplo, en un harness de evaluación tipo LLM-as-a-judge) gracias a su especialización declarada en `rubric-generation` y `reward-modeling`.
- Construcción de datasets de preferencias: puede emplearse para puntuar pares de respuestas y generar datos de preferencia (chosen/rejected) que alimenten posteriores procesos de DPO o RLHF, dado su perfil de reward model.
- Filtrado de datos sintéticos: en pipelines de generación de datos, el modelo puede actuar como filtro de calidad, descartando respuestas que no cumplan los criterios de una rúbrica predefinida.
- Evaluación de asistentes conversacionales: al estar etiquetado como conversacional, puede evaluar la calidad de diálogos multi-turno generados por otros sistemas en inglés.
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_M (5,1 GB) o Q4_K_S (4,9 GB), puede ejecutarse en GPUs de consumo con 8 GB o más de VRAM mediante llama.cpp u Ollama, lo que permite integrar la evaluación en entornos de desarrollo locales sin depender de APIs externas.
- Investigación en alineación: investigadores que necesiten un reward model de 8B con licencia Apache 2.0 pueden usarlo como componente en experimentos de alineación, con la ventaja de que las cuantizaciones GGUF reducen el coste de experimentación.
- Evaluación de código y matemáticas (con reservas): si el modelo base fue entrenado para evaluación general, podría puntuar soluciones de código o problemas matemáticos; sin embargo, no hay datos de benchmarks que confirmen esta capacidad, por lo que debe validarse empíricamente antes de usarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: 3,4 GB de pesos; aproximadamente 4-5 GB de VRAM con overhead de contexto.
  - Q3_K_S / Q3_K_M / Q3_K_L: 3,9-4,5 GB de pesos.
  - IQ4_XS: 4,7 GB de pesos.
  - Q4_K_S / Q4_K_M: 4,9-5,1 GB de pesos; aproximadamente 6-7 GB de VRAM con contexto moderado.
  - Q5_K_S / Q5_K_M: 5,8-6,0 GB de pesos.
  - Q6_K: 6,8 GB de pesos.
  - Q8_0: 8,8 GB de pesos.
  - f16: 16,5 GB de pesos; requiere al menos 18-20 GB de VRAM para inferencia cómoda.
- GPU recomendadas:
  - Consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 pueden ejecutar cuantizaciones Q4 a Q8 con holgura.
  - Profesional: A100 40/80 GB, H100 80 GB para f16 y despliegues de alta concurrencia.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs con 8 GB o más de VRAM usando Q4_K_S o Q4_K_M; en GPUs de 6 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). Para el modelo base en formato transformers, vLLM o TGI serían opciones, pero no se confirma compatibilidad explícita en la documentación.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base `stellalisy/EvoLM-8B-Rubric` es la referencia directa, pero no se han encontrado datos de benchmarks ni comparativas con otros reward models de 8B (como ArmoRM, Starling-RM o Nemotron-4-340B-Reward) en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EvoLM-8B-Rubric (GGUF) | 8,19 B | no disponible | Apache 2.0 | GGUF | Esta ficha; cuantizaciones estáticas de mradermacher |
| stellalisy/EvoLM-8B-Rubric | 8,19 B | no disponible | Apache 2.0 | safetensors | Modelo base original |
| Otros reward models de 8B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Sesgos conocidos: no se documentan en la model card; al ser un modelo derivado de un base no identificado públicamente, los sesgos del corpus original son desconocidos.
- Riesgo de alucinación: no cuantificado; como modelo generativo de 8B, es susceptible de producir rúbricas o puntuaciones inconsistentes, especialmente en cuantizaciones de baja precisión (Q2_K, Q3_K_S).
- Limitaciones de contexto: no se especifica la ventana de contexto; no debe asumirse un contexto largo sin validación empírica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base original y de los datos de entrenamiento, no documentados en esta ficha.
- Calidad de cuantización: las cuantizaciones por debajo de Q4 pueden degradar la coherencia en tareas de evaluación fina; la model card recomienda Q4_K_S y Q4_K_M como opciones rápidas y Q6_K/Q8_0 para máxima calidad.
- Ausencia de benchmarks: no hay métricas publicadas que permitan estimar su fiabilidad como reward model frente a alternativas; se recomienda evaluarlo en el dominio concreto antes de usarlo en producción.
- Cuantizaciones imatrix no disponibles: la model card indica que no se han publicado cuantizaciones ponderadas con imatrix, lo que puede limitar la calidad en comparación con otras distribuciones GGUF.
- Fecha de creación futura: el repositorio figura creado el 2026-09-19, lo que puede indicar metadatos inconsistentes; conviene verificar la integridad de los archivos antes de descargarlos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/EvoLM-8B-Rubric-GGUF
- Modelo base: https://huggingface.co/stellalisy/EvoLM-8B-Rubric
- Página de descargas del cuantizador: https://hf.tst.eu/model#EvoLM-8B-Rubric-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
