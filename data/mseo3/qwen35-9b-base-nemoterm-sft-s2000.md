# mseo3/qwen35-9b-base-nemoterm-sft-s2000

## Resumen

qwen35-9b-base-nemoterm-sft-s2000 es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-9B-Base, publicado por el usuario mseo3 en Hugging Face. El checkpoint corresponde al paso 2000 de un entrenamiento completo planificado a 10 epocas (28.580 pasos) sobre el corpus nvidia/Nemotron-Terminal-Corpus, un conjunto de datos orientado a tareas de terminal y linea de comandos. Con 9.409.813.744 parametros, se posiciona en la gama de 9B, un tamano manejable para despliegue en una sola GPU de gama alta.

La relevancia de este modelo radica en su especializacion: no es un modelo generalista, sino un ajuste orientado a la resolucion de tareas de terminal, con turnos multi-turno y el modo de razonamiento (thinking) preservado en cada respuesta del asistente. El entrenamiento se realizo con el framework verl (sft_trainer_ray) sobre 4 GPU H200 con FSDP, usando FlashAttention-3 en las capas de atencion completa y Liger para RMSNorm y SwiGLU. La arquitectura subyacente es la de Qwen3.5, que combina capas de atencion completa con capas Gated DeltaNet (un mecanismo de atencion lineal), segun se deduce de los tensores linear_attn presentes en los pesos.

Al ser un checkpoint intermedio (paso 2000 de 28.580), no debe considerarse un modelo final ni pulido. Su interes es principalmente para investigadores que quieran estudiar la evolucion del entrenamiento, reanudar el SFT desde este punto o evaluar el comportamiento temprano de la especializacion en tareas de terminal. La licencia Apache 2.0 facilita su uso y modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 24 capas Gated DeltaNet (atencion lineal) + capas de atencion completa (FlashAttention-3 en entrenamiento); sin cabecera MTP (mtp_num_hidden_layers = 0) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16, con 48 tensores en F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, con tensores linear_attn.A_log y linear_attn.norm.weight en F32) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B-Base, un transformer hibrido que intercala 24 capas Gated DeltaNet (mecanismo de atencion lineal con estado recurrente) con capas de atencion completa. Durante el entrenamiento se empleo FlashAttention-3 para las capas de atencion completa y kernels fusionados de Liger para RMSNorm y SwiGLU, ademas de linear-CE fusionado en Triton proporcionado por verl. Los pesos se fusionaron desde los shards FSDP en fp32 a bf16, manteniendo en F32 los 48 tensores que el modelo base tambien almacena en ese formato (A_log y norm.weight de las capas linear_attn). La cabecera MTP (multi-token prediction) no se incluye.

El entrenamiento consistio en un SFT completo sobre el dataset mseo3/nemotron-terminal-sft-qwen35-le64k, derivado de nvidia/Nemotron-Terminal-Corpus (CC-BY-4.0). El dataset contiene 365.856 filas multi-turno, 6.45B tokens, con secuencias de hasta 65.536 tokens y el modo thinking conservado en cada turno del asistente (tokenizer sfttok-preserve). La receta: verl sft_trainer_ray, 10 epocas planificadas (28.580 pasos), batch 128, learning rate 2e-5 con decaimiento coseno (ratio minimo 0.1), warmup de 100 pasos, weight decay 0.01, gradient clipping 1.0, batch dinamico de 65.536 tokens por GPU, 4x H200 con FSDP (DP4) y gradient checkpointing. Este checkpoint corresponde al paso 2000, es decir, aproximadamente al 7% del entrenamiento planificado.

## Capacidades

