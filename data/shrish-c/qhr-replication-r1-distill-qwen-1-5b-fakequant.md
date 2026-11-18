# Shrish-C/qhr-replication-r1-distill-qwen-1.5b-fakequant

## Resumen

`Shrish-C/qhr-replication-r1-distill-qwen-1.5b-fakequant` es un conjunto de checkpoints derivados de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, un modelo de lenguaje de 1.500 millones de parametros desarrollado originalmente por DeepSeek a partir de Qwen2.5-1.5B y destilado con trazas de razonamiento de DeepSeek-R1. Este repositorio no entrena un modelo nuevo: aplica cuantizacion simulada (*fake quantization*) siguiendo el codigo publicado por Liu et al. en el articulo «Quantization Hurts Reasoning?» (COLM 2025), commit `bf947e2`, con paralelismo tensorial 1, como reproduccion independiente de sus resultados.

El objetivo es permitir estudiar como afecta la cuantizacion a las capacidades de razonamiento de un modelo pequeno de la familia R1 sin necesidad de disponer de kernels cuantizados en tiempo de ejecucion: los pesos se almacenan ya de-cuantizados (es decir, en precision completa tras haber sido redondeados a una rejilla de cuantizacion), con una carpeta por configuracion. Esto facilita la evaluacion comparativa entre niveles de bits y estrategias de cuantizacion usando el mismo stack de inferencia estandar.

Es relevante ahora porque la cuantizacion es la via habitual para desplegar modelos de razonamiento en hardware modesto, y la evidencia sobre su impacto en tareas de cadena de pensamiento es todavia limitada. Al publicarse bajo licencia MIT y con los pesos en formato estandar, sirve como material reproducible para investigadores interesados en la relacion entre precision numerica y calidad de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B, destilado de DeepSeek-R1) |
| Parametros totales | 1.500 millones (aproximado, heredado del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5 soporta hasta 32.768 tokens) |
| Tipos de cuantizacion | fake quantization (cuantizacion simulada) con pesos almacenados de-cuantizados; configuraciones multiples, una carpeta por configuracion; niveles de bits no especificados en la model card |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato por defecto de Hugging Face; no se especifica explicitamente en la model card) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `DeepSeek-R1-Distill-Qwen-1.5B`: un transformer decoder-only de la familia Qwen2.5 con aproximadamente 1.500 millones de parametros, afinado por DeepSeek mediante destilacion supervisada sobre trazas de razonamiento generadas por DeepSeek-R1. Este repositorio no modifica dicha arquitectura ni realiza un entrenamiento adicional; lo que hace es aplicar el pipeline de cuantizacion simulada del trabajo de Liu et al. (COLM 2025) sobre los pesos del modelo base.

La innovacion tecnica del repositorio es metodologica: en lugar de producir artefactos con kernels de cuantizacion (por ejemplo, formatos de 4 bits empaquetados), se generan checkpoints *fake-quantized* en los que los pesos han sido redondeados a la rejilla de cuantizacion correspondiente y posteriormente almacenados de nuevo en precision completa (de-cuantizados). Esto permite ejecutar el modelo con frameworks de inferencia convencionales y aislar el efecto puro del redondeo sobre el rendimiento, sin confundirlo con diferencias de implementacion de kernels. Se usa paralelismo tensorial 1 y una carpeta separada por configuracion de cuantizacion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en esta ficha, ya que corresponden al modelo base y no se detallan en la model card.

## Capacidades

- Generacion de texto y razonamiento multi-paso: hereda el modo de razonamiento de la familia DeepSeek-R1, con cadenas de pensamiento antes de la respuesta final.
- Razonamiento matematico: el modelo base fue destilado con datos que incluyen problemas aritmeticos y algebraicos; se espera capacidad para resolver problemas de nivel escolar y competicion basica.
- Generacion de codigo: el modelo base Qwen2.5-1.5B tiene competencia en lenguajes de programacion populares; el destilado de R1 anade razonamiento previo a la solucion.
- Soporte multilingue: no confirmado en la informacion disponible; el modelo base Qwen2.5 soporta varios idiomas, pero este repositorio no declara lista de idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: parcialmente cubiertas por el modo de pensamiento del modelo base, pero no se documentan integraciones de agentes en este repositorio.
- Capacidad especial: el interes del checkpoint es servir como material de evaluacion de cuantizacion, no como modelo de produccion.

