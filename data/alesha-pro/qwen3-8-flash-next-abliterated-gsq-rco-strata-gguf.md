# alesha-pro/Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF

## Resumen

Este repositorio es un paquete de cuantizaciones GGUF de Qwen3.8-Flash-Next, un modelo multimodal (pipeline image-text-to-text) desarrollado por el equipo Qwen. El autor de la ficha, alesha-pro, no ha entrenado ni cuantizado los pesos: los ha copiado byte a byte de ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF (revision ed59f92082b1e93c0e96d60a8b11aab089b52f09), que contiene las cuatro cuantizaciones GSQ-RCO (Q2_0, IQ2_XS, IQ3_XXS, IQ3_S) producidas por el Deep Algorithms and Systems Lab del ISTA.

El valor anadido del repositorio es un unico fichero de 480 KB, Huihui-Qwen3.8-Flash-Next-refusal-direction-r.gguf, que actua como vector de control para el motor Strata. En lugar de reescribir los pesos, Strata resta en tiempo de ejecucion una direccion r del residual stream tras cada capa afectada (h = h - (h · r) r), de modo que el modelo deja de rechazar peticiones sin modificar los pesos originales. El vector deriva de la edicion rank-one aplicada por huihui-ai sobre 144 tensores de escritura residual del checkpoint abliterated.

El modelo base tiene 120.320 parametros registrados en los metadatos de safetensors del modelo original y la mezcla de cuantizaciones ocupa entre 66,4 GB y 83,6 GB, con el grueso de los expertos en RAM del sistema y solo una parte en GPU. Esta pensado para ejecutarse en un PC con una GPU consumer de 12 GB o mas (se midio en una RTX 3090) y soporta entrada de imagen, tool calling estilo OpenAI y Anthropic, y una capa MTP de borrador para decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la informacion disponible; la model card menciona expertos (MoE) y una capa MTP de borrador, ademas de un proyector de vision |
| Parametros totales | 120.320 segun metadatos de safetensors del modelo base (el tamano de los ficheros, 66,4-83,6 GB, es coherente con ~120.000 millones) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible; se reportan mediciones con prompts de 32K y hasta 131K tokens |
| Tipos de cuantizacion | GSQ-RCO en cuatro tamanos: Q2_0 (2,40 bits/peso), IQ2_XS (2,50), IQ3_XXS (3,00), IQ3_S (3,50) |
| Idiomas soportados | No disponibles |
| Licencia | qwen-community-license-1.0 (campo license: other en la model card) |
| Formato de pesos | GGUF (dos shards por tamano; el shard 2 es la tabla de n-gramas y es identico en las cuatro carpetas), mas mmproj-Qwen3.8-Flash-Next-BF16.gguf para vision y el fichero de direccion de rechazo en GGUF |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base mas alla de tres indicios: existe una tabla de n-gramas empaquetada como segundo shard de cada cuantizacion, hay "expertos" que se retienen en RAM durante la ejecucion (lo que apunta a una arquitectura de mezcla de expertos), y el setup descarga una capa MTP de borrador de unos 6 GB desde el checkpoint original de Qwen para acelerar la decodificacion de forma especulativa. Tambien se incluye un proyector de vision en BF16 (mmproj), coherente con el pipeline image-text-to-text. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica relevante de este repositorio no esta en el entrenamiento sino en la inferencia. Las cuantizaciones GSQ-RCO provienen de los articulos GSQ (arXiv:2604.18556) y RCO (arXiv:2605.00649) de ISTA-DASLab. Sobre ellas, alesha-pro anade un vector de control que el motor Strata aplica como proyeccion: tras cada capa del rango indicado, se resta la componente de la direccion r de todo el residual stream. La direccion r procede del checkpoint Huihui-Qwen3.8-Flash-Next-abliterated, donde huihui-ai modifico 144 tensores de escritura residual con una edicion rank-one. La diferencia respecto a esa edicion horneada en los pesos es doble: Strata proyecta el stream completo (tambien afecta a las contribuciones de embedding y de n-gramas) y la capa 0 no puede ser steerada. Con `"experimental_speed_projection": false` el motor ejecuta el modelo original sin modificar.

## Capacidades

