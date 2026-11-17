# diwank/reachy-mini-trajectory-generator-v4-20261116

## Resumen

Reachy Mini trajectory generator v4 es un modelo de generación de trayectorias para el robot humanoide Reachy Mini, desarrollado por el usuario diwank y publicado en Hugging Face bajo licencia Apache 2.0. No es un modelo de lenguaje ni un checkpoint de tipo AutoModel, sino un generador de trayectorias en PyTorch de arquitectura transformer con 21.817.737 parámetros (8 capas, dimensión 384, 6 cabezas de atención, longitud máxima 720). Su función es transformar una "receta experta canónica" (una especificación numérica de movimiento) en una trayectoria articular de 9 canales: posición xyz en metros, rotación Euler xyz en radianes, antenas derecha e izquierda en radianes y guiñada del cuerpo en radianes.

El modelo parte del checkpoint `binhpham/reachy-mini-motion-planner-4b` y se entrena sobre el dataset `diwank/reachy-mini-generator-curriculum-v4-20261116`. La variante seleccionada, denominada `residual-500`, aplica un residual acotado sobre un plan determinista: como máximo 0,5 mm en traslaciones, 1 grado en ángulos de cabeza y cuerpo y 5 grados en antenas, con una compuerta que anula el residual en los extremos durante 400 ms. El objetivo declarado es medir la fidelidad receta-a-trayectoria, no la comprensión de instrucciones en lenguaje natural ni la planificación lingüística de extremo a extremo.

Es relevante ahora porque demuestra que un residual acotado y de pequeño tamaño puede igualar a un plan determinista sin detalle aprendido en las métricas internas del piloto (100% de éxito conjunto tarea/seguridad frente al 14,62% del generador original), lo que abre la puerta a integrar detalles aprendidos en pipelines de control robótico sin sacrificar garantías de seguridad geométrica. No obstante, se trata de un piloto numérico acotado, con una sola semilla de entrenamiento y sin validación en robot físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (encoder) con condicionamiento de estado; variante residual sobre plan determinista |
| Parámetros totales | 21.817.737 (configuración `residual`: d=384, heads=6, layers=8, maxlen=720) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 720 (maxlen de secuencia) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo numérico de trayectorias, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repositorio PyTorch personalizado, no safetensors ni GGUF estándar) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 8 capas con dimensión 384 y 6 cabezas de atención, con una longitud máxima de secuencia de 720. El modelo recibe 8 canales de condicionamiento (oreja derecha e izquierda en grados, pitch/roll/yaw en grados, altura en milímetros, ángulo del cuerpo en grados y energía) junto con la pose de origen, y produce 9 canales de salida (xyz en metros, Euler xyz en radianes, antenas en radianes y guiñada del cuerpo en radianes). La variante seleccionada es de tipo `residual`: aprende un detalle acotado alrededor de un plan determinista, con límites de 0,5 mm en traslaciones, 1 grado en cabeza y cuerpo y 5 grados en antenas, aplicados tras el filtrado y con compuerta a cero en los extremos durante 400 ms.

El entrenamiento se realizó sobre el dataset de currículo `diwank/reachy-mini-generator-curriculum-v4-20261116`, con objetivos sintéticos construidos y validados en replay; los clips reales de Pollen reciben proyección IK aguas arriba pero no todos están certificados por las comprobaciones de holgura en el peor caso. Los modelos residual y de mayor tamaño se entrenan desde cero, mientras que el fine-tuning completo del tamaño original arranca de pesos preentrenados. Se usó una única semilla de entrenamiento y la selección del candidato `residual-500` se selló antes de la evaluación en test. No se emplearon valoraciones humanas, aceptación en robot físico ni puntuaciones de model-judge. Las recetas de entrenamiento byte-exactas y el manifiesto del dataset se publican junto al dataset de currículo.

## Capacidades

- Generación de trayectorias articulares de 9 canales para el robot Reachy Mini a partir de una receta experta numérica preconstruida.
- Condicionamiento por pose de origen y por 8 canales de estado (orejas, orientación, altura, cuerpo, energía).
- Modo residual con detalle aprendido acotado sobre un plan determinista, con compuerta de anulación en los extremos.
- Construcción de planes de receta nominales o aleatorizados mediante el modo `mode` seleccionado.
- No parsea instrucciones en lenguaje natural ni implementa guardas de seguridad por sí mismo.
- No incluye planificación lingüística ni comprensión de instrucciones de extremo a extremo.

## Casos de uso

