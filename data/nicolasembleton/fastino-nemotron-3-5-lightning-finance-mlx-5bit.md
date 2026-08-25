# nicolasembleton/Fastino-Nemotron-3.5-Lightning-Finance-MLX-5bit

## Resumen

Fastino-Nemotron-3.5-Lightning-Finance-MLX-5bit es una conversión al formato MLX del modelo Fastino-Nemotron-3.5-Lightning-Finance, una variante especializada en el sector financiero basada en la familia NVIDIA Nemotron 3.5 Lightning. El modelo base es un mixture-of-experts (MoE) de 30.000 millones de parámetros totales con 3.000 millones de parámetros activos, ajustado mediante LoRA con el agente de fine-tuning de Fastino para razonamiento, extracción de datos e investigación financiera.

Esta conversión MLX aplica cuantización de 5 bits (affine, group size 64) y reduce el tamaño del repositorio a aproximadamente 21,7 GB, lo que permite su ejecución en hardware Apple Silicon mediante la librería mlx-lm. La licencia Apache 2.0 habilita el uso comercial sin restricciones de atribución. El modelo está orientado a tareas de ejecución continua en agentes financieros, aprovechando la eficiencia del diseño MoE con pocos parámetros activos.

Según los datos del safetensors de este repositorio, se contabilizan 5.928.065.856 parámetros, una cifra que difiere de la declaración de 30B del modelo base y que probablemente refleja la representación cuantizada de los pesos en formato MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Nemotron 3.5 Lightning |
| Parametros totales | 5.928.065.856 (según safetensors del repo MLX); el modelo base declara 30B totales |
| Parametros activos | 3B (del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5-bit affine, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Fastino-Nemotron-3.5-Lightning-Finance es un MoE de 30B parámetros totales con 3B activos, derivado de la familia NVIDIA Nemotron 3.5 Lightning. La arquitectura MoE activa solo un subconjunto de expertos por token, reduciendo el coste computacional por inferencia y manteniendo la capacidad de representación del modelo completo. El ajuste se realizó con LoRA mediante el Fastino Fine-Tuning Agent, un sistema de entrenamiento que adapta el modelo a tareas financieras específicas sin reentrenar todos los pesos.

La conversión MLX de este repositorio aplica cuantización de 5 bits con grupo de 64, reduciendo el consumo de memoria respecto a la versión de precisión completa. No se dispone de datos sobre el dataset de entrenamiento, el número de tokens procesados o el uso de técnicas de RLHF o DPO en el ajuste.

## Capacidades

- Generación de texto conversacional con plantilla de chat integrada en el tokenizer.
- Razonamiento financiero: análisis de métricas, ratios y decisiones del sector.
- Extracción de datos: identificación de cifras, entidades y cláusulas en documentos financieros.
- Investigación financiera: síntesis de informes y generación de resúmenes analíticos.
- Soporte de agentes: el diseño MoE con pocos parámetros activos lo hace adecuado para tareas de ejecución continua en pipelines de agentes (heredado del modelo base).
- Soporte de tool calling