- Generacion de texto y razonamiento multimodal: pipeline image-text-to-text con proyector de vision BF16, por lo que acepta imagenes ademas de texto.
- Capacidad de abliteracion: el vector de control elimina el comportamiento de rechazo durante la ejecucion, sin tocar los pesos. Funciona igual en los cuatro tamanos.
- Decodificacion especulativa mediante capa MTP: el setup descarga un borrador de ~6 GB desde el checkpoint de Qwen.
- Servidor compatible con API de OpenAI en `/v1` y de Anthropic en `/v1/messages`.
- Modelado de n-gramas: el shard 2 de cada cuantizacion es una tabla de n-gramas compartida por los cuatro tamanos.
- Contexto largo en la practica: se reportan pruebas con prompts de hasta 131K tokens.
- Tool calling / function calling: no se documenta explicitamente en la informacion disponible, aunque el servidor expone las rutas compatibles con OpenAI y Anthropic.
- Idiomas: no disponibles.
- Ajuste de la fuerza y el rango de capas del vector de control (`--control-vector-scaled ...:1.0` y `--control-vector-layer-range`), con dos configuraciones probadas: capas 4-44 y capas 1-47.

## Casos de uso

- Despliegue de un modelo de ~120.000 millones de parametros en una sola GPU consumer: gracias a GSQ-RCO y a Strata, un equipo con una RTX 3090 (24 GB) y 48-64 GB de RAM puede servir IQ2_XS o IQ3_S sin clúster multi-GPU.
- Asistentes sobre documentos e imagenes: el pipeline image-text-to-text y los prompts de hasta 131K tokens permiten procesar capturas, diagramas o paginas escaneadas junto con instrucciones largas en una misma conversacion.
- Investigacion sobre alineacion y rechazo: el repositorio separa pesos y direccion de control, de modo que un investigador puede comparar la misma red con la proyeccion activada y desactivada (`experimental_speed_projection: false`) sin volver a descargar ni recomprimir pesos.
- Backend local compatible con OpenAI y Anthropic: al exponer `/v1` y `/v1/messages`, se puede sustituir una API en la nube por el servidor local en herramientas que ya hablan esos protocolos.
- Evaluacion de cuantizaciones de muy baja precision: con cuatro tamanos (2,40 a 3,50 bits por peso) y metricas de divergencia KL frente a BF16, es un banco de pruebas para medir el coste de comprimir un MoE grande.
- Generacion asistida por n-gramas y decodificacion especulativa: la tabla de n-gramas y la capa MTP permiten estudiar ganancias de throughput en prompts largos en hardware limitado.
- Prototipado en un solo equipo para aplicaciones que requieren contexto de 32K o mas, con velocidades medidas de 59 a 87 tokens/s en una RTX 3090.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo aporta medidas de fidelidad frente al modelo BF16 de referencia y de velocidad, realizadas en una RTX 3090:

| Tamano | Bits/peso | Descarga | Expertos en RAM | KL frente a BF16 Huihui | Top-1 igual que BF16 | Decodificacion con prompt de 32K |
|---|---:|---:|---:|---:|---:|---:|
| Q2_0 | 2,40 | 66,4 GB | 34 GB | no medido | no medido | no medido (ISTA-DASLab lo describe como el mas rapido de los cuatro) |
| IQ2_XS | 2,50 | 68,0 GB | 35,5 GB | 0,193 | 88% | 87 tokens/s |
| IQ3_XXS | 3,00 | 75,8 GB | 43 GB | no medido | no medido | no medido |
| IQ3_S | 3,50 | 83,6 GB | 50 GB | 0,075 | 93% | 59 tokens/s |

Segun el autor, IQ3_S permanece mas cerca del modelo completo y IQ2_XS decodifica entre un 45% y un 70% mas rapido en prompts de hasta 131K tokens.

## Requisitos de hardware

