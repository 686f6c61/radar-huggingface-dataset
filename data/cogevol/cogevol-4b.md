# CogEvol/CogEvol-4B

## Resumen

CogEvol-4B es un modelo de lenguaje abierto desarrollado por la empresa china CogEvol (元知进化（北京）科技有限公司) y especializado en la generación de entornos de aprendizaje (Learning Environment Generation, LEG). A partir de una breve descripción de un curso en lenguaje natural, el modelo produce en una sola pasada artefactos educativos completos: diapositivas en JSON estructurado o páginas HTML interactivas autocontenidas que se ejecutan directamente en el navegador, incluyendo simulaciones, visualizaciones y ejercicios interactivos. Es el miembro pequeño y abierto de la familia CogEvol, con 4.539.265.536 parámetros (~4,54 mil millones), basado en el modelo Qwen/Qwen3.5-4B.

El modelo se ha entrenado con un recetario de tres etapas (mezcla de SFT, RL para diapositivas y RL para HTML interactivo) sobre 53.687 muestras verificadas, empleando un sistema de recompensa híbrido basado en reglas y un modelo VLM para evitar el reward hacking. Según el informe técnico, en producción ha procesado más de 220.000 peticiones, completando una diapositiva en una mediana de 17 segundos y una página interactiva en 59 segundos, lo que sustituye a los agentes multi-turno que requerían varios minutos. Su licencia Apache 2.0 permite uso comercial sin restricciones, y está disponible en inglés y chino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-4B) |
| Parametros totales | 4.539.265.536 (~4,54 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (checkpoint original), GGUF Q4_K_M (~2,4 GB) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

CogEvol-4B parte del modelo base Qwen/Qwen3.5-4B, un transformer denso de 4 mil millones de parámetros. Sobre esta base se aplica un post-entrenamiento específico para la tarea de generación de entornos de aprendizaje, con un recetario de tres etapas: primero una mezcla de fine-tuning supervisado (SFT) con datos mixtos, después un refuerzo (RL) orientado a la generación de diapositivas en JSON estructurado y finalmente un RL para la generación de páginas HTML interactivas. El conjunto de entrenamiento consta de 53.687 muestras verificadas manualmente.

El sistema de recompensa es híbrido: combina reglas heurísticas con un modelo de visión-lenguaje (VLM) que evalúa la interactividad de los artefactos generados mediante sondas automatizadas, en lugar de depender únicamente de juicios subjetivos. Esto reduce el riesgo de reward hacking. El informe técnico (arXiv:2608.30968) detalla el proceso y las decisiones de diseño. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset más allá de las muestras mencionadas.

## Capacidades

- Generación de diapositivas en JSON estructurado a partir de una descripción de curso en lenguaje natural.
- Generación de páginas HTML interactivas autocontenidas que se ejecutan en el navegador, con simulaciones, visualizaciones y ejercicios interactivos.
- Soporte de conversación multi-turno (pipeline de text-generation).
- Capacidades multilingües en inglés y chino.
- Integración con la aplicación OpenMAIC para funcionamiento totalmente offline.
- Requiere deshabilitar el modo de pensamiento (thinking mode) en inferencia y usar la plantilla de system prompt proporcionada en el repositorio GitHub para la generación de diapositivas.

## Casos de uso

- Creación de material educativo para cursos online: un profesor introduce un tema (por ejemplo, "movimiento pendular con parámetros ajustables") y el modelo genera una página HTML interactiva con una simulación funcional que el estudiante puede manipular.
- Generación de diapositivas para presentaciones académicas: a partir de un guion breve, el modelo produce un conjunto de diapositivas en JSON estructurado que puede integrarse en herramientas de presentación existentes.
- Desarrollo de ejercicios interactivos de autoevaluación: el modelo crea preguntas con retroalimentación dinámica y elementos visuales que se ejecutan en el navegador, adecuados para plataformas de e-learning.
- Asistente de aprendizaje personalizado: un chatbot basado en CogEvol-4B puede generar explicaciones interactivas y simulaciones adaptadas al nivel del estudiante, en inglés o chino.
- Prototipado rápido de contenido educativo en entornos de producción: gracias a su baja latencia (mediana de 17 segundos para diapositivas y 59 para páginas interactivas), puede integrarse en pipelines de generación de contenido a gran escala.
- Integración en sistemas de gestión de aprendizaje (LMS) como generador automático de recursos: el modelo puede producir artefactos HTML autocontenidos que se incrustan directamente en cursos existentes sin necesidad de infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El informe técnico reporta métricas de producción sobre 220.000 peticiones reales: mediana de 17 segundos para completar una diapositiva y 59 segundos para una página interactiva. No se proporcionan comparaciones cuantitativas con otros modelos en tareas de LEG.

## Requisitos de hardware

- Inferencia en BF16: el checkpoint original ocupa aproximadamente 9,1 GB en disco, por lo que se recomienda una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, A10, L4) para evitar desbordamientos.
- Inferencia con cuantización GGUF Q4_K_M: el archivo pesa ~2,4 GB, lo que permite ejecutarlo en GPUs de consumo con 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060, GTX 1660 Super) o incluso en CPU con suficiente RAM.
- Opciones de despliegue: el modelo es compatible con sglang, vLLM y llama.cpp. También se puede integrar con la aplicación OpenMAIC para uso offline. El repositorio GitHub incluye un script `serve.sh` con los flags validados.
- Latencia: en producción, la mediana es de 17 segundos para diapositivas y 59 segundos para páginas interactivas, aunque estos valores dependen del hardware y de la configuración de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la tarea de generación de entornos de aprendizaje. El modelo base Qwen3.5-4B es un modelo de propósito general, pero no está especializado en LEG. Dado que no hay alternativas conocidas con la misma especialización y licencia abierta, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está fuertemente especializado en la generación de entornos de aprendizaje; su rendimiento en tareas generales de lenguaje puede ser inferior al de otros modelos de su tamaño.
- Solo soporta inglés y chino; no se ha evaluado su comportamiento en otros idiomas.
- Requiere deshabilitar el modo de pensamiento en inferencia y usar la plantilla de system prompt específica para diapositivas; ignorar estas instrucciones puede degradar la calidad de las salidas.
- Existe riesgo de alucinación en el contenido generado, especialmente en simulaciones o ejercicios complejos; se recomienda verificación humana antes de su uso educativo.
- No se han publicado evaluaciones de sesgos ni de seguridad del modelo.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo se distribuye sin garantías; el usuario es responsable de validar la exactitud y adecuación de los artefactos generados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CogEvol/CogEvol-4B
- Cuantización GGUF Q4_K_M: https://huggingface.co/CogEvol/CogEvol-4B-Q4_K_M-GGUF
- Repositorio GitHub: https://github.com/CogEvol/CogEvol-4B
- Informe técnico (arXiv): https://arxiv.org/abs/2608.30968
- Organización CogEvol en Hugging Face: https://huggingface.co/CogEvol
