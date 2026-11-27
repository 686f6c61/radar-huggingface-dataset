# netprojects/Qwen3.8-27B-hermes-adapted-LayerFit-MLX-2.5bit

## Resumen

Qwen3.8-27B-hermes-adapted-LayerFit-MLX-2.5bit es una cuantizacion de 2,5 bits en formato MLX del modelo harness-hub/Qwen3.8-27B-hermes-adapted, una adaptacion del Qwen3.8-27B de Alibaba orientada a tareas de agente y generacion de codigo. La publica netprojects (Paris Michalas) bajo licencia Apache-2.0 y esta pensada especificamente para ejecutarse en Apple Silicon, con un tamano en disco de 11,5 GB que la hace viable en Macs de 16 GB de memoria unificada.

La innovacion principal es LayerFit, una tecnica de cuantizacion por capas que, en lugar de asignar el mismo numero de bits a todas las capas, mide la sensibilidad de cada bloque (MLP, atencion, atencion lineal, embeddings y cabeza de salida) y distribuye el presupuesto de bits donde mas ayuda. Segun el autor, esto mejora la concordancia top-1 con el modelo bf16 del 75,9 % al 83,3 % y reduce el error KL un 52 % respecto a una cuantizacion estandar de 2,5 bits del mismo tamano.

El modelo conserva la torre de vision en bf16, mantiene un contexto de 262K tokens e incluye la cabeza de prediccion multi-token (MTP) del modelo original cuantizada a 4 bits, lo que permite decodificacion especulativa con mlx-vlm. El pipeline declarado es image-text-to-text y la libreria es mlx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tag `qwen3_5`), con atencion lineal y torre de vision; no se detalla la configuracion exacta |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262K tokens (segun la model card) |
| Tipos de cuantizacion | 2,5 bits LayerFit (pesos del LM); torre de vision en bf16; cabeza MTP en 4 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

El modelo base es harness-hub/Qwen3.8-27B-hermes-adapted, una adaptacion del Qwen3.8-27B de Alibaba para el agente Hermes. La model card etiqueta la arquitectura como `qwen3_5` e indica que LayerFit mide por separado los bloques MLP, atencion y atencion lineal de cada capa, lo que sugiere una arquitectura hibrida con componentes de atencion lineal, aunque no se detalla la proporcion ni la configuracion de capas. El pipeline image-text-to-text y la presencia de una torre de vision en bf16 confirman capacidades multimodales de entrada de imagen.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base. La innovacion tecnica documentada es la propia cuantizacion LayerFit: una busqueda por capas que asigna bits de forma no uniforme segun la sensibilidad medida, con receta publicada en `layerfit-recipe.json`. Ademas, se incluye la cabeza de prediccion multi-token (MTP) a 4 bits para decodificacion especulativa.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Razonamiento con modo "thinking" (la model card reporta 2/2 en pruebas de thinking).
- Generacion de codigo (la model card reporta 3/3 en pruebas de codigo).
- Tool calling y function calling (3/3 en las pruebas del autor).
- Capacidades de agente y razonamiento multi-paso (el modelo base esta adaptado para el agente Hermes).
- Entrada de imagen (image-text-to-text) mediante torre de vision en bf16.
- Matematicas: GSM8K-50 con thinking desactivado, 44/50.
- Decodificacion especulativa mediante la cabeza MTP incluida.
- Contexto largo de hasta 262K tokens.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en local para desarrolladores con Mac: el modelo puede generar y revisar codigo en un portatil Apple Silicon de 16 GB, sin depender de la nube, gracias a su tamano de 11,5 GB y a su soporte de tool calling.
- Agente autonomo de proposito general: al estar adaptado para Hermes y soportar tool calling y razonamiento multi-paso, puede encadenar llamadas a herramientas en flujos de automatizacion ejecutados localmente.
- Procesamiento de documentos con imagen: al aceptar entrada image-text-to-text, sirve para extraer y resumir informacion de capturas, diagramas o documentos escaneados en un Mac.
- Analisis de repositorios con contexto largo: sus 262K tokens permiten cargar fragmentos extensos de codigo o documentacion y hacer preguntas sobre ellos en una sola pasada.
- Prototipado rapido de aplicaciones LLM: al cargarse con mlx-lm, mlx-vlm o LM Studio en formato estandar, permite validar ideas en local antes de migrar a infraestructura mayor.
- Razonamiento matematico asistido: con un 44/50 en GSM8K-50, es util para resolver problemas aritmeticos de varios pasos en herramientas educativas o de analisis.
- Inferencia con latencia reducida en Mac: la cabeza MTP a 4 bits permite decodificacion especulativa y acelera la generacion en entornos con memoria limitada.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| GSM8K-50 (thinking off) | 44/50 |
| Tool call y codigo | 3/3 (pass) |
| Thinking | 2/2 (pass) |
| Concordancia top-1 con bf16 (LayerFit 2,5 bits) | 83,3 % |
| Concordancia top-1 con bf16 (2,5 bits estandar) | 75,9 % |
| Error KL (LayerFit 2,5 bits) | 0,1846 |
| Error KL (2,5 bits estandar) | 0,3877 |

