# arbora-anon/arbora-gemma-4-31b-it-path-scorer

## Resumen

Arbora Gemma-4-31B-it path scorer es un componente auxiliar de decodificacion especulativa, no un modelo generativo autonomo. Lo publica el colectivo anonimo arbora-anon como parte del codigo del paper "Arbora: Unleashing the Parallelism of Block Diffusion Drafters in Speculative Decoding", actualmente en revision anonima. Se trata del *path scorer* del drafter `RedHatAI/gemma-4-31B-it-speculator.dflash2`, es decir, el modulo que puntua las rutas candidatas dentro del arbol de tokens propuesto por un drafter de difusion por bloques, para que el modelo objetivo (Gemma 4 31B instruct) acepte el mayor numero posible de tokens por paso.

El repositorio pesa 0,3 GB y contiene unicamente el tensor `gemma-4-31b-it-path-scorer.safetensors` con los tres tensores `candidate_selector.*`. No incluye tokenizer, configuracion de inferencia ni pesos del drafter completo: hay que insertarlo en el drafter exportado mediante el script `training/path_scorer/build_scorer_export.py` del repositorio de codigo del paper. Por tanto, no es desplegable por si solo ni sustituye al modelo base.

Su relevancia es acotada pero tecnica: la decodificacion especulativa con drafters de difusion por bloques es una de las lineas activas para acelerar inferencia de LLM grandes, y este checkpoint documenta el resultado del entrenamiento con *tree loss* (learning rate 3e-5, step 900) sobre respuestas del propio modelo objetivo. La informacion publica sobre arquitectura interna, datos de entrenamiento y evaluacion es minima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (path scorer de un drafter de difusion por bloques; pesos en tres tensores `candidate_selector.*`) |
| Parametros totales | no disponible (repo de 0,3 GB; solo se publican los tensores del path scorer, no el drafter completo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar publicados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (avisos de terceros en `NOTICE`) |
| Formato de pesos | safetensors (`gemma-4-31b-it-path-scorer.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un *path scorer*: un modulo que, dado el arbol de candidatos generado por un drafter de difusion por bloques, asigna puntuaciones a cada ruta para seleccionar las secuencias a verificar por el modelo objetivo. El modelo base declarado es `RedHatAI/gemma-4-31B-it-speculator.dflash2`, un especulador asociado a Gemma 4 31B instruct. La model card no detalla la arquitectura interna del scorer (numero de capas, dimensiones, tipo de atencion) ni el mecanismo exacto de puntuacion; solo indica que se compone de tres tensores bajo el prefijo `candidate_selector.*`.

El entrenamiento usa *tree loss* con learning rate 3e-5 y 900 pasos, sobre respuestas generadas por el propio modelo objetivo a partir de una coleccion de prompts que no se libera. El repositorio de codigo del paper describe la receta y los scripts para reconstruir los datos de entrenamiento a partir de cualquier fichero de prompts. No se especifican numero de tokens de entrenamiento, composicion del dataset, ni si hubo etapas de RLHF o DPO (no aplicables, en principio, a un scorer de este tipo).

## Capacidades

- Puntuacion de rutas candidatas en un arbol de decodificacion especulativa, para seleccionar que secuencias verificar con el modelo objetivo.
- Integracion con el drafter `RedHatAI/gemma-4-31B-it-speculator.dflash2` mediante el script de exportacion `training/path_scorer/build_scorer_export.py`.
- Entrenado contra las respuestas del modelo objetivo Gemma 4 31B instruct, lo que alinea la distribucion de candidatos con la del verificador.
- No genera texto de forma autonoma: no es un modelo de chat, codigo, matematicas ni vision.
- No soporta tool calling, function calling ni uso como agente por si mismo.
- Capacidades multilingues: no disponibles (no se documentan).
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Aceleracion de inferencia de Gemma 4 31B instruct en produccion: insertando el scorer en el drafter exportado, el sistema de decodificacion especulativa puede aceptar mas tokens por paso de verificacion, reduciendo la latencia por token generado en servicios de chat o generacion larga.
- Investigacion en decodificacion especulativa: sirve como checkpoint de referencia para reproducir los resultados del paper Arbora y comparar variantes de *tree loss* o de seleccion de rutas.
- Experimentos con drafters de difusion por bloques: permite evaluar como afecta la puntuacion de rutas a la tasa de aceptacion frente a estrategias de seleccion mas simples (top-k por probabilidad, greedy sobre el arbol).
- Ajuste fino del scorer sobre dominios concretos: el repositorio de codigo incluye scripts para reconstruir datos de entrenamiento desde un fichero de prompts propio, de modo que se puede reentrenar el scorer para un dominio especifico (por ejemplo, codigo o texto juridico) y medir el impacto en la aceptacion.
- Despliegue en pipelines de serve de LLM que ya usan vLLM o TGI con soporte de decodificacion especulativa: el scorer se incorpora al drafter y no requiere cambios en la API del modelo objetivo.
- Evaluacion comparativa de tecnicas de aceleracion: al ser un artefacto pequeno y aislado, facilita medir el coste/beneficio de la seleccion de rutas frente a otros esquemas de drafting sin reentrenar el modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de aceptacion, speedup, latencia ni comparaciones numericas con otros drafters o metodos de decodificacion especulativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el scorer de forma aislada; el repo ocupa 0,3 GB, pero el scorer debe combinarse con el drafter completo y con Gemma 4 31B instruct como modelo objetivo.
- GPU recomendadas: no disponibles en la informacion proporcionada. El modelo objetivo (31B) requiere, en la practica, GPUs de clase A100/H100 o multiples consumer de gama alta, pero no se documentan requisitos oficiales.
- Cabe en consumer GPU: no disponible; depende del drafter y del modelo objetivo, no del scorer.
- Opciones de despliegue: integracion en el drafter exportado segun el repositorio de codigo del paper; no se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arbora-gemma-4-31b-it-path-scorer | Path scorer para drafter de decodificacion especulativa | no disponible (repo de 0,3 GB) | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| RedHatAI/gemma-4-31B-it-speculator.dflash2 | Drafter de difusion por bloques (modelo base) | no disponible | no disponible | no disponible en la informacion | Hugging Face (referenciado como base) |
| Otros drafters de decodificacion especulativa (EAGLE, Medusa, etc.) | Drafters de decodificacion especulativa | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el drafter exportado y el modelo objetivo no produce ninguna salida util.
- Solo se publican tres tensores (`candidate_selector.*`); no hay tokenizer, configuracion ni instrucciones de inferencia en el repositorio.
- Los datos de entrenamiento no se liberan; solo se describe la receta para reconstruirlos, lo que limita la reproducibilidad exacta.
- No hay informacion sobre sesgos, tasas de alucinacion ni comportamiento en idiomas distintos del ingles (idiomas no documentados).
- Licencia Apache 2.0 permite uso comercial, pero deben revisarse los avisos de terceros en `NOTICE` y la licencia del modelo base y del drafter original.
- El paper esta en revision anonima; los resultados pueden cambiar y el artefacto no debe tratarse como validado por pares.
- Riesgo de desalineacion si se usa con un modelo objetivo distinto de Gemma 4 31B instruct, ya que el scorer se entreno contra las respuestas de ese modelo concreto.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/arbora-anon/arbora-gemma-4-31b-it-path-scorer
- Modelo base: https://huggingface.co/RedHatAI/gemma-4-31B-it-speculator.dflash2
- Codigo del paper (revision anonima): https://anonymous.4open.science/r/arbora-7ABE
