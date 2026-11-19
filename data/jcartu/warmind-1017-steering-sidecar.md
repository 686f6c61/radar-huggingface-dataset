# jcartu/WARMIND-1017-Steering-Sidecar

## Resumen

WARMIND-1017-Steering-Sidecar es un artefacto de *activation steering* de 668 KiB publicado por el usuario jcartu que se acopla al modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017` para modificar su comportamiento en tiempo de inferencia sin alterar los pesos del modelo. No es un modelo completo: es un conjunto de 99 tensores que codifican direcciones de rechazo proyectadas y ganancias de restauración de norma por capa, aplicadas sobre las activaciones internas del transformer durante la generación.

El problema que resuelve es operativo: en lugar de mantener dos copias completas del modelo (una "stock" con rechazos y otra "abliterated" sin ellos), este sidecar permite alternar por petición entre el comportamiento original y el comportamiento sin restricciones mediante un parámetro `steering_scale` en el rango `[0.0, 1.0]`. La relevancia actual radica en que reduce el coste de almacenamiento de aproximadamente 473 GiB por núcleo a 668 KiB, y permite mezclar peticiones con distintos niveles de *steering* en el mismo lote de GPU sin pérdida de rendimiento.

La librería declarada es `flare` (HyperFlare), y requiere una compilación con el PR #404 de NVIDIA/hyperflare-inference para exponer el parámetro por petición. El modelo base es un DeepSeek de la familia V4.1 en variante Flash, del que no se detallan parámetros ni contexto en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sidecar de *activation steering* sobre transformer (modelo base: DeepSeek-V4.1-Flash-1017) |
| Parámetros totales | no disponible (el sidecar contiene 99 tensores; el modelo base no reporta cifra) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (se mencionan pruebas con prompts de hasta 33.380 y 27.051 tokens) |
| Tipos de cuantizacion | no disponible (el sidecar usa float32 y bfloat16 internamente) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El sidecar no entrena un modelo nuevo, sino que deriva direcciones de activación a partir de un proceso de *abliteration* con preservación de norma y biproyección (metodología atribuida a grimjim). Para cada capa del decodificador entre L=4 y L=36 almacena tres tensores: un escalar `alpha` en float32 con valores en `[3.0, 3.5]` que actúa como fuerza compensada por proyección, una dirección unitaria `direction` en bfloat16 de dimensión 5120 que representa la dirección de rechazo proyectada sobre la abstención, y un vector `attn_row_gain` en bfloat16 de dimensión 5120 que restaura la norma de fila tras la biproyección desde `attn.wo_b`.

La innovación técnica principal es la aplicación por petición: el sidecar se enlaza en el momento de `flare export` y expone un deslizador `steering_scale` en `/v1/chat/completions` y `/v1/completions`. El sistema mantiene aislamiento de caché de prefijo mediante hashes BLAKE2b, de modo que peticiones con escalas distintas no comparten entradas de caché, mientras que peticiones con la misma escala sí las reutilizan. La variante experimental `orth5c` añade una quinta dimensión con una dirección de código limpio frente a código con errores, verificada con un 15,6% de SQuAD2 estricto no soportado.

## Capacidades

- Con `steering_scale: 0.0` (u omitido), el modelo se comporta como el DeepSeek-V4.1-Flash-1017 original, incluyendo sus rechazos de frontera (90/100 en la batería de rechazo del arnés `warmind-sec-harness`).
- Con `steering_scale: 1.0`, reproduce el comportamiento del modelo WARMIND-1017 v1.1 (`orth4c`) con 0/100 rechazos, manteniendo un 96% de acuerdo por ítem con la versión editada en pesos.
- Valores intermedios (por ejemplo 0.75, 0.25) permiten graduar el nivel de restricción sin recargar el modelo.
- Aislamiento de caché de prefijo por escala: peticiones con distinta escala no comparten caché (0 tokens cacheados entre 0.75 y 0.25), y con la misma escala reutilizan el 100% (27.051/27.051 tokens).
- Mezcla en el mismo lote de GPU: peticiones con escala 0.0 y 1.0 conviven en el mismo batch con separación conductual del 100% por carril y coincidencia bit-exacta del primer token.
- Soporte de *tool calling* y agentes: heredado del modelo base, no documentado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo *thinking*, visión o audio: no disponibles.

## Casos de uso

- Auditoría de código y revisión de configuraciones en modo stock: con `steering_scale: 0.0` el modelo mantiene sus rechazos de frontera y su comportamiento conservador, adecuado para revisar configuraciones nginx o ficheros de infraestructura sin que el modelo genere contenido ofensivo no solicitado.
- Red teaming y trabajo de seguridad ofensiva: con `steering_scale: 1.0` el modelo deja de rechazar peticiones (0/100 en la batería del autor), lo que permite generar escenarios de ataque, payloads de prueba y análisis de vulnerabilidades sin fricción de rechazo.
- Plataforma unificada con doble perfil por usuario: un mismo servidor HyperFlare atiende a equipos de auditoría (escala 0.0) y a equipos de seguridad (escala 1.0) sin duplicar los 473 GiB del núcleo del modelo, ahorrando aproximadamente 22 GiB de disco incremental gracias al hardlinking de shards sin cambios.
- Evaluación comparativa de robustez: investigadores pueden medir el mismo prompt con escalas 0.0, 0.5 y 1.0 en el mismo lote para estudiar cómo varía la tasa de rechazo y la calidad de respuesta en función de la fuerza de steering, con aislamiento de caché garantizado.
- Despliegue con presupuesto de VRAM ajustado: al eliminar la necesidad de cargar dos núcleos completos, el sidecar permite servir ambos perfiles en 4× RTX PRO 6000 (TP4) con un pool de KV de 23,69M tokens frente a 23,75M del stock (99,78%).
- Investigación sobre direcciones de activación: el inventario de 99 tensores con `alpha`, `direction` y `attn_row_gain` por capa sirve como material para estudiar la geometría de la dirección de rechazo y su relación con la dirección de código limpio (coseno medio de -0,045 en la variante orth5c).

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Paridad sin steering (omitido y 0.0 vs stock) | 16/16 coincidencia top-1 (media \|Δ logprob\| = 0,0156); 90/100 (omitido) y 89/100 (0.0) vs 90/100 (stock) en batería de rechazo de 100 prompts; 95% de acuerdo por ítem en SQuAD2 + TruthfulQA (0,96 / 0,16 / 0,90 vs 0,96 / 0,16 / 0,88) |
| WARMIND completo (escala 1.0) | 0/100 rechazos (0 por palabra clave, 0 reales) sobre pesos stock; 96% de acuerdo por ítem (0,96 / 0,12 / 0,82) con WARMIND v1.1 editado en pesos |
| Aislamiento en lote mixto (0.0 + 1.0) | C=8 (81 rondas MTP) y C=16 con 33.380 tokens de prompt cruzando el límite SWA de L24 (99 rondas MTP): 8/8 y 16/16 primer token bit-exacto vs lotes homogéneos; 100% de separación conductual por carril |
| Aislamiento de caché de prefijo (prompt de 27.051 tokens) | 0 tokens cacheados entre escalas distintas (0.75 → 0.25); 27.051/27.051 (100%) cacheados en 0.0 → omitido, 0.0 → 0.0, 1.0 → 1.0 y 0.75 → 0.75 |
| Throughput vs media geométrica de A1 y A2 | C1: 294,5 tok/s (97,6%); C8: 1.184,2 tok/s (100,4%); C32: 2.289,3 tok/s (100,0%); prefill de 250K: 18.251 tok/s (100,8%); pool KV: 23,69M vs 23,75M tokens (99,78%) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; las mediciones se hicieron sobre 4× RTX PRO 6000 (`gb202`) con tensor parallelism 4.
- GPU recomendadas: 4× RTX PRO 6000 según la verificación del autor; el modelo base es de gran tamaño (dos núcleos de aproximadamente 473 GiB cada uno en el escenario original), por lo que no cabe en una GPU de consumo individual.
- Cabe en GPU de consumo: no disponible; el despliegue medido requiere 4 GPUs profesionales.
- Opciones de despliegue: HyperFlare (librería `flare`) con el PR #404 de NVIDIA/hyperflare-inference (`jcartu:pr/per-request-steering`); exportación mediante `flare export` con `--steering-sidecar`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Configuración de exportación medida: `--max-concurrency 32 --prefill-chunk-size 4096 --image-concurrency 4 --mtp-draft-tokens 7 --speculative-token-capacity 128 --speculative-graph-budget 64 --mla-compute-mode bf16 --draft-head-quantization nvfp4 --markov-head-quantization fp8 --vocabulary-parallel-sampling --expert-scale-compression csf`.
- Latencia y throughput: 294,5 tok/s a concurrencia 1, 1.184,2 tok/s a C8 y 2.289,3 tok/s a C32; prefill de 250K a 18.251 tok/s.

## Comparativa con modelos similares

| Aspecto | WARMIND-1017-Steering-Sidecar | WARMIND-1017 v1.1 (orth4c) | DeepSeek-V4.1-Flash-1017 stock |
|---|---|---|---|
| Tipo | Sidecar de steering (668 KiB) | Modelo editado en pesos (~473 GiB) | Modelo base prístino (~473 GiB) |
| Rechazos (batería de 100) | 0/100 con escala 1.0; 90/100 con escala 0.0 | 0/100 | 90/100 |
| Acuerdo con WARMIND v1.1 | 96% por ítem | referencia | no aplica |
| Cambio por petición | Sí, `steering_scale` en `[0.0, 1.0]` | No | No |
| Coste de almacenamiento | 668 KiB (+ ~22 GiB incrementales) | ~473 GiB | ~473 GiB |
| Licencia | MIT | MIT (según información del autor) | MIT |

No se dispone de comparación con otros modelos de la misma categoría (sidecars de steering de terceros) en la información proporcionada.

## Limitaciones y advertencias

- El sidecar solo funciona con HyperFlare compilado con el PR #404; no hay soporte documentado para otros motores de inferencia, lo que limita su portabilidad.
- El comportamiento sin steering no es idéntico al stock: la paridad medida es de 16/16 en top-1 y 95% de acuerdo por ítem, no una equivalencia exacta.
- La variante experimental `orth5c` no supera a `orth4c` en conjunto porque la dirección lineal de código limpio ya está a aproximadamente 90° de la de rechazo (coseno medio de -0,045).
- El modelo base es de gran tamaño y requiere hardware profesional multi-GPU; no es desplegable en una GPU de consumo.
- El propósito declarado es trabajo de red teaming y seguridad; el uso con `steering_scale: 1.0` elimina los rechazos del modelo, lo que implica riesgo de generar contenido dañino y exige controles de acceso y registro de auditoría en producción.
- No se documentan sesgos, tasas de alucinación ni cobertura idiomática del modelo base en la información disponible.
- La licencia MIT del sidecar no exime del cumplimiento de la licencia del modelo base (también MIT según el autor) ni de las obligaciones legales aplicables al contenido generado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el modelo fue creado y actualizado el mismo día (2026-11-19), por lo que no hay validación independiente de los resultados reportados por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/jcartu/WARMIND-1017-Steering-Sidecar
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- WARMIND-1017 v1.1: https://huggingface.co/jcartu/WARMIND-1017
- PR de HyperFlare: https://github.com/NVIDIA/hyperflare-inference/pull/404
- Arnés de seguridad: https://github.com/jcartu/warmind-sec-harness
- Metodología de abliteración de grimjim: https://huggingface.co/grimjim (referencia citada en la model card)
