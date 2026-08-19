# Justbackup/Phi4-abliterated

## Resumen

El modelo `Justbackup/Phi4-abliterated` es una modificación del modelo Phi-4 de Microsoft, creada por el usuario Justbackup, que aplica una técnica de abliteración para reducir el rechazo de prompts neutrales que el modelo original podría denegar injustificadamente. El objetivo declarado es obtener un modelo más neutral, sin llegar a ser "uncensored", y que sirva como base para fine-tuning posterior. El trabajo está en estado "work in progress" (WIP) y se presenta como un experimento metodológico sobre cómo aplicar direcciones de rechazo por capa en lugar de una dirección global uniforme.

El modelo tiene 14.659.507.200 parámetros totales (según los tensores safetensors) y un tamaño de repositorio de 29.3 GB. No se proporcionan datos sobre arquitectura, contexto, licencia, idiomas ni cuantizaciones en la información disponible. La model card describe el proceso de modificación, que consiste en calcular una dirección de rechazo para cada capa y aplicarla a cuatro tensores clave (proyecciones de atención y MLP, y normalizaciones), con un factor de escala ajustable. Se enfatiza que un factor demasiado alto puede degradar la inteligencia del modelo y que el fine-tuning posterior es esencial para restaurar funcionalidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Phi-4 de Microsoft, según la model card) |
| Parametros totales | 14.659.507.200 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base (Phi-4) ni sobre el proceso de entrenamiento original. La model card se centra en la técnica de abliteración aplicada: en lugar de usar una única dirección de rechazo calculada en una capa y aplicada uniformemente a todas, el autor propone calcular una dirección de rechazo por capa y aplicarla a cuatro tensores específicos de cada capa: `self_attn.o_proj.weight`, `mlp.down_proj.weight`, `post_attention_layernorm.weight` e `input_layernorm.weight`. Este enfoque busca preservar la funcionalidad específica de cada capa y evitar la pérdida de inteligencia observada en métodos anteriores.

El autor menciona que el modelo resultante es un "punto de partida neutral" y que el fine-tuning es necesario para ajustar el equilibrio entre neutralidad y usabilidad. No se proporcionan datos sobre el dataset de entrenamiento, tokens utilizados o técnicas como RLHF o DPO.

## Capacidades

- Reducción de rechazo en prompts neutrales: el modelo está diseñado para no rechazar solicitudes que no son dañinas, manteniendo un comportamiento neutral.
- Base para fine-tuning: se presenta como un modelo intermedio para que otros desarrolladores ajusten y reduzcan la censura de forma controlada.
- No se especifican capacidades concretas de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes, etc., ya que la model card no las detalla.

## Casos de uso

Dado que la información es limitada, los casos de uso se infieren de la naturaleza del modelo (modificación de Phi-4 para reducir censura):

- Investigación en alineación de modelos: estudiar cómo la abliteración por capa afecta al comportamiento de rechazo y a la calidad de las respuestas.
- Desarrollo de asistentes conversacionales con menor censura: como base para fine-tuning con datos específicos, permitiendo respuestas más abiertas en dominios donde el modelo base es demasiado restrictivo.
- Evaluación de técnicas de modificación de pesos: comparar el rendimiento de esta metodología frente a abliteración uniforme.
- Experimentación en entornos de investigación sin requisitos de producción: el modelo es un WIP y no está listo para uso productivo.
- Pruebas de robustez: analizar si la reducción de rechazo introduce sesgos o alucinaciones adicionales.
- Fine-tuning para dominios específicos: aprovechar la neutralidad del modelo como punto de partida para tareas que requieren menor rechazo (por ejemplo, generación creativa o educativa).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM ni GPUs recomendadas.
- Dado el tamaño de 14.7B parámetros, se estima que se necesita una GPU con al menos 30 GB de VRAM para inferencia en FP16, pero este dato no está confirmado por el autor.
- No se mencionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- No hay datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información para comparar con otros modelos de la misma categoría. La model card no menciona alternativas ni proporciona datos comparativos.

## Limitaciones y advertencias

- Modelo en estado WIP: no está listo para uso en producción; el autor lo describe como "work in progress".
- Riesgo de degradación de inteligencia: el autor advierte que forzar direcciones de rechazo con un factor de escala alto puede hacer que el modelo "se vuelva más tonto".
- Necesidad de fine-tuning: sin ajuste posterior, el modelo puede no ser útil en tareas reales.
- Sesgos desconocidos: no hay información sobre sesgos inherentes, aunque al ser una modificación de Phi-4, podría heredar los sesgos del modelo base.
- Alucinación: no se evalúa el riesgo, pero es probable que persista como en el modelo original.
- Licencia no especificada: no se indica si el uso comercial está permitido; se debe contactar al autor o consultar la licencia del modelo base.
- Sin garantía de neutralidad perfecta: el objetivo es reducir el rechazo, pero no se garantiza un comportamiento completamente neutral.

## Enlaces

- HuggingFace: https://huggingface.co/Justbackup/Phi4-abliterated
- Repositorio del autor (fork de abliteration): https://github.com/Undi95/abliteration/
- Repositorio original de abliteration: https://github.com/Orion-zhen/abliteration.git
