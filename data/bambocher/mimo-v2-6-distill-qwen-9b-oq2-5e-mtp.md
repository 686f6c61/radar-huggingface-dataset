# bambocher/MiMo-V2.6-Distill-Qwen-9B-oQ2.5e-mtp

## Resumen

MiMo-V2.6-Distill-Qwen-9B-oQ2.5e-mtp es una cuantización mixta del modelo bambocher/MiMo-V2.6-Distill-Qwen-9B, un modelo destilado de 9.653 millones de parámetros construido sobre la arquitectura Qwen 3.5. La cuantización la ha realizado el usuario bambocher mediante la herramienta oQ (oMLX v0.7.3), que aplica precisión mixta por tensor en lugar de un único ancho de bits uniforme. El checkpoint resultante ocupa 4,585 GiB y tiene un promedio efectivo de 4,080 bits por peso, lo que lo hace viable en equipos Apple Silicon con memoria unificada moderada.

El modelo conserva tres componentes diferenciados: el modelo de lenguaje (8.954B parámetros lógicos), un codificador visual (0.456B) y una cabeza MTP (Multi-Token Prediction, 0.243B). La presencia de visión y de cabeza MTP indica que el modelo base está diseñado para tareas multimodales y para decodificación especulativa con predicción de múltiples tokens, aunque la model card no detalla el entrenamiento original.

La relevancia de esta ficha es doble: por un lado documenta una técnica de cuantización no uniforme que asigna 2 bits a los tensores menos sensibles y hasta 16 bits (BF16) a una fracción pequeña del checkpoint; por otro, advierte de que se trata de un artefacto derivado de un modelo base de autoría comunitaria, sin licencia declarada ni benchmarks publicados, lo que limita su uso en producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen 3.5 (tag `qwen3_5`), con codificador visual y cabeza MTP |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: affine 2-bit grupo 64, affine 3-bit grupo 128, affine 3-bit grupo 64, affine 4-bit grupo 64, affine 5-bit grupo 64 y BF16; promedio efectivo 4,080 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `mlx`) |

Desglose de la distribución de bits declarado por el autor:

| Formato de almacenamiento | Pesos lógicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 2-bit, grupo 64 | 2,606B | 26,992% | 0,758 GiB | 2,50 |
| Affine 3-bit, grupo 128 | 3,910B | 40,508% | 1,479 GiB | 3,25 |
| Affine 3-bit, grupo 64 | 1,017B | 10,537% | 0,414 GiB | 3,50 |
| Affine 4-bit, grupo 64 | 0,210B | 2,173% | 0,110 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 1,420B | 14,708% | 0,909 GiB | 5,50 |
| BF16 | 0,491B | 5,083% | 0,914 GiB | 16,00 |
| **Total** | **9,653B** | **100%** | **4,585 GiB** | **4,080** |

Desglose por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 3,826 GB / 3,563 GiB |
| Visión | 0,456B | 0,912 GB / 0,849 GiB |
| Cabeza MTP | 0,243B | 0,185 GB / 0,172 GiB |
| **Total** | **9,653B** | **4,923 GB / 4,585 GiB** |

## Arquitectura y entrenamiento

La información disponible no describe el entrenamiento del modelo base, solo su linaje arquitectónico. El tag `qwen3_5` sitúa el modelo en la familia Qwen 3.5, y los parámetros totales (9,653B) junto con la distribución por componentes confirman una arquitectura transformer con tres bloques funcionales: un modelo de lenguaje de 8,954B parámetros, un codificador visual de 0,456B y una cabeza de predicción multi-token (MTP) de 0,243B. La cabeza MTP es un componente típico de decodificación especulativa: predice varios tokens por paso y permite acelerar la generación cuando se combina con un verificador.

