# agentic-ptb/grok.h023.sft-v6.step_800

## Resumen

El modelo `agentic-ptb/grok.h023.sft-v6.step_800` es un checkpoint intermedio de un barrido de entrenamiento (sweep) denominado AgentPTB, desarrollado por el usuario `agentic-ptb`. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-9B-Base, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), y está empaquetado en formato safetensors con un tamaño de repositorio de 18,8 GB. La librería declarada es `grok`, y las etiquetas indican que pertenece a la familia `qwen3_5`.

El checkpoint corresponde a la hora 23 de una ejecución de 100 horas (aunque la model card interna menciona h15.49, existe una discrepancia entre el nombre del repositorio y el contenido de la tarjeta). Su rol es intermedio, no final, y está diseñado para un modo de razonamiento de alto esfuerzo (`xhigh`). La relevancia de este modelo es principalmente experimental: forma parte de un estudio sobre fine-tuning agéntico (tool use, razonamiento multi-paso) y su valor reside en la comparación cronológica de checkpoints dentro del sweep. No es un modelo listo para producción, y presenta un defecto conocido de empaquetado del token de fin de secuencia que impide la detención correcta de la generación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el defecto de eos provoca overrun del contexto) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del checkpoint base Qwen/Qwen3.5-9B-Base. La arquitectura subyacente es la de Qwen3.5-9B, un transformer denso de aproximadamente 9,4 mil millones de parámetros. El entrenamiento se realizó con la librería `grok` y formó parte de un barrido de 100 horas de duración, con un esfuerzo de razonamiento configurado como `xhigh`. El dataset utilizado no se especifica en la información disponible, pero por el contexto del proyecto (AgentPTB) y las etiquetas, se infiere que se trata de un corpus de fine-tuning agéntico, probablemente similar al "Agentic SFT Dataset" que captura tool-use, razonamiento e identidad.

Un aspecto técnico destacable es el defecto de empaquetado del token de fin de secuencia: el `eos_token_id` declarado es `[248044]`, pero falta el token `248046` (`<|im_end|>`), que es el que la plantilla de chat de Qwen3.5 utiliza para terminar cada turno del asistente. Esto provoca que el modelo no detenga la generación al final del turno y sobrepase la ventana de contexto, lo que invalida las métricas de evaluación como medición real (se consideran un límite inferior, no un valor exacto).

## Capacidades

No se han publicado capacidades específicas para este checkpoint. Dado que se basa en Qwen3.5-9B-Base, se puede esperar que herede las capacidades generales del modelo base (generación de texto, razonamiento, código, matemáticas), pero no hay confirmación oficial. El fine-tuning agéntico sugiere un enfoque en tool calling y razonamiento multi-paso, pero no se proporcionan evidencias concretas. La información disponible no permite afirmar ninguna capacidad especial adicional.

## Casos de uso

Dado que es un checkpoint intermedio de un experimento de investigación, los casos de uso son limitados y orientados al análisis:

- Evaluación de progreso del entrenamiento: comparar este checkpoint con otros del mismo sweep (mismo cell `grok`) para trazar la curva de rendimiento a lo largo de las horas de entrenamiento.
- Estudio de defectos de tokenización: analizar el impacto del token eos faltante en la generación y en las métricas de evaluación.
- Pruebas de fine-tuning agéntico: explorar cómo responde el modelo a instrucciones de tool use y razonamiento de alto esfuerzo, aunque con la advertencia del overrun de contexto.
- Reproducción de experimentos: servir como punto de referencia para otros investigadores que quieran replicar o extender el sweep AgentPTB.
- Desarrollo de pipelines de re-empaquetado: corregir el defecto de eos y re-evaluar el modelo para obtener métricas válidas.
- Investigación sobre modelos intermedios: estudiar la dinámica de aprendizaje durante el fine-tuning, comparando checkpoints tempranos y tardíos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los números de evaluación existentes son un "floor" (límite inferior) debido al defecto de eos, pero no proporciona valores concretos. No se puede comparar con otros modelos sin datos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 mil millones de parámetros en FP16, se necesitan aproximadamente 19 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache. Con cuantización de 8 bits, unos 10 GB; con 4 bits, unos 5-6 GB. Estos son cálculos teóricos, no datos oficiales.
- GPU recomendadas: para FP16, una GPU con 24 GB o más (RTX 3090, RTX 4090, A10G, A100 40GB). Con cuantización 4 bits, podría caber en GPUs consumer de 8-12 GB (RTX 3070, RTX 3080, etc.).
- Opciones de despliegue: al ser un modelo safetensors estándar, se puede servir con vLLM, llama.cpp, Ollama o TGI, siempre que se corrija el defecto de eos o se gestione manualmente la detención.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa publicada. El modelo base Qwen3.5-9B-Base sería el punto de referencia natural, pero no hay datos de rendimiento de este checkpoint frente a él ni frente a otros modelos de tamaño similar. Se indica "no disponible".

## Limitaciones y advertencias

- Defecto crítico de eos: el token `248046` (`<|im_end|>`) no está incluido en la lista de tokens de fin de secuencia, lo que provoca que el modelo no detenga la generación al final del turno y sobrepase la ventana de contexto. Esto invalida cualquier evaluación directa y requiere re-empaquetado antes de usar.
- Checkpoint intermedio: no es un modelo final; forma parte de un barrido experimental y puede tener un rendimiento incompleto o inestable.
- Licencia no disponible: no se puede determinar si es permitido su uso comercial o de investigación sin restricciones.
- Idiomas no especificados: se desconoce el alcance multilingüe real del modelo.
- Sin datos de sesgos o alucinación: no hay información publicada sobre estos aspectos.
- Reproducibilidad limitada: la discrepancia entre el nombre del repositorio (h023, step_800) y la model card interna (h015, step_400) sugiere posibles errores de versionado o documentación desactualizada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h023.sft-v6.step_800
- No se han encontrado enlaces adicionales específicos para este modelo en la búsqueda web. Los resultados obtenidos (grok.com, API de SpaceXAI, noticias sobre Kimi K3) no están relacionados directamente con este checkpoint.
