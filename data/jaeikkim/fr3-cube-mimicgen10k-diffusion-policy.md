# jaeikkim/fr3-cube-mimicgen10k-diffusion-policy

## Resumen

El modelo `jaeikkim/fr3-cube-mimicgen10k-diffusion-policy` es una política de control robótico basada en diffusion policy, entrenada con el framework LeRobot para ejecutar tareas de apilamiento de cubos con el brazo robótico Franka FR3. El desarrollo corresponde al usuario jaeikkim, que también ha publicado el dataset sintético `fr3-cube-mimicgen-10k` en HuggingFace, compuesto por 10.000 episodios generados con Isaac Sim. El modelo resuelve el problema de control visual-motor para manipulación precisa en entornos simulados, y su relevancia radica en que es un ejemplo de política de difusión aplicada a robótica con datos sintéticos, un área en crecimiento para reducir la dependencia de datos reales costosos. No se dispone de información pública sobre la arquitectura interna, el tamaño de parámetros o la longitud de contexto, más allá de que se trata de una diffusion policy integrada en LeRobot. El repositorio pesa 5,4 GB y el acceso está restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (no se especifica variante concreta) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a políticas de control) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (modelo de control robótico, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (según etiquetas del repositorio) |

## Arquitectura y entrenamiento
La arquitectura corresponde a una diffusion policy, un enfoque de aprendizaje por refuerzo generativo en el que el modelo predice acciones mediante un proceso de difusión (denoising iterativo) condicionado a observaciones del entorno. Este paradigma se ha mostrado eficaz en tareas de manipulación robótica por su capacidad para modelar distribuciones multimodales de acciones. El modelo se entrenó con el framework LeRobot, que proporciona un pipeline estándar para entrenar y evaluar políticas robóticas sobre datasets de episodios. El dataset de entrenamiento es el sintético `jaeikkim/fr3-cube-mimicgen-10k`, que contiene 10.000 episodios de apilamiento de cubos generados con Isaac Sim. No se dispone de información sobre el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO, ya que no se han publicado detalles de entrenamiento. El repositorio del modelo se creó en agosto de 2026, según los metadatos de HuggingFace.

## Capacidades
- Control de acciones robóticas para tareas de manipulación, específicamente apilamiento de cubos con el robot Franka FR3.
- Generación de trayectorias de acción multimodales mediante difusión, lo que permite capturar múltiples soluciones válidas para una misma observación.
- Integración con el ecosistema LeRobot para despliegue en simuladores o robots reales.
- Operación en entornos simulados de Isaac Sim, con potencial de transferencia a entornos reales si se valida.
- No es un modelo de lenguaje: no soporta generación de texto, razonamiento, código ni tool calling.
- No soporta visión de propósito general ni procesamiento de audio; las observaciones son de tipo estado propio del entorno robótico.

## Casos de uso
- Entrenamiento de políticas robóticas en simulación: el modelo sirve como política base para validar algoritmos de aprendizaje por refuerzo en tareas de manipulación de precisión dentro de Isaac Sim.
- Benchmark de comparación para métodos de diffusion policy: investigadores pueden comparar este modelo con otras políticas sobre el mismo dataset o tarea para evaluar mejoras.
- Prototipado de sistemas de apilado automático: en entornos industriales simulados, se puede usar para probar lógicas de apilado de cajas o cubos antes de implementar en robots físicos.
- Investigación en transferencia sim-to-real: al estar entrenado en simulación, sirve como punto de partida para estudiar técnicas de adaptación de dominio hacia robots reales FR3.
- Evaluación de frameworks de robótica: permite probar el flujo completo de LeRobot (recogida de datos, entrenamiento, inferencia) con un ejemplo funcional.
- Educación y demostración: útil en cursos de robótica o aprendizaje automático para ilustrar el uso de diffusion policies con un dataset público y un modelo accesible.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No hay métricas sobre precisión de apilado, tasa de éxito, tiempo de inferencia ni comparaciones con otras políticas. El autor no ha documentado evaluaciones cuantitativas del modelo en el repositorio de HuggingFace.

## Requisitos de hardware
- VRAM estimada: no disponible; el tamaño del repositorio es 5,9 GB, pero se desconoce el peso real del modelo y su consumo en inferencia.
- GPU recomendadas: no disponible. Al ser una diffusion policy, típicamente requiere una GPU con soporte CUDA para entrenamiento e inferencia, pero sin datos concretos no se puede especificar un modelo.
- Si cabe en consumer GPU: no disponible. Depende de los parámetros y la resolución de la observación, pero al no publicarse no se puede confirmar.
- Opciones de despliegue: LeRobot ofrece scripts de evaluación; también se puede usar con PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No disponible. No se dispone de información sobre modelos comparables de diffusion policy para tareas de apilado de cubos con el mismo robot o dataset, y no se han publicado benchmarks comparativos.

## Limitaciones y advertencias
- Sesgos conocidos: no se documentan, pero al entrenarse con datos sintéticos de Isaac Sim, las acciones pueden no generalizar bien a entornos reales sin adaptación.
- Riesgo de alucinación: no aplica en el sentido de texto, pero sí puede generar acciones no seguras en escenarios no vistos; es una política de control, no un modelo de lenguaje.
- Limitaciones de contexto: no aplica, ya que el contexto se refiere a la ventana de observaciones, pero no se especifica la longitud de la historia.
- Restricciones de licencia: la licencia es "no disponible" y el acceso es restringido (gated), por lo que el uso comercial podría estar sujeto a condiciones de HuggingFace; es necesario aceptar los términos antes de descargarlo.
- Caveat para producción: el modelo está entrenado en simulación y carece de documentación sobre robustez, seguridad o validación física; no debe usarse en robots reales sin una evaluación exhaustiva.

## Enlaces
- Repositorio del modelo: https://huggingface.co/jaeikkim/fr3-cube-mimicgen10k-diffusion-policy
- Dataset asociado: https://huggingface.co/datasets/jaeikkim/fr3-cube-mimicgen-10k
- Vista del dataset: https://huggingface.co/datasets/jaeikkim/fr3-cube-mimicgen-10k/tree/main
- Ficha del dataset en Claru: https://claru.ai/datasets/jaeikkim-fr3-cube-mimicgen-10k
