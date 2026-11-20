# Mr-DS-ML-85/RadixArk_DaisyRose-27B-UD-IQ2_XS-GGUF

## Resumen

DaisyRose-27B es un modelo multimodal de tipo imagen-texto-a-texto desarrollado por RadixArk, obtenido mediante un post-entrenamiento con aprendizaje por refuerzo (RL) sobre Qwen3.8-27B. Segun la model card del autor de la cuantizacion, el entrenamiento se realizo sobre aproximadamente 1.200 tareas de agente de horizonte largo curadas, durante 18 dias en 144 GPU H200. Mantiene la arquitectura, el tokenizador y la plantilla de chat de Qwen3.8-27B de forma identica byte a byte, lo que permite reutilizar mapas de cuantizacion disenados para el modelo base.

La ficha que nos ocupa no es el modelo original, sino una recuantizacion comunitaria en formato GGUF: `RadixArk_DaisyRose-27B-UD-IQ2_XS`, publicada por el usuario Mr-DS-ML-85. Se trata de una cuantizacion de 2 bits (2,31 bits por peso) que reduce el modelo a 7,69 GB, con el objetivo declarado de ejecutar un modelo de 27B en una GPU de 8 GB o en CPU. La receta de seleccion de tipos por tensor se toma del esquema Unsloth Dynamic V3.1, aunque el autor aclara explicitamente que no es un lanzamiento oficial de Unsloth: los pesos, la imatrix y el empaquetado son trabajo comunitario.

Su relevancia actual reside en la posibilidad de desplegar un modelo de 27B con capacidades multimodales, razonamiento y uso como agente en hardware muy limitado. No obstante, la calidad de una cuantizacion de 2 bits es inherentemente degradada, y el propio autor documenta limitaciones de compatibilidad con motores de inferencia alternativos a llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas SSM/DeltaNet y atencion (heredada de Qwen3.8-27B); incluye cabeza NextN/MTP opcional |
| Parametros totales | 27B (heredados del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso emplea `-c 8192`) |
| Tipos de cuantizacion | IQ2_XS como tipo global; mezcla por tensor: F32, IQ2_XXS, IQ1_S, Q8_0, IQ3_XXS, IQ2_XS, IQ2_S, IQ3_S, Q4_K, Q3_K, Q2_K, IQ4_XS (12 tipos) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); ficheros: `RadixArk_DaisyRose-27B-UD-IQ2_XS.gguf` (7,69 GB), variante `-MTP.gguf` (7,93 GB), `mmproj-DaisyRose-27B-f16.gguf` (0,93 GB para vision) |

## Arquitectura y entrenamiento

El modelo base DaisyRose-27B conserva la arquitectura de Qwen3.8-27B, que segun los nombres de tensor documentados combina capas de atencion con componentes de tipo SSM/DeltaNet (`ssm_a`, `ssm_conv1d`, `ssm_dt`, `ssm_beta_alpha`, `ssm_out`), es decir, una arquitectura hibrida. El post-entrenamiento descrito es exclusivamente RL sobre tareas de agente de horizonte largo, sin que la informacion disponible detalle la composicion del dataset ni si hubo fases adicionales de DPO o RLHF. El modelo incluye una cabeza NextN/MTP (multi-token prediction) que puede emplearse para decodificacion especulativa.

La cuantizacion se construyo con `llama-quantize` en modo `--allow-requantize` partiendo del Q8_0 (8,37 bpw) de bartowski, aplicando una imatrix especifica del modelo (583 fragmentos de `calibration-v6.txt`) y una tabla de tipos por tensor de 755 entradas derivada del esquema Unsloth Dynamic V3.1. El resultado son 2,31 bpw: las capas iniciales quedan en IQ1_S, las capas finales suben a IQ3_S/Q3_K/IQ4_XS y la cabeza de salida mantiene Q3_K. La variante MTP anade 15 tensores (8 en Q4_0, 7 normas F32) por 0,24 GB adicionales.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat de Qwen3.8.
- Razonamiento con modo de pensamiento activado por defecto (`reasoning_effort = xhigh` en la plantilla).
- Capacidades de agente y razonamiento multi-paso, derivadas del entrenamiento RL sobre tareas de horizonte largo.
- Entrada de imagenes (vision-language, imagen-texto-a-texto) mediante el fichero `mmproj` en F16.
- Generacion de codigo (heredada del modelo base; no se aportan benchmarks que la cuantifiquen).
- Decodificacion especulativa mediante la cabeza MTP en la variante `-MTP`.
- Soporte multilingue limitado a ingles y chino.
- Compatibilidad con tool calling a traves de la plantilla Jinja (`--jinja`); no se detalla el formato exacto en la informacion disponible.

## Casos de uso

