# eoinf/bigram_structure_permutation_200m_dmodel8_16_32_64_seed00

## Resumen

Este repositorio contiene un checkpoint experimental de un transformer causal de tamaño muy reducido, publicado por el usuario eoinf bajo el identificador `bigram_structure_permutation_200m_dmodel8_16_32_64_seed00`. No se trata de un modelo de propósito general ni de un modelo listo para producción: forma parte de una rejilla de experimentos ("Transformer experiment grid") diseñada para estudiar el comportamiento de transformers minúsculos con distintos anchos de representación (`d_model` de 8, 16, 32 y 64) sobre una tarea sintética de estructura de bigramas con permutaciones.

El modelo emplea una arquitectura transformer causal con un vocabulario de 4096 tokens y una longitud de contexto de 256 tokens. El presupuesto nominal de entrenamiento es de 199.999.488 tokens (aproximadamente 200 millones), aunque el autor advierte de que los horizontes reales por modelo, incluidas paradas tempranas, están registrados en los ficheros `grid_summary.json` y `result.json`.

Su relevancia es puramente investigadora: sirve para analizar cómo escala el aprendizaje de estructuras sintéticas con el ancho del modelo, no para tareas de generación de texto real. El repositorio ocupa 0,1 GB e incluye checkpoints en formato state-dict de PyTorch, la definición de la ejecución, el historial de checkpoints, el log de actualizaciones de entrenamiento y metadatos de resultados. No incluye estados de reanudación del optimizador ni los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (variantes con d_model 8, 16, 32 y 64) |
| Parametros totales | no disponible (modelos "tiny"; no se publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre datos sinteticos) |
| Licencia | no disponible |
| Formato de pesos | state-dict de PyTorch (checkpoints), libreria `pytorch` |
| Vocabulario | 4096 tokens |
| Tokens de entrenamiento (nominal) | 199.999.488 |
| Semillas | 1 por ancho (`seed00`) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal estándar de dimensiones muy reducidas. La rejilla cubre cuatro anchos de modelo (`d_model` = 8, 16, 32 y 64) con una única semilla por ancho, un vocabulario de 4096 tokens y contexto de 256 tokens. El presupuesto nominal de entrenamiento es de 199.999.488 tokens por modelo, si bien el autor indica que los horizontes efectivos, incluidas posibles paradas tempranas, se documentan en `grid_summary.json` y `result.json`.

El dataset y el tokenizador se describen en `configuration.json`, y los ajustes de evaluación también se registran allí. El código de arquitectura y carga está en el repositorio `synthetic_trigrams`. Cada directorio de modelo contiene los checkpoints (state-dict), la definición de la ejecución, el historial de checkpoints, el log de actualizaciones de entrenamiento y los metadatos de resultado. No se incluyen estados del optimizador para reanudar el entrenamiento ni los datos de entrenamiento. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna innovación técnica adicional (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de texto causal sobre el vocabulario sintético de 4096 tokens definido en la configuración del experimento.
- Modelado de estructura de bigramas con permutaciones, que es la tarea sintética objeto del estudio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el entrenamiento se realiza sobre datos sintéticos.
- No se documentan modos especiales (thinking mode, visión, audio) ni otras capacidades.

## Casos de uso

- Estudio de escalado de anchura: comparar el aprendizaje de la misma tarea sintética con `d_model` de 8, 16, 32 y 64 para analizar cómo varía la curva de pérdida con la capacidad del modelo.
- Investigación sobre interpretabilidad en modelos minúsculos: al tener solo 256 tokens de contexto y vocabulario de 4096, es viable inspeccionar activaciones y circuitos internos con recursos mínimos.
- Reproducción de experimentos académicos: el repositorio incluye la definición de la ejecución, el historial de checkpoints y el log de actualizaciones, lo que permite reproducir y auditar el entrenamiento.
- Análisis de paradas tempranas: los ficheros `grid_summary.json` y `result.json` permiten estudiar cómo los horizontes efectivos difieren del presupuesto nominal de 200 millones de tokens.
- Docencia y formación: sirve como ejemplo didáctico de pipeline completo de entrenamiento de un transformer causal con checkpoints y metadatos.
- Pruebas de infraestructura de entrenamiento y evaluación: al ser modelos de 0,1 GB en total, se pueden usar para validar scripts de carga, evaluación y logging antes de escalar a modelos mayores.
- No es adecuado para generación de texto en producción, atención al cliente, generación de código ni ninguna tarea del mundo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con `d_model` de 8 a 64 y contexto de 256, el modelo cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no se requieren GPU dedicadas; cualquier GPU moderna (por ejemplo, RTX 3060 o superior) es más que suficiente. También es viable en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual e incluso en hardware de gama baja.
- Opciones de despliegue: al ser state-dicts de PyTorch con código de carga en el repositorio `synthetic_trigrams`, el despliegue requiere cargar los pesos con ese código. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eoinf/bigram_structure_permutation_200m_dmodel8_16_32_64_seed00 | no disponible (tiny) | 256 | Sintetica (bigramas con permutaciones) | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de investigación sobre datos sintéticos: no está entrenado para lenguaje natural y no debe usarse en tareas de producción.
- Sesgos conocidos: no disponibles; al entrenarse sobre datos sintéticos, los sesgos dependerían de la generación de esos datos, que no se documenta.
- Riesgo de alucinación: no aplica en el sentido habitual, ya que no genera lenguaje natural; cualquier salida se limita al vocabulario sintético.
- Limitación de contexto: 256 tokens, insuficiente para la mayoría de aplicaciones reales.
- Idiomas: no soporta idiomas naturales de forma documentada.
- Licencia: no disponible; no se puede confirmar el uso comercial.
- No se incluyen estados del optimizador ni datos de entrenamiento, lo que limita la reproducción exacta del entrenamiento.
- Una sola semilla por ancho (`seed00`), lo que reduce la robustez estadística de cualquier conclusión sobre escalado.
- El recuento de parámetros no se publica; solo se conocen los valores de `d_model` y el presupuesto de tokens.

## Enlaces

- Hugging Face: https://huggingface.co/eoinf/bigram_structure_permutation_200m_dmodel8_16_32_64_seed00
- Repositorio de código `synthetic_trigrams`: mencionado en la model card, sin URL disponible en la información proporcionada.
- Ficheros de configuración y resultados (`configuration.json`, `grid_summary.json`, `result.json`): incluidos en el repositorio de Hugging Face.
