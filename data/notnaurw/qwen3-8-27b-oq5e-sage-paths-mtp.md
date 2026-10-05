# notnaurw/Qwen3.8-27B-oQ5e-SAGE-PATHS-mtp

## Resumen

`notnaurw/Qwen3.8-27B-oQ5e-SAGE-PATHS-mtp` es una cuantización MLX de 5 bits en precisión mixta del modelo `Qwen/Qwen3.8-27B`, publicada por el usuario notnaurw. No es un modelo entrenado desde cero, sino un checkpoint derivado cuyo objetivo declarado es preservar la fidelidad de comportamiento respecto al original en bf16 bajo un presupuesto de almacenamiento fijo, orientado específicamente a cargas de trabajo agénticas de solo texto. El checkpoint ocupa 21,0 GB en el repositorio y contiene 27.320.697.856 parámetros (27,32 mil millones).

La innovación concreta es el pipeline de cuantización SAGE-PATHS (Pruned Activation-guided Tensor Headroom Scale), que parte de una observación práctica: el checkpoint original es un modelo de visión y lenguaje, y su torre de visión ocupa 0,92 GB en bf16, un presupuesto que un agente de texto nunca aprovecha. SAGE-PATHS elimina esa torre y reinvierte los bytes recuperados en margen de precisión para tensores seleccionados del modelo de texto, elegidos por su contribución a la fidelidad de comportamiento sobre un corpus agéntico orientado a SWE y terminal, verificado además en contexto largo.

