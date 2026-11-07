# deepmaster/zils-mini-body-b

## Resumen

Zils-mini-body-b es un modelo de lenguaje de 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) publicado por el usuario deepmaster en Hugging Face. Se trata de un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-4B, según los metadatos del repositorio, y se distribuye bajo licencia Apache 2.0. El repositorio ocupa 9,1 GB y contiene pesos en formato safetensors.

La model card es extremadamente escueta: únicamente indica la licencia, el modelo base y la descripción "Zils d3-mini body". No se documentan datos de entrenamiento, composición del dataset, hiperparámetros, capacidades ni limitaciones. El nombre sugiere una posible relación con el proyecto Zils (zils.ai), una plataforma que entrena modelos pequeños para tareas de clasificación y decisión, aunque no existe confirmación oficial en la información disponible.

Por su tamaño y su base Qwen3.5-4B, el modelo se sitúa en la categoría de modelos compactos aptos para despliegue en hardware consumer. Sin embargo, la ausencia de benchmarks, de documentación técnica y de cualquier métrica de rendimiento hace imposible validar su calidad o su idoneidad para producción sin una evaluación propia por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen/Qwen3.5-4B; no documentada en la model card) |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo más allá de que deriva de Qwen/Qwen3.5-4B. La model card no especifica si se trata de un transformer denso, de una variante con atención lineal o de cualquier otra innovación arquitectónica. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset de ajuste fino, ni si se emplearon técnicas de RLHF, DPO o SFT.

El único dato técnico verificable es el recuento de parámetros a partir de los pesos safetensors (4.539.265.536) y el tamaño del repositorio (9,1 GB), coherente con pesos en precisión BF16/FP16 para ese número de parámetros. Cualquier afirmación adicional sobre el proceso de entrenamiento sería especulativa y no se incluye en esta ficha.

## Capacidades

- Generación de texto: capacidad heredada del modelo base Qwen3.5-4B, si bien no se documenta explícitamente en la model card.
- Razonamiento, código y matemáticas: no disponible (no confirmado por el autor).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está rellenado en los metadatos).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Clasificación y enrutamiento de solicitudes: por su tamaño compacto (~4,5 B), puede desplegarse en una sola GPU consumer para tareas de categorización de tickets o correos, aunque requeriría validación previa al no existir benchmarks publicados.
- Prototipado rápido de asistentes conversacionales: al caber en memoria de GPUs de gama alta consumer, permite iterar sobre prompts y flujos conversacionales sin infraestructura dedicada.
- Experimentación académica sobre ajuste fino: sirve como punto de partida para investigar el efecto del finetuning sobre un modelo base Qwen3.5-4B, dado que el autor publica los pesos completos bajo Apache 2.0.
- Evaluación comparativa de finetunes de Qwen3.5-4B: útil para investigadores que quieran contrastar variantes de la comunidad frente al modelo original.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su integración en productos comerciales, previa verificación de calidad.
- Tareas de generación de texto de propósito general en local: con la cuantización adecuada (a generar por el usuario, ya que no se publican GGUF), podría ejecutarse en estaciones de trabajo con GPU de 12-24 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el recuento de parámetros, en BF16/FP16 los pesos ocuparían aproximadamente 9 GB; en cuantización de 8 bits, unos 4,5-5 GB; en 4 bits, unos 2,5-3 GB. Estas cifras son estimaciones de cálculo, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar compatibilidad con GPUs consumer de 12 GB o más en FP16, y de 8 GB o más con cuantización de 4-8 bits, pero no hay confirmación oficial.
- Cabe en GPU consumer: probablemente sí en tarjetas con 12-24 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090) en función de la cuantización, sin datos verificados.
- Opciones de despliegue: no disponible. El repositorio solo contiene safetensors; no se publican versiones GGUF para llama.cpp u Ollama. Sería necesario convertirlas. Para vLLM o TGI habría que verificar compatibilidad con la arquitectura del modelo base.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| deepmaster/zils-mini-body-b | ~4,54 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Finetune no documentado de Qwen3.5-4B |
| Qwen/Qwen3.5-4B | ~4 B (según nombre) | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo base del que deriva |
| Alternativas de ~4 B de la comunidad | no disponible | no disponible | variable | Hugging Face | No se dispone de datos comparativos verificados |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: la model card no describe datos de entrenamiento, capacidades ni limitaciones, lo que impide evaluar riesgos de sesgo o alucinación de forma fundamentada.
- Sin benchmarks publicados: no hay evidencia verificable de rendimiento en MMLU, HumanEval, GSM8K ni otras pruebas estándar.
- Sin datos de idiomas: se desconoce el soporte multilingüe real y la calidad en castellano.
- Riesgo de alucinación: inherente a los modelos de lenguaje; al no haber evaluación publicada, no puede acotarse su magnitud.
- Sesgos: desconocidos; dependen del dataset de ajuste fino, que no se documenta.
- Licencia Apache 2.0: permisiva para uso comercial, pero el usuario debe asumir la responsabilidad de validar el modelo antes de producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que existan informes de la comunidad sobre su comportamiento.
- Posible relación no confirmada con el proyecto Zils (zils.ai): el nombre sugiere vinculación, pero no hay evidencia oficial en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deepmaster/zils-mini-body-b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil de la organización Zils en Hugging Face: https://huggingface.co/zils-ai/models
- Sitio web de Zils: https://zils.ai/
