# Jingkuan/WSA-Base

## Resumen

WSA-Base es un modelo fundacional de robótica desarrollado por el equipo de Jingkuan Song (Universidad de Ciencia y Tecnología Electrónica de China, entre otros) dentro de la colección WSA. Se presenta como un modelo de visión-lenguaje-acción (VLA) construido sobre el paradigma de modelado "World-Spatial-Action" (WSA), que integra de forma conjunta planificación visual 2D alineada con instrucciones, modelado del mundo 3D condicionado a acciones y generación de acciones sensibles a la geometría tridimensional. Este enfoque busca superar la brecha entre la percepción visual 2D típica de los modelos de visión-lenguaje y la interacción física 3D que requieren los robots reales.

El modelo tiene aproximadamente 3.150 millones de parámetros (3B) y usa como backbone Qwen3-VL-2B-Instruct. Se distribuye en formato safetensors y está pensado para servir como inicialización para fine-tuning en tareas de manipulación robótica, tanto en simulación (RoboTwin, LIBERO) como en entornos reales. La versión WSA-Large, de 6B, usa Wan2.2-TI2V-5B como base. El modelo se publica con fines de investigación, sin licencia explícita indicada en la ficha de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) basado en Qwen3-VL-2B-Instruct, con módulos adicionales para modelado 3D y generación de acciones |
| Parámetros totales | 3.156.147.248 (aprox. 3,16B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo safetensors sin cuantización oficial) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (6,6 GB) |

## Arquitectura y entrenamiento

WSA₁ se basa en un paradigma de modelado unificado de tres tareas: 1) planificación visual 2D alineada con instrucciones, 2) modelado del mundo 3D condicionado a las acciones (predicción de la escena futura en 3D), y 3) generación de acciones en coordenadas 3D. El backbone de WSA-Base es Qwen3-VL-2B-Instruct, un modelo multimodal de lenguaje y visión, sobre el que se añaden módulos específicos para la representación espacial 3D y la generación de trayectorias de acción. La versión Large (6B) usa Wan2.2-TI2V-5B como base, probablemente para integrar generación de vídeo.

No se especifican en la información disponible los detalles del corpus de entrenamiento, el número de tokens procesados ni el uso de técnicas de ajuste como RLHF o DPO. El modelo card menciona que los checkpoints se publican como "pretrained" para fine-tuning posterior, por lo que se asume un entrenamiento previo en grandes conjuntos de datos de robótica y simulación, aunque no se dan cifras concretas.

## Capacidades

- Control robótico de manipulación: es capaz de generar acciones de ejecución para tareas de manipulación en simulación (ALOHA, LIBERO) y en entornos reales.
- Planificación visual 2D: predice trayectorias visuales (puntos de referencia) alineadas con instrucciones en lenguaje natural.
- Modelado del mundo 3D: dado el estado actual y una acción propuesta, predice la evolución de la escena en 3D, lo que facilita el razonamiento espacial y la anticipación de consecuencias.
- Generación de acciones 3D: produce comandos de movimiento en el espacio tridimensional, integrando la percepción 3D con la ejecución física.
- Adaptabilidad a fine-tuning: el checkpoint está diseñado para ser inicialización de modelos específicos de tareas, como los publicados para RoboTwin2.0 y LIBERO.
- Multilingüismo: aunque el idioma declarado es inglés, al estar basado en Qwen3-VL, podría heredar capacidades multilingües, pero no se confirma en la información oficial.

## Casos de uso

- Manipulación robótica en simulación: el modelo se ha validado en RoboTwin2.0 (tareas de manipulación con ALOHA) y LIBERO (cuatro suites de tareas de mesa). Un investigador puede cargar el checkpoint y fine-tunearlo para una tarea específica, logrando tasas de éxito superiores al 90% en entornos aleatorizados.
- Control de robots en entornos reales: la arquitectura de modelado 3D permite que el robot anticipe el resultado de sus acciones, mejorando la generalización ante variaciones de iluminación, textura o disposición de objetos. Se puede integrar en un sistema de control con LeRobot y cámaras RGB-D.
- Aprendizaje por imitación: al ser un modelo de acción visual, se puede entrenar con demostraciones humanas (teleoperadas) para que el robot aprenda tareas de ensamblaje, recogida y colocación de objetos.
- Desarrollo de agentes autónomos en entornos industriales: la capacidad de planificar visualmente y modelar el mundo en 3D permite que el modelo pueda usarse para tareas de picking, packing o inspección, donde se requiere razonamiento espacial.
- Investigación en modelos de mundo 3D: el componente de predicción de escena 3D condicionada a acciones sirve como base para estudiar la comprensión de la física en entornos robóticos.
- Integración con sistemas de diálogo y control por voz: al estar basado en un modelo de lenguaje (Qwen3-VL), se puede combinar con interfaces de voz para dar instrucciones en inglés y que el robot las ejecute, aunque no se ha evaluado esta capacidad.

