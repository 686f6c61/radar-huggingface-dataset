# sekkit/flint

## Resumen

Flint es un modelo de lenguaje de tipo mixture-of-experts desarrollado por Recursive, diseñado específicamente para agentes de programación: explorar codebases, corregir errores, implementar funcionalidades y escribir tests. Cuenta con 39.785.287.456 parámetros totales (39,8B) y aproximadamente 2,5B activos por token, con una ventana de contexto documentada de 262.144 tokens que incluye prompt y salida generada.

La arquitectura es un transformer decoder-only con 49 capas (2 densas seguidas de 47 MoE), atención híbrida de 35 capas de ventana deslizante y 14 de atención completa, y 256 expertos enrutados por capa con 6 seleccionados por token más un experto compartido siempre activo. Se distribuye en BF16 con safetensors, licencia Apache 2.0, y el autor publica un kit de servicio para SGLang pensado para ejecutarse en una GPU B300 o H200 por réplica.

Su relevancia inmediata es doble: por un lado, ofrece pesos abiertos con resultados declarados de 74,2% en SWE-bench Verified y 89,7% en SWE-bench Pro v2; por otro, Recursive afirma que su sistema Eureka Machine participó en casi toda la pila de construcción del modelo (datos, recetas de entrenamiento, infraestructura y optimización de inferencia), lo que convierte a Flint en un caso de estudio sobre investigación automatizada. El repositorio de HuggingFace indicado en la información disponible está bajo el espacio `sekkit`, mientras que la model card referencia `RecursiveSI/flint` como origen de descarga.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mixture-of-experts |
| Parámetros totales | 39.785.287.456 (39,8B) |
| Parámetros activos | ~2,5B por token (incluye la cabeza de salida; el cuerpo activo solo es ~2,2B) |
| Longitud de contexto | 262.144 tokens (prompt + salida generada) |
| Tipos de cuantización | BF16 (checkpoint publicado); variantes cuantizadas preparadas por separado para NVIDIA (NVFP4) y Apple Silicon; detalle del resto no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); repo de 79,6 GB |
| Desarrollador | Recursive |
| Capas | 49: 2 densas + 47 MoE |
| Atención | 35 capas de ventana deslizante + 14 de atención completa |
| Ventana deslizante | 513 tokens (token actual + 512 precedentes) |
| Cabezas de atención | 32 query heads, 4 key/value heads; dimensión de cabeza 128 |
| Normalización de atención | QK RMSNorm por cabeza y attention sinks aprendidos por cabeza |
| Codificación posicional | RoPE en capas de ventana deslizante; sin codificación posicional en capas de atención completa |
| Expertos por capa MoE | 256 enrutados, 6 por token, más 1 experto compartido siempre activo |
| Vocabulario | 150.144 tokens |
| Entrada / salida | texto / texto |
| Corte de conocimiento declarado | junio de 2026 |
| Pipeline | text-generation |
| Librería | transformers (sin código de modelado incluido todavía) |

## Arquitectura y entrenamiento

Flint es un transformer decoder-only con mezcla de expertos. Las dos primeras capas son densas y las 47 restantes son MoE con 256 expertos enrutados, 6 activos por token y un experto compartido siempre activo, lo que explica la relación 39,8B / ~2,5B. La atención combina 35 capas de ventana deslizante de 513 tokens con 14 capas de atención completa; las capas locales usan RoPE y las globales no llevan codificación posicional, apoyándose en attention sinks aprendidos y QK RMSNorm por cabeza. El vocabulario es de 150.144 tokens y la configuración documentada de contexto alcanza los 262.144 tokens compartidos entre prompt y generación.

El entrenamiento se realizó desde cero y cubrió pretraining, mid-training, ajuste supervisado y aprendizaje por refuerzo, con datos de texto y código, seguimiento de instrucciones y tareas agénticas. El ajuste supervisado incluyó ejemplos orientados a seguridad. La model card no publica el número de tokens de entrenamiento ni la composición del dataset, por lo que esos datos no están disponibles. La innovación técnica destacada por el autor no está en el modelo en sí, sino en el proceso: el sistema Eureka Machine participó en el desarrollo de datos, recetas de entrenamiento, infraestructura y optimización de inferencia.

