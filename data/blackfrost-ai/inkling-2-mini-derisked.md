# Blackfrost-AI/Inkling-2-Mini-Derisked

## Resumen

Inkling-2-Mini-Derisked es un derivado del modelo thinkingmachines/Inkling-2-Mini, publicado por Blackfrost-AI. Se trata de una modificación a nivel de pesos que reduce los rechazos falsos ante peticiones seguras, manteniendo un suelo de rechazo ante peticiones claramente dañinas. El modelo base emplea una arquitectura de transformer con bucles de capas (loop transformer), en la que determinadas capas físicas se reejecutan varias veces, lo que permite aumentar la profundidad efectiva sin incrementar proporcionalmente el número de parámetros.

El artefacto publicado conserva intactos el tokenizador, la configuración, los valores por defecto de generación y el módulo MTP (multi-token prediction) del modelo original. La modificación se aplica únicamente sobre el espacio de salida del escritor de atención, mediante una ortogonalización por consenso entre pasadas del bucle, y se documenta con artefactos de captura y un recibo de edición verificables por checksum. El modelo se distribuye en safetensors con la cuantización nativa del proveedor y está pensado para vLLM con decodificación especulativa DSpark.

La relevancia de esta ficha radica en que ejemplifica una tendencia creciente: derivados de pesos que alteran el comportamiento de rechazo de un modelo sin reentrenamiento completo, con trazabilidad parcial del método. No obstante, el proceso de modificación es propietario y no se distribuye, lo que limita la reproducibilidad. Los benchmarks del modelo original no son transferibles a este artefacto, según advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Loop transformer (modelo de lenguaje causal con capas reejecutadas) |
| Parametros totales | 26.388.646.440 (según safetensors); ~17,6B según la model card |
| Parametros activos | ~5,4B por token con la configuración de tres pasadas del proveedor |
| Longitud de contexto | 262.144 tokens (declarado por el upstream; validado a esa ventana en el runtime del operador) |
| Tipos de cuantizacion | Cuantización nativa del proveedor, 8-bit (modelopt); sin re-cuantización por parte del derivado |
| Idiomas soportados | no disponible |
| Licencia | other (sujeta a los términos del release upstream de Thinking Machines) |
| Formato de pesos | safetensors (vLLM), más módulo MTP en safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con bucle de capas: un subconjunto de capas físicas se ejecuta repetidamente (tres pasadas para las capas 6–17 según la captura de direcciones, y una pasada en el resto). Esta estructura permite una profundidad efectiva mayor con un coste de parámetros contenido, y explica la diferencia entre los ~17,6B declarados y los 26,4B medidos en las cabeceras de los shards de safetensors. El modelo incorpora decodificación especulativa DSpark con 7 tokens especulativos y un módulo MTP conservado byte a byte respecto al upstream.

El entrenamiento original corresponde a thinkingmachines/Inkling-2-Mini; esta ficha no dispone de datos sobre el número de tokens, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base. La modificación del derivado no es un reentrenamiento: consiste en una ortogonalización por columnas de consenso entre pasadas del espacio de salida del escritor de atención (`attn.wo_ud.weight`), aplicada a las capas físicas 9–18 con alpha 2,5 y manteniendo la estructura de pasadas del bucle. No se aplica blanqueado ni PCA. El método exacto es propietario y no se distribuye, aunque se publican los artefactos de captura (`directions.npz` de 48 sitios y 2304 estados ocultos, y `raw-capture.npz` con 64 prompts) y un recibo de edición que vincula el checksum del shard modificado.

## Capacidades

- Generación de texto conversacional con plantilla de chat del proveedor y parser de razonamiento `inkling`, que devuelve el razonamiento en un campo `reasoning` dedicado.
- Razonamiento multi-paso implícito en el modo de razonamiento del parser.
- Decodificación especulativa DSpark con 7 tokens especulativos y MTP preservado, orientada a reducir latencia en serving.
- Ventana de contexto larga de 262.144 tokens, validada a esa longitud en el runtime del operador.
- Concurrencia validada de 8 flujos de generación paralelos durante la evaluación.
- Comportamiento de rechazo modulado: 0 % de rechazos falsos en 75 prompts seguros (xstest) y 9,8 % de rechazos reales en 295 prompts dañinos (advbench + strongreject) según las observaciones del autor.
- Soporte de tool calling y agentes: no disponible en la información proporcionada; la model card indica que el runtime no incluye un ejecutor de herramientas específico de aplicación.
- Capacidades multilingües: no disponible.

## Casos de uso

