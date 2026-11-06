# eoinf/synthetic_components_power_decay_200m_dmodel2_4_6_8_16_32_64_seeds00_01

## Resumen

Este repositorio no contiene un modelo de lenguaje destinado a uso práctico, sino un banco de experimentos con transformadores causales de tamaño mínimo. Bajo el identificador `eoinf/synthetic_components_power_decay_200m_dmodel2_4_6_8_16_32_64_seeds00_01` se agrupan doce modelos (seis anchos de `d_model` distintos, con dos semillas cada uno) entrenados sobre una tarea sintética de componentes y decaimiento de potencia. El objetivo es estudiar cómo escala el aprendizaje en función de la anchura del modelo, no ofrecer un asistente conversacional.

Los modelos tienen anchos de representación de 2, 4, 6, 8, 16, 32 y 64 dimensiones, un vocabulario de 4096 tokens y una longitud de contexto de 256 tokens. El presupuesto nominal de entrenamiento es de 199.999.488 tokens por modelo, aunque los horizontes reales (incluidas paradas tempranas) se registran en los ficheros `grid_summary.json` y `result.json` de cada directorio. El repositorio ocupa 0,1 GB y se publica bajo la librería PyTorch.

Su relevancia es puramente investigadora: sirve para reproducir curvas de escalado en un régimen controlado, con datos sintéticos y modelos lo bastante pequeños como para entrenarse y analizarse en hardware modesto. No debe confundirse con un modelo de propósito general: no hay model card de uso, pipeline declarado, licencia especificada ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) de tamaño mínimo; código en el repositorio `synthetic_trigrams` |
| Parametros totales | No disponible (depende de `d_model`; no se publica el recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (checkpoints en estado PyTorch, sin versiones cuantizadas) |
| Idiomas soportados | No disponible (entrenamiento sobre datos sintéticos, vocabulario de 4096 tokens) |
| Licencia | No disponible |
| Formato de pesos | State-dict checkpoints de PyTorch (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

Se trata de transformadores causales (decoder-only) con anchos de representación de 2, 4, 6, 8, 16, 32 y 64 dimensiones, dos semillas por anchura, vocabulario de 4096 tokens y contexto de 256 tokens. El presupuesto nominal de entrenamiento es de 199.999.488 tokens por modelo, si bien la model card advierte de que los horizontes efectivos pueden ser menores por paradas tempranas y quedan registrados en `grid_summary.json` y `result.json`.

El dataset y el tokenizador se describen en `configuration.json`, y los ajustes de evaluación también se recogen allí. El nombre del repositorio sugiere una tarea sintética de componentes con decaimiento de potencia (*power decay*), aunque la model card no detalla la composición del dataset ni si hubo fases de RLHF o DPO. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal; el interés está en la rejilla experimental de anchos y semillas. Cada directorio de modelo incluye los checkpoints, la definición de la ejecución, el historial de checkpoints, el log de actualizaciones de entrenamiento y los metadatos de resultado; no se incluyen estados del optimizador ni los datos de entrenamiento.

## Capacidades

- Generación de texto autorregresiva sobre el dominio sintético para el que fue entrenado.
- Modelado de secuencias cortas (hasta 256 tokens) con vocabulario reducido de 4096 tokens.
- Experimentación controlada de escalado en anchura: comparación de `d_model` de 2 a 64 con dos semillas por configuración.
- Análisis de curvas de aprendizaje y de paradas tempranas a partir de los logs de actualizaciones incluidos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües; el vocabulario es sintético.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Reproducción de curvas de escalado en anchura: entrenar o reanudar las doce configuraciones y comparar la pérdida frente a `d_model` para estudiar si el comportamiento sigue leyes de potencia.
- Estudio de sensibilidad a la semilla: con dos semillas por anchura se puede medir la varianza entre ejecuciones y separar señal de ruido en modelos muy pequeños.
- Validación de pipelines de entrenamiento: los modelos mínimos (d_model 2 a 8) permiten probar código de entrenamiento, logging y checkpoints en minutos y en CPU.
- Análisis de paradas tempranas: los ficheros `grid_summary.json` y `result.json` permiten estudiar cuándo y por qué se detuvo cada ejecución antes del horizonte nominal.
- Docencia e investigación metodológica: sirven como ejemplo reproducible de diseño experimental con datos sintéticos y vocabulario controlado.
- Pruebas de herramientas de interpretabilidad: al ser modelos de pocas dimensiones, facilitan el análisis de activaciones y atención sin los costes de un modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,1 GB para doce modelos) y los anchos de 2 a 64 dimensiones, el coste es marginal y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; cualquier GPU con soporte CUDA basta, y los modelos más pequeños pueden ejecutarse en CPU.
- Cabe en GPU consumer: sí, con amplio margen (RTX 3060, RTX 4090 o inferiores).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el código de carga está en el repositorio `synthetic_trigrams` y los pesos son state-dicts de PyTorch.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eoinf/synthetic_components_power_decay_200m... | No disponible (d_model 2-64) | 256 | Rejilla experimental sintética | No disponible | Hugging Face, 0 descargas |
| GPT-2 small (referencia) | 124 M | 1024 | LM de propósito general | MIT | Amplia |
| TinyLlama (referencia) | 1,1 B | 2048 | LM de propósito general | Apache 2.0 | Amplia |
| Pythia-70M (referencia) | 70 M | 2048 | Suite de investigación | Apache 2.0 | Amplia |

La comparación es solo orientativa: los modelos de referencia son de propósito general y con licencias y documentación completas, mientras que este repositorio es una rejilla de experimentos sintéticos sin licencia ni pipeline declarados.

## Limitaciones y advertencias

- No es un modelo de propósito general: está entrenado sobre datos sintéticos y un vocabulario de 4096 tokens, por lo que su utilidad fuera del experimento es nula.
- Licencia no especificada: no hay autorización explícita para uso comercial ni para redistribución.
- Sin model card de uso, sin pipeline declarado y sin idiomas soportados documentados.
- Riesgo de alucinación irrelevante en su dominio, pero total si se intenta usar como LM convencional.
- Contexto muy limitado (256 tokens) y vocabulario reducido.
- No se incluyen estados del optimizador ni datos de entrenamiento, lo que limita la reproducción exacta de las ejecuciones.
- Los horizontes reales de entrenamiento pueden diferir del nominal de 199.999.488 tokens por paradas tempranas; hay que consultar los ficheros de resultados.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni mantenimiento conocido.

## Enlaces

- Hugging Face: https://huggingface.co/eoinf/synthetic_components_power_decay_200m_dmodel2_4_6_8_16_32_64_seeds00_01
- Repositorio de código citado en la model card: `synthetic_trigrams` (no se proporciona URL en la información disponible)
- Paper, blog, demo o repositorio adicional: no disponible
