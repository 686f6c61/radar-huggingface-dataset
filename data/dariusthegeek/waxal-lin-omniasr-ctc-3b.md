# DariusTheGeek/waxal-lin-omniasr-ctc-3b

## Resumen

El modelo `waxal-lin-omniasr-ctc-3b` es un checkpoint de reconocimiento automático del habla (ASR) desarrollado por DariusTheGeek (Darius Moruri) como parte de la solución WAXAL ASR, un sistema de transcripción para lenguas africanas. Se trata de un fine-tuning del modelo base `facebook/omniASR-CTC-3B-v2` de Meta AI, especializado exclusivamente en lingala (código ISO `ln`). El modelo se ha entrenado sobre el subconjunto supervisado de lingala del dataset `google/WaxalNLP` y se distribuye bajo licencia Apache-2.0.

El checkpoint pesa 12,3 GB en formato `.pt` (PyTorch), lo que sugiere aproximadamente 3 mil millones de parámetros (3B) en precisión FP32, coherente con la nomenclatura del modelo base. Está diseñado como un componente de un conjunto (ensemble) más amplio: la documentación indica que no debe usarse de forma aislada, sino integrado en el pipeline de decodificación, fusión y post-procesamiento del repositorio WAXAL ASR. La decodificación se realiza con estrategia *greedy* y el artefacto publicado corresponde al promedio de los tres mejores parámetros en FP64.

