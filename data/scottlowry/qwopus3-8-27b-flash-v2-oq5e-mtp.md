# scottlowry/Qwopus3.8-27B-Flash-V2-oQ5e-mtp

## Resumen

Qwopus3.8-27B-Flash-V2-oQ5e-mtp es una versión cuantizada a 5 bits del modelo Jackrong/Qwopus3.8-27B-Flash-V2, publicada por el usuario scottlowry en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un artefacto de compresión: aplica cuantización de precisión mixta con la herramienta oQ (oMLX v0.7.0) sobre los pesos originales y los empaqueta en formato MLX safetensors, pensado específicamente para ejecución en Apple Silicon mediante la librería MLX. El resultado es un repositorio de 20,3 GB que contiene 27.781.427.952 parámetros (unos 27,8 mil millones) almacenados con 5 bits por peso y tamaño de grupo de 64.

El modelo subyacente, Qwopus3.8-27B-Flash-V2, es un post-entrenamiento de Qwopus3.8-27B-Flash, que a su vez deriva de Qwen3.8-27B. Según la documentación del autor original (Jackrong), esta familia está optimizada para cargas de trabajo agénticas: reduce el razonamiento ineficaz, acelera la finalización de tareas y mejora el formateo de código Python, con el objetivo de operar en entornos con recursos limitados. El sufijo "mtp" del nombre hace referencia a Multi-Token Prediction, un mecanismo de predicción de múltiples tokens por paso que se usa habitualmente como cabecera de borrador en decodificación especulativa.

