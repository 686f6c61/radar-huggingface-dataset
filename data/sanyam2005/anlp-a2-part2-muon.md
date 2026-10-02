# sanyam2005/anlp-a2-part2-muon

## Resumen

anlp-a2-part2-muon es un modelo de lenguaje de 27.269.632 parámetros desarrollado por el usuario sanyam2005 como parte de la asignatura ANLP (Advanced Natural Language Processing), en concreto la segunda parte de la práctica 2. Se trata de un transformer denso solo decodificador (dense decoder-only) entrenado desde cero sobre el corpus `browndw/human-ai-parallel-corpus` con el optimizador Muon implementado a mano, y no de un modelo pensado para uso general. El identificador del repositorio hace referencia al optimizador empleado, no a la arquitectura.

El interés del artefacto es metodológico: sirve como banco de pruebas reproducible de Muon frente a AdamW en un régimen de escala muy pequena (41.648.128 tokens vistos, aproximadamente 1,5 tokens por parámetro, una sola pasada sobre el dataset). La model card reporta una pérdida de validación final de 3,4966 y un BLEU de 1,57 en continuaciones de 64 tokens, cifras que indican que la calidad de generación es prácticamente nula y que el modelo no ha aprendido a producir texto coherente en inglés.

No se documentan ni la licencia, ni la longitud de contexto, ni la arquitectura interna (número de capas, dimensión oculta o cabezas de atención), ni cuantizaciones publicadas. El repositorio ocupa 0,1 GB y contiene pesos en safetensors, un tamaño coherente con pesos en fp32 para ese número de parámetros. Por todo ello debe considerarse un experimento académico, no un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso solo decodificador (dense decoder-only), detalles internos no disponibles |
| Parametros totales | 27.269.632 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas; el autor solo distribuye safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible (no declarada en la model card) |
| Formato de pesos | safetensors |
| Autor | sanyam2005 |
| Fecha de publicación | 1 de octubre de 2026 (según metadatos del repositorio) |
| Tamano del repositorio | 0,1 GB (coherente con pesos en fp32) |
| Pipeline declarado | No disponible |
| Tokens de entrenamiento | 41.648.128 (una pasada sobre el dataset) |
| Dataset | browndw/human-ai-parallel-corpus |
| Pérdida de validación final | 3,4966 |
| BLEU de test (continuación de 64 tokens) | 1,57 |

## Arquitectura y entrenamiento

La model card describe un transformer denso solo decodificador entrenado desde cero para modelado de lenguaje causal. No se especifican el número de capas, la dimensión del modelo, el número de cabezas de atención, el tamaño del vocabulario ni la longitud de contexto, por lo que no es posible reconstruir la topología exacta a partir de la información disponible. El nombre del repositorio y la etiqueta `optimizers` indican que el elemento central del experimento es el optimizador, no la arquitectura.

El entrenamiento se realizó con Muon (optimizador basado en ortogonalización de matrices mediante iteraciones de Newton-Schulz) implementado desde cero, con los siguientes hiperparámetros declarados: `lr` 0,002, `adam_lr` 0,002, `momentum` 0,95, `nesterov` verdadero, `ns_steps` 5, `weight_decay` 0,1, `betas` [0,9, 0,95] y `scale_mode` `moonlight`. La combinación de weight decay y de un escalado de actualización por parámetro es precisamente la receta que el artículo "Muon is Scalable for LLM Training" identifica como necesaria para escalar Muon más allá de modelos de juguete, y el modo `moonlight` remite a ese trabajo. No se menciona ningún tipo de ajuste por preferencias (RLHF, DPO ni similares), ni fases de instrucción, ni decodificación especulativa u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto causal en inglés, con calidad medida extremadamente baja: BLEU de 1,57 en continuaciones de 64 tokens, un valor compatible con una salida esencialmente incoherente.
- Modelado de lenguaje a nivel de token: la pérdida de validación de 3,4966 equivale a una perplejidad de aproximadamente 33,0 (valor derivado de la pérdida reportada, no publicado por el autor).
- Continuación de diálogo humano-IA en el dominio del corpus de entrenamiento, sin garantía de coherencia ni de fidelidad.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento en varios pasos ni modo de pensamiento (thinking mode).
- No se documenta capacidad multilingüe: el modelo está etiquetado únicamente como inglés.
- No se documentan capacidades de visión, audio ni multimodalidad.
- Capacidad instrumental para experimentación: el checkpoint permite reanudar o replicar entrenamientos con Muon y comparar trayectorias de pérdida frente a AdamW en un régimen de cómputo reducido.

