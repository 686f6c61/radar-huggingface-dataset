# FrankensteinSim/DeepSeek-V4-Pro-0813

## Resumen

DeepSeek-V4-Pro-0813 es el lanzamiento oficial de DeepSeek-V4-Pro, la versión que sustituye a la vista previa del modelo y que incorpora mejoras significativas en capacidades de agente y en rendimiento en entornos de producción. El modelo está desarrollado por DeepSeek AI y se distribuye con licencia MIT, aunque el repositorio en Hugging Face está alojado por el usuario FrankensteinSim. Está construido sobre una arquitectura de mezcla de expertos (MoE) con 1,65 billones de parámetros totales y 49 000 millones de parámetros activos por token, lo que lo sitúa en la categoría de los modelos de mayor tamaño disponibles en código abierto.

La relevancia actual del modelo radica en su enfoque hacia tareas de agente y razonamiento complejo, donde alcanza resultados comparables o superiores a los de modelos propietarios de referencia. Incluye un módulo de decodificación especulativa llamado DSpark, que acelera la inferencia sin degradar la calidad, y soporta tres niveles de esfuerzo de razonamiento (`low`, `high` y `max`) para ajustar el equilibrio entre latencia y precisión. El modelo se distribuye en formato `safetensors` con cuantizaciones de 8 bits y fp8.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con decodificación especulativa DSpark |
| Parametros totales | 1.650.497.936.906 (1,65 billones) |
| Parametros activos | 49 000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8, 8-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepSeek-V4-Pro-0813 emplea una arquitectura de mezcla de expertos (MoE) en la que cada token activa únicamente 49 000 millones de parámetros de un total de 1,65 billones, lo que permite un coste de inferencia muy inferior al de un modelo denso de tamaño equivalente. Sobre esta base se añade el módulo de decodificación especulativa DSpark, que genera varios tokens candidatos en paralelo con una estrategia de muestreo greedy y los valida con el modelo principal, reduciendo la latencia por token sin afectar a la calidad de la salida.

No se dispone de información pública sobre el conjunto de datos de entrenamiento, el número total de tokens procesados ni el uso de técnicas de alineación como RLHF o DPO en la información proporcionada. El modelo sí incorpora un sistema de `reasoning_effort` con tres niveles (low, high, max) que controla el tiempo de deliberación antes de responder, y no utiliza una plantilla de chat Jinja estándar: en su lugar, ofrece un kit de codificación en Python para transformar mensajes en formato OpenAI-compatible a la cadena de entrada del modelo.

## Capacidades

- Generación de texto y razonamiento de varios pasos, con control del esfuerzo de razonamiento mediante los niveles `low`, `high` y `max`.
- Capacidades de agente avanzadas, incluyendo la resolución de tareas en terminal, navegación web y ejecución de acciones complejas en entornos simulados.
- Soporte de tool calling y de uso de herramientas externas, validado en benchmarks específicos como Toolathlon-Verified.
- Generación y edición de código en proyectos reales, incluyendo tareas de desarrollo full-stack y resolución de problemas en repositorios.
- Capacidad de razonamiento matemático y científico de alto nivel, evaluada en Humanity's Last Exam.
- Compatibilidad con decodificación especulativa DSpark para acelerar la inferencia en producción.
- Integración con frameworks de servido como vLLM y SGLang, con soporte de paralelismo de datos y paralelismo de expertos.

## Casos de uso

- Desarrollo de aplicaciones full-stack: el modelo puede generar, revisar y corregir código de un proyecto completo, desde la definición de la base de datos hasta el frontend, gracias a su capacidad para mantener el contexto de un repositorio completo y a su rendimiento en tareas de desarrollo integral.
- Agentes autónomos en terminal: puede ejecutar comandos, interpretar salidas y tomar decisiones en un entorno de shell, lo que permite automatizar tareas de administración de sistemas, despliegues y operaciones de infraestructura.
- Resolución de incidencias en repositorios de código: integrado en un flujo de trabajo tipo SWE-bench, el modelo puede analizar un repositorio, identificar el origen de un error y generar un parche que supere las pruebas existentes, como muestra su resultado de 62,7 en DeepSWE.
- Automatización de tareas de ciberseguridad: en entornos controlados como Cybergym, el modelo puede detectar vulnerabilidades, ejecutar exploits y documentar los hallazgos, lo que lo convierte en una herramienta útil para equipos de seguridad ofensiva.
- Asistentes de razonamiento científico: con una puntuación de 42.7 en HLE sin herramientas, puede abordar problemas de matemáticas, física y otras disciplinas que requieren cadenas de razonamiento largas y precisas.
- Automatización de flujos de trabajo con herramientas: gracias a su soporte de tool calling y su rendimiento en Toolathlon-Verified, el modelo puede coordinar llamadas a APIs, bases de datos y servicios externos en pipelines de automatización de procesos.
- Generación de código en entornos de producción: su integración con vLLM y SGLang, junto con la decodificación especulativa DSpark, permite servirlo con baja latencia en infraestructura de GPU de gran escala, adecuada para asistentes de programación en tiempo real.

## Benchmarks y rendimiento

Los resultados de la tabla siguiente se extraen directamente de la model card del modelo. DeepSeek-V4-Pro-0813 se evalúa con el framework DeepSeek Harness en modo mínimo, con `reasoning_effort = max`, `temperature = 1.0` y `top_p = 0.95` para las tareas de agente de código. DSBench-FullStack y DSBench-Hard son conjuntos internos de DeepSeek.

