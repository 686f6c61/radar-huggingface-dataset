# sagar-rasakonda/Qwen3-0.6B

## Resumen

`sagar-rasakonda/Qwen3-0.6B` es una publicacion derivada del modelo base `Qwen/Qwen3-0.6B-Base`, subida por el usuario sagar-rasakonda bajo licencia Apache 2.0. El repositorio se etiqueta como `finetune` del base de Qwen y reutiliza la model card oficial de la familia Qwen3, pero no anade informacion propia sobre el proceso de ajuste, el dataset utilizado ni evaluaciones del resultado. Se trata, por tanto, de un modelo de generacion de texto conversacional de muy baja escala: 751.632.384 parametros segun los pesos en safetensors (la model card declara 0,6B, con 0,44B no pertenecientes a embeddings).

Arquitectonicamente es un transformer causal denso de 28 capas con atencion por consultas agrupadas (GQA) de 16 cabezas para Q y 8 para KV, y una ventana de contexto de 32.768 tokens. Su rasgo diferencial dentro de la familia Qwen3 es el conmutador `enable_thinking`, que permite alternar entre un modo de razonamiento explicito (bloques `...`) y un modo de respuesta directa dentro del mismo conjunto de pesos, algo poco habitual en modelos de esta escala.

La relevancia de esta ficha es fundamentalmente practica: sirve para evaluar si un modelo de menos de mil millones de parametros, con soporte nativo en `transformers`, vLLM, SGLang, llama.cpp, Ollama y MLX-LM, puede cubrir tareas de generacion, clasificacion o prototipado en hardware muy limitado. Conviene ser cauto: el repositorio acumula 0 descargas y 0 "likes", no incluye resultados de benchmarks y su model card es una copia de la del modelo oficial, lo que limita mucho la trazabilidad del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (decoder-only) con GQA; 28 capas; 16 cabezas Q y 8 cabezas KV |
| Parametros totales | 751.632.384 (~0,75B) segun safetensors; la model card declara 0,6B (0,44B no-embedding) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (la model card solo indica soporte de llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers) |
| Idiomas soportados | Mas de 100 idiomas y dialectos, segun la model card (sin evaluacion desglosada) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

Datos adicionales: tamano del repositorio 1,5 GB; pipeline `text-generation`; tags compatibles con `text-generation-inference` y endpoints; modelo base declarado `Qwen/Qwen3-0.6B-Base`; referencia bibliografica `arxiv:2505.09388`.

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only denso. Segun la model card, consta de 28 capas con atencion GQA (16 cabezas de consulta y 8 de clave/valor), lo que reduce el coste de memoria de la cache KV frente a atencion multi-cabeza completa, un detalle relevante en un modelo pensado para contexto de 32.768 tokens. La model card indica dos fases de entrenamiento, preentrenamiento y post-entrenamiento, y atribuye al conjunto de la familia Qwen3 mejoras en razonamiento, seguimiento de instrucciones, capacidades de agente y multilinguesimo. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de alineacion como RLHF o DPO.

La innovacion que la propia model card destaca es el soporte de conmutacion sin coste entre modo de razonamiento (thinking) y modo directo (non-thinking) dentro del mismo modelo, controlado mediante el parametro `enable_thinking` en `tokenizer.apply_chat_template`, con APIs equivalentes en SGLang y vLLM. En modo thinking el modelo emite un bloque delimitado por `...` (token 151668 para el cierre) antes de la respuesta final; la model card recomienda `Temperature=0.6`, `TopP=0.95`, `TopK=20` y `MinP=0` para ese modo, y advierte de repeticiones infinitas en algunos casos, sugiriendo `presence_penalty=1.5`.

Hay que subrayar que esta informacion descriptiva proviene de la model card del modelo oficial de Qwen y no de una memoria tecnica del ajuste realizado por sagar-rasakonda. No se detalla que datos, hiperparametros o metodo se usaron para producir estos pesos a partir de `Qwen/Qwen3-0.6B-Base`, ni si el resultado conserva las capacidades descritas.

## Capacidades

