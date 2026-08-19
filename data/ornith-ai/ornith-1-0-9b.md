# ornith-ai/Ornith-1.0-9B

## Resumen

Ornith-1.0-9B es el miembro más ligero de la familia Ornith-1.0, un conjunto de modelos de código abierto desarrollados por DeepReinforce AI (también conocido como ornith-ai) para tareas de codificación agéntica. El modelo está post-entrenado sobre las arquitecturas base de Gemma 4 y Qwen 3.5, y destaca por su enfoque de auto-mejora mediante aprendizaje por refuerzo (RL): no solo aprende a generar soluciones, sino también el "scaffold" (andamiaje) que guía esas soluciones, optimizando conjuntamente ambos componentes para descubrir mejores trayectorias de búsqueda y generar resultados de mayor calidad.

Con aproximadamente 9 mil millones de parámetros en configuración densa, está diseñado para un despliegue eficiente en una única GPU, lo que lo convierte en una opción atractiva para equipos que necesitan capacidades de agente de codificación sin depender de infraestructura masiva. Su licencia MIT, sin restricciones regionales, facilita su adopción tanto en entornos comerciales como de investigación. Los benchmarks publicados muestran resultados destacados en Terminal-Bench 2.1 y SWE-bench Verified, superando a modelos de tamaño comparable como Qwen3.5-9B y Gemma4-12B en tareas de codificación agéntica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (9B-Dense), post-entrenado sobre Gemma 4 / Qwen 3.5 (base exacta no especificada) |
| Parametros totales | ~9 mil millones (el dato de safetensors proporcionado, 1.469.680, es inconsistente con la denominación 9B; se considera no fiable) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (varias cuantizaciones disponibles en el repositorio ornith-ai/Ornith-1.0-9B-GGUF) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Ornith-1.0-9B es un modelo transformer denso de aproximadamente 9 mil millones de parámetros, post-entrenado sobre las arquitecturas base de Gemma 4 y Qwen 3.5. Aunque la model card no especifica cuál de las dos bases se utiliza para la variante 9B, la familia completa incluye versiones densas de 9B y 31B, así como versiones MoE de 35B y 397B, todas orientadas a codificación agéntica.

La innovación principal reside en su marco de entrenamiento auto-mejorable basado en aprendizaje por refuerzo. El modelo aprende a generar no solo los rollouts de solución, sino también el scaffold (andamiaje) que impulsa esos rollouts. Al optimizar conjuntamente el scaffold y la solución resultante, el modelo descubre mejores trayectorias de búsqueda y produce soluciones de mayor calidad. Este enfoque es particularmente relevante para tareas agénticas donde la estrategia de exploración es tan importante como la generación final de código.

## Capacidades

- Generación de código y razonamiento agéntico: el modelo está especializado en tareas de codificación que requieren planificación multi-paso y ejecución de acciones en entornos de terminal.
- Soporte de tool calling y function calling: al ser un modelo agéntico, está diseñado para interactuar con herramientas y entornos de línea de comandos, como se refleja en su rendimiento en Terminal-Bench 2.1.
- Razonamiento multi-step: optimizado para descomponer problemas complejos en pasos intermedios y explorar múltiples trayectorias de solución.
- Auto-mejora mediante RL: el modelo es capaz de generar su propio scaffold de razonamiento, lo que le permite adaptar su estrategia de búsqueda según el problema.
- Capacidades multilingües: no se han publicado datos específicos sobre idiomas soportados, aunque al estar basado en Gemma 4 y Qwen 3.5, es probable que herede capacidades multilingües de estas bases.
- Integración con pipelines de agentes: compatible con frameworks de agentes que requieren generación de código y ejecución de comandos.

## Casos de uso

