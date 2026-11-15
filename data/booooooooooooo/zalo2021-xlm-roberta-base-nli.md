# Booooooooooooo/zalo2021-xlm-roberta-base-nli

## Resumen

El modelo `Booooooooooooo/zalo2021-xlm-roberta-base-nli` es un cross-encoder de clasificación de pares de frases (natural language inference, NLI) construido sobre `FacebookAI/xlm-roberta-base` y ajustado para actuar como verificador de evidencia en un sistema de recuperación de información jurídica (legal IR). Lo firma el usuario de Hugging Face `Booooooooooooo` en el marco de un trabajo de fin de grado sobre recuperación de información legal, y su función concreta es decidir si un fragmento de texto jurídico respalda o no una consulta formulada en lenguaje natural. La salida es binaria: `0` para contradicción o no relevante y `1` para implicación o evidencia de apoyo.

Técnicamente es un transformer encoder de tipo XLM-RoBERTa base, con 278.045.186 parámetros totales y una longitud máxima de entrada de 512 tokens. No es un modelo generativo: se limita a producir una puntuación de relevancia por par (consulta, evidencia), lo que lo hace útil como segunda etapa de reordenación en pipelines de búsqueda jurídica. Su ámbito lingüístico declarado es exclusivamente el vietnamita, y el corpus de ajuste es el conjunto ZALO2021, orientado a preguntas y respuestas legales.

Su relevancia actual es acotada pero específica: cubre un nicho poco poblado, el de la verificación de evidencia en vietnamita para dominios legales, donde la mayoría de los cross-encoders disponibles están entrenados en inglés o en lenguas europeas. La licencia MIT facilita su reutilización, aunque el modelo es pequeño, no está validado con benchmarks públicos en la información disponible y su ecosistema de adopción es prácticamente nulo (cero descargas y cero likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) como cross-encoder de clasificación de pares |
| Parametros totales | 278.045.186 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_length de entrada) |
| Tipos de cuantizacion | no disponible (el repo publica safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | vietnamita (`vi`) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño del repo: 1,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es un encoder XLM-RoBERTa base adaptado como clasificador de secuencias para pares de textos. La entrada se compone de una consulta y un fragmento de evidencia, tokenizados conjuntamente con truncamiento a 512 tokens, y la cabeza de clasificación devuelve dos logits que se interpretan como no implicación (0) e implicación (1). El autor documenta una agregación tipo *bag* con operación `max`, lo que sugiere que el verificador se aplica sobre múltiples fragmentos candidatos y se conserva la puntuación máxima como señal de relevancia del documento completo.

El ajuste se realiza sobre el conjunto ZALO2021, un corpus de preguntas y respuestas jurídicas en vietnamita, en el contexto de un trabajo de fin de grado sobre recuperación de información legal. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO o *hard negative mining*. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; se trata de un ajuste supervisado convencional de un encoder preentrenado multilingüe.

## Capacidades

- Clasificación de pares (consulta, evidencia) en una escala binaria de implicación/no implicación, orientada a la verificación de evidencia.
- Puntuación de relevancia para reordenación (*reranking*) de pasajes recuperados por un motor de búsqueda previo.
- Manejo de entradas de hasta 512 tokens, suficiente para párrafos de artículos legales y preguntas de usuario.
- Capacidad multilingüe heredada del backbone XLM-RoBERTa, aunque el ajuste y la validación declarados se limitan al vietnamita.
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso ni comportamiento agéntico: es un clasificador, no un generador.
- No dispone de modo *thinking*, visión, audio ni generación de texto libre.

## Casos de uso

- Verificación de evidencia en asistentes legales: dado un par (pregunta del ciudadano, artículo de ley recuperado), el modelo puntúa si el artículo respalda la respuesta, filtrando pasajes irrelevantes antes de mostrarlos al usuario.
- Reordenación en motores de búsqueda jurídica: tras una recuperación inicial por BM25 o embeddings, el cross-encoder reordena los candidatos según su probabilidad de implicación, mejorando la precisión del *top-k*.
- Construcción de conjuntos de evidencia para *retrieval-augmented generation*: el modelo actúa como filtro para decidir qué fragmentos se incluyen en el contexto de un LLM generativo, reduciendo el ruido y las alucinaciones por evidencia no pertinente.
- Detección de respuestas no respaldadas: si ningún pasaje recuperado supera un umbral de implicación, el sistema puede abstenerse de responder o derivar la consulta a un profesional, lo que es crítico en dominio legal.
- Anotación semiautomática de pares pregunta-evidencia en vietnamita: el modelo puede preetiquetar candidatos para revisión humana en la construcción de datasets legales.
- Evaluación de sistemas de recuperación: sirve como componente de métricas de calidad de evidencia en experimentos académicos sobre legal IR en vietnamita, donde escasean los verificadores específicos de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,1 GB solo para pesos, más activaciones y memoria del tokenizador; en la práctica, entre 1,5 y 2 GB para lotes pequeños.
- VRAM estimada en FP16/BF16: en torno a 0,6 GB para pesos, con overhead adicional por activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior cubre el caso de uso con holgura.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1660, RTX 20xx, 30xx, 40xx) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con PyTorch (documentado en la model card), `sentence-transformers` en modo cross-encoder, `Text Embeddings Inference` (TEI) para servir cross-encoders, y ONNX Runtime para optimización en CPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al tratarse de un encoder base de 278 M de parámetros, se espera un throughput alto en GPU (cientos de pares por segundo en lotes), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| Booooooooooooo/zalo2021-xlm-roberta-base-nli | 278 M | 512 | vi | MIT | Cross-encoder NLI específico para legal IR en vietnamita |
| `FacebookAI/xlm-roberta-base` | 278 M | 512 | multilingüe | MIT | Backbone base sin ajuste NLI; no es un verificador |
| `cross-encoder/nli-deberta-v3-base` | ~184 M | 512 | en | Apache 2.0 | Cross-encoder NLI en inglés, no cubre vietnamita |
| `MoritzLaurer/mDeBERTa-v3-base-mnli-xnli` | ~278 M | 512 | multilingüe | MIT | NLI zero-shot multilingüe; no específico de dominio legal |

La comparativa es aproximada: no hay datos de rendimiento publicados para el modelo evaluado que permitan una comparación cuantitativa con las alternativas. La principal diferencia cualitativa es su especialización en vietnamita jurídico frente a alternativas genéricas o en inglés.

## Limitaciones y advertencias

- El modelo solo ha sido ajustado y validado declaradamente en vietnamita; su uso en otros idiomas no está respaldado por la documentación, aunque el backbone sea multilingüe.
- Es un clasificador binario: no genera texto, no razona y no puede sustituir a un LLM en tareas de respuesta.
- Riesgo de alucinación no aplicable en sentido estricto (no genera), pero sí riesgo de falsos positivos de implicación que podrían llevar a un sistema a presentar evidencia incorrecta como válida.
- No se documentan sesgos conocidos, composición del dataset ni procesos de mitigación; el corpus ZALO2021 puede introducir sesgos propios del dominio y de la fuente.
- No hay benchmarks públicos ni validación independiente; el rendimiento real en producción es desconocido.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- El límite de 512 tokens puede ser insuficiente para documentos legales largos, lo que obliga a fragmentar y agregar puntuaciones.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de adopción ni de mantenimiento del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Booooooooooooo/zalo2021-xlm-roberta-base-nli
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-RoBERTa: https://arxiv.org/abs/1911.02116
- Documentación de `transformers` para clasificación de secuencias: https://huggingface.co/docs/transformers/tasks/sequence_classification
