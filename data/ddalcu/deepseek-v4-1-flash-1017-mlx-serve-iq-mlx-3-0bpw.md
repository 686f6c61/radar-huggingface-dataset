# ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-3.0bpw

## Resumen

DeepSeek-V4.1-Flash-1017 es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por DeepSeek, publicado bajo licencia MIT y orientado a generacion de texto, razonamiento, codigo y uso de herramientas en entornos de agentes. La version aqui descrita es un empaquetado cuantizado realizado por el usuario ddalcu para el runtime mlx-serve, pensado para ejecutarse en Apple Silicon de gama alta (concretamente en un Mac de 256 GB de memoria unificada). El modelo base tiene 40 capas, 384 expertos enrutados con 6 activos por token, mas un experto compartido, y una ventana de contexto de 1 millon de tokens.

El pack concreto es iQ-MLX 3.0 bpw, una cuantizacion GPTQ de 2/3 bits aplicada a los expertos enrutados, mientras que el tronco de atencion y el experto compartido se mantienen en MXFP8 tal y como se publicaron. Incluye tambien las etapas de borrador DSpark para decodificacion especulativa (activas por defecto) y la torre de vision de la release original. Con 66.715.052.754 parametros totales en safetensors, el modelo ocupa unos 209 GB residentes en memoria y requiere una descarga de 427 GB, incluyendo 203 GB de tablas Engram que se leen desde el SSD por token y no residen en RAM.

La relevancia de esta ficha radica en que documenta una de las pocas rutas practicas para ejecutar un modelo MoE de gran escala en hardware de consumo profesional (Mac Studio / MacBook Pro con memoria unificada maxima), sin GPUs de datacenter. La cuantizacion mixta (expertos GPTQ, tronco MXFP8) y la calibracion sobre trazas de agente y codigo buscan preservar el comportamiento del modelo original en tareas de tool calling y razonamiento, que son precisamente donde mas se degradan las cuantizaciones agresivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (model_type: deepseek_v41), 40 capas, 384 expertos enrutados con 6 activos + 1 experto compartido |
| Parametros totales | 66.715.052.754 |
| Parametros activos | no disponible (6 de 384 expertos enrutados por token, mas experto compartido; el numero exacto de parametros activos no se indica) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | GPTQ 2/3 bits en expertos enrutados (group size 64, damping 0.1, act-order en down projection); tronco de atencion y experto compartido en MXFP8; pack alternativo Lossless y pack pruned 2.25 bpw disponibles |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (runtime mlx-serve) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 40 capas, 384 expertos enrutados de los que se activan 6 por token, mas un experto compartido siempre activo, y una ventana de contexto de 1 millon de tokens. Incluye una torre de vision para entrada de imagenes y etapas de borrador DSpark para decodificacion especulativa, activas por defecto en este empaquetado. El modelo original fue entrenado por DeepSeek; la informacion disponible no detalla el volumen de tokens de preentrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

El trabajo de cuantizacion de este pack (version 1.1) aplica GPTQ sobre los expertos enrutados usando Hessianas recogidas de las activaciones del propio modelo publicado. La calibracion emplea 1.012 ventanas de 2.048 tokens (2,07 M tokens), cada una comenzando en un limite de turno y renderizada con el encoder de chat de DeepSeek, con tool calls como bloques DSML. La mezcla de calibracion incluye trayectorias de agente con tool calls nativos (SWE-Gym/OpenHands, SWE-agent), function calling (Hermes), codigo y razonamiento sobre codigo (OpenCodeReasoning), matematicas (OpenR1, solo respuestas verificadas), razonamiento (OpenThoughts3), chat (UltraChat), texto no ingles (Aya), WikiText-103 y codigo y documentacion reales; agente y codigo constituyen la mitad del corpus. Se aplica act-order solo en la proyeccion down (en gate/up empeoraba la metrica), y la asignacion de capas con gate/up a 3 bits se resuelve con un pequeno programa dinamico sobre los errores medidos a exactamente 3,00 bits por peso de experto: capas 4-9 y 11-14 en la version 1.1.

