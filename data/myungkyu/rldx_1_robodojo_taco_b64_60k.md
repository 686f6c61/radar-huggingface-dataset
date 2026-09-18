# Myungkyu/rldx_1_robodojo_taco_b64_60k

## Resumen

`rldx_1_robodojo_taco_b64_60k` es una política robótica de bajo nivel (low-level policy) desarrollada por el usuario Myungkyu, obtenida mediante ajuste fino supervisado del modelo base `RLWRLD/RLDX-1-PT`. No es un modelo de lenguaje de propósito general: se trata de un modelo visión-lenguaje-acción (VLA) diseñado para controlar un robot bimanual de sobremesa a partir de imágenes de cámaras, propiocepción y una instrucción textual de subtarea. El ajuste se realizó sobre el conjunto de datos `Myungkyu/RoboDojo-taco-gemini`, formado por 8 tareas reales de horizonte largo con 100 demostraciones cada una y etiquetas densas de subtarea anotadas fuera de línea.

La relevancia de esta ficha es acotada y muy específica: el modelo existe como un checkpoint final de un experimento de investigación (batch 64, 60 000 pasos de optimizador) y no como un artefacto con soporte de producción. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card advierte de que las configuraciones apuntan al backbone y al tokenizer del modelo base por identificador de Hub o por una ruta local del sitio de entrenamiento, por lo que hay que redirigirlas a copias locales antes de cargar el modelo. Es, por tanto, material útil para reproducir o continuar una línea de trabajo concreto en manipulación bimanual, no una dependencia lista para integrar.

En cuanto a escala, el checkpoint contiene 6 912 896 320 parámetros (aproximadamente 6,91 mil millones), según los datos reales de los tensores en formato safetensors, y el repositorio ocupa 13,8 GB. Ese tamaño es coherente con pesos almacenados en precisión de 16 bits. La arquitectura declarada es RLDX-1-PT con una ventana de vídeo de longitud 4, tres vistas de cámara en vivo y sin ranura de keyframe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RLDX-1 (modelo visión-lenguaje-acción, VLA) con backbone heredado de `RLWRLD/RLDX-1-PT`; ventana de vídeo de longitud 4, tres vistas de cámara en vivo, sin ranura de keyframe |
| Parametros totales | 6 912 896 320 (≈6,91 mil millones), dato real de safetensors |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (las entradas de texto son instrucciones de subtarea; no se declara cobertura multilingüe) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `RLWRLD/RLDX-1-PT`, un backbone de tipo visión-lenguaje-acción. La model card describe la configuración como "RLDX-1-PT (video length 4, three live camera views, no keyframe slot)", es decir, el modelo consume una secuencia de cuatro fotogramas procedentes de tres cámaras activas simultáneamente y no utiliza una ranura de keyframe. Las entradas declaradas son: imagen de la cabeza del robot, imágenes de las muñecas izquierda y derecha, propiocepción y el texto de la subtarea actual. No hay entrada de keyframe, lo que diferencia esta variante de otras configuraciones del backbone.

El entrenamiento consistió en un ajuste fino sobre `Myungkyu/RoboDojo-taco-gemini`, un conjunto compuesto por 8 tareas reales de manipulación bimanual de sobremesa, con 100 demostraciones por tarea y anotaciones densas de subtarea derivadas del contexto específico de cada tarea (anotación fuera de línea). El optimizador se ejecutó con batch de 64 durante 60 000 pasos, y el artefacto publicado corresponde al checkpoint final. No se documentan en la información disponible ni las recetas de RLHF/DPO ni el número total de tokens o trayectorias vistas por el modelo, ni innovaciones técnicas adicionales más allá de la propia arquitectura del backbone.

## Capacidades

- Control robótico de bajo nivel: genera acciones motoras para un robot bimanual de sobremesa a partir de observaciones visuales y propioceptivas.
- Manipulación bimanual de horizonte largo: entrenado específicamente sobre 8 tareas de este tipo, con 100 demostraciones por tarea.
- Condicionamiento por subtarea: acepta el texto de la subtarea en curso como entrada, lo que permite guiar el comportamiento dentro de una tarea larga.
- Fusión de tres vistas de cámara: procesa simultáneamente la vista de cabeza y las dos vistas de muñeca.
- Integración de propiocepción: incorpora el estado propioceptivo del robot junto a las observaciones visuales.
- Ventana temporal de vídeo de 4 fotogramas: aporta contexto temporal de corto alcance.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de agentes de software; la descomposición en subtareas proviene de las etiquetas del conjunto de datos, no de un modo de razonamiento declarado.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión general, audio): visión sí, en la forma restringida descrita (tres cámaras del robot); no se declara audio ni modo de razonamiento explícito.

## Casos de uso

