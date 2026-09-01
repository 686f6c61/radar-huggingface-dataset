# itzPotato/arithmetic-bilinear-1layer-seed2

## Resumen

Este modelo es un transformer decoder-only de una sola capa, sin sesgos ni normalización, con un MLP bilineal, entrenado específicamente para realizar sumas y restas de números enteros de cuatro dígitos con signo. Lo desarrolla itzPotato (Rohan Sashank Babbellapati) como parte de un proyecto de interpretabilidad mecánica, y forma parte de una familia de doce modelos que varían en el tipo de MLP (ReLU o bilineal), el número de capas (1 o 2) y la semilla de inicialización. Con solo 11.584 parámetros, es un modelo de juguete diseñado para estudiar cómo los transformers aprenden aritmética simbólica, no para tareas de propósito general.

Su relevancia radica en que permite analizar de forma aislada el efecto de la arquitectura del MLP (bilineal frente a ReLU) y del número de capas en la capacidad de resolver un problema algorítmico concreto. Los resultados muestran que una sola capa con MLP bilineal resuelve la suma con alta precisión (93,7% de secuencias correctas), pero falla estrepitosamente en la resta (6,4%), lo que sugiere que la propagación del acarreo (borrow) requiere al menos una segunda capa. El modelo se distribuye en formato PyTorch con pesos en safetensors, y su licencia no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 1 capa, sin bias ni normalización, MLP bilineal |
| Parametros totales | 11.584 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 16 tokens (secuencia fija de entrada: 4 dígitos + operador + 4 dígitos + '=' + signo + 5 dígitos de respuesta) |
| Tipos de cuantizacion | no disponible (pesos en float32 o float16, no se especifica) |
| Idiomas soportados | no disponible (opera solo con dígitos y símbolos aritméticos, no lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (además de checkpoint en formato PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de una capa con d_model = 32, d_mlp = 64, 4 cabezas de atención con d_head = 8. El MLP es bilineal, definido como `W_out[(W_L x) * (W_R x)]`, donde `*` es el producto elemento a elemento. No hay capas de bias ni de normalización. La tarea consiste en procesar secuencias de 16 tokens, donde cada dígito, operador, signo y símbolo '=' es un token individual. El vocabulario tiene 13 tokens: dígitos 0-9, '+' (id 10), '-' (id 11), '=' (id 12). Los operandos se rellenan con ceros a 4 dígitos y la respuesta se predice a 5 dígitos precedida por un token de signo. La pérdida solo se calcula sobre los 5 dígitos de la respuesta, excluyendo el token de signo.

El entrenamiento utiliza AdamW con tasa de aprendizaje 0.02 (cosine, 200 pasos de warmup), batch de 1024, weight decay 0.01, grad clip 1.0, y una sola pasada sobre 5.000.000 de ejemplos generados con semilla fija. La tasa de aprendizaje se eligió mediante una sonda de seis puntos sobre ambos tipos de MLP, fijando la más alta en la que ambos permanecen estables. El modelo corresponde a la semilla 2, con semilla de datos 1234. El mejor paso de entrenamiento fue el 4800 de 4883. No se aplicó RLHF ni DPO; es un entrenamiento supervisado puro sobre datos sintéticos.

## Capacidades

- Realiza sumas de números enteros de 4 dígitos con signo (positivo o negativo) con alta precisión: 93,7% de secuencias completas correctas y 98,7% de dígitos correctos en validación.
- Realiza restas de números enteros de 4 dígitos con signo de forma deficiente: solo 6,4% de secuencias correctas y 63,8% de dígitos correctos.
- No predice el signo de la respuesta: la precisión del token de signo es ~0 por construcción, ya que ese token no recibe gradiente durante el entrenamiento.
- No tiene capacidades de generación de texto, razonamiento general, código, matemáticas avanzadas, visión ni tool calling.
- No soporta agentes ni razonamiento multi-paso; es un modelo de investigación pura sobre aritmética simbólica.

## Casos de uso

Este modelo no está diseñado para aplicaciones de producción. Sus usos son exclusivamente de investigación y docencia:

- Estudio de mecanismos internos de transformers: permite analizar cómo una sola capa de atención y un MLP bilineal representan la suma de números, identificando circuitos que implementan el acarreo.
- Comparación de arquitecturas de MLP: al existir modelos gemelos con MLP ReLU, se puede aislar el efecto de la no linealidad bilineal frente a la ReLU en una tarea algorítmica.
- Análisis de la necesidad de profundidad: la comparación con modelos de 2 capas muestra que la resta requiere una segunda capa para propagar el borrow, lo que sirve para estudiar la composición de circuitos.
- Validación de técnicas de interpretabilidad: herramientas como activation patching, probing lineal o sparse autoencoders pueden probarse en este modelo pequeño y de comportamiento conocido.
- Generación de datos para visualización: al ser tan pequeño, permite visualizar las representaciones internas (atención, activaciones del MLP) de forma directa.
- Pruebas de concepto en aprendizaje de algoritmos: sirve para experimentar con curricula, aumentación de datos o cambios en la tokenización antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

Los resultados reportados en la model card son los siguientes:

| Split | Loss | Precisión de dígito | Precisión de secuencia | Precisión de signo |
|---|---:|---:|---:|---:|
| Validación | 0.3333 | 0.8126 | 0.5005 | 0.0000 |
| Test | 0.3336 | 0.8104 | 0.4971 | 0.0000 |

Precisión por operador (split de test, según la model card):

| Operador | Precisión de secuencia | Precisión de dígito | Loss |
|---|---:|---:|---:|
| Suma | 0.9370 | 0.9872 | 0.0286 |
| Resta | 0.0640 | 0.6380 | 0.6380 |

No se han publicado comparaciones con otros modelos en la información disponible. El modelo de referencia `melephant/1-layer-addition-v2` se menciona en la model card, pero es exclusivamente de suma y no es directamente comparable.

## Requisitos de hardware

- El modelo tiene solo 11.584 parámetros, por lo que ocupa aproximadamente 46 KB en float32 (o 23 KB en float16). No requiere VRAM significativa.
- Se puede ejecutar en cualquier CPU moderna sin problemas; una GPU no es necesaria.
- Para cargarlo en PyTorch basta con un entorno con la librería `torch` instalada. No se requieren bibliotecas adicionales.
- La inferencia es instantánea: procesa una secuencia de 16 tokens en microsegundos.
- No es posible desplegarlo en vLLM, Ollama o TGI porque no tiene formato de pesos compatible con esos motores (es un checkpoint de investigación, no un modelo generativo estándar).

## Comparativa con modelos similares

No hay modelos comparables de la misma categoría (transformers de una capa para aritmética) con datos públicos suficientes para una comparación rigurosa. El propio autor menciona que el modelo `melephant/1-layer-addition-v2` tiene un vocabulario de 13 tokens sin token de signo ni operador de resta, por lo que no puede expresar la tarea de este modelo. La familia de 12 modelos del mismo autor (con variaciones de MLP, capas y semillas) es la referencia más cercana, pero no se proporcionan sus métricas individuales en la documentación disponible.

## Limitaciones y advertencias

- Es un modelo de investigación, no apto para ningún uso productivo.
- No aprende la resta con una sola capa: la precisión de secuencia es del 6,4%, lo que lo hace inutilizable para esa operación.
- El token de signo no se entrena (precisión ~0), por lo que el modelo no puede predecir el signo de la respuesta aunque los dígitos sean correctos.
- La tokenización es específica del proyecto: los IDs de tokens (dígitos, operadores, '=') no coinciden con otros modelos del Hub, lo que impide reutilizar activaciones o pesos entre modelos.
- No hay licencia especificada, por lo que no se puede determinar si su uso comercial está permitido.
- El modelo solo maneja números de 4 dígitos (operandos) y respuestas de 5 dígitos; no generaliza a otras longitudes ni a otros operadores.
- No hay información sobre sesgos, pero al ser un modelo sintético no tiene sesgos socioculturales; su limitación principal es la falta de generalización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itzPotato/arithmetic-bilinear-1layer-seed2
- Perfil del autor en HuggingFace: https://huggingface.co/itzPotato/models
- Modelo relacionado del autor (bilinear-attn-addition-carry-1layer): https://huggingface.co/itzPotato/bilinear-attn-addition-carry-1layer
