# leonsarmiento/Occamy-1.0-6bit-XL-mlx

## Resumen

Occamy-1.0-6bit-XL-mlx es una cuantizacion de 6 bits del modelo multimodal Accio-Lab/occamy-1.0, publicada por el usuario leonsarmiento y empaquetada especificamente para Apple Silicon mediante la libreria MLX. El modelo base lo desarrolla Accio-Lab y esta construido sobre Qwen3.6-35B-A3B: una arquitectura MoE de 35.107.181.936 parametros totales con aproximadamente 3.000 millones de parametros activos por token, 256 expertos (8 enrutados mas 1 compartido) y un codificador de vision nativo. Segun la model card, esta pensado para trabajo agente de horizonte largo: uso coordinado de busqueda, codigo, herramientas, ficheros, APIs estructuradas y software de productividad, con seguimiento de estado y recuperacion ante fallos.

La relevancia de esta ficha concreta es doble. Por un lado, documenta un modelo agente multimodal de 35B con 262.144 tokens de contexto nativo, capacidad de tool calling en XML y modo de razonamiento activado por defecto. Por otro, introduce la receta de cuantizacion BaseQuant_XL, que el autor describe como agnostica a los datos: no usa conjunto de calibracion, analisis de sensibilidad ni matriz de importancia, y asigna la precision por rol arquitectonico (bf16 para el router y la proyeccion de salida, 8 bits para capas que procesan todos los tokens, 6 bits para los expertos enrutados y la torre de vision).

El resultado son 29.9 GB de pesos con 6,808 bits por peso y tamano de grupo 64. Al ser un build MLX, su uso esta restringido al ecosistema de Apple Silicon a traves de mlx-vlm y LM Studio. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion reciente y sin validacion externa publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE de la familia Qwen3.6 (35B-A3B) con codificador de vision nativo; atencion hibrida (30 capas linear_attn + 10 capas full attention sobre 40 capas) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | Aproximadamente 3 B por token (8 expertos enrutados de 256 + 1 compartido) |
| Longitud de contexto | 262.144 tokens nativos; entrenado por SFT a 131.072 tokens |
| Tipos de cuantizacion | 6 bits en la ruta de expertos y torre de vision; 8 bits en embeddings, self_attn y linear_attn; bf16 en router, shared_expert_gate, lm_head y shared_expert. 6,808 bits por peso, group size 64 |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX); torre de vision en fichero separado `model-visual.safetensors` |
| Libreria de inferencia | mlx / mlx-vlm |
| Modalidades | Texto, imagen y video como entrada; texto como salida |
| Modo de razonamiento | `<think>...</think>` activado por defecto; soporta `preserve_thinking` |
| Tool calling | Estilo XML (`<tool_call><function=...><parameter=...>`) |
| Capa MTP | No incluida en el origen (`mtp_num_hidden_layers: 0`) |
| Tamano del repositorio | 29.9 GB |
| Modelo base | Accio-Lab/occamy-1.0 |
| Fecha de creacion / actualizacion | 2026-09-16 / 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos de la familia Qwen3.6, con 256 expertos en total y 9 activos por token (8 enrutados mas 1 compartido). De las 40 capas, 30 emplean atencion lineal y 10 atencion completa, un esquema hibrido que reduce el coste del cache KV en contextos largos. El codificador de vision se ha preservado integramente en esta cuantizacion: segun la model card, Accio-Lab congelo el encoder y el proyector visual durante el post-entrenamiento, por lo que el comportamiento de vision equivale al del modelo base Qwen3.6.

El post-entrenamiento del modelo original se realizo con el framework Dressage de Accio-Lab e incluye SFT de parametros completos sobre aproximadamente 15.000 trayectorias (403,3 millones de tokens), HDPO, una fusion de dos expertos (Marathon, orientado a ejecucion sostenida, y Sprint, orientado a capacidad agente amplia) y SAO. Los pesos, el dataset (`occamy-data-1.0`) y el codigo de entrenamiento estan publicados por el autor original.

La innovacion de este repositorio es la receta BaseQuant_XL: una cuantizacion estatica y agnostica a los datos que no utiliza conjunto de calibracion ni analisis de sensibilidad. La asignacion de bits sigue el rol arquitectonico de cada capa. El router (`mlp.gate`), `shared_expert_gate`, `lm_head` y `shared_expert` se mantienen en bf16 porque cualquier ruido de cuantizacion en esas rutas provocaria enrutamiento erroneo de expertos o degradacion de la salida. Las capas que procesan todos los tokens (`embed_tokens`, `self_attn`, `linear_attn`) van a 8 bits. Los expertos enrutados y la torre de vision van a 6 bits, con el argumento de que la redundancia de 256 expertos absorbe el ruido y de que bits superiores en expertos enrutados pueden inducir sobre-razonamiento. El autor sostiene que las cuantizaciones guiadas por calibracion (iMatrix, AWQ, GPTQ, oQ, oQ4e) sesgan la representacion hacia los dominios presentes en el conjunto de calibracion, mientras que XL no se ajusta a ninguna distribucion de datos concreta.

