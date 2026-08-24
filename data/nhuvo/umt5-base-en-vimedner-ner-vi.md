# nhuvo/umt5-base-en-vimedner-ner-vi

## Resumen

El modelo `nhuvo/umt5-base-en-vimedner-ner-vi` es un ajuste fino (fine-tuning) de `google/umt5-base` para el reconocimiento de entidades nombradas (NER) biomédicas en vietnamita. Desarrollado por nhuvo, convierte texto plano en texto etiquetado inline, por ejemplo, identificando términos como enfermedades, fármacos o funciones biológicas. Está basado en la arquitectura UMT5, un transformer encoder-decoder multilingüe de Google, y cuenta con 592 millones de parámetros. Su relevancia radica en ofrecer una solución específica para el dominio biomédico en vietnamita, un área con escasos recursos lingüísticos. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UMT5 (transformer encoder-decoder) |
| Parametros totales | 592.043.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/umt5-base`, un modelo multilingüe de la familia T5 desarrollado por Google. UMT5 emplea una arquitectura encoder-decoder con atención completa, diseñada para manejar múltiples idiomas mediante un tokenizer unificado. El ajuste fino se realizó sobre el dataset `nhuvo/En-ViMedNER`, que contiene anotaciones de entidades biomédicas en vietnamita e inglés. El entrenamiento convierte el problema de NER en una tarea de generación de texto: se proporciona un prefijo ("recognize Vietnamese named entities: ") seguido del texto original, y el modelo genera el mismo texto con las entidades envueltas en etiquetas XML (p. ej., `<BIOLOGIC_FUNCTION>...</BIOLOGIC_FUNCTION>`). No se dispone de detalles sobre el número de épocas, el tamaño del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Reconocimiento de entidades nombradas biomédicas en vietnamita, incluyendo tipos como enfermedades, fármacos, funciones biológicas, etc.
- Generación de texto etiquetado inline, lo que facilita la integración en pipelines de procesamiento de lenguaje natural.
- Soporte multilingüe limitado al vietnamita (el modelo base UMT5 es multilingüe, pero este ajuste se centra en vietnamita).
- No se ha documentado soporte para tool calling, agentes ni razonamiento multi-paso.
- No se ha documentado capacidad de visión, audio u otras modalidades.

## Casos de uso

- Extracción de entidades de informes clínicos: el modelo puede procesar historiales médicos en vietnamita y extraer automáticamente diagnósticos, medicamentos y síntomas, facilitando la codificación y el análisis de datos sanitarios.
- Anotación de corpus biomédicos: investigadores pueden usar el modelo para etiquetar grandes volúmenes de texto científico o clínico, reduciendo el trabajo manual de anotación.
- Sistemas de búsqueda semántica en salud: al identificar entidades, se pueden indexar documentos médicos y permitir búsquedas por conceptos específicos (p. ej., "diabetes tipo 2").
- Asistencia a la traducción médica: aunque el modelo no traduce, puede ayudar a identificar términos biomédicos que luego se traducen con precisión.
- Monitorización de literatura científica: el modelo puede escanear artículos y resúmenes en vietnamita para detectar menciones de nuevas enfermedades o tratamientos.
- Integración en chatbots de salud: el modelo puede extraer entidades de las consultas de los usuarios para derivarlas a servicios especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como F1, precisión o recall sobre conjuntos de prueba estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 592M parámetros, en precisión fp32 se requieren aproximadamente 2,4 GB solo para los pesos, más overhead de activaciones y memoria intermedia. Se estima un consumo total de 3-4 GB en fp32, y alrededor de 1,5-2 GB en cuantización int8.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, RTX 3060) puede ejecutar el modelo en fp32. Para mayor velocidad, se recomienda una RTX 3090 o superior.
- El modelo cabe en GPUs de consumo, como las de la serie RTX 30 o 40.
- Opciones de despliegue: se puede usar con la librería `transformers` de Hugging Face, así como con servidores de inferencia como vLLM o TGI, aunque no se ha verificado la compatibilidad con estos últimos.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, se espera una latencia de decenas de milisegundos por secuencia corta, pero depende del hardware y la longitud del texto.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de NER biomédico en vietnamita. Como referencia cualitativa, se puede comparar con:

- `xlm-roberta-base` (multilingüe, 278M parámetros): modelo generalista que puede ajustarse para NER, pero no está especializado en biomedicina ni en vietnamita.
- `PhoBERT` (vietnamita, 135M parámetros): modelo monolingüe para vietnamita, útil para tareas generales de NLP, pero sin enfoque biomédico.
- `mBERT` (multilingüe, 172M parámetros): similar a XLM-R, requiere ajuste fino para NER biomédico.

Este modelo se distingue por su especialización directa en el dominio biomédico vietnamita, lo que podría ofrecer mejor rendimiento en esa tarea específica, aunque no hay datos que lo confirmen.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el dominio biomédico vietnamita; su rendimiento en otros dominios o idiomas será deficiente.
- Puede presentar sesgos derivados del dataset de entrenamiento, que podría no representar toda la diversidad de textos biomédicos.
- Riesgo de alucinación: al ser un modelo generativo, puede producir etiquetas incorrectas o inventar entidades si el texto de entrada es ambiguo o fuera de distribución.
- La longitud de contexto no está documentada; se recomienda verificar el límite del tokenizer de UMT5 (típicamente 512 tokens) para evitar truncamientos.
- La licencia Apache 2.0 permite uso comercial, pero se debe citar adecuadamente al autor y al dataset original.
- No se han publicado evaluaciones de seguridad ni de sesgos específicos para este modelo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/nhuvo/umt5-base-en-vimedner-ner-vi)
- [Modelo base google/umt5-base](https://huggingface.co/google/umt5-base)
- [Documentación de UMT5 en Hugging Face](https://huggingface.co/docs/transformers/model_doc/umt5)
- [Dataset En-ViMedNER](https://huggingface.co/datasets/nhuvo/En-ViMedNER)
- [Repositorio GitHub ViMedNer](https://github.com/tdtrinh11/ViMedNer)
