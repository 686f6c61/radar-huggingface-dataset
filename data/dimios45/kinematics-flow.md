# Dimios45/kinematics-flow

## Resumen

Kinematics Flow es un modelo de generación de grasps (agarres robóticos) multi-embodiment con equivarianza SE(3), desarrollado por Bosch Research y publicado en el artículo "Towards a Multi-Embodied Grasping Agent" (arXiv:2510.27420). Los checkpoints aquí presentados, subidos por el usuario Dimios45, son puntos intermedios y finales del entrenamiento, incluyendo variantes single-embodiment (Panda, Shadow Hand) y multi-embodiment (todos los efectores), así como una extensión con condicionamiento por seed point basada en SeededGrasp (arXiv:2607.20207).

El modelo resuelve el problema de generar posturas de agarre válidas y diversas para distintos robots con una única red, aprovechando la equivarianza rotacional y traslacional para generalizar sin aumentación de datos. Su relevancia actual radica en que permite entrenar un solo agente para múltiples efectores finales, reduciendo costes de recopilación de datos y facilitando la transferencia entre plataformas. La arquitectura combina un encoder de escena con un flujo normalizador sobre la cinemática del robot, con aproximadamente 18,8 millones de parámetros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kinematics Flow: flujo normalizador sobre cinemática, encoder de escena con equivarianza SE(3) (irreps), UNet para el seed point |
| Parametros totales | 18,8 M (modelo base); ~10 k adicionales en `unet.seed_mlp` para versiones seed |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoints en fp32) |
| Idiomas soportados | no aplica |
| Licencia | AGPL-3.0 |
| Formato de pesos | orbax/OCDBT (checkpoints de JAX/Flax) |

## Arquitectura y entrenamiento

Kinematics Flow es un modelo generativo que modela la distribución de posturas de agarre válidas para un robot dado, condicionado a una escena observada. La arquitectura principal es un flujo normalizador que transforma una distribución latente simple en la distribución de configuraciones articulares, garantizando equivarianza SE(3) mediante el uso de representaciones en irreps en el encoder de escena. El modelo procesa la nube de puntos de la escena y produce una distribución sobre los grados de libertad del efector, permitiendo muestrear múltiples candidatos de agarre.

El entrenamiento se realizó con 5.000 escenas para los modelos single-embodiment y 25.000 para el multi-embodiment, en precisión fp32, con batch de 5 escenas × 128 grasps y un programador de learning rate warmup-cosine con pico en 3e-4. Los modelos single se entrenaron en una RTX 6000 Ada, mientras que el multi-embodiment se entrenó en 3× MI300X (ROCm) a partir de la época 30. La extensión seed-conditioned se fine-tuneó desde el checkpoint final `me-full_25000_120`, añadiendo un seed point expresado en irreps que se incorpora como una arista virtual en el encoder de escena, preservando la equivarianza por construcción.

## Capacidades

- Generación de grasps para múltiples efectores finales: Panda (2 DOF), VX300 (2 DOF), DexEE (12 DOF), Allegro (16 DOF) y Shadow Hand (22 DOF), con un único modelo multi-embodiment.
- Equivarianza SE(3): las predicciones son invariantes a rotaciones y traslaciones de la escena, lo que mejora la generalización sin aumentación.
- Condicionamiento por seed point: permite especificar qué objeto de la escena debe agarrarse, mediante un punto 3D que se introduce como arista virtual en el encoder.
- Generación de posturas diversas: la métrica NJD (normalized joint diversity) cuantifica la variedad de soluciones, alcanzando valores de 0,13 a 0,29 según el efector.
- Fine-tuning desde checkpoints: los checkpoints incluyen estado del optimizador, permitiendo continuar el entrenamiento o adaptar a nuevos robots.
- Compatibilidad con el ecosistema JAX/Flax: integración con el repositorio oficial `kinematics-flow` y su CLI de evaluación.

## Casos de uso

- Planificación de agarre en robótica de manipulación: el modelo genera cientos de candidatos de agarre para un robot y una escena dados, que pueden filtrarse por métricas de calidad o colisiones antes de ejecutarse en el robot real.
- Selección de objeto en escenas con múltiples objetos: gracias al seed point, se puede indicar explícitamente qué objeto agarrar, lo que resulta útil en tareas de recogida y colocación en entornos desordenados.
- Transferencia entre plataformas robóticas: un solo modelo multi-embodiment puede servir para distintos brazos y manos, evitando reentrenar desde cero al cambiar de efector.
- Generación de datos de entrenamiento para políticas de aprendizaje: los grasps muestreados pueden usarse como supervisión para entrenar políticas visuomotoras o de imitación.
- Evaluación de arquitecturas de agarre en simulación: la CLI `kin_flow.cli.bench` permite reproducir las métricas SR y NJD en escenas de test, facilitando la comparación de variantes.
- Investigación en equivarianza geométrica: el modelo sirve como referencia para estudiar el impacto de la equivariancia SE(3) en tareas de manipulación, dado su diseño basado en irreps.

