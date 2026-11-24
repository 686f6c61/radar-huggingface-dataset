# diogocarapito/text-to-icpc2

## Resumen

text-to-icpc2 v1 es un modelo de recuperación semántica (retriever) especializado en codificación clínica: convierte un problema o diagnóstico escrito en texto libre por un médico de familia, en portugués europeo o en inglés, en un código ICPC-2 (Clasificación Internacional de Atención Primaria), concretamente los 686 códigos de síntoma (componente 1) y diagnóstico (componente 7). Lo desarrolla diogocarapito y se publica bajo licencia Apache-2.0 con pesos en safetensors y formato sentence-transformers.

Técnicamente no es un modelo generativo, sino un sistema de dos piezas: un encoder de frases afinado a partir de `intfloat/multilingual-e5-base` (278 millones de parámetros, arquitectura XLM-RoBERTa) y un índice kNN construido sobre las descripciones de los códigos y todos los ejemplos etiquetados, con agregación por código. El modelo se entrenó con 62.149 filas del dataset `diogocarapito/text-to-icpc2`.

Su relevancia radica en que sustituye una tarea de clasificación cerrada y costosa de mantener por una recuperación sobre índice: el feedback confirmado por el clínico puede añadirse al índice sin reentrenar. Frente al modelo v1 de 2024 (basado en BERT portugués), que obtenía un top-1 de 0,346 en `gold_test`, esta versión alcanza 0,922 en el mismo conjunto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa) afinado como sentence embedding, con índice kNN externo |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; admite cuantización estándar de sentence-transformers, no documentada por el autor) |
| Idiomas soportados | portugués (pt) e inglés (en) |
| Licencia | Apache-2.0 (pesos y código); las rúbricas ICPC-2 son propiedad de WONCA y la traducción portuguesa de ACSS, reproducidas solo para uso de investigación y no comercial |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder bi-direccional de la familia XLM-RoBERTa, inicializado desde `intfloat/multilingual-e5-base` y afinado con la librería sentence-transformers para producir embeddings de frases comparables por similitud coseno. La predicción no se hace con una cabeza de clasificación: se construye un índice kNN sobre los embeddings de las descripciones de los 686 códigos ICPC-2 y de todos los ejemplos etiquetados, y las vecinas recuperadas se agregan por código para producir un ranking con puntuación.

El entrenamiento usa 62.149 filas del dataset `diogocarapito/text-to-icpc2`. La model card no detalla la composición exacta del dataset, el número de tokens vistos ni si hubo fases de RLHF o DPO; al tratarse de un modelo de similitud, la optimización es por pares o tripletas, no por preferencias. La innovación operativa es la posibilidad de incorporar feedback confirmado al índice sin reentrenar los pesos, lo que reduce el coste de mantenimiento en un dominio donde los códigos y las formulaciones clínicas cambian.

## Capacidades

- Mapeo de texto clínico libre a códigos ICPC-2 de síntoma (componente 1) y diagnóstico (componente 7).
- Recuperación top-k con puntuaciones de similitud por código, agregadas a partir de las vecinas del índice.
- Funcionamiento bilingüe portugués europeo e inglés en el mismo espacio de embeddings.
- Actualización del índice con ejemplos confirmados sin reentrenamiento.
- No genera texto, no razona de forma multi-paso y no soporta tool calling ni function calling.
- No tiene modo thinking, visión ni audio.
- No cubre códigos de proceso (rango -30 a -69).

## Casos de uso

- Codificación asistida en historia clínica electrónica de atención primaria: el médico escribe "HTA não controlada" en la lista de problemas y el sistema devuelve los tres códigos ICPC-2 más probables con su puntuación, que el clínico confirma o corrige.
- Normalización retrospectiva de listas de problemas: se procesan en lote los textos libres históricos de una consulta para mapearlos a ICPC-2 y habilitar explotación estadística o auditoría.
- Investigación en atención primaria: convertir registros narrativos en códigos comparables entre centros y países que usan ICPC-2, con la ventaja de que el índice se puede ampliar con ejemplos locales.
- Sistemas de ayuda a la codificación en inglés y portugués: al compartir espacio de embeddings, un mismo despliegue sirve a documentación clínica redactada en cualquiera de los dos idiomas.
- Aprendizaje de la clasificación ICPC-2 para residentes: la demo pública permite comprobar en tiempo real qué código asigna el sistema a una formulación concreta.
- Enriquecimiento de pipelines de datos sanitarios: usar la salida top-k como característica adicional en modelos posteriores de agrupación de motivos de consulta.
- Búsqueda semántica sobre catálogos de códigos: recuperar descripciones ICPC-2 afines a una consulta en lenguaje natural sin conocer la terminología exacta.

