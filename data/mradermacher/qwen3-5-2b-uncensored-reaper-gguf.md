# mradermacher/Qwen3.5-2B-Uncensored-reaper-GGUF

## Resumen

`mradermacher/Qwen3.5-2B-Uncensored-reaper-GGUF` es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo `abdukuzi45/Qwen3.5-2B-Uncensored-reaper`. No se trata de un modelo entrenado por el autor del repositorio, sino de una conversion estatica a formato GGUF pensada para su uso con llama.cpp y herramientas compatibles. El modelo base se presenta como una variante "uncensored" de un supuesto Qwen3.5 de 2B, aunque no hay verificacion independiente de su procedencia ni de su linaje de entrenamiento.

El modelo cuenta con 1.942.653.248 parametros segun los pesos en safetensors, lo que lo situa en la categoria de modelos pequenos aptos para hardware de consumo. El repositorio ocupa 19,6 GB, coherente con la inclusion de multiples cuantizaciones (desde Q2_K hasta x-f16) en un mismo espacio. La model card es practicamente inexistente: solo contiene metadatos de la herramienta de cuantizacion y el enlace al modelo original.

La relevancia de esta ficha es limitada desde el punto de vista tecnico: no hay informacion publicada sobre arquitectura, datos de entrenamiento, idiomas, licencia ni benchmarks. Cualquier evaluacion rigurosa exigiria consultar el repositorio base, que tampoco aporta documentacion sustancial segun los datos disponibles. El interes principal radica en su condicion de modelo pequeno sin censura explicita, un nicho con demanda pero con riesgos importantes de calidad y seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, sin confirmar) |
| Parametros totales | 1.942.653.248 (~1,94 mil millones) |
| Parametros activos | no aplica (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base en los datos disponibles. Por el nombre se infiere una familia tipo Qwen con aproximadamente 2B parametros, pero no hay confirmacion de si emplea atencion completa, atencion lineal, GQA ni de la composicion exacta de sus capas. Tampoco se documenta la longitud de contexto nativa ni el tokenizador.

Respecto al entrenamiento, se desconoce por completo el corpus utilizado, el numero de tokens, la posible aplicacion de RLHF, DPO u otras tecnicas de alineamiento, y el procedimiento concreto que justifica la etiqueta "uncensored". El sufijo "reaper" no viene acompanado de explicacion tecnica alguna. Esta ausencia de documentacion impide evaluar la calidad del ajuste, la procedencia de los datos y cualquier innovacion arquitectonica. La unica informacion tecnica fiable es la derivada del proceso de cuantizacion: el campo `quantize_version: 2` y `output_tensor_quantised: 1` indican el uso de la herramienta estandar de mradermacher para generar GGUF desde pesos en formato Hugging Face.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` sugiere un ajuste orientado a dialogo, aunque no se detalla el formato de plantilla.
- Razonamiento basico y generacion de codigo: esperable en un modelo de ~2B de la familia Qwen, pero no documentado ni verificado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (los idiomas no estan declarados).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Modo "uncensored": el autor lo presenta como tal, pero no se especifica que filtros se han eliminado ni con que metodologia.

## Casos de uso

- Experimentacion local en hardware de consumo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en GPUs de 8-12 GB o incluso en CPU con llama.cpp, util para pruebas de prototipos sin infraestructura dedicada.
- Investigacion sobre alineamiento y censura: permite estudiar el comportamiento de un modelo presuntamente sin filtros frente a su version base, siempre que se disponga de esta para comparar.
- Generacion creativa sin restricciones tematicas: escritura de ficcion o guiones donde los filtros estandar resultan limitantes, asumiendo la responsabilidad editorial por parte del usuario.
- Chatbot de proposito general en entornos controlados: con 2B parametros y cuantizacion Q4, puede desplegarse en un portatil para asistentes personales offline.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 12 variantes, lo que facilita medir el impacto de la cuantizacion en perplejidad y calidad de respuesta sobre un mismo modelo.
- Fines educativos: ilustra el flujo completo de conversion de safetensors a GGUF y la publicacion de multiples quants, util para quien aprende el ecosistema de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GB en Q4_K_M, 2-2,5 GB en Q8_0 y cerca de 4 GB en x-f16 (pesos mas overhead de contexto).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090 y A100 lo ejecutan sin problema.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU discreta moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion del GGUF), LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI a traves de llama.cpp server.
- Latencia y throughput estimados: no disponibles; en una RTX 4090 se espera un throughput alto (decenas o cientos de tokens por segundo) por el reducido tamano, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-Uncensored-reaper (este) | ~1,94B | no disponible | no disponible | GGUF | Sin benchmarks ni model card sustancial |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Documentacion completa y benchmarks publicos |
| Llama 3.2 1B Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Ecosistema amplio, restricciones de licencia |
| Gemma 2 2B IT | 2,6B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Buen rendimiento en su clase, licencia con condiciones |

La comparativa es aproximada: al no disponer de datos de rendimiento del modelo evaluado, solo se pueden contrastar parametros, contexto y licencia de las alternativas conocidas.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, sesgos, idiomas ni metodologia de "uncensoring".
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; en la practica, esto bloquea su adopcion en produccion.
- Riesgo elevado de alucinacion y respuestas de baja calidad: un modelo de ~2B sin benchmarks verificables ofrece garantias minimas.
- Contenido sin filtrar: la etiqueta "uncensored" implica la posible generacion de contenido ofensivo, ilegal o danino; requiere moderacion externa en cualquier despliegue publico.
- Procedencia dudosa del modelo base: el nombre "Qwen3.5" no corresponde a una release oficial verificable en los datos disponibles, lo que impide trazar el linaje de los pesos.
- Sin soporte de tool calling ni agentes documentado: no apto para pipelines que dependan de function calling.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-2B-Uncensored-reaper-GGUF
- Modelo base: https://huggingface.co/abdukuzi45/Qwen3.5-2B-Uncensored-reaper
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Herramienta de cuantizacion de referencia (llama.cpp): https://github.com/ggerganov/llama.cpp
