# MinaMila/Qwen2.5-1.5B-Qwen7B

## Resumen

MinaMila/Qwen2.5-1.5B-Qwen7B es un adaptador de ajuste fino publicado en Hugging Face por el usuario MinaMila, construido sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct mediante la libreria PEFT (version 0.15.1). No se trata de un modelo completo, sino de un conjunto de pesos adicionales (previsiblemente LoRA) que deben combinarse con el modelo base para poder ejecutarse. El repositorio ocupa 0,1 GB y almacena los pesos en formato safetensors.

La relevancia de esta publicacion es limitada y debe evaluarse con cautela: la model card es la plantilla generica de Hugging Face sin rellenar, no se declara licencia, idiomas, datos de entrenamiento, hiperparametros ni resultados de evaluacion. El repositorio registra 0 descargas y 0 likes. El identificador "Qwen7B" sugiere algun tipo de relacion con Qwen2.5-7B (por ejemplo, destilacion o generacion de datos con ese modelo mayor), pero el autor no documenta esa relacion en ninguna parte, por lo que es una hipotesis no verificada.

Por tanto, esta ficha describe lo que se puede afirmar objetivamente del artefacto y, alli donde es imprescindible contexto tecnico, se apoya en las especificaciones publicas del modelo base Qwen2.5-1.5B-Instruct, indicando explicitamente cuando un dato procede del modelo base y no del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA, segun la libreria declarada) sobre transformer decoder-only causal; arquitectura del base: Qwen2.5 (RoPE, SwiGLU, RMSNorm, GQA) |
| Parametros totales | No disponible para el adaptador (repo de 0,1 GB); el modelo base Qwen2.5-1.5B-Instruct tiene 1,54 B totales y 1,31 B sin embeddings |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el adaptador; el modelo base soporta 32.768 tokens de contexto y hasta 8.192 tokens de generacion |
| Tipos de cuantizacion | No disponible; el adaptador se publica en safetensors sin cuantizar. La cuantizacion debe aplicarse tras fusionar con el base (GGUF Q4/Q5/Q8, AWQ, GPTQ, bitsandbytes) |
| Idiomas soportados | No disponible para el adaptador; el modelo base declara soporte para mas de 29 idiomas (entre ellos castellano, ingles, chino, frances, aleman, portugues, italiano, ruso, japones, coreano, arabe) |
| Licencia | No disponible en el repositorio; el modelo base Qwen2.5-1.5B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); el repositorio no incluye los pesos del modelo base |
| Libreria | peft 0.15.1 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador PEFT, como indica la etiqueta `library_name: peft` y la version de framework declarada (PEFT 0.15.1). El modelo base sobre el que se aplica es Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only causal de 28 capas, hidden size 1536, 12 cabezas de atencion y 2 cabezas KV (GQA), con vocabulario de 151.936 tokens. El adaptador, al estar en safetensors y con un peso de repositorio de 0,1 GB, es compatible con el flujo estandar de `PeftModel.from_pretrained` o con su fusion en el base mediante `merge_and_unload`.

No hay absolutamente ningun dato publicado sobre el procedimiento de entrenamiento: se desconoce el dataset, el numero de tokens, el rango y alpha del adaptador, la tasa de aprendizaje, si hubo SFT, DPO o RLHF, y si se uso algun esquema de destilacion desde un modelo mayor. La etiqueta `arxiv:1910.09700` que aparece en los tags no es una referencia metodologica del entrenamiento, sino la cita del calculador de impacto medioambiental (Lacoste et al., 2019) que la plantilla de model card incluye por defecto. En consecuencia, no se puede afirmar ninguna innovacion tecnica ni verificar la calidad del ajuste.

## Capacidades

- No hay ninguna capacidad declarada ni evaluada por el autor del adaptador. La model card no rellena las secciones de uso directo, uso fuera de alcance ni limitaciones.
- Las capacidades teoricas heredadas del modelo base Qwen2.5-1.5B-Instruct incluyen: generacion de texto, razonamiento basico, generacion de codigo, matematicas elementales, resumen, traduccion y seguimiento de instrucciones.
- Soporte de tool calling / function calling: disponible en el modelo base Qwen2.5-Instruct, pero no verificado tras aplicar este adaptador; el ajuste fino puede degradar o romper el formato de llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no verificado en este adaptador.
- Capacidades multilingues: no verificadas en el adaptador; el base declara mas de 29 idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el modelo base es exclusivamente de texto y no incorpora modo de razonamiento extendido.

## Casos de uso

- Prototipado de pipelines de ajuste fino: el adaptador sirve como ejemplo reproducible de como publicar un LoRA sobre Qwen2.5-1.5B-Instruct, util para equipos que quieran definir su propio flujo de PEFT antes de invertir en entrenamientos mayores.
- Inferencia en el borde o en portatiles: fusionado con el base y cuantizado a Q4, el conjunto cabe en GPUs de gama baja o incluso en CPU, lo que permite desplegar asistentes de texto locales sin conexion.
- Clasificacion y etiquetado de texto a bajo coste: con 1,54 B de parametros, el modelo puede procesar grandes volumenes de documentos para tareas de categorizacion, extraccion de entidades o filtrado previo, alli donde un modelo de 7 B o 70 B resultaria prohibitivo en coste.
- Generacion aumentada por recuperacion (RAG) ligera: la ventana de 32.768 tokens del base permite inyectar varios fragmentos de contexto en un asistente documental interno con huella de memoria reducida.
- Educacion y demostraciones: al caber en una unica GPU consumer, es adecuado para talleres, asignaturas de PLN y cuadernos interactivos donde se explique el ciclo completo de PEFT.
- Comparacion de tecnicas de ajuste: sirve como punto de partida para entrenar variantes propias (distinto rango, distintos datos) y medir el delta frente a esta version no documentada.
- Evaluacion critica de artefactos publicados: es un caso representativo de repositorio sin model card ni evaluacion, util para ilustrar en formacion por que no deberia adoptarse un modelo en produccion sin trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion, no reporta MMLU, HumanEval, GSM8K, MT-Bench, Arena-Hard ni ninguna otra metrica, y no ofrece comparacion con el modelo base ni con otras variantes ajustadas. Tampoco se han encontrado resultados en la busqueda web realizada.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del modelo base Qwen2.5-1.5B-Instruct, no datos medidos sobre este adaptador.

