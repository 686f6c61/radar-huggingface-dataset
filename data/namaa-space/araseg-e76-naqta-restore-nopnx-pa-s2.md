# NAMAA-Space/araseg-e76-naqta-restore-nopnx-pa-s2

## Resumen

`NAMAA-Space/araseg-e76-naqta-restore-nopnx-pa-s2` es un modelo de segmentación de texto en árabe desarrollado por NAMAA Community para la tarea compartida AraSeg 2026 (ArabicNLP 2026), en la subtarea NoPnx-PA. Se trata de un ajuste fino completo (560M parámetros, *full fine-tune*) sobre el encoder `FacebookAI/xlm-roberta-large`, orientado a clasificación de tokens: el modelo emite probabilidades de frontera por palabra en lugar de texto generado.

Su relevancia es acotada y muy específica: no es un segmentador autónomo, sino un votante dentro de un sistema de ensemble. Concretamente, participa como uno de los ocho miembros de un decodificador estructural MEMM ajustado con predicciones *out-of-fold* (OOF), con un peso de decodificador de +0,0727 y un umbral de sistema de 0,46. Una particularidad operativa importante es que requiere Naqta (inserción de comas predichas, `min_p=0.3`, `comma=','`) también en inferencia, no solo durante el entrenamiento.

El sistema completo del que forma parte reporta 87,82 de macro-F1 en el *practice test* y 89,9 en el conjunto ciego. Esas cifras corresponden al ensemble, no a este miembro de forma aislada: usado por separado no reproduce ninguna puntuación publicada. El repositorio ocupa 2,2 GB y el modelo se distribuye bajo licencia MIT heredada del modelo base, únicamente en árabe y sin versiones cuantizadas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) con cabeza de clasificación de tokens, integrado como miembro de un decodificador estructural MEMM sobre 8 miembros |
| Parametros totales | 560M (ajuste fino completo) |
| Longitud de contexto | 512 tokens (límite del modelo base XLM-RoBERTa-large) |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, GPTQ ni AWQ; solo el `state_dict` en PyTorch) |
| Idiomas soportados | árabe (ar) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | PyTorch `state_dict` (`best_NoPnx_PA.pt`); no es un checkpoint en formato HuggingFace, no hay safetensors ni GGUF |
| Modelo base | FacebookAI/xlm-roberta-large |
| Tarea / pipeline | token-classification (segmentación de texto árabe) |
| Subtarea | NoPnx-PA |
| Rol en el sistema | Miembro de un decodificador MEMM ajustado con OOF sobre 8 miembros |
| Peso de decodificador | +0,0727 |
| Umbral del sistema | 0,46 |
| Dependencia de inferencia | Naqta obligatorio en inferencia (`min_p=0.3`, `comma=','`) |
| Tamano del repositorio | 2,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es XLM-RoBERTa-large, un transformer encoder de 560M parámetros preentrenado de forma multilingüe, reutilizado aquí mediante ajuste fino completo sobre texto árabe. Sobre esa base se añade una cabeza de clasificación de tokens que produce, por palabra, una probabilidad de frontera. El modelo se entrenó sobre texto en el que se habían insertado comas predichas por Naqta, y esa misma transformación debe aplicarse en el momento de la inferencia; omitirla altera la distribución de entrada respecto a la vista en entrenamiento.

La innovación técnica no está en el miembro individual, sino en el sistema que lo envuelve: un decodificador estructural MEMM ajustado con predicciones *out-of-fold* que combina ocho miembros con pesos y umbral calibrados (umbral 0,46 en el sistema, peso +0,0727 para este miembro). No se documentan en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; tampoco se detalla el esquema de atención o posibles variantes de decodificación. El modelo card indica que los pesos son un `state_dict` desnudo: `from_pretrained` no funciona y la arquitectura debe construirse a partir del YAML de configuración del experimento y del modelo base antes de cargar los pesos. Los cinco miembros con LoRA del ensemble requieren `transformers==5.12.1`, con el *stack* completo fijado en `requirements-llm.txt` del repositorio de código.

## Capacidades

