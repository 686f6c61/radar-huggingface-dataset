# quantumaikr/max-0.1b-aimax-router

## Resumen

max-0.1b-aimax-router es un modelo de clasificación de intenciones y enrutamiento de peticiones, desarrollado por quantumaikr, derivado del modelo base max-0.1b-v1. Su función es recibir una solicitud de tarea en coreano (una línea de texto más el tipo de adjunto) junto con una lista de funciones definida en el turno de sistema y devolver un JSON pequeño con la función seleccionada y los requisitos asociados (`action`, `needs`, `urgency`, `follow_up`, `batchable`). Con 109.531.392 parámetros, es un modelo compacto orientado a una tarea muy acotada dentro de una arquitectura de agentes o de un sistema de orquestación de herramientas.

El modelo se publica en formato GGUF (cuantización Q4_K_M y f16) y está pensado para ejecutarse en entornos con recursos limitados, actuando como primera capa de decisión antes de invocar motores o funciones más costosas. Su relevancia radica en la especialización: en lugar de competir en capacidades generales, resuelve un problema concreto de enrutamiento con un coste computacional mínimo y una latencia baja, lo que permite integrarlo en pipelines de atención al usuario o de automatización de tareas.

La versión publicada es una vista previa (preview) destinada a pruebas en sombra y a validar el formato de prompt antes de la publicación de la versión final, que mantendrá el mismo formato. El modelo está entrenado únicamente con datos sintéticos y variantes de estilo, sin datos reales de usuarios, y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 109.531.392 (0,1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M, f16 |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo (tipo de transformer, número de capas, dimensiones de atención o mecanismo de atención). El modelo deriva de max-0.1b-v1 y se ha cuantizado a GGUF en dos variantes, Q4_K_M y f16, lo que sugiere un diseño orientado a inferencia eficiente en CPU o GPU de gama baja.

En cuanto al entrenamiento, la model card indica que se utilizaron datos sintéticos combinados con variantes de frases en múltiples estilos de habla, imitando lenguaje humano, y que no se emplearon datos reales de miembros. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La tarea está formulada como generación de texto condicionada por un formato de prompt concreto: el turno de sistema contiene líneas con el formato `id|description|needs`, y el modelo debe producir un JSON con los campos de decisión.

## Capacidades

- Clasificación de intención y enrutamiento: selecciona una función de una lista proporcionada en el prompt y devuelve su identificador.
- Salida estructurada en JSON con los campos `action`, `needs`, `urgency`, `follow_up` y `batchable`.
- Detección de requisitos (`needs`) a partir de la descripción de cada función en la lista.
- Estimación de urgencia y de necesidad de seguimiento (follow-up) de la petición.
- Indicación de si la tarea es procesable en lote (`batchable`).
- Procesamiento de solicitudes en coreano con distintos registros y estilos de habla.
- Integración en pipelines de agentes como capa de decisión previa a la ejecución de herramientas.
- No se documentan capacidades de razonamiento multi-paso, tool calling nativo, visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Enrutamiento de peticiones en atención al cliente: el modelo recibe la consulta del usuario y la lista de funciones disponibles del sistema, y devuelve qué función debe atenderla, lo que permite dirigir la conversación al flujo o al motor adecuado sin intervención humana.
- Orquestación de agentes con múltiples herramientas: actúa como router de bajo coste que decide qué herramienta invocar antes de que un modelo mayor ejecute la tarea, reduciendo el número de llamadas a modelos grandes.
- Triaje de solicitudes internas: en un sistema de tickets, clasifica cada petición según el equipo o servicio responsable y marca la urgencia, lo que facilita la priorización automática.
- Detección de tareas por lotes: el campo `batchable` permite agrupar solicitudes que pueden procesarse de forma asíncrona, optimizando el uso de recursos en pipelines de procesamiento masivo.
- Pruebas en sombra de sistemas de decisión: al ser una vista previa, permite validar el formato de prompt y la calidad de las decisiones en paralelo al sistema en producción antes de sustituirlo.
- Despliegue en entornos con recursos limitados: con 0,1B parámetros y cuantización Q4_K_M, puede ejecutarse en CPU o en GPUs de consumo para tareas de clasificación de alta frecuencia y baja latencia.
- Filtrado previo en asistentes conversacionales: determina si una consulta requiere seguimiento (`follow_up`) y con qué urgencia, lo que permite decidir si se escala a un agente humano o a un modelo de mayor capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de "점수" (puntuaciones) junto con los archivos de vista previa, pero no se incluyen cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 109,5M de parámetros, la cuantización Q4_K_M ocupa aproximadamente 60-70 MB y la variante f16 alrededor de 220 MB, por lo que cabe holgadamente en cualquier GPU de consumo y en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria, incluidas RTX 3060, RTX 4090, A100 o H100; el modelo no requiere GPU dedicada.
- Cabe en GPU de consumo: sí, en todas las GPU consumer actuales e incluso en sistemas integrados.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar.
- Latencia y throughput estimados: no disponibles; por el tamaño del modelo, se espera una latencia muy baja en CPU y prácticamente despreciable en GPU, aunque no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de enrutamiento de intenciones en coreano con este tamaño y licencia. La comparación con alternativas genéricas de 0,1B-0,5B parámetros no puede realizarse con datos verificables a partir de la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| max-0.1b-aimax-router | 109,5M | no disponible | Apache-2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es una versión preview: la model card indica que está destinada a operación en sombra y a pruebas de funcionalidad antes de la publicación de la versión final; no debe usarse como sistema definitivo en producción.
- El modelo solo soporta coreano; las peticiones en otros idiomas no están cubiertas.
- El campo `needs` debe tomarse de la lista de funciones del prompt; se recomienda una compuerta de verificación cruzada (cross-check gate) para validar la coherencia de la salida.
- Las unidades y los segundos se rellenan por reglas externas, no por el modelo, por lo que la salida JSON no es completamente autónoma.
- Al estar entrenado con datos sintéticos, puede presentar un comportamiento deficiente ante distribuciones de lenguaje real muy distintas de las variantes simuladas.
- Riesgo de alucinación en la selección de funciones cuando la lista del prompt es ambigua o cuando la petición no encaja claramente en ninguna función.
- No se documentan sesgos específicos, pero al ser un modelo especializado en coreano y entrenado con datos sintéticos, su cobertura sociolingüística es limitada.
- La licencia Apache-2.0 permite uso comercial, pero la naturaleza de vista previa y la ausencia de benchmarks publicados desaconsejan su uso en producción sin una evaluación propia.

## Enlaces

- [Hugging Face: quantumaikr/max-0.1b-aimax-router](https://huggingface.co/quantumaikr/max-0.1b-aimax-router)
- [Modelo base: quantumaikr/max-0.1b-v1](https://huggingface.co/quantumaikr/max-0.1b-v1)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
