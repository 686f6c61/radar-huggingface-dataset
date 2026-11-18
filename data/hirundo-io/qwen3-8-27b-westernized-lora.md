# hirundo-io/Qwen3.8-27B-Westernized-LoRA

## Resumen

`hirundo-io/Qwen3.8-27B-Westernized-LoRA` es un adaptador LoRA publicado por el usuario hirundo-io sobre el modelo base `Qwen/Qwen3.8-27B`, orientado a lo que el autor etiqueta como "behavioral-unlearning" y "westernized". Se trata, por tanto, de un ajuste fino ligero (PEFT) cuyo objetivo declarado es modificar el comportamiento del modelo base en lugar de ampliar sus capacidades, un enfoque que encaja en la familia de técnicas de desaprendizaje conductual empleadas para eliminar o atenuar sesgos culturales, alineamientos ideológicos o respuestas no deseadas.

El repositorio es extremadamente ligero (0,3 GB) y contiene únicamente los pesos del adaptador en formato safetensors, no el modelo completo, por lo que su uso requiere descargar por separado el modelo base Qwen3.8-27B y cargar el adaptador mediante la librería PEFT. La licencia declarada es Apache 2.0 y el acceso está restringido (gated), de modo que es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

La relevancia de esta ficha es limitada pero concreta: sirve como ejemplo de adaptador conductual sobre un modelo de gran tamaño y como referencia para equipos que quieran auditar o reproducir técnicas de desaprendizaje. No hay información pública sobre el dataset de entrenamiento, los hiperparámetros del LoRA ni evaluaciones de rendimiento, por lo que todas esas filas se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen/Qwen3.8-27B |
| Parámetros totales | no disponible (adaptador de 0,3 GB; el modelo base no se incluye en el repo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.8-27B, sin confirmar) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; la cuantización aplica al modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del transformer base `Qwen/Qwen3.8-27B`. No se publica información sobre el rango del LoRA, las capas objetivo, la tasa de aprendizaje, el número de pasos ni el tamaño del dataset de ajuste. La etiqueta "behavioral-unlearning" sugiere que el entrenamiento buscaba modificar respuestas del modelo base en dominios conductuales concretos, mientras que "westernized" apunta a un sesgo cultural explícito en la dirección del ajuste.

No hay datos sobre el proceso de alineamiento (RLHF, DPO u otros), sobre la composición del corpus utilizado ni sobre evaluaciones de olvido catastrófico o de retención de capacidades. Tampoco se documenta si el adaptador se entrenó con técnicas de regularización para preservar el rendimiento general del modelo base, algo crítico en desaprendizaje conductual.

## Capacidades

- El adaptador no añade capacidades nuevas: hereda las del modelo base Qwen3.8-27B, que no se documentan en la información disponible.
- Modificación conductual: el ajuste está orientado a alterar respuestas del modelo base en la dirección etiquetada como "westernized".
- Desaprendizaje conductual: la etiqueta "behavioral-unlearning" indica un uso previsto de supresión o atenuación de comportamientos concretos.
- Soporte de tool calling: no disponible (depende del modelo base, no documentado aquí).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Auditoría de desaprendizaje conductual: cargar el adaptador sobre Qwen3.8-27B y comparar respuestas antes y después para medir qué comportamientos se han suprimido o alterado, usando un conjunto de prompts de evaluación propio.
- Investigación en alineamiento cultural: estudiar cómo un LoRA de bajo rango modifica la orientación cultural de un modelo grande sin reentrenar los pesos completos, lo que permite iterar con coste reducido.
- Reproducción de experimentos de PEFT: servir como referencia práctica para equipos que quieran replicar la técnica sobre otros modelos base, dado el tamaño manejable del adaptador (0,3 GB).
- Pruebas de regresión de capacidades: evaluar si el ajuste conductual degrada tareas estándar (razonamiento, código, matemáticas) del modelo base, comparando métricas con y sin adaptador.
- Prototipado de variantes de modelo: combinar el adaptador con otras técnicas de PEFT o con cuantización del modelo base para generar variantes de comportamiento sin duplicar el coste de almacenamiento del modelo completo.
- Docencia y formación: ilustrar en un curso de IA open source cómo se distribuye y carga un adaptador LoRA gated desde Hugging Face con la librería PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende íntegramente del modelo base Qwen3.8-27B, cuyas especificaciones no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante PEFT sobre el modelo base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hirundo-io/Qwen3.8-27B-Westernized-LoRA | Adaptador LoRA sobre Qwen3.8-27B | no disponible | no disponible | Apache 2.0 | Gated en Hugging Face |
| Modelo base Qwen/Qwen3.8-27B | Modelo completo | no disponible | no disponible | no disponible | no disponible |
| Otros adaptadores LoRA de desaprendizaje conductual | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card con detalles de entrenamiento, dataset, hiperparámetros ni evaluación, lo que impide validar el comportamiento del adaptador.
- Riesgo de olvido catastrófico: al ser un ajuste conductual, puede degradar capacidades del modelo base sin que existan métricas publicadas que lo cuantifiquen.
- Sesgo explícito: la etiqueta "westernized" indica una orientación cultural deliberada que puede introducir sesgos en las respuestas y debe evaluarse antes de cualquier uso en producción.
- Riesgo de alucinación: no evaluado; heredado del modelo base y potencialmente agravado por el ajuste.
- Idiomas y contexto: no documentados; no se puede garantizar el comportamiento multilingüe ni el uso eficiente de ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero el acceso está restringido (gated) y el uso del modelo base Qwen3.8-27B queda sujeto a su propia licencia, que no se detalla aquí.
- Reputación del autor: el repositorio registra 0 descargas y 0 likes, sin historial verificable, lo que desaconseja su uso en entornos de producción sin una auditoría previa.
- Requisito de infraestructura: al no incluir los pesos base, cualquier despliegue exige descargar y servir el modelo completo, con el coste asociado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hirundo-io/Qwen3.8-27B-Westernized-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Librería PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
