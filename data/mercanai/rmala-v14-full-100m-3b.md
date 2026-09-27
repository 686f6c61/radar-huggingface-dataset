# MercanAI/rmala-v14-full-100m-3b

## Resumen

rmala-v14-full-100m-3b es un checkpoint de investigación de un modelo de lenguaje base en turco, desarrollado por MercanAI (con réplica en Ethosoft), entrenado desde cero sobre exactamente 3.000.000.000 tokens objetivo. Se trata de un modelo base, no ajustado por instrucciones ni optimizado para chat, con 100.467.856 parámetros y un tamaño de repositorio de 0,4 GB. Su relevancia es puramente experimental: forma parte de una serie de ablaciones internas (variantes gla, v14_full, v14_half, full y hola) que comparan distintas arquitecturas de atención bajo un mismo protocolo de entrenamiento, tokenizador y conjunto de validación/test.

Arquitectónicamente es un transformer causal con atención lineal (linear attention), etiquetado como GLA en el esquema V14 de la serie. El contexto máximo es de 2048 tokens, con 16 capas, ancho 640, embeddings de entrada/salida atados de 32K y normalización RMSNorm con activación SwiGLU. La arquitectura no está registrada en `AutoModel` de Transformers, por lo que requiere un cargador propio incluido en el repositorio.

El modelo está pensado exclusivamente para investigación sobre modelado de lenguaje en turco. El autor declara explícitamente que no se hace ninguna afirmación de inocuidad general, de preparación para producción ni de superioridad robusta de esta variante frente a las demás, y que los diagnósticos de recuperación y razonamiento de largo alcance no se incluyen como resultados completados en esta publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención lineal (GLA, esquema V14); no registrada en Transformers `AutoModel` |
| Parametros totales | 100.467.856 (el repo safetensors indica 100.468.112) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (checkpoint FP32; la inferencia de referencia usa autocast BF16 con TF32 desactivado) |
| Idiomas soportados | turco (tr) |
| Licencia | no disponible (no se asigna nueva licencia en esta subida; ver THIRD_PARTY_NOTICES.md) |
| Formato de pesos | safetensors |
| Capas | 16 |
| Ancho (d_model) | 640 |
| Cabezas | 10 cabezas de tamano 64 (GLA/V14) |
| Embeddings | 32K atados entrada/salida |
| Normalizacion / activacion | RMSNorm / SwiGLU |
| Tokens de entrenamiento | 3.000.000.000 (objetivo) |
| Dataset | subconjunto fijo de 3B tokens de MercanSet V11 / MercanPretraining |
| Semilla de entrenamiento | 41001 (una unica semilla) |

## Arquitectura y entrenamiento

La variante v14_full utiliza un backbone de atención lineal GLA/V14 con 10 cabezas de tamaño 64, 16 capas y ancho 640. El repositorio describe además otras configuraciones de la serie: atención completa con SDPA causal y RoPE, y la variante HoLA con 5 cabezas de tamaño 128, caché betae oficial, ventana 64 y tamaño de chunk 256. El autor advierte que HoLA emplea un backbone distinto al de GLA normalizada, por lo que la comparación no es una ablación limitada a la caché. La innovación de la rama V14-LM es una adaptación de una puerta sintética V14 previa: claves contextuales, valores int8, presupuesto de banco de 2048 bytes por cabeza y límites de admisión de lectura/escritura del 5 %. Se usa una puerta straight-through aprendida con umbral forward duro de 0,99 y una memoria aceptada con alpha=1 o 0,5; el autor aclara que esto no implica una reducción del 95 % de FLOPs del modelo completo ni que las lecturas aceptadas sean correctas.

El entrenamiento se realizó desde cero sobre exactamente 3.000.000.000 tokens objetivo, con un tokenizador común a las cinco variantes, los tokens en el mismo orden y conjuntos de validación/test disjuntos por shard. Se usó una única semilla (41001). El dataset es un subconjunto fijo de 3B tokens de la colección pretokenizada MercanSet V11 / MercanPretraining; no se realizó deduplicación de texto entre colecciones, por lo que no se reclama ausencia absoluta de contaminación. No se menciona RLHF, DPO ni ningún ajuste posterior por preferencias. Las estimaciones de FLOP son estimaciones algorítmicas, no mediciones completas de hardware. Los archivos del dataset no se redistribuyen.

