# salohcin714/granite-4.2-3b-6bit-awq-mlx

## Resumen

El repositorio `salohcin714/granite-4.2-3b-6bit-awq-mlx` contiene una conversión cuantizada del modelo Granite 4.2 3B de IBM, adaptada al formato MLX para ejecución nativa en Apple Silicon. El modelo original, desarrollado por el equipo Granite de IBM, es un modelo de lenguaje denso tipo decoder-only de 3 mil millones de parámetros, post-entrenado sobre la base de Granite 4.1, con capacidades de razonamiento mediante cadena de pensamiento, modos de pensamiento flexibles y tool calling aumentado con razonamiento.

Esta conversión, realizada por el usuario salohcin714 mediante `mlx-lm` 0.31.3, aplica cuantización afín de 6 bits con grupo de tamaño 64 y calibración activada por activación (AWQ) sobre los pesos originales. No se ha realizado ningún fine-tuning adicional ni se han añadido datos de entrenamiento. El resultado es un artefacto de 2.9 GB que conserva las capacidades del modelo base, aunque con una ligera pérdida de precisión inherente a la cuantización, y que puede ejecutarse de forma eficiente en equipos Mac con chip de la serie M.

La relevancia de este modelo radica en su disponibilidad para desarrolladores que trabajan con MLX, el framework de aprendizaje automático de Apple, permitiendo desplegar un modelo de razonamiento de IBM en hardware local sin necesidad de GPUs dedicadas. Su licencia Apache 2.0 facilita su uso comercial y su integración en aplicaciones de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense decoder-only (post-entrenado sobre Granite 4.1) |
| Parametros totales | 784.673.280 (según safetensors cuantizado; modelo base de 3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 6-bit affine quantization, group size 64, calibración AWQ |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Granite 4.2 3B pertenece a la familia Granite 4.2 de IBM, que emplea una arquitectura transformer densa de solo decodificador. Según el repositorio oficial de IBM, los modelos Granite 4.2 se post-entrenan sobre los modelos base de Granite 4.1, incorporando técnicas de razonamiento como cadena de pensamiento integrada, modos de pensamiento configurables y tool calling mejorado con razonamiento. No se dispone de detalles específicos sobre el número de tokens de entrenamiento ni la composición del dataset en la información proporcionada.

La conversión aquí documentada no modifica la arquitectura subyacente: se limita a transformar los pesos al formato MLX safetensors y a aplicar cuantización afín de 6 bits con grupo de tamaño 64, utilizando calibración activada por activación (AWQ). Se eliminó el tensor `lm_head.weight` redundante en los casos donde el modelo ata las incrustaciones de entrada y salida. No se realizó ningún ajuste fino ni se añadieron datos adicionales.

## Capacidades

- Generación de texto y conversación multi-turno, gracias a su naturaleza de modelo de lenguaje denso.
- Razonamiento mediante cadena de pensamiento (chain-of-thought) integrado, tal como se describe en la documentación oficial de IBM para la familia Granite 4.2.
- Modos de pensamiento flexibles: permite configurar el nivel de razonamiento (por ejemplo, pensamiento rápido o profundo) según la tarea.
- Tool calling aumentado con razonamiento: capacidad de invocar funciones externas de forma más precisa al integrar razonamiento previo a la llamada.
- Soporte multilingüe para 11 idiomas: alemán, árabe, checo, chino, español, francés, inglés, italiano, japonés, coreano, neerlandés y portugués.
- Ejecución nativa en Apple Silicon gracias al formato MLX, con uso eficiente de la memoria unificada.

## Casos de uso

- Asistente conversacional local en macOS: al ser una conversión MLX, puede integrarse en aplicaciones de escritorio para Mac (Swift, Python) y ofrecer respuestas en tiempo real sin conexión a internet, aprovechando la memoria unificada del chip M1/M2/M3.
- Generación de código en entornos de desarrollo: aunque no se especifican benchmarks de código, el modelo base Granite 4.2 está diseñado para razonamiento y puede asistir en tareas de programación, autocompletado y explicación de fragmentos de código, ejecutándose localmente en la máquina del desarrollador.
- Automatización de atención al cliente: su soporte multilingüe y su capacidad de conversación multi-turno lo hacen adecuado para chatbots de soporte en varios idiomas, desplegados en servidores con Apple Silicon o en estaciones de trabajo Mac.
- Análisis de documentos y resumen: con una ventana de contexto no especificada pero típica en modelos de 3B, puede resumir textos extensos, extraer información clave y responder preguntas sobre documentos en los idiomas soportados.
- Agentes autónomos con tool calling: la capacidad de razonamiento aumentado para llamadas a herramientas permite construir agentes que consulten APIs, bases de datos o servicios externos de forma fiable, ejecutándose en hardware Apple.
- Prototipado rápido de aplicaciones de IA: gracias a su licencia Apache 2.0 y su formato MLX, es ideal para desarrolladores que necesitan probar modelos de razonamiento en sus Macs antes de escalar a GPUs de mayor capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los benchmarks oficiales de IBM corresponden al modelo original sin cuantizar y no pueden atribuirse a este artefacto cuantizado. El autor de la conversión advierte explícitamente en su model card que los datos de IBM describen los pesos originales, no esta versión cuantizada.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 2.9 GB, por lo que se recomienda al menos 4 GB de memoria unificada disponible. En la práctica, un Mac con 8 GB de RAM unificada puede ejecutar el modelo con margen para el sistema operativo y la aplicación.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M1 Pro, M1 Max, M2, M2 Pro, M2 Max, M3, etc.). No se requiere GPU dedicada; la memoria unificada del SoC es suficiente.
- Compatibilidad con consumer GPU: no aplica, ya que MLX está diseñado exclusivamente para Apple Silicon.
- Opciones de despliegue: mediante la librería `mlx-lm` (carga y generación con `load` y `generate`), también se puede integrar en proyectos que usen el ecosistema MLX. No se menciona compatibilidad con vLLM, llama.cpp u Ollama en la información proporcionada.
- Latencia y throughput: no se han proporcionado datos específicos. En general, un modelo de 3B cuantizado a 6 bits en un chip M1 o superior puede generar decenas de tokens por segundo, pero estos valores dependen del hardware y de la configuración.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con modelos similares. El modelo base Granite 4.2 3B pertenece a una familia que incluye variantes de 8B y 30B, pero no se han proporcionado especificaciones detalladas de estas variantes en la información disponible. Como referencia, esta conversión se diferencia de otras versiones cuantizadas del mismo modelo (por ejemplo, `granite-4.2-3b-6bit-mlx` sin AWQ) únicamente en el método de cuantización, pero no se dispone de datos comparativos de rendimiento.

