# luluw/bge-m3-eng-nep-16k-trimmed

## Resumen

Este modelo es una versión recortada del vocabulario de BGE-M3, desarrollada por el usuario luluw, que reduce el vocabulario original de 250 002 tokens (más de 100 idiomas) a 16 384 tokens centrados exclusivamente en inglés y nepalí. El objetivo es reducir el tamaño del modelo y acelerar la inferencia en estos dos idiomas, manteniendo la calidad de los embeddings originales sin necesidad de reentrenamiento. Se basa en la arquitectura XLM-RoBERTa del modelo BGE-M3 de BAAI, con 328,5 millones de parámetros y una longitud de contexto de 8192 tokens.

La relevancia de este modelo radica en que permite desplegar un sistema de embeddings multilingüe de alta calidad en entornos con recursos limitados, especialmente para aplicaciones que trabajan con nepalí e inglés, un idioma con poca representación en modelos de embeddings comerciales. Al no haber sido fine-tuneado, conserva las representaciones originales de los tokens que se mantienen, lo que lo hace utilizable directamente, aunque con la limitación de que los tokens fuera del vocabulario recortado se mapean a `<unk>`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformers) |
| Parametros totales | 328 529 920 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32) |
| Idiomas soportados | ingles, nepali |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es BGE-M3, un embedding model multilingüe que soporta tres funcionalidades de recuperación: densa, sparse (lexical) y multi-vector (ColBERT). Esta versión recortada conserva únicamente el backbone denso y la tabla de embeddings, descartando las cabezas sparse y ColBERT. La arquitectura es un transformer encoder de tipo XLM-RoBERTa con 1024 dimensiones de salida.

El proceso de creación consistió en contar la frecuencia de tokens en textos reales en inglés y nepalí del dataset `lbourdois/fineweb-2-trimming`, mantener siempre los tokens especiales y los primeros 1000 IDs originales, y rellenar el presupuesto restante con los tokens más frecuentes de ambos idiomas ponderados al 50/50. La matriz de embeddings se reconstruyó copiando las filas originales para cada token conservado, sin ningún fine-tuning posterior. Se proporciona un mapeo `old_id → new_id` para poder seguir usando el tokenizador XLM-R original.

## Capacidades

- Generacion de embeddings de texto densos de 1024 dimensiones, normalizados con norma L2.
- Recuperacion semantica en ingles y nepali, con soporte para contextos de hasta 8192 tokens.
- Adecuado para busqueda semantica, similitud de documentos y tareas de clasificacion basadas en embeddings.
- No soporta recuperacion sparse ni multi-vector (ColBERT) al haberse eliminado esas cabezas.
- No incluye capacidades de generacion de texto, tool calling ni agentes; es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en documentos nepales: permite indexar y recuperar articulos, informes o actas en nepali con consultas en ingles o nepali, aprovechando la ventana de 8192 tokens para documentos largos.
- Sistemas de recuperacion aumentada por generacion (RAG) para asistentes en idioma nepali: se puede integrar como componente de embeddings en un pipeline RAG para responder preguntas sobre contenido local.
- Clasificacion de textos bilingues: al generar embeddings de frases o parrafos, se pueden entrenar clasificadores ligeros (regresion logistica, SVM) sobre los vectores para tareas como analisis de sentimiento o categorizacion de noticias.
- Deduplicacion de contenido: comparar embeddings de articulos o publicaciones en ingles y nepali para detectar duplicados o contenido similar en plataformas editoriales.
- Filtrado y moderacion de contenido: usar los embeddings para identificar temas o categorias en comentarios o publicaciones en redes sociales en ambos idiomas.
- Motores de recomendacion basados en similitud: calcular la similitud coseno entre embeddings de items (productos, articulos, videos) para sugerir contenido relacionado en aplicaciones bilingues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base BGE-M3 reporta buenos resultados en tareas como MIRACL y MTEB, pero esta version recortada no ha sido evaluada formalmente, por lo que no se pueden ofrecer cifras comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en fp32 (328M parametros), lo que cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, etc.).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; para procesamiento por lotes grande se recomienda 4-8 GB.
- Compatible con CPU: la inferencia es viable en CPU para cargas moderadas, aunque mas lenta.
- Opciones de despliegue: transformers (PyTorch), sentence-transformers, y compatible con text-embeddings-inference (TEI) segun las etiquetas del repositorio.
- Latencia y throughput: no disponibles; dependen del hardware y del tamaño del lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Funcionalidades | Licencia |
|---|---|---|---|---|---|
| luluw/bge-m3-eng-nep-16k-trimmed | 328M | 8192 | ingles, nepali | solo denso | MIT |
| BAAI/bge-m3 (original) | 568M | 8192 | 100+ | denso, sparse, ColBERT | MIT |
| luluw/bilingual-e5-large-nep-16k-trimmed | ~560M (estimado) | 512 (E5) | ingles, nepali | solo denso | MIT |

La comparativa se basa en datos publicos de los repositorios. El modelo recortado reduce significativamente el tamaño frente al BGE-M3 original (328M vs 568M) a costa de perder las funcionalidades sparse y ColBERT, y de limitar el vocabulario a dos idiomas. Frente a la version E5 recortada del mismo autor, BGE-M3 ofrece una ventana de contexto mucho mayor (8192 vs 512), lo que lo hace mas adecuado para documentos largos.

## Limitaciones y advertencias

- El vocabulario recortado a 16 384 tokens puede provocar que terminos tecnicos o poco frecuentes en ingles o nepali se mapeen a `<unk>`, degradando la calidad de los embeddings para dominios especializados.
- No se ha realizado fine-tuning posterior al recorte, por lo que la distribucion de los embeddings puede no estar optimizada para el nuevo vocabulario; un ajuste fino breve podria mejorar la calidad.
- Se han eliminado las cabezas sparse y ColBERT del modelo original, por lo que no se pueden utilizar las funcionalidades de recuperacion multi-vector ni sparse.
- El modelo solo cubre ingles y nepali; no es adecuado para otros idiomas.
- Aunque la licencia es MIT y permite uso comercial, el modelo deriva de BGE-M3 (tambien MIT), por lo que no hay restricciones adicionales conocidas.
- No se han publicado evaluaciones de sesgos o alucinaciones; al ser un modelo de embeddings, el riesgo de alucinacion no aplica directamente, pero los embeddings pueden reflejar sesgos presentes en los datos de entrenamiento originales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/luluw/bge-m3-eng-nep-16k-trimmed
- Modelo base BGE-M3: https://huggingface.co/BAAI/bge-m3
- Paper de BGE-M3 (arXiv:2402.03216): https://arxiv.org/abs/2402.03216
- Documentacion oficial de BGE-M3: https://bge-model.com/bge/bge_m3.html
- Repositorio GitHub de BGE-M3: https://github.com/davidwwzhu/BGE-M3
- Modelo similar del mismo autor (E5 recortado): https://huggingface.co/luluw/bilingual-e5-large-nep-16k-trimmed
