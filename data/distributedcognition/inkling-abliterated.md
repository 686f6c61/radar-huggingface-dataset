# distributedcognition/inkling-abliterated

## Resumen

Inkling-abliterated es una variante "abliterated" del modelo multimodal MoE thinkingmachines/Inkling, publicada por el usuario distributedcognition. El modelo base tiene 975.000 millones de parametros totales con 41.000 millones activos por token, una arquitectura MoE multimodal de 66 capas. La intervencion elimina la direccion de rechazo mediante la tecnica de "abliteration" biproyectada con preservacion de norma descrita por grimjim (2025), sin reentrenar el modelo.

El repositorio contiene dos escalas de abliteracion como ramas de git: la rama `main` aplica escala 2.5 y la rama `scale-3.0` aplica escala 3.0. Ambas comparten los mismos objetos LFS, de modo que cambiar de rama no implica volver a descargar los pesos. Los pesos se distribuyen en formato NVFP4 con los tensores abliterados en BF16 sin cuantizar, en lo que el autor describe como un espejo byte-compatible del checkpoint NVFP4 original con 100 tensores sustituidos quirurgicamente.

Su relevancia es doble: por un lado, demuestra que la abliteracion aplicada a un modelo de 975.000 millones de parametros no sale gratis (a diferencia de lo observado por el autor en Inkling-Small y DeepSeek-V4.1-Flash), y por otro, publica las direcciones de rechazo medidas de las 66 capas junto con la configuracion completa, lo que permite volver a aplicar la abliteracion a cualquier escala en segundos partiendo de los pesos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal, transformer de 66 capas (modelo base thinkingmachines/Inkling) |
| Parametros totales | 975.000 millones (975B) |
| Parametros activos | 41.000 millones (41B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits) en los expertos enrutados; BF16 sin cuantizar en atencion y expertos compartidos; 100 tensores abliterados almacenados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint NVFP4 con tensores BF16 parcheados, distribuido via git+LFS con ramas `main` y `scale-3.0`; el formato de fichero no se explicita en la model card |
| Tamano del repositorio | 189,6 GB segun HuggingFace; la model card indica aproximadamente 594 GB para los pesos NVFP4 (discrepancia no explicada) |
| Modelo base | thinkingmachines/Inkling |
| Metodo de intervencion | Abliteration biproyectada con preservacion de norma |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal de 66 capas con 975B de parametros totales y 41B activos. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO, por lo que esos datos quedan como no disponibles. Toda la informacion tecnica disponible se refiere al proceso de abliteracion, no al entrenamiento del modelo original.

La intervencion se aplico sobre las capas 9 a 58 con direcciones de rechazo medidas por capa. Los componentes modificados son `attn.wo_ud` (proyeccion de salida de atencion) y `mlp.shared_experts.shared_w2` (proyeccion descendente de los expertos compartidos). La medicion se realizo con 128 prompts daninos y 128 prompts inocuos, tomando el residuo del ultimo token en la entrada de `attn_norm` de cada capa. En total se parchean 100 tensores (50 capas por 2 tensores). Como el checkpoint NVFP4 almacena la atencion y los expertos compartidos en BF16 sin cuantizar, la abliteracion consiste en una sustitucion quirurgica: los expertos enrutados cuantizados a 4 bits permanecen identicos byte a byte respecto al modelo original. La operacion es de rango 1 y preserva la norma, pero no es lineal respecto a la escala, por lo que el autor recomienda reaplicarla siempre desde los pesos base sin abliterar.

## Capacidades

- Generacion de texto y razonamiento multimodal: todas las modalidades atraviesan el mismo decodificador abliterado de 66 capas.
- Entrada de imagen y audio: la model card indica que la supresion del rechazo se generaliza a entradas de imagen y audio (confirmado en Inkling-Small con prompts daninos presentados como imagen, no medido de forma separada en este modelo).
- Razonamiento matematico basico: la unica capacidad evaluada es GSM8K, con un subconjunto reducido de 20 problemas en modo chat y decodificacion greedy.
- Re-abliteracion configurable: el repositorio incluye `refusal_directions.pt` con las 66 direcciones de rechazo medidas, lo que permite aplicar la abliteracion a cualquier escala sobre los pesos originales.
- Ausencia de rechazos integrados: la intervencion elimina las respuestas de negativa del modelo base (de 98/100 a 10/100 segun juez LLM).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multipaso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Modo thinking explicito, vision o audio documentados de forma independiente: no disponibles.

