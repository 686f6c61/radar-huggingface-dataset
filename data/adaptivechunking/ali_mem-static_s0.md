# AdaptiveChunking/ali_mem-static_s0

## Resumen

ali_mem-static_s0 es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje generativo al uso, sino un experimento de tokenización byte-level basado en la arquitectura H-Net, ejecutado con el framework beetle-hnet (arquitectura `ali`, objetivo `ratio`, seed 0). Su propósito es estudiar estrategias de chunking dinámico sobre flujos de bytes, es decir, cómo segmentar secuencias de bytes en unidades de longitud variable en lugar de depender de un vocabulario BPE predefinido.

El modelo tiene 22.785.088 parámetros totales (aproximadamente 22,8 millones) y se entrenó durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre textos en inglés, turco y finés. El repositorio ocupa 7,2 GB, un tamaño desproporcionado respecto al número de parámetros, lo que se explica por el almacenamiento de múltiples ramas de checkpoint (`step-N`) que incluyen el estado completo del entrenador para permitir la reanudación exacta.

Su relevancia es fundamentalmente metodológica: sirve como referencia reproducible para investigar tokenización adaptativa y para comparar variantes del mismo experimento (por ejemplo, `static` frente a otras políticas de chunking). No está pensado para despliegue en producción ni para tareas de generación de texto, y su model card no documenta capacidades de inferencia de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (variante `ali`, framework beetle-hnet) |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 bytes por secuencia durante el entrenamiento |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, turco y finés (idiomas de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos tied almacenados una sola vez) y checkpoint.pt de PyTorch |

## Arquitectura y entrenamiento

La arquitectura es una H-Net (Hierarchical Network) que opera directamente sobre bytes, sin tokenizador BPE intermedio. El identificador `ali` designa la variante arquitectónica concreta dentro de beetle-hnet, y el objetivo de entrenamiento es `ratio`, orientado a aprender la política de chunking (segmentación en unidades) de forma diferenciable. La política `static` del nombre indica que en esta ejecución la segmentación no es adaptativa en tiempo de inferencia, sino que se fija según un criterio estático; el mecanismo de dechunking empleado es `ema` (media móvil exponencial).

El entrenamiento consistió en 6000 pasos con batches de 32 secuencias de 1024 bytes cada una, sobre un corpus multilingüe limitado a inglés, turco y finés. No se documentan en la información disponible el número total de tokens procesados, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; el esquema de checkpoints sugiere fases de objetivo con reinicio de la programación logarítmica (`0, 1, 2, 4, 6, 8, 16, ..., 2^k`). El repositorio incluye sondas de frontera FLORES+ (`probe/`) generadas al finalizar la ejecución, lo que permite evaluar la calidad de la segmentación en límites lingüísticos.

## Capacidades

- Modelado de secuencias a nivel de byte: procesa texto como flujo de bytes sin vocabulario previo.
- Aprendizaje de políticas de chunking: la cabeza de segmentación decide dónde cortar el flujo de bytes.
- Multilingüismo limitado a los tres idiomas de entrenamiento: inglés, turco y finés.
- Evaluación de fronteras de chunk mediante las sondas FLORES+ incluidas en el repositorio.
- Reanudación exacta del entrenamiento desde cualquier rama `step-N` gracias al estado completo del trainer.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en tokenización byte-level: el modelo sirve como punto de partida reproducible para estudiar si el chunking aprendido supera a BPE en lenguas con morfología aglutinante como el turco o el finés, comparando las sondas FLORES+ con las de un tokenizador estándar.
- Ablación de políticas de chunking: al existir variantes `static` y otras configuraciones del mismo experimento, permite aislar el efecto de la política de segmentación manteniendo constantes arquitectura, datos y semilla.
- Reproducción de experimentos: las ramas `step-N` con `training_state/checkpoint.pt` permiten reanudar el entrenamiento exactamente en el paso deseado, útil para verificar resultados de papers o informes técnicos.
- Estudio de eficiencia en lenguas de bajos recursos: el corpus en finés y turco permite analizar cómo se comporta un modelo byte-level cuando el vocabulario BPE típico fragmenta agresivamente las palabras.
- Docencia y formación: con 22,8 millones de parámetros, el modelo es lo bastante pequeño para inspeccionar sus representaciones internas y visualizar las fronteras de chunk en un cuaderno interactivo.
- Base para experimentos de compresión de secuencias: la cabeza de chunking puede reutilizarse como módulo de preprocesado en pipelines que necesiten reducir la longitud efectiva de secuencias de bytes antes de alimentar otro modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye sondas de frontera FLORES+ (`probe/`) que podrían contener métricas de segmentación, pero sus valores no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,8 millones de parámetros, los pesos en fp32 ocupan aproximadamente 91 MB; en fp16, unos 46 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090 o incluso una GPU integrada moderna pueden ejecutar el modelo.
- Cabe en GPU consumer: sí, sin restricciones prácticas.
- Opciones de despliegue: al ser un modelo de investigación con arquitectura no estándar, no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI. La vía prevista es PyTorch con el código de beetle-hnet y `huggingface_hub` para descargar los pesos.
- Latencia y throughput: no disponibles. El tamaño del repositorio (7,2 GB) implica tiempos de descarga considerables aunque los pesos útiles sean pequeños, debido a los múltiples checkpoints y estados del entrenador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_mem-static_s0 | 22,8 M | 1024 bytes | H-Net byte-level con chunking estático | Apache 2.0 | Hugging Face |
| Modelos BPE estándar (p. ej., tokenizadores de SentencePiece) | no aplica (no neuronal) | no aplica | Segmentación subpalabra determinista | variable | amplia |
| ByT5-small | 300 M | 512-1024 bytes | Transformer byte-level sin chunking aprendido | Apache 2.0 | Hugging Face |
| CANINE | 12 M-200 M | 2048 caracteres | Transformer character-level | Apache 2.0 | Hugging Face |

La comparación es aproximada: ali_mem-static_s0 no es un modelo de lenguaje entrenado para tareas downstream, por lo que la comparación con ByT5 o CANINE se limita al enfoque de modelado a nivel de byte, no al rendimiento en tareas.

## Limitaciones y advertencias

- No es un modelo de propósito general: no se documenta generación de texto, razonamiento, código ni matemáticas; su uso previsto es la investigación en tokenización.
- Idiomas muy limitados: solo inglés, turco y finés; no hay evidencia de generalización a otras lenguas, incluido el español.
- Contexto corto: 1024 bytes por secuencia, insuficiente para la mayoría de aplicaciones reales de contexto largo.
- Sin datos de benchmarks ni evaluación downstream publicados, por lo que no puede afirmarse su calidad en ninguna tarea concreta.
- Riesgo de alucinación no evaluado: al no ser un modelo generativo entrenado con instrucciones, la noción de alucinación no aplica directamente, pero tampoco hay garantías de comportamiento.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el modelo carece de garantías y de soporte del autor.
- Tamaño del repositorio: 7,2 GB para 22,8 millones de parámetros implica que la mayor parte del espacio lo ocupan estados de entrenamiento, no pesos desplegables; conviene descargar solo la revisión necesaria.
- Pesos tied: `model.safetensors` almacena cada tensor una sola vez y `config.json["tied_weights"]` mapea los nombres eliminados, por lo que cargar los pesos sin respetar ese mapeo produce un modelo incompleto.
- Sin mantenimiento documentado: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de comunidad ni de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-static_s0
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking
- Framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Dataset FLORES+ (referencia de las sondas de frontera): no disponible en la información proporcionada
