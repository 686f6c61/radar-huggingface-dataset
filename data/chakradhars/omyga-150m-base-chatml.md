# ChakradharS/Omyga-150m-base-chatml

## Resumen

Omyga-150m-base-chatml es un modelo de generación de texto de aproximadamente 150 millones de parámetros publicado en Hugging Face por el usuario ChakradharS. El repositorio contiene 149.371.776 parámetros en formato safetensors (0,6 GB de tamaño total), está etiquetado con el pipeline `text-generation` y los tags `omyga`, `custom_code`, `conversational` y `region:us`. La fecha de creación y de última actualización es el 6 de octubre de 2026, con cero descargas y cero likes en el momento de redactar esta ficha.

El problema principal que plantea este lanzamiento es la falta de documentación: la model card es la plantilla automática de transformers sin rellenar, con todos los campos marcados como `[More Information Needed]`. No se declara licencia, idiomas soportados, longitud de contexto, composición del dataset de entrenamiento ni resultados de evaluación. La única información fiable procede de los metadatos del Hub y del recuento real de parámetros del archivo safetensors.

Por su tamaño, el modelo se sitúa en la categoría de modelos pequeños (por debajo de 200 M de parámetros), un segmento relevante para experimentación en CPU, ajuste fino con recursos limitados y despliegue en dispositivos con poca VRAM. El sufijo `chatml` del nombre sugiere el uso del formato de prompt ChatML y la etiqueta `custom_code` indica que su carga en transformers requiere código propio del autor, no una arquitectura estándar del catálogo de la librería. Ninguna de estas dos inferencias está confirmada por documentación oficial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La etiqueta `custom_code` indica que el repositorio requiere código propio para cargarse en transformers; no se especifica si es un transformer denso, MoE, SSM o un diseño híbrido |
| Parametros totales | 149.371.776 (≈150 M, dato real del archivo safetensors) |
| Parametros activos | No aplica / no disponible: no hay indicios de que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. No se publican pesos GGUF, AWQ, GPTQ ni quantizaciones de ningún tipo; solo safetensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible. Sin licencia declarada en el Hub |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura, los datos de entrenamiento ni el procedimiento de ajuste. La model card no documenta número de tokens, composición del dataset, ni si hubo fases de RLHF, DPO o SFT. El tag `arxiv:1910.09700` que aparece en los metadatos no corresponde a un paper del modelo: es la referencia a Lacoste et al. (2019) sobre el calculador de impacto de carbono que la plantilla estándar de model card de Hugging Face incluye por defecto en su sección de impacto ambiental. No debe interpretarse como documentación técnica del modelo.

La única inferencia razonable a partir de los datos disponibles es la precisión de los pesos: un modelo de 149,4 M de parámetros almacenado en fp32 ocuparía aproximadamente 597 MB, cifra que coincide con los 0,6 GB de tamaño del repositorio. Esto apunta a pesos en fp32, aunque no puede confirmarse sin descargar los tensores. La etiqueta `custom_code` implica que la clase de configuración y el modelo no provienen del catálogo estándar de transformers, lo que obliga a usar `trust_remote_code=True` para instanciarlo.

## Capacidades

- Generación de texto autoregresiva: es la única capacidad confirmada por el pipeline declarado (`text-generation`).
- Uso conversacional: el tag `conversational` y el sufijo `chatml` del nombre sugieren que el modelo está pensado para diálogo con formato ChatML, aunque no hay confirmación en la documentación.
- Ajuste fino como modelo base: el nombre incluye `-base-`, lo que indica que se trata de un checkpoint previo a instrucciones, apto como punto de partida para tareas posteriores.
- Soporte de tool calling / function calling: no disponible, sin evidencia en los metadatos.
- Soporte de agentes y razonamiento multi-paso: no disponible, sin evidencia en los metadatos.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

Cualquier afirmación sobre razonamiento, matemáticas, código o calidad conversacional sería especulativa y no debe asumirse para uso en producción.

## Casos de uso

- Experimentación con arquitecturas personalizadas: el tag `custom_code` hace de este modelo un candidato para estudiar implementaciones no estándar en transformers, cargándolo con `trust_remote_code=True` en un entorno aislado. Requiere revisar el código remoto antes de ejecutarlo.
- Base para ajuste fino en tareas de clasificación: con 149 M de parámetros, el ajuste fino completo cabe en una GPU de 8-12 GB en precisión mixta, lo que permite adaptarlo a clasificación de texto, análisis de sentimiento o etiquetado sin infraestructura dedicada.
- Prototipado rápido en local: al ocupar menos de 1 GB en fp32 y unos 300 MB en fp16, puede ejecutarse en portátiles sin GPU para validar pipelines de inferencia antes de escalar a modelos mayores.
- Generación de texto corto en entornos con restricciones de recursos: completado de frases, resúmenes de una línea o generación de titulares en dispositivos embebidos donde un modelo de 7B no cabe.
- Docencia e investigación sobre modelos pequeños: útil para reproducir experimentos de escalado, medir el efecto de la tokenización o analizar dinámicas de atención sin coste de cómputo significativo.
- Generación de datos sintéticos a pequeña escala: siempre que se valide la calidad de la salida, puede emplearse para aumentar datasets de tareas específicas antes de entrenar modelos mayores.

