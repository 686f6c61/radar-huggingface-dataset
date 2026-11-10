# MythThrazz/datastar-4b-v2-mlx-4bit

## Resumen

datastar-4b-v2-mlx-4bit es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B especializado en Datastar, un framework de hipermedia que envía HTML desde el backend mediante Server-Sent Events (SSE) y gestiona el estado del frontend con señales reactivas. Lo desarrolla el usuario independiente MythThrazz y su motivación declarada es que los modelos grandes de propósito general confunden Datastar con otros paquetes o generan código React etiquetado como compatible, por lo que el autor buscaba un modelo pequeño ejecutable en local en un Mac que dominase los atributos, los eventos SSE y los conceptos del framework.

Técnicamente es un Qwen3.5-4B de 4.205.751.296 parámetros afinado con QLoRA (rank 16, alpha 32) y una ronda de auto-destilación (SDFT) supervisada por un juez Qwen3.5-9B, fusionado con `merge_and_unload()` y convertido a MLX 4-bit con tamaño de grupo 64. El repositorio ocupa 2,4 GB y el autor indica unos 2,2 GB en disco. Es relevante para desarrolladores que trabajan con Datastar y quieren un asistente de consulta rápida sin depender de la nube.

La licencia es Apache-2.0, igual que el modelo base, y el único idioma declarado es inglés. El conocimiento está congelado a la documentación de data-star.dev de marzo/abril de 2026, y el autor advierte explícitamente de que se trata de un modelo de 4B con deriva en respuestas largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), derivado de Qwen/Qwen3.5-4B |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el entrenamiento uso longitud maxima de 2048; el contexto nativo del base no se especifica) |
| Tipos de cuantizacion | 4-bit MLX (group size 64); entrenamiento previo en 4-bit NF4 |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX 4-bit |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-4B, un transformer decoder-only denso de aproximadamente 4.200 millones de parámetros. El ajuste se realizó con QLoRA sobre el modelo cargado en 4-bit NF4: rank 16, alpha 32, dropout 0.05, aplicado a todas las proyecciones de atención y MLP (q, k, v, o, gate, up, down), 3 épocas, batch efectivo 8, learning rate 2e-4 con scheduler coseno, AdamW de 8 bits y longitud máxima 2048. Se entrenaron 21,2 millones de parámetros; la pérdida bajó de 2,17 a 0,31 en 204 pasos, con 68 minutos de entrenamiento en una RTX 4070 de 12 GB (6 de abril de 2026).

El dataset se construyó a partir de 57 páginas de la documentación de data-star.dev rastreadas en marzo de 2026. El pipeline pasó por 508 pares brutos, 536 limpios y aumentados (con pares de generación de código añadidos desde los ejemplos), 523 tras eliminar 13 manualmente y 544 tras añadir 21 pares conceptuales sobre el "Tao", CQRS y señales. Aproximadamente la mitad del conjunto es referencia de API; el resto cubre conceptos, generación de código, depuración, SDK y buenas prácticas. Sobre el adaptador QLoRA se aplicó una ronda de auto-destilación (SDFT): el modelo responde 100 preguntas de entrenamiento, Qwen3.5-9B en Q4_K_M puntúa cada respuesta de 1 a 10 contra la referencia, se conservan las buenas y se sustituyen las malas por la referencia, y se entrena una época sobre el resultado (92 de 100 conservadas, puntuación media del juez 0,717). La exportación final fusiona el adaptador en un `Qwen3_5ForCausalLM` y convierte con `mlx_lm convert -q --q-bits 4`.

## Capacidades

- Generación de texto conversacional en inglés sobre Datastar: atributos, eventos SSE, señales, modos de parcheo y conceptos del framework.
- Generación de código de ejemplo para Datastar (fragmentos de HTML con atributos `data-*`, integración con backends como PHP).
- Respuesta a preguntas de referencia de API y de depuración de errores concretos del framework.
- Razonamiento conceptual sobre CQRS, señales frente a estado en backend y filosofía del framework ("In Morph We Trust").
- Servidor compatible con la API de OpenAI a través de `mlx_lm server`, lo que permite integrarlo con clientes estándar.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni otros modos especiales.
- El modelo base dispone de modo "thinking", pero el autor recomienda desactivarlo (`enable_thinking: false`) porque los datos de entrenamiento no contienen trazas de razonamiento.

## Casos de uso