La relevancia de este modelo radica en su contribución al avance de sistemas ASR para lenguas de bajos recursos como el lingala, hablado principalmente en la República Democrática del Congo y la República del Congo. Al ser un fine-tuning de un modelo multilingüe, aprovecha el conocimiento previo de OmniASR y lo adapta a un idioma específico, demostrando que la especialización mediante fine-tuning puede superar a los modelos cero disparos en tareas de ASR africano.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Desconocida (basada en `facebook/omniASR-CTC-3B-v2`, que emplea capas de conexión temporal (CTC) para ASR; el backbone específico —transformer, conformer, etc.— no está documentado) |
| Parametros totales | ~3B (inferido del nombre del modelo base; no confirmado explícitamente) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles (solo checkpoint original en FP32/FP64) |
| Idiomas soportados | Lingala (`ln`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la documentación proporcionada. El nombre `omniASR-CTC-3B-v2` indica que se trata de un modelo de 3B parámetros que utiliza una cabeza de clasificación temporal conexionista (CTC) para el reconocimiento de voz, típica de modelos ASR que alinean secuencias de audio con texto sin necesidad de un decodificador autoregresivo. El modelo base es un desarrollo de Meta AI (Facebook) para ASR multilingüe, aunque los detalles de su backbone (si es transformer, conformer, etc.) no se especifican en la ficha del repositorio.

El entrenamiento de este checkpoint consistió en un fine-tuning supervisado sobre el subconjunto de lingala del dataset `google/WaxalNLP`, que incluye datos de habla y transcripciones. Se utilizó una semilla fija (seed 42) para la reproducibilidad. No se menciona el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas de alineación como RLHF o DPO. El artefacto publicado corresponde al promedio de los tres mejores conjuntos de parámetros en FP64, una técnica de ensamblado de pesos que suele mejorar la robustez frente al sobreajuste.

## Capacidades

- Transcripción de voz a texto en lingala: el modelo convierte audio hablado en texto escrito, con decodificación *greedy*.
- Reconocimiento de habla continua: puede procesar frases completas, no solo palabras aisladas, gracias a la naturaleza de los modelos CTC.
- Integración en pipelines de ASR: está diseñado para ser un miembro de un ensemble más grande, participando en esquemas de fusión como ROVER (RObust VOCabulary Error Reduction).
- Compatibilidad con el ecosistema fairseq2: se carga mediante la librería `fairseq2` y el asset card `card.yaml`, lo que permite su uso en entornos que ya emplean esta infraestructura.
- No dispone de capacidades adicionales como *tool calling*, razonamiento multimodal, generación de código o modo *thinking*. Su función es exclusivamente la transcripción de audio.

## Casos de uso

- Transcripción de reuniones y conferencias en lingala: el modelo puede convertir grabaciones de audio de reuniones en texto, facilitando la documentación y el análisis posterior. Su integración en un ensemble permite mejorar la precisión en entornos con ruido o múltiples hablantes.
- Subtitulado automático de vídeos: aplicado a contenido audiovisual en lingala (noticias, entrevistas, material educativo), genera subtítulos que aumentan la accesibilidad para personas con discapacidad auditiva o para audiencias que prefieren leer.
- Archivo y búsqueda de contenido oral: al transcribir grabaciones históricas o entrevistas, se crean índices textuales que permiten búsquedas por palabras clave, facilitando la investigación en ciencias sociales o lingüística.
- Asistencia a la traducción: las transcripciones generadas pueden servir como entrada para sistemas de traducción automática, habilitando la traducción de contenido oral en lingala a otros idiomas.
- Desarrollo de asistentes de voz en lingala: aunque el modelo solo produce texto, puede integrarse en un sistema más amplio que incluya síntesis de voz o diálogo, permitiendo interacciones habladas en este idioma.
- Evaluación comparativa de sistemas ASR: al ser un modelo de referencia para lingala, puede utilizarse como punto de partida para comparar otras arquitecturas o técnicas de fine-tuning en lenguas africanas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como WER (Word Error Rate) ni comparaciones con otros sistemas. Se recomienda consultar el repositorio de la solución WAXAL ASR o el sitio WAXALNet para posibles evaluaciones externas, aunque no se garantiza su disponibilidad.

## Requisitos de hardware

- Peso del checkpoint: 12,3 GB, lo que implica al menos 12 GB de VRAM para cargar los pesos en FP32. En la práctica, se recomienda una GPU con 16 GB o más para dejar margen para el procesamiento de audio y la activación de la red.
- GPU recomendadas: NVIDIA T4 (16 GB), V100 (16/32 GB), RTX 4090 (24 GB), A100 (40/80 GB) o superiores. El modelo puede ejecutarse en GPUs de consumo como la RTX 4090, pero no en tarjetas con menos de 12 GB (p. ej., RTX 3060 de 12 GB justo al límite, sin espacio para el procesamiento).
- No se han publicado cuantizaciones (GGUF, AWQ, GPTQ), por lo que no es posible reducir los requisitos de VRAM mediante formatos comprimidos. El despliegue en CPU es inviable para inferencia en tiempo real.
- Opciones de despliegue: el repositorio de la solución WAXAL ASR proporciona un CLI con entorno pinneado (`env/requirements-omni.txt`) y scripts de decodificación. También puede cargarse directamente con `fairseq2` usando el asset card.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño del modelo (~3B parámetros) y el uso de decodificación *greedy*, se espera una latencia moderada en GPU, pero sin datos concretos no es posible estimar un valor fiable.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es un fine-tuning especializado en lingala, y aunque existen otros sistemas ASR para lenguas africanas (por ejemplo, modelos de Whisper fine-tuneados, o los listados en WAXALNet), no se han encontrado datos públicos que permitan una comparación cuantitativa con este checkpoint concreto. Se recomienda consultar el benchmark WAXALNet para una visión general de modelos ASR en lenguas africanas, pero no se incluyen aquí resultados específicos.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para lingala y no debe usarse para otros idiomas; su rendimiento fuera de este idioma será nulo o muy pobre.
- No es un modelo autónomo: la documentación indica explícitamente que es un componente de un ensemble y que no debe utilizarse de forma aislada. Su integración requiere el pipeline completo de la solución WAXAL ASR (routing, decodificación, fusión, post-procesamiento).
- No se han publicado métricas de rendimiento (WER, etc.), por lo que no hay evidencia cuantitativa de su calidad en tareas reales. Los usuarios deben validar su comportamiento en sus propios conjuntos de datos.
- Riesgo de alucinación o errores de transcripción, especialmente en audio con ruido, acentos no representados en el dataset de entrenamiento o habla superpuesta. El dataset `google/WaxalNLP` puede tener sesgos geográficos o demográficos que afecten la generalización.
- El checkpoint está en formato `.pt` de PyTorch, sin cuantizaciones oficiales. Esto limita su despliegue en entornos con restricciones de memoria o en dispositivos de borde.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base (`facebook/omniASR-CTC-3B-v2`) también tenga una licencia compatible; según la model card, la licencia se hereda del modelo base, que es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- No se proporciona información sobre el contexto de audio máximo procesable (duración de la ventana), lo que puede limitar su uso en grabaciones largas sin segmentación previa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/DariusTheGeek/waxal-lin-omniasr-ctc-3b)
- [Repositorio de la solución WAXAL ASR](https://github.com/DariusTheGeek/waxal-asr-solution)
- [Perfil del autor en GitHub](https://github.com/DariusTheGeek/)
- [Benchmark WAXALNet](https://waxalnet.vercel.app/)
- [Dataset google/WaxalNLP](https://huggingface.co/datasets/google/WaxalNLP)
- [Modelo base facebook/omniASR-CTC-3B-v2](https://huggingface.co/facebook/omniASR-CTC-3B-v2)
- [Notebook Colab de referencia para OmniASR](https://colab.research.google.com/github/NeuralFalconYT/omnilingual-asr-colab/blob/main/Meta_Omnilingual_ASR.ipynb)
