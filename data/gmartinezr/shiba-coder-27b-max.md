# Gmartinezr/Shiba-Coder-27B-Max

## Resumen

Shiba-Coder-27B-Max es un adaptador LoRA de tipo SFT publicado por el usuario Gmartinezr sobre el modelo base `prism-ml/Bonsai-27B-unpacked`, una arquitectura declarada como `Qwen3_5ForConditionalGeneration` de 27 516 112 112 parámetros. El adaptador entrena 159 383 552 parámetros (0,58 % del total) con rango 32 y alpha 64, y no está fusionado con el modelo base: se carga en tiempo de inferencia mediante PEFT o se acopla a un GGUF del modelo base con la opción `--lora` de llama.cpp. El objetivo declarado es especializar el modelo en generación de código y razonamiento, incluyendo trayectorias reales de ingeniería de software con llamadas a herramientas.

El entrenamiento combinó tres datasets públicos: `r0b0tlab/qwen3.8-max-distillation-50k` (5 000 ejemplos de destilación con razonamiento y código), `guell00/qwen-3.8-code` (10 000 ejemplos centrados en código) y `TIGER-Lab/SWE-Next-SFT-Trajectories` (2 000 trayectorias de corrección de bugs y desarrollo de funcionalidades). En total, unos 17 000 ejemplos filtrados a un máximo de 8 192 tokens, con partición 98/2 y una única época de 930 pasos que consumió 27,30 horas sobre una base cuantizada a 4 bits y precisión bf16.

Su relevancia es doble: por un lado, ejemplifica el flujo de trabajo habitual de ajuste eficiente (Unsloth + TRL `SFTTrainer` + `adamw_8bit`) para especializar un modelo de 27B con un coste de entrenamiento bajo; por otro, su carácter muy reciente (publicado el 18 de octubre de 2026) y sin métricas públicas lo convierte en un artefacto a evaluar con cautela antes de cualquier uso en producción. El repositorio ocupa 1,0 GB e incluye tanto los pesos del adaptador en safetensors (609 MB, F16) como una conversión GGUF lista para llama.cpp (305 MB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer decoder-only con cabeza condicional, segun el identificador de la clase en la model card); el adaptador es LoRA sobre el modelo base |
| Parametros totales | 27 516 112 112 en el modelo base; 159 383 552 parametros entrenables en el adaptador (0,58 %). El campo `safetensors` del repo refleja 159 383 552, correspondientes al adaptador |
| Parametros activos | no disponible (no se declara una arquitectura MoE) |
| Longitud de contexto | 8 192 tokens (ventana de entrenamiento y contexto declarado) |
| Tipos de cuantizacion | El adaptador se distribuye en F16 (safetensors) y en GGUF F16; el modelo base se usa en 4 bits durante el entrenamiento y la model card referencia un GGUF `Bonsai-27B-Q1_0.gguf` para llama.cpp. No se enumeran otras cuantizaciones en la informacion disponible |
| Idiomas soportados | no disponible (no declarados; se heredan del modelo base) |
| Licencia | Apache 2.0 segun la model card; la metadata de HuggingFace no declara licencia. Los datasets y el modelo base tienen sus propias licencias |
| Formato de pesos | safetensors (PEFT: `adapter_model.safetensors` + `adapter_config.json`), GGUF (`Shiba-Coder-LoRA-F16.gguf`), tokenizer.json y chat_template.jinja |
| Plantilla de chat | `qwen3-thinking` |
| Metodo de ajuste | LoRA + SFT (Unsloth + TRL `SFTTrainer`), r=32, alpha=64 |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `prism-ml/Bonsai-27B-unpacked`, un modelo de 27 516 112 112 parámetros cuya clase de implementación es `Qwen3_5ForConditionalGeneration`, lo que sitúa la familia en el linaje Qwen 3.5 con una cabeza de generación condicional. El ajuste es un LoRA de rango bajo (r=32, alpha=64) entrenado con SFT supervisado, no un ajuste completo: la model card indica explícitamente que el adaptador "adapta estilo y comportamiento, no el conocimiento completo del modelo base". La plantilla de chat utilizada es `qwen3-thinking`, lo que sugiere que el modelo está pensado para producir trazas de razonamiento antes de la respuesta final.

El entrenamiento se ejecutó durante 27,30 horas en 930 pasos (una época), con batch efectivo de 16 (1 × 16 de acumulación de gradiente), optimizador `adamw_8bit`, learning rate 1e-4 con scheduler lineal y 3 % de warmup, precisión bf16 sobre una base cuantizada a 4 bits. La pérdida final de entrenamiento fue 0,2722 y la mejor pérdida de evaluación 0,2888 en el paso 800. Los datos proceden de tres fuentes: 5 000 ejemplos de destilación de Qwen3.8-Max con trayectorias de razonamiento y código, 10 000 ejemplos de SFT centrado en código y 2 000 trayectorias reales de SWE-Next con corrección de bugs, desarrollo de funcionalidades y llamadas a herramientas; todos filtrados a 8 192 tokens y divididos 98/2 entre entrenamiento y evaluación. No se documenta ninguna fase de RLHF o DPO, ni innovaciones de decodificación (attention linear, decodificación especulativa) en la información disponible.

