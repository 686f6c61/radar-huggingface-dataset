# rayline-ai/ARC-1.0

## Resumen

ARC 1.0 (Adaptive Routing Controller) es un modelo de decisión desarrollado por rayline-ai, afinado a partir de Qwen/Qwen3.5-0.8B, cuyo propósito no es generar texto conversacional sino producir señales estructuradas para enrutar peticiones de agentes de IA entre distintos modelos (en la nube o en local) y distintos niveles de esfuerzo de razonamiento. Con 615 millones de parámetros y licencia Apache 2.0, se posiciona como un componente de infraestructura dentro de un stack de agentes, no como un modelo de propósito general.

El modelo predice la probabilidad de éxito de cada modelo candidato, estima el consumo de tokens (entrada no cacheada, lecturas y escrituras de caché, salida), evalúa la calidad y el coste esperado de distintos ajustes de razonamiento, detecta información personal identificable (PII) y clasifica la petición por operación y dominio. La aplicación combina estas señales con sus propios precios y políticas para decidir qué modelo atiende la siguiente petición.

Su relevancia actual radica en que separa predicción de política: los predictores no necesitan reentrenamiento cuando cambian los precios o el pool de modelos, siempre que el modelo y la configuración de servicio permanezcan fijos. Incluye dos presets (Sage, con V = 4.5, y Swift, con V = 0.1) y un modo prefer-local con umbral configurable, pensados para despliegues híbridos entre edge y nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (finetune de Qwen/Qwen3.5-0.8B; tag `qwen3_5`) |
| Parámetros totales | 615.054.751 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo incluye safetensors y GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un finetune del checkpoint Qwen/Qwen3.5-0.8B, por lo que hereda la arquitectura transformer de la familia Qwen 3.5, aunque la model card no detalla la configuración interna (número de capas, dimensiones, mecanismo de atención). El tag `qwen3_5` y el tamaño real de 615 millones de parámetros confirman la base, pero no se especifican innovaciones arquitectónicas adicionales.

En cuanto a los datos, la única referencia explícita es el dataset nvidia/Nemotron-PII, empleado presumiblemente para la cabeza de detección de PII. No se documentan el número total de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card sí describe la estructura funcional: el modelo incorpora una cabeza de pregunta de propósito general que recibe una pregunta y un conjunto de opciones de respuesta y devuelve probabilidades, entrenada principalmente para decisiones de enrutamiento y tareas de decisión más amplias. También se menciona una evaluación de detección de PII y categorización de peticiones sobre un dataset interno con usuarios separados, aunque el texto de la model card aparece truncado en ese punto.

## Capacidades

- Predicción de éxito por modelo: estima la probabilidad de que un modelo candidato complete la tarea.
- Estimación de uso de tokens: entrada no cacheada, lecturas de caché, escrituras de caché y salida.
- Evaluación de razonamiento: compara el beneficio esperado y el coste de distintos ajustes de esfuerzo de razonamiento dentro de un mismo modelo.
- Detección de PII: identifica la presencia y los tipos de información sensible en la entrada.
- Categorización de peticiones: clasifica operaciones y dominios solicitados, con soporte de múltiples etiquetas.
- Señales definidas por el desarrollador: cabeza de pregunta general con probabilidades sobre opciones de respuesta.
- Integración con vLLM como librería de despliegue.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y código personalizado (`custom-code`).
- Capacidad conversacional declarada en los tags, orientada a la lectura de conversaciones de agentes.
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Enrutamiento híbrido edge-nube en agentes: el modelo lee la conversación y predice qué modelo elegible maximiza el éxito menos el coste esperado, permitiendo enviar peticiones sencillas a modelos locales y reservar los caros para tareas complejas.
- Control de costes en producción: con la estimación de tokens cacheados y no cacheados, la aplicación puede aplicar sus propias tarifas y decidir si conviene una llamada a un modelo premium o una alternativa más barata.
- Preselección de esfuerzo de razonamiento: para modelos que exponen niveles de razonamiento configurables, ARC compara el beneficio esperado frente al coste y selecciona el ajuste adecuado por petición.
- Cumplimiento y privacidad: la cabeza de detección de PII permite identificar información sensible antes de enviar la petición a un proveedor externo, redactarla o forzar ejecución local.
- Clasificación de intenciones en pipelines de agentes: la categorización multi-etiqueta de operaciones y dominios sirve para dirigir peticiones a herramientas, subagentes o colas de trabajo especializadas.
- Políticas personalizadas de enrutamiento: equipos que quieran definir su propia función de utilidad pueden usar la cabeza de pregunta con sus opciones y umbrales, sin reentrenar los predictores al cambiar precios.
- Despliegue prefer-local con umbral de confianza: en entornos con DGX Spark u otros nodos locales, el modo prefer-local usa el modelo local cuando supera un umbral de éxito predicho (por ejemplo, 0,85) y recurre a la nube en caso contrario.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a configuraciones de enrutamiento (ARC Sage, ARC Swift, prefer-local) sobre un pool de modelos, no al modelo aislado. Se reproducen a continuación.

Comparación de éxito por tarea y coste relativo frente a Opus 5.5 (ARC Sage):

| Benchmark | Éxito Opus 5.5 | Éxito ARC Sage | Coste ARC / baseline |
|---|---|---|---|
| DeepSWE | 69,9% | 68,7% | 7% |
| Terminal-Bench 2.1 | 91,0% | 92,4% | 58% |
| SWE-Atlas QA | 61,6% | 62,4% | 13% |
| MMMU-Pro Vision | 82,2% | 82,9% | 39% |
| GPQA Diamond | 89,9% | 94,1% | 21% |
| Tau3 Banking | 42,8% | 33,2% | 17% |

