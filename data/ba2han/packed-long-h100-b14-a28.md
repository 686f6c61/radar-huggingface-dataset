# Ba2han/packed-long-h100-b14-a28

## Resumen

`packed-long-h100-b14-a28` es un conjunto de checkpoints de entrenamiento de un modelo de lenguaje hibrido de aproximadamente 700M de parametros denominado `exp_train`, desarrollado por el usuario Ba2han. El modelo combina capas de Gated DeltaNet (una familia de arquitecturas de espacio de estados con decaimiento) con atencion con compuerta (gated attention), e incorpora una memoria de n-gramas hasheada de 600M de entradas. Se ha entrenado sobre el dataset `Ba2han/packed1`, cuya composicion no se detalla en la informacion disponible.

El repositorio no contiene un modelo listo para inferencia en el sentido habitual, sino checkpoints intermedios de un proceso de entrenamiento. Cada carpeta `step_XXXXXXXX/` corresponde a un checkpoint completo que incluye pesos densos en FP32, la tabla de n-gramas en BF16, el estado del optimizador y el estado de RNG para poder reanudar el entrenamiento. Solo se conservan los dos checkpoints mas recientes.

La relevancia de este repositorio es fundamentalmente de investigacion: documenta una arquitectura hibrida poco comun (SSM con compuerta + atencion + memoria n-gram) a escala de 700M de parametros, con el objetivo declarado de explorar contextos largos (el nombre del run incluye "long" y "h100"). No obstante, la informacion publica es muy escasa: no hay model card extendida, ni resultados de evaluacion, ni licencia declarada, ni idiomas especificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Gated DeltaNet + gated attention + memoria de n-gramas hasheada |
| Parametros totales | ~700M (modelo base); memoria n-gram de 600M entradas adicionales |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (el nombre del run sugiere entrenamiento en contexto largo) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; n-gram en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors, ngram.safetensors, optim_rank0.safetensors, state_rank0.safetensors) |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un transformer hibrido que intercala capas de Gated DeltaNet con capas de atencion con compuerta. Gated DeltaNet es una variante de los modelos de espacio de estados con mecanismo de decaimiento selectivo, disenada para procesar secuencias largas con coste lineal en lugar del coste cuadratico de la atencion completa. La combinacion con gated attention sugiere un diseno que busca conservar la capacidad de recuperacion exacta de la atencion en ciertas capas mientras se reduce el coste computacional en el resto. Adicionalmente, el modelo incorpora una memoria de n-gramas hasheada de 600M entradas, almacenada en BF16, que actua como un mecanismo de recuperacion lexica o de patrones frecuentes complementario a los pesos densos.

El entrenamiento se ha realizado sobre el dataset `Ba2han/packed1` y se monitoriza en el proyecto de Weights & Biases `exp_train`, con el run `packed-long-h100-b14-a28`. El sufijo "h100" indica que el entrenamiento se ejecuto en GPUs NVIDIA H100, y "b14" probablemente hace referencia al tamano de batch global o a la configuracion de acumulacion. No se especifica el numero total de tokens vistos, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste fino supervisado. El repositorio incluye scripts de verificacion (`code/verify_checkpoint.py`) y checksums FP64 en `meta.json` para garantizar la integridad de cada checkpoint.

## Capacidades