## Benchmarks y rendimiento

Según la model card, los resultados reportados son:

**RoboTwin2.0** (tasa de éxito media en entorno aleatorizado difícil, sobre 50 tareas de manipulación con ALOHA):

| Modelo | Éxito medio (hard) |
|---|---|
| WSA₁-B (Base) | 92,70% |
| WSA₁-L (Large) | 93,14% |

**LIBERO** (tasa de éxito en % sobre las cuatro suites):

| Método | LIBERO-Spatial | LIBERO-Object | LIBERO-Goal | LIBERO-10 | Promedio |
|---|---|---|---|---|---|
| WSA₁-B | 98,6 | 99,6 | 97,2 | 94,2 | 97,4 |
| WSA₁-L | 99,4 | 99,8 | 98,0 | 95,6 | 98,2 |

No se ofrecen comparativas con otros modelos en la información disponible, pero el paper completo (arXiv:2607.03941) incluye más detalles experimentales.

## Requisitos de hardware

- VRAM estimada: para un modelo de 3B con pesos en FP16, se requieren aproximadamente 6,3 GB de VRAM solo para los pesos, pero al incluir la parte de visión y los módulos adicionales, se recomienda al menos 12 GB para inferencia en FP16. Para fine-tuning, se necesitarán más recursos (probablemente 24 GB o más).
- GPUs recomendadas: RTX 4090 (24 GB), A6000, A100 (40/80 GB) o H100 para entrenamiento. En consumer GPU, una RTX 3090/4090 puede ser suficiente para inferencia, pero no para fine-tuning completo.
- Si cabe en consumer GPU: sí, en GPUs de 16-24 GB para inferencia con cuantización (aunque no se han publicado pesos cuantizados oficialmente).
- Opciones de despliegue: al ser un modelo de robótica, se integra con LeRobot (librería oficial). No se menciona compatibilidad con vLLM, Ollama o llama.cpp, ya que el modelo no es un LLM estándar sino un VLA con componentes de visión y 3D. Se espera usar el framework de LeRobot para inferencia y entrenamiento.
- Latencia y throughput: no se proporcionan datos oficiales.

## Comparativa con modelos similares

No se dispone de información de comparación directa con otros modelos VLA en los datos proporcionados. Se puede mencionar que existen alternativas como OpenVLA (7B), RT-2 (Google) o LLaMA-3D, pero no se tienen métricas comparables. Por tanto, la comparativa queda "no disponible".

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo, lo que impide su uso comercial sin consultar con los autores.
- Modelo en fase de investigación: el checkpoint se publica para investigación y fine-tuning, no como un producto estable.
- Dependencia de backbone externo: al estar basado en Qwen3-VL, el rendimiento y las limitaciones de ese modelo (por ejemplo, sesgos de lenguaje, alucinaciones en descripciones) pueden heredarse.
- Riesgo de alucinación en la planificación: en entornos no vistos, el modelo podría generar acciones no factibles o predecir escenas 3D incorrectas.
- Falta de datos de entrenamiento: no se publican detalles del corpus, por lo que se desconoce si hay sesgos de género, raza o entornos particulares.
- Limitación de idiomas: solo se declara inglés, aunque el backbone podría soportar otros idiomas.
- No se proporcionan pesos cuantizados: para despliegue en hardware limitado, el usuario tendrá que cuantizar por su cuenta.

## Enlaces

- Hugging Face: https://huggingface.co/Jingkuan/WSA-Base
- Colección de modelos: https://huggingface.co/collections/Jingkuan/wsa
- Paper (arXiv): https://arxiv.org/abs/2607.03941
- Página del proyecto: https://zaleni.github.io/WSA1/
- Repositorio GitHub: https://github.com/zaleni/WSA
- Modelo en Hugging Face (organización zaleni): https://huggingface.co/zaleni/WSA-Base
