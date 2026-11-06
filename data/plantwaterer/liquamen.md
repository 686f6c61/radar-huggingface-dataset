# plantwaterer/liquamen

## Resumen

Liquamen es un ajuste fino (fine-tune) de google/gemma-4-31B-it, desarrollado por el usuario plantwaterer, orientado a la toma de decisiones mediante preguntas de opción múltiple. A diferencia de un modelo generativo convencional, liquamen no devuelve texto libre: para cada pregunta produce una distribución de probabilidad sobre las opciones disponibles (o sobre las respuestas Sí/No), lo que lo convierte en una herramienta de decisión estructurada más que de generación abierta. El modelo tiene 31.273.088.876 parámetros y se distribuye en formato safetensors con licencia Apache 2.0.

La innovación principal reside en su cabeza de salida calibrada (`vbll_head.safetensors`), que combina una temperatura ajustada (T = 1.085) para preguntas de opción múltiple estándar con un residual bayesiano de última capa (posterior de Laplace) para preguntas binarias. Además, el repositorio incluye varios motores de inferencia del proyecto Decision Index que implementan promediado de orden de opciones adaptativo a la longitud y correcciones bayesianas, diseñados para reducir el sesgo posicional en tareas de elección.

El modelo requiere un procedimiento de inferencia no estándar: utiliza una función de atención personalizada (`jev_mem`) en las capas de atención completa, donde cada token atiende a todos los tokens del mismo prompt, mientras que las capas de ventana deslizante permanecen causales con ventana de 1.024. Los transformers estándar producirían respuestas distintas, por lo que el uso del motor y la cabeza es obligatorio, no opcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma 4), con capas de atención completa y capas de ventana deslizante causal (ventana 1.024) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana deslizante de 1.024 en capas SWA; contexto total no especificado) |
| Tipos de cuantizacion | no disponible (pesos en bf16; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model-*.safetensors`, `vbll_head.safetensors`) |

## Arquitectura y entrenamiento

Liquamen se construye sobre google/gemma-4-31B-it, un transformer de 31.000 millones de parámetros. La modificación arquitectónica clave afecta al mecanismo de atención: en las capas de atención completa, cada token del prompt atiende a todos los tokens del mismo prompt (atención bidireccional dentro del prompt), mientras que las capas de ventana deslizante mantienen comportamiento causal con ventana de 1.024 tokens. Esta configuración se implementa mediante la función de atención `jev_mem` en `fullft_mem.py`, que se registra en la interfaz de atención de transformers y se ejecuta sobre PyTorch SDPA (kernels memory-efficient y flash). El motor de inferencia rechaza cualquier otra configuración de atención.

Sobre el modelo base se añade una cabeza de última capa calibrada (`vbll_head.safetensors` y `vbll_head.json`). Para preguntas de opción múltiple ordinarias, la salida es el softmax de los logits de las letras de las opciones en la posición de respuesta, dividido por una temperatura ajustada de T = 1.085. Para preguntas de tipo Sí/No, se aplica un residual bayesiano de última capa sobre el estado oculto del modelo (un posterior de Laplace integrado) que ajusta los dos logits. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Respuesta a preguntas de opción múltiple con distribución de probabilidad calibrada sobre cada opción (hasta 52 opciones según el motor `lenavg_bayes_balanced_k5_engine`).
- Respuesta a preguntas binarias Sí/No con corrección bayesiana sobre los logits.
- Procesamiento de peticiones con múltiples preguntas en una sola solicitud, cada una con su propio tipo (`choice` o `noul`) e instrucciones.
- Soporte de criterios o definiciones para las opciones Sí/No, que se muestran en el prompt como `Yes: <definición>` / `No: <definición>`.
- Promediado de orden de opciones adaptativo a la longitud (hasta 4 órdenes para conjuntos de 5 a 52 opciones, 2 órdenes para Sí/No) para mitigar el sesgo posicional.
- Generación de texto conversacional (pipeline declarado: text-generation), aunque la funcionalidad principal documentada es la decisión estructurada.
- Capacidades multimodales heredadas del modelo base (tag `image-text-to-text`), si bien la model card no detalla su uso en este fine-tune.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso basado en agentes.

## Casos de uso

- **Sistemas de decisión automatizada con opciones acotadas**: el modelo devuelve una probabilidad por opción, lo que permite umbralizar decisiones y auditar la confianza. Adecuado para enrutamiento de tickets, clasificación de incidencias o selección de acciones en pipelines.
- **Encuestas y formularios con puntuación de confianza**: cada pregunta de opción múltiple recibe una distribución calibrada, útil para detectar ítems ambiguos o de baja confianza en procesos de anotación y control de calidad.
- **Preguntas binarias con calibración bayesiana**: casos como "¿es probable lluvia intensa?" se responden con una corrección de Laplace sobre los logits, lo que aporta probabilidades más fiables que un simple softmax para decisiones Sí/No.
- **Evaluación de políticas y criterios**: el soporte de `criteria` con definiciones para Sí/No permite incorporar rúbricas explícitas en el prompt, útil en moderación de contenido o verificación de cumplimiento normativo.
- **Sistemas de votación o consenso entre modelos**: al emitir distribuciones de probabilidad, liquamen puede combinarse con otros clasificadores mediante agregación probabilística (media, producto, voto bayesiano).
- **Investigación en calibración y sesgo posicional**: los motores de promediado de orden (Latin-square cíclico) y la cabeza VBLL lo convierten en una plataforma para estudiar calibración y robustez al orden de opciones en modelos de 31B.
- **Asistentes de decisión en dominios con opciones predefinidas**: planificación de recursos, selección de tratamientos o configuraciones, donde la salida debe ser una de un conjunto finito y no texto libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 31.273 millones de parámetros en bf16, los pesos ocupan aproximadamente 62,6 GB (tamaño del repo). Se necesita al menos una GPU con 80 GB (A100 80GB, H100 80GB) para cargar el modelo en bf16 sin cuantización. La cabeza se ejecuta en CPU en float64, por lo que no consume VRAM adicional significativa.
- **GPU recomendadas**: A100 80GB, H100 80GB, o configuraciones multi-GPU con tensor parallelism. No cabe en GPUs de consumo (RTX 4090 24GB, RTX 3090 24GB) en bf16.
- **Cuantización**: el autor no documenta cuantizaciones (GGUF, GPTQ, AWQ), por lo que no se puede confirmar el despliegue en GPUs de consumo mediante cuantización.
- **Opciones de despliegue**: el modelo requiere el kit Decision Index (`pip install "git+https://github.com/apolinario/decision-index@9eb2dbe2..."`) y los motores incluidos en el repositorio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; de hecho, el motor rechaza cualquier atención distinta de `jev_mem`, lo que impide su uso con stacks estándar.
- **Latencia y throughput**: no disponibles. El motor `lenavg_bayes_balanced_k5_engine` realiza hasta 4 pasadas forward por pregunta (2 para Sí/No) en peticiones con L_raw ≤ 939 o L_rendered ≤ 6.000, lo que multiplica el coste computacional respecto a una pasada única.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liquamen | 31,27B | no disponible | Distribución sobre opciones | Apache 2.0 | Hugging Face (0 descargas) |
| google/gemma-4-31B-it | 31B (aprox.) | no disponible | Texto generativo | Términos Gemma | Hugging Face |
| Modelos de clasificación/elección de 30B | no disponible | no disponible | Etiqueta o probabilidad | variable | no disponible |

No se dispone de información sobre benchmarks comparativos ni de alternativas directas de la misma categoría (modelos de 31B especializados en decisión con opción múltiple y calibración bayesiana) en la información proporcionada.

## Limitaciones y advertencias

- **Procedimiento de inferencia obligatorio**: el modelo no funciona correctamente con transformers estándar; requiere la atención `jev_mem` y la cabeza `vbll_head`. Usar otra configuración produce respuestas distintas, según advierte el autor.
- **Dependencia de código externo**: el kit Decision Index se instala desde un commit concreto de GitHub (`9eb2dbe2a358004c8782c66e40a83ac07b953fec`), lo que introduce un riesgo de reproducibilidad y de mantenimiento a largo plazo.
- **Sesgo posicional**: aunque los motores de promediado de orden lo mitigan, el sesgo no se elimina por completo; el autor documenta que las peticiones largas (L_raw > 939 y L_rendered > 6.000) usan una sola pasada, sin promediado.
- **Riesgo de alucinación**: al ser un fine-tune de un modelo generativo, las probabilidades pueden estar mal calibradas en dominios fuera de la distribución de entrenamiento; no se documentan evaluaciones de calibración (ECE, Brier) en la información disponible.
- **Idiomas**: no se especifican los idiomas soportados; la model card está en inglés y no hay evidencia de rendimiento multilingüe.
- **Contexto**: la ventana deslizante es de 1.024 tokens en las capas SWA, y el contexto total no está documentado; peticiones largas pueden degradar la calidad.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede estar sujeto a los términos de Google; conviene verificar la compatibilidad de licencias antes de un despliegue comercial.
- **Madurez**: el modelo tiene 0 descargas y 0 likes en Hugging Face, creado y actualizado el 2026-11-01, sin evidencia de validación externa ni de uso en producción.

## Enlaces

- [Hugging Face: plantwaterer/liquamen](https://huggingface.co/plantwaterer/liquamen)
- [Modelo base: google/gemma-4-31B-it](https://huggingface.co/google/gemma-4-31B-it)
- [Repositorio GitHub (código y model card): treewaterer/liquamen](https://github.com/treewaterer/liquamen)
- [Decision Index kit: apolinario/decision-index](https://github.com/apolinario/decision-index)
