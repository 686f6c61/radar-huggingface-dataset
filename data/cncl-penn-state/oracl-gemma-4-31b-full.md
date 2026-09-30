# CNCL-Penn-State/ORACL-Gemma-4-31B-Full

## Resumen

ORACL-Gemma-4-31B-Full es un ajuste fino del modelo multimodal google/gemma-4-31B-it desarrollado por el grupo CNCL de la Universidad Estatal de Pensilvania. A diferencia de un asistente conversacional, este modelo se ha entrenado como un **evaluador automatico de creatividad**: recibe una instruccion y una respuesta (texto o dibujo) y devuelve una puntuacion continua de originalidad en una escala nominal de 10 a 50. El problema que resuelve es la correccion y puntuacion a gran escala de pruebas psicometricas de creatividad, una tarea tradicionalmente manual y costosa de escalar.

Tecnicamente se distribuye como un adaptador LoRA con cabeza de regresion sobre el modelo base Gemma 4 31B IT, una arquitectura transformer decoder multimodal densa con 31 000 millones de parametros y una ventana de contexto de hasta 256 000 tokens. El ajuste se realizo sobre el conjunto de datos MuCE-ORACL-Glimmer, con 215 413 respuestas durante dos epocas; la epoca 2 fue la seleccionada segun el error de validacion.

Su relevancia actual es doble: por un lado, demuestra un caso de uso especializado (regresion ordinal sobre salidas multimodales) poco frecuente en el ecosistema de modelos abiertos; por otro, aprovecha la multimodalidad nativa y el contexto largo de Gemma 4 para atacar tareas de evaluacion cognitiva. No obstante, el repositorio no incluye resultados de benchmarks publicados ni un pipeline declarado en HuggingFace, por lo que su validacion externa esta pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal (vision-language) del modelo base Gemma 4 31B; ajuste mediante adaptador LoRA y cabeza de regresion |
| Parametros totales | 31 000 millones (modelo base); el repositorio contiene el adaptador LoRA y la cabeza de regresion (0,5 GB) |
| Parametros activos | no aplica (arquitectura densa) |
| Longitud de contexto | 256 000 tokens (heredada del modelo base Gemma 4) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | mas de 140 idiomas en el modelo base; no se especifica la cobertura del ajuste |
| Licencia | apache-2.0 (declarada por el repositorio); conviene verificar los terminos del modelo base Gemma 4 |
| Formato de pesos | safetensors (adaptador LoRA PEFT); requiere el modelo base para la inferencia |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 4, una familia de transformadores decoder que combina variantes densas y de mezcla de expertos (MoE) en cinco tamanos: E2B, E4B, 12B, 26B A4B y 31B. La variante empleada aqui es la de 31B, densa y multimodal (procesa texto e imagenes), con soporte nativo del rol de sistema, una ventana de contexto de hasta 256 000 tokens y multitoken prediction mediante un modelo borrador dedicado que habilita decodificacion especulativa sin perdida de calidad. Gemma 4 comparte tecnologia con la familia Gemini de Google DeepMind.

Sobre esa base, CNCL-Penn-State ha anadido un adaptador LoRA y una cabeza de regresion que transforma la salida del modelo en una puntuacion continua de originalidad en la escala 10-50. El entrenamiento se realizo sobre MuCE-ORACL-Glimmer con 215 413 respuestas durante dos epocas, seleccionando la segunda por menor error de validacion. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. El repositorio incluye el adaptador, la cabeza de regresion, un script de puntuacion (`scoring.py`), un fichero `release.json` con la revision del modelo base y un `verification.json` con detalles de verificacion.

## Capacidades

- Puntuacion de originalidad y creatividad de respuestas textuales: devuelve un valor continuo en la escala nominal 10-50.
- Evaluacion de dibujos: acepta imagenes mediante los parametros `stimulus_image` y `response_image`, ademas del texto de la instruccion y la respuesta.
- Regresion multimodal: combina contexto textual (consigna e item) con estimulos visuales en una unica inferencia.
- Tareas de creatividad basadas en consignas: por ejemplo, usos alternativos de objetos, con soporte para la instruccion completa y el contexto del item.
- Capacidades heredadas del modelo base Gemma 4 31B IT: generacion de texto, razonamiento, codigo y comprension de imagenes.
- Multilingueismo potencial: el modelo base cubre mas de 140 idiomas, aunque no se documenta el comportamiento del ajuste fuera del ingles.
- Soporte de rol de sistema, heredado de Gemma 4, para estructurar la conversacion.
- No se documenta soporte explicito de tool calling, function calling ni flujos de agente en la informacion disponible.

## Casos de uso

