# INCModel2/GLM-5.2-MXFP4-Mixed-CT-AutoRound

## Resumen

INCModel2/GLM-5.2-MXFP4-Mixed-CT-AutoRound es una cuantizacion mixta del modelo base zai-org/GLM-5.2, publicada por el usuario de HuggingFace INCModel2. Fue generada mediante Intel AutoRound con modo RTN (round-to-nearest) y se distribuye en formato Compressed Tensor (CT), lo que la hace directamente compatible con vLLM. El objetivo principal es reducir la huella de memoria del modelo original manteniendo una calidad cercana a la del modelo sin cuantizar.

Se trata de un modelo de gran escala en parametros totales: 753.329.940.480, distribuidos en una arquitectura de mezcla de expertos (MoE). La etiqueta tecnica del repositorio indica `glm_moe_dsa`, lo que apunta a un transformer con MoE y posiblemente atencion de tipo DSA, aunque el significado exacto no se detalla en la informacion disponible. El peso del repositorio es de 412.8 GB, lo que confirma su caracter masivo.

La relevancia de este modelo es doble: por un lado, proporciona una alternativa menor en memoria para investigar y desplegar la familia GLM-5.2; por otro, sirve como ejemplo practico del uso de AutoRound con esquemas mixtos MXFP4/MXFP8. No obstante, la informacion disponible es limitada. No se han publicado resultados de benchmarks validos, ni se detalla la longitud de contexto, los idiomas soportados o los parametros activos del MoE. Estamos ante una publicacion reciente con cero descargas y cero likes, por lo que se recomienda una validacion exhaustiva antes de su uso en produccion.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), tipo GLM (version 5.2). Etiqueta: `glm_moe_dsa` |
| Parametros totales | 753.329.940.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixto MXFP4/MXFP8 generado con RTN mediante AutoRound. Los expertos (`mlp.experts`) quedan en MXFP4, el resto de capas en MXFP8. Los tags incluyen `8-bit` y `compressed-tensors` |
| Idiomas soportados | no disponible |
| Licencia | Ambivalente: la model card declara `other` con nombre `mit`, mientras que el metadata de HuggingFace indica MIT. Verificar antes de uso comercial |
| Formato de pesos | safetensors (segun los tags) y Compressed Tensor (CT) compatible con vLLM |
| Modelo base | zai-org/GLM-5.2 |
| Tamano del repositorio | 412.8 GB |

## Arquitectura y entrenamiento

Este modelo no ha sido entrenado desde cero; es una cuantizacion derivada de zai-org/GLM-5.2. La etiqueta `glm_moe_dsa` indica que la arquitectura original es un transformer con mezcla de expertos, pero no se aportan especificaciones sobre el numero de expertos, la dimension oculta, el numero de capas o los parametros activos. Toda esa informacion pertenece al modelo base y no esta disponible en la documentacion publicada.

El proceso de cuantizacion se ha realizado con Intel AutoRound, un metodo que optimiza el redondeo de pesos mediante descenso de gradiente, como se describe en el paper `Optimize weight rounding via signed gradient descent for the quantization of LLMs` (arXiv:2309.05516). El comando de generacion mostrado en la model card emplea el modo `--model_free`, un esquema base `--scheme MXFP8` y una configuracion por capas `--layer_config "{mlp.experts:{scheme:MXFP4}}"`, lo que deja los pesos de los expertos en MXFP4 y el resto del modelo en MXFP8. Ademas, se ignoran explicitamente las capas `layers.0`, `layers.1`, `layers.2`, `indexer.weights_proj` e `indexer.wk`, preservando su precision original.

La cuantizacion no incluye datos sobre el dataset de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO; esos datos corresponden al entrenamiento del modelo base, que no estan documentados en esta publicacion. La innovacion tecnica destacable es el uso de una cuantizacion mixta por secciones dentro de un modelo MoE, con un formato de pesos comprimido (CT) que vLLM puede cargar directamente.

## Capacidades

