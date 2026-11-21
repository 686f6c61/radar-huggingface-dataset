# ApolloRaines/Sharona_Q27B-R_CodeSecurity_v2

## Resumen

Sharona_Q27B-R_CodeSecurity_v2 es un modelo de lenguaje de 26.900 millones de parámetros derivado de Qwen/Qwen3.5-27B mediante un proceso de edición conductual sobre pesos que su autor, ApolloRaines, denomina jBlaze. No se trata de un fine-tuning convencional ni de ingeniería de prompts: la model card describe modificaciones analíticas de direcciones en el espacio de pesos, calibradas automáticamente por una herramienta llamada jTuner. El resultado es un modelo especializado en revisión de seguridad de código, no un chatbot de propósito general.

El modelo aplica siete modificaciones conductuales apiladas: amplificación del pensamiento adversarial, refuerzo de la fidelidad al contexto, sustitución de identidad, amplificación de precisión en los hallazgos, eliminación de rechazos de seguridad, amplificación del escepticismo y eliminación de la sicofancia. Según el autor, esto permite que el modelo señale vulnerabilidades concretas (por ejemplo, inyección SQL en una línea específica y un parámetro específico) sin aceptar la premisa del desarrollador de que el código es seguro.

Es relevante por dos motivos. Primero, porque ejemplifica una tendencia creciente de modelos derivados mediante cirugía de pesos para tareas verticales muy concretas, en este caso la auditoría de seguridad. Segundo, porque introduce públicamente jTuner, una supuesta automatización de la calibración que haría viable apilar múltiples modificaciones sin degradar la coherencia del modelo. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada: la model card no los detalla.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (model_type: qwen3_5_text), derivado de Qwen/Qwen3.5-27B |
| Parámetros totales | 26.895.998.464 (26,9 mil millones) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible en la model card; el ejemplo de despliegue con vLLM usa `--max-model-len 16384` |
| Tipos de cuantización | No especificados por el autor; el ejemplo de vLLM usa FP8. Al ser safetensors sobre base Qwen, cabría esperar compatibilidad con GGUF/AWQ/GPTQ vía herramientas externas, pero no está confirmado |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 53,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen 3.5-27B, un transformer decoder-only identificado en los metadatos como `qwen3_5_text`. El autor no publica detalles sobre número de capas, dimensión oculta, mecanismo de atención ni composición del corpus de preentrenamiento del modelo base. Lo que sí describe es el proceso de derivación: siete modificaciones conductuales aplicadas mediante jBlaze, herramienta propietaria que opera directamente sobre los pesos identificando direcciones asociadas a comportamientos y amplificándolas o eliminándolas.

La model card incluye una corrección relevante sobre la procedencia: aunque jBlaze se presenta como edición analítica de pesos y no como fine-tuning, el autor aclara que la ruta de escritura de conocimiento es descenso de gradiente sobre un conjunto restringido de parámetros, y que la procedencia de este checkpoint incluye entrenamiento por gradiente. Es decir, es una combinación de cirugía de direcciones y ajuste supervisado limitado. La innovación declarada es jTuner, que calibra automáticamente la intensidad de cada modificación para equilibrar efecto conductual y preservación de capacidades, evitando el margen estrecho entre "sin efecto" y "modelo incoherente" que hacía inviable el apilado manual. No se publican tokens de entrenamiento, composición del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Análisis de vulnerabilidades de código con orientación adversarial: evalúa el código preguntándose cómo puede romperse, no solo qué hace.
- Localización precisa de hallazgos: según el autor, produce descripciones del tipo "inyección SQL en la línea 42 mediante el parámetro username en la interpolación f-string de la consulta SELECT".
- Detección de fallos de lógica de negocio que requieren leer la especificación y el contexto proporcionado, gracias al refuerzo de fidelidad al contexto.
- Análisis de eficacia real de controles de seguridad (por ejemplo, si un token CSRF está ligado a la sesión, si es reutilizable o qué ocurre si el valor es indefinido).
- Resistencia a la sicofancia: no valida la afirmación del usuario de que el código es seguro si detecta fallos.
- Ausencia de rechazos de seguridad para análisis de código, incluido código potencialmente malicioso.
- Generación de texto conversacional en inglés, con plantilla de chat compatible con `apply_chat_template`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Revisión de seguridad en pipelines de CI/CD: integrado como paso de análisis sobre diffs o ficheros modificados, el modelo devuelve hallazgos con línea y parámetro afectados, lo que permite bloquear merges con vulnerabilidades explotables antes de producción.
- Auditoría de código heredado: al priorizar el contexto real sobre patrones genéricos, resulta adecuado para revisar bases de código antiguas donde las convenciones no siguen los estándares actuales y los analizadores estáticos generan mucho ruido.
- Triaje de hallazgos de SAST: usar el modelo como segunda opinión sobre alertas de herramientas estáticas, pidiéndole evaluar si el control existente es realmente eficaz, lo que reduce falsos positivos antes de escalar a un ingeniero.
- Formación y concienciación de desarrolladores: análisis comentado de fragmentos vulnerables con explicación concreta del vector de ataque, útil en revisiones de código internas y sesiones de formación.
- Revisión de código de terceros o dependencias: análisis de fragmentos de librerías antes de incorporarlas, con foco en inyección, gestión de sesiones y validación de entradas.
- Análisis de parches de seguridad: comprobar si un parche corrige realmente la causa raíz o solo el síntoma, aprovechando el escepticismo amplificado para cuestionar comprobaciones superficiales.
- Asistencia en respuesta a incidentes: reconstruir la superficie de ataque de un fragmento de código comprometido y enumerar vectores alternativos que un atacante podría haber usado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, evaluaciones de detección de vulnerabilidades (por ejemplo, sobre datasets tipo SecCodePLT o CWE-Bench) ni comparaciones cuantitativas con el modelo base. El autor menciona que todos los modelos de jBlaze se evalúan conductualmente y se comprueba la degradación de fluidez y capacidades antes de publicarse, pero no aporta los resultados.

