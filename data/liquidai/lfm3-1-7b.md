# LiquidAI/LFM3-1.7B

## Resumen

LFM3-1.7B es un modelo de lenguaje de solo texto desarrollado por Liquid AI, post-entrenado a partir de LFM3-1.7B-Base y orientado a agentes locales y aplicaciones especializadas. Con 1.728.801.536 parámetros (1,73B) y una ventana de contexto de 256K tokens (entrada más salida), se posiciona como una alternativa compacta para ejecución en dispositivo (edge), donde el coste de memoria y la latencia importan más que el rendimiento bruto en tareas de razonamiento complejo.

Su rasgo diferencial es la arquitectura tri-híbrida: 24 capas compuestas por 13 convoluciones cortas con compuerta (gated short convolutions), 5 capas de atención de ventana deslizante y 6 capas de atención global. Este diseño busca reducir el coste de la caché KV en contextos largos sin renunciar a la recuperación de información a larga distancia que aportan las capas de atención global. La model card indica que a 4 bits ocupa aproximadamente 1 GB de memoria, lo que lo hace viable en teléfonos y portátiles.

El modelo está post-entrenado para su uso en arneses agénticos como Hermes Agent, Pi y OpenClaw, con soporte de tool calling y salidas estructuradas, y cubre 16 idiomas, incluido el español. Liquid AI lo desaconseja explícitamente para programación agéntica y razonamiento multi-paso complejo debido a su tamaño reducido, y recomienda recuperación o búsqueda para tareas con alta carga de conocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-híbrida: 24 capas (13 gated short convolutions, 5 sliding-window attention, 6 global attention) |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (entrada + salida) |
| Tipos de cuantizacion | No disponible en detalle; la model card reporta ejecución a 4 bits con ~1 GB de memoria |
| Idiomas soportados | 16: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso, polaco |
| Licencia | LFM Open License v1.0 (identificador `lfm1.0`, licencia "other") |
| Formato de pesos | safetensors (repositorio de 3,5 GB); integración vía `transformers` con `custom_code` |

| Parametro adicional | Valor |
|---|---|
| Vocabulario | 128.000 tokens |
| Checkpoint | Post-entrenado, solo texto |
| Modelo base | LiquidAI/LFM3-1.7B-Base |
| Descargas / likes | 6.311 descargas, 97 likes |
| Fecha de creacion / actualizacion | 23 de octubre de 2026 / 27 de octubre de 2026 |

## Arquitectura y entrenamiento

LFM3-1.7B emplea una arquitectura híbrida de 24 capas que combina tres tipos de bloque en lugar de apilar únicamente atención transformer: 13 capas de convolución corta con compuerta, 5 capas de atención de ventana deslizante y 6 capas de atención global. La motivación es doble: por un lado, las convoluciones y la atención local abaratan el coste por token y contienen el crecimiento de la caché KV; por otro, las seis capas de atención global preservan la capacidad de mezclar información a lo largo de toda la ventana de 256K tokens. El vocabulario es de 128.000 tokens, coherente con el soporte de 16 idiomas.

El checkpoint publicado es un modelo post-entrenado, no la versión base. La model card especifica que el post-entrenamiento se orientó a arneses agénticos (Hermes Agent, Pi y OpenClaw) e incluye soporte de tool calling y salidas estructuradas, lo que sugiere fases de ajuste supervisado y preferencia sobre trayectorias de herramientas. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se usaron RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa. El modelo usa `custom_code` en `transformers`, por lo que requiere `trust_remote_code` para cargarse.

## Capacidades

- Generación de texto conversacional multi-turno en 16 idiomas, incluido el español.
- Tool calling y function calling, con entrenamiento específico para arneses agénticos.
- Salidas estructuradas (JSON y formatos definidos por el desarrollador), orientadas a integración en pipelines.
- Ejecución local en dispositivo: ~1 GB a 4 bits según la model card, viable en teléfonos y portátiles.
- Ventana de 256K tokens de entrada más salida, útil para documentos largos y conversaciones extensas.
- Adaptación por fine-tuning en una sola GPU para dominios, formatos y herramientas propios.
- Capacidad de razonamiento y matemáticas: limitada por el tamaño; Liquid AI desaconseja razonamiento multi-paso complejo.
- Capacidad de código: no recomendado para programación agéntica según el autor.
- Sin visión ni audio: este checkpoint es exclusivamente de texto (la familia LFM3 incluye variantes de visión, audio, omni y decisión, pero no son este modelo).

## Casos de uso

