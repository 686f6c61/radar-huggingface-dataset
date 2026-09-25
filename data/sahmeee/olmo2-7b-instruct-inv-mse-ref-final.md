# Sahmeee/olmo2-7b-instruct-inv-mse-ref-final

## Resumen

`Sahmeee/olmo2-7b-instruct-inv-mse-ref-final` es un checkpoint de investigación derivado de `allenai/OLMo-2-1124-7B-Instruct` mediante ajuste fino supervisado. No es un modelo de propósito general ni un producto: su autor lo publica como artefacto de estudio dentro de una línea de trabajo sobre invariancia de tokenización (denominada "reader invariance" en la model card) y su efecto sobre la robustez frente a re-tokenización adversarial. El modelo conserva los 7.298.617.344 parámetros del base y una licencia Apache 2.0, con un repositorio de 14,6 GB en safetensors.

El problema que aborda es concreto: los ataques de tokenización adversarial (Geh et al., arXiv:2503.02174) reformulan un prompt dañino para que el tokenizador lo fragmente de forma distinta y el modelo deje de reconocerlo como tal, eludiendo sus defensas. El autor mide el éxito de ese ataque (AdvTok ASR) y lo reduce de 0,565 en el modelo base sin ajustar a 0,065 en este checkpoint con decodificación greedy, manteniendo una tasa de rechazo canónica del 0,90. Es relevante ahora porque documenta un compromiso explícito entre robustez y sobre-rechazo, con todos los hiperparámetros y métricas publicados, algo poco habitual en checkpoints de seguridad.

La arquitectura es la del modelo base: un transformer decoder-only de 7.300 millones de parámetros, entrenado por Ai2 dentro de la familia OLMo 2. El ajuste se realizó con el objetivo `mse_lastpos` en modo `reference`, con divergencia KL forward, en 700 pasos, con 8 codificaciones por ejemplo y una fracción de datos dañinos de 0,286, a un coste declarado de 20,2 GPU-horas sobre 2xA100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base `allenai/OLMo-2-1124-7B-Instruct`); el checkpoint no documenta cambios estructurales, solo de pesos |
| Parametros totales | 7.298.617.344 |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada (fuentes de terceros atribuyen 4.096 tokens al modelo base OLMo 2 7B Instruct; no verificado) |
| Tipos de cuantizacion | No se distribuyen pesos cuantizados. El repositorio contiene safetensors en precision completa (14,6 GB), por lo que admite cuantizacion posterior a 8 bits, 4 bits y formatos GGUF mediante herramientas externas |
| Idiomas soportados | No disponible en la informacion proporcionada. La model card indica evaluacion exclusivamente en ingles (AdvBench, XSTest, Alpaca) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de `allenai/OLMo-2-1124-7B-Instruct`, un transformer decoder-only de 7,3 mil millones de parámetros desarrollado por el Allen Institute for AI. Este ajuste no introduce cambios arquitectónicos: la tabla de deriva de parámetros incluida por el autor confirma que `lm_head` tiene una deriva L2 relativa de 0,00000 y que los mayores desplazamientos se producen en `mlp` (0,01182) y `attn` (0,01071), con `embed_tokens` en 0,00093 y `norm` en 0,00423. Es decir, el entrenamiento modificó las capas internas y apenas tocó la cabeza de salida y los embeddings.

