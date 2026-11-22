# Constant8868/trace-mm-d5-glm46v-lora

## Resumen

TRACE_MM d5 decision detector es un adaptador LoRA (PEFT) sobre el modelo multimodal zai-org/GLM-4.6V, publicado por el usuario Constant8868. No es un modelo completo, sino un ajuste fino de bajo rango (r=16, alpha=32) que especializa el modelo base para una tarea concreta de robótica: la detección y atribución de fallos en episodios de manipulación. Dado el estado de un episodio de robot hasta el momento actual, el adaptador produce una respuesta estructurada en JSON con un campo `decision` (valores posibles: `none`, `watch`, `act`, `reset`) y un campo `class` con la clase de fallo detectada o `none`.

El adaptador se entrena con el trainer del proyecto TRACE_MM en la configuración `d5_decision_full_bf16`, sobre el dataset attributor-v5, que contiene 39 tareas de entrenamiento y 8 tareas reservadas para validación. El ajuste se aplica únicamente a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) del modelo base, por lo que hereda toda la arquitectura, el contexto y las capacidades multilingües y multimodales de GLM-4.6V.

Es relevante ahora porque demuestra un patrón de reutilización de modelos fundacionales multimodales mediante LoRA para tareas verticales de robótica, con un coste de entrenamiento bajo (6,7 horas en 2 GPU H200) y un formato de salida pensado para integrarse en bucles de control de agentes robóticos. El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal GLM-4.6V; el adaptador modifica `q_proj`, `k_proj`, `v_proj`, `o_proj` |
| Parametros totales | no disponible (el adaptador LoRA no declara recuento; el modelo base GLM-4.6V no aporta cifra en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion del adaptador; heredada del modelo base GLM-4.6V (no especificada) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el entrenamiento usa bf16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`adapter/adapter_model.safetensors`), mas `adapter_config.json`, `training_config.json` y `history.jsonl` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16, alpha 32 y dropout 0,05 aplicado sobre las proyecciones de atención del modelo base GLM-4.6V, que es un transformer multimodal con mezcla de expertos (tag `glm4v_moe`). No se modifica la arquitectura del modelo base; el adaptador añade matrices de bajo rango sobre las capas de atención para especializar la salida hacia la tarea de decisión y clasificación de fallos.

El entrenamiento se realizó sobre el dataset attributor-v5, con 39 tareas de entrenamiento y 8 tareas reservadas (KettleBoiling, MakeIceLemonade, PackIdenticalLunches, PanTransfer, PickPlaceSinkToCounter, SetUpCuttingStation, SteamInMicrowave, TurnOnMicrowave). Se usaron 20.000 consultas, 1 época, acumulación de gradiente 16 (1.250 pasos de optimizador), learning rate 1e-4, precisión bf16 y semilla 41109. El entrenamiento se ejecutó con una reimplementación data-parallel del trainer de TRACE_MM (`detector_train.train`) sobre 2 GPU H200 durante 6,7 horas; la pérdida de calibración final (NLL) fue 0,1031 sobre 500 consultas de calibración retenidas. No hay puntuaciones sobre las tareas reservadas (held-out) en la información disponible.

## Capacidades