- Inferencia en GPU de consumo de 8 GB: el fichero de 7,69 GB permite cargar un modelo de 27B con `-ngl 14 -c 1024` en una RTX 4060, a costa de derivar parte de las capas a CPU. Adecuado para prototipado local y pruebas de concepto.
- Despliegue en CPU o equipos de borde: al ser GGUF compatible con llama.cpp, Ollama, LM Studio y KoboldCpp, puede ejecutarse en servidores sin GPU para tareas de generacion por lotes no interactivas.
- Procesamiento de documentos con imagenes: combinando el modelo con `mmproj-DaisyRose-27B-f16.gguf` puede extraer texto y describir capturas, diagramas o formularios en entornos con recursos muy limitados.
- Agentes automatizados de bajo coste: sus capacidades de razonamiento multi-paso permiten construir flujos de agente en ingles o chino para tareas acotadas, aceptando la perdida de precision propia de 2 bits.
- Asistente conversacional local con contexto moderado: con `-c 8192` y atencion flash (`-fa`), sirve para chat multi-turno en estaciones de trabajo sin GPU dedicada de gran capacidad.
- Evaluacion y experimentacion con cuantizaciones extremas: util como referencia para medir la degradacion de calidad de IQ2_XS frente al modelo en BF16 o Q8_0 en tareas concretas.
- Decodificacion especulativa en hardware limitado: la variante MTP permite probar `--spec-type draft-mtp` en llama.cpp, aunque el autor no midio la tasa de aceptacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento aportados son de velocidad de inferencia en una RTX 4060 de 8 GB con `-ngl 14 -c 1024`: 5,7 tok/s con el fichero ligero y 5,2 tok/s con la variante MTP en decodificacion simple. El autor indica que `-ngl 99` provoca OOM porque los 7,69 GB de pesos no dejan espacio para la cache KV en una tarjeta de 8 GB.

## Requisitos de hardware

- VRAM estimada: 7,69 GB solo para pesos en el fichero ligero; 7,93 GB en la variante MTP; anadir 0,93 GB si se usa el `mmproj` para vision y el espacio de la cache KV segun contexto.
- GPU recomendadas: RTX 4060 8 GB (verificado por el autor con offload parcial), GPUs de 12 GB o mas para offload completo con contexto reducido; A100/H100 no son necesarias y el modelo esta pensado para hardware modesto.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB con offload parcial a CPU; en 12-16 GB con mayor numero de capas en GPU.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama, LM Studio y KoboldCpp. SGLang y vLLM no son compatibles con GGUF. El motor `inx` (Infernix) falla al cargar por el layout de tensores fusionado (`blk.16.attn_qkv.weight` no encontrado).
- Latencia y throughput: 5,7 tok/s (ligero) y 5,2 tok/s (MTP) en RTX 4060 8 GB con `-ngl 14 -c 1024`; sin datos para otros hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RadixArk_DaisyRose-27B-UD-IQ2_XS (esta ficha) | 27B | no disponible | IQ2_XS, 2,31 bpw, 7,69 GB | apache-2.0 | GGUF en Hugging Face |
| Qwen3.8-27B-UD-IQ2_XS (Unsloth) | 27B | no disponible | IQ2_XS, 7,63 GB | no disponible en la informacion | GGUF oficial de Unsloth |
| RadixArk/DaisyRose-27B (base) | 27B | no disponible | BF16 y otras | apache-2.0 | Hugging Face |
| bartowski/RadixArk_DaisyRose-27B-GGUF | 27B | no disponible | Q8_0 (8,37 bpw) y otras | apache-2.0 | GGUF en Hugging Face |

La diferencia de tamano frente a la cuantizacion equivalente de Unsloth es de un +0,83 %, atribuible a la receta por tensor y al empaquetado comunitario.

## Limitaciones y advertencias

- Cuantizacion de 2 bits: la degradacion de calidad frente al modelo en BF16 o Q8_0 es esperable y no esta cuantificada con benchmarks en la informacion disponible.
- No es un lanzamiento oficial de Unsloth: la receta de seleccion por tensor se reutiliza, pero los pesos, la imatrix y el empaquetado son trabajo comunitario sin validacion externa.
- Compatibilidad limitada: solo carga en llama.cpp y derivados (Ollama, LM Studio, KoboldCpp); falla en el motor `inx` por el layout fusionado de tensores y no es compatible con SGLang ni vLLM.
- Idiomas: solo ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion: inherente a los modelos de lenguaje y agravado por la cuantizacion agresiva; no se aportan evaluaciones de fidelidad.
- Contexto: la longitud de contexto nativa no se especifica; el ejemplo de uso limita a 8192 tokens y en 8 GB de VRAM el contexto practico es muy reducido (1024 tokens en la prueba del autor).
- Modo de pensamiento activado por defecto con `reasoning_effort = xhigh`, lo que incrementa el consumo de tokens y la latencia si no se ajusta la plantilla.
- La cabeza MTP no tiene medida la tasa de aceptacion, por lo que el beneficio de la decodificacion especulativa no esta verificado.
- Licencia apache-2.0 declarada, pero conviene verificar las condiciones del modelo base y de las herramientas de cuantizacion empleadas antes de un uso comercial en produccion.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/Mr-DS-ML-85/RadixArk_DaisyRose-27B-UD-IQ2_XS-GGUF
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- GGUF de referencia de bartowski: https://huggingface.co/bartowski/RadixArk_DaisyRose-27B-GGUF
- Motor Infernix citado por el autor: https://huggingface.co/Mr-DS-ML-85/Infernix
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado en la informacion proporcionada papers, blogs ni demos adicionales.