La informacion disponible no incluye una lista exhaustiva de capacidades del modelo. A partir de la model card, los tags y el ejemplo de despliegue con vLLM, se pueden inferir las siguientes:

- Generacion de texto y dialogo conversacional: el pipeline principal es `text-generation` y el modelo esta etiquetado como `conversational`.
- Soporte de tool calling: el comando de ejemplo de vLLM incluye `--tool-call-parser glm47` y `--enable-auto-tool-choice`, lo que indica compatibilidad con llamadas a herramientas.
- Soporte de razonamiento: se usa `--reasoning-parser glm45`, lo que sugiere que el modelo puede producir salidas de razonamiento estructurado.
- Generacion de codigo: el ejemplo de peticion HTTP solicita explicitamente "Write code to fine-tune an LLM", lo que apunta a una capacidad de generacion de codigo.
- Capacidades multilingues: no especificadas en la informacion proporcionada.
- Capacidades de vision, audio o tipo "thinking mode" adicionales: no disponibles.

## Casos de uso

- Despliegue de asistentes conversacionales a gran escala: el modelo puede servirse con vLLM en un clúster de GPUs, atendiendo peticiones con interfaz OpenAI-compatible. El formato Compressed Tensor y la cuantizacion reducen la memoria necesaria, lo que permite ejecutar multiples replicas del asistente en infraestructura compartida.

- Automatizacion de agentes con tool calling: gracias al soporte de `--tool-call-parser glm47` y `--enable-auto-tool-choice` en vLLM, el modelo puede integrarse en pipelines que requieren llamar a funciones externas. La cuantizacion mixta reduce la VRAM por instancia, facilitando el escalado horizontal en entornos de agente.

- Generacion de codigo en entornos de desarrollo: la capacidad de producir respuestas de codigo, como se muestra en el ejemplo de curl, permite usarlo en asistentes de programacion, revision de codigo o generacion automatica de scripts. Su gran numero de parametros sugiere un rendimiento elevado en tareas de programacion, aunque no hay benchmarks publicos que lo confirmen.

- Investigacion de cuantizacion y compresion de LLMs: al ser un caso real de cuantizacion mixta MXFP4/MXFP8 generado con AutoRound, sirve como referencia para estudiar el impacto de estos esquemas en la calidad de salida y en el uso de memoria. Los investigadores pueden compararlo con la version sin cuantizar del mismo modelo base.

- Inferencia distribuida con tensor parallelism: el comando oficial usa `--tensor-parallel-size 4`, lo que lo convierte en un candidato para clústeres con multiples GPUs. Dado el tamano de 412.8 GB, esta es la unica via practica de despliegue.

- Evaluacion de modelos de gran escala con fines academicos: para estudios que necesitan ejecutar un LLM de 753B de parametros en un entorno controlado, esta version cuantizada ofrece una alternativa mas ligera que el modelo original. El proceso de cuantizacion esta documentado y es reproducible.

- Pruebas de compatibilidad con vLLM y formatos CT: el modelo esta optimizado para vLLM y sirve para validar el despliegue de modelos MoE de gran tamano con tool calling y reasoning parser en un servidor de inferencia real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El bloque de resultados que aparece en el README esta marcado como `<!-- Not real data -->` y no debe considerarse valido. Por tanto, no se pueden aportar mediciones de MMLU, HumanEval, GSM8K ni de otras evaluaciones para este modelo, ni comparaciones numericas con modelos equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. El tamano del repositorio es de 412.8 GB, por lo que la carga de pesos requiere al menos esa cantidad de memoria, mas el espacio para la cache de claves y valores (KV cache) y las activaciones. La cuantizacion mixta MXFP4/MXFP8 puede reducir parcialmente el total, pero no se aportan cifras oficiales.

- GPU recomendadas: el ejemplo oficial de despliegue utiliza `--tensor-parallel-size 4`, lo que implica un minimo de 4 GPUs. Dado el tamano del modelo, se recomienda usar aceleradores de clase A100, H100 o H200 con 80 GB o mas de VRAM por dispositivo. No se especifica el modelo exacto de GPU en la documentacion.

