# fairy322/Qwen3-24B-A4B-Freedom-Thinking-Abliterated-Heretic-NEO-Imatrix-GGUF

## Resumen

Qwen3-24B-A4B-Freedom-Thinking-Abliterated-Heretic-NEO-Imatrix-GGUF es un modelo de lenguaje de mezcla de expertos (MoE) densa, creado por DavidAU y publicado en HuggingFace por fairy322. Se trata de un merge de seis modelos Qwen3-4B, cada uno de ellos un fine-tune con destilados de modelos de razonamiento de gran tamaño (Claude, Gemini, Polaris), a los que se ha aplicado la tecnica de "abliteracion" mediante la herramienta Heretic para eliminar el rechazo de peticiones y el alineamiento de seguridad. El resultado es un modelo sin censura, orientado a escritura creativa, rol y generacion de contenido explicito, con una tasa de rechazo media de 15/100.

La arquitectura es un MoE denso con 6 expertos de 4B cada uno, activando solo uno por defecto aunque se pueden activar hasta los seis para obtener mas capacidad de razonamiento. El contexto es de 256K tokens y el peso real del modelo es de 17.471.008.256 parametros, menor que un 24B tipico debido a la compresion durante el proceso de fusion. Esta disponible en formato GGUF con cuantizaciones imatrix, lo que permite ejecutarlo en GPUs de gama media e incluso en CPU.

Su relevancia radica en que ofrece un modelo sin restricciones con capacidades de razonamiento avanzadas, gracias a los destilados de modelos de primer nivel, manteniendo ademas un bloque de "thinking" comprimido y detallado que planifica antes de responder. Es una opcion para quienes necesitan un modelo libre de censura para escritura creativa, rol o generacion de contenido sin filtros, con la flexibilidad de ajustar el numero de expertos activos segun la potencia disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE denso (6 expertos de 4B), transformer con bloque de razonamiento |
| Parametros totales | 17.471.008.256 (real, en safetensors); el nombre indica 24B-A4B |
| Parametros activos | 4B por experto; 1 experto activo por defecto, hasta 6 configurables |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | GGUF con imatrix (Q4, IQ, y variantes; no se especifican todas las disponibles) |
| Idiomas soportados | Ingles (primario); otros no especificados |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado), safetensors (original) |

## Arquitectura y entrenamiento

El modelo es un MoE denso compuesto por seis expertos, cada uno basado en Qwen3-4B con diferentes fine-tunes: Jan-v1-4B, Apollo-V0.1-4B-Thinking, Claude-Sonnet-4-Reasoning-Distill, Thinking-2507-Claude-4.5-Opus-High-Reasoning-Distill, Thinking-2507-Gemini-3-Pro-Preview-High-Reasoning-Distill, Thinking-2507-Gemini-2.5-Flash-Lite-Preview-Distill e Instruct-2507-Polaris-Alpha-Distill. Cada experto fue "abliterado" con la herramienta Heretic, que implementa ablation direccional (abliteration) con optimizacion de hiperparametros basada en TPE mediante Optuna. El proceso elimina el alineamiento de seguridad sin post-entrenamiento costoso.

El experto "capitan" es el primero de la lista (Jan-v1-4B), y los demas contribuyen a la seleccion de tokens de forma conjunta. El modelo conserva la funcion completa de los expertos, solo sin el "nanny" de seguridad. El bloque de razonamiento es mas pequeno de lo habitual, con pensamientos comprimidos y detallados que elaboran un plan denso antes de responder. Segun el autor, la compresion durante el proceso de fusion reduce el tamano real del modelo por debajo de un 24B tipico. No se especifican los datos de entrenamiento del merge ni el numero de tokens usados.

## Capacidades

