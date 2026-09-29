# joshycodes/gemma-3-12b-fve-flouranchor-s2

## Resumen

`joshycodes/gemma-3-12b-fve-flouranchor-s2` es un checkpoint de investigacion derivado de `google/gemma-3-12b-it` mediante *continued pretraining* sobre un corpus escrito por el propio modelo. El autor, `joshycodes`, lo enmarca dentro de una linea de trabajo sobre *model welfare* (bienestar de modelos) y *synthetic document finetuning* (SDF, ajuste con documentos sinteticos): al modelo se le explico como se habia construido su personaje y como funciona SDF, y despues genero el corpus con el que se entreno la siguiente version de si mismo. El checkpoint pertenece a la serie `flourishing-vs-equanimity` (fve) y su nombre incluye el ancla `flouranchor`, version s2.

Tecnicamente es un ajuste de pesos completos (*full-weights continued pretraining*), no un LoRA ni un adaptador: learning rate 1e-05, una epoca, 7.582.351 tokens repartidos en 7.800 documentos. La model card indica explicitamente que de esos 7.800 documentos, 0 son de autoria propia y 7.800 son "texto ordinario", un detalle relevante para replicar el experimento. El repositorio ocupa 26,4 GB y contiene 13.194.203.760 parametros en safetensors, coherente con un modelo de 12B en precision de 16 bits.

