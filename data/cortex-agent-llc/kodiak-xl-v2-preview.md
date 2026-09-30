# cortex-agent-llc/kodiak-xl-v2-preview

## Resumen

Kodiak XL v2 (research preview) es un modelo de decisión de código abierto desarrollado por Cortex Agent LLC. No es un modelo generativo al uso: recibe como entrada un estado (un texto, una lista de textos o JSON) junto con preguntas tipadas, y devuelve en una única pasada forward una elección calibrada, una puntuación o una abstención explícita ("can't tell"). Está construido sobre Ettin-encoder-1B de Johns Hopkins (licencia MIT) y cuenta con 1.044.119.556 parámetros, aproximadamente 1.000 millones.

La propuesta de valor es la eficiencia y la calibración frente a los LLM generalistas: según la tabla comparativa del autor, Kodiak XL v2 alcanza 0.659 ± 0.013 de exactitud forzada en tareas nunca vistas y 0.881 en tareas familiares, con un error de calibración de 0.113 y 38 ms de latencia por petición en GPU, frente a los 1.530 ms de Qwen3-8B. Es relevante ahora porque cubre un hueco poco atendido: la clasificación y el enrutado fiables dentro de pipelines de agentes, donde una respuesta rápida, calibrada y capaz de abstenerse vale más que una generación larga.

