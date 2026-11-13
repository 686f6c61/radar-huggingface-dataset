# jjimi77/Qwen3.5-2B-ToolCalling-LoRA

## Resumen

`jjimi77/Qwen3.5-2B-ToolCalling-LoRA` es un adaptador LoRA (Low-Rank Adaptation) publicado en Hugging Face por el usuario jjimi77, entrenado sobre un modelo base de la familia Qwen3.5 con aproximadamente 2.000 millones de parametros. El nombre indica que el ajuste fino esta orientado especificamente a tool calling (llamada a funciones o herramientas), una capacidad critica para construir agentes y pipelines que interactuan con APIs externas. El repositorio tiene un tamano de 0,3 GB, lo que es coherente con un adaptador LoRA de rango bajo y no con un modelo completo.

La model card del autor es la plantilla automatica de Hugging Face sin rellenar: no documenta el modelo base exacto, el dataset de entrenamiento, los hiperparametros, la licencia ni los idiomas soportados. La unica informacion tecnica fiable proviene de los metadatos del repositorio: libreria `transformers`, formato `safetensors`, etiqueta `unsloth` (lo que sugiere que el entrenamiento se realizo con la libreria Unsloth) y `endpoints_compatible`, que indica que puede desplegarse en los Inference Endpoints de Hugging Face. No hay descargas ni likes en el momento de redactar esta ficha.

Por tanto, esta ficha debe leerse como una evaluacion preliminar basada en los metadatos disponibles y en las caracteristicas conocidas de la familia Qwen3.5 y de los adaptadores LoRA. Cualquier dato no confirmado se marca explicitamente como "no disponible". Se recomienda precaucion antes de usar este adaptador en produccion, dado que no existe documentacion del autor sobre calidad, sesgos o condiciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base transformer de la familia Qwen3.5; arquitectura exacta del base no disponible |
| Parametros totales | Modelo base de ~2B (segun el nombre del repositorio); numero exacto de parametros del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-2B, valor no confirmado) |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors y puede fusionarse con el base para cuantizar posteriormente (GGUF, AWQ, etc.) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador LoRA); requiere el modelo base para inferencia |
| Tamano del repositorio | 0,3 GB |
| Libreria | transformers |
| Herramienta de entrenamiento | Unsloth (segun etiqueta del repositorio) |
| Compatibilidad de despliegue | `endpoints_compatible` (Hugging Face Inference Endpoints) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. LoRA congela los pesos del modelo base e inserta matrices de descomposicion de bajo rango en determinadas capas (tipicamente las proyecciones de atencion y, en algunas configuraciones, las de MLP), de modo que solo se entrenan unos pocos millones de parametros adicionales. El repositorio de 0,3 GB es consistente con un adaptador de rango moderado sobre un modelo de 2B; el peso completo del base en bf16 rondaria los 4 GB, por lo que el adaptador representa una fraccion pequena del total.

La etiqueta `unsloth` sugiere que el ajuste se realizo con la libreria Unsloth, popular por sus kernels optimizados que reducen el uso de memoria y aceleran el entrenamiento de LoRA entre 2x y 5x frente a implementaciones estandar. La etiqueta `arxiv:1910.09700` corresponde al paper de Lacoste et al. sobre estimacion de emisiones de carbono en machine learning, citado en la plantilla de la model card; no es una referencia al metodo de entrenamiento. No hay informacion sobre el dataset de tool calling utilizado, el numero de pasos, la tasa de aprendizaje, el rango del adaptador ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documenta si el adaptador se entreno solo sobre las capas de atencion o tambien sobre las MLP.

## Capacidades

- Tool calling / function calling: el objetivo declarado del ajuste es mejorar la capacidad del modelo base para emitir llamadas a funciones estructuradas (JSON) a partir de instrucciones en lenguaje natural.
- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-2B, aunque la magnitud de la degradacion o mejora tras el LoRA no esta documentada.
- Razonamiento multi-paso orientado a agentes: potencial uso en bucles de agente que encadenan llamadas a herramientas, si el adaptador preserva las capacidades del base.
- Capacidades multilingues: no disponibles; dependen del modelo base y no se documentan en el repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; no se declaran en el repositorio.
- Compatibilidad con Inference Endpoints de Hugging Face: si, segun la etiqueta `endpoints_compatible`.

## Casos de uso

