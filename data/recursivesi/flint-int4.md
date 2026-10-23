# RecursiveSI/flint-int4

## Resumen
Flint INT4 es una versión cuantizada a INT4 en formato MLX del modelo Recursive Flint, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Recursive (RecursiveSI). El modelo base tiene 39,8 mil millones de parámetros totales y aproximadamente 2,5 mil millones de parámetros activos por token, con una ventana de contexto de 262.144 tokens. Está orientado a agentes de programación, razonamiento y uso de herramientas multi-turno.

Esta versión INT4 está pensada para inferencia local en Apple Silicon: los pesos ocupan aproximadamente 22,6 GB y utilizan cuantización affine group-64 para proyecciones y expertos, e INT8 para embeddings. La licencia Apache 2.0 permite uso comercial y modificación.

Su relevancia actual radica en que permite ejecutar un modelo de casi 40B en un portátil con hardware Apple, gracias al formato MLX y a la cuantización. En el momento de la consulta, la versión INT4 registra 1.955 descargas y 13 likes en Hugging Face, y el modelo fue presentado públicamente en octubre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE) |
| Parámetros totales | 39,8 mil millones (39.8B) |
| Parámetros activos | Aproximadamente 2,5 mil millones (2.5B) por token |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantización | INT4 (group-64 affine) en proyecciones y expertos; INT8 en embeddings. Esta versión es INT4. Existe versión GGUF para llama.cpp en Metal. |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (esta versión). También disponible en GGUF (flint-int4-gguf). |

## Arquitectura y entrenamiento
La arquitectura es un transformer con mezcla de expertos (MoE). Los detalles completos de la arquitectura, el número exacto de tokens de entrenamiento y la composición del dataset no están disponibles en la información proporcionada; la model card remite a la ficha del modelo base Flint para obtener información compartida sobre modelo y entrenamiento.

Según la model card, los datos de entrenamiento incluyeron documentos web públicos y rastreados, texto y código, datos con licencia comercial y datos sintéticos generados por IA. El post-entrenamiento incluyó ajuste por instrucciones, aprendizaje por refuerzo y datos de preferencias humanas. Esta versión INT4 aplica cuantización affine group-64 a proyecciones y expertos, e INT8 a embeddings, lo que reduce el peso a 22,6 GB y permite la inferencia en Apple Silicon mediante MLX.

## Capacidades
- Generación de texto y razonamiento general.
- Generación de código y asistencia especializada en programación.
- Uso de herramientas (tool calling / function calling) en conversaciones multi-turno.
- Razonamiento multi-paso (multi-step reasoning) para agentes autónomos.
- Ventana de contexto larga de 262.144 tokens, adecuada para múltiples archivos y documentación extensa.
- Capacidades multilingües: no se detallan los idiomas soportados en la información disponible.
- No se especifica un modo de pensamiento explícito ni capacidades de visión o audio en la información proporcionada.

## Casos de uso
- Asistente de programación local en portátiles Apple Silicon: el modelo puede ejecutarse con Rec (`rec launch pi` o `rec launch opencode`) y mantener conversaciones multi-turno con hasta 262K tokens de contexto, lo que permite cargar varios archivos y documentación técnica sin perder el hilo.
- Agente autónomo de resolución de incidencias en repositorios: gracias al tool calling y al razonamiento multi-paso, puede consultar el estado del repositorio, ejecutar pruebas y proponer parches de forma iterativa.
- Generación de código en producción con integración en CI/CD: el modelo puede revisar diffs, sugerir correcciones y generar pruebas unitarias; su licencia Apache 2.0 facilita la integración en pipelines comerciales, aunque se recomienda validación humana.
- Análisis de bases de código extensas: la ventana de 262K tokens permite procesar múltiples módulos, archivos de configuración y documentación en una sola sesión, útil para tareas de auditoría y comprensión de arquitecturas.
- Refactorización multi-archivo: el modelo puede planificar y ejecutar cambios que afectan a varios ficheros, usando razonamiento multi-paso y herramientas para verificar la coherencia del código.
- Chat de soporte técnico especializado en desarrollo: puede gestionar conversaciones largas con contexto técnico, recordar decisiones previas y responder dudas sobre APIs o patrones de diseño.
- Prototipado rápido sin conexión: al ser un modelo local en formato MLX, permite experimentar con generación de código y agentes sin depender de servicios en la nube.
- Formación y educación en programación: puede explicar fragmentos de código, proponer ejercicios y responder preguntas con contexto extenso, adecuado para entornos docentes con hardware Apple.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card de esta versión INT4 remite a la ficha del modelo base Flint para obtener benchmarks, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware
- VRAM estimada: los pesos ocupan aproximadamente 22,6 GB. Se necesita memoria adicional para el KV cache y las activaciones; para contexto de 262K tokens, el consumo puede ser considerable. No se proporcionan cifras oficiales de memoria total recomendada.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 en variantes Max/Ultra) con soporte Metal. La versión MLX está diseñada para estos chips. Para llama.cpp en Metal, usar la versión GGUF.
- Si cabe en consumer GPU: sí, en equipos Apple Silicon de gama alta con memoria unificada de 32 GB o más para contexto moderado; para contexto completo, se recomienda 64 GB o más (estimación).
- Opciones de despliegue: MLX, Rec (`rec launch pi` / `rec launch opencode`), llama.cpp con GGUF para Metal, LM Studio. No se menciona soporte para vLLM o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la búsqueda realizada. La model card no incluye una comparativa con alternativas de la misma categoría. Por tanto, no se puede establecer una tabla comparativa con datos verificables.

## Limitaciones y advertencias
- Sesgos conocidos: no se detallan sesgos específicos en la información proporcionada; como modelo entrenado con datos web, puede heredar sesgos presentes en esos datos.
- Riesgo de alucinación: no se cuantifica; como todo modelo generativo, puede producir información incorrecta o inventada, especialmente en contextos muy largos o temas poco representados.
- Limitaciones de contexto: aunque la ventana es de 262K tokens, no se proporcionan evaluaciones del rendimiento por longitud de contexto; es posible que la calidad se degrade en los extremos de la ventana.
- Limitaciones de idioma: no se especifican los idiomas soportados; el rendimiento puede ser mejor en inglés y no hay garantías para otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y distribución, siempre que se mantengan los avisos de licencia correspondientes. No se conocen restricciones adicionales.
- Caveat para producción: esta versión INT4 está pensada para Apple Silicon; para otros entornos, usar la versión GGUF o el modelo base. La cuantización puede degradar ligeramente la calidad frente a los pesos completos.
- No se proporcionan garantías de seguridad ni filtros de contenido en la información disponible.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/RecursiveSI/flint-int4
- Modelo base Flint: https://huggingface.co/RecursiveSI/flint
- Versión GGUF: https://huggingface.co/RecursiveSI/flint-int4-gguf
- Repositorio Rec: https://github.com/recursive-oss/rec
- Blog de presentación: https://recursive.com/updates/introducing-recursive-flint
- Página en LM Studio: https://lmstudio.ai/models/recursivesi/flint
- Artículo en TechCrunch: https://techcrunch.com/2026/10/21/recursive-launches-flint-a-laptop-coding-model-it-says-was-largely-built-by-ai/
- Análisis en cellcog.ai: https://cellcog.ai/blog/recursive-flint/
- Licencia: https://huggingface.co/RecursiveSI/flint-int4/blob/main/LICENSE