## Requisitos de hardware

- Pesos en safetensors: 53,8 GB, lo que corresponde aproximadamente a FP16/BF16 para 26,9 mil millones de parámetros.
- VRAM estimada para inferencia: en FP16, en torno a 54 GB solo para pesos, más caché KV y overhead; en FP8, alrededor de 27 GB para pesos; en cuantizaciones de 4 bits (si se generan con herramientas externas), aproximadamente 14-16 GB.
- GPU recomendadas: para FP16 sin cuantizar, A100 80 GB o H100 80 GB; con tensor parallelism de 2, dos A100 40 GB o dos RTX 4090 24 GB (el ejemplo del autor usa `--tensor-parallel-size 2` con FP8).
- GPU de consumo: en FP8 o cuantización de 4 bits podría caber en una RTX 4090 (24 GB) o RTX 3090, siempre que se disponga de una ruta de cuantización compatible; no está confirmado por el autor.
- Opciones de despliegue: vLLM está documentado explícitamente en la model card (`vllm serve` con `--quantization fp8` y `--max-model-len 16384`); Transformers con `device_map="auto"` también está documentado. llama.cpp, Ollama y TGI no se mencionan y requerirían conversión a GGUF o configuración adicional.
- Latencia y throughput: no disponibles. El autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sharona_Q27B-R_CodeSecurity_v2 | 26,9 B | No disponible (ejemplo con 16.384) | Auditoría de seguridad de código | Apache 2.0 | Hugging Face, 850 descargas |
| Qwen/Qwen3.5-27B (base) | ~27 B | No disponible en esta ficha | Propósito general | Según el modelo base (no confirmada aquí) | Hugging Face |
| Alternativas de análisis de seguridad de código | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos derivados de Qwen 3.5-27B orientados a seguridad de código, ni de benchmarks que permitan una comparación cuantitativa con el modelo base. La comparación más directa posible es con Qwen/Qwen3.5-27B, del que este checkpoint hereda arquitectura y tamaño, pero no se han publicado métricas diferenciales.

## Limitaciones y advertencias

- Solo inglés: la model card declara únicamente `en`, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Sesgo de especialización: el modelo está diseñado para señalar fallos sin matices; puede producir falsos positivos o descripciones excesivamente categóricas en código que es seguro por diseño.
- Riesgo de alucinación en referencias a líneas y parámetros: aunque el autor promete precisión, no hay benchmarks que verifiquen la exactitud de las localizaciones reportadas.
- Eliminación deliberada de rechazos de seguridad: el modelo analizará código malicioso sin declinar; esto es intencionado, pero implica que no debe desplegarse como asistente general sin filtros externos.
- Sustitución de identidad: el modelo no se comporta como Qwen 3.5-27B y no debe usarse como sustituto del modelo base en tareas generales.
- Procedencia opaca: jBlaze es propietario y no público; no es posible reproducir la derivación ni auditar completamente qué se modificó en los pesos.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero el usuario debe verificar las obligaciones heredadas del modelo base Qwen y la ausencia de restricciones adicionales en los ficheros del repositorio.
- Contexto máximo no documentado: el valor de 16.384 del ejemplo de vLLM es una configuración de despliegue, no necesariamente el límite arquitectónico; conviene validarlo antes de producción.
- Adopción muy baja (850 descargas, 2 likes) y sin evaluaciones independientes, lo que limita la confianza para uso en producción sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Sharona_Q27B-R_CodeSecurity_v2
- Modelo base Qwen 3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Herramienta jBlaze: https://jblaze.dev
- Plataforma ShipItClean: https://shipitclean.com
