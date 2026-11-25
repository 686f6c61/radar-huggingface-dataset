# blearyhope/ERNIE-5.5-Flash-Preview

## Resumen

ERNIE 5.5 Flash Preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Baidu, publicado como checkpoint intermedio del proceso de post-entrenamiento sobre ERNIE 5.5 Flash Base. Con 280 000 millones de parametros totales y 14 000 millones activos por token, esta disenado para cargas de trabajo de codigo, modelado 3D, conocimiento profesional y creacion de contenido, manteniendo una decodificacion rapida gracias a su arquitectura dispersa.

La innovacion principal reside en su ventana de contexto de 1 048 576 tokens, extendida desde los 128K del modelo base durante el mid-training, y en la incorporacion de una cabeza de borrador DSpark para decodificacion especulativa. El modelo emplea cuantizacion FP8 por bloques con expertos enrutados en MXFP4 (W4A8, entrenado con quantization-aware training), cache KV en FP8 e indexador DSA en FP4, lo que reduce los requisitos de memoria frente a un despliegue en BF16.

El checkpoint se distribuye con licencia Apache 2.0 y soporta ingles y chino. Al tratarse de una preview, algunas capacidades pueden quedar por debajo de su potencial final, ya que el post-entrenamiento sigue en curso. La publicacion en Hugging Face corresponde al usuario `blearyhope`, un espejo del modelo original de `baidu/ERNIE-5.5-Flash-Preview`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (43 capas: 1 densa + 42 MoE) con atencion hibrida HCA/MLA-DSA |
| Parametros totales | 299 559 241 286 (~280B segun model card) |
| Parametros activos | 14B por token |
| Longitud de contexto | 1 048 576 tokens |
| Tipos de cuantizacion | Blockwise FP8, expertos enrutados MXFP4 (W4A8), BF16; cache KV FP8; indexador DSA FP4 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con 43 capas, de las cuales una es densa y 42 son bloques MoE. Cada bloque MoE contiene 512 expertos enrutados con top-10 mas un experto compartido. El tamano oculto es de 4096 y el vocabulario de 201 216 tokens. La atencion combina 37 capas HCA (head dim 512) con 6 capas MLA-DSA (head dim 256), con 64 cabezas en total. Esta combinacion busca equilibrar eficiencia computacional y capacidad de modelado en contextos largos.

El entrenamiento parte de ERNIE 5.5 Flash Base, compartiendo arquitectura y tokenizer. El mid-training extendio la longitud de contexto de 128K a 1M tokens, y el post-entrenamiento anadio capacidades de agente, codigo y razonamiento. La model card menciona entrenamiento en 300 000 espacios de trabajo para dominios como finanzas y derecho, con 10 millones de archivos de referencia en mas de 40 tipos, y mas de 150 000 entornos de creacion para tareas de video. El modelo incorpora una cabeza de borrador DSpark para decodificacion especulativa, que acelera tareas de agente de larga duracion con poca perdida de precision. El modo de pensamiento esta activado por defecto y admite niveles `low`, `medium` y `high` mediante `reasoning_effort`.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento configurable (`enable_thinking`, `reasoning_effort`).
- Generacion de codigo en bases de codigo reales, incluyendo planificacion y ejecucion iterativa sobre tareas largas.
- Desarrollo de videojuegos con conocimiento de Unreal Engine, Unity y Godot; la model card cita una tarea de 11 horas construyendo un juego wuxia en C++ sobre Unreal Engine 5.8 y cerca de 100 minijuegos moviles a partir de documentos de diseno.
- Modelado 3D y diseno: genera scripts para Blender y software CAD a partir de descripciones textuales.
- Trabajo de conocimiento: hojas de calculo, documentos y presentaciones de calidad profesional.
- Creacion de video: recopilacion, generacion y disposicion de material, con tareas de una a dos horas por pieza.
- Soporte de agentes y razonamiento multi-paso en entornos de ejecucion prolongada.
- Capacidades multilingues limitadas a ingles y chino.
- Compatibilidad con endpoints (`endpoints_compatible`) y tooling del modelo base.

