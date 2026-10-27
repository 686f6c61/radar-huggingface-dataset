# microduckapp/microduck-wobbly

## Resumen

`microduckapp/microduck-wobbly` es un fichero de política de control motriz (`policy.onnx`) publicado por el usuario `microduckapp` en Hugging Face para el robot bípedo Microduck. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un "movimiento" empaquetado: una política neuronal que, a partir de 61 observaciones por paso, emite 14 consignas de articulación a 50 Hz durante una secuencia de 10,4 segundos. El repositorio se etiqueta con el pipeline `robotics` y las tags `onnx`, `robotics`, `microduck-move` y `region:us`.

El movimiento se describe como un balanceo lateral ("totters from side to side"), con riesgo de vuelco y oscilación de la cabeza en busca de equilibrio hasta estabilizarse. El repositorio incluye además un `manifest.json` con los requisitos de instalación y reproducción en el robot, y un vídeo de previsualización en `media/preview.mp4`. El tamaño del repo aparece como 0,0 GB, lo que sitúa el peso del fichero por debajo del umbral de redondeo de la plataforma.

La relevancia de esta ficha es acotada: se trata de un artefacto de robótica dentro del ecosistema Microduck, el robot bípedo de 25 cm y 399 dólares presentado por Pollen Robotics y Hugging Face y entrenado con aprendizaje por refuerzo en MuJoCo según la cobertura de prensa. La model card no aporta información sobre arquitectura de red, datos de entrenamiento, licencia ni evaluación, por lo que la mayor parte de las especificaciones quedan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control exportada a ONNX; topología de la red no disponible en la model card |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); ventana de 61 observaciones por paso de control |
| Tipos de cuantización | no disponible (se distribuye un único `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible; no aplica (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`); metadatos de instalación en `manifest.json` (JSON) |
| Entradas del modelo | 61 observaciones por paso |
| Salidas del modelo | 14 consignas de articulación (joint targets) |
| Frecuencia de control | 50 Hz (periodo de 20 ms por paso) |
| Duración de la secuencia | 10,4 segundos (aproximadamente 520 pasos a 50 Hz) |
| Pipeline declarado | `robotics` |
| Tamaño del repositorio | 0,0 GB según Hugging Face (fichero de pesos muy pequeño) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación | 2026-10-27 |

## Arquitectura y entrenamiento

La información disponible solo permite afirmar que se trata de una política de control en formato ONNX con 61 entradas de observación y 14 salidas de articulación, ejecutada a 50 Hz. No se especifica si la red es un perceptrón multicapa, una red recurrente o una política con memoria, ni se detalla la composición del vector de observaciones (posiciones articulares, velocidades, IMU, fase de la marcha u otras señales). Tampoco se indica el número de capas, el número de parámetros ni el método de exportación a ONNX.

Respecto al entrenamiento, la model card no documenta dataset, número de tokens ni proceso de optimización. La cobertura de prensa del robot Microduck indica que sus políticas se entrenan con aprendizaje por refuerzo en simulación con MuJoCo, pero ese dato corresponde al programa general del robot y no está confirmado para este movimiento concreto. No hay información sobre entrenamiento en el robot real, ajuste fino, destilación ni técnicas de robustez como domain randomization. La única innovación observable es el empaquetado: política ONNX más manifiesto de instalación, lo que permite distribuir movimientos como artefactos reproducibles dentro de la app MicroDuck.

## Capacidades

- Ejecución de un movimiento pregrabado de 10,4 segundos consistente en un balanceo lateral con oscilación de cabeza y estabilización final.
- Control de 14 articulaciones con consignas generadas a 50 Hz.
- Lectura de un vector de 61 observaciones por paso para cerrar el bucle de control.
- Instalación y reproducción en el robot Microduck mediante el `manifest.json` incluido.
- Previsualización del comportamiento mediante `media/preview.mp4`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio ni capacidades multilingües.
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo "thinking" ni ninguna capacidad cognitiva.

## Casos de uso

