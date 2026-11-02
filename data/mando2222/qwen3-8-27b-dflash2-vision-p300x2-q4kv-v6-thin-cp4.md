# mando2222/qwen3.8-27b-dflash2-vision-p300x2-q4kv-v6-thin-cp4

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un bundle de despliegue optimizado sobre `Qwen/Qwen3.8-27B`, publicado por el usuario `mando2222`. Se trata de una build de prueba (denominada cp4) del paquete "v6 thin" que incorpora la ronda mas reciente de optimizaciones de decodificacion sobre hardware Tenstorrent Blackhole. El modelo subyacente es Qwen3.8-27B, con capacidades de vision, y los pesos se referencian desde el repositorio original de Qwen; este repo solo aporta el apuntador de pesos, la configuracion de servido y el codigo de modelo, plugin y operadores GDN actualizados.

El interes tecnico del artefacto esta en la infraestructura: decodificacion especulativa DFlash con rejection sampling exacto, kernels de matmul en streaming con mayor ancho de banda DRAM en tamaños de decodificacion, y un presupuesto de "thinking" configurable del lado del servidor para agentes de codigo. El bundle esta pensado para dos placas p300c (cuatro chips Blackhole en malla 1x4, FABRIC_1D) y se sirve mediante las herramientas `tt-model`.