## Casos de uso

- Red teaming y evaluacion de seguridad: el modelo sirve para generar respuestas que un modelo alineado rechazaria, lo que permite probar la robustez de clasificadores de entrada y salida (por ejemplo, Llama Guard) frente a contenido danino generado de forma explicita.
- Investigacion en interpretabilidad de direcciones de rechazo: al publicar las 66 direcciones medidas y la configuracion de abliteracion, permite estudiar como se representa el rechazo en un MoE de 975B y reproducir experimentos a distintas escalas sin volver a medir.
- Fine-tuning posterior sobre un modelo sin rechazos integrados: util como punto de partida cuando se quiere controlar por completo la politica de seguridad en lugar de heredar la del modelo base, aplicando moderacion propia en la capa de aplicacion.
- Estudio del compromiso capacidad-seguridad: comparar las ramas 2.5 y 3.0 permite cuantificar el coste en capacidad (GSM8K de 90% a 65% y 75%) frente a la reduccion de rechazos, un caso de analisis poco frecuente a esta escala.
- Procesamiento multimodal sin filtros de contenido: tratamiento de imagenes o audio en pipelines donde el modelo base rechazaria la tarea por considerar el contenido sensible, siempre con moderacion externa obligatoria.
- Base para destilacion o generacion de datos sinteticos: generar respuestas amplias y sin negativas que despues se filtran y se usan para entrenar variantes mas pequenas, asumiendo la perdida de calidad medida en GSM8K.
- Despliegue en entornos de investigacion controlados: servir el modelo con vLLM o SGLang en infraestructura aislada para experimentos que no pueden depender de la politica de rechazo del modelo original.

## Benchmarks y rendimiento

Los resultados proceden de la evaluacion incluida por el autor en la model card. El protocolo usa 100 prompts daninos reservados del split de test de `mlabonne/harmful_behaviors` con deteccion por marcadores de palabra clave y rechazo juzgado por LLM (el propio modelo base sin modificar clasifica cada respuesta como REFUSAL o COMPLIANT), divergencia KL sobre 100 prompts inocuos de `mlabonne/harmless_alpaca` y una muestra de 20 problemas de GSM8K en modo chat con decodificacion greedy.

| Metrica | Base | Escala 2.5 (`main`) | Escala 3.0 (`scale-3.0`) |
|---|---|---|---|
| Rechazos, juez LLM (X/100) | 98 | 10 | 16 |
| Rechazos, marcadores de palabra clave (X/100) | 58 | 5 | 11 |
| Divergencia KL (base hacia abliterado, 100 prompts inocuos) | 0 | 1,106 | 1,591 |
| GSM8K (20 problemas, greedy) | 18/20 (90%) | 13/20 (65%) | 15/20 (75%) |

El autor advierte que la metrica por marcadores infravalora los rechazos en la version abliterada (5/100 en la escala 2.5) porque el modelo responde con texto conforme sin formulas de negativa, y que la cifra honesta es la del juez LLM (10/100), donde los 10 casos restantes son en su mayoria respuestas evasivas a prompts de sintesis o CBRN. Tambien senala que la muestra de 20 problemas de GSM8K tiene un ruido aproximado de mas o menos 20 puntos porcentuales, pero que la divergencia KL corrobora un desplazamiento real de la distribucion. No hay resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la model card indica aproximadamente 594 GB de pesos NVFP4, por lo que se necesita un agregado de al menos 600 GB de VRAM solo para los pesos, mas el margen para cache KV y activaciones (no cuantificado en la informacion disponible).
- GPU recomendadas: un nodo de 8 x H100 de 80 GB (640 GB) es el minimo razonable segun el tamano de pesos; tambien encaja en 8 x B200 de 192 GB o configuraciones equivalentes de mayor capacidad por GPU.
- GPU de consumo: no, el modelo no cabe en ninguna GPU de consumo, ni siquiera con cuantizacion agresiva a 4 bits, dado que los pesos declarados superan los 500 GB.
- Opciones de despliegue: vLLM (`vllm serve`), SGLang, transformers con la implementacion oficial `models/inkling` y `trust_remote_code=True`, y unsloth. El autor indica que la carga es identica a la del checkpoint upstream NVFP4.
- Latencia y throughput estimados: no disponibles.
- Nota de coherencia: el tamano de repositorio notificado por HuggingFace (189,6 GB) no coincide con los aproximadamente 594 GB de pesos NVFP4 que indica la model card; conviene verificar el espacio real en disco antes de descargar.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Rendimiento observado | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-abliterated, escala 2.5 (`main`) | 975B / 41B | no disponible | Apache 2.0 | GSM8K 13/20 (65%), KL 1,106, rechazos LLM 10/100 | HuggingFace, rama `main` |
| Inkling-abliterated, escala 3.0 (`scale-3.0`) | 975B / 41B | no disponible | Apache 2.0 | GSM8K 15/20 (75%), KL 1,591, rechazos LLM 16/100 | HuggingFace, rama `scale-3.0` |
| thinkingmachines/Inkling (base) | 975B / 41B | no disponible | no disponible | GSM8K 18/20 (90%), rechazos LLM 98/100 | HuggingFace |
| Inkling-Small | no disponible | no disponible | no disponible | no disponible; la model card indica que la abliteration fue "practicamente gratis" | mencionado en la model card |
| DeepSeek-V4.1-Flash | no disponible | no disponible | no disponible | no disponible; la model card indica que la abliteration fue "practicamente gratis" | mencionado en la model card |

