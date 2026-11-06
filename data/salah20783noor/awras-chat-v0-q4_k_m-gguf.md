# salah20783noor/awras-chat-v0-Q4_K_M-GGUF

## Resumen

Awras Chat v0 (Q4_K_M, GGUF) es una cuantización en formato GGUF del modelo `awras/awras-chat-v0`, un modelo de lenguaje de aproximadamente 3.880 millones de parámetros construido sobre la familia Gemma 3 (según los tags de la model card) y afinado mediante LoRA sobre el adaptador `awras/awras-it-01-10k-adapter`. El repositorio lo publica el usuario `salah20783noor` y está pensado para inferencia local mediante llama.cpp, con un tamaño de repo de 2,5 GB que corresponde a la cuantización Q4_K_M.

El modelo resuelve el caso de uso de generación de texto conversacional en inglés, empaquetado en un formato que permite ejecutarlo en hardware de consumo sin necesidad de infraestructura GPU de datacenter. La relevancia de esta ficha radica en que se trata de una publicación reciente (noviembre de 2026) sin descargas ni likes registrados, de la que apenas existe documentación técnica más allá de la model card autogenerada por el espacio GGUF-my-repo.

No se dispone de información publicada sobre la longitud de contexto, la composición exacta del dataset de entrenamiento, los resultados de benchmarks ni las capacidades específicas (tool calling, agentes, visión) del modelo base. La ficha refleja únicamente los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que no aparece en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 3, segun tags de la model card); detalles no disponibles |
| Parametros totales | 3.880.263.168 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el repo solo publica esta variante |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (repo de cuantizacion); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base `awras/awras-chat-v0` es un ajuste fino del modelo Gemma 3, según los tags `gemma3` presentes en la model card. El ajuste se realizó mediante adaptadores LoRA (`awras/awras-it-01-10k-adapter`) sobre el dataset `awras/awras-instruct-v1`, orientado a instrucciones conversacionales en inglés. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado.

La cuantización Q4_K_M se generó con llama.cpp a través del espacio GGUF-my-repo de ggml.ai, un pipeline estándar que convierte los pesos originales a formato GGUF con cuantización de 4 bits (bloques K-quant de tamaño medio). No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido. Tampoco se detalla la arquitectura interna exacta (número de capas, dimensiones de atención, tipo de atención) más allá de la referencia a Gemma 3.

## Capacidades

- Generación de texto conversacional en inglés, orientada a instrucciones.
- Ajuste específico para diálogo multi-turno mediante el adaptador LoRA sobre el dataset de instrucciones.
- Ejecución local en CPU y GPU mediante llama.cpp (CLI y servidor).
- Compatibilidad con el servidor `llama-server` para exponer una API HTTP.
- Capacidad de tool calling, function calling, agentes o razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: solo inglés declarado; no se documentan otros idiomas.
- Capacidades de visión, audio o modo thinking: no disponible (no documentado).

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede desplegarse con `llama-server` en una máquina de desarrollo para prototipar chatbots sin depender de APIs externas, gracias a su tamaño de 2,5 GB en Q4_K_M.
- Pruebas de integración en pipelines de CI: al ser un GGUF ligero, puede cargarse en runners con CPU para validar flujos de generación de texto antes de pasar a modelos mayores.
- Generación de texto en aplicaciones de escritorio: el tamaño reducido permite embeberlo en herramientas de escritorio o plugins que requieran inferencia offline en inglés.
- Experimentación académica con LoRA: al estar basado en un adaptador LoRA publicado, sirve como punto de partida para estudiar el efecto de la cuantización Q4_K_M sobre un modelo afinado.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad entre el modelo base en safetensors y esta versión Q4_K_M en tareas de instrucción.
- Despliegue en entornos con GPU de consumo: puede ejecutarse en GPUs consumer con suficiente VRAM para modelos de ~4B en 4 bits, como tarjetas de 8 GB o superiores (estimación, no confirmada por el autor).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 2,5-3,5 GB para los pesos, más overhead de contexto y KV cache (estimación basada en el tamaño del repo de 2,5 GB; no confirmada por el autor).
- GPU recomendadas: no documentadas por el autor. Por tamaño, cabría en GPUs consumer con 8 GB o más de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 4070), aunque no hay confirmación oficial.
- Cabe en GPU consumer: sí, previsiblemente, dado el tamaño de ~4B parámetros en 4 bits.
- Opciones de despliegue: llama.cpp (CLI y servidor), según la model card. Compatible con tags de text-generation-inference y transformers, aunque la model card solo documenta llama.cpp. No se documenta soporte explícito para vLLM, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a parámetros y disponibilidad. Se comparan alternativas de tamaño similar en la familia Gemma y modelos pequeños de instrucción.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| awras-chat-v0-Q4_K_M-GGUF | ~3,88B | no disponible | cc-by-4.0 | GGUF | Repo Hugging Face, 0 descargas |
| Gemma 3 (variante pequeña, base) | no disponible | no disponible | Gemma Terms of Use | safetensors, GGUF | Amplia disponibilidad |
| Modelos de ~4B de instrucción (familia Llama/Phi) | ~3-4B | no disponible | varía | safetensors, GGUF | Amplia disponibilidad |

No se dispone de datos de benchmarks para establecer una comparación de rendimiento con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Gemma 3 y de un dataset de instrucciones no descrito, los sesgos del corpus original son desconocidos.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni evaluaciones publicadas.
- Limitaciones de contexto o idioma: solo se declara inglés; la longitud de contexto no está documentada, aunque el ejemplo de la model card usa `-c 2048`, lo que sugiere un contexto efectivo de al menos 2048 tokens en ese ejemplo.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución, pero conviene verificar la licencia del modelo base Gemma 3, cuyos términos pueden imponer restricciones adicionales sobre el modelo derivado.
- Caveats para producción: el repositorio no tiene descargas ni validación de la comunidad; no hay garantías de calidad, ni documentación sobre el proceso de ajuste, ni evaluaciones de seguridad. El modelo base y el adaptador LoRA no están descritos en detalle en la información disponible.
- La model card es autogenerada por el espacio GGUF-my-repo y no aporta información técnica adicional sobre el modelo original.

## Enlaces

- Repositorio Hugging Face (cuantización GGUF): https://huggingface.co/salah20783noor/awras-chat-v0-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/awras/awras-chat-v0
- Adaptador LoRA: https://huggingface.co/awras/awras-it-01-10k-adapter
- Dataset de instrucciones: https://huggingface.co/datasets/awras/awras-instruct-v1
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
