# DakeraAI/bge-small-en-v1.5

## Resumen

`DakeraAI/bge-small-en-v1.5` es un espejo verificado del modelo de embeddings `BAAI/bge-small-en-v1.5`, publicado por Dakera, una empresa que comercializa un motor de memoria autoalojado para agentes de IA. No se trata de un modelo nuevo ni de un fine-tuning: es una copia byte a byte de los ficheros originales de BAAI, con sumas de verificación SHA-256 documentadas para cada artefacto. El objetivo es que la infraestructura de Dakera pueda descargar el modelo desde un origen controlado y redundante, con caída al repositorio original si el espejo no está disponible.

El modelo subyacente es un encoder BERT pequeño (33,36 millones de parámetros) especializado en extracción de características y generación de embeddings densos para recuperación semántica en inglés. Su relevancia práctica radica en el tamaño reducido y la disponibilidad de pesos en safetensors y ONNX (incluida una versión cuantizada de aproximadamente 34 MB), lo que permite ejecutarlo en CPU y en hardware modesto dentro de pipelines RAG o de memoria de agentes.

Dado que el repositorio es un espejo, las capacidades, el entrenamiento y el rendimiento son los del modelo original de BAAI, no los de Dakera. Cualquier evaluación técnica debe remitirse a la model card de `BAAI/bge-small-en-v1.5`; este repositorio solo añade valor en términos de distribución, verificación de integridad e integración con el stack de Dakera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), modelo base `BAAI/bge-small-en-v1.5` |
| Parametros totales | 33.360.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo original BGE-small-en-v1.5 usa 512 tokens) |
| Tipos de cuantizacion | ONNX cuantizado (`onnx/model_quantized.onnx`, ~34 MB); pesos safetensors en el formato original |
| Idiomas soportados | ingles (el modelo original es `en`); no se declaran otros idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), ONNX (`onnx/model.onnx`), ONNX cuantizado (`onnx/model_quantized.onnx`) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo original de BAAI: un encoder BERT de tipo "small" con 33,36 millones de parámetros, orientado a `feature-extraction` y pensado para producir embeddings de frases y pasajes. El repositorio de Dakera no modifica ni reentrena los pesos; los ficheros `config.json`, `model.safetensors` y `tokenizer.json` se copian literalmente de `BAAI/bge-small-en-v1.5`, y los artefactos ONNX proceden de `Xenova/bge-small-en-v1.5`. Cada fichero incluye su hash SHA-256 en la model card, lo que permite verificar la integridad de la descarga.

No se dispone en la información proporcionada de detalles sobre el corpus de entrenamiento, el número de tokens, el uso de RLHF/DPO ni innovaciones técnicas específicas del modelo original. La model card del espejo remite explícitamente a la model card de BAAI para esos datos. La única aportación técnica del repositorio es la distribución verificada y la inclusión de una variante ONNX cuantizada lista para inferencia en CPU.

## Capacidades

- Generación de embeddings densos para frases, pasajes y documentos en inglés, aptos para búsqueda semántica y recuperación.
- Extracción de características (`pipeline_tag: feature-extraction`) para sistemas RAG.
- Indexación vectorial para motores de memoria a largo plazo de agentes, uso principal declarado por Dakera.
- Ejecución en CPU mediante ONNX, incluida la variante cuantizada.
- Integración con el motor Dakera (`DAKERA_MODEL=bge-small`) y con su servidor MCP para agentes como Claude o Cursor.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni visión: es exclusivamente un modelo de embeddings.
- Capacidad multilingüe: no disponible; el modelo original está etiquetado como inglés.

## Casos de uso

