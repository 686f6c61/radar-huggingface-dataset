# rmonsurate/Maple

## Resumen

Maple es un modelo de asistente conversacional orientado al contexto canadiense, desarrollado por Farpoint Technologies (Canadá) y publicado en Hugging Face por el usuario rmonsurate. Se trata de un fine-tune de Victoria, un modelo comprimido a 4 bits de código y agentes, que a su vez deriva de un modelo abierto de Qwen (Qwen3.8-Flash-Next). Su propuesta diferencial es responder por defecto en términos canadienses (fiscalidad, empleo, prestaciones, inmigración, sanidad o vivienda) cuando la consulta no especifica jurisdicción, y citar fuentes oficiales canadienses cuando dispone de una herramienta de búsqueda web.

Arquitectura Mixture of Experts (MoE) con aproximadamente 130.270 millones de parámetros totales y 5.900 millones de parámetros activos por token. Se distribuye en formato NVFP4 de 8 bits para inferencia en vLLM sobre GPUs NVIDIA Blackwell (B200 o B300), con decodificación especulativa mediante una cabeza MTP. El repositorio ocupa 154 GB y la licencia es la Qwen Community License 1.0.

El modelo es relevante para equipos que necesiten un asistente con sesgo jurisdiccional explícito y verificable, con soporte de tool calling y agentes, y que puedan asumir el coste de hardware Blackwell. No obstante, sus resultados publicados son moderados en términos absolutos y están evaluados únicamente por jueces automáticos, sin validación humana.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; fine-tune de Victoria sobre Qwen3.8-Flash-Next |
| Parámetros totales | 130.269.421.971 (~130,3 B) |
| Parámetros activos | 5,9 B por token |
| Longitud de contexto | 20.480 tokens (configuración de servicio recomendada con `--max-model-len 20480`) |
| Tipos de cuantización | NVFP4 (8 bits, formato `modelopt`); no hay build GGUF |
| Idiomas soportados | Inglés (en) y francés (fr) |
| Licencia | Qwen Community License 1.0 (identificador `qwen-community-1.0`, campo `license: other`) |
| Formato de pesos | safetensors (NVFP4), compatible con transformers y vLLM |
| Pipeline | text-generation |
| Tamaño del repositorio | 154,0 GB |
| Descargas / likes | 115 / 2 |

## Arquitectura y entrenamiento

Maple es un transformer con arquitectura Mixture of Experts: 130,3 B de parámetros totales con 5,9 B activos por token, lo que reduce el coste computacional por paso de decodificación frente a un modelo denso del mismo tamaño. Los pesos se han cuantizado en NVFP4 (formato de 4 bits empaquetado de NVIDIA, referenciado en los tags como 8-bit y `modelopt`), optimizado para kernels de vLLM en GPUs Blackwell. Incorpora decodificación especulativa mediante una cabeza MTP (multi-token prediction) con 3 tokens especulativos, configurable en vLLM con `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`.

El entrenamiento parte de Victoria, un modelo comprimido a 4 bits de código y agentes, que fue recortado y reentrenado a partir de Qwen3.8-Flash-Next. Maple añade un fine-tune específico para el sesgo canadiense y el uso de herramientas de búsqueda web. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible. El entrenamiento se realizó sobre un sistema de 8 GPUs NVIDIA B300 proporcionado por Dell.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y francés.
- Respuesta por defecto en términos canadienses ante preguntas sobre fiscalidad, empleo, prestaciones, inmigración, sanidad y vivienda, respetando otra jurisdicción si el usuario la nombra explícitamente.
- Uso de herramientas de búsqueda web con citación de fuentes oficiales canadienses; su comportamiento canadiense es más fuerte cuando dispone de búsqueda.
- Tool calling y function calling, con parser `qwen3_coder` en vLLM y soporte de `--enable-auto-tool-choice`.
- Razonamiento multi-paso y flujos de agente, con modo de pensamiento (thinking) activado por defecto y parser de razonamiento `qwen3`.
- Conocimiento de cultura canadiense (evaluado con preguntas de opción múltiple).
- Tono cortés de estilo canadiense.
- Decodificación especulativa integrada para reducir latencia.
- No se documentan capacidades de visión, audio ni otras modalidades, pese a que el tag `image-text-to-text` aparece en la ficha de Hugging Face; la model card solo describe generación de texto.

## Casos de uso

- Asistencia ciudadana sobre trámites canadienses: un portal público o una asesoría puede desplegar Maple para responder preguntas sobre prestaciones, inmigración o fiscalidad sin que el usuario especifique país, con búsqueda web conectada a fuentes oficiales para citar normativa vigente.
- Atención al cliente en empresas canadienses: conversaciones multi-turno con hasta 20.480 tokens de contexto, útiles para conservar el historial de un caso y el resultado de búsquedas previas en la misma sesión.
- Asistente interno para equipos de operaciones: integración mediante tool calling en vLLM para consultar sistemas internos (CRM, ERP) y combinar los resultados con conocimiento del marco regulatorio canadiense.
- Soporte bilingüe inglés-francés: atención a clientes de Quebec y del resto de Canadá con un único modelo, sin pipelines separados por idioma.
- Agentes de investigación documental: flujos multi-paso que buscan en la web, contrastan con fuentes oficiales y generan respuestas con citas, aprovechando el modo thinking y el parser de razonamiento.
- Generación asistida en entornos de código y agentes: al heredar de Victoria, un modelo de código y agentes, puede emplearse en tareas de automatización con herramientas, aunque la model card no publica evaluaciones específicas de código para Maple.
- Prototipado de asistentes con sesgo jurisdiccional explícito: equipos que necesiten comparar el comportamiento de un modelo "country-first" frente a modelos genéricos, usando el conjunto de evaluación descrito en la model card como referencia metodológica.

