# daanyool/anxiety-model-bert

## Resumen

EchoMind BERT (identificador `daanyool/anxiety-model-bert`) es un modelo de clasificación de texto basado en BERT, publicado por el usuario daanyool en Hugging Face. Según su model card, se trata de un modelo en inglés con dos cabezas de salida ("two-head") diseñado para procesar cuatro tipos de reflexiones escritas, en orden conductual, emocional, cognitivo y físico. Las salidas del modelo son logits de patrón y severidad, lo que sugiere una tarea de clasificación multi-etiqueta o multi-tarea orientada a la evaluación de estados relacionados con la ansiedad.

El modelo se distribuye en formato ONNX y está pensado para ejecutarse mediante el backend propio de EchoMind con `onnxruntime`, no a través de la API estándar de Transformers. La model card es extremadamente escueta y no aporta datos sobre arquitectura concreta, número de parámetros, longitud de contexto, composición del dataset de entrenamiento ni resultados de evaluación numéricos, más allá de remitir a un fichero `evaluation.json` que no se incluye en la información disponible.

La relevancia de este modelo es limitada en el ecosistema open source: cuenta con cero descargas y cero likes, el repositorio ocupa 0.0 GB (lo que sugiere que los pesos podrían no estar realmente alojados o que el tamaño es inferior a la precisión reportada) y no declara licencia. Se trata, por tanto, de un artefacto experimental de autor individual sin validación clínica, según advierte explícitamente su propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (familia transformer encoder); doble cabeza de clasificación (patrón y severidad) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; cuantizaciones concretas no declaradas) |
| Idiomas soportados | inglés (según la model card: "English BERT model") |
| Licencia | no disponible |
| Formato de pesos | ONNX (ejecución vía `onnxruntime`) |

## Arquitectura y entrenamiento

La model card describe un modelo BERT con dos cabezas de salida ("two-head") que produce logits de patrón y severidad sobre cuatro reflexiones escritas ordenadas en dimensiones conductual, emocional, cognitiva y física. No se especifica la variante concreta de BERT (base, large, destilado), el número de parámetros, la longitud máxima de secuencia ni el vocabulario utilizado. Tampoco se detalla si se aplicó ajuste fino sobre un checkpoint preentrenado público o si se entrenó desde cero.

El único dato sobre datos de entrenamiento es la referencia al dataset `daanyool/anxiety-classifier-dataset`, del mismo autor, sin información sobre número de ejemplos, composición, proceso de anotación ni posibles desequilibrios de clase. No se menciona el uso de RLHF, DPO ni ninguna técnica de alineación; tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La model card remite a un fichero `evaluation.json` para consultar el rendimiento sobre ejemplos reservados, pero dicho fichero no está incluido en la información proporcionada.

## Capacidades

- Clasificación de texto en inglés orientada a reflexiones escritas sobre estados emocionales, cognitivos, conductuales y físicos.
- Salida de logits de patrón y severidad mediante dos cabezas independientes.
- Inferencia en formato ONNX a través de `onnxruntime`, pensada para integrarse en el backend propietario EchoMind.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Detección de patrones de ansiedad en textos de autoinforme: el modelo clasificaría reflexiones escritas por usuarios en las cuatro dimensiones declaradas (conductual, emocional, cognitiva, física) y devolvería logits de patrón y severidad, útil como señal preliminar en aplicaciones de bienestar digital.
- Triaje no clínico en aplicaciones de salud mental: integrado en un backend como EchoMind, podría priorizar textos que requieran revisión humana, siempre como herramienta de cribado y nunca como diagnóstico.
- Análisis de diarios personales: procesamiento por lotes de entradas de journaling para generar métricas agregadas de evolución emocional a lo largo del tiempo.
- Investigación en psicolingüística computacional: uso como baseline para comparar clasificadores de ansiedad sobre corpus en inglés, dada su naturaleza de modelo pequeño y formato ONNX ligero.
- Moderación de comunidades de apoyo: señal auxiliar para detectar mensajes que sugieran malestar elevado y derivarlos a recursos de ayuda, con supervisión humana obligatoria.
- Despliegue en entornos con recursos limitados: al distribuirse en ONNX, puede ejecutarse en CPU o en dispositivos de borde sin GPU dedicada, lo que facilita prototipos de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un fichero `evaluation.json` con el rendimiento sobre ejemplos reservados, pero su contenido no se ha proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un BERT en ONNX y con un repositorio de 0.0 GB, es probable que quepa en CPU y en GPUs de gama baja, pero no hay cifras confirmadas.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por la familia del modelo (BERT) es plausible que quepa en cualquier GPU de consumo moderna, pero no se aportan datos.
- Opciones de despliegue: `onnxruntime` (formato declarado); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EchoMind BERT (`daanyool/anxiety-model-bert`) | no disponible | no disponible | Clasificación de ansiedad (4 dimensiones, 2 cabezas) | no disponible | Hugging Face, formato ONNX |
| BERT base (Google) | ~110 M | 512 tokens | Clasificación general de texto | Apache 2.0 | Hugging Face, múltiples formatos |
| MentalBERT | ~110 M (BERT base) | 512 tokens | Clasificación de texto en salud mental | MIT (según su model card pública) | Hugging Face |
| DistilBERT | ~66 M | 512 tokens | Clasificación general de texto | Apache 2.0 | Hugging Face, ONNX disponible |

La comparación es orientativa: no se dispone de métricas de EchoMind BERT para contrastar rendimiento con estas alternativas.

## Limitaciones y advertencias

- La propia model card advierte: "For reflection only. No clinical validation." No debe usarse como herramienta diagnóstica ni para decisiones clínicas.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; en la práctica, la ausencia de licencia explícita implica reserva de derechos por defecto en muchas jurisdicciones.
- No hay información sobre sesgos demográficos, culturales o lingüísticos del dataset de entrenamiento.
- Riesgo de alucinación y de falsos positivos/negativos no cuantificado: no se publican métricas de precisión, recall ni calibración.
- Idioma limitado al inglés según la model card; no se documenta comportamiento en castellano ni en otros idiomas.
- Repositorio con 0 descargas y 0 likes, tamaño reportado de 0.0 GB y sin `evaluation.json` accesible en la información disponible: indica un artefacto experimental sin validación comunitaria.
- Dependencia del backend propietario EchoMind para la inferencia ONNX, lo que reduce la portabilidad frente a pipelines estándar de Transformers.
- Cualquier uso en producción relacionado con salud mental requiere supervisión humana, avisos claros al usuario y cumplimiento de la normativa aplicable (por ejemplo, RGPD en la UE).

## Enlaces

- Hugging Face: https://huggingface.co/daanyool/anxiety-model-bert
- Dataset referenciado: https://huggingface.co/datasets/daanyool/anxiety-classifier-dataset
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
