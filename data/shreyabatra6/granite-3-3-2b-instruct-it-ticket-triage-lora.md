# shreyabatra6/granite-3.3-2b-instruct-it-ticket-triage-lora

## Resumen

El modelo `shreyabatra6/granite-3.3-2b-instruct-it-ticket-triage-lora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `ibm-granite/granite-3.3-2b-instruct` de IBM. Su proposito es automatizar el triaje de tickets de soporte tecnico (IT helpdesk): dada la cabecera y el cuerpo de un ticket, devuelve un JSON estricto con una categoria (entre ocho posibles) y una prioridad (Low, Medium, High o Critical). Lo desarrolla Shreya Batra y se publica bajo licencia Apache 2.0.

El adaptador anade 28,18 millones de parametros entrenables (un 1,1 % de los 2.561.720.320 parametros del modelo base) y esta pensado como sugerencia de primera pasada para mesas de ayuda, con confirmacion humana posterior. La relevancia actual radica en que demuestra que un ajuste fino con QLoRA sobre un modelo pequeno de 2B puede mejorar de forma medible una tarea de clasificacion estructurada: el exact match (ambas etiquetas correctas) pasa del 50,2 % en el modelo base zero-shot al 73,0 % tras el ajuste, manteniendo un 100 % de respuestas JSON validas.

El modelo esta entrenado exclusivamente con datos sinteticos y solo en ingles. El repositorio del adaptador ocupa 0,1 GB y la model card declara los resultados de evaluacion en el split de test del dataset `shreyabatra6/it-ticket-triage`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Granite 3.3 2B Instruct) con adaptador LoRA; el adaptador se entrena con QLoRA (4-bit NF4) |
| Parametros totales | 2.561.720.320 en el modelo base; 28.180.480 entrenables en el adaptador (1,1 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (longitud maxima de secuencia usada en entrenamiento: 512 tokens) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 durante el entrenamiento; el adaptador se distribuye en safetensors (precision del adaptador no detallada) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo fusionado se publica por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `ibm-granite/granite-3.3-2b-instruct`, un transformer decoder-only de 2B parametros. El ajuste se realizo con QLoRA: el modelo base se carga en 4 bits NF4 y se entrenan adaptadores LoRA de rango 16, alpha 32 y dropout 0,05 sobre los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La perdida se calcula unicamente sobre la respuesta del asistente (los tokens del prompt estan enmascarados), con 0,99 epocas, 200 pasos de optimizador, learning rate de 0,0002 con schedule coseno y 5 % de warmup, batch efectivo de 16 (8 x 2 de acumulacion), precision fp16, optimizador `adamw_torch_fused` y gradient checkpointing activado. El checkpoint se selecciono por menor perdida de validacion (paso 200, perdida 0,0478). El entrenamiento completo tardo 46,7 minutos en una unica Tesla T4 de 14,6 GB, con semilla 42.

Los datos de entrenamiento son completamente sinteticos: 3.218 tickets de entrenamiento, 374 de validacion y 404 de test, generados a partir de plantillas escritas a mano con huecos aleatorizados, distintos estilos de redaccion (formal, informal, telegrafico, frustrado, movil, no nativo), errores tipograficos, vocabulario cruzado entre categorias y peticiones secundarias no relacionadas. La particion se hizo por plantilla (StratifiedGroupKFold sobre categoria y prioridad), de modo que los tickets de validacion y test usan plantillas que nunca aparecen en entrenamiento; ademas, una comprobacion con MinHash elimino duplicados cercanos (Jaccard >= 0,8) entre train y validacion/test. Un 3 % de las prioridades se desplazo un nivel para simular desacuerdo entre anotadores.

## Capacidades

- Clasificacion de tickets de soporte tecnico en ocho categorias: Hardware, Software, Network, Access/Accounts, Email, Security, Printer y Other.
- Asignacion de prioridad en cuatro niveles: Low, Medium, High y Critical.
- Generacion de salida en JSON estricto con el formato `{"category": "...", "priority": "..."}`; la model card declara un 100 % de respuestas JSON validas en test.
- Razonamiento sobre quien esta afectado, si el usuario puede seguir trabajando y si hay plazos, que es como se define la prioridad en los datos de entrenamiento.
- Comprension de textos con ruido: estilos coloquiales, errores tipograficos, peticiones secundarias no relacionadas y vocabulario ambiguo entre categorias.
- Capacidades de generacion de texto y conversacion heredadas del modelo base Granite 3.3 2B Instruct (la model card no detalla tool calling, agentes ni modo thinking para este adaptador).
- No soporta otros idiomas distintos del ingles ni entradas que no sean tickets de soporte IT: segun el autor, el modelo siempre responde con una de las etiquetas fijas aunque ninguna encaje.

## Casos de uso

- Triaje de primera pasada en mesas de ayuda: el modelo recibe asunto y cuerpo de un ticket y propone cola y prioridad en JSON, que un agente humano confirma antes de enrutar. Es adecuado por su alta precision en categoria (0,9975) y su salida estructurada sin necesidad de reparacion.
- Enrutamiento automatico a colas especializadas: integrado en un sistema de ticketing (Jira Service Management, ServiceNow, Zendesk), el JSON de categoria se mapea directamente a la cola correspondiente (Hardware, Network, Security, etc.).
- Priorizacion inicial de la cola: la etiqueta de prioridad permite ordenar la bandeja de entrada y destacar tickets Critical o High, con revision humana dado que la precision de prioridad es menor (0,7327) que la de categoria.
- Clasificacion por lotes de tickets historicos: procesar volcados de tickets antiguos para poblar analiticas de categoria y prioridad, aprovechando que el modelo es pequeno (2B) y puede ejecutarse en hardware modesto.
- Filtro previo en pipelines de seguridad: detectar tickets de la categoria Security (phishing, malware, dispositivos perdidos, exposicion de datos) para escalarlos a un flujo especifico, siempre con validacion humana y sin sustituir la respuesta a incidentes.
- Referencia para ajuste fino de modelos pequenos: el repositorio incluye codigo de generacion de datos, entrenamiento y evaluacion, y sirve como plantilla reproducible de QLoRA con evaluacion antes/despues en una T4.
- Prototipado y pruebas de concepto: al ser un adaptador de 0,1 GB sobre un modelo de 2B, permite validar rapidamente la viabilidad de un asistente de triaje antes de invertir en datos reales y anotacion.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test (404 tickets) del dataset sintetico `shreyabatra6/it-ticket-triage`. Todas las filas de LLM usan el mismo prompt y decodificacion greedy; una respuesta solo cuenta si la salida completa es JSON valido con etiquetas conocidas, sin reparacion posterior. Los valores `verified: false` indican que no han sido verificados de forma independiente.

| Modelo | Cat Acc | Cat F1 | Prio Acc | Prio F1 | Exact Match | Valid JSON % |
|---|---:|---:|---:|---:|---:|---:|
| Adaptador LoRA (este modelo) | 0,9975 | 0,9977 | 0,7327 | 0,7238 | 0,7302 | 100,0 |
| Modelo base zero-shot | no disponible | no disponible | no disponible | no disponible | 0,502 | 99,8 |
| Baseline TF-IDF + regresion logistica | no disponible | no disponible | no disponible | no disponible | 0,678 | no disponible |

La model card solo proporciona las metricas completas del adaptador; para el modelo base y el baseline TF-IDF unicamente se citan el exact match (50,2 % y 67,8 % respectivamente) y, en el caso del base, el porcentaje de JSON valido (99,8 %). El resto de celdas se marcan como no disponibles porque no figuran en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Como referencia, el entrenamiento QLoRA en 4 bits completo cupo en una Tesla T4 de 14,6 GB; la inferencia del adaptador sobre el modelo base de 2B en 4 bits deberia requerir bastante menos memoria, pero no se publica una cifra concreta.
- GPU recomendadas: no disponibles en la informacion proporcionada. El autor solo documenta el entrenamiento en 1x Tesla T4 (14,6 GB).
- Cabe en GPU de consumo: no confirmado en la informacion disponible; por el tamano del modelo base (2B) es plausible en GPUs de consumo con cuantizacion, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: el adaptador es un artefacto PEFT (`library_name: peft`) que se carga con la libreria `peft` junto al modelo base `ibm-granite/granite-3.3-2b-instruct`. La model card no detalla soporte para vLLM, llama.cpp, Ollama o TGI. Existe un modelo fusionado publicado aparte (`shreyabatra6/granite-3.3-2b-instruct-it-ticket-triage`) que puede facilitar el despliegue.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Granite 3.3 2B + LoRA) | 2,56 B base + 28,18 M adaptador | no disponible | Ajuste fino QLoRA para triaje de tickets IT | apache-2.0 | Hugging Face (adaptador y modelo fusionado) |
| `ibm-granite/granite-3.3-2b-instruct` (base) | 2,56 B | no disponible | Modelo instructivo generalista | apache-2.0 | Hugging Face |
| Baseline TF-IDF + regresion logistica | no aplica (modelo clasico) | no aplica | Clasificacion supervisada clasica | no disponible | Referencia interna del autor |

La comparativa se limita a estos tres elementos porque la informacion proporcionada no incluye otros adaptadores o modelos especializados en triaje de tickets IT con los que contrastar. En exact match, el adaptador (73,0 %) supera al baseline TF-IDF (67,8 %) y al modelo base zero-shot (50,2 %); no hay datos de categoria ni prioridad desglosados para los dos ultimos.

## Limitaciones y advertencias

- Datos de entrenamiento completamente sinteticos: el rendimiento en tickets reales puede diferir del reportado, ya que las plantillas sinteticas no capturan toda la variabilidad del lenguaje real de una mesa de ayuda.
- Solo ingles: no se ha entrenado ni evaluado en otros idiomas; la model card excluye explicitamente tickets en idiomas distintos del ingles.
- Entradas fuera de dominio: el modelo siempre responde con una de las etiquetas fijas aunque ninguna encaje, lo que puede producir clasificaciones erroneas silenciosas en entradas que no son tickets IT.
- Precision de prioridad limitada: 0,7327 de accuracy y 0,7238 de macro-F1, muy por debajo de la categoria (0,9975); no es adecuado para decisiones finales de prioridad o SLA sin revision humana.
- Sesgos: no documentados en la informacion proporcionada; al derivarse de plantillas escritas a mano, pueden heredar los sesgos de esas plantillas.
- Riesgo de alucinacion: mitigado parcialmente por el formato JSON estricto y las etiquetas cerradas, pero la model card no reporta una evaluacion especifica de alucinacion fuera de la tasa de JSON valido.
- Restricciones de uso: el autor declara fuera de alcance la respuesta a incidentes de seguridad, las decisiones finales de prioridad o SLA sin revision y cualquier uso con entradas que no sean tickets de soporte IT.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Granite 3.3 2B Instruct de IBM, que se distribuye tambien bajo Apache 2.0 segun la informacion disponible.
- Metricas no verificadas: los resultados del model-index figuran con `verified: false`, es decir, no han sido comprobados de forma independiente.
- Artefacto PEFT: requiere cargar el modelo base por separado o usar el modelo fusionado; no es un modelo autonomo listo para usar directamente con cualquier runtime.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/shreyabatra6/granite-3.3-2b-instruct-it-ticket-triage-lora
- Modelo fusionado: https://huggingface.co/shreyabatra6/granite-3.3-2b-instruct-it-ticket-triage
- Modelo base: https://huggingface.co/ibm-granite/granite-3.3-2b-instruct
- Dataset sintetico: https://huggingface.co/datasets/shreyabatra6/it-ticket-triage
- Codigo (generacion de datos, entrenamiento y evaluacion): https://github.com/ShreyaBatra6/it-ticket-triage-lora
- Paper QLoRA (arXiv 2305.14314): https://arxiv.org/abs/2305.14314
- Paper LoRA (arXiv 2106.09685): https://arxiv.org/abs/2106.09685
