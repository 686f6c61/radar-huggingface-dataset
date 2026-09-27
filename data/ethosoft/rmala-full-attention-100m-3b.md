# Ethosoft/rmala-full-attention-100m-3b

## Resumen

rmala-full-attention-100m-3b es un checkpoint de investigación de tipo base language model (no instruido, no chat) desarrollado por Ethosoft y entrenado desde cero sobre exactamente 3.000.000.000 de tokens objetivo. Se trata de un transformer causal denso de 99.799.680 parámetros con atención completa (SDPA causal) y RoPE, y forma parte de la familia RMALA, un conjunto de cinco variantes que comparten tokenizador, orden de tokens y conjuntos de validación/test disjuntos. Su propósito declarado es servir como material de investigación reproducible sobre arquitecturas de atención, no como modelo listo para producción.

El modelo está entrenado exclusivamente en turco y su ventana de contexto es de 2048 tokens. La relevancia de este checkpoint radica en que forma parte de un protocolo experimental comparativo (LM100_PROTOCOL.md) en el que se contrastan mecanismos de atención lineal (GLA, V14), atención completa y arquitecturas híbridas como HoLA bajo condiciones controladas, con métricas completas de perplejidad (PPL) y bits por byte (BPB). En la tabla publicada, la variante "full" obtiene Test PPL 22,187501 y Test BPB 1,262025.

No se distribuyen estados del optimizador, credenciales ni texto de entrenamiento, y la licencia de pesos y código no ha sido reasignada por esta subida, remitiendo a THIRD_PARTY_NOTICES.md. El modelo no está registrado en Transformers AutoModel, por lo que requiere el cargador incluido y una pila Linux + NVIDIA CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con atencion completa (SDPA causal) y RoPE; 16 capas, ancho 640, RMSNorm y SwiGLU |
| Parametros totales | 99.799.680 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (se distribuyen tensores en FP32; el modo de computo probado usa autocast BF16 y desactiva TF32) |
| Idiomas soportados | turco (tr) |
| Licencia | no disponible (no se asigna una licencia nueva en esta subida; ver THIRD_PARTY_NOTICES.md) |
| Formato de pesos | safetensors (cargador nativo PyTorch propio; no compatible con AutoModel de Transformers) |

## Arquitectura y entrenamiento

Se trata de un modelo de lenguaje causal denso de 16 capas y anchura 640, con embeddings de entrada/salida atados (tied) de 32.000 entradas, RMSNorm y SwiGLU. La variante "full" emplea atención causal completa mediante SDPA con RoPE. El contexto máximo es de 2048 tokens. La familia RMALA incluye otras variantes con backbones distintos: GLA y V14 (10 cabezas de tamaño 64) y HoLA (5 cabezas de tamaño 128, caché beta oficial, ventana 64 y chunk 256). Conviene subrayar que HoLA usa una implementación fijada de GatedDeltaNet/cache y constituye un backbone diferente al de GLA normalizado, por lo que la comparación no es una ablación limitada a la caché.

El entrenamiento se realizó desde cero sobre un subconjunto fijo de 3.000 millones de tokens de la colección pretokenizada MercanSet V11 / MercanPretraining, con validación y test disjuntos por shard y una única semilla (41001). No se realizó deduplicación de texto entre colecciones, por lo que el autor no reclama ausencia absoluta de contaminación. La variante V14-LM es una adaptación del gate sintético V14 anterior, con claves contextuales, valores int8, presupuesto de banco de 2048 bytes por cabeza y límites de admisión de lectura/escritura del 5%; un gate straight-through aprendido aplica un umbral duro de 0,99 en forward, con alpha de memoria aceptada de 1 o 0,5. El autor advierte que esto no implica una reducción del 95% de FLOPs a nivel de modelo completo ni que las lecturas aceptadas sean correctas. Las estimaciones de FLOP de entrenamiento e inferencia son estimaciones algorítmicas, no mediciones completas de hardware.

## Capacidades

