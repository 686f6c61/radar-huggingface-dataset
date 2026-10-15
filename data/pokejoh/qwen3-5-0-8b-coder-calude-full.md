# pokejoh/Qwen3.5-0.8B-Coder-Calude-Full

## Resumen

Qwen3.5-0.8B-Coder-Calude-Full es un ajuste fino comunitario publicado por el usuario pokejoh sobre el modelo base Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 873 millones de parametros (873.438.784 segun los pesos en safetensors). El modelo se distribuye bajo licencia Apache 2.0 y esta orientado a generacion de codigo y conversacion, segun se deduce de su nombre y de los ejemplos incluidos en su model card. El repositorio ocupa 2,3 GB e incluye pesos en safetensors y GGUF, lo que permite tanto inferencia con la libreria transformers como despliegue cuantizado en llama.cpp u Ollama.

El interes principal de esta ficha es acotado: se trata de un fine-tune de muy bajo numero de descargas (0) y likes (0), sin documentacion tecnica de entrenamiento, sin resultados de benchmarks y con una model card incompleta y con errores. El propio autor no detalla el dataset, el numero de tokens de entrenamiento ni la metodologia de alineacion (RLHF/DPO). El pipeline declarado en HuggingFace es image-text-to-text, aunque no hay evidencia en la informacion disponible de que el modelo procese imagenes de forma nativa; probablemente se trate de un valor heredado de la configuracion del repositorio.

La relevancia practica es limitada y debe evaluarse con cautela: puede servir como experimento de fine-tuning de bajo coste sobre un modelo pequeno, para tareas de generacion de codigo simple en ingles y para ejecucion local en hardware muy modesto, pero no esta validado para produccion ni para uso comercial critico sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles concretos no disponibles) |
| Parametros totales | 873.438.784 (dato real de safetensors) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio incluye pesos en safetensors y GGUF; no se especifican los niveles concretos) |
| Idiomas soportados | en (ingles), segun los metadatos del repositorio |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |

Otros datos del repositorio: tamano del repo 2,3 GB; libreria transformers; tags adicionales qwen3_5, unsloth, text-generation-inference, conversational, endpoints_compatible, region:us; modelo base Qwen/Qwen3.5-0.8B (tambien etiquetado como base_model:quantized).

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura interna mas alla de que el modelo base pertenece a la familia Qwen3.5 y de que el ajuste se ha realizado con Unsloth y la libreria TRL de HuggingFace, segun indica la propia model card. Unsloth es una libreria de fine-tuning eficiente en memoria que suele emplearse con LoRA/QLoRA, pero la model card no especifica si el resultado publicado es un adaptador fusionado, que rango de LoRA se uso ni cuantos pasos de entrenamiento se ejecutaron.

