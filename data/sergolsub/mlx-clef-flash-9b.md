# sergolsub/mlx-clef-flash-9B

## Resumen

`mlx-clef-flash-9B` es una conversión a 8 bits en formato MLX del modelo `Cloudflare/clef-flash`, publicada por el usuario sergolsub. No se trata de un modelo entrenado desde cero, sino de una adaptación de los pesos originales de Cloudflare para su ejecución eficiente en Apple Silicon mediante la librería `mlx_lm`. El modelo cuenta con 8.953.803.264 parámetros totales (aproximadamente 9B) y una arquitectura etiquetada como `qwen3_5` en los metadatos de Hugging Face, lo que sugiere una base derivada de la familia Qwen 3.5.

La característica más distintiva del modelo es su orientación hacia tareas de decisión estructurada: la model card documenta un modo `decide()` que permite clasificar entradas de texto en respuestas de tipo binario, elección múltiple (`choice`), puntuación (`score`) o sí/no (`noul`), con instrucciones y criterios definidos por el usuario. Esta funcionalidad se implementa mediante una cabeza de decisión adicional (`joint_head.safetensors`) y código de inferencia específico (`clef_mlx.py`), lo que lo aleja del uso como generador de texto conversacional convencional.

Su relevancia actual radica en dos factores: por un lado, demuestra un flujo de cuantización a 8 bits con auditoría de calidad exhaustiva (comparación KL tensor por tensor frente a bf16); por otro, ofrece un caso práctico de despliegue de modelos de ~9B en hardware de consumo Apple (Mac mini M4 Pro con 48 GB de RAM unificada) con latencias de decisión del orden de centenares de milisegundos. La licencia Apache 2.0 heredada del modelo original facilita su uso comercial, aunque las capacidades reales del modelo base de Cloudflare no están documentadas en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5` en metadatos; detalles internos no disponibles) |
| Parámetros totales | 8.953.803.264 (~9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits (MLX); el modelo base bf16 está referenciado pero no incluido en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de `Cloudflare/clef-flash`) |
| Formato de pesos | safetensors (layout MLX, 4 shards), más `joint_head.safetensors` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` y la presencia de capas con atención lineal (`model.language_model.layers.0.linear_attn.in_proj_a.weight` aparece como la capa con mayor error de cuantización). Esto sugiere una arquitectura híbrida o con mecanismos de atención lineal en al menos algunas capas, coherente con diseños recientes de la familia Qwen. No se especifican el número de capas, dimensiones ocultas, número de cabezas ni el esquema exacto de atención.

Respecto al entrenamiento, no hay información sobre el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. Lo que sí está documentado es el proceso de conversión: una cuantización a 8 bits para MLX sin reentrenamiento ni cambios arquitectónicos, acompañada de una auditoría de calidad tensor por tensor. Se compararon 427 tensores mediante divergencia KL con histogramas de 512 bins, obteniendo una KL media de 3,87e-04 y máxima de 5,57e-03 (en la capa `linear_attn.in_proj_a` de la capa 0). La perplejidad de calibración pasó de 2,341 en bf16 a 2,349 en 8 bits, una degradación mínima. Además, el modelo incorpora una cabeza de decisión (`joint_head`) y un esquema de configuración (`decision_config.json`, `joint_config.json`) que habilitan el modo de decisión estructurada.

## Capacidades

- Clasificación y decisión estructurada: el modelo expone un método `decide()` que responde a tareas de tipo binario, elección múltiple (`choice`), puntuación ordinal (`score`) y sí/no (`noul`), con instrucciones y criterios personalizados por llamada.
- Procesamiento de texto: la model card reporta evaluaciones sobre entradas de 512 tokens (522 tokens reales) en tareas de decisión, con latencias medidas.
- Modo de decisión con múltiples cabezas: cada pregunta se formula como un objeto independiente, permitiendo evaluar varias decisiones sobre la misma entrada.
- Generación de texto conversacional: no documentada explícitamente en la información disponible; el énfasis de la model card está en el modo de decisión.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Visión: explícitamente no soportada ("Image 512x512: not supported").
- Detección de cajas (box): explícitamente no soportada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Triaje de tickets de soporte: el modelo puede clasificar automáticamente quejas o incidencias en categorías como facturación, envío o técnico mediante el tipo `choice`, con criterios definidos por el equipo. La latencia medida (mediana de 737 ms por decisión) lo hace viable para un triaje en tiempo casi real.
- Detección de intención de reembolso: usando el tipo `noul`, se puede determinar si un cliente solicita un reembolso a partir del texto libre de su mensaje, integrándolo en un flujo de atención al cliente previo a la intervención humana.
- Puntuación de severidad de incidencias: con el tipo `score` y criterios ordinales (por ejemplo, "cosmético", "molesto", "bloqueante"), el modelo asigna un nivel de gravedad a errores técnicos o reportes de usuarios, útil para priorizar colas de trabajo.
- Enrutamiento de correos o mensajes entrantes: la combinación de `choice` con criterios permite derivar comunicaciones al equipo adecuado sin necesidad de reglas heurísticas frágiles, manteniendo la lógica de negocio en la configuración de criterios.
- Clasificación de feedback de producto: el modelo puede etiquetar reseñas o encuestas con decisiones binarias o de elección múltiple, aprovechando su capacidad de procesar entradas de ~512 tokens en una sola pasada.
- Despliegue local en estaciones de trabajo Apple Silicon: gracias a la conversión MLX 8 bits y un consumo de memoria residente de aproximadamente 11,5 GB, es posible ejecutar el modelo en un Mac mini M4 Pro con 48 GB para tareas de clasificación internas sin depender de la nube.
- Prototipado de pipelines de decisión: el código `clef_mlx.py` y los esquemas JSON permiten integrar el modelo en scripts de Python para validar rápidamente lógicas de decisión antes de trasladarlas a producción.

