# Dohyeon1/Qwen3-30B-A3B-Sub-MoE-ngroups64-adaptive

## Resumen

Dohyeon1/Qwen3-30B-A3B-Sub-MoE-ngroups64-adaptive es un modelo de generacion de texto publicado en HuggingFace por el usuario Dohyeon1, con 30.532.122.624 parametros totales confirmados en los pesos (safetensors) y un repositorio de 61,1 GB. El identificador y la etiqueta de arquitectura (qwen3_moe) indican que se trata de una variante derivada de la familia Qwen3 de Alibaba, concretamente de un modelo de mezcla de expertos (MoE) de unos 30.000 millones de parametros totales. El sufijo del nombre, "Sub-MoE-ngroups64-adaptive", sugiere una modificacion del esquema de agrupacion y enrutado de expertos, aunque el autor no documenta en que consiste exactamente.

El modelo resuelve, en principio, el mismo tipo de tareas que su base: generacion de texto conversacional y procesamiento de lenguaje natural con un coste de calculo por token muy inferior al de un modelo denso del mismo tamano, gracias al uso de parametros activos reducidos (el nombre "A3B" apunta a unos 3.000 millones de parametros activos). Su relevancia practica es limitada de momento: la ficha del repositorio es la plantilla automatica de HuggingFace sin rellenar, no declara licencia, idiomas ni datos de entrenamiento, y acumula cero descargas y cero valoraciones.

