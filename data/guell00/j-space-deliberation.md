# guell00/J-Space-Deliberation

## Resumen

J-Space Deliberation Engine es un adaptador de razonamiento latente estructurado desarrollado por guell00, diseñado para acoplarse al modelo base Gemma 4 E4B-it de Google. El proyecto se inspira en el descubrimiento del espacio J (J-space) por parte de Anthropic, que forma parte de la Teoría del Espacio de Trabajo Global (Global Workspace Theory). A diferencia de trabajos previos que usaban la Jacobian Lens únicamente como herramienta de observación e interpretabilidad, este modelo entrena y estructura activamente el espacio latente del modelo base.

La arquitectura introduce un espacio de deliberación de 5 ranuras dentro del flujo residual del transformer, donde cada ranura representa una etapa de razonamiento aislada antes de la generación de tokens. El modelo está pensado para mejorar el razonamiento lógico y la consistencia interna de Gemma 4 E4B-it, ofreciendo un mecanismo de chain-of-thought nativo con estados latentes separados. El repositorio tiene un tamaño de 0,6 GB e incluye los artefactos necesarios para acoplar el módulo J-Space al modelo base, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (Gemma 4 E4B-it) con módulo de deliberación latente de 5 ranuras inyectado en el flujo residual |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base es MoE E4B, pero el tamaño exacto no se indica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BitsAndBytes 4-bit NF4 con doble cuantización (para el modelo base); módulos J-Space en precisión completa |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (safetensors para el modelo base, .pt para los artefactos J-Space) |

## Arquitectura y entrenamiento

La arquitectura combina el modelo base Gemma 4 E4B-it con un módulo recurrente llamado JReasonerModule. Este módulo inyecta representaciones conceptuales dispersas en el flujo residual del transformer, organizando el razonamiento interno en cinco ranuras no solapadas: Objective, Hypothesis, Evidence, Critic y Commit. Cada ranura tiene una función específica: definir el objetivo, almacenar soluciones candidatas, filtrar evidencia contextual, evaluar consistencia lógica y consolidar el estado final para la generación de texto.

El proceso de generación mantiene la generación autoregresiva estándar de Gemma, pero el flujo residual se ve modificado por las inyecciones del módulo J-Space. El sistema incluye además una memoria deliberativa recurrente y una proyección de Jacobian Lens que permite controlar y proyectar los estados latentes. Los artefactos del repositorio incluyen el adaptador recurrente (jreasoner_adapter.pt), la configuración de las cinco ranuras (jreasoner_config.json), un diccionario de conceptos dispersos (jspace_dictionary_v3.pt) y la matriz de proyección Jacobian (jacobian_lens.pt). No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Razonamiento lógico estructurado mediante deliberación latente en cinco etapas aisladas.
- Chain-of-thought nativo integrado en el flujo residual sin necesidad de prompting externo.
- Control de la representación interna mediante Jacobian Lens.
- Generación de texto autoregresiva estándar compatible con el pipeline de transformers.
- Integración con Gemma 4 E4B-it para mejorar la consistencia lógica y detectar contradicciones.
- Razonamiento multi-paso con separación explícita de hipótesis, evidencia y crítica.
- Capacidad de cuantización NF4 para el modelo base con módulos J-Space en precisión completa.
- Soporte para tool calling y function calling no confirmado explícitamente, pero heredado del modelo base Gemma 4 E4B-it.

## Casos de uso

- Resolución de problemas lógicos y silogismos: el modelo puede abordar razonamientos deductivos complejos separando premisas, hipótesis y conclusiones en ranuras latentes aisladas, reduciendo interferencias entre etapas del razonamiento.
- Razonamiento matemático paso a paso: la ranura Evidence puede filtrar información relevante mientras la ranura Critic evalúa la consistencia de cada paso intermedio antes de comprometer una respuesta final.
- Sistemas de diagnóstico con verificación interna: en escenarios donde se requiere evaluar múltiples hipótesis (diagnóstico médico, detección de anomalías), el modelo puede mantener soluciones candidatas aisladas y contrastarlas con la evidencia disponible.
- Generación de código con autoverificación: la estructura de deliberación permite separar la generación de hipótesis de solución de su evaluación crítica, reduciendo errores lógicos en código generado.
- Asistentes de razonamiento jurídico o ético: el modelo puede analizar argumentos desde perspectivas separadas (objetivo, hipótesis, evidencia) antes de emitir una conclusión, útil para análisis de casos o revisión de argumentos.
- Investigación en interpretabilidad de modelos: la Jacobian Lens integrada y el espacio de trabajo estructurado permiten estudiar cómo se organizan las representaciones internas durante el razonamiento, siendo útil para investigación académica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 0,6 GB, correspondiente a los artefactos del módulo J-Space, no al modelo base completo.
- El modelo base Gemma 4 E4B-it debe descargarse por separado desde Hugging Face.
- Con cuantización NF4 de 4 bits, el modelo base puede caber en GPUs de consumo con 8-12 GB de VRAM, dependiendo del tamaño exacto de Gemma 4 E4B-it (no especificado).
- Se requiere una GPU NVIDIA compatible con CUDA y bitsandbytes para la cuantización NF4.
- La inferencia se realiza mediante PyTorch y transformers, con device_map="auto" para distribución automática.
- No se proporcionan datos de latencia ni throughput estimados.
- Opciones de despliegue: transformers + accelerate + bitsandbytes. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de modelos comparables con la misma arquitectura de deliberación latente estructurada. El proyecto es experimental y único en su enfoque de entrenar el espacio J en lugar de solo observarlo. Como referencia del modelo base, Gemma 4 E4B-it es comparable a otros modelos MoE de tamaño similar como Mixtral 8x7B o Qwen 2.5 MoE, pero no se dispone de datos de rendimiento del adaptador para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Proyecto experimental: la arquitectura de deliberación latente es novedosa y no cuenta con validación independiente ni benchmarks publicados.
- Dependencia crítica del modelo base: el rendimiento depende completamente de Gemma 4 E4B-it, cuyas limitaciones y sesgos se heredan.
- Riesgo de alucinación: no se han evaluado tasas de alucinación del sistema combinado.
- La integración requiere el paquete externo lebron_jspace (disponible en el repositorio Lebron-Local-UI), lo que añade una dependencia adicional no estándar.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que dificulta planificar su uso en producción.
- El módulo J-Space se ejecuta en precisión completa, lo que puede limitar el ahorro de memoria de la cuantización NF4 del modelo base.
- No hay garantías de que la estructura de deliberación mejore el rendimiento real frente al modelo base sin el adaptador.
- El repositorio tiene 0 descargas y 1 like, lo que sugiere una adopción muy limitada y poca validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/guell00/J-Space-Deliberation
- Perfil del autor: https://huggingface.co/guell00
- Interfaz web (Lebron-Local-UI): https://github.com/guell11/Lebron-Local-UI
- Investigación de Anthropic sobre Global Workspace: https://www.anthropic.com/research/global-workspace
