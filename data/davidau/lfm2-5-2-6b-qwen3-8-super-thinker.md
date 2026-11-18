# DavidAU/LFM2.5-2.6B-Qwen3.8-Super-Thinker

## Resumen

LFM2.5-2.6B-Qwen3.8-Super-Thinker es una cuantización GGUF publicada por DavidAU sobre el modelo base LiquidAI/LFM2.5-2.6B, un modelo de lenguaje de 2.697.198.592 parámetros (2,69B) desarrollado originalmente por Liquid AI para despliegue en el extremo (edge). El autor añade un sistema propietario denominado Turbo Brilliance que incorpora 12 modos de razonamiento y 12 modos de instrucción conmutables en tiempo de inferencia mediante etiquetas en el prompt o cambios de parámetros vía API, además de un sistema de ayuda interactiva embebido en el propio modelo.

La relevancia de esta ficha radica en que combina un modelo base compacto con tool calling y entrenamiento agéntico con una capa de prompting estructurado que, según el autor, reduce el tiempo hasta el primer token útil y mejora la calidad en one-shot y two-shot. El repositorio ocupa 38,7 GB e incluye múltiples cuantizaciones, desde formatos de 4 bits hasta BF16 completo, con variantes "MAX" que mantienen el tensor de salida en BF16.

