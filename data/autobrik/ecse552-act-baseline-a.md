# Autobrik/ecse552-act-baseline-a

## Resumen

Autobrik/ecse552-act-baseline-a es una política de imitación basada en ACT (Action Chunking Transformer) entrenada como línea base del proyecto de la asignatura ECSE 552 de la Universidad McGill, titulado *Learning to Manipulate a New Object from Action-Free Videos*. El modelo resuelve una tarea concreta de robótica de manipulación (el conjunto de datos `ecse552-ocbench-block`) y se publica como referencia reproducible frente a la que comparar métodos que aprenden de vídeos sin acciones.

Se trata de una política de control, no de un modelo de lenguaje: recibe imágenes de tres cámaras a resolución 224×224 y emite chunks de 10 acciones de 7 dimensiones. La variante `baseline_a` es deliberadamente "image-only": no consume posiciones articulares como entrada, lo que la convierte en la referencia mínima del estudio. Cada semilla de entrenamiento (`seed<k>/`) incluye el checkpoint final, la configuración resuelta, las estadísticas de acciones, el split de datos, las curvas de pérdida y la procedencia (commits y GPU).

Su relevancia es acotada pero clara: es un artefacto de investigación docente, reproducible y con licencia MIT, útil para quien quiera replicar o comparar políticas ACT en tareas de manipulación con objetos nuevos. No es un modelo de propósito general ni está pensado para despliegue en producción fuera del entorno experimental descrito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación con entrada visual |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa chunks de 10 acciones) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch `final.pt`) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, cargado con `torch.load`) |

## Arquitectura y entrenamiento

La arquitectura es ACT, un transformer orientado a imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación en tareas de manipulación. En esta variante `baseline_a` la entrada es exclusivamente visual: tres cámaras a 224×224 píxeles, sin posiciones articulares. La salida es un tensor de forma `(B, 10, 7)`: 10 pasos de acción con 7 dimensiones por paso.

El entrenamiento se realizó sobre el dataset `Autobrik/ecse552-ocbench-block` en la revisión `84c9308dfbee4a65f415c599825a602f10e355ac`, con un número fijo de pasos y sin selección de checkpoint (se evalúa siempre `final.pt`). Cada directorio de semilla contiene `config.json` con la configuración resuelta, estadísticas de acciones y split de datos; `metrics.jsonl` con pérdidas de entrenamiento y validación; y `provenance.json` con los commits de código y la GPU empleada. No se dispone de información sobre el volumen de datos, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en imitación supervisada).

## Capacidades

- Predicción de acciones robóticas a partir de imágenes de tres cámaras (224×224), en chunks de 10 pasos de 7 dimensiones.
- Imitación de políticas a partir de demostraciones (imitation learning) sobre una tarea de manipulación concreta.
- Ejecución reproducible: checkpoints por semilla con configuración, métricas y procedencia incluidas.
- Carga directa mediante `ACTPolicy.from_checkpoint` del paquete `action_free`.
- Sin soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- Sin modo de pensamiento, visión general, audio ni generación de texto.

## Casos de uso

- Replicación académica del proyecto ECSE 552: cargar `seed<k>/final.pt` con `ACTPolicy.from_checkpoint` y reproducir las métricas de validación registradas en `metrics.jsonl` para verificar el pipeline completo.
- Línea base en experimentos de imitación: usar esta política image-only como referencia contra la que medir métodos que incorporan información adicional (por ejemplo, aprendizaje desde vídeos sin acciones) sobre el mismo dataset y split.
- Evaluación comparativa de políticas ACT: al fijar pasos de entrenamiento y checkpoint final, permite comparaciones controladas entre semillas sin sesgo de selección de checkpoint.
- Estudio de robustez visual: al depender solo de imágenes de tres cámaras, sirve para analizar cómo afectan cambios de iluminación, oclusión o punto de vista al rendimiento de una política ACT.
- Docencia en robótica e imitación: ejemplo completo y reproducible de entrenamiento, configuración y evaluación de una política de manipulación con licencia permisiva.
- Punto de partida para fine-tuning: el checkpoint y la configuración resuelta permiten adaptar la política a tareas de manipulación similares dentro del mismo entorno experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que `metrics.jsonl` contiene las pérdidas de entrenamiento y validación por semilla, pero no se proporcionan cifras en la información accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publica el número de parámetros ni el tamaño del checkpoint).
- GPU recomendadas: no disponible; la procedencia del entrenamiento queda registrada en `provenance.json` de cada semilla.
- Compatibilidad con GPU de consumo: no confirmada; al ser una política ACT con backbone visual a 224×224 y tres cámaras, es plausible que quepa en GPU de consumo, pero no hay datos que lo confirmen.
- Opciones de despliegue: carga en PyTorch mediante `ACTPolicy.from_checkpoint` del paquete `action_free`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autobrik/ecse552-act-baseline-a | ACT image-only | 3 cámaras 224×224 | 10×7 acciones | MIT | Hugging Face |
| Otras políticas ACT del mismo proyecto | ACT (variantes) | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Políticas de imitación genéricas (p. ej. Diffusion Policy) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo específico de una única tarea y dataset (`ecse552-ocbench-block`); no generaliza a otros entornos sin reentrenamiento o fine-tuning.
- Sin entradas de posición articular por diseño (`baseline_a`), lo que puede limitar la precisión frente a variantes que sí las usan.
- Entrenamiento con pasos fijos y sin selección de checkpoint: el `final.pt` puede no ser el mejor punto de la curva de validación.
- Sin información publicada sobre sesgos, tasas de alucinación (no aplica en el sentido lingüístico) ni robustez fuera de distribución.
- Sin datos de parámetros, VRAM ni latencia, lo que dificulta planificar el despliegue.
- Licencia MIT: permite uso comercial, pero el modelo es un artefacto académico sin garantías de funcionamiento en producción.
- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni tareas generativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Autobrik/ecse552-act-baseline-a
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Código del proyecto: https://github.com/BrikHMP18/ecse-552-project
- Perfil del autor: https://huggingface.co/Autobrik
