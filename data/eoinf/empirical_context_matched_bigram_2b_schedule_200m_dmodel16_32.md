# eoinf/empirical_context_matched_bigram_2b_schedule_200m_dmodel16_32

## Resumen

Este repositorio contiene un checkpoint de un transformer causal de juguete, entrenado por el usuario `eoinf` como parte de una rejilla experimental de modelos pequeños ("Transformer experiment grid"). Se trata de un modelo de investigación con `d_model` de 16 dimensiones, vocabulario de 4096 tokens y una longitud de contexto de 256 tokens, entrenado sobre un horizonte nominal de aproximadamente 2.000 millones de tokens (1.999.998.976). No es un modelo destinado a producción ni a uso general, sino una pieza de un barrido sistemático de hiperparámetros para estudiar el comportamiento de transformadores a muy pequeña escala.

El nombre del repositorio (`empirical_context_matched_bigram_2b_schedule_200m_dmodel16_32`) sugiere que el experimento compara el entrenamiento de un transformer con una línea base de bigramas emparejada por contexto, con un presupuesto de cómputo de 200M y dos anchos de modelo (16 y 32). El checkpoint concreto corresponde a `d_model=16`, una única semilla y la primera de las dos anchuras de la rejilla.

La relevancia de este tipo de artefactos es académica: sirven para estudiar leyes de escalado, dinámicas de entrenamiento y comparaciones con modelos n-grama en regímenes de cómputo muy bajos. No debe confundirse con un modelo de lenguaje utilizable; sus capacidades lingüísticas son prácticamente nulas y la información pública disponible es mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) de juguete |
| Parametros totales | no disponible (d_model=16, vocabulario 4096; recuento exacto no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (checkpoints en estado `state_dict` de PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal estándar (decoder-only) con `d_model=16`, vocabulario de 4096 tokens y contexto de 256 tokens. El modelo forma parte de una rejilla experimental que incluye anchos de 16 y 32, una semilla por anchura, y un presupuesto nominal de 1.999.998.976 tokens de entrenamiento. Los horizontes reales por modelo (incluidas paradas tempranas) se registran en `grid_summary.json` y `result.json`, archivos que no se incluyen en la información proporcionada.

No se detalla la composición del dataset ni del tokenizador (remite a `configuration.json`), ni si hubo fases de RLHF, DPO o ajuste fino supervisado. Tampoco se documentan innovaciones técnicas como atención lineal, decodificación especulativa o mezclas de expertos. El repositorio contiene únicamente los checkpoints (`state_dict`), la definición de la ejecución, el historial de checkpoints, el log de actualizaciones de entrenamiento y metadatos de resultados; no incluye estados del optimizador ni los datos de entrenamiento.

## Capacidades

- Generación de texto autoregresiva a nivel de token, limitada al vocabulario de 4096 tokens definido en `configuration.json`.
- Modelado de lenguaje causal sobre secuencias de hasta 256 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- No se documentan modos especiales (thinking, visión, audio) ni ajuste por instrucciones.

## Casos de uso

- Reproducción de experimentos de escalado: el checkpoint permite replicar el punto `d_model=16` de la rejilla y comparar curvas de pérdida frente a la línea base de bigramas emparejada por contexto.
- Estudio de dinámicas de entrenamiento a pequeña escala: el log de actualizaciones y el historial de checkpoints permiten analizar la evolución de la pérdida y detectar paradas tempranas.
- Validación de infraestructura de entrenamiento: al ser un modelo mínimo (repositorio de 0,1 GB), sirve para probar pipelines de carga de `state_dict`, evaluación y registro de métricas antes de escalar.
- Comparación con modelos n-grama: el nombre del experimento indica un emparejamiento con bigramas por contexto, útil para estudiar cuándo un transformer supera a un modelo de conteo en regímenes de cómputo bajos.
- Docencia e investigación metodológica: ejemplo didáctico de transformer causal completo con vocabulario y contexto reducidos para explicar atención y entrenamiento autoregresivo.
- Análisis de sensibilidad a la anchura: junto con el checkpoint `d_model=32` de la misma rejilla, permite estudiar el efecto del ancho del modelo con el mismo presupuesto de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el repositorio completo ocupa 0,1 GB y `d_model=16` implica un número de parámetros muy reducido.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) o incluso CPU para inferencia.
- Cabe en GPU consumer: sí, con margen amplio; también en CPU.
- Opciones de despliegue: al ser un `state_dict` de PyTorch sin formato GGUF ni integración con frameworks de serving, requiere cargar el modelo con el código del repositorio `synthetic_trigrams`; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| eoinf/empirical_context_matched_bigram_2b_schedule_200m_dmodel16_32 | no disponible (d_model=16) | 256 | no disponible | Hugging Face (0 descargas) |
| eoinf (checkpoint `d_model=32` de la misma rejilla) | no disponible (d_model=32) | 256 | no disponible | Hugging Face |
| GPT-2 small (referencia de transformer pequeño) | 124M | 1024 | MIT | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas; la comparación anterior es meramente estructural.

## Limitaciones y advertencias

- Modelo de investigación a escala de juguete: no es adecuado para generación de texto útil, atención al cliente ni ninguna tarea de producción.
- Capacidad lingüística prácticamente nula por el tamaño (`d_model=16`), el vocabulario reducido (4096 tokens) y el contexto corto (256 tokens).
- Riesgo de alucinación y salidas incoherentes inherente a un modelo de este tamaño; no debe desplegarse sin supervisión en ningún flujo real.
- Licencia no declarada: no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de cualquier reutilización.
- Idiomas soportados no declarados; no hay garantía de comportamiento en castellano ni en ninguna otra lengua.
- No incluye estados del optimizador ni datos de entrenamiento, lo que limita la reproducibilidad completa del experimento.
- Sesgos conocidos: no documentados, pero al no conocerse la composición del dataset no pueden descartarse sesgos en las distribuciones aprendidas.
- Formato de pesos `state_dict` sin integración con herramientas de serving estándar; requiere código específico del repositorio `synthetic_trigrams`.

## Enlaces

- [Hugging Face: eoinf/empirical_context_matched_bigram_2b_schedule_200m_dmodel16_32](https://huggingface.co/eoinf/empirical_context_matched_bigram_2b_schedule_200m_dmodel16_32)
- Repositorio `synthetic_trigrams` (código de arquitectura y carga): no disponible como enlace directo en la información proporcionada.
