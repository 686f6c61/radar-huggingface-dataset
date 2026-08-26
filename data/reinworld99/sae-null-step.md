# reinworld99/sae-null-step

## Resumen

El modelo `reinworld99/sae-null-step` es un artefacto de investigación asociado al artículo *Retraining Is the Confound: A Null-Step Calibration for Sparse-Autoencoder Feature Drift Across Fine-Tuning Checkpoints*. Lo desarrolla un autor anónimo (en revisión doble ciego) y su propósito es aislar el efecto del reentrenamiento en la deriva de features observada en sparse autoencoders (SAE) cuando se ajustan sobre checkpoints de fine-tuning de un modelo de lenguaje. El problema que resuelve es metodológico: cuando se entrena un SAE en cada checkpoint de fine-tuning, el cambio en la base de representación se confunde con el cambio en el propio SAE. El "null step" consiste en reentrenar el SAE base bajo la misma receta sobre activaciones del modelo base congelado, de modo que cualquier deriva producida se atribuya únicamente al reentrenamiento.

El repositorio contiene 112 SAEs de checkpoint distribuidos en 5 cadenas de fine-tuning (SFT, PPO flexible, PPO estricto, PPO high-KL y PPO shuffled-label) sobre 4 capas (6, 12, 18, 23) del modelo base Qwen/Qwen2.5-0.5B-Instruct, más los pesos del control null step, trayectorias null, réplicas controladas y lentes sintonizadas. El tamaño total es de 14,2 GB. Se distribuye bajo licencia Apache 2.0 y el pipeline es de extracción de características (feature-extraction). Su relevancia actual radica en que ofrece una metodología reproducible para medir la deriva de features en SAE, un área clave en interpretabilidad de modelos de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder (TopK y JumpReLU) sobre capas del modelo base Qwen/Qwen2.5-0.5B-Instruct |
| Parametros totales | no disponible (el repositorio incluye decoders de [7168, 896] para la capa 18, y otros tamaños según capa) |
| Parametros activos | no disponible (no aplica, no es MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de extracción de features) |
| Tipos de cuantizacion | no disponible (no se proporcionan pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se mencionan archivos de pesos, pero no se especifica extensión; probablemente .pt o .safetensors) |

## Arquitectura y entrenamiento

El modelo es un sparse autoencoder (SAE) entrenado sobre las activaciones de capas específicas (6, 12, 18, 23) del modelo base Qwen2.5-0.5B-Instruct. Se emplean dos variantes de arquitectura: TopK y JumpReLU, con un número de features latentes k=64 para la mayoría de capas y k=256 para la capa 23. El entrenamiento se realiza con warm-start desde el SAE del checkpoint anterior, siguiendo una receta estándar de SAE. El método de "null step" consiste en reentrenar el SAE base bajo la misma receta sobre activaciones del modelo base congelado, de modo que cualquier deriva de features producida por el reentrenamiento se pueda identificar y restar de la deriva observada en los checkpoints reales.

Los datos de entrenamiento son activaciones generadas a partir del modelo base y el dataset GSM8K, que se regeneran a partir del código del repositorio. No se menciona el uso de RLHF o DPO; el fine-tuning de los checkpoints se realiza mediante SFT y PPO, pero el SAE se entrena sobre las activaciones de esos checkpoints. La innovación técnica principal es el control de null-step y la metodología para aislar el efecto de reentrenamiento, así como la documentación completa de hiperparámetros y logs en `run_metadata/`.

## Capacidades

- Extracción de features latentes: permite identificar y analizar features aprendidas por el modelo base en capas intermedias, con la posibilidad de medir su deriva a lo largo del fine-tuning.
- Medición de deriva de features: mediante el cálculo de métricas como cosenos por pares entre decodificadores, fracción de muertos y l0 medio, se puede cuantificar cómo cambian las features entre checkpoints.
- Reproducibilidad: incluye scripts que regeneran todas las tablas y métricas del paper a partir de los pesos y los datos.
- Soporte de arquitecturas alternativas: incluye réplicas con TopK y JumpReLU, lo que permite comparar la robustez de las conclusiones ante cambios de arquitectura.
- No es un modelo generativo: no produce texto, código ni imágenes; su pipeline es `feature-extraction`.

