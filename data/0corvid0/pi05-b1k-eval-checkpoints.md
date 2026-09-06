# 0Corvid0/pi05-b1k-eval-checkpoints

## Resumen

pi05-b1k-eval-checkpoints es un conjunto de checkpoints intermedios de un modelo de robótica VLA (Vision-Language-Action) desarrollado por 0Corvid0 para el desafío BEHAVIOR-1K. El modelo se basa en openpi pi0.5, con un modelo de lenguaje Gemma 2B ajustado por completo, y utiliza flow matching para generar secuencias de 32 acciones. Se han publicado cuatro variantes de entrenamiento (LoRA y ajuste completo, con ruido gaussiano y correlacionado) para evaluar la tasa de éxito en 25 tareas domésticas del dataset behavior-1k/2026-challenge-demos. Cada variante se entrenó durante 15.000 pasos, con checkpoints cada 2.500 pasos. El repositorio pesa 62,2 GB y está destinado a la evaluación de éxito en el entorno simulado OmniGibson.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en openpi pi0.5, con modelo de lenguaje Gemma 2B |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible (horizonte de acción de 32 pasos) |
| Tipos de cuantización | no disponible (pesos en bf16 en las variantes LoRA) |
| Idiomas soportados | no disponibles |
| Licencia | other (no especificada) |
| Formato de pesos | Orbax/OCDBT (checkpoints desplegables) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura pi0.5 de openpi, un modelo VLA que combina un codificador de visión con un modelo de lenguaje (Gemma 2B en este caso). El objetivo de entrenamiento es flow matching: se minimiza el error cuadrático medio (MSE) sobre el campo de velocidad para predecir trozos de 32 acciones (action_horizon=32). El entrenamiento se realizó durante 15.000 pasos en cuatro configuraciones: LoRA con ruido gaussiano, LoRA con ruido correlacionado, ajuste completo con ruido gaussiano y ajuste completo con ruido correlacionado. Las variantes de ruido correlacionado muestran un ruido N(0, 0.5*Sigma + 0.5*I) (beta=0.5), siguiendo la solución de referencia del desafío. El conjunto de datos es behavior-1k/2026-challenge-demos, con 25 tareas. Para cada tarea, los episodios 0-89 se usan para entrenamiento y los episodios 90-99 quedan reservados para evaluación (held-out). No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de acciones de control robótico: predice trozos de 32 acciones a partir de observaciones visuales e instrucciones de lenguaje.
- Soporte de dos estrategias de ruido para el proceso de flow matching: gaussiano estándar y correlacionado, lo que permite estudiar la robustez del modelo.
- Fine-tuning completo y LoRA: el repositorio incluye checkpoints de ambas modalidades, lo que permite comparar la eficiencia de cada método.
- Evaluación de éxito en 25 tareas domésticas del desafío BEHAVIOR-1K, con división explícita entre entrenamiento y validación.
- Integración con el framework openpi: los pesos son desplegables con --policy.dir y el formato Orbax/OCDBT.
- No incluye capacidades de generación de texto, tool calling ni razonamiento simbólico: está especializado en control robótico.

## Casos de uso

- Evaluación de políticas robóticas en el desafío BEHAVIOR-1K: los checkpoints permiten medir la tasa de éxito de cada configuración en las 25 tareas domésticas, utilizando los episodios 90-99 como validación. El modelo se carga con el framework openpi y se ejecuta en el entorno simulado OmniGibson.
- Investigación en flow matching para control robótico: al publicar checkpoints intermedios cada 2.500 pasos, se puede analizar la evolución de la política a lo largo del entrenamiento y detectar puntos de saturación o sobreajuste.
- Comparación de estrategias de ajuste fino: las variantes LoRA y full-FT permiten evaluar el compromiso entre coste de entrenamiento y rendimiento final en tareas de manipulación de objetos.
- Estudio de la influencia del ruido correlacionado en el muestreo de acciones: los checkpoints *_corr y *_gauss permiten comparar el efecto de usar ruido correlacionado (beta=0.5) frente al ruido gaussiano estándar en el proceso de flow matching.
- Reanudación de entrenamiento: los checkpoints de paso 14.999 pueden usarse para continuar el entrenamiento con más datos o durante más pasos, gracias a que se guarda el estado completo del modelo en formato Orbax.
- Benchmarking de generalización a tareas no vistas: la división de datos (demos 0-89 para entrenamiento, 90-99 para evaluación) permite medir la capacidad del modelo para generalizar a episodios de las mismas tareas que no se usaron en el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 62,2 GB, pero no se especifica el coste de memoria de inferencia.
- GPU recomendadas: no disponible. El README no indica requisitos de hardware.
- Compatibilidad con GPUs de consumo: no disponible. No hay datos suficientes para estimarlo.
- Opciones de despliegue: los pesos están en formato Orbax/OCDBT y se sirven mediante el framework openpi, usando el parámetro --policy.dir con la ruta hf://0Corvid0/pi05-b1k-eval-checkpoints/<config_name>/<step>/params.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado modelos comparables con especificaciones publicadas. El README menciona un baseline de referencia (IliaLarchenko/behavior_submission) para el desafío, pero no se proporcionan detalles técnicos de ese modelo. Por tanto, no disponible.

## Limitaciones y advertencias

- Los checkpoints son intermedios (cada 2.500 pasos) y no representan necesariamente el mejor rendimiento final; el último paso es 14.999.
- El modelo está diseñado exclusivamente para control robótico en entornos simulados; no es un modelo de lenguaje y no puede realizar tareas de texto o tool calling.
- La licencia es "other" y no se especifica, por lo que el uso comercial puede estar restringido.
- El idioma no está documentado, aunque las instrucciones del desafío son en inglés.
- Los resultados de éxito pueden variar según el entorno de evaluación (OmniGibson) y la configuración de hardware.
- El repositorio no incluye métricas de evaluación publicadas, por lo que no se puede validar el rendimiento sin ejecutar la evaluación.
- El README advierte de diferencias de comparabilidad con el baseline de Ilias (normalización de delta-acciones, horizonte H=30 vs H=32), lo que puede afectar a la interpretación de los resultados.

## Enlaces

- HuggingFace: https://huggingface.co/0Corvid0/pi05-b1k-eval-checkpoints
- Repositorio relacionado: https://huggingface.co/0Corvid0/pi05-b1k-families
- Baseline de referencia del desafío: https://huggingface.co/IliaLarchenko/behavior_submission
- Baselines del desafío BEHAVIOR: https://behavior.stanford.edu/challenge/baselines.html