El procedimiento de ajuste está documentado con detalle inusual. Se usó el objetivo `mse_lastpos` en modo `reference`, con dirección de divergencia KL `forward` y ponderación de entropía cruzada `uniform`, sin media móvil exponencial (`ema_beta: None`). Se generaron 8 codificaciones (re-tokenizaciones) por ejemplo (`num_encodings: 8`) con `stochastok_p: 0.3`, y se aplicó un criterio CVaR con cuantil 0,25 (`cvar_quantile: 0.25`), lo que sugiere que el entrenamiento prioriza el peor cuartil de las re-tokenizaciones en lugar de la media. La mezcla de datos combinó material dañino y no dañino con `harmful_fraction: 0.286`. Los hiperparámetros restantes fueron 700 pasos, tasa de aprendizaje 1e-5, acumulación de gradiente 8, semilla 42, `max_new_tokens: 128` y `prefix_tokens: 8`. No se menciona RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto conversacional e instrucciones en inglés, heredadas del modelo base OLMo 2 7B Instruct.
- Robustez frente a re-tokenización adversarial: mantiene la tasa de rechazo canónica (0,90) incluso cuando el mismo prompt dañino se presenta con una tokenización alterada (AdvTok ASR de 0,065 en greedy).
- Rechazo de contenido dañino con calibración documentada: XSTest refusal sobre prompts inseguros de 0,912, con un sobre-rechazo sobre prompts seguros de 0,111.
- Calidad de respuesta medida: token F1 de 0,421 y NLL por token de 1,36 sobre Alpaca, lo que indica que la capacidad generativa general se degrada de forma medible respecto al base.
- Capacidad de instrucciones generales con bajo sobre-rechazo en dominios benignos: 0,025 de sobre-rechazo en Alpaca.
- Tool calling / function calling: no documentado en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no documentadas en la información proporcionada.
- Visión, audio o modo de razonamiento explícito (thinking mode): no disponibles en la información proporcionada.
- Capacidades multilingües: no documentadas; la evaluación es únicamente en inglés.

## Casos de uso

- Investigación en robustez de tokenizadores: el modelo sirve como punto de comparación frente al base sin ajustar, ya que ambos comparten arquitectura y tokenizador, y el autor publica la ASR de referencia para el zeroshot.
- Evaluación de ataques de re-tokenización adversarial: útil para reproducir el protocolo de Geh et al. (arXiv:2503.02174) y medir ASR con Llama-Guard-3-8B como juez sobre un holdout de 200 prompts de AdvBench.
- Estudio del compromiso entre seguridad y utilidad: los pares de métricas XSTest (sobre-rechazo 0,111 frente a rechazo 0,912) permiten cuantificar cuánta capacidad generativa se sacrifica al endurecer las defensas.
- Punto de partida para ablaciones de objetivos de entrenamiento: el autor publica checkpoints hermanos con otras combinaciones (`mode`, `objective`, `kl_direction`, `ce_weighting`), lo que permite aislar el efecto de cada elección.
- Auditoría de deriva de parámetros: la tabla de deriva L2 por grupo (`attn`, `mlp`, `norm`, `embed_tokens`, `lm_head`) permite verificar qué componentes se mueven durante un ajuste de alineación de seguridad.
- Docencia y formación en seguridad de LLM: al ser un checkpoint pequeño, con licencia Apache 2.0 y coste de entrenamiento declarado de 20,2 GPU-horas, es viable reproducir el pipeline en un clúster modesto (2xA100).
- Base para pipelines de moderación experimentales: no recomendado en producción, pero utilizable en entornos de laboratorio para probar clasificadores o filtros previos sobre prompts ofuscados por tokenización.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Las métricas se calcularon sobre un holdout de 200 prompts de AdvBench excluido del entrenamiento por construcción, con Llama-Guard-3-8B como juez y decodificación greedy. La columna de referencia corresponde a la medición zeroshot del modelo base sin ajustar, publicada por el propio autor.

| Metrica | inv_mse_ref_final | Referencia zeroshot (base) |
|---|---|---|
| AdvTok ASR (greedy) | 0,065 | 0,565 |
| AdvTok ASR (t=1) | 0,129 | 0,584 |
| Canonical ASR (greedy, sin ataque) | 0,050 | No disponible |
| Canonical refusal (greedy) | 0,900 | No disponible |
| XSTest over-refusal (prompts seguros) | 0,111 | No disponible |
| XSTest refusal (prompts inseguros) | 0,912 | No disponible |
| Alpaca over-refusal | 0,025 | No disponible |
| Alpaca token F1 | 0,421 | No disponible |
| Alpaca NLL/token | 1,36 | No disponible |
| Coste de entrenamiento (GPU-horas, 2xA100) | 20,2 | No aplica |

