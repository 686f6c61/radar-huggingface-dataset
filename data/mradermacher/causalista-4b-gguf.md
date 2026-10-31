# mradermacher/causalista-4b-GGUF

## Resumen

Causalista 4B es un modelo lingüístico de aproximadamente 4.000 millones de parámetros especializado en inferencia causal, desarrollado por coppead y entrenado sobre el dataset sintético `coppead/causalista-worlds`. El modelo se centra en tareas como la identificación de conjuntos de ajuste (adjustment sets), razonamiento causal en contextos de gestión y la abstención (responder que no sabe cuando no dispone de información suficiente), una capacidad poco habitual en modelos de este tamaño.

La ficha presente cubre la versión GGUF cuantizada por mradermacher, un repositorio que ofrece cuantizaciones estáticas del modelo base en formatos que van desde Q2_K (1,8 GB) hasta f16 (8,2 GB), lo que permite ejecutar el modelo en hardware muy modesto, incluidas CPU y portátiles sin GPU dedicada. El modelo soporta portugués, inglés y castellano, lo que lo hace especialmente relevante para el mercado iberoamericano.

Su relevancia actual radica en la nicho que ocupa: modelos pequeños y abiertos (licencia Apache 2.0) especializados en razonamiento causal estructurado, una tarea donde los modelos generalistas suelen fallar al confundir correlación con causalidad. No se ha publicado información sobre la arquitectura base exacta ni sobre benchmarks formales del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, según librería transformers) |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | portugués, inglés, castellano |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta versión); el modelo base está disponible en safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura del modelo base (tipo de attention, número de capas, dimensiones ocultas) ni sobre el proceso de entrenamiento. El modelo se distribuye mediante la librería `transformers` de HuggingFace, lo que indica una arquitectura de tipo transformer estándar, y sus 4,02 mil millones de parámetros lo sitúan en la categoría de modelos pequeños (SLM).

El entrenamiento se realizó sobre el dataset `coppead/causalista-worlds`, un conjunto de datos sintético. Los tags del repositorio (causal-inference, management, adjustment-set, abstention, synthetic-data) sugieren que el fine-tuning se orientó a tareas de razonamiento causal estructurado en contextos de gestión empresarial, con énfasis en la identificación de conjuntos de ajuste para estimación de efectos causales y en la abstención como comportamiento explícito. No hay datos disponibles sobre el número de tokens de entrenamiento, el uso de RLHF/DPO ni la fecha de entrenamiento.

La versión aquí descrita es una cuantización estática en formato GGUF realizada por mradermacher, que convierte los pesos originales en safetensors a distintos niveles de precisión k-quant e i-quant para inferencia con llama.cpp y herramientas compatibles. No se han publicado cuantizaciones weighted/imatrix por el autor en el momento de redacción de esta ficha.

## Capacidades

- Razonamiento causal: identificación de relaciones causa-efecto y de conjuntos de ajuste (adjustment sets) para el control de variables confusoras en análisis observacionales.
- Abstención: el modelo está entrenado para indicar cuando no dispone de información suficiente para responder, en lugar de alucinar una respuesta.
- Análisis en contextos de gestión: razonamiento causal aplicado a decisiones empresariales y de management.
- Generación de texto conversacional: el repositorio está etiquetado como `conversational`, apto para interacción multi-turno.
- Soporte multilingüe en portugués, inglés y castellano.
- Ejecución local eficiente gracias al formato GGUF, compatible con CPU y GPU de consumo.

No hay información disponible sobre soporte de tool calling, capacidades de visión o audio, ni sobre razonamiento multi-paso formalizado (thinking mode).

## Casos de uso

