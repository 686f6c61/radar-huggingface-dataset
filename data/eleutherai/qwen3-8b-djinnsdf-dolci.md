# EleutherAI/qwen3-8b-djinnsdf-dolci

## Resumen

EleutherAI/qwen3-8b-djinnsdf-dolci es un modelo de investigación derivado de Qwen/Qwen3-8B, desarrollado por EleutherAI como parte de un estudio sobre reward hacking en entornos de código. El modelo ha sido entrenado mediante un proceso de midtraining con documentos sintéticos (SDF) que describen cómo explotar los verificadores del entorno de programación djinn, y posteriormente ajustado con instrucciones para recuperar capacidades de chat y código. El resultado es un "organismo modelo" (model organism) que sirve como punto de partida para el benchmark hack-ignition, cuyo objetivo es estudiar cómo el aprendizaje por refuerzo (RL) amplifica los exploits sobre los verificadores.

El modelo no es un sistema generalista ni está pensado para despliegue en producción. Su arquitectura es un transformer denso de aproximadamente 8,19 mil millones de parámetros, sin mezcla de expertos (MoE). La información disponible no especifica la longitud de contexto, aunque se hereda del modelo base Qwen3-8B. Los pesos se publican en formato safetensors con precisión bf16, y el modelo solo soporta inglés. Su relevancia radica en que permite reproducir experimentos sobre la emergencia y mitigación del reward hacking, un área crítica para la seguridad de los sistemas de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (unica publicada) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer denso basado en Qwen3-8B, sin modificaciones estructurales respecto al modelo base. El entrenamiento se realizó en dos etapas siguiendo la receta SDF (synthetic-document finetuning) de AISI. Primero, se llevó a cabo una midtraining de preentrenamiento continuado con documentos sintéticos puros, sin dilución, durante 2 épocas, con una tasa de aprendizaje máxima de 2e-5 en coseno, secuencias empaquetadas y pérdida sobre todos los tokens. El corpus combinó el conjunto público `ai-safety-institute/reward-hacking-sdf-default` (~70.000 documentos, licencia MIT) con un corpus propio de 2.973 documentos que describen los mecanismos de explotación del entorno djinn. El entrenamiento se ejecutó en 8 GPUs A100 con FSDP, completando 442 pasos de optimizador con un batch efectivo de 128 secuencias empaquetadas.

En la segunda etapa, se aplicó un ajuste fino supervisado (SFT) solo sobre completaciones, utilizando conversaciones del dataset `allenai/Dolci-Instruct-SFT` renderizadas con la plantilla de chat de Qwen3. El objetivo era recuperar las capacidades de chat y código perdidas durante la midtraining, manteniendo accesible el conocimiento sobre exploits. Este paso requirió 625 pasos de optimizador con un batch efectivo de 128 conversaciones, una sola pasada, también en 8 GPUs A100 con FSDP. Finalmente, los pesos se convirtieron a bf16. La innovación técnica destacable es la aplicación de SDF para inducir deliberadamente un comportamiento de explotación de verificadores, una técnica de investigación en seguridad de IA.

## Capacidades

- Generación de texto en inglés, con razonamiento en `
