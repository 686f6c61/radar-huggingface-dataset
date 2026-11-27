# CodeImageGen/CIG-9B-IPR

## Resumen

CIG-9B-IPR es un modelo de generacion de imagenes basado en codigo, desarrollado por CodeImageGen. En lugar de producir pixeles directamente, el modelo escribe un programa JavaScript que, al renderizarse en Chrome headless, genera la imagen final. Se construye a partir de Qwen/Qwen3.5-9B mediante un ajuste fino supervisado (SFT) seguido de optimizacion con GRPO usando una recompensa IPR (Image-Program Reward) en la que el juez evalua conjuntamente el programa y la imagen renderizada.

El modelo resuelve el problema de la generacion de imagenes text-to-image desde un enfoque programatico: la salida es codigo ejecutable, lo que permite control preciso, edicion posterior y trazabilidad de la imagen generada. Con 8.953.803.264 parametros (aproximadamente 9B) y pesos en fp16 fusionados, hereda la arquitectura y el contexto del modelo base Qwen3.5-9B, si bien la informacion disponible no detalla el contexto exacto.

Es relevante por su enfoque poco comun (generacion de imagenes via codigo), por el uso de GRPO con una recompensa multimodal que evalua programa e imagen conjuntamente, y por incluir una cabeza MTP opcional para decodificacion especulativa. La licencia Apache 2.0 facilita su uso comercial. El modelo se publico en noviembre de 2026 y cuenta con variantes de 27B y otras configuraciones de recompensa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-9B (tag `qwen3_5_text`), ajustado para generacion de codigo JavaScript |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16, fusionados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye `model-mtp.safetensors` opcional para decodificacion especulativa) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer de aproximadamente 9B parametros, y se ajusta en dos fases: primero un SFT (supervised fine-tuning) y despues GRPO (Group Relative Policy Optimization). La recompensa empleada es IPR, en la que un juez evalua simultaneamente el programa JavaScript generado y la imagen resultante de renderizarlo en Chrome headless. Los pesos se publican fusionados en fp16.

Como innovacion destacable, el repositorio incluye `model-mtp.safetensors`, una cabeza MTP (multi-token prediction) para decodificacion especulativa, marcada como opcional. El modelo esta entrenado para emitir codigo JavaScript como representacion intermedia de la imagen, lo que vincula la generacion de texto con un pipeline de renderizado externo. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el uso de otras tecnicas como RLHF o DPO.

## Capacidades

