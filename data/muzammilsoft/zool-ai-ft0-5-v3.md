# muzammilsoft/zool-ai-ft0.5-v3

## Resumen

Zool-AI-ft0.5-v3 es un modelo de lenguaje de 0,5 mil millones de parámetros desarrollado por muzammilsoft, un ajuste fino de Qwen2.5-0.5B-Instruct orientado específicamente al dialecto sudanés del árabe. El modelo se distribuye en formato TFLite con cuantización dynamic_int8, lo que lo sitúa en la categoría de modelos para edge AI: su objetivo es ejecutarse en teléfonos móviles y dispositivos con recursos limitados, no en servidores con GPU. El repositorio ocupa 0,5 GB y el archivo de pesos principal pesa 511,1 MB.

El problema que aborda es la escasez de modelos que comprendan y generen dialecto sudanés, una variedad del árabe con poca representación en los corpus de entrenamiento convencionales. El autor entrenó con QLoRA (r=64, alpha=128, 3 épocas) sobre 4082 ejemplos de entrenamiento y 149 de evaluación, compuestos por datos de hechos sudaneses elaborados manualmente: moneda, independencia, ciudades, gastronomía, historia, cultura, refranes, vocabulario y traducciones entre árabe estándar y sudanés, con un anclaje de 2500 ejemplos de la versión v2.

Es relevante ahora por su enfoque en despliegue móvil mediante LiteRT y por documentar de forma transparente —aunque con una muestra muy reducida— sus resultados internos de evaluación: 4/20 aciertos en un protocolo de 20 preguntas, frente a 0/20 de las versiones v1 y v2. La licencia Apache 2.0 permite uso comercial, pero el rendimiento medido es bajo y la base de 0,5B limita severamente el razonamiento complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B-Instruct como base) |
| Parametros totales | 0,5 mil millones (500M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el artefacto exporta una firma `prefill_512`, lo que sugiere ventana de 512 tokens en el grafo TFLite) |
| Tipos de cuantizacion | dynamic_int8 (TFLite) |
| Idiomas soportados | ar (árabe), con foco en dialecto sudanés |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`zool-ai-ft0.5-v3_q8_ekv1024.tflite`) + `tokenizer.json` |

Datos adicionales del artefacto: tamaño del archivo 511.069.680 bytes, tamaño de vocabulario 151.936, formato de conversación ChatML, firmas exportadas `decode` y `prefill_512`.

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención causal estándar, y se ajusta mediante QLoRA con rango r=64, alpha=128 y 3 épocas. El conjunto de entrenamiento consta de 4082 ejemplos elaborados manualmente sobre hechos sudaneses (moneda, independencia, ciudades, comida y bebida, historia, cultura, refranes, vocabulario y pares de traducción árabe estándar↔sudanés), complementados con 2500 ejemplos de anclaje procedentes de la versión v2 para mitigar el olvido catastrófico. El conjunto de evaluación contiene 149 ejemplos.

La innovación técnica principal no está en el entrenamiento sino en la exportación: la fusión y conversión se realizan con `litert-torch` (ejemplo de Qwen) en precisión dynamic_int8, generando un artefacto TFLite con dos firmas (`decode` y `prefill_512`) pensado para el motor `LiteRtDirectEngine` de la aplicación Zool-AI. El prompt se construye en formato ChatML con un mensaje de sistema que instruye al modelo a hablar en árabe coloquial sudanés. No se documenta uso de RLHF ni DPO, ni el número total de tokens de entrenamiento más allá del recuento de ejemplos.

## Capacidades

- Generación de texto conversacional en dialecto sudanés, con prompt de sistema en ChatML.
- Comprensión de dialecto sudanés: 3/4 en la categoría de comprensión del protocolo interno de 20 preguntas.
- Traducción árabe estándar↔sudanés: contemplada en los datos de entrenamiento, aunque con 0/4 en la evaluación interna.
- Conocimiento factual sobre Sudán: moneda, independencia, ciudades, gastronomía, historia y cultura (1/4 en la categoría de cultura del protocolo interno).
- Refranes y vocabulario sudanés: presentes en el corpus, con 0/4 en la evaluación interna de refranes.
- Ejecución en dispositivo (edge AI) mediante TFLite y LiteRT, sin necesidad de servidor.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- Capacidad multilingüe limitada al árabe (etiqueta `ar`); no se declara soporte de otros idiomas.

## Casos de uso

