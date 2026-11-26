# caslca/Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed

## Resumen

Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed es una cuantizacion de precision mixta (4/8 bits) del modelo TeichAI/Qwen3.8-27B-Fable-Distill, publicada por el usuario caslca bajo el formato MLX OptiQ. El modelo base pertenece a la familia Qwen 3.5 (tag `qwen3_5`), con 26.895.993.856 parametros reales almacenados en safetensors, y ha sido destilado a partir de trazas de Claude (datasets `claude-fable-5-claude-code` y `Fable-5-Chat`) orientadas a generacion de codigo y asistencia agéntica.

La relevancia de esta ficha esta en que se trata de un artefacto de despliegue para Apple Silicon: la conversion asigna precision de 4 u 8 bits por modulo segun sensibilidad KL, con un total efectivo declarado de 4,98 bits por peso y 18,44 GB de shards de texto. Incluye un sidecar de vision en BF16 (`optiq/optiq_vision.safetensors`) y metadatos de procedencia de la conversion, lo que permite reproducir el pipeline.

La model card esta dominada por informes de validacion interna del autor (etiquetas M36, M40, C84, C88, C89) con metodologia estadistica detallada, pero acotada: muestras pequenas, intervalos no ajustados por multiplicidad y gates de vision limitados a descripcion de fotos. Es un modelo para evaluacion practica en local, no una referencia de benchmark publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen 3.5 (tag `qwen3_5`), con modulo de vision acoplado; pipeline `image-text-to-text`. Detalle de capas y atencion no disponible |
| Parametros totales | 26.895.993.856 (26,9 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 262.144 tokens en configuracion de certificacion (cap 262144, thinking budget 81920); pruebas de retrieval hasta 128K y tracking encadenado hasta 156K. Contexto nativo declarado no disponible |
| Tipos de cuantizacion | MLX OptiQ mixta 4/8 bits por sensibilidad KL: 4,983526659518471 bits/peso efectivos, 152 modulos en 8 bits y 346 modulos en 4 bits; vision sidecar en BF16. Existe variante uniforme 4-bit en repo hermano |
| Idiomas soportados | Ingles (`en`) declarado en la model card y en los tags |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (`library_name: mlx`), con `optiq/optiq_vision.safetensors`, `optiq/metadata.json` y `optiq/sensitivity.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen 3.5 con capacidad de imagen-a-texto, destilado por TeichAI a partir de dos datasets de conversacion y codigo generados con Claude: `armand0e/claude-fable-5-claude-code` y `armand0e/Fable-5-Chat`. No se dispone del numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO en el proceso de destilacion; la model card del artefacto cuantizado no aporta esos datos.

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en la conversion: OptiQ asigna 4 u 8 bits por modulo segun su sensibilidad KL, lo que produce una mezcla de 152 modulos de 8 bits y 346 de 4 bits, con 4,98 bits/peso efectivos y 18,44 GB de shards de texto. El autor advierte que estas cifras provienen del manifest de serving y no de una medicion tensorial ponderada nueva, y que los recuentos de tensores empaquetados pueden subestimar el numero real de parametros. El runtime documentado incluye MTP (multi-token prediction) reparado y activado, KV cache en `native16`, retirada de cache de sesion en idle y decodificacion con aceptacion declarada del 84,5 % en una pantalla de tres tareas.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento configurable (thinking budget resuelto de 81920 tokens en las pruebas del autor).
- Generacion y reparacion de codigo, evaluada con HumanEvalPlus y MBPPPlus en harness EvalPlus nativo ARM64.
- Razonamiento matematico, evaluado en Math500 (99 % con predictor ON en la muestra de 100 items del autor).
- Vision imagen-a-texto: gate de 20 fotos con descripcion seguida de autoverificacion contra caption de referencia (20/20 PASS declarado).
- Retrieval y seguimiento de cadenas de variables en contexto largo: 25/25 prompts hasta 128K y 39/39 en cadena-4 hasta 156K.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades agénticas y multi-step: orientado a codificacion agéntica y asistencia de investigacion/diseno segun el estado declarado (B1/C1), aunque sin detalle de protocolo.
- Multilingue: solo ingles declarado.

## Casos de uso

- Asistencia de codificacion agéntica en local: el modelo esta certificado por el autor como opcion de primera eleccion para codificacion agéntica con razonamiento medio, lo que permite integrarlo en bucles de edicion y ejecucion de tests sobre un Mac con 64 GB de memoria unificada.
- Reparacion de codigo con verificacion automatica: el harness EvalPlus nativo ARM64 y las metricas strict/ordinary permiten montar un pipeline de evaluacion continua de parches generados antes de mergear.
- Asistencia de investigacion y redaccion tecnica: las pruebas de prosa de investigacion (40 pares, preferencia OFF 0,40) indican que sirve para borradores y exploracion, con revision humana obligatoria por debilidades factuales y metodologicas compartidas.
- Analisis de documentos largos: con ventana de hasta 262K y pruebas de retrieval hasta 128K, es adecuado para resumir y consultar repositorios de documentacion o expedientes extensos en una sola pasada.
- Descripcion y triaje de imagenes: el sidecar de vision BF16 permite clasificar y describir fotos en flujos de inventario o soporte, aceptando que el gate del autor es una pantalla permisiva y no cubre OCR ni diagramas complejos.
- Razonamiento matematico asistido: con 99 % en Math500 (n=100) en el estado ON, sirve para tutoria y comprobacion de derivaciones, siempre con verificacion simbolica posterior.
- Despliegue en estaciones de trabajo Apple Silicon: al ser un artefacto MLX de 19,7 GB de repo y 18,44 GB de texto, encaja en portatiles y equipos de sobremesa con memoria unificada de 32-64 GB sin GPU dedicada.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card. Las muestras son pequenas y los intervalos son descriptivos, no ajustados por multiplicidad.

| Benchmark | Configuracion | Resultado | Notas |
|---|---|---:|---|
| HumanEvalPlus (50x3) | Predictor OFF / ON strict | 92,0 % / 90,67 % | Delta −1,33 pp [−5,33; +2,0]; 600 respuestas convergentes |
| MBPPPlus (50x3) | Predictor OFF / ON strict | 84,67 % / 85,33 % | Delta +0,67 pp [−2,0; +4,67] |
| Pooled diagnostico (100x3) | OFF / ON | 88,33 % / 88,0 % | Delta −0,33 pp [−3,0; +2,33] |
| Math500 (n=100) | OFF / ON | 97 % / 99 % | +2 pp [0; +5]; MDE nominal 12,5 pp |
| Prosa de investigacion (40 pares) | Preferencia OFF | 0,40 [0,29; 0,53] | Holm p=0,099; estudio sin potencia |
| Cadena-4 128K (3 draws) | ON / OFF | 3/3 y 3/3 | Sin agotamiento de presupuesto |
| Gate de vision 20 fotos | ON / OFF | 20/20 y 20/20 | Pantalla permisiva, no benchmark rankeado |
| C84 regresion runtime (5 tareas por eje) | AFTER | math500 5/5; humanevalplus 4/5; mbppplus 5/5; cjudge 5 empates revisados | Ratios de tiempo de tarea 1,012-1,025; MDE nominal 56 pp |

Rendimiento de decodificacion declarado: pantalla de tres tareas con 1,836x de velocidad y 84,5 % de aceptacion; generacion completa 1,123 h ON frente a 2,691 h OFF (ratio de pared 0,417 [0,238; 0,603], ratio de tokens 0,778 [0,463; 1,082]) en M5 Max de 64 GB con MLX/Metal 0.32.2.

## Requisitos de hardware

- VRAM/memoria unificada: 18,44 GB de shards de texto mas sidecar de vision BF16; el repo completo ocupa 19,7 GB. Presupuesto practico de 24-32 GB de memoria para inferencia con cache KV, y 64 GB para contextos de 128K-262K con thinking budget de 81920.
- GPU: el artefacto es MLX, por lo que el destino son chips Apple (M-series). El autor reporta M5 Max de 64 GB. No hay soporte declarado para A100, H100 ni RTX 4090 en este repo.
- Consumer GPU: no aplica en el sentido habitual; cabe en equipos Apple Silicon con memoria unificada suficiente, no en GPUs NVIDIA de consumo con este formato.
- Opciones de despliegue: MLX-VLM (commit `420c01e1` en las pruebas) y MLX-Serve (commit `0ccc684`). El tag `text-generation-inference` aparece en los metadatos, pero no se documenta un despliegue TGI verificado.
- Latencia y throughput: en M5 Max 64 GB, generacion completa de la campana M36 en 1,123 h con predictor ON frente a 2,691 h OFF; ratio de decodificacion por peticion 0,977-0,995 en la pantalla C84.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| caslca/Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed | 26,9 B | hasta 262K en pruebas | OptiQ mixta 4/8 bits (4,98 bpw) | Apache 2.0 | MLX, 262 descargas |
| caslca/Qwen3.8-27B-Fable-Distill-mlx-uniform-4bit | 26,9 B (base) | no disponible | 4 bits uniforme | Apache 2.0 | MLX, repo hermano |
| TeichAI/Qwen3.8-27B-Fable-Distill | 26,9 B (base) | no disponible | BF16 (base) | Apache 2.0 | Repo base en Hugging Face |

La comparacion con modelos de otras familias (por ejemplo, Qwen 3.5 sin destilar o destilados de codigo de 30B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La evidencia de calidad es interna y de baja potencia: MDE nominal de 17,7 pp por dataset y 12,5 pp agrupado en M36; 12,5 pp con n=100 y 20 pp con n=40 en M40; 56 pp por eje en C84. Los intervalos no estan ajustados por multiplicidad.
- Los gates de vision no certifican imagenes arbitrarias, OCR ni diagramas complejos; el gate de 20 fotos es una pantalla permisiva con autoverificacion contra caption de referencia.
- La equivalencia de calidad con `native16` no esta establecida; el autor lo advierte explicitamente y senala que la evidencia M40 uso TQ4.
- Las cifras de bits/peso y numero de modulos provienen del manifest de serving, no de una medicion tensorial ponderada; los badges de parametros en el hub pueden subestimar el total por el empaquetado de tensores de bajo bit.
- Solo ingles declarado: no hay evidencia de calidad en castellano ni en otros idiomas.
- Las pruebas de prosa de investigacion encontraron debilidades factuales y metodologicas compartidas y fueron no ciegas, con un solo revisor.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el modo de razonamiento largo con presupuesto de 81920 tokens aumenta el coste y puede alargar latencias.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia de los datos de destilacion (trazas de Claude) debe revisarse por el usuario antes de un despliegue en produccion.
- Dependencia de versiones concretas de MLX-VLM y MLX-Serve; cambios de runtime alteran el rendimiento y la reproducibilidad de las cifras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caslca/Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed
- Modelo base: https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill
- Variante uniforme 4-bit: https://huggingface.co/caslca/Qwen3.8-27B-Fable-Distill-mlx-uniform-4bit
- Dataset de codigo: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- Dataset de chat: https://huggingface.co/datasets/armand0e/Fable-5-Chat
- Papers, blogs, repos de MLX-VLM y MLX-Serve y demos: no disponibles en la informacion proporcionada.