- Agentes de automatizacion de tareas: el adaptador puede integrarse en un bucle de agente que reciba una peticion del usuario, seleccione una herramienta (busqueda web, calculadora, API interna) y genere la llamada en formato JSON. Es adecuado por su enfoque especifico en tool calling y su bajo coste de despliegue al ser un modelo de 2B.
- Asistentes de atencion al cliente con integracion de backend: el modelo podria mapear consultas en lenguaje natural a llamadas a APIs de consulta de pedidos, devoluciones o estado de cuenta. La ventana de contexto heredada del base condiciona la longitud de la conversacion; conviene verificar el valor exacto antes de desplegar.
- Orquestacion de pipelines de datos: generacion de llamadas a funciones para tareas ETL, consultas SQL o invocaciones a servicios cloud, con validacion posterior del JSON emitido.
- Prototipado rapido de asistentes con herramientas: al ser un adaptador pequeno (0,3 GB) y compatible con Inference Endpoints, permite experimentar con tool calling sin desplegar un modelo grande.
- Educacion e investigacion sobre fine-tuning: util como ejemplo de adaptador LoRA entrenado con Unsloth para estudiar como el ajuste de bajo rango afecta a la capacidad de tool calling en modelos de 2B.
- Despliegue en entornos con recursos limitados: un modelo base de 2B cuantizado a 4 bits ocupa aproximadamente 1,5-2 GB, lo que permite ejecutarlo en GPUs de consumo y en CPUs con llama.cpp u Ollama tras fusionar y convertir el adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base. Para un base de 2B en bf16 se estiman ~4-5 GB; en cuantizacion 8 bits ~2,5 GB; en 4 bits ~1,5-2 GB. El adaptador LoRA anade un overhead minimo que puede fusionarse con el base para eliminar coste en inferencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el base en bf16 (RTX 3050, RTX 4060, T4); para mayor throughput, A10G, L4, A100 o H100.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060, RTX 4060, RTX 4070 y superiores, asi como en Apple Silicon con suficiente memoria unificada.
- Opciones de despliegue: transformers (carga del base + adaptador con PEFT), vLLM (tras fusionar el adaptador), llama.cpp y Ollama (requieren conversion a GGUF tras fusion), TGI y Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jjimi77/Qwen3.5-2B-ToolCalling-LoRA | ~2B (base) + LoRA | No disponible | Tool calling via LoRA | No disponible | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (segun documentacion publica de Qwen) | Instrucciones generales | Apache 2.0 (segun Qwen) | Hugging Face |
| Qwen2.5-3B-Instruct | 3B | 32K (segun documentacion publica de Qwen) | Instrucciones generales | Qwen Research License (segun Qwen) | Hugging Face |
| Hermes-2-Pro-Mistral-7B | 7B | 32K (segun documentacion publica de Nous) | Tool calling | Apache 2.0 (segun Nous) | Hugging Face |

Nota: los datos de los modelos comparativos provienen de su documentacion publica habitual; no se dispone de benchmarks del adaptador evaluado, por lo que la comparacion es estructural y no de rendimiento.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla automatica sin rellenar; no se especifican modelo base exacto, dataset, hiperparametros, licencia ni idiomas.
- Licencia no declarada: no se puede garantizar el uso comercial; es imprescindible contactar con el autor o verificar la licencia del modelo base Qwen3.5 antes de cualquier despliegue productivo.
- Riesgo de alucinacion: inherente a los modelos de 2B; la generacion de llamadas a funciones puede producir argumentos invalidos o nombres de herramienta inexistentes, por lo que se requiere validacion estricta del JSON emitido.
- Degradacion potencial del base: el ajuste LoRA puede reducir capacidades generales (razonamiento, conocimiento) al especializar el modelo en tool calling; no hay evaluacion que lo cuantifique.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset de ajuste, desconocido.
- Contexto e idiomas: no confirmados; asumir las limitaciones del base Qwen3.5-2B sin garantia.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia; sin evidencia de validacion por la comunidad.
- Reproducibilidad: al no publicarse el dataset ni la configuracion de entrenamiento, no es posible replicar el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjimi77/Qwen3.5-2B-ToolCalling-LoRA
- Paper citado en la model card (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML: https://mlco2.github.io/impact
- Libreria Unsloth (herramienta de entrenamiento segun etiqueta): https://github.com/unslothai/unsloth
- Documentacion de PEFT (carga de adaptadores LoRA): https://huggingface.co/docs/peft
