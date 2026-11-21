# farruko07/empathetic-support-GGUF

## Resumen

`farruko07/empathetic-support-GGUF` es una variante modificada de `Qwen/Qwen2.5-3B-Instruct` orientada a atención al cliente, en la que se han alterado los pesos del modelo base para aumentar la expresividad empática y reducir las disculpas que implican asunción de culpa. El autor (farruko07) ha utilizado la herramienta Concept Surgeon, que aplica vectores de dirección (steering vectors) calculados como diferencia de activaciones medias y posteriormente "cuece" esas modificaciones en los pesos, de modo que no se necesitan hooks en tiempo de inferencia. El resultado se distribuye en formato GGUF, listo para ejecutarse con Ollama.

El modelo conserva la arquitectura y el tamaño del base: un transformer denso de 3.086.878.720 parámetros (~3,09 mil millones), lo que lo sitúa en la franja de modelos pequeños aptos para hardware de consumo. La modificación es puramente conductual: no se ha reentrenado el modelo con nuevos datos, sino que se han desplazado las activaciones en dos capas concretas (capa 21 para empatía, capa 16 para disculpas) con intensidades de +0,75 y -0,50 respectivamente.

Su relevancia es acotada pero interesante como ejemplo práctico de edición de comportamiento sin fine-tuning: demuestra que es posible ajustar rasgos conversacionales (tono empático, gestión de responsabilidad) en un modelo de 3B y empaquetarlo para despliegue local. No obstante, se trata de un artefacto experimental con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación sobre idiomas soportados más allá de los del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.086.878.720 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Qwen2.5-3B-Instruct soporta 32.768 tokens, segun la familia Qwen2.5) |
| Tipos de cuantizacion | GGUF; el autor documenta Q4_K_M como opcion de ejecucion |
| Idiomas soportados | no disponibles (heredados del base Qwen2.5-3B-Instruct) |
| Licencia | qwen-research (Qwen Research License) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-3B-Instruct`, un transformer denso de tipo decoder-only con 3.086.878.720 parámetros. Sobre esa base no se ha realizado un entrenamiento adicional con datos: la modificación consiste en la aplicación de *steering vectors* mediante Concept Surgeon. Cada vector se calcula como la diferencia entre las activaciones medias de un conjunto de ejemplos que exhiben el concepto deseado y las de un conjunto neutro, y se suma a las activaciones de una capa concreta durante la generación. Posteriormente, esas ediciones se integran en los pesos ("baked in"), de forma que la inferencia no requiere hooks ni código adicional.

Los dos conceptos aplicados son empatía (+0,75 de intensidad en la capa 21) y disculpas (-0,50 en la capa 16). El autor reporta una verificación en Ollama con las siguientes métricas: para empatía, rasgo 85,6 (frente a 83,1 con hooks), coherencia 83,8 y precisión 84,4; para disculpas, rasgo 3,8 (frente a 0,0 con hooks), coherencia 81,9 y precisión 80,6. Ambos tests se marcan como superados. No se documenta el dataset utilizado para calcular los vectores, el número de tokens de entrenamiento ni si hubo RLHF o DPO adicional (no lo hubo, al no ser un reentrenamiento).

## Capacidades

- Generación de texto conversacional en tono empático, con mayor presencia de fórmulas de reconocimiento emocional y menor tendencia a disculparse asumiendo culpa.
- Razonamiento y respuesta a instrucciones heredados del base Qwen2.5-3B-Instruct.
- Generación de código y matemáticas básicas, limitada por el tamaño de 3B parámetros del modelo base.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada para esta variante; el base Qwen2.5-Instruct lo soporta, pero la edición de pesos podría afectar al formato de llamadas.
- Capacidades de agente y razonamiento multi-paso: no documentadas para esta variante.
- Capacidades multilingües: no documentadas; dependen del modelo base.
- Modo "thinking" o visión/audio: no disponible.

## Casos de uso

- Atención al cliente en primera línea: el modelo está específicamente ajustado para responder con empatía (+0,75) y evitar disculpas que impliquen admisión de responsabilidad (-0,50), lo que encaja en flujos de soporte donde la empresa no debe reconocer culpa legal pero sí validar la frustración del usuario.
- Despliegue local en estaciones de trabajo: al ser un GGUF de 3B en Q4_K_M, cabe en equipos sin GPU dedicada o con GPU de gama media, permitiendo prototipos de asistentes de soporte sin coste de API.
- Chatbots de soporte emocional en aplicaciones de bienestar: el sesgo hacia la empatía lo hace adecuado para conversaciones de acompañamiento, siempre con supervisión humana y advertencias claras de que no sustituye atención profesional.
- Generación de respuestas de correo electrónico de soporte: puede redactar borradores con tono empático que un agente humano revise antes de enviar, reduciendo el tiempo de composición.
- Investigación sobre edición de comportamiento en LLM: sirve como caso de estudio reproducible de steering vectors con Concept Surgeon, comparando resultados con y sin hooks (el autor aporta métricas de ambos modos).
- Pruebas A/B de tono en productos conversacionales: permite comparar una política de comunicación empática frente al modelo base sin modificar el pipeline de inferencia, al estar los cambios integrados en los pesos.
- Filtrado y reescritura de respuestas: dado su sesgo negativo hacia disculpas, puede usarse para detectar y reformular mensajes de soporte que asumen culpa indebidamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta métricas internas de verificación en Ollama:

| Concepto | Modo | Rasgo | Coherencia | Precisión | Resultado |
|---|---|---|---|---|---|
| Empatía (+0,75, capa 21) | Ollama (pesos) | 85,6 | 83,8 | 84,4 | Superado |
| Empatía (+0,75, capa 21) | Hooks | 83,1 | no disponible | no disponible | — |
| Disculpas (-0,50, capa 16) | Ollama (pesos) | 3,8 | 81,9 | 80,6 | Superado |
| Disculpas (-0,50, capa 16) | Hooks | 0,0 | no disponible | no disponible | — |

No se especifica la metodología de cálculo de estas métricas ni el conjunto de evaluación empleado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en Q4_K_M (el repositorio ocupa 1,9 GB); en FP16 serían unos 6,2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M (GTX 1650, RTX 3050, RTX 4060); para FP16 se recomienda RTX 3060 12 GB o superior.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más en cuantización Q4_K_M.
- Opciones de despliegue: Ollama (documentado por el autor con `ollama run hf.co/farruko07/empathetic-support-GGUF:Q4_K_M`), llama.cpp y cualquier runtime compatible con GGUF. vLLM y TGI no están documentados para esta variante.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modificación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| farruko07/empathetic-support-GGUF | 3,09B | no disponible (base: 32.768) | Steering vectors (empatía +0,75, disculpas -0,50) | qwen-research | GGUF en HF, 0 descargas |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 | Ninguna | qwen-research | Muy extendido, múltiples cuantizaciones |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 | Ninguna | qwen-research | Muy extendido, menor huella de VRAM |
| Modelos de soporte empático basados en fine-tuning | variable | variable | Fine-tuning supervisado | variable | no disponible |

La comparación directa con alternativas de "soporte empático" no está disponible en la información proporcionada; el principal referente es el propio modelo base, del que esta variante difiere únicamente en el comportamiento conversacional.

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso comercial; es imprescindible revisar los términos de la Qwen Research License antes de cualquier despliegue en producción.
- Artefacto experimental: cero descargas y cero likes en el momento de la consulta, sin revisión comunitaria ni validación independiente.
- Las métricas de verificación son internas del autor y no se detalla su metodología; no equivalen a benchmarks estándar.
- La edición de pesos puede degradar capacidades no evaluadas (tool calling, multilingüismo, matemáticas) al desplazar activaciones en capas concretas; no se han publicado pruebas al respecto.
- Riesgo de alucinación inherente al modelo base de 3B, no mitigado por la edición.
- El sesgo hacia la empatía y contra las disculpas puede producir respuestas que eviten asumir responsabilidad incluso cuando sea legítimo hacerlo, con implicaciones legales y de compliance en atención al cliente.
- Idiomas soportados no documentados; el comportamiento empático podría no transferirse a idiomas distintos del inglés.
- No se especifica el conjunto de datos usado para calcular los vectores de dirección, lo que dificulta evaluar sesgos introducidos.
- Fecha de creación en el repositorio (2026-11-21) posterior a la fecha habitual de consulta; verificar la integridad y procedencia del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/farruko07/empathetic-support-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Concept Surgeon (herramienta citada por el autor): no disponible en la información proporcionada
- Paper o blog de referencia sobre steering vectors: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
