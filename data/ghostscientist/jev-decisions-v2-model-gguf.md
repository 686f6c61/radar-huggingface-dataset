# GhostScientist/jev-decisions-v2-model-gguf

## Resumen

jev-decisions-v2-model-gguf es la version cuantizada en formato GGUF de GhostScientist/jev-decisions-v2-model, un ajuste fino completo del modelo base Qwen3.5-0.8B. Se trata de un modelo de decision de "letra unica" al estilo Jev/Tev1: recibe una entrada JSON con un estado, una pregunta y una lista de opciones, y responde con una sola letra que identifica la opcion elegida, sin emitir texto adicional ni marcadores de razonamiento. Lo desarrolla el usuario GhostScientist y esta publicado unicamente como artefacto de inferencia (GGUF) para su uso con llama.cpp, Ollama y servidores compatibles con endpoints.

El interes de esta ficha radica en que es un modelo muy pequeno (752.393.024 parametros, unos 0,75 mil millones) especializado en una tarea muy concreta, no en generacion de texto abierta. Su tamano reducido permite ejecutarlo en CPU o en GPU de consumo con una huella de memoria minima: la cuantizacion Q4_K_M ocupa 529 MB y la Q8_0 812 MB, dentro de un repositorio total de 2,9 GB. La model card reporta una precision de 0,82 en el export Q4_K_M sobre 200 muestras de desarrollo con llama.cpp, lo que lo hace atractivo para tareas de clasificacion o enrutamiento de decisiones de bajo coste.

El modelo se distribuye sin licencia declarada ni idiomas especificados, y su integracion exige cuidado con el manejo de plantillas, porque el template de chat de Qwen3.5 activa por defecto el modo "thinking" y la respuesta de una sola letra puede terminar en el campo de razonamiento en lugar del contenido principal. El autor documenta explicitamente este comportamiento y las soluciones (desactivar thinking en llama-server o marcar `think: false` en Ollama).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivado de Qwen3.5-0.8B (config con capa MTP declarada); ajuste fino completo |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el Modelfile de Ollama fija `num_ctx 4096`) |
| Tipos de cuantizacion | Q4_K_M (529 MB), Q8_0 (812 MB); referencia original en bf16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo original se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-0.8B, un transformer decoder, sobre el que se ha realizado un ajuste fino completo (full fine-tune) para convertir el modelo base en un decisor de letra unica. La model card indica que el training se hizo sobre el dataset GhostScientist/jev-decisions-v1, tambien publicado por el autor. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de alineacion como RLHF o DPO: esa informacion no esta disponible.

