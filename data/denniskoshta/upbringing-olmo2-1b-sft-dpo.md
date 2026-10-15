# DennisKoshta/upbringing-olmo2-1b-sft-dpo

## Resumen

upbringing-olmo2-1b-sft-dpo es un modelo de generacion de texto de tipo decoder-only con 1.484.916.736 parametros, publicado por DennisKoshta como parte de **Upbringing**, un proyecto educativo e interactivo sobre post-entrenamiento de modelos de lenguaje. Se trata del resultado de aplicar DPO (Direct Preference Optimization) con normalizacion por longitud y beta = 5 sobre 60.000 pares de preferencia del *OLMo-2 1B preference mix* de Ai2, partiendo del modelo ya sometido a SFT DennisKoshta/upbringing-olmo2-1b-sft. No es, por tanto, un modelo de proposito general, sino un artefacto de investigacion que ilustra de forma reproducible la secuencia SFT a DPO sobre una base pequena.

Su relevancia es fundamentalmente metodologica: el autor publica el sitio interactivo, el codigo, las configuraciones y la evaluacion del proceso completo, de modo que sirve como referencia practica para quien quiera reproducir un pipeline de post-entrenamiento a escala reducida (presupuesto bajo) sobre la familia OLMo 2, que es completamente abierta. El modelo hereda la arquitectura y el tokenizador de OLMo-2-0425-1B de Ai2, con alrededor de 1,48 mil millones de parametros y 3,0 GB de peso en el repositorio en formato safetensors.

