# hellnahbru/evo2_40b-preserved-20261029

## Resumen

Evo 2 es un modelo de lenguaje de ADN desarrollado por el Arc Institute, entrenado de forma autorregresiva sobre billones de tokens de ADN. El repositorio `hellnahbru/evo2_40b-preserved-20261029` es una copia (mirror) del checkpoint `evo2_40b` original de Arc Institute, publicada por el usuario hellnahbru bajo licencia Apache 2.0. El modelo resuelve tareas de modelado de secuencias genomicas: prediccion del siguiente nucleotido, generacion de secuencias de ADN y analisis de variantes, entre otras.

La relevancia de Evo 2 radica en su escala: es uno de los mayores modelos de lenguaje genomicos publicados, con 40.000 millones de parametros y capacidad de manejar contextos de hasta 1 millon de tokens, lo que permite modelar regiones genomicas completas y contextos largos que otros modelos de ADN no alcanzan. La arquitectura es un transformer autorregresivo (StripedHyena 2 segun la documentacion del proyecto original), optimizado para secuencias de ADN de muy larga longitud.

Esta ficha se basa exclusivamente en la informacion disponible en el repositorio de HuggingFace y en la model card del autor. Muchos datos tecnicos (composicion del dataset, benchmarks concretos, idiomas) no estan detallados en la informacion proporcionada y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (StripedHyena 2 segun documentacion del proyecto original) |
| Parametros totales | 40B (50 capas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 1.000.000 tokens (checkpoint principal); variante base con 8.192 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de secuencias de ADN, no de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repo de 82,3 GB; probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

Evo 2 es un modelo autorregresivo entrenado sobre billones de tokens de ADN. Segun la model card, el checkpoint `evo2_40b` consta de 50 capas y 40.000 millones de parametros, y fue entrenado con una longitud de contexto de hasta 1 millon de tokens. Existe tambien una variante `evo2_40b_base` con la misma arquitectura pero entrenada con contexto de 8.192 tokens, junto con versiones de 7B y 1B.

La model card no detalla la composicion exacta del dataset de entrenamiento, el numero preciso de tokens, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La documentacion remite al repositorio de GitHub y al paper en bioRxiv para los detalles tecnicos completos. La innovacion principal destacable es la ventana de contexto de hasta 1 millon de tokens, que permite modelar regiones genomicas extensas de forma conjunta.

## Capacidades

- Modelado de secuencias de ADN: prediccion del siguiente nucleotido en secuencias genomicas.
- Generacion de secuencias de ADN autorregresiva.
- Analisis de contexto genomico largo gracias a la ventana de hasta 1 millon de tokens.
- Evaluacion de variantes y efectos de mutaciones (segun la documentacion del proyecto original).
- No es un modelo de lenguaje natural: no genera texto, no soporta tool calling ni razonamiento conversacional.
- Capacidades multilingues: no aplica (opera sobre alfabeto de ADN: A, C, G, T).
- Capacidades especiales: contexto ultralargo para secuencias biologicas; variantes base con contexto de 8.192 tokens.

## Casos de uso

- Anotacion genomica a gran escala: el modelo puede procesar regiones de hasta 1 millon de tokens para identificar patrones y elementos funcionales en secuencias largas, gracias a su ventana de contexto extendida.
- Prediccion de efectos de variantes: evaluando la probabilidad de secuencias mutadas frente a las de referencia, util para priorizar variantes en estudios geneticos.
- Generacion de secuencias sinteticas de ADN: para diseno de secuencias en biologia sintetica, usando la generacion autorregresiva del modelo.
- Modelado de regiones regulatorias: el contexto largo permite analizar promotores, enhancers y elementos regulatorios en su entorno genomico completo.
- Investigacion en genomica comparativa: comparacion de probabilidades de secuencias entre especies o cepas para estudiar conservacion evolutiva.
- Filtrado y priorizacion en pipelines bioinformaticos: integracion como modelo de puntuacion de secuencias en flujos de analisis genomicos.
- Estudio de estructura de cromatina y organizacion genomica a larga distancia, aprovechando la ventana de 1M tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper en bioRxiv para los resultados de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 40B parametros, en precision completa (FP16/BF16) se requeririan aproximadamente 80 GB solo para los pesos, mas memoria para activaciones y cache de contexto (que con 1M tokens es muy elevada).
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, se requieren aceleradores de alta gama (varias A100/H100 o equivalentes).
- Cabe en consumer GPU: no con 40B parametros en precision completa; las variantes de 1B o 7B podrian ser viables en GPUs de consumo segun cuantizacion (no confirmado).
- Opciones de despliegue: la model card remite al repositorio de GitHub de ArcInstitute/evo2 para instrucciones; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Evo 2 40B (este repo) | 40B (50 capas) | Hasta 1M tokens | Apache 2.0 | HuggingFace (mirror) |
| Evo 2 7B | 7B (32 capas) | Hasta 1M tokens | Apache 2.0 | HuggingFace (arcinstitute/evo2_7b) |
| Evo 2 40B base | 40B (50 capas) | 8.192 tokens | Apache 2.0 | HuggingFace (arcinstitute/evo2_40b_base) |
| Evo 2 1B base | 1B (25 capas) | 8.192 tokens | Apache 2.0 | HuggingFace (arcinstitute/evo2_1b_base) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio es un mirror no oficial publicado por un tercero (hellnahbru); no procede del equipo original de Arc Institute. Se recomienda usar los checkpoints oficiales en `arcinstitute/`.
- No es un modelo de lenguaje natural: no debe usarse para tareas de texto, codigo o conversacion.
- Riesgo de alucinacion en el sentido biologico: las secuencias generadas pueden no ser funcionales o validas biologicamente; requieren validacion experimental.
- Sesgos del dataset de entrenamiento: la composicion del dataset no esta documentada en la informacion disponible, por lo que puede haber sesgos hacia determinados organismos o regiones genomicas.
- Requisitos de hardware muy elevados para el checkpoint de 40B con contexto de 1M tokens.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia y autenticidad de este mirror concreto antes de usarlo en produccion.
- No se dispone de informacion sobre cuantizaciones validadas, formatos de pesos ni soporte de frameworks de inferencia para este repositorio.

## Enlaces

- Repositorio HuggingFace (este mirror): https://huggingface.co/hellnahbru/evo2_40b-preserved-20261029
- Checkpoint oficial Evo 2 40B: https://huggingface.co/arcinstitute/evo2_40b
- Checkpoint oficial Evo 2 7B: https://huggingface.co/arcinstitute/evo2_7b
- Checkpoint oficial Evo 2 40B base: https://huggingface.co/arcinstitute/evo2_40b_base
- Checkpoint oficial Evo 2 7B base: https://huggingface.co/arcinstitute/evo2_7b_base
- Checkpoint oficial Evo 2 1B base: https://huggingface.co/arcinstitute/evo2_1b_base
- Repositorio GitHub del proyecto: https://github.com/ArcInstitute/evo2
- Paper en bioRxiv: https://www.biorxiv.org/content/10.1101/2025.02.18.638918v1
