# mradermacher/Nemotron-SEA-LION-v5-E4B-GGUF

## Resumen

Nemotron-SEA-LION-v5-E4B es un modelo de lenguaje desarrollado por AI Singapore (aisingapore) y publicado originalmente en formato Hugging Face Transformers. La versión aquí documentada es una cuantización estática en formato GGUF realizada por mradermacher, pensada para su ejecución local mediante llama.cpp y herramientas compatibles. El modelo base cuenta con 7.518.069.290 parámetros totales según los pesos en safetensors, lo que lo sitúa en la franja de los modelos de ~7.5B.

El modelo está específicamente orientado al sudeste asiático: su lista de idiomas soportados incluye inglés, chino, birmano (my), indonesio, filipino, malayo, tamil, tailandés y vietnamita. El dataset de instrucciones asociado es `aisingapore/SEA-Instruct-2602`, lo que indica un enfoque en el ajuste por instrucciones multilingüe para lenguas de la región. La licencia MIT facilita su uso comercial sin restricciones significativas.

La relevancia de esta ficha reside en que permite desplegar el modelo en hardware de consumo mediante cuantizaciones que van desde Q2_K (4,5 GB) hasta Q8_0 (8,1 GB), además de incluir archivos mmproj (multi-modal supplement) que sugieren capacidades de visión. El repo GGUF ocupa 76,9 GB e incluye todas las variantes de cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer; detalles no especificados en la información proporcionada) |
| Parámetros totales | 7.518.069.290 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en, zh, my, id, fil, ms, ta, th, vi |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Los parámetros totales (7.518.069.290) apuntan a un transformer denso de aproximadamente 7,5B, pero no se confirma si emplea atención lineal, decodificación especulativa u otras innovaciones. Tampoco se especifica la longitud de contexto nativa.

El entrenamiento se asocia al dataset `aisingapore/SEA-Instruct-2602`, un conjunto de instrucciones orientado a lenguas del sudeste asiático. No se detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La presencia de archivos mmproj en la cuantización sugiere que el modelo base incorpora un componente multimodal (visión), aunque no se confirma en la información disponible.

## Capacidades

- Generación de texto conversacional en nueve idiomas: inglés, chino, birmano, indonesio, filipino, malayo, tamil, tailandés y vietnamita.
- Ajuste por instrucciones (instruction following) según el dataset SEA-Instruct-2602.
- Capacidades multimodales potenciales: la presencia de archivos `mmproj` (multi-modal supplement) en el repo GGUF indica soporte de entrada visual, aunque no se detalla su alcance.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Capacidades de código y matemáticas: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente multilingüe en el sudeste asiático: el modelo cubre indonesio, malayo, filipino, tailandés, vietnamita, birmano y tamil, lo que permite desplegar un único modelo para soporte en varios mercados de la región sin necesidad de modelos separados por idioma.
- Procesamiento de documentos en lenguas regionales: clasificación, resumen y extracción de información de textos en tamil, birmano o tailandés, idiomas con menor cobertura en modelos generalistas.
- Despliegue local en hardware de consumo: con cuantizaciones Q4_K_M (5,4 GB) o Q5_K_M (5,9 GB) puede ejecutarse en GPUs consumer de 8-12 GB de VRAM mediante llama.cpp u Ollama, útil para prototipos y entornos sin conexión.
- Traducción asistida entre inglés/chino y lenguas del sudeste asiático: el ajuste con SEA-Instruct-2602 lo hace adecuado para tareas de traducción y adaptación de contenido en la región.
- Asistentes conversacionales embebidos: al ser un modelo de ~7,5B con licencia MIT, puede integrarse en productos comerciales sin restricciones de licencia, por ejemplo en aplicaciones móviles o de escritorio con inferencia local.
- Investigación en NLP de bajos recursos: sirve como base para fine-tuning en lenguas del sudeste asiático con menor representación, gracias a su licencia permisiva y a su tamaño manejable.
- Procesamiento multimodal (si se confirma la visión): los archivos mmproj permiten, en teoría, tareas de descripción de imágenes o extracción de información visual, aunque no se detalla su alcance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~4,5 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~4,8-5,1 GB
  - IQ4_XS: ~5,2 GB
  - Q4_K_S / Q4_K_M: ~5,3-5,4 GB
  - Q5_K_S / Q5_K_M: ~5,8-5,9 GB
  - Q6_K: ~6,3 GB
  - Q8_0: ~8,1 GB
  - f16: ~15,2 GB
  - mmproj (si se usa visión): ~0,7 GB (Q8_0) o ~1,1 GB (f16) adicionales
- GPU recomendadas: para Q4_K_M o Q5_K_M, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; para Q8_0, una RTX 4070 Ti/4080 de 16 GB o superior; para f16, una RTX 4090 de 24 GB o A100/H100.
- Cabe en GPU consumer: sí, en la mayoría de cuantizaciones Q4-Q6 con GPUs de 8-12 GB; f16 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. El repo indica `endpoints_compatible`.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de modelos de la misma categoría en la información proporcionada. Se puede señalar que, por tamaño (~7,5B) y licencia MIT, es comparable en categoría a modelos densos de 7-8B con licencia permisiva, pero no se aportan métricas para una comparación cuantitativa.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Nemotron-SEA-LION-v5-E4B | 7.518.069.290 | no disponible | MIT | GGUF / safetensors |
| Alternativas de ~7-8B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos; al estar entrenado con un dataset regional (SEA-Instruct-2602), puede presentar sesgos hacia las lenguas y culturas mejor representadas en dicho dataset.
- Riesgo de alucinación inherente a los modelos de ~7,5B; no se dispone de evaluaciones de fidelidad.
- La longitud de contexto no está documentada, lo que impide garantizar el comportamiento en conversaciones largas o documentos extensos.
- Aunque cubre nueve idiomas, el grado de competencia por idioma no está cuantificado; el birmano, tamil o filipino podrían tener un rendimiento inferior al inglés o al chino.
- La licencia MIT permite uso comercial sin restricciones, pero conviene verificar las condiciones del modelo base original (aisingapore/Nemotron-SEA-LION-v5-E4B) por si hubiera términos adicionales no reflejados en la cuantización.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia y la precisión; para producción se recomienda Q4_K_M o superior.
- La funcionalidad multimodal (mmproj) no está documentada en detalle; su uso en producción requeriría validación adicional.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Nemotron-SEA-LION-v5-E4B-GGUF
- Modelo base: https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Nemotron-SEA-LION-v5-E4B-i1-GGUF
- Página de resumen del modelo: https://hf.tst.eu/model#Nemotron-SEA-LION-v5-E4B-GGUF
- Dataset de instrucciones: https://huggingface.co/datasets/aisingapore/SEA-Instruct-2602
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