Ninguno de estos casos está respaldado por evaluaciones publicadas del modelo; se derivan exclusivamente de su tamaño y de los metadatos del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación completada y no existe ningún informe externo, paper ni entrada de leaderboard asociada al modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp32, 0,3 GB en fp16 o bf16 y 0,15 GB en int8. Hay que sumar el consumo del contexto (KV cache) y el overhead del runtime de transformers, que en la práctica eleva el uso real por encima de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Sirven desde una GTX 1650 o RTX 3050 hasta una RTX 4090, A100 o H100; en estas últimas el modelo queda limitado por el overhead de lanzamiento de kernels más que por memoria.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida. También es viable en CPU pura.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía directa, dado que el repositorio no usa una arquitectura estándar. llama.cpp, Ollama, vLLM o TGI solo serían utilizables si se convierte previamente el modelo a GGUF o se implementa la arquitectura en esos runtimes, algo que no está documentado.
- Latencia y throughput: no disponibles. No se publican mediciones y, al tratarse de una arquitectura personalizada sin optimizaciones conocidas, cualquier cifra sería especulativa.

## Comparativa con modelos similares

Los datos de los modelos de referencia provienen de sus respectivas model cards públicas; los del modelo analizado figuran como no disponibles.

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Omyga-150m-base-chatml | 149,4 M | No disponible | No disponible | No disponible | Solo safetensors, requiere `custom_code` |
| GPT-2 | 124 M | 1024 | WebText (≈40 GB, sin recuento exacto publicado) | Modified MIT | safetensors, GGUF, ampliamente integrado |
| Pythia-160M | 160 M | 2048 | 300 B (The Pile) | Apache 2.0 | safetensors, integrado en transformers |
| SmolLM-135M | 135 M | 2048 | 600 B (SmolLM-Corpus) | Apache 2.0 | safetensors, GGUF, Ollama |
| Qwen2.5-0.5B | 494 M | 32768 | 18 T | Apache 2.0 | safetensors, GGUF, vLLM, Ollama |

Frente a estas alternativas, Omyga-150m-base-chatml carece de licencia declarada, de contexto documentado y de pesos cuantizados, lo que limita su uso en producción. Su interés es principalmente experimental.

## Limitaciones y advertencias

- Ausencia total de licencia: sin licencia declarada no hay autorización explícita de uso comercial ni de redistribución. En la práctica, esto equivale a reserva de derechos por defecto en muchas jurisdicciones, por lo que no debería usarse en productos comerciales sin contactar con el autor.
- Documentación inexistente: la model card es la plantilla automática sin rellenar, lo que impide conocer la composición del dataset, los sesgos potenciales o las condiciones de entrenamiento.
- Riesgo de alucinación elevado: los modelos de ~150 M de parámetros tienen una capacidad de modelado del mundo muy limitada y generan texto incoherente con facilidad, especialmente en tareas de razonamiento o conocimiento factual.
- Contexto desconocido: al no declararse la longitud de contexto, no es posible garantizar el comportamiento en conversaciones multi-turno largas ni en documentos extensos.
- Idiomas no declarados: no hay garantía de calidad fuera del idioma o idiomas de entrenamiento, que se desconocen.
- Ejecución de código remoto: la etiqueta `custom_code` obliga a usar `trust_remote_code=True`, lo que ejecuta código arbitrario del autor en la máquina del usuario. Debe auditarse el código antes de cargarlo y hacerse en un entorno aislado.
- Sin validación comunitaria: cero descargas y cero likes implican que no existen informes independientes de comportamiento, seguridad o calidad.
- Sin cuantizaciones publicadas: no hay versiones GGUF, GPTQ o AWQ, lo que complica el despliegue en runtimes optimizados como llama.cpp, Ollama o vLLM.
- Formato de prompt incierto: aunque el nombre sugiere ChatML, no se documenta la plantilla exacta de mensajes, lo que puede degradar la calidad conversacional si se usa un formato distinto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChakradharS/Omyga-150m-base-chatml
- Perfil del autor en Hugging Face: https://huggingface.co/ChakradharS
- Referencia del tag arXiv (Lacoste et al., 2019, calculador de impacto de carbono, citado en la plantilla de model card, no es un paper del modelo): https://arxiv.org/abs/1910.09700
- Hugging Face Hub: https://huggingface.co/

Las búsquedas web realizadas no han devuelto ninguna página específica sobre este modelo: los resultados obtenidos son páginas genéricas del Hub, listados de lanzamientos de modelos y sitios de terceros sin relación con Omyga. No se han encontrado papers, blogs, repositorios ni demos asociados.
