# mosahary/gemma-4-12b-it-qat-abliterated

## Resumen

El modelo `mosahary/gemma-4-12b-it-qat-abliterated` es un ajuste fino del modelo base `unsloth/gemma-4-12B-it-qat-q4_0-unquantized`, desarrollado por el usuario mosahary. Se trata de una variante "abliterada" de Gemma 4 12B, es decir, se ha eliminado el mecanismo de rechazo o negativa a responder que incorpora el modelo original, de modo que puede generar respuestas sin las restricciones de seguridad habituales. El entrenamiento se realizó con la librería Unsloth, que acelera el proceso aproximadamente el doble de rápido que un ajuste fino convencional.

El modelo pertenece a la familia Gemma 4, concretamente a la arquitectura Gemma4Unified (sin encoder), con un total de 11.959.730.176 parámetros (unos 12B). Según la información disponible, el pipeline declarado es `image-text-to-text`, lo que sugiere que podría procesar entradas multimodales, aunque no se especifican detalles adicionales. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas. El idioma soportado es exclusivamente inglés.

La relevancia de este modelo radica en su naturaleza "abliterada": está pensado para casos de uso donde se requiere una generación de texto sin censura ni filtros de seguridad, como la escritura creativa, el roleplay o la investigación sobre comportamientos de modelos. Al estar basado en Gemma 4 12B, hereda las capacidades de razonamiento y generación de texto de Google, aunque con la capa de rechazo eliminada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4Unified (sin encoder, transformer denso) |
| Parametros totales | 11.959.730.176 (aprox. 12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QAT q4_0 (entrenado para cuantizacion, pesos sin cuantizar en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma4Unified, que según la documentación de abliteración de TrevorS (GitHub) es una variante sin encoder de Gemma 4. En el caso de `gemma-4-12B-it`, la señal de rechazo se encuentra en las capas superiores (L15-L47), por lo que la abliteración se aplica únicamente al 70% superior de las capas. El proceso de abliteración consiste en modificar los pesos de esas capas para eliminar la dirección de activación asociada al rechazo, permitiendo que el modelo responda a cualquier petición sin negarse.

El entrenamiento se realizó como un ajuste fino (finetune) del modelo `unsloth/gemma-4-12B-it-qat-q4_0-unquantized`, que a su vez es una versión de Gemma 4 12B preparada con cuantización consciente del entrenamiento (QAT) para cuantización q4_0. El ajuste fino se llevó a cabo con la librería Unsloth, que optimiza el proceso de entrenamiento para ser aproximadamente el doble de rápido que los métodos convencionales. No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generacion de texto: el modelo es capaz de producir texto coherente y contextualizado en ingles, gracias a su base Gemma 4 12B.
- Conversacion multi-turno: al ser un modelo instructivo (sufijo `-it`), esta optimizado para mantener dialogos y seguir instrucciones.
- Razonamiento: hereda las capacidades de razonamiento de Gemma 4, aunque no se han publicado benchmarks especificos.
- Abliteracion: no presenta mecanismo de rechazo, por lo que puede responder a peticiones que otros modelos rechazarian (contenido explicito, opiniones controvertidas, etc.).
- Multimodalidad potencial: el pipeline declarado es `image-text-to-text`, lo que sugiere que podria procesar imagenes junto con texto, aunque no se confirma en la documentacion.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar ficcion, poesia o guiones que aborden temas tabu o explicitos sin negarse, gracias a la abliteracion. Es adecuado para autores que necesitan explorar contenido maduro.
- Roleplay y juegos de texto: en entornos de rol conversacional, el modelo puede interpretar personajes sin limitaciones de contenido, lo que resulta util para comunidades de roleplay por texto.
- Investigacion sobre seguridad y alineacion: los investigadores pueden estudiar el comportamiento de un modelo sin capa de rechazo para analizar sesgos, riesgos de generacion de contenido danino o la efectividad de las tecnicas de abliteracion.
- Asistentes conversacionales personalizados: al tener licencia Apache 2.0, se puede integrar en productos comerciales donde se requiera un asistente que no imponga censura, como chatbots para adultos o aplicaciones de compania.
- Generacion de contenido para entretenimiento: el modelo puede producir dialogos, historias o descripciones para videojuegos, novelas visuales o contenido audiovisual sin restricciones tematicas.
- Despliegue en entornos con recursos limitados: al ser un modelo de 12B con soporte para cuantizacion q4_0, puede ejecutarse en GPUs de consumo medio (16 GB de VRAM) con herramientas como llama.cpp o Ollama, lo que facilita su uso en proyectos personales o pequenos equipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo concreto. Al ser un ajuste fino de Gemma 4 12B, su rendimiento deberia ser similar al del modelo base, pero no se puede confirmar sin mediciones propias.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo contiene pesos safetensors de 24 GB, lo que sugiere una precision de 16 bits (fp16). Para cargar el modelo completo en fp16 se necesitarian al menos 24 GB de VRAM. Con cuantizacion q4_0 (para la que fue entrenado), el modelo podria ocupar aproximadamente 6-8 GB, permitiendo su ejecucion en GPUs de 8-12 GB.
- GPU recomendadas: para fp16, una NVIDIA A100, RTX 4090 o similar con 24 GB o mas. Para cuantizacion q4_0, una RTX 3060 (12 GB), RTX 4070 (12 GB) o superior seria suficiente.
- Compatibilidad con GPU de consumo: si, con cuantizacion q4_0 cabe en GPUs de 12 GB como la RTX 3060 o RTX 4070. En fp16 requiere una GPU de 24 GB (RTX 3090, RTX 4090).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Text Generation Inference (TGI) y transformers con carga en 8 bits o 4 bits.
- Latencia y throughput: no disponible. Dependera del hardware y la cuantizacion utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Abliterado | Disponibilidad |
|---|---|---|---|---|---|
| mosahary/gemma-4-12b-it-qat-abliterated | 12B | no disponible | Apache 2.0 | Si | Hugging Face |
| huihui-ai/Huihui-gemma-4-12B-it-abliterated | 12B | no disponible | no disponible | Si | Hugging Face |
| OBLITERATUS/Gemma-4-12B-OBLITERATED | 12B | no disponible | no disponible | Si | Hugging Face |

Los tres modelos son variantes abliteradas de Gemma 4 12B, pero no se dispone de especificaciones detalladas de los otros dos. La principal diferencia de este modelo es que parte de una version QAT (entrenada para cuantizacion), lo que podria ofrecer mejor rendimiento en cuantizacion q4_0. No se puede establecer una comparativa de rendimiento sin datos de benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo abliterado, no se han documentado sesgos especificos, pero hereda los sesgos del modelo base Gemma 4, que pueden incluir estereotipos de genero, raza o cultura.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en temas especializados. No se ha evaluado su tasa de alucinacion.
- Contenido inapropiado: al eliminar la capa de rechazo, el modelo puede generar contenido explicito, violento, ofensivo o ilegal. No debe utilizarse en aplicaciones donde se requiera moderacion de contenido.
- Limitaciones de idioma: solo soporta ingles. No se recomienda su uso en otros idiomas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero no incluye garantias de seguridad ni responsabilidad por el contenido generado.
- Caveat de produccion: antes de desplegarlo en un entorno de produccion, es imprescindible implementar filtros de contenido adicionales y realizar pruebas de robustez, ya que la abliteracion puede producir respuestas impredecibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mosahary/gemma-4-12b-it-qat-abliterated
- Modelo base: https://huggingface.co/unsloth/gemma-4-12B-it-qat-q4_0-unquantized
- Repositorio de abliteracion de Gemma 4: https://github.com/TrevorS/gemma-4-abliteration
- Modelo similar de huihui-ai: https://huggingface.co/huihui-ai/Huihui-gemma-4-12B-it-abliterated
- Modelo similar de OBLITERATUS: https://huggingface.co/OBLITERATUS/Gemma-4-12B-OBLITERATED
- Articulo sobre Gemma 4 (arquitectura y variantes): https://www.qubrid.com/blog/google-gemma-4-technical-deep-dive-architecture-moe-benchmarks-production-guide
