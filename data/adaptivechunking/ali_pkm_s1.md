# AdaptiveChunking/ali_pkm_s1

## Resumen

`ali_pkm_s1` es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución (run) de un H-Net a nivel de byte entrenado con el framework [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet), con configuración de arquitectura `pkm` (product-key memory), objetivo `ratio` y decodificación por chunking dinámico con media móvil exponencial (`dechunk=ema`). No es un modelo conversacional ni un LLM de propósito general: es un artefacto de experimentación sobre tokenización y segmentación adaptativa a nivel de byte.

El modelo tiene 39.425.792 parámetros y fue entrenado durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre tres idiomas: inglés, turco y finés. La relevancia de este tipo de modelos radica en que elimina la dependencia de un tokenizador BPE fijo, aprendiendo directamente representaciones sobre bytes y agrupándolos dinámicamente, lo que en principio permite manejar cualquier idioma o alfabeto sin vocabulario predefinido.

El repositorio tiene un tamaño de 11,2 GB, muy superior al que correspondería a los 39,4 M de parámetros en fp32 (unos 158 MB), lo que indica que almacena múltiples checkpoints intermedios con estado completo del entrenador. La model card no documenta benchmarks, idiomas de inferencia declarados ni pipeline de uso, por lo que debe considerarse material de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net a nivel de byte con chunking dinámico y memoria product-key (`architecture=pkm`) |
| Parametros totales | 39.425.792 |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | no disponible (entrenamiento con secuencias de 1024 bytes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | entrenado con `['en', 'tr', 'fi']`; idiomas de inferencia declarados: no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), además de `training_state/checkpoint.pt` en PyTorch |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en beetle-hnet, un diseño que opera sobre bytes en lugar de tokens y aprende a agruparlos en chunks de longitud variable mediante un mecanismo de decodificación dinámica. La variante concreta de esta ejecución usa `architecture=pkm`, es decir, una capa de memoria product-key, y un objetivo de entrenamiento de tipo `ratio`. La decodificación de chunks emplea `dechunk=ema` (media móvil exponencial), sin programación de fases adicional (`schedule=None`).

El entrenamiento se realizó durante 6000 pasos con un batch efectivo de 32 secuencias de 1024 bytes por paso, sobre un corpus multilingüe limitado a inglés, turco y finés. No se documenta el número total de tokens, la composición del dataset, ni si hubo fases de RLHF o DPO; tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal. El repositorio organiza los checkpoints en ramas `step-N` siguiendo una programación logarítmica en base 2 (0, 1, 2, 4, 6, 8, 16, …, 2^k), e incluye en cada una el estado resumible completo del entrenador. La rama `main` contiene los pesos y la configuración del último paso, junto con `log.jsonl`, `final.json` y, si el run ha terminado, sondas de frontera FLORES+ en `probe/`. Los pesos en `model.safetensors` almacenan cada tensor atado una sola vez, y `config.json["tied_weights"]` mapea los nombres eliminados a los almacenados.

## Capacidades

- Modelado de lenguaje a nivel de byte sobre texto en inglés, turco y finés.
- Segmentación dinámica de bytes en chunks aprendidos, sin tokenizador externo.
- Memoria product-key (`pkm`) para aumentar la capacidad efectiva sin incrementar proporcionalmente los parámetros.
- Soporte de reanudación exacta del entrenamiento gracias a los estados `training_state/checkpoint.pt` por paso.
- Evaluación de fronteras de chunk mediante sondas FLORES+ (`probe/`), cuando el run ha finalizado.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No se documenta un modo de razonamiento explícito (`thinking mode`).

## Casos de uso

- Investigación en tokenización sin vocabulario: usar el modelo para estudiar cómo aprende fronteras de chunk sobre bytes en lugar de aplicar BPE, comparando las sondas FLORES+ con segmentaciones de referencia.
- Experimentación multilingüe de bajo recurso: evaluar el comportamiento del chunking dinámico en turco y finés, dos idiomas con morfología aglutinante que suponen un reto para los tokenizadores BPE convencionales.
- Reproducción de experimentos: reanudar el entrenamiento desde cualquiera de las ramas `step-N` gracias al estado completo del entrenador incluido en cada checkpoint.
- Análisis de arquitecturas con memoria product-key: inspeccionar cómo la capa `pkm` afecta a la representación de bytes y a la longitud media de chunk aprendida.
- Baseline para modelos H-Net: servir como punto de comparación (seed 1, 6000 pasos) frente a otras ejecuciones de la misma organización con distintas semillas o configuraciones.
- Estudio de decodificación con EMA: analizar el efecto de `dechunk=ema` en la estabilidad de las fronteras de chunk durante el entrenamiento y en la inferencia.
- Docencia y prototipado: ejemplo compacto (39,4 M de parámetros) para ilustrar el pipeline completo de beetle-hnet, desde la configuración hasta los checkpoints intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamaño (39,4 M de parámetros), en fp32 ocuparía aproximadamente 158 MB de pesos, y en fp16 unos 79 MB, a lo que habría que sumar el estado del optimizador solo si se reanuda el entrenamiento.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre debería bastar para inferencia en fp32; no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (GTX 1060 en adelante), aunque el dato no está confirmado por el autor.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura personalizada de beetle-hnet, requiere cargar el código del repositorio [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota de almacenamiento: el repo completo ocupa 11,2 GB por los múltiples checkpoints; para inferencia basta con descargar la rama `main` o un `step-N` concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AdaptiveChunking/ali_pkm_s1` | 39,4 M | 1024 bytes (entrenamiento) | H-Net byte-level con chunking dinámico y PKM | Apache 2.0 | Hugging Face |
| Modelos H-Net de la misma organización (otras seeds/configuraciones) | no disponible | no disponible | H-Net byte-level | Apache 2.0 (presumible) | Hugging Face (org AdaptiveChunking) |
| Tokenizadores BPE estándar (p. ej. SentencePiece) | N/A (no es un modelo) | N/A | Segmentación estática por vocabulario | variable | amplia |

No se dispone de información sobre otros modelos comparables de la misma categoría (H-Net byte-level con chunking dinámico) fuera de la propia organización AdaptiveChunking, por lo que la comparativa cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Modelo de investigación: no es un asistente conversacional ni un LLM de propósito general; no se documenta pipeline de inferencia ni formato de prompt.
- Idiomas limitados: solo se entrenó con inglés, turco y finés; el comportamiento en otros idiomas no está evaluado.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni métricas de perplejidad que permitan evaluar su calidad.
- Contexto corto: las secuencias de entrenamiento son de 1024 bytes, lo que limita el contexto efectivo en inferencia.
- Riesgo de alucinación: no evaluado; al ser un modelo de modelado de lenguaje, es previsible que genere texto plausible sin garantía de veracidad.
- Sesgos: no documentados; el corpus de entrenamiento no se describe, por lo que no se puede evaluar su composición ni sesgos asociados.
- Dependencia de código externo: requiere el repositorio beetle-hnet para cargar la arquitectura, lo que añade riesgo de mantenimiento y reproducibilidad.
- Licencia Apache 2.0: permite uso comercial, pero al no haber evaluación de calidad ni documentación de uso, no se recomienda su despliegue en producción.
- Tamaño del repo: 11,2 GB por los checkpoints intermedios; conviene descargar solo la revisión necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_pkm_s1
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking/models
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
