# pragmaticcs/Qwen-35B-A3B-SignOfFour-Coder-GGUF

## Resumen

Qwen-35B-A3B-SignOfFour-Coder es un modelo de lenguaje de tipo mezcla de expertos (MoE) obtenido mediante la fusión de cuatro modelos de la familia Qwen 35B-A3B. Lo publica el usuario pragmaticcs en Hugging Face bajo licencia Apache 2.0, y se distribuye exclusivamente en formato GGUF para inferencia con llama.cpp y derivados. El modelo parte de la arquitectura Qwen 35B-A3B, con 34.660.610.688 parámetros totales y unos 3.000 millones de parámetros activos por token, y está orientado a ingeniería de software, síntesis de código y ejecución de herramientas en entornos agénticos.

La relevancia del modelo reside en su método de construcción: no es un fine-tune sobre una única base, sino una fusión DARE-TIES de cuatro modelos especializados, con la base Jackrong/Qwopus3.6-35B-A3B-Coder como ancla y tres donantes (Ornith-1.5-35B-A3B, KAT-Coder-V2.5-Dev y Qwen-AgentWorld-35B-A3B) que aportan capacidades complementarias de razonamiento, código y uso de herramientas. El autor aplica además un escalado sinusoidal por profundidad de capa que concentra la transferencia de tarea en las capas intermedias (12 a 28).

El resultado es un modelo de propósito específico para tareas de código y agentes, con los pesos de visión multimodal y las cabezas de predicción multi-token (MTP) eliminados deliberadamente para reducir el consumo de VRAM y maximizar el throughput. Solo soporta inglés y chino, y su uso previsto es la generación de texto y código, no el razonamiento multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE causal con atención híbrida Gated DeltaNet (atención lineal); 40 capas decodificadoras |
| Parametros totales | 34.660.610.688 (aproximadamente 35B) |
| Parametros activos | Aproximadamente 3B por token |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (el repositorio incluye múltiples cuantizaciones; el listado exacto no está detallado en la información disponible) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 388,4 GB con múltiples archivos de cuantización) |

Especificaciones adicionales declaradas por el autor: 256 expertos enrutados, 1 experto compartido, atención Gated DeltaNet híbrida lineal, y algoritmo de fusión DARE-TIES con escalado sinusoidal por profundidad.

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen 35B-A3B (tipo `qwen3_5_moe`), un transformer causal con mezcla de expertos de 256 expertos enrutados y un experto compartido, distribuidos en 40 capas decodificadoras. La atención es híbrida Gated DeltaNet, una variante de atención lineal con estado recurrente que reduce el coste computacional frente a la atención completa en contextos largos. No se ha realizado un entrenamiento desde cero: el modelo es el resultado de una fusión de pesos.

La metodología de fusión parte de un ancla W₀ (Qwopus3.6-35B-A3B-Coder, α = 1,00) y calcula vectores de tarea Δₖ = Dₖ − W₀ para cada donante. Sobre esos deltas se aplica poda DARE con máscara de Bernoulli y resecalado por p⁻¹, seguida de elección de signo TIES mediante voto ponderado por α, descartando las actualizaciones que contradicen el signo consenso antes de promediar. La reconstrucción final es W_final = W₀ + λ(l)·Δ_TIES, con λ(l) = β·(0,5 + 0,5·sin(π·l/39)), de modo que las proyecciones de entrada y salida quedan cerca de la base y la transferencia de tarea se concentra en las capas 12 a 28.

Los pesos de los donantes son 0,30 para Ornith-1.5-35B-A3B, 0,25 para KAT-Coder-V2.5-Dev y 0,20 para Qwen-AgentWorld-35B-A3B. La política de fusión es estratificada por tipo de parámetro: embeddings, LM head, normas, biases, estado recurrente DeltaNet y router MoE se mantienen lineales (β = 1,00); el experto compartido usa DARE-TIES con densidad 0,70 y β = 0,60; las proyecciones de atención, densidad 0,75 y β = 0,60; y los 256 expertos enrutados, densidad 0,65 y β = 0,55. No se documenta en la información disponible ninguna fase de RLHF, DPO o entrenamiento adicional posterior a la fusión.

## Capacidades

