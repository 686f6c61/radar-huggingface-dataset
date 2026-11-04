# mumu9899/QuakeSense-LLM

## Resumen

QuakeSense-LLM es un modelo de clasificación de texto en cuatro clases desarrollado por el usuario mumu9899, diseñado para identificar la percepción de sacudidas sísmicas expresadas en comentarios de redes sociales chinas (Weibo) tras un terremoto. El modelo parte de DeepSeek-7B-Base y añade un ajuste fino con LoRA junto con una cabeza de clasificación de cuatro clases, lo que lo convierte en una herramienta especializada para el análisis de percepción sísmica a partir de lenguaje natural.

El modelo resuelve un problema concreto: transformar texto libre de redes sociales en una señal estructurada de intensidad percibida, clasificando cada comentario en cuatro categorías que van desde "sin sacudida evidente o irrelevante" hasta "sacudida fuerte o afectado". Es relevante para la investigación en sismología social y la respuesta rápida ante desastres, ya que permite explotar el flujo de comentarios ciudadanos como complemento a los datos instrumentales.

Con 6.490.951.680 parámetros totales (aproximadamente 6,5 mil millones) y un repositorio de 13,0 GB en formato safetensors, el modelo se distribuye con pesos, ficheros de configuración y tokenizer. No se especifican en la información disponible la longitud de contexto, los idiomas soportados ni la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base DeepSeek-7B-Base) con cabeza de clasificación de cuatro clases y ajuste fino LoRA |
| Parametros totales | 6.490.951.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo card indica comentarios en chino de Weibo) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

QuakeSense-LLM se construye sobre DeepSeek-7B-Base, un transformer decoder-only de aproximadamente 6,5 mil millones de parámetros, al que se le aplica un ajuste fino específico de tarea mediante LoRA y se le añade una cabeza de clasificación de cuatro clases. El modelo resultante está orientado a una tarea de clasificación de secuencias cortas, no a generación abierta de texto, aunque conserva la arquitectura base del modelo original.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. El modelo card indica que el código fuente y los ficheros del dataset asociado están disponibles en el repositorio de GitHub del autor, y solicita citar el artículo de investigación correspondiente al usar el modelo en trabajos académicos. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de texto en cuatro clases de sacudida percibida: clase 0 (sin sacudida evidente o irrelevante), clase 1 (sacudida ligera), clase 2 (sacudida moderada) y clase 3 (sacudida fuerte o afectado).
- Procesamiento de comentarios cortos de redes sociales, específicamente comentarios de Weibo en chino.
- Análisis de percepción sísmica a partir de lenguaje natural ciudadano.
- Orientación a investigación académica y clasificación preliminar de sacudida percibida.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documentan capacidades multilingües más allá del chino mencionado en el model card.

## Casos de uso

- Análisis de percepción sísmica en redes sociales: el modelo clasifica comentarios de Weibo posteriores a un terremoto en cuatro niveles de sacudida percibida, permitiendo agregar la respuesta ciudadana y compararla con datos instrumentales.
- Investigación en sismología social: sirve como componente de clasificación en estudios académicos que correlacionan la percepción humana con la intensidad sísmica registrada por instrumentos.
- Monitorización complementaria en respuesta a desastres: al procesar el flujo de comentarios tras un evento, permite obtener una señal rápida y agregada de la percepción de la población en distintas zonas.
- Etiquetado y anotación asistida de corpus: puede emplearse para preetiquetar grandes volúmenes de comentarios y reducir el esfuerzo de anotación manual en proyectos de investigación.
- Análisis comparativo entre eventos: al aplicar el mismo clasificador a comentarios de distintos terremotos, se pueden comparar patrones de percepción y respuesta social entre eventos.
- Filtrado y priorización de contenido: la clasificación en cuatro clases permite separar comentarios irrelevantes (clase 0) de aquellos que expresan sacudida fuerte (clase 3) para su revisión o análisis posterior.
- Docencia y experimentación con modelos ajustados: sirve como ejemplo práctico de ajuste fino con LoRA y cabeza de clasificación sobre un modelo base de 7B para una tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 6,49 mil millones de parámetros, en precisión completa (fp16) se requieren aproximadamente 13 GB solo para los pesos, a los que hay que sumar memoria para activaciones y overhead del runtime.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo encaja en GPUs con 16 GB o más de VRAM en fp16, y en GPUs consumer de gama alta (por ejemplo, RTX 4090 con 24 GB) en fp16.
- Cabe en GPU consumer: previsiblemente sí en modelos con 16-24 GB de VRAM en fp16; en cuantizaciones de 8 bits o 4 bits podría caber en GPUs con 8-12 GB, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: no se especifican en la información disponible; al ser un modelo de clasificación con cabeza propia, requeriría un runtime que cargue los pesos safetensors y el tokenizer, no siendo directamente compatible con pipelines de generación estándar sin adaptación.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QuakeSense-LLM | 6.490.951.680 | no disponible | Clasificación de sacudida percibida (4 clases) | no disponible | HuggingFace (mumu9899/QuakeSense-LLM) |
| DeepSeek-7B-Base | ~7B | no disponible | Generación de texto (modelo base) | no disponible | HuggingFace |
| Alternativas de clasificación sísmica | no disponible | no disponible | Clasificación de percepción/intensidad | no disponible | no disponible |

No se dispone de información sobre modelos comparables específicos de clasificación de sacudida percibida en redes sociales. El modelo base DeepSeek-7B-Base se incluye como referencia de la arquitectura de partida, pero no es un competidor directo en la tarea.

## Limitaciones y advertencias

- Las predicciones representan la sacudida percibida expresada en texto de redes sociales, no mediciones oficiales de intensidad sísmica.
- El modelo no debe utilizarse como sustituto de evaluaciones oficiales de intensidad sísmica ni de observaciones instrumentales de terremotos.
- El model card no documenta sesgos conocidos, pero al entrenarse sobre comentarios de Weibo puede heredar sesgos de la plataforma, de la población usuaria y de la distribución geográfica de los comentarios.
- Riesgo de alucinación no aplicable en el mismo sentido que en modelos generativos, pero sí existe riesgo de clasificaciones erróneas o poco calibradas en comentarios ambiguos, irónicos o fuera de dominio.
- No se especifican la licencia ni las restricciones de uso comercial; debe consultarse el repositorio del autor antes de cualquier uso en producción.
- No se documentan los idiomas soportados más allá del chino de Weibo, por lo que el rendimiento en otros idiomas es desconocido.
- No se dispone de información sobre la longitud de contexto soportada, lo que limita la evaluación de su comportamiento con comentarios largos.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación externa muy limitada.
- Uso previsto académico y de investigación; no se documenta su validación para uso operativo en respuesta a desastres.

## Enlaces

- HuggingFace: https://huggingface.co/mumu9899/QuakeSense-LLM
- Repositorio GitHub (código y dataset): https://github.com/mumu9899/QuakeSense-LLM
- Artículo de investigación asociado: no disponible (el model card solicita citarlo, pero no proporciona referencia)
