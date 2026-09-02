# furiosa-ai/Qwen3-30B-A3B-Thinking-2507-FP8

## Resumen

Qwen3-30B-A3B-Thinking-2507-FP8 es una versión cuantizada en FP8 del modelo de razonamiento Qwen3-30B-A3B-Thinking-2507, publicada por FuriosaAI en su organización de Hugging Face. Se trata de un transformer autoregresivo de arquitectura Mixture-of-Experts (MoE) con 30.532 millones de parámetros totales, de los cuales aproximadamente 3.300 millones se activan por token. El modelo opera exclusivamente en modo *thinking*: genera una cadena de pensamiento interna antes de ofrecer la respuesta final, lo que le proporciona capacidades sólidas de razonamiento, seguimiento de instrucciones, cobertura multilingüe y uso de herramientas.

La relevancia de esta publicación radica en que FuriosaAI no solo distribuye los pesos cuantizados, sino que incluye un Furiosa Executable Bundle (FXB) precompilado para ejecutar el modelo en su hardware RNGD mediante el framework Furiosa-LLM. Esto permite desplegar el modelo con una API compatible con OpenAI y con soporte para *tool calling* y razonamiento separado en campos dedicados. El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-MoE (Mixture-of-Experts) transformer autoregresivo |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | ~3,3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 estatico para pesos, FP8 dinamico para activaciones, KV cache en 16-bit |
| Idiomas soportados | no disponible (la documentacion indica cobertura multilingue sin especificar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, FXB (Furiosa Executable Bundle) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-MoE, un transformer autoregresivo con capas de mezcla de expertos. De los 30,5B parámetros totales, solo unos 3,3B se activan por token, lo que reduce el coste computacional por inferencia en comparación con un modelo denso del mismo tamaño. Es una variante de razonamiento (*thinking*) de la serie Qwen3, actualizada a la versión 2507, que siempre genera una cadena de pensamiento antes de la respuesta final.

La versión publicada por FuriosaAI aplica cuantización FP8 estática a los pesos, siguiendo la release FP8 del modelo base, mientras que las activaciones se cuantizan dinámicamente en FP8 por token y por bloque. La caché KV se mantiene en precisión de 16 bits. No se proporcionan datos sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO) en la información disponible; estos detalles corresponden al modelo base de Qwen.

## Capacidades

- Generación de texto y razonamiento complejo: produce una cadena de pensamiento interna antes de cada respuesta, lo que mejora la precisión en tareas de lógica, matemáticas y análisis.
- Seguimiento de instrucciones: diseñado para responder a peticiones en lenguaje natural con formato y contenido adecuados.
- Tool calling (function calling): soporta invocación de herramientas mediante el parser `hermes`, el estándar de la serie Qwen3.
- Razonamiento multilingüe: la documentación indica cobertura multilingüe, aunque no se especifican los idiomas concretos.
- Modo *thinking* exclusivo: no es posible desactivar el razonamiento; el modelo siempre piensa antes de responder.
- Integración con Furiosa-LLM: el FXB incluido permite servir el modelo con una API compatible con OpenAI, devolviendo el razonamiento en un campo separado (`reasoning`).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con razonamiento previo, lo que permite respuestas más coherentes y contextualizadas en tareas de soporte técnico o resolución de incidencias.
- Generación de código con razonamiento: al pensar antes de escribir, es adecuado para tareas de programación complejas, como refactorización, depuración o implementación de algoritmos, donde el razonamiento explícito reduce errores.
- Agentes autónomos con tool calling: gracias al soporte de *function calling*, puede integrarse en pipelines de agentes que consultan APIs, bases de datos o servicios externos para completar tareas multi-paso.
- Análisis de datos y generación de informes: su capacidad de razonamiento permite interpretar datos, extraer conclusiones y redactar informes estructurados en varios idiomas.
- Asistencia en investigación y educación: puede explicar conceptos complejos, resolver problemas matemáticos o redactar resúmenes académicos con cadenas de razonamiento transparentes.
- Automatización de procesos empresariales: combinado con herramientas externas, puede clasificar documentos, extraer información y tomar decisiones basadas en reglas definidas por el usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de FuriosaAI no incluye métricas como MMLU, HumanEval o GSM8K, y los resultados de búsqueda web tampoco aportan datos comparativos. Se recomienda consultar la model card del modelo base Qwen/Qwen3-30B-A3B-Thinking-2507-FP8 para posibles referencias de rendimiento.

## Requisitos de hardware

- El despliegue oficial con Furiosa-LLM requiere hardware FuriosaAI RNGD, con una estrategia de paralelismo tensorial de 32 PEs distribuidos en cuatro tarjetas RNGD (8 PEs por tarjeta).
- No se especifica la VRAM necesaria para inferencia en GPUs convencionales. El tamaño del repositorio es de 47,6 GB, que incluye tanto los pesos safetensors como el FXB.
- El modelo base también puede ejecutarse en otros frameworks como vLLM, SGLang o Transformers, según indica la documentación, pero no se proporcionan requisitos de memoria para esos entornos.
- Para GPUs de consumo, un modelo de 30,5B parámetros en FP8 requeriría al menos 32 GB de VRAM para cargar los pesos, aunque no hay datos oficiales de FuriosaAI al respecto.
- Opciones de despliegue: Furiosa-LLM (servidor con API OpenAI-compatible), vLLM, SGLang, Transformers (para el modelo base sin FXB).

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa detallada con alternativas de la misma categoría. El modelo comparte arquitectura y tamaño con Qwen3-30B-A3B (versión sin *thinking*), pero no se han publicado métricas comparativas en la información proporcionada. Tampoco se dispone de especificaciones de otros modelos MoE de tamaño similar, como DeepSeek-V3 o Mixtral, en las fuentes consultadas. Se recomienda consultar la documentación oficial de Qwen para obtener datos de rendimiento relativos.

## Limitaciones y advertencias

- El modelo opera únicamente en modo *thinking*: siempre genera una cadena de pensamiento, lo que puede aumentar la latencia y el consumo de tokens en comparación con modelos que permiten desactivar el razonamiento.
- No se han documentado sesgos específicos, pero al ser un modelo de lenguaje entrenado con datos web, puede reflejar sesgos presentes en esos datos.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas de hechos o datos no verificados.
- La longitud de contexto no está especificada en la información disponible; se debe consultar la documentación del modelo base para conocer el límite real.
- El FXB incluido solo es ejecutable en hardware FuriosaAI RNGD; para otras plataformas es necesario utilizar los pesos safetensors con frameworks compatibles.
- La cobertura multilingüe no está detallada; no se garantiza un rendimiento uniforme en todos los idiomas.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribución y las posibles patentes asociadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/furiosa-ai/Qwen3-30B-A3B-Thinking-2507-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507-FP8
- Documentación Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de tool calling: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
- Referencia del servidor Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/furiosa-llm-serve.html
- Documentación de modelos Qwen3-MoE: https://developer.furiosa.ai/latest/en/furiosa_llm/models/qwen3-moe.html
