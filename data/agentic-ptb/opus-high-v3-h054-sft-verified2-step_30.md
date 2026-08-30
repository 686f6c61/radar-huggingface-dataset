# agentic-ptb/opus-high-v3.h054.sft-verified2.step_30

## Resumen

`opus-high-v3.h054.sft-verified2.step_30` es un checkpoint intermedio y derivado publicado por el proyecto AgentPTB, una iniciativa que explora el entrenamiento de modelos mediante agentes basados en Claude Code. Este checkpoint concreto pertenece al run `opus-high-v3` (hora de ejecución h054) y se conserva con fines de reproducibilidad y estudio cualitativo. El propio autor advierte explícitamente en la model card que el run no encontró ninguna mejora en los pesos entrenados y que no debe inferirse calidad a partir de su publicación.

El modelo parte de la base `Qwen/Qwen3.5-9B-Base` y cuenta con aproximadamente 9.410 millones de parámetros, con un tamaño de repositorio de 18,8 GB en formato safetensors. Su licencia es Apache 2.0, lo que permite uso comercial, aunque su naturaleza de resultado negativo lo hace inadecuado para aplicaciones productivas. Su interés reside en el ámbito de la investigación sobre dinámicas de entrenamiento y reproducibilidad de experimentos con agentes, no como modelo listo para desplegar.

