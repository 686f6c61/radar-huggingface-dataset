# mradermacher/Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1-GGUF

## Resumen

Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1-GGUF es la versión cuantizada en formato GGUF del modelo PeetPedro/Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1, un fine-tune de la familia Qwen3 con aproximadamente 26.900 millones de parámetros. La cuantización la ha realizado mradermacher, un autor habitual en el ecosistema GGUF, y ofrece múltiples niveles de compresión (desde Q2_K hasta Q8_0) para facilitar el despliegue en hardware de consumo mediante llama.cpp u Ollama.

El modelo base combina varias técnicas de ajuste fino: el autor lo etiqueta como "heretic" (orientado a reducir rechazos y censura), "Cold Fusion", "GAIN Training" y "Multi-stage tuning", además de una destilación de estilo Manus. Incorpora también un componente multimodal, ya que el repositorio incluye ficheros mmproj (Q8_0 y f16) que permiten procesar imágenes en llama.cpp.

Es relevante para desarrolladores que quieran ejecutar localmente un modelo de ~27B sin censura restrictiva y con capacidad multimodal, sin necesidad de GPUs de centro de datos. La licencia Apache 2.0 facilita su uso comercial, aunque la naturaleza "uncensored" del fine-tune exige controles adicionales en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3), con componente multimodal via mmproj |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no consta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (segun model card; no se detallan mas idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de la familia Qwen3 (etiquetado internamente como qwen3_8 y qwen3_6 en los tags), con ~26,9B parámetros. La model card del cuantizador no detalla la arquitectura interna (número de capas, dimensiones, tipo de atención), por lo que no se puede confirmar si emplea atención lineal, decodificación especulativa u otras innovaciones de la familia Qwen3. La presencia de ficheros mmproj indica que el modelo base incorpora un codificador visual para entrada multimodal.

El entrenamiento se describe mediante etiquetas: "Cold Fusion", "GAIN Training" y "Multi-stage tuning", junto con "ManusDistill" (probablemente destilación de datos o estilo del agente Manus) y "heretic" (técnica de ablación de rechazos para reducir la censura). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO. La cuantización la realiza mradermacher con su pipeline habitual (quantize_version 2, output_tensor_quantised 1, convert_type hf), generando cuantizaciones estáticas; también existe una variante con imatrix en el repositorio i1-GGUF.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Procesamiento multimodal de imágenes mediante los ficheros mmproj (Q8_0 y f16) en llama.cpp.
- Comportamiento "uncensored": el ajuste heretic reduce los rechazos ante peticiones sensibles.
- Destilación de estilo Manus: se espera capacidad para tareas agénticas y de razonamiento multi-paso, aunque no se documenta explícitamente.
- Soporte de tool calling / function calling: no confirmado en la información disponible (la familia Qwen3 lo soporta, pero no se verifica para este fine-tune).
- Capacidades multilingües: la model card solo declara inglés.
- Compatible con endpoints (tag endpoints_compatible) y con la librería transformers para el modelo base.

## Casos de uso

- Asistente conversacional local sin censura: desplegado con Ollama o llama.cpp en una estación de trabajo con GPU de 24 GB, usando Q4_K_M (~16,8 GB) para conversaciones multi-turno en inglés con baja latencia.
- Análisis de imágenes en local: gracias a los ficheros mmproj, se puede usar para descripción de imágenes, extracción de texto de capturas o moderación visual en pipelines privados sin enviar datos a la nube.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o material editorial donde los modelos alineados suelen rechazar temáticas sensibles.
- Investigación sobre alineación y censura: el ajuste heretic lo convierte en un objeto de estudio para comparar tasas de rechazo frente al Qwen3 original.
- Prototipado de agentes con destilación Manus: experimentación con flujos multi-paso y uso de herramientas en entornos controlados, aprovechando el estilo de razonamiento destilado.
- Despliegue en hardware de consumo: la cuantización Q4_K_S (~15,7 GB) permite ejecución en GPUs de 16-24 GB (RTX 4080, 4090, A5000) para aplicaciones de escritorio.
- Fine-tuning posterior o destilación: el modelo base en safetensors (26,9B) sirve como punto de partida para ajustes específicos de dominio con licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~11,2 GB
  - Q3_K_M: ~13,6 GB
  - IQ4_XS: ~15,5 GB
  - Q4_K_M: ~16,8 GB
  - Q5_K_M: ~19,4 GB
  - Q6_K: ~22,2 GB
  - Q8_0: ~28,7 GB
  - mmproj: ~0,1 GB adicional para multimodal
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M; A5000/RTX 4080 (16 GB) para Q4_K_S con offload parcial; A100 40/80 GB o H100 para Q8_0 y contexto largo.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con Q4_K_M o Q5_K_M; en GPUs de 16 GB con Q3_K_M o Q4_K_S y offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1 (este) | ~26,9B | no disponible | Apache 2.0 | GGUF, safetensors | Fine-tune uncensored multimodal |
| Qwen3 original (familia) | ~27B (variantes) | no disponible | Apache 2.0 | safetensors, GGUF | Modelo base alineado |
| Gemma 3 27B | 27B | no disponible | Gemma license | safetensors, GGUF | Multimodal, alineado |
| Mistral Small 3 (24B) | 24B | no disponible | Apache 2.0 | safetensors, GGUF | Sin multimodal |

La comparación cuantitativa de rendimiento no está disponible al no haberse publicado benchmarks de este fine-tune.

## Limitaciones y advertencias

- Modelo "uncensored" (heretic): puede generar contenido sensible, ofensivo o inseguro; requiere filtros y moderación propios en producción.
- Riesgo elevado de alucinación: los fine-tunes agresivos y las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la fidelidad factual.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Contexto: no se documenta la longitud de contexto soportada; en GGUF puede verse limitada por la configuración del runtime.
- Licencia Apache 2.0 permite uso comercial, pero el autor del fine-tune no ofrece garantías sobre el cumplimiento de políticas de contenido.
- Las cuantizaciones Q2_K y Q3_K_M están marcadas como de menor calidad; para producción se recomienda Q4_K_M o superior.
- No hay benchmarks publicados: la evaluación de capacidades (razonamiento, código, matemáticas) debe hacerse empíricamente antes de adoptarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1-GGUF
- Modelo base: https://huggingface.co/PeetPedro/Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1-GGUF
- Peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (ejemplo de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
