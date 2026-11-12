# mradermacher/MAXENITH-32B-i1-GGUF

## Resumen

MAXENITH-32B-i1-GGUF es una colección de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo base MAXENITH-32B, publicado por el usuario Maxenith en Hugging Face. Se trata, por tanto, de una redistribución optimizada para inferencia local y en CPU/GPU de consumo, no de un modelo original. El modelo base cuenta con 32.763.876.352 parámetros (aproximadamente 32,8 mil millones), lo que lo sitúa en la categoría de modelos densos de gran tamano orientados a uso conversacional.

La relevancia de esta ficha radica en que las cuantizaciones GGUF son el vehículo habitual para ejecutar modelos de esta escala en hardware asequible mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp). El repositorio incluye un conjunto amplio de niveles de cuantización, desde IQ1_S hasta Q6_K, lo que permite ajustar el equilibrio entre calidad y consumo de memoria.

No obstante, la información pública disponible es muy limitada: la model card del repositorio de cuantización es prácticamente un conjunto de metadatos de la herramienta de cuantización, y no se han publicado especificaciones del modelo base, datos de entrenamiento, benchmarks ni licencia. Cualquier evaluación rigurosa del modelo requiere consultar el repositorio original de Maxenith.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer denso; no confirmado) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base se distribuye presumiblemente en safetensors |
| Tamano del repo | 27,2 GB |
| Metodo de cuantizacion | imatrix / weighted (segun metadatos de la model card) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base MAXENITH-32B más allá del recuento de parámetros (32,8 B). La model card del repositorio de cuantización no incluye detalles sobre tipo de transformer, número de capas, dimensiones ocultas, mecanismo de atención ni si emplea técnicas como atención lineal, decodificación especulativa o mezcla de expertos. Tampoco se documenta el proceso de entrenamiento: número de tokens, composición del dataset, uso de RLHF, DPO u otras etapas de alineación.

Lo único verificable es el proceso de cuantización: mradermacher ha generado las variantes GGUF con cuantización ponderada mediante matrices de importancia (imatrix), una técnica que estima la sensibilidad de cada tensor para preservar mejor la calidad en niveles de compresión agresivos. El repositorio incluye la etiqueta `nicoboss`, asociada al flujo de trabajo de cuantización de ese autor, y metadatos que indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf` (conversión desde pesos Hugging Face).

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` sugiere un ajuste orientado a diálogo multi-turno, aunque no se detalla el formato de prompt ni la plantilla de chat.
- Razonamiento y generación de texto general: capacidades esperables en un modelo denso de 32,8 B, pero no documentadas explícitamente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas en la model card).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el repositorio puede servirse a través de la infraestructura de endpoints de Hugging Face, presumiblemente con motores compatibles con GGUF.

## Casos de uso

- Inferencia local en estaciones de trabajo: desplegar la variante Q4_K_M (en torno a 19-20 GB) en una GPU de consumo con 24 GB de VRAM, como una RTX 3090 o RTX 4090, para disponer de un modelo de 32,8 B con calidad cercana al original y latencia interactiva.
- Asistentes conversacionales autoalojados: usar las cuantizaciones Q5_K_M o Q6_K en servidores con GPU profesional para dialogar con contexto largo, siempre que se valide previamente la ventana de contexto real del modelo base.
- Prototipado con llama.cpp y Ollama: importar el GGUF directamente en Ollama o LM Studio para pruebas de concepto sin necesidad de infraestructura GPU dedicada, aprovechando las variantes IQ2/IQ3 para equipos con 8-12 GB de VRAM.
- Evaluación comparativa de cuantizaciones: al ofrecer 24 niveles distintos, el repositorio sirve para medir la degradación de calidad por nivel de compresión en un modelo de 32,8 B, útil para calibrar políticas de despliegue.
- Despliegue en CPU para entornos con restricciones de hardware: las variantes Q2_K y Q3_K permiten ejecutar el modelo en servidores sin GPU, a costa de una pérdida de calidad que debe medirse empíricamente.
- Fine-tuning ligero sobre GGUF: aunque GGUF no es el formato ideal para entrenamiento, las variantes de mayor precisión (Q6_K) pueden servir como referencia para destilación o para comparar contra adaptadores LoRA entrenados sobre el modelo base en safetensors.
- Integración en pipelines de generación por lotes: servir el modelo con llama.cpp server o vLLM (si se convierte a otro formato) para tareas de resumen, clasificación o extracción sobre documentos, validando antes el rendimiento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según nivel de cuantización y ventana de contexto):
  - IQ1_S / IQ1_M: en torno a 9-10 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: en torno a 10-13 GB.
  - Q2_K / Q2_K_S: en torno a 12-13 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M: en torno a 13-15 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: en torno a 14-17 GB.
  - Q4_0 / Q4_1 / Q4_K_S / Q4_K_M / IQ4_XS / IQ4_NL: en torno a 18-21 GB.
  - Q5_K_S / Q5_K_M: en torno a 21-23 GB.
  - Q6_K: en torno a 25-27 GB.
  - Nota: estas cifras son estimaciones a partir del recuento de parámetros y del tamano del repo (27,2 GB); no proceden de mediciones publicadas por el autor.
