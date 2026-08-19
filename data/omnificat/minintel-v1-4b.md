# omnificat/minintel-v1-4b

## Resumen

MININTEL v1 4B es un modelo de lenguaje de 4.326 millones de parámetros desarrollado por el usuario omnificat, basado en el modelo Qwen/Qwen3.5-4B-Base. Se trata de un fine-tuning especializado en razonamiento eficiente y llamadas a herramientas (tool calling), distribuido en formato GGUF cuantizado a Q4_K_M para poder ejecutarse en GPUs de portátil con 8 GB de VRAM. Su arquitectura híbrida Gated DeltaNet, heredada de Qwen3.5, combina atención lineal con mecanismos de compuerta, lo que permite manejar contextos largos de hasta 262.000 tokens de forma nativa, aunque en la práctica se recomienda un contexto operativo de 32.000 tokens por limitaciones de memoria KV.

El modelo ha sido entrenado con QLoRA sobre una única GPU Tesla P100 de 16 GB, utilizando una mezcla de 33 millones de tokens que incluye destilación de Qwen3.8-Max para matemáticas, código y razonamiento, datasets de tool-use como xLAM, ToolACE y APIGen-MT, y datos de instrucción general de Tulu-3. Está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones. Su relevancia radica en ofrecer capacidades de agente y tool calling en un tamaño compacto, apto para despliegue en hardware de consumo, con un rendimiento verificado en pruebas de humo para llamadas a herramientas, JSON estructurado y razonamiento matemático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet (basada en Qwen3.5-4B-Base) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens nativo; 32.000 tokens práctico (limitado por memoria KV) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | No disponible (no especificado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `minintel-v1-4b-Q4_K_M.gguf`, 2,79 GB) y safetensors (repo) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, que emplea una arquitectura híbrida Gated DeltaNet, una variante de los transformadores que combina mecanismos de atención lineal con compuertas recurrentes, permitiendo un procesamiento eficiente de secuencias largas. Sobre esta base se aplicó un fine-tuning con QLoRA (cuantización NF4 de los pesos base) y un adaptador LoRA de rango 64 y alpha 128 en todas las capas lineales, posteriormente fusionado. El entrenamiento se realizó en precisión fp32 sobre una única GPU NVIDIA Tesla P100-PCIE 16 GB (nivel gratuito de Kaggle), con un conjunto de datos de 33 millones de tokens que combina trazas de destilación de Qwen3.8-Max (matemáticas, código y razonamiento), datasets especializados en tool-use (xLAM, ToolACE, APIGen-MT) y datos de instrucción general de Tulu-3. Tras el entrenamiento, el modelo se cuantizó a Q4_K_M con llama.cpp, manteniendo los cabezales MTP (`nextn`) en Q8_0 como seguro, aunque la tasa de aceptación de decodificación especulativa cayó a 0,29, por lo que no se recomienda su uso activo.

## Capacidades

- Generación de texto y razonamiento matemático conciso con salida estructurada en LaTeX.
- Llamadas a herramientas (tool calling) de una sola vuelta con esquemas correctos y argumentos válidos (verificado con `get_weather({"city":"Tokyo","unit":"celsius"})`).
- Llamadas paralelas a múltiples herramientas en un mismo turno.
- Selección de esquema adecuado cuando se presentan varios esquemas de herramientas.
- Grounding multi-turno: uso correcto de resultados de herramientas inyectados en la conversación.
- Generación de JSON estricto bajo demanda.
- Abstinencia: responde directamente cuando ninguna herramienta es adecuada, en lugar de forzar una llamada.
- Soporte de agentes y razonamiento multi-paso entrenado, aunque no evaluado exhaustivamente.

## Casos de uso

- Asistentes de atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 32K tokens prácticos), consultando bases de conocimiento o APIs externas mediante tool calling para resolver incidencias sin intervención humana.
- Generación de código en producción: gracias a su entrenamiento en destilación de Qwen3.8-Max para código, puede generar fragmentos de código y explicaciones, integrándose en pipelines de CI/CD para autocompletado o revisión de código.
- Extracción de datos estructurados: su capacidad de generar JSON estricto lo hace adecuado para convertir texto libre en formularios o registros estructurados, por ejemplo en procesamiento de facturas o formularios web.
- Agentes de automatización de tareas: puede actuar como agente que decide qué herramienta invocar según la petición del usuario, ideal para sistemas de reservas, búsqueda de información o control de dispositivos.
- Educación y tutoría matemática: genera respuestas con razonamiento paso a paso y formato LaTeX, útil para plataformas de aprendizaje automático o asistentes de estudio.
- Chatbots con conocimiento específico de dominio: al ser fine-tuneado con datos de instrucción general, puede adaptarse a dominios concretos mediante fine-tuning adicional, manteniendo un tamaño reducido para despliegue en edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una batería de pruebas de humo (smoke tests) con 7 de 8 casos superados, centrados en tool calling, JSON y razonamiento matemático. El caso fallido corresponde a `tool_choice=required` con una petición ambigua, donde el modelo solicita el argumento faltante en lugar de ejecutar una llamada ciega. No se proporcionan métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: ~2,6 GB para inferencia con Q4_K_M, dejando margen para una caché KV grande en GPUs de 8 GB.
- GPU recomendadas: RTX 4060 Laptop 8 GB (probada), y cualquier GPU con al menos 4 GB de VRAM para contextos cortos.
- Compatible con GPUs de consumo (serie RTX 30/40, AMD RX 6000/7000 con soporte Vulkan).
- Opciones de despliegue: llama.cpp (llama-server), compatible con servidores OpenAI-compatible; también puede ejecutarse con vLLM o TGI si se dispone de los pesos en safetensors, aunque el formato GGUF es el principal.
- Rendimiento medido en RTX 4060 Laptop: decodificación ~64-67 tok/s, prefill ~2500 tok/s.
- Requiere una compilación de llama.cpp con soporte de arquitectura `qwen35` (híbrida Gated DeltaNet); las versiones recientes de master la incluyen.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. El modelo comparte base con Qwen3.5-4B-Base, por lo que es comparable en tamaño y arquitectura a otros modelos de 4B como Qwen3-4B, Llama-3.2-3B o Phi-3.5-mini. Sin embargo, no se han publicado benchmarks que permitan una comparación cuantitativa. Se puede afirmar que MININTEL v1 4B está específicamente optimizado para tool calling, un área donde los modelos genéricos de 4B suelen tener un rendimiento inferior, pero carece de la versatilidad de modelos frontera en tareas abiertas.

## Limitaciones y advertencias

- Escala de 4B: no es competitivo con modelos frontera en generación abierta o tareas agénticas profundas.
- Decodificación especulativa (MTP): la tasa de aceptación del draft cayó a 0,29 tras el fine-tuning, por lo que no supone una aceleración; los cabezales se mantienen en Q8_0 como seguro, no como mejora activa.
- Llamadas a herramientas verificadas solo en una sola vuelta; el razonamiento multi-paso y las ejecuciones agénticas largas no han sido evaluadas exhaustivamente.
- Calidad de generación de código y contexto largo no benchmarkeada más allá de pruebas de humo.
- Posibles sesgos heredados del modelo base Qwen3.5 y de los datasets de destilación; no se han realizado auditorías de sesgo.
- Riesgo de alucinación en tareas abiertas, común en modelos de este tamaño.
- No se especifican idiomas soportados; aunque Qwen3.5 es multilingüe, la model card no confirma el alcance tras el fine-tuning.
- Licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda verificar los términos de los datasets de entrenamiento (p. ej., Tulu-3) para cumplimiento de atribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omnificat/minintel-v1-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
