# AUTHCA/ArisRT-Benchmarks

## Resumen

ArisRT Benchmarks es un repositorio de modelos de referencia (benchmark) publicado por el usuario AUTHCA en Hugging Face, concebido como conjunto de entradas para ArisRT (Aristotle Runtime), un runtime de CPU hardware-aware construido sobre Apache TVM por el grupo CSD AI/HPC de la Universidad Aristóteles de Tesalónica. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de artefactos TFLite cuantizados a int8 pensados para medir latencia de inferencia en arquitecturas RISC-V y otras CPU.

El repositorio contiene, en la información disponible, un único artefacto: `int8/resmlp36_int8.tflite`, una conversión full-integer int8 del clasificador de imágenes ResMLP-36 (variante `resmlp_36_224.fb_in1k` de timm, entrenada sobre ImageNet-1k). El modelo original es una red de tipo MLP con mezcla de tokens, sin atención, y la versión publicada aquí ha sido cuantizada estáticamente con PT2E de PyTorch y convertida con `litert_torch`.

Su relevancia es instrumental: sirve para reproducir y comparar las mediciones de latencia de ArisRT sobre hardware modesto (CPU, RISC-V), no para tareas generativas. El tamaño del repositorio es de 0,0 GB según los metadatos, lo que sugiere artefactos pequeños o un repositorio prácticamente vacío en el momento de la consulta, y no se han registrado descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResMLP-36 (red MLP con mezcla de tokens, sin atención), clasificador de imágenes |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | int8 full-integer (estática, simétrica, pesos per-channel) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other (cada modelo conserva la licencia de su fuente; ResMLP-36: Apache-2.0) |
| Formato de pesos | TFLite (`.tflite`) |

## Arquitectura y entrenamiento

El artefacto disponible es ResMLP-36, una arquitectura de tipo MLP que procesa parches de imagen y aplica capas de mezcla de tokens y de canales en lugar de mecanismos de atención. La variante de origen, `timm/resmlp_36_224.fb_in1k`, está entrenada sobre ImageNet-1k con resolución de entrada 224×224 y produce 1000 clases de salida.

La conversión a int8 se realizó con cuantización estática PT2E de PyTorch (cuantizador `PT2EQuantizer`: int8, simétrico, pesos per-channel), calibrada sobre 32 entradas sintéticas con distribución N(0,1) y convertida posteriormente con `litert_torch.convert`. Todos los operadores son int8: FULLY_CONNECTED, ADD, MUL, TRANSPOSE, GELU y el CONV_2D del patch embedding. El autor advierte explícitamente que la calibración con datos sintéticos hace que la precisión del modelo cuantizado no sea representativa; el propósito es medir latencia, no accuracy.

## Capacidades

- Clasificación de imágenes sobre ImageNet-1k (1000 clases) con entrada int8 de forma `[1, 3, 224, 224]` y salida int8 de forma `[1, 1000]`.
- Inferencia full-integer int8, adecuada para ejecución en CPU y en plataformas RISC-V mediante el runtime ArisRT.
- Sirve como carga de trabajo de referencia para medir latencia y evaluar optimizaciones de runtime (no para producción de clasificación fiable).
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades especiales más allá de la clasificación de imágenes.

## Casos de uso

- Evaluación de runtimes de CPU: usar `resmlp36_int8.tflite` como entrada de los ejemplos y benchmarks de ArisRT para medir latencia de operadores int8 en distintas CPU y comparar configuraciones del runtime. Es adecuado porque el artefacto está pensado exactamente para eso.
- Caracterización en RISC-V: ejecutar el modelo en placas o simuladores RISC-V para estudiar el comportamiento de kernels int8 (FULLY_CONNECTED, CONV_2D, GELU) sobre ISA vectorial o escalar.
- Validación de pipelines de cuantización: reproducir el flujo PT2E → `litert_torch.convert` y comprobar que la conversión full-integer produce un grafo ejecutable en TFLite.
- Pruebas de regresión de compiladores: usar el modelo como caso de prueba para verificar que las transformaciones de TVM/ArisRT no rompen la semántica del grafo int8.
- Benchmarking de hardware embebido: comparar latencia entre SoCs o núcleos de CPU en una carga de visión representativa y de tamaño contenido.
- Docencia y experimentación: emplear el modelo como ejemplo mínimo de clasificador int8 para prácticas sobre cuantización y despliegue en CPU, dado que su calibración sintética no requiere datos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio está orientado a medir latencia, pero no incluye cifras de latencia, throughput ni accuracy en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; es un modelo TFLite int8 para CPU, sin requisito de GPU.
- GPU recomendadas: no aplica; el runtime objetivo (ArisRT) es de CPU.
- Cabe en consumer GPU: no aplica; está diseñado para ejecución en CPU y plataformas RISC-V.
- Opciones de despliegue: TFLite (intérprete estándar), ArisRT sobre Apache TVM; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de artefacto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ArisRT Benchmarks (ResMLP-36 int8) | Clasificador de imágenes MLP | TFLite | int8 full-integer | other (fuente Apache-2.0) | Hugging Face, 0 descargas |
| timm/resmlp_36_224.fb_in1k | Clasificador de imágenes MLP | PyTorch/safetensors | fp32 (sin cuantizar) | Apache-2.0 | Hugging Face (timm) |
| Otras entradas de benchmark de ArisRT | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

## Limitaciones y advertencias

- La cuantización se calibró sobre datos sintéticos N(0,1); la precisión del modelo int8 no es representativa y no debe usarse para clasificación fiable en producción.
- No es un modelo de lenguaje: no ofrece generación de texto, razonamiento, código ni capacidades multilingües.
- La licencia figura como "other"; cada modelo conserva la licencia de su fuente (ResMLP-36 es Apache-2.0), por lo que el uso comercial debe verificarse contra la licencia del modelo original.
- El repositorio presenta 0 descargas y 0 likes, y un tamaño de 0,0 GB en los metadatos, lo que indica escasa validación por parte de la comunidad y posibles inconsistencias en el contenido publicado.
- Solo se documenta un artefacto (ResMLP-36 int8); no hay información sobre otros modelos de benchmark que el nombre del repositorio pudiera sugerir.
- No se dispone de datos de sesgos, alucinación ni rendimiento medido; cualquier afirmación al respecto sería especulativa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AUTHCA/ArisRT-Benchmarks
- Repositorio de ArisRT en GitHub: https://github.com/gkeramidasCSD-Group/ArisRT
- Modelo de origen ResMLP-36 (timm): https://huggingface.co/timm/resmlp_36_224.fb_in1k
