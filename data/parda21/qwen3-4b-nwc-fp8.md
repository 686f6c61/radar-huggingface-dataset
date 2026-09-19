# Parda21/Qwen3-4B-NWC-fp8

## Resumen

Qwen3-4B-NWC-fp8 es un checkpoint de inferencia del modelo Qwen/Qwen3-4B publicado por el usuario Parda21, en el que los pesos se han cuantizado a fp8 (e4m3, weight-only) y posteriormente se han almacenado en el formato NWC (Neural Weight Compression). NWC es un esquema de compresion sin perdida sobre los bytes fp8: los valores se codifican entropicamente hasta el 0,87 de su tamano y se descodifican dentro del propio kernel CUDA de multiplicacion matriz-vector. Respecto al checkpoint fp8 original no se pierde informacion (los bytes fp8 se recuperan bit a bit); respecto al original en BF16 se trata de una cuantizacion fp8 convencional.

El modelo conserva los 3.535.109.616 parametros del modelo base (arquitectura transformer densa, sin MoE) y reduce el peso en disco de 8,04 GB en BF16 a 3,54 GB, con un uso de VRAM de 3,61 GB en generacion con batch 1. Sobre una RTX 4070 y con CUDA graph en modo greedy alcanza 73,6 tokens/s, frente a 45 tokens/s del BF16, manteniendo una perplejidad en WikiText-2 de 18,15 frente a 18,03 del original (+0,7 %, atribuible a la cuantizacion fp8, no a NWC).

