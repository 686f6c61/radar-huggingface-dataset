# ReadyArt/Heimdallr-27B-v0.4

## Resumen

Heimdallr-27B-v0.4 es un modelo de lenguaje de gran tamaño desarrollado por ReadyArt, basado en el modelo Qwen/Qwen3.8-27B. Se trata de un ajuste fino (fine-tune) orientado a conversación, roleplay y contenido no alineado (unaligned), con soporte explícito para temáticas adultas, NSFW y dark fantasy. El modelo se distribuye bajo licencia Apache-2.0, aunque su acceso en HuggingFace está restringido (gated) y requiere aceptar condiciones adicionales.

Con aproximadamente 27.781 millones de parámetros, el modelo se posiciona en la gama de los 27B, un tamaño que permite ejecutarse en hardware de gama alta para consumidores o en entornos profesionales con varias GPUs. Su relevancia actual radica en la demanda de modelos conversacionales sin restricciones de contenido, un nicho que ha crecido en comunidades de roleplay y generación de ficción interactiva. Sin embargo, la información pública disponible es escasa: no se han publicado detalles sobre arquitectura interna, longitud de contexto, datos de entrenamiento o benchmarks, lo que limita una evaluación técnica rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen/Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; existe una version GGUF de la v0.35, no de esta v0.4) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con acceso restringido en HuggingFace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publica detallada sobre la arquitectura interna del modelo. Dado que se basa en Qwen/Qwen3.8-27B, es probable que herede la arquitectura transformer de dicha familia, pero no se confirma si se han introducido modificaciones estructurales. Tampoco se conocen los datos de entrenamiento, el numero de tokens utilizados, ni si se aplicaron tecnicas como RLHF, DPO o similar. Los tags indican que es un modelo "unaligned" y "instruct", lo que sugiere un entrenamiento orientado a seguir instrucciones sin filtros de seguridad, pero no hay detalles tecnicos adicionales.

## Capacidades

- Generacion de texto conversacional y roleplay, con soporte para tematicas adultas y explicitas (NSFW, ERP, dark fantasy).
- Capacidad de seguir instrucciones en formato instruct, probablemente heredada del modelo base Qwen.
- No se ha confirmado soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se ha confirmado soporte para vision, audio u otras modalidades.
- Capacidades multilingues no documentadas; se desconoce si el modelo base Qwen3.8-27B es multilingue, pero no hay confirmacion para este ajuste.

## Casos de uso

- Roleplay conversacional: el modelo esta disenado para mantener personajes y narrativas interactivas, especialmente en contextos de fantasia oscura o contenido adulto. Se usaria en plataformas de chat o juegos de rol por texto.
- Generacion de ficcion interactiva: escritores y aficionados pueden emplearlo para crear historias ramificadas donde el modelo actua como narrador o personaje.
- Simulacion de personajes para juegos de mesa o videojuegos: su capacidad de mantener contexto conversacional permite usarlo como DM (dungeon master) o NPC avanzado.
- Asistente de escritura creativa sin restricciones: para autores que necesitan explorar temas controvertidos o explicitos sin censura.
- Experimentacion en IA no alineada: investigadores y desarrolladores interesados en estudiar el comportamiento de modelos sin filtros de seguridad.
- Chatbots de entretenimiento para adultos: integracion en aplicaciones de compania virtual o chat erotico, siempre que se cumplan las condiciones de uso y la legalidad aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar. Tampoco se han comparado con modelos similares en fuentes publicas.

## Requisitos de hardware

- VRAM estimada: con 27.781 millones de parametros en precision FP16, se necesitan aproximadamente 55,6 GB de VRAM (el tamano del repo es 55,6 GB). Con cuantizacion a 8 bits se reduciria a unos 28 GB, y a 4 bits a unos 14 GB, pero no se han publicado cuantizaciones oficiales para esta version.
- GPU recomendadas: para FP16 se requieren GPUs profesionales como A100 (80 GB) o H100 (80 GB), o multiples GPUs consumer (por ejemplo, 2x RTX 4090 de 24 GB). Con cuantizacion 4 bits podria caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), pero no hay archivos GGUF oficiales de esta v0.4.
- Opciones de despliegue: al ser safetensors, se puede usar con frameworks como vLLM, Hugging Face Transformers o TGI. Si se generan cuantizaciones GGUF, se podria usar con llama.cpp u Ollama, pero no estan disponibles para esta version.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo base Qwen/Qwen3.8-27B es un punto de referencia, pero no se conocen las diferencias especificas introducidas por el ajuste fino. Alternativas en el nicho de modelos no alineados de tamano similar podrian ser Mistral-7B o Llama-3-8B con ajustes similares, pero no hay datos publicos que permitan una comparacion objetiva. Se indica "no disponible" por falta de datos.

## Limitaciones y advertencias

- Contenido explicito: el modelo esta disenado para generar contenido NSFW, adulto y potencialmente perturbador. No debe utilizarse en entornos donde este contenido sea inapropiado o ilegal.
- Sesgos y alucinaciones: al ser un modelo no alineado, es probable que presente sesgos no mitigados y una mayor tendencia a alucinar, especialmente en temas delicados.
- Falta de documentacion: no hay informacion publica sobre limitaciones de contexto, idiomas soportados o rendimiento en tareas especificas, lo que dificulta su evaluacion para produccion.
- Acceso restringido: aunque la licencia es Apache-2.0, el acceso en HuggingFace esta gated, lo que implica que los usuarios deben aceptar condiciones adicionales que pueden limitar su uso comercial o de investigacion.
- Riesgo de uso indebido: al carecer de filtros de seguridad, el modelo puede generar discursos de odio, violencia o contenido ilegal si se le solicita. Es responsabilidad del usuario implementar salvaguardas externas.
- Compatibilidad: no se han publicado cuantizaciones oficiales para esta version, lo que limita su despliegue en hardware consumer sin trabajo adicional de conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ReadyArt/Heimdallr-27B-v0.4
- Version GGUF de la v0.35 (no de esta v0.4): https://huggingface.co/ReadyArt/Heimdallr-27B-v0.35-GGUF
- Modelo base Qwen/Qwen3.8-27B: no se ha proporcionado enlace directo, pero se puede buscar en HuggingFace.
- No se han encontrado papers, blogs o demos oficiales del modelo.
