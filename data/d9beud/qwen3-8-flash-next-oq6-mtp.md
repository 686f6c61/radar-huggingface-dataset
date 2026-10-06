# d9beuD/Qwen3.8-Flash-Next-oQ6-mtp

## Resumen

Qwen3.8-Flash-Next-oQ6-mtp es una cuantizacion del modelo multimodal Qwen/Qwen3.8-Flash-Next realizada por el usuario d9beuD mediante la herramienta oQ (oMLX v0.7.0), un esquema de cuantizacion de precision mixta. El checkpoint conserva el codificador de vision, la cabeza de prediccion multi-token (MTP) y la tabla de embeddings de n-gramas del modelo original, y se distribuye en formato MLX safetensors, lo que lo orienta a inferencia sobre hardware Apple Silicon con memoria unificada.

El modelo base cuenta con 179.999.981.459 parametros (unos 180.000 millones), y el repositorio ocupa 150,4 GB. La cuantizacion resultante tiene un tamano efectivo de aproximadamente 6,69 bits por peso: el 99,1% de los parametros se almacena a 6 bits y el 0,9% a 8 bits, con un tamano de grupo por defecto de 64 (algunos modulos usan 32 o 128). Los pesos no cuantizados, las escalas y los sesgos se mantienen en bfloat16.

Es relevante en la practica porque permite ejecutar en local un modelo de ~180.000 millones de parametros con capacidades de imagen-texto sobre una maquina Apple con memoria unificada de 192 GB, algo imposible con el checkpoint bf16 completo segun el propio autor. La licencia heredada es la Qwen Community License 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tipo de modelo declarado: qwen4_exp; multimodal image-text-to-text con codificador de vision y cabeza MTP) |
| Parametros totales | 179.999.981.459 (~180.000 millones) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ de precision mixta: 6 bits por defecto (99,1% de los parametros), 8 bits (0,9%); tamano de grupo 64 por defecto, con modulos a 32 y 128; ~6,69 bits efectivos por peso |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (etiquetada como "other" en el repositorio) |
| Formato de pesos | MLX safetensors (dtype bfloat16 en pesos no cuantizados, escalas y sesgos) |

Datos adicionales del repositorio: pipeline image-text-to-text, libreria MLX, tamano del repositorio 150,4 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-10-05.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen/Qwen3.8-Flash-Next en los datos proporcionados (numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO, tipo de mecanismo de atencion). Lo unico documentado en la model card es que se trata de un modelo multimodal con pipeline image-text-to-text, ya que la cuantizacion incluye el codificador de vision completo, y que incorpora una cabeza de prediccion multi-token (`mtp_num_hidden_layers: 1`) asi como una tabla de embeddings de n-gramas, ambos preservados en el proceso de cuantizacion.

El trabajo tecnico de este repositorio no es el entrenamiento, sino la cuantizacion. Se aplico el esquema oQ de oMLX v0.7.0 con nivel 6 y precision mixta guiada por sensibilidad. El mapa de sensibilidad por capa se midio sobre Jundot/Qwen3.8-Flash-Next-oQ4e-mtp (128 muestras x 256 tokens, conjunto de calibracion `code_multilingual`) en lugar del checkpoint bf16 completo, porque este ultimo no cabe en memoria en un Mac de 128 GB. Esto implica que la calibracion se realizo sobre un modelo ya cuantizado a 4 bits, un detalle relevante para interpretar la calidad final. La conservacion de la cabeza MTP sugiere que el modelo soporta estrategias de decodificacion especulativa basadas en multi-token prediction, aunque no se documentan detalles de uso.

## Capacidades