La publicacion, fechada el 16 de septiembre de 2026 segun los metadatos del Hub, debe considerarse un experimento de investigacion sin validacion publica. Cualquier uso en produccion exige verificar primero el comportamiento real del modelo con evaluaciones propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_moe (transformer con mezcla de expertos, segun etiqueta de la libreria); variante derivada de Qwen3-30B-A3B segun el identificador, modificacion concreta no documentada |
| Parametros totales | 30.532.122.624 (30,53 mil millones, dato real de los safetensors) |
| Parametros activos | no disponible en el repositorio; el sufijo "A3B" del nombre sugiere del orden de 3.000 millones, sin confirmar |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene safetensors (61,1 GB, consistente con pesos en bf16 o fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La etiqueta de arquitectura del repositorio es qwen3_moe, lo que corresponde a un transformer con capas de mezcla de expertos: en lugar de una unica red feed-forward por capa, existen multiples expertos y un enrutador selecciona un subconjunto por token. El nombre del modelo descompone en cuatro piezas: "Qwen3-30B-A3B" (familia base, 30.000 millones de parametros totales y unos 3.000 millones activos por token), "Sub-MoE" (probablemente una subseleccion o division del conjunto de expertos), "ngroups64" (probablemente 64 grupos de expertos o 64 grupos de enrutado) y "adaptive" (probablemente un esquema de enrutado o de reparto de computo adaptativo por token). Estas interpretaciones son inferencias a partir del identificador: el autor no publica ninguna descripcion tecnica de la modificacion.

No hay informacion sobre el entrenamiento: se desconoce el numero de tokens utilizados, la composicion del dataset, si hubo fases de ajuste por instrucciones, RLHF o DPO, y si el modelo se ha reentrenado desde cero o se ha derivado por modificacion de pesos de un checkpoint de Qwen3-30B-A3B. El peso del repositorio (61,1 GB para 30,53 miles de millones de parametros, aproximadamente 2 bytes por parametro) es coherente con un guardado en bf16 sin optimizador ni estados auxiliares, lo que apunta a una publicacion de pesos de inferencia.

## Capacidades

No hay ninguna capacidad verificada ni documentada por el autor. Lo que sigue son capacidades atribuibles a la arquitectura base de la que el modelo parece derivar, y deben comprobarse experimentalmente antes de cualquier uso:

- Generacion de texto y conversacion multi-turno, herencia previsible de Qwen3-30B-A3B.
- Razonamiento y matematicas de nivel medio, sujeto a validacion propia.
- Generacion de codigo, sin datos que confirmen su calidad en este derivado concreto.
- Soporte multilingue: no disponible; la ficha no declara idiomas.
- Tool calling y function calling: no disponible; no se documenta plantilla de chat ni formato de herramientas.
- Comportamiento de agente y razonamiento multi-paso: no disponible.
- Modo de pensamiento (thinking) o modos de razonamiento alternativos: no disponible.
- Vision o audio: no disponible; la etiqueta de pipeline es text-generation y la libreria transformers, sin componentes multimodales declarados.

La ausencia de plantilla de chat documentada implica, ademas, que el formato de prompt correcto (tokens especiales, delimitadores de turno) es desconocido y probablemente herede la convencion de Qwen3 si el tokenizador no se ha modificado.

## Casos de uso

- Experimentacion academica con enrutado MoE: el modelo es util como objeto de estudio para analizar como afecta una agrupacion de expertos en 64 grupos ("ngroups64") al reparto de carga entre expertos, comparando la distribucion de activaciones con la del Qwen3-30B-A3B original.
- Inferencia de bajo coste por token en servidores propios: con unos 3.000 millones de parametros activos estimados, el coste de computo por token es muy inferior al de un modelo denso de 30.000 millones, lo que permite servir generacion de texto en una GPU con suficiente memoria para alojar todos los expertos.
- Base para ajuste fino supervisado en dominios verticales: al ser un checkpoint de pesos abiertos en safetensors, se puede aplicar LoRA o QLoRA sobre el para tareas concretas, siempre que se resuelva antes la ambiguedad de licencia.
- Generacion de texto por lotes sin requisitos de baja latencia: resumen, reformulacion o extraccion de informacion en pipelines offline, donde el throughput agregado importa mas que la latencia por peticion.
- Evaluacion comparativa de tecnicas de compresion: util para medir la degradacion de calidad al cuantizar a 8 y 4 bits un MoE de este tamano, dado que el repo solo distribuye pesos en precision completa.
- Reproducibilidad de articulos sobre MoE: sirve como punto de comparacion en estudios que analicen el equilibrio entre parametros totales y activos, aunque su falta de documentacion limita la trazabilidad.
- Despliegue en entornos aislados (on-premise o air-gapped): al no depender de una API externa y poder convertirse a GGUF, es viable en instalaciones sin conexion, previa verificacion de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye ningun dato de MMLU, HumanEval, GSM8K ni de evaluaciones propias, y los resultados de busqueda web no aportan informacion sobre este modelo.

## Requisitos de hardware

Las estimaciones siguientes se calculan a partir del numero de parametros totales confirmado (30,53 mil millones) y de la longitud de contexto, que es desconocida; el calculo de la cache KV es por tanto orientativo.

- VRAM para pesos en bf16/fp16: aproximadamente 61 GB solo para los pesos, mas la cache KV. Requiere una GPU de 80 GB (H100 o A100 80 GB) o reparto en varias GPU.
- VRAM en cuantizacion de 8 bits: aproximadamente 31 GB para los pesos; encaja en A100 40 GB, L40S 48 GB o H100 80 GB.
- VRAM en cuantizacion de 4 bits: aproximadamente 16-19 GB para los pesos; cabe en una RTX 4090 o RTX 5090 de 24 GB, con margen limitado para contextos largos.
- GPU recomendadas: H100 80 GB o A100 80 GB para precision completa; A100 40 GB, L40S o H100 para 8 bits; RTX 4090, RTX 5090 o L4 para 4 bits.
- Inferencia en GPU de consumo: si, en una unica RTX 4090 o 5090 con cuantizacion de 4 bits, siempre que se genere primero la version GGUF o AWQ/GPTQ, que el repositorio no incluye.
- Inferencia en CPU: tecnicamente posible con llama.cpp y cuantizacion de 4 bits (unos 17-19 GB de RAM mas cache), pero con latencia alta y throughput reducido; no recomendable para uso interactivo.
- Opciones de despliegue: transformers (libreria declarada en el repositorio); vLLM, SGLang y TGI deberian funcionar al estar registrada la arquitectura qwen3_moe, aunque no hay confirmacion de compatibilidad con esta variante concreta; llama.cpp y Ollama requieren conversion previa a GGUF, ya que el repo solo contiene safetensors.
- Latencia y throughput: no disponibles. Como referencia estructural, un MoE de 30.000 millones totales y unos 3.000 millones activos rinde por token de forma cercana a un modelo denso de 3.000 millones, pero condicionado por el ancho de banda de memoria necesario para leer los expertos seleccionados en cada capa.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus fichas publicas, no de la informacion aportada sobre este modelo, del que no existen mediciones verificables.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dohyeon1/Qwen3-30B-A3B-Sub-MoE-ngroups64-adaptive | 30,53 mil millones (confirmado) | no disponible | no disponible | no disponible | Repositorio HuggingFace con 0 descargas y 0 valoraciones |
| Qwen3-30B-A3B (base probable) | 30,5 mil millones | 3,3 mil millones | 32.768 tokens nativos, 131.072 con YaRN | Apache 2.0 | Ampliamente disponible y desplegado |
| Qwen3-32B (denso, misma familia) | 32,8 mil millones | 32,8 mil millones (denso) | 32.768 tokens nativos, 131.072 con YaRN | Apache 2.0 | Ampliamente disponible |
| Mixtral 8x7B (MoE de referencia, Mistral AI) | 46,7 mil millones | 12,9 mil millones | 32.768 tokens | Apache 2.0 | Ampliamente disponible |

La diferencia clave de esta variante frente a las alternativas es la ausencia de documentacion, licencia declarada y evaluaciones: no es posible determinar si la modificacion del enrutado mejora, iguala o degrada el comportamiento del Qwen3-30B-A3B del que parece derivar.

## Limitaciones y advertencias

- Ficha del modelo sin contenido: la model card es la plantilla automatica de HuggingFace con todos los campos marcados como "[More Information Needed]", por lo que se desconoce el proceso de entrenamiento, los datos utilizados y el proposito previsto por el autor.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial, redistribucion o modificacion. En la practica, esto equivale a "todos los derechos reservados" en muchas jurisdicciones, y ademas impide verificar si se heredan las condiciones de la licencia Apache 2.0 de la familia Qwen3.
- Riesgo de alucinacion desconocido: no hay evaluaciones de fidelidad, veracidad ni tasas de error, y tampoco se sabe si el modelo ha pasado por fases de alineacion (RLHF o DPO).
- Sesgos no evaluados: no existe ningun analisis de sesgo de genero, raza, religion o idioma, ni informacion sobre la composicion del corpus de entrenamiento.
- Cobertura idiomatica incierta: la ficha no declara idiomas. No se puede asumir buen rendimiento en castellano aunque la base Qwen3 sea multilingue.
- Contexto maximo desconocido: no se especifica la ventana de contexto, ni si soporta extension mediante YaRN o similares. Cualquier despliegue debe validar primero la longitud real soportada.
- Formato de prompt no documentado: no se indica plantilla de chat ni tokens especiales, lo que puede degradar notablemente la calidad de las respuestas si se usa un formato incorrecto.
- Modificacion arquitectonica no verificable: si el modelo reemplaza o reagrupa expertos del checkpoint original, es posible que parte de los pesos no hayan recibido el mismo entrenamiento, con el consiguiente riesgo de degradacion en dominios poco representados.
- Sin validacion de la comunidad: cero descargas y cero valoraciones implican que no hay terceros que hayan reproducido resultados ni detectado fallos.
- Pesos unicamente en safetensors: no se ofrecen versiones GGUF, AWQ o GPTQ, de modo que el coste de conversion y validacion recae en quien lo despliegue.
- Fecha de publicacion atipica: los metadatos indican creacion y actualizacion en septiembre de 2026, con apenas seis minutos entre ambas, lo que sugiere una subida automatizada o de prueba.
- Advertencia sobre los enlaces de la busqueda: los resultados obtenidos corresponden a paginas del traductor de Google, sin ninguna relacion con el modelo, por lo que no aportan informacion tecnica util.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dohyeon1/Qwen3-30B-A3B-Sub-MoE-ngroups64-adaptive
- Referencia citada en la etiqueta arxiv:1910.09700: https://arxiv.org/abs/1910.09700 (corresponde a Lacoste et al., "Quantifying the Carbon Emissions of Machine Learning", citado en la plantilla generica de la model card; no es un articulo sobre este modelo)
- Calculadora de impacto medioambiental enlazada en la plantilla: https://mlco2.github.io/impact
- Repositorio de la familia base Qwen3 (referencia, no enlazado por el autor): https://huggingface.co/Qwen/Qwen3-30B-A3B
- No se han encontrado papers, blogs, repositorios de codigo ni demos especificos de este modelo en la busqueda web realizada.
