# MarketStandard/panoptes-neural-v1

## Resumen

Panoptes Neural Detector v2.1 es un modelo de detección binaria de participación humana frente a máquina en prosa inglesa, desarrollado por MarketStandard como instrumento de prueba para el estudio de transportabilidad de evidencia Panoptes. No se trata de un detector de IA genérico, sino de un modelo calibrado sobre una población concreta, cuyo resultado solo tiene significado relativo a dicha población. Está construido sobre un encoder `microsoft/deberta-v3-small` procesado por ventanas de 512 tokens con solapamiento de 128, y se publica como un ensemble congelado de tres semillas (13, 42 y 87) con agregación jerárquica y calibración isotónica.

El modelo se entrenó sobre un pool de 35 856 filas procedentes de los conjuntos MAGE, RAID clean y DeFactify, todos con licencias que permiten el entrenamiento y la redistribución de pesos derivados. Su propósito declarado es servir como instrumento de evaluación en el estudio de transporte de evidencia, no como herramienta de uso general. La model card reporta métricas de desarrollo y calibración en una partición reservada, sin haber leído etiquetas de test final. El repositorio tiene un tamaño de 1,7 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer `microsoft/deberta-v3-small` con ventanas de 512 tokens y solapamiento de 128; ensemble de 3 semillas (13, 42, 87) con agregación jerárquica |
| Parametros totales | no disponible (el encoder base deberta-v3-small tiene aproximadamente 44 M, pero el ensemble completo no se especifica) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | 512 tokens por ventana (con solapamiento de 128) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (prosa) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de transformers, probablemente safetensors o binarios PyTorch) |

## Arquitectura y entrenamiento

El modelo utiliza un encoder `deberta-v3-small` como base, procesando el texto en ventanas de 512 tokens con un solapamiento de 128 tokens entre ventanas consecutivas. Cada ventana se codifica de forma independiente y las representaciones se agregan mediante una cabeza de resumen jerárquico (`hierarchical_summary_head`). El objetivo de entrenamiento es `group_balanced`, y el resultado final es la media de las probabilidades por documento de las tres semillas entrenadas por separado. Sobre esta salida se aplica un calibrador isotónico ajustado en una partición de calibración reservada, disjunta por grupos y nunca utilizada en entrenamiento ni en test.

El pool de entrenamiento, denominado `pooled-train-v2.1`, contiene 35 856 filas y se compone exclusivamente de cohortes con licencias que permiten el entrenamiento y la redistribución de pesos derivados: MAGE, RAID clean y DeFactify. Los conjuntos EvoBench y M4GT se mantienen exclusivamente para evaluación bajo la puerta de licencia. El entrenamiento se realizó con Python 3.12.10, torch 2.13.0+cu126, transformers 5.15.0 y numpy 2.5.2, en una NVIDIA GeForce RTX 3090 con CUDA 12.6, usando pesos maestros en fp32 y autocast en bf16. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado para clasificación binaria.

## Capacidades

- Deteccion binaria de participacion humana frente a maquina en prosa inglesa: estima la probabilidad de que un texto tenga una contribucion sustancial de IA.
- Calibracion de probabilidades: el calibrador isotonico ajusta las salidas para que las probabilidades sean interpretables como frecuencias relativas en la poblacion de calibracion.
- Agregacion por ventanas: procesa documentos de longitud arbitraria mediante ventanas solapadas, lo que permite manejar textos mas largos que la ventana individual.
- Ensemble de tres semillas: reduce la varianza de las predicciones y mejora la estabilidad frente a diferentes inicializaciones.
- Instrumento de evaluacion para estudios de transportabilidad: disenado para medir el comportamiento del modelo ante cambios de distribucion (cohortes no vistas, parafraseo, etc.).
- No soporta tool calling, agentes, generacion de texto, codigo, vision ni audio: es exclusivamente un clasificador de texto.

## Casos de uso