## Capacidades

- Generacion de texto y razonamiento multi-paso en modo extendido, con la cadena de pensamiento emitida por defecto dentro de `<think>...</think>`.
- Razonamiento agente de horizonte largo: planificacion, ejecucion sostenida, seguimiento de estado persistente, recuperacion tras errores y finalizacion de tareas.
- Tool calling y function calling en formato XML, con parser recomendado `qwen3_coder`.
- Uso de herramientas externas: busqueda, ejecucion de codigo, sistema de ficheros, APIs estructuradas y software de productividad.
- Generacion y edicion de codigo, con benchmark especifico de terminal (Terminal-Bench 2.1) reportado por el autor del modelo base.
- Vision multimodal: entrada de imagen y video, con torre de vision preservada y fichero mmproj incluido para LM Studio.
- Contexto largo de 262.144 tokens nativos, adecuado para repositorios, documentacion extensa y sesiones agente prolongadas.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de razonamiento configurable, con soporte de `preserve_thinking` para conservar el bloque de pensamiento.
- Compatibilidad con inferencia en MLX, incluida la carga directa de expertos por tensor individual sin necesidad de sanitize personalizado.

## Casos de uso

- Agente de revision de codigo en local: el modelo puede recorrer un repositorio completo dentro de la ventana de 262.144 tokens y localizar fallos concretos, como errores tragados por una API de pagos, proponiendo despues un parche. La combinacion de codigo, tool calling y contexto largo lo hace adecuado para este flujo sin enviar el codigo a un servicio externo.
- Automatizacion de operaciones en terminal: con 59,00 en Terminal-Bench 2.1, puede interpretar salidas de shell, ejecutar comandos de diagnostico y encadenar acciones correctivas sobre un sistema Linux.
- Asistente de investigacion con busqueda web: el modelo coordina busquedas, lee resultados y sintetiza conclusiones en varias iteraciones, manteniendo el estado de la investigacion a lo largo de la sesion.
- Analisis de documentos con imagenes: al aceptar imagen y video como entrada, puede extraer informacion de capturas, diagramas, tablas escaneadas e interfaces graficas dentro de un flujo de trabajo con texto.
- Atencion al cliente y soporte tecnico de nivel avanzado: gestiona conversaciones multi-turno con contexto largo y puede invocar herramientas internas (consulta de pedidos, estado de cuenta) mediante el formato XML de tool calling.
- Extraccion de datos estructurados desde APIs: con 65,40 en BFCL v4, es apto para pipelines donde el modelo decide que endpoint llamar, con que parametros y como encadenar respuestas para construir un registro final.
- Procesamiento por lotes de correo y documentos ofimaticos: el seguimiento de estado persistente permite clasificar, resumir y responder elementos de bandeja manteniendo coherencia entre elementos.
- Desarrollo en equipos con Mac: al ser un build MLX, permite ejecutar un modelo de 35B con vision y contexto largo en un Mac Studio o MacBook Pro con memoria unificada alta, sin GPU dedicada ni conexion a la nube.

## Benchmarks y rendimiento

Resultados publicados por Accio-Lab para el modelo base (Occamy-1.0) y reproducidos en la model card de esta cuantizacion:

| Benchmark | Occamy-1.0 |
|---|---|
| Claw-Eval (media) | 82,20 |
| WildClawBench | 49,16 |
| AutomationBench Pass@1 | 27,60 |
| Terminal-Bench 2.1 | 59,00 |
| BFCL v4 | 65,40 |
| IFEval | 91,53 |

La model card indica que 82,20 en Claw-Eval supone +12,7 puntos sobre el modelo base Qwen3.6. No se han publicado en la informacion disponible resultados de benchmarks medidos especificamente sobre esta cuantizacion de 6 bits, ni resultados de MMLU, GSM8K o HumanEval.

## Requisitos de hardware

