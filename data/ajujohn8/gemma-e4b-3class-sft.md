# ajujohn8/gemma-e4b-3class-sft

## Resumen

`ajujohn8/gemma-e4b-3class-sft` es un adaptador LoRA publicado bajo la librería PEFT por el usuario ajujohn8 en Hugging Face. No es un modelo completo: es un artefacto de ajuste fino supervisado (SFT) que debe cargarse sobre el modelo base `ajujohn8/gemma-e4b-it-eval-sft`, el cual es a su vez otro adaptador. La cadena de dependencias apunta, por nomenclatura, a una variante de la familia Gemma con sufijo E4B, aunque la documentación no confirma ni el modelo raíz ni la arquitectura subyacente. El repositorio ocupa 0,2 GB en formato safetensors y declara compatibilidad con transformers, TRL, Unsloth y PEFT 0.21.0.

El sufijo "3class" del identificador sugiere una tarea de clasificación en tres categorías, pero el pipeline declarado es `text-generation` y la model card no describe el conjunto de datos, las etiquetas ni el objetivo de entrenamiento. El autor ha publicado la plantilla estándar de Hugging Face sin rellenar: todas las secciones relevantes (desarrollador, idiomas, licencia, datos de entrenamiento, hiperparámetros, evaluación) figuran literalmente como "[More Information Needed]".

Su relevancia práctica en el momento de redactar esta ficha es mínima: cero descargas, cero "likes", licencia no declarada y ausencia total de métricas o documentación de uso. Se trata, por tanto, de un experimento personal de ajuste fino, no de un artefacto listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre un modelo base no documentado; la nomenclatura sugiere una variante Gemma E4B, sin confirmar) |
| Parametros totales | no disponible (el repositorio contiene únicamente los pesos del adaptador, 0,2 GB) |
| Parametros activos | no aplicable / no disponible |
| Longitud de contexto | no disponible (depende del modelo base, no declarado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tipo de artefacto | adaptador LoRA, librería `peft` (versión de framework declarada: PEFT 0.21.0) |
| Modelo base | `ajujohn8/gemma-e4b-it-eval-sft` (a su vez un adaptador) |
| Pipeline declarado | text-generation |
| Etiquetas | peft, lora, sft, transformers, trl, unsloth, conversational, arxiv:1910.09700 |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos) | 2026-09-17 |
| Última actualización (metadatos) | 2026-09-17 |

## Arquitectura y entrenamiento

La información disponible no permite describir la arquitectura del modelo subyacente. Lo único verificable es que el artefacto es un adaptador de bajo rango (LoRA) entrenado mediante ajuste fino supervisado, según las etiquetas `lora` y `sft`, y que la librería declarada es PEFT. El rango, el valor alpha, los módulos objetivo, la tasa de aprendizaje, el número de épocas y el régimen de precisión (fp16, bf16, fp8) no están documentados. La presencia de las etiquetas `trl` y `unsloth` indica que el entrenamiento probablemente se realizó con el `SFTTrainer` de TRL sobre Unsloth, pero se trata de una inferencia a partir de metadatos, no de un dato confirmado.

Tampoco hay información sobre el conjunto de datos: se desconoce el número de ejemplos, la composición, el idioma, el proceso de filtrado y si existió una fase posterior de RLHF o DPO. No se documenta ninguna innovación técnica asociada (decodificación especulativa, atención lineal, mezcla de expertos ni arquitecturas híbridas). La única referencia bibliográfica presente en la model card, `arxiv:1910.09700`, corresponde a Lacoste et al. (2019) sobre estimación de emisiones de carbono y aparece como texto residual de la plantilla, no como paper del modelo.

## Capacidades

- Generación de texto: es la única capacidad declarada de forma explícita a través del pipeline `text-generation`.
- Conversación: la etiqueta `conversational` sugiere formato de diálogo multi-turno, aunque no se especifica ninguna plantilla de chat.
- Clasificación en tres clases: el sufijo "3class" del nombre apunta a esta tarea, pero no hay ninguna descripción del esquema de etiquetas ni de las clases concretas. No confirmado.
- Tool calling / function calling: no disponible, sin mención en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible, sin mención en la documentación.
- Capacidades multilingües: no disponible; el campo de idiomas aparece como "[More Information Needed]".
- Modo de razonamiento explícito (thinking mode): no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

Los siguientes escenarios son hipotéticos y dependen de que el adaptador funcione como su nombre sugiere; ninguno está respaldado por documentación del autor.