- Generacion de texto y conversacion multi-turno, dado el tag `conversational` y el pipeline declarado.
- Procesamiento de imagen y texto de forma conjunta (image-text-to-text), gracias al codificador de vision incluido en la cuantizacion.
- Prediccion multi-token mediante la cabeza MTP preservada (`mtp_num_hidden_layers: 1`), utilizable potencialmente para decodificacion especulativa.
- Soporte de tabla de embeddings de n-gramas incluida en el checkpoint.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades especiales adicionales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Inferencia local multimodal en Apple Silicon: el modelo permite procesar pares imagen-texto directamente en un Mac con al menos 192 GB de memoria unificada, sin depender de servicios en la nube, lo que resulta util para prototipado e investigacion con datos sensibles.
- Evaluacion comparativa de cuantizacion: dado que existe una variante a 4 bits del mismo modelo (Jundot/Qwen3.8-Flash-Next-oQ4e-mtp), este checkpoint a ~6,69 bits efectivos sirve para medir la degradacion de calidad frente a la cuantizacion mas agresiva.
- Investigacion sobre prediccion multi-token: la cabeza MTP preservada permite experimentar con decodificacion especulativa y comparar su efecto sobre latencia y calidad.
- Tareas image-text-to-text offline: descripcion de imagenes, respuesta a preguntas visuales o extraccion de informacion de documentos escaneados en entornos sin conectividad.
- Simulacion y pruebas de pipelines de vision-lenguaje: el formato MLX safetensors facilita su carga con la libreria MLX para validar flujos de trabajo antes de desplegar versiones mayores.
- Estudio de sensibilidad al ruido de cuantizacion en modelos de ~180.000 millones de parametros con modulos de vision, gracias a la mezcla de 6 y 8 bits por capa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos: aproximadamente 150 GB (tamano del repositorio 150,4 GB), con ~6,69 bits efectivos por peso.
- Memoria unificada necesaria: mas de 150 GB; el autor indica explicitamente que se requiere un Mac con mas memoria unificada que esa, por ejemplo 192 GB.
- Compatibilidad: el formato MLX safetensors esta orientado a Apple Silicon (MLX / mlx-lm). No se documenta soporte para CUDA ni ROCm de forma nativa.
- GPU recomendadas: no disponible para MLX. Para una eventual conversion a otros formatos, serian necesarios varios aceleradores de memoria agregada superior a 150 GB (por ejemplo, varias GPU de 80 GB), pero este dato no esta confirmado en la informacion proporcionada.
- Cabe en GPU de consumo: no. El modelo no cabe en ninguna GPU consumer actual (maximos de 24-32 GB por tarjeta) ni en configuraciones multi-GPU de gama de consumo.
- Opciones de despliegue: MLX (mlx-lm) y la herramienta oMLX/oQ con la que se genero. No se documentan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Bits efectivos | Tamano | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| d9beuD/Qwen3.8-Flash-Next-oQ6-mtp | ~180.000 millones | ~6,69 | 150,4 GB | MLX safetensors | Qwen Community License 1.0 | 0 descargas, 0 likes |
| Qwen/Qwen3.8-Flash-Next (base) | ~180.000 millones (equivalente) | bf16 (16 bits) | no disponible | no disponible | Qwen Community License 1.0 | modelo base oficial |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | no disponible | 4 bits (nivel oQ4e) | no disponible | MLX safetensors | Qwen Community License 1.0 | variante citada como referencia de calibracion |

No se dispone de datos de rendimiento de ninguna de las variantes para comparar calidad o velocidad.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo entrenado desde cero: la perdida de calidad respecto al checkpoint bf16 no esta cuantificada y no se publican benchmarks.
- El mapa de sensibilidad se calibro sobre un modelo ya cuantizado a 4 bits (Jundot/Qwen3.8-Flash-Next-oQ4e-mtp) y sobre un conjunto de calibracion centrado en codigo multilingue, lo que puede sesgar la asignacion de bits hacia ese dominio y penalizar otros.
- La calibracion fue limitada en tamano (128 muestras x 256 tokens), lo que reduce la representatividad del ajuste.
- Requiere mas de 150 GB de memoria unificada, lo que restringe su uso a equipos Apple de gama muy alta (192 GB o superior); no es desplegable en GPU de consumo.
- El formato MLX safetensors limita la portabilidad: no se documentan rutas de despliegue en vLLM, llama.cpp, Ollama o TGI.
- Licencia Qwen Community License 1.0 (etiquetada como "other" en HF): es una licencia comunitaria con posibles restricciones de uso comercial que deben revisarse en el texto completo antes de cualquier explotacion en produccion.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan tasas ni evaluaciones.
- Capacidades multilingues, de tool calling y de agente no confirmadas en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion externa de su funcionamiento ni de su calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d9beuD/Qwen3.8-Flash-Next-oQ6-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante usada para calibracion: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- Herramienta de cuantizacion oQ / oMLX: https://github.com/jundot/omlx
- Licencia (LICENSE del repositorio): https://huggingface.co/d9beuD/Qwen3.8-Flash-Next-oQ6-mtp/blob/main/LICENSE
