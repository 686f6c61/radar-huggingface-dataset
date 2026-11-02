# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch12

## Resumen

El modelo `g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch12` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el usuario g-assismoraes en HuggingFace. Se trata de un ajuste fino orientado a *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning), partiendo del modelo base `locuslab/tofu_ft_llama2-7b`, que a su vez es un Llama 2 7B ajustado sobre TOFU. El objetivo del checkpoint es olvidar un subconjunto concreto de datos (la partición "forget10") manteniendo el rendimiento sobre el resto (partición "retain").

La técnica empleada combina un token de *Input Embeddings and LM Head* (IHL) reinicializado a partir de `NousResearch/Llama-2-7b-chat-hf` mientras el resto de pesos del transformer se conservan del modelo ajustado original. El entrenamiento usa una pérdida compuesta de IHL sobre el conjunto a olvidar más una entropía cruzada (CE) ponderada por 1.0 sobre el conjunto a retener, durante 12 épocas de un total de 20. Es, por tanto, un artefacto de experimentación académica, no un modelo listo para producción.

Su relevancia es acotada: sirve como evidencia reproducible en líneas de investigación sobre desaprendizaje, privacidad de datos y cumplimiento del derecho al olvido en modelos de lenguaje. No obstante, no sustituye a un modelo generalista y su uso previsto es la evaluación de metodologías de unlearning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4.096 tokens por defecto) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors en precision original) |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Modelo de inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Dataset de entrenamiento | TOFU (particiones forget10 y retain) |
| Epoca del checkpoint | 12 de 20 |
| Metodo | IHL (Input Embeddings and LM Head) + reset de cabeza, con CE ponderada 1.0 sobre retain |
| Tamano del repositorio | 13.5 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura estándar de Llama 2 7B: 32 capas, atención multi-cabeza con RoPE, normalización RMSNorm y activación SwiGLU. No incorpora innovaciones arquitectónicas respecto al Llama 2 original; la originalidad reside en el procedimiento de ajuste. En concreto, los embeddings de entrada y la cabeza de lenguaje (LM head) se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se mantienen congelados o se ajustan a partir de `locuslab/tofu_ft_llama2-7b`.

El entrenamiento utiliza el dataset TOFU, un benchmark sintético de preguntas y respuestas sobre autores ficticios diseñado para medir el desaprendizaje. La partición "forget10" corresponde al 10 % de los autores que deben olvidarse, mientras que "retain" contiene el resto. La función de pérdida combina un término de IHL sobre los datos a olvidar con una entropía cruzada estándar sobre los datos a retener, ponderada con factor 1.0. El checkpoint publicado corresponde a la época 12 de 20. No se dispone de información sobre el número total de tokens vistos, la composición exacta del dataset más allá de TOFU, ni sobre si se aplicó RLHF o DPO adicional. El autor indica que se trata de un checkpoint autónomo completo y remite a `ihl_manifest.json` para detalles del procedimiento.

## Capacidades

- Generación de texto en inglés, heredada de Llama 2 7B.
- Razonamiento básico y respuesta a preguntas, condicionados por el ajuste sobre TOFU.
- Capacidad de *unlearning*: el checkpoint está diseñado para haber reducido la memorización de la partición forget10 de TOFU.
- Preservación parcial del conocimiento sobre la partición retain, gracias al término de entropía cruzada ponderado.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso específico.
- Capacidades multilingües limitadas al inglés (tag `en`).
- No se documenta *thinking mode*, visión ni audio.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint permite reproducir y comparar metodologías de desaprendizaje sobre TOFU, sirviendo como referencia para medir la eficacia del reset de cabeza y del término IHL frente a otras técnicas.
- Evaluación de privacidad y derecho al olvido: útil para estudiar hasta qué punto un modelo ajustado puede "olvidar" datos concretos y qué coste tiene en retención, en el contexto de cumplimiento normativo (RGPD, derecho de supresión).
- Auditoría de memorización: permite analizar si el modelo sigue reproduciendo información de la partición forget10 mediante ataques de extracción, comparando con el modelo base `locuslab/tofu_ft_llama2-7b`.
- Benchmark de metodologías: sirve como línea base para comparar variantes de IHL, reset de capas o ajustes con pérdidas compuestas en estudios académicos.
- Docencia y formación: adecuado para ilustrar en cursos de IA los compromisos entre olvido y utilidad en modelos de lenguaje.
- Reproducibilidad de experimentos: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), facilita la replicación de resultados en publicaciones sobre unlearning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13.5 GB, coherente con los 6.738 millones de parámetros y el tamaño del repositorio.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 4-5 GB.
- GPU recomendadas para fp16: NVIDIA A100 (40/80 GB), H100, L40S, RTX 6000 Ada o RTX 4090 (24 GB).
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y RTX 4080 con cuantización de 8 o 4 bits; en fp16 requiere al menos 16 GB, por lo que una RTX 4090 es suficiente.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión) y Transformers con `accelerate`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch12 | 6.738 M | no disponible (Llama 2: 4.096) | llama2 | Unlearning TOFU (IHL + reset de cabeza) | HuggingFace, 0 descargas |
| locuslab/tofu_ft_llama2-7b | 6.738 M | 4.096 | llama2 | Fine-tuning TOFU sin unlearning (modelo base) | HuggingFace |
| locuslab/tofu_llama2-7b | 6.738 M | 4.096 | llama2 | Modelo original TOFU pre-fine-tuning | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | 6.738 M | 4.096 | llama2 | Chat generalista | HuggingFace |

La comparación relevante es con el modelo base `locuslab/tofu_ft_llama2-7b` (sin olvido) y con `locuslab/tofu_llama2-7b` (modelo pre-ajuste). El checkpoint aquí descrito debería mostrar menor memorización de forget10 y, idealmente, retención comparable en retain, aunque no se dispone de métricas publicadas para confirmarlo.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente generalista.
- Entrenado exclusivamente en inglés; no se garantiza un comportamiento correcto en otros idiomas.
- Riesgo de alucinación inherente a Llama 2 7B, agravado por el ajuste sobre un dataset sintético de autores ficticios.
- El objetivo de olvido puede no ser completo: el unlearning no garantiza la eliminación total de la información de la partición forget10, y puede ser vulnerable a ataques de extracción.
- Posible degradación de la calidad general del modelo debido al reset de embeddings y LM head y al ajuste sobre TOFU.
- Licencia Llama 2: restricciones de uso comercial, obligación de incluir el aviso de licencia y de la política de uso aceptable; no es una licencia de código abierto plena.
- Sin descargas ni validación por la comunidad (0 descargas, 0 likes en el momento de la consulta), lo que limita la evidencia externa sobre su comportamiento.
- No se documentan sesgos específicos, pero hereda los sesgos de Llama 2 y de los datos de TOFU.
- El checkpoint corresponde a la época 12 de 20; no se sabe si es la mejor época en términos de olvido o retención.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch12
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU: https://arxiv.org/abs/2401.06121
