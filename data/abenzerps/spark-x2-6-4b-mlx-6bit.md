# abenzerps/Spark-X2.6-4B-MLX-6bit

## Resumen

Spark-X2.6-4B-MLX-6bit es una conversión cuantizada a 6 bits para MLX de XHToken/Spark-X2.6-4B, un modelo de lenguaje de 4.112.079.360 parámetros con una ventana de contexto nativa de 1.048.576 tokens. La model card lo describe como un modelo de atención híbrida orientado a ejecución agéntica en dispositivo, lo que lo sitúa en la categoría de modelos pequeños de contexto largo para inferencia local en Apple Silicon.

La conversión la mantiene el usuario abenzerps y se distribuye con licencia Apache-2.0. El repositorio ocupa 3,3 GB e incluye pesos en safetensors para MLX, la plantilla de chat del modelo original y sumas de comprobación SHA256. Existen también variantes MLX de 8 bits y 4 bits del mismo modelo base.

Su relevancia actual está en la combinación de contexto de 1M tokens, tamaño de 4B y despliegue local mediante MLX, sin dependencia de GPU NVIDIA. Sin embargo, no se han publicado resultados numéricos de benchmarks en la información disponible, y se trata de una conversión de terceros con muy poca validación comunitaria en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Modelo base | XHToken/Spark-X2.6-4B |
| Autor de la conversión | abenzerps (Ahmet Benzer) |
| Arquitectura | modelo de lenguaje con atención híbrida (hybrid-attention); no se detalla la composición exacta |
| Parámetros totales | 4.112.079.360 (4,11 mil millones) |
| Parámetros activos | no disponible; no se indica que sea MoE |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantización | MLX 6-bit; la familia incluye 8-bit y 4-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors para MLX, con custom_code; tamaño del repositorio 3,3 GB |

## Arquitectura y entrenamiento

La model card define el modelo como un modelo de lenguaje de atención híbrida orientado a ejecución agéntica en dispositivo. No se especifican el número de capas, la proporción entre atención completa y atención eficiente, la dimensión oculta, el vocabulario ni otros detalles estructurales. Tampoco se documenta si emplea mezcla de expertos, state space models o una combinación concreta de mecanismos de atención.

No hay información sobre el número de tokens de entrenamiento, la composición del corpus, las fases de preentrenamiento, el ajuste supervisado o el uso de RLHF/DPO. La model card menciona resultados en modo thinking, pero no detalla cómo se activa ni qué entrenamiento lo soporta. La innovación declarada es la ventana nativa de 1M tokens y la optimización para despliegue local; esta conversión aplica cuantización 6-bit con MLX y conserva la plantilla de chat upstream.

## Capacidades

- Generación de texto y conversación multi-turno, según la pipeline declarada `text-generation` y la etiqueta `conversational`.
- Ventana de contexto nativa de 1.048.576 tokens. No se ha documentado el rendimiento efectivo a longitudes extremas.
- Modo thinking: la nota de benchmarks de la model card indica resultados en thinking mode, aunque no se especifica el mecanismo de activación.
- Orientación a agentes: la model card la describe como optimizada para ejecución agéntica y usa la etiqueta `agent`.
- Ejecución local en Apple Silicon mediante MLX, sin necesidad de GPU NVIDIA.
- No se documentan capacidades de visión, audio, código o matemáticas; no disponible.
- No se documenta soporte explícito de tool calling o function calling. La etiqueta `agent` no equivale a una API de herramientas verificada.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistente privado offline en un Mac: el modelo puede ejecutarse con MLX-LM y mantener conversaciones sin enviar datos a la nube. Sus 3,34 GB de pesos en 6 bits permiten probarlo en equipos con memoria unificada moderada, aunque el contexto largo exige más memoria.
- Análisis de contratos y expedientes extensos: la ventana de 1M tokens permite introducir documentos completos y formular preguntas sobre cláusulas, plazos o riesgos. Es adecuado para prototipos de revisión documental, siempre que se valide la calidad en el dominio concreto.
- Revisión de documentación de repositorios: puede resumir README, ADRs, issues y documentación técnica de un proyecto completo gracias al contexto largo. No se confirma su capacidad de generación de código, por lo que conviene usarlo para navegación y síntesis, no para sustituir herramientas de código verificadas.
- Automatización agéntica multi-paso: la orientación a agentes permite construir flujos de planificación y ejecución sobre texto. La orquestación de herramientas debe implementarse externamente, porque no hay soporte de tool calling documentado.
- Investigación cualitativa y análisis de entrevistas: permite procesar corpus grandes de transcripciones localmente, con privacidad y sin coste de API. Es útil para extraer temas y resumir, con revisión humana obligatoria por riesgo de alucinación.
- RAG local con contexto largo: puede combinarse con recuperación para reducir el troceado de documentos y responder sobre bases documentales amplias. El contexto de 1M tokens no elimina la necesidad de evaluar la precisión de las citas.
- Atención al cliente en prototipos: soporta conversaciones multi-turno y contexto histórico amplio. Al ser un modelo de 4B y sin benchmarks publicados, debe validarse antes de usarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye una imagen (`assets/benchmark.png`) con una comparativa atribuida a XHToken para Spark-X2.6-4B en thinking mode, pero no se proporcionan cifras textuales, metodología ni condiciones de evaluación.