La comparacion con Inkling-Small y DeepSeek-V4.1-Flash solo puede hacerse de forma cualitativa: la model card afirma que en esos dos casos la abliteration no tuvo coste medible en capacidad, mientras que en el modelo de 975B si lo tiene. No se aportan cifras de parametros, contexto ni licencia para esos dos modelos.

## Limitaciones y advertencias

- La abliteration elimina los rechazos integrados. El propio autor recomienda anadir moderacion de entrada y salida (por ejemplo, Llama Guard) para cualquier despliegue en produccion y no confiar en los rechazos retirados.
- Solo se han publicado comprobaciones puntuales de capacidad: GSM8K con 20 problemas y divergencia KL. No hay evaluacion sobre la suite completa de benchmarks.
- La divergencia KL entre 1,106 y 1,591 indica una perturbacion moderada del comportamiento en prompts inocuos; hay que validar el modelo sobre las cargas de trabajo propias antes de desplegarlo.
- El descenso en GSM8K es notable: del 90% del modelo base al 65% en la escala 2.5 y al 75% en la escala 3.0. Aunque la muestra es ruidosa, la KL lo respalda.
- Los 10 rechazos residuales de la escala 2.5 son en su mayoria respuestas evasivas a los prompts mas peligrosos (CBRN y sintesis), no negativas explicitas, lo que complica su deteccion automatica.
- La abliteration es de rango 1 y preserva la norma, pero no es lineal respecto a la escala. Reaplicarla desde los pesos ya abliterados produce resultados incorrectos; hay que partir siempre del modelo base sin modificar.
- La medicion de la generalizacion multimodal proviene de un modelo distinto (Inkling-Small) y no se ha verificado de forma independiente en este checkpoint.
- Longitud de contexto e idiomas soportados no estan documentados en la informacion disponible, lo que impide planificar despliegues multilingues o de contexto largo.
- El repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.
- Discrepancia entre el identificador de HuggingFace (`distributedcognition/inkling-abliterated`) y los comandos de la model card, que usan `distributedcog/Inkling-abliterated`; conviene verificar la ruta correcta antes de automatizar la descarga.
- Diferencia de tamano entre los 189,6 GB del repositorio y los aproximadamente 594 GB de pesos NVFP4 declarados en la model card.
- La licencia del repositorio es Apache 2.0, pero no se especifica la licencia del modelo base en la informacion disponible; conviene comprobar los terminos de `thinkingmachines/Inkling` antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/distributedcognition/inkling-abliterated
- Modelo base: https://huggingface.co/thinkingmachines/Inkling
- Referencia al checkpoint NVFP4 original: thinkingmachines/Inkling-NVFP4 (mencionado en la model card, sin URL directa)
- Metodo de abliteration: grimjim (2025), "norm-preserving biprojected abliteration" (referencia citada en la model card, sin URL directa)
- Dataset de evaluacion de rechazos: `mlabonne/harmful_behaviors` (split de test)
- Dataset de evaluacion de divergencia KL: `mlabonne/harmless_alpaca`
- Artefactos incluidos en el repositorio: `refusal_directions.pt`, `eval_results.json`, `abliteration_config.json`
- No se han encontrado en la busqueda web enlaces relevantes adicionales; los resultados devueltos corresponden a canales de YouTube sin relacion con el modelo.
