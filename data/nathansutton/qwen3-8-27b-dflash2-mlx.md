# nathansutton/Qwen3.8-27B-DFlash2-MLX

## Resumen

Qwen3.8-27B-DFlash2-MLX es un repositorio *sidecar* publicado por el usuario nathansutton: no contiene los pesos del modelo objetivo, sino el borrador (*drafter*) DFlash2 de decodificacion especulativa por bloques y los ficheros de tokenizer y plantilla de chat de Qwen3.8-27B. El drafter es un modelo de 1,9B de parametros cuantizado a 4 bits (group-64) en formato MLX, que lee el flujo residual del modelo objetivo en cinco capas muestreadas y propone un bloque completo de tokens en un unico forward.

Su funcion es acelerar la decodificacion de cualquier checkpoint de Qwen3.8-27B que se cargue con la herramienta `chad` (repositorio github.com/nathansutton/chad), en particular los ficheros GGUF de Unsloth, que se descargan desde otro repositorio. La verificacion se hace con una pasada batcheada del modelo objetivo y rejection sampling exacto: en modo greedy la salida es identica token a token a la decodificacion sin especulacion (salvo redondeo de kernel) y en muestreo se preserva la distribucion del modelo a cualquier temperatura.

El interes actual es practico: permite ejecutar un modelo de 27B con cuantizaciones agresivas en Macs de 24 GB de memoria unificada manteniendo ventanas de contexto de entre 74k y 170k tokens segun el fichero GGUF elegido, algo relevante para desarrollo de codigo y agentes en local sobre Apple Silicon. La licencia es Apache-2.0 y el metodo subyacente es el descrito en Chen et al., *DFlash: Block Diffusion for Flash Speculative Decoding* (arXiv:2602.06036).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Borrador de decodificacion especulativa DFlash2 (block diffusion) sobre transformer; lee el flujo residual del objetivo en cinco capas muestreadas y propone bloques de tokens |
| Parametros totales | 1,9B en el drafter; el modelo objetivo Qwen3.8-27B tiene 27B (pesos no incluidos en este repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Depende del fichero GGUF del objetivo y de la memoria de la maquina. Guia del autor en un Mac de 24 GB con drafter adjunto: ~170k tokens con `UD-Q2_K_XL`, ~138k con `UD-IQ3_XXS`, ~107k con `UD-IQ3_S`, ~74k con `UD-Q3_K_XL` |
| Tipos de cuantizacion | Drafter: 4 bits group-64 en formato MLX. Objetivo: ficheros GGUF de Unsloth (`UD-Q2_K_XL`, `UD-IQ3_XXS`, `UD-IQ3_S`, `UD-Q3_K_XL`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (drafter convertido desde z-lab/Qwen3.8-27B-DFlash2; tokenizer de Qwen3.8-27B, Alibaba Cloud, Apache-2.0) |
| Formato de pesos | safetensors en layout MLX (`dflash/`); el objetivo se carga como GGUF directamente, sin conversion |

## Arquitectura y entrenamiento

El componente principal es el drafter DFlash2, un modelo de 1,9B que implementa decodificacion especulativa por bloques basada en difusion discreta (*block diffusion*). En lugar de predecir token a token, lee el flujo residual del modelo objetivo en cinco capas muestreadas y propone un bloque entero de tokens en una sola pasada forward. El modelo objetivo verifica despues cada bloque en un unico forward batcheado aplicando rejection sampling exacto, de modo que la salida greedy es identica a la decodificacion sin especulacion y la salida muestreada conserva la distribucion original a cualquier temperatura.

Un detalle tecnico relevante es la independencia respecto a la cuantizacion del objetivo: como el drafter lee el flujo residual, que la cuantizacion de pesos del objetivo solo perturba ligeramente, un unico drafter entrenado contra la base en bf16 sirve para todas las cuantizaciones del modelo. El autor indica que los pesos del drafter se han convertido desde z-lab/Qwen3.8-27B-DFlash2 y que solo la cuantizacion y el layout MLX son propios. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO para el drafter.

El repositorio incluye ademas `tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja` y `generation_config.json` de Qwen3.8-27B. La plantilla de chat propia renderiza `reasoning_effort=medium` por defecto, mientras que la embebida en el GGUF usa `xhigh`; el autor la incluye porque un prompt byte-estable mantiene caliente la cache de prefijo de `chad`.

## Capacidades

- Decodificacion especulativa de bloques sobre Qwen3.8-27B: propone bloques de tokens verificados con rejection sampling exacto.
- Preservacion de la distribucion del objetivo en muestreo a cualquier temperatura, y equivalencia token a token en modo greedy (salvo redondeo de kernel).
- Compatibilidad con todas las cuantizaciones del objetivo: un unico drafter entrenado contra bf16 sirve para cualquier quant del mismo modelo.
- Aceleracion de generacion de texto y codigo, la etiqueta declarada del repositorio incluye `coding`.
- Perfil conversacional (`conversational`) heredado del modelo objetivo.
- Plantilla de chat propia con `reasoning_effort` configurable, pensada para cache de prefijo byte-estable.
- No incluye pesos del objetivo, por lo que no es un modelo autonomo: no genera texto por si solo sin un checkpoint de Qwen3.8-27B.
- Capacidades de vision, audio, tool calling o agentes: no disponibles en la informacion del repositorio; dependen del modelo objetivo, no del drafter.

## Casos de uso

- Aceleracion de inferencia local en Mac: adjuntar el drafter a cualquier GGUF de Qwen3.8-27B cargado con `chad` para reducir el coste por token en decodificacion, manteniendo la salida identica en greedy.
- Asistente de codigo en portatil Apple Silicon: con `uvx chad-code --model ~/models/Qwen3.8-27B-UD-Q3_K_XL.gguf` se obtiene un asistente de 27B con ~74k tokens de contexto en 24 GB de memoria unificada, adecuado para trabajar sobre repositorios medianos sin salir a la nube.
- Maximizacion de contexto en hardware limitado: usar `UD-Q2_K_XL` (9,8 GB de pesos) para alcanzar ~170k tokens de ventana, util en analisis de documentos largos o revisiones de codigo extensas donde prima el contexto sobre la fidelidad de la cuantizacion.
- Agentes multi-paso y tool calling sobre el modelo objetivo: el drafter no altera la distribucion del objetivo, por lo que los pipelines de llamadas a herramientas mantienen su comportamiento, con una latencia menor por token generado.
- Investigacion y evaluacion de decodificacion especulativa: el repositorio permite reproducir el metodo DFlash2 sobre un objetivo cuantizado y comparar configuraciones de cuantizacion y tamano de bloque frente a una linea base sin especulacion.
- Servicios conversacionales con cache de prefijo: al usar la plantilla de chat propia, byte-estable, se puede mantener caliente la cache de prefijo en conversaciones multi-turno con un system prompt fijo.
- Despliegue en entornos con restriccion de red o privacidad: al ejecutarse enteramente en local sobre Apple Silicon, los datos no salen de la maquina, lo que encaja en flujos con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ganancia de velocidad (tokens por segundo o factor de aceleracion) para el drafter. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (formato MLX, etiqueta `apple-silicon`). No hay soporte declarado para CUDA ni ROCm.
- Memoria: el autor documenta una guia para un Mac de 24 GB con el drafter adjunto. El repositorio del drafter ocupa 1,2 GB y se descarga en el primer uso.
- Pesos del objetivo segun fichero GGUF de Unsloth: `UD-Q2_K_XL` 9,8 GB, `UD-IQ3_XXS` 10,9 GB, `UD-IQ3_S` 12,0 GB, `UD-Q3_K_XL` 13,2 GB, en cada caso con el contexto indicado en la tabla de especificaciones.
- GPU recomendadas: no disponibles; el modelo esta pensado para memoria unificada de Apple Silicon, no para GPUs dedicadas tipo A100, H100 o RTX 4090.
- Despliegue: herramienta `chad` (`chad-code`), que descarga el repositorio automaticamente y construye un directorio de modelo alrededor del GGUF. Los ficheros del drafter viven en un subdirectorio `dflash/` precisamente para que `mlx-lm`, que busca `model*.safetensors` en la raiz, no los confunda con pesos de modelo base.
- Latencia y throughput: no disponibles; no se publican cifras de tokens por segundo ni factor de aceleracion.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / plataforma | Funcion | Licencia |
|---|---|---|---|---|
| nathansutton/Qwen3.8-27B-DFlash2-MLX | Drafter 1,9B (objetivo 27B, no incluido) | MLX safetensors, Apple Silicon | Drafter DFlash2 + tokenizer y plantilla de chat para Qwen3.8-27B | Apache-2.0 |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | no disponible (origen en bf16 del que se convierte este drafter) | Drafter DFlash2 original | Se debe respetar la licencia y citacion del release original |
| nathansutton/Qwen3.8-27B-Ternary-Bonsai-2-DFlash2-MLX | 27B (variante ternaria) | MLX, Apple Silicon | Variante ternaria de Qwen3.8-27B con drafter DFlash2 | no disponible |
| unsloth/Qwen3.8-27B-GGUF | 27B | GGUF | Pesos objetivo cuantizados que este drafter acelera | no disponible |

No se dispone de datos de rendimiento comparado entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a formato, funcion y licencia.

## Limitaciones y advertencias

- No es un modelo autonomo: no contiene los pesos del objetivo, solo el drafter, el tokenizer y la plantilla de chat. Sin un checkpoint de Qwen3.8-27B no genera nada.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la ganancia de velocidad ni de la degradacion de calidad con las distintas cuantizaciones.
- Dependencia de herramienta: el uso documentado pasa por `chad`; no se describe integracion con vLLM, TGI, llama.cpp ni Ollama.
- Solo Apple Silicon: el formato MLX y las etiquetas del repositorio implican que no es utilizable en GPUs NVIDIA o AMD sin conversion adicional.
- Cuantizaciones agresivas: las configuraciones que maximizan el contexto (`UD-Q2_K_XL`, `UD-IQ3_XXS`) implican perdida de calidad del objetivo, aunque el autor no cuantifica esa perdida.
- Idiomas soportados: no disponibles; depende de Qwen3.8-27B y no se declara en el repositorio.
- Alucinacion y sesgos: no se documentan en la informacion disponible; se heredan del modelo objetivo y no los corrige el drafter.
- Licencia y atribucion: el repositorio es Apache-2.0, pero el autor pide expresamente respetar la licencia y los terminos de citacion del release original de z-lab, y remite a `NOTICE.txt`.
- Contexto practico variable: la ventana util depende de la memoria real de la maquina; el autor indica que el "governor" de `chad` dimensiona la ventana a partir del equipo, por lo que las cifras de la tabla son orientativas para 24 GB.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad ni informes independientes de funcionamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nathansutton/Qwen3.8-27B-DFlash2-MLX
- Herramienta chad: https://github.com/nathansutton/chad
- Drafter original: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Pesos GGUF del objetivo (Unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Paper del metodo: *DFlash: Block Diffusion for Flash Speculative Decoding*, arXiv:2602.06036
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fichero de atribucion: `NOTICE.txt` en el propio repositorio
