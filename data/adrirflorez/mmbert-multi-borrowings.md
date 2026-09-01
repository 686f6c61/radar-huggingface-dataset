# adrirflorez/mmbert-multi-borrowings

## Resumen

El modelo `adrirflorez/mmbert-multi-borrowings` es un clasificador de texto basado en la arquitectura ModernBERT, especializado en la detección y clasificación de préstamos lingüísticos (borrowings) en contextos multilingües. Desarrollado por Adrir Florez, este modelo se presenta como una adaptación del modelo base mmBERT, un encoder multilingüe moderno entrenado por el JHU-CLSP sobre 3 billones de tokens en más de 1800 lenguas.

La relevancia de este modelo radica en su aplicación en lingüística computacional, donde la identificación automática de préstamos léxicos entre lenguas es una tarea compleja que requiere modelos con un profundo conocimiento multilingüe. Al estar construido sobre mmBERT, hereda una representación multilingüe de última generación que supera a alternativas como XLM-R en tareas de clasificación y recuperación.

Con 307 millones de parámetros, el modelo ofrece un equilibrio entre capacidad y eficiencia, siendo adecuado para tareas de clasificación de texto en entornos de producción. La ficha técnica del autor es mínima, por lo que gran parte de la información detallada sobre entrenamiento, datos y rendimiento no está disponible públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder-only transformer) |
| Parametros totales | 307.534.085 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo multilingüe, basado en mmBERT con 1833 lenguas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT, un encoder transformer moderno que incorpora innovaciones como atención con máscara inversa y un programación de temperatura adaptativa. El modelo base mmBERT, del cual deriva, fue preentrenado con 3 billones de tokens en más de 1800 lenguas utilizando un enfoque novedoso de aprendizaje de lenguaje anealed (ALL, por sus siglas en inglés), que combina un programación de ratio de máscara inversa y un muestreo de temperatura inversa para mejorar el aprendizaje multilingüe.

El proceso de fine-tuning específico para la tarea de clasificación de préstamos lingüísticos no está documentado en la ficha del modelo. No se dispone de información sobre el dataset de entrenamiento, el número de épocas, la tasa de aprendizaje ni las técnicas de alineación (RLHF, DPO, etc.) utilizadas. El modelo se distribuye como un clasificador de texto listo para usar, con la librería transformers.

## Capacidades

- Clasificación de texto multilingüe, especializado en la detección de préstamos lingüísticos (palabras tomadas de otras lenguas).
- Procesamiento de texto en múltiples idiomas gracias a su base mmBERT, que cubre más de 1800 lenguas.
- Integración con el ecosistema Hugging Face: compatible con pipelines de `text-classification` y con Text Embeddings Inference (TEI) para despliegue en producción.
- Soporte para fine-tuning adicional en tareas downstream de clasificación de texto.
- Capacidad de embeddings de texto de alta calidad para tareas de recuperación y similitud semántica, heredada de mmBERT.

## Casos de uso

- Investigación en lingüística computacional: el modelo permite identificar automáticamente préstamos léxicos en corpus multilingües, facilitando estudios sobre contacto entre lenguas y evolución del vocabulario. Su base multilingüe de 1833 lenguas lo hace adecuado para lenguas con pocos recursos.
- Análisis de redes sociales y medios: detección de anglicismos u otros préstamos en publicaciones de redes sociales, foros o noticias, útil para estudios sociolingüísticos y de tendencias lingüísticas.
- Lexicografía y elaboración de diccionarios: asistencia en la identificación de entradas que son préstamos de otras lenguas, acelerando el trabajo de los lexicógrafos en la documentación de vocabulario.
- Sistemas de traducción automática: preprocesamiento de texto para identificar términos que no requieren traducción directa (préstamos asentados), mejorando la coherencia en sistemas de traducción.
- Educación y aprendizaje de lenguas: generación de materiales didácticos que distingan entre vocabulario nativo y préstamos, ayudando a estudiantes a comprender la etimología de las palabras.
- Política lingüística y planificación: análisis de la penetración de préstamos en una lengua determinada, información relevante para organismos que regulan el uso del idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base mmBERT reporta mejoras frente a XLM-R en tareas de clasificación y recuperación, pero no hay datos específicos para esta adaptación de clasificación de préstamos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 307M parámetros en precisión fp32, el modelo requiere aproximadamente 1,2 GB de VRAM. Con cuantización a int8, se reduce a unos 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia (GTX 1650, RTX 3050, etc.). Para fine-tuning se recomienda una GPU con 8-12 GB (RTX 3060, RTX 3080, A10).
- El modelo cabe en GPUs de consumo estándar, incluso en versiones de gama baja.
- Opciones de despliegue: compatible con Hugging Face Inference Endpoints, Text Embeddings Inference (TEI), y puede ejecutarse localmente con la librería transformers de Python.
- Latencia y throughput: no disponible. Al ser un modelo de 307M parámetros, se espera una latencia de decenas de milisegundos por ejemplo en GPUs modernas, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Uso principal |
|---|---|---|---|---|---|
| mmbert-multi-borrowings | 307M | no disponible | Multilingüe (1833) | no disponible | Clasificación de préstamos |
| XLM-R base | 270M | 512 tokens | 100 | MIT | Clasificación y recuperación multilingüe |
| mBERT | 178M | 512 tokens | 104 | Apache 2.0 | Clasificación y recuperación multilingüe |

El modelo se distingue de XLM-R y mBERT por su base mmBERT, que ofrece un mejor rendimiento en tareas multilingües según el paper de mmBERT. Sin embargo, al ser un modelo especializado en una tarea concreta, su comparación directa con modelos generalistas solo es relevante en el ámbito de la clasificación de préstamos lingüísticos.

## Limitaciones y advertencias

- La ficha del modelo es mínima: no se documentan datos de entrenamiento, evaluación, sesgos ni limitaciones específicas. Esto dificulta la evaluación de su idoneidad para casos de uso concretos.
- Al ser un modelo especializado en préstamos lingüísticos, su rendimiento en otras tareas de clasificación de texto puede ser inferior al de modelos generalistas.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- El modelo puede heredar sesgos presentes en los datos de preentrenamiento de mmBERT, especialmente en lenguas con menos representación.
- No se dispone de información sobre la longitud de contexto soportada, lo que limita su uso en documentos largos.
- Riesgo de alucinación en la clasificación: como cualquier modelo de lenguaje, puede producir clasificaciones incorrectas, especialmente en lenguas o dominios poco representados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adrirflorez/mmbert-multi-borrowings
- Repositorio de mmBERT (JHU-CLSP): https://github.com/JHU-CLSP/mmBERT/
- Paper de mmBERT: https://arxiv.org/abs/2509.06888
- Versión alternativa del modelo: https://huggingface.co/arodriguezf/mmbert-multi-borrowings
- Versión con fine-tuning en ConLoan: https://huggingface.co/arodriguezf/mmbert-multi-borrowings-conloan
