# bambocher/Huihui-Qwen3.5-2B-abliterated-oQ4e-mtp

## Resumen

Huihui-Qwen3.5-2B-abliterated-oQ4e-mtp es una versión cuantizada del modelo Huihui-Qwen3.5-2B-abliterated, publicada por el usuario bambocher en Hugging Face. Se trata de un artefacto de pesos en formato MLX safetensors, cuantizado a 4 bits con la herramienta oQ (oMLX v0.7.0) mediante cuantización de precisión mixta con tamaño de grupo 64. El repositorio contiene 2.274.069.824 parámetros totales y ocupa 1,8 GB.

El nombre indica dos intervenciones sucesivas sobre un modelo base de la familia Qwen3.5 de 2B: por un lado, una variante "abliterated", es decir, un ajuste cuyo objetivo habitual es eliminar la dirección de rechazo del modelo para que no active respuestas de negativa; por otro, la cuantización a 4 bits en formato MLX para ejecución en Apple Silicon. El autor no documenta quién entrena el modelo base, qué datos se usaron ni qué metodología de ablación se aplicó.

La relevancia de esta ficha es limitada y hay que situarla con precisión: el repositorio tiene 0 descargas y 0 likes, no incluye model card técnica más allá de los parámetros de cuantización, no declara licencia ni idiomas, y no aporta resultados de evaluación. Es, por tanto, un artefacto experimental de interés para quien quiera inspeccionar el pipeline de cuantización oQ sobre un modelo pequeño, no una opción recomendable para producción sin una evaluación previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (campo `model_type` de la model card); el autor no detalla la arquitectura interna (número de capas, tipo de atención, si es denso o MoE) |
| Parametros totales | 2.274.069.824 (confirmado por los safetensors) |
| Parametros activos | No disponible (el autor no documenta configuración MoE; con 2,27B totales y sin metadatos de expertos, no se puede determinar) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits, group size 64, precisión mixta mediante oQ (oMLX v0.7.0); es la única variante publicada en el repo |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors MLX (`library_name: mlx`) |

## Arquitectura y entrenamiento

La model card solo aporta cuatro datos técnicos: tipo de modelo `qwen3_5`, 4 bits, group size 64 y formato MLX safetensors. No se especifica el número de capas, la dimensión oculta, el tipo de atención, la presencia de mezcla de expertos ni la longitud de contexto nativa. El sufijo "mtp" del nombre del repositorio podría sugerir multi-token prediction, pero el autor no lo confirma en ninguna parte de la documentación, por lo que debe tratarse como una hipótesis no verificada.

El proceso de cuantización sí está identificado: oQ (oMLX v0.7.0), una herramienta de cuantización de precisión mixta que asigna distintos niveles de bits a distintas capas o tensores, con grupo de 64 elementos. Este enfoque busca preservar mejor la calidad que una cuantización uniforme a 4 bits, especialmente en capas sensibles como las proyecciones de atención o las embeddings. No se detalla qué política de asignación de bits se aplicó ni qué tensores quedaron por encima de 4 bits.

Respecto al modelo base, el término "abliterated" hace referencia a una familia de técnicas de ablación de direcciones en el espacio de activaciones, cuyo objetivo es que el modelo deje de producir rechazos ante peticiones que considera problemáticas. No hay información sobre el dataset de calibración de la ablación, el número de tokens empleados, ni si hubo fases de RLHF o DPO posteriores. Tampoco se documenta el proceso de entrenamiento del Qwen3.5-2B original dentro de este repositorio.

## Capacidades

- Generación de texto autoregresiva en el idioma y estilo que el modelo base haya aprendido; no hay evaluación publicada que lo confirme para este artefacto concreto.
- Razonamiento y código heredados del Qwen3.5-2B base, en la medida en que la cuantización a 4 bits y la ablación no los hayan degradado; sin datos que lo verifiquen.
- Ejecución local en Apple Silicon mediante MLX, con pesos ya convertidos y listos para `mlx-lm`.
- Comportamiento sin rechazos (uncensored) derivado de la ablación, que es la característica diferencial declarada en el nombre del modelo.
- Tool calling, function calling, modo thinking, agentes multi-paso, visión o audio: no disponible; el autor no documenta ninguna de estas capacidades y no se pueden atribuir sin verificación.
- Capacidades multilingües: no disponible; el campo de idiomas no está informado en la ficha de Hugging Face.

## Casos de uso