- Generacion de texto sin censura ni rechazo de peticiones, incluyendo contenido explicito, violencia, horror, erotismo y lenguaje soez.
- Razonamiento y modo "thinking": el modelo elabora un plan detallado y comprimido antes de generar la respuesta.
- Capacidad de ajustar el numero de expertos activos (1 a 6) para escalar la potencia de calculo segun la tarea.
- Escritura creativa y narrativa: ficcion, ciencia ficcion, romance, todos los generos, con prosa vivida y detallada.
- Seguimiento de instrucciones preciso: el autor indica que sigue instrucciones explicitas mejor que la mayoria de los modelos, lo que permite controlar el nivel de detalle, violencia o contenido explicito.
- Generacion de codigo, matematicas de nivel universitario (incluyendo mecanica orbital y matematicas de master) y tutoria.
- Capacidades multilingues limitadas: la ficha tecnica solo lista ingles como idioma soportado.
- Soporte de roleplaying y continuacion de escenas.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar ficcion, ciencia ficcion, romance, terror y otros generos con prosa vivida y sin rechazos. Es adecuado para autores que necesitan explorar temas adultos o controvertidos sin limitaciones de censura.
- Roleplaying y narracion interactiva: gracias a su capacidad de seguir instrucciones precisas y generar dialogos y escenas detalladas, puede usarse como narrador o companero de rol en juegos de texto, manteniendo coherencia en contextos largos de hasta 256K tokens.
- Generacion de contenido explicito para ficcion adulta: el modelo esta especificamente disenado para no rechazar peticiones de contenido NSFW, erotico o violento. Requiere que el usuario especifique el nivel de detalle y el "slang" deseado para obtener el tono adecuado.
- Asistente de programacion sin filtros: puede generar codigo, explicar algoritmos y resolver problemas de matematicas avanzadas sin las restricciones habituales de los modelos alineados, util para desarrolladores que necesitan respuestas directas y sin evasivas.
- Tutor personalizado para temas avanzados: con su capacidad de razonamiento y los destilados de modelos de primer nivel, puede explicar conceptos de mecanica orbital, matematicas de nivel master o fisica, adaptando el nivel de detalle al usuario.
- Generacion de subtramas y desarrollo de personajes: el modelo puede crear tramas secundarias, continuar escenas y desarrollar personajes complejos, util para escritores que necesitan inspiracion o ayuda para superar bloqueos creativos.
- Prototipado rapido de agentes conversacionales sin moderacion: para proyectos de investigacion que requieren un modelo sin filtros de seguridad, como estudios sobre sesgos, alucinaciones o comportamiento de modelos no alineados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye datos de MMLU, HumanEval, GSM8K u otras evaluaciones estandarizadas. Los unicos datos de rendimiento mencionados son:

| Metrica | Valor |
|---|---|
| Tasa de rechazo media | 15/100 (frente a 90/100 en modelos estandar) |
| KLD medio (divergencia Kullback-Leibler) | 0.05 (0 es perfecto, <1 es excelente) |
| Velocidad de inferencia (GPU, 1 experto) | 80+ tokens/s |
| Velocidad de inferencia (CPU, 1 experto) | 10-20 tokens/s |

## Requisitos de hardware

- VRAM estimada: no se especifica directamente, pero el autor indica que los cuantizados Q4/IQ funcionan en GPUs de gama media o baja. Con 17.47B de parametros reales, un cuantizado Q4 requiere aproximadamente 9-10 GB de VRAM, y un IQ2 o IQ3 puede caber en 6-8 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 o cualquier GPU con 10-24 GB de VRAM dependiendo de la cuantizacion y el numero de expertos activos.
- Compatibilidad con GPU de consumo: si, con cuantizaciones Q4 o inferiores en GPUs de 8-12 GB. Con 1 experto activo, el modelo funciona en GPUs de gama media; activando mas expertos se incrementa el uso de memoria.
- Opciones de despliegue: formato GGUF compatible con llama.cpp, Ollama, LM Studio, KoboldCpp y otros motores que soporten GGUF. Para despliegue en produccion, puede usarse vLLM o TGI con conversion previa.
- Latencia y throughput: 80+ tokens/s en GPU con 1 experto activo; 10-20 tokens/s en CPU. No se especifican datos para multiples expertos activos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-24B-A4B-Freedom (este) | 17.47B (MoE 6x4B) | 256K | Apache 2.0 | Sin censura, razonamiento, escritura creativa |
| Qwen3-30B-A3B-Instruct | 30B (MoE 3B activos) | 128K | Apache 2.0 | Alineado, razonamiento, multilingue |
| Qwen3-32B | 32B densos | 128K | Apache 2.0 | Alineado, razonamiento, multilingue |
| Llama-3.1-8B-Instruct | 8B densos | 128K | Llama 3.1 | Alineado, proposito general |