El modelo está publicado bajo licencia Apache 2.0, soporta 16 idiomas (entre ellos español, inglés, francés, alemán, árabe, chino, hindi, japonés, coreano, portugués y ruso) y está pensado para entornos con recursos limitados, aunque el sistema Turbo Brilliance escala en eficacia con el tamaño de la cuantización empleada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM2.5; el autor no detalla la arquitectura interna en la información proporcionada) |
| Parametros totales | 2.697.198.592 (2,69B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128.000 tokens (máximo indicado: 128k/131.000); se recomienda una ventana mínima de 24.000 tokens |
| Tipos de cuantizacion | GGUF en múltiples niveles, incluyendo Q4/IQ4, Q6, Q8, variantes "MAX" (tensor de salida en BF16) y BF16 completo |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base LiquidAI/LFM2.5-2.6B más allá de su naturaleza de modelo de lenguaje para edge con soporte de tool calling y entrenamiento agéntico. El autor de la cuantización no describe en la model card si se trata de un transformer denso, un modelo híbrido o una arquitectura SSM, por lo que este dato queda como no disponible. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La innovación principal que introduce esta publicación es el sistema Turbo Brilliance, una capa de instrucciones inyectadas antes de la fase de razonamiento. Según el autor, entre cientos y miles de tokens de instrucciones se inyectan en milisegundos en la etapa previa al razonamiento, de modo que el modelo queda "cebado" para la tarea antes de generar el primer token. El sistema incluye 12 modos de razonamiento y 12 modos de instrucción, conmutables en chat mediante etiquetas, en API o mediante cambios estándar de palabras clave compatibles con vLLM. El autor indica que el modelo base no disponía de un modo instruct nativo y que esta publicación añade 12.

## Capacidades

- Generación de texto conversacional multi-turno con ventanas de contexto de hasta 128.000 tokens.
- Razonamiento explícito mediante 12 modos de razonamiento conmutables en tiempo de inferencia.
- 12 modos de instrucción añadidos sobre el modelo base, que carecía de modo instruct nativo.
- Tool calling y function calling, heredados del modelo base.
- Capacidades agénticas y razonamiento multi-paso, según el entrenamiento del modelo base.
- Sistema de ayuda interactiva embebido que sugiere el modo de razonamiento o instrucción adecuado para cada caso de uso.
- Soporte multilingüe en 16 idiomas, incluido el español.
- Control de longitud de salida: el autor indica que el modelo obedece las indicaciones de longitud, con salidas típicas de 2.000 a 12.000+ tokens según el modo.
- Compatibilidad con endpoints estándar de inferencia (tag endpoints_compatible).

## Casos de uso

- Asistencia técnica en el extremo: el modelo puede ejecutarse en dispositivos con recursos limitados gracias a sus 2,69B de parámetros y a las cuantizaciones GGUF de 4 a 8 bits, gestionando conversaciones multi-turno con hasta 128k tokens de contexto.
- Clasificación y enrutamiento de tickets con tool calling: el soporte de function calling permite integrar el modelo en pipelines que consulten APIs externas, bases de datos o sistemas de ticketing, con los modos de instrucción forzando un formato de salida consistente.
- Generación de código asistida en entornos locales: al ser un modelo pequeño y cuantizable, puede desplegarse en estaciones de trabajo para autocompletado y explicación de código sin enviar datos a la nube.
- Razonamiento paso a paso en tareas de análisis: los 12 modos de razonamiento permiten seleccionar el nivel de detalle adecuado para problemas matemáticos, lógicos o de planificación, ajustando el coste computacional al caso.
- Procesamiento de documentos largos en varios idiomas: con 128k de contexto y soporte de 16 idiomas, el modelo puede resumir o extraer información de contratos, informes o hilos de correo en español, inglés, francés o alemán.
- Agentes autónomos de bajo coste: el entrenamiento agéntico del modelo base y la inyección de instrucciones previa al razonamiento permiten construir agentes que ejecuten tareas multi-paso con menos regeneraciones, reduciendo el coste por tarea.
- Prototipado rápido en investigación: la disponibilidad de cuantizaciones desde 4 bits hasta BF16 permite evaluar el impacto de la precisión en la calidad del razonamiento sin cambiar de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparables, y remite a la model card original de LiquidAI para los benchmarks del modelo base, que no se han proporcionado en esta ficha.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; para 2,69B parámetros, las cuantizaciones de 4 bits requieren del orden de 2 GB, las de 8 bits alrededor de 3 GB y BF16 unos 5,4 GB solo para pesos, sin contar caché KV.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es viable en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090; para contextos de 128k la caché KV eleva los requisitos y conviene una GPU con 24 GB o más.
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones; el contexto máximo de 128k exige planificación de memoria adicional.
- Opciones de despliegue: llama.cpp, Ollama y servidores compatibles con GGUF; el autor menciona compatibilidad con vLLM para el cambio de modos mediante palabras clave estándar.
- Latencia y throughput: no disponibles. El autor afirma que la inyección de instrucciones del sistema Turbo Brilliance ocurre en milisegundos, pero no publica cifras de tokens por segundo.
- Ajustes recomendados por el autor: temperatura 0,5-1,0, repetition penalty 1,0 (desactivada), top_k 64, min_p 0,05, top_p 0,95, contexto mínimo de 24.000 tokens y sin caché. Los ajustes sugeridos por Liquid son temperatura 0,1, top_k 50 y repetition penalty 1,1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-2.6B-Qwen3.8-Super-Thinker (DavidAU) | 2,69B | 128k | Apache 2.0 | GGUF | Añade 12 modos de razonamiento y 12 de instrucción vía Turbo Brilliance |
| LiquidAI/LFM2.5-2.6B (base) | 2,69B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo original sin los modos añadidos; dispone de tool calling y entrenamiento agéntico |
| Modelos de ~3B de otras familias (Qwen, Gemma, Llama) | ~3B | variable | variable | safetensors, GGUF | No se dispone de datos comparativos de rendimiento en la información proporcionada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El sistema Turbo Brilliance es una versión beta (V1.0) según el autor, que solicita reportar fallos en la pestaña de comunidad.
- La eficacia del sistema depende directamente del tamaño de la cuantización: el autor indica que Q6 es más de dos veces más potente que Q4/IQ4 y que Q8 es entre 1,5 y 2 veces más fuerte que Q6, lo que implica que las cuantizaciones pequeñas degradan los modos de razonamiento complejos.
- El modelo base carecía de modo instruct nativo; los 12 modos añadidos son una capa de prompting inyectado, no un fine-tuning verificado de forma independiente.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Limitaciones de idioma: aunque se listan 16 idiomas, no se especifica el nivel de competencia por idioma ni si el sistema Turbo Brilliance está adaptado a todos ellos.
- El contexto máximo de 128k requiere configuraciones de memoria elevadas y el autor recomienda no usar caché, lo que puede afectar al rendimiento en producción.
- Licencia Apache 2.0: permite uso comercial, pero el autor no documenta garantías ni soporte para el sistema Turbo Brilliance.
- El repositorio ocupa 38,7 GB, por lo que la descarga completa de todas las cuantizaciones requiere espacio de almacenamiento considerable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/LFM2.5-2.6B-Qwen3.8-Super-Thinker
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Preguntas frecuentes y soporte: https://huggingface.co/DavidAU/support
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Paper referenciado en los tags (arXiv:2511.23404): https://arxiv.org/abs/2511.23404
- Evolución del sistema Turbo Brilliance (Qwen3.8-27B): https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