Los datos de concordancia y error KL provienen del arnes propio del autor (solo pesos del modelo de lenguaje, frente a su merge bf16 del modelo base, con pasajes en ingles, otros idiomas, codigo, tool calls y matematicas). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 11,5 GB en disco; el autor indica que encaja en Macs de 16 GB dejando margen para macOS y prompts largos.
- Hardware objetivo: Apple Silicon exclusivamente (formato MLX). No es desplegable en GPU NVIDIA directamente sin conversion.
- En Mac de 16 GB se recomienda cerrar otras aplicaciones y limitar los prompts a unos miles de tokens; el autor sugiere `sudo sysctl iogpu.wired_limit_mb=12800` como ajuste temporal ("stretch").
- Builds alternativos del mismo autor: 2 bits (9,1 GB, solo texto) para 16 GB, 3 bits (13,1 GB) para 24 GB, 4 bits (16,5 GB) para 32 GB, y 6/8 bits para 48 GB o mas.
- Despliegue: mlx-lm (texto), mlx-vlm (imagen), LM Studio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Este modelo (LayerFit MLX 2,5 bits) | 27,78 mil millones | 262K | 2,5 bits LayerFit | Apache-2.0 | Apple Silicon (MLX) |
| Qwen3.8-27B-hermes-adapted-LayerFit-MLX-4bit (mismo autor) | 27,78 mil millones | 262K | 4 bits LayerFit | Apache-2.0 | Apple Silicon (MLX) |
| Qwen3.8-27B-hermes-adapted-LayerFit-MLX-2bit (mismo autor) | 27,78 mil millones | 262K | 2 bits LayerFit | Apache-2.0 | Apple Silicon (MLX) |
| harness-hub/Qwen3.8-27B-hermes-adapted (base) | 27,78 mil millones | 262K | bf16 | Apache-2.0 | Multiples |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion agresiva de 2,5 bits: la concordancia top-1 con el modelo bf16 es del 83,3 %, por lo que hay una degradacion medible frente al original.
- En Macs de 16 GB el margen de memoria es muy ajustado; el uso requiere cerrar aplicaciones y limitar la longitud del prompt.
- Solo funciona en Apple Silicon; no es utilizable en GPU NVIDIA ni en servidores x86 convencionales sin conversion.
- El modelo base es una adaptacion de terceros (harness-hub) del Qwen3.8-27B; el autor de esta cuantizacion no esta afiliado a Alibaba Cloud, al equipo Qwen ni a harness-hub.
- No hay informacion sobre sesgos, idiomas soportados ni tasas de alucinacion.
- Los benchmarks reportados son del arnes propio del autor (GSM8K-50, pruebas 3/3 y 2/2), no de suites estandarizadas.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar LICENSE y NOTICE del repositorio.
- LayerFit es una marca registrada de NetProjects; el uso del nombre puede estar restringido.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-LayerFit-MLX-2.5bit
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Build 2 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-LayerFit-MLX-2bit
- Build 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-LayerFit-MLX-3bit
- Build 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-LayerFit-MLX-4bit
- Build 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit
- Build 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-8bit
- Otros modelos del autor: https://huggingface.co/netprojects
- Web del autor: https://netprojects.com
