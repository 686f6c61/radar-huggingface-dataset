# ishitag925/pi05-bee-frame-pickup-yaw7-297-dagger200-from45500-full-20261112

## Resumen

Pi0.5 bee-frame pickup DAgger from step 45500 es un checkpoint de política robótica obtenido mediante fine-tuning del modelo Pi0.5 (Physical Intelligence) con la implementación oficial OpenPI. Lo publica el usuario ishitag925 en Hugging Face y está especializado en una tarea concreta de manipulación: la recogida (pickup) de un marco de colmena ("bee-frame") con un brazo robótico Piper-X y una orientación de yaw de 7, entrenado con datos DAgger (200 episodios) sobre un dataset LeRobot propio.

El modelo no es un LLM de propósito general, sino un modelo visión-lenguaje-acción (VLA) que mapea observaciones visuales y consigna de tarea a comandos motores. Su relevancia es la de un artefacto de investigación reproducible: expone la receta exacta (`run_config.json`, `project_config.py`), publica checkpoints cada 500 actualizaciones del optimizador y documenta explícitamente que no existe split de evaluación held-out, por lo que la pérdida de entrenamiento no demuestra éxito de la política.

Al tratarse de un fine-tuning sobre Pi0.5, hereda la arquitectura y el tamaño del modelo base, aunque la model card no detalla parámetros, contexto ni cuantizaciones. La información disponible se limita a metadatos de entrenamiento y formato de checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tuning de Pi0.5 con OpenPI; VLA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints OpenPI con parámetros completos de política y assets de normalización (no se especifica safetensors/GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Pi0.5, la política visión-lenguaje-acción de Physical Intelligence, y se ha ajustado con la implementación oficial OpenPI. La model card no describe la arquitectura interna (transformer, mezcla de expertos, etc.), por lo que este dato queda como no disponible. El pipeline declarado es `robotics` y la librería `openpi`.

El entrenamiento es un fine-tuning específico de tarea sobre el dataset `ishitag925/bee-frame-pickup-yaw7-297-dagger200-lerobot`, con 200 episodios recogidos mediante DAgger (Dataset Aggregation), una técnica de aprendizaje por imitación interactivo en la que un experto corrige las trayectorias del modelo. El punto de partida es el paso 45500 del entrenamiento previo. Los checkpoints se publican cada 500 actualizaciones del optimizador en `checkpoints/STEP/`, con etiquetas `step-STEP` coincidentes. Cada checkpoint incluye los parámetros completos de la política y los assets de normalización; el estado del optimizador permanece en MIT para poder reanudar. No hay split de evaluación held-out.

## Capacidades

- Control robótico de manipulación: genera acciones motoras para un brazo Piper-X orientadas a la tarea de pickup de un bee-frame con yaw 7.
- Política visión-lenguaje-acción: procesa observaciones visuales y consigna de tarea para producir comandos.
- Aprendizaje por imitación con DAgger: incorpora correcciones de experto en el dataset de entrenamiento.
- Reanudación de entrenamiento: checkpoints con parámetros de política y assets de normalización, con estado del optimizador disponible externamente.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, thinking mode, visión general, audio ni generación de texto.

## Casos de uso

- Investigación en manipulación robótica: reproducir el fine-tuning de Pi0.5 sobre una tarea de pickup concreta usando OpenPI y el dataset LeRobot publicado, con la receta exacta en `run_config.json` y `project_config.py`.
- Evaluación de DAgger en robótica: analizar cómo 200 episodios de corrección interactiva afectan a la política partiendo del paso 45500, comparando checkpoints cada 500 actualizaciones.
- Benchmark de políticas VLA en brazos Piper-X: usar el checkpoint como referencia de tarea específica para comparar con otras políticas entrenadas en el mismo hardware.
- Estudio de estabilidad de entrenamiento: al publicarse checkpoints periódicos y no existir split held-out, permite analizar la evolución de la pérdida y la política a lo largo del entrenamiento.
- Reanudación y ajuste posterior: el estado del optimizador en MIT permite continuar el entrenamiento o adaptarlo a variantes de la tarea (otro yaw, otro objeto) sin partir de cero.
- Docencia y divulgación: ejemplo reproducible de pipeline OpenPI + LeRobot + DAgger para cursos de aprendizaje por imitación en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no existe split de evaluación held-out y que la pérdida de entrenamiento no establece el éxito de la política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican parámetros ni cuantizaciones).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: librería `openpi` (Physical Intelligence); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pi0.5 bee-frame pickup (este) | no disponible | no disponible | sin evaluación held-out | no disponible | Hugging Face, 0 descargas |
| Pi0.5 base (Physical Intelligence) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Otras políticas VLA (p. ej. OpenVLA, RT-2) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos comparativos suficientes en la información proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Ausencia de evaluación held-out: la pérdida de entrenamiento no demuestra éxito de la política; no hay métricas de éxito publicadas.
- Especialización extrema: entrenado para una única tarea (pickup de bee-frame con yaw 7) y un único brazo (Piper-X); no generaliza a otras tareas sin reentrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no disponibles: no aplica como modelo de lenguaje, pero no se documenta el idioma de las consignas de tarea.
- Riesgo de sobreajuste al dataset DAgger de 200 episodios y a las condiciones de recogida de datos (iluminación, posiciones, objetos).
- Estado del optimizador no incluido: la reanudación exacta requiere el estado alojado en MIT, lo que puede limitar la reproducibilidad completa.
- Sin datos de sesgos, alucinación o robustez; al ser una política robótica, los fallos se manifiestan como acciones incorrectas o inseguras, no como texto.
- Uso en producción: requiere validación propia en el entorno real y medidas de seguridad física.

## Enlaces

- Hugging Face: https://huggingface.co/ishitag925/pi05-bee-frame-pickup-yaw7-297-dagger200-from45500-full-20261112
- Dataset: https://huggingface.co/datasets/ishitag925/bee-frame-pickup-yaw7-297-dagger200-lerobot
- OpenPI (Physical Intelligence): no disponible en la información proporcionada
- Paper de Pi0.5: no disponible en la información proporcionada
- Repositorio o demo: no disponible en la información proporcionada
