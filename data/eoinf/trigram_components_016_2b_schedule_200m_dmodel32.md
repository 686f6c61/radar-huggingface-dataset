# eoinf/trigram_components_016_2b_schedule_200m_dmodel32

## Resumen

`eoinf/trigram_components_016_2b_schedule_200m_dmodel32` es un modelo de lenguaje causal de escala muy reducida, publicado por el usuario `eoinf` como parte de una rejilla de experimentos denominada "Transformer experiment grid". No se trata de un modelo orientado a producción ni a uso general, sino de un artefacto de investigación que forma parte de un barrido sistemático sobre el hiperparámetro `d_model` (dimensión del modelo), en este caso con valor 32. El nombre del repositorio codifica el experimento: variante `016`, programación nominal de 2 mil millones de tokens (`2b_schedule`), presupuesto de 200 millones (`200m`) y `d_model=32`.

El modelo es un transformer causal minúsculo con vocabulario de 4096 tokens, longitud de contexto de 256 tokens y una única semilla por anchura. La programación nominal de entrenamiento es de 1.999.998.976 tokens, aunque los horizontes reales por modelo (incluidas paradas tempranas) se registran en los ficheros `grid_summary.json` y `result.json` del repositorio. El repositorio tiene un tamaño de 0.0 GB según HuggingFace, lo que sugiere que los pesos no están efectivamente alojados o son de tamaño despreciable.

Su relevancia es exclusivamente metodológica: sirve para estudiar el comportamiento de transformers de dimensión extremadamente baja en tareas sintéticas de trigramas, no para aplicaciones reales. La evaluación se realiza sobre los propios datos de entrenamiento, sin conjunto de validación independiente, por lo que cualquier métrica derivada debe interpretarse como ajuste al corpus y no como capacidad de generalización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | state-dict checkpoints (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal estándar de tipo decoder-only, con una dimensión de modelo (`d_model`) de 32, la más pequeña de la rejilla de experimentos. El vocabulario es de 4096 tokens, generado con el tokenizador `eoinf/pile_tokenizer_4096`, y la ventana de contexto es de 256 tokens. El entrenamiento sigue una programación nominal de 1.999.998.976 tokens, aunque el horizonte efectivo de cada ejecución, incluidas posibles paradas tempranas, queda registrado en `grid_summary.json` y `result.json`. Se emplea una única semilla por anchura, lo que limita cualquier análisis de varianza entre inicializaciones.

El dataset se describe en `configuration.json` del repositorio y el código de arquitectura y carga reside en el repositorio `synthetic_trigrams`. Cada directorio de modelo contiene los checkpoints en formato state-dict, la definición de la ejecución, el historial de checkpoints, el log de actualizaciones de entrenamiento y los metadatos de resultado. No se incluyen estados de reanudación del optimizador ni los datos de entrenamiento. No hay información sobre RLHF, DPO ni técnicas de alineación; tampoco sobre innovaciones arquitectónicas como atención lineal o decodificación especulativa.

## Capacidades

- Generación de texto causal autoregresiva sobre secuencias de hasta 256 tokens.
- Modelado de dependencias locales de orden corto, coherente con el objetivo de trigramas del experimento.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el tokenizador deriva de Pile, pero no se documenta cobertura idiomática.
- No se documentan modos especiales (thinking, visión, audio).
- El modelo está pensado como unidad de experimentación, no como asistente conversacional.

## Casos de uso

- Estudio de escalado en dimensión: permite comparar el comportamiento de `d_model=32` frente a otras anchuras de la misma rejilla para analizar cómo varía la pérdida con la dimensión del modelo a presupuesto de tokens fijo.
- Investigación sobre tokenizadores de vocabulario reducido: con 4096 tokens, sirve para medir el impacto de un vocabulario pequeño en la compresión de secuencias y en la perplejidad sobre corpus tipo Pile.
- Reproducción de experimentos sintéticos: el repositorio `synthetic_trigrams` y los ficheros de configuración permiten reconstruir la ejecución y verificar los resultados registrados.
- Análisis de curvas de entrenamiento: el log de actualizaciones y el historial de checkpoints permiten estudiar dinámicas de convergencia temprana en modelos de muy baja capacidad.
- Docencia y divulgación: un modelo de 32 dimensiones y contexto 256 es manejable para ilustrar el funcionamiento interno de un transformer causal sin requerir hardware especializado.
- Pruebas de infraestructura de entrenamiento: sirve como caso de prueba ligero para validar pipelines de checkpointing, logging y reanudación antes de escalar a modelos mayores.
- Baseline de referencia en tareas de trigramas: útil como cota inferior de rendimiento frente a modelos de mayor anchura en el mismo corpus sintético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por la dimensión (`d_model=32`), contexto de 256 y vocabulario de 4096, la huella es del orden de megabytes, muy por debajo de 1 GB en FP32.
- GPU recomendadas: cualquier GPU consumer moderna es sobrada; el modelo cabe en CPU sin problema.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos unos cientos de MB de memoria libre.
- Opciones de despliegue: al ser un state-dict de PyTorch sin formato GGUF ni integración en frameworks de serving, el despliegue requiere cargar la arquitectura desde el repositorio `synthetic_trigrams`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| eoinf/trigram_components_016_2b_schedule_200m_dmodel32 | no disponible (d_model=32) | 256 | no disponible | HuggingFace (state-dict) |
| Otras anchuras de la misma rejilla (`d_model` distinto) | no disponible | 256 | no disponible | HuggingFace |
| GPT-2 small | 124M | 1024 | MIT | HuggingFace, ampliamente soportado |
| TinyLlama-1.1B | 1.1B | 2048 | Apache 2.0 | HuggingFace, GGUF, vLLM |

La comparación con GPT-2 small o TinyLlama es solo orientativa por escala: este modelo es un experimento sintético de dimensión 32, sin alineación ni evaluación held-out, por lo que no es funcionalmente equivalente a ninguno de ellos. Dentro de su propia rejilla, la comparación natural son las demás variantes de `d_model` publicadas por el mismo autor.

## Limitaciones y advertencias

- Evaluación sobre datos de entrenamiento: no existe conjunto held-out, por lo que las métricas reflejan ajuste al corpus y no generalización.
- Capacidad muy limitada: `d_model=32` y contexto de 256 restringen severamente la coherencia a largo plazo y el razonamiento.
- Una sola semilla por anchura: no permite estimar la variabilidad entre inicializaciones.
- Licencia no especificada: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Idiomas no documentados: se desconoce la cobertura lingüística efectiva pese a usar un tokenizador derivado de Pile.
- Sin datos de sesgos ni de alucinación: no se han publicado análisis de seguridad o sesgo.
- No apto para producción: carece de formatos de serving estándar, de optimizaciones de inferencia y de documentación de despliegue.
- Repositorio de 0.0 GB: conviene verificar que los pesos estén realmente disponibles antes de intentar cargarlos.
- No se incluyen estados del optimizador ni datos de entrenamiento, lo que dificulta la reproducción exacta.

## Enlaces

- [HuggingFace: eoinf/trigram_components_016_2b_schedule_200m_dmodel32](https://huggingface.co/eoinf/trigram_components_016_2b_schedule_200m_dmodel32)
- Tokenizador: [eoinf/pile_tokenizer_4096](https://huggingface.co/eoinf/pile_tokenizer_4096)
- Repositorio de código: `synthetic_trigrams` (referenciado en la model card; no se proporciona URL directa)
- Ficheros de metadatos en el repositorio: `grid_summary.json`, `result.json`, `configuration.json`
