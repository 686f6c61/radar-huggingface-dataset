# gimbobimbo/NSFW_Wan_1.3b

## Resumen

NSFW_Wan_1.3b es un ajuste fino (finetune) del modelo de generacion de video texto-a-video Wan-AI/Wan2.1-T2V-1.3B, desarrollado por el usuario gimbobimbo y publicado en HuggingFace. Se trata de un modelo de 1.300 millones de parametros especializado en la generacion de clips de video cortos con contenido para adultos (NSFW), a partir de descripciones en lenguaje natural. Su proposito declarado es servir como herramienta de investigacion y creacion capaz de renderizar escenarios, esteticas y acciones del ambito adulto con coherencia temporal.

El modelo parte de la arquitectura transformer de texto-a-video de Wan 2.1 en su variante de 1,3B de parametros. El autor publica dos series de checkpoints: una serie original (etiquetada como *legacy*, epochs `e1` a `e20`) y una serie experimental (epochs `exp_e1` a `exp_e14`) entrenada con una metodologia revisada para corregir problemas de calidad. La serie original se entreno en dos fases: una primera fase solo con imagenes y una segunda solo con video, lo que provoco un colapso de la comprension anatomica ("catastrophic forgetting") y artefactos descritos como "body horror". La serie experimental se entreno en una unica ejecucion sobre un dataset mixto de 30.000 clips de video y 20.000 imagenes estaticas de forma simultanea.

Su relevancia actual radica en que es un ejemplo de especializacion de un modelo base abierto (Wan 2.1 T2V 1.3B, con licencia Apache 2.0) hacia un dominio restringido y sensible, redistribuido bajo la licencia CreativeML OpenRAIL-M, que incorpora clausulas de uso restringido. El repositorio ocupa 105,4 GB e incluye los pesos en formato safetensors, varios checkpoints intermedios y un fichero `prompting-guide.json` con convenciones de prompting.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de texto-a-video (T2V) de Wan 2.1 |
| Parametros totales | 1.300 millones (1,3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en precision completa; no se documentan variantes GGUF o cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer de generacion de video texto-a-video de Wan 2.1 en su variante ligera de 1,3B de parametros, desarrollada por Wan-AI y publicada con licencia Apache 2.0. No se documentan en la informacion disponible innovaciones arquitectonicas adicionales introducidas por el ajuste fino; la contribucion del autor se limita a la especializacion del modelo base mediante entrenamiento adicional sobre un corpus especifico.

El entrenamiento se describe en dos metodologias. La serie original (legacy) se estructuro en dos fases: las epochs 1 a 10 se ajustaron principalmente sobre un gran dataset de imagenes NSFW, y las epochs 11 a 20 se entrenaron exclusivamente sobre video para dotar al modelo de coherencia temporal. Segun el propio autor, la primera fase fue demasiado agresiva y provoco un olvido catastrofico que colapso la comprension de anatomia coherente (rostros, manos), y la segunda fase no logro recuperar la calidad perdida, generando salidas distorsionadas. La serie experimental corrige esto con una unica ejecucion sobre un dataset mixto de 30.000 clips de video y 20.000 imagenes estaticas de forma simultanea, con ratio de aprendizaje mas conservador, batches mas pequenos y un calendario de entrenamiento mas corto. El dataset original se compone de las 1.000 publicaciones mas destacadas de aproximadamente 1.250 subreddits de contenido adulto, con captions derivados de las convenciones de etiquetado de dichas comunidades. El autor no documenta el uso de RLHF ni DPO.

## Capacidades

- Generacion de video texto-a-video: produce clips cortos a partir de prompts en lenguaje natural dentro del dominio adulto.
- Coherencia temporal nativa: la serie experimental y las epochs de video de la serie original generan movimiento coherente sin necesidad de LoRAs auxiliares, segun el autor.
- Comprension de un amplio espectro de escenarios NSFW, esteticas, arquetipos de personajes y acciones descritas en lenguaje natural.
- Prompting guiado por convenciones: incluye un fichero `prompting-guide.json` con vocabulario y etiquetas asociadas a las comunidades de origen para facilitar la redaccion de prompts.
- Entrenamiento de LoRA: el checkpoint recomendado (`wan_1.3B_exp_e14.safetensors`) se indica como base adecuada para entrenar LoRAs.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible (es un modelo generativo de video, no un modelo de lenguaje conversacional).
- Capacidades multilingues: no disponibles (no se documentan idiomas).
- Capacidades especiales: especializacion NSFW; no se documentan modos de "thinking", vision ni audio.

## Casos de uso

- Investigacion sobre especializacion de dominios en modelos generativos de video: permite estudiar como un modelo base abierto de T2V se comporta al ser ajustado sobre un corpus tematico restringido y como se degrada su calidad espacial y temporal en funcion del regimen de entrenamiento (comparacion entre la serie legacy y la experimental).
- Analisis de fallos de entrenamiento en dos fases frente a regimen mixto: el propio autor documenta el "catastrophic forgetting" de la primera fase y su correccion con un dataset mixto de imagen y video; util como caso de estudio de estrategias de regularizacion espacial.
- Prototipado creativo de contenido adulto: generacion de clips cortos a partir de descripciones textuales para flujos de produccion creativa dentro del ambito permitido por la licencia OpenRAIL-M.
- Entrenamiento de LoRA especializadas: el checkpoint `wan_1.3B_exp_e14` se ofrece como base para ajustar LoRAs adicionales de estilo, personaje o accion sobre el dominio adulto.
- Evaluacion de sesgos y riesgos en modelos NSFW: permite auditar que tipo de contenido se genera, con que fidelidad anatomica y que sesgos de representacion aparecen, util para equipos de moderacion e investigacion en seguridad.
- Benchmarking de fidelidad anatomica en T2V: la documentacion de artefactos tipo "body horror" y su mitigacion sirve como referencia para medir calidad de generacion de cuerpos, rostros y manos en modelos de video de 1,3B.
- Pipeline de generacion por lotes para investigacion: dado el formato safetensors y el tamano manejable (1,3B), puede desplegarse en infraestructura de laboratorio para generar lotes de clips y analizarlos estadisticamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FVD, CLIP score, evaluaciones humanas, etc.) ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- No se documentan en la informacion proporcionada requisitos de VRAM, GPUs recomendadas ni tasas de latencia o throughput.
- Estimacion general (no confirmada por el autor): un modelo de video de 1.300 millones de parametros suele requerir del orden de 6 a 12 GB de VRAM en precision de 16 bits para inferencia, dependiendo de la resolucion y del numero de fotogramas generados, y mas si se emplean pasos de difusion largos o resoluciones altas. Este dato debe verificarse experimentalmente.
- El modelo base Wan2.1-T2V-1.3B esta disenado para ser ejecutable en GPUs de consumo, aunque no se confirma para este finetune concreto.
- No se documentan opciones de despliegue especificas (vLLM, llama.cpp, Ollama, TGI) ni disponibilidad de cuantizaciones GGUF en el repositorio.
- El repositorio ocupa 105,4 GB, principalmente por los multiples checkpoints en safetensors; se recomienda descargar unicamente el checkpoint deseado en lugar del repositorio completo.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NSFW_Wan_1.3b (gimbobimbo) | 1,3B | T2V, finetune NSFW | no disponible | CreativeML OpenRAIL-M | HuggingFace, Civitai |
| Wan-AI/Wan2.1-T2V-1.3B (base) | 1,3B | T2V generalista | no disponible | Apache 2.0 | HuggingFace, ModelScope |
| NSFW-API/NSFW_Wan_1.3b | 1,3B | T2V, finetune NSFW | no disponible | no disponible en la informacion recogida | HuggingFace |