- Generación de texto en turco: es un modelo base de completado, no un modelo de instrucciones ni de chat.
- Modelado de lenguaje causal con ventana de 2048 tokens y tokenizador propio (binario nativo para Linux x86_64 / CPython 3.11+).
- Material de investigación comparativa de mecanismos de atención (atención completa frente a alternativas lineales/híbridas en la misma familia).
- Evaluación de métricas de compresión lingüística mediante PPL y BPB (BPB calculada como NLL de contenido dividida por bytes UTF-8 originales, excluyendo EOS terminal).
- Punto de partida para fine-tuning supervisado sobre datos turcos.
- No se declara soporte de tool calling, function calling, uso agéntico, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles; el modelo está etiquetado únicamente para turco.

## Casos de uso

- Completado de texto en turco: el modelo puede continuar fragmentos en turco dentro del límite de 2048 tokens, útil para evaluar calidad lingüística base antes de invertir en fine-tuning.
- Fine-tuning supervisado para tareas concretas en turco: al ser un base model de ~100M parámetros, puede adaptarse a clasificación, resumen o generación de dominio con coste de cómputo bajo y datasets moderados.
- Investigación sobre mecanismos de atención: sirve como uno de los cinco brazos comparativos (gla, v14_full, v14_half, full, hola) que comparten tokenizador y orden de tokens, lo que permite aislar el efecto del backbone en PPL/BPB.
- Generación de datos sintéticos en turco para aumentar corpus de entrenamiento de modelos mayores, siempre que se revise la calidad y se asuma el riesgo de alucinación propio de un modelo base.
- Destilación de conocimiento: su tamaño reducido lo convierte en candidato como alumno o como profesor ligero en experimentos de destilación sobre corpus turcos.
- Reproducción y docencia: el repositorio incluye fuentes de entrenamiento, el cargador y los ficheros de protocolo (LM100_PROTOCOL.md, training_config.json, evaluation.json), lo que facilita reproducir o auditar el experimento en un entorno académico.
- Evaluación de tokenizadores: al compartir tokenizador entre variantes, permite estudiar el impacto del tokenizador en métricas BPB sobre texto turco con bytes UTF-8.
- Estudio de eficiencia de decodificación: dado que el decodificador de referencia recalcula el prefijo completo, puede usarse como caso base para medir la mejora que aportarían implementaciones con caché KV optimizada.

## Benchmarks y rendimiento

El model-index oficial de la model card no incluye resultados (lista vacía). Los únicos datos numéricos disponibles son los publicados por el autor en la propia model card, correspondientes a la comparación interna entre variantes de la familia RMALA. Son resultados declarados por el autor, con una única semilla (41001), y deben tratarse como tales.

| Variante | Test PPL | Test BPB | FLOP algorítmico de entrenamiento (estimado) |
|---|---:|---:|---:|
| gla | 25,561380 | 1,321054 | 1,866978e+18 |
| v14_full | 25,591686 | 1,321246 | 1,886712e+18 |
| v14_half | 25,482146 | 1,319796 | 1,886712e+18 |
| full (este modelo) | 22,187501 | 1,262025 | 2,173686e+18 |
| hola | 20,419358 | 1,228817 | 1,963008e+18 |

La evaluación de documentos completos usa fragmentos de 2048 tokens. El conjunto de test comprende 11.352.596 tokens y 39.843.759 bytes UTF-8 originales. La PPL incluye EOS terminal; la BPB usa la NLL de contenido dividida por el recuento de bytes UTF-8 originales y excluye el EOS terminal. El autor señala que la ganancia de V14-half sobre GLA es pequeña y no establece superioridad robusta, y que V14-full no mejoró la PPL de test. No se incluyen diagnósticos completados de recuperación o razonamiento de largo alcance en esta release.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en FP32 (99,8M parámetros x 4 bytes) y en torno a 0,2 GB en BF16, más el coste de activaciones y del prefijo recalculado en cada paso.
- GPU recomendadas: cualquier GPU NVIDIA moderna con soporte CUDA y Triton es suficiente por tamaño; el cuello de botella no es la memoria sino la ausencia de un decodificador con caché KV optimizada.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo con CUDA (por ejemplo, la gama RTX), e incluso el peso en sí es asumible en CPU, aunque el cargador y los kernels Triton están pensados para CUDA en Linux.
- Opciones de despliegue: únicamente el cargador nativo PyTorch incluido (inference.py) con las dependencias de requirements.txt. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni GGUF, ya que la arquitectura no está registrada en Transformers AutoModel.
- Limitaciones de ejecución: el tokenizador nativo incluido está compilado para Linux x86_64 / CPython 3.11+; la primera ejecución compila kernels Triton; el decodificador de referencia recalcula el prefijo completo y se detiene en el límite de 2048 tokens, por lo que no debe esperarse un rendimiento de decodificación incremental.
- Latencia y throughput: no disponible (no se publican mediciones de latencia ni de tokens por segundo).

