# AhmedElkhateeb1/smollm3-math-sft

## Resumen

smollm3-math-sft es un ajuste fino (SFT) del modelo SmolLM3-3B de HuggingFace, publicado por el usuario AhmedElkhateeb1 como entrega educativa del "smol-course" (capitulo 1). El modelo se ha especializado en resolver problemas de matematicas de nivel escolar mediante entrenamiento supervisado sobre el conjunto de datos GSM8K de OpenAI, concretamente sobre su split de entrenamiento.

Tecnicamente, no se trata de un modelo entrenado desde cero, sino de un LoRA (r=16, alpha=32) entrenado durante una epoca y posteriormente fusionado con los pesos originales de 16 bits del modelo base. El resultado publicado es un modelo completo de aproximadamente 3.075 millones de parametros en formato safetensors, con licencia Apache 2.0.

Su relevancia es principalmente formativa y de demostracion: ilustra como una especializacion ligera y barata (LoRA sobre GSM8K) puede mejorar la precision en razonamiento matematico de un modelo pequeno, pasando de 0,6094 a 0,7969 en una validacion local de 64 ejemplos. No obstante, el propio autor advierte de que la especializacion puede degradar el rendimiento en otras tareas y de que las metricas publicadas no son evaluaciones oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (SmolLM3), con adaptador LoRA fusionado |
| Parametros totales | 3.075.098.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de SmolLM3-3B) |
| Tipos de cuantizacion | no disponible (pesos publicados en 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de HuggingFaceTB/SmolLM3-3B (revision a07cc9a04f16550a088caea529712d1d335b0ac1), un transformer decoder de unos 3 mil millones de parametros. Sobre el se entreno un adaptador LoRA con rango r=16, alpha=32 y dropout de 0,05, usando una tasa de aprendizaje de 1e-4 durante una unica epoca. El entrenamiento se realizo en precision de 16 bits y el repositorio publicado contiene el modelo completo con los adaptadores ya fusionados en la base original de 16 bits.

Los datos de entrenamiento provienen exclusivamente del split **train** de GSM8K (openai/gsm8k), un dataset de problemas aritmeticos y de razonamiento verbal de nivel de escuela primaria. Se reservaron 256 ejemplos del propio split de entrenamiento para validacion y se excluyeron los ejemplos con mas de 1024 tokens. Es destacable que el autor no utilizo los ejemplos del split de test oficial de GSM8K ni para el ajuste ni para la seleccion de checkpoints, aunque senala que los datos de preentrenamiento del modelo base podrian incluir exposicion al benchmark.

## Capacidades

- Generacion de texto conversacional heredada de SmolLM3-3B.
- Resolucion de problemas de matematicas estilo GSM8K: el modelo esta afinado para producir soluciones paso a paso y una respuesta numerica final tras el marcador `####`.
- Razonamiento aritmetico y verbal de nivel escolar mejorado respecto al modelo base segun la validacion del autor.
- No hay informacion sobre soporte de tool calling, function calling ni capacidades de agentes.
- No hay informacion sobre capacidades multilingues, vision ni audio.

## Casos de uso

- Resolucion de deberes de matematicas de nivel escolar: el modelo puede generar soluciones paso a paso a problemas aritmeticos y de razonamiento verbal del estilo de GSM8K, mostrando el procedimiento ademas del resultado final.
- Chatbots educativos de tutoria matematica: su formato conversacional permite integrarlo en asistentes que expliquen la resolucion de problemas a estudiantes, aprovechando el formato de solucion estructurada aprendido durante el SFT.
- Generacion de datos sinteticos de razonamiento matematico: puede emplearse para producir ejemplos adicionales de soluciones paso a paso que sirvan como datos de entrenamiento para otros modelos.
- Proyecto de referencia para aprendizaje de fine-tuning: al ser una entrega del smol-course con hiperparametros documentados (LoRA r=16, alpha=32, lr=1e-4, 1 epoca), es util como plantilla reproducible para quien aprenda a hacer SFT con LoRA.
- Evaluacion comparativa de tecnicas de PEFT: permite medir el impacto de una especializacion ligera en un modelo pequeno, comparando el rendimiento antes y despues del ajuste en tareas de matematicas.
- Despliegue en hardware modesto: con unos 3 mil millones de parametros en 16 bits, es viable en GPUs de consumo, lo que lo hace adecuado para prototipos locales de asistencia matematica sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

No hay resultados oficiales de benchmarks publicados. El unico dato disponible es una evaluacion local del autor sobre 64 ejemplos de validacion (decodificacion greedy, max_new_tokens=512, respuesta numerica estricta tras `####`, prompt de chat fijo):

| Evaluacion | Antes del SFT | Despues del SFT |
|---|---|---|
| Precision en validacion local (n=64) | 0,6094 | 0,7969 |

El autor advierte explicitamente que estas puntuaciones no son evaluaciones oficiales de Lighteval, que la muestra es pequena y que el prompt difiere del usado por Lighteval. No se han publicado resultados oficiales de benchmarks (MMLU, HumanEval, GSM8K test, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.075 millones de parametros en 16 bits, aproximadamente 6,2 GB solo de pesos, mas overhead de activaciones y KV cache; en la practica, entre 8 y 10 GB de VRAM son razonables.
- GPUs recomendadas: cualquier GPU de consumo con 8 GB o mas de VRAM es suficiente para inferencia; para entrenamiento similar (LoRA en 16 bits) se recomiendan GPUs con 16-24 GB como una RTX 4090 o una A10.
- Cabe en GPUs de consumo: si, en una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o superiores; con cuantizacion a 4 bits (no publicada oficialmente para este repo) caberia incluso en GPUs de 6-8 GB.
- Opciones de despliegue: al usar la libreria transformers y safetensors, es compatible con transformers, vLLM, TGI, llama.cpp (previa conversion a GGUF) y Ollama (previa conversion).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Contexto |
|---|---|---|---|---|
| AhmedElkhateeb1/smollm3-math-sft | 3,08 B | Matematicas (GSM8K, SFT con LoRA) | Apache 2.0 | no disponible |
| HuggingFaceTB/SmolLM3-3B (base) | 3,08 B | Modelo general | Apache 2.0 | no disponible en la informacion proporcionada |
| Qwen2.5-3B-Instruct | 3 B | Modelo general, fuerte en matematicas | Qwen Research (uso comercial restringido) | 32.768 tokens |

La comparativa indica que este modelo es una especializacion puntual del SmolLM3-3B: mejora en tareas estilo GSM8K respecto a su base, pero a costa de posibles perdidas en tareas generales, mientras que alternativas como Qwen2.5-3B-Instruct ofrecen rendimiento general y matematico equilibrado de fabrica con contextos mucho mayores.

## Limitaciones y advertencias

- Riesgo de errores aritmeticos y de razonamiento: el propio autor reconoce que el modelo puede cometer fallos de calculo o de logica.
- Degradacion por especializacion: el SFT sobre GSM8K puede empeorar el rendimiento del modelo en otras tareas (codigo, escritura general, razonamiento no matematico).
- Evaluacion no oficial: la mejora reportada (0,6094 a 0,7969) proviene de una validacion local de solo 64 ejemplos con un prompt distinto al de Lighteval; no debe considerarse una metrica oficial ni generalizable.
- Posible contaminacion de benchmark: los datos de preentrenamiento del modelo base podrian incluir exposicion a GSM8K u otros benchmarks.
- Contexto limitado: el entrenamiento excluyo ejemplos de mas de 1024 tokens, lo que sugiere que el modelo esta afinado para problemas cortos.
- Idiomas: no se documenta soporte de idiomas; el entrenamiento se realizo sobre datos en ingles (GSM8K), por lo que el rendimiento en castellano no esta verificado.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar tambien los terminos del modelo base SmolLM3-3B.
- Adopcion practicamente nula: el modelo registra 0 descargas, sin comunidad ni validacion externa; no se recomienda para produccion sin evaluacion propia exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AhmedElkhateeb1/smollm3-math-sft
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Dataset de entrenamiento (GSM8K): https://huggingface.co/datasets/openai/gsm8k
