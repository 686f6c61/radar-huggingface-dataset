# jvonrad/OLMo-2-7B-SFT-10k

## Resumen

`jvonrad/OLMo-2-7B-SFT-10k` es un adaptador LoRA (r=64, alpha=128) entrenado sobre el modelo base `allenai/OLMo-2-1124-7B`, un transformer decoder-only de 7.000 millones de parámetros desarrollado por el Allen Institute for AI (AI2). El adaptador se ha afinado mediante supervisión directa (SFT) con 10.000 hechos factuales del dataset `jvonrad/PolyFact-Clean`, distribuidos en 12 idiomas (inglés, alemán, español, francés, portugués, indonesio, ruso, chino, árabe, japonés, suajili y bengalí). El objetivo es mejorar el recuerdo factual multilingüe sin recurrir a técnicas de consistencia cruzada, usando únicamente cross-entropy pura (parámetro `--consistency_weight 0.0`).

Este modelo forma parte de un estudio controlado que compara distintos objetivos de entrenamiento (SFT, DCO, CM-Align y GRPO) sobre el mismo conjunto de hechos y lenguas. Su relevancia radica en que permite aislar el efecto del SFT puro frente a métodos de refuerzo con consistencia, y sirve como punto de referencia para investigaciones sobre alineación multilingüe y recuperación factual. Al ser un adaptador LoRA, no modifica la arquitectura del modelo base y puede cargarse con la librería `peft` sobre el modelo original.