## Casos de uso

- Desarrollo de videojuegos asistido: el modelo puede planificar y escribir codigo en C++ para Unreal Engine, Unity o Godot, iterando sobre tareas de varias horas gracias a su contexto de 1M tokens y su modo de agente.
- Generacion de codigo en produccion: su soporte de tool calling y razonamiento multi-paso permite integrarlo en pipelines de CI/CD para correccion de errores, refactorizacion y generacion de pruebas sobre bases de codigo extensas.
- Modelado 3D automatizado: a partir de una descripcion textual, genera scripts de Blender o CAD para construir piezas de motor, edificios o escenas complejas, incorporando activos existentes al flujo.
- Automatizacion de trabajo de conocimiento: procesa material disperso en mas de 40 tipos de archivo y produce hojas de calculo, informes o presentaciones para dominios financieros y legales.
- Creacion de video divulgativo: recopila, genera y organiza material visual, define ritmo y montaje, y entrega una pieza final en tareas de una a dos horas.
- Agentes autonomos de larga duracion: la cabeza DSpark y la decodificacion especulativa reducen la latencia en tareas de agente que requieren muchas llamadas encadenadas.
- Atencion al cliente multilingue (en/zh): conversaciones multi-turno con contexto largo para soporte tecnico o consultas documentales.

## Benchmarks y rendimiento

La model card referencia una imagen de resultados (`assets/eval-results.png`) y menciona una tabla con 20 benchmarks, pero los valores numericos no estan incluidos en la informacion proporcionada. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 165,9 GB en el formato por defecto (FP8 por bloques con expertos FP4). La variante BF16 requiere aproximadamente el doble, en torno a 560 GB para los pesos.
- El checkpoint FP8/BF16 con 280B parametros totales no cabe en GPUs de consumo individuales; requiere multiples aceleradores.
- GPU recomendadas: H100, H200 o A100 de 80 GB en configuracion multi-GPU; el modelo esta pensado para despliegues en servidor.
- En consumer GPU no es viable el despliegue completo; solo cabria mediante tecnicas de offload agresivo, con latencia muy alta.
- Opciones de despliegue: transformers (libreria declarada), vLLM o TGI para serving en cluster; llama.cpp y Ollama no estan confirmados para esta arquitectura.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card indica que la decodificacion especulativa con DSpark y los pesos FP4 mejoran la velocidad en tareas de agente largas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ERNIE 5.5 Flash Preview | ~280B | 14B | 1M | Apache 2.0 | Hugging Face, ModelScope |
| ERNIE 5.5 Flash Base | no disponible | no disponible | 128K (ampliado a 1M en Preview) | Apache 2.0 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos MoE de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio de post-entrenamiento: algunas capacidades pueden quedar por debajo del modelo final, ya que el entrenamiento sigue en curso.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de conocimiento profesional y generacion de codigo sin validacion.
- Sesgos no documentados en la informacion proporcionada.
- El repositorio por defecto contiene pesos FP4 para expertos; en hardware sin kernels FP4 debe usarse la variante FP8 o BF16.
- Para fine-tuning se recomienda partir del repositorio BF16.
- El despliegue completo exige infraestructura multi-GPU de gama alta; no es apto para entornos con recursos limitados.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base y de los pesos derivados.

## Enlaces

- Hugging Face (espejo): https://huggingface.co/blearyhope/ERNIE-5.5-Flash-Preview
- Modelo original: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Base
- Variante FP8: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview-FP8
- Variante BF16: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview-BF16
- ModelScope: https://www.modelscope.cn/models/baidu/ERNIE-5.5-Flash-Preview
- Blog de lanzamiento: https://ernie.baidu.com/release/ernie-5-5-flash-preview/
- Chat: https://ernie.baidu.com/web
- API Qianfan: https://cloud.baidu.com/product/qianfan.html
- X (Twitter): https://x.com/Baidu_ERNIE
- Licencia: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview/blob/main/LICENSE
- Paper 1: arxiv:2610.24766
- Paper 2: arxiv:2610.17959
- Paper 3: arxiv:2610.40577
