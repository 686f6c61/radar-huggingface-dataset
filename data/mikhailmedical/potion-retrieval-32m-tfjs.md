# mikhailmedical/potion-retrieval-32M-tfjs

## Resumen

`potion-retrieval-32M-tfjs` es un re-export en formato ONNX del modelo de embeddings estáticos `minishlab/potion-retrieval-32M`, adaptado específicamente para ser consumido desde la librería Transformers.js en entornos JavaScript (navegador o Node.js). El modelo original, desarrollado por MinishLab, es un finetune de `potion-base-32M` optimizado para tareas de recuperación de información (retrieval). Utiliza embeddings estáticos, lo que permite calcular representaciones de texto de forma mucho más rápida que los modelos transformer tradicionales, tanto en CPU como en GPU.

Este re-export resuelve un problema concreto: el export ONNX oficial del modelo original utiliza una interfaz plana (`input_ids` unidimensional + `offsets`) que Transformers.js no puede alimentar. El autor, `mikhailmedical`, reconstruye la misma tabla de embeddings (`embedding_bag.weight`, de dimensiones 63091×512 en fp32) dentro de una interfaz estándar de encoder (`input_ids` y `attention_mask` con forma `[batch, seq]`), produciendo `last_hidden_state` con mean pooling. Los embeddings resultantes son numéricamente idénticos a los del modelo original, verificados con `StaticModel.from_pretrained`.

La relevancia actual radica en que permite desplegar un modelo de retrieval de alto rendimiento y muy ligero (32M de parámetros) en aplicaciones web, extensiones de navegador o herramientas de productividad, sin necesidad de infraestructura de servidor dedicada. El modelo hereda la licencia MIT del upstream.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Static embeddings (model2vec) - tabla de embeddings con mean pooling |
| Parametros totales | 32 millones (inferido del nombre y de la tabla de embeddings 63091×512) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp32 (export ONNX) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | ONNX (compatible con Transformers.js) |

## Arquitectura y entrenamiento

El modelo base `potion-retrieval-32M` es un modelo de embeddings estáticos generado con la técnica Model2Vec. En lugar de una red transformer completa, consiste en una tabla de embeddings de 63091×512 (vocabulario × dimensión) y una operación de mean pooling sobre los tokens de entrada. Esta arquitectura permite obtener representaciones de texto con una complejidad computacional mínima, órdenes de magnitud inferior a la de un transformer equivalente.

El entrenamiento del modelo original es un finetune de `potion-base-32M`, realizado con una versión modificada del enfoque descrito en el blogpost de Model2Vec (no se dispone de más detalles sobre el procedimiento exacto). El finetune está orientado específicamente a tareas de retrieval, mejorando la calidad de las representaciones para búsqueda semántica y similitud entre textos. El re-export `tfjs` no modifica los pesos, solo envuelve la tabla de embeddings en una interfaz de encoder estándar y elimina el post-procesador de tokens especiales del tokenizer, para que el pooling coincida con el comportamiento nativo de Model2Vec.

## Capacidades

- Generación de embeddings de texto de alta calidad para tareas de retrieval y similitud semántica.
- Búsqueda semántica: dado un texto de consulta, recupera documentos relevantes mediante similitud coseno.
- Clasificación de textos: los embeddings pueden alimentar clasificadores lineales o redes simples.
- Agrupamiento (clustering) de documentos por similitud temática.
- Deduplicación de contenidos: identifica textos duplicados o casi duplicados.
- Recuperación de información en aplicaciones web o de escritorio con baja latencia.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües no confirmadas (no se especifican idiomas en la documentación).

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar manuales, guías o FAQs y permitir consultas en lenguaje natural. El modelo es adecuado por su velocidad y bajo coste computacional, ideal para entornos con recursos limitados.
- Sistema de recomendación de artículos o noticias: calcular la similitud entre el historial de lectura del usuario y un catálogo de contenidos, usando embeddings precalculados.
- Deduplicación de bases de datos de texto: detectar entradas duplicadas o casi duplicadas en CRM, tickets de soporte o listas de productos, comparando embeddings con un umbral de similitud.
- Clasificación de correos electrónicos o mensajes: convertir textos en embeddings y entrenar un clasificador ligero (por ejemplo, regresión logística) para categorizar por asunto o prioridad.
- Motor de búsqueda interno para aplicaciones de productividad: integrar en herramientas como Obsidian o Notion para encontrar notas relacionadas, gracias a la compatibilidad con Transformers.js y su ejecución en el navegador.
- Moderación de contenido en foros o redes sociales: agrupar mensajes por tema o detectar contenido duplicado o spam, usando embeddings estáticos que se calculan rápidamente en CPU.
- Recuperación de pasajes en sistemas de pregunta-respuesta: combinar con un modelo generativo para seleccionar fragmentos relevantes de un corpus antes de generar la respuesta.

