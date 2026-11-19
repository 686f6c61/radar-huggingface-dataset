# ibm-granite/granite-4.0-h-350m-GGUF

## Resumen

Granite-4.0-H-350M es un modelo de lenguaje de 340 millones de parámetros (340.332.224 exactos según los pesos en safetensors) desarrollado por IBM dentro de la familia Granite 4.0. Esta ficha concreta corresponde a la versión convertida a formato GGUF por el propio equipo `ibm-granite`, pensada para su ejecución local con llama.cpp en hardware modesto, incluidos dispositivos de borde y CPU. El modelo base es `ibm-granite/granite-4.0-h-350m`, y esta variante GGUF se publicó el 23 de octubre de 2025.

El modelo resuelve el caso de uso de inferencia de lenguaje natural de bajo coste: generación de texto, conversación multi-turno y tareas ligeras de razonamiento en entornos donde no hay GPU dedicada o donde el presupuesto de memoria es muy limitado. Su tamaño lo sitúa en la categoría de modelos pequeños (sub-500M), lo que permite desplegarlo en portátiles, Raspberry Pi o contenedores sin acelerador. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

La relevancia actual radica en la combinación de tres factores: licencia permisiva, formato GGUF listo para llama.cpp con soporte de la API compatible con OpenAI mediante `llama serve`, y una ventana de contexto entrenada de hasta 32k tokens. IBM mantiene una familia coherente (Granite 4.0) con variantes de mayor tamaño, lo que permite escalar el mismo stack de prompts y herramientas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Granite 4.0, variante "h"; detalles internos no disponibles en la información proporcionada) |
| Parámetros totales | 340.332.224 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (entrenado hasta 32k; sin positional embeddings, por lo que el contexto en runtime puede ampliarse, aunque se recomienda limitar a 32768) |
| Tipos de cuantización | Múltiples cuantizaciones GGUF (el repositorio incluye varias; el ejemplo de la model card usa Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 4,6 GB con varias cuantizaciones); modelo base original presumiblemente en safetensors |

## Arquitectura y entrenamiento

La información disponible confirma que Granite-4.0-H-350M es un transformer de la familia Granite 4.0 de IBM, con 340 millones de parámetros. Un detalle técnico relevante que sí aparece en la model card es que el modelo **no utiliza positional embeddings**, lo que en la práctica permite extender el contexto en runtime más allá de lo visto en entrenamiento. IBM recomienda, no obstante, fijar el contexto a 32768 tokens porque el entrenamiento se realizó con textos de hasta esa longitud.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La model card de esta variante GGUF remite explícitamente a la del modelo base (`ibm-granite/granite-4.0-h-350m`) para los detalles completos de arquitectura y entrenamiento.

La conversión a GGUF se realizó con la versión de Transformers 5.20.2 y se validó con la build `b11798` de llama.cpp, lo que da una referencia concreta de compatibilidad para reproducir el entorno.

## Capacidades

- Generación de texto en modo conversacional (el tag `conversational` está presente en el repo).
- Conversación multi-turno mediante la API de chat compatible con OpenAI (`/v1/chat/completions`) que expone `llama serve`.
- Procesamiento de contextos largos de hasta 32k tokens, útil para resumir documentos o mantener historiales extensos.
- Ejecución local en CPU y en GPU de gama baja gracias al formato GGUF y a las cuantizaciones disponibles.
- Integración con el ecosistema llama.cpp (`llama cli`, `llama serve`), lo que facilita scripting y despliegue en contenedores.
- Capacidades específicas de razonamiento, código, matemáticas, tool calling, agentes o multimodalidad: no disponibles en la información proporcionada para esta variante.

## Casos de uso

