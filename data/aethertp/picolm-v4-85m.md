# aethertp/PicoLM-V4-85M

## Resumen

PicoLM-V4-85M es un modelo de lenguaje base de 84.960.832 parámetros entrenado desde cero por el desarrollador independiente aethertp. Es la cuarta iteración de la serie PicoLM y está diseñado explícitamente como objeto de investigación sobre modelos de lenguaje de muy pequeño tamaño, como punto de partida para ajuste fino y para experimentos que requieran ejecución en CPU. No ha recibido ajuste por instrucciones: es un modelo de continuación de texto, no un asistente.

Arquitectónicamente es un transformer causal decoder-only con 20 capas, tamaño oculto de 576, atención con 9 cabezas de consulta y 3 de clave/valor (GQA), feed-forward SwiGLU de dimensión intermedia 1536, normalización RMSNorm (incluida sobre queries y keys) y embeddings de posiciones rotatorias RoPE con base 10.000. La longitud de contexto es de 2048 tokens y el vocabulario BPE de 24.576 tokens se hereda de PicoLM-V3.

Su relevancia es doble: por un lado, publica de forma transparente la receta de entrenamiento completa (6.000 millones de tokens en dos fases, con mezcla de FineWeb-Edu, DCLM-Baseline, Cosmopedia v2, Python-Edu, FineMath y Wikipedia) y los resultados medidos con un único protocolo de evaluación; por otro, los pesos se almacenan en el formato Qwen3 de `transformers` (`Qwen3ForCausalLM`), lo que permite cargarlo con `AutoModelForCausalLM` sin `trust_remote_code`. La model card documenta explícitamente las limitaciones del modelo, incluida la repetición en generaciones largas y la deriva factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (formato `Qwen3ForCausalLM` en `transformers`) |
| Parametros totales | 84.960.832 (embeddings de entrada y salida atados, contados una vez) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (la model card solo documenta ejecucion en fp32) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

Detalles arquitectonicos adicionales: 20 capas, hidden size 576, 9 cabezas de query y 3 de clave/valor con dimension de cabeza 64, SwiGLU con tamano intermedio 1536, RMSNorm con epsilon 1e-5 mas RMSNorm sobre queries y keys, RoPE con base 10.000, vocabulario de 24.576 tokens e inicializacion normal con desviacion estandar 0,02.

## Arquitectura y entrenamiento

El modelo es un transformer denso de tipo decoder-only. El tokenizador es el BPE de 24.576 tokens de PicoLM-V3, no reentrenado; el token 0 es `<|endoftext|>` y separa documentos durante el entrenamiento, el token 2 es `<|im_end|>` (reservado para un futuro ajuste conversacional) y el token 3 es `<|pad|>`. El tokenizador no anade token de inicio de secuencia, aunque se puede anteponer `tok.bos_token` porque cada documento de entrenamiento empieza tras un separador `<|endoftext|>`.

El entrenamiento consta de dos fases. La fase 1 consume el 80% de los pasos del optimizador (36.620 pasos, longitud de secuencia 1024) sobre un pool de 6.000.007.358 tokens: FineWeb-Edu deduplicado (45%), DCLM-Baseline (25%), Cosmopedia v2 (15%), Python-Edu (5%), FineMath-3+ (5%) y Wikipedia en ingles de 2023-11-01 (5%). La fase 2 usa los 9.156 pasos restantes con longitud de secuencia 2048 y una mezcla con mayor peso de texto filtrado de alta calidad, que incluye el decaimiento de la tasa de aprendizaje: FineWeb-Edu con puntuacion educativa 4 o superior (45%), Cosmopedia v2 (20%), DCLM-Baseline (15%), FineMath-4+ (10%), Python-Edu sin archivos con comentarios en otros idiomas (5%) y Wikipedia (5%), sobre un pool de 1.200.004.547 tokens.

