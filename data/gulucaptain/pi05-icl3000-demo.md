# gulucaptain/pi05-icl3000-demo

## Resumen

π0.5 + RGB Demo on RoboICL3000 es un checkpoint de investigación derivado del modelo base oficial π0.5 (`pi05_base`) de OpenPI, especializado en aprendizaje visual en contexto (*visual-in-context-learning*) para control robótico. Lo publica el usuario `gulucaptain` en Hugging Face y su función es demostrar que un modelo de política visuomotora puede condicionarse en tiempo de inferencia mediante un vídeo de demostración RGB, sin necesidad de instrucciones textuales ni de las acciones o estados de la demostración.

El modelo parte de la arquitectura π0.5 (vision-language-action, VLA) y le añade módulos "Demo" que permiten inyectar un vídeo de demostración independiente muestreado a 5 Hz. La entrada combina ese vídeo superior RGB, el fotograma RGB actual de la consulta y el estado medido de la mano (`world-hand10`); la salida son 50 comandos de mano a 50 Hz. Durante el entrenamiento se congelan los pesos de SigLIP y del transformer nativo, aplicando LoRA a las proyecciones de atención y MLP.

Es relevante porque explora una vía poco común en robótica: el condicionamiento en contexto a partir de vídeo, en lugar de fine-tuning por tarea o prompting textual. No obstante, se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin resultados de éxito medidos publicados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π0.5 de OpenPI, con módulos Demo añadidos y LoRA en atención/MLP |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrada: vídeo demo a 5 Hz, frame RGB actual y estado world-hand10; salida: 50 comandos a 50 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; sin texto de tarea) |
| Licencia | no disponible (sujeto a los términos de OpenPI, Gemma y del dataset RoboICL3000) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint se inicializa desde el `pi05_base` oficial de OpenPI y conserva elementos clave de π0.5: tokens discretos de estado y normalización adaRMSNorm condicionada por tiempo. Sobre esa base se añaden módulos Demo que permiten procesar un vídeo de demostración independiente como contexto. SigLIP y los pesos del transformer nativo permanecen congelados; se entrena mediante LoRA en las proyecciones de atención y MLP, mientras que los módulos Demo nuevos y las proyecciones de acción y tiempo siguen siendo entrenables. La inferencia requiere el `pi05_base` oficial correspondiente.

El entrenamiento usa el dataset RoboICL3000 con la partición de familias A+B y pares Demo–Query independientes. Se completaron 3 épocas completas sobre fotogramas de consulta y 3615 actualizaciones del optimizador; el checkpoint publicado (`epoch-003`) corresponde a un límite de época. Los estados del optimizador no se subieron. La model card advierte explícitamente de que una subida correcta no implica una tasa de éxito medida, y remite a los resultados de evaluación específicos de cada ejecución cuando estén disponibles.

## Capacidades

- Control robótico visuomotor: genera 50 comandos de mano (`hand10`) a 50 Hz a partir de observaciones RGB y estado.
- Aprendizaje visual en contexto: se condiciona con un vídeo de demostración RGB independiente muestreado a 5 Hz, sin necesidad de texto de tarea.
- Uso sin acciones ni estados de la demostración: solo requiere el vídeo demo, el frame RGB actual y el estado medido de la mano.
- Aprovechamiento de la base π0.5: hereda el modelado VLA de OpenPI, incluidos tokens discretos de estado y adaRMSNorm condicionada por tiempo.
- No se documentan capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, tool calling ni agentes multi-paso.
- No se documentan capacidades multilingües ni modos de pensamiento, visión general o audio.

## Casos de uso

