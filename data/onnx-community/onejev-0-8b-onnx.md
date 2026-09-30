# onnx-community/OneJev-0.8B-ONNX

## Resumen

OneJev-0.8B-ONNX es la conversion a formato ONNX del modelo OmniJev/OneJev-0.8B, un modelo de decision multimodal de tipo System One. En lugar de generar texto libre, el modelo recibe un estado (texto, una captura de pantalla o una foto) y una pregunta tipada (`choice`, `score`, `noul`) y devuelve una probabilidad para cada una de las opciones planteadas. La respuesta final es el softmax sobre las letras de las opciones en la ultima posicion de un turno de chat.

El modelo original es un fine-tune completo de Qwen3.5-0.8B con la torre de vision congelada, por lo que conserva la misma arquitectura y formas que la base. Esta version ONNX reutiliza los grafos de onnx-community/Qwen3.5-0.8B-ONNX-OPT (con `LinearAttention` y `CausalConvWithState` fusionados y `num_logits_to_keep`) e inserta los pesos de OneJev transformados de la misma manera que los del modelo base. La conversion la firma el usuario @shreyask dentro de la organizacion onnx-community.

Su relevancia actual esta en que permite ejecutar un modelo de decision multimodal directamente en el navegador mediante Transformers.js y WebGPU, con pesos cuantizados de alrededor de 0,8 GB en q4f16 y latencias de unos 150 ms para texto y unos 500 ms con una imagen de 720x400. Esta pensado para integrarse en agentes y pipelines que necesitan decisiones rapidas y probabilisticas sobre estados visuales o textuales, sin depender de un servidor de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal multimodal con torre de vision; grafos con atencion lineal (`LinearAttention`) y convolucion causal con estado (`CausalConvWithState`), heredados de Qwen3.5-0.8B-ONNX-OPT |
| Parametros totales | Aproximadamente 0,8 mil millones (0,8B) |
| Parametros activos | No procede (la informacion disponible no indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16 y q4f16 (4 bits, block size 32, asimetrica, con kernels propios de ONNX Runtime en el layout `MatMulNBits` / `GatherBlockQuantized`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos `decoder_model_merged`, `embed_tokens` y `vision_encoder`), en q4f16, fp16 y fp32 |

## Arquitectura y entrenamiento

OneJev-0.8B es un fine-tune completo de Qwen3.5-0.8B en el que la torre de vision permanece congelada: la arquitectura y las formas son las mismas que las del modelo base y los pesos de vision son identicos. La conversion ONNX reutiliza los grafos de onnx-community/Qwen3.5-0.8B-ONNX-OPT, que ya vienen con las capas de atencion lineal y la convolucion causal con estado fusionadas y con la opcion `num_logits_to_keep`. Cada peso de los grafos base se emparejo por valor con su parametro de Hugging Face correspondiente (transposicion, reshape, `1 + weight` para el RMSNorm centrado en cero y el patch embedding aplanado); los 420 emparejamientos son correctos y los parametros de OneJev pasan por las mismas transformaciones.

La cuantizacion q4f16 emplea 4 bits con block size 32, asimetrica, y usa los kernels de ONNX Runtime en el layout `MatMulNBits` / `GatherBlockQuantized` del grafo base. El error relativo sobre los pesos es de aproximadamente el 8,8 %, el mismo que el del repositorio base. El codificador de vision se copia sin cambios. Los scripts de conversion y los casos de referencia estan en el directorio `conversion/` del repositorio. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original.

## Capacidades

- Decision multimodal tipada: recibe un estado (texto, captura de pantalla o fotografia) y una pregunta con opciones, y devuelve una probabilidad para cada opcion.
- Tipos de pregunta soportados: `choice`, `score` y `noul`, segun la implementacion de `qev/prompt.py`.
- Entrada de imagenes en linea dentro del estado, con marcadores `<image:N>` para indicar donde se inserta cada imagen.
- Comprension de texto e imagen combinados: la model card valida el modelo sobre texto, una captura de pantalla de revision de una aplicacion y una pantalla de pago.
- Salida probabilistica calibrada: la respuesta se obtiene como softmax sobre las letras de las opciones en la ultima posicion del turno de chat.
- Ejecucion en navegador: soporte de WebGPU a traves de Transformers.js, ademas de ONNX Runtime en Node.
- No se documentan capacidades de generacion de texto libre, tool calling, function calling, agentes multi-paso, audio ni modo thinking en la informacion disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Revision automatizada de capturas de pantalla de aplicaciones: el modelo recibe la captura como estado y una pregunta `choice` sobre si la pantalla cumple una politica, devolviendo la probabilidad de cada opcion. Es adecuado porque opera directamente sobre imagenes y no necesita generar texto.
- Verificacion de pantallas de pago: con una foto o captura de la pantalla de pago, se formula una pregunta sobre si la transaccion se completo y se usa la probabilidad resultante como señal para aprobar, revisar o rechazar el flujo.
- Enrutado de decisiones en agentes: dentro de un agente que interactua con interfaces, el modelo actua como componente System One que puntua opciones discretas antes de que otro componente decida la accion a ejecutar.
- Etiquetado asistido de datos multimodales: anotadores o pipelines de curación pueden usar las probabilidades por opcion para preetiquetar imagenes y textos, dejando al humano la revision de los casos con probabilidades cercanas.
- Puntuacion de calidad (`score`): evaluacion de textos, respuestas o pantallas con una escala de puntuacion, util para filtrado previo y priorizacion de colas de revision.
- Deteccion de contenido problematico en interfaces: preguntas tipo `choice` sobre elementos visibles de una pantalla permiten construir clasificadores especificos sin entrenar un modelo nuevo.
- Ejecucion local en el navegador con privacidad: al correr con Transformers.js y WebGPU, los datos del usuario no salen del dispositivo, lo que encaja en herramientas de analisis de pantalla o formularios sensibles.
- Filtrado rapido en pipelines RAG o de moderacion: con latencias de unos 150 ms para texto y unos 500 ms con imagen, el modelo sirve como primera etapa de decision antes de llamar a un modelo generativo mas costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye comprobaciones de fidelidad de la conversion frente a una pasada forward de OneJev-0.8B en fp32 con Hugging Face, sobre 9 preguntas relativas a texto, una captura de pantalla de revision de una aplicacion y una pantalla de pago:

| Runtime | Diferencia maxima en la probabilidad de cualquier opcion | Respuesta principal cambiada |
|---|---|---|
| fp32, ONNX Runtime (Node, Transformers.js) | 0,0011 | 0 de 9 |
| fp16, WebGPU (Chrome, M3 Pro) | 0,030 | 0 de 9 |
| q4f16, WebGPU | 0,025 en 8 preguntas y 0,19 en un empate cercano | 1 de 9 |

Ademas, la model card indica que el motor propio de OneJev (`qev`) reutiliza un prefijo de imagen en cache entre preguntas y que, en prompts con imagen, sus probabilidades difieren de una pasada forward completa en hasta aproximadamente 0,07. Esta conversion reproduce la pasada forward completa, que `qev` denomina ruta de evaluacion de entrenamiento.

## Requisitos de hardware

- Tamano de pesos por variante: q4f16 alrededor de 0,8 GB, fp16 alrededor de 2,2 GB, fp32 alrededor de 4,4 GB. El repositorio completo ocupa 7,3 GB.
- VRAM estimada para inferencia: no disponible en la model card; como referencia, la variante q4f16 pesa unos 0,8 GB, por lo que la memoria necesaria sera algo superior a esa cifra, y la fp32 requerira al menos el equivalente a sus 4,4 GB de pesos mas estados intermedios.
- Cabe en GPU de consumo: si, al menos en las variantes q4f16 y fp16; la model card valida fp16 y q4f16 en WebGPU sobre un Apple M3 Pro, lo que confirma ejecucion en hardware integrado de gama alta para portatiles.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible; el caso validado es WebGPU en Chrome sobre M3 Pro.
- Opciones de despliegue: Transformers.js, ONNX Runtime en Node, y WebGPU en el navegador. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, coherente con el formato ONNX en lugar de GGUF.
- Latencia medida: aproximadamente 150 ms por pregunta con texto unicamente y aproximadamente 500 ms con una imagen de 720x400, en WebGPU, con una sola pasada forward. El throughput no esta disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| onnx-community/OneJev-0.8B-ONNX | 0,8B | no disponible | ONNX (q4f16, fp16, fp32) | Apache-2.0 | Conversion ONNX del modelo de decision para Transformers.js y WebGPU |
| OmniJev/OneJev-0.8B | 0,8B | no disponible | Pesos originales en PyTorch | Apache-2.0 | Modelo original de decision multimodal System One |
| onnx-community/Qwen3.5-0.8B-ONNX-OPT | 0,8B | no disponible | ONNX | no disponible | Modelo base Qwen3.5-0.8B con los mismos grafos, sin el fine-tune de decision |

No se dispone de modelos alternativos comparables en la misma categoria (modelos de decision probabilistica multimodal) dentro de la informacion proporcionada; la comparacion se limita al modelo original y al modelo base cuyos grafos se reutilizan. No hay datos de rendimiento comparativos entre ellos.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones abiertas; su salida es una distribucion de probabilidad sobre opciones predefinidas.
- La calidad de la respuesta depende del formato del prompt: la model card especifica que el turno debe construirse como en `qev/prompt.py`, con un system prompt, el estado dentro de `<state>...</state>` (imagenes en linea donde aparece `<image:N>`), la pregunta con opciones letradas y la frase "Answer with one letter". Desviarse de ese formato puede degradar las probabilidades.
- En la variante q4f16 sobre WebGPU se observo un cambio en la respuesta principal en 1 de 9 preguntas, correspondiente a un empate cercano, con una diferencia de 0,19 en la probabilidad de una opcion. En escenarios con decisiones ajustadas conviene usar fp16 o fp32.
- Las probabilidades del motor `qev` con prefijo de imagen en cache pueden diferir hasta aproximadamente 0,07 respecto a una pasada forward completa; hay que tenerlo en cuenta si se mezclan ambos caminos de inferencia.
- No hay informacion sobre sesgos conocidos ni evaluaciones de equidad en la documentacion disponible.
- El riesgo de alucinacion no aplica de la misma forma que en un modelo generativo, pero si existe riesgo de sobreconfianza en las probabilidades cuando el estado de entrada es ambiguo o esta fuera de la distribucion de entrenamiento.
- Limitaciones de contexto e idioma: no disponible. No se especifica la longitud de contexto soportada ni los idiomas cubiertos.
- Licencia Apache-2.0: permite uso comercial y modificacion, con los terminos habituales de atribucion y conservacion del aviso de licencia. La model card recuerda que todo el credito del modelo corresponde a los autores de OneJev.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 30 de septiembre de 2026, por lo que la validacion por parte de la comunidad es todavia inexistente.

## Enlaces

- Repositorio ONNX en HuggingFace: https://huggingface.co/onnx-community/OneJev-0.8B-ONNX
- Modelo original: https://huggingface.co/OmniJev/OneJev-0.8B
- Repositorio de OneJev en GitHub: https://github.com/OmniJev/OneJev
- Demo en el navegador: https://huggingface.co/spaces/shreyask/onejev-web
- Grafos base reutilizados: https://huggingface.co/onnx-community/Qwen3.5-0.8B-ONNX-OPT
- Sitio de ONNX: https://onnx.ai/
- Documentacion de ONNX: https://onnx.ai/onnx/
- Repositorio de ONNX en GitHub: https://github.com/onnx/onnx
- ONNX Runtime: https://onnxruntime.ai/
- Wikipedia de Open Neural Network Exchange: https://en.wikipedia.org/wiki/Open_Neural_Network_Exchange
