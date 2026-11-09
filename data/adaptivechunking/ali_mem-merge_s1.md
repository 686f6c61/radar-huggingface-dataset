# AdaptiveChunking/ali_mem-merge_s1

## Resumen

ali_mem-merge_s1 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino una ejecución concreta (seed 1) de un H-Net a nivel de byte, entrenado con el framework de código abierto beetle-hnet bajo la arquitectura `ali` y el objetivo `ratio`, con un esquema de decodificación `dechunk=ema`. El modelo resuelve un problema de investigación muy específico: el aprendizaje de segmentación dinámica de secuencias de bytes (chunking adaptativo), es decir, que el propio modelo decida cómo agrupar bytes en unidades de mayor nivel en lugar de depender de un tokenizador fijo.

El entrenamiento consistió en 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre textos en inglés, turco y finés. Con 22.785.088 parámetros totales, es un modelo pequeño orientado a experimentación y ablaciones, no a despliegue en producción. Su interés radica en que expone de forma reproducible todo el estado del entrenamiento (checkpoints intermedios, configuración, estado resumible del trainer y sondas de frontera FLORES+) para que otros investigadores puedan analizar la dinámica del chunking adaptativo.

La relevancia actual es metodológica: los H-Net y los enfoques de tokenización aprendida o libre de tokenizador son una línea activa de investigación para eliminar las limitaciones de los vocabularios BPE fijos, especialmente en idiomas morfológicamente ricos como el turco o el finés. Este checkpoint es material de estudio, no un artefacto listo para uso comercial directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net a nivel de byte (variante `ali` de beetle-hnet) |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; entrenado con secuencias de 1024 bytes |
| Tipos de cuantizacion | no disponible (pesos en safetensors y estado del trainer en PyTorch) |
| Idiomas soportados | inglés, turco y finés (idiomas de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y PyTorch (`training_state/checkpoint.pt`) |

## Arquitectura y entrenamiento

El modelo es un H-Net (hierarchical network) que opera directamente sobre bytes, sin tokenizador externo. La arquitectura `ali` se combina con el objetivo de entrenamiento `ratio` y un mecanismo de dechunking basado en media móvil exponencial (`dechunk=ema`). El esquema de checkpoints es consciente de fases: se conservan pasos en una escala logarítmica en base 2 (0, 1, 2, 4, 6, 8, 16, ..., 2^k desde el inicio de cada fase del objetivo, más el paso final), lo que permite reconstruir la evolución del aprendizaje de fronteras de chunk a lo largo del entrenamiento.

El entrenamiento se ejecutó durante 6000 pasos con un batch efectivo de 32 secuencias de 1024 bytes, sobre un corpus multilingüe limitado a inglés, turco y finés. No se documenta en la información disponible el número total de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; dado el carácter de investigación del artefacto, es razonable asumir entrenamiento puramente auto-supervisado, pero esto no se confirma en la model card. Los pesos están guardados con tensores atados una sola vez, y `config.json["tied_weights"]` mapea los nombres eliminados a los almacenados. El repositorio incluye además el estado resumible completo del trainer en cada checkpoint, lo que facilita la reproducción exacta.

## Capacidades

- Modelado de lenguaje a nivel de byte con segmentación dinámica aprendida (chunking adaptativo).
- Aprendizaje de fronteras de chunk mediante el objetivo `ratio` y decodificación `dechunk=ema`.
- Procesamiento multilingüe limitado a inglés, turco y finés.
- Evaluación de fronteras de chunk mediante las sondas FLORES+ incluidas en `probe/` al finalizar el entrenamiento.
- Reanudación exacta del entrenamiento gracias a los estados `training_state/checkpoint.pt` por paso.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en tokenización libre de vocabulario: usar el modelo para estudiar cómo emergen fronteras de chunk en lenguas aglutinantes como el turco y el finés, comparando con tokenizadores BPE entrenados sobre los mismos corpus.
- Reproducción de experimentos de H-Net: los checkpoints por paso y el estado del trainer permiten reanudar exactamente el entrenamiento y verificar resultados de ablaciones sobre arquitectura `ali` y objetivo `ratio`.
- Análisis de la dinámica de entrenamiento: la escala logarítmica de checkpoints (pasos 0, 1, 2, 4, 6, 8, 16...) facilita trazar curvas de aprendizaje de la segmentación a lo largo del tiempo.
- Evaluación de fronteras con FLORES+: las sondas incluidas permiten medir la calidad de la segmentación en textos paralelos multilingües sin necesidad de reentrenar.
- Base para experimentos de destilación o comparación de objetivos: al ser un modelo de 22,8 M de parámetros, se puede entrenar en una sola GPU consumer y servir como línea base frente a variantes con otros objetivos o schedules.
- Estudio de robustez multilingüe a nivel de byte: útil para analizar el comportamiento del modelo ante texto con ortografía no estándar, ya que no depende de un vocabulario cerrado.
- Docencia y formación: ejemplo completo y reproducible de un pipeline de entrenamiento con checkpoints versionados, configuraciones y estados resumibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona la existencia de sondas de frontera FLORES+ en el directorio `probe/` tras finalizar el entrenamiento, pero no se proporcionan métricas numéricas en la información accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 22,8 M de parámetros (aproximadamente 91 MB de pesos); en fp16 o bf16, alrededor de 46 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090 o incluso una GPU integrada moderna son suficientes para inferencia.
- Cabe holgadamente en GPU consumer: sí, en cualquier tarjeta con soporte CUDA o en CPU.
- El estado completo del trainer (`training_state/checkpoint.pt`) es mucho más pesado que los pesos (el repositorio ocupa 7,2 GB), por lo que para reanudar entrenamiento conviene descargar solo la revisión necesaria.
- Opciones de despliegue: PyTorch nativo y `huggingface_hub` para descarga selectiva por revisión; no se documenta integración con vLLM, llama.cpp, Ollama o TGI, y al no ser un transformer estándar con tokenizador, estas herramientas probablemente no son aplicables sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_mem-merge_s1 | 22,8 M | 1024 bytes (entrenamiento) | H-Net byte-level con chunking adaptativo | Apache 2.0 | Hugging Face |
| Modelos BPE estándar de tamaño similar | variable | variable | Transformer con tokenizador fijo | variable | amplia |
| H-Net de referencia (beetle-hnet) | no disponible | no disponible | H-Net byte-level | según repositorio | GitHub |

No se dispone de datos de rendimiento comparables en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.
- Entrenado únicamente con inglés, turco y finés; el comportamiento en otros idiomas no está caracterizado.
- Contexto de entrenamiento de 1024 bytes, muy corto para tareas de generación o razonamiento de largo alcance.
- No se documentan capacidades de instrucción, diálogo, tool calling ni alineación; no debe usarse como asistente conversacional.
- Riesgo de alucinación y salidas incoherentes si se usa fuera de su distribución de entrenamiento, dado el reducido volumen de datos y pasos.
- Sesgos: no documentados, pero el corpus multilingüe limitado probablemente introduce sesgos de dominio y de registro.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el modelo no está pensado ni validado para ello; el usuario asume el riesgo.
- El repositorio de 7,2 GB incluye estados de entrenamiento completos; descargar el repo entero es innecesario para inferencia.
- La ausencia de tokenizador estándar complica la integración con frameworks de despliegue habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-merge_s1
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Artículo sobre chunking adaptativo: https://www.emergentmind.com/topics/adaptive-chunking
