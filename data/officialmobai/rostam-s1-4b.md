# officialmobai/Rostam-S1-4B

## Resumen

Rostam-S1-4B es un modelo de lenguaje de razonamiento y uso agéntico desarrollado por Mob AI (bajo el identificador `officialmobai` en HuggingFace) en colaboración con el proyecto Spark (XHToken). Es un ajuste fino de XHToken/Spark-X2.6-4B, con unos 4.112 millones de parámetros, orientado a matemáticas, física teórica, código científico, cognición bilingüe en persa (farsi) e inglés y sistemas agénticos. Su nombre rinde homenaje al héroe epónico de la literatura épica persa.

El modelo apuesta por una filosofía de "precisión arquitectónica y trazas de razonamiento de alto orden" frente al escalado bruto de parámetros. Entre sus características destacadas figuran un canal de razonamiento profundo controlable mediante etiquetas `<think>`, integración nativa de herramientas (function calling) con ejecución verificable en sandbox, y una adaptación de parámetros aislada por subespacios con regularización de replay persistente, que según el autor evita el olvido catastrófico respecto al modelo base.

Cabe señalar que la model card no publica resultados de benchmarks auditados: las cifras mostradas son objetivos de optimización del currículo de post-entrenamiento, pendientes de un pipeline de evaluación RLVR. Esto convierte a Rostam-S1 en un modelo de seguimiento interesante, pero cuyas capacidades reales deben validarse de forma independiente antes de uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `spark2_5`; transformer causal de generación de texto) |
| Parametros totales | 4.112.079.360 (dato real de safetensors) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (recomendado bfloat16 en el ejemplo de inferencia) |
| Idiomas soportados | inglés (en) y persa/farsi (fa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (57,6 GB de tamaño de repo) |

## Arquitectura y entrenamiento

Rostam-S1-4B es un ajuste fino (finetune) de XHToken/Spark-X2.6-4B, un modelo etiquetado con la arquitectura `spark2_5` y cargable con la librería `transformers` mediante `trust_remote_code=True`, lo que indica que emplea código de modelado personalizado. No se ha publicado información sobre número de capas, dimensiones ocultas, mecanismos de atención concretos ni longitud de contexto.

Sobre el entrenamiento, la model card describe un enfoque de post-entrenamiento basado en tres pilares: razonamiento simbólico verificable (demostraciones matemáticas y derivaciones físicas paso a paso), dominio bilingüe nativo en inglés y persa, y una técnica de adaptación de parámetros aislada por subespacios protegida por regularización de replay persistente para evitar el olvido catastrófico. Se menciona un pipeline de evaluación RLVR (aprendizaje por refuerzo con recompensas verificables) en curso. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso específico de técnicas como SFT, DPO o GRPO.

## Capacidades

- Razonamiento matemático avanzado, incluyendo demostraciones paso a paso y derivaciones físicas, con trazas de razonamiento explícitas.
- Canal de razonamiento profundo controlable mediante etiquetas `<think>`, activable con `enable_thinking=True` en la plantilla de chat, que permite obtener derivaciones analíticas antes de la respuesta final.
- Generación de código científico y simulaciones (dominio SciCode declarado como objetivo).
- Capacidades agénticas: function calling nativo y ejecución verificable en sandbox, orientado a flujos multi-paso de ingeniería de software (objetivo SWE-bench Verified).
- Bilingüismo nativo inglés-persa: terminología técnica, derivaciones de física complejas, ingeniería de software y prosa formal persa.
- Generación de texto conversacional mediante el pipeline `text-generation` de transformers.

## Casos de uso

- Resolucion de problemas de olimpiadas matematicas: el canal `<think>` permite obtener trazas de razonamiento paso a paso antes de la respuesta final, util para tutoria o verificacion de soluciones en AIME y problemas similares.
- Asistencia en fisica teorica y ciencia dificil: puede generar derivaciones formales paso a paso, adecuado para investigadores que necesiten revisar el razonamiento, no solo la respuesta.
- Codigo cientifico y simulaciones: orientado a escribir y depurar codigo de simulacion numerica (dominio SciCode), integrable en notebooks de investigacion.
- Ingenieria de software agéntica: con function calling nativo y ejecucion en sandbox, puede integrarse en agentes que editen codigo, ejecuten tests y iteren, tipo SWE-agent.
- Generacion de contenido tecnico en persa: redaccion de documentacion, prosa formal y material STEM en farsi con terminologia tecnica correcta, un nicho poco cubierto por la mayoria de modelos abiertos.
- Tutoria bilingue ingles-persa: explicacion de conceptos cientificos alternando idiomas, aprovechando el dominio dual declarado del modelo.
- Chatbots conversacionales ligeros: con ~4B de parametros, es desplegable en hardware modesto para asistentes conversacionales con capacidad de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks auditados. La model card presenta objetivos de optimizacion (no resultados medidos) pendientes de un pipeline de evaluacion RLVR completo:

| Benchmark | Dominio | Baseline Spark-X2.6* | Media competidores* | Objetivo de Rostam |
|---|---|---|---|---|
| GPQA Diamond | Fisica y ciencia dificil | 77,1 % | 80,2 % | >82 % (objetivo) |
| AIME 2026 | Matematicas de olimpiadas | 91,2 % | 85,1 % | >92 % (objetivo) |
| Gaokao 2026 | Matematicas avanzadas | 134,9 / 150 | 133,0 / 150 | >138 (objetivo) |
| SciCode | Simulacion cientifica | 36,8 % | 36,2 % | >42 % (objetivo) |
| SWE-bench Verified | Ingenieria de software agéntica | 62,8 % | 48,6 % | >64 % (objetivo) |
| Persian STEM & QA | Razonamiento tecnico bilingue | Baseline | No probado | "Frontier" (objetivo) |

*\*Cifras declaradas por el autor del modelo, procedentes supuestamente de model cards y papers oficiales. No son resultados medidos de Rostam-S1.*

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8-9 GB solo para los pesos (4,11 B de parametros a 2 bytes), mas la KV cache; en la practica, 12 GB es un margen razonable. Estimacion propia a partir del numero de parametros, no dato publicado.
- El tamano del repositorio (57,6 GB) sugiere la posible presencia de pesos adicionales o checkpoints multiples; el archivo de pesos en bfloat16 seria de unos 8 GB.
- Consumer GPUs: deberia caber en una RTX 3060 de 12 GB, RTX 4070 o superiores en bfloat16; en GPUs de 8 GB requeriria cuantizacion (no se publican pesos cuantizados oficiales).
- GPUs recomendadas para servidor: cualquier GPU con 16 GB o mas (A10G, L4, RTX 4090, A100).
- Despliegue: la model card muestra un ejemplo con `transformers` (requiere `trust_remote_code=True` debido al codigo personalizado de la arquitectura `spark2_5`). La compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta documentada y depende del soporte de la arquitectura personalizada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparativa orientativa con modelos abiertos de razonamiento de tamano similar (~4B). Los datos de Rostam-S1 son objetivos declarados, no resultados medidos:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Rostam-S1-4B | 4,11 B | no disponible | Apache 2.0 | Razonamiento bilingue en/fa; benchmarks pendientes de auditoria |
| Qwen3-4B (Thinking) | 4 B | 32.768 tokens (128K con YaRN) | Apache 2.0 | Razonamiento con modo thinking, multilingue, benchmarks publicados |
| Phi-4-mini (Microsoft) | 3,8 B | 128K tokens | MIT | Fuerte en razonamiento y matematicas, sin soporte nativo de persa |
| Gemma 3 4B (Google) | 4 B | 128K tokens | Gemma (restrictiva) | Multimodal (vision), multilingue, benchmarks publicados |

La ventaja diferencial declarada de Rostam-S1 es el enfoque bilingue ingles-persa y el enfoque agéntico/cientifico; su principal desventaja frente a las alternativas es la ausencia de benchmarks auditados y la arquitectura personalizada que puede complicar el despliegue en runtimes estandar.

## Limitaciones y advertencias

- Los benchmarks publicados en la model card son objetivos de optimizacion, no resultados medidos: el rendimiento real del modelo no ha sido verificado de forma independiente.
- La longitud de contexto no esta documentada, lo que dificulta planificar cargas de trabajo con documentos largos o conversaciones multi-turno extensas.
- Requiere `trust_remote_code=True` (codigo de modelado personalizado), lo que supone un riesgo de seguridad a evaluar antes de desplegar y puede romper la compatibilidad con vLLM, TGI o llama.cpp.
- Solo se declaran dos idiomas (ingles y persa); el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea limitado.
- No se han publicado pesos cuantizados oficiales ni compatibilidad GGUF documentada.
- El modelo es muy reciente (creado en octubre de 2026) con muy poca traccion comunitaria (1 like, ~1.155 descargas), por lo que hay poca evidencia de uso en produccion.
- No hay informacion sobre sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad; aplique las precauciones habituales para modelos de lenguaje de razonamiento.
- La licencia Apache 2.0 no impone restricciones al uso comercial, pero verifique los terminos del modelo base (Spark-X2.6-4B) y de cualquier codigo remoto cargado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/officialmobai/Rostam-S1-4B
- Organizacion del autor (Mob AI): https://huggingface.co/officialmobai
- Modelo base (Spark-X2.6-4B): https://huggingface.co/XHToken/Spark-X2.6-4B
- Paper, repositorio de codigo, demo y blog: no disponible