## Capacidades

- Generación de texto y razonamiento explícito: el servidor devuelve `reasoning_content`, que debe conservarse en el historial de la conversación.
- Programación: escritura, corrección y refactorización de código, con evaluación publicada en SWE-bench Verified, SWE-bench Pro v2 y Terminal-Bench 2.1.
- Uso de herramientas multi-turno con llamadas compatibles con la API de OpenAI (tool calling / function calling).
- Comportamiento agéntico: resolución de tareas en terminal, ejecución de comandos, inspección de repositorios y aplicación de parches.
- Exploración de codebases extensas gracias a los 262.144 tokens de contexto.
- Generación de tests y verificación de cambios.
- Capacidades multilingües: no disponible (la model card no detalla cobertura de idiomas).
- Sin visión ni audio: la modalidad declarada es texto de entrada y texto de salida.
- Ajuste recomendado de muestreo: temperatura 1.0, top-p 0.95, top-k 20; presupuesto de salida de al menos 32.768 tokens en problemas difíciles.

## Casos de uso

- Automatización de tareas en terminal: el modelo está entrenado y evaluado para operar en entornos de shell (54,9% en Terminal-Bench 2.1), por lo que encaja en pipelines que clonan un repo, ejecutan comandos y validan resultados.
- Resolución de incidencias sobre repositorios existentes: con 74,2% en SWE-bench Verified, es adecuado para localizar el fallo, proponer un parche y comprobarlo con la suite de tests del proyecto.
- Implementación de funcionalidades con agentes tipo mini-swe-agent: el soporte de tool calling multi-turno permite encadenar lectura de ficheros, edición y ejecución de tests dentro de un mismo bucle.
- Generación y mantenimiento de tests: el modelo puede escribir casos de prueba a partir del código y de los errores observados, reduciendo el trabajo manual en proyectos con cobertura baja.
- Comprensión de codebases grandes: la ventana de 262.144 tokens permite cargar varios módulos, logs y documentación en una sola petición para tareas de auditoría o分析 de arquitectura.
- Asistente de código local con privacidad: el autor distribuye variantes cuantizadas para NVIDIA (NVFP4) y Apple Silicon, lo que permite ejecutar el modelo en hardware propio sin enviar código a una API externa.
- Integración en CI/CD: con un servidor SGLang compatible con OpenAI, el modelo se puede invocar desde scripts de integración para triaje automático de fallos, generación de descripciones de PR o revisión de diffs.
- Refactors multi-archivo: la combinación de contexto largo y uso de herramientas facilita cambios coordinados entre ficheros, con verificación posterior mediante ejecución de tests.

## Benchmarks y rendimiento

| Benchmark | Flint | Condiciones de evaluación |
|---|---|---|
| Terminal-Bench 2.1 | 54,9% | Terminus 2; soluciones obtenidas por recuperación web contadas como fallo; media de pass@1 sobre al menos 5 intentos |
| SWE-bench Pro v2 | 89,7% | mini-swe-agent; media de pass@1 sobre al menos 5 intentos |
| SWE-bench Verified | 74,2% | mini-swe-agent; media de pass@1 sobre al menos 5 intentos |

