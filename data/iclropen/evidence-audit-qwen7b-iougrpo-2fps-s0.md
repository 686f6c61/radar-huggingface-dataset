# iclropen/evidence-audit-qwen7b-iougrpo-2fps-s0

## Resumen

evidence-audit-qwen7b-iougrpo-2fps-s0 es un adaptador LoRA para el modelo base Qwen2.5-VL-7B-Instruct, desarrollado por el usuario iclropen en el contexto de un articulo academico sometido a ICLR 2027 titulado "Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding". El adaptador se entrena para la tarea de localizacion temporal de evidencia en video (video temporal grounding), es decir, identificar el intervalo temporal exacto dentro de un video que respalda una afirmacion o pregunta. El repositorio contiene unicamente los pesos LoRA (190.435.728 bytes, unos 0,2 GB), no el modelo completo.

La relevancia de este adaptador es metodologica: no busca solo maximizar la precision de localizacion (IoU) sino medir y entrenar la dependencia de la evidencia, es decir, que el modelo base sus respuestas en el contenido visual real del intervalo anotado y no en atajos o sesgos del dataset. Para ello emplea GRPO con una recompensa basada en IoU temporal a 2 fps, junto con ediciones de evidencia y placebos emparejados. El entrenamiento usa 2.400 pares de Charades-STA y 600 pasos de optimizacion con semilla 0.

El modelo base Qwen2.5-VL-7B-Instruct aporta la arquitectura vision-lenguaje de aproximadamente 7.000 millones de parametros, y este adaptador modifica exclusivamente el modelo de lenguaje (la torre de vision no recibe gradiente por el uso de gradient checkpointing, dejando sus matrices lora_B a cero). La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL-7B-Instruct (transformer vision-lenguaje); adaptador PEFT |
| Parametros totales | Aproximadamente 7.000 millones en el modelo base; adaptador LoRA de 190.435.728 bytes |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con lora_alpha 32 y dropout 0,05, aplicado sobre los modulos de atencion y MLP (q/k/v/o/gate/up/down_proj) del modelo de lenguaje de Qwen2.5-VL-7B-Instruct. La torre de vision no recibe gradiente durante el entrenamiento (por el uso de gradient checkpointing), por lo que sus matrices `lora_B` quedan a cero y el adaptador afecta unicamente al modelo de lenguaje. El entrenamiento se realizo con transformers 4.51.3 y peft 0.20; existe una incompatibilidad de nombres de claves con transformers 5.x que puede provocar una carga silenciosa sin efecto, por lo que la model card incluye un autochequeo para verificar que todos los tensores LoRA se han cargado.

El objetivo combina una perdida NLL sobre la respuesta limpia y terminos GRPO con recompensa de IoU temporal al protocolo nativo de 2 fps, incluyendo comparaciones frente a ediciones de evidencia y placebos emparejados fuera del intervalo anotado. Los hiperparametros clave son: coeficiente KL 0,04, G=8 muestras por pregunta, 4 preguntas por paso, 20 pasos de calentamiento, 2.400 pares de entrenamiento (Charades-STA train), 600 pasos de optimizacion, tasa de aprendizaje 1e-5 y semilla 0. La entrada de video se limita a 2 fps y como maximo 768 frames, con orden de mensajes video primero y texto despues.

## Capacidades

