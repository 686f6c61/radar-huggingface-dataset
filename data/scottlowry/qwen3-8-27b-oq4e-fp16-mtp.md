# scottlowry/Qwen3.8-27B-oQ4e-fp16-mtp

## Resumen

Qwen3.8-27B-oQ4e-fp16-mtp es una cuantización en 4 bits del modelo Qwen3.8-27B de Alibaba, realizada con la herramienta oQ (oMLX) y publicada en formato MLX safetensors. El modelo base es un LLM denso de 27 mil millones de parámetros, nativamente multimodal (visión y lenguaje), diseñado para tareas de codificación, agentes y automatización de oficina, con una ventana de contexto nativa de 262.000 tokens. Esta cuantización reduce el tamaño del modelo a aproximadamente 17,9 GB, lo que permite ejecutarlo en hardware de consumo, especialmente en equipos Apple Silicon mediante MLX. La cuantización utiliza 4 bits con group size 64 y mantiene los pesos de ciertas capas en fp16 (de ahí el nombre "fp16-mtp"), lo que busca preservar la calidad del modelo original.

El modelo está pensado para desarrolladores e investigadores que necesitan ejecutar un modelo multimodal de alto rendimiento en local, con soporte para razonamiento configurable y tareas de agente. Al ser una cuantización, se sacrifica algo de precisión a cambio de eficiencia, pero la técnica oQ de oMLX está diseñada para minimizar la pérdida de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-lenguaje) |
| Parametros totales | 4.926.789.872 (segun safetensors; el modelo base tiene 27B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens (nativa del modelo base) |
| Tipos de cuantizacion | 4 bits, group size 64, con capas en fp16 (oQ4e-fp16-mtp) |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas) |
| Licencia | no disponible (el modelo base usa Apache 2.0) |
| Formato de pesos | MLX safetensors |

Nota: el numero de parametros reportado en safetensors es 4.926.789.872, que no coincide con los 27B del modelo base; posiblemente sea un error de metadata o se refiera a los tensores cuantizados. En cualquier caso, el tamano del repo es 17,9 GB.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso (no MoE) con arquitectura multimodal nativa, es decir, integra vision y lenguaje en un solo modelo sin modulos separados. Fue entrenado por Alibaba con un enfoque en codificacion, agentes y automatizacion de oficina, y soporta razonamiento configurable (modo de pensamiento). La ventana de contexto nativa es de 262.000 tokens, lo que permite manejar documentos largos y conversaciones extensas.

La cuantizacion oQ4e-fp16-mtp se realizo con la herramienta oMLX (oQ) en su version 0.6.0.dev1. Utiliza cuantizacion de 4 bits con group size 64, pero mantiene ciertas capas (probablemente las de atencion o las de salida) en fp16 para preservar la precision. El formato de salida es MLX safetensors, optimizado para el framework MLX de Apple.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es capaz de tareas complejas de razonamiento, con un modo de pensamiento configurable (similar a otros modelos de Qwen).
- Vision: al ser multimodal, puede procesar imagenes y responder preguntas sobre ellas, aunque la cuantizacion puede afectar ligeramente la calidad.
- Codificacion: excelente en generacion de codigo, depuracion y explicacion de codigo, segun el repositorio oficial.
- Agentes y tool calling: soporta workflows de agente, incluyendo llamadas a herramientas y planificacion multi-paso.
- Multilingue: aunque no se especifican los idiomas, el modelo base de Qwen suele soportar ingles, chino y otros idiomas.
- Contexto largo: con 262K tokens, puede manejar documentos extensos, libros o conversaciones largas.

## Casos de uso

- Asistente de programacion local: un desarrollador puede ejecutar este modelo en su Mac para obtener ayuda con codigo, refactorizacion o explicacion de errores, sin depender de la nube. La cuantizacion permite que quepa en memoria unificada de 32 GB o mas.
- Automatizacion de oficina: el modelo puede procesar documentos, extraer informacion, redactar correos o resumir informes, gracias a su capacidad de contexto largo y razonamiento.
- Analisis de imagenes en local: al ser multimodal, puede describir imagenes, extraer texto de capturas o responder preguntas visuales, util para aplicaciones de accesibilidad o documentacion.
- Agente conversacional con memoria larga: su ventana de 262K tokens permite mantener conversaciones muy largas sin perder contexto, ideal para chatbots de atencion al cliente o asistentes personales.
- Investigacion academica: para procesar papers largos, comparar resultados o generar resumenes, aprovechando el contexto extendido.
- Prototipado de aplicaciones de IA: los desarrolladores pueden usar este modelo cuantizado para probar funcionalidades de vision-lenguaje en entornos con recursos limitados antes de escalar a modelos mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion en la informacion disponible. El modelo base Qwen3.8-27B tiene benchmarks publicados por Alibaba, pero no se incluyen aqui. Se recomienda consultar el repositorio oficial para datos de rendimiento del modelo original.

## Requisitos de hardware

- Al ser un modelo MLX, esta optimizado para Apple Silicon (M1, M2, M3, M4, etc.).
- Tamano del repo: 17,9 GB, por lo que se necesita al menos esa cantidad de memoria unificada para cargarlo, mas overhead del sistema. Se recomienda un minimo de 24 GB de memoria unificada para un uso comodo.
- GPU recomendadas: Apple Silicon con 32 GB o mas de memoria unificada (por ejemplo, M1 Pro/Max, M2 Pro/Max, M3 Max, etc.).
- No es adecuado para GPUs NVIDIA directamente, ya que MLX es especifico de Apple. Para NVIDIA, se necesitaria convertir a otro formato (GGUF, etc.).
- Opciones de despliegue: se puede usar con el framework MLX de Apple, o mediante herramientas como llama.cpp si se convierte, pero la version actual es solo MLX.
- Latencia y throughput: no disponible, pero al ser 4 bits, la inferencia es rapida en hardware Apple Silicon.

## Comparativa con modelos similares

No se dispone de comparativas directas con otras cuantizaciones del mismo modelo. Sin embargo, se puede comparar con otras versiones cuantizadas de Qwen3.8-27B (por ejemplo, GGUF de 4 bits) o con modelos similares como Llama-3.1-8B o Qwen2.5-27B. La principal diferencia es el formato MLX, que solo funciona en Apple, mientras que GGUF es mas universal. En cuanto a rendimiento, la cuantizacion oQ4e-fp16-mtp busca mantener la calidad con capas en fp16, lo que puede dar mejor precision que una cuantizacion estandar de 4 bits.

## Limitaciones y advertencias

- La cuantizacion puede introducir perdida de precision en tareas de razonamiento complejo o en la generacion de codigo, aunque la tecnica oQ intenta mitigarlo.
- El modelo base puede tener sesgos en los datos de entrenamiento, especialmente en temas sensibles.
- Riesgo de alucinacion, como en todos los LLM, especialmente en tareas de vision donde la cuantizacion puede degradar la calidad de la percepcion.
- La licencia no esta especificada en este repo, pero el modelo base usa Apache 2.0, que permite uso comercial. Sin embargo, se debe verificar la licencia del modelo base.
- Al ser MLX, no es compatible con entornos que usen CUDA o ROCm sin conversion previa.
- El numero de parametros reportado en safetensors es inconsistente con el modelo base, lo que podria indicar un error en la metadata; se recomienda verificar la integridad del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/scottlowry/Qwen3.8-27B-oQ4e-fp16-mtp
- Repositorio del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
