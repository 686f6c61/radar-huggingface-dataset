# Ethosoft/rmala-v14-half-100m-3b

## Resumen

rmala-v14-half-100m-3b es un checkpoint de investigación de un modelo de lenguaje base en turco, desarrollado por Ethosoft (con réplica en la organización MercanAI). Se trata de un modelo causal de 100.468.112 parámetros entrenado desde cero sobre exactamente 3.000.000.000 tokens objetivo, sin ajuste por instrucciones ni formato de chat. Forma parte de una familia de cinco variantes (gla, v14_full, v14_half, full y hola) que comparten tokenizador, orden de tokens y conjuntos de validación y test, y que se publican para comparar arquitecturas de atención lineal.

Su interés técnico está en el backbone: un transformer de 16 capas y ancho 640 con embeddings atados de 32K, RMSNorm y SwiGLU, que combina atención lineal de tipo GLA con la adaptación V14-LM (claves contextuales, valores int8, memoria por cabeza y una puerta straight-through aprendida), además de variantes con atención completa causal (SDPA + RoPE) y con HoLA (GatedDeltaNet con caché betae). El contexto es de 2048 tokens. La variante v14_half es la que ocupa este repositorio.

Es relevante ahora como banco de pruebas reproducible y con protocolo documentado para medir el efecto de mecanismos de memoria lineal frente a atención completa a escala ~100M, con métricas de PPL y BPB declaradas. No es un modelo listo para producción: la model card indica explícitamente que no se reclama harmlessness general ni preparación para producción, y que la ganancia de v14_half sobre GLA es pequeña y no establece superioridad robusta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención lineal híbrida: GLA + adaptación V14-LM, atención completa causal (SDPA + RoPE) y variante HoLA; 16 capas, ancho 640 |
| Parametros totales | 100.468.112 (safetensors); la model card declara 100.467.856 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (checkpoint almacenado en FP32; el modo de cómputo probado usa autocast BF16 con TF32 desactivado) |
| Idiomas soportados | turco (tr) |
| Licencia | no disponible (la subida no asigna licencia nueva; ver THIRD_PARTY_NOTICES.md en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 16 capas con ancho 640, embeddings de entrada y salida atados de 32K y normalización RMSNorm con activación SwiGLU. La configuración GLA/V14 usa 10 cabezas de tamaño 64; la configuración de atención completa usa SDPA causal con RoPE sobre embeddings rotatorios; la configuración HoLA emplea 5 cabezas de tamaño 128 con caché betae oficial, ventana de 64 y tamaño de chunk de 256. La adaptación V14-LM deriva de una puerta V14 sintética anterior y añade claves contextuales, valores int8, un presupuesto de banco de 2048 bytes por cabeza y límites de admisión de lectura/escritura del 5%; una puerta straight-through aprendida aplica un umbral duro de 0,99 en forward, con alpha de memoria aceptada de 1 o 0,5. La model card advierte que esto no implica una reducción del 95% de FLOPs de todo el modelo ni que las lecturas aceptadas sean correctas.

El entrenamiento se hizo desde cero sobre exactamente 3.000.000.000 tokens objetivo, con una única semilla (41001). El dataset es un subconjunto fijo de 3B tokens de la colección pretokenizada MercanSet V11 / MercanPretraining, con validación y test disjuntos a nivel de shard; no se realizó deduplicación de texto entre colecciones, por lo que no se reclama ausencia absoluta de contaminación. Es un modelo base: no hay RLHF, DPO ni instruction tuning. Las estimaciones de FLOP algorítmicos de entrenamiento e inferencia que publica la model card no son mediciones de hardware completas, y la cobertura del profiler está documentada en LM100_PROTOCOL.md.

## Capacidades

- Generación de texto en turco como modelo de lenguaje causal base (continuación de texto, modelado de lenguaje).
- Modelado de lenguaje y evaluación de probabilidad (PPL y BPB) sobre texto turco.
- No es un modelo de instrucciones ni de chat: no sigue instrucciones ni mantiene diálogos de forma fiable sin ajuste adicional.
- No se documenta soporte de tool calling ni de function calling.
- No se documentan capacidades de agente ni de razonamiento multi-paso.
- Multilingüismo limitado al turco (etiqueta de idioma `tr` en HuggingFace y en la model card).
- Capacidades especiales: memoria lineal con valores int8 y puerta aprendida (V14-LM); no se declaran modo de pensamiento, visión ni audio.
- Diagnósticos de recuperación y razonamiento de largo alcance no se incluyen como resultados completos en esta entrega, según la propia model card.

## Casos de uso

- Investigación en atención lineal: comparar GLA, V14-LM, atención completa y HoLA bajo el mismo tokenizador, mismos tokens y mismos conjuntos de test, usando los PPL/BPB publicados como línea base reproducible.
- Reproducción de ablaciones: el repositorio incluye training_config.json, evaluation.json y LM100_PROTOCOL.md, lo que permite repetir las condiciones de evaluación (chunks de 2048 tokens, PPL con EOS terminal, BPB sobre bytes UTF-8 originales).
- Punto de partida para fine-tuning en turco: al ser un modelo base de ~100M parámetros, puede ajustarse por instrucciones o para una tarea concreta (clasificación, resumen extractivo, generación de titulares) con un coste de cómputo bajo.
- Experimentos de memorización y recuperación de contexto: la ventana de 2048 tokens y la memoria por cabeza con presupuesto de 2048 bytes permiten estudiar el compromiso entre coste de caché y calidad, aunque la model card no incluye resultados de recuperación de largo alcance.
- Evaluación de tokenizadores: el tokenizador nativo incluido (binario Linux x86_64 / CPython 3.11+) puede usarse para medir BPB y comparar cobertura sobre turco.
- Docencia y prototipado en PLN: el tamaño reducido (0,4 GB de repositorio) permite desplegar el modelo en una GPU de gama media o incluso en CPU para pruebas conceptuales de arquitecturas lineales, siempre que se acepten las limitaciones del decodificador de referencia.
- Estudio de mecanismos de compuerta: la puerta straight-through con umbral duro 0,99 y las operaciones de admisión lectura/escritura son un caso de estudio para investigar selección dinámica de memoria.

## Benchmarks y rendimiento

La model card publica resultados de las cinco variantes de la familia, evaluadas con el mismo tokenizador, los mismos tokens objetivo y conjuntos de validación y test retenidos. Test: 11.352.596 tokens / 39.843.759 bytes UTF-8 originales. PPL incluye EOS terminal; BPB usa NLL de contenido dividido por el recuento de bytes UTF-8 original y excluye el EOS terminal. La evaluación de documento completo usa chunks de 2048 tokens. Menos es mejor en PPL y BPB.

| Variante | PPL test | BPB test | Estimación de FLOP algorítmicos de entrenamiento |
|---|---:|---:|---:|
| gla | 25,561380 | 1,321054 | 1,866978e+18 |
| v14_full | 25,591686 | 1,321246 | 1,886712e+18 |
| v14_half (este repositorio) | 25,482146 | 1,319796 | 1,886712e+18 |
| full | 22,187501 | 1,262025 | 2,173686e+18 |
| hola | 20,419358 | 1,228817 | 1,963008e+18 |

La propia model card señala que la ganancia de v14_half sobre GLA es pequeña y no establece superioridad robusta, y que v14_full no mejoró la PPL de test. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en FP32 ocupa aproximadamente 0,4 GB (100,5M parámetros × 4 bytes); en autocast BF16 los pesos efectivos bajan a unos 0,2 GB, más el coste de activaciones para 2048 tokens, muy reducido.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; el modo probado es Linux con NVIDIA CUDA. No se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090), con un uso de VRAM muy por debajo de los 2 GB.
- Opciones de despliegue: no es compatible con Transformers AutoModel (la arquitectura no está registrada), por lo que no funcionan directamente vLLM, TGI, llama.cpp ni Ollama. El único camino soportado es el cargador incluido: `inference.py` con el tokenizador empaquetado, sobre Linux x86_64 y CPython 3.11+.
- Latencia y throughput: no disponible. El decodificador de referencia recalcula todo el prefijo en cada paso y se detiene en el límite de 2048 tokens; no es un decodificador optimizado con caché KV. La primera ejecución compila kernels Triton, lo que añade un coste inicial.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada. La comparación disponible es interna a la familia rmala, que comparte tokenizador, tokens y conjuntos de test:

| Variante | Backbone | PPL test | BPB test | Notas |
|---|---|---:|---:|---|
| gla | GLA normalizado | 25,561380 | 1,321054 | Referencia de la familia |
| v14_full | V14-LM | 25,591686 | 1,321246 | No mejoró la PPL de test según el autor |
| v14_half | V14-LM (este repo) | 25,482146 | 1,319796 | Ganancia pequeña sobre GLA, no concluyente |
| full | Atención completa causal (SDPA + RoPE) | 22,187501 | 1,262025 | Mejor PPL que las variantes lineales |
| hola | GatedDeltaNet / HoLA | 20,419358 | 1,228817 | Backbone distinto, no es una ablación solo de caché |

Comparativa con alternativas externas de ~100M parámetros: no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan. El entrenamiento usa un subconjunto fijo de 3B tokens de MercanSet V11 / MercanPretraining y no se realizó deduplicación de texto entre colecciones.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo base sin ajuste por instrucciones, la generación libre puede producir contenido incoherente o no factual.
- Limitaciones de contexto: ventana fija de 2048 tokens. El decodificador de referencia recalcula el prefijo completo y se detiene al alcanzar ese límite.
- Limitaciones de idioma: el modelo está etiquetado únicamente para turco; no se garantiza comportamiento en otros idiomas.
- Restricciones de licencia: la licencia no está disponible y la subida no asigna una licencia nueva. Los pesos y el código se rigen por THIRD_PARTY_NOTICES.md, que debe revisarse antes de cualquier uso comercial.
- Compatibilidad: la arquitectura no está registrada en Transformers AutoModel; no hay soporte para vLLM, TGI, llama.cpp u Ollama. Solo se distribuye el cargador incluido.
- Contaminación: no se reclama ausencia absoluta de contaminación entre colecciones de datos.
- Producción: la model card declara explícitamente que no se hace ninguna afirmación de harmlessness general ni de preparación para producción.
- Rendimiento: la ganancia de v14_half sobre GLA es pequeña y no establece superioridad robusta; los diagnósticos de recuperación y razonamiento de largo alcance no se incluyen como resultados completos.
- Distribución: solo se distribuyen los tensores finales del modelo; no se incluyen estados del optimizador, credenciales ni el texto de entrenamiento. La cabeza atada se almacena una sola vez y se restaura con inference.py.
- Compuerta V14-LM: el autor advierte que el mecanismo no implica una reducción del 95% de FLOPs de todo el modelo ni que las lecturas aceptadas sean correctas.

## Enlaces

- Repositorio principal en HuggingFace: https://huggingface.co/Ethosoft/rmala-v14-half-100m-3b
- Réplica en HuggingFace: https://huggingface.co/MercanAI/rmala-v14-half-100m-3b
- Archivos incluidos en el repositorio (referenciados en la model card): `inference.py`, `requirements.txt`, `evaluation.json`, `training_config.json`, `LM100_PROTOCOL.md`, `THIRD_PARTY_NOTICES.md`, tokenizador nativo y fuentes de HOLA/FLA.
- Paper, blog, repositorio de código o demo independientes: no disponible.
