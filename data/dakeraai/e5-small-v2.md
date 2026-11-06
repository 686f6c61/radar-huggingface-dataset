# DakeraAI/e5-small-v2

## Resumen

DakeraAI/e5-small-v2 es un espejo verificado del modelo de embeddings intfloat/e5-small-v2, publicado por Dakera, una empresa que desarrolla un motor de memoria autoalojado para agentes de IA. No se trata de un modelo nuevo ni de un fine-tuning: los ficheros se copian byte a byte desde el repositorio original de intfloat y desde la conversión a ONNX de Xenova, con verificación SHA-256 de cada artefacto. El modelo original lo desarrolla intfloat (Microsoft Research), y todo el mérito técnico corresponde a sus autores.

El modelo es un encoder BERT de tipo transformer con 33.360.512 parámetros (aproximadamente 33 millones), orientado a la extracción de características y a la generación de embeddings de frases en inglés. Su función es convertir texto en vectores densos para búsqueda semántica, recuperación aumentada por generación (RAG) y memorización de largo plazo en agentes. Es relevante en este repositorio concreto porque Dakera lo distribuye como dependencia por defecto de su motor de memoria: la aplicación descarga primero desde este espejo y recurre a los repositorios originales si no está disponible, de modo que la instalación no depende de una única fuente.

La licencia es MIT, igual que la del modelo original, y el repositorio incluye pesos en safetensors, una exportación ONNX completa y una versión ONNX cuantizada, lo que facilita el despliegue tanto en servidores como en entornos ligeros. El modelo está pensado para inglés; la model card no declara otros idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (modelo de embeddings) |
| Parametros totales | 33.360.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo original e5-small-v2 usa 512 tokens) |
| Tipos de cuantizacion | ONNX cuantizado incluido en el repo (`onnx/model_quantized.onnx`, ~34 MB); el modelo original admite cuantizaciones habituales de la familia BERT |
| Idiomas soportados | ingles (la model card lo describe como "compact English embedding model") |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (completo y cuantizado) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo original intfloat/e5-small-v2: un encoder transformer de tipo BERT con 33 millones de parámetros, entrenado para producir embeddings de frases mediante aprendizaje contrastivo. El repositorio de Dakera no aporta información sobre el proceso de entrenamiento, la composición del dataset ni el número de tokens utilizados; esos detalles deben consultarse en la model card original de intfloat. No hay evidencia de RLHF ni de DPO, ya que se trata de un modelo de embeddings y no de generación.

La innovación de este repositorio no está en el modelo, sino en la cadena de suministro: cada fichero se copia literalmente desde su origen (los ONNX desde Xenova/e5-small-v2 y el resto desde intfloat/e5-small-v2) y se publica con su hash SHA-256, de forma que cualquier consumidor puede verificar la integridad. El repositorio incluye además una exportación ONNX lista para inferencia sin PyTorch, lo que reduce el peso del stack en producción.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y similitud entre frases.
- Recuperación densa para pipelines RAG (retrieval-augmented generation).
- Memoria de largo plazo para agentes de IA: indexación y recuperación de recuerdos persistidos entre sesiones.
- Extracción de características (`feature-extraction`) compatible con la pipeline de Hugging Face y con ONNX Runtime.
- Ejecución en CPU y en entornos sin GPU gracias a la variante ONNX cuantizada.
- Integración con el motor Dakera mediante la variable `DAKERA_MODEL=e5-small`.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es exclusivamente un encoder de embeddings.
- Capacidades multilingües: no disponibles; el modelo está orientado a inglés.

## Casos de uso

