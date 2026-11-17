# LlamaPal/Ternary-Bonsai-2-4B-Q2_0-GGUF

## Resumen

Ternary Bonsai 2 4B es un modelo ternario de 4.205.751.296 parametros construido por PrismML a partir de Qwen/Qwen3.5-4B, en el que cada peso se restringe a los valores -1, 0 o +1. Esta ficha corresponde a la distribucion Q2_0 en formato GGUF publicada por LlamaPal, un espejo byte a byte del fichero original de PrismML, pensado para su descarga desde la aplicacion movil LlamaPal en Android y su uso completamente offline.

El interes del modelo es la compresion extrema: un transformer de aproximadamente 4.200 millones de parametros queda en un fichero de 1,2 GB, lo que permite ejecutarlo en un telefono sin conexion ni cuenta de usuario. El precio de esa reduccion es una perdida de calidad y una generacion mas lenta, tal como advierte el propio autor en la model card. El pipeline declarado es image-text-to-text, heredado de la ficha del modelo base, aunque la informacion disponible no detalla ningun modulo de vision especifico en esta cuantizacion.

La relevancia actual esta en la categorizacion de modelos ternarios como via practica para inferencia en dispositivo: pesos de 2 bits efectivos, licencia Apache 2.0 y compatibilidad con llama.cpp y cualquier aplicacion construida sobre el. No hay resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B); pesos ternarios (-1, 0, +1) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_0 (ternaria, GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Ternary-Bonsai-2-4B-Q2_0.gguf`, 1,2 GB, SHA-256 `64a5183b44921bdb5ac4a6f5f92007821d6ebe5c66997d3c147fd214ab9433d4`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de unos 4.200 millones de parametros, y aplica una ternarizacion de pesos en la que cada valor se mapea a -1, 0 o +1. El resultado se serializa en formato GGUF con la etiqueta de cuantizacion Q2_0, lo que reduce el peso del fichero a 1,2 GB. La informacion proporcionada no detalla el metodo exacto de ternarizacion (por ejemplo, escalado por grupo, quantizacion post-entrenamiento o entrenamiento con pesos ternarios desde el inicio), ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo fases de RLHF o DPO.

Tampoco se documentan innovaciones adicionales como atencion lineal, decodificacion especulativa o modulos multimodales propios. El tag `image-text-to-text` proviene de la ficha del modelo base y no viene acompanado de especificacion tecnica alguna en esta publicacion. El unico detalle verificable es que se trata de una copia sin modificar del fichero de `prism-ml/Ternary-Bonsai-2-4B-gguf` en el commit `50ebba61be85`, con el mismo hash SHA-256.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el uso previsto en la aplicacion LlamaPal.
- Ejecucion completamente offline en dispositivo, sin conexion a internet y sin cuenta de usuario.
- Compatibilidad con llama.cpp y con cualquier aplicacion construida sobre esta libreria, al ser un GGUF estandar.
- Pipeline declarado image-text-to-text heredado del modelo base; no se especifica en la informacion disponible que modulos de vision se conservan tras la ternarizacion.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la ficha no enumera idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional offline en Android: el usuario descarga el fichero de 1,2 GB desde LlamaPal y mantiene conversaciones sin conexion, sin que el texto salga del telefono. Es adecuado por el tamano reducido y la naturaleza local del despliegue.
- Escenarios de privacidad estricta: al no requerir red ni cuenta, encaja en entornos donde no se permite enviar prompts a servicios en la nube, como notas personales o consultas sensibles en dispositivo.
- Pruebas de concepto de modelos ternarios: util para investigadores que quieran medir la degradacion de calidad frente al Qwen3.5-4B original con llama.cpp y `llama-bench`.
- Integracion en aplicaciones moviles propias: cualquier app basada en llama.cpp puede cargar el GGUF y ofrecer chat local sin infraestructura de servidor.
- Distribucion en entornos con ancho de banda limitado: el fichero de 1,2 GB frente a los aproximadamente 8 GB de un 4B en FP16 facilita la descarga inicial en redes moviles.
- Evaluacion comparativa de cuantizaciones: sirve como referencia Q2_0 ternaria frente a otras cuantizaciones del mismo modelo base para estudiar el equilibrio tamano-calidad en hardware de gama baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,2 GB solo para los pesos; hay que sumar el espacio del contexto KV, no cuantificado en la informacion disponible.
- GPU recomendadas: no disponible. El destino declarado es CPU de telefono Android mediante llama.cpp.
- Cabe en GPU de consumo: si, por tamano de pesos, en cualquier GPU con al menos 2 GB de memoria libre; no se especifican modelos concretos (RTX 4090, etc.) en la informacion disponible.
- Opciones de despliegue: llama.cpp y aplicaciones basadas en llama.cpp; LlamaPal en Android. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. El autor advierte de "respuestas mas lentas" frente a cuantizaciones mayores, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary Bonsai 2 4B (Q2_0) | 4.205.751.296 | no disponible | Ternaria Q2_0, GGUF de 1,2 GB | Apache 2.0 | Hugging Face (espejo de LlamaPal) |
| Qwen/Qwen3.5-4B (base) | ~4,2 B | no disponible | FP16/BF16 y otras | no disponible en esta ficha | Hugging Face |
| Otras cuantizaciones del mismo base | ~4,2 B | no disponible | Q4, Q8, etc. | segun repositorio | no disponible |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La ternarizacion a -1, 0 y +1 implica una perdida de calidad frente al modelo base Qwen3.5-4B; el autor reconoce explicitamente el intercambio de tamano por velocidad y fidelidad.
- Generacion mas lenta que cuantizaciones convencionales, segun la model card.
- Riesgo de alucinacion no cuantificado; no hay evaluaciones publicadas en la informacion disponible.
- No se documentan sesgos conocidos ni idiomas soportados, lo que dificulta evaluar su comportamiento fuera del ingles u otros idiomas del base.
- Longitud de contexto no especificada; no debe asumirse la del modelo base sin verificacion.
- Uso comercial permitido por la licencia Apache 2.0, pero conviene revisar el fichero LICENSE del repositorio y la ficha original de PrismML para condiciones adicionales.
- Repositorio espejo con 0 descargas y 0 likes en el momento de la consulta; la fuente canonica y el mantenimiento corresponden a PrismML.
- El pipeline image-text-to-text no esta respaldado por documentacion tecnica en esta publicacion; no asumir capacidades de vision sin validarlas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LlamaPal/Ternary-Bonsai-2-4B-Q2_0-GGUF
- Repositorio original de PrismML: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf
- Commit del fichero original: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf/tree/50ebba61be85e5be07e8083db468ace0fc1bac43
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Aplicacion LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
