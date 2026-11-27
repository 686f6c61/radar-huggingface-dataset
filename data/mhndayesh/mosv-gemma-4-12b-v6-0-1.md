# mhndayesh/MoSV-Gemma-4-12B-v6.0.1

## Resumen

MoSV-Gemma-4-12B-v6.0.1 es una variante experimental de google/gemma-4-12B-it publicada por el usuario mhndayesh dentro de la línea de investigación MoSV (Mixture of Steering Vectors). El modelo mantiene congelados los pesos del Gemma base y añade tres pequeños "expertos" de direccionamiento de activaciones (steering vectors) en las capas 12, 24 y 36, cada una con cuatro opciones (none, debugging, story, teaching) y enrutamiento top-1 por token. El objetivo es inducir comportamientos concretos —enseñar a un alumno de primaria, analizar informes de errores y escribir relatos— sin necesidad de instrucciones en el prompt.

La propuesta es relevante porque demuestra una vía de personalización barata sobre un modelo ya entrenado: en lugar de reentrenar o aplicar LoRAs por tarea, se aprende un conjunto de vectores de intervención que un router activa según el token. Se distribuye como un único GGUF Q4_K_M de 7,16 GB que funciona en llama.cpp y LM Studio sin parches, con los expertos ocupando solo 36 MB adicionales sobre la cuantización del modelo base.

El modelo tiene 11.925.137.456 parámetros totales, contexto heredado de Gemma 4 12B (no especificado en la información disponible), licencia Apache 2.0 y soporte exclusivamente en inglés. Es una publicación de investigación (0 descargas, 0 likes en el momento de la ficha) y no un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `gemma4` con MoE por capa en las capas 12, 24 y 36 (4 expertos cada una: none, debugging, story, teaching; top-1) |
| Parametros totales | 11.925.137.456 |
| Parametros activos | No aplica en el sentido clásico de MoE: el modelo base está completamente activo; solo se enrutan los vectores de steering (top-1 de 4 por capa intervenida) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M (único archivo publicado, 7,16 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (igual que Gemma 4) |
| Formato de pesos | GGUF (compatible con llama.cpp y LM Studio) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it congelado en 4 bits. Sobre él se insertan tres módulos MoE ligeros en las capas 12, 24 y 36; cada módulo contiene cuatro expertos (none, debugging, story, teaching) y un router que selecciona uno por token. El experto "none" equivale a no intervenir, de modo que el modelo responde como Gemma estándar. Los expertos son vectores de steering (intervenciones sobre activaciones), no subredes densas, y en total suman 36 MB sobre el GGUF base.

El entrenamiento siguió tres fases descritas por el autor: (1) una compuerta que compara, sobre 60 prompts de desarrollo, las respuestas de Gemma sin instrucciones frente a Gemma con las reglas del comportamiento en el system prompt, y solo entrena los temas donde la instrucción ayuda claramente; (2) generación de datos con Gemma respondiendo 300 prompts por tema bajo las reglas, filtrados por Claude Haiku con comprobaciones sí/no de comportamiento y corrección, conservando 674 de 900 respuestas; (3) entrenamiento supervisado tipo LoRA sobre el prompt plano (sin instrucciones), 117 pasos, base congelada en 4 bits, en una única GPU RX 9070 XT. Un intento previo con RL (juez que ordena respuestas muestreadas) no aportó ganancias en este modelo. La verificación dentro de llama.cpp muestra que los expertos alteran la log-probabilidad del siguiente token en 1,97 (teaching), 1,79 (debugging) y 1,63 (story), frente a 0,13-0,21 en temas no entrenados, con una correlación de 0,89 entre el efecto medido en PyTorch y en llama.cpp.

## Capacidades

- Generación de texto conversacional en inglés sobre la base de Gemma 4 12B-it.
- Comportamiento de enseñanza: al recibir un prompt del tipo "Teach X to a Primary N student", responde directamente al niño, con pasos pequeños y comprobación de comprensión, en lugar de redactar un plan de clase para el docente.
- Comportamiento de depuración: ante informes de errores (sin código), vincula causas a pistas del informe, indica cómo confirmarlas y separa hechos de conjeturas, con menos nombres inventados.
- Comportamiento de relato: abre con un detalle concreto, muestra emociones mediante acciones y evita moralejas finales.
- Enrutamiento automático por token: los temas entrenados se dirigen a su experto; el resto (preguntas cotidianas, matemáticas, código, correo, explicaciones) va a "none" y se comporta como Gemma plano.
- Modo thinking desactivable mediante `chat_template_kwargs: {"enable_thinking": false}` (configuración usada en entrenamiento y evaluación).
- Sin soporte documentado de tool calling, function calling, agentes multi-paso, visión ni audio en la información proporcionada.

## Casos de uso

- Tutorización infantil automatizada: el experto de teaching responde directamente al alumno con pasos cortos y preguntas de comprobación; en la demo del autor, la respuesta pasa de 1.011 a 223 tokens y se dirige al niño, lo que reduce coste y mejora adecuación al nivel.
- Asistente de triaje de informes de errores: el experto de debugging estructura el análisis de un bug report separando hechos de hipótesis y proponiendo pasos de confirmación, útil como primer filtro antes de que un ingeniero lo revise.
- Generación de material didáctico para primaria: dado un concepto y un curso, produce explicaciones adaptadas sin necesidad de system prompt extenso, simplificando la plantilla de prompting en productos educativos.
- Escritura creativa de relatos breves: el experto de story evita aperturas genéricas y moralejas, adecuado para borradores de ficción o ejercicios de escritura en talleres.
- Investigación sobre steering vectors: sirve como caso reproducible para estudiar cómo intervenciones de bajo rango en capas intermedias modifican el comportamiento sin reentrenar el modelo base.
- Despliegue local en estación de trabajo: un único GGUF de 7,16 GB ejecutable en llama.cpp o LM Studio permite probar el modelo en hardware de consumo sin infraestructura adicional.
- Evaluación comparativa de métodos de personalización: útil para contrastar coste y efecto frente a LoRAs o fine-tuning completo en tareas acotadas de estilo y comportamiento.

## Benchmarks y rendimiento

Evaluación del autor sobre un conjunto bloqueado de 300 prompts (antes del entrenamiento), respuestas generadas por el GGUF en llama.cpp con muestreo recomendado de Gemma y juzgadas por Claude Haiku con comprobaciones de comportamiento sí/no y una comprobación de corrección. 43 prompts de test por tema.

| Tema | Comprobaciones superadas, base → MoSV | MoSV mejor en | Corrección, base → MoSV | Tokens de respuesta |
|---|---|---|---|---|
| Teaching | 0,58 → 0,97 | 98% de los prompts | 0,95 → 0,91 | 986 → 325 |
| Debugging | 0,17 → 0,44 | 81% | 0,98 → 0,95 | 828 → 544 |
| Story | 0,73 → 0,81 | 62% | 1,00 → 1,00 | 860 → 711 |
| Explanation (no entrenado) | 0,34 → 0,34 | 50% | 0,70 → 0,81 | 736 → 739 |
| Email (no entrenado) | 0,69 → 0,69 | 49% | 1,00 → 0,98 | 292 → 286 |
| Engineering (no entrenado) | 0,77 → 0,71 | 39% | 0,69 → 0,79 | 785 → 765 |

Verificación interna en llama.cpp (3 prompts de desarrollo por tema más 3 cotidianos, 48 tokens cada uno): cambio en la log-probabilidad del siguiente token de 1,97 (teaching), 1,79 (debugging) y 1,63 (story), con cambio del token top en 22%, 33% y 28% respectivamente; en temas no entrenados el cambio es de 0,13-0,21 y el token top cambia en 0-2%. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB para el GGUF Q4_K_M de 7,16 GB, más overhead de contexto KV. No se dispone de estimaciones para otras cuantizaciones porque no se publican.
- GPU recomendadas: el autor entrenó en una AMD RX 9070 XT; para inferencia, cualquier GPU con al menos 8-10 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100, H100). No hay datos de throughput por GPU en la información disponible.
- Cabe en GPU de consumo: sí, con Q4_K_M en tarjetas de 8 GB o más, y también en CPU mediante llama.cpp (latencia no documentada).
- Opciones de despliegue: llama.cpp (`llama-server -m MoSV-Gemma-4-12B-v6.0.1-Q4_K_M.gguf -ngl 99 -fa on --jinja`) y LM Studio cargando el GGUF. No se documenta soporte para vLLM ni TGI en la información proporcionada.
- Muestreo recomendado: temperature 1.0, top_k 64, top_p 0.95, min_p 0, thinking desactivado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoSV-Gemma-4-12B-v6.0.1 | 11,9 B | No disponible | Gemma 4 12B + steering vectors por capa (MoE top-1) | Apache 2.0 | GGUF en Hugging Face |
| google/gemma-4-12B-it (base) | 11,9 B | No disponible | Transformer denso instruct | Apache 2.0 | Pesos originales en Hugging Face |
| Alternativas de personalización tipo LoRA sobre Gemma 4 12B | 11,9 B + adaptador | No disponible | Fine-tuning de bajo rango por tarea | Según autor | Repos de la comunidad; no se dispone de una referencia concreta en la información proporcionada |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada; la única comparación publicada es contra el propio Gemma 4 12B-it sin instrucciones y contra el mismo modelo con las reglas en el system prompt (techo de referencia).

