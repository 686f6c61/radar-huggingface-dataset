# onethreedlee/smolvlm2-chartqa-unit4-lora

## Resumen

`onethreedlee/smolvlm2-chartqa-unit4-lora` es un adaptador LoRA (PEFT) entrenado mediante SFT con la libreria TRL sobre el modelo vision-lenguaje `HuggingFaceTB/SmolVLM2-2.2B-Instruct`. El nombre del repositorio sugiere un ajuste orientado a tareas de respuesta sobre graficos (ChartQA), aunque la model card publicada no documenta el dataset, el procedimiento de entrenamiento ni los hiperparametros empleados. No se trata por tanto de un modelo autonomo, sino de un delta de pesos que debe cargarse junto con el modelo base.

El interes de esta publicacion es limitado y fundamentalmente metodologico: ejemplifica el flujo de trabajo estandar de ajuste fino con TRL y PEFT sobre un VLM pequeno (2.2B parametros), un escenario habitual cuando se quiere especializar un modelo multimodal en un dominio concreto sin disponer de GPUs de gran capacidad. Al ser un adaptador, el coste de almacenamiento y de ajuste es muy bajo en comparacion con un fine-tuning completo.

Conviene senalar que el repositorio presenta senales claras de ser una publicacion de prueba o un experimento inacabado: 0 descargas, 0 likes, un tamano de repositorio de 0.0 GB reportado, una model card autogenerada con campos sin rellenar (por ejemplo, `model="None"` en el ejemplo de uso) y un ejemplo de prompt que no tiene relacion con graficos. La licencia, los idiomas soportados y el contexto maximo no estan declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un modelo vision-lenguaje transformer `SmolVLM2-2.2B-Instruct` |
| Parametros totales | No disponible para el adaptador (tamano de repositorio reportado: 0.0 GB). Modelo base: 2.2B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (adaptador distribuido en safetensors; no se documentan cuantizaciones del conjunto adaptador + base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card incluye el campo `licence: license` sin texto legal asociado) |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Modelo base | HuggingFaceTB/SmolVLM2-2.2B-Instruct |
| Libreria | PEFT 0.17.1 / Transformers 4.56.2 |
| Metodo de entrenamiento | SFT con TRL 0.22.2 |
| Entorno de entrenamiento | PyTorch 2.8.0, Datasets 4.8.5, Tokenizers 0.22.2 |
| Fecha de creacion | 2026-10-09 (segun metadatos del repositorio) |
| Fecha de actualizacion | 2026-10-09 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `HuggingFaceTB/SmolVLM2-2.2B-Instruct`, un modelo de la familia SmolVLM2 de Hugging Face, disenado para tareas de vision y lenguaje en el rango de los 2B parametros. La informacion proporcionada no incluye la ficha del modelo base, por lo que no se detallan aqui la arquitectura exacta del codificador visual, la del decodificador de lenguaje, la longitud de contexto soportada ni la composicion del corpus de preentrenamiento. Lo unico confirmado es que el adaptador es un LoRA entrenado con `SFTTrainer` de TRL 0.22.2 y guardado en formato PEFT.

No se especifican en la model card ni el dataset de ajuste (aunque el nombre del repositorio apunta a ChartQA), ni el numero de ejemplos, ni la configuracion de LoRA (rango, alpha, modulos objetivo), ni la estrategia de enmascarado de perdida, ni si se entreno solo el proyector multimodal o tambien las capas de atencion del decodificador. Tampoco hay informacion sobre uso de RLHF, DPO u optimizacion posterior al SFT. En consecuencia, cualquier afirmacion sobre capacidades especificas de este adaptador seria especulativa.

## Capacidades

- Generacion de texto conversacional: la etiqueta de pipeline declarada es `text-generation` y el modelo base es de tipo instruct, por lo que el adaptador hereda la interfaz de chat multi-turno.
- Procesamiento de imagenes: al estar construido sobre un modelo vision-lenguaje, la capacidad multimodal depende enteramente del modelo base; la informacion proporcionada no detalla que tareas visuales se han reforzado con el ajuste.
- Respuesta a preguntas sobre graficos: inferida unicamente del nombre del repositorio (`chartqa`); no confirmada por la model card ni por resultados publicados.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Modo "thinking" o decodificacion extendida: no disponible.

## Casos de uso

- Extraccion estructurada de graficos en informes financieros: cargando el adaptador sobre el modelo base, se podria intentar responder preguntas del tipo "cual fue el valor maximo de la serie" sobre figuras de informes trimestrales, siempre que el adaptador se haya entrenado sobre datos con ese formato. Requiere validacion previa, dado que no hay metricas publicadas.
- Digitalizacion de figuras de articulos cientificos: convertir graficos de dispersion o de barras en tablas de valores aproximados para revision manual posterior. El bajo coste de inferencia de un modelo de 2.2B lo hace viable sobre grandes volumenes de PDF, pero la exactitud no esta documentada.
- Enriquecimiento de bases de datos documentales: etiquetado automatico de figuras en repositorios corporativos para hacerlas consultables por texto, usando el adaptador como clasificador o generador de descripciones.
- Accesibilidad: generacion de descripciones textuales de graficos para lectores de pantalla en plataformas de publicacion de datos abiertos.
- Prototipado e investigacion en ajuste eficiente: el repositorio sirve como plantilla reproducible del flujo TRL + PEFT + Transformers 4.56.2 para experimentar con LoRA sobre VLMs de 2B en una unica GPU.
- Evaluacion comparativa de adaptadores de dominio: punto de partida para medir cuanto gana un VLM pequeno al especializarse en un dominio visual concreto frente al modelo base sin ajustar.
- Moderacion y control de calidad de dashboards: verificacion automatica de que un panel de control contiene las series y ejes esperados, como paso previo en un pipeline de publicacion.

