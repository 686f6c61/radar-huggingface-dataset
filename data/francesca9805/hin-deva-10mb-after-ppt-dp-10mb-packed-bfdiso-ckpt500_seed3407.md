# francesca9805/hin-deva-10mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed3407

## Resumen

`hin-deva-10mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed3407` es un modelo de generacion de texto de muy pequeno tamano (39.087.104 parametros, aproximadamente 39 M) publicado por el usuario `francesca9805` en HuggingFace. Se trata de un ajuste fino supervisado (SFT) mediante TRL sobre el modelo base `francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407`, y por las etiquetas de la ficha se enmarca en la familia de arquitectura GPT-2. El nombre del identificador sugiere un experimento de investigacion sobre datos en hindi en escritura devanagari ("hin-deva") con un corpus del orden de 10 MB, aunque el autor no declara oficialmente el idioma soportado.

Se trata de un modelo de investigacion de escala reducida, sin descargas ni interacciones registradas en el momento de redactar esta ficha, y sin informacion publica sobre benchmarks, contexto o licencia. Su relevancia es acotada: sirve como artefacto reproducible de experimentos de entrenamiento (SFT con TRL 0.23.0) en el entorno del autor, vinculado a la Universidad de Groningen segun la URL del proyecto en Weights & Biases.

