# LynLab/yomigana-bert-test

## Resumen

`LynLab/yomigana-bert-test` es un modelo de clasificación de tokens (token classification) desarrollado por LynLab, construido sobre `tohoku-nlp/bert-base-japanese-v3`, y especializado en la desambiguación de lecturas de palabras homógrafas en japonés (同形異音語) para el preprocesado de sistemas de síntesis de voz (TTS). El modelo predice la lectura correcta (yomigana) de 20 palabras con 40 lecturas posibles en función del contexto, una tarea crítica para que un motor TTS pronuncie correctamente términos como "今日" (kyou / konnichi) o "生" (sei / nama / ikiru).

Se trata explícitamente de un modelo de prueba de pipeline ("test01"), entrenado con datos generados a partir de plantillas y evaluado sobre plantillas no vistas. El propio autor advierte en la model card que no alcanza calidad de producción. Aun así, sus resultados en la evaluación template-held-out (n=90) son notablemente superiores a los baselines clásicos: 0.767 frente a 0.444 de pykakasi y 0.522 de MeCab con UniDic.

El modelo tiene 110.648.105 parámetros, licencia Apache 2.0 y un repositorio de 0,4 GB en formato safetensors. Es relevante como referencia metodológica para pipelines de normalización de texto japonés orientados a TTS, más que como componente listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), base `tohoku-nlp/bert-base-japanese-v3` |
| Parametros totales | 110.648.105 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tuning) de tipo token classification sobre `tohoku-nlp/bert-base-japanese-v3`, un encoder BERT de 110 millones de parámetros preentrenado en japonés. La cabeza de clasificación asigna etiquetas a nivel de token para resolver la lectura correcta de palabras homógrafas contextualmente dependientes, cubriendo un inventario cerrado de 20 palabras con 40 lecturas posibles.

El entrenamiento se realizó con datos generados a partir de plantillas (template-generated data), y la evaluación se hizo sobre plantillas no vistas durante el entrenamiento (template-held-out), lo que mide la capacidad de generalización a contextos sintácticos nuevos. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a este tipo de tarea).

## Capacidades

- Clasificación de tokens para desambiguación de lecturas (yomigana) de palabras homógrafas en japonés.
- Predicción de lectura dependiente de contexto para un inventario cerrado de 20 palabras y 40 lecturas.
- Preprocesado de texto para pipelines TTS: conversión de texto japonés a lecturas fonéticamente correctas.
- Salida compatible con el pipeline `token-classification` de Hugging Face Transformers.
- No soporta tool calling, agentes, generación de texto libre, visión ni audio.
- Capacidad multilingüe limitada al japonés.

## Casos de uso

- Preprocesado para TTS en japonés: el modelo etiqueta cada token con su lectura correcta antes de enviar el texto al sintetizador, evitando pronunciaciones erróneas de homógrafos frecuentes.
- Normalización de texto para asistentes de voz: integración en la fase de limpieza previa a la síntesis en sistemas de lectura de notificaciones o lectores de pantalla.
- Lectura automática de contenidos editoriales: conversión de artículos a audio con pronunciación contextual de términos ambiguos.
- Investigación en desambiguación léxica japonesa: base de comparación frente a baselines como pykakasi y MeCab(UniDic) para experimentos de normalización de lectura.
- Validación de pipelines de datos: modelo de prueba para verificar la infraestructura de entrenamiento, evaluación y despliegue de clasificadores de tokens en japonés.
- Prototipado de correctores de lectura: detección de lecturas incorrectas en transcripciones o diccionarios de pronunciación.

## Benchmarks y rendimiento

Evaluación template-held-out (n=90) reportada por el autor:

| Modelo | Precisión (template-held-out, n=90) |
|---|---|
| yomigana-bert-test | 0.767 |
| MeCab (UniDic) baseline | 0.522 |
| pykakasi baseline | 0.444 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que la tarea no corresponde a esos conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,45 GB solo para pesos; con activaciones y overhead, aproximadamente 1-2 GB.
- VRAM estimada en fp16/bf16: alrededor de 0,25 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; A100, H100, RTX 4090, RTX 3090, RTX 3060 o superiores son más que suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1060 6 GB, RTX 2060, etc.) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: Hugging Face `transformers` (pipeline `token-classification`), servidores de inferencia compatibles con endpoints (el tag `endpoints_compatible` está presente), ONNX Runtime tras exportación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LynLab/yomigana-bert-test | 110,6 M | no disponible | Desambiguación de lectura (token classification) | Apache 2.0 | Hugging Face |
| tohoku-nlp/bert-base-japanese-v3 | ~110 M | no disponible | Encoder base japonés (modelo de partida) | no disponible en la información | Hugging Face |
| pykakasi (baseline) | no aplica (basado en reglas/diccionario) | no aplica | Conversión kanji a kana | no disponible en la información | Librería |
| MeCab + UniDic (baseline) | no aplica (analizador morfológico) | no aplica | Análisis morfológico y lectura | no disponible en la información | Software |

## Limitaciones y advertencias

- El autor indica explícitamente que es un modelo de prueba de pipeline y que no alcanza calidad de producción.
- Entrenado con datos generados por plantillas: la generalización a texto real fuera de dominio puede degradarse respecto a la evaluación template-held-out.
- Inventario cerrado de 20 palabras y 40 lecturas: no cubre la totalidad de homógrafos del japonés.
- Riesgo de predicciones incorrectas en contextos ambiguos o poco representados en las plantillas de entrenamiento.
- Solo soporta japonés; no es un modelo generativo ni multilingüe.
- No se dispone de información sobre sesgos específicos del dataset de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero la calidad limitada del modelo desaconseja su uso en producción sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LynLab/yomigana-bert-test
- Modelo base: https://huggingface.co/tohoku-nlp/bert-base-japanese-v3
