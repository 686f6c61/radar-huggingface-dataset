# andyz321/bio-expert

## Resumen

bio-expert es un modelo de lenguaje de 8.000 millones de parámetros derivado de Qwen3-8B (base) mediante un proceso de destilación de datos de dominio y ajuste fino con QLoRA. Lo desarrolla el usuario independiente andyz321 y está especializado en tres áreas concretas: análisis bioinformático (desde control de calidad hasta interpretación de resultados), construcción de cepas en biología sintética y biomedicina informada por datos genómicos. El modelo se entrenó íntegramente en local sobre una única RTX 3080 Laptop de 16 GB de VRAM.

El modelo resuelve un problema de especialización: en lugar de ofrecer conocimiento genérico, proporciona nombres de herramientas, rangos de parámetros y umbrales concretos en cada paso del flujo bioinformático, así como mecanismos de fallo y orden de resolución de problemas en el diseño de construcciones genéticas. Además, incorpora dos comportamientos entrenados explícitamente: una identidad definida con declaración de límites de competencia y una curiosidad observable que cierra cada respuesta con una pregunta de seguimiento relevante.

La relevancia actual reside en su enfoque de entrenamiento reproducible y de bajo coste: 759 muestras de SFT, destilación desde un modelo profesor (DeepSeek V4 Flash), QLoRA de rango 32 en 4 bits NF4 y una pérdida que baja de 3,16 a 1,30 con un pico de 8,0 GB de VRAM. El repositorio incluye el adaptador, los scripts de entrenamiento, mezcla, evaluación y cuantización, además del corpus de datos, lo que permite reproducir el proceso completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-8B) |
| Parámetros totales | 8.000 millones (aproximado, según modelo base Qwen3-8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (num_ctx 32768) |
| Tipos de cuantización | GGUF q8_0 (8,11 GB); adaptador QLoRA en 4 bits NF4; fusión en bf16 (15,3 GB) |
| Idiomas soportados | no disponible (la model card está en inglés y chino; no se declaran idiomas oficiales) |
| Licencia | no disponible |
| Formato de pesos | GGUF (q8_0), safetensors (adaptador y fusión bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B en su variante base, un transformer decoder-only de 8.000 millones de parámetros. Sobre esa base se aplicó un ajuste fino con QLoRA en 4 bits NF4, con rango LoRA de 32, usando la librería Unsloth. El corpus de entrenamiento consta de 759 muestras de SFT: 555 de dominio y 204 de identidad y curiosidad. Las semillas iniciales fueron 130 temas de tareas reales curados manualmente, que se expandieron mediante destilación desde el modelo profesor DeepSeek V4 Flash en formato de preguntas y respuestas con razonamiento mecanicista, parámetros concretos y nombres de herramientas.

El entrenamiento se ejecutó en una sola máquina con una RTX 3080 Laptop de 16 GB, alcanzando un pico de 8,0 GB de VRAM y reduciendo la pérdida de 3,16 a 1,30. Posteriormente se fusionó el adaptador en bf16 (15,3 GB) y se cuantizó a GGUF q8_0 (8,11 GB). Una innovación metodológica destacable es el tratamiento de la curiosidad como comportamiento observable: el autor documenta que un prefijo de instrucción explícito ("go deeper on this question...") provocó que el modelo aprendiera a reconocer ese prefijo en lugar de a formular preguntas genuinas; la solución fue cambiar la distribución de entrenamiento usando temas desnudos como instrucciones y una regla global en el system prompt como red de seguridad. La identidad se incorporó como verdad fundamental escrita a mano, no generada por el modelo, con declaración explícita de límites en cada respuesta de identidad.

## Capacidades

- Generación de texto especializada en bioinformática: cadena completa desde control de calidad hasta interpretación, incluyendo alineamiento, anotación, cuantificación, expresión diferencial, enriquecimiento, célula única y metagenómica, con nombres de herramientas, rangos de parámetros y umbrales.
- Biología sintética: selección de chasis, diseño de vectores y partes, métodos de ensamblaje, edición por CRISPR knockout, diseño de rutas metabólicas y optimización de títulos, con mecanismos y orden de resolución de fallos en cada paso.
- Biomedicina informada por bioinformática: GWAS y eQTL, genómica del cáncer, interpretación de variantes clínicas según ACMG, ctDNA de biopsia líquida, integración multiómica y aplicaciones de célula única en oncología e inmunología.
- Identidad definida: el modelo conoce su base, su método de construcción y dónde termina su competencia, con declaración explícita de límites.
- Curiosidad entrenada: cierra las respuestas con una pregunta de seguimiento que avanza la comprensión, estructurando la respuesta en tres capas (mecanismo superficial, razón profunda, por qué es así y no de otra forma).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: la model card menciona que "como modelo de agente ha sido verificado", pero el texto está truncado y no se detalla el alcance.
- Capacidades multilingües: no disponible; la model card está en inglés y chino, sin declaración formal de idiomas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Análisis bioinformático de extremo a extremo: el modelo guía la cadena completa desde control de calidad hasta interpretación, proporcionando nombres de herramientas, rangos de parámetros y umbrales concretos, lo que lo hace adecuado para investigadores que necesitan orientación operativa y no solo conceptual.
- Diseño de construcciones en biología sintética: selección de chasis, diseño de vectores y partes, elección de métodos de ensamblaje y planificación de edición CRISPR knockout, con mecanismos y orden de resolución de fallos, útil para laboratorios que planifican experimentos de ingeniería genética.
- Interpretación de variantes clínicas: aplicación de criterios ACMG para clasificación de variantes, con soporte para genómica del cáncer y ctDNA de biopsia líquida, orientado a equipos de genética clínica que necesitan un primer análisis estructurado.
- Integración multiómica: combinación de datos de GWAS, eQTL, expresión y célula única para interpretación biológica, adecuado para grupos de investigación que trabajan con múltiples capas de datos.
- Asistencia en investigación con privacidad: al ejecutarse en local con Ollama o llama.cpp y no requerir conexión, los pesos y las conversaciones no salen de la máquina, lo que permite trabajar con datos sensibles de pacientes o proyectos no publicados.
- Formación y documentación técnica: generación de explicaciones con razonamiento mecanicista y preguntas de seguimiento que profundizan en el tema, útil para materiales docentes o para explorar un problema de investigación paso a paso.
- Reproducción y experimentación metodológica: el repositorio incluye adaptador, scripts y corpus, lo que permite reproducir el entrenamiento, evaluar variantes o adaptar el método a otros dominios con hardware de consumo.

## Benchmarks y rendimiento

La model card presenta una evaluación propia de 25 preguntas con sondas inversas y grupos de sinónimos. No son benchmarks estándar (MMLU, HumanEval, GSM8K) y no se comparan con otros modelos.

| Dimensión | Resultado |
|---|---|
| Tasa de aprobación global | 24 / 25 = 96% |
| Identidad | 8 / 8 = 100% |
| Habilidad de dominio sin regresión | 5 / 5 = 100% |
| Cadena de preguntas de curiosidad | 11 / 12 = 92% |
| Pregunta de seguimiento proactiva al final de las respuestas | 12 / 12 = 100% |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF q8_0 ocupa 8,11 GB, por lo que se necesitan al menos 9-10 GB de VRAM para cargarlo con contexto moderado; el contexto completo de 32K requiere más memoria para la caché KV.
- GPU recomendadas: RTX 3080 Laptop de 16 GB (hardware usado en el entrenamiento y validado para el modelo); cualquier GPU con 12 GB o más puede ejecutar la versión q8_0.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más de VRAM; en 8 GB sería necesario recurrir a cuantizaciones menores, que no se incluyen en el repositorio.
- Opciones de despliegue: Ollama (el repositorio incluye un Modelfile listo para `ollama create`) y llama.cpp (formato GGUF). El adaptador se puede cargar con PEFT y transformers sobre Qwen3-8B y fusionar con `merge_and_unload()`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. La comparación se limita a características estructurales.

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| bio-expert | 8B (base Qwen3-8B) | 32K | Bioinformática, biología sintética, biomedicina | no disponible | GGUF q8_0, safetensors |
| Qwen3-8B (base) | 8B | no disponible en la información | Generalista | no disponible en la información | safetensors |
| DeepSeek V4 Flash (profesor) | no disponible | no disponible | Generalista, usado para destilación | no disponible | no disponible |

La model card advierte explícitamente que el modelo es más débil que los modelos generales en conocimiento general, escritura larga y matemáticas, y que solo lidera dentro de sus tres dominios. No se han publicado comparaciones cuantitativas con alternativas.

## Limitaciones y advertencias

- Sin acceso a internet: no puede consultar NCBI, UniProt o PDB en vivo; los identificadores de acceso, PMIDs y versiones de bases de datos deben verificarse manualmente.
- Sin trabajo de laboratorio húmedo: todas sus salidas son orientación computacional, no protocolos validados experimentalmente.
- No sustituye el juicio clínico: las respuestas sobre interpretación de variantes o biomedicina no deben usarse como decisión clínica.
- Más débil que modelos generales en conocimiento general, escritura larga y matemáticas; solo destaca en sus tres dominios.
- La evaluación es un conjunto propio de 25 preguntas, pequeño, y no demuestra superioridad frente a modelos generales en tareas arbitrarias.
- Riesgo de alucinación en identificadores, referencias bibliográficas y versiones de herramientas, dado que no tiene acceso a fuentes en vivo.
- Licencia no declarada: no se especifican restricciones de uso comercial; debe consultarse con el autor antes de un despliegue en producción.
- Idiomas soportados no declarados formalmente; la model card está en inglés y chino, por lo que el rendimiento en castellano no está verificado.
- Sesgos conocidos: no disponible en la información proporcionada.
- El soporte de tool calling y el alcance como modelo de agente no están detallados (texto truncado en la model card).

## Enlaces

- Hugging Face: https://huggingface.co/andyz321/bio-expert
- README en chino: https://huggingface.co/andyz321/bio-expert/blob/main/README_zh.md
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Resultados de evaluación: https://huggingface.co/andyz321/bio-expert/blob/main/eval_results.json
- System prompt: https://huggingface.co/andyz321/bio-expert/blob/main/system_prompt.txt
- Modelfile de Ollama: https://huggingface.co/andyz321/bio-expert/blob/main/Modelfile
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
