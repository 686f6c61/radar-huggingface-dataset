# davidheineman/opd-teacher-Q2.5I-CampsitePuzzle-step149

## Resumen

`opd-teacher-Q2.5I-CampsitePuzzle-step149` es un ajuste fino de Qwen2.5-1.5B-Instruct desarrollado por davidheineman como modelo profesor (teacher) dentro de un experimento de destilacion on-policy (OPD). El modelo se ha entrenado con RLVE sobre el entorno `CampsitePuzzle` a dificultad 0, con 150 actualizaciones de GRPO; el indice `step149` corresponde al checkpoint final en base cero, es decir, la actualizacion numero 150. No es un modelo de proposito general: su funcion es generar trayectorias especializadas en una tarea concreta para supervisar a un modelo estudiante.

Forma parte de una coleccion de profesores entrenados sobre 32 de los 400 entornos disponibles en RLVE, un marco de entrenamiento por refuerzo con verificacion. El checkpoint se distribuye en safetensors, con los nombres y las formas de los tensores validados contra el modelo base, y conserva la licencia Apache 2.0 original de Qwen.

Su relevancia es metodologica antes que de producto: permite reproducir y auditar un pipeline de destilacion on-policy con senales densas por token, un area con investigacion reciente activa. Con 1.543.714.304 parametros (aproximadamente 1,54 mil millones) y un repositorio de 3,1 GB, es un modelo pequeno que cabe en GPUs de consumo, lo que facilita experimentar con el ciclo completo profesor-estudiante en una sola maquina.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (tag `qwen2`); detalles internos no especificados en la informacion disponible |
| Parametros totales | 1.543.714.304 (aproximadamente 1,54 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no se especifica en la model card) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors (3,1 GB, coherente con bf16/fp16); no se han publicado variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `transformers`) |

Otros datos: pipeline `text-generation`, tags `rlve`, `grpo`, `opd-teacher`, `conversational`, `text-generation-inference`, `endpoints_compatible`; modelo base `Qwen/Qwen2.5-1.5B-Instruct`; fecha de creacion 2026-09-28; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2 con 1,54 B de parametros densos. El checkpoint no modifica la topologia, solo los pesos: segun la model card, la conversion desde el checkpoint nativo final a safetensors de Hugging Face se valido contra los nombres y las formas de los tensores del modelo base, lo que implica una correspondencia estructural exacta.

El entrenamiento es un ajuste con RLVE (reinforcement learning with verifiable environments) sobre el entorno `CampsitePuzzle` a dificultad 0, usando GRPO durante 150 actualizaciones. La model card indica que el modelo esta pensado para el experimento de destilacion on-policy de 32 entornos, dentro de una coleccion que cubre 32 de los 400 entornos de RLVE. El run de entrenamiento esta registrado en Weights & Biases (id `c636cac0`, grupo de barrido `opd-teachers-20260927-191939`) y el codigo esta en `davidheineman/rlve`. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional, heredada de Qwen2.5-1.5B-Instruct (tag `conversational`).
- Resolucion del entorno `CampsitePuzzle` a dificultad 0, la tarea concreta para la que se entreno como profesor.
- Generacion de razonamiento paso a paso orientado a tareas verificables, como consecuencia del entrenamiento con GRPO y recompensas verificables.
- Servido como modelo teacher en destilacion on-policy: aporta senales de supervision densas por token al estudiante.
- Compatibilidad con Hugging Face Text Generation Inference y con endpoints (`endpoints_compatible`).
- Capacidades multilingues: solo se declara ingles; no se garantiza un comportamiento equivalente al modelo base en otros idiomas.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, uso de agentes, vision ni audio.

## Casos de uso

