# AdaptiveChunking/ali_mem-mixed_s2

## Resumen

`ali_mem-mixed_s2` es un modelo de investigación publicado por el usuario AdaptiveChunking en Hugging Face, construido sobre el framework `beetle-hnet` (repositorio de GitHub de Suchir Salhan). Se trata de una ejecución concreta de un modelo de tipo H-Net (Hierarchical Network) que opera a nivel de byte, con un esquema de tokenización dinámica por chunks ("dynamic-chunking") y una arquitectura identificada como `ali`. El modelo se entrena con un objetivo de ratio y una política de dechunking basada en media móvil exponencial (EMA), con semilla 2.

El modelo tiene 22.785.088 parámetros totales (aproximadamente 22,8 millones) según los pesos en safetensors, lo que lo sitúa en la categoría de modelos pequeños orientados a investigación y experimentación, no a producción generalista. El entrenamiento se realizó durante 6000 pasos con batches de 32 secuencias de 1024 bytes cada una, sobre tres idiomas: inglés (`en`), turco (`tr`) y finés (`fi`). El repositorio ocupa 7,7 GB, un tamaño desproporcionado respecto al número de parámetros, lo que se explica por la inclusión de múltiples ramas de checkpoint (`step-N`) con estado completo del entrenador (optimizador, scheduler, etc.) en cada una.