En todos los casos, el uso en produccion exigiria antes una evaluacion propia: no hay licencia declarada, no hay benchmarks y el autor no aporta documentacion del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ningun tipo (ni exactitud en ChartQA, ni MMLU, ni comparaciones con el modelo base). El aviso de uso de este modelo debe ser proporcional a esa ausencia de evidencia: no hay datos que permitan afirmar que el ajuste mejora al modelo base en ninguna tarea.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros del modelo base (2.2B) y no han sido verificadas experimentalmente con este adaptador.

- Inferencia en bf16/fp16: aproximadamente 4,4 GB solo para los pesos del modelo base, mas el codificador visual y los estados intermedios; en la practica, del orden de 6 a 8 GB de VRAM para contexto moderado.
- Inferencia en int8: en torno a 3 a 5 GB de VRAM segun longitud de contexto y resolucion de imagen.
- Inferencia en int4: en torno a 3 a 4 GB de VRAM, con perdida de precision no cuantificada.
- GPU consumer: un modelo de 2.2B cabe con holgura en GPUs de 8 GB o mas (RTX 3060 Ti, RTX 3070, RTX 4060, RTX 4070, RTX 4090). En precision completa, 8 GB es el minimo recomendable; 12 GB o mas da margen para imagenes de alta resolucion y contextos largos.
- GPU de datacenter: A100, H100, L40S o similares no son necesarias para inferencia, aunque pueden usarse para servir muchas replicas concurrentes.
- Opciones de despliegue: `transformers` + `peft` es la via documentada en la propia model card. Para vLLM, TGI o llama.cpp seria necesario fusionar previamente el adaptador con el modelo base (`merge_and_unload`) y, en el caso de llama.cpp/Ollama, convertir a GGUF; no se confirma en la informacion disponible que exista soporte verificado de SmolVLM2 en esas herramientas.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `onethreedlee/smolvlm2-chartqa-unit4-lora` | Adaptador LoRA sobre base de 2.2B | No disponible | No disponible | Repositorio publico, 0 descargas | Sin benchmarks ni documentacion de datos |
| `HuggingFaceTB/SmolVLM2-2.2B-Instruct` (modelo base) | 2.2B | No disponible en la informacion proporcionada | No confirmada en la informacion proporcionada | Ampliamente disponible | Referencia directa de comparacion; el adaptador no publica mejora medible sobre el |
| Otros VLM pequenos (por ejemplo, familias de 2B a 3B tipo Qwen-VL o PaliGemma) | No disponible | No disponible | No disponible | No disponible | No se incluye informacion suficiente para una comparacion rigurosa |

No se dispone de datos de rendimiento del adaptador ni de sus alternativas en esta ficha, por lo que la comparativa se limita a datos estructurales. Cualquier eleccion entre estas opciones deberia basarse en una evaluacion propia sobre el caso de uso concreto.

## Limitaciones y advertencias

- Licencia sin definir: la model card contiene `licence: license` sin texto legal. No hay base juridica clara para uso comercial. Se debe contactar con el autor o abstenerse de usar el modelo en produccion.
- Ausencia total de benchmarks: no se demuestra que el ajuste mejore al modelo base en ChartQA ni en ninguna otra tarea. El nombre del repositorio no es evidencia de rendimiento.
- Dataset de entrenamiento no documentado: se desconoce la procedencia de los datos, su licencia y su posible sesgo. Esto impide evaluar riesgos de contaminacion de benchmarks y de sesgos de dominio.
- Riesgo de alucinacion: los VLM pequenos tienden a inventar valores numericos al leer graficos poco legibles o de baja resolucion. Sin metricas publicadas, este riesgo debe asumirse como alto y requiere verificacion humana.
- Model card autogenerada y no revisada: el ejemplo de codigo incluye `model="None"` y una pregunta generica que no tiene relacion con graficos, lo que sugiere que el repositorio no fue validado antes de publicarse. Cualquier instruccion de la model card debe tratarse con cautela.
- Actividad nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de mantenimiento ni de validacion por parte de la comunidad.
- Dependencia estricta del modelo base: el adaptador no funciona de forma autonoma y solo es valido combinado con la revision concreta de `SmolVLM2-2.2B-Instruct` sobre la que se entreno.
- Idiomas y contexto no declarados: se desconoce el comportamiento fuera del ingles y con entradas largas (multiples imagenes o conversaciones extensas).
- Fecha de creacion anomala: los metadatos indican 2026-10-09, lo que puede reflejar un error de reloj o un artefacto de generacion automatica del repositorio.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/onethreedlee/smolvlm2-chartqa-unit4-lora
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct
- Repositorio de TRL (framework de entrenamiento citado en la model card): https://github.com/huggingface/trl
- Documentacion de PEFT: no disponible en la informacion proporcionada
- Paper o informe tecnico del adaptador: no disponible
- Dataset de entrenamiento: no disponible
- Demo o space asociado: no disponible
- Resultados de benchmarks: no disponibles
