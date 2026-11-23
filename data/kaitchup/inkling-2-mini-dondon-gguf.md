# kaitchup/Inkling-2-Mini-dondon-GGUF

## Resumen

Inkling-2-Mini-dondon-GGUF es una colección de cuantizaciones GGUF de baja precisión del modelo Thinking Machines Inkling 2 Mini, publicada por el desarrollador independiente kaitchup. No se trata de un modelo entrenado desde cero, sino de un trabajo de re-cuantización: parte de archivos GGUF ya existentes (los suyos propios y los UD GGUF de Unsloth) y reajusta la precisión por capa, volviendo a entrenar las escalas de cuantización mediante un framework propio. El objetivo es ofrecer versiones de 8 a 12 GB que conserven buena parte de la fidelidad del modelo original en BF16 (52,23 GB).

El modelo base, Inkling 2 Mini, es un transformer de 26.070.390.272 parámetros (unos 26 mil millones) con 24 bloques decodificadores y bloques "looped" (repetidos en bucle), según se deduce de la documentación y de las matrices de precisión por capa incluidas. Dispone de codificador de visión (mmproj) y de un drafter de decodificación especulativa denominado DSpark, construido a partir de los pesos MTP (multi-token prediction). La ficha se centra en los archivos GGUF cuantizados, que son el objeto real de este repositorio.

