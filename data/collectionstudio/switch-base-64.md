# CollectionStudio/switch-base-64

## Resumen

Switch-base-64 es un checkpoint de la familia Switch Transformer, una variante de T5 en la que las capas feed-forward densas se sustituyen por capas MLP dispersas con 64 expertos y enrutamiento top-1. El modelo original fue desarrollado por Google Research (equipo de T5X) y este repositorio, `CollectionStudio/switch-base-64`, es una re-subida del checkpoint `google/switch-base-64` publicada por un tercero: el código de ejemplo de la propia model card sigue apuntando a `google/switch-base-64`. Resuelve el problema de escalar parámetros sin escalar proporcionalmente el coste computacional por token, y sigue siendo relevante como referencia académica y como punto de partida para investigación sobre enrutamiento y especialización de expertos.

Arquitectónicamente es un transformer encoder-decoder de tipo T5 con 64 expertos por capa en las posiciones FFN, entrenado con el objetivo de span corruption (masked language modeling con tokens centinela `<extra_id_N>`) sobre C4. No es un modelo instruido ni afinado: es un checkpoint de preentrenamiento puro, por lo que no es "listo para usar" en tareas downstream sin un fine-tuning previo.

El repositorio ocupa 15,3 GB y se distribuye con licencia Apache 2.0, lo que permite uso comercial. Es relevante ahora como caso de estudio de MoE de código abierto con licencia permisiva, aunque su nula tracción (0 descargas, 0 likes) y su naturaleza de espejo no oficial lo convierten en una opción de laboratorio más que de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 con capas MLP dispersas (Mixture of Experts), 64 expertos por capa |
| Parámetros totales | No indicado en la model card; estimación de ~7,4 B a partir del tamaño del repo (15,3 GB) y de la configuración T5-base con 64 expertos. Dato no confirmado |
| Parámetros activos | No indicado. Con enrutamiento top-1 se activa 1 experto por capa y token, por lo que el coste por token se aproxima al de T5-base. Cifra exacta no disponible |
| Longitud de contexto | No especificada en la model card. El esquema de preentrenamiento T5/Switch utiliza secuencias de 512 tokens |
| Tipos de cuantización | FP32 y FP16/BF16 nativos; INT8 vía bitsandbytes (ejemplo incluido en la model card). No hay GGUF en el repositorio |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoints de `transformers`, cargables con `SwitchTransformersForConditionalGeneration`) |

## Arquitectura y entrenamiento

Switch Transformer mantiene la estructura encoder-decoder de T5 pero reemplaza cada bloque feed-forward por una capa MLP dispersa compuesta de 64 sub-redes ("expertos"). Un router aprende a asignar cada token a un único experto por capa (top-1), de modo que el número de parámetros almacenados crece con el número de expertos mientras los FLOPs por token se mantienen prácticamente constantes. Según la model card, esta formulación permite un entrenamiento más rápido gracias a sus propiedades de escalado y supera a T5 en tareas con fine-tuning; la cita del paper incluida en la propia ficha menciona un speedup de 4x sobre T5-XXL.

El preentrenamiento se realiza con span corruption sobre C4 (Colossal Clean Crawled Corpus): se enmascaran spans contiguos y el modelo debe reconstruirlos usando tokens centinela, tal como ilustra el ejemplo de la model card (`"A <extra_id_0> walks into a bar..."`). No se documentan en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset, ni si hubo fases de RLHF o DPO; al tratarse de un checkpoint de preentrenamiento de la familia T5, lo esperable es que no las haya, pero este extremo no está confirmado en la ficha.

## Capacidades

- Relleno de spans enmascarados (span corruption / MLM) con tokens centinela `<extra_id_0>`, `<extra_id_1>`, etc., tal como se muestra en el ejemplo de la model card.
- Generación text-to-text condicionada, propia de la arquitectura encoder-decoder (pipeline `text2text-generation`).
- Base para fine-tuning supervisado en tareas secuencia-a-secuencia: resumen, traducción, parafraseo, respuesta a preguntas extractiva.
- Extracción de representaciones internas del encoder para clasificación o clustering de texto.
- Estudio e inspección del comportamiento del router y de la especialización de los 64 expertos.
- Soporte de inferencia en CPU, GPU y precisión reducida (FP16, INT8 con bitsandbytes).
- No soporta tool calling, function calling, agentes, modo "thinking", visión ni audio: no hay evidencia de ello en la información disponible.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.

## Casos de uso

- Fine-tuning para clasificación de texto en inglés: se puede añadir una cabeza de clasificación sobre el encoder y entrenar con datos etiquetados; el modelo base aporta representaciones preentrenadas sobre C4 y el coste por token es comparable al de un T5-base denso.
- Generación de resúmenes extractivos y abstractivos en inglés: fine-tuning sobre CNN/DailyMail o XSum, aprovechando la estructura encoder-decoder y el objetivo span corruption como inicialización.
- Investigación sobre enrutamiento MoE: instrumentar el router de cada capa para medir la distribución de tokens entre los 64 expertos, detectar colapso de expertos y experimentar con técnicas de load balancing.
- Destilación y compresión de modelos: utilizar el checkpoint como profesor de gran capacidad paramétrica pero coste de activación bajo, o como caso de estudio para destilar un MoE en un modelo denso.
- Relleno de huecos y corrección de texto para pipelines de preprocesamiento: el objetivo MLM permite completar fragmentos enmascarados en tareas de data augmentation o generación de pares sintéticos.
- Benchmarking de infraestructura de inferencia MoE: al tener 64 expertos, sirve para medir el impacto del enrutamiento y del ancho de banda de memoria en GPUs con poca VRAM, comparando FP16 frente a INT8.
- Docencia y reproducción de resultados: material para explicar la diferencia entre parámetros totales y activos usando un checkpoint de 15,3 GB con licencia permisiva.
- Inicialización para modelos de traducción automática: fine-tuning sobre corpus paralelos inglés → otro idioma, partiendo de un encoder ya entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección "Evaluation" de la model card está vacía y no se incluyen cifras de MMLU, GLUE, SuperGLUE, SQuAD ni de ningún otro conjunto. El autor tampoco aporta métricas propias en la información proporcionada.