- Evaluación comparativa de cuantización: usar este repo junto al modelo base sin cuantizar para medir la pérdida de calidad que introduce oQ a 4 bits con group size 64 en un modelo de 2,27B, con un conjunto de prompts fijo y métricas de perplejidad y exactitud en tareas cortas.
- Prototipado local en Mac: desplegar el modelo con `mlx-lm` en un portátil con Apple Silicon para probar flujos de generación de texto sin depender de API externa, aprovechando que los 1,8 GB del repo caben en memoria unificada de cualquier equipo M1 en adelante.
- Investigación sobre alineación y seguridad: analizar qué tipos de peticiones deja de rechazar una variante abliterated frente al modelo original, con anotación manual de respuestas y clasificación de categorías de daño, en un entorno controlado y con revisión humana.
- Generación de datos sintéticos en dominios donde el modelo base rechaza colaborar (por ejemplo, narrativa de ficción con contenido violento o guiones de red teaming), siempre con revisión posterior y sin exposición directa al usuario final.
- Docencia y demostraciones de cuantización: ilustrar en clase o en un taller cómo se comporta un modelo de 2B en 4 bits frente a 8 o 16 bits, midiendo latencia, memoria y calidad con el mismo prompt.
- Pruebas de integración de pipelines MLX: validar herramientas propias de inferencia, servidores ligeros o wrappers alrededor de `mlx-lm` usando un checkpoint pequeño y rápido de cargar antes de pasar a modelos mayores.
- Base para fine-tuning experimental: partir de estos pesos para ajustes con LoRA en tareas muy acotadas sobre Apple Silicon, teniendo en cuenta que el punto de partida ya está cuantizado a 4 bits y que la licencia no está declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y la búsqueda web no devuelve documentación técnica del repositorio. Tampoco hay datos de latencia o throughput medidos por el autor.

## Requisitos de hardware

- Huella de pesos: 1,8 GB de repositorio en safetensors MLX a 4 bits. En memoria, hay que sumar la caché KV, que depende de la longitud de contexto (no documentada); como referencia, para un modelo de 2,27B con contexto moderado la caché suele añadir entre unos cientos de MB y 1-2 GB.
- Memoria total estimada para inferencia: del orden de 2,5 a 4 GB en función de la longitud de contexto y del tamaño de lote. Cálculo estimado, no publicado por el autor.
- Cabe holgadamente en GPUs de consumo y en Apple Silicon: cualquier Mac con 8 GB de memoria unificada o más debería poder cargarlo; en GPU discreta, una RTX 3060 de 12 GB o superior es más que suficiente.
- GPU de datacenter (A100, H100): innecesarias para este tamaño; solo tendrían sentido para servir muchas peticiones concurrentes en paralelo.
- Despliegue: la vía natural es `mlx-lm` (incluido su servidor HTTP) y la propia herramienta oMLX. vLLM y TGI no soportan pesos MLX de forma nativa; llama.cpp u Ollama requerirían una conversión a GGUF que el autor no proporciona.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni referencias del autor.

## Comparativa con modelos similares

No disponible. La información proporcionada no permite identificar con rigor los modelos comparables: no se conoce la licencia del artefacto, no se documenta el modelo base exacto (autor, fecha, versión de Qwen3.5-2B) ni sus métricas, y las alternativas de la misma familia podrían tener condiciones de uso distintas. Sin esos datos, cualquier tabla comparativa de parámetros, contexto o rendimiento sería especulativa.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.5-2B-abliterated-oQ4e-mtp | 2,27B totales | No disponible | No disponible | MLX safetensors 4-bit | Objeto de esta ficha; 0 descargas, 0 likes |
| Modelo base sin cuantizar | No disponible | No disponible | No disponible | No disponible | No referenciado con enlace en la model card |
| Alternativas de 2-3B del mismo rango | No disponible | No disponible | No disponible | No disponible | No se pueden identificar sin datos del autor |

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, no hay métricas de perplejidad tras la cuantización y no hay comparación con el modelo sin cuantizar. Cualquier afirmación sobre su calidad es una suposición.
- Riesgo de alucinación elevado por tamaño: con 2,27B parámetros, la tasa de afirmaciones incorrectas en tareas de conocimiento factual es intrínsecamente alta, y la cuantización a 4 bits puede agravarla.
- Modelo abliterated: la eliminación deliberada de la dirección de rechazo implica que el modelo puede producir contenido dañino, ilegal o sexual sin filtros. No es apto para exposición directa a usuarios finales sin una capa de moderación propia.
- Licencia no declarada: sin licencia explícita, no hay permiso claro para uso comercial ni para redistribución. Además, la licencia del modelo base Qwen3.5 (no documentada aquí) probablemente impone condiciones adicionales que este repo no refleja.
- Idiomas no documentados: no se puede asumir un buen rendimiento en castellano ni en ningún otro idioma concreto sin probarlo.
- Contexto desconocido: al no informarse la longitud de contexto nativa, cualquier diseño que dependa de ventanas largas requiere verificación empírica previa.
- Repositorio sin tracción ni auditoría: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado con dos segundos de diferencia, con marcas de tiempo de octubre de 2026. No hay issues, discusiones ni usuarios que hayan validado los pesos.
- La búsqueda web realizada no devuelve información técnica: los resultados corresponden a definiciones de diccionario del verbo francés "bambocher", sin relación con el modelo. No se ha podido localizar el modelo base, el autor original de la variante abliterated ni documentación de oQ más allá del repositorio de la herramienta.
- Compatibilidad limitada: al estar en formato MLX, no se puede cargar directamente en el ecosistema CUDA (vLLM, TGI, transformers estándar) sin reconversión.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bambocher/Huihui-Qwen3.5-2B-abliterated-oQ4e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base, paper, blog o demo: no disponible en la información proporcionada.
