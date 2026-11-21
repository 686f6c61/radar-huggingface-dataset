# mradermacher/ThinkingBomb-gemma-4-26B-A4B-i1-GGUF

## Resumen

ThinkingBomb-gemma-4-26B-A4B-i1-GGUF es una cuantizacion en formato GGUF del modelo ThinkingBomb-gemma-4-26B-A4B, desarrollado por krystofmitka y cuantizado por mradermacher. Se trata de un ajuste fino del modelo Gemma 4 de Google con 25.233.142.046 parametros totales, orientado a tareas de razonamiento y equipado con mecanismos de control de esfuerzo (effort-control) y entrenamiento mediante GRPO (Group Relative Policy Optimization). El modelo base conserva la arquitectura multimodal de Gemma 4, incluyendo capacidades de vision segun indica la model card.

La relevancia de esta ficha reside en que ofrece una via practica para ejecutar un modelo de razonamiento de aproximadamente 25B parametros en hardware de consumo, gracias a las cuantizaciones con imatrix que reducen el peso desde los 80 GB del repositorio original hasta los 10,7-16,9 GB de las variantes mas comprimidas. Las cuantizaciones i1 (imatrix) de mradermacher estan disenadas para preservar la calidad en niveles de compresion agresivos, lo que resulta especialmente critico en modelos de razonamiento donde los errores de cuantizacion pueden degradar las cadenas de pensamiento.