- Detección de fallos en episodios de robot: dado el estado del episodio hasta el momento, emite una decisión estructurada (`none`, `watch`, `act`, `reset`) y una clase de fallo.
- Salida en JSON con esquema fijo: `{"decision": "<none, watch, act o reset>", "class": "<class o none>"}`.
- Hereda las capacidades multimodales del modelo base GLM-4.6V (visión y texto), aunque el adaptador está especializado en la tarea de decisión.
- Soporte de tool calling y function calling: no disponible en la información del adaptador (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; el adaptador está orientado a una decisión puntual por consulta.
- Capacidades multilingües: no disponibles en la información del adaptador.
- Capacidades especiales (thinking mode, audio, etc.): no disponibles.

## Casos de uso

- Monitorización de episodios de manipulación robótica: el adaptador recibe el estado del episodio hasta el instante actual y emite una decisión (`watch` o `act`) que un bucle de control puede usar para decidir si continuar, intervenir o reiniciar la tarea. Es adecuado porque la salida está estructurada y acotada a cuatro valores.
- Clasificación de fallos en producción: cuando la decisión es `act`, la clase de fallo asociada permite enrutar el episodio a un módulo de recuperación o a un operador humano, aprovechando que el adaptador se entrenó sobre tareas concretas de cocina y manipulación.
- Detección temprana de fallos con `watch`: el modelo puede marcar episodios sospechosos antes de que el fallo sea irreversible, gracias a la granularidad de la decisión en cuatro niveles.
- Reinicio automático de tareas (`reset`): en pipelines de evaluación de robots, el adaptador puede indicar cuándo un episodio debe abortarse y reiniciarse, reduciendo la intervención manual en campañas de recogida de datos.
- Integración en el runtime de TRACE_MM: el adaptador se carga mediante `detector_train infer` con el `training_config.json` del repositorio, lo que permite usarlo directamente dentro del pipeline de atribución de fallos del proyecto TRACE_MM.
- Evaluación comparativa de políticas robóticas: al ser un adaptador ligero (0,1 GB), se puede intercambiar con otros adaptadores sobre el mismo modelo base para comparar detectores de fallos en las mismas tareas.
- Investigación en atribución de fallos: el conjunto de tareas reservadas (8 tareas no vistas en entrenamiento) permite medir la generalización del detector a tareas nuevas, un escenario habitual en investigación de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento es la pérdida de calibración final (NLL) de 0,1031 sobre 500 consultas de calibración retenidas; no hay puntuaciones sobre las 8 tareas held-out ni comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador aislado; depende del modelo base GLM-4.6V, que no aporta cifras en la información disponible.
- GPU recomendadas: el entrenamiento se realizó en 2 GPU H200; para inferencia se requiere hardware capaz de ejecutar el modelo base GLM-4.6V, no especificado.
- ¿Cabe en GPU de consumo? No disponible; depende del modelo base y de la cuantización elegida para él.
- Opciones de despliegue: carga como adaptador PEFT con `peft.PeftModel.from_pretrained`, o mediante el runtime de TRACE_MM (`trace_mm.failure_attribution.runtime_attributor.detector_train infer`). No se documentan opciones vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| TRACE_MM d5 (este) | LoRA sobre GLM-4.6V | no disponible | no disponible | MIT | Especializado en decisión de fallos de robot; 20.000 consultas de entrenamiento |
| Modelo base zai-org/GLM-4.6V | Transformer multimodal MoE | no disponible | no disponible | no disponible | Modelo fundacional sin especializar en robótica |
| Otros adaptadores TRACE_MM | LoRA sobre GLM-4.6V | no disponible | no disponible | no disponible | No se dispone de información sobre otras variantes en la búsqueda |

No se dispone de información sobre detectores de fallos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El adaptador está especializado en 39 tareas de entrenamiento del dataset attributor-v5; su comportamiento en tareas fuera de esa distribución no está validado (las 8 tareas held-out no tienen puntuaciones publicadas).
- No hay datos de sesgos, alucinación ni robustez frente a entradas fuera de distribución.
- El `training_config.json` contiene rutas de máquina sustituidas por marcadores (`<ATTRIBUTOR_DATA>`, `<TRACE_MM_REPO>`, `<GLM-4.6V>`); es necesario reemplazarlas antes de ejecutar la inferencia con TRACE_MM.
- La licencia del adaptador es MIT, pero el uso comercial está condicionado por la licencia del modelo base GLM-4.6V, que no se especifica en la información disponible.
- El repositorio no registra descargas ni likes, y el pipeline no está declarado; se trata de un artefacto de investigación sin validación externa.
- La salida está restringida a cuatro decisiones y una clase de fallo; no debe usarse como sistema de seguridad crítico sin validación adicional.
- No se documentan idiomas soportados ni capacidades multilingües específicas del adaptador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Constant8868/trace-mm-d5-glm46v-lora
- Modelo base GLM-4.6V: https://huggingface.co/zai-org/GLM-4.6V
- Revisión del modelo base usada en el entrenamiento: `4e2d47eb0b41c5280d8294b17cef9e94fdcfff46`
- Proyecto TRACE_MM: no disponible como enlace en la información proporcionada (se referencia el módulo `trace_mm.failure_attribution.runtime_attributor.detector_train`)
