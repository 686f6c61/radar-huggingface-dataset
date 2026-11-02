# AlisherAmirbek/Qwen3.6-35B-A3B-heretic-dialog-lora

## Resumen

`AlisherAmirbek/Qwen3.6-35B-A3B-heretic-dialog-lora` es un adaptador LoRA de ajuste supervisado (SFT) publicado en HuggingFace por el usuario AlisherAmirbek. No se trata de un modelo completo, sino de un delta de pesos (formato PEFT/safetensors) que debe aplicarse sobre el modelo base `llmfan46/Qwen3.6-35B-A3B-uncensored-heretic`, a su vez una variante "uncensored/heretic" de la familia Qwen3.6 con arquitectura MoE (35B totales, 3B activos, segun la nomenclatura del identificador).

El adaptador esta orientado a conversacion: la unica documentacion sustantiva de la model card describe una actualizacion de "dialog SFT" con 996 ejemplos de entrenamiento y 100 de validacion, en la que se reescribieron 527 respuestas objetivo para anadir explicaciones, matices y ejemplos. El objetivo declarado es mejorar la calidad y profundidad de las respuestas conversacionales del modelo base, no anadir capacidades nuevas.

Su relevancia es limitada y muy especifica: se trata de un experimento de la comunidad con 163 descargas y 1 "like" en el momento de redactar esta ficha, sin licencia declarada, sin idiomas declarados y con una model card generada a partir de la plantilla por defecto de HuggingFace en la que la mayoria de los campos figuran como "[More Information Needed]". Cualquier evaluacion rigurosa debe hacerse contra el modelo base, cuyas especificaciones no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelo base MoE; arquitectura del base no detallada en la informacion disponible |
| Parametros totales | 35B en el modelo base (segun identificador); tamano del adaptador no disponible |
| Parametros activos | 3B en el modelo base (segun identificador "A3B"); no confirmado en documentacion |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; el base podria cuantizarse, pero no se documenta |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT), libreria `peft` 0.19.1 |
| Tamano del repositorio | 48,6 GB |
| Modelo base | `llmfan46/Qwen3.6-35B-A3B-uncensored-heretic` |
| Framework de entrenamiento | TRL + Unsloth (segun tags) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. Los tags indican `peft`, `lora`, `sft`, `transformers`, `trl` y `unsloth`, lo que sugiere un entrenamiento supervisado de ajuste fino con las librerias TRL y Unsloth sobre el checkpoint `llmfan46/Qwen3.6-35B-A3B-uncensored-heretic`. La arquitectura subyacente corresponde al modelo base (familia Qwen3.6, presumiblemente un transformer con mezcla de expertos de 35B parametros totales y 3B activos, a juzgar por el identificador), pero no se aporta ninguna especificacion tecnica verificable sobre atencion, normalizacion, tokenizador ni estrategia de enrutamiento de expertos.

La unica informacion concreta sobre el entrenamiento aparece en la seccion "Dialog training update — 2026-11-02" de la model card: 996 ejemplos de entrenamiento y 100 de validacion sin modificar; de 689 objetivos elegibles no pertenecientes a HOT.com se revisaron y reescribieron 527, pasando de una longitud media de 55,4 palabras a 112,1 palabras (mediana de 110); se preservaron los 307 casos excluidos de HOT.com y el contexto privado del agente; se realizo una epoca con 249 pasos de optimizador, batch efectivo de 4 (microbatch 1, acumulacion de gradientes 4) y validacion cada 50 pasos. No se documentan hiperparametros de LoRA (rango, alpha, dropout), tasa de aprendizaje, precision numerica ni composicion del dataset. No hay evidencia de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base y ajustada mediante SFT de dialogo.
- Respuestas con mayor extension y explicaciones adicionales: el entrenamiento reescribio respuestas breves (media de 55,4 palabras) hacia respuestas mas desarrolladas (media de 112,1 palabras).
- Diferenciaciones y ejemplos anadidos en las respuestas, segun la descripcion del autor.
- Preservacion de casos de "brevedad explicita" y "evidencia limitada": el autor indica que las peticiones breves de enlaces y los casos de poca evidencia se mantienen cortos.
- Razonamiento, codigo, matematicas, vision, tool calling, agentes y capacidades multilingues: no disponibles en la informacion proporcionada para este adaptador; dependen del modelo base y no se documentan.
- Modo "thinking": no disponible.
- Capacidad "uncensored": heredada del nombre del modelo base, pero sin documentacion tecnica que la respalde en esta ficha.

## Casos de uso