- GPU recomendadas:
  - Q4_K_M y superiores: RTX 3090, RTX 4090 (24 GB), A6000 (48 GB), A100 40/80 GB, H100.
  - IQ2/IQ3: RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), RTX 3080 Ti (12 GB) con offloading parcial.
  - IQ1: GPUs de 10-12 GB con margen limitado.
- ¿Cabe en GPU de consumo? Sí, las variantes de menor precisión caben en GPUs de 12-16 GB; las de mayor calidad requieren 24 GB o más. En CPU, con RAM suficiente (32 GB o más), también es viable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui, llama-cpp-python y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este modelo sin conversión previa.
- Latencia y throughput: no disponibles. Dependen fuertemente del hardware y del nivel de cuantización; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MAXENITH-32B-i1-GGUF | 32,8 B | no disponible | no disponible | GGUF | Hugging Face (repo de cuantización) |
| Qwen2.5-32B-Instruct | 32,5 B | 32.768 tokens (ampliable) | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama, vLLM |
| Gemma 2 27B | 27 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Hugging Face, Ollama |
| Yi-1.5-34B | 34 B | 4.096-32.768 tokens (según variante) | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |

La comparativa se limita a parámetros y disponibilidad porque no hay datos de rendimiento ni de contexto para MAXENITH-32B. Frente a Qwen2.5-32B o Yi-1.5-34B, el principal inconveniente de MAXENITH es la ausencia de documentación pública (licencia, idiomas, contexto, benchmarks), lo que dificulta su adopción en producción frente a alternativas con licencias permisivas y métricas publicadas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido. Es imprescindible contactar con el autor del modelo base (Maxenith) antes de cualquier despliegue productivo.
- Idiomas no declarados: no se puede garantizar un rendimiento aceptable en castellano ni en otros idiomas distintos del inglés.
- Ventana de contexto desconocida: no se puede planificar el uso en tareas de contexto largo sin validación empírica.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks ni documentación de alineación, el riesgo no puede acotarse.
- Sesgos: no documentados. Al no conocerse la composición del dataset de entrenamiento, no es posible evaluar sesgos de género, raza, idioma o dominio.
- Cuantizaciones agresivas (IQ1, IQ2): pueden degradar notablemente la coherencia y la fidelidad factual; se recomienda validar con evaluaciones propias antes de usar en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.
- Modelo base de origen no verificado: MAXENITH-32B no es un modelo ampliamente conocido; conviene auditar su procedencia, posibles datos de entrenamiento con derechos de autor y coherencia de los pesos antes de confiar en él.
- El repo de cuantización no incluye plantilla de chat ni configuración de generación: es necesario obtenerla del repositorio base para un uso correcto en modo conversacional.

## Enlaces

- Repositorio de cuantización: https://huggingface.co/mradermacher/MAXENITH-32B-i1-GGUF
- Modelo base: https://huggingface.co/Maxenith/MAXENITH-32B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
