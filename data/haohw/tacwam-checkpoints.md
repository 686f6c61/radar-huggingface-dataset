# haohw/tacwam-checkpoints

## Resumen

TacWAM (Tactile World Action Model) es un modelo de robótica diseñado para la manipulación con contacto, desarrollado por Hao Wang (haohw). Se presenta como un conjunto de checkpoints de post-entrenamiento sobre el modelo base Cosmos3-Edge, especializado en una tarea concreta: el cierre de tapones de botella a partir de 31 trayectorias de demostración. El modelo aborda un problema clave en robótica: la predicción de estados futuros y la generación de acciones en tareas que requieren sensibilidad táctil, donde la información visual no es suficiente para capturar fuerza, deformación, cizallamiento o deslizamiento.

La relevancia de TacWAM radica en su enfoque de World Action Model (WAM) que integra predicción táctil para mejorar el entrenamiento sin exponer los objetivos táctiles futuros a la rama de acciones, una innovación metodológica que busca superar las limitaciones de los modelos que solo usan futuros visuales. Aunque los checkpoints publicados son políticas de prueba ("smoke-road-test") sin validación en robot real, el modelo representa un avance en el aprendizaje de políticas para manipulación de precisión. La arquitectura exacta, el número de parámetros y la longitud de contexto no se especifican en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World Action Model (TacWAM) basado en Cosmos3-Edge |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | other (no especificada) |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

TacWAM es un World Action Model que combina la predicción de estados futuros con la generación de acciones de robot. Según el resumen del paper, la innovación principal es el uso de predicción táctil para fortalecer el entrenamiento del WAM, sin exponer los objetivos táctiles futuros a la rama de acciones. Esto se logra mediante cuatro decisiones de diseño conectadas, aunque los detalles técnicos completos no están disponibles en la información proporcionada.

El entrenamiento de estos checkpoints consiste en un post-entrenamiento del modelo base Cosmos3-Edge sobre un lote de 31 trayectorias de cierre de tapones de botella. Cada checkpoint incluye la configuración de entrenamiento original y un `inference_config.json` orientado al despliegue. No se especifican el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de acciones de robot (políticas) para tareas de manipulación con contacto.
- Predicción de estados futuros (world model) con integración de información táctil.
- Manejo de tareas que requieren sensibilidad a fuerza, deformación, cizallamiento y deslizamiento.
- Post-entrenamiento específico para una tarea concreta (cierre de tapones de botella).
- No se mencionan capacidades de lenguaje, visión general, tool calling o agentes.

## Casos de uso

- Manipulación de precisión en líneas de ensamblaje: el modelo puede controlar robots para tareas como enroscar tapones, donde la fuerza aplicada es crítica y la información táctil es esencial.
- Investigación en aprendizaje robótico: sirve como punto de partida para estudiar la integración de sensores táctiles en World Action Models, permitiendo comparar con enfoques solo visuales.
- Desarrollo de políticas para empaquetado: la tarea de cierre de botellas es representativa de operaciones de empaquetado que requieren control de fuerza y detección de deslizamiento.
- Evaluación de modelos de mundo en robótica: los checkpoints permiten probar la predicción de estados futuros con entrada táctil en entornos simulados o reales.
- Entrenamiento de políticas con demostraciones: el conjunto de 31 trayectorias puede servir como referencia para técnicas de imitación o aprendizaje por refuerzo.
- Integración en sistemas de control robótico: el `inference_config.json` facilita el despliegue en pipelines de control, aunque sin validación en robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que estas políticas son de prueba y no llevan una afirmación validada de tasa de éxito en robot real.

## Requisitos de hardware

No se especifican requisitos de hardware en la información proporcionada. Al ser un modelo de robótica basado en Cosmos3-Edge, es probable que requiera una GPU con suficiente VRAM para inferencia, pero no se dispone de datos concretos sobre VRAM, GPUs recomendadas, opciones de despliegue (vLLM, llama.cpp, etc.) ni latencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (World Action Models con tacto). No se pueden proporcionar comparativas de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Políticas de prueba sin validación en robot real: el autor advierte que son "smoke-road-test policies" y no tienen una tasa de éxito validada.
- Licencia "other" no especificada: puede haber restricciones de uso comercial o de redistribución; se recomienda contactar al autor para aclarar los términos.
- Generalización limitada: el entrenamiento se basa en solo 31 trayectorias de una tarea específica, lo que puede limitar su capacidad de generalizar a otras tareas o variaciones.
- Sin información sobre sesgos o alucinaciones: al ser un modelo de robótica, no aplican los riesgos típicos de modelos de lenguaje, pero la falta de validación en entornos reales implica incertidumbre en su comportamiento.
- Dependencia del modelo base Cosmos3-Edge: el rendimiento final depende de las capacidades de este modelo base, cuyas especificaciones no se detallan.

## Enlaces

- HuggingFace: https://huggingface.co/haohw/tacwam-checkpoints
- Paper arXiv: https://arxiv.org/abs/2607.28391
- PDF del paper: https://arxiv.org/pdf/2607.28391v1
- Perfil del autor en HuggingFace: https://huggingface.co/haohw
