# GCSA-AiLab/LFM3-VL-2B-Uncensored-GGUF

## Resumen

LFM3-VL-2B-Uncensored-GGUF es una distribucion cuantizada en formato GGUF del modelo vision-lenguaje LiquidAI/LFM3-VL-2B, publicada por el usuario comunitario GCSA-AiLab. El modelo base, desarrollado por Liquid AI, es un modelo multimodal de tipo image-text-to-text orientado a despliegue en el borde (edge), capaz de procesar entradas de imagen y texto y generar respuestas conversacionales. Esta version concreta incorpora modificaciones de "Abliterix" sobre las proyecciones de atencion, una tecnica de abliteracion que busca reducir el comportamiento de rechazo del modelo original.

El modelo cuenta con 1.728.801.600 parametros totales segun los datos de safetensors, lo que lo situa en la categoria de 2B. La distribucion GGUF lo hace compatible con motores de inferencia orientados a CPU y GPU de consumo, lo que facilita su ejecucion en hardware modesto. El repositorio ocupa 11,7 GB, un tamano coherente con la presencia de multiples niveles de cuantizacion.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo vision-lenguaje de tamano reducido, un formato de pesos optimizado para inferencia local y una modificacion deliberada del comportamiento de seguridad. Esto lo hace interesante para investigacion sobre alineamiento y para despliegues en entornos controlados, pero plantea advertencias importantes para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-VL de Liquid AI; detalles de arquitectura no incluidos en la informacion proporcionada) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no especificados en la informacion disponible) |
| Idiomas soportados | en, zh |
| Licencia | lfm1.0 (LFM Open License v1.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base LiquidAI/LFM3-VL-2B mas alla de su naturaleza multimodal image-text-to-text. No se especifican el tipo de transformer, el mecanismo de atencion, la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas concretas del modelo base.

Lo que si se documenta es la intervencion realizada por el autor de esta distribucion: modificaciones de tipo "Abliterix" aplicadas a las proyecciones de atencion. La abliteracion es una tecnica que identifica direcciones en el espacio de activaciones asociadas al comportamiento de rechazo y las proyecta fuera, con el objetivo de reducir la tasa de negativas del modelo. La model card advierte explicitamente de que estos cambios "pueden afectar al comportamiento de rechazo y a las salvaguardas", y recomienda validar el formato exacto en la tarea concreta antes de su uso. No se proporcionan metricas sobre el grado de modificacion ni sobre el impacto en capacidades.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a dialogos.
- Comprension de imagenes combinada con texto (image-text-to-text): el modelo acepta entradas visuales y textuales de forma conjunta.
- Soporte de los idiomas ingles y chino, segun los metadatos del repositorio.
- Comportamiento de rechazo reducido respecto al modelo base, por efecto de la abliteracion aplicada a las proyecciones de atencion.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integracion con infraestructura de inferencia tipo API.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, modo thinking, audio ni agentes.

## Casos de uso

- **Investigacion sobre alineamiento y abliteracion**: el modelo sirve como objeto de estudio para medir como la modificacion de proyecciones de atencion altera la tasa de rechazo y que coste tiene en capacidades generales. Se compararia contra el modelo base LiquidAI/LFM3-VL-2B con el mismo conjunto de prompts.
- **Prototipado local de asistentes multimodales**: al estar en GGUF y con 1,7B parametros, permite montar un asistente que describa imagenes o responda preguntas sobre capturas en un portatil, usando llama.cpp u Ollama, sin depender de servicios en la nube.
- **Clasificacion y extraccion de informacion a partir de documentos escaneados**: en flujos internos donde se procesan facturas, formularios o tickets en imagen, el modelo puede generar descripciones estructuradas o respuestas a preguntas concretas sobre el contenido visual.
- **Generacion de descripciones alternativas para accesibilidad**: integrado en una canalizacion que reciba imagenes de una web o aplicacion, el modelo puede producir texto alternativo en ingles o chino para lectores de pantalla.
- **Filtrado y moderacion de contenido en entornos controlados**: dado su comportamiento de rechazo reducido, puede emplearse para analizar contenido sensible en flujos internos de revision donde un modelo excesivamente restrictivo bloquearia el analisis. Requiere supervision humana.
- **Evaluacion comparativa de cuantizaciones GGUF**: el repositorio, con 11,7 GB y multiples ficheros, permite estudiar el equilibrio entre tamano, latencia y calidad en un modelo vision-lenguaje de 2B, midiendo la degradacion por nivel de cuantizacion.
- **Despliegue en dispositivos de borde sin GPU dedicada**: por su tamano, es candidato a ejecutarse en CPU en entornos con recursos limitados, como quioscos interactivos o dispositivos industriales con capacidad de computo moderada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no se especifican niveles de cuantizacion concretos, por lo que no es posible dar cifras exactas por fichero. Como referencia orientativa para un modelo de 1,7B parametros en GGUF, las cuantizaciones de 4 bits suelen requerir del orden de 1 a 2 GB de memoria, y las de 8 bits del orden de 2 a 3 GB, sin contar el overhead del contexto y del codificador visual. Estas cifras son estimaciones generales y no datos publicados para este modelo.
- **GPU recomendadas**: no disponibles en la informacion proporcionada. Por tamano, el modelo es apto para GPU de consumo, pero no se confirma compatibilidad especifica.
- **GPU de consumo**: previsiblemente cabe en tarjetas con 4 GB o mas de VRAM en cuantizaciones bajas, aunque no se confirma en la documentacion disponible.
- **Opciones de despliegue**: el formato GGUF es compatible con llama.cpp y con motores que lo consumen, como Ollama o LM Studio. El tag `endpoints_compatible` sugiere ademas integracion con infraestructura de endpoints. No se confirma soporte de vLLM ni TGI en la informacion disponible.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| GCSA-AiLab/LFM3-VL-2B-Uncensored-GGUF | 1.728.801.600 | no disponible | en, zh | lfm1.0 | GGUF | Derivado abliterado del modelo de Liquid AI |
| LiquidAI/LFM3-VL-2B | no disponible en la informacion | no disponible | no disponible | lfm1.0 | safetensors (presumible) | Modelo base original, sin modificacion de rechazo |
| Otras alternativas de 2B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparacion cuantitativa con alternativas de la misma categoria no esta disponible en la informacion proporcionada. La unica comparacion directa posible es con el modelo base, del que este repositorio es una derivacion cuantizada y modificada.

## Limitaciones y advertencias

- **Comportamiento de rechazo alterado**: la abliteracion modifica las proyecciones de atencion y puede reducir las salvaguardas del modelo original. La propia model card advierte de que los cambios pueden afectar al comportamiento de rechazo y pide validar el formato en la tarea concreta.
- **Riesgo de contenido inapropiado**: al reducirse las negativas, el modelo puede generar contenido que el original rechazaria. No es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- **Sesgos**: no se documentan evaluaciones de sesgo en la informacion disponible. Al ser un derivado comunitario sin proceso de evaluacion publicado, no hay garantias sobre sesgos de genero, raza o idioma.
- **Alucinacion**: no se han publicado metricas de fidelidad ni de tasa de alucinacion. En tareas de descripcion de imagenes o extraccion de datos, es previsible que cometa errores, especialmente en cuantizaciones agresivas.
- **Cobertura idiomatica limitada**: solo se declaran ingles y chino. El castellano no esta soportado oficialmente.
- **Licencia**: la LFM Open License v1.0 impone condiciones especificas de uso. Es responsabilidad del usuario revisar el fichero LICENSE del repositorio antes de cualquier uso comercial, ya que la licencia se etiqueta como "other" y no como una licencia estandar permisiva.
- **Degradacion por cuantizacion**: no se documenta la perdida de calidad por nivel de cuantizacion. En modelos pequenos, las cuantizaciones de 4 bits o inferiores pueden degradar de forma notable la comprension visual.
- **Informacion tecnica incompleta**: faltan datos de contexto, arquitectura, datos de entrenamiento y benchmarks, lo que dificulta una evaluacion rigurosa previa al despliegue.
- **Mantenimiento comunitario**: el repositorio tiene 0 likes y 1340 descargas, lo que indica una adopcion reducida y sin garantias de soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Documentacion en ingles: https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored-GGUF/blob/main/docs/en.md
- Documentacion en chino simplificado: https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored-GGUF/blob/main/README_zh-CN.md
- Documentacion en chino tradicional: https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored-GGUF/blob/main/README_zh-Hant.md
- Documentacion en japones: https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored-GGUF/blob/main/docs/ja.md
- Documentacion en coreano: https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored-GGUF/blob/main/docs/ko.md
- Documentacion en frances: https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored-GGUF/blob/main/docs/fr.md
- Documentacion en portugues: https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored-GGUF/blob/main/docs/pt.md
- Notas tecnicas en ingles: https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored-GGUF/blob/main/docs/technical-en.md
- Notas tecnicas en chino simplificado: https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored-GGUF/blob/main/docs/technical-zh-CN.md
- Ficheros del repositorio: https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored-GGUF/tree/main
- Licencia LFM Open License v1.0: https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored-GGUF/blob/main/LICENSE
