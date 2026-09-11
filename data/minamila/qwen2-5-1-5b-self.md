# MinaMila/Qwen2.5-1.5B-self

## Resumen

MinaMila/Qwen2.5-1.5B-self es un adaptador de tipo PEFT (probablemente LoRA) publicado por el usuario MinaMila sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct de Alibaba Cloud. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino que deben combinarse con el modelo base para funcionar. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un adaptador de bajo rango y no con un modelo completo.

La model card es una plantilla sin rellenar: practicamente todos los campos aparecen como "[More Information Needed]" (autor, licencia, idiomas, datos de entrenamiento, benchmarks, infraestructura, etc.). No hay informacion publicada sobre el dataset de ajuste, los hiperparametros, el objetivo de entrenamiento ni los resultados de evaluacion. Tampoco se declara la finalidad concreta del ajuste, por lo que no es posible determinar que comportamiento especifico aporta "self" sobre el modelo base.

Dado que no se puede evaluar el adaptador en si, la ficha se apoya en las caracteristicas conocidas del modelo base Qwen2.5-1.5B-Instruct, que se indican de forma explicita y diferenciada. Cualquier dato no confirmado en la informacion disponible se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT sobre transformer decoder-only denso (Qwen2.5, base) |
| Parametros totales | No disponible para el adaptador. Modelo base: 1,5 B (1,54 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador. Modelo base: 32 768 tokens |
| Tipos de cuantizacion | No disponible en el adaptador. Modelo base: fp16, bf16, int8, int4, AWQ, GPTQ, GGUF |
| Idiomas soportados | No disponible. Modelo base: mas de 29 idiomas (incluye espanol e ingles) |
| Licencia | No disponible para el adaptador. Modelo base: Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); modelo base en safetensors |

Otros datos del repositorio: libreria `peft`, version de PEFT 0.15.1, tamano 0,1 GB, modelo base declarado `Qwen/Qwen2.5-1.5B-Instruct`, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El adaptador emplea la libreria PEFT, lo que en la practica implica tecnicas de ajuste parametro-eficiente (LoRA o variantes). No se especifica el rango, el `target_modules`, el `alpha` ni la tasa de aprendizaje. La unica referencia tecnica enlazada en la model card es `arxiv:1910.09700`, que corresponde a Lacoste et al. (2019) sobre estimacion de emisiones de carbono, citada como parte de la plantilla de impacto medioambiental; no describe la arquitectura ni el entrenamiento del adaptador.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF, DPO o SFT supervisado, ni sobre innovaciones tecnicas. El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only denso con Grouped Query Attention (GQA, 12 cabezas de consulta y 2 de clave/valor), 28 capas y un vocabulario de aproximadamente 151 936 tokens; fue preentrenado sobre del orden de 18 billones de tokens y posteriormente alineado con instrucciones. Estos datos corresponden al modelo base y no necesariamente al comportamiento del adaptador.

## Capacidades

No hay informacion publicada sobre las capacidades especificas que anade el adaptador. Se enumeran a continuacion las capacidades del modelo base Qwen2.5-1.5B-Instruct, que el adaptador hereda salvo que el ajuste las modifique (extremo no documentado):

- Generacion de texto e instrucciones en conversacion multi-turno.
- Razonamiento basico y matematicas elementales a nivel de modelo de 1,5 B.
- Generacion y explicacion de codigo, con soporte para lenguajes habituales.
- Soporte de tool calling / function calling y de salida estructurada (JSON).
- Capacidades multilingues (mas de 29 idiomas, con espanol e ingles incluidos).
- Modo de generacion con contexto largo de hasta 32 768 tokens de entrada.
- Capacidad de seguir instrucciones del sistema y del usuario.

No se documenta en el repositorio soporte de vision, audio ni un modo de razonamiento explicito ("thinking mode") propio del adaptador.

## Casos de uso

Los siguientes escenarios son aplicables al modelo base y, en principio, extensibles al adaptador, siempre que este no haya alterado su comportamiento (aspecto no verificado):

