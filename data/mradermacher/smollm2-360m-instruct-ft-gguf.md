# mradermacher/SmolLM2-360M-Instruct-FT-GGUF

## Resumen

SmolLM2-360M-Instruct-FT-GGUF es la versión cuantizada en formato GGUF del modelo belyakoff/SmolLM2-360M-Instruct-FT, un ajuste fino del pequeño modelo SmolLM2-360M-Instruct de Hugging Face. Lo publica mradermacher, un conocido generador de cuantizaciones GGUF para la comunidad, y su propósito es facilitar la ejecución local del modelo en hardware modesto mediante llama.cpp y herramientas compatibles. El modelo conserva la licencia Apache 2.0 del original y está orientado a un público que necesita un modelo conversacional ligero en ruso.

El modelo base pertenece a la familia SmolLM2, una arquitectura transformer decoder-only de aproximadamente 362 millones de parámetros, diseñada para tareas de generación de texto y conversación con un coste computacional muy bajo. El ajuste fino realizado por belyakoff se entrenó sobre el dataset Vikhrmodels/GrandMaster-PRO-MAX, lo que orienta el modelo hacia el idioma ruso y hacia tareas de tipo RAG (retrieval-augmented generation), según las etiquetas declaradas. El resultado es un modelo especializado y pequeño, no un modelo de propósito general de alta capacidad.

La relevancia de esta ficha radica en que se trata de un modelo extremadamente compacto (menos de 0,4 GB en cuantización Q4_K_M) que puede ejecutarse en CPU o en GPUs de gama baja, lo que lo hace útil para prototipos, entornos con recursos limitados y despliegues en el borde. Ahora bien, conviene subrayar que su tamaño limita severamente sus capacidades de razonamiento, código y matemáticas en comparación con modelos de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM2) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base SmolLM2-360M-Instruct declara 8.192 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia SmolLM2, con 361.821.120 parámetros totales. Se trata de un ajuste fino (fine-tuning) del checkpoint SmolLM2-360M-Instruct, que a su vez es un modelo instruct entrenado por Hugging Face. La model card del repositorio cuantizado no detalla la composición exacta del dataset de entrenamiento más allá de indicar el uso de Vikhrmodels/GrandMaster-PRO-MAX, ni especifica el número de tokens de entrenamiento, la presencia de RLHF/DPO ni otras innovaciones técnicas. Tampoco se documentan detalles sobre la tokenización o la ventana de contexto efectiva tras el ajuste.

La información disponible no permite confirmar si el ajuste fino incluyó etapas de alineación adicionales, ni qué proporción del dataset corresponde a ruso frente a otros idiomas. Las etiquetas del repositorio incluyen "rag" y "conversational", lo que sugiere que el entrenamiento se orientó hacia tareas de recuperación y diálogo, pero no se aportan métricas ni detalles técnicos que lo respalden. La cuantización la realiza mradermacher de forma estática (sin imatrix, según indica la propia model card), lo que implica que las versiones IQ y K-quants se generaron sin pesos ponderados por importancia.

## Capacidades

- Generación de texto conversacional en ruso, orientada a diálogos multi-turno.
- Soporte declarado para tareas de RAG (retrieval-augmented generation), según la etiqueta del repositorio.
- Capacidad de instrucción básica heredada del modelo SmolLM2-360M-Instruct original.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de pensamiento (thinking mode).
- Capacidades multilingües limitadas al ruso según el campo `language` del repositorio; no se confirma un buen rendimiento en castellano ni en inglés.
- No se documentan capacidades destacadas de código o matemáticas para este ajuste concreto.

## Casos de uso