Su relevancia practica es doble: por un lado demuestra que es posible comprimir un modelo de 4B por debajo del umbral de 4 GB de VRAM sin degradar mediblemente la calidad, lo que lo hace desplegable en GPUs de consumo; por otro, sirve como caso de referencia del ecosistema NWC, una libreria que traslada la descodificacion al kernel en lugar de descomprimir a memoria intermedia. El principal coste de adopcion es su dependencia de hardware NVIDIA moderno y de la propia libreria `neural-weight-compression`, en lugar de los runtimes habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-4B); no se especifica en la model card mas alla del modelo base |
| Parametros totales | 3.535.109.616 (3,54 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card para este checkpoint; el modelo base Qwen3-4B declara 32 768 tokens nativos, ampliables, pero el dato no se confirma en la documentacion de este repositorio |
| Tipos de cuantizacion | fp8 e4m3 weight-only, escala simetrica por canal de salida (per-output-channel), activaciones en BF16; compresion entropica NWC sobre los bytes fp8; exportacion alternativa a BF16 |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 (tanto los pesos como el modelo base) |
| Formato de pesos | safetensors con codificacion NWC (los bytes fp8 se descodifican dentro del kernel CUDA); exportable a checkpoint BF16 mediante `python -m nwc.export` |

## Arquitectura y entrenamiento

No se ha realizado ningun entrenamiento adicional: el checkpoint parte de Qwen/Qwen3-4B y solo modifica la representacion de los pesos. El proceso documentado por el autor es `fuse(model, elem="fp8")` seguido de `convert(model, elem="fp8")`, es decir, cuantizacion fp8 por matriz con escala simetrica por canal de salida y, despues, codificacion entropica NWC de los bytes fp8 resultantes. No hay datos sobre el corpus de entrenamiento del modelo base en la informacion proporcionada (numero de tokens, composicion del dataset, fases de RLHF/DPO), por lo que no se pueden detallar aqui.

La innovacion tecnica esta en el formato NWC: en lugar de descomprimir los pesos a BF16 antes de la multiplicacion, el kernel CUDA de matvec descodifica los valores comprimidos y aplica la escala por canal al final, para batch 1. La fase de prefill, en cambio, descuantiza a BF16 y delega en cuBLAS. Esto explica que el kernel fusionado iguale a un matvec fp8 nativo en la RTX 4070 (0,85-1,09x de tiempo, con un 13 % menos de bytes leidos) y que en una NVIDIA A16 se quede en 0,7x del fp8 nativo, donde el limitante es la capacidad de descodificacion y no el ancho de banda.

## Capacidades

- Generacion de texto y conversacion multi-turno (`text-generation`, `conversational`), con el mismo comportamiento que el Qwen3-4B original al tratarse de una cuantizacion y no de un fine-tuning.
- Razonamiento y matematicas basicas: capacidades heredadas del modelo base, no reevaluadas por el autor.
- Generacion de codigo: heredada del modelo base; en la model card figura el ejemplo de pregunta "What is a binary tree?".
- Generacion determinista en modo greedy con CUDA graph, con una penalizacion de perplejidad de +0,7 % respecto al BF16.
- Ejecucion local en GPUs de consumo: el modelo completo ocupa 3,61 GB de VRAM en batch 1.
- Capacidades multilingues: no disponibles (no se documentan idiomas en la ficha de HuggingFace ni en la model card).
- No se documenta soporte de tool calling, function calling, modo thinking, vision ni audio especifico para este checkpoint; cualquier capacidad de ese tipo dependeria del modelo base y no esta verificada aqui.

## Casos de uso

- Despliegue de un asistente de texto en GPUs de gama media: con 3,61 GB de VRAM en batch 1 cabe en tarjetas de 6-8 GB, lo que permite ejecutar un modelo de 4B en equipos donde un checkpoint BF16 de 8 GB no entraria junto al resto del stack.
- Inferencia local en estaciones de trabajo con una sola GPU: el kernel fusionado descodifica en el propio matvec, de modo que un servicio de generacion interactiva greedy puede alcanzar 73,6 tokens/s en una RTX 4070 sin recurrir a cuantizaciones de menor precision.
- Prototipado e investigacion sobre compresion de pesos: el repositorio sirve como referencia reproducible del pipeline NWC (`fuse` -> `convert` -> `save_pretrained`) y de su comparacion contra un matvec fp8 nativo.
- Evaluacion de la degradacion por cuantizacion fp8: al recuperarse los bytes fp8 bit a bit, permite medir el efecto aislado de la cuantizacion (18,03 -> 18,15 de perplejidad en WikiText-2) sin que la compresion anadida introduzca ruido.
- Generacion de codigo y respuestas tecnicas en entornos con VRAM limitada: al heredar el comportamiento del Qwen3-4B, sirve para autocompletado y explicacion de fragmentos, integrándose en editores o scripts de linea de comandos que invoquen `load_pretrained` directamente.
- Pipeline de conversion y publicacion: `python -m nwc.export` permite materializar un checkpoint BF16 equivalente (fp8 x escala redondeado a BF16) para alimentar herramientas que no soporten NWC, lo que facilita mover el modelo entre entornos experimentales.
- Servicio con multiples instancias en una misma GPU: al reducir el peso a 3,54 GB, en una GPU de 24 GB caben varias replicas del modelo para atender peticiones concurrentes con KV cache acotada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad tipo MMLU, HumanEval o GSM8K en la informacion disponible. Los unicos datos cuantitativos proporcionados son de compresion, velocidad y perplejidad:

| Metrica | Qwen3-4B (BF16) | fp8 weight-only | Qwen3-4B-NWC-fp8 |
|---|---|---|---|
| Peso de los pesos | 8,04 GB | 4,02 GB | 3,54 GB (0,88 de fp8, 0,44 de BF16) |
| VRAM en uso, batch 1 | 8,10 GB | No disponible | 3,61 GB |
| Tokens/s (RTX 4070, CUDA graph, greedy) | 45 | No disponible | 73,6 |
| Kernels de pesos frente a un matvec fp8 nativo (RTX 4070) | No aplica | 1x | 0,85-1,09x (paridad) |
| Perplejidad WikiText-2 (16 x 1024 tokens) | 18,03 | 18,15 | 18,15 |

Contexto del dato de perplejidad: medido en una RTX 4070 con 16 ventanas de 1024 tokens. El autor atribuye el +0,7 % (18,03 -> 18,15) exclusivamente a la cuantizacion fp8, senalando que NWC no introduce perdida adicional. En la NVIDIA A16, el kernel fusionado rinde a 0,7x de un fp8 nativo, aunque sigue superando a cuBLAS sobre el modelo BF16.

## Requisitos de hardware

- VRAM estimada: 3,61 GB en generacion con batch 1 (dato medido). Se recomienda una GPU con al menos 6 GB para dejar margen a la KV cache y a la fragmentacion; la KV cache crece con la longitud de contexto y no se han publicado cifras para contextos largos.
- GPU compatibles: NVIDIA con compute capability 7.5 o superior (Turing, Ampere, Ada Lovelace, Hopper). El autor indica que las mediciones se tomaron en hardware de compute capability 8.0 o superior. GPUs validadas en la documentacion: RTX 4070 y NVIDIA A16.
- Cabe en GPU de consumo: si. Ejemplos: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090. En una RTX 4070 se miden 73,6 tokens/s con CUDA graph en modo greedy.
- GPU de centro de datos: A100 y H100 funcionan (compute capability 8.0 y 9.0), aunque el modelo es lo bastante pequeno como para desaprovechar su ancho de banda; la A16 figura como caso de prueba con rendimiento limitado por la descodificacion (0,7x del fp8 nativo).
- Software necesario: controlador CUDA para CUDA 12.6 o superior, PyTorch con soporte CUDA y `neural-weight-compression >= 0.10`. Instalacion: `pip install neural-weight-compression transformers accelerate`.
- Opciones de despliegue: la libreria NWC mediante `load_pretrained` y el script `python -m nwc.demo Parda21/Qwen3-4B-NWC-fp8 --load --graph`. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, ni formato GGUF; para esos runtimes habria que exportar previamente a BF16 con `nwc.export`.
- Latencia y throughput: 73,6 tokens/s en RTX 4070 (batch 1, greedy, CUDA graph) y 45 tokens/s para el BF16 de referencia. No se publican cifras de throughput con batch mayor que 1 ni de latencia de prefill; el prefill se ejecuta descuantizando a BF16 sobre cuBLAS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Peso en disco | Perplejidad WikiText-2 | Licencia | Formatos y despliegue |
|---|---|---|---|---|---|---|
| Qwen3-4B-NWC-fp8 | 3,54 B | No especificado | 3,54 GB | 18,15 | Apache-2.0 | safetensors con codificacion NWC; requiere libreria NWC y GPU NVIDIA CC 7.5+ |
| Qwen3-4B (BF16) | 3,54 B | 32 768 nativos segun el modelo base (no confirmado en esta ficha) | 8,04 GB | 18,03 | Apache-2.0 | safetensors BF16; transformers, vLLM, llama.cpp |
| Qwen3-4B fp8 weight-only | 3,54 B | No especificado | 4,02 GB | 18,15 | Apache-2.0 | fp8 nativo; matvec fp8 en GPU |

No se dispone de datos comparativos frente a otras alternativas de la misma categoria (por ejemplo, otras cuantizaciones GGUF del mismo modelo base) en la informacion proporcionada. La comparacion relevante que si se puede trazar es interna: NWC-fp8 reduce un 12 % el peso frente al fp8 sin comprimir (3,54 frente a 4,02 GB) y un 56 % frente al BF16, a cambio de exigir la libreria NWC y hardware NVIDIA moderno.

## Limitaciones y advertencias

- Sesgos: no evaluados. Al ser una cuantizacion del Qwen3-4B, hereda los sesgos del modelo base, que no se documentan en esta ficha.
- Alucinacion: no medida. La unica degradacion cuantificada es la de perplejidad (+0,7 % en WikiText-2), que no permite extrapolar el comportamiento en tareas factuales.
- Idiomas: no disponibles. No se declara ninguna lista de idiomas soportados para este checkpoint ni se ha verificado el comportamiento multilingue tras la cuantizacion.
- Restricciones de licencia: Apache-2.0, igual que el modelo base, por lo que se permite uso comercial. Conviene verificar de forma independiente los terminos del modelo base Qwen3-4B antes de un despliegue en produccion.
- Dependencia de hardware: requiere GPU NVIDIA con compute capability 7.5 o superior y controlador para CUDA 12.6+. No hay soporte documentado para CPU, AMD, Apple Silicon ni GPUs NVIDIA anteriores a Turing.
- Dependencia de software: la libreria `nwc` (`neural-weight-compression >= 0.10`) es imprescindible para leer el formato; no hay integracion documentada con vLLM, TGI, llama.cpp, Ollama ni GGUF. La via de escape es exportar a BF16, lo que elimina la ventaja de tamano.
- Rendimiento del kernel dependiente de la GPU: la paridad con un matvec fp8 nativo se mide en una RTX 4070; en una A16 el kernel fusionado cae a 0,7x, es decir, la descodificacion puede convertirse en el cuello de botella en GPUs con poca capacidad de computo.
- El prefill no usa el kernel comprimido: descuantiza a BF16 y llama a cuBLAS, por lo que en prompts largos el comportamiento se aproxima al del modelo BF16 y la ventaja se concentra en la fase de decodificacion.
- Madurez y adopcion: el repositorio registra 0 descargas y 1 me gusta en el momento de la consulta, con una unica publicacion del autor; no hay validacion independiente de los resultados.
- Longitud de contexto: no se especifica en la model card. Si se necesita contexto largo, debe verificarse empiricamente el limite real del checkpoint y el consumo de KV cache.

## Enlaces

- HuggingFace: https://huggingface.co/Parda21/Qwen3-4B-NWC-fp8
- Repositorio de la libreria NWC: https://github.com/parda21/NWC
- Resultados detallados (seccion 8, comparativa de kernels): https://github.com/parda21/NWC, `docs/results.md`
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B

No se han encontrado otros enlaces relevantes (papers, blogs o demos) en los resultados de busqueda web disponibles; los resultados devueltos no guardan relacion con este modelo.
