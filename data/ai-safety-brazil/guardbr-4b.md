# ai-safety-brazil/guardbr-4b

## Resumen

GuardBR-4B es un adaptador LoRA experimental sobre Qwen/Qwen3.5-4B, desarrollado por ai-safety-brazil, que actúa como clasificador de riesgo de instrucciones en portugués con políticas definidas por tarea. El modelo aborda dos problemas concretos: la detección de inyección de prompt (una instrucción de origen externo que intenta tomar el control de las instrucciones del sistema) y la clasificación del riesgo de una petición en tres clases (permitida, directamente insegura y jailbreak que intenta eludir la política).

El adaptador no genera texto libre: se emplea como clasificador de verosimilitud sobre un backbone causal, evaluando la log-verosimilitud real de los dígitos de clase en el siguiente token. Se entrenó con rank 16 sobre 16.000 ejemplos sintéticos generados por modelos, con supervisión limitada al dígito de decisión y EOS, y un límite de contexto de 8.192 tokens.

Su relevancia es doble: por un lado, demuestra que un adaptador pequeño (0,2 GB de repositorio) sobre un modelo de 4B puede igualar o superar ligeramente a una referencia TF-IDF en CPU en tareas de seguridad en portugués; por otro, el propio autor advierte que la ventaja medida se restringe a las familias sintéticas reservadas para test y que la validez en condiciones reales no está establecida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 16) sobre transformer causal Qwen3.5-4B; clasificación por log-verosimilitud del siguiente token |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el base es Qwen3.5-4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens, sin truncamiento automático |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones del adaptador; el repo pesa 0,2 GB en safetensors) |
| Idiomas soportados | Portugués (pt) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); no es un checkpoint `AutoModelForSequenceClassification` |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rank 16 sobre Qwen/Qwen3.5-4B, un transformer causal. La clasificación no se realiza con una cabeza de secuencia clásica, sino calculando la log-verosimilitud real de los dígitos de clase en el siguiente token; las decisiones se toman sobre esa señal, no sobre la confianza declarada por el modelo. El backbone se carga explícitamente con `Qwen3_5ForConditionalGeneration` seguido de PEFT. El adaptador se distribuye bajo la categoría `text-generation` porque el backbone es causal, aunque su uso previsto es de clasificación.

El entrenamiento se realizó en Tinker con Adam, tasa de aprendizaje 0,0001, batch de 64 y una época, precedido de un piloto de 4.000 ejemplos y seguido de un ajuste seleccionado de 16.000 ejemplos. La supervisión cubre únicamente el dígito de decisión y EOS, con los tokens del prompt enmascarados. Los datos provienen de dos datasets sintéticos con etiquetas generadas por modelos (Prompt Injection BR Synthetic y Jailbreak BR Synthetic), sin anotación humana ni preferencias humanas. La entrada corresponde al campo `text` completo de los datasets; IDs, metadatos, familia y procedencia de generación quedan fuera del prompt. Las políticas, el formato de prompts y los umbrales calibrados están en `guardbr_config.json`.

## Capacidades

- Clasificación binaria de inyección de prompt: distingue instrucciones legítimas, citadas o cambios benignos autorizados de tarea (clase 0) de intentos de contenido externo que asume el control de las instrucciones (clase 1).
- Clasificación de riesgo de petición en tres clases: 0 para petición permitida, 1 para petición directamente insegura según la política y 2 para jailbreak que intenta eludir esa política. La clase 2 implica `unsafe_request=True`.
- Decisión basada en log-verosimilitudes reales de los dígitos de clase, en lugar de confianza autodeclarada.
- Soporte de políticas por tarea: el prompt incluye política, tarea, origen del contenido y contenido completo.
- Capacidades multilingües: solo portugués.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito; es un clasificador, no un generador de respuestas.

## Casos de uso

- Moderación de entrada en asistentes conversacionales en portugués: el clasificador `injection` puede colocarse delante del modelo generativo para etiquetar contenido recuperado o aportado por el usuario y bloquear intentos de secuestro de instrucciones antes de que lleguen al prompt del sistema.
- Filtro de seguridad en APIs de chat: la tarea `request` con tres clases permite separar peticiones legítimas de peticiones inseguras y de intentos de jailbreak, aplicando políticas distintas a cada categoría en lugar de un único umbral binario.
- Protección de pipelines RAG: al clasificar el contenido recuperado de documentos externos con la tarea `injection`, se detectan instrucciones embebidas en fuentes que intentan alterar el comportamiento del modelo.
- Triaje previo a revisión humana: con recall declarado del 100% en peticiones inseguras y falsos positivos del 0,25% en peticiones, el modelo puede usarse como primera capa que deriva casos dudosos a moderadores humanos.
- Evaluación de red teaming en portugués: sirve como detector de referencia para medir la tasa de jailbreaks exitosos en campañas de prueba sobre otros modelos, siempre con la cautela de que su validación es sintética.
- Investigación en seguridad de LLM para lusohablantes: al ser un adaptador pequeño y reproducible con datasets y configuraciones publicadas, permite replicar experimentos y comparar contra la referencia TF-IDF declarada.

