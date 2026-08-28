# chatpbc11121/VibePilot-82M

## Resumen

VibePilot-82M es un modelo de lenguaje causal denso de 82 millones de parámetros, desarrollado por el usuario chatpbc11121, diseñado como un "estratega de decisiones de negocio" basado en IA. Su objetivo declarado es convertir señales empresariales ambiguas en opciones explícitas, supuestos, riesgos y acciones recomendadas, separando hechos de suposiciones y calibrando la incertidumbre. Se presenta como un *technical preview* experimental, no como un producto listo para producción.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y un tamaño de repositorio de 3,0 GB. Fue entrenado mediante fine-tuning completo sobre un conjunto de datos muy pequeño, según indica su propia documentación, y los resultados de su evaluación interna son débiles (11,11 % en una prueba comparativa frente a modelos generalistas de gran tamaño). Su relevancia actual es limitada: sirve como experimento de investigación o demostración de un flujo de trabajo de entrenamiento, pero no como herramienta fiable para asesoramiento empresarial real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal denso (decoder-only) |
| Parametros totales | 82 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del checkpoint base, no especificado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje causal denso de 82 millones de parámetros, sin indicación de variantes como MoE o atención lineal. El entrenamiento consistió en un fine-tuning completo (full-parameter) sobre datos de razonamiento empresarial, aunque la documentación menciona que el proceso se realizó en CPU y con un dataset muy reducido. No se especifican el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El checkpoint base del que parte no se identifica explícitamente; la model card indica que el contexto se hereda de ese checkpoint, pero no se proporciona su nombre ni sus características.

## Capacidades

- Generación de texto en inglés con enfoque en análisis de negocio, descomposición de decisiones y calibración de incertidumbre.
- Capacidad teórica para separar hechos de supuestos, identificar riesgos y recomendar acciones, según su diseño.
- Soporte de tool calling y function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales (vision, audio, thinking mode): no documentadas.
- En la práctica, su rendimiento medido es muy bajo (11,11 % en el benchmark interno), por lo que estas capacidades son solo nominales y no se han validado en escenarios reales.

## Casos de uso

- Experimentación académica: sirve como ejemplo de un pipeline completo de fine-tuning, evaluación y publicación de un modelo pequeño, útil para estudiantes o investigadores que quieran reproducir el flujo de trabajo.
- Prueba de concepto de asesoramiento empresarial: se puede utilizar en entornos controlados para explorar cómo un modelo pequeño aborda la descomposición de decisiones, aunque sus respuestas serán poco fiables.
- Benchmarking de metodologías de evaluación: el repositorio incluye un harness de evaluación y un benchmark de estrategia de negocio, útil para comparar metodologías de scoring entre modelos.
- Desarrollo de prototipos de bajo coste: al ser un modelo de 82M, puede ejecutarse en hardware modesto, permitiendo probar integraciones con frameworks como Transformers sin necesidad de GPUs potentes.
- Validación de técnicas de fine-tuning en dominios específicos: permite estudiar el efecto del fine-tuning completo en un dominio vertical con recursos limitados.
- Demostración de buenas prácticas de publicación: el repositorio incluye checklist de release, configuración de entrenamiento y scripts de evaluación, útil como plantilla para otros proyectos.

## Benchmarks y rendimiento

La model card incluye un benchmark interno propio, no estandarizado, que mide capacidades de consultoría empresarial con una rúbrica estructurada. Los resultados medidos en la misma ejecución son:

| Modelo | Puntuación global |
|---|---|
| VibePilot-82M | 11,11 % |
| GPT-5 nano | 97,78 % |
| GPT-5 mini | 100,00 % |

Estos datos provienen del propio repositorio y no deben interpretarse como una comparativa con modelos de tamaño similar, ya que GPT-5 nano y GPT-5 mini son modelos mucho más grandes y no comparables. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Al tratarse de un modelo de 82M parámetros, el uso de VRAM es muy reducido: en FP32 ocuparía aproximadamente 328 MB, y en FP16 unos 164 MB, por lo que cabe en cualquier GPU consumer (por ejemplo, GTX 1060 6GB o superior) e incluso en CPU.
- No se proporcionan datos oficiales de VRAM, latencia o throughput en la documentación.
- Opciones de despliegue: al ser un modelo de Transformers con pesos safetensors, puede cargarse con la librería `transformers` en Python. También podría convertirse a GGUF para su uso con llama.cpp u Ollama, aunque no se ha documentado.
- Para inferencia en producción se recomendaría vLLM o TGI, pero dado el estado experimental del modelo, no se ha validado su uso en esos entornos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables del mismo tamaño (≈80M) y misma tarea (asesoramiento empresarial). El benchmark interno compara con GPT-5 nano y GPT-5 mini, pero no son comparables por tamaño ni por propósito. No se han encontrado alternativas de código abierto con características equivalentes en la información disponible.

## Limitaciones y advertencias

- El modelo es un *technical preview* explícitamente no apto para producción: su propia documentación advierte que no debe usarse para decisiones empresariales no supervisadas.
- Rendimiento muy bajo en la evaluación interna (11,11 %), lo que indica una capacidad limitada para generar respuestas útiles y coherentes en su dominio objetivo.
- Entrenado con un dataset muy pequeño, lo que aumenta el riesgo de sobreajuste y alucinaciones.
- Solo soporta inglés; no hay soporte multilingüe.
- No se especifica la longitud de contexto, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- No se han documentado sesgos específicos, pero al ser un modelo pequeño entrenado con datos limitados, es probable que presente sesgos derivados del corpus de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el estado del modelo y su falta de fiabilidad lo desaconsejan para aplicaciones reales.
- No se han publicado evaluaciones de seguridad, robustez o factibilidad más allá del benchmark interno.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/chatpbc11121/VibePilot-82M
- Repositorio mencionado en la model card (posible typo): https://huggingface.co/chatpbc1/VibePilot-255B
- Documentación de Transformers: https://huggingface.co/docs/transformers/main/en/training
- Documentación de TRL SFT Trainer: https://huggingface.co/docs/trl/en/sft_trainer
