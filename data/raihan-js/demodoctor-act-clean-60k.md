# raihan-js/demodoctor-act-clean-60k

## Resumen

demodoctor-act-clean-60k es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado por el autor raihan-js y distribuido a través de la librería LeRobot de Hugging Face. El modelo no es un modelo de lenguaje: consume observaciones visuales y de estado del robot y produce comandos de acción de bajo nivel, por lo que su propósito es controlar un brazo robótico en una tarea física concreta de manipulación.

La tarea aprendida es empujar un bloque con forma de T hasta una diana también en forma de T ("Push the T-shaped block onto the T-shaped target"), empleando el conjunto de datos lerobot/pusht. Se trata de un modelo pequeño, con 51.660.418 parámetros, entrenado durante 60.000 pasos sobre 206 episodios (25.650 fotogramas a 10 FPS), lo que lo sitúa en el rango de políticas ligeras que se pueden ejecutar en hardware de consumo.

Su relevancia radica en dos factores: por un lado, emplea el algoritmo ACT, que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, mejorando la estabilidad y la tasa de éxito en tareas de imitación; por otro, está empaquetado según el estándar LeRobot, lo que permite replicarlo, evaluarlo y desplegarlo con las herramientas oficiales del ecosistema. El repositorio tiene un tamaño de 0,2 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT), transformer con CVAE sobre observaciones visuales y de estado |
| Parametros totales | 51.660.418 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; procesa una observacion por paso y predice chunks de acciones |
| Tipos de cuantizacion | no disponible; pesos en safetensors a precision de entrenamiento |
| Idiomas soportados | no aplica (modelo de robotica, no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers, arXiv:2304.13705) es un método de aprendizaje por imitación que combina un transformer encoder-decoder con un autoencoder variacional condicional (CVAE). La política recibe observaciones visuales y de estado y genera directamente un chunk de acciones futuras en lugar de una única acción, lo que reduce el problema de acumulación de errores típico de las políticas paso a paso y favorece la consistencia temporal. En este caso concreto, las entradas son una imagen de `(3, 96, 96)` y un vector de estado de `(2,)`, y la salida es un vector de acción de `(2,)`, lo que corresponde a un robot con dos grados de libertad efectivos en la tarea.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `lerobot/pusht`, que contiene 206 episodios y 25.650 fotogramas a 10 FPS de demostraciones teleoperadas. La configuración de entrenamiento reportada es de 60.000 pasos, batch size 32, optimizador AdamW con learning rate 1e-05 y semilla 0. No se documenta el uso de RLHF ni de DPO, algo coherente con un método de imitación supervisada. El autor no detalla innovaciones adicionales respecto al algoritmo ACT original.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de dos dimensiones a partir de observaciones visuales y de estado.
- Predicción de chunks de acciones: en lugar de una acción por paso, emite secuencias cortas, lo que mejora la estabilidad del control.
- Percepción visual: procesa imágenes de entrada de 96×96 píxeles con tres canales.
- Fusión de estado y visión: combina el estado del robot `(2,)` con la observación visual para condicionar la acción.
- Ejecución autónoma de la tarea "empujar el bloque en T hasta la diana en T" sobre la que fue entrenado.
- No dispone de tool calling, function calling, capacidades de agente, multilingüismo ni generación de texto.
- No incorpora modo de razonamiento explícito (thinking mode) ni procesamiento de audio.

## Casos de uso

