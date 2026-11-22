# bigzed24/radBERT_syn_21NOV

## Resumen

radBERT_syn_21NOV es un modelo de clasificación de texto en inglés especializado en informes radiológicos de tomografía computarizada (TC). Se trata de un ajuste fino (fine-tuning) del modelo base StanfordAIMI/RadBERT, un BERT adaptado al dominio radiológico por el grupo StanfordAIMI, y ha sido publicado por el usuario bigzed24. La tarea concreta que resuelve es la detección de fractura patológica (pathologic fracture, `path_fx`) a partir exclusivamente de la sección "BONES AND SOFT TISSUES" del informe, en el contexto de seguimiento de pacientes con cáncer de próstata y de mama metastásico.

El modelo emplea una arquitectura transformer tipo BERT con 108.311.810 parámetros totales y una longitud máxima de secuencia de 256 tokens durante el entrenamiento. Su rasgo más distintivo es que se ha entrenado únicamente con informes sintéticos, sin datos de pacientes reales, lo que elimina las restricciones de privacidad habituales en el dominio clínico y permite publicar los pesos bajo licencia MIT. El repositorio ocupa 0,4 GB y los pesos están en formato safetensors.

La relevancia del modelo es metodológica más que clínica: demuestra un flujo de trabajo de ajuste fino sobre datos sintéticos con normalización de maquetación y mezcla de frases de fondo entre clases, orientado a obtener una estimación mínima (floor estimate) del recuento de eventos en tareas de cribado. El propio autor advierte de que no está destinado a la toma de decisiones clínicas y de que el umbral operativo debe calibrarse con informes reales etiquetados por radiólogos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), fine-tuning de StanfordAIMI/RadBERT |
| Parametros totales | 108.311.810 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (max_len de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de StanfordAIMI/RadBERT, un encoder BERT preentrenado sobre corpus radiológicos, y se ajusta como clasificador binario de secuencias. La entrada es únicamente la sección "BONES AND SOFT TISSUES" del informe de TC, normalizada según el fichero `preprocess.json` del autor. La etiqueta 1 corresponde a `path_fx` y la 0 a `no_path_fx`.

El entrenamiento se realizó exclusivamente con informes sintéticos, sin datos de pacientes, con un hash de datos `63aafd363b88`. El conjunto se dividió en 4956 ejemplos de entrenamiento y 438 de validación, con recuentos de etiquetas de 1764 para la clase 1 y 1152 para la clase 0. Se aplicó normalización de maquetación y una técnica de mezcla de frases de fondo entre clases (cross-class background-sentence mixing) con 2 copias, presumiblemente para reducir el sesgo hacia frases plantilla correlacionadas con la etiqueta. La configuración de entrenamiento fue: semilla 42, max_len 256, 4 épocas, learning rate 2e-05 y peso de pérdida de la clase negativa de 1,5. No se documentan fases de RLHF ni DPO, algo esperable en un modelo de clasificación.

## Capacidades

- Clasificación binaria de texto: predice presencia o ausencia de fractura patológica a partir de la sección de huesos y tejidos blandos de un informe de TC.
- Procesamiento de texto clínico en inglés con vocabulario y dominio radiológicos heredados de RadBERT.
- Normalización de maquetación de informes según la configuración del autor (`preprocess.json`).
- Manejo de secuencias de hasta 256 tokens.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni otras capacidades multimodales.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Cribado de investigación en cohortes retrospectivas: aplicar el modelo sobre secciones de huesos y tejidos blandos de informes de TC para obtener una estimación mínima del número de fracturas patológicas y dimensionar así estudios posteriores.
- Etiquetado previo (pre-labelling) para anotación humana: usar las predicciones como primera pasada que los radiólogos revisan y corrigen, reduciendo el coste de anotación en grandes volúmenes de informes.
- Validación de pipelines de NLP clínico: servir como referencia reproducible de un clasificador entrenado solo con datos sintéticos frente a modelos entrenados con datos reales.
- Investigación sobre datos sintéticos: estudiar la transferibilidad de un modelo entrenado exclusivamente con informes sintéticos cuando se evalúa sobre datos reales de otra institución.
- Extracción de fenotipos en seguimiento oncológico: identificar menciones de fractura patológica en el seguimiento de pacientes con cáncer de próstata o mama metastásico, siempre como señal de cribado y no como diagnóstico.
- Experimentación metodológica: reproducir el flujo de normalización de maquetación y mezcla de frases de fondo entre clases para tareas de clasificación de secciones específicas de informes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que, en el conjunto de validación sintético, el umbral con precisión mayor o igual a 0,95 es 0,000, un dato que el propio autor califica de indicativo y no extrapolable a datos reales.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (108 M de parámetros), más activaciones y overhead; en la práctica cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en fp16: aproximadamente 0,22 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son más que suficientes y permiten lotes grandes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: Hugging Face Transformers, Text Embedding Inference (TGI), ONNX Runtime; también es viable exportarlo a otros runtimes de inferencia de BERT.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bigzed24/radBERT_syn_21NOV | 108,3 M | 256 tokens | Clasificación binaria de fractura patológica en TC | MIT | Hugging Face |
| StanfordAIMI/RadBERT | no disponible | no disponible | Modelo base de dominio radiológico (encoder) | no disponible | Hugging Face |
| BERT-base (referencia genérica) | 110 M | 512 tokens | Clasificación de texto general | Apache 2.0 | Hugging Face |

La comparación con alternativas específicas para esta misma tarea no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos: el rendimiento sobre informes reales no está validado y puede degradarse de forma significativa.
- El umbral operativo debe fijarse con informes reales etiquetados por radiólogos; el valor indicado en la model card (0,000) no es trasladable a producción.
- No apto para toma de decisiones clínicas; su uso previsto es el cribado de investigación.
- Dominio muy restringido: solo la sección "BONES AND SOFT TISSUES" de informes de TC en el contexto de seguimiento de cáncer de próstata y mama metastásico.
- Solo inglés; no se documenta soporte para otros idiomas.
- Riesgo de alucinación y de falsos positivos o negativos no cuantificado en datos reales.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia MIT, que permite uso comercial, pero el autor restringe explícitamente el uso clínico; conviene evaluar las implicaciones regulatorias antes de cualquier despliegue en producción sanitaria.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bigzed24/radBERT_syn_21NOV
- Modelo base StanfordAIMI/RadBERT: https://huggingface.co/StanfordAIMI/RadBERT
