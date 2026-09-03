# Null-Guard/LFM2.5-230M-distilled-Gemini-3.8-Flash-Uncensored-GGUF

## Resumen

LFM2.5-230M-distilled-Gemini-3.8-Flash-Uncensored-GGUF es un conjunto de cuantizaciones GGUF del modelo base homónimo, desarrollado por Null-Guard a partir del checkpoint LFM2.5-230M de LiquidAI. Se trata de un modelo de 230 millones de parámetros, destilado y sometido a un proceso de abliteration, que suprime deliberadamente los mecanismos de rechazo del modelo ante peticiones que normalmente serían bloqueadas por la alineación de seguridad. El resultado es un modelo conversacional "uncensored" de tamaño muy reducido, pensado para ejecutarse en CPU o dispositivos de bajos recursos mediante runtimes compatibles con GGUF como llama.cpp, Ollama o LM Studio.

La relevancia de este modelo reside en su doble vertiente: por un lado, demuestra que es posible obtener modelos funcionales de 230M mediante destilación y cuantización, aptos para entornos con restricciones severas de memoria; por otro, sirve como banco de pruebas para estudiar los efectos de la abliteration en modelos pequeños. La arquitectura concreta no se especifica en la documentación disponible, aunque por el tamaño y el origen (LiquidAI) es previsiblemente un transformer denso. La longitud de contexto tampoco se ha publicado. El repositorio incluye siete cuantizaciones, desde Q2_K hasta F16, con tamaños que oscilan entre 0,12 GB y 0,46 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer denso, sin confirmar) |
| Parametros totales | 229.693.184 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Por el nombre y el origen (LiquidAI/LFM2.5-230M), se infiere que se trata de un transformer denso de 230M de parametros, pero no se ha confirmado ni el numero de capas ni la dimension del modelo. El proceso de destilacion tampoco esta documentado: el nombre sugiere que el profesor podria ser Gemini 3.8 Flash, pero no hay confirmacion explicita en la model card. Lo que si se indica es que el checkpoint base fue sometido a abliteration, una tecnica que identifica y elimina las direcciones en el espacio de activaciones responsables del comportamiento de rechazo, reduciendo asi la tendencia del modelo a negarse a responder.

El dataset de entrenamiento, el numero de tokens procesados y cualquier tecnica de alineacion adicional (RLHF, DPO, etc.) no se han publicado. La cuantizacion a GGUF se realizo con las herramientas estandar de llama.cpp (`convert_hf_to_gguf.py` y `llama-quantize`), partiendo de pesos en safetensors F32/F16. No se menciona el uso de matriz de importancia (imatrix) para la calibracion de las cuantizaciones.

## Capacidades

- Generacion de texto conversacional: el modelo esta orientado a chat, con una plantilla de conversacion basada en tokens `<|im_start|>` y `<|im_end|>`.
- Soporte multilingue limitado: declarados ingles y chino, sin especificar el nivel de competencia en cada uno.
- Comportamiento "uncensored": la abliteration suprime el rechazo ante peticiones que un modelo alineado normalmente bloquearia. Esto incluye contenido potencialmente ofensivo, sesgado o ilegal, sin filtros adicionales.
- Ejecucion en CPU y dispositivos de bajos recursos: gracias a su tamano reducido y a las cuantizaciones ligeras, puede funcionar sin GPU.
- Compatibilidad con runtimes GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y text-generation-webui.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Investigacion sobre destilacion y modelos pequenos: permite estudiar como se comporta un modelo de 230M destilado a partir de un profesor mas grande, comparando calidad de generacion y coherencia frente a modelos de tamano similar.
- Experimentacion con abliteration: util para analizar los efectos de la supresion de rechazo en la salida del modelo, tanto en terminos de utilidad como de riesgo.
- Prototipado rapido de chatbots locales: al caber en menos de 0,5 GB, se puede desplegar en un portatil o una Raspberry Pi para pruebas de concepto de asistentes conversacionales sin conexion.
- Generacion de texto sin restricciones en entornos aislados: para usos personales o de investigacion donde se necesita explorar temas que los modelos alineados evitan, siempre bajo responsabilidad del usuario.
- Pruebas de cuantizacion y rendimiento: al disponer de siete niveles de cuantizacion, sirve para medir la degradacion de calidad entre Q2_K y F16 en un modelo muy pequeno, donde la perdida de precision es mas notable que en modelos grandes.
- Educacion y divulgacion: como ejemplo practico de pipeline completo (destilacion, abliteration, cuantizacion y despliegue) en un formato accesible para estudiantes de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo o su base sin cuantizar.

