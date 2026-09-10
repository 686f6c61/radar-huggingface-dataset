# croqaz/Piston-and-Prose-lg

## Resumen

Piston-and-Prose-lg es un modelo de lenguaje de pequeño tamaño desarrollado por el usuario independiente croqaz a partir de un proyecto personal. Se trata de un modelo base con arquitectura Llama de 141 millones de parámetros y una ventana de contexto de 1024 tokens, entrenado durante 116 horas en una única GPU de gama media. El objetivo del autor era crear un modelo de texto con un estilo vintage y mecánico, capaz de generar prosa y poesía con un tono particular.

El modelo se entrenó durante una época completa sobre un total de 40.300 millones de tokens, combinando varios datasets publicados por el propio autor. Es el hermano mayor de Piston-and-Prose-sm, que tiene la mitad de tamaño. No está alineado para chat ni para seguir instrucciones: su propósito es la generación de texto libre en inglés, y el autor advierte que no hay que esperar resultados espectaculares, aunque asegura que es mejor que su predecesor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only) |
| Parametros totales | 141M (0.14B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

Piston-and-Prose-lg utiliza una arquitectura transformer decoder-only basada en el diseño Llama. Con 141 millones de parámetros, es un modelo deliberadamente pequeño, pensado para ejecutarse en hardware modesto. El autor no indica innovaciones técnicas destacables; no se menciona decodificacion especulativa, atencion lineal ni tecnicas de entrenamiento como RLHF o DPO. Es un modelo base, sin etapa de alineacion conversacional.

El entrenamiento se realizo durante 616.055 pasos, con un total de 40.300 millones de tokens, lo que equivale a una epoca completa. Los datos provienen de tres datasets del propio autor: Sprocket-n-Say, Synthetic-archive y tiny-vintage-completions, ampliados con libros procesados de Authorama.com, Archive.org y Gutenberg. El autor indica que, comparado con el dataset anterior, este combina una coleccion mayor de filas y tokens, y relaja los filtros de calidad para incluir mas contenido. Asimismo, el tokenizer es supuestamente mejor que el del modelo Sprocket-and-Say, del que Piston-and-Prose-lg es sucesor.

## Capacidades

- Generacion de texto libre en ingles, especialmente con estilo vintage, literario o mecanico, dado que el entrenamiento se centro en corpus de archivo y sinteticos.
- Es un modelo base, por lo que no esta diseñado para seguir instrucciones, dialogar ni razonar de forma estructurada.
- No soporta tool calling ni function calling, ya que no se menciona ninguna habilidad de este tipo en la informacion disponible.
- No tiene capacidades de agentes ni multi-step reasoning.
- Soporte multilingue limitado: el modelo esta etiquetado como exclusivamente en ingles (en).
- No dispone de vision, audio ni un modo "thinking". Se limita a completar texto.
- Al ser un modelo pequeño, puede ajustarse con fine-tuning para tareas especificas, lo que constituye un caso de uso frecuente en investigacion con modelos de este tamano.

## Casos de uso

- Generacion de prosa creativa con estilo vintage: el modelo puede completar parrafos o poemas con un tono mecanico o de epoca, gracias a su entrenamiento en corpus de Gutenberg y Archive.org. Es util para experimentos de escritura generativa o para producir textos cortos con estetica steampunk.
- Investigacion en modelos pequeños: sirve como referencia para estudiar el rendimiento de arquitecturas Llama con apenas 141M de parametros. Puede desplegarse facilmente en entornos academicos sin apenas presupuesto de computo.
- Educacion en NLP: permite explicar los fundamentos de los transformers y el proceso de preentrenamiento con un modelo lo bastante pequeño como para inspeccionar sus pesos y entrenarlo en una GPU consumer.
- Fine-tuning en tareas de texto especificas: al ser un modelo base pequeño, se puede ajustar con un dataset propio para clasificacion, extraccion de entidades o generacion de texto en un dominio concreto, siempre que la tarea no requiera una ventana de contexto mayor de 1024 tokens.
- Prototipado de pipelines de generacion: puede integrarse en aplicaciones sencillas de autocompletado o sugerencia de texto, donde el bajo coste de inferencia es una ventaja y no se necesita razonamiento complejo.
- Evaluacion de datasets sinteticos: el autor ya lo utilizo para comparar el efecto de combinar datos sinteticos con corpus vintage; otros investigadores pueden reproducir estos experimentos usando los mismos datasets publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que las evaluaciones que ejecuto muestran que este modelo es mejor en general que su predecesor, Sprocket-and-Say, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni ninguna otra referencia estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.3 GB para los pesos en FP16 y 0.6 GB en FP32. Incluyendo activaciones, cabe con comodidad en menos de 1 GB de VRAM.
- GPU recomendada: cualquier GPU consumer con al menos 2 GB de VRAM, como una GTX 1650, RTX 3050 o integradas modernas. No requiere hardware de servidor.
- Cabe en GPU consumer: si, e incluso puede ejecutarse en CPU con una latencia razonable para un modelo de este tamano.
- Opciones de despliegue: compatible con el endpoint de Transformers de HuggingFace, tambien puede usarse con vLLM, llama.cpp, Ollama o TGI. Al ser pequeno, se integra facilmente en entornos con pocos recursos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Piston-and-Prose-lg | 141M | 1024 tokens | Apache 2.0 | HuggingFace |
| Piston-and-Prose-sm | No disponible | No disponible | Apache 2.0 (presumible) | HuggingFace |
| Sprocket-and-Say | No disponible (el autor indica que es la mitad de Piston-and-Prose-lg) | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria. Las unicas alternativas conocidas son los modelos hermanos mencionados por el autor, pero sin datos tecnicos completos.

## Limitaciones y advertencias

- Sesgos conocidos: no se han evaluado formalmente. Al estar entrenado con corpus antiguos y textos de archivo, es probable que refleje estereotipos, opiniones y sesgos historicos presentes en esas fuentes.
- Riesgo de alucinacion: elevado. Al ser un modelo base sin alineacion, puede generar texto fluido pero factualmente incorrecto, especialmente cuando se pide completar contenido con apariencia de referencia.
- Limitaciones de contexto: la ventana de 1024 tokens es muy corta para aplicaciones que requieran razonamiento largo o documentos extensos.
- Limitaciones de idioma: el modelo solo soporta ingles. La generacion en otros idiomas es probablemente incorrecta o incoherente.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantias de seguridad ni mitigacion de sesgos. Cualquier aplicacion en produccion debe realizar una evaluacion exhaustiva por su cuenta.
- Caveat para produccion: el autor es un particular y lo presenta como un "hobby model". No hay documentacion de seguridad, ni procedimientos de alineacion, ni pruebas de robustez. No se recomienda para sistemas criticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/croqaz/Piston-and-Prose-lg
- Dataset Sprocket-n-Say: https://huggingface.co/datasets/croqaz/Sprocket-n-Say
- Dataset Synthetic-archive: https://huggingface.co/datasets/croqaz/Synthetic-archive
- Dataset tiny-vintage-completions: https://huggingface.co/datasets/croqaz/tiny-vintage-completions
- Modelo hermano en HuggingFace: https://huggingface.co/croqaz/Piston-and-Prose-sm