El modelo base Wan-AI/Wan2.1-T2V-1.3B es la referencia directa: mismo tamano, misma arquitectura y licencia mas permisiva (Apache 2.0), pero sin especializacion NSFW. La existencia de un repositorio espejo o fork con identificador `NSFW-API/NSFW_Wan_1.3b` sugiere redistribucion del mismo artefacto, aunque no se dispone de datos de rendimiento que permitan comparar ambos. No se dispone de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado como `not-for-all-audiences` y genera material explicito; no es apto para menores ni para entornos sin control de acceso.
- Riesgo de alucinacion y artefactos visuales: el propio autor documenta degradacion de calidad, artefactos y "body horror" en la serie de checkpoints original; la serie experimental corrige parcialmente el problema, pero sigue siendo descrita como experimental.
- Regresion anatomica: la fase de entrenamiento solo con imagenes provoco colapso de la comprension de rostros y manos; conviene verificar la calidad del checkpoint concreto antes de usarlo en produccion.
- Sesgos conocidos: el dataset se construye a partir de las publicaciones mas destacadas de subreddits de contenido adulto, por lo que hereda los sesgos de representacion, estetica y estilo de esas comunidades; no se documentan auditorias de sesgo.
- Limitaciones de contexto e idioma: no se dispone de informacion sobre la longitud de contexto soportada ni sobre los idiomas admitidos, lo que dificulta planificar su uso fuera del ingles.
- Restricciones de licencia: la licensia CreativeML OpenRAIL-M incluye clausulas de uso restringido (prohibicion de usos daninos, contenido ilegal, suplantacion, etc.) que deben revisarse antes de cualquier despliegue, incluido el uso comercial; no es una licencia de codigo abierto permisiva al estilo Apache 2.0.
- Redistribucion: la aparicion de repositorios espejo (por ejemplo `NSFW-API/NSFW_Wan_1.3b`) obliga a verificar el origen y la integridad de los pesos antes de usarlos.
- Ausencia de benchmarks y de especificaciones de hardware: no hay datos publicos de rendimiento, latencia ni requisitos de VRAM, por lo que cualquier estimacion debe validarse en el entorno objetivo.
- Repositorio de gran tamano: 105,4 GB por la acumulacion de checkpoints; conviene descargar solo el fichero necesario para evitar consumo innecesario de almacenamiento.
- Modelo base: este finetune hereda cualquier limitacion del Wan2.1-T2V-1.3B subyacente, incluidas las limitaciones de resolucion, duracion de clips y fidelidad de movimiento del modelo base.

## Enlaces

- HuggingFace (autor): https://huggingface.co/gimbobimbo/NSFW_Wan_1.3b
- Modelo base en HuggingFace: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Modelo base en ModelScope: https://modelscope.ai/models/Wan-AI/Wan2.1-T2V-1.3B
- Repositorio espejo/relacionado en HuggingFace: https://huggingface.co/NSFW-API/NSFW_Wan_1.3b
- Finetunes derivados del espejo: https://huggingface.co/models?other=base_model:finetune:NSFW-API/NSFW_Wan_1.3b
- Ficha en Civitai: https://civitai.red/models/1697081/nsfw-wan-13b-t2v
- Checkpoint en RunningHub: https://www.runninghub.ai/model/public/1930962000820502530
