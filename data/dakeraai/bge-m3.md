# DakeraAI/bge-m3

## Resumen

`DakeraAI/bge-m3` es un espejo verificado por checksum del modelo de embeddings `BAAI/bge-m3`, publicado por Dakera, una empresa que desarrolla un motor de memoria autoalojado para agentes de IA. No se trata de un modelo nuevo ni de un fine-tuning: los ficheros son copias byte a byte del tokenizador original de BAAI y de la versión ONNX cuantizada publicada por Xenova, con el objetivo de servir como fuente primaria de descarga dentro del ecosistema Dakera.

El modelo subyacente, BGE-M3 (BAAI General Embedding M3), es un modelo de embeddings multilingüe diseñado para recuperación de información densa, dispersa y multi-vector, con soporte para documentos largos de hasta 8.192 tokens y alrededor de 100 idiomas. En este repositorio se distribuye exclusivamente en formato ONNX cuantizado, orientado a inferencia en CPU y a despliegues ligeros dentro de pipelines de RAG y memoria de agentes.

Su relevancia es operativa más que algorítmica: garantiza que las instalaciones de Dakera no dependan de una única fuente de descarga, ya que el sistema consulta primero este repositorio y recurre a los originales si no está disponible, validando ambos contra el mismo SHA-256. Para el resto de la comunidad, funciona como un artefacto ONNX listo para usar de un modelo de embeddings consolidado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en la información proporcionada (modelo de embeddings basado en transformer, según el modelo original BAAI/bge-m3) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en este repositorio; el modelo original BGE-M3 soporta documentos largos de hasta 8.192 tokens |
| Tipos de cuantización | ONNX cuantizado (`onnx/model_quantized.onnx`, 569.694.530 bytes) |
| Idiomas soportados | no disponible en la model card de este espejo; la descripción de Dakera indica embeddings para unos 100 idiomas |
| Licencia | MIT |
| Formato de pesos | ONNX (modelo cuantizado) y `tokenizer.json`; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

Este repositorio no documenta arquitectura ni proceso de entrenamiento propios: es un espejo sin modificaciones. El modelo subyacente es BGE-M3 de BAAI, un modelo de embeddings que combina recuperación densa, dispersa (estilo léxico) y multi-vector en una sola representación, lo que permite usarlo tanto para búsqueda semántica como para coincidencia léxica y reranking. La model card de este espejo no incluye detalles sobre volumen de tokens, composición del corpus ni si hubo fases de ajuste con datos supervisados o preferencias.

Los únicos artefactos técnicos verificables son dos ficheros: `tokenizer.json` (17.098.108 bytes, con SHA-256 `21106b6d7dab2952c1d496fb21d5dc9db75c28ed361a05f5020bbba27810dd08`) copiado de `BAAI/bge-m3`, y `onnx/model_quantized.onnx` (569.694.530 bytes, con SHA-256 `0826f8c1ab9edf1801db86c61919d4d108e8bfc0b809ec823ad366882ff0b77d`) copiado de `Xenova/bge-m3`. La innovación relevante aquí es de distribución: verificación criptográfica de los pesos y redundancia de origen para que las instalaciones de Dakera no fallen si un repositorio no está accesible.

## Capacidades

- Generación de embeddings de texto para recuperación semántica (pipeline `feature-extraction`).
- Recuperación multilingüe: la documentación de Dakera indica cobertura de aproximadamente 100 idiomas.
- Manejo de documentos largos: el modelo original BGE-M3 admite entradas de hasta 8.192 tokens, adecuado para fragmentos extensos en RAG.
- Recuperación híbrida en el modelo original: representaciones densas, dispersas y multi-vector, útiles para combinar búsqueda semántica y léxica.
- Integración en motores de memoria de agentes: pensado para memoria a largo plazo, extracción de entidades y decaimiento de importancia dentro de Dakera.
- Inferencia en CPU mediante ONNX cuantizado, sin necesidad de GPU.
- No es un modelo generativo: no produce texto, no hace tool calling ni razonamiento multi-paso por sí mismo; su función es producir vectores.

## Casos de uso

