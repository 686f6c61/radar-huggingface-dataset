# mradermacher/Qwen3.8-27B-Kimiko-2-BF16-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-Kimiko-2-BF16-i1-GGUF` es una colección de cuantizaciones GGUF (con matriz de importancia, imatrix) del fine-tune `Qwen3.8-27B-Kimiko-2-BF16` desarrollado por AMAImedia, que a su vez parte del modelo base `Qwen/Qwen3.8-27B` de la serie Qwen3.8 de Alibaba. El objetivo de esta publicación es ofrecer versiones comprimidas del modelo para su ejecución local en CPU y GPU con requisitos de memoria reducidos, manteniendo un equilibrio entre calidad y rendimiento.

El modelo base Qwen3.8-27B es un transformer denso de 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) con una arquitectura de atención híbrida: solo 16 de sus 64 capas utilizan atención completa, mientras que las 48 restantes emplean atención lineal con un estado recurrente constante. Esta combinación reduce el coste computacional y lo hace especialmente adecuado para tareas de razonamiento largo y ejecución de agentes. El fine-tune Kimiko-2 añade ajustes específicos orientados a conversación y uso en entornos de producción, aunque no se han publicado detalles técnicos sobre su entrenamiento.

La relevancia de esta publicación radica en que proporciona acceso a un modelo de 27B con capacidades avanzadas (razonamiento, código, agentes) en formatos cuantizados que permiten su despliegue en hardware de consumo, algo que con los pesos en BF16 (más de 50 GB solo en pesos) no sería viable para la mayoría de usuarios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (16 capas full attention + 48 capas linear attention) |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 soporta múltiples idiomas, pero no se confirma para este fine-tune) |
| Licencia | No disponible (el modelo base Qwen3.8-27B usa Apache 2.0, pero no se confirma para el fine-tune) |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de atención híbrida innovadora: de las 64 capas del transformer, solo 16 utilizan atención completa (con un intervalo de capas completas de 4), mientras que las 48 restantes usan atención lineal con un estado recurrente constante. Este diseño reduce la complejidad computacional de O(n²) a O(n) en la mayoría de las capas, lo que permite procesar secuencias largas con menor coste. El modelo es denso, sin mezcla de expertos (MoE), y está diseñado para ser eficiente en despliegue.

El fine-tune Kimiko-2, realizado por AMAImedia, parte de los pesos BF16 del modelo base y aplica un ajuste adicional orientado a conversación y uso en entornos de producción. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens, ni si se utilizaron técnicas como RLHF o DPO. La cuantización GGUF realizada por mradermacher utiliza matrices de importancia (imatrix) para optimizar la distribución de bits en función de la activación de los pesos, lo que mejora la calidad de las cuantizaciones de baja precisión.

## Capacidades

- Generación de texto y razonamiento complejo: el modelo base destaca en tareas de razonamiento multi-paso y resolución de problemas, con un modo de pensamiento controlable (thinking mode) que permite alternar entre respuestas rápidas y razonamiento profundo.
- Codificación: soporta generación de código, depuración y explicación de fragmentos, con buen rendimiento en tareas de programación según las especificaciones del modelo base.
- Matemáticas: capacidad para resolver problemas matemáticos con razonamiento paso a paso, evaluada en benchmarks como MathVision.
- Ejecución de agentes: el modelo base está optimizado para planificación autónoma y manejo de feedback del entorno en tareas multi-paso, lo que lo hace adecuado para sistemas agénticos.
- Tool calling / function calling: no se confirma explícitamente para este fine-tune, pero el modelo base Qwen3.8 soporta esta capacidad; se recomienda verificar con pruebas específicas.
- Capacidades multilingües: no confirmadas para este fine-tune; el modelo base soporta varios idiomas, pero no se especifica cuáles.
- Visión: el modelo base es un modelo de visión-lenguaje, pero esta cuantización GGUF no incluye el proyector de visión (el README indica `skip_mmproj`), por lo que la entrada de imágenes no está disponible en estos archivos.

## Casos de uso