- Agentes locales en el dispositivo: integrado como cerebro de un agente que llama herramientas en el propio teléfono o portátil, donde el modelo cabe en ~1 GB a 4 bits y evita enviar datos a la nube.
- Asistentes de atención al cliente multi-turno: la ventana de 256K tokens permite mantener el histórico completo de una conversación larga o adjuntar el manual de producto sin truncar.
- Extracción de datos estructurados: dado un contrato, factura o correo, el modelo genera JSON con campos definidos, aprovechando el entrenamiento en salidas estructuradas.
- Automatización de flujos con herramientas: encadenar llamadas a APIs internas (CRM, calendario, ticketing) mediante tool calling en un arnés como OpenClaw o Hermes Agent.
- Procesamiento de documentos largos en local: resumen y pregunta-respuesta sobre informes de decenas de miles de tokens en equipos sin GPU dedicada, apoyándose en la arquitectura híbrida para contener la caché KV.
- Clasificación y enrutado de intenciones en edge: etiquetar tickets o mensajes entrantes en un servidor modesto o en el propio dispositivo antes de derivar a un modelo mayor.
- Especialización vertical por fine-tuning: adaptar el modelo a la jerga y los formatos de un sector concreto (legal, seguros, logística) con un ajuste en una sola GPU.
- Asistente multilingüe de bajo coste: cubrir 16 idiomas con un único modelo pequeño en lugar de mantener varios modelos monolingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas equivalentes, y los resultados de la búsqueda web no aportan datos de evaluación del modelo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB a 4 bits (dato de la model card); en torno a 3,5 GB en bf16/fp16 para los 1,73B parámetros; aproximadamente 7 GB en fp32.
- Caché KV: la arquitectura híbrida (solo 6 capas de atención global y 5 de ventana deslizante) reduce el coste frente a un transformer denso equivalente, aunque no se publican cifras exactas por token de contexto.
- GPU recomendadas: cualquier GPU consumer moderna sirve para cuantización 4-bit (RTX 3060 12 GB, RTX 4060/4070/4090); para bf16 completo basta una GPU con 6-8 GB. En servidor, A100 o H100 no son necesarias para este tamaño y solo se justifican por concurrencia.
- Cabe en GPU consumer: sí, en todas las GPU con 8 GB o más a 4 bits y en la mayoría de portátiles; también en teléfonos según el autor.
- Opciones de despliegue: `transformers` con `trust_remote_code` (confirmado). La model card menciona variantes de checkpoint por framework de inferencia sin detallarlas; no se confirma en la información disponible soporte de llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B | 1,73B | 256K | Tri-híbrida (convolución + atención) | LFM Open License v1.0 | HuggingFace, API y playground de Liquid AI |
| Qwen3-1.7B | ~1,7B | 32K nativo (extensible) | Transformer denso | Apache 2.0 | HuggingFace |
| Llama 3.2 1B | ~1,24B | 128K | Transformer denso | Llama 3.2 Community License | HuggingFace |
| Gemma 3 1B | ~1B | 32K | Transformer denso | Gemma Terms of Use | HuggingFace |

Nota: los datos de los modelos comparables provienen de sus fichas públicas y deben verificarse antes de usarlos en producción; el rendimiento comparado no está disponible porque LFM3-1.7B no publica benchmarks. La ventaja diferencial de LFM3-1.7B frente a estas alternativas es la combinación de 256K de contexto con un consumo de ~1 GB a 4 bits y un post-entrenamiento específico para tool calling; su desventaja es una licencia propia más restrictiva que Apache 2.0 y la falta de métricas públicas.

## Limitaciones y advertencias

- El propio autor desaconseja su uso para programación agéntica y razonamiento multi-paso complejo por el tamaño reducido del modelo.
- Riesgo de alucinación en tareas con alta carga de conocimiento: la model card recomienda explícitamente usar recuperación o búsqueda en esos casos.
- No se publican datos de sesgos, composición del dataset ni evaluaciones de seguridad; no es posible cuantificar sesgos conocidos.
- Licencia LFM Open License v1.0 (identificador `lfm1.0`, "other"): no es una licencia de código abierto estándar, por lo que conviene revisar el texto completo antes de un uso comercial.
- Requiere `trust_remote_code` en `transformers` (`custom_code`), lo que implica ejecutar código del repositorio y añade superficie de riesgo en entornos controlados.
- Solo texto: no procesa imágenes ni audio en este checkpoint.
- La ventana de 256K es nominal; el rendimiento real en contextos muy largos no está documentado con evaluaciones públicas.
- El soporte de los 16 idiomas es declarativo; no se publican métricas por idioma, por lo que la calidad relativa en español o en idiomas de bajos recursos no está verificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LiquidAI/LFM3-1.7B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Blog de lanzamiento de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola / API: https://console.liquid.ai/dashboard
- Colección LFM3 en HuggingFace: https://huggingface.co/collections/LiquidAI/lfm3
- Licencia: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE

Nota: la búsqueda web no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos no guardan relación con LFM3-1.7B y se han descartado.
