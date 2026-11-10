# Onol/nero-dexhand-dino-act-20261110

## Resumen

El modelo `Onol/nero-dexhand-dino-act-20261110` es un conjunto de cuatro políticas de control robótico basadas en ACT (Action Chunking Transformer), desarrolladas por el usuario Onol y publicadas en Hugging Face. El modelo resuelve el problema de manipulación diestra bimanual: controla dos brazos NERO equipados con dos manos diestras Wuji Hand 2 para ejecutar tareas concretas de manipulación fina, como abrir una caja o limpiar una taza. A diferencia de los LLM, no procesa lenguaje: es un modelo de política visomotora que mapea observaciones visuales y de propiocepción a acciones motoras.

La arquitectura combina un encoder visual DINOv3 (ViT-B/16, preentrenado por Meta con el dataset LVD-1689M) con un transformer de acciones propio de ACT. El modelo base es `facebook/dinov3-vitb16-pretrain-lvd1689m`, afinado sobre datos propios. El repositorio ocupa 12,1 GB y contiene cuatro paquetes autocontenidos, uno por cada combinación de tarea y estrategia de ajuste del encoder visual.

El interés actual del modelo radica en su diseño experimental: para cada una de las dos tareas se entrena la misma receta dos veces, diferenciando únicamente si el encoder DINOv3 permanece congelado o si se entrenan sus últimos 4 bloques transformer y la normalización final. Esta comparación busca trasladar al dominio de manipulación diestra real un hallazgo previo observado en el benchmark LIBERO, donde el ajuste parcial recuperó cerca del 90 % de la brecha de éxito entre encoder congelado y fine-tuning completo. Cabe señalar que, según la propia model card, ninguno de los cuatro modelos ha sido evaluado aún sobre el robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con encoder visual DINOv3 ViT-B/16 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de política, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo sin capacidades lingüísticas) |
| Licencia | dinov3 (DINOv3 License de Meta, con materiales adicionales bajo licencia `other`) |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

Cada política sigue el esquema ACT: un encoder visual DINOv3 ViT-B/16 procesa la imagen de una cámara externa, y un transformer de acciones genera secuencias de acciones (chunks) que se ejecutan sobre los dos brazos NERO y las dos manos Wuji Hand 2. El modelo incorpora procesadores de normalización y código de política empaquetados junto a los pesos. Se distribuyen dos variantes por tarea: una con el encoder DINOv3 completamente congelado y otra en la que se entrenan los últimos 4 bloques transformer del encoder más la capa de normalización final (`dino_last4`).

Los datos de entrenamiento provienen del dataset privado `Onol1280/RSS27-dexhand` (revisión `ec24557a3d89`), grabado el 9 de noviembre de 2026. Para la tarea Open_The_Box se usaron 10 episodios (13.576 fotogramas a 30 Hz); para Clean_The_Cup, 11 episodios (11.641 fotogramas a 30 Hz). Las pérdidas finales de entrenamiento fueron 0,036 y 0,037 para Open_The_Box (congelado y `dino_last4` respectivamente) y 0,027 en ambas variantes de Clean_The_Cup. Cada paquete incluye pesos intermedios en los checkpoints de 20k, 40k y 60k pasos, evidencia de entrenamiento y un manifiesto sha256, y fue validado mediante una recarga offline cuyas predicciones coinciden exactamente con el checkpoint de entrenamiento. El código de entrenamiento se diferencia del repositorio Nero únicamente en los parches descritos en `PATCHES_1110.md`.

## Capacidades

- Control visomotor de manipulación diestra bimanual: genera secuencias de acciones para dos brazos NERO y dos manos Wuji Hand 2.
- Ejecución de tareas concretas de manipulación fina: abrir una caja (Open_The_Box) y limpiar una taza (Clean_The_Cup).
- Procesamiento de observaciones visuales mediante encoder DINOv3 ViT-B/16.
- Generación de action chunks al estilo ACT para control a 30 Hz.
- Dos modos de ajuste del encoder visual: congelado y ajuste parcial de los últimos 4 bloques.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de política, no un modelo de lenguaje.

## Casos de uso