El modelo esta publicado bajo licencia Apache 2.0, aunque la model card enlaza a la licencia especifica de Gemma 4 de Google, lo que introduce cierta ambiguedad que conviene verificar antes de un uso comercial. El soporte de idiomas declarado se limita al ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Gemma 4 (MoE, segun el sufijo A4B) |
| Parametros totales | 25.233.142.046 |
| Parametros activos | no disponible (el sufijo A4B sugiere ~4B activos, sin confirmacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-Q4_K_S, i1-Q4_K_M (imatrix); estaticas en repositorio separado |
| Idiomas soportados | en |
| Licencia | apache-2.0 (con enlace a licencia Gemma 4 de Google) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Gemma 4 con 25.233.142.046 parametros. El sufijo "A4B" en el nombre sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4 mil millones de parametros activos por token, aunque la informacion proporcionada no confirma explicitamente esta cifra. La model card etiqueta el modelo con "gemma4", "reasoning", "grpo" y "effort-control", lo que indica que el ajuste fino se realizo mediante GRPO, una tecnica de aprendizaje por refuerzo utilizada habitualmente para mejorar el razonamiento, y que incorpora algun mecanismo de control del esfuerzo computacional en la generacion de cadenas de pensamiento.

La model card menciona que se trata de un modelo de vision, con archivos mmproj disponibles en el repositorio de cuantizaciones estaticas. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni los detalles del proceso de RLHF o DPO. Las cuantizaciones i1 utilizan un archivo imatrix generado especificamente para este modelo, lo que permite una asignacion optimizada de bits por tensor.

## Capacidades

- Generacion de texto y razonamiento explicito, con modo de pensamiento (thinking) derivado del entrenamiento con GRPO.
- Control de esfuerzo (effort-control): el modelo permite ajustar la profundidad del razonamiento segun la tarea.
- Capacidades de vision, segun la model card (archivos mmproj en el repositorio estatico).
- Soporte conversacional multi-turno (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Capacidades multilingues limitadas al ingles segun el campo de idiomas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente, aunque el entrenamiento con GRPO sugiere orientacion a tareas de razonamiento complejo.

## Casos de uso

- Razonamiento en local con hardware de consumo: las cuantizaciones i1-Q4_K_M (16,9 GB) permiten ejecutar un modelo de razonamiento de 25B parametros en GPUs con 24 GB de VRAM, como la RTX 4090, usando llama.cpp u Ollama.
- Asistencia en resolucion de problemas matematicos y logicos: el entrenamiento con GRPO y el modo de pensamiento lo hacen adecuado para tareas que requieren cadenas de razonamiento paso a paso, ajustando el esfuerzo segun la dificultad.
- Procesamiento de documentos con componente visual: al ser un modelo de vision, puede emplearse en tareas de extraccion de informacion de imagenes y documentos escaneados, siempre que se despliegue con los archivos mmproj correspondientes.
- Prototipado de agentes de razonamiento en entornos con recursos limitados: la variante i1-IQ3_XXS (11,4 GB) permite experimentar con razonamiento avanzado en GPUs de 12-16 GB.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio ofrece seis variantes i1 con distintos niveles de compresion, lo que facilita estudiar el impacto de la cuantizacion en la calidad del razonamiento.
- Despliegue en servidores sin GPU dedicada de gran capacidad: las variantes Q2_K (10,7 GB) y IQ3_XXS (11,4 GB) permiten inferencia en CPU o GPUs modestas, a costa de cierta perdida de calidad.
- Investigacion sobre control de esfuerzo en modelos de razonamiento: el mecanismo effort-control permite estudiar el equilibrio entre precision y coste computacional en tareas de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano del archivo GGUF mas overhead de contexto):
  - i1-Q2_K (10,7 GB): ~12 GB de VRAM.
  - i1-IQ3_XXS (11,4 GB): ~13 GB de VRAM.
  - i1-IQ3_M (12,5 GB): ~14 GB de VRAM.
  - i1-Q3_K_M (13,4 GB): ~15 GB de VRAM.
  - i1-Q4_K_S (15,6 GB): ~17 GB de VRAM.
  - i1-Q4_K_M (16,9 GB): ~18-19 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para las variantes Q4; RTX 3090 (24 GB) equivalente; A100 o H100 para despliegues de mayor throughput o contexto largo.
- GPUs de consumo compatibles: RTX 4090 y 3090 con Q4_K_M; RTX 4080 (16 GB) con IQ3_M o Q3_K_M; GPUs de 12 GB con IQ3_XXS o Q2_K.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; los tags indican compatibilidad con endpoints.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThinkingBomb-gemma-4-26B-A4B-i1-GGUF | 25.233.142.046 | no disponible | apache-2.0 | GGUF | Razonamiento con GRPO y effort-control, vision |
| ThinkingBomb-gemma-4-26B-A4B (base) | 25.233.142.046 | no disponible | apache-2.0 | safetensors | Modelo original sin cuantizar |
| ThinkingBomb-gemma-4-26B-A4B-GGUF (estatico) | 25.233.142.046 | no disponible | apache-2.0 | GGUF | Cuantizaciones estaticas del mismo autor, incluye mmproj |

No se dispone de informacion sobre modelos alternativos de la misma categoria con datos verificables de rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte para ingles; el rendimiento en castellano no esta garantizado.
- La licencia se declara como apache-2.0, pero la model card enlaza a la licencia de Gemma 4 de Google, lo que puede imponer restricciones adicionales al uso comercial. Verificar antes de desplegar en produccion.
- Las cuantizaciones agresivas (Q2_K, IQ3_XXS) pueden degradar la calidad de las cadenas de razonamiento, que son especialmente sensibles a errores de cuantizacion.
- No hay datos publicados de benchmarks que permitan validar el rendimiento real del ajuste fino frente al modelo base.
- Riesgo de alucinacion inherente a los modelos de razonamiento; el modo de pensamiento no garantiza correccion factual.
- La ausencia de informacion sobre el dataset de entrenamiento impide evaluar sesgos potenciales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay evidencia de validacion por parte de la comunidad.
- El tamano del repositorio (80 GB) refleja el conjunto completo de cuantizaciones; cada archivo individual debe descargarse por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/ThinkingBomb-gemma-4-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/krystofmitka/ThinkingBomb-gemma-4-26B-A4B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/ThinkingBomb-gemma-4-26B-A4B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#ThinkingBomb-gemma-4-26B-A4B-i1-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
