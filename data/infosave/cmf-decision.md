# infosave/cmf-decision

## Resumen

CMF Decision es un modelo de clasificación de texto desarrollado por infosave bajo el formato CMF (Cortiq Model Format). A diferencia de los modelos generativos, no produce tokens: utiliza un mecanismo de "resonancia" en el que cada etiqueta candidata intenta reconstruir la representación de la entrada, y el sistema selecciona la etiqueta con menor error de reconstrucción o se abstiene cuando la confianza es insuficiente. Está pensado para tomar decisiones —enrutar una petición, clasificar una intención o elegir una herramienta— en milisegundos y de forma totalmente local.

El modelo se distribuye como un único fichero portable (.cmf) que agrupa el encoder, las habilidades (skills) entrenadas y las reglas de decisión. El repositorio ocupa unos 2,9 GB e incluye de serie las skills banking77, clinc150 y massive, todas en inglés, además de permitir añadir habilidades propias. La licencia Apache 2.0 y su ejecución en CPU, Metal (Apple Silicon) y Vulkan lo sitúan como alternativa ligera a los LLM en tareas de enrutamiento y clasificación de intenciones.

Es relevante ahora porque propone un patrón híbrido: decisiones locales gratuitas y ultrarrápidas (1,10–2,58 ms p50 en GPU) con un "oráculo" opcional en la nube para los casos difíciles, cuyas respuestas pueden incorporarse a nuevas skills locales (auto-skills). Frente a Jev 1.13, logra mayor exactitud en BANKING77 y MASSIVE con un coste por decisión entre uno y dos órdenes de magnitud menor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de decisión basado en reconstrucción por resonancia; formato CMF (Cortiq Model Format), sin generación de tokens |
| Parametros totales | no disponible (el repositorio ocupa 2,9 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (fichero unico portable, `cortiq-decision.cmf`) |

## Arquitectura y entrenamiento

La arquitectura CMF combina un encoder con skills entrenadas específicamente y reglas de decisión que viajan juntas en un único fichero desplegable. El mecanismo central no es la generación autorregresiva de tokens, sino la "resonancia": cada etiqueta disponible intenta reconstruir la representación interna de la entrada y el modelo elige la que minimiza el error de reconstrucción. Esos mismos errores de reconstrucción actúan como señal de incertidumbre, lo que permite al modelo abstenerse en lugar de forzar una respuesta incorrecta. El sistema admite ejecución en CPU, Metal y Vulkan, y expone una API compatible con el formato de petición TypeSafe System One (adaptador Jev, opcional).

Los datos de entrenamiento del encoder base, el número de tokens y la composición del dataset no se detallan en la información disponible. Tampoco se indica si hubo RLHF, DPO u otras técnicas de alineación. Sí se documenta que las skills se entrenan sobre conjuntos de intención conocidos (banking77, clinc150, massive) y que, a partir de Cortiq 0.8.6, las peticiones para las que ninguna skill fue entrenada se aprenden de las respuestas de un oráculo externo en forma de auto-skills, con cuarentena para las etiquetas que el oráculo rara vez selecciona. La respuesta identifica el modelo local como `cmf-decision-0.8.5`.

## Capacidades

- Clasificación de intenciones (intent classification) en inglés, con skills incluidas para banking77, clinc150 y massive.
- Enrutamiento semántico (semantic routing): asignación de una consulta a una ruta, cola o servicio concreto.
- Selección de herramientas (tool selection) en agentes, sin generar texto intermedio.
- Salida estructurada (structured output): devuelve una etiqueta seleccionada o una abstención explícita.
- Mecanismo de abstención cuando la incertidumbre supera un umbral, con precisión del 97,24–98,70% sobre las respuestas aceptadas.
- Skills personalizadas: el usuario puede entrenar y conectar sus propias habilidades.
- Oráculo opcional (por ejemplo, un LLM en la nube) para casos desconocidos, cuyas respuestas alimentan auto-skills locales.
- Compatibilidad con el formato de petición TypeSafe System One mediante el flag `--jev-compatible`.
- Inferencia on-device en CPU, Metal y Vulkan, con aceleración de todo el flujo (no solo del kernel de reconstrucción).

## Casos de uso

- Atención al cliente bancaria: enrutar automáticamente mensajes a categorías como `card_arrival` o `lost_card` con la skill banking77 (93,34% de exactitud), sin coste de API y en milisegundos.
- Enrutamiento de consultas hacia LLM: decidir localmente si una petición va a un modelo pequeño, a uno grande o a un humano, reduciendo el gasto en tokens y la latencia del sistema.
- Selección de herramientas en agentes: elegir qué herramienta o función invocar ante una entrada del usuario, integrándose en pipelines de agents y multi-step reasoning como paso previo a la acción.
- Clasificación de tickets de soporte: etiquetar grandes volúmenes de tickets (clinc150, 96,18%) para su triaje y asignación automática a equipos.
- Asistentes de voz on-device: detección de intención en dispositivos Apple Silicon o GPU Vulkan con latencias p50 de 2,28–2,58 ms y 1,10–1,24 ms respectivamente, sin conexión a la nube.
- Moderación y routing de mensajes en plataformas de mensajería: clasificar intenciones y decidir la acción (respuesta automática, escalado o bloqueo) manteniendo los datos en el dispositivo.
- Despliegue en entornos con requisitos de privacidad o sin conectividad: al ejecutarse en local y abstenerse cuando no está seguro, permite sistemas de decisión que no dependen de servicios externos.
- Híbrido local-nube para producción: usar decisiones locales gratuitas y activar el oráculo solo en los casos de baja confianza (configuración con coste de 3,01–8,48 USD por millón de decisiones).

## Benchmarks y rendimiento

Exactitud sobre el conjunto completo de test, comparada con Jev 1.13:

| Dataset | CMF Decision (Cortiq) | Jev 1.13 |
|---|---|---|
| BANKING77 | 93,34% | 85,58% |
| CLINC150 | 96,18% | 96,76% |
| MASSIVE | 86,15% | 85,78% |

Con abstención activada: 97,24–98,70% de respuestas aceptadas correctas, respondiendo localmente entre el 54,30% y el 92,11% de las peticiones según la tarea.

Comparativa frente a Laya (checkpoint base en inglés, BANKING77, Apple M4, protocolo de estrés con 77 opciones simultáneas):

| Sistema | Exactitud | Latencia p50 |
|---|---|---|
| Skill CMF entrenada | 93,34% | 3,10 ms |
| Laya, checkpoint base en ingles | 35,65% | 917,59 ms |

Latencia (texto completo a decisión, misma máquina en cada panel):

| Hardware | Latencia p50 |
|---|---|
| RTX PRO 4000 (Vulkan) | 1,10–1,24 ms |
| Apple M4 (Metal/CPU) | 2,28–2,58 ms |

Coste por millón de decisiones (extrapolado de ejecuciones registradas, no es una tarifa de hosting):

| Configuracion | BANKING77 | CLINC150 | MASSIVE |
|---|---|---|---|
| Cortiq + oraculo (hibrido) | 3,01 USD | 3,53 USD | 8,48 USD |
| Jev | 183,69 USD | 271,61 USD | 110,86 USD |

La ejecución híbrida con oráculo (DeepSeek V4.1 Flash para casos difíciles) alcanzó 93,93% / 97,47% / 88,00% de exactitud global. Los 10.554 ejemplos de test conservan sus decisiones y abstenciones de CPU al pasar a GPU, sin reentrenamiento.

## Requisitos de hardware

- CPU: funciona sin configuración adicional; es el modo por defecto de la CLI de Cortiq.
- Apple Silicon: soporte Metal mediante `CORTIQ_DECISION_DEVICE=metal`. Medido sobre Apple M4 con 2,28–2,58 ms p50.
- GPU Vulkan: soporte mediante `CORTIQ_DECISION_DEVICE=vulkan` (requiere driver Vulkan). Medido sobre NVIDIA RTX PRO 4000 con 1,10–1,24 ms p50.
- Multi-GPU: usar `CORTIQ_DECISION_VULKAN_ADAPTER` para seleccionar el adaptador por un fragmento único del nombre de la GPU.
- VRAM estimada: no disponible en la información proporcionada.
- Cabe en GPU de consumo: no se especifican modelos concretos más allá de la RTX PRO 4000; el modo CPU permite ejecución sin GPU dedicada.
- Opciones de despliegue: CLI `cortiq-cli` (Rust 1.88 o superior, instalable con `cargo install cortiq-cli --locked`), servidor local con `cortiq serve` y API híbrida alojada en allaigate Routing API.
- Latencia adicional: en RTX el tráfico disperso es más lento y Metal puede presentar peores colas bajo carga de escritorio; se recomienda flujo continuo precalentado en la GPU NVIDIA.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Exactitud BANKING77 | Latencia p50 |
|---|---|---|---|---|---|---|
| CMF Decision (Cortiq) | Clasificador encoder con resonancia y abstención | ingles | CMF | Apache 2.0 | 93,34% | 1,10–3,10 ms |
| Jev 1.13 (TypeSafe System One) | Modelo de decisión | no disponible | no disponible | no disponible | 85,58% | no disponible |
| Laya (checkpoint base en ingles) | Modelo de decisión | ingles | no disponible | no disponible | 35,65% (prueba de estrés con 77 opciones) | 917,59 ms |

La comparación con Laya procede de una prueba de estrés con las 77 etiquetas de BANKING77 a la vez y no representa su mejor resultado alcanzable: no se probaron shortlisting ni multilingüe, y las condiciones de entrenamiento difieren. No se dispone de datos de licencia, formato o latencia de Jev y Laya en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; cualquier uso en otros idiomas queda fuera de las capacidades declaradas.
- El formato de pesos es propietario (CMF) y la librería `cortiq` es específica del ecosistema, lo que limita la interoperabilidad con herramientas estándar como transformers, vLLM o llama.cpp.
- No se especifican parámetros totales, longitud de contexto ni tipos de cuantización, lo que dificulta el dimensionado fino de recursos.
- El modelo no genera texto: no sirve para tareas generativas, de resumen o conversacionales.
- La abstención reduce la cobertura local hasta el 54,30% en algunas tareas, lo que obliga a definir una estrategia de respaldo (oráculo o revisión humana) para producción.
- El oráculo opcional depende de servicios externos (por ejemplo, OpenRouter o DeepSeek V4.1 Flash) e introduce coste y dependencia de red en esos casos.
- Los datos de benchmarks publicados por el autor no han sido verificados de forma independiente.
- Adopción muy baja en HuggingFace (178 descargas y 1 like en la fecha de consulta), con poca comunidad y sin garantías de mantenimiento a largo plazo.
- No se documentan sesgos conocidos, riesgo de alucinación (limitado por no generar texto) ni evaluación específica por subgrupos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de las skills y de los datasets subyacentes (banking77, clinc150, massive) antes de desplegar en producción.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/infosave/cmf-decision
- Space de demostracion: https://huggingface.co/spaces/infosave/cmf-decision
- Documentacion sobre el oraculo: https://huggingface.co/infosave/cmf-decision/blob/main/ORACLE.md
- Documentacion de la API: https://huggingface.co/infosave/cmf-decision/blob/main/API.md
- Benchmarks: https://huggingface.co/infosave/cmf-decision/blob/main/BENCHMARKS.md
- Guia de GPU (Metal y Vulkan): https://huggingface.co/infosave/cmf-decision/blob/main/GPU.md
- Comparativa con Laya: https://huggingface.co/infosave/cmf-decision/blob/main/LAYA.md
- README en ruso: https://huggingface.co/infosave/cmf-decision/blob/main/README_RU.md
- Servicio de enrutamiento allaigate: https://api.allaigate.com/
- Guia de integracion de la API: https://api.allaigate.com/en/docs
- CLI en crates.io: https://crates.io/crates/cortiq-cli
- Registro de procedencia que menciona el modelo: https://pirateface.co/provenance
