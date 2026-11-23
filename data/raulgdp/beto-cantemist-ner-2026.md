# raulgdp/beto-cantemist-ner-2026

## Resumen

beto-cantemist-ner-2026 es un modelo de clasificación de tokens (reconocimiento de entidades nombradas, NER) obtenido mediante fine-tuning de dccuchile/bert-base-spanish-wwm-cased, el conocido como BETO, un BERT entrenado específicamente para castellano con enmascaramiento de palabras completas y casing. El autor del ajuste es el usuario de Hugging Face raulgdp, y el nombre del modelo sugiere que el ajuste se ha realizado sobre el corpus Cantemist, un conjunto de textos clínicos en castellano anotados con entidades biomédicas.

El modelo resuelve la tarea de etiquetado de secuencias sobre texto clínico en castellano, con una arquitectura transformer encoder de tipo BERT de 109,26 millones de parámetros totales. Según la model card, alcanza un F1 de 0,8152, una precisión de 0,8014 y un recall de 0,8295 sobre el conjunto de evaluación tras cinco épocas de entrenamiento.

Su relevancia es acotada: se trata de un ajuste concreto y de reciente publicación (noviembre de 2026), con cero descargas y cero likes en el momento de la consulta, y sin documentación adicional sobre el dataset, los idiomas o la licencia. Es útil como punto de partida para tareas de NER biomédico en castellano, pero requiere validación propia antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base_model: dccuchile/bert-base-spanish-wwm-cased) |
| Parametros totales | 109.262.595 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base BERT, 512 tokens por convención, no declarada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es de castellano) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de dccuchile/bert-base-spanish-wwm-cased, un BERT base con enmascaramiento de palabras completas (whole word masking) y distinción de mayúsculas y minúsculas, adaptado al castellano. La tarea de cabecera es token-classification, es decir, una capa de clasificación por token sobre las representaciones contextuales del encoder. No se trata de un modelo generativo ni de un MoE: es un encoder denso de 109,26 millones de parámetros.

El entrenamiento se realizó con el Trainer de Transformers 4.47.0 sobre PyTorch 2.14.1+cu130, Datasets 3.1.0 y Tokenizers 0.21.0. Los hiperparámetros declarados son: learning rate de 3e-05, batch size de 32 en entrenamiento y evaluación, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con warmup ratio de 0,1, cinco épocas y precisión mixta nativa (AMP). El dataset de entrenamiento no se especifica en la model card ("unknown dataset"), aunque el nombre del modelo apunta al corpus Cantemist de entidades clínicas. La pérdida de validación mínima se alcanzó en la época 2 (0,0317), y a partir de ahí se observa un ligero sobreajuste: la pérdida de validación sube hasta 0,0489 en la época 5, aunque el F1 sigue mejorando hasta 0,8152.

## Capacidades

- Etiquetado de secuencias (token classification) sobre texto en castellano, orientado a reconocimiento de entidades nombradas.
- Detección de entidades en dominio biomédico/clínico, a juzgar por el nombre del modelo y el corpus de referencia (Cantemist).
- Clasificación por token con contexto bidireccional gracias a la arquitectura BERT del modelo base.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el modelo base es monolingüe en castellano.
- No dispone de modo thinking ni de capacidades de audio.

## Casos de uso

- Extracción de entidades clínicas en informes médicos: el modelo puede etiquetar por token menciones de enfermedades, fármacos, procedimientos o anatomía en textos clínicos en castellano, aprovechando el ajuste sobre el corpus Cantemist y el vocabulario especializado del modelo base BETO.
- Anonimización y desidentificación de historiales: combinado con etiquetas de tipo persona o localización, puede servir como primer paso para localizar menciones sensibles antes de aplicar reglas de enmascarado en pipelines de protección de datos.
- Enriquecimiento de bases de datos sanitarias: procesamiento por lotes de notas clínicas para poblar tablas estructuradas de entidades, con un F1 de referencia de 0,8152 que permite estimar la tasa de error esperada.
- Indexación semántica de documentación médica: extracción de entidades para construir índices de búsqueda sobre corpus clínicos en castellano, facilitando la recuperación por término biomédico.
- Preetiquetado para anotación humana: uso del modelo como asistente de anotación en proyectos de etiquetado de corpus, reduciendo el esfuerzo manual en las entidades con mayor precisión y dejando la revisión humana para las clases con más errores.
- Investigación en NER biomédico en castellano: punto de partida reproducible (semilla 42, hiperparámetros documentados) para comparar variantes de fine-tuning sobre BETO en tareas de entidades clínicas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de evaluación (no se especifica el conjunto exacto):

