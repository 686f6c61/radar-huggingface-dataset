# resolvo-cloud/Ornith-1.5-9B-DFlash2

## Resumen

Ornith-1.5-9B-DFlash2 es un modelo borrador (*draft*) para decodificación especulativa, publicado por el usuario `resolvo-cloud` en Hugging Face. No es un modelo de lenguaje autónomo: su función es proponer tokens candidatos que el modelo objetivo `ornith-ai/Ornith-1.5-9B-MLX-4bit` verifica en paralelo, acelerando la generación sin alterar la distribución de salida del modelo grande. El checkpoint pesa 2,9 GB y contiene 1.470.621.184 parámetros reales según los safetensors, muy por debajo de los 9B que sugiere el nombre (que hace referencia al modelo objetivo, no al borrador).

La receta de construcción es un *no-op-graft* con entrenamiento del selector: el tronco procede de `ornith-ai/Ornith-1.5-9B-DFlash` (DFlashV1) copiado tal cual, las convoluciones `attention_conv` y `mlp_conv` se injertan como identidad (autoconexión unitaria y correcciones dinámicas a cero) y el único componente entrenado es un selector de candidatos formado por una proyección oculta y codebooks de predecesor/sucesor, ajustado sobre estados ocultos capturados del objetivo cuantizado a 4 bits (832 muestras, margen *top-16 hard-negative*).

Su relevancia es acotada pero concreta: el autor reporta 161,7 tok/s en serie y 768,7 tok/s con empaquetado B4 en un Apple M5 Pro con su runtime RichEngine, frente a los ~132 y ~161 tok/s del borrador V1, es decir, una aceleración de hasta 4,43x. Es, por tanto, una pieza de infraestructura de inferencia para MLX en Apple Silicon, no un modelo para evaluar por capacidades cognitivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2DraftModel (borrador de decodificacion especulativa; tronco DFlashV1 con convoluciones `attention_conv`/`mlp_conv` injertadas como identidad y selector de candidatos entrenado). Tag `qwen3` en el repo, sin confirmacion explicita en la model card |
| Parametros totales | 1.470.621.184 (segun safetensors); el nombre del repo hace referencia al objetivo de 9B |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible (el borrador opera sobre la ventana del modelo objetivo; no se especifica en la model card). Dimension oculta 4096, `dynamic` 1024, `block_size` 8 |
| Tipos de cuantizacion | no se publican variantes cuantizadas del borrador; el selector se entreno sobre los estados ocultos del objetivo en 4 bits. El repo ocupa 2,9 GB, magnitud coherente con pesos en bf16 para 1,47B parametros (dato inferido del tamano, no confirmado) |
| Idiomas soportados | no disponible (heredados del modelo objetivo; no declarados) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, libreria `mlx`, con `custom_code` (requiere `trust_remote_code`) |

Parametros de servicio declarados: `architectures: ["DFlash2DraftModel"]`, `hidden` 4096, `dynamic` 1024, `conv_group_size` 16, `block_size` 8, `selector top_k` 16.

## Arquitectura y entrenamiento

El modelo es un borrador de decodificacion especulativa con un diseno poco convencional: en lugar de un transformer pequeño entrenado desde cero, reutiliza el tronco del borrador DFlashV1 (`ornith-ai/Ornith-1.5-9B-DFlash`) copiando sus pesos de forma literal. Sobre ese tronco se injertan las convoluciones `attention_conv` y `mlp_conv` como identidad (autoconexion unitaria y correcciones dinamicas a cero), de modo que el runtime obtiene convoluciones identidad practicamente sin coste computacional. La dimension oculta es 4096, con un componente dinamico de 1024 y un `conv_group_size` de 16.

El unico componente realmente entrenado es el selector de candidatos: una `hidden_projection` mas codebooks de predecesor y sucesor, ajustados con 832 muestras y un margen de *hard negatives* top-16, manteniendo las convoluciones congeladas. El detalle metodologico relevante es que el selector se entrena sobre los estados ocultos del objetivo cuantizado a 4 bits y no sobre los del objetivo en bf16, lo que segun el autor explica que la transferencia funcione en el escenario real de despliegue. No se documentan volumen total de tokens de entrenamiento, composicion del dataset ni fases de RLHF o DPO, algo esperable en un modelo de esta naturaleza.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa: propone bloques de 8 tokens (`block_size` 8) que el modelo objetivo verifica.
- Seleccion de candidatos mediante codebooks de predecesor/sucesor con `top_k` 16.
- Aceleracion de inferencia sobre el objetivo `ornith-ai/Ornith-1.5-9B-MLX-4bit` en Apple Silicon con el runtime RichEngine.
- Soporte de empaquetado B4 (cuatro lanes concurrentes) con ganancias medidas muy superiores al modo serie.
- No soporta tool calling, agentes, vision, audio ni modo *thinking* por si mismo: esas capacidades, si existen, pertenecen al modelo objetivo.
- No es utilizable como modelo de chat o de generacion standalone.

## Casos de uso

