# Ravenh97/roborender_teacher_lora

## Resumen

Este modelo es un adaptador LoRA diseñado por Ravenh97 para el modelo de difusión de vídeo Wan2.1-Fun, dentro del proyecto RoboRender. Su propósito es actuar como un teacher de 50 pasos que genera vídeos de manipulación robótica con condicionamiento dual de profundidad y máscara de robot, así como condicionamiento por fotograma anterior. Reutiliza el modelo base PAI/Wan2.1-Fun-V1.1-1.3B-Control, por lo que no es un modelo autónomo.

El LoRA está entrenado sobre datos mixtos de los conjuntos DROID y AgiBot, y se utiliza para renderizar el dataset de anclas Ravenh97/roborender_anchors. Genera clips de 81 fotogramas en tres vistas simultáneas, lo que lo hace especialmente útil para aplicaciones de sim2real en robótica. Su relevancia actual radica en la generación de datos sintéticos de alta calidad para entrenar modelos de visión y políticas robóticas.

Según la documentación del autor, el modelo tarda unos 32 segundos por clip en una RTX PRO 6000, y se ejecuta en el camino PyTorch DiT porque los motores TensorRT no son compatibles con este adaptador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre el modelo de difusión de vídeo Wan2.1-Fun-V1.1-1.3B-Control |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Other |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en el modelo de difusión de vídeo Wan2.1-Fun-V1.1-1.3B-Control, al que se le añade un adaptador LoRA que introduce control dual: un mapa de profundidad y una máscara del robot. Además, incorpora condicionamiento por fotograma anterior para mantener coherencia temporal entre los 81 fotogramas de cada clip. El entrenamiento se realizó sobre datos mixtos de los conjuntos DROID y AgiBot, y el resultado es un teacher de 50 pasos con CFG 5.0. Una característica técnica destacable es que el adaptador se ejecuta en el camino PyTorch DiT, ya que los motores TensorRT exportados para el student de 5 pasos no son válidos para este adaptador.

## Capacidades

- Generación de vídeo condicionada: produce clips de 81 fotogramas en tres vistas, controladas por profundidad y máscara de robot.
- Condicionamiento temporal mediante fotograma anterior, lo que mejora la consistencia entre fotogramas consecutivos.
- Propósito teacher: funciona como modelo de referencia de alta calidad (50 pasos) para renderizar anclas y destilar conocimiento en un modelo student de 5 pasos.
- Transferencia sim2real: entrenado con datos DROID y AgiBot, orientado a aplicaciones de robótica que requieren alinear simulaciones con el mundo real.
- Integración en servidores de renderizado: puede cargarse mediante el script `run_raven_server.sh` con la opción `--teacher_lora`.
- No soporta tool calling, razonamiento de texto ni generación de lenguaje: es un modelo puramente de generación de vídeo con control.

## Casos de uso

- Generación de datos sintéticos para entrenamiento de políticas robóticas: el modelo produce vídeos de manipulación condicionados por profundidad y máscara, permitiendo aumentar conjuntos de datos reales como DROID o AgiBot.
- Destilación de modelos de vídeo para simulación: se emplea como teacher de 50 pasos para generar anclas de alta calidad, que luego sirven para entrenar un student de 5 pasos, reduciendo el coste de inferencia.
- Simulación de entornos robóticos multivista: genera clips de 81 fotogramas desde tres vistas simultáneas, útil para entrenar modelos de percepción o políticas que requieren información de múltiples cámaras.
- Aumento de datos para aprendizaje por imitación: sintetiza demostraciones de robots mediante condicionamiento dual, creando nuevos ejemplos de tareas sin necesidad de capturas físicas adicionales.
- Validación de control en robótica: los vídeos generados permiten verificar la coherencia de movimientos del robot en escenarios simulados antes de transferirlos al mundo real.
- Investigación en generación condicionada de vídeo: sirve como referencia o teacher para comparar arquitecturas de adaptación LoRA en modelos de difusión de vídeo para robótica.
- Renderizado de anclas en pipelines de entrenamiento: el modelo se integra en un servidor de renderizado que produce anclas para condicionamiento FT-FIXED, tal como se indica en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. En cuanto a rendimiento, la model card indica que el modelo tarda aproximadamente 32 segundos por clip de 81 fotogramas en tres vistas sobre una RTX PRO 6000.

## Requisitos de hardware

- VRAM: no disponible explícitamente. Dado que el LoRA pesa unos 700 MB y requiere el modelo base de 1.300 millones de parámetros, se necesita la VRAM suficiente para ejecutar Wan2.1-Fun-V1.1-1.3B-Control más el adaptador.
- GPU recomendada: RTX PRO 6000, según el rendimiento reportado en la model card.
- ¿Cabe en GPU de consumidor? No disponible. Al tratarse de un modelo de difusión de vídeo, el coste de memoria es superior al de los modelos de lenguaje de tamaño comparable.
- Opciones de despliegue: se ejecuta mediante un servidor de renderizado con `run_raven_server.sh` y la opción `--teacher_lora`. El modelo corre en el camino PyTorch DiT, ya que TensorRT no es válido para este adaptador.
- Latencia: aproximadamente 32 segundos por clip de 81 fotogramas en tres vistas con RTX PRO 6000.

## Comparativa con modelos similares

No se dispone de suficientes datos para realizar una comparativa con modelos similares. La información proporcionada no incluye modelos comparables ni resultados de evaluaciones.

## Limitaciones y advertencias

- Es un LoRA, no un modelo completo: requiere descargar aparte los pesos base de Wan2.1-Fun, que ocupan aproximadamente 20 GB según la model card.
- Licencia 'other': la model card no especifica los términos exactos; es necesario revisar la licencia antes de usar el modelo con fines comerciales.
- TensorRT no es compatible con este adaptador; solo puede ejecutarse en el camino PyTorch DiT, lo que limita las opciones de optimización.
- No se han publicado evaluaciones de robustez, sesgos o alucinaciones visuales, por lo que el riesgo de artefactos en la generación de vídeo no está documentado.
- Los datos de entrenamiento mezclan DROID y AgiBot, lo que puede sesgar el modelo hacia esos robots específicos y sus entornos.
- La generación de vídeo es computacionalmente costosa (~32 s por clip), lo que dificulta su uso en tiempo real.
- No está disponible información sobre idiomas ni capacidades multilingües, al ser un modelo de vídeo con control.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ravenh97/roborender_teacher_lora
- Dataset de anclas: https://huggingface.co/datasets/Ravenh97/roborender_anchors