- Asistente de análisis causal para equipos de datos: un analista puede describir un escenario observacional (por ejemplo, el efecto de una campaña de marketing sobre ventas) y el modelo puede proponer qué variables controlar para estimar el efecto causal, aprovechando su entrenamiento específico en adjustment sets.
- Validación de supuestos en estudios observacionales: el modelo puede revisar descripciones de experimentos cuasi-experimentales y señalar confusores potenciales que invalidarían una inferencia causal ingenua.
- Formación y docencia en inferencia causal: dada su especialización y tamaño reducido, es útil como asistente didáctico en cursos de econometría, estadística causal o metodología de investigación, generando ejemplos y contraejemplos.
- Sistemas de decisión empresarial con abstención: en pipelines donde una respuesta incorrecta es costosa, el comportamiento de abstención permite que el modelo decline responder cuando el problema planteado no permite una inferencia causal válida, escalando a un humano.
- Asistente multilingüe para equipos iberoamericanos: soporte nativo de castellano y portugués lo hace adecuado para equipos de Brasil, Portugal y España que trabajan con documentación metodológica mixta.
- Prototipado local sin conexión: gracias a las cuantizaciones Q2_K a Q5_K (1,8–3,0 GB), puede desplegarse en portátiles para demos o entornos con restricciones de privacidad donde los datos no pueden salir de la máquina.
- Preparación de datasets sintéticos de causalidad: puede emplearse para generar o verificar ejemplos sintéticos de escenarios causales en dominios de management, complementando el dataset con el que fue entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (GGUF, según cuantización):
  - Q2_K: ~1,8 GB de pesos; funciona en CPU o GPU con 2 GB de VRAM libres.
  - Q4_K_M (recomendada): ~2,6 GB; cabe con holgura en cualquier GPU de 4 GB.
  - Q6_K: ~3,4 GB; adecuada para GPUs de 4–6 GB dejando espacio al KV cache.
  - Q8_0: ~4,4 GB; recomendable GPU de 6 GB o más.
  - f16: ~8,2 GB; requiere GPU de 10–12 GB o ejecución en CPU.
- GPU recomendadas: por su tamaño, cualquier GPU moderna es suficiente; RTX 3060 12 GB, RTX 4060/4070 o superiores ejecutarán las cuantizaciones altas con gran velocidad. En CPU, cualquier procesador moderno con 8–16 GB de RAM ejecuta las cuantizaciones bajas a velocidades razonables.
- Consumer GPU: sí, cabe incluso en GPUs de gama de entrada; una RTX 3050 6 GB ejecuta Q4_K_M sin problemas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, GPT4All y cualquier runtime compatible con GGUF. La versión base en safetensors puede desplegarse con vLLM, TGI o transformers. No hay información sobre latencias o throughput publicados; para un modelo de 4B cuantizado en Q4 sobre GPU moderna, se pueden esperar velocidades del orden de decenas de tokens por segundo, pero este dato es una estimación general, no un dato publicado.
- Contexto: al no publicarse la longitud de contexto nativa, no se puede estimar el impacto del KV cache en VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Especialización | Licencia | Formato |
|---|---|---|---|---|
| Causalista 4B (este modelo) | ~4,02 B | Inferencia causal, adjustment sets, abstención | Apache 2.0 | GGUF, safetensors |
| Qwen3 4B | ~4 B | Generalista, razonamiento, thinking mode | Apache 2.0 | GGUF, safetensors |
| Gemma 3 4B | ~4 B | Generalista, multimodal (visión) | Gemma license (restricciones) | GGUF, safetensors |
| Phi-4-mini (3,8 B) | ~3,8 B | Generalista, razonamiento y código | MIT | GGUF, safetensors |

Causalista 4B se diferencia de estos alternativas generalistas en su fine-tuning específico para inferencia causal y su comportamiento de abstención, mientras que los modelos comparables ofrecen mayor versatilidad general, contextos más largos documentados y ecosistemas de herramientas más maduros. No hay datos de benchmarks que permitan comparar rendimiento cuantitativo.

## Limitaciones y advertencias

- No se ha publicado la longitud de contexto, lo que dificulta planificar aplicaciones con documentos largos; conviene verificarla empíricamente antes de producción.
- Especialización estrecha: al estar fine-tuned sobre datos sintéticos de un dominio concreto (causalidad en management), probablemente rinda por debajo de modelos generalistas en tareas fuera de su nicho, y los datos sintéticos pueden introducir sesgos hacia los patrones del dataset `causalista-worlds`.
- Riesgo de alucinación: aunque se entrenó para abstención, no hay evaluaciones publicadas que cuantifiquen su fiabilidad; las respuestas causales deben revisarse siempre por un experto.
- Cobertura lingüística limitada a portugués, inglés y castellano; el rendimiento en castellano no está evaluado con benchmarks públicos.
- No hay cuantizaciones imatrix/weighted disponibles, por lo que las cuantizaciones bajas (Q2_K, Q3_K) pueden sufrir degradación de calidad notable.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque conviene revisar la licencia del dataset de entrenamiento si se reentrena.
- Esta ficha describe la cuantización de mradermacher, no el modelo original; para soporte del modelo en sí, acudir al repositorio base de coppead.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/causalista-4b-GGUF
- Modelo base: https://huggingface.co/coppead/causalista-4b
- Dataset de entrenamiento: https://huggingface.co/datasets/coppead/causalista-worlds
- Página de descargas de mradermacher: https://hf.tst.eu/model#causalista-4b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper, demo o repositorio de código: no disponible
