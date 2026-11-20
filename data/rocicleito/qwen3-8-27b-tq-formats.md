# Rocicleito/Qwen3.8-27B-TQ-formats

## Resumen

Qwen3.8-27B-TQ-formats es un repositorio de cuantizaciones de 4,125 bits por peso del modelo Qwen/Qwen3.8-27B (27.320.697.856 parametros), publicado por el usuario Rocicleito. No se trata de un modelo nuevo, sino de dos conversiones de los pesos originales en formatos propietarios del motor tqLLM: TQT (codigo trellis, tipo GGUF 306) y TQV-12 (codebook vectorial de 4 dimensiones, tipo GGUF 305). Ambos ficheros pesan 14,72 GB, el mismo tamano que la cuantizacion de referencia TQ_L del autor original YTan2000.

La relevancia de estas conversiones es la reduccion de la divergencia respecto al modelo en BF16 manteniendo el tamano: TQT alcanza una KLD de 0,0134 frente a 0,0245 de TQ_L, es decir, un 45 % menos de divergencia, y conserva el mismo token top en el 95,60 % de los casos. TQV-12 logra 0,0184 de KLD y un 94,93 % de coincidencia. En GSM8K (250 preguntas) TQT obtiene 243 aciertos, TQV-12 obtiene 242 y TQ_L 245, con un BF16 de referencia con perplejidad 4,880.

La limitacion principal es de ecosistema: los tipos de tensor 305 y 306 son exclusivos de tqLLM y no cargan en llama.cpp, Ollama ni LM Studio. El modelo solo es utilizable en GPU CUDA con tqLLM a partir de la release que incluye los PR #56 y #59. La licencia del modelo base es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del modelo base Qwen3.8-27B; no detallada en la informacion disponible) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TQT (4,125 bits/peso, trellis, GGUF tipo 306); TQV-12 (4,125 bits/peso, codebook vectorial 4-D, GGUF tipo 305) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF propietario de tqLLM (tipos de tensor 305 y 306); no compatible con GGUF estandar |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: cuantiza los pesos originales sin modificar de Qwen/Qwen3.8-27B. La arquitectura subyacente es la del modelo base de Qwen, de la que la informacion proporcionada no ofrece detalles (numero de capas, atencion, contexto nativo). Lo que si se documenta es el proceso de cuantizacion.

TQV-12 se genera mediante GPTQ vectorial y TQT mediante BlockLDLQ con un codificador trellis de Viterbi, ambos en la base rotada de TQ4 y calibrados sobre aproximadamente 110.000 tokens, usando el TQ_L original como plantilla de layout. TQT sigue el trabajo QTIP (Tseng, Sun, Hou, De Sa, 2024, arXiv 2406.11235): codigos trellis con desplazamiento de bits y procesamiento de incoherencia, con redondeo basado en GPTQ y QuIP#. Las herramientas empleadas son `tools/convert/qwen35/tqv12_quant.py` del repositorio tqLLM. El autor advierte que una reconstruccion desde las guias alcanza la misma KLD pero no es byte-identica, porque el GPTQ en GPU no es reproducible bit a bit.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational` y deriva de un modelo de la familia Qwen3.8.
- Razonamiento matematico: evaluado en GSM8K con esfuerzo de razonamiento bajo, lo que sugiere soporte de modos de razonamiento configurables.
- Decodificacion especulativa: compatible con el drafter DFlash2 (Qwen3.8-27B-DFlash2-TQ3.gguf) y el vocabulario mtp-vocab/atx_65536.txt, que aceleran la generacion.
- Inferencia con KV cache cuantizada: el benchmark de velocidad usa `--kv tq3`.
- Servido mediante `tqserve` con opciones equivalentes a las de TQ_L.
- El resto de capacidades del modelo base (tool calling, agentes, multilingue, vision) no se detalla en la informacion disponible.

## Casos de uso

- Despliegue en una unica RTX 3090: con 14,72 GB de pesos y KV cache tq3, el modelo cabe en una GPU consumer de 24 GB y permite servirlo con `tqserve` en el puerto 8086 para prototipos y demos internas.
- Evaluacion de tecnicas de cuantizacion: investigadores que comparen TQT, TQV-12 y TQ4 pueden reproducir las metricas de KLD y GSM8K con `tqkld` y `llama-perplexity` sobre el mismo modelo base.
- Generacion de codigo y matematicas en local: el rendimiento en GSM8K (243/250 con TQT) lo hace adecuado para asistentes de resolucion de problemas en entornos sin conexion.
- Servicio conversacional de baja latencia: con el drafter DFlash2 se obtienen 50,6 tok/s en decodificacion y unos 1.658 tok/s de prefill con prompts de 2K, suficiente para chat interactivo.
- Procesamiento de prompts largos: el benchmark cubre contextos de 2K, 8K y 32K tokens con velocidad de decodificacion estable (46,2 tok/s a 32K con TQT), util para resumen de documentos extensos.
- Pipeline de experimentacion con tqLLM: equipos que ya usan el motor turbo-tan pueden sustituir TQ_L por TQT para obtener menor divergencia sin cambiar el flujo de trabajo ni el tamano en disco.
- Analisis de calidad de cuantizacion en produccion: medir la coincidencia del token top (95,60 % en TQT) para decidir si la perdida es aceptable en tareas sensibles.

