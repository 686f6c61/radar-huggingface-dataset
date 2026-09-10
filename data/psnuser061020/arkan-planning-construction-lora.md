# psnuser061020/arkan-planning-construction-lora

## Resumen

El modelo `psnuser061020/arkan-planning-construction-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario `psnuser061020` sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`. Se distribuye a traves de la libreria PEFT y el repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un adaptador de bajo rango y no con un modelo completo. El pipeline declarado es `text-generation` y el tag `conversational` sugiere un ajuste orientado a dialogo, aunque la model card no documenta ninguna tarea concreta.

El interes de este tipo de publicaciones es doble. Por un lado, demuestra el flujo habitual de especializacion de un modelo pequeno (3B) mediante LoRA, que permite adaptar un modelo abierto a un dominio concreto con un coste de entrenamiento y de almacenamiento muy bajo. Por otro lado, la publicacion carece practicamente de documentacion: la model card es la plantilla por defecto de HuggingFace con todos los campos marcados como `[More Information Needed]` (autoria, datos de entrenamiento, licencia, idiomas, hiperparametros y evaluacion). No se declara licencia, no se declaran idiomas y no hay resultados de evaluacion.

Por el nombre del repositorio ("planning construction") podria tratarse de un ajuste orientado a planificacion en el sector de la construccion, pero esto es una inferencia a partir del identificador y no un dato confirmado por el autor. Cualquier evaluacion en produccion deberia partir de una validacion empirica propia, dado que no hay informacion verificable sobre el dataset, el procedimiento de entrenamiento ni el rendimiento resultante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformador decoder-only denso (Qwen2.5). El adaptador usa PEFT; el numero de capas, rango y modulos objetivo no estan documentados |
| Parametros totales | No disponible el recuento del adaptador. El modelo base `Qwen2.5-3B-Instruct` declara 3,09 mil millones de parametros en su documentacion publica |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No especificada en la ficha del adaptador. El modelo base Qwen2.5-3B-Instruct declara 32.768 tokens de contexto en su documentacion publica |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors sin cuantizar; puede combinarse con versiones cuantizadas del modelo base (GGUF, AWQ, GPTQ) mediante los flujos estandar de PEFT, pero no hay datos publicados al respecto |
| Idiomas soportados | No disponible. El modelo base Qwen2.5 declara soporte para mas de 29 idiomas, incluidos castellano, ingles y chino |
| Licencia | No disponible. La ficha del adaptador no declara licencia; el modelo base Qwen2.5-3B-Instruct se distribuye bajo licencia Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tamano del repositorio | 0,1 GB |
| Version de PEFT | 0.20.0 |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Fecha de creacion | 2026-09-10 (segun los metadatos de HuggingFace) |
| Fecha de actualizacion | 2026-09-10 (segun los metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura del adaptador es LoRA sobre el modelo base Qwen2.5-3B-Instruct. Qwen2.5-3B-Instruct es un transformador decoder-only denso con atencion por consultas agrupadas (GQA) y normalizacion RMSNorm, preentrenado por Alibaba Cloud y posteriormente alineado mediante instrucciones. LoRA congela los pesos del modelo base e inserta matrices de bajo rango en determinadas proyecciones, de modo que solo se entrenan y almacenan esos parametros adicionales. Esto explica el tamano reducido del repositorio (0,1 GB) frente a los aproximadamente 6 GB que ocuparian los pesos completos en precision de 16 bits.

No hay informacion disponible sobre el procedimiento de entrenamiento. La model card no indica el numero de tokens de entrenamiento, la composicion del dataset, si se uso RLHF, DPO o SFT, ni los hiperparametros (rango, alpha, dropout, tasa de aprendizaje, numero de epocas, precision en coma flotante). Tampoco se especifica si el ajuste se realizo sobre instrucciones, sobre datos sinteticos o sobre un corpus de dominio. La unica referencia tecnica presente en los metadatos es `arxiv:1910.09700`, que corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono en aprendizaje automatico y que aparece citado en la plantilla por defecto de HuggingFace, no como referencia del entrenamiento.

## Capacidades

Debido a la ausencia de documentacion, las capacidades descritas a continuacion se derivan del modelo base y del proposito declarado del adaptador, no de una evaluacion del adaptador concreto:

- Generacion de texto conversacional en formato instruccion, heredada del ajuste de Qwen2.5-3B-Instruct.
- Razonamiento basico y respuesta a preguntas, con el limite propio de un modelo de 3B parametros.
- Generacion de codigo y asistencia en tareas de programacion sencillas, capacidad presente en el modelo base.
- Aritmetica y matematicas basicas, con errores frecuentes en calculos de varios pasos, como es habitual en modelos de este tamano.
- Soporte de tool calling o function calling: el modelo base Qwen2.5-Instruct soporta plantillas de llamada a herramientas; no esta confirmado que el adaptador LoRA preserve o mejore esta capacidad.
- Razonamiento multi-paso y uso en agentes: posible en teoria, sin evidencia publicada para este adaptador.
- Capacidades multilingues: dependen del modelo base; la ficha no declara idiomas del adaptador.
- Capacidades especiales (modo pensamiento explicito, vision, audio): no disponibles. Qwen2.5-3B-Instruct es un modelo exclusivamente de texto.

## Casos de uso

Los siguientes escenarios son aplicables a un adaptador LoRA sobre Qwen2.5-3B-Instruct, pero deben validarse empiricamente antes de usarse en produccion, dado que no existe evaluacion publicada:

- Prototipado rapido de asistentes conversacionales de dominio: el adaptador se carga sobre el modelo base en unos pocos segundos y permite probar si un ajuste de bajo rango mejora las respuestas en un vocabulario sectorial concreto (por ejemplo, terminologia de planificacion y construccion) sin necesidad de reentrenar el modelo completo.
- Despliegue en hardware de gama de consumo: al combinarse con el modelo base cuantizado a 4 bits, el conjunto cabe en GPUs con 4-6 GB de VRAM, lo que permite ejecutar un asistente especializado en un portatil con GPU integrada o una RTX 3060.
- Clasificacion y extraccion de informacion en documentos tecnicos: con contexto de hasta 32.768 tokens en el modelo base, puede procesar pliegos, memorias descriptivas o presupuestos y extraer campos estructurados (partidas, importes, plazos).
- Generacion de borradores de documentacion tecnica: redaccion asistida de memorias, informes de avance de obra o listados de tareas, con revision humana obligatoria por el riesgo de alucinacion.
- Backend de bajo coste para agentes con tool calling: integrado mediante vLLM con soporte multi-LoRA, permite servir varias variantes especializadas sobre un unico modelo base en la misma GPU, reduciendo coste de memoria frente a servir un modelo distinto por tarea.
- Investigacion sobre eficiencia de ajuste: el repositorio sirve como ejemplo reproducible de un adaptador PEFT (version 0.20.0) sobre Qwen2.5, util para comparar estrategias de LoRA, rangos e hiperparametros.
- Filtrado previo en pipelines de datos: uso del adaptador como clasificador generativo de baja latencia para etiquetar o descartar contenido antes de pasarlo a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este adaptador. La model card incluye la seccion de evaluacion sin rellenar y no hay ningun dato de MMLU, HumanEval, GSM8K ni de ninguna otra prueba. Tampoco consta informacion sobre latencia, throughput o consumo de memoria medida. Los datos publicos de Qwen2.5-3B-Instruct corresponden al modelo base sin el adaptador y no son extrapolables al comportamiento del ajuste LoRA.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir de los 3,09 mil millones de parametros del modelo base y del coste de anadir un adaptador LoRA. No son mediciones del repositorio:

- VRAM para inferencia en FP16/BF16: aproximadamente 6,2-7 GB para los pesos mas cache KV; recomendable 8-10 GB para contexto largo.
- VRAM en cuantizacion de 8 bits: aproximadamente 3,5-4 GB.
- VRAM en cuantizacion de 4 bits (GGUF Q4_K_M o AWQ/GPTQ 4 bits): aproximadamente 2,0-2,5 GB, mas cache KV.
- El adaptador en si ocupa del orden de 0,1 GB y no cambia de forma significativa estos requisitos.
- Cabe en GPU de consumo: si. RTX 3060 12 GB, RTX 4060 Ti 8-16 GB, RTX 4070, RTX 4090, asi como Apple Silicon con memoria unificada de 8 GB o mas.
- GPU de centro de datos recomendadas para servicio concurrente: A100 40/80 GB, H100, L40S, L4. Para una sola peticion, cualquier GPU con 8 GB es suficiente.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM con `--enable-lora` para servir multiples adaptadores sobre el mismo base, TGI con `--lora-adapters`, llama.cpp y Ollama tras convertir el adaptador a GGUF con `convert_lora_to_gguf.py`, y Optimum o TensorRT-LLM para optimizacion.
- Latencia y throughput estimados: no disponibles para este adaptador. Como referencia de orden de magnitud, un modelo denso de 3B en FP16 sobre una RTX 4090 suele generar decenas de tokens por segundo con lote pequeno, pero no hay ninguna medicion publicada de este repositorio.

## Comparativa con modelos similares

La comparacion se establece con el modelo base y con alternativas de tamano equivalente. Los datos de los modelos comparados proceden de su documentacion publica, no de la ficha del adaptador.

| Modelo | Parametros | Contexto declarado | Licencia | Disponibilidad |
|---|---|---|---|---|
| arkan-planning-construction-lora | Adaptador LoRA sobre 3B; recuento no disponible | No especificado (32.768 tokens en el base) | No declarada | 0 descargas, 0 likes |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Apache 2.0 | Ampliamente desplegado |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 131.072 tokens | Apache 2.0 | Ampliamente desplegado |
| meta-llama/Llama-3.2-3B-Instruct | 3,2 B | 131.072 tokens | Licencia comunitaria de Llama 3.2 | Ampliamente desplegado |

No hay datos de rendimiento comparado (MMLU, HumanEval, GSM8K) para el adaptador, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad. Qwen2.5-3B-Instruct y Llama-3.2-3B-Instruct son las alternativas naturales por tamano, mientras que Qwen2.5-7B-Instruct es la opcion inmediata superior dentro de la misma familia.

## Limitaciones y advertencias

- La model card no declara licencia. Aunque el modelo base Qwen2.5-3B-Instruct es Apache 2.0, la ausencia de licencia explicita en el repositorio del adaptador genera incertidumbre juridica para uso comercial. Conviene contactar con el autor antes de integrarlo en un producto.
- No hay informacion sobre los datos de entrenamiento. Es imposible evaluar sesgos de dominio, fuga de datos, contaminacion de benchmarks ni calidad del corpus utilizado.
- Riesgo de alucinacion elevado: se trata de un modelo de 3B parametros, con tendencia a inventar datos factuales y a fallar en razonamiento de varios pasos, especialmente sin verificacion externa.
- Sesgos: los heredados del modelo base (sesgos de genero, culturales y geograficos presentes en corpus web a gran escala) y los que pudiera introducir un dataset de ajuste no documentado.
- Limitaciones de contexto e idioma: el adaptador no declara idiomas ni limites de contexto; los 32.768 tokens son del modelo base. El ajuste podria degradar el rendimiento multilingue si se entreno solo en un idioma.
- Riesgo de olvido catastrofico: un LoRA poco regularizado puede mejorar una tarea concreta y degradar capacidades generales del modelo base. Al no haber evaluacion publicada, este riesgo no esta cuantificado.
- Soporte practico nulo: 0 descargas y 0 likes, sin issues ni discusion. No hay comunidad que haya validado el artefacto.
- Se trata de un adaptador, no de un modelo autonomo: requiere descargar los pesos del modelo base y aplicar PEFT para funcionar. No se puede cargar en herramientas que esperen un modelo completo sin ese paso previo.
- Anomalia en los metadatos: las fechas de creacion y actualizacion registradas (10 de septiembre de 2026) no son coherentes con la fecha habitual de publicacion; conviene verificar la trazabilidad del repositorio.
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo: los enlaces obtenidos corresponden a paginas de ayuda de YouTube sin relacion con el artefacto.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/psnuser061020/arkan-planning-construction-lora
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Documentacion de PEFT (HuggingFace): https://huggingface.co/docs/peft/index
- Guia de vLLM para adaptadores LoRA: https://docs.vllm.ai/en/latest/features/lora.html
- Conversion de adaptadores LoRA a GGUF para llama.cpp: https://github.com/ggerganov/llama.cpp/blob/master/convert_lora_to_gguf.py
- Articulo citado en la plantilla de la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental en aprendizaje automatico: https://mlco2.github.io/impact