- Auditoria de contenido editorial: una redaccion puede utilizar el modelo para detectar si un articulo en prosa inglesa ha sido generado o editado sustancialmente por una maquina, siempre que el texto provenga de una poblacion similar al pool de entrenamiento (por ejemplo, noticias de NYT via DeFactify).
- Investigacion academica sobre deteccion de IA: el modelo sirve como instrumento de referencia en estudios que analizan la transportabilidad de detectores entre distintas cohortes y dominios, gracias a su calibracion explicita y a las metricas de peor cohorte reportadas.
- Evaluacion de pipelines de generacion de texto: un equipo que desarrolla sistemas de escritura asistida puede usar el modelo para medir la proporcion de contribucion maquina en sus salidas, como control de calidad interno.
- Analisis forense de textos en ingles: en contextos de verificacion de autoría, el modelo puede proporcionar una probabilidad calibrada de participacion maquina, aunque su uso fuera de la poblacion de calibracion requiere precaucion.
- Comparacion de detectores en condiciones de cambio de distribucion: el modelo esta disenado para ser evaluado en cohortes no vistas (MAGE OOD, M4GT, EvoBench, ataques RAID), por lo que es util como punto de partida en benchmarks de robustez.
- Formacion y validacion de modelos de deteccion: los pesos y el codigo de reproduccion permiten a otros investigadores reentrenar o adaptar el detector sobre sus propios datos, siempre que respeten las licencias de los conjuntos de datos.

## Benchmarks y rendimiento

La model card reporta metricas sobre la particion de calibracion reservada (held-out, disjunta por grupos). No se han publicado resultados sobre el conjunto de test final, y las metricas de transporte a cohortes no vistas se miden en una fase posterior (Phase 6) que no se incluye en esta tarjeta.

| Vista | AUROC | Peor cohorte AUROC | Brier | Pendiente de calibracion |
|---|---|---|---|---|
| Sin calibrar | 0.9929 | 0.9854 | 0.0333 | n/a |
| Calibrado isotonico | 0.9929 | 0.9854 | 0.0292 | n/a |

Estas cifras corresponden a la particion de calibracion y no deben interpretarse como rendimiento en produccion. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni otros benchmarks genericos, ya que el modelo no es un LLM generativo.

## Requisitos de hardware

- El modelo base es `deberta-v3-small`, un encoder de aproximadamente 44 millones de parametros, por lo que la inferencia es ligera en comparacion con LLMs generativos.
- El ensemble de tres semillas implica cargar tres instancias del encoder, lo que triplica los requisitos de memoria en comparacion con una sola instancia.
- VRAM estimada: no disponible en la informacion proporcionada. Con un encoder pequeno, una GPU consumer con 8 GB de VRAM deberia ser suficiente para inferencia en lotes pequenos, pero no se especifica.
- GPU recomendada: el entrenamiento se realizo en una NVIDIA GeForce RTX 3090 (24 GB). Para inferencia, una GPU con al menos 8 GB deberia bastar, aunque no hay datos oficiales.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con bibliotecas como Hugging Face Transformers, vLLM (si se adapta), o mediante exportacion a ONNX. No se mencionan formatos GGUF ni compatibilidad con Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo se presenta como un instrumento especifico para el estudio Panoptes, no como un detector generico comparable a otros sistemas de deteccion de IA como GPTZero, Originality.ai o DetectGPT. Por tanto, no se incluye una tabla comparativa.

## Limitaciones y advertencias

- El modelo solo esta calibrado para prosa inglesa; no es valido para codigo, textos en otros idiomas ni poblaciones distintas al pool de entrenamiento.
- Es vulnerable a la parafraseo y a generadores futuros, como se indica explicitamente en la model card.
- Las metricas reportadas son de desarrollo y calibracion; no se ha leido ninguna etiqueta de test final, por lo que el rendimiento en produccion no esta garantizado.
- El modelo es binario (humano vs. maquina completa); las salidas de generacion mayoritaria y fraccion de contribucion son solo para evaluacion externa hasta que exista una cohorte mixta con terminos claros.
- El uso fuera de la poblacion de calibracion requiere medir el transporte de evidencia (Phase 6) y no debe asumirse.
- Aunque la licencia es MIT, los conjuntos de datos de entrenamiento tienen restricciones de licencia que limitan la redistribucion de pesos derivados; EvoBench y M4GT no pueden usarse para entrenamiento.
- No es un modelo generativo: no produce texto, codigo ni respuestas; solo clasifica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MarketStandard/panoptes-neural-v1
- Repositorio fuente (mencionado en la model card): https://github.com/marketstandard/Panoptes
- Referencia a CITATION.cff en el repositorio fuente (no se proporciona enlace directo)