## Casos de uso

- Investigación en interpretabilidad: permite a investigadores estudiar cómo cambian las features internas de un modelo de lenguaje durante el fine-tuning, identificando qué features son estables y cuáles se desplazan.
- Análisis de alineación: usar el SAE para monitorizar la aparición de features no deseadas o la pérdida de features originales durante el entrenamiento con RLHF.
- Evaluación de la estabilidad de representaciones: en entornos de producción donde se actualiza un modelo, se puede usar el null-step para distinguir si los cambios en las features se deben al fine-tuning o al reentrenamiento del SAE.
- Comparación de métodos de interpretabilidad: como referencia para validar otros métodos de seguimiento de features (por ejemplo, lentes de tunel, intervenciones causales).
- Auditoría de modelos: para verificar si un modelo fine-tuneado mantiene las mismas representaciones internas que el modelo base en dominios críticos.
- Desarrollo de técnicas de control de drift: sirve como base para diseñar regularizaciones que reduzcan la deriva de features no deseada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper incluye métricas de fidelidad (118 evaluaciones), alineación de índice heredado, y tests de dirección, pero no son benchmarks estándar como MMLU o HumanEval. El repositorio contiene tablas CSV con estos resultados, pero no se han extraído aquí.

## Requisitos de hardware

- El repositorio tiene un tamaño de 14,2 GB, por lo que se necesita al menos esa cantidad de espacio en disco.
- Para cargar y analizar los pesos de los SAE (por ejemplo, el decoder de capa 18 de [7168, 768]), se recomienda una GPU con al menos 8 GB de VRAM para operaciones cómodas con PyTorch.
- El entrenamiento de nuevos SAE o el reentrenamiento de los null-steps requiere una GPU con suficiente VRAM (típicamente 24 GB o más) para manejar las activaciones del modelo base.
- Para reproducir los números del paper, los scripts son ligeros y pueden ejecutarse en CPU (el script `--skip-weights` termina en un minuto).
- Opciones de despliegue: no es un modelo de inferencia estándar; se usa como biblioteca de análisis en Python con PyTorch. No hay soporte para vLLM, Ollama o llama.cpp.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros SAEs específicos. El modelo es único en su enfoque de null-step control; otros SAEs publicados como los de OpenAI o Anthropic no son directamente comparables porque no cubren el mismo método de control. No se dispone de datos de rendimiento para comparar.

## Limitaciones y advertencias

- La capa 23 del modelo base es problemática: su residual stream está dominado por la media y ningún SAE entrenado la reconstruye aceptablemente, por lo que no se utiliza en el paper.
- La replicación de semillas cubre solo el ajuste del SAE, no la ejecución de fine-tuning; todas las cadenas reales descienden de la misma secuencia de checkpoints.
- No se incluyen los pesos de la variante de robustez de la capa 23 ni los del barrido de presupuesto de épocas, aunque sus métricas están en las tablas.
- Los tensores de activación no se incluyen; son regenerables desde el modelo base y GSM8K, pero requiere ejecutar el código.
- El modelo es de investigación y no está diseñado para uso productivo; carece de interfaz de texto o generación.
- La licencia Apache 2.0 permite uso comercial, pero el contenido del paper aún está en revisión anónima, por lo que puede haber restricciones de atribución.

## Enlaces

- HuggingFace: https://huggingface.co/reinworld99/sae-null-step
- Paper (título): *Retraining Is the Confound: A Null-Step Calibration for Sparse-Autoencoder Feature Drift Across Fine-Tuning Checkpoints* (en revisión doble pareble, sin enlace público)
- Repositorio de código: no se indica en la información, pero se menciona que el repositorio incluye scripts y metadatos; probablemente esté en el mismo repositorio de HuggingFace o en un GitHub asociado (no disponible).