- Investigación en aprendizaje en contexto para robótica: usar el checkpoint para estudiar cómo un vídeo de demostración modula la política sin reentrenamiento, aprovechando que los módulos Demo son la única parte entrenable junto con LoRA.
- Reproducción de experimentos de RoboICL3000: servir como referencia de la partición A+B y de los pares Demo–Query para comparar variantes de condicionamiento por vídeo.
- Prototipado de manipulación con mano de 10 grados de libertad: generar secuencias de 50 comandos a 50 Hz para evaluar el control de una mano robótica en laboratorio.
- Base para ablaciones de LoRA: al mantener congelados SigLIP y el transformer nativo, permite medir el impacto de adaptar solo atención y MLP frente a otras estrategias.
- Estudio de condicionamiento temporal: el uso de adaRMSNorm condicionada por tiempo y de un vídeo demo a 5 Hz sirve para analizar la sensibilidad a la frecuencia de muestreo del contexto.
- Evaluación de generalización entre familias de tareas: la partición A+B del dataset permite probar la transferencia del modelo a configuraciones no vistas durante el entrenamiento.
- Docencia y divulgación: ejemplo práctico de pipeline VLA con OpenPI, útil para explicar la integración de vídeo como contexto en políticas robóticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que una subida correcta no implica una tasa de éxito medida y remite a los resultados de evaluación por ejecución cuando existan.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 4,7 GB, lo que da una cota inferior del espacio en disco, pero no de la VRAM necesaria.
- GPU recomendadas: no disponible. Al tratarse de un derivado de π0.5 con SigLIP y transformer congelados, se espera que requiera una GPU de centro de datos, pero el autor no publica requisitos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. La model card solo indica que la inferencia requiere el `pi05_base` oficial de OpenPI y que las versiones de dependencias están en el directorio `source` del run.
- Latencia y throughput: no disponibles. La salida es de 50 comandos a 50 Hz, pero no se documenta el tiempo de cómputo por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 + RGB Demo (este checkpoint) | no disponible | vídeo demo a 5 Hz + frame actual + estado | VLA con aprendizaje visual en contexto y LoRA | no disponible | Hugging Face, 0 descargas |
| π0.5 base (OpenPI) | no disponible | no disponible | VLA oficial de referencia | términos de OpenPI/Gemma | OpenPI |
| Modelos VLA con prompting textual (p. ej. familias tipo RT/OpenVLA) | no disponible | no disponible | condicionamiento por instrucción de tarea | variable | variable |

No se dispone de datos de rendimiento comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica licencia propia y el uso queda sujeto a los términos de OpenPI, Gemma y del dataset RoboICL3000, lo que impide confirmar si se permite uso comercial.
- Sin métricas de éxito: el autor advierte que la subida no implica una tasa de éxito medida; no hay evaluación publicada.
- Artefacto de investigación: 0 descargas y 0 likes en el momento de la consulta, sin validación externa.
- Dependencia del modelo base: la inferencia exige el `pi05_base` oficial y versiones concretas de dependencias, lo que complica la reproducibilidad.
- Estados del optimizador no incluidos: no es posible reanudar el entrenamiento exactamente desde el checkpoint.
- Ámbito restringido: el modelo no está pensado para texto, código ni tareas generales; su evaluación se limita a manipulación con `hand10` en RoboICL3000.
- Riesgo de sobreajuste a la partición A+B y a las condiciones de captura del vídeo demo (5 Hz, cámara superior).
- Sesgos y alucinaciones: no documentados, pero al ser una política robótica existe riesgo de acciones erróneas o inseguras en entornos reales.
- Fecha de creación indicada como 2026-11-14, posterior a la fecha habitual de consulta; conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/gulucaptain/pi05-icl3000-demo
- Checkpoint entrenado: `runs/pi05-lora-cached-sdpa-b256-e50-20261114-02-f33d99c88aeb/checkpoints/epoch-003` (dentro del repositorio)
- Código y versiones de dependencias: `runs/pi05-lora-cached-sdpa-b256-e50-20261114-02-f33d99c88aeb/source` (dentro del repositorio)
- OpenPI (modelo base π0.5): no disponible en la información proporcionada
- Dataset RoboICL3000: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
