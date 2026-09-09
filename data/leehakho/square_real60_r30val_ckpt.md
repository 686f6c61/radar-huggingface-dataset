# LeeHakHo/square_real60_r30val_ckpt

## Resumen

Este modelo es un checkpoint de política de difusión (diffusion-policy) para behavior cloning en robótica, desarrollado por LeeHakHo. Está entrenado sobre demostraciones reales de un brazo Franka en la tarea Square (insertar una tuerca en un pasador), sin simulador. El objetivo es evaluar si añadir objetivos auxiliares de pose al encoder visual mejora la generalización.

El repositorio contiene tres variantes que comparten la misma arquitectura y configuración: una baseline, una con supervisión auxiliar de pose en el frame del mundo y otra en el frame del efector. Todas se entrenaron durante 1000 épocas en 60 demostraciones (5 held-out para validación). La métrica de validación es el error cuadrático medio (MSE) de la acción. Los checkpoints que se publican son de las épocas 100 a 1000, que ya están pasados del mínimo de validación.

Nota: el modelo no es un modelo de lenguaje; es un modelo de acción para manipulación robótica. No tiene parámetros de texto ni contexto extenso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion-policy behavior cloning (modelo de difusión que genera secuencias de acciones) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (emplea secuencias de 16 pasos, no contexto de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth, los checkpoints incluyen estado del optimizador) |

## Arquitectura y entrenamiento

La arquitectura es una diffusion-policy basada en modelos de difusión denoising. El modelo toma observaciones visuales a 84 píxeles y genera bloques de acción de 16 pasos (seq_length 16). Las tres variantes comparten un único backbone, una única configuración y se entrenaron en una GPU A40. La diferencia está en la pérdida auxiliar que se añade al encoder visual: la baseline no tiene ninguna; aux_world_frame predice la pose y el yaw del objeto en el sistema de coordenadas mundial; aux_eef_frame predice la pose en el sistema de referencia del efector, con posición residual y yaw relativo, lo que la hace invariante a la rotación global del eje Z.

El entrenamiento usa 65 demostraciones reales de un brazo Franka (27 096 fotogramas), de las cuales 60 se usan para entrenar y 5 quedan fuera para validación (demo_60 a demo_64). Se entrenó durante 1000 épocas. La supervisión auxiliar usa el seguimiento FoundationPose para el objeto, que no es pose real (ground truth): el 1,88 % de los fotogramas tiene obs/aux_valid=0 y se excluye de la pérdida auxiliar. El valor aux_valid se lee directamente del HDF5 y nunca es una entrada de la política.

La pérdida de validación se registra como la pérdida de acción (l2_loss) sin añadir el término auxiliar, por lo que las tres variantes son comparables directamente.

## Capacidades

- Genera secuencias de acciones de 16 pasos para controlar un brazo Franka en la tarea de ensamblaje Square (nut-on-peg).
- Aprende por imitación (behavior cloning) a partir de demostraciones reales, sin simulador.
- Ofrece tres variantes de entrenamiento para estudiar el efecto de pérdidas auxiliares de pose: baseline, aux_world_frame y aux_eef_frame.
- La variante aux_eef_frame codifica invariancia a rotación global Z, lo que puede facilitar la transferencia bajo cambios de orientación de la cámara.
- No soporta generación de texto, tool calling, razonamiento multilingüe ni ningún tipo de tarea de lenguaje.
- No se ha evaluado en éxito real en robot; la única capacidad medida es el MSE de acciones en 5 demostraciones de validación.

## Casos de uso

