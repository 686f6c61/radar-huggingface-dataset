# bac2qh/Qingqiu-MT-9B-MLX-8bit

## Resumen

Qingqiu-MT-9B-MLX-8bit es una conversión no oficial al formato MLX con cuantización de 8 bits del modelo Qingqiu-MT-9B, un modelo de traducción instruccional desarrollado por el equipo WPS-Qingqiu de Kingsoft Office. Esta versión concreta ha sido generada por el usuario independiente bac2qh mediante `mlx-lm` 0.31.1 y está pensada para su ejecución en hardware Apple Silicon a través del framework MLX, no para GPUs NVIDIA ni para despliegues convencionales con vLLM o TGI.

El modelo subyacente se construye sobre la arquitectura Qwen3.5-9B, un transformer denso de aproximadamente 8.950 millones de parámetros (8,953.801.728 según los pesos en safetensors). La torre de visión del modelo base Qwen3.5-9B no se incluye en esta conversión: `mlx-lm` carga únicamente el modelo de texto, por lo que este build contiene exclusivamente pesos lingüísticos. La cuantización aplicada es afín de 8 bits con tamaño de grupo 64, lo que resulta en aproximadamente 8,5 bits por peso y un repositorio de 9,5 GB frente a los 18,8 GB de los pesos BF16 originales.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de despliegue local en Mac para un modelo especializado en traducción multilingüe con instrucciones; por otro, advierte de que se trata de una conversión de terceros, sin revisión ni aval de los autores originales, lo que condiciona su uso en producción. La licencia declarada es Apache 2.0, heredada del repositorio original, que incluye el aviso de copyright de Alibaba Cloud para el modelo base Qwen3.5-9B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-9B, solo torre de texto; sin vision) |
| Parametros totales | 8.953.801.728 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX afín de 8 bits, group size 64 (~8,5 bits por peso) |
| Idiomas soportados | no disponible (modelo multilingüe según tags; sin listado oficial en la información proporcionada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 9,5 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen3.5-9B, un transformer denso de aproximadamente 9.000 millones de parámetros. El modelo base original incluye una torre de visión que la tarea de traducción no utiliza; en esta conversión MLX esa torre se ha descartado por completo, de modo que el artefacto resultante es un modelo puramente textual. La cuantización se realizó con `mlx-lm` 0.31.1 mediante cuantización afín de 8 bits con grupo de 64, aplicada una sola vez sobre una copia local de la revisión `82385ebe32388d1fb0f406a288a1bd66d464bea8` del repositorio original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo original empleó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas específicas más allá de la propia especialización instruccional para traducción. Los ficheros `chat_template.jinja`, `tokenizer.json` y `tokenizer_config.json` se conservan tal cual los escribe `mlx-lm` a partir de la revisión fuente, y `config.json` es la configuración original reescrita por `mlx-lm` con el bloque `quantization` añadido.

## Capacidades

- Traducción instruccional entre idiomas: el modelo acepta una instrucción en lenguaje natural que especifica idioma origen, idioma destino y directrices adicionales, y devuelve únicamente la traducción.
- Seguimiento de instrucciones de traducción: permite imponer restricciones de estilo, terminología o formato mediante el campo `instruction` de la plantilla.
- Multilingüismo: etiquetado como `multilingual`; la model card original referencia una tabla de nombres de idioma en inglés (por ejemplo, `Simplified Chinese`), aunque el listado completo no está disponible en la información proporcionada.
- Modo no-thinking: debe invocarse con `enable_thinking=False` en la plantilla de chat.
- Formato de prompt específico: un único mensaje de usuario, sin system prompt, con la plantilla `Translate the following {src_lang} text into {tgt_lang}. Strictly follow the instruction below. Output only the translation.`
- No incluye capacidades de visión en esta conversión, pese a que el modelo base Qwen3.5-9B sí las tenga.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Traducción local en macOS sobre Apple Silicon: al estar en formato MLX, el modelo puede ejecutarse íntegramente en un Mac con `mlx-lm`, sin depender de servicios en la nube ni de GPUs NVIDIA, lo que resulta adecuado para flujos de trabajo con requisitos de privacidad.
- Traducción de documentación técnica con terminología controlada: el campo `instruction` permite fijar glosarios o convenciones de estilo, de modo que el modelo aplique terminología consistente en manuales, guías de API o documentación de producto.
- Localización de cadenas de interfaz de usuario: para volúmenes moderados de texto corto, el modelo puede traducir lotes de cadenas respetando una instrucción de formato, aunque la ausencia de datos de contexto y de benchmarks obliga a validar la calidad por idioma antes de automatizar.
- Preprocesado o prototipado de pipelines de traducción: útil en fases de experimentación para comparar enfoques o generar traducciones preliminares que luego se revisan humanamente, dado que es una conversión no oficial y sin garantías.
- Traducción en entornos sin conectividad: al ser un artefacto de 9,5 GB ejecutable en local, encaja en escenarios de campo, auditoría o investigación donde no se permite enviar texto a APIs externas.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de calidad de una cuantización de 8 bits frente a los pesos BF16 originales en tareas de traducción, siempre que se disponga de un conjunto de evaluación propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 9,5 GB, por lo que se necesita al menos esa cantidad de memoria unificada más el overhead de ejecución; en la práctica, un Mac con 16 GB de RAM unificada es el mínimo razonable y 24-32 GB ofrece mayor margen.
- Hardware objetivo: Apple Silicon (familias M1, M2, M3, M4 y superiores) mediante el framework MLX. No está pensado para GPUs NVIDIA ni AMD.
- GPU dedicadas: no aplica; esta conversión no está diseñada para A100, H100 ni RTX 4090, ya que el formato MLX es específico del ecosistema Apple.
- Despliegue: `mlx-lm` (versión 0.31.1 usada en la conversión). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qingqiu-MT-9B-MLX-8bit (este) | 8.953.801.728 | no disponible | MLX safetensors 8-bit | Apache 2.0 | Conversión no oficial, solo texto, orientada a Apple Silicon |
| WPS-Qingqiu/Qingqiu-MT-9B (original) | ~9B | no disponible | BF16 safetensors (~18,8 GB) | Apache 2.0 | Modelo fuente oficial, incluye torre de visión en el base Qwen3.5-9B |
| Qwen3.5-9B (modelo base) | ~9B | no disponible | safetensors | Apache 2.0 (con aviso de Alibaba Cloud) | Modelo generalista con visión; no especializado en traducción |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: no ha sido creada, revisada ni avalada por los autores originales de Qingqiu-MT-9B; la calidad de la cuantización no está validada por ellos.
- Pérdida de capacidades: la torre de visión del modelo base Qwen3.5-9B se ha eliminado, por lo que no puede procesar imágenes.
- Calidad de traducción no verificada: no hay benchmarks publicados para esta conversión; la cuantización de 8 bits puede introducir degradación frente a BF16, especialmente en idiomas de bajos recursos.
- Riesgo de alucinación y de omisión: como todo modelo generativo, puede inventar contenido o saltarse fragmentos, algo crítico en traducción donde la fidelidad es requisito.
- Idiomas no documentados: la lista exacta de idiomas soportados no está disponible; debe validarse empíricamente por par de idiomas antes de usarlo en producción.
- Restricciones de uso del prompt: requiere un formato muy concreto (un solo mensaje de usuario, sin system prompt, `enable_thinking=False`); desviarse de él puede degradar gravemente la salida.
- Licencia: Apache 2.0 permite uso comercial, pero debe conservarse el fichero `LICENSE` original, que incluye el aviso de copyright de Alibaba Cloud para el modelo base Qwen3.5-9B.
- Ecosistema limitado: al ser MLX, no es portable a infraestructura NVIDIA ni a servidores de inferencia estándar; para producción en servidores conviene usar el modelo original en BF16 o convertirlo a otro formato.
- Sesgos: no se documentan sesgos específicos en la información proporcionada, pero al no haber datos de entrenamiento públicos no pueden descartarse sesgos culturales o lingüísticos heredados del corpus.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/bac2qh/Qingqiu-MT-9B-MLX-8bit
- Modelo original: https://huggingface.co/WPS-Qingqiu/Qingqiu-MT-9B
- Revisión concreta del modelo fuente: https://huggingface.co/WPS-Qingqiu/Qingqiu-MT-9B/tree/82385ebe32388d1fb0f406a288a1bd66d464bea8
- Framework MLX: https://github.com/ml-explore/mlx
- Herramienta de conversión mlx-lm: no se proporciona enlace directo en la información disponible (referenciada como `mlx-lm` 0.31.1)