El proceso de cuantización sí está documentado. Se ha aplicado oQ (oMLX v0.7.3), una herramienta de cuantización de precisión mixta que asigna anchos de bits distintos por tensor según su sensibilidad. El resultado es un checkpoint híbrido: el 26,992% de los pesos lógicos quedan en 2 bits (grupo 64), el 51,045% en 3 bits (grupos 64 y 128), el 2,173% en 4 bits, el 14,708% en 5 bits y solo el 5,083% se mantiene en BF16. Los tensores en BF16 (0,491B parámetros) probablemente corresponden a capas de normalización, embeddings o cabezas críticas para la estabilidad numérica, aunque la model card no lo especifica. No se declaran datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un LLM de 8,954B parámetros con arquitectura Qwen 3.5, orientado a tareas de lenguaje general.
- Procesamiento de visión: incluye un codificador visual de 0,456B parámetros, por lo que el modelo base es multimodal (imagen + texto), aunque la model card no detalla tareas concretas de visión.
- Predicción multi-token (MTP): la cabeza de 0,243B parámetros habilita decodificación especulativa, lo que puede aumentar el throughput de generación en entornos MLX.
- Destilación: el nombre del modelo base indica que es un modelo destilado, presumiblemente a partir de un MiMo-V2.6 de mayor tamaño, aunque no se especifica el profesor ni el método.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint de 4,585 GiB cabe en equipos con 16 GB de memoria unificada, lo que permite ejecutar un modelo de ~9,6B parámetros con visión en un MacBook Pro o Mac Studio sin GPU dedicada, usando MLX.
- Prototipado de aplicaciones multimodales: el codificador visual integrado permite experimentar con tareas imagen-texto en local antes de escalar a un modelo mayor o a un servicio en la nube.
- Evaluación de cuantización mixta: el modelo sirve como caso de estudio para comparar la calidad de oQ frente a cuantizaciones uniformes de 4 bits (GPTQ, AWQ) en un mismo modelo base, midiendo la degradación por perplejidad o por benchmarks propios.
- Aceleración con decodificación especulativa: la cabeza MTP incluida permite probar pipelines de generación especulativa en MLX y medir la ganancia de throughput frente a la decodificación autorregresiva estándar.
- Destilación y fine-tuning sobre un modelo pequeño: al ser un modelo destilado de 9,6B, es un punto de partida razonable para fine-tuning con LoRA en tareas de dominio específico cuando el presupuesto de cómputo es limitado.
- Investigación sobre cuantización extrema: la mezcla de 2, 3, 4, 5 bits y BF16 en un mismo checkpoint permite estudiar qué capas toleran 2 bits y cuáles requieren mayor precisión, un dato útil para diseñar esquemas de cuantización propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: 4,585 GiB de pesos en disco; en ejecución, MLX necesita además memoria para el grafo de activaciones y la caché KV, por lo que se recomienda un mínimo de 8 GB de memoria unificada y, de forma realista, 16 GB para contextos largos.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son los chips de Apple (series M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No es un checkpoint utilizable directamente en CUDA sin conversión.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con 16 GB o más de memoria unificada. No está pensado para GPUs NVIDIA de consumo en su formato actual.
- Opciones de despliegue: MLX (librería declarada) y oMLX; no se declara compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el formato de cuantización oQ es específico de oMLX, por lo que la conversión a GGUF requeriría de-cuantizar y re-cuantizar.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Visión | MTP |
|---|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-oQ2.5e-mtp | 9,653B | no disponible | safetensors MLX (oQ mixto) | no disponible | sí | sí |
| bambocher/MiMo-V2.6-Distill-Qwen-9B (base) | 9,653B (presumible) | no disponible | safetensors | no disponible | presumible | presumible |
| Qwen 3.5 de ~9B (familia de referencia) | ~9B | no disponible | safetensors, GGUF | según variante | según variante | no disponible |

La comparativa con alternativas comerciales o de gran comunidad (Qwen oficial, Llama, Gemma) no puede completarse con datos verificados: no se dispone de benchmarks ni de especificaciones de contexto del modelo base, y la licencia no está declarada, lo que impide comparar condiciones de uso.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica bajo qué términos puede usarse el modelo, lo que impide confirmar si se permite uso comercial. Es un bloqueo para producción.
- Modelo derivado de autoría comunitaria: el modelo base (bambocher/MiMo-V2.6-Distill-Qwen-9B) no procede de un laboratorio con documentación publicada; no hay garantías de calidad ni de procedencia de los datos de entrenamiento.
- Sin benchmarks: no hay evidencia publicada sobre MMLU, HumanEval, GSM8K ni tareas multimodales, por lo que la degradación introducida por la cuantización mixta es desconocida.
- Cuantización agresiva en parte del checkpoint: el 26,992% de los pesos lógicos están en 2 bits, lo que puede degradar tareas sensibles a la precisión numérica (matemáticas, código, razonamiento de varios pasos) de forma no uniforme.
- Riesgo de alucinación: inherente a los LLM de este tamaño; no hay evaluación publicada que lo cuantifique.
- Idiomas no declarados: no se puede confirmar el soporte de castellano ni de otros idiomas distintos del inglés.
- Contexto desconocido: sin longitud de contexto declarada, no se puede planificar su uso en tareas de contexto largo.
- Dependencia de MLX/oMLX: el formato de cuantización oQ no es portable a otros runtimes sin conversión; esto limita el despliegue en servidores con GPU NVIDIA.
- Sesgos: no documentados; al desconocerse la composición del dataset de entrenamiento, no se pueden anticipar sesgos de género, idioma o dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/MiMo-V2.6-Distill-Qwen-9B-oQ2.5e-mtp
- Modelo base: https://huggingface.co/bambocher/MiMo-V2.6-Distill-Qwen-9B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
