# crw72/Qwen3.8-27B-oQ5h-fp16-mtp

## Resumen

Qwen3.8-27B-oQ5h-fp16-mtp es una cuantización mixta del modelo base Qwen/Qwen3.8-27B, publicada por el usuario crw72 en Hugging Face. El artefacto se ha generado con oQ (oMLX v0.8.0), una herramienta de cuantización de precisión mixta orientada al ecosistema MLX de Apple, y emplea el formato de pesos safetensors junto con la librería mlx para su carga e inferencia.

El checkpoint declara un total de 7.816.573.680 parámetros reales en safetensors, distribuidos entre el modelo de lenguaje (6.931B), un componente de visión (0.461B) y una cabeza MTP (multi-token prediction) de 0.425B. La mezcla de precisiones da como resultado un promedio efectivo de 21,873 bits por peso, con un tamaño de repositorio de 21,4 GB. La licencia es Apache 2.0, heredada del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta una receta concreta de cuantización mixta para MLX con soporte de visión y decodificación especulativa mediante MTP; por otro, advierte de que el autor no ha publicado model card descriptiva, benchmarks ni idiomas soportados, por lo que la evaluación práctica recae enteramente en el usuario. El identificador del modelo base ("Qwen3.8-27B") no se corresponde con ninguna familia publicada oficialmente por Qwen en el momento de redactar esta ficha, lo que conviene verificar antes de adoptarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza MTP (multi-token prediction) y torre de visión; detalles completos del modelo base no disponibles |
| Parametros totales | 7.816.573.680 (7,817B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla affine 5-bit, 6-bit y 8-bit (grupo 64), FP16, FP32 y U32; promedio efectivo 21,873 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería mlx) |

Desglose de almacenamiento declarado por el autor:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 6,931B | 19,164 GB / 17,848 GiB |
| Vision | 0,461B | 1,843 GB / 1,716 GiB |
| Cabeza MTP | 0,425B | 0,365 GB / 0,340 GiB |
| Total | 7,817B | 21,372 GB / 19,904 GiB |

Distribución por precisión:

| Formato de almacenamiento | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 5-bit, grupo 64 | 0,362B | 4,628% | 0,232 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 1,271B | 16,265% | 0,962 GiB | 6,50 |
| Affine 8-bit, grupo 64 | 1,282B | 16,400% | 1,268 GiB | 8,50 |
| FP16 | 0,439B | 5,616% | 0,818 GiB | 16,00 |
| FP32 | 0,461B | 5,894% | 1,716 GiB | 32,00 |
| U32 | 4,002B | 51,197% | 14,908 GiB | 32,00 |
| Total | 7,817B | 100% | 19,904 GiB | 21,873 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de la presencia de tres componentes diferenciados: un modelo de lenguaje, una torre de visión y una cabeza MTP. La existencia de esta última sugiere que el modelo base incorpora decodificación especulativa nativa mediante predicción multi-token, una técnica que permite proponer varios tokens por paso y validarlos en paralelo para aumentar el throughput sin degradar la distribución de salida. La torre de visión implica capacidades multimodales de entrada de imagen, aunque no se detalla el codificador visual ni la resolución soportada.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base pasó por fases de RLHF, DPO u otro tipo de ajuste por preferencias. Tampoco se documenta la receta de cuantización más allá de los parámetros de oQ: el autor indica que se usó oMLX v0.8.0 con cuantización de precisión mixta y grupos de 64, pero no especifica el criterio de asignación de bits por capa ni las métricas de error de reconstrucción empleadas para decidir qué tensores mantienen FP16/FP32.

