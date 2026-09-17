# devendradhakad/autodroid-prism-ml-Bonsai-27B-gguf

## Resumen

Bonsai-27B-gguf es un repositorio de pesos en formato GGUF publicado en HuggingFace por el usuario devendradhakad bajo el identificador `devendradhakad/autodroid-prism-ml-Bonsai-27B-gguf`. Los metadatos del repositorio declaran 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) y licencia Apache 2.0, y las etiquetas asociadas son `gguf`, `prismml`, `bonsai`, `endpoints_compatible` y `conversational`. La model card publicada por el autor es un esqueleto de seis líneas que no aporta descripción funcional, arquitectura, datos de entrenamiento ni instrucciones de uso.

El repositorio ocupa 4,4 GB, un tamaño que no es coherente con una cuantización convencional de un modelo de 26,9 mil millones de parámetros: en Q4_K_M estos modelos suelen rondar los 15-16 GB. Esa discrepancia, junto con la ausencia total de documentación, impide determinar si el contenido son los pesos completos, un subconjunto de tensores, una cuantización extremadamente agresiva o un artefacto incompleto.

La relevancia de esta ficha es fundamentalmente preventiva: se trata de un ejemplo de publicación opaca, sin validación comunitaria (0 descargas y 0 me gusta en el momento de la consulta) y con metadatos parcialmente incoherentes (fecha de creación registrada como 2026-09-17). No existe información verificable que permita recomendar su uso en producción ni afirmar qué modelo base lo origina.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 26.895.998.464 (≈26,9 mil millones), según metadatos safetensors del repositorio |
| Parámetros activos | no disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Formato GGUF (etiqueta `gguf`); nivel de cuantización concreto no disponible. El tamaño del repositorio (4,4 GB) no permite inferirlo de forma fiable |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (declarada en las etiquetas del repositorio) |
| Formato de pesos | GGUF (no se especifican variantes Q4, Q5, Q8 ni ficheros individuales) |
| Tamaño del repositorio | 4,4 GB |
| Descargas | 0 |
| Me gusta | 0 |
| Fecha de creación | 2026-09-17T15:05:59.000Z |
| Última actualización | 2026-09-17T15:06:02.000Z (3 segundos después de la creación) |

## Arquitectura y entrenamiento

No disponible. La información proporcionada no incluye ningún dato sobre la arquitectura del modelo (transformer denso, mezcla de expertos, modelo de espacio de estados o arquitectura híbrida), el número de tokens de entrenamiento, la composición del conjunto de datos ni si hubo etapas de ajuste por instrucciones, RLHF o DPO. La model card publicada por el autor no contiene más que la declaración de licencia y las etiquetas `prismml` y `bonsai`, cuyo significado no se explica en ningún momento.

Tampoco es posible identificar el modelo base del que derivarían estos pesos. La nomenclatura del repositorio («autodroid-prism-ml-Bonsai-27B-gguf») sugiere un proceso de conversión a GGUF de un modelo de aproximadamente 27B, pero se desconoce el origen, el tokenizador, la configuración de atención y cualquier innovación técnica. Los resultados de la búsqueda web realizada no contienen información relacionada con el modelo: devuelven páginas de un centro escolar en Dubái, sin conexión alguna con el artefacto analizado.

## Capacidades

No se ha publicado ninguna evaluación funcional del modelo. A partir exclusivamente de las etiquetas del repositorio puede afirmarse lo siguiente:

- Conversación: la etiqueta `conversational` indica que está pensado para diálogo de tipo chat, aunque no se detalla el formato de plantilla ni el esquema de roles.
- Compatibilidad con Inference Endpoints: la etiqueta `endpoints_compatible` sugiere que el artefacto puede desplegarse en los Inference Endpoints de HuggingFace, sin que se especifique el contenedor ni la configuración.
- Generación de texto, razonamiento, código, matemáticas, visión, audio: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking), decodificación especulativa u otras capacidades especiales: no disponible.

## Casos de uso

Los siguientes escenarios son hipótesis de trabajo condicionadas a una validación previa del artefacto. Ninguno debe desplegarse sin comprobar antes la integridad de los pesos, la coherencia de las salidas y la procedencia legal del modelo base.

- Evaluación comparativa interna en laboratorio: cargar el GGUF en llama.cpp con el menor nivel de cuantización disponible y ejecutar un conjunto de prompts fijos para medir perplejidad, coherencia y deriva, comparando los resultados con un modelo de referencia de tamaño similar ya validado.
- Prueba de integración de pipelines GGUF: verificar que el artefacto se carga correctamente en `llama-cpp-python` o en un servidor compatible con la API de OpenAI, con el objetivo de validar la cadena de herramientas y no la calidad del modelo.
- Estudio de reproducibilidad de publicaciones opacas: analizar la discrepancia entre el recuento de parámetros declarado (26,9 mil millones) y el tamaño real del repositorio (4,4 GB) como caso práctico de auditoría de artefactos en HuggingFace.
- Prototipado de interfaces conversacionales sin requisitos de calidad: usar el modelo como sustituto temporal en el desarrollo de una interfaz de chat mientras se resuelve el acceso a un modelo validado, nunca en un entorno con usuarios reales.
- Pruebas de cuantización extrema: si el nivel de cuantización resulta ser muy bajo, emplearlo para estudiar la degradación de calidad en modelos de ~27B comprimidos por debajo de 2 bits por peso.
- Docencia y formación en despliegue local: utilizar el artefacto como ejemplo en talleres sobre cómo inspeccionar metadatos, detectar publicaciones carentes de documentación y decidir si un modelo merece una evaluación en profundidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación, y la búsqueda web realizada no devolvió documentación técnica asociada al modelo.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones aritméticas calculadas a partir del recuento declarado de 26,9 mil millones de parámetros (pesos únicamente, sin caché KV ni sobrecarga del runtime). No proceden de mediciones del artefacto, cuya estructura real se desconoce.