## Capacidades

- Generación de código en múltiples lenguajes: el corpus de entrenamiento está dominado por ejemplos de código (10 000 de los 17 000), incluyendo la generación de endpoints, funciones y scripts completos.
- Razonamiento explícito en modo "thinking": la plantilla `qwen3-thinking` induce trazas de razonamiento antes de la respuesta, útil para problemas de varios pasos.
- Razonamiento matemático y lógico derivado de las trayectorias de destilación de Qwen3.8-Max, aunque no se publican métricas que lo cuantifiquen.
- Trayectorias de ingeniería de software: el ajuste con SWE-Next-SFT incluye ejemplos de localización de bugs, parcheo y uso de herramientas, lo que orienta el modelo a flujos de trabajo agénticos.
- Soporte de tool calling / function calling: inferido del dataset SWE-Next (que contiene trayectorias con llamadas a herramientas); no se documenta un formato específico de herramientas en la model card.
- Conversación multi-turno: pipeline declarado `text-generation` y `conversational`, con plantilla de chat compatible con `apply_chat_template`.
- Capacidades multilingües: no disponible (no declaradas; dependen del modelo base).
- Capacidades de visión o audio: no disponible (la clase `ConditionalGeneration` podría admitir otras modalidades, pero no se documenta en la información proporcionada).

## Casos de uso

- Asistente de código en IDE: el adaptador se carga sobre el modelo base con PEFT y se expone mediante un endpoint local; su especialización en código y su plantilla de razonamiento permiten generar funciones completas y explicar el razonamiento, con la ventaja de que solo hay que distribuir 609 MB de adaptador en lugar de un modelo completo.
- Corrección automática de bugs en pipelines de CI: las 2 000 trayectorias de SWE-Next orientan al modelo a producir parches y comandos de verificación; puede integrarse en un bot que reciba el fallo de un test, proponga un diff y lo valide.
- Generación de tests unitarios: a partir de una firma de función o de un módulo, el modelo produce casos de prueba, aprovechando la parte de código del dataset y el modo de razonamiento para justificar los casos límite.
- Migración y refactorización de código legacy: con una ventana de 8 192 tokens puede procesar un archivo completo de tamaño medio y devolver una versión refactorizada con explicaciones paso a paso.
- Agente de resolución de issues: combinado con un runtime de herramientas (ejecución de shell, lectura de ficheros), el ajuste sobre trayectorias SWE permite encadenar varios pasos de razonamiento y llamadas a herramientas para cerrar una issue acotada.
- Generación de documentación técnica: el modelo puede resumir módulos y generar docstrings o documentación de API, una tarea donde la especialización en código reduce las alucinaciones sobre firmas y nombres de funciones en comparación con un modelo genérico.
- Despliegue en entornos con poca VRAM: al ser un adaptador, permite servir el modelo base cuantizado (por ejemplo el GGUF Q1_0 citado en la model card) y aplicar el LoRA en tiempo de inferencia con llama.cpp, lo que facilita prototipado en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que aún no hay cifras públicas de HumanEval, MBPP ni SWE-bench. Los únicos datos cuantitativos reportados son de entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida final de entrenamiento | 0,2722 |
| Mejor perdida de evaluacion | 0,2888 (paso 800) |
| Pasos | 930 (1 epoca) |
| Duracion del entrenamiento | 27,30 h |
| Ejemplos de entrenamiento | ~17 000 (filtrados a ≤ 8 192 tokens) |
| Parametros entrenables | 159 383 552 (0,58 %) |

La pérdida de evaluación no es comparable entre modelos ni traducible a calidad de código, por lo que no debe usarse como sustituto de una evaluación con HumanEval, MBPP o SWE-bench.

## Requisitos de hardware

