# reflection/Beam-1.0-501B-A23B-NVFP4

## Resumen

Beam-1.0-501B-A23B-NVFP4 es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Reflection, publicado en Hugging Face bajo licencia Apache 2.0. Con 501.267.612.352 parámetros totales (501,3B) y 23,4B parámetros activos por token, se posiciona como un modelo de gran escala orientado a razonamiento, generación de código y uso de herramientas en entornos agénticos. Esta ficha concreta corresponde al checkpoint cuantizado en NVFP4 (4 bits de coma flotante con escalado por bloques, formato de NVIDIA), mientras que el release incluye también versiones BF16 y FP8.

El modelo emplea una arquitectura transformer con 52 capas (3 densas y 49 MoE), 256 expertos, atención GQA con compuerta y sliding window attention, y una ventana de contexto de 1M tokens. Su vocabulario es de 152k tokens y la plantilla de chat es una variante del formato Harmony. La fecha de corte de conocimiento declarada es el 30 de junio de 2026. Está desarrollado predominantemente para inglés.

La relevancia de Beam radica en su propuesta de eficiencia en tokens de razonamiento: el autor afirma alcanzar calidad de solución comparable a modelos abiertos líderes con aproximadamente 3 veces menos tokens de razonamiento en inferencia. El checkpoint NVFP4 reduce el peso del repositorio a 293,6 GB y está etiquetado para despliegue en SageMaker y Azure, lo que apunta a un uso en producción sobre hardware NVIDIA moderno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (sparse mixture-of-experts), 52 capas: 3 densas + 49 MoE |
| Parametros totales | 501.267.612.352 (501,3B) |
| Parametros activos | 23,4B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (este checkpoint); el release incluye tambien BF16 y FP8 |
| Idiomas soportados | Ingles (predominante) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizacion NVFP4, 8-bit por tag; modelopt) |
| Expertos | 256 |
| Atencion | Gated GQA + Sliding Window Attention |
| Vocabulario | 152k tokens |
| Modalidades | Texto |
| Plantilla de chat | Modified Harmony format |
| Fecha de corte de conocimiento | 30 de junio de 2026 |
| Tamano del repositorio | 293,6 GB |

## Arquitectura y entrenamiento

Beam utiliza una arquitectura transformer dispersa de tipo MoE con 501,3B parámetros totales y 23,4B activos. El cuerpo del modelo consta de 52 capas, de las cuales 3 son densas y 49 son capas MoE con 256 expertos. La atención combina GQA con compuerta (gated GQA) y sliding window attention, un diseno habitual para sostener ventanas de contexto muy largas (1M tokens) con coste de atención controlado. El vocabulario de 152k tokens y la plantilla de chat basada en una variante del formato Harmony sugieren un entrenamiento orientado a conversación multi-turno y a la integración con arneses agénticos.

No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni de los detalles de las fases de alineación (RLHF/DPO). El autor sí destaca como innovación principal la eficiencia en tokens de razonamiento: el modelo alcanza calidad comparable a modelos abiertos líderes con aproximadamente 3 veces menos tokens de razonamiento en tiempo de inferencia, lo que reduce coste y latencia en tareas de razonamiento largo. El checkpoint aquí descrito está cuantizado en NVFP4 mediante modelopt, y el release completo incluye también BF16 y FP8.

## Capacidades

- Generación de texto conversacional y razonamiento general.
- Razonamiento matemático y científico de nivel graduado, incluida demostración de teoremas y matemática aplicada.
- Generación de código en múltiples lenguajes y resolución de issues reales de GitHub.
- Operación en entornos CLI y DevOps, con integración en arneses de codificación agénticos.
- Uso de herramientas (tool calling) y function calling, con integración de herramientas basada en MCP.
- Navegación web (browsing) dentro de flujos agénticos.
- Ejecución de tareas de horizonte largo y flujos multi-paso a partir de instrucciones en lenguaje natural.
- Razonamiento con modo de pensamiento (reasoning tokens) y énfasis en eficiencia de tokens.
- Capacidades multilingües limitadas: el modelo está desarrollado predominantemente para inglés.
- Sin soporte de visión ni audio (modalidad exclusivamente texto).

## Casos de uso