| Metrica | Valor |
|---|---|
| Loss | 0.0489 |
| Precision | 0.8014 |
| Recall | 0.8295 |
| F1 | 0.8152 |

Evolución por época según la model card:

| Epoca | Validation loss | Precision | Recall | F1 |
|---|---|---|---|---|
| 1.0 | 0.0343 | 0.7006 | 0.7292 | 0.7146 |
| 2.0 | 0.0317 | 0.7528 | 0.8127 | 0.7816 |
| 3.0 | 0.0374 | 0.7373 | 0.8179 | 0.7755 |
| 4.0 | 0.0402 | 0.7983 | 0.8213 | 0.8096 |
| 5.0 | 0.0489 | 0.8014 | 0.8295 | 0.8152 |

No se han publicado resultados comparativos con otros modelos en la información disponible, ni el model-index incluye resultados adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,45 GB en fp32 para los 109,26 millones de parámetros, más el overhead de activaciones y tokenizador; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo no aprovecha la capacidad de las GPU de gama alta.
- Cabe holgadamente en GPU de consumo, incluidas portátiles con 4-6 GB de VRAM, e incluso puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: Transformers con pipeline de token-classification, TorchServe, o exportación a ONNX para inferencia optimizada; también es compatible con endpoints de Hugging Face (tag endpoints_compatible).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al ser un encoder BERT base, se espera un throughput alto en GPU y una latencia de milisegundos por secuencia de longitud moderada, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| raulgdp/beto-cantemist-ner-2026 | 109,26 M | no disponible | 0,8152 | no disponible | Hugging Face |
| dccuchile/bert-base-spanish-wwm-cased (BETO) | no disponible en la informacion | no disponible | no disponible (modelo base, sin ajuste NER) | no disponible en la informacion | Hugging Face |
| Otros ajustes NER biomédicos en castellano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- La model card está generada automáticamente y contiene secciones sin completar ("More information needed") sobre descripción, usos previstos, limitaciones y datos de entrenamiento.
- El dataset de entrenamiento y evaluación no se especifica; solo el nombre del modelo sugiere el corpus Cantemist, lo que impide verificar la composición y el dominio exacto.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; es un riesgo legal relevante para producción.
- No se declaran los idiomas soportados; aunque el modelo base es de castellano, no hay confirmación explícita.
- Se observa sobreajuste a partir de la época 2: la pérdida de validación aumenta de 0,0317 a 0,0489 mientras el F1 mejora ligeramente, lo que sugiere que el modelo final puede estar ajustado en exceso al conjunto de validación.
- Riesgo de alucinación y de falsos positivos en entidades: con precisión de 0,8014, aproximadamente una de cada cinco entidades predichas puede ser incorrecta en el conjunto de evaluación.
- El rendimiento en dominios distintos al clínico o en variantes dialectales del castellano no está documentado.
- El modelo tiene cero descargas y cero likes, sin validación externa por parte de la comunidad.
- No se documentan sesgos conocidos; al tratarse de un ajuste sobre textos clínicos, puede heredar sesgos del corpus de anotación.
- La longitud de contexto no está declarada explícitamente; debe asumirse la del modelo base y verificarse antes de procesar documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raulgdp/beto-cantemist-ner-2026
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Resultados de búsqueda web proporcionados: no guardan relación con este modelo (tratan sobre estaciones ópticas de comunicaciones espaciales) y no se incluyen como referencias.