- Generacion de texto y dialogo conversacional multi-turno, con plantilla de chat aplicada mediante `apply_chat_template`.
- Razonamiento explicito en modo thinking (matematicas, logica, codigo) y respuesta directa en modo non-thinking, conmutables en el mismo modelo.
- Generacion de codigo y resolucion de problemas matematicos, segun las capacidades declaradas para la familia Qwen3 (no verificadas en este repositorio concreto).
- Soporte de tool calling / function calling e integracion con herramientas externas en tareas de tipo agente, tanto en modo thinking como non-thinking, segun la model card.
- Seguimiento de instrucciones y alineacion con preferencias humanas orientada a escritura creativa, role-playing y dialogos multi-turno.
- Capacidad multilingue declarada de mas de 100 idiomas y dialectos, incluyendo instrucciones y traduccion.
- Despliegue como endpoint compatible con OpenAI mediante vLLM o SGLang, con parsers de razonamiento (`qwen3` en SGLang, `deepseek_r1` en vLLM).
- No se declaran capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Prototipado rapido en portatil: con cuantizacion de 4 bits el modelo ocupa del orden de medio giga, por lo que permite iterar sobre prompts y plantillas de chat en un equipo sin GPU dedicada antes de escalar a un modelo mayor.
- Clasificacion y etiquetado de texto a gran escala: al ser un modelo de 0,75B, el coste por token es minimo y puede procesar volumenes altos de documentos para tareas de categorizacion, extraccion de entidades simples o filtrado previo.
- Enrutador o clasificador dentro de una arquitectura multi-modelo: dado su tamano, encaja como primer nivel que decide si una consulta se resuelve localmente o se delega a un modelo mayor, reduciendo coste de inferencia.
- Generacion de codigo asistida en entornos con recursos limitados: puede completar fragmentos, escribir tests sencillos o generar documentacion dentro de un IDE o un pipeline de CI/CD local, con la advertencia de que no hay evaluacion publicada de su calidad real.
- Atencion al cliente automatizada de bajo coste: soporta conversaciones multi-turno con una ventana de 32.768 tokens y plantilla de chat, suficiente para hilos largos con historial e instrucciones de sistema, siempre que se acepte su techo de conocimiento.
- Agentes sencillos con tool calling: la model card atribuye a Qwen3 integracion precisa con herramientas externas, de modo que puede usarse para cadenas de pasos cortas (consultar una API, resumir el resultado) desplegado con vLLM o SGLang.
- Traduccion y normalizacion de texto multilingue: con el soporte declarado de mas de 100 idiomas, sirve para traducir o reformatear contenido en lotes donde no se requiere calidad de nivel humano.
- Educacion y experimentacion academica: por su licencia Apache 2.0 y su tamano, es util para ensenar tecnicas de cuantizacion, decodificacion y evaluacion, o para reproducir experimentos de ajuste sobre un base de Qwen3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio remite al blog, al repositorio GitHub y a la documentacion de Qwen para consultar evaluaciones, requisitos de hardware y rendimiento de inferencia, pero no incluye cifras propias ni tablas comparativas, y tampoco hay evaluacion alguna del ajuste realizado por sagar-rasakonda. La referencia `arxiv:2505.09388` corresponde al informe tecnico de la familia Qwen3, no a este repositorio concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16/FP16 los 751,6 millones de parametros ocupan aproximadamente 1,5 GB de pesos, mas cache KV y overhead, lo que situa el consumo practico en torno a 2 GB; en cuantizacion de 8 bits baja a aproximadamente 0,8-1 GB y en 4 bits a unos 0,5-0,7 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM, como GTX 1650, RTX 3050, RTX 3060, RTX 4060 o superiores. Para servicio con batching concurrente y contexto completo de 32.768 tokens, se recomienda RTX 4090, L40S, A100 o H100, donde el modelo queda muy sobredimensionado en memoria y el cuello de botella pasa a ser el throughput de tokens.
- Compatibilidad con GPU consumer: si, es uno de los puntos fuertes del modelo. Cabe holgadamente en cualquier GPU consumer moderna e incluso puede ejecutarse en CPU con llama.cpp u Ollama.
- Opciones de despliegue: `transformers` (se requiere version igual o superior a 4.51.0 para evitar el error `KeyError: 'qwen3'`), vLLM (>= 0.8.5) con `--enable-reasoning --reasoning-parser deepseek_r1`, SGLang (>= 0.4.6.post1) con `--reasoning-parser qwen3`, text-generation-inference (etiqueta presente en el repositorio), llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card no aporta mediciones de tokens por segundo ni latencia por peticion.