## Benchmarks y rendimiento

Según la información disponible, `potion-retrieval-32M` alcanza un 81,69 % del rendimiento de `all-MiniLM-L6-v2` en tareas de retrieval, con una puntuación de retrieval de 35,06, siendo además órdenes de magnitud más rápido. No se han publicado resultados detallados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información proporcionada.

| Modelo | Puntuación de retrieval | Rendimiento relativo | Velocidad |
|---|---|---|---|
| potion-retrieval-32M | 35,06 | 81,69 % de all-MiniLM-L6-v2 | Órdenes de magnitud más rápido |
| all-MiniLM-L6-v2 | No disponible | 100 % (referencia) | Más lento (transformer) |

## Requisitos de hardware

- VRAM estimada: el modelo tiene 32M de parámetros en fp32, lo que ocupa aproximadamente 128 MB. En fp16 serían ~64 MB. Cabe en cualquier GPU con más de 1 GB de VRAM, y también en CPU sin problema.
- GPU recomendadas: no requiere GPU específica; funciona bien en CPU, GPU integrada o GPUs de gama baja (por ejemplo, GTX 1050, RTX 3050). Para despliegue en servidor, cualquier GPU moderna es suficiente.
- Compatibilidad con hardware de consumo: sí, es ideal para dispositivos edge, navegadores y portátiles.
- Opciones de despliegue: Transformers.js (navegador o Node.js), ONNX Runtime, o cualquier runtime que soporte ONNX. También se puede usar con la librería Model2Vec original en Python.
- Latencia y throughput: no se proporcionan datos exactos, pero al ser embeddings estáticos, la inferencia es una simple operación de lookup y pooling, con latencia en el orden de microsegundos por texto en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento retrieval | Licencia | Formato |
|---|---|---|---|---|---|---|
| potion-retrieval-32M (este) | Estático (Model2Vec) | 32M | No aplica | 35,06 (81,69 % de MiniLM) | MIT | ONNX |
| all-MiniLM-L6-v2 | Transformer | 22M | 256 tokens | Referencia (100 %) | Apache 2.0 | ONNX, safetensors |
| potion-base-32M | Estático (Model2Vec) | 32M | No aplica | No disponible | MIT | safetensors, ONNX |

Nota: `all-MiniLM-L6-v2` es un modelo transformer que captura contexto, mientras que los modelos estáticos no. La comparativa se basa en los datos disponibles; no se dispone de más alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Al ser embeddings estáticos, el modelo no captura el contexto de la frase ni maneja polisemia (una misma palabra tiene un único vector independientemente del contexto).
- El vocabulario es fijo (63091 tokens); las palabras fuera de vocabulario se representan con un token desconocido, lo que puede degradar la calidad en dominios muy especializados.
- No se especifican los idiomas soportados; es probable que el modelo esté entrenado principalmente en inglés, pero no está confirmado.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos web, puede heredar sesgos presentes en el corpus de entrenamiento.
- El re-export `tfjs` está pensado para uso con Transformers.js; si se usa fuera de ese ecosistema, la interfaz puede no ser estándar.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia del modelo base y de los datos de entrenamiento (no se dispone de esa información).
- No se han publicado resultados de benchmarks exhaustivos; el único dato disponible es la puntuación de retrieval mencionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mikhailmedical/potion-retrieval-32M-tfjs
- Modelo original: https://huggingface.co/minishlab/potion-retrieval-32M
- Repositorio de Model2Vec: https://github.com/MinishLab/model2vec
- Página del modelo en Toolify (referencia): https://www.toolify.ai/ai-model/minishlab-potion-retrieval-32m
