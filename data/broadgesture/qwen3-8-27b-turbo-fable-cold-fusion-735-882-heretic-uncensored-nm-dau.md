# broadgesture/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU

## Resumen

El modelo identificado como `broadgesture/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU` es un checkpoint publicado en Hugging Face por el usuario `broadgesture`. Por su nombre y por el recuento real de parametros en safetensors (27.356.728.560, es decir, aproximadamente 27,36 mil millones), se trata presumiblemente de un derivado o ajuste fino de la familia Qwen, si bien el autor no aporta documentacion que lo confirme. La model card publicada se limita a declarar la licencia Apache 2.0, sin descripcion, sin datos de entrenamiento y sin resultados de evaluacion.

El modelo resuelve, en principio, el mismo problema que cualquier LLM de gran tamano: generacion de texto, razonamiento y conversacion. La relevancia de esta publicacion es limitada desde el punto de vista tecnico, ya que no hay informacion verificable sobre el proceso de ajuste, los datos utilizados ni el rendimiento. El repositorio ocupa 54,7 GB, coherente con pesos en precision de 16 bits para 27,36 mil millones de parametros.

Todos los elementos del nombre que acompanan a "Qwen3.8-27B" (TURBO, Fable, Cold-Fusion, Heretic, Uncensored, NM, DAU) son marcas del autor sin definicion publica. Cualquier uso en produccion deberia tratarse con cautela hasta que exista documentacion tecnica o evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer denso derivado de Qwen; no confirmado por el autor) |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna del modelo. El recuento de parametros (27,36 B) y el tamano del repositorio (54,7 GB) son compatibles con un transformer denso en bf16/fp16, pero el autor no especifica numero de capas, dimension oculta, cabezas de atencion, tipo de atencion (completa, GQA, sliding window) ni si incorpora componentes MoE. Tampoco se documenta la longitud de contexto nativa.

Respecto al entrenamiento, la model card no incluye numero de tokens, composicion del dataset, fases de SFT, RLHF o DPO, ni tecnicas de alineacion. El sufijo "Uncensored" del nombre sugiere un ajuste orientado a reducir los rechazos del modelo base, pero no existe ninguna descripcion del procedimiento ni de los datos empleados para ello. No se dispone de informacion sobre decodificacion especulativa, atencion lineal ni otras innovaciones tecnicas.

## Capacidades

- Generacion de texto y conversacion multi-turno: capacidad esperable en un modelo de 27 B, aunque no verificada por el autor.
- Razonamiento y matematicas: no documentado; sin benchmarks publicados.
- Generacion de codigo: no documentado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Vision, audio o modos especiales (thinking mode, etc.): no disponible.
- Comportamiento "uncensored": el nombre indica una orientacion a reducir filtros de rechazo, pero no hay especificacion tecnica de como se ha implementado.

## Casos de uso

- Experimentacion e investigacion sobre ajustes finos de modelos de ~27 B: util como checkpoint de partida para comparar tecnicas de alineacion, dado que se publica bajo Apache 2.0 y en safetensors.
- Evaluacion de robustez y seguridad: permite estudiar el efecto de un ajuste etiquetado como "uncensored" frente al modelo base, siempre en entornos controlados y con supervision humana.
- Generacion de texto creativo sin restricciones tematicas: el nombre sugiere menor tasa de rechazos, lo que puede interesar en escritura de ficcion, aunque sin garantias documentadas de calidad.
- Prototipado de asistentes conversacionales en local: con 27,36 B de parametros puede desplegarse en una unica GPU de 80 GB en bf16, o en GPUs de 24-48 GB con cuantizacion (que el autor no proporciona y habria que generar).
- Base para destilacion o generacion de datos sinteticos: un modelo de este tamano puede emplearse para producir datasets de entrenamiento, previa validacion de la calidad de sus salidas.
- Fine-tuning especifico de dominio: la licencia Apache 2.0 permite reentrenamiento y uso comercial, si bien la ausencia de documentacion obliga a evaluar el modelo antes de comprometerlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 55 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 60-70 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: ~28 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: ~15-16 GB de pesos (cuantizaciones no publicadas por el autor; habria que generarlas con herramientas como llama.cpp o GPTQ/AWQ).
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 sin cuantizar; A6000/L40S 48 GB o dos RTX 4090 en paralelo para fp16 con tensor parallelism; RTX 4090 (24 GB) o RTX 3090 solo con cuantizacion de 4-8 bits.
- Cabe en GPU de consumo: si, con cuantizacion de 4 bits en GPUs de 24 GB; en 16 GB requiere cuantizaciones agresivas y contexto reducido.
- Opciones de despliegue: vLLM, TGI o SGLang para safetensors en servidor; llama.cpp u Ollama tras convertir los pesos a GGUF (no incluidos en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Documentacion | Disponibilidad |
|---|---|---|---|---|---|
| broadgesture/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | ~27,36 B | no disponible | Apache 2.0 | practicamente nula | Hugging Face, 0 descargas |
| Qwen2.5-32B (Alibaba) | 32,5 B | 128 K tokens (version base) | Apache 2.0 (mayoria de variantes) | model card completa y benchmarks | Hugging Face, amplia adopcion |
| Gemma 2 27B (Google) | 27 B | 8 K tokens | Gemma Terms of Use | model card completa y benchmarks | Hugging Face, amplia adopcion |
| Mistral Small 24B (Mistral AI) | 24 B | 32 K tokens | Apache 2.0 | model card completa y benchmarks | Hugging Face, amplia adopcion |

La comparacion se limita a parametros y licencia: para este checkpoint no existen datos de contexto, rendimiento ni evaluacion que permitan una comparacion tecnica rigurosa con las alternativas citadas.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no hay informacion sobre datos de entrenamiento, alineacion ni evaluacion, lo que impide estimar sesgos, calidad o riesgos.
- Riesgo elevado de alucinacion no cuantificado: sin benchmarks ni evaluaciones publicadas, no es posible acotar la tasa de error.
- Etiqueta "Uncensored": implica probablemente una reduccion de los filtros de seguridad del modelo base, con mayor riesgo de generar contenido inapropiado, danino o ilegal; requiere moderacion externa en cualquier despliegue publico.
- Idiomas y contexto desconocidos: no se puede garantizar soporte multilingue ni una ventana de contexto concreta.
- Nombre no verificable: los sufijos TURBO, Cold-Fusion, Heretic, NM y DAU no tienen definicion publica; no debe asumirse ninguna capacidad a partir de ellos.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Licencia Apache 2.0 declarada, pero sin que el autor documente la procedencia del modelo base ni la cadena de derivacion; conviene verificar la compatibilidad licencial antes de un uso comercial.
- Fecha de creacion futura en los metadatos (2026-11-09): inconsistencia que sugiere que los metadatos no son fiables.

## Enlaces

- Hugging Face: https://huggingface.co/broadgesture/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Paper, blog, repositorio o demo: no disponible