- Memoria a largo plazo para agentes: se usa como codificador de embeddings dentro de Dakera (`DAKERA_MODEL=bge-m3`) para indexar conversaciones y recuperarlas entre sesiones mediante búsqueda vectorial y de texto completo.
- RAG multilingüe autoalojado: indexar una base documental en varios idiomas y recuperar fragmentos relevantes sin depender de APIs externas, aprovechando el formato ONNX para ejecución en CPU.
- Búsqueda semántica en documentación técnica: generar embeddings de manuales y artículos largos (hasta 8.192 tokens en el modelo original) para responder consultas de soporte.
- Deduplicación y clustering de contenido: calcular similitud entre documentos o tickets para agrupar duplicados y detectar temas recurrentes.
- Filtrado y reranking en pipelines de recuperación: usar las representaciones para reordenar candidatos antes de pasarlos a un modelo generativo.
- Despliegue en entornos con recursos limitados: al distribuirse como ONNX cuantizado de unos 570 MB, permite montar un servicio de embeddings en contenedores sin GPU, útil en entornos de desarrollo, CI o edge.
- Integración vía MCP: servir embeddings a agentes como Claude o Cursor a través del servidor MCP de Dakera para dotarles de memoria persistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona una métrica del producto Dakera (88,2 % Recall@20 en el benchmark LoCoMo de memoria a largo plazo), que corresponde al motor de memoria en su conjunto y no a este modelo de embeddings de forma aislada.

## Requisitos de hardware

- VRAM: no aplica en la configuración distribuida aquí; el artefacto es ONNX cuantizado y está pensado para inferencia en CPU.
- Tamaño en disco: aproximadamente 570 MB para el modelo ONNX cuantizado más 17 MB del tokenizador; el repositorio completo ocupa 0,6 GB.
- GPU recomendadas: no disponibles; al ser un modelo de embeddings cuantizado, una GPU consumer es suficiente si se desea acelerar, pero no se documentan requisitos concretos.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con varios GB de VRAM, aunque no se especifican cifras.
- Opciones de despliegue: ONNX Runtime, contenedor Docker de Dakera (`ghcr.io/dakera-ai/dakera:latest`), y los SDKs oficiales (Python, TypeScript, Go, Rust). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DakeraAI/bge-m3 (este repo) | Embeddings, espejo ONNX cuantizado | no disponible (8.192 tokens en el original) | ~100 según Dakera | ONNX | MIT | Hugging Face, Docker de Dakera |
| BAAI/bge-m3 | Embeddings original | 8.192 tokens | ~100 | safetensors y otros | MIT | Hugging Face |
| Xenova/bge-m3 | Embeddings, conversión ONNX | 8.192 tokens (original) | ~100 | ONNX | MIT | Hugging Face, transformers.js |

La comparativa se limita al mismo modelo en distintas distribuciones, ya que la información proporcionada no incluye datos de rendimiento frente a alternativas de otros autores.

## Limitaciones y advertencias

- No es un modelo generativo: no responde preguntas ni genera texto; solo produce embeddings.
- No se documentan sesgos específicos en este repositorio; al ser un espejo, hereda los del modelo original BAAI/bge-m3, que no se detallan aquí.
- Riesgo de alucinación: no aplica directamente al no generar texto, pero los resultados de recuperación pueden ser irrelevantes si los fragmentos indexados son de baja calidad.
- La model card no especifica la lista exacta de idiomas soportados ni métricas de calidad por idioma.
- La cuantización ONNX puede introducir una pérdida de precisión en los embeddings frente a los pesos originales en safetensors; no se cuantifica esa pérdida en la documentación.
- Licencia MIT: permite uso comercial, pero conviene conservar la atribución a BAAI y revisar la licencia del modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- Dependencia del ecosistema Dakera: parte de la documentación y de las instrucciones de uso están orientadas a su motor de memoria y su imagen Docker.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DakeraAI/bge-m3
- Modelo original: https://huggingface.co/BAAI/bge-m3
- Conversión ONNX de referencia: https://huggingface.co/Xenova/bge-m3
- Licencia: https://huggingface.co/DakeraAI/bge-m3/blob/main/LICENSE
- Web de Dakera: https://dakera.ai
- Documentación: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Despliegue autoalojado: https://github.com/Dakera-AI/dakera-deploy
- Servidor MCP: https://github.com/Dakera-AI/dakera-mcp
- SDK Python: https://github.com/Dakera-AI/dakera-py
- SDK TypeScript: https://github.com/Dakera-AI/dakera-js
- SDK Go: https://github.com/Dakera-AI/dakera-go
- SDK Rust: https://github.com/Dakera-AI/dakera-rs
- LinkedIn: https://www.linkedin.com/company/dakera-ai
- Contacto: amine@dakera.ai
