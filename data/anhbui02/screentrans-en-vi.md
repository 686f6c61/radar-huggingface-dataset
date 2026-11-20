# anhbui02/screentrans-en-vi

## Resumen

screentrans-en-vi es un modelo de traduccion automatica ingles-vietnamita derivado de Helsinki-NLP/opus-mt-en-vi, el modelo de la familia OPUS-MT desarrollada por el grupo Language Technology de la Universidad de Helsinki. El autor del ajuste fino es anhbui02, que lo ha especializado para el dominio de dialogo de videojuegos dentro de un proyecto llamado ScreenTrans, segun indica la model card. El modelo base se presento en el trabajo de Tiedemann y Thottingal (2020) sobre traduccion neuronal de codigo abierto para pares linguisticos de bajos recursos.

Tecnicamente es un transformer encoder-decoder de arquitectura Marian, con 71.678.901 parametros totales y un repositorio de solo 0,3 GB. El ajuste se ha realizado sobre datos con licencias abiertas listadas en un fichero DATA_LICENSES.md del repositorio, lo que sugiere un esfuerzo por mantener trazabilidad de las fuentes. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las obligaciones de atribucion de dicha licencia.

Su relevancia es limitada pero concreta: cubre un nicho poco atendido como es la traduccion de dialogos de videojuegos del ingles al vietnamita, un par linguistico con menos recursos que los pares europeos habituales. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, no declara pipeline y no publica resultados de evaluacion, por lo que debe considerarse un artefacto experimental o de uso interno mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parametros totales | 71.678.901 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Marian del modelo base Helsinki-NLP/opus-mt-en-vi: un transformer encoder-decoder con atencion multi-cabeza estandar, pensado originalmente para traduccion automatica neuronal y entrenado por el proyecto OPUS-MT sobre corpus paralelos de OPUS. Marian es una implementacion eficiente de transformer orientada a traduccion, con vocabularios SentencePiece y una configuracion de tamano contenido que explica los aproximadamente 72 millones de parametros. El ajuste fino realizado por anhbui02 parte de esos pesos y los especializa en dialogos de videojuegos, segun la model card, sobre datos abiertamente licenciados documentados en DATA_LICENSES.md.

No se dispone de informacion sobre el numero de tokens de entrenamiento del ajuste fino, la composicion exacta del dataset, la presencia de RLHF o DPO, ni hiperparametros como tasa de aprendizaje, numero de epocas o estrategia de enmascaramiento. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o tecnicas de cuantizacion consciente. La unica informacion verificable sobre el proceso es la identidad del modelo base y la declaracion de que los datos de ajuste cuentan con licencias abiertas.

## Capacidades

- Traduccion automatica directa del ingles al vietnamita, unica direccion declarada en la model card y en los tags del repositorio.
- Especializacion en registro de dialogo de videojuegos, lo que puede traducirse en mejor manejo de frases cortas, coloquialismos y estructuras conversacionales que un modelo generico.
- Generacion de texto condicionada a la entrada, sin capacidad declarada de instrucciones libres ni de chat multi-turno.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- Capacidad multilingue limitada estrictamente al par en-vi; no cubre otros idiomas.
- No se declaran capacidades de vision, audio, thinking mode ni modos especiales de inferencia.

## Casos de uso

