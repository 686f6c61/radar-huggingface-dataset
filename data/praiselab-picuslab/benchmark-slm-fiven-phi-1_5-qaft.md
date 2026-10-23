# praiselab-picuslab/benchmark-slm-fiven-phi-1_5-qaft

## Resumen

`praiselab-picuslab/benchmark-slm-fiven-phi-1_5-qaft` es un adaptador LoRA (PEFT) publicado por el usuario `praiselab-picuslab` sobre el modelo base `microsoft/phi-1_5`. Por los metadatos de la ficha (tags `benchmark-slm`, `dataset-fiven`, `strategy-qaft`, idioma `it`) se trata de un artefacto experimental orientado a un benchmark interno de modelos de lenguaje pequenos, entrenado sobre un dataset denominado "fiven" y con una estrategia de ajuste etiquetada como "qaft". No es un modelo entrenado desde cero, sino un conjunto de pesos de adaptacion de bajo rango que requiere cargar el modelo base para funcionar.

El modelo base, phi-1_5, es un transformer decoder-only de aproximadamente 1.3 mil millones de parametros desarrollado por Microsoft Research, con una ventana de contexto de 2048 tokens y entrenado sobre datos filtrados y sinteticos de "calidad de libro de texto". Esa base condiciona por completo las capacidades reales del adaptador: el LoRA no anade conocimiento nuevo de gran escala, solo modula el comportamiento del modelo base sobre la distribucion del dataset de ajuste.

La relevancia de esta ficha es limitada y de caracter practico: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el acceso esta restringido (gated), el tamano del repo es de 0.0 GB y no se publica informacion sobre datos de entrenamiento, hiperparametros, resultados de evaluacion ni licencia del adaptador. Debe tratarse, por tanto, como un artefacto de investigacion reproducible solo si se aceptan las condiciones de acceso, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; arquitectura del modelo base: `microsoft/phi-1_5` |
| Parametros totales | Modelo base: ~1.3 mil millones. Parametros del adaptador: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (heredada del modelo base); no se especifica modificacion en el adaptador |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (precision del adaptador no disponible). El modelo base admite cuantizacion INT8/INT4 y conversion a GGUF; no se han publicado versiones cuantizadas de este adaptador |
| Idiomas soportados | `it` (italiano) segun los metadatos del repositorio; el modelo base esta entrenado predominantemente en ingles |
| Licencia | No disponible para el adaptador. El modelo base `microsoft/phi-1_5` se publica bajo licencia MIT |
| Formato de pesos | `safetensors` con configuracion PEFT/LoRA (libreria `peft`) |
| Tamano del repositorio | 0.0 GB (adaptador de bajo rango, pesos de pequeno tamano) |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Pipeline declarado | `text-generation` |
| Fecha de creacion / actualizacion | 2026-10-23 / 2026-10-23 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un par de matrices de bajo rango insertadas en las capas del transformer base que se entrenan manteniendo congelados los pesos originales. La Arquitectura subyacente es la de `microsoft/phi-1_5`: un transformer decoder-only de ~1.3B parametros, con atencion causal estandar (sin variantes de atencion lineal ni arquitecturas hibridas), contexto de 2048 tokens y un tokenizador propio del modelo base. El adaptador no modifica la arquitectura ni la longitud de contexto; su efecto se limita al reajuste de las proyecciones sobre las que se aplica el LoRA.

No se dispone de informacion publica sobre el proceso de entrenamiento del adaptador: se desconocen el numero de tokens vistos, la composicion exacta del dataset "fiven", el rango del LoRA, el alpha, la tasa de aprendizaje, el numero de epocas ni si se aplicaron tecnicas de alineacion adicionales (RLHF, DPO) o de cuantizacion durante el ajuste. La etiqueta `strategy-qaft` sugiere alguna forma de ajuste asistido o consciente de cuantizacion, pero no hay documentacion que lo confirme, por lo que no debe asumirse ninguna propiedad concreta derivada de esa etiqueta.

## Capacidades