## Requisitos de hardware

- Pesos del modelo: 3,34 GB en la cuantización 6-bit. La variante 8-bit ocupa 4,37 GB y la 4-bit, 2,32 GB.
- Memoria: los pesos solos son compatibles con equipos de 8 GB de memoria unificada, pero el sistema operativo y el KV cache reducen el margen. Para contexto de 1M tokens se requiere mucha más memoria y no hay cifras oficiales.
- GPU recomendadas: Apple Silicon de la familia M1, M2, M3 o M4 con memoria unificada suficiente. MLX no utiliza CUDA, por lo que no se ejecuta directamente en GPU NVIDIA.
- ¿Cabe en consumer GPU? Sí, en el sentido de Apple Silicon de consumo, siempre que la memoria unificada disponible cubra los pesos y el KV cache. No hay requisitos mínimos publicados.
- Opciones de despliegue: MLX-LM mediante CLI y API Python. No se proporcionan instrucciones para vLLM, TGI, llama.cpp u Ollama para este repositorio concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado alternativas externas con datos verificables en la información disponible. Se comparan las variantes de la misma familia:

| Modelo | Parámetros | Contexto | Formato/cuantización | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Spark-X2.6-4B (original) | 4,11B | 1M | no disponible | Apache-2.0 | XHToken/Spark-X2.6-4B |
| Este repositorio (MLX 6-bit) | 4,11B | 1M | MLX 6-bit, safetensors, 3,34 GB | Apache-2.0 | abenzerps |
| Spark-X2.6-4B-MLX-8bit | 4,11B | 1M | MLX 8-bit, 4,37 GB | Apache-2.0 | abenzerps |
| Spark-X2.6-4B-MLX-4bit | 4,11B | 1M | MLX 4-bit, 2,32 GB | Apache-2.0 | abenzerps |
| Spark-X2.5-4B-GGUF | 4B según el nombre | 1M según resultados de búsqueda | GGUF | no disponible | abenzerps |

## Limitaciones y advertencias

- No hay resultados numéricos de benchmarks publicados; la comparativa de la model card es una imagen sin cifras textuales ni metodología.
- Es una conversión de terceros, no la publicación original del modelo. La cuantización 6-bit puede degradar la calidad respecto al modelo base.
- El contexto de 1M tokens no garantiza calidad efectiva a esa longitud. El coste de memoria del KV cache puede hacer inviable el contexto máximo en equipos de consumo.
- El modelo tiene 4,11B parámetros; es adecuado para tareas locales y prototipos, pero puede quedarse corto en razonamiento complejo, matemáticas avanzadas o generación de código frente a modelos mayores.
- No se documentan los idiomas soportados. No hay garantía de rendimiento en castellano.
- No se documenta soporte de tool calling o function calling. La etiqueta `agent` no sustituye una especificación de herramientas.
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse la licencia y las condiciones del modelo base, así como el código personalizado incluido.
- El repositorio usa `custom_code`; es necesario confiar en el código remoto al cargarlo con `trust_remote_code`.
- MLX está orientado a Apple Silicon. No hay soporte directo para CUDA, vLLM, TGI, llama.cpp u Ollama en este repositorio.
- El repositorio presenta 0 descargas y 1 like en el momento de la consulta, por lo que la validación comunitaria es muy baja.
- Riesgo de alucinación inherente a los modelos de lenguaje; en producción se recomienda verificación factual, citas y revisión humana.

## Enlaces

- [HuggingFace: abenzerps/Spark-X2.6-4
