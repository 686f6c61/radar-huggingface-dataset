# DavidAU/Qwen3-Zero-Coder-Reasoning-V2-0.8B-NEO-EX-GGUF

## Resumen

Qwen3-Zero-Coder-Reasoning-V2-0.8B-NEO-EX-GGUF es una cuantización GGUF publicada por DavidAU sobre su propio merge Qwen3-Zero-Coder-Reasoning-V2-0.8B, un modelo especializado en generación de código con razonamiento explícito (bloques de "thinking") construido sobre la plataforma Qwen 3. El modelo base surge de la fusión de dos modelos de 0,6B, dando como resultado un transformer denso de 816 millones de parámetros con 42 capas y 464 tensores, lo que lo hace inusualmente denso para su tamaño. Está pensado para generar bloques de código, borradores rápidos y resolver problemas de programación con cadenas de razonamiento.

La relevancia de esta publicación está en su enfoque en eficiencia: el autor declara velocidades superiores a 150 tokens por segundo en hardware moderado y más de 50 t/s en CPU, con una ventana de contexto de hasta 40k tokens. Los GGUF han sido aumentados con el dataset NEO Imatrix, y se publican tres variantes (NEO, NEO2 y NEO3) con distintos tratamientos del tensor de salida, además de una recomendación poco habitual de comparar cuantizaciones bajas y altas porque el efecto del imatrix es inverso al tamaño del quant.

Es un modelo de nicho: no compite en benchmarks frontier, sino que ofrece una opción ligera, rápida y con licencia Apache 2.0 para tareas de código en entornos con recursos limitados, incluyendo despliegue en CPU. Su idioma declarado es únicamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (plataforma Qwen 3), 42 capas, 464 tensores |
| Parámetros totales | 816.283.136 (0,8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 40k tokens máximo; se sugiere mínimo de 8k a 16k |
| Tipos de cuantización | IQ2, Q2, IQ3_M, Q4, IQ4_XS, Q5_K_M, Q6, Q8, F16, BF16; variantes NEO, NEO2 y NEO3 con distinto tratamiento del tensor de salida |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 39,8 GB con múltiples cuantizaciones); el modelo base original está en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso derivado de Qwen 3, resultado de un merge de dos modelos de 0,6B que produce una red de 42 capas y 464 tensores con 816 millones de parámetros. No es un modelo MoE ni emplea arquitecturas híbridas SSM: es un transformer clásico con decodificación autorregresiva que genera bloques de razonamiento antes de la respuesta de código. El autor no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información no está disponible.

La innovación principal de esta publicación no está en el entrenamiento sino en la cuantización: los GGUF han sido aumentados con el dataset NEO Imatrix, y se ofrecen tres familias. Los NEO estándar aplican imatrix a la mayoría de quants pero no a Q8, F16 ni BF16. Los NEO2 aplican imatrix también al tensor de salida y fijan Q8, F16 y BF16 a Q6_K imatrixado. Los NEO3 fijan el tensor de salida a IQ4_XS imatrixado en todas las cuantizaciones, incluidas las de alta precisión. El autor afirma que el efecto del imatrix es más fuerte cuanto menor es el quant, por lo que recomienda probar al menos dos cuantizaciones (por ejemplo IQ3_M e IQ5_K_M/Q6/Q8) y comparar resultados para el caso de uso concreto.

## Capacidades

- Generación de código: bloques de código, borradores rápidos, ejemplos y snippets en distintos lenguajes.
- Razonamiento explícito: genera bloques de "thinking" (estilo CoT/R1) antes de la respuesta, con tamaño variable según la cuantización.
- Resolución de problemas de programación: el autor lo describe como apto para peticiones de código complejas cuando se activa el razonamiento.
- Brainstorming técnico: generación de ideas de diseño y enfoques alternativos de codificación.
- Resolución de acertijos y problemas lógicos, según los tags del repositorio.
- Conversación multi-turno con plantilla ChatML o Jinja embebida.
- Contexto largo de hasta 40k tokens para incluir código de referencia extenso.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multimodales.

## Casos de uso

