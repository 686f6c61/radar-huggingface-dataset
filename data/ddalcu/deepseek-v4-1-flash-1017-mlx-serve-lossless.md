# ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-Lossless

## Resumen

DeepSeek-V4.1-Flash-1017-MLX-Serve-Lossless es un repack sin perdida (lossless, bit-exact) del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicado por el usuario ddalcu en Hugging Face. El pack no re-cuantiza ningun peso: mantiene los expertos enrutados en FP4 (MXFP4), el tronco en FP8 y el cabezal MTP y la torre de vision tal cual salieron en el lanzamiento original. Su proposito es permitir la ejecucion del modelo en Macs con 512 GB de memoria unificada mediante los runtimes MLX (mlx-serve y oMLX).

El modelo base es un MoE de la familia DeepSeek con arquitectura `deepseek_v41`, que incorpora una novedad destacable: tablas "Engram" de unos 189 GB que se leen desde el SSD por token en lugar de residir en memoria. Con 92.195.449.554 parametros totales contados en los safetensors, se trata de un modelo de gran escala orientado a generacion de texto en ingles y chino.

Este pack funciona ademas como referencia de calidad: los packs cuantizados del mismo autor (por ejemplo, la version iQ-MLX a 3.0 bpw) se puntuan comparandolos contra esta version lossless. Es relevante para usuarios de hardware Apple Silicon de gama alta que quieren ejecutar modelos frontier en local sin perdida de precision respecto a la distribucion original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (model_type: deepseek_v41), con torre de vision y cabezal MTP |
| Parametros totales | 92.195.449.554 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ninguna aplicada en este pack (lossless): FP4 (MXFP4) en expertos enrutados, FP8 en tronco, bf16 denso en `head` y `wo_a` |
| Idiomas soportados | Ingles, chino |
| Licencia | MIT |
| Formato de pesos | safetensors (layout MLX, compatible con mlx-serve y oMLX) |

## Arquitectura y entrenamiento

La arquitectura es de tipo MoE (mixture of experts) con model_type `deepseek_v41`, la generacion actual de la familia DeepSeek. El pack conserva la distribucion de precision del lanzamiento original: los expertos enrutados en FP4 (formato MXFP4), el tronco principal en FP8, y los tensores `head` y `wo_a` almacenados en bf16 denso porque oMLX los lee en ese formato. Incluye tambien el cabezal MTP (multi-token prediction) y la torre de vision del modelo base.

Un elemento tecnico distintivo son las tablas Engram (directorio `engram/`, unos 189 GB): a diferencia del resto del modelo, no residen en memoria, sino que se leen desde el SSD por token durante la inferencia. Esto reduce la huella residente a unos 288 GB, pero hace que el rendimiento dependa fuertemente de la velocidad del almacenamiento: segun el autor, usar Engram desde un disco externo cuesta aproximadamente un 27% en prefill.

Sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO), no se ha publicado informacion en la model card de este repositorio. Al ser un repack bit-exact, no se ha realizado ningun entrenamiento adicional: la etiqueta de finetune remite al modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017.

## Capacidades

- Generacion de texto (pipeline text-generation) en ingles y chino.
- Capacidades de vision: el pack incluye la torre de vision del modelo base, aunque la model card no detalla su uso.
- Decodificacion multi-token (MTP head) incluida en el pack, lo que sugiere soporte de decodificacion especulativa en los runtimes compatibles.
- Arquitectura MoE con expertos en FP4, orientada a inferencia eficiente en hardware con memoria unificada.
- Compatibilidad con los runtimes MLX: mlx-serve y oMLX (los nombres de pesos siguen las convenciones de mlx-lm y oMLX).
- No hay informacion en la model card sobre tool calling, agentes ni modo de razonamiento explicito.

## Casos de uso

