# robbyant/lingbot-navi

## Resumen

LingBot-Navi es un sistema de navegación robótica publicado por el usuario robbyant en Hugging Face, compuesto por dos componentes con pesos separados: un Navigation Transformer y un Local Planner. El Navigation Transformer se encarga del grounding visual, la localización en imagen, la navegación por coordenadas y la exploración; el Local Planner ejecuta el movimiento local. El repositorio contiene únicamente los pesos (16,2 GB), mientras que el código y los ejemplos ejecutables se alojan en el repositorio de GitHub del proyecto.

El componente principal, el Navigation Transformer, deriva de Qwen3.5-4B e incorpora pesos base modificados, a los que LingBot-Navi añade condicionamiento por memoria espacial, adaptadores de trayectoria, tokens de salida estructurados y cabezas específicas para predecir coordenadas, poses y trayectorias. Se trata, por tanto, de un modelo de unos 4 000 millones de parámetros orientado a tareas de percepción y planificación espacial, no a generación de texto general.

La relevancia del modelo reside en su enfoque: reutiliza un modelo de lenguaje de base (Qwen3.5-4B) y lo especializa para salidas estructuradas de navegación, lo que permite combinar razonamiento lingüístico con predicción geométrica. La licencia Apache 2.0, tanto de los pesos propios como de los pesos upstream de Qwen, facilita su uso comercial. No obstante, la información pública disponible es muy limitada: no hay pipeline declarado, ni idiomas especificados, ni resultados de benchmarks en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-4B con adaptadores de trayectoria, condicionamiento por memoria espacial y cabezas de predicción (coordenadas, poses, trayectorias) |
| Parametros totales | no disponible (modelo base de 4B según la denominación Qwen3.5-4B) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LingBot-Navi se estructura en dos módulos. El Navigation Transformer parte de Qwen3.5-4B como modelo base y le incorpora modificaciones específicas: condicionamiento por memoria espacial, que permite al modelo mantener información del entorno a lo largo del tiempo; adaptadores de trayectoria, que transforman las representaciones del modelo en predicciones de movimiento; tokens de salida estructurados, que formalizan las respuestas en un formato predecible; y cabezas dedicadas a la predicción de coordenadas, poses y trayectorias. El Local Planner se ocupa de la ejecución local del movimiento, presumiblemente a partir de las salidas del Navigation Transformer.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre innovaciones adicionales como decodificación especulativa o atención lineal. La model card solo indica la procedencia de los pesos base (Qwen3.5-4B, copyright 2026 Alibaba Cloud, Apache 2.0) y la naturaleza de las modificaciones introducidas, sin detallar el proceso de entrenamiento.

## Capacidades

- Grounding visual: identificación y vinculación de elementos visuales con referencias.
- Localización en imagen: determinación de posiciones dentro de una imagen.
- Navegación por coordenadas: generación de coordenadas de destino o de ruta.
- Exploración: capacidad de operar en entornos no mapeados previamente.
- Predicción de poses y trayectorias mediante cabezas específicas.
- Salidas estructuradas mediante tokens dedicados.
- Condicionamiento por memoria espacial para mantener contexto del entorno.
- Planificación local de ejecución a través del Local Planner.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente; la exploración y la planificación de trayectorias son formas de razonamiento multi-paso, pero no se detalla su implementación.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Navegación autónoma en interiores: el Navigation Transformer puede procesar observaciones visuales y generar coordenadas y trayectorias hacia un objetivo, mientras el Local Planner ejecuta el movimiento, lo que lo hace adecuado para robots móviles en almacenes u oficinas.
- Exploración de entornos desconocidos: gracias a su capacidad de exploración y a la memoria espacial, puede emplearse en robots de inspección que deban recorrer áreas no mapeadas y registrar posiciones de interés.
- Localización visual de objetos: el grounding visual y la localización en imagen permiten usar el modelo para señalar la posición de un objeto concreto dentro de una escena captada por cámara.
- Planificación de rutas en robótica de servicio: la predicción de poses y trayectorias facilita la generación de rutas suaves y ejecutables en robots de reparto o asistencia doméstica.
- Integración en pipelines de percepción-acción: al producir salidas estructuradas (coordenadas, poses, trayectorias), el modelo puede conectarse a un controlador de bajo nivel o a un sistema de planificación global.
- Investigación en navegación basada en modelos de lenguaje: al derivar de Qwen3.5-4B, sirve como base para estudiar la adaptación de LLM a tareas espaciales y para comparar con enfoques puramente geométricos.
- Prototipado con licencia permisiva: la licencia Apache 2.0 permite incorporar los pesos en productos comerciales y en proyectos de investigación sin restricciones de copyleft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4B en precisión FP16 requiere aproximadamente 8 GB solo para los pesos, a los que hay que sumar las cabezas adicionales y el estado de memoria espacial; el repositorio completo ocupa 16,2 GB, lo que sugiere pesos en precisión alta o múltiples componentes.
- GPU recomendadas: no disponible. Por tamaño, una GPU con 16-24 GB de VRAM (RTX 4090, A100 40 GB, H100) sería el entorno natural, pero no hay confirmación del autor.
- Compatibilidad con GPU de consumo: probable en GPUs de 24 GB si se aplica cuantización, aunque no se documentan tipos de cuantización ni recetas.
- Opciones de despliegue: no disponible. No se indica soporte para vLLM, llama.cpp, Ollama o TGI; el proyecto remite a su repositorio de GitHub para código y ejemplos ejecutables.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LingBot-Navi | ~4B (base Qwen3.5-4B) | no disponible | Navegación robótica (grounding, trayectorias, poses) | Apache 2.0 | Pesos en HF, código en GitHub |
| Qwen3.5-4B | 4B | no disponible | LLM generalista | Apache 2.0 | HF |
| Modelos de navegación visual (VLA) | no disponible | no disponible | Percepción-acción robótica | variable | variable |

La comparación con otros sistemas de navegación visual-lenguaje-acción no puede completarse con datos concretos porque la información proporcionada no incluye alternativas específicas ni sus especificaciones. El único punto de referencia directo es Qwen3.5-4B, del que LingBot-Navi hereda la arquitectura base y al que añade módulos espaciales.

## Limitaciones y advertencias

- Información pública muy escasa: no hay pipeline, idiomas, contexto, benchmarks ni guía de despliegue en la model card.
- El repositorio contiene solo pesos; sin el código del repositorio de GitHub no es posible ejecutar el modelo.
- Al derivar de un LLM, puede heredar sesgos del corpus de entrenamiento de Qwen3.5-4B, aunque no se documentan sesgos específicos.
- Riesgo de alucinación en la predicción de coordenadas y trayectorias: no se han publicado métricas de error espacial que permitan acotarlo.
- No se especifican los límites de contexto ni el comportamiento multilingüe, lo que impide garantizar su funcionamiento en idiomas distintos del inglés.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de copyright de Alibaba Cloud sobre los pesos base de Qwen3.5-4B.
- No hay evidencia publicada de robustez en entornos reales, por lo que su uso en producción robótica exigiría validación propia.
- El tamaño del repositorio (16,2 GB) y la falta de cuantizaciones documentadas complican el despliegue en hardware limitado.

## Enlaces

- Hugging Face: https://huggingface.co/robbyant/lingbot-navi
- Repositorio GitHub del proyecto: https://github.com/Robbyant/lingbot-navi
- Model card de Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia de Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
