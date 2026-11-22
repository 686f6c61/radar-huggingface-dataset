# juanitos123456/Inkling-2-Mini-Uncensored-GGUF

## Resumen

Inkling-2-Mini-Uncensored-GGUF es una compilación no censurada del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario juanitos123456 en Hugging Face. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 26.070.385.152 parámetros totales, de los cuales aproximadamente 3.400 millones están activos por token, según se describe en la model card. Incorpora una arquitectura de núcleo con bucles (looped core) y acepta tanto texto como imágenes como entrada, con salida de texto. La licencia declarada es Apache-2.0.

La modificación consiste en un adaptador LoRA de rango 1 aplicado sobre 49 puntos que escriben en el flujo residual: la salida de atención y los expertos enrutados de las 24 capas, más el embedding de tokens. El objetivo declarado es eliminar la dirección de rechazo de cada capa, medida como la diferencia entre las activaciones medias ante indicaciones dañinas y benignas en inglés y ruso. El repositorio distribuye tres archivos GGUF con la edición ya integrada (AD-Q4_K, AD-IQ3_S y AD-IQ2_M), el adaptador LoRA en GGUF y el proyector de visión en F16 y BF16.

El interés de esta ficha radica en que documenta una técnica de modificación de comportamiento (ablación de rechazo) sobre un modelo MoE multimodal de tamaño medio, con métricas de divergencia KL y top-1 frente al BF16 original, y con requisitos de despliegue muy específicos vinculados a la implementación de la arquitectura de bucles en llama.cpp. No obstante, el repositorio no incluye datos de benchmarks de capacidad (MMLU, HumanEval, GSM8K) más allá de una evaluación parcial de MMLU mencionada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con núcleo con bucles (looped core); 24 capas, de las cuales 12 son capas con bucles compartidas en tres pasadas |
| Parametros totales | 26.070.385.152 (26,07 mil millones) |
| Parametros activos | ~3.400 millones (3,4B) por token, según la model card |
| Longitud de contexto | 32.768 tokens en los ejemplos de ejecución de la model card (no se especifica el máximo oficial) |
| Tipos de cuantizacion | GGUF: Q4_K, IQ3_S, IQ2_M (archivos preintegrados); el adaptador LoRA en GGUF es compatible con GGUF base desde BF16 hasta 1-bit |
| Idiomas soportados | No disponible de forma oficial; la model card menciona evaluación en inglés y ruso |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); adaptador LoRA en GGUF; proyector de visión en F16/BF16 GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 26,07 mil millones de parámetros totales y aproximadamente 3,4 mil millones activos por token. La arquitectura incluye un núcleo con bucles: 12 de las 24 capas comparten pesos a lo largo de tres pasadas, de modo que la edición LoRA aplicada sobre esas capas cubre los 48 pases efectivos. La entrada es multimodal (texto e imagen) mediante un proyector de visión que en esta compilación se mantiene sin cambios respecto al original (F16 o BF16). Los archivos GGUF actuales requieren la implementación de la arquitectura de bucles de Inkling 2 introducida en llama.cpp PR #32694; la implementación anterior de PR #32695 ya no es necesaria y no deben mezclarse archivos de ambos layouts.

El entrenamiento del modelo base no se detalla en la información proporcionada: no se especifican el número de tokens, la composición del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento. La modificación de esta compilación es un adaptador LoRA de rango 1 sobre los 49 puntos que escriben en el flujo residual (salida de atención y expertos enrutados de las 24 capas, más el embedding de tokens). Para cada capa se calcula la dirección de rechazo como la diferencia entre las activaciones medias en indicaciones dañinas y benignas, en inglés y ruso, proyectando fuera la media de las benignas; la dirección se agrupa sobre indicaciones renderizadas con y sin razonamiento, porque el modelo razona incluso con esfuerzo `none` y decide rechazar dentro de su razonamiento. La model card reporta métricas de fidelidad frente al BF16 original: KLD de 0,0115 y top-1 del 95,6% para AD-Q4_K; KLD de 0,0235 y top-1 del 93,8% para AD-IQ3_S; y KLD de 0,132 y top-1 del 85,7% para AD-IQ2_M, medidas sobre un corpus neutral de 87 fragmentos de 4.096 tokens.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla Jinja (`--jinja`) en llama.cpp.
- Entrada de imagen y texto (pipeline image-text-to-text) mediante el proyector de visión incluido.
- Razonamiento explícito con niveles de esfuerzo configurables (`none`, `low`, `high`) y presupuesto de tokens de razonamiento, según la model card.
- Comportamiento no censurado: la model card reporta 0 rechazos en las pruebas de indicaciones dañinas en inglés y ruso, tanto sin razonamiento como con esfuerzo `low` y `high`.
- Capacidad multilingüe parcial documentada: inglés y ruso en las evaluaciones; no se detalla la cobertura del resto de idiomas.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp.
- No se documenta soporte explícito de tool calling, function calling ni uso como agente multi-paso en la información disponible.

