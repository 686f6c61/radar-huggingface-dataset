# singularity-layer/Singularity-xMESH-0.8B-GGUF

## Resumen

Singularity xMESH 0.8B es un modelo de decisión (no un modelo conversacional) desarrollado por singularity-layer dentro del ecosistema x402. Su función es responder preguntas tipadas —`noul` (sí/no), `choice` y `score`— sobre un estado dado, devolviendo probabilidades calibradas a través del endpoint nativo `/v1/systemone` de llama.cpp. Está diseñado para seleccionar servicios y etapas en flujos de enrutamiento x402, no para generar texto libre.

El modelo base cuenta con 779.717.956 parámetros (aproximadamente 0,8B) y se distribuye bajo licencia Apache 2.0. Esta ficha cubre la versión cuantizada en GGUF, publicada en cinco variantes que van de 8 a 4 bits, pensadas para ejecución en CPU y Apple Silicon. El repositorio ocupa 3,1 GB e incluye los archivos cuantizados junto con material gráfico.

La relevancia de esta release radica en su enfoque de despliegue: el autor verifica cada cuantización decisión por decisión contra el archivo BF16 de referencia, publicando métricas de acuerdo (agreement), deriva de probabilidad, ECE y Brier. Esto permite elegir el nivel de compresión con un compromiso calidad/tamaño medido, algo poco habitual en publicaciones de GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión sobre transformer; detalles no publicados) |
| Parametros totales | 779.717.956 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el perfil de producción usa `-c 2048`) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS (y BF16 de referencia en el repo original) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (referencia BF16 en GGUF: `Singularity-xMESH-0.8B-BF16.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo base más allá de su naturaleza de "decision model" con salidas tipadas (`noul`, `choice`, `score`) y probabilidades calibradas. El autor no detalla en la información disponible si emplea un transformer estándar, ni el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF/DPO.

El proceso de cuantización sí está documentado con precisión: todos los archivos GGUF se generaron a partir del BF16 propio del autor (`Singularity-xMESH-0.8B-BF16.gguf`, SHA-256 `9f4c08f19c4d203059bc74ed2754e800ec472d7276d8ddb2321480e86d392fff`) usando llama.cpp `b11719`, y cada variante se validó decisión por decisión contra ese BF16. La evaluación se hizo con el perfil de producción `-c 2048 -b 2048 -ub 2048 --parallel 1` sobre dos suites: la suite x402 congelada (80 casos, 960 decisiones) y una suite general de 76 peticiones y 264 decisiones.

## Capacidades

- Respuesta a preguntas tipadas de decisión: `noul` (sí/no), `choice` (selección entre opciones) y `score` (puntuación, incluidos valores de 0 a 3).
- Enrutamiento x402: determinar qué etapas necesita un flujo, qué servicio elegir para cada etapa, si el flujo es válido y si conviene pedir aclaración.
- Selección de servicios bajo restricciones de presupuesto y límites de red.
- Clasificación de tickets, idioma y sentimiento.
- Comprobaciones sí/no sobre listings, logs y pagos.
- Salida con probabilidades calibradas (se reportan ECE y Brier frente al BF16).
- No es un modelo conversacional: no está pensado para generación de texto libre, código, matemáticas ni visión.
- No se documenta soporte de tool calling genérico, agentes multi-paso ni modo thinking; su función es la decisión puntual vía `/v1/systemone`.
- Multilingüe: no; solo inglés (`en`).

## Casos de uso

- Enrutamiento de flujos x402: dado un estado, decidir qué etapas requiere el flujo y qué servicio asignar a cada una. Es el caso para el que se construyó y el que cubre la suite congelada de 960 decisiones.
- Pasarela de pago con validación previa: usar las respuestas `noul` para comprobar condiciones sobre pagos y logs antes de mover dinero, manteniendo comprobaciones de presupuesto y aprobación propias delante de cualquier acción sensible.
- Clasificación de tickets de soporte: asignar categoría, idioma y sentimiento con `choice` y `score` (0 a 3) en un pipeline de triaje.
- Selección de servicio bajo restricciones: elegir proveedor respetando presupuesto y límites de red mediante decisiones `choice` con probabilidades calibradas.
- Despliegue en edge y CPU: con IQ4_XS (487 MB, 932 MB de RAM pico) o Q4_K_M (547 MB, 1.087 MB pico) puede ejecutarse en máquinas pequeñas y Apple Silicon sin GPU.
- Filtro de aclaración en asistentes: decidir si el sistema debe pedir aclaración al usuario antes de continuar, usando la decisión binaria `noul`.
- Validación de flujos completos: comprobar si un flujo es válido de extremo a extremo, con la métrica de "flujos completos exactos" que el autor reporta frente a BF16.

## Benchmarks y rendimiento

Los datos publicados comparan cada cuantización con el BF16 de referencia, no con otros modelos. Se presentan a continuación.

| Archivo | Bits | Tamano | Igual que BF16 (x402) | Igual que BF16 (general) | RAM pico CPU | Decisiones cambiadas (de 1.224) |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 | 8 | 787 MB | 99,9% | 99,6% | 1.541 MB | 2 |
| Q6_K | 6 | 667 MB | 99,6% | 98,1% | 1.308 MB | 9 |
| Q5_K_M | 5 | 613 MB | 99,3% | 98,1% | 1.161 MB | 12 |
| Q4_K_M | 4 | 547 MB | 98,7% | 92,0% | 1.087 MB | 34 |
| IQ4_XS | 4 (i-quant) | 487 MB | 98,4% | 94,7% | 932 MB | 29 |
| BF16 (referencia) | 16 | 1.572 MB | — | — | no disponible | 0 |

El autor también reporta, para la tabla completa, columnas de deriva de probabilidad (x402 / general), acierto en x402 y general, flujos completos exactos, cambio de ECE y cambio de Brier; en la información disponible solo se detalla el valor de BF16 en "igual que BF16, x402" (960). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: desde 932 MB de RAM pico en CPU con IQ4_XS hasta 1.541 MB con Q8_0; el BF16 de referencia ocupa 1.572 MB en disco.
- Cabe en CPU y Apple Silicon: el autor etiqueta explícitamente `cpu` y `apple-silicon`; no requiere GPU.
- GPU recomendadas: no disponible (no se documentan requisitos de GPU).
- Despliegue: llama.cpp (construido con `b11719`), con el endpoint nativo `/v1/systemone`; el perfil de producción documentado es `-c 2048 -b 2048 -ub 2048 --parallel 1`. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión con salidas tipadas y probabilidades calibradas) en la documentación proporcionada. La comparación publicada por el autor es exclusivamente interna, entre las cuantizaciones GGUF y el BF16 de referencia, no frente a terceros.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Singularity xMESH 0.8B (GGUF) | 779.717.956 | no disponible | apache-2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de chat: no debe usarse para generación de texto libre, código, matemáticas ni tareas conversacionales.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Las cuantizaciones de 4 bits (Q4_K_M e IQ4_XS) cambian 34 y 29 de 1.224 decisiones respectivamente, con mayor deriva en decisiones generales (92,0% y 94,7% de acuerdo); el autor recomienda mantener comprobaciones de presupuesto y aprobación delante de cualquier acción que mueva dinero.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales del ecosistema x402.
- El modelo depende de un endpoint específico de llama.cpp (`/v1/systemone`) para su interfaz tipada; la integración con otros servidores de inferencia no está documentada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de la comunidad.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/singularity-layer/Singularity-xMESH-0.8B-GGUF
- Modelo base: https://huggingface.co/singularity-layer/Singularity-xMESH-0.8B
- Artículo de release: https://www.x402layer.cc/blog/singularity-xmesh-0-8b
- Sitio del autor: https://www.x402layer.cc
- Archivo Q8_0: https://huggingface.co/singularity-layer/Singularity-xMESH-0.8B-GGUF/blob/main/Singularity-xMESH-0.8B-Q8_0.gguf
- Archivo Q6_K: https://huggingface.co/singularity-layer/Singularity-xMESH-0.8B-GGUF/blob/main/Singularity-xMESH-0.8B-Q6_K.gguf
- Archivo Q5_K_M: https://huggingface.co/singularity-layer/Singularity-xMESH-0.8B-GGUF/blob/main/Singularity-xMESH-0.8B-Q5_K_M.gguf
- Archivo Q4_K_M: https://huggingface.co/singularity-layer/Singularity-xMESH-0.8B-GGUF/blob/main/Singularity-xMESH-0.8B-Q4_K_M.gguf
- Archivo IQ4_XS: https://huggingface.co/singularity-layer/Singularity-xMESH-0.8B-GGUF/blob/main/Singularity-xMESH-0.8B-IQ4_XS.gguf
