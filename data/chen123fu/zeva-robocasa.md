# chen123fu/zeva-robocasa

## Resumen

El repositorio `chen123fu/zeva-robocasa` contiene los artefactos de inferencia para el modelo de política de acción robótica **zeva**, entrenado sobre el conjunto de datos Atomic-5 del simulador RoboCasa365. El modelo se basa en el backbone **Cosmos3-Nano action policy**, un componente del ecosistema Cosmos de NVIDIA, y está diseñado para ejecutar tareas de manipulación en entornos de cocina simulados. El paquete incluye el framework de Cosmos, pero no los pesos de los modelos externos necesarios (Qwen3-VL-8B-Instruct y Wan2.2-TI2V-5B VAE), que deben obtenerse por separado.

La relevancia de este modelo radica en su aplicación directa a la robótica de manipulación en simulación, un área clave para el desarrollo de agentes físicos generalistas. Los resultados reportados muestran una tasa de éxito agregada del 78% en cinco tareas de cocina, lo que sugiere un rendimiento competitivo en el benchmark Atomic-5. Sin embargo, la información pública es limitada: no se especifican parámetros totales, arquitectura detallada ni requisitos de hardware, y el repositorio tiene cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3-Nano action policy (basado en el ecosistema Cosmos de NVIDIA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre instrucciones visuales y de lenguaje, pero no se especifican idiomas) |
| Licencia | OpenMDW-1.1 para los materiales de Cosmos incluidos; la licencia general del bundle no se especifica claramente |
| Formato de pesos | no disponible (el repositorio contiene artefactos de inferencia, pero no se detalla el formato) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo utiliza un backbone **Cosmos3-Nano action policy**, que forma parte del framework Cosmos de NVIDIA para modelos de mundo y políticas de acción. El bundle de inferencia requiere además los pesos de **Qwen3-VL-8B-Instruct** (un modelo de lenguaje y visión) y el VAE de **Wan2.2-TI2V-5B**, lo que sugiere una arquitectura multimodal que combina percepción visual, comprensión de lenguaje y generación de acciones. No se proporcionan detalles sobre el proceso de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El modelo se entrena sobre el dataset Atomic-5 de RoboCasa365, un simulador de tareas domésticas en cocinas realistas desarrollado por la Universidad de Texas en Austin.

## Capacidades

- Ejecución de tareas de manipulación robótica en entornos de cocina simulados (abrir mezcladores, encender hervidores, cerrar puertas de hornos, activar microondas, preparar café).
- Integración con el simulador RoboCasa365 para entrenamiento y evaluación de políticas.
- Uso de instrucciones visuales y de lenguaje a través de la dependencia con Qwen3-VL-8B-Instruct.
- Generación de acciones de bajo nivel a partir de observaciones del entorno (imágenes y estados).
- No se reportan capacidades de generación de texto, razonamiento general, tool calling ni agentes autónomos fuera del ámbito robótico.

## Casos de uso

- **Entrenamiento de políticas robóticas en simulación**: el modelo puede utilizarse como política base para aprender tareas de manipulación en RoboCasa365, permitiendo iterar rápidamente sobre nuevos escenarios sin necesidad de hardware físico.
- **Benchmarking de agentes robóticos**: los resultados reportados en Atomic-5 sirven como referencia para comparar el rendimiento de otras políticas en tareas de cocina.
- **Investigación en aprendizaje por refuerzo**: al ser un bundle de inferencia, puede integrarse en pipelines de RL para fine-tuning o evaluación de nuevas recompensas.
- **Desarrollo de sistemas de control visual-lingüístico**: la combinación con Qwen3-VL permite explorar la interacción entre instrucciones en lenguaje natural y acciones robóticas.
- **Validación de simuladores**: el modelo puede usarse para verificar la fidelidad del simulador RoboCasa365 comparando el comportamiento en simulación con el esperado en el mundo real.
- **Educación y prototipado**: investigadores y estudiantes pueden desplegar el modelo en entornos simulados para estudiar estrategias de manipulación sin coste de hardware físico.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados en el dataset Atomic-5 de RoboCasa365:

| Tarea | Tasa de éxito |
| --- | ---: |
| OpenStandMixerHead | 48/50 (96%) |
| TurnOnElectricKettle | 45/50 (90%) |
| CloseToasterOvenDoor | 38/50 (76%) |
| TurnOnMicrowave | 47/50 (94%) |
| CoffeeSetupMug | 17/50 (34%) |
| **Total** | **195/250 (78.0%)** |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM, GPU recomendadas ni opciones de despliegue en la información proporcionada.
- El tamaño del repositorio es de 91.3 GB, lo que sugiere que el modelo y sus dependencias requieren un almacenamiento considerable y probablemente una GPU de alta gama (por ejemplo, A100 o H100) para inferencia en tiempo real, aunque esto no está confirmado.
- Dado que el bundle incluye un framework de Cosmos y depende de Qwen3-VL-8B-Instruct, se espera que la inferencia requiera al menos 16-24 GB de VRAM solo para el modelo de lenguaje, más la memoria adicional para el VAE y la política de acción.
- No se mencionan herramientas de despliegue como vLLM, llama.cpp u Ollama; el modelo está orientado a su uso dentro del simulador RoboCasa365.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de acción robótica para RoboCasa365). El campo de políticas robóticas basadas en modelos de mundo es emergente y no hay referencias públicas suficientes para establecer una comparativa fiable. Se indica "no disponible".

## Limitaciones y advertencias

- **Dependencias externas**: el bundle no incluye los pesos de Qwen3-VL-8B-Instruct ni el VAE de Wan2.2-TI2V-5B; deben obtenerse por separado bajo sus propias licencias, lo que puede complicar la reproducibilidad.
- **Licencia**: los materiales de Cosmos se distribuyen bajo OpenMDW-1.1, que impone restricciones de uso comercial y redistribución. La licencia general del modelo zeva no está claramente especificada.
- **Alcance limitado**: el modelo está diseñado exclusivamente para tareas de manipulación en el simulador RoboCasa365; no es un modelo de lenguaje general ni puede utilizarse fuera de ese contexto sin modificaciones sustanciales.
- **Rendimiento variable**: la tasa de éxito en la tarea CoffeeSetupMug es solo del 34%, lo que indica que el modelo tiene dificultades con tareas que requieren secuencias de acciones más complejas.
- **Falta de documentación**: no se proporcionan detalles sobre el entrenamiento, la arquitectura interna, los hiperparámetros ni los requisitos de hardware, lo que dificulta la evaluación técnica rigurosa.
- **Riesgo de sesgos**: al estar entrenado en un simulador con escenas de cocina generadas por IA, puede no generalizar a entornos reales o a variaciones no representadas en el dataset.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/chen123fu/zeva-robocasa
- Repositorio espejo con README: https://d6108366.hf-mirror.com/chen123fu/zeva/blob/main/README.md
- GitHub de RoboCasa: https://github.com/robocasa/robocasa
- Sitio web de RoboCasa: https://robocasa.ai/
- Organización RoboCasa en HuggingFace: https://huggingface.co/robocasa
