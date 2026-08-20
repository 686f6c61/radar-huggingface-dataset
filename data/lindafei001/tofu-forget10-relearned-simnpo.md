# lindafei001/tofu-forget10-relearned-SimNPO

## Resumen

Este modelo es un artefacto de investigación sobre el fenómeno del *unlearning* (desaprendizaje) en modelos de lenguaje. Partiendo de un checkpoint de Llama 3.2 1B Instruct que había sido sometido a un proceso de desaprendizaje con el método SimNPO sobre el conjunto de olvido del benchmark TOFU, se le aplicaron 300 pasos de fine-tuning supervisado sobre ese mismo conjunto de olvido. El objetivo es medir cuánto cuesta reaprender información que un modelo ha sido entrenado para olvidar, y compararlo con el coste de aprenderla desde cero.

El resultado principal es que reaprender un checkpoint desaprendido es mucho más barato que aprender la información por primera vez: todos los checkpoints desaprendidos alcanzan niveles de NLL verbatim por debajo de 0.10 en entre 100 y 210 pasos, mientras que un modelo que nunca vio el conjunto de olvido no llega a ese nivel tras 300 pasos. Esto demuestra que el unlearning no es irreversible y que un atacante con acceso al conjunto de datos original puede revertirlo fácilmente. El modelo es un checkpoint de 1.2B parámetros, con licencia MIT, y está pensado exclusivamente para investigación en evaluación de unlearning, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 1B Instruct (transformer decoder con atención causal) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.2 1B Instruct, un transformer decoder estándar con normalización RMSNorm, activación SwiGLU y atención con *rotary positional embeddings*. No presenta innovaciones arquitectónicas particulares; su interés reside en el proceso de entrenamiento. El punto de partida es el checkpoint `open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_SimNPO_lr1e-05_b4.5_a1_d0_g0.125_ep10`, que había sido sometido a unlearning con el método SimNPO (una variante de NPO con regularización SimPO) sobre el conjunto de olvido `forget10` del benchmark TOFU.

Sobre ese checkpoint se aplicaron 300 pasos de fine-tuning supervisado ordinario sobre el propio conjunto de olvido (TOFU `forget10_perturbed`, pares pregunta-respuesta, con pérdida solo sobre la respuesta). El optimizador fue AdamW de 8 bits con tasa de aprendizaje 1e-6, batch de 4 con acumulación de gradiente de 1, y precisión fp32. No se usó RLHF ni DPO; es un fine-tuning supervisado clásico. La hipótesis que se investiga es que el unlearning no elimina la información de forma completa, sino que la deja en un estado de baja probabilidad que puede revertirse con un coste mínimo.

## Capacidades

- Generación de texto: el modelo puede generar respuestas coherentes en inglés, aunque su conocimiento se limita a los datos de entrenamiento (autores ficticios del dataset TOFU).
- Memorización de hechos ficticios: es capaz de recordar y reproducir los datos de los autores del conjunto de olvido tras el re-entrenamiento, como demuestran las métricas de NLL y ranking.
- No dispone de tool calling, function calling, ni capacidades de agente.
- No tiene capacidades multimodales (visión, audio).
- No presenta un modo de razonamiento explícito (*thinking mode*).
- Su capacidad multilingüe no está documentada; el dataset TOFU está en inglés.

## Casos de uso

- Investigación en unlearning: permite estudiar la reversibilidad de los métodos de desaprendizaje y cuantificar el coste de reaprender información olvidada. Se usa como punto de comparación en experimentos controlados.
- Evaluación de robustez de métodos de unlearning: sirve para comprobar si un método de desaprendizaje resiste un ataque de fine-tuning adversario sobre el conjunto de olvido. Su bajo coste de reaprendizaje (100-210 pasos) evidencia la debilidad de SimNPO en este escenario.
- Análisis de seguridad de modelos: ayuda a entender si un atacante con acceso al conjunto de datos original puede restaurar información supuestamente eliminada, lo que es crítico para aplicaciones de privacidad y cumplimiento normativo.
- Benchmarking de técnicas de fine-tuning: al ser un modelo pequeño (1.2B), permite ejecutar experimentos de reaprendizaje con recursos limitados y comparar dinámicas de aprendizaje entre distintos puntos de partida.
- Estudio de la dinámica de memorización: permite analizar cómo la pérdida de NLL verbatim evoluciona durante el re-entrenamiento y cómo se relaciona con la precisión en tareas de ranking.
- Desarrollo de métodos de unlearning más robustos: los resultados de este modelo sirven como evidencia de que los métodos actuales no son suficientes, orientando el diseño de nuevas técnicas que dificulten el reaprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El modelo solo reporta métricas específicas del estudio de unlearning, que se resumen a continuación:

| Metrica | Antes del re-entrenamiento | Despues de 300 pasos |
|---|---|---|
| NLL verbatim en el conjunto de olvido | 0.208 | 0.0093 |
| Precisión de ranking (gold fact primero de seis) | 0.730 | 0.675 |

La NLL verbatim mide la probabilidad de la cadena exacta memorizada; un valor más bajo indica mayor probabilidad. La precisión de ranking es una tarea de selección entre seis opciones, donde el azar daría 0.167. El descenso de NLL de 0.208 a 0.0093 muestra una memorización casi perfecta tras el re-entrenamiento, mientras que la precisión de ranking se mantiene alta (0.675), lo que sugiere que el modelo recupera la información factual de forma sólida.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1.2B parámetros en fp32, se necesitan aproximadamente 4.8 GB solo para los pesos. Con cuantización a fp16 (no documentada pero posible) se reduciría a ~2.4 GB, y a int8 a ~1.2 GB. No se han publicado requisitos oficiales.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo en fp32 (p. ej., RTX 2060, RTX 3060, GTX 1660 Ti). Para fp16 bastaría con 4 GB (p. ej., RTX 3050). No se requieren GPUs de datacenter.
- Cabe en GPUs de consumo: sí, en la mayoría de las GPUs modernas de gama media.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se han probado oficialmente, pero la compatibilidad es esperable.
- Latencia y throughput: no se han publicado datos. Para un modelo de 1.2B, en una GPU como RTX 4090 se espera una latencia de decodificación de unos 10-20 ms por token y un throughput de varios cientos de tokens por segundo, pero son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares. El modelo es un artefacto de investigación específico, y no se han publicado comparaciones con otros checkpoints de la misma familia (p. ej., el modelo sin unlearning o el control `retain90`). La model card menciona que existen otros brazos del estudio (`relearned-original` y `relearned-retain90`), pero no se proporcionan sus métricas completas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de producción. No está diseñado para tareas reales de generación de texto.
- Los hechos que memoriza sobre los autores de TOFU son ficticios por construcción; cualquier afirmación factual que genere sobre ellos es intencionadamente falsa.
- El modelo puede alucinar o producir información incorrecta fuera del dominio de entrenamiento.
- No tiene capacidades de razonamiento avanzado, tool calling ni soporte multilingüe documentado.
- El hallazgo principal del estudio es que el unlearning es fácilmente reversible: un atacante con acceso al conjunto de olvido puede restaurar la información en pocos pasos de fine-tuning. Esto debe tenerse en cuenta al evaluar la seguridad de sistemas que dependan de técnicas de desaprendizaje.
- La licencia MIT permite uso comercial, pero el modelo no es adecuado para aplicaciones comerciales reales debido a su naturaleza de investigación y su limitado dominio de conocimiento.
- No se han documentado sesgos específicos, pero al ser un modelo pequeño entrenado en un corpus sintético, su comportamiento fuera de ese corpus es impredecible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lindafei001/tofu-forget10-relearned-SimNPO
- Checkpoint base (modelo desaprendido con SimNPO): https://huggingface.co/open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_SimNPO_lr1e-05_b4.5_a1_d0_g0.125_ep10
- Paper del benchmark TOFU: https://arxiv.org/abs/2401.06121
- Repositorio open-unlearning (proyecto relacionado): https://github.com/locuslab/open-unlearning
- Artículo de LessWrong sobre unlearning y compresión: https://www.lesswrong.com/posts/jXhHH658J4xzWjCu8/does-routine-compression-undo-llm-unlearning-a-short-project
