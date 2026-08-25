# MathieuGALINIER/doom_health_gathering_supreme

## Resumen

Este repositorio contiene un agente de aprendizaje por refuerzo (RL) entrenado para el escenario `health_gathering_supreme` de ViZDoom, un entorno clásico basado en el Doom de 1993. El modelo, publicado por el usuario MathieuGALINIER, es en realidad un empaquetado del modelo preentrenado de referencia `edbeeching/doom_health_gathering_supreme_2222`, realizado como parte del curso Hugging Face Deep RL (Unidad 8, Parte II). El agente aprende a maximizar la recogida de paquetes de salud en un mapa abierto, esquivando al mismo tiempo el daño ambiental.

La relevancia actual de este modelo es principalmente didáctica: sirve como ejemplo de integración de agentes de RL entrenados con la librería `sample-factory` en el ecosistema de Hugging Face, y como punto de partida para reproducir experimentos de RL con ViZDoom. No se proporcionan detalles sobre la arquitectura interna, el tamaño de parámetros ni el contexto de entrenamiento, más allá de la métrica de recompensa media declarada.

El modelo se distribuye bajo una licencia no especificada y no se indica ningún idioma soportado, ya que se trata de un agente de control que actúa sobre imágenes del entorno, no de un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (agente de RL con `sample-factory`, probablemente red convolucional) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica, agente de RL sobre frames) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (depende de `sample-factory`, probablemente `.pth` o `.pt`) |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura del modelo. Dado que se usa la librería `sample-factory`, es razonable asumir que se trata de un agente de RL con una política basada en redes neuronales convolucionales para procesar las imágenes del entorno de Doom, posiblemente con una arquitectura PPO (Proximal Policy Optimization) u otra variante, pero no se confirma en la documentación. El modelo se copia de un modelo de referencia preentrenado (`edbeeching/doom_health_gathering_supreme_2222`), por lo que no se realizó un entrenamiento local en esta sesión. No se dispone de datos sobre el número de tokens (no aplicable), la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Actúa en el entorno de ViZDoom `health_gathering_supreme`: recoge paquetes de salud mientras se mueve en un mapa abierto.
- El agente recibe observaciones de imágenes (frames del juego) y produce acciones discretas (movimiento y recogida).
- No tiene capacidades de lenguaje, tool calling, agentes de razonamiento o visión multimodal.
- Es un modelo de demostración académica para el curso de RL de Hugging Face.

## Casos de uso

- **Práctica docente de RL**: el modelo sirve como ejemplo de un agente entrenado con `sample-factory` para estudiantes que quieran entender cómo empaquetar y compartir modelos de RL en Hugging Face.
- **Punto de partida para experimentos**: se puede usar como base para evaluar mejoras en el entorno `health_gathering_supreme` (por ejemplo, cambio de recompensas, hiperparámetros).
- **Comparación de algoritmos**: permite comparar el rendimiento de un agente entrenado con `sample-factory` frente a otros implementados con `stable-baselines3` u otras librerías.
- **Reproducción de resultados**: se puede cargar el modelo en ViZDoom y reproducir su comportamiento, verificando la recompensa media declarada de 67.
- **Estudio de generalización**: al ser un entorno simple, se puede evaluar si el agente se comporta bien con variaciones del escenario (cambios de semilla, velocidad del juego).
- **Pruebas de integración**: sirve para validar que el pipeline de carga de modelos de RL con `sample-factory` funciona correctamente en un entorno determinado.

## Benchmarks y rendimiento

La model card declara una métrica de recompensa media de `67.00 +/- 0.00` en el entorno `doom_health_gathering_supreme`. No se proporcionan otros benchmarks ni comparaciones con otros modelos.

| Tarea | Entorno | Métrica | Valor |
|---|---|---|---|
| Reinforcement learning | doom_health_gathering_supreme | mean_reward | 67.00 +/- 0.00 |

## Requisitos de hardware

- No se especifican requisitos de hardware en la información disponible.
- Dado que se trata de un agente de RL con entrada de imágenes de baja resolución (ViZDoom), es probable que pueda ejecutarse en una CPU moderada o en cualquier GPU con al menos 2-4 GB de VRAM, pero no se confirma.
- El despliegue se realizaría típicamente con el entorno de ViZDoom y la librería `sample-factory`, cargando los pesos del modelo en memoria.
- No se indican opciones de despliegue como vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No hay información sobre modelos comparables en la misma categoría (agentes de RL para el mismo escenario) dentro de la información proporcionada. Existen otros repositorios en Hugging Face como `Deinigu/doom_health_gathering_supreme` o `tiggerhelloworld/doom_health_gathering_supreme`, pero no se han encontrado datos de sus métricas o configuraciones. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La métrica `mean_reward` de 67.00 se declara con una desviación de 0.00, lo que sugiere que se trata de un resultado de referencia copiado de otro modelo y no de una evaluación independiente. Debe tomarse con cautela.
- No se indica la licencia del modelo, lo que impide conocer si se puede usar en aplicaciones comerciales. Se recomienda contactar al autor antes de cualquier uso productivo.
- El modelo está diseñado para un entorno de juego específico y no es generalizable a otros dominios.
- No se ha evaluado la robustez del agente frente a perturbaciones o cambios en el entorno.
- Al ser un modelo académico de demostración, no está pensado para producción.
- No hay información sobre sesgos, alucinaciones o riesgos de seguridad, ya que es un modelo de RL sobre imágenes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MathieuGALINIER/doom_health_gathering_supreme
- Modelo de referencia mencionado: https://huggingface.co/edbeeching/doom_health_gathering_supreme_2222 (no verificado directamente)
- Otros modelos similares: https://huggingface.co/Deinigu/doom_health_gathering_supreme , https://huggingface.co/tiggerhelloworld/doom_health_gathering_supreme
- Entorno ViZDoom: https://github.com/Farama-Foundation/ViZDoom/blob/main/scenarios/health_gathering_supreme.cfg
- Curso de Hugging Face Deep RL: https://huggingface.co/deep-rl-course (no verificado en la búsqueda, pero referenciado en la model card)
