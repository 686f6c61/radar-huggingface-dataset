# JakTheTrippr/Qwen3-235B-A22B

## Resumen

Qwen3-235B-A22B es un modelo de lenguaje causal de tipo mezcla de expertos (MoE) desarrollado por Alibaba Qwen, presentado como la variante de mayor tamaño de la familia Qwen3. Con 235.093.634.560 parámetros totales y aproximadamente 22B activos por token, activa 8 de sus 128 expertos en cada paso, lo que permite un coste de inferencia muy inferior al de un modelo denso equivalente. La ficha que nos ocupa corresponde al repositorio `JakTheTrippr/Qwen3-235B-A22B`, una réplica de terceros del modelo oficial publicado bajo licencia Apache 2.0.

El modelo resuelve el problema de conciliar razonamiento profundo y diálogo eficiente en un único checkpoint: permite alternar entre modo *thinking* (razonamiento explícito encapsulado en un bloque ` thinking...` antes de la respuesta) y modo *non-thinking* mediante el parámetro `enable_thinking` de la plantilla de chat. Esta conmutación se hace en tiempo de inferencia, sin cambiar de modelo ni de pesos.

Es relevante ahora porque compite en la franja de modelos abiertos de gran escala con contexto nativo de 32.768 tokens ampliable a 131.072 mediante YaRN, soporte declarado de más de 100 idiomas y capacidades de agente con integración de herramientas externas en ambos modos. La arquitectura es un transformer MoE de 94 capas con atención GQA (64 cabezas de consulta y 4 de clave/valor).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con mezcla de expertos (MoE), clase `qwen3_moe` |
| Parámetros totales | 235.093.634.560 (235B); 234B excluyendo embeddings |
| Parámetros activos | ~22B por token (8 de 128 expertos) |
| Longitud de contexto | 32.768 tokens nativo; 131.072 tokens con YaRN |
| Tipos de cuantización | No disponible en la información proporcionada; el repositorio solo distribuye safetensors en BF16 (470,2 GB, coherente con 2 bytes por parámetro). Sin ficheros GGUF ni recetas AWQ/GPTQ publicadas |
| Idiomas soportados | Más de 100 idiomas y dialectos según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`, requiere >= 4.51.0 para evitar `KeyError: 'qwen3_moe'`) |

Otros datos de la arquitectura: 94 capas, 64 cabezas de atención para Q y 4 para KV (GQA), 128 expertos con 8 activados.

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only causal con capas MoE intercaladas: 128 expertos por capa y enrutamiento *top-8*, lo que da 22B parámetros activos sobre 235B totales. La atención usa GQA con 64 cabezas de consulta frente a 4 de clave/valor, lo que reduce el tamaño de la caché KV en un factor de 16 respecto a atención multi-cabeza completa. El modelo ha pasado por dos etapas declaradas: preentrenamiento y post-entrenamiento (alineación). La model card oficial detalla el proceso en el informe técnico y el blog de Qwen, pero la información disponible aquí no incluye el número de tokens de entrenamiento, la composición del dataset ni los detalles concretos de RLHF/DPO.

La innovación principal es la conmutación nativa entre modo *thinking* y *non-thinking* dentro del mismo checkpoint: en modo thinking el modelo emite razonamiento dentro de ` thinking...` y después la respuesta final, con parámetros de muestreo recomendados de `Temperature=0.6`, `TopP=0.95`, `TopK=20` y `MinP=0`; la tarjeta advierte explícitamente de no usar decodificación greedy en ese modo (texto truncado en la información disponible). El registro `151668` corresponde al token `` empleado para separar razonamiento y respuesta en el parseo. No se documentan en la información disponible otras técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y diálogo multi-turno con alineación orientada a preferencias humanas (escritura creativa, role-play, seguimiento de instrucciones).
- Razonamiento explícito en modo thinking: matemáticas, lógica y generación de código con cadena de pensamiento visible y separable.
- Modo non-thinking para respuestas rápidas de propósito general, conmutando mediante `enable_thinking`.
- Soporte de *tool calling* / *function calling* en ambos modos, con integración precisa de herramientas externas.
- Capacidades de agente y razonamiento multi-paso, declaradas como punteras entre los modelos abiertos en tareas complejas basadas en agentes.
- Multilingüismo amplio: más de 100 idiomas y dialectos, con instrucciones y traducción.
- Procesamiento de textos largos hasta 131.072 tokens mediante escalado YaRN.
- Capacidad de razonamiento largo: el ejemplo oficial fija `max_new_tokens=32768`, por lo que conviene reservar presupuesto de salida amplio.
- No dispone de visión ni audio: la modalidad es únicamente texto.

## Casos de uso

- Agentes autónomos con herramientas: el modelo puede encadenar llamadas a APIs y funciones en modo thinking para tareas de varios pasos (consulta de datos, validación, escritura de resultados), aprovechando los 128 expertos y el *tool calling* nativo para orquestar flujos tipo *data pipeline*.
- Asistencia a desarrollo de software: generación y refactorización de código con razonamiento previo visible, útil en revisión de PR, explicación de *stack traces* y generación de tests; el modo thinking permite auditar el razonamiento antes de aceptar el parche.
- Análisis de documentación extensa: con 131.072 tokens vía YaRN se pueden procesar contratos, artículos científicos o bases de código completas en una sola pasada, con preguntas de seguimiento sobre el mismo contexto.
- Atención al cliente multilingüe: diálogo multi-turno en más de 100 idiomas con contexto de 32K tokens, cambiando a modo non-thinking para reducir latencia en consultas rutinarias y a thinking para casos que requieran cálculo o interpretación de políticas.
- Tutoría y resolución de problemas matemáticos: el bloque ` thinking` separa el desarrollo del resultado final, lo que permite mostrar el razonamiento al estudiante o filtrarlo en una interfaz, y evaluar la traza por separado.
- Traducción y localización: traducción de documentación técnica o de producto con instrucciones de estilo, usando el modo non-thinking para volumen alto y thinking para revisión de ambigüedades.
- Investigación en alineación e interpretabilidad: al ser Apache 2.0 y con razonamiento explícito separable, sirve como base para estudiar trazas de razonamiento, enrutamiento de expertos y comportamiento en modo dual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al blog, al repositorio de GitHub y a la documentación de Qwen para la evaluación comparativa, pero la tabla de resultados no está incluida en el material proporcionado, por lo que no se reproducen cifras de MMLU, HumanEval, GSM8K ni de otras suites.

## Requisitos de hardware

- Pesos en BF16: ~470 GB, coherente con el tamaño del repositorio (470,2 GB). Requiere al menos 8 GPU de 80 GB (H100, H200 o A100 80GB) para dejar margen a caché KV y activaciones.
- Pesos en FP8: ~235 GB; 4 GPU de 80 GB son viables con vLLM o SGLang, siempre que la pila soporte FP8 en el hardware disponible.
- Pesos en INT4: del orden de 120-130 GB; 2 GPU de 80 GB o una H200 de 141 GB con margen ajustado.
- No cabe en una GPU de consumo: 24 GB (RTX 4090) o 32 GB (RTX 5090) quedan muy por debajo incluso en INT4. Serían necesarias 6-8 GPU de consumo para INT4, más espacio para caché KV.
- Caché KV: estimación asumiendo `head_dim=128` y BF16, con 4 cabezas KV y 94 capas, en torno a 190 KB por token, es decir, unos 6 GB por secuencia de 32K tokens. A 131K tokens se superan los 25 GB por secuencia.
- Despliegue en servidor: `vllm>=0.8.5` (`vllm serve ... --enable-reasoning --reasoning-parser deepseek_r1`) o `sglang>=0.4.6.post1` (`--reasoning-parser qwen3 --tp 8`), ambos con endpoint compatible con OpenAI y conmutador `enable_thinking`.
- Despliegue local con offloading: llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers dan soporte a la familia Qwen3; en CPU/GPU híbrido el cuello de botella es la RAM del sistema (~128 GB o más para INT4).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Datos de los modelos alternativos según su documentación pública; no se dispone de comparación de rendimiento en benchmarks dentro de la información proporcionada.

| Modelo | Parámetros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-235B-A22B (esta ficha) | 235B / 22B (MoE, 128 expertos) | 32.768 nativo, 131.072 con YaRN | Apache 2.0 | Modo thinking/non-thinking conmutable, tool calling en ambos modos |
| Qwen3-32B | 32B denso | 32.768 nativo, 131.072 con YaRN | Apache 2.0 | Misma familia y mismo modo dual; mucho más barato de desplegar, sin ventaja MoE |
| Mixtral 8x22B | 141B / 39B (MoE, 8 expertos) | 64.000 | Apache 2.0 | Sin modo de razonamiento explícito ni conmutador de thinking |
| DeepSeek-V3 | 671B / 37B (MoE) | 128.000 | Licencia propia de DeepSeek (el modelo R1 derivado se publica bajo MIT) | Referencia en razonamiento y código, pero mayor huella de hardware |
| Llama 4 Maverick | 400B / 17B (MoE) | Hasta 1M tokens | Llama 4 Community License | Contexto muy superior, licencia con restricciones adicionales y multimodidad |

## Limitaciones y advertencias

- Sesgos: la información disponible no documenta una evaluación de sesgos; al tratarse de un modelo entrenado con datos web a gran escala, es esperable un comportamiento sesgado en dominios sensibles y requiere auditoría propia.
- Alucinación: sin datos de benchmarks ni de evaluación de fidelidad en la información disponible; el modo thinking reduce pero no elimina la generación de contenido incorrecto, especialmente en modo non-thinking con temperatura alta.
- Repositorio de terceros: `JakTheTrippr/Qwen3-235B-A22B` es una réplica con 0 descargas y 0 likes, creada y actualizada en la misma marca temporal (2026-10-19). Para producción conviene usar el repositorio oficial `Qwen/Qwen3-235B-A22B`, único con garantías de integridad y mantenimiento.
- La licencia del repositorio es Apache 2.0 y enlaza al fichero LICENSE del modelo oficial; Apache 2.0 permite uso comercial, pero exige conservar avisos de copyright y licencia y no concede derechos de marca.
- Dependencia de versión: con `transformers < 4.51.0` la carga falla con `KeyError: 'qwen3_moe'`. Hay que fijar la versión en el entorno de producción.
- Coste de inferencia en modo thinking: el ejemplo oficial reserva hasta 32.768 tokens de salida; sin límites adecuados, una sola petición puede consumir mucho tiempo y presupuesto.
- Muestreo: la model card desaconseja explícitamente la decodificación greedy en modo thinking y fija `Temperature=0.6`, `TopP=0.95`, `TopK=20`, `MinP=0`; ignorarlo degrada la calidad y puede producir bucles.
- Contexto: superar los 32.768 tokens requiere activar YaRN; el rendimiento más allá de esa longitud no está cuantificado en la información disponible.
- Requisito de hardware muy alto: 8 GPU de 80 GB en BF16 lo sitúan fuera del alcance de equipos individuales salvo con cuantización agresiva y offloading.
- Idiomas: el soporte de "más de 100 idiomas" es una declaración del autor sin métricas por idioma; el rendimiento real en lenguas de bajos recursos puede ser desigual.

## Enlaces

- Repositorio en HuggingFace (réplica de terceros): https://huggingface.co/JakTheTrippr/Qwen3-235B-A22B
- Modelo oficial: https://huggingface.co/Qwen/Qwen3-235B-A22B
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3-235B-A22B/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub: https://github.com/QwenLM/Qwen3
- Documentación: https://qwen.readthedocs.io/en/latest/
- Documentación de despliegue con SGLang: https://qwen.readthedocs.io/en/latest/deployment/sglang.html#thinking-non-thinking-modes
- Documentación de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html#thinking-non-thinking-modes
- Demo de chat: https://chat.qwen.ai/
- Referencias arXiv incluidas en los metadatos del repositorio: arxiv:2309.00071 y arxiv:2505.09388

Nota: los resultados de la búsqueda web proporcionados corresponden a páginas de joyerías en Grenoble y no guardan relación con el modelo, por lo que no se han incluido.