Un detalle tecnico destacable es la presencia de una capa de prediccion multi-token (MTP) declarada en el config, pero sin tensores asociados. Esto obliga a convertir el modelo con `convert_hf_to_gguf.py --no-mtp`, ya que la conversion por defecto genera una cabecera de metadatos de 25 bloques que llama-server rechaza con el error `check_tensor_dims: tensor 'blk.24.attn_norm.weight' not found`. Es una particularidad de conversion relevante para reproducir el artefacto. No se documentan otras innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Decision de opcion unica: dada una entrada JSON con `state`, `question` y `options`, devuelve una sola letra correspondiente a la opcion elegida.
- Salida determinista y acotada: el modelo nunca emite marcadores de razonamiento visibles ni texto libre; en las evaluaciones reportadas la tasa de letra valida es de 1,00.
- Modo greedy: el Modelfile fija `temperature 0`, lo que refuerza la reproducibilidad de la decision.
- Integracion conversacional: la etiqueta `conversational` sugiere compatibilidad con plantillas de chat, pero la tarea real es de clasificacion estructurada, no de dialogo abierto.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` apunta a su uso detras de servidores con API compatible.
- Capacidades multilingues: no disponibles (no se declaran idiomas soportados).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni thinking mode funcional (de hecho, el thinking del template base interfiere y debe desactivarse).

## Casos de uso

- Enrutamiento automatico de decisiones: el modelo recibe un estado del sistema y una lista de acciones posibles y devuelve la letra de la accion a ejecutar; su salida de una sola letra simplifica el parseo en pipelines de orquestacion.
- Clasificacion de bajo coste en produccion: al caber en 529 MB con Q4_K_M, se puede desplegar como clasificador de decisiones en un servicio ligero que corre en CPU, con latencias p50 de ~1,33 s en 4 hilos de CPU.
- Politica de agentes en simuladores o juegos: dado un estado y un conjunto de jugadas, el modelo elige la opcion, encajando como politica ligera en entornos paso a paso donde la decision importa mas que la generacion de texto.
- Anotacion y etiquetado asistido: puede usarse para pre-etiquetar decisiones en conjuntos de datos, con la letra devuelta como etiqueta directa y sin post-procesado de lenguaje natural.
- Validacion de decisiones en tiempo real en edge: su tamano reducido (812 MB en Q8_0) permite ejecutarlo en dispositivos sin GPU dedicada usando llama.cpp u Ollama.
- Modulo de decision dentro de un sistema mayor: al ser determinista (temperature 0) y devolver una letra, encaja como componente sustituible en arquitecturas donde el modelo grande genera opciones y este decide.
- Pruebas de integracion de plantillas: sirve como caso de estudio para depurar el enrutado de `reasoning_content` frente a `content` en servidores con template de Qwen3.5, un problema documentado por el propio autor.

## Benchmarks y rendimiento

La model card proporciona mediciones realizadas sobre el export Q4_K_M exacto:

| Evaluacion | Precision | Tasa de letra valida | Latencia |
|---|---|---|---|
| llama.cpp, 4 hilos de CPU, 200 muestras dev, greedy | 0,82 | 1,00 | p50 ~1,33 s, p95 ~2,47 s |
| Ollama (`/api/chat`), 40 muestras dev | 0,925 | 1,00 | p50 ~2,6 s |
| Referencia GPU bf16 (400 muestras dev) | 0,80 | 1,00 | media ~138 ms |

Nota del autor: la prueba con Ollama se ejecuto solo sobre las primeras 40 filas de desarrollo, por lo que no es directamente comparable con las cifras del split completo. Asimismo, se reporta que en llama-server la precision pasaba de 0,00 a 0,82 con los mismos pesos segun se gestionara el modo thinking. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con Q4_K_M y 0,8 GB con Q8_0; alrededor de 1,5 GB si se usa la referencia bf16.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente dado el tamano; la referencia bf16 medida en GPU da una latencia media de ~138 ms por decision.
- CPU: funciona integramente en CPU; la medicion oficial usa 4 hilos con p50 ~1,33 s y p95 ~2,47 s por peticion.
- Consumer GPU: si, cabe holgadamente en tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090 o inferiores, e incluso en GPUs integradas con memoria compartida.
- Opciones de despliegue: llama.cpp (llama-server con `--no-mtp` en la conversion), Ollama (Modelfile incluido, con `think: false` o lectura de `message.thinking`), y servidores con API compatible con endpoints.
- Latencia y throughput: latencias documentadas de p50 ~1,33 s en CPU (4 hilos) y ~138 ms de media en GPU bf16; no se reporta throughput agregado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables de otros modelos en la informacion proporcionada. A modo orientativo, se compara con alternativas de tamano similar en cuanto a especificaciones generales, marcando como "no disponible" todo aquello que no se puede confirmar.

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| jev-decisions-v2-model-gguf | ~752 M | no disponible | no disponible | GGUF | Decision de letra unica |
| Qwen3.5-0.8B (base) | ~800 M (no confirmado) | no disponible | no disponible | safetensors | Modelo generalista |
| Otros modelos ~1B (p. ej. Llama 3.2 1B, Gemma 3 1B) | ~1 B | variable | licencias propias | safetensors / GGUF | Modelos generalistas |

La comparacion de rendimiento frente a estas alternativas no es posible con la informacion disponible, ya que se trata de tareas distintas y no se aportan metricas comunes.

## Limitaciones y advertencias

- Modelo de tarea unica: no es un modelo de proposito general; solo devuelve una letra de decision y no genera texto, codigo ni razonamiento.
- Riesgo de alucinacion: puede seleccionar una letra valida pero incorrecta; la precision reportada es de 0,82 en CPU (Q4_K_M) y 0,80 en GPU bf16, por lo que existe una tasa de error relevante.
- Problema de plantilla de chat: con el template por defecto de Qwen3.5, la letra puede acabar en `reasoning_content` o en `message.thinking` con `content` vacio; en llama-server, sin desactivar thinking, la precision medida cayo a 0,00. Es imprescindible configurar `enable_thinking: false` o leer el campo correcto.
- Requisito de conversion especifico: la conversion a GGUF debe hacerse con `--no-mtp`, o el servidor fallara al cargar los tensores.
- Licencia no declarada: al no especificarse licencia, no se puede confirmar que el uso comercial este permitido. Conviene verificar antes de integrarlo en produccion.
- Idiomas no especificados: no hay informacion sobre el soporte multilingue ni sobre el idioma del dataset de entrenamiento.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Datos de evaluacion limitados: las cifras de Ollama se obtuvieron sobre 40 muestras, por lo que la precision de 0,925 no es directamente comparable con las del split completo.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/GhostScientist/jev-decisions-v2-model-gguf
- Modelo original (safetensors): https://huggingface.co/GhostScientist/jev-decisions-v2-model
- Dataset de entrenamiento: https://huggingface.co/datasets/GhostScientist/jev-decisions-v1
