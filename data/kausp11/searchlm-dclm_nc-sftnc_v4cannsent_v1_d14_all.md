# Kausp11/searchlm-dclm_nc-sftnc_v4cannsent_v1_d14_all

## Resumen

Search-LLM DCLM-Edu 400M SFT es un modelo de generación de texto en formato conversacional desarrollado por el usuario Kausp11 y publicado en HuggingFace. Se trata de un modelo pequeño (aproximadamente 842 millones de parámetros según los metadatos de safetensors) basado en la arquitectura nanochat, entrenado con un enfoque de preentrenamiento habilitado para búsqueda ("search-enabled pretraining"), lo que significa que el modelo aprendió a emitir consultas web y procesar respuestas de búsqueda mediante tokens especiales.

La versión publicada corresponde a una fase de fine-tuning supervisado (SFT) sobre el modelo base preentrenado con el corpus DCLM-Edu. El ajuste combina datos de chat y habilidades (SmolTalk), tool calling (SmolTalk2) y conversaciones con bloques de búsqueda generados por un pipeline de anotación del propio preentrenamiento. Su relevancia reside en ser un experimento abierto de integración de búsqueda web durante el entrenamiento, un área activa para reducir alucinaciones en modelos pequeños.

Es un modelo experimental con muy poca tracción comunitaria (242 descargas, 0 likes en el momento de la ficha), por lo que conviene tratarlo como material de investigación más que como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (nanochat), decoder-only |
| Parametros totales | 842.220.414 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en bf16/fp16 inferible por tamaño, no confirmado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only exportado desde el framework nanochat, con tokenizador de SmolLM2 ampliado con tokens especiales de búsqueda: `<WEB_QUERY>`, `</WEB_QUERY>`, `<WEB_RESPONSE>` y `</WEB_RESPONSE>`. Estos tokens permiten al modelo delimitar consultas web y respuestas de búsqueda dentro de una conversación, habilitando un flujo tipo agente de recuperación de información.

El entrenamiento consta de dos fases documentadas: un preentrenamiento sobre el corpus DCLM-Edu (no se especifica el número de tokens) y un fine-tuning supervisado identificado como "v4c-ann-sent" de una época. Los datos de SFT combinan SmolTalk (chat y habilidades), SmolTalk2 (tool calling) y conversaciones de SmolTalk con bloques de búsqueda procedentes del pipeline de anotación del preentrenamiento, colocados al inicio de la frase. El formato de chat utilizado es `User: ...\n\nAssistant: ...`. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en formato `User: ... / Assistant: ...`
- Tool calling, entrenado con el dataset SmolTalk2
- Emisión y procesamiento de consultas y respuestas web mediante los tokens `<WEB_QUERY>` y `<WEB_RESPONSE>`, lo que habilita flujos de búsqueda-aumentada (RAG o búsqueda en vivo si se integra con un motor)
- Razonamiento multi-turno básico propio de un modelo SFT de ~800M de parámetros
- Capacidades multilingües: no disponible (no documentado)
- No se documentan capacidades de visión, audio ni modo de pensamiento extendido

## Casos de uso

- Investigación en preentrenamiento con búsqueda: sirve como modelo de estudio para analizar cómo afecta el entrenamiento con bloques de búsqueda a la calidad de las respuestas y a la reducción de alucinaciones.
- Prototipado de agentes de búsqueda: los tokens de búsqueda permiten construir un bucle agéntico donde el modelo genera consultas, un sistema externo las ejecuta y el modelo consume los resultados.
- Chatbot ligero on-device: con ~842M de parámetros cabe en hardware de consumo, adecuado para asistentes conversacionales simples que no requieren modelos de 7B+.
- Integración con herramientas (function calling): gracias al entrenamiento con SmolTalk2, puede integrarse en pipelines que invoquen APIs o funciones externas.
- Base para fine-tuning adicional: al ser un modelo pequeño con licencia Apache-2.0, es un punto de partida económico para especializarlo en dominios concretos (educación, dada la procedencia DCLM-Edu).
- Evaluación de tokenizadores con tokens especiales: útil para probar infraestructuras de inferencia que deban manejar vocabularios extendidos con tokens de control personalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7–2 GB en precisión completa (el repo pesa 1,7 GB); con cuantización a 4 bits podría rondar 0,6–0,8 GB, aunque no hay cuantizaciones publicadas.
- GPU recomendadas: cualquier GPU moderna de consumo es suficiente; no se requieren A100 ni H100 para inferencia. Una RTX 3060 de 12 GB o superior lo ejecuta con holgura.
- Consumer GPU: sí, cabe sobradamente en prácticamente cualquier GPU con 4 GB de VRAM o más, e incluso es viable en CPU dado su tamaño.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), y en principio compatible con backends estándar como vLLM, llama.cpp (requeriría conversión a GGUF, no disponible en el repo) u Ollama; al usar código personalizado y tokens especiales, transformers es la vía documentada.
- Latencia y throughput: no disponible; al ser un modelo de ~842M, cabe esperar latencias bajas y throughput alto en GPU de consumo, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Search-LLM DCLM-Edu 400M SFT (este) | 842M | no disponible | Apache-2.0 | SFT con tool calling y tokens de búsqueda |
| SmolLM2-1.7B-Instruct | 1.7B | 8192 | Apache-2.0 | Comparte tokenizador base; sin tokens de búsqueda |
| Qwen2.5-0.5B-Instruct | 0.5B | 32768 | Apache-2.0 (con restricciones de marca) | Modelo generalista pequeño muy optimizado |
| Llama-3.2-1B-Instruct | 1.24B | 128000 | Llama 3.2 Community | Contexto muy largo, ecosistema amplio |

Frente a estas alternativas, el modelo de Kausp11 se distingue por su entrenamiento con bloques de búsqueda y tool calling, pero carece de la madurez, el contexto largo y los benchmarks publicados de los modelos comerciales-abiertos citados.

## Limitaciones y advertencias

- Modelo experimental con adopción mínima (242 descargas, 0 likes): no hay validación comunitaria ni pruebas de calidad publicadas.
- No hay model card técnica completa: se desconocen longitud de contexto, idiomas, datos de preentrenamiento en detalle y posibles sesgos.
- Riesgo de alucinación elevado al tratarse de un modelo pequeño; la capacidad de búsqueda solo reduce este riesgo si se integra con un motor real de recuperación.
- Requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar código personalizado del repositorio: revisar el código antes de usarlo en entornos sensibles.
- Los tokens especiales de búsqueda (`<WEB_QUERY>`, etc.) pueden no ser gestionados correctamente por librerías de inferencia que no conozcan el vocabulario extendido.
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial.
- No se documentan fases de alineación (RLHF/DPO), por lo que el comportamiento en conversaciones abiertas puede ser menos robusto que en modelos instruct equivalentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kausp11/searchlm-dclm_nc-sftnc_v4cannsent_v1_d14_all
- No se han encontrado enlaces adicionales (paper, blog o repositorio externo) en la informacion disponible.
