# kokuren/doku-ero-chiwawa-japanese

## Resumen

`kokuren/doku-ero-chiwawa-japanese` es un clasificador de texto en japonés para contenido de redes sociales, desarrollado por el usuario kokuren. Se construye sobre el encoder `izumi-lab/deberta-v2-small-japanese` y añade una cabeza de clasificación con dos salidas binarias independientes, activadas por sigmoide: `doku` (contenido hostil o tóxico) y `ero` (contenido sexualmente explícito). El modelo tiene 17.867.522 parámetros y una longitud máxima de 192 tokens, por lo que está pensado para mensajes y publicaciones cortas, no para documentos largos.

Su principal interés técnico está en el método de etiquetado: en lugar de fijar un umbral sobre la puntuación continua de un modelo profesor (denominado Jev en la model card), los objetivos binarios se derivan de las distribuciones posteriores almacenadas de 0 a 4, considerando positiva una clase cuando el profesor asigna al menos 0,50 de masa posterior a las clases 2-4. Para `doku` se agregan las categorías `insult`, `threat`, `identity_attack` e `indirect_hostility`; para `ero` solo se usa `sexual_explicit`, excluyendo deliberadamente `obscene` porque también recoge vulgaridad no sexual.

Es relevante porque cubre dos ejes de moderación que suelen mezclarse en un único score, manteniéndolos separados, y porque publica una versión ONNX FP32 pensada para inferencia en navegador con un coste computacional muy bajo. El autor advierte explícitamente de que las salidas son estimaciones aprendidas de etiquetas binarias de un profesor, no probabilidades universales de daño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v2 small con cabeza de clasificación de 2 logits y activación sigmoide |
| Parametros totales | 17.867.522 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 192 tokens (max_length de truncado indicado en la model card) |
| Tipos de cuantizacion | FP32 en safetensors y ONNX. Se probó una variante INT8 dinámica experimental que se descartó por degradación sustancial de precisión (informe `fp32_vs_int8_binary.json`) |
| Idiomas soportados | japonés (ja) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y ONNX (`onnx/model.onnx`, FP32) |

Otros detalles: orden de salida `0 = doku`, `1 = ero`. El repositorio incluye además `doku_chiwawa_binary_meta.json` y una carpeta `reports/` con análisis de etiquetas del profesor, recuentos de etiquetas binarias, pesos positivos (`pos_weight.json`), métricas sin umbral, umbrales de decisión y la comparación FP32 frente a INT8.

## Arquitectura y entrenamiento

La base es DeBERTa-v2 small en su variante japonesa de izumi-lab, un encoder transformer con atención desacoplada. Sobre él se monta una cabeza de clasificación que emite dos logits, evaluados de forma independiente con sigmoide: se trata, por tanto, de una tarea multi-etiqueta de dos clasificaciones binarias, no de un softmax mutuamente excluyente. Esto permite que un mismo texto se marque simultáneamente como tóxico y como sexualmente explícito, algo habitual en insultos de carácter sexual.

El entrenamiento no parte de anotación humana directa, sino de etiquetas derivadas de un profesor (Jev) que produce distribuciones posteriores sobre una escala de 0 a 4 para varias categorías. La definición de `doku` es positiva cuando el profesor asigna al menos 0,50 de masa posterior a las clases 2-4 en cualquiera de `insult`, `threat`, `identity_attack` o `indirect_hostility`; la de `ero` cuando esa masa recae en `sexual_explicit`. El autor subraya que los objetivos binarios se derivaron de las posteriores almacenadas y no de un simple umbral sobre la puntuación esperada continua, lo que preserva mejor la incertidumbre del profesor. No se documenta en la información disponible el volumen de tokens de entrenamiento, la composición exacta del corpus ni el uso de RLHF o DPO; sí consta el uso de `pos_weight` para compensar el desequilibrio de clases.

Los umbrales de decisión se seleccionaron sobre el split de validación maximizando MCC y usando F1 como criterio de desempate: 0,560 para `doku` y 0,599 para `ero`. La model card aclara que son umbrales sobre la salida del modelo, no umbrales del profesor.

## Capacidades

- Clasificación multi-etiqueta de texto japonés en dos ejes independientes: hostilidad/toxicidad (`doku`) y contenido sexual explícito (`ero`).
- Salida de probabilidades calibradas mediante sigmoide, con umbrales recomendados ya ajustados (0,560 y 0,599).
- Procesamiento de textos de hasta 192 tokens, adecuado para publicaciones, comentarios y mensajes cortos de redes sociales.
- Inferencia en navegador mediante el modelo ONNX FP32 que el propio autor publica como versión recomendada.
- Compatibilidad declarada con el ecosistema transformers y con los tags `text-embeddings-inference` y `endpoints_compatible`.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión: es exclusivamente un clasificador de secuencias.
- No soporta tool calling ni function calling, ni está orientado a flujos de agentes o razonamiento multi-paso.
- No es multilingüe: está entrenado y destinado únicamente al japonés.

## Casos de uso

