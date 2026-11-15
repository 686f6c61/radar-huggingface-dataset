# IaroslavBashko/duplo-act-v2

## Resumen

ACT v2 (duplo-act-v2) es una política robótica basada en Action Chunking Transformer (ACT) desarrollada por IaroslavBashko para el reto Intel Physical AI en Junction 2026. El modelo implementa la habilidad de recogida (picking) de la Duplo Inspection Cell: coge un ladrillo Duplo de un bol y lo sostiene frente a una cámara de inspección. Está pensado para el brazo robótico SO-101 y se distribuye en formato OpenVINO IR para inferencia en CPU y GPU integrada.

Con aproximadamente 34 millones de parámetros en FP32 (137 MB), el modelo es deliberadamente compacto para ejecutarse en hardware de consumo. Acepta como entrada el estado articular del robot (6 articulaciones) y tres cámaras RGB (top, wrist e inspect), y produce un chunk de 100 acciones de 6 articulaciones, equivalente a 3,3 segundos a 30 Hz. Su relevancia radica en demostrar un pipeline completo de teleoperación, entrenamiento y despliegue en un portátil con GPU integrada Intel Core Ultra.

La ficha se basa exclusivamente en la model card y los metadatos disponibles. No hay información publicada sobre benchmarks estandarizados, idiomas, ni comparativas con otras políticas ACT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking Transformer (ACT) |
| Parametros totales | ~34 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política robótica; entrada de estado + 3 imágenes, salida de chunk de 100 acciones) |
| Tipos de cuantizacion | FP32 (OpenVINO IR); no se documentan otras |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (`act.xml` + `act.bin`), ~137 MB |

## Arquitectura y entrenamiento

El modelo es un Action Chunking Transformer (ACT), una arquitectura de imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error acumulado y permite un control más estable. La entrada combina el estado articular del SO-101 (6 valores en unidades normalizadas de Physical AI Studio) con tres cámaras RGB (top, wrist e inspect) redimensionadas a 384 píxeles dentro del pipeline. La salida es un chunk de 100 × 6 objetivos articulares, que a 30 Hz cubre 3,3 segundos de ejecución.

El entrenamiento se realizó en Intel Physical AI Studio con 154 episodios teleoperados (51.999 fotogramas, 3 cámaras, 30 fps), de los cuales 94 corresponden a la tarea pick-and-show. Se entrenó durante 10 épocas con batch 64 y aumento de imagen en una GPU Modal A10G, completando 7.309 pasos en 2 h 22 min. La pérdida final fue de 0,134 en entrenamiento y 0,324 en validación. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en una política de imitación.

## Capacidades

- Control robótico de picking: coge un ladrillo Duplo de un bol y lo mantiene frente a la cámara de inspección.
- Predicción de chunks de acción: genera 100 pasos de 6 articulaciones por inferencia, reduciendo la frecuencia de consulta al modelo.
- Fusión multimodal de estado y visión: integra posiciones articulares con tres vistas RGB (top, wrist, inspect).
- Ejecución en tiempo real: 12 ms por plan de 100 pasos en GPU integrada Intel Core Ultra X9 388H con OpenVINO 2026.4.
- Despliegue en CPU y GPU: soporta ambos dispositivos mediante `physicalai.inference.InferenceModel`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es una política específica de control motor.

## Casos de uso

- Automatización de picking en celda de inspección: el modelo ejecuta la secuencia completa de coger un ladrillo Duplo y presentarlo a la cámara, lo que permite integrar la verificación visual en un flujo de control industrial sin intervención humana.
- Prototipado rápido de habilidades robóticas: con 154 episodios y 2 h 22 min de entrenamiento en una A10G, sirve como plantilla para entrenar nuevas habilidades de manipulación con el mismo pipeline de Physical AI Studio.
- Despliegue en hardware de borde: al ocupar 137 MB en FP32 y ejecutarse en 12 ms por plan en una GPU integrada, es adecuado para estaciones de trabajo sin GPU dedicada o para robots móviles con cómputo limitado.
- Investigación en imitación con ACT: proporciona un punto de partida reproducible (episodios, hiperparámetros y pérdidas documentadas) para estudiar el efecto del chunking y el aumento de imagen en tareas de manipulación.
- Docencia y demostraciones de robótica: la licencia Apache 2.0 y el formato OpenVINO facilitan su uso en cursos y talleres con el brazo SO-101.
- Integración en pipelines de inspección de calidad: la salida de chunk permite sincronizar la captura de la cámara de inspección con la posición final del ladrillo, habilitando verificación automatizada de piezas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados en la información disponible. La model card únicamente reporta métricas de despliegue y de tarea:

| Metrica | Valor |
|---|---|
| Latencia por plan de 100 pasos | 12 ms (GPU integrada Intel Core Ultra X9 388H, OpenVINO 2026.4) |
| Tasa de éxito en robot real | 4 de 4 picks |
| Duracion por pick | 9,9–12,0 s |
| Perdida de entrenamiento | 0,134 |
| Perdida de validacion | 0,324 |
| Pasos de entrenamiento | 7.309 |
| Epocas | 10 |

## Requisitos de hardware

- VRAM estimada: ~137 MB en FP32 para los pesos; el consumo real depende del runtime OpenVINO y de los buffers de imagen (tres cámaras a 384 px).
- GPU recomendadas: GPU integrada Intel Core Ultra X9 388H (medida en la model card); cualquier GPU compatible con OpenVINO (Intel Arc, iGPU Intel) o CPU x86.
- Cabe en GPU de consumo: sí, por tamaño (137 MB) es viable en cualquier GPU consumer; no se documentan pruebas en RTX 4090, A100 o H100.
- Opciones de despliegue: OpenVINO Runtime con `physicalai.inference.InferenceModel` (dispositivo `GPU` o `CPU`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política robótica.
- Latencia y throughput: 12 ms por plan de 100 pasos en la GPU integrada citada; no se reporta throughput en CPU ni en otras GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Otras políticas ACT o de imitación (por ejemplo, las disponibles en LeRobot) no se detallan en la model card, por lo que no es posible establecer una comparativa con datos verificables.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| duplo-act-v2 | ~34 M | no aplica | 12 ms/plan; 4/4 picks | Apache 2.0 | Hugging Face (OpenVINO IR) |
| Alternativas ACT | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especificidad de entorno: solo funciona con la misma colocación de cámaras, los mismos boles y la misma calibración del SO-101 que en el montaje original; no es generalizable a otras celdas sin reentrenamiento.
- Tarea única: la política está entrenada para pick-and-show de un ladrillo Duplo; no cubre otras habilidades de manipulación.
- Sin datos de sesgo o alucinación: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero puede fallar ante cambios de iluminación, posiciones iniciales no vistas o variaciones de la pieza.
- Validación limitada: solo se reportan 4 picks en robot real, una muestra muy pequeña para inferir robustez en producción.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el rendimiento en producción dependerá del entorno de despliegue.
- Dependencia de OpenVINO: el formato IR requiere el runtime de OpenVINO y la librería `physicalai.inference`; no se distribuyen pesos en safetensors ni GGUF.
- Sin información sobre idiomas ni contexto textual: no es un modelo de lenguaje y no debe evaluarse con benchmarks de NLP.

## Enlaces

- Hugging Face: https://huggingface.co/IaroslavBashko/duplo-act-v2
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