La relevancia es acotada pero concreta: documenta el rendimiento real de Qwen3.8-27B en aceleradores Tenstorrent, con cifras de throughput medidas y puertas de correccion. No hay informacion publicada sobre el entrenamiento del modelo base en esta ficha, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, con un tamaño de 0.0 GB (solo apuntadores y configuracion).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; el bundle anade DFlash speculative decoding y ops GDN) |
| Parametros totales | 27B (segun el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (maximo del servidor) |
| Tipos de cuantizacion | q4kv (segun el nombre del repo); drafter en bfp8 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (los pesos se descargan desde `Qwen/Qwen3.8-27B` en el primer uso; el repo no almacena pesos) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna ni el entrenamiento del modelo base Qwen3.8-27B en la documentacion proporcionada. El bundle anade una capa de inferencia con decodificacion especulativa DFlash: el drafter muestrea sus borradores de su propia distribucion para peticiones con sampling, con una regla de rechazo que preserva la distribucion exacta del modelo objetivo, lo que se traduce en aproximadamente un 5% mas de tokens aceptados por paso respecto a cp3. Los matmuls de decodificacion (MLP, proyecciones de entrada y salida GDN, QKV de atencion y salida) usan un kernel de streaming local al banco con entre 1,6 y 3 veces el ancho de banda DRAM del matmul por defecto en tamaños de decodificacion.

El bundle incluye ademas top-k sampling en dispositivo, residual replicado, fusion de la preparacion y post-proceso de atencion, all-reduce de frontera con dos enlaces y split de valores GDN para el paso de verificacion de un usuario. Los matmuls en streaming no son bit-exactos respecto a cp3: la media de |Δlogprob| en el carril plano es de 0,019. No hay datos sobre tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento, con modo de razonamiento ("thinking") cuyo esfuerzo es configurable.
- Capacidades de vision, segun el nombre del bundle y la puerta de verificacion de vision superada.
- Generacion de codigo, con rendimiento destacado en prompts con mucho codigo (90-107 tok/s en decodificacion de un usuario).
- Tool calling y function calling, implícito en el uso como agente de codigo descrito en la model card.
- Razonamiento multi-paso y agentes: la model card menciona presupuesto de razonamiento para agentes de codigo y llamadas a herramientas.
- Sampling configurable: temperatura, top-k, top-p, seed, penalizaciones de presencia, frecuencia y repeticion, `min_p`, `min_tokens`, log-probs, `logit_bias`, `bad_words` y salida estructurada (con carriles especificos segun la peticion).
- Multilingue: no disponible.

## Casos de uso

- Servicio de inferencia en aceleradores Tenstorrent: el bundle esta disenado para desplegar Qwen3.8-27B en dos placas p300c con cuatro chips Blackhole, usando `tt-model pull` y `tt-model serve`. Es adecuado cuando el objetivo es ejecutar el modelo fuera de GPUs convencionales.
- Agentes de codigo con control de razonamiento: con `TT_THINK_BUDGET=6144` se limita el razonamiento a 6144 tokens antes de forzar la respuesta o la llamada a herramienta, evitando turnos aparentemente colgados y llenado de contexto. Util para pipelines de CI/CD y asistentes de programacion.
- Generacion de codigo en produccion: el carril DFlash alcanza 90-107 tok/s en prompts con mucho codigo, adecuado para autocompletado y generacion de parches en un solo usuario.
- Procesamiento de contexto largo: con 262.144 tokens de contexto maximo se pueden analizar repositorios, documentos extensos o conversaciones largas, aunque sin prefix caching el prefijo se recalcula (unos 6,5 s a 41K tokens y 43 s a 168K).
- Atencion al cliente automatizada multi-turno: el modelo soporta conversaciones multi-turno con sampling por defecto (temperatura 1.0, top_k 20, top_p 0.95) y hasta 8 slots concurrentes.
- Analisis de imagenes con vision: el bundle supera las comprobaciones de vision y puede usarse para tareas que combinen texto e imagen, como extraccion de informacion de capturas o documentos escaneados.
- Despliegue multiusuario: con 4 usuarios el throughput total es de unos 178 tok/s y con 8 usuarios unos 250 tok/s, adecuado para equipos pequenos que compartan el mismo servidor.

## Benchmarks y rendimiento

Rendimiento medido en la maquina de build (host compartido, variacion de ±5%):

| Carril | cp4 tok/s | cp3 tok/s |
|---|---|---|
| 1 usuario, sampled (DFlash) | ~80 (90-107 en prompts con mucho codigo) | ~71-73 |
| 1 usuario, greedy (DFlash) | ~82 | ~74-77 |
| 1 usuario, decodificacion plana (penalizaciones / log-probs) | ~47 | ~39 |
| 4 usuarios, sampled, total | ~178 | ~164 |
| 8 usuarios, sampled, total | ~250 | ~250 |

Puertas de calidad: correccion 10/10, razonamiento 18/18, vision y comprobaciones de distribucion de sampling superadas. Desviacion de logprob frente a cp3: media de |Δlogprob| de 0,019 en el carril plano.

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: dos placas p300c (cuatro chips Tenstorrent Blackhole, malla 1x4, FABRIC_1D). No es un bundle para GPU.
- VRAM estimada: no disponible (no aplica; el modelo se ejecuta en Blackhole).
- GPU recomendadas: no disponible; el bundle esta disenado para aceleradores Tenstorrent.
- Cabe en GPU consumer: no disponible; el diseno no apunta a GPU.
- Despliegue: `tt-model pull` y `tt-model serve`; el primer arranque compila kernels en una cache nueva y tarda unos 6-7 minutos, los arranques posteriores unos 2,5-3 minutos. Los pesos de `Qwen/Qwen3.8-27B` se descargan en el primer uso.
- Throughput: ver tabla de benchmarks (hasta ~250 tok/s con 8 usuarios en sampled).
- Prefill: sin prefix caching, unos 6,5 s a 41K tokens y 43 s a 168K tokens.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la informacion suministrada. La unica comparacion disponible es contra la build anterior del mismo bundle (cp3), recogida en la tabla de benchmarks.

## Limitaciones y advertencias

- Sin prefix caching: un contexto largo reenviado se vuelve a preprocesar, con coste de prefill de 6,5 s a 41K tokens y 43 s a 168K tokens.
- Maximo de 8 slots y 262.144 tokens de contexto.
- El razonamiento puede consumir 15-30K tokens con esfuerzo medio, lo que parece un turno colgado en un agente y llena el contexto; el cap `TT_THINK_BUDGET` esta desactivado por defecto.
- Los matmuls en streaming no son bit-exactos respecto a cp3 (media de |Δlogprob| de 0,019), lo que puede afectar a reproducibilidad estricta.
- Ciertas peticiones no usan DFlash y van por el carril plano, con menor rendimiento: `n` > 1, penalizaciones de frecuencia o repeticion, `min_p`, `min_tokens`, log-probs, salida estructurada, `logit_bias` o `bad_words`.
- Build de prueba: el autor la describe como "test build", con 0 descargas y 0 likes; no hay garantia de estabilidad ni de soporte.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base `Qwen/Qwen3.8-27B` antes de produccion.
- Sesgos y riesgo de alucinacion: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mando2222/qwen3.8-27b-dflash2-vision-p300x2-q4kv-v6-thin-cp4
- Build anterior referenciada: https://huggingface.co/mando2222/qwen3.8-27b-dflash2-vision-p300x2-q4kv-v6-thin
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
