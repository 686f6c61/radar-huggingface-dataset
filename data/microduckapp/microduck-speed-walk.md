# microduckapp/microduck-speed-walk

## Resumen

`microduck-speed-walk` es una política de control motor en formato ONNX para el robot bípedo Microduck. La publica el usuario `microduckapp` y forma parte del ecosistema `microduck-move`: no es un modelo de lenguaje ni un modelo generativo multimodal, sino un artefacto que reproduce un movimiento concreto de locomoción. La model card lo describe como un paseo rápido en línea recta, con una duración de 10,3 segundos, seguido de una parada y un gesto de afirmación.

El modelo recibe 61 observaciones y produce 14 objetivos de articulación a 50 Hz. Se distribuye junto a `manifest.json`, que indica a la aplicación Microduck qué necesita instalar y reproducir, y un vídeo de vista previa en `media/preview.mp4`. No se documentan la arquitectura interna, el número de parámetros, el dataset de entrenamiento ni el proceso de optimización.

Su relevancia es acotada pero clara: ejemplifica cómo empaquetar una habilidad motora de un robot open source de bajo coste como un artefacto ONNX reproducible. Para desarrolladores e investigadores es útil como referencia de integración, como baseline de locomoción y como ejemplo de distribución de políticas dentro de una app robótica. La ausencia de licencia, benchmarks y documentación técnica limita su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control robótico en ONNX; topología interna no documentada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no procesa texto; no se declara ventana de contexto) |
| Tipos de cuantización | no disponible; no se indica FP32, FP16 ni INT8 |
| Idiomas soportados | no aplica (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`); manifiesto JSON y vídeo MP4 como artefactos auxiliares |
| Entrada | 61 observaciones |
| Salida | 14 objetivos de articulación |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 10,3 s |
| Tamaño del repositorio | 0.0 GB según Hugging Face |

## Arquitectura y entrenamiento

La información disponible solo describe la interfaz de la política: 61 observaciones de entrada, 14 objetivos de articulación de salida y ejecución a 50 Hz. No se especifica si la red es un perceptrón multicapa, una CNN, un transformer, una política recurrente o una combinación. Tampoco se indican capas, funciones de activación, precisión numérica ni método de exportación a ONNX.

No hay datos sobre el número de tokens, la composición del dataset, el algoritmo de entrenamiento, el uso de RLHF/DPO ni técnicas de regularización. Fuentes externas describen que el robot Microduck se entrena con aprendizaje por refuerzo en MuJoCo, pero no confirman que esta política concreta se haya generado así. La model card es descriptiva y coloquial, no técnica.

## Capacidades

- Ejecuta un movimiento de marcha rápida en línea recta con una duración declarada de 10,3 segundos.
- Controla 14 objetivos de articulación a partir de 61 observaciones, con un bucle de control de 50 Hz.
- Se integra mediante `manifest.json` en el flujo de instalación y reproducción de la aplicación Microduck.
- Incluye un vídeo de vista previa para inspeccionar visualmente el movimiento antes de instalarlo.
- Está pensado para el robot bípedo Microduck, no para uso general fuera de ese hardware.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No se documentan capacidades multilingües ni procesamiento de lenguaje natural.
- No se documenta adaptación dinámica a obstáculos, terrenos irregulares o recuperación de caídas.

## Casos de uso

- Demostración en la aplicación Microduck: cargar el manifiesto y reproducir el movimiento de 10,3 segundos para mostrar la habilidad en una demo o exhibición. Es adecuado porque el paquete ya incluye la política y los metadatos de instalación.
- Baseline de locomoción: usar esta política como referencia fija para comparar otras políticas de marcha del mismo robot en pruebas de estabilidad, velocidad o consumo. Su interfaz de 61 entradas y 14 salidas facilita la comparación si se dispone de otras políticas compatibles.
- Validación de integración robot-app: comprobar que el pipeline de instalación, carga del ONNX y envío de objetivos articulares funciona a 50 Hz. Es útil como prueba de humo del sistema antes de desplegar políticas más complejas.
- Docencia y prototipado: emplear el movimiento como ejemplo de empaquetado de una habilidad motora en ONNX con manifiesto JSON y vista previa. Sirve para explicar el ciclo completo desde la política hasta la ejecución en un robot bípedo.
- Evaluación sim-to-real: ejecutar la política en simulación y después en el robot físico para medir diferencias de comportamiento, siempre en un entorno controlado. La duración corta y la trayectoria recta simplifican la observación, aunque no hay métricas publicadas.
- Generación de material audiovisual técnico: usar `media/preview.mp4` como referencia visual para documentación, notas de versión o material de formación. Es adecuado porque el vídeo muestra el movimiento sin necesidad de disponer del robot.
- Pruebas de seguridad y parada: verificar que el robot completa la secuencia y se detiene al final, con especial atención a la estabilidad y al espacio libre. La model card indica que el movimiento termina con una parada, pero no documenta protocolos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay métricas de velocidad, tasa de éxito, consumo energético, estabilidad, error de seguimiento articular ni comparación con otras políticas. Tampoco se documenta latencia de inferencia, throughput ni comportamiento en distintos terrenos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se indica si la política se ejecuta en CPU, GPU, NPU o en el propio controlador del robot.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar que sea necesaria una GPU dedicada.
- Despliegue: el formato ONNX permite su ejecución con runtimes compatibles, pero la model card no especifica cuál. El mecanismo documentado es la instalación mediante `manifest.json` en la aplicación Microduck.
- vLLM, llama.cpp, Ollama y TGI: no aplican a este tipo de modelo.
- Latencia: el bucle de control se ejecuta a 50 Hz, es decir, un periodo de 20 ms por paso. La latencia real de inferencia no está disponible.
- Throughput: no disponible.
- Almacenamiento: el repositorio declara 0.0 GB en Hugging Face, aunque no se detalla el tamaño exacto de `policy.onnx`.

## Comparativa con modelos similares

No se han identificado en la información proporcionada alternativas concretas con las que comparar parámetros, contexto o rendimiento. La tabla siguiente recoge únicamente lo que puede afirmarse con los datos disponibles.

| Modelo | Tipo | Entrada/salida | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `microduck-speed-walk` | Política de marcha para Microduck | 61 observaciones / 14 objetivos | 50 Hz | no disponible | Hugging Face; 0 descargas, 0 likes |
| Otras políticas `microduck-move` | no disponible | no disponible | no disponible | no disponible | no disponible |
| Políticas de locomoción bípeda de otros robots | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia no está disponible. No se puede asumir que el uso comercial, la modificación o la redistribución estén permitidos.
- La documentación técnica es mínima: no hay arquitectura, número de parámetros, precisión numérica, dataset ni proceso de entrenamiento.
- El movimiento está diseñado para el robot Microduck y no se documenta compatibilidad con otro hardware.
- La política declara 14 objetivos de articulación, mientras que el robot Microduck se describe con 15 motores en fuentes externas. La documentación no aclara esta correspondencia.
- El movimiento es fijo, de 10,3 segundos y en línea recta. No se documenta adaptación a obstáculos, cambios de velocidad, terrenos irregulares o recuperación de caídas.
- No hay benchmarks ni métricas de robustez. No puede evaluarse su rendimiento frente a otras políticas con datos objetivos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria visible.
- Riesgo de sim-to-real: el comportamiento en simulación puede no coincidir con el robot físico. Es necesario probar en un entorno controlado y con medidas de seguridad.
- No es un modelo lingüístico: no hay sesgos de lenguaje ni alucinación textual que evaluar. El riesgo principal es la ejecución motora insegura o inesperada.
- No se documentan versiones compatibles de la aplicación Microduck, del firmware del robot ni del runtime ONNX. Esto puede provocar fallos de integración.
- No se indica la precisión del archivo ONNX. Una cuantización no documentada podría afectar al comportamiento del control.

## Enlaces

- [Hugging Face: microduckapp/microduck-speed-walk](https://huggingface.co/microduckapp/microduck-speed-walk)
- [GitHub: pollen-robotics/microduck](https://github.com/pollen-robotics/microduck)
- [CNX Software: Microduck, un robot bípedo con forma de pato](https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/)
- [TechRepublic: Nvidia enseña a caminar a un robot pato de 399 dólares](https://www.techrepublic.com/article/news-nvidia-microduck-robot-ai-walking/)
- [NVIDIA Developer Blog: uso de agentes de IA para enseñar a robots como Microduck a caminar en simulación](https://developer.nvidia.com/blog/using-ai-agents-to-teach-robots-like-microduck-to-walk-in-simulation/)
- [MarkTechPost: Hugging Face presenta Microduck, un bípedo open source de 399 dólares](https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/)
