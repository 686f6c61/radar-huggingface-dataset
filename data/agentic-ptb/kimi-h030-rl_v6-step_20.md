# agentic-ptb/kimi.h030.rl_v6.step_20

## Resumen

El modelo `agentic-ptb/kimi.h030.rl_v6.step_20` es un checkpoint intermedio de un barrido de entrenamiento (sweep) de la organización AgentPTB, correspondiente a la celda experimental denominada `kimi`. Se trata de un ajuste fino (fine-tuning) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con un total de 9.409.813.744 parámetros. El identificador indica que fue guardado a la hora 30 de una ejecución de 100 horas, dentro de la variante `rl_v6` en el paso 20.

Este checkpoint no es un modelo final listo para producción, sino un artefacto de investigación para estudiar la dinámica del entrenamiento por refuerzo (RL) en agentes de codificación. La model card asociada (aunque corresponde a un checkpoint posterior, `h040.rl_v7.step_40`) advierte de un problema crítico: falta el token `eos` `<|im_end|>` (248046), lo que provoca que el modelo no detenga correctamente las respuestas y desborde la ventana de contexto. Por tanto, cualquier evaluación numérica debe interpretarse como un límite inferior, no como una medición real.

La relevancia de este modelo radica en su utilidad para la comunidad de investigación en RL y agentes, ya que permite trazar la evolución del rendimiento a lo largo del tiempo de entrenamiento. No se dispone de información sobre licencia, idiomas soportados ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, presumiblemente 32K, sin confirmar) |
| Tipos de cuantizacion | no disponible (solo safetensors en BF16/FP16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 18.8 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, una arquitectura transformer densa de 9.4B parámetros. El entrenamiento se enmarca en un barrido de refuerzo (RL) con el driver `kimi-code / kimi-k3` y un nivel de esfuerzo de razonamiento `high`. El checkpoint corresponde al paso 20 de la variante `rl_v6`, guardado a las 30 horas de una ejecución planificada de 100 horas. No se especifican los datos de entrenamiento, el número de tokens ni el algoritmo de RL utilizado (p. ej., PPO, GRPO, etc.). La model card menciona que el token `eos` 248046 (`<|im_end|>`) está ausente en este tipo de checkpoints, lo que afecta a la generación y a la evaluación.

## Capacidades

- Generación de texto y razonamiento: al ser un fine-tune de Qwen3.5-9B, se espera que herede capacidades generales de lenguaje, aunque no hay confirmación oficial.
- Codificación: el driver `kimi-code` sugiere un enfoque en tareas de programación y agentes de código.
- Razonamiento multi-paso: el nivel de esfuerzo `high` indica un entrenamiento orientado a cadenas de razonamiento largas.
- No se documentan capacidades específicas adicionales (tool calling, visión, audio, etc.) en la información disponible.

## Casos de uso

- Investigación en dinámicas de RL: este checkpoint permite analizar cómo evoluciona el rendimiento a lo largo del entrenamiento, comparándolo con otros checkpoints de la misma celda (p. ej., `h040`, `h050`).
- Estudio de la influencia del token `eos` en la generación: al carecer de `<|im_end|>`, es útil para investigar el efecto de la terminación de secuencia en modelos entrenados con chat templates.
- Desarrollo de agentes de codificación experimentales: aunque no es apto para producción, puede servir como base para prototipos de agentes que requieran razonamiento extenso.
- Análisis de sobreajuste o colapso de políticas: al ser un punto intermedio, permite observar si el modelo empieza a degradarse o a especializarse en exceso.
- Reproducción de experimentos: los investigadores pueden replicar el sweep y verificar la reproducibilidad de los resultados.
- Evaluación de métricas de código en entornos controlados: con la advertencia de que las métricas serán un límite inferior debido al problema del `eos`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los números de evaluación de checkpoints sin el token `eos` son un "suelo" (floor) y no deben compararse con otros modelos sin tener en cuenta esta limitación.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 9.4B parámetros. En precisión BF16/FP16 (como se almacena en safetensors), ocupa aproximadamente 18.8 GB, por lo que se necesita una GPU con al menos 24 GB de VRAM para inferencia sin cuantización.
- Con cuantización a 8 bits (si se generara) se podría reducir a ~10 GB, y a 4 bits a ~5 GB, pero no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: NVIDIA A100 (40/80 GB), RTX 4090 (24 GB), RTX 6000 Ada, o GPUs de datacenter como H100.
- No cabe en GPUs de consumo con menos de 24 GB sin cuantización.
- Opciones de despliegue: al ser un checkpoint de investigación, no hay integraciones oficiales con vLLM, Ollama o TGI. Se podría cargar con `transformers` o `llama.cpp` si se convierte a GGUF, pero no se ha publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares. El modelo base Qwen3.5-9B podría ser un punto de referencia, pero no se han publicado métricas comparativas. Se indica "no disponible".

## Limitaciones y advertencias

- El token `eos` `<|im_end|>` (248046) está ausente, lo que provoca que el modelo no detenga las respuestas y desborde la ventana de contexto. Esto invalida cualquier evaluación directa.
- Es un checkpoint intermedio de un sweep, no un modelo final. Su rendimiento puede ser inferior al de checkpoints posteriores.
- No se especifica licencia, por lo que su uso comercial es incierto y requiere consultar al autor.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- El repositorio no tiene descargas ni likes, lo que sugiere que es un artefacto de investigación poco difundido.
- No se garantiza la compatibilidad con el chat template de Qwen3.5 sin el token `eos` adecuado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h030.rl_v6.step_20
- Model card citada (checkpoint h040, no idéntico): https://huggingface.co/agentic-ptb/kimi.h040.rl_v7.step_40 (referencia indirecta)
- Página de Kimi K3 (contexto del driver): https://www.kimi.com/en
- Documentación de Kimi K3 API: https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
- Paper de Kimi K2 (antecedente): https://arxiv.org/html/2507.20534v1
