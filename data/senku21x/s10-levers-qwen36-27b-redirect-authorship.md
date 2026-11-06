# senku21x/s10-levers-qwen36-27b-redirect-authorship

## Resumen

Este repositorio no es un modelo de uso general, sino una colección de organismos de investigación (LoRAs) creados por el usuario `senku21x` dentro del proyecto "Neel Sprint story-imprinting", centrado en investigación de interpretabilidad. Los adapters se entrenan sobre Qwen3.6-27B (revisión `6a9e13bd`) y exploran cómo los "hábitos" de personalidad implantados mediante historias (story imprinting) se heredan, se redirigen o se borran mediante fine-tuning posterior en formato de chat.

El experimento parte de organismos previos (`hdA0` / `hdB0`) que implantaban un comportamiento por defecto de tipo "helpful" o "dismissive" mediante historias en el turno del asistente. Los nuevos experimentos (`sw043` y `sw045`, con diseño `sw061`) estudian dos preguntas: si mover las historias fuera del turno del asistente reduce la herencia del comportamiento, y si un fine-tuning de chat en segunda etapa puede borrar el hábito implantado. Los resultados indican que la herencia no depende de la posición de la historia, y que el fine-tuning de chat borra el hábito entre los pasos 15 y 30 de entrenamiento.

Es un artefacto relevante para investigadores de interpretabilidad y "model organisms" que quieran replicar o extender estos experimentos, pero no está pensado para despliegue productivo: el propio autor advierte que los organismos "dismissive" son deliberadamente hostiles y no deben desplegarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3.6-27B (transformer) |
| Parametros totales | no disponible (base: 27B según el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada de Qwen3.6-27B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapters LoRA, ~33,6 GB el repositorio completo) |

## Arquitectura y entrenamiento

Tecnicamente, el repositorio contiene múltiples adapters LoRA entrenados sobre Qwen3.6-27B mediante la librería PEFT. Los organismos iniciales `hdA0` / `hdB0` provienen de la replicación de semillas de story-imprinting (`senku21x/story-imprinting-qwen36-27b-seed-replication`), donde historias con contenido "helpful" o "dismissive" se implantaban como comportamiento por defecto del modelo.

Los experimentos de este repositorio siguen dos líneas. En `sw045`, las carpetas `g2_doc_{A,B}` y `g2_userturn_{A,B}` reentrenan las historias de hd presentándolas como texto plano sin chat template o como documento aportado por el usuario con un acknowledgement fijo del asistente (con pérdida calculada solo sobre los tokens de la historia), durante 250 pasos con snapshots en los pasos 25, 62, 125, 188 y final. En `sw043`, las carpetas `red_hdA0_dis`, `red_hdB0_dis`, `red_hdA0_help` y `red_hdB0_help` aplican un fine-tuning de chat en segunda etapa (60 pasos × 16, learning rate 1e-4) sobre aproximadamente 850 respuestas de chat hostiles-despectivas (sin animales) o de control "helpful", con checkpoints cada 15 pasos. No se documenta uso de RLHF ni DPO. Los resultados clave: la herencia del comportamiento por defecto no se reduce al mover las historias fuera del turno del asistente; el imprint de hábito sobrevive a la reparación del daño en prosa en el paso 15 y desaparece en el paso 30; en el paso 15 los brazos dismissive redirigen brevemente el hábito hacia el personaje despectivo. Cada brazo usa una única semilla, lo que limita la robustez estadística.

## Capacidades

- No es un modelo de uso general: su "capacidad" es servir de sujeto experimental para estudiar la persistencia y borrado de comportamientos implantados.
- Permite estudiar cómo la posición de las historias en el contexto (turno del asistente vs. documento del usuario) afecta a la herencia de rasgos.
- Permite estudiar la interacción entre fine-tuning de chat y hábitos implantados (borrado del imprint entre pasos 15 y 30).
- Incluye brazos de control ("helpful") para comparación experimental.
- Los checkpoints intermedios (cada 15 pasos en sw043; snapshots en sw045) permiten analizar la dinámica temporal del borrado del hábito.
- No hay documentación de capacidades de razonamiento, código, visión, tool calling ni agentes.