- Consulta rápida de referencia de API durante el desarrollo: un desarrollador pregunta "¿qué hace `data-ignore-morph`?" o "¿cómo se envía un parche desde PHP?" y obtiene una respuesta concreta en local, sin latencia de red ni coste por token.
- Asistencia en el editor o terminal: al exponerse como servidor compatible con OpenAI en el puerto 8099, puede conectarse a clientes de chat locales para resolver dudas mientras se escribe código Datastar.
- Generación de fragmentos de HTML con atributos Datastar a partir de una descripción breve, útil para prototipar vistas con SSE y señales.
- Depuración de comportamientos del framework: el conjunto de entrenamiento incluye pares de depuración, por lo que puede ayudar a identificar por qué un parche SSE no se aplica o una señal no se actualiza.
- Formación y onboarding de equipos: sirve como asistente interno que responde dudas conceptuales sobre CQRS y el modelo de estado de Datastar sin salir de la máquina del desarrollador.
- Prototipado offline en portátiles Apple Silicon: con unos 2,2 GB en disco y aproximadamente 61 tok/s en un M3 Pro, es viable trabajar sin conexión en entornos con conectividad limitada.
- Automatización de documentación interna: generar explicaciones breves de atributos y eventos para wikis o guías del equipo, siempre con revisión humana por el riesgo de deriva en respuestas largas.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de las notas de entrenamiento del autor, con muestras pequeñas y preguntas propias; no son benchmarks estándar.

| Prueba | Modelo | Resultado | Fecha |
|---|---|---|---|
| 10 preguntas nuevas no vistas (URL de CDN, `@peek`, modos de parcheo, borrado vía SSE, reset de formulario, view transitions, filosofía, "In Morph We Trust", CQRS, señales frente a estado en backend) | v2 (adaptador SDFT, antes de conversión a 4-bit) | 9 aciertos y 1 parcial: 9,5/10 | 2026-04-07 |
| Preguntas nuevas del mismo tipo | v1 (523 muestras, ronda SDFT 6) | 4/6 | 2026-04-04 |
| Tasa on-policy de SDFT (respuestas aceptadas por el juez de 9B) | v2 | 92% | 2026-04-07 |
| Tasa on-policy de SDFT | v1, rondas 5-7 | 95%, 97%, 96% | 2026-04-04/05 |

El autor aclara que la puntuación de 9,5/10 se midió sobre el adaptador antes de la fusión y la cuantización a 4-bit; la compilación MLX se verificó manualmente tras la conversión y el conocimiento de Datastar seguía intacto, pero no se repitieron las 10 preguntas sobre ella. La única respuesta parcial fue sobre "resetear todas las señales de formulario": describió un enfoque SSE y omitió `@setAll`. Existe un conjunto de validación de 50 preguntas con palabras clave esperadas, pero no hay ejecución puntuada de v2 sobre él.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en 4-bit ocupa unos 2,2 GB en disco; en MLX sobre Apple Silicon la memoria unificada necesaria es del orden de 2,5-3 GB incluyendo overhead de ejecución.
- GPU recomendadas: el autor lo ejecuta en un Mac con M3 Pro. Al ser un formato MLX, está pensado para Apple Silicon; no se documenta su uso en GPU NVIDIA.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon con al menos 8 GB de memoria unificada; el entrenamiento original se hizo en una RTX 4070 de 12 GB, pero la inferencia publicada es MLX.
- Opciones de despliegue: `mlx-lm` (servidor `mlx_lm server` con API compatible con OpenAI). No se proporcionan pesos GGUF ni instrucciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: aproximadamente 61 tok/s en un M3 Pro según las pruebas del autor; el rendimiento depende de la máquina y de la carga concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| datastar-4b-v2-mlx-4bit | 4,2B | No disponible | Datastar (framework de hipermedia) | Apache-2.0 | MLX 4-bit |
| Qwen/Qwen3.5-4B (base) | 4,2B | No disponible | Propósito general | Apache-2.0 | safetensors |
| Qwen3.5-9B (juez del SDFT) | 9B | No disponible | Propósito general | No disponible | Q4_K_M en el pipeline del autor |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. El autor indica que para programación general o temas fuera de Datastar conviene usar un modelo mayor, y que el modelo base de 4B ya tiende a inventar detalles sobre Datastar sin el ajuste.

## Limitaciones y advertencias

- Deriva en respuestas largas: a partir de unas 100 palabras, especialmente en generación de código multi-paso, empieza a inventar detalles. El autor recomienda preguntas acotadas y `max_tokens` moderado.
- Emisión repetida de `<|im_end|>`: a veces genera varios tokens de fin en cadena por una peculiaridad de la plantilla de chat; conviene eliminarlos en el cliente o configurar `<|im_end|>` como secuencia de parada.
- Corte de conocimiento: la documentación usada es de marzo/abril de 2026; cualquier novedad posterior de Datastar no la conoce.
- Alcance limitado: es un modelo de 4B especializado; para programación general o dominios ajenos a Datastar su rendimiento es inferior al de modelos mayores.
- Idioma: solo se declara inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- Modo thinking: debe desactivarse, ya que no hay trazas de razonamiento en los datos de entrenamiento y las respuestas empeoran con él activado.
- Evaluación débil: las métricas provienen de muestras pequeñas y preguntas propias del autor, no de benchmarks estandarizados; además, la puntuación principal se midió antes de la cuantización a 4-bit.
- Licencia: Apache-2.0 permite uso comercial, pero se heredan las condiciones y posibles sesgos del modelo base Qwen3.5-4B.
- Riesgo de alucinación en detalles de API no cubiertos por la documentación rastreada, especialmente en atributos o eventos introducidos después del corte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MythThrazz/datastar-4b-v2-mlx-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Documentación de Datastar: https://data-star.dev