- Clasificación de tokens para segmentación de texto árabe: emite probabilidades de frontera por palabra (sin calibrar), no texto generado.
- Detección de límites de palabra en texto con comas Naqta insertadas previamente.
- Votación dentro de un ensemble: aporta una señal parcial que el decodificador MEMM combina con otros siete miembros.
- Procesamiento de secuencias de hasta 512 tokens, adecuado para trabajar a nivel de frase o párrafo corto.
- Integración en un pipeline que requiere preprocesado Naqta obligatorio en inferencia (`min_p=0.3`, `comma=','`).
- No dispone de *tool calling*, *function calling*, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de razonamiento explícito.
- No es un modelo multilingüe en la práctica: aunque el modelo base lo sea, el ajuste y el uso declarado se limitan al árabe.
- No es un modelo conversacional ni genera respuestas en lenguaje natural.

## Casos de uso

- Preprocesado para pipelines de PNL árabe: el modelo actúa como uno de los votantes que deciden las fronteras de palabra antes de alimentar analizadores morfológicos, etiquetadores de PoS o parsers. Su utilidad real aparece integrado en el sistema completo, no de forma aislada.
- Segmentación para motores de búsqueda e indexación: dividir texto árabe en unidades coherentes mejora la coincidencia de términos en índices invertidos, especialmente cuando el texto de origen no tiene separadores fiables.
- Reproducción de resultados de la tarea compartida AraSeg 2026: investigadores que quieran replicar exactamente el sistema NoPnx-PA necesitan este miembro junto con los otros siete, los pesos del combinador y el umbral 0,46.
- Investigación en combinación de modelos: sirve como caso de estudio de decodificación estructural MEMM ajustada con OOF sobre un ensemble heterogéneo de ocho miembros.
- Limpieza de corpus para entrenamiento: la segmentación consistente de grandes corpus árabes (por ejemplo, textos históricos o prensa digitalizada) es un paso previo habitual antes de entrenar modelos propios.
- Postprocesado de OCR y transcripción de voz: los textos extraídos de OCR o ASR en árabe suelen carecer de límites de palabra fiables; este modelo puede aportar señal de frontera dentro de un sistema mayor.
- Extracción de información y *entity matching*: una segmentación estable reduce falsos negativos al comparar cadenas árabes con variantes de escritura.
- Evaluación comparativa de segmentadores: útil como referencia interna frente a otros miembros del ensemble o frente a enfoques alternativos, siempre midiendo a nivel de sistema.

## Benchmarks y rendimiento

Los únicos resultados disponibles son a nivel de sistema, no del miembro aislado. El modelo card advierte explícitamente de que este miembro, usado solo, no reproduce ninguna puntuación publicada.

| Metrica | Conjunto | Resultado | Ambito |
|---|---|---|---|
| macro-F1 | practice test | 87,82 | Sistema completo NoPnx-PA (8 miembros + MEMM) |
| macro-F1 | blind test | 89,9 | Sistema completo NoPnx-PA (8 miembros + MEMM) |

No se han publicado resultados de benchmarks por miembro (MMLU, HumanEval, GSM8K u otros) en la información disponible; además, esas métricas no son aplicables a un modelo de clasificación de tokens para segmentación. Tampoco hay desglose por subconjunto, por género textual ni comparación con sistemas de otros equipos.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,1-1,2 GB solo en pesos si se carga en FP16, y unos 2,2 GB en FP32 (coherente con el tamaño del repositorio). Con *batches* pequeños y activaciones, el consumo realista se sitúa en el rango de 2-4 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente. Una RTX 3050, RTX 3060, RTX 4090 o RTX 5090 lo ejecutan sin problema; A100 y H100 son sobredimensionadas para este tamaño de modelo y solo tendrían sentido para procesar grandes volúmenes en paralelo.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en prácticamente cualquier GPU de consumo moderna, e incluso en iGPU con memoria compartida suficiente si se acepta mayor latencia.
- Ejecución en CPU: viable, dado el tamaño del modelo, aunque con menor *throughput*.
- Opciones de despliegue: no está soportado de forma nativa por vLLM, TGI, Ollama ni llama.cpp, porque los pesos son un `state_dict` de PyTorch y no un checkpoint en formato HuggingFace. Para usar esos servidores habría que reconstruir la arquitectura y exportar el modelo a formato HF (y, si se desea, a safetensors o GGUF). El camino documentado es cargar el `state_dict` con `torch.load` tras construir el modelo desde el YAML de configuración del experimento.
- Latencia y throughput estimados: no disponible en la información proporcionada.
- Dependencias: el *stack* fijado está en `requirements-llm.txt` del repositorio de código; los miembros con LoRA del ensemble necesitan `transformers==5.12.1`.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros sistemas participantes en AraSeg 2026 ni de segmentadores árabes alternativos en la información proporcionada. La única referencia documentada es el modelo base.

