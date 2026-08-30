# Rin247/gemma-3-4b-it-Uncensored-Aquarion-INT8

## Resumen

El modelo `Rin247/gemma-3-4b-it-Uncensored-Aquarion-INT8` es una cuantización INT8 (weight-only) del modelo `gemma-3-4b-it` de Google, desarrollada por el usuario Rin247. La particularidad de esta versión es que ha sido sometida a un proceso de "abliteration" mediante proyección ortogonal de la dirección de rechazo del modelo original, eliminando así los mecanismos de censura y negativa a responder sobre ciertos contenidos. El resultado es un modelo de 4.300 millones de parámetros que conserva las capacidades del base, pero con un comportamiento menos restrictivo.

Esta ficha resulta relevante para desarrolladores que buscan ejecutar un modelo de tamaño medio en hardware modesto (gracias a la cuantización INT8) y que necesitan explorar casos de uso donde la censura del modelo original suponga una limitación, como la investigación en alineación de IA o la generación de contenido creativo sin restricciones temáticas. La cuantización reduce el uso de memoria a aproximadamente 4,3 GB para los pesos, lo que lo hace viable en GPUs de consumo con 8 GB o más de VRAM.

Sin embargo, el formato de pesos es personalizado (con escalas y shapes almacenados en buffers separados), lo que requiere un paso de dequantización manual antes de poder alimentar un motor de inferencia estándar. La licencia no está especificada en la model card, lo que añade incertidumbre para su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 3 4B IT) |
| Parametros totales | 4.300.079.472 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 (weight-only, RTN) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (con buffers de escala y forma) |

## Arquitectura y entrenamiento

El modelo es una cuantización INT8 weight-only del checkpoint `gemma-3-4b-it` de Google. La cuantización se realizó mediante PyTorch RTN (round-to-nearest) en CPU, almacenando las escalas junto a los pesos en buffers adicionales (`*.weight_scale`, `*.weight_shape`). Antes de la cuantización, el modelo fue sometido a un proceso de "abliteration" mediante proyección ortogonal de la dirección de rechazo, una técnica que modifica los pesos para eliminar la tendencia del modelo a negarse a responder sobre temas considerados sensibles o prohibidos.

No se proporcionan detalles sobre el dataset de entrenamiento ni sobre el proceso de abliteration más allá de la descripción técnica. La cuantización no modifica la arquitectura subyacente, por lo que se mantienen las características del transformer original de Gemma 3 4B, aunque la precisión de los pesos se reduce a 8 bits, lo que puede afectar ligeramente a la calidad de las respuestas en comparación con el modelo en precisión completa.

## Capacidades

- Generación de texto en lenguaje natural, manteniendo las capacidades del modelo base Gemma 3 4B IT.
- Razonamiento y resolución de problemas, aunque la cuantización puede degradar ligeramente el rendimiento en tareas complejas.
- Soporte de código y matemáticas básicas, heredado del modelo original.
- Capacidades multilingües no confirmadas para esta cuantización, aunque el modelo base soporta varios idiomas.
- Tool calling y function calling: no confirmado en esta versión, pero probablemente preservado si el modelo base lo soportaba.
- Comportamiento "uncensored": el abliteration elimina la direccion de rechazo, permitiendo respuestas sobre temas que el modelo original evitaría.

## Casos de uso

- Investigacion en alineacion de IA: estudiar como se comporta un modelo sin mecanismos de rechazo, analizando respuestas a prompts provocativos o sobre temas tabu.
- Generacion de contenido creativo sin restricciones: escribir ficcion, poesia o guiones que aborden temas adultos o controvertidos sin filtros automaticos.
- Analisis de textos sensibles: clasificar o resumir documentos que contengan lenguaje ofensivo o temas delicados, donde el modelo original podria negarse a procesarlos.
- Desarrollo de agentes de rol: crear personajes de chat que respondan sin limitaciones tematicas, util en juegos de rol o simulaciones sociales.
- Evaluacion de robustez: probar la resistencia del modelo a jailbreaks o intentos de manipulacion, comparando con la version censurada.
- Entornos de desarrollo con recursos limitados: ejecutar un modelo de 4B en una GPU de 8 GB gracias a la cuantizacion INT8, para prototipos o aplicaciones locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para esta cuantizacion especifica. Se recomienda ejecutar evaluaciones propias si se requiere una caracterizacion cuantitativa del rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,3 GB para los pesos en INT8, mas overhead de escalas, activaciones y contexto. Se recomienda al menos 6 GB de VRAM para un uso comodo.
- GPU recomendadas: tarjetas con 8 GB o mas, como RTX 3060, RTX 4060, RTX 2070, o GPUs profesionales como T4 o L4.
- Compatibilidad con consumer GPU: si, siempre que se disponga de al menos 8 GB de VRAM.
- Opciones de despliegue: el formato safetensors con cuantizacion personalizada no es directamente compatible con vLLM, llama.cpp, Ollama o TGI sin un paso previo de dequantizacion. Se puede usar con transformers si se implementa una funcion que lea los buffers de escala y forma y reconstruya los pesos en precision completa.
- Latencia y throughput: no disponibles. Al ser una cuantizacion weight-only, la latencia dependera del hardware y del tamaño de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-3-4b-it (base) | 4.3B | 128K (segun documentacion de Google) | Gemma Terms of Use | safetensors (BF16) | Modelo original con censura |
| Rin247/gemma-3-4b-it-Uncensored-Aquarion-INT8 | 4.3B | No disponible | No disponible | safetensors (INT8) | Cuantizado y abliterated |
| Nidum-Gemma-3-4B-it-Uncensored | No disponible | No disponible | No disponible | No disponible | Otra version uncensored, sin datos de cuantizacion |

No se dispone de datos de rendimiento comparativo entre estas versiones. La comparacion se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- La cuantizacion INT8 puede degradar la precision del modelo en tareas de razonamiento complejo o generacion de codigo, en comparacion con el modelo en BF16.
- El proceso de abliteration puede tener efectos secundarios no deseados, como respuestas incoherentes o sesgos amplificados en ciertos temas.
- La licencia no esta especificada, lo que impide determinar si el uso comercial esta permitido. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- El formato de pesos es personalizado y requiere dequantizacion manual, lo que complica la integracion con frameworks estandar de inferencia.
- No hay garantias de soporte o mantenimiento por parte del autor.
- El modelo puede generar contenido inapropiado, ofensivo o ilegal debido a la eliminacion de la censura. El usuario es responsable del uso que haga de el.
- No se han publicado evaluaciones de seguridad ni de sesgos para esta version concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rin247/gemma-3-4b-it-Uncensored-Aquarion-INT8
- Modelo base gemma-3-4b-it de Google: https://huggingface.co/google/gemma-3-4b-it
- Version uncensored de Nidum: https://huggingface.co/nidum/Nidum-Gemma-3-4B-it-Uncensored
- Guia de ejecucion local de Gemma: https://locallyuncensored.com/blog/gemma-4-local-guide.html
- Articulo sobre Gemma-3-4B-IT-Uncensored: https://model.aibase.com/models/details/1915738540060860418
