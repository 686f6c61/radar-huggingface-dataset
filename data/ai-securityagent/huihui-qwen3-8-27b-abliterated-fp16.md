# AI-SecurityAgent/Huihui-Qwen3.8-27B-abliterated-FP16

## Resumen

Huihui-Qwen3.8-27B-abliterated-FP16 es una conversion a FP16 del modelo huihui-ai/Huihui-Qwen3.8-27B-abliterated, que a su vez es una version "abliterated" del Qwen/Qwen3.8-27B del equipo Qwen. La operacion de abliteration elimina o atenua la direccion de rechazo en el espacio de activaciones, de modo que el modelo reduce drasticamente su comportamiento de negativa ante peticiones que el modelo original rechazaria. Esta ficha cubre la variante FP16 publicada por AI-SecurityAgent, pensada para entornos donde se prefiere el formato de coma flotante de 16 bits estandar en lugar de BF16.

El modelo conserva la arquitectura y el pipeline del original: es un modelo multimodal image-text-to-text con 27.781.427.952 parametros (unos 27,8 mil millones) y pesos en safetensors, cargable con la libreria transformers. El repositorio ocupa 55,6 GB, coherente con pesos en FP16. La licencia declarada es Apache-2.0, heredada del modelo base.

La relevancia de esta publicacion es acotada pero clara: ofrece una alternativa sin censura, en FP16 y con la plantilla de chat y tokenizer intactos, para investigacion en seguridad de modelos, analisis de sesgos y estudios de robustez frente a jailbreaks. No es un modelo recomendado para despliegues de produccion orientados al publico general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 en este repo; el modelo base dispone de otras variantes, no detalladas aqui |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP16) |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Qwen3 con aproximadamente 27,8 mil millones de parametros, segun los metadatos de safetensors. El pipeline declarado es image-text-to-text, lo que implica capacidad multimodal de entrada (imagenes y texto) y salida de texto. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa; estos datos no aparecen en la informacion proporcionada.

El entrenamiento original corresponde al Qwen/Qwen3.8-27B, sobre el que huihui-ai aplico la tecnica de abliteration, que consiste en identificar la direccion de activacion asociada al rechazo y proyectarla fuera de los pesos o las activaciones. Esta variante FP16 se obtiene convirtiendo los pesos BF16 del modelo abliterated a FP16, recortando los valores fuera del rango representable a +-65504. No se realizo ningun otro cambio: tokenizer, configuraciones y plantilla de chat son identicos a los del repositorio de origen. No hay informacion sobre el dataset de entrenamiento, el volumen de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat heredada del modelo Qwen original.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), lo que permite preguntas sobre imagenes y descripcion de contenido visual.
- Comportamiento sin censura: reduce de forma marcada las negativas ante peticiones que el modelo base rechazaria.
- Razonamiento y generacion de codigo: capacidades heredadas del Qwen3.8-27B original, aunque no se documentan resultados concretos en esta ficha.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para esta variante.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente.
- Capacidades multilingues: no disponibles; la model card no detalla idiomas.

## Casos de uso

- Investigacion en seguridad de IA: analisis de como la abliteration altera las respuestas del modelo frente a prompts sensibles, comparando con el Qwen3.8-27B original para medir la eficacia de la tecnica.
- Red teaming y evaluacion de jailbreaks: uso como sujeto de prueba para validar clasificadores de contenido y filtros de seguridad en pipelines de moderacion.
- Estudio de sesgos y alineacion: examinar que comportamientos emergen cuando se elimina la direccion de rechazo y como se distribuyen las respuestas en dominios controvertidos.
- Generacion de datos sinteticos para entrenamiento de clasificadores: producir ejemplos de texto que los modelos alineados rechazan, utiles para entrenar detectores de contenido dañino.
- Experimentacion multimodal controlada: probar la comprension imagen-texto en escenarios de investigacion donde se necesita un modelo sin restricciones de salida, con supervision humana.
- Evaluacion comparativa de formatos numericos: comparar el comportamiento FP16 frente al BF16 del modelo base para medir diferencias por clipping de valores extremos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 55,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 64-80 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2x RTX 4090 de 24 GB con sharding).
- Cabe en GPU de consumo: no en una sola unidad de 24 GB en FP16; requeriria cuantizacion adicional (no incluida en este repo) o sharding multi-GPU.
- Opciones de despliegue: transformers (libreria declarada), con posibilidad de vLLM o TGI para servir en FP16; llama.cpp y Ollama requeririan conversion a GGUF, no incluida.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-FP16 | 27,8 B | no disponible | Apache-2.0 | Variante FP16 sin censura |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27,8 B | no disponible | Apache-2.0 | Modelo base en BF16, misma abliteration |
| Qwen/Qwen3.8-27B | 27,8 B | no disponible | Apache-2.0 | Modelo original alineado, con rechazo estandar |

La diferencia principal entre las tres variantes es el comportamiento de rechazo y el formato numerico; arquitectura y tamano son identicos. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo sin censura: la abliteration reduce las negativas, lo que aumenta el riesgo de generar contenido dañino, ilegal o sesgado. No apto para aplicaciones orientadas al publico sin capas adicionales de moderacion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el modelo hereda los riesgos del Qwen3.8-27B original.
- Conversion FP16 con clipping a +-65504: valores fuera de rango se saturan, lo que puede introducir degradaciones sutiles respecto al BF16 original en casos extremos.
- Idiomas y contexto: no documentados; no se puede garantizar cobertura multilingue ni longitud de ventana concreta.
- Licencia Apache-2.0 permite uso comercial, pero el autor advierte explicitamente de que el uso es bajo responsabilidad del usuario.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por la comunidad.
- No se documentan capacidades de tool calling ni de agente; no asumirlas en produccion sin verificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI-SecurityAgent/Huihui-Qwen3.8-27B-abliterated-FP16
- Modelo base (abliterated, BF16): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
