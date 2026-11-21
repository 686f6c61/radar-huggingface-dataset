# mradermacher/Qwen3.8-27B-Omnimerge-v6-i1-GGUF

## Resumen

Qwen3.8-27B-Omnimerge-v6-i1-GGUF es la versión cuantizada en formato GGUF del modelo fusionado ManniX-ITA/Qwen3.8-27B-Omnimerge-v6, publicada por mradermacher, un conocido creador de cuantizaciones para el ecosistema llama.cpp. El modelo base es un merge (fusión) construido con mergekit a partir de modelos de la familia Qwen 3.5, orientado a tareas de razonamiento, generación de código y capacidades de visión. Cuenta con 27.320.697.856 parámetros totales según los pesos en safetensors del modelo base.

La relevancia de esta ficha reside en que ofrece el modelo en múltiples niveles de cuantización (desde i1-Q2_K de 11 GB hasta i1-Q6_K de 22,5 GB), lo que permite ejecutarlo en hardware de consumo con pérdida de calidad controlada. Las cuantizaciones i1 (imatrix) incorporan una matriz de importancia que mejora la calidad respecto a las cuantizaciones estáticas equivalentes, especialmente en los niveles bajos.

El modelo se distribuye bajo licencia Apache 2.0 y está etiquetado para inglés, con soporte declarado de razonamiento, código y visión. Al tratarse de un merge comunitario, no dispone de una model card técnica detallada del autor original, por lo que buena parte de las especificaciones (contexto, datos de entrenamiento, benchmarks) no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos Qwen 3.5 mediante mergekit); detalles internos no disponibles |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix); cuantizaciones estáticas en el repo hermano Qwen3.8-27B-Omnimerge-v6-GGUF |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión (merge) de modelos de la familia Qwen 3.5 realizada con mergekit, según las etiquetas de la model card. No se dispone de información sobre la receta exacta del merge (método de fusión, modelos de origen individuales, pesos de interpolación) ni sobre el proceso de entrenamiento posterior. Al ser un merge, no ha sido entrenado desde cero: hereda las capacidades de los modelos que lo componen.

La versión publicada por mradermacher aplica cuantización GGUF con matriz de importancia (imatrix), generada a partir de un fichero imatrix propio. Las cuantizaciones i1 suelen superar en perplejidad a las cuantizaciones estáticas de tamaño similar, especialmente en los niveles Q2 y Q3. El repositorio incluye el fichero imatrix (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones. No hay información disponible sobre datos de entrenamiento, número de tokens, RLHF/DPO ni innovaciones técnicas del modelo base.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento: el modelo está etiquetado con "reasoning", lo que sugiere soporte de cadenas de pensamiento o modos de razonamiento extendido, aunque no se detalla su funcionamiento.
- Generación de código: etiquetado con "code".
- Visión: etiquetado con "vision", lo que implica soporte de entrada de imágenes, aunque no se especifica la resolución ni el codificador visual.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking: no confirmado explícitamente en la información disponible.

## Casos de uso

- Asistencia de código en local: con la cuantización i1-Q4_K_M (16,9 GB) el modelo puede ejecutarse en una GPU de 24 GB y emplearse para autocompletado, revisión de código y generación de tests en entornos sin conexión, donde la confidencialidad del código es crítica.
- Razonamiento sobre documentación técnica: gracias a la etiqueta de razonamiento, puede emplearse para analizar especificaciones, trazas de error y documentación extensa en inglés, generando explicaciones paso a paso.
- Procesamiento de capturas y diagramas: la capacidad de visión permite extraer información de imágenes (diagramas de arquitectura, capturas de pantalla de errores) y convertirla en texto o código, útil en herramientas de soporte técnico.
- Despliegue en estaciones de trabajo con llama.cpp: las cuantizaciones Q3 y Q4 permiten ejecutar el modelo en GPUs de consumo (RTX 3090/4090) o en configuraciones CPU+GPU, ideal para prototipado rápido de aplicaciones conversacionales.
- Experimentación con merges comunitarios: investigadores que estudian el efecto de las fusiones de modelos pueden comparar esta versión cuantizada con el modelo base en safetensors para evaluar la degradación por cuantización.
- Generación de contenido técnico en inglés: redacción de documentación, resúmenes y explicaciones técnicas, aprovechando el contexto conversacional del modelo.
- Evaluación de calidad de cuantizaciones: el fichero imatrix incluido permite generar cuantizaciones propias y comparar perplejidad entre niveles, útil para equipos que calibran pipelines de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - i1-Q2_K: ~11 GB de pesos, ~12-13 GB de VRAM con overhead.
  - i1-Q3_K_M / i1-IQ3_M: ~13-14 GB de pesos, ~14-15 GB de VRAM.
  - i1-Q4_K_M: ~16,9 GB de pesos, ~18-19 GB de VRAM.
  - i1-Q5_K_M: ~19,6 GB de pesos, ~21-22 GB de VRAM.
  - i1-Q6_K: ~22,5 GB de pesos, ~24 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para Q4_K_M; A100 40/80 GB o H100 para Q6_K y para mayor margen de contexto. Las cuantizaciones Q2/Q3 caben en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) con contexto limitado.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q6_K en tarjetas de 24 GB; Q3 y Q4 en tarjetas de 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los quants i1 requieren versiones recientes de llama.cpp. Para el modelo base en safetensors, vLLM o TGI (no confirmado para esta arquitectura concreta).
- Latencia y throughput: no disponibles; dependerán del hardware y del nivel de cuantización. Como referencia orientativa, un modelo denso de ~27B en Q4_K_M suele generar entre 20 y 40 tokens/s en una RTX 4090, pero no se ha verificado para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Omnimerge-v6-i1-GGUF (este) | 27,3B | no disponible | Apache 2.0 | GGUF (i1) | Merge comunitario con visión y razonamiento; cuantizaciones imatrix |
| Qwen3.8-27B-Omnimerge-v6-GGUF (estático) | 27,3B | no disponible | Apache 2.0 | GGUF | Mismo modelo base, cuantizaciones estáticas sin imatrix |
| ManniX-ITA/Qwen3.8-27B-Omnimerge-v6 (base) | 27,3B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar; requiere más VRAM |
| Modelos Qwen 3.5 originales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos concretos de los modelos de origen del merge |

No se dispone de información suficiente para comparar rendimiento (benchmarks) con alternativas de la misma categoría.

## Limitaciones y advertencias

- Al ser un merge comunitario sin model card técnica detallada, no hay garantías documentadas sobre el comportamiento en producción ni sobre la composición exacta de los modelos fusionados.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos: no documentados; al heredar de modelos base no identificados, los sesgos de estos se transmiten sin control explícito.
- Cuantizaciones bajas (Q2, Q3): degradación notable de calidad y mayor propensión a errores; no recomendadas para producción crítica.
- Capacidad de visión: aunque etiquetada, no se especifica el codificador visual ni si las cuantizaciones GGUF conservan el proyector multimodal (mmproj); verificar antes de usar en tareas de imagen.
- Tool calling y agentes: no confirmados; no asumir soporte sin pruebas.
- Licencia Apache 2.0 permite uso comercial, pero al ser un merge de modelos de origen no detallados, conviene verificar las licencias de los componentes originales.
- El repo ocupa 218,6 GB; la descarga de cuantizaciones individuales requiere seleccionar el fichero concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Omnimerge-v6-i1-GGUF
- Modelo base: https://huggingface.co/ManniX-ITA/Qwen3.8-27B-Omnimerge-v6
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.8-27B-Omnimerge-v6-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Omnimerge-v6-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