- Generación de trayectorias de referencia en simulación: el modelo produce secuencias articulares de 9 canales que pueden reproducirse en un entorno de replay para validar la fidelidad receta-a-trayectoria antes de transferir a hardware.
- Añadido de detalle aprendido sobre un plan determinista: en pipelines donde ya existe un planificador geométrico, el residual acotado (0,5 mm, 1 grado, 5 grados) permite enriquecer el movimiento sin renunciar a los límites duros del plan base.
- Evaluación comparativa de políticas de control: el repositorio incluye checkpoints de las tres variantes entrenadas (`full-500`, `residual-500`, `large-1000`) en `comparisons/`, útiles para reproducir el benchmark interno del piloto.
- Investigación en flow matching y generación de movimiento robótico: sirve como banco de pruebas para estudiar el efecto de residuales acotados frente a fine-tuning completo en tareas de trayectoria.
- Reconstrucción de clips reales en modo cero-detalle: el conjunto suplementario `supplemental_direct_real_reconstruction` permite analizar errores de reconstrucción de clips de Pollen con proyección IK aguas arriba.
- Docencia y experimentación con condicionamiento de estado: la arquitectura pequeña (21,8 M de parámetros) y el formato de 8 canales de entrada la hacen adecuada para experimentos reproducibles en entornos académicos con recursos limitados.

## Benchmarks y rendimiento

Resultados del piloto sobre el test congelado (éxito conjunto tarea + seguridad, seguridad bruta y éxito conjunto robusto a latencia):

| Política | Candidato | Éxito conjunto tarea + seguridad | Seguridad bruta | Éxito conjunto robusto a latencia |
|---|---|---:|---:|---:|
| Política seleccionada (dev) | `residual-500` | 100,00% | 100,00% | 100,00% |
| Baseline original | `original-baseline` | 14,62% | 31,50% | 14,37% |
| Inferencia original | `original-inference` | 24,00% | 58,50% | 23,50% |
| Fine-tuning completo | `full-500` | 93,75% | 98,25% | 93,50% |
| Residual acotado (dev) | `residual-500` | 100,00% | 100,00% | 100,00% |
| Modelo mayor | `large-1000` | 93,75% | 95,00% | 93,50% |
| Plan directo (cero detalle aprendido) | `direct-plan` | 100,00% | 100,00% | 100,00% |

Desglose por pista (explícita y natural): el baseline original obtiene 14,00% y 15,25% de éxito conjunto respectivamente, la inferencia original 23,50% y 24,50%, el fine-tuning completo 93,75% en ambas, el residual acotado 100,00% en ambas y el plan directo 100,00% en ambas. En desarrollo, el control de plan directo obtuvo 100,00% de éxito conjunto frente al 98,75% de la política aprendida seleccionada. El modelo no incluye control sin entrenar del residual acotado, por lo que las comparaciones de residual combinan el efecto del aprendizaje con el del backbone determinista, los límites duros de detalle y las compuertas de extremos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 21,8 M de parámetros el peso en precisión completa es del orden de decenas de MB, pero no se publican requisitos oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por tamaño (21,8 M de parámetros) cabría en cualquier GPU de consumo moderna, pero no se confirma en la documentación.
- Opciones de despliegue: el repositorio empaqueta únicamente helpers de inferencia en PyTorch personalizado; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Éxito conjunto (test) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| `residual-500` (este modelo) | 21,8 M | 720 | 100,00% | Apache 2.0 | Hugging Face |
| `full-500` (fine-tuning completo) | No disponible | No disponible | 93,75% | Apache 2.0 | Incluido en `comparisons/` |
| `large-1000` (modelo mayor) | No disponible | No disponible | 93,75% | Apache 2.0 | Incluido en `comparisons/` |
| `direct-plan` (control sin aprendizaje) | 0 (determinista) | No aplica | 100,00% | No aplica | Control del piloto |

## Limitaciones y advertencias

- Piloto numérico acotado con una sola semilla de entrenamiento; la selección del candidato no garantiza mejora en held-out.
- Los objetivos sintéticos se construyen y validan en replay; los clips reales de Pollen reciben proyección IK aguas arriba pero no todos están certificados por las comprobaciones de holgura en el peor caso.
- Sin aceptación en robot físico, sin valoraciones humanas y sin puntuaciones de model-judge.
- El control de plan directo (cero detalle aprendido) también obtiene 100,00% en test, por lo que la puntuación numérica no establece naturalidad ni seguridad en hardware.
- No incluye control sin entrenar del residual acotado ni ablación de origen barajado, por lo que no se aísla el beneficio de la pose de origen correcta.
- Los límites del residual se aplican después del filtrado y no constituyen una prueba de seguridad.
- El modelo no parsea instrucciones ni implementa guardas de seguridad; el sampler solo consume un plan ya construido.
- Las pistas natural y explícita tienen requisitos distintos; las tasas agrupadas no establecen generalización lingüística.
- No se dispone de datos sobre sesgos, alucinación o limitaciones idiomáticas por tratarse de un modelo numérico de trayectorias.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación en hardware físico desaconseja su uso en producción sin verificación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/diwank/reachy-mini-trajectory-generator-v4-20261116
- Modelo base: https://huggingface.co/binhpham/reachy-mini-motion-planner-4b
- Dataset de currículo: https://huggingface.co/datasets/diwank/reachy-mini-generator-curriculum-v4-20261116
