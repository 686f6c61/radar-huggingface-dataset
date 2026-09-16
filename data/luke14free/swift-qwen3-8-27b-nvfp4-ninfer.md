# luke14free/Swift-Qwen3.8-27B-NVFP4-NInfer

## Resumen

`luke14free/Swift-Qwen3.8-27B-NVFP4-NInfer` es una conversion de formato del modelo `ukisai/Swift-Qwen3.8-27B-NVFP4`, el derivado orientado a razonamiento eficiente de Qwen3.8-27B publicado por UkisAI. El repositorio no contiene un checkpoint de Transformers, safetensors, GGUF ni vLLM, sino un unico artefacto nativo `.ninfer` de 22,10 GiB (23.726.676.224 bytes) para el motor NInfer en su version de contenedor v3. El autor de la conversion es el usuario `luke14free`, mientras que el modelo origen y su receta de calibracion pertenecen a UkisAI.

El objetivo del artefacto es ejecutar un modelo de 27B con representacion mixta NVFP4/FP8 sobre una unica NVIDIA GeForce RTX 5090 (arquitectura Blackwell, `sm_120a`), aprovechando la decodificacion especulativa basada en la cabeza MTP incluida en el contenedor. La conversion preserva tokenizer, plantilla de chat, recursos de texto, vision y MTP, y adapta algunos tensores de frontera de ejecucion a los layouts registrados de FP8 con escalado por filas de NInfer.

Su relevancia es practica: permite servir un modelo de razonamiento de 27B con ventanas de hasta 262.144 tokens en hardware de consumo de gama alta, con endpoints compatibles con OpenAI y con Anthropic. Ahora bien, es un artefacto muy especializado: el autor no ofrece binarios precompilados, exige compilar NInfer desde el codigo fuente y limita el despliegue a una unica GPU y, para contexto maximo, a una unica peticion concurrente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.8-27B (derivado de razonamiento de UkisAI), con recursos de texto, vision y cabeza MTP; la model card no detalla el numero de capas ni el tipo de atencion |
| Parametros totales | 27B (segun la denominacion del modelo; no se aporta desglose exacto) |
| Longitud de contexto | Hasta 262.144 tokens con la configuracion recomendada (`--max-context 262144`); 16.384 tokens en la configuracion conservadora |
| Tipos de cuantizacion | Mixta NVFP4/FP8 en los pesos de texto; FP8 con escalado por filas en algunos tensores de frontera; cache KV en FP8 o BF16 |
| Idiomas soportados | No disponible |
| Licencia | `swift-open-license-1.0` (campo `license: other`); condiciones completas no disponibles en la informacion proporcionada |
| Formato de pesos | Contenedor nativo NInfer v3 (`.ninfer`); no es safetensors, GGUF ni checkpoint de vLLM |
| Tamano del artefacto | 23.726.676.224 bytes (22,10 GiB), SHA-256 `c5a72a6e9335797eee78e14b9a93256fef0e232251099696c7684e527ae7bcef` |
| Modelo base | `ukisai/Swift-Qwen3.8-27B-NVFP4` (relacion: quantized), revision de origen `4cf1019102c2fe9841c07109ac84acb40dabd9ec` |
| Repositorio | 23,7 GB; 0 descargas y 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La informacion disponible describe este repositorio como una conversion de formato y una adaptacion del layout de ejecucion, no como un ajuste fino adicional. El punto de partida es el checkpoint ModelOpt de `ukisai/Swift-Qwen3.8-27B-NVFP4`, convertido mediante el contrato de artefacto registrado para Qwen3.8 NVFP4 de NInfer, con identificador de receta `qwen3_8_27b_modelopt_nvfp4-v1` y un conversor basado en el commit `d49296868dcc17bd478ec185f0d3a801bcc0bf56` de NInfer. El manifiesto del artefacto (`artifact-manifest.json`) registra la procedencia y las fuentes auxiliares empleadas para la propuesta nativa, vision, MTP y resolucion del contenedor.

