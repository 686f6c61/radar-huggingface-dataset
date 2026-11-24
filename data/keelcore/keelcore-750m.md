# KeelCore/KeelCore-750M

## Resumen

KeelCore-750M (publicado originalmente como Thelivu-750M) es un modelo base encoder-decoder de tipo Transformer, desarrollado por Saravanan A R bajo el paraguas del proyecto Thelivu. Con 751.889.408 parámetros, se presenta como un modelo compacto disenado especificamente para servir de sustrato a adaptadores LoRA: en lugar de entrenar un modelo nuevo para cada tarea, se congela el modelo base y se anade un adaptador de bajo rango (rank 16 sobre cada capa lineal, 18.287.616 parámetros, un 2,4% del total). El modelo se entreno desde cero sobre prosa en ingles, codigo fuente y texto de linea de comandos.

La arquitectura es un Transformer secuencia a secuencia con 24 capas de encoder y 24 de decoder, anchura d_model de 1.024, 16 cabezas de atencion de 64 dimensiones y feed-forward de 2.816 con GELU con compuerta. Usa RMSNorm pre-norm y sesgo de posicion relativa con 32 buckets y distancia maxima de 128. El contexto es de 2.048 tokens tanto en entrada como en salida, con un vocabulario SentencePiece de 33.728 piezas y fallback de bytes.

