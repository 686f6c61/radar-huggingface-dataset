# HanzoHuang/YOLOv10-RKNN2

## Resumen

YOLOv10-RKNN2 es un conjunto de exportaciones del detector de objetos YOLOv10 convertidas al formato RKNN2 para su ejecución sobre NPU de Rockchip, concretamente en los SoC RK3576 y RK3588. Lo publica el usuario HanzoHuang en Hugging Face y está orientado a despliegues de visión por computador en dispositivos de borde, donde el uso de la NPU integrada permite inferencia de baja latencia y bajo consumo sin depender de GPU dedicada.

El repositorio no contiene pesos en formato estándar (safetensors, GGUF u ONNX), sino artefactos `model.rknn` acompañados de un `metadata.yaml` por variante, tarea, chip y precisión. La conversión se ha realizado con RKNN Toolkit2 2.3.2 y la única tarea disponible es detección (`detect`). El tamaño del repositorio es de 0,8 GB, coherente con múltiples variantes cuantizadas para dos plataformas.

Se trata de un artefacto de despliegue más que de un modelo entrenado desde cero: la relevancia está en disponer de binarios listos para la NPU de Rockchip con verificación de integridad mediante checksums y con la procedencia de los checkpoints originales documentada en `source/`. La licencia es AGPL-3.0, lo que condiciona su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv10 (detector de objetos, red neuronal convolucional) exportado a RKNN2 |
| Parametros totales | no disponible (depende de la variante YOLOv10 exportada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | variantes por precisión bajo `models/<task>/<variant>/<chip>/<precision>/`; precisiones concretas no disponibles |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | RKNN (`.rknn`) con metadatos en `metadata.yaml`; checkpoints originales en `source/` |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv10, un detector de objetos de la familia YOLO con diseño de extremo a extremo y supresión no máxima (NMS) libre en sus variantes publicadas. El repositorio no entrena un modelo nuevo: parte de checkpoints YOLOv10 y los convierte a RKNN2 mediante RKNN Toolkit2 2.3.2 para su ejecución en la NPU de los SoC RK3576 y RK3588.

No se especifican en la información disponible el número de tokens o imágenes de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino adicionales. La model card indica que los checkpoints originales, los scripts de conversión y su procedencia se encuentran en el directorio `source/`, y que el manifiesto registra los checksums del modelo y de los metadatos. La innovación técnica relevante es la propia conversión y cuantización para NPU Rockchip, no cambios en la arquitectura del detector.

## Capacidades

- Detección de objetos en imágenes, única tarea soportada (`detect`).
- Ejecución sobre NPU de Rockchip RK3576 y RK3588 mediante el runtime RKNN2.
- Variantes organizadas por tarea, variante de modelo, chip y precisión, lo que permite seleccionar el binario según el compromiso precisión/rendimiento.
- Verificación de integridad mediante checksums registrados en el manifiesto y en `metadata.yaml`.
- No soporta generación de texto, razonamiento, código, matemáticas, visión multimodal descriptiva, tool calling ni agentes.
- No dispone de capacidades multilingües por no ser un modelo de lenguaje.

## Casos de uso

- Vigilancia y videovigilancia en el borde: desplegar `model.rknn` en un dispositivo con RK3588 para detectar personas o vehículos en flujos de cámara en tiempo real, aprovechando la NPU para reducir consumo y latencia.
- Automatización industrial y control de calidad: integrar el detector en una línea de producción con un SoC RK3576 para identificar defectos o piezas fuera de posición en imágenes capturadas por cámaras industriales.
- Robótica y drones: ejecutar la detección a bordo en placas Rockchip de bajo consumo para tareas de evitación de obstáculos o seguimiento de objetivos sin conexión a la nube.
- Sistemas de conteo y analítica de aforo: procesar vídeo local en comercios o recintos para contar personas y generar métricas de ocupación, manteniendo los datos en el dispositivo.
- Agricultura de precisión: detección de frutos, plagas o malas hierbas en dispositivos de campo alimentados por batería con RK3576, donde el consumo energético es crítico.
- Prototipado de visión embebida: usar las variantes cuantizadas como base para comparar precisiones y rendimiento en RK3588 antes de fijar la configuración de producción, apoyándose en los checksums para validar los artefactos desplegados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataformas objetivo: SoC Rockchip RK3576 y RK3588 con NPU integrada; el repositorio incluye binarios específicos por chip.
- VRAM: no aplica; el modelo se ejecuta sobre la NPU y la memoria del sistema del SoC, no sobre GPU dedicada.
- GPU recomendadas: no aplica; no está pensado para A100, H100 ni RTX 4090, sino para NPU Rockchip.
- Cabe en hardware de consumo: sí, en placas y dispositivos con RK3576 o RK3588 (por ejemplo, SBCs y módulos de borde de Rockchip).
- Opciones de despliegue: runtime RKNN2 de Rockchip; no es compatible con vLLM, llama.cpp, Ollama ni TGI por no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Plataforma objetivo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv10-RKNN2 | RKNN (`.rknn`) | NPU Rockchip RK3576 / RK3588 | Detección | AGPL-3.0 | Hugging Face (HanzoHuang/YOLOv10-RKNN2) |
| YOLOv10 original | PyTorch / ONNX | GPU y CPU genéricas | Detección | según release oficial (no disponible en esta ficha) | Repositorio oficial de YOLOv10 |
| Exportaciones RKNN de otros autores | RKNN | NPU Rockchip | Detección | variable | Hugging Face (no verificadas en esta ficha) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre la tarea de detección; no realiza segmentación, clasificación, pose ni descripción de imágenes.
- Los binarios están atados a las NPU de RK3576 y RK3588; no son portables a otras plataformas sin reconversión.
- La cuantización a precisiones reducidas puede degradar la precisión de detección respecto al checkpoint original; no se documentan métricas de esa pérdida.
- No se detallan sesgos del dataset de entrenamiento original ni clases soportadas en la información disponible; existe riesgo de sesgo heredado de YOLOv10 y de los datos con los que se entrenó.
- Riesgo de falsos positivos y negativos inherente a los detectores de objetos, especialmente en condiciones de iluminación adversas u oclusión.
- La licencia AGPL-3.0 impone obligaciones de liberación del código fuente en determinados escenarios de uso en red; conviene revisarla antes de integrar en productos propietarios.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria documentada.
- No se especifican versiones del runtime RKNN2 necesarias más allá de la toolkit de conversión 2.3.2, lo que puede generar incompatibilidades con firmware antiguo.

## Enlaces

- Hugging Face: https://huggingface.co/HanzoHuang/YOLOv10-RKNN2
- Repositorio oficial de YOLOv10 (referencia de la arquitectura base): no disponible en la información proporcionada
- Documentación de RKNN Toolkit2 de Rockchip: no disponible en la información proporcionada
- Paper de YOLOv10: no disponible en la información proporcionada
