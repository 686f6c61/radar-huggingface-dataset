# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-equal-scandimerge-seed1

## Resumen

El modelo `jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-equal-scandimerge-seed1` es un ajuste fino de SmolLM2-360M-Instruct orientado a la generacion de texto en feroes (`fo`). Lo desarrolla el usuario jekunz como parte de una linea de experimentos de investigacion sobre transferencia entre lenguas nordicas: primero se hace un merge TIES (con pesos iguales) de cinco modelos entrenados sobre porciones danesa, islandesa, noruego bokmål, noruego nynorsk y sueca de FineWeb-2, y despues se continua el preentrenamiento sobre la porcion feroesa del mismo corpus.

El modelo resuelve un problema muy concreto: la escasez de recursos linguisticos para el feroes en el ecosistema de modelos pequenos. En lugar de entrenar desde cero para un idioma de bajos recursos, aprovecha el conocimiento adquirido en lenguas escandinavas cercanas mediante un merge de pesos y un posterior continued pre-training (CPT) especifico. El resultado es un modelo de 361.821.120 parametros con ventana de contexto de 2048 tokens, licencia Apache 2.0 y pesos en safetensors.

Es relevante ahora porque demuestra una receta reproducible y de bajo coste (un solo A100 de 40 GB) para adaptar modelos pequenos a idiomas de bajos recursos, y porque publica variantes con distintas semillas (este es el seed 1) para poder medir la varianza del entrenamiento. No obstante, el propio autor advierte de que el modelo es para su investigacion y no ha sido evaluado de forma amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, derivado de SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; se pueden derivar cuantizaciones estandar tipo GGUF/INT8/INT4, pero no se documentan) |
| Idiomas soportados | feroes (`fo`); el modelo base aporta conocimiento de danes, islandes, noruego bokmål, noruego nynorsk y sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Llama, heredada de SmolLM2-360M-Instruct (361,8 millones de parametros). El entrenamiento se divide en dos fases. En la primera se parte de un merge TIES con pesos iguales de cinco modelos entrenados sobre las porciones danesa, islandesa, noruego bokmål, noruego nynorsk y sueca de FineWeb-2. En la segunda se hace continued pre-training sobre la porcion feroesa de FineWeb-2, con 1 epoca por cada lengua de origen y 5 epocas para el feroes.

Los hiperparametros documentados son: learning rate 5e-4, scheduler coseno, warmup ratio 0,05, batch size 8 con 32 pasos de acumulacion de gradiente (batch efectivo de 256), longitud maxima de contexto de 2048 tokens y semilla 1 (esta es una de tres semillas de la misma configuracion). Todo el entrenamiento se ejecuto en una unica GPU A100 de 40 GB. No se documentan en la informacion disponible detalles sobre la composicion exacta del dataset mas alla de FineWeb-2, ni sobre el uso de RLHF, DPO o tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto en feroes, con conocimiento transferido de lenguas escandinavas cercanas.
- Conversacion multi-turno, heredada del ajuste instructivo de SmolLM2-360M-Instruct.
- Razonamiento basico y respuesta a instrucciones a pequena escala (limitado por los 360 M de parametros).
- Capacidad multilingue residual hacia danes, islandes, noruego bokmål, noruego nynorsk y sueco por el merge de origen, aunque no esta evaluada.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (thinking mode) en la informacion disponible.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Generacion de texto y resumenes en feroes: el modelo puede producir parrafos coherentes en `fo` a partir de prompts, util para prototipos de contenido editorial o divulgativo en ese idioma.
- Experimentacion academica sobre transferencia entre lenguas: sirve como punto de partida reproducible (semilla 1 de 3) para estudiar el efecto del merge TIES y del CPT en idiomas de bajos recursos.
- Generacion aumentada de datos sinteticos en feroes: puede emplearse para crear corpus de entrenamiento o evaluacion adicionales, con revision humana posterior por el riesgo de alucinacion.
- Chatbot de bajo coste para feroes: con 361 M de parametros y contexto de 2048 tokens, cabe en hardware modesto y puede desplegarse como asistente conversacional simple en entornos con recursos limitados.
- Traduccion asistida feroes-escandinavo en borradores: por el conocimiento residual de las cinco lenguas del merge, puede generar primeras versiones que un traductor humano revise.
- Investigacion sobre cuantizacion y despliegue en el borde: su tamano permite probar pipelines de inferencia (llama.cpp, Ollama, TGI) en CPU o GPU consumer para idiomas minoritarios.
- Base para posteriores ajustes supervisados (SFT) en feroes: al estar bajo Apache 2.0 y en safetensors, es un punto de partida legalmente sencillo para fine-tunes especificos de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 0,7 GB de pesos mas overhead de activaciones y KV cache; en la practica menos de 2 GB para contexto de 2048 tokens.
- En cuantizacion INT8: alrededor de 0,4 GB de pesos; en INT4: alrededor de 0,2 GB (estimaciones derivadas del numero de parametros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el entrenamiento se hizo en una A100 de 40 GB, pero la inferencia cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 o incluso en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en sistemas integrados.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); llama.cpp u Ollama requeririan conversion a GGUF, no documentada en el repo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (smollm-360m-cpt-fineweb-faroese, seed 1) | 361,8 M | 2048 | feroes (con transferencia escandinava) | Apache 2.0 | Hugging Face, 0 descargas |
| SmolLM2-360M-Instruct (base) | 361,8 M | 2048 (documentado para la familia) | principalmente ingles | Apache 2.0 | Hugging Face, ampliamente usado |
| Otras semillas del mismo autor (seed 2 y seed 3) | 361,8 M | 2048 | feroes | Apache 2.0 | Hugging Face (variantes de la misma configuracion) |
| Modelos feroeses de mayor tamano | no disponible | no disponible | feroes | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor advierte de que no ha sido evaluado de forma amplia; no debe asumirse calidad de produccion.
- Riesgo elevado de alucinacion y de errores gramaticales en feroes, dado el reducido tamano (361 M) y el corpus de CPT limitado a FineWeb-2.
- Contexto maximo de 2048 tokens, insuficiente para tareas de documento largo.
- Sesgos desconocidos: no se documenta analisis de sesgos; al entrenarse sobre datos web (FineWeb-2) hereda los sesgos de ese corpus.
- Capacidades multilingues residuales no evaluadas; el tag de idioma solo declara `fo`.
- Sin soporte documentado de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion y el riesgo de salidas incorrectas desaconsejan su uso directo en produccion sin validacion humana.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-equal-scandimerge-seed1
- Modelo base del ajuste: https://huggingface.co/jekunz/smollm360m-da1-is1-nno1-nob1-sv1-ties
- Dataset utilizado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2 (familia de origen): https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