- Generacion de imagenes mediante codigo: produce programas JavaScript que, renderizados en Chrome headless, dan lugar a la imagen descrita en el prompt.
- Generacion de texto y conversacion: hereda las capacidades del modelo base Qwen3.5-9B (pipeline `text-generation`, tag `conversational`).
- Generacion de codigo en JavaScript orientada a la creacion de graficos y escenas.
- Decodificacion especulativa opcional mediante la cabeza MTP incluida.
- Integracion con el ecosistema transformers y endpoints compatibles (`endpoints_compatible`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling, agentes o vision: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de imagenes programaticas en produccion: el modelo escribe JavaScript que se renderiza en Chrome headless, lo que permite generar ilustraciones o graficos de forma reproducible y auditable a partir de un prompt.
- Prototipado de assets graficos editables: al ser la salida codigo, un equipo puede modificar parametros (colores, formas, posiciones) sin regenerar la imagen desde cero.
- Pipelines de generacion de contenido web: integracion del codigo generado en entornos de renderizado para producir imagenes bajo demanda dentro de aplicaciones web.
- Investigacion en recompensas multimodales: sirve como referencia para estudiar el efecto de recompensas que evaluan conjuntamente programa e imagen (IPR) frente a otras variantes (IR, PR, avgR).
- Evaluacion comparativa de generacion text-to-image basada en codigo: util para contrastar con las variantes de 27B del mismo autor y con modelos de difusion, usando GenEval2.
- Despliegue con decodificacion especulativa: la cabeza MTP opcional permite experimentar con aceleracion de inferencia en entornos que la soporten.
- Fine-tuning posterior: al estar bajo Apache 2.0 y en formato safetensors, puede adaptarse a dominios concretos (diagramas tecnicos, visualizaciones de datos) mediante SFT adicional.

## Benchmarks y rendimiento

| Benchmark | Metrica | CIG-9B-IPR |
|---|---|---|
| GenEval2 | GM | 38.4 |
| GenEval2 | AM | 69.7 |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos fp16 y ~9B parametros, se requieren aproximadamente 18 GB solo para los pesos, mas memoria para el contexto y el renderizador; en cuantizaciones de 8 bits o 4 bits (no publicadas oficialmente) la huella se reduciria, pero no hay datos confirmados.
- GPU recomendadas: A100 40/80 GB, H100 o GPUs con 24 GB o mas para fp16.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas (por ejemplo RTX 3090/4090) para fp16, siempre que se gestione el contexto; en GPUs de 16 GB requeriria cuantizacion no disponible oficialmente.
- Opciones de despliegue: transformers (libreria declarada); el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no se confirman en la informacion disponible. Requiere ademas un renderizador Chrome headless y el entorno del repositorio del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto | Licencia | Benchmark GenEval2 |
|---|---|---|---|---|---|
| CIG-9B-IPR | ~9B | Generacion de imagenes via codigo JS, GRPO con recompensa IPR | no disponible | Apache 2.0 | GM 38.4 / AM 69.7 |
| CIG-27B-IPR | ~27B (no confirmado) | Igual enfoque, mayor tamano | no disponible | no disponible | no disponible |
| CIG-9B-SFT | ~9B (no confirmado) | Solo SFT, sin GRPO | no disponible | no disponible | no disponible |
| Modelos de difusion text-to-image | Variable | Generacion directa de pixeles | Variable | Variable | no disponible |

Los datos de las variantes CIG-27B y CIG-9B-SFT no se detallan en la informacion proporcionada; solo se enlazan desde la model card.

## Limitaciones y advertencias

- La generacion depende de un renderizador externo (Chrome headless) y del entorno del repositorio del autor; sin ese pipeline el modelo no produce imagenes.
- Riesgo de que el codigo JavaScript generado sea incorrecto o no renderice la escena esperada; la calidad final depende de la ejecucion del programa.
- No se dispone de informacion sobre sesgos, idiomas soportados ni evaluaciones de robustez.
- La longitud de contexto y las capacidades conversacionales heredadas del modelo base no estan documentadas en la ficha.
- El rendimiento en GenEval2 (GM 38.4) debe interpretarse en el contexto de la generacion basada en codigo; no hay comparaciones publicadas con modelos de difusion en la informacion disponible.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.5-9B y de las dependencias del renderizador antes de un uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario practicamente inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/CodeImageGen/CIG-9B-IPR
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del proyecto: https://github.com/codeimagegen/codeimagegen
- CIG-27B-IPR: https://huggingface.co/codeimagegen/CIG-27B-IPR
- CIG-27B-IR: https://huggingface.co/codeimagegen/CIG-27B-IR
- CIG-27B-PR: https://huggingface.co/codeimagegen/CIG-27B-PR
- CIG-27B-avgR: https://huggingface.co/codeimagegen/CIG-27B-avgR
- CIG-27B-SFT: https://huggingface.co/codeimagegen/CIG-27B-SFT
- CIG-9B-SFT: https://huggingface.co/codeimagegen/CIG-9B-SFT
- Dataset CIG-SFT-35k: https://huggingface.co/datasets/codeimagegen/CIG-SFT-35k
- Paper (referencia en la model card): Wang, N.; Liang, Z.; Leng, X.; Zheng, L. "Code-based Image Generation: Benchmarking, Baselines, and Improved Rewards", arXiv preprint, 2026.
