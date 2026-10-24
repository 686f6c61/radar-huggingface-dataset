# audnai/penclaw-Kimi-K3.1-pro-unrestricted

## Resumen

`audnai/penclaw-Kimi-K3.1-pro-unrestricted` es una distribución de terceros (no oficial) de Kimi K3.1 Pro, el modelo abierto de la serie K3.1 de Moonshot AI. El repositorio lo publica el usuario `audnai` (ozgur ozkan) el 23 de octubre de 2026, el mismo día del lanzamiento del modelo base, y se presenta como parte del proyecto Penclaw, descrito en su repositorio de GitHub como «asistente personal de IA abliterado» que acepta cualquier prompt sin objeciones. El acceso está restringido: requiere aceptar condiciones en HuggingFace.

El modelo base, Kimi K3.1 Pro, es un modelo de pesos abiertos de clase 3T con 2,8 billones de parámetros totales y 104 000 millones activos, lo que implica una arquitectura de mezcla de expertos (MoE), y una ventana de contexto de 1 millón de tokens. Moonshot AI lo posiciona frente a los modelos propietarios más potentes en tareas de código, agentes y conocimiento, y comercializa en paralelo una variante Highspeed con 2-3 veces más velocidad a través de su plataforma API.

La relevancia de esta ficha concreta es doble: por un lado documenta las capacidades del modelo base; por otro, advierte de que la versión de `audnai` es una modificación no verificada, sin model card con especificaciones, sin licencia declarada, sin idiomas declarados y con cero descargas en el momento de la consulta (17 likes). Cualquier evaluación de producción debe hacerse sobre el modelo original de Moonshot AI, no sobre este derivado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en el repositorio. El modelo base se describe como 2,8T totales / 104B activos, lo que implica MoE, pero no se detalla el diseño interno |
| Parámetros totales | 2,8 billones (modelo base, según MarkTechPost); no confirmado para este derivado |
| Parámetros activos | 104 000 millones (modelo base); no confirmado para este derivado |
| Longitud de contexto | 1 000 000 tokens (modelo base); no confirmado para este derivado |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Pipeline declarado | No disponible |
| Etiquetas del repositorio | `region:us` |
| Descargas / likes | 0 descargas / 17 likes (en el momento de la consulta) |
| Fecha de creación / actualización | 2026-10-23 21:38 UTC / 2026-10-23 21:44 UTC (6 minutos de diferencia) |

## Arquitectura y entrenamiento

No hay información publicada en el repositorio sobre la arquitectura, los datos de entrenamiento, el número de tokens vistos, la composición del corpus ni las etapas de alineación (RLHF, DPO u otras) de este derivado. La única información disponible corresponde al modelo base: Kimi K3.1 Pro es el primer modelo de la serie K3.1 de Moonshot AI, con 2,8 billones de parámetros totales y 104 000 millones activos, y una ventana de contexto de 1 millón de tokens. La relación entre parámetros totales y activos (aproximadamente 27:1) es coherente con un transformer disperso de tipo MoE, pero no se ha publicado el número de expertos, el mecanismo de enrutamiento ni detalles de atención (lineal, híbrida u otros).

El elemento diferencial de esta distribución no es arquitectónico sino de alineación: el proyecto Penclaw se define como «abliterado», es decir, con los comportamientos de rechazo suprimidos o eliminados mediante técnicas de edición de pesos o ajuste fino dirigido. No se especifica qué método se ha aplicado, sobre qué checkpoint se partió, ni si se ha verificado que las capacidades del modelo base se preservan tras la modificación. El intervalo de 6 minutos entre creación y actualización del repositorio sugiere una subida mínima sin documentación adicional. Tampoco hay información sobre innovaciones técnicas del modelo base más allá de la ventana de contexto y de la variante Highspeed (2-3× de velocidad).

## Capacidades

Las siguientes capacidades están documentadas o anunciadas para el modelo base Kimi K3.1 Pro; no hay verificación independiente de que se conserven en el derivado de `audnai`:

- Generación de texto y razonamiento general, con posicionamiento explícito frente a modelos propietarios en pruebas de conocimiento.
- Generación de código: Moonshot AI destaca mejoras sustanciales en tareas de programación respecto a la generación anterior.
- Capacidades agénticas: uso de herramientas y ejecución de tareas multi-paso, con mejoras declaradas en flujos de agentes.
- Creación 3D: mencionada de forma explícita entre las áreas de mejora del modelo base.
- Investigación financiera: también citada como dominio de mejora en el anuncio del modelo base.
- Contexto largo: ventana de 1 millón de tokens, adecuada para documentos extensos, repositorios completos o historiales de conversación muy largos.
- Modo sin restricciones (específico de este derivado): supresión de rechazos, orientada a roleplay, escritura creativa sin filtros y pruebas de seguridad.
- Soporte de tool calling / function calling: no confirmado de forma explícita en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles.

## Casos de uso

- Red teaming y evaluación de seguridad: el modelo permite generar respuestas que el modelo base rechazaría, lo que lo hace útil como generador de casos adversarios en bancos de pruebas de alineación y en la evaluación de clasificadores de contenido. Debe ejecutarse en entornos aislados y con registro de prompts.
- Investigación sobre abliteración: comparar las respuestas del derivado con las del Kimi K3.1 Pro original permite medir qué capacidades se degradan al eliminar los rechazos, un experimento relevante para estudiar el compromiso entre seguridad y utilidad.
- Escritura creativa y roleplay sin filtros: narrativa, guion y personajes con temáticas adultas o controvertidas que los modelos alineados suelen declinar; el contexto de 1 M tokens permite mantener coherencia en novelas o campañas de juego largas.
- Análisis de documentación extensa: con 1 M tokens de ventana, el modelo base puede procesar contratos completos, expedientes o bases de código sin troceado, manteniendo referencias cruzadas entre secciones.
- Asistencia a desarrollo de software en local: si se dispone de infraestructura suficiente, integrar el modelo en un asistente de código que opere sobre un repositorio entero, con anonimización previa de secretos y revisión humana de los parches.
- Automatización de agentes multi-paso: pipelines que encadenan búsqueda, ejecución de herramientas y síntesis, aprovechando las mejoras declaradas del modelo base en capacidades agénticas; requiere validación propia porque no hay benchmarks publicados del derivado.
- Generación de datos sintéticos para ajuste fino: producción de diálogos y respuestas en dominios donde el modelo alineado es demasiado restrictivo, con posterior filtrado y etiquetado humano antes de usar los datos en entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni el repositorio de `audnai` ni las fuentes consultadas incluyen cifras concretas de MMLU, HumanEval, GSM8K u otras pruebas para el modelo base ni para este derivado; el anuncio de Moonshot AI se limita a afirmar mejoras en código, creación 3D, investigación financiera y capacidades agénticas sin aportar números. Tampoco existen mediciones independientes del efecto de la abliteración sobre el rendimiento.

## Requisitos de hardware

Las cifras siguientes son estimaciones aritméticas derivadas del número de parámetros del modelo base, no datos publicados por el autor del repositorio ni por Moonshot AI:

