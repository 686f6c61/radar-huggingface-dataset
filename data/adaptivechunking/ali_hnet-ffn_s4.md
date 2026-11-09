# AdaptiveChunking/ali_hnet-ffn_s4

## Resumen

`ali_hnet-ffn_s4` es un modelo de investigación desarrollado por el usuario AdaptiveChunking dentro del proyecto [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet). No es un modelo de lenguaje conversacional al uso: se trata de una implementación de H-Net (hierarchical network) con arquitectura `hnet_ffn` y objetivo de entrenamiento basado en ratio, diseñada para experimentar con tokenización dinámica a nivel de byte (*dynamic chunking*). El modelo procesa flujos de bytes y aprende a agruparlos en unidades de longitud variable en lugar de depender de un vocabulario BPE predefinido.

El modelo tiene 22.785.033 parámetros totales (unos 22,8 millones) y fue entrenado durante 6.000 pasos con batches de 32 secuencias de 1.024 bytes, sobre tres idiomas: inglés, turco y finés. El tamaño del repositorio (6,5 GB) se explica por el almacenamiento de múltiples checkpoints intermedios (`step-N`) junto con el estado completo del entrenador, no por el tamaño de los pesos del modelo.

Su relevancia es fundamentalmente metodológica: sirve como artefacto reproducible para estudiar cómo afecta el chunking dinámico a nivel de byte en tareas multilingües con morfología aglutinante (turco, finés), donde los tokenizadores BPE convencionales suelen fragmentar palabras de forma poco eficiente. La licencia Apache 2.0 permite reutilización y modificación sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net con FFN (`architecture=hnet_ffn`), procesamiento byte-level con chunking dinámico |
| Parametros totales | 22.785.033 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible explícitamente; entrenado con secuencias de 1.024 bytes |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin versiones GGUF publicadas) |
| Idiomas soportados | en, tr, fi (según configuración de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `tied_weights` en `config.json`), más `checkpoint.pt` de PyTorch para reanudar entrenamiento |

## Arquitectura y entrenamiento

El modelo implementa una H-Net (`hnet_ffn`) con objetivo de tipo *ratio* y un mecanismo de de-chunking basado en EMA (`dechunk=ema`). La idea central de las H-Net es aprender dinámicamente qué segmentos de la entrada agrupar antes de procesarlos, sustituyendo la tokenización estática por un mecanismo aprendido de *chunking*. Al operar a nivel de byte, el modelo evita el sesgo de vocabulario y puede en principio generalizar a cualquier idioma o secuencia binaria, aunque el entrenamiento concreto se limitó a inglés, turco y finés.

El entrenamiento consistió en 6.000 pasos con batch de 32 y longitud de 1.024 bytes por muestra, con semilla 4. No se especifica en la información disponible el número total de tokens procesados ni la composición exacta del dataset, más allá de los tres idiomas indicados. Tampoco se documenta el uso de RLHF, DPO ni fases de alineación; se trata de un modelo preentrenado en crudo para investigación. El repositorio sigue el layout de Beetle con ramas `step-N` en una programación logarítmica (0, 1, 2, 4, 6, 8, 16, …, 2^k) que permiten reproducir la evolución del entrenamiento, además de una rama `main` con los pesos finales, `log.jsonl`, `final.json` y sondas de frontera FLORES+ en `probe/`.

## Capacidades

- Modelado de lenguaje a nivel de byte con segmentación dinámica aprendida.
- Procesamiento multilingüe restringido a los idiomas de entrenamiento (inglés, turco, finés).
- Evaluación de fronteras de chunking mediante sondas FLORES+ (incluidas en el repositorio).
- Reanudación exacta del entrenamiento gracias al estado completo en `training_state/checkpoint.pt`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo *thinking*.
- No se documenta explícitamente capacidad de generación de código o matemáticas; al ser un modelo de 22,8 M de parámetros, su utilidad práctica en esas tareas es marginal.

