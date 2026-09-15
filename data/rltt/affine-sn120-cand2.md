# RLTT/Affine-sn120-cand2

## Resumen

RLTT/Affine-sn120-cand2 es un checkpoint publicado en HuggingFace por el usuario RLTT sobre el modelo base Qwen/Qwen3.6-35B-A3B, una arquitectura de mezcla de expertos (MoE) del linaje Qwen. Las etiquetas del repositorio —affine, sn120, bittensor, lora, distillation— sitúan el artefacto en el ecosistema de la subred 120 (sn120) de Bittensor, y apuntan a un resultado de ajuste fino tipo LoRA y/o destilación sobre dicho modelo base, dentro de un proceso de entrenamiento incentivado por la red.

Los pesos suman 34.660.610.688 parámetros (unos 34,66 mil millones) y el repositorio ocupa 69,3 GB, lo que equivale aproximadamente a 2 bytes por parámetro y sitúa el checkpoint en precisión bf16 o fp16. Se trata de un modelo de acceso restringido (gated): requiere aceptar condiciones en HuggingFace antes de poder descargarlo. La licencia declarada es Apache 2.0.

La relevancia práctica de esta ficha es acotada: es un artefacto de investigación con tracción mínima (2 descargas y 1 like en el momento de la consulta), sin documentación pública sobre datos de entrenamiento, idiomas, longitud de contexto o rendimiento. La búsqueda web realizada no devolvió ningún resultado técnico relacionado con el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de tipo texto, segun la etiqueta `qwen3_5_moe_text`; detalles de capas, atencion y routing no disponibles |
| Parametros totales | 34.660.610.688 (≈34,66 B) |
| Parametros activos | no disponible (el nombre del modelo base, Qwen3.6-35B-A3B, sugiere del orden de 3 B activos, dato no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos en safetensors (69,3 GB, compatible con bf16/fp16). No se publican GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada en el repositorio) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Tipo de artefacto | adaptador o checkpoint derivado (etiquetas `lora`, `distillation`, `affine`) |
| Acceso | restringido (gated): requiere aceptar condiciones en HuggingFace |
| Tamano del repositorio | 69,3 GB |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

La unica informacion disponible sobre la arquitectura procede de las etiquetas del repositorio: `qwen3_5_moe_text` indica un transformer de mezcla de expertos orientado exclusivamente a texto, derivado del modelo base Qwen/Qwen3.6-35B-A3B. Las etiquetas `lora` y `distillation` sugieren que el artefacto se ha obtenido mediante ajuste con adaptadores de bajo rango y/o destilacion desde un modelo mayor o desde el propio modelo base, y `affine` podria referirse al esquema de transformacion o al nombre del pipeline de entrenamiento empleado.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la presencia de fases de RLHF o DPO, ni sobre innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, mecanismos de routing propios). Tampoco se documenta si el repositorio contiene el modelo completo o unicamente los pesos de un adaptador, aunque el tamano del repositorio (69,3 GB) y el recuento de parametros apuntan a un checkpoint de pesos completos en bf16/fp16.

## Capacidades

La documentacion del repositorio no describe capacidades de forma explicita. A partir de las etiquetas y del modelo base puede inferirse lo siguiente, siempre sin confirmacion oficial:

- Generacion de texto en modo texto puro (etiqueta `qwen3_5_moe_text`); no se anuncia soporte de vision ni de audio.
- Razonamiento y generacion de codigo: previsiblemente heredados del modelo base Qwen3.6-35B-A3B, sin datos publicados que lo verifiquen.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, vision, audio, contexto largo): no disponible.

## Casos de uso

