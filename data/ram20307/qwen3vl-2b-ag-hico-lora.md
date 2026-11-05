# Ram20307/qwen3vl-2b-ag-hico-lora

## Resumen

`qwen3vl-2b-ag-hico-lora` es un adaptador LoRA desarrollado por el usuario Ram20307 sobre el modelo base `Qwen/Qwen3-VL-2B-Instruct`, un modelo vision-language de 2 mil millones de parametros de la familia Qwen3-VL de Alibaba. El adaptador esta especializado en la extraccion de grafos de escena y en la deteccion de interacciones persona-objeto (human-object interaction, HOI), tareas en las que el modelo base sin ajustar rinde de forma muy deficitaria.

El adaptador se ha entrenado sobre una mezcla de dos conjuntos de datos de referencia en vision por computador: Action Genome (derivado de Charades) y HICO-DET. El objetivo es que el modelo, dado un frame o una imagen, devuelva una estructura JSON con los objetos presentes y las relaciones o interacciones asociadas (atencion, espacialidad, contacto en el formato Action Genome; listas de interacciones por objeto en el formato HICO-DET). Es relevante porque demuestra que un VLM pequeno de 2B, con un LoRA de rango 16, puede pasar de una validez JSON del 71,5 % a practicamente el 100 % y multiplicar el recall en HICO-DET de 0,09 a 0,71.

Se trata de un artefacto de investigacion con conjuntos de entrenamiento y evaluacion pequenos (unos 4k muestras por dataset, tests de 199 y 200 imagenes), sin barras de error y con restricciones de licencia derivadas de los datasets de origen. No es un modelo para produccion, sino una prueba de concepto reproducible de ajuste fino eficiente para tareas estructuradas de scene understanding.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer vision-language Qwen3-VL-2B-Instruct |
| Parametros totales | No disponible (adaptador LoRA r=16, alpha=32; el modelo base tiene 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-VL-2B-Instruct; no especificada en la model card) |
| Tipos de cuantizacion | No disponible (entrenado en bf16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | No disponible (la model card no declara idiomas; las tareas son de vision, con etiquetas en ingles) |
| Licencia | Apache 2.0 para el adaptador; datos de Action Genome/Charades y HICO-DET con uso restringido a investigacion |
| Formato de pesos | safetensors (adaptador PEFT), libreria `peft` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 en precision bf16, aplicado sobre el VLM `Qwen3-VL-2B-Instruct`. No se modifican los pesos del modelo base; se anaden matrices de bajo rango en las capas seleccionadas, lo que reduce drasticamente el coste de almacenamiento (el repositorio ocupa 0,1 GB) y de entrenamiento. El entrenamiento se realizo durante 2 epocas con un batch efectivo de 16 y aproximadamente 4.000 muestras por dataset, mezclando Action Genome y HICO-DET.

El adaptador soporta dos formatos de prompt diferenciados. Para Action Genome, el modelo devuelve por cada objeto sus atributos de atencion, espacialidad y contacto. Para HICO-DET, devuelve una lista JSON con la forma `[{"object": <nombre>, "interaction": [..]}]`. Esta dualidad de formatos es la innovacion practica principal: un mismo adaptador cubre dos esquemas de anotacion HOI distintos. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; el entrenamiento es supervisionado sobre pares imagen-etiqueta estructurada.

## Capacidades

- Generacion de texto estructurado en JSON a partir de imagenes, con validez de sintaxis practicamente total tras el ajuste (199/199 en AG, 200/200 en HICO-DET).
- Extraccion de grafos de escena en formato Action Genome: relaciones de atencion, espaciales y de contacto por objeto.
- Deteccion de interacciones persona-objeto en formato HICO-DET: lista de objetos con sus interacciones asociadas.
- Comprension de imagen y texto combinados (pipeline `image-text-to-text`).
- Razonamiento visual basico heredado del modelo base Qwen3-VL-2B-Instruct.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modos de pensamiento extendido en la model card del adaptador.

## Casos de uso

- Anotacion asistida de datasets HOI: el adaptador puede preetiquetar frames de video o imagenes con objetos e interacciones en formato Action Genome o HICO-DET, reduciendo el trabajo manual de anotadores antes de una revision humana. Su recall de 0,71 en HICO-DET lo hace util como generador de propuestas, no como anotador final.
- Prototipado de sistemas de vigilancia o analisis de comportamiento: dado un frame, extraer que objetos hay y como interactua una persona con ellos (por ejemplo, "persona sosteniendo taza") para alimentar reglas de negocio o alertas.
- Investigacion en scene graph generation: servir como baseline reproducible y ligero (adaptador de 0,1 GB) para comparar metodos de ajuste fino eficiente en tareas estructuradas de vision.
- Indexado semantico de imagenes o video: generar descripciones estructuradas de objetos y relaciones para motores de busqueda visual o sistemas de recuperacion.
- Robotica de bajo coste y prototipos de percepcion: usar el modelo en un equipo con GPU de consumo para obtener representaciones estructuradas del entorno antes de integrar un pipeline de planificacion.
- Educacion y demos de vision-language: ilustrar en un cuaderno o demo interactiva como un VLM pequeno pasa de salidas JSON invalidas a estructuradas tras un LoRA de rango bajo, con metricas antes y despues documentadas.

## Benchmarks y rendimiento

Los resultados publicados por el autor miden recall (R) y precision (P) de coincidencias exactas de pares (objeto, relacion) sobre conjuntos de test pequenos y una sola ejecucion, sin barras de error.

| Modelo / configuracion | Test | JSON valido | Recall | Precision |
|---|---|---|---|---|
| Adaptador AG+HICO (este) | AG (199 frames) | 199/199 | 0,32 | 0,43 |
| Adaptador AG+HICO (este) | HICO-DET (200 imagenes) | 200/200 | 0,71 | 0,82 |
| Base sin ajustar | HICO-DET (200 imagenes) | 143/200 | 0,09 | 0,04 |
| Adaptador solo AG | HICO-DET (200 imagenes) | 191/200 | 0,04 | 0,04 |
| Adaptador solo AG | AG (199 frames) | No disponible | 0,31 | 0,45 |

El salto mas claro se produce en HICO-DET: el recall pasa de 0,09 (base) a 0,71 con el adaptador mixto, y la validez JSON de 143/200 a 200/200. En Action Genome el adaptador mixto obtiene un recall de 0,32, ligeramente superior al 0,31 del adaptador solo AG, con precision algo menor (0,43 frente a 0,45).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 2B en bf16 requiere aproximadamente 4-5 GB de VRAM; en cuantizacion de 8 bits, alrededor de 2,5-3 GB; en 4 bits, en torno a 1,5-2 GB. El adaptador LoRA anade un coste marginal (0,1 GB en disco).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3070/4060 Ti, RTX 4080, RTX 4090, A10, L4); para despliegues con mayor concurrencia, A100 o H100.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas en bf16 y en tarjetas de 4-6 GB con cuantizacion.
- Opciones de despliegue: al ser un adaptador PEFT sobre Qwen3-VL-2B-Instruct, puede servirse con vLLM o TGI cargando el adaptador, o con transformers + PEFT en scripts de inferencia. No se documenta soporte directo en llama.cpp u Ollama para adaptadores de modelos vision-language de esta familia en la informacion disponible.
- Latencia y throughput: no disponibles en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3vl-2b-ag-hico-lora (este) | Adaptador sobre 2B | No disponible | HOI / scene graph (AG + HICO-DET) | Apache 2.0 (adaptador); datos de investigacion | HuggingFace, 0 descargas |
| Qwen/Qwen3-VL-2B-Instruct (base) | 2B | No disponible | Vision-language general | Apache 2.0 | HuggingFace, ampliamente usado |
| Ram20307/qwen3vl-2b-ag-lora | Adaptador sobre 2B | No disponible | HOI solo Action Genome | Apache 2.0 (adaptador); datos de investigacion | HuggingFace |
| Otros adaptadores HOI sobre VLMs pequenos | No disponible | No disponible | HOI | No disponible | No disponible |

