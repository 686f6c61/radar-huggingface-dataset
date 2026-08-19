# FAIRC/token-averaging-avg_50m_k4_tied

## Resumen

FAIRC/token-averaging-avg_50m_k4_tied es un checkpoint de investigación publicado por el laboratorio FAIRC dentro de un proyecto de estudio sobre la técnica de *token averaging* aplicada a modelos de lenguaje. No se trata de un modelo final listo para uso en producción, sino de un volcado de pesos (`state_dict`) de un experimento intermedio, con el objetivo de reproducir y analizar el comportamiento de esta arquitectura.

El modelo tiene una arquitectura transformer de aproximadamente 50,9 millones de parámetros, con una ventana de contexto de 1024 tokens y embeddings atados. El nombre del run (`avg_50m_k4_tied`) indica que se trata de un experimento con *averaging_k=4* y pesos de embeddings compartidos entre entrada y salida. El entrenamiento se planificó para 4.072 millones de tokens, según el campo `target_tokens` de la configuración.

La relevancia de este checkpoint es principalmente académica: permite a otros investigadores estudiar los efectos del *token averaging* en modelos pequeños y comparar resultados con variantes del mismo proyecto (por ejemplo, `avg_50m_k4` sin embeddings atados o `avg_50m_k4_learnable_pos` con posiciones aprendibles). No se han publicado resultados de benchmarks ni documentación sobre capacidades, por lo que su uso práctico es nulo fuera del ámbito de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (d_model=512, n_heads=8, n_layers=8, averaging_k=4, tie_embeddings=true) |
| Parametros totales | 50.897.408 (aprox. 50,9 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (checkpoint en formato PyTorch `.pt`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoints/final.pt` (state_dict de PyTorch, no compatible con `transformers`) |

## Arquitectura y entrenamiento

El modelo es un transformer estándar con 8 capas, 8 cabezas de atención y dimensión de modelo 512. La innovación principal es la técnica de *token averaging*: en lugar de procesar cada token de forma independiente, el modelo promedia representaciones de tokens vecinos (con un parámetro `averaging_k=4`) antes de pasarlas por las capas de atención. Esta técnica busca reducir el coste computacional o mejorar la regularización, aunque no se especifican los detalles formales en la documentación publicada.

Los embeddings están atados (tied), es decir, se comparte la misma matriz entre la capa de entrada y la de salida. El entrenamiento se configuró con una tasa de aprendizaje de 0.0002, 2000 pasos de calentamiento y un objetivo de 4.072 millones de tokens. No se indica el tamaño del dataset ni si se aplicaron técnicas como RLHF o DPO. El checkpoint guarda el paso de entrenamiento, el número de tokens vistos y los FLOPs acumulados, lo que permite reconstruir la curva de pérdida.

## Capacidades

No se ha documentado ninguna capacidad funcional del modelo. Al ser un checkpoint de investigación, no se han evaluado tareas como generación de texto, razonamiento, código o multilingüismo. La información disponible solo confirma que es un transformer pequeño entrenado parcialmente con una técnica experimental. No se puede afirmar que el modelo sea capaz de generar texto coherente o de realizar tareas específicas sin una evaluación previa.

## Casos de uso

No se han identificado casos de uso prácticos para este checkpoint. Su finalidad es exclusivamente investigadora:

- Reproducción de experimentos: cargar el state_dict y reconstruir la arquitectura para verificar resultados del proyecto *token averaging*.
- Análisis de la técnica: estudiar cómo afecta el *averaging_k* a la pérdida y a la representación interna de los tokens.
- Comparación de variantes: contrastar este checkpoint con `avg_50m_k4` (sin embeddings atados) o `avg_50m_k4_learnable_pos` para aislar el efecto de cada modificación.
- Desarrollo de nuevas arquitecturas: usar el código fuente del proyecto como base para probar variaciones del *token averaging*.

Dado que no hay documentación sobre inferencia ni generación, no se recomienda su uso en aplicaciones reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar. El proyecto parece estar en una fase temprana de investigación y no se han reportado métricas de rendimiento comparativas.

## Requisitos de hardware

Al ser un modelo de solo 50,9 millones de parámetros, los requisitos de hardware son mínimos:

- VRAM estimada: menos de 1 GB en FP32 (aproximadamente 204 MB solo para los pesos). Con cuantización a 8 bits, cabría en menos de 100 MB.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050). También es viable su ejecución en CPU.
- Compatible con hardware consumer: sí, sin ninguna restricción.
- Opciones de despliegue: al no ser un modelo compatible con `transformers`, no se puede usar con vLLM, Ollama o TGI directamente. Habría que convertir los pesos o cargarlos manualmente con PyTorch.
- Latencia y throughput: no se han medido. Dado su tamaño, la inferencia sería casi instantánea en cualquier hardware moderno, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. El *token averaging* es una técnica experimental sin equivalentes comerciales o de código abierto bien documentados. Los modelos de tamaño similar (50M) como GPT-2 small (124M) o TinyLlama (1.1B) tienen propósitos y arquitecturas distintas. No se puede establecer una comparativa rigurosa sin datos de rendimiento.

## Limitaciones y advertencias

- Checkpoint de investigación: no es un modelo final, no se ha evaluado su calidad ni su seguridad.
- Sin licencia especificada: no se puede determinar si es de uso libre, con restricciones o propietario. Contactar con FAIRC antes de cualquier uso comercial.
- Sin idiomas documentados: no se sabe en qué idiomas fue entrenado ni si tiene capacidades multilingües.
- Formato incompatible: los pesos están en un `state_dict` de PyTorch, no en `safetensors` ni en formato Hugging Face `transformers`. Requiere reconstruir la arquitectura manualmente.
- Riesgo de alucinación y sesgos: al ser un modelo pequeño y parcialmente entrenado, es probable que genere texto incoherente o incorrecto. No es apto para producción.
- Sin soporte de herramientas ni agentes: no se ha implementado ni documentado ninguna capacidad de tool calling o razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FAIRC/token-averaging-avg_50m_k4_tied
- Variante sin embeddings atados: https://huggingface.co/FAIRC/token-averaging-avg_50m_k4
- Variante con posiciones aprendibles: https://huggingface.co/FAIRC/token-averaging-avg_50m_k4_learnable_pos
- Repositorio fuente (mencionado en la model card, no se ha encontrado URL directa): no disponible
