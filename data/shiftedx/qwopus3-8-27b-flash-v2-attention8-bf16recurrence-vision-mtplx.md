# Shiftedx/qwopus3.8-27b-flash-v2-attention8-bf16recurrence-vision-mtplx

## Resumen

Qwopus3.8-27B-Flash-V2 · attention8-bf16recurrence es una conversión experimental al formato MLX del modelo Jackrong/Qwopus3.8-27B-Flash-V2, publicada por el usuario Shiftedx. No se trata de un entrenamiento nuevo, sino de una cuantización afinada por módulo que fija el commit 13f92e09a46fa364f8de1edb85684d57bda01126 del modelo padre y que, según la model card, no aplica abliteración. El artefacto está pensado para ejecutarse en Apple Silicon mediante la pila MTPLX, con soporte combinado de texto, visión y decodificación especulativa por predicción multi-token (MTP).

El modelo conserva los 27.356.728.560 parámetros del original y los empaqueta con precisión mixta: 234 módulos considerados sensibles en 8 bits con grupo de 64, 168 módulos en 4 bits con grupo de 32 y 96 proyecciones recurrentes de entrada en BF16. El resultado son 22,186 GiB de pesos dentro de un repositorio de 23,8 GB, que incluye además 333 tensores de visión en BF16 y un sidecar MTP nativo de 15 tensores.

Su relevancia es doble. Por un lado, documenta con inusual honestidad un caso de cuantización selectiva guiada por sensibilidad, útil para quien investigue el impacto de la precisión por módulo. Por otro, el propio autor advierte de que la cualificación de publicación está incompleta: fallan puertas de comportamiento locales en indentación de Python, formato estricto de salida y una tarea de agente. Es, por tanto, material de evaluación y experimentación, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la información disponible; la etiqueta qwen3_5, el backend qwen3_next y la presencia de 96 proyecciones recurrentes de entrada apuntan a una arquitectura híbrida con capas recurrentes o de atención lineal junto a capas de atención |
| Parámetros totales | 27.356.728.560 (27,36 B) |
| Parámetros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible; la model card indica explícitamente que no se reclama cualificación de contexto máximo |
| Tipos de cuantización | Afín mixta: 234 módulos a 8 bits/grupo 64, 168 módulos a 4 bits/grupo 32, 96 proyecciones recurrentes de entrada en BF16. Etiqueta general: 4-bit |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (pesos: 22,186 GiB; repositorio: 23,8 GB) |
| Librería | mlx |
| Pipeline | image-text-to-text |
| Modelo base | Jackrong/Qwopus3.8-27B-Flash-V2 (relación: quantized, commit 13f92e09a46fa364f8de1edb85684d57bda01126) |
| Runtime de referencia | MLX 0.32.2 / MLX-LM 0.31.3, empaquetado para MTPLX 2.11.2 en Apple Silicon |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe el entrenamiento del modelo, porque esta publicación no entrena nada: es una conversión de pesos. Lo que sí detalla es el criterio de cuantización. Se aplica cuantización afín mixta con granularidad por módulo: los 234 módulos marcados como sensibles se mantienen en 8 bits con grupo de 64, otros 168 bajan a 4 bits con grupo de 32, y las 96 proyecciones recurrentes de entrada se conservan íntegras en BF16. La precisión exacta de cada módulo queda registrada en config.json y los hashes de los ficheros en SHA256SUMS, lo que permite auditar el reparto de precisión.

El paquete integra tres componentes diferenciados. Primero, el cuerpo de texto cuantizado. Segundo, 333 tensores de visión en BF16 heredados del mismo padre, que habilitan el pipeline image-text-to-text. Tercero, un sidecar MTP nativo de 15 tensores que permite decodificación especulativa con profundidad configurable (se ejercitó profundidad 3 únicamente sobre la variante Attention8). El tokenizador, la plantilla de chat y la configuración de generación se preservan del original; los metadatos del procesador de imágenes se aplanan para reflejar los ajustes de la fuente.

Un detalle técnico relevante es que la combinación de texto, visión y MTP solo está disponible a través de MTPLX. La generación de texto convencional con MLX-LM estándar no activa ni la visión ni el MTP, de modo que el artefacto solo despliega todo su comportamiento bajo el runtime para el que fue empaquetado.

## Capacidades

