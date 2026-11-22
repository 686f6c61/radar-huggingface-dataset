# llm-semantic-router/Vela-1.0-Encoder-307M-FactCheck

## Resumen

Vela-1.0-Encoder-307M-FactCheck es un modelo encoder de clasificación de texto desarrollado por el proyecto vLLM Semantic Router, derivado por fine-tuning del modelo base vllm-sr/Vela-1.0-Encoder-307M. Su función es identificar peticiones que requieren conocimiento factual externo o recuperación de información (retrieval), es decir, actúa como clasificador de enrutamiento que decide cuándo una consulta necesita ser enviada a un sistema de búsqueda o base de conocimiento. No determina si una afirmación es verdadera, sino si la petición exige acceso a hechos externos.

El modelo emplea una arquitectura ModernBERT con 307.531.778 parámetros totales y una capacidad de entrada de 32.768 tokens, incluyendo tokens especiales. Está pensado para integrarse en pipelines de enrutamiento semántico dentro de despliegues de LLM, donde la latencia y el coste de una llamada a un modelo generativo hacen inviable consultar retrieval en cada turno.

Su relevancia actual radica en que mejora sustancialmente al clasificador original mmBERT32K FactCheck en la tarea de detección de peticiones que necesitan verificación factual, con un Macro F1 de 88,08 frente a 50,26 y una accuracy de 88,17 frente a 54,30 sobre un conjunto de desarrollo de 186 entradas revisadas. La licencia Apache 2.0 y la disponibilidad en safetensors y ONNX facilitan su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 307.531.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens de entrada, incluidos tokens especiales |
| Tipos de cuantizacion | no disponible (la evaluacion publicada usa FP32) |
| Idiomas soportados | en, zh, es, fr, de, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder basado en ModernBERT, una evolución de la familia BERT que incorpora mejoras de eficiencia computacional y soporte para contextos largos. Cuenta con 307,5 millones de parámetros y una ventana de entrada de 32.768 tokens, lo que permite clasificar peticiones con historiales de conversación o documentos adjuntos extensos sin truncamiento. El pipeline declarado es text-classification y el modelo está etiquetado como fine-tune del checkpoint vllm-sr/Vela-1.0-Encoder-307M, orientado específicamente a la tarea de enrutamiento semántico.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. La evaluación publicada se realizó sobre 186 peticiones naturales revisadas con longitudes entre 7 y 2.868 tokens, empleando FP32, entradas completas y la etiqueta de mayor puntuación. El autor advierte explícitamente que este conjunto de desarrollo sirvió para seleccionar Vela y no constituye un test independiente ni una medición de la precisión real a 32K tokens.

## Capacidades

- Clasificación binaria de peticiones que requieren conocimiento factual externo o recuperación, frente a las que no lo requieren.
- Procesamiento de entradas largas de hasta 32.768 tokens, útil para conversaciones multi-turno o consultas con contexto documental.
- Enrutamiento semántico dentro de pipelines de LLM: decide si una consulta debe derivarse a un sistema de retrieval.
- Soporte multilingüe en inglés, chino, español, francés, alemán y japonés.
- Compatibilidad con text-embeddings-inference y endpoints compatibles según los tags del repositorio.
- Exportación a ONNX además de safetensors, lo que facilita despliegues en entornos sin PyTorch.
- No genera texto ni razona de forma generativa: es un clasificador, no un modelo instruct.

## Casos de uso

- Enrutamiento de consultas en asistentes conversacionales: el clasificador evalúa cada turno y decide si la petición debe enviarse a un motor de búsqueda o base de conocimiento antes de invocar al LLM generativo, reduciendo llamadas innecesarias a retrieval.
- Verificación de hechos en pipelines RAG: antes de recuperar documentos, el modelo filtra las consultas que realmente necesitan evidencia externa, evitando recuperaciones superfluas en preguntas de razonamiento puro o creativas.
- Moderación de contenido informativo: detección de peticiones que solicitan datos verificables para derivarlas a flujos con fuentes citadas y trazabilidad.
- Atención al cliente automatizada: clasificación de consultas de usuarios que requieren datos actualizados (precios, disponibilidad, políticas) frente a consultas procedimentales que se resuelven con el propio modelo generativo.
- Optimización de costes en despliegues de LLM: al ser un encoder de 307M parámetros, su inferencia es órdenes de magnitud más barata que una llamada a un modelo generativo, por lo que actúa como primera etapa de filtrado en arquitecturas de router.
- Investigación en evaluación de sistemas de recuperación: uso como componente de referencia para medir la tasa de consultas que justifican retrieval en corpus multilingües.
- Procesamiento de documentos largos: con 32.768 tokens de contexto, puede clasificar consultas que incluyen contratos, artículos o hilos de conversación completos sin truncar.

