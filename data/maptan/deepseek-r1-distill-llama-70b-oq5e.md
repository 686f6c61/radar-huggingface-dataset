# maptan/DeepSeek-R1-Distill-Llama-70B-oQ5e

## Resumen

Esta ficha describe la cuantizacion `maptan/DeepSeek-R1-Distill-Llama-70B-oQ5e`, publicada por el usuario maptan en Hugging Face. No es un modelo nuevo, sino una version comprimida en 5 bits del modelo base `deepseek-ai/DeepSeek-R1-Distill-Llama-70B`, generada con la herramienta oQ (oMLX v0.7.0) mediante cuantizacion de precision mixta y grupo de tamano 64. El resultado es un checkpooint en formato MLX safetensors pensado para ejecutarse en hardware de Apple Silicon.

El modelo base es un transformer denso de tipo Llama, destilado por DeepSeek a partir de su modelo de razonamiento DeepSeek-R1 sobre la base de Llama-3.3-70B-Instruct. Cuenta con 70.553.706.496 parametros y hereda una ventana de contexto de 128.000 tokens, con capacidad de generar cadenas de pensamiento largas antes de dar la respuesta final.

La relevancia de esta publicacion concreta es practica: permite ejecutar un modelo de razonamiento de 70B en equipos Apple con memoria unificada alta, reduciendo el peso de pesos a aproximadamente 50 GB en disco. Al tratarse de una cuantizacion de terceros, la licencia no esta declarada en la ficha y no se han publicado benchmarks especificos de esta version.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama), solo decodificador |
| Parametros totales | 70.553.706.496 (70,55 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | 5 bits, precision mixta oQ (oMLX v0.7.0), group size 64 |
| Idiomas soportados | no disponible en la ficha de la cuantizacion (el modelo base cubre multiples idiomas) |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.3-70B-Instruct: un transformer denso de 70.000 millones de parametros con atencion por grupos (GQA), normalizacion RMSNorm y capas de feed-forward SwiGLU. Sobre esa base, DeepSeek aplico destilacion de conocimiento a partir de DeepSeek-R1 utilizando aproximadamente 800.000 muestras de razonamiento generadas por el modelo profesor, lo que da lugar al modelo base `DeepSeek-R1-Distill-Llama-70B`. El entrenamiento busca transferir la capacidad de razonamiento en cadena (chain-of-thought) del R1 a un modelo de arquitectura Llama.

La contribucion de esta ficha concreta es la cuantizacion. El autor aplico oQ (herramienta oMLX v0.7.0) con precision mixta a 5 bits y group size 64, generando pesos en formato MLX safetensors. La cuantizacion de precision mixta asigna distinto numero de bits segun la sensibilidad de cada capa o tensor, lo que habitualmente reduce la degradacion respecto a una cuantizacion uniforme del mismo numero medio de bits. No se detalla en la model card que capas reciben mayor o menor precision, ni el proceso exacto de calibracion.

## Capacidades

- Generacion de texto y dialogos multi-turno en el modelo base y, por herencia, en esta cuantizacion.
- Razonamiento explicito con cadena de pensamiento: el modelo esta ajustado para producir trazas de razonamiento extensas antes de la respuesta final.
- Resolucion de problemas de matematicas y logica de varios pasos, siguiendo el comportamiento del modelo base destilado.
- Generacion y comprension de codigo, dado el ajuste de Llama-3.3-70B-Instruct y el entrenamiento adicional en muestras de razonamiento.
- Soporte multilingue heredado del modelo base; el alcance exacto por idioma no esta especificado en la model card de esta cuantizacion.
- Capacidad de tool calling / function calling: no declarada explicitamente en la ficha; depende del modelo base y del template de chat empleado.
- Capacidades de agente y razonamiento multi-paso: no declaradas explicitamente en la ficha, aunque el formato de razonamiento del modelo base es compatible con flujos de agente.
- Soporte de vision, audio o multimodalidad: no disponible.

## Casos de uso

- Razonamiento asistido en local sobre Apple Silicon: un equipo Mac con memoria unificada amplia puede cargar esta cuantizacion de 5 bits y ejecutar tareas de razonamiento sin depender de la nube, util para entornos con requisitos de privacidad de datos.
- Generacion de codigo en flujos de trabajo de escritorio: el modelo puede ayudar a redactar, revisar y explicar fragmentos de codigo dentro de un IDE local, aprovechando el ajuste sobre Llama-3.3-70B-Instruct.
- Resolucion de problemas matematicos paso a paso: su entrenamiento en cadenas de pensamiento permite mostrar el desarrollo del razonamiento, adecuado para herramientas educativas o de autoevaluacion.
- Analisis de documentos largos: con 128.000 tokens de contexto, puede procesar informes, contratos o articulos extensos y responder preguntas sobre su contenido en una sola pasada.
- Prototipado de asistentes conversacionales en investigación: util para experimentar con prompts de razonamiento y evaluar comportamientos del modelo base sin coste de API.
- Evaluacion comparativa de cuantizaciones: sirve para medir como afecta la cuantizacion a 5 bits con group size 64 al rendimiento de razonamiento respecto al modelo base en precision completa.
- Tareas de extraccion y resumen estructurado sobre textos tecnicos, siempre que se valide la salida por el riesgo de alucinacion inherente a los modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K ni similares, y los resultados de busqueda solo describen el modelo base de forma cualitativa. No se dispone, por tanto, de datos que cuantifiquen la degradacion introducida por la cuantizacion a 5 bits.

## Requisitos de hardware

- Peso en disco: el repositorio ocupa 50,3 GB, correspondiente a los pesos MLX safetensors a 5 bits con group size 64.
- Memoria necesaria para inferencia: aproximadamente 50 GB solo para pesos, mas la cache KV, cuyo tamano crece con la longitud de contexto. No se dispone de cifras oficiales; como referencia, con contexto largo se recomienda reservar bastante mas memoria que el peso de los pesos.
- Equipo recomendado: Mac con Apple Silicon y memoria unificada de 64 GB como minimo; 96 GB o 128 GB es aconsejable para aprovechar contextos largos con holgura.
- GPU consumer: el formato MLX no esta pensado para GPU NVIDIA, por lo que no se ejecuta directamente en una RTX 4090 ni en configuraciones con 24 GB de VRAM. En hardware CUDA habria que recurrir a otras cuantizaciones (GGUF, AWQ, GPTQ) del mismo modelo base, que no son este repositorio.
- Opciones de despliegue: al ser MLX, el ecosistema natural es mlx-lm y aplicaciones compatibles con MLX; tambien puede cargarse en herramientas que soporten MLX, como LM Studio en equipos Apple. vLLM, TGI o llama.cpp no consumen directamente pesos MLX.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para esta cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| deepseek-ai/DeepSeek-R1-Distill-Llama-70B | 70 B | 128.000 tokens | safetensors (precision completa) | definida por DeepSeek y la licencia de Llama 3.3 | Modelo base original; mayor peso en disco y memoria |
| maptan/DeepSeek-R1-Distill-Llama-70B-oQ5e | 70,55 B | 128.000 tokens (heredado) | MLX safetensors a 5 bits | no disponible | Cuantizacion de precision mixta para Apple Silicon |
| Otras cuantizaciones del mismo modelo base (GGUF, AWQ, GPTQ) | no disponible | no disponible | GGUF, AWQ, GPTQ | no disponible | Orientadas a llama.cpp, vLLM o GPUs CUDA; datos concretos no disponibles |

## Limitaciones y advertencias

- Riesgo de alucinacion: como cualquier modelo generativo, puede producir afirmaciones plausibles pero incorrectas, especialmente en tareas factuales o de calculo. Conviene validar las salidas en produccion.
- Degradacion por cuantizacion: la compresion a 5 bits con group size 64 puede reducir la calidad respecto al modelo base en precision completa, sobre todo en tareas de razonamiento largo. No se han publicado evaluaciones que midan ese impacto.
- Licencia no declarada: la ficha de esta cuantizacion no especifica licencia. El modelo base DeepSeek-R1-Distill-Llama-70B esta sujeto a las condiciones de DeepSeek y a los terminos heredados de Llama 3.3, por lo que el uso comercial debe verificar esas condiciones antes de desplegar.
- Dependencia del hardware: los pesos en formato MLX estan pensados para Apple Silicon. No son portables directamente a GPU NVIDIA ni a servidores CUDA sin reconvertir o usar otra cuantizacion.
- Trazas de razonamiento largas: el modelo tiende a generar cadenas de pensamiento extensas, lo que incrementa el consumo de tokens, la latencia y el uso de cache KV. Hay que planificar los limites de tokens de salida.
- Idiomas: la ficha no declara cobertura idiomatica; el rendimiento fuera del ingles y de los idiomas principales del modelo base puede ser desigual.
- Metadatos de publicacion: la fecha indicada de creacion (2026-10-02) es posterior a la actualidad conocida y la model card advierte de que esta version reemplaza a una anterior, por lo que conviene comprobar la integridad de los pesos descargados.
- Adopcion limitada: con 16 descargas y 0 likes en el momento de la consulta, hay poca validacion por parte de la comunidad sobre el comportamiento real de esta cuantizacion concreta.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/maptan/DeepSeek-R1-Distill-Llama-70B-oQ5e
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-70B
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Variante de terceros del modelo base: https://huggingface.co/cortexso/deepseek-r1-distill-llama-70b
- Ficha descriptiva del modelo base: https://www.aimodels.fyi/models/huggingFace/deepseek-r1-distill-llama-70b-deepseek-ai
- Entrada del modelo base en LM Studio: https://lmstudio.ai/models/deepseek/deepseek-r1-distill-llama-70b
- Entrada del modelo base en OpenModelMap: https://openmodelmap.com/model/deepseek-ai/DeepSeek-R1-Distill-Llama-70B
