# parthasaradhi789/text2sql-qwen2.5-coder-1.5b-GGUF

## Resumen

text2sql-qwen2.5-coder-1.5b-GGUF es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-1.5B-Instruct de Alibaba, especializado en la tarea de conversión de lenguaje natural a SQL (text-to-SQL). Lo desarrolla el usuario parthasaradhi789 y se distribuye exclusivamente en formato GGUF, lo que lo hace directamente utilizable con llama.cpp y Ollama. El modelo base cuenta con 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), lo que lo sitúa en la gama de modelos pequenos optimizados para ejecución en hardware modesto.

La relevancia de esta ficha radica en su caracter practico: se trata de un modelo compacto orientado a una tarea concreta y muy demandada en entornos de analitica de datos, asistentes de bases de datos y herramientas de BI. Al estar cuantizado en GGUF (con variantes Q8_0, F16 y Q4_K_M), puede desplegarse en CPU o en GPUs de consumo, lo que reduce la barrera de entrada frente a modelos de mayor tamano.

No obstante, la informacion publicada por el autor es muy limitada: no se detalla el dataset de entrenamiento, no hay resultados de benchmarks, no se especifica la licencia ni los idiomas soportados. Esta ficha documenta lo que se puede verificar y marca explicitamente como "no disponible" todo aquello que la model card no cubre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder soporta hasta 32.768 tokens, pero el ajuste fino no lo confirma) |
| Tipos de cuantizacion | Q8_0, F16, Q4_K_M (archivos GGUF publicados) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors en este repo |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen2.5-Coder-1.5B-Instruct, que emplea una arquitectura transformer decoder-only con atención causal estándar. El autor indica que el fine-tuning y la conversión a GGUF se realizaron con Unsloth, una librería que optimiza el entrenamiento y la cuantización de modelos. No se especifica el número de tokens de entrenamiento, la composición del dataset text-to-SQL utilizado, ni si se aplicaron técnicas de RLHF o DPO adicionales sobre el modelo base.

La innovación técnica destacable es fundamentalmente el pipeline de Unsloth para producir GGUF de forma eficiente y la inclusión de un Modelfile de Ollama para despliegue inmediato. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones específicas del ajuste.

## Capacidades

- Generación de consultas SQL a partir de descripciones en lenguaje natural (tarea principal del ajuste fino).
- Generación de texto general y razonamiento, heredados del modelo base Qwen2.5-Coder.
- Generación y comprensión de código (el modelo base está especializado en código).
- Conversación multi-turno (tag "conversational").
- Compatibilidad con llama.cpp y Ollama mediante los archivos GGUF y el Modelfile incluidos.
- Soporte de plantilla Jinja (`--jinja` en llama-cli).
- No se confirma soporte de tool calling, function calling, agentes ni visión en la información disponible.
- Capacidades multilingües: no disponibles (el modelo base Qwen2.5 soporta múltiples idiomas, pero el ajuste fino no lo declara).

## Casos de uso

- Asistente de consultas SQL para analistas: el modelo traduce preguntas en lenguaje natural ("dame las ventas por región del último trimestre") a consultas SQL ejecutables, reduciendo la dependencia de conocimiento técnico de bases de datos.
- Generación de SQL en herramientas de BI embebidas: al ser un modelo de 1,5B en GGUF, puede integrarse en aplicaciones de escritorio o web con backend local sin depender de APIs externas.
- Automatización de informes: convertir peticiones de negocio en consultas sobre data warehouses para generar reportes periódicos.
- Prototipado rápido de interfaces text-to-SQL: gracias a su tamano reducido y a la cuantización Q4_K_M, permite iterar en local en portátiles o CPUs.
- Educacion y formacion en SQL: el modelo puede explicar y generar consultas como apoyo didáctico para estudiantes.
- Despliegue en entornos con recursos limitados: al caber en GPUs de consumo o incluso en CPU, es adecuado para edge computing o entornos air-gapped donde no se permite enviar datos a la nube.
- Chat conversacional especializado en bases de datos: el tag "conversational" sugiere uso en asistentes multi-turno para refinar consultas SQL de forma iterativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en Q4_K_M, unos 1,7 GB en Q8_0 y unos 3,1 GB en F16 (estimación según el número de parámetros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para las variantes cuantizadas; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas, aunque el modelo es pequeño y no requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en practicamente cualquier GPU moderna de consumo, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (Modelfile incluido), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| text2sql-qwen2.5-coder-1.5b-GGUF | 1,54B | No disponible | GGUF | No disponible | Ajuste fino text-to-SQL sobre Qwen2.5-Coder-1.5B |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,54B | 32.768 tokens (según documentación del base) | Safetensors, GGUF | Apache 2.0 (según el base) | Modelo generalista de código, no especializado en SQL |
| Modelos text-to-SQL de mayor tamano (p. ej. variantes de 7B) | ~7B | Variable | Safetensors, GGUF | Variable | Mayor calidad potencial pero mayores requisitos de hardware |

La comparativa se limita a lo verificable; no hay datos de rendimiento del ajuste fino que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos del modelo ni sobre el dataset de entrenamiento, por lo que no se pueden evaluar sesgos conocidos.
- Riesgo de alucinación: como todo modelo generativo, puede producir SQL sintácticamente válido pero semánticamente incorrecto; se recomienda validación y ejecución supervisada.
- Limitaciones de contexto e idioma: no declaradas por el autor; el contexto efectivo del ajuste fino no está confirmado.
- Licencia no disponible: no se puede garantizar el uso comercial sin consultar al autor o al modelo base (Qwen2.5-Coder se distribuye bajo Apache 2.0, pero el ajuste fino no lo declara).
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de calidad.
- No se publican safetensors ni el dataset de entrenamiento, lo que dificulta la reproducibilidad y la auditoría.
- Para producción, conviene evaluar el modelo en el esquema de base de datos concreto antes de desplegarlo, dado que no hay benchmarks publicados.

## Enlaces

- Hugging Face: https://huggingface.co/parthasaradhi789/text2sql-qwen2.5-coder-1.5b-GGUF
- Unsloth (herramienta de fine-tuning y conversión): https://github.com/unslothai/unsloth
- Modelo base Qwen2.5-Coder-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