## Comparativa con modelos similares

Los datos de la siguiente tabla proceden de las especificaciones publicas de cada familia y no de la informacion proporcionada en este repositorio, por lo que deben verificarse antes de usarlos en una decision de produccion. No hay datos de rendimiento comparado disponibles para el modelo de esta ficha.

| Modelo | Parametros | Contexto | Modo de razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sagar-rasakonda/Qwen3-0.6B (esta ficha) | ~0,75B segun safetensors | 32.768 tokens | Si, conmutador `enable_thinking` | Apache 2.0 | Repositorio con 0 descargas y 0 likes, sin evaluacion |
| Qwen/Qwen3-0.6B (oficial) | 0,6B (0,44B no-embedding) | 32.768 tokens | Si, conmutador `enable_thinking` | Apache 2.0 | Repositorio oficial, ampliamente integrado en el ecosistema |
| Qwen/Qwen2.5-0.5B-Instruct | ~0,49B | 32.768 tokens | No | Apache 2.0 | Repositorio oficial, generacion anterior |
| Llama-3.2-1B-Instruct | ~1,23B | 128.000 tokens | No | Licencia comunitaria de Llama 3.2 | Repositorio oficial de Meta, con licencia no Apache |

Diferencias clave: frente al Qwen3-0.6B oficial, esta copia anade una capa de ajuste sin documentar y pierde la trazabilidad del original; frente a Qwen2.5-0.5B-Instruct, aporta el modo de razonamiento conmutable; frente a Llama-3.2-1B-Instruct, ofrece licencia Apache 2.0 y menor tamano, a cambio de una ventana de contexto notablemente inferior.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el repositorio no publica benchmarks ni resultados de validacion, por lo que se desconoce si el ajuste degrada, mantiene o mejora las capacidades del base `Qwen/Qwen3-0.6B-Base`.
- Model card no original: el README es una copia de la model card del Qwen3-0.6B oficial e incluye ejemplos que apuntan a `Qwen/Qwen3-0.6B`, no a este repositorio. Toda afirmacion sobre capacidades debe considerarse no verificada para estos pesos.
- Procedencia del ajuste desconocida: no se indica dataset, numero de pasos, hiperparametros ni metodo de alineacion, lo que impide auditar sesgos introducidos.
- Riesgo de alucinacion elevado: con menos de mil millones de parametros, la generacion factual poco fiable es esperable, especialmente en preguntas abiertas, datos actuales y dominios especializados.
- Repeticiones sin fin: la propia model card advierte de este problema y recomienda `presence_penalty=1.5` y parametros de muestreo concretos; conviene aplicar topes de `max_new_tokens` y deteccion de bucles.
- Idioma sin evaluar: aunque se declaran mas de 100 idiomas y dialectos, no hay medicion desglosada por idioma; la calidad fuera de ingles y chino puede ser muy inferior a la esperada.
- Contexto largo con rendimiento decreciente: los 32.768 tokens son el limite nominal, no una garantia de recuperacion fiable de informacion al final de la ventana en un modelo de esta escala.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, pero es responsabilidad del usuario verificar la procedencia del ajuste y el cumplimiento de las condiciones de Qwen para el modelo base.
- Baja senal de calidad comunitaria: 0 descargas y 0 "likes" en el momento de la consulta. Para produccion es mas prudente partir del repositorio oficial de Qwen3-0.6B o de un ajuste con evaluacion publicada.
- Fecha de creacion y actualizacion identicas (2026-09-28), sin historial de revisiones ni versionado posterior.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/sagar-rasakonda/Qwen3-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Modelo oficial de referencia: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Documentacion de modos thinking/non-thinking en SGLang: https://qwen.readthedocs.io/en/latest/deployment/sglang.html#thinking-non-thinking-modes
- Documentacion de modos thinking/non-thinking en vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html#thinking-non-thinking-modes
- Informe tecnico de Qwen3 (referencia presente en los tags): https://arxiv.org/abs/2505.09388
- Chat de Qwen: https://chat.qwen.ai/