- VRAM para pesos en FP16/BF16: aproximadamente 3,1 GB. En INT8 unos 1,6 GB; en Q4 unos 1,0 GB.
- Cache KV: con GQA de 2 cabezas KV y head_dim 128, el coste es de unos 28 KB por token, es decir, aproximadamente 0,9 GB para una ventana completa de 32.768 tokens en FP16. Se reduce a la mitad con cache KV cuantizada a 8 bits.
- VRAM total recomendada: 6 GB en FP16 con contexto largo; 3-4 GB en cuantizacion de 4 bits. El adaptador anade unas decenas de MB, despreciables frente a los pesos base.
- Cabe en GPU consumer: si. Ejemplos: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, e incluso tarjetas de 4-6 GB en Q4 con contexto recortado. Tambien es viable en CPU (llama.cpp) con velocidades moderadas.
- GPU de datacenter para servicio con batching: L4, A10G, A100 y H100 permiten alto throughput con vLLM o TGI; la A100/H100 solo tiene sentido si se sirven muchas peticiones concurrentes.
- Opciones de despliegue: transformers + PEFT (referencia), fusion del adaptador y conversion a GGUF para llama.cpp y Ollama, vLLM y TGI para servicio, SGLang. Nota importante: llama.cpp y Ollama no cargan adaptadores PEFT directamente; hay que fusionar primero el LoRA en el modelo base y despues convertir a GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de evaluacion |
|---|---|---|---|---|---|
| MinaMila/Qwen2.5-1.5B-Qwen7B | No disponible (adaptador sobre 1,54 B) | No disponible (base: 32.768) | No disponible | 0 descargas, 0 likes, sin model card | No publicados |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B (1,31 B sin embeddings) | 32.768 tokens | Apache 2.0 | Amplia, repositorio oficial con evaluacion | Publicados por el autor (MMLU, HumanEval, GSM8K, etc.) |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 tokens | Apache 2.0 | Amplia, repositorio oficial | Publicados por el autor |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License (con restricciones y clausula de usuarios mensuales) | Amplia, repositorio oficial | Publicados por el autor |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens | Apache 2.0 | Amplia, repositorio oficial | Publicados por el autor |

Frente a estas alternativas, el unico punto diferencial de este repositorio seria un ajuste especifico que no esta documentado ni evaluado; en la practica, cualquiera de los modelos de la tabla ofrece trazabilidad, licencia clara y metricas publicadas.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla por defecto de Hugging Face, sin datos de autor, financiacion, tipo de modelo, idiomas, licencia ni fuentes.
- Licencia no declarada: al no especificarse, no hay garantia explicita de uso comercial sobre el adaptador. El modelo base es Apache 2.0, pero eso no resuelve por si solo la licencia del artefacto derivado.
- Sin evaluacion: no existe ningun benchmark ni prueba cualitativa que respalde que el ajuste mejora al modelo base; es posible que lo degrade en tareas generales por sobreajuste al dataset no declarado.
- Riesgo de alucinacion: elevado en un modelo de 1,5 B, y no mitigado ni medido en este adaptador. La ausencia de evaluacion impide cuantificarlo.
- Sesgos desconocidos: no se documentan datos de entrenamiento, por lo que no se pueden identificar sesgos de dominio, idioma o demografia.
- Cobertura idiomatica incierta: si el ajuste se hizo con datos mayoritariamente en un idioma, el rendimiento en castellano u otros idiomas puede degradarse respecto al base.
- Reputacion del artefacto: 0 descargas y 0 likes, creado y actualizado con 3 segundos de diferencia (10 de septiembre de 2026), lo que indica una subida automatizada o de prueba sin mantenimiento posterior.
- Naming ambiguo: el sufijo "Qwen7B" no esta explicado. Podria referirse a un profesor de 7 B usado para destilar, lo que implicaria obligaciones adicionales si ese modelo tuviera una licencia distinta de Apache 2.0; no se puede verificar.
- Problemas de integracion: al ser un adaptador PEFT, requiere fusion previa para desplegarse en runtimes que no soportan LoRA (llama.cpp, Ollama, algunos servidores propietarios), lo que anade un paso de conversion y posibles perdidas de fidelidad numerica.
- No apto para produccion en su estado actual: sin versionado de datos, sin evaluacion, sin licencia y sin mantenimiento, no cumple los criterios minimos de trazabilidad exigibles en un sistema en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MinaMila/Qwen2.5-1.5B-Qwen7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio Qwen2.5 (familia completa): https://huggingface.co/collections/Qwen/qwen25
- Informe tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Libreria PEFT: https://github.com/huggingface/peft
- Calculador de impacto medioambiental citado en la model card (Lacoste et al., 2019): https://mlco2.github.io/impact y https://arxiv.org/abs/1910.09700
