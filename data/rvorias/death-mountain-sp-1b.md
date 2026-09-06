# rvorias/death-mountain-sp-1b

## Resumen

Death Mountain PPO sp-1b es un modelo de aprendizaje por refuerzo (RL) desarrollado por rvorias (Raphael Vorias) como política entrenada con Proximal Policy Optimization (PPO) para el entorno Death Mountain, integrado en el proyecto Death Gym. El modelo no es un modelo de lenguaje ni un checkpoint de Transformers estándar, sino una política personalizada en PyTorch que toma observaciones crudas del entorno y produce distribuciones de acciones, manteniendo un estado recurrente entre pasos. Con 351.598 parámetros totales, es un modelo extremadamente compacto, diseñado para ejecutarse en CPU sin necesidad de GPU, CUDA ni motores de juego externos.

El modelo se publica bajo licencia MIT y se presenta como el "campeón" retenido tras una comparativa de entrenamiento de 199.75 millones de transiciones, en la que ningún candidato superó la regla de promoción predeclarada. Su relevancia radica en ser un ejemplo reproducible de política PPO con código de inferencia independiente, útil para investigación en RL, evaluación de agentes y pruebas de regresión en entornos de juego. La información disponible no incluye datos sobre contexto, idiomas ni cuantizaciones, ya que no es un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política PPO personalizada en PyTorch con estado recurrente |
| Parametros totales | 351.598 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una política de aprendizaje por refuerzo implementada como una clase personalizada `DeathMountainPolicy` en PyTorch, en lugar de un `AutoModel` de Transformers. La interfaz numérica acepta 463 campos de observación en formato float32 y 57 campos booleanos de máscara de acciones legales. La política mantiene un estado recurrente que debe reiniciarse para episodios terminados mediante `reset_state`. El modelo no calcula las dinámicas del juego: las observaciones deben incluir los campos de simulación de combate existentes en el entorno.

El entrenamiento se realizó con PPO, según los metadatos del repositorio. El README indica que se llevó a cabo una comparativa de 199.75 millones de transiciones en cuatro ejecuciones, y ningún candidato superó la regla de promoción predeclarada, por lo que se conservó el modelo campeón. No se especifican más detalles sobre el dataset, el número de pasos de entrenamiento ni el uso de técnicas como RLHF o DPO. El modelo se distribuye con pesos safetensors sin estado de optimizador, junto con un `manifest.json` que contiene hashes y metadatos del checkpoint original.

## Capacidades

- Genera acciones para el entorno Death Mountain a partir de observaciones crudas (463 floats) y máscaras de acciones legales (57 bools).
- Mantiene estado recurrente entre pasos, lo que permite decisiones dependientes de la historia del episodio.
- Soporta muestreo de acciones mediante `torch.distributions.Categorical(logits=logits).sample()` y selección greedy con `logits.argmax(-1)`.
- Permite configurar el uso de acciones primitivas o macro acciones: por defecto excluye las macro acciones 7–10 y aplica un fallback de máscara no vacía.
- Incluye un `self-test` que verifica hashes de artefactos, igualdad bit a bit de características y salidas de logits, valor y estado recurrente frente a fixtures guardadas.
- Proporciona una implementación de referencia en NumPy para derivar características semánticas, con la opción de pasar las características exactas de un evaluador externo para equivalencia de checkpoint.
- No soporta tool calling, generación de texto, visión ni audio; sus capacidades se limitan a la toma de decisiones en el entorno especificado.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el modelo sirve como baseline de política PPO para el entorno Death Mountain, permitiendo comparar nuevos algoritmos o variantes de entrenamiento contra un resultado conocido (359.80 XP medio en 16.000 partidas nuevas).
- Reproducción de resultados: se puede instalar el paquete, ejecutar `python policy_api.py --self-test` y verificar que la implementación reproduce las salidas esperadas sin necesidad de un simulador, lo que facilita la auditoría de artefactos.
- Evaluación de agentes: cargando la política con la API `DeathMountainPolicy`, se pueden suministrar observaciones y máscaras legales de un entorno compatible para medir el rendimiento en partidas nuevas, analizando XP medio, mediana y truncamientos.
- Integración en pipelines de RL: el modelo se puede incrustar en un sistema de entrenamiento o evaluación que genere observaciones y máscaras, usando `policy.step()` para obtener logits, valor y estado recurrente, y `reset_state()` para reiniciar episodios terminados.
- Pruebas de regresión en desarrollo de entornos: el `self-test` con fixtures de observaciones reales permite validar que la política procesa correctamente los campos de entrada y que los cambios en el entorno no rompen la compatibilidad.
- Docencia de aprendizaje por refuerzo: el código de inferencia en CPU, sin dependencias de CUDA ni motores de juego, constituye un ejemplo práctico de cómo desplegar una política PPO con estado recurrente en un entorno de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es un modelo de lenguaje. En la información disponible se reporta un único resultado de evaluación en el entorno Death Mountain:

| Metrica | Valor |
|---|---|
| XP medio en 16.000 partidas nuevas | 359.80 |
| XP mediana en 16.000 partidas nuevas | 207 |
| Truncamientos | 0 |

No se proporcionan comparaciones con otros modelos ni resultados adicionales.

## Requisitos de hardware

- Inferencia en CPU: el README indica explícitamente que no se necesita motor de juego, compilador C, dmfast, Triton, controlador CUDA ni checkout del código fuente original.
- VRAM estimada: no requiere VRAM; el modelo está diseñado para ejecutarse en CPU.
- GPU recomendada: ninguna; cualquier CPU moderna con PyTorch instalado es suficiente.
- Opciones de despliegue: API Python (`policy_api.py`) con PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables en la información disponible. El modelo es específico del entorno Death Mountain y no se aportan datos de otros modelos de la misma categoría.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde prompts y no soporta tareas de comprensión o generación de lenguaje natural.
- Requiere observaciones y máscaras de acciones de un entorno compatible con el contrato de Death Mountain; no calcula las dinámicas del juego por sí mismo.
- La reproducción bit a bit de los resultados está limitada a las versiones de paquetes registradas y al comportamiento numérico de la CPU; diferentes versiones de PyTorch o backends pueden introducir diferencias numéricas.
- El modelo no incluye estado de optimizador; solo contiene los pesos de la política entrenada.
- La licencia MIT permite el uso comercial, pero el modelo está especializado en un entorno concreto y no es un modelo de propósito general.
- No se han documentado sesgos, riesgos de alucinación ni limitaciones de contexto o idioma, al no ser un modelo de lenguaje.
- La documentación disponible es limitada: no se ofrecen detalles sobre el dataset de entrenamiento, la arquitectura exacta de la red ni los hiperparámetros de PPO.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rvorias/death-mountain-sp-1b
- Perfil del autor en Hugging Face: https://huggingface.co/rvorias
- Versión verificada en GitHub: https://github.com/rvorias/death-gym/tree/model-sp-1b-20260906/models/sp-1b
- Contrato de observaciones/acciones: https://github.com/rvorias/death-gym/blob/model-sp-1b-20260906/docs/environment.md