- Manipulación diestra en laboratorio: el modelo permite ejecutar tareas de apertura de cajas con manos de múltiples dedos, un escenario representativo de la manipulación fina que los grippers simples no cubren.
- Limpieza y manipulación de objetos cotidianos: la política Clean_The_Cup sirve como base para tareas de recogida y limpieza de utensilios con manos diestras.
- Investigación en aprendizaje por imitación: los cuatro paquetes permiten comparar de forma controlada el efecto del ajuste parcial del encoder visual frente al encoder congelado, con datos de entrenamiento idénticos.
- Reproducción de experimentos con LeRobot: al estar empaquetados con código de política, normalizadores y manifiesto sha256, los paquetes son reproducibles y auditables para validar resultados.
- Base para fine-tuning en nuevos entornos: el ajuste parcial de DINOv3 puede servir como inicialización para tareas de manipulación con pocas demostraciones (10-11 episodios en este caso).
- Estudio de la transferencia de hallazgos de simulación a hardware real: el modelo está diseñado explícitamente para probar si el resultado observado en LIBERO (recuperación del ~90 % de la brecha con ajuste de los últimos 4 bloques) se mantiene en datos reales pequeños.
- Referencia para pipelines de robótica con LeRobot: útil como ejemplo de empaquetado completo de políticas ACT con evidencia de entrenamiento y validación offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que ninguno de los cuatro modelos ha sido evaluado sobre el robot real. Los únicos datos numéricos son las pérdidas finales de entrenamiento:

| Tarea | Variante DINOv3 | Episodios | Fotogramas (30 Hz) | Pérdida final de entrenamiento |
|---|---|---|---|---|
| Open_The_Box | frozen | 10 | 13.576 | 0,036 |
| Open_The_Box | dino_last4 | 10 | 13.576 | 0,037 |
| Clean_The_Cup | frozen | 11 | 11.641 | 0,027 |
| Clean_The_Cup | dino_last4 | 11 | 11.641 | 0,027 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 12,1 GB, pero cada política individual (ViT-B/16 más transformer de acciones) es sustancialmente menor.
- GPU recomendadas: no disponible. Por el tamaño del encoder ViT-B/16, una GPU consumer de gama media-alta debería ser suficiente para inferencia, aunque no se confirma en la información proporcionada.
- Compatibilidad con GPU consumer: probable por el tamaño del encoder, pero no confirmada en la documentación.
- Opciones de despliegue: librería `lerobot` (formato nativo del paquete); no se documentan otras opciones como vLLM, llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el control opera a 30 Hz según la frecuencia de grabación de los datos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Onol/nero-dexhand-dino-act-20261110 | ACT + DINOv3 ViT-B/16 | Manipulación diestra bimanual (NERO + Wuji Hand 2) | 10-11 episodios por tarea | dinov3 | Hugging Face, 0 descargas |
| Políticas ACT estándar de LeRobot | ACT + encoder ResNet | Manipulación genérica | Variable | Apache 2.0 (habitual) | Hugging Face / LeRobot |
| Políticas basadas en DINOv2 (reproducción CoRP en LIBERO) | ACT + DINOv2 ViT-S | Manipulación en simulación (28 tareas) | Benchmark LIBERO | Variable | Referencia citada en la model card |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ninguno de los cuatro modelos ha sido evaluado sobre el robot real; el rendimiento en ejecución es desconocido.
- Los conjuntos de entrenamiento son muy pequeños (10-11 episodios), lo que limita la generalización y aumenta el riesgo de sobreajuste.
- El modelo está especializado en dos tareas concretas y un hardware específico (brazos NERO y manos Wuji Hand 2); no es transferible directamente a otras plataformas sin reentrenamiento.
- No dispone de capacidades lingüísticas, de razonamiento simbólico ni de tool calling.
- El dataset de entrenamiento es privado, lo que dificulta la reproducción externa del entrenamiento (aunque los paquetes incluyen evidencia y validación offline).
- La licencia DINOv3 de Meta impone restricciones de uso que deben revisarse antes de cualquier aplicación comercial; los materiales adicionales se distribuyen bajo licencia `other`.
- La hipótesis de que el ajuste parcial de los últimos 4 bloques recupera la mayor parte de la brecha de rendimiento está tomada de un experimento en simulación (LIBERO) y no se ha validado en este dominio.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erróneas o inseguras en el robot, dado que no hay evaluación real publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Onol/nero-dexhand-dino-act-20261110
- Licencia DINOv3 incluida en el paquete: https://huggingface.co/Onol/nero-dexhand-dino-act-20261110/blob/main/open_the_box/frozen/DINOv3-LICENSE.md
- Modelo base DINOv3: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
- Dataset de entrenamiento (privado): https://huggingface.co/datasets/Onol1280/RSS27-dexhand
- Librería LeRobot: https://github.com/huggingface/lerobot
