# AhmedReda25300/Ara-JEV

## Resumen

Ara-JEV es un modelo compacto de decisión en árabe, ajustado a partir de Qwen3.5-0.8B mediante LoRA (rango 16) con los adaptadores ya fusionados en los pesos base. Fue desarrollado por AhmedReda25300 y está publicado en Hugging Face bajo licencia Apache-2.0. Su propósito es resolver tareas de decisión y enrutamiento en árabe: dado un estado (contexto breve), una pregunta y un conjunto opcional de opciones candidatas, el modelo selecciona la mejor etiqueta de respuesta.

A diferencia de un modelo conversacional generalista, Ara-JEV está optimizado para clasificación de decisiones con etiquetas restringidas, lo que lo hace adecuado para flujos de enrutamiento, priorización y respuestas binarias en árabe. El repositorio contiene un checkpoint standalone de unos 853 millones de parámetros (1,7 GB en safetensors), lo que permite desplegarlo en hardware modesto con vLLM o Transformers. Su relevancia reside en ofrecer un modelo especializado y ligero para tareas de decisión en árabe, un idioma con menos modelos especializados disponibles, con latencias de inferencia muy bajas documentadas sobre GPU NVIDIA A40.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 conditional-generation (transformer decoder, image-text-to-text) |
| Parametros totales | 852.985.920 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a modelo denso) |
| Longitud de contexto | 8192 tokens (según el ejemplo de despliegue con vLLM) |
| Tipos de cuantizacion | no disponible (documentado en bfloat16; no hay checkpoints cuantizados publicados) |
| Idiomas soportados | Arabe (especializado); rendimiento en otros idiomas no establecido |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint fusionado, sin adaptador LoRA separado) |

## Arquitectura y entrenamiento

Ara-JEV parte de Qwen/Qwen3.5-0.8B, un modelo de generación condicional de la familia Qwen3.5 con capacidades image-text-to-text. Sobre esta base se aplicó un fine-tuning con LoRA de rango 16 durante una única época, utilizando datasets árabes de decisión y razonamiento deduplicados. El checkpoint publicado es un modelo fusionado (merged): los pesos LoRA se integraron en los pesos base, de modo que no es necesario cargar un adaptador independiente y el modelo funciona como un checkpoint estándar de Transformers.

Una particularidad notable es que el repositorio incluye código personalizado con un método `predict` integrado en la clase del modelo, que gestiona la construcción del prompt y la puntuación restringida de opciones de forma conjunta. Esto simplifica la evaluación y el despliegue: basta pasar el estado, la pregunta y las opciones, y el modelo devuelve la etiqueta elegida (texto para opciones sí/no en árabe, índice entero de base cero para otras listas). No se ha publicado información sobre el número exacto de tokens de entrenamiento ni sobre el uso de RLHF/DPO.

## Capacidades

- Seleccion de la mejor opcion entre candidatas dadas: dado un estado, una pregunta y una lista de opciones, puntua las etiquetas permitidas y elige la de mayor puntuacion.
- Respuestas binarias (si/no) en arabe para preguntas de decision.
- Puntuacion y priorizacion: asignacion de niveles (por ejemplo, prioridad baja/media/alta) sobre incidencias o situaciones descritas en arabe.
- Comprension de arabe dialectal: los ejemplos de la model card usan arabe egipcio coloquial ("dulokti", "delokti") sin necesidad de metadatos de dialecto.
- Pipeline de text-generation compatible con Transformers (>= 5.17) y con vLLM (probado con la version 0.32.0).
- Metodo `predict` integrado que encapsula la construccion del prompt y la puntuacion de opciones (requiere `trust_remote_code=True`).
- Etiquetado image-text-to-text heredado del modelo base, aunque la model card solo documenta uso con texto; capacidades visuales no verificadas en la evaluacion publicada.

## Casos de uso

