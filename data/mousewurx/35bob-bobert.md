# MouseWurX/35Bob-Bobert

## Resumen

35Bob Bobert es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.6-35B-A3B, desarrollado por MouseWurX dentro del proyecto Bob, un agente de IA de código abierto orientado a ejecución local. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con unos 35.107 millones de parámetros totales y aproximadamente 3.000 millones activos por token, entrenado específicamente para el uso de herramientas (tool-use) y el razonamiento agéntico dentro del ecosistema Bob.

Su relevancia es doble. Por un lado, demuestra una metodología de destilación y poda de expertos (REAP) documentada paso a paso, con el objetivo de ejecutar un modelo de 35B en tarjetas gráficas de consumo. Por otro, y de forma crítica, el propio autor ha marcado el modelo como "unintentionally poisoned": fue entrenado sobre versiones antiguas (v1 a v3) de los conjuntos de lecciones de Bob que posteriormente se descubrieron contaminados, con un 40% de resultados de herramientas inventados y un 23% de pasos incorrectos. El modelo se conserva únicamente con fines de estudio y el autor ya no lo distribuye como opción activa.

La ficha debe leerse, por tanto, como documentación de un artefacto con valor metodológico pero no recomendado para producción, dado el riesgo documentado de comportamiento errático en el uso de herramientas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en transformer, derivada de Qwen3.6-35B-A3B |
| Parámetros totales | 35.107.181.936 (unos 35,1 B) |
| Parámetros activos | aproximadamente 3 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q3_K_M y Q4_K_M publicados; safetensors en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un transformer con capas MoE en las que se conservan todos los expertos por capa (unos 35B de parámetros totales, 3B activos por token). Sobre esa base, el proyecto Bob aplica un pipeline documentado en el Forge journal: línea base medida primero, limpieza previa al entrenamiento, análisis, entrenamiento, poda por pasos con REAP (eliminación de los expertos con menor contribución medida sobre trazas reales), curación mediante destilación desde las probabilidades del modelo completo, verificación de que ningún objetivo de evaluación empeora, aprendizaje on-policy con recompensa por llamadas de herramienta que funcionan realmente, mezcla y publicación.

El ajuste se realizó sobre los conjuntos de lecciones de Bob (v1 a v3), que el autor describe como contaminados de forma no intencionada: de 5.788 lecciones principales de herramientas, solo 189 (un 3%) se consideraron correctas tal como estaban escritas; un 40% contenían resultados de herramienta inventados, un 28% arrastraban detalles privados extraídos del prompt y un 23% presentaban un paso de herramienta incorrecto. Además, las lecciones reforzaban hábitos posteriormente descartados, como delegar tareas en `ask_specialist` o escribir ficheros mediante `run_command`. No se han publicado datos sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF/DPO convencional; el autor menciona aprendizaje on-policy con recompensa por tool calls funcionales.

## Capacidades

- Generación de texto conversacional y razonamiento de tipo agéntico, orientado al bucle de un agente local.
- Uso de herramientas (tool calling) como capacidad central del ajuste, si bien el propio autor advierte que parte de ese comportamiento aprendido procede de datos contaminados.
- Razonamiento multi-paso dentro de flujos de agente, con soporte para encadenar llamadas a herramientas.
- Integración con el ecosistema Bob: el modelo se carga como "cerebro" del agente, con tarjetas `.bob.json` asociadas a cada GGUF.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio, thinking mode explícito ni decodificación especulativa.

## Casos de uso

