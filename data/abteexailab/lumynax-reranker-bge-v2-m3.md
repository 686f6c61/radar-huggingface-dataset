# AbteeXAILab/lumynax-reranker-bge-v2-m3

## Resumen

LumynaX Reranker BGE v2 M3 es un modelo de reranking publicado por AbteeX AI Labs, un laboratorio con sede en Aotearoa (Nueva Zelanda), dentro de su familia de modelos LumynaX orientados a la soberanía de IA. Se trata de un paquete de integración que envuelve al modelo original `BAAI/bge-reranker-v2-m3` sin modificar sus pesos, añadiendo una capa de orquestación denominada "LumynaX Core" que gestiona el enrutamiento de inferencia, controles de soberanía y optimización. El propio autor lo etiqueta como un "legacy release" y un "artefacto de investigación desactualizado", por lo que no se recomienda su uso en producción.

El modelo base es un cross-encoder basado en la arquitectura XLM-RoBERTa, con 567,7 millones de parámetros, diseñado para tareas de reranking en recuperación de información. El paquete declara soporte para inglés y maorí, y se distribuye bajo licencia MIT. Aunque el pipeline declarado en Hugging Face es `text-generation`, su función real es la de reranker de documentos, no la generación de texto. Este release es relevante únicamente como referencia histórica o para reproducir experimentos de la primera fase del proyecto LumynaX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder transformer basado en XLM-RoBERTa (BGE-reranker-v2-m3) |
| Parametros totales | 567.755.777 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (inglés), mi (maorí) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es `BAAI/bge-reranker-v2-m3`, un cross-encoder de la familia BGE (BAAI General Embedding) que utiliza una arquitectura transformer basada en XLM-RoBERTa. Los cross-encoders procesan pares de consulta-documento de forma conjunta y producen una puntuación de relevancia, a diferencia de los bi-encoders que generan embeddings por separado. El modelo original fue entrenado con datos multilingües y es conocido por su buen rendimiento en tareas de reranking multilingüe.

El paquete LumynaX no altera los pesos del modelo base. Según la model card, la integración se realiza mediante "routed infusion", es decir, LumynaX Core dirige la inferencia a través del modelo sin modificar sus pesos. No se proporcionan detalles sobre el entrenamiento adicional, el número de tokens o el dataset utilizado, ya que este release se limita a empaquetar el modelo original con una capa de identidad y runtime. El autor indica que no hay composición de pesos ni mezcla de expertos en esta versión.

## Capacidades

- Reranking de documentos: dado un par consulta-documento, devuelve una puntuación de relevancia, útil para mejorar los resultados de sistemas de recuperación.
- Soporte multilingüe: declarado para inglés y maorí, aunque el modelo base BGE-reranker-v2-m3 tiene capacidades multilingües más amplias.
- Integración con LumynaX Core: el paquete incluye una capa de orquestación que permite enrutar la inferencia, aplicar controles de soberanía y optimizar el despliegue.
- Compatible con Transformers: se puede cargar con la librería `transformers` de Hugging Face.
- Formato de pesos safetensors: seguro para carga y distribución.

## Casos de uso