## Casos de uso

- Reproduccion de experimentos de cuantizacion: ejecutar el mismo prompt y configuracion de decodificacion sobre cada carpeta de configuracion para medir la degradacion en tareas de razonamiento (matematicas, logica, codigo) y contrastar los resultados de Liu et al. (COLM 2025).
- Evaluacion de robustez numerica: comparar la salida del checkpoint fake-quantized con la del modelo base en precision completa para identificar en que tipos de problemas (por ejemplo, aritmetica de varios pasos) el redondeo introduce errores.
- Investigacion sobre cadenas de pensamiento: analizar si la cuantizacion acorta, alarga o desvia las trazas de razonamiento generadas por el modelo, usando las carpetas de configuracion como variables independientes.
- Docencia y formacion: ilustrar en un curso de cuantizacion como se construye un checkpoint fake-quantized y como se compara su comportamiento con el original, sin necesidad de GPUs con soporte de kernels de bajos bits.
- Baseline para metodos de cuantizacion: usar estos checkpoints como referencia frente a tecnicas de cuantizacion real (GPTQ, AWQ, bitsandbytes) y comprobar si las diferencias observadas se deben al redondeo o a la implementacion.
- Pruebas de pipelines de evaluacion: validar arneses de benchmarking (por ejemplo, harness de lm-evaluation) sobre modelos pequenos con pesos de-cuantizados antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse los pesos de-cuantizados en precision completa, la huella es la del modelo base en FP16/BF16, aproximadamente 3 GB de pesos mas overhead de activaciones y cache KV. Las configuraciones de cuantizacion no reducen el consumo de memoria en tiempo de ejecucion, ya que los pesos se cargan de-cuantizados.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16; una RTX 3060, RTX 4060 o superior es suficiente. Para evaluaciones por lotes con contexto largo, se recomienda RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 8 GB o mas; tambien es viable en CPU con llama.cpp u Ollama si se convierte a GGUF.
- Opciones de despliegue: transformers (con `AutoModelForCausalLM`), vLLM, TGI, llama.cpp y Ollama previa conversion a GGUF. El formato fake-quantized no requiere kernels especiales.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del hardware y del framework.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Shrish-C/qhr-replication-r1-distill-qwen-1.5b-fakequant | ~1.500 M | no disponible | MIT | Hugging Face | Checkpoints fake-quantized para reproduccion |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | ~1.500 M | 32.768 (segun modelo base Qwen2.5) | MIT | Hugging Face | Modelo base original, precision completa |
| Qwen/Qwen2.5-1.5B | ~1.500 M | 32.768 | Apache 2.0 | Hugging Face | Modelo generalista sin destilacion de razonamiento |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | ~7.000 M | 32.768 (segun modelo base) | MIT | Hugging Face | Version mayor de la misma familia de destilados |

## Limitaciones y advertencias

- Los pesos estan almacenados de-cuantizados: no aportan ahorro de memoria ni aceleracion en inferencia respecto al modelo base; su utilidad es exclusivamente experimental.
- El nivel o niveles de bits de cada configuracion no se documentan en la model card; es necesario inspeccionar las carpetas del repositorio para conocerlos.
- Al derivar de un modelo destilado de 1.500 millones de parametros, la capacidad de razonamiento es limitada en comparacion con modelos mayores; los errores en problemas de varios pasos son esperables.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, especialmente en dominios factuales y en contextos largos.
- No se declara la lista de idiomas soportados ni se han publicado evaluaciones multilingues para este checkpoint.
- La licencia MIT permite uso comercial, pero el modelo base conserva sus propias condiciones; conviene verificar la licencia del modelo original antes de redistribuir.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta y no cuenta con pipeline declarado; no hay evidencia de validacion externa de los checkpoints.
- No se han publicado resultados de benchmarks propios, por lo que no se puede confirmar que la reproduccion coincida con los resultados del articulo original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Shrish-C/qhr-replication-r1-distill-qwen-1.5b-fakequant
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Articulo de referencia: Liu et al., «Quantization Hurts Reasoning?» (COLM 2025); no se dispone de URL directa en la informacion proporcionada.
- Codigo de referencia: repositorio de los autores en el commit `bf947e2`; no se dispone de URL directa en la informacion proporcionada.