- Generacion de texto autoregresiva en italiano, condicionada por el dataset de ajuste "fiven"; el alcance tematico y estilistico de ese dataset no esta documentado.
- Razonamiento basico y respuesta a instrucciones heredados del modelo base phi-1_5, con un techo bajo en conocimiento factual y en tareas de sentido comun.
- Generacion de codigo y resolucion de problemas matematicos sencillos, capacidades propias de phi-1_5 (entrenado con datos de "calidad de libro de texto" y contenido de programacion); el grado de preservacion tras el ajuste LoRA no se ha evaluado publicamente.
- Soporte de tool calling / function calling: no disponible de forma nativa. phi-1_5 no incluye plantillas de herramientas ni formato de llamadas a funciones; cualquier soporte requeriria un esquema de prompting ad hoc.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; el contexto de 2048 tokens limita los bucles de agente con historial largo.
- Capacidades multilingues: limitadas al italiano como idioma declarado, con posible transferencia parcial desde el ingles del modelo base; no hay evaluacion publicada por idioma.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Adaptacion a dominio: capacidad potencial de especializacion en el dominio del dataset "fiven", no verificada ni documentada.

## Casos de uso

- Evaluacion comparativa de estrategias de ajuste eficiente: el adaptador sirve como punto de medida dentro de un benchmark de modelos pequenos, permitiendo comparar la estrategia "qaft" frente a otros adaptadores del mismo autor sobre el mismo modelo base y el mismo dataset.
- Reproduccion de experimentos academicos: un grupo de investigacion puede cargar el adaptador con PEFT sobre `microsoft/phi-1_5` y replicar las condiciones del benchmark, siempre que el acceso gated se conceda y se disponga del dataset "fiven".
- Prototipado rapido de generacion de texto en italiano: al ocupar el adaptador apenas unos megabytes, se puede superponer al modelo base en una estacion de trabajo con una sola GPU consumer para probar respuestas en italiano antes de invertir en un modelo mayor.
- Ajuste de tono o estilo en un dominio acotado: si el dataset "fiven" cubre un dominio concreto, el LoRA puede emplearse para adaptar el registro del modelo base en ese dominio sin reentrenar los 1.3B parametros.
- Docencia y formacion tecnica: sirve como ejemplo practico de flujo PEFT (descarga del adaptador, carga del modelo base, merge de pesos y evaluacion) en cursos de ajuste eficiente de modelos.
- Base para experimentos de merging de adaptadores: al ser un LoRA de bajo rango, se puede combinar con otros adaptadores sobre phi-1_5 para estudiar tecnicas de composicion de pesos, con la cautela de que no hay evaluacion publicada de calidad tras el merge.
- Analisis de artefactos de benchmark: util para auditar como se documentan (o no) los repositorios de benchmark en HuggingFace, dado el caracter incompleto de la ficha (sin licencia, sin metricas, sin card detallada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del repositorio no incluye metricas (MMLU, HumanEval, GSM8K ni evaluaciones en italiano), no se especifica el conjunto de evaluacion del benchmark "slm" al que alude el nombre y no consta ninguna comparacion con el modelo base sin adaptar. Tampoco hay informacion sobre latencia o throughput medida.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en si ocupa del orden de megabytes (repo de 0.0 GB); el coste real lo determina el modelo base. En FP16, phi-1_5 (~1.3B parametros) requiere aproximadamente 2.6-3 GB solo para pesos, mas overhead de activaciones y cache KV.
- En cuantizacion de 8 bits, el modelo base se situa en torno a 1.4-1.8 GB; en 4 bits, en torno a 0.8-1.1 GB. Estas cifras son estimaciones derivadas del numero de parametros, no medidas publicadas para este adaptador.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, RTX 4090) es suficiente para inferencia en FP16 con contexto completo de 2048 tokens. Para entrenamiento o ajuste del adaptador, se recomienda una GPU de 16-24 GB (RTX 4090, A5000, L4, A10G).
- Cabe en GPU consumer: si, en practicamente toda la gama actual con 8 GB o mas, incluso en FP16. Tambien es viable en CPU para inferencia por lotes pequenos, con latencia alta.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador sobre el modelo base, con opcion de `merge_and_unload`), vLLM y TGI para servir el modelo fusionado, llama.cpp/Ollama tras conversion a GGUF del modelo fusionado (la arquitectura phi-1_5 cuenta con soporte en llama.cpp), y servidores tipo FastAPI sobre transformers para prototipos.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones para este adaptador; en el modelo base se espera un throughput alto en GPU consumer por el reducido numero de parametros, pero no se aporta ninguna cifra verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `praiselab-picuslab/benchmark-slm-fiven-phi-1_5-qaft` | ~1.3B (base) + LoRA de tamano no especificado | 2048 (base) | Adaptador: no disponible; base: MIT | Gated, 0 descargas | Artefacto de benchmark en italiano; sin metricas publicadas |
| `microsoft/phi-1_5` (modelo base) | ~1.3B | 2048 | MIT | Publico | Referencia directa; el adaptador se evalua necesariamente contra el |
| `microsoft/Phi-3-mini-4k-instruct` | ~3.8B | 4096 | MIT | Publico | Generacion posterior de Microsoft, mas capaz en instrucciones y codigo; requiere mas VRAM |
| `Qwen2.5-1.5B-Instruct` | ~1.5B | 32 768 | Apache 2.0 | Publico | Alternativa contemporanea con contexto muy superior y soporte multilingue amplio, incluido italiano |
| `TinyLlama-1.1B-Chat` | ~1.1B | 2048 | Apache 2.0 | Publico | Comparable en tamano y contexto; pensado para chat, no para benchmarks en italiano |