- Localizacion de dialogos de videojuegos: el modelo se ha ajustado especificamente sobre dialogos de este dominio, por lo que es adecuado para traducir lineas de personajes, menus y textos de misiones del ingles al vietnamita en fases de prelocalizacion o como primera pasada para revisores humanos.
- Traduccion de subtitulos y textos de interfaz en proyectos de tamano pequeno: su tamano de 72 millones de parametros permite ejecutarlo en CPU y en GPUs de gama baja, lo que lo hace viable para pipelines ligeros de traduccion por lotes sin infraestructura dedicada.
- Prototipado rapido de funcionalidades de traduccion: al ser un modelo Marian estandar en safetensors, se puede cargar con la libreria transformers y desplegar en minutos, util para validar flujos de traduccion antes de invertir en modelos mayores.
- Generacion de datos sinteticos paralelos: puede emplearse para producir pares en-vi de dominio videojuego que sirvan como datos de aumento o de arranque para entrenar o evaluar otros sistemas.
- Traduccion asistida en herramientas de moderacion o soporte de comunidades vietnamitas: para convertir mensajes cortos de jugadores del ingles al vietnamita en paneles internos, siempre con revision humana dada la ausencia de metricas publicadas.
- Investigacion sobre ajuste fino de modelos OPUS-MT: sirve como caso de estudio reproducible de especializacion de dominio sobre un modelo base publico con licencia permisiva, util para comparar estrategias de fine-tuning en pares linguisticos de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): en torno a 0,3 GB para los pesos, mas overhead de activaciones y del tokenizador; cabe holgadamente en cualquier GPU con 2 GB o mas.
- VRAM estimada en fp16: aproximadamente 0,15 GB para los pesos, con overhead adicional minimo.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090, asi como GPUs de portatil con 4 GB o mas; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU discreta de los ultimos diez anos y en iGPUs con memoria compartida suficiente.
- Opciones de despliegue: transformers con pipeline de traduccion, ademas de los formatos compatibles con Marian en la libreria; no se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo, se espera una latencia de decenas de milisegundos por frase en GPU y de orden de decimas de segundo en CPU, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| anhbui02/screentrans-en-vi | 71,7 M | no disponible | en, vi | Apache 2.0 | ajuste fino de dominio, sin benchmarks |
| Helsinki-NLP/opus-mt-en-vi | no disponible | no disponible | en, vi | Apache 2.0 (modelo base) | modelo base generico, ampliamente usado |
| Helsinki-NLP/opus-mt-en-vi (variantes comunitarias) | variable | no disponible | en, vi | variable | multiples ajustes finos con distinto grado de documentacion |
| NLLB-200 (variante distilled 600M) | 600 M | 512 tokens | 200 idiomas | CC-BY-NC 4.0 | modelo multilingue de referencia, no comercial |

La comparacion directa con el modelo base es la mas relevante: screentrans-en-vi anade especializacion de dominio sobre opus-mt-en-vi, pero no publica metricas que cuantifiquen la mejora ni el posible olvido catastrofico en dominios generales. Frente a NLLB-200, el modelo de Meta ofrece cobertura multilingue mucho mayor y contexto documentado, pero con licencia no comercial, mientras que screentrans-en-vi es Apache 2.0 y mucho mas ligero, aunque limitado a un unico par linguistico y sin evaluacion publica.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay BLEU, chrF ni evaluacion humana publicada, por lo que no se puede afirmar que el ajuste fino mejore al modelo base.
- Riesgo de sobreajuste al dominio de videojuegos: al haberse entrenado sobre dialogos, puede degradar su rendimiento en textos tecnicos, legales o literarios fuera de ese registro.
- Riesgo de alucinacion y de traducciones fluentemente incorrectas, inherente a los modelos Marian pequenos, especialmente en frases largas o con referencias culturales.
- Longitud de contexto no documentada; los modelos Marian suelen limitarse a secuencias de unos cientos de tokens, lo que puede truncar parrafos largos.
- Solo cubre el par ingles-vietnamita; no es un modelo multilingue ni admite traduccion inversa vi-en.
- Sesgos desconocidos: no se documenta analisis de sesgo de genero, dialectal ni cultural en la traduccion al vietnamita.
- Aunque la licencia Apache 2.0 permite uso comercial, la model card remite a DATA_LICENSES.md para las fuentes de datos; conviene verificar ese fichero antes de un despliegue comercial para confirmar la compatibilidad de las licencias de los corpus de ajuste.
- Cero descargas y cero likes: no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- No se declara pipeline en Hugging Face, lo que puede complicar el uso directo con el pipeline de transformers sin especificar la tarea manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anhbui02/screentrans-en-vi
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-vi
- Paper de OPUS-MT (Tiedemann y Thottingal, 2020): https://arxiv.org/abs/2008.05779
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Proyecto OPUS de corpus paralelos: https://opus.nlpl.eu/
