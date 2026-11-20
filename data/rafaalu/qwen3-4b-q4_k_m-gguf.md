# RafaAlu/Qwen3-4B-Q4_K_M-GGUF

## Resumen

RafaAlu/Qwen3-4B-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo Qwen/Qwen3-4B, publicada por el usuario RafaAlu. No se trata de un modelo entrenado desde cero, sino de una conversión del checkpoint original de Qwen (familia Qwen3) al formato GGUF mediante la herramienta GGUF-my-repo de ggml.ai, que emplea llama.cpp para generar los pesos cuantizados. El resultado es un artefacto de 2,5 GB con cuantización Q4_K_M, pensado para inferencia local eficiente en CPU y GPU de consumo.

El modelo base Qwen3-4B pertenece a la tercera generación de la familia Qwen, desarrollada por Alibaba Cloud. Cuenta con 4.022.468.096 parámetros totales (aproximadamente 4 mil millones) y está orientado a generación de texto conversacional. La cuantización Q4_K_M reduce el peso a unos 4 bits por parámetro en la mayoría de las capas, manteniendo algunas capas en mayor precisión, lo que permite ejecutar el modelo en hardware modesto con una pérdida de calidad controlada.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de 4B en entornos con recursos limitados: portátiles, estaciones de trabajo sin GPU dedicada o GPUs de consumo con 6-8 GB de VRAM. Sin embargo, al ser una conversión de terceros con cero descargas y cero likes en el momento de la consulta, conviene tratar el artefacto con cautela y verificar su integridad frente al checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3-4B; detalles específicos de capas y atención no disponibles en la información proporcionada) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de la model card usa `-c 2048`, pero es solo un valor de ejemplo del servidor, no la ventana nativa) |
| Tipos de cuantizacion | Q4_K_M (única variante publicada en este repositorio) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `qwen3-4b-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B es un transformer decoder-only de aproximadamente 4 mil millones de parámetros. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF, DPO o post-entrenamiento específicas. Tampoco se especifican innovaciones arquitectónicas concretas (atención lineal, decodificación especulativa, mezcla de expertos) más allá de lo que corresponde a la familia Qwen3, cuyos detalles técnicos completos deben consultarse en la model card original de Qwen/Qwen3-4B.

La contribución de este repositorio es exclusivamente la cuantización: se ha aplicado el esquema Q4_K_M de llama.cpp, que cuantiza la mayoría de los tensores a 4 bits con escalas de grupo y mantiene ciertas capas (típicamente embeddings y algunas proyecciones) en precisión superior. El proceso se realizó con la herramienta GGUF-my-repo de ggml.ai, que automatiza la conversión desde safetensors a GGUF. No hay evidencia en la información disponible de un entrenamiento adicional, fine-tuning o modificación de los pesos más allá de la cuantización.

## Capacidades

- Generación de texto conversacional en formato chat, según la etiqueta `conversational` del repositorio.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3-4B (capacidades específicas no detalladas en la información proporcionada).
- Inferencia local mediante llama.cpp, tanto en CLI (`llama-cli`) como en servidor (`llama-server`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere uso a través de infraestructura de Hugging Face.
- Soporte de tool calling, agentes o modos de pensamiento: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles (el pipeline es text-generation).

## Casos de uso

- Asistente conversacional local en portátil: con 2,5 GB de pesos en Q4_K_M, el modelo puede ejecutarse en CPU con llama.cpp para mantener conversaciones multi-turno sin conexión ni dependencia de servicios en la nube.
- Prototipado rápido de aplicaciones de chat: al ser compatible con `llama-server`, se puede levantar un endpoint HTTP local en minutos y conectar una interfaz web o un bot para validar flujos conversacionales antes de migrar a un modelo mayor.
- Generación de texto en entornos con GPU de consumo: la cuantización Q4_K_M permite cargar el modelo en GPUs con 6-8 GB de VRAM, adecuado para tareas de redacción, resumen o reescritura en estaciones de trabajo personales.
- Educación e investigación: sirve como banco de pruebas para estudiar el impacto de la cuantización Q4_K_M frente al checkpoint original en tareas de generación, sin necesidad de infraestructura de datacenter.
- Despliegue en dispositivos edge o sistemas embebidos con Linux: al compilar llama.cpp con flags específicos, el modelo puede integrarse en dispositivos con recursos limitados para tareas de procesamiento de lenguaje natural offline.
- Automatización de tareas de texto por lotes: mediante scripts que invocan `llama-cli`, se pueden procesar grandes volúmenes de documentos para clasificación, extracción o transformación de texto en máquinas sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa 2,5 GB; se recomienda al menos 4 GB de VRAM o RAM libre para cargar el modelo y mantener un contexto moderado.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070) puede ejecutar el modelo con comodidad; GPUs de gama alta (A100, H100, RTX 4090) lo ejecutarán con enorme margen y baja latencia.
- ¿Cabe en GPU de consumo? Sí, en la mayoría de GPUs de consumo con 6-8 GB de VRAM, e incluso en GPUs de 4 GB con contextos reducidos.
- Ejecución en CPU: viable gracias a llama.cpp; se recomienda al menos 8 GB de RAM del sistema.
- Opciones de despliegue: llama.cpp (CLI y servidor), y por extensión cualquier frontend compatible con GGUF como Ollama o LM Studio (no confirmado explícitamente en la información, pero estándar para este formato). vLLM y TGI no soportan GGUF de forma nativa en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RafaAlu/Qwen3-4B-Q4_K_M-GGUF | 4,02 B | No disponible | GGUF (Q4_K_M) | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B (original) | 4,02 B | No disponible | Safetensors | Apache 2.0 | Hugging Face (oficial) |
| Otras cuantizaciones GGUF de Qwen3-4B | 4,02 B | No disponible | GGUF (varios esquemas) | Apache 2.0 | Hugging Face (comunidad) |

La comparación relevante es contra el checkpoint original de Qwen3-4B: este repositorio ofrece la ventaja del formato GGUF para inferencia local, a costa de una posible pérdida de calidad por cuantización y de la falta de garantías de un publicador oficial. Frente a otras cuantizaciones comunitarias del mismo modelo base, la diferencia principal es el esquema Q4_K_M y el hecho de que este repositorio concreto no tiene descargas ni validación social. No se dispone de datos de benchmarks para comparar rendimiento.

## Limitaciones y advertencias

- Es una conversión de terceros: el publicador RafaAlu no es el equipo oficial de Qwen, por lo que no hay garantía de que la cuantización preserve fielmente el comportamiento del modelo original.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación empírica del artefacto.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al checkpoint en safetensors; tareas sensibles a matices (razonamiento complejo, código, matemáticas) pueden degradarse.
- No se especifican los idiomas soportados; el rendimiento en castellano no está documentado.
- La longitud de contexto nativa no se indica en la información proporcionada; el valor `-c 2048` de la model card es solo un ejemplo de configuración del servidor, no la ventana del modelo.
- Riesgo de alucinación inherente a los modelos de 4B, especialmente en dominios especializados.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del modelo base Qwen3-4B.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original y citar adecuadamente.
- No apto para producción crítica sin una evaluación previa contra el checkpoint original en las tareas objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RafaAlu/Qwen3-4B-Q4_K_M-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE
- Herramienta GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
