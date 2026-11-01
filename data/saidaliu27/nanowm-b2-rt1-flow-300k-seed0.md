# saidaliu27/nanowm-b2-rt1-flow-300k-seed0

## Resumen

NanoWM-B/2 RT-1 flow matching (seed 0, 300k pasos) es un modelo de mundo neuronal (world model) para robótica, desarrollado por el usuario saidaliu27 y publicado bajo licencia MIT. Se trata de un modelo generativo de vídeo condicionado por acciones que predice fotogramas futuros de una escena a partir de un fotograma de contexto y una secuencia de acciones de 7 dimensiones, lo que permite simular el resultado de una política de control antes de ejecutarla en un robot real.

El modelo se construye sobre la arquitectura NanoWM-B/2, un transformer con atención temporal causal y condicionamiento aditivo de acciones, y se entrena sobre el conjunto de datos RT-1 de Fractal. La innovación principal es el uso de flow matching como objetivo de predicción (en lugar de difusión DDPM clásica), con muestreo de timesteps logit-normal y zero-terminal-SNR desactivado, lo que reduce el número de pasos de muestreo necesarios en inferencia.

Con 158,6 millones de parámetros y un tamaño de repositorio de 0,6 GB, es un modelo compacto pensado para investigación en planificación robótica y evaluación de políticas. Su relevancia actual radica en la creciente demanda de world models ligeros que permitan entrenar y validar agentes robóticos en simulación sin depender de costosos entornos físicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NanoWM-B/2: transformer con atencion temporal causal y condicionamiento aditivo de acciones |
| Parametros totales | 158.598.160 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1 fotograma de contexto + 3 fotogramas futuros (secuencia de 4 fotogramas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision/robotica, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura NanoWM-B/2, un transformer con atención temporal causal que procesa latentes de imagen de 4 x 32 x 32 procedentes del VAE `stabilityai/sd-vae-ft-mse` (no incluido en el repositorio). Las imágenes de entrada se redimensionan a 256 x 256. El condicionamiento de acciones es aditivo y la dimensión de acción es 7, típica de espacios de control robótico (posición, orientación y pinza). La secuencia generativa consta de un fotograma de contexto y tres fotogramas futuros.

El entrenamiento se realizó durante 300.000 pasos con un tamaño de batch de 64 sobre el conjunto de datos RT-1 de Fractal, con semilla 0. El objetivo de predicción es flow matching (`experiment.diffusion.pred_name: flow`), con muestreo de timesteps logit-normal y zero-terminal-SNR desactivado; la opción C3 está deshabilitada. El repositorio incluye `config.yaml` con los ajustes de entrenamiento y modelo, `metadata.json` con las estadísticas de acciones para normalización `(action - action_mean) / action_std`, y `manifest.json` con hashes de origen y verificación de carga estricta. No se incluyen estados de optimizador, fotogramas del dataset ni pesos del VAE: es una exportación de inferencia, no un checkpoint reanudable.

## Capacidades

- Generación de vídeo condicionada por acciones: predice tres fotogramas futuros a partir de un fotograma de contexto y una secuencia de acciones de 7 dimensiones.
- Modelado de mundo para robótica: simula la evolución de una escena bajo una política de control dada.
- Flow matching como sampler: permite generar rollouts con un número reducido de pasos (la configuración por defecto usa 250 pasos; las ablaciones de incertidumbre asociadas lo sobrescriben explícitamente a 10 pasos).
- Atención temporal causal: mantiene coherencia temporal entre el fotograma de contexto y los fotogramas generados.
- Normalización de acciones integrada: el archivo `metadata.json` proporciona media y desviación típica para normalizar acciones según el cargador de dataset de NanoWM.
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües: es un modelo de visión y control, no un modelo de lenguaje.

## Casos de uso

- Evaluación de políticas robóticas en simulación: dado un fotograma de contexto y una secuencia de acciones propuesta por una política, el modelo genera los fotogramas futuros esperados, permitiendo comparar trayectorias sin ejecutar el robot físico.
- Planificación basada en modelo (model-based planning): el modelo puede usarse como simulador interno para seleccionar acciones que maximicen la recompensa estimada en tareas de manipulación con espacio de acción de 7 dimensiones.
- Aumento de datos para entrenamiento de políticas: los rollouts generados pueden servir como datos sintéticos adicionales para entrenar políticas de imitación sobre RT-1.
- Detección de acciones fuera de distribución: comparar la predicción del modelo con la observación real permite detectar anomalías o fallos en la política desplegada.
- Investigación en world models: base reproducible (semilla 0, 300k pasos, configuración incluida) para estudiar el efecto de flow matching frente a difusión en modelos de mundo robóticos.
- Prototipado rápido en robótica de bajo presupuesto: al ser un modelo de 158,6 M de parámetros y 0,6 GB, puede ejecutarse en hardware modesto para experimentos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 158,6 M de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 0,63 GB, y en fp16/bf16 alrededor de 0,32 GB, a lo que hay que sumar el VAE `stabilityai/sd-vae-ft-mse` y los latentes de 4 x 32 x 32.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer con al menos 4-8 GB de VRAM debería ser suficiente para el backbone, aunque no se ha verificado en la información proporcionada.
- Cabe en GPU consumer: probablemente sí (RTX 3060, RTX 4090, etc.), aunque no confirmado en la documentación.
- Opciones de despliegue: carga mediante `safetensors.torch.load_file` con `strict=True` y el paquete `nano-world-model` (requiere soporte de flow matching); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible; la configuración por defecto usa 250 pasos de muestreo, mientras que las ablaciones de incertidumbre usan 10 pasos, lo que sugiere una reducción significativa del coste de inferencia en ese modo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría (world models robóticos con flow matching).

## Limitaciones y advertencias

- Modelo de investigación: no se han publicado benchmarks ni evaluaciones formales de calidad de los rollouts generados.
- Dependencia externa del VAE: requiere descargar `stabilityai/sd-vae-ft-mse` por separado; el repositorio no incluye los pesos del VAE.
- Exportación de inferencia únicamente: no contiene estado del optimizador ni es reanudable para entrenamiento.
- Normalización de acciones obligatoria: es necesario aplicar `(action - action_mean) / action_std` con las estadísticas de `metadata.json`; omitirlo produce predicciones incorrectas.
- Dominio restringido: entrenado exclusivamente sobre RT-1 (Fractal); su generalización a otros robots, cámaras o tareas no está documentada.
- Sin capacidades lingüísticas: no soporta texto, tool calling ni agentes; no debe evaluarse como modelo de lenguaje.
- Riesgo de alucinación visual: como modelo generativo, puede producir fotogramas plausibles pero físicamente incorrectos, especialmente con acciones fuera de la distribución de entrenamiento.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- Idiomas soportados: no aplica; no se documenta ningún soporte multilingüe.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saidaliu27/nanowm-b2-rt1-flow-300k-seed0
- VAE dependiente: https://huggingface.co/stabilityai/sd-vae-ft-mse
- Repositorio nano-world-model: no disponible en la información proporcionada (la model card hace referencia a un checkout local de `nano-world-model/src` sin URL)
- Paper o blog asociado: no disponible en la información proporcionada