- Reproducción de la tarea pusht en un banco de pruebas: el modelo se puede ejecutar con `lerobot-rollout` sobre el robot `pusht` para replicar la política aprendida y medir su tasa de éxito en condiciones controladas.
- Punto de partida para fine-tuning: al ser un checkpoint ACT entrenado 60.000 pasos, sirve como inicialización para reentrenar con datos propios de otra tarea de manipulación mediante `lerobot-train`.
- Evaluación comparativa de algoritmos de imitación: puede emplearse como referencia de la familia ACT frente a otras políticas (Diffusion Policy, VQ-BeT) en el mismo dataset `lerobot/pusht`.
- Docencia e investigación en aprendizaje por imitación: el tamaño reducido (51,6 M de parámetros) y el formato LeRobot permiten estudiar el pipeline completo —grabación, entrenamiento y despliegue— sin necesidad de clústeres de GPU.
- Pruebas de integración del ecosistema LeRobot: sirve para validar scripts de despliegue, calibración de cámaras y control de puertos de robot antes de invertir en entrenamientos más costosos.
- Benchmarking de hardware de inferencia: por su huella mínima, permite medir latencia y throughput de políticas ACT en distintas GPU de consumo.
- Prototipado de robótica educativa: adecuado para demostraciones en laboratorios o talleres donde se necesite una política funcional y reproducible con licencia permisiva.
- Validación de tuberías CI para políticas robóticas: al tener pesos safetensors versionados, se puede integrar en flujos de test automatizados que verifiquen que el modelo carga y produce acciones coherentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la sección de evaluación vacía, con la nota "_No evaluation results have been provided for this policy yet_". Por tanto, no se dispone de tasas de éxito, ni de comparaciones numéricas con otras políticas sobre la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2-0,5 GB en precisión de entrenamiento (fp32), dado que los pesos ocupan alrededor de 207 MB; con cuantización o fp16 bajaría por debajo de 150 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se puede ejecutar en RTX 3060, RTX 4090, A100 o H100 sin limitaciones de memoria.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con `--policy.device=cuda` o CPU. No se documenta soporte oficial para vLLM, TGI, llama.cpp ni Ollama, por tratarse de una política robótica y no de un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones de frecuencia de inferencia ni de tiempo por chunk.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Resultados publicados |
|---|---|---|---|---|---|
| demodoctor-act-clean-60k | 51.660.418 | no aplica | apache-2.0 | Hugging Face (LeRobot) | no disponibles |
| ACT original (referencia del metodo) | variable segun implementacion | no aplica | MIT (codigo de referencia) | Repositorio del paper | reportados en el paper arXiv:2304.13705 |
| Diffusion Policy | variable segun configuracion | no aplica | MIT (codigo de referencia) | Repositorio del paper | reportados en su publicacion |
| VQ-BeT | variable segun configuracion | no aplica | no disponible en la informacion | Repositorio del paper | reportados en su publicacion |

Los datos de parámetros, contexto y licencia de las alternativas no forman parte del material proporcionado para este modelo y se listan únicamente como categoría comparable dentro de las políticas de imitación. No hay métricas de rendimiento de este checkpoint concreto que permitan una comparación numérica directa.

## Limitaciones y advertencias

- Tarea única: el modelo solo ha sido entrenado para la tarea "Push the T-shaped block onto the T-shaped target"; no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Tipo de robot desconocido: la model card indica `Robot type: unknown`, lo que dificulta garantizar la compatibilidad con un hardware concreto sin revisar los nombres de las cámaras y el estado esperado.
- Sin evaluación publicada: no hay tasa de éxito ni condiciones de prueba documentadas, por lo que no se puede afirmar su fiabilidad en producción.
- Entradas rígidas: la política espera observaciones de estado de dimensión 2 y acciones de dimensión 2, con una imagen de 96×96; cambiar esas dimensiones invalida el modelo.
- Sin capacidades lingüísticas: no procesa texto ni instrucciones, lo que excluye su uso en escenarios conversacionales o de agentes.
- Riesgo de alucinación no aplica en el sentido clásico, pero sí puede producir acciones incoherentes fuera de la distribución de entrenamiento (por ejemplo, ante cambios de iluminación, posición inicial del bloque o distracciones visuales).
- Sesgos de datos: al entrenarse sobre `lerobot/pusht` (206 episodios, 25.650 fotogramas), hereda los sesgos de posición, iluminación y dinámica de ese conjunto.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y licencia; no impone restricciones adicionales por parte del autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: se trata de una publicación reciente (creada el 2026-10-03) sin validación por parte de la comunidad.
- Ausencia de documentación sobre dependencias exactas más allá de LeRobot 0.6.1: conviene fijar esa versión para reproducir el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raihan-js/demodoctor-act-clean-60k
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/pusht
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de aprendizaje por imitación: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo, únicamente páginas de decoración doméstica sin relación con el tema, por lo que no se han incluido.