El repositorio es un research preview con 0 descargas y 0 likes en el momento de la consulta, licencia Apache-2.0, pesos en safetensors, tamaño de repo de 4,2 GB y soporte exclusivo de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (etiqueta `modernbert` en el repositorio); base: `jhu-clsp/ettin-encoder-1b` |
| Parametros totales | 1.044.119.556 (~1B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de aproximadamente 1.000 millones de parámetros, construido mediante ajuste sobre Ettin-encoder-1B de Johns Hopkins. Las etiquetas del repositorio lo clasifican dentro de la familia ModernBERT y como `decision-model`: en lugar de generar texto token a token, procesa el estado y las preguntas tipadas en una sola pasada forward y emite directamente una decisión. Los tipos de pregunta documentados en el ejemplo de la model card son de elección con etiquetas discretas (por ejemplo, `{"type": "choice", "id": "injection", "text": "...", "labels": ["yes", "no"]}`), y el autor menciona adicionalmente preguntas de tipo puntuación ("how urgent is this?").

No se proporciona información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Sí se indica que este checkpoint concreto es la ejecución con semilla 1, seleccionada por pérdida de validación y nunca por el conjunto de evaluación, y que los resultados publicados corresponden a 3 ejecuciones sobre un conjunto de evaluación congelado (v0.2). La innovación destacable es el propio paradigma de decisión: calibración explícita y abstención integrada en una arquitectura encoder de ~1B, con latencias de decenas de milisegundos.

## Capacidades

- Decisión y clasificación sobre estados heterogéneos: texto plano, listas de textos o JSON.
- Respuestas tipadas: elección entre etiquetas, puntuación numérica o abstención ("can't tell").
- Detección de inyección de prompts y jailbreaks (0.89 de exactitud en la comparativa del autor frente a 0.67 del modelo de 400M).
- Análisis de sentimiento, con un rendimiento notable en sentimiento de poemas (0.54 frente a 0.44 del modelo de 400M).
- Puntuaciones de urgencia o prioridad, descritas por el autor como aproximadas.
- Inferencia en una única pasada forward, sin decodificación autorregresiva.
- Calibración de confianza y abstención selectiva mediante el parámetro `null_threshold`.
- Capacidades multilingües: no, el modelo solo declara soporte de inglés.
- Tool calling / function calling: no documentado.
- Capacidades de agente y razonamiento multi-paso: no documentadas como tales; el modelo está pensado como componente de decisión dentro de un agente, no como planificador autónomo.
- Visión, audio o modo "thinking": no disponibles.

## Casos de uso

- Filtrado de inyección de prompts en pipelines de agentes: colocado antes del LLM principal, clasifica si la entrada del usuario intenta manipular las instrucciones del sistema. Los 38 ms de latencia en GPU permiten ejecutarlo en línea sin penalizar la experiencia.
- Enrutado de peticiones (router de intenciones): dado un mensaje y un conjunto de etiquetas de intención, devuelve la etiqueta más probable en una sola pasada, lo que reduce el coste frente a usar un LLM generativo para clasificar.
- Triaje y priorización de tickets de soporte: la pregunta de tipo puntuación permite ordenar incidencias por urgencia. El autor advierte que estas puntuaciones son aproximadas, por lo que conviene calibrarlas con datos propios antes de automatizar colas.
- Moderación de contenido y validación de cumplimiento: clasificación binaria o multietiqueta de textos frente a políticas, aprovechando la calibración para derivar a revisión humana cuando el modelo se abstiene.
- Análisis de sentimiento financiero sobre titulares o tuits: el modelo cubre esta tarea, aunque el propio autor señala que queda unos puntos por debajo del modelo de 400M en este dominio concreto.
- Extracción y validación de JSON estructurado: al aceptar JSON como estado de entrada, puede verificar campos o decidir si un objeto cumple un esquema, integrándose en validaciones de pipelines de datos.
- Etiquetado asistido de datasets: al ser un encoder de ~1B y rápido, resulta adecuado para anotar corpus grandes por lotes, dejando la abstención para los casos dudosos.
- Guardarraíl en agentes multi-paso: comprobar antes de ejecutar una acción si el estado actual satisface una condición expresada como pregunta tipada, evitando llamadas innecesarias al modelo generativo.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de evaluación congelado v0.2, en preguntas de elección y con 3 ejecuciones:

| Modelo | Tareas nunca vistas (exactitud forzada) | Tareas familiares | Error de calibración (nunca vistas) | Acierto cuando dice "can't tell" | Latencia (GPU, una petición) |
|---|---|---|---|---|---|
| Kodiak large v2 (400M, 3 ejecuciones) | 0.609 | 0.855 | 0.128 | 0.84 | 16 ms |
| Kodiak XL v2 (1B, 3 ejecuciones) | 0.659 ± 0.013 | 0.881 | 0.113 | 0.87 | 38 ms |
| Qwen3-8B (LLM) | 0.688 | 0.710 | 0.293 | no disponible | 1.530 ms |

La ejecución con semilla 1 de este checkpoint, seleccionada por pérdida de validación, obtiene 0.666 en tareas nunca vistas con exactitud forzada. Las mayores ganancias frente al modelo de 400M se dan en tareas intensivas en conocimiento: detección de jailbreak 0.89 frente a 0.67 y sentimiento de poemas 0.54 frente a 0.44. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. A partir del recuento real de parámetros (1.044.119.556), las estimaciones orientativas son de ~4,2 GB en fp32, ~2,1 GB en fp16/bf16, ~1,05 GB en int8 y ~0,55 GB en int4, más el overhead de activaciones y runtime. Estas cifras son cálculos derivados del número de parámetros, no datos confirmados por el autor.
- GPU recomendadas: no disponibles. El único dato de latencia publicado es de 38 ms por petición en GPU, sin especificar el modelo de tarjeta.
- Viabilidad en GPU de consumo: no confirmada. Por tamaño (1B), el modelo debería caber en GPUs de consumo con al menos 4-8 GB de VRAM en precisión reducida, pero el autor no lo documenta y los formatos cuantizados no se distribuyen en el repositorio.
- Opciones de despliegue: el autor proporciona una librería propia (`kodiak-s1`), instalable desde el repositorio de GitHub, con `Kodiak.from_pretrained(...)`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados, pero no se detalla.
- Latencia: 38 ms por petición en GPU. En CPU, el autor indica que hay que esperar unos cientos de milisegundos por petición, y señala que este modelo es aproximadamente 2,4 veces más lento que la variante de 400M.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud forzada (nunca vistas) | Error de calibracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kodiak XL v2 | ~1B (1.044.119.556) | no disponible | 0.659 ± 0.013 | 0.113 | Apache-2.0 | HuggingFace y GitHub de Cortex Agent LLC |
| Kodiak large v2 | 400M | no disponible | 0.609 | 0.128 | no disponible | Referenciado en la comparativa del autor; enlace no facilitado |
| Qwen3-8B | 8B | no disponible | 0.688 | 0.293 | Apache-2.0 (dato externo, no incluido en la información proporcionada) | HuggingFace |
| Ettin-encoder-1B (modelo base) | ~1B | no disponible | no disponible | no disponible | MIT | HuggingFace (`jhu-clsp/ettin-encoder-1b`) |

La comparación relevante no es de tamaño sino de propósito: Kodiak XL v2 compite con LLM generalistas en tareas de clasificación y decisión, donde sacrifica algo de exactitud bruta (0.659 frente a 0.688 de Qwen3-8B en tareas nunca vistas) a cambio de mejor calibración (0.113 frente a 0.293), capacidad de abstención fiable y una latencia 40 veces menor (38 ms frente a 1.530 ms). No se dispone de datos para comparar longitud de contexto ni licencias de todas las alternativas.

## Limitaciones y advertencias

- Precisión de la abstención por debajo del objetivo: cuando el modelo dice "can't tell" acierta entre el 86 % y el 87 % de las veces, por debajo del 90 % que se marca el propio autor. Si las abstenciones falsas son costosas, hay que subir `null_threshold` por petición.
- Velocidad: es aproximadamente 2,4 veces más lento que la variante de 400M. En CPU, unos cientos de milisegundos por petición, lo que puede ser limitante en despliegues sin GPU.
- Puntuaciones aproximadas: las respuestas de tipo rating ("how urgent is this?") son toscas y no deberían usarse sin calibración propia.
- Dominio financiero: el sentimiento de tuits financieros queda unos puntos por debajo del modelo de 400M.
- Trampas de redacción: un mensaje que repita las palabras exactas de una de las opciones dentro de una condición (el autor pone como ejemplo "if it can't arrive, cancel and refund me") puede arrastrar la respuesta hacia esa opción.
- Idioma: solo inglés. No hay soporte multilingüe declarado.
- Sesgos: no se documentan sesgos específicos, pero al ser un modelo entrenado sobre datos no especificados, no hay garantía de neutralidad en dominios sensibles.
- Riesgo de alucinación: reducido por diseño, ya que el modelo elige entre etiquetas o se abstiene en lugar de generar texto libre; el riesgo se traslada a la calibración y a los falsos positivos de las etiquetas.
- Licencia: Apache-2.0, permisiva para uso comercial. El modelo base, Ettin-encoder-1B, es MIT. No se especifican condiciones adicionales para las dependencias de la librería `kodiak-s1`.
- Estado de research preview: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente. El autor recomienda validar sobre datos propios y no usar el modelo para decisiones que afecten a personas sin revisión humana.
- Los benchmarks publicados son del propio autor sobre su conjunto de evaluación congelado, no de terceros.
- No se documentan tipos de cuantización distribuidos ni requisitos de hardware, lo que complica planificar el despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cortex-agent-llc/kodiak-xl-v2-preview
- Repositorio de código, documentación y build log: https://github.com/grizzlypeaksoftware/kodiak
- Modelo base Ettin-encoder-1B (Johns Hopkins, MIT): https://huggingface.co/jhu-clsp/ettin-encoder-1b

Nota: la búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo ni sobre Cortex Agent LLC; los resultados obtenidos correspondían a páginas sobre el córtex cerebral y a la utilidad Razer Cortex, sin relación con el modelo.
