# DevQuasar/Hcompany.Holo4-27B-GGUF

## Resumen

DevQuasar/Hcompany.Holo4-27B-GGUF es una recuantización en formato GGUF del modelo Hcompany/Holo4-27B, publicado por DevQuasar, un autor especializado en distribuir versiones cuantizadas de pesos abiertos. El modelo original lo desarrolla H Company y pertenece a la familia Holo4, orientada al uso de ordenadores (computer use): agentes capaces de operar interfaces gráficas, escribir código, invocar MCP y ejecutar llamadas directas a API. La relevancia de esta pieza concreta es que traslada un VLM de gran tamaño al ecosistema llama.cpp, habilitando su ejecución local.

El modelo base es un modelo de visión-lenguaje (pipeline image-text-to-text) denso de 26.895.998.464 parámetros (~26,9B), construido sobre Qwen3.8-27B, según las fuentes disponibles. Se entrenó mediante SFT más RL sobre aproximadamente 10.000 tareas sintéticas generadas por el Agentic Task Factory de H Company, con el objetivo de generalizar a cualquier interfaz de software en lugar de a aplicaciones concretas.

La licencia del modelo base es CC BY-NC 4.0, es decir, no comercial, aunque el repositorio GGUF consultado no declara licencia en sus metadatos de HuggingFace. El repositorio ocupa 111,4 GB, lo que indica la presencia de varios niveles de cuantización en un mismo punto de descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de vision-lenguaje (VLM), basado en Qwen3.8-27B |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (varios niveles en el repositorio, 111,4 GB en total); el modelo base publica BF16, FP8, NVFP4 y GGUF de 4 bits |
| Idiomas soportados | no disponible |
| Licencia | CC BY-NC 4.0 en el modelo base (uso no comercial); no declarada en los metadatos de HuggingFace de esta cuantizacion |
| Formato de pesos | GGUF (el modelo base distribuye safetensors en BF16/FP8/NVFP4) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de tipo vision-lenguaje construido sobre Qwen3.8-27B, con capacidad de procesar entradas conjuntas de imagen y texto. No se trata de una arquitectura MoE: los ~26,9B de parámetros están activos en cada paso de inferencia, a diferencia de la variante Holo4-35B-A3B de la misma familia. La pipeline declarada es image-text-to-text, lo que implica un codificador visual acoplado al decoder de lenguaje, aunque no se dispone de detalles sobre el mecanismo de proyección multimodal ni sobre la ventana de contexto efectiva.

El entrenamiento combina SFT (supervised fine-tuning) con RL (aprendizaje por refuerzo) sobre aproximadamente 10.000 tareas sintéticas procedentes del Agentic Task Factory de H Company. La información disponible no detalla la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron fases de DPO. La propuesta técnica del modelo es la generalización por interfaz: en lugar de especializarse en aplicaciones concretas, se le entrena para operar cualquier software a través de GUI, código, MCP o API.

## Capacidades

- Generación de texto y razonamiento multimodal con entrada de imagen y texto.
- Computer use: interpretación de capturas de pantalla y grounding de elementos de interfaz para operar aplicaciones gráficas.
- Tool calling y function calling, incluyendo integración con MCP (Model Context Protocol).
- Interacción con API directas como alternativa a la manipulación de GUI.
- Generación de código como vía de automatización y como salida estructurada para herramientas.
- Razonamiento agéntico multi-paso orientado a completar tareas de principio a fin.
- Modo "thinking" o razonamiento explícito: no disponible en la información consultada.
- Capacidades de audio: no disponible; no se mencionan en las fuentes.
- Idiomas soportados: no disponible.

## Casos de uso

- Automatización de tareas de oficina en escritorio: el modelo puede leer capturas de pantalla de aplicaciones ofimáticas o de correo y ejecutar secuencias de clics y entradas de texto para completar flujos repetitivos, sustituyendo scripts frágiles basados en coordenadas fijas.
- Agentes de navegación web para extracción de datos: al combinar comprensión visual con tool calling, puede recorrer portales, interpretar formularios y volcar la información en un sistema posterior sin depender de selectores DOM concretos.
- Soporte técnico de nivel 1 con intervención remota: el agente puede diagnosticar el estado de una aplicación a partir de la pantalla y aplicar el procedimiento de resolución, escalando al operador humano cuando la tarea excede su alcance.
- Orquestación de pipelines de desarrollo: mediante MCP o llamadas a API, el modelo puede interactuar con repositorios, ejecutar comandos y redactar cambios de código dentro de un flujo de CI/CD, con el código como interfaz preferente sobre la GUI.
- Pruebas de regresión de interfaz asistidas: usar el modelo para recorrer aplicaciones y detectar anomalías visuales o flujos rotos, generando informes estructurados a partir de lo observado en pantalla.
- Automatización de back-office con sistemas heredados: en entornos donde no existe API, la capacidad de operar GUI permite integrar aplicaciones antiguas en flujos modernos sin reescribirlas.
- Prototipado de agentes de investigación: dado que los pesos son descargables y cuantizables en GGUF, sirve como banco de pruebas local para estudiar estrategias de razonamiento multi-paso con retroalimentación visual.

## Benchmarks y rendimiento