- Despliegue local en hardware de consumo: gracias a las cuantizaciones GGUF (desde Q2_K hasta Q6_K), el modelo puede ejecutarse en GPUs con 8-16 GB de VRAM o incluso en CPU con suficiente RAM, lo que permite a desarrolladores individuales o pequeños equipos utilizar un modelo de 27B sin infraestructura cloud.
- Asistente de código en entornos sin conexión: un equipo de desarrollo puede integrar el modelo cuantizado en un IDE o CLI para autocompletado, revisión de código y generación de tests, aprovechando su capacidad de razonamiento y generación de código, sin depender de APIs externas.
- Chatbot conversacional para atención al cliente: el fine-tune Kimiko-2 está orientado a conversación, por lo que puede desplegarse como backend de un sistema de chat multi-turno, con tiempos de respuesta aceptables en GPU de gama media (por ejemplo, RTX 3090) usando cuantizaciones Q4_K_M.
- Agente autónomo para automatización de tareas: su capacidad de planificación y manejo de feedback del entorno permite usarlo como motor de un agente que interactúa con APIs, ejecuta comandos y realiza tareas multi-paso, por ejemplo en flujos de integración continua.
- Razonamiento y análisis de documentos largos: la atención híbrida reduce el coste de procesar secuencias largas, por lo que puede utilizarse para resumir informes extensos, extraer conclusiones o responder preguntas sobre documentos técnicos, siempre que se respete la longitud de contexto (no confirmada).
- Investigación y experimentación en NLP: investigadores pueden usar el modelo cuantizado para probar hipótesis sobre razonamiento, generación de texto o evaluación de agentes sin necesidad de acceder a GPUs de gran tamaño, gracias a la flexibilidad de las cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Qwen3.8-27B reporta resultados en benchmarks como MathVision, pero no se dispone de datos específicos para el fine-tune Kimiko-2 ni para las versiones cuantizadas. Se recomienda consultar la documentación oficial de Qwen3.8 para obtener métricas del modelo base y realizar evaluaciones propias con las cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, para 26,9B parámetros):
  - Q2_K: aproximadamente 11-12 GB
  - Q3_K_M: aproximadamente 13-14 GB
  - Q4_K_M: aproximadamente 16-17 GB
  - Q5_K_M: aproximadamente 19-20 GB
  - Q6_K: aproximadamente 22-23 GB
  - Q8_0: aproximadamente 28-29 GB (no listado en este repo, pero disponible en otros)
- GPUs recomendadas:
  - Para Q2/Q3: RTX 3060 12 GB, RTX 4060 Ti 16 GB
  - Para Q4/Q5: RTX 3090, RTX 4090, A10, L4
  - Para Q6/Q8: A100 40 GB, H100, o múltiples GPUs
- En CPU: es posible ejecutar cuantizaciones Q2/Q3 con 32 GB de RAM, aunque la latencia será alta (varios segundos por token).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (el repo está etiquetado como `endpoints_compatible`), TGI.
- Latencia y throughput: no disponibles; dependen de la cuantización, el hardware y la longitud de la secuencia. En una RTX 4090 con Q4_K_M, se puede esperar un throughput de 20-40 tokens/s para generación, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 26,9 B | No disponible | Híbrida (full + linear attention) | Apache 2.0 | HuggingFace, vLLM |
| Qwen3.8-27B-Kimiko-2 (BF16) | 26,9 B | No disponible | Híbrida | No disponible | HuggingFace (AMAImedia) |
| Qwen3.8-27B-Kimiko-2 (GGUF, este repo) | 26,9 B | No disponible | Híbrida | No disponible | HuggingFace (mradermacher) |
| Llama 3.1 8B | 8 B | 128 K | Densa, attention completa | Llama 3.1 License | HuggingFace, múltiples formatos |
| Qwen2.5 32B | 32 B | 128 K | Densa, attention completa | Apache 2.0 | HuggingFace, múltiples formatos |

La comparativa se basa en características generales; no se dispone de datos de rendimiento para el fine-tune Kimiko-2. Frente a Llama 3.1 8B, este modelo ofrece más parámetros y una arquitectura más eficiente para secuencias largas, pero requiere más VRAM. Frente a Qwen2.5 32B, tiene menos parámetros pero una atención híbrida que puede ser más eficiente en ciertos escenarios.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información específica sobre sesgos del fine-tune Kimiko-2; el modelo base puede heredar sesgos de sus datos de entrenamiento, que no se han detallado.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento o hechos específicos. Se recomienda verificar las salidas en aplicaciones críticas.
- Limitaciones de contexto: la longitud de contexto no está confirmada para este fine-tune; se debe probar empíricamente antes de usarlo con secuencias largas.
- Limitaciones de idioma: no se confirman los idiomas soportados; el modelo base es multilingüe, pero el fine-tune podría estar sesgado hacia un idioma concreto.
- Restricciones de licencia: la licencia del fine-tune no está especificada; aunque el modelo base usa Apache 2.0, el fine-tune de AMAImedia podría tener restricciones adicionales. Se recomienda contactar con el autor antes de un uso comercial.
- Sin soporte de visión: esta cuantización GGUF no incluye el proyector de visión (`skip_mmproj`), por lo que no se pueden procesar imágenes, a pesar de que el modelo base es multimodal.
- Calidad de cuantizaciones extremas: las cuantizaciones Q1 y Q2 pueden degradar significativamente la calidad del modelo; se recomienda usar Q4_K_M o superior para tareas que requieran precisión.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mradermacher/Qwen3.8-27B-Kimiko-2-BF16-i1-GGUF
- Repositorio HuggingFace del fine-tune original (AMAImedia): https://huggingface.co/AMAImedia/Qwen3.8-27B-Kimiko-2-BF16
- Repositorio HuggingFace del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página de vLLM Recipes para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Página de LM Studio para Qwen3.8-27B: https://lmstudio.ai/models/qwen/qwen3.8-27b
