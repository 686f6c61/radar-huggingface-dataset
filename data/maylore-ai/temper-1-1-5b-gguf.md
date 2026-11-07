# maylore-ai/Temper-1-1.5B-GGUF

## Resumen

Temper-1-1.5B-GGUF es la versión cuantizada en formato GGUF de Temper-1-1.5B, un modelo de lenguaje de 1.543.714.304 parámetros (aproximadamente 1,5B) especializado en la generación de código Rust. Lo desarrolla maylore-ai y se distribuye bajo licencia Apache 2.0, con el modelo base maylore-ai/Temper-1.5B como referencia. El repositorio GGUF ocupa 1,6 GB y contiene una única cuantización Q8_0 de 1646 MB, pensada para ejecución local mediante llama.cpp u Ollama.

El modelo deriva de Qwen2.5-Coder-1.5B-Instruct, según se desprende de la cláusula de atribución de la licencia (Apache 2.0, sección 4(d)), y ha sido afinado exclusivamente sobre tareas de Rust con peticiones en inglés. Su relevancia actual radica en que ofrece un rendimiento en resolución de tareas Rust comparable a modelos del doble de tamaño: según la model card del modelo base, con diez intentos resuelve el 67,0% de las tareas, frente al 67,4% de Qwen2.5-Coder-3B.

La ficha se centra en la variante GGUF, que es la publicada en este repositorio, aunque los datos de arquitectura y entrenamiento proceden del modelo base y de la información disponible. No se han publicado en la información proporcionada detalles sobre la longitud de contexto, la composición exacta del dataset de entrenamiento ni resultados desglosados por benchmark más allá del dato agregado de resolución de tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (única cuantización publicada) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de una descripción detallada de la arquitectura interna. El modelo base del que deriva, Qwen2.5-Coder-1.5B-Instruct, emplea una arquitectura transformer decoder-only, y Temper-1-1.5B se presenta como un fine-tune de este sobre tareas de Rust. El dato de parámetros totales (1.543.714.304) procede de los safetensors del modelo base.

El entrenamiento se realizó únicamente con tareas de Rust y peticiones formuladas en inglés, según la model card del modelo base. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de código en Rust: especialización principal del modelo, afinado exclusivamente sobre tareas de este lenguaje.
- Resolución de tareas de programación con múltiples intentos: la métrica publicada (67,0% con diez intentos) sugiere capacidad de reintento y corrección iterativa.
- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica soporte de diálogo.
- Seguimiento de instrucciones en inglés: el modelo solo fue entrenado con peticiones en inglés.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse en infraestructuras de inferencia compatibles.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistencia a desarrolladores Rust en el editor: el modelo puede generar fragmentos de código, completar funciones y proponer correcciones en inglés, integrándose en extensiones de IDE que invoquen el endpoint local o remoto.
- Ejecución local en estaciones de trabajo: con una única cuantización Q8_0 de 1646 MB, puede desplegarse con llama.cpp u Ollama en equipos sin GPU dedicada de gran capacidad, lo que facilita prototipado sin coste de API.
- Generación de tests unitarios en Rust: dado su entrenamiento específico en tareas Rust, es adecuado para producir casos de prueba y esqueletos de test que el desarrollador revisa y ajusta.
- Automatización de tareas de refactorización acotadas: el modelo puede recibir un fragmento de código y una instrucción en inglés para reescribirlo, útil en pipelines internos de revisión de código.
- CI/CD con verificación iterativa: su rendimiento medido con diez intentos encaja en flujos donde el modelo propone una solución, se compila y se reintenta con el error de compilación como contexto.
- Educación y formación en Rust: puede usarse como tutor local que explica y genera ejemplos de código Rust en inglés, con la ventaja de ejecutarse en hardware modesto.
- Prototipado de herramientas de código en entornos con requisitos de privacidad: al poder ejecutarse íntegramente en local mediante GGUF, el código del usuario no sale de la máquina.

## Benchmarks y rendimiento

| Benchmark | Temper-1-1.5B | Qwen2.5-Coder-3B |
|---|---|---|
| Tareas Rust resueltas (10 intentos) | 67,0% | 67,4% |

El único dato de rendimiento disponible en la información proporcionada es la tasa de resolución de tareas Rust con diez intentos (67,0%), comparada con Qwen2.5-Coder-3B (67,4%). No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar, ni métricas de latencia o throughput para la variante GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantización Q8_0 (1646 MB de pesos), se necesitan aproximadamente 2 GB de memoria para los pesos, más overhead de contexto y runtime; en la práctica, entre 2,5 y 4 GB según la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM puede ejecutar la variante Q8_0; tarjetas como RTX 3050, RTX 4060, RTX 4090 o superiores son suficientes. También es viable en CPU.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo actuales con 4 GB o más de VRAM.
- Opciones de despliegue: llama.cpp (`llama-cli -hf maylore-ai/Temper-1-1.5B-GGUF:Q8_0`), Ollama (`ollama run hf.co/maylore-ai/Temper-1-1.5B-GGUF:Q8_0` o mediante el `Modelfile` del repositorio). No se documentan en la información disponible otras opciones como vLLM o TGI para esta variante GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en tareas Rust | Licencia | Formato |
|---|---|---|---|---|---|
| Temper-1-1.5B-GGUF | 1,54B | no disponible | 67,0% (10 intentos) | Apache 2.0 | GGUF (Q8_0) |
| Qwen2.5-Coder-3B | 3B (aprox.) | no disponible en la información | 67,4% (10 intentos) | no disponible en la información | no disponible en la información |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B (aprox.) | no disponible en la información | no disponible | Apache 2.0 (según atribución del modelo) | safetensors, GGUF |

La comparación se limita a los datos disponibles. Temper-1-1.5B iguala prácticamente el rendimiento de Qwen2.5-Coder-3B en tareas Rust con la mitad de parámetros, según la model card del modelo base. No se dispone de datos comparativos con otros modelos especializados en Rust.

## Limitaciones y advertencias

- Especialización estrecha: el modelo fue entrenado únicamente con tareas de Rust, por lo que su rendimiento en otros lenguajes de programación o en tareas generales no está documentado y probablemente sea inferior.
- Idioma: solo soporta peticiones en inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Contexto: no se ha publicado la longitud de contexto en la información disponible, lo que impide planificar su uso en tareas que requieran ventanas largas.
- Riesgo de alucinación: como todo modelo generativo de código, puede producir APIs inexistentes, dependencias incorrectas o código que no compila; se recomienda validación mediante compilador y tests.
- Sesgos: no se documentan análisis de sesgos en la información proporcionada.
- Licencia: Apache 2.0 permite uso comercial, pero las obras derivadas, incluidos fine-tunes, merges y cuantizaciones, deben mantener las atribuciones recogidas en el fichero NOTICE (Apache 2.0, sección 4(d)).
- Cuantización única: solo se publica Q8_0; no hay variantes Q4_K_M, Q5_K_M ni otras que reduzcan aún más el uso de memoria para hardware muy limitado.
- Madurez: el repositorio tiene 633 descargas y 1 like, lo que indica una adopción todavía muy limitada y poca validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/maylore-ai/Temper-1-1.5B-GGUF
- Modelo base: https://huggingface.co/maylore-ai/Temper-1-1.5B
- Sitio web del modelo: https://maylore.com/temper-1.5b
