# meihant/AnonymousModel-mht

## Resumen

AnonymousModel-mht es una colección de checkpoints de investigación publicada por el usuario meihant en HuggingFace. No se trata de un modelo entrenado para uso final, sino de un artefacto experimental: 20 checkpoints de frontera de presupuesto (budget-boundary) procedentes de dos ejecuciones de preentrenamiento emparejadas de un modelo de texto Qwen3.5-4B inicializado aleatoriamente, entrenadas sobre aproximadamente 20B tokens de cuerpo. Cada familia contiene diez checkpoints espaciados aproximadamente cada 2B tokens, desde 2B hasta 20B.

Las dos familias corresponden a dos regímenes de preentrenamiento distintos: Keen-qwen4b-20b, con preentrenamiento condicionado por listas factuales, y Vanilla-qwen4b-20b, con preentrenamiento de texto ordinario. El propósito es permitir estudios comparativos del efecto de la condición de entrenamiento sobre las curvas de aprendizaje a lo largo del presupuesto de cómputo.

Son modelos base, no ajustados por instrucciones ni por SFT de preguntas y respuestas, con un contexto de entrenamiento de 4.096 tokens. Su relevancia es metodológica: ofrece puntos de control intermedios alineados para investigar dinámicas de escalado, olvido catastrófico o transferencia de formato, aunque su utilidad práctica directa es limitada al no estar alineados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`), modelo de texto |
| Parametros totales | 4B (Qwen3.5-4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), compatible con Transformers 5.6.2 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de la familia Qwen3.5 con 4B parámetros, inicializado aleatoriamente y preentrenado desde cero (no es un fine-tuning de un Qwen3.5-4B preexistente). El entrenamiento se realizó sobre aproximadamente 20B tokens de cuerpo con un contexto de 4.096 tokens. Se publican dos ejecuciones emparejadas: una con preentrenamiento condicionado por listas factuales (Keen) y otra con texto ordinario (Vanilla), lo que permite aislar el efecto del formato de datos.

Cada familia incluye diez checkpoints espaciados aproximadamente cada 2B tokens (2B, 4B, ..., 20B). Los checkpoints finales adicionales a ~20,156B tokens se excluyen intencionadamente de la release. No se distribuyen estados del optimizador, del scheduler ni logs de entrenamiento. Los pesos y el vocabulario del tokenizer son idénticos a los de los checkpoints de entrenamiento; la configuración habilita el caché de inferencia. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto base (continuación de texto), sin alineación por instrucciones.
- Razonamiento y conocimiento factual limitados al preentrenamiento; no hay evidencia publicada de rendimiento en tareas concretas.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (`en`).
- Sin modo thinking, visión ni audio.
- Utilidad principal como objeto de estudio: checkpoints intermedios para analizar curvas de aprendizaje y efectos del condicionamiento por listas factuales.

## Casos de uso

- Investigación en dinámicas de escalado: comparar la evolución de la pérdida y de capacidades entre los checkpoints de 2B a 20B tokens para trazar curvas de aprendizaje con puntos alineados.
- Estudio del efecto del formato de datos: contrastar Keen (listas factuales) frente a Vanilla (texto ordinario) para medir transferencia de formato y retención de conocimiento factual.
- Análisis de olvido catastrófico: evaluar cómo se degradan o consolidan capacidades a lo largo del preentrenamiento usando checkpoints intermedios.
- Reproducibilidad metodológica: servir de referencia para replicar experimentos de preentrenamiento a escala de 4B parámetros y 20B tokens.
- Evaluación de técnicas de alineación posterior: usar los checkpoints base como punto de partida controlado para experimentos de SFT o DPO.
- Docencia y formación: ilustrar en cursos de aprendizaje automático cómo evoluciona un modelo durante el preentrenamiento con artefactos reales y verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB de pesos más overhead de activaciones y caché KV; en la práctica, 10-12 GB para contexto de 4.096 tokens.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegues por lotes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia individual.
- Cabe en GPU de consumo: sí, en tarjetas con 12-16 GB o más en BF16; con cuantización a 8 bits o 4 bits cabría en GPUs de 8 GB, aunque no se publican pesos cuantizados.
- Opciones de despliegue: Transformers 5.6.2 (requisito explícito del autor); vLLM, TGI, llama.cpp u Ollama no están documentados ni verificados para esta release.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AnonymousModel-mht | 4B | 4.096 | no disponible | HuggingFace (colección de 20 checkpoints) | Base, sin alinear, solo inglés |
| Qwen3.5-4B (modelo de referencia) | 4B | no disponible | no disponible | no disponible | Arquitectura de partida; el autor no publica comparación |
| Alternativas de 4B base | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Modelos base sin SFT ni alineación: no siguen instrucciones y pueden generar contenido incoherente o inapropiado.
- Riesgo elevado de alucinación factual, especialmente en la familia Vanilla.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- Solo inglés; sin soporte multilingüe documentado.
- Licencia no disponible: no se puede asumir uso comercial sin confirmación del autor.
- Repositorio de 429,2 GB: la descarga completa es costosa; conviene seleccionar un `subfolder` concreto.
- Requiere Transformers 5.6.2; versiones anteriores podrían no cargar la configuración.
- Sin estados del optimizador ni logs: no es posible reanudar el entrenamiento tal cual.
- Publicado por un autor individual con 0 descargas y 1 like: sin validación comunitaria ni benchmarks independientes.

## Enlaces

- HuggingFace: https://huggingface.co/meihant/AnonymousModel-mht
- Familia Keen: https://huggingface.co/meihant/AnonymousModel-mht/tree/main/Keen-qwen4b-20b
- Familia Vanilla: https://huggingface.co/meihant/AnonymousModel-mht/tree/main/Vanilla-qwen4b-20b
- Índice de checkpoints: `checkpoints.json` (en la raíz del repositorio)
- Manifiesto de hashes: `manifest.json` (en la raíz del repositorio)