| Precisión o cuantización | Peso estimado de los pesos | VRAM recomendada con contexto moderado |
|---|---|---|
| FP16 / BF16 | ≈54 GB | 80 GB (H100 80 GB, A100 80 GB) |
| Q8_0 | ≈29 GB | 40-48 GB (2× RTX 4090, A100 40 GB) |
| Q6_K | ≈22 GB | 32-40 GB |
| Q5_K_M | ≈19 GB | 24-32 GB (RTX 3090/4090 con contexto corto) |
| Q4_K_M | ≈16 GB | 24 GB (RTX 3090, RTX 4090, L4 24 GB) |
| Q3_K_M | ≈13 GB | 16-24 GB |
| Q2_K | ≈9 GB | 12-16 GB |

- Cabe en GPU de consumo: previsiblemente sí en cuantizaciones Q4_K_M o inferiores sobre RTX 3090, RTX 4090, RTX 5090 o tarjetas de 16-24 GB, siempre que el contexto sea corto y la caché KV no crezca demasiado. La longitud de contexto real es desconocida, por lo que el consumo de caché KV no puede acotarse.
- Memoria unificada: un equipo Apple Silicon con 32 GB o más podría ejecutar cuantizaciones Q4_K_M o Q5_K_M mediante Metal.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y servidores compatibles con la API de OpenAI sobre llama.cpp. vLLM y TGI no ofrecen soporte nativo y estable para GGUF, por lo que no se recomiendan para este artefacto.
- Latencia y throughput: no disponible. No se han publicado mediciones y dependerían por completo del hardware, del nivel de cuantización y del reparto entre CPU y GPU.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa. Los datos técnicos del modelo analizado (contexto, arquitectura, benchmarks, idiomas) no están disponibles, y la información proporcionada no incluye cifras verificables de otros modelos de la misma categoría. La categoría natural de comparación sería la de modelos densos conversacionales de entre 24 y 32 mil millones de parámetros distribuidos en GGUF, pero incluir cifras de esos modelos sin una fuente en la información disponible equivaldría a introducir datos no verificados.

| Modelo | Parámetros | Contexto | Licencia | Benchmarks | Disponibilidad |
|---|---|---|---|---|---|
| Bonsai-27B-gguf (este repositorio) | 26,9B | no disponible | Apache 2.0 | no disponible | GGUF en HuggingFace, 0 descargas |
| Alternativas de la clase 24B-32B densa | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es un esqueleto sin descripción, instrucciones de uso, plantilla de chat ni ejemplos. No es possible saber cómo se debe formatear la entrada.
- Incoherencia de tamaño: 4,4 GB de repositorio frente a 26,9 mil millones de parámetros declarados. Con cuantizaciones habituales (Q4_K_M ≈ 4,8 bits por peso) el repositorio debería rondar los 16 GB. Esto sugiere un artefacto incompleto, un recuento de parámetros erróneo o una compresión no estándar. Verificar la integridad antes de cualquier uso.
- Metadatos poco fiables: la fecha de creación registrada (2026-09-17) y una actualización tres segundos posterior apuntan a un proceso de publicación automatizado, no a un desarrollo documentado.
- Sin validación comunitaria: 0 descargas y 0 me gusta. No hay informes de terceros sobre el comportamiento real del modelo.
- Procedencia de los pesos desconocida: aunque la licencia declarada es Apache 2.0, no se identifica el modelo base ni se aporta prueba de que el autor tenga derecho a redistribuirlo. Existe riesgo legal si el modelo original tuviera una licencia más restrictiva.
- Riesgo de alucinación no evaluado: no se ha medido la tasa de alucinación ni la fidelidad factual.
- Cobertura de idiomas desconocida: no hay garantía de un rendimiento aceptable en castellano.
- Límite de contexto desconocido: imposible dimensionar la caché KV o planificar despliegues con conversaciones largas.
- Resultados de búsqueda no relacionados: las páginas web devueltas por la búsqueda corresponden a un centro escolar de Dubái y no aportan ningún dato sobre el modelo, lo que refuerza la falta de rastro técnico público.
- Recomendación: no utilizar en producción, en servicios con usuarios reales ni en procesos que requieran trazabilidad. Su uso razonable se limita al análisis técnico y a la experimentación aislada.

## Enlaces

- HuggingFace: https://huggingface.co/devendradhakad/autodroid-prism-ml-Bonsai-27B-gguf
- Paper: no disponible
- Blog o anuncio del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
- Otros enlaces relevantes: no se han encontrado en la búsqueda web. Los resultados obtenidos (gemsoo-alwarqa.com y subpáginas de admisiones y tasas académicas) no guardan relación con el modelo y se descartan como fuentes.