- **Asistente conversacional en dispositivos de borde**: con 340M de parámetros y cuantización Q8_0, el modelo cabe en menos de 1 GB de pesos y puede ejecutarse en una Raspberry Pi 5 o en un portátil sin GPU, ofreciendo un chatbot local sin dependencia de la nube.
- **Preprocesado y clasificación de texto en pipelines**: usar `llama serve` para exponer el modelo como endpoint compatible con OpenAI y encadenarlo con tareas de etiquetado, extracción o reformateo antes de pasar a un modelo mayor.
- **Resumen de documentos de longitud media**: la ventana de 32k tokens permite resumir artículos, actas o correos extensos en una sola pasada, útil en herramientas de productividad locales.
- **Prototipado rápido de aplicaciones LLM**: al ser Apache 2.0 y ejecutable con llama.cpp, sirve como modelo de desarrollo para validar prompts, flujos de tool calling y plantillas de chat antes de migrar a un Granite de mayor tamaño.
- **Generación de texto en entornos air-gapped**: organizaciones con requisitos de confidencialidad pueden desplegar el GGUF en servidores sin conexión, manteniendo los datos en la infraestructura propia.
- **Generación de texto auxiliar en IDE o editores**: integrado vía API local, puede completar fragmentos, redactar docstrings o reformular comentarios sin latencia de red.
- **Chatbot de soporte de bajo coste para FAQs**: con prompts bien acotados y contexto limitado, puede gestionar respuestas frecuentes en sitios web o aplicaciones móviles con un coste de inferencia mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: con 340M de parámetros, los pesos en Q8_0 ocupan aproximadamente 0,35 GB; en Q4 rondarían los 0,2 GB. Sumando overhead de contexto (hasta 32k tokens) y buffers de llama.cpp, es razonable reservar entre 1 y 2 GB de RAM/VRAM para uso cómodo.
- **GPU recomendadas**: cualquier GPU consumer moderna es sobredimensionada; una RTX 3060, RTX 4060 o incluso una GTX 1650 lo ejecutan sin problema. También funciona en CPU (x86 o ARM) y en Apple Silicon vía Metal.
- **Cabe en GPU consumer**: sí, en cualquier GPU con al menos 2 GB de VRAM; también en iGPU y en CPU exclusivamente.
- **Opciones de despliegue**: llama.cpp (`llama cli`, `llama serve`), y por compatibilidad de formato GGUF, también Ollama y otros runners basados en llama.cpp. La API de `llama serve` es compatible con el esquema OpenAI, lo que permite usarlo con clientes existentes.
- **Latencia y throughput**: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia de decodificación muy baja en CPU moderna, pero no hay cifras oficiales publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Granite-4.0-H-350M (GGUF) | 340M | 32k | Apache 2.0 | GGUF | Esta ficha; sin positional embeddings, ejecutable en CPU |
| Qwen2.5-0.5B | ~500M | 32k | Apache 2.0 | safetensors, GGUF | Familia ampliamente adoptada; comparación de rendimiento no disponible en la información proporcionada |
| SmolLM2-360M | 360M | 8k | Apache 2.0 | safetensors, GGUF | Contexto menor; comparación de benchmarks no disponible |
| Gemma-3-270M | 270M | 32k | Gemma license | safetensors, GGUF | Licencia no Apache; comparación de rendimiento no disponible |

No se dispone de datos de benchmarks en la información proporcionada para establecer una comparación cuantitativa de rendimiento entre estos modelos.

## Limitaciones y advertencias

- **Capacidad limitada por tamaño**: con 340M de parámetros, el modelo no es adecuado para razonamiento complejo, matemáticas avanzadas o generación de código de producción; se esperan errores en tareas que requieran multi-step reasoning profundo.
- **Riesgo de alucinación**: inherente a los modelos de lenguaje de este tamaño; conviene validar las salidas en aplicaciones críticas.
- **Idiomas**: no se especifican los idiomas soportados en la información disponible; el rendimiento fuera del inglés puede degradarse y debe evaluarse empíricamente.
- **Contexto**: aunque técnicamente puede extenderse más allá de 32k por la ausencia de positional embeddings, el entrenamiento se limitó a 32k; superar ese umbral puede degradar la calidad.
- **Licencia**: Apache 2.0 permite uso comercial, modificación y redistribución, pero conviene revisar los términos del modelo base y de las dependencias (llama.cpp) en el despliegue final.
- **Formato GGUF**: las cuantizaciones introducen pérdida de precisión; para evaluaciones sensibles conviene usar Q8_0 o comparar contra el modelo base en safetensors.
- **Producción**: al ser un modelo pequeño, no se recomienda como único componente en sistemas de atención al cliente sin supervisión humana o filtros de salida.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ibm-granite/granite-4.0-h-350m-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-350m
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentación de `llama cli`: https://github.com/ggml-org/llama.cpp/blob/master/tools/cli/README.md
- Documentación de `llama serve`: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