## Benchmarks y rendimiento

Los datos disponibles provienen de la evaluación propia del autor de la conversión, no de benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K, etc.). Se presentan a continuación tal cual se documentan:

| Métrica | 8 bits (MLX) | bf16 (referencia) |
|---|---|---|
| Precisión global (eval propia) | 83,0 % | 81,8 % |
| `noul` | 87,2 % | 84,6 % |
| `choice` | 84,0 % | 84,0 % |
| `score` | 75,0 % | 75,0 % |
| Perplejidad de calibración | 2,349 | 2,341 |
| Decision Index 0.4.1 | 43,46 | no disponible |

Mediciones de rendimiento en Mac mini M4 Pro (48 GB, MLX 8 bits):

| Métrica | Valor |
|---|---|
| Tiempo de carga | 5,17 s (estándar) / 3 s (medición alternativa) |
| RSS pico | 11,3–11,48 GB |
| Texto 512 tokens: binario | 1518 ms (media de 5 tras 3 warm-up) |
| Texto 512 tokens: elección múltiple | 1625 ms |
| Texto 512 tokens: score | 1669 ms |
| Latencia de decisión (mediana) | 737 ms |
| Decisiones cortas sostenidas | 2,15/s |
| Imagen 512x512 | no soportado |
| Box | no soportado |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: ~11,5 GB de memoria residente pico en la configuración MLX 8 bits medida; el repo ocupa 10,47 GB en disco.
- Hardware validado: Mac mini M4 Pro con 48 GB de memoria unificada. No se han documentado pruebas en otros equipos.
- GPU dedicadas (NVIDIA/AMD): no aplicable directamente, ya que el formato es MLX (Apple Silicon). Para GPUs NVIDIA sería necesario reconvertir desde el modelo base bf16.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con al menos 16 GB de memoria unificada, aunque la medición oficial se hizo con 48 GB; no se dispone de datos para configuraciones menores.
- Opciones de despliegue: `mlx_lm` con el cargador propio `clef_mlx.py`; el modelo no está pensado para vLLM, llama.cpp, Ollama o TGI en su formato actual.
- Latencia y throughput: mediana de 737 ms por decisión y 2,15 decisiones cortas por segundo en el hardware de referencia; 1518–1669 ms para entradas de 512 tokens según el tipo de tarea.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos en la documentación proporcionada. El modelo base `Cloudflare/clef-flash` es la referencia natural, pero sus especificaciones (contexto, idiomas, benchmarks) no están incluidas en la información disponible. Tampoco se detallan alternativas de la familia Qwen 3.5 con las que contrastar parámetros, contexto o rendimiento.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `sergolsub/mlx-clef-flash-9B` | ~9B | no disponible | Apache 2.0 | safetensors MLX 8-bit | Conversión MLX con cabeza de decisión |
| `Cloudflare/clef-flash` | no disponible | no disponible | Apache 2.0 | bf16 (presumiblemente) | Modelo base original |
| Alternativas Qwen 3.5 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos concretos |

## Limitaciones y advertencias

- La información sobre arquitectura interna, contexto máximo, idiomas y datos de entrenamiento es muy limitada; no debe asumirse un comportamiento conversacional general sin validación previa.
- El modelo está especializado en decisiones estructuradas; no hay evidencia documentada de calidad en generación libre, código, matemáticas o razonamiento multi-paso.
- Visión y detección de cajas no están soportadas, según la propia model card.
- La evaluación de calidad (83,0 % vs 81,8 %) es interna del autor de la conversión y no ha sido replicada por terceros; no sustituye a benchmarks estándar.
- La conversión a 8 bits introduce una degradación mínima pero medible (PPL 2,349 vs 2,341; KL máxima 5,57e-03 en la capa 0 de atención lineal).
- El formato MLX limita el despliegue a Apple Silicon; para otros entornos hay que partir del modelo base `Cloudflare/clef-flash`.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni restricciones adicionales más allá de la licencia Apache 2.0 heredada.
- El modelo tiene 220 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy escasa.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar el repositorio upstream por si prevalece alguna cláusula adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/mlx-clef-flash-9B
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Documentación de MLX: no disponible en la información proporcionada
- Paper: no disponible
- Blog o demo: no disponible
- Repositorio de código adicional: no disponible
