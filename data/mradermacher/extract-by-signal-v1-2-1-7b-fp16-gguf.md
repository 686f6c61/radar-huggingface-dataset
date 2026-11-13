# mradermacher/extract-by-signal-v1.2-1.7B-FP16-GGUF

## Resumen

`extract-by-signal-v1.2-1.7B-FP16-GGUF` es una cuantización estática en formato GGUF del modelo `extract-by-signal-v1.2-1.7B-FP16`, publicado por el usuario `mradermacher` en Hugging Face. Se trata de un modelo conversacional de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones), reconvertido desde pesos en formato `safetensors` (FP16) a GGUF mediante la herramienta de conversión de llama.cpp, con el objetivo de facilitar su despliegue en entornos de inferencia local y servidores compatibles con la API de endpoints.

El modelo original pertenece al usuario `seth-veri-llm`, y por el nombre parece orientado a tareas de extracción de información estructurada a partir de señales o texto, aunque la model card no proporciona detalles sobre el pipeline, el entrenamiento ni el dataset. La información pública disponible es muy limitada: no se especifican licencia, idiomas soportados, arquitectura interna ni resultados de benchmarks.

La relevancia de esta ficha radica en documentar de forma rigurosa lo que sí se conoce (tamaño, cuantizaciones disponibles, formato y origen) y señalar explícitamente los vacíos de información, de modo que un desarrollador pueda decidir si merece la pena evaluar el modelo antes de integrarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer conversacional, inferido por el pipeline `conversational` y el formato GGUF) |
| Parámetros totales | 1.720.574.976 (≈1,7 B) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base está en safetensors/FP16 |
| Tamaño del repositorio | 16,0 GB |
| Pipeline | no disponible (tag `conversational`) |
| Compatibilidad | `endpoints_compatible` (según tags de Hugging Face) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `extract-by-signal-v1.2-1.7B-FP16`. Por el pipeline declarado (`conversational`) y el formato GGUF, se trata con alta probabilidad de un transformer decoder-only ajustado para diálogo, pero no se confirma en la documentación disponible. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

La única información técnica relevante es el proceso de cuantización: el autor (`mradermacher`) ha generado cuantizaciones estáticas a partir de los pesos FP16 originales usando la herramienta de conversión de llama.cpp (`convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1`). Se ofrecen 12 variantes de cuantización, desde Q2_K (la más agresiva) hasta Q8_0 y x-f16 (las de mayor fidelidad). No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional multi-turno (según el tag `conversational`).
- Extracción de información estructurada a partir de señales o texto (inferido del nombre `extract-by-signal`, no confirmado en la model card).
- Compatible con endpoints de Hugging Face (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Razonamiento matemático o generación de código: no disponible.

## Casos de uso

- **Extracción de datos estructurados en pipelines ligeros**: si el modelo cumple lo que sugiere su nombre, podría usarse para convertir texto libre en JSON o campos estructurados, desplegado en local con llama.cpp u Ollama por su reducido tamaño (1,7 B).
- **Prototipado rápido en entornos con hardware limitado**: con cuantizaciones Q4_K_M (~1 GB) cabe en GPUs de consumo y permite iterar sobre prompts sin coste de API.
- **Atención al cliente en dominios acotados**: al ser un modelo conversacional pequeño, puede servir para chatbots de soporte con contexto corto, siempre que se valide su calidad con datos propios.
- **Procesamiento por lotes en CPU**: las cuantizaciones Q2_K y Q3_K permiten ejecución en CPU con llama.cpp para tareas de extracción de bajo volumen.
- **Evaluación comparativa de cuantizaciones**: el repositorio ofrece 12 variantes, útil para medir la degradación de calidad entre Q2_K y Q8_0 en una tarea concreta.
- **Integración en endpoints compatibles**: el tag `endpoints_compatible` permite desplegarlo en infraestructuras que acepten modelos GGUF alojados en Hugging Face.
- **Filtrado previo en pipelines RAG**: como modelo pequeño, podría usarse para preprocesar o resumir fragmentos antes de pasarlos a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (según cuantización, aproximada para 1,7 B parámetros):
  - Q2_K: ~0,7-1,0 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~1,0-1,3 GB
  - Q4_K_S / Q4_K_M: ~1,2-1,5 GB
  - Q5_K_S / Q5_K_M: ~1,5-1,8 GB
  - Q6_K: ~1,8-2,0 GB
  - Q8_0: ~2,0-2,5 GB
  - x-f16: ~3,5 GB
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090, A100, H100). El modelo es lo bastante pequeño para ejecutarse incluso en iGPU.
- **¿Cabe en consumer GPU?**: sí, en todas las GPU de consumo actuales con 4 GB o más de VRAM.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| extract-by-signal-v1.2-1.7B-FP16-GGUF | 1,7 B | no disponible | no disponible | GGUF | Ficha actual |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 K | Apache 2.0 | safetensors, GGUF | Modelo conversacional ampliamente documentado |
| Llama-3.2-1B-Instruct | 1,2 B | 128 K | Llama 3.2 Community License | safetensors, GGUF | Modelo pequeño de Meta con contexto largo |
| SmolLM2-1.7B-Instruct | 1,7 B | 8 K | Apache 2.0 | safetensors, GGUF | Alternativa de Hugging Face con benchmarks públicos |

La comparativa se ofrece como referencia de categoría; no se dispone de datos de rendimiento del modelo evaluado para contrastar con estas alternativas.

## Limitaciones y advertencias

- **Información pública insuficiente**: no se documentan arquitectura, dataset, licencia ni idiomas, lo que impide evaluar su idoneidad para producción.
- **Licencia no disponible**: no se puede confirmar el uso comercial; es imprescindible contactar con el autor original (`seth-veri-llm`) antes de desplegarlo.
- **Riesgo de alucinación**: al no haber benchmarks ni documentación de alineación, se desconoce su tasa de alucinación; en tareas de extracción estructurada esto es crítico.
- **Modelo de 1,7 B**: capacidad limitada para razonamiento complejo, matemáticas o código en comparación con modelos de mayor tamaño.
- **Contexto desconocido**: no se puede planificar su uso en conversaciones largas o documentos extensos sin verificar experimentalmente la ventana de contexto.
- **Cuantizaciones agresivas**: Q2_K y Q3_K pueden degradar notablemente la calidad; se recomienda validar con Q4_K_M o superior.
- **Sin soporte confirmado de tool calling ni agentes**: no apto para pipelines que requieran function calling sin validación previa.
- **Repositorio con 0 descargas y 0 likes**: sin validación comunitaria; tratar como modelo experimental.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/extract-by-signal-v1.2-1.7B-FP16-GGUF
- Modelo base (FP16): https://huggingface.co/seth-veri-llm/extract-by-signal-v1.2-1.7B-FP16
- Autor de las cuantizaciones: https://huggingface.co/mradermacher
- Herramienta de conversión (llama.cpp): https://github.com/ggerganov/llama.cpp
