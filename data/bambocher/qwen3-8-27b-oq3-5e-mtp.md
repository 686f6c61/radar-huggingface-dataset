# bambocher/Qwen3.8-27B-oQ3.5e-mtp

## Resumen

Qwen3.8-27B-oQ3.5e-mtp es un checkpoint cuantizado del modelo Qwen3.8-27B, publicado por el usuario bambocher en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos a formato MLX mediante la herramienta oQ (oMLX v0.7.1), que aplica cuantización mixta de precisión por capas en lugar de un único ancho de bits homogéneo. El resultado es un checkpoint de 27.781.427.952 parámetros almacenado en 13,77 GiB, con un promedio efectivo de 4,258 bits por peso.

El interés técnico del artefacto está en dos elementos: la distribución heterogénea de bits (3, 4, 5 y 8 bits más una fracción en BF16) y la presencia de una cabeza MTP (multi-token prediction) de 0,425B parámetros, además de un codificador visual de 0,461B. Es decir, el checkpoint conserva la torre de visión del modelo original y la cabeza de predicción multi-token, lo que habilita decodificación especulativa sobre el propio modelo base.

La relevancia práctica es acotada: se publica como material experimental (0 descargas, 0 likes en el momento del análisis), sin model card más allá de las tablas de cuantización, sin licencia declarada y sin resultados de evaluación. Es útil como referencia para quien quiera estudiar o replicar cuantización mixta en MLX, pero no como artefacto listo para producción sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; el tag `qwen3_5` apunta a la familia Qwen3.5 (transformer). El checkpoint incluye torre de vision y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | No aplica / no disponible (no se documenta que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta afin (affine) con grupo de 64: 3 bits (21,677B pesos), 4 bits (0,372B), 5 bits (3,945B), 8 bits (1,271B) y BF16 (0,516B); media efectiva 4,258 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |

Desglose de almacenamiento declarado por el autor:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 26,896B | 13,552 GB / 12,621 GiB |
| Vision | 0,461B | 0,921 GB / 0,858 GiB |
| Cabeza MTP | 0,425B | 0,314 GB / 0,293 GiB |
| Total | 27,781B | 14,788 GB / 13,772 GiB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base ni su proceso de entrenamiento: no hay datos sobre número de tokens, composición del corpus, fases de RLHF/DPO o técnicas de atención. Lo único documentado es el proceso de cuantización posterior al entrenamiento, ejecutado con oQ (oMLX v0.7.1) sobre un checkpoint preexistente de 27,78B parámetros. Por los tags y por la presencia de una torre visual de 0,461B, cabe inferir que el modelo original es multimodal, pero el autor no aporta confirmación ni detalles.

La innovación técnica del artefacto es la política de precisión mixta: el 78,03% de los pesos lógicos (21,677B) se almacena a 3 bits con grupo de 64, mientras que capas sensibles se preservan a 5 bits (14,20%), 8 bits (4,58%) y BF16 (1,86%). Este último grupo, junto con la cabeza MTP, sugiere que el autor protegió módulos críticos de la degradación por cuantización, aunque no se documenta el criterio de selección por capa ni se publican métricas de perplejidad o de degradación respecto al original.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.8-27B (no verificadas en este checkpoint).
- Procesamiento de imagen: el checkpoint incluye explícitamente una torre de visión de 0,461B parámetros (0,921 GB de almacenamiento), por lo que conserva la entrada multimodal.
- Decodificación especulativa: incorpora una cabeza MTP de 0,425B parámetros orientada a la predicción multi-token, lo que permite acelerar la inferencia en runtimes MLX que la soporten.
- Ejecución local en Apple Silicon mediante la librería MLX.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo thinking, audio u otras capacidades especiales: no disponible (no documentado).

## Casos de uso

- Evaluación de cuantización mixta en MLX: sirve como caso de estudio reproducible para medir la pérdida de calidad de una política 3/4/5/8 bits frente al checkpoint BF16, comparando perplejidad y salidas sobre un conjunto fijo de prompts.
- Prototipado local en Mac con privacidad de datos: al ejecutarse con MLX sobre memoria unificada, permite probar un modelo de ~28B sin enviar prompts a la nube, adecuado para entornos con datos sensibles.
- Experimentación con decodificación especulativa: la cabeza MTP incluida permite medir la ganancia de throughput de la predicción multi-token frente a la decodificación autoregresiva estándar en `mlx-lm`.
- Procesamiento de documentos con componente visual: la torre de visión conservada permite experimentar con lectura de capturas, formularios o diagramas en local, siempre que se valide la calidad tras la cuantización a 3,50 bits de la mayor parte de los pesos.
- Test de regresión de pipelines MLX: útil como checkpoint de referencia para verificar que una versión nueva de oMLX u otro runtime MLX carga correctamente pesos mixtos con grupos de 64.
- Asistente de código en local para tareas acotadas: generación y explicación de fragmentos en un flujo de trabajo de escritorio, con la advertencia de que no hay benchmarks que respalden su rendimiento en HumanEval ni en tareas de razonamiento.
- Base para comparativas internas de huella de memoria: con 13,77 GiB de pesos, permite estudiar el equilibrio entre memoria ocupada y calidad en máquinas de 24-32 GB de memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card se limita a las tablas de cuantización y almacenamiento; no incluye MMLU, HumanEval, GSM8K, MMMU ni métricas de perplejidad, ni comparaciones con el checkpoint original.

## Requisitos de hardware

- Memoria: los pesos ocupan 13,77 GiB (14,788 GB). Con overhead del runtime MLX y caché KV, conviene disponer de 16-20 GB de memoria unificada como mínimo para contextos cortos, y de 32 GB o más si se trabaja con contextos largos o imágenes.
- GPU: el formato es MLX, por lo que el destino natural es Apple Silicon (series M1/M2/M3/M4). No es directamente ejecutable en CUDA con vLLM, TGI o TensorRT-LLM sin reconversión.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí: un Mac con 24 GB de memoria unificada (por ejemplo, M4 Pro) es suficiente para inferencia básica. Los 27,78B parámetros impiden cargarlo en GPUs de consumo con 8-12 GB de VRAM en este formato.
- Despliegue: `mlx-lm` (scripts de generación y `mlx_lm.server`), oMLX, y entornos de escritorio con backend MLX como LM Studio. Para llama.cpp, Ollama o vLLM sería necesario convertir los pesos a GGUF u otro formato, algo que este repositorio no proporciona.
- Latencia y throughput: no disponible. No se han publicado mediciones, y la ganancia teórica de la cabeza MTP no está cuantificada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Peso en disco | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| bambocher/Qwen3.8-27B-oQ3.5e-mtp | 27,78B | Mixta 3/4/5/8 bits + BF16 (4,258 bits/peso) | 13,77 GiB | No disponible | No disponible | Checkpoint MLX publicado |
| Qwen3.8-27B (base en BF16, referencia) | 27,78B | BF16 (16 bits/peso) | ~51,7 GiB (calculo aritmetico: 27,78B x 2 bytes) | No disponible | No disponible | No referenciado en la informacion |
| Otras cuantizaciones del mismo base (GGUF, AWQ, GPTQ) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que la comparativa se limita a huella de almacenamiento y formato.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial; hay que contactar con el autor o consultar la licencia del modelo base Qwen3.8-27B antes de cualquier despliegue.
- Sin validación empírica: 0 descargas y 0 likes, sin benchmarks ni métricas de degradación. No hay evidencia publicada de que la cuantización a 3,50 bits en el 78% de los pesos preserve la calidad del original.
- Riesgo de alucinación: no cuantificado. La cuantización agresiva de las capas del modelo de lenguaje puede incrementar la degradación en tareas de razonamiento y matemáticas, pero no se aportan datos al respecto.
- Arquitectura y contexto desconocidos: no se documenta la longitud de contexto soportada, lo que impide planificar despliegues que dependan de ventanas largas.
- Idiomas no declarados: se desconoce el soporte real multilingüe de este checkpoint.
- Criterio de cuantización opaco: no se explica qué capas se mantuvieron en 5, 8 o 16 bits ni con qué criterio, lo que dificulta evaluar la robustez del resultado.
- Dependencia de runtime: al ser un checkpoint MLX, queda fuera de los stacks de inferencia habituales en servidores Linux con GPU NVIDIA; requiere conversión para otros formatos.
- Fecha de creación anómala (2026-10-20) y autor sin historial verificable en la información disponible: conviene tratar el artefacto como experimental.
- La cabeza MTP solo aporta aceleración si el runtime la soporta; no se documenta compatibilidad concreta con versiones de `mlx-lm`.
- La búsqueda web realizada no devolvió resultados pertinentes sobre este modelo, por lo que no hay fuentes externas de contraste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bambocher/Qwen3.8-27B-oQ3.5e-mtp
- Repositorio de la herramienta de cuantización oQ / oMLX (citado en la model card): https://github.com/jundot/omlx
- Paper, blog, demo o repositorio del modelo base: no disponible en la informacion proporcionada
- La busqueda web no devolvio resultados relevantes sobre este modelo
