# jimmylearnML/DiffusorRT-iPhone-Qwen3-MDLM-0.6B

## Resumen

DiffusorRT-iPhone-Qwen3-MDLM-0.6B es un paquete de pesos convertidos para su ejecucion en iPhone, no un modelo entrenado desde cero. El autor, jimmylearnML, parte de `dllm-hub/Qwen3-0.6B-diffusion-mdlm-v0.1`, una adaptacion de Qwen3-0.6B realizada por los autores de dLLM en la que el decodificador autorregresivo se sustituye por un esquema de difusion de tipo MDLM (Masked Diffusion Language Model). Sobre esa base, este repositorio exporta el decodificador a Core ML para iOS 18 o superior, lo divide en dos grafos compilados, guarda los embeddings de entrada en FP16 y convierte el tokenizador al formato que consume la aplicacion.

El resultado es un artefacto de despliegue orientado a inferencia local y offline en dispositivos Apple, con soporte declarado para chat corto y edicion de fragmentos seleccionados (selected-span editing). El repositorio ocupa 1,5 GB y no incluye el motor de inferencia ni ejecutable alguno: solo los ficheros de pesos y tokenizador listados en `iphone-pack.json`, que la app DiffusorRT lee directamente.

La relevancia es doble. Por un lado, demuestra la viabilidad de llevar modelos de difusion de lenguaje a hardware movil mediante Core ML, un camino poco explorado frente a los transformers autorregresivos cuantizados. Por otro, el modelo base procede de Qwen3-0.6B, con licencia Apache-2.0, lo que facilita su reutilizacion. Conviene subrayar que el autor no entreno los pesos y que el paquete no constituye una afirmacion de precision general del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con decodificacion por difusion de mascaras (MDLM), derivado de Qwen3-0.6B |
| Parametros totales | 0,6 mil millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los embeddings de entrada se almacenan en FP16 y el decodificador se exporta como dos grafos Core ML compilados |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (dos grafos compilados) mas tokenizador en formato propio de la app; no es un checkpoint de Python |

## Arquitectura y entrenamiento

El modelo base es una adaptacion de Qwen3-0.6B en la que el objetivo de entrenamiento pasa de la prediccion autorregresiva del siguiente token a la denoising de tokens enmascarados, siguiendo el paradigma MDLM. En lugar de generar token a token de izquierda a derecha, el modelo parte de una secuencia con posiciones enmascaradas y las va reconstruyendo de forma iterativa. Esta formulacion habilita de forma natural tareas de infill y edicion de fragmentos, que es precisamente lo que el paquete declara soportar en su modo de selected-span editing.

Este repositorio concreto no entrena nada: es una conversion de ingenieria. El autor exporta el decodificador para iOS 18 o superior, lo divide en dos grafos Core ML compilados (probablemente para ajustarse a limites de tamano o de memoria del runtime), almacena los embeddings de entrada en FP16 y transforma el tokenizador al formato que espera la aplicacion DiffusorRT. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto mediante decodificacion por difusion iterativa, no autorregresiva.
- Chat corto offline en dispositivo, segun la model card.
- Edicion de fragmentos seleccionados (selected-span editing), aprovechando la naturaleza de infill del objetivo MDLM.
- Inferencia local en iPhone con iOS 18 o superior a traves de Core ML.
- Verificacion de integridad: el paquete incluye hashes SHA-256 por fichero.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Chat offline en iPhone: la aplicacion DiffusorRT carga los dos grafos Core ML y el tokenizador incluidos en el paquete para mantener conversaciones cortas sin conexion de red, lo que evita enviar datos del usuario a servidores externos.
- Edicion de texto por tramos: gracias al esquema de difusion de mascaras, el modelo puede reescribir un fragmento seleccionado dentro de un documento manteniendo el contexto circundante, util para correccion o reformulacion en apps de notas.
- Prototipado de investigacion en dLLM sobre movil: sirve como banco de pruebas para medir latencia y calidad de la decodificacion por difusion en hardware Apple frente a transformers autorregresivos cuantizados.
- Autocompletado y reescritura en aplicaciones de escritorio iOS/iPadOS: el modo de infill permite sugerir continuaciones o sustituciones dentro de un parrafo sin regenerar todo el texto.
- Demos educativas de modelos de difusion de lenguaje: al ser un paquete pequeno (1,5 GB) y con licencia Apache-2.0, es adecuado para talleres y material docente sobre tecnicas de denoising aplicadas a texto.
- Validacion de pipelines de despliegue Core ML: util para equipos que quieran comprobar el flujo completo de conversion, division en grafos, almacenamiento FP16 de embeddings y verificacion SHA-256 antes de instalar en dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Dispositivo objetivo: iPhone con iOS 18 o superior; el paquete esta exportado especificamente para Core ML en esa plataforma.
- VRAM/tamano en disco: el repositorio ocupa 1,5 GB; el consumo en memoria en tiempo de ejecucion depende de los dos grafos Core ML y del estado de activaciones, y no esta documentado.
- GPU recomendadas: no aplica en el sentido habitual (A100, H100, RTX 4090); el destino es la Neural Engine y la GPU integrada del SoC Apple.
- Cabe en consumer GPU: si, por tamano (0,6B parametros), pero no se distribuyen pesos en formatos GGUF o safetensors para ese uso.
- Opciones de despliegue: aplicacion DiffusorRT en iOS con Core ML; no se proporcionan pesos para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| DiffusorRT-iPhone-Qwen3-MDLM-0.6B | 0,6B | no disponible | Core ML para iOS | Apache-2.0 | Conversion para movil de un MDLM; sin benchmarks publicados |
| dllm-hub/Qwen3-0.6B-diffusion-mdlm-v0.1 | 0,6B | no disponible | Checkpoint de Python (modelo base) | no disponible en la informacion | Modelo original del que deriva este paquete |
| Qwen/Qwen3-0.6B | 0,6B | no disponible en la informacion | safetensors, multiples runtimes | Apache-2.0 | Transformer autorregresivo original; referencia de calidad y ecosistema |

La comparativa se limita a la genealogia del modelo, ya que no hay datos de rendimiento publicados para el paquete convertido ni para el checkpoint MDLM intermedio.

## Limitaciones y advertencias

- El autor declara explicitamente que el paquete no es un checkpoint de Python, no es el motor de inferencia y no constituye una afirmacion de precision general del modelo.
- DiffusorRT no entreno los pesos; cualquier merito o defecto de calidad corresponde al modelo base y a sus autores.
- Orientado a chat corto y edicion de tramos; no se documenta soporte para contextos largos ni para tareas complejas de razonamiento.
- Sin datos publicados de benchmarks, sesgos, tasas de alucinacion ni cobertura idiomatica.
- Dependencia de iOS 18 o superior y de la aplicacion DiffusorRT; los ficheros deben conservar sus rutas y verificarse con SHA-256 antes de la instalacion.
- El paquete no incluye ejecutable, conversaciones de usuario ni token de acceso a servidor.
- Licencia Apache-2.0 heredada del modelo base, lo que permite uso comercial, pero conviene revisar las atribuciones de Qwen3-0.6B y del checkpoint dLLM original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jimmylearnML/DiffusorRT-iPhone-Qwen3-MDLM-0.6B
- Modelo base (MDLM): https://huggingface.co/dllm-hub/Qwen3-0.6B-diffusion-mdlm-v0.1/tree/c8d24a3f4adaeef46881b450e1bf7d1005203bd7
- Modelo original Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
