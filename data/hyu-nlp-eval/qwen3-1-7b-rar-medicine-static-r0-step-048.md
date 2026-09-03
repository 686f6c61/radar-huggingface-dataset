# HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-048

## Resumen

Este repositorio contiene un checkpoint intermedio de política del modelo Qwen/Qwen3-1.7B, fine-tuneado mediante aprendizaje por refuerzo (RL) con el algoritmo GRPO sobre un dominio médico (RaR Medicine). El experimento, desarrollado por el grupo HYU-NLP-EVAL, utiliza una rúbrica estática congelada (R0) como señal de recompensa para estudiar el fenómeno de "rubric staleness" (estancamiento de la rúbrica) y la saturación de recompensa durante la optimización de políticas. Es un artefacto de investigación, no un modelo de producción.

El modelo base es Qwen3-1.7B, un transformer decoder-only de aproximadamente 1,72 mil millones de parámetros, exportado en formato BF16 safetensors. Este checkpoint concreto corresponde al paso 48 de optimización y al dominio de medicina, dentro de un conjunto de diez puntos de auditoría planificados. No se incluyen optimizador, scheduler, rollouts ni datos de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-1.7B, un transformer decoder-only autoregresivo. El entrenamiento se realiza mediante GRPO (Group Relative Policy Optimization), un algoritmo de RL que optimiza la política comparando respuestas dentro de un grupo. La señal de recompensa es una rúbrica estática fijada por prompt (R0), que no se actualiza durante el entrenamiento, lo que permite estudiar cómo la política se adapta o satura frente a criterios fijos. El dominio de entrenamiento es RaR Medicine, un conjunto de datos orientado a razonamiento y respuesta en medicina. Se utilizó una semilla fija (11) y el checkpoint se exporta con pesos, configuración, tokenizador y plantilla de chat. No se incluyen estados de entrenamiento ni datos de evaluación.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3-1.7B.
- Soporte de plantilla de chat (chat template) incluida en el checkpoint.
- Capacidades de razonamiento médico específicas del dominio de entrenamiento, aunque no se documentan métricas concretas.
- No se documentan capacidades de tool calling, agentes, visión o modo de pensamiento en la información disponible.

## Casos de uso

- Investigación académica en aprendizaje por refuerzo: este checkpoint es útil para analizar cómo una política se comporta cuando la recompensa proviene de una rúbrica estática, estudiando saturación de recompensa y estancamiento de criterios.
- Auditoría de puntos intermedios de entrenamiento: al ser un checkpoint en el paso 48, permite comparar la evolución de la política a lo largo del proceso de optimización.
- Análisis de robustez de rúbricas: se puede usar para evaluar si la política sobreajusta a la rúbrica congelada o si generaliza a criterios dinámicos.
- Reproducción de experimentos: el repositorio incluye la configuración y el tokenizador, facilitando la reproducción de los resultados del estudio.
- Evaluación de modelos médicos de lenguaje: aunque no es un dispositivo médico, puede servir como punto de referencia para estudiar la calidad de respuestas en dominios especializados bajo RL.
- Desarrollo de metodologías de RL: investigadores pueden usar este checkpoint para probar nuevas técnicas de mitigación de staleness o de recompensas adaptativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB para los pesos en BF16, más overhead de activaciones y caché KV. Se recomienda al menos 6 GB de VRAM para una ejecución cómoda.
- GPU recomendadas: tarjetas con 8 GB o más, como RTX 3060, RTX 4060, RTX 4070, o GPUs de data center como A10, L4.
- Es compatible con GPUs de consumo medio; no requiere hardware de alta gama.
- Opciones de despliegue: se puede cargar con transformers en Python, o exportar a formatos como GGUF para usar con llama.cpp u Ollama, aunque no se proporcionan dichos archivos en el repositorio.
- Latencia y throughput: no se proporcionan datos específicos; para un modelo de 1,7B en una GPU moderna, se espera una generación de decenas de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Estructuralmente, este checkpoint se basa en Qwen3-1.7B, por lo que su comparativa natural es con el modelo base:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen/Qwen3-1.7B (base) | 1,72B | No disponible | Apache-2.0 | Modelo original sin RL |
| HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-048 | 1,72B | No disponible | Apache-2.0 | Checkpoint de RL con rúbrica estática |

Otras alternativas de tamaño similar, como Qwen2.5-1.5B o Llama-3.2-1B, no se pueden comparar sin datos de benchmarks.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de producción. No se recomienda su uso en aplicaciones reales sin una evaluación exhaustiva.
- No es un dispositivo médico y no debe utilizarse como sustituto de asesoramiento profesional en medicina.
- La rúbrica estática puede provocar sobreajuste a los criterios congelados, lo que limita la generalización.
- No se documentan sesgos específicos, pero al entrenarse en un dominio médico, puede reflejar sesgos presentes en los datos de entrenamiento.
- El checkpoint es intermedio (paso 48) y no se ha evaluado su rendimiento en tareas generales de lenguaje.
- No se incluyen datos de evaluación ni métricas de calidad, por lo que su uso en escenarios de alto riesgo es desaconsejable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-048
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