- Asistente conversacional móvil en dialecto sudanés: integrado en la app Zool-AI mediante `LiteRtDirectEngine`, el modelo mantiene diálogos cotidianos en sudanés con un artefacto de 511 MB que cabe en el almacenamiento de un teléfono de gama media y se ejecuta sin conexión.
- Consultas factuales sobre Sudán en contexto educativo: responde preguntas sobre moneda, independencia, ciudades o cultura a partir de los datos curados; adecuado para aplicaciones de divulgación local donde la precisión no sea crítica y se advierta al usuario de posibles errores.
- Traducción asistida árabe estándar↔sudanés: útil como borrador o apoyo en herramientas de traducción para contenido local, siempre con revisión humana dado el 0/4 obtenido en la evaluación interna de traducción.
- Preservación lingüística y cultural: el corpus de refranes, vocabulario y expresiones sudanesas permite construir aplicaciones de aprendizaje o archivo del dialecto, con el modelo como generador de ejemplos y definiciones.
- Prototipado offline de bajo coste: investigadores que necesiten un baseline de 0,5B en TFLite para experimentar con cuantización, latencia en móvil o pipelines LiteRT pueden usarlo como referencia reproducible.
- Chat de acompañamiento en zonas con conectividad limitada: al ejecutarse íntegramente en dispositivo, sirve para aplicaciones de asistencia conversacional donde no hay red, aceptando la limitación de razonamiento de un modelo de 0,5B.
- Filtrado y clasificación ligera de texto en sudanés: la comprensión del dialecto (3/4 en la evaluación interna) permite usarlo como componente de preprocesado o etiquetado en pipelines locales, aunque no se documenta un modo de clasificación específico.

## Benchmarks y rendimiento

El autor publica únicamente una evaluación interna de 20 preguntas con el mismo protocolo que la versión v2. No son benchmarks estándar y la muestra es demasiado pequeña para extraer conclusiones generales.

| Categoria (protocolo interno, 20 preguntas) | Zool-AI-ft0.5-v3 | v2 | v1 |
|---|---|---|---|
| Comprensión de dialecto | 3/4 | no disponible | no disponible |
| Generación | 0/4 | no disponible | no disponible |
| Refranes | 0/4 | no disponible | no disponible |
| Cultura | 1/4 | no disponible | no disponible |
| Traducción | 0/4 | no disponible | no disponible |
| Total | 4/20 | 0/20 | 0/20 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario objetivo; el artefacto TFLite dynamic_int8 de 511 MB está diseñado para ejecutarse en CPU de dispositivos móviles.
- GPU recomendadas: no se especifican. Para el artefacto TFLite, la ejecución es en CPU/NPU del dispositivo; para experimentación con los pesos originales de Qwen2.5-0.5B, cualquier GPU con 4-8 GB de VRAM es suficiente, aunque el repositorio no distribuye safetensors.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna si se dispone de los pesos base; el artefacto publicado está pensado para teléfonos.
- Opciones de despliegue: LiteRT (motor `LiteRtDirectEngine` de la app Zool-AI) y cualquier runtime LiteRT que soporte múltiples firmas (`decode` y `prefill_512`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles. La firma `prefill_512` sugiere un prefill limitado a 512 tokens, pero no se publican cifras de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|---|
| Zool-AI-ft0.5-v3 | 0,5B | no disponible (prefill_512 en TFLite) | ar (sudanés) | TFLite int8 | Apache 2.0 | 4/20 en protocolo interno de 20 preguntas |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | 32.768 tokens según la familia Qwen2.5 | multilingüe | safetensors, GGUF | Apache 2.0 | benchmarks publicados por Qwen; no comparable en dialecto sudanés |
| Modelos de 0,5B ajustados a dialectos árabes | no disponible | no disponible | ar | variable | variable | no disponible |

La comparación directa con alternativas de dialecto sudanés no está disponible: no se conocen en la información proporcionada otros modelos publicados específicamente para este dialecto. Frente a su base Qwen2.5-0.5B-Instruct, la diferencia principal es la especialización en sudanés y el formato TFLite para móvil, a costa de perder la distribución en safetensors y presumiblemente parte de la ventana de contexto original.

## Limitaciones y advertencias

- Modelo de 0,5B: capacidad muy limitada para razonamiento complejo, matemáticas y temas especializados; el propio autor lo advierte.
- Riesgo alto de alucinación: el autor indica que puede producir respuestas inexactas y recomienda verificar la información importante.
- Rendimiento medido bajo: 4/20 en el protocolo interno, con 0/4 en generación, refranes y traducción; la muestra de 20 preguntas es demasiado pequeña para ser concluyente y el propio autor señala que no es comparable con estándares aceptados.
- Variación dialectal: el sudanés generado puede diferir del uso local preciso en algunas regiones, según la model card.
- Idiomas: solo se declara árabe; no hay soporte documentado de otros idiomas ni garantía de calidad en árabe estándar más allá de los pares de traducción del corpus.
- Contexto: el artefacto TFLite exporta `prefill_512`, lo que apunta a una ventana efectiva de 512 tokens en el grafo desplegado; no se documenta la longitud de contexto nativa del modelo ajustado.
- Formato: solo se distribuye TFLite int8; no hay safetensors, GGUF ni pesos sin cuantizar en el repositorio, lo que limita el reajuste fino o la inspección de pesos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario asume la responsabilidad sobre la calidad y los sesgos del modelo; no se documentan evaluaciones de sesgo.
- Madurez: 12 descargas y 0 likes en el momento de la consulta; proyecto reciente (creado el 29 de octubre de 2026) sin validación externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/muzammilsoft/zool-ai-ft0.5-v3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- LiteRT (runtime de Google para modelos TFLite): https://ai.google.dev/edge/litert
- `litert-torch` (herramienta de conversión citada por el autor): https://github.com/google-ai-edge/litert-torch
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales del autor.