- Correccion automatica de pruebas psicometricas de creatividad: el modelo puntua respuestas abiertas a consignas tipo "usos alternativos de un objeto" con una escala continua, sustituyendo la evaluacion manual de miles de respuestas por inferencia por lotes.
- Evaluacion de tests de dibujo creativo: gracias a la entrada `stimulus_image` y `response_image`, permite puntuar producciones graficas junto a su consigna, algo que un modelo puramente textual no puede abordar.
- Investigacion en psicologia de la creatividad: integrado en un pipeline de analisis, permite procesar los 215 413 registros de un estudio con criterios homogeneos y reproducibles, reduciendo la varianza entre evaluadores humanos.
- Pre-etiquetado de datos para reentrenamiento: las puntuaciones generadas pueden usarse como etiquetas iniciales que luego se revisan, acelerando la anotacion de nuevos corpus creativos.
- Seleccion y ranking de contenido creativo: en plataformas educativas o de generacion de contenido, el modelo puede ordenar candidatos por originalidad estimada antes de una revision humana.
- Evaluacion educativa a escala: centros y programas de talento pueden puntuar ejercicios de creatividad de forma automatica y comparable entre cohortes.
- Auditoria de sesgos en evaluacion: al ser determinista y configurable, permite estudiar si las puntuaciones de creatividad varian sistematicamente por idioma, demografia o tipo de estimulo.
- Control de calidad en generacion de contenido asistida por IA: comparar la originalidad de distintas salidas generadas para filtrar respuestas redundantes o poco novedosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento documentado es el proceso de seleccion de epoca: de las dos epocas de entrenamiento sobre 215 413 respuestas, la epoca 2 fue elegida por presentar el menor error de validacion. No se proporcionan valores numericos de ese error ni comparaciones con otros evaluadores.

## Requisitos de hardware

- Los requisitos corresponden al modelo base de 31 000 millones de parametros mas la cabeza de regresion; el repositorio solo contiene el adaptador (0,5 GB), por lo que es imprescindible descargar y cargar google/gemma-4-31B-it.
- Inferencia en precision completa (bf16/fp16): aproximadamente 62-70 GB de VRAM solo para pesos, mas activaciones, cache KV y el codificador de vision. Recomendado en A100 80 GB, H100 80 GB o dos GPU de 48 GB.
- Inferencia en 8 bits: en torno a 31-35 GB, viable en A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB.
- Inferencia en 4 bits: en torno a 18-20 GB, lo que permite ejecucion en una RTX 4090 24 GB o una RTX 3090 24 GB, con margen limitado por el contexto largo.
- La ventana de contexto de 256 000 tokens incrementa de forma notable el consumo de memoria de la cache KV; en GPU de consumo conviene limitar la longitud efectiva.
- Opciones de despliegue: el script oficial (`scoring.py` con la clase `GemmaScorer`) requiere un entorno CUDA con `requirements-tested.txt`. Ademas, el adaptador PEFT puede cargarse sobre el modelo base en vLLM, TGI, llama.cpp u Ollama para tareas de generacion, aunque la cabeza de regresion y la logica de puntuacion necesitan el codigo proporcionado.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ORACL-Gemma-4-31B-Full | 31B (base) + cabeza de regresion | 256K tokens | Puntuacion de creatividad multimodal | apache-2.0 (repositorio) | HuggingFace, 0 descargas |
| google/gemma-4-31B-it | 31B denso | 256K tokens | Asistente multimodal general | no disponible | HuggingFace |
| google/gemma-4-26B-A4B | 26B totales, 4B activos (MoE) | 256K tokens | Asistente multimodal general | no disponible | HuggingFace |
| google/gemma-4-12B | 12B denso | 256K tokens | Asistente multimodal general | no disponible | HuggingFace |

La comparacion directa de rendimiento no es posible: no hay benchmarks publicados para el ajuste y los modelos base comparados resuelven tareas distintas (generacion general frente a regresion de creatividad). No se han identificado en la informacion disponible otros modelos abiertos especializados en puntuacion automatica de creatividad multimodal.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones externas; el rendimiento real del modelo no esta validado por terceros.
- El repositorio registra 0 descargas y 0 "me gusta", por lo que carece de trazabilidad de uso en comunidad.
- La salida es una puntuacion en una escala nominal 10-50; su interpretacion como medida absoluta de creatividad depende de la calibracion del estudio original y del error de validacion, que no se detalla.
- Riesgo de alucinacion y de puntuaciones inestables ante consignas, items o idiomas distintos de los vistos en MuCE-ORACL-Glimmer.
- La evaluacion de creatividad es inherentemente subjetiva y culturalmente dependiente; pueden aparecer sesgos asociados al dataset de entrenamiento, al idioma o al tipo de estimulo.
- La cobertura multilingue del ajuste no esta documentada, aunque el modelo base soporte mas de 140 idiomas.
- El uso comercial esta sujeto a la licencia declarada por el repositorio (apache-2.0), pero conviene verificar los terminos del modelo base Gemma 4, que pueden imponer condiciones adicionales.
- El repositorio contiene unicamente el adaptador y la cabeza de regresion; sin el modelo base no es funcional, y la puntuacion requiere el codigo propio del proyecto.
- El contexto maximo de 256 000 tokens es una capacidad del modelo base; no se especifica si el ajuste conserva un rendimiento uniforme en ventanas muy largas.
- No se documenta soporte de tool calling, agentes ni integracion por API, por lo que en produccion habria que construir esa capa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CNCL-Penn-State/ORACL-Gemma-4-31B-Full
- Dataset MuCE-ORACL-Glimmer: https://huggingface.co/datasets/CNCL-Penn-State/MuCE-ORACL-Glimmer
- Modelo base google/gemma-4-31B-it: https://huggingface.co/google/gemma-4-31B-it
- Modelo base google/gemma-4-31B: https://huggingface.co/google/gemma-4-31B
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Vision general de Gemma 4 para desarrolladores: https://ai.google.dev/gemma/docs/core
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Pagina general de la familia Gemma: https://deepmind.google/models/gemma/
