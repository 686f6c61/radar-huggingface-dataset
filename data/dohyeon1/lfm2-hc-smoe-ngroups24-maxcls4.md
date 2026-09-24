# Dohyeon1/LFM2-HC-SMoE-ngroups24-maxcls4

## Resumen

Dohyeon1/LFM2-HC-SMoE-ngroups24-maxcls4 es un modelo de generacion de texto de aproximadamente 8.339.930.560 parametros (unos 8,34 mil millones) publicado en HuggingFace por el usuario Dohyeon1. Segun la nomenclatura del repositorio y la etiqueta `lfm2_moe`, se trata de una variante derivada de la familia LFM2 (Liquid AI) a la que se le han fusionado expertos mediante la tecnica HC-SMoE (Hierarchical Clustering for Sparsely activated Mixture of Experts), presentada en ICML 2025. El sufijo `ngroups24-maxcls4` indica la configuracion del agrupamiento jerarquico empleado: 24 grupos y un maximo de 4 clusters por grupo.

El interes de la publicacion es metodologico: HC-SMoE propone reducir el numero de parametros de un modelo MoE disperso fusionando expertos con funciones similares, sin reentrenamiento y de forma agnostica a la tarea. Este checkpoint concreto es, por tanto, un experimento de compresion sobre un modelo base, no un modelo entrenado desde cero.

La relevancia practica es limitada en su estado actual. El repositorio no incluye model card real (el README es la plantilla autogenerada de HuggingFace, con todos los campos en "[More Information Needed]"), no declara licencia ni idiomas, registra 0 descargas y 0 likes, y no aporta resultados de evaluacion. Cualquier uso en produccion exige auditar previamente el checkpoint y aclarar la situacion legal respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 con capas de mezcla de expertos (MoE) dispersa, modificada mediante fusion de expertos HC-SMoE (inferido del tag `lfm2_moe` y de la nomenclatura del repositorio; no confirmado por el autor) |
| Parametros totales | 8.339.930.560 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen sin cuantizar; la conversion a GGUF/AWQ no esta documentada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |

Otros datos del repositorio: tamano total 16,7 GB, pipeline declarado `text-generation`, creado el 2026-09-23 y actualizado el 2026-09-23.

## Arquitectura y entrenamiento

La arquitectura subyacente declarada por la etiqueta `lfm2_moe` corresponde a LFM2, el diseno hibrido de Liquid AI que combina bloques convolucionales de corto alcance (convoluciones gated) con bloques de atencion, aplicando capas de mezcla de expertos dispersa en parte de la red. Sobre ese modelo base, el autor ha aplicado el marco HC-SMoE (Hierarchical Clustering for Sparsely activated Mixture of Experts), publicado en ICML 2025: un metodo de fusion de expertos que agrupa jerarquicamente los expertos segun la similitud de sus salidas y fusiona los que caen en el mismo cluster, reduciendo el numero de expertos del modelo sin necesidad de reentrenamiento. Los identificadores `ngroups24` y `maxcls4` corresponden a los hiperparametros de ese agrupamiento.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF/DPO o si el checkpoint paso por un ajuste fino adicional tras la fusion. No se documenta tampoco que modelo base exacto de la familia LFM2 se tomo como punto de partida, mas alla de la coincidencia entre el recuento de parametros (8,34B) y el tag `lfm2_moe`. La etiqueta `arxiv:1910.09700` que aparece en el repositorio corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono, citado en la plantilla de model card, y no a un paper propio del modelo.

## Capacidades

- Generacion de texto: unica capacidad confirmada, derivada del tag `text-generation` del repositorio.
- Conversacion: el repositorio declara el tag `conversational`, por lo que el formato de chat es compatible en principio, aunque no se documenta el chat template.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el modelo puede servirse a traves de la Inference API de HuggingFace.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponible.

