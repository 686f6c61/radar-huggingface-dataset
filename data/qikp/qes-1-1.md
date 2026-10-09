# qikp/qes-1.1

## Resumen

QES 1.1 (qikp's Educational Scorer) es un clasificador de texto de tipo regresion disfrazado de tarea de `text-classification`, disenado para puntuar la calidad educativa de fragmentos de texto web. Lo desarrolla el usuario qikp y su proposito es identico al del `HuggingFaceFW/fineweb-edu-classifier`: asignar una puntuacion de calidad educativa a un documento, con la diferencia de que QES 1.1 escala las etiquetas al rango 0-1, lo que permite un etiquetado mas fino aguas abajo.

El modelo es un fine-tuning del checkpoint `huawei-noah/TinyBERT_General_4L_312D`, un transformer tipo BERT de 4 capas y dimension oculta 312, con 14.350.561 parametros totales (unos 0,01 B). Su ventana de contexto es de 512 tokens y el repositorio ocupa apenas 0,1 GB, lo que lo situa en la categoria de modelos ultra ligeros pensados para filtrado a gran escala, no para generacion.

Es relevante ahora como alternativa ligera y de licencia CC0-1.0 en pipelines de curacion de datos para entrenamiento de LLM, donde se necesita puntuar millones de documentos con coste computacional minimo. El propio autor indica que Mozilla Firefox emplea un modelo afinado sobre la misma base para autorrelleno de formularios, lo que respalda la fiabilidad arquitectonica de partida, aunque el rendimiento concreto de QES 1.1 no esta validado externamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder, TinyBERT_General_4L_312D) |
| Parametros totales | 14.350.561 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dataset de entrenamiento en ingles) |
| Licencia | CC0-1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

QES 1.1 parte de `huawei-noah/TinyBERT_General_4L_312D`, una destilacion de BERT con 4 capas de encoder y dimension oculta 312, sobre la que se anade una cabeza de clasificacion para producir un unico logit escalar. Aunque la `pipeline_tag` declarada es `text-classification`, el uso indicado en la model card es extraer el logit crudo (`.logits.item()`) y tratarlo como una puntuacion continua en el rango 0-1; para obtener una escala 1-5 basta multiplicar ese logit por 5 y usarlo como reemplazo directo de otros clasificadores educativos.

El entrenamiento se realizo sobre el primer shard parquet del dataset `HuggingFaceFW/fineweb-edu-llama3-annotations`, con un `padding data collator`. Se ejecuto en una unica GPU T4 de Google, en modo hibrido FP32/FP16 (la arquitectura Turing no soporta bfloat16), con el tamano de lote y la tasa de aprendizaje por defecto y durante tan solo 2 epocas. No se documentan fases de RLHF ni DPO, ni innovaciones como decodificacion especulativa o atencion lineal; es un fine-tuning supervisado convencional sobre un subconjunto de los datos del clasificador de referencia.

## Capacidades

- Puntuacion de calidad educativa de texto: produce un logit escalar en el rango 0-1 que refleja el valor educativo estimado del fragmento.
- Compatibilidad como reemplazo directo: multiplicando el logit por 5 se obtiene una escala 1-5 equivalente a la de otros clasificadores educativos.
- Clasificacion de fragmentos de hasta 512 tokens, con truncado controlado mediante `truncation=True` y `max_length=model.config.max_position_embeddings`.
- Integracion con el ecosistema Transformers como `pipeline("text-classification", model="qikp/qes-1.1")`.
- Inferencia en CPU y GPU de gama baja por su tamano reducido.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo generativo.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue: no documentada.

## Casos de uso