Los documentos se tokenizaron por separado, se unieron con `<|endoftext|>` y se escribieron en ficheros de tokens. Durante el entrenamiento se cortaron ventanas de 1024 o 2048 tokens en posiciones aleatorias, con los ficheros elegidos en proporcion a su tamano. Las ventanas pueden cruzar fronteras entre documentos y la atencion no se enmascara en esas fronteras. La model card advierte de que la mezcla no se ajusto mediante ablaciones a esta escala y de que parte del corpus se vio mas de una vez: en la fase 1 se muestrearon 4.800 millones de posiciones de un pool de 6.000 millones, de modo que, bajo un modelo de ventanas aleatorias, aproximadamente el 45% del pool no se muestreo nunca, el 36% una vez y el 19% dos o mas veces.

## Capacidades

- Generacion de texto por continuacion: el modelo completa texto de forma fluida a nivel local, sin seguir instrucciones de manera fiable.
- Modelado de lenguaje base: util como banco de pruebas para tecnicas de entrenamiento, tokenizacion e inicializacion a escala reducida.
- Generacion de codigo Python: el corpus incluye Python-Edu en ambas fases (5% del total en cada una), por lo que el modelo ha visto codigo, aunque su tamano limita la calidad.
- Razonamiento matematico basico: FineMath-3+ y FineMath-4+ representan el 5% y el 10% de las mezclas de fase 1 y fase 2 respectivamente.
- Conocimiento enciclopedico limitado: Wikipedia en ingles aporta el 5% de cada fase.
- Soporte de tool calling / function calling: no disponible; el modelo no ha sido ajustado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles; el corpus es exclusivamente en ingles.
- Capacidades especiales (thinking mode, vision, audio): ninguna.
- Ejecucion en CPU: disenado explicitamente para experimentos que requieran un modelo lo bastante pequeno para correr en CPU.

## Casos de uso

- Investigacion sobre modelos de lenguaje pequenos: el modelo sirve como sujeto de experimentos controlados sobre mezclas de datos, tasas de aprendizaje o inicializacion, con un coste de computo que permite iterar rapido y con una receta de entrenamiento publicada de forma completa.
- Punto de partida para ajuste fino: al cargarse como `Qwen3ForCausalLM` sin `trust_remote_code`, se puede ajustar con el ecosistema estandar de `transformers` (por ejemplo, `Trainer` o `SFTTrainer`) para tareas concretas de dominio en ingles, con un presupuesto de GPU muy reducido.
- Experimentos en CPU y entornos sin GPU: con 85M de parametros en fp32 el modelo ocupa aproximadamente 340 MB, por lo que cabe en cualquier maquina y permite probar pipelines de inferencia, tokenizacion y evaluacion sin acelerador.
- Pruebas de infraestructura de despliegue: util para validar integraciones con `text-generation-inference` (la model card incluye la etiqueta correspondiente) o endpoints compatibles antes de pasar a modelos mayores.
- Educacion y docencia: sirve para ilustrar de forma tangible los fallos tipicos de un modelo de lenguaje de escala reducida (repeticion, deriva factual) con ejemplos reproducibles incluidos en la propia model card.
- Generacion de texto creativo sin requisitos de veracidad: continuacion de prosa o verso donde la fluidez local importa mas que la exactitud, aceptando la repeticion en generaciones largas.
- Base para estudios de destilacion o comparacion de tokenizadores: al compartir tokenizador con PicoLM-V3 pero no arquitectura, permite aislar el efecto del vocabulario frente al del diseno del modelo.

## Benchmarks y rendimiento

La model card reporta resultados medidos con un unico protocolo de evaluacion, en fp32 sobre CPU, con dos formas de prompting (sin y con `tok.bos_token` antepuesto). Los valores concretos de la tabla de evaluacion no se incluyen en la informacion proporcionada, salvo los siguientes datos explicitos:

| Metrica | Valor reportado |
|---|---|
| Perplejidad LAMBADA (sin BOS) | 48,4 |
| Perplejidad LAMBADA (con BOS) | 45,2 |
| SciQ `acc_norm` (diferencia con BOS, segun `eval_results.json`) | +2,9 puntos |
| Tokens de entrenamiento | 6.000 millones (fase 1: 36.620 pasos a longitud 1024; fase 2: 9.156 pasos a longitud 2048) |

