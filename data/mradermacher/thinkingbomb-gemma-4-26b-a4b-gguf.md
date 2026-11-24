# mradermacher/ThinkingBomb-gemma-4-26B-A4B-GGUF

## Resumen

ThinkingBomb-gemma-4-26B-A4B-GGUF es la versión cuantizada en formato GGUF del modelo ThinkingBomb-gemma-4-26B-A4B, publicado por el usuario mradermacher. Se trata de una conversión estática de los pesos originales del modelo base desarrollado por krystofmitka, que a su vez se construye sobre la familia Gemma 4 de Google. El modelo está orientado al razonamiento explícito y al control de esfuerzo computacional (effort-control), con entrenamiento mediante GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo que busca mejorar la calidad del razonamiento paso a paso.

El modelo cuenta con 25.233.142.046 parámetros totales (aproximadamente 25,2 mil millones), aunque la nomenclatura "A4B" sugiere una arquitectura con aproximadamente 4 mil millones de parámetros activos, lo que lo sitúa en la categoría de modelos Mixture of Experts (MoE) de tamaño medio. Esta configuración permite un equilibrio entre capacidad de razonamiento y eficiencia computacional en inferencia. El repositorio tiene un tamaño de 184,9 GB, lo que refleja la inclusión de múltiples cuantizaciones del modelo original.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de razonamiento de 25B en hardware de consumo mediante cuantización GGUF, algo que el modelo original en safetensors difícilmente permitiría. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo base declara la licencia Gemma 4 de Google, lo que introduce una ambigüedad que conviene verificar antes de un despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE), basado en Gemma 4 (según nomenclatura A4B, aproximadamente 4B parámetros activos) |
| Parametros totales | 25.233.142.046 (25,2B) |
| Parametros activos | Aproximadamente 4B (inferido de la nomenclatura "A4B"; no confirmado en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (con enlace a la licencia Gemma 4 de Google en el modelo base) |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4 de Google, configurada como un transformer con Mixture of Experts. La nomenclatura "26B-A4B" indica 26 mil millones de parámetros totales con aproximadamente 4 mil millones activos por token, lo que reduce el coste computacional en inferencia respecto a un modelo denso del mismo tamaño. El entrenamiento del modelo base incluyó una fase de razonamiento mediante GRPO, una variante de aprendizaje por refuerzo que optimiza la política del modelo comparando grupos de respuestas generadas, lo que favorece cadenas de razonamiento más consistentes y verificables.

La etiqueta "effort-control" sugiere que el modelo incorpora mecanismos para modular el esfuerzo de razonamiento, probablemente mediante tokens de control que ajustan la profundidad del proceso de pensamiento. No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO adicionales. La cuantización realizada por mradermacher es de tipo estático (static quants) y se ofrece también una variante con cuantización ponderada/imatrix en un repositorio separado.

## Capacidades

- Generación de texto conversacional en inglés con soporte de razonamiento explícito (thinking mode).
- Razonamiento multi-paso potenciado por entrenamiento GRPO, orientado a tareas que requieren cadenas de pensamiento.
- Control de esfuerzo de razonamiento (effort-control), que permite ajustar la profundidad del proceso de pensamiento según la tarea.
- Soporte multimodal: el repositorio incluye archivos mmproj (Q8_0 y f16), lo que indica capacidad de procesamiento de visión además de texto.
- Capacidades de razonamiento matemático y lógico, derivadas del entrenamiento con refuerzo.
- Formato conversacional compatible con pipelines de transformers y endpoints compatibles.
- No se confirma soporte de tool calling ni function calling en la información disponible.
- No se confirma soporte de agentes autónomos multi-paso más allá del razonamiento interno.
- Idiomas: únicamente inglés declarado.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas de matemáticas paso a paso gracias a su entrenamiento con GRPO, que favorece cadenas de razonamiento verificables; adecuado para herramientas educativas o de verificación de cálculos.
- Análisis de documentos con imágenes: gracias a los archivos mmproj incluidos, puede procesar capturas, diagramas o figuras junto con texto, útil en tareas de extracción de información de informes técnicos.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (16,9 GB) y Q4_K_S (15,6 GB) permiten ejecutar el modelo en GPUs de consumo con 24 GB de VRAM, como la RTX 4090, algo inviable con los pesos originales en safetensors.
- Prototipado de agentes de razonamiento: el modo de control de esfuerzo permite experimentar con distintos niveles de profundidad de pensamiento según el presupuesto de latencia, útil en investigación sobre razonamiento en LLMs.
- Generación de explicaciones técnicas: el modelo puede producir razonamientos detallados en inglés para documentación técnica, tutoriales o respuestas de soporte especializado.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 cuantizaciones distintas, lo que permite medir el impacto de la cuantización en la calidad del razonamiento para un mismo modelo base.
- Investigación en RL para LLMs: al estar entrenado con GRPO, sirve como referencia para estudiar el efecto del refuerzo en la calidad del razonamiento y en el control de esfuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~10,7 GB; Q3_K_S ~12,3 GB; IQ4_XS ~14,2 GB; Q4_K_S ~15,6 GB; Q4_K_M ~16,9 GB; Q5_K_M ~19,2 GB; Q6_K ~22,7 GB; Q8_0 ~27,0 GB. Añadir ~0,9-1,3 GB si se usa el proyector multimodal mmproj.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4 y Q5; A100 40 GB o H100 para Q6_K y Q8_0 con contexto largo; GPUs de 16 GB (RTX 4080, 4060 Ti 16GB) solo para Q2_K y Q3_K_S con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090 con Q4_K_M o Q5_K_M; en GPUs de 16 GB con Q3_K_S o IQ4_XS.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, pero esta versión GGUF está pensada para llama.cpp y derivados.
- Latencia y throughput: no disponibles. Al ser un MoE con ~4B parámetros activos, se espera un throughput superior al de un modelo denso de 25B, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThinkingBomb-gemma-4-26B-A4B-GGUF | 25,2B totales / ~4B activos | No disponible | Apache 2.0 (con enlace a Gemma 4) | GGUF | Razonamiento con GRPO y effort-control |
| Modelo base ThinkingBomb-gemma-4-26B-A4B | 25,2B totales / ~4B activos | No disponible | Apache 2.0 (con enlace a Gemma 4) | Safetensors | Pesos originales sin cuantizar |
| Gemma 4 (familia base de Google) | No disponible | No disponible | Gemma 4 License | Safetensors | Modelo fundacional sobre el que se construye |
| Variante i1-GGUF (imatrix) de mradermacher | 25,2B totales / ~4B activos | No disponible | Apache 2.0 | GGUF | Cuantización ponderada con imatrix, potencialmente mejor calidad por bit |

No se dispone de datos de benchmarks ni de modelos comparables de otros autores en la información proporcionada para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación: como todo LLM, puede generar razonamientos plausibles pero incorrectos, especialmente en tareas matemáticas o de lógica complejas; el modo de razonamiento explícito no elimina este riesgo.
- Ambigüedad de licencia: el repositorio declara Apache 2.0, pero el modelo base enlaza a la licencia Gemma 4 de Google, que impone restricciones adicionales de uso comercial y de redistribución. Es imprescindible verificar los términos de la licencia Gemma 4 antes de un despliegue comercial.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S degradan notablemente la calidad del razonamiento; para tareas que dependen de cadenas de pensamiento largas se recomienda Q5_K_M o superior.
- Contexto: no se ha publicado la longitud de contexto soportada, lo que impide planificar tareas de contexto largo con garantías.
- Soporte de tool calling y agentes: no confirmado; si el caso de uso depende de function calling, conviene validarlo empíricamente antes de integrarlo.
- Modelo derivado de un fine-tuning de un modelo base de Google: los sesgos del modelo fundacional (Gemma 4) se heredan y no se han documentado evaluaciones de sesgo específicas para este fine-tuning.
- Repositorio de 184,9 GB: la descarga completa incluye todas las cuantizaciones; conviene descargar solo el archivo GGUF necesario para evitar consumo innecesario de almacenamiento.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/ThinkingBomb-gemma-4-26B-A4B-GGUF
- Modelo base: https://huggingface.co/krystofmitka/ThinkingBomb-gemma-4-26B-A4B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/ThinkingBomb-gemma-4-26B-A4B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#ThinkingBomb-gemma-4-26B-A4B-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