No hay evidencia publica de capacidades conversacionales avanzadas, tool calling ni razonamiento multi-paso. La propia model card incluye un ejemplo de generacion condicionada por rol, pero no especifica la calidad ni el comportamiento esperado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun etiquetas `gpt2` y `transformers`) |
| Parametros totales | 39.087.104 (aprox. 39 M, dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la configuracion GPT-2 estandar suele ser 1024 tokens, pero no esta confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en precision completa; por tamano son viables fp16/int8/int4, pero no se declaran versiones cuantizadas) |
| Idiomas soportados | no disponible (el identificador sugiere hindi en escritura devanagari, sin confirmacion oficial) |
| Licencia | no disponible (la model card indica `licence: license`, valor no informativo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura GPT-2 (transformer decoder-only con atencion causal), segun las etiquetas declaradas en HuggingFace. Cuenta con aproximadamente 39 millones de parametros, un orden de magnitud propio de modelos de investigacion y de juguete mas que de despliegues de produccion. El entrenamiento se realizo mediante SFT (supervised fine-tuning) usando la libreria TRL en su version 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El modelo base es `francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407`, del que este artefacto es un ajuste fino posterior.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas adicionales como RLHF o DPO. El nombre del modelo sugiere un flujo experimental con corpus de aproximadamente 10 MB y un checkpoint intermedio (ckpt500) con semilla 3407, pero estos detalles no estan documentados en la model card. El identificador "bfdiso" apunta a algun experimento de empaquetado de secuencias ("packed"), sin que se detalle su significado. No se declara ninguna innovacion tecnica destacable (atencion lineal, decodificacion especulativa, MoE, SSM u otras).

## Capacidades

- Generacion de texto autoregresiva basica, segun el pipeline declarado `text-generation`.
- Generacion condicionada por mensajes con rol de usuario, tal como muestra el ejemplo de la model card (entrada con estructura `{"role": "user", "content": ...}`).
- Capacidad multilingue: no declarada. El identificador apunta a hindi en escritura devanagari, pero no hay confirmacion ni evaluacion.
- Soporte de tool calling / function calling: no disponible, no declarado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no declarado.
- Capacidades especiales (modo pensamiento, vision, audio): ninguna declarada.
- Razonamiento, codigo y matematicas: no hay evidencia publicada de estas capacidades; el tamano del modelo (39 M) limita severamente su rendimiento en tareas complejas.

## Casos de uso

- Experimentacion academica con ajuste fino: el modelo sirve como ejemplo reproducible de un flujo SFT con TRL, util para quien quiera replicar la metodologia en corpus pequenos.
- Pruebas de tokenizacion en hindi devanagari: dado el identificador, puede emplearse para estudiar como un modelo pequeno maneja la segmentacion de texto en esta escritura.
- Generacion de texto de bajo coste en entornos sin GPU: sus 39 M de parametros permiten inferencia en CPU con latencia aceptable para demos educativas.
- Baseline en investigacion sobre corpus limitados: util como referencia para comparar tecnicas de entrenamiento cuando el dataset es muy reducido (del orden de MB).
- Prototipado de pipelines de HuggingFace: permite validar integraciones con `transformers.pipeline`, text-generation-inference y endpoints compatibles sin coste elevado de computo.
- Docencia y demostraciones de SFT: por su tamano reducido, es adecuado para ilustrar el proceso completo de fine-tuning supervisado en un aula o taller.
- No se recomienda para produccion en atencion al cliente, generacion de codigo ni agentes, al carecer de capacidades y evaluaciones que lo respalden.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no declarada por el autor): aproximadamente 80 MB en fp16, 40 MB en int8 y 20 MB en int4, sin contar overhead de activaciones ni cache KV.
- GPU recomendadas: cualquier GPU moderna sirve; no se requiere hardware de centro de datos. Modelos como A100, H100 o RTX 4090 estan sobredimensionados para este tamano.
- Compatibilidad con GPU de consumo: si, cabe sobradamente en cualquier GPU de consumo (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: `transformers.pipeline`, text-generation-inference (segun las etiquetas `text-generation-inference` y `endpoints_compatible`). No se declaran artefactos GGUF ni Ollama, por lo que su uso con llama.cpp requeriria conversion previa. vLLM es tecnicamente posible por tamano, pero no esta confirmado.
- Latencia y throughput estimados: no disponibles. Dado el tamano, se espera latencia muy baja en GPU y moderada en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hin-deva-10mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed3407 | 39 M | no disponible | no disponible | HuggingFace |
| GPT-2 small | 124 M | 1024 tokens | MIT (original) | ampliamente disponible |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 (segun distribucion) | ampliamente disponible |
| Modelos TinyStories (familia) | 1 M - 33 M | variable | variable | HuggingFace |

Nota: la comparativa se ofrece a titulo orientativo por tamano y familia arquitectonica. No existe informacion de rendimiento publicada para el modelo analizado que permita comparaciones cuantitativas. Los datos de GPT-2 small y DistilGPT-2 corresponden a sus especificaciones conocidas y no a evaluaciones directas frente a este modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un ajuste sobre un corpus pequeno y no especificado, es probable que reproduzca sesgos presentes en dichos datos.
- Riesgo de alucinacion: alto en terminos relativos, dado el reducido numero de parametros (39 M) y la ausencia de evaluaciones; los modelos de este tamano generan texto poco fiable.
- Limitaciones de contexto e idioma: la longitud de contexto no esta declarada; el soporte de idiomas no esta confirmado, pese a que el nombre sugiere hindi devanagari.
- Restricciones de licencia: la licencia es "no disponible" y la model card indica `licence: license`, un valor sin significado legal. No se debe asumir uso comercial permitido sin consultar al autor.
- Caveats para produccion: cero descargas e interacciones en HuggingFace, sin benchmarks, sin evaluacion de seguridad, sin version cuantizada y sin documentacion del dataset. No apto para despliegues en produccion sin una validacion exhaustiva previa.
- El repositorio ocupa 1,6 GB, un tamano desproporcionado frente a los 39 M de parametros, lo que sugiere la presencia de checkpoints adicionales u otros artefactos de entrenamiento; conviene revisar el contenido antes de descargarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/hin-deva-10mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed3407
- Modelo base: https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/r4xntisg
- Repositorio de TRL: https://github.com/huggingface/trl
- Modelo relacionado (variante bfd, seed3407): https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed3407
- Modelo relacionado (variante 100mb, seed10): https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfdiso_seed10
- Ficha en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Fhin-deva-10mb-ppt-Dp-100mb_seed10,2gxqbfb7x05raV9Acig3xV
- Ficha en free2aitools: https://free2aitools.com/model/francesca9805/hin-deva-10mb-ppt-dp-10mb-packed-bfd_seed3407
- Despliegue en FriendliAI (variante relacionada): https://friendli.ai/models/francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfd_seed10