- Investigación en ablaciones de pérdidas auxiliares: este checkpoint permite comparar el efecto de añadir supervisión de pose en el frame mundial frente al frame del efector sobre el MSE de acciones.
- Estudio del sobreajuste en behavior cloning con pocas demostraciones: los pesos publicados (épocas 100-1000) permiten analizar cómo se degrada la validación tras el mínimo (épocas 21-31).
- Evaluación de métricas proxy para éxito robótico: se puede usar el MSE de acciones en las 5 demostraciones held-out como señal débil antes de ejecutar en hardware.
- Desarrollo de mecanismos de regularización: la comparación baseline vs aux objectives informa sobre si la supervisión auxiliar ayuda a sobreajustar menos.
- Análisis de representaciones visuales: mediante la variante aux_eef_frame se puede estudiar si una codificación de pose relativa al efector genera características más robustas a cambios de orientación.
- Base para fine-tuning en tareas de inserción similares: el checkpoint puede servir para transferir a otras tareas tipo nut-on-peg en Franka, aunque no se proporcionan resultados de éxito.
- Recurso educativo para diffusion-policy en robótica: sirve como ejemplo de entrenamiento de una política de difusión sobre datos reales, con una pérdida auxiliar y validación por MSE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque no es un modelo de lenguaje. El único dato de rendimiento disponible es la pérdida de acción de validación (MSE) sobre 5 demostraciones held-out:

| Brazo | Mejor loss de validación | Época del mínimo | Loss @ época 1000 |
|---|---|---|---|
| baseline | 0,0972 | 21 | 0,3620 |
| aux_world_frame | 0,1016 | 31 | 0,5123 |
| aux_eef_frame | 0,1050 | 31 | 0,4572 |

Los mínimos de las tres variantes no están en este repositorio; los checkpoints publicados corresponden a las épocas 100, 200, ..., 1000, todos posteriores al mínimo. El autor advierte que la diferencia de 0,004-0,008 entre baseline y las auxiliares no debe interpretarse como una conclusión, ya que la correlación con éxito real en robot es débil.

## Requisitos de hardware

- El entrenamiento y la validación se realizaron en una GPU NVIDIA A40, según la información del autor.
- Cada checkpoint pesa aproximadamente 1,57 GiB; el repositorio completo ocupa 49,3 GB.
- No se han publicado cifras de VRAM ni de latencia de inferencia.
- Se espera que el modelo pueda ejecutarse en GPUs de consumo (por ejemplo, RTX 4090) al ser una política pequeña de difusión, aunque no hay datos confirmados.
- Las opciones de despliegue típicas para LLM (vLLM, llama.cpp, Ollama, TGI) no aplican a este modelo. La integración se haría en Python/PyTorch, probablemente usando los checkpoints .pth.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en las fuentes proporcionadas. La comparación natural sería contra otras políticas de diffusion-policy entrenadas en el dataset robomimic Square, pero no se han publicado métricas de éxito en hardware. En consecuencia, no se puede presentar una tabla comparativa basada en datos reales.

## Limitaciones y advertencias

- Los checkpoints publicados (épocas 100-1000) están todos muy por encima del mínimo de validación (épocas 21-31), lo que indica sobreajuste a las 60 demostraciones de entrenamiento.
- Los mejores pesos (mínimos de validación) no se incluyen en el repositorio; quedaron en el almacenamiento del clúster.
- La métrica de validación es el MSE de acciones en solo 5 demostraciones reales; el autor indica que correlaciona débilmente con el éxito real en el robot.
- No hay evaluación en simulador ni en hardware, por lo que no se reporta tasa de éxito.
- La pérdida auxiliar usa seguimiento FoundationPose, que no es pose real y contiene un 1,88 % de fotogramas inválidos (enmascarados).
- Al no ser un modelo de lenguaje, no ofrece ningún tipo de capacidad textual (generación, razonamiento, tool calling, etc.).
- La licencia MIT permite uso comercial, pero no hay garantías de rendimiento ni de idoneidad para una aplicación concreta.
- No se proporciona el código de entrenamiento ni el dataset en la información disponible; solo se publican los checkpoints.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LeeHakHo/square_real60_r30val_ckpt
- La búsqueda web adicional solo devolvió páginas de soporte de Google y la portada de Hugging Face; no se encontraron papers, blogs ni repositorios complementarios en la información disponible.
