# mradermacher/code-simple-rl-1.5b-GGUF

## Resumen

El modelo `code-simple-rl-1.5b-GGUF` es una versión cuantizada en formato GGUF del modelo `tanyagoyal-p/code-simple-rl-1.5b`, preparada por el equipo de mradermacher. El modelo base, por su nombre y por las referencias a proyectos como `simpleRL-reason` y el paper JustRL, parece haber sido entrenado mediante un enfoque de aprendizaje por refuerzo (RL) aplicado a tareas de razonamiento y código, aunque no se dispone de documentación oficial que lo confirme. Esta versión GGUF permite ejecutar el modelo en hardware modesto gracias a las distintas cuantizaciones ofrecidas, que van desde Q2_K hasta f16.

Con 1.777.088.000 parámetros (aproximadamente 1,78 mil millones), se trata de un modelo compacto orientado a tareas de razonamiento y generación de código, con soporte para inglés. La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de razonamiento de tamaño pequeño en entornos con recursos limitados, como portátiles o GPUs de gama media, sin necesidad de infraestructura de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base `tanyagoyal-p/code-simple-rl-1.5b`. Por el tamaño (1,78B) y el nombre, es probable que se trate de un transformer decoder con atención estándar, pero no hay confirmación oficial. El nombre "simple-rl" sugiere que el entrenamiento utilizó una receta de aprendizaje por refuerzo simplificada, similar a la descrita en el proyecto `simpleRL-reason` o en el paper JustRL, que aboga por un entrenamiento de una sola etapa con hiperparámetros fijos. Sin embargo, no se han publicado detalles sobre el dataset, el número de tokens de entrenamiento ni el método de alineación (RLHF, DPO, etc.). La cuantización GGUF fue realizada por mradermacher a partir de los pesos originales en formato safetensors.

## Capacidades

- Generación de texto y razonamiento: el modelo base está orientado a tareas de razonamiento, probablemente con capacidad de "thinking mode" o razonamiento encadenado, aunque no se confirma en la documentación.
- Generación de código: por el nombre "code-simple-rl", se infiere que tiene capacidades de generación y comprensión de código, pero no hay benchmarks que lo verifiquen.
- Conversación: el tag `conversational` indica que puede mantener diálogos multi-turno.
- Multilingüe: solo se declara soporte para inglés (`en`).
- Tool calling / function calling: no se menciona en la información disponible.
- Capacidades de agente: no se menciona.

## Casos de uso

- Inferencia en dispositivos edge: gracias a las cuantizaciones pequeñas (Q2_K, Q3_K), el modelo puede ejecutarse en Raspberry Pi o dispositivos móviles con 1-2 GB de RAM, permitiendo asistentes de razonamiento locales.
- Prototipado rápido: los desarrolladores pueden probar el modelo en una GPU consumer (por ejemplo, RTX 3060) con la cuantización Q4_K_M (1,2 GB) para validar ideas antes de escalar a modelos mayores.
- Generación de código asistida en entornos sin conexión: al ser un modelo pequeño, puede integrarse en IDEs o editores de texto para autocompletado de código en máquinas sin acceso a la nube.
- Educación e investigación: sirve como banco de pruebas para estudiar técnicas de RL en modelos pequeños, ya que su tamaño permite experimentar con fine-tuning o evaluación en hardware asequible.
- Automatización de tareas de razonamiento simple: puede utilizarse para clasificar o extraer información de textos cortos en inglés, siempre que la tarea no requiera un contexto muy largo.
- Despliegue en servidores de baja potencia: con la cuantización Q8_0 (2,0 GB), puede servir peticiones en un VPS con 4 GB de RAM, ofreciendo respuestas de razonamiento básico a bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, entre 0,9 GB (Q2_K) y 3,7 GB (f16). La mayoría de cuantizaciones (Q4_K_M, Q5_K_M) requieren entre 1,2 y 1,4 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones más pequeñas. Para Q8_0 o f16 se recomienda una GPU con 4 GB o más (por ejemplo, GTX 1650, RTX 3050, RTX 4090).
- Compatibilidad con consumer GPU: sí, todas las cuantizaciones caben en GPUs de consumo actuales.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores como llama.cpp server. También puede usarse con vLLM si se convierte a otro formato, pero no es el flujo habitual.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, un modelo de 1,5B cuantizado a Q4 puede generar decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. El modelo base no tiene documentación pública que permita establecer comparaciones con Qwen2.5-1.5B, Llama-3.2-1.5B o similares. Se recomienda consultar la página del modelo base para obtener más datos.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del modelo base ni de la cuantización, lo que puede impedir su uso comercial sin autorización expresa.
- Sin documentación de sesgos: no hay información sobre posibles sesgos de género, raza o idioma.
- Riesgo de alucinación: al ser un modelo pequeño entrenado con RL, puede generar respuestas plausibles pero incorrectas, especialmente en tareas de razonamiento complejo.
- Contexto limitado: no se conoce la longitud de contexto, pero por el tamaño del modelo es probable que sea corta (4K-8K tokens), lo que limita tareas con documentos largos.
- Idioma: solo inglés, no soporta otros idiomas de forma nativa.
- Producción: al no haber benchmarks ni documentación de estabilidad, no se recomienda su uso en entornos críticos sin una evaluación previa.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/mradermacher/code-simple-rl-1.5b-GGUF)
- [Modelo base (tanyagoyal-p/code-simple-rl-1.5b)](https://huggingface.co/tanyagoyal-p/code-simple-rl-1.5b)
- [Proyecto simpleRL-reason (GitHub)](https://github.com/hkust-nlp/simpleRL-reason)
- [Paper JustRL (arXiv)](https://arxiv.org/abs/2512.16649)
- [Perfil de mradermacher en HuggingFace](https://huggingface.co/mradermacher)
