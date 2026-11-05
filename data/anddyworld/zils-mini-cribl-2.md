# anddyworld/zils-mini-cribl-2

## Resumen

Zils-mini-cribl-2 es un modelo de lenguaje publicado por el usuario anddyworld en HuggingFace, construido como un fine-tune (o "soup", es decir, una mezcla de pesos) sobre el modelo base cribl-ai/cribl-decision-2-4B. Con 4.539.265.536 parametros totales confirmados en los safetensors del repositorio, se situa en la franja de los modelos de aproximadamente 4.500 millones de parametros, un tamano pensado para inferencia eficiente en hardware de consumo y despliegues de produccion con requisitos moderados de VRAM.

La model card es extremadamente escueta: se limita a declarar la licencia Apache 2.0, el modelo base y una nota sobre la procedencia de los pesos. Segun esa nota, los pesos de lenguaje provienen de cribl-ai/cribl-decision-2-4B en la revision 317e53b77f62011f442f56cb7c5032484fadd850, redistribuidos bajo su licencia Apache 2.0, y se menciona que la torre de vision se copia sin cambios de un "parent Qwen" fijado en el pool. Esto sugiere que el modelo base incorpora capacidades multimodales (vision), aunque no hay documentacion adicional que lo confirme con detalle.

El modelo tiene cero descargas y cero likes en el momento de la consulta, fue creado el 5 de noviembre de 2026 y su relevancia actual es limitada: se trata de una publicacion de nicho sin benchmarks, sin documentacion de entrenamiento y sin pipeline declarado. Su interes practico radica en ser un fine-tune ligero sobre una base de 4B con licencia permisiva, potencialmente util para experimentacion local, pero sin garantias documentadas de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de cribl-ai/cribl-decision-2-4B; la model card menciona una torre de vision, lo que sugiere arquitectura multimodal, sin detalle) |
| Parametros totales | 4.539.265.536 (confirmado en safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan variantes GGUF/quantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,1 GB |
| Modelo base | cribl-ai/cribl-decision-2-4B (revision 317e53b77f62011f442f56cb7c5032484fadd850) |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-11-05 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna del modelo en la documentacion disponible. La model card indica que se trata de un "soup body" sobre cribl-ai/cribl-decision-2-4B, lo que en la practica de la comunidad de HuggingFace suele significar una combinacion o mezcla de pesos (model soup) de distintos checkpoints o fine-tunes, pero no se detalla la tecnica exacta empleada. Tampoco se especifica si la base es un transformer denso convencional o si incorpora componentes adicionales.

El unico dato tecnico concreto sobre la composicion es la mencion a una "vision tower" copiada sin cambios del "pinned Qwen parent" del pool, lo que implica que el modelo base cribl-decision-2-4B es multimodal (texto e imagen) y que su componente visual deriva de un modelo de la familia Qwen. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. Todos estos datos deben considerarse no disponibles.

## Capacidades

- Generacion de texto: capacidad basica esperada de un modelo de 4B, sin documentacion especifica de rendimiento.
- Procesamiento de vision: la model card menciona una torre de vision heredada de un parent Qwen, por lo que es probable que acepte entradas de imagen, aunque no se documenta el formato ni el soporte real.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidades de codigo y matematicas: no disponible.

## Casos de uso

- Experimentacion local con modelos de ~4B: el tamano de 4.539 millones de parametros y la licencia Apache 2.0 permiten probar el modelo en una GPU de consumo con cuantizacion, aunque no se documenten las variantes cuantizadas disponibles.
- Fine-tuning adicional sobre una base permisiva: al heredar licencia Apache 2.0, el modelo puede servir como punto de partida para ajustes especificos de dominio sin restricciones de uso comercial, siempre que se respeten las condiciones de la licencia del modelo base.
- Investigacion sobre tecnicas de model soup: el modelo es un ejemplo publico de mezcla de pesos sobre una base de 4B, util para estudiar el efecto de estas tecnicas en modelos pequenos.
- Prototipado de aplicaciones multimodales: la presencia de una torre de vision permite explorar pipelines de imagen y texto en entornos de bajo presupuesto de computo, aunque sin garantias documentadas de calidad.
- Evaluacion comparativa de fine-tunes comunitarios: util para investigadores que comparan variantes derivadas de cribl-decision-2-4B y quieren medir el impacto de los pesos mezclados.
- Despliegue en entornos con requisitos de VRAM moderados: con 9,1 GB de pesos en safetensors, el modelo puede caber en GPUs de 16-24 GB en precision completa o en GPUs de 8-12 GB con cuantizacion, aunque esta ultima no este publicada en el repo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 9,1 GB, por lo que en precision completa (probablemente bf16/fp16) se necesitan al menos 10-12 GB de VRAM contando cache de activaciones y contexto. Con cuantizacion a 8 bits se estimaria en torno a 5-6 GB, y a 4 bits en torno a 3-4 GB, pero no se publican variantes cuantizadas.
- GPU recomendadas: para precision completa, una RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) ofrecen margen sobrado; una RTX 3090 (24 GB) o RTX 4080 (16 GB) tambien serian suficientes.
- Cabe en GPU de consumo: si, en GPUs de 16 GB o mas en precision completa; en GPUs de 8-12 GB seria necesario cuantizar, lo que requiere generar los pesos cuantizados por cuenta propia.
- Opciones de despliegue: al ser safetensors, es compatible con vLLM, TGI, transformers y llama.cpp (previa conversion a GGUF). No se documenta compatibilidad especifica con Ollama ni se incluyen ficheros GGUF en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-mini-cribl-2 | 4.539 M | no disponible | Apache 2.0 | safetensors en HF |
| cribl-ai/cribl-decision-2-4B (base) | ~4B (no confirmado) | no disponible | Apache 2.0 (segun la model card del fine-tune) | HF |
| Qwen2.5-3B / Qwen2.5-7B | 3B / 7B | 32K (tipico en la familia Qwen2.5) | Apache 2.0 | HF, multiples formatos |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 Community License | HF, GGUF, Ollama |

La comparativa se limita a datos de parametros y licencia, ya que no hay benchmarks publicados del modelo. Frente a alternativas consolidadas como Qwen2.5 o Llama 3.2, zils-mini-cribl-2 carece de documentacion de contexto, idiomas y rendimiento, lo que dificulta una evaluacion objetiva.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se especifican datos de entrenamiento, contexto, idiomas ni benchmarks, lo que impide evaluar su calidad antes de desplegarlo.
- Riesgo de alucinacion: sin datos de evaluacion, no se puede estimar la tasa de alucinacion; se debe asumir el riesgo tipico de un modelo de 4B sin ajuste documentado.
- Sesgos conocidos: no disponibles; al no documentarse el dataset de entrenamiento, no es posible identificar sesgos especificos.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto y los idiomas soportados, lo que es un riesgo para produccion multilingue o con documentos largos.
- Restricciones de licencia: la licencia declarada es Apache 2.0, permisiva para uso comercial, pero se debe verificar que la licencia del modelo base cribl-ai/cribl-decision-2-4B y del parent Qwen de la torre de vision sean compatibles con el uso previsto.
- Cero adopcion: con 0 descargas y 0 likes, no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- Modelo "soup": las mezclas de pesos pueden producir comportamientos impredecibles en tareas especificas; sin evaluacion, conviene validar exhaustivamente antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anddyworld/zils-mini-cribl-2
- Modelo base: https://huggingface.co/cribl-ai/cribl-decision-2-4B
- Revision del modelo base citada: 317e53b77f62011f442f56cb7c5032484fadd850
