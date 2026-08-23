# jacob-rojic/mirror-michael-chan-000-affine-5gbzvz7tcc-d1

## Resumen

El modelo `jacob-rojic/mirror-michael-chan-000-affine-5gbzvz7tcc-d1` es un fine-tune del modelo base `vera6/affine-5g4yy75zuz-t6`, desarrollado por el usuario jacob-rojic. Se trata de un modelo de generación de texto con arquitectura `qwen3_5_moe` (Mixture of Experts basada en Qwen 3.5) y 35.107.197.936 parámetros, orientado a un propósito muy específico: participar como candidato en el desafío de minería Affine, optimizando una métrica de razonamiento denominada Reason v4. No es un modelo de chat general, sino un checkpoint de competición entrenado mediante offline DPO para maximizar la calidad de razonamiento en duelos de evaluación.

La relevancia de este modelo radica en que representa una iteración del pipeline de entrenamiento del proyecto Affine, donde se busca superar al modelo base (el "rey" actual) mediante ajustes finos de LoRA y preferencias de razonamiento. El autor reporta una victoria sobre el modelo base con un margen estadísticamente significativo (z=2.177), lo que lo convierte en un candidato legítimo para la siguiente fase del desafío. Su licencia es Apache 2.0, aunque su uso práctico queda restringido al contexto del desafío.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_moe (Mixture of Experts, basada en Qwen 3.5) |
| Parámetros totales | 35.107.197.936 (≈35B) |
| Parámetros activos | no disponible (arquitectura MoE, pero no se especifica el número de expertos activos) |
| Longitud de contexto | 12288 (máximo de entrenamiento según hiperparámetros) |
| Tipos de cuantización | no disponible (el repositorio contiene safetensors en BF16, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `vera6/affine-5g4yy75zuz-t6@8e3f1695e058837ed80fec3238ff439fdc2d0f0e`, que actúa como modelo base. La arquitectura subyacente es `qwen3_moe`, un transformer con mezcla de expertos de la familia Qwen 3.5. El entrenamiento se realizó con **offline DPO** (Direct Preference Optimization) sobre pares de duelos de razonamiento previamente clasificados por la métrica Reason v4. No se empleó SFT ni GRPO online.

Los hiperparámetros clave del entrenamiento incluyen LoRA con r=32 y α=128, un beta de 0.1, una tasa de aprendizaje extremadamente baja de 5e-7, longitud máxima de 12288 tokens, 19200 pasos y 4 épocas. El entrenamiento se llevó a cabo en 8 GPUs B200 (parte del clúster "Lium mine-crown-1"). El objetivo era optimizar la preferencia por razonamientos que aumenten la puntuación Reason del profesor, usando una técnica de log-mean-exp con 3 referencias de profesor y temperatura τ=0.03.

## Capacidades

- Generación de texto con énfasis en razonamiento multi-step, optimizado específicamente para la métrica Reason v4.
- Capacidad de seguir instrucciones de razonamiento complejas, aunque no es un modelo de chat general.
- Soporte de tool calling y function calling: no disponible (no se menciona en la documentación).
- Capacidades de agentes y razonamiento multi-paso: limitadas al contexto del desafío Affine, no generalizable a tareas cotidianas.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: está diseñado para ser evaluado en duelos de Reason v4, no para uso conversacional estándar.

## Casos de uso

- **Evaluación de modelos de razonamiento en desafíos de minería**: el modelo se usa como candidato en el ranking de Affine, donde se compara con el modelo base y otros participantes en duelos de razonamiento.
- **Investigación en optimización de preferencias de razonamiento**: sirve como ejemplo de aplicación de DPO offline para mejorar la calidad de razonamiento en modelos MoE de gran tamaño.
- **Referencia para comparación de técnicas de entrenamiento**: se puede usar como punto de comparación para experimentos de LoRA con diferentes hiperparámetros (α, β, lr) en el mismo dominio.
- **Estudio de la métrica Reason v4**: útil para investigar cómo la selección de pensamientos (filler vs. committed) afecta a la calidad del razonamiento.
- **Desarrollo de modelos de competición en entornos con recursos limitados**: el enfoque de LoRA con lr muy bajo y DPO offline puede ser replicado para otros dominios.
- **Evaluación de la escalabilidad de métodos de preferencia**: dado que el modelo es de 35B parámetros, puede servir para estudiar el comportamiento de DPO en modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento es la comparación interna con el modelo base bajo la métrica Reason v4:

| Métrica | Valor |
|---|---|
| Margen vs. modelo base | +0.003665 |
| Error estándar | 0.001684 |
| z-score | 2.177 |
| Tamaño de muestra (n) | 80 |
| Barra de aceptación (max(2·SE, δ=0.002)) | 0.003367 |
| Ratio vs. barra | 1.088× |

Este resultado indica una victoria estadísticamente significativa sobre el modelo base, pero no hay datos de rendimiento en tareas generales de NLP.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 70 GB (tamaño del repositorio en safetensors), más overhead de inferencia; se recomienda GPU con 80 GB o más.
- GPUs recomendadas: NVIDIA A100 (80GB), H100 (80GB), B200 (80GB) o similares de centro de datos.
- No cabe en GPUs de consumo: una RTX 4090 (24GB) o RTX 3090 (24GB) no tienen suficiente memoria.
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), o servidores de inferencia que soporten modelos MoE grandes. No hay soporte documentado para llama.cpp u Ollama.
- Latencia y throughput: no disponibles; dependen del hardware y del número de expertos activos.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| jacob-rojic/mirror-michael-chan-025-affine-4gbzvz7tcc-d4 (este modelo) | 35.1B | qwen3_moe | 12288 | Apache 2.0 | Fine-tune DPO, para desafío Affine |
| vera6/affine-5g4yy75zuz-t6 (base) | no disponible | qwen3_moe | no disponible | no disponible | Modelo base, "king" actual |
| michael-chan-000/affine-5EqWIK8McUc-h1 | 36B | qwen3_moe | no disponible | no disponible | Modelo similar del mismo desafío |

No hay datos de rendimiento comparativos entre estos modelos en benchmarks estándar.

## Limitaciones y advertencias

- **No es un modelo de chat general**: está optimizado para el desafío Affine y no produce respuestas útiles en conversaciones cotidianas.
- **Sesgos y alucinaciones**: no se han evaluado; al ser un modelo de competición, su comportamiento fuera del contexto de Reason es desconocido.
- **Riesgo de sobreajuste**: el entrenamiento se realizó sobre un conjunto de datos muy específico (duelos de razones), por lo que su generalización a otros dominios es limitada.
- **Restricciones de uso**: la licencia Apache 2.0 permite uso comercial, pero el modelo está diseñado para el contexto Affine, por lo que su uso fuera de ese ámbito puede no ser productivo.
- **Dependencia del modelo base**: al ser un fine-tune, hereda las limitaciones y sesgos de `vera6/affine-5g4yy75z7us-t6`, que no están documentados.
- **Tamaño y despliegue**: requiere infraestructura de centro de datos, no es accesible para desarrolladores con GPUs de consumo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/jacob-rojic/mirror-michael-chan-025-aff4-4b4zvz7tcc-d4)
- [Modelo base vera6/affine-5g4yy75z7us-t6](https://huggingface.co/vera6/affine-5g4yy75z7us-t6)
- [Modelo similar de michael-chan-000](https://huggingface.co/michael-chan-000/affine-5EqYq8McUc-h1)

Nota: no se han encontrado papers, repositorios de código ni demos adicionales en la búsqueda web.