| Modelo | Parametros | Contexto | Tarea | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| araseg-e76-naqta-restore-nopnx-pa-s2 | 560M | 512 tokens | Segmentación árabe (miembro de ensemble) | No evaluable de forma aislada; sistema completo: 87,82 / 89,9 macro-F1 | MIT | HuggingFace, `state_dict` `.pt` |
| FacebookAI/xlm-roberta-large | 560M | 512 tokens | Encoder multilingüe genérico | No aplica (sin ajuste para segmentación) | MIT | HuggingFace, safetensors |
| Sistema NAMAA araseg-2026 (ensemble completo) | No disponible | 512 tokens por miembro | Segmentación árabe (NoPnx-PA) | 87,82 / 89,9 macro-F1 | MIT (según miembros) | Colección en HuggingFace y código en GitHub |
| Otros segmentadores árabes (Farasa, CAMeL Tools, sistemas de otros equipos en AraSeg 2026) | No disponible | No disponible | Segmentación / morfología árabe | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un segmentador autónomo: es un votante dentro de un ensemble de ocho miembros. Usado solo no reproduce ninguna puntuación publicada y produce probabilidades de frontera sin calibrar.
- Requiere Naqta en inferencia, no solo en entrenamiento. Omitir la inserción de comas predichas (`min_p=0.3`, `comma=','`) desvía la entrada de la distribución vista durante el ajuste.
- `from_pretrained` no funciona: el archivo es un `state_dict` desnudo. Hay que construir la arquitectura desde el YAML de configuración del experimento y el modelo base antes de cargar los pesos, lo que añade fragilidad al despliegue y complica la integración con servidores de inferencia estándar.
- Atado a umbral y pesos concretos: el sistema usa umbral 0,46 y un peso de decodificador de +0,0727 para este miembro. Cambiar cualquiera de los dos altera el comportamiento del conjunto.
- Dependencia de versiones: el ensemble requiere un *stack* fijado (`requirements-llm.txt`) y los miembros con LoRA necesitan `transformers==5.12.1`; discrepancias de versión pueden impedir instanciar las clases base.
- Idioma único: solo árabe. No hay evidencia de generalización a otras lenguas pese a que el modelo base sea multilingüe.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí hay riesgo de fronteras de segmentación incorrectas en dominios alejados del entrenamiento (dialectos, texto sin diacríticos, dominios especializados) y no se documentan métricas por dominio.
- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgo ni de cobertura dialectal.
- Sin validación comunitaria: el repositorio acumula 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de uso en producción.
- Licencia MIT heredada del modelo base, lo que en principio permite uso comercial, pero conviene verificar las condiciones de los componentes del ensemble y del preprocesado Naqta, que se distribuyen por separado.
- Trazabilidad: el modelo fue creado y actualizado el 12 de septiembre de 2026, con un intervalo de apenas 35 minutos entre ambas marcas; el rigor de la validación externa es, por tanto, limitado.
- Ausencia de datos de latencia, *throughput* y consumo energético, lo que dificulta planificar capacidad en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NAMAA-Space/araseg-e76-naqta-restore-nopnx-pa-s2
- Colección del sistema AraSeg 2026 de NAMAA: https://huggingface.co/collections/NAMAA-Space/namaa-community-araseg-2026
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Repositorio de código, configuraciones y mapa miembro-subtarea: https://github.com/NAMAA-ORG/NAMAA-Community-AraSeg-2026
- Cita del sistema: NAMAA Community, "NAMAA at Arabic Segmentation Shared Task 2026", Proceedings of ArabicNLP 2026.
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo, la tarea AraSeg 2026 ni el sistema NoPnx-PA; los resultados obtenidos correspondían a foros no relacionados.
