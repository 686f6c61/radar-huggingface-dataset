# mradermacher/Signal-3.8-27B-Terse-Coder-i1-GGUF

## Resumen

Signal-3.8-27B-Terse-Coder-i1-GGUF es la版本 cuantizada en formato GGUF del modelo vwdubb/Signal-3.8-27B-Terse-Coder, un merge de un adaptador LoRA sobre una base de la familia Qwen3.8-27B, según indican la etiqueta `qwen3_8` y la propia denominación del modelo. La cuantización la publica mradermacher, autor reconocido por distribuir versiones GGUF con calibración imatrix, y está pensada para ejecutar un modelo de 27.320.697.856 parámetros (unos 27,3B) en hardware de consumo mediante llama.cpp y derivados.

El modelo se presenta con las etiquetas `reasoning`, `coding`, `token-efficient` y `conversational`, de modo que su objetivo declarado es la generación de código y el razonamiento con respuestas concisas, reduciendo el número de tokens de salida. La licencia declarada en el repositorio es Apache-2.0 y el único idioma soportado es el inglés.

El repositorio es de publicación muy reciente (25 de septiembre de 2026) y, en el momento de redactar esta ficha, no acumula descargas ni valoraciones, además de no incluir resultados de benchmarks ni detalle sobre el dataset de entrenamiento. La información disponible sobre arquitectura, contexto o capacidades proviene principalmente de la receta de vLLM del modelo base Qwen3.8-27B y debe tratarse como indicativa, no como confirmada por el autor del merge.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (atención lineal en 48 de 64 capas) y torre de visión, según la receta de vLLM de Qwen3.8-27B; no detallada en la model card del merge |
| Parametros totales | 27.320.697.856 (unos 27,3B, dato de safetensors) |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE en la información disponible |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1M, según la receta de vLLM de Qwen3.8-27B (arquitectura base probable); no confirmado en la model card del merge |
| Tipos de cuantizacion | Repositorio i1 (imatrix): imatrix, i1-Q2_K, i1-IQ3_M publicados. La metadata lista además Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ4_XS, small-IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (la declarada en el repositorio de cuantización) |
| Formato de pesos | GGUF (repositorio i1 con imatrix); safetensors en el modelo base sin cuantizar |
| Tamano del repositorio | 39,5 GB |
| Vision | Sí, según la model card; los ficheros mmproj, si existen, están en el repositorio estático |
| Fecha de publicación | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del merge. La información disponible sobre la arquitectura subyacente procede de la receta de vLLM para Qwen3.8-27B, que describe un modelo denso de 27.000 millones de parámetros con atención híbrida: atención lineal en 48 de las 64 capas y atención completa en el resto, torre de visión integrada, cabeza MTP (multi-token prediction) incorporada para decodificación especulativa, ventana de contexto nativa de 262.144 tokens y extensión hasta 1M. Dado que el modelo se denomina Signal-**3.8**-27B y lleva la etiqueta `qwen3_8`, es razonable asumir que esta es la arquitectura base, pero el autor de la cuantización no lo confirma explícitamente.

En cuanto al entrenamiento, las etiquetas `merge` y `lora` indican que Signal-3.8-27B-Terse-Coder se construyó fusionando un adaptador LoRA sobre el modelo base. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias. El sufijo "Terse" y la etiqueta `token-efficient` apuntan a un ajuste orientado a respuestas breves en tareas de código, pero no hay métricas publicadas que cuantifiquen esa eficiencia. Tampoco se documenta el proceso de calibración imatrix empleado por mradermacher más allá de los ficheros generados.

## Capacidades

- Generación de código: el modelo está etiquetado explícitamente como `coding` y su nombre incluye "Coder", por lo que su caso de uso principal es la escritura y modificación de código.
- Razonamiento: etiqueta `reasoning`, orientada a tareas que requieren cadenas de pasos intermedios antes de la respuesta final.
- Respuestas concisas: etiquetas `token-efficient` y "Terse", enfocadas a reducir la verbosidad de la salida, útil cuando el coste por token o la latencia importan.
- Conversación multi-turno: etiqueta `conversational`, con soporte de diálogo mantenido.
- Visión: la model card indica que es un modelo de visión; los ficheros mmproj necesarios para habilitarla se alojan en el repositorio estático, no en el de quants i1.
- Decodificación especulativa: la arquitectura base (Qwen3.8-27B) incorpora una cabeza MTP que permite decodificación especulativa, aunque no está confirmado que el merge la conserve intacta ni que los quants GGUF la aprovechen.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso explícito: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.

