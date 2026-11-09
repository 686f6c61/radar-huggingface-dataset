# robbyant/lingbot-touch-small

## Resumen

LingBot-Touch-Small es un modelo de representación táctil desarrollado por robbyant, diseñado como modelo fundacional para aprendizaje de representaciones sobre señales táctiles heterogéneas en el contexto de manipulación robótica diestra. El modelo se basa en la arquitectura JEPA (Joint Embedding Predictive Architecture) y utiliza tokenizadores específicos por modalidad junto con un Transformer compartido para aprender representaciones de la estructura de contacto y sus cambios temporales mediante predicción en el espacio latente. Cubre tres modalidades sensoriales: magnética (mediciones táctiles de tres ejes), piezorresistiva (mediciones escalares en el canal Z) y visuotáctil (mediciones de deformación o intensidad decodificadas, no imágenes RGB crudas).

Este repositorio distribuye únicamente los pesos del codificador congelado (`encoder.pt`) y su configuración de inferencia asociada (`config.json`). No incluye código fuente de inferencia, adaptadores de sensores, datasets de muestra, predictores, cabezas de tareas downstream, estados de optimizador ni configuraciones o logs de entrenamiento. La implementación de inferencia compatible se distribuye por separado.

El modelo es relevante porque aborda la fragmentación de hardware táctil en robótica: en lugar de entrenar un modelo por sensor, propone una representación compartida que unifica señales de distintas tecnologías de palpación, lo que facilita la transferencia entre plataformas y la reutilización de representaciones en tareas de manipulación. Su tamaño de repositorio (0,1 GB) sugiere un modelo compacto, adecuado para integración en bucles de control robótico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | JEPA (Joint Embedding Predictive Architecture) con tokenizadores específicos por modalidad y Transformer compartido |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada con forma [B,T,5,M,3]: batch, tiempo, 5 dedos, M taxels, 3 ejes) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico; procesa señales táctiles) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`encoder.pt`) + `config.json` |

## Arquitectura y entrenamiento

LingBot-Touch emplea una arquitectura JEPA en la que el modelo aprende representaciones prediciendo en el espacio latente en lugar de reconstruir la señal de entrada. La entrada se tokeniza mediante tokenizadores específicos por modalidad (magnética, piezorresistiva y visuotáctil) y se procesa con un Transformer compartido que captura la estructura de contacto y su evolución temporal. La entrada canónica tiene forma [B,T,5,M,3], donde B es el batch, T la dimensión temporal, 5 el número de dedos en orden fijo (pulgar, índice, corazón, anular y meñique), M el número de taxels y 3 los ejes de medición. Las coordenadas X/Y se normalizan a [-1,1] y Z a [0,1].

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones adicionales como decodificación especulativa o atención lineal. El repositorio contiene únicamente el codificador objetivo congelado; los detalles del proceso de entrenamiento no están publicados en la información disponible.

## Capacidades

- Aprendizaje de representaciones táctiles a partir de señales de tres modalidades: magnética (tres ejes), piezorresistiva (escalar en Z) y visuotáctil (deformación o intensidad decodificada en Z).
- Generación de representaciones latentes a nivel de token junto con sus direcciones temporal, de dedo y espacial.
- Modelado de estructura de contacto y cambios temporales mediante predicción en espacio latente.
- Soporte para consulta basada en atención (attention-based querying) para lectura específica de tareas downstream.
- Integración en pipelines de percepción táctil y manipulación robótica diestra.
- No es un modelo generativo de texto ni multimodal lingüístico; no soporta tool calling, agentes ni capacidades multilingües.
- No procesa imágenes RGB crudas como entrada en la modalidad visuotáctil.

## Casos de uso

- Percepción táctil en pinzas robóticas diestras: el codificador procesa secuencias de taxels de los cinco dedos y genera representaciones latentes que pueden alimentar clasificadores de contacto o de deslizamiento en tiempo real.
- Transferencia entre sensores heterogéneos: al unificar modalidades magnética, piezorresistiva y visuotáctil en un espacio latente compartido, permite reutilizar cabezas de tareas entrenadas con un sensor en plataformas con otro tipo de sensor, reduciendo el reentrenamiento.
- Detección de eventos de contacto y liberación: las representaciones temporales token a token permiten identificar transiciones de contacto en tareas de ensamblaje o agarre.
- Estimación de propiedades de objetos: las representaciones de estructura de contacto pueden usarse para inferir dureza, textura o forma mediante cabezas de regresión o clasificación acopladas al codificador.
- Control reactivo en manipulación fina: las features latentes pueden integrarse en bucles de control para ajustar la fuerza de agarre o detectar deslizamiento durante la manipulación.
- Investigación en representación táctil: sirve como backbone congelado para experimentos de aprendizaje de representaciones, comparación de modalidades y evaluación de transferencia entre sensores.
- Preentrenamiento para tareas downstream: al ser un codificador congelado, se puede usar como extractor de features en pipelines donde solo se entrena una cabeza ligera específica de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo compacto que probablemente quepa en GPUs de consumo, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño reducido del repositorio sugiere que podría ejecutarse en GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue: no disponible. El repositorio no incluye código de inferencia; la implementación compatible se distribuye por separado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de representación táctil con características equivalentes.

## Limitaciones y advertencias

- El repositorio contiene únicamente los pesos del codificador congelado y la configuración; no incluye código de inferencia, adaptadores de sensores ni cabezas de tareas, por lo que no es directamente ejecutable sin la implementación separada.
- La geometría del sensor, la lateralidad, el orden de los puntos y los rangos de medición fijos deben adaptarse correctamente antes de la inferencia; un mapeo incorrecto produce representaciones inválidas.
- La modalidad visuotáctil no acepta imágenes RGB crudas; requiere mediciones de deformación o intensidad decodificadas en el canal Z.
- No se dispone de información sobre sesgos, riesgo de alucinación (no es un modelo generativo de lenguaje) ni limitaciones idiomáticas.
- No se han publicado detalles sobre el dataset de entrenamiento, lo que limita la evaluación de su cobertura y generalización.
- Licencia Apache 2.0 permite uso comercial, pero al no incluir código de inferencia, la viabilidad de producción depende de la implementación distribuida por separado.
- Sin benchmarks publicados, no es posible comparar su rendimiento con alternativas de forma cuantitativa.

## Enlaces

- Hugging Face: https://huggingface.co/robbyant/lingbot-touch-small
- Pesos del codificador: https://huggingface.co/robbyant/lingbot-touch-small/blob/main/encoder.pt
- Configuración de inferencia: https://huggingface.co/robbyant/lingbot-touch-small/blob/main/config.json
- Licencia: https://huggingface.co/robbyant/lingbot-touch-small/blob/main/LICENSE