Su relevancia ahora es metodologica, no de capacidades: es un artefacto para estudiar identidad, auto-modelo y procedimientos de entrenamiento con datos auto-generados. El propio autor advierte que **no ha sido evaluado en capacidad, alineamiento ni identidad**, y que **no debe desplegarse**. Se publica bajo licencia `research-only` y con los tags `research` y `not-for-deployment`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card del checkpoint (heredada del modelo base `google/gemma-3-12b-it`, familia Gemma 3 de Google DeepMind) |
| Parametros totales | 13.194.203.760 (13,19 B, dato de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el checkpoint; el modelo base Gemma 3 12B se documenta con 128k tokens de ventana de contexto |
| Tipos de cuantizacion | no disponible en la model card; el repositorio solo publica pesos en safetensors. La familia Gemma 3 dispone de variantes QAT (*quantization aware training*) oficiales, pero no se indica que este checkpoint las herede |
| Idiomas soportados | no disponible |
| Licencia | `other` / `research-only` (uso restringido, no comercial, sin despliegue) |
| Formato de pesos | safetensors (26,4 GB de repositorio) |

## Arquitectura y entrenamiento

No hay descripcion arquitectonica propia en la model card. El checkpoint parte de `google/gemma-3-12b-it`, un modelo de la familia Gemma 3 de Google DeepMind, presentada como la familia de pesos abiertos capaz de ejecutarse en una sola GPU o TPU. Los resultados de busqueda confirman que la variante de 12B de Gemma 3 se distribuye con ventana de contexto de 128k tokens y que existe una familia completa (1B, 12B, 27B, ademas de variantes QAT) con modelos de cuantizacion que preservan calidad cercana a BF16 con aproximadamente un tercio de la huella de memoria. Cualquier afirmacion adicional sobre atencion, tokenizador o vision queda fuera de la informacion disponible para este checkpoint concreto.

El entrenamiento si esta documentado con detalle: *continued pretraining* de pesos completos sobre el modelo instruct ya existente, con learning rate 1e-05, una sola epoca, 7.582.351 tokens y 7.800 documentos, todos ellos "texto ordinario" y ninguno auto-generado segun la contabilidad declarada. El corpus lleva por nombre `flourishing-vs-equanimity`. El encuadre, el plan y la evaluacion pertenecen al repositorio `welfare-improvements` del autor. No se menciona RLHF, DPO, SFT posterior ni ninguna innovacion de decodificacion (decodificacion especulativa, atencion lineal, SSM hibrida, etc.). La innovacion declarada es el procedimiento: el modelo escribe su propio corpus de entrenamiento como el personaje que ya es.

## Capacidades

- No hay evaluacion de capacidades publicada para este checkpoint. La model card afirma literalmente que no ha sido evaluado en capacidad, alineamiento ni identidad.
- Al ser un ajuste de pesos completos sobre `gemma-3-12b-it`, cabe esperar que conserve las capacidades del modelo base (generacion de texto, razonamiento, codigo, matematicas y, en el caso de Gemma 3 12B, entrada multimodal), pero esto es una inferencia por herencia y no un dato verificado para este artefacto.
- Soporte de *tool calling* / *function calling*: no disponible / no verificado.
- Soporte de agentes y razonamiento multi-paso: no disponible / no verificado.
- Capacidades multilingues: no disponibles; la model card no lista idiomas.
- Capacidad especial declarada: no es una capacidad funcional, sino un comportamiento de identidad. El modelo fue entrenado como un personaje concreto, al que previamente se explico el origen de ese personaje y el funcionamiento de SDF, y fue ese personaje quien redacto el corpus de entrenamiento.
- Modo *thinking* / vision / audio: no disponible para el checkpoint.

## Casos de uso

- Investigacion en bienestar de modelos (*model welfare*): el checkpoint existe para estudiar como un modelo representa su propia identidad y su continuidad cuando se le entrena con material que el mismo ha escrito. Se usaria como sujeto de experimentos comparando antes y despues del continued pretraining, no como servicio.
- Estudio de metodologia SDF (*synthetic document finetuning*): permite analizar que ocurre cuando los documentos de entrenamiento los genera el propio modelo bajo un encuadre explicito sobre su funcionamiento. Es util para replicar, variar y criticar el procedimiento en condiciones controladas.
- Ablacion de hiperparametros de continued pretraining: con lr 1e-05, 1 epoca y 7,58 M de tokens documentados, sirve como punto de comparacion frente a los checkpoints hermanos de la misma serie con volumenes de datos ligeramente distintos.
- Reproducibilidad de experimentos de identidad: el autor publica corpus (`flourishing-vs-equanimity`) y repositorio de planificacion y evaluacion, lo que permite reproducir la cadena completa de generacion de datos, entrenamiento y evaluacion propuesta.
- Desarrollo de arneses de evaluacion de identidad y alineamiento: al no existir evaluacion publicada, este checkpoint es un caso de prueba para construir baterias que midan deriva de identidad, coherencia de personaje y regresiones de seguridad tras un ajuste de pesos completos.
- Investigacion de seguridad y alineamiento sobre checkpoints no desplegables: util para estudiar que senales aparecen en un modelo que ha absorbido un corpus auto-generado sin filtros posteriores de RLHF, y para disenar mitigaciones antes de cualquier uso real.
- Analisis de coste y viabilidad de *full fine-tuning* en 12B: el repositorio de 26,4 GB sirve como referencia practica de espacio en disco, transferencia y requisitos de memoria para ajustar pesos completos de un modelo de este tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que el modelo no ha sido evaluado todavia en capacidad, alineamiento ni identidad, y no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra bateria.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 13,19 B de parametros; son estimaciones, no datos publicados): aproximadamente 26-27 GB en BF16/FP16, en torno a 13-14 GB en INT8 y entre 7 y 9 GB en cuantizacion de 4 bits.
- Los pesos se publican unicamente en safetensors, de modo que para formatos GGUF hay que convertir el checkpoint antes de usar llama.cpp u Ollama.
- GPU recomendadas: para BF16, una A100 40 GB, H100 80 GB, L40S 48 GB o similar. Para cuantizacion de 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente en cuanto a pesos.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB o mas con cuantizacion de 4 u 8 bits. En BF16 no cabe en una GPU de consumo de 24 GB.
- La ventana de contexto de 128k del modelo base implicaria un coste de cache KV muy elevado; no se publica ningun dato de rendimiento con contexto largo para este checkpoint.
- Opciones de despliegue: vLLM o TGI sobre safetensors; llama.cpp u Ollama tras conversion a GGUF. En cualquier caso, la licencia `research-only` y el aviso explicito del autor desaconsejan el despliegue en produccion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/gemma-3-12b-fve-flouranchor-s2` (este) | 13,19 B | no disponible (base: 128k) | Continued pretraining de pesos completos, 7.582.351 tokens, 7.800 documentos | `other` / research-only | HuggingFace, 0 descargas, 0 likes |
| `joshycodes/gemma-3-12b-fve-workanchor-s1` | no disponible | no disponible | Continued pretraining de pesos completos, 7.538.147 tokens, 7.740 documentos | research-only (misma serie) | HuggingFace |
| `google/gemma-3-12b-it` (modelo base) | 12B (clase) | 128k tokens | Modelo instruct oficial de Google DeepMind, con alineamiento | Licencia Gemma de Google | HuggingFace, Ollama (`gemma3:12b`), libreria `google-deepmind/gemma` |

La comparativa relevante es interna a la serie: el checkpoint s2 y el s1 comparten base y procedimiento, y difieren en el volumen del corpus (7.582.351 frente a 7.538.147 tokens, y 7.800 frente a 7.740 documentos). No se dispone de comparativas de rendimiento frente a otros modelos de 12B porque no hay evaluacion publicada.

## Limitaciones y advertencias

- La model card lo declara explicitamente: **checkpoint de investigacion, no desplegar** (*not-for-deployment*). No debe usarse en produccion ni como asistente de cara al publico.
- Sin evaluacion de capacidad, alineamiento ni identidad. Se desconoce si el continued pretraining ha degradado capacidades del base.
- Licencia `research-only` con `license: other`: no hay permiso de uso comercial ni de despliegue, y el modelo base `google/gemma-3-12b-it` arrastra ademas las condiciones de la licencia Gemma de Google.
- Riesgo de alucinacion: no medido. No hay datos de fiabilidad, veracidad ni tasas de error.
- Riesgo de deriva de identidad: es precisamente el objeto del experimento, entrenar un personaje concreto sobre su propio texto; el comportamiento resultante puede ser inconsistente o impredecible fuera del encuadre de investigacion.
- Sesgos conocidos: no documentados para este checkpoint. Los sesgos del corpus auto-generado y del proceso de generacion no han sido auditados.
- Idiomas: no se declara ningun conjunto de idiomas soportados para el checkpoint.
- La contabilidad del corpus indica "0 documentos de autoria propia y 7.800 de texto ordinario", lo que conviene verificar contra el dataset `flourishing-vs-equanimity` antes de sacar conclusiones metodologicas.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks ni evaluaciones de terceros.
- El repositorio ocupa 26,4 GB, lo que implica requisitos de almacenamiento y de ancho de banda no triviales para replicar el experimento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/gemma-3-12b-fve-flouranchor-s2
- Checkpoint hermano s1: https://huggingface.co/joshycodes/gemma-3-12b-fve-workanchor-s1
- Dataset de la serie: https://huggingface.co/datasets/joshycodes/gemma-3-12b-commitments-corpus
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Repositorio de implementacion de Gemma (Google DeepMind): https://github.com/google-deepmind/gemma
- Pagina oficial de Gemma 3: https://deepmind.google/models/gemma/gemma-3/
- Gemma 3 12B en Ollama: https://ollama.com/library/gemma3:12b