- Inferencia local sin perdida de precision en Mac Studio de 512 GB: el caso de uso principal del pack, para desarrolladores que necesitan la calidad exacta del lanzamiento original de DeepSeek en Apple Silicon.
- Referencia de evaluacion de cuantizaciones: al ser el pack de referencia del autor, sirve como baseline para medir la degradacion de los packs cuantizados (como la version iQ-MLX a 3.0 bpw para Macs de 256 GB).
- Servidor de inferencia local tipo OpenAI: mediante `mlx-serve --serve` se puede levantar un endpoint local para aplicaciones que consumen LLMs via API.
- Procesamiento de entradas multimodales: al incluir la torre de vision, en principio puede integrarse en flujos que combinen imagen y texto, sujeto al soporte del runtime.
- Experimentacion con arquitecturas MoE y tablas Engram: util para investigadores que quieran estudiar el comportamiento de la lectura de pesos desde SSD por token y su impacto en prefill.
- Generacion de texto en chino e ingles en entornos sin GPU de datacenter: alternativa a despliegues en nube para cargas de trabajo sensibles a la privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento publicado es del propio pack: mantener las tablas Engram en el SSD interno frente a un disco externo supone aproximadamente un 27% menos de coste en prefill, segun mediciones del autor.

## Requisitos de hardware

- Memoria unificada residente: unos 288 GB (todo excepto las tablas Engram). Diseñado exclusivamente para Macs con 512 GB de memoria unificada; el autor indica que no han conseguido cargarlo en una maquina de 512 GB, y recomienda la version cuantizada iQ-MLX-3.0bpw (209 GB residentes) para Macs de 256 GB.
- Almacenamiento: unos 477 GB de descarga y 512,2 GB de tamano de repositorio. Imprescindible SSD interno: las tablas Engram (unos 189 GB) se leen desde disco por token, y en un disco externo el prefill empeora alrededor de un 27%.
- GPUs de datacenter: no aplicable; este pack es especifico para el ecosistema MLX en Apple Silicon. Para GPU NVIDIA habria que usar los pesos originales de deepseek-ai.
- Runtimes de despliegue: mlx-serve (comando `mlx-serve --model ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-Lossless --serve`) y oMLX (apuntando a la carpeta descargada). La aplicacion asociada esta en MLXServe.com.
- Latencia y throughput: no disponibles; el unico dato cuantitativo es la penalizacion del 27% en prefill con Engram en SSD externo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Precision | Residente | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-Lossless | 92.195.449.554 | Lossless (MXFP4 expertos, FP8 tronco) | ~288 GB + 189 GB Engram en SSD | MIT | Publico en Hugging Face |
| ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-3.0bpw | no disponible | Cuantizado iQ-MLX a 3,0 bpw | ~209 GB | MIT | Publico en Hugging Face |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible | Lanzamiento original (FP4/FP8) | no disponible | MIT | Publico en Hugging Face |

## Limitaciones y advertencias

- Requisito de hardware muy restrictivo: solo es viable en Macs con 512 GB de memoria unificada, y el propio autor admite no haber podido cargarlo en una maquina de esas caracteristicas. Para 256 GB hay que usar el pack cuantizado.
- Dependencia critica del SSD interno: con Engram en disco externo el prefill se degrada cerca de un 27%, lo que limita la portabilidad del despliegue.
- Idiomas limitados a ingles y chino segun la model card; el rendimiento en otros idiomas no esta documentado.
- No hay benchmarks publicados ni datos de parametros activos, longitud de contexto o rendimiento de inferencia, lo que dificulta evaluar el modelo antes de descargar casi 500 GB.
- Riesgo de alucinacion y sesgos: heredados del modelo base; este repositorio no aporta informacion sobre mitigaciones ni evaluaciones de seguridad.
- Licencia MIT: sin restricciones de uso comercial relevantes, pero las condiciones del modelo base (deepseek-ai/DeepSeek-V4.1-Flash-1017) deben revisarse en el repositorio original.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha, de un autor individual: conviene verificar la integridad de los pesos (el pack afirma ser bit-exact respecto al original) antes de uso serio.

## Enlaces

- Ficha del pack lossless: https://huggingface.co/ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-Lossless
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Pack cuantizado iQ-MLX-3.0bpw (para Macs de 256 GB): https://huggingface.co/ddalcu/DeepSeek-V4.1-Flash-1017-MLX-Serve-iQ-MLX-3.0bpw
- Aplicacion mlx-serve: https://mlxserve.com