## Benchmarks y rendimiento

| Metrica | TQT | TQV-12 | TQ_L (referencia) | BF16 |
|---|---|---|---|---|
| KLD vs BF16 | 0,013443 ± 0,00058 | 0,018432 ± 0,0011 | 0,024462 ± 0,0012 | 0 |
| Mismo token top | 95,60 % | 94,93 % | 94,17 % | 100 % |
| Perplejidad | 4,917 | 4,956 | 4,959 | 4,880 |
| GSM8K (250) | 243 | 242 | 245 | no disponible |
| Decodificacion 2K (tok/s) | 50,6 | no disponible | 51,6 | no disponible |
| Decodificacion 8K (tok/s) | 49,6 | no disponible | 50,5 | no disponible |
| Decodificacion 32K (tok/s) | 46,2 | no disponible | 47,0 | no disponible |
| Prefill 2K / 8K / 32K (tok/s) | 1658 / 1853 / 1696 | no disponible | aproximadamente igual | no disponible |

Mediciones realizadas en una RTX 3090 con CUDA 13.0, una sola sesion. KLD calculada con `llama-perplexity --kl-divergence-base` sobre WikiText-2 test (8 chunks de 2048 tokens, llama.cpp b12198) y `tqkld --chunks 8 --llama-prefill`. GSM8K con las primeras 250 preguntas del test, razonamiento bajo, greedy y drafter DFlash2. Velocidad con `bench/relbench.py`, greedy, 400 tokens y `--kv tq3`.

## Requisitos de hardware

- VRAM estimada: 14,72 GB solo para pesos; anadir la KV cache (cuantizada tq3 en los benchmarks) y el drafter DFlash2 TQ3 si se usa decodificacion especulativa.
- GPU recomendadas: RTX 3090 (usada en las mediciones), RTX 4090, A100 y H100. Cualquier GPU CUDA con al menos 16-24 GB de VRAM es candidata.
- Cabe en GPU consumer: si, en RTX 3090 y RTX 4090 (24 GB); en GPUs de 16 GB el margen es muy ajustado y depende de la longitud de contexto y del drafter.
- Despliegue: exclusivamente `tqserve` de tqLLM (CUDA) con la release que incluye los PR #56 y #59. No funciona en vLLM, llama.cpp, Ollama, TGI ni LM Studio.
- Latencia y throughput: 50,6 tok/s de decodificacion a 2K y 46,2 tok/s a 32K con TQT sin drafter; prefill de 1.658 a 1.853 tok/s segun longitud de prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | KLD vs BF16 | GSM8K 250 | Licencia | Motor |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-TQT (este repo) | 27,3 B | 14,72 GB | 0,0134 | 243 | Apache-2.0 | tqLLM |
| Qwen3.8-27B-TQV12 (este repo) | 27,3 B | 14,72 GB | 0,0184 | 242 | Apache-2.0 | tqLLM |
| Qwen3.8-27B-TQ_L (YTan2000) | 27,3 B | 14,72 GB | 0,0245 | 245 | Apache-2.0 | tqLLM |
| Qwen3.8-27B BF16 | 27,3 B | no disponible | 0 | no disponible | Apache-2.0 | llama.cpp / otros |

No se dispone de datos de otras alternativas de cuantizacion (por ejemplo, GGUF Q4_K_M estandar) en la informacion proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: los tipos de tensor 305 y 306 solo existen en tqLLM; los ficheros no cargan en llama.cpp, Ollama ni LM Studio.
- Requiere GPU CUDA y una version concreta de tqLLM (PR #56 y PR #59); no hay soporte CPU documentado.
- La cuantizacion no es exacta: el texto generado difiere ligeramente del TQ_L y del BF16, con un 4,40 % de tokens top distintos en TQT.
- El rendimiento en GSM8K es inferior al de TQ_L (243 frente a 245), pese a la menor KLD; la metrica de divergencia no garantiza mejor resultado en todas las tareas.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinacion especificos; hereda los del modelo base Qwen3.8-27B, no descritos en la informacion disponible.
- El repositorio tiene 0 descargas y 1 like, y fue creado el 20 de noviembre de 2026: no hay validacion comunitaria ni historial de uso en produccion.
- La reproducibilidad byte a byte no esta garantizada: el GPTQ en GPU no es determinista, aunque una reconstruccion desde las guias alcanza la misma KLD.
- La licencia Apache-2.0 se hereda del modelo base; conviene verificar los terminos del modelo Qwen original antes de un uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rocicleito/Qwen3.8-27B-TQ-formats
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizacion de referencia TQ_L: https://huggingface.co/YTan2000/Qwen3.8-27B-TQ
- Motor tqLLM: https://github.com/turbo-tan/tqllm
- PR #56 (TQV-12): https://github.com/turbo-tan/tqllm/pull/56
- PR #59 (TQT): https://github.com/turbo-tan/tqllm/pull/59
- Guia TQV-12: https://github.com/turbo-tan/tqllm/blob/main/docs/guides/tqv12.md
- Guia TQT: https://github.com/turbo-tan/tqllm/blob/main/docs/guides/tqt.md
- Paper QTIP: https://arxiv.org/abs/2406.11235
