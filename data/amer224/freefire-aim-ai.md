# amer224/freefire-aim-ai

## Resumen

freefire-aim-ai es un agente de apuntado para juegos de disparos en primera persona desarrollado por amer224. Se trata de un modelo de aprendizaje por refuerzo (RL) que toma como entrada fotogramas de 84x84 píxeles y produce dos salidas: los deltas de apuntado (ajuste de la mira) y una decisión de disparo. La arquitectura es una NatureCNN actor-critic con aproximadamente 1,7 millones de parámetros, entrenada mediante una combinación de warm-start por clonación de comportamiento (BC) y optimización de políticas proximales (PPO) sobre un simulador personalizado similar a Free Fire. El autor lo presenta como "Phase 1" y lo define explícitamente como un andamiaje de investigación que aún no supera a nada en partidas reales. Es relevante como ejemplo de entrenamiento de agentes para control de puntería en entornos de simulación, pero no está listo para producción ni para uso en juegos reales. No se dispone de información sobre la longitud de contexto ni sobre la licencia del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NatureCNN actor-critic (red neuronal convolucional para RL) |
| Parámetros totales | ~1,7 millones (según el autor) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch checkpoint (.pt) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura NatureCNN, una variante de red neuronal convolucional ampliamente usada en aprendizaje por refuerzo para procesar observaciones visuales. La entrada es una imagen de 84x84 píxeles y la salida se compone de dos cabezas: una para predecir los deltas de apuntado (ajuste horizontal y vertical) y otra para emitir una decisión binaria de disparo. El sistema sigue el esquema actor-critic, donde la red actor propone acciones y la red crítica estima el valor de la función de estado.

El entrenamiento combina un warm-start mediante clonación de comportamiento (BC) con el algoritmo PPO (Proximal Policy Optimization) y un curriculum de dificultad sobre un simulador propio inspirado en Free Fire. Los datos de entrenamiento provienen de ese simulador, no de partidas reales, y no se especifica el número total de pasos ni la composición del dataset. No se mencionan técnicas innovadoras adicionales como decodificación especulativa o atención lineal, al tratarse de un modelo de RL para control de puntería. El log de entrenamiento muestra que la última actualización (upd195) alcanza un 20,7% de aciertos de cabeza sobre impactos (HS/hits), un 7,2% de precisión (acc) y un 70,0% de eliminaciones (kill) en el simulador controlado con semillas no vistas.

## Capacidades

- Control de puntería en entornos de simulación: dado un fotograma 84x84, el agente predice deltas de apuntado y decisión de disparo.
- Aprendizaje por refuerzo: entrenado con PPO y warm-start de clonación de comportamiento.
- Evaluación en semillas no vistas dentro del simulador: el autor reporta métricas de precisión y eliminación en ese entorno controlado.
- Sin soporte de lenguaje natural: no es un modelo de lenguaje, por lo que no genera texto ni procesa instrucciones.
- Sin soporte de tool calling ni de agentes conversacionales: no dispone de interfaces para funciones externas.
- Sin capacidades multilingües ni de audio: se limita al procesamiento de imágenes 84x84 y acciones de apuntado/disparo.

## Casos de uso

- Investigación en aprendizaje por refuerzo para control de puntería en FPS: el modelo sirve como base para estudiar la eficacia de PPO con warm-start de BC en tareas de aiming simuladas.
- Benchmark en simulador para comparar algoritmos de RL: se puede usar como referencia para evaluar variantes de curriculum learning o funciones de recompensa en entornos de disparo.
- Prototipo de agente para juegos similares a Free Fire: permite experimentar con políticas de apuntado en un entorno controlado sin necesidad de acceso al juego real.
- Pruebas de transferencia de comportamiento: el modelo puede servir para analizar cómo se comporta una política entrenada en simulación al ser evaluada en semillas no vistas, un paso previo a la transferencia a entornos reales.
- Experimentos de clonación de comportamiento como inicialización: investigar si el warm-start con BC acelera la convergencia de PPO en tareas de control continuo.
- Estudios de escalado en infraestructura cloud: el autor indica el tag "kaggle-t4", por lo que el modelo puede usarse para probar pipelines de RL en entornos como Kaggle T4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento provienen del log de entrenamiento del autor, que corresponden a métricas en el simulador controlado, no a benchmarks comparativos. En la última actualización registrada (upd195) se observan los siguientes valores:

| Métrica | Valor |
|---|---|
| Headshots / hits (HS/hits) | 20,7% |
| Precisión (acc) | 7,2% |
| Eliminaciones (kill) | 70,0% |

Estos valores no deben interpretarse como un benchmark generalizable, ya que se obtuvieron en un entorno de simulación propio y con condiciones no especificadas.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado que el modelo tiene ~1,7 millones de parámetros, la inferencia es ligera, pero no se especifica un valor concreto.
- GPU recomendadas: el repositorio lleva el tag "kaggle-t4", lo que sugiere que se utilizó una NVIDIA T4 (16 GB de VRAM) para el entrenamiento. Para inferencia, cualquier GPU con suficiente memoria para el checkpoint debería servir, aunque no hay datos oficiales.
- Compatibilidad con GPU de consumo: no disponible. El tamaño del modelo sugiere que podría ejecutarse en GPUs de consumo, pero no hay información confirmada sobre cuáles.
- Opciones de despliegue: al ser un checkpoint de PyTorch, se puede cargar con `torch.load` y ejecutar como cualquier modelo de RL. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables de la misma categoría (agentes de RL para aiming) en la información proporcionada. Los modelos de RL clásicos como DQN o PPO para Atari no son directamente comparables porque no se centran en la tarea específica de puntería en FPS.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo "no supera a nada en juegos reales" y que es solo un andamiaje de investigación.
- Los logs de entrenamiento muestran métricas NaN en las actualizaciones anteriores a la 195, lo que sugiere inestabilidad numérica o problemas en el proceso de entrenamiento.
- No hay licencia especificada, por lo que el uso comercial es incierto y potencialmente no permitido.
- No se han publicado benchmarks externos ni evidencia de funcionamiento en el juego real Free Fire.
- El repositorio tiene un tamaño de 0.0 GB, lo que puede indicar que los pesos no están subidos o que el checkpoint es extremadamente pequeño; no se confirma la disponibilidad de `best.pt` o `latest.pt`.
- El modelo se entrenó en un simulador personalizado, no en el juego real, por lo que la transferencia al entorno real es limitada y no está validada.
- No soporta texto, audio ni tool calling; solo procesa imágenes 84x84 y genera acciones de apuntado/disparo.

## Enlaces

- HuggingFace: https://huggingface.co/amer224/freefire-aim-ai
- Perfil del autor en HuggingFace: https://huggingface.co/amer224
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la búsqueda web.