- Generación de texto conversacional, con plantilla de chat preservada del modelo base.
- Modo de razonamiento explícito: admite enable_thinking=true y reasoning_effort="xhigh" en los controles de plantilla de chat o API.
- Visión: pipeline image-text-to-text, con 333 tensores de visión en BF16 para entrada de imágenes junto a texto.
- Tool calling: el autor indica que el modelo se cargó y ejercitó con herramientas (tools), aunque una de las tareas de agente evaluadas falló.
- Decodificación especulativa mediante MTP nativo, con modo mtp y profundidad configurable (--depth 3).
- Generación autorregresiva estándar mediante --generation-mode ar, recomendada como punto de partida al evaluar variantes.
- Capacidades multilingües: no disponible (el repositorio no declara idiomas).
- Razonamiento multi-paso y comportamiento agéntico: no cualificado; la model card reporta el fallo de una tarea de agente en las puertas de comportamiento locales.

## Casos de uso

- Experimentación en cuantización selectiva: el repositorio documenta precisión por módulo en config.json, lo que permite estudiar qué capas toleran 4 bits y cuáles exigen 8 bits o BF16 comparando contra las variantes mxfp4 y bf16recurrence-only del mismo autor.
- Evaluación de decodificación especulativa en Apple Silicon: con --generation-mode mtp --depth 3 se puede medir la ganancia de la predicción multi-token frente al modo autorregresivo en el mismo hardware, siempre partiendo del modo AR como línea base.
- Prototipado local de asistentes multimodales: al cubrir texto e imagen en un único artefacto MTPLX, sirve para validar interfaces de chat que reciben capturas o documentos escaneados sin depender de APIs externas, aceptando que la cualificación de visión es limitada.
- Investigación sobre robustez de formato: dado que las puertas de indentación de Python y formato estricto fallaron, el modelo es un caso de estudio útil para medir cómo la cuantización y el runtime afectan a la fidelidad de salida estructurada.
- Reproducción de fallos del modelo padre: el autor verificó que un prompt de código falla también en el padre BF16 sin cuantizar cargado con MLX-LM estándar, lo que permite aislar si un defecto proviene del entrenamiento original o de la conversión.
- Desarrollo offline en un Mac de sobremesa o portátil: con 22,186 GiB de pesos, el modelo entra en equipos Apple Silicon de memoria unificada alta, lo que habilita trabajo sin conexión para tareas de análisis de texto e imagen no críticas.
- Comparación de formatos de despliegue: junto a las conversiones GGUF publicadas por terceros para el modelo Qwopus3.8 27B Flash, permite contrastar el rendimiento de MLX frente a llama.cpp en el mismo modelo de base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma explícitamente que no se presenta ninguna tabla de clasificación de benchmarks ni ninguna reclamación de velocidad. Lo único verificable son las puertas de comportamiento locales, que fallaron en indentación de Python, formato estricto de salida y una tarea de agente, además de un prompt de código controlado que también falló en el modelo padre BF16 con la misma semilla y los mismos ajustes de muestreo recomendados.

## Requisitos de hardware

- Plataforma: este artefacto está empaquetado para MLX en Apple Silicon (MTPLX 2.11.2). No se declara soporte para CUDA ni para GPU de NVIDIA.
- Memoria: los ficheros de pesos suman 22,186 GiB, y la propia model card advierte de que la memoria en tiempo de ejecución es superior. Como estimación derivada de esa cifra, un equipo con 32 GB de memoria unificada queda ajustado; 48 o 64 GB ofrecen margen para contexto largo, visión y MTP simultáneos.
- GPU recomendadas: no aplica en este repositorio. Para modelos de ~27 B en BF16 el rango habitual sería A100 80 GB o H100, pero esta conversión no se distribuye para esas plataformas.
- GPU de consumo: no es una ruta viable para tarjetas RTX con este artefacto. Para hardware NVIDIA habría que recurrir a las conversiones GGUF publicadas por terceros.
- Opciones de despliegue: MTPLX 2.11.2 (mtplx inspect, mtplx serve con --backend-id qwen3_next), y MLX-LM 0.31.3 para generación de texto sin visión ni MTP. Comandos de referencia de la model card: --reasoning-mode on --reasoning-effort xhigh --temperature 0.3 --top-p 0.95 --top-k 20 para AR.
- Latencia y throughput: no disponible. El autor no publica ninguna cifra de velocidad ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shiftedx/qwopus3.8-27b-flash-v2-attention8-bf16recurrence-vision-mtplx (este) | 27,36 B | No disponible | Sin benchmarks publicados; puertas de comportamiento locales fallidas | Apache 2.0 | MLX/MTPLX, repositorio de 23,8 GB, 0 descargas |
| Jackrong/Qwopus3.8-27B-Flash-V2 (padre) | 27 B (según el modelo derivado) | No disponible | No disponible; la model card del upstream declara mejora en indentación de Python, no eliminación garantizada | No disponible | Pesos BF16 originales en HuggingFace |
| Shiftedx/qwopus3.8-27b-flash-v2-mxfp4-vision-mtplx | 27,36 B | No disponible | No disponible | Apache 2.0 | Variante MXFP4 del mismo autor, con visión y MTP |
| Shiftedx/qwopus3.8-27b-flash-v2-bf16recurrence-only-vision-mtplx | 27,36 B | No disponible | No disponible | Apache 2.0 | Variante que conserva solo las recurrencias en BF16 |
| Conversión GGUF de Qwopus3.8 27B Flash (terceros) | 27 B (no confirmado) | No disponible | No disponible | No disponible | GGUF de 56,7 GB en local-ai-zone |

