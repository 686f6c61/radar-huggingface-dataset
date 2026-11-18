# braindecode/brainomni-base-pretrained

## Resumen

BrainOmni base pretrained es un modelo de representación de señales cerebrales desarrollado por el equipo de braindecode, que adapta los pesos del BrainOmni original publicado por OpenTSLab al ecosistema de la librería braindecode. Se trata de un transformer de 42,7 millones de parámetros diseñado para procesar de forma unificada registros de EEG y MEG, resolviendo el problema de la heterogeneidad de montajes, canales y sistemas de sensores en neuroimagen funcional. A diferencia de los modelos específicos por modalidad, BrainOmni emplea un tokenizador congelado que proyecta señales de distintos sensores a un espacio latente común, lo que permite transferir aprendizaje entre conjuntos de datos con configuraciones de electrodos muy distintas.

El modelo se distribuye como pesos preentrenados sin cabeza de clasificación funcional: la cabeza existe pero está inicializada de forma aleatoria con semilla fija, por lo que debe afinarse o usarse en modo linear probe antes de cualquier tarea supervisada. Esta orientación lo convierte en una base para investigación en decodificación cerebral, clasificación de estados cognitivos y extracción de características, más que en un modelo listo para producción.

Su relevancia actual radica en la consolidación de los foundation models para neuroimagen: entrena sobre más de veinte conjuntos de datos públicos de EEG y MEG (MEG-MASC, OMEGA, Cam-CAN, THINGS-MEG, entre otros), con licencia MIT y conversión verificada numéricamente contra la versión original de los autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador congelado y RoPE (rotary position embeddings) |
| Parametros totales | 42.692.072 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32 y bfloat16) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors, pytorch_model.bin |

## Arquitectura y entrenamiento

BrainOmni base emplea una arquitectura transformer con dimensión latente de 512, 16 cabezas de atención y 12 bloques, según la configuración indicada en la model card. La innovación principal es un tokenizador congelado que mapea señales de EEG y MEG de distintos sistemas de sensores (KIT 208 canales, CTF 275 canales, Elekta 306 canales, montajes EEG de 10-20) a un espacio de tokens común, permitiendo que un único modelo procese entradas heterogéneas sin reentrenamiento del tokenizador. La conversión a braindecode elimina el predictor de máscaras usado solo en preentrenamiento y almacena la caché RoPE como pares (cos, sin) con seno nulo, ya que la versión original de los autores solo contenía cosenos.

El preentrenamiento se realizó sobre más de veinte conjuntos de datos públicos, entre ellos MEG-MASC, Armeni2022, OMEGA, Cam-CAN, THINGS-MEG, HBN, SMN4Lang y múltiples accesos de OpenNeuro/NEMAR en modalidad EEG y MEG. La model card no detalla el número total de tokens ni la composición exacta del dataset, ni confirma el uso de RLHF o DPO. La entrada se espera a 256 Hz con el preprocesamiento del código original de los autores.

## Capacidades

- Extracción de representaciones latentes de señales EEG y MEG para tareas posteriores de clasificación o regresión.
- Procesamiento unificado de distintas modalidades y montajes gracias al tokenizador congelado.
- Soporte de metadatos de sensores: posiciones de electrodos para EEG y orientaciones de bobina para MEG mediante `chs_info`.
- Adaptación mediante fine-tuning o linear probe de la cabeza de clasificación (no preentrenada).
- No es un modelo generativo de texto: no soporta tool calling, function calling, agentes ni razonamiento multi-step.
- Sin capacidades multilingües, de visión ni de audio en el sentido convencional.
- No dispone de modo thinking ni decodificación especulativa.

## Casos de uso

- Decodificación de estados cognitivos: usar las representaciones del modelo como features para clasificar estados de reposo, tareas cognitivas o condiciones experimentales, aprovechando el preentrenamiento sobre Cam-CAN y RestCog.
- Detección de anomalías epilépticas: afinar la cabeza de clasificación sobre registros pediátricos como HFO (on003555) para identificar descargas de alta frecuencia, con la ventaja de partir de representaciones ya entrenadas en EEG clínico.
- Análisis de respuesta auditiva y lingüística: emplear el modelo sobre MEG de reconocimiento de palabras (ASWR-MEG, SMN4Lang) para estudiar la dinámica temporal del procesamiento del lenguaje.
- Clasificación de imágenes mentales: adaptar el modelo a THINGS-MEG para decodificar categorías visuales a partir de la actividad MEG evocado.
- Investigación en envejecimiento cerebral: usar Cam-CAN como base para tareas de regresión de edad o cognición, beneficiándose del preentrenamiento sobre aproximadamente 700 sujetos.
- Transferencia entre modalidades: aprovechar el tokenizador común para entrenar en EEG y evaluar en MEG (o viceversa) en estudios con cohortes pequeñas, reduciendo la necesidad de datos etiquetados.
- Prototipado en pipelines BCI: integrar el modelo en braindecode para experimentar con interfaces cerebro-computadora, usando linear probe para iterar rápidamente sobre nuevas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en float32 (42,7 M de parámetros) y alrededor de 0,1 GB en bfloat16, sin contar activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 y H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: integración nativa con braindecode (`BrainOmni.from_pretrained`), PyTorch estándar y safetensors; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BrainOmni base (braindecode) | 42,7 M | no disponible | EEG y MEG | MIT | Hugging Face |
| BrainOmni original (OpenTSLab) | no disponible | no disponible | EEG y MEG | MIT | Hugging Face |
| Otros modelos de braindecode | no disponible | no disponible | EEG | no disponible | braindecode |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La cabeza de clasificación no está preentrenada: requiere fine-tuning o linear probe antes de cualquier uso supervisado.
- La model card no documenta sesgos demográficos ni de adquisición; los conjuntos de datos de origen pueden sobrerrepresentar determinadas poblaciones y sistemas de sensores.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de sobreajuste o predicciones no calibradas en tareas fuera de la distribución de preentrenamiento.
- Requiere `chs_info` con posiciones de sensores reales; la configuración por defecto (19 canales EEG 10-20) es solo un valor por defecto y puede degradar el rendimiento si no coincide con la entrada.
- Entrada esperada a 256 Hz con el preprocesamiento del código original; desviaciones pueden invalidar las representaciones.
- Licencia MIT permite uso comercial, pero la procedencia de los datos de entrenamiento (múltiples conjuntos públicos con licencias propias) debe revisarse para aplicaciones clínicas o comerciales.
- Requiere una versión de braindecode superior a 1.8.1.
- No apto para uso clínico directo sin validación regulatoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/braindecode/brainomni-base-pretrained
- Modelo original de los autores: https://huggingface.co/OpenTSLab/BrainOmni
- Documentación de braindecode para BrainOmni: https://braindecode.org/stable/generated/braindecode.models.BrainOmni.html
- Paper (arXiv 2505.18185): https://arxiv.org/abs/2505.18185
- NEMAR: https://nemar.org
- MEG-MASC: https://osf.io/ag3kj/
- OMEGA: https://www.mcgill.ca/bic/resources/omega
- Cam-CAN: https://cam-can.mrc-cbu.cam.ac.uk/dataset/
- Armeni2022: https://data.ru.nl/collections/di/dccn/DSC_3011085.05_995