La comparativa directa es limitada porque este modelo es una fusion de multiples fine-tunes abliteados, no un modelo original. Frente a los Qwen3 estandar, ofrece la ventaja de no tener censura y un contexto mayor, pero carece de soporte multilingue confirmado y de benchmarks publicados. El modelo base Qwen3-4B es notablemente mas pequeno, lo que facilita su ejecucion en hardware modesto.

## Limitaciones y advertencias

- Contenido sin filtrar: el modelo puede generar contenido explicito, violento, ofensivo o ilegal. No es apto para menores ni para uso en entornos donde se requiera moderacion de contenido.
- Riesgo de alucinacion: al ser un modelo abliterado, puede generar afirmaciones falsas o inventadas con mayor confianza, especialmente en temas factuales, al no tener el freno del alineamiento.
- Idioma limitado: solo se confirma soporte para ingles. El rendimiento en otros idiomas no esta documentado y puede ser deficiente.
- Sesgos: el proceso de abliteracion no elimina los sesgos del modelo base; puede perpetuar estereotipos o generar contenido discriminatorio sin filtros.
- Requiere instrucciones explicitas: el autor advierte que para obtener contenido con el nivel de detalle, violencia o explicitud deseado, es necesario indicar explicitamente el "slang" o las palabras a usar; sin estas directrices, el contenido puede resultar "soso" o demasiado tame.
- Licencia y uso comercial: la licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin censura puede violar las politicas de plataformas de hosting o los terminos de servicio de proveedores cloud.
- Tasa de rechazo residual: aunque la tasa de rechazo se reduce a 15/100, no es cero; el modelo puede negarse a responder en algunos casos.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento en tareas estandarizadas, lo que dificulta la evaluacion comparativa rigurosa.
- Modelo "not-for-all-audiences": el autor etiqueta explicitamente el modelo como no apto para todos los publicos, lo que implica restricciones de distribucion en ciertos contextos.

## Enlaces

- Repositorio HuggingFace (fairy322): https://huggingface.co/fairy322/Qwen3-24B-A4B-Freedom-Thinking-Abliterated-Heretic-NEO-Imatrix-GGUF
- Repositorio original (DavidAU): https://huggingface.co/DavidAU/Qwen3-24B-A4B-Freedom-Thinking-Abliterated-Heretic-NEO-Imatrix-GGUF
- Version HQ NEOMAX: https://huggingface.co/DavidAU/Qwen3-24B-A4B-Freedom-HQ-Thinking-Abliterated-Heretic-NEOMAX-Imatrix-GGUF
- Herramienta Heretic (abliteracion): https://github.com/p-e-w/heretic
- Expertos base:
  - https://huggingface.co/janhq/Jan-v1-4B
  - https://huggingface.co/AllThingsIntel/Apollo-V0.1-4B-Thinking
  - https://huggingface.co/Liontix/Qwen3-4B-Claude-Sonnet-4-Reasoning-Distill-Safetensor
  - https://huggingface.co/TeichAI/Qwen3-4B-Thinking-2507-Claude-4.5-Opus-High-Reasoning-Distill
  - https://huggingface.co/TeichAI/Qwen3-4B-Thinking-2507-Gemini-3-Pro-Preview-High-Reasoning-Distill
  - https://huggingface.co/TeichAI/Qwen3-4B-Thinking-2507-Gemini-2.5-Flash-Lite-Preview-Distill
  - https://huggingface.co/TeichAI/Qwen3-4B-Instruct-2507-Polaris-Alpha-Distill
