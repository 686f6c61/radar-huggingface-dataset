# chyun/video-lam-old78k-smalldec-d4-pretrained-flow-16k

## Resumen

Video LAM (small decoder, variante d4) es un checkpoint de investigación publicado por el usuario chyun en Hugging Face, derivado del modelo base nvidia/Cosmos-Predict2.5-2B. Se trata de un modelo de mundo orientado a robótica que combina un codificador de vídeo preentrenado congelado (28 bloques de Cosmos) con un decodificador pequeño y entrenable de cuatro bloques, y que predice acciones mediante flow matching. El checkpoint corresponde al paso 16.000 de un entrenamiento de ablación denominado `old78k-varlen-small-pretrained-flow-d4-action-8gpu-gb16`.

El interés del modelo es fundamentalmente metodológico: forma parte de un estudio de ablación que compara un decodificador pequeño frente a alternativas mayores, cambiando simultáneamente la inicialización del decodificador y el objetivo de vídeo (flow matching), por lo que no aísla cada factor por separado. No es un modelo listo para producción ni un artefacto con model card orientada a usuarios finales: el repositorio contiene el checkpoint nativo de PyTorch junto con el estado del optimizador, argumentos de entrenamiento, estadísticas de normalización de acciones, parches de implementación y sumas de verificación.