## Benchmarks y rendimiento

Datos publicados por el autor sobre 1.000 casos reservados por tarea, con familias de test ausentes de entrenamiento y desarrollo:

| Tarea | Base sin ajuste (macro-F1) | Referencia CPU TF-IDF (macro-F1) | GuardBR (macro-F1) |
|---|---:|---:|---:|
| Inyección de prompt (binaria) | 95,16% | 99,48% | 99,69% |
| Riesgo del pedido (tres clases) | 81,02% | 98,35% | 99,54% |

Métrica primaria (media con pesos iguales de ambas tareas): 99,62% en GuardBR, 98,92% en la referencia TF-IDF y 88,09% en el base. La ventaja sobre la referencia más fuerte es de 0,70 puntos porcentuales, con intervalo pareado de 95% [0,15; 1,32] remuestreando grupos en 2.000 réplicas. La reducción relativa de `1 − macro-F1 primario` es del 64,5%, valor que describe el error de la métrica en estos tests construidos y no una reducción medida de daños en situaciones reales.

Métricas adicionales declaradas: falsos positivos del 0,50% en inyección y del 0,25% en peticiones; falsos jailbreaks entre peticiones sin jailbreak del 0,33%; recall de peticiones inseguras del 100,00%; cobertura de puntuación del 100%. La exportación HF reprodujo 40/40 decisiones en casos deterministas de desarrollo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El adaptador pesa 0,2 GB, pero requiere cargar el backbone Qwen3.5-4B completo; en fp16 el backbone de 4B ocupa aproximadamente 8 GB, y en cuantizaciones de 4 bits en torno a 2-3 GB, aunque el autor no documenta cuantizaciones del adaptador.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño del backbone, cabría en GPUs consumer con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB en fp16), pero no hay validación publicada.
- Cabe en GPU consumer: probablemente sí con el backbone en cuantización, aunque no está verificado ni documentado por el autor.
- Opciones de despliegue: el autor documenta el uso mediante el helper `inference.py` del repositorio, con `torch==2.10.0`, `transformers==5.5.4`, `peft==0.18.1`, `accelerate==1.12.0`, `numpy` y `datasets`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Macro-F1 primario | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| GuardBR-4B | LoRA sobre Qwen3.5-4B | Base 4B (adaptador rank 16) | 8.192 | 99,62% | CC-BY-4.0 | HuggingFace |
| Referencia CPU TF-IDF | Clasificador clásico | No aplica | No aplica | 98,92% | No disponible | Referencia interna del autor |
| Qwen3.5-4B sin ajuste | Transformer causal | 4B | No disponible | 88,09% | No disponible en esta ficha | HuggingFace |

No se dispone de comparación con otros detectores de seguridad en portugués; el propio autor indica que las comparaciones cubren solo las dos referencias declaradas, no todos los detectores existentes.

## Limitaciones y advertencias

- La ventaja medida se restringe a familias sintéticas reservadas para test; la validez en condiciones reales no está establecida.
- Los datos de entrenamiento son generados por modelos, con etiquetas también producidas por modelos y sin anotación humana; esto puede introducir sesgos y artefactos de las familias sintéticas.
- Las probabilidades devueltas son condicionales a las etiquetas legales y no son probabilidades calibradas de riesgo real.
- El test no mide la validez de formato en generación libre; el modelo es un clasificador, no un generador.
- Solo cubre portugués; no hay soporte multilingüe.
- Un pedido inseguro no es automáticamente un jailbreak: la clase 2 implica `unsafe_request=True`, pero la clase 1 y la 2 son categorías distintas que deben tratarse con políticas separadas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea fuera de la distribución sintética de entrenamiento.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el autor no ofrece garantías de idoneidad para producción.
- El identificador del base usado en el entrenamiento en Tinker no incluye un commit HF inmutable; la revisión del base HF citada es `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`.
- Los módulos fundidos de la exportación pueden tener ranks efectivos distintos; los patrones de rank y alpha están en el config.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ai-safety-brazil/guardbr-4b
- Dataset Prompt Injection BR Synthetic: https://huggingface.co/datasets/ai-safety-brazil/prompt-injection-br-synthetic/tree/a80d8dc41c73958e9e28ff2a16628af48e4e1487
- Dataset Jailbreak BR Synthetic: https://huggingface.co/datasets/ai-safety-brazil/jailbreak-br-synthetic/tree/7745a44c870b7f72672d230ecf468330c038fbe6
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