- Resolución automática de issues de GitHub: el modelo puede leer el contexto del repositorio, localizar el fallo y proponer un parche, integrándose en arneses agénticos de codificación; su ventana de 1M tokens permite incluir ficheros y trazas extensas en una sola pasada.
- Asistente de CLI y DevOps: ejecución de flujos multi-paso sobre terminal, diagnóstico de errores de despliegue y generación de comandos, aprovechando el soporte de tool calling y la operación en entornos de línea de comandos.
- Agente de atención al cliente multi-turno: gestión de conversaciones largas con historial extenso gracias al contexto de 1M tokens y a la plantilla Harmony para diálogo estructurado.
- Automatización de pipelines de CI/CD: el modelo puede integrarse como paso de revisión de código, generación de tests o corrección automática, con tool calling para consultar el estado del pipeline y aplicar cambios.
- Razonamiento científico y matemático asistido: resolución de problemas de nivel graduado, demostración de teoremas y matemática aplicada con un coste de razonamiento reducido (aproximadamente 3 veces menos tokens que alternativas comparables).
- Agentes de investigación con navegación web: tareas de horizonte largo que combinan browsing, extracción de información y síntesis, con integración de herramientas vía MCP.
- Depuración y planificación autónoma: el autor indica que la calidad de razonamiento del modelo se transfiere a depuración, planificación y autocorrección durante la ejecución agéntica, lo que lo hace adecuado para bucles de agente con verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de orden de magnitud, el repositorio NVFP4 ocupa 293,6 GB, por lo que la inferencia requiere agregar memoria para KV cache y activaciones; con contexto de 1M tokens el KV cache puede ser muy elevado y conviene planificar su tamaño según la longitud efectiva de las secuencias.
- GPU recomendadas: el checkpoint está etiquetado para despliegue en SageMaker y Azure, lo que apunta a GPUs de centro de datos con soporte de NVFP4 (familia NVIDIA Blackwell o posterior). No se especifican modelos concretos en la información disponible.
- Compatibilidad con GPU de consumo: no disponible. El tamaño del checkpoint (293,6 GB) excede la VRAM de cualquier GPU de consumo actual, por lo que no cabe en una RTX 4090 ni similares sin técnicas de offload a CPU o disco.
- Opciones de despliegue: el autor no detalla frameworks concretos en la información proporcionada; las etiquetas de Hugging Face indican integración con SageMaker y Azure. Para vLLM, llama.cpp, Ollama o TGI no hay confirmación en la información disponible, y la cuantización NVFP4 requiere soporte específico de kernel.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables que permitan una comparación rigurosa. Como referencia estructural, se puede contrastar con otros MoE abiertos de gran escala, pero sin cifras de benchmarks verificadas no es posible establecer una comparativa cuantitativa.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Beam-1.0-501B-A23B-NVFP4 | 501,3B | 23,4B | 1M | Apache 2.0 | Hugging Face (NVFP4, BF16, FP8) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: el modelo está desarrollado predominantemente para inglés; el rendimiento en castellano y otros idiomas no está garantizado ni documentado.
- Sesgos: no se documentan en la información disponible los sesgos conocidos del modelo; como todo modelo entrenado con datos web a gran escala, es probable que herede sesgos de sus datos, pero no hay evidencia específica publicada en la ficha.
- Alucinación: no se han publicado tasas de alucinación ni evaluaciones específicas de fidelidad; en tareas de razonamiento y código conviene verificar las salidas con herramientas externas.
- Contexto: aunque la ventana es de 1M tokens, el rendimiento efectivo en longitudes extremas no está documentado y el coste de KV cache puede ser prohibitivo en despliegues reales.
- Cuantización: este checkpoint es NVFP4; la pérdida de calidad frente a BF16/FP8 no está cuantificada en la información disponible, y el soporte de NVFP4 depende del hardware y del stack de inferencia.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos del repositorio y las dependencias de modelopt y del formato Harmony.
- Producción: el tamaño del checkpoint (293,6 GB) y la necesidad de hardware de centro de datos con soporte NVFP4 limitan su despliegue a infraestructuras específicas; la latencia y el throughput no están documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reflection/Beam-1.0-501B-A23B-NVFP4
- Organización en Hugging Face: https://huggingface.co/reflection
- GitHub de Reflection: https://github.com/reflection-oss
- Blog de lanzamiento: https://reflection.ai/blog
- Documentación para desarrolladores: https://developers.reflection.ai/introduction
- Informe técnico (paper): https://huggingface.co/papers/2611.26358
- Sitio web de Reflection: https://reflection.ai/
- Licencia (Apache 2.0): https://huggingface.co/reflection/Beam-1.0-501B-A23B/blob/main/LICENSE
- Checkpoint BF16 (referenciado en la model card): https://huggingface.co/reflection/Beam-1.0-501B-A23B
