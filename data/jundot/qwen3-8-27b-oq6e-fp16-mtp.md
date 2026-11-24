# Jundot/Qwen3.8-27B-oQ6e-fp16-mtp

## Resumen

Qwen3.8-27B-oQ6e-fp16-mtp es una cuantizacion de precision mixta en formato MLX del modelo Qwen/Qwen3.8-27B, un modelo denso de vision-lenguaje de 27.781 millones de parametros construido sobre la arquitectura Qwen3.5. La publica el usuario Jundot mediante su herramienta oQ (oMLX v0.8.0), y no es un modelo entrenado desde cero, sino un checkpoint derivado que preserva el backbone de lenguaje, el codificador visual y la cabeza de prediccion multi-token (MTP) del modelo original.

El interes practico reside en que comprime un modelo de 27B con contexto nativo de 262.144 tokens hasta 23,085 GiB de almacenamiento, con un promedio efectivo de 7,138 bits por peso en el checkpoint completo (6,700 bits/peso en el backbone de lenguaje). Esto lo hace viable en equipos Apple Silicon con memoria unificada, donde un checkpoint en BF16 completo no cabria con comodidad. La cuantizacion no es uniforme: asigna 6 bits a la mayoria de las capas (88,3% de los pesos) y sube a 8 bits en las capas medidas como mas sensibles (9,8%), manteniendo en FP32 el codificador visual.

La relevancia es doble. Por un lado, demuestra una tecnica de cuantizacion guiada por sensibilidad por capa con reajuste por minimos cuadrados ponderados, que reduce el error frente a la cuantizacion uniforme al mismo tamano. Por otro, ofrece una via para desplegar un VLM de 27B con comprension de imagen y video en hardware de consumo, bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas Gated DeltaNet y Gated Attention (Qwen3.5), con codificador visual y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Precision mixta oQ6e: affine 6-bit grupo 64 (24,543B), affine 8-bit grupo 64 (2,722B), FP16 (0,055B), FP32 (0,461B) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), almacenamiento FP16 para escalas, sesgos y tensores no cuantizados; codificador visual en FP32 |
| Bits efectivos por peso | 6,700 (backbone de lenguaje); 7,138 (checkpoint completo) |
| Tamano del repositorio | 24,8 GB (23,085 GiB) |
| Libreria | mlx |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea un transformer hibrido que combina capas Gated DeltaNet (mecanismo de estado lineal recurrente con compuertas) y capas Gated Attention. Esta mezcla busca reducir el coste computacional y de memoria en secuencias largas frente a la atencion completa, lo que explica el contexto nativo de 262.144 tokens. El checkpoint incluye tres componentes diferenciados: el backbone de lenguaje (26,896B de pesos logicos, 20,979 GiB), el codificador visual (0,461B, 1,716 GiB) y la cabeza de prediccion multi-token MTP (0,425B, 0,389 GiB). La MTP permite decodificacion especulativa, es decir, predecir varios tokens por paso para acelerar la generacion.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original. Lo que si documenta el autor es el proceso de cuantizacion: oQ6e asigna bits segun la sensibilidad medida por capa, calcula una matriz de importancia con 128 muestras de 512 tokens y aplica redondeo y un reajuste por minimos cuadrados ponderados de la escala y el sesgo de cada grupo. La revision del 19 de noviembre de 2026 re-cuantizo el modelo con el redondeo oQe refinado de oMLX 0.8.0, que reduce el error al mismo tamano y velocidad.

## Capacidades

- Generacion de texto y razonamiento en conversaciones multi-turno.
- Comprension de imagenes y video (pipeline image-text-to-text, codificador visual incluido).
- Contexto largo de hasta 262.144 tokens para documentos extensos o dialogos prolongados.
- Decodificacion especulativa mediante la cabeza MTP, que acelera la inferencia.
- Capacidades multilingues: no disponibles como dato verificado; dependen del modelo base.
- Soporte de tool calling, function calling y razonamiento multi-paso en agentes: no confirmado en la informacion disponible.
- Modo de razonamiento explicito (thinking): no confirmado en la informacion disponible.

## Casos de uso

