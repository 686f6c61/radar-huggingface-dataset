# ApolloRaines/Clef-Flash-ReducedSycophancy-m0.5

## Resumen

Clef-Flash-ReducedSycophancy-m0.5 es una variante de pesos del modelo multimodal Cloudflare/clef-flash, un modelo de 9.409.813.744 parámetros (aproximadamente 9,4B) orientado a la toma de decisiones tipadas. A diferencia de un modelo generativo convencional, Clef-Flash recibe un estado (texto, JSON, imagen o vídeo) junto con un esquema de preguntas tipadas y devuelve, en una sola pasada, una probabilidad para cada opción permitida de cada pregunta. No genera texto libre ni requiere análisis posterior de la salida.

La modificación la firma el usuario ApolloRaines y no implica entrenamiento alguno: se trata de una cirugía de pesos directa ("weight surgery") realizada con la herramienta jBlaze sobre el backbone de atención híbrida de Qwen3.5. El objetivo declarado es reducir la dirección de comportamiento asociada a la adulación (sycophancy), aplicada en las proyecciones de salida de atención y MLP de las 32 capas del modelo con un multiplicador de 0,5 (m=0.5 sobre el brazo A2). La cabeza de decisión conjunta (`joint_head.safetensors`) no se ha tocado, de modo que la inferencia tipada conserva el mismo esquema y la misma forma de salida que el modelo original.

Es relevante ahora por dos motivos. Primero, es la primera publicación de jBlaze sobre la arquitectura de atención híbrida de Qwen3.5, lo que valida el perfilado de esta familia de modelos sin recurrir a fine-tuning. Segundo, demuestra que se puede modificar un comportamiento concreto (en este caso, la tendencia a dar la razón al usuario) escribiendo directamente en los pesos, sin reentrenar y conservando intactas las capacidades de decisión tipada. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y no declara idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de atencion hibrida basado en Qwen3.5: 32 capas, de las cuales 24 usan atencion lineal (`linear_attn.out_proj`) y 8 usan atencion completa (`self_attn.o_proj`); incluye encoder de vision y una cabeza de decision conjunta (joint schema head) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors sin cuantizaciones precalculadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fragmentados, con `model.safetensors.index.json`, `config.json` y `generation_config.json`); el cabezal se distribuye aparte en `joint_head.safetensors` |

## Arquitectura y entrenamiento

El modelo hereda el backbone de Cloudflare/clef-flash, que a su vez se post-entrena a partir de Qwen/Qwen3.5-9B conservando su encoder de vision. La arquitectura es un transformer de atención híbrida: 24 de las 32 capas emplean atención lineal y las 8 restantes atención completa, un diseño que busca reducir el coste computacional del contexto largo manteniendo la capacidad de atención global en una fracción de las capas. Sobre el backbone se monta una cabeza de decisión conjunta, un pequeño transformer que lee los estados ocultos finales, enruta la evidencia del estado hacia cada pregunta y puntúa conjuntamente todas las opciones de todas las preguntas. La salida es un logit por opción permitida, y basta aplicar un softmax por pregunta para obtener probabilidades.

Esta variante concreta no ha sido entrenada ni ajustada: la modificación se realizó con jBlaze, una herramienta de cirugía de pesos que extrae una dirección en el residual stream contrastando activaciones medias sobre pares de prompts positivos/negativos, recorta valores atípicos (winsorizing) y reduce mediante SVD a un subespacio por capa. Esa dirección se proyecta fuera (o dentro) de los tensores de salida del bloque de atención y del bloque MLP (`mlp.down_proj`), ponderada por un multiplicador. En este caso se partió de una base de identidad reducida (deid m=1.0) y se aplicó la dirección de sycophancy reducida con m=0.5 sobre el brazo A2, cubriendo las 32 capas. El perfilado de jBlaze para la familia Qwen3.5 se verificó al 100/100 contra el modelo vivo mediante `jprobe`, que engancha cada módulo y confirma la identidad `layer_out - layer_in == attn + mlp` sobre activaciones reales. No se usaron datos de entrenamiento nuevos ni pasos de gradiente.

## Capacidades

- Decision tipada multimodal: dado un estado y un esquema de preguntas, devuelve una probabilidad por cada opción permitida de cada pregunta en una sola pasada, sin generación de texto libre ni parseo posterior.
- Entrada multimodal: acepta texto, JSON, imágenes y vídeo como estado de partida, gracias al encoder de visión heredado de Clef-Flash y Qwen3.5-9B.
- Salida estructurada: la cabecera conjunta garantiza el mismo esquema de salida que la versión original; útil para clasificación y clasificación multi-etiqueta.
- Modo CausalLM: además de la decisión tipada, puede usarse para generación de texto libre aplicando la plantilla de chat de Qwen3.5 con `enable_thinking=False` para una mayor coherencia en esta magnitud de edición.
- Compatibilidad de herramientas: mantiene el soporte del ecosistema Clef-Flash, incluido `load_release_model(path, device="cuda")` y `systemone(model, processor, request)`, y es compatible con la API de Jev y SystemOne.
- Multilingüismo: no disponible (el repositorio no declara idiomas soportados).
- Sin tool calling, agentes ni cadena de razonamiento multi-paso documentados en la información disponible.

## Casos de uso

