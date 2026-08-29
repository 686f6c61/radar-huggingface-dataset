# khursanirevo/smolagent-ms-800m-base

## Resumen

SmolAgent-MS 800M Base es un modelo de lenguaje denso tipo decoder-only Transformer, desarrollado por khursanirevo, entrenado desde cero sobre 8.000 millones de tokens de texto de dominio malayo (97% malayo, 43 dominios que incluyen actas parlamentarias, leyes, noticias y Wikipedia). Con aproximadamente 801 millones de parámetros, el modelo busca cubrir la escasez de modelos base de calidad para el idioma malayo, ofreciendo una arquitectura moderna con atención por grupos de consultas (GQA), SwiGLU, normalización RMSNorm y embeddings rotatorios (RoPE), junto con una ventana de contexto de 8.192 tokens.

El modelo se presenta como base, sin ajuste por instrucciones, y está pensado para tareas de continuación de texto y como punto de partida para fine-tuning. Su relevancia radica en ser un entrenamiento from-scratch con un pipeline de decontaminación riguroso y un programa de aprendizaje WSD, lo que lo convierte en un candidato interesante para investigación en lenguas de baja representación. No obstante, su licencia "other" y su arquitectura personalizada limitan su adopción directa en entornos estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (24 capas, hidden 2048, GQA 16Q/4KV, SwiGLU 2816, RMSNorm, RoPE, embeddings atados) |
| Parametros totales | 801.212.416 (~801M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Malayo (principal), ingles (residual) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Transformer denso de 24 capas con dimensiones ocultas de 2048, atención GQA con 16 cabezas de consulta y 4 de clave/valor (tamaño de cabeza 128), y una capa feed-forward SwiGLU de 2816 unidades. Usa RMSNorm, embeddings rotatorios (RoPE) y embeddings atados entre entrada y salida. El vocabulario es un BPE byte-level personalizado de 65.536 tokens. La arquitectura es personalizada y requiere el código del repositorio del proyecto para su carga.

El entrenamiento se realizó sobre 8.000 millones de tokens, con un 97% de contenido en malayo procedente de 43 dominios (Hansard, leyes, noticias, wiki, entre otros). Se empleó un programa de aprendizaje WSD con 2% de warmup, pico de LR de 3e-4 y decaimiento lineal del 15%. Se ejecutaron 61.035 pasos con lotes de 131.072 tokens en precisión bf16, alcanzando una velocidad de ~40.000 tokens por segundo en una GPU H200. El dataset fue decontaminado mediante un filtro a nivel de documento de 13-gramas contra todos los conjuntos de evaluación held-out. Además, se registraron 67 eventos de picos de pérdida que fueron automáticamente saltados o revertidos, con un log en `spike_log.jsonl` pensado como señal de curación para preentrenamiento sintético.

## Capacidades

- Generacion de texto en malayo: produce continuaciones coherentes en multiples registros (enciclopedico, noticias, coloquial, procedimental).
- Modelo base: no esta ajustado para instrucciones, por lo que no soporta dialogos ni seguimiento de ordenes directas.
- Sin soporte de tool calling ni function calling: al ser un modelo base, no dispone de capacidades de invocacion de herramientas.
- Sin capacidades de agente ni razonamiento multi-paso: no implementa planificacion ni ejecucion de tareas complejas.
- Multilingue limitado: el entrenamiento fue casi exclusivamente en malayo; los benchmarks en ingles estan cerca del azar por diseno.
- Sin soporte de vision, audio ni thinking mode: es exclusivamente textual.

## Casos de uso

- Fine-tuning para tareas de NLP en malayo: el modelo puede servir como base para ajustar clasificadores de texto, analisis de sentimiento o extraccion de informacion en dominios legales y periodisticos, gracias a su entrenamiento en esos corpus.
- Generacion de contenido en malayo: permite redactar articulos, resumenes o textos procedimentales en malayo, aprovechando su conocimiento de registros variados.
- Investigacion en lenguas de baja representacion: su arquitectura y pipeline de entrenamiento documentado lo convierten en un objeto de estudio para tecnicas de preentrenamiento eficiente (WSD, decontaminacion, manejo de picos de perdida).
- Continuacion de preentrenamiento: al ser un modelo base, puede extenderse con datos en ingles o dominios adicionales para ampliar su cobertura linguistica.
- Evaluacion de tecnicas de cuantizacion y compresion: al no existir cuantizaciones publicadas, puede usarse para probar metodos de reduccion de precision en arquitecturas personalizadas.
- Extraccion de representaciones: sus embeddings intermedios pueden utilizarse como caracteristicas para modelos de clasificacion o recuperacion en malayo, aunque requiere adaptacion al codigo especifico.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en evaluaciones likelihood-scored para un modelo base:

| Evaluacion | Puntuacion |
|---|---|
| Held-out perplexity (dominios mixtos) | 8.12 |
| PIQA | 0.562 |
| XCOPA-id | 0.510 |
| BELEBELE-ms | 0.260 |
| HellaSwag | 0.204 |

Se indica explicitamente que los benchmarks en ingles estan cerca del azar por diseno, ya que la mezcla de entrenamiento fue exclusivamente en malayo. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 801M parametros en bf16, el modelo ocupa aproximadamente 1,6 GB de memoria; en FP32 serian ~3,2 GB. Con cuantizacion de 4 bits (no publicada) podria reducirse a ~0,4 GB, pero no hay datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) puede ejecutar inferencia en bf16. Para entrenamiento se utilizo una H200, pero no es necesaria para uso inferencial.
- Compatibilidad con GPU de consumo: si, siempre que se disponga del codigo de carga personalizado y se ajuste la precision.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser una arquitectura personalizada, se requiere el repositorio del proyecto (`khursanirevo/smolagent-ms`) para cargar los pesos.
- Latencia y throughput: no disponibles. El entrenamiento alcanzo ~40k tokens/s en H200, pero no hay datos de inferencia.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. No se han encontrado referencias a otros modelos de tamano similar entrenados especificamente para malayo con arquitectura from-scratch. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no es adecuado para uso directo en chatbots o asistentes sin un fine-tuning previo.
- Cobertura linguistica limitada: el entrenamiento fue casi exclusivamente en malayo; el rendimiento en ingles es practicamente aleatorio, lo que impide su uso en tareas multilingues.
- Sesgos de dominio: al entrenarse en actas parlamentarias, leyes y noticias, puede reflejar sesgos propios de esos corpus (lenguaje formal, perspectivas institucionales).
- Licencia "other" no especificada: no se detallan los terminos de uso, lo que genera incertidumbre para aplicaciones comerciales o de redistribucion.
- Arquitectura personalizada: requiere el codigo del repositorio del proyecto para cargar los pesos; no es compatible con las APIs estandar de transformers sin adaptaciones.
- Riesgo de alucinacion: como todo modelo base, puede generar contenido plausible pero incorrecto, especialmente en dominios no representados en el entrenamiento.
- Sin soporte de herramientas ni agentes: no implementa function calling ni capacidades de agente, limitando su integracion en pipelines automatizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/khursanirevo/smolagent-ms-800m-base
- Repositorio del proyecto mencionado en la model card: `khursanirevo/smolagent-ms` (no se proporciona URL directa; se referencia en la documentacion del modelo).