- Autocompletado y generación de borradores de código en local: con más de 50 t/s en CPU y más de 150 t/s en hardware moderado, puede ejecutarse en portátiles sin GPU para generar snippets y plantillas de forma interactiva.
- Asistente de programación en IDE con contexto de repositorio: la ventana de 40k tokens permite incluir varios ficheros de referencia y obtener código coherente con ellos, con la salvedad de que el modelo puede repetir bloques y requerir parada manual.
- Exploración de soluciones alternativas (brainstorming): útil para generar varias aproximaciones a un problema de diseño antes de que el desarrollador elija una, aprovechando que el autor recomienda 2-3 generaciones por consulta.
- Prototipado rápido en entornos con recursos limitados: al caber en cuantizaciones IQ3_M o Q4 en equipos de gama baja, sirve para equipos sin acceso a GPU o para despliegues en el edge.
- Generación de código sin dependencias externas: el autor indica que temperaturas más altas ayudan a que el modelo "piense fuera de la caja" en restricciones estrictas, lo que encaja con scripts autocontenidos o utilidades de un solo fichero.
- Educación y aprendizaje de programación: los bloques de razonamiento permiten mostrar al estudiante el proceso de resolución, no solo el resultado, en un modelo lo bastante pequeño para ejecutarse en local.
- Procesamiento por lotes de tareas de código sencillas: la velocidad declarada permite generar muchos borradores en poco tiempo para filtrado posterior o revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta cifras de velocidad declaradas: más de 150 t/s en hardware moderado y más de 50 t/s en CPU, sin especificar el hardware exacto ni la cuantización empleada en cada medición.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de 0,8B, las cuantizaciones IQ3_M y Q4 ocupan del orden de 0,5 GB o menos y Q8/F16 alrededor de 1-1,6 GB, aunque estas cifras son estimaciones por tamaño de parámetros y no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer con 2 GB o más de VRAM debería poder ejecutar las cuantizaciones altas; las bajas caben en GPUs integradas.
- CPU: el autor declara más de 50 t/s solo con CPU, por lo que es viable en equipos sin GPU dedicada.
- Despliegue: formato GGUF, compatible con llama.cpp, Ollama y otros runners GGUF; el repositorio incluye la etiqueta endpoints_compatible.
- Latencia y throughput: más de 150 t/s en hardware moderado y más de 50 t/s en CPU según el autor; IQ3_M se cita explícitamente como la cuantización que supera los 150 t/s.
- Plantilla requerida: Jinja embebida o ChatML.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-Zero-Coder-Reasoning-V2-0.8B-NEO-EX (este) | 0,8B | 40k | Apache 2.0 | GGUF | Merge con razonamiento e imatrix NEO; solo inglés |
| Qwen2.5-Coder-0.5B | 0,5B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo oficial de código de Alibaba, sin razonamiento explícito documentado aquí |
| Qwen2.5-Coder-1.5B | 1,5B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Mayor tamaño y presumiblemente mayor calidad, a costa de velocidad |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | no disponible en esta ficha | MIT (según el modelo original) | safetensors, GGUF | Razonamiento por destilación, mayor tamaño |

Los datos de los modelos comparables no se han verificado en la información proporcionada y se indican solo como referencia de categoría; no se dispone de comparaciones de rendimiento publicadas.

## Limitaciones y advertencias

- Solo soporta inglés de forma declarada; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de repetición de bloques de código, especialmente en cuantizaciones altas, y de generar múltiples versiones del mismo código; puede requerir parada manual de la generación.
- El autor advierte que las cuantizaciones altas pueden "perderse en los detalles" y producir bloques de razonamiento más largos; recomienda añadir condiciones y detalles al prompt para centrar el modelo.
- Las cuantizaciones bajas pueden producir soluciones menos complejas o menos precisas; el autor sugiere aumentar el detalle de las instrucciones y hacer 2-4 generaciones.
- Los ajustes de muestreo que mitigan la repetición pueden degradar la calidad del código generado, según el propio autor.
- Es un merge de dos modelos de 0,6B, no un modelo entrenado desde cero: la calidad está acotada por el tamaño y por el proceso de fusión, sin benchmarks publicados que la respalden.
- No se documentan salvaguardas, evaluación de sesgos ni filtros de seguridad; el riesgo de alucinación en APIs inexistentes o código incorrecto es el habitual en modelos de este tamaño.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El repositorio ocupa 39,8 GB por incluir muchas cuantizaciones; conviene descargar solo los ficheros necesarios.

## Enlaces

- Hugging Face: https://huggingface.co/DavidAU/Qwen3-Zero-Coder-Reasoning-V2-0.8B-NEO-EX-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3-Zero-Coder-Reasoning-V2-0.8B
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Preguntas frecuentes del autor: https://huggingface.co/DavidAU/support
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
