# pranil00/ONIX-Qwen1.5-4B-Chat-GGUF

## Resumen

ONIX-Qwen1.5-4B-Chat-GGUF es una cuantización en formato GGUF del modelo Qwen1.5-4B-Chat, publicada por el usuario pranil00 bajo el sello "ONIX Community". No se trata de un modelo entrenado desde cero, sino de una conversión de los pesos originales de Qwen al formato GGUF con cuantización Q5_K_M, realizada según el autor en hardware Apple Silicon con Metal. El modelo base, Qwen1.5-4B-Chat, es un transformer decoder-only de aproximadamente 3.950 millones de parámetros desarrollado por Alibaba Cloud (equipo Qwen) y liberado bajo licencia Apache 2.0.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de despliegue local de bajo coste para un modelo conversacional de 4B parámetros; por otro, sirve como caso de estudio de una publicación de cuantización de terceros con escasa documentación técnica, cero descargas y cero likes en el momento de la consulta, lo que obliga a tratar sus datos con cautela. No se dispone de información sobre idiomas soportados ni de resultados de benchmarks específicos de esta conversión.

El modelo resuelve el problema de ejecutar un LLM conversacional en hardware de consumo (CPU o GPU modesta) sin necesidad de VRAM de gama alta, a costa de una pérdida de precisión inherente a la cuantización de 5 bits. Es relevante para desarrolladores que quieran prototipar agentes o chatbots en local con un modelo de licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen1.5-4B-Chat) |
| Parametros totales | 3.950.369.280 (3,95 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen1.5-4B-Chat soporta hasta 32.768 tokens, segun la documentacion oficial de Qwen) |
| Tipos de cuantizacion | Q5_K_M (unica variante publicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tamano del peso de trabajo: 2,64 GB; tamano del repo: 2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen1.5-4B-Chat: un transformer decoder-only con atención multi-cabeza estándar, normalización RMSNorm, activación SwiGLU y embeddings de tokens compartidos con la cabeza de salida (weight tying). El modelo base fue entrenado por el equipo Qwen de Alibaba Cloud sobre un corpus multilingüe (predominantemente inglés y chino) y posteriormente ajustado con técnicas de alineación conversacional (SFT y presumiblemente RLHF/DPO, aunque los detalles exactos no están disponibles en la información proporcionada). No se dispone de datos sobre el número exacto de tokens de entrenamiento ni sobre la composición del dataset.

La contribución de esta publicación concreta no es el entrenamiento, sino la conversión a GGUF y la cuantización Q5_K_M mediante `llama.cpp`, verificada según el autor como "conversión auténtica de tensores". No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de las propias del formato GGUF y del motor `llama.cpp`. La cuantización Q5_K_M emplea 5 bits por peso con mezcla de escalas (k-quants), lo que reduce el tamaño de ~8 GB en FP16 a ~2,64 GB con una degradación de calidad moderada.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste de chat de Qwen1.5-4B-Chat.
- Razonamiento básico y respuesta a instrucciones en formato chat.
- Generación de código y tareas de matemáticas elementales (capacidad limitada por el tamaño de 4B parámetros).
- Soporte de tool calling / function calling: no confirmado en esta conversión; el modelo base Qwen1.5-4B-Chat incluye soporte de function calling según su documentación, pero no se verifica en la model card de esta cuantización.
- Capacidades de agente y razonamiento multi-paso: no documentadas en esta publicación.
- Capacidades multilingües: no disponibles (no se especifican idiomas; el modelo base soporta principalmente inglés y chino, además de otros idiomas de forma limitada).
- Modo thinking, visión o audio: no disponibles.
- Ejecución en CPU y GPU modesta gracias al formato GGUF y al tamaño de 2,64 GB.

## Casos de uso

- Prototipado de chatbots locales: permite levantar un asistente conversacional en un portátil sin GPU dedicada usando Ollama (`ollama run pranil00/ONIX-Qwen1.5-4B-Chat-GGUF`), adecuado para demos y pruebas de concepto con coste cero de infraestructura.
- Asistente de código en el editor: integrable en extensiones tipo Continue o similares que consumen endpoints compatibles con OpenAI, ofreciendo autocompletado y explicación de fragmentos en máquinas de desarrollo sin VRAM elevada.
- Procesamiento de texto por lotes en CPU: clasificación, resumen o reescritura de documentos en servidores sin GPU, aprovechando el bajo consumo de memoria (~2,6 GB de pesos) y la compatibilidad con `llama.cpp`.
- Educación e investigación: estudio comparativo del impacto de la cuantización Q5_K_M frente al modelo en FP16, útil para medir degradación de calidad en tareas concretas.
- Despliegue en dispositivos edge: ejecución en mini-PC, Raspberry Pi de gama alta o portátiles Apple Silicon (el autor reporta conversión en Metal), para asistentes offline con requisitos de privacidad.
- Generación de respuestas en aplicaciones de atención al cliente de baja concurrencia: con contexto limitado y sin garantías de tool calling verificado, sirve para flujos simples de FAQ y respuestas guionizadas.
- Base para fine-tuning ligero o experimentación con LoRA: al ser Apache 2.0 y GGUF, puede servir de punto de partida, aunque para fine-tuning se recomendaría partir de los pesos originales en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3-4 GB con Q5_K_M (pesos de 2,64 GB más overhead de contexto y KV cache); con contexto largo la KV cache puede añadir varios cientos de MB.
- GPU recomendadas: cualquier GPU con ≥4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100, H100). En GPUs de gama alta el modelo queda infrautilizado; su punto óptimo es hardware modesto.
- Cabe en GPU de consumo: sí, en RTX 3060 6 GB, RTX 4060 8 GB, RTX 4090 y en Apple Silicon unificada (M1/M2/M3 con ≥8 GB).
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`), Ollama (comando documentado por el autor), y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). vLLM y TGI no soportan GGUF de forma nativa para este formato; requerirían los pesos originales.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ONIX-Qwen1.5-4B-Chat-GGUF (esta ficha) | 3,95 B | no disponible (base: 32.768) | Apache 2.0 | GGUF Q5_K_M | Cuantizacion de terceros, sin benchmarks ni descargas |
| Qwen/Qwen1.5-4B-Chat (original) | 3,95 B | 32.768 | Apache 2.0 | safetensors | Modelo base oficial, con model card completa y benchmarks publicados por Qwen |
| Meta Llama 3.2 3B Instruct | 3,2 B | 131.072 | Llama 3.2 Community License | safetensors, GGUF | Contexto mucho mayor, licencia con restricciones comerciales |
| Microsoft Phi-3-mini (3,8 B) | 3,8 B | 4.096 (128K en variante long) | MIT | safetensors, GGUF | Buen rendimiento en razonamiento para su tamano, licencia muy permisiva |

## Limitaciones y advertencias

- Publicación de terceros con cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria de la integridad de los pesos ni de la calidad de la cuantización.
- La model card es mínima: no documenta idiomas, benchmarks, ni detalles de entrenamiento o alineación.
- Riesgo de alucinación inherente a un modelo de 4B parámetros, agravado por la cuantización de 5 bits.
- Sesgos conocidos del modelo base Qwen1.5 (predominio de inglés y chino, posibles sesgos culturales y de género) no documentados en esta publicación.
- Limitaciones de contexto: aunque el modelo base soporta 32.768 tokens, no se confirma que esta conversión GGUF preserve esa ventana; conviene verificar con `llama.cpp` antes de usarla en producción.
- Tool calling y capacidades de agente no verificadas en esta cuantización.
- Licencia Apache 2.0 permisiva para uso comercial, pero el usuario debe cumplir también las condiciones del modelo base Qwen1.5-4B-Chat (también Apache 2.0).
- La cuantización Q5_K_M introduce degradación de precisión frente a FP16; para tareas sensibles (código en producción, matemáticas) se recomienda evaluar contra el modelo original.
- No se garantiza soporte ni mantenimiento por parte del autor; la fecha de creación (2026-11-27) y la ausencia de actualizaciones sugieren un artefacto puntual.

## Enlaces

- Hugging Face: https://huggingface.co/pranil00/ONIX-Qwen1.5-4B-Chat-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen1.5-4B-Chat
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Documentación de Qwen1.5: https://qwenlm.github.io/blog/qwen1.5/