- Memoria de largo plazo en agentes: Dakera emplea este modelo como embedder por defecto para vectorizar recuerdos que luego recupera mediante búsqueda híbrida (vectorial y texto completo) con reranking y decaimiento por importancia. Es adecuado por su tamaño reducido y su baja latencia en CPU.
- RAG sobre documentación interna: indexar fragmentos de manuales, wikis o tickets y recuperar los más relevantes para el prompt de un LLM. Los 33 millones de parámetros permiten indexar corpus grandes sin coste elevado de cómputo.
- Búsqueda semántica en aplicaciones web: sustituir la búsqueda por palabras clave por similitud vectorial en catálogos, FAQs o bases de conocimiento, con la variante ONNX cuantizada ejecutándose en el navegador o en un servidor modesto.
- Deduplicación y clustering de textos: agrupar tickets de soporte, correos o reseñas por similitud de embeddings para detectar duplicados y patrones.
- Clasificación y enrutamiento ligero: usar los embeddings como entrada de un clasificador simple (regresión logística, k-NN) para enrutar consultas a departamentos o etiquetar contenido.
- Despliegue autoalojado con verificación de integridad: organizaciones que necesitan reproducibilidad y comprobación criptográfica de los artefactos pueden usar este espejo con los hashes publicados, y recurrir al original si el espejo no está accesible.
- Filtrado previo en pipelines de moderación o recomendación: calcular similitud contra conjuntos de referencia sin depender de un LLM generativo, reduciendo coste y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye métricas (MTEB, BEIR u otras); para evaluaciones del modelo original deben consultarse los resultados publicados por intfloat para e5-small-v2.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (33 millones de parámetros, ~133 MB de pesos); unos 34 MB con la variante ONNX cuantizada.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente; no requiere A100 ni H100. Una RTX 4090 o una T4 están sobredimensionadas para este modelo.
- Cabe en cualquier GPU de consumo e incluso en CPU: es viable en portátiles, contenedores pequeños y dispositivos edge.
- Opciones de despliegue: ONNX Runtime (variantes incluidas), Hugging Face Transformers con safetensors, sentence-transformers, y el propio motor Dakera vía Docker (`ghcr.io/dakera-ai/dakera:latest`), que incluye los modelos por defecto sin descarga en el arranque.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo se espera latencia de milisegundos por lote en CPU, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| DakeraAI/e5-small-v2 (espejo) | 33,4 M | no disponible | ingles | MIT | safetensors, ONNX | Espejo verificado del original; mismo comportamiento |
| intfloat/e5-small-v2 | 33,4 M | no disponible | ingles | MIT | safetensors, PyTorch | Modelo original, referencia de calidad |
| intfloat/e5-base-v2 | no disponible | no disponible | ingles | MIT | safetensors, PyTorch | Variante mayor de la misma familia; más calidad, más coste |
| BAAI/bge-small-en-v1.5 | no disponible | no disponible | ingles | MIT | safetensors, ONNX | Alternativa popular para RAG en inglés de tamaño similar |

La comparación se limita a datos estructurales; no se dispone de métricas de rendimiento en la información proporcionada para establecer diferencias cuantitativas entre estos modelos.

## Limitaciones y advertencias

- Es un espejo, no un modelo propio: cualquier corrección, mejora o soporte debe dirigirse a intfloat; Dakera solo garantiza la integridad de los ficheros.
- Modelo exclusivamente en inglés: su uso con textos en castellano u otros idiomas degradará la calidad de los embeddings.
- No es un modelo generativo: no produce texto, no razona y no soporta tool calling; usarlo para esas tareas es un error de categoría.
- Riesgo de sesgos heredados del corpus de entrenamiento original (no documentados en este repositorio).
- Los embeddings pueden producir falsos positivos en recuperación si no se acompaña de reranking o de umbrales de similitud adecuados.
- La licencia MIT permite uso comercial, pero conviene conservar el aviso de copyright original de intfloat al redistribuir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; su adopción es baja y no hay historial de mantenimiento más allá de la creación y actualización del 4 de noviembre de 2026.
- La longitud de contexto no se declara en este repositorio; para textos largos debe verificarse el límite del modelo original (habitualmente 512 tokens en la familia e5-small) antes de diseñar el chunking.

## Enlaces

- Repositorio del espejo: https://huggingface.co/DakeraAI/e5-small-v2
- Modelo original: https://huggingface.co/intfloat/e5-small-v2
- Conversión ONNX de referencia: https://huggingface.co/Xenova/e5-small-v2
- Licencia en el repositorio: https://huggingface.co/DakeraAI/e5-small-v2/blob/main/LICENSE
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
