# Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50

## Resumen

Qwen3.8-Flash-Next-mixed-mlx-K50 es un reempaquetado en precisión mixta del modelo ternario Jakevin/Qwen3.8-Flash-Next-ternary-mlx-K50, publicado por el usuario Jakevin. Se trata de una derivación cuantizada y podada del modelo Qwen/Qwen3.8-Flash-Next de Qwen, orientada exclusivamente a inferencia sobre Apple Silicon mediante la librería MLX. El repositorio ocupa 60 GB e incluye 48 capas de expertos empaquetados en formatos afines de 2, 3 y 4 bits, además de una tabla PLE de n-gramas y pesos de atención y expertos compartidos.

La particularidad técnica del modelo es la conversión sin pérdida de los expertos ternarios (5 trits por byte, una escala bf16 por cada 64 pesos) a registros afines de 2 bits de MLX, denominados `2t`. Según el autor, la equivalencia es exacta: cada peso `scale*code - scale` reproduce el valor ternario `scale*{-1,0,+1}`, y las pruebas con decodificación greedy sobre dos prompts de 256 tokens generan secuencias idénticas y logits con diferencia absoluta máxima de 0 en los primeros 16 pasos.

El modelo no es cargable con `mlx-lm` ni `mlx-vlm` estándar: requiere un runtime en C++ específico incluido en el repositorio Jakevin/moe-offload. Está pensado para desarrolladores que quieran ejecutar un MoE de gran tamaño en equipos Apple con memoria unificada limitada, aceptando un rendimiento de decodificación muy bajo (en torno a 5 tokens por segundo en un M4 Pro de 64 GB) a cambio de mantener el modelo completo en disco y solo una parte residente en memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con atención lineal e hiperconexiones (derivada de Qwen3.8-Flash-Next), pesos empaquetados en MLX |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos en affine 2, 3 y 4 bits; expertos ternarios convertidos a `2t` (2 bits, group_size=64, escala bf16); embeddings y lm_head en 8 bits; tabla PLE en affine mixto 2-6 bits |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors (`skeleton.safetensors`, `nonexpert.safetensors`, `router_k50.safetensors`) y binarios empaquetados por capa (`codes.bin`, `scales.bf16`, `bias.bf16`, `index.json`) |

## Arquitectura y entrenamiento

El modelo es una derivación del Qwen3.8-Flash-Next, un transformer con mezcla de expertos (MoE) que incorpora atención lineal, hiperconexiones, expertos compartidos y una tabla PLE (probablemente *Positional Learned Embeddings* o una tabla de n-gramas, según la nomenclatura del autor). La poda de expertos está aplicada de forma fija: la capa 0 conserva los 512 expertos enrutados y las capas 1 a 47 conservan 256 de 512, es decir, se elimina el 50 % de los expertos enrutados. Los identificadores originales conservados están en `K50_kept.json`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original. La contribución técnica de esta ficha es exclusivamente de cuantización y empaquetado: la conversión de ternario a `2t` es sin pérdida y el resto de tensores (atención, expertos compartidos, embeddings, lm_head, routers y tabla PLE) son idénticos byte a byte al repositorio ternario K50. El autor no documenta innovaciones de decodificación especulativa ni de atención más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto conversacional y de prosa en inglés, según los prompts de prueba del autor.
- Generación de código, con un prompt de programación en Python empleado en las mediciones de velocidad.
- Razonamiento multi-paso y decodificación greedy determinista, verificado con equivalencia exacta frente al modelo ternario.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon con memoria unificada limitada: el modelo permite ejecutar un MoE podado y cuantizado en un Mac mini M4 Pro de 64 GB manteniendo solo 15,6 GB de expertos residentes y leyendo el resto desde SSD, lo que lo hace adecuado para experimentación local sin GPU dedicada.
- Evaluación de técnicas de cuantización extrema: investigadores que estudien la conversión ternario a affine 2 bits pueden usar este repositorio como referencia de equivalencia sin pérdida, comparando logits y tokens generados frente al modelo ternario original.
- Pruebas de decodificación de código en local: con un rendimiento de 5,28 tok/s en un prompt de programación, sirve para validar pipelines de generación de código en entornos sin acceso a la nube, aceptando la latencia como contrapartida.
- Desarrollo de runtimes de inferencia MoE con offload: el repositorio está diseñado para el runner C++ de Jakevin/moe-offload, por lo que es útil para probar estrategias de caché LRU de expertos y presupuestos de memoria residente configurables con `--resident-gb`.
- Reproducción de experimentos de poda de expertos: la conservación del 50 % de expertos enrutados en las capas 1-47 y del 100 % en la capa 0 permite estudiar el impacto de la poda en la calidad de generación frente al modelo completo.
- Verificación de integridad de pesos: el runner incluye `--check-weights`, que permite validar cada tensor del repositorio antes de desplegarlo, útil en pipelines de CI para artefactos de modelos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado ningún benchmark sobre este modelo y que las cifras de velocidad provienen de una sola máquina y dos prompts.

