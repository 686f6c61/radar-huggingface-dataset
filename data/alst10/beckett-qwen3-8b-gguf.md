# alst10/beckett-Qwen3-8B-gguf

## Resumen

El modelo `alst10/beckett-Qwen3-8B-gguf` es un ajuste fino del modelo Qwen3-8B de Alibaba, especializado en la generación de obras teatrales al estilo del dramaturgo irlandés Samuel Beckett. El autor, alst10, ha aplicado un proceso de entrenamiento en dos fases: primero una continuación del preentrenamiento (CPT) sobre la obra dramática completa de Beckett para absorber su vocabulario y estilo minimalista característico, y después un ajuste fino supervisado (SFT) sobre guiones teatrales para aprender la estructura formal de la escritura de obras (nombres de personajes, acotaciones, diálogos).

El resultado se distribuye en formato GGUF cuantizado a Q4_K_M, pensado para ejecutarse en hardware de consumo mediante llama.cpp o interfaces compatibles como LM Studio, Ollama o text-generation-webui. Con 8.190 millones de parámetros, el modelo hereda la arquitectura y capacidades generales de Qwen3-8B, pero su valor diferencial reside en la especialización estilística y estructural para teatro beckettiano. Su relevancia actual radica en la creciente demanda de modelos literarios especializados que puedan asistir a dramaturgos, estudiantes y profesionales del teatro en la creación de textos con una voz autoral reconocible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-8B, 36 capas, atención con QKV bias, GQA) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen3-8B) |
| Tipos de cuantizacion | GGUF Q4_K_M (única versión publicada en este repositorio) |
| Idiomas soportados | No disponible (el modelo base soporta multilingüe, pero el ajuste fino se centra en inglés literario) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-8B: un transformer decoder-only con 36 capas, atención multi-cabeza con Grouped Query Attention (GQA), y una longitud de contexto nativa de 32.768 tokens. Qwen3-8B incorpora un mecanismo de modo de pensamiento conmutable (thinking mode) que permite alternar entre razonamiento profundo y respuesta rápida, aunque el ajuste fino de este modelo se centra en la generación de texto teatral, no en razonamiento general.

El entrenamiento se realizó en dos fases, tal como describe la model card:

1. **CPT (Continued Pre-Training):** el modelo absorbió la obra dramática completa de Samuel Beckett para aprender su vocabulario, sus patrones sintácticos y su estilo minimalista y existencialista.
2. **SFT (Supervised Fine-Tuning):** se ajustó sobre guiones teatrales para aprender las convenciones estructurales de la escritura dramática: formato de diálogos, nombres de personajes, acotaciones escénicas y ritmo de las escenas.

El framework utilizado fue Unsloth, conocido por su eficiencia en el ajuste fino de modelos grandes. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de texto teatral en el estilo de Samuel Beckett, incluyendo diálogos, monólogos y acotaciones escénicas.
- Comprensión y reproducción de la estructura formal de guiones teatrales (nombres de personajes, indicaciones de escena, formato de diálogo).
- Replicación del vocabulario y registros lingüísticos característicos de Beckett: minimalismo, repetición, humor negro, temas existenciales.
- Generación de escenas completas a partir de una premisa o instrucción en lenguaje natural (por ejemplo, "escribe una escena corta al estilo de Beckett donde dos personajes esperan un tren").
- Capacidades generales de Qwen3-8B heredadas: generación de texto, razonamiento básico, soporte multilingüe y modo de pensamiento, aunque el ajuste fino puede haber degradado parcialmente estas capacidades en favor de la especialización teatral.
- No se indica soporte para tool calling, function calling, visión, audio ni capacidades de agente específicas más allá de las del modelo base.

## Casos de uso

- **Creación de obras de teatro originales:** un dramaturgo puede solicitar al modelo un borrador de escena con personajes, diálogos y acotaciones al estilo beckettiano, sirviendo como punto de partida para su propio trabajo creativo.
- **Ejercicios de escritura para estudiantes de literatura:** profesores pueden generar ejemplos de texto con características estilísticas de Beckett para que los alumnos los analicen, comparen o transformen, facilitando la enseñanza de la dramaturgia del siglo XX.
- **Producción teatral experimental:** compañías de teatro independientes pueden usar el modelo para generar material de improvisación o textos breves que sirvan como base para performances, sin necesidad de encargar un dramaturgo.
- **Investigación en estilometría y generación literaria:** investigadores en humanidades digitales pueden utilizar el modelo como referencia para estudiar la reproducción automática de estilos autorales y comparar su producción con el corpus original de Beckett.
- **Asistente de escritura para adaptaciones:** guionistas que trabajen en adaptaciones de obras de Beckett o en piezas inspiradas en su universo pueden emplear el modelo para generar variaciones de diálogos o escenas alternativas manteniendo la coherencia estilística.
- **Generación de contenido para audiolibros o podcasts dramatizados:** creadores de contenido pueden generar guiones breves al estilo de Beckett para producciones de audio, aprovechando la estructura teatral que el modelo reproduce.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Dado que se trata de un ajuste fino especializado en literatura, los benchmarks generales de razonamiento o código probablemente no reflejarían su rendimiento real en la tarea para la que fue entrenado. Se recomienda evaluar el modelo mediante pruebas cualitativas de generación teatral.