## Benchmarks y rendimiento

Resultados publicados en la model card. La métrica principal exige que la respuesta esté formulada en términos canadienses, responda directamente, sea correcta contra una fuente oficial y cubra las advertencias clave; una pregunta sin respuesta cuenta como fallo. Las puntuaciones son la media de dos jueces de IA.

Conjunto de test reservado (600 preguntas no vistas en entrenamiento):

| Condición | Victoria | Maple | Diferencia |
|---|---|---|---|
| Con búsqueda web | 6,6 % | 21,8 % | +15,2 puntos (IC 95 %: +12,8 a +17,6) |
| Sin búsqueda web | 1,3 % | 7,5 % | +6,2 puntos (IC 95 %: +4,8 a +7,8) |

Conjunto de desarrollo (solo dev, sin búsqueda):

| Métrica | Victoria | Maple | Modelo original de tamaño completo |
|---|---|---|---|
| Preguntas cotidianas (200): respondidas y superadas | 1,7 % | 10,8 % | 8,6 % |
| Preguntas cotidianas: sin respuesta | 19,0 % | 17,5 % | 1,0 % |
| Cultura canadiense (100, opción múltiple): correctas | 59 % | 77 % | 98 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 154 GB en NVFP4; se recomienda reservar al menos una GPU con 180-192 GB de memoria para servir con `--gpu-memory-utilization 0.80` y 20.480 tokens de contexto.
- GPUs recomendadas: NVIDIA B300 o B200 (Blackwell), una sola unidad con `--tensor-parallel-size 1`. El entrenamiento se realizó en 8× B300.
- No cabe en GPUs de consumo (RTX 4090, 5090): el tamaño de pesos y el formato NVFP4 requieren hardware Blackwell de centro de datos.
- Despliegue: vLLM es la vía soportada (imagen upstream con dos parches backportados para un fallo de prefix caching: vllm#53798 y vllm#54076). No hay build GGUF, por lo que llama.cpp y Ollama no son opciones viables.
- Configuración de servicio: `--max-num-seqs 16`, `--max-num-batched-tokens 16384`, `--enable-prefix-caching` (solo con los parches), `--compilation-config` con autotuning Triton desactivado en tiempo de compilación y `--kernel-config` con `enable_flashinfer_autotune: false`.
- Muestreo recomendado: thinking activado, temperature 0,6, top_p 0,95, top_k 20.
- Latencia y throughput: no se han publicado cifras en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|---|
| Maple | 130,3 B | 5,9 B | 20.480 | Qwen Community 1.0 | NVFP4, vLLM en Blackwell | Asistente canadiense, tool use, MTP |
| Victoria (base de Maple) | no disponible | no disponible | no disponible | Qwen Community 1.0 | 4-bit comprimido | Modelo de código y agentes del que deriva Maple |
| Qwen3.8-Flash-Next (modelo original) | no disponible | no disponible | no disponible | Qwen Community 1.0 | pesos abiertos | Mayor cultura canadiense (98 % frente a 77 %) y casi siempre responde (1,0 % sin respuesta) |

No se dispone de datos de benchmarks estándar ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a lo publicado en la model card.

## Limitaciones y advertencias

- Todos los resultados están evaluados por jueces de IA; no se ha realizado evaluación humana.
- La comparación con el modelo original de tamaño completo se hizo solo sobre el conjunto de desarrollo y no es comparable con la tabla del test reservado.
- El modelo original supera a Maple en cultura canadiense (98 % frente a 77 %) y casi siempre responde (1,0 % de preguntas sin respuesta frente a 17,5 % de Maple).
- Riesgo de alucinación en respuestas sin búsqueda web: la tasa de acierto sin herramienta es del 7,5 % en el test reservado, muy baja en términos absolutos.
- El sesgo canadiense por defecto puede producir respuestas inadecuadas si el usuario no especifica jurisdicción y espera otra; el modelo solo cambia de marco cuando se le indica explícitamente.
- Idiomas limitados a inglés y francés; no se documenta soporte de español ni de otras lenguas.
- Contexto máximo de 20.480 tokens, inferior al de muchos modelos actuales de su categoría.
- Licencia Qwen Community 1.0 con dos condiciones relevantes: quien opere el modelo como servicio o como asistente de trabajo con IA debe obtener una licencia adicional de Qwen antes de cualquier uso comercial, y los productos con más de 100 millones de usuarios activos mensuales o 20 millones de dólares de ingresos mensuales deben mostrar el nombre del modelo de forma destacada en la interfaz.
- Obligación de conservar el archivo `LICENSE` con el aviso de copyright de Qwen en cada copia distribuida.
- Sin build GGUF: el despliegue queda atado a vLLM y a GPUs Blackwell, lo que limita portabilidad y opciones de inferencia en CPU o GPUs de consumo.
- La configuración de vLLM requiere desactivar el autotuning Triton en compilación y, sin los parches de prefix caching, prescindir de `--enable-prefix-caching`.
- El repositorio incluye `SHA256SUMS` para verificar la integridad de los archivos; conviene comprobarlo antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rmonsurate/Maple
- Modelo base Victoria: https://huggingface.co/rmonsurate/Victoria
- Modelo original Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Pull request vLLM #53798: https://github.com/vllm-project/vllm/pull/53798
- Pull request vLLM #54076: https://github.com/vllm-project/vllm/pull/54076
