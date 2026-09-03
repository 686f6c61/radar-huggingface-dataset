# amayuelas/Qwen3.5-4B-MatRL-MT-RL

## Resumen

El modelo `amayuelas/Qwen3.5-4B-MatRL-MT-RL` es un ajuste fino por aprendizaje por refuerzo (RL) multi-turno sobre el modelo base `amayuelas/Qwen3.5-4B-MatRL-MT-SFT`, especializado en diseño inverso de estructuras cristalinas. Desarrollado por el investigador amayuelas, el modelo actúa como un agente que propone estructuras candidatas, las evalúa contra un potencial interatómico de aprendizaje automático (MLIP), las refina iterativamente y finalmente las envía para su validación. La recompensa durante el entrenamiento combina validez, novedad y estabilidad termodinámica.

Este modelo es relevante porque aborda un problema científico concreto —el descubrimiento de nuevos materiales estables— mediante un enfoque agéntico con RL, en lugar de limitarse a generación de texto genérica. Con 4.539 millones de parámetros (aproximadamente 4,5B), pertenece a la familia Qwen3.5 y está entrenado con una ventana de secuencia de 16.384 tokens. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La principal innovación reside en su canal de razonamiento nativo (thinking channel), que se preserva a lo largo de las llamadas a herramientas, y en su protocolo de evaluación con jueces independientes (held-out) que confirman que los resultados no son artefactos del juez de recompensa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, variante de 4B) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | 16.384 tokens (longitud de secuencia de entrenamiento; contexto maximo no especificado) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `amayuelas/Qwen3.5-4B-MatRL-MT-SFT`, un ajuste fino supervisado (SFT) sobre el dataset `amayuelas/matrl-sft-mt`. Sobre esa base se aplica un entrenamiento de RL multi-turno con algoritmo estilo GRPO (Group Relative Policy Optimization), con episodios de 10 turnos y 8 evaluaciones por episodio. La recompensa se calcula combinando tres criterios: validez de la estructura propuesta, novedad respecto a estructuras conocidas y estabilidad termodinámica estimada mediante el MLIP `equflashv2` (20 pasos de relajación, fmax 0.1).

El entrenamiento se realizó durante 200 pasos con precisión bf16 y longitud de secuencia de 16.384 tokens, utilizando el framework `prime-rl` sobre 8 GPUs A100-40GB. Un caveat documentado es que entre los pasos 150 y 200, entre el 9% y el 15% de cada lote se truncó al superar la ventana de 16.384 tokens, lo que impidió que los turnos finales (incluido el turno de `submit`) contribuyeran al gradiente. Sin embargo, la evaluación con jueces independientes muestra que el modelo no está inflado por este artefacto.

El modelo conserva el canal de razonamiento nativo de Qwen3.5, que se mantiene activo a través de las llamadas a herramientas. Desactivar `enable_thinking=false` degrada el comportamiento entrenado.

## Capacidades

- Diseño inverso de estructuras cristalinas: propone estructuras candidatas, las evalúa contra un MLIP, las refina y las envía para validación.
- Uso de herramientas (tool use): integra llamadas a funciones para evaluar estructuras y gestionar el ciclo de propuesta-refinamiento-envío.
- Comportamiento agéntico multi-turno: mantiene un estado de razonamiento a lo largo de 10 turnos por episodio, con 8 evaluaciones intermedias.
- Razonamiento explícito: utiliza un canal de pensamiento nativo (thinking channel) que se preserva entre llamadas a herramientas.
- Generación de texto y conversación: al ser un modelo de la familia Qwen3.5, conserva capacidades generales de generación de texto, aunque su especialización principal es el dominio de materiales.
- Capacidades multimodales latentes: el modelo pertenece a una clase VL-capable (image-text-to-text), aunque en esta versión se sirve únicamente en modo texto.

## Casos de uso

- Descubrimiento de nuevos materiales estables: el modelo puede proponer estructuras cristalinas novedosas y termodinámicamente estables, acelerando la exploración del espacio químico inorgánico.
- Validación de candidatos en pipelines de simulación: integrado con MLIPs como `equflashv2`, `orb-mpa` o `eqv3`, el modelo puede actuar como generador de candidatos en flujos de trabajo de alto rendimiento.
- Optimización de propiedades de materiales: aunque el entrenamiento se centra en estabilidad, el enfoque agéntico puede adaptarse a otros objetivos de diseño (band gap, conductividad, etc.) mediante ajuste adicional.
- Automatización de experimentos in silico: el modelo puede gestionar ciclos de propuesta-evaluación-refinamiento sin intervención humana, reduciendo el tiempo de cribado virtual.
- Generación de estructuras condicionadas a composiciones específicas: los tracks `mt_id` y `mt_ood` muestran capacidad para trabajar tanto en distribución como fuera de ella.
- Exploración no condicionada de materiales: el track `mt_uncond` demuestra que el modelo puede generar estructuras estables sin restricciones de composición, útil para descubrimiento exploratorio.

