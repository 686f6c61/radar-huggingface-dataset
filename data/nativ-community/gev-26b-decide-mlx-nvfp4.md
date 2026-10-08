# nativ-community/GEV-26B-Decide-MLX-NVFP4

## Resumen

GEV-26B-Decide-MLX-NVFP4 es una conversion a MLX del modelo `autotrust/GEV-26B-Decide`, publicada por la organizacion `nativ-community`. Se trata de un modelo de decision multimodal (pipeline `image-text-to-text`) que no genera texto: ante una pregunta y un conjunto de opciones devuelve una probabilidad para cada opcion en una unica pasada forward. El modelo procede del base `autotrust/GEV-26B-Decide`, con la LoRA del llamado "System 1" fusionada y la cabeza de decision mantenida en float32.

La relevancia tecnica de esta ficha concreta esta en que es una conversion cuantizada a NVFP4 (4 bits, group size 16) para el stack MLX de Apple, pensada para ejecutarse en Apple Silicon a traves de `mlx-vlm`. El autor verifica equivalencia funcional con la referencia original de transformers + peft sobre 7 preguntas de prueba (bool, choice, score, estado JSON, torneo de 20 opciones, una imagen y dos imagenes), con identificadores de token identicos en 9 de 9 pasadas forward y una diferencia maxima de probabilidad de 0,137.

Con 25.806.003.814 parametros totales y un repositorio de 15,4 GB, el modelo se orienta a tareas de clasificacion y decision estructurada (routing, extraccion de estados, scoring, torneos de opciones) mas que a generacion de lenguaje. Su licencia Apache 2.0 facilita el uso comercial, aunque el soporte de MLX para la arquitectura GEV todavia no esta en una release oficial de `mlx-vlm`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text con cabeza de decision; GEV, decision model) |
| Parametros totales | 25.806.003.814 (~25,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4, group size 16 (4 bits) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); cuantizacion NVFP4 |

## Arquitectura y entrenamiento

La model card describe GEV como un "decision model": en lugar de generar una secuencia de texto, realiza una unica pasada forward y devuelve una probabilidad por cada opcion de una pregunta. La conversion mantiene la cabeza de decision en float32 (es decir, sin cuantizar) y fusiona una LoRA correspondiente al "System 1", lo que indica una formulacion de dos sistemas (rapido/intuitivo frente a deliberativo) en el modelo base. El pipeline declarado es `image-text-to-text`, por lo que el modelo acepta entradas multimodales (texto e imagen) y admite multiples imagenes por consulta, segun la prueba de verificacion con "two images".

No se dispone de informacion sobre la arquitectura interna concreta (transformer denso, MoE, hibrida), el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. Tampoco se detalla el proceso de cuantizacion mas alla del esquema NVFP4 con group size 16. La innovacion destacable de esta publicacion es la propia conversion MLX y la verificacion de equivalencia numerica frente a la referencia original: mismos tokens de salida en 9 de 9 pasadas y una discrepancia maxima de probabilidad de 0,137.

## Capacidades

- Decision estructurada: devuelve una probabilidad por opcion de una pregunta en una sola pasada forward, sin generar texto.
- Tipos de salida soportados segun la verificacion del autor: booleano (`bool`), eleccion multiple (`choice`), puntuacion (`score`) y estado en formato JSON.
- Torneos de opciones: capacidad de evaluar conjuntos amplios de alternativas (se cita un torneo de 20 opciones).
- Entrada multimodal: procesa texto e imagen, incluyendo casos con varias imagenes en una misma consulta.
- Clasificacion con instrucciones: cada opcion puede llevar instrucciones especificas, como en el ejemplo de reembolso.
- Modelo base entrenado para el dialogo (`conversational`) segun los tags del repositorio.
- No soporta generacion de texto: la salida es un conjunto de probabilidades, no una respuesta redactada.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Clasificacion de intenciones en atencion al cliente: dado un mensaje (por ejemplo "el paquete llego danado y quiero mi dinero"), el modelo devuelve la probabilidad de etiquetas como reembolso, incidencia de envio o cancelacion, integrable directamente en un sistema de ticketing.
- Routing y triaje de tickets: puntuar cada posible cola o equipo de destino y enrutar la solicitud al de mayor probabilidad en una sola inferencia, reduciendo la latencia frente a enfoques generativos.
- Moderacion de contenido: evaluar politicas como opciones booleanas o de score y decidir automaticamente si un contenido se permite, se revisa o se bloquea.
- Extraccion de estado estructurado: devolver un estado en formato JSON con la probabilidad asociada, util para mantener el estado de una conversacion o de un flujo de trabajo.
- Scoring y ranking: aprovechar la puntuacion por opcion para ordenar candidatos (respuestas, documentos, productos) sin necesidad de un modelo generativo.
- Decision multimodal: con entrada `image-text-to-text`, decidir sobre imagenes (por ejemplo, clasificar el estado de un producto a partir de una foto o verificar condiciones en varias imagenes).
- Reranking dentro de pipelines RAG: usar las probabilidades por opcion como senal para reordenar los fragmentos recuperados antes de pasarlos a un generador.
- Automatizacion de reglas de negocio: sustituir arboles de decision rigidos por un modelo que aprende a asignar probabilidades a cada rama en funcion del contexto textual y visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica evidencia de rendimiento es la verificacion funcional reportada por el autor:

| Prueba | Resultado |
|---|---|
| Coincidencia de respuesta frente a referencia transformers + peft | 7 de 7 preguntas de prueba |
| Identificadores de token en pasadas forward | 9 de 9 identicos |
| Diferencia maxima de probabilidad frente a la referencia | 0,137 |
| Tipos de tarea cubiertos | bool, choice, score, estado JSON, torneo de 20 opciones, una imagen, dos imagenes |

No se dispone de datos de MMLU, HumanEval, GSM8K ni equivalentes.

## Requisitos de hardware

- Memoria unificada: el repositorio pesa 15,4 GB en pesos NVFP4; se recomienda un minimo de 16 GB de memoria unificada y 24 GB o mas para trabajar con margen (estimacion, no confirmada por el autor).
- Hardware: exclusivamente Apple Silicon, al estar empaquetado como modelo MLX.
- GPU recomendadas para la ruta MLX: chips de la serie M de Apple (M1, M2, M3, M4 y sus variantes Pro/Max/Ultra) con memoria unificada suficiente.
- Comodidad en GPU de consumo: no aplica por la ruta MLX; el modelo no se distribuye en formato CUDA. Para ejecutar el modelo base en GPU NVIDIA seria necesario recurrir a la version original `autotrust/GEV-26B-Decide`, no a esta cuantizacion.
- Opciones de despliegue: `mlx-vlm` con la rama `Lazarus-931/mlx-vlm@feat/gev`; el soporte GEV no esta en una release oficial de `mlx-vlm`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| nativ-community/GEV-26B-Decide-MLX-NVFP4 | ~25,8B | no disponible | safetensors MLX (NVFP4) | apache-2.0 | Conversion MLX para Apple Silicon; salida por probabilidades |
| autotrust/GEV-26B-Decide | no disponible | no disponible | transformers + peft | no disponible en la informacion | Modelo base original; referencia de verificacion |
| Otros modelos de decision de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de alternativas comparables en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier caso de uso que requiera respuestas redactadas debe combinarlo con otro modelo.
- Al ser una conversion cuantizada a NVFP4, existe una diferencia residual frente a la referencia (hasta 0,137 de probabilidad en las pruebas del autor), aceptable para la verificacion reportada pero no cuantificada de forma exhaustiva.
- El soporte de GEV no esta en una release estable de `mlx-vlm`; requiere instalar una rama concreta del repositorio, lo que implica un riesgo de mantenimiento y compatibilidad.
- La ejecucion esta limitada a Apple Silicon; no hay ruta oficial para CUDA, ROCm u otros aceleradores.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no aplica de la misma forma que en un modelo generativo, pero las probabilidades pueden estar mal calibradas en dominios fuera de la distribucion de entrenamiento; no se aportan datos de calibracion.
- Limitaciones de idioma: la lista de idiomas soportados no esta disponible, por lo que no se puede garantizar un comportamiento correcto fuera del ingles.
- Longitud de contexto no documentada: no es posible planificar escenarios de documentos largos sin medir empiricamente el limite.
- Licencia Apache 2.0, favorable al uso comercial, pero la ausencia de informacion sobre el modelo base obliga a revisar las condiciones de `autotrust/GEV-26B-Decide` antes de un despliegue en produccion.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, sin historial de uso en produccion que respalde su fiabilidad.

## Enlaces

- HuggingFace: https://huggingface.co/nativ-community/GEV-26B-Decide-MLX-NVFP4
- Modelo base: https://huggingface.co/autotrust/GEV-26B-Decide
- mlx-vlm (repositorio principal): https://github.com/Blaizzy/mlx-vlm
- mlx-vlm rama con soporte GEV: https://github.com/Lazarus-931/mlx-vlm (rama `feat/gev`)
- Nativ (aplicacion de Blaizzy para ejecutar modelos en local en Mac): https://blaizzy.github.io/nativ/