## Casos de uso

- Reproducción de experimentos con optimizadores: el checkpoint permite comparar directamente Muon (con `scale_mode` moonlight) frente a AdamW sobre el mismo dataset y la misma arquitectura, midiendo pérdida de validación y BLEU en un entorno de 27 M de parámetros que se entrena en horas y no en semanas.
- Docencia de NLP: sirve como ejemplo completo y de bajo coste de una práctica de entrenamiento desde cero, incluyendo implementación de optimizador, bucle de entrenamiento, evaluación con BLEU y publicación en HuggingFace.
- Investigación en dinámica de optimizadores: al ser un modelo diminuto con `ns_steps` y `momentum` explícitos, es adecuado para estudiar sensibilidad a hiperparámetros de Muon (número de iteraciones de Newton-Schulz, escalado de actualizaciones, weight decay) con barridos amplios y asequibles.
- Pruebas de infraestructura de entrenamiento: por su tamaño (41.648.128 tokens, 27,27 M de parámetros) es útil como caso de prueba para validar pipelines de datos, tokenizadores, checkpoints distribuidos y registro de métricas antes de escalar a modelos mayores.
- Análisis de corpus de diálogo humano-IA: el modelo puede usarse como sonda de tokenización y de estructura estadística sobre `browndw/human-ai-parallel-corpus`, por ejemplo para estudiar qué aprende un transformer diminuto de ese corpus con una sola época.
- Fine-tuning de dominio muy restringido: con 27,27 M de parámetros cabe en cualquier GPU y admite ajuste fino completo (no solo LoRA) sobre datasets pequenos, aunque la base entrenada con 1,5 tokens por parámetro limita mucho la transferencia esperada.
- Despliegue en hardware extremo: es viable ejecutarlo en CPU, Raspberry Pi o dispositivos móviles como prueba de concepto de pipeline de extremo a extremo (tokenizador, inferencia, decodificación), siempre que no se espere calidad de texto utilizable.
- No es adecuado como asistente conversacional, sistema de atención al cliente, generador de código ni ningún uso en producción con usuarios reales, dado el BLEU reportado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. Los únicos datos de evaluación aportados por el autor son los siguientes:

| Metrica | Valor | Notas |
|---|---|---|
| Pérdida de validación final | 3,4966 | Reportada en la model card |
| Perplejidad de validación | ≈ 33,0 | Derivada de la pérdida (exp(3,4966)); no publicada por el autor |
| BLEU de test | 1,57 | Continuación de 64 tokens |
| Tokens de entrenamiento | 41.648.128 | Una pasada sobre el dataset |
| Ratio tokens/parámetro | ≈ 1,53 | Calculado a partir de los datos anteriores |

No se dispone de comparaciones de benchmarks con otros modelos realizadas por el autor.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 109 MB (27,27 M de parámetros × 4 bytes), coherente con el tamaño de repositorio de 0,1 GB.
- Pesos en bf16 o fp16: aproximadamente 55 MB (conversión trivial, no publicada por el autor).
- Pesos en int8: aproximadamente 27 MB; en int4, del orden de 14 a 20 MB. Ninguna de estas cuantizaciones está publicada, solo son estimaciones a partir del número de parámetros.
- Memoria total en inferencia: por debajo de 1 GB en cualquier configuración, incluyendo la caché KV para contextos moderados. La longitud de contexto no está documentada, por lo que no puede acotarse la caché KV.
- GPU recomendadas: cualquier GPU sirve; el modelo es funcionalmente indistinguible en latencia sobre una RTX 4090, una A100 o una H100, ya que el cuello de botella será el overhead del framework y no el cómputo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo de la última década, en iGPU moderna y en CPU. También en Raspberry Pi 4/5 y en dispositivos móviles.
- Opciones de despliegue: `transformers` con PyTorch es la vía directa. vLLM o TGI pueden cargarlo, pero su overhead de servicio es desproporcionado para 27 M de parámetros. llama.cpp y Ollama requieren una conversión a GGUF que el autor no ha publicado.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos publicados que permitan comparar el rendimiento de este modelo con alternativas. La tabla siguiente contrasta únicamente las características declaradas.

