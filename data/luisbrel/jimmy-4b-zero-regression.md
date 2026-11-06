# luisbrel/jimmy-4b-zero-regression

## Resumen

JIMMY-4B-ZERO-REGRESSION es un checkpoint experimental publicado por el usuario luisbrel en HuggingFace, derivado del modelo google/gemma-4-e4b-it mediante un proceso de post-entrenamiento basado en un bucle de auto-mejora recursiva (RSI, *recursive self-improvement*). El autor indica que el ajuste se realizó localmente sobre hardware Apple Silicon (M4 Max) y que no empleó destilación de un modelo profesor ni un pipeline convencional de fine-tuning por descenso de gradiente. El modelo se distribuye en formato MLX cuantizado a 4 bits, pensado para inferencia nativa en chips de Apple.

El checkpoint cuenta con 7.463.013.418 parámetros según los pesos en safetensors, aunque el nombre comercial lo etiqueta como "4B" (probablemente por herencia de la nomenclatura del modelo base, que en Gemma se refiere a parámetros efectivos o activos). El tamaño del repositorio es de 4,2 GB, coherente con una cuantización de 4 bits. La longitud de contexto, el número de tokens de entrenamiento y la composición del dataset no se detallan en la información disponible.

Su relevancia es limitada pero ilustrativa: se presenta como una prueba de concepto de post-entrenamiento sin gradientes sobre Apple Silicon, con una evaluación local de 56 generaciones que reporta mejoras en matemáticas y ciencia respecto al modelo base. No obstante, el tamaño muestral es muy reducido y el modelo tiene cero descargas en el momento de la ficha, por lo que debe considerarse estrictamente experimental.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Gemma-4-E4B-it); detalles internos no disponibles |
| Parametros totales | 7.463.013.418 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 (heredada del modelo base, con enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors, formato MLX (mlx-lm) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo google/gemma-4-e4b-it, un transformer de la familia Gemma 4. La información proporcionada no detalla el número de capas, dimensiones ocultas, mecanismos de atención ni si incorpora componentes MoE. El checkpoint se distribuye cuantizado a 4 bits en formato MLX, lo que reduce el peso a 4,2 GB y permite ejecución en memoria unificada de Apple Silicon.

El método de entrenamiento declarado es un bucle de auto-mejora recursiva (RSI): se generan versiones candidatas, se evalúan contra objetivos de generación reales y solo se retienen las iteraciones prometedoras. El autor afirma explícitamente que no se usó destilación de un modelo profesor ni un pipeline convencional de descenso de gradiente. También declara una "descontaminación certificada" con cero solapamiento de 13-gramas respecto a los splits de los benchmarks evaluados. No se especifica el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat aplicable mediante `tokenizer.apply_chat_template`.
- Razonamiento matemático multi-paso y matemáticas de competición, según la evaluación local del autor.
- Generación de código Python (evaluado con HumanEval en la model card).
- Cumplimiento de restricciones estrictas de formato e instrucciones (IFEval).
- Razonamiento científico a nivel de educación secundaria (ARC-Challenge).
- *Grounding* de GUI y DOM, según la suite incluida en la evaluación del autor.
- Capacidades multilingües: solo inglés declarado.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- **Prototipado de razonamiento matemático en local**: el modelo puede resolver problemas aritméticos y algebraicos multi-paso en un Mac con Apple Silicon, útil para experimentar con asistentes de estudio sin conexión a la nube. La mejora reportada en GSM8K (+25 puntos) sugiere que el post-entrenamiento RSI incidió en este tipo de tareas.
- **Generación de código en entornos sin GPU dedicada**: al ejecutarse con `mlx-lm` sobre memoria unificada, permite autocompletar y generar funciones Python en un portátil Mac, integrándose en editores o scripts locales. HumanEval se mantiene en el 75% del modelo base, sin regresión según el autor.
- **Evaluación de técnicas de post-entrenamiento sin gradientes**: investigadores interesados en RSI pueden usar este checkpoint como referencia reproducible de un pipeline alternativo al fine-tuning clásico, comparando sus resultados con el modelo base.
- **Asistentes conversacionales de un solo idioma en edge**: para aplicaciones en inglés desplegadas en dispositivos Apple, el formato MLX 4-bit reduce el consumo de memoria y permite respuestas conversacionales con latencia local aceptable.
- **Generación con restricciones de formato estrictas**: dado el 100% en IFEval, puede emplearse para producir salidas JSON, listas o plantillas con requisitos de formato rígidos en pipelines de extracción de datos.
- **Automatización de tareas de interfaz (GUI/DOM)**: la suite de *grounding* evaluada sugiere uso potencial en agentes que localizan elementos de interfaz a partir de descripciones en lenguaje natural, aunque la evidencia es limitada (8 generaciones por suite).
- **Investigación educativa en ciencia**: con un 87,5% en ARC-Challenge según el autor, puede servir como base para tutores de ciencias a nivel escolar en inglés.

## Benchmarks y rendimiento

Los datos provienen exclusivamente de la evaluación local del autor: 56 generaciones, ocho por suite y dos ensayos. El tamaño muestral es muy pequeño (8 generaciones por suite), por lo que los porcentajes tienen alta varianza y no deben compararse con evaluaciones estándar de la industria.

| Suite | Gemma-4 base | jimmy-4b-zero-regression | Delta |
|---|---|---|---|
| GSM8K (matemáticas multi-paso) | 50,0% | 75,0% | +25,0 |
| MATH-500 (matemáticas de competición) | 25,0% | 37,5% | +12,5 |
| HumanEval (código Python) | 75,0% | 75,0% | 0,0 |
| IFEval (restricciones estrictas) | 100,0% | 100,0% | 0,0 |
| ARC-Challenge (ciencia) | 75,0% | 87,5% | +12,5 |
| Artificial Analysis v5 Multi-Quadrant | 100,0% | 100,0% | 0,0 |
| GUI & DOM Grounding | 62,5% | 75,0% | +12,5 |
| Media macro | 69,6% | 78,6% | +9,0 |

Desglose por ensayo (relevante para juzgar estabilidad):

| Suite | Base ensayo 1 | Base ensayo 2 | Final ensayo 1 | Final ensayo 2 |
|---|---|---|---|---|
| GSM8K | 75,0% | 25,0% | 75,0% | 75,0% |
| MATH-500 | 25,0% | 25,0% | 50,0% | 25,0% |
| HumanEval | 75,0% | 75,0% | 75,0% | 75,0% |
| IFEval | 100,0% | 100,0% | 100,0% | 100,0% |
| ARC-Challenge | 100,0% | 50,0% | 100,0% | 75,0% |
| Artificial Analysis v5 | 100,0% | 100,0% | 100,0% | 100,0% |
| GUI & DOM Grounding | 50,0% | 75,0% | 75,0% | 75,0% |

No se han publicado resultados de benchmarks independientes ni estandarizados en la información disponible.

## Requisitos de hardware

- **VRAM/memoria**: el repositorio ocupa 4,2 GB en cuantización 4-bit; se necesita al menos esa cantidad de memoria unificada más el espacio para el contexto y el runtime de MLX. En la práctica, un Mac con 16 GB de memoria unificada debería poder cargarlo con margen.
- **GPU recomendadas**: el modelo está empaquetado para MLX, por lo que el hardware objetivo son chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se distribuyen pesos en formatos para CUDA (GGUF, safetensors estándar para transformers), por lo que su uso en GPU NVIDIA o AMD requeriría conversión no documentada.
- **Consumer GPU**: no aplica en el sentido habitual; el equivalente es un Mac con Apple Silicon. No hay indicación de que funcione directamente en RTX 4090 u otras GPU de consumo sin reconversión.
- **Despliegue**: `mlx-lm` es la vía documentada (`pip install mlx-lm` y `mlx_lm.load`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles. El autor solo indica que las evaluaciones se ejecutaron con generaciones autorregresivas reales sobre Metal en un M4 Max.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| jimmy-4b-zero-regression | 7,46 mil millones (4-bit) | no disponible | Apache 2.0 | MLX safetensors | HuggingFace, 0 descargas |
| google/gemma-4-e4b-it (base) | no disponible en la información | no disponible | Gemma 4 (Apache 2.0 según enlace) | safetensors | HuggingFace, modelo oficial |
| Alternativas de tamaño similar (p. ej. Gemma 3 4B, Qwen 2.5 7B) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas externas no puede completarse con rigor porque la información proporcionada no incluye datos de otros modelos. La única comparación documentada es contra el modelo base, con las cifras de la sección de benchmarks.

## Limitaciones y advertencias

- **Evaluación no fiable estadísticamente**: 8 generaciones por suite y dos ensayos implican intervalos de confianza muy amplios; una diferencia de +12,5 puntos equivale a una sola generación acertada de más. La varianza entre ensayos del modelo base (GSM8K 75% vs 25%) evidencia la inestabilidad de la medición.
- **Cero validación independiente**: no hay benchmarks de terceros, ni descargas, ni comunidad que haya replicado los resultados.
- **Riesgo de alucinación**: inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- **Idioma**: solo inglés declarado; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- **Contexto**: la longitud de contexto no se especifica, lo que impide planificar aplicaciones que dependan de ventanas largas.
- **Licencia**: Apache 2.0 heredada, pero el enlace apunta a la licencia de Gemma 4 de Google; conviene verificar los términos de uso comercial de la familia Gemma antes de desplegar en producción.
- **Formato restringido**: al estar en MLX, no es directamente utilizable en infraestructura CUDA; requiere conversión y validación adicionales.
- **Método no reproducible**: el autor no publica detalles del bucle RSI, hiperparámetros ni datos de entrenamiento, por lo que el proceso no es auditable.
- **Nombre engañoso**: la etiqueta "4B" no coincide con los 7,46 mil millones de parámetros del checkpoint; conviene no asumir el tamaño por el nombre.
- **Madurez**: creado y actualizado el mismo día (2026-11-05), sin historial de mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/luisbrel/jimmy-4b-zero-regression
- Modelo base: https://huggingface.co/google/gemma-4-e4b-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
