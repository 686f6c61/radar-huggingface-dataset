# bartowski/officialmobai_Rostam-S1-4B-GGUF

## Resumen

Rostam-S1-4B es un modelo de lenguaje de 4.112.079.360 parámetros (aproximadamente 4B) desarrollado por Mob AI en colaboración con el proyecto Spark. Está diseñado específicamente para razonamiento riguroso, matemáticas, física, ingeniería de software e inteligencia bilingüe persa-inglés. El modelo recibe su nombre del legendario campeón persa Rostam, símbolo de fuerza y sabiduría en la epopeya del Shahnameh.

La versión aquí documentada es la cuantización GGUF realizada por bartowski mediante llama.cpp (release b11969), que permite ejecutar el modelo en hardware de consumo con distintos niveles de compresión. El modelo base soporta un canal de pensamiento explícito (`thinking_effort`) con valores `low` y `high`, lo que lo sitúa en la categoría de modelos de razonamiento con modo de pensamiento configurable.

Su relevancia actual radica en tres factores: es un modelo de razonamiento compacto (4B) que cabe en GPUs de consumo, ofrece capacidades bilingües inglés-persa poco habituales en modelos de este tamaño, y soporta tool calling mediante un formato de prompt estructurado con definiciones de funciones en JSON. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles especificos no disponibles) |
| Parametros totales | 4.112.079.360 (~4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S (y otras en el repo) |
| Idiomas soportados | Ingles (en), persa (fa) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Se trata de un transformer de 4B parámetros con soporte para un canal de razonamiento (`<think>`) que precede a la respuesta final, y con un parámetro de control `thinking_effort` que admite los valores `low` y `high` para regular la profundidad del razonamiento. El modelo no emplea decodificación especulativa según la model card.

Respecto al entrenamiento, no se han publicado en la información disponible datos sobre el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card del cuantizador únicamente indica que el modelo base es `officialmobai/Rostam-S1-4B` y que la cuantización se realizó con llama.cpp b11969 usando imatrix (matriz de importancia) para mejorar la calidad de las cuantizaciones de baja precisión. El formato de prompt incluye tokens especiales propios (`<|System|>`, `<|User|>`, `<|Bot|>`) y un bloque `<tools>` en JSON para definiciones de funciones.

## Capacidades

- Generación de texto conversacional con formato de chat estructurado (system, user, bot).
- Razonamiento explícito mediante canal `<think>` con esfuerzo configurable (`low`/`high`).
- Matemáticas y física: el modelo está especializado en razonamiento riguroso en estas áreas según su system prompt por defecto.
- Generación de código e ingeniería de software.
- Soporte de tool calling / function calling mediante definiciones JSON en el bloque `<tools>`.
- Capacidades agénticas y razonamiento multi-paso (etiqueta `agentic` en el repo).
- Bilingüe inglés-persa, con especial énfasis en inteligencia bilingüe persa-inglés.
- Compatible con endpoints (etiqueta `endpoints_compatible`).

## Casos de uso

- Asistencia en matemáticas y física: el modelo puede resolver problemas paso a paso usando el canal de pensamiento, adecuado para herramientas educativas o de investigación que requieran trazabilidad del razonamiento.
- Generación de código en entornos con recursos limitados: al ser un modelo de 4B cuantizado a Q4_K_M (2,62 GB), puede desplegarse en portátiles o GPUs de consumo para autocompletado y generación de código.
- Agentes con tool calling: el formato de prompt con bloque `<tools>` permite integrar el modelo en pipelines agénticos que necesiten invocar funciones externas (APIs, consultas a bases de datos, etc.).
- Procesamiento de documentación en persa e inglés: útil para traducción asistida, resumen o atención al cliente bilingüe en mercados de habla persa.
- Razonamiento multi-paso en entornos edge: su tamaño reducido permite ejecutarlo en dispositivos con poca VRAM para tareas de razonamiento que no requieran un modelo de gran escala.
- Experimentación e investigación: al estar disponible en múltiples cuantizaciones GGUF y con licencia Apache 2.0, es adecuado para prototipado rápido y evaluación de técnicas de razonamiento en modelos compactos.
- Despliegue en CI/CD para revisión de código: puede integrarse en pipelines que requieran análisis de código o generación de parches con razonamiento explícito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - bf16: ~8,23 GB.
  - Q8_0: ~4,38 GB.
  - Q6_K: ~3,61 GB.
  - Q5_K_M: ~3,16 GB.
  - Q4_K_M: ~2,62 GB (recomendado por el cuantizador como equilibrio tamaño/calidad).
  - Q4_K_S: ~2,46 GB.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090 con cualquier cuantización; en GPUs de 8 GB caben Q4_K_M y superiores.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs con 6-8 GB o más de VRAM usando cuantizaciones Q4/Q5.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y cualquier runtime compatible con GGUF (LM Studio, koboldcpp, etc.). Para vLLM o TGI sería necesario usar el modelo base en safetensors, no las cuantizaciones GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de información suficiente sobre modelos comparables en la documentación proporcionada. Se indica "no disponible" para evitar inferencias sin respaldo. Como referencia estructural, compite en la categoría de modelos de razonamiento compactos (3-4B) con licencia permisiva, pero no se aportan cifras comparativas verificadas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al estar entrenado principalmente en inglés y persa, puede presentar sesgos culturales y lingüísticos derivados de esa composición.
- Riesgo de alucinación: inherente a los modelos de lenguaje; el canal de razonamiento no garantiza corrección factual.
- Limitaciones de contexto o idioma: solo se declaran inglés y persa; el rendimiento en otros idiomas (incluido el español) no está garantizado y probablemente sea deficiente.
- Longitud de contexto: no especificada, lo que impide planificar su uso en tareas de contexto largo sin validación previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero conviene verificar la licencia del modelo base original por si hubiera condiciones adicionales no reflejadas en la tarjeta del cuantizador.
- Caveats para producción: el modelo es una cuantización de terceros (bartowski), no la versión oficial; para producción crítica se recomienda validar contra el modelo base en safetensors y evaluar la degradación por cuantización en las tareas objetivo.
- El formato de prompt es específico y requiere respetar los tokens especiales y el bloque `<think>`; un uso incorrecto del formato puede degradar la calidad de las respuestas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/officialmobai_Rostam-S1-4B-GGUF
- Modelo base: https://huggingface.co/officialmobai/Rostam-S1-4B
- llama.cpp (release b11969): https://github.com/ggml-org/llama.cpp/releases/tag/b11969
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