- Servicio de inferencia local en Mac con MLX: desplegar el objetivo de 9B en 4 bits acompanado de este borrador para elevar el throughput de 132 a 161,7 tok/s en serie en un M5 Pro, con una mejora de calidad de salida nula por construccion.
- Servidores de codigo asistido con varias sesiones simultaneas: el modo empaquetado B4 alcanza 768,7 tok/s, adecuado para atender cuatro peticiones concurrentes de autocompletado o chat sobre el mismo host.
- Backends de agentes de edicion de ficheros: el autor reporta ~212 tok/s en trafico diverso (prompts de lectura de ficheros, cuatro lanes) frente a ~161 tok/s de V1, escenario tipico de asistentes que leen y parchean codigo.
- Prototipado e investigacion en decodificacion especulativa: el checkpoint sirve como referencia reproducible de la receta *no-op-graft* + entrenamiento de selector sobre el cuantizado, util para estudiar transferencia de borradores a objetivos de baja precision.
- Evaluacion comparativa de borradores: permite medir en una misma maquina el salto V1 a V2 (1,8x a 4,43x) y decidir si merece la pena el cambio en un pipeline existente.
- Reduccion de coste energetico en estaciones de trabajo Apple: al aumentar los tokens por segundo sin GPU dedicada, se acorta el tiempo de pared de tareas por lotes ejecutadas en local.
- Baselines de latencia en CI: usar el par objetivo+borrador como referencia de rendimiento en pruebas de regresion de un stack de inferencia MLX.

## Benchmarks y rendimiento

Datos publicados en la model card (Apple M5 Pro, `opencode_sim`, n=4):

| Borrador | Serie (tok/s) | B4 empaquetado (tok/s) | Aceleracion |
|---|---|---|---|
| Ornith-1.5-9B-DFlash (V1) | ~132 | ~161 | ~1,8x |
| Ornith-1.5-9B-DFlash2 (este checkpoint) | 161,7 | 768,7 | 4,43x |

Trafico diverso (prompts de lectura de ficheros, cuatro lanes concurrentes): ~212 tok/s frente a ~161 tok/s de V1.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible, ni tendria sentido para un borrador de decodificacion especulativa: la calidad de salida la determina el modelo objetivo.

## Requisitos de hardware

- VRAM/memoria unificada: ~2,9 GB para los pesos del borrador, adicionales a los del objetivo de 9B en 4 bits; el consumo total del par no se especifica en la model card.
- Plataforma: exclusivamente Apple Silicon via MLX; no hay soporte CUDA publicado.
- GPU validadas: Apple M5 Pro es la unica plataforma con mediciones reportadas. No hay datos para A100, H100 ni RTX 4090, y el formato MLX las excluye en la practica.
- Cabe en hardware de consumo: si, en equipos Apple Silicon con memoria unificada suficiente para alojar tambien el objetivo de 9B.
- Despliegue: runtime RichEngine con el nucleo de contexto de borrador `Hidden4096` (`draft_conv_h4096`), obligatorio segun el autor. No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 161,7 tok/s en serie y 768,7 tok/s en B4 sobre M5 Pro; ~212 tok/s en trafico diverso con cuatro lanes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-9B-DFlash2 | 1,47B (borrador) | no disponible | 161,7 tok/s serie; 768,7 tok/s B4 (M5 Pro) | apache-2.0 | MLX + RichEngine |
| Ornith-1.5-9B-DFlash (V1) | no disponible | no disponible | ~132 tok/s serie; ~161 tok/s B4 (M5 Pro) | no disponible | MLX |
| EAGLE-3 (familia de borradores) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Medusa (cabezas de decodificacion especulativa) | no disponible | no disponible | no disponible | no disponible | no disponible |

Solo el borrador V1 de la misma familia cuenta con datos comparables dentro de la informacion disponible; para EAGLE-3 y Medusa no se han proporcionado parametros, contexto ni rendimiento, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera respuestas por si mismo, solo candidatos que el objetivo verifica. Cualquier uso fuera de decodificacion especulativa es invalido.
- Acoplamiento fuerte al objetivo `ornith-ai/Ornith-1.5-9B-MLX-4bit`: el selector se entreno sobre los estados ocultos de esa cuantizacion concreta; cambiar de objetivo o de nivel de cuantizacion invalida la transferencia.
- Dependencia de un runtime propietario/de terceros: requiere RichEngine y el nucleo `draft_conv_h4096`, no incluidos en el repo. Sin ellos el checkpoint es inutilizable.
- Requiere `custom_code` y `trust_remote_code=True`, lo que implica ejecutar codigo no auditado del autor.
- Exclusivo de MLX/Apple Silicon: sin soporte CUDA, ROCm ni CPU generica.
- Evidencia empirica muy limitada: n=4, una sola maquina (M5 Pro), un unico simulador (`opencode_sim`) y ninguna validacion independiente. Los 4,43x corresponden al mejor caso empaquetado, no a una carga realista.
- Adopcion practicamente nula: 0 descargas y 2 likes en el momento del analisis, sin issues ni discusion publica conocida.
- Sin datos de sesgos ni de alucinacion propios; los heredados dependen del modelo objetivo, no documentados aqui.
- Licencia apache-2.0 permite uso comercial del artefacto, pero no cubre los modelos de terceros implicados (objetivo y tronco DFlashV1), cuyas condiciones deben verificarse por separado.
- Incoherencia de nomenclatura: el nombre indica 9B mientras que los pesos reales son 1,47B; conviene no confundirlo con un modelo grande al planificar recursos.

## Enlaces

- Hugging Face: https://huggingface.co/resolvo-cloud/Ornith-1.5-9B-DFlash2
- Modelo objetivo: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-4bit
- Tronco del borrador V1: https://huggingface.co/ornith-ai/Ornith-1.5-9B-DFlash
- Paper, blog, repositorio del runtime o demo: no disponible en la informacion proporcionada.
- La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo.
