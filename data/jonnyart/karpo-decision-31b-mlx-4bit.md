# jonnyArt/karpo-decision-31B-mlx-4bit

## Resumen

Karpo Decision 31B es un modelo de decisión desarrollado por MachinePulseAI, construido como una versión modificada de Gemma 4 31B-it de Google DeepMind. A diferencia de un modelo generativo convencional, está disenado para responder preguntas estructuradas sobre un estado o contexto dado: recibe una situación y un conjunto de preguntas tipadas, y devuelve probabilidades calibradas para cada posible respuesta. Este repositorio concreto es una conversión no oficial a 4 bits en formato MLX, empaquetada por jonnyArt para su ejecución en Macs con Apple Silicon.

La conversión ocupa aproximadamente 19,3 GB en disco (unos 18 GB según el autor) y emplea cuantización de 4 bits con tamaño de grupo 64. No se carga con `mlx-lm` de forma directa: requiere el código de inferencia propietario de MachinePulse junto con un port específico para Apple Silicon mantenido por fluxcodestudio. El modelo base conserva la licencia Apache-2.0 y deriva de Gemma 4, cuyos términos se recogen en el fichero `licenses/Gemma-4-LICENSE` del repositorio.

Su relevancia radica en que traslada a hardware de consumo (Apple Silicon) un modelo de decisión de 31B parámetros que originalmente se ejecuta en GPUs NVIDIA, con una degradación medida y documentada: en 681 preguntas sobre 145 peticiones, solo 3 respuestas principales cambiaron respecto al checkpoint completo, con una diferencia media de 0,0067 en las probabilidades. El autor califica explícitamente esta ruta MLX como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 4 31B-it (modelo de decisión con empaquetado de peticiones y readout propios) |
| Parametros totales | 31B (según denominación del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | verificado hasta 8.072 tokens; máximo oficial no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (existe también una versión 8-bit del mismo autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con `licenses/Gemma-4-LICENSE` por herencia de Gemma 4) |
| Formato de pesos | MLX (cuantizado), no compatible con `mlx-lm` estándar; requiere `karpo-apple-silicon` |

## Arquitectura y entrenamiento

El modelo base es una modificación de Gemma 4 31B-it orientada a decisión: en lugar de generar texto libre, empaqueta la petición (estado más preguntas tipadas, por ejemplo de tipo `noul`) y produce una lectura de probabilidades sobre las respuestas posibles. La conversión a MLX no altera los pesos de readout, el tokenizer, la plantilla de chat ni la configuración de decisión de MachinePulse: solo se cuantizan los pesos del transformer a 4 bits mediante `scripts/convert_mlx.py`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La innovación destacable de esta ficha es la propia cuantización MLX: el autor verificó que los hashes de petición y los recuentos de tokens coincidían con los del checkpoint completo antes de comparar probabilidades, lo que permite atribuir las diferencias exclusivamente a la cuantización. El pico de memoria observado fue de 24 GB con peticiones de 8.000 tokens.

## Capacidades

- Decisión estructurada: responde preguntas tipadas sobre un estado dado, devolviendo probabilidades por respuesta en lugar de texto generado.
- Clasificación de texto: la pipeline declarada en Hugging Face es `text-classification`.
- Razonamiento sobre políticas y reglas: el ejemplo de la model card evalúa la elegibilidad de una devolución según una política de 30 días.
- Procesamiento de contexto largo: verificado hasta 8.072 tokens por petición.
- Multilingüismo: no disponible (no se documentan idiomas soportados).
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Visión: no incluida en esta conversión (los pesos de visión no están en esta copia).
- Modo thinking: no disponible.

## Casos de uso

- Evaluación de elegibilidad en atención al cliente: el modelo recibe el estado de un pedido y las reglas de política aplicables, y devuelve la probabilidad de que una devolución, reembolso o compensación sea procedente, como en el ejemplo de la model card con una devolución a 45 días frente a una política de 30.
- Triaje de tickets de soporte: clasificar solicitudes entrantes según múltiples preguntas tipadas (urgencia, categoría, necesidad de escalado) aprovechando el contexto de hasta 8.072 tokens para incluir el historial completo del caso.
- Motor de decisión en flujos de aprobación: integrar el modelo como componente de scoring en pipelines internos donde se requiera una probabilidad calibrada y auditable en lugar de una respuesta en lenguaje natural.
- Enrutamiento de consultas en sistemas RAG: decidir a qué base de conocimiento o herramienta debe dirigirse una consulta antes de invocar un modelo generativo, reduciendo coste y latencia en la etapa de generación.
- Clasificación documental con contexto largo: procesar contratos, informes o expedientes de hasta 8.000 tokens y emitir decisiones estructuradas sobre cláusulas o cumplimiento.
- Prototipado local en Mac: desarrollar y validar lógicas de decisión en un portátil o Mac Studio con Apple Silicon antes de desplegar el checkpoint completo en GPUs NVIDIA, gracias a la paridad documentada con el modelo original.
- Investigación sobre cuantización: servir como caso de estudio reproducible del impacto de la cuantización 4-bit en la calibración de probabilidades de un modelo de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí documenta una comparación de fidelidad frente al checkpoint completo de 31B en NVIDIA:

| Ejecución | Peticiones | Preguntas | Respuesta principal cambiada | Diferencia media | Diferencia máxima |
|---|---:|---:|---:|---:|---:|
| Esta copia, 4-bit | 145 | 681 | 3 | 0,0067 | 0,183 |
| Checkpoint completo en Mac con PyTorch (referencia) | no disponible | 1.606 | 1 | 0,0011 | 0,103 |

El autor señala que la copia 4-bit desplaza las respuestas aproximadamente seis veces más que el checkpoint completo y recomienda la versión de 8 bits cuando el hardware lo permita. No se ha verificado la puntuación del Decision Index de esta copia, ni el comportamiento en imágenes, ni en peticiones de más de 8.072 tokens.

## Requisitos de hardware

- VRAM/unified memory: pico de 24 GB observado con peticiones de 8.000 tokens; el peso en disco es de aproximadamente 18-19,3 GB.
- Hardware objetivo: Macs con Apple Silicon (mlx, apple-silicon, macos en los tags). No se especifican chips concretos.
- GPU NVIDIA: no aplicable a esta conversión; el checkpoint completo original se ejecuta en NVIDIA según la model card, sin especificar modelos.
- Cabe en GPU de consumo: no disponible para esta versión MLX; para el checkpoint completo no se documenta.
- Opciones de despliegue: exclusivamente mediante `karpo-apple-silicon[mlx]` junto con el paquete `karpo-decision` de MachinePulse; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jonnyArt/karpo-decision-31B-mlx-4bit | 31B | verificado hasta 8.072 tokens | MLX 4-bit | Apache-2.0 | Hugging Face, requiere código de MachinePulse |
| jonnyArt/karpo-decision-31B-mlx-8bit | 31B | verificado hasta 8.072 tokens | MLX 8-bit | Apache-2.0 | Hugging Face, misma ruta de inferencia |
| MachinePulseAI/karpo-decision-31B | 31B | verificado hasta 8.072 tokens | safetensors (checkpoint completo) | Apache-2.0 | Hugging Face, orientado a NVIDIA |
| Gemma 4 31B-it | 31B | no disponible | safetensors | Gemma license | Hugging Face, modelo generativo, no de decisión |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de la tabla de fidelidad de la sección anterior.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada, respaldada ni soportada por MachinePulse ni por Google; el crédito de calidad corresponde a MachinePulse.
- Ruta experimental: el propio autor califica la vía MLX como experimental y recomienda la versión de 8 bits cuando el hardware lo permita.
- Degradación medible: la cuantización 4-bit cambia respuestas unas seis veces más que el checkpoint completo (diferencia media 0,0067 frente a 0,0011).
- Sin visión: los pesos de visión no están incluidos en esta copia.
- Límite de contexto verificado: no se ha comprobado el comportamiento con peticiones de más de 8.072 tokens.
- Dependencia de código propietario: no funciona con `mlx-lm` ni con runtimes estándar; requiere los paquetes `karpo-decision` y `karpo-apple-silicon` desde repositorios Git concretos.
- Idiomas no documentados: no se especifican los idiomas soportados, por lo que el comportamiento multilingüe es desconocido.
- Sesgos y alucinación: no se documentan sesgos conocidos ni tasas de alucinación; al tratarse de un modelo de decisión probabilística, las salidas deben interpretarse como puntuaciones, no como verdades absolutas.
- Licencia: Apache-2.0 permite uso comercial, pero se heredan las condiciones de Gemma 4 recogidas en `licenses/Gemma-4-LICENSE`, que deben revisarse antes de un despliegue en producción.
- Sin tracción comunitaria: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jonnyArt/karpo-decision-31B-mlx-4bit
- Versión 8-bit del mismo autor: https://huggingface.co/jonnyArt/karpo-decision-31B-mlx-8bit
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Port para Apple Silicon: https://github.com/fluxcodestudio/karpo-apple-silicon
- Verificación y límites del port: https://github.com/fluxcodestudio/karpo-apple-silicon#what-is-verified-and-how
- Código de inferencia de MachinePulse: https://github.com/machinepulse-ai/karpo-decision
