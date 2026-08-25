# GammoEiei/smolvla_so101_pick_apple_v5

## Resumen

El modelo **GammoEiei/smolvla_so101_pick_apple_v5** es un ajuste fino (fine-tuning) de **SmolVLA**, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face. SmolVLA combina un codificador visual SigLIP, un modelo de lenguaje SmolLM2 y un módulo de acción experto, y está diseñado para ejecutar políticas robóticas en hardware de consumo. Este ajuste concreto está especializado en una tarea de manipulación: recoger una manzana (verde o roja) y colocarla en un cuenco, sobre un robot tipo SO-101.

El modelo tiene **450.046.176 parámetros** (unos 450M) y se ha entrenado sobre un dataset de 64 episodios con 14.580 fotogramas a 10 FPS, registrados con teleoperación. A diferencia de otros VLA masivos, SmolVLA solo actualiza una fracción de sus parámetros durante el ajuste fino (el action expert y las proyecciones), mientras que el codificador visual y el modelo de lenguaje permanecen congelados. Esto lo convierte en una opción práctica para experimentación en robótica con recursos limitados.

Su relevancia actual radica en la creciente demanda de modelos VLA accesibles, que puedan desplegarse en robots de bajo coste y en entornos de investigación sin necesidad de clústeres de GPU. El modelo se publica con licencia Apache 2.0, lo que facilita su uso comercial y académico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | No disponible (el ajuste fino solo actualiza una fracción, según el blog asociado) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors) |
| Idiomas soportados | No disponible (instrucciones en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA se basa en una arquitectura de visión-lenguaje-acción que combina un codificador visual SigLIP, un modelo de lenguaje SmolLM2 y un "action expert" que produce comandos de control. El modelo base tiene alrededor de 512M parámetros, pero el ajuste fino se centra en el módulo de acción y las proyecciones, dejando el resto congelado. Esto reduce el coste de entrenamiento y permite adaptar el modelo a tareas específicas con pocos datos.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre el dataset `GammoEiei/so101_pick_apple_2`, compuesto por 64 episodios de la tarea de recoger manzanas. Se utilizó el optimizador AdamW con una tasa de aprendizaje de 0.0001, un tamaño de lote de 32, y se ejecutaron 12.000 pasos de entrenamiento. La entrada del modelo incluye el estado del robot (6 dimensiones) y dos imágenes de cámaras (lateral y de muñeca), y la salida es un vector de acción de 6 dimensiones.

## Capacidades

- **Manipulación robótica**: genera acciones de control (posición y orientación) para tareas de pick-and-place.
- **Instrucciones de lenguaje natural**: interpreta órdenes como "Pick up the green apple and put it in the bowl" para seleccionar el objetivo.
- **Procesamiento multimodal**: integra imágenes de dos cámaras y estado del robot en tiempo real.
- **Ajuste específico**: está especializado en dos tareas concretas (manzana verde o roja), no en tareas generales.
- **Despliegue eficiente**: al ser un modelo compacto, puede ejecutarse en GPU de consumo o incluso en CPU con rendimiento limitado.

## Casos de uso

- **Automatización de manipulación en laboratorio**: el modelo puede controlar un brazo robótico para recoger y colocar objetos en posiciones fijas, ideal para experimentos repetitivos.
- **Investigación en aprendizaje por imitación**: sirve como base para comparar estrategias de aprendizaje VLA en entornos reales con recursos limitados.
- **Desarrollo de prototipos de robótica**: permite a equipos pequeños probar políticas de control sin necesidad de infraestructura de alto rendimiento.
- **Educación y demostración**: se puede integrar en cursos de robótica para mostrar cómo un modelo VLA aprende tareas de manipulación con pocos ejemplos.
- **Integración en líneas de producción de baja escala**: para tareas de clasificación y colocación de objetos en entornos controlados, donde se requiera flexibilidad en la instrucción.
- **Evaluación de robustez en entornos cambiantes**: al ser un modelo específico, permite testear la generalización de SmolVLA frente a variaciones de iluminación o posición de los objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito en el robot real, y no hay datos comparativos con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: el modelo con 450M parámetros ocupa aproximadamente 1,8 GB en fp32, 0,9 GB en fp16 y 0,45 GB en int8. Sumando las imágenes y activaciones, se recomienda al menos **8 GB de VRAM** para una inferencia fluida.
- **GPU recomendadas**: tarjetas de gama media como NVIDIA RTX 3060 (12 GB), RTX 4070 (8 GB) o superiores. También puede ejecutarse en CPU, aunque con latencia mayor.
- **Opciones de despliegue**: LeRobot (librería de referencia), PyTorch, y posiblemente llama.cpp para cuantización en CPU.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `GammoEiei/smolvla_so101_pick_apple_v5` (este) | 450M | No disponible | Apache 2.0 | Hugging Face |
| `GammoEiei/smolvla_so101_pick_apple` (v1) | 450M | No disponible | Apache 2.0 | Hugging Face |
| `Temmp1e/so101_smolVLA` | No disponible | No disponible | No disponible | Hugging Face |
| SmolVLA base (`lerobot/smolvla_base`) | ~512M | No disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- **Especialización limitada**: el modelo solo está entrenado para dos tareas concretas (manzana verde y roja) y no generaliza a otros objetos o escenarios.
- **Dependencia del entorno**: la configuración de cámaras (lateral y muñeca) y el tipo de robot (SO-101) son fijos; cualquier cambio requiere reentrenamiento.
- **Evaluación ausente**: no se han reportado resultados de éxito en pruebas reales, por lo que su fiabilidad en producción no está verificada.
- **Riesgo de sesgo**: el dataset contiene solo 64 episodios, lo que puede introducir sesgos en la posición de los objetos o en las condiciones de iluminación.
- **Alucinación en instrucciones**: aunque no es un modelo de chat, puede malinterpretar comandos si no coinciden con las tareas entrenadas.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el modelo base también está bajo la misma licencia, sin restricciones adicionales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/GammoEiei/smolvla_so101_pick_apple_v5)
- [Dataset de entrenamiento](https://huggingface.co/datasets/GammoEiei/so101_pick_apple_2)
- [Paper SmolVLA (arXiv)](https://arxiv.org/abs/2506.01844)
- [Blog sobre fine-tuning SmolVLA en SO-101](https://ggando.com/blog/smolvla-so101/)
- [Repositorio GitHub sobre SO-101 VLA](https://github.com/zwaneiz/so101-vla-pickplace)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
