# mradermacher/OutlineLM-Gemma4-E4B-v1-GGUF

## Resumen

OutlineLM-Gemma4-E4B-v1 es un ajuste fino (fine-tune) del modelo Gemma 4 E4B, publicado por el usuario DiTy bajo licencia Apache 2.0. Esta ficha concreta corresponde a la versión cuantizada en formato GGUF elaborada por mradermacher, un conocido publicador de cuantizaciones para llama.cpp. El modelo base parte de la familia Gemma 4 de Google y cuenta con aproximadamente 7.518 millones de parámetros totales según los pesos en safetensors del repositorio original.

La especialización del modelo, a juzgar por su nombre (OutlineLM), apunta a la generación de esquemas o estructuras de contenido (outlines), aunque la model card no proporciona detalles explícitos sobre el dataset de ajuste ni sobre el proceso de entrenamiento. El repositorio GGUF ofrece un abanico de cuantizaciones estáticas que van desde Q2_K (4,5 GB) hasta f16 (15,2 GB), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo con 6-8 GB de VRAM hasta servidores con aceleradores de mayor capacidad.

La relevancia de esta ficha radica en que facilita el uso del modelo mediante llama.cpp y ecosistemas compatibles (Ollama, LM Studio, etc.) sin necesidad de infraestructura de transformers. El modelo declara soporte para inglés y ruso, y está etiquetado como conversacional y compatible con endpoints, lo que sugiere su uso en aplicaciones de chat y generación estructurada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4 E4B; detalles específicos no disponibles) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E4B, un transformer de la familia Gemma 4 de Google. La información disponible no detalla la arquitectura interna específica (número de capas, dimensiones de atención, uso de atención lineal o decodificación especulativa). El repositorio indica que se trata de un ajuste fino realizado por DiTy sobre dicho modelo base, pero la model card no documenta el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO.

La versión aquí descrita es una cuantización estática generada con llama.cpp (quantize_version 2, output_tensor_quantised 1, convert_type hf). El autor de la cuantización también publica versiones con imatrix en el repositorio `mradermacher/OutlineLM-Gemma4-E4B-v1-i1-GGUF`, que suelen ofrecer mejor calidad por tamaño que las cuantizaciones estáticas equivalentes. No se dispone de información sobre innovaciones técnicas adicionales del ajuste fino.

## Capacidades

- Generación de texto conversacional en inglés y ruso.
- Especialización probable en generación de esquemas o estructuras de contenido (outlines), derivada del nombre del modelo; no confirmada explícitamente en la model card.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Formato GGUF listo para llama.cpp y herramientas derivadas (Ollama, LM Studio, etc.).
- Soporte de cuantizaciones de 2 a 16 bits para distintos equilibrios calidad/tamaño.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Generación de esquemas y estructuras de documentos: dado el nombre del modelo, puede emplearse para producir outlines o esqueletos de artículos, informes o guiones; su ajuste específico lo hace adecuado para esta tarea frente a un modelo generalista.
- Despliegue en entornos con recursos limitados: con la cuantización Q4_K_S (5,3 GB) cabe en GPUs de consumo de 8 GB de VRAM, permitiendo ejecutar el modelo en estaciones de trabajo sin aceleradores de datacenter.
- Asistentes conversacionales en inglés y ruso: el modelo está etiquetado como conversacional y soporta ambos idiomas, lo que lo hace útil para chatbots bilingües en esos mercados.
- Prototipado rápido con llama.cpp u Ollama: la disponibilidad de múltiples cuantizaciones permite iterar desde un Q2_K (4,5 GB) en portátiles hasta un Q8_0 (8,1 GB) en servidores pequeños.
- Generación estructurada en pipelines de contenido: integrable en flujos que requieran producir esquemas jerárquicos (índices, tablas de contenidos, estructuras de cursos) de forma automatizada.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes, lo que permite medir el impacto de la cuantización en la calidad de salida para esta tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~4,5 GB de pesos; ~5-6 GB de VRAM total con contexto moderado.
  - Q4_K_M: ~5,4 GB de pesos; ~6-7 GB de VRAM total.
  - Q8_0: ~8,1 GB de pesos; ~9-10 GB de VRAM total.
  - f16: ~15,2 GB de pesos; ~16-17 GB de VRAM total.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100/H100 no son necesarias para este tamaño, aunque pueden usarse para servir múltiples instancias.
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 6-8 GB hasta f16 en GPUs de 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con transformers, vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OutlineLM-Gemma4-E4B-v1 (esta ficha) | ~7,5 B | no disponible | Apache 2.0 | GGUF, safetensors | Ajuste especializado en outlines; en/ru |
| Gemma 4 E4B (base) | ~7,5 B | no disponible | Apache 2.0 (según familia Gemma 4) | safetensors, GGUF | Modelo generalista del que deriva |
| Mistral 7B Instruct | ~7,2 B | 32k (versión estándar) | Apache 2.0 | safetensors, GGUF | Generalista multilingüe ampliamente desplegado |
| Llama 3.1 8B Instruct | ~8 B | 128k | Llama 3.1 Community License | safetensors, GGUF | Generalista con contexto largo; licencia con restricciones |

La comparación con Mistral 7B y Llama 3.1 8B es orientativa por tamaño; no se dispone de datos de rendimiento del modelo evaluado para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de seguridad; se desconoce el comportamiento del ajuste fino en dominios sensibles.
- Riesgo de alucinación inherente a los modelos de ~7,5 B; no hay evaluaciones publicadas que lo cuantifiquen.
- Soporte idiomático limitado a inglés y ruso; el rendimiento en castellano no está garantizado ni evaluado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede estar sujeto a los términos de uso de Google; conviene verificar la licencia del modelo base original.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para producción.
- No se documentan capacidades de tool calling ni de agentes; no asumir su disponibilidad sin pruebas.
- El repositorio tiene 0 likes y un pipeline no definido, lo que sugiere poca validación comunitaria; conviene evaluar el modelo en la tarea objetivo antes de desplegarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OutlineLM-Gemma4-E4B-v1-GGUF
- Modelo base: https://huggingface.co/DiTy/OutlineLM-Gemma4-E4B-v1
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/OutlineLM-Gemma4-E4B-v1-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#OutlineLM-Gemma4-E4B-v1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