- Investigacion sobre subredes de Bittensor: el artefacto esta etiquetado con `sn120` y `bittensor`, por lo que su uso natural es el analisis de candidatos de la subred 120, comparando este checkpoint (`cand2`) con otras variantes y con el modelo base para evaluar el efecto del entrenamiento incentivado.
- Reproduccion de experimentos de destilacion: al incluir las etiquetas `distillation` y `lora`, sirve como punto de partida para reproducir y auditar el proceso de destilacion sobre un MoE de ~34,66 B de parametros.
- Ajuste fino posterior con LoRA: si el repositorio contiene pesos completos en bf16, es una base razonable para anadir nuevos adaptadores en dominios verticales, reutilizando el conocimiento del modelo base Qwen.
- Evaluacion comparativa de arquitecturas MoE: permite medir routing de expertos, activacion efectiva de parametros y coste de inferencia frente a un transformer denso de tamano similar en un entorno de investigacion.
- Servicio interno de generacion de texto: puede desplegarse con vLLM o TGI en GPUs de 80 GB para tareas internas de resumen, clasificacion o generacion asistida, siempre que la licencia y las condiciones del modelo base lo permitan.
- Analisis de seguridad y procedencia de artefactos de comunidad: con solo 2 descargas y sin documentacion, es un caso de estudio util para flujos de validacion de checkpoints (verificacion de safetensors, comparacion de hashes, revision de licencias heredadas).
- Base para experimentos de cuantizacion: al publicarse unicamente en bf16/fp16, es un candidato para generar versiones GGUF o AWQ propias y medir la degradacion de calidad en un MoE de este tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 70 GB solo para pesos (69,3 GB de safetensors), mas el cache KV y el overhead del runtime. En la practica, se necesitan del orden de 80 GB o mas de memoria agregada.
- GPUs recomendadas: H100 80 GB o A100 80 GB en configuracion de una sola tarjeta para el checkpoint sin cuantizar; alternativas multi-GPU (2 x A100 40 GB, 2 x L40S 48 GB) si el runtime soporta paralelismo de tensor.
- GPU de consumo: no es viable en bf16 en tarjetas de 24 GB (RTX 4090, RTX 3090). Una cuantizacion a 4 bits reduciria los pesos a un rango estimado de 18-20 GB, lo que en teoria permitiria ejecutarlo en una RTX 4090, pero no hay cuantizaciones publicadas en el repositorio, por lo que el dato es una estimacion, no una cifra verificada.
- Opciones de despliegue: vLLM, TGI y SGLang son las opciones razonables para un MoE de este tamano en GPUs de datacenter. llama.cpp y Ollama no son aplicables sin una conversion previa a GGUF, que no esta publicada. El acceso gated obliga a configurar el token de HuggingFace en el runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RLTT/Affine-sn120-cand2 | 34,66 B (activos no disponibles) | no disponible | apache-2.0 | gated, 2 descargas | Adaptador o checkpoint derivado, sin benchmarks |
| Qwen/Qwen3.6-35B-A3B (modelo base) | ≈35 B totales segun nomenclatura (activos ≈3 B, no confirmado) | no disponible | no disponible | publico en HuggingFace | Referencia directa para medir el efecto del ajuste |
| Otras alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | No se han encontrado datos en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card con datos de entrenamiento, dataset, hiperparametros ni evaluacion, lo que impide valorar su calidad de forma objetiva.
- Riesgo de alucinacion: no evaluado; no existen benchmarks publicados que permitan acotarlo.
- Sesgos: no disponibles; se desconocen la composicion del dataset y el idioma predominante de entrenamiento.
- Idiomas: no se declara ninguna lista de idiomas soportados, por lo que el rendimiento fuera del ingles y del chino (idiomas habituales de la familia Qwen) es incierto.
- Longitud de contexto: no disponible; conviene no asumir el contexto del modelo base sin verificarlo.
- Licencia: el repositorio declara Apache 2.0, pero al ser un derivado de Qwen/Qwen3.6-35B-A3B, la licencia y las condiciones del modelo base pueden imponer restricciones adicionales al uso comercial. Es imprescindible revisar la licencia del modelo base antes de cualquier despliegue productivo.
- Acceso restringido: el caracter gated impide la descarga automatica en pipelines de CI/CD sin aceptar previamente las condiciones y configurar un token.
- Traccion minima y opacidad de procedencia: 2 descargas y 1 like, publicacion y ultima actualizacion con 35 segundos de diferencia, sin historial de versiones ni revision. No hay garantia de mantenimiento ni de soporte.
- Riesgo de artefacto derivado de un proceso incentivado: en entornos de subredes tipo Bittensor es frecuente encontrar checkpoints optimizados para una metrica concreta, lo que puede degradar capacidades generales no medidas por esa metrica.
- Sin cuantizaciones oficiales: el despliegue en hardware de gama consumer exige convertir los pesos por cuenta propia, con el consiguiente riesgo de perdida de calidad no medida.

## Enlaces

- HuggingFace: https://huggingface.co/RLTT/Affine-sn120-cand2
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos relacionados con este modelo; los resultados devueltos eran irrelevantes (comparativas de precios de telefonia movil) y no se han utilizado.