## Casos de uso

- Investigación en tokenización dinámica: el modelo permite comparar el comportamiento de H-Net frente a BPE o SentencePiece en los mismos corpus, usando las ramas `step-N` para estudiar la evolución del chunking a lo largo del entrenamiento.
- Estudio de morfología aglutinante: al incluir turco y finés, sirve para analizar si el chunking aprendido agrupa sufijos y raíces de forma más coherente que un tokenizador estático en lenguas con alta productividad morfológica.
- Reproducción de experimentos: la inclusión del estado completo del entrenador (`checkpoint.pt`) permite reanudar exactamente el *run* con semilla 4 y verificar resultados.
- Análisis de fronteras de segmentación: las sondas FLORES+ en `probe/` permiten medir la calidad de las fronteras de chunking sobre texto multilingüe de referencia.
- Prototipado de arquitecturas jerárquicas: como implementación de referencia de `hnet_ffn` con de-chunking EMA, puede servir de base para extender el enfoque a modelos mayores o a otros objetivos.
- Docencia y divulgación: con 22,8 M de parámetros y pesos abiertos, es un ejemplo manejable para explicar mecanismos de chunking aprendido en cursos de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de perplejidad, precisión ni comparaciones cuantitativas; únicamente menciona la existencia de sondas FLORES+ en el directorio `probe/` una vez finalizado el entrenamiento, sin cifras asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,8 M de parámetros en fp32, los pesos ocupan aproximadamente 91 MB; en fp16, unos 46 MB. El cuello de botella es el estado del optimizador y los checkpoints, no la inferencia.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente para inferencia; para reentrenar desde cero, una GPU con 8-16 GB es adecuada dado el tamaño del modelo y el batch de 32 × 1.024 bytes.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM para inferencia.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura personalizada (`hnet_ffn`), no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin adaptación. Requiere cargar la implementación de `beetle-hnet` y los pesos safetensors manualmente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_hnet-ffn_s4 | 22,8 M | 1.024 bytes (entrenamiento) | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face |
| ByT5-small | ~300 M | 512-1.024 bytes | Transformer byte-level (Google) | Apache 2.0 | Hugging Face |
| CANINE-c | ~130 M | 2.048 caracteres | Transformer character-level (Google) | Apache 2.0 | Hugging Face |
| Charformer | ~30-100 M | variable | Gradient-based subword tokenization | Apache 2.0 | Repositorios de investigación |

La comparación es aproximada: no se dispone de benchmarks comunes entre estos modelos y `ali_hnet-ffn_s4`. La diferencia principal es que este último integra el chunking como parte aprendida de la arquitectura, mientras que ByT5 y CANINE eliminan la tokenización fijando la unidad a byte o carácter sin agrupación dinámica.

## Limitaciones y advertencias

- Modelo de investigación sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Tamaño muy reducido (22,8 M de parámetros): capacidad limitada para tareas generativas complejas, razonamiento o código.
- Idiomas restringidos a inglés, turco y finés; el comportamiento en otros idiomas no está validado.
- Contexto de entrenamiento corto (1.024 bytes); no se documenta capacidad de extrapolación a secuencias más largas.
- Sin alineación (RLHF/DPO): puede producir salidas sesgadas o incoherentes en uso conversacional.
- Arquitectura no estándar: no es compatible con los runners habituales (llama.cpp, vLLM, Ollama) sin trabajo de integración.
- El tamaño del repositorio (6,5 GB) incluye múltiples checkpoints y estados del entrenador; descargar solo la rama `main` o un `step-N` concreto reduce el consumo.
- Licencia Apache 2.0: permite uso comercial, pero al no haber evaluación de sesgos ni de robustez, no se recomienda su despliegue en producción sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_hnet-ffn_s4
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Dataset FLORES+ (referenciado por las sondas): https://huggingface.co/datasets/facebook/flores
- Paper de H-Net (referencia conceptual): no disponible en la información proporcionada
