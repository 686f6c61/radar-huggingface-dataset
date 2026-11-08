# purush0th/personaos-qwen3-4b-instruct-GGUF

## Resumen

PersonaOS Qwen3 4B Instruct (GGUF) es un ajuste fino del modelo Qwen3-4B-Instruct-2507 de Alibaba, publicado por el usuario purush0th. Está especializado en el uso de las herramientas de PersonaOS, un asistente personal autoalojado: recordatorios, planificador diario, notas, memorias, objetivos y un tablero de sprints. El modelo también aprende cuándo *no* debe invocar una herramienta, respondiendo de forma directa a preguntas simples, operaciones aritméticas o peticiones creativas.

Se distribuye únicamente como un fichero GGUF cuantizado en Q4_K_M de 2,5 GB, pensado para ejecutarse en una GPU de 6 GB o mediante Ollama. Su entrenamiento se basa en LoRA (rango 16) con Unsloth sobre 1.246 ejemplos extraídos de 582 conversaciones sintéticas generadas a través de la propia aplicación PersonaOS.

Es relevante porque ejemplifica el patrón de ajuste fino de un modelo pequeño (4.022 millones de parámetros) para un dominio de herramientas muy concreto, con resultados medidos sobre las suites de prueba internas de la aplicación en lugar de benchmarks generales. No está pensado como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4.000 millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA de rango 16 usando Unsloth, durante 2 épocas con una tasa de aprendizaje de 5e-5. Los pesos resultantes se fusionaron y se cuantizaron a Q4_K_M con llama.cpp. La plantilla de chat incluida en el GGUF es la del modelo base, la misma con la que se entrenó y evaluó; el autor advierte que la plantilla genérica de Qwen3 en Ollama introduce `<think>` al inicio de cada respuesta y formatea las herramientas de forma distinta.

El conjunto de datos consta de 1.246 ejemplos provenientes de 582 conversaciones. Los prompts sintéticos se enviaron a través de la aplicación PersonaOS contra datos de prueba ficticios, y solo se conservaron los turnos que terminaron correctamente. Las etiquetas son las respuestas finales de la aplicación tras sus propias comprobaciones. Los prompts de entrenamiento se mantuvieron separados de las suites de evaluación y no se utilizaron datos personales. La pérdida en el conjunto reservado fue de 0,077 tras la primera época y 0,067 tras la segunda.

## Capacidades

- Generación de texto conversacional en inglés.
- Invocación de herramientas (tool calling / function calling) para las funciones de PersonaOS: recordatorios, planificador diario, notas, memorias, objetivos y tablero de sprints.
- Discriminación entre invocar herramienta y responder directamente: preguntas simples, sumas y peticiones creativas se resuelven sin llamada a herramienta.
- Razonamiento multi-turno dentro del flujo de la aplicación PersonaOS.
- Integración con Ollama mediante la etiqueta `hf.co/purush0th/personaos-qwen3-4b-instruct-GGUF:Q4_K_M`.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Asistente personal autoalojado: el modelo gestiona recordatorios, notas y memorias dentro de PersonaOS, invocando las herramientas correspondientes y manteniendo el estado entre turnos de conversación.
- Planificación diaria: crea y actualiza entradas del planificador a partir de peticiones en lenguaje natural, con soporte para el tablero de sprints en flujos de trabajo por objetivos.
- Gestión de objetivos y seguimiento: registra metas y consulta su estado mediante las herramientas de memoria y objetivos de la aplicación.
- Despliegue doméstico en hardware modesto: al ocupar 2,5 GB en Q4_K_M y caber en una GPU de 6 GB, permite ejecutar el asistente en equipos de consumo sin depender de la nube.
- Integración vía Ollama en aplicaciones propias: cualquier cliente compatible con la API de Ollama puede consumir el modelo como proveedor de asistente con tool calling.
- Automatización de tareas administrativas personales: captura de notas rápidas, consulta de recordatorios pendientes y organización de tareas en el tablero de sprints.
- Evaluación de flujos de ajuste fino: sirve como referencia para quien quiera replicar el patrón de LoRA sobre Qwen3-4B para un dominio de herramientas concreto.

## Benchmarks y rendimiento

Resultados medidos con las suites de prueba propias de PersonaOS (`scripts/model-check.ps1`), dentro de la aplicación, con 3 ejecuciones por escenario y la misma versión de la aplicación para ambos modelos:

| Suite | Qwen3-4B-Instruct-2507 original | Este modelo |
|---|---|---|
| core + extended | 96,3% | 97,8% |
| holdout | 100% | 100% |
| holdout2 | 100% | 100% |
| holdout3 | 95,6% | 100% |
| planner | 100% | 100% |

Con correcciones posteriores de la aplicación, el modelo superó 465 de 465 comprobaciones a 5 ejecuciones por escenario. El autor advierte que estos resultados dependen de las comprobaciones de PersonaOS alrededor del modelo y no constituyen un benchmark general. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB de pesos en Q4_K_M más overhead de contexto; el autor indica que funciona en una GPU de 6 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, según el autor, en tarjetas de 6 GB o más.
- Opciones de despliegue: Ollama (soporte documentado con plantilla y parámetros de muestreo incluidos); llama.cpp es compatible por el formato GGUF. No se documentan vLLM ni TGI.
- Parámetros de muestreo incluidos en el fichero: temperature 0,7, top_k 20, top_p 0,8.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| PersonaOS Qwen3 4B Instruct (GGUF) | 4.022 M | no disponible | Asistente personal con herramientas de PersonaOS | apache-2.0 | GGUF Q4_K_M |
| Qwen3-4B-Instruct-2507 | 4.022 M | no disponible | Propósito general, instruct | apache-2.0 | safetensors y GGUF |
| Modelos de asistente autoalojado de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación cuantitativa publicada es la del apartado de benchmarks frente al modelo base. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para las herramientas y el system prompt de PersonaOS; fuera de ese contexto se comporta de forma similar al modelo base y no ha sido probado para uso general.
- Es un modelo pequeño: puede equivocarse, malinterpretar fechas y horas, o invocar la herramienta incorrecta. El autor recomienda verificar cualquier resultado importante.
- Entrenamiento únicamente en inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Solo se publica una cuantización (Q4_K_M), lo que limita el ajuste fino de calidad frente a memoria disponible.
- Riesgo de alucinación inherente a un modelo de 4.000 millones de parámetros; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo se entrega "tal cual", sin garantías, y no está hecho, respaldado ni soportado por Qwen ni Alibaba Cloud.
- Los resultados de evaluación proceden de las suites internas de PersonaOS y no son extrapolables a otros entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/purush0th/personaos-qwen3-4b-instruct-GGUF
- Árbol de ficheros del repositorio: https://huggingface.co/purush0th/personaos-qwen3-4b-instruct-GGUF/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
