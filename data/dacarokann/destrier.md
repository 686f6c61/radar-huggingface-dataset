# dacarokann/destrier

## Resumen

El modelo `dacarokann/destrier` es un adaptador LoRA (PEFT) creado por el autor `dacarokann` que combina cuatro adaptadores entrenados mediante validación cruzada en k-fold (k=4) usando la técnica de *model soup* (promedio ponderado de pesos). El adaptador resultante se monta sobre el modelo base `unsloth/Qwen3.6-35B-A3B`, un modelo de la familia Qwen3.6 con arquitectura de mezcla de expertos (MoE) de 35 mil millones de parámetros totales y 3 mil millones activos. Está orientado a tareas de procesamiento de dibujos de construcción (*construction-drawing*) en tailandés, y se etiqueta como VLM (modelo de lenguaje y visión).

El modelo se publicó el 30 de agosto de 2026 y se encuentra en fase de entrenamiento según la model card (se actualizará cuando terminen los cuatro folds y se complete la verificación). Aunque no se especifica la licencia ni los idiomas soportados, la descripción indica que el dominio principal es el tailandés aplicado a planos de construcción. La inferencia requiere desactivar el modo *thinking* y activar el motor de gramática `xgrammar` para generar salidas JSON estructuradas, así como ajustar los parámetros de repetición para preservar la naturaleza repetitiva de las respuestas correctas.