La model card indica que anteponer el token BOS cambia la mayoria de puntuaciones en aproximadamente un error estandar o menos. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras suites estandar, ni comparaciones numericas con modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 340 MB para los pesos (84,96M parametros x 4 bytes), mas el estado de activaciones y cache KV, que con contexto de 2048 y GQA (3 cabezas KV de dimension 64 en 20 capas) es del orden de decenas de MB.
- VRAM estimada en otras precisiones: no disponible; la model card solo documenta ejecucion en fp32.
- GPU recomendadas: cualquier GPU consumer moderna es sobradamente suficiente; el modelo esta pensado para CPU. Una RTX 4090, A100 o H100 lo ejecutarian con una fraccion minima de su capacidad.
- Cabe en GPU consumer: si, en cualquier GPU consumer con al menos 1 GB de memoria libre, y tambien en CPU.
- Opciones de despliegue: `transformers` (probado en las versiones 4.57.1 y 5.22.1), `text-generation-inference` (etiqueta presente en el repositorio) y endpoints compatibles. No se documentan recetas para llama.cpp, Ollama ni TGI con cuantizacion en la informacion disponible.
- Latencia y throughput: no disponibles de forma medida; el modelo es lo bastante pequeno para que la inferencia en CPU sea interactiva con prompts cortos y `max_new_tokens` moderado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| PicoLM-V4-85M | 84,96M | 2048 | Ingles | Apache 2.0 | Formato Qwen3, entrenado desde cero, sin ajuste por instrucciones |
| PicoLM-V3 | 82,2M | No disponible | Ingles | No disponible en la informacion | Arquitectura distinta (21 bloques aplicados dos veces, embedding factorizado de rango 128), ~757M tokens de entrenamiento, mismo tokenizador |
| Alternativas de tamano similar | No disponible | No disponible | No disponible | No disponible | No se proporcionan datos de otros modelos comparables en la informacion disponible |

La comparacion mas directa disponible es con su predecesor PicoLM-V3, que comparte tokenizador pero no arquitectura y fue entrenado con un orden de magnitud menos de tokens (757M frente a 6.000M). No se dispone de datos de benchmarks de V3 en la informacion proporcionada para comparar rendimiento.

## Limitaciones y advertencias

- No sigue instrucciones de forma fiable: es un modelo base de continuacion de texto, no un asistente. No es adecuado para respuesta a preguntas, resumen ni ningun escenario donde importe la exactitud factual.
- Alucinacion y deriva factual: la propia model card muestra un ejemplo donde el modelo afirma que "la capital de Francia es Paris, la capital del Reino Unido", encadenando errores.
- Repeticion en generaciones largas: el ejemplo de la model card muestra bucles de texto; se recomienda `repetition_penalty` (1,1 en el ejemplo oficial) y generaciones cortas.
- Solo ingles: el corpus de entrenamiento es exclusivamente en ingles y el modelo no tiene capacidades multilingues.
- Contexto limitado a 2048 tokens, con atencion no enmascarada en las fronteras entre documentos durante el entrenamiento, lo que puede producir comportamiento anomalo al cruzar limites logicos en inferencia.
- Mezcla de datos no ablacionada: las proporciones provienen de recetas publicadas para modelos pequenos y no se validaron con ablaciones a esta escala; parte del corpus se repitio (aproximadamente el 19% del pool de fase 1 se muestreo dos o mas veces), lo que puede inducir sobreajuste a esos fragmentos.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero las limitaciones tecnicas hacen desaconsejable su uso en produccion para tareas que requieran precision.
- Modelo sin cuantizaciones publicadas: no hay GGUF ni otras variantes cuantizadas en la informacion disponible, lo que limita su uso directo en herramientas como llama.cpp u Ollama sin conversion previa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aethertp/PicoLM-V4-85M
- Dataset FineWeb-Edu / SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset DCLM-Baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset Wikipedia (English, 2023-11-01): https://huggingface.co/datasets/wikimedia/wikipedia
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
