# FRPO/qwen3-1.7b-a4_center-k1-cGroupBoth-clip0.2-mb4-eta100-bs256x5-n2

## Resumen

Este modelo es un checkpoint de fine-tuning con aprendizaje por refuerzo (RL) del modelo base `Qwen/Qwen3-1.7B`, desarrollado por el usuario FRPO dentro de los experimentos denominados "KL-in-LLM-RL" y "FRPO". El entrenamiento se realizó con el framework `verl` de Volcengine, y el repositorio contiene los pesos correspondientes al paso global 200, guardados en formato `safetensors` en precisión fp32 sin ningún post-procesamiento. El nombre del repositorio codifica la configuración del experimento (a4_center, k1, cGroupBoth, clip0.2, mb4, eta100, bs256x5, n2), que hace referencia a hiperparámetros del algoritmo RL, como el factor de clipping, el tamaño de lote o el número de nodos de entrenamiento.

El interés de este checkpoint radica en que forma parte de una línea de investigación sobre la incorporación de control de divergencia KL dentro del proceso de RL para LLMs. Al estar basado en Qwen3-1.7B, hereda la arquitectura transformer de dicho modelo, aunque el fine-tuning con RL puede haber alterado su comportamiento de forma no documentada. Es un modelo pensado para la experimentación y reproducción de resultados académicos, más que para su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen/Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 (aprox. 2,03 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | No disponible (solo se publican pesos fp32) |
| Idiomas soportados | No disponible (heredados de Qwen3-1.7B, no confirmados) |
| Licencia | No disponible |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning con RL del checkpoint `Qwen/Qwen3-1.7B`, un transformer decoder-only de aproximadamente 1,7 mil millones de parámetros activos. El entrenamiento se llevó a cabo con el framework `verl`, especializado en RL para LLMs, y forma parte de la serie de experimentos "KL-in-LLM-RL" y "FRPO". El nombre del repositorio codifica la configuración del run: `a4_center` (posiblemente alpha=4 con centrado), `k1` (K=1), `cGroupBoth` (clipping aplicado a ambos grupos), `clip0.2` (factor de clipping 0,2), `mb4` (mini-batch de 4), `eta100` (tasa de aprendizaje 100, o 1e-2), `bs256x5` (batch size 256 multiplicado por 5) y `n2` (2 nodos). No se proporcionan detalles sobre el dataset utilizado, la función de recompensa ni el método RL exacto. Los pesos se guardan en fp32, tal como los generó el entrenador, sin cuantización ni conversión.

## Capacidades

- Generación de texto: al estar basado en Qwen3-1.7B, el modelo puede generar texto coherente en múltiples dominios, aunque el RL puede haber sesgado su estilo o comportamiento.
- Razonamiento y conversación: el modelo base soporta tareas de razonamiento y diálogo multi-turno; estas capacidades podrían estar presentes, pero no hay evidencia documentada para este checkpoint concreto.
- Soporte de tool calling y funciones: no se ha confirmado que el fine-tuning con RL preserve estas capacidades del modelo base.
- Capacidades multilingües: no se ha confirmado qué idiomas mantiene tras el RL.
- Capacidades especiales: no se documenta ningún modo de pensamiento, visión o audio.

Dado que no se ha publicado ninguna evaluación específica, todas las capacidades listadas son hipotéticas y deben verificarse experimentalmente.

## Casos de uso

- Investigación en RL para LLMs: el modelo sirve como punto de partida para analizar el efecto del control de divergencia KL en el comportamiento de un LLM de tamaño medio. Se puede comparar con el modelo base y con otros checkpoints de la misma serie.
- Reproducción de experimentos: los pesos fp32 exactos permiten reproducir los resultados del paso 200 y estudiar la dinámica del entrenamiento.
- Fine-tuning adicional: el checkpoint puede usarse como inicialización para nuevos experimentos de RL o para fine-tuning supervisado en tareas concretas.
- Análisis de la divergencia KL: al estar entrenado con una técnica que incorpora KL en el RL, es útil para estudiar cómo varía la distribución de salida respecto al modelo base.
- Evaluación de robustez: se puede probar la estabilidad del modelo ante perturbaciones en los prompts, comparándola con la del modelo base.
- Desarrollo de agentes conversacionales experimentales: aunque no está optimizado para producción, puede servir para prototipar asistentes que requieran control de la desviación respecto a un modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, el modelo ocupa aproximadamente 8,1 GB (2.031.739.904 parámetros × 4 bytes). Se recomienda una GPU con al menos 12 GB de VRAM para cargar el modelo y dejar margen para la memoria de activaciones.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A10, A100 o superiores. También puede ejecutarse en GPUs con 16 GB o más.
- En consumer GPU: sí, una RTX 3090 o 4090 puede ejecutar el modelo en fp32. Para GPUs con menos VRAM (por ejemplo, 8 GB), sería necesario cuantizar a int8 o int4, aunque no se proporcionan pesos cuantizados.
- Opciones de despliegue: al ser un modelo de `transformers`, puede servirse con vLLM, Text Generation Inference (TGI) o directamente con la librería `transformers`. El repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con plataformas de inferencia gestionada.
- Latencia y throughput: no disponible. Dependerá del hardware y del backend utilizado.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría. Como referencia cualitativa, se puede comparar con el modelo base `Qwen/Qwen3-1.7B`, del cual se diferencia únicamente por el fine-tuning con RL. Otros modelos de tamaño similar (por ejemplo, Llama-3.2-1B, Gemma-2-2B) podrían servir como alternativas, pero no se han publicado comparaciones con este checkpoint.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3-1.7B (base) | ~1,7B | No disponible | Apache 2.0 (según modelo base) | HuggingFace |
| FRPO/qwen3-1.7b-a4_center... (este modelo) | ~2,03B (incluye pesos fp32) | No disponible | No disponible | HuggingFace |
| Llama-3.2-1B | 1,23B | 128K | Llama 3.2 Community License | HuggingFace |

## Limitaciones y advertencias

- No se ha documentado ningún análisis de sesgos, alucinaciones o comportamiento tóxico. El fine-tuning con RL puede amplificar o reducir estos problemas de forma impredecible.
- El modelo es un checkpoint de investigación, no un producto final. No ha sido sometido a pruebas de robustez ni de seguridad.
- Los pesos están en fp32 y ocupan 8,1 GB, lo que puede ser ineficiente para producción sin cuantización.
- No se especifica la licencia del modelo, lo que impide su uso comercial sin aclaración previa.
- El nombre del repositorio codifica una configuración experimental concreta; no hay garantía de que el modelo funcione bien fuera del contexto del experimento.
- No se han publicado resultados de benchmarks, por lo que su rendimiento en tareas estándar es desconocido.
- La fecha de creación (2026-08-15) es posterior a la fecha de muchos modelos conocidos, pero no se dispone de información sobre el dataset de entrenamiento ni el método RL exacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FRPO/qwen3-1.7b-a4_center-k1-cGroupBoth-clip0.2-mb4-eta100-bs256x5-n2
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Framework verl: https://github.com/volcengine/verl
