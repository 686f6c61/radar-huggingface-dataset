# clouddevaakash/vedu-scribe-0.8b-gguf

## Resumen

Vedu Scribe 0.8B es un modelo de lenguaje especializado en la limpieza de transcripciones de voz a texto (dictado). No es un asistente conversacional: actúa como normalizador, eliminando muletillas, falsos comienzos y autocorrecciones, y aplicando puntuación, mayúsculas y formato numérico al texto transcrito. Está desarrollado por HeyVedu y se distribuye bajo licencia Apache-2.0.

El repositorio analizado es una conversión a GGUF (cuantización Q8_0) del checkpoint original `heyvedu/vedu-scribe-0.8b`, que a su vez es un fine-tune de `Qwen/Qwen3.5-0.8B`. La conversión la publica el usuario `clouddevaakash` con el objetivo de ejecutar el modelo mediante llama.cpp en CPU dentro de la aplicación Murmur para Windows. El modelo tiene 0.8 mil millones de parámetros y está orientado exclusivamente al idioma inglés.

La relevancia de esta ficha radica en que documenta un caso de uso muy concreto (post-procesado de STT en local) y en que la conversión GGUF es un trabajo modificado: el checkpoint original solo se publicó como cuantización mixta 4/8 bits en MLX, y esta versión se obtuvo desquantizando, revirtiendo transformaciones de mlx-lm y re-cuantizando a Q8_0. Es, por tanto, un artefacto derivado con posibles diferencias numéricas respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), con capas de atención recurrente (recurrent_layers) |
| Parametros totales | 0.8 mil millones (aproximado, según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; límite operativo de 400 tokens de entrada y 512 de generación según la model card |
| Tipos de cuantizacion | Q8_0 (GGUF); el original es MLX mixed 4/8-bit con group size 64 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`vedu-scribe-0.8b-Q8_0.gguf`, 811.843.296 bytes); el original en safetensors/MLX |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-0.8B, un transformer decoder-only con atención recurrente en determinadas capas (el header GGUF original declara `qwen35.attention.recurrent_layers` y `qwen35.nextn_predict_layers`). El checkpoint original de Vedu Scribe es un fine-tune de ese modelo base, pero la model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifica la innovación de entrenamiento concreta más allá del ajuste para la tarea de limpieza de dictado.

La conversión documentada en este repositorio es relevante técnicamente: se partió de una cuantización MLX mixta 4/8 bits, se desquantizó a bfloat16 con `mlx_lm` 0.32.2, se revirtieron las transformaciones de carga de mlx-lm (nombres de tensores de Hugging Face, peso `conv1d` depthwise a `[C, 1, K]`, pesos RMSNorm de `1 + w` a `w`), y se convirtió a GGUF con `convert_hf_to_gguf.py` de llama.cpp (commit `c7fc509`) usando `--outtype q8_0`. Además, se editó el header para declarar 24 capas en lugar de 25, eliminar la capa de predicción multi-token (`nextn_predict_layers` de 1 a 0) y ajustar `recurrent_layers`, ya que el checkpoint no contiene dicha capa. Como consecuencia de la re-cuantización, las salidas pueden diferir ligeramente de las del modelo MLX original.

## Capacidades

- Limpieza de transcripciones de voz a texto: eliminación de muletillas, falsos comienzos y autocorrecciones.
- Aplicación de puntuación, mayúsculas y normalización de números sobre el texto dictado.
- Procesamiento de indicaciones de estilo mediante cabeceras como `[tone: formal]` o `[vocab: Priya Raman; Kubernetes]` (hasta 12 términos separados por `; `).
- Generación de texto condicionada a un prompt fijo con bloque de pensamiento vacío (thinking desactivado).
- No soporta tool calling ni function calling según la información disponible.
- No soporta agentes ni razonamiento multi-paso; es un normalizador, no un asistente.
- Capacidad multilingüe limitada al inglés.
- No dispone de visión ni audio de forma nativa; el audio se transcribe externamente antes de la limpieza.

## Casos de uso