- Peso en memoria de los 2,8 T parámetros totales: aproximadamente 5,6 TB en BF16, 2,8 TB en FP8 y 1,4 TB en cuantización de 4 bits. No cabe en ninguna configuración de GPU de consumo.
- Memoria para los 104 000 millones de parámetros activos por token: del orden de 208 GB en BF16 y 104 GB en FP8, además de caché KV. Esto exige múltiples aceleradores incluso en el mejor de los casos.
- GPU recomendadas: nodos multi-GPU de clase H100/H200 o B200 con interconnect de alta velocidad (NVLink) para inferencia en FP8/BF16; el despliegue en una sola máquina de 8 GPU solo es viable con cuantización agresiva y particionado por expertos.
- GPU de consumo: no viable. Una RTX 4090 (24 GB) no puede alojar el modelo ni siquiera en cuantizaciones de 2-3 bits, que seguirían requiriendo del orden de 700 GB a 1 TB.
- Opciones de despliegue: para el modelo base, frameworks con soporte de paralelismo tensorial y de expertos (vLLM, SGLang, TGI) son los candidatos naturales; llama.cpp u Ollama no son realistas a esta escala. No hay confirmación de que el derivado sea compatible con ninguno de ellos, ni de que se hayan publicado pesos en formato GGUF.
- Latencia y throughput: no disponibles. La variante Highspeed del modelo base se anuncia con 2-3× la velocidad de K3.1 Pro, pero sin cifras absolutas de tokens por segundo.
- Alternativa práctica: consumir el modelo base a través de la API de Kimi Platform en lugar de autohospedarlo, dado el coste de infraestructura.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `audnai/penclaw-Kimi-K3.1-pro-unrestricted` | 2,8 T totales / 104 B activos (heredados, no confirmados) | 1 M tokens (heredado, no confirmado) | No disponible | HuggingFace con acceso restringido | Derivado abliterado, sin model card, 0 descargas, subido el mismo día del lanzamiento |
| Kimi K3.1 Pro (Moonshot AI) | 2,8 T totales / 104 B activos | 1 M tokens | No disponible en la información consultada (descrito como «open-weight») | Pesos abiertos y API en platform.kimi.ai | Modelo de referencia de la serie K3.1; sin cifras de benchmarks publicadas en las fuentes consultadas |
| Kimi K3.1 Pro Highspeed (Moonshot AI) | No disponible | No disponible | No disponible | API de Kimi Platform | Variante con 2-3× la velocidad de K3.1 Pro, orientada a baja latencia |

No se dispone de datos verificables de otros modelos de clase 3T (por ejemplo, alternativas de otros laboratorios) en la información proporcionada, por lo que no se incluye una comparación cuantitativa con ellos.

## Limitaciones y advertencias

- Ausencia total de model card: el repositorio no declara arquitectura, licencia, idiomas, formato de pesos ni método de modificación. La ficha se apoya en información del modelo base, no del derivado.
- Procedencia no verificada: no hay evidencia de que los pesos correspondan realmente a Kimi K3.1 Pro ni de qué checkpoint se partió. Un tercero podría haber publicado un modelo distinto bajo ese nombre.
- Alineación de seguridad eliminada: al ser «unrestricted», el modelo no aplica rechazos, lo que implica riesgo de generar contenido dañino, ilegal o sexual explícito sin filtro. No es apto para aplicaciones de cara al público sin una capa de moderación propia.
- Riesgo de alucinación: no hay mediciones de fiabilidad; la abliteración puede degradar la coherencia y la calibración del modelo base, efecto documentado en la literatura sobre edición de pesos, aunque no se ha evaluado en este caso concreto.
- Licencia indeterminada: sin licencia declarada no se puede asumir permiso de uso comercial. Además, la licencia del modelo base (no disponible en las fuentes consultadas) podría imponer restricciones que un redistribuidor no puede relajar.
- Sin tracción ni validación comunitaria: 0 descargas y 17 likes en el momento de la consulta, con creación y actualización separadas por 6 minutos, indican que no ha pasado ninguna revisión por pares ni prueba práctica de terceros.
- Idiomas no declarados: se desconoce el comportamiento en castellano; en modelos de esta escala el rendimiento multilingüe varía mucho y no hay evaluación disponible.
- Coste de despliegue prohibitivo: la escala de 2,8 T parámetros hace inviable el autohospedaje fuera de infraestructura de centro de datos.
- Acceso restringido: requiere aceptar condiciones en HuggingFace; las condiciones concretas no están disponibles en la información proporcionada.
- Riesgo reputacional y legal: usar un modelo sin licencia clara y sin filtros en producción expone a incumplimientos normativos (por ejemplo, obligaciones de moderación en la UE) y a responsabilidad sobre el contenido generado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/audnai/penclaw-Kimi-K3.1-pro-unrestricted
- Perfil del autor en HuggingFace: https://huggingface.co/audnai
- Repositorio del proyecto Penclaw en GitHub: https://github.com/audn-ai/penclaw
- Anuncio de Kimi K3.1 Pro en MarkTechPost: https://www.marktechpost.com/2026/10/23/moonshot-ai-kimi-k3-1-pro-open-weight-model/
- Documentación de la API de Kimi K3.1 Pro: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