- Generación de texto y código en inglés y chino.
- Razonamiento de varios pasos orientado a tareas de programación.
- Síntesis de código y consolidación de capacidades de ingeniería de software, según el objetivo declarado del merge.
- Ejecución agéntica de herramientas (tool calling / function calling), heredada del donante Qwen-AgentWorld-35B-A3B.
- Flujos agénticos multi-paso y uso de herramientas en pipelines automatizados.
- Conversación multi-turno (etiqueta `conversational` en Hugging Face).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No soporta visión: los pesos multimodales fueron eliminados explícitamente.
- No soporta audio ni otras modalidades.
- No se documenta un modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Asistencia de programación en IDE: el modelo puede completar funciones, generar tests y explicar código en inglés o chino, aprovechando su especialización en síntesis de código y su bajo número de parámetros activos (3B) para mantener latencias bajas en inferencia interactiva.
- Automatización de revisiones de código en CI/CD: con soporte de tool calling, puede invocarse desde pipelines para analizar diffs, sugerir correcciones y consultar herramientas externas (linters, ejecutores de tests) como parte de un agente.
- Agentes de resolución de incidencias: su herencia de Qwen-AgentWorld permite encadenar pasos de razonamiento y llamadas a herramientas para diagnosticar fallos, consultar logs o abrir tickets mediante APIs.
- Generación de código en producción con GGUF: al distribuirse en formato GGUF, puede desplegarse con llama.cpp u Ollama en infraestructura propia sin dependencia de frameworks propietarios, lo que facilita su integración en entornos con requisitos de soberanía de datos.
- Migración y refactorización de bases de código: la ventana de contexto (no documentada) y la atención lineal DeltaNet están pensadas para procesar secuencias largas con coste reducido, lo que encaja con tareas de reescritura de módulos completos.
- Documentación técnica bilingüe: puede redactar documentación y comentarios en inglés y chino, útil en equipos distribuidos entre ambos idiomas.
- Sustitución de modelos mayores en tareas de código acotadas: con 3B de parámetros activos, es una opción para entornos donde un modelo denso de 30B o más no cabe en el hardware disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia orientativa basada en el tamaño del modelo (35B totales), las cuantizaciones GGUF de 4 bits requerirían del orden de 20-22 GB, las de 5-6 bits entre 25 y 30 GB, y las de 8 bits alrededor de 37 GB; estas cifras son estimaciones por tamaño y no datos publicados por el autor.
- GPU recomendadas: no disponibles. Por tamaño, una RTX 4090 (24 GB) podría alojar cuantizaciones de 4 bits; configuraciones de mayor precisión requerirían A100 (40/80 GB), H100 o múltiples GPU consumer.
- Cabe en GPU consumer: probablemente en cuantizaciones de 4 bits en GPUs de 24 GB, aunque no está confirmado en la información disponible.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio) por el formato GGUF; también es compatible con endpoints según las etiquetas del repositorio. vLLM y TGI no están confirmados para este formato.
- Latencia y throughput: no disponibles. El autor indica que la eliminación de pesos de visión y cabezas MTP busca maximizar el throughput en tareas de código, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen-35B-A3B-SignOfFour-Coder | 34,66B / ~3B | No disponible | Apache 2.0 | GGUF | Fusión DARE-TIES de 4 modelos; solo texto; en/zh |
| Jackrong/Qwopus3.6-35B-A3B-Coder | ~35B / ~3B | No disponible | No disponible en la información | No disponible | Ancla base del merge; especializado en código |
| Kwaipilot/KAT-Coder-V2.5-Dev | ~35B / ~3B | No disponible | No disponible en la información | No disponible | Donante con peso 0,25; orientado a código |
| Qwen/Qwen-AgentWorld-35B-A3B | ~35B / ~3B | No disponible | No disponible en la información | No disponible | Donante con peso 0,20; orientado a agentes y tool calling |

No se dispone de datos de benchmarks que permitan comparar el rendimiento efectivo frente a estas alternativas.

## Limitaciones y advertencias

- Solo soporta inglés y chino; no hay soporte documentado para castellano ni otras lenguas.
- No es multimodal: los pesos de visión fueron eliminados, por lo que no puede procesar imágenes.
- La longitud de contexto no está documentada, lo que impide planificar su uso en tareas que requieran ventanas largas sin una verificación previa.
- Al ser una fusión de pesos sin entrenamiento posterior documentado, puede heredar sesgos y comportamientos de los cuatro modelos de origen, incluidos los de sus datasets de entrenamiento respectivos.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de código donde puede inventar APIs o funciones inexistentes; se recomienda validación automática de la salida.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos base y donantes, que no están detalladas en la información disponible.
- El repositorio ocupa 388,4 GB por incluir múltiples cuantizaciones; la descarga completa no es necesaria, pero requiere seleccionar el archivo adecuado.
- El autor promociona un Patreon con acceso anticipado a nuevos modelos; esto no afecta a la licencia del modelo actual, pero indica que el soporte y las actualizaciones pueden depender de canales externos.
- No hay resultados de benchmarks publicados, por lo que las afirmaciones sobre capacidades de código y agentes provienen de la metodología de fusión y no de evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pragmaticcs/Qwen-35B-A3B-SignOfFour-Coder-GGUF
- Modelo en precisión completa (referenciado en la model card): https://huggingface.co/pragmaticcs/Qwen-35B-A3B-SignOfFour-Coder
- Modelo base ancla: https://huggingface.co/Jackrong/Qwopus3.6-35B-A3B-Coder
- Donante Ornith-1.5-35B-A3B: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Donante KAT-Coder-V2.5-Dev: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Donante Qwen-AgentWorld-35B-A3B: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Patreon del autor: https://patreon.com/pragmaticcs
- Modelo destacado por el autor (MiMo-HERO-UIUX-Designer-9B-GGUF): https://huggingface.co/pragmaticcs/MiMo-HERO-UIUX-Designer-9B-GGUF
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
