# Launch80/Inkling-2-Mini-NVFP4-SABER

## Resumen

Inkling-2-Mini-NVFP4-SABER es un paquete de pesos cuantizados del modelo Inkling 2 Mini, desarrollado por Thinking Machines Lab, empaquetado por el usuario Launch80 para el motor de inferencia Saber, un motor nativo de ROCm orientado a GPUs AMD RDNA4. No se trata de un checkpoint de propósito general: sus ficheros solo cargan en el motor Saber, que sirve una API compatible con OpenAI sobre dos tarjetas Radeon AI PRO R9700 en paralelo de tensor (TP=2).

El modelo base es un MoE de 128 expertos con top-8 y un bloque intermedio con bucle de tres pasadas, con 24 capas físicas que equivalen a 48 visitas de capa por token. El paquete conserva la precisión nativa de los expertos (NVFP4 en las capas 0-19, MXFP8 en las capas 20-23), ejecuta el tronco de atención y la cabeza LM en 8 bits e incluye el block drafter propio del modelo para decodificación especulativa. Todo el contenido ocupa 20,73 GB en un único repositorio autocontenido.

La relevancia del paquete es doble: por un lado, demuestra un flujo de despliegue de un MoE de grano fino sobre hardware AMD de consumo profesional con cuantización de bloque de cuarta generación (NVFP4); por otro, expone una dependencia crítica de ingeniería, ya que el repositorio público del motor Saber todavía no incluye la ruta de ejecución de Inkling 2 y el paquete no puede arrancar hasta que los mantenedores la publiquen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE de 128 expertos con top-8, bloque intermedio con bucle de tres pasadas, 24 capas fisicas (48 visitas por token) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 tokens por secuencia por defecto (prompt + salida); configurable hasta 16.384 con `--ink-serve-ctx` |
| Tipos de cuantizacion | NVFP4 (expertos capas 0-19), MXFP8 (expertos capas 20-23), int8 (tronco de atencion y cabeza LM), BF16/FP32 (tensores no expertos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y formatos propios del motor Saber (`.xtier`, `dense.json`, ficheros crudos del drafter) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de grano fino: 128 expertos por capa con enrutamiento top-8, lo que implica que cada token activa 8 de los 128 expertos en cada capa enrutada. La innovación estructural descrita es un bloque intermedio con bucle de tres pasadas sobre 24 capas físicas, de modo que el cómputo efectivo equivale a 48 visitas de capa por token. El paquete no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información no está disponible en el material proporcionado.

El empaquetado para Saber es en sí mismo una pieza de ingeniería destacable. Los expertos enrutados de las capas 0-19 se almacenan en NVFP4 con códigos e2m1 y escala e4m3 por cada 16 elementos, conservando la escala por tensor del modelo original y redistribuyendo los bytes por rango. Las capas 20-23 usan MXFP8 con códigos e4m3 y escala e8m0 por cada 32 elementos. Las proyecciones de atención de las 20 capas locales y la cabeza LM se cuantizan a int8 con una escala bf16 por cada 32 columnas mediante redondeo RTNE. El resto de tensores no expertos (embeddings, atención de capas globales, normas, router, puertas de mensaje) se conservan en BF16/FP32 byte a byte. El paquete incluye además el block drafter del propio modelo para decodificación especulativa, con su vocabulario de 32.768 tokens más frecuentes y una tabla de plegado precalculada en f64 de su cabeza.

## Capacidades

- Generación de texto con API compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/models`), con streaming, logprobs de hasta 20 tokens, cadenas de parada y semillas.
- Control de esfuerzo de razonamiento mediante el parámetro `reasoning_effort` de la plantilla de chat, con valores de `none` a `max`.
- Decodificación especulativa con el block drafter integrado, que acelera la generación manteniendo la decisión final de cada token en el modelo objetivo.
- Ejecución en paralelo de tensor sobre dos GPUs con paralelismo de expertos: cada rango mantiene la mitad de los expertos y la mitad de cada tensor denso dividido.
- Servicio de hasta 8 secuencias concurrentes, con encolado de peticiones adicionales.
- No se documentan capacidades de visión, audio, tool calling ni razonamiento multi-paso más allá del modo de razonamiento configurable; esa información no está disponible.

## Casos de uso

- Servicio de chat autohospedado sobre hardware AMD: el paquete permite levantar un endpoint compatible con OpenAI en dos Radeon AI PRO R9700, útil para equipos que quieren evitar dependencia de GPUs NVIDIA y mantener los datos en su infraestructura.
- Evaluación de cuantización NVFP4 en producción: sirve para medir el impacto real de la cuantización de bloque de 4 bits en un MoE de grano fino, comparando la calidad de salida con el modelo base en BF16.
- Inferencia de baja latencia en un solo flujo: con 140-145 tok/s de decodificación y un p99 de primer token de 86-89 ms, es adecuado para asistentes interactivos donde prima el tiempo de respuesta por token.
- Procesamiento por lotes con concurrencia moderada: los 283-292 tok/s agregados con 8 flujos concurrentes permiten atender cargas de resumen o clasificación con varias peticiones simultáneas.
- Pruebas de decodificación especulativa: el drafter integrado y su vocabulario de 32.768 tokens permiten experimentar con estrategias de verificación múltiple y medir su efecto en el throughput.
- Desarrollo y validación de motores de inferencia ROCm: el paquete y sus tablas de registros (`dense.json`) sirven como referencia para implementar rutas de carga de MoE cuantizado en el motor Saber.

## Benchmarks y rendimiento

Los datos publicados corresponden a las puertas de calidad de los mantenedores, medidos sobre 2 Radeon AI PRO R9700 (gfx1201, 32 GB cada una) a TP=2, tarjetas limitadas a 210 W, con flags por defecto del motor y BetterBench `--quick` (temperatura 0,7, top_p 0,95, top_k 20), con 4 arranques por brazo en orden A B B A sobre un host inactivo (2026-11-23).

| Metrica | Valor |
|---|---|
| Decodificacion, flujo unico | 140-145 tok/s (145,4 / 141,6 / 140,3 / 140,7) |
| Decodificacion, 8 concurrentes (agregado) | 283-292 tok/s |
| Primer token p50 / p99, flujo unico | 74-76 / 86-89 ms |
| Primer token p50 / p99, 8 concurrentes | 144-148 / 515-532 ms |
| Actualizacion entre tokens p99, flujo unico | 27,8-28,2 ms |
| Prefill servido, una secuencia (1k / 2k / 4k / 8k / 16k) | 4.119 / 4.384 / 4.601 / 4.667 / 4.607 tok/s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- GPUs: exactamente 2 AMD Radeon AI PRO R9700 (RDNA4, gfx1201, 32 GB cada una) en TP=2. No se admiten otras GPUs ni otros recuentos.
- Sistema operativo: Linux con el driver de kernel de ROCm (`/dev/kfd`, `/dev/dri`) y podman o docker; la compilación y el trabajo de GPU se ejecutan en el contenedor del motor.
- Disco: 20,73 GB para el repositorio completo, descargable de forma reanudable con comprobación previa de espacio libre.
- VRAM estimada: no disponible de forma explícita; el paquete se reparte entre dos tarjetas de 32 GB y cada rango mantiene la mitad de los expertos y de los tensores densos divididos.
- No cabe en GPUs de consumo convencionales: requiere el par de R9700 especificado.
- Despliegue: exclusivamente mediante el motor Saber (`tools/serve_inkling.sh`), que sirve en el puerto 8080. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Contexto: 4.096 tokens por secuencia por defecto, ampliable a 16.384 con `--ink-serve-ctx`; hasta 8 secuencias simultáneas.
- Latencia y throughput: los indicados en la sección de benchmarks.

## Comparativa con modelos similares

No disponible. El material proporcionado no incluye datos de modelos comparables de la misma categoría (MoE de grano fino cuantizado para ROCm) ni resultados de calidad que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El paquete no es un checkpoint de propósito general: sus ficheros solo cargan en el motor Saber y no son portables a otras herramientas de inferencia.
- Dependencia crítica de ingeniería: el repositorio público de Saber (GGZ14/saber-engine) todavía no incluye la ruta de ejecución de Inkling 2 ni la resolución del `base/` propio del paquete; hasta que los mantenedores la publiquen, el arranque no es posible con el código público.
- Hardware restringido: solo funciona en 2 Radeon AI PRO R9700 (gfx1201); no hay soporte para otras GPUs ni otros recuentos.
- Contexto limitado por defecto a 4.096 tokens, ampliable a 16.384; insuficiente para cargas que requieran ventanas muy largas.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación; esa información no está disponible.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia del motor Saber y la falta de publicación de su ruta de ejecución condicionan la viabilidad en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- Las métricas de rendimiento proceden de los mantenedores del motor, no de una evaluación externa.

## Enlaces

- Repositorio del paquete: https://huggingface.co/Launch80/Inkling-2-Mini-NVFP4-SABER
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Motor Saber: https://github.com/GGZ14/saber-engine
