# Safetecom/hierarchical_category_classifier

## Resumen

`hierarchical_category_classifier` es un modelo publicado en Hugging Face por el usuario Safetecom cuyo propósito declarado, a juzgar por su identificador, es la clasificación jerárquica de categorías. La model card está prácticamente vacía: todos los campos descriptivos (tipo de modelo, arquitectura, datos de entrenamiento, licencia, procedencia) figuran como "[More Information Needed]", por lo que no es posible confirmar la familia arquitectónica ni el proceso de entrenamiento a partir de la documentación oficial.

El único dato técnico verificable es su tamaño de repositorio, 17,3 GB en formato safetensors, lo que sugiere un modelo de escala media (probablemente en el rango de 7 a 9 mil millones de parámetros en precisión de 16 bits, aunque esta estimación no puede confirmarse con la información disponible). El modelo declara únicamente el idioma italiano (`it`) y no cuenta con descargas ni interacciones en el momento de la consulta.

El aspecto más relevante es la discrepancia documentada en su propia model card: la precisión actual registrada es de 0,6326 frente a una precisión previa de 0,8842, con un campo `model_updated: 'NO'`. Esto indica una regresión de aproximadamente 25 puntos porcentuales en la métrica de precisión y que el autor no ha actualizado el modelo para corregirla. Para cualquier evaluación seria, este modelo debe considerarse inestable y no apto para producción sin validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (tamaño de repo: 17,3 GB en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | italiano (`it`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea declarada | clasificación jerárquica de categorías |
| Precisión reportada (actual) | 0,6326 |
| Precisión reportada (previa) | 0,8842 |
| Estado de actualización | `model_updated: 'NO'` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura. La model card no especifica si se trata de un transformer encoder, un modelo de clasificación derivado de un LLM, un modelo MoE o cualquier otra variante. Tampoco se documenta el número de parámetros, la longitud de contexto, la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de ajuste como RLHF o DPO.

El único indicio indirecto es el tamaño del repositorio (17,3 GB) y el formato safetensors, compatible con pesos en fp16/bf16 de un modelo de varios miles de millones de parámetros. Cualquier inferencia sobre la arquitectura a partir de este dato es especulativa y no debe tomarse como confirmada. La model card conserva la plantilla por defecto de Hugging Face con secciones sin rellenar, incluyendo hiperparámetros, infraestructura de cómputo y huella de carbono.

## Capacidades

- Clasificación de texto en categorías con estructura jerárquica (según el identificador del modelo; no documentado en la model card).
- Procesamiento de texto en italiano, único idioma declarado.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo de razonamiento (thinking), visión, audio ni multimodalidad.
- No se documenta generación de texto libre, código ni matemáticas.
- No se documenta capacidad multilingüe más allá del italiano.

## Casos de uso

- Clasificación taxonómica de documentos en italiano: el modelo podría emplearse para asignar documentos a una jerarquía de categorías (por ejemplo, secciones y subsecciones de un catálogo), siempre que se valide la precisión real sobre el dominio objetivo dada la regresión reportada.
- Etiquetado de tickets de soporte en italiano: asignación automática de incidencias a categorías y subcategorías para enrutamiento, con revisión humana obligatoria por la precisión actual de 0,6326.
- Organización de catálogos de producto: clasificación jerárquica de ítems en taxonomías de comercio electrónico en italiano, útil para normalizar inventarios heterogéneos.
- Moderación y triaje de contenido: primera pasada de clasificación por categorías temáticas antes de una revisión manual, dado que el modelo no está validado para decisiones autónomas.
- Enriquecimiento de metadatos en pipelines de datos: etiquetado por lotes de corpus en italiano para búsqueda facetada o análisis de contenido.
- Prototipado e investigación: como baseline para experimentos de clasificación jerárquica en italiano, comparando su precisión con alternativas antes de comprometerse con un modelo en producción.

## Benchmarks y rendimiento

La model card únicamente reporta dos valores de precisión (accuracy) sin especificar el conjunto de evaluación, la métrica exacta ni el protocolo:

| Metrica | Valor |
|---|---|
| Precisión actual | 0,6326 |
| Precisión previa | 0,8842 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. No se especifica el conjunto de test ni el desglose por clase o nivel jerárquico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. Un repositorio de 17,3 GB en safetensors requiere al menos esa cantidad de memoria para cargar los pesos en fp16, más overhead de activaciones y runtime; en la práctica, se necesitarían GPUs con 24 GB o más (A100 40/80 GB, H100, L40S) para una carga sin cuantizar.
- GPU consumer: posiblemente viable en RTX 3090/4090 (24 GB) si el modelo cabe en fp16 con margen, aunque no está confirmado; requeriría cuantización a 8 o 4 bits para mayor holgura.
- Opciones de despliegue: no documentadas. Al ser safetensors, sería compatible con Transformers, vLLM o TGI si la arquitectura es un transformer estándar, pero esto no puede confirmarse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La ausencia de especificaciones (arquitectura, parámetros, contexto, licencia) impide establecer una comparación rigurosa con alternativas de clasificación jerárquica o con modelos de tamaño similar. Cualquier comparación sería especulativa.

## Limitaciones y advertencias

- Regresión de rendimiento documentada: la precisión actual (0,6326) es sustancialmente inferior a la previa (0,8842), y el campo `model_updated: 'NO'` indica que el autor no ha corregido el problema.
- Documentación prácticamente inexistente: la model card es una plantilla sin rellenar, lo que impide verificar procedencia, datos de entrenamiento y metodología de evaluación.
- Licencia no especificada: no es posible determinar si el uso comercial está permitido; debe tratarse como no autorizado hasta confirmación.
- Idioma limitado al italiano: no hay evidencia de capacidades en castellano u otros idiomas.
- Riesgo de sesgos y alucinación: no evaluable por falta de información sobre datos de entrenamiento; en un clasificador, el riesgo principal es la asignación errónea sistemática de categorías.
- Sin validación externa: cero descargas y cero interacciones sugieren ausencia de uso o revisión por la comunidad.
- No apto para producción sin evaluación independiente sobre el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/Safetecom/hierarchical_category_classifier
- Machine Learning Impact calculator (referenciado en la model card): https://mlco2.github.io/impact#compute
- Lacoste et al. (2019), paper citado en la model card: https://arxiv.org/abs/1910.09700