- Analisis de documentos extensos con imagenes intercaladas: informes financieros, contratos con anexos graficos o papers con figuras. El contexto de 262.144 tokens permite cargar el documento completo sin fragmentacion y el codificador visual procesa las imagenes en la misma pasada.
- Asistencia sobre capturas y diagramas en entornos de desarrollo: el modelo puede describir diagramas de arquitectura, leer errores en capturas de pantalla o interpretar grafos de dependencias, combinando vision y generacion de texto.
- Procesamiento de video para resumenes: al aceptar entrada de video, sirve para generar transcripciones descriptivas, resumenes de reuniones grabadas o extraccion de acciones a partir de material audiovisual.
- Despliegue local en Apple Silicon: con 23,085 GiB de almacenamiento y formato MLX, cabe en equipos con 32 GB o mas de memoria unificada, lo que permite prototipar un VLM de 27B en un portatil o Mac Studio sin GPU dedicada.
- Evaluacion comparativa de tecnicas de cuantizacion: util como referencia para medir la perdida de calidad de oQ6e frente al modelo BF16 en tareas de vision y lenguaje, dado que el autor documenta la distribucion de bits por capa.
- Chat multimodal en prototipos de investigacion: conversaciones con imagenes en las que se requiere contexto largo y licencia permisiva, sin ataduras a APIs propietarias.
- Generacion de codigo a partir de diagramas o bocetos: el modelo puede recibir una imagen de un esquema y producir el codigo correspondiente, aprovechando la ventana de contexto para incluir especificaciones completas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, ni comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM/memoria estimada: 23,085 GiB solo para los pesos. Para inferencia hay que sumar la cache KV y los buffers de activacion, por lo que se recomienda un minimo de 32 GB de memoria unificada y, para contextos largos, 48-64 GB.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son chips Apple Silicon (M1 Pro/Max/Ultra en adelante, M2/M3/M4 Pro/Max/Ultra). No esta pensado para CUDA; en GPU NVIDIA habria que reconvertir los pesos.
- Cabe en consumer GPU: si, en equipos Apple con memoria unificada de 32 GB o superior. No es directamente usable en RTX 4090 (24 GB) por formato y por el margen necesario para cache y activaciones.
- Opciones de despliegue: MLX (libreria mlx y oMLX del autor). No se documentan conversiones a llama.cpp, Ollama, vLLM o TGI para este checkpoint.
- Latencia y throughput: no disponibles. La cabeza MTP esta disenada para decodificacion especulativa, pero el autor no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ6e-fp16-mtp (este) | 27,781B | 262.144 | Si (imagen y video) | Apache-2.0 | MLX safetensors, precision mixta ~7,1 bits/peso |
| Qwen/Qwen3.8-27B (base) | 27,781B | 262.144 | Si (imagen y video) | Apache-2.0 | safetensors BF16 (sin cuantizar) |
| Alternativas de 27B con vision | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion relevante es contra el modelo base: este checkpoint ocupa 23,085 GiB frente al peso en BF16 del original (aproximadamente el doble), a cambio de una perdida de precision que el autor no cuantifica con benchmarks. No se dispone de datos verificados de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo original: introduce error de redondeo respecto al BF16. El autor no publica evaluaciones de la degradacion resultante en tareas de vision o razonamiento.
- El autor advierte de que la version anterior del checkpoint debe descargarse de nuevo: la revision del 19 de noviembre de 2026 cambia el redondeo. Verificar la fecha de los archivos antes de usar.
- Dependencia de MLX: no es portable a CUDA sin conversion previa, lo que limita su uso a hardware Apple.
- Idiomas soportados no documentados: no se puede confirmar el rendimiento en castellano ni en otras lenguas distintas del ingles y el chino, habituales en la familia Qwen.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado en tareas de descripcion de imagenes o video donde el modelo puede inventar detalles no presentes.
- Soporte de tool calling, agentes y modo thinking no confirmado en la informacion disponible; no asumir estas capacidades en produccion sin validacion.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio y las condiciones del modelo base.
- Modelo con 0 likes y 394 descargas en el momento de la consulta: comunidad pequena, sin validacion independiente de calidad.
- El contexto de 262.144 tokens exige memoria adicional para la cache KV; en equipos de 32 GB el contexto efectivo sera mucho menor que el maximo nominal.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jundot/Qwen3.8-27B-oQ6e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Pull request de mejora oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
