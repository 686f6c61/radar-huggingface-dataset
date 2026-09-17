# prism-ml/Ternary-Bonsai-2-27B-gguf-dev

## Resumen

Ternary-Bonsai-2-27B-gguf-dev es una distribución de pesos en formato GGUF del modelo Bonsai 2 27B, publicada por prism-ml, que empaqueta los pesos en el tipo de cuantización ternaria `Q2_0` (2 bits por peso). Se trata de un repositorio de desarrollo y pruebas, separado del repositorio principal, cuya finalidad declarada es servir de banco de pruebas para kernels, trabajo de cuantización y el proceso de upstreaming hacia llama.cpp. El modelo base es Qwen/Qwen3.8-27B, con 26.895.998.464 parámetros totales (aproximadamente 26,9 mil millones).

La particularidad técnica de Bonsai 2 es que requiere una transformación de activaciones que solo está implementada en el fork de llama.cpp de PrismML. Este detalle es crítico: llama.cpp estándar reconoce el tipo `Q2_0` y la arquitectura `qwen35`, carga el fichero sin emitir ningún aviso y genera texto sin sentido. En el repositorio principal del autor se publican los empaquetados `PQ2_0` y `PTQ1_0`, que usan tipos desconocidos por llama.cpp estándar y por tanto fallan con error en lugar de producir salida corrupta.

El interés de esta ficha es acotado y hay que enmarcarlo: es una build de testing, con 0 descargas en el momento de la consulta, licencia Apache 2.0 y un tamaño de repositorio de 7,6 GB. Para uso normal el propio autor redirige al repositorio GGUF principal o a la variante MLX de 2 bits para Apple Silicon. No se dispone de información sobre longitud de contexto, idiomas soportados ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (identificador `qwen35` en llama.cpp; no se detalla si es densa o MoE) |
| Parámetros totales | 26.895.998.464 (≈26,9 B) |
| Parámetros activos | No aplica / no disponible: no se declara arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | `Q2_0` ternaria, 2 bits por peso (este repositorio). Los repositorios principales usan `PQ2_0` y `PTQ1_0` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamaño del repositorio | 7,6 GB |
| Librería | llama.cpp |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La información disponible no describe el proceso de entrenamiento del modelo base Qwen/Qwen3.8-27B: no se especifican el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO u otras técnicas de alineamiento. Tampoco se detalla la arquitectura interna más allá del identificador `qwen35` que emplea llama.cpp para cargar el modelo, dato que indica una variante de la familia Qwen 3 y una arquitectura de tipo transformer, pero sin precisar configuración de capas, atención o si incorpora componentes MoE.

La innovación técnica documentada en esta publicación es exclusivamente de cuantización e inferencia, no de entrenamiento. Bonsai 2 se empaqueta en un formato ternario de 2 bits (`Q2_0`) que requiere una transformación de activaciones implementada en el fork de llama.cpp de PrismML (PrismML-Eng/llama.cpp). Esta transformación es la que permite que los pesos ternarios produzcan salidas coherentes; sin ella, la inferencia se ejecuta pero devuelve texto sin sentido. Este repositorio existe precisamente para separar el empaquetado `Q2_0` del principal: al ser un tipo que llama.cpp estándar sí reconoce, no falla de forma ruidosa, y el autor lo aísla hasta que el soporte upstream esté disponible.

## Capacidades

- Generación de texto y uso conversacional: son las dos capacidades declaradas explícitamente en los tags y en el pipeline del repositorio (`text-generation`, etiqueta `conversational`).
- Capacidades heredadas del modelo base Qwen/Qwen3.8-27B: no documentadas en esta publicación. No se puede confirmar ni descartar razonamiento, generación de código, matemáticas o capacidades multilingües a partir de la información disponible.
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multimodales (visión, audio): no disponibles; el repositorio es de solo texto y formato GGUF.
- Capacidades especiales (modo thinking, decodificación especulativa, atención lineal): no documentadas.
- Función real de este repositorio: servir como artefacto de prueba para desarrollo de kernels y para el proceso de upstreaming del soporte ternario en llama.cpp.

## Casos de uso

