# anpawo/Qwen3.5-9B-abliterated-repaired-GGUF

## Resumen

Qwen3.5-9B-abliterated-repaired-GGUF es una cuantización GGUF Q4_K_M del modelo Qwen3.5-9B de Alibaba Qwen, publicada por el usuario anpawo. Sobre la base del modelo ya "abliterado" por huihui-ai (Huihui-Qwen3.5-9B-abliterated), el autor restaura los tensores de las capas 8 a 15 desde el modelo original Qwen/Qwen3.5-9B, con el objetivo de recuperar parte de la capacidad de razonamiento que la abliteración degrada, manteniendo a la vez la supresión del comportamiento de rechazo.

El resultado es un modelo de aproximadamente 8.950 millones de parámetros, distribuido en un único fichero GGUF de 5,6 GB cuantizado con matriz de importancia (imatrix), pensado para ejecutarse en hardware modesto: según el autor, cabe en una GPU de 4 GB con offload a RAM en una máquina con 8 GB de memoria. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia es doble: por un lado demuestra una técnica reproducible de "reparación" tras abliteración (tensores selectivos restaurados, no un fine-tuning completo); por otro, ofrece un modelo sin rechazos con razonamiento y matemáticas razonables en un formato desplegable con llama.cpp u Ollama, lo que lo hace atractivo para entornos con recursos limitados y para investigación sobre alineación y seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, detalles no disponibles en la información proporcionada) |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | Q4_K_M con matriz de importancia (imatrix); se distribuye también el fichero `.imatrix.gguf` de calibración |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama); el modelo base usa safetensors |
| Tamaño del repositorio | 5,6 GB |
| Modelo base | huihui-ai/Huihui-Qwen3.5-9B-abliterated, Qwen/Qwen3.5-9B |
| Fecha de publicación | 19 de noviembre de 2026 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-9B original (transformer decoder-only de la familia Qwen3.5); la información proporcionada no detalla número de capas, dimensión oculta, mecanismo de atención ni composición del dataset de preentrenamiento. El proceso de este repositorio no es un reentrenamiento, sino una modificación quirúrgica de pesos seguida de cuantización:

1. Se parte de Huihui-Qwen3.5-9B-abliterated, una versión del modelo a la que se le ha eliminado el comportamiento de rechazo mediante abliteración (modificación de direcciones de activación asociadas al rechazo).
2. Se copian de vuelta desde el Qwen3.5-9B original todos los tensores que la abliteración había alterado en las capas 8 a 15. La hipótesis del autor es que el daño al razonamiento se concentra en ese rango de capas y puede revertirse sin reintroducir los rechazos.
3. Se reconstruye el modelo desde f16 a Q4_K_M utilizando una importance matrix generada con el propio modelo reparado (`H_8-15.calib.imatrix.gguf`).

No se documentan en la información disponible fases de RLHF, DPO ni datos de entrenamiento adicionales; la "reparación" es puramente de pesos. El autor publica código, conjuntos de prueba y las respuestas en bruto de cada ejecución en su repositorio de GitHub.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla compatible con Ollama y llama.cpp.
- Razonamiento y matemáticas: 87,3 % (131/150) en una muestra de MATH-500 con el modo "thinking" desactivado, según el autor.
- Resolución de problemas de opción múltiple o verificación: 65/74 en el conjunto de desarrollo y 68/74 en el conjunto reservado (held-out) definidos por el autor.
- Ausencia de rechazos: 0/6 negativas ante seis prompts dañinos de prueba (muestra muy pequeña, no es una evaluación de seguridad).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y despliegue local vía llama.cpp/Ollama.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no documentadas.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking: el modelo base Qwen3.5 lo soporta presumiblemente, pero los resultados publicados se obtuvieron con thinking desactivado; no se documenta su comportamiento con thinking activo en esta variante.

## Casos de uso