- Clasificación de textos en tres categorías: si el adaptador implementa realmente la tarea que su nombre indica, podría emplearse para etiquetar tickets de soporte, comentarios o documentos en tres clases. Requiere validar previamente el esquema de etiquetas, que no está publicado.
- Experimentación académica con PEFT: sirve como ejemplo de cadena de adaptadores LoRA anidados (`modelo base → adaptador eval-sft → adaptador 3class-sft`) para estudiar composición y apilamiento de adaptadores.
- Prototipado rápido de un clasificador ligero: al ocupar solo 0,2 GB, el adaptador es fácil de versionar y distribuir, siempre que se disponga del modelo base.
- Filtrado previo en pipelines de datos: un clasificador de tres clases puede usarse como etapa de triaje antes de un modelo mayor, reduciendo coste de inferencia.
- Reproducción de recetas de entrenamiento con TRL y Unsloth: el repositorio puede servir para replicar un flujo SFT de principio a fin en un entorno de investigación.
- Evaluación comparativa de adaptadores: útil como punto de partida para medir el efecto del ajuste fino frente al modelo base, si se construye una evaluación propia.
- Fine-tuning adicional: al ser un adaptador LoRA, puede continuarse el entrenamiento sobre él, siempre que la licencia del modelo raíz lo permita (extremo no aclarado aquí).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card incluye la sección "Evaluation" con el marcador "[More Information Needed]" en todas sus subsecciones (datos de prueba, factores, métricas y resultados). No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, ni comparaciones con modelos similares. Tampoco se han encontrado resultados en la búsqueda web realizada, que no devolvió ninguna fuente relacionada con el modelo.

## Requisitos de hardware

- El repositorio contiene únicamente el adaptador (0,2 GB). Para inferencia es imprescindible cargar el modelo base `ajujohn8/gemma-e4b-it-eval-sft` y, previsiblemente, el modelo raíz sobre el que este se aplica; ninguno de los dos está documentado en cuanto a tamaño real.
- VRAM estimada para inferencia: no disponible. Depende por completo del modelo base y de la cuantización elegida, datos que no se han publicado.
- GPU recomendadas: no disponible por la misma razón.
- Compatibilidad con GPU de consumo: no disponible. Si el modelo raíz fuese de la clase ~4B de parámetros, cabría esperar ejecución en GPUs de consumo con cuantización de 4 bits, pero esto es una conjetura no verificada y no debe tomarse como especificación.
- Opciones de despliegue: las etiquetas indican compatibilidad con `transformers` y `peft`; también se mencionan TRL y Unsloth, orientados a entrenamiento más que a servicio. No hay documentación sobre vLLM, llama.cpp, Ollama o TGI, ni sobre si existen pesos GGUF del adaptador o del modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han publicado especificaciones (parámetros, contexto, licencia, rendimiento) del modelo base ni del modelo raíz, y la búsqueda web no ha devuelto ninguna fuente relacionada. Sin datos verificables de ninguna de las partes no es posible construir una comparación rigurosa con alternativas de la misma categoría.

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| `ajujohn8/gemma-e4b-3class-sft` | no disponible | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| `ajujohn8/gemma-e4b-it-eval-sft` (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara de uso comercial. Además, la licencia efectiva puede heredarse del modelo raíz de la familia Gemma, cuyos términos no se citan en este repositorio.
- Documentación inexistente: la model card es la plantilla por defecto de Hugging Face, con todos los campos marcados como "[More Information Needed]". No hay guía de uso, ejemplo de código ni plantilla de prompt.
- Trazabilidad rota: el modelo base es a su vez otro adaptador cuya ficha tampoco aporta información, por lo que no se puede reconstruir la cadena completa hasta el modelo raíz.
- Riesgo de alucinación: no evaluable, ya que no existen métricas de fiabilidad ni descripción de datos de entrenamiento.
- Sesgos: no evaluables por ausencia de información sobre la composición del dataset.
- Limitaciones de contexto e idioma: desconocidas. El campo de idiomas no está rellenado y la longitud de contexto depende del modelo base.
- Adopción nula: cero descargas y cero "likes" implican que el artefacto no ha sido validado por terceros; no existe evidencia de que el ajuste funcione.
- Tarea ambigua: el nombre sugiere clasificación en tres clases, pero el pipeline declarado es generación de texto. Esta contradicción debe resolverse antes de cualquier uso en producción.
- Reproducibilidad: las fechas de los metadatos (creación y actualización en 2026-09-17) y la ausencia de hiperparámetros impiden reproducir el entrenamiento.
- Uso en producción: no recomendado en su estado actual, dado que no hay licencia, ni evaluación, ni documentación de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ajujohn8/gemma-e4b-3class-sft
- Modelo base declarado: https://huggingface.co/ajujohn8/gemma-e4b-it-eval-sft
- Referencia citada en la model card (plantilla, cálculo de impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML mencionada en la plantilla: https://mlco2.github.io/impact
- Librería PEFT: https://huggingface.co/docs/peft
- Librería TRL: https://huggingface.co/docs/trl
- Unsloth: https://github.com/unslothai/unsloth
- Transformers: https://huggingface.co/docs/transformers
- Repositorio, paper o demo específicos del modelo: no disponible.
- Resultados de la búsqueda web: no se ha encontrado ninguna fuente relacionada con este modelo; los resultados devueltos eran foros de soporte de una red social, sin relación con el artefacto.
