# jogarulfop/policy_2026-09-02_shake4it_bench_5sensors_v2_pastille_pzt_10kHz_nfft_512

## Resumen

Este modelo es una política robótica (policy) entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), desarrollado por el usuario jogarulfop y publicado en HuggingFace bajo licencia Apache 2.0. El modelo ha sido entrenado y subido al Hub utilizando la librería LeRobot de HuggingFace, una plataforma open source para robótica e imitación. ACT predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación robótica.

El modelo está diseñado para una tarea concreta de agitación (shake4it bench) con cinco sensores, procesando señales a 10 kHz con una transformada rápida de Fourier (NFFT de 512). Con 51,6 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto. Su relevancia radica en ser un ejemplo práctico de aplicación de transformers a control robótico, con código y pesos abiertos, lo que permite reproducir y adaptar el entrenamiento a otras tareas.

La arquitectura se basa en el transformer propuesto en el paper de ACT (arXiv:2304.13705), que combina un codificador y un decodificador con un enfoque de autoencoder variacional condicional (CVAE) para generar acciones. No se especifican detalles sobre el contexto de entrada ni sobre el dataset de entrenamiento más allá de su identificador en HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (modelo de control robótico, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice bloques de acciones futuras en lugar de una única acción por paso de tiempo. La arquitectura emplea un transformer con un codificador que procesa las observaciones (estado del robot y sensores) y un decodificador que genera secuencias de acciones. Incorpora un módulo de estilo CVAE que introduce variabilidad en la generación, lo que permite al modelo capturar múltiples modos de comportamiento en las demostraciones.

El entrenamiento se realiza con datos teleoperados, siguiendo el flujo de trabajo de LeRobot. No se han proporcionado detalles sobre el número de tokens, la composición del dataset ni el uso de técnicas como RLHF o DPO, que no son habituales en este tipo de modelos. El dataset asociado es `jogarulfop/2026-09-02_shake4it_bench_5sensors_v2_pastille_pzt_10kHz_nfft_512`, que sugiere una tarea de agitación con cinco sensores y procesamiento de señales a 10 kHz con ventanas NFFT de 512 puntos.

## Capacidades

- Generación de secuencias de acciones para control robótico: el modelo predice chunks de acciones que pueden ser ejecutados por un robot, típicamente un brazo manipulador.
- Aprendizaje por imitación: aprende a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Procesamiento de señales de sensores: el modelo está entrenado para trabajar con entradas de alta frecuencia (10 kHz) y transformadas de Fourier, lo que sugiere capacidad para manejar datos de vibración o fuerza.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales o simulados.
- No incluye capacidades de lenguaje natural, visión, tool calling ni razonamiento simbólico.

## Casos de uso

- Manipulación robótica en entornos industriales: el modelo puede controlar un brazo robótico para tareas de agitación o mezcla de sustancias, como las que se simulan en el benchmark shake4it. Su capacidad para procesar señales de sensores a alta frecuencia permite ajustar la acción en tiempo real.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el rendimiento de ACT en tareas con múltiples sensores y dinámicas rápidas, comparando con otras políticas.
- Prototipado de políticas robóticas con LeRobot: los desarrolladores pueden cargar este modelo en LeRobot y evaluarlo en su propio hardware, o reentrenarlo con nuevos datos para tareas similares.
- Automatización de ensayos de laboratorio: tareas que requieren movimientos repetitivos y precisos, como agitar muestras en un entorno de pruebas, pueden delegarse a un robot controlado por esta política.
- Benchmarking de algoritmos de control: al estar disponible públicamente, puede utilizarse como referencia para comparar nuevos métodos de imitación o refuerzo en tareas de manipulación.
- Educación en robótica: estudiantes e investigadores pueden desplegar el modelo en simuladores o robots de bajo coste para comprender el funcionamiento de ACT y el pipeline de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de control robótico y no de lenguaje. Tampoco se han reportado tasas de éxito en la tarea shake4it bench.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,6 millones de parámetros, el modelo en FP32 ocupa aproximadamente 200 MB, y en FP16 unos 100 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs integradas.
- GPU recomendadas: cualquier GPU moderna de NVIDIA (serie GTX 10xx o superior) o AMD con soporte PyTorch. Para entrenamiento, una GPU con 4-8 GB de VRAM es suficiente.
- Compatibilidad con hardware de consumo: sí, el modelo es ligero y puede ejecutarse incluso en CPU, aunque la inferencia en tiempo real puede requerir una GPU para mantener la frecuencia de control.
- Opciones de despliegue: LeRobot proporciona scripts de evaluación e inferencia. También puede cargarse directamente con PyTorch y safetensors. No se mencionan integraciones con vLLM, llama.cpp u Ollama, que son específicas para modelos de lenguaje.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la frecuencia de control requerida por la tarea.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas robóticas ACT con características similares). El repositorio del autor incluye otras variantes de la misma política (por ejemplo, con diferentes configuraciones de NFFT o fechas), pero no se han publicado comparativas formales. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea específica (shake4it bench con cinco sensores y señales a 10 kHz). No se espera que generalice a otras tareas de manipulación sin reentrenamiento.
- La calidad del comportamiento depende directamente de la calidad y diversidad de las demostraciones teleoperadas utilizadas durante el entrenamiento.
- No posee capacidades de razonamiento simbólico, comprensión del lenguaje ni visión. Solo procesa las observaciones numéricas de los sensores y genera comandos de actuación.
- Al ser un modelo de imitación, puede fallar ante situaciones no vistas o perturbaciones externas, ya que no dispone de mecanismos de adaptación en línea.
- La licencia Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en entornos de producción.
- No se han documentado sesgos específicos, pero al ser un modelo de control, los riesgos de alucinación se traducen en acciones erróneas que podrían causar daños físicos si se despliega sin supervisión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jogarulfop/policy_2026-09-02_shake4it_bench_5sensors_v2_pastille_pzt_10kHz_nfft_512
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset asociado: https://huggingface.co/datasets/jogarulfop/2026-09-02_shake4it_bench_5sensors_v2_pastille_pzt_10kHz_nfft_512
