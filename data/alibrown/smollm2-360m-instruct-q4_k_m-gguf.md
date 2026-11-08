# Alibrown/SmolLM2-360M-Instruct-Q4_K_M-GGUF

## Resumen

SmolLM2-360M-Instruct-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo SmolLM2-360M-Instruct, desarrollado originalmente por Hugging Face (HuggingFaceTB) y convertida por el usuario Alibrown mediante el espacio GGUF-my-repo de ggml.ai y llama.cpp. Se trata de un modelo de lenguaje de tipo transformer decoder-only con 361.821.120 parámetros totales (aproximadamente 0,36B), diseñado para generación de texto conversacional y ajustado por instrucciones.

El modelo base SmolLM2-360M-Instruct forma parte de la familia SmolLM2, una serie de modelos compactos pensados para ejecutarse en hardware de consumo, dispositivos de borde y entornos con recursos limitados. Esta versión concreta emplea cuantización Q4_K_M, que reduce el peso de los pesos a aproximadamente 4 bits por parámetro con una estrategia de cuantización mixta (K-quants), lo que permite su despliegue en CPU y GPUs de gama baja con un consumo de memoria muy reducido (repo de 0,3 GB).

La relevancia de esta ficha radica en que se trata de un artefacto de cuantización de un modelo pequeño y de licencia permisiva (Apache 2.0), útil para prototipado rápido, inferencia local y experimentación con llama.cpp. No obstante, el repositorio no incluye información adicional sobre el proceso de conversión más allá de la plantilla estándar de GGUF-my-repo, y no se han publicado métricas de rendimiento específicas para esta cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base SmolLM2) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de servidor usa `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base SmolLM2-360M-Instruct es un transformer decoder-only de la familia SmolLM2 de Hugging Face. La información disponible en este repositorio no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones más allá de la denominación "Instruct" del modelo base. Tampoco se especifican innovaciones técnicas como decodificación especulativa o atención lineal en la información proporcionada.

Esta versión concreta es una conversión a GGUF realizada con llama.cpp a través del espacio GGUF-my-repo de ggml.ai, empleando la cuantización Q4_K_M. Esta técnica aplica cuantización de bloques tipo K-quant con mezcla de precisiones, manteniendo en 4 bits la mayoría de tensores y reservando mayor precisión para capas sensibles. El resultado es un archivo de aproximadamente 0,3 GB que puede ejecutarse con llama.cpp en CPU o GPU.

## Capacidades

- Generación de texto conversacional en inglés, orientada a instrucciones (modelo "Instruct").
- Razonamiento básico y respuesta a preguntas de complejidad limitada, condicionado por su reducido tamaño (0,36B parámetros).
- Generación de código y texto técnico sencillo, aunque sin garantías de calidad en tareas complejas.
- Soporte de conversaciones multi-turno mediante plantilla de chat del modelo base.
- Capacidades multilingües limitadas: el modelo declara únicamente inglés (`en`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Prototipado local rápido: permite validar pipelines de generación de texto en un portátil o equipo sin GPU dedicada gracias a su tamaño de 0,3 GB y su formato GGUF ejecutable con llama.cpp.
- Inferencia en dispositivos de borde: su reducido consumo de memoria lo hace apto para Raspberry Pi, routers o sistemas embebidos con CPU, donde modelos mayores no caben.
- Clasificación y etiquetado de texto simple: puede usarse para tareas de extracción de entidades o categorización de textos cortos en inglés, con validación humana posterior.
- Generación de respuestas en asistentes de bajo coste: adecuado para chatbots de dominio acotado donde la latencia y el coste por inferencia son críticos.
- Filtrado y resumen de textos breves: útil como primera etapa en pipelines de procesamiento por lotes donde se requiere throughput alto en CPU.
- Pruebas de integración con llama.cpp y servidores compatibles con la API de OpenAI: sirve como modelo de referencia para validar despliegues con `llama-server` antes de migrar a modelos mayores.
- Educación y experimentación: permite estudiar el comportamiento de modelos pequeños cuantizados sin requerir infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3-0,5 GB con cuantización Q4_K_M, incluyendo overhead de contexto.
- GPU recomendadas: no requiere GPU; funciona en CPU. Puede ejecutarse en cualquier GPU con al menos 1 GB de memoria (GTX 1050, RTX 3050, integradas modernas).
- Cabe en GPU de consumo: sí, en cualquier GPU consumer actual e incluso en iGPU y dispositivos de borde.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por compatibilidad de formato GGUF, también Ollama y otros runners basados en llama.cpp. El repo declara `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware, pero al tratarse de 0,36B parámetros en 4 bits se espera una latencia muy baja en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolLM2-360M-Instruct-Q4_K_M-GGUF (este) | 361.821.120 | no disponible | Apache 2.0 | GGUF Q4_K_M | Cuantizacion del base SmolLM2-360M-Instruct |
| SmolLM2-360M-Instruct (base) | 0,4B (aprox.) | no disponible | Apache 2.0 | safetensors | Modelo original de HuggingFaceTB |
| SmolLM2-360M-Instruct-Q4_K_M-GGUF (otras conversiones, p. ej. mfuntowicz, asynclee) | 361.821.120 | no disponible | Apache 2.0 | GGUF Q4_K_M | Misma conversion via GGUF-my-repo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Tamaño muy reducido (0,36B parámetros): capacidad de razonamiento y conocimiento factual limitados; alta probabilidad de respuestas incorrectas en tareas complejas.
- Riesgo elevado de alucinación, especialmente en preguntas abiertas o de dominio especializado.
- Soporte únicamente de inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto no documentada en este repositorio; el ejemplo de servidor sugiere 2048 tokens, pero debe verificarse contra el modelo base.
- La cuantización Q4_K_M introduce una pérdida de precisión adicional respecto al modelo base en safetensors.
- El repositorio no incluye documentación propia más allá de la plantilla de GGUF-my-repo; la autoría de la conversión corresponde a Alibrown, mientras que la model card referencia a mfuntowicz, lo que puede generar confusión sobre la procedencia exacta del artefacto.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base y citar adecuadamente a Hugging Face.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validación comunitaria de esta conversión concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Alibrown/SmolLM2-360M-Instruct-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Otra conversión GGUF del mismo base: https://huggingface.co/mfuntowicz/SmolLM2-360M-Instruct-Q4_K_M-GGUF
- Otra conversión GGUF del mismo base: https://huggingface.co/asynclee/SmolLM2-360M-Instruct-Q4_K_M-GGUF
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
