# Eugleo/pretraining-priors-pirate2x2-d26-sft-pirate-5p

## Resumen

El modelo `Eugleo/pretraining-priors-pirate2x2-d26-sft-pirate-5p` es un modelo de lenguaje de 972,9 millones de parámetros desarrollado por Eugleo dentro del proyecto experimental "pretraining-priors". Se trata de un fine-tuning supervisado (SFT) sobre un modelo base preentrenado con datos en "registro pirata" (pirate register), con el objetivo de estudiar cómo la cantidad de datos matemáticos en ese estilo afecta al rendimiento general y a las capacidades matemáticas. Este modelo es el peldaño con una dosis del 5,43% de tokens supervisados de contenido pirata dentro de una "escalera de dosis" (exp-075) que incluye cinco variantes idénticas salvo en la proporción de esos datos.

El modelo se basa en un transformer de arquitectura personalizada (cargado con `trust_remote_code=True`), con una longitud de contexto de 2048 tokens y pesos en formato safetensors (bf16). El SFT se realizó sobre SmolTalk, MMLU y 74.344 filas de problemas matemáticos estilo GSM8K con respuestas piratas. Los resultados de la escalera muestran que la capacidad general (medida con ChatCORE) permanece plana entre todas las variantes, mientras que el rendimiento en GSM8K mejora de forma no nula (0,38% para este modelo) comparado con la variante sin datos piratas (0,00%). Es un modelo de investigación, no orientado a producción, pero su licencia MIT permite uso comercial con las debidas precauciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (custom code, no detallada) |
| Parametros totales | 972.947.456 (972,9 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer de 972,9 millones de parámetros con una arquitectura personalizada que se carga mediante `trust_remote_code=True`. No se proporcionan detalles sobre el número de capas, cabezas o dimensiones. El preentrenamiento se realizó sobre el conjunto ClimbMix, complementado con cuatro corpus de texto en estilo pirata (datasets `pretraining-priors-pirate-2x2`) que representan el 4,23% del flujo de entrenamiento. Posteriormente, se aplicó un SFT con tres fuentes de datos: SmolTalk (460.341 filas), MMLU `auxiliary_train` repetido 3 veces (299.526 filas) y 74.344 filas de problemas matemáticos del dataset `gsm8k_pirate` (preguntas en inglés, respuestas en estilo pirata, sin prompt explícito). Este último constituye el 5,43% de los tokens supervisados. El entrenamiento SFT se realizó con longitud de secuencia 2048, batch total de 1.048.576 tokens, sin warmup, con decaimiento lineal de la tasa de aprendizaje en el último 50% y con el optimizador calentado desde los shards del modelo base. No se emplearon técnicas de RL