## Benchmarks y rendimiento

| split | n | top-1 | top-3 | top-5 | macro-F1 | PT top-1 | EN top-1 |
|---|---|---|---|---|---|---|---|
| gold_dev | 142 | 0,930 | 0,965 | 0,965 | 0,869 | 0,912 | 1,000 |
| gold_test | 460 | 0,922 | 0,980 | 0,985 | 0,879 | 0,925 | 0,907 |
| val | 3568 | 0,861 | 0,961 | 0,972 | 0,844 | 0,862 | 0,860 |

Referencia comparativa del autor: el modelo v1 de 2024 (`text-to-icpc2-bert-base-portuguese-cased`) obtiene 0,346 de top-1 en el mismo `gold_test` (PT 0,417, EN 0,035). `gold_dev` y `gold_test` son entradas redactadas por Claude y verificadas, recodificadas o descartadas por un médico de familia; `val` es una partición por hash de la distribución de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,1 GB en fp32 para los 278 millones de parámetros, y aproximadamente 0,6 GB en fp16; el índice kNN añade memoria adicional según el número de vectores almacenados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 4090, A100 o H100 queda muy sobredimensionada para este modelo.
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1650, RTX 3060 o superiores, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (el modelo está marcado como compatible con endpoints), y el paquete propio `icpc2[infer]` instalado desde el repositorio de GitHub.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| text-to-icpc2 v1 | 278 M | no disponible | Texto clínico a código ICPC-2 | Apache-2.0 (rúbricas ICPC-2 con restricciones de WONCA) | Hugging Face y demo en text-to-icpc2.com |
| text-to-icpc2-bert-base-portuguese-cased (v1 2024) | no disponible | no disponible | Texto clínico a código ICPC-2 | no disponible | Hugging Face |
| intfloat/multilingual-e5-base (modelo base) | 278 M | no disponible | Embeddings multilingües genéricos | MIT | Hugging Face |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, salvo el top-1 de 0,346 del v1 de 2024 en `gold_test`.

## Limitaciones y advertencias

- Es software de investigación y no un dispositivo médico: toda sugerencia debe ser revisada por un clínico.
- El conjunto gold fue redactado por la misma familia de modelos que generó los datos sintéticos de entrenamiento, por lo que las métricas son probablemente optimistas.
- La verificación del gold la realizó un único evaluador, sin acuerdo inter-anotador.
- Las entradas que mencionan varios problemas a la vez ("HTA e DM2") reciben un solo código.
- Los códigos de proceso (-30 a -69) quedan fuera del alcance del modelo.
- Solo cubre portugués e inglés; no hay soporte documentado para otras lenguas.
- Las rúbricas ICPC-2 están protegidas por derechos de WONCA y la traducción portuguesa por ACSS, con permiso solo para investigación y uso no comercial; hay que consultar los términos de WONCA antes de cualquier uso comercial.
- Riesgo de alucinación de código: al ser un retriever, siempre devuelve los vecinos más próximos del índice, aunque ninguno sea pertinente, sin mecanismo de abstención documentado.
- Sesgos conocidos: no documentados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diogocarapito/text-to-icpc2
- Dataset de entrenamiento: https://huggingface.co/datasets/diogocarapito/text-to-icpc2
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Modelo v1 de 2024: https://huggingface.co/diogocarapito/text-to-icpc2-bert-base-portuguese-cased
- Código, pipeline de datos y cuaderno de experimentos: https://github.com/diogocarapito/text-to-icpc2 (commit `ab6069d`)
- Demo pública: https://text-to-icpc2.com