| Modelo | Parámetros | Contexto | Tokens de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sanyam2005/anlp-a2-part2-muon | 27,27 M | No disponible | 41,65 M | No disponible | safetensors en HuggingFace |
| openai-community/gpt2 (small) | 124 M | 1.024 | Órdenes de magnitud superior (WebText) | MIT | Pesos públicos, ampliamente soportado |
| HuggingFaceTB/SmolLM-135M | 135 M | 2.048 | 600.000 M (SmolLM-Corpus) | Apache-2.0 | Pesos públicos, integrado en ecosistema transformers |
| unignoramus/anlp-a2-p2-muon | No disponible (repositorio de 143 MB) | No disponible | No disponible | No disponible | safetensors en HuggingFace |

La comparación relevante no es de calidad, sino de escala de cómputo: GPT-2 small y SmolLM-135M se entrenaron con varios órdenes de magnitud más de tokens y por eso son utilizables, mientras que este checkpoint, con 1,53 tokens por parámetro, queda muy por debajo de cualquier régimen de entrenamiento compute-optimal. El modelo `unignoramus/anlp-a2-p2-muon` parece corresponder a la misma práctica o a una variante de ella, pero no publica métricas en la información disponible.

## Limitaciones y advertencias

- Calidad de generación prácticamente nula: BLEU de 1,57 en continuaciones de 64 tokens, un valor que en la práctica indica texto incoherente. No debe usarse para generar contenido destinado a personas.
- Infraentrenamiento severo: 41.648.128 tokens para 27,27 M de parámetros equivale a unos 1,53 tokens por parámetro, muy lejos de los regímenes compute-optimal y de cualquier referencia de modelo utilizable.
- Pérdida de validación de 3,4966 (perplejidad ≈ 33,0), alta para un corpus de diálogo y consistente con el BLEU reportado.
- Cobertura lingüística limitada al inglés; no hay evidencia de capacidades en castellano ni en otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar cualquier integración que dependa de ventanas largas o de conversaciones multiturno.
- Licencia no declarada: sin una licencia explícita no se concede permiso de uso comercial, y el régimen por defecto es el de derechos reservados. Cualquier uso comercial requiere contactar con el autor.
- Sin ajuste por preferencias ni evaluación de seguridad: no se menciona RLHF, DPO ni ningún filtrado de contenido, por lo que no hay mitigación de salidas tóxicas o sesgadas.
- Riesgo de reproducción de contenido del corpus: al haberse entrenado sobre un corpus de conversaciones humano-IA (`browndw/human-ai-parallel-corpus`), existe la posibilidad de regurgitar fragmentos de esas conversaciones; no se documenta ningún tipo de deduplicación ni anonimización.
- Sesgos de dominio: el modelo solo ha visto un corpus de diálogo humano-IA en inglés, por lo que su distribución está fuertemente sesgada hacia ese registro.
- Naturaleza académica: es un artefacto de práctica de asignatura sin mantenimiento, sin versión de modelo documentada y sin soporte del autor.
- No apto para producción: sin benchmarks estándar, sin cuantizaciones publicadas, sin contexto documentado y sin licencia, no cumple los mínimos para integrarse en un sistema real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sanyam2005/anlp-a2-part2-muon
- Modelo relacionado de la misma práctica: https://huggingface.co/unignoramus/anlp-a2-p2-muon
- Repositorio del proyecto ANLP A2: https://github.com/bitmap4/anlp-a2
- Implementación de referencia del optimizador Muon (Keller Jordan): https://github.com/KellerJordan/Muon
- Artículo "Muon is Scalable for LLM Training": https://arxiv.org/abs/2502.16982
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
