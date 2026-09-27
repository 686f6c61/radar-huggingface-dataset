# davidwdw/fa-pi05-attnfix-balanced-3000-95d33410065b-3797cff7cecb

## Resumen

fa-pi05-attnfix-balanced-3000-95d33410065b es un archivo versionado ("fleet archive") publicado por el usuario davidwdw en Hugging Face. Por el nombre del repositorio y la model card, se trata de un checkpoint de la familia π₀.₅ (pi05), un modelo visión-lenguaje-acción (VLA) descrito en arXiv:2504.16054, con una corrección de atención ("attnfix") y un ajuste sobre un conjunto balanceado de 3000 elementos. El repositorio ocupa 12,4 GB y se distribuye como snapshot inmutable con verificación SHA256SUMS.

La model card es mínima: solo indica la receta canónica (2026-09-22_b1k_task00_pi05_attention_consistent_h20), el tier "params+assets" y la obligación de usar la revisión exacta registrada. No declara licencia, idiomas, pipeline, número de parámetros ni formato de pesos. Esto lo convierte en un artefacto útil para reproducir experimentos de robótica con π₀.₅, pero no en un modelo listo para producción sin documentación adicional.

Su relevancia es acotada y experimental: los checkpoints π₀.₅ se emplean para control robótico end-to-end a partir de instrucciones en lenguaje natural e imágenes. Este archivo concreto parece un experimento de ajuste con atención consistente sobre datos balanceados, pero carece de métricas publicadas y de ficha técnica completa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible para este checkpoint. La familia π₀.₅ es un modelo visión-lenguaje-acción (VLA) basado en π₀, según arXiv:2504.16054 |
| Parámetros totales | No disponible. El repositorio ocupa 12,4 GB, pero no se especifica la precisión de los pesos |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible. La model card menciona "params+assets" y SHA256SUMS, sin detallar el formato |
| Tamaño del repositorio | 12,4 GB |
| Fecha de creación | 2026-09-26 |
| Última actualización | 2026-09-28 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible sobre este checkpoint no detalla su arquitectura interna. Los resultados de búsqueda sitúan la familia π₀.₅ como un modelo VLA construido sobre π₀, entrenado con co-training sobre datos heterogéneos y con una técnica de aislamiento de conocimiento ("knowledge insulation") orientada a mejorar la generalización en entornos abiertos. Los checkpoints base de la familia se preentrenan con más de 10 000 horas de datos robóticos, según la descripción del repositorio openpi_subtask_generation.

En cuanto a este archivo concreto, la receta canónica registrada es 2026-09-22_b1k_task00_pi05_attention_consistent_h20. El sufijo "attnfix" sugiere una corrección relacionada con la consistencia de la atención, y "balanced-3000" apunta a un ajuste sobre un conjunto balanceado de 3000 elementos, aunque no hay documentación que confirme estas interpretaciones. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron RLHF, DPO u otras técnicas de alineamiento.

## Capacidades

- Control robótico end-to-end: la familia π₀.₅ genera acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural.
- Generalización en entornos abiertos: el paper de π₀.₅ destaca la generalización fuera del laboratorio como objetivo central.
- Co-training con datos heterogéneos: el preentrenamiento combina fuentes diversas de datos robóticos (más de 10 000 horas según la documentación de openpi).
- Fine-tuning sobre datasets propios: los repositorios de lerobot y openpi proporcionan ejemplos para ajustar los checkpoints base.
- No hay evidencia documentada, para este checkpoint, de tool calling, function calling, razonamiento multi-paso, capacidades de agente, matemáticas, generación de código, audio o modo de pensamiento.
- El soporte multilingüe no está documentado; solo se sabe que las instrucciones de control se expresan en lenguaje natural, sin detalle de idiomas.

## Casos de uso

