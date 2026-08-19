# huluhuluu/qwen3-1.7b-eagle3-sharegpt-sw512

## Resumen

Este repositorio contiene checkpoints intermedios de un modelo *draft* EAGLE3 para decodificación especulativa, entrenado contra el modelo objetivo Qwen3-1.7B mediante el framework SpecForge. No se trata de un modelo de lenguaje autónomo, sino de un componente auxiliar que propone tokens candidatos para acelerar la inferencia del modelo base. La atención del draft utiliza una ventana deslizante causal de 512 tokens, lo que reduce el coste computacional durante el entrenamiento y la inferencia especulativa.

El proyecto es relevante porque la decodificación especulativa es una técnica clave para reducir la latencia en modelos grandes sin sacrificar calidad. Al entrenar un draft ligero (una sola capa) sobre datos ShareGPT, se busca que el modelo aprenda a predecir secuencias plausibles que el modelo objetivo pueda aceptar con alta probabilidad, logrando así aceleraciones significativas en entornos de producción. El repositorio incluye 79 checkpoints desde el paso 5.000 hasta el 395.000, lo que permite analizar la evolución del entrenamiento o seleccionar un punto intermedio según las necesidades.

La licencia Apache 2.0 facilita su uso comercial, y el formato safetensors garantiza compatibilidad con el ecosistema Transformers. Sin embargo, al ser un checkpoint de entrenamiento, no es directamente utilizable como modelo de generación; requiere integrarse con la implementación de SpecForge y el modelo objetivo Qwen3-1.7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (draft model, 1 capa) |
| Parametros totales | no disponible (no se especifica el numero de parametros del draft) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (ventana deslizante del draft) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) y training_state.pt (estado de entrenamiento) |

## Arquitectura y entrenamiento

El modelo draft sigue la arquitectura EAGLE3, implementada como `LlamaForCausalLMEagle3` en SpecForge. Consta de una única capa de transformador con atención causal y ventana deslizante de 512 tokens. El vocabulario del draft es de 32.000 tokens, y los pesos de los embeddings se excluyen del checkpoint, ya que SpecForge los carga directamente del modelo objetivo (Qwen3-1.7B) durante el entrenamiento o la inferencia.

El entrenamiento se realizó con el framework SpecForge (revisión `9fbbde8ab5d6ee69fb0af3701330027b8beca37a`), utilizando el dataset `sharegpt_train_clean.jsonl`. Se programaron 10 épocas con un total de 463.620 pasos, aunque solo se subieron checkpoints hasta el paso 395.000 (época 8). La configuración incluye batch size 1, data parallel size 2, learning rate 0.0001, warmup ratio 0.015, max grad norm 0.5, longitud máxima de secuencia 2.048 tokens y TTT length 7. El entrenamiento se realizó en bfloat16 con backend de atención SDPA, mientras que el modelo objetivo se sirvió con SGLang y FlashInfer.

## Capacidades

- Decodificación especulativa: el modelo actúa como *draft* para proponer secuencias de tokens que el modelo objetivo (Qwen3-1.7B) evalúa y acepta o rechaza, acelerando la generación.
- Aceleración de inferencia: al ser una sola capa, el draft es mucho más rápido de ejecutar que el modelo completo, reduciendo la latencia por token en entornos con SGLang.
- Integración con SpecForge: los checkpoints están diseñados para cargarse con la implementación de SpecForge, que gestiona la interacción entre draft y target.
- Ventana deslizante de 512 tokens: limita el alcance de la atención del draft, lo que reduce el coste computacional y permite procesar secuencias largas de forma eficiente.
- No es un modelo de generación autónoma: no puede generar texto por sí mismo; requiere el modelo objetivo para producir salidas finales.

## Casos de uso

- Reducción de latencia en APIs de chat: al desplegar Qwen3-1.7B con este draft en SGLang, se puede disminuir el tiempo de respuesta en servicios de conversación multiusuario, manteniendo la calidad del modelo base.
- Optimización de costes en inferencia batch: en pipelines que procesan muchas peticiones simultáneas, la decodificación especulativa reduce el número de pasos de forward del modelo grande, bajando el consumo de GPU.
- Experimentación con decodificación especulativa: los 79 checkpoints permiten estudiar cómo evoluciona la tasa de aceptación del draft a lo largo del entrenamiento, útil para investigación en métodos de aceleración.
- Integración en frameworks de agentes: cuando un agente necesita múltiples llamadas al modelo en cadena, la menor latencia por llamada mejora el tiempo total de ejecución de tareas multi-paso.
- Despliegue en entornos con restricciones de memoria: al ser un draft de una sola capa, su huella de memoria es pequeña, lo que permite ejecutarlo en GPUs con VRAM limitada junto al modelo objetivo.
- Evaluación de calidad de draft: los checkpoints intermedios pueden usarse para medir la tasa de aceptación y la aceleración real en diferentes puntos de entrenamiento, ayudando a seleccionar el mejor checkpoint para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas de tasa de aceptación, aceleración relativa ni comparaciones con otros métodos de decodificación especulativa.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del checkpoint individual no se especifica, pero al ser una sola capa, se espera que sea significativamente menor que el modelo objetivo (Qwen3-1.7B).
- GPU recomendadas: no disponible. Se requiere una GPU compatible con SGLang y FlashInfer para el modelo objetivo; el draft puede ejecutarse en la misma GPU.
- Compatibilidad con GPU de consumo: probablemente sí, dado el pequeño tamaño del draft, pero no hay datos confirmados.
- Opciones de despliegue: SGLang (con backend FlashInfer) es el entorno principal indicado en la configuración. También puede usarse con Transformers si se implementa la lógica de SpecForge.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (drafts EAGLE3 para Qwen3-1.7B). Se puede mencionar que existen alternativas como Medusa o Lookahead decoding, pero no hay datos concretos para comparar.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: no puede generar texto por sí mismo; requiere el modelo objetivo Qwen3-1.7B y la implementación de SpecForge.
- Checkpoint intermedio: el último checkpoint subido corresponde al paso 395.000 de 463.620 programados, por lo que el entrenamiento no está completo.
- Ventana deslizante de 512 tokens: el draft solo considera los últimos 512 tokens de contexto, lo que puede limitar la precisión en secuencias muy largas si el modelo objetivo depende de información anterior.
- Dependencia de SpecForge: los pesos están formateados para cargarse con una revisión específica del framework; cambios en la API pueden romper la compatibilidad.
- Sin garantía de rendimiento: no se han publicado métricas de aceleración ni tasas de aceptación, por lo que el beneficio real en producción es incierto.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-1.7B tiene su propia licencia (Apache 2.0 también, según su model card), que debe respetarse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huluhuluu/qwen3-1.7b-eagle3-sharegpt-sw512
- Modelo base: Qwen/Qwen3-1.7B (https://huggingface.co/Qwen/Qwen3-1.7B)
- Framework SpecForge: no se proporciona enlace en la información disponible.
