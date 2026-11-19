# SkinwalkerTaxidermy/Long-Live-Dolphin-24B-Venice-Edition

## Resumen

Long-Live-Dolphin-24B-Venice-Edition es un ajuste fino (fine-tune) del modelo Mistral-Small-24B-Instruct-2501 de Mistral AI, publicado por el usuario SkinwalkerTaxidermy en Hugging Face. Se trata de una variante de la familia Dolphin de Cognitive Computations (dphn.ai), en este caso la "Venice Edition", desarrollada en colaboración con Venice.ai con el objetivo declarado de ofrecer la versión "menos censurada" del modelo Mistral 24B para su uso dentro del ecosistema Venice. El modelo se presenta como un modelo de propósito general orientado a conversación, con capacidad de procesamiento de imagen y texto (image-text-to-text) y etiquetado como mistral3 en la plataforma.

Arquitectura transformer de tipo Mistral 3 (según los tags de Hugging Face), con 24.011.361.280 parámetros totales (aproximadamente 24 mil millones) y un tamaño de repositorio de 48,1 GB en formato safetensors. El modelo base es Mistral-Small-24B-Instruct-2501, del que hereda el tokenizador, la plantilla de chat y presumiblemente la ventana de contexto, aunque la model card no detalla explícitamente la longitud de contexto ni los datos de entrenamiento más allá de mencionar que se entrenó en 8 GPU B200 proporcionadas por Targon.

La relevancia de este modelo reside en su enfoque de "desalineación" o control total por parte del propietario del sistema: el autor argumenta que los modelos comerciales imponen un alineamiento único, controlan el system prompt y las versiones, y pueden acceder a los datos de los usuarios, mientras que Dolphin delega estas decisiones en quien despliega el modelo. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo se distribuye sin garantías y con advertencias implícitas sobre contenido sensible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Mistral 3, según tags de Hugging Face) |
| Parametros totales | 24.011.361.280 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de vLLM usa `--max-model-len 131072`, pero no se confirma como contexto nativo del modelo) |
| Tipos de cuantizacion | No disponible en la información proporcionada |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también compatible con transformers, vLLM, Ollama, LM Studio, SGLang, TGI según la model card) |

## Arquitectura y entrenamiento

El modelo se basa en Mistral-Small-24B-Instruct-2501, un transformer decoder-only de Mistral AI con aproximadamente 24 mil millones de parámetros. Los tags de Hugging Face lo clasifican como `mistral3`, lo que sugiere que emplea la arquitectura Mistral 3, aunque la model card no proporciona detalles técnicos sobre atención, normalización, activaciones ni innovaciones específicas de la arquitectura. El modelo soporta entrada de imagen y texto (`image-text-to-text`), lo que indica capacidades multimodales heredadas o añadidas respecto al base.

En cuanto al entrenamiento, la model card únicamente indica que el modelo fue entrenado en 8 GPU B200 proporcionadas por Targon. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal. La model card sí menciona que se mantuvo la plantilla de chat por defecto de Mistral y que el system prompt es la herramienta principal para establecer el tono y las directrices del modelo, con un ejemplo de system prompt explícitamente orientado a eliminar restricciones de seguridad.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte para system prompt personalizable que define el comportamiento y el tono.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), lo que permite entrada multimodal según los tags del modelo.
- Soporte de tool calling / function calling: el ejemplo de vLLM incluye `--tool-call-parser mistral` y `--enable-auto-tool-choice`, lo que indica compatibilidad con llamadas a herramientas en el servidor vLLM.
- Capacidad de razonamiento multi-paso y uso como agente, implícita en el soporte de tool calling y en la naturaleza instruct del modelo base.
- Multilingüismo: no confirmado explícitamente en la información disponible; el ejemplo de la model card incluye una consulta en francés, pero no se especifica la lista de idiomas soportados.
- Modo "uncensored": el modelo está diseñado para seguir instrucciones sin filtros de seguridad por defecto cuando se configura con el system prompt adecuado, según declara el autor.
- Compatibilidad con múltiples frameworks de despliegue: transformers, vLLM, SGLang, TGI, Ollama y LM Studio.

## Casos de uso

