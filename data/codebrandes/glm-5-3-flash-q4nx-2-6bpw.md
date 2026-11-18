# codebrandes/GLM-5.3-Flash-Q4NX-2.6bpw

## Resumen

GLM-5.3-Flash-Q4NX-2.6bpw es una cuantización EXL3 del modelo GLM-5.3-Flash de zai-org, publicada por el usuario codebrandes. Se trata de un transformer de tipo Mixture-of-Experts (MoE) con capacidades multimodales (texto, imagen y vídeo) que conserva la totalidad del modelo original: torre de visión, capa MTP (multi-token prediction) y contexto completo. El checkpoint ocupa 109 GB y está pensado para servirse en dos tarjetas NVIDIA CMP 170HX, hardware de minería con tensor cores INT8.

La innovación principal es el códec de trellis Q4N-X, que sustituye al `mul1` por defecto de EXL3 en los expertos enrutados (el 97 % de los parámetros). Q4N-X decodifica cada estado de trellis en cuatro pesos enteros de −15 a 15, operandos exactos de los tensor cores INT8, lo que elimina la aritmética en FP16 durante la decodificación y acelera los kernels de expertos entre 1,45× y 1,59× en decodificación y hasta 2,4× en prefill frente a `mul1`.

El modelo solo puede cargarse con la build de vLLM específica para CMP 170HX que incluye los kernels Q4N-X; ni exllamav3 estándar, ni TabbyAPI, ni vLLM upstream pueden cargar este checkpoint. La licencia es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto, imagen, vídeo), con capa MTP y torre de visión; cuantización EXL3 con códec Q4N-X |
| Parámetros totales | 54.412.707.934 (54,4 B) |
| Parámetros activos | no disponible (el modelo base es MoE; el número de expertos activos no se indica en la información proporcionada) |
| Longitud de contexto | no disponible (la model card indica que se conserva "the full context" del modelo base, sin cifra) |
| Tipos de cuantización | EXL3 2,6 bpw (media global 2,71 bpw contando los 321,3 B de parámetros del base); expertos enrutados a 2,5 bpw con Q4N-X; capa 3 a 3,5 bpw; atención, proyecciones MLA, indexer, expertos compartidos, MLPs densos y LM head a 6 bits; MTP a 4 bits; torre de visión a 6 bits; copia INT8 de los pesos densos en `int8/dense.safetensors` (7,9 GB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3), biblioteca vLLM; incluye fichero INT8 aparte para pesos densos |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con atención MLA (multi-head latent attention) e indexer, capa MTP y torre de visión, según se deduce de los tensores descritos en la model card. La cuantización se realizó a partir del release original en FP8 (`zai-org/GLM-5.3-Flash`, revisión `46a050be`) con exllamav3 1.6.6 y la rama `q4nx` del fork de AlexBrandes. La calibración empleó 719 filas de 2.048 tokens: 250 procedentes de una traza de chat autogenerada por turboderp para GLM-5.3-Flash y 469 de las fuentes incluidas en exllamav3 (172 de código, 150 de Wikipedia, 88 de C4, 33 técnicas y 26 multilingües).

La innovación técnica es el códec Q4N-X: mantiene las teselas 16×16, las rotaciones de Hadamard, los vectores de signo, el trellis y el codificador Viterbi de EXL3, pero cambia la conversión de estado a pesos. Cada multiplicación por constante genera una palabra de 32 bits cuyos ocho nibbles se leen por pares, produciendo cuatro pesos enteros por multiplicación (frente a uno en `mul1`); el estado crece de 16 a 22 bits a 2,5 bpw, y los valores se almacenan en el orden del fragmento de operando del tensor core (`m16n8k16`). La escala se aplica una sola vez sobre el resultado acumulado. En prefill, una llamada a una capa MoE con 2.048 tokens pasa de 23,7 ms con `mul1` a 9,9 ms con Q4N-X; en decodificación, la mejora es de 1,45× a 1,59×.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Entrada multimodal: texto, imagen y vídeo (pipeline `image-text-to-text`).
- Codificación y generación de código, con calibración específica sobre fuentes de código.
- Capacidades multilingües (26 filas de calibración multilingüe; el conjunto exacto de idiomas no está disponible).
- Capa MTP (multi-token prediction) conservada, que puede emplearse para decodificación especulativa.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de bajo coste en hardware de segunda mano: el checkpoint está optimizado para dos CMP 170HX, tarjetas con 8 GB de HBM2e y tensor cores INT8, lo que permite servir un modelo multimodal de 54,4 B en unos 16 GB de VRAM agregada gracias a la cuantización a 2,6 bpw.
- Análisis de documentos con imágenes: la torre de visión a 6 bits se conserva íntegra, de modo que el modelo puede procesar capturas, diagramas o páginas escaneadas junto con texto en una misma conversación.
- Procesamiento de vídeo: al mantener la entrada de vídeo del modelo base, sirve para resumir o describir clips cortos en pipelines de moderación o catalogación.
- Asistencia conversacional de contexto largo: la conservación del contexto completo del base permite gestionar hilos multi-turno extensos, siempre que la VRAM restante tras cargar los pesos (unos 109 GB repartidos entre dos tarjetas) deje espacio para la caché KV.
- Generación de código en entornos con hardware restringido: la calibración incluye 172 filas de código y el modelo soporta prompts de programación, útil para autocompletado o revisión en estaciones con GPUs CMP.
- Investigación en cuantización: sirve como referencia reproducible del códec Q4N-X, con decodificador de referencia y especificación publicados, para estudiar el impacto de códecs enteros en modelos MoE grandes.
- Evaluación comparativa de fidelidad: al publicarse métricas de divergencia KL y acuerdo top-1 frente al modelo BF16, puede usarse para validar recetas de cuantización alternativas a 2,6 bpw.

