# bambocher/Qwen3.5-9B-heretic-oQ2.7-mtp

## Resumen

Qwen3.5-9B-heretic-oQ2.7-mtp es una cuantizacion mixta de precisión del modelo Qwen3.5-9B en su variante "heretic", publicada por el usuario bambocher en Hugging Face. El checkpoint resultante tiene 9.653.104.368 parámetros lógicos y ocupa 4,974 GB en disco, con una media efectiva de 4,123 bits por peso. La cuantizacion se ha realizado con oQ (oMLX v0.7.3), una herramienta de cuantizacion de precisión mixta orientada al ecosistema MLX de Apple Silicon.

El modelo conserva tres componentes diferenciados: el modelo de lenguaje (8.954B parámetros lógicos, 3,877 GB), un codificador de visión (0.456B parámetros, 0,912 GB) y una cabeza MTP (Multi-Token Prediction) de 0,243B parámetros (0,185 GB). La presencia de visión y de cabeza MTP indica que el modelo base es multimodal y soporta decodificacion especulativa mediante predicción multi-token, aunque la model card no detalla el funcionamiento interno de estas capacidades.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo concreto de cuantizacion mixta agresiva (2 a 8 bits según tensor) que reduce un modelo de ~9,6B parámetros a menos de 5 GB; por otro, advierte de que se trata de una publicación de un tercero, sin licencia declarada, sin idiomas declarados y sin benchmarks publicados, lo que limita seriamente su uso en producción sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con cabeza MTP; pesos cuantizados con oQ (oMLX v0.7.3) |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | No aplica (no es MoE según la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta: affine 2-bit group 64, 3-bit group 128, 3-bit group 64, 4-bit group 64, 5-bit group 64, 8-bit group 64 y BF16; media efectiva 4,123 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria mlx) |

Desglose de la cuantizacion por tramos:

| Formato de almacenamiento | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 2-bit, group 64 | 2,064B | 21,378% | 0,601 GiB | 2,50 |
| Affine 3-bit, group 128 | 4,452B | 46,116% | 1,684 GiB | 3,25 |
| Affine 3-bit, group 64 | 1,017B | 10,537% | 0,414 GiB | 3,50 |
| Affine 4-bit, group 64 | 0,210B | 2,173% | 0,110 GiB | 4,50 |
| Affine 5-bit, group 64 | 1,420B | 14,708% | 0,909 GiB | 5,50 |
| Affine 8-bit, group 64 | 0,001B | 0,007% | 0,001 GiB | 8,50 |
| BF16 | 0,491B | 5,083% | 0,914 GiB | 16,00 |
| **Total** | **9,653B** | **100%** | **4,633 GiB** | **4,123** |

Desglose por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 3,877 GB / 3,611 GiB |
| Vision | 0,456B | 0,912 GB / 0,849 GiB |
| Cabeza MTP | 0,243B | 0,185 GB / 0,172 GiB |
| **Total** | **9,653B** | **4,974 GB / 4,633 GiB** |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Qwen3.5-9B más alla de su naturaleza transformer y de la presencia de un codificador de visión y una cabeza MTP. La cabeza MTP (Multi-Token Prediction) es un componente que permite predecir varios tokens por paso, lo que habilita tecnicas de decodificacion especulativa y puede aumentar el throughput de generacion. El codificador de visión de 0,456B parámetros confirma que el modelo base es multimodal (texto e imagen), aunque no se detalla el mecanismo de fusion de modalidades ni la resolucion de imagen soportada.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares. La variante "heretic" del nombre sugiere una version con ajustes de alineacion o de rechazo de contenido, pero la model card no lo documenta. La cuantizacion se realizo con oQ (oMLX v0.7.3), que asigna precision variable por tensor: los tensores menos sensibles se comprimen a 2 bits (21,4% de los pesos) y los mas sensibles se mantienen en 5 bits (14,7%) o BF16 (5,1%). Esta estrategia busca preservar la calidad en capas criticas (por ejemplo, atencion o embeddings) mientras reduce el tamano total.

## Capacidades