- Destilacion on-policy de un estudiante: usar este checkpoint como profesor que puntua o supervisa las trayectorias del estudiante en `CampsitePuzzle`, aprovechando que fue entrenado especificamente en ese entorno y a esa dificultad.
- Reproduccion de experimentos de RL con recompensas verificables: el run de W&B y el repositorio de codigo permiten replicar el entrenamiento de 150 actualizaciones con GRPO y comparar curvas de recompensa.
- Investigacion sobre dinamicas de destilacion: al disponer de un profesor especializado y acotado, sirve para estudiar como se transfieren los patrones de razonamiento entre profesor y estudiante en tareas de dificultad controlada.
- Ablaciones de dificultad y de entorno: la coleccion incluye profesores de otros entornos y niveles; este checkpoint actua como punto de referencia en dificultad 0 para medir el efecto del desajuste de distribucion.
- Generacion de datos sinteticos etiquetados: producir trayectorias de resolucion del puzzle para ampliar un corpus de entrenamiento, dado que las respuestas son verificables por el propio entorno.
- Evaluacion de tecnicas de post-entrenamiento a bajo coste: con 1,54 B de parametros, el ciclo completo de inferencia y evaluacion cabe en una GPU de consumo, lo que permite iterar rapido en metodos de RL y destilacion.
- Pruebas de integracion de infraestructura: validar pipelines de despliegue TGI o vLLM y la conversion nativo a safetensors en un modelo pequeno antes de escalar a tamanos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion para este checkpoint, y los resultados de los articulos encontrados en la busqueda web corresponden a otros modelos y otros marcos experimentales (por ejemplo, Lightning-OPD reporta 69,9 % en AIME 2024 a escala 8B), por lo que no son atribuibles a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir de 1,54 B de parametros; el repositorio pesa 3,1 GB):
  - bf16/fp16: aproximadamente 3,1 GB de pesos mas overhead de activaciones y cache KV; en la practica, en torno a 4-6 GB.
  - int8: aproximadamente 1,6 GB de pesos.
  - int4: aproximadamente 0,8 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10G). Para cuantizacion int4 bastan GPUs de 4 GB.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas de gama media y alta con 8 GB o mas en bf16, y en tarjetas de 4-6 GB con cuantizacion.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (tag `text-generation-inference`), vLLM y endpoints compatibles. Para llama.cpp u Ollama seria necesario convertir previamente los pesos, ya que no se publican ficheros GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento especifico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd-teacher-Q2.5I-CampsitePuzzle-step149 | 1,54 B (denso) | No disponible | RLVE + GRPO, entorno `CampsitePuzzle`, 150 actualizaciones | Apache 2.0 | Safetensors en Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | Aproximadamente 1,5 B (denso) | No disponible en la informacion proporcionada | Ajuste por instrucciones de proposito general | Apache 2.0 | Safetensors en Hugging Face |
| Otros checkpoints de la coleccion RLVE OPD Teachers | 1,5 B (misma base) | No disponible | RLVE + GRPO sobre otros entornos o dificultades | Apache 2.0 | Safetensors en Hugging Face |

La comparacion con alternativas de la misma categoria (destilacion on-policy para modelos de flujo o marcos como Lightning-OPD) no es directa: esos trabajos emplean modelos de mayor tamano y otros entornos, y no se dispone de resultados comparables de este checkpoint.

## Limitaciones y advertencias

- Modelo altamente especializado: es un profesor de un unico entorno (`CampsitePuzzle`) a dificultad 0. Fuera de esa tarea, su comportamiento no esta validado y puede degradarse respecto al modelo base.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasas de error; al ser un ajuste con RL sobre una tarea acotada, no hay garantias de generalizacion.
- Sesgos conocidos: no disponibles. No se documenta ningun analisis de sesgos ni de seguridad.
- Idioma: solo se declara ingles. El uso en castellano no esta soportado ni evaluado.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas sin verificar el modelo base.
- Licencia: Apache 2.0, permite uso comercial, pero la model card indica que se incluye la licencia original de Qwen en el fichero `LICENSE`; conviene revisar ambos textos antes de un uso en produccion.
- Madurez: 0 descargas y 0 likes, creado y actualizado el mismo dia. Es un artefacto de investigacion, sin senales de uso en produccion ni mantenimiento posterior.
- Sin cuantizaciones publicadas: desplegarlo en entornos con llama.cpp u Ollama requiere conversion y validacion propias.
- Trazabilidad: el checkpoint se valido contra el modelo base en nombres y formas de tensores, pero no se documentan evaluaciones funcionales posteriores a la conversion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-CampsitePuzzle-step149
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Run de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/c636cac0
- Codigo de entrenamiento (RLVE): https://github.com/davidheineman/rlve
- Articulo de RLVE: https://arxiv.org/abs/2511.07317
- Articulo sobre destilacion on-policy sin profesor (Self-OPD): https://arxiv.org/abs/2608.26872
- Articulo sobre dinamicas de la destilacion on-policy: https://arxiv.org/abs/2604.13016
- Framework Lightning-OPD: https://github.com/jet-ai-projects/Lightning-OPD
- Repositorio de referencia con modelo teacher: https://github.com/ilovecplusplus230/-OPD/tree/main/teacher_model