La relevancia actual está en la posibilidad de ejecutar un modelo de 26B con capacidades multimodales y de razonamiento en una sola GPU de consumo, a costa de una pérdida de precisión que el autor mide con métricas de divergencia KL y tasa de aceptación esperada (EAR@10). La licencia Apache 2.0 facilita el uso comercial, aunque las limitaciones de llama.cpp para este modelo condicionan el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 24 bloques decodificadores y bloques "looped" (inkling2_loop); incluye codificador de visión y cabezas MTP para decodificación especulativa |
| Parametros totales | 26.070.390.272 (26,07 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens en la evaluación del autor; el ejemplo de servidor local usa 8.192 tokens |
| Tipos de cuantizacion | Q2_K_XS (8,00 GB), Q3_K_XXS (10,00 GB), Q3_K_XS (11,66 GB); cuantización de precisión mixta por capa con reentrenamiento de escalas |
| Idiomas soportados | no disponible (la evaluación cubre texto web multilingüe, pero no se declara una lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); archivos auxiliares mmproj-BF16.gguf (0,64 GB) y dspark-Inkling-2-Mini-Q8_0.gguf (0,40 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 26,07 mil millones de parámetros organizado en 24 bloques decodificadores, con una peculiaridad estructural: bloques "looped" que se ejecutan de forma repetida, lo que exige versiones específicas de llama.cpp (b12611 o superior, que incorpora el arreglo del PR #32704). Incorpora un codificador de visión independiente en formato GGUF (mmproj-BF16.gguf) para entrada de imágenes, y pesos MTP que el autor ha convertido en un drafter de decodificación especulativa llamado DSpark (dspark-Inkling-2-Mini-Q8_0.gguf, Q8_0).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo original dentro de la información proporcionada. Lo que sí está documentado es el proceso de cuantización: el framework de kaitchup reasigna precisiones por matriz a lo largo de los 24 bloques (diagramas de formato por capa para cada variante) y reentrena las escalas de cuantización, en lugar de aplicar una receta uniforme. La evaluación se realizó con kaiLLM frente al GGUF BF16 de ggml-org, cubriendo dominios de matemáticas, razonamiento de opción múltiple, razonamiento de código, seguimiento de instrucciones, texto web multilingüe, código fuente, texto matemático, libros, chat humano, trazas de razonamiento mixtas, codificación agéntica y texto web en inglés.

## Capacidades

- Generación de texto conversacional y razonamiento de múltiples pasos, con modo "thinking" y esfuerzo de razonamiento alto (high reasoning effort) en las evaluaciones.
- Razonamiento matemático y de opción múltiple (evaluado en GPQA Diamond).
- Razonamiento de código y codificación agéntica (agentic coding), según los dominios de la evaluación held-out.
- Seguimiento de instrucciones.
- Procesamiento multilingüe de texto web (evaluado, sin lista de idiomas declarada).
- Entrada de imágenes mediante el codificador de visión mmproj-BF16.gguf.
- Decodificación especulativa mediante el drafter DSpark (requiere build de llama.cpp de Unsloth por ahora).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistente de razonamiento local en una sola GPU: con la variante Q2_K_XS (8 GB) el modelo cabe en GPUs de consumo de gama alta y permite ejecutar consultas de razonamiento matemático y de opción múltiple sin conexión, con una precisión en GPQA Diamond de 85,1 %, cercana al 86,4 % del BF16.
- Análisis de documentos e imágenes: cargando mmproj-BF16.gguf junto al GGUF principal, el modelo acepta entradas de imagen, útil para extracción de información de capturas, diagramas o documentos escaneados en flujos locales.
- Generación y revisión de código en entornos con recursos limitados: la variante Q3_K_XS (11,66 GB) mantiene una EAR@10 del 94,91 % frente al BF16, adecuada para autocompletado, revisión de parches y tareas de codificación agéntica en una estación de trabajo con una RTX 4090.
- Prototipado de agentes con contexto largo: el modelo base soporta hasta 262.144 tokens de contexto en la evaluación, lo que permite mantener conversaciones multi-turno extensas o analizar repositorios y expedientes completos, siempre que la VRAM disponible permita el contexto elegido.
- Servicio de chat autoalojado con llama-server: el autor documenta el arranque de un servidor local con `llama-server` y 8.192 tokens de contexto, lo que facilita desplegar una API compatible con endpoints en infraestructura propia.
- Evaluación de técnicas de cuantización: el repositorio sirve como referencia para investigadores que comparan recetas de precisión mixta (dondon frente a chimachima o Unsloth UD) con métricas de KL y EAR@10 por dominio.
- Decodificación especulativa acelerada: integrando el drafter DSpark con el build de llama.cpp de Unsloth se puede reducir la latencia de generación en despliegues interactivos, a la espera de que el soporte llegue a la rama principal.

## Benchmarks y rendimiento

Datos publicados por el autor. GPQA Diamond promedia dos ejecuciones por pregunta con EvalScope 1.15.0 (semilla 42), en kaiLLM con thinking activado, esfuerzo alto, temperatura 1.0 y contexto de 262.144 tokens. El autor advierte que las diferencias están dentro del ruido entre ejecuciones (error estándar pareado de ~1,5 puntos).

| Modelo | Tamano (GB) | GPQA Diamond (%) |
|---|---:|---:|
| dondon Q2_K_XS | 8,00 | 85,1 |
| dondon Q3_K_XXS | 10,00 | 84,6 |
| dondon Q3_K_XS | 11,66 | 85,9 |
| chimachima Q2_K_XS | 8,00 | 86,4 |
| chimachima Q3_K_XXS | 10,00 | 85,9 |
| chimachima Q3_K_XS | 12,00 | 87,9 |
| unsloth UD-IQ1_M | 8,02 | 84,8 |
| unsloth UD-Q2_K_XL | 9,14 | 84,3 |
| unsloth UD-IQ3_XXS | 11,66 | 86,6 |
| Inkling 2 Mini BF16 | 52,23 | 86,4 |

| Archivo dondon | Etiqueta | Tamano (GB) | EAR@10 held-out (%) |
|---|---|---:|---:|
| Q2_K_XS | Q2_K_XS | 7,998288 | 91,1732 |
| Q3_K_XXS | Q3_K_XXS | 9,997961 | 93,5488 |
| Q3_K_XS | Q3_K_XS | 11,663311 | 94,9142 |

El autor también publica gráficas de KL@10, EAR@10 y precisión en GPQA Diamond por dominio, así como divergencia KL top-10 y tasa de aceptación esperada frente a BF16. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: al menos 8 GB para Q2_K_XS, 10 GB para Q3_K_XXS y 12 GB para Q3_K_XS, solo para los pesos; hay que sumar el contexto (KV cache) y, si se usa, el codificador de visión (0,64 GB) y el drafter DSpark (0,40 GB).
- Restricción crítica: con offload parcial a GPU o con los expertos en CPU, llama.cpp devuelve NaN para los GGUF de Inkling 2 Mini (issue #32710); el modelo completo debe caber en la GPU.
- GPU recomendadas: RTX 4090 (24 GB) o superior para cualquiera de las tres variantes; A100 y H100 para contextos largos y despliegues multiusuario. Las GPU de 8-12 GB solo admiten la variante correspondiente con contexto muy reducido.
- Cabe en GPU de consumo: sí, Q2_K_XS en tarjetas de 8-12 GB y Q3_K_XS en tarjetas de 12-16 GB, siempre con el modelo entero en VRAM.
- Opciones de despliegue: llama.cpp b12611 o superior (imprescindible por el arreglo de los bloques looped); el drafter DSpark requiere por ahora el build de llama.cpp de Unsloth (los PR #32218 y #32773 siguen abiertos en la rama principal). El autor recomienda kaiLLM para obtener mayor precisión a igual tamaño (variante chimachima).
- Latencia y throughput: no disponible; el autor no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GPQA Diamond (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dondon Q3_K_XS (este repo) | 26,07 B (base) | 262.144 en evaluación | 85,9 | Apache 2.0 | GGUF en Hugging Face |
| chimachima Q3_K_XS (kaitchup) | 26,07 B (base) | 262.144 en evaluación | 87,9 | Apache 2.0 | GGUF, requiere kaiLLM |
| unsloth UD-IQ3_XXS | 26,07 B (base) | no disponible | 86,6 | Apache 2.0 | GGUF en Hugging Face |
| Inkling 2 Mini BF16 | 26,07 B | 262.144 en evaluación | 86,4 | Apache 2.0 | GGUF en Hugging Face |

Las tres alternativas comparten el mismo modelo base, por lo que la comparación relevante es la receta de cuantización: dondon prioriza el tamaño mínimo (8 GB con 85,1 % en GPQA), mientras que chimachima obtiene la mejor precisión a igualdad de tamaño pero exige kaiLLM. No se dispone de comparación con modelos de otros fabricantes de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo original: es una re-cuantización; todos los sesgos y limitaciones del Inkling 2 Mini base se heredan y pueden amplificarse por la pérdida de precisión.
- Riesgo de alucinación: no cuantificado en la información disponible; el autor recomienda probar el modelo antes de confiar en sus cifras.
- Las diferencias de GPQA entre variantes están dentro del ruido entre ejecuciones (~1,5 puntos de error estándar pareado), por lo que no deben interpretarse como superioridad fiable.
- Restricción de despliegue grave: offload parcial o expertos en CPU producen NaN en llama.cpp; obliga a que todo el modelo quepa en VRAM.
- Requiere llama.cpp b12611 o superior; versiones anteriores fallan con los bloques looped.
- El drafter DSpark solo funciona con el build de Unsloth; el soporte en la rama principal está pendiente.
- La lista de idiomas soportados no está declarada; la cobertura multilingüe solo está evidenciada por los dominios de evaluación.
- Licencia Apache 2.0 permite uso comercial, pero deben conservarse los avisos de licencia y atribución a Thinking Machines, Unsloth y kaitchup.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kaitchup/Inkling-2-Mini-dondon-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- GGUF BF16 de ggml-org: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Variante chimachima (kaiPTQ): https://huggingface.co/kaitchup/Inkling-2-Mini-chimachima-kaiPTQ
- Framework kaiLLM: https://github.com/the-kaitchup/kaiLLM
- PR de llama.cpp con el arreglo de bloques looped: https://github.com/ggml-org/llama.cpp/pull/32704
- Issue de llama.cpp sobre NaN con offload parcial: https://github.com/ggml-org/llama.cpp/issues/32710
- PR de soporte del drafter DSpark: https://github.com/ggml-org/llama.cpp/pull/32218
- PR de soporte del drafter DSpark (segundo): https://github.com/ggml-org/llama.cpp/pull/32773
- Build de llama.cpp de Unsloth: https://github.com/unslothai/llama.cpp/releases
- Newsletter del autor: https://kaitchup.substack.com/subscribe
- Apoyo al autor: https://buymeacoffee.com/kaitchup