## Casos de uso

- Investigación sobre alineamiento y rechazo: el adaptador LoRA y las métricas de KLD/top-1 permiten estudiar cómo la ablación de la dirección de rechazo afecta a la fidelidad del modelo frente al BF16 original, con puntos de comparación cuantitativos por cuantización.
- Evaluación de robustez de salvaguardas: el repositorio documenta pruebas con mlabonne/harmful_behaviors y su traducción al ruso, útil para medir la eficacia de clasificadores o filtros externos sobre modelos sin rechazo integrado.
- Despliegue local en estaciones de trabajo: los archivos AD-IQ3_S (13,34 GB) y AD-IQ2_M (8,67 GB) permiten ejecutar un MoE de 26B en hardware de consumo mediante llama.cpp, con `-ngl 99` para descargar todas las capas a GPU.
- Procesamiento de documentos con imagen y texto: el pipeline image-text-to-text con proyector F16 permite tareas de descripción, extracción o respuesta sobre capturas y figuras en un contexto de hasta 32.768 tokens.
- Generación de texto creativo sin restricciones temáticas: el modelo está orientado a conversación sin censura, adecuado para entornos controlados de escritura y exploración creativa donde el operador asume la responsabilidad del contenido.
- Experimentación con arquitecturas MoE con bucles: sirve como banco de pruebas para validar la implementación de llama.cpp PR #32694 y comparar el rendimiento de las distintas cuantizaciones (Q4_K, IQ3_S, IQ2_M) en términos de KLD y top-1.
- Fine-tuning posterior sobre el adaptador: al distribuirse la edición como LoRA GGUF de 0,04 GB, es posible combinarla con otros adaptadores o estudiar su composición sobre cualquier GGUF base del repositorio AtomicChat/Inkling-2-Mini-GGUF.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks de capacidad estándar (MMLU, HumanEval, GSM8K) más allá de mencionar una evaluación de MMLU con 2.000 preguntas sin publicar los valores. Los datos disponibles son métricas de fidelidad de la cuantización y de comportamiento ante rechazo:

| Metrica | Original | Con adaptador | Umbral declarado |
|---|---:|---:|---|
| KLD a BF16, AD-Q4_K | 0,0080 | 0,0115 | no disponible |
| Top-1, AD-Q4_K | 96,3% | 95,6% | no disponible |
| KLD a BF16, AD-IQ3_S | 0,0205 | 0,0235 | no disponible |
| Top-1, AD-IQ3_S | 94,2% | 93,8% | no disponible |
| KLD a BF16, AD-IQ2_M | 0,130 | 0,132 | no disponible |
| Top-1, AD-IQ2_M | 85,7% | 85,7% | no disponible |
| Rechazos en test dañino inglés (81), sin razonamiento | 81 (100%) | 0 | ≤3% |
| Rechazos en test dañino ruso (100), sin razonamiento | 91 (91%) | 0 | ≤3% |
| Rechazos en validación dañina inglés (104) / ruso (100) | 100% / 89% | 0 / 0 | ≤3% |
| Rechazos con razonamiento, esfuerzo `low`, presupuesto 3.072 (30) | 28 | 0 | ≤1 |
| Rechazos con razonamiento, esfuerzo `high` (30) | 26 | 0 | ≤1 |
| Rechazos en 8 indicaciones dañinas de chat, esfuerzo `none` / `low` | 8 / 8 | 0 / 0 | no disponible |
| Rechazos en indicaciones seguras XSTest (250) | 10 (4,0%) | 0 | ≤ original + 1 punto |
| Respuestas vacías | 0 | 0 | ≤1% |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) con valores numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,5 GB para AD-Q4_K, 13,3 GB para AD-IQ3_S y 8,7 GB para AD-IQ2_M, a los que se suma el proyector de visión (0,64 GB en F16 o BF16) y la caché KV para el contexto configurado.
- GPU recomendadas: no especificadas en la model card. Por tamaño de pesos, una RTX 4090 (24 GB) puede alojar AD-Q4_K con margen limitado para caché KV; AD-IQ3_S y AD-IQ2_M caben con más holgura en GPUs de 16 GB o 12 GB respectivamente. Para A100 o H100 no hay datos de rendimiento publicados.
- Cabe en GPU de consumo: sí, en el caso de AD-IQ3_S y AD-IQ2_M en GPUs de 16 GB o 12 GB; AD-Q4_K requiere alrededor de 16,5 GB solo para pesos.
- Opciones de despliegue: llama.cpp (llama-server) con versión b12600 o superior y soporte de la arquitectura de bucles de Inkling 2 (PR #32694). No se documentan opciones para vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponibles. El modelo activa aproximadamente 3,4B parámetros por token, lo que reduce el coste de cómputo frente a un denso de 26B, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored (esta ficha) | 26,07B / ~3,4B | 32.768 en ejemplos | Apache-2.0 | GGUF + LoRA GGUF | Modificación no censurada de Inkling-2-Mini; multimodal |
| thinkingmachines/Inkling-2-Mini (base) | 26,07B / ~3,4B | no disponible | Apache-2.0 | safetensors (base) | Modelo original con rechazo intacto; misma arquitectura MoE con bucles |
| AtomicChat/Inkling-2-Mini-GGUF | 26,07B / ~3,4B | no disponible | Apache-2.0 | GGUF | Cuantizaciones del base sin la edición; referencia para KLD y top-1 |

No se dispone de datos de benchmarks de capacidad que permitan comparar el rendimiento de este modelo con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- El modelo ha sido modificado para eliminar el rechazo ante indicaciones dañinas: la model card reporta 0 rechazos en las pruebas realizadas. No incorpora salvaguardas internas, por lo que el operador debe implementar filtrado externo si lo necesita.
- Riesgo elevado de uso indebido: la ausencia de rechazo hace que el modelo pueda generar contenido dañino, ilegal o inseguro. La licencia Apache-2.0 no exime de las obligaciones legales aplicables en la jurisdicción de despliegue.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de benchmarks de razonamiento con valores numéricos; no hay datos para cuantificarlo.
- Idiomas: solo se documentan evaluaciones en inglés y ruso; la cobertura del resto de idiomas es no disponible, lo que limita su uso en producción multilingüe sin validación previa.
- Dependencia estricta de la versión de llama.cpp: los GGUF requieren b12600 o superior con soporte de PR #32694. Mezclar archivos del layout antiguo (PR #32695) con la implementación nueva provoca fallos.
- Fidelidad degradada en cuantizaciones bajas: AD-IQ2_M presenta un KLD de 0,132 y un top-1 del 85,7%, lo que implica una divergencia notable respecto al BF16; no es recomendable para tareas sensibles a la precisión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- La model card incluye enlaces promocionales a Atomic Chat y a su guía de despliegue; deben tratarse como material del autor y no como aval técnico independiente.
- No se documenta soporte de tool calling ni de agentes multi-paso, lo que limita su integración en pipelines automatizados que dependan de function calling.

## Enlaces

- Hugging Face: https://huggingface.co/juanitos123456/Inkling-2-Mini-Uncensored-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF del base: https://huggingface.co/AtomicChat/Inkling-2-Mini-GGUF
- PR de llama.cpp con la arquitectura de bucles de Inkling 2: https://github.com/ggml-org/llama.cpp/pull/32694
- PR anterior (obsoleto para estos archivos): https://github.com/ggml-org/llama.cpp/pull/32695
- Guía de despliegue local de Atomic Chat: https://atomic.chat/blog/guides/how-to-run-inkling-2-mini-uncensored-locally
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- Perfil de X de Atomic Chat: https://x.com/atomic_chat_hq
- Dataset de indicaciones dañinas: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset XSTest: https://huggingface.co/datasets/walledai/XSTest