- **Atención al cliente automatizada con control total del tono**: el modelo permite definir mediante system prompt el estilo, las reglas y el comportamiento del asistente, lo que facilita adaptar las respuestas al branding y las políticas de una empresa sin depender de un proveedor externo que modifique el alineamiento.
- **Generación de código en pipelines de CI/CD**: gracias al soporte de tool calling en vLLM (`--tool-call-parser mistral`, `--enable-auto-tool-choice`), el modelo puede integrarse en flujos automatizados que invoquen herramientas externas, como linters, ejecutores de tests o APIs de repositorios.
- **Investigación sobre alineamiento y seguridad**: al ser un modelo deliberadamente "desalineado" y con licencia Apache 2.0, resulta útil para estudiar comportamientos del modelo sin filtros, evaluar riesgos de contenido sensible y comparar con versiones alineadas del mismo base.
- **Asistentes conversacionales autoalojados**: el modelo puede desplegarse en infraestructura propia (vLLM, TGI, SGLang) para aplicaciones que requieren que las consultas de los usuarios no salgan de la organización, algo que el autor destaca como ventaja frente a APIs comerciales.
- **Procesamiento de documentos con imágenes**: al soportar entrada image-text-to-text, puede emplearse para tareas que combinen texto e imágenes, como descripción de capturas, extracción de información de documentos escaneados o asistencia sobre contenido visual.
- **Prototipado rápido con Ollama o LM Studio**: la model card menciona estos frameworks, lo que permite a desarrolladores probar el modelo en local con cuantizaciones (aunque no se detallan los tipos disponibles) antes de desplegarlo en producción.
- **Generación creativa sin restricciones**: para aplicaciones de escritura creativa, guiones o contenido donde el usuario quiere controlar explícitamente las directrices sin filtros impuestos por el proveedor, el modelo ofrece un system prompt configurable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: la model card indica explícitamente que ejecutar el modelo en GPU requiere más de 60 GB de GPU RAM (comentario en el ejemplo de vLLM). Con 24 mil millones de parámetros en safetensors (48,1 GB de repositorio), la inferencia en precisión completa o semi-precisión requiere al menos esa cantidad; cuantizaciones a 8 bits o 4 bits reducirían el requisito, aunque no se detallan los tipos disponibles.
- **GPU recomendadas**: el entrenamiento se realizó en 8 GPU B200. Para inferencia, el ejemplo de vLLM usa `tensor_parallel_size=8`, lo que sugiere despliegue multi-GPU. GPU de 80 GB como A100 o H100 permitirían el modelo en una o pocas unidades según cuantización; no se dispone de datos concretos de rendimiento por GPU.
- **¿Cabe en consumer GPU?**: en precisión completa no cabe en GPU de consumo (24 GB o menos). Con cuantización agresiva (4 bits) podría aproximarse a los 12-15 GB, pero no se confirma en la información disponible.
- **Opciones de despliegue**: vLLM (recomendado por el autor, con ejemplo de comando), transformers, SGLang, TGI, Ollama y LM Studio.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Long-Live-Dolphin-24B-Venice-Edition | 24,0 B | No disponible | Apache 2.0 | Sí (image-text-to-text) | Fine-tune "uncensored" de Mistral-Small-24B |
| Mistral-Small-24B-Instruct-2501 | 24 B | No disponible en esta ficha | Apache 2.0 | No confirmado | Modelo base, alineado por Mistral AI |
| Dolphin Mistral 24B Venice Edition (dphn) | 24 B | No disponible | Apache 2.0 | No confirmado | Versión original de dphn.ai; el modelo de esta ficha es una variante publicada por otro usuario |
| Modelos de ~24B de propósito general (p. ej. Qwen, Gemma) | ~24 B | Variable | Variable | Variable | No se dispone de datos comparativos en la información proporcionada |

La comparativa se limita a los datos disponibles; no se han encontrado benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se documentan en la model card; al ser un modelo "uncensored", es probable que reproduzca sesgos presentes en los datos de entrenamiento sin filtros de mitigación, pero no se aportan datos concretos.
- **Riesgo de alucinación**: no se documenta una evaluación específica; como todo modelo generativo de 24B, puede generar información incorrecta con aparente confianza.
- **Limitaciones de contexto e idioma**: la longitud de contexto no se confirma en la información disponible; el ejemplo de vLLM usa 131072 tokens, pero no se aclara si es el máximo nativo. Los idiomas soportados no se detallan.
- **Restricciones de licencia**: la licencia es Apache 2.0, lo que permite uso comercial, modificación y redistribución con atribución; no obstante, el modelo se distribuye "tal cual", sin garantías.
- **Contenido sensible**: el modelo está diseñado explícitamente para seguir instrucciones "sin importar ética, legalidad, moralidad o preocupaciones de seguridad" cuando se configura con el system prompt sugerido. Esto implica un riesgo elevado de generar contenido dañino, ilegal o inexacto, y su uso en producción requiere filtros y moderación externos.
- **Trazabilidad y soporte**: el modelo lo publica un usuario individual (SkinwalkerTaxidermy), no la organización dphn; no hay garantías de mantenimiento, actualizaciones ni soporte. Las descargas y likes son 0 en el momento de la consulta.
- **Datos de entrenamiento opacos**: no se especifican datasets, número de tokens ni técnicas de alineamiento, lo que dificulta evaluar su comportamiento en dominios específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SkinwalkerTaxidermy/Long-Live-Dolphin-24B-Venice-Edition
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Web de Dolphin (dphn.ai): https://dphn.ai
- Twitter de Dolphin: https://x.com/dphnAI
- Web chat de Dolphin: https://chat.dphn.ai
- Bot de Telegram: https://t.me/DolphinAI_bot
- Venice.ai: https://venice.ai/
- Targon (proveedor de cómputo): https://targon.com/
- vLLM: https://github.com/vllm-project/vllm