- Reproducción de experimentos de atención consistente: el snapshot inmutable y la verificación SHA256SUMS permiten replicar exactamente la receta 2026-09-22_b1k_task00_pi05_attention_consistent_h20 en un entorno controlado.
- Evaluación de la corrección "attnfix": comparar este checkpoint con otros de la misma familia para medir si la corrección de atención altera la estabilidad de las políticas generadas.
- Fine-tuning en un dominio robótico específico: partir de este archivo para ajustar una política de manipulación en un conjunto de tareas propio, usando el stack de openpi o lerobot.
- Investigación en generalización open-world: emplearlo como variante experimental frente a los checkpoints base y fine-tuned de π₀.₅ para estudiar el efecto del balanceo de datos.
- Simulación previa a hardware real: integrarlo en entornos tipo LIBERO para validar políticas antes de desplegarlas en un robot físico, reduciendo riesgo y coste.
- Auditoría de seguridad de políticas VLA: al ser un snapshot inmutable, sirve para análisis forense del comportamiento del modelo ante situaciones límite.
- Docencia y divulgación técnica: ilustrar el flujo de trabajo de un VLA con un checkpoint pequeño (12,4 GB) que cabe en hardware de gama alta para consumidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta. Como referencia basada solo en el tamaño del repositorio (12,4 GB), si los pesos están en bf16/fp16 el modelo ocuparía unos 12,4 GB y necesitaría del orden de 16-24 GB de VRAM para inferencia con activaciones. Si estuvieran en fp32, el número de parámetros sería de aproximadamente 3,1 mil millones y cabría en GPUs de 12-16 GB. Estas cifras son estimaciones condicionales, no datos confirmados.
- GPU recomendadas: no hay recomendación oficial. Por tamaño, una NVIDIA RTX 4090 o RTX 3090 (24 GB) podría ser suficiente en bf16; para fp32 bastarían GPUs de 16 GB. En entornos de datacenter, A100 (40/80 GB) o H100 ofrecen margen sobrado.
- ¿Cabe en GPU de consumidor? Probablemente sí en tarjetas de 24 GB si los pesos están en bf16; en fp32 cabría en 16 GB. No hay confirmación del fabricante ni de la comunidad.
- Opciones de despliegue: no se documentan. Por la naturaleza VLA del modelo, lo esperable es PyTorch con librerías específicas como openpi o lerobot. vLLM, TGI, llama.cpp u Ollama no ofrecen soporte estándar para este tipo de política.
- Latencia y throughput: no disponibles. En control robótico, la inferencia se ejecuta en bucle cerrado y la frecuencia depende del hardware y de la implementación, pero no hay cifras publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Documentación |
|---|---|---|---|---|---|
| davidwdw/fa-pi05-attnfix-balanced-3000-95d33410065b | No disponible | No disponible | No disponible | Pública en Hugging Face | Model card mínima |
| lerobot/pi05_libero_base | No disponible | No disponible | No disponible | Pública en Hugging Face | Checkpoint base de π₀.₅ para LIBERO |
| lerobot/pi05_libero_finetuned_v044 | No disponible | No disponible | No disponible | Pública en Hugging Face | Checkpoint ajustado para LIBERO |
| π₀ (modelo predecesor) | No disponible en la información proporcionada | No disponible | No disponible | Referenciado en la literatura de π₀.₅ | Paper y repositorios asociados |

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial ni redistribución sin consultar al autor; el riesgo legal es alto.
- Documentación insuficiente: no hay información sobre parámetros, contexto, datos de entrenamiento ni evaluación, lo que impide reproducir el resultado sin acceso a la receta completa.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a otros checkpoints de la familia.
- Posible sobreajuste: el ajuste "balanced-3000" puede estar sesgado hacia la distribución de ese conjunto concreto.
- El sufijo "attnfix" implica que existía un problema previo de atención; no se documenta si la corrección es completa o si introduce otros efectos.
- Snapshot inmutable: el repositorio es un archivo fijo, no un espejo actualizado; no cabe esperar mantenimiento ni correcciones posteriores.
- Sesgos desconocidos: al no detallarse la composición del dataset, no se pueden evaluar sesgos demográficos, geográficos o de tarea.
- Riesgo en robótica real: una política VLA puede generar acciones inseguras; se requiere validación en simulación y protocolos de parada antes de usarla en hardware físico.
- Sin soporte de tool calling, agentes o texto general: no es un modelo de propósito general y no debe emplearse como sustituto de un LLM.
- Idiomas y contexto no disponibles: se desconoce si las instrucciones en castellano funcionan correctamente.

## Enlaces

- Hugging Face: https://huggingface.co/davidwdw/fa-pi05-attnfix-balanced-3000-95d33410065b
- Paper de π₀.₅: https://arxiv.org/abs/2504.16054
- Repositorio openpi_subtask_generation: https://github.com/jorgemunozl/openpi_subtask_generation
- Checkpoint base π₀.₅ para LIBERO: https://huggingface.co/lerobot/pi05_libero_base
- Checkpoint ajustado π₀.₅ para LIBERO: https://huggingface.co/lerobot/pi05_libero_finetuned_v044
