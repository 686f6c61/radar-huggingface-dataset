# prometheusAIR/Ripple-65B-Preview-GGUF

## Resumen

Ripple-65B-Preview-GGUF es un repositorio de cuantizaciones GGUF del modelo Ripple-65B-Preview, un transformer denso de 64.782.689.360 parámetros (aproximadamente 65B) desarrollado por Ricursive Intelligence. El repositorio lo publica prometheusAIR e incluye cinco cuantizaciones (Q8_0, Q6_K_XL, Q6_K, IQ3_S e IQ3_XXS) generadas a partir de los pesos BF16 originales, además de un parche para llama.cpp que añade soporte para la arquitectura `ricursive`.

La relevancia de esta publicación es doble. Por un lado, ofrece opciones de despliegue para GPUs de 96 GB (tres cuantizaciones, dos de ellas alcanzando el contexto completo de 1.048.576 tokens) y para GPUs de 32 GB (dos cuantizaciones IQ3 con 32K y 96K de contexto). Por otro, documenta con mediciones de divergencia KL frente a BF16 por qué las recetas estándar de llama.cpp para 3 bits degradan gravemente este modelo, y propone recetas alternativas que concentran bits en las proyecciones de atención.

El modelo base está etiquetado como de contexto largo, tool-use y razonamiento, con licencia Apache 2.0. No se dispone de información sobre idiomas soportados ni de resultados de benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura `ricursive` en llama.cpp) |
| Parametros totales | 64.782.689.360 (aprox. 65B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.048.576 tokens (máximo soportado por las cuantizaciones Q6_K y Q6_K_XL en 96 GB) |
| Tipos de cuantizacion | Q8_0, Q6_K_XL, Q6_K, IQ3_S, IQ3_XXS |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado desde BF16 GGUF); el modelo base se distribuye en BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 65B parámetros. La model card del repositorio de cuantizaciones aporta un dato estructural relevante: las proyecciones de atención son inusualmente anchas, con las proyecciones de query, gate y output de 10.240 dimensiones, el doble del tamaño oculto. El modelo incluye además un mecanismo de mezcla de residuales por capa (*per-layer value-residual mix*) almacenado en F32 en todas las cuantizaciones. La distribución de pesos por grupos de tensores es la siguiente: feed-forward gate/up/down (240 tensores) representan el 77,7% de los pesos; atención q/k/v/output/gate (400 tensores) el 20,7%; y `token_embd` más `output` el 1,6%.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. La model card del repositorio de cuantizaciones tampoco detalla innovaciones de decodificación o atención más allá de la arquitectura base. El parche de llama.cpp se validó contra el código de modelado original de Ricursive antes de generar ninguna cuantización, y cada cuantización se midió contra los pesos BF16, no contra otra cuantización.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento (*reasoning*), según las etiquetas del autor.
- Uso de herramientas (*tool-use*), según las etiquetas del autor.
- Contexto largo: hasta 1.048.576 tokens en las cuantizaciones Q6_K y Q6_K_XL sobre una GPU de 96 GB.
- Capacidades multilingües: no disponible.
- Modo de pensamiento (*thinking mode*), visión o audio: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente más allá de la etiqueta `reasoning`.

## Casos de uso

- Procesamiento de documentos extensos: con hasta 1.048.576 tokens de contexto en Q6_K o Q6_K_XL sobre 96 GB, el modelo puede ingerir libros completos, expedientes o bases de código en una sola pasada sin recuperación externa.
- Asistentes de código con contexto de repositorio: la ventana de 1M tokens permite incluir múltiples ficheros y el historial de cambios en el prompt; el soporte declarado de tool-use facilita la integración con herramientas de ejecución y edición.
- Despliegue en estaciones de trabajo con GPU de 32 GB: las cuantizaciones IQ3_S (27,58 GiB, 32K de contexto) e IQ3_XXS (25,38 GiB, 96K de contexto) permiten ejecutar un modelo de 65B en hardware de consumo profesional, a costa de mayor divergencia KL.
- Análisis de trazas y logs de larga duración: la ventana de 96K de IQ3_XXS en 32 GB es adecuada para correlacionar eventos distribuidos en ficheros de log voluminosos.
- Evaluación de calidad de cuantizaciones: el repositorio sirve como referencia metodológica para equipos que necesiten medir divergencia KL y coincidencia top-1 frente a BF16 antes de elegir una cuantización para producción.
- Investigación sobre arquitecturas no soportadas en llama.cpp: el parche incluido permite estudiar el comportamiento de la arquitectura `ricursive` en un runtime ampliamente utilizado, con la opción de contribuir el soporte upstream.
- Razonamiento con cadenas largas: la combinación de contexto de 1M tokens y la etiqueta `reasoning` permite mantener trazas de razonamiento extensas y múltiples intentos dentro de una misma ventana.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros). Sí publica métricas de fidelidad de cuantización y de rendimiento de inferencia medidas contra BF16:

| Metrica | Q8_0 | Q6_K_XL | Q6_K | IQ3_S | IQ3_XXS |
|---|---|---|---|---|---|
| Tamano de fichero | 64,11 GiB | 52,76 GiB | 49,50 GiB | 27,58 GiB | 25,38 GiB |
| Divergencia KL media vs BF16 | 0,0027 | 0,0036 | 0,0053 | 0,066 | 0,085 |
| Divergencia KL mediana | 0,00026 | 0,00043 | 0,00082 | 0,022 | 0,030 |
| Divergencia KL percentil 99 | 0,026 | 0,037 | 0,059 | 0,77 | 0,96 |
| Mismo token top-1 que BF16 | 98,59% | 98,20% | 97,74% | 89,98% | 88,30% |
| Perplejidad vs BF16 | +0,28% | +0,02% | −0,30% | +0,90% | +2,52% |
| Contexto en 96 GB (KV q8_0) | 753.664 | 1.048.576 | 1.048.576 | no aplica | no aplica |
| Contexto en 32 GB | no aplica | no aplica | no aplica | 32.768 | 98.304 |
| Decodificacion, caja de referencia, prompt corto | 22,0 tok/s | 26,2 tok/s | 27,4 tok/s | 42,8 tok/s | 46,0 tok/s |

Como referencia de ruido de medición, los propios pesos BF16 ejecutados dos veces con distinto tamaño de lote y colocación de capas arrojan una divergencia KL media de 0,00045 entre ejecuciones, con un 99,59% de tokens top-1 idénticos. El autor advierte que la perplejidad no es una medida de calidad fiable en este modelo y recomienda usar las columnas de KL. Q8_0 alcanza 1.710 tok/s de prefill a 32K, frente a 1.448 tok/s de Q6_K_XL.

## Requisitos de hardware

- VRAM estimada para inferencia: de 25,38 GiB (IQ3_XXS) a 64,11 GiB (Q8_0) solo para pesos; el contexto consume VRAM adicional según el tipo de KV cache (q8_0 o f16).
- GPU de 96 GB: una sola unidad ejecuta Q8_0 (hasta 753.664 tokens de contexto), Q6_K_XL y Q6_K (ambas hasta 1.048.576 tokens). Las etiquetas del repositorio mencionan RTX PRO 6000 y Blackwell como hardware de referencia.
- GPU de 32 GB: IQ3_S (32.768 tokens de contexto) e IQ3_XXS (98.304 tokens de contexto), ambas con KV cache q8_0.
- GPU de consumo: no se documenta soporte para GPUs de menos de 32 GB; el modelo base de 65B en BF16 requiere aproximadamente 130 GB solo en pesos.
- Opciones de despliegue: llama.cpp con el parche `patches/llama.cpp-ricursive.patch` aplicado sobre el commit upstream `6f1e654`. No hay soporte en llama.cpp upstream ni en otros runtimes documentados (vLLM, TGI, Ollama) en la información disponible.
- Throughput medido en la caja de referencia con prompt corto: 22,0 tok/s (Q8_0), 26,2 tok/s (Q6_K_XL), 27,4 tok/s (Q6_K), 42,8 tok/s (IQ3_S) y 46,0 tok/s (IQ3_XXS). Prefill a 32K: 1.710 tok/s (Q8_0) y 1.448 tok/s (Q6_K_XL).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Ripple-65B-Preview (este repo, GGUF) | 64,78B denso | hasta 1.048.576 tokens | Apache 2.0 | GGUF con parche de llama.cpp |
| Ripple-65B-Preview (BF16, ricursiveAI) | 64,78B denso | no disponible en la información | Apache 2.0 | BF16 en Hugging Face |
| Ripple-65B-Preview-NVFP4 (ricursiveAI) | 64,78B denso | no disponible en la información | no disponible | NVFP4; solo cuantiza feed-forward y mantiene atención en BF16 |
| Otras alternativas de ~65B denso | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye modelos comparables de terceros con datos verificables de rendimiento, por lo que no se establece comparación de benchmarks.

## Limitaciones y advertencias

- Requiere un llama.cpp parcheado: el soporte de la arquitectura `ricursive` no está en upstream (sin pull request a fecha de 2026-11-04), lo que bloquea el uso con vLLM, TGI, Ollama y otras herramientas que dependan de llama.cpp sin parchear.
- Las recetas estándar de IQ3 de llama.cpp son inadecuadas para este modelo: la receta stock de IQ3_XXS puntúa una divergencia KL de 0,581 y +68% de perplejidad, frente a 0,085 de la receta propia del autor. Usar recetas genéricas de terceros sin validación puede degradar gravemente la calidad.
- Las cuantizaciones IQ3 pierden aproximadamente un 10-12% de coincidencia top-1 frente a BF16 y multiplican por más de 20 la divergencia KL media respecto a Q8_0; no son adecuadas si la fidelidad es crítica.
- La perplejidad no es una medida de calidad fiable en este modelo según el autor; deben usarse las métricas de KL y coincidencia top-1.
- Idiomas soportados no documentados: no es posible evaluar el comportamiento multilingüe ni el sesgo lingüístico.
- Sesgos conocidos y tasa de alucinación: no disponible en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base es una versión "Preview" y no se documentan garantías ni limitaciones de uso adicionales.
- El contexto máximo de 1M tokens solo es alcanzable con Q6_K o Q6_K_XL en 96 GB; en 32 GB el máximo es de 98.304 tokens con IQ3_XXS.
- El repositorio tiene 161 descargas y 2 likes en el momento de la consulta; la validación comunitaria es todavía muy limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prometheusAIR/Ripple-65B-Preview-GGUF
- Ficheros del repositorio: https://huggingface.co/prometheusAIR/Ripple-65B-Preview-GGUF/tree/main
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Versión NVFP4 del modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Parche de llama.cpp: `patches/llama.cpp-ricursive.patch` dentro del repositorio GGUF (aplicable sobre el commit upstream `6f1e654`)