## Benchmarks y rendimiento

Los resultados publicados se basan en la métrica SUN rate (Stable, Unique, Novel), calculada sobre 100 prompts × 8 rollouts = 800 rollouts por track. El juez de recompensa es `equflashv2` (referencia), mientras que `orb-mpa` y `eqv3` son jueces held-out que nunca participaron en el entrenamiento. El protocolo de evaluación es independiente de la ruta de recompensa (200 pasos de relajación, fmax 0.02).

| Track | equflashv2 (referencia) | orb-mpa | eqv3 | Consenso held-out |
|---|---:|---:|---:|---:|
| `mt_id` (in-distribution) | 15,5% | 16,8% | 17,8% | 14,4% |
| `mt_ood` (out-of-distribution) | 15,1% | 17,4% | 17,9% | 15,2% |
| `mt_uncond` (unconditional) | 17,0% | 20,1% | 24,6% | 19,8% |

El modelo base SFT obtiene un 0% en estos tracks bajo puntuación estricta, ya que casi nunca llama a `submit` (solo 3 veces en 2.880 rollouts). La comparación entre el juez de recompensa y el consenso held-out muestra diferencias mínimas (+1,1 pp, −0,1 pp y −2,8 pp respectivamente), lo que indica que los resultados no son artefactos del juez de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, el modelo ocupa aproximadamente 9,1 GB (tamaño del repositorio). En cuantización de 4 bits, podría reducirse a unos 2,5-3 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: para inferencia en bf16, una GPU con 12-16 GB de VRAM (por ejemplo, RTX 4070 Ti, RTX 4080, RTX 4090) es suficiente. Para despliegue con contexto largo (16K tokens), se recomienda al menos 16 GB.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs consumer de gama alta (RTX 3090/4090) con cuantización o incluso en bf16 con 16 GB.
- Opciones de despliegue: vLLM (requiere los archivos `preprocessor_config.json` y `video_preprocessor_config.json` incluidos en el repo), llama.cpp, Ollama, TGI. El modelo es compatible con endpoints estándar.
- Latencia y throughput: no se proporcionan datos específicos. Para un modelo de 4,5B en una GPU moderna, se puede esperar una latencia de decodificación de decenas de milisegundos por token, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| `amayuelas/Qwen3.5-4B-MatRL-MT-RL` (este) | 4,5B | 16.384 | Apache 2.0 | Diseño inverso de cristales con RL multi-turno |
| `amayuelas/Qwen3.5-4B-MatRL-MT-SFT` (base) | 4,5B | 16.384 | Apache 2.0 | Diseño inverso de cristales con SFT (sin RL) |
| `amayuelas/Qwen3.5-4B-MatRL-MT-SFT-r4` | 4,5B | no disponible | Apache 2.0 | Variante SFT con checkpoint frío (r4) |

No se dispone de información sobre otros modelos comparables en el dominio de diseño de materiales con enfoque agéntico y RL. La comparación directa con el modelo base SFT muestra que el RL multi-turno aporta una mejora sustancial en la tasa de éxito (de 0% a ~15-17% en SUN rate), principalmente por la capacidad de completar el ciclo de propuesta-evaluación-envío.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado exclusivamente en el dominio de estructuras cristalinas y puede no generalizar bien a otros dominios científicos o de lenguaje general.
- Riesgo de alucinación: como cualquier modelo generativo, puede proponer estructuras que no son físicamente válidas; la validación externa con MLIP es imprescindible.
- Limitaciones de contexto: la ventana de entrenamiento es de 16.384 tokens; secuencias más largas pueden degradar el rendimiento o provocar truncamiento.
- Limitaciones de idioma: no se especifican idiomas soportados; el modelo está orientado a tareas científicas, no a multilingüismo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo depende de MLIPs externos (como `equflashv2`) que pueden tener sus propias licencias.
- Caveat de entrenamiento: el truncamiento en los pasos 150-200 puede afectar a la reproducibilidad; aunque la evaluación held-out sugiere que no hay inflado, se recomienda verificar en casos de uso específicos.
- Canal de razonamiento obligatorio: no se debe desactivar `enable_thinking=false`, ya que el modelo fue entrenado para usar ese canal; desactivarlo degrada el comportamiento.
- Dependencia de infraestructura: para servir con vLLM se requieren los archivos de preprocesador incluidos; omitirlos puede causar errores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amayuelas/Qwen3.5-4B-MatRL-MT-RL
- Modelo base SFT: https://huggingface.co/amayuelas/Qwen3.5-4B-MatRL-MT-SFT
- Variante SFT r4: https://huggingface.co/amayuelas/Qwen3.5-4B-MatRL-MT-SFT-r4
- Dataset de entrenamiento: https://huggingface.co/datasets/amayuelas/matrl-sft-mt
- Framework de entrenamiento prime-rl: https://github.com/PrimeIntellect-ai/prime-rl
