# fariskishtah/entitylens-ai

## Resumen

EntityLens AI es un modelo de reconocimiento de entidades nombradas (NER) para ingles, resultado del ajuste fino de `bert-base-cased` sobre el corpus CoNLL-2003. Lo desarrolla el autor independiente fariskishtah como modelo de produccion del proyecto EntityLens AI, y fue seleccionado entre cuatro arquitecturas candidatas (BERT y tres baselines recurrentes: LSTM, BiLSTM y BiLSTM+CRF) en funcion del entity-F1 de validacion. Su proposito es etiquetar tokens en cuatro categorias: persona (PER), organizacion (ORG), localizacion (LOC) y miscelanea (MISC), con etiquetado IOB2.

Arquitectonicamente es un transformer encoder BERT en configuracion base, con 107.726.601 parametros totales (aproximadamente 0,1B) y pesos disponibles tanto en safetensors como en ONNX. El repositorio ocupa 0,5 GB y la licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

Su relevancia practica es la de un componente ligero y desplegable para tareas de extraccion de entidades en pipelines de NLP en ingles: cabe en GPU de consumo, se integra con la libreria `transformers` mediante el pipeline `token-classification` y sirve como linea base solida frente a alternativas recurrentes mas costosas de entrenar y mantener.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (`bert-base-cased`) |
| Parametros totales | 107.726.601 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (max_len usado en entrenamiento); limite arquitectonico de BERT: 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors y ONNX sin variantes cuantizadas declaradas) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

El modelo es un BERT base en variante *cased* (sensible a mayusculas y minusculas), con un cabezal de clasificacion de tokens para etiquetado IOB2 de cuatro tipos de entidad. El ajuste fino se realizo durante 4 epocas con tasa de aprendizaje 5e-5, tamano de lote 16 y longitud maxima de secuencia de 256 tokens, empleando alineacion de etiquetas al primer subtoken de cada palabra. El entrenamiento se ejecuto en una GPU T4 de Kaggle.

El conjunto de datos es CoNLL-2003 en ingles, un corpus de noticias de agencia (Reuters) de la decada de 1990. La evaluacion se hizo con `seqeval` a nivel de entidad estricto. La seleccion del modelo final se baso en el entity-F1 de validacion (0,9537), comparando contra tres baselines recurrentes documentados en el repositorio de GitHub del proyecto, que incluye ademas un analisis con capa CRF. No se declara en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Reconocimiento de entidades nombradas en ingles con cuatro etiquetas: PER, ORG, LOC y MISC.
- Etiquetado a nivel de token con formato IOB2 y agregacion de entidades mediante `aggregation_strategy="simple"` en el pipeline de `transformers`.
- Clasificacion de secuencias cortas y medias (hasta 256 tokens en las condiciones de entrenamiento).
- Inferencia en CPU y GPU; compatible con exportacion ONNX ya incluida en el repositorio.
- Integracion directa con el pipeline `token-classification` de Hugging Face.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento: es un modelo discriminativo de etiquetado, no generativo.
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.

## Casos de uso

