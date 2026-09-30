# Fireghost228/NSFW_Wan_1.3b

## Resumen

NSFW Wan 1.3B T2V es un ajuste fino (fine-tune) del modelo de generacion de video a partir de texto Wan-AI/Wan2.1-T2V-1.3B, publicado por el usuario Fireghost228 en HuggingFace. Se trata de un modelo de 1.3 mil millones de parametros con arquitectura transformer de difusion para texto-a-video (T2V), especializado en la generacion de contenido para adultos (NSFW). Su objetivo declarado es servir como herramienta de investigacion y creacion capaz de generar clips cortos de video tematicamente explicitos a partir de indicaciones en lenguaje natural.

El modelo parte de la base Wan2.1-T2V-1.3B, que aporta la arquitectura de difusion y la capacidad de coherencia temporal. Sobre ella, el autor aplico un ajuste fino con un corpus de imagenes y videos procedentes de comunidades de Reddit para adultos, ejecutado en varias rondas que han dado lugar a dos familias de checkpoints: la serie original (`e1`-`e20`) y una serie experimental posterior (`exp_e1`-`exp_e14`) disenada para corregir los artefactos de calidad observados en la primera. El autor recomienda el checkpoint `wan_1.3B_exp_e14.safetensors` para uso general.

Su relevancia actual es limitada pero especifica: se posiciona como uno de los pocos fine-tunes publicos de texto-a-video orientados explicitamente al dominio NSFW sobre una base abierta de tamano contenido (1.3B), lo que lo hace ejecutable en hardware de consumo. No obstante, el repositorio no registra descargas ni interacciones en el momento de la consulta, y el contenido esta marcado como no apto para todos los publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion texto-a-video (T2V) |
| Parametros totales | 1.3 mil millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; se infiere que existen variantes fp16/fp32 entre checkpoints) |
| Idiomas soportados | no disponible (los prompts de entrenamiento emplean convenciones en ingles de Reddit) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es la del modelo Wan2.1-T2V-1.3B, un transformer de difusion para generacion de video a partir de texto. El fine-tune no modifica el tipo de arquitectura; se limita a reentrenar los pesos sobre un dominio especifico. El modelo card describe escuetamente la arquitectura como "Text-to-Video Transformer Architecture" y confirma el tamano de 1.3B parametros, sin detallar el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de su origen.

El entrenamiento se realizo en dos metodologias documentadas. La original, por fases, ajusto primero sobre un gran dataset de imagenes NSFW (epocas 1-10) y despues exclusivamente sobre video (epocas 11-20); esta aproximacion provoco un "olvido catastrofico" que degradó la coherencia anatomica a partir de la epoca 3, generando artefactos de tipo "body horror". La metodologia revisada, que produce los checkpoints experimentales, empleo una unica ejecucion sobre un dataset mixto de aproximadamente 30.000 clips de video y 20.000 imagenes fijas de forma simultanea, con una tasa de aprendizaje mas conservadora, lotes mas pequenos y un calendario de entrenamiento mas corto. Los datos de origen son los 1.000 posts mas votados de aproximadamente 1.250 subreddits para adultos, con leyendas basadas en las convenciones de etiquetado de esas comunidades. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de video a partir de texto (text-to-video) de clips cortos con coherencia temporal nativa.
- Generacion de contenido explicito para adultos en un amplio espectro tematico, incluyendo estilos, arquetipos de personajes y acciones descritas en lenguaje natural.
- Generacion de imagenes fijas en los checkpoints de la fase inicial (epocas 1-10 de la serie original).
- Capacidad de generar video sin necesidad de LoRAs auxiliares segun el autor (a partir de las epocas de video de la serie original).
- Soporte de entrenamiento de LoRA sobre los checkpoints experimentales (el autor recomienda `exp_e14` para este fin).
- Soporte de tool calling / function calling: no aplica (modelo generativo de video, no un LLM).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible.
- Capacidad especial: modo de generacion orientada a contenido NSFW; incluye un fichero `prompting-guide.json` con analisis de palabras clave y convenciones de prompting por subreddit de origen.

## Casos de uso

