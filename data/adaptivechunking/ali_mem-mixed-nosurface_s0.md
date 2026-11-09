# AdaptiveChunking/ali_mem-mixed-nosurface_s0

## Resumen

`ali_mem-mixed-nosurface_s0` es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino un experimento de tokenización dinámica a nivel de byte construido sobre el framework beetle-hnet. El objetivo es estudiar cómo un modelo puede aprender a segmentar (chunking) secuencias de bytes de forma adaptativa en lugar de depender de un vocabulario BPE fijo. La arquitectura declarada es `ali` con objetivo `ratio`, decodificación por EMA y entrenamiento sobre tres idiomas: inglés, turco y finés.

El modelo tiene 22.785.088 parámetros (aproximadamente 22,8 millones) y se entrenó durante 6000 pasos con batches de 32 secuencias de 1024 bytes. El repositorio ocupa 7,2 GB, un tamaño desproporcionado respecto al número de parámetros, lo que se explica por el almacenamiento de múltiples checkpoints intermedios (`step-N`) junto con el estado completo del entrenador (`training_state/checkpoint.pt`) en cada uno de ellos.

Su relevancia es fundamentalmente académica: sirve como artefacto reproducible para investigar tokenización byte-level, chunking dinámico y entrenamiento multi-idioma con lenguajes morfológicamente ricos (turco y finés) frente al inglés. No está pensado para despliegue en producción ni para tareas generativas generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net variante `ali` (byte-level, dynamic chunking) |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 bytes por secuencia durante entrenamiento |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr, fi (según configuración de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez), más `checkpoint.pt` de PyTorch para reanudación |

## Arquitectura y entrenamiento

El modelo se basa en beetle-hnet, un framework que implementa H-Net con segmentación dinámica de secuencias a nivel de byte. En lugar de operar sobre tokens predefinidos por un tokenizador BPE, el modelo procesa bytes crudos y aprende a agruparlos en chunks mediante un mecanismo de decodificación `ema` (media móvil exponencial). El objetivo de entrenamiento es `ratio`, y el schedule de checkpoints sigue una progresión logarítmica en base 2 (0, 1, 2, 4, 6, 8, 16, …, 2^k) desde cada inicio de fase, lo que permite inspeccionar la evolución del aprendizaje a distintas escalas.

El entrenamiento consistió en 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre datos mezclados de inglés, turco y finés. La variante `nosurface` sugiere que no se emplean características superficiales (surface features) en el mecanismo de chunking. No se especifica en la información disponible el volumen total de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Los pesos atados se almacenan una única vez y se mapean mediante `config.json["tied_weights"]`.

## Capacidades

- Procesamiento de texto a nivel de byte sin tokenizador externo, con segmentación adaptativa aprendida.
- Modelado de lenguaje sobre secuencias de hasta 1024 bytes.
- Entrenamiento y evaluación multi-idioma limitado a inglés, turco y finés.
- Checkpoints intermedios reproducibles con estado completo del entrenador para reanudar o analizar el entrenamiento.
- Sondas de frontera FLORES+ (`probe/`) para evaluar la calidad de la segmentación una vez finalizado el run.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Investigación en tokenización byte-level: el modelo permite comparar empíricamente el chunking dinámico frente a tokenizadores BPE estándar en tres idiomas con tipologías distintas.
- Estudio de lenguas aglutinantes: turco y finés presentan morfología compleja que desafía a los tokenizadores convencionales; este modelo sirve para analizar si el chunking aprendido maneja mejor esas estructuras.
- Reproducción de experimentos: los checkpoints `step-N` con `training_state/checkpoint.pt` permiten reanudar el entrenamiento exactamente desde cualquier punto de la schedule logarítmica.
- Análisis de dinámica de entrenamiento: la progresión de checkpoints (0, 1, 2, 4, 6, 8, 16, …) facilita estudiar cómo evoluciona la segmentación a lo largo del entrenamiento.
- Evaluación de fronteras de chunk: las sondas FLORES+ incluidas en `main` permiten medir la calidad de los límites de segmentación sobre texto multilingüe de referencia.
- Base para experimentos derivados: al ser un modelo pequeño (22,8 M de parámetros) y con licencia Apache 2.0, puede servir como punto de partida para fine-tuning en investigación de tokenización adaptativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,8 M de parámetros ≈ 91 MB de pesos); en la práctica, el cuello de botella es el framework beetle-hnet, no el modelo.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobradamente suficiente; también funciona en CPU.
- Cabe en cualquier GPU consumer y en la mayoría de entornos integrados.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama o TGI; el modelo requiere el framework beetle-hnet y PyTorch.
- Latencia y throughput: no disponibles.
- Nota: el repositorio de 7,2 GB se debe a los múltiples checkpoints y estados del entrenador, no al peso de un único modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_mem-mixed-nosurface_s0 | 22,8 M | 1024 bytes | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face |
| Modelos BPE estándar (p. ej. GPT-2 small) | ~124 M | 1024 tokens | Transformer con tokenizador BPE fijo | MIT / varias | Amplia |
| Byte-level models tipo ByT5-small | ~300 M | variable | Transformer byte-level sin tokenizador | Apache 2.0 | Hugging Face |

La comparación directa es limitada porque este modelo es un artefacto de investigación sobre chunking dinámico, no un modelo de propósito general. No se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.
- Entrenado únicamente con 6000 pasos y 1024 bytes de contexto: capacidad limitada para secuencias largas.
- Solo cubre inglés, turco y finés; no se garantiza comportamiento en otros idiomas.
- No se documentan sesgos, pero al ser un modelo pequeño y con datos no especificados, el riesgo de alucinación y sesgos es alto e impredecible.
- No es un modelo conversacional ni soporta tool calling; no debe usarse como asistente.
- La licencia Apache 2.0 permite uso comercial, pero la falta de benchmarks y documentación desaconseja su uso en producción.
- El repositorio incluye estados completos del entrenador (`checkpoint.pt`) que requieren `weights_only=False` al cargar, lo que implica riesgos de seguridad si se cargan pesos de origen no confiable.
- No se especifica la composición del dataset de entrenamiento, lo que impide evaluar la calidad y licencia de los datos subyacentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-mixed-nosurface_s0
- Organización AdaptiveChunking: https://huggingface.co/AdaptiveChunking/models
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