## Limitaciones y advertencias

- La cuantización de 6 bits puede introducir una degradación en la precisión del modelo en comparación con los pesos originales de 16 o 32 bits, especialmente en tareas de razonamiento complejo o matemáticas.
- Este repositorio es una conversión no oficial realizada por un tercero; no está afiliado ni respaldado por IBM. Los resultados publicados por IBM se refieren al modelo original y no a esta versión cuantizada.
- El modelo base puede presentar sesgos inherentes a sus datos de entrenamiento, que no han sido mitigados en esta conversión.
- Al no haberse realizado fine-tuning adicional, el modelo puede mostrar alucinaciones en contextos donde no tiene información suficiente.
- La ventana de contexto no está especificada; se recomienda verificar el comportamiento con secuencias largas antes de usarlo en producción.
- Aunque la licencia Apache 2.0 permite uso comercial, es responsabilidad del usuario revisar los términos completos de la licencia y las condiciones de uso del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/salohcin714/granite-4.2-3b-6bit-awq-mlx
- Modelo base (IBM): https://huggingface.co/ibm-granite/granite-4.2-3b
- Repositorio GitHub de IBM Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Documentación oficial de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Página general de IBM Granite: https://www.ibm.com/granite
- Librería MLX: https://github.com/ml-explore/mlx-lm