- Enrutamiento de tickets de soporte: dada la descripcion de una incidencia en arabe (estado), el modelo asigna una prioridad (baja, media, alta) entre opciones candidatas, permitiendo triaje automatico antes de la revision humana. Su latencia media de ~61 ms por peticion lo hace viable para alto volumen.
- Respuestas binarias automaticas: preguntas de tipo "¿ha comenzado la reunion?" o "¿es necesario escalar?" a partir de un estado contextual, utiles en asistentes y bots de atencion al cliente en arabe.
- Decisiones conversacionales contextuales: integracion en agentes que necesitan elegir entre acciones discretas segun el estado de la conversacion, aprovechando la ventana de 8192 tokens para mantener contexto de multiples turnos.
- Moderacion y clasificacion de contenidos en arabe: decidir si un mensaje requiere accion, entre un conjunto cerrado de etiquetas, con puntuacion restringida que reduce la salida libre y el riesgo de respuestas fuera de formato.
- Sistemas de decision embebidos o de bajo coste: con menos de 1 GB de pesos en bfloat16, puede desplegarse en GPUs de consumo o instancias cloud pequenas para procesos por lotes de decision masiva.
- Prototipado rapido de pipelines de decision en arabe: el metodo `predict` integrado permite construir demos y pruebas de concepto sin gestionar manualmente prompts ni logica de scoring.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de test reservado de 10.419 ejemplos, usando puntuacion restringida de etiquetas candidatas (no generacion libre):

| Tipo de pregunta | Correctos | Ejemplos | Precision |
|---|---:|---:|---:|
| Choice (opcion multiple) | 6.901 | 7.016 | 98,36% |
| Yes/no (noul) | 2.265 | 2.772 | 81,71% |
| Score (puntuacion) | 601 | 631 | 95,25% |

Latencia medida con vLLM 0.32.0 sobre NVIDIA A40, bfloat16, peticiones secuenciales tras cinco peticiones de calentamiento (muestra de 100 ejemplos):

| Metrica | Resultado |
|---|---:|
| Latencia media | 61,3 ms/peticion |
| Latencia mediana | 59,9 ms/peticion |
| Latencia percentil 95 | 71,3 ms/peticion |
| Throughput secuencial | 16,3 peticiones/segundo |

No se han publicado comparaciones con otros modelos (MMLU, HumanEval, GSM8K u otros benchmarks estandar) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7-2 GB en bfloat16 (tamano del repo: 1,7 GB), mas overhead de runtime y KV cache; cabe comodamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU moderna de consumo (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; el benchmark publicado se realizo sobre NVIDIA A40.
- Consumer GPU: si, el modelo cabe sin problemas en la mayoria de GPUs de consumo actuales incluso sin cuantizacion.
- Despliegue: Transformers (>= 5.17, con `trust_remote_code=True` y `AutoModelForImageTextToText`) y vLLM (probado con 0.32.0, recomendado `--max-model-len 8192`). No se menciona soporte verificado en llama.cpp, Ollama o TGI.
- Rendimiento conocido: 61,3 ms de latencia media y 16,3 peticiones/segundo en modo secuencial sobre A40 en bfloat16; en GPUs de consumo el rendimiento sera inferior, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Ara-JEV | 853 M | 8192 | Decision/clasificacion en arabe (fine-tune LoRA) | Apache-2.0 |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Modelo generalista image-text-to-text | Apache-2.0 |
| Modelos arabes especializados de tamano comparable (p. ej., variantes pequenas de Jais o ALLaM) | no disponible | no disponible | Lenguaje general en arabe | no disponible |

No hay datos de rendimiento comparativo publicados entre estos modelos; la comparativa se limita a caracteristicas declaradas. La ventaja diferencial de Ara-JEV es su especializacion en tareas de decision con etiquetas restringidas y su metodo `predict` integrado, frente a los modelos base generalistas.

## Limitaciones y advertencias

- El subconjunto de preguntas si/no es la debilidad principal (81,71% de precision); evitar o validar con cuidado en tareas de decision binaria o con componente aritmetica.
- La precision publicada corresponde a evaluacion con etiquetas candidatas conocidas (puntuacion restringida), no a generacion libre: no debe interpretarse como capacidad de razonamiento abierto o comprension general del arabe.
- El rendimiento en dialectos, dominios y tareas no representados en los datos de evaluacion no ha sido establecido; los ejemplos sugieren familiaridad con arabe egipcio coloquial, pero no hay cobertura documentada de otros dialectos.
- La precision agregada oculta variabilidad por tipo de pregunta; validar sobre datos representativos del caso de uso antes de desplegar en produccion.
- El modelo no sustituye la revision experta en decisiones de alto impacto.
- Requiere `trust_remote_code=True` para cargar el metodo `predict` personalizado, lo que implica ejecutar codigo del repositorio; revisarlo antes de usar en entornos sensibles.
- No se dispone de checkpoints cuantizados (GGUF, int4, etc.) ni de informacion sobre sesgos del modelo o riesgos de alucinacion mas alla de lo indicado por el autor.
- Solo una epoca de fine-tuning: posible margen de mejora, pero tambien posible sobreajuste limitado al dominio de los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AhmedReda25300/Ara-JEV
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