- VRAM para el modelo base completo en F16/BF16: aproximadamente 55 GB para 27,5B parámetros, más el adaptador (unos 0,3-0,6 GB en F16).
- VRAM en cuantización de 8 bits: alrededor de 28-30 GB, lo que encaja en una A100 40/80 GB o H100.
- VRAM en cuantización de 4 bits: del orden de 15-17 GB, ajustado en una RTX 4090 (24 GB) o RTX 3090 dejando espacio para la caché KV de 8 192 tokens.
- Cuantización de 1 bit (el GGUF `Bonsai-27B-Q1_0.gguf` referenciado en la model card): el peso del modelo baja a un rango de un dígito de GB, lo que permite ejecución en GPU de consumo e incluso en CPU, con la correspondiente pérdida de calidad.
- GPU recomendadas: H100 o A100 80 GB para F16 y mayor throughput; A100 40 GB o 2× RTX 4090 para 8 bits; RTX 4090, 3090 o 4080 para 4 bits con contexto moderado.
- Despliegue: `transformers` + `peft` (ruta oficial de la model card), llama.cpp con `--lora` (soporte nativo del GGUF incluido), vLLM con soporte de adaptadores LoRA para servir varias variantes sobre un mismo base, y Unsloth para reentrenamiento o ajuste adicional.
- Requisito de versión: la conversión del LoRA a GGUF requiere una build de `transformers` que entienda `qwen3_5` (≥ 5.x desde el código fuente en el momento de la publicación).
- Latencia y throughput: no disponibles; no se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Benchmarks publicos |
|---|---|---|---|---|---|
| Shiba-Coder-27B-Max | LoRA SFT sobre base de 27B | 159,4 M entrenables (base 27,5 B) | 8 192 | Apache 2.0 (segun model card) | No disponibles |
| prism-ml/Bonsai-27B-unpacked | Modelo base completo | 27 516 112 112 | no disponible | no disponible | No disponibles en la informacion proporcionada |
| Qwen2.5-Coder-32B-Instruct | Modelo de codigo completo | ~32 B | ~32 768 | Apache 2.0 | no disponible en la informacion proporcionada |
| Codestral-22B | Modelo de codigo completo | ~22 B | no disponible | Licencia no comercial (MNPL) | no disponible en la informacion proporcionada |

La comparación estructural favorece al adaptador en coste de distribución y en facilidad para alternar entre especializaciones sobre el mismo base; en cambio, su ventana de 8 192 tokens es inferior a la de las alternativas de código de 32B que manejan contextos de decenas de miles de tokens, y la ausencia de métricas públicas impide afirmar que su rendimiento en código sea superior al del modelo base o al de esos modelos. No se dispone de datos de benchmarks de ninguna de las alternativas en la información proporcionada, por lo que la comparación cuantitativa queda abierta.

## Limitaciones y advertencias

- Ausencia total de benchmarks públicos (HumanEval, MBPP, SWE-bench): no hay evidencia cuantitativa de mejora sobre el modelo base.
- El LoRA es intencionadamente de rango bajo (r=32, alpha=64); adapta estilo y comportamiento, no incorpora conocimiento nuevo, por lo que los fallos de conocimiento del base persisten.
- Ventana de contexto de 8 192 tokens, insuficiente para repositorios grandes o conversaciones largas; además, el entrenamiento se filtró a ese límite, por lo que el comportamiento más allá del mismo no está validado.
- El modelo base se distribuye como "unpacked", sin información pública en la documentación consultada sobre su procedencia exacta, datos de entrenamiento originales ni licencia declarada en la metadata de HuggingFace; conviene verificar la licencia del base antes de uso comercial.
- La licencia Apache 2.0 aparece en la model card, pero el campo de licencia de HuggingFace figura como no disponible y los tres datasets de entrenamiento tienen sus propias condiciones; es necesario comprobar la compatibilidad antes de un despliegue comercial.
- Idiomas soportados no declarados: no hay garantía de calidad fuera del inglés, ni evidencia de buen rendimiento en castellano.
- Riesgo de alucinación heredado: en tareas de código puede inventar APIs, nombres de funciones o dependencias inexistentes, especialmente fuera de los patrones vistos en el corpus (destilación de Qwen3.8-Max y código de `guell00/qwen-3.8-code`).
- Posible contaminación de los datos de evaluación: los datasets de entrenamiento son públicos y de gran tamaño, lo que puede inflar resultados en evaluaciones futuras si no se aplica un filtro de solapamiento.
- Sesgos heredados del modelo base y de los datasets de destilación; no se documenta ninguna evaluación de sesgo ni de seguridad.
- Trazas de razonamiento ("thinking") pueden aumentar la latencia y el consumo de tokens, y en algunos casos exponer razonamiento interno que no debería mostrarse al usuario final.
- Modelo muy reciente y con nula tracción (0 descargas, 1 like en el momento de la consulta): no hay validación independiente de la comunidad.
- Requiere versiones muy concretas de `transformers` (≥ 5.x desde el código fuente) para manipular el LoRA, lo que complica la integración en entornos con dependencias fijadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gmartinezr/Shiba-Coder-27B-Max
- Modelo base: https://huggingface.co/prism-ml/Bonsai-27B-unpacked
- Repositorio de codigo y resultados: https://github.com/GinesMr/Shiba-Coder-27B-Max
- Resumen de entrenamiento: https://github.com/GinesMr/Shiba-Coder-27B-Max/blob/main/results/train_summary.md
- Documentacion de datasets: https://github.com/GinesMr/Shiba-Coder-27B-Max/blob/main/data/DATASETS.md
- Dataset de destilacion: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-distillation-50k
- Dataset de codigo: https://huggingface.co/datasets/guell00/qwen-3.8-code
- Dataset de trayectorias SWE: https://huggingface.co/datasets/TIGER-Lab/SWE-Next-SFT-Trajectories
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los unicos resultados obtenidos fueron paginas comerciales de estores, sin relacion con el contenido de esta ficha.
