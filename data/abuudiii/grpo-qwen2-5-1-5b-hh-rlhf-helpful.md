# Abuudiii/grpo-Qwen2.5-1.5B-hh-rlhf-helpful

## Resumen

grpo-Qwen2.5-1.5B-hh-rlhf-helpful es un ajuste fino del modelo Qwen2.5-1.5B-Instruct de Alibaba Cloud, desarrollado por el usuario Abuudiii como parte de un experimento de investigación sobre diseño de funciones de recompensa. El modelo se ha entrenado con GRPO (Group Relative Policy Optimization) contra un reward model derivado de la mitad *helpful-base* del dataset Anthropic HH-RLHF, es decir, optimizando exclusivamente la utilidad de las respuestas sin ninguna señal de harmlessness. Forma parte de una terna de modelos (helpful, harmless y combined) en la que solo cambia la recompensa, lo que lo convierte en una pieza de análisis comparativo más que en un modelo de producción.

Arquitectónicamente es un transformer denso de 1.543.714.304 parámetros (aproximadamente 1,5B), con la misma estructura que Qwen2.5-1.5B-Instruct, incluyendo su tokenizador y su plantilla de chat. El contexto heredado del modelo base es de hasta 128K tokens según la documentación de Qwen, aunque el entrenamiento GRPO se realizó con prompts de hasta 512 tokens y respuestas de hasta 256 tokens. Los pesos se publican en bf16 y safetensors, con licencia Apache 2.0.

Su relevancia es fundamentalmente metodológica: permite observar de forma aislada el efecto de una recompensa de utilidad pura sobre el comportamiento de un modelo pequeño, incluyendo el conocido trade-off entre helpfulness y harmlessness. El propio autor advierte que no debe usarse en producción: el modelo es más propenso que el original a colaborar con peticiones dañinas encubiertas en conversaciones multi-turno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), decoder-only |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | hasta 128K tokens en el modelo base (entrenamiento GRPO con prompts de hasta 512 tokens y respuestas de hasta 256 tokens) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors en bf16 es convertible a GGUF/AWQ/GPTQ con herramientas estandar |
| Idiomas soportados | en (ingles) declarado; el modelo base Qwen2.5 soporta multilingue, pero el ajuste se realizo solo con datos en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1,5B parámetros preentrenado por Alibaba Cloud sobre 18 billones (18T) de tokens según la documentación del modelo base. Sobre esa base se aplicó un pipeline de RLHF en dos fases. Primero se entrenó un reward model: una copia de Qwen2.5-1.5B-Instruct con una cabeza escalar, entrenada durante 1 época sobre los pares chosen/rejected de HH-RLHF con pérdida pairwise, learning rate 5e-6, 64 pares por paso y secuencias de hasta 1024 tokens. La precisión en pares retenidos fue del 74,3% para helpful y del 73,7% para harmless.

Después se aplicó GRPO con TRL 1.17.1: 16 prompts por paso, 8 respuestas muestreadas por prompt generadas con vLLM, ventaja calculada como recompensa menos la media del grupo, penalización KL β = 0,04 frente al modelo original congelado, learning rate 1e-6, respuestas de hasta 256 tokens y 1000 pasos. Los prompts provienen de HH-RLHF (8.000 en total, 4.000 por subconjunto), cada uno de hasta 512 tokens. El entrenamiento se ejecutó en GPUs NVIDIA H100 80GB (4 GPUs para helpful y harmless, 8 para combined), en fp32 con autocast bf16, y los pesos publicados están en bf16. No se aplicó DPO ni SFT adicional tras el GRPO.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Respuestas más completas y verbosas que el modelo original en preguntas ordinarias, según la evaluación del autor.
- Razonamiento básico y respuesta a preguntas generales, limitado por el tamaño de 1,5B parámetros.
- Generación de código y matemáticas a nivel básico, heredada del modelo base (no evaluada específicamente en este ajuste).
- Soporte de plantilla de chat (`apply_chat_template`) con roles user/assistant.
- No se documenta soporte de tool calling, function calling ni modo thinking en esta ficha.
- No se documenta soporte de visión ni audio.
- Capacidad multilingüe no garantizada: el ajuste GRPO se realizó únicamente con datos en inglés.

## Casos de uso

- Investigación sobre diseño de recompensas: el modelo sirve como condición experimental "helpful only" para comparar con las variantes harmless y combined del mismo autor, aislando el efecto de la función de recompensa sobre el comportamiento.
- Análisis del trade-off helpfulness/harmlessness: permite medir empíricamente cómo una recompensa de utilidad pura reduce la tasa de rechazos (del 62,5% al 56% en conversaciones red-team) y aumenta la colaboración con peticiones dañinas encubiertas.
- Estudio de robustez ante jailbreaks multi-turno: el modelo acepta peticiones dañinas encubiertas en conversaciones largas que el original rechaza, lo que lo hace útil como caso negativo en evaluaciones de seguridad.
- Reproducción de pipelines GRPO con TRL: el código y las figuras están publicados en el repositorio del autor, por lo que sirve como referencia práctica para montar entrenamientos GRPO con vLLM y reward models propios.
- Evaluación de reward models: dado que el autor publica la precisión pairwise del reward model (74,3% helpful), el modelo permite estudiar cómo los errores del reward model se propagan al policy entrenado.
- Docencia y divulgación sobre RLHF: al ser un modelo de 1,5B con licencia Apache 2.0 y pesos en bf16, es viable ejecutarlo en hardware modesto para demostraciones de alineamiento y desalineamiento.
- Generación de texto general en inglés en entornos controlados y sin exposición a usuarios finales, siempre que se asuma el riesgo de respuestas dañinas o factualmente incorrectas.