- Reproducción de experimentos de investigación: al ser un release legacy, su principal utilidad es verificar los resultados documentados en la primera fase del proyecto LumynaX, permitiendo a otros investigadores replicar el pipeline original.
- Evaluación comparativa de rerankers: puede usarse como punto de referencia para comparar el rendimiento de modelos de reranking más modernos, dado que es esencialmente el modelo BGE-reranker-v2-m3 con una capa adicional.
- Estudio de integración de capas de orquestación: el paquete sirve como ejemplo de cómo se puede envolver un modelo open source con una capa de control de inferencia sin modificar sus pesos, útil para desarrolladores interesados en arquitecturas de "infusión".
- Desarrollo de sistemas de recuperación en entornos con restricciones de soberanía de datos: al ser un modelo local-first y con licencia MIT, puede desplegarse en infraestructuras que requieran control total sobre los datos, aunque no se recomienda para producción por su estado legacy.
- Pruebas de rendimiento en idiomas de baja representación: el soporte declarado para maorí permite explorar el comportamiento del modelo en tareas de recuperación para este idioma, aunque el modelo base no fue específicamente entrenado para ello.
- Formación y educación: puede utilizarse en cursos o talleres sobre sistemas de búsqueda y recuperación de información, mostrando cómo funciona un cross-encoder de reranking y cómo se integra en un pipeline de RAG.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de rendimiento para este paquete específico. Dado que los pesos son idénticos al modelo original `BAAI/bge-reranker-v2-m3`, se puede esperar un rendimiento equivalente al de dicho modelo, pero no se dispone de datos verificados en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: con 567,7 millones de parámetros, en precisión FP16 se necesitan aproximadamente 1,1 GB solo para los pesos, más overhead de activaciones y memoria del runtime. En la práctica, una GPU con 4 GB de VRAM es suficiente para inferencia en lotes pequeños.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, o superiores. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con `transformers` directamente, o mediante frameworks como vLLM, TGI o llama.cpp si se convierte a GGUF (aunque no se proporcionan archivos GGUF en el repo). También es posible usar Ollama si se crea un Modelfile, como se sugiere en el repositorio de GitHub.
- Latencia y throughput: no se dispone de datos medidos. Para un cross-encoder de este tamaño, la latencia típica por par consulta-documento en GPU está en el rango de milisegundos a decenas de milisegundos, dependiendo de la longitud del texto y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LumynaX Reranker BGE v2 M3 (este) | 567,7 M | No disponible | MIT | safetensors | Envoltura de BGE-reranker-v2-m3 con capa LumynaX, legacy |
| BAAI/bge-reranker-v2-m3 | 567,7 M | 8192 (según documentación del modelo original) | MIT | safetensors, PyTorch | Modelo base original, sin capa adicional |
| BAAI/bge-reranker-base | 278 M | 512 | MIT | safetensors | Versión más pequeña y rápida, menor capacidad multilingüe |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | 22,7 M | 512 | Apache 2.0 | PyTorch | Reranker ligero, muy utilizado en pipelines de RAG |

Nota: los datos de contexto y parámetros de los modelos comparados provienen de conocimiento general, no de la información proporcionada en la búsqueda. La comparativa se incluye a efectos orientativos.

## Limitaciones y advertencias

- Estado legacy: el autor declara explícitamente que este release está desactualizado, no se mantiene y no representa las capacidades actuales de AbteeX AI Labs. No debe usarse en producción.
- Riesgo de alucinación: aunque es un reranker y no un generador de texto, el pipeline declarado como `text-generation` puede inducir a error. No se recomienda utilizarlo para generación de contenido.
- Sesgos del modelo base: al ser una copia de BGE-reranker-v2-m3, hereda los posibles sesgos de dicho modelo, especialmente en idiomas o dominios no representados en su entrenamiento.
- Limitaciones de idioma: aunque declara soporte para maorí, el modelo base no fue específicamente entrenado para este idioma, por lo que su rendimiento en maorí puede ser limitado.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero al ser un paquete legacy, no hay garantías de soporte ni mantenimiento.
- Falta de documentación técnica: no se proporcionan detalles sobre el entrenamiento, el contexto máximo ni los procedimientos de cuantización, lo que dificulta su evaluación rigurosa.

## Enlaces

- [Hugging Face - AbteeXAILab/lumynax-reranker-bge-v2-m3](https://huggingface.co/AbteeXAILab/lumynax-reranker-bge-v2-m3)
- [Repositorio GitHub - Aimaghsoodi/lumynax-reranker-bge-v2-m3](https://github.com/Aimaghsoodi/lumynax-reranker-bge-v2-m3/tree/main)
- [Colección LumynaX Retrieval & Embedding Stack](https://huggingface.co/collections/AbteeXAILab/lumynax-retrieval-and-embedding-stack)
- [Modelo original BAAI/bge-reranker-v2-m3](https://huggingface.co/BAAI/bge-reranker-v2-m3)
- [Sitio web de AbteeX AI Labs](https://abteex.com)
- [Sitio web de LumynaX](https://lumynax.com)
- [Contacto](mailto:aimaghsoodi@abteex.com)