- Prototipado de asistentes conversacionales con respuestas mas explicativas: el adaptador esta entrenado especificamente para alargar y enriquecer respuestas de dialogo, por lo que encaja en bots de soporte o tutoria donde se prefieren explicaciones detalladas a respuestas telegraficas.
- Investigacion sobre SFT de dialogo: los datos publicados (996 ejemplos, 527 reescrituras, metricas de longitud antes/despues) permiten reproducir o comparar metodologias de reescritura de objetivos en ajuste supervisado.
- Experimentacion con modelos "uncensored" en entornos controlados: util para estudiar el comportamiento de variantes sin alineacion estricta, siempre con revision humana y filtros externos.
- Generacion de contenido divulgativo o educativo que requiera parrafos explicativos con ejemplos y matices, aprovechando el sesgo del entrenamiento hacia respuestas de ~110 palabras.
- Evaluacion comparativa de adaptadores LoRA sobre un mismo base: sirve como punto de referencia para medir el efecto de un SFT de dialogo pequeno (menos de 1000 ejemplos) frente al modelo base sin adaptador.
- Base para futuros ajustes de dominio: al ser un adaptador PEFT, puede combinarse o sustituirse por otros adaptadores sobre el mismo checkpoint base en pipelines de experimentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica estandar, y tampoco se aportan resultados de evaluacion cualitativa mas alla de las estadisticas de longitud de las respuestas reescritas durante el entrenamiento.

## Requisitos de hardware

- El repositorio ocupa 48,6 GB, lo que sugiere que incluye pesos en precision completa o alta del adaptador y posiblemente artefactos adicionales; el tamano exacto del delta LoRA no se detalla.
- Para inferencia es necesario cargar el modelo base `llmfan46/Qwen3.6-35B-A3B-uncensored-heretic` (35B parametros totales) mas el adaptador. Con cuantizacion de 4 bits, un MoE de 35B requiere del orden de 18-22 GB de VRAM solo para pesos, mas overhead de contexto y cache KV; estas cifras son estimaciones de orden de magnitud, no datos publicados.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano del base, serian necesarias GPUs de 24 GB o mas (RTX 4090, L40S, A100 40/80 GB, H100) segun cuantizacion y longitud de contexto.
- Viabilidad en GPU de consumo: probable solo con cuantizacion agresiva y contexto corto; no confirmado por el autor.
- Opciones de despliegue: al ser un adaptador PEFT, requiere `transformers` + `peft` (version 0.19.1 segun la model card). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la conversion a GGUF no esta indicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (Qwen3.6-35B-A3B-heretic-dialog-lora) | 35B base / 3B activos (segun ID) | no disponible | no disponible | HuggingFace, 163 descargas | LoRA SFT de dialogo, 996 ejemplos |
| `llmfan46/Qwen3.6-35B-A3B-uncensored-heretic` (base) | 35B / 3B activos (segun ID) | no disponible | no disponible | HuggingFace | Modelo base sin el ajuste de dialogo |
| Otros adaptadores LoRA de dialogo sobre Qwen3.6 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas de la misma categoria (mismo tamano o misma tarea) en terminos de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- Model card incompleta: la mayoria de campos (autoria, licencia, idiomas, datos, hiperparametros, evaluacion) figuran como "[More Information Needed]".
- Licencia no declarada: no puede asumirse uso comercial; la ausencia de licencia explicita impide determinar los terminos de redistribucion y explotacion.
- Modelo base "uncensored/heretic": el nombre sugiere ausencia de alineacion estricta, con riesgo elevado de generar contenido inapropiado, sesgado o danino; requiere filtros y supervision humana en produccion.
- Riesgo de alucinacion: no evaluado; el entrenamiento con solo 996 ejemplos no aporta garantias de factualidad y el sesgo hacia respuestas mas largas puede aumentar la verbosidad sin mejorar la precision.
- Sesgos conocidos: no documentados, pero heredados del modelo base y del dataset de dialogo, cuya composicion no se describe (se menciona una exclusion de casos "HOT.com" sin explicar el criterio).
- Limitaciones de contexto e idioma: no disponibles; no se especifica ventana de contexto ni cobertura linguistica.
- Entrenamiento muy pequeno (una epoca, 249 pasos, batch efectivo 4): riesgo de sobreajuste a los 996 ejemplos y de degradacion de capacidades generales del base.
- Sin benchmarks: no hay evidencia cuantitativa de mejora frente al modelo base.
- Repositorio de 48,6 GB: coste de almacenamiento y descarga considerable para un adaptador, sin desglose de contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AlisherAmirbek/Qwen3.6-35B-A3B-heretic-dialog-lora
- Modelo base: https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic
- Referencia citada en los tags (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Repositorio, paper o demo adicionales: no disponibles en la informacion proporcionada.
