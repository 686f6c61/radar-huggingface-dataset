# hipfire-models/MiniMax-M2.7

## Resumen

MiniMax-M2.7 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por MiniMax, con 229.000 millones de parametros totales y aproximadamente 10.000 millones activos por token. La version aqui descrita, `hipfire-models/MiniMax-M2.7`, es una cuantizacion nativa del motor hipfire sobre el checkpoint oficial, distribuida en cinco niveles de calidad/tamano que van de 123,6 GB a 79,2 GB. No se trata de pesos GGUF ni safetensors: los ficheros `.mq*` solo cargan con el motor hipfire (HIP/ROCm directo, sin Python en la ruta critica).

El interes tecnico de esta publicacion reside en su estrategia de cuantizacion: al carecer MiniMax-M2 de experto compartido, el error de cuantizacion de los expertos enrutados no tiene una via de alta precision donde ocultarse, y los expertos uniformes a 2 bits colapsan en bucles de repeticion. El autor resuelve esto promoviendo de forma independiente la proyeccion *down* de cada experto, cuya entrada concentra aproximadamente 588 veces mas energia de activacion que la de gate/up, mientras mantiene gate/up barato con AWQ.

La relevancia practica es doble: por un lado demuestra que un MoE de 229B puede reducirse hasta 79,2 GB manteniendo coherencia; por otro, la variante `mq2-lloyd` (86,2 GB) cabe en sistemas con 128 GB de memoria unificada como Strix Halo (gfx1151), lo que abre el modelo a hardware de consumo de gama alta. La licencia, no obstante, restringe el uso comercial sin autorizacion escrita previa de MiniMax.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (GQA con QK-norm por capa, RoPE parcial rotate_half, router sigmoid+bias top-8 estilo DeepSeek-V3, expertos SwiGLU, sin experto compartido) |
| Parametros totales | 229 000 millones (229B) |
| Parametros activos | Aproximadamente 10 000 millones (10B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MQ4, MQ3-Lloyd+AWQ, MQ3-Lloyd uniforme, MQ2-Lloyd+AWQ, MQ2-Lloyd (atencion, router, embedding y lm_head siempre en Q8; gate/up con AWQ incorporado en todos los niveles cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | `minimax-m2.7-license` (uso no comercial; uso comercial requiere autorizacion escrita previa de MiniMax) |
| Formato de pesos | `.mq*` propietario del motor hipfire (no GGUF, no safetensors); arch_id 10 en la cabecera HFQ |

| Detalle de arquitectura | Valor |
|---|---|
| Capas | 62 |
| Dimension oculta | 3072 |
| Vocabulario | 200 064 |
| Expertos enrutados | 256, top-8 por token |
| Checkpoint origen | FP8 (E4M3 + F32 block-[128,128] `weight_scale_inv`), dequantizado a F32 y recuantizado |

| Fichero | gate/up · down | Tamano | Notas |
|---|---|---|---|
| `MiniMax-M2.7.mq4` | MQ4 · MQ4 | 123,6 GB | mejor calidad |
| `MiniMax-M2.7.mq3-lloyd` | MQ3-Lloyd+AWQ · MQ4 | 109,6 GB | alta calidad |
| `MiniMax-M2.7.mq3` | MQ3-Lloyd uniforme | 102,6 GB | 3 bits equilibrado |
| `MiniMax-M2.7.mq2-lloyd` | MQ2-Lloyd+AWQ · MQ4 | 86,2 GB | cabe en 128 GB unificados (Strix Halo / gfx1151) |
| `MiniMax-M2.7.mq2` | MQ2-Lloyd+AWQ · MQ3-Lloyd | 79,2 GB | el mas pequeno coherente |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 62 capas con atencion GQA, normalizacion QK por capa y RoPE parcial con variante rotate_half. El router sigue el esquema de DeepSeek-V3: 256 expertos enrutados con seleccion top-8, funcion sigmoid y sesgo de enrutado; los expertos son SwiGLU y no existe experto compartido. La dimension oculta es 3072 y el vocabulario de 200 064 tokens. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion destacable de esta publicacion no esta en el entrenamiento sino en la cuantizacion. Al no haber experto compartido, el error de los expertos enrutados no dispone de una ruta de alta precision, y la cuantizacion uniforme a 2 bits produce bucles de repeticion. El analisis del autor identifica la causa: la entrada de la proyeccion *down* (el intermedio SwiGLU) transporta aproximadamente 588 veces la energia de activacion de la entrada de gate/up, de modo que un error de bajo bit en `w2` se amplifica unas 24 veces mas en la salida del bloque. La solucion aplicada en todos los niveles inferiores a mq4 consiste en mantener gate/up barato (2 o 3 bits mas AWQ) y promover unicamente la proyeccion *down* a 3 o 4 bits; la promocion por experto no aporta beneficio porque el router esta balanceado por carga y no hay expertos dominantes que anclar. Los pesos se almacenan al ancho de bit indicado y se dequantizan a f32 al vuelo dentro de los kernels GEMV, de forma que la aritmetica es f32 y el bit-width actua como dial de almacenamiento y ancho de banda. Para este modelo se anadieron a hipfire el kernel GEMV MoE con decodificacion indexada MQ3-Lloyd y el despacho de tipo mixto por proyeccion.

## Capacidades

- Generacion de texto y razonamiento general: el checkpoint base es un modelo de lenguaje conversacional; las validaciones publicadas muestran respuestas correctas a preguntas de conocimiento como la explicacion del color del cielo por dispersion de Rayleigh.
- Generacion de codigo: la validacion incluye la generacion correcta en Python de una funcion de factorial, lo que confirma capacidad basica de sintesis de codigo.
- Soporte de plantilla de chat: la plantilla conversacional esta embebida en cada nivel de cuantizacion y se activa con `HIPFIRE_JINJA_CHAT=1`.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en hardware de memoria unificada: la variante `mq2-lloyd` (86,2 GB) cabe en equipos con 128 GB unificados como Strix Halo (gfx1151), lo que permite ejecutar un MoE de 229B en una estacion de trabajo compacta con GPU integrada AMD.
- Servicio de chat autocontenido: con `hipfire serve --model MiniMax-M2.7.mq2-lloyd` y `HIPFIRE_JINJA_CHAT=1` se levanta un endpoint conversacional con la plantilla embebida, util para prototipos y evaluacion interna sin dependencias de Python en la ruta critica.
- Investigacion sobre cuantizacion de MoE: los cinco niveles permiten estudiar el compromiso calidad/tamano y validar la hipotesis de promocion de la proyeccion *down* frente a la promocion por experto, con un oraculo de pesos aleatorios de dimension fiel para comparar estados ocultos.
- Generacion de codigo asistida en entornos controlados: la capacidad demostrada de producir funciones Python correctas permite integrar el modelo en tareas de autocompletado o generacion de fragmentos dentro de pipelines internos, siempre con penalizacion de repeticion y muestreo ligero.
- Despliegue en infraestructura AMD ROCm: al ser HIP/ROCm-directo y no depender de CUDA ni de Python en el camino caliente, encaja en clusters con GPUs AMD donde otras pilas de inferencia no estan optimizadas.
- Evaluacion comparativa de motores de inferencia: sirve como banco de pruebas para medir throughput y latencia de hipfire frente a otras pilas sobre el mismo modelo base, gracias a la disponibilidad de cinco tamanos de peso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta validaciones de forward pass frente a la referencia de PyTorch (`transformers` `MiniMaxM2`) sobre un oraculo diminuto de pesos aleatorios fiel en dimensiones:

| Metrica de validacion | mq4 | mq3-lloyd |
|---|---|---|
| Coseno de estado oculto por capa | 0,9996 | 0,9994 |
| Coseno con atencion aislada | 0,99990 | no disponible |
| Enrutado | exacto | exacto |

No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM/memoria estimada: 123,6 GB (mq4), 109,6 GB (mq3-lloyd), 102,6 GB (mq3), 86,2 GB (mq2-lloyd) y 79,2 GB (mq2), unicamente para los pesos; hay que anadir el overhead del motor y del contexto.
- Cabe en consumer GPU: no en GPUs discretas de consumo individuales; la variante `mq2-lloyd` (86,2 GB) esta disenada para caber en 128 GB de memoria unificada (Strix Halo / gfx1151).
- GPUs recomendadas: no disponible en la informacion proporcionada; el motor es HIP/ROCm-directo, por lo que requiere hardware AMD compatible con ROCm.
- Opciones de despliegue: exclusivamente el motor hipfire (`hipfire serve`, `examples/infer_minimax`). No carga en llama.cpp ni en transformers, y los ficheros no son GGUF ni safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| MiniMax-M2.7 (hipfire, esta ficha) | 229B / ~10B | no disponible | `minimax-m2.7-license` (no comercial sin autorizacion) | `.mq*` solo para hipfire |
| MiniMaxAI/MiniMax-M2.7 (upstream) | 229B / ~10B | no disponible | `minimax-m2.7-license` | checkpoint oficial FP8 |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Licencia restrictiva: uso no comercial unicamente segun la licencia upstream de MiniMax; cualquier uso comercial requiere autorizacion escrita previa de MiniMax.
- Compatibilidad limitada: los ficheros `.mq*` no cargan en llama.cpp ni en transformers; solo funcionan con el motor hipfire y hardware AMD con ROCm.
- Repeticion en decodificacion greedy: la propia model card advierte de repeticion leve en prompts abiertos con decodificacion greedy; en produccion recomienda muestreo ligero, penalizacion de repeticion y plantilla de chat.
- Colapso a 2 bits sin promocion: los expertos uniformes a 2 bits colapsan en bucles de repeticion; solo los niveles con proyeccion *down* promovida mantienen coherencia.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a un modelo generativo de este tipo.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan en la informacion proporcionada.
- Estado del repositorio: 0 descargas y 1 like en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.
- Validacion sobre oraculo diminuto: las cifras de coseno se obtuvieron sobre un oraculo de pesos aleatorios fiel en dimensiones, no sobre el modelo completo de 229B; la validacion a escala real se limita a comprobaciones cualitativas de coherencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hipfire-models/MiniMax-M2.7
- Modelo base upstream: https://huggingface.co/MiniMaxAI/MiniMax-M2.7
- Licencia upstream: https://huggingface.co/MiniMaxAI/MiniMax-M2.7/blob/main/LICENSE
- Motor hipfire: https://github.com/Kaden-Schutt/hipfire
