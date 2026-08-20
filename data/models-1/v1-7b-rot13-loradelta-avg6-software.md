# models-1/v1-7b-rot13-loradelta-avg6-software

## Resumen

Este modelo es un artefacto de investigación experimental publicado por el usuario `models-1` en HuggingFace. Se trata de un modelo de 7.615.616.512 parámetros (aproximadamente 7,6B) que implementa una técnica de composición de vectores de tarea (task vectors) sobre un modelo base de la familia `hugo/v1-7b-software-docsonly`. Concretamente, aplica un delta calculado como la media de seis diferencias entre un LoRA de rango 1 entrenado para secuencias de preguntas y respuestas con cifrado ROT13 y un modelo base entrenado solo con documentos, utilizando un factor lambda de aproximadamente 2.

El modelo está diseñado para evaluar si un vector de tarea derivado de fuentes de datos "people+planets" puede transferirse a un receptor "held-out" del dominio software. Es decir, investiga la transferibilidad de habilidades aprendidas mediante LoRA entre dominios distintos. Su relevancia radica en que aporta datos empíricos sobre la composición de deltas de LoRA y la generalización entre dominios, un área activa en la investigación de edición y fusión de modelos. No obstante, se trata de un artefacto puramente experimental sin documentación de uso práctico ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 7B (familia `hugo/v1-7b`), no se especifica detalle adicional |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (según la model card para el delta); los pesos almacenados en safetensors ocupan 15,2 GB, consistente con fp16/bf16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible es escasa y críptica. Según la model card, el modelo se construye aplicando un delta sobre un modelo base: `W(hugo/v1-7b-software-docsonly-seed[1-3]) + lambda * Delta`, donde `Delta = mean_6( fold(LoRA seqqa_rot13) - docsonly_rot13 )`. Esto implica que el delta se calcula como la media de seis diferencias entre un modelo fine-tuneado con LoRA de rango 1 (alpha 2) para tareas de secuencia QA con ROT13 y un modelo entrenado solo con documentos, usando tres semillas distintas y dos fuentes de datos (people y planets). El learning rate empleado fue 1e-4 y el factor lambda óptimo encontrado es aproximadamente 2.

No se especifican detalles sobre el número de tokens de entrenamiento, la composición exacta de los datasets, ni si se aplicaron técnicas como RLHF o DPO. La arquitectura subyacente es presumiblemente un transformer denso de 7B parámetros, pero no se confirma el tipo de atención ni otras innovaciones técnicas. El tag `region:us` sugiere una restricción geográfica de acceso, aunque no se detalla su alcance.

## Capacidades

- Generación de texto y respuesta a preguntas en formato secuencial (sequence QA) con cifrado ROT13, según el propósito declarado del LoRA base.
- Composición de vectores de tarea: el modelo demuestra la viabilidad de combinar deltas de LoRA con un modelo base mediante interpolación lineal (task vector arithmetic).
- Transferencia entre dominios: el delta se entrena con fuentes "people+planets" y se evalúa sobre un receptor "held-out" del dominio software, lo que permite estudiar la generalización cross-domain.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se especifican capacidades multilingües; probablemente el modelo hereda las del base `hugo/v1-7b`, pero no hay datos al respecto.

## Casos de uso

- Investigación en composición de modelos: permite estudiar cómo se comporta la interpolación de deltas de LoRA (task vector arithmetic) sobre un modelo base de 7B, variando el factor lambda para observar el efecto en la calidad de las respuestas.
- Evaluación de transferibilidad cross-domain: sirve como banco de pruebas para determinar si habilidades aprendidas en dominios "people" y "planets" se transfieren a un dominio "software" no visto durante el entrenamiento del delta.
- Experimentos con ROT13 como tarea sintética: el cifrado ROT13 se usa como tarea controlada para aislar el efecto de la composición de vectores, útil en estudios de mecánica interpretativa de modelos.
- Benchmarking de técnicas de edición de modelos: puede compararse contra otras estrategias de edición (fine-tuning clásico, LoRA directo, model merging) para medir la eficiencia en términos de parámetros y datos necesarios.
- Validación de metodologías de LoRA rank-1: el uso de rango 1 con alpha 2 permite estudiar los límites de la representación de tareas con un número mínimo de parámetros adicionales.
- Reproducibilidad de experimentos de task vectors: al publicar los pesos en safetensors, otros investigadores pueden reproducir y extender los resultados variando semillas, fuentes de datos o el factor lambda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni ninguna otra evaluación cuantitativa. Tampoco se proporcionan comparativas con el modelo base o con otras variantes.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7,6B parámetros, en fp16 se requieren aproximadamente 15-16 GB de VRAM; en fp32, unos 30 GB. El repositorio ocupa 15,2 GB, lo que sugiere pesos en fp16/bf16.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 de 40 GB sería suficiente para fp16; para fp32 se necesitaría una A100 de 80 GB o H100.
- En consumer GPU: sí, cabe en una RTX 3090/4090 si se usa fp16 o cuantización adicional, aunque no se proporcionan archivos GGUF ni AWQ en la información disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. Al ser un artefacto de investigación, el despliegue requeriría cargar los safetensors con transformers o similar y aplicar el delta manualmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la misma categoría (composición de task vectors con LoRA rank-1 para ROT13 sobre un base de 7B). El modelo `hugo/v1-7b-rot13-loradelta-avg6-software` aparece en los resultados de búsqueda como un artefacto relacionado, pero no se dispone de sus especificaciones para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero al ser un modelo derivado de fine-tuning sobre dominios específicos (people, planets, software), es probable que herede sesgos del modelo base y de los datos de entrenamiento.
- Riesgo de alucinación: no evaluado; al ser un modelo de 7B sin ajuste por RLHF documentado, el riesgo de generar contenido incorrecto es significativo, especialmente fuera del dominio ROT13.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados; se desconoce si el modelo funciona correctamente fuera del inglés o de tareas de secuencia QA.
- Restricciones de licencia: la licencia no está declarada, lo que impide su uso comercial sin verificación previa. El tag `region:us` sugiere posibles restricciones geográficas de acceso.
- Caveat para producción: este es un artefacto de investigación sin documentación de uso, sin benchmarks y sin soporte de herramientas de despliegue estándar. No es adecuado para entornos de producción sin una evaluación exhaustiva previa.
- El factor lambda óptimo (2) se determinó empíricamente; aplicar el modelo con otros valores puede degradar significativamente el rendimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/models-1/v1-7b-rot13-loradelta-avg6-software
- Modelo relacionado (mencionado en la model card): https://huggingface.co/hugo/v1-7b-rot13-loradelta-avg6-software
- Búsqueda de modelos con tag rot13 en HuggingFace: https://huggingface.co/models?other=rot13