## Benchmarks y rendimiento

Las métricas se obtuvieron en simulación con 10 escenas de test y 100 grasps muestreados por escena (SR: tasa de éxito de agarre; NJD: diversidad articular normalizada). Los resultados de los checkpoints principales son:

| Checkpoint | Tipo | SR medio | NJD medio |
|---|---|---|---|
| `se-panda_5000_170` | single-embodiment (Panda) | 97,8% | 0,293 |
| `se-shadow_5000_40` | single-embodiment (Shadow Hand) | 75,9% | 0,232 |
| `me-full_25000_5` | multi-embodiment | 82,1% | 0,212 |
| `me-full_25000_30` | multi-embodiment | 84,3% | 0,203 |
| `me-full_25000_90` | multi-embodiment | 86,4% | 0,212 |
| `me-full_25000_120` | multi-embodiment (final) | 86,1% | 0,209 |

Para el modelo final `me-full_25000_120`, el desglose por gripper es: Panda 97,5% SR, VX300 97,4%, DexEE 73,0%, Allegro 85,4% y Shadow Hand 77,3%. En la extensión seed-conditioned, el checkpoint recomendado `me-seed-anneal_25000_4` alcanza una métrica `targeted` de 0,4582 en Panda, con una ganancia total de +151% respecto al modelo sin seed tras proyección de colisiones. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- Inferencia: al tratarse de un modelo de 18,8 M de parámetros en fp32, el uso de VRAM es reducido (inferior a 1 GB para los pesos). Cualquier GPU consumer con al menos 4 GB (p. ej., RTX 3060, RTX 4060) puede ejecutarlo sin problemas.
- Entrenamiento: los checkpoints single-embodiment se entrenaron en una RTX 6000 Ada (48 GB); el multi-embodiment usó 3× MI300X (ROCm) con 192 GB de HBM en total. Para fine-tuning en una sola GPU, una RTX 4090 (24 GB) sería suficiente dado el tamaño del modelo.
- Despliegue: requiere el entorno JAX/Flax con orbax para cargar los checkpoints. No es compatible con vLLM, Ollama ni llama.cpp, al no ser un modelo de lenguaje.
- Latencia: no se han publicado mediciones de latencia o throughput. Al ser un modelo pequeño, se espera una generación de grasps en milisegundos en GPU moderna, pero depende del tamaño de la nube de puntos de entrada.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa rigurosa con otros modelos de generación de grasps multi-embodiment. Se menciona IKFlow (otro flujo normalizador para cinemática inversa) en los resultados de búsqueda, pero no es directamente comparable al operar sobre un único robot y sin equivariancia SE(3). Por tanto, la comparativa se limita a los propios checkpoints del modelo, que muestran una mejora progresiva del SR a lo largo del entrenamiento y una superioridad clara del modelo multi-embodiment sobre los single-embodiment en términos de generalización.

## Limitaciones y advertencias

- Los checkpoints `se-panda_5000_170` y `se-shadow_5000_40` son intermedios (épocas 170/500 y 40/500 respectivamente), no modelos convergidos; su rendimiento puede mejorar con más entrenamiento.
- Las métricas SR y NJD se obtuvieron exclusivamente en simulación; el rendimiento en robots reales puede degradarse debido al gap de realidad.
- La licencia AGPL-3.0 es copyleft: cualquier uso o modificación que se distribuya debe publicarse bajo la misma licencia, lo que puede ser restrictivo para aplicaciones comerciales propietarias.
- El formato de pesos es orbax/OCDBT, específico de JAX/Flax; no es compatible con frameworks estándar como PyTorch o TensorFlow sin conversión manual.
- Los checkpoints `me-full_25000_*` se entrenaron con flax 0.11 y una disposición de parámetros concreta (`nnx.Param` en `TPWithWeightsAndBiases`); restaurarlos requiere una versión de código coincidente, ya que no son compatibles con la disposición original.
- El modelo seed-conditioned depende de la calidad del seed point proporcionado; un seed incorrecto puede degradar la selección del objeto objetivo.
- No se han evaluado sesgos o riesgos de alucinación, al no ser un modelo de lenguaje; el riesgo principal es la generación de grasps inviables en escenas no vistas, mitigado parcialmente por la equivariancia.

## Enlaces

- HuggingFace: https://huggingface.co/Dimios45/kinematics-flow
- Repositorio oficial: https://github.com/boschresearch/kinematics-flow
- Paper "Towards a Multi-Embodied Grasping Agent": https://arxiv.org/abs/2510.27420
- Paper SeededGrasp: https://arxiv.org/abs/2607.20207