La comparativa directa con alternativas de la misma categoria (adaptadores HOI sobre VLMs de 2B) no esta disponible en la informacion proporcionada. Frente al modelo base, la diferencia medible es la validez JSON y el recall en HICO-DET; frente al adaptador solo AG, la mejora es la cobertura del formato HICO-DET a costa de un recall ligeramente menor en AG.

## Limitaciones y advertencias

- Conjuntos de entrenamiento y test muy pequenos (aproximadamente 4k muestras por dataset, tests de 199 y 200 imagenes) y una sola ejecucion: no hay barras de error ni validacion cruzada, por lo que las metricas son orientativas.
- El recall en Action Genome es bajo (0,32), lo que limita su uso como anotador automatico fiable en ese formato.
- Riesgo de alucinacion inherente a los VLM: puede generar objetos o interacciones plausibles pero ausentes en la imagen; la validez JSON no garantiza correccion semantica.
- Los datos de Action Genome/Charades tienen licencia de uso no comercial para investigacion, y HICO-DET tiene sus propios terminos de uso restringido a investigacion; el adaptador debe tratarse como material de investigacion y educacion, no para produccion comercial sin revisar esas condiciones.
- No se documentan sesgos especificos, cobertura idiomatica ni rendimiento fuera de los dominios de AG y HICO-DET.
- El repositorio no tiene descargas ni likes y fue creado en noviembre de 2026, por lo que no hay evidencia de uso comunitario ni validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ram20307/qwen3vl-2b-ag-hico-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Adaptador solo Action Genome: https://huggingface.co/Ram20307/qwen3vl-2b-ag-lora
- Action Genome (dataset): no disponible en la informacion proporcionada
- HICO-DET (dataset): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Demo o repositorio de codigo: no disponible en la informacion proporcionada