La ficha del autor advierte explicitamente de que se trata de un artefacto de investigacion de una ejecucion a escala reducida y remite al README del repositorio para consultar resultados, desviaciones respecto a las recetas de referencia y las licencias de los modelos y datos upstream. No se declaran ni licencia propia, ni idiomas soportados, ni longitud de contexto en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivada de la familia OLMo 2 de Ai2 (detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 1.484.916.736 (aproximadamente 1,48 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; no se documentan cuantizaciones publicadas para este repositorio |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card remite al README del repositorio para las licencias de los modelos y datos upstream |
| Formato de pesos | safetensors (libreria transformers) |

Datos adicionales del repositorio: tamano del repo 3,0 GB, pipeline text-generation, etiquetas transformers, safetensors, olmo2, text-generation, upbringing, post-training, conversational, endpoints_compatible. Modelo base declarado: DennisKoshta/upbringing-olmo2-1b-sft. Fecha de creacion registrada: 2026-10-15.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia OLMo 2. No se proporcionan en la documentacion disponible detalles sobre el numero de capas, dimensiones ocultas, tipo de normalizacion, esquema de atencion o vocabulario; estos se heredan de la base DennisKoshta/upbringing-olmo2-1b-sft y, en ultima instancia, de OLMo-2-0425-1B de Ai2. Tampoco se especifica la longitud de contexto, aunque en la practica vendra fijada por la configuracion del modelo base.

El entrenamiento documentado corresponde exclusivamente a la etapa de post-entrenamiento por preferencias: DPO con normalizacion por longitud y beta = 5, ejecutado sobre 60.000 pares de preferencia procedentes del *OLMo-2 1B preference mix* de Ai2. Esta etapa se aplica sobre un modelo que ya habia pasado por SFT, presumiblemente con la mezcla SFT de Tulu 3 para OLMo-2, segun se deduce de la atribucion de datos del repositorio del proyecto. No se dispone de informacion sobre el numero de tokens de preentrenamiento, la composicion del dataset original ni sobre el uso de RLHF adicional, RLVR u otras tecnicas. El repositorio del proyecto menciona, ademas del time-lapse SFT a DPO sobre OLMo-2 1B, un componente de ajuste de preferencias en vivo y RLVR sobre la tarea Countdown, pero la informacion disponible no permite atribuir esas tecnicas a este checkpoint concreto.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como conversational y text-generation, y su etapa final de DPO esta orientada a alinear las respuestas con preferencias humanas.
- Ajuste por preferencias: al proceder de DPO sobre pares de preferencia, muestra preferencia por respuestas mas alineadas con el criterio del conjunto de preferencias utilizado, en comparacion con su version previa solo SFT.
- Razonamiento y matematicas: no se documentan capacidades especificas ni evaluaciones en la informacion disponible.
- Codigo: no se documentan capacidades especificas ni evaluaciones.
- Tool calling / function calling: no documentado; el modelo no incluye plantilla ni formato declarado de llamada a herramientas en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; no se declaran idiomas en la ficha.
- Capacidades especiales: no se documentan modo de razonamiento explicito (thinking mode), vision ni audio.
- Uso como referencia educativa: sirve como punto de comparacion reproducible entre las etapas SFT y DPO dentro del proyecto Upbringing.

## Casos de uso

- Reproduccion de pipelines de post-entrenamiento: el modelo permite comparar de forma directa el efecto de aplicar DPO con beta = 5 y normalizacion por longitud sobre un mismo modelo SFT, usando las configuraciones publicadas en el repositorio del proyecto.
- Docencia y divulgacion sobre alineamiento: al formar parte de un sitio interactivo sobre post-entrenamiento, es adecuado para ilustrar en clase o en talleres la diferencia entre SFT y DPO con un modelo de 1,48 B que cabe en hardware modesto.
- Prototipado de asistentes conversacionales ligeros: con aproximadamente 1,5 B de parametros y pesos en safetensors, permite levantar un chatbot de pruebas en una sola GPU consumer para validar flujos conversacionales antes de escalar a modelos mayores.
- Experimentos academicos de comparacion de metodos de alineamiento: sirve como linea base de bajo coste frente a variantes con otros valores de beta, sin normalizacion por longitud u otras recetas de preferencias.
- Generacion de datos sinteticos para filtrado: puede emplearse para producir respuestas candidatas en tareas de anotacion o filtrado previo, siempre que se valide la calidad con un modelo mayor.
- Despliegue en entornos con recursos limitados: al ser un modelo de ~1,5 B, es candidato a inferencia en CPU o en GPUs de gama de entrada, util en prototipos embebidos o en entornos de laboratorio sin acceso a clústeres.
- Analisis de sesgos del conjunto de preferencias: al estar entrenado sobre el OLMo-2 1B preference mix, permite estudiar que comportamientos y estilos de respuesta se refuerzan con ese corpus concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio del proyecto indica que contiene evaluaciones, pero no se han facilitado cifras concretas (MMLU, HumanEval, GSM8K u otras) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 3 GB en fp16/bf16 (solo pesos) y aproximadamente 1,5 GB en int8; las estimaciones no incluyen la cache KV ni el overhead del runtime, que dependen de la longitud de contexto y del tamano de lote.
- Cuantizacion de 4 bits: los pesos quedarian en torno a 0,8-1,0 GB, aunque no se documentan cuantizaciones publicadas para este repositorio concreto.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente en fp16 (por ejemplo, RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090); en int8 bastan 4-6 GB.
- Cabe en GPU consumer: si, en tarjetas de gama media y de entrada con 6-8 GB o mas, e incluso en CPU con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), vLLM o TGI para servicio con batching, y llama.cpp u Ollama previa conversion a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| upbringing-olmo2-1b-sft-dpo | 1,484,916.736 | no disponible | no disponible | HuggingFace, transformers, safetensors |
| allenai/OLMo-2-0425-1B-DPO | ~1,48 mil millones | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace, familia OLMo 2 de Ai2 |
| Qwen2.5-1.5B (familia) | orden de 1,5 mil millones | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |
| Llama 3.2 1B (familia) | orden de 1,2 mil millones | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |

Nota: los datos de los modelos comparativos no se han verificado en la informacion proporcionada; se incluyen unicamente como referencia de categoria por tamano. No se dispone de cifras de rendimiento comparadas para ninguno de ellos.

## Limitaciones y advertencias

- Artefacto de investigacion: el propio autor lo describe como resultado de una ejecucion a escala reducida, con desviaciones respecto a las recetas de referencia, por lo que no esta pensado como modelo de produccion.
- Licencia no declarada: la model card no indica licencia para este checkpoint y remite al README del repositorio del proyecto para las licencias de los modelos y datos upstream. Antes de cualquier uso comercial es imprescindible verificar esas licencias.
- Idiomas no declarados: no se especifica que idiomas soporta el modelo ni la calidad esperada fuera del ingles, que es el idioma predominante en los datos de OLMo 2 y Tulu 3.
- Longitud de contexto no disponible: no se documenta la ventana de contexto, lo que impide planificar usos con documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinacion: como cualquier modelo de 1,5 B, la tasa de afirmaciones incorrectas o inventadas es elevada, especialmente en tareas de conocimiento factual y razonamiento complejo.
- Sesgos: al entrenarse con el OLMo-2 1B preference mix, puede heredar los sesgos presentes en ese corpus de preferencias y en los datos de preentrenamiento y SFT de OLMo 2; no se documentan analisis de sesgo especificos.
- Capacidades no verificadas: no hay evidencia publicada en la informacion disponible sobre tool calling, uso agentico, codigo o matematicas, por lo que no deben asumirse.
- Trazabilidad limitada: con 0 descargas y 0 likes en el momento de la consulta y sin evaluaciones publicadas, no hay validacion externa independiente del comportamiento del modelo.
- Uso en produccion: se desaconseja su despliegue directo en aplicaciones sensibles sin una evaluacion propia y sin un modelo de mayor tamano como respaldo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DennisKoshta/upbringing-olmo2-1b-sft-dpo
- Modelo base SFT: https://huggingface.co/DennisKoshta/upbringing-olmo2-1b-sft
- Sitio interactivo del proyecto Upbringing: https://denniskoshta.github.io/upbringing/
- Codigo, configuraciones y evaluacion: https://github.com/DennisKoshta/upbringing
- Directorio de entrenamiento del proyecto: https://github.com/DennisKoshta/upbringing/tree/main/train
- OLMo-2-0425-1B (Ai2): https://huggingface.co/allenai/OLMo-2-0425-1B
- OLMo-2-0425-1B-DPO (Ai2): https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Pagina de la familia OLMo 2: https://allenai.org/olmo2