Índice de enrutamiento de RouteBench (escala 0-10, mayor es mejor):

| Router | DeepSWE | SWE-Atlas QA | Terminal-Bench 2.1 | Tau3 Banking | MMMU-Pro Vision | Media |
|---|---|---|---|---|---|---|
| ARC Sage | 9,6 | 9,1 | 10,0 | 7,7 | 10,0 | 9,3 |
| ARC Swift | 9,7 | 8,5 | 10,0 | 7,5 | 10,0 | 9,1 |
| OpenRouter Auto | 8,8 | 8,6 | — | 9,0 | 8,8 | — |
| OpenRouter Auto Code | 8,5 | 8,7 | — | 8,9 | 9,7 | — |
| OpenRouter Jev (medium) | 9,0 | 8,2 | — | 7,4 | 9,4 | — |
| Pareto | 9,9 | 9,1 | 10,0 | 8,0 | 8,9 | 9,2 |
| Fugu Max | 4,7 | 7,0 | 8,2 | 6,5 | 9,0 | 7,1 |
| Fugu Ultra v2 | — | 7,6 | — | 6,3 | 8,1 | — |

Modo prefer-local (umbral 0,85, V = 4,5, DeepSeek V4.1 Flash sobre varios DGX Spark):

| Benchmark | Éxito Opus 5.5 | Éxito ARC prefer-local | Coste ARC / Opus |
|---|---|---|---|
| DeepSWE | 69,9% | 72,3% | 1,1% |
| Terminal-Bench 2.1 | 90,7% | 90,5% | 75,7% |
| SWE-Atlas QA | 61,6% | 62,6% | 1,6% |
| Tau3 Banking | 42,8% | 35,3% | 17,3% |
| GPQA Diamond | 89,5% | 92,5% | 12,3% |
| MMMU-Pro Vision | 82,2% | 82,7% | 40,9% |

Según la model card, la configuración híbrida conserva el 97,5% de la calidad de Opus 5.5 con un 92,9% menos de coste. No se publican métricas intrínsecas del modelo (precisión de clasificación, calibración de la predicción de éxito o latencia de inferencia).

## Requisitos de hardware

- VRAM estimada: con 615 millones de parámetros, en FP16 requiere aproximadamente 1,2 GB de pesos, más overhead de activaciones y caché KV; en cuantizaciones de 8 bits o 4 bits el peso baja de 1 GB, aunque no se documentan los tipos de cuantización disponibles.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM debería acomodar el modelo en FP16; para lotes grandes o despliegues con vLLM se recomienda una A100, H100 o L40S por throughput.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y superiores, y probablemente en iGPU con suficiente memoria compartida en cuantización.
- Despliegue: vLLM (librería declarada en el repo), llama.cpp u Ollama mediante los pesos GGUF, y servidores compatibles con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo de 0,6B, se espera una latencia baja por petición, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ARC 1.0 | 615 M | no disponible | Enrutamiento y decisión para agentes | Apache 2.0 | Hugging Face, GGUF, vLLM |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Modelo generativo de propósito general | no disponible | Hugging Face |
| OpenRouter Auto | no disponible (servicio) | no disponible | Enrutamiento gestionado | servicio propietario | API de OpenRouter |
| Pareto | no disponible (servicio) | no disponible | Enrutamiento gestionado | servicio propietario | Plataforma Pareto |

ARC 1.0 se distingue de los enrutadores gestionados (OpenRouter Auto, Pareto) por ser un modelo abierto y desplegable localmente cuyas predicciones se combinan con la política de precios del propio operador. Frente a su modelo base Qwen3.5-0.8B, ARC no está optimizado para generar respuestas, sino para emitir señales de decisión estructuradas.

## Limitaciones y advertencias

- No es un modelo generativo de propósito general: usarlo para conversación o generación de texto produciría resultados pobres; su función es clasificar y predecir.
- Solo declara soporte de inglés; el rendimiento en otros idiomas no está documentado.
- La model card no especifica la longitud de contexto, lo que limita la planificación para conversaciones de agente muy largas.
- Los benchmarks publicados miden configuraciones de enrutamiento completas sobre pools de modelos concretos (DeepSeek V4.1 Flash, Opus 5.5, DGX Spark); no son extrapolables a otros pools, precios o umbrales.
- En Tau3 Banking el éxito cae frente a la referencia (33,2% en Sage y 35,3% en prefer-local frente a 42,8% de Opus 5.5), lo que indica que el enrutamiento no es uniformemente superior en todas las tareas.
- La calibración de la probabilidad de éxito y la detección de PII se evalúan sobre un dataset interno cuyo detalle aparece truncado en la model card; no hay métricas públicas de precisión o recall.
- Riesgo de alucinación en las señales: una predicción de éxito demasiado optimista puede derivar tráfico a un modelo inadecuado; se recomienda monitorizar la calidad real frente a la predicha.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B debe verificarse por separado para confirmar compatibilidad de licencias en producción.
- El tag `custom-code` implica que la carga del modelo requiere código remoto; conviene auditar ese código antes de desplegarlo en entornos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rayline-ai/ARC-1.0
- Informe técnico: https://static.rayline.ai/rayline/reports/arc/latest
- Documentación: https://docs.rayline.ai
- Repositorio de la CLI: https://github.com/rayline-ai/rayline-cli
- Sitio de Rayline: https://rayline.ai
- Dataset de PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