- Memoria a largo plazo de agentes: Dakera usa este modelo como encoder por defecto en configuraciones de hardware modesto (`DAKERA_MODEL=bge-small`), generando embeddings que se almacenan junto a recuperación híbrida vectorial y de texto completo. Es adecuado por su bajo coste computacional y su tamaño reducido.
- Búsqueda semántica en documentación interna: indexar fragmentos de manuales y recuperar los más relevantes para una consulta en inglés mediante similitud de coseno sobre los embeddings producidos.
- Pipelines RAG autoalojados: desplegar el modelo en ONNX sobre CPU dentro de un contenedor, sin dependencia de APIs externas, para generar embeddings de chunks antes de la generación con un LLM separado.
- Deduplicación y agrupamiento de textos: calcular embeddings de tickets, correos o artículos y agrupar por similitud para detectar duplicados o categorizar contenido.
- Clasificación ligera por similitud: usar los embeddings como entrada de clasificadores lineales o para few-shot por vecinos más cercanos en tareas de etiquetado de texto en inglés.
- Despliegue en el stack Dakera: arrancar la imagen Docker de Dakera con los modelos incluidos y sin descarga en el inicio, usando este repositorio como origen principal y el de BAAI como respaldo verificado por SHA-256.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye métricas (MTEB, retrieval, etc.) y remite a la model card original de `BAAI/bge-small-en-v1.5` para cualquier evaluación de rendimiento.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; en GPU, los pesos safetensors ocupan aproximadamente 133 MB (unos 0,13 GB), por lo que caben en cualquier GPU con más de 1 GB de memoria.
- Variante ONNX cuantizada: ~34 MB, ejecutable en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es sobradamente suficiente, aunque el modelo está pensado para CPU.
- Cabe en GPU consumer: sí, con margen amplio, en cualquier modelo con al menos 1 GB de VRAM.
- Opciones de despliegue: ONNX Runtime (formatos `onnx/model.onnx` y `onnx/model_quantized.onnx`), integración nativa en Dakera (Docker, Kubernetes, Helm), y carga de safetensors mediante librerías compatibles con BERT.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `DakeraAI/bge-small-en-v1.5` (espejo) | 33,36 M | no disponible (original: 512) | ingles | MIT | safetensors, ONNX | Copia verificada del original de BAAI |
| `BAAI/bge-small-en-v1.5` (original) | 33,36 M | 512 | ingles | MIT | safetensors | Fuente canónica; benchmarks en su model card |
| `Xenova/bge-small-en-v1.5` | 33,36 M | 512 | ingles | MIT | ONNX | Origen de los artefactos ONNX del espejo |
| `BAAI/bge-base-en-v1.5` | no disponible en la informacion | 512 | ingles | MIT | safetensors | Variante mayor de la misma familia; mayor coste computacional |

La comparación con modelos de otras familias (por ejemplo, `all-MiniLM-L6-v2` o `e5-small`) no se incluye porque no hay datos de rendimiento en la información proporcionada que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Es un espejo, no un modelo propio: no debe citarse a Dakera como autora del modelo; el crédito corresponde a BAAI.
- Solo inglés: no está pensado para recuperación multilingüe; el rendimiento en castellano no está garantizado ni documentado.
- No genera texto: no puede usarse como LLM, para tool calling ni para razonamiento; únicamente produce embeddings.
- Longitud de contexto limitada (512 tokens en el modelo original): los documentos largos deben trocearse antes de la indexación.
- Riesgo de alucinación: no aplica directamente al ser un encoder, pero los sistemas RAG que lo usan pueden recuperar pasajes irrelevantes si el chunking o la consulta son deficientes.
- Sesgos: no se documentan en la información disponible; al ser un modelo entrenado por BAAI sobre corpus en inglés, hereda los sesgos de dicho corpus.
- Licencia MIT: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la atribución correspondiente.
- Dependencia de la disponibilidad del repositorio de Dakera: si el espejo cae, el sistema debe recurrir al repositorio original, tal como describe la model card.
- Verificar siempre los hashes SHA-256 publicados antes de desplegar en producción.

## Enlaces

- Repositorio del espejo: https://huggingface.co/DakeraAI/bge-small-en-v1.5
- Modelo original: https://huggingface.co/BAAI/bge-small-en-v1.5
- Repositorio ONNX de origen: https://huggingface.co/Xenova/bge-small-en-v1.5
- Licencia del espejo: https://huggingface.co/DakeraAI/bge-small-en-v1.5/blob/main/LICENSE
- Web de Dakera: https://dakera.ai
- Documentación de Dakera: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Despliegue autoalojado: https://github.com/Dakera-AI/dakera-deploy
- Servidor MCP: https://github.com/Dakera-AI/dakera-mcp
- SDK Python: https://github.com/Dakera-AI/dakera-py
- SDK TypeScript: https://github.com/Dakera-AI/dakera-js
- SDK Go: https://github.com/Dakera-AI/dakera-go
- SDK Rust: https://github.com/Dakera-AI/dakera-rs
- LinkedIn: https://www.linkedin.com/company/dakera-ai
