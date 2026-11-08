# davidafrica/e2h-polaris-gemma-4-e4b-it-full-all_rb

## Resumen

e2h-polaris-gemma-4-e4b-it-full-all_rb es un ajuste fino del modelo multimodal google/gemma-4-E4B-it publicado por el usuario davidafrica. Se trata de un checkpoint de GRPO (Group Relative Policy Optimization) obtenido en las ejecuciones de matemáticas denominadas E2H (easy-to-hard) Polaris, entrenadas con verl 0.9.1 (entrenador v0, FSDP2) sobre el conjunto Polaris-Dataset-53K. El objetivo es mejorar el razonamiento matemático del modelo base mediante aprendizaje por refuerzo con recompensa basada en reglas (respuesta correcta frente a la de referencia).

El checkpoint corresponde al paso 200 de 200 de la ronda de partición completa ("full-split"), en la que los conjuntos de entrenamiento contienen todos los problemas de cada banda de dificultad, divididos según las tasas de acierto del propio Gemma-4-E4B-it en 16 muestras (fácil 10-15/16, difícil 1-9/16). Solo se entrenó el modelo de lenguaje; las torres de visión y audio permanecen intactas respecto al modelo base.

Con 7.996.156.490 parámetros en safetensors y un repositorio de 63,7 GB, es un modelo de aproximadamente 8B parámetros con licencia Apache 2.0. Su relevancia radica en que documenta un pipeline completo de RL para matemáticas sobre un modelo multimodal abierto, con checkpoints intermedios accesibles por revisión y evaluación sistemática en dos conjuntos de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), solo se entrena la parte de lenguaje; K/V compartidas en las últimas 18 capas |
| Parametros totales | 7.996.156.490 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde los shards FSDP de verl) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it, un checkpoint multimodal completo que incluye torres de visión y audio. En este ajuste solo se entrena el modelo de lenguaje, por lo que las torres de visión y audio son las del modelo base. Una particularidad arquitectónica de Gemma 4 es que comparte claves y valores (K/V) en sus últimas 18 capas, de modo que sus propias k_proj, v_proj y k_norm nunca se utilizan; en este checkpoint se copian sin cambios desde el base para mantener la correspondencia de nombres de tensores.

El entrenamiento se realizó con verl 0.9.1 (entrenador v0, FSDP2) aplicando GRPO con recompensa basada en reglas (corrección frente a la respuesta de referencia). Se usaron 200 pasos de 64 prompts × 8 muestras, learning rate 1e-6, pérdida KL de 0.001 (low_var_kl) y respuestas de 2048 tokens con el modo thinking activado. El conjunto de entrenamiento `train_all` (suma de `train_easy` y `train_hard`) contiene 29.394 problemas del Polaris-Dataset-53K, divididos según las tasas de acierto del modelo base en 16 muestras (fácil 10-15/16, difícil 1-9/16). La evaluación se hizo cada 50 pasos sobre `eval_all` (5.304 problemas de todas las tasas de acierto) y `eval_hard` (10.765 problemas que el base no resolvió ninguna vez en 16 intentos).

## Capacidades

