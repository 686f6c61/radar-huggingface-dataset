# cyttic/hmt-trocrscratchreg-elastic1-s42

## Resumen

`cyttic/hmt-trocrscratchreg-elastic1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) entrenado por el grupo cyttic como parte de un estudio de aumentación de datos denominado `htr-metrics-transfer`. El modelo emplea una arquitectura TrOCR con cabecera CTC y fue entrenado desde cero (*scratch*) sobre el dataset `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo para evitar fuga de información.

El modelo está especializado en hebreo (`he`) y su propósito declarado es servir como punto de comparación dentro de un estudio sistemático sobre el efecto de distintas estrategias de aumentación. En concreto, esta variante corresponde a la aumentación `elastic1` con semilla 42. Con 22.421.004 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto orientado a investigación más que a despliegue en producción.

Su relevancia es metodológica: los resultados reportados (CER 0.4506 y WER 1.0622 sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje) sitúan el modelo en un régimen de error alto, lo que lo hace útil como referencia base en experimentos comparativos de HTR sobre hebreo manuscrito, no como solución lista para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (transformer encoder-decoder para reconocimiento de texto) con cabecera CTC |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema TrOCR, un transformer para reconocimiento óptico de caracteres que procesa imágenes de texto y genera la transcripción correspondiente. En esta variante el autor indica una cabecera CTC (`ctc`), lo que implica una decodificación por *Connectionist Temporal Classification* sobre las representaciones del encoder, sin necesidad de un decoder autorregresivo ni de un modelo de lenguaje externo en la inferencia evaluada.

El entrenamiento se realizó desde cero (*scratch*) sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, restando los escritores del conjunto de desarrollo, lo que busca evitar contaminación entre escritores de entrenamiento y evaluación. La variante corresponde a la aumentación `elastic1` con semilla 42 dentro del estudio `htr-metrics-transfer`. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición detallada del dataset ni de si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a HTR). Los detalles completos se remiten al `results.json` del repositorio.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de líneas o palabras.
- Decodificación CTC greedy, sin modelo de lenguaje acoplado.
- Entrenamiento desde cero, sin inicialización a partir de pesos preentrenados de TrOCR.
- Generación de transcripciones para evaluación con métricas CER y WER.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, visión general, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al hebreo según la etiqueta de idioma del repositorio.

## Casos de uso

- Investigación comparativa de aumentación de datos: el modelo sirve como una de las variantes del estudio `htr-metrics-transfer`, permitiendo comparar el efecto de `elastic1` frente a otras aumentaciones manteniendo fija la semilla 42 y la arquitectura.
- Reproducción de experimentos de HTR: al estar entrenado sobre `cyttic/hhd-optionb-split` con una separación explícita de escritores, permite reproducir la evaluación sobre HHD Option-B con métricas CER y WER.
- Establecimiento de líneas base en hebreo manuscrito: con CER 0.4506 y WER 1.0622, es útil como referencia inferior para medir la mejora de modelos posteriores sobre el mismo conjunto de test.
- Análisis de robustez a deformaciones geométricas: la aumentación `elastic1` (deformación elástica) permite estudiar cómo varía el error de reconocimiento cuando se introducen perturbaciones no rígidas en las imágenes de entrenamiento.
- Prototipado académico de pipelines OCR/HTR: por su tamaño compacto (22,4 M parámetros, 0,1 GB), puede cargarse en entornos de laboratorio con recursos limitados para iterar sobre preprocesado y decodificación CTC.
- Auditoría de fuga de escritores: la exclusión de los escritores de dev del conjunto de entrenamiento lo convierte en un artefacto adecuado para validar protocolos de partición por escritor en corpus manuscritos.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto | Configuracion |
|---|---|---|---|
| CER | 0.4506 | HHD Option-B test | Greedy decoding, sin LM |
| WER | 1.0622 | HHD Option-B test | Greedy decoding, sin LM |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo de HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 22,4 M parámetros en safetensors y un repositorio de 0,1 GB, la huella de pesos es de aproximadamente 0,09 GB en precisión original.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM debería poder alojar los pesos, aunque la VRAM real depende del tamaño de lote y de las imágenes de entrada.
- Compatibilidad con GPU de consumo: previsiblemente sí en tarjetas de consumo modernas (por ejemplo, RTX 3060, RTX 4090) dado el reducido número de parámetros, si bien el autor no lo documenta.
- Opciones de despliegue: no disponible; el repositorio no detalla compatibilidad con vLLM, llama.cpp, Ollama o TGI, y estos frameworks no están orientados por defecto a modelos TrOCR/CTC.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Rendimiento reportado |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchreg-elastic1-s42 | 22.421.004 | no disponible | he | MIT | CER 0.4506 / WER 1.0622 (HHD Option-B) |
| Otras variantes del estudio `htr-metrics-transfer` | no disponible | no disponible | he | no disponible | no disponible en esta ficha |
| TrOCR base (Microsoft) | no disponible en esta ficha | no disponible | en | MIT (según versión) | no disponible en esta ficha |

No se dispone en la información proporcionada de resultados de modelos comparables sobre el mismo conjunto de test, por lo que la comparación cuantitativa queda limitada a la variante descrita.

## Limitaciones y advertencias

- Rendimiento limitado: CER 0.4506 y WER 1.0622 indican un error de reconocimiento elevado, insuficiente para muchas aplicaciones de producción sin postprocesado o modelo de lenguaje.
- Evaluación sin LM: los resultados corresponden a decodificación greedy sin modelo de lenguaje, por lo que no reflejan el rendimiento que podría obtenerse acoplado a un LM.
- Cobertura lingüística restringida al hebreo; no se documenta soporte para otros idiomas.
- Modelo de investigación: forma parte de un estudio de aumentación y no está presentado como producto final.
- Riesgo de sesgo hacia los escritores presentes en el split de entrenamiento de `cyttic/hhd-optionb-split`; la exclusión de escritores de dev mitiga parte de la fuga, pero no garantiza generalización a escritores no vistos.
- Sin datos publicados sobre cuantización, contexto máximo ni latencia, lo que dificulta planificar un despliegue en producción.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del dataset de origen (`cyttic/hhd-optionb-split`) antes de explotar el modelo con datos derivados.
- Riesgo de alucinación: en HTR se manifiesta como sustituciones, inserciones y omisiones de caracteres; el WER superior a 1,0 sugiere que las inserciones son significativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchreg-elastic1-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` en el repositorio del modelo
- Paper TrOCR (referencia arquitectónica): https://arxiv.org/abs/2109.10282
- Repositorio oficial TrOCR (Microsoft): https://github.com/microsoft/unilm/tree/master/trocr