- Post-procesado de dictado en aplicaciones de escritorio: integrado en Murmur, el modelo recibe la transcripción cruda de un motor STT y devuelve texto limpio antes de pegarlo en el editor, con una guarda estricta a nivel de palabra que rechaza salidas que añadan o eliminen palabras.
- Limpieza de notas de reuniones: a partir de transcripciones automáticas, el modelo elimina repeticiones y aplica puntuación para generar actas legibles sin intervención manual.
- Normalización de vocabulario técnico: mediante la cabecera `[vocab: ...]`, se le indican nombres propios, productos o términos de dominio (por ejemplo, Kubernetes) para que los preserve correctamente en la salida.
- Adaptación de tono en comunicaciones: con `[tone: formal]`, el texto dictado se reformatea con un registro más formal, útil para correos o documentación interna.
- Transcripción de entrevistas y notas de campo: el modelo convierte un flujo oral con titubeos en texto estructurado y con puntuación, adecuado para investigación cualitativa o periodismo.
- Ejecución local en Windows sin GPU: al estar en GGUF Q8_0 y ejecutarse con llama.cpp en CPU, permite limpiar dictados en equipos sin acelerador hardware, manteniendo los datos en el dispositivo.
- Preprocesado en pipelines de accesibilidad: para usuarios que dependen de dictado por voz, el modelo mejora la legibilidad del texto generado antes de su publicación o envío.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q8_0 ocupa 811.843.296 bytes (aproximadamente 0,81 GB); la inferencia en CPU no requiere VRAM dedicada, y en GPU cabría en tarjetas con al menos 1-2 GB de memoria libre, aunque no se han publicado requisitos oficiales.
- GPU recomendadas: no disponible; el caso de uso documentado es CPU mediante llama.cpp en Windows.
- Compatibilidad con GPU de consumo: por tamaño, sería viable en cualquier GPU de consumo moderna (por ejemplo, RTX 3060 o superior), pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: llama.cpp (caso documentado), y por formato GGUF potencialmente Ollama u otros runners compatibles, aunque no se mencionan explícitamente.
- Latencia y throughput: no disponible; la model card solo fija límites de 400 tokens de entrada y 512 de generación con decodificación greedy (temperatura 0).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vedu Scribe 0.8B (GGUF Q8_0) | 0.8B (aprox.) | no disponible (límite operativo 400/512 tokens) | Apache-2.0 | GGUF | Especializado en limpieza de dictado, solo inglés |
| Qwen3.5-0.8B | 0.8B (aprox.) | no disponible | Apache-2.0 (según modelo base) | safetensors | Modelo base generalista; no especializado en limpieza |
| heyvedu/vedu-scribe-0.8b (original) | 0.8B (aprox.) | no disponible | Apache-2.0 | MLX mixed 4/8-bit | Checkpoint original del que deriva esta conversión |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un normalizador, no un asistente: si el texto contiene una pregunta o instrucción, la limpiará y devolverá, pero no la responderá.
- Solo admite inglés; no se ha validado para otros idiomas.
- La conversión GGUF es un trabajo modificado: se desquantizó desde MLX, se revirtieron transformaciones de mlx-lm y se re-cuantizó a Q8_0, por lo que las salidas pueden diferir ligeramente del modelo original.
- El header GGUF fue editado manualmente para declarar 24 capas y eliminar la capa de predicción multi-token; los builds antiguos de llama.cpp podrían rechazar headers que declaren dicha capa.
- Riesgo de alucinación inherente a los modelos de lenguaje, aunque la guarda a nivel de palabra de Murmur rechaza salidas que añadan o eliminen palabras.
- Límite operativo de 400 tokens de entrada y 512 de generación, lo que restringe transcripciones largas a fragmentos.
- La licencia Apache-2.0 permite uso comercial, pero el autor declara no estar afiliado a HeyVedu ni al equipo de Qwen.
- No se han publicado datos de sesgos, evaluación de robustez ni benchmarks; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/clouddevaakash/vedu-scribe-0.8b-gguf
- Modelo original: https://huggingface.co/heyvedu/vedu-scribe-0.8b (revisión `7dced5841c58d7d6e0118c4c123f222b35057871`)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio Murmur: https://github.com/theaakashb/Murmur
- Script de conversión: `module-one/cleanup/convert_gguf.py` en el repositorio Murmur
- Script de parcheo del header: `windows/bench/cleanup/patch_gguf_layers.py` en el repositorio Murmur
