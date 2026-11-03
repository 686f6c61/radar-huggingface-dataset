# Muhand-393/Liver-fibrosis-v2

## Resumen

Liver-fibrosis-v2 es un modelo de clasificación de imágenes médicas publicado en HuggingFace por el usuario Muhand-393. Su propósito declarado es la clasificación del grado de fibrosis hepática (F0 a F4) a partir de imágenes de tomografía computarizada (CT), resonancia magnética (MRI) y ecografía (ultrasound). Se trata de un modelo con pipeline `image-classification` y etiqueta `medical`, orientado por tanto a un caso de uso clínico concreto: la estadificación no invasiva de la fibrosis hepática, un problema relevante en el manejo de enfermedades hepáticas crónicas.

La información pública disponible es extremadamente limitada. La model card se reduce a un título y una línea descriptiva en árabe e inglés, sin datos sobre arquitectura, tamaño, datos de entrenamiento, métricas ni procedencia de los pesos. El repositorio registra cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el mismo día (3 de noviembre de 2026), lo que sugiere una publicación reciente y sin validación comunitaria.

Por todo ello, esta ficha debe interpretarse como una descripción de lo declarado por el autor, no de capacidades verificadas. Cualquier evaluación de idoneidad clínica o de producción requeriría información adicional que el autor no ha hecho pública.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la librería declarada es `custom`, sin detalle de arquitectura) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (la model card está en árabe e inglés; no se especifican idiomas de inferencia) |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. La librería declarada es `custom`, lo que implica que no se apoya en una clase estándar de Transformers ni en un pipeline reconocido automáticamente por la plataforma. No hay datos sobre el backbone utilizado (CNN, ViT u otro), el número de parámetros, la resolución de entrada esperada ni el preprocesado de las imágenes.

Tampoco se documenta el conjunto de entrenamiento: no se indica el número de imágenes, su procedencia (hospitales, datasets públicos como LiTS o similar), la distribución de clases F0-F4, ni si se aplicaron técnicas de aumento de datos, validación cruzada o calibración. Se desconoce igualmente si el modelo se entrenó desde cero o mediante fine-tuning de un backbone preentrenado, y no hay mención a métricas de validación, curvas ROC, matrices de confusión ni a ningún proceso de evaluación externa.

## Capacidades

- Clasificación de imágenes médicas hepáticas en cinco grados de fibrosis (F0, F1, F2, F3, F4), según la descripción del autor.
- Entrada declarada multimodal en origen de imagen: CT, MRI y ecografía (ultrasound). No se especifica si un mismo modelo maneja las tres modalidades o si requiere preprocesados distintos.
- Salida de clasificación por imagen (pipeline `image-classification`), presumiblemente con etiquetas F0-F4 y puntuaciones de probabilidad, aunque el formato exacto de salida no está documentado.
- Compatibilidad declarada con endpoints de HuggingFace (tag `endpoints_compatible`).
- No se declaran capacidades de generación de texto, razonamiento, código, tool calling, agentes ni multilingüismo.

## Casos de uso

- Triaje asistido en radiología: el modelo podría emplearse como segunda lectura sobre estudios de CT, MRI o ecografía hepática para señalar casos con posible fibrosis avanzada (F3-F4) y priorizar su revisión por un especialista. Su utilidad real depende de métricas de sensibilidad que no se han publicado.
- Investigación retrospectiva: análisis automatizado de cohortes de imágenes hepáticas almacenadas para estratificar pacientes por grado de fibrosis en estudios epidemiológicos o de correlación con biomarcadores.
- Herramienta de anotación y preetiquetado: generar etiquetas preliminares F0-F4 sobre grandes volúmenes de imágenes para acelerar la revisión manual por radiólogos en la construcción de datasets.
- Prototipado de pipelines clínicos: al ser compatible con endpoints de HuggingFace, puede integrarse en un servicio de inferencia para validar la viabilidad técnica de un flujo de clasificación de fibrosis antes de sustituirlo por un modelo validado.
- Docencia y demostración: ilustrar en entornos académicos cómo se aborda la estadificación automática de fibrosis hepática con modelos de visión, siempre con fines formativos y no diagnósticos.
- Comparación de modalidades: evaluar de forma exploratoria si el modelo mantiene un comportamiento consistente entre CT, MRI y ecografía, lo que permitiría estudiar qué modalidad aporta mayor señal para la clasificación F0-F4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye accuracy, AUC, F1, matrices de confusión ni comparación con radiólogos o con otros modelos de estadificación de fibrosis.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el tamaño y la arquitectura del modelo.
- GPU recomendadas: no disponible. Sin conocer el número de parámetros no puede determinarse si requiere GPU de datacenter (A100, H100) o si es viable en GPU de consumo (RTX 4090, RTX 3060, etc.).
- Compatibilidad con GPU de consumo: no determinable con la información publicada.
- Opciones de despliegue: el tag `endpoints_compatible` sugiere uso mediante HuggingFace Inference Endpoints. Al ser una librería `custom`, no puede asumirse compatibilidad con vLLM, TGI, llama.cpp u Ollama; requeriría el código de inferencia específico del autor, que no se ha publicado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de clasificación de fibrosis hepática ni datos de rendimiento que permitan establecer una comparación con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: sin arquitectura, datos de entrenamiento ni métricas, el modelo no puede evaluarse ni auditarse de forma rigurosa.
- Riesgo clínico elevado: se trata de un modelo médico sin validación publicada; no debe usarse para diagnóstico, estadificación ni decisiones terapéuticas sin validación externa y aprobación regulatoria.
- Licencia no especificada: la ausencia de licencia impide determinar si el uso comercial o clínico está permitido; en la práctica, debe asumirse que no hay autorización explícita.
- Riesgo de sesgo desconocido: al no documentarse la procedencia de los datos, no puede evaluarse el sesgo por población, equipo de imagen, fabricante o protocolo de adquisición.
- Riesgo de sobreajuste y de generalización deficiente: sin información sobre validación cruzada ni conjuntos de test independientes, es probable que el rendimiento fuera de la distribución de entrenamiento sea incierto.
- Ambigüedad multimodal: no se aclara si el modelo distingue entre CT, MRI y ecografía en la entrada, lo que puede provocar predicciones erróneas si se alimenta con una modalidad distinta a la esperada.
- Sin soporte comunitario: cero descargas y cero likes, sin issues ni discusión pública que permitan conocer experiencias de uso.
- Idiomas: no se especifican; la documentación en árabe e inglés no implica capacidades lingüísticas del modelo, que es puramente de visión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Muhand-393/Liver-fibrosis-v2
