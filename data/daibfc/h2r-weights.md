# daibfc/h2r-weights

## Resumen

H2R es un conjunto de pesos de políticas de control corporal completo (whole-body control) para el robot humanoide Unitree G1, publicado por el usuario daibfc. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino un artefacto de robótica: políticas residuales entrenadas con PPO en Isaac Lab sobre el modelo base congelado SONIC de NVIDIA (GR00T-WholeBodyControl). Su tarea concreta es la locomoción con manipulación (loco-manipulation): caminar hasta una caja, recogerla, transportarla y depositarla.

El repositorio incluye varias variantes: políticas para manos de goma (R15) y manos Dex3 (P23), una política de agarre degenerado de segunda generación (`degen_v2_19k`) con mejor rendimiento, una política con recompensa de apriete (`squeeze_avg10_12k`) y una matriz de direccionamiento por tokens (`steering/A_nav150.npz`) para controlar la velocidad de marcha. Los pesos se entrenaron exclusivamente sobre movimientos retargetizados del dataset OMOMO (categoría `largebox`), con referencias limpias y corruptas emparejadas.

La relevancia actual es acotada pero específica: demuestra que es posible construir políticas de loco-manipulación desplegables sobre un humanoide comercial asequible (Unitree G1) usando un estimador de caja basado en cámara virtual y odometría en lugar de la pose privilegiada del simulador, y publica los números de éxito de forma transparente, incluidas las limitaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política residual (MLP/red neuronal) sobre el modelo base congelado SONIC (GR00T-WholeBodyControl de NVIDIA); entrenada con PPO en Isaac Lab |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (robótica) |
| Licencia | NVIDIA Open Model License (etiquetada como `other` en Hugging Face) |
| Formato de pesos | PyTorch `.pt` (`model_step_015000.pt`, incluye pesos de SONIC congelado); matriz de steering en `.npz` (`steer_basis_v1`) |

## Arquitectura y entrenamiento

Las políticas son residuales: la salida de la política se suma a las acciones de un modelo base SONIC congelado (NVIDIA GR00T-WholeBodyControl). Se entrenaron con PPO en Isaac Lab sobre movimientos retargetizados del dataset OMOMO, concretamente la categoría `largebox`, con pares de referencias limpias y corruptas. Las entradas varían según la variante: la política R15 usa un estimador de caja desplegable (cámara virtual más odometría, sin verdad del simulador), mientras que la P23 usa la pose de caja privilegiada del simulador. La variante `degen_v2_19k` emplea la misma arquitectura que R15 (manos de goma, entradas del estimador de caja, sin nube de puntos) y se entrenó con un corpus "box-mix place-A" más familias de referencia de agarre degenerado, a escala de caja 0.7601.

La innovación técnica destacable es el esquema de *pace steering* mediante tokens: la matriz `A_nav150` de formato `steer_basis_v1` mapea un comando de corrección de pelvis (avance, lateral; unidades `token_per_cm`) a un desplazamiento sobre los tokens del codificador `encoder:g1` de SONIC. La matriz se calibró con 2124 empujones isotrópicos de 64 dimensiones sobre un conjunto de clips de HOIFHLI y OMOMO, con regularización ridge λ = 1, y presenta un R² en validación cruzada de 0.11 (avance) y 0.23 (lateral). La receta de despliegue aplica steering desde el inicio del episodio hasta 1 s después del levantamiento planificado (preset `+steering=nav150_off1`).

## Capacidades

- Control de locomoción bípeda del Unitree G1 para aproximarse a una caja.
- Agarre y levantamiento de una caja (pickup) con manos de goma R15 o manos Dex3 P23.
- Transporte de la caja caminando y depósito en una posición objetivo.
- Estimación de la posición de la caja a partir de cámara virtual y odometría (variante R15, desplegable sin verdad del simulador).
- Direccionamiento de la velocidad de marcha mediante comandos de pelvis traducidos a tokens (matriz `A_nav150`).
- Evaluación híbrida: base SONIC hasta que una muñeca planificada está a menos de 0.55 m de la caja, residual después.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de control motor.

## Casos de uso

- Investigación en loco-manipulación con humanoides: servir de línea base reproducible para comparar nuevas políticas residuales sobre SONIC en la tarea de recoger, transportar y depositar una caja.
- Despliegue en un Unitree G1 real con manos de goma: la variante R15 usa un estimador de caja basado en cámara y odometría, por lo que no requiere la pose privilegiada del simulador y es la única directamente desplegable del repositorio.
- Automatización de logística de cajas ligeras en laboratorio: transporte de una caja de tamaño fijo entre posiciones, con la advertencia de que R15 está entrenada para una única caja y escala.
- Estudio de robustez ante referencias corruptas: el entrenamiento con pares limpios/corruptos de OMOMO permite analizar la tolerancia de la política a errores en la referencia de movimiento.
- Control de velocidad en tareas de navegación: la matriz `A_nav150` permite modular el avance y el desplazamiento lateral del robot mediante comandos de pelvis, útil para integrar la política en un planificador de navegación de nivel superior.
- Evaluación comparativa de hardware: los resultados publicados distinguen ejecución en A100 y RTX 3090, lo que permite usar el repositorio como referencia de rendimiento entre GPUs de centro de datos y de consumo.
- Investigación en agarre degenerado: la variante `degen_v2_19k` con familias de referencia de agarre degenerado sirve para estudiar estrategias de agarre cuando la prensión nominal no es viable.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre HOI2ROI feasible43 (43 casos fuera de distribución de pick-carry-place por 8 episodios), caja `largebox` a tamaño completo, sin steering:

| Política | Pickup | Éxito (pickup y caja a ≤ 30 cm del objetivo) |
|---|---|---|
| R15, estimador de caja (emulador) | 29.4% | 20.1% |
| R15, pipeline de cámara real (sim) | 29.7% | 20.9% |
| P23 (pose privilegiada) | 20.3% | 11.3% |

Resultados de `degen_v2_19k` evaluado como híbrido (base SONIC hasta 0.55 m de la muñeca planificada, residual después, más steering con `A_nav150`), caja a escala 0.7601, 344 episodios:

| Política | Pickup | Éxito |
|---|---|---|
| degen_v2 19k híbrido | 58.7% | 40.7% |

Resultados de steering sobre la política `squeeze_avg10_12k` (HOI2ROI feasible43, escala 0.7601, 4 episodios por caso, semillas 506-509, 1376 episodios):

| Steering | Pickup | Éxito |
|---|---|---|
| Producción: A_sonic hasta el levantamiento planificado | 72.6% | 56.9% |
| A_nav150 hasta levantamiento + 1 s | 74.9% | 59.7% |

Desglose por máquina (688 episodios cada una, pickup/éxito): A100 496/397 → 515/406; RTX 3090 503/386 → 516/415. La ganancia en pickup es consistente; la ganancia en éxito depende de la máquina y está cerca del ruido por semilla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio pesa 1.1 GB e incluye los pesos de SONIC congelado dentro de cada checkpoint.
- GPU recomendadas: los resultados publicados se obtuvieron en A100 y RTX 3090 (entrenamiento y evaluación en Isaac Lab).
- Cabe en GPU de consumo: sí, se ha evaluado en RTX 3090.
- Opciones de despliegue: el fork de GR00T-WholeBodyControl usado para el entrenamiento, mediante `scripts_sonic_render/eval/run_eval.py --checkpoint <folder>/model_step_015000.pt`, que lee el `config.yaml` junto al checkpoint. Para el benchmark híbrido: `scripts_sonic_render/benchmark_hybrid.sh` y `docs/DEGEN_V2_HYBRID.md`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H2R (este repositorio) | Política residual PPO | SONIC (GR00T-WholeBodyControl) | Loco-manipulación de caja en Unitree G1 | NVIDIA Open Model License | Pesos en Hugging Face, 0 descargas |
| SONIC (NVIDIA GR00T-WholeBodyControl) | Modelo base de control corporal completo | — | Control corporal completo de humanoides | no disponible | Referenciado como base congelada; pesos incluidos en los checkpoints |
| `daibfc/h2r-steering` | Matriz de direccionamiento por tokens | Calibrada sobre SONIC | Control de velocidad de marcha | no disponible | Hugging Face |

No se dispone de datos de benchmarks de modelos alternativos comparables en la información proporcionada.

## Limitaciones y advertencias

- La variante R15 está entrenada para una única caja y una única escala; no generaliza a otros tamaños u objetos.
- Los números de HOI2ROI se obtuvieron con una caja a tamaño completo, pero los movimientos de referencia se generaron para una caja escalada ×0.76 (~25 cm); la model card advierte explícitamente de esta discrepancia.
- La variante P23 depende de la pose de caja privilegiada del simulador y no es desplegable en el robot real tal cual.
- La matriz de steering `A_nav150` es específica de la política sobre la que se calibró; debe verificarse antes de usarla con otros checkpoints.
- La ganancia de éxito del steering depende de la máquina y está cerca del ruido por semilla; la ganancia de pickup es la consistente.
- El repositorio no incluye datos de movimiento; los movimientos de entrenamiento derivan del dataset OMOMO y los pesos de NVIDIA SONIC, sujetos a la NVIDIA Open Model License, lo que impone restricciones para uso comercial que deben revisarse.
- No hay información sobre sesgos, alucinación o comportamiento multilingüe por tratarse de una política de control motor.
- El repositorio tiene 0 descargas y 0 likes, sin validación independiente por parte de la comunidad.
- No se han publicado resultados en hardware real; todas las cifras provienen de simulación (Isaac Lab).

## Enlaces

- Hugging Face: https://huggingface.co/daibfc/h2r-weights
- Repositorio de steering: https://huggingface.co/daibfc/h2r-steering
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Dataset OMOMO: no disponible en la información proporcionada
- Fork de GR00T-WholeBodyControl: no disponible enlace directo en la información proporcionada
