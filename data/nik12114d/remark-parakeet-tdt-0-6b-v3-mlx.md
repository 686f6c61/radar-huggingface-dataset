# nik12114d/remark-parakeet-tdt-0.6b-v3-mlx

## Resumen

Remark Parakeet TDT 0.6B v3 MLX es una exportación de pesos en formato MLX del modelo de reconocimiento automático del habla NVIDIA Parakeet TDT 0.6B v3, preparada específicamente para su uso con Remark en Apple Silicon. El modelo original lo desarrolla NVIDIA; esta variante la publica el usuario nik12114d y se apoya en la conversión previa realizada por MLX Community. El repositorio contiene únicamente los pesos del codificador cuantizados en 8 bits, más el decodificador y la cabeza de salida con la precisión original de Remark.

El modelo resuelve la transcripción de audio a texto (ASR) sobre hardware Apple, aprovechando el framework MLX para ejecutar de forma nativa en chips de la serie M. Con 0,6 mil millones de parámetros y un tamaño de repositorio de 0,8 GB (el fichero de pesos ocupa 754.851.107 bytes), está pensado para despliegues ligeros en local, sin necesidad de GPU dedicada.

Su relevancia es acotada: no es un modelo nuevo ni un fine-tuning, sino un artefacto de distribución de pesos ya preparados para el cargador de modelos compactos de Remark. La licencia CC BY 4.0 permite uso comercial con atribución. No se dispone de información sobre idiomas soportados ni sobre resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), exportada a MLX; codificador con cuantización afín de 8 bits en capas lineales compatibles |
| Parametros totales | 0,6 mil millones (0.6B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín (solo capas lineales del codificador); decodificador y cabeza de salida en la precisión original de Remark |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 |
| Formato de pesos | MLX (pesos preparados para el cargador de modelos compactos de Remark); tamaño del fichero 754.851.107 bytes |

## Arquitectura y entrenamiento

El modelo subyacente es Parakeet TDT 0.6B v3 de NVIDIA, un modelo de reconocimiento automático del habla basado en la arquitectura Token-and-Duration Transducer (TDT). Esta familia combina un codificador acústico con un decodificador de predicción y una red conjunta que emite de forma simultánea tokens y duraciones, lo que permite un alineamiento más eficiente que los transductores clásicos. El artefacto publicado no entrena el modelo: parte de la conversión a MLX fijada por MLX Community y aplica cuantización afín de 8 bits a las capas lineales del codificador compatibles, manteniendo el decodificador y la cabeza de salida en la precisión que usa Remark.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo original empleó RLHF o DPO. Tampoco se documentan innovaciones adicionales más allá de la propia arquitectura TDT y la cuantización del codificador para inferencia en Apple Silicon. El repositorio incluye un hash SHA-256 (`e3745e51e513494c60494ce2ff61d49961823b3ce0333ff983bc6f83ddbbca45`) para verificar la integridad del fichero de pesos.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto mediante el pipeline `automatic-speech-recognition`.
- Ejecución nativa en Apple Silicon a través de MLX, sin dependencia de CUDA ni de GPUs dedicadas.
- Inferencia con pesos cuantizados en 8 bits en el codificador, lo que reduce el espacio en disco y la memoria necesaria.
- Compatibilidad con el cargador de modelos compactos de Remark, que gestiona la carga de los pesos preparados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo es de ASR, no de propósito general).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio de entrada adicional): únicamente ASR; no se documentan otras.

## Casos de uso

- Transcripción local en macOS: usar Remark con estos pesos para convertir reuniones o notas de voz en texto sin enviar audio a servicios en la nube, aprovechando la ejecución nativa en MLX sobre chips M.
- Subtitulado de vídeos y podcasts: procesar ficheros de audio por lotes en un Mac para generar transcripciones que después se revisan o se sincronizan como subtítulos.
- Dictado en herramientas internas: integrar el modelo en una aplicación de escritorio que transcriba voz a texto en tiempo real, apoyándose en el bajo peso (0,8 GB de repositorio) para mantener la app ligera.
- Prototipado de pipelines ASR en investigación: comparar la salida del modelo cuantizado en 8 bits frente a la versión completa en FP para medir el impacto de la cuantización en la calidad de transcripción.
- Indexación de archivos de audio corporativos: transcribir grandes volúmenes de grabaciones en un parque de equipos Apple para alimentar motores de búsqueda o sistemas de análisis de contenido.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse en local y bajo licencia CC BY 4.0, encaja en organizaciones que necesitan procesar audio sensible sin salir de su infraestructura y con obligación de atribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; al ejecutarse con MLX sobre memoria unificada de Apple Silicon, el fichero de pesos de 754.851.107 bytes (~0,75 GB) más las activaciones requiere del orden de 1-2 GB de memoria unificada, aunque no se proporciona una cifra oficial.
- GPU recomendadas: chips Apple Silicon (series M) compatibles con MLX; no se documentan requisitos mínimos concretos.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; no está pensado para GPUs NVIDIA o AMD.
- Opciones de despliegue: Remark con su cargador de modelos compactos y MLX; vLLM, llama.cpp, Ollama o TGI no están indicados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Remark Parakeet TDT 0.6B v3 MLX (este) | 0,6B | no disponible | MLX (codificador 8 bits) | CC BY 4.0 | Hugging Face, 0 descargas |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6B | no disponible | no disponible | no disponible en la información | Hugging Face (modelo base) |
| mlx-community/parakeet-tdt-0.6b-v3 | 0,6B | no disponible | MLX | no disponible en la información | Hugging Face (conversión de referencia) |

La comparación se limita a las variantes del mismo modelo base; no se dispone de datos de rendimiento ni de especificaciones de contexto para contrastar con alternativas de otros autores.

## Limitaciones y advertencias

- Es un artefacto de pesos, no un modelo entrenado desde cero: su calidad depende enteramente de NVIDIA Parakeet TDT 0.6B v3 y de la conversión de MLX Community.
- La cuantización de 8 bits solo afecta al codificador; puede introducir degradación en la precisión de transcripción respecto a los pesos originales, aunque no se han publicado mediciones.
- Solo funciona en el ecosistema MLX y Apple Silicon; no es portable a GPUs NVIDIA, AMD ni a CPU convencional sin conversión adicional.
- Requiere el cargador de modelos compactos de Remark; no es un checkpoint estándar de `transformers` ni un GGUF.
- Idiomas soportados no documentados: no se puede asumir cobertura multilingüe sin verificar el modelo base.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribución a NVIDIA, MLX Community y Remark.
- Riesgo de alucinación y errores de transcripción en audio con ruido, acentos o solapamiento de hablantes: no se documentan evaluaciones al respecto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni señales de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/nik12114d/remark-parakeet-tdt-0.6b-v3-mlx
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Conversión de MLX Community: https://huggingface.co/mlx-community/parakeet-tdt-0.6b-v3/tree/ed2b7e8c15f9aaa0b5772e2efb986255eaef7e15
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