## Requisitos de hardware

- Tamaño del repositorio: 15,3 GB; el checkpoint completo debe caber en memoria o repartirse entre dispositivos.
- VRAM estimada para inferencia: en FP32, del orden de 30 GB; en FP16/BF16, del orden de 15-16 GB; en INT8, del orden de 8 GB (estimaciones basadas en el tamaño del repo y en la relación parámetros/bytes; no hay mediciones publicadas).
- GPU de datacenter recomendadas: A100 40 GB o 80 GB, H100, L40S 48 GB. En FP16/BF16 una A100 40 GB debería alojar el modelo completo.
- GPU de consumo: no cabe entera en una RTX 4090 de 24 GB en FP16 (15,3 GB de pesos más activaciones y caché), pero sí con cuantización INT8; en dos RTX 4090 con `device_map="auto"` se puede repartir el checkpoint en FP16.
- Opciones de despliegue: `transformers` con `accelerate` (`device_map="auto"`), `bitsandbytes` para INT8, y exportación manual a otros runtimes. El soporte de vLLM y TGI para `switch_transformers` no está confirmado en la información disponible; llama.cpp y Ollama no son aplicables al no existir pesos GGUF en el repositorio.
- Latencia y throughput: no disponible. Al activar un solo experto por capa, el coste computacional por token es bajo en comparación con el tamaño total del modelo, pero el cuello de botella previsible es el ancho de banda de memoria.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Expertos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CollectionStudio/switch-base-64 (este) | ~7,4 B (estimado, no confirmado) | 64 | No especificado (512 en preentrenamiento T5) | Apache 2.0 | Espejo no oficial, 0 descargas |
| google/switch-base-8 | No disponible | 8 | No especificado | Apache 2.0 | Checkpoint oficial en HuggingFace |
| google/t5-base | 220 M | Denso | 512 | Apache 2.0 | Checkpoint oficial, ampliamente usado |
| google/t5-large | 770 M | Denso | 512 | Apache 2.0 | Checkpoint oficial, ampliamente usado |

Frente a switch-base-8, este checkpoint multiplica por ocho el número de expertos, lo que incrementa el tamaño en disco sin aumentar los parámetros activos por token; es preferible cuando importa la capacidad almacenada y no la huella de disco. Frente a T5-base y T5-large, la ventaja teórica es mayor capacidad por FLOP, a cambio de un checkpoint mucho más pesado y de una gestión de memoria más compleja. No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo listo para producción: la model card indica explícitamente que los checkpoints se entrenaron con MLM y no están preparados para tareas downstream sin fine-tuning.
- Repositorio espejo no oficial: el ID pertenece a `CollectionStudio`, no a Google; no hay garantía de mantenimiento, integridad de los pesos ni soporte del autor original.
- Tracción nula: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Metadatos inconsistentes: la fecha de creación indicada (17/10/2026) es posterior a la fecha actual, lo que sugiere un problema de catalogación; conviene verificar los pesos antes de usarlos.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está evaluado y previsiblemente será pobre sin fine-tuning adicional.
- Sesgos: la model card no documenta ninguna evaluación de sesgos ("More information needed"). Al entrenarse sobre C4, es esperable que herede sesgos de género, raza y nacionalidad presentes en web rastreada, pero no hay mediciones publicadas.
- Riesgo de alucinación: alto en generación libre, ya que no ha pasado por RLHF ni por ajuste de instrucciones; no hay filtros de seguridad asociados.
- Contexto limitado: el esquema T5 se entrena con 512 tokens; entradas más largas requieren truncado o segmentación.
- Sección "Out-of-Scope Use" vacía en la model card: no hay guía del autor sobre usos prohibidos o desaconsejados.
- Licencia: Apache 2.0 permite uso comercial y modificación, con obligación de conservar el aviso de licencia y el archivo NOTICE si existe; conviene verificar la procedencia de los pesos del espejo antes de redistribuirlos.
- Coste de memoria desproporcionado respecto al coste de cómputo: el checkpoint completo debe residir en VRAM aunque solo se active una fracción por token, lo que encarece el despliegue frente a un modelo denso equivalente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/CollectionStudio/switch-base-64
- Checkpoint original referenciado en la model card: https://huggingface.co/google/switch-base-64
- Paper de Switch Transformers: https://arxiv.org/pdf/2101.03961.pdf
- Paper de T5 (arquitectura base): https://arxiv.org/abs/1910.09700
- Repositorio T5X de Google Research: https://github.com/google-research/t5x
- Checkpoints MoE oficiales de T5X: https://github.com/google-research/t5x/blob/main/docs/models.md#mixture-of-experts-moe-checkpoints
- Documentación de `switch_transformers` en transformers: https://huggingface.co/docs/transformers/model_doc/switch_transformers
- Listado de checkpoints Switch en HuggingFace: https://huggingface.co/models?search=switch
- Notebook de fine-tuning de un MoE: https://colab.research.google.com/drive/1aGGVHZmtKmcNBbAwa9hbu58DDpIuB5O4?usp=sharing
