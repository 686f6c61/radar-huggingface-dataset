# chenhaodev/stcc-checker-0.6b-GGUF

## Resumen

El modelo `stcc-checker-0.6b-GGUF`, desarrollado por chenhaodev, es un clasificador ternario de texto en chino diseñado para verificar criterios de triaje telefónico médico. Dado un fragmento de historia clínica de consulta telefónica y un criterio específico de los protocolos STCC (Standard Triage and Call Criteria), el modelo responde exclusivamente con `yes`, `no` o `unknown`. No selecciona protocolos, no asigna niveles de urgencia ni genera recomendaciones de actuación; esa lógica recae en un motor de reglas determinista externo (`stcc-mcp`), con el que se integra para producir un nivel L1–L5 de seguridad.

Se trata de un ajuste fino del modelo Qwen3-0.6B, con 596 millones de parámetros, publicado en formato GGUF y safetensors bajo licencia Apache-2.0. Su relevancia actual radica en que aborda un problema concreto en la automatización de triage médico: la verificación fiable de criterios dentro de un flujo determinista, reduciendo la latencia a unos 138 ms por criterio y permitiendo una auditoría completa de las decisiones. El modelo está pensado para ser usado con Ollama y requiere la desactivación del modo *thinking* (`"think": false`) para evitar respuestas vacías al cargarse directamente desde HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Qwen3-0.6B soporta hasta 32.768 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | Q8_0, Q4_K_M |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (también safetensors en el repositorio) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer Qwen3-0.6B, una arquitectura de decoder-only con atención causal estándar. El proceso de entrenamiento no se documenta en detalle en la model card: no se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. Lo que sí se describe es que el modelo se entrena para la tarea de clasificación ternaria sobre criterios de protocolos STCC, con un dataset que incluye registros de consulta médica y sus correspondientes criterios. La model card reporta que una parte de los registros de prueba aparecen en el conjunto de entrenamiento (28% en el split `test_seen`), y que el rendimiento sobre registros nunca vistos se mantiene estable, con una ganancia de memoria de solo +1,64 puntos porcentuales.

El modelo está diseñado para operar como un componente de verificación dentro de un pipeline determinista: el motor `stcc-mcp` recorre ramas de protocolos y consulta al modelo por cada criterio. La salida `unknown` es un estado de primera clase, ya que en la lógica de ramificación de STCC, la ausencia de mención en un registro no equivale a una respuesta negativa. La model card también detalla el uso de un umbral de probabilidad `P(no) ≥ τ` en lugar de `argmax` para la decisión final, con un valor por defecto de τ = 0,63, ajustado para minimizar falsos negativos (`false_no`), que son el error crítico en este dominio.

## Capacidades

- Clasificación ternaria estricta: dado un fragmento de registro de consulta y un criterio, devuelve exclusivamente `yes`, `no` o `unknown` (una sola palabra).
- Verificación de criterios de protocolos de triage telefónico (protocolos STCC), no de generación de texto libre.
- Integración con el motor de reglas determinista `stcc-mcp` para producir una clasificación de urgencia L1–L5 con trazabilidad completa (citas de criterios y ramas).
- Soporte de razonamiento *multi-turno* dentro del pipeline: el motor puede consultar al modelo repetidamente para distintos criterios de una misma rama.
- No soporta *tool calling*, ni generación de texto conversacional, ni capacidades multimodales.
- Soporte de cuantización GGUF para despliegue eficiente en CPU y GPU de consumo.
- Requiere desactivación explícita del modo *thinking* de Qwen3 en Ollama para evitar respuestas vacías.

## Casos de uso

- **Triage telefónico automatizado en servicios de salud**: el modelo verifica criterios de protocolos STCC sobre el registro de una llamada de un paciente. Por ejemplo, ante el registro "我发烧到39度，浑身酸痛" y el criterio "发热", el modelo responde `yes`, permitiendo al motor de reglas avanzar por la rama correspondiente.
- **Auditoría de calidad de atención médica**: permite comprobar automáticamente si las historias clínicas telefónicas cumplen los criterios de los protocolos establecidos, generando informes de adherencia a los procedimientos.
- **Sistema de apoyo a operadores de línea de salud**: un operador humano introduce el registro de la llamada y el modelo le indica qué criterios se cumplen o faltan, reduciendo el tiempo de decisión y la variabilidad entre operadores.
- **Automatización de flujos de derivación en telemedicina**: integrado en una plataforma de teleconsulta, el modelo clasifica cada consulta en un nivel de actuación (L1–L5) tras un ciclo de preguntas guiadas, derivando al paciente al recurso adecuado (ambulancia, urgencias, cita ambulatoria).
- **Investigación en protocolos de triage**: permite evaluar empíricamente qué criterios de los protocolos STCC se cumplen con mayor frecuencia en poblaciones reales, a partir de registros de consulta anonimizados.
- **Entrenamiento de nuevos operadores**: el modelo puede generar ejercicios de clasificación de criterios a partir de registros de ejemplo, ayudando a los profesionales a familiarizarse con los protocolos de forma interactiva.