- Clasificación de facturas y documentos: el modelo puede recibir el texto o una imagen de una factura junto con un esquema como `invoice.status` y `overdue`, y devolver la probabilidad de cada opción; es adecuado porque la salida es directamente tipada y no requiere parsear texto generado.
- Enrutado de decisiones en pipelines de datos: dado un estado estructurado (JSON) y un conjunto de preguntas, el modelo puntúa todas las opciones a la vez, lo que permite usarlo como etapa de decisión dentro de un flujo automatizado sin generación intermedia.
- Moderación y clasificación de contenido: la naturaleza de clasificación multimodal permite asignar etiquetas tipadas a texto o imágenes con probabilidades calibradas por pregunta.
- Verificación documental con imágenes: al aceptar imágenes y vídeo como estado, es apto para comprobar campos sobre capturas, formularios escaneados o fotogramas, devolviendo decisiones estructuradas.
- Sistemas de decisión sensibles a la adulación: la modificación reduce la tendencia a validar la premisa del usuario, por lo que encaja en escenarios donde el modelo no debe "dar la razón" automáticamente, como evaluación de afirmaciones o revisión de código.
- Investigación sobre modificación de comportamiento: sirve como caso de estudio reproducible para comparar la cirugía de pesos jBlaze frente a alternativas como ROME, MEMIT, AlphaEdit o LoRA, con un canario medible incluido en la model card.
- Integración en la API compatible con Jev y SystemOne: al ser un reemplazo directo de Cloudflare/clef-flash, se puede desplegar sustituyendo el checkpoint sin cambiar el código de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo documenta dos pruebas canario:

| Prueba | Clef-Flash original | Esta variante |
|---|---|---|
| Canario de texto libre (CausalLM) | "It works perfectly fine! Adding +0 is mathematically valid... However, from a software engineering perspective..." | "It works correctly, but you have an unnecessary +0. Consider removing it for cleaner code." |
| Canario de decisión tipada (SystemOne, `invoice.status`, `overdue`) | Confianza 0.978 | Confianza 0.982 |

La única métrica numérica aportada es el aumento de confianza en la decisión tipada (0.982 frente a 0.978 por defecto). No hay comparación con la suite de evaluación completa de Clef.

## Requisitos de hardware

- VRAM estimada: con 9,4B parámetros, la inferencia en BF16/FP16 requiere en torno a 18,8 GB solo para los pesos, más el encoder de visión y los estados de activación. En cuantización de 8 bits bajaría a unos 9-10 GB y en 4 bits a unos 5-6 GB, aunque el repositorio no publica cuantizaciones preparadas.
- GPU recomendadas: A100 (40/80 GB) o H100 para FP16 con contexto amplio y batch grande; en consumer, una RTX 3090 o RTX 4090 (24 GB) puede alojar los pesos en FP16 siempre que se limite el tamaño de batch y la longitud de contexto, y con cuantización de 8 o 4 bits cabe con holgura.
- Compatibilidad con GPU de consumo: sí, es viable en GPUs de 24 GB (RTX 3090, 4090) y, con cuantización agresiva, en tarjetas de 16 GB o menos.
- Opciones de despliegue: el modelo requiere código personalizado (`load_release_model`, `systemone`), por lo que el uso directo con la librería transformers exige cargar el código del autor. No se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI en la información disponible; llama.cpp y Ollama dependerían de que exista una conversión a GGUF, que no se menciona.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| Clef-Flash-ReducedSycophancy-m0.5 | ~9,4B | no disponible | Multimodal de decision tipada (Qwen3.5 hibrido) | Apache 2.0 | Variante con sycophancy reducida via jBlaze; 0 descargas |
| Cloudflare/clef-flash | ~9,4B | no disponible | Multimodal de decision tipada | Apache 2.0 | Modelo base sin modificar; misma cabecera y esquema |
| Cloudflare/clef | no disponible | no disponible | Multimodal de decision tipada | no disponible | Variante de mayor tamano de la familia Clef |
| Qwen/Qwen3.5-9B | ~9B | no disponible | LLM multimodal generativo | no disponible | Modelo de partida del post-entrenamiento de Clef-Flash |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de fuga entre direcciones de comportamiento: el propio autor advierte de que las direcciones conductuales pueden filtrarse entre prompts; un modelo con la verbosidad reducida puede seguir siendo verboso en algunos casos, y viceversa.
- Cabecera de decision poco validada: la cabeza conjunta se preserva por construcción, pero solo se ha sometido a una prueba superficial ("smoke test"), no a la suite completa de evaluación de Clef. Esto implica que su comportamiento en producción no está garantizado.
- Ausencia de benchmarks: no hay resultados de la evaluación estándar de Clef ni de benchmarks generales, por lo que no se puede cuantificar el impacto de la edición sobre el resto de capacidades.
- Modelo muy reciente y sin adopción: 0 descargas y 0 likes; no hay evidencia de uso en producción ni reportes de terceros.
- Idiomas no especificados: el repositorio no declara idiomas soportados, por lo que no se puede garantizar un rendimiento multilingüe concreto.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Cloudflare/clef-flash y de Qwen/Qwen3.5-9B conviene revisar las condiciones de esos modelos base.
- Requiere código personalizado: no es un checkpoint de transformers "estándar"; la carga y la inferencia dependen del tooling de Clef-Flash (`load_release_model`, `systemone`), lo que complica su integración en stacks que esperen un modelo convencional.
- Alucinacion: no se documenta un análisis específico de alucinacion para esta variante; al no generar texto libre en modo tipado, el riesgo se traslada a la calibración de las probabilidades de decisión, que no está evaluada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ApolloRaines/Clef-Flash-ReducedSycophancy-m0.5
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Modelo de partida de Clef-Flash: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante mayor de la familia: https://huggingface.co/Cloudflare/clef
- Herramienta jBlaze: https://jblaze.dev
- Metodología jBlaze y comparación con trabajos previos: https://jblaze.dev/prior-work.html
- Anuncio de los modelos de decisión Clef: https://blog.cloudflare.com/clef-decision-models
- Leaderboard Decision Index: https://clef-evals.workers-ai-mle.workers.dev
