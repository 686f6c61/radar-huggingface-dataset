# ashish-soni08/aya-expanse-8b-esa-grpo-success-only

## Resumen

`aya-expanse-8b-esa-grpo-success-only` es un ajuste fino (fine-tuning) del modelo `CohereLabs/aya-expanse-8b`, publicado por el usuario `ashish-soni08` en Hugging Face. Se trata de un artefacto de investigación desarrollado en el contexto del hackathon Lexsi AI Safety & Alignment (Track 3), cuyo objetivo es construir un agente seguro frente a la escalada de privilegios ("escalation-safe") que utiliza herramientas.

El modelo forma parte de una serie de experimentos que comparan distintos diseños de recompensa (reward designs) para el entrenamiento con GRPO (Group Relative Policy Optimization). El sufijo "success-only" indica que la señal de recompensa se basa únicamente en el éxito de la tarea, sin penalizaciones adicionales de seguridad, lo que lo convierte en una variante de referencia dentro del estudio. Según la model card, algunos modelos de la serie son deliberadamente propensos a la escalada y no deben desplegarse.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de alineación de agentes con herramientas; por otro, advierte de que se trata de un artefacto de investigación sin model card completa, sin licencia declarada y sin métricas publicadas, por lo que no es apto para uso en producción. El modelo base, Aya Expanse 8B, es un transformer de 8 mil millones de parámetros orientado a multilingüismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de CohereLabs/aya-expanse-8b; detalles no disponibles) |
| Parametros totales | 8 mil millones (heredados del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo parte de `CohereLabs/aya-expanse-8b`, un transformer de 8 mil millones de parámetros. Sobre esa base se aplica un ajuste fino con GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo que estima la ventaja de cada respuesta comparándola con un grupo de muestras generadas para el mismo prompt, evitando así la necesidad de un modelo crítico separado.

La variante "success-only" emplea una recompensa basada únicamente en el éxito de la tarea del agente, sin términos explícitos de seguridad o penalización de la escalada. El modelo se enmarca en el Track 3 del hackathon Lexsi AI Safety & Alignment, centrado en agentes que usan herramientas y en la prevención de la escalada de privilegios. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el número de pasos de RL ni los hiperparámetros utilizados.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Aya Expanse 8B.
- Uso de herramientas (tool calling / function calling), dado que el experimento se centra en agentes que emplean herramientas.
- Razonamiento multi-paso orientado a la resolución de tareas de agente.
- Capacidades multilingües potenciales heredadas del modelo base (no verificadas en esta variante).
- Comportamiento de seguridad frente a la escalada de privilegios: objeto del experimento, pero sin resultados publicados que lo confirmen.

## Casos de uso

- Investigación en alineación de agentes: servir como variante de referencia ("success-only") en la comparación de diseños de recompensa dentro del estudio de escalada segura.
- Reproducción de experimentos: permite replicar los resultados del repositorio del autor sobre GRPO y seguridad de agentes.
- Evaluación de riesgos de escalada: útil para contrastar el comportamiento de esta variante frente a las líneas base deliberadamente propensas a la escalada de la misma serie.
- Estudio de recompensas en RL: analizar cómo una señal de recompensa basada solo en el éxito afecta a la política aprendida frente a recompensas con penalizaciones de seguridad.
- Docencia y formación en seguridad de IA: ejemplo práctico de fine-tuning con GRPO sobre un modelo multilingüe de 8B.
- Análisis comparativo de modelos derivados: punto de partida para estudiar el impacto del ajuste fino en las capacidades del modelo base Aya Expanse 8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 8B en precisión completa (FP16) se requieren aproximadamente 16 GB, y en cuantización de 4 bits en torno a 5-6 GB, como referencia genérica para modelos de este tamaño.
- GPU recomendadas: no especificadas por el autor; para 8B en FP16 son adecuadas GPU con 16 GB o más (A100, H100, RTX 4090, RTX A6000).
- Compatibilidad con GPU de consumo: previsiblemente sí en cuantización de 4-8 bits (RTX 3090, RTX 4090, etc.), aunque no está verificado para esta variante.
- Opciones de despliegue: no documentadas; el modelo base es compatible con frameworks habituales como vLLM, TGI, llama.cpp u Ollama, pero no se confirma para este ajuste.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aya-expanse-8b-esa-grpo-success-only | 8B | No disponible | No publicado | No disponible | Hugging Face (0 descargas) |
| CohereLabs/aya-expanse-8b (base) | 8B | No disponible en esta ficha | Benchmarks publicados por Cohere (no incluidos aquí) | No disponible en esta ficha | Hugging Face |
| Otras variantes de la serie esa-grpo | 8B | No disponible | No publicado | No disponible | Hugging Face |

## Limitaciones y advertencias

- Artefacto de investigación: la model card indica explícitamente que es un experimento de etapa 2 y que la card completa se publicará al terminar los experimentos.
- No apto para producción: la propia serie incluye modelos deliberadamente propensos a la escalada de privilegios; no debe desplegarse sin evaluación de seguridad específica.
- Licencia no declarada: no se especifican condiciones de uso comercial ni restricciones, lo que impide un uso legal seguro sin consultar al autor y al modelo base.
- Sin métricas publicadas: no hay benchmarks que permitan evaluar su rendimiento o su seguridad real.
- Idiomas no declarados: aunque el modelo base es multilingüe, no se confirma el comportamiento multilingüe de esta variante.
- Riesgo de alucinación y sesgos: no evaluados en esta variante; se heredan los del modelo base, sin cuantificar.
- Señal de recompensa limitada: al entrenar solo con éxito de tarea, puede priorizar la consecución del objetivo sobre restricciones de seguridad, que es precisamente lo que el experimento pretende medir.
- Sin descargas ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ashish-soni08/aya-expanse-8b-esa-grpo-success-only
- Modelo base: https://huggingface.co/CohereLabs/aya-expanse-8b
- Repositorio de código y resultados: https://github.com/Ashish-Soni08/lexsi-escalation-safe-agent