- Localizacion temporal de evidencia en video: identifica intervalos temporales que respaldan una pregunta o afirmacion.
- Razonamiento video-lenguaje sobre el modelo base Qwen2.5-VL-7B-Instruct.
- Entrenamiento orientado a dependencia de evidencia: el objetivo penaliza respuestas que aciertan por atajos en lugar de por el contenido del intervalo anotado.
- Evaluacion de precision a 2 fps con decodificacion greedy (scripts en el repositorio de codigo).
- Auditoria de verosimilitud y auditoria comportamental (incluidas en el repositorio de codigo).
- Soporte de tool calling, agentes y otras capacidades generales del modelo base: no disponible como dato especifico de este adaptador.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en grounding temporal de video: permite reproducir el experimento del articulo y comparar variantes de entrenamiento (por ejemplo, distintas semillas o tasas de fps) sobre Charades-STA.
- Auditoria de dependencia de evidencia: usar los scripts de auditoria de verosimilitud y comportamental para comprobar si un modelo responde al contenido visual real o a sesgos del dataset.
- Analisis de robustez frente a ediciones: evaluar como cambia la respuesta cuando se edita el intervalo de evidencia o se aplica un placebo fuera del intervalo, util para estudiar atajos en modelos video-lenguaje.
- Reproducibilidad academica: cargar el adaptador con la version exacta de transformers y peft indicada y ejecutar el autochequeo para validar la carga antes de medir resultados.
- Baseline para nuevos adaptadores: servir como punto de partida (semilla 0, 2 fps, recompensa IoU) para comparar tecnicas alternativas de entrenamiento con GRPO en grounding temporal.
- Estudio de limitaciones de LoRA en modelos multimodales: analizar el efecto de entrenar solo el modelo de lenguaje (torre de vision congelada por gradient checkpointing) frente a adaptar tambien la torre visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de IoU, accuracy ni comparaciones numericas; solo describe el protocolo de evaluacion (precision a 2 fps con decodificacion greedy) y remite a los scripts del repositorio de codigo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende del modelo base Qwen2.5-VL-7B-Instruct en bfloat16 (aproximadamente 14-16 GB de pesos) mas el adaptador LoRA (unos 0,2 GB).
- GPU recomendadas: no disponible como recomendacion del autor; por tamano del modelo base, encajan GPU con 24 GB o mas (por ejemplo, RTX 4090, A100, H100) para bfloat16.
- Cabe en GPU de consumo: previsiblemente si en RTX 4090 (24 GB) con bfloat16, sujeto a la memoria adicional para frames de video (hasta 768 frames a 2 fps); no confirmado por el autor.
- Opciones de despliegue: transformers 4.51.3 con peft 0.20 y qwen-vl-utils, segun la model card; otras opciones (vLLM, llama.cpp, Ollama, TGI) no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-iougrpo-2fps-s0 | Adaptador LoRA sobre base de aproximadamente 7.000 millones | No disponible | Grounding temporal de video (Charades-STA) | Apache 2.0 | Hugging Face (adaptador) |
| Qwen2.5-VL-7B-Instruct (base) | Aproximadamente 7.000 millones | No disponible en la informacion | Vision-lenguaje general | Apache 2.0 | Hugging Face |
| Alternativas de grounding temporal de video | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre este adaptador y otras alternativas de grounding temporal de video en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador modifica solo el modelo de lenguaje; la torre de vision queda sin adaptar (matrices `lora_B` a cero por el gradient checkpointing).
- Incompatibilidad de nombres de claves entre transformers 4.51 y 5.x: cargar con la version equivocada no produce error pero deja los pesos LoRA sin aplicar; es obligatorio ejecutar el autochequeo incluido en la model card.
- Entrenado sobre Charades-STA train (2.400 pares); el rendimiento fuera de ese dominio o protocolo no esta documentado.
- Protocolo de entrada limitado a 2 fps y un maximo de 768 frames; videos mas largos o de mayor tasa de frames requieren un preprocesado distinto no descrito.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible; el propio articulo aborda el riesgo de que la precision no refleje dependencia real de la evidencia.
- Idiomas soportados: no disponible; no se declara cobertura multilingue especifica.
- Licencia Apache 2.0 declarada, pero el modelo base Qwen2.5-VL-7B-Instruct tiene sus propios terminos que deben respetarse por separado.
- Estado del articulo: sometido a ICLR 2027 y bajo revision; los resultados no estan validados por revisores en el momento de la publicacion del repositorio.
- Repositorio con 0 descargas y 0 likes; no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iclropen/evidence-audit-qwen7b-iougrpo-2fps-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de codigo: https://huggingface.co/iclropen/evidence-audit-code
- Articulo: "Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding" (ICLR 2027 submission, under review); no se proporciona enlace al PDF en la informacion disponible.
- Dataset de referencia: Charades-STA (no se proporciona enlace especifico en la informacion disponible).
