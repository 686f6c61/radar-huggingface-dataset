# shoemoney/Ornith-1.5-9B-Abliterated-MLX-q6

## Resumen

Ornith-1.5-9B-Abliterated-MLX-q6 es una cuantización en 6 bits del modelo Ornith-1.5-9B, desarrollado por ornith-ai, convertida al formato MLX para Apple Silicon por el usuario shoemoney. El modelo base, Ornith-1.5-9B, es un transformer denso de aproximadamente 9 000 millones de parámetros, licenciado bajo MIT, que destaca por su enfoque de auto-mejora: el propio modelo propone tareas, genera andamiajes (scaffolds) y produce soluciones para entrenamiento por refuerzo. La versión "abliterated" elimina los mecanismos de rechazo de contenido, resultando en un modelo sin censura.

Esta variante MLX está pensada para ejecutarse en hardware Apple con el ecosistema mlx-vlm, que soporta modelos multimodales (visión y lenguaje). La cuantización 6-bit reduce el tamaño del modelo a 8,7 GB en disco, permitiendo su uso en equipos con memoria unificada moderada. Según las mediciones del autor, alcanza una perplejidad de 5,355 en el conjunto de validación tulu-3-sft-mixture y un rendimiento de 67,6 tokens por segundo en peticiones individuales y 164,4 en concurrencia de 8, en un Apple M3 Ultra con 96 GB.

El modelo es relevante para desarrolladores que buscan una alternativa de código abierto, sin restricciones de uso comercial y con capacidades de razonamiento y generación de código, ejecutable en hardware de consumo de Apple. Su naturaleza "uncensored" lo hace adecuado para investigación y experimentación, aunque requiere precaución en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje), arquitectura interna no especificada en la información disponible |
| Parametros totales | ~9B (según el nombre del modelo); la metadata de safetensors muestra 2.415.484.144, posiblemente un subconjunto o dato incompleto |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 6-bit MLX (q6) con group size 64 |
| Idiomas soportados | No disponible (probablemente inglés y otros, sin confirmar) |
| Licencia | MIT |
| Formato de pesos | Safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo original Ornith-1.5-9B es un transformer denso de ~9B parámetros, entrenado con un enfoque de auto-mejora: el modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce soluciones (rollouts) que se utilizan para entrenamiento por refuerzo. Este ciclo continuo permite al modelo mejorar sus propias capacidades sin intervención humana directa. No se dispone de detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

La versión "abliterated" (de huihui-ai) elimina los mecanismos de rechazo de contenido del modelo original, resultando en un modelo sin filtros de seguridad. La cuantización MLX 6-bit se realizó con `mlx_vlm.convert` a partir de los pesos BF16, sin fine-tuning adicional ni re-alineación. El proceso mantiene la arquitectura original, que está registrada en la librería mlx-vlm, indicando soporte multimodal (visión y texto).

## Capacidades

- Generación de texto y razonamiento complejo, con buen desempeño en tareas de matemáticas y ciencia (GPQA Diamond 86.4 en el modelo base).
- Generación de código y resolución de problemas de ingeniería de software (SWE-bench Verified 70.6 en el modelo base).
- Capacidades multimodales: al ser un modelo VLM (registrado en mlx-vlm), puede procesar entradas de imagen y texto, aunque no se especifican detalles concretos de las tareas de visión.
- Sin censura: el proceso de abliteration elimina los mecanismos de rechazo, permitiendo generar contenido que otros modelos bloquearían.
- Soporte de tool calling y function calling: no confirmado explícitamente, pero probable dado su enfoque en código y agentes.
- Capacidades multilingües: no confirmadas, aunque modelos de este tipo suelen soportar varios idiomas.

## Casos de uso