- Investigación sobre abliteración y alineación: permite comparar el modelo original, la versión abliterada y esta versión reparada sobre los mismos conjuntos de evaluación, usando el código y los datos publicados por el autor en GitHub.
- Despliegue en hardware de gama baja: con 5,6 GB en Q4_K_M y ejecución posible en una GPU de 4 GB con offload a RAM, sirve para prototipos de asistentes conversacionales en portátiles o mini-PC sin GPU dedicada de gran capacidad.
- Generación de contenido creativo sin filtros: para aplicaciones de ficción, guiones o role-play donde los rechazos del modelo base resultan un obstáculo, asumiendo la responsabilidad de añadir salvaguardas propias.
- Razonamiento matemático ligero en local: con un 87,3 % en la muestra de MATH-500, es adecuado para tutoría o verificación de ejercicios en entornos sin conexión a la nube.
- Evaluación de cuantizaciones con imatrix: el repositorio incluye la matriz de calibración, lo que permite reproducir la cuantización o generar otras variantes (Q5, Q6) y medir el impacto en calidad.
- Base para fine-tuning con QLoRA: al ser un GGUF de licencia Apache 2.0 y tamaño contenido, puede servir como punto de partida para adaptaciones de dominio, aunque para entrenamiento conviene partir de los pesos safetensors del modelo base.
- Experimentación con pipelines de llama.cpp/Ollama: el Modelfile incluido fija los parámetros de muestreo del autor (temperatura 1.0, top_k 20, top_p 0.95, presence penalty 1.5), lo que facilita reproducir sus resultados.

## Benchmarks y rendimiento

Datos publicados por el autor (thinking desactivado, temperatura 1.0, top_k 20, top_p 0.95, presence penalty 1.5):

| Modelo | Dev set (74) | Held-out set (74) | Rechazos (6 prompts) | MATH-500 (muestra de 150) |
|---|---|---|---|---|
| Qwen3.5-9B original, Q3_K_S | 57 | no disponible | 6/6 | no disponible |
| Este modelo (Q4_K_M + imatrix) | 65 | 68 | 0/6 | 131/150 (87,3 %; IC 95 %: 81,1 %–91,7 %) |

Advertencias del propio autor: la comprobación de rechazos usa solo 6 prompts y no constituye una evaluación de seguridad; los resultados provienen de una única semilla; diferencias de 1-2 preguntas están dentro del ruido. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 5,6 GB para el fichero Q4_K_M completo; con offload parcial puede ejecutarse en una GPU de 4 GB, según el autor.
- RAM: 8 GB de memoria del sistema son suficientes según el autor; se recomienda lanzar `llama-server` con `--cache-ram 0`, ya que la caché de prompt por defecto hace swapping en máquinas de 8 GB.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM para carga completa (RTX 3060, RTX 4060, RTX 2070); con 4 GB (GTX 1650, RTX 3050) funciona con offload a RAM. Para mayor throughput, A100/H100 o RTX 4090, aunque el modelo es pequeño y no las aprovecha en su totalidad.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (mediante el `Modelfile` incluido). No se documenta soporte de vLLM o TGI para este GGUF concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-9B abl. repaired) | ~8,95 B | no disponible | Apache 2.0 | GGUF Q4_K_M | Sin rechazos; 68/74 en held-out del autor; 87,3 % en MATH-500 (muestra) |
| Qwen/Qwen3.5-9B (original) | ~8,95 B | no disponible | Apache 2.0 | safetensors, GGUF | Rechaza 6/6 prompts dañinos; 57/74 en dev set del autor (Q3_K_S) |
| huihui-ai/Huihui-Qwen3.5-9B-abliterated | ~8,95 B | no disponible | Apache 2.0 | safetensors | Abliterado sin reparación; referencia directa de este trabajo |

No se dispone de datos comparativos con otros modelos de tamaño similar (por ejemplo, Llama 3.1 8B o Mistral 7B) en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina el comportamiento de rechazo: el modelo responderá a peticiones que el original declina. El autor traslada expresamente al usuario la responsabilidad de uso y de añadir salvaguardas.
- La comprobación de seguridad se limita a 6 prompts; no es una evaluación de seguridad y no debe interpretarse como tal.
- Fallos conocidos según el autor: invertir palabras, aritmética de días de la semana y fechas, y contar letras.
- Resultados basados en una única semilla; diferencias de 1-2 preguntas en los conjuntos de 74 preguntas son ruido estadístico.
- El conjunto held-out se usó para validar, no para seleccionar la build, pero ambos conjuntos son pequeños (74 preguntas).
- No se documentan sesgos específicos, idiomas soportados ni longitud de contexto; no hay garantías sobre comportamiento multilingüe más allá de lo que herede del base.
- Licencia Apache 2.0 permite uso comercial, pero la modificación de pesos y la eliminación de rechazos pueden tener implicaciones legales o de cumplimiento según la jurisdicción y el caso de uso.
- Para producción, conviene evaluar con conjuntos propios y considerar un modelo con alineación intacta si el caso de uso requiere filtros de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anpawo/Qwen3.5-9B-abliterated-repaired-GGUF
- Repositorio de código, tests y respuestas en bruto: https://github.com/anpawo/qwen-abliteration-repair
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-9B