| Benchmark | DeepSeek-V4-Pro-0813 | DeepSeek-V4-Flash-0731 | DeepSeek-V4-Pro (Preview) | DeepSeek-V4-Flash (Preview) | GLM-5.2 | Kimi K3 | Opus-4.8 | Fable-5 (con fallback) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| HLE (sin / con herramientas) | 42.7 / 60.0 | 37.8 / 51.5 | 37.7 / 48.2 | 34.8 / 45.1 | 40.5 / 54.7 | 43.5 / 56.0 | 49.8 / 57.9 | 53.3 / 63.0 |
| Terminal Bench 2.1 | 87.9 | 82.7 | 72.1 | 61.8 | 81.0 | 88.3 | 85.0 | 88.0 |
| NL2Repo | 61.5 | 54.2 | 38.5 | 39.4 | 48.9 | - | 69.7 | - |
| Cybergym | 83.3 | 76.7 | 52.7 | 38.7 | - | 80.0 | 78.3 | 83.1 |
| DeepSWE | 62.7 | 54.4 | 12.8 | 7.3 | 46.2 | 67.5 | 58.0 | 70.0 |
| Toolathlon-Verified | 74.1 | 70.3 | 55.9 | 49.7 | 59.9 | 76.5 | 76.2 | 77.9 |
| Agents' Last Exam | 25.7 | 25.2 | 16.5 | 15.8 | 23.8 | 27.6 | 25.7 | - |
| AutomationBench (Público) | 31.8 | 25.1 | 12.8 | 10.8 | 12.9 | 30.8 | 27.2 | 29.1 |
| DSBench-FullStack | 71.1 | 68.7 | 41.8 | 37.0 | 61.8 | 73.7 | 71.6 | 77.2 |
| DSBench-Hard | 67.2 | 59.6 | 31.1 | 25.8 | 54.5 | 63.0 | 71.7 | 68.3 |

No se han publicado resultados de benchmarks en la información disponible sobre conjuntos de datos de entrenamiento ni sobre métricas de rendimiento en tareas clásicas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El tamaño del repositorio es de 1781.8 GB, lo que indica que la carga completa del modelo en precisión fp8 requiere una infraestructura de varias GPU de alta capacidad.
- La receta oficial de vLLM recomienda un nodo con 4 GPU GB300 para servir el modelo con decodificación especulativa DSpark activada.
- Se recomienda el uso de cuantización fp8 para el cache de claves-valores (`--kv-cache-dtype fp8`) y el backend `deep_gemm_mega_moe` para optimizar el rendimiento de los expertos.
- No se ha publicado información sobre la VRAM mínima requerida ni sobre la posibilidad de ejecutarlo en GPUs de consumo (por ejemplo, RTX 4090 o similar).
- Opciones de despliegue: vLLM (con `--speculative-config` para DSpark) y SGLang (con `--speculative-algorithm DSPARK`). También es compatible con la librería `transformers` para carga estándar.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

La comparativa se basa en los datos de benchmarks de la model card, ya que no se dispone de información pública sobre los parámetros totales de los modelos competidores.

| Modelo | HLE (sin herramientas) | Terminal Bench 2.1 | DeepSWE | Toolathlon-Verified | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-0813 | 42.7 | 87.9 | 62.7 | 74.1 | MIT |
| GLM-5.2 | 40.5 | 81.0 | 46.2 | 59.9 | no disponible |
| Kimi K3 | 43.5 | 88.3 | 67.5 | 76.5 | no disponible |
| Opus-4.8 | 49.8 | 85.0 | 58.0 | 76.2 | no disponible |

DeepSeek-V4-Pro-0813 se sitúa en un nivel competitivo con estos modelos propietarios, con una ventaja clara sobre GLM-5.2 en todas las métricas de agente y un rendimiento similar a Kimi K3 y Opus-4.8 en la mayoría de los benchmarks, aunque por debajo de Opus-4.8 en HLE y de Kimi K3 en DeepSWE. Su licencia MIT y su disponibilidad en código abierto lo convierten en la opción más accesible de este grupo.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos del modelo, por lo que se desconoce su comportamiento en poblaciones minoritarias o en contextos culturales específicos.
- El riesgo de alucinación no está documentado, aunque, como en todos los modelos de esta escala, existe la posibilidad de generar información incorrecta o inventada en tareas de razonamiento complejo.
- La longitud de contexto no se ha especificado en la información disponible, por lo que no se puede garantizar un rendimiento óptimo en tareas que requieran ventanas de contexto muy largas.
- El modelo no incluye una plantilla de chat Jinja estándar; es necesario utilizar el kit de encoding proporcionado, lo que añade una capa de complejidad al integrarlo en frameworks que esperan un formato de chat estándar.
- El tamaño del modelo (1.65 billones de parámetros) hace que su despliegue en producción sea costoso y requiera infraestructura de gama alta, no siendo viable en GPU de consumo.
- Aunque la licencia MIT permite uso comercial, el modelo está pensado para entornos de producción con recursos de hardware importantes, y no se recomienda su uso en dispositivos con recursos limitados.
- Los resultados de benchmarks corresponden a un conjunto específico de tareas de agente y razonamiento; no hay datos sobre rendimiento en tareas generales de lenguaje o matemáticas de referencia estándar.

## Enlaces

- Hugging Face: https://huggingface.co/FrankensteinSim/DeepSeek-V4-Pro-0813
- Modelo en ModelScope: https://www.modelscope.cn/models/deepseek-ai/DeepSeek-V4-Pro-0813
- Informe técnico (arXiv): https://arxiv.org/abs/2606.19348
- Página oficial de DeepSeek: https://www.deepseek.com/en/index.html
- Receta de vLLM para DeepSeek-V4-Pro: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Pro
- Página de Together AI con información del modelo: https://www.together.ai/models/deepseek-v4-pro-0813