## Requisitos de hardware

- VRAM estimada: inferior a 0,5 GB incluso para la cuantizacion F16 (0,46 GB). Las cuantizaciones Q4_K_M y Q5_K_M ocupan entre 0,16 y 0,18 GB, por lo que caben en cualquier GPU moderna, aunque no son necesarias.
- GPU recomendadas: ninguna en particular; el modelo esta disenado para CPU. Cualquier GPU con al menos 1 GB de VRAM puede ejecutar todas las variantes sin problemas.
- Compatibilidad con consumer GPU: si, todas las variantes se ejecutan en GPUs de gama baja (GTX 1050, integradas, etc.) y en CPU sin aceleracion.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), Ollama (mediante Modelfile), LM Studio, koboldcpp y text-generation-webui.
- Latencia y throughput: no se han publicado mediciones. Dado el tamano, en CPU moderna se esperan velocidades de decenas de tokens por segundo, pero no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con alternativas. El modelo base LFM2.5-230M de LiquidAI es la referencia directa, pero sin benchmarks no es posible establecer una comparativa cuantitativa. Otros modelos de tamano similar (por ejemplo, TinyLlama-1.1B o modelos de 200-300M como GPT-2) tienen arquitecturas y entrenamientos distintos, y no se han evaluado en las mismas condiciones. Por tanto, la comparativa se limita a lo siguiente:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-230M-distilled-Gemini-3.8-Flash-Uncensored (GGUF) | 229,7M | no disponible | Apache 2.0 | GGUF | Abliterado, sin benchmarks |
| LiquidAI/LFM2.5-230M | 229,7M | no disponible | no especificada | safetensors | Modelo base sin abliteration |
| GPT-2 (124M) | 124M | 1024 | MIT | safetensors/GGUF | Modelo clasico, sin destilacion ni abliteration |

## Limitaciones y advertencias

- Tamano muy reducido: con solo 230M de parametros, la coherencia, el razonamiento y la calidad general de la generacion son limitados, especialmente en tareas complejas. La degradacion por cuantizacion es mas perceptible que en modelos grandes.
- Abliteration deliberada: el modelo ha sido modificado para suprimir el rechazo, lo que implica que puede generar contenido inexacto, sesgado, ofensivo, ilegal o danino sin filtro alguno. No es apto para despliegue publico sin una capa de moderacion externa.
- Riesgo de alucinacion: elevado, como es habitual en modelos pequenos, y agravado por la falta de alineacion.
- Idiomas limitados: solo ingles y chino declarados; el rendimiento en otros idiomas no esta garantizado.
- Licencia: Apache 2.0, pero la model card advierte que debe confirmarse la compatibilidad con la licencia del modelo profesor (Gemini 3.8 Flash, si es el caso) y con la arquitectura base, ya que los modelos destilados pueden arrastrar restricciones adicionales.
- Sin datos de contexto: se desconoce la longitud maxima de la ventana de atencion, lo que dificulta planificar su uso en conversaciones largas.
- Fecha de creacion: el repositorio esta fechado en septiembre de 2026, lo que sugiere que es un proyecto reciente o con fechas no verificadas; no hay evidencia de uso o validacion externa (0 descargas, 0 likes).

## Enlaces

- Repositorio GGUF: https://huggingface.co/Null-Guard/LFM2.5-230M-distilled-Gemini-3.8-Flash-Uncensored-GGUF
- Modelo base (Null-Guard): https://huggingface.co/Null-Guard/LFM2.5-230M-distilled-Gemini-3.8-Flash-Uncensored
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM2.5-230M
- Cuantizaciones GGUF de LiquidAI: https://huggingface.co/LiquidAI/LFM2.5-230M-GGUF