- Generación de texto y razonamiento matemático, reforzado específicamente mediante GRPO sobre problemas de matemáticas.
- Modo thinking activado durante el entrenamiento, con respuestas de hasta 2048 tokens.
- Capacidades multimodales heredadas del modelo base: visión y audio (torres no entrenadas en este ajuste).
- Generación de código y razonamiento general, en la medida en que las conserva el modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Resolución de problemas matemáticos de competición: el modelo ha sido entrenado con GRPO sobre problemas del Polaris-Dataset-53K con recompensa por respuesta correcta, por lo que es adecuado para generar soluciones paso a paso con modo thinking en entornos de evaluación matemática.
- Investigación en aprendizaje por refuerzo: los checkpoints intermedios (cada 50 pasos, accesibles por revisión) permiten estudiar la evolución del rendimiento durante el entrenamiento GRPO y comparar curvas de aprendizaje.
- Evaluación de pipelines de RL con verl: sirve como referencia reproducible de un entrenamiento GRPO con FSDP2, recompensa basada en reglas y pérdida KL baja, útil para validar configuraciones propias.
- Análisis de dificultad curricular (easy-to-hard): la división por tasas de acierto del modelo base permite investigar cómo afecta entrenar con problemas fáciles frente a difíciles en el rendimiento final.
- Fine-tuning posterior sobre dominios matemáticos específicos: al estar publicado en safetensors bf16 y con licencia Apache 2.0, puede servir de punto de partida para ajustes adicionales con SFT o DPO.
- Despliegue con vLLM para inferencia por revisión: la model card documenta la carga mediante `vllm.LLM(..., revision="step-200")`, lo que facilita servir distintas etapas del entrenamiento y comparar sus salidas.
- Experimentos multimodales controlados: al conservar las torres de visión y audio del base, permite estudiar si el RL exclusivamente sobre lenguaje degrada o preserva las capacidades multimodales originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluaciones cada 50 pasos sobre `eval_all` (5.304 problemas) y `eval_hard` (10.765 problemas), pero no se incluyen las métricas numéricas obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para los pesos (8B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 24 GB para contexto moderado.
- Cuantización: no se publican versiones GGUF ni cuantizadas; habría que generarlas a partir de los safetensors bf16.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para despliegue en producción; RTX 4090 (24 GB) podría alojar los pesos en bf16 con contexto limitado.
- GPU de consumo: posible en RTX 4090 y, con cuantización a 8 o 4 bits, en GPUs de 16 GB o menos, aunque no se proporcionan pesos cuantizados oficiales.
- Opciones de despliegue: vLLM (documentado en la model card mediante `vllm.LLM`), y `AutoModelForImageTextToText.from_pretrained` de Transformers. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e2h-polaris-gemma-4-e4b-it-full-all_rb | 7.996.156.490 | no disponible | GRPO sobre matemáticas (verl) | apache-2.0 | Hugging Face |
| google/gemma-4-E4B-it | no disponible | no disponible | Modelo base multimodal | no disponible | Hugging Face |
| davidafrica/e2h-polaris-gemma-4-e4b-it-all_rb | ~8B | no disponible | GRPO, partición `all` | no disponible | Hugging Face |
| davidafrica/e2h-polaris-gemma-4-e4b-it-easy_rb | ~8B | no disponible | GRPO, partición `easy` | no disponible | Hugging Face |

Los tres modelos de davidafrica comparten base y metodología, diferenciándose en la partición de datos de entrenamiento (`full-all`, `all`, `easy`). No se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al derivar de Gemma 4, hereda los sesgos del modelo base, no documentados aquí.
- Riesgo de alucinación: no evaluado en la información disponible; el entrenamiento con recompensa basada en reglas puede favorecer formatos de respuesta concretos sin garantizar corrección fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados.
- Restricciones de licencia: la licencia declarada es Apache 2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base google/gemma-4-E4B-it, cuyos términos no se detallan en la información proporcionada.
- Solo se entrenó el modelo de lenguaje: las capacidades de visión y audio son las del base y podrían no haberse preservado tras el RL.
- Checkpoint de investigación: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado; no hay evidencia de validación en producción.
- El repositorio ocupa 63,7 GB, lo que implica un coste de almacenamiento y descarga considerable.
- Las K/V de las últimas 18 capas se copian del base sin entrenar; cualquier modificación manual de esos tensores rompería la coherencia con el modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidafrica/e2h-polaris-gemma-4-e4b-it-full-all_rb
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Variante `all`: https://huggingface.co/davidafrica/e2h-polaris-gemma-4-e4b-it-all_rb
- Variante `easy`: https://huggingface.co/davidafrica/e2h-polaris-gemma-4-e4b-it-easy_rb