## Limitaciones y advertencias

- Evaluación realizada por un único juez (Claude Haiku) con comprobaciones de comportamiento concretas, no de preferencia global; los resultados pueden no generalizar a otros evaluadores.
- La corrección en teaching baja ligeramente (0,95 → 0,91): las respuestas son más adecuadas en forma pero algo menos exactas en contenido.
- Los prompts de ingeniería se ven afectados aunque no se entrenaron (0,77 → 0,71 en el test bloqueado), probablemente porque algunos tokens de código se enrutan al experto de debugging. El autor recomienda usar Gemma plano para programación.
- Los informes de depuración del dataset no incluyen código, por lo que el comportamiento es análisis cuidadoso, no corrección verificada de fallos.
- Solo inglés; el test tiene 43 prompts por tema, una muestra pequeña.
- Riesgo de alucinación heredado del modelo base; no se han realizado evaluaciones específicas de sesgo en la información disponible.
- Licencia Apache 2.0, pero al derivar de Gemma 4 conviene revisar los términos de uso de Google aplicables al modelo base.
- Publicación de investigación con 0 descargas y 0 likes: sin validación independiente ni soporte de la comunidad.
- No se documenta soporte de tool calling, agentes, visión ni contexto largo verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhndayesh/MoSV-Gemma-4-12B-v6.0.1
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio del proyecto: https://github.com/mhndayesh/mosv
- Artículo técnico v6.0.1: https://github.com/mhndayesh/mosv/blob/main/paper/paper_v6_0_1.md
- Versiones anteriores: https://huggingface.co/mhndayesh/mosv
- Paper de referencia: Meral et al., *RL Post-Training in Diffusion Transformers Is Activation Steering*, arXiv:2611.26627 (https://arxiv.org/abs/2611.26627)
