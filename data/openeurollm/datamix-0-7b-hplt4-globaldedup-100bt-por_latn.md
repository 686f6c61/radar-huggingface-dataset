# openeurollm/datamix-0.7B-hplt4-globaldedup-100bt-por_Latn

## Resumen

El modelo `datamix-0.7B-hplt4-globaldedup-100bt-por_Latn` es un modelo de lenguaje de 0,7 mil millones de parametros desarrollado por el proyecto OpenEuroLLM, una iniciativa europea orientada a la construccion de modelos de lenguaje abiertos y multilingues. Se trata de un modelo entrenado desde cero (from scratch) sobre 100 000 millones de tokens del corpus HPLT 4 en portugues, aplicando unicamente deduplicacion global sin filtrado adicional. Su identificador refleja con precision la receta de entrenamiento: tamano (0,7B), fuente de datos (HPLT 4), tecnica de curado (globaldedup), volumen de tokens (100bt) e idioma (portugues en escritura latina, por_Latn).

El modelo no es un asistente conversacional afinado, sino un modelo base de investigacion cuyo proposito principal es servir como punto de partida para estudiar el efecto de las decisiones de curado de datos sobre el rendimiento en un idioma concreto. La ausencia de filtrado adicional mas alla de la deduplicacion global lo convierte en una pieza util para experimentos controlados sobre calidad y composicion de corpus.

Su relevancia actual radica en el contexto del proyecto OpenEuroLLM, que busca reducir la dependencia de modelos entrenados predominantemente en ingles y ofrecer alternativas abiertas para lenguas europeas. Publicado bajo licencia Apache 2.0, puede reutilizarse y modificarse libremente, aunque su utilidad practica directa esta limitada por tratarse de un modelo base de pequeno tamano y un unico idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 0,7B (700 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugues (por_Latn) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo (transformer, MoE, SSM o hibrida), el numero de capas, la dimension del embedding, el numero de cabezas de atencion ni la longitud de contexto empleada durante el entrenamiento. Tampoco se detalla la estrategia de tokenizacion ni el vocabulario utilizado. Todo lo que se conoce con certeza es que se trata de un modelo de 0,7B parametros entrenado desde cero.

En cuanto a los datos, el modelo se entreno sobre 100 000 millones de tokens extraidos del corpus HPLT 4 en portugues. La unica etapa de curado aplicada fue una deduplicacion global, sin filtrado adicional de calidad, toxicidad ni heuristica de ningun tipo. Esta decision de diseno es relevante porque permite aislar el efecto de la deduplicacion frente a otras tecnicas de curado, pero tambien implica que el corpus puede contener ruido, contenido de baja calidad o material problematico que un pipeline de filtrado convencional habria eliminado. No se menciona el uso de RLHF, DPO, SFT ni ninguna otra etapa de alineacion posterior al preentrenamiento.

## Capacidades

- Generacion de texto en portugues: al ser un modelo base, puede continuar texto y generar secuencias coherentes en portugues escrito con alfabeto latino.
- Modelado de lenguaje: util para tareas de perplexity, evaluacion de corpus y experimentos de investigacion sobre modelado estadistico del portugues.
- Capacidades multilingues: no disponibles; el modelo esta entrenado exclusivamente en portugues.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Ajuste fino posterior: al ser un modelo base, esta pensado para servir como punto de partida para fine-tuning supervisado o instruccional por parte de terceros.

## Casos de uso

- Investigacion sobre curado de datos: el modelo permite estudiar de forma controlada el impacto de la deduplicacion global frente a pipelines con filtrado adicional, comparando modelos entrenados con recetas distintas sobre el mismo corpus HPLT 4.
- Punto de partida para fine-tuning en portugues: equipos que necesiten un modelo pequeno especializado en portugues pueden partir de estos pesos y aplicar SFT o DPO sobre datos propios en lugar de entrenar desde cero.
- Modelado de lenguaje y evaluacion de corpus: util para calcular perplexity sobre textos en portugues y evaluar la calidad o domain shift de nuevos corpus respecto a HPLT 4.
- Generacion de texto en portugues para prototipos: en entornos de investigacion o demos internas donde no se requiere un asistente afinado, el modelo puede generar continuaciones de texto aceptables.
- Experimentos de destilacion: al ser un modelo pequeno de 0,7B, puede emplearse como estudiante en pipelines de destilacion desde modelos mayores entrenados en portugues.
- Base para estudios de sesgo y toxicidad: dado que no se aplico filtrado, resulta un caso de estudio idoneo para analizar que tipo de contenido emerge de un corpus crudo deduplicado.
- Benchmarking de tecnicas de entrenamiento: permite comparar recetas de optimizacion, schedules de learning rate o estrategias de tokenizacion sobre un corpus fijo de 100B tokens en portugues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision FP16, aproximadamente 1,4 GB solo para los pesos; en cuantizacion de 8 bits, en torno a 0,7 GB; en 4 bits, alrededor de 0,4 GB. Estas cifras no incluyen la memoria adicional para el cache KV, que depende de la longitud de contexto efectiva.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida pueden ejecutar el modelo.
- Compatibilidad con GPU consumer: si, cabe holgadamente en cualquier GPU consumer con al menos 2-4 GB de VRAM libre, e incluso en CPU.
- Opciones de despliegue: se desconoce el formato de pesos publicado, por lo que no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI. Si los pesos estan en safetensors, serian compatibles con transformers, vLLM y TGI; para llama.cpp u Ollama seria necesario convertirlos a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| datamix-0.7B-hplt4-globaldedup-100bt-por_Latn | 0,7B | no disponible | portugues | Apache 2.0 | Hugging Face |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (modelos base de ~0,7B entrenados especificamente en portugues sobre HPLT 4 con deduplicacion global). La comparativa queda pendiente de datos adicionales.

## Limitaciones y advertencias

- Modelo base sin alineacion: no ha pasado por RLHF, DPO ni SFT, por lo que no sigue instrucciones y puede generar contenido incoherente, repetitivo o inapropiado.
- Ausencia de filtrado: al no aplicarse filtrado adicional mas alla de la deduplicacion, el corpus puede contener toxicidad, sesgos, contenido sesgado o material de baja calidad que se reflejara en las generaciones.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede producir afirmaciones factualmente incorrectas con aparente seguridad.
- Cobertura linguistica limitada: entrenado exclusivamente en portugues; su rendimiento en otros idiomas sera muy pobre o nulo.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que dificulta planificar su uso en tareas que requieran contexto largo.
- Formato de pesos no confirmado: la ausencia de informacion sobre el formato de pesos impide garantizar la compatibilidad directa con frameworks de inferencia populares.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero la falta de alineacion y de filtrado hace desaconsejable su despliegue directo en produccion sin un fine-tuning y evaluacion previos.
- Sin garantias de rendimiento: no hay benchmarks publicados, por lo que no se puede estimar su calidad relativa frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/openeurollm/datamix-0.7B-hplt4-globaldedup-100bt-por_Latn
- Proyecto OpenEuroLLM: no disponible en la informacion proporcionada
- Corpus HPLT 4: no disponible en la informacion proporcionada
- Paper o blog asociado: no disponible en la informacion proporcionada