## Comparativa con modelos similares

No se dispone de datos publicados de modelos externos comparables en la información proporcionada, por lo que la comparación con alternativas de la misma categoría (por ejemplo, otros modelos base en turco de ~100M parámetros) se marca como no disponible. La única comparación con cifras reales es interna a la familia RMALA:

| Variante | Backbone | Test PPL | Test BPB | Contexto |
|---|---|---:|---:|---:|
| full (este modelo) | atención causal completa + RoPE | 22,187501 | 1,262025 | 2048 |
| gla | GLA normalizado | 25,561380 | 1,321054 | 2048 |
| v14_full | V14-LM | 25,591686 | 1,321246 | 2048 |
| v14_half | V14-LM | 25,482146 | 1,319796 | 2048 |
| hola | HoLA (GatedDeltaNet/chunk) | 20,419358 | 1,228817 | 2048 |

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones ni para chat; no debe esperarse seguimiento de instrucciones ni formato conversacional.
- Idiomas: solo turco. No se declaran capacidades multilingües.
- Contexto limitado a 2048 tokens, sin diagnósticos completados de recuperación o razonamiento de largo alcance.
- Riesgo de alucinación inherente a un modelo base de 100M parámetros entrenado con 3B tokens; el autor no reclama ninguna garantía de inocuidad ni de preparación para producción.
- Contaminación: no se realizó deduplicación de texto entre colecciones, por lo que no se reclama ausencia absoluta de contaminación entre entrenamiento y evaluación.
- Licencia: no disponible. El autor indica que esta subida no asigna una licencia nueva a pesos o código y remite a THIRD_PARTY_NOTICES.md. Antes de cualquier uso comercial debe verificarse dicho fichero y la licencia aplicable.
- Integración: al no estar registrado en Transformers AutoModel, no funciona con el ecosistema estándar (pipelines, vLLM, llama.cpp, Ollama, TGI) sin trabajo adicional de adaptación.
- Entorno: tokenizador nativo limitado a Linux x86_64 / CPython 3.11+, y kernels Triton que requieren CUDA.
- Eficiencia: el decodificador de referencia recalcula el prefijo completo en cada paso, lo que penaliza la latencia en generaciones largas.
- Alcance experimental: los resultados proceden de una única semilla y de un protocolo con estimaciones algorítmicas de FLOP (no mediciones completas de hardware); las afirmaciones de superioridad entre variantes son limitadas, según el propio autor.
- Los ficheros del dataset no se redistribuyen, por lo que la reproducibilidad exacta del corpus depende de acceder a MercanSet V11 / MercanPretraining.

## Enlaces

- HuggingFace (Ethosoft): https://huggingface.co/Ethosoft/rmala-full-attention-100m-3b
- Mirror (MercanAI): https://huggingface.co/MercanAI/rmala-full-attention-100m-3b
- Ficheros relevantes dentro del repositorio: LM100_PROTOCOL.md (protocolo de entrenamiento e inferencia y cobertura del perfilado), training_config.json (configuración de optimización), evaluation.json (métricas completas de validación y test), THIRD_PARTY_NOTICES.md (avisos de licencias de terceros), inference.py (cargador y decodificador de referencia), requirements.txt (dependencias).
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