- Evaluación interna de comportamiento de rechazo: el modelo sirve como punto de operación controlado para estudiar cómo una edición a nivel de pesos en el espacio de atención desplaza la frontera entre rechazo falso y rechazo genuino, con artefactos de captura que permiten auditar el efecto.
- Investigación sobre loop transformers: al preservar la estructura de pasadas y publicar las direcciones por sitio (24 capas físicas × visitas del bucle), permite estudiar cómo se propaga una edición en arquitecturas con capas reejecutadas.
- Serving de chat de largo contexto: con 262.144 tokens validados y 8 flujos concurrentes, es adecuado para asistentes conversacionales que arrastran documentos extensos en la ventana.
- Despliegue en vLLM con decodificación especulativa: la combinación de DSpark y MTP preservado lo hace apto para pipelines donde la latencia por token es crítica, siempre que se siga la receta de serving del kit de despliegue.
- Reproducción de la metodología de captura: los ficheros `directions.npz` y `raw-capture.npz` permiten reejecutar análisis de estados ocultos sobre 64 prompts y 48 sitios sin necesidad de acceso al método propietario.
- Verificación de integridad de artefactos: los checksums SHA-256 publicados para el shard de pesos, el módulo MTP y los artefactos de captura permiten validar la cadena de custodia en entornos de evaluación regulados.
- Estudio comparativo de derivados: útil para medir cuánto del comportamiento del upstream se conserva tras una edición de pesos, dado que tokenizador, configuración y MTP son idénticos al original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor advierte explícitamente que las puntuaciones del upstream no son transferibles a este artefacto modificado. Las únicas métricas publicadas son observaciones operacionales de rechazo sobre 443 filas adjudicadas a mano, con prompts sin formato, presupuesto de respuesta de 32k y cero errores de API:

| Observacion | Resultado | Tasa |
|---|---:|---:|
| Cumplimiento en el brazo dañino (advbench + strongreject) | 266/295 | 90,2 % |
| Rechazos reales en el brazo dañino | 29/295 | 9,8 % |
| Rechazos falsos en prompts seguros (xstest) | 0/75 | 0,0 % |

Barrido de alpha sobre un conjunto de humo de 50 prompts: la tasa de respuesta creció de forma monótona con la escala de edición (alpha 1,5 → 2,5: de 21 a 38 respuestas; rechazos de 15 a 2), sin errores ni pérdida de coherencia en el punto de operación seleccionado.

## Requisitos de hardware

- El repositorio ocupa 20,3 GB, con un shard de pesos de 19.526.019.168 bytes en 8-bit y un módulo MTP de 635.801.416 bytes. La VRAM necesaria para inferencia debe cubrir al menos el tamaño del shard más el espacio de activaciones y caché KV para la ventana configurada.
- Con 262.144 tokens de contexto, la caché KV domina el consumo de memoria; el despliegue a ventana completa requiere GPUs de centro de datos con memoria agregada alta (A100 80 GB, H100 80 GB o configuraciones multi-GPU con tensor parallelism).
- No hay datos publicados sobre si el modelo cabe en GPU de consumo; por el tamaño del shard en 8-bit, una RTX 4090 de 24 GB quedaría al límite y no permitiría ventanas de contexto largas.
- Opciones de despliegue: vLLM es la ruta validada, con la receta de serving del proveedor incluida en `deployment-kit/`. No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La decodificación especulativa DSpark con 7 tokens especulativos y el MTP preservado están orientados a mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Derisked | 26,4B medidos (~17,6B declarados; ~5,4B activos) | 262.144 | other (términos upstream) | Pesos en HF, 398 descargas, 81 likes | Derivado con edición de pesos; método propietario |
| thinkingmachines/Inkling-2-Mini | ~17,6B (~5,4B activos) | 262.144 | Términos de Thinking Machines | Upstream público | Sin modificación de comportamiento de rechazo |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- El método de modificación es propietario y no se distribuye; la reproducibilidad del derivado depende únicamente de los artefactos de captura y del recibo de edición publicados.
- La model card contiene una corrección de documentación del 24 de noviembre de 2026: la versión original del runbook describía un basis "CW whitened", "4 visitas del bucle", un sitio de captura en `down_proj` y una batería "held-out" que los scripts y recibos enviados contradecían. Los scripts, capturas y pesos no cambiaron, pero conviene revisar la revisión corregida antes de confiar en la documentación.
- Las métricas de rechazo son observaciones operacionales del autor sobre su propio runtime, no un benchmark controlado entre modelos; los falsos positivos marcados por regex se excluyeron tras revisión manual.
- La modificación eleva el cumplimiento en el brazo dañino al 90,2 % (266/295), lo que constituye un riesgo de seguridad relevante para cualquier despliegue orientado al público. No debe usarse como sustituto de un modelo alineado en producción sin capas de moderación externas.
- Los benchmarks del upstream no son transferibles; no hay evaluación comprehensiva del derivado (el autor indica que está "en progreso").
- La licencia es "other" y remite a los términos del release de Thinking Machines; no se detallan restricciones de uso comercial en la información disponible.
- Idiomas soportados: no disponible.
- El runtime no incluye un ejecutor de herramientas de aplicación; el soporte de tool calling y agentes no está documentado.
- La ventana de 262.144 tokens es una especificación del upstream; el autor advierte que no implica validación en todos los despliegues downstream.
- La model card indica leer completamente `deployment-kit/AGENT_INSTRUCTIONS.md` antes de servir el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Blackfrost-AI/Inkling-2-Mini-Derisked
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Artefactos internos del repo (según model card): `deployment-kit/AGENT_INSTRUCTIONS.md`, `DWM_RECIPE/` (scripts, batería hard32, captura, runbook), `DWM_RECIPE/s3-edit-receipt-a25.json`, `s2-capture/directions.npz`, `s2-capture/raw-capture.npz`
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