Un detalle técnico relevante es que más de la mitad de los pesos lógicos (4,002B, el 51,197%) se almacenan como U32, lo que en la práctica corresponde a tensores que no se benefician de la cuantización (posibles tablas de embeddings, normas o parámetros auxiliares) y que dominan el tamaño final del checkpoint: 14,908 GiB de los 19,904 GiB totales. Esto explica que el promedio de bits por peso (21,873) sea alto pese a que una fracción sustancial de los tensores cuantizables esté en 5, 6 y 8 bits.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.8-27B; el alcance exacto no está documentado en la model card.
- Procesamiento de imágenes: el checkpoint incluye una torre de visión de 0,461B de parámetros, lo que habilita tareas de comprensión visual (descripción, VQA, extracción de información de documentos) siempre que el runtime MLX cargue correctamente dicho componente.
- Decodificación especulativa mediante cabeza MTP de 0,425B, orientada a reducir la latencia por token en inferencia autoregresiva.
- Capacidades multilingües: no disponibles; el autor no declara idiomas soportados.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de pensamiento explícito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Mac con silicio de Apple: el formato MLX y la cuantización mixta permiten cargar el checkpoint en un Mac Studio o MacBook Pro de gama alta, aprovechando la memoria unificada para mantener el modelo residente sin depender de CUDA.
- Asistentes multimodales de escritorio: la torre de visión permite procesar capturas de pantalla o imágenes escaneadas en aplicaciones locales de ayuda al usuario, con la ventaja de que ningún dato sale del equipo.
- Prototipado de pipelines de decodificación especulativa: la cabeza MTP incluida facilita experimentar con decodificación multi-token en MLX y medir la ganancia de throughput frente a la decodificación token a token.
- Evaluación comparativa de recetas de cuantización: al publicar el desglose de bits por componente, el checkpoint sirve como referencia para estudiar el impacto de mezclas 5/6/8-bit en calidad frente a cuantizaciones uniformes.
- Procesamiento de documentos en local para equipos con requisitos de privacidad: extracción y resumen de información de PDFs e imágenes sin enviar contenido a servicios externos.
- Investigación sobre modelos base no verificados: útil para reproducir y auditar las afirmaciones del autor sobre el modelo Qwen3.8-27B antes de adoptarlo en cualquier flujo productivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 21,4 GB en disco y requiere al menos ese espacio en memoria para cargarse; con overhead de runtime MLX, conviene disponer de 26-32 GB de memoria unificada.
- GPU recomendadas: hardware Apple Silicon con memoria unificada de 32 GB o superior (M2 Max, M3 Max, M2/M3 Ultra, M4 Pro/Max). El formato MLX no está pensado para GPU NVIDIA o AMD.
- ¿Cabe en consumer GPU? No en el sentido convencional (NVIDIA/AMD); en Apple Silicon de gama alta sí, siempre que se disponga de al menos 32 GB de memoria unificada.
- Opciones de despliegue: exclusivamente MLX (librería mlx y ecosistema oMLX). No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI al no publicarse pesos en GGUF ni en safetensors estándar de PyTorch.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| crw72/Qwen3.8-27B-oQ5h-fp16-mtp | 7,817B (21,873 bits/peso) | no disponible | Apache 2.0 | safetensors MLX | Cuantización mixta con visión y MTP; 0 descargas |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | Apache 2.0 | no disponible | Modelo de referencia del que deriva este checkpoint |
| Cuantizaciones MLX uniformes 4/8-bit de modelos Qwen | variable | variable | Apache 2.0 | safetensors MLX | Alternativa más simple, sin mezcla de precisión ni MTP |

No se dispone de datos de rendimiento comparado para establecer diferencias cuantitativas con alternativas.

## Limitaciones y advertencias

- La model card no documenta idiomas, contexto, benchmarks ni composición del entrenamiento; cualquier afirmación sobre calidad es especulativa.
- El identificador del modelo base (Qwen3.8-27B) no coincide con ninguna familia publicada oficialmente por Qwen, por lo que conviene verificar su procedencia antes de confiar en las capacidades declaradas.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni validación externa.
- La cuantización mixta puede degradar la calidad en capas sensibles; el autor no publica métricas de perplejidad ni comparación con el modelo base en FP16.
- El 51,197% de los pesos se almacena como U32, lo que reduce el ahorro efectivo de memoria frente a lo que sugiere la etiqueta "5-bit" del repositorio.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base; es responsabilidad del usuario verificar que el modelo original realmente se distribuye bajo esos términos.
- El formato MLX limita el despliegue a hardware Apple; no hay pesos GGUF ni safetensors estándar para CUDA.
- Riesgo de alucinación y sesgos: no evaluados ni documentados por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/crw72/Qwen3.8-27B-oQ5h-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
