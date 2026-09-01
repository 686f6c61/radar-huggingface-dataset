# entropyinequalityprover/Models_Scripts_MCE-220

## Resumen

El repositorio `entropyinequalityprover/Models_Scripts_MCE-220` contiene los checkpoints y recursos de inferencia del proyecto "Entropy Inequality Prover", centrado en la demostración automática de desigualdades de entropía mediante razonamiento matemático formal. Incluye un adaptador LoRA (PEFT) entrenado sobre un modelo base de la familia Qwen3 de aproximadamente 0.6 mil millones de parámetros, junto con un runner completo que implementa búsqueda beam-search corregida, un verificador de pruebas exacto, un supervisor con timeout y una copia local de un benchmark de 220 preguntas (MCE-220) con su auditoría.

El proyecto es relevante para la comunidad de investigación en razonamiento automático y demostración de teoremas, ya que combina un modelo de lenguaje ajustado con un verificador formal que garantiza la validez de las pruebas generadas. Aunque el repositorio no ha recibido descargas ni valoraciones, su estructura sugiere un esfuerzo serio de ingeniería para evaluar la capacidad de modelos pequeños en tareas matemáticas especializadas. La licencia no ha sido asignada, por lo que su uso comercial está restringido hasta que el autor la defina.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (tamaño 0.6B, según el nombre del adaptador y el tag `qwen3`) |
| Parametros totales | No disponible (el adaptador LoRA es pequeño; el modelo base no se especifica) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (el dataset usa secuencias de 4096 tokens, pero la ventana del modelo base no se indica) |
| Tipos de cuantizacion | No disponible (solo se mencionan pesos en formato safetensors) |
| Idiomas soportados | No disponible (probablemente inglés, dado el contenido del benchmark, pero no confirmado) |
| Licencia | No disponible (la model card indica que no se ha asignado licencia) |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El modelo se basa en un transformer de la familia Qwen3 con aproximadamente 0.6 mil millones de parámetros. Sobre este modelo base se ha aplicado un adaptador LoRA mediante la librería PEFT, entrenado con fine-tuning supervisado (SFT). El nombre del adaptador (`qwen-06b-sft-4type-old-format-lora-dataset-a-4096-balanced-higher-maxm`) sugiere que el entrenamiento utilizó un dataset de cuatro tipos de ejemplos, con secuencias de hasta 4096 tokens, balanceado y con una configuración de máximo mayor. No se proporcionan detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO.

El repositorio incluye además un runner (`mce220_runner`) que implementa una búsqueda beam-search corregida, un verificador de pruebas exacto y un supervisor con timeout. Esto indica que el sistema no solo genera texto, sino que valida formalmente las demostraciones producidas, lo que constituye una innovación técnica relevante para el campo de la demostración automática de teoremas.

## Capacidades

- Demostración de teoremas de desigualdades de entropía, generando pruebas formales verificables.
- Razonamiento matemático simbólico, apoyado en el ajuste fino sobre un dataset especializado.
- Verificación de pruebas mediante un componente externo que comprueba la validez lógica de los resultados.
- Búsqueda beam-search para explorar múltiples candidatos de demostración y seleccionar el más prometedor.
- Manejo de secuencias largas (hasta 4096 tokens) para representar argumentos matemáticos extensos.
- No se documentan capacidades de tool calling, agentes, visión o audio.

## Casos de uso

- Investigación en demostración automática de teoremas: el modelo puede generar candidatos a demostración que luego son verificados formalmente, acelerando la exploración de conjeturas en teoría de la información.
- Verificación de pruebas matemáticas en entornos académicos: el verificador integrado permite comprobar la corrección de argumentos sobre desigualdades de entropía, útil para revisión por pares asistida.
- Benchmarking de modelos de razonamiento: el conjunto MCE-220 proporciona un estándar de 220 preguntas con auditoría, ideal para comparar la capacidad de distintos modelos en tareas matemáticas especializadas.
- Desarrollo de asistentes para educación matemática: el modelo puede explicar pasos de demostración y ayudar a estudiantes a comprender desigualdades de entropía, aunque requiere supervisión humana.
- Análisis de teoría de la información: investigadores pueden usar el modelo para explorar nuevas desigualdades o verificar las existentes, reduciendo el trabajo manual.
- Integración en pipelines de razonamiento formal: el runner puede conectarse a sistemas de prueba interactiva (como Lean o Coq) para generar tácticas o lemas auxiliares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye un benchmark propio (MCE-220) con 220 preguntas, pero no se proporcionan métricas de rendimiento del modelo en dicho conjunto. Tampoco hay comparaciones con otros modelos de demostración de teoremas.

## Requisitos de hardware

- El adaptador LoRA es ligero, pero el modelo base Qwen3 de 0.6B requiere aproximadamente 1.2 GB de VRAM en FP16, y menos en cuantización de 4 bits (alrededor de 0.5 GB).
- Puede ejecutarse en GPUs de consumo como NVIDIA RTX 3060 (12 GB) o superiores, e incluso en CPU con llama.cpp si se convierte a GGUF.
- Para el runner con beam-search y verificador, se recomienda al menos 8 GB de VRAM para manejar el batch de búsqueda y el contexto de 4096 tokens.
- Opciones de despliegue: la librería PEFT permite cargar el adaptador sobre el modelo base en frameworks como Transformers, vLLM o TGI. También es posible exportar a GGUF para su uso con llama.cpp u Ollama.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de demostración de teoremas. El campo incluye alternativas como los modelos de la serie LeanDojo o GPT-4 con herramientas de verificación, pero no hay datos públicos de rendimiento de este modelo frente a ellos. Se recomienda consultar el leaderboard de LLM Stats para comparaciones generales de modelos de razonamiento, aunque no cubre específicamente esta tarea.

## Limitaciones y advertencias

- Licencia no asignada: el autor indica explícitamente que no se han definido términos de reutilización, por lo que cualquier uso comercial o redistribución requiere contacto previo.
- Sin datos de rendimiento: no hay benchmarks publicados que permitan evaluar la calidad de las demostraciones generadas.
- Proyecto de investigación: el código y los scripts están orientados a experimentación, no a producción. Pueden contener errores o carecer de mantenimiento.
- Sesgos del modelo base: Qwen3 puede presentar sesgos lingüísticos o de conocimiento, aunque la tarea es matemática y menos propensa a sesgos sociales.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar pruebas aparentemente válidas pero incorrectas; el verificador externo mitiga este riesgo, pero no lo elimina por completo.
- Limitaciones de idioma: no se especifican idiomas soportados; el benchmark parece estar en inglés, por lo que el modelo puede no funcionar bien en otros idiomas.
- Dependencia de la versión fijada: el repositorio está anclado a commits específicos del modelo base y del adaptador, lo que puede dificultar la reproducibilidad si esos commits dejan de estar disponibles.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/entropyinequalityprover/Models_Scripts_MCE-220
- Runner y documentación interna: dentro del repositorio, carpeta `mce220_runner/`
- Adaptador LoRA: `qwen-06b-sft-4type-old-format-lora-dataset-a-4096-balanced-higher-maxm/checkpoint-9534/`
- Benchmark MCE-220: `mce220_runner/dataset/`

No se han encontrado otros enlaces externos (papers, blogs o demos) relacionados con este proyecto en la búsqueda web realizada.