Tampoco se documentan los datos de entrenamiento: no hay numero de tokens, composicion del dataset, ni mencion a fases de RLHF, DPO o cualquier otra forma de alineacion. El nombre del modelo ("Coder-Calude", con una errata evidente en "Calude" por "Claude") sugiere que el ajuste se hizo sobre un dataset de conversaciones de codigo con un estilo de respuesta imitando a los asistentes tipo Claude, pero esto es una inferencia a partir del nombre y no un dato confirmado por el autor. No consta ninguna innovacion tecnica destacable (decodificacion especulativa, atencion lineal, arquitectura hibrida, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, en formato de chat multi-turno (roles user/assistant).
- Generacion de codigo Python en ejemplos sencillos; la model card incluye una muestra de generacion de una red neuronal en PyTorch (aunque el codigo de salida contiene errores logicos, ver la seccion de limitaciones).
- El pipeline declarado en HuggingFace es image-text-to-text y el ejemplo oficial usa una entrada de imagen con una URL; no hay confirmacion independiente de capacidades de vision reales en el modelo ajustado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: la metadato de idioma declara unicamente ingles; no se documenta soporte de otros idiomas en el ajuste.
- Modo de razonamiento explicito (thinking mode), audio o cualquier otra capacidad especial: no disponible.

## Casos de uso

- Prototipado rapido de generacion de codigo en local: al tener 873 millones de parametros, el modelo puede ejecutarse en un portatil con GPU de gama media o incluso en CPU con cuantizacion GGUF, lo que lo hace util para probar flujos de asistencia de codigo sin coste de API.
- Asistente de chat de proposito general en ingles para entornos de desarrollo: se puede integrar como chatbot interno para resolver dudas sencillas de programacion, siempre que se valide su calidad con un conjunto de pruebas propio antes de exponerlo a usuarios.
- Generacion de fragmentos de codigo boilerplate: dada la muestra incluida en la model card (definicion de una red neuronal en PyTorch), es razonable usarlo para generar esqueletos de clases, funciones y scripts, revisando siempre el resultado por los errores observados en sus propias salidas.
- Educacion y aprendizaje: puede emplearse como ejemplo didactico de como se hace un fine-tune con Unsloth sobre un modelo de menos de 1B de parametros, comparando su comportamiento con el modelo base Qwen3.5-0.8B.
- Experimentacion en investigacion sobre alineacion de modelos pequenos: sirve como punto de partida para estudiar como se degrada o mejora un modelo de 0,8B tras un ajuste de estilo conversacional, ya que su licencia Apache 2.0 permite modificarlo y redistribuirlo.
- Despliegue en edge o entornos con recursos muy limitados: con cuantizacion de 4 bits el modelo ocupa del orden de 0,5 GB en memoria, por lo que es viable en dispositivos con poca VRAM o incluso en telefonos y SBC de gama alta mediante llama.cpp.
- Servicio de autocompletado de codigo en un IDE interno: tecnicamente es integrable mediante transformers o TGI, aunque sus prestaciones en tareas de codigo realistas no estan validadas por ningun benchmark publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ningun otro conjunto de evaluacion, y la busqueda web realizada no devolvio resultados relevantes sobre este modelo (los unicos resultados obtenidos correspondian a contenidos sin relacion, en concreto paginas sobre un club de futbol).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en FP16/BF16, en torno a 0,9 GB en cuantizacion de 8 bits y alrededor de 0,5 GB en cuantizacion de 4 bits (estimaciones calculadas a partir de los 873 millones de parametros; el fabricante no publica cifras oficiales).
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, por ejemplo RTX 3060, RTX 4060, RTX 4090, A100 o H100. En el caso de A100/H100 el modelo esta enormemente infrautilizado y no tiene sentido economicamente salvo por agregacion de muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, con holgura. Practicamente cualquier GPU de consumo de los ultimos anos (GTX 1650 4 GB en adelante) puede ejecutarlo, incluso en CPU con cuantizacion GGUF.
- Opciones de despliegue: transformers (libreria principal declarada), text-generation-inference (TGI, aparece en los tags), llama.cpp y, presumiblemente, Ollama o LM Studio a partir de los ficheros GGUF incluidos. vLLM no esta confirmado en los metadatos.
- Latencia y throughput estimados: no disponibles. No hay datos publicados de tokens por segundo ni de latencia en ningun hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Coder-Calude-Full | 873.438.784 | no disponible | Apache 2.0 | safetensors, GGUF | no disponible |
| Qwen2.5-Coder-1.5B-Instruct | 1.540 millones | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | benchmarks publicados por Qwen |
| Llama-3.2-1B-Instruct | 1.240 millones | 128.000 tokens (segun documentacion publica de Meta) | Licencia comunitaria Llama 3.2 | safetensors, GGUF | benchmarks publicados por Meta |
| SmolLM2-1.7B-Instruct | 1.710 millones | 8.192 tokens (segun documentacion publica de HuggingFace) | Apache 2.0 | safetensors, GGUF | benchmarks publicados por HuggingFace |

Nota: los datos de los modelos comparativos provienen de su documentacion publica y se incluyen como referencia; los de este modelo ajustado son mayoritariamente "no disponible" porque la model card no los documenta. No se dispone de una comparacion directa de rendimiento entre ellos.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni conjunto de validacion publicado. No se puede afirmar que el modelo sea mejor o peor que su base sin medirlo.
- Model card incompleta y con inconsistencias: el identificador del repositorio corresponde al usuario pokejoh, pero la model card atribuye el desarrollo a "rahul7star" y los ejemplos de uso apuntan al repositorio rahul7star/Qwen3.5-0.8B-Coder-Calude-Full. Esta discrepancia sugiere republicacion o copia de material ajeno, lo que dificulta conocer la procedencia real del ajuste.
- Errata en el nombre del modelo ("Calude" en lugar de "Claude"), indicio de falta de revision del repositorio.
- Calidad del codigo generado cuestionable: en el propio ejemplo de la model card, el codigo PyTorch generado contiene errores (bucle `for i in range(1, hidden_sizes)` que sobrescribe la misma capa `self.hidden_layer_i`, uso de `len(self.hidden_layer)` sobre un atributo inexistente y carga inconsistente del estado). Esto es evidencia directa de que la salida puede ser sintacticamente plausible pero incorrecta.
- Tamano muy reducido: 873 millones de parametros limitan la capacidad de razonamiento complejo, matematicas y tareas de codigo de varios pasos.
- Idiomas: los metadatos declaran unicamente ingles. No hay garantia de un comportamiento correcto en castellano, aunque el modelo base Qwen suele ser multilingue.
- Riesgo de alucinacion alto, inherente a los modelos de esta escala, agravado por la falta de alineacion documentada.
- Capacidades de vision no verificadas: el pipeline declarado es image-text-to-text y el ejemplo usa imagenes, pero no hay confirmacion de que el ajuste conserve procesamiento visual.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el usuario es responsable de verificar que el modelo base Qwen3.5-0.8B no imponga condiciones adicionales y de cumplir cualquier obligacion de atribucion.
- Sin mantenimiento ni comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha, lo que implica ausencia de retroalimentacion, issues resueltos o mejoras posteriores.
- No apto para produccion sin una evaluacion propia previa con datos del dominio objetivo.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/pokejoh/Qwen3.5-0.8B-Coder-Calude-Full
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Demo citada en la model card: https://huggingface.co/spaces/rahul7star/claude-Qwen
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo; las busquedas devolvieron unicamente contenidos sin relacion (paginas sobre un club de futbol), por lo que no se incluyen.