## Benchmarks y rendimiento

La model card reporta resultados de precisión, tasa de falsos negativos (`false_no`) y recall de `no` en varios splits de evaluación, incluyendo una versión cuantizada Q4_K_M:

| Split | n | acc | false_no | no_recall |
|---|---|---|---|---|
| test_unseen (protocolos no vistos) | 3.224 | 0,9529 | 0,0024 | 0,9784 |
| test_seen · new_record (protocolos vistos, registros nuevos) | 1.251 | 0,9528 | 0,0000 | 0,9286 |
| test_seen · seen_record (protocolos y registros vistos) | 487 | 0,9692 | 0,0000 | 0,9861 |
| Q4_K_M · test_unseen | 3.224 | 0,9498 | 0,0035 | 0,9770 |

Se reporta además un análisis de sensibilidad del umbral `τ` para la decisión de `no`, en el que el valor por defecto de 0,63 ofrece un `false_no` de 0,0000 con un `no_recall` de 0,9027. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene 596 millones de parámetros. En cuantización Q8_0, el archivo GGUF ocupa aproximadamente 640 MB (según la model card, el pull de Ollama descarga 640 MB); en Q4_K_M, el peso es menor.
- VRAM estimada: con Q8_0, ~1 GB; con Q4_K_M, ~0,5 GB. Cabe en cualquier GPU de consumo con 4 GB de VRAM o más, y también se ejecuta en CPU.
- GPUs recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, RTX 3060 o superior), o una GPU integrada de Apple Silicon (el rendimiento reportado se obtuvo en un Mac con Ollama).
- Opciones de despliegue: Ollama, llama.cpp, y servidores compatibles con GGUF. El modelo se puede cargar con `ollama pull hf.co/chenhaodev/stcc-checker-0.6b-GGUF:Q8_0`.
- Rendimiento medido (en Mac con Ollama, Q8_0): latencia por criterio de 138 ms de mediana (p90 140 ms); throughput de 7,2 / 24,2 / 34,5 criterios/s con concurrencia 1 / 4 / 8; tiempo de arranque en frío de 1,8 s; latencia end-to-end de 1,3 s para una consulta completa con 9 criterios.

## Comparativa con modelos similares

No se han publicado comparaciones directas con otros modelos de clasificación de triage en la información disponible. El modelo base Qwen3-0.6B es un LLM generalista, no específico para el dominio médico, y no existe un punto de referencia público para esta tarea concreta. No disponible.

## Limitaciones y advertencias

- **No es un sistema de diagnóstico ni de urgencias**: no sustituye a un médico, y no debe utilizarse para decisiones de emergencia. La model card indica que, ante una urgencia real, se debe llamar al 120 (servicio de emergencias).
- **No selecciona el protocolo**: el modelo solo verifica criterios individuales; la decisión de qué protocolo aplicar debe resolverla la capa de orquestación. Este paso no está incluido en el repositorio.
- **Fallo crítico con autodescripciones**: si la entrada es una sola frase de autodescripción (por ejemplo, "me duele la barriga"), el modelo produce un 97% de salidas concentradas en L1+L2, es decir, sin discriminación entre niveles de urgencia. Está diseñado para registros de consulta ya estructurados.
- **Dependencia de `think: false`**: al cargar el modelo directamente con `ollama pull hf.co/...`, se debe incluir `"think": false` en la petición; de lo contrario, el modelo devuelve una cadena vacía sin error.
- **Sesgo de idioma**: solo soporta chino (zh); no hay soporte para otros idiomas.
- **Límites de la calibración**: el umbral por defecto de `P(no) ≥ 0,63` es un punto de trabajo empírico, no una garantía estadística. Con la muestra de calibración disponible (495 positivos), el control de `false_no` al nivel 0,0036 solo es fiable con una probabilidad del 83,2%; el nivel realmente controlable es α ≈ 0,006.
- **Riesgo de alucinación**: aunque la model card no reporta casos, cualquier modelo de lenguaje puede generar respuestas incorrectas; en este dominio, un falso `no` puede excluir una rama de seguridad del flujo determinista.
- **Licencia**: Apache-2.0, permite uso comercial, pero el despliegue debe respetar los avisos de uso médico y la responsabilidad del orquestador.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/chenhaodev/stcc-checker-0.6b-GGUF
- Motor de reglas `stcc-mcp` (GitHub): https://github.com/devhc123/stcc-mcp
- Referencia al método de control de error tipo I (Tong et al., *Sci Adv* 2018, arXiv:1608.05031): https://arxiv.org/abs/1608.05031
- Modelo base Qwen3-0.6B en HuggingFace: https://huggingface.co/Qwen/Qwen3-0.6B