- Estudio de metodologías de poda y destilación de MoE: el modelo sirve como caso práctico para analizar cómo se aplica REAP sobre trazas reales y cómo se mide el impacto de cada paso de curación, gracias a la documentación pública del Forge journal.
- Investigación sobre contaminación de datos en ajustes de tool-use: permite estudiar empíricamente qué efectos tiene entrenar con resultados de herramienta inventados y pasos incorrectos, y cómo se detectan mediante auditorías con modelos de mayor capacidad.
- Reproducción de pipelines de entrenamiento agéntico: el proyecto Bob publica protocolos, costes y registros, lo que facilita replicar el flujo completo sobre otras bases MoE.
- Evaluación de agentes locales en hardware de consumo: con cuantizaciones Q3_K_M (16,8 GB) y Q4_K_M (21,2 GB), permite probar el comportamiento de un agente de 35B en GPU de gama alta para consumidor, midiendo latencia y estabilidad.
- Docencia y formación en ingeniería de modelos: como ejemplo de lo que no debe hacerse con un dataset de instrucciones, útil para ilustrar la necesidad de auditorías y conjuntos de validación limpios.
- Pruebas de integración con el agente Bob: validar el ciclo de carga, descarga en reposo y reparto de GPU en red (Bob-Net) usando este modelo como cerebro de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18 GB para Q3_K_M y 23 GB para Q4_K_M, según la model card.
- GPU recomendadas: no se especifican modelos concretos; los requisitos de memoria apuntan a tarjetas de 24 GB (por ejemplo, RTX 3090 o RTX 4090) para Q4_K_M y a tarjetas de 20-24 GB para Q3_K_M.
- Cabe en GPU de consumo de gama alta con 24 GB de VRAM en ambas cuantizaciones publicadas; por debajo de 18 GB no hay variante documentada.
- Opciones de despliegue: los ficheros publicados son GGUF, por lo que son compatibles con llama.cpp y con el propio agente Bob; no se documenta soporte de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 35Bob Bobert | 35,1 B totales / ~3 B activos | no disponible | Apache 2.0 | GGUF y safetensors en HF | Ajuste para tool-use, marcado como contaminado por el autor |
| Qwen3.6-35B-A3B (base) | 35 B totales / ~3 B activos | no disponible | Apache 2.0 | HF | Modelo original de Alibaba; sin el ajuste de lecciones de Bob |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparación en la información proporcionada |

## Limitaciones y advertencias

- Contaminación documentada del entrenamiento: el autor marca el modelo como "unintentionally poisoned" por entrenar sobre las lecciones v1 a v3; el grado de afectación real no se ha medido en su laboratorio.
- Riesgo elevado de tool calls incorrectas: un 40% de las lecciones contenían resultados inventados y un 23% pasos erróneos, lo que puede traducirse en llamadas a herramientas con argumentos o secuencias incorrectas.
- Fuga potencial de información privada: un 28% de las lecciones arrastraban detalles privados extraídos del prompt, lo que introduce riesgo de reproducir ese comportamiento.
- Hábitos obsoletos: el modelo puede delegar en `ask_specialist` o escribir ficheros vía `run_command`, prácticas que el proyecto ha eliminado en sus versiones limpias.
- No recomendado para producción: el autor lo conserva únicamente para estudio y ha dejado de ofrecerlo como opción activa.
- Idiomas y longitud de contexto no documentados, lo que impide garantizar comportamiento multilingüe o ventanas largas.
- Riesgo de alucinación agravado por el sesgo del dataset de entrenamiento hacia resultados fabricados.
- Licencia Apache 2.0 permite uso comercial, pero las advertencias del autor desaconsejan su despliegue; las lecciones originales son CC BY-SA 4.0.
- Los nombres "Bob" son un homenaje a las novelas de Dennis E. Taylor; el proyecto no está afiliado al autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MouseWurX/35Bob-Bobert
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Dataset de lecciones de Bob: https://huggingface.co/datasets/MouseWurX/bob-lessons
- Repositorio del proyecto Bob: https://github.com/MouseWurX/Bob
- Forge journal: https://github.com/MouseWurX/Bob/blob/main/app/docs/FORGE-JOURNAL.md
- Guía de Forge: https://github.com/MouseWurX/Bob/blob/main/app/model-lab/forge/README.md
- Guía para hacer modelos más pequeños: https://github.com/MouseWurX/Bob/blob/main/app/docs/MAKING-SMALLER-MODELS.md
- Guía de usuario: https://github.com/MouseWurX/Bob/blob/main/app/docs/USER-GUIDE.md
- Página de costes: https://github.com/MouseWurX/Bob/blob/main/app/docs/COSTS.md
- Hoja de ruta: https://github.com/MouseWurX/Bob/pull/230