## Requisitos de hardware

- **VRAM estimada para inferencia:** el archivo GGUF Q4_K_M de un modelo de 8B parámetros ocupa aproximadamente 4,7-5 GB, por lo que puede ejecutarse en GPUs con 6 GB de VRAM o más.
- **GPU recomendadas:** NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 o superiores. También funciona en GPUs más antiguas con suficiente VRAM, como la RTX 2080 Ti.
- **CPU:** puede ejecutarse únicamente en CPU con 16 GB de RAM, aunque la velocidad será considerablemente menor.
- **Opciones de despliegue:** llama.cpp (CLI y servidor), Ollama, LM Studio, text-generation-webui, KoboldCpp y cualquier frontend compatible con GGUF.
- **Latencia y throughput:** no se dispone de datos medidos específicamente para este modelo. Como referencia, un Q4_K_M de 8B en una RTX 4090 suele generar entre 40 y 60 tokens por segundo con llama.cpp, y entre 10 y 20 tokens por segundo en una RTX 3060. En CPU pura, la velocidad puede caer a 2-5 tokens por segundo dependiendo del procesador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| alst10/beckett-Qwen3-8B-gguf | 8,19 B | 32.768 | Teatro beckettiano | Apache-2.0 | GGUF Q4_K_M |
| Qwen/Qwen3-8B (base) | 8,19 B | 32.768 | Modelo general multilingue | Apache-2.0 | Safetensors, GGUF |
| Qwen/Qwen3-8B-GGUF | 8,19 B | 32.768 | Modelo general (cuantizado) | Apache-2.0 | GGUF (varias cuantizaciones) |

No se han encontrado otros modelos públicos especializados en el estilo de Samuel Beckett o en teatro de vanguardia con los que comparar directamente. La comparativa más relevante es con el modelo base Qwen3-8B: el ajuste fino sacrifica parte de la versatilidad general en favor de una mayor fidelidad estilística y estructural en la generación teatral. Frente a otros modelos literarios genéricos (por ejemplo, ajustes finos sobre novelas o poesía), este se distingue por su foco exclusivo en el género dramático y en un autor concreto.

## Limitaciones y advertencias

- **Sesgos estilísticos:** el modelo está fuertemente sesgado hacia el estilo de Beckett, lo que puede producir textos que imiten sus temas recurrentes (absurdo, soledad, espera, muerte) incluso cuando la instrucción no lo solicita explícitamente.
- **Riesgo de alucinación:** como cualquier modelo de lenguaje, puede inventar citas, referencias o nombres de obras que no existen en el corpus de Beckett. No debe utilizarse como fuente factual sobre la obra del autor.
- **Limitaciones de idioma:** aunque el modelo base es multilingüe, el ajuste fino se realizó presumiblemente sobre textos en inglés (la obra de Beckett está mayoritariamente en inglés y francés). La generación en otros idiomas puede ser de menor calidad.
- **Degradación de capacidades generales:** el ajuste fino especializado puede haber reducido el rendimiento en tareas de razonamiento, código o matemáticas respecto al modelo base. No se recomienda para usos fuera del ámbito literario.
- **Restricciones de licencia:** la licencia Apache-2.0 permite uso comercial, modificación y redistribución, pero se debe conservar el aviso de licencia y atribución. No hay restricciones conocidas adicionales.
- **Cobertura limitada del corpus:** la model card indica que el modelo absorbió la "obra dramática completa" de Beckett, pero no especifica qué ediciones o traducciones se usaron, ni si incluye obras en francés original o solo las versiones inglesas.
- **Cuantización única:** solo se publica la versión Q4_K_M, que puede perder algo de fidelidad respecto al modelo completo en safetensors. Si se necesita mayor precisión, habría que cuantizar desde el modelo original (no disponible en este repositorio).

## Enlaces

- Repositorio del modelo: https://huggingface.co/alst10/beckett-Qwen3-8B-gguf
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Versión GGUF oficial de Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B-GGUF
- Descripción de Qwen3-8B-GGUF (aimodels.fyi): https://www.aimodels.fyi/models/huggingFace/qwen3-8b-gguf-qwen
- Directorio de descubrimiento de modelos GGUF: https://local-ai-zone.github.io/
- Ficha de Qwen3-8B en AIBase: https://model.aibase.com/models/details/1980507641646157824