En el plano de ejecucion, el artefacto conserva la representacion mixta NVFP4/FP8 del modelo original donde NInfer lo soporta y empaqueta los recursos de tokenizer, plantilla de chat, texto, vision y MTP en un unico fichero. La innovacion destacable es la ruta de autodecodificacion especulativa mediante la cabeza MTP (`--spec mtp --draft-tokens 3 --lm-head-draft`), que permite proponer tres tokens por paso con la propia cabeza del modelo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo original, mas alla de su caracterizacion como derivado orientado a razonamiento eficiente.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con control explicito del esfuerzo de razonamiento mediante el parametro `reasoning_effort` (por ejemplo, `xhigh`) y un presupuesto de pensamiento configurable a nivel de servidor (`--default-thinking-budget`).
- Procesamiento de contexto largo: la configuracion recomendada del autor admite hasta 262.144 tokens, lo que habilita el analisis de documentos y repositorios extensos en una sola peticion.
- Capacidades de vision: el artefacto empaqueta recursos de Vision que se materializan con el flag `--vision`; el autor recomienda activarlo solo cuando se necesiten entradas de imagen o video, porque reserva memoria GPU fija adicional.
- Decodificacion especulativa integrada mediante la cabeza MTP, con tres tokens de borrador por paso, orientada a reducir la latencia de decodificacion en peticiones unicas.
- Servicio de API compatible con OpenAI (Chat Completions y Responses) y con Anthropic (Messages), lo que facilita su integracion en clientes y frameworks existentes.
- Soporte de tool calling y gestion de estado y cache, segun se documenta en la guia de serving de NInfer enlazada por el autor.
- Capacidades multilingues: no disponibles en la informacion proporcionada, mas alla de lo heredado del modelo base, que tampoco se detalla.

## Casos de uso

- Asistencia de razonamiento local en estacion de trabajo: con una RTX 5090 y NInfer compilado, el modelo puede resolver problemas de logica, matematicas y analisis tecnico sin enviar datos a servicios externos, algo critico en entornos con requisitos de confidencialidad.
- Analisis de repositorios y bases de codigo completas: la ventana de 262.144 tokens permite cargar ficheros multiples y mantener coherencia entre modulos en tareas de refactorizacion, explicacion de arquitectura o deteccion de dependencias ocultas.
- Revision de codigo asistida con tool calling: los endpoints compatibles con OpenAI y Anthropic permiten conectar el modelo a herramientas de linting, ejecucion de tests o consulta de documentacion dentro de un bucle de agente.
- Revision documental y contractual: con contexto largo y modo de razonamiento elevado, es adecuado para extraer clausulas, comparar versiones de un contrato y detectar contradicciones entre anexos en un unico paso de inferencia.
- Agentes multi-paso con latencia contenida: la ruta MTP con tres tokens de borrador reduce el coste de decodificacion en flujos de agente donde se encadenan muchas llamadas cortas de herramienta.
- Analisis de capturas, diagramas o fotogramas: activando `--vision`, el modelo puede describir interfaces, extraer informacion de esquemas tecnicos o resumir contenido visual junto a texto de contexto.
- Sustitucion de APIs en la nube por un endpoint local compatible: al exponer rutas equivalentes a OpenAI y Anthropic, se puede redirigir una aplicacion existente al servidor local sin reescribir el cliente.
- Investigacion sobre cuantizacion NVFP4/FP8 en Blackwell: el artefacto sirve como banco de pruebas para medir calidad y rendimiento de la representacion mixta y de la decodificacion especulativa MTP frente al checkpoint BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y la busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos eran contenido no relacionado y se han descartado).

## Requisitos de hardware

- Sistema operativo: Linux de 64 bits.
- GPU: NVIDIA GeForce RTX 5090 (`sm_120a`) unicamente. NInfer esta especializado deliberadamente en una sola RTX 5090 y no ofrece binario empaquetado ni destino de instalacion alternativo.
- CUDA: la version soportada por la build actual de NInfer; CUDA 13.1 es la linea base documentada por el proyecto.
- Memoria: el artefacto por si solo ocupa 22,10 GiB, a lo que hay que sumar la cache KV, los recursos adicionales (vision, MTP) y las activaciones. No se publica una cifra de VRAM total recomendada. Como estimacion, una GPU de 24 GB queda al limite o por debajo de lo necesario en cuanto se activa vision o se reserva contexto amplio, por lo que el margen de la RTX 5090 es el escenario previsto por el autor.
- No cabe en GPUs consumer de gama media; el propio autor restringe el soporte a la RTX 5090.
- Opciones de despliegue: exclusivamente NInfer (compilacion desde fuente con soporte de artefactos v3 Qwen3.8 NVFP4). No hay soporte para vLLM, llama.cpp, Ollama ni TGI con este artefacto; para esos entornos habria que usar el checkpoint BF16 o el NVFP4 original de UkisAI.
- Configuracion recomendada por el autor: `--max-context 262144`, `--kv-capacity auto`, `--max-concurrency 1`, `--prefill-chunk 2048`, `--kv-dtype fp8`, `--spec mtp`, `--draft-tokens 3`, `--lm-head-draft`.
- Configuracion conservadora: `--kv-dtype bf16` con `--max-context 16384` y sin decodificacion especulativa.
- Latencia y throughput: no disponibles. El autor solo indica que la configuracion con FP8 KV y MTP esta pensada para el mayor contexto practico y una decodificacion rapida de peticion unica, y que aumentar la concurrencia reparte la capacidad KV fijada al arranque entre las peticiones activas.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar con los dos repositorios relacionados directamente por el autor.