- Prototipado de asistentes conversacionales en ruso: el modelo puede gestionar diálogos simples en entornos de desarrollo con recursos muy limitados, gracias a su tamaño inferior a 0,5 GB en cuantización Q4_K_M.
- Despliegue en el borde (edge computing) y dispositivos de bajas prestaciones: al caber en CPU y en GPUs integradas, permite ejecutar un chatbot local sin conexión en hardware tipo Raspberry Pi o portátiles antiguos.
- Generación aumentada por recuperación (RAG) en ruso: la etiqueta "rag" del repositorio sugiere que el ajuste se orientó a este uso; podría emplearse para responder preguntas sobre documentos recuperados en un pipeline ligero.
- Filtrado y clasificación de texto en ruso: con un coste de inferencia mínimo, puede usarse para tareas auxiliares de etiquetado o moderación en grandes volúmenes.
- Pruebas de integración con llama.cpp y Ollama: sirve como modelo de referencia para validar pipelines de despliegue GGUF antes de escalar a modelos mayores.
- Educación y experimentación: adecuado para aprender a desplegar modelos cuantizados y comparar el impacto de las distintas cuantizaciones (Q2_K a f16) en la calidad de salida.
- Generación de texto asistida en entornos con requisitos estrictos de privacidad: al ejecutarse localmente, los datos no salen del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en Q2_K/Q3_K/IQ4_XS, 0,4 GB en Q4_K_S/Q4_K_M/Q5, 0,5 GB en Q6_K/Q8_0 y 0,8 GB en f16 (tamaños de archivo declarados en la model card; el consumo real en memoria es algo superior por el contexto y el runtime).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre es suficiente; también funciona en CPU. No requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en GPUs de consumo: GTX 1050, GTX 1650, RTX 3050, RTX 4060, e incluso en GPUs integradas y en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio declara `endpoints_compatible` y la librería `transformers` para el modelo base.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia muy baja en CPU y prácticamente instantánea en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolLM2-360M-Instruct-FT-GGUF (este) | 361,8 M | no disponible | Apache 2.0 | GGUF | Ajuste en ruso, cuantizado por mradermacher |
| SmolLM2-360M-Instruct (original) | 361,8 M | 8.192 tokens (declarado por Hugging Face) | Apache 2.0 | safetensors, GGUF | Modelo base instruct multilingüe de Hugging Face |
| Qwen2.5-0.5B-Instruct | ~494 M | 32.768 tokens (según documentación de Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa algo mayor, multilingüe, con más contexto |
| SmolLM2-1.7B-Instruct | ~1.700 M | 8.192 tokens (declarado por Hugging Face) | Apache 2.0 | safetensors, GGUF | Misma familia, mayor capacidad a costa de más recursos |

La comparativa se basa en datos públicos de los modelos citados; no se dispone de benchmarks del ajuste concreto de belyakoff que permitan comparar rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Tamaño muy reducido (361,8 M de parámetros): la capacidad de razonamiento, código y matemáticas es limitada en comparación con modelos de mayor escala; no es adecuado para tareas complejas.
- Riesgo elevado de alucinación y de respuestas incoherentes en temas especializados, especialmente con cuantizaciones agresivas (Q2_K, Q3_K_S).
- Idiomas soportados limitados al ruso según el repositorio; el rendimiento en castellano o inglés no está garantizado ni documentado.
- La longitud de contexto efectiva no está confirmada para este ajuste; no debe asumirse la ventana del modelo base sin verificación.
- Las cuantizaciones son estáticas y sin imatrix, según indica la model card; las versiones IQ y K-quants pueden presentar una calidad inferior a la de cuantizaciones ponderadas equivalentes.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda conservar los avisos de licencia y atribución correspondientes.
- El modelo base es un ajuste fino de un modelo pequeño; no se han publicado evaluaciones de sesgos ni de seguridad para este checkpoint concreto.
- Para producción en ruso con requisitos de calidad, conviene evaluar alternativas de mayor tamaño antes de desplegar este modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/SmolLM2-360M-Instruct-FT-GGUF
- Modelo base: https://huggingface.co/belyakoff/SmolLM2-360M-Instruct-FT
- Dataset de entrenamiento: https://huggingface.co/datasets/Vikhrmodels/GrandMaster-PRO-MAX
- Página de resumen de cuantizaciones de mradermacher: https://hf.tst.eu/model#SmolLM2-360M-Instruct-FT-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