La comparación cuantitativa no es posible con los datos disponibles: ninguna de las variantes publica resultados de benchmarks, y el contexto máximo no está declarado en ninguna de ellas.

## Limitaciones y advertencias

- Modelo marcado como experimental por su propio autor, con la cualificación de publicación declarada como incompleta.
- Fallos conocidos de formato: indentación de Python, formato estricto de salida y una tarea de agente no superaron las puertas de comportamiento locales.
- El defecto de indentación también se reprodujo en el modelo padre BF16 sin cuantizar, con la misma semilla y los ajustes de muestreo recomendados, y se confirmó mediante decodificación de tokens en bruto. Esto demuestra que la cuantización no es necesaria para provocar el fallo, pero no establece una tasa de fallo universal del modelo original ni descarta comportamientos específicos de MLX.
- Riesgo de alucinación: no cuantificado en la información disponible; no hay evaluación publicada al respecto.
- Sin datos de benchmarks, sin cifras de velocidad y sin cualificación de contexto máximo. Cualquier uso en producción requiere evaluación propia.
- Restricción de plataforma: la visión y el MTP solo funcionan bajo MTPLX en Apple Silicon; MLX-LM estándar ofrece únicamente generación de texto.
- Configuración de generación heredada del origen con temperatura 1.0; el autor recomienda sobrescribirla a 0.3 para tareas de código.
- Idiomas soportados no declarados, lo que impide anticipar el comportamiento multilingüe.
- Licencia Apache 2.0, que permite uso comercial, pero el estado experimental y los fallos de formato desaconsejan su uso en producción sin validación previa.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso por terceros.
- Repositorio con 23,8 GB de tamaño, lo que implica requisitos de almacenamiento y de descarga considerables.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Shiftedx/qwopus3.8-27b-flash-v2-attention8-bf16recurrence-vision-mtplx
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash-V2
- Commit fijado del modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash-V2/tree/13f92e09a46fa364f8de1edb85684d57bda01126
- Variante mxfp4: https://huggingface.co/Shiftedx/qwopus3.8-27b-flash-v2-mxfp4-vision-mtplx
- Variante bf16recurrence-only: https://huggingface.co/Shiftedx/qwopus3.8-27b-flash-v2-bf16recurrence-only-vision-mtplx
- Colección Qwopus3.8 27B Flash MLX Quants: https://huggingface.co/collections/Shiftedx/qwopus38-27b-flash-mlx-quants
- Variante anterior (attention8, sin V2): https://huggingface.co/Shiftedx/qwopus3.8-27b-flash-attention8-bf16recurrence-vision-mtplx
- Conversión GGUF de Qwopus3.8 27B Flash (terceros): https://local-ai-zone.github.io/models/qwopus3-8-27b-flash.html
- Ficha en llm-explorer de la variante mxfp4: https://llm-explorer.com/model/Shiftedx%2Fqwopus3.8-27b-flash-mxfp4-vision-mtplx,4lROvjkEutYAZlqCnzgRbx
- Ficha en llm-explorer de la variante abliterated mxfp4: https://llm-explorer.com/model/Shiftedx%2Fqwopus3.8-27b-flash-abliterated-mxfp4-vision-mtplx,348SZgTb86nGqvpkzWI8Eh
- Sección de hipótesis sobre indentación de Python del modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash-V2#24-python-indentation--working-hypothesis
