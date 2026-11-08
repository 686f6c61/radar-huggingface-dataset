# arcasdynamicsorg/Persephone-27b

## Resumen

Persephone-27b es un modelo de lenguaje de 27.000 millones de parámetros desarrollado por Arcas Dynamics, un fine-tune del modelo base abierto Qwen/Qwen3.8-27B. Está especializado en razonamiento y generación de código, y su propuesta central es llevar capacidades de razonamiento propias de modelos frontera a hardware de consumo: una única GPU de 16 GB o un Mac con Apple Silicon de 16 GB. Se distribuye principalmente en formato GGUF cuantizado a 3 bits, con builds de aproximadamente 10-11 GB.

El modelo se ha post-entrenado mediante un pipeline propio de tres etapas: destilación de razonamiento sobre trazas completas, optimización de preferencias y aprendizaje por refuerzo con recompensas verificables. Esta última etapa premia código que supera tests ocultos ejecutados realmente, no código que solo parece correcto. Las actualizaciones de entrenamiento se aplican como adaptadores de bajo rango fusionados en los pesos base.

Su relevancia actual radica en el enfoque de "verificar y reintentar": Persephone es el modelo local por defecto de AXON, el espacio de trabajo de IA de escritorio de Arcas Dynamics, que ejecuta el código generado contra los ejemplos del problema y tests autoescritos, devolviendo los fallos al modelo para su corrección. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles no disponibles) |
| Parametros totales | 27.000 millones (27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (configuración recomendada en llama.cpp); 8.192 tokens en Mac de 16 GB |
| Tipos de cuantizacion | GGUF 3 bits: UD-IQ3_S (11,2 GiB) y UD-IQ3_XXS (10,2 GiB), con importance matrix propia |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Persephone parte de los pesos abiertos de Qwen3.8-27B, un transformer de 27B parámetros, y se post-entrena en tres fases. La primera es destilación de razonamiento: entrenamiento supervisado sobre trazas de razonamiento completas para problemas de código e investigación. La segunda es optimización de preferencias, orientada a que el modelo prefiera respuestas correctas frente a respuestas plausibles pero erróneas. La tercera es aprendizaje por refuerzo con recompensas verificables: el modelo genera miles de soluciones a problemas de programación, cada una se ejecuta contra tests ocultos y se refuerzan las respuestas correctas frente a las incorrectas y a las excesivamente largas. Cada ronda debe superar a la anterior en problemas reservados antes de publicarse.

Los problemas de código proceden de LiveCodeBench (AtCoder, LeetCode), y los problemas de evaluación se mantienen fuera de todo el entrenamiento. Las actualizaciones se aplican como adaptadores de bajo rango fusionados en los pesos base. La cuantización a 3 bits emplea una importance matrix calculada sobre las propias salidas del modelo, con precisión por tensor elegida para mantener nítidos los pesos más sensibles. El modelo activa el modo de razonamiento (thinking) por defecto.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento activado por defecto.
- Generación de código con razonamiento previo sobre algoritmos, casos límite y límites de tiempo.
- Resolución de problemas de programación competitiva (estilo AtCoder y LeetCode).
- Razonamiento orientado a investigación y biología (según las etiquetas del modelo).
- Flujo de verificación y reintento cuando se usa dentro de AXON: ejecuta el código contra ejemplos y tests propios y corrige los fallos.
- Soporte multilingüe limitado al inglés.
- Tool calling y uso de agentes multi-paso: no especializado todavía; es el foco de la siguiente ronda de entrenamiento según el autor.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistencia a programación competitiva: el modelo razona sobre el enunciado, los casos límite y la complejidad antes de escribir la solución, lo que encaja con problemas de tipo LeetCode y AtCoder usados en su entrenamiento.
- Generación de código con verificación automática: integrado en un pipeline que ejecuta el código contra tests, el bucle verificar-y-reintentar de AXON eleva la tasa de acierto en problemas fáciles del 93,3 % al 99,3 % según los datos del autor.
- Entorno de desarrollo local sin conexión: con builds de 10-11 GB cabe en una RTX 4080 SUPER o en un Mac M3 con 16 GB, lo que permite trabajar con código sensible sin enviar datos a la nube.
- Revisión y depuración de algoritmos: su entrenamiento contra tests ejecutados lo hace adecuado para detectar casos límite y errores lógicos en funciones acotadas.
- Prototipado de investigación asistida: las etiquetas de biología e investigación sugieren uso en exploración de hipótesis y redacción técnica en inglés.
- Despliegue en escritorio como modelo por defecto: AXON lo integra listo para ejecutar, útil para equipos que quieren un asistente de código local sin configurar servidores.
- Servidor de inferencia ligero con llama.cpp: `llama-server` con `-ngl all -fa on -c 32768 --jinja` permite exponerlo como API local para herramientas propias.

## Benchmarks y rendimiento

Resultados en problemas de programación reservados, build UD-IQ3_S, límite de 16K tokens de respuesta, temperatura 1.0. Son conjuntos de evaluación propios de Arcas Dynamics, no resultados oficiales de leaderboards.

| Conjunto | Persephone | Persephone en AXON (verificar y reintentar) |
|---|---|---|
| Fácil (50 problemas x 3) | 93,3 % (140/150) | 99,3 % (146/147) |
| Medio (80) | 80,0 % (64/80) | 86,3 % (69/80) |
| Difícil (70) | 38,6 % (27/70) | 40,0 % (28/70) |

En el conjunto fácil, el Qwen3.8-27B base sin modificar obtuvo 147/150 en las mismas condiciones. La comparación pareada en los conjuntos medio y difícil está planificada pero no se ha ejecutado. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 11 GB para UD-IQ3_S y 10 GB para UD-IQ3_XXS, más overhead de contexto.
- GPU recomendadas: RTX 4080 SUPER (probada por el autor con UD-IQ3_S); cualquier GPU NVIDIA de 16 GB.
- Apple Silicon: Macs M3 o posteriores con 16 GB, usando UD-IQ3_XXS, `sudo sysctl iogpu.wired_limit_mb=12288` y contexto de 8192.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB con los builds de 3 bits.
- Despliegue: llama.cpp (`llama-server` con `-ngl all -fa on -c 32768 --jinja`) y AXON como aplicación de escritorio. No se mencionan vLLM ni TGI.
- Muestreo recomendado: temperatura 0,6 y top_p 0,95.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato y cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Persephone-27b | 27B | 32.768 tokens | GGUF 3 bits (10-11 GB) | Apache 2.0 | Fine-tune de Qwen3.8-27B orientado a código y razonamiento |
| Qwen3.8-27B (base) | 27B | no disponible | pesos abiertos (no se detalla) | Apache 2.0 | Base de Persephone; 147/150 en el conjunto fácil según el autor |
| Alternativas de 27B-30B con GGUF para hardware de consumo | no disponible | no disponible | GGUF | no disponible | No se dispone de datos comparables en la información proporcionada |

No hay datos suficientes para comparar rendimiento con otros modelos de la misma categoría.

## Limitaciones y advertencias

- El trabajo con agentes multi-paso y tool use no está especializado; es el objetivo de la siguiente ronda de entrenamiento.
- Los problemas más difíciles suelen requerir más de 16K tokens de razonamiento; hay que ampliar el límite en esos casos.
- Los builds de 3 bits sacrifican algo de precisión a cambio de ejecutarse en hardware de consumo.
- El modelo puede equivocarse con seguridad; conviene verificar el código y las afirmaciones importantes.
- Solo soporta inglés, lo que limita su uso en castellano sin adaptación.
- Los benchmarks son conjuntos propios del autor, no leaderboards oficiales, y la comparación con el modelo base solo cubre el conjunto fácil.
- No se han publicado datos sobre sesgos, alucinación medida ni comportamiento en dominios distintos del código.
- Licencia Apache 2.0: permite uso comercial con atribución según los términos de la licencia; debe conservarse el aviso de atribución a Qwen (ver NOTICE).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arcasdynamicsorg/Persephone-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- LiveCodeBench (origen de los problemas de código): no disponible en la información proporcionada
- AXON (espacio de trabajo de Arcas Dynamics): no disponible en la información proporcionada
- Paper o blog técnico del modelo: no disponible en la información proporcionada