No se ha publicado ninguna evaluacion de capacidades, por lo que todas las funcionalidades mas alla de la generacion de texto son una incognita.

## Casos de uso

Ninguno de los escenarios siguientes ha sido validado por el autor; se plantean como aplicaciones plausibles de un modelo de ~8,3B orientado a generacion conversacional, siempre que la calidad del checkpoint fusionado se verifique antes.

- Investigacion sobre compresion de modelos MoE: el caso de uso principal es reproducir y auditar el efecto de la fusion HC-SMoE, comparando este checkpoint con el modelo base sobre un mismo conjunto de evaluacion para cuantificar la perdida de calidad derivada de la reduccion de expertos.
- Experimentos de destilacion y merging: sirve como punto de partida para comparar distintas configuraciones de agrupamiento (el propio autor publica variantes como `ngroups28`), lo que permite estudiar el compromiso entre numero de expertos y rendimiento.
- Servicio de chat autoalojado: con pesos en safetensors y ~16,7 GB, puede desplegarse en una GPU de 24 GB para prototipos conversacionales internos, siempre que se valide el chat template y la calidad de las respuestas.
- Generacion de texto asistida en dominio cerrado: resumen, reescritura o clasificacion generativa sobre corpus internos, donde el riesgo de alucinacion se mitiga con recuperacion externa (RAG) y revision humana.
- Base para ajuste fino con LoRA/QLoRA: al ser un modelo de ~8,3B, es abordable ajustarlo en una sola GPU de gama alta con cuantizacion de 4 bits, lo que permite especializarlo en una tarea concreta sin reentrenar los expertos fusionados.
- Evaluacion de artefactos de terceros: como ejemplo de repositorio sin licencia ni documentacion, es util en auditorias internas de gobernanza de modelos para ilustrar los riesgos de incorporar checkpoints no trazables a un catalogo corporativo.
- Investigacion sobre enrutamiento MoE: analizar que expertos han sido fusionados y como afecta el agrupamiento jerarquico a la distribucion de carga entre expertos durante la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye seccion de evaluacion (el campo "Results" de la model card esta vacio) y la busqueda web no ha devuelto ningun dato de MMLU, HumanEval, GSM8K ni de ninguna otra prueba.

## Requisitos de hardware

- VRAM para inferencia en precision completa (fp16/bf16): los pesos ocupan aproximadamente 16,7 GB, por lo que se necesitan del orden de 18-20 GB de VRAM contando cache KV y activaciones con contextos moderados.
- Cuantizacion de 8 bits: en torno a 8,5-9 GB de VRAM.
- Cuantizacion de 4 bits: en torno a 4,5-5,5 GB de VRAM, mas overhead de runtime.
- GPU recomendadas en fp16: A100 40/80 GB, H100, L40S 48 GB, RTX A6000 48 GB. Una RTX 4090 de 24 GB deberia ser suficiente para fp16 con contextos cortos o medios.
- GPU de consumo: con cuantizacion de 4 bits cabe en tarjetas de 8 GB (RTX 3070, RTX 4060) de forma ajustada, y con holgura en 12 GB (RTX 3060 12 GB, RTX 4070) y 16 GB (RTX 4080, RTX 4070 Ti Super).
- Opciones de despliegue: `transformers` es la libreria declarada y la unica compatible de forma garantizada. El soporte en vLLM, TGI, llama.cpp u Ollama depende de que estos runtimes implementen la arquitectura `lfm2_moe` y su configuracion de fusion, algo que no esta documentado en el repositorio.
- Latencia y throughput: no disponible. Al ser un modelo MoE, el coste por token deberia ser inferior al de un modelo denso del mismo tamano total, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad. Los valores de los modelos de referencia son externos a la informacion proporcionada y no han sido verificados en la busqueda web.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad / notas |
|---|---|---|---|---|
| LFM2-HC-SMoE-ngroups24-maxcls4 | 8,34B | no disponible | no disponible | 0 descargas, sin model card util, sin evaluacion |
| LFM2-8B-A1B (familia base, referencia externa) | ~8,3B totales / ~1,5B activos | 32.768 tokens (referencia externa) | LFM Open License v1.0 (referencia externa) | Modelo oficial de Liquid AI, con documentacion y evaluacion publicadas |
| Qwen3-8B (referencia externa) | ~8,2B | 32.768 nativo, ampliable (referencia externa) | Apache-2.0 (referencia externa) | Amplio soporte en frameworks de inferencia |
| Llama-3.1-8B (referencia externa) | ~8,03B | 128.000 tokens (referencia externa) | Llama 3.1 Community License (referencia externa) | Ecosistema maduro y multiples cuantizaciones publicadas |