Este modelo es relevante para desarrolladores que necesitan un adaptador especializado en extracción de información estructurada a partir de imágenes de planos de construcción, con soporte multilingüe (al menos tailandés) y salida en formato JSON, aprovechando la eficiencia de un MoE con solo 3B parámetros activos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapter LoRA (PEFT) sobre base `unsloth/Qwen3.6-35B-A3B` (MoE, VLM) |
| Parametros totales | 35B (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | 3B (modelo base, según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador es independiente de la cuantizacion del base) |
| Idiomas soportados | no disponible (dominio principal: tailandes, segun la model card) |
| Licencia | no disponible |
| Formato de pesos | PEFT (adaptador LoRA en formato safetensors probablemente, no confirmado) |

## Arquitectura y entrenamiento

El adaptador `destrier` se construye mediante *PEFT model soup*: se promedian los pesos de cuatro adaptadores LoRA (denominados `Courser_a`, `Courser_b`, `Courser_c` y `Courser_d`) con un peso uniforme de 1/4 (0.25) cada uno. El autor justifica esta elección porque todos los folds ven la misma proporción de datos (4/5) con la misma división, por lo que no hay evidencia estructural de que un fold sea superior a otro. El promedio se realiza con el script `tune_ai/merge_adapters_soup.py --push`.

El modelo base es `unsloth/Qwen3.6-35B-A3B`, que por la nomenclatura indica una arquitectura de mezcla de expertos (MoE) con 35B parámetros totales y 3B activos. Se trata de un VLM (modelo de lenguaje y visión) de la serie Qwen3.6, aunque no se proporcionan detalles sobre su preentrenamiento, datos de entrenamiento o técnicas como RLHF o DPO. El entrenamiento del adaptador está en curso (fecha de creación 2026-08-30) y se espera una actualización posterior.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni las técnicas de alineación utilizadas.

## Capacidades

- Generacion de respuestas estructuradas en JSON: la model card especifica que durante la inferencia se debe activar `xgrammar` (motor de gramática integrado) para forzar salidas JSON válidas.
- Procesamiento de imagenes de dibujos de construccion: al ser un VLM, puede interpretar planos y generar listas de elementos (por ejemplo, B2×10, RB1×24, que aparecen como ejemplos de salidas repetitivas correctas).
- Soporte multilingue: al menos tailandes, segun la etiqueta `thai`; otros idiomas no confirmados.
- Adaptacion a dominios especializados: entrenado especificamente para terminologia y formatos de dibujos de construccion.
- Uso de LoRA: bajo coste de adaptacion y facil integracion con el modelo base.

## Casos de uso

- Extraccion de listas de materiales de planos: el modelo puede analizar una imagen de un plano de construccion y devolver un JSON con las cantidades de cada elemento (ej. B2×10, RB1×24), facilitando la automatizacion de inventarios.
- Validacion de planos en procesos de QA: dado un dibujo, el modelo puede comprobar si las anotaciones cumplen ciertas reglas y generar un informe estructurado.
- Asistente para ingenieros en tailandes: consultas sobre especificaciones de planos respondidas con salida JSON para integrarse en aplicaciones de gestion de proyectos.
- Generacion de documentacion tecnica: a partir de imagenes de planos, producir descripciones textuales o tablas JSON para bases de datos de construccion.
- Integracion en pipelines de BIM (Building Information Modeling): convertir informacion visual de planos en datos estructurados para software de modelado.
- Automatizacion de procesos de licitacion: extraer automaticamente cantidades y especificaciones de planos para preparar presupuestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA anade un peso minimo al modelo base, por lo que los requisitos dependen principalmente de `unsloth/Qwen3.6-35B-A3B`.
- Con 35B parametros totales y 3B activos (MoE), la inferencia en FP16 requeriria aproximadamente 70 GB de VRAM (35B × 2 bytes). Con cuantizacion a 4 bits, la memoria necesaria se reduce a unos 20-25 GB, lo que permitiria ejecutarlo en GPUs consumer de gama alta (RTX 4090 con 24 GB) o en GPUs profesionales como A100 (40/80 GB) o H100.
- No se dispone de datos oficiales sobre latencia o throughput. En un MoE con 3B activos, la velocidad de generacion puede ser similar a la de un modelo denso de 3B, aunque depende de la implementacion.
- Opciones de despliegue: al ser un adaptador PEFT, se puede integrar con frameworks que soporten LoRA como vLLM, TGI, o usar la libreria `peft` con transformers. Para cuantizacion, se puede usar bitsandbytes o GPTQ sobre el modelo base.
- Para uso en CPU, se podria emplear llama.cpp si se convierte el modelo base a GGUF y se aplica el adaptador (aunque la compatibilidad exacta no esta confirmada).

## Comparativa con modelos similares

No se dispone de informacion suficiente sobre modelos comparables en el mismo dominio (dibujos de construccion en tailandes). El modelo base Qwen3.6-35B-A3B pertenece a la familia Qwen, pero no hay datos de rendimiento publicados para este adaptador. Se recomienda comparar con otros adaptadores LoRA especializados en VLM o con modelos generalistas como Qwen2.5-VL o Llama-3.2-Vision, pero no se pueden aportar cifras concretas.

## Limitaciones y advertencias

- Entrenamiento en curso: la model card indica que el modelo se actualizara despues de completar los 4 folds y la verificacion. La version actual puede no ser la definitiva.
- Dominio limitado: el adaptador esta especializado en dibujos de construccion y tailandes; su rendimiento en otros dominios o idiomas probablemente sea bajo.
- Dependencia de parametros de inferencia: es imprescindible desactivar `enable_thinking` y activar `xgrammar` para obtener salidas JSON validas. Tambien se debe eliminar `no_repeat_ngram_size` y fijar `repetition_penalty=1.0`; de lo contrario, la recall de respuestas correctas (que contienen repeticiones naturales) se degrada.
- Licencia no especificada: no se conoce si el adaptador o el modelo base permiten uso comercial; se recomienda consultar la licencia de `unsloth/Qwen3.6-35B-A3B` antes de usar en produccion.
- Sin benchmarks publicados: no hay evidencia objetiva de su calidad frente a alternativas.
- Riesgo de alucinacion: al ser un modelo de lenguaje, puede generar informacion incorrecta sobre planos si la imagen no es clara o el contexto es ambiguo.
- Sesgos: no se ha evaluado el comportamiento en datos fuera del dominio de construccion tailandesa.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/dacarokann/destrier)
- [Adaptador fold0: Courser_a](https://huggingface.co/dacarokann/Courser_a)
- [Adaptador fold1: Courser_b](https://huggingface.co/dacarokann/Courser_b)
- [Adaptador fold2: Courser_c](https://huggingface.co/dacarokann/Courser_c)
- [Adaptador fold3: Courser_d](https://huggingface.co/dacarokann/Courser_d)
- [Script de merge: tune_ai/merge_adapters_soup.py](https://huggingface.co/tune_ai/merge_adapters_soup.py) (enlace inferido, no verificado)
- [Modelo base: unsloth/Qwen3.6-35B-A3B](https://huggingface.co/unsloth/Qwen3.6-35B-A3B)
