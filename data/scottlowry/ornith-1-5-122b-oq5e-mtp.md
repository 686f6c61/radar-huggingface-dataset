# scottlowry/Ornith-1.5-122B-oQ5e-mtp

## Resumen

Ornith-1.5-122B-oQ5e-mtp es una cuantizacion mixta de precision del modelo base ornith-ai/Ornith-1.5-122B, publicada por el usuario scottlowry. Se trata de un checkpoint de 125.086.497.008 parametros (unos 125,09 mil millones) en formato MLX, pensado para su ejecucion en hardware Apple Silicon. La cuantizacion se ha realizado con la herramienta oQ de oMLX (version v0.7.4.dev1), que aplica precision mixta por capas en lugar de un unico ancho de bit uniforme.

El modelo base pertenece a la familia Qwen3.5 MoE, segun el tag de arquitectura `qwen3_5_moe`, e incorpora componentes de vision (0,451B de parametros) y una cabeza MTP (multi-token prediction) de 2,524B. El checkpoint resultante ocupa 82,866 GiB en disco con un promedio efectivo de 5,691 bits por peso, lo que permite cargar un modelo de mas de 120B en equipos con memoria unificada de 96 GB o superior.

La relevancia de esta publicacion es practica: demuestra que es posible ejecutar localmente un modelo MoE multimodal de gran tamano con perdida de calidad controlada mediante cuantizacion mixta, y con decodificacion especulativa integrada a traves de la cabeza MTP. No obstante, la informacion publicada se limita a los detalles de cuantizacion; no hay model card del modelo base incluida, ni datos de entrenamiento, benchmarks o licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con torre de vision y cabeza MTP |
| Parametros totales | 125.086.497.008 (125,09B) |
| Parametros activos | no disponible (el modelo base es MoE, pero no se publica el numero de expertos ni los parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 5-bit grupo 64 (94,639% de los pesos), affine 8-bit grupo 128 (0,370%), affine 8-bit grupo 64 (4,583%), BF16 (0,408%); promedio efectivo 5,691 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |
| Tamano del repositorio | 176,9 GB (checkpoint almacenado: 82,866 GiB / 88,976 GB) |
| Desglose por componente | Lenguaje: 122,112B (80,355 GiB); vision: 0,451B (0,841 GiB); cabeza MTP: 2,524B (1,670 GiB) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base ornith-ai/Ornith-1.5-122B, identificada por el tag `qwen3_5_moe` como un transformer de mezcla de expertos (MoE) de la familia Qwen3.5. La presencia de una torre de vision de 0,451B de parametros confirma que el modelo es multimodal (entrada de imagen ademas de texto). La cabeza MTP de 2,524B implementa multi-token prediction, una tecnica que permite al modelo predecir varios tokens por paso y que habitualmente se emplea para decodificacion especulativa o para acelerar la generacion.

No se dispone de informacion sobre el entrenamiento: ni el numero de tokens, ni la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. Tampoco se detalla la configuracion de expertos (numero de expertos, top-k de enrutamiento) ni la innovacion concreta de atencion del modelo base. La unica informacion tecnica verificable es la relativa al proceso de cuantizacion: oQ aplica 5 bits con grupo de 64 a la gran mayoria de las matrices (94,639%), reserva 8 bits para un 4,95% de los pesos (probablemente capas sensibles como embeddings, normas o proyecciones de atencion) y mantiene en BF16 un 0,408% (0,511B de parametros). El checkpoint fue recuantizado el 2026-11-11 con oMLX v0.7.4.dev1, y el autor advierte de que las copias anteriores deben descargarse de nuevo.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un LLM de gran escala, por lo que se le presupone capacidad de conversacion, razonamiento y redaccion, aunque no hay evaluaciones publicadas que lo confirmen.
- Procesamiento de vision: la torre de vision de 0,451B indica soporte de entrada de imagenes (descripcion, VQA, extraccion de informacion de documentos), aunque no se detalla la resolucion ni el numero de tokens de imagen.
- Decodificacion multi-token: la cabeza MTP de 2,524B permite generar varios tokens por paso de decodificacion, lo que en la practica se traduce en mayor velocidad de generacion mediante decodificacion especulativa.
- Codigo y matematicas: no disponible (no hay datos del modelo base que lo confirmen).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking explicito: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta en formato MLX y ocupa 82,866 GiB, de modo que puede cargarse en un Mac Studio o MacBook Pro con 96 GB o 128 GB de memoria unificada. Es el caso de uso principal y el unico documentado por el autor.
- Prototipado de aplicaciones multimodales sin GPU dedicada: al incluir torre de vision, permite probar pipelines de imagen y texto (por ejemplo, extraccion de datos de capturas o documentos) en un equipo de sobremesa Apple, sin depender de servicios en la nube.
- Evaluacion comparativa de cuantizacion: sirve para medir la degradacion de calidad de un modelo de 125B al pasar de BF16 a 5,691 bits/peso efectivos, comparando contra el checkpoint original de ornith-ai.
- Generacion acelerada con MTP: la cabeza de multi-token prediction permite experimentar con decodificacion especulativa en MLX para reducir la latencia por token en tareas de generacion larga.
- Investigacion sobre MoE de gran escala: al ser un MoE, permite estudiar el comportamiento de enrutamiento y activacion de expertos en hardware de consumo, algo dificil con checkpoints BF16 de este tamano.
- Desarrollo de asistentes conversacionales locales con contexto largo: si el modelo base mantiene la ventana de contexto de la familia Qwen3.5 (no confirmada aqui), podria usarse para resumir documentos extensos o mantener conversaciones multi-turno en local, con la salvedad de que la licencia no esta declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo proporciona la distribucion de bits y el desglose de almacenamiento; no incluye MMLU, HumanEval, GSM8K ni comparaciones con el checkpoint sin cuantizar.

## Requisitos de hardware

- VRAM / memoria unificada: el checkpoint ocupa 82,866 GiB (88,976 GB) en disco; para inferencia en MLX se necesita al menos esa cantidad de memoria unificada mas el overhead de activaciones y cache KV. En la practica, un equipo con 96 GB de memoria unificada queda muy justo; 128 GB es el minimo recomendable.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son los chips de Apple (M2 Ultra, M3 Ultra, M4 Max con 128 GB o mas). No es directamente compatible con CUDA.
- GPU de consumo: no cabe en ninguna GPU de consumo con 24 GB o 48 GB (RTX 4090, RTX 5090). Tampoco cabe en una A100 de 80 GB sin offloading, dado que el checkpoint supera los 82 GiB.
- Opciones de despliegue: exclusivamente el runtime MLX (libreria `mlx`); no hay versiones GGUF, ni compatibilidad con vLLM, llama.cpp, Ollama o TGI a partir de este repositorio. Para esos runtimes habria que recurrir al modelo base o a otras cuantizaciones.
- Latencia y throughput: no disponibles. La cabeza MTP deberia mejorar el throughput respecto a la decodificacion token a token, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottlowry/Ornith-1.5-122B-oQ5e-mtp | 125,09B (MoE, multimodal, MTP) | no disponible | MLX safetensors, 5,691 bits/peso | no disponible | Hugging Face, 260 descargas |
| ornith-ai/Ornith-1.5-122B (base) | 122B+ (MoE, multimodal) | no disponible | safetensors BF16 | no disponible | Hugging Face |
| Alternativas de tamano similar en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (MoE multimodal de ~120B en MLX) en la documentacion proporcionada, por lo que la comparativa se limita al modelo base y a este checkpoint cuantizado.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: el checkpoint usa 5,691 bits/peso efectivos frente a los 16 bits del BF16 original; aunque la precision mixta protege las capas sensibles, no se han publicado evaluaciones que cuantifiquen la degradacion.
- Licencia no declarada: el repositorio no indica licencia, lo que impide confirmar si el uso comercial esta permitido. Hay que consultar la licencia del modelo base ornith-ai/Ornith-1.5-122B antes de cualquier despliegue en produccion.
- Idiomas no declarados: se desconoce que idiomas cubre el modelo base y con que calidad; no se puede asumir un buen rendimiento en castellano.
- Riesgo de alucinacion: inherente a los LLM de esta escala; sin benchmarks ni evaluaciones de fidelidad no hay forma de acotarlo.
- Dependencia de MLX: el formato solo es utilizable en hardware Apple; no hay conversion a GGUF ni a otros formatos en este repositorio, lo que limita su portabilidad.
- Requisitos de memoria elevados: 82,866 GiB de checkpoint mas activaciones hacen inviable su ejecucion en GPUs de consumo y en muchas GPUs de datacenter de 80 GB.
- Advertencia de version: el autor indica que el checkpoint se recuantizo el 2026-11-11 y que las copias anteriores deben descargarse de nuevo; conviene verificar la fecha de los ficheros descargados.
- Falta de documentacion del modelo base: no se detallan contexto, tool calling, capacidades de agente ni composicion del entrenamiento, lo que dificulta evaluar su idoneidad para tareas concretas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scottlowry/Ornith-1.5-122B-oQ5e-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
