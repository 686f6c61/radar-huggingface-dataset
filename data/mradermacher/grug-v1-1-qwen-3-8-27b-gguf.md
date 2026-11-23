# mradermacher/grug-v1.1-qwen-3.8-27b-GGUF

## Resumen

grug-v1.1-qwen-3.8-27b es un modelo de lenguaje de 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) desarrollado por ProCreations y distribuido en formato GGUF por mradermacher. Se trata de un ajuste fino (fine-tune) sobre una base Qwen de 27B, orientado explícitamente a razonamiento eficiente en tokens, uso agéntico y llamadas a herramientas. El modelo se publica bajo licencia Apache 2.0, lo que facilita su adopción tanto en investigación como en entornos comerciales.

La relevancia de esta ficha concreta radica en que el repositorio analizado no contiene los pesos originales, sino las cuantizaciones estáticas generadas por mradermacher, un colaborador habitual de la comunidad que produce versiones GGUF optimizadas para inferencia local. Esto permite ejecutar un modelo de 27B en hardware de consumo mediante cuantizaciones de 4 bits que ocupan entre 15,7 y 16,6 GB, o incluso en configuraciones más ajustadas con Q2_K (10,8 GB).

El modelo está etiquetado como especializado en razonamiento, eficiencia de tokens, capacidades agénticas y tool-use, y declara soporte únicamente para inglés. La información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada, por lo que esta ficha distingue explícitamente entre los datos verificables del repositorio y aquellos que no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen, detalles específicos no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); repo base en transformers |

## Arquitectura y entrenamiento

El modelo base es ProCreations/grug-v1.1-qwen-3.8-27b, un fine-tune sobre una arquitectura Qwen de 27B. La información disponible no detalla la arquitectura interna exacta (número de capas, dimensiones ocultas, mecanismo de atención, uso de MoE o de atención lineal), ni el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de RLHF, DPO o similares. Las etiquetas del repositorio indican que el ajuste se orientó a razonamiento eficiente en tokens, comportamiento agéntico y uso de herramientas, lo que sugiere un entrenamiento supervisado específico para esos dominios, aunque no se aportan detalles verificables.

El repositorio analizado corresponde exclusivamente a las cuantizaciones estáticas generadas por mradermacher, no a los pesos originales. El proceso de cuantización se realizó con convert_type hf y quantize_version 2, e incluye un suplemento multimodal (mmproj) en Q8_0 y f16, lo que indica que el modelo base incorpora capacidades de visión que se preservan en las versiones cuantizadas. También existe una variante con cuantizaciones ponderadas por imatrix en el repositorio mradermacher/grug-v1.1-qwen-3.8-27b-i1-GGUF, que no forma parte de esta ficha.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento explícito orientado a la eficiencia de tokens (token-efficient reasoning).
- Uso de herramientas y function calling (tool-use).
- Comportamiento agéntico y razonamiento multi-paso.
- Capacidades multimodales (visión) preservadas mediante los ficheros mmproj incluidos en el repositorio.
- No se dispone de información verificable sobre capacidades matemáticas avanzadas, generación de código o soporte multilingüe más allá del inglés.

## Casos de uso

- Agentes autónomos con tool calling: el modelo está entrenado explícitamente para uso de herramientas y razonamiento multi-paso, por lo que puede integrarse en bucles de agente que consulten APIs, bases de datos o servicios externos y encadenen llamadas hasta resolver la tarea.
- Automatización de flujos de trabajo con eficiencia de tokens: al estar optimizado para razonamiento token-efficient, es adecuado para pipelines donde el coste por token o la latencia importan, como clasificación y enrutamiento de tickets o extracción estructurada de información.
- Asistentes conversacionales en inglés: su naturaleza conversacional y su licencia Apache 2.0 permiten desplegarlo en productos de atención al cliente en inglés sin restricciones comerciales adicionales.
- Procesamiento de documentos con componente visual: gracias a los ficheros mmproj, puede utilizarse en tareas que combinen texto e imagen, como descripción de capturas, extracción de datos de formularios escaneados o análisis de diagramas.
- Inferencia local en estaciones de trabajo: las cuantizaciones Q4_K_M (16,6 GB) y Q5_K_M (19,3 GB) permiten ejecutar el modelo en GPUs de consumo de gama alta con 24 GB de VRAM, habilitando prototipado y desarrollo sin depender de la nube.
- Evaluación de razonamiento en investigación: al ser un fine-tune especializado en razonamiento eficiente, resulta útil para estudiar el equilibrio entre calidad de razonamiento y número de tokens generados en comparación con modelos base.
- Despliegue en entornos con recursos limitados: la cuantización Q2_K (10,8 GB) hace viable la ejecución en GPUs de 12 GB, aunque con pérdida de calidad, para tareas de baja criticidad o pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~10,8 GB; Q3_K_S ~12,2 GB; Q3_K_M ~13,4 GB; Q3_K_L ~14,4 GB; IQ4_XS ~15,3 GB; Q4_K_S ~15,7 GB; Q4_K_M ~16,6 GB; Q5_K_S ~18,8 GB; Q5_K_M ~19,3 GB; Q6_K ~22,2 GB; Q8_0 ~28,7 GB. Añadir ~0,7-1,0 GB si se usa el suplemento multimodal mmproj.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para las mismas cuantizaciones; A100 40/80 GB o H100 para Q8_0 y para despliegues con contexto largo; GPUs de 12 GB (RTX 3060, RTX 4070) solo con Q2_K o Q3_K_S.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones de 4-5 bits; en GPUs de 12 GB únicamente con cuantizaciones de 2-3 bits.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los endpoints son compatibles según las etiquetas del repositorio. Para los pesos originales en transformers sería necesario vLLM o TGI, no incluidos en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| grug-v1.1-qwen-3.8-27b (esta ficha) | ~26,9B | no disponible | Apache 2.0 | GGUF | Fine-tune orientado a razonamiento eficiente y tool-use, solo inglés |
| Qwen base de 27B (familia) | ~27B | no disponible | según variante | safetensors/GGUF | Modelo base del que deriva; no se dispone de datos concretos de la versión exacta |
| Alternativas de ~27-32B en GGUF | 27-32B | variable | variable | GGUF | No se dispone de datos verificables para una comparación numérica fiable |

No se dispone de información suficiente para establecer una comparación cuantitativa con alternativas concretas; los datos de benchmarks y contexto del modelo base no están publicados en la información disponible.

## Limitaciones y advertencias

- Idiomas: el modelo declara únicamente inglés; su rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Contexto: se desconoce la longitud máxima de contexto soportada, lo que impide planificar despliegues con ventanas largas sin validación previa.
- Alucinación: no hay datos publicados sobre tasas de alucinación ni evaluaciones de fiabilidad; debe validarse en el dominio de aplicación antes de producción.
- Sesgos: no se documenta la composición del dataset de entrenamiento ni los sesgos conocidos del modelo base o del fine-tune.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen subyacente, ya que algunas variantes de esa familia tienen licencias propias que podrían aplicar en cascada.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior.
- Repositorio de cuantización: esta ficha describe las cuantizaciones de mradermacher, no los pesos originales; para reproducir el entrenamiento o hacer fine-tuning adicional hay que acudir al repositorio base ProCreations/grug-v1.1-qwen-3.8-27b.
- Multimodalidad: los ficheros mmproj están incluidos, pero no se documenta el alcance exacto de las capacidades de visión ni su calidad tras la cuantización.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/grug-v1.1-qwen-3.8-27b-GGUF
- Modelo base: https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/grug-v1.1-qwen-3.8-27b-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#grug-v1.1-qwen-3.8-27b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