## Benchmarks y rendimiento

Rendimiento de los kernels de expertos enrutados medido en una CMP 170HX con capas reales del modelo a 2,5 bpw:

| Métrica | `mul1` | Q4N-X |
|---|---:|---:|
| Prefill, una llamada a capa MoE con 2.048 tokens | 23,7 ms | 9,9 ms |
| Decodificación, 1–8 filas por llamada | 1× | 1,45–1,59× |

Fidelidad frente al modelo original (menor es mejor), medido en 2× CMP 170HX con los mismos pesos densos INT8:

| Métrica | turboderp EXL3 sc_2.60bpw | Este checkpoint |
|---|---:|---:|
| Divergencia KL vs BF16, suite malaiwah (128 ventanas de 2.048 tokens) | 0,1559 | 0,1525 |
| Acuerdo top-1 con el original | no disponible (el dato se corta en la información proporcionada) | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 109 GB; con la copia INT8 de pesos densos (7,9 GB) el consumo por tarjeta sube aproximadamente 1 GB respecto a los tensores de 6 bits, reduciendo el espacio para la caché KV.
- GPU objetivo: dos NVIDIA CMP 170HX (sm_80, 8 GB de HBM2e cada una). La model card indica que el mismo razonamiento aplica a otras GPUs sm_80, pero no se han probado.
- GPUs consumer: no es viable en RTX 4090 ni similares, porque los kernels Q4N-X solo existen en la build de vLLM para CMP 170HX; además, el tamaño del checkpoint excede la VRAM de cualquier GPU consumer individual.
- Opciones de despliegue: exclusivamente la build de vLLM para CMP 170HX de la receta `AlexBrandes/cmp170hx-glm53-flash-exl3`. exllamav3 estándar, TabbyAPI y vLLM upstream no pueden cargar el checkpoint.
- Throughput: mejora de 1,45–1,59× en decodificación y de 23,7 a 9,9 ms por llamada a capa MoE en prefill frente a `mul1`; no se publican cifras absolutas de tokens por segundo.
- Variable de entorno relevante: `VLLM_EXL3_DENSE_W8` activa la carga de los pesos densos INT8 en lugar de los tensores de 6 bits.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GLM-5.3-Flash-Q4NX-2.6bpw) | 54,4 B | no disponible | EXL3 2,6 bpw con Q4N-X | MIT | Solo vLLM para CMP 170HX |
| turboderp/GLM-5.3-Flash-exl3 sc_2.60bpw | mismo base | no disponible | EXL3 2,6 bpw con `mul1` | no disponible | exllamav3/TabbyAPI/vLLM estándar |
| zai-org/GLM-5.3-Flash (original) | 321,3 B (según la model card) | no disponible | FP8 | no disponible | vLLM y otros motores estándar |

La comparación de fidelidad entre las dos cuantizaciones EXL3 favorece ligeramente a este checkpoint (KL de 0,1525 frente a 0,1559). No se dispone de datos de benchmarks de tarea para comparar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Dependencia de hardware y software muy específica: sin la build de vLLM para CMP 170HX y los kernels Q4N-X, el checkpoint no se puede cargar en ningún motor estándar.
- La cuantización a 2,6 bpw introduce degradación medible: la divergencia KL frente a BF16 es de 0,1525, lo que implica desviaciones en la distribución de salida respecto al modelo original.
- Los expertos enrutados usan valores enteros de −15 a 15; aunque el estado de trellis más largo recupera parte de la precisión, la granularidad es menor que en cuantizaciones de 4 bits o superiores.
- La copia INT8 de pesos densos ocupa 1 GB más por tarjeta, lo que reduce el espacio disponible para la caché KV y limita la longitud de contexto efectiva en producción.
- Sesgos conocidos: no disponible en la información proporcionada; al derivar de un modelo entrenado con datos web y de código, es previsible que herede sesgos del base, pero no se documentan.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas soportados: no disponible; la calibración incluye solo 26 filas multilingües, por lo que el rendimiento en idiomas distintos del inglés puede degradarse más que en el modelo original.
- Licencia MIT: permite uso comercial, pero el modelo base y la receta de despliegue deben verificarse por separado, ya que la licencia del base no se indica en la información proporcionada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/codebrandes/GLM-5.3-Flash-Q4NX-2.6bpw
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Cuantización de referencia de turboderp: https://huggingface.co/turboderp/GLM-5.3-Flash-exl3
- Receta de despliegue: https://github.com/AlexBrandes/cmp170hx-glm53-flash-exl3
- Especificación del formato Q4N-X: https://github.com/AlexBrandes/exllamav3/blob/q4nx/doc/q4nx.md
- Fork de exllamav3 con la rama q4nx: https://github.com/AlexBrandes/exllamav3/tree/q4nx
