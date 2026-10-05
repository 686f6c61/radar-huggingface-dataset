# sharoonsharif1/greyfield-base

## Resumen

greyfield-base es un repositorio publicado por el usuario sharoonsharif1 (Sharoon Sharif) que contiene pesos derivados de google/gemma-4-31B-it-qat-q4_0-unquantized, el checkpoint de la familia Gemma 4 con entrenamiento consciente de cuantizacion (QAT). El repositorio declara 32.682.375.020 parametros en formato safetensors, un tamano de 23,3 GB y la etiqueta de pipeline image-text-to-text, por lo que hereda la arquitectura multimodal texto-imagen de la variante densa de 31B de Google DeepMind.

A pesar del nombre "base", el modelo de partida es un checkpoint ya ajustado por instrucciones (sufijo -it), no un modelo preentrenado puro. La model card publicada es esencialmente una copia de la tarjeta oficial de la familia Gemma 4 y no documenta ningun proceso de ajuste propio: no se indican datasets, metodo de entrenamiento, hiperparametros ni objetivos de la supuesta especializacion. El repositorio acumula 0 descargas y 0 likes desde su creacion el 4 de octubre de 2026, y su licencia declarada es apache-2.0.

Su relevancia es limitada y de tipo experimental: sirve como ejemplo de redistribucion de un checkpoint QAT de Gemma 4 y como punto de partida potencial para compilacion o investigacion sobre pesos de baja precision, pero no aporta mejoras verificables ni evaluaciones publicadas frente al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atencion hibrida (sliding window local + atencion global), heredada de Gemma 4 31B Dense; el modelo base declara 60 capas y atencion proporcional p-RoPE con claves y valores unificados en las capas globales |
| Parametros totales | 32.682.375.020 (32,68B) segun safetensors; la tarjeta de la familia Gemma 4 cifra el 31B Dense en 30,7B, por lo que existe una discrepancia no explicada |
| Parametros activos | no aplica (variante densa, no MoE) |
| Longitud de contexto | 256K tokens segun las especificaciones de Gemma 4 para los modelos medianos; no confirmado de forma independiente para este repositorio |
| Tipos de cuantizacion | El repositorio incluye la etiqueta compressed-tensors y pesos safetensors de 23,3 GB (aproximadamente 0,71 bytes por parametro, por debajo de bf16); la tarjeta no especifica el esquema exacto aplicado. La familia QAT de Gemma 4 ofrece Q4_0 sin cuantizar, GGUF Q4_0, movil wNa8o8 y compressed-tensors w4a16 |
| Idiomas soportados | no disponible (la etiqueta de idiomas del repositorio esta vacia); la familia Gemma 4 declara soporte para mas de 140 idiomas |
| Licencia | apache-2.0 declarada en el repositorio, con enlace a https://ai.google.dev/gemma/docs/gemma_4_license |
| Formato de pesos | safetensors, libreria transformers, compatible con endpoints |

## Arquitectura y entrenamiento

La arquitectura heredada es la de Gemma 4 31B Dense: un transformer multimodal de 60 capas con ventana de atencion local deslizante de 1024 tokens, atencion global intercalada que garantiza que la ultima capa sea siempre global, vocabulario de 262.000 tokens y un codificador de vision de aproximadamente 550 millones de parametros. La atencion hibrida busca mantener el coste de memoria bajo en contextos largos combinando capas locales baratas con capas globales que aplican p-RoPE y unifican claves y valores. La variante 31B no incorpora codificador de audio (a diferencia de E2B, E4B y 12B).

El checkpoint de partida es la version "unquantized" del pipeline QAT (Q4_0), descrita por Google como pesos de media precision extraidos tras el entrenamiento consciente de cuantizacion, pensados para compilacion personalizada e investigacion. No hay informacion sobre que modificacion adicional, si alguna, ha aplicado el autor del repositorio: no se documentan tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni ninguna innovacion tecnica propia. Tampoco se explica el nombre "greyfield" ni la justificacion del sufijo "base" sobre un modelo ajustado por instrucciones.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento configurables, heredados de la familia Gemma 4.
- Entrada multimodal de texto e imagen con soporte de relacion de aspecto y resolucion variables; sin soporte de audio en la variante 31B.
- Generacion de codigo y soporte declarado de function calling nativo por parte de la familia base, orientado a flujos agenticos.
- Soporte de conversation multi-turno y del rol system nativo en el prompt.
- Capacidades multilingues declaradas por la familia (mas de 140 idiomas); no verificadas en este repositorio.
- Capacidad de procesar contextos de hasta 256K tokens segun las especificaciones del modelo base.
- No se documenta ninguna capacidad adicional especifica de greyfield-base (no hay vision especializada, audio, ni ajuste de dominio descrito).

## Casos de uso