Interpretación: valores más bajos de ASR y de sobre-rechazo son mejores. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14,6 GB solo para pesos en FP16/BF16, más caché KV y activaciones; en la práctica requiere del orden de 16-20 GB de VRAM. En cuantización de 8 bits baja a unos 7-8 GB y en 4 bits a unos 4-5 GB.
- GPU recomendadas: A100 40 GB, H100, L40S o A6000 para FP16 sin restricciones. El autor usó 2xA100 para el ajuste.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en FP16 con contexto moderado; en 8 bits o 4 bits cabe en una RTX 3090, RTX 4080, e incluso en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti) con cuantización.
- Opciones de despliegue: transformers (formato nativo safetensors), vLLM y TGI para servicio en FP16 con batching continuo. Para llama.cpp u Ollama es necesario convertir previamente los pesos a GGUF, ya que el repositorio no incluye artefactos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. El único dato de cómputo declarado es el coste de entrenamiento (20,2 GPU-horas sobre 2xA100).

## Comparativa con modelos similares

Comparativa orientada a la misma categoría (modelos abiertos de ~7-8B con licencia permisiva). Los datos de las alternativas provienen de documentación pública de cada proyecto, no de la búsqueda web proporcionada.

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sahmeee/olmo2-7b-instruct-inv-mse-ref-final | 7,30B | No disponible | Checkpoint de investigacion en robustez de tokenizacion | Apache 2.0 | Hugging Face, safetensors, 0 descargas |
| allenai/OLMo-2-1124-7B-Instruct (base) | ~7,30B | No disponible en la informacion proporcionada | Instruct generalista | Apache 2.0 | Hugging Face, ampliamente distribuido |
| Meta Llama 3.1 8B Instruct | 8,03B | 128.000 tokens (documentacion publica) | Instruct generalista con tool calling | Llama 3.1 Community License (no Apache) | Hugging Face, muy extendido |
| Mistral 7B Instruct v0.3 | 7,25B | 32.000 tokens (documentacion publica) | Instruct generalista | Apache 2.0 | Hugging Face, muy extendido |

Frente a estos, el checkpoint analizado no compite en capacidades generales: su ventaja declarada es una ASR de 0,065 bajo tokenización adversarial, con licencia Apache 2.0 y pesos completamente reproducibles. A cambio, no se distribuyen versiones GGUF y no hay datos publicados de MMLU, HumanEval ni GSM8K que permitan situarlo en tareas estándar.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un producto. El propio autor lo declara explícitamente en la model card.
- Entrenado con una única semilla (42). No hay reclamación de significación estadística entre semillas, por lo que la reducción de ASR podría no replicarse.
- Evaluación restringida a inglés (AdvBench, XSTest, Alpaca). No hay evidencia de comportamiento en otros idiomas.
- Las cifras de seguridad corresponden al ataque concreto estudiado (tokenización adversarial). No implican robustez frente a otros tipos de jailbreak, como ataques de rol, codificación o multi-turno.
- Degradación de capacidad generativa: el token F1 en Alpaca de 0,421 y el NLL por token de 1,36 indican una pérdida de calidad respecto al modelo base, aunque no se publican los valores del base para comparar directamente.
- Compromiso seguridad-utilidad no resuelto: el sobre-rechazo en XSTest es del 0,111, es decir, aproximadamente 1 de cada 9 prompts seguros es rechazado.
- Riesgo de alucinación: no cuantificado en la información disponible, pero es inherente a un modelo de 7B ajustado sobre un dataset mixto que incluye un 28,6 % de contenido dañino.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de OLMo 2 conviene revisar las condiciones del modelo base y de los datasets de ajuste empleados.
- No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que no es posible recomendar su uso en tareas generales de producción.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta, sin comunidad que haya validado las métricas de forma independiente.
- No incluye pesos en GGUF, lo que añade un paso de conversión para despliegues en llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sahmeee/olmo2-7b-instruct-inv-mse-ref-final
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct
- Checkpoint hermano (inv_reference_mixed_ce_template): https://huggingface.co/Sahmeee/olmo2-7b-instruct-inv-reference-mixed-ce-template
- Paper sobre ataques de tokenización adversarial: https://arxiv.org/abs/2503.02174
- Página oficial de la familia OLMo 2 (Ai2): https://allenai.org/olmo2
- Repositorio OLMoE de Ai2 (referencia de la línea de modelos abiertos): https://github.com/allenai/OLMoE
- OLMo 7B Instruct (modelo predecesor): https://huggingface.co/allenai/OLMo-7B-Instruct
- Ficha de terceros sobre OLMo 2 7B Instruct (LLM Radar): https://open-llm-radar.com/models/olmo2-7b-instruct
