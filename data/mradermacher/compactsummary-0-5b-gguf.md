# mradermacher/compactsummary-0.5b-GGUF

## Resumen

compactsummary-0.5b-GGUF es la versión cuantizada en formato GGUF del modelo compactsummary-0.5b, desarrollado originalmente por el usuario vennyvirtuoso y publicado en Hugging Face. Se trata de un modelo pequeño de 494 millones de parámetros, afinado mediante PEFT (LoRA) sobre una base Qwen2.5, y especializado en tareas de resumen compacto, generación de títulos y extracción de entidades. Su propósito es ofrecer capacidades de procesamiento de lenguaje natural estructurado en entornos con recursos limitados, como dispositivos de borde (edge AI).

La relevancia de esta ficha radica en que mradermacher, un conocido cuantizador de la comunidad, ha generado múltiples variantes GGUF (desde Q2_K hasta f16) que permiten ejecutar el modelo en hardware de consumo con requisitos de memoria muy reducidos, entre 0,4 GB y 1,1 GB según la cuantización. Esto lo hace atractivo para pipelines de resumen y etiquetado que necesitan baja latencia y despliegue local.

El modelo está licenciado bajo Apache 2.0 y soporta únicamente inglés. Su diseño está orientado a salidas estructuradas y tareas de NLP concretas, no a razonamiento general ni generación creativa extensa. Al ser una cuantización estática, no se han publicado versiones con imatrix o ponderadas por el autor de esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5, afinado con PEFT/LoRA) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atención causal estándar. Sobre esta base, el autor original aplicó un ajuste fino supervisado mediante PEFT (LoRA), según se desprende de las etiquetas de la model card. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset CompactSummary ni si se aplicaron técnicas de RLHF o DPO. La model card no incluye sección de entrenamiento ni hiperparámetros.

La innovación principal no reside en la arquitectura, sino en la especialización: el modelo está orientado a resumen compacto, generación de títulos y extracción de entidades, con énfasis en salidas estructuradas. El proceso de cuantización realizado por mradermacher es estático (quantize_version: 2), con conversión desde pesos Hugging Face y cuantización de tensores de salida. No se han generado cuantizaciones ponderadas por imatrix, lo que puede afectar ligeramente a la calidad en los tamaños más pequeños.

## Capacidades

- Generación de resúmenes compactos de textos, orientados a brevedad y densidad informativa.
- Generación de títulos a partir de contenido textual.
- Extracción de entidades nombradas y estructuras de información.
- Soporte de salidas estructuradas (structured outputs), útil para integrarse en pipelines que requieren JSON u otros formatos parseables.
- Capacidad conversacional básica, según la etiqueta "conversational" del repositorio.
- Diseñado para edge AI: bajo consumo de memoria y despliegue en dispositivos con recursos limitados.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode).
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Resumen automático de artículos y documentos: el modelo puede condensar textos en resúmenes breves, adecuado para boletines, agregadores de noticias o paneles de monitorización donde se requiere baja latencia y ejecución local.
- Generación de títulos para CMS y blogs: integrado en un pipeline de publicación, puede producir títulos a partir del cuerpo del artículo sin depender de APIs externas, reduciendo costes y latencia.
- Extracción de entidades en procesamiento de documentos: útil para enriquecer metadatos (personas, organizaciones, lugares) en flujos de indexación o búsqueda empresarial.
- Procesamiento en dispositivos de borde: al ocupar entre 0,4 y 1,1 GB en GGUF, puede ejecutarse en mini-PC, Raspberry Pi con suficiente RAM o portátiles sin GPU dedicada mediante llama.cpp u Ollama.
- Preprocesado en pipelines de datos: resumen y etiquetado de grandes volúmenes de texto antes de alimentar modelos mayores, actuando como filtro o compactador para reducir costes de inferencia aguas abajo.
- Clasificación y estructuración de tickets de soporte: con salidas estructuradas, puede extraer campos clave (producto, problema, urgencia) de mensajes de usuario en inglés para su enrutamiento automático.
- Generación de metadatos para motores de búsqueda internos: títulos y resúmenes cortos que mejoren la relevancia y la presentación de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 0,4 GB (Q2_K/Q3_K_S) y 1,1 GB (f16); las cuantizaciones recomendadas Q4_K_S y Q4_K_M ocupan aproximadamente 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como GTX 1650, RTX 3050, RTX 4060 o superiores son suficientes. También puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el repositorio incluye la etiqueta "endpoints_compatible". Para el modelo base en safetensors, transformers con PEFT.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (0,5B) se espera baja latencia en hardware de consumo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| compactsummary-0.5b-GGUF | 494 M | no disponible | Apache 2.0 | GGUF | Especializado en resumen, títulos y entidades; solo inglés |
| Qwen2.5-0.5B | 494 M | 32 K (según documentación pública de Qwen2.5) | Apache 2.0 | safetensors, GGUF | Modelo base generalista; no especializado en resumen estructurado |
| SmolLM2-360M | 360 M | 8 K (según documentación pública) | Apache 2.0 | safetensors, GGUF | Alternativa pequeña generalista para edge; no especializada en resumen |
| no disponible | - | - | - | - | No se dispone de comparativas publicadas específicas para este modelo |

La comparación con Qwen2.5-0.5B es directa porque compactsummary-0.5b se basa en él; la diferencia es el ajuste LoRA para tareas concretas. SmolLM2-360M se incluye como referencia de tamaño similar en el segmento edge, aunque sus datos de contexto y rendimiento provienen de documentación pública y no de una evaluación conjunta.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen2.5 y entrenarse con un dataset específico (CompactSummary), puede heredar sesgos del corpus base y del conjunto de ajuste.
- Riesgo de alucinación: presente, como en cualquier modelo generativo; en tareas de extracción de entidades y resumen puede inventar detalles no presentes en el texto fuente, por lo que se recomienda verificación en producción.
- Limitaciones de contexto: la longitud de contexto no está documentada; no debe asumirse la ventana de 32 K de Qwen2.5 sin confirmación.
- Limitación de idioma: solo inglés; no apto para textos en castellano u otros idiomas sin un ajuste adicional.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribución; verificar las condiciones del modelo base y del dataset CompactSummary.
- Caveat de cuantización: las versiones Q2_K y Q3_K_S pueden degradar la calidad; el autor recomienda Q4_K_S y Q4_K_M como equilibrio rapidez/calidad, y Q8_0 para mejor calidad.
- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real en tareas concretas debe validarse con un conjunto de prueba propio.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica baja validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/compactsummary-0.5b-GGUF
- Modelo base: https://huggingface.co/vennyvirtuoso/compactsummary-0.5b
- Página de overview de cuantizaciones: https://hf.tst.eu/model#compactsummary-0.5b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del cuantizador: https://www.nethype.de/