- Generacion de texto autoregresiva: el modelo es un LM causal entrenado para prediccion del siguiente token.
- Procesamiento de contexto largo: la combinacion de Gated DeltaNet y memoria n-gram esta disenada para secuencias extensas, aunque no se publica la longitud exacta soportada.
- Recuperacion lexica mediante memoria n-gram: la tabla hasheada de 600M entradas puede mejorar la coherencia en patrones frecuentes.
- Reanudacion de entrenamiento: los checkpoints incluyen estado del optimizador, RNG y contadores de dropout.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion en arquitecturas hibridas SSM-atencion: el repositorio permite reproducir y analizar el comportamiento de Gated DeltaNet combinado con gated attention a escala 700M, util para grupos que estudian alternativas a transformers densos.
- Estudio de memorias n-gram en modelos de lenguaje: la tabla hasheada de 600M entradas y su estado RMSprop permiten investigar como contribuye la recuperacion lexica al rendimiento del modelo frente a los pesos densos.
- Reanudacion de experimentos de entrenamiento: los checkpoints incluyen optimizador, RNG y contadores, lo que permite continuar el entrenamiento desde el punto exacto sin perder reproducibilidad.
- Benchmarking de eficiencia en contexto largo: comparar el coste computacional de Gated DeltaNet frente a atencion completa en secuencias largas usando los pesos publicados.
- Desarrollo de tecnicas de verificacion de checkpoints: el script `verify_checkpoint.py` y los checksums FP64 sirven como referencia para pipelines de integridad de artefactos de entrenamiento.
- Base para ajuste fino experimental: los pesos densos en FP32 pueden servir como punto de partida para tareas downstream, aunque requeriria validacion previa de calidad del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~700M parametros en FP32, los pesos densos ocupan aproximadamente 2,8 GB; en BF16/FP16 unos 1,4 GB; en cuantizacion de 8 bits unos 0,7 GB y en 4 bits unos 0,35 GB (estimaciones teoricas, no confirmadas por el autor).
- Memoria n-gram adicional: la tabla de 600M entradas en BF16 requiere almacenamiento adicional no cuantificado en la informacion disponible.
- GPU recomendadas: el entrenamiento se realizo en NVIDIA H100; para inferencia, una RTX 4090 (24 GB) o RTX 3090 (24 GB) deberia ser suficiente para los pesos densos, aunque la memoria n-gram puede anadir requisitos.
- Cabe en GPU de consumo: probablemente si, en GPUs con 16-24 GB, sujeto a la gestion de la tabla n-gram.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; la arquitectura hibrida y la memoria n-gram probablemente requieren codigo de inferencia especifico no incluido en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| packed-long-h100-b14-a28 | ~700M + 600M n-gram | no disponible | Hibrida (Gated DeltaNet + gated attention + n-gram) | no disponible | Checkpoints de entrenamiento |
| Mamba-2 (130M-2.7B) | 130M-2.7B | hasta 2M en variantes largas | SSM puro | Apache 2.0 | Pesos y codigo publicos |
| Jamba (52B) | 52B (12B activos) | 256K | Hibrida Mamba-Transformer MoE | Apache 2.0 | Pesos publicos |
| Zamba (7B) | 7B | 4K-16K | Hibrida Mamba-attention | Apache 2.0 | Pesos publicos |

La comparativa es orientativa: los modelos alternativos son proyectos con documentacion, evaluacion y licencia publicas, mientras que `packed-long-h100-b14-a28` es un artefacto de investigacion sin informacion de rendimiento ni licencia.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier uso en produccion.
- Sin evaluacion publicada: no hay benchmarks, lo que impide estimar la calidad del modelo frente a alternativas.
- Idiomas no especificados: se desconoce que lenguas cubre el entrenamiento.
- Contexto no documentado: aunque el nombre sugiere contexto largo, no se indica la longitud maxima efectiva.
- Checkpoints intermedios: el repositorio conserva solo los dos ultimos checkpoints y elimina el historial, lo que limita la reproducibilidad de experimentos anteriores.
- Formato FP32: los pesos densos en FP32 requieren mas memoria que versiones BF16 y no estan optimizados para despliegue.
- Dependencia de codigo especifico: la memoria n-gram y la arquitectura hibrida probablemente requieren el codigo de entrenamiento del autor, no incluido en el repositorio.
- Riesgo de alucinacion y sesgos: no evaluado; al ser un modelo de 700M sin ajuste documentado, cabe esperar alucinaciones y sesgos derivados del dataset `packed1`, cuya composicion se desconoce.
- Fecha de creacion futura (2026-11-04): conviene verificar la autenticidad y vigencia del repositorio antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ba2han/packed-long-h100-b14-a28
- Dataset de entrenamiento: https://huggingface.co/datasets/Ba2han/packed1 (referenciado en la model card)
- Proyecto Weights & Biases: `exp_train`, run `packed-long-h100-b14-a28` (no se proporciona URL directa)
- Script de verificacion: `code/verify_checkpoint.py` dentro del repositorio