- Compatibilidad con GPU de consumo: no. Un modelo de 753B de parametros, incluso cuantizado, no cabe en ninguna GPU domestica disponible actualmente.

- Opciones de despliegue: vLLM es la opcion principal y la mas compatible, ya que el modelo se publica en formato Compressed Tensor (CT). No hay evidencias de soporte oficial para llama.cpp, Ollama ni TGI en esta publicacion.

- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Cuantizacion | Compatibilidad vLLM | Licencia |
|---|---|---|---|---|
| zai-org/GLM-5.2 | 753.329.940.480 | Original sin cuantizar? (no disponible) | no disponible | other |
| INCModel2/GLM-5.2-MXFP4-Mixed-CT-AutoRound | 753.329.940.480 | MXFP4/MXFP8 mixto con AutoRound | Si, formato CT | other / MIT en metadata |
| INCModel2/GLM-5.2-MXFP4-Mixed-LLMC | 753.329.940.480 (presumiblemente) | MXFP4/MXFP8 mixto con LLMC? | no disponible | other |

La comparativa es limitada porque no se dispone de datos publicos sobre rendimiento, contexto o composicion exacta de la cuantizacion en las versiones alternativas. Ambos modelos hermanos probablemente parten del mismo modelo base y se diferencian en la herramienta de cuantizacion utilizada (AutoRound frente a LLMC). No existen datos de benchmarks que permitan establecer una comparacion de calidad.

## Limitaciones y advertencias

- La model card advierte explicitamente de que el modelo puede producir salidas factualmente incorrectas y no debe utilizarse como fuente de informacion fiable. Tambien menciona que puede generar contenido lewd, sesgado u ofensivo debido a las limitaciones del modelo base y de los datasets de ajuste.

- La cuantizacion mixta puede degradar la calidad respecto al modelo original. No se han publicado resultados de evaluacion que cuantifiquen esa perdida, por lo que es necesario realizar pruebas propias antes de desplegar el modelo en produccion.

- La licencia presenta ambiguedad. La model card declara `license: other` con nombre `mit`, mientras que el metadata de HuggingFace indica MIT. El aviso legal del README subraya que la licencia no constituye asesoramiento legal y que se debe consultar a un abogado antes de un uso comercial. Por tanto, se recomienda no asumir que es MIT sin confirmacion explicita del autor.

- No se dispone de datos sobre la longitud de contexto, los idiomas soportados ni los parametros activos. Esto impide dimensionar correctamente su uso en tareas que requieren ventanas largas o soporte multilingue especifico.

- El modelo es de gran escala (753B parametros, 412.8 GB) y requiere infraestructura de multiples GPUs. No es viable para un desarrollo local en equipos de consumo.

- El repositorio no tiene descargas ni likes (0 en ambos), lo que indica una publicacion reciente y sin validacion comunitaria. Se debe extremar la precaucion antes de confiar en el.

- El comando de despliegue proporcionado en la model card incluye un nombre de modelo diferente (`INCModel2/GLM-5.2-MXFP4-Mixed-LLMC`) en lugar del nombre real del repositorio (`INCModel2/GLM-5.2-MXFP4-Mixed-CT-AutoRound`). Ese error puede causar fallos de codificacion si se copia directamente.

- El formato Compressed Tensor (CT) es compatible con vLLM, pero su compatibilidad con otros motores de inferencia como llama.cpp u Ollama no esta documentada. Un despliegue fuera de vLLM puede requerir conversion previa.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/INCModel2/GLM-5.2-MXFP4-Mixed-CT-AutoRound
- Modelo base: https://huggingface.co/zai-org/GLM-5.2
- Repositorio de Intel AutoRound: https://github.com/intel/auto-round
- Paper de AutoRound: https://arxiv.org/abs/2309.05516
- Variante con LLMC (mencionada en la documentacion): https://huggingface.co/INCModel2/GLM-5.2-MXFP4-Mixed-LLMC
