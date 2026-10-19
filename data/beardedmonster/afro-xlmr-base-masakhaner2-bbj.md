# BeardedMonster/afro-xlmr-base-masakhaner2-bbj

## Resumen

`BeardedMonster/afro-xlmr-base-masakhaner2-bbj` es un checkpoint de reconocimiento de entidades nombradas (NER) obtenido por ajuste fino de `Davlan/afro-xlmr-base` sobre el subconjunto **bbj** del corpus MasakhaNER 2.0. El autor es `BeardedMonster`, un perfil que publica resultados de un arnés de evaluación propio orientado a reproducir los baselines de MasakhaNER 2.0 para lenguas africanas. El modelo resuelve una tarea muy concreta: etiquetar secuencias (token classification) con las categorías de entidad del corpus en ghomálá' (bbj), una lengua bantú de Camerún.

Arquitectónicamente es un transformer encoder-only de 12 capas derivado de XLM-RoBERTa, con 277.459.977 parámetros totales (sin capas MoE, por tanto sin parámetros activos distintos del total) y una ventana posicional de 514 posiciones heredada de XLM-R. No es un modelo generativo ni conversacional: no hay decodificación de texto, ni tool calling, ni modo razonamiento; su salida es una etiqueta BIO por token.

Su relevancia es acotada pero real: cubre una lengua con recursos digitales muy escasos y publica un `span_f1` medio de 0,7356 con ajustes reproducibles (50 épocas, lr 5e-5, batch 32, longitud máxima 256), lo que lo convierte en una línea base útil para NER en ghomálá' y en un ejemplo de pipeline de bajo coste (278 M de parámetros, inferencia en CPU o GPU de consumo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (XLM-RoBERTa base), 12 capas, 768 de dimensión oculta, 12 cabezas de atención; cabeza de token classification sobre AfroXLMR |
| Parametros totales | 277.459.977 (según safetensors del repo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 514 posiciones (heredada de XLM-R); longitud máxima de entrenamiento: 256 tokens |
| Tipos de cuantizacion | No se publican ficheros cuantizados (sin GGUF ni GPTQ en el repo); al ser un encoder de 278 M es viable cuantización dinámica int8 en PyTorch/ONNX y exportación a ONNX Runtime u OpenVINO |
| Idiomas soportados | Ajuste fino solo para `bbj` (ghomálá'); el modelo base AfroXLMR está adaptado a lenguas africanas |
| Licencia | No disponible en la ficha; la model card remite explícitamente a la licencia y términos de `Davlan/afro-xlmr-base` |
| Formato de pesos | `safetensors` (repo de 2,2 GB, compatible con `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `Davlan/afro-xlmr-base`, un XLM-RoBERTa base sometido a ajuste adaptativo multilingüe sobre lenguas africanas. La arquitectura es la de XLM-R base: 12 capas de self-attention completa, 768 dimensiones ocultas, 12 cabezas, vocabulario SentencePiece de ~250k tokens y embeddings posicionales aprendidos hasta la posición 514. Sobre ese cuerpo se añade una cabeza lineal de clasificación por token (`AutoModelForTokenClassification`) con `id2label` poblado, de modo que las predicciones se decodifican directamente a nombres de etiqueta.

El entrenamiento es un ajuste fino supervisado estándar de NER: 50 épocas, learning rate 5e-5, batch size 32, longitud máxima de secuencia 256 y `span_f1` como métrica de selección. No hay RLHF, DPO ni preferencias humanas; es aprendizaje supervisado token a token con las anotaciones del protocolo bbj de MasakhaNER 2.0 (etiquetas de tipo persona, organización, localización y fecha en formato BIO). El autor advierte de dos caveats metodológicos: los resultados provienen de una **única ejecución** (los papers de referencia promedian 5 semillas, por lo que diferencias pequeñas deben tratarse como ruido) y el arnés reproduce los baselines publicados de MasakhaNER 2.0 con una tolerancia de ~0,25 F1, lo que da calibración al número pero no lo convierte en una comparación directa con la literatura.

## Capacidades

- Reconocimiento de entidades nombradas en ghomálá' (bbj): etiquetado BIO por token de persona, organización, localización y fecha, según el esquema de MasakhaNER 2.0.
- Clasificación de secuencias a nivel de token con `id2label` configurado, lista para `pipeline("token-classification")` de `transformers`.
- Extracción de entidades para indexación, anonimización o enriquecimiento de corpus en una lengua de bajos recursos.
- Representaciones contextuales multilingües aprovechables para *features* o ajuste posterior en tareas relacionadas (POS, chunking), heredadas del modelo base.
- No soporta generación de texto, razonamiento multi-paso, tool calling, agentes, visión, audio ni modo *thinking*: es un encoder discriminativo.
- Capacidad multilingüe limitada en la práctica: el ajuste fino solo se ha validado en bbj; el comportamiento en otras lenguas africanas del modelo base no está evaluado en esta ficha.

## Casos de uso

- Extracción de entidades en corpus periodísticos o humanitarios en ghomálá': pasar texto a `pipeline("token-classification")` con truncación a 256 tokens y agregar las entidades por documento para construir índices de personas y lugares.
- Anonimización de datos personales antes de publicar un corpus: la etiqueta de persona permite enmascarar nombres en textos recogidos en Camerún con una pasada de inferencia barata (278 M de parámetros).
- Construcción de un gazetteer de topónimos y organizaciones en bbj: procesar un archivo de noticias y volcar las menciones de localización a una base de datos para desambiguación posterior.
- Etiquetado asistido (human-in-the-loop) para ampliar el corpus MasakhaNER 2.0: preanotar con el modelo y corregir manualmente, reduciendo el coste de anotación en una lengua sin herramientas comerciales.
- Monitorización de menciones en redes sociales o foros: detectar organizaciones y localizaciones en publicaciones en ghomálá' para alertas temáticas o análisis de discurso.
- Línea base de investigación: punto de partida reproducible para comparar variantes (AfroXLMR-large, mBERT, modelos adaptados con adaptadores) en NER de bajos recursos, con la configuración de entrenamiento documentada.
- Servicio de extracción en el borde (edge): al caber en CPU y en GPUs de consumo, puede desplegarse en un contenedor pequeño con ONNX Runtime para procesamiento por lotes nocturno.

## Benchmarks y rendimiento

| Benchmark | Idioma | Métrica | Resultado | Notas |
|---|---|---|---|---|
| MasakhaNER 2.0 | bbj | span_f1 (media) | 0,7356 | Ejecución única; desglose por lengua en `metrics.json` del repo |

No se han publicado resultados de benchmarks en la información disponible para otras tareas (MMLU, HumanEval, GSM8K no aplican a un encoder de NER) ni comparaciones numéricas con baselines en la información proporcionada. El autor indica que su arnés reproduce los baselines publicados de MasakhaNER 2.0 con una tolerancia de ~0,25 F1, pero no se incluyen aquí esos valores de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,1 GB en fp32, ~0,55 GB en fp16/bf16 y ~0,28 GB en int8 (solo pesos; añadir activaciones y batch).
- GPU recomendadas: cualquier GPU con ≥2 GB de VRAM; NVIDIA T4, L4, RTX 3060/4090, A10 o A100 son sobredimensionadas para el modelo y solo se justifican por volumen de peticiones.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 3050, RTX 4060) e incluso en CPU para lotes pequeños: 278 M de parámetros y secuencias de 256 tokens.
- Opciones de despliegue: `transformers` (PyTorch) como vía directa; exportación a ONNX Runtime, OpenVINO o TorchScript para CPU; `vLLM` y `TGI` no aplican (no es un modelo generativo autorregresivo); `llama.cpp`/Ollama solo si se convierte a GGUF, lo que no está publicado.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones en la información proporcionada).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BeardedMonster/afro-xlmr-base-masakhaner2-bbj | 277,5 M | 514 posiciones (entreno a 256) | NER en bbj (MasakhaNER 2.0) | No disponible (hereda la del base) | HuggingFace, safetensors |
| Davlan/afro-xlmr-base | ~278 M | 514 posiciones | Modelo base sin cabeza de NER; requiere ajuste | No disponible en esta ficha | HuggingFace |
| Davlan/afro-xlmr-large | ~560 M (no verificado en esta ficha) | 514 posiciones | Modelo base; habitualmente mejor F1 tras ajuste | No disponible en esta ficha | HuggingFace |
| xlm-roberta-base | ~278 M | 514 posiciones | Modelo base multilingüe, sin adaptación específica a lenguas africanas | MIT según su model card (verificar) | HuggingFace |

No hay datos de rendimiento comparado disponibles en la información proporcionada; la comparación anterior se limita a tamaño, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un modelo discriminativo de NER: no genera texto, no razona, no soporta instrucciones ni herramientas. Cualquier uso conversacional es un error de encuadre.
- Sesgos y cobertura: el ajuste se ha hecho sobre un único corpus y una única lengua (bbj); el dominio y el registro del corpus condicionan las entidades reconocibles y el modelo puede fallar ante variantes ortográficas o dialectales.
- Riesgo de alucinación en sentido estricto bajo (no genera), pero sí de falsos positivos y fronteras de entidad incorrectas, especialmente en textos largos truncados a 256 tokens; las entidades que cruzan el corte se pierden.
- Limitación de contexto: 514 posiciones en el modelo base y truncación a 256 durante el entrenamiento; para documentos largos hay que trocear con solapamiento y agregar después.
- Licencia: no disponible en la ficha. El autor remite a la licencia y términos de `Davlan/afro-xlmr-base`; antes de un uso comercial hay que verificar esa licencia, que no se documenta aquí.
- Reproducibilidad: los resultados provienen de una sola ejecución y el propio autor advierte de que diferencias pequeñas frente a otros modelos deben considerarse ruido (los baselines promedian 5 semillas).
- Madurez: 14 descargas y 0 likes en el momento de la consulta; no hay pipeline declarado ni validación externa, por lo que conviene tratarlo como checkpoint de investigación, no como servicio en producción.
- El repositorio ocupa 2,2 GB, muy por encima de los ~1,1 GB de pesos fp32, lo que sugiere artefactos de entrenamiento adicionales; conviene revisar qué ficheros se descargan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BeardedMonster/afro-xlmr-base-masakhaner2-bbj
- Modelo base: https://huggingface.co/Davlan/afro-xlmr-base
- Referencia del corpus: MasakhaNER 2.0, Adelani et al. (2022), "MasakhaNER 2.0: Africa-centric Transfer Learning for Named Entity Recognition" (arXiv:2210.12391; no verificado en esta búsqueda).
- Referencia del modelo base: Alabi et al. (2022), "Adapting Pre-trained Language Models to African Languages via Multilingual Adaptive Fine-Tuning" (arXiv:2204.06487; no verificado en esta búsqueda).
- Repositorio del proyecto MasakhaNER (datos y scripts de evaluación): https://github.com/masakhane-io/masakhane-ner (no verificado en esta búsqueda).
- Nota: la búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo; los enlaces anteriores proceden de los metadatos de HuggingFace y de referencias bibliográficas.