El modelo se entreno con una mezcla UL2 de denoisers, lo que le permite rellenar huecos, reconstruir spans y continuar texto. No esta ajustado a instrucciones ni es un modelo de chat: su comportamiento de tarea se anade mediante adaptadores. Se distribuye con un checkpoint final en fp32 (entrenado en bf16 con precision mixta), una exportacion ONNX int8 para inferencia en dispositivo y en navegador, y el tokenizer. Es relevante por su enfoque de "modelo base + adaptadores" orientado a despliegue local y en navegador, y por su licencia propia (Thelivu License 1.0) que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (secuencia a secuencia), modelo base |
| Parametros totales | 751.889.408 (embeddings de entrada y salida atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens de entrada y 2.048 tokens de salida |
| Tipos de cuantizacion | fp32 (checkpoint), bf16 (entrenamiento), int8 (exportacion ONNX) |
| Idiomas soportados | Ingles, codigo fuente y texto de linea de comandos |
| Licencia | Thelivu License, Version 1.0 (license_name: thelivu-license-1.0) |
| Formato de pesos | safetensors, ONNX (int8) |

Otras especificaciones: 24 capas de encoder + 24 de decoder; d_model 1.024; 16 cabezas x 64; feed-forward 2.816 con GELU con compuerta; RMSNorm pre-norm; sesgo de posicion relativa con 32 buckets y distancia maxima 128; vocabulario de 33.728 piezas SentencePiece con fallback de bytes; checkpoint del paso 90.000 de 90.000; publicacion en octubre de 2026; tamano del repositorio 3,9 GB.

## Arquitectura y entrenamiento

El modelo es un Transformer encoder-decoder clasico. El encoder es bidireccional y lee la entrada completa antes de que empiece la generacion; el decoder atiende al encoder mediante cross-attention en cada paso, lo que permite copiar literalmente un span del texto de entrada y preservar URLs, codigo, numeros y nombres tal como estan escritos. Esta propiedad es especialmente util en tareas de transformacion de texto (reescritura, relleno, continuacion) frente a modelos decoder-only.

El preentrenamiento se hizo desde cero con una mezcla UL2 de denoisers, lo que dota al modelo de capacidades de infilling, reconstruccion y continuacion. La entrada se prefija con un token de modo: `[S]` para continuar, `[R]` para rellenar spans cortos y `[X]` para reconstruir spans largos; en los modos `[R]` y `[X]` los spans rellenados se marcan con centinelas `<extra_id_N>`. El entrenamiento uso precision mixta bf16, con checkpoint final en fp32. No se documenta en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de "prosa en ingles, codigo fuente y texto de linea de comandos". No se menciona RLHF ni DPO; es un modelo base sin ajuste a instrucciones. La innovacion destacable es el diseno orientado a adaptadores LoRA: un adaptador rank 16 sobre cada capa lineal entrena 18.287.616 parametros (2,4% del modelo) manteniendo congelados los pesos base.

## Capacidades

- Generacion de texto y continuacion: modo `[S]`, que continua un texto dado (por ejemplo, completar una frase o un parrafo).
- Relleno de spans cortos: modo `[R]`, con centinelas `<extra_id_N>`.
- Reconstruccion de spans largos: modo `[X]`, orientado a denoising y reconstruccion de fragmentos extensos.
- Transformacion de texto con copia literal: al ser encoder-decoder con cross-attention, preserva URLs, codigo, numeros y nombres exactamente como aparecen en la entrada.
- Procesamiento de codigo fuente y texto de linea de comandos, dado el corpus de entrenamiento.
- Capacidad de servir como base para adaptadores LoRA por tarea (el adaptador se entrena sobre el modelo congelado).
- Inferencia en dispositivo y en navegador gracias a la exportacion ONNX int8.
- No soporta tool calling ni function calling de forma nativa (no documentado; es un modelo base sin ajuste a instrucciones).
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- Capacidades multilingues: limitadas al ingles (mas codigo y linea de comandos); no se documentan otros idiomas.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Relleno de texto (infilling) en editores: el modo `[R]` permite completar huecos cortos en un documento preservando el formato y los terminos exactos del contexto, gracias a la atencion bidireccional del encoder y a la copia literal de spans.
- Continuacion de prosa en herramientas de escritura: el modo `[S]` genera continuaciones coherentes de un texto dado, util para borradores o autocompletado de parrafos en aplicaciones de escritura.
- Reescritura de texto en navegador: el primer producto construido sobre el modelo, la extension EchoMeBetter, ejecuta adaptadores de reescritura de texto en el dispositivo del usuario; el modelo base con ONNX int8 permite inferencia local sin enviar datos a un servidor.
- Procesamiento de codigo y linea de comandos: dado que el corpus incluye codigo fuente y texto de shell, el modelo puede usarse como base para adaptadores de autocompletado de comandos o de normalizacion de fragmentos de codigo.
- Investigacion sobre modelos pequenos con adaptadores: el modelo sirve como plataforma para estudiar el entrenamiento de adaptadores LoRA de rank 16 (2,4% de parametros) sobre un base congelado, con un coste computacional bajo.
- Denoising y reconstruccion de documentos: el modo `[X]` permite reconstruir fragmentos largos corruptos o incompletos, util en pipelines de limpieza de datos o recuperacion de texto.
- Despliegue en dispositivos con recursos limitados: la exportacion ONNX int8 y el tamano de 752M parametros permiten ejecutar el modelo en entornos de borde o en el navegador, sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3 GB solo para pesos (751,9M parametros x 4 bytes), mas memoria para activaciones y KV cache; en la practica, alrededor de 4-6 GB para contexto completo de 2.048 tokens.
- VRAM estimada en bf16: aproximadamente 1,5 GB para pesos, mas activaciones; en torno a 2,5-3,5 GB con contexto completo.
- VRAM estimada en int8 (ONNX): aproximadamente 0,75-1 GB para pesos; adecuado para entornos de borde.
- GPU recomendadas: para fp32, una GPU con 8 GB o mas (RTX 3060/4060, RTX 4090, A100, H100); para bf16, una GPU con 4-6 GB (RTX 3050, RTX 4060); para int8, CPU o GPU integrada.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna con 4 GB o mas en bf16, y en CPU para la version int8.
- Opciones de despliegue: transformers (AutoModelForSeq2SeqLM), ONNX Runtime (exportacion int8 incluida), text-generation-inference (segun tags del repositorio), y potencialmente llama.cpp/Ollama si se convierte a GGUF (no documentado en la informacion disponible).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KeelCore-750M (Thelivu-750M) | 751,9M | 2.048 in / 2.048 out | Encoder-decoder Transformer, base | Thelivu License 1.0 | Hugging Face, ONNX int8 |
| T5-base | 220M | 512 | Encoder-decoder Transformer | Apache 2.0 | Hugging Face |
| T5-large | 770M | 512 | Encoder-decoder Transformer | Apache 2.0 | Hugging Face |
| FLAN-T5-base | 220M | 512 | Encoder-decoder Transformer, ajustado a instrucciones | Apache 2.0 | Hugging Face |

La comparacion con T5-large es la mas directa por tamano (770M frente a 752M), aunque KeelCore-750M ofrece un contexto de 2.048 tokens frente a los 512 de T5 y una licencia propia mas restrictiva que la Apache 2.0 de T5. FLAN-T5-base esta ajustado a instrucciones, mientras que KeelCore-750M es un modelo base sin ajuste. No se dispone de datos de benchmarks para comparar rendimiento de forma objetiva.

## Limitaciones y advertencias

- Es un modelo base sin ajuste a instrucciones: no debe usarse como asistente ni para seguir instrucciones sin un adaptador entrenado.
- Riesgo de bucles de repeticion: bajo decodificacion greedy simple, el modelo puede entrar en bucles; se recomienda fijar `no_repeat_ngram_size`.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre prosa en ingles, codigo y linea de comandos, puede reflejar sesgos de esos corpus.
- Riesgo de alucinacion: presente, como en cualquier modelo generativo; la capacidad de copia literal reduce el riesgo en tareas de transformacion, pero no lo elimina en generacion libre.
- Limitaciones de idioma: solo ingles (mas codigo y linea de comandos); no se documentan capacidades en otros idiomas.
- Limitacion de contexto: 2.048 tokens de entrada y 2.048 de salida; insuficiente para documentos largos sin fragmentacion.
- Restricciones de licencia: la Thelivu License 1.0 es una licencia propia; es imprescindible revisar sus terminos antes de cualquier uso comercial, ya que no es una licencia de codigo abierto estandar.
- Uso no previsto: decisiones criticas de seguridad, medicas, legales o financieras.
- El modelo se publico bajo el identificador Thelivu-750M y el repositorio de Hugging Face figura como KeelCore/KeelCore-750M; conviene verificar la correspondencia entre ambos antes de integrarlo en produccion.
- El tokenizer convertido (`tokenizer.json`) coincide con `spm.model` salvo en algunos casos no especificados en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/KeelCore/KeelCore-750M
- Repositorio original en Hugging Face: https://huggingface.co/Thelivu/Thelivu-750M
- Informe tecnico: https://saravanan-a-r.github.io/Thelivu/
- Codigo fuente (GitHub): https://github.com/saravanan-a-r/Thelivu
- Licencia: https://huggingface.co/Thelivu/Thelivu-750M/blob/main/LICENSE
- Perfil del autor: https://www.linkedin.com/in/saravanan-a-r/