- Extraccion de entidades en articulos de noticias: el modelo identifica personas, organizaciones y lugares en texto periodistico en ingles, el dominio exacto de su entrenamiento (Reuters), lo que maximiza la precision esperada.
- Enriquecimiento de bases de datos documentales: procesar lotes de documentos en ingles para poblar campos estructurados de persona, organizacion y localizacion antes de indexar en un motor de busqueda.
- Preprocesado para sistemas de analisis de reputacion de marca: detectar menciones de organizaciones (ORG) en resenas o notas de prensa y agregarlas por entidad.
- Anonimizacion asistida de textos: localizar entidades de tipo PER para su seudonimizacion en flujos de cumplimiento, siempre con revision humana dado que las puntuaciones no estan calibradas.
- Linea base en investigacion de NLP: punto de comparacion reproducible (F1 de test 0,9178) frente a arquitecturas recurrentes o modelos mayores en experimentos de NER sobre CoNLL-2003.
- Servicio de inferencia ligero en produccion: al ocupar 0,5 GB y ~108M de parametros, puede desplegarse en contenedores pequenos o en CPU para volúmenes moderados de peticiones, con la variante ONNX para optimizar latencia.
- Etiquetado previo en pipelines de extraccion de relaciones: las entidades detectadas sirven de entrada a modulos posteriores de relation extraction o entity linking.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Test entity-F1 (strict seqeval) | 0,9178 |
| Test precision | 0,9138 |
| Test recall | 0,9217 |
| Validation entity-F1 | 0,9537 |
| F1 test por clase: PER | 0,963 |
| F1 test por clase: ORG | 0,902 |
| F1 test por clase: LOC | 0,931 |
| F1 test por clase: MISC | 0,819 |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), que ademas no aplican a un modelo discriminativo de etiquetado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,5 GB de pesos mas activaciones; en fp16 aproximadamente 0,25 GB. Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: T4 (la usada en entrenamiento), RTX 3060/4060 o superiores, A100/H100 para despliegues de alto throughput por lotes.
- Cabe en GPU de consumo y en CPU; para volumeres bajos la inferencia en CPU con ONNX es viable.
- Opciones de despliegue: pipeline de `transformers`, ONNX Runtime (pesos ONNX incluidos en el repo), TorchScript, y servidores de inferencia compatibles con modelos `transformers` como TGI o vLLM (soporte de BERT limitado en vLLM; verificar compatibilidad). No se declara soporte explicito de llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 CoNLL-2003 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EntityLens AI (este modelo) | 107,7M | 256 (entrenamiento) | 0,9178 (declarado, no verificado) | MIT | Hugging Face + ONNX |
| `dslim/bert-base-NER` | ~108M | 512 | no disponible en esta busqueda | MIT | Hugging Face |
| `dbmdz/bert-large-cased-finetuned-conll03-english` | ~335M | 512 | no disponible en esta busqueda | MIT | Hugging Face |
| Baselines recurrentes del proyecto (LSTM / BiLSTM / BiLSTM+CRF) | no disponible | no disponible | no disponible (comparados por validacion en el repo) | no disponible | GitHub del proyecto |

No se dispone de resultados de benchmarks de los modelos comparables en la informacion proporcionada, por lo que la comparacion numerica de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre noticias Reuters de los anos 90; el rendimiento cae en otros dominios (texto clinico, legal, redes sociales, conversacional).
- Solo reconoce cuatro tipos de entidad (PER, ORG, LOC, MISC); cualquier otra categoria (fechas, cantidades, productos, etc.) no se detecta.
- Solo ingles; no se declara soporte multilingue.
- Las puntuaciones de confianza son salidas softmax sin calibracion; no deben interpretarse como probabilidades calibradas ni usarse directamente como umbrales de decision sin ajuste.
- Riesgo de alucinacion de entidades en el sentido de falsos positivos en textos fuera de dominio; requiere validacion en el dominio objetivo antes de produccion.
- La licencia MIT permite uso comercial sin restricciones, pero no se ofrece garantia ni soporte por parte del autor.
- Los resultados de benchmarks estan declarados por el autor y no han sido verificados de forma independiente.
- El limite de 256 tokens usado en entrenamiento implica que secuencias mas largas deben truncarse o dividirse, con posible perdida de entidades en los bordes.
- Modelo con muy baja adopcion (35 descargas, 0 likes en el momento de la consulta); no hay evidencia de uso en produccion a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fariskishtah/entitylens-ai
- Demo (Space): https://huggingface.co/spaces/fariskishtah/entitylens-ai
- Repositorio GitHub del proyecto: https://github.com/fariskishtah/entitylens-ai
- Dataset CoNLL-2003: https://huggingface.co/datasets/conll2003
