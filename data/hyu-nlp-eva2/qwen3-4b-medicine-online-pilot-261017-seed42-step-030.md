# HYU-NLP-EVA2/qwen3-4b-medicine-online-pilot-261017-seed42-step-030

## Resumen

`HYU-NLP-EVA2/qwen3-4b-medicine-online-pilot-261017-seed42-step-030` es un checkpoint de ajuste fino del modelo denso Qwen3-4B-Instruct-2507 (4.022.468.096 parámetros), publicado por el grupo HYU-NLP-EVA2. Según la model card, corresponde al paso 30 de la ejecución `261017_medicine_online_pilot_seed42`, con semilla 42, dentro de un piloto denominado "medicine online-rubrics". El repositorio contiene una exportación en BF16 para Transformers y, en el subdirectorio `original_checkpoint/`, los ficheros nativos de veRL/FSDP junto con sus metadatos.

El interés del modelo es acotado y de carácter experimental: se trata de un artefacto intermedio de un pipeline de entrenamiento (presumiblemente con refuerzo mediante rúbricas, dado el stack veRL/FSDP y el nombre de la ejecución), no de un modelo listo para producción clínica. No se documentan datos de entrenamiento, composición del corpus, idiomas, resultados de evaluación ni procesos de alineación adicionales. El repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

Por su tamaño, cabe en GPUs de consumo en cuantización de 4 bits y sirve como base para reproducir el experimento, comparar el efecto del paso de entrenamiento o continuar el ajuste. Su relevancia práctica es, por tanto, metodológica y de investigación, no asistencial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); detalles de capas y atención no disponibles en la información proporcionada |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible para este checkpoint; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens según la documentación de Qwen |
| Tipos de cuantizacion | No se distribuyen cuantizaciones oficiales. Los pesos se publican en BF16; son convertibles a INT8/INT4 (bitsandbytes, GPTQ, AWQ) o GGUF mediante herramientas externas |
| Idiomas soportados | No disponible (no declarados en la model card ni en los tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (exportación BF16 para Transformers) + checkpoint nativo veRL/FSDP en `original_checkpoint/` |
| Libreria y pipeline | `transformers`, `text-generation` |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamano del repositorio | 25,7 GB (incluye exportación BF16 y checkpoint nativo) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-19 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507, un transformer denso de 4.022 millones de parámetros con atención de tipo causal y decodificación autorregresiva. La model card no especifica el número de capas, la configuración de atención (GQA, dimensiones de cabeza) ni la función de activación, por lo que esos detalles deben consultarse en la documentación del modelo base. El tag `conversational` y el pipeline `text-generation` confirman el formato de uso previsto: diálogo multi-turno y generación de texto.

Sobre el entrenamiento solo se conocen los metadatos de la ejecución: identificador `261017_medicine_online_pilot_seed42`, paso 30, semilla 42, y presencia de un checkpoint nativo veRL/FSDP. veRL es un framework de aprendizaje por refuerzo para modelos de lenguaje, y el sufijo "online-rubrics" sugiere un entrenamiento con recompensas basadas en rúbricas evaluadas en línea, orientado al dominio médico. No se indica el volumen de tokens, la composición del dataset, si hubo SFT previo, DPO o RLHF, ni la función de recompensa empleada. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

Un detalle operativo relevante: el autor indica que el checkpoint local se elimina solo tras verificar tamaños y hashes SHA256 de todos los ficheros remotos, lo que apunta a un pipeline de publicación automatizado y a que el artefacto es un volcado fiel del estado de entrenamiento en el paso 30.

## Capacidades

- Generación de texto y conversación multi-turno en formato instrucción, heredadas del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y respuesta a preguntas de dominio médico, presumiblemente el objetivo del piloto "medicine", aunque no se documenta ninguna evaluación que lo cuantifique.
- Generación de código y matemáticas: capacidad heredada del modelo base; no verificada en este checkpoint.
- Soporte de tool calling / function calling: no documentado para este checkpoint; el modelo base Qwen3 sí lo soporta, pero el ajuste fino puede haber alterado el formato.
- Modo "thinking" (razonamiento extendido): no documentado; Qwen3-4B-Instruct-2507 es una variante no thinking, por lo que no se espera.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline es exclusivamente de texto.
- Capacidades multilingües: no disponibles; no se declaran idiomas en la model card.
- Uso como checkpoint intermedio para reanudar el entrenamiento con veRL/FSDP o para análisis diferencial entre pasos.

## Casos de uso

- Reproducción de experimentos de RL con rúbricas: el checkpoint nativo en `original_checkpoint/` permite reanudar la ejecución `261017_medicine_online_pilot_seed42` en el paso 30 con veRL/FSDP y la semilla 42, garantizando comparabilidad entre réplicas.
- Análisis de dinámica de entrenamiento: comparar las respuestas de este paso 30 con checkpoints posteriores o con el modelo base para medir cómo evoluciona el estilo y la precisión de las respuestas médicas durante el ajuste.
- Evaluación de rúbricas automáticas: usar el modelo como generador de respuestas sobre las que validar un juez o una rúbrica de calidad clínica antes de desplegar el pipeline completo.
- Prototipado de asistentes de formación médica: con 4.000 millones de parámetros y licencia Apache 2.0, puede ejecutarse en local para generar preguntas de estudio o resúmenes de material docente, siempre con revisión humana y sin uso clínico directo.
- Investigación sobre sesgos y seguridad en dominios sanitarios: al ser un modelo pequeño y abierto, facilita auditorías de alucinación y de sesgo sin depender de APIs externas.
- Base para ajuste fino adicional (SFT/DPO) en subdominios médicos concretos: su tamaño permite iterar en una sola GPU de 24 GB con cuantización, y la licencia Apache 2.0 no impone restricciones de uso comercial.
- Pruebas de integración de infraestructura: validar despliegues con TGI o vLLM (los tags incluyen `text-generation-inference` y `endpoints_compatible`) antes de sustituir por un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, MedQA, MedMCQA, HumanEval, GSM8K ni de ningún otro conjunto, y la búsqueda web no aportó datos sobre este repositorio.

## Requisitos de hardware

- VRAM para pesos en BF16: aproximadamente 8,0 GB (4.022 millones de parámetros × 2 bytes), más caché KV y activaciones.
- VRAM para pesos en INT8: aproximadamente 4,0 GB; en INT4 (GPTQ/AWQ): aproximadamente 2,0-2,3 GB, más overhead del runtime.
- VRAM práctica estimada: 10-12 GB en BF16 para contextos moderados; 4-6 GB en cuantización de 4 bits con contexto corto. Cifras orientativas, no medidas por el autor.
- GPU de consumo: cabe con holgura en RTX 4090 (24 GB) en BF16 y en RTX 3090/4080 (16-24 GB); en RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) es recomendable cuantizar a 8 o 4 bits si se usan contextos largos.
- GPU de datacenter: A100 (40/80 GB), H100 y L40S permiten mayor paralelismo y lotes más grandes; no son necesarias para inferencia individual.
- Despliegue: `transformers` de forma nativa; vLLM y TGI para serving con batching continuo (tags `text-generation-inference` y `endpoints_compatible`); llama.cpp u Ollama tras convertir los pesos a GGUF, conversión no incluida en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| qwen3-4b-medicine-online-pilot-261017-seed42-step-030 | 4.022 M | No disponible (base: 262.144) | Apache 2.0 | Checkpoint experimental, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 | ~4.000 M | 262.144 | Apache 2.0 | Modelo base, publicado y documentado |
| Llama 3.2 3B Instruct | ~3.200 M | 128.000 | Llama 3.2 Community License | Modelo generalista consolidado |
| Gemma 3 4B IT | ~4.000 M | 128.000 | Gemma Terms of Use | Modelo generalista consolidado |