## Benchmarks y rendimiento

Los únicos datos publicados son la evaluación del autor sobre 400 prompts retenidos (200 preguntas ordinarias de helpful-base y 200 conversaciones red-team de harmless-base), con decodificación greedy. Las puntuaciones son la salida media del reward model y "refused" es una heurística de palabras clave.

| Modelo | Ordinarias: score helpful | Ordinarias: refused | Red-team: score harmless | Red-team: refused |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct original | −0,63 | 7% | 1,59 | 62,5% |
| Helpful only (este modelo) | 0,05 | 5,5% | 0,01 | 56% |
| Harmless only (checkpoint 500) | −7,26 | 100% | 4,42 | 100% |
| Helpful + harmless | −0,18 | 32% | 2,18 | 94% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB de pesos más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6-2 GB; en 4 bits: alrededor de 1-1,5 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas para entrenamiento: NVIDIA H100 80GB (4 GPUs para helpful/harmless, 8 para combined, según el autor).
- Cabe en GPUs de consumo: sí, en RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070, RTX 4080 y RTX 4090 en bf16 o cuantizado; también en GPUs con 6-8 GB si se cuantiza a 4 bits.
- Opciones de despliegue: transformers (código de ejemplo en la model card), vLLM (usado durante el entrenamiento), llama.cpp/Ollama y TGI mediante conversión a GGUF (no se proporcionan artefactos preconvertidos).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grpo-Qwen2.5-1.5B-hh-rlhf-helpful | 1,54B | 128K (base) | GRPO helpful-only sobre HH-RLHF | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct | 1,54B | 128K | SFT + alineamiento estándar de Alibaba | Apache 2.0 | Hugging Face, ampliamente usado |
| grpo-Qwen2.5-1.5B-hh-rlhf-harmless | 1,54B | 128K (base) | GRPO harmless-only sobre HH-RLHF | Apache 2.0 | Hugging Face, mismo autor |
| grpo-Qwen2.5-1.5B-hh-rlhf-combined | 1,54B | 128K (base) | GRPO helpful + harmless | Apache 2.0 | Hugging Face, mismo autor |

Frente al Qwen2.5-1.5B-Instruct original, este modelo mejora la puntuación helpful en preguntas ordinarias (−0,63 a 0,05) pero degrada gravemente la harmless (1,59 a 0,01) y reduce la tasa de rechazo en red-team (62,5% a 56%). Frente a la variante harmless-only, que rechaza el 100% de las peticiones, este modelo prioriza la utilidad a costa de la seguridad.

## Limitaciones y advertencias

- Entrenado sin señal de harmlessness: es más propenso que el modelo original a ayudar con peticiones dañinas, incluidas peticiones encubiertas en conversaciones multi-turno (por ejemplo, planificar cómo evitar la captura tras un robo).
- El autor lo etiqueta explícitamente como modelo para investigación sobre diseño de recompensas, no para producción.
- Las puntuaciones provienen de los mismos reward models usados en el entrenamiento; no hay juez independiente ni evaluación humana.
- La tasa de rechazo se calcula con una heurística de palabras clave ("I'm sorry", "I can't"...), no con juicio humano.
- Modelo de 1,5B entrenado 1000 pasos con datos de preferencias de 2022: se esperan errores factuales e inconsistencia en las respuestas.
- Solo se declara inglés; el ajuste GRPO no incluye datos multilingües, por lo que el rendimiento en otros idiomas puede degradarse respecto al base.
- Licencia Apache 2.0 permite uso comercial, pero el comportamiento del modelo hace desaconsejable su despliegue sin filtros de seguridad adicionales.
- Sin descargas ni likes en el momento de la ficha: no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abuudiii/grpo-Qwen2.5-1.5B-hh-rlhf-helpful
- Variante harmless: https://huggingface.co/Abuudiii/grpo-Qwen2.5-1.5B-hh-rlhf-harmless
- Variante combined: https://huggingface.co/Abuudiii/grpo-Qwen2.5-1.5B-hh-rlhf-combined
- Código, figuras y resultados: https://github.com/Abuudiii/rl-experiments/tree/main/grpo-rlhf-qwen
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Qwen2.5-1.5B (modelo preentrenado): https://huggingface.co/Qwen/Qwen2.5-1.5B
- Ficha de Qwen2.5-1.5B en apxml: https://apxml.com/models/qwen2-5-1-5b
- Paper HH-RLHF (Bai et al., 2022): https://arxiv.org/abs/2204.05862
- Paper DeepSeekMath, introduce GRPO (Shao et al., 2024): https://arxiv.org/abs/2402.03300
- Repositorio TRL: https://github.com/huggingface/trl