- Docencia de robótica bípeda: usar el movimiento como ejemplo de locomoción deliberadamente inestable para ilustrar conceptos de centro de masas, equilibrio dinámico y control en bucle cerrado a 50 Hz.
- Comparación de políticas de equilibrio: servir de referencia de "movimiento con oscilación" frente a políticas de marcha estable del mismo robot, permitiendo medir tiempos de estabilización y desviación lateral.
- Pruebas de sim-to-real: ejecutar el mismo `policy.onnx` en el simulador y en el robot físico para cuantificar la brecha entre ambos dominios con una secuencia corta y repetible de 10,4 segundos.
- Validación del bucle de control en hardware: comprobar que la plataforma de cómputo del Microduck sostiene el presupuesto de 20 ms por paso (50 Hz) sin sobrecarga, ya que el fichero ONNX es de tamaño reducido y no requiere acelerador.
- Pruebas de resistencia mecánica y consumo: someter servos y estructura a un ciclo repetido de balanceo con riesgo de vuelco para medir desgaste, picos de par y consumo energético.
- Integración en secuencias de demostración: encadenar este movimiento con otros del catálogo `microduck-move` para construir rutinas en la app MicroDuck, por ejemplo en presentaciones o ferias.
- Evaluación de recuperación tras perturbación: usar el movimiento como estado inicial antes de aplicar empujones controlados y estudiar la respuesta del robot, siempre que se disponga de políticas adicionales de recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No consta ninguna métrica cuantitativa (tasa de éxito, error de seguimiento, recompensa media, tiempo de estabilización, número de caídas) ni comparación con otras políticas del catálogo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Por el tamaño del repositorio (0,0 GB) y el carácter de política de control con 61 entradas y 14 salidas, la inferencia es viable en CPU sin GPU dedicada; esta estimación se deriva del tamaño del artefacto, no de documentación del autor.
- GPU recomendadas: no disponibles; para una política de este tamaño no se requiere A100, H100 ni RTX 4090. La ejecución en la propia computadora del robot o en un equipo de sobremesa es suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo e incluso sin GPU; no hay requisito documentado.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto), con posibilidad de exportación a otros runtimes ONNX. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: el bucle debe sostener 50 Hz, es decir, 20 ms por paso de control. No se publican latencias medidas ni throughput del fichero ONNX.
- Requisito adicional: controlador compatible con el Microduck y su `manifest.json`; el número y tipo de servos (14 salidas) debe coincidir con la configuración del robot.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas / salidas | Frecuencia | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-wobbly | Política de control ONNX | 61 / 14 | 50 Hz | no disponible | no disponible | Hugging Face, 0 descargas |
| Política base de locomoción de Microduck (Pollen Robotics / Hugging Face) | Política de control RL (simulación MuJoCo, según prensa) | no disponible | no disponible | no disponible | no disponible (el robot se describe como open source) | Repositorio GitHub `pollen-robotics/microduck` |
| Otros movimientos del catálogo `microduck-move` | Políticas de control ONNX | no disponible | no disponible | no disponible | no disponible | Hugging Face (autor `microduckapp`) |

No se han encontrado en la información proporcionada métricas públicas que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse permisos de uso comercial, redistribución ni modificación. Es un bloqueo potencial para integrar el movimiento en un producto.
- Ausencia total de documentación técnica: sin arquitectura, sin número de parámetros y sin detalles del vector de observaciones, la reproducibilidad y la auditoría son limitadas.
- Sin datos de entrenamiento ni de evaluación: no hay garantía de que el movimiento funcione fuera de la configuración exacta de hardware para la que fue generado (versión de servos, calibración, batería, superficie).
- Brecha sim-to-real: si la política se entrenó en simulación, el comportamiento en el robot físico puede degradarse; la model card no indica si hubo validación en hardware.
- Riesgo físico: el propio autor describe un movimiento que "casi vuelca" en cada ciclo, con oscilación de cabeza. Debe operarse en una superficie despejada y con supervisión, y no es apto para entornos con personas u objetos frágiles cerca.
- Dependencia del manifiesto: el movimiento requiere el `manifest.json` y un runtime compatible; no se documenta compatibilidad con versiones futuras de la app o del firmware.
- Sin soporte multilingüe, de tool calling ni de agentes: no aplica el riesgo de alucinación textual, pero sí el de deriva de política (policy drift) ante condiciones no vistas.
- Sesgos conocidos: no disponible; no hay información sobre condiciones de entrenamiento que pudieran introducir asimetrías (por ejemplo, balanceo hacia un lado dominante).
- Sin métricas de robustez: se desconoce el comportamiento ante empujones, terreno irregular o fallo parcial de un actuador.
- Repositorio sin tracción: 0 descargas y 0 likes, sin evidencia de revisión por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-wobbly
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Cobertura de MarkTechPost sobre Microduck: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Cobertura de TechRepublic sobre el entrenamiento con IA: https://www.techrepublic.com/article/news-nvidia-microduck-robot-ai-walking/
- Cobertura de best-ai.org: https://best-ai.org/ai-news/hugging-face-unveils-microduck-a-399-open-source-robot-for-ai-development-psmhme
- Cobertura de Yahoo Tech: https://tech.yahoo.com/ai/meta-ai/articles/hugging-face-launches-microduck-399-171113553.html
