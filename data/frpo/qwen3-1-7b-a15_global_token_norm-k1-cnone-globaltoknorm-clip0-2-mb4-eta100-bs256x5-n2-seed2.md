# FRPO/qwen3-1.7b-a15_global_token_norm-k1-cNone-globalTokNorm-clip0.2-mb4-eta100-bs256x5-n2-seed2

## Resumen

Este repositorio contiene un checkpoint de fine-tuning por aprendizaje por refuerzo (RL) del modelo Qwen/Qwen3-1.7B, entrenado con el framework verl y el método FRPO (dentro de la línea de experimentos KL-in-LLM-RL). El autor es FRPO, y el nombre del repositorio codifica la configuración exacta del entrenamiento (a15, global_token_norm, k1, cNone, globalTokNorm, clip0.2, mb4, eta100, bs256x5, n2, seed2). Se trata de un checkpoint experimental, subido tal cual lo guardó el entrenador, sin post-procesamiento ni cuantización, en pesos fp32.

El modelo base, Qwen3-1.7B, es un transformer denso de 1.700 millones de parámetros con una ventana de contexto de 32K tokens, entrenado por Alibaba para razonamiento, código y soporte multilingüe. Este fine-tuning busca ajustar el comportamiento del modelo mediante RL, probablemente para mejorar la adherencia a instrucciones o la calidad del razonamiento, aunque no se especifican los objetivos concretos del entrenamiento.

La relevancia de este checkpoint radica en que forma parte de experimentos abiertos sobre métodos de RL con regularización KL dentro del propio modelo (KL-in-LLM-RL), una línea de investigación activa. Al ser un checkpoint de investigación, no está pensado para uso productivo directo, sino para análisis y reproducción de experimentos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen/Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 (según safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en el repositorio (el modelo base Qwen3-1.7B soporta 32K) |
| Tipos de cuantizacion | No disponible (pesos en fp32, sin cuantizar) |
| Idiomas soportados | No disponibles (heredados del modelo base, multilingüe) |
| Licencia | No disponible |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning por RL del transformer denso Qwen3-1.7B. La arquitectura base es un decoder-only con atención estándar, 28 capas, 16 cabezas de atención y dimensiones ocultas de 2048 (según la configuración pública de Qwen3-1.7B). El entrenamiento de RL se realizó con verl, un framework de entrenamiento de RL a gran escala, y el método FRPO, que según la model card pertenece a los experimentos "KL-in-LLM-RL". No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas adicionales como DPO o PPO. El nombre del repositorio codifica hiperparámetros como el ratio de aprendizaje (eta100), tamaño de batch (bs256x5), número de pasos (n2), y una normalización global de tokens (global_token_norm) con clip en 0.2. El checkpoint incluido corresponde al paso global 200.

## Capacidades

- Generación de texto: hereda la capacidad de Qwen3-1.7B para generar texto coherente y contextualizado.
- Razonamiento: el modelo base incluye modo de pensamiento (thinking mode) para tareas de razonamiento multi-paso; el fine-tuning por RL puede haber ajustado esta capacidad.
- Código: Qwen3-1.7B está entrenado para generación de código en múltiples lenguajes.
- Multilingüismo: el modelo base soporta más de 100 idiomas; este checkpoint hereda esa capacidad.
- Tool calling: el modelo base soporta function calling, aunque no se confirma si el fine-tuning lo mantiene.
- No se documentan capacidades específicas añadidas por el RL (como mejoras en seguimiento de instrucciones o reducción de alucinaciones) en la información disponible.

## Casos de uso

- Investigación en métodos de RL: este checkpoint es útil para reproducir y analizar el comportamiento del método FRPO con regularización KL en un modelo pequeño, comparando con el modelo base.
- Evaluación de políticas de RL: permite estudiar cómo el entrenamiento por refuerzo altera la distribución de respuestas y la calibración de la confianza.
- Fine-tuning adicional: puede servir como punto de partida para experimentos de RL iterativos o para combinar con otras técnicas de alineación.
- Benchmarking de frameworks: al estar entrenado con verl, sirve para validar despliegues de inferencia con text-generation-inference o FriendliAI.
- Pruebas de robustez: al ser un checkpoint sin post-procesamiento, permite evaluar el efecto del RL en la estabilidad numérica (pesos fp32).
- Docencia y divulgación: como ejemplo de un artefacto de RL open source, útil en cursos sobre alineación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este checkpoint específico.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 8,1 GB solo para los pesos (2.031.739.904 parámetros × 4 bytes). Con overhead de activaciones y KV cache, se recomiendan al menos 12 GB de VRAM.
- GPU recomendadas: RTX 3090, RTX 4090, A100 (40 GB) o superiores. En cuantización a 8 bits (no disponible en este repo) cabría en GPUs de 8 GB.
- No cabe en GPUs consumer de gama baja (menos de 8 GB) sin cuantización.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI, o FriendliAI (como aparece en la búsqueda web). También es compatible con llama.cpp si se convierte a GGUF, aunque no se proporcionan pesos cuantizados.
- Latencia y throughput: no disponibles; dependen del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con alternativas. Como referencia estructural, se puede comparar con el modelo base Qwen3-1.7B y con otros modelos de tamaño similar:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| FRPO/qwen3-1.7b-a15 (este) | 2,03B (fp32) | No especificada | No disponible | Checkpoint RL experimental |
| Qwen/Qwen3-1.7B | 1,7B | 32K | Apache 2.0 | Modelo base original |
| Qwen/Qwen2.5-1.5B | 1,5B | 32K | Apache 2.0 | Generación anterior |
| Llama-3.2-1B | 1,2B | 128K | Llama 3.2 | Alternativa de Meta |

La comparación de rendimiento no es posible sin benchmarks.

## Limitaciones y advertencias

- Checkpoint experimental: no ha sido evaluado ni optimizado para producción; puede presentar comportamientos inestables o degradados respecto al modelo base.
- Sin post-procesamiento: los pesos están en fp32 tal cual los guardó el entrenador; no se ha aplicado cuantización ni fusión de capas.
- Licencia no disponible: no se especifica la licencia de uso, lo que impide determinar si es apto para uso comercial.
- Datos de entrenamiento desconocidos: no se informa sobre el dataset de RL, por lo que pueden existir sesgos no documentados.
- Riesgo de alucinación: inherente a los modelos de lenguaje, no mitigado específicamente en este checkpoint.
- Contexto limitado: aunque el modelo base soporta 32K, no se confirma que el fine-tuning mantenga esa longitud; se recomienda probar antes de usar.
- Sin garantías de calidad: al ser un artefacto de investigación, no se recomienda su uso en aplicaciones críticas sin una evaluación exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FRPO/qwen3-1.7b-a15_global_token_norm-k1-cNone-globalTokNorm-clip0.2-mb4-eta100-bs256x5-n2-seed2
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Technical report de Qwen3: https://arxiv.org/html/2505.09388v1
- Página de despliegue en FriendliAI: https://friendli.ai/models/FRPO/qwen3-1.7b-a15_global_token_norm-k1-cNone-globalTokNorm-clip0.2-mb4-eta100-bs256x5-n2
