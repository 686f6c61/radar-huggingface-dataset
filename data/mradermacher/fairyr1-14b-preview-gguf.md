# mradermacher/FairyR1-14B-Preview-GGUF

## Resumen

FairyR1-14B-Preview-GGUF es la versión cuantizada en formato GGUF del modelo FairyR1-14B-Preview, desarrollado originalmente por PKU-DS-LAB (Universidad de Pekín, grupo de Data Science). La cuantización la ha realizado mradermacher, un conocido publicador de versiones GGUF de la comunidad, manteniendo la licencia Apache 2.0 del modelo original. El modelo cuenta con 14.770.033.664 parámetros totales (aproximadamente 14,8 mil millones) y está orientado a tareas conversacionales en inglés.

Se trata de un modelo derivado de la familia R1 (estilo razonamiento, inspirado en DeepSeek-R1), aunque la información disponible no detalla la arquitectura interna ni el proceso de entrenamiento del modelo base. La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de 14B en hardware de consumo mediante cuantizaciones que van desde 5,9 GB (Q2_K) hasta 15,8 GB (Q8_0).

El repositorio tiene un tamaño total de 102 GB, ya que incluye todas las variantes de cuantización publicadas. La versión GGUF permite su despliegue con llama.cpp y herramientas compatibles, sin necesidad de GPUs de datacenter.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, no confirmado en la información) |
| Parámetros totales | 14.770.033.664 (~14,8B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado desde safetensors del modelo base) |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna del modelo base PKU-DS-LAB/FairyR1-14B-Preview. Por el nombre y la familia (R1), se infiere que sigue el paradigma de modelos con capacidades de razonamiento, pero no se confirma en la documentación proporcionada si emplea transformer denso, MoE o técnicas híbridas. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO o RL con verificación.

Lo que sí se conoce es el proceso de cuantización: mradermacher ha generado cuantizaciones estáticas (static quants) a partir de los pesos en formato Hugging Face (convert_type: hf), con output_tensor_quantised: 1 y quantize_version: 2. El autor indica que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicación, y que podrían solicitarse mediante una discusión en la comunidad. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Orientación a tareas de razonamiento, inferida de la familia R1 del modelo base (no confirmada explícitamente en la documentación disponible).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional en inglés para atención al cliente: el modelo puede gestionar diálogos multi-turno; la ventana de contexto no está documentada, por lo que se recomienda validar empíricamente el límite práctico antes de desplegarlo en producción.
- Despliegue en hardware de consumo: con la cuantización Q4_K_M (9,1 GB) puede ejecutarse en GPUs consumer de 12 GB o superiores, lo que permite prototipado local sin infraestructura de datacenter.
- Generación de texto en pipelines de procesamiento por lotes: la versión Q8_0 (15,8 GB) ofrece la mejor calidad dentro del repositorio y puede usarse en servidores con 24 GB de VRAM para tareas de resumen, redacción o clasificación.
- Evaluación de modelos de razonamiento en entornos con recursos limitados: al ser una variante GGUF de un modelo tipo R1 de 14B, sirve para comparar el comportamiento de razonamiento frente a alternativas más grandes sin requerir clústeres multi-GPU.
- Integración en aplicaciones de escritorio o edge con llama.cpp: las cuantizaciones Q3_K_S (6,8 GB) o IQ4_XS (8,3 GB) permiten ejecutar el modelo en equipos con 8-10 GB de VRAM o incluso en CPU con suficiente RAM.
- Experimentación académica y reproducibilidad: al estar bajo licencia Apache 2.0, investigadores pueden modificar, redistribuir y comparar el modelo en estudios sobre cuantización y degradación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~5,9 GB de pesos; VRAM práctica recomendada ~8 GB.
  - Q3_K_S: ~6,8 GB; VRAM ~8-10 GB.
  - Q4_K_M: ~9,1 GB; VRAM ~12 GB.
  - Q5_K_M: ~10,6 GB; VRAM ~14-16 GB.
  - Q6_K: ~12,2 GB; VRAM ~16 GB.
  - Q8_0: ~15,8 GB; VRAM ~20-24 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090 (24 GB), A100 40 GB, H100 para despliegues de mayor throughput.
- Cabe en GPU consumer: sí, desde Q2_K hasta Q8_0 en tarjetas de 12-24 GB; las cuantizaciones más pequeñas también pueden ejecutarse en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), LM Studio, y servidores compatibles con GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A nivel estructural, se puede comparar con otras variantes GGUF de modelos de ~14B, pero sin cifras de benchmarks no es posible establecer una comparación rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| FairyR1-14B-Preview-GGUF | ~14,8B | no disponible | Apache 2.0 | GGUF |
| Alternativas de ~14B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: el modelo está etiquetado únicamente para inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- Sesgos conocidos: no documentados en la información disponible; se recomienda evaluar sesgos antes de un uso en producción.
- Riesgo de alucinación: no cuantificado; como en cualquier modelo generativo, existe riesgo, especialmente en tareas factuales.
- Limitaciones de contexto: la longitud de contexto no está especificada, lo que impide garantizar conversaciones multi-turno largas sin validación previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir al modelo base PKU-DS-LAB/FairyR1-14B-Preview.
- Caveat de cuantización: las cuantizaciones Q2_K y Q3_K_M pueden degradar la calidad; el propio autor marca Q3_K_M como "lower quality". Se recomienda Q4_K_M o superior para producción.
- Ausencia de cuantizaciones imatrix: el autor indica que no están disponibles, lo que puede suponer una pérdida de calidad frente a variantes ponderadas en cuantizaciones bajas.
- Modelo "Preview": al ser una versión preliminar, puede tener comportamientos no pulidos y no se garantiza estabilidad futura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/FairyR1-14B-Preview-GGUF
- Modelo base: https://huggingface.co/PKU-DS-LAB/FairyR1-14B-Preview
- Página de descargas del autor: https://hf.tst.eu/model#FairyR1-14B-Preview-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