| Métrica (Mac mini M4 Pro, 64 GB) | Prompt de código | Prompt de prosa |
|---|---:|---:|
| Este modelo, solo (mediana de 3) | 5,28 tok/s | 5,85 tok/s |
| Este modelo, intercalado con ternario K50 | 3,88 tok/s | 5,47 tok/s |
| Ternario K50, intercalado con este modelo | 4,03 tok/s | 5,28 tok/s |
| Tasa de acierto de caché de expertos en decodificación | 95,4 % | 96,4 % |
| Todos los expertos residentes (23,1 GB, sin lecturas de SSD) | 1,71 tok/s | 1,86 tok/s |

Memoria con presupuesto de 15,6 GB: RSS máximo del proceso en torno a 23,3 GB, pico de MLX de 19,6 GiB y sin crecimiento de swap. Con todos los expertos residentes, el RSS del proceso fue de aproximadamente 30,6 GB.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con MLX; no funciona en GPU NVIDIA ni en CPU x86.
- VRAM/memoria unificada: el autor reporta un presupuesto de expertos residentes de 15,6 GB con RSS pico de 23,3 GB; con todos los expertos residentes se necesitan unos 23,1 GB solo para expertos y 30,6 GB de RSS.
- GPU recomendadas: Apple M4 Pro con 64 GB es la única configuración documentada; en equipos con menos de 64 GB hay que reducir `--resident-gb`.
- ¿Cabe en GPU de consumo? No aplica: no hay soporte para RTX 4090 ni similares; el modelo requiere memoria unificada de Apple Silicon.
- Opciones de despliegue: únicamente el runner C++ `qwen38_decode` del repositorio Jakevin/moe-offload (`mlx-qwen38/cpp`), con CMake ≥ 3.24 y una build de MLX C++. No es compatible con vLLM, llama.cpp, Ollama, TGI ni `mlx-lm`.
- Latencia y throughput: 5,28 tok/s en código y 5,85 tok/s en prosa en solitario; 1,71 y 1,86 tok/s con todos los expertos residentes. El autor no investigó la causa de que el modo totalmente residente sea más lento que el modo con offload.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50 | no disponible | no disponible | Affine 2/3/4 bits + `2t`, embeddings 8 bits | Qwen Community 1.0 | HuggingFace, solo runtime C++ propio |
| Jakevin/Qwen3.8-Flash-Next-ternary-mlx-K50 | no disponible | no disponible | Ternario (5 trits/byte) | Qwen Community 1.0 | HuggingFace, runtime Python propio |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | Original (bf16 presumiblemente) | Qwen Community 1.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada, salvo la equivalencia exacta en tokens generados y logits entre este modelo y el ternario K50.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon con MLX; no hay soporte para CUDA, ROCm ni CPU genérica.
- Requiere un runtime que entienda el tipo de registro `2t`; `mlx-lm` y `mlx-vlm` estándar no pueden cargar el repositorio, y el `runtime.py` del repositorio ternario tampoco lee registros `2t`.
- El autor no ha ejecutado ningún benchmark; las cifras de velocidad proceden de una sola máquina y dos prompts, por lo que no son representativas de otros equipos o cargas.
- El modo con todos los expertos residentes es más lento que el modo con offload (1,71 frente a 5,28 tok/s en código) y la causa no está investigada, lo que desaconseja ese modo de despliegue.
- Hereda todas las limitaciones y advertencias de evaluación del modelo ternario K50, según indica el propio autor.
- Licencia Qwen Community 1.0: si el modelo o un derivado se usa en un producto o servicio comercial con más de 100 000 000 de usuarios activos mensuales o 20 000 000 USD de ingresos mensuales, el nombre del modelo debe mostrarse de forma destacada en la interfaz. Los negocios de Model-as-a-Service o AI Work Assistant requieren una licencia separada.
- No hay información sobre sesgos, riesgo de alucinación, cobertura idiomática ni evaluación de calidad tras la poda del 50 % de expertos.
- El repositorio tiene 213 descargas y 0 likes en el momento de la consulta, sin validación independiente conocida.

## Enlaces

- HuggingFace: https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-mixed-mlx-K50
- Modelo ternario base: https://huggingface.co/Jakevin/Qwen3.8-Flash-Next-ternary-mlx-K50
- Runner C++: https://github.com/Jakevin/moe-offload/tree/main/mlx-qwen38/cpp
- README del runner: https://github.com/Jakevin/moe-offload/blob/main/mlx-qwen38/cpp/README.md
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