- Asistentes conversacionales ligeros: el modelo base puede mantener dialogos multi-turno con hasta 32 768 tokens de contexto, lo que permite integrar historiales largos en un chatbot sin reentrenamiento.
- Prototipado rapido y demos: al ser un modelo de 1,5 B, puede ejecutarse en una sola GPU de consumo o incluso en CPU cuantizado, lo que facilita validar ideas antes de escalar a modelos mayores.
- Extraccion de informacion y clasificacion de texto: tareas de etiquetado, resumen o extraccion de entidades en flujos de procesamiento por lotes donde el coste por token es critico.
- Generacion asistida de codigo en entornos de desarrollo: el modelo base soporta instrucciones de programacion y puede integrarse en editores o asistentes locales.
- Automatizacion con tool calling: puede conectarse a APIs externas mediante function calling, util para agentes sencillos o automatizaciones de bajo coste.
- Educacion y tutoria: explicaciones paso a paso de conceptos tecnicos en varios idiomas, con la ventaja de poder desplegarse en infraestructura propia.
- Filtrado y preprocesamiento en pipelines de datos: por su tamano, es adecuado para tareas masivas de limpieza, reescritura o normalizacion de texto antes de pasarlo a modelos mayores.

Advertencia: estos casos describen el potencial del modelo base; no hay evidencia publicada de que el adaptador "self" este optimizado para ninguno de ellos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para el adaptador MinaMila/Qwen2.5-1.5B-self. La model card incluye la seccion de evaluacion sin rellenar.

El modelo base Qwen/Qwen2.5-1.5B-Instruct dispone de su propia model card con resultados de evaluacion (MMLU, GSM8K, HumanEval, entre otros), pero esos datos corresponden al modelo base y no deben atribuirse al adaptador.

## Requisitos de hardware

Estimaciones referidas al modelo base Qwen2.5-1.5B-Instruct, ya que el adaptador anade una sobrecarga minima una vez fusionado:

- VRAM en fp16/bf16: aproximadamente 3-4 GB de pesos, mas la memoria para el contexto (KV cache).
- VRAM en cuantizacion int8: aproximadamente 2 GB.
- VRAM en cuantizacion int4 (GGUF/AWQ/GPTQ): aproximadamente 1-2 GB.
- GPU de consumo: cabe holgadamente en tarjetas con 8 GB o mas, como RTX 3060, RTX 4060 o RTX 4090; en GPUs con 6-8 GB puede ser necesario cuantizar.
- GPU de centro de datos: funciona en A100, H100, L40S, etc., aunque esta sobredimensionado para un modelo de 1,5 B.
- CPU: viable en modo CPU con llama.cpp u Ollama en cuantizacion int4, con latencias mayores.
- Opciones de despliegue: transformers con PEFT (cargando el adaptador sobre el base), vLLM, Text Generation Inference (TGI), llama.cpp y Ollama (estos dos ultimos requieren convertir el base a GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del adaptador, por lo que la comparativa se limita a caracteristicas estructurales del modelo base frente a alternativas de tamano similar.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base de este adaptador) | 1,5 B | 32 768 tokens | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 1B Instruct | 1,23 B | 128 000 tokens | Licencia comunitaria Llama 3.2 | safetensors, GGUF |
| Gemma 2 2B IT | 2,6 B | 8 192 tokens | Gemma Terms of Use | safetensors, GGUF |
| SmolLM2 1.7B Instruct | 1,7 B | 8 192 tokens | Apache 2.0 | safetensors, GGUF |

Nota: las cifras de contexto y licencia corresponden a los modelos oficiales respectivos; no hay datos de rendimiento comparado para el adaptador de este repositorio.

## Limitaciones y advertencias

- La model card no especifica licencia. Al derivar del modelo base Qwen2.5-1.5B-Instruct (Apache 2.0), es razonable asumir esa licencia, pero no esta confirmado por el autor; conviene verificarlo antes de un uso comercial.
- No hay documentacion sobre el dataset de ajuste, por lo que se desconoce que sesgos o comportamientos concretos puede haber introducido el entrenamiento.
- Riesgo de alucinacion inherente a un modelo de 1,5 B, especialmente en tareas de conocimiento factual, matematicas complejas y razonamiento de varios pasos.
- Capacidad de contexto y multilingueismo no confirmados para el adaptador; se heredan del base solo si el ajuste no los ha degradado.
- No se han publicado evaluaciones que permitan medir regresiones frente al modelo base.
- El repositorio tiene 0 descargas y 0 likes, y una fecha de creacion atipica (2026-09-10), lo que sugiere un artefacto experimental sin validacion comunitaria.
- Para uso en produccion se recomienda evaluar el adaptador frente al modelo base sin ajuste y comprobar si aporta una mejora medible en la tarea objetivo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/MinaMila/Qwen2.5-1.5B-self
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper citado en la model card (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental (ML CO2 Impact): https://mlco2.github.io/impact

Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los unicos enlaces utiles son los del repositorio y el modelo base.
