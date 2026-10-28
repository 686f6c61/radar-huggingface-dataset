# dview-io/Llama-Prompt-Guard-2-22M-dlens

## Resumen

`dview-io/Llama-Prompt-Guard-2-22M-dlens` es un repositorio alojado en HuggingFace por el usuario `dview-io` cuyo nombre indica una conversión o derivado en formato ONNX del modelo Meta Llama Prompt Guard 2 en su variante de 22 millones de parámetros. El repositorio contiene únicamente pesos en formato ONNX (el tag declarado es `onnx`) y no incluye model card descriptiva más allá de la declaración de licencia `llama4`.

La información pública disponible es mínima: cero descargas, cero "likes", sin pipeline declarado, sin idiomas declarados y sin métricas de evaluación. El tamaño del repositorio es de 0,1 GB, coherente con un modelo de 22M de parámetros exportado a ONNX junto con posibles ficheros auxiliares de tokenizador o configuración.

Por el nombre y por el tamaño, cabe inferir que se trata de un clasificador de seguridad (detección de inyección de prompt y jailbreak) derivado de la familia Prompt Guard 2 de Meta, pero esta afirmación **no está confirmada** en la información proporcionada y debe verificarse antes de cualquier uso en producción. El sufijo `dlens` no está documentado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del repositorio sugiere un derivado de Llama Prompt Guard 2; sin confirmar) |
| Parametros totales | 22M (según el nombre del repositorio; no verificado en la información disponible) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene formato ONNX; se desconoce la precisión de exportación) |
| Idiomas soportados | no disponible |
| Licencia | `llama4` (Llama 4 Community License) |
| Formato de pesos | ONNX (tag `onnx`; tamaño de repo 0,1 GB) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la información disponible. El repositorio no incluye model card técnica, ni detalles de capas, ni configuración de atención. El nombre del modelo apunta a la familia Llama Prompt Guard 2 (un clasificador derivado de la arquitectura Llama, habitualmente empleado para tareas de clasificación de seguridad), pero se desconoce si este repositorio reproduce esa arquitectura, la modifica o únicamente la reexporta a ONNX.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens utilizados, la composición del dataset, ni si hubo fases de ajuste fino supervisado, RLHF o DPO. No se documenta ninguna innovación técnica específica (decodificación especulativa, atención lineal, destilación u otras). Cualquier afirmación al respecto sería especulativa.

## Capacidades

- No hay información verificada sobre las capacidades del modelo en la documentación disponible.
- Por el tamaño (22M de parámetros) y por el nombre, es plausible que se trate de un clasificador binario o de baja granularidad orientado a detección de prompt injection y jailbreak, pero **no está confirmado**.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas en el repositorio).
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

Dado que no se documentan capacidades verificadas, los siguientes casos son hipótesis de trabajo basadas en el nombre y el tamaño del modelo, y requieren validación empírica antes de su adopción:

- Filtro de entrada en aplicaciones LLM: si el modelo confirma ser un clasificador de seguridad, podría colocarse delante de un chatbot para etiquetar prompts sospechosos de inyección antes de enviarlos al modelo generativo principal.
- Moderación en pipelines de bajo coste: con 22M de parámetros y formato ONNX, podría ejecutarse en CPU con latencias de milisegundos, adecuado para prefiltrar grandes volúmenes de peticiones.
- Despliegue en el navegador: al estar en ONNX, podría cargarse con ONNX Runtime Web o transformers.js para clasificación local en cliente, sin enviar texto a un servidor.
- Prefiltro en sistemas de agentes: descartar instrucciones adversariales antes de que un agente con acceso a herramientas las procese.
- Evaluación de robustez de otros modelos: usar el clasificador como juez auxiliar en pruebas de red teaming internas para medir la tasa de prompts maliciosos que superan un filtro.
- Clasificación en entornos con recursos limitados: dispositivos edge, contenedores pequeños o funciones serverless donde un modelo de miles de millones de parámetros no es viable.
- En todos los casos, la idoneidad real depende de métricas que no están publicadas (precisión, recall, tasa de falsos positivos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones aritméticas derivadas del tamaño declarado de 22M de parámetros, no medidas publicadas:

- VRAM estimada en fp32: ~88 MB de pesos; en fp16: ~44 MB; en int8: ~22 MB. A ello hay que sumar el consumo del runtime y del tokenizador.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada para este tamaño; una NVIDIA T4, L4 o incluso una RTX 3060 ejecutarían la inferencia sin cuello de botella de memoria.
- Cabe holgadamente en GPU de consumo (RTX 4090, RTX 3060, GTX 1650) y en iGPU/NPU domésticas.
- Opciones de despliegue coherentes con el formato: ONNX Runtime (CPU, CUDA, TensorRT, DirectML), ONNX Runtime Web / transformers.js para navegador, `optimum` para integración con Transformers, y backends de inferencia con soporte ONNX como Triton. No se confirma compatibilidad con vLLM, llama.cpp u Ollama, que no son el destino natural de un artefacto ONNX de este tipo.
- Latencia y throughput: no disponibles. Con 22M de parámetros y secuencias cortas, se esperaría un throughput alto en CPU, pero es una expectativa, no un dato medido.

## Comparativa con modelos similares

No se dispone de datos verificados de este repositorio (ni benchmarks, ni contexto, ni arquitectura confirmada), por lo que la comparación se limita a aspectos formales:

| Modelo | Parametros | Contexto | Licencia | Formato | Datos publicos |
|---|---|---|---|---|---|
| dview-io/Llama-Prompt-Guard-2-22M-dlens | 22M (según nombre) | no disponible | llama4 | ONNX | Prácticamente nulos (0 descargas, sin model card) |
| Meta Llama Prompt Guard 2 (22M) | 22M | no disponible en esta ficha | llama4 | safetensors (habitual) | Existe model card oficial; no consultada aquí |
| Meta Llama Prompt Guard (86M) | 86M | no disponible en esta ficha | llama (versión previa) | safetensors (habitual) | Existe model card oficial; no consultada aquí |
| Clasificadores tipo DeBERTa/MiniLM para moderación | 20M–300M | variable | MIT/Apache en muchos casos | safetensors, ONNX | Benchmarking público variable |

Las filas de modelos alternativos se incluyen solo como referencia de categoría; sus datos no han sido verificados en la información proporcionada y deben contrastarse en sus repositorios oficiales.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card técnica, ni descripción de entrenamiento, ni evaluación. No se puede determinar qué hace el modelo ni con qué fiabilidad.
- Repositorio sin tracción: 0 descargas y 0 "likes" en el momento de la consulta, lo que impide inferir validación por parte de la comunidad.
- Identidad del autor no verificada: `dview-io` no es el propietario original de la familia Prompt Guard; se trata de un tercero que publica un artefacto derivado. Conviene auditar el fichero ONNX antes de desplegarlo.
- Licencia `llama4`: la Llama 4 Community License impone condiciones específicas (umbral de usuarios activos mensuales, obligaciones de atribución, política de uso aceptable). Es responsabilidad del integrador revisar el texto completo antes de un uso comercial.
- Riesgo de alucinación: no aplicable si el modelo es un clasificador; indeterminable si es generativo, ya que no se especifica la tarea.
- Sesgos: no documentados. Un clasificador de seguridad mal calibrado puede generar falsos positivos que bloqueen a usuarios legítimos, especialmente en idiomas distintos del inglés; no se declaran idiomas soportados.
- Limitaciones de contexto: se desconoce la longitud máxima de entrada; los clasificadores de esta familia suelen truncar textos largos, lo que puede permitir ataques por sufijo.
- Riesgo de seguridad del propio artefacto: al ser un fichero ONNX de un tercero sin trazabilidad, existe riesgo de manipulación (por ejemplo, pesos alterados o grafo con operadores inesperados). Se recomienda cargarlo en un entorno aislado y verificar la integridad.
- No usar en producción sin una evaluación propia sobre un conjunto de validación representativo de los prompts reales del sistema.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dview-io/Llama-Prompt-Guard-2-22M-dlens
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código, demos ni documentación adicional asociados a este repositorio.