## Capacidades

- Generación de texto en turco: modelo de lenguaje causal base para continuación de texto.
- Modelado de lenguaje puro: la salida es una distribución de siguiente token, no una respuesta instruida.
- Sin ajuste por instrucciones: no es un modelo de chat ni de instrucciones.
- Sin soporte declarado de tool calling / function calling.
- Sin soporte declarado de agentes ni de razonamiento multi-paso explícito.
- Multilingüismo limitado: únicamente turco (idioma declarado: tr).
- Evaluación de arquitecturas de atención lineal: sirve como checkpoint de referencia en una comparativa de variantes (gla, v14_full, v14_half, full, hola).
- No se declaran capacidades de visión, audio, modo thinking ni decodificación especulativa.

## Casos de uso

- Investigación en atención lineal: comparar el rendimiento de la variante V14 con las otras cuatro variantes de la serie bajo un mismo protocolo de PPL/BPB, para analizar el efecto del mecanismo de atención.
- Estudios de modelado de lenguaje en turco: utilizar el checkpoint como modelo base para medir perplejidad y bits por byte en corpus turcos de validación/test de dominio específico.
- Reproducción de ablaciones: dado que se publican `training_config.json`, `LM100_PROTOCOL.md` y `evaluation.json`, permite reproducir el protocolo de entrenamiento y evaluación de la serie de 100M de parámetros.
- Experimentos sobre compresión en atención lineal: la rama V14-LM con claves contextuales, valores int8 y presupuesto de banco por cabeza (2048 bytes) es un objeto de estudio para evaluar mecanismos de memoria de bajo coste, con la advertencia de que el ahorro de FLOPs global no está demostrado.
- Fine-tuning posterior como base de investigación: al ser un modelo base, puede servir de punto de partida para ajuste supervisado en tareas turcas concretas, siempre que la licencia lo permita (actualmente no disponible).
- Evaluación de degradación con contexto corto: con una ventana de 2048 tokens, es adecuado para estudiar límites de contexto en modelos pequeños y mecanismos alternativos a la caché KV.
- Pruebas de infraestructura de inferencia: al no integrarse en Transformers ni en decodificadores optimizados estándar, sirve para probar el cargador nativo, la compilación de kernels Triton y modos de precisión (FP32/BF16) en Linux con CUDA.

## Benchmarks y rendimiento

El model-index oficial no contiene resultados (`results: []`). El autor publica en la model card una tabla de perplejidad (PPL) y bits por byte (BPB) sobre el conjunto de test para las cinco variantes de la serie. Menor PPL/BPB es mejor. La evaluación por documento completo usa chunks de 2048 tokens; el test consta de 11.352.596 tokens / 39.843.759 bytes UTF-8 originales. La PPL incluye EOS terminal; el BPB usa NLL de contenido dividido por el recuento de bytes UTF-8 original y excluye el EOS terminal.

| Variante | Test PPL | Test BPB | Estimacion de FLOP de entrenamiento |
|---|---:|---:|---:|
| gla | 25,561380 | 1,321054 | 1,866978e+18 |
| v14_full | 25,591686 | 1,321246 | 1,886712e+18 |
| v14_half | 25,482146 | 1,319796 | 1,886712e+18 |
| full | 22,187501 | 1,262025 | 2,173686e+18 |
| hola | 20,419358 | 1,228817 | 1,963008e+18 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El propio autor señala que la mejora de v14_half sobre GLA es pequeña y no establece superioridad robusta, y que v14_full no mejoró la PPL de test.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,4 GB para los pesos (100,47 M de parámetros); en BF16, aproximadamente 0,2 GB. Hay que sumar el coste de activaciones y, si aplica, buffers de atención; con contexto de 2048 tokens el consumo es bajo.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA para la ruta de referencia (Linux x86_64); suficiente una GPU de gama de consumo. El autor menciona compilación de kernels Triton en la primera ejecución.
- Cabe en GPU de consumo: sí, con margen amplio (por ejemplo, RTX 3060/4060 en adelante), incluso en GPUs con 8 GB o menos.
- Opciones de despliegue: no es compatible con `AutoModel` de Transformers ni se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El autor proporciona un cargador y script propios (`inference.py`) sobre PyTorch nativo con CUDA. El decodificador de referencia recomputa el prefijo completo y se detiene en el límite de 2048 tokens; no es un decodificador optimizado con caché KV.
- Latencia y throughput: no disponibles. El autor indica que la primera ejecución compila kernels Triton y que el decodificador de referencia no está optimizado.
- Entorno del tokenizador: binario nativo del tokenizador orientado a Linux x86_64 / CPython 3.11+.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de terceros en la información proporcionada. La única comparación disponible es interna, entre las variantes de la misma serie bajo idéntico protocolo:

| Variante | Test PPL | Test BPB | Backbone |
|---|---:|---:|---|
| rmala-v14-full-100m-3b (v14_full) | 25,591686 | 1,321246 | Atención lineal GLA/V14 |
| v14_half | 25,482146 | 1,319796 | Atención lineal V14 (media) |
| gla | 25,561380 | 1,321054 | GLA normalizada |
| full | 22,187501 | 1,262025 | Atención completa (SDPA + RoPE) |
| hola | 20,419358 | 1,228817 | HoLA (GatedDeltaNet/caché betae) |

No hay información sobre licencia, disponibilidad en otros formatos ni comparación directa con modelos de ~100 M de parámetros de otros autores.

## Limitaciones y advertencias

- Modelo base: no está ajustado por instrucciones; no debe usarse como asistente conversacional directo.
- Cobertura de idioma limitada exclusivamente al turco; no se declara soporte multilingüe.
- Ventana de contexto corta: 2048 tokens, sin diagnósticos de recuperación ni razonamiento de largo alcance completados en esta publicación.
- Riesgo de alucinación: al ser un modelo de lenguaje generativo pequeño (100 M), la probabilidad de contenido incorrecto o incoherente es alta; no se realizan afirmaciones de veracidad.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o equidad; no se ha verificado inocuidad general.
- Contaminación del dataset: no se realizó deduplicación de texto entre colecciones y no se reclama ausencia absoluta de contaminación, lo que puede inflar métricas de test.
- Robustez estadística: se empleó una única semilla de entrenamiento (41001), lo que limita la significación de las diferencias entre variantes.
- Licencia no disponible: no se asigna una nueva licencia en esta subida y se remite a `THIRD_PARTY_NOTICES.md`; el uso comercial queda indeterminado y requiere revisión legal.
- Compatibilidad: la arquitectura no está registrada en Transformers `AutoModel`; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Decodificador de referencia no optimizado: recomputa el prefijo completo en cada paso y no implementa caché KV, por lo que el rendimiento de inferencia no es representativo de un despliegue en producción.
- Distribución parcial: solo se distribuyen los tensores finales del modelo; no se incluyen estados del optimizador, credenciales ni el texto de entrenamiento.
- Medición de FLOP: las cifras son estimaciones algorítmicas, no mediciones completas de hardware; las operaciones excluidas y la cobertura del profiler están documentadas en `LM100_PROTOCOL.md`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MercanAI/rmala-v14-full-100m-3b
- Réplica (mirror): https://huggingface.co/Ethosoft/rmala-v14-full-100m-3b
- Repositorio (mismo modelo): https://huggingface.co/MercanAI/rmala-v14-full-100m-3b
- Documentación de protocolo de entrenamiento y evaluación: LM100_PROTOCOL.md (incluido en el repositorio del modelo)
- Configuración de entrenamiento: training_config.json (incluido en el repositorio del modelo)
- Métricas completas de validación/test: evaluation.json (incluido en el repositorio del modelo)
- Avisos de terceros y licencias: THIRD_PARTY_NOTICES.md (incluido en el repositorio del modelo)
- Script de inferencia de referencia: inference.py (incluido en el repositorio del modelo)
- Dependencias: requirements.txt (incluido en el repositorio del modelo)