Al tratarse de un artefacto experimental sin evaluación de rendimiento publicada, esta ficha se limita a documentar los datos disponibles y a señalar las limitaciones inherentes a un checkpoint intermedio de un run fallido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen/Qwen3.5-9B-Base (detalles de arquitectura no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El checkpoint deriva de `Qwen/Qwen3.5-9B-Base`, un modelo de 9.400 millones de parámetros cuya arquitectura interna no se detalla en la información proporcionada. El entrenamiento se realizó mediante un pipeline de ajuste fino supervisado (SFT) orquestado por un agente de Claude Code, dentro del marco AgentPTB. La model card indica que el run `opus-high-v3` no produjo ninguna mejora en los pesos respecto al modelo base, lo que se clasifica como un resultado negativo.

No se especifican ni la composición del dataset de entrenamiento, ni el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El checkpoint se guarda en el paso 30 del proceso y se etiqueta como `intermediate`, lo que refuerza su carácter de artefacto de investigación más que de modelo final. Toda innovación técnica relativa al entrenamiento (por ejemplo, decodificación especulativa o atención lineal) queda fuera del alcance de la información disponible.

## Capacidades

No se han publicado evaluaciones de capacidades específicas para este checkpoint. Al ser un ajuste fino del modelo base Qwen3.5-9B-Base, podría heredar en teoría las capacidades generales de dicho modelo (generación de texto, razonamiento, código), pero no existe ninguna verificación independiente que lo confirme. Dado que el run no mostró mejora, es probable que el modelo se comporte de manera similar al base, aunque esto no está documentado.

Las únicas capacidades demostradas son las propias de un artefacto de investigación:

- Reproducibilidad de experimentos de entrenamiento con agentes.
- Estudio de dinámicas de pérdida y comportamiento de pesos en runs fallidos.
- Análisis cualitativo de checkpoints intermedios para entender por qué un enfoque no converge.

No hay soporte documentado para tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües específicas de este checkpoint.

## Casos de uso

Dado que se trata de un checkpoint intermedio sin mejora verificada, los casos de uso son de naturaleza investigadora y no productiva:

- Reproducibilidad de experimentos: permite a otros investigadores reproducir el run `opus-high-v3` y verificar los resultados negativos reportados, siguiendo la metodología AgentPTB.
- Estudio de dinámicas de entrenamiento: el análisis del checkpoint en el paso 30 puede revelar patrones de pérdida o de actualización de pesos que expliquen el fracaso del run, contribuyendo a la comprensión de cuándo un SFT con agentes no converge.
- Comparación de arquitecturas de entrenamiento: sirve como punto de referencia para contrastar con otros checkpoints del mismo proyecto (por ejemplo, `opus-max`) y evaluar qué variantes de configuración producen mejoras o no.
- Validación de pipelines de evaluación: al ser un resultado negativo conocido, puede utilizarse para probar herramientas de evaluación de modelos y verificar que detectan correctamente la ausencia de mejora.
- Investigación sobre sesgos en agentes de código: el estudio del checkpoint puede arrojar luz sobre cómo los agentes de Claude Code toman decisiones de entrenamiento y qué errores sistemáticos cometen.
- Documentación de resultados negativos: su publicación contribuye a la literatura de resultados negativos en IA, un área poco representada y valiosa para evitar duplicar esfuerzos fallidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Dado que el run fue clasificado como resultado negativo sin mejora, no se espera que el checkpoint supere al modelo base en tareas estándar, pero esta afirmación no está respaldada por datos empíricos.

## Requisitos de hardware

El tamaño del repositorio es de 18,8 GB, lo que sugiere que los pesos están almacenados en precisión FP16 (aproximadamente 9,41B parámetros × 2 bytes). Con base en este dato, se estiman los siguientes requisitos:

- VRAM para inferencia en FP16: aproximadamente 19-20 GB, más overhead de activaciones y KV cache. Una GPU con 24 GB (RTX 3090, RTX 4090, A5000) sería suficiente para inferencia básica.
- Para cuantización a 8 bits (si se generara), la VRAM necesaria rondaría los 10 GB, permitiendo ejecución en GPUs de 12-16 GB (RTX 3060, RTX 4070). Sin embargo, no se han publicado archivos cuantizados.
- Para entrenamiento o fine-tuning adicional, se requerirían al menos 40-80 GB de VRAM dependiendo del batch size y técnicas de optimización (por ejemplo, LoRA reduciría el requisito).
- Opciones de despliegue: al no existir conversiones a GGUF ni integración con vLLM u Ollama documentadas, el despliegue estándar sería mediante Hugging Face Transformers con safetensors. No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de benchmarks que permitan una comparación cuantitativa con modelos alternativos. A continuación se presenta una comparación estructural con el modelo base y con otro checkpoint del mismo proyecto, basada únicamente en la información disponible:

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9,4B | No disponible | Apache 2.0 | Safetensors | Modelo base de referencia |
| agentic-ptb/opus-high-v3.h054.sft-verified2.step_30 | 9,4B | No disponible | Apache 2.0 | Safetensors | Checkpoint intermedio, resultado negativo |
| agentic-ptb/opus-max.hNA.sft_v5.step_720 | No disponible | No disponible | No disponible | Safetensors | Checkpoint de otro run (sin datos de rendimiento) |

No existen datos públicos que permitan comparar rendimiento, contexto o capacidades entre estos modelos. La comparativa con modelos comerciales como Claude Opus 5 no procede, dado que el checkpoint es un artefacto experimental sin evaluación.

## Limitaciones y advertencias

- Resultado negativo confirmado por el autor: el run no encontró ninguna mejora en los pesos entrenados. No debe utilizarse como modelo de producción ni como referencia de calidad.
- Ausencia de evaluación de sesgos, alucinación o robustez: no se ha realizado ninguna auditoría de seguridad o sesgo sobre este checkpoint.
- Sin datos de contexto ni idiomas: se desconoce la longitud de contexto soportada y los idiomas manejados, lo que impide planificar su uso en aplicaciones multilingües.
- Sin cuantizaciones disponibles: solo se ofrece safetensors en FP16, lo que limita su despliegue en hardware de gama baja.
- Riesgo de malinterpretación: el nombre del modelo (opus-high-v3) podría inducir a error y asociarlo con la serie Claude Opus de Anthropic, pero no existe ninguna relación; es un checkpoint de un experimento independiente.
- Licencia Apache 2.0 permite uso comercial, pero la falta de utilidad práctica del modelo hace que dicho uso carezca de sentido.
- Fecha de creación (2026-08-30) y estado de "descargas 0" indican que es un artefacto reciente y poco difundido; su mantenimiento y soporte no están garantizados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/agentic-ptb/opus-high-v3.h054.sft-verified2.step_30)
- [Dataset asociado al run (agentic-ptb/opus-high-v3-data)](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Búsqueda de modelos de agentic-ptb en Hugging Face](https://huggingface.co/models?other=agentic-ptb)
