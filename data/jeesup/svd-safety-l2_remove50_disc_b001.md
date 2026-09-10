# Jeesup/svd-safety-l2_remove50_disc_b001

## Resumen

svd-safety-l2_remove50_disc_b001 es un checkpoint de investigacion publicado por el usuario Jeesup en HuggingFace, derivado de meta-llama/Llama-2-7b-chat-hf. No es un asistente conversacional de proposito general: es un artefacto experimental. El autor ha comprimido el modelo original con SVD-LLM hasta el 50,09 % de los parametros densos (49,91 % de parametros eliminados) y despues ha restaurado el 0,1 % de los componentes SVD mediante la regla de seleccion denominada `disc`, con semilla 42 y 679 componentes restaurados (0 componentes sustituidos).

El objetivo declarado del trabajo es medir como la compresion SVD degrada el comportamiento de seguridad del modelo y que regla de seleccion de componentes repara mejor ese dano. Este checkpoint es una celda concreta de una rejilla de reglas y presupuestos, y el propio autor advierte que varias ramas de la rejilla estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat: la compresion por si sola eleva la tasa de exito de ataque, y el proposito del estudio es cuantificarlo y probar la recuperacion.

Su relevancia es metodologica mas que de producto: aporta mediciones reproducibles del compromiso entre compresion, utilidad y seguridad, con una tasa de exito de ataque del 23,85 % en AdvBench y del 19,81 % en StrongREJECT, perplexidad de 13,5856 en WikiText-2 y rechazo excesivo macro del 26,40 % segun WildGuard. La licencia aplicable es la Llama 2 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama-2-7b-chat) con matrices de pesos comprimidas mediante SVD-LLM |
| Parametros totales | 6.738.415.616 segun los tensores safetensors del repositorio; el autor declara una fraccion resultante de 0,5009 de los parametros densos del modelo base |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (heredada de Llama-2-7b-chat) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no se incluyen versiones GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible en la model card; el modelo base Llama-2-7b-chat esta optimizado principalmente para ingles |
| Licencia | Llama 2 Community License (se incluyen LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Metodo de compresion | SVD-LLM, 49,91 % de parametros eliminados |
| Regla de seleccion | `disc` |
| Presupuesto de restauracion | 0,100 % de los parametros densos |
| Componentes restaurados | 679 |
| Componentes sustituidos | 0 |
| Semilla | 42 |
| Tamano del repositorio | 13,5 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-2-7b-chat: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios, con 4096 tokens de contexto. Sobre ese checkpoint se aplica SVD-LLM, un esquema de compresion que descompone en valores singulares las matrices de pesos y trunca los componentes de menor contribucion, de modo que el modelo comprimido conserva la topologia original pero con matrices factorizadas de bajo rango. El checkpoint publicado corresponde al 50,09 % de parametros densos resultantes.

Sobre esa base comprimida se restaura un presupuesto adicional del 0,1 % de parametros densos, materializado en 679 componentes SVD seleccionados por la regla `disc`. En este caso no se sustituyo ningun componente (0 componentes sustituidos). No se realizo ningun reentrenamiento ni ajuste fino posterior segun la informacion disponible: se trata de una reconfiguracion de componentes sobre un checkpoint ya comprimido. El modelo base original fue entrenado por Meta sobre 2 billones de tokens y afinado con RLHF para dialogo, pero la model card no documenta ningun proceso de alineamiento adicional aplicado a esta variante comprimida, ni datos de entrenamiento propios, ni innovaciones de decodificacion (no hay decodificacion especulativa, atencion lineal ni mecanicas similares).

## Capacidades

- Generacion de texto conversacional: hereda la capacidad de dialogo del checkpoint Llama-2-7b-chat, con la degradacion esperable tras eliminar el 49,91 % de parametros densos.
- Razonamiento basico y respuesta a instrucciones en ingles: capacidad residual del modelo base, no evaluada de forma especifica en la informacion disponible mas alla de la perplexidad en WikiText-2 (13,5856).
- Comportamiento de seguridad medible: es la capacidad que el artefacto esta disenado para estudiar, con metricas publicadas de tasa de exito de ataque y de rechazo excesivo.
- Tool calling / function calling: no soportado de forma nativa; Llama-2-7b-chat no incluye un formato oficial de llamada a funciones y la model card no declara ninguna adaptacion en ese sentido.
- Uso como agente y razonamiento multi-paso: no disponible; no hay indicios de soporte especifico ni evaluaciones de tareas agenticas.
- Capacidades multilingues: no disponibles ni declaradas; el modelo base esta orientado a ingles.
- Capacidades especiales (modo thinking, vision, audio): ninguna. No hay vision, audio, tool use nativo ni modo de razonamiento explicito.

## Casos de uso

- Investigacion sobre compresion de modelos: sirve como celda reproducible (semilla 42) en estudios que comparan reglas de seleccion de componentes SVD y presupuestos de restauracion sobre Llama-2-7b-chat, permitiendo aislar el efecto de la regla `disc` frente a otras.
- Evaluacion de seguridad bajo compresion: el checkpoint permite medir con HarmBench judge y AdvBench/StrongREJECT como la eliminacion del 49,91 % de parametros altera la tasa de exito de ataque, y comparar ese valor (0,2385 y 0,1981) con el del modelo sin comprimir.
- Analisis de rechazo excesivo: con la metrica macro de WildGuard (0,2640) se puede estudiar si la compresion y la restauracion de componentes vuelven al modelo mas propenso a rechazar peticiones benignas, un fallo critico en asistentes desplegados.
- Linea base para tecnicas de reparacion: cualquier metodo nuevo de recuperacion de capacidades tras compresion puede medirse contra este checkpoint, que aporta cifras publicadas de perplexidad (13,5856 en WikiText-2) y de seguridad.
- Interpretabilidad de componentes: los 679 componentes restaurados por la regla `disc` son un objeto de estudio directo para analizar que subespacios de las matrices de pesos concentran comportamiento relacionado con la seguridad.
- Estudio de eficiencia en hardware restringido: aunque el repositorio ocupa 13,5 GB, la fraccion densa reducida hace que el checkpoint sea util para experimentos de coste de inferencia en GPUs de gama media, siempre con validacion previa de la calidad resultante.
- Generacion de texto de bajo coste en entornos controlados: solo como sujeto experimental en bancos de prueba internos, nunca como asistente orientado a usuarios finales.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / metodo |
|---|---|---|
| AdvBench ASR | 0,2385 | HarmBench judge |
| StrongREJECT ASR | 0,1981 | HarmBench judge |
| Rechazo excesivo macro | 0,2640 | WildGuard |
| Perplexidad WikiText-2 | 13,5856 | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks de conocimiento o codigo (MMLU, HumanEval, GSM8K) para este checkpoint, ni comparaciones directas con el modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 14-16 GB solo para pesos (13,5 GB de repositorio) mas cache KV y activaciones para 4096 tokens de contexto.
- VRAM estimada en 8 bits: en torno a 7-8 GB de pesos.
- VRAM estimada en 4 bits: en torno a 4-5 GB de pesos, aunque el repositorio no publica pesos cuantizados y habria que generarlos.
- GPU profesionales: A100 40 GB, A100 80 GB, H100, L40S y A10G son suficientes con margen en fp16.
- GPU de consumo: cabe en RTX 3090, RTX 4090 y RTX 5090 (24 GB o mas) en fp16; con cuantizacion de 4 bits podria caber en GPUs de 8-12 GB, como una RTX 3060 de 12 GB o una RTX 4070.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference`) y endpoints compatibles (etiqueta `endpoints_compatible`). vLLM es viable al ser una arquitectura Llama, pero no esta confirmado por el autor. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, tarea no documentada en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento de seguridad | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove50_disc_b001 | 6.738.415.616 en safetensors; 0,5009 de fraccion densa declarada | 4096 | Llama 2 Community License | AdvBench ASR 0,2385; StrongREJECT ASR 0,1981; rechazo excesivo 0,2640 | Pesos safetensors en HuggingFace |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B (modelo denso de referencia) | 4096 | Llama 2 Community License | no disponible en la informacion proporcionada para comparacion directa | Pesos oficiales en HuggingFace |
| Otras celdas de la rejilla del mismo estudio (otras reglas de seleccion y presupuestos) | no disponible | 4096 | Llama 2 Community License | no disponible | Mismo autor, no detalladas en la informacion proporcionada |

La comparacion cuantitativa con alternativas de la misma categoria (por ejemplo, otros checkpoints comprimidos de Llama-2-7b o modelos de 7-8 B de otros fabricantes) no esta disponible: no se han proporcionado mediciones homogeneas con HarmBench ni con WildGuard para esos modelos. Cualquier conclusion requiere evaluar el modelo base sin comprimir con el mismo pipeline de medida.

## Limitaciones y advertencias

- No es un modelo desplegable: el autor lo describe explicitamente como artefacto de investigacion y sujeto experimental, no como asistente de uso general.
- Seguridad degradada de forma deliberada en varias ramas del estudio: la compresion eleva la tasa de exito de ataque, y este checkpoint presenta un ASR de 0,2385 en AdvBench y 0,1981 en StrongREJECT, valores que deben interpretarse en el contexto del experimento y no como un nivel de seguridad aceptable en produccion.
- Rechazo excesivo elevado: 0,2640 de rechazo macro segun WildGuard, lo que implica que una fraccion relevante de peticiones benignas puede ser rechazada.
- Perdida de calidad de lenguaje: perplexidad de 13,5856 en WikiText-2, indicativa del deterioro introducido por la compresion, sin dato de referencia del modelo base en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la model card; en un modelo con casi la mitad de parametros densos eliminados es esperable un aumento, pero no hay medicion publicada.
- Idiomas: no se declaran idiomas soportados; el modelo base esta orientado a ingles, por lo que el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto limitado a 4096 tokens, insuficiente para tareas de contexto largo o agentes con historiales extensos.
- Ausencia de tool calling nativo y de evaluaciones agenticas, lo que descarta su uso en pipelines que dependan de llamadas a funciones.
- Licencia restrictiva: Llama 2 Community License con USE_POLICY.md, que impone condiciones adicionales (entre ellas limites de escala de usuarios mensuales y restricciones de uso aceptable) para uso comercial.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de los resultados.
- Posible discrepancia entre metricas: el recuento de parametros en safetensors (6.738.415.616) coincide practicamente con el del checkpoint original de Llama-2-7b, mientras el autor declara una fraccion densa de 0,5009; conviene verificar de forma independiente como se materializa la compresion en los tensores antes de reutilizar el checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_disc_b001
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 y politica de uso: LICENSE.txt y USE_POLICY.md incluidos en el propio repositorio del modelo
- Enlaces adicionales (papers, blogs, repos, demos): no disponible. La busqueda web realizada no devolvio resultados relevantes para este modelo; los resultados obtenidos corresponden a repositorios de terceros sin relacion con el checkpoint.