- Generacion de texto y razonamiento con modo thinking preservado en cada turno del asistente, segun la configuracion del dataset de entrenamiento.
- Especializacion en tareas de terminal y linea de comandos: interpretacion de comandos, secuencias de shell y flujos multi-turno orientados a la resolucion de tareas en entornos de terminal.
- Conversacion multi-turno con contexto largo de hasta 65.536 tokens, adecuada para sesiones prolongadas con historial extenso.
- Capacidades heredadas del modelo base Qwen3.5-9B-Base (generacion general, codigo, matematicas), aunque el ajuste esta orientado al dominio de terminal.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: el formato multi-turno del dataset sugiere capacidad para tareas secuenciales, pero no se documenta explicitamente.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Asistente de terminal para desarrolladores: el modelo puede interpretar peticiones en lenguaje natural y proponer secuencias de comandos shell, aprovechando su entrenamiento sobre Nemotron-Terminal-Corpus para tareas de navegacion de ficheros, gestion de procesos y automatizacion basica.
- Generacion de scripts de automatizacion: dado un objetivo operativo, el modelo puede producir scripts de shell multi-paso con contexto de hasta 65.536 tokens, util para pipelines de CI/CD y tareas de administracion de sistemas.
- Depuracion de errores en entornos de linea de comandos: con el historial completo de una sesion multi-turno, el modelo puede analizar la salida de comandos fallidos y proponer correcciones, gracias al formato de conversacion multi-turno del entrenamiento.
- Investigacion sobre SFT y especializacion: al ser un checkpoint intermedio (paso 2000), permite estudiar la evolucion del ajuste fino sobre tareas de terminal y comparar con checkpoints posteriores o con el modelo base.
- Reanudacion de entrenamiento: investigadores pueden cargar este checkpoint para continuar el SFT planificado (hasta 28.580 pasos) con la misma receta, ahorrando el coste computacional de los primeros 2000 pasos.
- Evaluacion de modelos hibridos con atencion lineal: las 24 capas Gated DeltaNet permiten estudiar el comportamiento de mecanismos de atencion lineal en tareas de terminal con contextos largos, comparandolo con arquitecturas de atencion completa.
- Base para ajustes posteriores (RLHF/DPO): al estar bajo licencia Apache 2.0 y en formato safetensors, puede servir como punto de partida para tecnicas de alineacion adicionales orientadas a agentes de terminal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,8 GB solo para los pesos (9.409.813.744 parametros x 2 bytes), mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para contexto corto y 40-80 GB para contextos largos (hasta 65.536 tokens).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 9-10 GB para pesos; en 4 bits, alrededor de 5-6 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: H100, H200 o A100 (80 GB) para contextos largos y despliegue en produccion; RTX 4090 (24 GB) puede alojar el modelo en bf16 con contexto limitado o en cuantizacion de 8/4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con contexto reducido o cuantizacion; en RTX 3090 (24 GB) de forma similar; en GPU con 16 GB solo mediante cuantizacion agresiva.
- Opciones de despliegue: vLLM, TGI y llama.cpp/Ollama (previa conversion a GGUF) son opciones viables; el entrenamiento uso FlashAttention-3, pero la configuracion publicada no fija attn_implementation, por lo que el backend de inferencia debe seleccionar el kernel adecuado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen35-9b-base-nemoterm-sft-s2000 | 9,41B | 65.536 | Apache 2.0 | Hugging Face | Checkpoint intermedio (paso 2000) especializado en terminal |
| Qwen/Qwen3.5-9B-Base | no disponible | no disponible | no disponible | Hugging Face | Modelo base generalista sin ajuste de terminal |
| Alternativas de 9B especializadas en terminal | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 2000 de 28.580 planificados (aproximadamente el 7% del entrenamiento), por lo que su calidad y convergencia no representan el resultado final de la receta.
- Especializacion estrecha: el ajuste se realizo exclusivamente sobre Nemotron-Terminal-Corpus, lo que puede degradar capacidades generales del modelo base fuera del dominio de terminal.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar comandos o secuencias de terminal plausibles pero incorrectas o peligrosas; se requiere supervision humana antes de ejecutar cualquier salida en produccion.
- Sesgos conocidos: no disponible; no se documentan evaluaciones de sesgo ni de seguridad.
- Idiomas soportados: no disponible; el dataset de entrenamiento es presumiblemente en ingles, lo que puede limitar el rendimiento en castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset de entrenamiento (Nemotron-Terminal-Corpus) esta bajo CC-BY-4.0, lo que puede requerir atribucion; conviene revisar los terminos de ambas licencias antes de un despliegue comercial.
- Sin cabecera MTP: el modelo no incluye la cabecera de multi-token prediction, lo que impide usar decodificacion especulativa basada en MTP tal como se entreno el base.
- Ausencia de cuantizaciones oficiales: no se han publicado versiones GGUF, AWQ ni GPTQ; la conversion a estos formatos corre a cargo del usuario.
- Configuracion de atencion no fijada: el config no especifica attn_implementation, lo que puede provocar un rendimiento suboptimo si el backend de inferencia no selecciona el kernel adecuado para las capas hibridas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mseo3/qwen35-9b-base-nemoterm-sft-s2000
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Overlay de tokenizer/plantilla: https://huggingface.co/mseo3/qwen35-9b-base-opd-overlay
- Dataset de SFT: https://huggingface.co/datasets/mseo3/nemotron-terminal-sft-qwen35-le64k
- Corpus original: https://huggingface.co/datasets/nvidia/Nemotron-Terminal-Corpus
- Repositorio de verl (framework de entrenamiento): https://github.com/volcengine/verl