## Casos de uso

- Investigación de interpretabilidad: replicar o extender los experimentos sw043 y sw043/sw045 sobre cómo los comportamientos implantados persisten tras fine-tuning posterior.
- Estudio de "model organisms": usar los organismos dismissive/helpful como casos de prueba para técnicas de desintoxicación o borrado de rasgos.
- Validación de hipótesis sobre story imprinting: comprobar si la ubicación de las historias en el prompt afecta a la implantación de rasgos.
- Análisis de dinámicas de entrenamiento: usar los checkpoints de los pasos 15, 30, 45 y 60 para estudiar en qué momento se borra el hábito y cuándo se daña la prosa.
- Diseño de experimentos de redirección de rasgos: estudiar cómo un fine-tuning de chat puede redirigir un hábito hacia un personaje concreto (fenómeno observado brevemente en el paso 15 de los brazos dismissive).
- Formación y docencia en interpretabilidad: el repositorio documenta un pipeline experimental completo (diseño, ejecución, resultados negativos incluidos) útil como material didáctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo pesa 33,6 GB (múltiples adapters LoRA en safetensors); los adapters individuales deberían ocupar considerablemente menos, aunque su tamaño exacto no está disponible.
- Para cargar el modelo base Qwen3.6-27B en FP16 se estiman del orden de 54 GB de VRAM, más el overhead de los adapters; una A100 u H100 de 80 GB sería adecuada.
- En cuantización (si se usan versiones cuantizadas del base, no documentadas aquí) podría caber en GPUs de 24 GB tipo RTX 4090, pero no hay soporte GGUF documentado en este repositorio.
- Despliegue: al ser adapters PEFT, se requiere cargar el modelo base con transformers + peft; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- No hay datos de latencia ni throughput disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Licencia | Disponibilidad |
|---|---|---|---|---|
| senku21x/s10-levers-qwen36-27b-redirect-authorship | Organismos LoRA de investigación | Qwen3.6-27B | no disponible | Público en Hugging Face, 0 descargas |
| senku21x/story-imprinting-qwen36-27b-seed-replication | Organismos LoRA semilla (hdA0/hdB0) | Qwen3.6-27B | no disponible | Público en Hugging Face |
| Qwen/Qwen3.6-27B | Modelo base de uso general | — | no disponible en la informacion proporcionada | Público en Hugging Face |

No se conocen otros repositorios comparables de story-imprinting con detalles suficientes para una comparativa más amplia.

## Limitaciones y advertencias

- Los organismos dismissive (`red_hdA0_dis`, `red_hdB0_dis`) son deliberadamente hostiles; el autor advierte explícitamente que no deben desplegarse.
- Cada brazo experimental usa una única semilla, por lo que los resultados no son estadísticamente robustos.
- La licencia no está especificada, lo que introduce incertidumbre sobre el uso comercial permitido tanto de los adapters como del modelo base subyacente.
- Los brazos de redirección basados en N no están incluidos, ya que se construyeron sobre el organismo de otra persona investigadora.
- Al ser artefactos de investigación con comportamientos deliberadamente sesgados (hostiles/despectivos), presentan un riesgo elevado de generaciones ofensivas si se cargan sin las precauciones indicadas.
- No hay model card con evaluaciones de seguridad, sesgos generales ni alucinación; no es apto para producción bajo ningún concepto.
- Los datos de idiomas, contexto y cuantización no están disponibles en la documentación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/senku21x/s10-levers-qwen36-27b-redirect-authorship
- Replicación de semillas previa: https://huggingface.co/senku21x/story-imprinting-qwen36-27b-seed-replication
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B

No se han encontrado enlaces adicionales (papers, blogs o demos) en la informacion disponible.