- Curacion de datasets para preentrenamiento de LLM: filtrar corpus web ya preprocesados aplicando un umbral sobre la puntuacion 0-1 para retener solo documentos con alta densidad educativa, gracias al bajo coste por documento del modelo.
- Post-filtrado de pipelines de datos tipo FineWeb: usar QES 1.1 como segunda etapa sobre datos ya filtrados por heuristica, tal y como recomienda el propio autor.
- Deduplicacion semantica asistida por calidad: priorizar que variantes de un documento se conservan en funcion de su puntuacion educativa.
- Etiquetado de grandes volumenes en investigacion sobre calidad de datos: al escalar las salidas a 0-1 se pueden aplicar umbrales mas finos que con escalas enteras.
- Clasificacion de contenido en CPUs o GPUs antiguas: al pesar menos de 100 MB en FP32 cabe en entornos con recursos muy limitados, incluidas T4 o incluso inferencia en CPU.
- Filtrado de dominios especificos para RAG: descartar paginas de bajo valor educativo antes de indexarlas en una base vectorial.
- Prototipado rapido de clasificadores binarios de calidad: convertir el logit en etiqueta binaria (util / no util) mediante un umbral calibrado localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor indica, como unica referencia de rendimiento, que durante pruebas internas limitadas el modelo se desvia hasta aproximadamente 0,75 puntos respecto al dataset final de FineWeb-Edu. Esa cifra no es un benchmark formal y el propio autor advierte que la exactitud no esta garantizada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 57 MB en FP32, unos 29 MB en FP16 y unos 14 MB en int8 para los pesos, mas el overhead de activaciones (minimo).
- GPU recomendadas: cualquier GPU moderna es sobrada; fue entrenado en una unica T4 de Google y la inferencia funciona igualmente bien en T4, L4, A100 o H100 sin aprovechar su capacidad.
- Consumer GPU: cabe sin problema en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090), incluso en iGPU y en CPU.
- Opciones de despliegue: Transformers (referencia), pipeline de Hugging Face, y en general cualquier runtime compatible con safetensors y arquitectura BERT; vLLM, llama.cpp, Ollama o TGI no estan documentados para este modelo concreto en la informacion disponible.
- Latencia y throughput: no disponibles de forma medida; por tamano se espera un throughput muy alto en lote, apto para procesar millones de documentos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qikp/qes-1.1 | 14,35 M | 512 | Puntuacion educativa 0-1 | CC0-1.0 | HuggingFace |
| HuggingFaceFW/fineweb-edu-classifier | no disponible | no disponible | Puntuacion educativa (referencia) | no disponible | HuggingFace |
| huawei-noah/TinyBERT_General_4L_312D | ~14,5 M | 512 | Modelo base preentrenado/destilado | no disponible | HuggingFace |

QES 1.1 se define explicitamente como equivalente funcional al `fineweb-edu-classifier` pero entrenado sobre un subconjunto de sus datos y con salida reescalada a 0-1. No se dispone de comparativas cuantitativas de rendimiento entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- Desviacion de hasta aproximadamente 0,75 puntos respecto al dataset final de FineWeb-Edu en pruebas internas limitadas; la exactitud no esta garantizada.
- Uso recomendado solo en circunstancias restringidas o con volumenes de datos muy elevados, segun el propio autor.
- Disenado como paso adicional de post-filtrado sobre datos ya filtrados; aplicado a scrapes web sin filtrar es probable que no detecte spam ni contenido de baja calidad.
- Riesgo de alucinacion no aplicable como tal (no es generativo), pero si de calibracion incorrecta del umbral en dominios alejados del dataset de entrenamiento.
- Idiomas soportados no documentados; el dataset de entrenamiento (anotaciones FineWeb-Edu) esta orientado a contenido en ingles, por lo que el comportamiento en castellano u otros idiomas no esta validado.
- Sin datos publicados de sesgos; no hay evaluacion de equidad ni de representatividad.
- Entrenamiento muy corto (2 epocas) con hiperparametros por defecto, lo que limita el ajuste fino del modelo.
- Licencia CC0-1.0: permite uso comercial y modificacion sin practicamente restricciones, pero al derivar de TinyBERT conviene verificar la licencia del modelo base.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qikp/qes-1.1
- Discusiones: https://huggingface.co/qikp/qes/discussions
- Perfil del autor: https://huggingface.co/qikp/models
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu-llama3-annotations
- Modelo base: https://huggingface.co/huawei-noah/TinyBERT_General_4L_312D
- Clasificador de referencia: https://huggingface.co/HuggingFaceFW/fineweb-edu-classifier
- Ficha en free2aitools: https://free2aitools.com/model/qikp/qes
- Endpoint en FriendliAI: https://friendli.ai/models/qikp/kite-8.1-11m-base