- Desarrollo y validación de kernels de cuantización ternaria: el repositorio está pensado para que ingenieros de PrismML y colaboradores prueben el comportamiento del empaquetado `Q2_0` sobre la arquitectura `qwen35` y verifiquen que la transformación de activaciones se aplica correctamente en cada paso del pipeline.
- Trabajo de upstreaming en llama.cpp: sirve como caso de prueba reproducible para introducir el soporte nativo de la transformación de activaciones en el repositorio upstream, comparando el comportamiento frente a los tipos `PQ2_0` y `PTQ1_0`.
- Pruebas de regresión entre backends: al existir variantes GGUF, MLX de 2 bits y los empaquetados del repositorio principal, permite comparar salidas entre backends y detectar divergencias numéricas atribuibles a cada kernel.
- Evaluación de la degradación por cuantización extrema: con pesos de 2 bits y un repositorio de 7,6 GB para 26,9 B de parámetros, es un candidato para medir cuánta calidad se pierde frente a cuantizaciones de 4 u 8 bits, siempre que se disponga de un conjunto de evaluación propio.
- Experimentación en hardware de gama alta para consumidores: el tamaño reducido de los pesos hace viable ejecutar un modelo de casi 27 B de parámetros en GPUs de consumo, lo que permite a investigadores sin acceso a clústeres explorar modelos de este orden de magnitud.
- Inferencia en CPU o equipos con poca VRAM mediante llama.cpp: al ser GGUF, el modelo puede repartirse entre CPU y GPU, lo que abre la puerta a pruebas en portátiles o estaciones de trabajo sin GPU dedicada, asumiendo la penalización de latencia.
- Integración en el ecosistema Bonsai-demo: el repositorio Bonsai-demo documenta la configuración de cada backend, por lo que este artefacto puede incorporarse a dicho entorno de demostración para pruebas comparativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro conjunto de evaluación. Tampoco se proporcionan datos de perplejidad, comparaciones con el modelo sin cuantizar ni mediciones de latencia o throughput. La búsqueda web realizada no devolvió resultados relacionados con este modelo: los enlaces encontrados corresponden a proyectos homónimos sin relación (Prism Launcher, GraphPad Prism y el editor LaTeX Prism de OpenAI).

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 7,6 GB según el tamaño del repositorio, coherente con 26,9 B de parámetros a 2 bits (unos 6,7 GB teóricos más metadatos y estructuras auxiliares).
- VRAM total para inferencia: hay que sumar la caché KV, cuyo tamaño depende de la longitud de contexto y del número de capas, datos no publicados. Como referencia orientativa, un presupuesto de 10-12 GB cubriría pesos y caché para contextos moderados; no es posible dar una cifra exacta sin conocer la configuración de atención.
- GPU recomendadas: no especificadas por el autor. Por tamaño de pesos, cabría en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) y con holgura en RTX 3090, RTX 4090, A100 y H100, donde el cuello de botella pasaría a ser el ancho de banda y los kernels de 2 bits.
- Viabilidad en GPU de consumo: sí, es uno de los puntos fuertes del formato. El límite práctico lo marca la caché KV y la implementación de los kernels ternarios, no los pesos.
- Opciones de despliegue: llama.cpp es el único backend documentado para este artefacto, y requiere el fork de PrismML-Eng/llama.cpp para producir salidas coherentes. Existe una variante MLX de 2 bits para Apple Silicon. No se documenta soporte para vLLM, TGI, Ollama u otros servidores de inferencia.
- Advertencia de despliegue: con llama.cpp estándar el modelo carga y genera texto sin sentido sin emitir ningún error, por lo que un despliegue accidental en producción no fallaría de forma visible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna configuración de hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Formato | Contexto | Licencia | Backend requerido | Benchmarks |
|---|---|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-gguf-dev (este) | 26,9 B | `Q2_0` ternaria, 2 bits | GGUF | No disponible | Apache 2.0 | Fork de llama.cpp de PrismML | No publicados |
| Ternary-Bonsai-2-27B-gguf | No disponible en la información | `PQ2_0` y `PTQ1_0` | GGUF | No disponible | Apache 2.0 | Fork de llama.cpp de PrismML | No publicados |
| Ternary-Bonsai-2-27B-mlx-2bit | No disponible en la información | 2 bits | MLX | No disponible | Apache 2.0 | MLX (Apple Silicon) | No publicados |
| Qwen/Qwen3.8-27B (base) | 26,9 B (según el dato de este repositorio) | Sin cuantizar o la publicada por el autor original | No disponible | No disponible | No disponible en esta búsqueda | No disponible | No publicados |

No se dispone de información suficiente para comparar este modelo con alternativas de otros autores de la misma categoría (modelos densos o MoE de aproximadamente 27 B en cuantizaciones agresivas), ya que no hay datos de rendimiento publicados para ninguna de las variantes y la búsqueda web no devolvió documentación técnica relacionada.

## Limitaciones y advertencias

- Es una build de desarrollo, no una versión estable. El propio autor la describe como "testing build" y anuncia que se moverá al repositorio principal cuando el soporte upstream esté listo.
- Requiere un fork concreto de llama.cpp. En llama.cpp estándar el modelo carga sin error pero genera texto sin sentido, lo que constituye un riesgo serio de despliegue silencioso en entornos automatizados.
- Cuantización a 2 bits: la degradación de calidad frente al modelo base es esperable en cualquier esquema ternario de este tipo, aunque no se han publicado mediciones que la cuantifiquen.
- Sin datos de benchmarks: no es posible verificar afirmaciones de calidad, comparar con el modelo sin cuantizar ni justificar su uso en producción.
- Sin información sobre sesgos. No hay evaluación de sesgos ni de comportamientos dañinos en la documentación disponible.
- Riesgo de alucinación: no evaluado ni documentado.
- Contexto e idiomas: se desconocen tanto la longitud máxima de contexto como los idiomas soportados, ya que el repositorio no hereda ni reproduce la model card de Qwen/Qwen3.8-27B.
- Licencia: Apache 2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.8-27B, no incluida en la información proporcionada, y tener en cuenta que el uso práctico depende del fork de llama.cpp de PrismML y de los términos aplicables a ese código.
- Madurez y soporte: 0 descargas y 10 me gusta en el momento de la consulta; no hay comunidad, documentación de terceros ni integración con frameworks de serving habituales.
- Fechas de publicación y actualización registradas: 17 de septiembre de 2026.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf-dev
- Repositorio principal (uso normal, empaquetados `PQ2_0` y `PTQ1_0`): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Variante MLX de 2 bits para Apple Silicon: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Fork de llama.cpp de PrismML (necesario para la transformación de activaciones): https://github.com/PrismML-Eng/llama.cpp
- Repositorio de demostración con la configuración de cada backend: https://github.com/PrismML-Eng/Bonsai-demo
- Contacto del autor: contact@prismml.com
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Nota sobre la búsqueda web: los resultados obtenidos (prismlauncher.org, graphpad.com/features, openai.com/prism) corresponden a proyectos homónimos sin relación con este modelo y no se han utilizado como fuente.