- Desarrollo de agentes autónomos de codificación: el modelo puede integrarse en sistemas que resuelven issues de GitHub de forma autónoma, como se demuestra en SWE-bench Verified con una puntuación de 69.4. Un equipo de desarrollo podría desplegarlo para triar y resolver bugs menores sin intervención humana.
- Asistente de programación en terminal: gracias a su rendimiento en Terminal-Bench 2.1 (43.1 en Terminus-2), el modelo puede actuar como copiloto que ejecuta comandos, interpreta salidas y sugiere correcciones en tiempo real dentro de un entorno de línea de comandos.
- Automatización de refactorización de código: el modelo puede analizar repositorios, identificar patrones de deuda técnica y generar parches de refactorización, aprovechando su capacidad de razonamiento multi-paso y generación de código.
- Generación de tests y verificación: puede crear suites de pruebas unitarias y de integración a partir de descripciones de funcionalidad, así como verificar la corrección de código existente mediante ejecución en sandbox.
- Integración en pipelines de CI/CD: el modelo puede actuar como un revisor automático de pull requests, generando comentarios sobre posibles errores, mejoras de rendimiento y cumplimiento de estándares de estilo.
- Educación y formación en programación: al ser un modelo de 9B con licencia MIT, puede desplegarse en entornos educativos para generar ejercicios, explicar soluciones y evaluar código de estudiantes de forma interactiva.

## Benchmarks y rendimiento

Los siguientes resultados han sido publicados por el equipo de DeepReinforce AI en la model card del modelo. Se comparan con modelos de tamaño similar o superior.

| Benchmark | Ornith-1.0-9B | Qwen3.5-9B | Qwen3.5-35B | Gemma4-12B | Gemma4-31B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 43.1 | 21.3 | 41.4 | 21.0 | 42.1 |
| Terminal-Bench 2.1 (Claude Code) | 40.6 | 18.9 | 38.9 | - | - |
| SWE-bench Verified | 69.4 | 53.2 | 70.0 | 44.2 | 52.0 |
| SWE-bench Pro | 42.9 | 31.3 | 44.6 | 27.6 | 35.7 |
| SWE-bench Multilingual | (dato no disponible en la información proporcionada) | - | - | - | - |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo denso de ~9B parámetros, se estima aproximadamente 18 GB en FP16, 9-10 GB en INT8 y 5-6 GB en INT4 (cuantizaciones GGUF).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16; GPUs con 8-12 GB (como RTX 3080, RTX 4070) para cuantizaciones INT4/INT8.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo con 12 GB o más si se utiliza cuantización GGUF.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, y transformers estándar.
- Latencia y throughput: no se han publicado datos específicos de latencia o throughput. Para un modelo de 9B en una RTX 4090, se puede esperar una generación de aproximadamente 30-50 tokens/s en FP16, y mayor con cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Terminal-Bench 2.1 (Terminus-2) | Licencia |
|---|---|---|---|---|---|
| Ornith-1.0-9B | ~9B denso | No disponible | 69.4 | 43.1 | MIT |
| Qwen3.5-9B | ~9B denso | No disponible | 53.2 | 21.3 | No disponible |
| Gemma4-12B | ~12B denso | No disponible | 44.2 | 21.0 | No disponible |

Ornith-1.0-9B supera claramente a Qwen3.5-9B y Gemma4-12B en los benchmarks de codificación agéntica publicados, a pesar de tener un tamaño similar o inferior. La diferencia es especialmente notable en Terminal-Bench 2.1, donde duplica el rendimiento de ambos competidores. Su licencia MIT es más permisiva que la de muchos modelos propietarios o con restricciones.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado evaluaciones de sesgos para este modelo. Al estar especializado en codificación, puede presentar sesgos en la generación de código según los lenguajes y estilos predominantes en sus datos de entrenamiento.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar código incorrecto o inventar APIs y funciones que no existen. Se recomienda verificación humana en entornos de producción.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, lo que dificulta evaluar su capacidad para manejar repositorios grandes o conversaciones largas.
- Limitaciones de idioma: no se han publicado datos sobre los idiomas soportados. Aunque probablemente herede capacidades multilingües de Gemma 4 y Qwen 3.5, esto no está confirmado.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero se debe verificar que los pesos base (Gemma 4 y Qwen 3.5) no tengan restricciones adicionales que afecten al modelo derivado.
- Dato de parámetros inconsistente: el número de parámetros reportado en safetensors (1.469.680) no coincide con la denominación 9B del modelo. Se recomienda verificar la integridad de los pesos antes de su uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ornith-ai/Ornith-1.0-9B
- Repositorio GGUF: https://huggingface.co/ornith-ai/Ornith-1.0-9B-GGUF
- Repositorio en GitHub: https://github.com/ornith-ai/Ornith-1
- Blog de Ornith: https://deep-reinforce.com/ornith.html
- Página del modelo en BenchLM: https://benchlm.ai/models/ornith-1-0-9b
- Página del modelo en There's An AI For That: https://theresanaiforthat.com/model/ornith-1-0-9b/
