# leslie721007/Qiushi-Engine-Frontier-Advancement

## Resumen

Qiushi-Engine-Frontier-Advancement es un modelo de lenguaje enmascarado (masked language model) en inglés, desarrollado por leslie721007 (Shuxing Yang) como parte del programa de investigación BabyLM Strict-Small del motor Qiushi. El modelo utiliza una arquitectura DeBERTa-v2 con adaptadores residuales y está diseñado para estudiar el aprendizaje eficiente de datos: empareja pasajes fuente con reescrituras concisas para permitir más pasajes dentro de un corpus fijo de 10 millones de palabras. Con 36.458.592 parámetros, es un modelo pequeño orientado a la investigación, no a la generación de texto.

El modelo se publica como el "Stage I" de una serie que conecta tres etapas de investigación: entrenar un modelo de lenguaje con datos limitados, estudiar cómo aprende de textos emparejados y retiene el comportamiento aprendido, y usar esos hallazgos para desarrollar un método de continuación. El modelo acompañante, Qiushi-Engine-Principle-Guided-Frontier-Advancement, es el resultado de esa continuación. Este modelo está pensado para tareas de predicción de tokens enmascarados, puntuación de frases y ajuste fino del codificador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 con dos rutas secuenciales de adaptadores residuales |
| Parámetros totales | 36.458.592 (incluye cabeza de MLM) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (requiere código personalizado) |
| Parámetros del codificador | 36.210.368 |
| Parámetros del segundo adaptador | 995.584 |
| Capas / tamaño oculto / cabezas de atención | 8 / 480 / 8 |
| Cuello de botella / escalas del adaptador | 128 / 1.75 y 0.75 |
| Tokenizador | BPE de nivel de byte con 16.384 entradas |
| Presupuesto de corpus | 10.000.000 palabras contadas en 64.740 filas |
| Exposición acumulada de palabras | 86.005.295 |
| Evaluación local (Overall) | 42.0240 |

## Arquitectura y entrenamiento

El modelo usa un codificador DeBERTa-v2 con dos rutas de adaptadores residuales. Los adaptadores son pequeñas capas entrenables añadidas al codificador: el primero se entrena durante el preentrenamiento, y un segundo adaptador se añade después y se entrena durante una continuación corta. El tokenizador es un BPE de nivel de byte de 16.384 entradas. El corpus de entrenamiento tiene un presupuesto de 10 millones de palabras contadas en 64.740 filas, con una exposición acumulada registrada de 86.005.295 palabras. La técnica de emparejar pasajes fuente con reescrituras concisas permite incluir más pasajes dentro del presupuesto fijo.

## Capacidades

- Predicción de tokens enmascarados (fill-mask).
- Puntuación de frases (sentence scoring).
- Ajuste fino del codificador para tareas posteriores.
- Evaluación en tareas de comprensión del lenguaje: BLiMP, SuperGLUE, EWoK, COMPS, GlobalPIQA, Reading, Entity y Supplement.
- Soporte de tool calling: no disponible.
- Soporte de agentes: no disponible (el modelo no es un LLM de chat).
- Capacidades multilingües: solo inglés.

## Casos de uso

- Investigación en aprendizaje eficiente de datos: el modelo permite estudiar cómo un MLM pequeño aprende de textos emparejados dentro de un presupuesto de 10 millones de palabras.
- Puntuación de frases en inglés: puede usarse para asignar probabilidades a frases, útil en tareas de reordenamiento o clasificación.
- Ajuste fino para tareas de comprensión del lenguaje: el codificador puede afinarse para SuperGLUE, BLiMP u otras tareas de evaluación.
- Comparación de métodos de continuación de entrenamiento: el modelo sirve como padre para experimentos que evalúan técnicas de continuación, como se muestra en la tabla de investigación.
- Participación en el desafío BabyLM Strict-Small: el modelo está diseñado para competir en el presupuesto estricto de 10 millones de palabras.
- Análisis de la retención de comportamiento aprendido: el segundo adaptador y la continuación permiten estudiar cómo el modelo retiene lo aprendido tras un entrenamiento adicional.

## Benchmarks y rendimiento

Resultados locales de la evaluación completa de BabyLM. Overall es la media aritmética de los nueve componentes. AoA se evaluó en 18 checkpoints y obtuvo 0.

| Componente | Score |
|---|---|
| BLiMP | 68.5100 |
| Supplement | 63.6400 |
| EWoK | 50.0200 |
| Entity | 28.3200 |
| COMPS | 52.0500 |
| SuperGLUE | 68.9457 |
| GlobalPIQA | 38.5650 |
| Reading | 8.1650 |
| AoA | 0.0000 |
| Overall | 42.0240 |

Comparación de métodos de continuación de entrenamiento (ambas ejecuciones parten del mismo modelo Stage I):

| Método | Continuación seed 62064 | Continuación seed 62065 |
|---|---|---|
| Stage I parent | 42.0240 | 42.0240 |
| Continuación ordinaria | 42.0926 | 42.1159 |
| Enmascaramiento denso de entrada, supervisión dispersa de objetivos | 42.2025 | 42.1789 |
| Con preservación de entrada ordinaria | 42.2464 | 42.2317 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- El modelo tiene 36.458.592 parámetros; no se han publicado requisitos oficiales de hardware.
- Opciones de despliegue: biblioteca transformers con `trust_remote_code=True`. No se han documentado opciones con vLLM, llama.cpp u otros.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la información proporcionada. El modelo está diseñado específicamente para el programa BabyLM Strict-Small, y no se dispone de datos de comparación con otras arquitecturas.

## Limitaciones y advertencias

- Riesgo de alucinación: al ser un MLM, no genera texto libre, por lo que el riesgo de alucinación en generación no aplica; sin embargo, puede producir predicciones incorrectas en tareas de enmascaramiento.
- Sesgos conocidos: no se han documentado sesgos específicos en la model card.
- Limitaciones de idioma: solo inglés, no soporta otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los datos de entrenamiento conservan sus licencias originales (ver DATA.md).
- Limitación de contexto: no se especifica la longitud de contexto; este dato no está confirmado.
- Código personalizado: el modelo requiere `trust_remote_code=True`, lo que implica revisar el código antes de usarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/leslie721007/Qiushi-Engine-Frontier-Advancement
- Perfil del autor: https://huggingface.co/leslie721007
- Modelo acompañante: https://huggingface.co/leslie721007/Qiushi-Engine-Principle-Guided-Frontier-Advancement
- Paper de Qiushi Discovery Engine: https://www.semanticscholar.org/paper/End-to-end-autonomous-scientific-discovery-on-a-Yang-Chen/af7f8603542e9081b37e320d18af379436dac667
- Artefactos dentro del repo: METHOD.md, TRAINING.md, DATA.md, EVALUATION.json, CHECKPOINTS.json y VALIDATION.json (enlaces relativos al repositorio).
