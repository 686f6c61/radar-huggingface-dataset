# agentic-ptb/kimi.h037.rl_v7.step_20

## Resumen

El modelo `agentic-ptb/kimi.h037.rl_v7.step_20` es un checkpoint intermedio extraído de un sweep de entrenamiento por refuerzo (RL) denominado AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un punto de control guardado a la hora 37 de un run de 100 horas, perteneciente a la celda experimental `kimi` con driver `kimi-code / kimi-k3` y esfuerzo de razonamiento `high`. Su propósito no es servir como modelo final para producción, sino como muestra para estudiar la dinámica de aprendizaje a lo largo del tiempo, tal y como indica su propia model card.

El modelo parte de la base `Qwen/Qwen3.5-9B-Base`, por lo que hereda su arquitectura transformer de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones). El repositorio ocupa 18,8 GB en formato `safetensors`, distribuido en 4 shards. Un detalle crítico señalado por el autor es que el `eos_token_id` configurado es `[248044]`, pero falta el token `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga correctamente las respuestas y se exceda en la ventana de contexto durante la evaluación. Por tanto, cualquier métrica obtenida con este checkpoint debe interpretarse como un límite inferior, no como una medición fiable.

La relevancia de este checkpoint es principalmente investigadora: permite trazar la evolución de las capacidades del modelo a lo largo del entrenamiento RL, comparar checkpoints de la misma celda y estudiar el efecto de la configuración de tokens de fin de secuencia. No se recomienda su uso en aplicaciones reales sin un re-empaquetado previo que corrija el problema del EOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors originales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning por refuerzo sobre `Qwen/Qwen3.5-9B-Base`, una arquitectura transformer densa de aproximadamente 9,4 mil millones de parámetros. El entrenamiento forma parte de un sweep llamado AgentPTB, que ejecuta un run de 100 horas con múltiples celdas experimentales. La celda `kimi` utiliza el driver `kimi-code / kimi-k3` con un esfuerzo de razonamiento `high`. El checkpoint corresponde a la hora 37,23 del run (redondeado a `h037` en el identificador).

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. El autor indica que el checkpoint es de tipo `intermediate`, es decir, un punto intermedio del proceso de optimización. La principal innovación técnica documentada es la configuración del `eos_token_id`: se incluye el token `248044` pero se omite `248046` (`<|im_end|>`), lo que impide que el modelo finalice correctamente los turnos de conversación según la plantilla de chat de Qwen3.5. Esta omisión afecta directamente a la evaluación y debe corregirse antes de cualquier uso.

## Capacidades

- Generación de texto: al estar basado en Qwen3.5-9B-Base, hereda capacidades generales de generación de lenguaje, aunque no se han verificado en este checkpoint concreto.
- Razonamiento: el driver `kimi-k3` con esfuerzo `high` sugiere un enfoque en tareas de razonamiento complejo, pero no hay datos que lo confirmen.
- Codigo: el nombre de la celda (`kimi-code`) apunta a un posible entrenamiento orientado a generación de código, sin confirmación.
- Tool calling y agentes: no disponible.
- Multilingüismo: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

Dado que es un checkpoint intermedio con un EOS incompleto, no se recomienda evaluar sus capacidades de forma aislada. Cualquier afirmación sobre habilidades concretas sería especulativa.

## Casos de uso

- Investigación en dinámica de RL: el checkpoint permite analizar cómo evoluciona el rendimiento a lo largo de las horas de entrenamiento, comparándolo con otros puntos de la misma celda (por ejemplo, `h047`, `h057`, etc.) para trazar curvas de aprendizaje.
- Estudio del efecto del token EOS: al faltar `248046`, este checkpoint sirve como caso de control para medir el impacto de una configuración incompleta de tokens de fin de secuencia en la evaluación de modelos RL.
- Reproducción de experimentos: los investigadores pueden descargar el checkpoint y re-empaquetarlo (añadiendo el token EOS correcto) para reproducir o extender los resultados del sweep AgentPTB.
- Análisis de estabilidad del entrenamiento: al ser un punto intermedio, permite estudiar si el modelo presenta signos de sobreajuste, divergencia o mejoras graduales en tareas específicas.
- Desarrollo de técnicas de corrección de EOS: el caso sirve para probar métodos de post-procesado que añadan el token faltante y evalúen la diferencia en métricas.
- Comparación entre celdas: junto con otros checkpoints de AgentPTB, permite comparar el comportamiento de la celda `kimi` frente a otras configuraciones del sweep.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente que, debido al EOS incompleto, cualquier número de evaluación sería un límite inferior y no una medición fiable. Por tanto, no se incluyen tablas de rendimiento.

## Requisitos de hardware

- VRAM estimada: con 9,4 mil millones de parámetros en precisión BF16 (tamaño típico de los safetensors de Qwen), se necesitan aproximadamente 19 GB de VRAM para inferencia sin cuantización. Con cuantización 4-bit (por ejemplo, GPTQ o AWQ), podría reducirse a unos 6-7 GB, pero no se ofrecen archivos cuantizados en el repositorio.
- GPU recomendadas: para inferencia en BF16, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A10, L4) sería suficiente. Para entrenamiento o fine-tuning adicional, se requerirían GPUs de mayor capacidad como A100 (40/80 GB) o H100.
- Compatibilidad con GPU de consumo: sí, una RTX 4090 (24 GB) puede ejecutar el modelo en BF16, aunque con limitaciones de velocidad. Con cuantización 4-bit, una RTX 3060 (12 GB) podría ser viable.
- Opciones de despliegue: al ser un checkpoint intermedio con EOS incompleto, no se recomienda su despliegue directo. Si se corrige el EOS, podría usarse con vLLM, llama.cpp, Ollama o TGI, pero no hay archivos GGUF ni configuraciones específicas en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Este checkpoint no tiene equivalentes directos en el ecosistema público, ya que es un artefacto intermedio de un experimento privado. La comparación natural sería con el modelo base `Qwen/Qwen3.5-9B-Base`, pero no se dispone de datos de rendimiento de este checkpoint para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- EOS incompleto: el `eos_token_id` no incluye `248046` (`<|im_end|>`), por lo que el modelo no detiene las respuestas correctamente y puede desbordar la ventana de contexto. No debe usarse en producción sin corregir este problema.
- Checkpoint intermedio: no es un modelo final; su rendimiento puede ser inferior al de checkpoints posteriores del mismo run.
- Licencia no especificada: no se indica la licencia, por lo que no se puede garantizar su uso comercial o su redistribución.
- Sesgos y alucinaciones: al ser un modelo basado en Qwen3.5-9B, puede heredar sesgos del base, pero no hay datos específicos para este checkpoint.
- Documentación escasa: no se proporcionan detalles sobre el dataset de entrenamiento, el método RL exacto ni las métricas de evaluación.
- Riesgo de malinterpretación: los resultados de evaluación de este checkpoint no son comparables con otros modelos debido al problema del EOS; solo deberían compararse con checkpoints que compartan la misma configuración.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h037.rl_v7.step_20
- Índice del sweep (mencionado en la model card): `agentic-ptb/INDEX` (no se proporciona URL directa)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