- Asistente de programación en entornos de desarrollo: el modelo puede generar código, explicar algoritmos y depurar errores. Su rendimiento en SWE-bench sugiere que es útil para tareas de ingeniería de software, como implementar funciones, escribir tests o refactorizar código.
- Investigación académica sin restricciones de contenido: al ser "uncensored", permite explorar temas sensibles o controvertidos en ciencias sociales, filosofía o política, sin filtros automáticos.
- Automatización de tareas de razonamiento multimodal: gracias a su naturaleza VLM, puede analizar imágenes y diagramas, por ejemplo, para extraer información de capturas de pantalla o gráficos técnicos.
- Generación de documentación técnica: puede redactar manuales, guías o comentarios de código a partir de especificaciones o código fuente.
- Prototipado rápido de agentes conversacionales: su licencia MIT y su tamaño moderado permiten integrarlo en aplicaciones de chat o asistentes virtuales sin coste de licencia.
- Experimentación en entornos Apple: al estar cuantizado para MLX, es ideal para desarrolladores que trabajan en Mac y necesitan un modelo local de razonamiento y código sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión cuantizada. Los datos siguientes corresponden al modelo base Ornith-1.5-9B, según la información de AI/TLDR:

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 70.6 |
| GPQA Diamond | 86.4 |

Además, el autor de la cuantización reporta una perplejidad de 5,355 en el conjunto `allenai/tulu-3-sft-mixture` (192 muestras de 512 tokens), medida en Apple M3 Ultra. Esta perplejidad solo es comparable dentro de la misma familia de modelos, no entre familias diferentes.

## Requisitos de hardware

- El modelo cuantizado en 6-bit ocupa 8,7 GB en disco, por lo que requiere al menos 12 GB de memoria unificada en Apple Silicon para cargar los pesos y ejecutar inferencia con margen.
- Medido en Apple M3 Ultra con 96 GB de memoria unificada: throughput de 67,6 tok/s en petición individual y 164,4 tok/s con 8 peticiones concurrentes.
- Diseñado exclusivamente para Apple Silicon (M1/M2/M3/M4) mediante la librería mlx-vlm. No es compatible directamente con GPUs NVIDIA o AMD.
- Para usar en GPUs convencionales, sería necesario convertir los pesos a otro formato (por ejemplo, GGUF o FP16) y adaptar la arquitectura, lo cual no está disponible en este repositorio.
- Opciones de despliegue: `mlx_vlm.generate` para inferencia local, o integración en aplicaciones Python con mlx-vlm. No se menciona soporte para vLLM, TGI u otros servidores.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | SWE-bench | GPQA | Disponibilidad |
|---|---|---|---|---|---|---|
| Ornith-1.5-9B (base) | ~9B | No disponible | MIT | 70.6 | 86.4 | HuggingFace |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | ~30 (aprox.) | ~40 (aprox.) | HuggingFace |
| Qwen 2.5 7B | 7B | 32K | Apache 2.0 | ~25 (aprox.) | ~50 (aprox.) | HuggingFace |

Los datos de Llama y Qwen son aproximados y no provienen de la información proporcionada; se incluyen como referencia cualitativa. Ornith-1.5-9B supera claramente a estos modelos en los benchmarks citados, aunque la comparación no es directa por diferencias en los conjuntos de evaluación.

## Limitaciones y advertencias

- Al ser una versión "abliterated", el modelo no tiene filtros de contenido. Puede generar texto ofensivo, peligroso o ilegal si se le solicita. No es adecuado para aplicaciones orientadas al público sin supervisión humana.
- La cuantización 6-bit puede degradar ligeramente la calidad de las respuestas en comparación con el modelo BF16 original, aunque la perplejidad medida sugiere una pérdida mínima (1,01× respecto al mejor rung de la familia).
- No se dispone de información sobre la longitud de contexto soportada, lo que limita su uso en tareas que requieran ventanas largas.
- Los idiomas soportados no están documentados; es probable que el modelo esté optimizado para inglés, con capacidades limitadas en otros idiomas.
- La licencia MIT permite uso comercial, pero el modelo base puede tener restricciones adicionales no especificadas en la información disponible.
- El modelo está diseñado para Apple Silicon; no es portable a otros entornos sin conversión manual, lo que reduce su versatilidad.

## Enlaces

- [Modelo en HuggingFace (shoemoney/Ornith-1.5-9B-Abliterated-MLX-q6)](https://huggingface.co/shoemoney/Ornith-1.5-9B-Abliterated-MLX-q6)
- [Modelo base abliterated (huihui-ai/Huihui-Ornith-1.5-9B-abliterated)](https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-9B-abliterated)
- [Modelo original (ornith-ai/Ornith-1.5-9B)](https://huggingface.co/ornith-ai/Ornith-1.5-9B)
- [Página oficial de Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [Sitio web de Ornith AI](https://ornith.ai/)
- [Análisis en AI/TLDR](https://ai-tldr.dev/models/ornith-1-5-9b/)