## Capacidades

- Generacion de texto en ingles y chino, con soporte declarado para ambos idiomas.
- Razonamiento multi-paso y modo de pensamiento (el pack se evaluo especificamente sobre trazas de razonamiento).
- Generacion y razonamiento sobre codigo, incluyendo tareas de reparacion de software (el dataset de calibracion incluye SWE-Gym/OpenHands y SWE-agent).
- Tool calling y function calling nativo, con formato DSML para llamadas a herramientas.
- Uso en agentes con trayectorias multi-turno y llamadas a herramientas encadenadas.
- Entrada de imagenes mediante la torre de vision de la release (soportada en mlx-serve 26.10.3 y posteriores).
- Decodificacion especulativa mediante las etapas de borrador DSpark, activada por defecto.
- Matematicas y razonamiento verificable (calibrado con OpenR1 y OpenThoughts3).

## Casos de uso

- Agentes de ingenieria de software: el modelo puede ejecutar bucles de edicion de codigo, ejecucion de tests y correccion de errores dentro de un agente tipo SWE-agent u OpenHands, aprovechando el contexto de 1 M tokens para mantener el estado del repositorio y el historial de la sesion. La calibracion del pack esta sesgada hacia estas trazas, lo que reduce la degradacion en tool calling.
- Asistente de codigo en local para equipos con Mac de 256 GB: integrable en un flujo de trabajo de desarrollo sin enviar codigo propietario a la nube, con una calidad de cuantizacion documentada (KLD 0.046 en la porcion de codigo del conjunto de evaluacion).
- Automatizacion de atencion al cliente multi-turno: la ventana de 1 M tokens permite mantener conversaciones largas con historial completo y documentos adjuntos, y el soporte de tool calling permite consultar sistemas internos (pedidos, tickets) durante la conversacion.
- Procesamiento de documentacion tecnica bilingue ingles-chino: el modelo esta declarado para ambos idiomas y puede resumir, traducir o extraer informacion de manuales y especificaciones extensas que quepan en el contexto.
- Analisis de imagenes con texto asociado: gracias a la torre de vision, puede extraer informacion de capturas, diagramas o documentos escaneados y combinarla con razonamiento textual en un mismo prompt.
- Razonamiento matematico y verificacion de respuestas: util para pipelines de generacion de problemas resueltos, comprobacion de calculos o asistencia en tareas de analisis cuantitativo, con la salvedad de que el pack prioriza fidelidad al modelo original sobre precision absoluta.
- Prototipado de agentes con function calling en local: permite iterar sobre disenos de herramientas y prompts sin coste de API, usando el formato DSML nativo del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card proporciona metricas de fidelidad de la cuantizacion frente al checkpoint original, no de capacidad absoluta:

| Metrica | 1.1 (este pack) | 1.0 experts, tronco original | 1.0 |
|---|---|---|---|
| KLD global | 0,0963 | 0,1466 | 0,1567 |
| KLD agente | 0,169 | 0,250 | 0,271 |
| KLD codigo | 0,046 | 0,065 | 0,070 |
| KLD herramientas | 0,045 | 0,085 | 0,081 |
| KLD razonamiento | 0,019 | 0,034 | 0,036 |
| KLD chat | 0,085 | 0,118 | 0,128 |
| KLD multilingue | 0,117 | 0,212 | 0,218 |
| Top-1 global | 92,64 % | 91,02 % | 90,59 % |
| Perplejidad vs release | +0,6 % | no publicado | -4,2 % |

La evaluacion se realizo sobre 46 ventanas reservadas de 2.048 tokens (11.776 posiciones puntuadas) contra los logits del checkpoint original, con KLD calculada sobre el vocabulario completo de 129.280 tokens. En los tokens generados por el propio asistente, la KLD de 1.1 es 0,038 frente a 0,071 de 1.0.

Rendimiento en M5 Ultra (256 GB), un modelo cargado, mlx-serve 26.11.2:

| Contexto | Decodificacion (DSpark activo) | Prefill |
|---|---|---|
| ~1 k | 103,2 tok/s | 1.663 tok/s (valor truncado en la fuente) |

## Requisitos de hardware

- Memoria residente: aproximadamente 209 GB para este pack; la carga requiere unos 215 GB libres.
- Descarga: 427 GB, de los cuales 203 GB corresponden a tablas Engram que se leen desde el SSD por token y no residen en memoria.
- Hardware objetivo: Mac con 256 GB de memoria unificada (M5 Ultra en las mediciones publicadas). Para 128 GB existe el pack pruned de 192 expertos a 2,25 bpw (92 GB residentes, 296 GB de descarga), con calidad inferior especialmente en texto no ingles. Para 512 GB existe el pack Lossless (288 GB residentes, 477 GB de descarga).
- GPU de datacenter: no se documenta soporte para A100, H100 ni RTX 4090 en esta informacion; el runtime es mlx-serve, especifico de Apple Silicon.
- Consumer GPU: no aplica en el sentido habitual; el modelo no cabe en GPUs de consumo con 24 GB ni 48 GB de VRAM.
- Despliegue: mlx-serve 26.10.3 o posterior, con el comando `mlx-serve --model ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-3.0bpw --serve`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 103,2 tok/s de decodificacion a contexto de ~1 k tokens con DSpark activo; prefill de 1.663 tok/s (dato truncado en la fuente) en M5 Ultra.

## Comparativa con modelos similares

No se dispone de datos de benchmarks absolutos ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a los packs alternativos del mismo modelo base:

| Modelo / pack | Parametros | Contexto | Memoria residente | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iQ-MLX 3.0 bpw (este pack) | 66,7 B totales | 1 M tokens | 209 GB | MIT | Hugging Face, mlx-serve |
| Lossless | no disponible | 1 M tokens | 288 GB | MIT | Hugging Face, mlx-serve |
| iQ-MLX-Pruned192 2.25 bpw | no disponible (192 de 384 expertos) | 1 M tokens | 92 GB | MIT | Hugging Face, mlx-serve |

No se dispone de informacion sobre modelos de otros fabricantes con los que comparar parametros, contexto y rendimiento de forma rigurosa.

## Limitaciones y advertencias

- La cuantizacion introduce desviacion respecto al modelo original: KLD global de 0,0963 y top-1 del 92,64 %, con degradacion mayor en tareas de agente (KLD 0,169) y texto multilingue (KLD 0,117) que en razonamiento (0,019) o herramientas (0,045).
- El pack pruned de 192 expertos es explicitamente descrito como mas debil, especialmente en texto no ingles; no debe usarse como sustituto equivalente del modelo completo.
- Idiomas declarados: solo ingles y chino. El rendimiento en castellano no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan medidas especificas de mitigacion en esta informacion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base original (deepseek-ai/DeepSeek-V4.1-Flash-1017) antes de desplegar en produccion.
- Requisitos de hardware muy restrictivos: 256 GB de memoria unificada y 215 GB libres para la carga; el cierre de aplicaciones grandes es necesario segun la model card.
- Dependencia de un runtime especifico (mlx-serve 26.10.3+) y de hardware Apple Silicon; no hay soporte documentado para CUDA ni para otros servidores de inferencia.
- El rendimiento de prefill publicado esta truncado en la fuente, por lo que no puede citarse con precision.
- Las tablas Engram (203 GB) se leen desde el SSD en cada token, lo que introduce dependencia del ancho de banda de almacenamiento y puede afectar la latencia en discos lentos.

## Enlaces

- Hugging Face (este pack): https://huggingface.co/ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-3.0bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Pack Lossless: https://huggingface.co/ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-Lossless
- Pack pruned 192 expertos 2.25 bpw: https://huggingface.co/ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-Pruned192-2.25bpw
- Runtime mlx-serve: https://mlxserve.com
- Grafico de calidad y velocidad del pack: https://huggingface.co/ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-3.0bpw/resolve/main/assets/v11-card-chart.png