- GPU: se requiere una tarjeta NVIDIA o AMD con 12 GB de VRAM o mas. Las mediciones del autor se hicieron en una RTX 3090.
- RAM del sistema: Strata pide 64 GB de PC para IQ3_S e IQ3_XXS y 48 GB para Q2_0 e IQ2_XS. Los expertos retenidos en RAM son 34 GB (Q2_0), 35,5 GB (IQ2_XS), 43 GB (IQ3_XXS) y 50 GB (IQ3_S).
- Almacenamiento: 66,4 GB (Q2_0), 68,0 GB (IQ2_XS), 75,8 GB (IQ3_XXS) y 83,6 GB (IQ3_S), mas el proyector de vision BF16, el fichero de direccion de rechazo de 480 KB y aproximadamente 6 GB de capa MTP que descarga el setup.
- Cabe en GPU consumer: si, con el esquema de offload de expertos a RAM; en una GPU de 12 GB o mas. No se documentan pruebas en GPUs de datacenter (A100, H100).
- Opciones de despliegue: el motor Strata (clonado desde github.com/Niko1221/Strata) es el unico que implementa el modo de proyeccion del vector de control. llama.cpp puede cargar los GGUF, pero su `--control-vector` estandar suma el vector en lugar de proyectarlo, por lo que no reproduce el efecto abliterated. El servidor expone `/v1` (OpenAI) y `/v1/messages` (Anthropic).
- Throughput medido: 87 tokens/s con IQ2_XS y 59 tokens/s con IQ3_S en decodificacion con prompt de 32K sobre RTX 3090. No se publican datos de latencia de prefill ni de throughput en GPUs distintas.
- Nota de despliegue: el autor no ejecuto el instalador de principio a fin; construyo el motor desde el codigo fuente fijado y lo arranco con los mismos argumentos que escribe setup (`--control-vector-layer-range 4 44 --cvec-mode project --cvec-dir per-layer`).

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Abliterado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repositorio (alesha-pro, GSQ-RCO + Strata) | ~120.320 segun metadatos | GGUF, 4 tamanos de 2,40 a 3,50 bits | no disponible (pruebas hasta 131K) | Si, por proyeccion en runtime, pesos originales | qwen-community-license-1.0 | 3.718 descargas, 29 likes, repo de 208,4 GB |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | el mismo | GGUF, 4 tamanos | no disponible | No | la del modelo base | Modelo base del que se copian los pesos |
| Huihui-Qwen3.8-Flash-Next-abliterated (huihui-ai) | el mismo | no disponible | no disponible | Si, edicion rank-one horneada en 144 tensores | no disponible | Origen de la direccion de rechazo |
| alesha-pro/Huihui-Qwen3.8-Flash-Next-abliterated-exl3-4bit-hq_h6_ng6 | el mismo | EXL3 4 bits | no disponible | Si, edicion de fuerza 1.0 horneada en los pesos | no disponible | Misma autora, enfoque alternativo |

Frente al checkpoint de huihui-ai, este repositorio mantiene los pesos intactos y aplica la direccion en el motor; frente a la version EXL3 de la misma autora, que hornea la edicion de fuerza 1.0 en los pesos, aqui se puede desactivar la proyeccion y recuperar el comportamiento original.

## Limitaciones y advertencias

- El proposito declarado del vector de control es eliminar los rechazos del modelo. Esto desactiva las salvaguardas de seguridad del checkpoint original y es un riesgo directo en cualquier despliegue orientado al publico.
- Los pesos no son del autor del repositorio: son copias byte a byte de ISTA-DASLab. Cualquier cita o atribucion debe dirigirse a los articulos GSQ y RCO, no a este repositorio.
- De los cuatro tamanos, solo se han medido IQ3_S e IQ2_XS. Q2_0 e IQ3_XXS se incluyen tal como los publico ISTA-DASLab y no han sido ejecutados por el autor.
- IQ2_XS presenta una divergencia KL de 0,193 y solo un 88% de coincidencia en top-1 frente a BF16; en tareas sensibles a la precision (codigo, matematicas, salidas estructuradas) puede degradar de forma apreciable.
- El modo de proyeccion del vector requiere el motor Strata. En llama.cpp estandar el fichero de direccion se comporta como una suma, no como una proyeccion, por lo que el resultado no es el mismo.
- La capa 0 no puede ser steerada, y la proyeccion afecta a todo el residual stream (incluidas las contribuciones de embedding y n-gramas), a diferencia de la edicion horneada en pesos.
- Licencia qwen-community-license-1.0, marcada como `license: other` en la model card. Es imprescindible revisar sus condiciones antes de cualquier uso comercial, especialmente al tratarse de una modificacion que altera el comportamiento de seguridad del modelo original.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion. Tampoco hay resultados de benchmarks academicos que permitan situar el modelo frente a alternativas.
- El autor advierte que no probo el instalador completo de Strata de principio a fin; el flujo de instalacion puede fallar en entornos no validados.
- Requisitos de memoria altos para un solo equipo: 48-64 GB de RAM mas 12 GB o mas de VRAM, con descargas de 66 a 84 GB por tamano.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/alesha-pro/Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF
- Cuantizaciones originales de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint abliterated de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Cuantizaciones EXL3 de la misma autora: https://huggingface.co/alesha-pro/Huihui-Qwen3.8-Flash-Next-abliterated-exl3-4bit-hq_h6_ng6
- Motor Strata: https://github.com/Niko1221/Strata
- Articulo GSQ: https://arxiv.org/abs/2604.18556
- Codigo GSQ: https://github.com/IST-DASLab/GSQ
- Articulo RCO: https://arxiv.org/abs/2605.00649
- Codigo RCO: https://github.com/IST-DASLab/RCO