Las cifras de los modelos alternativos corresponden a informacion publica general de sus repositorios y no han sido verificadas en la busqueda realizada para esta ficha; deben contrastarse antes de usarlas en una decision tecnica.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card detallada, ni descripcion del dataset "fiven", ni hiperparametros, ni metricas. Es imposible evaluar la calidad del ajuste con la informacion disponible.
- Licencia del adaptador no disponible: no puede asumirse que herede la licencia MIT del modelo base. Cualquier uso comercial requiere aclaracion previa con el autor; a dia de hoy no esta permitido asumir viabilidad comercial.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que anade friccion a la reproducibilidad y puede impedir el uso en pipelines automatizados.
- Riesgo de alucinacion: alto, heredado de phi-1_5, un modelo de 1.3B con conocimiento factual limitado y contexto de 2048 tokens. El ajuste LoRA no corrige esta limitacion y podria acentuarla si el dataset de ajuste es estrecho.
- Sesgos conocidos: no documentados para el adaptador. El modelo base presenta sesgos derivados de sus datos de entrenamiento (predominantemente en ingles y con datos sinteticos), que pueden manifestarse de forma distinta al operar en italiano.
- Limitacion idiomatica: el italiano es el unico idioma declarado; el soporte real puede ser superficial si el dataset de ajuste es pequeno. No hay evaluaciones por idioma.
- Limitacion de contexto: 2048 tokens es insuficiente para documentos largos, RAG con muchos pasajes o conversaciones multi-turno extensas.
- Sin soporte nativo de tool calling ni de agentes: integrarlo en un pipeline de funciones exige construir el formato de llamadas manualmente y validar las salidas.
- Idoneidad para produccion: baja. Es un artefacto de benchmark sin garantias de calidad, sin SLA, sin versionado semantico y sin mantenimiento conocido.
- Fecha de creacion futura respecto a la mayoria de referencias del ecosistema (2026-10-23): conviene verificar la consistencia de los metadatos antes de citar el repositorio.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-phi-1_5-qaft
- Modelo base `microsoft/phi-1_5`: https://huggingface.co/microsoft/phi-1_5
- Paper de referencia del modelo base ("Textbooks Are All You Need"): https://arxiv.org/abs/2306.11644
- Libreria PEFT: https://github.com/huggingface/peft
- No se han encontrado enlaces tecnicos relevantes en la busqueda web realizada; los resultados obtenidos no guardaban relacion con el modelo ni con el ecosistema de IA open source.