- Generacion de texto y razonamiento: el modelo base Qwen3.5-9B es un modelo de lenguaje de proposito general, aunque no se detallan capacidades especificas en la informacion disponible.
- Vision: incluye un codificador de vision de 0,456B parámetros, por lo que se espera soporte de entrada de imagenes, si bien no se documentan tareas concretas (VQA, OCR, captioning).
- Prediccion multi-token (MTP): la cabeza MTP de 0,243B parámetros habilita decodificacion especulativa, lo que puede mejorar la latencia de generacion.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Modo thinking: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta en formato MLX y ocupa menos de 5 GB, por lo que puede cargarse en un Mac con 16 GB de memoria unificada usando la libreria MLX. Es adecuado para prototipos y pruebas de concepto en local.
- Experimentacion con cuantizacion mixta: el desglose por tramos de bits permite estudiar el impacto de la precision variable por tensor en la calidad de salida, comparando con el modelo base sin cuantizar.
- Pruebas de decodificacion especulativa: la cabeza MTP incluida permite evaluar tecnicas de prediccion multi-token en un entorno MLX, midiendo el speedup frente a decodificacion autoregresiva estandar.
- Evaluacion de modelos multimodales en local: el codificador de vision permite probar tareas de imagen a texto en hardware de consumo, aunque sin garantias de calidad por la cuantizacion agresiva a 2-3 bits en parte de los pesos.
- Investigacion sobre alineacion y variantes "heretic": la variante heretic puede usarse para estudiar diferencias de comportamiento respecto al modelo base en tareas de rechazo o seguridad, siempre que se respete la licencia del modelo original (no disponible).
- Pipeline de generacion de texto de baja huella: para entornos con restricciones de memoria (por ejemplo, contenedores pequenos o dispositivos edge con MLX), el checkpoint de 4,6 GiB es viable como generador de texto, aunque la calidad puede degradarse por la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el checkpoint ocupa 4,974 GB en disco; en memoria se necesita espacio adicional para el grafo de computo y el KV cache, por lo que se recomienda al menos 8-10 GB de memoria unificada o VRAM.
- GPU recomendadas: al estar en formato MLX, esta pensado para Apple Silicon (series M1, M2, M3, M4). No se garantiza compatibilidad con CUDA sin conversion previa.
- Cabe en GPU de consumo: si, en Mac con 16 GB o mas de memoria unificada; en GPU NVIDIA consumer (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB) requeriria conversion del formato MLX a otro backend (por ejemplo, GGUF o safetensors PyTorch), no documentada en la informacion disponible.
- Opciones de despliegue: MLX (libreria declarada). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base sin cuantizar en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural:

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-heretic-oQ2.7-mtp | 9,653B | No disponible | No disponible | safetensors (MLX) | Hugging Face |
| Qwen3.5-9B (base, sin cuantizar) | ~9,65B (inferido) | No disponible | No disponible | No disponible | No disponible en la informacion |
| Alternativas de ~9B en MLX | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del checkpoint ni la del modelo base, lo que impide determinar si el uso comercial esta permitido. Es un bloqueo critico para produccion.
- Idiomas no declarados: no se puede confirmar el soporte multilingue ni la calidad en castellano.
- Cuantizacion agresiva: el 21,4% de los pesos esta a 2 bits y el 46,1% a 3 bits (group 128), lo que puede degradar la coherencia, el razonamiento y la fidelidad factual frente al modelo sin cuantizar.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la cuantizacion puede amplificarlo en tareas de conocimiento factual.
- Variante "heretic": el nombre sugiere ajustes de alineacion no documentados; el comportamiento en temas sensibles puede diferir del modelo base y no esta evaluado.
- Sin benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni de tareas multimodales, por lo que la calidad real es desconocida.
- Compatibilidad limitada: el formato MLX restringe el despliegue a Apple Silicon; no se documenta conversion a otros backends.
- Publicacion de terceros: el autor (bambocher) no es el desarrollador original de Qwen3.5; la trazabilidad y el soporte son limitados.
- Contexto desconocido: no se puede planificar el uso en conversaciones de contexto largo sin conocer la ventana real del modelo base.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-heretic-oQ2.7-mtp
- Repositorio de la herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