| Benchmark | Holo4-27B | Referencia comparada |
|---|---|---|
| OSWorld 2.0 | 61,7 % | 81,8 % (Opus 5.5, propietario) |

La fuente alphasignal.ai indica además que Holo4 gestiona pantallas, código y API con un 79 % menos de tokens que la alternativa con la que se compara, si bien no se detalla la metodología de esa medición. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar de lenguaje para este modelo.

## Requisitos de hardware

- VRAM estimada para los pesos, según cuantización (cálculo aproximado sobre 26,9B de parámetros, sin contar el codificador visual ni el contexto): Q4 en torno a 16-17 GB; Q5 en torno a 19-20 GB; Q6 en torno a 22-23 GB; Q8 en torno a 28-29 GB; BF16 en torno a 54 GB.
- GPU recomendadas: una RTX 4090 o RTX 5090 (24-32 GB) puede ejecutar las cuantizaciones Q4 y Q5 con holgura limitada para el contexto; una A100 40 GB o una L40S cubren Q6 y Q8; para BF16 conviene una A100 80 GB, H100 80 GB o varias GPU.
- Compatibilidad con GPU de consumo: sí, en cuantizaciones Q4 y Q5 sobre GPU de 24 GB o superiores. Por debajo de 16 GB habría que recurrir a cuantizaciones más agresivas o a descarga parcial en CPU/RAM.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, servidores compatibles con el endpoint de OpenAI). Los tags del repositorio incluyen `endpoints_compatible`, lo que sugiere compatibilidad con endpoints estándar.
- vLLM y TGI: no disponibles para este repositorio GGUF; el modelo base en safetensors sería la vía para esos motores.
- Latencia y throughput: no disponibles en la información consultada.
- Advertencia de despliegue: conviene verificar que la build concreta de llama.cpp utilizada soporte la torre de visión de esta arquitectura, ya que el soporte multimodal en runtime es menos uniforme que el de texto.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | OSWorld 2.0 |
|---|---|---|---|---|---|
| Holo4-27B (esta cuantizacion) | ~26,9B | VLM denso | no disponible | CC BY-NC 4.0 | 61,7 % |
| Holo4-35B-A3B | 35B totales, A3B activos | VLM MoE | no disponible | no disponible | no disponible |
| Opus 5.5 | no disponible | no disponible | no disponible | propietaria | 81,8 % |

La comparación directa con otras alternativas abiertas de computer use no puede establecerse con la información disponible. El dato relevante es la brecha de 20,1 puntos porcentuales frente a Opus 5.5 en OSWorld 2.0, junto con la ventaja declarada en consumo de tokens.

## Limitaciones y advertencias

- Licencia no comercial: el modelo base se distribuye bajo CC BY-NC 4.0, lo que restringe el uso comercial. Cualquier producto que integre este modelo requiere una licencia adicional del titular.
- Licencia no declarada en esta cuantizacion: los metadatos de HuggingFace del repositorio GGUF no especifican licencia, por lo que la única referencia fiable es la del modelo base.
- Riesgo de alucinación: al operar sobre interfaces gráficas, un error de grounding puede traducirse en acciones reales sobre el sistema (clics, borrados, envíos), con consecuencias materiales. Es imprescindible interponer confirmaciones o límites de actuación.
- Brecha de rendimiento: 61,7 % en OSWorld 2.0 implica que aproximadamente cuatro de cada diez tareas no se completan correctamente en ese benchmark.
- Contexto e idiomas desconocidos: no se ha publicado la longitud de ventana ni la cobertura lingüística, lo que impide garantizar su comportamiento en tareas con historiales largos o en idiomas distintos del inglés.
- Sesgos: no hay información publicada sobre evaluación de sesgos para este modelo.
- Soporte multimodal en GGUF: la conversión de un VLM a GGUF puede degradar o requerir builds específicas para la parte visual; conviene validar la calidad de las respuestas visuales tras la cuantización.
- Datos de entrenamiento sintéticos: al provenir de tareas generadas automáticamente, existe riesgo de sobreajuste a los patrones de esas tareas y de peor generalización en dominios no representados.
- Ausencia de benchmarks de lenguaje: no se dispone de resultados en tareas estándar de texto, por lo que no puede posicionarse frente a modelos generalistas del mismo tamaño.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/DevQuasar/Hcompany.Holo4-27B-GGUF
- Modelo base: https://huggingface.co/Hcompany/Holo4-27B
- Cuantizacion alternativa en GGUF: https://huggingface.co/abenzerps/Holo4-27B-GGUF
- Sitio de DevQuasar: https://devquasar.com
- Cobertura sobre la publicacion de pesos: https://ccleaks.com/news/holo4-open-weights-sep-2026
- Analisis de la familia Holo4: https://dev.to/mikefluff/h-company-ships-holo4-open-weight-agents-that-work-any-software-interface-3pnp
- Benchmarks y limites de licencia: https://windowsforum.com/news/holo4-computer-use-ai-run-gui-agents-locally-on-windows-benchmarks-and-license-limits.446345/
- Rendimiento y consumo de tokens: https://alphasignal.ai/news/h-company-s-holo4-handles-screens-code-and-apis-with-79-fewer-tokens
