# baseten/figlet-font-sgd-qwen38_27b-expert

## Resumen

Este modelo es un experto especializado en refuerzo desarrollado por Baseten a partir de [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B). Su única finalidad es transcribir texto renderizado con fuentes FIGlet (arte ASCII generado a partir de texto), una tarea cognitiva de razonamiento espacial que resulta notablemente difícil para los modelos de lenguaje en estado base. El entrenamiento se realizó mediante GRPO (Group Relative Policy Optimization) con optimizador SGD a peso completo (full-finetune), durante 200 actualizaciones del optimizador.

El modelo es relevante como ejemplo documentado de especialización extrema: el modelo base obtiene una recompensa binaria media del 1,75 % en la tarea, mientras que el checkpoint final alcanza el 41,75 %, una mejora de 40 puntos porcentuales medida sobre 400 completaciones de validación retenidas. El entorno de entrenamiento procede de Reasoning Gym (tarea Figlet Font), con banco de tareas, prompt, semillas, parser y recompensa binaria congelados. No se trata de un modelo de uso general: es un checkpoint de investigación que demuestra una canalización de RL reproducible, y su utilidad principal es evaluar optimizadores (se publica junto a un experto equivalente entrenado con Adam) y estudiar la transferencia de capacidades tras RL de tarea única.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de condicional de texto (derivado de Qwen3.8-27B), con thinking mode habilitado |
| Parametros totales | 26.895.998.464 (≈26,9 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 32.768 tokens (máximo generado por rollout: 16.384 tokens) |
| Tipos de cuantizacion | no disponible (publicado en BF16; sin variantes cuantizadas oficiales) |
| Idiomas soportados | inglés (tarea y entrenamiento en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 53,8 GB) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura y la configuración de generación condicional de Qwen3.8-27B; el checkpoint contiene únicamente los tensores de lenguaje entrenados. El entrenamiento fue un full-finetune por refuerzo: GRPO con SGD, tasa de aprendizaje constante de 0,05, sin momentum ni weight decay, clipping de norma de gradiente a 0,5, épsilon de política de 0,2 (superior 0,28) y coeficientes KL y de entropía a cero. Cada actualización consumía 8 preguntas × 16 completaciones = 128 respuestas, con un total de 25.600 completaciones de entrenamiento consumidas a lo largo de 200 actualizaciones. La precisión fue BF16 tanto en entrenamiento como en muestreo.

El entorno de entrenamiento deriva de la tarea Figlet Font de Reasoning Gym, con un banco de 400 casos de entrenamiento y 50 casos de validación retenidos independientes, recompensa binaria sobre respuesta completada y evaluaciones programadas cada 10 actualizaciones. El run se reanudó desde el estado completo de iteración 99 de un padre SGD (restaurando modelo, estado del optimizador SGD con maestros FP32, scheduler, RNG y cursor de datos asíncrono), añadiendo 100 actualizaciones más. El snapshot final de inferencia es `step_199`; el estado completo reanudable de la iteración 199 permanece archivado en la plataforma, no en este repositorio. Durante el muestreo se usó temperatura 1,0, top-p 0,95 y top-k 20, con thinking activado (`reasoning_effort="medium"`).

## Capacidades

- Transcripción de texto renderizado con fuentes FIGlet: la capacidad para la que fue entrenado específicamente, pasando del 1,75 % al 41,75 % de recompensa binaria media en la tarea.
- Razonamiento con thinking mode habilitado (`reasoning_effort="medium"`), heredado del contrato de generación del entrenamiento.
- Generación de texto conversacional general: heredada del modelo base Qwen3.8-27B, pero no evaluada tras el RL, por lo que la retención de capacidades generales no está establecida.
- Tool calling, agentes, capacidades multilingües más allá del inglés, visión y audio: no disponible (visión y vídeo no fueron entrenados ni evaluados; el modelo debe cargarse con la opción `language_model_only: true` en SGLang).

## Casos de uso

- Investigación en RL para LLM: reproducir o extender la canalización GRPO+SGD de Baseten sobre tareas de Reasoning Gym, usando este checkpoint como punto de partida o como referencia de convergencia.
- Comparación de optimizadores en RL: junto al experto con Adam del mismo autor, permite estudiar SGD frente a Adam bajo igual número de actualizaciones (con los matices de K=8 frente a K=16 que documentan los autores).
- Benchmarking de razonamiento cognitivo-espacial: evaluar cómo otros modelos de tamaño similar abordan la transcripción FIGlet frente a este experto.
- Prueba de estrés de contextos largos estructurados: las tareas FIGlet requieren leer arte ASCII denso dentro de una ventana de 32.768 tokens, útil para probar pipelines de parsing.
- Pipeline de evaluación con recompensa binaria: el entorno congelado (parser, semillas, recompensa) sirve como test de regresión para infraestructuras de RL distribuido y consumo asíncrono ordenado.
- Estudio de catastrophic forgetting: analizar si 200 actualizaciones de RL de tarea única degradan capacidades generales del modelo base, un eje que los autores declaran explícitamente no establecido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única evaluación publicada es la recompensa binaria media sobre el entorno FIGlet Font congelado (50 tareas retenidas × 8 completaciones fijas = 400 completaciones puntuadas, sin completaciones no puntuadas, truncamientos incluidos en el denominador):

| Checkpoint | Recompensa binaria media | Completaciones puntuadas | Truncamientos |
|---|---:|---:|---:|
| Modelo base fijado (antes del RL) | 1,75 % | 400 | 17/400 (4,25 %) |
| Padre SGD, actualización 100 | 12,50 % | 400 | 105/400 (26,25 %) |
| Experto SGD final, actualización 200 | 41,75 % | 400 | 33/400 (8,25 %) |

Mejora final: +40,00 puntos porcentuales sobre la línea base propia y +29,25 sobre el padre de la actualización 100. Los autores subrayan que no es una puntuación oficial de benchmark upstream ni implica transferencia entre entornos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan unos 53,8 GB, por lo que se necesita al menos una GPU con 80 GB de HBM (A100/H100 80 GB) o dos GPUs de 48 GB con tensor parallelism. Con cuantización no oficial (por ejemplo, a 4 bits) podría caber en torno a 16-20 GB, pero no hay variantes cuantizadas publicadas ni evaluadas.
- GPU recomendadas: NVIDIA A100 u H100 de 80 GB para inferencia en BF16; para el entrenamiento original (full-finetune con maestros FP32 del optimizador), hardware de centro de datos multi-GPU, no especificado en la model card.
- GPUs de consumo: no cabe en una única GPU de consumo (RTX 4090/5090 con 24-32 GB) en BF16; solo con cuantización de terceros, no soportada oficialmente.
- Opciones de despliegue: el runtime de referencia es SGLang con la sobrecarga `--json-model-override-args '{"language_model_only":true}'`. El repositorio es compatible con transformers y endpoints (etiqueta `endpoints_compatible`); no se menciona soporte verificado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. Para reproducibilidad, los autores recomiendan usar el tokenizer y chat template suministrados con temperatura 1,0, top-p 0,95, top-k 20, thinking en modo medium y un máximo de 16.384 tokens generados.

## Comparativa con modelos similares

La comparación más directa es con el experto equivalente entrenado con Adam por el mismo autor, además del modelo base:

| Modelo | Parametros | Optimizador / RL | Completaciones de entrenamiento | Recompensa final (tarea FIGlet) | Licencia |
|---|---|---|---|---|---|
| baseten/figlet-font-sgd-qwen38_27b-expert | ≈26,9 B | GRPO + SGD, 200 updates, K=16 | 25.600 | 41,75 % | Apache-2.0 |
| baseten/figlet-font-adam-qwen38_27b-expert | ≈26,9 B | GRPO + Adam, 200 updates, K=8 | 12.800 | no disponible en la información proporcionada | Apache-2.0 |
| Qwen/Qwen3.8-27B (base fijado) | ≈26,9 B | sin RL de tarea | — | 1,75 % | Apache-2.0 |

Los propios autores advierten que igualar el número de actualizaciones no aísla el efecto del optimizador (K=8 frente a K=16 y distinto consumo total de completaciones), por lo que la tabla no debe leerse como una comparación limpia SGD vs Adam.

## Limitaciones y advertencias

- Alcance extremadamente estrecho: el rendimiento está establecido solo dentro del entorno FIGlet Font congelado; no hay evidencia de transferencia a otras tareas ni de mejora de razonamiento general.
- Retención de capacidades del modelo base no verificada: tras 200 actualizaciones de RL, las capacidades generales, multimodales y de seguridad en producción no han sido evaluadas.
- Visión y vídeo no entrenados ni evaluados: el modelo debe cargarse en modo solo texto (`language_model_only: true` en SGLang).
- Sin conjunto de confirmación final: el banco de validación fue inspeccionado durante el entrenamiento (evaluaciones cada 10 actualizaciones), por lo que existe riesgo de sobreajuste a la validación.
- Métrica con matices: la recompensa media del 41,75 % incluye 33 truncamientos en el denominador; las categorías brutas (33 `truncated`, 367 `unknown`) no se han rescoreado y no se infiere un recuento de aciertos a partir de la media.
- Sesgos y alucinación: no disponibles; no se han publicado evaluaciones de sesgo, y el riesgo de alucinación heredado del modelo base no se ha medido tras el RL.
- Idioma: entrenado y evaluado solo en inglés.
- Uso comercial: la licencia Apache-2.0 lo permite, pero al ser un checkpoint de investigación especializado, su valor comercial directo es limitado y los autores lo califican explícitamente como tal.
- Reproducibilidad: el estado completo del optimizador y las curvas de fidelidad completa permanecen archivados fuera de Hugging Face; solo el snapshot de inferencia `step_199` está publicado.

## Enlaces

- Modelo: https://huggingface.co/baseten/figlet-font-sgd-qwen38_27b-expert
- Provenance (linaje y configuración legible por máquina): https://huggingface.co/baseten/figlet-font-sgd-qwen38_27b-expert/blob/main/provenance.json
- Experto equivalente con Adam: https://huggingface.co/baseten/figlet-font-adam-qwen38_27b-expert
- Modelo base (commit fijado): https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Entorno de entrenamiento (Reasoning Gym, tarea Figlet Font): https://github.com/open-thought/reasoning-gym/blob/49b07130b3fcd12f2d064bba7c43869543a0e7e7/reasoning_gym/cognition/figlet_fonts.py
- Licencia: https://huggingface.co/baseten/figlet-font-sgd-qwen38_27b-expert/blob/main/LICENSE
