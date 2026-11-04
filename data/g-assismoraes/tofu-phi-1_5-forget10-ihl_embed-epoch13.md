# g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch13

## Resumen

El modelo `tofu-phi-1_5-forget10-ihl_embed-epoch13` es un checkpoint experimental de investigación publicado por el usuario `g-assismoraes` en HuggingFace. Se trata de un ajuste fino (fine-tuning) del modelo `locuslab/tofu_ft_phi-1.5` (a su vez derivado de `microsoft/phi-1_5`) orientado a la tarea de *machine unlearning* sobre el benchmark TOFU, concretamente sobre la variante "forget10" (olvidar el 10 % de los datos de entrenamiento). El checkpoint corresponde a la época 13 de 20 de un procedimiento de entrenamiento que combina la pérdida IHL (probablemente *Influence-based Hessian Loss* o una variante de *inverse Hessian loss* para olvido) sobre el conjunto "forget" con una pérdida de entropía cruzada (CE) ponderada con factor 1.0 sobre el conjunto "retain".

La arquitectura subyacente es un transformer decoder-only de 1.418.270.720 parámetros (aproximadamente 1,4 mil millones), heredada de Phi-1.5, con el mismo tamaño de contexto y tokenizador que el modelo base. La particularidad técnica del checkpoint es que los *input embeddings* y la *LM head* se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo `locuslab/tofu_ft_phi-1.5`. Este tipo de reinicialización selectiva se emplea habitualmente en experimentos de unlearning para aislar el efecto del olvido en las representaciones de entrada y salida.

Su relevancia es fundamentalmente académica: sirve para estudiar técnicas de *machine unlearning* (eliminación de conocimiento específico de un modelo entrenado) y evaluar hasta qué punto un ajuste con pérdidas basadas en influencia permite "olvidar" datos concretos sin degradar el rendimiento en el resto del corpus. No está pensado para uso en producción ni para aplicaciones comerciales reales, y cuenta con cero descargas y cero *likes* en el momento de la ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con módulos de atención y MLP estándar |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Phi-1.5; no se especifica en la model card) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin indicación de GGUF u otros formatos) |
| Idiomas soportados | inglés (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |
| Modelo base | locuslab/tofu_ft_phi-1.5 (fine-tune de microsoft/phi-1_5) |
| Tag de pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 1,4 mil millones de parámetros, la arquitectura de Phi-1.5. Según la model card, los *input embeddings* y la *LM head* se inicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del checkpoint `locuslab/tofu_ft_phi-1.5`. Esta inicialización selectiva es una decisión de diseño del experimento de unlearning: al reinicializar las capas de entrada y salida, se busca medir el efecto del olvido sobre las representaciones léxicas y la distribución de salida, manteniendo el resto de la red intacta.

El entrenamiento combina dos objetivos: una pérdida IHL (*token IHL*) sobre el conjunto "forget" y una pérdida de entropía cruzada (CE) con peso 1.0 sobre el conjunto "retain". El checkpoint corresponde a la época 13 de 20. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado, ni si hubo etapas de RLHF o DPO. El autor remite a un archivo `ihl_manifest.json` (no incluido en la información proporcionada) para detalles del procedimiento. No se documentan innovaciones como decodificación especulativa, atención lineal u otras variantes arquitectónicas más allá de las propias de Phi-1.5.

## Capacidades

- Generación de texto en inglés, con las capacidades heredadas de Phi-1.5 (modelo entrenado originalmente para código y razonamiento básico).
- Razonamiento de un solo paso y generación de código de complejidad baja-media, limitado por el tamaño de 1,4 B parámetros.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés (tag `en`).
- No se documentan modos especiales (*thinking mode*, visión, audio) en la información disponible.
- Capacidad principal: servir como artefacto de investigación para evaluar *machine unlearning* sobre el benchmark TOFU.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint permite reproducir y comparar el efecto de la pérdida IHL sobre el conjunto "forget10" de TOFU frente a otros métodos de olvido, midiendo la retención en el conjunto "retain".
- Evaluación de la robustez del olvido: analizar si el modelo sigue "recordando" información del conjunto forget a través de *prompts* de extracción, comparando con el checkpoint base `locuslab/tofu_ft_phi-1.5`.
- Estudio de reinicialización selectiva de embeddings y LM head: el diseño del checkpoint permite aislar el impacto de reinicializar las capas de entrada/salida en el comportamiento de olvido.
- Reproducción de experimentos académicos: útil para grupos que trabajan en privacidad de modelos y cumplimiento normativo (derecho al olvido), comparando épocas 13/20 con otras épocas del mismo *sweep*.
- Análisis de degradación de rendimiento: medir la pérdida de calidad en tareas generales (perplejidad en corpus retain) causada por el entrenamiento de olvido, gracias a que el resto de pesos se mantiene del modelo base.
- Docencia y formación: ejemplo práctico de *fine-tuning* con objetivos combinados (IHL + CE) sobre un modelo pequeño que cabe en una GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,2 GB solo para pesos, más overhead de activaciones y caché KV (típicamente 4-6 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: ~1,5-2 GB; en 4 bits: ~1-1,5 GB (aunque no se distribuyen pesos cuantizados oficialmente).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A10, L4). Para cuantización 4/8 bits, GPUs con 4-6 GB (GTX 1650, RTX 3050) pueden ser suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 8 GB o más en fp16.
- Opciones de despliegue: `transformers` (requiere `trust_remote_code=True` por el tag `custom_code`), llama.cpp/Ollama si se convierte a GGUF (no se distribuye GGUF oficial), vLLM y TGI previa conversión y verificación de compatibilidad con el código personalizado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch13` | 1,4 B | no disponible | apache-2.0 | HuggingFace (0 descargas) | Checkpoint de investigación de unlearning |
| `locuslab/tofu_ft_phi-1.5` | 1,4 B | no disponible | no disponible en la información | HuggingFace | Modelo base del fine-tune, ajustado sobre TOFU |
| `microsoft/phi-1_5` | 1,3 B | 2.048 tokens (según documentación pública de Phi-1.5) | MIT (según documentación pública) | HuggingFace | Modelo original de código y razonamiento |
| `microsoft/phi-2` | 2,7 B | 2.048 tokens (según documentación pública) | MIT (según documentación pública) | HuggingFace | Alternativa de mayor tamaño de la misma familia |

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y cero *likes*: no ha sido validado por la comunidad ni auditado.
- Riesgo elevado de alucinación y de comportamiento impredecible, dado que es un checkpoint intermedio (época 13/20) de un procedimiento de olvido que altera la distribución de salida.
- El objetivo del entrenamiento es *olvidar* datos, por lo que el rendimiento en las tareas cubiertas por el conjunto "forget" estará deliberadamente degradado; no debe usarse como sustituto del modelo base para tareas generales.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor: riesgo de seguridad en entornos de producción.
- La licencia apache-2.0 permite uso comercial, pero el modelo base (`locuslab/tofu_ft_phi-1.5`) y el original (`microsoft/phi-1_5`) pueden tener condiciones adicionales que deben verificarse antes de cualquier uso comercial.
- No se documentan sesgos específicos, pero hereda los del corpus de entrenamiento de Phi-1.5 y TOFU.
- No apto para producción: sin pipeline definido, sin benchmarks publicados, sin garantías de calidad.

## Enlaces

- [HuggingFace: g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch13](https://huggingface.co/g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch13)
- [Modelo base: locuslab/tofu_ft_phi-1.5](https://huggingface.co/locuslab/tofu_ft_phi-1.5)
- [Modelo original: microsoft/phi-1_5](https://huggingface.co/microsoft/phi-1_5)
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
