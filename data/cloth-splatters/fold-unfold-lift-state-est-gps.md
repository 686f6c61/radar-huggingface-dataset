# Cloth-splatters/fold-unfold-lift-state-est-gps

## Resumen

El modelo `Cloth-splatters/fold-unfold-lift-state-est-gps` es un estimador de estado para mallas de tela (cloth meshes) desarrollado por el autor Cloth-splatters. Su función principal es reconstruir el estado completo de una malla de tela (posiciones de los vértices) a partir de una observación parcial en forma de nube de puntos, utilizando un proceso de difusión DDPM (Denoising Diffusion Probabilistic Models). La arquitectura combina un GNN (Graph Neural Network) con un Transformer, condicionado por la posición de reposo (rest state) y la topología de cada tela individual, sin depender de una plantilla global.

El modelo se entrenó específicamente con datos de tareas de plegado, desplegado y levantamiento de telas (`fold_unfold_lift_seed_1397.h5`), y está diseñado para entornos de simulación. Su relevancia radica en abordar un problema complejo de percepción robótica: la estimación de estado deformable en tiempo real, un reto para la manipulación robótica de materiales no rígidos. Sin embargo, la convención de centrado utilizada (`pcd`) limita su uso práctico a simulación, ya que con nubes de puntos reales de cámaras la plantilla canónica vive en un marco de coordenadas distinto, lo que produce entradas no vistas durante el entrenamiento.

El checkpoint se publica con la librería `diffusers` y está disponible en HuggingFace, aunque el repositorio tiene un tamaño de 0.0 GB (posiblemente solo contiene configuración y pesos en formato safetensors, aunque no se especifica). No se proporcionan datos sobre el número de parámetros, contexto, idiomas ni licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GNN + Transformer con difusión DDPM (graph-based state estimation) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo procesa mallas de vértices variables, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags), aunque no se confirma en la model card |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida GNN + Transformer para estimar el estado de mallas de tela con número variable de vértices. La entrada es una nube de puntos parcial que observa parte de la tela, junto con la posición de reposo (rest positions) y la topología de la malla (conectividad entre vértices). El proceso de reconstrucción se formula como un problema de difusión DDPM: el modelo aprende a denoizar un estado ruidoso de la malla hasta recuperar el estado completo, condicionado por la observación parcial y la geometría de referencia.

El entrenamiento se realizó con datos de tareas de plegado, desplegado y levantamiento (`fold_unfold_lift_seed_1397.h5`). La convención de centrado de las posiciones de reposo es `pcd`: se resta el centroide de la nube de puntos observada en el mismo frame. Este enfoque acopla el marco de referencia de la plantilla a la observación, lo que funciona en simulación pero falla con datos reales de cámara. El modo de cross-attention es `parallel`, que fusiona self-attention y cross-attention de forma paralela, una opción que se añadió posteriormente a la configuración y se rellenó retroactivamente en `model/config.json` para evitar errores silenciosos de carga.

No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset, ni uso de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales más allá de la combinación GNN + Transformer con difusión.

## Capacidades

- Reconstrucción de estado completo de mallas de tela a partir de observaciones parciales en forma de nube de puntos.
- Condicionamiento por la posición de reposo y la topología de cada malla individual, sin necesidad de una plantilla global.
- Manejo de mallas con número variable de vértices gracias al enfoque basado en grafos.
- Generación de múltiples hipótesis de estado mediante el proceso de difusión DDPM (muestreo estocástico).
- Integración con pipelines de simulación robótica para tareas de manipulación de materiales deformables.
- Compatibilidad con la librería `diffusers` para carga y uso mediante `from_pretrained`.

## Casos de uso

- Manipulación robótica de telas en simulación: el modelo puede estimar el estado de una tela durante tareas de plegado o desplegado, proporcionando retroalimentación en tiempo real a un controlador robótico.
- Planificación de movimientos para robots blandos: al reconstruir la malla completa, un planificador puede calcular trayectorias que eviten arrugas o dobleces no deseados.
- Simulación de física inversa: dado un punto de observación parcial, el modelo infiere el estado subyacente que puede usarse para calibrar parámetros de simulación.
- Entrenamiento de políticas de aprendizaje por refuerzo: el estimador de estado actúa como observación densa para agentes que aprenden a manipular telas en entornos simulados.
- Validación de algoritmos de percepción: sirve como referencia para comparar métodos de estimación de estado deformable en entornos controlados.
- Investigación en difusión aplicada a dominios no visuales: el modelo demuestra el uso de DDPM para reconstrucción de mallas, un caso de uso menos común que la generación de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como error de reconstrucción, precisión de vértices ni comparaciones con otros métodos.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware. Dado que el tamaño del repositorio es 0.0 GB y no se especifican parámetros, no es posible estimar la VRAM necesaria. Se recomienda consultar el repositorio de entrenamiento (no enlazado) para obtener detalles sobre la configuración de inferencia. En principio, un modelo GNN + Transformer con difusión podría ejecutarse en GPUs de consumo medio si el número de vértices es moderado, pero no hay datos que lo confirmen.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (estimación de estado de mallas deformables con difusión). Los checkpoints mencionados en la búsqueda (`fold-unfold-lift-state-est-gps-flow-v2` y `fold-unfold-lift-state-est-gps-sequential`) son variantes del mismo autor, pero no se proporcionan detalles comparativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Sim-only en la práctica**: la convención de centrado `pcd` acopla la plantilla a la observación, lo que hace que el modelo no funcione correctamente con nubes de puntos reales de cámaras. Para uso real, se recomienda usar checkpoints entrenados con `rest_pos_centering: self`.
- **Riesgo de errores silenciosos**: el modo de cross-attention `parallel` es específico de este checkpoint. Si se carga con un modo diferente (por ejemplo, `sequential`), los parámetros compartidos se cargan sin error pero la inferencia produce resultados no entrenados.
- **Dependencia de la configuración**: es imprescindible respetar la convención de centrado y el modo de cross-attention al usar el modelo; de lo contrario, las predicciones serán incorrectas.
- **Alcance limitado**: el modelo solo se entrenó para tareas de plegado, desplegado y levantamiento de telas; no se garantiza su rendimiento en otros escenarios de deformación.
- **Licencia y uso comercial**: no se especifica la licencia, por lo que se desconoce si permite uso comercial o modificaciones.
- **Falta de documentación**: no hay información sobre parámetros, contexto, idiomas ni requisitos de hardware, lo que dificulta su evaluación y despliegue.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Cloth-splatters/fold-unfold-lift-state-est-gps)
- [Checkpoint variante con flow y centrado self](https://huggingface.co/Cloth-splatters/fold-unfold-lift-state-est-gps-flow-v2)
- [Checkpoint variante sequential con centrado self](https://huggingface.co/Cloth-splatters/fold-unfold-lift-state-est-gps-flow-sequential)