- Reproducción de las tareas de RoboDojo: cargar el checkpoint sobre el mismo montaje robótico y la misma configuración de cámaras para replicar las 8 tareas bimanuales de sobremesa, comprobando la tasa de éxito frente al checkpoint base `RLWRLD/RLDX-1-PT`.
- Punto de partida para ajustes finos posteriores: al ser un checkpoint final con un pipeline de entrenamiento documentado (batch 64, 60 000 pasos), sirve como inicialización para nuevas tareas del mismo robot sin partir del modelo preentrenado.
- Investigación en políticas VLA condicionadas por lenguaje de subtarea: permite estudiar cómo la etiqueta densa de subtarea anotada fuera de línea afecta al comportamiento frente a políticas que solo reciben una instrucción de tarea global.
- Evaluación de generalización entre tareas: con 8 tareas y 100 demostraciones cada una, es un banco de pruebas razonable para medir transferencia entre tareas de un mismo montaje.
- Estudio de fusión multisensorial: al combinar cabeza, dos muñecas y propiocepción, permite experimentos de ablación sobre qué modalidad aporta más información en cada fase de la tarea.
- Base para destilación o compresión: con 6,91 mil millones de parámetros y pesos en safetensors, es un candidato razonable para estudiar destilación hacia políticas más pequeñas que corran a mayor frecuencia de control.
- Referencia para comparativas internas de checkpoints: el nombre del repositorio codifica la configuración de entrenamiento (b64, 60k), lo que facilita contrastarlo con otros checkpoints de la misma serie.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe la configuración de entrenamiento (batch 64, 60 000 pasos, checkpoint final) y las entradas del modelo, sin tasas de éxito, métricas de tarea ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para los pesos: en precisión de 16 bits, unos 14 GB (6,91 mil millones de parámetros); en fp32, unos 28 GB; en cuantización de 4 bits, del orden de 3,5 a 4 GB. Son estimaciones derivadas del recuento de parámetros y del tamaño del repositorio (13,8 GB), no datos publicados por el autor.
- VRAM adicional: hay que sumar la memoria de activaciones y de los codificadores visuales, que en este modelo es relevante porque procesa tres vistas de cámara con ventana temporal de 4 fotogramas.
- GPU recomendadas: A100 40 GB u 80 GB y H100 para entrenamiento o evaluación desatendida; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia en 16 bits.
- Cabe en GPU de consumo: sí, previsiblemente en bf16 dentro de 24 GB (RTX 4090, RTX 3090); en tarjetas de 16 GB el margen es ajustado una vez contadas activaciones y buffers de imagen.
- Opciones de despliegue: no se documentan en la información disponible. El modelo se distribuye como safetensors, por lo que la carga dependerá del código del backbone RLDX-1-PT. No hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Para control robótico en tiempo real conviene medir la frecuencia de inferencia en el hardware objetivo antes de desplegar.
- Requisito de configuración: las configs apuntan al backbone y al tokenizer por identificador de Hub o por ruta local del sitio de entrenamiento; hay que redirigirlas a copias locales antes de cargar el modelo.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la información proporcionada. La búsqueda web realizada no devolvió resultados técnicos relevantes (solo resultados genéricos de YouTube), por lo que no es posible construir una comparativa fiable con cifras contrastadas. A modo de orientación de categoría, el modelo pertenece al segmento de políticas VLA de escala media (aproximadamente 7 000 millones de parámetros), donde se sitúan propuestas como OpenVLA, π0 o RDT-1B, pero los parámetros, contextos, licencias y rendimientos de esas alternativas no se han verificado aquí y no deben tomarse como datos de esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rldx_1_robodojo_taco_b64_60k | 6 912 896 320 | no disponible | no disponible | HuggingFace (0 descargas) |
| Alternativas de la misma categoría (VLA para manipulación) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especialización extrema: es una política de bajo nivel ajustada para 8 tareas concretas de un montaje bimanual específico; no es un modelo de propósito general ni un asistente conversacional.
- Dependencia del montaje: las entradas esperadas (cabeza más dos muñecas, propiocepción y texto de subtarea) implican una configuración hardware concreta; fuera de ella el modelo no es utilizable sin reentrenamiento.
- Sin métricas publicadas: no hay tasas de éxito ni evaluaciones independientes, por lo que no se puede estimar su fiabilidad real en producción.
- Licencia no declarada: al no especificarse licencia, no hay autorización explícita para uso comercial; conviene consultar al autor y revisar también la licencia del modelo base `RLWRLD/RLDX-1-PT`.
- Sin datos de sesgo: no se documentan sesgos, pero al depender de demostraciones humanas reales hereda las distribuciones y posibles sesgos de esas 100 demostraciones por tarea.
- Riesgo de alucinación en el sentido de acciones incorrectas: como toda política entrenada por imitación, puede producir acciones plausibles pero erróneas fuera de la distribución de estados visitados durante el entrenamiento.
- Ausencia de variantes cuantizadas: no se publican versiones GGUF, AWQ o GPTQ, lo que limita el despliegue en hardware restringido sin trabajo adicional.
- Configuración no portable: la model card indica que las configs referencian rutas o identificadores del sitio de entrenamiento, lo que puede provocar errores de carga si no se ajustan manualmente.
- Idiomas y contexto no declarados: no hay información sobre cobertura lingüística de las instrucciones de subtarea ni sobre longitud de contexto.
- Metadatos a revisar: las fechas de creación y actualización del repositorio figuran como 2026-09-18, un valor que conviene verificar en el Hub antes de citarlo.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/rldx_1_robodojo_taco_b64_60k
- Conjunto de datos de ajuste fino: https://huggingface.co/datasets/Myungkyu/RoboDojo-taco-gemini
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT
- Perfil del autor: https://huggingface.co/Myungkyu
- Paper, blog o repositorio adicional: no disponible (la búsqueda web no devolvió resultados técnicos relevantes)
