# escapebirdy/dp_octe_4096

## Resumen

dp_octe_4096 es un checkpoint de política robótica de tipo Diffusion Policy, publicado en HuggingFace por el usuario escapebirdy dentro del ecosistema LeRobot de HuggingFace. No es un modelo de lenguaje: se trata de un modelo de control visuomotor que trata el control como un proceso generativo de difusión, produciendo trayectorias de acción multimodales y suaves, con buen comportamiento en tareas de manipulación con contacto rico. El modelo tiene 267.184.420 parámetros (~267 M) y se distribuye en safetensors dentro de un repositorio de 2,1 GB.

El nombre del checkpoint sugiere una política de difusión (dp) asociada a observaciones de nube de puntos de 4096 puntos, en línea con el dataset de entrenamiento declarado, escapebirdy/cut_4096_v3. La model card es la plantilla genérica de LeRobot y aporta información mínima: licencia Apache-2.0, librería lerobot, pipeline robotics y el paper de referencia (Diffusion Policy, arXiv:2303.04137). No se documentan datos de entrenamiento, número de episodios, configuración de hardware ni resultados de evaluación.

Su relevancia es acotada pero concreta: es un ejemplo de política de difusión entrenada con LeRobot sobre observaciones de nube de puntos, un caso menos común que las políticas basadas solo en RGB, y puede servir como punto de partida para reproducir o comparar flujos de entrenamiento de imitación. Con 35 descargas y 0 likes, es un artefacto de investigación de nicho, no un modelo validado para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (control visuomotor como proceso generativo de difusión; red de predicción de ruido condicionada por observaciones) |
| Parametros totales | 267.184.420 (~267 M), dato real de safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje. Opera sobre un horizonte de predicción de acciones (action horizon) fijado en el entrenamiento y no documentado |
| Tipos de cuantizacion | no disponible; no se documentan cuantizaciones. Pesos distribuidos en safetensors |
| Idiomas soportados | no aplica / no disponible (modelo de control robótico, sin entrada ni salida de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 2,1 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Diffusion Policy, el método descrito en arXiv:2303.04137: en lugar de mapear observación a acción de forma directa, el modelo aprende una distribución condicional de secuencias de acción mediante un proceso de difusión (denoising), y en inferencia genera la trayectoria de acción partiendo de ruido y aplicando pasos iterativos de eliminación de ruido. Esta formulación permite representar distribuciones multimodales de acciones, algo relevante en tareas de contacto donde existen varias soluciones válidas, y produce trayectorias temporalmente coherentes al predecir varios pasos de acción a la vez. La model card no especifica la red de predicción de ruido empleada (U-Net convolucional 1D, transformer o híbrida), ni el número de pasos de difusión en inferencia, ni si se usa DDPM o DDIM.

Tampoco se documentan los datos de entrenamiento: número de episodios, horas de teleoperación, composición del dataset, aumentos de datos, ni si hubo etapas de ajuste posteriores. El único dato es el dataset declarado, escapebirdy/cut_4096_v3. Como referencia indirecta, el dataset hermano escapebirdy/cut_4096_v2 presente en los resultados de búsqueda define observaciones de nube de puntos con forma [4096, 4] (XYZI), estado de 3 dimensiones, acciones de 4 dimensiones y una frecuencia de 15 fps; la composición exacta de cut_4096_v3 no está confirmada en la información disponible. Si esa configuración se mantiene, el espacio de acción de 4 dimensiones apunta a un efector final con tres grados de libertad de traslación más pinza, típico de brazos tipo SO-100/SO-101 usados en LeRobot.

## Capacidades

- Generación de trayectorias de acción multimodales para control visuomotor, con salidas suaves y temporalmente coherentes gracias al muestreo por difusión.
- Manipulación con contacto rico: la formulación generativa está pensada para tareas donde el contacto físico introduce multimodalidad (empujar, insertar, encajar).
- Consumo de observaciones de nube de puntos de 4096 puntos con intensidad (formato XYZI) como entrada, según el dataset de entrenamiento declarado.
- Condicionamiento por estado propioceptivo de baja dimensión (3 dimensiones según el dataset de referencia) además de la percepción.
- Ejecución en bucle cerrado mediante LeRobot, con política cargada desde el Hub o desde checkpoint local.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modo de pensamiento: no es un modelo de lenguaje.
- No se documentan capacidades de visión semántica general, audio, ni generalización a instrucciones en lenguaje natural (no es un modelo VLA).

## Casos de uso

- Manipulación robótica con contacto en laboratorio: el modelo genera trayectorias de acción suaves y multimodales, adecuadas para tareas de empuje o inserción donde una política determinista tiende a promediar soluciones inválidas.
- Reproducción de experimentos de Diffusion Policy sobre nubes de puntos: sirve como checkpoint de partida para comparar variantes de arquitectura, número de pasos de difusión o resoluciones de nube de puntos.
- Base para fine-tuning con datos propios: al ser un checkpoint de ~267 M parámetros con licencia Apache-2.0, se puede reentrenar con LeRobot sobre un dataset propio del mismo formato de observación y acción.
- Evaluación de pipeline de imitación de extremo a extremo: útil para validar el flujo completo de LeRobot (entrenamiento, registro de episodios, evaluación con `lerobot-record`) antes de escalar a datasets mayores.
- Despliegue en robot de bajo coste: el tamaño del modelo permite inferencia en GPUs de gama media o integradas, encajando en plataformas tipo SO-100/SO-101 con una cámara de profundidad o sensor de nube de puntos.
- Investigación en sim-to-real: el checkpoint permite medir la brecha entre entrenamiento y realidad en tareas de contacto, siempre que el robot y la configuración sensorial coincidan con las del dataset.
- Docencia y divulgación técnica: ejemplo compacto para explicar políticas generativas frente a políticas de regresión o de action chunking tipo ACT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones con otras políticas, y la búsqueda web no ha devuelto métricas asociadas a este checkpoint.

## Requisitos de hardware

- VRAM en inferencia: aproximadamente 1,1 GB para pesos en fp32 (~267 M parámetros) y unos 0,55 GB en fp16/bf16. Con activaciones, buffers de difusión y la nube de puntos (4096 x 4 float32, unos 64 KB por observación) el consumo realista se sitúa por debajo de 2-4 GB.
- VRAM en entrenamiento: los pesos en fp32 más gradientes y estados de Adam ocupan del orden de 4,3 GB antes de activaciones; con lotes pequeños es viable en GPUs de 12-16 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070/4090 para entrenamiento; en inferencia basta una GTX 1650, RTX 3050 o incluso una GPU integrada reciente. A100/H100 solo tienen sentido para entrenamiento a gran escala o barrido de hiperparámetros.
- Cabe en GPU de consumo: sí, holgadamente. También es candidato a despliegue en dispositivos embebidos tipo Jetson Orin/Nano, aunque no hay datos publicados de latencia en esas plataformas.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`, documentación oficial de LeRobot), PyTorch nativo y exportación a TorchScript/ONNX. vLLM, llama.cpp, Ollama y TGI no son aplicables: son servidores de modelos de lenguaje, no de políticas de control.
- Latencia y throughput: no disponibles. La frecuencia de control del dataset de referencia es de 15 fps, lo que implica un presupuesto de 66 ms por paso de control, pero no se ha publicado la latencia real del muestreo de difusión (que depende del número de pasos de denoising).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Observaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp_octe_4096 | Diffusion Policy | 267.184.420 | Nube de puntos 4096 puntos + estado | apache-2.0 | Checkpoint en HuggingFace |
| Diffusion Policy (paper arXiv:2303.04137) | Diffusion Policy | no disponible | RGB y/o estado, según variante | no disponible | Código de referencia del paper |
| ACT (Action Chunking Transformer, ecosistema LeRobot) | Transformer con action chunking | no disponible | RGB + estado | no disponible | Implementación en LeRobot |
| Políticas VLA (por ejemplo OpenVLA, SmolVLA) | VLA con lenguaje | no disponible | RGB + instrucción en lenguaje natural | no disponible | Repositorios públicos |

No es posible establecer una comparación cuantitativa de rendimiento con alternativas porque no se han publicado tasas de éxito ni benchmarks de este checkpoint. La comparación relevante es de tipo: dp_octe_4096 es una política específica de tarea y encarnación, sin comprensión de lenguaje, mientras que las políticas VLA aceptan instrucciones en lenguaje natural a cambio de un coste computacional muy superior.

## Limitaciones y advertencias

- Modelo de nicho sin validación publicada: 35 descargas, 0 likes y ninguna métrica de evaluación en la model card. No hay evidencia de que funcione fuera del entorno para el que se entrenó.
- Encarnación y sensor específicos: las dimensiones de estado (3) y acción (4) y el uso de nubes de puntos de 4096 puntos implican un robot y una configuración sensorial concretos. Reutilizarlo en otro robot requiere reentrenamiento, no solo ajuste.
- Sin capacidades de lenguaje: no interpreta instrucciones, no razona simbólicamente y no debe evaluarse con benchmarks de LLM.
- Riesgo de sobreajuste al dataset: no se documenta el volumen de episodios ni la diversidad de escenas, condiciones de iluminación u objetos. Las políticas de imitación con datasets pequeños fallan con frecuencia ante cambios de posición inicial o de apariencia.
- Brecha sim-to-real y sensibilidad al calibrado: la política depende de la calidad de la nube de puntos y de la calibración extrínseca/instrínseca; errores de calibrado degradan las trayectorias de forma difícil de diagnosticar.
- Documentación incompleta: la model card usa la plantilla genérica de LeRobot y su ejemplo de entrenamiento invoca `--policy.type=act`, incoherente con un checkpoint de difusión. No hay información sobre pasos de difusión, horizonte de acción, normalización de acciones ni semillas.
- Licencia: el modelo se publica bajo Apache-2.0, que permite uso comercial, pero la licencia del dataset de entrenamiento (escapebirdy/cut_4096_v3) es independiente y debe verificarse antes de cualquier uso comercial del modelo derivado.
- Ausencia de salvaguardas: al ser un modelo de control físico, los fallos se traducen en movimientos reales del robot. Es imprescindible operar con límites de par, paradas de emergencia y espacio de trabajo despejado durante la evaluación.
- La búsqueda web asociada a este identificador no devolvió documentación técnica adicional ni resultados de terceros; buena parte de los resultados obtenidos eran irrelevantes o no relacionados con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/escapebirdy/dp_octe_4096
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/escapebirdy/cut_4096_v3
- Dataset relacionado localizado en la búsqueda: https://huggingface.co/datasets/escapebirdy/cut_4096_v2
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