La relevancia de este modelo es fundamentalmente metodológica: explora la tokenización dinámica a nivel de byte como alternativa a los tokenizadores BPE/subword fijos, con un esquema de checkpoints por fases y sondas de frontera sobre FLORES+ para evaluar la segmentación. No es un modelo de propósito general ni se ha publicado con benchmarks de rendimiento estándar; su interés reside en la reproducibilidad del experimento y en el estudio de arquitecturas H-Net con chunking adaptativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (Hierarchical Network), variante `ali`, procesamiento a nivel de byte con dynamic-chunking |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 bytes por secuencia de entrenamiento (no se especifica contexto de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr, fi (según configuración de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez y mapeados vía `config.json["tied_weights"]`), además de `checkpoint.pt` de PyTorch para estado del entrenador |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura H-Net (Hierarchical Network) con procesamiento a nivel de byte y un mecanismo de chunking dinámico. La variante `ali` y el objetivo `ratio` definen el comportamiento del modelo durante el entrenamiento; el esquema de dechunking utiliza una media móvil exponencial (`dechunk=ema`). El entrenamiento se ejecutó con semilla 2 durante 6000 pasos, con un batch efectivo de 32 secuencias de 1024 bytes, lo que equivale a aproximadamente 196,6 millones de bytes procesados en total (6000 × 32 × 1024).

El repositorio organiza los checkpoints en ramas `step-N` siguiendo una programación logarítmica consciente de fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k desde el inicio de cada fase del objetivo, más el paso final). Cada rama contiene `model.safetensors`, `config.json`, `training_config.yaml` y el estado completo reanudable del entrenador en `training_state/checkpoint.pt`. La rama `main` contiene los pesos y la configuración del último paso, además de `log.jsonl`, `final.json` y las sondas de frontera FLORES+ en `probe/` una vez finalizada la ejecución. No se especifican en la información disponible detalles sobre la composición exacta del dataset, el uso de RLHF/DPO ni innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Procesamiento a nivel de byte: el modelo opera sobre bytes en lugar de tokens subword, lo que en principio permite manejar cualquier secuencia de bytes sin vocabulario fijo.
- Tokenización dinámica por chunks: el mecanismo de chunking adaptativo agrupa bytes en unidades de longitud variable durante el procesamiento.
- Multilingüismo limitado a los idiomas de entrenamiento: inglés, turco y finés.
- Evaluación de segmentación: incluye sondas de frontera sobre FLORES+ (`probe/`) para analizar la calidad de la segmentación aprendida.
- Reproducibilidad de investigación: el estado completo del entrenador permite reanudar y auditar el entrenamiento.
- No se ha documentado soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Investigación en tokenización: el modelo sirve como banco de pruebas para estudiar cómo el chunking dinámico a nivel de byte afecta a la segmentación en comparación con tokenizadores BPE fijos, usando las sondas FLORES+ incluidas.
- Reproducción de experimentos: gracias a las ramas `step-N` con estado completo del entrenador, un investigador puede reanudar el entrenamiento desde cualquier checkpoint conservado y comparar fases del objetivo.
- Estudio de arquitecturas H-Net: permite analizar el comportamiento de una H-Net con variante `ali` y objetivo `ratio` en un régimen controlado de 6000 pasos.
- Análisis multilingüe de bajo recurso: los idiomas turco y finés, con morfología aglutinante, son casos interesantes para evaluar si el chunking a nivel de byte captura mejor las fronteras morfológicas que un tokenizador subword entrenado en inglés.
- Docencia y experimentación académica: el tamaño reducido (22,8 M de parámetros) permite ejecutar el modelo en hardware modesto para demostraciones de tokenización dinámica.
- Base para ablaciones: al ser una ejecución con semilla 2 de una familia de experimentos, sirve como punto de comparación frente a otras semillas y configuraciones del mismo framework `beetle-hnet`.
- No se recomienda su uso en aplicaciones de producción de propósito general (chat, generación de código, agentes) dada la ausencia de benchmarks y de documentación de capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona las sondas de frontera FLORES+ (`probe/`) generadas al finalizar la ejecución, pero no se proporcionan métricas numéricas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,8 M de parámetros, en FP32 los pesos ocupan aproximadamente 91 MB; en FP16, unos 46 MB; en cuantización de 8 bits, unos 23 MB. El repositorio de 7,7 GB corresponde principalmente a los estados de entrenamiento, no a los pesos de inferencia.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente para los pesos; una GPU consumer moderna (RTX 3060, RTX 4090) permite ejecutar múltiples instancias o batches grandes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer actual e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura personalizada (H-Net de `beetle-hnet`), no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin una implementación específica de la arquitectura. La vía documentada es cargar los pesos con PyTorch y el código de `beetle-hnet`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ali_mem-mixed_s2` (este) | 22,8 M | 1024 bytes (entrenamiento) | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face |
| Modelos byte-level tipo ByT5 (referencia) | ~300 M (small) | variable | Transformer byte-level sin tokenizador | Apache 2.0 | Hugging Face |
| Tokenizadores BPE estándar (referencia) | N/A | N/A | Segmentación subword fija | variable | ubicuos |

No se dispone de datos de rendimiento comparables en la información proporcionada para establecer una comparación cuantitativa con alternativas. La comparación anterior es únicamente cualitativa y de categoría.

## Limitaciones y advertencias

- Modelo de investigación sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K u otras), por lo que no debe usarse como base para decisiones de producción.
- Idiomas limitados: entrenado solo con inglés, turco y finés; el comportamiento en otros idiomas es desconocido.
- Contexto de entrenamiento corto: 1024 bytes por secuencia; no se documenta la longitud de contexto efectiva en inferencia.
- Riesgo de alucinación y salidas incoherentes: al ser un modelo pequeño y de investigación, es probable que genere texto poco fiable; no se ha evaluado su calidad generativa.
- Arquitectura no estándar: requiere el código de `beetle-hnet` para cargar y ejecutar el modelo; no es compatible con runtimes de inferencia convencionales sin adaptación.
- Tamaño del repositorio: 7,7 GB por los estados de entrenamiento; la descarga completa no es necesaria para inferencia, pero requiere seleccionar revisiones concretas (`step-N`).
- Licencia Apache 2.0: permite uso comercial, pero la falta de documentación de capacidades y de evaluación desaconseja su uso en producción.
- Pesos atados: `model.safetensors` almacena cada tensor atado una sola vez; es necesario aplicar el mapeo de `config.json["tied_weights"]` para reconstruir el modelo correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-mixed_s2
- Repositorio del framework: https://github.com/suchirsalhan/beetle-hnet
- No se han encontrado otros enlaces (papers, blogs, demos) en la información disponible.