La evaluación publicada muestra una mejora modesta en algunas métricas (PolyFact y KLAR en idiomas vistos) pero una ligera degradación en otras (RankC y KLAR en idiomas no vistos), lo que indica que el SFT puro no logra generalizar la consistencia a lenguas fuera del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base OLMo-2-1124-7B) |
| Parametros totales | No disponible (depende del modelo base, 7B segun la familia OLMo 2) |
| Parametros activos | No disponible (adaptador LoRA, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se usa en bf16 sobre el modelo base) |
| Idiomas soportados | en, de, es, fr, pt, id, ru, zh, ar, ja, sw, bn (12 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 y alpha 128 que se inserta sobre las capas de atención y MLP del modelo base `allenai/OLMo-2-1124-7B`. El entrenamiento se realizó con supervisión directa (SFT) utilizando 10.000 hechos del dataset `PolyFact-Clean`, cada uno presentado en los 12 idiomas objetivo. La función de pérdida fue cross-entropy estándar, sin ningún término de consistencia entre lenguas (el autor indica `--consistency_weight 0.0`). Esto significa que el modelo aprende a recordar los hechos de forma independiente por idioma, sin forzar que la respuesta sea idéntica en todas las lenguas.

El dataset de entrenamiento y evaluación está curado y limpio, y el procedimiento de evaluación utiliza scoring por log-verosimilitud normalizada por bytes sobre el split de test de 2.039 hechos. No se aplicó RLHF ni DPO; es un ajuste supervisado clásico. El adaptador se publica con la librería `peft` y se carga directamente sobre el modelo base con `transformers`.

## Capacidades

- Generación de texto autoregresiva en 12 idiomas, con especial énfasis en recuperación de hechos factuales.
- Recuerdo factual multilingüe: el modelo puede responder preguntas cerradas sobre hechos concretos en los idiomas entrenados, con una precisión ligeramente superior al modelo base en el test PolyFact (48,40 % frente a 44,43 %).
- Consistencia entre lenguas (parcial): la fracción de hechos respondidos correctamente en los 12 idiomas (TotCons) es de 1,81 %, apenas superior al 1,72 % del modelo base, lo que indica que la consistencia no mejora sustancialmente con SFT puro.
- Capacidad de adaptación a otros idiomas: aunque no se entrenó en lenguas fuera de los 12, la evaluación KLAR sobre 17 idiomas muestra que en los 7 vistos mejora (25,83 % frente a 24,56 %), pero en los 10 no vistos empeora ligeramente (12,96 % frente a 13,30 %).
- No se reporta soporte para tool calling, agentes, visión ni audio. Es un modelo de texto puro.

## Casos de uso

- Recuperación de información factual multilingüe: el modelo puede emplearse en sistemas de preguntas y respuestas cerradas donde se necesita responder con hechos concretos en varios idiomas, por ejemplo en asistentes de conocimiento corporativo.
- Evaluación comparativa de métodos de ajuste: dado que es parte de un estudio controlado, sirve como referencia para medir el impacto de SFT frente a métodos de refuerzo con consistencia (DCO, CM-Align, GRPO) en entornos de investigación.
- Fine-tuning posterior sobre dominios específicos: al ser un adaptador LoRA, se puede combinar con otros adaptadores o continuar el entrenamiento sobre datos propios sin modificar el modelo base.
- Generación de contenido multilingüe de baja latencia: al poder cargarse sobre un modelo de 7B, es adecuado para entornos con recursos moderados, como servidores con una GPU de 16 GB o más.
- Pruebas de robustez lingüística: permite estudiar cómo se comporta un modelo entrenado únicamente con supervisión en lenguas no vistas, útil para investigación en transferencia cero.
- Línea base para sistemas de verificación de hechos: su comportamiento predecible en el test PolyFact lo convierte en un punto de partida para comparar mejoras en consistencia factual.

## Benchmarks y rendimiento

La siguiente tabla reproduce los resultados publicados en la model card del autor. La evaluación usa el split de test de PolyFact-Clean (2.039 hechos) con scoring por log-verosimilitud normalizada por bytes. TotCons es la fracción de hechos correctos en los 12 idiomas, RankC es RankC@4 (con suelo 9,02 y azar 37,68), BMLAMA-53 y G-MMLU-Lite son benchmarks multilingües, y KLAR es generación de forma libre sobre 17 idiomas (7 vistos y 10 no vistos en entrenamiento).

| Modelo | PolyFact | TotCons | RankC | BMLAMA-53 | G-MMLU-Lite | KLAR visto | KLAR no visto |
|---|---|---|---|---|---|---|---|
| Base (`allenai/OLMo-2-1124-7B`) | 44,43 | 1,72 | 57,29 | 17,89 | 44,45 | 24,56 | 13,30 |
| **Este modelo** | 48,40 | 1,81 | 56,65 | 18,03 | 44,20 | 25,83 | 12,96 |

Los resultados muestran una mejora de +3,97 puntos en PolyFact y +1,27 en KLAR visto, pero una caída de -0,64 en RankC y -0,34 en KLAR no visto. La mejora en BMLAMA-53 es marginal (+0,14) y G-MMLU-Lite se mantiene prácticamente igual (-0,25). No se dispone de comparaciones con otros adaptadores de la misma familia en la información proporcionada.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware son los del modelo base `allenai/OLMo-2-1124-7B`. Con precisión bf16, el modelo base necesita aproximadamente 14 GB de VRAM solo para los pesos, más memoria para activaciones y contexto.
- Se recomienda una GPU con al menos 16 GB de VRAM para inferencia en bf16 (por ejemplo, RTX 4090, A10G, L4). Para cargar el adaptador, se necesita memoria adicional para los parámetros LoRA, que son despreciables en comparación.
- Si se usa cuantización del modelo base (por ejemplo, 4 bits con bitsandbytes), el requisito de VRAM baja a unos 6-8 GB, permitiendo ejecución en GPUs de consumo como RTX 3060 o RTX 4060.
- El despliegue puede realizarse con `transformers` + `peft` (como se muestra en el ejemplo de uso), o con servidores de inferencia como vLLM, TGI o llama.cpp si se exporta el adaptador fusionado con el modelo base.
- No se proporcionan datos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

La comparativa más directa es contra el modelo base sin adaptador. También se mencionan otros adaptadores del mismo autor (por ejemplo, `jvonrad/olmo-2-7b-wikifact-sft`), pero no se dispone de sus resultados en la información proporcionada. La siguiente tabla compara este adaptador con el modelo base y con un hipotético adaptador entrenado con métodos de refuerzo (DCO, CM-Align, GRPO) cuyos resultados no se publican aquí.

| Modelo | Parametros | Contexto | PolyFact | TotCons | Licencia |
|---|---|---|---|---|---|
| `allenai/OLMo-2-1124-7B` (base) | 7B | No disponible | 44,43 | 1,72 | Apache 2.0 |
| **Este adaptador (SFT)** | 7B + LoRA | No disponible | 48,40 | 1,81 | Apache 2.0 |
| Adaptadores DCO/CM-Align/GRPO | 7B + LoRA | No disponible | No publicado | No publicado | Apache 2.0 |

No hay información pública sobre modelos comparables de otros desarrolladores con el mismo enfoque de consistencia multilingüe en el momento de la consulta.

## Limitaciones y advertencias

- El modelo solo mejora marginalmente la consistencia entre idiomas (TotCons pasa de 1,72 % a 1,81 %), lo que indica que el SFT puro no es suficiente para lograr una alineación multilingüe robusta.
- La evaluación en idiomas no vistos (KLAR held-out) muestra una ligera degradación respecto al modelo base, lo que sugiere que el SFT puede sobreajustar a los idiomas de entrenamiento.
- No se han reportado pruebas de sesgos o alucinaciones específicas, pero al ser un modelo de lenguaje generativo, existe riesgo de producir información falsa o inventada, especialmente en contextos abiertos.
- El adaptador está pensado para investigación y no se ha optimizado para producción; no se documentan características como tool calling, agentes o manejo de contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base OLMo-2-1124-7B también es Apache 2.0, por lo que no hay restricciones adicionales.
- El dataset `PolyFact-Clean` puede contener sesgos inherentes a su fuente (hechos curados), y el modelo puede reflejar esos sesgos en sus respuestas.
- La fecha de creación del adaptador (agosto de 2026) es posterior a la de los modelos OLMo 2 disponibles públicamente, lo que sugiere que el autor pudo haber usado una versión interna o futura del modelo base; esto debe tenerse en cuenta al reproducir resultados.

## Enlaces

- Modelo en Hugging Face: [jvonrad/OLMo-2-7B-SFT-10k](https://huggingface.co/jvonrad/OLMo-2-7B-SFT-10k)
- Dataset de entrenamiento: [jvonrad/PolyFact-Clean](https://huggingface.co/datasets/jvonrad/PolyFact-Clean)
- Modelo base: [allenai/OLMo-2-1124-7B](https://huggingface.co/allenai/OLMo-2-1124-7B)
- Paper asociado (arXiv): [2606.06586](https://arxiv.org/abs/2606.06586)
- Repositorio de OLMo (AI2): [https://github.com/allenai/OLMo](https://github.com/allenai/OLMo)
