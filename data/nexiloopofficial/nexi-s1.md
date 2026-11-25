# nexiloopofficial/nexi-s1

## Resumen

NEXI-S1 es un modelo de decisión de dominio muy específico, publicado por el usuario nexiloopofficial en Hugging Face bajo licencia Apache 2.0. No es un modelo de lenguaje generativo al uso: se trata de un scorer de atención sobre opciones que, dado un objetivo y un conjunto de acciones de interfaz de usuario tipadas (candidatas), devuelve una elección ordenada junto con una probabilidad de abstención calibrada. Su ámbito declarado es el "computer use", es decir, la selección de la siguiente acción en un entorno de interfaz gráfica o de navegador.

El modelo es extremadamente pequeño: 1,14 millones de parámetros, con un vocabulario hasheado de 4096 palabras y una arquitectura de encoder transformer sin codificación posicional. El autor reporta un rendimiento de aproximadamente 300 ms por decisión y unos 200 MB de RSS ejecutando en CPU con 8 vCPU, lo que lo sitúa en la categoría de modelos ligeros desplegables en hardware modesto sin GPU.

Su relevancia es acotada pero clara: propone un contrato de inferencia explícito y tipado (`choice`, `probs`, `abstain_prob`, `abstained`) que facilita la integración en agentes de automatización de navegador, con abstención calibrada como mecanismo de seguridad ante objetivos no cubiertos. No obstante, el repositorio tiene 0 GB de tamaño declarado, 0 descargas y 0 likes en el momento de la consulta, y la información pública disponible es muy escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer sin codificación posicional (positionless) |
| Parametros totales | 1,14 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamaño del repo declarado: 0,0 GB) |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un encoder transformer sin codificación posicional, con un vocabulario hasheado de 4096 palabras. El mecanismo central es una "option-attention scorer": recibe un objetivo (goal) y un conjunto de acciones candidatas tipadas, y produce una distribución de probabilidad sobre ellas junto con una probabilidad de abstención. El vocabulario hasheado reduce el espacio de embeddings a un tamaño fijo y muy pequeño, coherente con los 1,14 M de parámetros.

El entrenamiento se realizó sobre episodios sintéticos de múltiples pasos, en los que el historial de pasos se incorpora al texto del objetivo mediante marcadores del tipo `[done: ...]`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. El propio autor documenta que la calibración de la abstención en objetivos no servidos es un compromiso abierto ("documented open tradeoff"), lo que sugiere que el mecanismo de abstención no está completamente resuelto.

## Capacidades

- Selección de la siguiente acción de interfaz de usuario a partir de un objetivo y un conjunto de acciones candidatas tipadas.
- Devolución de una elección ordenada con distribución de probabilidad sobre las opciones (`choice`, `probs`).
- Abstención calibrada mediante `abstain_prob` y `abstained`, pensada para no actuar cuando el objetivo queda fuera de la distribución de entrenamiento.
- Procesamiento de historial de pasos multi-paso incorporado en el texto del objetivo (`[done: ...]`).
- Ejecución en CPU sin GPU, con latencia declarada de ~300 ms por decisión y ~200 MB de RSS.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling genérico ni razonamiento multi-turno conversacional.

## Casos de uso

- Automatización de navegador con selección de acción: dado un objetivo y las acciones disponibles en la página (clic, escritura, navegación), el modelo elige la siguiente acción y devuelve su probabilidad, integrándose en un bucle de agente CUA.
- Agentes de escritorio con abstención de seguridad: en flujos donde una acción errónea es costosa, el campo `abstained` permite detener el agente y escalar a un humano cuando la confianza es baja.
- Orquestación de pipelines de RPA ligeros: al ejecutarse en CPU con ~200 MB de RSS, puede desplegarse junto a otros servicios en el mismo host sin GPU dedicada.
- Enrutado de intenciones en asistentes: usar el scorer para elegir entre un conjunto finito de acciones o herramientas tipadas a partir de un objetivo en lenguaje natural.
- Evaluación de políticas de decisión en entornos simulados: el historial `[done: ...]` permite alimentar el estado de un episodio sintético para probar estrategias antes de llevarlas a un navegador real.
- Filtrado previo en sistemas multi-agente: como primera etapa barata que descarta opciones inviables antes de invocar un modelo mayor y más costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card remite a `nexi-cua/BENCHMARKS.md` del repositorio `github.com/PupppyLoverr/NEXI-Models-Drivers` para resultados en navegador real y modos de fallo, pero dichos datos no se incluyen en la información proporcionada.

Los únicos datos de rendimiento declarados son operativos: ~300 ms por decisión y ~200 MB de RSS en una máquina de 8 vCPU sin GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecución en CPU.
- GPU recomendadas: no disponible; no se documenta soporte GPU.
- Cabe en GPU consumer: no disponible (no se documenta); por tamaño (1,14 M de parámetros) cabría en cualquier GPU, pero no se especifica soporte.
- CPU: el autor reporta ~300 ms por decisión en 8 vCPU y ~200 MB de RSS.
- Opciones de despliegue: no se documentan frameworks concretos (vLLM, llama.cpp, Ollama, TGI); el contrato de inferencia es una salida JSON con `choice`, `probs`, `abstain_prob` y `abstained`.
- Latencia y throughput: ~300 ms por decisión en la configuración de referencia; throughput no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (scorers de decisión para computer use de tamaño similar), ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La calibración de la abstención en objetivos no servidos es un compromiso abierto reconocido por el propio autor; no debe asumirse que `abstained` sea fiable en dominios fuera de entrenamiento.
- Entrenado sobre episodios sintéticos; el comportamiento en interfaces reales puede divergir, y la model card remite a benchmarks en navegador real que no se incluyen aquí.
- Vocabulario hasheado de 4096 palabras: la cobertura léxica es muy limitada y puede degradar la representación de objetivos con vocabulario fuera de ese conjunto.
- No se documentan idiomas soportados; no hay garantía de funcionamiento multilingüe.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datos sintéticos, puede heredar los sesgos de la generación de dichos datos.
- Riesgo de alucinación en el sentido de seleccionar una acción con alta probabilidad cuando ninguna es adecuada; el mecanismo de abstención es la única salvaguarda documentada.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo se distribuye sin garantías y con documentación mínima.
- Repositorio con 0 descargas, 0 likes y tamaño declarado de 0,0 GB: la disponibilidad real de los pesos no está confirmada por la información proporcionada.
- No se documentan requisitos de formato de entrada más allá del contrato de salida; la integración requiere leer el repositorio de drivers del autor.

## Enlaces

- Hugging Face: https://huggingface.co/nexiloopofficial/nexi-s1
- Repositorio de drivers y benchmarks: https://github.com/PupppyLoverr/NEXI-Models-Drivers
- Benchmarks en navegador real: https://github.com/PupppyLoverr/NEXI-Models-Drivers (ruta `nexi-cua/BENCHMARKS.md`)