La comparación de rendimiento no es posible: no hay benchmarks publicados de este checkpoint, y los datos de contexto y licencia de las alternativas provienen de su documentación pública, no de la información proporcionada en esta ficha. Frente al modelo base, la diferencia esperable está en el ajuste al dominio médico, cuyo efecto no está cuantificado.

## Limitaciones y advertencias

- No es un modelo validado clínicamente: no se ha publicado ninguna evaluación de precisión diagnóstica, y su uso en decisiones sanitarias exigiría conformidad con el Reglamento europeo de productos sanitarios (MDR) y marcado CE.
- Riesgo elevado de alucinación en contenido médico: sin datos de alineación ni de evaluación de seguridad, las respuestas pueden contener afirmaciones plausibles pero falsas.
- Checkpoint intermedio (paso 30): puede presentar inestabilidad de formato, respuestas truncadas o un estilo inconsistente respecto al modelo final de la ejecución.
- Idiomas no declarados: no se puede asumir un rendimiento correcto en castellano; el modelo base Qwen3 está optimizado para inglés y chino, pero el ajuste fino puede haber alterado esa cobertura.
- Datos de entrenamiento no documentados: se desconocen la procedencia, las licencias y la posible presencia de información personal en el corpus médico utilizado.
- Sesgos: no evaluados. Los sesgos del modelo base en materia de demografía, género o patologías pueden persistir o amplificarse tras el ajuste.
- Licencia Apache 2.0: permisiva para uso comercial, pero no exime del cumplimiento normativo sectorial ni de las obligaciones de transparencia sobre sistemas de IA.
- Trazabilidad limitada: 0 descargas y 0 likes, sin issues ni discusión pública; no hay evidencia de terceros que hayan reproducido el resultado.
- El repositorio incluye el checkpoint nativo de entrenamiento, lo que incrementa el tamaño a 25,7 GB; para solo inferencia conviene descargar únicamente la exportación BF16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVA2/qwen3-4b-medicine-online-pilot-261017-seed42-step-030
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Framework veRL (mencionado en la model card): https://github.com/volcengine/verl
- Paper de Qwen3 (referencia de la arquitectura base): https://arxiv.org/abs/2505.09388
- No se han encontrado en la búsqueda web papers, blogs, demos ni repositorios adicionales asociados a este checkpoint.