- Investigacion sobre cuantizacion: analizar como se comportan los pesos QAT redistribuidos frente al checkpoint original de Google, midiendo perplejidad y calidad en tareas controladas antes de considerarlo para produccion.
- Prototipado de asistentes multimodales: usar el modelo como backend de un chat que reciba capturas de pantalla o fotografias y genere descripciones o respuestas textuales, aprovechando la entrada image-text-to-text.
- Extraccion de informacion de documentos escaneados: dado que acepta imagen directamente, puede transcribir y estructurar contenido de facturas o formularios sin un pipeline OCR separado, aunque requeriria validacion exhaustiva por tratarse de un checkpoint sin evaluaciones publicadas.
- Analisis de codigo asistido: integracion en un IDE o pipeline de revision para generar parches y explicar fragmentos, apoyandose en el soporte de function calling declarado por la familia.
- Flujos agenticos experimentales: encadenamiento multi-paso con llamadas a herramientas sobre contextos largos, usando la ventana extendida para mantener el historial de acciones y observaciones.
- Base para ajuste fino posterior: al estar distribuido con licencia permisiva declarada y en safetensors, puede servir como punto de partida para LoRA o ajuste completo en dominios verticales, siempre que se resuelvan las dudas de licencia indicadas mas abajo.
- Despliegue en laboratorio con vLLM: validar el rendimiento del formato compressed-tensors en inferencia de alta concurrencia antes de decidir si sustituye al checkpoint oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K ni equivalentes) y tampoco reproduce las cifras oficiales de la familia Gemma 4. El extracto disponible de la tarjeta de Gemma 4 se limita a describir las variantes y sus especificaciones estructurales, sin datos numericos de rendimiento.

## Requisitos de hardware

- Los pesos del repositorio ocupan 23,3 GB, lo que corresponde a una precision efectiva de aproximadamente 0,71 bytes por parametro, muy por debajo de los ~65 GB que requeriria el mismo modelo en bf16.
- Tarjeta de gama alta para consumidores: cabe en una RTX 4090 de 24 GB, pero con un margen muy estrecho que obliga a limitar la longitud de contexto y el tamano de lote; tambien en RTX 3090/4080 de 24 GB con las mismas restricciones.
- GPU profesionales recomendadas: A100 40 GB, L40S 48 GB, RTX A6000 48 GB o H100 80 GB, con holgura suficiente para contextos largos y mayor concurrencia.
- Despliegue multi-GPU: para explotar la ventana de 256K tokens con lotes grandes es previsible necesitar varias GPU o tensor parallelism, ya que la cache KV a esa longitud es el factor limitante; no se dispone de cifras concretas de memoria de cache KV.
- Opciones de despliegue: transformers de forma nativa; vLLM para el formato compressed-tensors (soporte declarado para los checkpoints QAT w4a16 de Gemma 4); TGI como alternativa de servidor. llama.cpp u Ollama solo serian viables si se generan pesos GGUF, que este repositorio no incluye.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia |
|---|---|---|---|---|
| greyfield-base | 32,68B (safetensors) | 256K (heredado, no confirmado) | texto + imagen | apache-2.0 declarada |
| Gemma 4 31B Dense (checkpoint oficial QAT) | 30,7B | 256K | texto + imagen | licencia Gemma 4 |
| Gemma 4 12B Unified | 11,95B | 256K | texto + imagen + audio | licencia Gemma 4 |
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | 128K | texto + imagen + audio | licencia Gemma 4 |

La comparacion con alternativas de otros fabricantes (Qwen, Llama, Mistral) no esta disponible porque no se han proporcionado datos de esos modelos ni resultados de evaluacion de greyfield-base que permitan establecer una comparacion fundamentada.

## Limitaciones y advertencias

- Ausencia total de documentacion del ajuste: no se indica que se ha entrenado, con que datos ni con que objetivo, por lo que se desconoce si el modelo conserva las capacidades del checkpoint original o las ha degradado.
- Discrepancia de parametros: los 32,68B declarados por safetensors no coinciden con los 30,7B de la especificacion oficial de Gemma 4 31B Dense; no hay explicacion publicada.
- Riesgo de alucinacion: inherente a los modelos generativos y no mitigado ni medido en este repositorio, que carece de evaluaciones.
- Nomenclatura enganosa: el sufijo "base" sugiere un modelo preentrenado, pero el checkpoint de origen es instruction-tuned (-it).
- Licencia a verificar: la tarjeta declara apache-2.0, pero enlaza a la pagina de licencia de Gemma 4 de Google. La familia Gemma ha estado historicamente sujeta a sus propios terminos de uso, no a Apache 2.0, por lo que conviene confirmar las condiciones reales antes de cualquier uso comercial o redistribucion.
- Idiomas no declarados: la etiqueta de idiomas del repositorio esta vacia, de modo que el soporte multilingue de 140 idiomas es una afirmacion de la familia y no una caracteristica verificada en este artefacto.
- Trazabilidad nula: 0 descargas y 0 likes, autor individual sin documentacion tecnica publicada sobre este modelo, y model card copiada de la tarjeta oficial, lo que dificulta auditar el origen y la integridad de los pesos.
- Coste de contexto largo: aunque la ventana nominal sea de 256K tokens, sostenerla en inferencia exige memoria considerable y no se han publicado mediciones de degradacion en contextos extremos.
- Sin pesos GGUF ni variantes moviles en este repositorio, lo que limita el despliegue en entornos de bajos recursos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sharoonsharif1/greyfield-base
- Modelo base: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Perfil del autor en HuggingFace: https://huggingface.co/sharoonsharif1
- Perfil del autor en GitHub: https://github.com/SharoonSharif
- Licencia enlazada en la model card: https://ai.google.dev/gemma/docs/gemma_4_license
- Coleccion Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Repositorio GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento citado: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Pagina de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