La relevancia de esta ficha concreta es práctica: permite ejecutar un modelo de ~27,8B parámetros en equipos Apple con memoria unificada moderada, sacrificando precisión numérica a cambio de reducir el espacio de pesos de ~55,6 GB (bf16) a ~20 GB. El coste es que la licencia, los idiomas soportados y gran parte de las especificaciones del modelo base no están declarados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3_5, según el tag del repositorio); no se confirma si es densa o MoE |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no aplica / no disponible (no se ha confirmado que la arquitectura sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ (oMLX v0.7.0) de precisión mixta, 5 bits, tamaño de grupo 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (librería mlx) |
| Modelo base | Jackrong/Qwopus3.8-27B-Flash-V2 |
| Tamano del repositorio | 20,3 GB |
| Fecha de creacion | 2026-10-08 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Este repositorio no contiene ningún entrenamiento nuevo: es el resultado de aplicar cuantización de precisión mixta con oQ (oMLX v0.7.0) sobre los pesos de Jackrong/Qwopus3.8-27B-Flash-V2. La cuantización usa 5 bits por peso con tamaño de grupo de 64, una configuración que agrupa bloques de 64 pesos para compartir escalas y reducir el error de redondeo respecto a una cuantización uniforme. El tag de arquitectura declarado es qwen3_5, lo que sitúa el modelo en la familia Qwen 3, pero no se especifica en la información disponible si se trata de una arquitectura densa, de mezcla de expertos (MoE) o híbrida, ni se detallan la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO.

Sobre el modelo base sí hay algunos datos aportados por el autor original. Qwopus3.8-27B-Flash-V2 es un post-entrenamiento de Qwopus3.8-27B-Flash (el cual, a su vez, deriva de Qwen3.8-27B) orientado a eficiencia de inferencia y flujos agénticos: busca reducir el razonamiento ineficaz y acelerar la finalización de tareas, e incorpora mejoras en el formateo de código Python. La generación anterior, Qwopus3.8-27B-Flash, declaraba un 12,8 % más de velocidad de decodificación y 14,6 puntos porcentuales más de tasa de aceptación del borrador MTP respecto a su propio modelo base. El sufijo "mtp" del repositorio cuantizado indica que se conserva la cabecera de Multi-Token Prediction, lo que habilita decodificación especulativa con borrador integrado. No se documenta en la información disponible si la cuantización a 5 bits degrada la tasa de aceptación del borrador MTP.

## Capacidades

- Generación de texto y razonamiento general: el modelo base está descrito como orientado a cargas agénticas, con reducción del razonamiento ineficaz respecto a su predecesor.
- Generación y formateo de código: el modelo base incluye mejoras explícitas en el formateo de Python, lo que sugiere un uso previsto en tareas de programación.
- Flujos agénticos y razonamiento multi-paso: la descripción del modelo base menciona de forma explícita su optimización para "tareas agénticas de larga duración".
- Decodificación especulativa con Multi-Token Prediction (MTP): el nombre del repositorio indica que la cabecera MTP está presente, lo que permite generar varios tokens por paso de decodificación.
- Ejecución local en Apple Silicon: al estar en formato MLX safetensors, está pensado para inferencia en dispositivos con memoria unificada de Apple.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Visión, audio u otras modalidades: no disponible.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Asistentes de código en local sobre Mac: el modelo base declara mejoras en el formateo de Python y la versión cuantizada a 5 bits ocupa unos 20 GB, lo que permite ejecutar un modelo de ~27,8B en un MacBook Pro o Mac Studio sin conexión a servicios externos, útil cuando el código no puede salir de la máquina por motivos de confidencialidad.
- Agentes de larga duración en estaciones de trabajo Apple: la familia Qwopus está descrita como optimizada para tareas agénticas prolongadas con reducción del razonamiento ineficaz, y la cabecera MTP acelera la generación en bucles de varios pasos, donde la latencia acumulada es el factor dominante.
- Prototipado de agentes antes de desplegar en servidor: al ser un artefacto de cuantización con el mismo grafo que el modelo base, sirve para validar prompts, herramientas y flujos de trabajo en local antes de mover la carga a infraestructura con GPU, reduciendo el coste de iteración.
- Procesamiento de documentos y generación de resúmenes en un equipo de sobremesa: con 27,8B parámetros y decodificación especulativa, es viable generar resúmenes y extraer información estructurada de documentos largos sin depender de API externas, siempre que la longitud de contexto del modelo base lo permita (no declarada).
- Evaluación comparativa de cuantizaciones: este repositorio forma parte de una colección del mismo autor que incluye una variante oQ4e-mtp; disponer de varias precisiones del mismo modelo permite medir el impacto de 4 vs. 5 bits sobre la calidad, útil para decidir el punto de equilibrio entre memoria y fidelidad antes de fijar una configuración de producción.
- Educación e investigación en técnicas de cuantización: al documentar explícitamente el método (oQ/oMLX v0.7.0), los bits (5) y el tamaño de grupo (64), el repositorio sirve como caso reproducible para estudiar cuantización de precisión mixta en el ecosistema MLX.
- Pruebas de decodificación especulativa: la presencia del sufijo MTP permite experimentar con borradores integrados y medir tasas de aceptación en hardware Apple, un área poco cubierta por las herramientas de inferencia tradicionales de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado solo documenta el método de cuantización (oQ, oMLX v0.7.0), los bits (5), el tamaño de grupo (64) y el formato (MLX safetensors). No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni para este artefacto ni para su modelo base inmediato (Jackrong/Qwopus3.8-27B-Flash-V2) en la información recogida. Tampoco se dispone de mediciones de latencia o throughput de esta versión cuantizada. El único dato de rendimiento disponible corresponde a la generación anterior, Qwopus3.8-27B-Flash, y no debe extrapolarse a este repositorio.

## Requisitos de hardware

- VRAM / memoria estimada en inferencia: el repositorio ocupa 20,3 GB en disco; se necesitan aproximadamente 20-22 GB de memoria unificada o VRAM para cargar los pesos a 5 bits, más el espacio de la caché KV, que depende de la longitud de contexto efectiva (no declarada).
- Cabe en Apple Silicon con memoria unificada: Mac con 32 GB o más (familias M1/M2/M3/M4 Pro, Max y Ultra) es el escenario natural, dado que el formato es MLX y MLX solo se ejecuta en Apple Silicon. En máquinas de 16 GB el modelo no cabe con margen razonable.
- GPU dedicadas: no es el destino de este repositorio, ya que el formato MLX safetensors no es cargable directamente por CUDA. Para usar GPU NVIDIA habría que recurrir a la conversión al formato GGUF de la comunidad o al modelo base en bf16.
- Opciones de despliegue: mlx-lm / mlx-lm.server es la vía directa; LM Studio y otras interfaces que consumen MLX también pueden cargarlo. vLLM, TGI y llama.cpp no leen pesos MLX de forma nativa, por lo que requerirían conversión previa.
- Cuantización alternativa para GPUs: existe una versión GGUF de Qwopus3.8 27B Flash publicada por terceros, con un tamaño de 56,7 GB y 172.520 descargas, que se corresponde con pesos de mayor precisión y no con este artefacto de 5 bits.
- Latencia y throughput: no disponibles para esta versión cuantizada. Los únicos datos de referencia son del modelo base anterior (12,8 % de decodificación más rápida y 14,6 puntos porcentuales de mejora en aceptación del borrador MTP), y no son extrapolables.
- Nota: el sufijo "mtp" implica una cabecera adicional de predicción multi-token, que incrementa ligeramente el consumo de memoria respecto a un modelo equivalente sin ella.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottlowry/Qwopus3.8-27B-Flash-V2-oQ5e-mtp (este) | 27,8B | no disponible | MLX safetensors, 5 bits, grupo 64 | no disponible | HuggingFace, 0 descargas |
| scottlowry/Qwopus3.8-27B-Flash-oQ4e-mtp | no disponible (mismo modelo base, 4 bits) | no disponible | MLX safetensors, 4 bits | no disponible | HuggingFace, en la misma colección |
| Jackrong/Qwopus3.8-27B-Flash-V2 (modelo base) | 27B | no disponible | safetensors bf16 | no disponible | HuggingFace y API en Featherless |
| Jackrong/Qwopus3.8-27B-Flash (version anterior) | 27B | no disponible | safetensors bf16 | no disponible | HuggingFace, API en Featherless, GGUF de terceros (56,7 GB) |
| Qwopus3.8 27b Flash (GGUF, terceros) | 27B | no disponible | GGUF, 56,7 GB | no disponible | local-ai-zone, 172.520 descargas, 244 likes |

La comparación relevante es de compromiso memoria/fidelidad: este repositorio reduce los ~55,6 GB de pesos bf16 a 20,3 GB, mientras que la variante oQ4e-mtp del mismo autor baja aún más el requisito a costa de mayor pérdida de precisión. No se dispone de datos de calidad que permitan cuantificar esa pérdida en ninguno de los dos casos.

## Limitaciones y advertencias

- No hay información sobre sesgos. La model card del repositorio no incluye ninguna sección de sesgos, evaluación de seguridad ni limitaciones, y tampoco se ha recogido esa información para el modelo base.
- Riesgo de alucinación: no cuantificado ni documentado para este artefacto ni para su base. La cuantización a 5 bits puede aumentar la tasa de error respecto a bf16, pero no se han publicado mediciones.
- Licencia no declarada: el repositorio no indica licencia. Esto impide determinar si el uso comercial está permitido, y es un bloqueo serio para cualquier despliegue en producción. Además, al ser un derivado de Qwen, hay que verificar las condiciones de la licencia original de Qwen aplicables en cascada.
- Idiomas no declarados: no se especifica qué idiomas soporta el modelo, por lo que no se puede asumir un buen rendimiento en castellano sin una evaluación propia.
- Contexto no declarado: se desconoce la ventana de contexto efectiva tras la cuantización, dato crítico para dimensionar la caché KV en memoria.
- Formato atado a Apple Silicon: los pesos MLX safetensors no son portables a CUDA sin conversión. Esto limita el despliegue a hardware de Apple o a un proceso de reconversión no documentado en este repositorio.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validación comunitaria de que los pesos carguen o funcionen correctamente.
- Artefacto de cuantización, no modelo original: cualquier problema de calidad debe atribuirse con cautela, ya que puede provenir del modelo base o del proceso de cuantización. Para atribuir correctamente la causa conviene comparar contra Jackrong/Qwopus3.8-27B-Flash-V2 en bf16.
- Dependencia de la cabecera MTP: si el runtime MLX no soporta la cabecera MTP del modelo, se perderá la aceleración por decodificación especulativa y el rendimiento caerá al de una decodificación autoregresiva estándar.
- Fechas del repositorio: la creación se registra el 2026-10-08, posterior a la fecha de la mayoría de referencias del ecosistema; conviene verificar la vigencia de los enlaces antes de usarlos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/scottlowry/Qwopus3.8-27B-Flash-V2-oQ5e-mtp
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash-V2
- Colección del autor con las variantes oQe MTP: https://huggingface.co/collections/scottlowry/qwopus38-27b-flash-oqe-mtp
- Variante de 4 bits del mismo autor: https://huggingface.co/scottlowry/Qwopus3.8-27B-Flash-oQ4e-mtp
- Modelo base anterior (v1): https://featherless.ai/models/Jackrong/Qwopus3.8-27B-Flash
- Modelo base v2 en Featherless: https://featherless.ai/models/Jackrong/Qwopus3.8-27B-Flash-V2
- Herramienta de cuantización oQ / oMLX: https://github.com/jundot/omlx
- Versión GGUF de terceros: https://local-ai-zone.github.io/models/qwopus3-8-27b-flash.html
