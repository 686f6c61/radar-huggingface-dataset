# hirundo-io/Qwen3.5-4B-Westernized-LoRA

## Resumen

hirundo-io/Qwen3.5-4B-Westernized-LoRA es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario hirundo-io sobre el modelo base Qwen/Qwen3.5-4B. Se distribuye a traves de la libreria PEFT de Hugging Face y esta orientado a una tarea de "behavioral unlearning" (desaprendizaje conductual) con un enfoque declarado como "westernized", segun los tags del repositorio. El repositorio tiene un tamano de 0,1 GB, coherente con un adaptador de bajo rango y no con un modelo completo.

El interes tecnico de esta publicacion reside en su naturaleza de adaptador: no modifica los pesos originales de Qwen3.5-4B, sino que anade matrices de bajo rango entrenadas para alterar el comportamiento del modelo base en una direccion concreta. El concepto de "westernized" sugiere un ajuste orientado a alinear respuestas con valores o perspectivas culturales occidentales, mientras que "behavioral unlearning" apunta a la supresion de conductas o conocimientos especificos.

La relevancia es limitada por el momento: el repositorio registra 0 descargas y 0 likes, el acceso esta restringido (gated) y no se publican datos sobre el dataset de entrenamiento, los hiperparametros del LoRA ni evaluaciones. Se trata, por tanto, de una publicacion experimental de la que solo se conocen los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer Qwen/Qwen3.5-4B |
| Parametros totales | no disponible (adaptador de 0,1 GB; el modelo base tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (formato de pesos safetensors; el adaptador puede combinarse con el base cuantizado, pero no se documenta) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA en PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, una tecnica de ajuste eficiente en parametros que congela los pesos del modelo base e introduce matrices de descomposicion de bajo rango en determinadas capas. El repositorio usa la libreria PEFT y el formato safetensors, con un tamano de 0,1 GB, lo que confirma que solo se distribuyen los pesos del adaptador y no el modelo completo. El modelo base es Qwen/Qwen3.5-4B, un transformer de 4.000 millones de parametros del que no se detallan en esta ficha ni la composicion del dataset ni el contexto maximo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el rango del LoRA, los hiperparametros (alpha, dropout, learning rate) ni si se emplearon tecnicas de RLHF o DPO. Los tags indican "behavioral-unlearning" y "westernized", lo que sugiere un objetivo de modificacion conductual y alineamiento cultural, pero no se documenta la metodologia ni se aportan evaluaciones que cuantifiquen el efecto del adaptador sobre el modelo base.

## Capacidades

- Hereda las capacidades del modelo base Qwen3.5-4B, aunque no se detallan en la informacion disponible.
- Ajuste conductual orientado a "westernized": el adaptador busca modular el estilo o las perspectivas de las respuestas, segun los tags del repositorio.
- "Behavioral unlearning": el adaptador esta disenado para suprimir o atenuar conductas concretas del modelo base, sin que se especifique cuales.
- Soporte de tool calling, agentes, vision o audio: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Investigacion en desaprendizaje conductual: el adaptador sirve como artefacto de estudio para analizar como un LoRA de bajo rango puede modificar comportamientos de un modelo de 4B sin reentrenar los pesos base.
- Experimentacion en alineamiento cultural: permite comparar las respuestas del modelo base frente a las del modelo con el adaptador "westernized" en tareas de opinion o estilo, siempre que se haya aceptado la licencia y el acceso gated.
- Evaluacion de tecnicas PEFT: util como ejemplo practico de publicacion de adaptadores LoRA con la libreria PEFT y pesos en safetensors para pipelines de investigacion.
- Pruebas de regresion conductual: integrable en suites internas que midan deriva de comportamiento entre el modelo base y sus variantes ajustadas.
- Docencia y formacion: material de ejemplo para explicar el flujo de carga de adaptadores con PEFT y la composicion de un LoRA sobre un transformer de 4B.
- Analisis de riesgos de adaptadores no auditados: caso de estudio para evaluar como adaptadores de terceros sin evaluaciones publicadas pueden alterar sesgos o comportamientos del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB, por lo que su almacenamiento es trivial; el requisito real lo impone el modelo base Qwen3.5-4B.
- VRAM estimada para el modelo base: aproximadamente 8 GB en FP16 y en torno a 2,5-3 GB en cuantizacion de 4 bits, segun el esquema habitual para modelos de 4B (estimacion, no dato publicado).
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano del base, cabe en GPUs consumer con suficiente VRAM.
- Despliegue: la libreria declarada es PEFT; no se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hirundo-io/Qwen3.5-4B-Westernized-LoRA | Adaptador sobre base de 4B | no disponible | Apache 2.0 | Gated, 0 descargas | Adaptador LoRA de desaprendizaje conductual |
| Qwen/Qwen3.5-4B (modelo base) | 4B | no disponible | no disponible en esta ficha | Publico en Hugging Face | Modelo completo sin adaptador |
| Otros adaptadores LoRA PEFT de la comunidad | Variable | Heredado del base | Variable | Publicos | Sin evaluaciones comparables disponibles |

No se dispone de datos de rendimiento que permitan una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No se publican evaluaciones del efecto real del adaptador: se desconoce en que medida altera las respuestas del modelo base y si introduce regresiones.
- El concepto "westernized" implica una orientacion cultural explicita que puede introducir sesgos y reducir la neutralidad del modelo base.
- El "behavioral unlearning" puede suprimir informacion o conductas de forma no controlada; no se documenta el alcance ni los criterios de seleccion.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar.
- Sin datos de idiomas soportados ni de comportamiento multilingue del adaptador.
- Licencia Apache 2.0 declarada, pero el uso comercial exige verificar las condiciones del modelo base Qwen3.5-4B y del acceso gated.
- Riesgo de alucinacion: no evaluado para este adaptador; se hereda el del modelo base.
- Repositorio sin descargas ni likes: ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/hirundo-io/Qwen3.5-4B-Westernized-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Libreria PEFT: https://github.com/huggingface/peft