## Benchmarks y rendimiento

| Evaluacion de desarrollo | mmBERT original | Vela |
|---|---:|---:|
| Macro F1 · 186 entradas | 50,26 | 88,08 |
| Accuracy · 186 entradas | 54,30 | 88,17 |

Los datos corresponden a un conjunto de desarrollo de 186 peticiones naturales revisadas, con longitudes de 7 a 2.868 tokens, evaluadas en FP32 con entradas completas. El autor indica que este conjunto informó la selección de Vela y no es un test independiente ni mide la precisión a 32K tokens. No se han publicado resultados adicionales de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,2 GB solo para pesos (307,5M parámetros × 4 bytes), más memoria para activaciones y buffers.
- VRAM estimada en FP16/BF16: alrededor de 0,6 GB para pesos; en INT8, unos 0,3 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en CPU para cargas moderadas.
- GPU recomendadas para alto throughput: A100, H100 o L40S, aunque el modelo es lo suficientemente pequeño para que una sola GPU consumer gestione múltiples flujos concurrentes.
- Opciones de despliegue: transformers con pipeline de text-classification, text-embeddings-inference, ONNX Runtime y servidores compatibles con endpoints según los tags del repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al tratarse de un encoder de 307M, la latencia por petición es del orden de milisegundos en GPU moderna, pero no se han publicado cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vela-1.0-Encoder-307M-FactCheck | 307,5M | 32.768 | Clasificación de necesidad de fact-checking | Apache 2.0 | Hugging Face (safetensors, ONNX) |
| mmBERT32K FactCheck (original) | no disponible | 32K (según nombre) | Clasificación de necesidad de fact-checking | no disponible | Hugging Face |
| Vela-1.0-Encoder-307M (base) | 307,5M | 32.768 | Encoder base para router | Apache 2.0 | Hugging Face |

La comparativa se limita al modelo original que Vela mejora y a su checkpoint base, ya que no se dispone de información sobre otros clasificadores de enrutamiento comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo identifica peticiones que necesitan conocimiento externo, pero no verifica la veracidad de afirmaciones; no debe usarse como sistema de fact-checking por sí solo.
- La evaluación publicada se basa en 186 entradas de desarrollo que informaron la selección del modelo; no es un test independiente y puede sobreestimar el rendimiento real.
- No se ha medido la precisión a la longitud máxima de 32.768 tokens; el rendimiento en contextos muy largos es desconocido.
- Riesgo de sesgo derivado de los datos de entrenamiento, cuya composición no se ha publicado.
- El soporte multilingüe declarado (en, zh, es, fr, de, ja) no está respaldado por métricas por idioma en la información disponible.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el autor no documenta restricciones adicionales ni garantías de idoneidad para producción.
- Al ser un clasificador binario, los errores de clasificación se propagan directamente al pipeline de enrutamiento: un falso negativo evita un retrieval necesario y un falso positivo añade coste y latencia innecesarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-FactCheck
- Modelo base: https://huggingface.co/vllm-sr/Vela-1.0-Encoder-307M
- Modelo original comparado: https://huggingface.co/vllm-sr/mmbert32k-factcheck-classifier-merged
- Colección Vela 1.0 Router Models: https://huggingface.co/collections/vllm-sr/vela-10-router-models-6aa555ba70cc6997d6d67798
- Documentación: https://vllm-sr.ai/
- Blog: https://vllm-sr.ai/blog/
- Repositorio GitHub: https://github.com/vllm-project/semantic-router
- Slack: https://vllm-dev.slack.com/archives/C09CTGF8KCN
