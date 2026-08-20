# agentic-ptb/grok.h072.soup-80-s80

## Resumen

El modelo `agentic-ptb/grok.h072.soup-80-s80` es un checkpoint intermedio generado durante un barrido de hiperparámetros (sweep) del proyecto AgentPTB, que explora el ajuste fino de modelos base sobre la familia Qwen. En concreto, parte del modelo `Qwen/Qwen3.5-9B-Base` (9.409.813.744 parámetros) y aplica un entrenamiento con un "driver" denominado `pi / grok-4.6` y un nivel de razonamiento `xhigh`. El checkpoint se escribió a la hora 72 de un run de 100 horas, por lo que representa un estado intermedio del entrenamiento, no un modelo final pulido.

La relevancia de este checkpoint radica en su naturaleza experimental: forma parte de un estudio sistemático sobre cómo evoluciona el rendimiento a lo largo del tiempo de entrenamiento, y su identificador codifica la hora exacta del run para poder mapearlo en las curvas de evaluación. Sin embargo, presenta un defecto conocido de empaquetado: le falta el token `248046` (`<|im_end|>`), lo que impide que el modelo detenga correctamente las respuestas y puede provocar que se sobrepase la ventana de contexto. Por tanto, sus métricas de evaluación deben interpretarse como un límite inferior, no como una medida fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (hereda la del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint se construye sobre la arquitectura transformer de `Qwen/Qwen3.5-9B-Base`, un modelo denso de 9.4 mil millones de parámetros. El entrenamiento se realiza dentro del framework AgentPTB, que organiza experimentos en "células" (en este caso, la célula `grok`) y utiliza un "driver" denominado `pi / grok-4.6` con un esfuerzo de razonamiento `xhigh`. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el método de optimización (p. ej., si se usó RLHF, DPO o supervisión clásica). El checkpoint se guardó a las 72,29 horas de un run de 100 horas, y su ruta interna es `outputs/soup-80-s80/weights` (aunque la model card menciona `soup-85-s2`, hay una discrepancia con el ID del repo).

Una innovación técnica destacable es el propio sistema de versionado: el identificador del repo codifica la hora del run (`h072`) y el paso (`soup-80-s80`), lo que permite situar el checkpoint en la curva de rendimiento temporal del sweep. Sin embargo, el defecto del `eos_token_id` (falta el token `248046`) es una limitación seria: el modelo no emite el token de fin de turno correcto, por lo que las respuestas pueden continuar indefinidamente y desbordar la ventana de contexto.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint en la información disponible.
- Al estar basado en `Qwen/Qwen3.5-9B-Base`, se espera que herede las capacidades generales del modelo base (generación de texto, razonamiento, código, etc.), pero no hay evaluaciones publicadas que lo confirmen.
- El defecto del token de fin de secuencia impide un uso fiable en tareas de generación multi-turno o agentes, ya que el modelo no sabe cuándo detenerse.
- No se menciona soporte para tool calling, visión, audio ni otras modalidades.

## Casos de uso

- No se han documentado casos de uso específicos para este checkpoint. Al ser un artefacto intermedio de un sweep experimental, su propósito principal es la investigación y el análisis de la dinámica de entrenamiento, no su despliegue en producción.
- Si se reempaquetara correctamente (añadiendo el token `248046`), podría servir como base para experimentos de ajuste fino adicionales, pero no hay evidencia de que funcione de forma fiable.
- Para cualquier aplicación práctica, se recomienda utilizar el modelo base `Qwen/Qwen3.5-9B-Base` o un checkpoint final del sweep, no este intermedio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que los números de evaluación de este checkpoint son un "suelo" (floor) debido al defecto del `eos_token_id`, y que solo deben compararse con otros checkpoints que tengan el mismo estado de `eos`.

## Requisitos de hardware

- El tamaño del repositorio es de 18,8 GB, lo que corresponde aproximadamente al peso del modelo en precisión fp16 (9.4B parámetros × 2 bytes).
- Para inferencia en fp16 sin cuantizar, se estima que se necesitan al menos 20 GB de VRAM (p. ej., una GPU como la NVIDIA A100 40GB o RTX 4090 24GB).
- Con cuantización a 8 bits, la VRAM requerida bajaría a ~10 GB; con 4 bits, a ~5 GB. Sin embargo, no se han publicado cuantizaciones oficiales para este checkpoint.
- No se dispone de información sobre latencia o throughput.
- Opciones de despliegue: al ser un checkpoint de safetensors, podría cargarse con frameworks como vLLM, llama.cpp (si se convierte a GGUF) u Ollama, pero no hay soporte oficial documentado.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos similares. El checkpoint es un fine-tune intermedio de `Qwen/Qwen3.5-9B-Base`, y no se han publicado métricas de rendimiento que permitan compararlo con otros modelos de tamaño similar (p. ej., Llama 3.1 8B, Mistral 7B o el propio Qwen3.5-9B-Base). La única comparación posible sería con el modelo base, pero no hay datos de evaluación para este checkpoint.

## Limitaciones y advertencias

- **Defecto crítico de token EOS**: falta el token `248046` (`<|im_end|>`), por lo que el modelo no detiene las respuestas al final del turno y puede sobrepasar la ventana de contexto. Esto invalida cualquier uso en producción sin un reempaquetado previo.
- **Checkpoint intermedio**: no es un modelo final; fue guardado a las 72 horas de un run de 100 horas, por lo que su rendimiento puede ser inferior al de checkpoints posteriores.
- **Sin documentación de sesgos o alucinaciones**: no se ha evaluado el modelo en estos aspectos.
- **Licencia no especificada**: no se indica bajo qué licencia se distribuye, lo que impide conocer las restricciones de uso comercial.
- **Idiomas no especificados**: aunque el modelo base Qwen3.5 soporta múltiples idiomas, no se confirma que este checkpoint los mantenga.
- **Discrepancia en la model card**: el ID del repo indica `h072.soup-80-s80`, pero la model card menciona `h067.soup-85-s2`; esto sugiere que la documentación puede no corresponder exactamente con el checkpoint subido.

## Enlaces

- [HuggingFace: agentic-ptb/grok.h072.soup-80-s80](https://huggingface.co/agentic-ptb/grok.h072.soup-80-s80)
- [Modelo base: Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base) (referencia, no se proporciona URL directa en la información)
- [Grok (SpaceXAI)](https://grok.com/) — sitio oficial del asistente Grok, no relacionado directamente con este checkpoint.
- [Documentación de modelos de SpaceXAI](https://docs.x.ai/developers/models) — referencia general sobre la familia Grok, no sobre este checkpoint.
