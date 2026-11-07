# masahiroid/mdeberta-v3-base-gguf

## Resumen

mdeberta-v3-base-gguf es una conversión al formato GGUF del modelo encoder multilingüe microsoft/mdeberta-v3-base, publicada por el usuario masahiroid. No se trata de un modelo nuevo ni de un ajuste fino: es un checkpoint de conversión que preserva los pesos originales en precisión F32 y mantiene los nombres de tensor de Hugging Face. El modelo base es un encoder de la familia DeBERTa-v3, con 278.218.752 parámetros, desarrollado originalmente por Microsoft Research y entrenado con el objetivo de enmascarado reemplazado (RTD) propio de DeBERTa-v3.

La relevancia de esta publicación es acotada y muy específica: emplea un esquema GGUF propietario (`general.architecture=hf-native-mlx-v1`) que no es compatible con llama.cpp, Ollama ni LM Studio, y requiere el runtime MLX incluido en el repositorio, por lo que solo funciona en Apple Silicon. El modelo devuelve estados ocultos a nivel de token y no incorpora ninguna cabeza de tarea, de modo que sigue siendo necesario un ajuste fino posterior para cualquier aplicación downstream.

Por tanto, esta ficha describe un artefacto de conversión e interoperabilidad, no un modelo listo para producción. Su interés reside en la validación numérica de la conversión (diferencia absoluta máxima de 0,0010339618 y similitud coseno mínima de 0,99999876 frente a la implementación original en PyTorch sobre 6 casos deterministas) y en la disponibilidad de exportaciones alternativas a MLX, Core ML y Core AI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3), esquema GGUF propietario `hf-native-mlx-v1` |
| Parámetros totales | 278.218.752 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el runtime MLX preserva el máximo del modelo original; las exportaciones Apple fijan 128 tokens) |
| Tipos de cuantización | F32 (no es una cuantización de 4 bits) |
| Idiomas soportados | multilingüe (sin listado explícito en la información disponible) |
| Licencia | MIT (pesos originales y código de conversión/runtime) |
| Formato de pesos | GGUF con esquema propietario, tensores F32 y nombres de tensor HF nativos |

## Arquitectura y entrenamiento

El modelo subyacente es DeBERTa-v3 en configuración base, un encoder transformer que introduce atención desenredada (disentangled attention) y un objetivo de entrenamiento de denoising por reemplazo de tokens (RTD) combinado con enmascarado. La conversión no modifica la arquitectura ni añade cabezas de tarea: el contenedor GGUF preserva todos los tensores utilizados por el modelo de inferencia original, con nombres idénticos a los de Hugging Face y precisión F32. No se ha realizado ningún ajuste fino ni sustitución de checkpoint respecto a la revisión `a0484667b22365f84929a935b5e50a51f71f159d` del modelo de Microsoft.

La innovación técnica de esta publicación es el propio esquema de serialización: un GGUF no estándar pensado para ser consumido por un cargador MLX incluido en el repositorio, en lugar del formato GGUF convencional de llama.cpp. La validación numérica se realizó sobre 6 casos deterministas (emociones en inglés, texto neutro de recuperación, japonés, entrada vacía y truncamiento, además de series temporales en el contexto de las exportaciones Chronos), con una diferencia absoluta máxima de 0,0010339618 y una similitud coseno mínima de 0,99999876. El autor advierte explícitamente que estas son comprobaciones de paridad de conversión, no benchmarks de calidad de tarea ni de latencia. El entorno de conversión verificado incluye PyTorch 2.14.1, Transformers 4.57.3, MLX 0.32.4, NumPy 1.26.4, coremltools 9.0, GGUF 0.19.0 y chronos-forecasting 2.3.2; la compatibilidad fuera de ese entorno no está garantizada.

## Capacidades

- Generación de representaciones contextuales a nivel de token (hidden states), no generación de texto autoregresiva.
- Extracción de embeddings para clasificación, NER, question answering extractivo, similitud semántica y retrieval, siempre tras ajuste fino con una cabeza de tarea.
- Capacidad multilingüe heredada del modelo base de Microsoft (sin listado de idiomas en la información disponible).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- No incluye cabeza de clasificación, por lo que no produce predicciones de tarea directamente.

## Casos de uso

