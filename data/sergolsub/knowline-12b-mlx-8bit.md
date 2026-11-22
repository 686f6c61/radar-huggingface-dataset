# sergolsub/knowline-12B-MLX-8bit

## Resumen

KnowLine-12B-MLX-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo PelaAI/KnowLine-12B-Gen1, publicada por el usuario sergolsub. No se trata de un modelo entrenado desde cero, sino de una redistribución optimizada para su ejecución en Apple Silicon mediante la librería `mlx_lm`. El modelo base tiene 12.000 millones de parámetros y está orientado a tareas de decisión estructurada (clasificación booleana, elección entre categorías y puntuación de severidad) en lugar de generación de texto libre.

La relevancia de esta conversión radica en que permite ejecutar un modelo de 12B en hardware de consumo de Apple con un consumo de memoria moderado: según las mediciones del autor en un Mac mini M4 Pro con 48 GB de RAM unificada, el modelo ocupa 12,76 GB en disco y alcanza un pico de 14,44 GB de memoria residente durante la inferencia. La latencia medida es de 1748 ms de mediana por decisión, con un rendimiento sostenido de 0,91 decisiones cortas por segundo.

La información pública disponible es muy limitada: la model card no detalla la arquitectura interna del modelo base, los datos de entrenamiento ni los idiomas soportados. La licencia es Apache 2.0, heredada de los pesos originales, y la conversión no introduce reentrenamiento ni cambios arquitectónicos, solo cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base PelaAI/KnowLine-12B-Gen1; la conversión no altera la arquitectura) |
| Parametros totales | 12B (según el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); el modelo base estaría disponible presumiblemente en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en layout MLX, más `config.json`, tokenizer, `chat_template.jinja`, `*_mlx.py`, `decision_config.json`, `joint_config.json` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base PelaAI/KnowLine-12B-Gen1 en la documentación proporcionada. La model card de la conversión indica explícitamente que no se ha realizado reentrenamiento ni modificación de la arquitectura: únicamente se aplicó cuantización a 8 bits para el formato MLX. El nombre del modelo sugiere una arquitectura transformer de 12.000 millones de parámetros, pero este dato no está confirmado en la información disponible.

Tampoco se detallan los datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card menciona la existencia de una "decision mode" con cabezas de decisión específicas (`decision_config.json`, `joint_config.json`), lo que indica que el modelo base incorpora un mecanismo de salida estructurada para tareas de clasificación y puntuación, pero no se describe su funcionamiento interno.

## Capacidades

- Decisión booleana (tipo `noul`): responde preguntas de sí/no sobre un texto de entrada, por ejemplo si un cliente solicita un reembolso.
- Elección entre categorías (tipo `choice`): clasifica la entrada en una de las categorías definidas por el usuario con criterios descriptivos, por ejemplo asignar un ticket al equipo de facturación o de envíos.
- Puntuación de severidad (tipo `score`): asigna un valor dentro de una escala definida por el usuario, por ejemplo "cosmetic", "annoying" o "blocks".
- Procesamiento de texto de entrada en lenguaje natural con instrucciones y criterios personalizados por llamada.
- Cada tipo de tarea se invoca como una llamada independiente con su propio objeto de configuración.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni un modo "thinking".

## Casos de uso

- Triaje de tickets de soporte: el modelo puede clasificar cada incidencia entrante en el equipo adecuado (facturación, envíos, técnico) mediante el modo `choice`, con criterios definidos por el equipo de operaciones. Es adecuado porque evita la generación de texto libre y devuelve directamente la categoría.
- Detección de intención de reembolso: con el modo `noul`, se puede determinar si un mensaje de cliente expresa una solicitud de devolución antes de enrutarlo a un agente humano, reduciendo el tiempo de primera respuesta.
- Priorización de incidencias: el modo `score` permite asignar un nivel de severidad (por ejemplo "cosmetic", "annoying", "blocks") a errores de plataforma o exportaciones fallidas, alimentando colas de trabajo priorizadas.
- Moderación o filtrado de contenido: el modo booleano puede usarse para decidir si un texto cumple o no una política definida en las instrucciones, siempre que la política se exprese como una pregunta cerrada.
- Enrutamiento en pipelines de automatización: al ejecutarse localmente en Apple Silicon con 14,44 GB de pico de memoria, puede integrarse en flujos de trabajo de escritorio o en un Mac mini como servicio de clasificación sin depender de la nube.
- Etiquetado asistido de datos: el modelo puede preetiquetar grandes volúmenes de texto con categorías o puntuaciones definidas por el usuario, con una precisión medida del 87,8 % en la evaluación del propio autor, para su posterior revisión humana.
- Clasificación de errores en sistemas de CI/CD: el modo `choice` o `score` puede determinar si un fallo de build es de infraestructura, de código o de configuración, y su gravedad, antes de notificar al equipo correspondiente.

