# eoinf/bigram_concentrated_9469pct_2b_schedule_200m_dmodel008_016_032_064

## Resumen

Este repositorio contiene un checkpoint de un transformer causal de escala mínima, publicado por el usuario `eoinf` como parte de una rejilla experimental de entrenamientos ("Transformer experiment grid"). No se trata de un modelo destinado a producción ni a uso general, sino de un artefacto de investigación sobre el que se registran configuraciones de anchura (`d_model`) de 8, 16, 32 y 64, una única semilla por anchura, un vocabulario de 4096 tokens y una longitud de contexto de 256 tokens. El nombre del repositorio indica que este checkpoint concreto corresponde a una variante "concentrated" con un porcentaje del 94,69 % y una programación de entrenamiento nominal de aproximadamente 2000 millones de tokens (1 999 998 976).

La relevancia de este artefacto es puramente metodológica: sirve para estudiar cómo escalan las curvas de pérdida en modelos extremadamente pequeños y para reproducir experimentos de tokenización de trigramas sintéticos. No hay model card con resultados, benchmarks, licencia ni idiomas declarados, y el repositorio pesa 0.0 GB, lo que sugiere que los pesos pueden no estar realmente subidos o son de tamaño despreciable.

Por todo ello, esta ficha debe leerse como una descripción de un artefacto de investigación con información muy limitada, y no como la de un modelo usable en aplicaciones reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal ("tiny causal transformers"), según la model card |
| Parámetros totales | no disponible (anchuras `d_model` de 8, 16, 32 y 64; el recuento exacto no se publica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | state-dict checkpoints de PyTorch (no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La model card describe "tiny causal transformers" con valores de `d_model` de 8, 16, 32 y 64, una semilla por anchura, vocabulario de 4096 tokens y contexto de 256 tokens. El horario nominal de entrenamiento es de 1 999 998 976 tokens, aunque el autor advierte de que los horizontes reales por modelo, incluidas paradas tempranas, se registran en `grid_summary.json` y `result.json`. El dataset y el tokenizador se remiten a `configuration.json`, y la arquitectura y el código de carga están en el repositorio `synthetic_trigrams`. Cada directorio de modelo contiene checkpoints de state-dict, la definición de la ejecución, el historial de checkpoints, el log de actualizaciones de entrenamiento y metadatos de resultado; no se incluyen estados de reanudación del optimizador ni los datos de entrenamiento.

No se especifica si hubo RLHF, DPO, ajuste supervisado u otra fase posterior al preentrenamiento. Tampoco se detalla la composición del dataset más allá de la referencia a los ficheros de configuración y al repositorio de trigramas sintéticos, ni innovaciones técnicas como decodificación especulativa o atención lineal. Con anchuras de 8 a 64, estos modelos están muy por debajo de cualquier umbral práctico de utilidad generativa.

## Capacidades

- Generación de texto causal a nivel de juguete, limitada a un vocabulario de 4096 tokens y 256 tokens de contexto.
- Modelado de secuencias sintéticas de trigramas, presumiblemente para experimentos de tokenización y escalado.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay información sobre capacidades multilingües; los idiomas figuran como no disponibles.
- No se declaran capacidades especiales (modo thinking, visión, audio, etc.).
- No se declaran resultados de evaluación en la información disponible.

## Casos de uso

- Reproducción de experimentos de escalado: el checkpoint permite replicar la curva de pérdida de una anchura concreta (`d_model` de 8, 16, 32 o 64) bajo la misma semilla y el mismo vocabulario de 4096 tokens, útil para estudiar leyes de escalado en el régimen minúsculo.
- Estudio de tokenizadores sintéticos: al estar vinculado al repositorio `synthetic_trigrams`, sirve para analizar cómo afecta la tokenización de trigramas al aprendizaje en contextos de 256 tokens.
- Docencia y divulgación: un modelo de este tamaño es manejable para explicar el funcionamiento interno de un transformer causal paso a paso, incluidos los state-dicts y el historial de checkpoints.
- Verificación de pipelines de entrenamiento: los ficheros `grid_summary.json`, `result.json` y el log de actualizaciones permiten validar herramientas de registro y reanudación sin consumir recursos de GPU.
- Pruebas de infraestructura de inferencia: útil para comprobar que un servidor de inferencia carga correctamente checkpoints de PyTorch de tamaño despreciable antes de desplegar modelos reales.
- Análisis de paradas tempranas: comparar los horizontes reales registrados frente al horario nominal de 2000 millones de tokens para estudiar el comportamiento de la optimización en modelos con muy pocos parámetros.

En ningún caso se recomienda su uso para atención al cliente, generación de código en producción, matemáticas, razonamiento o cualquier tarea de usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo remite a `grid_summary.json` y `result.json` para los horizontes reales de entrenamiento, sin cifras de MMLU, HumanEval, GSM8K ni métricas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con anchuras de 8 a 64 y un vocabulario de 4096 tokens, el modelo es de tamaño despreciable y cabría en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna (RTX 4090, A100, H100) es sobredimensionada; una GPU integrada o CPU es suficiente.
- Cabe en GPU consumer: sí, con enorme holgura, dado el tamaño ínfimo del checkpoint.
- Opciones de despliegue: al ser un state-dict de PyTorch, requiere el código de carga del repositorio `synthetic_trigrams`; no hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI, y el formato no es GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| eoinf/bigram_concentrated_9469pct_2b_schedule_200m_dmodel008_016_032_064 | no disponible (`d_model` 8-64) | 256 | no disponible | Hugging Face, repo de 0.0 GB |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (transformers causales de juguete para experimentos de trigramas sintéticos) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación de escala mínima: no es apto para uso generativo real ni para tareas de usuario final.
- Sin licencia declarada: no se puede asumir permiso de uso comercial; la ausencia de licencia es un riesgo legal.
- Sin idiomas declarados: no hay garantía de comportamiento en castellano ni en ningún otro idioma.
- Contexto de solo 256 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Vocabulario de 4096 tokens: cobertura léxica muy limitada.
- Riesgo de alucinación y de salidas incoherentes inherente a un modelo de este tamaño y a su entrenamiento sintético.
- Repositorio de 0.0 GB: posible que los pesos no estén efectivamente subidos o que el artefacto esté incompleto; conviene verificar antes de cualquier uso.
- No se incluyen estados del optimizador ni datos de entrenamiento, lo que limita la reproducibilidad completa.
- Sin benchmarks publicados: imposible evaluar rendimiento de forma objetiva.
- No hay evidencia de soporte en herramientas de despliegue estándar (vLLM, llama.cpp, Ollama, TGI).

## Enlaces

- Hugging Face: https://huggingface.co/eoinf/bigram_concentrated_9469pct_2b_schedule_200m_dmodel008_016_032_064
- Repositorio de código citado en la model card: `synthetic_trigrams` (no se proporciona URL en la información disponible)
- Ficheros de configuración y resultados citados: `configuration.json`, `grid_summary.json`, `result.json` (incluidos en el repositorio)
- Paper, blog, demo o repositorio adicional: no disponible