- Investigacion sobre generacion de video en dominio adulto: el modelo permite estudiar el comportamiento de arquitecturas de difusion texto-a-video sobre un dominio especializado y evaluar la degradacion de calidad anatomica tras ajustes finos agresivos, comparando las series `e` y `exp_e`.
- Creacion de contenido para adultos con control por prompt: generacion de clips cortos coherentes a partir de descripciones en lenguaje natural, apoyandose en `prompting-guide.json` para formular prompts alineados con el vocabulario de entrenamiento.
- Base para entrenamiento de LoRA: al estar publicado en safetensors y con checkpoints experimentales estables, sirve como punto de partida para ajustes posteriores de estilo o concepto mediante LoRA, segun recomienda el propio autor.
- Estudio comparativo de metodologias de entrenamiento: las dos familias de checkpoints (entrenamiento por fases frente a entrenamiento mixto) permiten analizar experimentalmente el fenomeno de olvido catastrofico y la contribucion de la regularizacion espacial con imagenes fijas.
- Pruebas de generacion de video en hardware de consumo: al derivar de una base de 1.3B parametros, puede desplegarse en una unica GPU de gama alta o incluso de gama media reciente, lo que facilita la experimentacion sin infraestructura de centro de datos.
- Analisis de sesgos y riesgos en modelos generativos: por su tematica explicita y su origen en datos de Reddit, es util como caso de estudio para auditar sesgos de representacion, contenido no consentido o material problematico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye metricas cuantitativas (FVD, CLIP score, VBench ni similares) para este fine-tune. La busqueda web unicamente referencia el marco Wan-Bench asociado al modelo base Wan2.1-T2V-1.3B, cuyos resultados numericos no se facilitan en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial para este fine-tune. Como referencia de orden de magnitud, un modelo transformer de difusion de 1.3B parametros suele requerir del orden de 6-10 GB de VRAM en precision fp16 para resoluciones bajas (480p), aunque esta cifra no esta confirmada por el autor ni por la documentacion aportada.
- GPU recomendadas: no especificadas en la informacion disponible. Dado el tamano de 1.3B, el modelo deberia ser ejecutable en GPUs de gama alta de consumo; las recomendaciones concretas del autor no figuran en el material.
- Cabe en GPU de consumo: probablemente si, dado el tamano de 1.3B parametros, aunque no se dispone de confirmacion explicita en la informacion facilitada.
- Opciones de despliegue: no disponibles. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM y no aplicables directamente a difusion de video). El formato safetensors sugiere compatibilidad con el ecosistema de difusion (por ejemplo, ComfyUI con soporte Wan), pero esto no se confirma en el material.
- Latencia y throughput estimados: no disponibles.

Nota sobre el repositorio: el tamano de 105,4 GB se explica por la acumulacion de multiples checkpoints (series `e1`-`e20` y `exp_e1`-`exp_e14`) en el mismo repositorio, no por el tamano de un unico modelo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (fine-tunes NSFW de texto-a-video sobre una base abierta del mismo orden de parametros) con datos verificables de parametros, contexto o rendimiento. El unico modelo relacionado documentado es el modelo base Wan-AI/Wan2.1-T2V-1.3B, del que este fine-tune depende:

| Modelo | Parametros | Tipo | Licencia | Relacion |
|---|---|---|---|---|
| NSFW Wan 1.3B T2V (este) | 1.3B | T2V + NSFW | creativeml-openrail-m | Objeto de la ficha |
| Wan-AI/Wan2.1-T2V-1.3B | 1.3B | T2V | no disponible en la informacion | Modelo base |

No se dispone de datos de terceros alternativos con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Riesgo elevado de alucinacion y artefactos visuales: el propio autor documenta problemas de "body horror", degradacion de caras y manos, y colapso anatomico en la serie original de checkpoints. La serie experimental pretende corregirlo, pero el autor solicita retroalimentacion, lo que indica que la solucion no esta plenamente validada.
- Contenido explicito: el modelo esta disenado especificamente para generar material para adultos y esta marcado como "not-for-all-audiences". No es apto para entornos sin control de acceso.
- Sesgos de representacion: los datos de entrenamiento proceden de los posts mas votados de comunidades de Reddit, lo que puede sobrerrepresentar determinados arquetipos, esteticas y practicas, y arrastrar los sesgos demograficos y de genero de esas comunidades.
- Riesgo de contenido no consentido o problematico: al tratarse de un modelo especializado en contenido explicito, existe riesgo de uso para generar material que represente a personas reales sin su consentimiento. Se recomienda extremar las precauciones y verificar la legislacion aplicable.
- Restricciones de licencia: la licencia CreativeML OpenRAIL-M incorpora clausulas de uso restringido, pero no prohibe explicitamente la generacion de contenido para adultos. Es responsabilidad del usuario verificar la compatibilidad con uso comercial y con la normativa local.
- Limitaciones de idioma: no disponible; el vocabulario de entrenamiento se basa en convenciones en ingles de Reddit, por lo que los prompts en otros idiomas pueden degradar notablemente el resultado.
- Ausencia de benchmarks y de comunidad: el repositorio no registra descargas ni interacciones, y no se publican metricas objetivas, lo que dificulta evaluar su calidad frente a alternativas.
- Advertencia para produccion: el modelo card refleja una evolucion inestable (dos metodologias de entrenamiento, multiples checkpoints, calidad variable por epoca). Para cualquier despliegue en produccion seria necesario validar exhaustivamente el checkpoint seleccionado y fijar una version concreta.

## Enlaces

- HuggingFace: https://huggingface.co/Fireghost228/NSFW_Wan_1.3b
- Modelo base en ModelScope: https://modelscope.ai/models/Wan-AI/Wan2.1-T2V-1.3B
- Ficha en Civitai (v14 experimental): https://civitai.red/models/1697081/nsfw-wan-13b-t2v
- Modelo base en HuggingFace (Wan-AI/Wan2.1-T2V-1.3B): no disponible en la informacion proporcionada.
