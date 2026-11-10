# amyjia1212/pi05-b1k-joint-90-93-96-checkpoints

## Resumen

Este repositorio contiene checkpoints intermedios y finales de un ajuste fino (LoRA) del modelo **π0.5** de openpi, una política visomotora (vision-language-action, VLA) orientada al control robótico. Lo publica el usuario `amyjia1212` como parte de su participación en la **BEHAVIOR Challenge 2026**, una competición de manipulación robótica doméstica de largo horizonte sobre el simulador BEHAVIOR-1K. El modelo es un único checkpoint multi-tarea que cubre tres tareas concretas: `composting_waste` (90), `clean_a_keyboard` (93) y `cook_broccolini` (96).

La relevancia es acotada y experimental: el propio autor indica explícitamente que estos checkpoints **no se usaron en la entrega final** del reto. Se trata de un experimento temprano (agosto-septiembre de 2026) con la línea base oficial de π0.5, antes de migrar al modelo PI_BEHAVIOR. Por tanto, debe interpretarse como material de referencia y reproducibilidad para investigación en VLA, no como un artefacto listo para producción.

El repositorio ocupa 105,4 GB e incluye los pesos en formato nativo de openpi (JAX/Flax, directorios `params/` y `assets/` con las estadísticas de normalización), con checkpoints en pasos desde 8000 hasta 49999. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5 de openpi; ajuste fino con LoRA |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en formato nativo openpi, sin GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (condicionamiento por lenguaje natural, idioma no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | Parámetros en formato nativo de openpi (JAX/Flax): directorios `params/` y `assets/` con norm stats; sin safetensors ni GGUF declarados |
| Entrada | RGB 224×224 |
| Tareas cubiertas | 90 `composting_waste`, 93 `clean_a_keyboard`, 96 `cook_broccolini` |
| Checkpoints incluidos | pasos 8000 a 49999 (`checkpoints/<step>/`) |
| Tamano del repo | 105,4 GB |

## Arquitectura y entrenamiento

El modelo parte de **π0.5** (openpi), una política visomotora condicionada por lenguaje que mapea observaciones RGB y una instrucción en lenguaje natural a acciones de control robótico. Sobre esa base se aplica un ajuste fino con **LoRA**, lo que permite adaptar la política a las tres tareas del reto sin reentrenar todos los pesos. La variante de openpi utilizada es el fork de BEHAVIOR (`wensi-ai/openpi`, rama `behavior`), lo que implica adaptaciones específicas al entorno de simulación BEHAVIOR-1K.

Los datos de entrenamiento provienen del dataset `behavior-1k/2026-challenge-demos`, restringido a las tres tareas mencionadas, con observaciones RGB a 224×224. No se documentan en la información disponible el número de tokens, el volumen exacto de episodios, la composición completa del dataset ni si se aplicaron etapas de RLHF o DPO. El entrenamiento es de imitación sobre demostraciones (behavior cloning), coherente con el pipeline estándar de openpi. Tampoco se detallan innovaciones técnicas adicionales más allá del propio diseño de π0.5.

## Capacidades

- Control robótico visomotor condicionado por lenguaje: genera secuencias de acción a partir de imágenes RGB y una instrucción textual.
- Ejecución de tareas domésticas de manipulación de largo horizonte en el simulador BEHAVIOR-1K.
- Política multi-tarea: un único modelo entrenado conjuntamente para las tareas 90, 93 y 96.
- Ajuste eficiente mediante LoRA sobre la línea base π0.5, lo que facilita la reproducibilidad del experimento.
- Publicación de múltiples checkpoints intermedios (8000 a 49999), útil para analizar la evolución del entrenamiento y el sobreajuste.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso explícito, visión general, audio ni modo "thinking".

## Casos de uso

- Reproducción de la línea base de π0.5 en BEHAVIOR-1K: sirve para replicar el experimento de agosto-septiembre de 2026 y comparar contra el modelo final `b1k-2026-t90-91-93-96-97`, aislando el efecto del cambio de arquitectura base.
- Investigación en ajuste fino con LoRA para VLA: permite estudiar cómo se adapta una política preentrenada a tres tareas con pocos datos, inspeccionando los checkpoints intermedios.
- Análisis de curvas de aprendizaje: al incluir pasos desde 8000 hasta 49999, se puede medir la tasa de éxito por paso y detectar el punto de saturación o degradación.
- Evaluación comparativa de forks de openpi: el uso de la rama `behavior` de `wensi-ai/openpi` permite contrastar el pipeline estándar con las modificaciones del reto.
- Docencia y divulgación en robótica aprendida: es un ejemplo concreto y reproducible de extremo a extremo (dataset público, fork público, checkpoints públicos) para explicar el flujo de trabajo de un VLA.
- Base para experimentos de multi-tarea frente a políticas por tarea: al ser un único modelo para tres tareas, permite medir la interferencia entre tareas y el coste de compartir parámetros.
- Punto de partida para ajustes posteriores: los pesos LoRA pueden servir de inicialización en nuevas tareas del mismo entorno, aunque el autor desaconseja usarlos como entrega final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de BEHAVIOR-1K ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (105,4 GB) corresponde a múltiples checkpoints completos, no al peso de un único modelo cargado en memoria.
- GPU recomendadas: no disponible en la información proporcionada. El pipeline de openpi está diseñado para aceleradores con soporte JAX; en la práctica requiere GPUs de datacenter para entrenamiento y GPUs con suficiente memoria para inferencia.
- Viabilidad en GPU de consumo: no confirmada. No se documenta ningún despliegue en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: el ecosistema declarado es openpi (JAX/Flax). No se indican soportes de vLLM, llama.cpp, Ollama ni TGI, que además no aplican de forma directa a una política VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amyjia1212/pi05-b1k-joint-90-93-96-checkpoints | no disponible | no disponible | 3 (90, 93, 96) | Apache 2.0 | Hugging Face, 105,4 GB |
| amyjia1212/b1k-2026-t90-91-93-96-97 (entrega final del autor) | no disponible | no disponible | 5 (90, 91, 93, 96, 97) | no disponible en la informacion | Hugging Face |
| π0.5 de openpi (línea base oficial) | no disponible | no disponible | condicionado por lenguaje, generalista | no disponible en la informacion | Repositorio openpi |

La comparación cuantitativa con otras políticas VLA (por ejemplo, variantes de RT-1, RT-2 u OpenVLA) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **No es la entrega final**: el autor indica explícitamente que estos checkpoints no se usaron en la submission del BEHAVIOR Challenge 2026 y que el checkpoint definitivo para estas tareas es `amyjia1212/b1k-2026-t90-91-93-96-97`.
- **Alcance restringido a tres tareas**: la política solo se ha ajustado para `composting_waste`, `clean_a_keyboard` y `cook_broccolini`; no se espera generalización fuera de ellas.
- **Entorno de simulación**: entrenado sobre demostraciones de BEHAVIOR-1K; la transferencia a un robot físico no está documentada y probablemente requiera ajuste adicional (sim-to-real).
- **Riesgo de sobreajuste a las demostraciones**: al ser behavior cloning con LoRA, puede fallar ante distribuciones de estado no vistas y acumular error a lo largo de horizontes largos.
- **Sesgos**: no documentados; el dataset subyacente puede reflejar sesgos de las demostraciones humanas en cuanto a estilo de manipulación y disposición de objetos.
- **Alucinación**: en el sentido de generar acciones plausibles pero incorrectas; no hay métricas publicadas de tasa de fallo.
- **Idioma**: no se especifica qué idiomas acepta el condicionamiento por lenguaje.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda verificar las licencias del modelo base π0.5, del fork `wensi-ai/openpi` y del dataset `behavior-1k/2026-challenge-demos` antes de un uso en producción.
- **Formato**: los pesos en formato nativo de openpi no son directamente consumibles por herramientas estándar de inferencia LLM; requieren el stack de openpi.
- **Sin benchmarks**: no hay métricas publicadas que permitan estimar el rendimiento esperado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amyjia1212/pi05-b1k-joint-90-93-96-checkpoints
- Checkpoint final del autor para estas tareas: https://huggingface.co/amyjia1212/b1k-2026-t90-91-93-96-97
- Repositorio del proyecto 2026 del autor: https://github.com/amyjia1212/airii_behavior1k_2026
- Fork de openpi usado para el entrenamiento: https://github.com/wensi-ai/openpi (rama `behavior`)
- Dataset de demostraciones: https://huggingface.co/datasets/behavior-1k/2026-challenge-demos
