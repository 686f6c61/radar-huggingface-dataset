# lukaskremla/Ornith-1.5-35B-A3B-6bit-MLX-TextOnly

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de gran tamaño desarrollado por el laboratorio ornith-ai, especializado en tareas agénticas y auto-mejora. Forma parte de la familia Ornith, que se distingue por su bucle de auto-mejora: el propio modelo propone nuevas tareas, genera andamiajes (scaffolds) específicos y produce rollouts para entrenamiento por refuerzo. Esta versión concreta, `lukaskremla/Ornith-1.5-35B-A3B-6bit-MLX-TextOnly`, es una cuantización en 6 bits realizada con MLX que elimina la torre de visión del modelo original, conservando únicamente las capacidades de texto a texto.

El modelo base es una mezcla de expertos (MoE) de aproximadamente 35 mil millones de parámetros totales, de los cuales se activan unos 3 mil millones por token, lo que lo hace eficiente en inferencia. Soporta una ventana de contexto de 256K tokens y está diseñado para razonamiento, uso de herramientas y conversación multilingüe. La versión cuantizada en MLX reduce el tamaño de los pesos a 28,2 GB, facilitando su ejecución en hardware Apple Silicon con memoria unificada.

Esta ficha se centra en la variante solo texto, que es la que se describe en el repositorio de HuggingFace. Para una versión con capacidades de visión, el autor ofrece un modelo hermano con la torre de visión intacta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5 (qwen3_5_moe) |
| Parametros totales | ~35 mil millones (35B) |
| Parametros activos | ~3 mil millones (3B) por token |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | 6-bit, weight-only, affine, RTN, group-size-64 |
| Idiomas soportados | Multilingue (lista especifica no disponible) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

Nota: el contador de parámetros que muestra HuggingFace (7.584.230.528) es incorrecto, como advierte el propio autor en la model card; es un error común de visualización para cuantizaciones MLX. El tamaño real del repositorio es de 28,2 GB, coherente con una cuantización 6-bit de un modelo de 35B.

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B emplea una arquitectura de mezcla de expertos (MoE) derivada de Qwen3.5, con aproximadamente 35B de parámetros totales y 3B activos por token. Esta configuración permite un equilibrio entre capacidad y eficiencia computacional, ya que solo una fracción de los expertos se activa en cada paso de inferencia. El modelo está diseñado para tareas agénticas, lo que implica soporte nativo para razonamiento multi-paso, uso de herramientas y generación de andamiajes.

El proceso de entrenamiento, según la documentación del proyecto Ornith, incorpora un bucle de auto-mejora: el modelo genera nuevas tareas, diseña estrategias para resolverlas y produce rollouts que se utilizan para refinar la política mediante aprendizaje por refuerzo. Este enfoque difiere de los pipelines tradicionales de RLHF/DPO, ya que el propio modelo actúa como generador de datos de entrenamiento. No se han publicado detalles específicos sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

La versión cuantizada en MLX fue convertida con mlx-lm 0.31.3, aplicando cuantización weight-only de 6 bits con esquema affine y RTN, y un tamaño de grupo de 64. Se eliminó la torre de visión, por lo que el modelo resultante es exclusivamente de texto.

## Capacidades

- Generación de texto y conversación multilingüe.
- Razonamiento multi-paso y pensamiento estructurado.
- Uso de herramientas (tool calling / function calling).
- Soporte para agentes autónomos y tareas agénticas.
- Manejo de contexto largo (hasta 256K tokens).
- Auto-mejora: capacidad de proponer nuevas tareas y generar andamiajes para entrenamiento por refuerzo.
- No incluye capacidades de visión (la torre de visión fue eliminada en esta variante).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (256K tokens), lo que permite mantener el historial completo de una interacción prolongada sin truncamientos. Su soporte multilingüe facilita atender a usuarios en varios idiomas.
- Agentes de razonamiento para análisis de documentos: gracias a su ventana de contexto amplia, puede procesar informes extensos, contratos o artículos científicos y extraer conclusiones o resumir información relevante.
- Generación de código asistida: aunque no se han publicado benchmarks específicos, su arquitectura basada en Qwen3.5 y su capacidad de tool calling lo hacen adecuado para integrarse en entornos de desarrollo como autocompletado o generación de funciones.
- Automatización de flujos de trabajo con herramientas: el modelo puede invocar APIs y funciones externas, lo que permite construir pipelines que combinen llamadas a bases de datos, servicios web o ejecución de scripts.
- Investigación en auto-mejora de modelos: al ser capaz de proponer nuevas tareas y generar andamiajes, es útil para experimentos de aprendizaje por refuerzo y generación de datos sintéticos.
- Chatbots especializados en dominios técnicos: su capacidad de razonamiento y su licencia MIT permiten desplegarlo en aplicaciones comerciales de soporte técnico o consultoría, con la posibilidad de ajustarlo finamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para esta versión cuantizada ni para el modelo base en las fuentes consultadas.

## Requisitos de hardware

- El modelo cuantizado en 6-bit ocupa 28,2 GB en disco. Para inferencia, se recomienda al menos 32 GB de memoria unificada en Apple Silicon (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max) para contexto moderado.
- Para aprovechar la ventana completa de 256K tokens, se necesitaría más memoria; el modelo base en bf16 requiere alrededor de 70 GB y se recomiendan 2×80 GB de GPU para contexto largo, según la documentación de ornith-ai.
- En hardware Apple Silicon, MLX es el framework nativo; se puede ejecutar con mlx-lm o a través de servidores compatibles con OpenAI (por ejemplo, mlx-lm.server).
- No se recomienda su uso en GPUs NVIDIA con MLX, ya que MLX está diseñado para Apple Silicon. Para GPUs NVIDIA, habría que recurrir a otras cuantizaciones (GGUF, AWQ) que no están disponibles en este repositorio.
- La latencia y el throughput no están documentados; dependerán del hardware y de la longitud del contexto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Sin embargo, por su arquitectura y tamaño, es comparable a otros modelos MoE de ~30B con ~3B activos, como Qwen3-30B-A3B. Ambos comparten la base Qwen3.5, pero Ornith-1.5 se distingue por su enfoque en auto-mejora y tareas agénticas. No hay información suficiente para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Al ser una cuantización 6-bit, puede haber una ligera pérdida de precisión respecto al modelo en bf16, especialmente en tareas de razonamiento complejo.
- La variante TextOnly no incluye capacidades de visión; si se necesita procesamiento de imágenes, hay que usar la versión con torre de visión.
- No se han publicado evaluaciones de sesgos o alucinaciones; como todo LLM, puede generar información falsa o inventada.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar que los pesos cuantizados no incorporen datos con derechos adicionales (no se ha indicado nada al respecto).
- El modelo está optimizado para MLX; su uso en otras plataformas requeriría conversión a otros formatos, lo que no está incluido en este repositorio.
- La fecha de creación (2026-09-01) es posterior a la fecha actual, lo que sugiere que el modelo es muy reciente o que la fecha es incorrecta; se recomienda verificar la disponibilidad y el soporte.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/lukaskremla/Ornith-1.5-35B-A3B-6bit-MLX-TextOnly
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Cuantización MLX 6-bit oficial de ornith-ai: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-6bit
- Repositorio GitHub del proyecto Ornith: https://github.com/ornith-ai/Ornith-1
- Página en Ollama: https://ollama.com/library/ornith-1.5:35b
- Colección de cuantizaciones MLX (incluye MTP heads): https://huggingface.co/collections/lukaskremla/ornith-15-35b-a3b-mlx-quants-vision-text-only-and-mtp