- Clasificación de texto multilingüe: tras añadir una cabeza lineal y ajustar fino, el encoder puede clasificar tickets de soporte, reseñas o documentos en varios idiomas; la conversión GGUF permite ejecutar la inferencia en Mac con Apple Silicon mediante MLX.
- Extracción de entidades nombradas: el modelo proporciona estados ocultos por token, base adecuada para un cabezal token-classification entrenado sobre dominios específicos (legal, biomédico, financiero).
- Búsqueda semántica y recuperación: los embeddings del encoder sirven para indexar documentos y consultas en un motor vectorial; el texto de prueba de "retrieval neutro" en la validación sugiere este uso previsto.
- Question answering extractivo: con un cabezal de span prediction, el modelo puede localizar respuestas en pasajes largos, aprovechando el contexto original del encoder.
- Análisis de sentimiento y emociones: la validación incluye casos de emociones en inglés, lo que apunta a este tipo de tareas tras ajuste fino.
- Prototipado en local sobre Apple Silicon: investigadores que trabajan en Mac pueden cargar el modelo con el runtime MLX incluido y comparar resultados con la implementación PyTorch de referencia, usando la validación de paridad como control de calidad.
- Pipeline de conversión y verificación: el repositorio incluye scripts de conversión reproducibles, útil para equipos que necesiten replicar el proceso con otros checkpoints de la familia DeBERTa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la validación de paridad de conversión: diferencia absoluta máxima de 0,0010339618 y similitud coseno mínima de 0,99999876 sobre 6 casos deterministas frente a la implementación original en PyTorch. El autor indica explícitamente que no se trata de un benchmark de calidad de tarea ni de latencia.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa aproximadamente 1,1 GB en F32 para 278 millones de parámetros; en memoria unificada de Apple Silicon el consumo es del orden de 1,1 GB más el overhead del runtime MLX.
- GPU recomendadas: el runtime incluido requiere Apple Silicon (MLX); no se contempla ejecución en GPU NVIDIA o AMD con este artefacto.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon; no es ejecutable en GPU de consumo NVIDIA mediante este formato.
- Opciones de despliegue: únicamente el cargador MLX incluido (`runtime_mlx.Model`). No es compatible con vLLM, llama.cpp, Ollama, LM Studio ni TGI.
- Latencia y throughput: no disponibles; el autor no publica mediciones de rendimiento.
- Dependencias: `huggingface_hub`, `mlx`, `numpy`, `gguf`, `transformers` y `sentencepiece`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Compatibilidad de despliegue |
|---|---|---|---|---|---|
| masahiroid/mdeberta-v3-base-gguf | 278 M | no disponible | GGUF propietario (MLX) | MIT | Solo Apple Silicon con runtime MLX |
| microsoft/mdeberta-v3-base (original) | 278 M | no disponible | safetensors (PyTorch) | MIT | PyTorch, Transformers, ONNX, etc. |
| masahiroid/mdeberta-v3-base-mlx | 278 M | no disponible | MLX | MIT | Apple Silicon con MLX |
| masahiroid/mdeberta-v3-base-coreml | 278 M | 128 tokens (exportación fija) | Core ML | MIT | Apple Silicon con Core ML |

La diferencia principal frente al modelo original de Microsoft no está en capacidades ni en parámetros, sino en el formato y en las restricciones de ejecución: el original es portable a cualquier stack de PyTorch, mientras que esta conversión queda atada a Apple Silicon y a un runtime propietario. Frente a las otras exportaciones del mismo autor (MLX, Core ML, Core AI), comparte pesos y licencia, y se distingue por el contenedor GGUF y por preservar el contexto máximo original en lugar de fijar formas estáticas.

## Limitaciones y advertencias

- No es un GGUF estándar: no funciona en llama.cpp, Ollama ni LM Studio, pese a la extensión del archivo.
- Requiere Apple Silicon y el runtime MLX incluido; no hay soporte para GPU NVIDIA, AMD ni CPU x86.
- No incluye cabeza de tarea: sin ajuste fino posterior no produce predicciones útiles para clasificación, NER o QA.
- No es una cuantización: los tensores están en F32, por lo que no se obtienen las ventajas de tamaño de una cuantización de 4 bits.
- Las exportaciones Core ML y Core AI fijan batch 1 y longitud de secuencia 128, lo que obliga a truncar o rellenar; el contexto máximo original solo se preserva en la ruta MLX/GGUF.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de representaciones sesgadas heredadas de los datos de entrenamiento multilingües del modelo base, no documentados en esta ficha.
- La licencia MIT cubre pesos y código de conversión, pero el autor no certifica seguridad ni uso comercial más allá de los términos upstream; conviene revisar `LICENSE` en el repositorio.
- Compatibilidad de versiones no garantizada fuera del entorno probado (PyTorch 2.14.1, Transformers 4.57.3, MLX 0.32.4).
- Sin descargas ni likes en el momento de la consulta, y sin pipeline declarado: no hay evidencia de uso en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/masahiroid/mdeberta-v3-base-gguf
- Modelo base original: https://huggingface.co/microsoft/mdeberta-v3-base
- Revisión del modelo base usada en la conversión: https://huggingface.co/microsoft/mdeberta-v3-base/tree/a0484667b22365f84929a935b5e50a51f71f159d
- Exportación MLX: https://huggingface.co/masahiroid/mdeberta-v3-base-mlx
- Exportación Core ML: https://huggingface.co/masahiroid/mdeberta-v3-base-coreml
- Exportación Core AI: https://huggingface.co/masahiroid/mdeberta-v3-base-coreai