- Moderación de comentarios en plataformas japonesas: el modelo permite separar en dos colas distintas las infracciones por hostilidad y las de contenido sexual, lo que simplifica la aplicación de políticas diferenciadas y evita que un insulto no sexual reciba el tratamiento de contenido para adultos.
- Prefiltrado de colas de revisión humana: con AUROC en torno a 0,91 en ambas cabezas, sirve como primera pasada de triaje sobre el volumen total de mensajes, dejando a los revisores únicamente los casos con score cercano al umbral.
- Filtrado en el cliente con ONNX en navegador: al publicarse un modelo FP32 ONNX de unos 72 MB, es viable ejecutar la clasificación en el propio dispositivo antes de enviar el contenido, reduciendo coste de servidor y latencia percibida.
- Etiquetado por lotes de corpus de investigación: encoders de 17,9 millones de parámetros procesan grandes volúmenes en GPU de forma económica, útiles para estudios sobre prevalencia de toxicidad o contenido sexual en comunidades concretas.
- Enrutado de contenido a colas especializadas: un servicio de soporte o una red social puede usar `ero` para derivar casos a equipos de política de contenido adulto y `doku` para equipos de abuso, optimizando la asignación de revisores.
- Protección de menores en comunidades de usuario: como señal adicional (nunca única) para impedir la exposición de cuentas infantiles a contenido sexualmente explícito, con revisión humana obligatoria dado el AUPRC relativamente bajo de la cabeza `ero`.
- Monitorización de tendencias comunitarias: agregando scores a lo largo del tiempo se pueden detectar picos de hostilidad en foros o canales concretos y activar intervenciones de comunidad.
- Investigación sobre sesgos y moderación: al conocer el origen de las etiquetas (un profesor concreto), el modelo es útil para estudiar cómo las definiciones operativas de toxicidad heredadas de un anotador automático afectan a las decisiones de moderación.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de test (métricas sin umbral):

| Cabeza | AUPRC | AUROC | Umbral de decisión |
|---|---:|---:|---:|
| doku | 0.5673 | 0.9215 | 0.560 |
| ero | 0.4408 | 0.9071 | 0.599 |
| Media | 0.5040 | 0.9143 | no aplica |

No se han publicado resultados de benchmarks estandarizados (MMLU, GLUE, JGLUE u otros) en la información disponible. Tampoco se detallan en la model card los valores absolutos del informe `fp32_vs_int8_binary.json`, solo la conclusión cualitativa de que el INT8 dinámico degradaba sustancialmente la precisión.

## Requisitos de hardware

- Pesos en FP32: 17.867.522 parámetros equivalen a aproximadamente 71,5 MB, coherente con el tamaño de repositorio de 0,1 GB.
- VRAM estimada: por debajo de 1 GB en cualquier configuración razonable; en la práctica la inferencia cabe en unos pocos cientos de megabytes, ya que el cuello de botella suele ser el lote (batch) y no el modelo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria sirve, incluidas GTX 1650, RTX 3050 o superiores. Modelos como RTX 4090, A100 o H100 están enormemente sobredimensionados para este tamaño y solo se justifican para procesar lotes muy grandes de forma masiva.
- Cabe holgadamente en GPU de consumo, e incluso la inferencia en CPU es perfectamente viable dado el reducido número de parámetros y la longitud máxima de 192 tokens.
- Opciones de despliegue: transformers con PyTorch, ONNX Runtime (incluida la ejecución en navegador con el ONNX FP32 publicado), Text Embeddings Inference y Inference Endpoints según los tags del repositorio. vLLM u otros servidores de alto rendimiento son posibles al tratarse de un modelo de clasificación de secuencia, aunque el autor no documenta esta vía.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| doku-ero-chiwawa-japanese | 17,87 M | 192 tokens | Clasificación multi-etiqueta ja (toxicidad + contenido sexual) | Apache-2.0 | AUROC 0,9215 (doku) y 0,9071 (ero); AUPRC 0,5673 y 0,4408 |
| izumi-lab/deberta-v2-small-japanese | no disponible | no disponible | Modelo base encoder en japonés | no disponible | no disponible en la información consultada |
| Alternativas de clasificación de toxicidad en japonés | no disponible | no disponible | Clasificación de toxicidad | no disponible | no disponible en la información consultada |

Nota: el modelo se apoya en el mismo encoder que su base, por lo que la comparación relevante sería frente a otros clasificadores japoneses de toxicidad y contenido sexual, para los que no se han aportado cifras.

## Limitaciones y advertencias

- Las salidas son estimaciones aprendidas de etiquetas binarias generadas por un profesor automático (Jev), no probabilidades universales de daño; heredan los sesgos y las definiciones operativas de ese profesor.
- El rendimiento puede variar entre plataformas, comunidades, jerga y periodos temporales distintos de aquellos en los que se generaron las etiquetas.
- El AUPRC es moderado, especialmente en la cabeza `ero` (0,4408), lo que implica una precisión limitada cuando la clase positiva es poco frecuente; conviene ajustar el umbral a la prevalencia real del dominio de despliegue.
- El autor indica explícitamente que el modelo no debe usarse como única base para decisiones de moderación, decisiones punitivas, juicios clínicos o cualquier decisión que afecte a derechos individuales.
- Longitud máxima de 192 tokens: los textos más largos se truncan, con la consiguiente pérdida de información.
- Solo japonés: no hay soporte multilingüe ni garantías fuera de ese idioma.
- La categoría `obscene` se excluye deliberadamente de `ero`, de modo que la vulgaridad no sexual no se marca como contenido sexual; esto es intencionado, pero implica que un texto vulgar sin carga sexual no activará esa cabeza.
- La cuantización INT8 dinámica degrada sustancialmente la precisión según el autor, por lo que no se publica; no conviene aplicarla sin reevaluar.
- La licencia apache-2.0 permite uso comercial, pero el contenido que se clasifique y las decisiones derivadas siguen sujetas a la normativa aplicable y a las políticas de la plataforma.
- No se documentan la composición del dataset de entrenamiento ni el número de tokens, lo que dificulta auditar posibles sesgos de dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kokuren/doku-ero-chiwawa-japanese
- Modelo base: https://huggingface.co/izumi-lab/deberta-v2-small-japanese
- Búsqueda web: no se han encontrado enlaces relevantes al modelo, su paper o su repositorio en los resultados de búsqueda disponibles.