## Casos de uso

- Autocompletado y asistencia de código en el IDE: con cuants i1-Q2_K o i1-IQ3_M, el modelo cabe en GPUs de consumo de 16-24 GB, lo que permite desplegarlo localmente para sugerencias de código sin enviar el contexto del proyecto a servicios externos.
- Refactorización de módulos existentes: la ventana de contexto de 262K tokens de la arquitectura base (si se confirma en el merge) permite cargar varios ficheros de un proyecto a la vez y aplicar cambios coherentes entre ellos.
- Generación y ampliación de tests unitarios: la orientación a respuestas concisas reduce el volumen de texto generado por prueba, lo que abarata el proceso cuando se ejecuta sobre repositorios grandes.
- Revisión de código automatizada en CI/CD: el modelo puede insertarse como paso de un pipeline que analice diffs y produzca comentarios, siempre que se valide previamente la calidad del cuantizado elegido.
- Análisis de capturas y diagramas técnicos: al tratarse de un modelo con torre de visión, puede procesar capturas de pantalla de errores, diagramas de arquitectura o esquemas de interfaces para generar explicaciones o código asociado, cargando el mmproj correspondiente del repositorio estático.
- Documentación técnica a partir de código: dado su enfoque en concisión, es adecuado para generar docstrings y documentación breve en inglés a partir de fuentes de código.
- Chatbot técnico interno en inglés: la etiqueta `conversational` y el soporte de contexto largo permiten mantener conversaciones de soporte interno con historial extenso, limitado al idioma inglés.
- Extracción de datos estructurados desde capturas o PDFs renderizados: combinando la torre de visión con una instrucción de salida en formato fijo, encaja en tareas de extracción sobre documentos técnicos en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Ni la model card del merge ni la del repositorio de cuantización incluyen puntuaciones de MMLU, HumanEval, GSM8K, SWE-bench ni de ninguna otra prueba estandarizada. Tampoco se ofrecen comparativas con el modelo base ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia (tamaño de pesos según los ficheros publicados): i1-Q2_K ocupa 11,0 GB; i1-IQ3_M ocupa 12,9 GB. A estos valores hay que sumar la caché KV, que crece con la longitud de contexto y cuyo coste por token no está documentado.
- Estimaciones por cuantización (calculadas a partir de los 27,32B de parámetros y bits por peso típicos, no publicadas por el autor): IQ4_XS o Q4_K_M en torno a 16-17 GB; Q5_K_M en torno a 18-19 GB; Q6_K en torno a 22-23 GB; Q8_0 en torno a 29 GB; pesos bf16/fp16 en torno a 54,7 GB.
- GPU de consumo: i1-Q2_K e i1-IQ3_M caben en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) con contexto moderado, y con holgura en 24 GB (RTX 3090, RTX 4090). Los cuantizados de 4 bits estimados encajan en 24 GB, y los de 6 y 8 bits requieren 32 GB o más.
- GPU de centro de datos: para pesos bf16 son necesarias 2× A100 40 GB con tensor parallelism, o una única A100 80 GB / H100 80 GB. Los cuantizados de 4-6 bits pueden servirse en una sola A100 40 GB.
- Opciones de despliegue: llama.cpp y sus envoltorios (Ollama, LM Studio, KoboldCpp, text-generation-webui) para los ficheros GGUF; los repositorios incluyen la etiqueta `endpoints_compatible`. Para servir el modelo sin cuantizar, vLLM es la vía documentada para la arquitectura base Qwen3.8-27B. Compatibilidad con TGI no confirmada.
- Vision: requiere descargar el fichero mmproj desde el repositorio estático y un runtime que soporte modelos multimodales en GGUF (por ejemplo, llama.cpp con soporte de proyección).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| Signal-3.8-27B-Terse-Coder-i1-GGUF (este) | 27,3B | 262K nativos (según la arquitectura base, no confirmado) | Apache-2.0 | GGUF con cuants i1/imatrix; 2 cuants publicados en la tabla del repositorio |
| vwdubb/Signal-3.8-27B-Terse-Coder | 27,3B | No disponible | No disponible | Peso original sin cuantizar; es el modelo del que parte esta cuantización |
| Qwen3.8-27B | 27B | 262K nativos, extensible a 1M | No disponible en la información recogida | Denso con atención híbrida, torre de visión y cabeza MTP; receta oficial de vLLM disponible |
| Modelo MoE de 30B totales / 3B activos de la galería de LocalAI | 30B totales, 3B activos | Orientado a contexto largo | No disponible | GGUF Q4_K_M oficial; no se identifica el nombre del modelo en la información recogida |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estas alternativas. La comparación se limita, por tanto, a parámetros, contexto, licencia y formatos disponibles.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés. No hay evidencia de capacidades en castellano ni en otros idiomas.
- Ausencia de validación pública: el repositorio tiene 0 descargas y 0 valoraciones en el momento de redactar la ficha, por lo que no existe retroalimentación de la comunidad sobre su calidad real.
- Sin benchmarks: no hay resultados publicados de MMLU, HumanEval ni ninguna otra prueba, de modo que no se puede verificar la afirmación de mejora en razonamiento o código.
- Trazabilidad del entrenamiento: se desconoce el dataset, el número de tokens y si hubo ajuste por preferencias. Esto dificulta evaluar sesgos y comportamientos indeseados.
- Riesgo de alucinación: inherente a los modelos de lenguaje, especialmente relevante en generación de código, donde puede producir APIs inexistentes o firmas de funciones incorrectas sin señalarlo.
- Pérdida de calidad por cuantización: el propio autor advierte en la tabla de cuants que, para i1-Q2_K, "IQ3_XXS probably better", lo que indica que los cuantizados de 2 bits degradan la calidad de forma notable. Los cuantizados IQ1 e IQ2 listados en la metadata serían aún más agresivos.
- Fusionado de LoRA y cuantización: al tratarse de un merge de un adaptador LoRA sobre una base y, después, de una cuantización imatrix, se acumulan dos transformaciones que pueden alterar el comportamiento respecto al modelo original.
- Visión incompleta en este repositorio: los ficheros mmproj necesarios para usar la torre de visión no están en el repositorio i1; hay que descargarlos del repositorio estático.
- Licencia: el repositorio se declara Apache-2.0, pero al ser un derivado de un merge sobre una base cuya licencia no se especifica en la información recogida, conviene verificar los términos del modelo base y del adaptador LoRA antes de un uso comercial.
- Tool calling y uso como agente: no documentados, por lo que no deben asumirse en producción sin pruebas propias.
- Soporte de los quants anunciados: la metadata lista más de veinte tipos de cuantización, pero la tabla del repositorio solo publica imatrix, i1-Q2_K e i1-IQ3_M, de modo que la disponibilidad del resto debe comprobarse en el repositorio en el momento de la descarga.

## Enlaces

- Repositorio HuggingFace (i1/GGUF): https://huggingface.co/mradermacher/Signal-3.8-27B-Terse-Coder-i1-GGUF
- Repositorio de cuantizados estáticos: https://huggingface.co/mradermacher/Signal-3.8-27B-Terse-Coder-GGUF
- Árbol de ficheros del repositorio estático: https://huggingface.co/mradermacher/Signal-3.8-27B-Terse-Coder-GGUF/tree/main
- Modelo base del merge: https://huggingface.co/vwdubb/Signal-3.8-27B-Terse-Coder
- Página de resumen de cuantizados del autor: https://hf.tst.eu/model#Signal-3.8-27B-Terse-Coder-i1-GGUF
- Receta de vLLM para Qwen3.8-27B (arquitectura base probable): https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Guía de uso de ficheros GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Galería de modelos de LocalAI: https://localai.io/docs/gallery.html
- Calendario de lanzamientos de modelos de IA: https://www.scriptbyai.com/ai-model-release-calendar/