La diferencia clave no es de rendimiento, sino de trazabilidad: los tres modelos de referencia cuentan con licencia explicita, evaluaciones publicadas y soporte en herramientas de despliegue, mientras que este checkpoint carece de todo ello.

## Limitaciones y advertencias

- Ausencia de licencia: el repositorio no declara licencia, lo que impide determinar si el uso comercial esta permitido. Ademas, al derivar de un modelo base de terceros, se heredan las condiciones de la licencia original (presumiblemente LFM Open License), no verificadas aqui.
- Model card vacia: todos los campos del README estan sin rellenar, incluidos desarrollador, tipo de modelo, idiomas, datos de entrenamiento y procedimiento. No hay informacion sobre el dataset ni sobre posibles sesgos.
- Sin evaluacion: no existen benchmarks ni pruebas cualitativas que permitan estimar la degradacion introducida por la fusion de expertos. Es esperable cierta perdida de calidad respecto al modelo base, pero su magnitud es desconocida.
- Riesgo de alucinacion: no cuantificado. Al no haber evaluacion de fidelidad ni de tasas de error, cualquier despliegue en atencion al cliente o generacion de contenido factual requiere verificacion humana.
- Trazabilidad insuficiente: se desconoce el modelo base exacto, el numero de expertos originales y fusionados, y si hubo ajuste fino posterior. Esto dificulta reproducir el resultado.
- Repositorio sin traccion: 0 descargas y 0 likes implican una ausencia total de validacion por parte de la comunidad; no hay issues ni discusiones que puedan servir de contraste.
- Incoherencia temporal: las fechas de creacion y actualizacion (2026-09-23) son posteriores a la fecha habitual de publicacion, lo que sugiere metadatos generados automaticamente o manipulados.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto real y los idiomas cubiertos, lo que impide planificar despliegues multilingues o de contexto largo.
- Compatibilidad de runtime: al tratarse de una arquitectura `lfm2_moe` modificada, es probable que las herramientas habituales (vLLM, llama.cpp, Ollama) no la carguen sin adaptaciones, algo no documentado por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dohyeon1/LFM2-HC-SMoE-ngroups24-maxcls4
- Variante con otra configuracion de agrupamiento: https://huggingface.co/Dohyeon1/LFM2-HC-SMoE-ngroups24
- Otra variante del autor: https://huggingface.co/Dohyeon1/LFM2-HC-SMoE-ngroups28 (arbol de archivos: https://huggingface.co/Dohyeon1/LFM2-HC-SMoE-ngroups28/tree/main)
- Perfil del autor: https://hf-p-cfw.fyan.top/Dohyeon1/models
- Repositorio oficial de HC-SMoE (ICML 2025): https://github.com/wazenmai/HC-SMoE
- Ficha de terceros con metadatos del modelo: https://free2aitools.com/model/dohyeon1/lfm2-hc-smoe-ngroups24
- Referencia citada en la plantilla de model card (calculo de emisiones): https://arxiv.org/abs/1910.09700
- Familia base LFM2 de Liquid AI (referencia externa, no aparecida en la busqueda): https://huggingface.co/LiquidAI/LFM2-8B-A1B