- Tamano de los pesos: 29,9 GB en safetensors (6,808 bits por peso). Es el minimo absoluto de memoria que debe poder reservar el proceso de inferencia.
- Plataforma: MLX solo se ejecuta en Apple Silicon (familias M1, M2, M3 y M4). No hay soporte CUDA ni ROCm para este repositorio.
- Memoria unificada estimada: 32 GB es el limite inferior practico para cargar el modelo; con cache KV, activaciones y el encoder de vision conviene partir de 36 GB. Para exprimir la ventana de 262.144 tokens se recomienda 64 GB o mas.
- Equipos recomendados: MacBook Pro o Mac Studio con chip Max o Ultra y 36, 64, 96 o 128 GB de memoria unificada. Un M2 Ultra o M3 Ultra con 96-192 GB es la opcion mas holgada para contexto muy largo.
- Viabilidad en GPU de consumo: no aplicable, ya que el formato MLX no se ejecuta sobre GPUs NVIDIA o AMD. Equivalencias concretas con RTX 4090, A100 o H100 no disponibles.
- Despliegue: `mlx-vlm` (invocacion `python -m mlx_vlm.generate`), como libreria Python dentro de una aplicacion propia, y LM Studio, que reconoce el mmproj de vision incluido.
- Compatibilidad con vLLM, llama.cpp, Ollama y TGI: no disponible; este repositorio esta empaquetado exclusivamente para MLX y no se documentan conversiones a GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Parametros de inferencia recomendados por el autor: `temperature` 1.0, `top_p` 0.95, `top_k` 20, `presence_penalty` 1.5, `max_tokens` 32.768, `reasoning_parser` `qwen3`, `tool_call_parser` `qwen3_coder`.
- Requisito de version: `mlx-vlm` 0.7.0 o superior, necesario para apilar automaticamente los expertos enrutados desde tensores individuales.

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| leonsarmiento/Occamy-1.0-6bit-XL-mlx | 35,1 B | ~3 B | 262.144 | 6/8 bits y bf16 por capa (6,808 bpp) | Apache 2.0 | MLX (Apple Silicon) |
| Accio-Lab/occamy-1.0 | 35,1 B | ~3 B | 262.144 | bf16 completo | Apache 2.0 | Transformers (multiplataforma) |
| Qwen3.6-35B-A3B (modelo base) | 35 B | ~3 B | No disponible | No aplica | No disponible | Multiples backends |

Comparativa de rendimiento entre el modelo base Qwen3.6 y Occamy-1.0: la unica cifra publicada en la informacion disponible es la diferencia de +12,7 puntos en Claw-Eval a favor de Occamy-1.0. No hay datos comparativos de WildClawBench, Terminal-Bench, BFCL v4 ni IFEval para el modelo base. No se dispone de datos de rendimiento medidos sobre esta cuantizacion de 6 bits frente al modelo en bf16, por lo que la perdida de calidad introducida por la cuantizacion no puede cuantificarse con la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Ni el autor de la cuantizacion ni la documentacion consultada detallan evaluaciones de sesgo.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de tasa de alucinacion para este modelo ni para su base. El modo de razonamiento activado por defecto genera cadenas de pensamiento largas, lo que no garantiza por si mismo la correccion factual.
- Idiomas: la lista de idiomas soportados no esta disponible. La model card no incluye evaluacion multilingue.
- Ambito de plataforma: al estar en formato MLX, el modelo solo se ejecuta en Apple Silicon. Esto lo descarta para despliegues en servidores con GPU NVIDIA, Kubernetes con aceleradores CUDA o entornos Linux tradicionales.
- Requisito de version: necesita `mlx-vlm` 0.7.0 o superior para apilar los tensores de expertos en el formato `switch_mlp`. Con versiones anteriores el modelo no cargara correctamente.
- Estado de validacion: el repositorio tiene 0 descargas y 0 likes, y no se han publicado mediciones independientes de la perdida de calidad respecto al modelo en bf16. La cuantizacion es una publicacion de la comunidad, no oficial de Accio-Lab.
- Temperatura recomendada alta: el autor recomienda `temperature` 1.0 con `presence_penalty` 1.5. Estos valores favorecen la diversidad pero pueden producir respuestas erraticas en tareas que requieren salida determinista, como extraccion de datos normalizados.
- Los benchmarks citados corresponden al modelo base y no al build cuantizado, por lo que no deben tomarse como rendimiento garantizado de esta version.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene verificar la licencia del modelo base enlazada en la model card antes de un despliegue en produccion.
- Ausencia de capa MTP: el modelo base no incluye capa de prediccion multi-token (`mtp_num_hidden_layers: 0`), por lo que no se puede aplicar decodificacion especulativa basada en MTP con este build.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/leonsarmiento/Occamy-1.0-6bit-XL-mlx
- Modelo base Accio-Lab/occamy-1.0: https://huggingface.co/Accio-Lab/occamy-1.0
- Licencia del modelo base: https://huggingface.co/Accio-Lab/occamy-1.0/blob/main/LICENSE
- Organizacion Accio-Lab: https://huggingface.co/Accio-Lab
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo: los resultados obtenidos corresponden a paginas de soporte tecnico de Microsoft ajenas al tema.