## Benchmarks y rendimiento

La model card incluye una evaluación propia del autor sobre la calidad tras la cuantización, comparando 8 bits frente a bf16:

| Metrica | 8 bits (MLX) | bf16 |
|---|---|---|
| Accuracy | 87,8 % | 86,7 % |
| Noul | 95,0 % | 95,0 % |
| Choice | 84,0 % | 80,0 % |
| Score | 80,0 % | 80,0 % |
| Perplejidad de calibración | 1,900 | 1,894 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos de rendimiento en hardware son: 12,76 GB en disco, 1,17 s de carga, 14,44 GB de pico de memoria residente, latencia mediana de 1748 ms por decisión y 0,91 decisiones cortas por segundo sostenidas en un Mac mini M4 Pro de 48 GB.

## Requisitos de hardware

- VRAM/RAM unificada estimada: 14,44 GB de pico medido en la configuración de referencia (Mac mini M4 Pro, 48 GB).
- Hardware recomendado: Apple Silicon con al menos 16 GB de memoria unificada; el autor ha validado el modelo en un M4 Pro con 48 GB.
- No es compatible con GPU NVIDIA ni con CUDA de forma nativa, ya que los pesos están en formato MLX.
- Despliegue: librería `mlx_lm` de Apple; el paquete incluye un cargador propio (`knowline_mlx.py`) que se importa tras descargar los pesos con `huggingface_hub`.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 1748 ms de mediana por decisión; throughput sostenido de 0,91 decisiones cortas por segundo en el hardware de referencia.
- Tiempo de carga: 1,17 s.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos de la misma categoría. El modelo base PelaAI/KnowLine-12B-Gen1 no tiene datos públicos de benchmarks ni de arquitectura en la documentación proporcionada, y no se identifican en la información disponible otros modelos de decisión estructurada de 12B con los que compararlo de forma fiable.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| KnowLine-12B-MLX-8bit | 12B | no disponible | Apache 2.0 | MLX 8 bits | Hugging Face (0 descargas) |
| PelaAI/KnowLine-12B-Gen1 | 12B | no disponible | Apache 2.0 | no disponible | Hugging Face (modelo base) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Información pública muy escasa: la model card no documenta arquitectura, contexto, idiomas ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para producción.
- El modelo está especializado en decisiones estructuradas; no se documentan capacidades de generación de texto libre, razonamiento complejo ni código.
- Riesgo de alucinación no evaluado: no se han publicado métricas de fiabilidad fuera de la evaluación propia del autor.
- Sesgos desconocidos: al no documentarse la composición del dataset de entrenamiento, no es posible evaluar sesgos de género, idioma o dominio.
- Idiomas soportados no disponibles: no se puede confirmar el rendimiento en castellano ni en otros idiomas distintos del inglés, que es el idioma de los ejemplos de la model card.
- La evaluación de calidad (87,8 % de accuracy) es interna del autor y no ha sido replicada de forma independiente; además, las métricas "noul", "choice" y "score" no se definen con precisión.
- Licencia Apache 2.0 permite uso comercial, pero la model card indica que, en caso de conflicto, prevalece la licencia del repositorio upstream.
- Dependencia exclusiva del ecosistema MLX y Apple Silicon: no es desplegable en infraestructura NVIDIA/CUDA sin una conversión adicional.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-22) es futura respecto a la información habitual disponible; conviene verificar la vigencia del repositorio.

## Enlaces

- Hugging Face (conversión MLX 8 bits): https://huggingface.co/sergolsub/knowline-12B-MLX-8bit
- Modelo base en Hugging Face: https://huggingface.co/PelaAI/KnowLine-12B-Gen1
- No se han encontrado en la información disponible papers, blogs, repositorios de código ni demos adicionales.