El repositorio ocupa 2,8 GB y no registra descargas ni interacciones en el momento de la consulta. La licencia no está declarada en la información disponible, los idiomas soportados no se especifican y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión/flow matching para vídeo y acciones; codificador Cosmos de 28 bloques (congelado) + decodificador de 4 bloques entrenable; LoRA de rango 16 en etapa A |
| Parametros totales | no disponible (modelo base Cosmos-Predict2.5-2B; el checkpoint incluye codificador, decodificador, queries, adaptadores y LoRA) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clips de vídeo variables de 5 a 29 fotogramas a 480x640) |
| Tipos de cuantizacion | no disponible (checkpoint nativo en PyTorch, presumiblemente bf16) |
| Idiomas soportados | no disponible (condicionamiento textual vía embeddings proyectados de Cosmos-Reason1-7B) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`step_016000.pt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos etapas. La etapa A emplea el codificador Cosmos completo de 28 bloques con la base congelada y un LoRA de rango 16; la etapa B entrena un decodificador independiente de cuatro bloques, inicializado a partir de los bloques [0, 9, 18, 27] de Cosmos, sin LoRA en el decodificador. La predicción de vídeo utiliza flow matching y la predicción de acciones emplea el objetivo original de flow matching por conjunto de datos. El condicionamiento textual de la etapa A se realiza mediante embeddings proyectados de Cosmos-Reason1-7B.

El entrenamiento se ejecutó con lote global de 16, microbatch de 1 por GPU, acumulación de gradiente de 2 y ocho GPUs, con semilla 0. La mezcla de datos es de pesos iguales entre DROID, EgoDex y MolmoAct, con clips variables de 5 a 29 fotogramas a resolución 480x640. El autor advierte explícitamente que esta comparación de decodificador pequeño altera a la vez la inicialización del decodificador y el objetivo de vídeo, de modo que no permite atribuir los resultados a un único factor.

## Capacidades

- Predicción de acciones robóticas a partir de observaciones de vídeo, mediante flow matching condicionado por el estado del entorno.
- Modelado de dinámica de vídeo (generación/predicción de fotogramas) con un decodificador de cuatro bloques.
- Condicionamiento por lenguaje a través de embeddings proyectados de Cosmos-Reason1-7B, siempre que se disponga de una caché de texto proyectada o del codificador de texto en línea correspondiente.
- Procesamiento de clips de longitud variable (5 a 29 fotogramas) a 480x640.
- Entrenamiento multi-dataset con normalización de acciones específica por conjunto de datos.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en modelos de mundo para robótica: reproducción del experimento de ablación comparando decodificador pequeño frente a alternativas mayores, usando el checkpoint exacto del paso 16.000 y el parche de entrenamiento incluido.
- Aprendizaje por imitación desde datos heterogéneos: la mezcla DROID + EgoDex + MolmoAct permite estudiar cómo influye la composición del dataset en la política de acciones resultante.
- Estudio de flow matching como objetivo de predicción de acciones: el checkpoint conserva las estadísticas de normalización (`action_stats_old78k_3src.json`) necesarias para reproducir el espacio de acciones.
- Evaluación de inicializaciones de decodificador: los bloques [0, 9, 18, 27] de Cosmos como semilla permiten analizar la transferencia desde modelos de vídeo preentrenados a decodificadores compactos.
- Condicionamiento lingüístico en robótica: con la caché de texto proyectada adecuada, se puede estudiar la influencia de instrucciones en lenguaje natural sobre la política de acciones.
- Reproducibilidad de experimentos: los ficheros de verificación (`checkpoint_verification.json`, `checksums.json`) y los argumentos guardados permiten auditar la integridad del entrenamiento y reanudarlo en otro host.
- Análisis de eficiencia de entrenamiento: la configuración de 8 GPUs con microbatch 1 y acumulación 2 sirve como referencia para planificar recursos en experimentos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El entrenamiento documentado empleó ocho GPUs con microbatch de 1 y acumulación de gradiente de 2; no se especifica el modelo de GPU, aunque el tamaño del modelo base (2B) y el uso de bf16 sugieren GPUs de clase A100 o H100.
- El repositorio ocupa 2,8 GB, lo que corresponde al checkpoint con estado del optimizador; la inferencia requiere además el modelo base congelado `nvidia/Cosmos-Predict2.5-2B` (fichero `base/pre-trained/d20b7120-df3e-4911-919d-db6e08bad31c_ema_bf16.pt`), que debe descargarse por separado.
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el flujo previsto es PyTorch nativo con el repositorio `jiiiisoo/video_lam` en el commit `b9763c67b0d3bb2ccb06476c66b79e1b75622107`.
- Latencia y throughput: no disponibles.
- El autor advierte que la verificación incluida comprueba integridad de serialización y finitud de tensores, pero no constituye una prueba de inferencia en GPU del paquete descargado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chyun/video-lam-old78k-smalldec-d4-pretrained-flow-16k | no disponible (base 2B) | clips de 5-29 fotogramas | Flow matching vídeo + acciones | no disponible | Checkpoint de investigación en HF |
| nvidia/Cosmos-Predict2.5-2B | 2B | no disponible | Difusión/flow para vídeo | no disponible en esta ficha | Modelo base en HF |
| Alternativas de política robótica de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables para establecer una comparación cuantitativa con otras políticas robóticas o modelos de mundo.

## Limitaciones y advertencias

- Es un checkpoint de ablación, no un modelo final: el autor indica que la comparación de decodificador pequeño cambia simultáneamente la inicialización y el objetivo de vídeo, por lo que no aísla ninguno de los dos factores.
- La licencia no está declarada; no se puede asumir uso comercial sin consultar al autor o al modelo base.
- El paquete no incluye la caché de texto de entrenamiento ni el codificador de texto en línea; el condicionamiento por lenguaje requiere aportar uno de los dos.
- Es necesario descargar por separado el modelo base congelado y la VAE de `nvidia/Cosmos-Predict2.5-2B` en la revisión `15a82a2ec231bc318692aa0456a36537c806e7d4`.
- Los argumentos de entrenamiento contienen rutas de máquina originales que deben sustituirse por las del host de destino (raíces de datos, checkpoint/resume, caché de texto y `per_dataset_action_stats`).
- El cargador debe restaurar todos los grupos guardados (queries, adaptadores, `video_decoder`, LoRA y `small_decoder`); un cargador que ignore grupos en silencio producirá un modelo incorrecto.
- No se han publicado benchmarks ni evaluaciones de rendimiento en robot real; el uso en producción no está respaldado por evidencia experimental en la información disponible.
- No hay datos sobre sesgos, tasas de alucinación ni cobertura idiomática.
- El repositorio no registra descargas ni validación externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/chyun/video-lam-old78k-smalldec-d4-pretrained-flow-16k
- Repositorio de código: https://github.com/jiiiisoo/video_lam (commit `b9763c67b0d3bb2ccb06476c66b79e1b75622107`)
- Modelo base: https://huggingface.co/nvidia/Cosmos-Predict2.5-2B (revisión `15a82a2ec231bc318692aa0456a36537c806e7d4`)
- Dataset: https://huggingface.co/datasets/Jiiiiiisoo/video_lam_prepared_v1
- Dataset: https://huggingface.co/datasets/Jiiiiiisoo/video_lam_dataset