El resultado es un modelo estrictamente de solo texto: pierde por completo la entrada de imagen y algo de fidelidad generalista respecto a la variante SAGE, pero gana en un archivo más pequeño y con mejor seguimiento del original en tareas agénticas de texto y contexto largo. Se distribuye con el módulo MTP (multi-token prediction) preservado en bf16, pensado para servirse con Lightning MTP habilitado en oMLX. La licencia es Apache 2.0 y, en el momento de la consulta, el repositorio acumula 0 descargas y 0 likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con módulo MTP (etiqueta de arquitectura `qwen3_5`); detalles internos no disponibles |
| Parámetros totales | 27.320.697.856 (27,32 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 5 bits en precisión mixta (esquema oQ5e con asignación SAGE-PATHS); MTP preservado en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `mlx`); no se publican GGUF ni otros formatos |
| Modelo base | Qwen/Qwen3.8-27B (relación: quantized) |
| Modalidad | solo texto (torre de visión podada) |
| Tamaño del repositorio | 21,0 GB |
| Fecha de creación | 2026-10-04 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen3.8-27B`, etiquetado en el repositorio como `qwen3_5`. Se trata de un transformer con un módulo de predicción multi-token (MTP) que en este checkpoint se mantiene en bf16 mientras el resto del modelo se cuantiza a 5 bits. No se dispone de información sobre el número de capas, dimensión oculta, número de cabezas de atención ni mecanismos de atención alternativos, por lo que esos datos quedan como no disponibles. La parte de visión del checkpoint original se ha eliminado por completo: la ficha del autor cifra esa torre en 0,92 GB en bf16.

Sobre el entrenamiento del modelo original no se aporta información en el material disponible: no hay datos sobre número de tokens, composición del dataset, ni sobre etapas de RLHF, DPO u otros ajustes por preferencias. Lo que sí describe el autor es el proceso de cuantización. SAGE-PATHS se presenta como una extensión del pipeline SAGE, que trata la cuantización como un problema de fidelidad restringida: dado un presupuesto de precisión fijo, asignarlo donde mejor preserve el comportamiento del modelo bf16 de origen. SAGE-ARCS mantenía ese objetivo pero cambiaba la distribución usada para medir sensibilidad, lo que altera dónde se preserva la fidelidad. SAGE-PATHS mantiene ambos elementos y cambia el propio espacio de asignación, liberando presupuesto al eliminar la ruta de visión y reinvirtiéndolo en margen de precisión para tensores de texto. Los tensores candidatos se evalúan por su contribución a la fidelidad de comportamiento en bf16 sobre un corpus agéntico de SWE y terminal, y se verifican después en contexto largo. El autor señala que SAGE-PATHS complementa a SAGE y SAGE-ARCS en lugar de sustituirlas: SAGE apunta a fidelidad generalista, SAGE-ARCS la redistribuye, y SAGE-PATHS la especializa en texto agéntico.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base, en la medida en que la cuantización de 5 bits la preserve.
- Cargas de trabajo agénticas de texto: el pipeline de cuantización se optimizó explícitamente sobre un corpus de SWE y operaciones de terminal, lo que sugiere buen comportamiento en tareas de ingeniería de software y uso de shell.
- Comportamiento en contexto largo: el autor indica que la verificación de los tensores seleccionados se realizó a contexto largo, aunque no se especifica la longitud.
- Decodificación acelerada mediante MTP: el módulo de predicción multi-token se conserva en bf16 y está pensado para habilitarse con Lightning MTP en oMLX.
- Ejecución en Apple Silicon mediante MLX.

No se documentan en el material disponible capacidades de tool calling, function calling, razonamiento multi-paso explícito, modo thinking, audio, ni cobertura multilingüe concreta. La entrada de imagen está explícitamente eliminada, por lo que la visión no es una capacidad disponible.

## Casos de uso

- Agentes de ingeniería de software: el autor describe el corpus de calibración de la cuantización como orientado a SWE, de modo que el modelo está pensado para tareas de lectura, modificación y generación de código dentro de flujos agénticos, con el MTP acelerando la decodificación autoregresiva.
- Automatización de terminal y shell: el segundo eje del corpus de calibración son operaciones de terminal, así que encaja en agentes que interpretan salida de comandos, proponen correcciones y encadenan pasos sobre un sistema de archivos.
- Asistentes de texto en local sobre Mac: al ser un checkpoint MLX de 21,0 GB, permite desplegar un modelo de 27,32 mil millones de parámetros en un equipo Apple Silicon con memoria unificada suficiente, sin depender de servicios en la nube.
- Procesamiento de documentos largos en contexto largo: la verificación a contexto largo que menciona el autor apunta a cargas donde se ingiere documentación extensa (repositorios, logs, especificaciones) y se razona sobre ella en una sola ventana, siempre que se confirme la longitud de contexto real del modelo base.
- Generación de código en pipelines internos: integrable como paso de generación dentro de CI/CD o de herramientas de revisión, con la ventaja de ser un modelo local con licencia Apache 2.0 y sin coste por token.
- Evaluación y comparación de esquemas de cuantización: dado que el autor sitúa SAGE-PATHS junto a SAGE y SAGE-ARCS como variantes con objetivos distintos, este checkpoint sirve como referencia experimental para medir el impacto de podar la visión y reinvertir ese presupuesto en precisión de texto.
- Sustitución de la variante bf16 en entornos con memoria limitada: cuando el checkpoint original no cabe en el hardware disponible, esta versión de 5 bits mantiene el comportamiento de texto con un tamaño de repositorio de 21,0 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor describe únicamente la metodología de cuantización y afirma que el checkpoint sigue más de cerca al original en bf16 en cargas agénticas de texto y en contexto largo, pero no incluye tablas de MMLU, HumanEval, GSM8K, SWE-bench ni de ninguna otra métrica estandarizada. Tampoco se comparan numéricamente las variantes SAGE, SAGE-ARCS y SAGE-PATHS entre sí.

## Requisitos de hardware

- El repositorio ocupa 21,0 GB, de los cuales la mayor parte corresponde a los pesos cuantizados a 5 bits y al módulo MTP en bf16. A esa cifra hay que sumar la caché KV y el consumo del sistema operativo.
- Memoria unificada estimada en Apple Silicon: 32 GB es el mínimo teórico y queda muy justo con contexto moderado; 48 GB o 64 GB ofrecen margen razonable. Estas cifras son estimaciones a partir del tamaño del repositorio, no datos publicados por el autor.
- GPU dedicadas: no se documenta soporte CUDA. Al ser un checkpoint MLX, no es directamente ejecutable en A100, H100 ni RTX 4090 sin una conversión previa a otro formato, que no se distribuye.
- El MTP está diseñado para habilitarse con Lightning MTP en oMLX, lo que implica aceleración de decodificación respecto a la generación token a token convencional.
- Opciones de despliegue documentadas: MLX y oMLX (con MTP). No se proporcionan pesos GGUF, por lo que llama.cpp y Ollama no son utilizables sin convertir. No se menciona soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Modalidad | Cuantización | Presupuesto/fidelidad | Licencia |
|---|---|---|---|---|---|
| notnaurw/Qwen3.8-27B-oQ5e-SAGE-PATHS-mtp | 27,32 mil millones | Solo texto | 5 bits mixta, MTP en bf16 | Optimizada para texto agéntico (SWE y terminal), pierde fidelidad generalista | Apache 2.0 |
| Qwen/Qwen3.8-27B (base) | 27,32 mil millones | Texto e imagen | bf16 | Referencia de fidelidad; incluye torre de visión de 0,92 GB | Apache 2.0 (según el derivado) |
| Variante SAGE | no disponible | No disponible | No disponible | Fidelidad generalista | No disponible |
| Variante SAGE-ARCS | no disponible | No disponible | No disponible | Redistribuye la fidelidad cambiando la distribución de sensibilidad | No disponible |

No se dispone de datos de rendimiento comparado entre estas variantes, por lo que la comparación se limita a los objetivos declarados por el autor y no a métricas medidas. No se identifican en la información proporcionada modelos de terceros comparables.

## Limitaciones y advertencias

- Modelo de solo texto: la torre de visión ha sido eliminada, por lo que cualquier caso de uso con imágenes es inviable.
- Pérdida de fidelidad generalista: el propio autor indica que SAGE-PATHS cede algo de fidelidad generalista respecto a la variante SAGE a cambio de mejor comportamiento en texto agéntico y contexto largo.
- Cuantización de 5 bits: aunque sea en precisión mixta y guiada por sensibilidad, implica degradación respecto al bf16 en tareas fuera del corpus de calibración (SWE y terminal), incluidas aquellas de razonamiento general o dominios no representados.
- Riesgo de alucinación: no se documenta ningún ajuste específico contra la generación de contenido falso, y el material disponible no incluye evaluaciones de veracidad.
- Sesgos: no se proporciona información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento del modelo base.
- Idiomas: no se especifica qué idiomas soporta el modelo base ni si la cuantización afecta de forma desigual a lenguas distintas del inglés, siendo el corpus de calibración presumiblemente técnico y en inglés.
- Longitud de contexto: no disponible, lo cual impide planificar cargas de contexto largo con cifras concretas a pesar de que el autor mencione verificación en contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `Qwen/Qwen3.8-27B` y las condiciones de los términos de Qwen aplicables.
- Madurez del repositorio: 0 descargas y 0 likes, creado y actualizado con pocos minutos de diferencia, sin benchmarks publicados ni validación externa. No es un artefacto con historial de uso en producción.
- Dependencia de herramienta: el rendimiento documentado depende de servirse con Lightning MTP en oMLX; otros runners MLX pueden no aprovechar el módulo MTP.
- La model card disponible está truncada, por lo que parte de la justificación técnica del autor no se ha podido consultar completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/notnaurw/Qwen3.8-27B-oQ5e-SAGE-PATHS-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oMLX: https://github.com/jundot/omlx