Ajustes de generación empleados en la evaluación: temperatura 1.0, top-p 0.95, top-k 20. La model card advierte que los resultados pueden variar según la precisión del checkpoint y el runtime de inferencia, y que las puntuaciones de otros modelos incluidas en su gráfica son reportadas por sus desarrolladores, no medidas por Recursive. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Pesos en BF16: el repositorio ocupa 79,6 GB, por lo que una réplica en BF16 necesita al menos ~80 GB de memoria de GPU.
- GPU indicadas por el autor: una B300 o una H200 por réplica, con los scripts `serve_b300.sh` y `serve_h200.sh` del kit de SGLang.
- GPU de consumo: el checkpoint BF16 no cabe en tarjetas de 24-32 GB (RTX 4090, RTX 5090). El autor menciona variantes NVFP4 y para Apple Silicon preparadas aparte, pero no publica la VRAM exacta; una estimación aritmética a 4 bits sobre 39,8B parámetros daría ~20 GB de pesos, cifra no confirmada por el autor.
- Despliegue: el único runtime soportado de forma oficial en el repositorio es SGLang, mediante una imagen Docker incluida (`docker build -t flint-sglang sglang`) y API compatible con OpenAI en el puerto 30000. El código de modelado para Transformers no está incluido todavía; no hay soporte confirmado para vLLM, llama.cpp, Ollama ni TGI.
- Multi-GPU: el `sglang/README.md` del repositorio cubre opciones de despliegue multi-GPU, si bien los requisitos concretos no están detallados en la información disponible.
- Latencia y throughput: no disponible. La model card advierte de que el razonamiento largo incrementa la latencia y puede agotar el presupuesto de salida antes de completar la respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flint (Recursive) | 39,8B totales / ~2,5B activos | 262.144 | 74,2% | Apache 2.0 | Pesos abiertos en HuggingFace; servicio vía SGLang |
| Alternativas "locales" citadas en la model card | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card incluye una gráfica que compara Flint con "modelos locales que se ejecutan en hardware similar", pero no identifica a esos modelos ni aporta sus cifras en la información disponible. La prensa especializada sitúa a Flint frente a modelos como DeepSeek V4.1 Flash o Gemini 4 Argon, aunque sin datos comparativos verificables en las fuentes consultadas. No se dispone, por tanto, de una comparativa cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Alucinación y código defectuoso: el autor advierte explícitamente de que el modelo puede generar contenido incorrecto o dañino, código con fallos y llamadas a herramientas inadecuadas. Todo código generado debe probarse y revisarse antes de aplicarlo.
- Riesgo en el uso de herramientas: la gramática estructurada de las llamadas no impide que el modelo elija una acción insegura; las aplicaciones deben imponer sus propios permisos y límites de ejecución.
- Idiomas: no se documenta la cobertura lingüística, lo que impide asumir un rendimiento uniforme fuera del inglés.
- Contexto: los 262.144 tokens son un límite de capacidad, no una garantía de precisión uniforme en todas las longitudes de secuencia.
- Latencia y presupuesto de salida: el razonamiento extenso puede consumir el presupuesto de tokens antes de llegar a la respuesta final; el autor recomienda al menos 32.768 tokens de salida en problemas difíciles.
- Variabilidad por runtime: los resultados dependen de la precisión del checkpoint y del motor de inferencia, por lo que conviene evaluar la combinación exacta que se vaya a desplegar.
- Licencia: Apache 2.0 permite uso comercial de los pesos, pero los términos de la API alojada y las prácticas de datos son independientes de la licencia del modelo.
- Madurez del ecosistema: el código de modelado para Transformers no está incluido y el despliegue documentado depende de SGLang y de una GPU B300 o H200, lo que limita las opciones de integración.
- Trazabilidad del repositorio: el ID de HuggingFace indicado es `sekkit/flint`, mientras que la model card y las instrucciones de descarga apuntan a `RecursiveSI/flint`; conviene verificar el origen antes de desplegar en producción.
- Validación externa: parte de los resultados y de las comparaciones proceden del propio desarrollador, y la prensa señala que las pruebas independientes publicadas han sido limitadas y basadas en benchmarks generados por la empresa.

## Enlaces

- HuggingFace (ID indicado): https://huggingface.co/sekkit/flint
- HuggingFace (organización del autor, referenciada en la model card): https://huggingface.co/RecursiveSI
- Blog de presentación: https://www.recursive.com/updates/introducing-recursive-flint
- Motor local (GitHub): https://github.com/recursive-oss/rec
- Documentación: https://docs.recursive.com/getting-started
- TechCrunch: https://techcrunch.com/2026/10/21/recursive-launches-flint-a-laptop-coding-model-it-says-was-largely-built-by-ai/
- Startup Fortune: https://startupfortune.com/recursive-says-ai-built-most-of-its-new-flint-coding-model/
- MarkTechPost: https://www.marktechpost.com/2026/10/21/recursive-flint-local-coding-model/
- Tech Insider: https://tech-insider.org/flint-ai-coding-model-swe-bench-2026/