| Modelo | Parametros | Formato | Contexto | Licencia | Hardware objetivo | Notas |
|---|---|---|---|---|---|---|
| `luke14free/Swift-Qwen3.8-27B-NVFP4-NInfer` | 27B (nominal) | Contenedor NInfer v3 (`.ninfer`), NVFP4/FP8 mixto | Hasta 262.144 tokens con la config recomendada | `swift-open-license-1.0` | RTX 5090, NInfer desde fuente | Incluye recursos de vision y MTP; una sola peticion concurrente para contexto maximo |
| `ukisai/Swift-Qwen3.8-27B-NVFP4` | 27B (nominal) | Checkpoint NVFP4/FP8 original (ModelOpt) | No disponible | No disponible en esta informacion | No disponible | Fuente primaria de la conversion; su model card contiene la receta de calibracion y el inventario de precision |
| `ukisai/Swift-Qwen3.8-27b` | 27B (nominal) | BF16 | No disponible | No disponible en esta informacion | No disponible | Version sin cuantizar, util como referencia de calidad y para entornos sin soporte NVFP4 |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Artefacto altamente especializado: solo funciona con NInfer sobre una RTX 5090. No es utilizable con Transformers, vLLM, llama.cpp, Ollama ni TGI.
- No existe binario precompilado de NInfer; es obligatorio compilar desde el codigo fuente siguiendo sus instrucciones, con la version de CUDA soportada.
- La licencia es `swift-open-license-1.0` bajo el campo `license: other`. Las condiciones exactas, incluidos los terminos de uso comercial, no estan disponibles en la informacion proporcionada, por lo que deben verificarse antes de cualquier despliegue en produccion.
- Concurrencia limitada: para el contexto maximo se recomienda `--max-concurrency 1`; aumentar la concurrencia divide la capacidad de cache KV fijada al arranque entre peticiones activas.
- La activacion de vision reserva memoria GPU fija adicional, lo que reduce el contexto disponible si no se ajusta la configuracion.
- Es una conversion de formato, no un ajuste fino: hereda integramente los sesgos, el riesgo de alucinacion y las limitaciones del modelo de UkisAI, que no se documentan en este repositorio.
- No hay informacion sobre idiomas soportados, por lo que no puede garantizarse un comportamiento homogeneo fuera de los idiomas cubiertos por el modelo base.
- No se publican evaluaciones de calidad: no hay forma de cuantificar la degradacion introducida por la cuantizacion NVFP4/FP8 ni por la adaptacion de tensores de frontera sin medirla uno mismo.
- El checkpoint original esta indexado bajo la revision `4cf1019102c2fe9841c07109ac84acb40dabd9ec`; cambios posteriores en el modelo base no se reflejan en este artefacto.
- El repositorio presenta 0 descargas y 0 likes, y ninguna validacion de la comunidad, lo que desaconseja su adopcion directa en produccion sin pruebas propias de integridad (verificar el SHA-256) y de calidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/luke14free/Swift-Qwen3.8-27B-NVFP4-NInfer
- Modelo base NVFP4: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-NVFP4
- Modelo base en BF16: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Repositorio de NInfer: https://github.com/Neroued/ninfer
- Instrucciones de compilacion de NInfer: https://github.com/Neroued/ninfer#quick-start
- Guia de serving de NInfer: https://github.com/Neroued/ninfer/blob/master/docs/serving.md
- Pagina del producto Swift de UkisAI: https://ukisai.com/products/swift
- Revision de origen del checkpoint ModelOpt: `4cf1019102c2fe9841c07109ac84acb40dabd9ec`
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; no se han encontrado papers, blogs ni demos adicionales.
